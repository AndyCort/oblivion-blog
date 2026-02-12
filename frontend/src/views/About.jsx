import styled from 'styled-components'

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
    return (
        <Page>
            <Container>
                <Header>
                    <Avatar>🧑‍💻</Avatar>
                    <Title>关于我</Title>
                    <Tagline>一个热爱代码与生活的开发者</Tagline>
                </Header>
                <ContentSection>
                    <p>欢迎来到我的自留地。</p>
                    <p>这里有我的碎碎念，有我的奇思妙想，还有一些奇奇怪怪的东西。</p>
                    <p>希望你能在这里找到你想要的东西。</p>
                </ContentSection>
            </Container>
        </Page>
    )
}
