import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, useMotionValue, useTransform, PanInfo, animate, useSpring } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faGear, faBell, faMagnifyingGlass, faStar, faHeart, faMusic } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useMusicContext } from '../stores/MusicContext';

// --- Constants & Config ---
const BUTTON_SIZE = 40;
const OUTER_RADIUS = 160;
const MENU_RADIUS = 75; // Radius where items sit
const ITEM_SIZE = 40;
const FAN_ANGLE = 90; // Degrees of the visible arc
const ITEM_SPACING = 35; // Degrees between items

// --- Styled Components ---

const Wrapper = styled.div`
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MenuContainer = styled(motion.div)`
  position: absolute;
  // Position so bottom-right corner aligns with button center (20px from Wrapper edges)
  bottom: 20px; 
  right: 20px; 
  width: ${OUTER_RADIUS * 2}px;
  height: ${OUTER_RADIUS * 2}px;
  transform-origin: 100% 100%;
  pointer-events: none;
`;


// Interaction zone that covers the sector
const InteractionZone = styled(motion.div)`
  position: absolute;
  bottom: 0;
  right: 0;
  width: ${OUTER_RADIUS}px;
  height: ${OUTER_RADIUS}px;
  border-radius: 100% 0 0 0;
  cursor: grab;
  pointer-events: auto;
  &:active {
    cursor: grabbing;
  }
`;

const MenuItem = styled(motion.button)`
  position: absolute;
  width: ${ITEM_SIZE}px;
  height: ${ITEM_SIZE}px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--frame-color);
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  padding: 0;
  pointer-events: auto;
`;

const TriggerButton = styled(motion.button)`
  width: ${BUTTON_SIZE}px;
  height: ${BUTTON_SIZE}px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 1002;
  cursor: pointer;
  outline: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);

  &:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;

// --- Helpers ---
const toRad = (deg: number) => (deg * Math.PI) / 180;

const coreIcon = <FontAwesomeIcon icon={faCircle} size="xl" />;

const SideButton: React.FC = () => {
    const navigate = useNavigate();
    const { toggleMusic } = useMusicContext();
    const [isOpen, setIsOpen] = useState(false);

    // Menu items with click handlers
    const menuItems = [
        {
            id: 1,
            icon: <FontAwesomeIcon icon={faHouse} size="xl" />,
            label: 'Home',
            onClick: () => {
                navigate('/');
                setIsOpen(false);
            }
        },
        {
            id: 2,
            icon: <FontAwesomeIcon icon={faMusic} size="xl" />,
            label: 'Music',
            onClick: () => {
                toggleMusic();
                setIsOpen(false);
            }
        },
        { id: 3, icon: <FontAwesomeIcon icon={faGear} size="xl" />, label: 'Settings' },
        { id: 4, icon: <FontAwesomeIcon icon={faBell} size="xl" />, label: 'Notifications' },
        { id: 5, icon: <FontAwesomeIcon icon={faMagnifyingGlass} size="xl" />, label: 'Search' },
        { id: 6, icon: <FontAwesomeIcon icon={faStar} size="xl" />, label: 'Favorites' },
        { id: 7, icon: <FontAwesomeIcon icon={faHeart} size="xl" />, label: 'Likes' },
    ];

    // Rotation Logic
    const rotation = useMotionValue(0);
    const rotationSpring = useSpring(rotation, { stiffness: 150, damping: 20 });

    const minRot = -FAN_ANGLE + 15; // Buffer
    const maxRot = ((menuItems.length - 1) * ITEM_SPACING) - 15; // Buffer

    const handlePan = (_: any, info: PanInfo) => {
        const sensitivity = 0.8;
        const delta = -info.delta.y + info.delta.x;

        const current = rotation.get();
        let next = current + delta * sensitivity;

        // Elastic constraint
        if (next < minRot) next = minRot - (minRot - next) * 0.2;
        if (next > maxRot) next = maxRot - (next - maxRot) * 0.2;

        rotation.set(next);
    };

    const handlePanEnd = () => {
        const current = rotation.get();
        if (current < minRot) rotation.set(minRot); // snap back
        else if (current > maxRot) rotation.set(maxRot); // snap back
    };

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault(); // Prevent page scroll
        const current = rotation.get();
        let newRot = current + (e.deltaY > 0 ? -20 : 20);
        // constraints
        if (newRot < minRot) newRot = minRot;
        if (newRot > maxRot) newRot = maxRot;
        if (isOpen) {
            animate(rotation, newRot, { type: "spring", stiffness: 200, damping: 20 });
        }
    }, [isOpen, rotation, minRot, maxRot]);

    // Use native event listener to prevent scroll with passive: false
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        wrapper.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            wrapper.removeEventListener('wheel', handleWheel);
        };
    }, [isOpen, rotation, minRot, maxRot]);

    return (
        <Wrapper ref={wrapperRef}>
            {/* Menu Sector */}
            <MenuContainer
                initial={false}
                animate={isOpen ? "open" : "closed"}
                variants={{
                    open: {
                        opacity: 1,
                        scale: 1,
                        transition: { type: "spring", stiffness: 100, damping: 15 } // bounce
                    },
                    closed: {
                        opacity: 0,
                        scale: 0.8,
                        transition: { duration: 0.2 }
                    }
                }}
            >
                <InteractionZone
                    onPan={handlePan}
                    onPanEnd={handlePanEnd}
                />

                {/* Items */}
                {menuItems.map((item, index) => {
                    return (
                        <MovingItem
                            key={item.id}
                            index={index}
                            rotation={rotationSpring}
                            icon={item.icon}
                            isOpen={isOpen}
                            onClick={item.onClick}
                        />
                    );
                })}
            </MenuContainer>

            {/* Trigger */}
            <TriggerButton
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) rotation.set(0); // Reset on open
                }}
                whileTap={{ scale: 0.9 }}
                animate={{ rotate: isOpen ? 135 : 0 }}
            >
                {coreIcon}
            </TriggerButton>
        </Wrapper>
    );
};

