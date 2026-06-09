/**
 * 组件加载器
 *
 * 负责动态加载 Vue 组件
 *
 * @module router/core/ComponentLoader
 * @author Art Pro Team
 */

import { h } from 'vue'

export class ComponentLoader {
  private modules: Record<string, () => Promise<any>>

  constructor() {
    // 动态导入 views 目录下所有 .vue 组件
    this.modules = import.meta.glob('../../views/**/*.vue')
  }

  /**
   * 加载组件
   */
  load(componentPath: string): () => Promise<any> {
    if (!componentPath) {
      return this.createEmptyComponent()
    }

    const normalizedPath = this.normalizeComponentPath(componentPath)
    const candidates = this.buildCandidatePaths(normalizedPath)

    const module = candidates.map((path) => this.modules[path]).find(Boolean)

    if (!module) {
      console.warn(
        `[ComponentLoader] 未找到组件: ${componentPath}，尝试过的路径: ${candidates.join('、')}`
      )
      return this.createNotFoundComponent()
    }

    return module
  }

  /**
   * 加载布局组件
   */
  loadLayout(): () => Promise<any> {
    return () => import('@/views/index/index.vue')
  }

  /**
   * 加载 iframe 组件
   */
  loadIframe(): () => Promise<any> {
    return () => import('@/views/outside/Iframe.vue')
  }

  /**
   * 创建空组件
   */
  private createEmptyComponent(): () => Promise<any> {
    return () =>
      Promise.resolve({
        render() {
          return h('div', {})
        }
      })
  }

  /**
   * 创建 404 组件
   */
  private createNotFoundComponent(): () => Promise<any> {
    return () => import('@views/exception/404/index.vue')
  }

  private normalizeComponentPath(componentPath: string): string {
    return (
      componentPath
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .trim()
        .replace(/^\/+/, '')
    )
  }

  private buildCandidatePaths(componentPath: string): string[] {
    const withoutIndex = componentPath.replace(/\/index$/, '')
    const candidates = [
      `../../views/${componentPath}.vue`,
      `../../views/${componentPath}/index.vue`,
      `../../views/${withoutIndex}.vue`,
      `../../views/${withoutIndex}/index.vue`
    ]

    return Array.from(new Set(candidates))
  }
}
