import styled, { keyframes } from 'styled-components';

const breathe = keyframes`
  0%, 100% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
`;

const LightContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;

  /* Premium minimalist light mesh gradient */
  background-color: #fafafa;
  background-image: 
    radial-gradient(at 0% 0%, rgba(224, 231, 255, 0.8) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(253, 230, 138, 0.6) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(24bc, 211, 226, 0.8) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(204, 251, 241, 0.6) 0px, transparent 50%);
  background-size: 150% 150%;
  animation: ${breathe} 20s ease-in-out infinite;
  
  /* Subtle static noise/texture overlay */
  &::after {
    content: '';
    position: absolute;
    top: 0;left: 0;right: 0;bottom: 0;
    background-image: radial-gradient(#000000 1px, transparent 1px);
    background-size: 40px 40px;
    background-position: 0 0;
    opacity: 0.02;
    z-index: 1;
  }
`;

// A few slow floating light orbs to add depth
const float = keyframes`
  0% { transform: translate(0, 0); }
  33% { transform: translate(30px, -50px); }
  66% { transform: translate(-20px, 20px); }
  100% { transform: translate(0, 0); }
`;

const Orb = styled.div<{ size: number, top: number, left: number, delay: number, duration: number, color: string }>`
  position: absolute;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: ${props => props.color};
  border-radius: 50%;
  filter: blur(${props => props.size / 3}px);
  opacity: 0.4;
  animation: ${float} ${props => props.duration}s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  z-index: 1;
`;

export default function LightBackground() {
    const orbs = [
        { id: 1, size: 300, top: 10, left: 10, delay: 0, duration: 25, color: '#e0e7ff' },
        { id: 2, size: 400, top: 60, left: 70, delay: -5, duration: 30, color: '#fbcfe8' },
        { id: 3, size: 250, top: 40, left: 40, delay: -10, duration: 20, color: '#ccfbf1' },
        { id: 4, size: 350, top: 80, left: 10, delay: -15, duration: 28, color: '#fde68a' },
    ];

    return (
        <LightContainer>
            {orbs.map(orb => (
                <Orb
                    key={orb.id}
                    size={orb.size}
                    top={orb.top}
                    left={orb.left}
                    delay={orb.delay}
                    duration={orb.duration}
                    color={orb.color}
                />
            ))}
        </LightContainer>
    );
}
