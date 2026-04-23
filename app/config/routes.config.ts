/**
 * Site Routes Configuration
 * Defines all pages/routes for the delta-changes frontend
 */

export interface RouteConfig {
  path: string
  name: string
  label: string
  icon?: string
  description?: string
  children?: RouteConfig[]
}

/** Main site routes */
export const SITE_ROUTES: RouteConfig[] = [
  {
    path: '/',
    name: 'home',
    label: 'Главная',
    icon: 'i-lucide-home',
    description: 'Главная страница сайта'
  },
  {
    path: '/objects',
    name: 'objects',
    label: 'Объекты',
    icon: 'i-lucide-building-2',
    description: 'Список объектов недвижимости',
    children: [
      {
        path: '/objects/:id',
        name: 'object-detail',
        label: 'Детали объекта',
        description: 'Страница конкретного объекта'
      }
    ]
  },
  {
    path: '/apartments',
    name: 'apartments',
    label: 'Квартиры',
    icon: 'i-lucide-door-open',
    description: 'Список доступных квартир',
    children: [
      {
        path: '/apartments/:id',
        name: 'apartment-detail',
        label: 'Детали квартиры',
        description: 'Страница конкретной квартиры'
      }
    ]
  },
  {
    path: '/projects',
    name: 'projects',
    label: 'Проекты',
    icon: 'i-lucide-hard-hat',
    description: 'Строительные проекты',
    children: [
      {
        path: '/projects/:id',
        name: 'project-detail',
        label: 'Детали проекта',
        description: 'Страница конкретного проекта'
      }
    ]
  },
  {
    path: '/news',
    name: 'news',
    label: 'Новости',
    icon: 'i-lucide-newspaper',
    description: 'Новости и статьи',
    children: [
      {
        path: '/news/:slug',
        name: 'news-detail',
        label: 'Статья',
        description: 'Страница новости/статьи'
      }
    ]
  },
  {
    path: '/about',
    name: 'about',
    label: 'О нас',
    icon: 'i-lucide-info',
    description: 'Информация о компании'
  },
  {
    path: '/contacts',
    name: 'contacts',
    label: 'Контакты',
    icon: 'i-lucide-phone',
    description: 'Контактная информация и форма обратной связи'
  },
  {
    path: '/application',
    name: 'application',
    label: 'Оставить заявку',
    icon: 'i-lucide-send',
    description: 'Форма отправки заявки'
  }
]

/** Admin panel routes (for future admin interface) */
export const ADMIN_ROUTES: RouteConfig[] = [
  {
    path: '/admin',
    name: 'admin-dashboard',
    label: 'Dashboard',
    icon: 'i-lucide-layout-dashboard',
    description: 'Админ панель'
  },
  {
    path: '/admin/objects',
    name: 'admin-objects',
    label: 'Объекты',
    icon: 'i-lucide-building-2',
    description: 'Управление объектами'
  },
  {
    path: '/admin/apartments',
    name: 'admin-apartments',
    label: 'Квартиры',
    icon: 'i-lucide-door-open',
    description: 'Управление квартирами'
  },
  {
    path: '/admin/projects',
    name: 'admin-projects',
    label: 'Проекты',
    icon: 'i-lucide-hard-hat',
    description: 'Управление проектами'
  },
  {
    path: '/admin/banners',
    name: 'admin-banners',
    label: 'Баннеры',
    icon: 'i-lucide-image',
    description: 'Управление баннерами'
  },
  {
    path: '/admin/news',
    name: 'admin-news',
    label: 'Новости',
    icon: 'i-lucide-newspaper',
    description: 'Управление новостями'
  },
  {
    path: '/admin/applications',
    name: 'admin-applications',
    label: 'Заявки',
    icon: 'i-lucide-inbox',
    description: 'Управление заявками'
  },
  {
    path: '/admin/uploads',
    name: 'admin-uploads',
    label: 'Файлы',
    icon: 'i-lucide-upload',
    description: 'Управление загруженными файлами'
  }
]

/** Utility route helpers */
export function getRouteByName(name: string): RouteConfig | undefined {
  const findRoute = (routes: RouteConfig[]): RouteConfig | undefined => {
    for (const route of routes) {
      if (route.name === name) return route
      if (route.children) {
        const found = findRoute(route.children)
        if (found) return found
      }
    }
    return undefined
  }
  return findRoute([...SITE_ROUTES, ...ADMIN_ROUTES])
}

export function getRouteByPath(path: string): RouteConfig | undefined {
  const findRoute = (routes: RouteConfig[]): RouteConfig | undefined => {
    for (const route of routes) {
      if (route.path === path) return route
      if (route.children) {
        const found = findRoute(route.children)
        if (found) return found
      }
    }
    return undefined
  }
  return findRoute([...SITE_ROUTES, ...ADMIN_ROUTES])
}

export function flattenRoutes(routes: RouteConfig[]): RouteConfig[] {
  const flattened: RouteConfig[] = []
  for (const route of routes) {
    flattened.push(route)
    if (route.children) {
      flattened.push(...flattenRoutes(route.children))
    }
  }
  return flattened
}

/** All public routes flattened for navigation */
export const FLAT_SITE_ROUTES = flattenRoutes(SITE_ROUTES)

/** All admin routes flattened for navigation */
export const FLAT_ADMIN_ROUTES = flattenRoutes(ADMIN_ROUTES)
