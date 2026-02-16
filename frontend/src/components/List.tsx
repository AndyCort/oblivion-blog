import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useTranslation } from '../i18n/useTranslation'
import { fetchArticles, type Article } from '../api/articles'
import defaultCover from '../assets/home.jpg'

// ... (skipping styled components for brevity in thought, but tool needs exact match? No, I can target specific lines)
// wait, I can't skip content in TargetContent.
// I'll target the imports and then the component start.

// Actually, I'll allow multiple replacements in List.tsx via multi_replace or sequential replaces.
// I'll use separate tool calls for safety.

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const ListTitle = styled.h2`

  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  text-align: center;

  @media (max-width: 768px) { font-size: 1.8rem; margin: 16px 0; }
  @media (max-width: 480px) { font-size: 1.5rem; }
`

const ArticleListWrapper = styled.div`
  padding: 20px;
  width: clamp(800px, 80%, 1200px);
  margin: 0 auto;

  @media (max-width: 768px) { width: 100%; padding: 12px; }
  @media (max-width: 480px) { padding: 8px; }
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 20px;
  color: var(--text-color);
`

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--glass-border-color);
  border-top-color: var(--text-color);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 20px;
  color: var(--text-color);
  opacity: 0.6;
  i { font-size: 48px; }
  p { font-size: 16px; }
`

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: clamp(200px, 40vw, 800px);
  margin: 0 auto;

  @media (max-width: 768px) { width: 100%; gap: 16px; }
  @media (max-width: 480px) { gap: 12px; }
`

const Card = styled.article`
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  width: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--glass-box-shadow);
  }

  &:hover .article-cover { background-size: 110%; }
  &:hover .read-more { opacity: 1; }
  &:hover .read-more i { transform: translateX(4px); }
  &:hover .title-text { color: var(--main-color); }
  &:hover .title-text::after {
    background-color: var(--main-color);
    width: calc(100% + 20px);
  }
`

const Cover = styled.div`
  display: flex;
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-size 0.3s ease;

  @media (max-width: 768px) { height: 180px; }
  @media (max-width: 480px) { height: 150px; }
`

const MetaOverlay = styled.div`
  border-radius: 6px;
  margin: 30px;
  padding: 6px;
  color: var(--text-color);
  background-color: var(--glass-bg-color);
  position: absolute;
  top: 0;

  &.left { left: 0; }
  &.right { right: 0; }

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 4px 8px;
    margin: 8px;
  }
`

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  i { font-size: 12px; }
`

const Content = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 768px) { padding: 14px; gap: 10px; }
  @media (max-width: 480px) { padding: 12px; }
`

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.6;
  margin: 0;

  .title-text {
    position: relative;
    display: inline;
    padding-bottom: 2px;
    transition: color 0.3s;

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: calc(100% + 20px);
      height: 1.5px;
      background-color: var(--text-color);
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 1.5px;
      background-color: var(--main-color);
      transition: width 0.5s ease;
    }
  }

  @media (max-width: 768px) { font-size: 1.1rem; line-height: 1.5; }
  @media (max-width: 480px) { font-size: 1rem; }
`

const Summary = styled.p`
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 768px) { font-size: 0.85rem; -webkit-line-clamp: 2; line-clamp: 2; }
  @media (max-width: 480px) { font-size: 0.8rem; }
`

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
  @media (max-width: 768px) { gap: 6px; }
`

const Tag = styled.span`
  padding: 4px 10px;
  font-size: 0.75rem;
  background: var(--glass-bg-color);
  border-radius: 20px;
  color: var(--text-color);
  opacity: 0.8;
  @media (max-width: 768px) { padding: 3px 8px; font-size: 0.7rem; }
`

const ReadMore = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.8;
  transition: all 0.2s;
  i { font-size: 12px; transition: transform 0.2s; }
  @media (max-width: 768px) { font-size: 0.85rem; }
`

const CardFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid var(--glass-border-color);
  @media (max-width: 768px) { padding: 12px 14px; }
`

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  padding: 20px 0;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 24px;
    padding: 16px 0;
  }
`

const PaginationBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid var(--glass-border-color);
  border-radius: 8px;
  background: var(--glass-bg-color);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  i { font-size: 12px; }

  &:hover:not(:disabled) {
    background: var(--main-color);
    transform: translateY(-2px);
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.8rem;
    span { display: none; }
  }
`

