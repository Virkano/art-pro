<!-- 缓存列表 -->
<template>
  <div class="cache-list-page">
    <ElCard class="toolbar-card">
      <ElButton type="danger" @click="clearAll" v-ripple>清理全部缓存</ElButton>
      <ElButton @click="getNames" v-ripple>刷新</ElButton>
    </ElCard>

    <ElRow :gutter="12">
      <ElCol :xs="24" :md="8">
        <ElCard class="list-card">
          <template #header>缓存名称</template>
          <ArtTable
            :loading="nameLoading"
            :data="cacheNames"
            :columns="nameColumns"
            :height="'460px'"
          />
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :md="8">
        <ElCard class="list-card">
          <template #header>缓存键名</template>
          <ArtTable
            :loading="keyLoading"
            :data="cacheKeys"
            :columns="keyColumns"
            :height="'460px'"
          />
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :md="8">
        <ElCard class="list-card">
          <template #header>缓存内容</template>
          <ElDescriptions v-if="cacheValue" :column="1" border>
            <ElDescriptionsItem label="缓存名称">
              {{ cacheValue.cacheName || selectedName || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="缓存键名">
              {{ cacheValue.cacheKey || selectedKey || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="缓存内容">
              <pre>{{ cacheValue.cacheValue || '-' }}</pre>
            </ElDescriptionsItem>
          </ElDescriptions>
          <ElEmpty v-else description="请选择缓存键名" />
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import {
    fetchClearCacheAll,
    fetchClearCacheKey,
    fetchClearCacheName,
    fetchGetCacheKeys,
    fetchGetCacheNames,
    fetchGetCacheValue
  } from '@/api/system-manage'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { ElMessage, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'CacheList' })

  const nameLoading = ref(false)
  const keyLoading = ref(false)
  const cacheNames = ref<Api.SystemManage.CacheNameItem[]>([])
  const cacheKeys = ref<Array<{ cacheKey: string }>>([])
  const cacheValue = ref<Api.SystemManage.CacheValueItem>()
  const selectedName = ref('')
  const selectedKey = ref('')

  const nameColumns = [
    { prop: 'cacheName', label: '缓存名称', minWidth: 150, showOverflowTooltip: true },
    { prop: 'remark', label: '备注', minWidth: 120, showOverflowTooltip: true },
    {
      prop: 'operation',
      label: '操作',
      width: 110,
      formatter: (row: Api.SystemManage.CacheNameItem) =>
        h('div', { class: 'flex gap-1' }, [
          h(ArtButtonTable, { type: 'view', onClick: () => selectName(row.cacheName) }),
          h(ArtButtonTable, { type: 'delete', onClick: () => clearName(row.cacheName) })
        ])
    }
  ]

  const keyColumns = [
    { prop: 'cacheKey', label: '缓存键名', minWidth: 180, showOverflowTooltip: true },
    {
      prop: 'operation',
      label: '操作',
      width: 110,
      formatter: (row: { cacheKey: string }) =>
        h('div', { class: 'flex gap-1' }, [
          h(ArtButtonTable, { type: 'view', onClick: () => selectKey(row.cacheKey) }),
          h(ArtButtonTable, { type: 'delete', onClick: () => clearKey(row.cacheKey) })
        ])
    }
  ]

  const getNames = async () => {
    nameLoading.value = true
    try {
      cacheNames.value = await fetchGetCacheNames()
      if (!selectedName.value && cacheNames.value[0]?.cacheName) {
        await selectName(cacheNames.value[0].cacheName)
      }
    } finally {
      nameLoading.value = false
    }
  }

  const selectName = async (cacheName: string) => {
    selectedName.value = cacheName
    selectedKey.value = ''
    cacheValue.value = undefined
    keyLoading.value = true
    try {
      const keys = await fetchGetCacheKeys(cacheName)
      cacheKeys.value = keys.map((cacheKey) => ({ cacheKey }))
    } finally {
      keyLoading.value = false
    }
  }

  const selectKey = async (cacheKey: string) => {
    selectedKey.value = cacheKey
    cacheValue.value = await fetchGetCacheValue(selectedName.value, cacheKey)
  }

  const clearName = (cacheName: string) => {
    ElMessageBox.confirm(`确定清理缓存名称"${cacheName}"吗？`, '清理确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchClearCacheName(cacheName)
      ElMessage.success('清理成功')
      if (selectedName.value === cacheName) {
        selectedName.value = ''
        selectedKey.value = ''
        cacheKeys.value = []
        cacheValue.value = undefined
      }
      getNames()
    })
  }

  const clearKey = (cacheKey: string) => {
    ElMessageBox.confirm(`确定清理缓存键名"${cacheKey}"吗？`, '清理确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchClearCacheKey(cacheKey)
      ElMessage.success('清理成功')
      if (selectedKey.value === cacheKey) cacheValue.value = undefined
      await selectName(selectedName.value)
    })
  }

  const clearAll = () => {
    ElMessageBox.confirm('确定清理全部缓存吗？', '清理确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchClearCacheAll()
      ElMessage.success('清理成功')
      selectedName.value = ''
      selectedKey.value = ''
      cacheKeys.value = []
      cacheValue.value = undefined
      getNames()
    })
  }

  onMounted(getNames)
</script>

<style scoped lang="scss">
  .cache-list-page {
    .toolbar-card {
      margin-bottom: 12px;
    }

    .list-card {
      min-height: 520px;
    }

    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
      font-family: inherit;
    }
  }
</style>
