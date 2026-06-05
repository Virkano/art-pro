<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增岗位' : '编辑岗位'"
    width="500px"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem label="岗位编码" prop="postCode">
        <ElInput v-model="form.postCode" placeholder="请输入岗位编码" />
      </ElFormItem>
      <ElFormItem label="岗位名称" prop="postName">
        <ElInput v-model="form.postName" placeholder="请输入岗位名称" />
      </ElFormItem>
      <ElFormItem label="显示顺序" prop="postSort">
        <ElInputNumber v-model="form.postSort" :min="0" :max="9999" />
      </ElFormItem>
      <ElFormItem label="岗位状态" prop="status">
        <ElRadioGroup v-model="form.status">
          <ElRadio value="0">正常</ElRadio>
          <ElRadio value="1">停用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="岗位备注" prop="remark">
        <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入岗位备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchGetPostDetail, fetchAddPost, fetchUpdatePost } from '@/api/system-manage'
  import { ElMessage } from 'element-plus'

  type PostListItem = Api.SystemManage.PostListItem
  type PostForm = Api.SystemManage.PostForm

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    postData?: PostListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add'
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const rules = reactive<FormRules>({
    postCode: [
      { required: true, message: '请输入岗位编码', trigger: 'blur' },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    postName: [
      { required: true, message: '请输入岗位名称', trigger: 'blur' },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    postSort: [{ required: true, message: '请输入显示顺序', trigger: 'blur' }]
  })

  const form = reactive<PostForm>({
    postId: undefined,
    postCode: '',
    postName: '',
    postSort: 0,
    status: '0',
    remark: ''
  })

  watch(
    () => props.modelValue,
    async (newVal) => {
      if (newVal) {
        if (props.dialogType === 'edit' && props.postData) {
          await loadDetail()
        } else {
          resetForm()
        }
      }
    }
  )

  const loadDetail = async () => {
    if (!props.postData?.postId) return
    try {
      const detail = await fetchGetPostDetail(props.postData.postId)
      Object.assign(form, {
        postId: detail.postId,
        postCode: detail.postCode,
        postName: detail.postName,
        postSort: detail.postSort,
        status: detail.status,
        remark: detail.remark || ''
      })
    } catch {
      ElMessage.error('获取岗位详情失败')
    }
  }

  const resetForm = () => {
    Object.assign(form, {
      postId: undefined,
      postCode: '',
      postName: '',
      postSort: 0,
      status: '0',
      remark: ''
    })
    formRef.value?.resetFields()
  }

  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      submitLoading.value = true

      if (props.dialogType === 'add') {
        await fetchAddPost(form)
        ElMessage.success('新增成功')
      } else {
        await fetchUpdatePost(form)
        ElMessage.success('修改成功')
      }

      emit('success')
      handleClose()
    } catch {
      // Validation failed or API error
    } finally {
      submitLoading.value = false
    }
  }
</script>