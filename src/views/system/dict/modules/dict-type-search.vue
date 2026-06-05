<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  type DictTypeSearchFormParams = Api.SystemManage.DictTypeSearchParams

  interface Props {
    modelValue: DictTypeSearchFormParams
  }

  interface Emits {
    (e: 'update:modelValue', value: DictTypeSearchFormParams): void
    (e: 'search', params: DictTypeSearchFormParams): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const searchBarRef = ref()

  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const rules = {}

  const statusOptions = ref([
    { label: '正常', value: '0' },
    { label: '停用', value: '1' }
  ])

  const formItems = computed(() => [
    {
      label: '字典名称',
      key: 'dictName',
      type: 'input',
      props: {
        placeholder: '请输入字典名称',
        clearable: true
      }
    },
    {
      label: '字典类型',
      key: 'dictType',
      type: 'input',
      props: {
        placeholder: '请输入字典类型',
        clearable: true
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        options: statusOptions.value,
        clearable: true
      }
    }
  ])

  const handleReset = () => {
    emit('reset')
  }

  const handleSearch = async (params: DictTypeSearchFormParams) => {
    await searchBarRef.value?.validate()
    emit('search', params)
  }
</script>