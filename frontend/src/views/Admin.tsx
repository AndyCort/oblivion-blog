import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useAuth } from '../stores/AuthContext';
import { useNavigate } from 'react-router-dom';
import Settings from './Settings';
import { API_BASE } from '../api/config';

const AdminContainer = styled.div`
  padding: 100px 24px 40px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 100px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h1 {
    color: var(--title-color);
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.active ? 'var(--main-color)' : 'var(--text-color)'};
  cursor: pointer;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s;

  &::after {
    content: '';
    position: absolute;
    bottom: -11px;
    left: 0;
    width: ${props => props.active ? '100%' : '0'};
    height: 2px;
    background: var(--main-color);
    transition: width 0.3s ease;
  }

  &:hover {
    color: var(--main-color);
  }
`;

const NewButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: var(--main-color);
  color: var(--theme-color);
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;


const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: var(--glass-bg-color);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border-color);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  span {
    color: var(--text-color);
    font-size: 14px;
    font-weight: 500;
  }

  strong {
    color: var(--title-color);
    font-size: 28px;
    font-weight: bold;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.05);
  color: var(--title-color);
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: var(--accent-color);
  }
`;

const SelectInput = styled.select`
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.05);
  color: var(--title-color);
  font-size: 14px;
  outline: none;
  cursor: pointer;

  option {
    background: var(--bg-color);
    color: var(--title-color);
  }
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 30px;
  
  span {
    color: var(--text-color);
    font-size: 14px;
  }
`;

const PageButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-color);
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background: var(--hover-bg);
    color: var(--hover-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ArticleList = styled.div`
  background: var(--glass-bg-color);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border-color);
  border-radius: 12px;
  overflow: hidden;
`;

const ArticleItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ArticleInfo = styled.div`
  h3 {
    margin: 0 0 4px 0;
    color: var(--title-color);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .badge {
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--border-color);
  }
  
  .badge.draft {
    background: rgba(255, 165, 0, 0.1);
    color: orange;
    border-color: rgba(255, 165, 0, 0.3);
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: var(--text-color);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  
  button {
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background: transparent;
    color: var(--text-color);
    cursor: pointer;
    
    &:hover {
      background: var(--hover-bg);
      color: var(--hover-color);
    }
    
    &.delete {
      color: #ff4d4f;
      border-color: rgba(255, 77, 79, 0.3);
      
      &:hover {
        background: rgba(255, 77, 79, 0.1);
      }
    }
  }
`;

export default function Admin() {
  const { isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'articles' | 'settings' | 'users' | 'themes'>('articles');
  const itemsPerPage = 10;


  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    fetchArticles();
  }, [isAdmin, navigate]);

  const fetchArticles = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/articles/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setArticles(articles.filter((a: any) => a.id !== id));
      } else {
        alert('Failed to delete article');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = articles.length;
    const published = articles.filter((a: any) => a.isPublished !== false).length;
    const drafts = total - published;
    return { total, published, drafts };
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article: any) => {
      const isPublished = article.isPublished !== false;
      if (filterStatus === 'published' && !isPublished) return false;
      if (filterStatus === 'draft' && isPublished) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchZh = article.title?.zh?.toLowerCase().includes(query);
        const matchEn = article.title?.en?.toLowerCase().includes(query);
        if (!matchZh && !matchEn) return false;
      }

      return true;
    });
  }, [articles, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredArticles.slice(start, end);
  }, [filteredArticles, currentPage]);

  if (isLoading) return <AdminContainer>Loading...</AdminContainer>;

  return (
    <AdminContainer>
      <Header>
        <h1>Dashboard</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>

          {activeTab === 'articles' && (
            <NewButton onClick={() => navigate('/admin/new')}>
              New Article
            </NewButton>
          )}
        </div>
      </Header>

      <Tabs>
        <TabButton active={activeTab === 'articles'} onClick={() => setActiveTab('articles')}>
          Articles
        </TabButton>
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
          Settings
        </TabButton>
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          Users
        </TabButton>
        <TabButton active={activeTab === 'themes'} onClick={() => setActiveTab('themes')}>
          Themes
        </TabButton>

      </Tabs>

      {activeTab === 'articles' ? (
        <>
          <StatsGrid>
            <StatCard>
              <span>Total Articles</span>
              <strong>{stats.total}</strong>
            </StatCard>
            <StatCard>
              <span>Published</span>
              <strong>{stats.published}</strong>
            </StatCard>
            <StatCard>
              <span>Drafts</span>
              <strong>{stats.drafts}</strong>
            </StatCard>
          </StatsGrid>

          <FilterBar>
            <SearchInput
              type="text"
              placeholder="Search articles by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SelectInput
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </SelectInput>
          </FilterBar>

          <ArticleList>
            {paginatedArticles.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-color)' }}>
                No articles found matching criteria.
              </div>
            ) : (
              paginatedArticles.map((article: any) => (
                <ArticleItem key={article.id}>
                  <ArticleInfo>
                    <h3>
                      {article.title.zh} / {article.title.en}
                      {article.isPublished === false && <span className="badge draft">Draft</span>}
                    </h3>
                    <p>{article.date}</p>
                  </ArticleInfo>
                  <ActionButtons>
                    <button onClick={() => navigate(`/admin/edit/${article.id}`)}>Edit</button>
                    <button className="delete" onClick={() => handleDelete(article.id)}>Delete</button>
                  </ActionButtons>
                </ArticleItem>
              ))
            )}
          </ArticleList>

          {totalPages > 1 && (
            <PaginationBar>
              <PageButton
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Previous
              </PageButton>
              <span>Page {currentPage} of {totalPages}</span>
              <PageButton
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next
              </PageButton>
            </PaginationBar>
          )}
        </>
      ) : (
        <Settings isTab />
      )}

    </AdminContainer>
  );
}
