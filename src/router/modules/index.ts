import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { templateRoutes } from './template'
import { widgetsRoutes } from './widgets'
import { examplesRoutes } from './examples'

import { changeLogRoutes } from './changeLog'
import { articleRoutes } from './article'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'
import { helpRoutes } from './help'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  templateRoutes,
  widgetsRoutes,
  examplesRoutes,
  articleRoutes,
  resultRoutes,
  exceptionRoutes,
  changeLogRoutes,
  ...helpRoutes
]
