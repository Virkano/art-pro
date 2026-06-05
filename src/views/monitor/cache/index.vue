<!-- 缓存监控 -->
<template>
  <div v-loading="loading" class="cache-page">
    <ElCard class="monitor-card">
      <template #header>基本信息</template>
      <ElDescriptions :column="4" border>
        <ElDescriptionsItem label="Redis 版本">
          {{ cache.info?.redis_version || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="运行模式">
          {{ cache.info?.redis_mode === 'standalone' ? '单机' : cache.info?.redis_mode || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="端口">{{ cache.info?.tcp_port || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="客户端数">
          {{ cache.info?.connected_clients || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="运行时间(天)">
          {{ cache.info?.uptime_in_days || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="使用内存">
          {{ cache.info?.used_memory_human || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="内存配置">
          {{ cache.info?.maxmemory_human || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="Key 数量">{{ cache.dbSize ?? '-' }}</ElDescriptionsItem>
      </ElDescriptions>
    </ElCard>

    <ElRow :gutter="12">
      <ElCol :xs="24" :md="12">
        <ElCard class="monitor-card">
          <template #header>命令统计</template>
          <div ref="commandChartRef" class="chart-box" />
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :md="12">
        <ElCard class="monitor-card">
          <template #header>内存信息</template>
          <div class="memory-panel">
            <div class="memory-value">{{ cache.info?.used_memory_human || '-' }}</div>
            <ElProgress :percentage="memoryPercent" :stroke-width="12" />
            <div class="memory-meta">
              <span>峰值：{{ cache.info?.used_memory_peak_human || '-' }}</span>
              <span>碎片率：{{ cache.info?.mem_fragmentation_ratio || '-' }}</span>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetCacheInfo } from '@/api/system-manage'
  import { echarts } from '@/plugins/echarts'
  import type { EChartsOption } from '@/plugins/echarts'

  defineOptions({ name: 'Cache' })

  const loading = ref(false)
  const cache = ref<Api.SystemManage.CacheInfo>({})
  const commandChartRef = ref<HTMLDivElement>()
  let commandChart: ReturnType<typeof echarts.init> | null = null

  const memoryPercent = computed(() => {
    const usedMemory = cache.value.info?.used_memory
    const maxMemory = cache.value.info?.maxmemory
    if (!usedMemory || !maxMemory || Number(maxMemory) <= 0) return 0
    return Math.min(100, Number(((Number(usedMemory) / Number(maxMemory)) * 100).toFixed(2)))
  })

  const renderCommandChart = () => {
    if (!commandChartRef.value) return
    commandChart ||= echarts.init(commandChartRef.value)
    const option: EChartsOption = {
      tooltip: { trigger: 'item' },
      series: [
        {
          name: '命令',
          type: 'pie',
          radius: ['35%', '70%'],
          data: cache.value.commandStats || []
        }
      ]
    }
    commandChart.setOption(option)
  }

  const getData = async () => {
    loading.value = true
    try {
      cache.value = await fetchGetCacheInfo()
      await nextTick()
      renderCommandChart()
    } finally {
      loading.value = false
    }
  }

  const resizeChart = () => commandChart?.resize()

  onMounted(() => {
    getData()
    window.addEventListener('resize', resizeChart)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart)
    commandChart?.dispose()
  })
</script>

<style scoped lang="scss">
  .cache-page {
    height: 100%;

    .monitor-card {
      margin-bottom: 12px;
    }

    .chart-box {
      height: 360px;
    }

    .memory-panel {
      height: 360px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 18px;
    }

    .memory-value {
      font-size: 34px;
      font-weight: 700;
      color: var(--el-color-primary);
    }

    .memory-meta {
      display: flex;
      justify-content: space-between;
      color: var(--art-text-gray-600);
    }
  }
</style>
