<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增字典类型' : '编辑字典类型'"
    width="500px"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem label="字典名称" prop="dictName">
        <ElInput v-model="form.dictName" placeholder="请输入字典名称" />
      </ElFormItem>
      <ElFormItem label="字典类型" prop="dictType">
        <ElInput v-model="form.dictType" placeholder="请输入字典类型" />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="form.status">
          <ElRadio value="0">正常</ElRadio>
          <ElRadio value="1">停用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
  import { fetchGetDictTypeDetail, fetchAddDictType, fetchUpdateDictType } from '@/api/system-manage'
  import { ElMessage } from 'element-plus'

  type DictTypeListItem = Api.SystemManage.DictTypeListItem
  type DictTypeForm = Api.SystemManage.DictTypeForm

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    dictData?: DictTypeListItem
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
    dictName: [
      { required: true, message: '请输入字典名称', trigger: 'blur' }
    ],
    dictType: [
      { required: true, message: '请输入字典类型', trigger: 'blur' },
      { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '字典类型必须以字母开头，可包含字母、数字和下划线', trigger: 'blur' }
    ]
  })

  const form = reactive<DictTypeForm>({
    dictId: undefined,
    dictName: '',
    dictType: '',
    status: '0',
    remark: ''
  })

  watch(
    () => props.modelValue,
    async (newVal) => {
      if (newVal) {
        if (props.dialogType === 'edit' && props.dictData) {
          await loadDetail()
        } else {
          resetForm()
        }
      }
    }
  )

  const loadDetail = async () => {
    if (!props.dictData?.dictId) return
    try {
      const detail = await fetchGetDictTypeDetail(props.dictData.dictId)
      Object.assign(form, {
        dictId: detail.dictId,
        dictName: detail.dictName,
        dictType: detail.dictType,
        status: detail.status,
        remark: detail.remark || ''
      })
    } catch {
      ElMessage.error('获取字典类型详情失败')
    }
  }

  const resetForm = () => {
    Object.assign(form, {
      dictId: undefined,
      dictName: '',
      dictType: '',
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
        await fetchAddDictType(form)
        ElMessage.success('新增成功')
      } else {
        await fetchUpdateDictType(form)
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