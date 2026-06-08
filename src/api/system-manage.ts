import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'
import { normalizeMenuIcon } from '@/utils/ui'

// 获取旧 mock 菜单列表
export function fetchGetMockMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/v3/system/menus'
  })
}

// 获取 RuoYi 风格动态路由
export function fetchGetRouters() {
  return request.get<Api.SystemManage.RuoYiMenuItem[]>({
    url: '/getRouters'
  })
}

// ========== 岗位管理 API (RuoYi) ==========
/**
 * 标准化岗位列表响应 (适配 useTable)
 * 将 RuoYi { rows, total } 格式转换为 useTable 兼容的 { records, total } 格式
 */
function normalizePostStatus(status: string): Api.SystemManage.PostStatus {
  return status.trim() === '0' ? '0' : '1'
}

function adaptPostListResponse(
  response: Api.SystemManage.RuoYiPostListResponse,
  params: Api.SystemManage.PostSearchParams
): Api.Common.PaginatedResponse<Api.SystemManage.PostListItem> {
  const normalizedRows = response.rows.map((item) => ({
    ...item,
    // 规范化状态字段：去除前后空白
    status: normalizePostStatus(item.status)
  }))

  return {
    records: normalizedRows,
    current: params.pageNum ?? 1,
    size: params.pageSize ?? normalizedRows.length,
    total: response.total
  }
}

function parseJsonResponse(data: unknown) {
  if (typeof data !== 'string') return data

  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

function normalizeRuoYiStatus(status?: string | null) {
  return String(status ?? '0').trim() === '0' ? '0' : '1'
}

function sortByOrderNum<T extends { orderNum?: number; children?: T[] }>(items: T[]) {
  return items.sort((prev, next) => Number(prev.orderNum ?? 0) - Number(next.orderNum ?? 0))
}

// ========== 用户管理 API (RuoYi) ==========
function normalizeUser(row: Api.SystemManage.UserListItem): Api.SystemManage.UserListItem {
  return {
    ...row,
    sex: String(row.sex ?? '').trim(),
    status: normalizeRuoYiStatus(row.status),
    roleIds: row.roleIds ?? [],
    postIds: row.postIds ?? []
  }
}

function adaptUserListResponse(
  response: Api.SystemManage.RuoYiUserListResponse,
  params: Api.SystemManage.UserSearchParams
): Api.Common.PaginatedResponse<Api.SystemManage.UserListItem> {
  const rows = response.rows.map(normalizeUser)
  return {
    records: rows,
    current: params.pageNum ?? 1,
    size: params.pageSize ?? rows.length,
    total: response.total
  }
}

export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.SystemManage.UserListItem>>({
    url: '/system/user/list',
    params,
    transformResponse: (data: unknown) => {
      const parsed = parseJsonResponse(data)
      if (parsed && typeof parsed === 'object' && 'rows' in parsed && 'total' in parsed) {
        const response = parsed as Api.SystemManage.RuoYiUserListResponse
        return {
          ...response,
          data: adaptUserListResponse(response, params)
        }
      }
      return parsed
    }
  })
}

export function fetchGetUserDetail(userId?: number) {
  return request.get<Api.SystemManage.UserDetailResponse>({
    url: `/system/user/${userId ?? ''}`,
    transformResponse: (data: unknown) => {
      const parsed = parseJsonResponse(data)
      if (parsed && typeof parsed === 'object' && 'code' in parsed) {
        const response = parsed as Api.SystemManage.RuoYiUserDetailResponse
        const user = response.data ?? response.user
        return {
          ...response,
          data: {
            user: user ? normalizeUser(user) : undefined,
            roles: response.roles ?? [],
            posts: response.posts ?? [],
            roleIds: response.roleIds ?? user?.roleIds ?? [],
            postIds: response.postIds ?? user?.postIds ?? []
          }
        }
      }
      return parsed
    }
  })
}

export function fetchAddUser(data: Api.SystemManage.UserForm) {
  return request.post({
    url: '/system/user',
    data
  })
}

export function fetchUpdateUser(data: Api.SystemManage.UserForm) {
  return request.put({
    url: '/system/user',
    data
  })
}

export function fetchDeleteUser(userId: number) {
  return request.del({
    url: `/system/user/${userId}`
  })
}

export function fetchResetUserPassword(userId: number, password: string) {
  return request.put({
    url: '/system/user/resetPwd',
    data: { userId, password }
  })
}

export function fetchChangeUserStatus(userId: number, status: Api.SystemManage.RuoYiStatus) {
  return request.put({
    url: '/system/user/changeStatus',
    data: { userId, status }
  })
}

export function fetchGetUserDeptTree() {
  return request.get<Api.SystemManage.MenuTreeNode[]>({
    url: '/system/user/deptTree'
  })
}

