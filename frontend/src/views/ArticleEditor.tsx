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

  & > input, & > textarea {
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

  & > textarea {
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

const TagPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--accent-color);
  color: white;
  border-radius: 14px;
  font-size: 13px;
  
  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
    
    &:hover {
      opacity: 1;
    }
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.05);
  min-height: 48px;
  align-items: center;
  
  &:focus-within {
    border-color: var(--accent-color);
  }

  input {
    flex: 1;
    min-width: 120px;
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    outline: none;
    color: var(--title-color);
    font-family: var(--content-font);
    font-size: 15px;
    
    &:focus {
      border: none;
    }
  }
`;

const CoverPreview = styled.div<{ $hasImage: boolean }>`
  width: 100%;
  height: 250px;
  border-radius: 12px;
  border: ${p => p.$hasImage ? 'none' : '2px dashed var(--border-color)'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  background-color: rgba(255,255,255,0.02);

  &:hover {
    border-color: var(--accent-color);
    background-color: rgba(255,255,255,0.05);
    &::after {
      content: 'Upload Cover Photo';
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.5);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
    }
  }

  i {
    font-size: 32px;
    color: var(--text-color);
    margin-bottom: 12px;
  }

  span {
    color: var(--text-color);
    font-size: 14px;
  }
`;

const EditorsGrid = styled.div<{ $dual: boolean }>`
  display: grid;
  grid-template-columns: ${p => p.$dual ? '1fr 1fr' : '1fr'};
  gap: 20px;
  
  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  flex-wrap: wrap;
  gap: 10px;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusText = styled.span`
  font-size: 13px;
  color: var(--text-color);
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 6px;
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
    const [isDualPane, setIsDualPane] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [tagInput, setTagInput] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const [formData, setFormData] = useState({
        titleZh: '',
        titleEn: '',
        coverImage: '',
        date: new Date().toISOString().split('T')[0],
        tags: [] as string[],
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
                        setHasUnsavedChanges(true);
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

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin, isEditMode, id, navigate]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Auto-save effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (hasUnsavedChanges && (formData.titleZh || formData.titleEn || formData.contentZh || formData.contentEn)) {
                localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
                setLastSaved(new Date());
            }
        }, 3000); // Debounce auto-save every 3 seconds

        return () => clearTimeout(timer);
    }, [formData, AUTOSAVE_KEY, hasUnsavedChanges]);

    const fetchArticle = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/articles/${id}`);
            if (!response.ok) throw new Error('Failed to fetch article');

            const data = await response.json();
            setFormData({
                titleZh: data.title.zh || '',
                titleEn: data.title.en || '',
                coverImage: data.coverImage || '',
                date: data.date || '',
                tags: data.tags || [],
                contentZh: data.content.zh || '',
                contentEn: data.content.en || '',
                isPublished: data.isPublished !== false // default to true if missing
            });
            setHasUnsavedChanges(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setHasUnsavedChanges(true);
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

            const textarea = document.activeElement as HTMLTextAreaElement;
            if (textarea && textarea.tagName === 'TEXTAREA') {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                setFormData(prev => {
                    const currentContent = prev[targetField] || '';
                    const newContent = currentContent.substring(0, start) + imageMarkdown + currentContent.substring(end);
                    return { ...prev, [targetField]: newContent };
                });
            } else {
                setFormData(prev => ({
                    ...prev,
                    [targetField]: (prev[targetField] || '') + imageMarkdown
                }));
            }
            setHasUnsavedChanges(true);
        } catch (err: any) {
            setError(err.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadImage(file);
            setFormData(prev => ({ ...prev, coverImage: url }));
            setHasUnsavedChanges(true);
        } catch (err: any) {
            setError(err.message || 'Failed to upload cover image');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'contentZh' | 'contentEn') => {
        const file = e.target.files?.[0];
        if (!file) return;

        await uploadAndInsertImage(file, targetField);
        e.target.value = ''; // Reset input to allow uploading same file again
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.titleZh && !formData.titleEn) {
            setError('Please provide at least one title (ZH or EN)');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const payload = {
                title: {
                    zh: formData.titleZh,
                    en: formData.titleEn
                },
                coverImage: formData.coverImage,
                date: formData.date,
                tags: formData.tags,
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
            setHasUnsavedChanges(false);
            localStorage.removeItem(AUTOSAVE_KEY);
            navigate('/admin');
        } catch (err: any) {
            setError(err.message);
            setIsSaving(false);
        }
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = tagInput.trim();
            if (val && !formData.tags.includes(val)) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, val] }));
                setTagInput('');
                setHasUnsavedChanges(true);
            }
        } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
            setFormData(prev => ({ ...prev, tags: prev.tags.slice(0, -1) }));
            setHasUnsavedChanges(true);
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
        setHasUnsavedChanges(true);
    };

    const getWordCount = (text: string) => {
        if (!text) return 0;
        const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const words = (text.replace(/[\u4e00-\u9fa5]/g, ' ').match(/\b\w+\b/g) || []).length;
        return cjk + words;
    };

    const clearDraft = () => {
        if (window.confirm('Are you sure you want to clear the current draft? This cannot be undone.')) {
            localStorage.removeItem(AUTOSAVE_KEY);
            setFormData({
                titleZh: '',
                titleEn: '',
                coverImage: '',
                date: new Date().toISOString().split('T')[0],
                tags: [] as string[],
                contentZh: '',
                contentEn: '',
                isPublished: true
            });
            setLastSaved(null);
            setHasUnsavedChanges(false);
        }
    };

    const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>, targetField: 'contentZh' | 'contentEn') => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const file = items[i].getAsFile();
                if (file) {
                    await uploadAndInsertImage(file, targetField);
                }
            }
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetField: 'contentZh' | 'contentEn') => {
        const files = e.dataTransfer?.files;
        if (!files) return;

        for (let i = 0; i < files.length; i++) {
            if (files[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                await uploadAndInsertImage(files[i], targetField);
            }
        }
    };

    if (isLoading) return <EditorContainer>Loading article...</EditorContainer>;

    return (
        <EditorContainer>
            <Header>
                <h1>{isEditMode ? 'Edit Article' : 'Write New Article'}</h1>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {hasUnsavedChanges && <StatusText style={{ color: '#ff4d4f' }}>
                        <i className="fa-solid fa-circle-exclamation"></i> Unsaved changes
                    </StatusText>}
                    <BackButton type="button" onClick={() => {
                        if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                            return;
                        }
                        navigate('/admin');
                    }}>Cancel</BackButton>
                </div>
            </Header>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <EditorForm onSubmit={handleSubmit}>
                <FormHeader>
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

                    <label style={{ color: 'var(--text-color)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={isDualPane}
                            onChange={e => setIsDualPane(e.target.checked)}
                            style={{ margin: 0 }}
                        />
                        Dual Pane Mode
                    </label>
                </FormHeader>

                <FormGroup>
                    <label>Cover Image (Optional)</label>
                    <label htmlFor="cover-upload" style={{ width: '100%', cursor: 'pointer', display: 'block' }}>
                        <CoverPreview $hasImage={!!formData.coverImage} style={formData.coverImage ? { backgroundImage: `url(${formData.coverImage})` } : {}}>
                            {!formData.coverImage && (
                                <>
                                    <i className="fa-solid fa-image"></i>
                                    <span>Click to upload cover photo</span>
                                </>
                            )}
                            <input id="cover-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
                        </CoverPreview>
                    </label>
                </FormGroup>

                <EditorsGrid $dual={isDualPane}>
                    {/* Only Show ZH if not dual or active is zh */}
                    {(isDualPane || activeLang === 'zh') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <FormGroup>
                                <label>Title (Chinese)</label>
                                <input
                                    required={!formData.titleEn || (isDualPane && activeLang === 'zh')}
                                    name="titleZh"
                                    value={formData.titleZh}
                                    onChange={handleChange}
                                    placeholder="E.g., 为什么天空是蓝色的"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Toolbar>
                                    <label>Content (Chinese) <span style={{ opacity: 0.6, fontSize: '12px', marginLeft: '5px' }}>{getWordCount(formData.contentZh)} words</span></label>
                                    <UploadImageContainer>
                                        <label htmlFor="upload-zh">
                                            <i className="fa-solid fa-image" style={{ marginRight: '6px', fontSize: '13px' }}></i>
                                            Insert Image
                                        </label>
                                        <input
                                            id="upload-zh"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'contentZh')}
                                        />
                                        {isUploading && activeLang === 'zh' && <span className="uploading">Uploading...</span>}
                                    </UploadImageContainer>
                                </Toolbar>
                                <div
                                    data-color-mode={theme}
                                    onPaste={(e) => handlePaste(e, 'contentZh')}
                                    onDrop={(e) => handleDrop(e, 'contentZh')}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <MDEditor
                                        value={formData.contentZh}
                                        onChange={(val) => { setFormData(prev => ({ ...prev, contentZh: val || '' })); setHasUnsavedChanges(true); }}
                                        height={600}
                                    />
                                </div>
                            </FormGroup>
                        </div>
                    )}

                    {/* Only Show EN if dual pane or active is en */}
                    {(isDualPane || activeLang === 'en') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <FormGroup>
                                <label>Title (English)</label>
                                <input
                                    required={!formData.titleZh || (isDualPane && activeLang === 'en')}
                                    name="titleEn"
                                    value={formData.titleEn}
                                    onChange={handleChange}
                                    placeholder="E.g., Why is the sky blue"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Toolbar>
                                    <label>Content (English) <span style={{ opacity: 0.6, fontSize: '12px', marginLeft: '5px' }}>{getWordCount(formData.contentEn)} words</span></label>
                                    <UploadImageContainer>
                                        <label htmlFor="upload-en">
                                            <i className="fa-solid fa-image" style={{ marginRight: '6px', fontSize: '13px' }}></i>
                                            Insert Image
                                        </label>
                                        <input
                                            id="upload-en"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'contentEn')}
                                        />
                                        {isUploading && activeLang === 'en' && <span className="uploading">Uploading...</span>}
                                    </UploadImageContainer>
                                </Toolbar>
                                <div
                                    data-color-mode={theme}
                                    onPaste={(e) => handlePaste(e, 'contentEn')}
                                    onDrop={(e) => handleDrop(e, 'contentEn')}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <MDEditor
                                        value={formData.contentEn}
                                        onChange={(val) => { setFormData(prev => ({ ...prev, contentEn: val || '' })); setHasUnsavedChanges(true); }}
                                        height={600}
                                    />
                                </div>
                            </FormGroup>
                        </div>
                    )}
                </EditorsGrid>

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
                        <label>Tags</label>
                        <TagsContainer>
                            {formData.tags.map(tag => (
                                <TagPill key={tag}>
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </TagPill>
                            ))}
                            <input
                                type="text"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder={formData.tags.length === 0 ? "Press enter to add tag..." : ""}
                            />
                        </TagsContainer>
                    </FormGroup>
                </DualInputGroup>

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

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <SubmitButton type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : (isEditMode ? 'Update Article' : 'Publish Article')}
                    </SubmitButton>

                    {lastSaved && <StatusText style={{ marginTop: '10px' }}>
                        <i className="fa-solid fa-check-circle" style={{ color: '#48c78e' }}></i>
                        Draft saved at {lastSaved.toLocaleTimeString()}
                    </StatusText>}

                    <button
                        type="button"
                        onClick={clearDraft}
                        style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '13px', marginLeft: 'auto', marginTop: '10px', textDecoration: 'underline' }}>
                        Clear Local Draft
                    </button>
                </div>
            </EditorForm>
        </EditorContainer>
    );
}
