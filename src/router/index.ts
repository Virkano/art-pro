import type { App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { staticRoutes } from './routes/staticRoutes'
import { configureNProgress } from '@/utils/router'
import { setupBeforeEachGuard } from './guards/beforeEach'
import { setupAfterEachGuard } from './guards/afterEach'
import { RoutesAlias } from './routesAlias'

// 创建路由实例
export const router = createRouter({
  history: createWebHashHistory(),
  routes: staticRoutes // 静态路由
})

// 初始化路由
export function initRouter(app: App<Element>): void {
  configureNProgress() // 顶部进度条
  setupBeforeEachGuard(router) // 路由前置守卫
  setupAfterEachGuard(router) // 路由后置守卫
  app.use(router)
}

// 所有登录用户统一使用公共工作台作为首页，不再依赖权限菜单的第一个路由
export const HOME_PAGE_PATH: string = RoutesAlias.Workbench
