<!-- 字典数据管理页面 -->
<template>
  <div class="art-full-height">
    <div class="dict-data-header">
      <ElSpace wrap>
        <ElText>字典类型：</ElText>
        <ElText tag="strong">{{ dictType }}</ElText>
        <ElTag v-if="dictName" size="small" type="info">{{ dictName }}</ElTag>
      </ElSpace>
      <ElButton @click="goBack" size="small">返回字典类型</ElButton>
    </div>

    <DictDataSearch
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
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增字典数据</ElButton>
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

      <DictDataDialog
        v-model="dialogVisible"
        :dialog-type="dialogType"
        :dict-data="currentDictData"
        :dict-type="dictType"
        @success="handleDialogSuccess"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchGetDictDataList,
    fetchDeleteDictData,
    fetchGetDictTypeDetail
  } from '@/api/system-manage'
  import { useRouter, useRoute } from 'vue-router'
  import DictDataSearch from './modules/dict-data-search.vue'
  import DictDataDialog from './modules/dict-data-dialog.vue'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'

  defineOptions({ name: 'DictData' })

  type DictDataListItem = Api.SystemManage.DictDataListItem

  const router = useRouter()
  const route = useRoute()

  const dictType = ref((route.query.dictType as string) || '')
  const dictName = ref((route.query.dictName as string) || '')
  const dictId = computed(() => Number(route.params.dictId || 0))

  // 搜索表单
  const searchForm = ref<Api.SystemManage.DictDataSearchParams>({
    dictType: dictType.value,
    dictLabel: undefined,
    status: undefined
  })

  const showSearchBar = ref(false)

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentDictData = ref<DictDataListItem | undefined>(undefined)

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
      apiFn: fetchGetDictDataList,
      apiParams: {
        pageNum: 1,
        pageSize: 10,
        dictType: ''
      },
      immediate: false,
      paginationKey: {
        current: 'pageNum',
        size: 'pageSize'
      },
      columnsFactory: () => [
        {
          prop: 'dictCode',
          label: '字典编码',
          width: 100
        },
        {
          prop: 'dictLabel',
          label: '字典标签',
          minWidth: 120,
          formatter: (row: DictDataListItem) => {
            const tagType = row.listClass && row.listClass !== 'default'
              ? (row.listClass === 'primary' ? '' : row.listClass)
              : ''
            return h(ElTag, { type: tagType as any }, () => row.dictLabel)
          }
        },
        {
          prop: 'dictValue',
          label: '字典键值',
          minWidth: 100
        },
        {
          prop: 'dictSort',
          label: '字典排序',
          width: 100
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: DictDataListItem) => {
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
          width: 120,
          fixed: 'right',
          formatter: (row: DictDataListItem) =>
            h('div', { class: 'flex gap-1' }, [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteDictData(row)
              })
            ])
        }
      ]
    }
  })

  const showDialog = (type: 'add' | 'edit', row?: DictDataListItem) => {
    dialogVisible.value = true
    dialogType.value = type
    currentDictData.value = row
  }

  const goBack = () => {
    router.push('/system/dict')
  }

  const handleSearch = (params: Api.SystemManage.DictDataSearchParams) => {
    replaceSearchParams({ ...params, dictType: dictType.value })
    getData()
  }

  const handleReset = () => {
    resetSearchParams()
    replaceSearchParams({
      pageNum: 1,
      pageSize: 10,
      dictType: dictType.value
    })
    getData()
  }

  const handleDialogSuccess = () => {
    refreshData()
  }

  const deleteDictData = (row: DictDataListItem) => {
    ElMessageBox.confirm(`确定删除字典数据"${row.dictLabel}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          await fetchDeleteDictData(row.dictCode)
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

  const initDictContext = async () => {
    if (!dictType.value && dictId.value) {
      const detail = await fetchGetDictTypeDetail(dictId.value)
      dictType.value = detail.dictType
      dictName.value = detail.dictName
    }

    searchForm.value.dictType = dictType.value
    replaceSearchParams({
      pageNum: 1,
      pageSize: 10,
      dictType: dictType.value
    })
    getData()
  }

  onMounted(() => {
    initDictContext()
  })
</script>

<style scoped>
.dict-data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
