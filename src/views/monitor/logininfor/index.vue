<!-- 登录日志页面 -->
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
            <ElButton type="danger" @click="cleanLoginInfo" v-ripple>清空日志</ElButton>
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
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import {
    fetchCleanLoginInfo,
    fetchDeleteLoginInfo,
    fetchGetLoginInfoList,
    fetchUnlockLoginInfo
  } from '@/api/system-manage'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'

  defineOptions({ name: 'LoginInfo' })

  type LoginInfoListItem = Api.SystemManage.LoginInfoListItem

  const showSearchBar = ref(false)

  const searchForm = ref<Api.SystemManage.LoginInfoSearchParams>({
    ipaddr: undefined,
    userName: undefined,
    status: undefined
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
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { label: '成功', value: '0' },
          { label: '失败', value: '1' }
        ]
      }
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
      apiFn: fetchGetLoginInfoList,
      apiParams: {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'loginTime',
        isAsc: 'descending'
      },
      paginationKey: {
        current: 'pageNum',
        size: 'pageSize'
      },
      columnsFactory: () => [
        { prop: 'infoId', label: '访问编号', width: 100 },
        { prop: 'userName', label: '用户名称', width: 140, showOverflowTooltip: true },
        { prop: 'ipaddr', label: '登录地址', width: 140, showOverflowTooltip: true },
        { prop: 'loginLocation', label: '登录地点', minWidth: 150, showOverflowTooltip: true },
        { prop: 'browser', label: '浏览器', minWidth: 140, showOverflowTooltip: true },
        { prop: 'os', label: '操作系统', minWidth: 140, showOverflowTooltip: true },
        {
          prop: 'status',
          label: '状态',
          width: 90,
          formatter: (row: LoginInfoListItem) =>
            h(ElTag, { type: row.status === '0' ? 'success' : 'danger' }, () =>
              row.status === '0' ? '成功' : '失败'
            )
        },
        { prop: 'msg', label: '描述', minWidth: 180, showOverflowTooltip: true },
        { prop: 'loginTime', label: '访问时间', width: 180 },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: LoginInfoListItem) =>
            h('div', { class: 'flex gap-1' }, [
              h(ArtButtonTable, {
                icon: 'ri:lock-unlock-line',
                iconClass: 'bg-theme/12 text-theme',
                onClick: () => unlockLoginInfo(row)
              }),
              h(ArtButtonTable, { type: 'delete', onClick: () => deleteLoginInfo(row) })
            ])
        }
      ]
    }
  })

  const deleteLoginInfo = (row: LoginInfoListItem) => {
    ElMessageBox.confirm(`确定删除登录日志"${row.infoId}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await fetchDeleteLoginInfo(row.infoId)
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }

  const cleanLoginInfo = () => {
    ElMessageBox.confirm('确定清空所有登录日志吗？此操作不可恢复！', '清空确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await fetchCleanLoginInfo()
        ElMessage.success('清空成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.info('已取消清空')
      })
  }

  const unlockLoginInfo = (row: LoginInfoListItem) => {
    if (!row.userName) {
      ElMessage.warning('当前日志没有用户名称，无法解锁')
      return
    }

    ElMessageBox.confirm(`确定解锁用户"${row.userName}"吗？`, '解锁确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await fetchUnlockLoginInfo(row.userName!)
        ElMessage.success(`用户 ${row.userName} 解锁成功`)
      })
      .catch(() => {
        ElMessage.info('已取消解锁')
      })
  }

  const handleSearch = (params: Api.SystemManage.LoginInfoSearchParams) => {
    replaceSearchParams(params)
    getData()
  }

  const handleReset = () => {
    resetSearchParams()
  }
</script>
