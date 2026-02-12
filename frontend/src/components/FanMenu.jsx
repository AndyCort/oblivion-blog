import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import styled, { keyframes, css } from 'styled-components'

const menuItems = [
    { icon: 'fas fa-home', label: '首页' },
    { icon: 'fas fa-search', label: '搜索' },
    { icon: 'fas fa-user', label: '用户' },
    { icon: 'fas fa-cog', label: '设置' },
    { icon: 'fas fa-bell', label: '通知' },
    { icon: 'fas fa-envelope', label: '邮件' },
    { icon: 'fas fa-star', label: '收藏' },
    { icon: 'fas fa-heart', label: '喜欢' },
    { icon: 'fas fa-bookmark', label: '书签' },
    { icon: 'fas fa-music', label: '音乐' },
    { icon: 'fas fa-camera', label: '相机' },
    { icon: 'fas fa-palette', label: '主题' },
]

const INNER_R = 70
const OUTER_R = 170
const MID_R = (INNER_R + OUTER_R) / 2
const ITEM_SPAN = 30
const VISIBLE_ARC = 180
const CENTER = 200

function polarToXY(cx, cy, r, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const arcIn = keyframes`
  0% { opacity: 0; transform: rotate(var(--angle)) translateY(0) scale(0); }
  100% { opacity: 1; transform: rotate(var(--angle)) translateY(calc(-1 * var(--mid-r))) scale(1); }
`

const Wrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  z-index: 99999;
  pointer-events: none;
`

const CoreBtn = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.45), 0 0 40px rgba(118, 75, 162, 0.2);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: auto;

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 0 6px 28px rgba(102, 126, 234, 0.6), 0 0 60px rgba(118, 75, 162, 0.3);
  }
  &:active { transform: translate(-50%, -50%) scale(0.95); }
`

const CoreIcon = styled.span`
  display: inline-block;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  line-height: 1;
  font-weight: 300;
  transform: ${(p) => (p.$open ? 'rotate(45deg)' : 'none')};
`

const RingSector = styled.div`
  position: absolute;
  inset: 0;
  opacity: ${(p) => (p.$open ? 1 : 0)};
  transform: ${(p) => (p.$open ? 'scale(1) rotate(-45deg)' : 'scale(0.5)')};
  transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: ${(p) => (p.$open ? 'auto' : 'none')};
`

const ItemsClip = styled.div`
  position: absolute;
  inset: 0;
`

const ItemsLayer = styled.div`
  position: absolute;
  inset: 0;
`

const DragSurface = styled.div`
  position: absolute;
  inset: 0;
  cursor: grab;
  &:active { cursor: grabbing; }
`

const MenuItem = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 52px;
  height: 52px;
  margin: -26px 0 0 -26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.25s, box-shadow 0.25s, transform 0.25s;
  transform: rotate(var(--angle)) translateY(calc(-1 * var(--mid-r)));
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 12px rgba(102, 126, 234, 0.35);
    transform: rotate(var(--angle)) translateY(calc(-1 * var(--mid-r))) scale(1.15);
  }

  ${(p) => p.$open && css`animation: ${arcIn} 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;`}
  animation-delay: ${(p) => p.$delay || '0s'};
`

const ItemLabel = styled.span`
  font-size: 9px;
  letter-spacing: 0.3px;
  opacity: 0.9;
  white-space: nowrap;