// Subcomponent to handle individual motion value transforms
// This avoids re-rendering the parent on every frame
const MovingItem = ({ index, rotation, icon, isOpen, onClick }: { index: number, rotation: any, icon: any, isOpen: boolean, onClick?: () => void }) => {
    const baseAngle = 270 - (index * ITEM_SPACING); // 270, 240, 210...

    // Transform rotation -> x, y
    const x = useTransform(rotation, (r: number) => {
        const theta = toRad(baseAngle + r);
        return (OUTER_RADIUS * 2) + (MENU_RADIUS * Math.cos(theta));
    });

    const y = useTransform(rotation, (r: number) => {
        const theta = toRad(baseAngle + r);
        return (OUTER_RADIUS * 2) + (MENU_RADIUS * Math.sin(theta));
    });

    // Visibility: smooth fade at edges
    const opacity = useTransform(rotation, (r: number) => {
        if (!isOpen) return 0;
        const angle = baseAngle + r;
        // Fade out gradually outside the visible range
        if (angle > 285) return Math.max(0, 1 - (angle - 285) / 20);
        if (angle < 165) return Math.max(0, 1 - (165 - angle) / 20);
        // Gentle fade at edges of visible range
        if (angle > 275) return 1 - (angle - 275) / 10;
        if (angle < 175) return 1 - (175 - angle) / 10;
        return 1;
    });

    // Scale: smooth transition at edges
    const scale = useTransform(rotation, (r: number) => {
        const angle = baseAngle + r;
        // Smooth scale down outside visible range
        if (angle > 275) return Math.max(0.6, 1 - (angle - 275) / 30);
        if (angle < 175) return Math.max(0.6, 1 - (175 - angle) / 30);
        return 1;
    });

    return (
        <MenuItem
            style={{
                left: 0, top: 0, // Reset, use x/y to position
                x: useTransform(x, (val) => val - ITEM_SIZE / 2),
                y: useTransform(y, (val) => val - ITEM_SIZE / 2),
                opacity,
                scale
            }}
            onClick={onClick}
        >
            {icon}
        </MenuItem>
    );
}

export default SideButton;
