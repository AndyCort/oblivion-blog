import axios from 'axios'

const api = axios.create({
    baseURL: '/api'
})

export async function fetchArticles() {
    const response = await api.get('/articles')
    return response.data
}

export async function fetchArticle(id) {
    const response = await api.get(`/articles/${id}`)
    return response.data
}

export async function searchArticles(query) {
    const response = await api.get(`/articles/search/${query}`)
    return response.data
}