// ========== 个人中心 API (RuoYi) ==========
function normalizeUserProfile(
  response: Api.SystemManage.RuoYiUserProfileResponse | Api.SystemManage.UserProfile
) {
  const user = (
    'user' in response && response.user ? response.user : response
  ) as Api.SystemManage.UserProfile

  return {
    ...user,
    roleGroup: ('roleGroup' in response && response.roleGroup) || user.roleGroup || '',
    postGroup: ('postGroup' in response && response.postGroup) || user.postGroup || '',
    dept: user.dept || {}
  } as Api.SystemManage.UserProfile
}

export function fetchGetUserProfile() {
  return request
    .get<Api.SystemManage.RuoYiUserProfileResponse | Api.SystemManage.UserProfile>({
      url: '/system/user/profile'
    })
    .then(normalizeUserProfile)
}

export function fetchUpdateUserProfile(data: Api.SystemManage.UserProfileForm) {
  return request.put({
    url: '/system/user/profile',
    data
  })
}

export function fetchUpdateUserPassword(params: Api.SystemManage.UpdateUserPasswordParams) {
  const searchParams = new URLSearchParams({
    oldPassword: params.oldPassword,
    newPassword: params.newPassword
  })

  return request.put({
    url: `/system/user/profile/updatePwd?${searchParams.toString()}`
  })
}

export function fetchUploadUserAvatar(file: File) {
  const data = new FormData()
  data.append('avatarfile', file)

  return request.post<Api.SystemManage.UploadAvatarResponse>({
    url: '/system/user/profile/avatar',
    data,
    transformResponse: (responseData: unknown) => {
      const parsed = parseJsonResponse(responseData)
      if (parsed && typeof parsed === 'object' && 'imgUrl' in parsed) {
        return {
          ...parsed,
          data: { imgUrl: String(parsed.imgUrl || '') }
        }
      }
      return parsed
    }
  })
}

// ========== 角色管理 API (RuoYi) ==========
function normalizeRole(row: Api.SystemManage.RoleListItem): Api.SystemManage.RoleListItem {
  return {
    ...row,
    status: normalizeRuoYiStatus(row.status),
    menuIds: row.menuIds ?? [],
    deptIds: row.deptIds ?? [],
    menuCheckStrictly: row.menuCheckStrictly ?? true,
    deptCheckStrictly: row.deptCheckStrictly ?? true
  }
}

function adaptRoleListResponse(
  response: Api.SystemManage.RuoYiRoleListResponse,
  params: Api.SystemManage.RoleSearchParams
): Api.Common.PaginatedResponse<Api.SystemManage.RoleListItem> {
  const rows = response.rows.map(normalizeRole)
  return {
    records: rows,
    current: params.pageNum ?? 1,
    size: params.pageSize ?? rows.length,
    total: response.total
  }
}

export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.SystemManage.RoleListItem>>({
    url: '/system/role/list',
    params,
    transformResponse: (data: unknown) => {
      const parsed = parseJsonResponse(data)
      if (parsed && typeof parsed === 'object' && 'rows' in parsed && 'total' in parsed) {
        const response = parsed as Api.SystemManage.RuoYiRoleListResponse
        return {
          ...response,
          data: adaptRoleListResponse(response, params)
        }
      }
      return parsed
    }
  })
}

export function fetchGetRoleDetail(roleId: number) {
  return request
    .get<Api.SystemManage.RoleListItem>({
      url: `/system/role/${roleId}`
    })
    .then(normalizeRole)
}

export function fetchAddRole(data: Api.SystemManage.RoleForm) {
  return request.post({
    url: '/system/role',
    data
  })
}

export function fetchUpdateRole(data: Api.SystemManage.RoleForm) {
  return request.put({
    url: '/system/role',
    data
  })
}

export function fetchDeleteRole(roleId: number) {
  return request.del({
    url: `/system/role/${roleId}`
  })
}

export function fetchChangeRoleStatus(roleId: number, status: Api.SystemManage.RuoYiStatus) {
  return request.put({
    url: '/system/role/changeStatus',
    data: { roleId, status }
  })
}

export function fetchGetRoleMenuTreeselect(roleId: number) {
  return request.get<Api.SystemManage.RoleMenuTreeselectResponse>({
    url: `/system/menu/roleMenuTreeselect/${roleId}`,
    transformResponse: (data: unknown) => {
      const parsed = parseJsonResponse(data)
      if (parsed && typeof parsed === 'object' && 'code' in parsed) {
        const response = parsed as Api.SystemManage.RuoYiRoleMenuTreeselectResponse
        return {
          ...response,
          data: {
            menus: response.menus ?? [],
            checkedKeys: response.checkedKeys ?? []
          }
        }
      }
      return parsed
    }
  })
}

