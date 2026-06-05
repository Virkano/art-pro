import { AppRouteRecord } from '@/types/router'

export const examplesRoutes: AppRouteRecord = {
  path: '/examples',
  name: 'Examples',
  component: '/index/index',
  meta: {
    title: 'menus.examples.title',
    icon: 'ri:sparkling-line'
  },
  children: [
    {
      path: 'tabs',
      name: 'Tabs',
      component: '/examples/tabs',
      meta: {
        title: 'menus.examples.tabs',
        icon: 'ri:price-tag-line'
      }
    },
    {
      path: 'tables/basic',
      name: 'TablesBasic',
      component: '/examples/tables/basic',
      meta: {
        title: 'menus.examples.tablesBasic',
        icon: 'ri:layout-grid-line',
        keepAlive: true
      }
    },
    {
      path: 'tables',
      name: 'Tables',
      component: '/examples/tables',
      meta: {
        title: 'menus.examples.tables',
        icon: 'ri:table-3',
        keepAlive: true
      }
    },
    {
      path: 'forms',
      name: 'Forms',
      component: '/examples/forms',
      meta: {
        title: 'menus.examples.forms',
        icon: 'ri:table-view',
        keepAlive: true
      }
    },
    {
      path: 'form/search-bar',
      name: 'SearchBar',
      component: '/examples/forms/search-bar',
      meta: {
        title: 'menus.examples.searchBar',
        icon: 'ri:table-line',
        keepAlive: true
      }
    },
    {
      path: 'tables/tree',
      name: 'TablesTree',
      component: '/examples/tables/tree',
      meta: {
        title: 'menus.examples.tablesTree',
        icon: 'ri:layout-2-line',
        keepAlive: true
      }
    },
    {
      path: 'socket-chat',
      name: 'SocketChat',
      component: '/examples/socket-chat',
      meta: {
        title: 'menus.examples.socketChat',
        icon: 'ri:shake-hands-line',
        keepAlive: true
      }
    }
  ]
}
