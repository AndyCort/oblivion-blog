import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useTheme } from '../stores/ThemeContext'
import { useTranslation } from '../i18n/useTranslation'
import i18n from '../i18n'

const menuItems = [
  { key: 'home', path: '/' },
  { key: 'articles', path: '/' },
  { key: 'about', path: '/about' },
]



const Nav = styled.nav`
  font-family: var(--title-font);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: transform 0.3s ease;
  box-sizing: border-box;

  &.nav-hidden {
    transform: translateY(-100%);
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`

const NavLeft = styled.div`
  flex-shrink: 0;

  a {
    font-size: 1.5rem;
    font-weight: bold;
    font-family: var(--site-title-font);
    color: var(--main-color);
    mix-blend-mode: difference;
    text-decoration: none;
    transition: color 0.2s;
  }

  @media (max-width: 480px) {
    a { font-size: 1.25rem; }
  }
`

const NavMiddle = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    right: -280px;
    width: 280px;
    height: 100vh;
    z-index: 1001;
    padding: 80px 20px 20px;
    box-sizing: border-box;
    transition: right 0.3s ease;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    overflow-y: auto;

    &.mobile-open { right: 0; }
  }

  @media (max-width: 480px) {
    width: 260px;
    right: -260px;
    padding: 70px 16px 16px;
    &.mobile-open { right: 0; }
  }
`

const NavMenu = styled.ul`
  display: flex;
  list-style: none;
  gap: 8px;
  margin: 0;
  padding: 0;

  li a {
    display: block;
    padding: 8px 16px;
    color: var(--frame-color);
    text-decoration: none;
    transition: color 0.2s;
    position: relative;

    &:hover, &.active { color: var(--main-color); }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 1.5px;
      background-color: var(--main-color);
      transition: width 0.3s ease, left 0.3s ease;
    }

    &:hover::after, &.active::after {
      width: 100%;
      left: 0;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;

    li a {
      display: block;
      padding: 14px 16px;
      font-size: 16px;
      border-radius: 8px;
    }
  }

  @media (max-width: 480px) {
    li a { padding: 12px 14px; font-size: 15px; }
  }
`

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    right: -280px;
    width: 280px;
    z-index: 1002;
    padding: 20px;
    box-sizing: border-box;
    transition: right 0.3s ease;
    justify-content: flex-end;
    border-bottom: 1px solid var(--border-color);

    &.mobile-open { right: 0; }
  }

  @media (max-width: 480px) {
    width: 260px;
    right: -260px;
    padding: 16px;
    &.mobile-open { right: 0; }
  }
`

const NavSearch = styled.div`
  display: flex;
  align-items: center;

  form {
    display: flex;
    align-items: center;
    border-radius: 6px;
  }

  .search-input {
    width: 0;
    padding: 0;
    border: none;
    outline: none;
    opacity: 0;
    transition: all 0.3s ease;
    color: var(--frame-color);
    border-radius: 6px;
  }

  &.expanded .search-input {
    width: 180px;
    padding: 8px 12px;
    opacity: 1;
    border: 1px solid var(--border-color);
    border-right: none;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 36px;
    background: transparent;
    border: none;
    color: var(--frame-color);
    cursor: pointer;
    transition: color 0.2s;
    border-radius: 6px;

    &:hover {
      background: var(--hover-bg);
      color: var(--hover-color);
    }
  }

  &.expanded button {
    border-radius: 0 6px 6px 0;
  }

  @media (max-width: 768px) {
    flex: 1;
    &.expanded .search-input { width: 100%; }
    form { width: 100%; }
  }
`

const NavBtns = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 4px;
  }
`

const IconBtn = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 36px;
  background: transparent;
  border: none;
  color: var(--frame-color);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: var(--hover-bg);
    color: var(--hover-color);
  }
`

const LangDropdown = styled.ul`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  list-style: none;
  padding: 8px 0;
  min-width: 120px;
  border-radius: 8px;
  overflow: hidden;
  z-index: 100;
  background: var(--glass-bg-color);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border-color);
  box-shadow: var(--glass-box-shadow);

  li {
    padding: 10px 16px;
    cursor: pointer;
    color: var(--frame-color);
    transition: all 0.2s;

    &:hover {
      color: var(--hover-color);
      background: var(--hover-bg);
    }

    &.active {
      color: var(--accent-color);
      font-weight: 600;
    }
  }
`

