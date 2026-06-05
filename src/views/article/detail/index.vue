<!-- 文章详情页面 -->
<template>
  <div class="article-detail page-content">
    <div v-loading="loading" class="max-w-200 m-auto mt-15">
      <template v-if="articleTitle">
        <h1 class="text-3xl font-semibold">{{ articleTitle }}</h1>
        <div class="markdown-body mt-12.5" v-highlight v-html="articleHtml"></div>
      </template>
      <ElEmpty v-else :description="error || '未找到文章详情'" />
    </div>
    <ArtBackToTop />
  </div>
</template>

<script setup lang="ts">
  import '@/assets/styles/core/md.scss'
  import '@/assets/styles/custom/one-dark-pro.scss'
  import { useCommon } from '@/hooks/core/useCommon'
  import { ArticleList } from '@/mock/temp/articleList'

  defineOptions({ name: 'ArticleDetail' })

  interface MockArticle {
    id: number
    title: string
    brief?: string
    html_content?: string
    home_img?: string
    type_name?: string
    create_time?: string
    count?: number
  }

  const route = useRoute()
  const articleId = computed(() => Number(route.params.id))
  const articleTitle = ref('')
  const articleHtml = shallowRef('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const renderTextContent = (content: string) =>
    content
      .split(/\n{2,}/)
      .map((block) => {
        const safeBlock = escapeHtml(block.trim())
        if (!safeBlock) return ''
        if (block.includes('\n') || block.trim().startsWith('#')) {
          return `<pre><code>${safeBlock}</code></pre>`
        }
        return `<p>${safeBlock}</p>`
      })
      .join('')

  const buildMockHtml = (article: MockArticle) => {
    const content = article.html_content || article.brief || '暂无文章内容'
    const meta = [
      article.type_name ? `分类：${article.type_name}` : '',
      article.create_time
        ? `发布时间：${useDateFormat(article.create_time, 'YYYY-MM-DD').value}`
        : '',
      article.count !== undefined ? `阅读：${article.count}` : ''
    ]
      .filter(Boolean)
      .join(' · ')

    return [
      article.home_img
        ? `<p><img src="${article.home_img}" alt="${escapeHtml(article.title)}" /></p>`
        : '',
      meta ? `<p class="article-meta">${escapeHtml(meta)}</p>` : '',
      renderTextContent(content)
    ].join('')
  }

  const setMockArticleDetail = () => {
    const article = (ArticleList as MockArticle[]).find((item) => item.id === articleId.value)
    if (!article) {
      articleTitle.value = ''
      articleHtml.value = ''
      error.value = '未找到文章详情'
      return false
    }

    articleTitle.value = article.title
    articleHtml.value = buildMockHtml(article)
    error.value = null
    return true
  }

  const getArticleDetail = async () => {
    if (!articleId.value) return

    loading.value = true
    setMockArticleDetail()
    loading.value = false
  }

  const { scrollToTop } = useCommon()

  onMounted(() => {
    scrollToTop()
    getArticleDetail()
  })

  watch(articleId, () => {
    scrollToTop()
    getArticleDetail()
  })
</script>

<style lang="scss" scoped>
  .article-detail {
    :deep(.markdown-body) {
      margin-top: 60px;

      img {
        width: 100%;
        border: 1px solid var(--art-gray-200);
      }

      .article-meta {
        color: var(--art-text-gray-600);
      }

      pre {
        position: relative;

        &:hover {
          .copy-button {
            opacity: 1;
          }
        }

        &::before {
          position: absolute;
          top: 0;
          left: 50px;
          width: 1px;
          height: 100%;
          content: '';
          background: #0a0a0e;
        }
      }

      .code-wrapper {
        overflow-x: auto;
      }

      .line-number {
        position: sticky;
        left: 0;
        z-index: 2;
        box-sizing: border-box;
        display: inline-block;
        width: 50px;
        margin-right: 10px;
        font-size: 14px;
        color: #9e9e9e;
        text-align: center;
      }

      .copy-button {
        position: absolute;
        top: 6px;
        right: 6px;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        font-size: 20px;
        line-height: 40px;
        color: #999;
        text-align: center;
        cursor: pointer;
        background-color: #000;
        border: none;
        border-radius: 8px;
        opacity: 0;
        transition: all 0.2s;
      }
    }
  }
</style>