// 获取岗位列表
export function fetchGetPostList(params: Api.SystemManage.PostSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.SystemManage.PostListItem>>({
    url: '/system/post/list',
    params,
    // RuoYi 列表响应的 rows/total 在顶层且 data 为 null。保持 code/msg 给响应拦截器检查，
    // 再把 table 数据放进 data，让 request() 返回 useTable 需要的分页结构。
    transformResponse: (data: unknown) => {
      const parsed = parseJsonResponse(data)
      if (parsed && typeof parsed === 'object' && 'rows' in parsed && 'total' in parsed) {
        const response = parsed as Api.SystemManage.RuoYiPostListResponse
        return {
          ...response,
          data: adaptPostListResponse(response, params)
        }
      }
      return parsed
    }
  })
}

// 获取岗位下拉选项
export function fetchGetPostOptions() {
  return request.get<Api.SystemManage.PostOption[]>({
    url: '/system/post/optionselect'
  })
}

// 获取岗位详情
export function fetchGetPostDetail(postId: number) {
  return request
    .get<Api.SystemManage.PostListItem>({
      url: `/system/post/${postId}`
    })
    .then((detail) => ({
      // 规范化状态字段：去除前后空白
      ...detail,
      status: normalizePostStatus(detail.status)
    }))
}

// 新增岗位
export function fetchAddPost(data: Api.SystemManage.PostForm) {
  return request.post({
    url: '/system/post',
    data
  })
}

// 修改岗位
export function fetchUpdatePost(data: Api.SystemManage.PostForm) {
  return request.put({
    url: '/system/post',
    data
  })
}

// 删除岗位
export function fetchDeletePost(postId: number) {
  return request.del({
    url: `/system/post/${postId}`
  })
}

// ========== 通知公告 API (RuoYi) ==========
function normalizeNoticeStatus(status?: string | null): Api.SystemManage.NoticeStatus {
  return String(status ?? '0').trim() === '0' ? '0' : '1'
}

function normalizeNoticeType(type?: string | null): Api.SystemManage.NoticeType {
  return String(type ?? '1').trim() === '2' ? '2' : '1'
}

function normalizeNotice(row: Api.SystemManage.NoticeListItem): Api.SystemManage.NoticeListItem {
  return {
    ...row,
    noticeType: normalizeNoticeType(row.noticeType),
    status: normalizeNoticeStatus(row.status)
  }
}

function adaptNoticeListResponse(
  response: Api.SystemManage.RuoYiNoticeListResponse,
  params: Api.SystemManage.NoticeSearchParams
): Api.Common.PaginatedResponse<Api.SystemManage.NoticeListItem> {
  const rows = response.rows.map(normalizeNotice)
  return {
    records: rows,
    current: params.pageNum ?? 1,
    size: params.pageSize ?? rows.length,
    total: response.total
  }
}

/** 查询公告列表 */
export function fetchGetNoticeList(params: Api.SystemManage.NoticeSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.SystemManage.NoticeListItem>>({
    url: '/system/notice/list',
    params,
    transformResponse: (data: unknown) => {
      const parsed = parseJsonResponse(data)
      if (parsed && typeof parsed === 'object' && 'rows' in parsed && 'total' in parsed) {
        const response = parsed as Api.SystemManage.RuoYiNoticeListResponse
        return {
          ...response,
          data: adaptNoticeListResponse(response, params)
        }
      }
      return parsed
    }
  })
}

/** 查询公告详细 */
export function fetchGetNoticeDetail(noticeId: number) {
  return request
    .get<Api.SystemManage.NoticeListItem>({
      url: `/system/notice/${noticeId}`
    })
    .then(normalizeNotice)
}

/** 新增公告 */
export function fetchAddNotice(data: Api.SystemManage.NoticeForm) {
  return request.post({
    url: '/system/notice',
    data
  })
}

/** 修改公告 */
export function fetchUpdateNotice(data: Api.SystemManage.NoticeForm) {
  return request.put({
    url: '/system/notice',
    data
  })
}

/** 删除公告 */
export function fetchDeleteNotice(noticeId: number) {
  return request.del({
    url: `/system/notice/${noticeId}`
  })
}

// ========== 日志管理 API (RuoYi) ==========
function normalizeLogStatus(status?: string | null): Api.SystemManage.LogStatus {
  return String(status ?? '0').trim() === '0' ? '0' : '1'
}

function normalizeOperLog(row: Api.SystemManage.OperLogListItem) {
  return {
    ...row,
    status: normalizeLogStatus(row.status)
  }
}

