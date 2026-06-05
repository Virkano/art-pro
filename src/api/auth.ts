import request from '@/utils/http'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/login',
    params: {
      username: params.userName,
      password: params.password
    }
    // showSuccessMessage: true // 显示成功消息
    // showErrorMessage: false // 不显示错误消息
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export async function fetchGetUserInfo() {
  const data = await request.get<Api.Auth.UserInfo | Api.Auth.RuoYiUserInfoResponse>({
    url: '/getInfo'
    // 自定义请求头
    // headers: {
    //   'X-Custom-Header': 'your-custom-value'
    // }
  })

  return normalizeUserInfo(data)
}

/**
 * 退出登录
 */
export function fetchLogout() {
  return request.post<void>({
    url: '/logout',
    showErrorMessage: false
  })
}

function normalizeUserInfo(data: Api.Auth.UserInfo | Api.Auth.RuoYiUserInfoResponse): Api.Auth.UserInfo {
  const ruoyiUser = 'user' in data ? data.user : undefined
  const roles = data.roles || []
  const permissions = 'permissions' in data && data.permissions ? data.permissions : []
  const buttons = 'buttons' in data && data.buttons?.length ? data.buttons : permissions

  return {
    buttons,
    roles,
    permissions,
    userId: Number(('userId' in data && data.userId) || ruoyiUser?.userId || 0),
    userName: ('userName' in data && data.userName) || ruoyiUser?.userName || ruoyiUser?.nickName || '',
    nickName: ('nickName' in data && data.nickName) || ruoyiUser?.nickName,
    email: ('email' in data && data.email) || ruoyiUser?.email || '',
    avatar: ('avatar' in data && data.avatar) || ruoyiUser?.avatar
  }
}
