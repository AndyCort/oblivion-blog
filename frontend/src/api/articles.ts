import axios from 'axios'

const api = axios.create({
    baseURL: '/api'
})

export interface Article {
    id: string
    title: { [key: string]: string } | string
    summary?: { [key: string]: string } | string
    content?: { [key: string]: string } | string
    date: string
    author?: string
    cover?: string
    featuredImage?: string
    tags?: string[]
}

export async function fetchArticles(): Promise<Article[]> {
    const response = await api.get('/articles')
    return response.data
}

export async function fetchArticle(id: string): Promise<Article> {
    const response = await api.get(`/articles/${id}`)
    return response.data
}

export async function searchArticles(query: string): Promise<Article[]> {
    const response = await api.get(`/articles/search/${query}`)
    return response.data
}
