import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';
import { useTheme } from '../stores/ThemeContext';
import MDEditor from '@uiw/react-md-editor';
import { API_BASE } from '../api/config';
const EditorContainer = styled.div`
  padding: 100px 24px 40px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 100px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  h1 {
    color: var(--title-color);
  }
`;

const BackButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  
  &:hover {
    background: var(--hover-bg);
    color: var(--hover-color);
  }
`;

const EditorForm = styled.form`
  background: var(--glass-bg-color);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border-color);
  border-radius: 12px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: var(--glass-box-shadow);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    color: var(--text-color);
    font-size: 14px;
    font-weight: 500;
  }

  input, textarea {
    padding: 12px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: rgba(255, 255, 255, 0.05);
    color: var(--title-color);
    font-family: var(--content-font);
    font-size: 15px;
    outline: none;
    transition: all 0.3s ease;

    &:focus {
      border-color: var(--accent-color);
    }
  }

  textarea {
    min-height: 200px;
    resize: vertical;
  }
`;

const DualInputGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const SubmitButton = styled.button`
  padding: 14px;
  border-radius: 8px;
  border: none;
  background: var(--main-color);
  color: var(--theme-color);
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  
  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LanguageToggle = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 4px;
  width: fit-content;
  border: 1px solid var(--border-color);
  margin-bottom: 5px;

  button {
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: var(--text-color);
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
    font-size: 14px;

    &.active {
      background: var(--main-color);
      color: var(--theme-color);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.1);
    }
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  margin-bottom: 20px;
  padding: 10px;
  background: rgba(255, 77, 79, 0.1);
  border-radius: 6px;
`;

const UploadImageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;

  input[type="file"] {
    display: none;
  }

  label {
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    color: var(--text-color);
    transition: all 0.3s;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  span.uploading {
    font-size: 12px;
    color: var(--text-color);
    opacity: 0.7;
  }
`;

