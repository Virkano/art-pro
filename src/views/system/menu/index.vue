<!-- 菜单管理页面 -->
<template>
  <div class="menu-page art-full-height">
    <MenuSearch
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
        @refresh="getMenuList"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="openDialog('add')" v-ripple>新增菜单</ElButton>
            <ElButton @click="toggleExpand" v-ripple>{{ isExpanded ? '收起' : '展开' }}</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        v-if="refreshTable"
        row-key="menuId"
        :loading="loading"
        :columns="columns"
        :data="menuList"
        :stripe="false"
        :default-expand-all="isExpanded"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      />
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增菜单' : '编辑菜单'"
      width="720px"
      align-center
      @close="resetForm"
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="96px">
        <ElRow :gutter="16">
          <ElCol :span="24">
            <ElFormItem label="上级菜单" prop="parentId">
              <ElTreeSelect
                v-model="form.parentId"
                :data="menuTree"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="id"
                check-strictly
                clearable
                placeholder="请选择上级菜单"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="菜单类型" prop="menuType">
              <ElRadioGroup v-model="form.menuType">
                <ElRadio value="M">目录</ElRadio>
                <ElRadio value="C">菜单</ElRadio>
                <ElRadio value="F">按钮</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="菜单名称" prop="menuName">
              <ElInput v-model="form.menuName" placeholder="请输入菜单名称" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="显示排序" prop="orderNum">
              <ElInputNumber v-model="form.orderNum" :min="0" controls-position="right" />
            </ElFormItem>
          </ElCol>
          <ElCol v-if="form.menuType !== 'F'" :span="12">
            <ElFormItem label="路由地址" prop="path">
              <ElInput v-model="form.path" placeholder="如 system/user" />
            </ElFormItem>
          </ElCol>
          <ElCol v-if="form.menuType === 'C'" :span="12">
            <ElFormItem label="组件路径" prop="component">
              <ElInput v-model="form.component" placeholder="如 system/user/index" />
            </ElFormItem>
          </ElCol>
          <ElCol v-if="form.menuType !== 'M'" :span="12">
            <ElFormItem label="权限字符" prop="perms">
              <ElInput v-model="form.perms" placeholder="如 system:user:list" />
            </ElFormItem>
          </ElCol>
          <ElCol v-if="form.menuType !== 'F'" :span="12">
            <ElFormItem label="图标" prop="icon">
              <ElInput v-model="form.icon" placeholder="如 user / system / ri:user-line">
                <template #prefix>
                  <ArtSvgIcon class="text-base text-g-600" :icon="normalizeMenuIcon(form.icon)" />
                </template>
                <template #append>
                  <ElButton @click="iconPickerVisible = true">选择</ElButton>
                </template>
              </ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol v-if="form.menuType !== 'F'" :span="12">
            <ElFormItem label="是否外链" prop="isFrame">
              <ElRadioGroup v-model="form.isFrame">
                <ElRadio value="0">是</ElRadio>
                <ElRadio value="1">否</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol v-if="form.menuType === 'C'" :span="12">
            <ElFormItem label="是否缓存" prop="isCache">
              <ElRadioGroup v-model="form.isCache">
                <ElRadio value="0">缓存</ElRadio>
                <ElRadio value="1">不缓存</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol v-if="form.menuType !== 'F'" :span="12">
            <ElFormItem label="显示状态" prop="visible">
              <ElRadioGroup v-model="form.visible">
                <ElRadio value="0">显示</ElRadio>
                <ElRadio value="1">隐藏</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="菜单状态" prop="status">
              <ElRadioGroup v-model="form.status">
                <ElRadio value="0">正常</ElRadio>
                <ElRadio value="1">停用</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol v-if="form.menuType === 'C'" :span="24">
            <ElFormItem label="路由参数" prop="query">
              <ElInput v-model="form.query" placeholder='如 {"id":1}' />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="submitForm">确定</ElButton>
      </template>
    </ElDialog>

    <MenuIconPicker v-model="form.icon" v-model:visible="iconPickerVisible" />
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import MenuSearch from './modules/menu-search.vue'
  import MenuIconPicker from './modules/menu-icon-picker.vue'
  import { normalizeMenuIcon } from '@/utils/ui'
  import {
    fetchAddMenu,
    fetchDeleteMenu,
    fetchGetMenuDetail,
    fetchGetMenuList,
    fetchGetMenuTreeselect,
    fetchUpdateMenu
  } from '@/api/system-manage'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'

  defineOptions({ name: 'Menus' })

  type MenuListItem = Api.SystemManage.MenuListItem
  type MenuForm = Api.SystemManage.MenuForm
  type MenuTreeNode = Api.SystemManage.MenuTreeNode

  const loading = ref(false)
  const submitLoading = ref(false)
  const isExpanded = ref(false)
  const refreshTable = ref(true)
  const showSearchBar = ref(false)
  const dialogVisible = ref(false)
  const iconPickerVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInstance>()

  const menuList = ref<MenuListItem[]>([])
  const menuTree = ref<MenuTreeNode[]>([])
  const searchForm = ref<Api.SystemManage.MenuSearchParams>({
    menuName: undefined,
    status: undefined
  })

  const defaultForm = (): MenuForm => ({
    menuId: undefined,
    parentId: 0,
    menuName: '',
    orderNum: 0,
    path: '',
    component: '',
    query: '',
    isFrame: '1',
    isCache: '0',
    menuType: 'M',
    visible: '0',
    status: '0',
    perms: '',
    icon: ''
  })

  const form = reactive<MenuForm>(defaultForm())

  const rules = reactive<FormRules>({
    menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
    orderNum: [{ required: true, message: '请输入显示排序', trigger: 'blur' }],
    path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }]
  })

  const normalizeStatus = (status?: string) => (status?.trim() === '0' ? '0' : '1')

  const getMenuTypeTag = (row: MenuListItem) => {
    if (row.menuType === 'F') return { type: 'warning' as const, text: '按钮' }
    if (row.isFrame === '0') return { type: 'danger' as const, text: '外链' }
    if (row.menuType === 'M') return { type: 'primary' as const, text: '目录' }
    return { type: 'success' as const, text: '菜单' }
  }

  const { columnChecks, columns } = useTableColumns<MenuListItem>(() => [
    {
      prop: 'menuName',
      label: '菜单名称',
      minWidth: 220,
      showOverflowTooltip: true,
      formatter: (row) => row.menuName
    },
    {
      prop: 'icon',
      label: '图标',
      width: 110,
      formatter: (row) =>
        h('div', { class: 'flex items-center gap-2 text-g-700' }, [
          h(ArtSvgIcon, { icon: normalizeMenuIcon(row.icon), class: 'text-lg' }),
          h('span', { class: 'text-xs text-g-500' }, row.icon || '-')
        ])
    },
    {
      prop: 'menuType',
      label: '类型',
      width: 90,
      formatter: (row) => {
        const tag = getMenuTypeTag(row)
        return h(ElTag, { type: tag.type }, () => tag.text)
      }
    },
    { prop: 'orderNum', label: '排序', width: 90 },
    { prop: 'perms', label: '权限标识', minWidth: 150, showOverflowTooltip: true },
    { prop: 'component', label: '组件路径', minWidth: 160, showOverflowTooltip: true },
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
          h(ArtButtonTable, {
            type: 'add',
            onClick: () => openDialog('add', row)
          }),
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => openDialog('edit', row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => deleteMenu(row)
          })
        ])
    }
  ])

  const getMenuList = async () => {
    loading.value = true
    try {
      menuList.value = await fetchGetMenuList(searchForm.value)
    } finally {
      loading.value = false
    }
  }

  const getMenuTree = async () => {
    const list = await fetchGetMenuTreeselect()
    menuTree.value = [{ id: 0, label: '主类目', children: list }]
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

  const openDialog = async (type: 'add' | 'edit', row?: MenuListItem) => {
    resetForm()
    dialogType.value = type
    await getMenuTree()

    if (type === 'add') {
      form.parentId = row?.menuId ?? 0
      dialogVisible.value = true
      return
    }

    if (!row?.menuId) return
    const detail = await fetchGetMenuDetail(row.menuId)
    Object.assign(form, {
      ...defaultForm(),
      ...detail,
      isFrame: String(detail.isFrame ?? '1'),
      isCache: String(detail.isCache ?? '0'),
      visible: String(detail.visible ?? '0') as Api.SystemManage.MenuVisible,
      status: normalizeStatus(detail.status)
    })
    dialogVisible.value = true
  }

  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate()
    submitLoading.value = true
    try {
      if (form.menuId) {
        await fetchUpdateMenu(form)
        ElMessage.success('修改成功')
      } else {
        await fetchAddMenu(form)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      getMenuList()
    } finally {
      submitLoading.value = false
    }
  }

  const deleteMenu = (row: MenuListItem) => {
    ElMessageBox.confirm(`确定删除菜单"${row.menuName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteMenu(row.menuId)
      ElMessage.success('删除成功')
      getMenuList()
    })
  }

  const handleSearch = (params: Api.SystemManage.MenuSearchParams) => {
    searchForm.value = params
    getMenuList()
  }

  const handleReset = () => {
    searchForm.value = {}
    getMenuList()
  }

  onMounted(() => {
    getMenuList()
  })
</script>
