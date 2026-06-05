<!-- 岗位管理页面 -->
<template>
  <div class="art-full-height">
    <PostSearch
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
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增岗位</ElButton>
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

      <PostDialog
        v-model="dialogVisible"
        :dialog-type="dialogType"
        :post-data="currentPostData"
        @success="handleDialogSuccess"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetPostList, fetchDeletePost } from '@/api/system-manage'
  import PostSearch from './modules/post-search.vue'
  import PostDialog from './modules/post-dialog.vue'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'

  defineOptions({ name: 'Post' })

  type PostListItem = Api.SystemManage.PostListItem

  // 搜索表单
  const searchForm = ref<Api.SystemManage.PostSearchParams>({
    postName: undefined,
    postCode: undefined,
    status: undefined
  })

  const showSearchBar = ref(false)

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentPostData = ref<PostListItem | undefined>(undefined)

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
      apiFn: fetchGetPostList,
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
          prop: 'postId',
          label: '岗位编号',
          width: 100
        },
        {
          prop: 'postName',
          label: '岗位名称',
          minWidth: 120
        },
        {
          prop: 'postCode',
          label: '岗位编码',
          minWidth: 120
        },
        {
          prop: 'postSort',
          label: '显示顺序',
          width: 100
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: PostListItem) => {
            const statusConfig =
              row.status === '0'
                ? { type: 'success' as const, text: '正常' }
                : { type: 'danger' as const, text: '停用' }
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
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
          formatter: (row: PostListItem) =>
            h('div', { class: 'flex gap-1' }, [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deletePost(row)
              })
            ])
        }
      ]
    }
  })

  const showDialog = (type: 'add' | 'edit', row?: PostListItem) => {
    dialogVisible.value = true
    dialogType.value = type
    currentPostData.value = row
  }

  const handleSearch = (params: Api.SystemManage.PostSearchParams) => {
    replaceSearchParams(params)
    getData()
  }

  const handleReset = () => {
    resetSearchParams()
  }

  const handleDialogSuccess = () => {
    refreshData()
  }

  const deletePost = (row: PostListItem) => {
    ElMessageBox.confirm(`确定删除岗位"${row.postName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          await fetchDeletePost(row.postId)
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