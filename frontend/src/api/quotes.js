/**
 * Quote API - Fetches random quotes based on locale
 * Chinese: Uses Hitokoto API (一言)
 * English: Uses ZenQuotes API
 */

// Hitokoto API for Chinese quotes
const CN_QUOTE_API = 'https://card.gudong.site/api/random-note/'

// ZenQuotes API for English quotes
const EN_QUOTE_API = 'https://zenquotes.io/api/random'

/**
 * Fetch a random Chinese quote from API
 * @returns {Promise<string>} The quote text
 */
async function fetchChineseQuote() {
    try {
        const response = await fetch(CN_QUOTE_API)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const quote = data.content
        const source = data.author
        return source ? `${quote} —— ${source}` : quote
    } catch (error) {
        console.error('Failed to fetch Chinese quote:', error)
        throw error
    }
}

/**
 * Fetch a random English quote from ZenQuotes API
 * @returns {Promise<string>} The quote text
 */
async function fetchEnglishQuote() {
    try {
        // ZenQuotes has CORS restrictions, we need to use a proxy or alternative
        // Using a CORS proxy for development
        const response = await fetch(EN_QUOTE_API)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        // ZenQuotes returns: [{ q: "quote", a: "author" }]
        const quote = data[0]?.q || data[0]?.quote
        const author = data[0]?.a || data[0]?.author
        return author ? `${quote} — ${author}` : quote
    } catch (error) {
        console.error('Failed to fetch English quote:', error)
        // Fallback to an alternative API if ZenQuotes fails (CORS issues)
        return fetchEnglishQuoteFallback()
    }
}

/**
 * Fallback English quote API using quotable.io
 * @returns {Promise<string>} The quote text
 */
async function fetchEnglishQuoteFallback() {
    try {
        const response = await fetch('https://api.quotable.io/random')
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        // quotable.io returns: { content: "quote", author: "author" }
        const quote = data.content
        const author = data.author
        return author ? `${quote} — ${author}` : quote
    } catch (error) {
        console.error('Failed to fetch English quote from fallback:', error)
        throw error
    }
}

/**
 * Fetch a random quote based on the current locale
 * @param {string} locale - The current locale ('zh-CN' or 'en-US')
 * @returns {Promise<string>} The quote text
 */
export async function fetchRandomQuote(locale = 'zh-CN') {
    if (locale === 'zh-CN' || locale.startsWith('zh')) {
        return fetchChineseQuote()
    } else {
        return fetchEnglishQuote()
    }
}

export default {
    fetchRandomQuote
}
