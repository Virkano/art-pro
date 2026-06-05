import { AppRouteRecordRaw } from '@/utils/router'
import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'
import { templateRoutes } from '../modules/template'
import { widgetsRoutes } from '../modules/widgets'
import { examplesRoutes } from '../modules/examples'
import { articleRoutes } from '../modules/article'
import { changeLogRoutes } from '../modules/changeLog'

/**
 * 本地静态菜单路由。
 *
 * 这部分不依赖后端菜单权限，所有登录用户都可以访问；
 * 是否展示在左侧菜单由 meta.isHide 控制。
 */
export const staticMenuRoutes: AppRouteRecord[] = [
  templateRoutes,
  widgetsRoutes,
  examplesRoutes,
  articleRoutes,
  changeLogRoutes,
  {
    path: '/system/dict-data',
    name: 'DictDataWrapper',
    component: '/index/index',
    meta: {
      title: '字典数据',
      isHide: true
    },
    children: [
      {
        path: 'index/:dictId',
        name: 'DictData',
        component: '/system/dict/data',
        meta: {
          title: '字典数据',
          icon: 'ri:book-3-line',
          keepAlive: true,
          isHide: true,
          activePath: '/system/dict'
        }
      }
    ]
  }
]

/**
 * 静态路由配置（不依赖后端菜单权限的路由）
 *
 * 属性说明：
 * isHideTab: true 表示不在标签页中显示
 *
 * 注意事项：
 * 1、path、name 不要和动态路由冲突，否则会导致路由冲突无法访问
 * 2、静态路由默认允许匿名访问，设置 requiresAuth 后仍要求登录
 */
export const staticRoutes: AppRouteRecordRaw[] = [
  {
    path: '/',
    name: 'CommonLayout',
    component: () => import('@views/index/index.vue'),
    redirect: RoutesAlias.Workbench,
    meta: { title: 'menus.dashboard.title', requiresAuth: true },
    children: [
      {
        path: RoutesAlias.Workbench,
        name: 'Workbench',
        component: () => import('@views/dashboard/console/index.vue'),
        meta: {
          title: 'menus.dashboard.console',
          icon: 'ri:home-smile-2-line',
          fixedTab: true,
          requiresAuth: true
        }
      },
      {
        path: '/system/user-center',
        name: 'UserCenter',
        component: () => import('@views/system/user-center/index.vue'),
        meta: {
          title: 'menus.system.userCenter',
          icon: 'ri:user-line',
          isHide: true,
          keepAlive: true,
          isHideTab: true,
          requiresAuth: true
        }
      },
      {
        path: '/article/detail/:id',
        name: 'ArticleDetail',
        component: () => import('@views/article/detail/index.vue'),
        meta: {
          title: 'menus.article.articleDetail',
          isHide: true,
          keepAlive: true,
          activePath: '/article/article-list',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('@views/auth/login/index.vue'),
    meta: { title: 'menus.login.title', isHideTab: true }
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('@views/auth/register/index.vue'),
    meta: { title: 'menus.register.title', isHideTab: true }
  },
  {
    path: '/auth/forget-password',
    name: 'ForgetPassword',
    component: () => import('@views/auth/forget-password/index.vue'),
    meta: { title: 'menus.forgetPassword.title', isHideTab: true }
  },
  {
    path: '/403',
    name: 'Exception403',
    component: () => import('@views/exception/403/index.vue'),
    meta: { title: '403', isHideTab: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'Exception404',
    component: () => import('@views/exception/404/index.vue'),
    meta: { title: '404', isHideTab: true }
  },
  {
    path: '/500',
    name: 'Exception500',
    component: () => import('@views/exception/500/index.vue'),
    meta: { title: '500', isHideTab: true }
  },
  {
    path: '/outside',
    component: () => import('@views/index/index.vue'),
    name: 'Outside',
    meta: { title: 'menus.outside.title' },
    children: [
      // iframe 内嵌页面
      {
        path: '/outside/iframe/:path',
        name: 'Iframe',
        component: () => import('@/views/outside/Iframe.vue'),
        meta: { title: 'iframe' }
      }
    ]
  }
]
