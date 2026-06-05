<!-- 参数设置页面 -->
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
            <ElButton type="primary" @click="openDialog('add')" v-ripple>新增参数</ElButton>
            <ElButton type="warning" @click="refreshCache" v-ripple>刷新缓存</ElButton>
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
      :title="dialogType === 'add' ? '新增参数' : '编辑参数'"
      width="560px"
      align-center
      @close="resetForm"
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="96px">
        <ElFormItem label="参数名称" prop="configName">
          <ElInput v-model="form.configName" placeholder="请输入参数名称" />
        </ElFormItem>
        <ElFormItem label="参数键名" prop="configKey">
          <ElInput v-model="form.configKey" placeholder="请输入参数键名" />
        </ElFormItem>
        <ElFormItem label="参数键值" prop="configValue">
          <ElInput v-model="form.configValue" placeholder="请输入参数键值" />
        </ElFormItem>
        <ElFormItem label="系统内置" prop="configType">
          <ElRadioGroup v-model="form.configType">
            <ElRadio value="Y">是</ElRadio>
            <ElRadio value="N">否</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="备注" prop="remark">
          <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="submitForm">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import {
    fetchAddConfig,
    fetchDeleteConfig,
    fetchGetConfigDetail,
    fetchGetConfigList,
    fetchRefreshConfigCache,
    fetchUpdateConfig
  } from '@/api/system-manage'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'

  defineOptions({ name: 'Config' })

  type ConfigListItem = Api.SystemManage.ConfigListItem
  type ConfigForm = Api.SystemManage.ConfigForm

  const showSearchBar = ref(false)
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const submitLoading = ref(false)
  const formRef = ref<FormInstance>()

  const searchForm = ref<Api.SystemManage.ConfigSearchParams>({
    configName: undefined,
    configKey: undefined,
    configType: undefined
  })

  const searchItems = computed(() => [
    {
      label: '参数名称',
      key: 'configName',
      type: 'input',
      props: { placeholder: '请输入参数名称', clearable: true }
    },
    {
      label: '参数键名',
      key: 'configKey',
      type: 'input',
      props: { placeholder: '请输入参数键名', clearable: true }
    },
    {
      label: '系统内置',
      key: 'configType',
      type: 'select',
      props: {
        placeholder: '请选择',
        clearable: true,
        options: [
          { label: '是', value: 'Y' },
          { label: '否', value: 'N' }
        ]
      }
    }
  ])

  const defaultForm = (): ConfigForm => ({
    configId: undefined,
    configName: '',
    configKey: '',
    configValue: '',
    configType: 'N',
    remark: ''
  })

  const form = reactive<ConfigForm>(defaultForm())

  const rules = reactive<FormRules>({
    configName: [{ required: true, message: '请输入参数名称', trigger: 'blur' }],
    configKey: [{ required: true, message: '请输入参数键名', trigger: 'blur' }],
    configValue: [{ required: true, message: '请输入参数键值', trigger: 'blur' }]
  })

  const normalizeConfigType = (value?: string) => (value?.trim() === 'Y' ? 'Y' : 'N')

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
      apiFn: fetchGetConfigList,
      apiParams: {
        pageNum: 1,
        pageSize: 10
      },
      paginationKey: {
        current: 'pageNum',
        size: 'pageSize'
      },
      columnsFactory: () => [
        { prop: 'configId', label: '参数编号', width: 100 },
        { prop: 'configName', label: '参数名称', minWidth: 180, showOverflowTooltip: true },
        { prop: 'configKey', label: '参数键名', minWidth: 180, showOverflowTooltip: true },
        { prop: 'configValue', label: '参数键值', minWidth: 160, showOverflowTooltip: true },
        {
          prop: 'configType',
          label: '系统内置',
          width: 100,
          formatter: (row: ConfigListItem) => {
            const builtIn = normalizeConfigType(row.configType) === 'Y'
            return h(ElTag, { type: builtIn ? 'success' : 'info' }, () => (builtIn ? '是' : '否'))
          }
        },
        { prop: 'remark', label: '备注', minWidth: 180, showOverflowTooltip: true },
        { prop: 'createTime', label: '创建时间', width: 180 },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: ConfigListItem) =>
            h('div', { class: 'flex gap-1' }, [
              h(ArtButtonTable, { type: 'edit', onClick: () => openDialog('edit', row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => deleteConfig(row) })
            ])
        }
      ]
    }
  })

  const resetForm = () => {
    Object.assign(form, defaultForm())
    formRef.value?.clearValidate()
  }

  const openDialog = async (type: 'add' | 'edit', row?: ConfigListItem) => {
    resetForm()
    dialogType.value = type

    if (type === 'edit' && row?.configId) {
      const detail = await fetchGetConfigDetail(row.configId)
      Object.assign(form, {
        ...defaultForm(),
        ...detail,
        configType: normalizeConfigType(detail.configType)
      })
    }

    dialogVisible.value = true
  }

  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate()
    submitLoading.value = true
    try {
      if (form.configId) {
        await fetchUpdateConfig(form)
        ElMessage.success('修改成功')
      } else {
        await fetchAddConfig(form)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      refreshData()
    } finally {
      submitLoading.value = false
    }
  }

  const deleteConfig = (row: ConfigListItem) => {
    ElMessageBox.confirm(`确定删除参数"${row.configName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteConfig(row.configId)
      ElMessage.success('删除成功')
      refreshData()
    })
  }

  const refreshCache = () => {
    ElMessageBox.confirm('确定刷新参数缓存吗？', '刷新缓存', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchRefreshConfigCache()
      ElMessage.success('刷新成功')
    })
  }

  const handleSearch = (params: Api.SystemManage.ConfigSearchParams) => {
    replaceSearchParams(params)
    getData()
  }

  const handleReset = () => {
    resetSearchParams()
  }
</script>
