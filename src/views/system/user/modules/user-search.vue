<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :show-expand="false"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  interface Props {
    modelValue: Api.SystemManage.UserSearchParams
  }

  interface Emits {
    (e: 'update:modelValue', value: Api.SystemManage.UserSearchParams): void
    (e: 'search', params: Api.SystemManage.UserSearchParams): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const searchBarRef = ref()

  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formItems = computed(() => [
    {
      label: '用户名称',
      key: 'userName',
      type: 'input',
      props: { placeholder: '请输入用户名称', clearable: true }
    },
    {
      label: '手机号码',
      key: 'phonenumber',
      type: 'input',
      props: { placeholder: '请输入手机号码', clearable: true, maxlength: 11 }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { label: '正常', value: '0' },
          { label: '停用', value: '1' }
        ]
      }
    }
  ])

  const handleReset = () => emit('reset')

  const handleSearch = async (params: Api.SystemManage.UserSearchParams) => {
    await searchBarRef.value?.validate()
    emit('search', params)
  }
</script>
