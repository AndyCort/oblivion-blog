import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';
import { API_BASE } from '../api/config';

const SettingsContainer = styled.div`
  padding: 100px 24px 40px;
  max-width: 800px;
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

const SettingsForm = styled.form`
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

const ErrorMessage = styled.div`
  color: #ff4d4f;
  margin-bottom: 20px;
  padding: 10px;
  background: rgba(255, 77, 79, 0.1);
  border-radius: 6px;
`;

const SuccessMessage = styled.div`
  color: #52c41a;
  margin-bottom: 20px;
  padding: 10px;
  background: rgba(82, 196, 26, 0.1);
  border-radius: 6px;
`;

export default function Settings({ isTab = false }: { isTab?: boolean }) {
    const navigate = useNavigate();
    const { isAdmin, token, login } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [isCredSaving, setIsCredSaving] = useState(false);
    const [credMessage, setCredMessage] = useState({ type: '', text: '' });
    const [credFormData, setCredFormData] = useState({
        currentPassword: '',
        newUsername: '',
        newPassword: ''
    });

    const [formData, setFormData] = useState({
        siteTitle: '',
        siteSubtitle: '',
        footerText: ''
    });

    useEffect(() => {
        if (!isAdmin) {
            navigate('/login');
            return;
        }
        fetchSettings();
    }, [isAdmin, navigate]);

    const fetchSettings = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/settings`);
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setFormData({
                        siteTitle: data.siteTitle || '',
                        siteSubtitle: data.siteSubtitle || '',
                        footerText: data.footerText || ''
                    });
                }
            }
        } catch (err) {
            console.error('Failed to fetch settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCredSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!credFormData.currentPassword) {
            setCredMessage({ type: 'error', text: 'Current password is required.' });
            return;
        }
        setIsCredSaving(true);
        setCredMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${API_BASE}/api/auth/credentials`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(credFormData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update credentials');
            }

            setCredMessage({ type: 'success', text: 'Credentials updated successfully!' });
            login(data.token);
            setCredFormData({ currentPassword: '', newUsername: '', newPassword: '' });
            setTimeout(() => setCredMessage({ type: '', text: '' }), 3000);
        } catch (err: any) {
            setCredMessage({ type: 'error', text: err.message });
        } finally {
            setIsCredSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${API_BASE}/api/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            setMessage({ type: 'success', text: 'Settings saved successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <SettingsContainer>Loading settings...</SettingsContainer>;

    return (
        <SettingsContainer style={isTab ? { padding: 0, minHeight: 'auto', maxWidth: 'none' } : {}}>
            {!isTab && (
                <Header>
                    <h1>Site Settings</h1>
                    <BackButton onClick={() => navigate('/admin')}>Back to Dashboard</BackButton>
                </Header>
            )}

            {message.type === 'error' && <ErrorMessage>{message.text}</ErrorMessage>}
            {message.type === 'success' && <SuccessMessage>{message.text}</SuccessMessage>}

            <SettingsForm onSubmit={handleSubmit}>
                <h3>Global Configuration</h3>
                <FormGroup>
                    <label>Site Title</label>
                    <input
                        required
                        name="siteTitle"
                        value={formData.siteTitle}
                        onChange={handleChange}
                        placeholder="Oblivion Blog"
                    />
                </FormGroup>

                <FormGroup>
                    <label>Site Subtitle / Tagline</label>
                    <input
                        required
                        name="siteSubtitle"
                        value={formData.siteSubtitle}
                        onChange={handleChange}
                        placeholder="A personal space for code and life"
                    />
                </FormGroup>

                <FormGroup>
                    <label>Footer Text</label>
                    <input
                        required
                        name="footerText"
                        value={formData.footerText}
                        onChange={handleChange}
                        placeholder="© 2026 Oblivion Blog. All rights reserved."
                    />
                </FormGroup>


                <SubmitButton type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </SubmitButton>
            </SettingsForm>

            <SettingsForm onSubmit={handleCredSubmit} style={{ marginTop: '20px' }}>
                <h3>Admin Credentials</h3>
                {credMessage.type === 'error' && <ErrorMessage>{credMessage.text}</ErrorMessage>}
                {credMessage.type === 'success' && <SuccessMessage>{credMessage.text}</SuccessMessage>}

                <FormGroup>
                    <label>Current Password (Required)</label>
                    <input
                        required
                        type="password"
                        name="currentPassword"
                        value={credFormData.currentPassword}
                        onChange={handleCredChange}
                        placeholder="Enter current password to authorize changes"
                    />
                </FormGroup>

                <FormGroup>
                    <label>New Username (Optional)</label>
                    <input
                        type="text"
                        name="newUsername"
                        value={credFormData.newUsername}
                        onChange={handleCredChange}
                        placeholder="Leave blank to keep current username"
                    />
                </FormGroup>

                <FormGroup>
                    <label>New Password (Optional)</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={credFormData.newPassword}
                        onChange={handleCredChange}
                        placeholder="Leave blank to keep current password"
                    />
                </FormGroup>

                <SubmitButton type="submit" disabled={isCredSaving}>
                    {isCredSaving ? 'Updating...' : 'Update Credentials'}
                </SubmitButton>
            </SettingsForm>
        </SettingsContainer>
    );
}