export default function ArticleEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin, token } = useAuth();
    const { theme } = useTheme();

    const isEditMode = !!id;

    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [activeLang, setActiveLang] = useState<'zh' | 'en'>('zh');

    const [formData, setFormData] = useState({
        titleZh: '',
        titleEn: '',
        date: new Date().toISOString().split('T')[0],
        tags: '',
        contentZh: '',
        contentEn: '',
        isPublished: true
    });

    const AUTOSAVE_KEY = isEditMode ? `article_autosave_${id}` : 'article_autosave_new';

    useEffect(() => {
        if (!isAdmin) {
            navigate('/login');
            return;
        }

        const restoreDraft = () => {
            const savedDraft = localStorage.getItem(AUTOSAVE_KEY);
            if (savedDraft) {
                if (window.confirm('An unsaved draft was found. Do you want to restore it?')) {
                    try {
                        const draftData = JSON.parse(savedDraft);
                        setFormData(draftData);
                    } catch (e) {
                        console.error("Failed to parse draft", e);
                    }
                } else {
                    localStorage.removeItem(AUTOSAVE_KEY);
                }
            }
        };

        if (isEditMode) {
            fetchArticle().then(() => {
                restoreDraft();
            });
        } else {
            restoreDraft();
        }
    }, [isAdmin, isEditMode, id, navigate]);

    // Auto-save effect
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only auto-save if there's significant content to save
            if (formData.titleZh || formData.titleEn || formData.contentZh || formData.contentEn) {
                localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
            }
        }, 3000); // Debounce auto-save every 3 seconds

        return () => clearTimeout(timer);
    }, [formData, AUTOSAVE_KEY]);

    const fetchArticle = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/articles/${id}`);
            if (!response.ok) throw new Error('Failed to fetch article');

            const data = await response.json();
            setFormData({
                titleZh: data.title.zh || '',
                titleEn: data.title.en || '',
                date: data.date || '',
                tags: data.tags ? data.tags.join(', ') : '',
                contentZh: data.content.zh || '',
                contentEn: data.content.en || '',
                isPublished: data.isPublished !== false // default to true if missing
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const uploadImage = async (file: File): Promise<string> => {
        const formDataPayload = new FormData();
        formDataPayload.append('image', file);

        const response = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formDataPayload
        });

        if (!response.ok) {
            throw new Error('Image upload failed');
        }

        const data = await response.json();
        return data.url;
    };

    const uploadAndInsertImage = async (file: File, targetField: 'contentZh' | 'contentEn') => {
        setIsUploading(true);
        try {
            const url = await uploadImage(file);
            const imageMarkdown = `\n![${file.name}](${url})\n`;
            setFormData(prev => ({
                ...prev,
                [targetField]: prev[targetField] + imageMarkdown
            }));
        } catch (err: any) {
            setError(err.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'contentZh' | 'contentEn') => {
        const file = e.target.files?.[0];
        if (!file) return;

        await uploadAndInsertImage(file, targetField);
        e.target.value = ''; // Reset input to allow uploading same file again
    };

    const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const file = items[i].getAsFile();
                if (file) {
                    await uploadAndInsertImage(file, activeLang === 'zh' ? 'contentZh' : 'contentEn');
                }
            }
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        const files = e.dataTransfer?.files;
        if (!files) return;

        for (let i = 0; i < files.length; i++) {
            if (files[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                await uploadAndInsertImage(files[i], activeLang === 'zh' ? 'contentZh' : 'contentEn');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            const payload = {
                title: {
                    zh: formData.titleZh,
                    en: formData.titleEn
                },
                date: formData.date,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                content: {
                    zh: formData.contentZh,
                    en: formData.contentEn
                },
                isPublished: formData.isPublished
            };

            const url = isEditMode
                ? `${API_BASE}/api/articles/${id}`
                : `${API_BASE}/api/articles`;

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save article');
            }

            // Success, go back to admin dashboard
            localStorage.removeItem(AUTOSAVE_KEY);
            navigate('/admin');
        } catch (err: any) {
            setError(err.message);
            setIsSaving(false);
        }
    };

    if (isLoading) return <EditorContainer>Loading article...</EditorContainer>;

    return (
        <EditorContainer>
            <Header>
                <h1>{isEditMode ? 'Edit Article' : 'Write New Article'}</h1>
                <BackButton onClick={() => navigate('/admin')}>Cancel</BackButton>
            </Header>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <EditorForm onSubmit={handleSubmit}>
                <LanguageToggle>
                    <button
                        type="button"
                        className={activeLang === 'zh' ? 'active' : ''}
                        onClick={() => setActiveLang('zh')}
                    >
                        中文 (Chinese)
                    </button>
                    <button
                        type="button"
                        className={activeLang === 'en' ? 'active' : ''}
                        onClick={() => setActiveLang('en')}
                    >
                        English
                    </button>
                </LanguageToggle>

                <FormGroup>
                    <label>Title {activeLang === 'zh' ? '(Chinese)' : '(English)'}</label>
                    <input
                        required
                        name={activeLang === 'zh' ? "titleZh" : "titleEn"}
                        value={activeLang === 'zh' ? formData.titleZh : formData.titleEn}
                        onChange={handleChange}
                        placeholder={activeLang === 'zh' ? "E.g., 为什么天空是蓝色的" : "E.g., Why is the sky blue"}
                    />
                </FormGroup>

                <DualInputGroup>
                    <FormGroup>
                        <label>Date</label>
                        <input
                            required
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label>Tags (Comma separated)</label>
                        <input
                            required
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="Tech, React, Frontend"
                        />
                    </FormGroup>
                </DualInputGroup>

                <FormGroup>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <label>Content {activeLang === 'zh' ? '(Chinese)' : '(English)'}</label>
                        <UploadImageContainer>
                            <label htmlFor={`upload-${activeLang}`}>
                                <i className="fa-solid fa-image" style={{ marginRight: '6px', fontSize: '13px' }}></i>
                                Insert Image
                            </label>
                            <input
                                id={`upload-${activeLang}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, activeLang === 'zh' ? 'contentZh' : 'contentEn')}
                            />
                            {isUploading && <span className="uploading">Uploading...</span>}
                        </UploadImageContainer>
                    </div>
                    <div
                        data-color-mode={theme}
                        onPaste={handlePaste}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <MDEditor
                            value={activeLang === 'zh' ? formData.contentZh : formData.contentEn}
                            onChange={(val) => setFormData(prev => ({
                                ...prev,
                                [activeLang === 'zh' ? 'contentZh' : 'contentEn']: val || ''
                            }))}
                            height={700}
                        />
                    </div>
                </FormGroup>

                <FormGroup style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                    <input
                        type="checkbox"
                        id="isPublished"
                        name="isPublished"
                        checked={formData.isPublished}
                        onChange={handleChange}
                        style={{ width: 'auto' }}
                    />
                    <label htmlFor="isPublished">Publish immediately (uncheck to save as draft)</label>
                </FormGroup>

                <SubmitButton type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : (isEditMode ? 'Update Article' : 'Publish Article')}
                </SubmitButton>
            </EditorForm>
        </EditorContainer>
    );
}
