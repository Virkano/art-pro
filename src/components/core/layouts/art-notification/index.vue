<!-- 通知组件 -->
<template>
  <div
    class="art-notification-panel art-card-sm !shadow-xl"
    :style="{
      transform: show ? 'scaleY(1)' : 'scaleY(0.9)',
      opacity: show ? 1 : 0
    }"
    v-show="visible"
    @click.stop
  >
    <div class="flex-cb px-3.5 mt-3.5">
      <span class="text-base font-medium text-g-800">通知公告</span>
      <span
        class="text-xs text-g-800 px-1.5 py-1 c-p select-none rounded hover:bg-g-200"
        @click="loadNotices"
      >
        刷新
      </span>
    </div>

    <ul class="box-border flex items-end w-full h-12.5 px-3.5 border-b-d">
      <li
        class="h-12 leading-12 mr-5 overflow-hidden text-[13px] text-g-700 select-none bar-active"
      >
        公告 ({{ noticeList.length }})
      </li>
    </ul>

    <div class="w-full h-[calc(100%-95px)]">
      <div v-loading="loading" class="h-[calc(100%-60px)] overflow-y-scroll scrollbar-thin">
        <ul v-if="noticeList.length > 0">
          <li
            v-for="item in noticeList"
            :key="item.noticeId"
            class="box-border flex-c px-3.5 py-3.5 c-p last:border-b-0 hover:bg-g-200/60"
            @click="openNotice(item)"
          >
            <div
              class="size-9 leading-9 text-center rounded-lg flex-cc"
              :class="getNoticeStyle(item.noticeType).iconClass"
            >
              <ArtSvgIcon
                class="text-lg !bg-transparent"
                :icon="getNoticeStyle(item.noticeType).icon"
              />
            </div>
            <div class="w-[calc(100%-45px)] ml-3.5">
              <div class="flex items-center gap-2">
                <ElTag size="small" :type="item.noticeType === '2' ? 'warning' : 'primary'">
                  {{ item.noticeType === '2' ? '公告' : '通知' }}
                </ElTag>
                <h4 class="min-w-0 text-sm font-normal leading-5.5 text-g-900 truncate">
                  {{ item.noticeTitle }}
                </h4>
              </div>
              <p class="mt-1.5 text-xs text-g-500">{{ item.createTime || '-' }}</p>
            </div>
          </li>
        </ul>

        <div v-else class="relative top-25 h-full text-g-500 text-center !bg-transparent">
          <ArtSvgIcon icon="system-uicons:inbox" class="text-5xl" />
          <p class="mt-3.5 text-xs !bg-transparent">暂无通知公告</p>
        </div>
      </div>

      <div class="relative box-border w-full px-3.5">
        <ElButton class="w-full mt-3" @click="handleViewAll" v-ripple>查看全部</ElButton>
      </div>
    </div>

    <ElDialog v-model="detailVisible" title="通知公告" width="560px" align-center append-to-body>
      <div v-if="currentNotice" class="notice-detail">
        <h3>{{ currentNotice.noticeTitle }}</h3>
        <div class="notice-detail__meta">
          <ElTag :type="currentNotice.noticeType === '2' ? 'warning' : 'primary'">
            {{ currentNotice.noticeType === '2' ? '公告' : '通知' }}
          </ElTag>
          <span>{{ currentNotice.createTime || '-' }}</span>
        </div>
        <ElDivider />
        <div
          v-if="currentNotice.noticeContent"
          class="notice-detail__content"
          v-html="currentNotice.noticeContent"
        ></div>
        <div v-else class="notice-detail__content">暂无内容</div>
      </div>
    </ElDialog>

    <div class="h-25"></div>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetNoticeDetail, fetchGetNoticeList } from '@/api/system-manage'

  defineOptions({ name: 'ArtNotification' })

  const props = defineProps<{
    value: boolean
  }>()

  const emit = defineEmits<{
    'update:value': [value: boolean]
    'count-change': [value: number]
  }>()

  const router = useRouter()
  const show = ref(false)
  const visible = ref(false)
  const loading = ref(false)
  const detailVisible = ref(false)
  const noticeList = ref<Api.SystemManage.NoticeListItem[]>([])
  const currentNotice = ref<Api.SystemManage.NoticeListItem>()

  const getNoticeStyle = (type: Api.SystemManage.NoticeType) =>
    type === '2'
      ? {
          icon: 'ri:megaphone-line',
          iconClass: 'bg-warning/12 text-warning'
        }
      : {
          icon: 'ri:notification-3-line',
          iconClass: 'bg-theme/12 text-theme'
        }

  const loadNotices = async () => {
    loading.value = true
    try {
      const result = await fetchGetNoticeList({
        pageNum: 1,
        pageSize: 8,
        status: '0'
      })
      noticeList.value = result.records
      emit('count-change', result.total)
    } catch {
      noticeList.value = []
      emit('count-change', 0)
    } finally {
      loading.value = false
    }
  }

  const showNotice = (open: boolean) => {
    if (open) {
      visible.value = true
      loadNotices()
      setTimeout(() => {
        show.value = true
      }, 5)
    } else {
      show.value = false
      setTimeout(() => {
        visible.value = false
      }, 350)
    }
  }

  const openNotice = async (item: Api.SystemManage.NoticeListItem) => {
    currentNotice.value = await fetchGetNoticeDetail(item.noticeId)
    detailVisible.value = true
  }

  const handleViewAll = () => {
    emit('update:value', false)
    router.push({ name: 'Notice' })
  }

  watch(
    () => props.value,
    (newValue) => {
      showNotice(newValue)
    }
  )

  onMounted(() => {
    loadNotices()
  })
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .art-notification-panel {
    @apply absolute 
    top-14.5 
    right-5 
    w-90 
    h-125 
    overflow-hidden 
    transition-all 
    duration-300
    origin-top 
    will-change-[top,left] 
    max-[640px]:top-[65px]
    max-[640px]:right-0
    max-[640px]:w-full 
    max-[640px]:h-[80vh];
  }

  .bar-active {
    color: var(--theme-color) !important;
    border-bottom: 2px solid var(--theme-color);
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 5px !important;
  }

  .dark .scrollbar-thin::-webkit-scrollbar-track {
    background-color: var(--default-box-color);
  }

  .dark .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #222 !important;
  }

  .notice-detail h3 {
    margin: 0 0 10px;
    font-size: 18px;
    font-weight: 600;
    color: var(--art-text-gray-900);
  }

  .notice-detail__meta {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    color: var(--art-text-gray-500);
  }

  .notice-detail__content {
    min-height: 120px;
    line-height: 1.8;
    white-space: pre-wrap;
    color: var(--art-text-gray-800);
  }
</style>
