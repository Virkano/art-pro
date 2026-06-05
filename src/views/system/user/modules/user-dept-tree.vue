<template>
  <div class="dept-panel">
    <div class="dept-panel__header">
      <span class="dept-panel__title">部门列表</span>
      <ElButton text circle title="刷新部门" @click="loadDeptTree">
        <ArtSvgIcon icon="ri:refresh-line" />
      </ElButton>
    </div>

    <ElInput
      v-model="filterText"
      clearable
      placeholder="输入部门名称"
      prefix-icon="Search"
      class="mb-3"
    />

    <ElScrollbar v-loading="loading" class="dept-panel__scrollbar">
      <button
        type="button"
        class="dept-panel__all"
        :class="{ 'is-active': modelValue === undefined }"
        @click="selectDept(undefined, '全部部门')"
      >
        <ArtSvgIcon icon="ri:organization-chart" />
        <span>全部部门</span>
      </button>

      <ElTree
        ref="treeRef"
        :data="deptTree"
        node-key="id"
        default-expand-all
        highlight-current
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        :props="{ children: 'children', label: 'label' }"
        @node-click="handleNodeClick"
      />
    </ElScrollbar>
  </div>
</template>

<script setup lang="ts">
  import type { ElTree } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { fetchGetUserDeptTree } from '@/api/system-manage'

  type MenuTreeNode = Api.SystemManage.MenuTreeNode
  type TreeInstance = InstanceType<typeof ElTree>

  interface Emits {
    (e: 'update:modelValue', value?: number): void
    (e: 'change', value?: number, label?: string): void
  }

  defineProps<{
    modelValue?: number
  }>()

  const emit = defineEmits<Emits>()

  const treeRef = ref<TreeInstance>()
  const deptTree = ref<MenuTreeNode[]>([])
  const filterText = ref('')
  const loading = ref(false)

  watch(filterText, (value) => {
    treeRef.value?.filter(value)
  })

  const filterNode = (value: string, data: Record<string, any>) => {
    if (!value) return true
    return String(data.label ?? '')
      .toLowerCase()
      .includes(value.toLowerCase())
  }

  const selectDept = (deptId?: number, label?: string) => {
    if (deptId === undefined) {
      treeRef.value?.setCurrentKey(undefined)
    }
    emit('update:modelValue', deptId)
    emit('change', deptId, label)
  }

  const handleNodeClick = (node: MenuTreeNode) => {
    selectDept(node.id, node.label)
  }

  const loadDeptTree = async () => {
    loading.value = true
    try {
      deptTree.value = await fetchGetUserDeptTree()
    } finally {
      loading.value = false
    }
  }

  onMounted(loadDeptTree)
</script>

<style scoped>
  .dept-panel {
    display: flex;
    height: 100%;
    min-height: 0;
    flex-direction: column;
  }

  .dept-panel__header {
    display: flex;
    min-height: 32px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .dept-panel__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--art-text-gray-900);
  }

  .dept-panel__scrollbar {
    flex: 1;
    min-height: 0;
  }

  .dept-panel__all {
    display: flex;
    width: 100%;
    height: 32px;
    align-items: center;
    gap: 8px;
    padding: 0 8px;
    margin-bottom: 4px;
    color: var(--art-text-gray-700);
    cursor: pointer;
    background: transparent;
    border: 0;
  }

  .dept-panel__all:hover,
  .dept-panel__all.is-active {
    color: var(--main-color);
    background: var(--art-gray-200);
  }
</style>
