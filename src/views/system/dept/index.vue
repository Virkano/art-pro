<!-- 部门管理页面 -->
<template>
  <div class="art-full-height">
    <ArtSearchBar
      v-show="showSearchBar"
      v-model="searchForm"
      :items="searchItems"
      :showExpand="false"
      @reset="handleReset"
      @search="handleSearch"
    />

    <ElCard class="art-table-card" :style="{ 'margin-top': showSearchBar ? '12px' : '0' }">
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="getDeptList"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="openDialog('add')" v-ripple>新增部门</ElButton>
            <ElButton @click="toggleExpand" v-ripple>{{ isExpanded ? '收起' : '展开' }}</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        v-if="refreshTable"
        row-key="deptId"
        :loading="loading"
        :columns="columns"
        :data="deptList"
        :stripe="false"
        :default-expand-all="isExpanded"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      />
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增部门' : '编辑部门'"
      width="560px"
      align-center
      @close="resetForm"
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="92px">
        <ElFormItem label="上级部门" prop="parentId">
          <ElTreeSelect
            v-model="form.parentId"
            :data="deptTree"
            :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
            value-key="deptId"
            check-strictly
            placeholder="请选择上级部门"
          />
        </ElFormItem>
        <ElFormItem label="部门名称" prop="deptName">
          <ElInput v-model="form.deptName" placeholder="请输入部门名称" />
        </ElFormItem>
        <ElFormItem label="显示排序" prop="orderNum">
          <ElInputNumber v-model="form.orderNum" :min="0" controls-position="right" />
        </ElFormItem>
        <ElFormItem label="负责人" prop="leader">
          <ElInput v-model="form.leader" placeholder="请输入负责人" />
        </ElFormItem>
        <ElFormItem label="联系电话" prop="phone">
          <ElInput v-model="form.phone" placeholder="请输入联系电话" />
        </ElFormItem>
        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="form.email" placeholder="请输入邮箱" />
        </ElFormItem>
        <ElFormItem label="部门状态" prop="status">
          <ElRadioGroup v-model="form.status">
            <ElRadio value="0">正常</ElRadio>
            <ElRadio value="1">停用</ElRadio>
          </ElRadioGroup>
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
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import {
    fetchAddDept,
    fetchDeleteDept,
    fetchGetDeptDetail,
    fetchGetDeptExcludeList,
    fetchGetDeptList,
    fetchUpdateDept
  } from '@/api/system-manage'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'

  defineOptions({ name: 'Dept' })

  type DeptListItem = Api.SystemManage.DeptListItem
  type DeptForm = Api.SystemManage.DeptForm

  const loading = ref(false)
  const submitLoading = ref(false)
  const showSearchBar = ref(false)
  const isExpanded = ref(true)
  const refreshTable = ref(true)
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInstance>()
  const deptList = ref<DeptListItem[]>([])
  const deptTree = ref<DeptListItem[]>([])

  const searchForm = ref<Api.SystemManage.DeptSearchParams>({
    deptName: undefined,
    status: undefined
  })

  const searchItems = computed(() => [
    {
      label: '部门名称',
      key: 'deptName',
      type: 'input',
      props: { placeholder: '请输入部门名称', clearable: true }
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
          { label: '停用', value: '1' }
        ]
      }
    }
  ])

  const defaultForm = (): DeptForm => ({
    deptId: undefined,
    parentId: 0,
    deptName: '',
    orderNum: 0,
    leader: '',
    phone: '',
    email: '',
    status: '0'
  })

  const form = reactive<DeptForm>(defaultForm())

  const rules = reactive<FormRules>({
    deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
    orderNum: [{ required: true, message: '请输入显示排序', trigger: 'blur' }]
  })

  const normalizeStatus = (status?: string) => (status?.trim() === '0' ? '0' : '1')

  const { columnChecks, columns } = useTableColumns<DeptListItem>(() => [
    { prop: 'deptName', label: '部门名称', minWidth: 180 },
    { prop: 'orderNum', label: '排序', width: 90 },
    { prop: 'leader', label: '负责人', minWidth: 100 },
    { prop: 'phone', label: '联系电话', minWidth: 120 },
    {
      prop: 'status',
      label: '状态',
      width: 90,
      formatter: (row) => {
        const normal = normalizeStatus(row.status) === '0'
        return h(ElTag, { type: normal ? 'success' : 'danger' }, () => (normal ? '正常' : '停用'))
      }
    },
    { prop: 'createTime', label: '创建时间', width: 180 },
    {
      prop: 'operation',
      label: '操作',
      width: 150,
      fixed: 'right',
      formatter: (row) =>
        h('div', { class: 'flex gap-1' }, [
          h(ArtButtonTable, { type: 'add', onClick: () => openDialog('add', row) }),
          h(ArtButtonTable, { type: 'edit', onClick: () => openDialog('edit', row) }),
          h(ArtButtonTable, { type: 'delete', onClick: () => deleteDept(row) })
        ])
    }
  ])

  const getDeptList = async () => {
    loading.value = true
    try {
      deptList.value = await fetchGetDeptList(searchForm.value)
    } finally {
      loading.value = false
    }
  }

  const toggleExpand = () => {
    refreshTable.value = false
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      refreshTable.value = true
    })
  }

  const resetForm = () => {
    Object.assign(form, defaultForm())
    formRef.value?.clearValidate()
  }

  const openDialog = async (type: 'add' | 'edit', row?: DeptListItem) => {
    resetForm()
    dialogType.value = type
    deptTree.value =
      type === 'edit' && row?.deptId ? await fetchGetDeptExcludeList(row.deptId) : deptList.value

    if (type === 'add') {
      form.parentId = row?.deptId ?? 0
      dialogVisible.value = true
      return
    }

    if (!row?.deptId) return
    const detail = await fetchGetDeptDetail(row.deptId)
    Object.assign(form, {
      ...defaultForm(),
      ...detail,
      status: normalizeStatus(detail.status)
    })
    dialogVisible.value = true
  }

  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate()
    submitLoading.value = true
    try {
      if (form.deptId) {
        await fetchUpdateDept(form)
        ElMessage.success('修改成功')
      } else {
        await fetchAddDept(form)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      getDeptList()
    } finally {
      submitLoading.value = false
    }
  }

  const deleteDept = (row: DeptListItem) => {
    ElMessageBox.confirm(`确定删除部门"${row.deptName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteDept(row.deptId)
      ElMessage.success('删除成功')
      getDeptList()
    })
  }

  const handleSearch = (params: Api.SystemManage.DeptSearchParams) => {
    searchForm.value = params
    getDeptList()
  }

  const handleReset = () => {
    searchForm.value = {}
    getDeptList()
  }

  onMounted(() => {
    getDeptList()
  })
</script>
