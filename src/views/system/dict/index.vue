<!-- 字典类型管理页面 -->
<template>
  <div class="art-full-height">
    <DictTypeSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="handleReset"
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
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增字典类型</ElButton>
            <ElButton type="warning" @click="handleRefreshCache" v-ripple>刷新缓存</ElButton>
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

      <DictTypeDialog
        v-model="dialogVisible"
        :dialog-type="dialogType"
        :dict-data="currentDictData"
        @success="handleDialogSuccess"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetDictTypeList, fetchDeleteDictType, fetchRefreshDictCache } from '@/api/system-manage'
  import { useRouter } from 'vue-router'
  import DictTypeSearch from './modules/dict-type-search.vue'
  import DictTypeDialog from './modules/dict-type-dialog.vue'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'

  defineOptions({ name: 'DictType' })

  type DictTypeListItem = Api.SystemManage.DictTypeListItem

  const router = useRouter()

  // 搜索表单
  const searchForm = ref<Api.SystemManage.DictTypeSearchParams>({
    dictName: undefined,
    dictType: undefined,
    status: undefined
  })

  const showSearchBar = ref(false)

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentDictData = ref<DictTypeListItem | undefined>(undefined)

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
      apiFn: fetchGetDictTypeList,
      apiParams: {
        pageNum: 1,
        pageSize: 10
      },
      paginationKey: {
        current: 'pageNum',
        size: 'pageSize'
      },
      columnsFactory: () => [
        {
          prop: 'dictId',
          label: '字典编号',
          width: 100
        },
        {
          prop: 'dictName',
          label: '字典名称',
          minWidth: 120
        },
        {
          prop: 'dictType',
          label: '字典类型',
          minWidth: 150,
          formatter: (row: DictTypeListItem) => {
            return h('a', {
              href: 'javascript:void(0)',
              class: 'link-type',
              onClick: () => handleViewData(row)
            }, row.dictType)
          }
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: DictTypeListItem) => {
            const statusConfig =
              row.status === '0'
                ? { type: 'success' as const, text: '正常' }
                : { type: 'danger' as const, text: '停用' }
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 150,
          showOverflowTooltip: true
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 180,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 180,
          fixed: 'right',
          formatter: (row: DictTypeListItem) =>
            h('div', { class: 'flex gap-1' }, [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'view',
                onClick: () => handleViewData(row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteDict(row)
              })
            ])
        }
      ]
    }
  })

  const showDialog = (type: 'add' | 'edit', row?: DictTypeListItem) => {
    dialogVisible.value = true
    dialogType.value = type
    currentDictData.value = row
  }

  const handleViewData = (row: DictTypeListItem) => {
    router.push({
      path: `/system/dict-data/index/${row.dictId}`,
      query: { dictType: row.dictType, dictName: row.dictName }
    })
  }

  const handleSearch = (params: Api.SystemManage.DictTypeSearchParams) => {
    replaceSearchParams(params)
    getData()
  }

  const handleReset = () => {
    resetSearchParams()
  }

  const handleDialogSuccess = () => {
    refreshData()
  }

  const handleRefreshCache = () => {
    ElMessageBox.confirm('确定要刷新字典缓存吗？', '刷新缓存', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          await fetchRefreshDictCache()
          ElMessage.success('刷新成功')
        } catch {
          ElMessage.error('刷新失败')
        }
      })
      .catch(() => {
        ElMessage.info('已取消')
      })
  }

  const deleteDict = (row: DictTypeListItem) => {
    ElMessageBox.confirm(`确定删除字典类型"${row.dictName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          await fetchDeleteDictType(row.dictId)
          ElMessage.success('删除成功')
          refreshData()
        } catch {
          ElMessage.error('删除失败')
        }
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }
</script>