function normalizeLoginInfo(row: Api.SystemManage.LoginInfoListItem) {
  return {
    ...row,
    status: normalizeLogStatus(row.status)
  }
}

function adaptOperLogListResponse(
  response: Api.SystemManage.RuoYiOperLogListResponse,
  params: Api.SystemManage.OperLogSearchParams
): Api.Common.PaginatedResponse<Api.SystemManage.OperLogListItem> {
  const rows = response.rows.map(normalizeOperLog)
  return {
    records: rows,
    current: params.pageNum ?? 1,
    size: params.pageSize ?? rows.length,
    total: response.total
  }
}

function adaptLoginInfoListResponse(
  response: Api.SystemManage.RuoYiLoginInfoListResponse,
  params: Api.SystemManage.LoginInfoSearchParams
): Api.Common.PaginatedResponse<Api.SystemManage.LoginInfoListItem> {
  const rows = response.rows.map(normalizeLoginInfo)
  return {
    records: rows,
    current: params.pageNum ?? 1,
    size: params.pageSize ?? rows.length,
    total: response.total
  }
}

/** 查询操作日志列表 */
export function fetchGetOperLogList(params: Api.SystemManage.OperLogSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.SystemManage.OperLogListItem>>({
    url: '/monitor/operlog/list',
    params,
    transformResponse: (data: unknown) => {
      const parsed = parseJsonResponse(data)
      if (parsed && typeof parsed === 'object' && 'rows' in parsed && 'total' in parsed) {
        const response = parsed as Api.SystemManage.RuoYiOperLogListResponse
        return {
          ...response,
          data: adaptOperLogListResponse(response, params)
        }
      }
      return parsed
    }
  })
}

/** 删除操作日志 */
export function fetchDeleteOperLog(operId: number | string) {
  return request.del({
    url: `/monitor/operlog/${operId}`
  })
}

/** 清空操作日志 */
export function fetchCleanOperLog() {
  return request.del({
    url: '/monitor/operlog/clean'
  })
}

/** 查询登录日志列表 */
export function fetchGetLoginInfoList(params: Api.SystemManage.LoginInfoSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.SystemManage.LoginInfoListItem>>({
    url: '/monitor/logininfor/list',
    params,
    transformResponse: (data: unknown) => {
      const parsed = parseJsonResponse(data)
      if (parsed && typeof parsed === 'object' && 'rows' in parsed && 'total' in parsed) {
        const response = parsed as Api.SystemManage.RuoYiLoginInfoListResponse
        return {
          ...response,
          data: adaptLoginInfoListResponse(response, params)
        }
      }
      return parsed
    }
  })
}

/** 删除登录日志 */
export function fetchDeleteLoginInfo(infoId: number | string) {
  return request.del({
    url: `/monitor/logininfor/${infoId}`
  })
}

/** 清空登录日志 */
export function fetchCleanLoginInfo() {
  return request.del({
    url: '/monitor/logininfor/clean'
  })
}

/** 解锁用户登录状态 */
export function fetchUnlockLoginInfo(userName: string) {
  return request.get({
    url: `/monitor/logininfor/unlock/${encodeURIComponent(userName)}`
  })
}

// ========== 系统监控 API (RuoYi) ==========
function normalizeJobStatus(status?: string | null): Api.SystemManage.JobStatus {
  return String(status ?? '0').trim() === '0' ? '0' : '1'
}

function normalizeJob(row: Api.SystemManage.JobListItem): Api.SystemManage.JobListItem {
  return {
    ...row,
    status: normalizeJobStatus(row.status)
  }
}

function adaptOnlineUserListResponse(
  response: Api.SystemManage.RuoYiOnlineUserListResponse,
  params: Api.SystemManage.OnlineUserSearchParams
): Api.Common.PaginatedResponse<Api.SystemManage.OnlineUserListItem> {
  return {
    records: response.rows,
    current: params.pageNum ?? 1,
    size: params.pageSize ?? response.rows.length,
    total: response.total
  }
}

function adaptJobListResponse(
  response: Api.SystemManage.RuoYiJobListResponse,
  params: Api.SystemManage.JobSearchParams
): Api.Common.PaginatedResponse<Api.SystemManage.JobListItem> {
  const rows = response.rows.map(normalizeJob)
  return {
    records: rows,
    current: params.pageNum ?? 1,
    size: params.pageSize ?? rows.length,
    total: response.total
  }
}

/** 查询在线用户列表 */
export function fetchGetOnlineUserList(params: Api.SystemManage.OnlineUserSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.SystemManage.OnlineUserListItem>>({
    url: '/monitor/online/list',
    params,
    transformResponse: (data: unknown) => {
      const parsed = parseJsonResponse(data)
      if (parsed && typeof parsed === 'object' && 'rows' in parsed && 'total' in parsed) {
        const response = parsed as Api.SystemManage.RuoYiOnlineUserListResponse
        return {
          ...response,
          data: adaptOnlineUserListResponse(response, params)
        }
      }
      return parsed
    }
  })
}

