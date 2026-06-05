<!-- 服务监控 -->
<template>
  <div v-loading="loading" class="server-page">
    <ElRow :gutter="12">
      <ElCol :xs="24" :md="12">
        <ElCard class="monitor-card">
          <template #header>CPU</template>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="核心数">{{ server.cpu?.cpuNum || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="用户使用率">
              {{ formatPercent(server.cpu?.used) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="系统使用率">
              {{ formatPercent(server.cpu?.sys) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="当前空闲率">
              {{ formatPercent(server.cpu?.free) }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :md="12">
        <ElCard class="monitor-card">
          <template #header>内存</template>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="总内存">
              {{ formatGb(server.mem?.total) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="已用内存">
              {{ formatGb(server.mem?.used) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="剩余内存">
              {{ formatGb(server.mem?.free) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="使用率">
              {{ formatPercent(server.mem?.usage) }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :md="12">
        <ElCard class="monitor-card">
          <template #header>服务器信息</template>
          <ElDescriptions :column="1" border>
            <ElDescriptionsItem label="服务器名称">
              {{ server.sys?.computerName || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="服务器 IP">
              {{ server.sys?.computerIp || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="操作系统">
              {{ server.sys?.osName || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="系统架构">
              {{ server.sys?.osArch || '-' }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :md="12">
        <ElCard class="monitor-card">
          <template #header>Java 虚拟机</template>
          <ElDescriptions :column="1" border>
            <ElDescriptionsItem label="Java 名称">{{ server.jvm?.name || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="Java 版本">
              {{ server.jvm?.version || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="启动时间">
              {{ server.jvm?.startTime || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="运行时长">
              {{ server.jvm?.runTime || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="安装路径">{{ server.jvm?.home || '-' }}</ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>
      </ElCol>

      <ElCol :span="24">
        <ElCard class="monitor-card">
          <template #header>磁盘状态</template>
          <ArtTable :data="server.sysFiles || []" :columns="fileColumns" />
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetServerInfo } from '@/api/system-manage'

  defineOptions({ name: 'Server' })

  const loading = ref(false)
  const server = ref<Api.SystemManage.ServerInfo>({})

  const fileColumns = [
    { prop: 'dirName', label: '盘符路径', minWidth: 160, showOverflowTooltip: true },
    { prop: 'sysTypeName', label: '文件系统', width: 120, showOverflowTooltip: true },
    { prop: 'typeName', label: '盘符类型', width: 120, showOverflowTooltip: true },
    { prop: 'total', label: '总大小', width: 120 },
    { prop: 'free', label: '可用大小', width: 120 },
    { prop: 'used', label: '已用大小', width: 120 },
    { prop: 'usage', label: '已用百分比', width: 120 }
  ]

  const formatPercent = (value: unknown) =>
    value === undefined || value === null ? '-' : `${value}%`
  const formatGb = (value: unknown) => (value === undefined || value === null ? '-' : `${value}G`)

  const getData = async () => {
    loading.value = true
    try {
      server.value = await fetchGetServerInfo()
    } finally {
      loading.value = false
    }
  }

  onMounted(getData)
</script>

<style scoped lang="scss">
  .server-page {
    height: 100%;

    .monitor-card {
      margin-bottom: 12px;
    }
  }
</style>