const PaginationNumbers = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    order: -1;
    width: 100%;
    justify-content: center;
    gap: 6px;
  }
`

const PaginationNum = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--glass-border-color);
  border-radius: 8px;
  background: var(--glass-bg-color);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled):not(.active) { background: var(--main-color); }
  &.active { color: var(--main-color); border-color: var(--main-color); font-weight: 600; }
  &.ellipsis { cursor: default; background: transparent; border: none; }

  @media (max-width: 768px) { width: 32px; height: 32px; font-size: 0.8rem; }
  @media (max-width: 480px) { width: 28px; height: 28px; font-size: 0.75rem; }
`

export default function List() {
  const navigate = useNavigate()
  const { t, locale } = useTranslation()

  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const totalPages = useMemo(() => Math.ceil(articles.length / pageSize), [articles.length])
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return articles.slice(start, start + pageSize)
  }, [articles, currentPage])

  const visiblePages = useMemo(() => {
    const pages = []
    const total = totalPages
    const current = currentPage
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
    return pages
  }, [totalPages, currentPage])

  const getArticleCover = (article: Article) => article.cover || article.featuredImage || defaultCover

  const getLocalizedField = useCallback((field: any) => {
    if (!field) return ''
    if (typeof field === 'string') return field
    const lang = locale === 'zh-CN' ? 'zh' : 'en'
    return field[lang] || field.zh || field.en || Object.values(field)[0]
  }, [locale])

  const formatDate = useCallback((dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }, [locale])

  const goToArticle = (id: string) => navigate(`/articles/${id}`)

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    const el = document.querySelector('.article-list')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          const data = await fetchArticles()
          if (!cancelled) setArticles(data)
        } catch (err) {
          console.error('Failed to load articles:', err)
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
    return () => { cancelled = true }
  }, [])

  return (
    <>
      <ListTitle>最新文章</ListTitle>
      <ArticleListWrapper className="article-list">
        {loading ? (
          <LoadingContainer>
            <Spinner />
            <span>{t('articles.loading') || '加载中...'}</span>
          </LoadingContainer>
        ) : articles.length === 0 ? (
          <EmptyState>
            <i className="far fa-folder-open"></i>
            <p>{t('articles.noArticles')}</p>
          </EmptyState>
        ) : (
          <>
            <Grid>
              {paginatedArticles.map((article) => (
                <Card key={article.id} data-glass="" onClick={() => goToArticle(article.id)}>
                  <Cover className="article-cover" style={{ backgroundImage: `url(${getArticleCover(article)})` }}>
                    <MetaOverlay className="left" data-glass="">
                      <MetaItem><i className="far fa-calendar"></i>{formatDate(article.date)}</MetaItem>
                    </MetaOverlay>
                    {article.author && (
                      <MetaOverlay className="right" data-glass="">
                        <MetaItem><i className="far fa-user"></i>{article.author}</MetaItem>
                      </MetaOverlay>
                    )}
                  </Cover>
                  <Content>
                    <Title><span className="title-text">{getLocalizedField(article.title)}</span></Title>
                    <Summary>{getLocalizedField(article.summary)}</Summary>
                    {article.tags && article.tags.length > 0 && (
                      <Tags>{article.tags.slice(0, 3).map((tag) => <Tag key={tag}>{tag}</Tag>)}</Tags>
                    )}
                    <ReadMore className="read-more">{t('articles.readMore')}<i className="fas fa-arrow-right"></i></ReadMore>
                  </Content>
                  <CardFooter />
                </Card>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Pagination>
                <PaginationBtn disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
                  <i className="fas fa-chevron-left"></i><span>{t('articles.prev') || '上一页'}</span>
                </PaginationBtn>
                <PaginationNumbers>
                  {visiblePages.map((page, i) => (
                    <PaginationNum
                      key={i}
                      className={`${page === currentPage ? 'active' : ''}${page === '...' ? ' ellipsis' : ''}`}
                      disabled={page === '...'}
                      onClick={() => page !== '...' && goToPage(page as number)}
                    >
                      {page}
                    </PaginationNum>
                  ))}
                </PaginationNumbers>
                <PaginationBtn disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>
                  <span>{t('articles.next') || '下一页'}</span><i className="fas fa-chevron-right"></i>
                </PaginationBtn>
              </Pagination>
            )}
          </>
        )}
      </ArticleListWrapper>
    </>
  )
}