/** 强退在线用户 */
export function fetchForceLogoutOnlineUser(tokenId: string) {
  return request.del({
    url: `/monitor/online/${encodeURIComponent(tokenId)}`
  })
}

/** 查询定时任务列表 */
export function fetchGetJobList(params: Api.SystemManage.JobSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.SystemManage.JobListItem>>({
    url: '/monitor/job/list',
    params,
    transformResponse: (data: unknown) => {
      const parsed = parseJsonResponse(data)
      if (parsed && typeof parsed === 'object' && 'rows' in parsed && 'total' in parsed) {
        const response = parsed as Api.SystemManage.RuoYiJobListResponse
        return {
          ...response,
          data: adaptJobListResponse(response, params)
        }
      }
      return parsed
    }
  })
}

/** 查询定时任务详情 */
export function fetchGetJobDetail(jobId: number) {
  return request.get<Api.SystemManage.JobListItem>({
    url: `/monitor/job/${jobId}`
  })
}

/** 新增定时任务 */
export function fetchAddJob(data: Api.SystemManage.JobForm) {
  return request.post({
    url: '/monitor/job',
    data
  })
}

/** 修改定时任务 */
export function fetchUpdateJob(data: Api.SystemManage.JobForm) {
  return request.put({
    url: '/monitor/job',
    data
  })
}

/** 删除定时任务 */
export function fetchDeleteJob(jobId: number | string) {
  return request.del({
    url: `/monitor/job/${jobId}`
  })
}

/** 修改任务状态 */
export function fetchChangeJobStatus(jobId: number, status: Api.SystemManage.JobStatus) {
  return request.put({
    url: '/monitor/job/changeStatus',
    data: { jobId, status }
  })
}

/** 立即执行一次定时任务 */
export function fetchRunJob(jobId: number, jobGroup: string) {
  return request.put({
    url: '/monitor/job/run',
    data: { jobId, jobGroup }
  })
}

/** 获取服务监控信息 */
export function fetchGetServerInfo() {
  return request.get<Api.SystemManage.ServerInfo>({
    url: '/monitor/server'
  })
}

/** 查询缓存监控信息 */
export function fetchGetCacheInfo() {
  return request.get<Api.SystemManage.CacheInfo>({
    url: '/monitor/cache'
  })
}

/** 查询缓存名称列表 */
export function fetchGetCacheNames() {
  return request.get<Api.SystemManage.CacheNameItem[]>({
    url: '/monitor/cache/getNames'
  })
}

/** 查询缓存键名列表 */
export function fetchGetCacheKeys(cacheName: string) {
  return request.get<string[]>({
    url: `/monitor/cache/getKeys/${encodeURIComponent(cacheName)}`
  })
}

/** 查询缓存内容 */
export function fetchGetCacheValue(cacheName: string, cacheKey: string) {
  return request.get<Api.SystemManage.CacheValueItem>({
    url: `/monitor/cache/getValue/${encodeURIComponent(cacheName)}/${encodeURIComponent(cacheKey)}`
  })
}

/** 清理指定名称缓存 */
export function fetchClearCacheName(cacheName: string) {
  return request.del({
    url: `/monitor/cache/clearCacheName/${encodeURIComponent(cacheName)}`
  })
}

/** 清理指定键名缓存 */
export function fetchClearCacheKey(cacheKey: string) {
  return request.del({
    url: `/monitor/cache/clearCacheKey/${encodeURIComponent(cacheKey)}`
  })
}

/** 清理全部缓存 */
export function fetchClearCacheAll() {
  return request.del({
    url: '/monitor/cache/clearCacheAll'
  })
}

// ========== 字典管理 API (RuoYi) ==========
/** 标准化字典类型状态 */
function normalizeDictTypeStatus(status: string): Api.SystemManage.DictTypeStatus {
  return status.trim() === '0' ? '0' : '1'
}

/** 标准化字典数据状态 */
function normalizeDictDataStatus(status: string): Api.SystemManage.DictDataStatus {
  return status.trim() === '0' ? '0' : '1'
}

/** 适配字典类型列表响应 */
function adaptDictTypeListResponse(
  response: Api.SystemManage.RuoYiDictTypeListResponse,
  params: Api.SystemManage.DictTypeSearchParams
): Api.Common.PaginatedResponse<Api.SystemManage.DictTypeListItem> {
  const normalizedRows = response.rows.map((item) => ({
    ...item,
    status: normalizeDictTypeStatus(item.status)
  }))

  return {
    records: normalizedRows,
    current: params.pageNum ?? 1,
    size: params.pageSize ?? normalizedRows.length,
    total: response.total
  }
}