const MenuToggle = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 36px;
  background: transparent;
  border: none;
  color: var(--frame-color);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  font-size: 20px;

  &:hover {
    background: var(--hover-bg);
    color: var(--hover-color);
  }

  @media (max-width: 768px) {
    display: flex;
    order: 3;
  }
`

const MobileOverlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;

  &.active {
    opacity: 1;
    visibility: visible;
  }

  @media (max-width: 768px) {
    display: block;
  }
`

export default function NavBar() {
  const { theme, toggleTheme } = useTheme()
  const { t, locale } = useTranslation()

  const [showSearch, setShowSearch] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [navVisible, setNavVisible] = useState(true)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const lastScrollYRef = useRef(0)

  const title = t('siteName')

  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => {
      if (!prev) setTimeout(() => searchInputRef.current?.focus(), 100)
      return !prev
    })
  }, [])

  const onSearchBlur = () => {
    setTimeout(() => {
      if (!searchInputRef.current?.value) setShowSearch(false)
    }, 200)
  }

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDropdownOpen((prev) => !prev)
  }

  const handleSetLocale = (newLocale: string, e: React.MouseEvent) => {
    e.stopPropagation()
    i18n.changeLanguage(newLocale)
    setDropdownOpen(false)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => {
      document.body.style.overflow = !prev ? 'hidden' : ''
      return !prev
    })
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    document.body.style.overflow = ''
  }

  const handleMenuItemClick = (key: string) => {
    closeMobileMenu()
    if (key === 'home') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const updateScroll = () => {
      const scrollY = window.scrollY
      if (scrollY > 100) {
        setNavVisible(scrollY < lastScrollYRef.current)
      } else {
        setNavVisible(true)
      }

      const navBar = document.querySelector('.nav-bar') as HTMLElement
      if (navBar) {
        if (scrollY > 0) {
          if (theme === 'light') {
            navBar.style.backdropFilter = 'blur(10px)'
              ; (navBar.style as any).webkitBackdropFilter = 'blur(10px)'
            navBar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
          }
        } else {
          navBar.style.backdropFilter = 'none'
            ; (navBar.style as any).webkitBackdropFilter = 'none'
          navBar.style.backgroundColor = ''
        }
      }

      lastScrollYRef.current = scrollY
    }

    window.addEventListener('scroll', updateScroll)
    return () => window.removeEventListener('scroll', updateScroll)
  }, [theme])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (e.target instanceof Element && !e.target.closest('.lang-btn')) setDropdownOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <>
      <Nav className={`nav-bar${navVisible ? '' : ' nav-hidden'}`}>
        <NavLeft>
          <a href="/">{title}</a>
        </NavLeft>

        <MenuToggle onClick={toggleMobileMenu}>
          <i className={`fas ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </MenuToggle>

        <NavMiddle className={mobileMenuOpen ? 'mobile-open' : ''}>
          <NavMenu>
            {menuItems.map((item) => (
              <li key={item.key}>
                <Link to={item.path} onClick={() => handleMenuItemClick(item.key)}>
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </NavMenu>
        </NavMiddle>

        <NavRight className={mobileMenuOpen ? 'mobile-open' : ''}>
          <NavSearch className={showSearch ? 'expanded' : ''}>
            <form action="/search" method="get">
              <input
                ref={searchInputRef}
                type="search"
                name="s"
                placeholder={t('search.placeholder')}
                className="search-input"
                data-glass=""
                onFocus={() => setShowSearch(true)}
                onBlur={onSearchBlur}
              />
              <button type="button" onClick={toggleSearch}>
                <i className="fas fa-magnifying-glass"></i>
              </button>
            </form>
          </NavSearch>
          <NavBtns>
            <IconBtn className="lang-btn" onClick={toggleDropdown}>
              <i className="fas fa-language"></i>
              {dropdownOpen && (
                <LangDropdown>
                  <li className={locale === 'zh-CN' ? 'active' : ''} onClick={(e) => handleSetLocale('zh-CN', e)}>中文</li>
                  <li className={locale === 'en-US' ? 'active' : ''} onClick={(e) => handleSetLocale('en-US', e)}>English</li>
                </LangDropdown>
              )}
            </IconBtn>
            <IconBtn onClick={toggleTheme}>
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </IconBtn>
          </NavBtns>
        </NavRight>
      </Nav>

      <MobileOverlay className={mobileMenuOpen ? 'active' : ''} onClick={closeMobileMenu} />
    </>
  )
}
