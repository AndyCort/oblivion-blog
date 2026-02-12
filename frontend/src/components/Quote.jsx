import { useState, useEffect, useRef, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import { useLocale } from '../stores/LocaleContext'
import { fetchRandomQuote } from '../api/quotes'

const AUTO_REFRESH_INTERVAL = 10000

const blink = keyframes`
  50% { opacity: 0; }
`

const QuoteBox = styled.div`
  text-align: center;
  color: var(--frame-color);
  max-width: 600px;
  border-radius: 5px;
  padding: 10px;
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  background-color: var(--glass-bg-color);
  box-shadow: 0 4px 30px #00000030;

  @media (max-width: 768px) { margin: 0 20px; }
`

const QuoteIcon = styled.div`
  font-size: clamp(1rem, 2.5vh, 2rem);
`

const QuoteContent = styled.div`
  font-family: var(--content-font);
  font-size: clamp(1rem, 1.5vh + 0.5rem, 1.4rem);
  margin: clamp(0.5rem, 1.5vh, 1.5rem) 0;

  &::after {
    content: '|';
    margin-left: 2px;
    animation: ${blink} 1s infinite;
  }
`

export default function Quote() {
    const { locale } = useLocale()
    const [displayText, setDisplayText] = useState('')
    const [quoteLoading, setQuoteLoading] = useState(false)
    const animationTimerRef = useRef(null)
    const autoRefreshTimerRef = useRef(null)
    const localeRef = useRef(locale)

    useEffect(() => { localeRef.current = locale }, [locale])

    const clearAnimation = useCallback(() => {
        if (animationTimerRef.current) { clearTimeout(animationTimerRef.current); animationTimerRef.current = null }
    }, [])

    const clearAutoRefresh = useCallback(() => {
        if (autoRefreshTimerRef.current) { clearTimeout(autoRefreshTimerRef.current); autoRefreshTimerRef.current = null }
    }, [])

    const refreshQuoteRef = useRef(null)

    const scheduleAutoRefresh = useCallback(() => {
        clearAutoRefresh()
        autoRefreshTimerRef.current = setTimeout(() => refreshQuoteRef.current?.(), AUTO_REFRESH_INTERVAL)
    }, [clearAutoRefresh])

    const startTyping = useCallback((text, onComplete) => {
        let index = 0
        const type = () => {
            if (index < text.length) {
                const char = text[index]; index++
                setDisplayText((prev) => prev + char)
                animationTimerRef.current = setTimeout(type, 80)
            } else { onComplete?.() }
        }
        type()
    }, [])

    const startDeleting = useCallback((currentText, onComplete) => {
        let remaining = currentText
        const deleteChar = () => {
            if (remaining.length > 0) {
                remaining = remaining.slice(0, -1)
                setDisplayText(remaining)
                animationTimerRef.current = setTimeout(deleteChar, 40)
            } else { onComplete?.() }
        }
        deleteChar()
    }, [])

    const animateQuoteChange = useCallback((newQuote, currentDisplayText) => {
        clearAnimation()
        if (currentDisplayText.length > 0) {
            startDeleting(currentDisplayText, () => startTyping(newQuote, scheduleAutoRefresh))
        } else {
            startTyping(newQuote, scheduleAutoRefresh)
        }
    }, [clearAnimation, startDeleting, startTyping, scheduleAutoRefresh])

    const refreshQuote = useCallback(async () => {
        if (quoteLoading) return
        clearAutoRefresh()
        setQuoteLoading(true)
        try {
            const quote = await fetchRandomQuote(localeRef.current)
            setDisplayText((prev) => { animateQuoteChange(quote, prev); return prev })
        } catch (error) {
            console.error('Failed to fetch random quote:', error)
            const errorText = localeRef.current === 'zh-CN' ? '获取名言失败，请稍后重试' : 'Failed to load quote, please try again'
            setDisplayText((prev) => { animateQuoteChange(errorText, prev); return prev })
        } finally {
            setQuoteLoading(false)
        }
    }, [quoteLoading, clearAutoRefresh, animateQuoteChange])

    useEffect(() => { refreshQuoteRef.current = refreshQuote }, [refreshQuote])

    useEffect(() => {
        refreshQuoteRef.current?.()
        return () => { clearAnimation(); clearAutoRefresh() }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const prevLocaleRef = useRef(locale)
    useEffect(() => {
        if (prevLocaleRef.current !== locale) { prevLocaleRef.current = locale; refreshQuoteRef.current?.() }
    }, [locale])

    return (
        <QuoteBox>
            <QuoteIcon><i className="fas fa-quote-left"></i></QuoteIcon>
            <QuoteContent>{displayText}</QuoteContent>
            <QuoteIcon><i className="fas fa-quote-right"></i></QuoteIcon>
        </QuoteBox>
    )
}
