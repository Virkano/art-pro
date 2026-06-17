/**
 * 菜单处理器
 *
 * 负责菜单数据的获取、过滤和处理
 *
 * @module router/core/MenuProcessor
 * @author Art Pro Team
 */

import type { AppRouteRecord } from '@/types/router'
import { useAppMode } from '@/hooks/core/useAppMode'
import { fetchGetRouters } from '@/api/system-manage'
import { staticMenuRoutes } from '../routes/staticRoutes'
import { RoutesAlias } from '../routesAlias'
import { formatMenuTitle, normalizeMenuIcon } from '@/utils'

/**
 * 本地静态菜单不依赖后端菜单权限配置。
 * 是否展示在左侧菜单由路由自身的 meta.isHide 控制。
 */
const LOCAL_STATIC_MENU_ROUTES: AppRouteRecord[] = staticMenuRoutes

const removeControlChars = (value: string) =>
  Array.from(value)
    .filter((char) => {
      const charCode = char.charCodeAt(0)
      return charCode > 31 && charCode !== 127
    })
    .join('')

export class MenuProcessor {
  /**
   * 获取菜单数据
   */
  async getMenuList(): Promise<AppRouteRecord[]> {
    const { isFrontendMode } = useAppMode()

    let menuList: AppRouteRecord[]
    if (isFrontendMode.value) {
      menuList = await this.processFrontendMenu()
    } else {
      menuList = await this.processBackendMenu()
    }

    // 在规范化路径之前，验证原始路径配置
    this.validateMenuPaths(menuList)

    // 规范化路径（将相对路径转换为完整路径）
    return this.normalizeMenuPaths(menuList)
  }

  /**
   * 处理前端控制模式的菜单
   */
  private async processFrontendMenu(): Promise<AppRouteRecord[]> {
    return this.filterEmptyMenus([...LOCAL_STATIC_MENU_ROUTES])
  }

  /**
   * 处理后端控制模式的菜单
   */
  private async processBackendMenu(): Promise<AppRouteRecord[]> {
    const list = await fetchGetRouters()
    const result = this.filterEmptyMenus(this.transformBackendMenus(list))
    return this.mergeStaticMenuRoutes(result)
  }

  /**
   * 合并不依赖后端权限配置的本地静态菜单。
   * 同路径菜单保留后端路由自身配置，只补充本地静态子路由。
   */
  private mergeStaticMenuRoutes(menuList: AppRouteRecord[]): AppRouteRecord[] {
    return LOCAL_STATIC_MENU_ROUTES.reduce(
      (mergedRoutes, staticRoute) => this.mergeRouteByPath(mergedRoutes, staticRoute),
      [...menuList]
    )
  }

  private mergeRouteByPath(
    routes: AppRouteRecord[],
    routeToMerge: AppRouteRecord
  ): AppRouteRecord[] {
    const existingIndex = routes.findIndex((route) => route.path === routeToMerge.path)

    if (existingIndex === -1) {
      return [...routes, routeToMerge]
    }

    return routes.map((route, index) => {
      if (index !== existingIndex) return route

      return {
        ...route,
        children: this.mergeRouteChildren(route.children || [], routeToMerge.children || [])
      }
    })
  }

  private mergeRouteChildren(
    existingChildren: AppRouteRecord[],
    staticChildren: AppRouteRecord[]
  ): AppRouteRecord[] {
    return staticChildren.reduce(
      (children, staticChild) => this.mergeRouteByPath(children, staticChild),
      [...existingChildren]
    )
  }

  /**
   * 将 RuoYi getRouters 菜单转换为当前项目路由结构
   */
  private transformBackendMenus(
    menuList: Array<AppRouteRecord | Api.SystemManage.RuoYiMenuItem>,
    depth = 0,
    usedNames: Set<string> = new Set()
  ): AppRouteRecord[] {
    return menuList
      .filter((item) => !this.isHiddenBackendMenu(item))
      .flatMap((item) => {
        if (this.isTransparentRootMenu(item)) {
          return this.transformBackendMenus(item.children || [], depth, usedNames)
        }
        return [this.transformBackendMenu(item, depth, usedNames)]
      })
  }

