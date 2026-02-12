import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const Container = styled.div`
  position: fixed;
  bottom: clamp(1px, 5%, 50px);
  right: clamp(1px, 5%, 50px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
`

const Btn = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  color: var(--frame-color);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;

  &:hover { transform: scale(1.1); color: var(--main-color); }
`

export default function SideButton() {
    const navigate = useNavigate()

    return (
        <Container>
            <Btn data-glass="" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <i className="fas fa-caret-up"></i>
            </Btn>
            <Btn data-glass="" onClick={() => navigate('/')}>
                <i className="fas fa-house"></i>
            </Btn>
            <Btn data-glass="" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                <i className="fas fa-caret-down"></i>
            </Btn>
        </Container>
    )
}
