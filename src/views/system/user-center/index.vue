<!-- 个人中心页面 -->
<template>
  <div class="w-full h-full p-0 bg-transparent border-none shadow-none">
    <div class="relative flex-b mt-2.5 max-md:block max-md:mt-1">
      <div class="w-112 mr-5 max-md:w-full max-md:mr-0">
        <div class="art-card-sm relative p-9 pb-6 overflow-hidden text-center">
          <img class="absolute top-0 left-0 w-full h-50 object-cover" src="@imgs/user/bg.webp" />
          <img
            class="relative z-10 w-20 h-20 mt-30 mx-auto object-cover border-2 border-white rounded-full"
            :src="avatarUrl"
          />
          <h2 class="mt-5 text-xl font-normal">{{ profile.userName || userInfo.userName }}</h2>
          <p class="mt-5 text-sm">{{ profile.nickName || '-' }}</p>

          <div class="w-75 mx-auto mt-7.5 text-left">
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:mail-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ profile.email || '-' }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:user-3-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ sexText }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:phone-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ profile.phonenumber || '-' }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:building-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ profile.dept?.deptName || '-' }}</span>
            </div>
          </div>

          <div class="mt-10">
            <h3 class="text-sm font-medium">标签</h3>
            <div class="flex flex-wrap justify-center mt-3.5">
              <div
                v-for="item in lableList"
                :key="item"
                class="py-1 px-1.5 mr-2.5 mb-2.5 text-xs border border-g-300 rounded"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-hidden max-md:w-full max-md:mt-3.5">
        <div class="art-card-sm">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">基本设置</h1>

          <ElForm
            :model="form"
            class="box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full [&>.el-row_.el-select]:w-full"
            ref="ruleFormRef"
            :rules="rules"
            label-width="86px"
            label-position="top"
          >
            <ElRow>
              <ElFormItem label="用户名称" prop="userName">
                <ElInput v-model="form.userName" disabled />
              </ElFormItem>
              <ElFormItem label="性别" prop="sex" class="ml-5">
                <ElSelect v-model="form.sex" placeholder="Select" :disabled="!isEdit">
                  <ElOption
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="用户昵称" prop="nickName">
                <ElInput v-model="form.nickName" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="邮箱" prop="email" class="ml-5">
                <ElInput v-model="form.email" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="手机号码" prop="phonenumber">
                <ElInput v-model="form.phonenumber" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="所属部门" prop="deptName" class="ml-5">
                <ElInput v-model="form.deptName" disabled />
              </ElFormItem>
            </ElRow>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton v-if="isEdit" class="w-22.5" v-ripple @click="cancelEdit">取消</ElButton>
              <ElButton
                type="primary"
                class="w-22.5"
                v-ripple
                :loading="profileSaving"
                @click="edit"
              >
                {{ isEdit ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>

        <div class="art-card-sm my-5">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">更改密码</h1>

          <ElForm
            ref="pwdFormRef"
            :model="pwdForm"
            :rules="pwdRules"
            class="box-border p-5"
            label-width="86px"
            label-position="top"
          >
            <ElFormItem label="当前密码" prop="oldPassword">
              <ElInput
                v-model="pwdForm.oldPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem label="新密码" prop="newPassword">
              <ElInput
                v-model="pwdForm.newPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem label="确认新密码" prop="confirmPassword">
              <ElInput
                v-model="pwdForm.confirmPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton v-if="isEditPwd" class="w-22.5" v-ripple @click="cancelEditPwd">
                取消
              </ElButton>
              <ElButton
                type="primary"
                class="w-22.5"
                v-ripple
                :loading="pwdSaving"
                @click="editPwd"
              >
                {{ isEditPwd ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    fetchGetUserProfile,
    fetchUpdateUserPassword,
    fetchUpdateUserProfile
  } from '@/api/system-manage'
  import { useUserStore } from '@/store/modules/user'
  import defaultAvatar from '@/assets/images/user/avatar.webp'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

  defineOptions({ name: 'UserCenter' })

  const userStore = useUserStore()
  const userInfo = computed(() => userStore.getUserInfo)

  const isEdit = ref(false)
  const isEditPwd = ref(false)
  const ruleFormRef = ref<FormInstance>()
  const pwdFormRef = ref<FormInstance>()
  const profileSaving = ref(false)
  const pwdSaving = ref(false)
  const profile = ref<Api.SystemManage.UserProfile>({
    userName: '',
    nickName: ''
  })

  /**
   * 用户信息表单
   */
  const form = reactive({
    userName: '',
    nickName: '',
    email: '',
    phonenumber: '',
    sex: '2',
    deptName: ''
  })

  /**
   * 密码修改表单
   */
  const pwdForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const avatarUrl = computed(() => normalizeAvatar(profile.value.avatar || userInfo.value.avatar))
  const sexText = computed(() => options.find((item) => item.value === form.sex)?.label || '未知')

  /**
   * 表单验证规则
   */
  const rules = reactive<FormRules>({
    nickName: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
    ],
    phonenumber: [
      { required: true, message: '请输入手机号码', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    sex: [{ required: true, message: '请选择性别', trigger: 'blur' }]
  })

  const validateConfirmPassword = (
    _rule: unknown,
    value: string,
    callback: (error?: Error) => void
  ) => {
    if (value !== pwdForm.newPassword) {
      callback(new Error('两次输入的新密码不一致'))
      return
    }
    callback()
  }

  const pwdRules = reactive<FormRules>({
    oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      { validator: validateConfirmPassword, trigger: 'blur' }
    ]
  })

  /**
   * 性别选项
   */
  const options = [
    { value: '0', label: '男' },
    { value: '1', label: '女' },
    { value: '2', label: '未知' }
  ]

  /**
   * 用户标签列表
   */
  const lableList: Array<string> = ['专注设计', '很有想法', '辣~', '大长腿', '川妹子', '海纳百川']

  onMounted(() => {
    getProfile()
  })

  const normalizeAvatar = (avatar?: string) => {
    if (!avatar) return defaultAvatar
    if (/^(https?:|data:|blob:)/.test(avatar)) return avatar
    return avatar.startsWith('/') ? `${import.meta.env.VITE_API_URL}${avatar}` : avatar
  }

  const syncForm = (user: Api.SystemManage.UserProfile) => {
    form.userName = user.userName || ''
    form.nickName = user.nickName || ''
    form.email = user.email || ''
    form.phonenumber = user.phonenumber || ''
    form.sex = String(user.sex ?? '2')
    form.deptName = user.dept?.deptName || ''
  }

  const syncUserStore = (user: Api.SystemManage.UserProfile) => {
    userStore.setUserInfo({
      buttons: userInfo.value.buttons || [],
      roles: userInfo.value.roles || [],
      permissions: userInfo.value.permissions || [],
      userId: Number(user.userId || userInfo.value.userId || 0),
      userName: user.userName || userInfo.value.userName || '',
      nickName: user.nickName,
      email: user.email || '',
      avatar: user.avatar,
      phonenumber: user.phonenumber,
      sex: user.sex,
      deptName: user.dept?.deptName,
      roleGroup: user.roleGroup,
      postGroup: user.postGroup
    })
  }

  const getProfile = async () => {
    const user = await fetchGetUserProfile()
    profile.value = user
    syncForm(user)
    syncUserStore(user)
  }

  /**
   * 切换用户信息编辑状态
   */
  const edit = async () => {
    if (!isEdit.value) {
      isEdit.value = true
      return
    }

    if (!ruleFormRef.value) return
    const valid = await ruleFormRef.value.validate()
    if (!valid) return

    profileSaving.value = true
    try {
      await fetchUpdateUserProfile({
        nickName: form.nickName,
        email: form.email,
        phonenumber: form.phonenumber,
        sex: form.sex
      })
      ElMessage.success('修改成功')
      isEdit.value = false
      await getProfile()
    } finally {
      profileSaving.value = false
    }
  }

  const cancelEdit = () => {
    syncForm(profile.value)
    isEdit.value = false
  }

  /**
   * 切换密码编辑状态
   */
  const editPwd = async () => {
    if (!isEditPwd.value) {
      isEditPwd.value = true
      return
    }

    if (!pwdFormRef.value) return
    const valid = await pwdFormRef.value.validate()
    if (!valid) return

    pwdSaving.value = true
    try {
      await fetchUpdateUserPassword({
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword
      })
      ElMessage.success('密码修改成功')
      cancelEditPwd()
    } finally {
      pwdSaving.value = false
    }
  }

  const cancelEditPwd = () => {
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
    pwdFormRef.value?.clearValidate()
    isEditPwd.value = false
  }
</script>
