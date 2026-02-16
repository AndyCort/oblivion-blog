import { useState, useRef, useCallback, useEffect } from 'react'

interface TypewriterOptions {
    typeSpeed?: number
    deleteSpeed?: number
}

export function useTypewriter({ typeSpeed = 80, deleteSpeed = 40 }: TypewriterOptions = {}) {
    const [displayText, setDisplayText] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const textRef = useRef('') // Source of truth for animation logic steps
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const clearAnimation = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        setIsTyping(false)
    }, [])

    const updateText = useCallback((newText: string) => {
        textRef.current = newText
        setDisplayText(newText)
    }, [])

    const type = useCallback((targetText: string, onComplete?: () => void) => {
        const current = textRef.current
        if (current === targetText) {
            onComplete?.()
            return
        }

        // Safety check: if target doesn't start with current, restart from empty or just append?
        // Logic assumes we start typing from empty or matching prefix.
        // If current is empty, target starts with empty string.
        const nextChar = targetText[current.length]
        if (nextChar) {
            updateText(current + nextChar)
            timeoutRef.current = setTimeout(() => type(targetText, onComplete), typeSpeed)
        } else {
            onComplete?.()
        }
    }, [typeSpeed, updateText])

    const del = useCallback((onComplete: () => void) => {
        const current = textRef.current
        if (current.length === 0) {
            onComplete()
            return
        }

        updateText(current.slice(0, -1))
        timeoutRef.current = setTimeout(() => del(onComplete), deleteSpeed)
    }, [deleteSpeed, updateText])

    const start = useCallback((newText: string, onComplete?: () => void) => {
        clearAnimation()
        setIsTyping(true)

        const handleComplete = () => {
            setIsTyping(false)
            onComplete?.()
        }

        const startTyping = () => {
            type(newText, handleComplete)
        }

        if (textRef.current.length > 0) {
            del(startTyping)
        } else {
            startTyping()
        }
    }, [clearAnimation, del, type])

    // Cleanup on unmount
    useEffect(() => {
        return clearAnimation
    }, [clearAnimation])

    return { displayText, start, clearAnimation, isTyping }
}
