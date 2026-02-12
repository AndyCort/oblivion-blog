import { useState, useEffect } from 'react'
import styled from 'styled-components'

const Bar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #ff8d9f;
  z-index: 10000;
  transform-origin: left;
  transition: transform 0.2s ease;
`

export default function ScrollingBar() {
    const [scrollProgress, setScrollProgress] = useState(0)

    useEffect(() => {
        const updateScroll = () => {
            const scrollY = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            setScrollProgress(docHeight > 0 ? scrollY / docHeight : 0)
        }
        window.addEventListener('scroll', updateScroll)
        return () => window.removeEventListener('scroll', updateScroll)
    }, [])

    return <Bar style={{ transform: `scaleX(${scrollProgress})` }} />
}
