import { useState, useEffect, useMemo, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
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

const spinKf = keyframes`to { transform: rotate(360deg); }`;

const UpdateBtn = styled.button<{ $status: 'idle' | 'pulling' | 'ok' | 'err' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--glass-border-color);
  background: rgba(255,255,255,0.05);
  color: ${p => p.$status === 'ok' ? '#48c78e' : p.$status === 'err' ? '#ff7070' : 'var(--text-color)'};
  transition: all 0.2s;
  &:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SpinIcon = styled.span`
  display: inline-block;
  animation: ${spinKf} 0.8s linear infinite;
`;

const LogOverlay = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 420px;
  max-height: 280px;
  background: rgba(10,10,18,0.96);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const LogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  font-size: 13px;
  font-weight: 600;
  color: var(--title-color);

  button {
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    &:hover { color: var(--title-color); }
  }
`;

const LogBody = styled.pre`
  flex: 1;
  margin: 0;
  padding: 12px 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #b0bec5;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
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
  const [activeTab, setActiveTab] = useState<'articles' | 'settings'>('articles');
  const itemsPerPage = 10;

  // ── Git pull state ────────────────────────────────────────────────────────
  const [pullStatus, setPullStatus] = useState<'idle' | 'pulling' | 'ok' | 'err'>('idle');
  const [pullLog, setPullLog] = useState('');
  const [showLog, setShowLog] = useState(false);
  const logBodyRef = useRef<HTMLPreElement>(null);
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  useEffect(() => {
    if (logBodyRef.current) logBodyRef.current.scrollTop = logBodyRef.current.scrollHeight;
  }, [pullLog]);

  const handlePull = async () => {
    if (pullStatus === 'pulling') return;
    setPullStatus('pulling');
    setPullLog('');
    setShowLog(true);
    const stripAnsi = (s: string) => s.replace(/\x1B\[[0-9;]*[A-Za-z]/g, '').replace(/\r/g, '');
    try {
      const res = await fetch(`${API_BASE}/api/deploy/pull`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok || !res.body) { setPullStatus('err'); setPullLog('❌ 请求失败'); return; }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!mountedRef.current) { reader.cancel(); return; }
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n'); buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const ev = JSON.parse(line.slice(6)) as { type: string; data: unknown };
            if (!mountedRef.current) return;
            if (ev.type === 'log') setPullLog(p => p + stripAnsi(ev.data as string));
            else if (ev.type === 'done') setPullStatus((ev.data as { success: boolean }).success ? 'ok' : 'err');
          } catch (_) { }
        }
      }
    } catch (e) {
      if (mountedRef.current) { setPullLog(p => p + `\n❌ ${String(e)}`); setPullStatus('err'); }
    }
  };

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
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <UpdateBtn
            $status={pullStatus}
            disabled={pullStatus === 'pulling'}
            onClick={handlePull}
            title="从 GitHub 拉取最新代码"
          >
            {pullStatus === 'pulling' ? <SpinIcon>🔄</SpinIcon> :
              pullStatus === 'ok' ? '✅' :
                pullStatus === 'err' ? '❌' : '🔄'}
            {pullStatus === 'pulling' ? '更新中…' :
              pullStatus === 'ok' ? '已更新' :
                pullStatus === 'err' ? '失败' : 'Update'}
          </UpdateBtn>
          {activeTab === 'articles' && (
            <NewButton onClick={() => navigate('/admin/new')}>
              Write New Article
            </NewButton>
          )}
        </div>
      </Header>

      <Tabs>
        <TabButton active={activeTab === 'articles'} onClick={() => setActiveTab('articles')}>
          Articles Management
        </TabButton>
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
          Site Settings
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

      {/* ── Git pull log overlay ── */}
      {showLog && (
        <LogOverlay>
          <LogHeader>
            <span>🔄 GitHub Update</span>
            <button onClick={() => { setShowLog(false); if (pullStatus !== 'pulling') setPullStatus('idle'); }}>✕</button>
          </LogHeader>
          <LogBody ref={logBodyRef}>{pullLog || '正在连接…'}</LogBody>
        </LogOverlay>
      )}
    </AdminContainer>
  );
}
