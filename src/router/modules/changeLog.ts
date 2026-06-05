import { AppRouteRecord } from '@/types/router'

export const changeLogRoutes: AppRouteRecord = {
  path: '/change',
  name: 'Change',
  component: '/index/index',
  meta: {
    title: 'menus.changeLog.log',
    icon: 'ri:history-line'
  },
  children: [
    {
      path: 'log',
      name: 'ChangeLog',
      component: '/change/log/index',
      meta: {
        title: 'menus.changeLog.log',
        icon: 'ri:file-list-3-line'
      }
    }
  ]
}