/** 适配字典数据列表响应 */
function adaptDictDataListResponse(
  response: Api.SystemManage.RuoYiDictDataListResponse,
  params: Api.SystemManage.DictDataSearchParams
): Api.Common.PaginatedResponse<Api.SystemManage.DictDataListItem> {
  const normalizedRows = response.rows.map((item) => ({
    ...item,
    status: normalizeDictDataStatus(item.status)
  }))

  return {
    records: normalizedRows,
    current: params.pageNum ?? 1,
    size: params.pageSize ?? normalizedRows.length,
    total: response.total
  }
}

// --- 字典类型 API ---

/** 获取字典类型列表 */
export function fetchGetDictTypeList(params: Api.SystemManage.DictTypeSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.SystemManage.DictTypeListItem>>({
    url: '/system/dict/type/list',
    params,
    transformResponse: (data: unknown) => {
      const parsed = parseJsonResponse(data)
      if (parsed && typeof parsed === 'object' && 'rows' in parsed && 'total' in parsed) {
        const response = parsed as Api.SystemManage.RuoYiDictTypeListResponse
        return {
          ...response,
          data: adaptDictTypeListResponse(response, params)
        }
      }
      return parsed
    }
  })
}

/** 获取字典类型详情 */
export function fetchGetDictTypeDetail(dictId: number) {
  return request
    .get<Api.SystemManage.DictTypeListItem>({
      url: `/system/dict/type/${dictId}`
    })
    .then((detail) => ({
      ...detail,
      status: normalizeDictTypeStatus(detail.status)
    }))
}

/** 新增字典类型 */
export function fetchAddDictType(data: Api.SystemManage.DictTypeForm) {
  return request.post({
    url: '/system/dict/type',
    data
  })
}

/** 修改字典类型 */
export function fetchUpdateDictType(data: Api.SystemManage.DictTypeForm) {
  return request.put({
    url: '/system/dict/type',
    data
  })
}

/** 删除字典类型 */
export function fetchDeleteDictType(dictId: number) {
  return request.del({
    url: `/system/dict/type/${dictId}`
  })
}

/** 刷新字典缓存 */
export function fetchRefreshDictCache() {
  return request.del({
    url: '/system/dict/type/refreshCache'
  })
}

/** 获取字典类型下拉选项 */
export function fetchGetDictTypeOptions() {
  return request.get<Api.SystemManage.DictTypeOption[]>({
    url: '/system/dict/type/optionselect'
  })
}

// --- 字典数据 API ---

/** 获取字典数据列表 */
export function fetchGetDictDataList(params: Api.SystemManage.DictDataSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.SystemManage.DictDataListItem>>({
    url: '/system/dict/data/list',
    params,
    transformResponse: (data: unknown) => {
      const parsed = parseJsonResponse(data)
      if (parsed && typeof parsed === 'object' && 'rows' in parsed && 'total' in parsed) {
        const response = parsed as Api.SystemManage.RuoYiDictDataListResponse
        return {
          ...response,
          data: adaptDictDataListResponse(response, params)
        }
      }
      return parsed
    }
  })
}

/** 获取字典数据详情 */
export function fetchGetDictDataDetail(dictCode: number) {
  return request
    .get<Api.SystemManage.DictDataListItem>({
      url: `/system/dict/data/${dictCode}`
    })
    .then((detail) => ({
      ...detail,
      status: normalizeDictDataStatus(detail.status)
    }))
}

/** 根据字典类型获取字典数据 */
export function fetchGetDictDataByType(dictType: string) {
  return request.get<Api.SystemManage.DictDataListItem[]>({
    url: `/system/dict/data/type/${dictType}`
  })
}

/** 新增字典数据 */
export function fetchAddDictData(data: Api.SystemManage.DictDataForm) {
  return request.post({
    url: '/system/dict/data',
    data
  })
}

/** 修改字典数据 */
export function fetchUpdateDictData(data: Api.SystemManage.DictDataForm) {
  return request.put({
    url: '/system/dict/data',
    data
  })
}

/** 删除字典数据 */
export function fetchDeleteDictData(dictCode: number) {
  return request.del({
    url: `/system/dict/data/${dictCode}`
  })
}

