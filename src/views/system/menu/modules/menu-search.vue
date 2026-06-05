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
  type MenuSearchFormParams = Api.SystemManage.MenuSearchParams

  interface Props {
    modelValue: MenuSearchFormParams
  }

  interface Emits {
    (e: 'update:modelValue', value: MenuSearchFormParams): void
    (e: 'search', params: MenuSearchFormParams): void
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
      label: '菜单名称',
      key: 'menuName',
      type: 'input',
      props: {
        placeholder: '请输入菜单名称',
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
    emit('search', params as MenuSearchFormParams)
  }
</script>
