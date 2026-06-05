<!-- 定时任务 -->
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
          <ElButton type="primary" @click="openDialog('add')" v-ripple>新增任务</ElButton>
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

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="760px" align-center>
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="任务名称" prop="jobName">
              <ElInput v-model="form.jobName" placeholder="请输入任务名称" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="任务分组" prop="jobGroup">
              <ElSelect v-model="form.jobGroup" placeholder="请选择任务分组">
                <ElOption
                  v-for="item in jobGroupOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="调用方法" prop="invokeTarget">
              <ElInput v-model="form.invokeTarget" placeholder="请输入调用目标字符串" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="Cron 表达式" prop="cronExpression">
              <ElInput v-model="form.cronExpression" placeholder="请输入 cron 执行表达式" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="执行策略" prop="misfirePolicy">
              <ElRadioGroup v-model="form.misfirePolicy">
                <ElRadioButton label="1">立即执行</ElRadioButton>
                <ElRadioButton label="2">执行一次</ElRadioButton>
                <ElRadioButton label="3">放弃执行</ElRadioButton>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="是否并发" prop="concurrent">
              <ElRadioGroup v-model="form.concurrent">
                <ElRadioButton label="0">允许</ElRadioButton>
                <ElRadioButton label="1">禁止</ElRadioButton>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="任务状态" prop="status">
              <ElRadioGroup v-model="form.status">
                <ElRadio label="0">正常</ElRadio>
                <ElRadio label="1">暂停</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="备注">
              <ElInput v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="submitForm">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import {
    fetchAddJob,
    fetchChangeJobStatus,
    fetchDeleteJob,
    fetchGetJobDetail,
    fetchGetJobList,
    fetchRunJob,
    fetchUpdateJob
  } from '@/api/system-manage'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { ElMessage, ElMessageBox, ElSwitch, FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'Job' })

  type JobListItem = Api.SystemManage.JobListItem
  type JobForm = Api.SystemManage.JobForm

  const jobGroupOptions = [
    { label: '默认', value: 'DEFAULT' },
    { label: '系统', value: 'SYSTEM' }
  ]

  const defaultForm = (): JobForm => ({
    jobName: '',
    jobGroup: 'DEFAULT',
    invokeTarget: '',
    cronExpression: '',
    misfirePolicy: '1',
    concurrent: '1',
    status: '0',
    remark: ''
  })

  const showSearchBar = ref(false)
  const dialogVisible = ref(false)
  const submitLoading = ref(false)
  const formRef = ref<FormInstance>()
  const form = ref<JobForm>(defaultForm())
  const dialogTitle = computed(() => (form.value.jobId ? '修改定时任务' : '新增定时任务'))

  const rules: FormRules<JobForm> = {
    jobName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
    jobGroup: [{ required: true, message: '请选择任务分组', trigger: 'change' }],
    invokeTarget: [{ required: true, message: '请输入调用方法', trigger: 'blur' }],
    cronExpression: [{ required: true, message: '请输入 Cron 表达式', trigger: 'blur' }],
    misfirePolicy: [{ required: true, message: '请选择执行策略', trigger: 'change' }],
    concurrent: [{ required: true, message: '请选择是否并发', trigger: 'change' }]
  }

  const searchForm = ref<Api.SystemManage.JobSearchParams>({
    jobName: undefined,
    jobGroup: undefined,
    status: undefined
  })

  const searchItems = computed(() => [
    {
      label: '任务名称',
      key: 'jobName',
      type: 'input',
      props: { placeholder: '请输入任务名称', clearable: true }
    },
    {
      label: '任务组名',
      key: 'jobGroup',
      type: 'select',
      props: { placeholder: '请选择任务组名', clearable: true, options: jobGroupOptions }
    },
    {
      label: '任务状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择任务状态',
        clearable: true,
        options: [
          { label: '正常', value: '0' },
          { label: '暂停', value: '1' }
        ]
      }
    }
  ])

  const getJobGroupText = (value: string) =>
    jobGroupOptions.find((item) => item.value === value)?.label || value

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
      apiFn: fetchGetJobList,
      apiParams: { pageNum: 1, pageSize: 10 },
      paginationKey: {
        current: 'pageNum',
        size: 'pageSize'
      },
      columnsFactory: () => [
        { prop: 'jobId', label: '任务编号', width: 100 },
        { prop: 'jobName', label: '任务名称', minWidth: 150, showOverflowTooltip: true },
        {
          prop: 'jobGroup',
          label: '任务组名',
          width: 110,
          formatter: (row: JobListItem) => getJobGroupText(row.jobGroup)
        },
        { prop: 'invokeTarget', label: '调用目标字符串', minWidth: 220, showOverflowTooltip: true },
        { prop: 'cronExpression', label: 'Cron 表达式', minWidth: 150, showOverflowTooltip: true },
        {
          prop: 'status',
          label: '状态',
          width: 90,
          formatter: (row: JobListItem) =>
            h(ElSwitch, {
              modelValue: row.status,
              activeValue: '0',
              inactiveValue: '1',
              beforeChange: () => changeStatus(row)
            })
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 180,
          formatter: (row: JobListItem) => row.createTime || '-'
        },
        {
          prop: 'operation',
          label: '操作',
          width: 190,
          fixed: 'right',
          formatter: (row: JobListItem) =>
            h('div', { class: 'flex gap-1' }, [
              h(ArtButtonTable, { type: 'edit', onClick: () => openDialog('edit', row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => deleteJob(row) }),
              h(ArtButtonTable, {
                icon: 'ri:play-circle-line',
                iconClass: 'bg-success/12 text-success',
                onClick: () => runJob(row)
              }),
              h(ArtButtonTable, { type: 'view', onClick: () => showDetail(row) })
            ])
        }
      ]
    }
  })

  const openDialog = async (mode: 'add' | 'edit', row?: JobListItem) => {
    form.value = defaultForm()
    dialogVisible.value = true
    await nextTick()
    formRef.value?.clearValidate()

    if (mode === 'edit' && row?.jobId) {
      form.value = {
        ...defaultForm(),
        ...(await fetchGetJobDetail(row.jobId)),
        status: row.status
      }
    }
  }

  const submitForm = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    submitLoading.value = true
    try {
      if (form.value.jobId) {
        await fetchUpdateJob(form.value)
        ElMessage.success('修改成功')
      } else {
        await fetchAddJob(form.value)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      refreshData()
    } finally {
      submitLoading.value = false
    }
  }

  const changeStatus = async (row: JobListItem) => {
    const nextStatus: Api.SystemManage.JobStatus = row.status === '0' ? '1' : '0'
    await ElMessageBox.confirm(
      `确定${nextStatus === '0' ? '启用' : '暂停'}任务"${row.jobName}"吗？`,
      '状态确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await fetchChangeJobStatus(row.jobId, nextStatus)
    row.status = nextStatus
    ElMessage.success('状态修改成功')
    return true
  }

  const runJob = (row: JobListItem) => {
    ElMessageBox.confirm(`确定立即执行一次任务"${row.jobName}"吗？`, '执行确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchRunJob(row.jobId, row.jobGroup)
      ElMessage.success('执行成功')
    })
  }

  const deleteJob = (row: JobListItem) => {
    ElMessageBox.confirm(`确定删除任务"${row.jobName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteJob(row.jobId)
      ElMessage.success('删除成功')
      refreshData()
    })
  }

  const showDetail = (row: JobListItem) => {
    ElMessage({
      type: 'info',
      dangerouslyUseHTMLString: true,
      message: `<div>调用目标：${row.invokeTarget}</div><div>Cron：${row.cronExpression}</div>`
    })
  }

  const handleSearch = (params: Api.SystemManage.JobSearchParams) => {
    replaceSearchParams(params)
    getData()
  }

  const handleReset = () => {
    resetSearchParams()
  }
</script>