// ========== 菜单管理 API (RuoYi) ==========
function normalizeMenu(row: Api.SystemManage.MenuListItem): Api.SystemManage.MenuListItem {
  const children = row.children?.map(normalizeMenu)

  return {
    ...row,
    status: normalizeRuoYiStatus(row.status),
    isFrame: String(row.isFrame ?? '1'),
    isCache: String(row.isCache ?? '0'),
    visible: String(row.visible ?? '0') as Api.SystemManage.MenuVisible,
    icon: normalizeMenuIcon(row.icon),
    children: children?.length ? sortByOrderNum(children) : undefined
  }
}

function buildMenuTree(rows: Api.SystemManage.MenuListItem[]) {
  const flattenedRows = flattenMenuRows(rows)
  const nodeMap = new Map<number, Api.SystemManage.MenuListItem>()
  const tree: Api.SystemManage.MenuListItem[] = []

  flattenedRows.forEach((row) => {
    nodeMap.set(row.menuId, {
      ...normalizeMenu(row),
      children: []
    })
  })

  nodeMap.forEach((node) => {
    const parent = nodeMap.get(node.parentId)
    if (parent && parent.menuId !== node.menuId) {
      parent.children?.push(node)
      return
    }
    tree.push(node)
  })

  nodeMap.forEach((node) => {
    if (!node.children?.length) {
      delete node.children
      return
    }
    sortByOrderNum(node.children)
  })

  return sortByOrderNum(tree)
}

function flattenMenuRows(rows: Api.SystemManage.MenuListItem[]) {
  const flattenedRows: Api.SystemManage.MenuListItem[] = []

  const appendRows = (items: Api.SystemManage.MenuListItem[]) => {
    items.forEach((item) => {
      const { children, ...row } = item
      flattenedRows.push(row)
      if (children?.length) appendRows(children)
    })
  }

  appendRows(rows)
  return flattenedRows
}

function extractMenuRows(data: unknown) {
  if (Array.isArray(data)) return data as Api.SystemManage.MenuListItem[]

  if (data && typeof data === 'object') {
    const response = data as Api.SystemManage.RuoYiMenuListResponse
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response.rows)) return response.rows
  }

  return []
}

/** 获取菜单列表（树形） */
export function fetchGetMenuList(params: Api.SystemManage.MenuSearchParams) {
  return request.get<Api.SystemManage.MenuListItem[]>({
    url: '/system/menu/list',
    params,
    transformResponse: (data: unknown) => {
      const parsed = parseJsonResponse(data)
      const rows = extractMenuRows(parsed)
      const tree = buildMenuTree(rows)

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return {
          ...parsed,
          data: tree
        }
      }

      return {
        code: 200,
        msg: 'success',
        data: tree
      }
    }
  })
}

/** 获取菜单详情 */
export function fetchGetMenuDetail(menuId: number) {
  return request.get<Api.SystemManage.MenuListItem>({
    url: `/system/menu/${menuId}`
  })
}

/** 获取菜单下拉树 */
export function fetchGetMenuTreeselect() {
  return request.get<Api.SystemManage.MenuTreeNode[]>({
    url: '/system/menu/treeselect'
  })
}

/** 新增菜单 */
export function fetchAddMenu(data: Api.SystemManage.MenuForm) {
  return request.post({
    url: '/system/menu',
    data
  })
}

/** 修改菜单 */
export function fetchUpdateMenu(data: Api.SystemManage.MenuForm) {
  return request.put({
    url: '/system/menu',
    data
  })
}

/** 更新菜单排序 */
export function fetchUpdateMenuSort(data: Api.SystemManage.MenuSortParams) {
  return request.put({
    url: '/system/menu/updateSort',
    data
  })
}

/** 删除菜单 */
export function fetchDeleteMenu(menuId: number) {
  return request.del({
    url: `/system/menu/${menuId}`
  })
}

// ========== 部门管理 API (RuoYi) ==========

function normalizeDept(row: Api.SystemManage.DeptListItem): Api.SystemManage.DeptListItem {
  const children = row.children?.map(normalizeDept)

  return {
    ...row,
    status: normalizeRuoYiStatus(row.status),
    children: children?.length ? sortByOrderNum(children) : undefined
  }
}

function flattenDeptRows(rows: Api.SystemManage.DeptListItem[]) {
  const flattenedRows: Api.SystemManage.DeptListItem[] = []

  const appendRows = (items: Api.SystemManage.DeptListItem[]) => {
    items.forEach((item) => {
      const { children, ...row } = item
      flattenedRows.push(row)
      if (children?.length) appendRows(children)
    })
  }

  appendRows(rows)
  return flattenedRows
}