`

export default function FanMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [rotation, setRotation] = useState(0)
    const wrapperRef = useRef(null)
    const dragRef = useRef({ isDragging: false, startAngle: 0, startRotation: 0, lastAngle: 0, lastTime: 0, velocity: 0 })
    const animIdRef = useRef(null)

    const sectorBgPath = useMemo(() => {
        const startAngle = -VISIBLE_ARC / 2
        const endAngle = VISIBLE_ARC / 2
        const largeArc = VISIBLE_ARC > 180 ? 1 : 0
        const outerStart = polarToXY(CENTER, CENTER, OUTER_R, startAngle)
        const outerEnd = polarToXY(CENTER, CENTER, OUTER_R, endAngle)
        const innerStart = polarToXY(CENTER, CENTER, INNER_R, endAngle)
        const innerEnd = polarToXY(CENTER, CENTER, INNER_R, startAngle)
        return [
            `M ${outerStart.x} ${outerStart.y}`,
            `A ${OUTER_R} ${OUTER_R} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
            `L ${innerStart.x} ${innerStart.y}`,
            `A ${INNER_R} ${INNER_R} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
            `Z`,
        ].join(' ')
    }, [])

    const toggle = () => {
        setIsOpen((prev) => { if (prev) setRotation(0); return !prev })
    }

    const getItemStyle = (index) => {
        const totalSpan = (menuItems.length - 1) * ITEM_SPAN
        const startOffset = -totalSpan / 2
        const angle = startOffset + index * ITEM_SPAN
        return { '--angle': `${angle}deg`, '--mid-r': `${MID_R}px` }
    }

    const getCenter = useCallback(() => {
        if (!wrapperRef.current) return { cx: window.innerWidth / 2, cy: window.innerHeight / 2 }
        const rect = wrapperRef.current.getBoundingClientRect()
        return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 }
    }, [])

    const angleFromEvent = useCallback((e) => {
        const point = e.touches ? e.touches[0] || e.changedTouches[0] : e
        const { cx, cy } = getCenter()
        return Math.atan2(point.clientY - cy, point.clientX - cx) * (180 / Math.PI)
    }, [getCenter])

    const onDragStart = useCallback((e) => {
        if (!isOpen) return
        if (animIdRef.current !== null) { cancelAnimationFrame(animIdRef.current); animIdRef.current = null }
        const drag = dragRef.current
        drag.isDragging = true
        drag.startAngle = angleFromEvent(e)
        drag.startRotation = rotation
        drag.lastAngle = drag.startAngle
        drag.lastTime = performance.now()
        drag.velocity = 0
    }, [isOpen, rotation, angleFromEvent])

    useEffect(() => {
        const drag = dragRef.current
        const onDragMove = (e) => {
            if (!drag.isDragging) return
            const cur = angleFromEvent(e)
            const now = performance.now()
            const dt = now - drag.lastTime
            let diff = cur - drag.startAngle
            while (diff > 180) diff -= 360
            while (diff < -180) diff += 360
            setRotation(drag.startRotation + diff)
            if (dt > 0) {
                let instant = cur - drag.lastAngle
                while (instant > 180) instant -= 360
                while (instant < -180) instant += 360
                drag.velocity = (instant / dt) * 16
            }
            drag.lastAngle = cur
            drag.lastTime = now
        }
        const inertia = () => {
            const friction = 0.92
            const min = 0.05
            const step = () => {
                drag.velocity *= friction
                if (Math.abs(drag.velocity) < min) { drag.velocity = 0; animIdRef.current = null; return }
                setRotation((prev) => prev + drag.velocity)
                animIdRef.current = requestAnimationFrame(step)
            }
            if (Math.abs(drag.velocity) > min) animIdRef.current = requestAnimationFrame(step)
        }
        const onDragEnd = () => {
            drag.isDragging = false
            window.removeEventListener('mousemove', onDragMove)
            window.removeEventListener('mouseup', onDragEnd)
            window.removeEventListener('touchmove', onDragMove)
            window.removeEventListener('touchend', onDragEnd)
            inertia()
        }
        if (drag.isDragging) {
            window.addEventListener('mousemove', onDragMove)
            window.addEventListener('mouseup', onDragEnd)
            window.addEventListener('touchmove', onDragMove, { passive: true })
            window.addEventListener('touchend', onDragEnd)
        }
        return () => {
            window.removeEventListener('mousemove', onDragMove)
            window.removeEventListener('mouseup', onDragEnd)
            window.removeEventListener('touchmove', onDragMove)
            window.removeEventListener('touchend', onDragEnd)
        }
    }, [angleFromEvent])

    useEffect(() => {
        return () => { if (animIdRef.current !== null) cancelAnimationFrame(animIdRef.current) }
    }, [])

    return (
        <Wrapper ref={wrapperRef}>
            <RingSector $open={isOpen}>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 400 400">
                    <defs>
                        <clipPath id="arcClip">
                            <path d={sectorBgPath} />
                        </clipPath>
                    </defs>
                    <path d={sectorBgPath} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 20px rgba(102,126,234,0.15))' }} />
                </svg>
                <ItemsClip style={{ clipPath: 'url(#arcClip)' }}>
                    <ItemsLayer style={{ transform: `rotate(${rotation}deg)` }}>
                        {menuItems.map((item, index) => (
                            <MenuItem
                                key={index}
                                $open={isOpen}
                                $delay={`${index * 0.02}s`}
                                style={getItemStyle(index)}
                                onClick={(e) => { e.stopPropagation(); console.log('Clicked:', item.label) }}
                            >
                                <i className={item.icon}></i>
                                <ItemLabel>{item.label}</ItemLabel>
                            </MenuItem>
                        ))}
                    </ItemsLayer>
                </ItemsClip>
                <DragSurface onMouseDown={(e) => { e.preventDefault(); onDragStart(e) }} onTouchStart={onDragStart} />
            </RingSector>

            <CoreBtn onClick={toggle}>
                <CoreIcon $open={isOpen}>+</CoreIcon>
            </CoreBtn>
        </Wrapper>
    )
}
