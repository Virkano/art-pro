<template>
  <ElDialog
    v-model="dialogVisible"
    :title="type === 'add' ? '新增用户' : '编辑用户'"
    width="720px"
    align-center
    @close="resetForm"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="92px">
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="用户昵称" prop="nickName">
            <ElInput v-model="form.nickName" placeholder="请输入用户昵称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="归属部门" prop="deptId">
            <ElTreeSelect
              v-model="form.deptId"
              :data="deptTree"
              :props="{ value: 'id', label: 'label', children: 'children' }"
              value-key="id"
              check-strictly
              clearable
              placeholder="请选择归属部门"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="手机号码" prop="phonenumber">
            <ElInput v-model="form.phonenumber" placeholder="请输入手机号码" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="邮箱" prop="email">
            <ElInput v-model="form.email" placeholder="请输入邮箱" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="用户名称" prop="userName">
            <ElInput
              v-model="form.userName"
              :disabled="type === 'edit'"
              placeholder="请输入用户名称"
            />
          </ElFormItem>
        </ElCol>
        <ElCol v-if="type === 'add'" :span="12">
          <ElFormItem label="用户密码" prop="password">
            <ElInput
              v-model="form.password"
              type="password"
              show-password
              placeholder="请输入密码"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="用户性别" prop="sex">
            <ElSelect v-model="form.sex" placeholder="请选择性别">
              <ElOption label="男" value="0" />
              <ElOption label="女" value="1" />
              <ElOption label="未知" value="2" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="状态" prop="status">
            <ElRadioGroup v-model="form.status">
              <ElRadio value="0">正常</ElRadio>
              <ElRadio value="1">停用</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="岗位" prop="postIds">
            <ElSelect v-model="form.postIds" multiple clearable placeholder="请选择岗位">
              <ElOption
                v-for="post in postOptions"
                :key="post.postId"
                :label="post.postName"
                :value="post.postId"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="角色" prop="roleIds">
            <ElSelect v-model="form.roleIds" multiple clearable placeholder="请选择角色">
              <ElOption
                v-for="role in roleOptions"
                :key="role.roleId"
                :label="role.roleName"
                :value="role.roleId"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="备注" prop="remark">
            <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import {
    fetchAddUser,
    fetchGetUserDeptTree,
    fetchGetUserDetail,
    fetchUpdateUser
  } from '@/api/system-manage'

  interface Props {
    visible: boolean
    type: string
    userData?: Partial<Api.SystemManage.UserListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const roleOptions = ref<Api.SystemManage.RoleListItem[]>([])
  const postOptions = ref<Api.SystemManage.PostListItem[]>([])
  const deptTree = ref<Api.SystemManage.MenuTreeNode[]>([])

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const defaultForm = (): Api.SystemManage.UserForm => ({
    userId: undefined,
    deptId: props.userData?.deptId ?? undefined,
    userName: '',
    nickName: '',
    password: '',
    phonenumber: '',
    email: '',
    sex: '2',
    status: '0',
    postIds: [],
    roleIds: [],
    remark: ''
  })

  const form = reactive<Api.SystemManage.UserForm>(defaultForm())

  const rules = reactive<FormRules>({
    userName: [{ required: true, message: '请输入用户名称', trigger: 'blur' }],
    nickName: [{ required: true, message: '请输入用户昵称', trigger: 'blur' }],
    password: [{ required: true, message: '请输入用户密码', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
    phonenumber: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }]
  })

  watch(
    () => props.visible,
    (visible) => {
      if (visible) initForm()
    }
  )

  const initForm = async () => {
    Object.assign(form, defaultForm())
    const [detail, tree] = await Promise.all([
      fetchGetUserDetail(props.type === 'edit' ? props.userData?.userId : undefined),
      fetchGetUserDeptTree()
    ])

    deptTree.value = tree
    roleOptions.value = detail.roles
    postOptions.value = detail.posts

    if (props.type === 'edit' && detail.user) {
      Object.assign(form, {
        ...defaultForm(),
        ...detail.user,
        roleIds: detail.roleIds,
        postIds: detail.postIds,
        password: undefined
      })
    }

    nextTick(() => formRef.value?.clearValidate())
  }

  const resetForm = () => {
    Object.assign(form, defaultForm())
    formRef.value?.clearValidate()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate()
    submitLoading.value = true
    try {
      if (form.userId) {
        await fetchUpdateUser(form)
        ElMessage.success('修改成功')
      } else {
        await fetchAddUser(form)
        ElMessage.success('新增成功')
      }
      emit('submit')
      dialogVisible.value = false
    } finally {
      submitLoading.value = false
    }
  }
</script>