  private transformBackendMenu(
    item: AppRouteRecord | Api.SystemManage.RuoYiMenuItem,
    depth: number,
    usedNames: Set<string>
  ): AppRouteRecord {
    if (this.isAppRouteRecord(item)) {
      const rawName = item.name ? String(item.name) : ''
      const path = this.sanitizeRoutePath(item.path || '', depth, rawName)
      const uniqueName = this.ensureUniqueRouteName(rawName, usedNames, path)

      return {
        ...item,
        name: uniqueName,
        path,
        component: this.normalizeBackendComponent(
          item.component as string | undefined,
          item.children,
          depth,
          path
        ),
        children: item.children?.length
          ? this.transformBackendMenus(item.children, depth + 1, usedNames)
          : item.children
      }
    }

    // 后端可能在不同菜单分支复用同一个 name。Vue Router 要求 name 全局唯一，
    // 否则后面的顶级路由会被 RouteRegistry 跳过，导致页面落到 404。
    const rawName =
      item.routeName || item.name || item.menuName || item.path || `Menu${item.menuId || ''}`
    const path = this.sanitizeRoutePath(item.path || '', depth, rawName)
    const uniqueName = this.ensureUniqueRouteName(rawName, usedNames, path)

    const children = item.children?.length
      ? this.transformBackendMenus(item.children, depth + 1, usedNames)
      : undefined

    const meta = item.meta || {}
    const permission = item.perms || item.permission
    const link = meta.link || (this.isExternalPath(item.path || '') ? item.path : undefined)

    return {
      id: Number(item.menuId || item.id || 0) || undefined,
      name: uniqueName,
      path,
      component: this.normalizeBackendComponent(item.component, children, depth, path),
      redirect: item.redirect === 'noRedirect' ? undefined : item.redirect,
      meta: {
        title: meta.title || item.menuName || item.title || item.name || path || '',
        icon: normalizeMenuIcon(meta.icon || item.icon),
        isHide: Boolean(item.hidden) || this.isDisabledBackendMenu(item),
        link,
        keepAlive: meta.noCache === undefined ? undefined : !meta.noCache,
        authList: permission
          ? [
              {
                title: meta.title || item.menuName || item.title || permission,
                authMark: permission
              }
            ]
          : undefined
      },
      children
    }
  }

  /**
   * 当路由 name 重复时追加路径后缀，保证整棵动态路由树内唯一
   */
  private ensureUniqueRouteName(rawName: string, usedNames: Set<string>, path: string): string {
    const baseName = this.sanitizeRouteName(rawName)

    if (!usedNames.has(baseName)) {
      usedNames.add(baseName)
      return baseName
    }

    const pathSegments = path.split('/').filter(Boolean)
    let candidate: string
    if (pathSegments.length > 0) {
      const suffix = pathSegments[pathSegments.length - 1]
        .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')
        .replace(/^(\d)/, '_$1')
      candidate = `${baseName}_${suffix}`
    } else {
      const hashSuffix = path.replace(/[^a-zA-Z0-9]/g, '').slice(-8)
      candidate = `${baseName}_${hashSuffix}`
    }

    let index = 2
    const uniqueBase = candidate
    while (usedNames.has(candidate)) {
      candidate = `${uniqueBase}_${index}`
      index += 1
    }

    usedNames.add(candidate)
    return candidate
  }

  private isAppRouteRecord(
    item: AppRouteRecord | Api.SystemManage.RuoYiMenuItem
  ): item is AppRouteRecord {
    return Boolean(item.meta && 'title' in item.meta && !('hidden' in item))
  }

  private normalizeBackendComponent(
    component?: string,
    children?: AppRouteRecord[],
    depth = 0,
    path = ''
  ): string {
    if (component === 'Layout') {
      return depth === 0 ? RoutesAlias.Layout : ''
    }

    if (component === 'ParentView') {
      // 叶子 ParentView 没有真实页面，用路径占位保证路由可注册
      if (!children?.length) {
        return path.startsWith('/') ? path : `/${path}`
      }
      return ''
    }

    if (component === 'InnerLink') {
      // InnerLink is external link, no component needed for route registration
      return ''
    }

    if (component) {
      return component.startsWith('/') ? component : `/${component}`
    }

    if (children?.length) {
      return depth === 0 ? RoutesAlias.Layout : ''
    }

    return this.isExternalPath(path) ? '' : path.startsWith('/') ? path : `/${path}`
  }

