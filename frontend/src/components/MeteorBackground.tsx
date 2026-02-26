import styled, { keyframes } from 'styled-components';

const meteorAnimation = keyframes`
  0% {
    opacity: 0;
    transform: rotate(-45deg) translateX(0);
  }
  1% {
    opacity: 1;
  }
  6% {
    opacity: 1;
  }
  10% {
    opacity: 0;
    transform: rotate(-45deg) translateX(-2500px);
  }
  100% {
    opacity: 0;
    transform: rotate(-45deg) translateX(-2500px);
  }
`;

const starTwinkle = keyframes`
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
`;

const skyBreathe = keyframes`
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
`

const MeteorContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;

  /* Deep space minimalist background */
  background-color: #030712; /* deeper very dark blue/black */
  background-image: 
    radial-gradient(at 20% 0%, rgba(30, 27, 75, 0.5) 0px, transparent 60%),
    radial-gradient(at 80% 0%, rgba(15, 23, 42, 0.7) 0px, transparent 60%),
    radial-gradient(at 50% 100%, rgba(8, 47, 73, 0.4) 0px, transparent 70%);
  background-size: 150% 150%;
  animation: ${skyBreathe} 25s ease-in-out infinite;

  /* Subtle static starry texture overlay using a tiny dot pattern */
  &::after {
    content: '';
    position: absolute;
    top: 0;left: 0;right: 0;bottom: 0;
    background-image: radial-gradient(#ffffff 1px, transparent 1px);
    background-size: 50px 50px;
    background-position: 0 0;
    opacity: 0.03;
    z-index: 1;
  }
`;

const Star = styled.div<{ top: number, left: number, size: number, delay: number, duration: number }>`
  position: absolute;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 ${props => props.size * 2}px rgba(255, 255, 255, 0.8);
  animation: ${starTwinkle} ${props => props.duration}s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  opacity: 0.8;
  z-index: 2;
`;

const Meteor = styled.div<{ delay: number, top: number, left: number, duration: number, width: number }>`
  position: absolute;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  width: ${props => props.width}px;
  height: 1.5px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.9), transparent);
  animation: ${meteorAnimation} ${props => props.duration}s linear infinite;
  animation-delay: ${props => props.delay}s;
  transform: rotate(-45deg);
  opacity: 0;
  transform-origin: left center;
  z-index: 3;
  
  &::before {
    content: '';
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #fff;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    box-shadow: 0 0 12px 3px rgba(255, 255, 255, 0.8);
  }
`;

export default function MeteorBackground() {
  const meteors = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    delay: Math.random() * 20,
    top: -20 + Math.random() * 60,
    left: 40 + Math.random() * 120,
    duration: 15 + Math.random() * 15,
    width: 80 + Math.random() * 120,
  }));

  const stars = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 1 + Math.random() * 1.5,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4
  }));

  return (
    <MeteorContainer>
      {stars.map(s => (
        <Star key={s.id} top={s.top} left={s.left} size={s.size} delay={s.delay} duration={s.duration} />
      ))}
      {meteors.map(m => (
        <Meteor key={m.id} delay={m.delay} top={m.top} left={m.left} duration={m.duration} width={m.width} />
      ))}
    </MeteorContainer>
  );
}
