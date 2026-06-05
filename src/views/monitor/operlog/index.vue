<!-- 操作日志页面 -->
<template>
  <div class="art-full-height">
    <ArtSearchBar
      v-show="showSearchBar"
      v-model="searchForm"
      :items="searchItems"
      @reset="handleReset"
      @search="handleSearch"
    />

    <ElCard class="art-table-card" :style="{ 'margin-top': showSearchBar ? '12px' : '0' }">
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="danger" @click="cleanOperLog" v-ripple>清空日志</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    <ElDialog v-model="detailVisible" title="操作日志详情" width="760px" align-center>
      <ElDescriptions v-if="currentLog" :column="2" border>
        <ElDescriptionsItem label="系统模块">{{ currentLog.title || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="操作人员">{{ currentLog.operName || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="操作类型">
          {{ getBusinessTypeText(currentLog.businessType) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="操作状态">
          <ElTag :type="currentLog.status === '0' ? 'success' : 'danger'">
            {{ currentLog.status === '0' ? '正常' : '异常' }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="请求方式">
          {{ currentLog.requestMethod || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="操作地址">{{ currentLog.operIp || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求地址" :span="2">
          {{ currentLog.operUrl || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="调用方法" :span="2">
          {{ currentLog.method || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="请求参数" :span="2">
          <pre>{{ currentLog.operParam || '-' }}</pre>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="返回参数" :span="2">
          <pre>{{ currentLog.jsonResult || '-' }}</pre>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="错误消息" :span="2">
          <pre>{{ currentLog.errorMsg || '-' }}</pre>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="操作时间">{{ currentLog.operTime || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="消耗时间">
          {{ currentLog.costTime === undefined ? '-' : `${currentLog.costTime} ms` }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { fetchCleanOperLog, fetchDeleteOperLog, fetchGetOperLogList } from '@/api/system-manage'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'

  defineOptions({ name: 'OperLog' })

  type OperLogListItem = Api.SystemManage.OperLogListItem

  const businessTypeOptions = [
    { label: '其它', value: 0 },
    { label: '新增', value: 1 },
    { label: '修改', value: 2 },
    { label: '删除', value: 3 },
    { label: '授权', value: 4 },
    { label: '导出', value: 5 },
    { label: '导入', value: 6 },
    { label: '强退', value: 7 },
    { label: '生成代码', value: 8 },
    { label: '清空数据', value: 9 }
  ]

  const showSearchBar = ref(false)
  const detailVisible = ref(false)
  const currentLog = ref<OperLogListItem>()

  const searchForm = ref<Api.SystemManage.OperLogSearchParams>({
    title: undefined,
    operName: undefined,
    operIp: undefined,
    businessType: undefined,
    status: undefined
  })

  const searchItems = computed(() => [
    {
      label: '系统模块',
      key: 'title',
      type: 'input',
      props: { placeholder: '请输入系统模块', clearable: true }
    },
    {
      label: '操作人员',
      key: 'operName',
      type: 'input',
      props: { placeholder: '请输入操作人员', clearable: true }
    },
    {
      label: '操作地址',
      key: 'operIp',
      type: 'input',
      props: { placeholder: '请输入操作地址', clearable: true }
    },
    {
      label: '操作类型',
      key: 'businessType',
      type: 'select',
      props: { placeholder: '请选择操作类型', clearable: true, options: businessTypeOptions }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { label: '正常', value: '0' },
          { label: '异常', value: '1' }
        ]
      }
    }
  ])

  const getBusinessTypeText = (type?: number) =>
    businessTypeOptions.find((item) => item.value === Number(type))?.label || '其它'

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchGetOperLogList,
      apiParams: {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'operTime',
        isAsc: 'descending'
      },
      paginationKey: {
        current: 'pageNum',
        size: 'pageSize'
      },
      columnsFactory: () => [
        { prop: 'operId', label: '日志编号', width: 100 },
        { prop: 'title', label: '系统模块', minWidth: 140, showOverflowTooltip: true },
        {
          prop: 'businessType',
          label: '操作类型',
          width: 100,
          formatter: (row: OperLogListItem) => getBusinessTypeText(row.businessType)
        },
        { prop: 'operName', label: '操作人员', width: 120, showOverflowTooltip: true },
        { prop: 'operIp', label: '操作地址', width: 140, showOverflowTooltip: true },
        {
          prop: 'status',
          label: '状态',
          width: 90,
          formatter: (row: OperLogListItem) =>
            h(ElTag, { type: row.status === '0' ? 'success' : 'danger' }, () =>
              row.status === '0' ? '正常' : '异常'
            )
        },
        { prop: 'operTime', label: '操作时间', width: 180 },
        {
          prop: 'costTime',
          label: '耗时',
          width: 100,
          formatter: (row: OperLogListItem) =>
            row.costTime === undefined ? '-' : `${row.costTime} ms`
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: OperLogListItem) =>
            h('div', { class: 'flex gap-1' }, [
              h(ArtButtonTable, { type: 'view', onClick: () => openDetail(row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => deleteOperLog(row) })
            ])
        }
      ]
    }
  })

  const openDetail = (row: OperLogListItem) => {
    currentLog.value = row
    detailVisible.value = true
  }

  const deleteOperLog = (row: OperLogListItem) => {
    ElMessageBox.confirm(`确定删除操作日志"${row.operId}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await fetchDeleteOperLog(row.operId)
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }

  const cleanOperLog = () => {
    ElMessageBox.confirm('确定清空所有操作日志吗？此操作不可恢复！', '清空确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await fetchCleanOperLog()
        ElMessage.success('清空成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.info('已取消清空')
      })
  }

  const handleSearch = (params: Api.SystemManage.OperLogSearchParams) => {
    replaceSearchParams(params)
    getData()
  }

  const handleReset = () => {
    resetSearchParams()
  }
</script>

<style scoped lang="scss">
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
    font-family: inherit;
  }
</style>