  private sanitizeRoutePath(path: string, depth = 0, fallback = ''): string {
    const cleanPath = removeControlChars(path).trim()
    if (!cleanPath) return fallback || ''
    if (this.isExternalPath(cleanPath)) return cleanPath
    if (depth > 0) return cleanPath.replace(/^\/+/, '')
    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`
  }

  private sanitizeRouteName(name: string): string {
    return removeControlChars(name).trim()
  }

  private isHiddenBackendMenu(item: AppRouteRecord | Api.SystemManage.RuoYiMenuItem): boolean {
    return 'hidden' in item && item.hidden === true
  }

  private isTransparentRootMenu(item: AppRouteRecord | Api.SystemManage.RuoYiMenuItem): boolean {
    const title = item.meta?.title || ('menuName' in item ? item.menuName : undefined) || item.name
    return (
      item.path === '/' &&
      item.component === 'Layout' &&
      !title &&
      Array.isArray(item.children) &&
      item.children.length > 0
    )
  }

  private isDisabledBackendMenu(item: Api.SystemManage.RuoYiMenuItem): boolean {
    return (
      item.status === '1' || item.visible === '1' || item.status === false || item.visible === false
    )
  }

  private isExternalPath(path: string): boolean {
    return path.startsWith('http://') || path.startsWith('https://')
  }

  /**
   * 递归过滤空菜单项
   */
  private filterEmptyMenus(menuList: AppRouteRecord[]): AppRouteRecord[] {
    return menuList
      .map((item) => {
        // 如果有子菜单，先递归过滤子菜单
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterEmptyMenus(item.children)
          return {
            ...item,
            children: filteredChildren
          }
        }
        return item
      })
      .filter((item) => {
        // 如果定义了 children 属性（即使是空数组），说明这是一个目录菜单，应该保留
        if ('children' in item) {
          return true
        }

        // 如果有外链或 iframe，保留
        if (item.meta?.isIframe === true || item.meta?.link) {
          return true
        }

        // 如果有有效的 component，保留
        if (item.component && item.component !== '' && item.component !== RoutesAlias.Layout) {
          return true
        }

        // 其他情况过滤掉
        return false
      })
  }

  /**
   * 验证菜单列表是否有效
   */
  validateMenuList(menuList: AppRouteRecord[]): boolean {
    // 没有业务菜单权限的用户仍可以访问公共工作台
    return Array.isArray(menuList)
  }

  /**
   * 规范化菜单路径
   * 将相对路径转换为完整路径，确保菜单跳转正确
   */
  private normalizeMenuPaths(menuList: AppRouteRecord[], parentPath = ''): AppRouteRecord[] {
    return menuList.map((item) => {
      // 构建完整路径
      const fullPath = this.buildFullPath(item.path || '', parentPath)

      // 递归处理子菜单
      const children = item.children?.length
        ? this.normalizeMenuPaths(item.children, fullPath)
        : item.children

      const redirect = item.redirect || this.resolveDefaultRedirect(children)

      return {
        ...item,
        path: fullPath,
        redirect,
        children
      }
    })
  }

  /**
   * 为目录型菜单推导默认跳转地址
   */
  private resolveDefaultRedirect(children?: AppRouteRecord[]): string | undefined {
    if (!children?.length) {
      return undefined
    }

    for (const child of children) {
      if (this.isNavigableRoute(child)) {
        return child.path
      }

      const nestedRedirect = this.resolveDefaultRedirect(child.children)
      if (nestedRedirect) {
        return nestedRedirect
      }
    }

    return undefined
  }

  /**
   * 判断子路由是否可以作为默认落点
   */
  private isNavigableRoute(route: AppRouteRecord): boolean {
    return Boolean(
      route.path &&
        route.path !== '/' &&
        !route.meta?.link &&
        route.meta?.isIframe !== true &&
        route.component &&
        route.component !== ''
    )
  }

  /**
   * 验证菜单路径配置
   * 检测非一级菜单是否错误使用了 / 开头的路径
   */
  /**
   * 验证菜单路径配置
   * 检测非一级菜单是否错误使用了 / 开头的路径
   */
  private validateMenuPaths(menuList: AppRouteRecord[], level = 1): void {
    menuList.forEach((route) => {
      if (!route.children?.length) return

      const parentName = String(route.name || route.path || '未知路由')

      route.children.forEach((child) => {
        const childPath = child.path || ''

        // 跳过合法的绝对路径：外部链接和 iframe 路由
        if (this.isValidAbsolutePath(childPath)) return

        // 检测非法的绝对路径
        if (childPath.startsWith('/')) {
          this.logPathError(child, childPath, parentName, level)
        }
      })

      // 递归检查更深层级的子路由
      this.validateMenuPaths(route.children, level + 1)
    })
  }

  /**
   * 判断是否为合法的绝对路径
   */
  private isValidAbsolutePath(path: string): boolean {
    return (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('/outside/iframe/')
    )
  }

  /**
   * 输出路径配置错误日志
   */
  private logPathError(
    route: AppRouteRecord,
    path: string,
    parentName: string,
    level: number
  ): void {
    const routeName = String(route.name || path || '未知路由')
    const menuTitle = route.meta?.title || routeName
    const suggestedPath = path.split('/').pop() || path.slice(1)

    console.error(
      `[路由配置错误] 菜单 "${formatMenuTitle(menuTitle)}" (name: ${routeName}, path: ${path}) 配置错误\n` +
        `  位置: ${parentName} > ${routeName}\n` +
        `  问题: ${level + 1}级菜单的 path 不能以 / 开头\n` +
        `  当前配置: path: '${path}'\n` +
        `  应该改为: path: '${suggestedPath}'`
    )
  }

  /**
   * 构建完整路径
   */
  private buildFullPath(path: string, parentPath: string): string {
    if (!path) return ''

    // 外部链接直接返回
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    // 如果已经是绝对路径，直接返回
    if (path.startsWith('/')) {
      return path
    }

    // 拼接父路径和当前路径
    if (parentPath) {
      // 移除父路径末尾的斜杠，移除子路径开头的斜杠，然后拼接
      const cleanParent = parentPath.replace(/\/$/, '')
      const cleanChild = path.replace(/^\//, '')
      return `${cleanParent}/${cleanChild}`
    }

    // 没有父路径，添加前导斜杠
    return `/${path}`
  }
}
