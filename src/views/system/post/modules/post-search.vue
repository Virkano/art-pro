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
  type PostSearchFormParams = Api.SystemManage.PostSearchParams

  interface Props {
    modelValue: PostSearchFormParams
  }

  interface Emits {
    (e: 'update:modelValue', value: PostSearchFormParams): void
    (e: 'search', params: PostSearchFormParams): void
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
      label: '岗位名称',
      key: 'postName',
      type: 'input',
      props: {
        placeholder: '请输入岗位名称',
        clearable: true
      }
    },
    {
      label: '岗位编码',
      key: 'postCode',
      type: 'input',
      props: {
        placeholder: '请输入岗位编码',
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

  const handleSearch = async (params: PostSearchFormParams) => {
    await searchBarRef.value?.validate()
    emit('search', params)
  }
</script>