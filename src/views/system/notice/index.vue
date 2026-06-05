<!-- 通知公告页面 -->
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
            <ElButton type="primary" @click="openDialog('add')" v-ripple>新增公告</ElButton>
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

    <ElDialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增公告' : '编辑公告'"
      width="720px"
      align-center
      @close="resetForm"
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="96px">
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="公告标题" prop="noticeTitle">
              <ElInput v-model="form.noticeTitle" placeholder="请输入公告标题" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="公告类型" prop="noticeType">
              <ElSelect v-model="form.noticeType" class="w-full" placeholder="请选择公告类型">
                <ElOption
                  v-for="item in noticeTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="状态" prop="status">
              <ElRadioGroup v-model="form.status">
                <ElRadio value="0">正常</ElRadio>
                <ElRadio value="1">关闭</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="公告内容" prop="noticeContent">
              <ElInput
                v-model="form.noticeContent"
                type="textarea"
                :rows="8"
                placeholder="请输入公告内容"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="备注" prop="remark">
              <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="submitForm">确定</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="detailVisible" title="公告详情" width="640px" align-center>
      <div v-if="currentNotice" class="notice-detail">
        <div class="notice-detail__header">
          <h3>{{ currentNotice.noticeTitle }}</h3>
          <div class="notice-detail__meta">
            <ElTag :type="getNoticeTypeTag(currentNotice.noticeType).type">
              {{ getNoticeTypeTag(currentNotice.noticeType).text }}
            </ElTag>
            <ElTag :type="currentNotice.status === '0' ? 'success' : 'info'">
              {{ currentNotice.status === '0' ? '正常' : '关闭' }}
            </ElTag>
            <span>{{ currentNotice.createTime || '-' }}</span>
          </div>
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
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import {
    fetchAddNotice,
    fetchDeleteNotice,
    fetchGetNoticeDetail,
    fetchGetNoticeList,
    fetchUpdateNotice
  } from '@/api/system-manage'
  import { ElButton, ElMessage, ElMessageBox, ElTag } from 'element-plus'

  defineOptions({ name: 'Notice' })

  type NoticeListItem = Api.SystemManage.NoticeListItem
  type NoticeForm = Api.SystemManage.NoticeForm
  type NoticeType = Api.SystemManage.NoticeType

  const noticeTypeOptions: Array<{ label: string; value: NoticeType }> = [
    { label: '通知', value: '1' },
    { label: '公告', value: '2' }
  ]

  const showSearchBar = ref(false)
  const dialogVisible = ref(false)
  const detailVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const submitLoading = ref(false)
  const formRef = ref<FormInstance>()
  const currentNotice = ref<NoticeListItem>()

  const searchForm = ref<Api.SystemManage.NoticeSearchParams>({
    noticeTitle: undefined,
    noticeType: undefined,
    status: undefined,
    createBy: undefined
  })

  const searchItems = computed(() => [
    {
      label: '公告标题',
      key: 'noticeTitle',
      type: 'input',
      props: { placeholder: '请输入公告标题', clearable: true }
    },
    {
      label: '操作人员',
      key: 'createBy',
      type: 'input',
      props: { placeholder: '请输入操作人员', clearable: true }
    },
    {
      label: '公告类型',
      key: 'noticeType',
      type: 'select',
      props: { placeholder: '请选择公告类型', clearable: true, options: noticeTypeOptions }
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
          { label: '关闭', value: '1' }
        ]
      }
    }
  ])

  const defaultForm = (): NoticeForm => ({
    noticeId: undefined,
    noticeTitle: '',
    noticeType: '1',
    noticeContent: '',
    status: '0',
    remark: ''
  })

  const form = reactive<NoticeForm>(defaultForm())

  const rules = reactive<FormRules>({
    noticeTitle: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
    noticeType: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
    noticeContent: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
  })

  const getNoticeTypeTag = (type: NoticeType) =>
    type === '2'
      ? { type: 'warning' as const, text: '公告' }
      : { type: 'primary' as const, text: '通知' }

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
      apiFn: fetchGetNoticeList,
      apiParams: {
        pageNum: 1,
        pageSize: 10
      },
      paginationKey: {
        current: 'pageNum',
        size: 'pageSize'
      },
      columnsFactory: () => [
        { prop: 'noticeId', label: '公告编号', width: 100 },
        {
          prop: 'noticeTitle',
          label: '公告标题',
          minWidth: 220,
          showOverflowTooltip: true,
          formatter: (row: NoticeListItem) =>
            h(
              ElButton,
              {
                link: true,
                type: 'primary',
                onClick: () => openDetail(row)
              },
              () => row.noticeTitle
            )
        },
        {
          prop: 'noticeType',
          label: '公告类型',
          width: 100,
          formatter: (row: NoticeListItem) => {
            const tag = getNoticeTypeTag(row.noticeType)
            return h(ElTag, { type: tag.type }, () => tag.text)
          }
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: NoticeListItem) =>
            h(ElTag, { type: row.status === '0' ? 'success' : 'info' }, () =>
              row.status === '0' ? '正常' : '关闭'
            )
        },
        { prop: 'createBy', label: '创建者', width: 120 },
        { prop: 'createTime', label: '创建时间', width: 180 },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: NoticeListItem) =>
            h('div', { class: 'flex gap-1' }, [
              h(ArtButtonTable, { type: 'edit', onClick: () => openDialog('edit', row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => deleteNotice(row) })
            ])
        }
      ]
    }
  })

  const resetForm = () => {
    Object.assign(form, defaultForm())
    formRef.value?.clearValidate()
  }

  const openDialog = async (type: 'add' | 'edit', row?: NoticeListItem) => {
    resetForm()
    dialogType.value = type

    if (type === 'edit' && row?.noticeId) {
      const detail = await fetchGetNoticeDetail(row.noticeId)
      Object.assign(form, {
        ...defaultForm(),
        ...detail
      })
    }

    dialogVisible.value = true
  }

  const openDetail = async (row: NoticeListItem) => {
    currentNotice.value = await fetchGetNoticeDetail(row.noticeId)
    detailVisible.value = true
  }

  const submitForm = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      submitLoading.value = true

      if (dialogType.value === 'add') {
        await fetchAddNotice(form)
        ElMessage.success('新增成功')
      } else {
        await fetchUpdateNotice(form)
        ElMessage.success('修改成功')
      }

      dialogVisible.value = false
      refreshData()
    } finally {
      submitLoading.value = false
    }
  }

  const deleteNotice = (row: NoticeListItem) => {
    ElMessageBox.confirm(`确定删除公告"${row.noticeTitle}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await fetchDeleteNotice(row.noticeId)
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }

  const handleSearch = (params: Api.SystemManage.NoticeSearchParams) => {
    replaceSearchParams(params)
    getData()
  }

  const handleReset = () => {
    resetSearchParams()
  }
</script>

<style scoped lang="scss">
  .notice-detail {
    &__header {
      h3 {
        margin: 0 0 12px;
        font-size: 18px;
        font-weight: 600;
        color: var(--art-text-gray-900);
      }
    }

    &__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      font-size: 13px;
      color: var(--art-text-gray-500);
    }

    &__content {
      min-height: 120px;
      line-height: 1.8;
      white-space: pre-wrap;
      color: var(--art-text-gray-800);
    }
  }
</style>
