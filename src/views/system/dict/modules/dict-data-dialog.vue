<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增字典数据' : '编辑字典数据'"
    width="500px"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem label="字典类型">
        <ElInput v-model="form.dictType" disabled />
      </ElFormItem>
      <ElFormItem label="字典标签" prop="dictLabel">
        <ElInput v-model="form.dictLabel" placeholder="请输入字典标签" />
      </ElFormItem>
      <ElFormItem label="字典键值" prop="dictValue">
        <ElInput v-model="form.dictValue" placeholder="请输入字典键值" />
      </ElFormItem>
      <ElFormItem label="样式属性" prop="cssClass">
        <ElInput v-model="form.cssClass" placeholder="请输入样式属性" />
      </ElFormItem>
      <ElFormItem label="显示排序" prop="dictSort">
        <ElInputNumber v-model="form.dictSort" :min="0" :max="9999" />
      </ElFormItem>
      <ElFormItem label="回显样式" prop="listClass">
        <ElSelect v-model="form.listClass" placeholder="请选择回显样式">
          <ElOption value="default" label="默认(default)" />
          <ElOption value="primary" label="主要(primary)" />
          <ElOption value="success" label="成功(success)" />
          <ElOption value="info" label="信息(info)" />
          <ElOption value="warning" label="警告(warning)" />
          <ElOption value="danger" label="危险(danger)" />
        </ElSelect>
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
  import { fetchGetDictDataDetail, fetchAddDictData, fetchUpdateDictData } from '@/api/system-manage'
  import { ElMessage } from 'element-plus'

  type DictDataListItem = Api.SystemManage.DictDataListItem
  type DictDataForm = Api.SystemManage.DictDataForm

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    dictData?: DictDataListItem
    dictType: string
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
    dictLabel: [
      { required: true, message: '请输入字典标签', trigger: 'blur' }
    ],
    dictValue: [
      { required: true, message: '请输入字典键值', trigger: 'blur' }
    ],
    dictSort: [{ required: true, message: '请输入显示顺序', trigger: 'blur' }]
  })

  const form = reactive<DictDataForm>({
    dictCode: undefined,
    dictType: '',
    dictLabel: '',
    dictValue: '',
    cssClass: '',
    listClass: 'default',
    dictSort: 0,
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
        // Set dictType from props when opening dialog
        form.dictType = props.dictType
      }
    }
  )

  const loadDetail = async () => {
    if (!props.dictData?.dictCode) return
    try {
      const detail = await fetchGetDictDataDetail(props.dictData.dictCode)
      Object.assign(form, {
        dictCode: detail.dictCode,
        dictType: detail.dictType,
        dictLabel: detail.dictLabel,
        dictValue: detail.dictValue,
        cssClass: detail.cssClass || '',
        listClass: detail.listClass || 'default',
        dictSort: detail.dictSort,
        status: detail.status,
        remark: detail.remark || ''
      })
    } catch {
      ElMessage.error('获取字典数据详情失败')
    }
  }

  const resetForm = () => {
    Object.assign(form, {
      dictCode: undefined,
      dictType: props.dictType,
      dictLabel: '',
      dictValue: '',
      cssClass: '',
      listClass: 'default',
      dictSort: 0,
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
        await fetchAddDictData(form)
        ElMessage.success('新增成功')
      } else {
        await fetchUpdateDictData(form)
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