import { useState, useEffect } from 'react'
import styled from 'styled-components'
import MDEditor from '@uiw/react-md-editor'
import { useTheme } from '../stores/ThemeContext'
import { Helmet } from 'react-helmet-async'

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;

  @media (max-width: 768px) { padding: 3rem 1.5rem; }
`

const Container = styled.div`
  max-width: 600px;
  width: 100%;
`

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
`

const Avatar = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  @media (max-width: 768px) { font-size: 3rem; }
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
  font-family: var(--title-font);
  margin-bottom: 0.5rem;
  @media (max-width: 768px) { font-size: 1.75rem; }
`

const Tagline = styled.p`
  font-size: 1rem;
  color: var(--text-muted);
  font-family: var(--content-font);
`

const ContentSection = styled.section`
  line-height: 1.8;

  p {
    color: var(--text-secondary);
    font-family: var(--content-font);
    font-size: 1.05rem;
    margin-bottom: 1rem;
    &:last-child { margin-bottom: 0; }
  }
`

export default function About() {
  const { theme } = useTheme()
  const [settings, setSettings] = useState({
    aboutAvatar: '🧑‍💻',
    siteTitle: '关于我',
    siteSubtitle: '一个热爱代码与生活的开发者',
    aboutContent: '欢迎来到我的自留地。'
  })

  useEffect(() => {
    fetch('http://localhost:3001/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(prev => ({ ...prev, ...data }))
      })
      .catch(() => { })
  }, [])

  return (
    <Page>
      <Helmet>
        <title>关于我 | Oblivion Blog</title>
      </Helmet>
      <Container>
        <Header>
          <Avatar>{settings.aboutAvatar}</Avatar>
          <Title>{settings.siteTitle}</Title>
          <Tagline>{settings.siteSubtitle}</Tagline>
        </Header>
        <ContentSection data-color-mode={theme}>
          <MDEditor.Markdown source={settings.aboutContent} style={{ background: 'transparent' }} />
        </ContentSection>
      </Container>
    </Page>
  )
}
