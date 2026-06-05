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
  type DictDataSearchFormParams = Api.SystemManage.DictDataSearchParams

  interface Props {
    modelValue: DictDataSearchFormParams
  }

  interface Emits {
    (e: 'update:modelValue', value: DictDataSearchFormParams): void
    (e: 'search', params: DictDataSearchFormParams): void
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
      label: '字典标签',
      key: 'dictLabel',
      type: 'input',
      props: {
        placeholder: '请输入字典标签',
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

  const handleSearch = async (params: any) => {
    await searchBarRef.value?.validate()
    emit('search', params as DictDataSearchFormParams)
  }
</script>