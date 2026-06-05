<!-- 数据监控 -->
<template>
  <div class="druid-page">
    <iframe :src="druidUrl" title="数据监控" />
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Druid' })

  const { VITE_API_URL } = import.meta.env
  const druidUrl = computed(() => `${VITE_API_URL || ''}/druid/index.html`)
</script>

<style scoped lang="scss">
  .druid-page {
    height: 100%;
    min-height: calc(100vh - 132px);
    background: var(--art-main-bg-color);

    iframe {
      display: block;
      width: 100%;
      height: 100%;
      min-height: calc(100vh - 132px);
      border: 0;
      background: #fff;
    }
  }
</style>
