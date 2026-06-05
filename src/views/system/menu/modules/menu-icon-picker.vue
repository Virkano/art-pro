<!-- 菜单图标选择弹窗 -->
<template>
  <ElDialog v-model="dialogVisible" title="选择图标" width="860px" align-center>
    <div class="icon-picker">
      <div class="picker-toolbar">
        <ElInput v-model.trim="keyword" clearable placeholder="搜索图标名称" class="search-input">
          <template #prefix>
            <ArtSvgIcon icon="ri:search-line" class="text-base text-g-500" />
          </template>
        </ElInput>
        <ElInput v-model.trim="customIcon" clearable placeholder="输入 Iconify 图标名">
          <template #prefix>
            <ArtSvgIcon :icon="previewIcon" class="text-base text-g-500" />
          </template>
        </ElInput>
      </div>

      <ElTabs v-model="activeLibrary" class="library-tabs">
        <ElTabPane
          v-for="library in iconLibraries"
          :key="library.name"
          :label="library.label"
          :name="library.name"
        />
      </ElTabs>

      <div class="icon-grid">
        <button
          v-for="item in filteredIcons"
          :key="`${activeLibrary}-${item.value}`"
          type="button"
          class="icon-item"
          :class="{ active: selectedIcon === item.value }"
          :title="item.value"
          @click="selectIcon(item.value)"
        >
          <ArtSvgIcon :icon="item.icon" class="icon-preview" />
          <span>{{ item.name }}</span>
        </button>
        <ElEmpty v-if="filteredIcons.length === 0" description="暂无匹配图标" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="selected-preview">
          <ArtSvgIcon :icon="previewIcon" class="text-xl" />
          <span>{{ selectedIcon || '未选择' }}</span>
        </div>
        <div>
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="confirmIcon">确定</ElButton>
        </div>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { normalizeMenuIcon, ruoyiMenuIconMap } from '@/utils/ui'

  defineOptions({ name: 'MenuIconPicker' })

  interface IconItem {
    name: string
    value: string
    icon: string
  }

  interface IconLibrary {
    name: string
    label: string
    icons: IconItem[]
  }

  const props = defineProps<{
    modelValue?: string
    visible: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'update:visible', value: boolean): void
  }>()

  const keyword = ref('')
  const customIcon = ref('')
  const selectedIcon = ref('')
  const activeLibrary = ref('menu')

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const buildItems = (icons: string[], valueAsRaw = false): IconItem[] =>
    Array.from(new Set(icons)).map((icon) => ({
      name: icon.replace(/^[a-z0-9-]+:/i, ''),
      value: valueAsRaw ? icon.replace(/^ri:/, '') : icon,
      icon
    }))

  const menuIcons = Object.entries(ruoyiMenuIconMap).map(([name, icon]) => ({
    name,
    value: name,
    icon
  }))

  const remixIcons = buildItems(
    [
      'ri:home-smile-2-line',
      'ri:dashboard-3-line',
      'ri:apps-2-line',
      'ri:user-line',
      'ri:user-3-line',
      'ri:group-line',
      'ri:user-settings-line',
      'ri:shield-user-line',
      'ri:settings-3-line',
      'ri:menu-line',
      'ri:organization-chart',
      'ri:briefcase-line',
      'ri:book-2-line',
      'ri:file-list-3-line',
      'ri:file-search-line',
      'ri:notification-3-line',
      'ri:message-3-line',
      'ri:mail-line',
      'ri:calendar-2-line',
      'ri:calendar-schedule-line',
      'ri:database-2-line',
      'ri:server-line',
      'ri:wifi-line',
      'ri:tools-line',
      'ri:code-s-slash-line',
      'ri:bug-line',
      'ri:api-line',
      'ri:bar-chart-box-line',
      'ri:pie-chart-line',
      'ri:line-chart-line',
      'ri:table-3',
      'ri:list-check',
      'ri:layout-grid-line',
      'ri:layout-top-line',
      'ri:wallet-line',
      'ri:money-cny-circle-line',
      'ri:shopping-bag-line',
      'ri:coupon-3-line',
      'ri:links-line',
      'ri:compass-3-line',
      'ri:map-pin-line',
      'ri:palette-line',
      'ri:image-line',
      'ri:vidicon-line',
      'ri:t-box-line',
      'ri:qr-code-line',
      'ri:drag-move-fill',
      'ri:magic-line',
      'ri:lock-line',
      'ri:lock-unlock-line',
      'ri:search-line',
      'ri:add-fill',
      'ri:edit-2-line',
      'ri:delete-bin-5-line',
      'ri:eye-line',
      'ri:refresh-line',
      'ri:download-2-line',
      'ri:upload-2-line',
      'ri:telegram-2-line',
      'ri:article-line',
      'ri:book-open-line',
      'ri:checkbox-circle-line',
      'ri:close-circle-line',
      'ri:error-warning-line',
      'ri:file-warning-line',
      'ri:forbid-2-line'
    ],
    false
  )

  const elementPlusCompatibleIcons = buildItems(
    [
      'ri:user-line',
      'ri:user-3-line',
      'ri:settings-3-line',
      'ri:menu-line',
      'ri:layout-grid-line',
      'ri:list-check',
      'ri:file-list-3-line',
      'ri:coupon-3-line',
      'ri:dashboard-3-line',
      'ri:tools-line',
      'ri:search-line',
      'ri:edit-2-line',
      'ri:delete-bin-5-line',
      'ri:add-fill',
      'ri:download-2-line',
      'ri:upload-2-line',
      'ri:notification-3-line',
      'ri:message-3-line',
      'ri:lock-line',
      'ri:lock-unlock-line'
    ],
    false
  )

  const tablerIcons = buildItems([
    'tabler:home',
    'tabler:layout-dashboard',
    'tabler:users',
    'tabler:user-cog',
    'tabler:settings',
    'tabler:menu-2',
    'tabler:database',
    'tabler:server',
    'tabler:calendar-time',
    'tabler:file-text',
    'tabler:article',
    'tabler:chart-bar',
    'tabler:chart-pie',
    'tabler:shield-lock',
    'tabler:bell',
    'tabler:mail',
    'tabler:tools',
    'tabler:api',
    'tabler:code',
    'tabler:bug',
    'tabler:link',
    'tabler:map-pin',
    'tabler:palette',
    'tabler:upload',
    'tabler:download'
  ])

  const solarIcons = buildItems([
    'solar:home-2-linear',
    'solar:widget-2-linear',
    'solar:user-linear',
    'solar:users-group-rounded-linear',
    'solar:settings-linear',
    'solar:menu-dots-bold',
    'solar:database-linear',
    'solar:server-linear',
    'solar:calendar-linear',
    'solar:document-text-linear',
    'solar:chart-2-linear',
    'solar:pie-chart-2-linear',
    'solar:shield-keyhole-linear',
    'solar:bell-linear',
    'solar:letter-linear',
    'solar:code-linear',
    'solar:bug-linear',
    'solar:link-linear',
    'solar:map-point-linear',
    'solar:palette-linear',
    'solar:download-linear',
    'solar:upload-linear'
  ])

  const iconLibraries: IconLibrary[] = [
    { name: 'menu', label: '常用菜单', icons: menuIcons },
    { name: 'remix', label: 'Remix', icons: remixIcons },
    { name: 'element', label: 'Element 兼容', icons: elementPlusCompatibleIcons },
    { name: 'tabler', label: 'Tabler', icons: tablerIcons },
    { name: 'solar', label: 'Solar', icons: solarIcons }
  ]

  const currentLibrary = computed(
    () => iconLibraries.find((library) => library.name === activeLibrary.value) || iconLibraries[0]
  )

  const filteredIcons = computed(() => {
    const searchText = keyword.value.toLowerCase()
    if (!searchText) return currentLibrary.value.icons
    return currentLibrary.value.icons.filter((item) =>
      [item.name, item.value, item.icon].some((text) => text.toLowerCase().includes(searchText))
    )
  })

  const previewIcon = computed(() => normalizeMenuIcon(customIcon.value || selectedIcon.value))

  const selectIcon = (value: string) => {
    selectedIcon.value = value
    customIcon.value = value
  }

  const confirmIcon = () => {
    emit('update:modelValue', customIcon.value || selectedIcon.value)
    dialogVisible.value = false
  }

  watch(
    () => props.visible,
    (visible) => {
      if (!visible) return
      selectedIcon.value = props.modelValue || ''
      customIcon.value = props.modelValue || ''
      keyword.value = ''
    }
  )
</script>

<style scoped lang="scss">
  .icon-picker {
    .picker-toolbar {
      display: grid;
      grid-template-columns: minmax(180px, 240px) 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }

    .library-tabs {
      margin-bottom: 8px;
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(106px, 1fr));
      gap: 8px;
      height: 420px;
      padding-right: 4px;
      overflow-y: auto;
    }

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 82px;
      gap: 8px;
      padding: 8px;
      color: var(--art-text-gray-700);
      cursor: pointer;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      transition: all 0.18s;

      &:hover,
      &.active {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }

      span {
        width: 100%;
        overflow: hidden;
        font-size: 12px;
        line-height: 16px;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .icon-preview {
      font-size: 24px;
      flex-shrink: 0;
    }
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .selected-preview {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 8px;
    color: var(--art-text-gray-700);

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  @media (max-width: 768px) {
    .icon-picker {
      .picker-toolbar {
        grid-template-columns: 1fr;
      }

      .icon-grid {
        grid-template-columns: repeat(auto-fill, minmax(86px, 1fr));
        height: 360px;
      }
    }
  }
</style>
