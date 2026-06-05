const RUOYI_ICON_MAP: Record<string, string> = {
  dashboard: 'ri:pie-chart-line',
  console: 'ri:home-smile-2-line',
  analysis: 'ri:align-item-bottom-line',
  ecommerce: 'ri:bar-chart-box-line',
  system: 'ri:user-3-line',
  monitor: 'ri:dashboard-3-line',
  tool: 'ri:tools-line',
  user: 'ri:user-line',
  peoples: 'ri:group-line',
  people: 'ri:group-line',
  role: 'ri:user-settings-line',
  menu: 'ri:menu-line',
  tree: 'ri:organization-chart',
  post: 'ri:briefcase-line',
  dict: 'ri:book-2-line',
  config: 'ri:settings-3-line',
  setting: 'ri:settings-3-line',
  settings: 'ri:settings-3-line',
  edit: 'ri:edit-2-line',
  form: 'ri:file-list-3-line',
  document: 'ri:file-list-3-line',
  tickets: 'ri:coupon-3-line',
  build: 'ri:drag-move-2-line',
  code: 'ri:code-s-slash-line',
  bug: 'ri:bug-line',
  chart: 'ri:bar-chart-box-line',
  online: 'ri:wifi-line',
  server: 'ri:server-line',
  redis: 'ri:database-2-line',
  job: 'ri:calendar-schedule-line',
  log: 'ri:file-list-2-line',
  logininfor: 'ri:shield-user-line',
  operlog: 'ri:file-search-line',
  notice: 'ri:notification-3-line',
  notification: 'ri:notification-3-line',
  message: 'ri:message-3-line',
  email: 'ri:mail-line',
  swagger: 'ri:api-line',
  guide: 'ri:compass-3-line',
  link: 'ri:links-line',
  example: 'ri:sparkling-line',
  examples: 'ri:sparkling-line',
  table: 'ri:table-3',
  list: 'ri:list-check',
  nested: 'ri:menu-unfold-3-line',
  article: 'ri:book-2-line',
  comment: 'ri:article-line',
  widgets: 'ri:apps-2-add-line',
  icon: 'ri:palette-line',
  imageCrop: 'ri:screenshot-line',
  excel: 'ri:download-2-line',
  video: 'ri:vidicon-line',
  countTo: 'ri:anthropic-line',
  wangEditor: 'ri:t-box-line',
  watermark: 'ri:water-flash-line',
  contextMenu: 'ri:menu-2-line',
  qrcode: 'ri:qr-code-line',
  drag: 'ri:drag-move-fill',
  textScroll: 'ri:input-method-line',
  fireworks: 'ri:magic-line',
  elementUI: 'ri:apps-2-line',
  template: 'ri:apps-2-line',
  pricing: 'ri:wallet-line',
  cards: 'ri:rectangle-line',
  banners: 'ri:bar-chart-box-line',
  map: 'ri:map-pin-line',
  chat: 'ri:message-3-line',
  calendar: 'ri:calendar-2-line',
  payment: 'ri:money-cny-box-line',
  safeguard: 'ri:shield-check-line',
  result: 'ri:checkbox-circle-line',
  success: 'ri:checkbox-circle-line',
  fail: 'ri:close-circle-line',
  exception: 'ri:error-warning-line',
  forbidden: 'ri:forbid-2-line',
  notFound: 'ri:file-warning-line',
  serverError: 'ri:server-line',
  password: 'ri:lock-password-line',
  eye: 'ri:eye-line',
  validCode: 'ri:shield-keyhole-line',
  documentation: 'ri:book-open-line',
  component: 'ri:apps-2-line',
  clipboard: 'ri:clipboard-line',
  international: 'ri:translate-2',
  tab: 'ri:layout-top-line',
  theme: 'ri:palette-line',
  size: 'ri:font-size-2',
  money: 'ri:money-cny-circle-line',
  shopping: 'ri:shopping-bag-line',
  phone: 'ri:phone-line',
  lock: 'ri:lock-line',
  unlock: 'ri:lock-unlock-line',
  search: 'ri:search-line',
  download: 'ri:download-2-line',
  upload: 'ri:upload-2-line',
  delete: 'ri:delete-bin-5-line',
  add: 'ri:add-fill',
  plus: 'ri:add-fill',
  refresh: 'ri:refresh-line'
}

const ELEMENT_PLUS_ICON_MAP: Record<string, string> = {
  User: 'ri:user-line',
  Avatar: 'ri:user-3-line',
  Setting: 'ri:settings-3-line',
  Menu: 'ri:menu-line',
  Grid: 'ri:layout-grid-line',
  List: 'ri:list-check',
  Document: 'ri:file-list-3-line',
  Tickets: 'ri:coupon-3-line',
  Monitor: 'ri:dashboard-3-line',
  Tools: 'ri:tools-line',
  Search: 'ri:search-line',
  Edit: 'ri:edit-2-line',
  Delete: 'ri:delete-bin-5-line',
  Plus: 'ri:add-fill',
  Download: 'ri:download-2-line',
  Upload: 'ri:upload-2-line',
  Bell: 'ri:notification-3-line',
  Message: 'ri:message-3-line',
  Lock: 'ri:lock-line',
  Unlock: 'ri:lock-unlock-line'
}

const ICONIFY_PREFIX_RE = /^[a-z0-9-]+:/i

function normalizeIconKey(icon?: string | null) {
  return String(icon ?? '')
    .trim()
    .replace(/^#?icon-/, '')
}

export function normalizeMenuIcon(icon?: string | null, fallback = 'ri:menu-line') {
  const iconName = normalizeIconKey(icon)
  if (!iconName) return fallback
  if (ICONIFY_PREFIX_RE.test(iconName)) return iconName

  const lowerIconName = iconName.toLowerCase()
  return (
    RUOYI_ICON_MAP[iconName] ||
    RUOYI_ICON_MAP[lowerIconName] ||
    ELEMENT_PLUS_ICON_MAP[iconName] ||
    ELEMENT_PLUS_ICON_MAP[lowerIconName] ||
    fallback
  )
}

export const ruoyiMenuIconMap = RUOYI_ICON_MAP
