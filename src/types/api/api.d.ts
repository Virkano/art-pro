/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Pro Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      userName: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken?: string
    }

    /** RuoYi getInfo 响应 */
    interface RuoYiUserInfoResponse {
      user?: {
        userId?: number | string
        userName?: string
        nickName?: string
        email?: string
        avatar?: string
      }
      roles?: string[]
      permissions?: string[]
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      permissions: string[]
      userId: number
      userName: string
      email: string
      avatar?: string
      nickName?: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 若依通用状态：0 正常，1 停用 */
    type RuoYiStatus = '0' | '1'

    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      userId: number
      deptId?: number | null
      deptName?: string | null
      avatar?: string
      status: RuoYiStatus
      userName: string
      nickName: string
      email?: string
      phonenumber?: string
      sex?: string
      remark?: string | null
      roleIds?: number[]
      postIds?: number[]
      roles?: RoleListItem[]
      posts?: PostListItem[]
      admin?: boolean
      createBy: string
      createTime: string
      updateBy?: string
      updateTime?: string
    }

    /** RuoYi 原始用户列表响应格式 */
    interface RuoYiUserListResponse {
      code: number
      msg: string
      data: null
      rows: UserListItem[]
      total: number
    }

    /** 用户搜索参数 */
    interface UserSearchParams {
      pageNum?: number
      pageSize?: number
      userName?: string
      phonenumber?: string
      status?: RuoYiStatus
      deptId?: number
    }

    /** 用户表单数据 */
    interface UserForm {
      userId?: number
      deptId?: number | null
      userName: string
      nickName: string
      password?: string
      phonenumber?: string
      email?: string
      sex?: string
      status: RuoYiStatus
      postIds?: number[]
      roleIds?: number[]
      remark?: string
    }

    /** RuoYi 用户详情/新增初始化响应 */
    interface RuoYiUserDetailResponse {
      code: number
      msg: string
      data?: UserListItem
      user?: UserListItem
      roles?: RoleListItem[]
      posts?: PostListItem[]
      roleIds?: number[]
      postIds?: number[]
    }

    /** 用户详情/新增初始化数据 */
    interface UserDetailResponse {
      user?: UserListItem
      roles: RoleListItem[]
      posts: PostListItem[]
      roleIds: number[]
      postIds: number[]
    }

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleKey: string
      roleSort: number
      status: RuoYiStatus
      dataScope?: string
      menuCheckStrictly?: boolean
      deptCheckStrictly?: boolean
      menuIds?: number[]
      deptIds?: number[]
      permissions?: string[] | null
      remark?: string | null
      admin?: boolean
      createTime: string
    }

    /** RuoYi 原始角色列表响应格式 */
    interface RuoYiRoleListResponse {
      code: number
      msg: string
      data: null
      rows: RoleListItem[]
      total: number
    }

    /** 角色搜索参数 */
    interface RoleSearchParams {
      pageNum?: number
      pageSize?: number
      roleName?: string
      roleKey?: string
      status?: RuoYiStatus
      startTime?: string | null
      endTime?: string | null
    }

    /** 角色表单数据 */
    interface RoleForm {
      roleId?: number
      roleName: string
      roleKey: string
      roleSort: number
      status: RuoYiStatus
      menuIds?: number[]
      deptIds?: number[]
      menuCheckStrictly?: boolean
      deptCheckStrictly?: boolean
      remark?: string
    }

    /** RuoYi 角色菜单授权原始响应 */
    interface RuoYiRoleMenuTreeselectResponse {
      code: number
      msg: string
      menus?: MenuTreeNode[]
      checkedKeys?: number[]
    }

    /** 角色菜单授权数据 */
    interface RoleMenuTreeselectResponse {
      menus: MenuTreeNode[]
      checkedKeys: number[]
    }

    /** RuoYi 后端动态路由菜单 */
    interface RuoYiMenuItem {
      name?: string
      path?: string
      hidden?: boolean
      redirect?: string
      component?: string
      query?: string
      alwaysShow?: boolean
      meta?: {
        title?: string
        icon?: string
        noCache?: boolean
        link?: string
      }
      children?: RuoYiMenuItem[]
      menuId?: number | string
      id?: number | string
      parentId?: number | string
      menuName?: string
      title?: string
      icon?: string
      perms?: string
      permission?: string
      menuType?: 'M' | 'C' | 'F' | string
      orderNum?: number
      visible?: string | number | boolean
      status?: string | number | boolean
      isFrame?: string | number | boolean
    }

    // ========== 岗位管理类型 (RuoYi) ==========
    /** 岗位状态枚举 */
    type PostStatus = '0' | '1'

    /** 岗位列表项 */
    interface PostListItem {
      postId: number
      postCode: string
      postName: string
      postSort: number
      status: PostStatus
      remark: string
      createBy: string
      createTime: string
      updateBy?: string
      updateTime?: string
    }

    /** RuoYi 原始列表响应格式 (top-level rows/total) */
    interface RuoYiPostListResponse {
      code: number
      msg: string
      data: null
      rows: PostListItem[]
      total: number
    }

    /** 岗位搜索参数 */
    interface PostSearchParams {
      pageNum?: number
      pageSize?: number
      postCode?: string
      postName?: string
      status?: PostStatus
    }

    /** 岗位表单数据 */
    interface PostForm {
      postId?: number
      postCode: string
      postName: string
      postSort: number
      status: PostStatus
      remark?: string
    }

    /** 岗位下拉选项 */
    interface PostOption {
      postId: number
      postName: string
      postCode: string
    }

    // ========== 通知公告类型 (RuoYi) ==========
    /** 公告类型：1 通知，2 公告 */
    type NoticeType = '1' | '2'

    /** 公告状态：0 正常，1 关闭 */
    type NoticeStatus = '0' | '1'

    /** 通知公告列表项 */
    interface NoticeListItem {
      noticeId: number
      noticeTitle: string
      noticeType: NoticeType
      noticeContent?: string
      status: NoticeStatus
      createBy?: string
      createTime?: string
      updateBy?: string
      updateTime?: string
      remark?: string
    }

    /** RuoYi 原始通知公告列表响应格式 */
    interface RuoYiNoticeListResponse {
      code: number
      msg: string
      data: null
      rows: NoticeListItem[]
      total: number
    }

    /** 通知公告搜索参数 */
    interface NoticeSearchParams {
      pageNum?: number
      pageSize?: number
      noticeTitle?: string
      noticeType?: NoticeType
      status?: NoticeStatus
      createBy?: string
    }

    /** 通知公告表单数据 */
    interface NoticeForm {
      noticeId?: number
      noticeTitle: string
      noticeType: NoticeType
      noticeContent?: string
      status: NoticeStatus
      remark?: string
    }

    // ========== 日志管理类型 (RuoYi) ==========
    /** 日志状态：0 正常，1 异常 */
    type LogStatus = '0' | '1'

    /** 操作日志列表项 */
    interface OperLogListItem {
      operId: number
      title?: string
      businessType?: number
      businessTypes?: number[]
      method?: string
      requestMethod?: string
      operatorType?: number
      operName?: string
      deptName?: string
      operUrl?: string
      operIp?: string
      operLocation?: string
      operParam?: string
      jsonResult?: string
      status: LogStatus
      errorMsg?: string
      operTime?: string
      costTime?: number
    }

    /** RuoYi 原始操作日志列表响应格式 */
    interface RuoYiOperLogListResponse {
      code: number
      msg: string
      data: null
      rows: OperLogListItem[]
      total: number
    }

    /** 操作日志搜索参数 */
    interface OperLogSearchParams {
      pageNum?: number
      pageSize?: number
      title?: string
      operName?: string
      operIp?: string
      businessType?: number
      status?: LogStatus
      orderByColumn?: string
      isAsc?: string
    }

    /** 登录日志列表项 */
    interface LoginInfoListItem {
      infoId: number
      userName?: string
      status: LogStatus
      ipaddr?: string
      loginLocation?: string
      browser?: string
      os?: string
      msg?: string
      loginTime?: string
    }

    /** RuoYi 原始登录日志列表响应格式 */
    interface RuoYiLoginInfoListResponse {
      code: number
      msg: string
      data: null
      rows: LoginInfoListItem[]
      total: number
    }

    /** 登录日志搜索参数 */
    interface LoginInfoSearchParams {
      pageNum?: number
      pageSize?: number
      ipaddr?: string
      userName?: string
      status?: LogStatus
      orderByColumn?: string
      isAsc?: string
    }

    // ========== 系统监控类型 (RuoYi) ==========
    /** 在线用户列表项 */
    interface OnlineUserListItem {
      tokenId: string
      userName?: string
      deptName?: string
      ipaddr?: string
      loginLocation?: string
      browser?: string
      os?: string
      loginTime?: string | number
    }

    interface RuoYiOnlineUserListResponse {
      code: number
      msg: string
      data: null
      rows: OnlineUserListItem[]
      total: number
    }

    interface OnlineUserSearchParams {
      pageNum?: number
      pageSize?: number
      ipaddr?: string
      userName?: string
    }

    /** 定时任务状态：0 正常，1 暂停 */
    type JobStatus = '0' | '1'

    /** 定时任务列表项 */
    interface JobListItem {
      jobId: number
      jobName: string
      jobGroup: string
      invokeTarget: string
      cronExpression: string
      misfirePolicy?: string
      concurrent?: string
      status: JobStatus
      createTime?: string
      remark?: string
    }

    interface RuoYiJobListResponse {
      code: number
      msg: string
      data: null
      rows: JobListItem[]
      total: number
    }

    interface JobSearchParams {
      pageNum?: number
      pageSize?: number
      jobName?: string
      jobGroup?: string
      status?: JobStatus
      orderByColumn?: string
      isAsc?: string
    }

    interface JobForm {
      jobId?: number
      jobName: string
      jobGroup: string
      invokeTarget: string
      cronExpression: string
      misfirePolicy: string
      concurrent: string
      status: JobStatus
      remark?: string
    }

    interface ServerInfo {
      cpu?: Record<string, number | string>
      mem?: Record<string, number | string>
      sys?: Record<string, number | string>
      jvm?: Record<string, number | string>
      sysFiles?: Array<Record<string, number | string>>
    }

    interface CacheInfo {
      info?: Record<string, string>
      dbSize?: number
      commandStats?: Array<{ name: string; value: number }>
    }

    interface CacheNameItem {
      cacheName: string
      remark?: string
    }

    interface CacheValueItem {
      cacheName?: string
      cacheKey?: string
      cacheValue?: string
      remark?: string
    }

    // ========== 字典管理类型 (RuoYi) ==========
    /** 字典类型状态枚举 */
    type DictTypeStatus = '0' | '1'

    /** 字典数据状态枚举 */
    type DictDataStatus = '0' | '1'

    /** 字典类型列表项 */
    interface DictTypeListItem {
      dictId: number
      dictName: string
      dictType: string
      status: DictTypeStatus
      remark: string
      createBy: string
      createTime: string
      updateBy?: string
      updateTime?: string
    }

    /** RuoYi 原始字典类型列表响应格式 */
    interface RuoYiDictTypeListResponse {
      code: number
      msg: string
      data: null
      rows: DictTypeListItem[]
      total: number
    }

    /** 字典类型搜索参数 */
    interface DictTypeSearchParams {
      pageNum?: number
      pageSize?: number
      dictName?: string
      dictType?: string
      status?: DictTypeStatus
    }

    /** 字典类型表单数据 */
    interface DictTypeForm {
      dictId?: number
      dictName: string
      dictType: string
      status: DictTypeStatus
      remark?: string
    }

    /** 字典类型下拉选项 */
    interface DictTypeOption {
      dictId: number
      dictName: string
      dictType: string
    }

    /** 字典数据列表项 */
    interface DictDataListItem {
      dictCode: number
      dictType: string
      dictLabel: string
      dictValue: string
      cssClass?: string
      listClass?: string
      dictSort: number
      status: DictDataStatus
      remark: string
      createBy: string
      createTime: string
      updateBy?: string
      updateTime?: string
    }

    /** RuoYi 原始字典数据列表响应格式 */
    interface RuoYiDictDataListResponse {
      code: number
      msg: string
      data: null
      rows: DictDataListItem[]
      total: number
    }

    /** 字典数据搜索参数 */
    interface DictDataSearchParams {
      pageNum?: number
      pageSize?: number
      dictType: string
      dictLabel?: string
      status?: DictDataStatus
    }

    /** 字典数据表单数据 */
    interface DictDataForm {
      dictCode?: number
      dictType: string
      dictLabel: string
      dictValue: string
      cssClass?: string
      listClass?: string
      dictSort: number
      status: DictDataStatus
      remark?: string
    }

    // ========== 菜单管理类型 (RuoYi) ==========
    /** 菜单类型枚举 */
    type MenuType = 'M' | 'C' | 'F'

    /** 菜单可见状态 */
    type MenuVisible = '0' | '1'

    /** 菜单列表项 */
    interface MenuListItem {
      menuId: number
      menuName: string
      parentId: number
      orderNum: number
      path: string
      component?: string
      query?: string
      isFrame: string
      isCache: string
      menuType: MenuType
      visible: MenuVisible
      status: string
      perms?: string
      icon?: string
      createBy: string
      createTime: string
      updateBy?: string
      updateTime?: string
      hasChildren?: boolean
      children?: MenuListItem[]
    }

    /** RuoYi 原始菜单列表响应格式 */
    interface RuoYiMenuListResponse {
      code: number
      msg: string
      data?: MenuListItem[] | null
      rows?: MenuListItem[]
      total?: number
    }

    /** 菜单搜索参数 */
    interface MenuSearchParams {
      menuName?: string
      status?: string
    }

    /** 菜单表单数据 */
    interface MenuForm {
      menuId?: number
      menuName: string
      parentId: number
      orderNum: number
      path: string
      component?: string
      query?: string
      isFrame?: string
      isCache?: string
      menuType: MenuType
      visible: MenuVisible
      status: string
      perms?: string
      icon?: string
    }

    /** 菜单树节点（用于下拉选择） */
    interface MenuTreeNode {
      id: number
      label: string
      children?: MenuTreeNode[]
    }

    /** 菜单排序更新参数 */
    interface MenuSortParams {
      menuId: number
      orderNum: number
    }

    // ========== 部门管理类型 (RuoYi) ==========
    /** 部门状态枚举 */
    type DeptStatus = '0' | '1'

    /** 部门列表项 */
    interface DeptListItem {
      deptId: number
      parentId: number
      ancestors?: string
      deptName: string
      orderNum: number
      leader?: string
      phone?: string
      email?: string
      status: DeptStatus
      createBy: string
      createTime: string
      updateBy?: string
      updateTime?: string
      hasChildren?: boolean
      children?: DeptListItem[]
    }

    /** RuoYi 原始部门列表响应格式 */
    interface RuoYiDeptListResponse {
      code: number
      msg: string
      data?: DeptListItem[] | null
      rows?: DeptListItem[]
      total?: number
    }

    /** 部门搜索参数 */
    interface DeptSearchParams {
      deptName?: string
      status?: DeptStatus
    }

    /** 部门表单数据 */
    interface DeptForm {
      deptId?: number
      parentId: number
      deptName: string
      orderNum: number
      leader?: string
      phone?: string
      email?: string
      status: DeptStatus
    }

    /** 部门排序更新参数 */
    interface DeptSortParams {
      deptId: number
      orderNum: number
    }

    // ========== 参数配置类型 (RuoYi) ==========
    /** 参数配置状态枚举 */
    type ConfigStatus = '0' | '1'

    /** 参数配置列表项 */
    interface ConfigListItem {
      configId: number
      configName: string
      configKey: string
      configValue: string
      configType: string
      createBy: string
      createTime: string
      updateBy?: string
      updateTime?: string
      remark?: string
    }

    /** RuoYi 原始参数配置列表响应格式 */
    interface RuoYiConfigListResponse {
      code: number
      msg: string
      data: null
      rows: ConfigListItem[]
      total: number
    }

    /** 参数配置搜索参数 */
    interface ConfigSearchParams {
      pageNum?: number
      pageSize?: number
      configName?: string
      configKey?: string
      configType?: string
    }

    /** 参数配置表单数据 */
    interface ConfigForm {
      configId?: number
      configName: string
      configKey: string
      configValue: string
      configType: string
      remark?: string
    }
  }
}
