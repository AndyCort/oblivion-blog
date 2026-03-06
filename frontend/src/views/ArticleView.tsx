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

/* ── Layout: wider wrapper with 3-column grid to center article ── */
const PageWrapper = styled.div`
  min-height: 100vh;
  padding: 100px 20px 60px;
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 800px 1fr;

  @media (max-width: 1300px) {
    display: flex;
    justify-content: center;
    max-width: 100%;
  }
  @media (max-width: 768px) {
    padding: 80px 16px 40px;
  }
`

const MainColumn = styled.div`
  grid-column: 2;
  width: 100%;
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

  /* ===== Markdown Article Body (Phycat Aesthetic) ===== */
  & .wmde-markdown {
      background: transparent !important;
      color: var(--text-color) !important;
      font-family: var(--content-font) !important;
      font-size: 1.05rem;
      line-height: 2.2;
      letter-spacing: 1px;
      word-spacing: 2px;
  }

  /* Headings Base */
  & .wmde-markdown h1,
  & .wmde-markdown h2,
  & .wmde-markdown h3,
  & .wmde-markdown h4,
  & .wmde-markdown h5,
  & .wmde-markdown h6 {
      color: var(--text-color);
      font-family: var(--title-font);
      font-weight: bold;
      border-bottom: none;
      scroll-margin-top: 100px;
      position: relative;
      transition: all 0.3s ease;
  }

  /* H1 - Centered with Glowing Underline */
  & .wmde-markdown h1 {
      font-size: 1.618rem;
      line-height: 1.4;
      padding-bottom: 12px;
      display: table;
      width: auto;
      min-width: 120px;
      text-align: center;
      margin: 2em auto 1.5em auto !important;
  }

  & .wmde-markdown h1::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 40px;
      height: 4px;
      border-radius: 4px;
      background: linear-gradient(to right, var(--main-color), var(--main-color));
      transform: translateX(-50%);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
  }

  & .wmde-markdown h1:hover {
      color: var(--main-color);
      text-shadow: 0 0 5px rgba(251, 113, 133, 0.4);
      transform: translateY(-2px);
  }

  & .wmde-markdown h1:hover::after {
      width: 100%;
      box-shadow: 0 0 10px var(--main-color);
  }

  /* H2 - Capsule / Pill shape */
  & .wmde-markdown h2 {
      font-size: 1.462rem;
      display: inline-block;
      width: fit-content;
      padding: 6px 16px;
      border-radius: 8px;
      background-image: linear-gradient(to right, rgba(251, 113, 133, 0.6), var(--main-color), rgba(251, 113, 133, 0.6));
      background-size: 200% auto;
      background-position: 0% center;
      color: #fff !important;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      margin: 1.5em 0 1em 0;
      transition: background-position 0.5s ease-out, transform 0.4s ease, box-shadow 0.4s ease;
  }

  & .wmde-markdown h2:hover {
      background-position: 100% center;
      transform: scale(1.02);
      box-shadow: 0 5px 15px rgba(251, 113, 133, 0.3);
  }

  &[data-color-mode="dark"] .wmde-markdown h2 {
      background-image: radial-gradient(ellipse at center bottom, rgba(251, 113, 133, 0.2), transparent 70%);
      background-color: rgba(255, 255, 255, 0.02);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
      color: var(--text-color) !important;
      box-shadow: none;
  }

  &[data-color-mode="dark"] .wmde-markdown h2:hover {
      color: var(--main-color) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  /* H3 - Left Border Twin Pillar */
  & .wmde-markdown h3 {
      font-size: 1.318rem;
      padding-left: 15px;
      margin: 1.5em 0 1em 0;
  }

  & .wmde-markdown h3::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 1.3rem;
      border-radius: 2px;
      background-color: var(--main-color);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  & .wmde-markdown h3:hover {
      padding-left: 20px;
      color: var(--main-color);
  }

  & .wmde-markdown h3:hover::before {
      height: 24px;
      width: 6px;
      box-shadow: 0 0 8px var(--main-color);
  }

  /* Links - Bracket Style */
  & .wmde-markdown a {
      color: var(--main-color);
      text-decoration: none;
      font-weight: 500;
      padding: 0 2px;
      position: relative;
      border-bottom: none !important;
      transition: all 0.3s ease;
  }

  & .wmde-markdown a::before,
  & .wmde-markdown a::after {
      display: inline-block;
      color: var(--content-color);
      opacity: 0.7;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s, opacity 0.3s;
  }

  & .wmde-markdown a::before {
      content: "[";
      margin-right: 2px;
  }

  & .wmde-markdown a::after {
      content: "]";
      margin-left: 2px;
  }

  & .wmde-markdown a:hover {
      background-color: rgba(251, 113, 133, 0.1);
      border-radius: 4px;
      text-shadow: 0 0 5px rgba(251, 113, 133, 0.4);
  }

  & .wmde-markdown a:hover::before {
      transform: translateX(-4px);
      color: var(--main-color);
      opacity: 1;
  }

  & .wmde-markdown a:hover::after {
      transform: translateX(4px);
      color: var(--main-color);
      opacity: 1;
  }

  /* Bold and Italic */
  & .wmde-markdown strong {
      font-weight: bold;
      color: var(--main-color);
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
  }

  & .wmde-markdown strong:hover {
      border-bottom-color: var(--main-color);
      text-shadow: 0 0 8px var(--main-color);
  }

  & .wmde-markdown em {
      font-style: italic;
      color: var(--main-color);
      filter: brightness(0.85);
      background-image: linear-gradient(-45deg, transparent 35%, rgba(251, 113, 133, 0.3) 35%, rgba(251, 113, 133, 0.3) 65%, transparent 65%);
      background-size: 6px 3px;
      background-repeat: repeat-x;
      background-position: 0 100%;
      padding-bottom: 2px;
      transition: all 0.2s;
  }

  & .wmde-markdown em:hover {
      filter: brightness(1);
      background-image: linear-gradient(-45deg, transparent 35%, var(--main-color) 35%, var(--main-color) 65%, transparent 65%);
  }

  /* Inline code */
  & .wmde-markdown code:not(pre code) {
      font-family: monospace;
      background-color: rgba(251, 113, 133, 0.1);
      color: var(--main-color) !important;
      border: 1px solid rgba(251, 113, 133, 0.2);
      padding: 2px 6px !important;
      margin: 0 2px;
      border-radius: 6px;
      font-size: 0.9em;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  & .wmde-markdown code:not(pre code):hover {
      background-color: var(--main-color) !important;
      color: #fff !important;
      box-shadow: 0 0 10px rgba(251, 113, 133, 0.4);
      transform: scale(1.05);
  }

  /* Code blocks */
  & .wmde-markdown pre {
      position: relative;
      background-color: rgba(0, 0, 0, 0.05) !important;
      border: 1px solid var(--glass-border-color);
      border-radius: 12px;
      padding: 40px 16px 16px 16px;
      margin: 24px 0;
      overflow-x: auto;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  &[data-color-mode="dark"] .wmde-markdown pre {
      background-color: rgba(255, 255, 255, 0.03) !important;
  }

  & .wmde-markdown pre:hover {
      border-color: var(--main-color);
      box-shadow: 0 4px 15px rgba(251, 113, 133, 0.1);
  }

  /* macOS style dots header */
  & .wmde-markdown pre::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 32px;
      background-color: rgba(0, 0, 0, 0.02);
      border-bottom: 1px solid var(--glass-border-color);
      border-radius: 12px 12px 0 0;
      background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNDUwcHgiIGhlaWdodD0iMTMwcHgiPgogIDxlbGxpcHNlIGN4PSI2NSIgY3k9IjY1IiByeD0iNTAiIHJ5PSI1MiIgc3Ryb2tlPSJyZ2IoMjIwLDYwLDU0KSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJyZ2IoMjM3LDEwOCw5NikiLz4KICA8ZWxsaXBzZSBjeD0iMjI1IiBjeT0iNjUiIHJ4PSI1MCIgcnk9IjUyIiAgc3Ryb2tlPSJyZ2IoMjE4LDE1MSwzMykiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0icmdiKDI0NywxOTMsODEpIi8+CiAgPGVsbGlwc2UgY3g9IjM4NSIgY3k9IjY1IiByeD0iNTAiIHJ5PSI1MiIgIHN0cm9rZT0icmdiKDI3LDE2MSwzNykiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0icmdiKDEwMCwyMDAsODYpIi8+Cjwvc3ZnPg==");
      background-repeat: no-repeat;
      background-size: 54px;
      background-position: 12px center;
  }

  & .wmde-markdown pre code {
      background: transparent !important;
      color: var(--text-color);
      font-size: 0.9rem;
      line-height: 1.7;
      font-family: monospace;
  }

  /* Blockquotes */
  & .wmde-markdown blockquote {
      position: relative;
      margin: 24px 0;
      padding: 16px 20px 16px 48px;
      background-color: var(--glass-bg-color);
      border: 1px solid var(--glass-border-color);
      border-radius: 16px;
      color: var(--text-color);
      opacity: 0.9;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  & .wmde-markdown blockquote::before {
      content: "💡";
      position: absolute;
      left: 14px;
      top: 18px;
      font-size: 20px;
      line-height: 1;
      opacity: 0.7;
      filter: grayscale(1);
      transform: rotate(30deg);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  & .wmde-markdown blockquote:hover {
      border-color: var(--main-color);
      transform: scale(1.02);
      box-shadow: 0 8px 25px rgba(251, 113, 133, 0.15);
  }

  & .wmde-markdown blockquote:hover::before {
      opacity: 1;
      filter: grayscale(0);
      transform: rotate(0deg);
      text-shadow: 0 0 10px var(--main-color);
  }

  & .wmde-markdown blockquote p {
      margin: 0;
  }

  /* Tables */
  & .wmde-markdown table {
      border-collapse: separate;
      border-spacing: 0;
      width: 100%;
      margin: 1.5em 0;
      border: 1px solid var(--glass-border-color);
      border-radius: 8px;
      overflow: hidden;
      background-color: var(--glass-bg-color);
      backdrop-filter: blur(5px);
  }

  & .wmde-markdown table th,
  & .wmde-markdown table td {
      padding: 12px 16px;
      border-bottom: 1px solid rgba(128, 128, 128, 0.1);
      border-right: 1px solid rgba(128, 128, 128, 0.1);
      transition: all 0.2s ease;
      text-align: left;
  }

  & .wmde-markdown table th:last-child,
  & .wmde-markdown table td:last-child {
      border-right: none;
  }

  & .wmde-markdown table tr:last-child td {
      border-bottom: none;
  }

  & .wmde-markdown table th {
      background-color: rgba(251, 113, 133, 0.08);
      color: var(--main-color);
      font-weight: 600;
  }

  & .wmde-markdown table tbody tr:hover td {
      background-color: rgba(0, 0, 0, 0.02);
  }

  &[data-color-mode="dark"] .wmde-markdown table tbody tr:hover td {
      background-color: rgba(255, 255, 255, 0.02);
  }

  & .wmde-markdown table tbody td:hover {
      background-color: rgba(251, 113, 133, 0.1);
      box-shadow: inset 0 0 0 1px var(--main-color);
  }

  /* Images */
  & .wmde-markdown img {
      max-width: 100%;
      border-radius: 12px;
      margin: 1em 0;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  }

  /* Horizontal rules */
  & .wmde-markdown hr {
      border: none;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--main-color), transparent);
      position: relative;
      overflow: visible;
      opacity: 0.5;
      margin: 3em 0;
      transition: all 0.3s ease;
  }

  & .wmde-markdown hr::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      width: 8px;
      height: 8px;
      border: 2px solid var(--main-color);
      background-color: var(--glass-bg-color);
      box-sizing: border-box;
      transition: all 0.3s ease;
  }

  & .wmde-markdown hr:hover {
      opacity: 1;
  }

  & .wmde-markdown hr:hover::after {
      background-color: var(--main-color);
      box-shadow: 0 0 10px var(--main-color);
      transform: translate(-50%, -50%) rotate(225deg) scale(1.5);
  }

  /* Lists */
  & .wmde-markdown ul,
  & .wmde-markdown ol {
      padding-left: 1.8em;
      margin: 1em 0;
  }

  & .wmde-markdown li {
      margin: 0.4em 0;
      position: relative;
  }

  & .wmde-markdown ul>li::marker,
  & .wmde-markdown ol>li::marker {
      color: var(--main-color);
      font-weight: bold;
  }

  /* Paragraphs */
  & .wmde-markdown p {
      margin: 1em 0;
  }
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
