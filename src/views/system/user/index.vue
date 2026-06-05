<!-- 用户管理页面 -->
<template>
  <div class="user-page art-full-height">
    <div class="user-page__layout">
      <ElCard class="user-page__dept-card">
        <UserDeptTree v-model="selectedDeptId" @change="handleDeptChange" />
      </ElCard>

      <div class="user-page__content">
        <UserSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

        <ElCard class="art-table-card">
          <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
            <template #left>
              <ElSpace wrap>
                <ElButton type="primary" @click="showDialog('add')" v-ripple>新增用户</ElButton>
                <ElTag v-if="selectedDeptName" closable @close="handleDeptChange()">
                  {{ selectedDeptName }}
                </ElTag>
              </ElSpace>
            </template>
          </ArtTableHeader>

          <ArtTable
            :loading="loading"
            :data="data"
            :columns="columns"
            :pagination="pagination"
            @selection-change="handleSelectionChange"
            @pagination:size-change="handleSizeChange"
            @pagination:current-change="handleCurrentChange"
          />
        </ElCard>
      </div>
    </div>

    <UserDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :user-data="currentUserData"
      @submit="handleDialogSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchDeleteUser, fetchGetUserList } from '@/api/system-manage'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import UserDeptTree from './modules/user-dept-tree.vue'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { ElImage, ElMessageBox, ElTag } from 'element-plus'
  import { DialogType } from '@/types'
  import defaultAvatar from '@/assets/images/avatar/avatar.webp'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem
  type UserSearchParams = Api.SystemManage.UserSearchParams

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})
  const selectedRows = ref<UserListItem[]>([])
  const selectedDeptId = ref<number>()
  const selectedDeptName = ref('')

  const searchForm = ref<UserSearchParams>({
    userName: undefined,
    phonenumber: undefined,
    status: undefined
  })

  const getUserStatusTag = (status: Api.SystemManage.RuoYiStatus) =>
    status === '0'
      ? { type: 'success' as const, text: '正常' }
      : { type: 'danger' as const, text: '停用' }

  const getSexText = (sex?: string) => {
    if (sex === '0') return '男'
    if (sex === '1') return '女'
    return '未知'
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchGetUserList,
      apiParams: {
        pageNum: 1,
        pageSize: 20
      },
      paginationKey: {
        current: 'pageNum',
        size: 'pageSize'
      },
      columnsFactory: () => [
        { type: 'selection' },
        { prop: 'userId', label: '用户编号', width: 90 },
        {
          prop: 'userName',
          label: '用户名称',
          minWidth: 170,
          formatter: (row) =>
            h('div', { class: 'flex items-center gap-2' }, [
              h(ElImage, {
                class: 'size-8 rounded-md',
                src: defaultAvatar,
                previewSrcList: [defaultAvatar],
                previewTeleported: true,
                hideOnClickModal: true
              }),
              h('div', [
                h('p', { class: 'font-medium' }, row.userName),
                h('p', { class: 'text-xs text-g-500' }, row.nickName || '-')
              ])
            ])
        },
        { prop: 'deptName', label: '部门', minWidth: 140 },
        { prop: 'phonenumber', label: '手机号码', width: 130 },
        { prop: 'email', label: '邮箱', minWidth: 180, showOverflowTooltip: true },
        {
          prop: 'sex',
          label: '性别',
          width: 80,
          formatter: (row) => getSexText(row.sex)
        },
        {
          prop: 'status',
          label: '状态',
          width: 90,
          formatter: (row) => {
            const tag = getUserStatusTag(row.status)
            return h(ElTag, { type: tag.type }, () => tag.text)
          }
        },
        { prop: 'createTime', label: '创建时间', width: 180 },
        {
          prop: 'operation',
          label: '操作',
          width: 110,
          fixed: 'right',
          formatter: (row) =>
            h('div', { class: 'flex gap-1' }, [
              h(ArtButtonTable, { type: 'edit', onClick: () => showDialog('edit', row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => deleteUser(row) })
            ])
        }
      ]
    }
  })

  const buildSearchParams = (params: UserSearchParams = searchForm.value): UserSearchParams => ({
    ...params,
    deptId: selectedDeptId.value
  })

  const handleSearch = (params: UserSearchParams) => {
    searchForm.value = params
    replaceSearchParams(buildSearchParams(params))
    getData()
  }

  const handleReset = () => {
    searchForm.value = {}
    replaceSearchParams(buildSearchParams({}))
    getData()
  }

  const handleDeptChange = (deptId?: number, label = '') => {
    selectedDeptId.value = deptId
    selectedDeptName.value = deptId === undefined ? '' : label
    replaceSearchParams(buildSearchParams())
    getData()
  }

  const showDialog = (type: DialogType, row?: UserListItem) => {
    dialogType.value = type
    currentUserData.value = row || { deptId: selectedDeptId.value }
    dialogVisible.value = true
  }

  const deleteUser = (row: UserListItem) => {
    ElMessageBox.confirm(`确定删除用户“${row.userName}”吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteUser(row.userId)
      ElMessage.success('删除成功')
      refreshData()
    })
  }

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    currentUserData.value = {}
    refreshData()
  }

  const handleSelectionChange = (selection: UserListItem[]) => {
    selectedRows.value = selection
  }
</script>

<style scoped>
  .user-page__layout {
    display: grid;
    grid-template-columns: 230px minmax(0, 1fr);
    gap: 12px;
    height: 100%;
    min-height: 0;
  }

  .user-page__dept-card,
  .user-page__content {
    min-height: 0;
  }

  .user-page__dept-card :deep(.el-card__body) {
    height: 100%;
    padding: 16px 12px;
  }

  .user-page__content {
    display: flex;
    flex-direction: column;
  }

  .user-page__content .art-table-card {
    margin-top: 12px;
  }

  @media (max-width: 900px) {
    .user-page__layout {
      display: flex;
      height: auto;
      flex-direction: column;
    }

    .user-page__dept-card {
      height: 280px;
    }
  }
</style>
