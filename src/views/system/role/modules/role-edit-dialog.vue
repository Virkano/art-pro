<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
    width="560px"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" v-loading="loading" :model="form" :rules="rules" label-width="96px">
      <ElFormItem label="角色名称" prop="roleName">
        <ElInput v-model="form.roleName" placeholder="请输入角色名称" />
      </ElFormItem>
      <ElFormItem label="权限字符" prop="roleKey">
        <ElInput v-model="form.roleKey" placeholder="请输入权限字符" />
      </ElFormItem>
      <ElFormItem label="角色顺序" prop="roleSort">
        <ElInputNumber v-model="form.roleSort" :min="0" controls-position="right" />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="form.status">
          <ElRadio value="0">正常</ElRadio>
          <ElRadio value="1">停用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>
      <ElFormItem label="菜单权限">
        <div class="role-menu-actions">
          <ElCheckbox v-model="menuExpand" @change="handleMenuExpand">展开/折叠</ElCheckbox>
          <ElCheckbox v-model="menuNodeAll" @change="handleMenuNodeAll">全选/全不选</ElCheckbox>
          <ElCheckbox v-model="form.menuCheckStrictly">父子联动</ElCheckbox>
        </div>
        <ElScrollbar height="300px" class="role-menu-tree">
          <ElTree
            ref="menuTreeRef"
            :data="menuTree"
            show-checkbox
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            :default-expand-all="false"
            :props="menuTreeProps"
          />
        </ElScrollbar>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { ElTree, FormInstance, FormRules } from 'element-plus'
  import {
    fetchAddRole,
    fetchGetMenuTreeselect,
    fetchGetRoleDetail,
    fetchGetRoleMenuTreeselect,
    fetchUpdateRole
  } from '@/api/system-manage'

  type RoleListItem = Api.SystemManage.RoleListItem
  type MenuTreeNode = Api.SystemManage.MenuTreeNode
  type TreeInstance = InstanceType<typeof ElTree>

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    roleData?: RoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const menuTreeRef = ref<TreeInstance>()
  const menuTree = ref<MenuTreeNode[]>([])
  const loading = ref(false)
  const menuExpand = ref(false)
  const menuNodeAll = ref(false)

  const menuTreeProps = {
    children: 'children',
    label: 'label'
  }

  /**
   * 弹窗显示状态双向绑定
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /**
   * 表单验证规则
   */
  const rules = reactive<FormRules>({
    roleName: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    roleKey: [
      { required: true, message: '请输入权限字符', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    roleSort: [{ required: true, message: '请输入角色顺序', trigger: 'blur' }]
  })

  /**
   * 表单数据
   */
  const form = reactive<Api.SystemManage.RoleForm>({
    roleName: '',
    roleKey: '',
    roleSort: 0,
    status: '0',
    menuCheckStrictly: true,
    deptCheckStrictly: true,
    remark: ''
  })

  /**
   * 监听弹窗打开，初始化表单数据
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) initForm()
    }
  )

  /**
   * 监听角色数据变化，更新表单
   */
  watch(
    () => props.roleData,
    (newData) => {
      if (newData && props.modelValue) initForm()
    },
    { deep: true }
  )

  /**
   * 初始化表单数据
   * 根据弹窗类型填充表单或重置表单
   */
  const initForm = async () => {
    loading.value = true
    try {
      menuTreeRef.value?.setCheckedKeys([])
      menuExpand.value = false
      menuNodeAll.value = false

      if (props.dialogType === 'edit' && props.roleData) {
        const [detail, permission] = await Promise.all([
          fetchGetRoleDetail(props.roleData.roleId),
          fetchGetRoleMenuTreeselect(props.roleData.roleId)
        ])

        Object.assign(form, {
          roleId: detail.roleId,
          roleName: detail.roleName,
          roleKey: detail.roleKey,
          roleSort: detail.roleSort,
          status: detail.status,
          menuCheckStrictly: detail.menuCheckStrictly,
          deptCheckStrictly: detail.deptCheckStrictly,
          menuIds: permission.checkedKeys ?? detail.menuIds ?? [],
          deptIds: detail.deptIds ?? [],
          remark: detail.remark ?? ''
        })
        menuTree.value = permission.menus

        await nextTick()
        setCheckedMenuKeys(form.menuIds ?? [])
      } else {
        Object.assign(form, {
          roleId: undefined,
          roleName: '',
          roleKey: '',
          roleSort: 0,
          status: '0',
          menuCheckStrictly: true,
          deptCheckStrictly: true,
          menuIds: [],
          deptIds: [],
          remark: ''
        })
        menuTree.value = await fetchGetMenuTreeselect()

        await nextTick()
        menuTreeRef.value?.setCheckedKeys([])
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 关闭弹窗并重置表单
   */
  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
    menuTreeRef.value?.setCheckedKeys([])
    menuTree.value = []
    menuExpand.value = false
    menuNodeAll.value = false
  }

  /**
   * 提交表单
   * 验证通过后调用接口保存数据
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      form.menuIds = getCheckedMenuIds()
      if (props.dialogType === 'add') {
        await fetchAddRole(form)
      } else {
        await fetchUpdateRole(form)
      }
      const message = props.dialogType === 'add' ? '新增成功' : '修改成功'
      ElMessage.success(message)
      emit('success')
      handleClose()
    } catch (error) {
      console.log('表单验证失败:', error)
    }
  }

  const getCheckedMenuIds = () => {
    const tree = menuTreeRef.value
    if (!tree) return []

    const keys = [...tree.getCheckedKeys(false), ...tree.getHalfCheckedKeys()]
    return Array.from(new Set(keys.map(Number))).filter((key) => Number.isFinite(key))
  }

  const setCheckedMenuKeys = (keys: number[]) => {
    keys.forEach((key) => {
      menuTreeRef.value?.setChecked(key, true, false)
    })
  }

  const handleMenuExpand = (value: string | number | boolean) => {
    const treeStore = menuTreeRef.value?.store as
      | { nodesMap: Record<string, { expanded: boolean }> }
      | undefined

    if (!treeStore) return
    Object.values(treeStore.nodesMap).forEach((node) => {
      node.expanded = Boolean(value)
    })
  }

  const handleMenuNodeAll = (value: string | number | boolean) => {
    menuTreeRef.value?.setCheckedKeys(value ? getAllMenuKeys(menuTree.value) : [])
  }

  const getAllMenuKeys = (nodes: MenuTreeNode[]) => {
    const keys: number[] = []

    const walk = (items: MenuTreeNode[]) => {
      items.forEach((item) => {
        keys.push(item.id)
        if (item.children?.length) walk(item.children)
      })
    }

    walk(nodes)
    return keys
  }
</script>

<style scoped lang="scss">
  .role-menu-actions {
    width: 100%;
    line-height: 1;
    margin-bottom: 8px;
  }

  .role-menu-tree {
    width: 100%;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    padding: 8px 10px;
  }
</style>
