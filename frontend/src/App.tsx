import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { HelmetProvider } from 'react-helmet-async'
import { useTheme } from './stores/ThemeContext'
import { MusicProvider, useMusicContext } from './stores/MusicContext'
import NavBar from './components/NavBar'
import ScrollingBar from './components/ScrollingBar'
import Footer from './components/Footer'
import SideButton from './components/SideButton'
import Music from './components/Music'
import HeartAnimation from './components/HeartAnimation'
import MeteorBackground from './components/MeteorBackground'
import LightBackground from './components/LightBackground'
import Home from './views/Home'
import About from './views/About'
import ArticleView from './views/ArticleView'
import Login from './views/Login'
import Admin from './views/Admin'
import ArticleEditor from './views/ArticleEditor'
import Settings from './views/Settings'
import Install from './views/Install'
import { AuthProvider } from './stores/AuthContext'
import { checkInstallStatus } from './api/install'

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

  *::-webkit-scrollbar {
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
  z-index: 1;
  min-height: 100vh;
`

function AppContent() {
  const { theme } = useTheme()
  const { isMusicVisible } = useMusicContext()
  const navigate = useNavigate()
  const location = useLocation()

  // On mount, check if the blog has been installed.
  // If not, redirect to /install. If already installed, block /install.
  useEffect(() => {
    checkInstallStatus()
      .then(({ installed }) => {
        if (!installed && location.pathname !== '/install') {
          navigate('/install', { replace: true })
        } else if (installed && location.pathname === '/install') {
          navigate('/', { replace: true })
        }
      })
      .catch(() => {
        // Backend unreachable — don't redirect, let the app render normally
      })
  }, [])

  // Render a minimal wrapper for the install page (no navbar/footer/effects needed)
  if (location.pathname === '/install') {
    return (
      <>
        <GlobalStyle />
        {theme === 'dark' ? <MeteorBackground /> : <LightBackground />}
        <div data-theme={theme}>
          <Routes>
            <Route path="/install" element={<Install />} />
          </Routes>
        </div>
      </>
    )
  }

  return (
    <>
      <GlobalStyle />
      <ScrollingBar />
      <SideButton />
      {isMusicVisible && <Music />}
      <HeartAnimation />
      {theme === 'dark' ? <MeteorBackground /> : <LightBackground />}
      <AppWrapper data-theme={theme}>
        <NavBar />
        <MainContent>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles/:id" element={<ArticleView />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/new" element={<ArticleEditor />} />
            <Route path="/admin/edit/:id" element={<ArticleEditor />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/install" element={<Install />} />
          </Routes>
          <Footer />
        </MainContent>
      </AppWrapper>
    </>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <MusicProvider>
          <AppContent />
        </MusicProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}
