import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { Helmet } from 'react-helmet-async'
import MDEditor from '@uiw/react-md-editor'
import { useTranslation } from '../i18n/useTranslation'
import { useTheme } from '../stores/ThemeContext'
import { fetchArticle, type Article } from '../api/articles'
import Comments from '../components/Comments'
import TableOfContents, { extractHeadings } from '../components/TableOfContents'

const adSpin = keyframes`
to { 
  transform: rotate(360deg); 
}
`

/* ── Layout: wider wrapper with flex for sidebar ── */
const PageWrapper = styled.div`
  min-height: 100vh;
  padding: 100px 20px 60px;
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  gap: 32px;
  align-items: flex-start;

  @media (max-width: 1200px) {
    max-width: 800px;
    gap: 0;
  }
  @media (max-width: 768px) {
    padding: 80px 16px 40px;
  }
`

const MainColumn = styled.div`
  flex: 1;
  min-width: 0;
  max-width: 800px;
`

const LoadingBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 120px 20px;
  color: var(--text-color);
`

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--glass-border-color);
  border-top-color: var(--text-color);
  border-radius: 50%;
  animation: ${adSpin} 1s linear infinite;
`

const ErrorBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 120px 20px;
  color: var(--text-color);

  i {
    font-size: 64px; 
    opacity: 0.5; 
  }
  p {
    font-size: 18px; 
    opacity: 0.7; 
  }

  button {
    padding: 10px 24px;
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
  }
`

const ArticleCard = styled.article`
  border: 1px solid var(--glass-border-color);
  border-radius: 16px;
`

const ArticleHeader = styled.header`
  padding: 40px 40px 24px;
  @media (max-width: 768px) {
    padding: 24px 20px 16px; 
  }
`

const ArticleTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 16px;
  color: var(--main-color);
  @media (max-width: 768px) {
    font-size: 1.5rem; 
  }
`

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 0.9rem;
  color: var(--main-color);
  opacity: 0.6;
  margin-bottom: 16px;
`

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`

const TagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--main-color);
`

const Tag = styled.span`
  padding: 4px 12px;
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
`

const CoverImg = styled.div`
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  img { width: 100%; height: 100%; object-fit: cover; }
`

const Body = styled.div`
  padding: 32px 40px;
  color: var(--text-color);
  font-size: 1.1rem;
  line-height: 1.8;
  @media (max-width: 768px) { padding: 20px; font-size: 1rem; }
`

const FooterSection = styled.footer`
  padding: 24px 40px;
  border-top: 1px solid var(--glass-border-color);
  @media (max-width: 768px) { padding: 16px 20px; }
`

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--glass-border-color);
  border-radius: 8px;
  color: var(--text-color);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  &:hover { background: rgba(255, 255, 255, 0.1); }
`

export default function ArticleView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { locale } = useTranslation()
  const { theme } = useTheme()

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const getLocalizedField = useCallback((field: any) => {
    if (!field) return ''
    if (typeof field === 'string') return field
    const lang = locale === 'zh-CN' ? 'zh' : 'en'
    return field[lang] || field.zh || field.en || Object.values(field)[0]
  }, [locale])

  const formatDate = useCallback((dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }, [locale])

  useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          if (id) {
            const data = await fetchArticle(id)
            if (!cancelled) setArticle(data)
          }
        } catch {
          if (!cancelled) setError(true)
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
    return () => { cancelled = true }
  }, [id])

  const contentText = useMemo(
    () => (article ? getLocalizedField(article.content) : ''),
    [article, getLocalizedField]
  )

  const headings = useMemo(() => extractHeadings(contentText), [contentText])

  if (loading) return (
    <PageWrapper>
      <MainColumn>
        <LoadingBox><Spinner /><span>加载中...</span></LoadingBox>
      </MainColumn>
    </PageWrapper>
  )
  if (error) return (
    <PageWrapper>
      <MainColumn>
        <ErrorBox>
          <i className="far fa-face-sad-tear" />
          <p>文章加载失败</p>
          <button onClick={() => navigate('/')}>返回首页</button>
        </ErrorBox>
      </MainColumn>
    </PageWrapper>
  )
  if (!article) return null

  return (
    <PageWrapper>
      <MainColumn>
        <Helmet>
          <title>{getLocalizedField(article.title)} | Oblivion Blog</title>
        </Helmet>
        <ArticleCard data-glass="">
          <ArticleHeader>
            <ArticleTitle>{getLocalizedField(article.title)}</ArticleTitle>
            <Meta>
              <MetaItem><i className="far fa-calendar" />{formatDate(article.date)}</MetaItem>
              {article.author && <MetaItem><i className="far fa-user" />{article.author}</MetaItem>}
            </Meta>
            {article.tags && article.tags.length > 0 && <TagsRow>{article.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</TagsRow>}
          </ArticleHeader>
          {article.cover && <CoverImg><img src={article.cover} alt={getLocalizedField(article.title)} /></CoverImg>}
          <Body className="article-markdown-body" data-color-mode={theme}>
            <MDEditor.Markdown source={contentText} style={{ background: 'transparent' }} />
          </Body>
          <FooterSection><BackBtn onClick={() => navigate(-1)}><i className="fas fa-arrow-left" />返回</BackBtn></FooterSection>
        </ArticleCard>

        {id && <Comments articleId={id} />}
      </MainColumn>

      <TableOfContents headings={headings} />
    </PageWrapper>
  )
}