function buildDeptTree(rows: Api.SystemManage.DeptListItem[]) {
  const nodeMap = new Map<number, Api.SystemManage.DeptListItem>()
  const tree: Api.SystemManage.DeptListItem[] = []

  flattenDeptRows(rows).forEach((row) => {
    nodeMap.set(row.deptId, {
      ...normalizeDept(row),
      children: []
    })
  })

  nodeMap.forEach((node) => {
    const parent = nodeMap.get(node.parentId)
    if (parent && parent.deptId !== node.deptId) {
      parent.children?.push(node)
      return
    }
    tree.push(node)
  })

  nodeMap.forEach((node) => {
    if (!node.children?.length) {
      delete node.children
      return
    }
    sortByOrderNum(node.children)
  })

  return sortByOrderNum(tree)
}

function extractDeptRows(data: unknown) {
  if (Array.isArray(data)) return data as Api.SystemManage.DeptListItem[]

  if (data && typeof data === 'object') {
    const response = data as Api.SystemManage.RuoYiDeptListResponse
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response.rows)) return response.rows
  }

  return []
}

function transformDeptTreeResponse(data: unknown) {
  const parsed = parseJsonResponse(data)
  const tree = buildDeptTree(extractDeptRows(parsed))

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return {
      ...parsed,
      data: tree
    }
  }

  return {
    code: 200,
    msg: 'success',
    data: tree
  }
}

/** 获取部门列表（树形） */
export function fetchGetDeptList(params: Api.SystemManage.DeptSearchParams) {
  return request.get<Api.SystemManage.DeptListItem[]>({
    url: '/system/dept/list',
    params,
    transformResponse: transformDeptTreeResponse
  })
}

/** 获取部门列表（排除子节点） */
export function fetchGetDeptExcludeList(deptId: number) {
  return request.get<Api.SystemManage.DeptListItem[]>({
    url: `/system/dept/list/exclude/${deptId}`,
    transformResponse: transformDeptTreeResponse
  })
}

/** 获取部门详情 */
export function fetchGetDeptDetail(deptId: number) {
  return request
    .get<Api.SystemManage.DeptListItem>({
      url: `/system/dept/${deptId}`
    })
    .then(normalizeDept)
}

/** 新增部门 */
export function fetchAddDept(data: Api.SystemManage.DeptForm) {
  return request.post({
    url: '/system/dept',
    data
  })
}

/** 修改部门 */
export function fetchUpdateDept(data: Api.SystemManage.DeptForm) {
  return request.put({
    url: '/system/dept',
    data
  })
}

/** 更新部门排序 */
export function fetchUpdateDeptSort(data: Api.SystemManage.DeptSortParams) {
  return request.put({
    url: '/system/dept/updateSort',
    data
  })
}

/** 删除部门 */
export function fetchDeleteDept(deptId: number) {
  return request.del({
    url: `/system/dept/${deptId}`
  })
}

// ========== 参数配置 API (RuoYi) ==========
/** 适配参数配置列表响应 */
function adaptConfigListResponse(
  response: Api.SystemManage.RuoYiConfigListResponse,
  params: Api.SystemManage.ConfigSearchParams
): Api.Common.PaginatedResponse<Api.SystemManage.ConfigListItem> {
  return {
    records: response.rows,
    current: params.pageNum ?? 1,
    size: params.pageSize ?? response.rows.length,
    total: response.total
  }
}

/** 获取参数配置列表 */
export function fetchGetConfigList(params: Api.SystemManage.ConfigSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.SystemManage.ConfigListItem>>({
    url: '/system/config/list',
    params,
    transformResponse: (data: unknown) => {
      const parsed = parseJsonResponse(data)
      if (parsed && typeof parsed === 'object' && 'rows' in parsed && 'total' in parsed) {
        const response = parsed as Api.SystemManage.RuoYiConfigListResponse
        return {
          ...response,
          data: adaptConfigListResponse(response, params)
        }
      }
      return parsed
    }
  })
}

/** 获取参数配置详情 */
export function fetchGetConfigDetail(configId: number) {
  return request.get<Api.SystemManage.ConfigListItem>({
    url: `/system/config/${configId}`
  })
}

/** 根据参数键名获取参数值 */
export function fetchGetConfigByKey(configKey: string) {
  return request.get<Api.SystemManage.ConfigListItem>({
    url: `/system/config/configKey/${configKey}`
  })
}

/** 新增参数配置 */
export function fetchAddConfig(data: Api.SystemManage.ConfigForm) {
  return request.post({
    url: '/system/config',
    data
  })
}

/** 修改参数配置 */
export function fetchUpdateConfig(data: Api.SystemManage.ConfigForm) {
  return request.put({
    url: '/system/config',
    data
  })
}

/** 删除参数配置 */
export function fetchDeleteConfig(configId: number) {
  return request.del({
    url: `/system/config/${configId}`
  })
}

/** 刷新参数缓存 */
export function fetchRefreshConfigCache() {
  return request.del({
    url: '/system/config/refreshCache'
  })
}
