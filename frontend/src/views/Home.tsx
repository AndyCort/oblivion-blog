import styled from 'styled-components'
import { useLocale } from '../stores/LocaleContext'
import Quote from '../components/Quote'
import Social from '../components/Social'
import ScrollArrow from '../components/ScrollArrow'
import List from '../components/List'

const HomeSection = styled.div`
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: visible;
`

const HomeBg = styled.div`
  height: 100vh;
  width: 100%;
  background: center / cover no-repeat var(--home-bg);
  position: absolute;
  overflow: visible;
  z-index: -1;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    transform: scaleY(-1) translateY(-100%);
    background: inherit;
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%);
  }
`

const WelcomeContent = styled.div`
  position: relative;
  z-index: 1;
  height: 100vh;
  min-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: clamp(0.5rem, 2vh, 2rem);
  padding: clamp(1rem, 5vh, 3rem) 1rem;
  box-sizing: border-box;
`

const WelcomeTitle = styled.h1`
  font-size: clamp(1.5rem, 5vh, 3.5rem);
  font-weight: 700;
  margin: 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  font-family: var(--site-title-font);
`

const ListSection = styled.div`
  position: relative;
  z-index: 100;
`

export default function Home() {
    const { locale } = useLocale()
    const welcomeText = locale === 'zh-CN' ? '半生雨' : 'Oblivion'

    return (
        <>
            <HomeSection>
                <HomeBg />
                <WelcomeContent>
                    <WelcomeTitle>{welcomeText}</WelcomeTitle>
                    <Quote />
                    <Social />
                </WelcomeContent>
                <ScrollArrow />
            </HomeSection>
            <ListSection>
                <List />
            </ListSection>
        </>
    )
}
