import { Routes, Route } from 'react-router-dom'
import styled, { createGlobalStyle } from 'styled-components'
import { useTheme } from './stores/ThemeContext'
import NavBar from './components/NavBar'
import ScrollingBar from './components/ScrollingBar'
import Footer from './components/Footer'
import SideButton from './components/SideButton'
import Music from './components/Music'
import HeartAnimation from './components/HeartAnimation'
import Home from './views/Home'
import About from './views/About'
import ArticleDetail from './views/ArticleDetail'

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body {
    min-height: 100vh;
    font-family: var(--content-font);
  }

  html::-webkit-scrollbar,
  body::-webkit-scrollbar {
    display: none;
  }

  i {
    font-size: 1.25rem;
  }

  p {
    color: var(--text-color);
    white-space: pre-wrap;
    margin: 5px 0;
  }
`

const AppWrapper = styled.div`
  min-height: 100vh;
  transition: background-color 0.3s ease;
`

const MainContent = styled.div`
  padding: 0;
  margin: 0;
  position: relative;
  background: center / cover repeat url('https://images.unsplash.com/photo-1770287691979-6b8ec41f5331');
  z-index: 1;
`

export default function App() {
  const { theme } = useTheme()

  return (
    <>
      <GlobalStyle />
      <ScrollingBar />
      <SideButton />
      <Music />
      <HeartAnimation />
      <AppWrapper data-theme={theme}>
        <NavBar />
        <MainContent>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/about" element={<About />} />
          </Routes>
          <Footer />
        </MainContent>
      </AppWrapper>
    </>
  )
}
