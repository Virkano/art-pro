<!-- 在线用户 -->
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
      />

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { fetchForceLogoutOnlineUser, fetchGetOnlineUserList } from '@/api/system-manage'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { ElMessage, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'Online' })

  type OnlineUserListItem = Api.SystemManage.OnlineUserListItem

  const showSearchBar = ref(false)
  const searchForm = ref<Api.SystemManage.OnlineUserSearchParams>({
    ipaddr: undefined,
    userName: undefined
  })

  const searchItems = computed(() => [
    {
      label: '登录地址',
      key: 'ipaddr',
      type: 'input',
      props: { placeholder: '请输入登录地址', clearable: true }
    },
    {
      label: '用户名称',
      key: 'userName',
      type: 'input',
      props: { placeholder: '请输入用户名称', clearable: true }
    }
  ])

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
      apiFn: fetchGetOnlineUserList,
      apiParams: { pageNum: 1, pageSize: 10 },
      paginationKey: {
        current: 'pageNum',
        size: 'pageSize'
      },
      columnsFactory: () => [
        { prop: 'tokenId', label: '会话编号', minWidth: 220, showOverflowTooltip: true },
        { prop: 'userName', label: '登录名称', width: 120, showOverflowTooltip: true },
        { prop: 'deptName', label: '部门名称', width: 140, showOverflowTooltip: true },
        { prop: 'ipaddr', label: '主机', width: 140, showOverflowTooltip: true },
        { prop: 'loginLocation', label: '登录地点', width: 150, showOverflowTooltip: true },
        { prop: 'browser', label: '浏览器', width: 140, showOverflowTooltip: true },
        { prop: 'os', label: '操作系统', width: 150, showOverflowTooltip: true },
        { prop: 'loginTime', label: '登录时间', width: 180 },
        {
          prop: 'operation',
          label: '操作',
          width: 90,
          fixed: 'right',
          formatter: (row: OnlineUserListItem) =>
            h(ArtButtonTable, {
              icon: 'ri:logout-box-r-line',
              iconClass: 'bg-error/12 text-error',
              onClick: () => forceLogout(row)
            })
        }
      ]
    }
  })

  const forceLogout = (row: OnlineUserListItem) => {
    ElMessageBox.confirm(`确定强退用户"${row.userName || row.tokenId}"吗？`, '强退确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await fetchForceLogoutOnlineUser(row.tokenId)
        ElMessage.success('强退成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.info('已取消强退')
      })
  }

  const handleSearch = (params: Api.SystemManage.OnlineUserSearchParams) => {
    replaceSearchParams(params)
    getData()
  }

  const handleReset = () => {
    resetSearchParams()
  }
</script>
