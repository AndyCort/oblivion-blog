import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/auth';
import { useAuth } from '../stores/AuthContext';

const LoginContainer = styled.div`
  min-height: calc(100vh - 100px); /* Adjust based on navbar/footer height */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginForm = styled.form`
  width: 100%;
  max-width: 400px;
  background: var(--glass-bg-color);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border-color);
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 20px;

  h2 {
    color: var(--title-color);
    text-align: center;
    margin-bottom: 10px;
    font-size: 24px;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    color: var(--text-color);
    font-size: 14px;
    font-weight: 500;
  }

  input {
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid var(--glass-border-color);
    background: rgba(255, 255, 255, 0.1);
    color: var(--title-color);
    font-size: 16px;
    outline: none;
    transition: all 0.3s ease;

    &:focus {
      border-color: var(--accent-color);
      box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.2);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
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
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  font-size: 14px;
  text-align: center;
  padding: 10px;
  background: rgba(255, 77, 79, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 77, 79, 0.2);
`;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await loginApi(username, password);
      // Data contains the token, let's store it into context
      login(data.token);
      // Redirect to home page or dashboard after successful login
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <h2>Admin Login</h2>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <InputGroup>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            disabled={isLoading}
          />
        </InputGroup>

        <InputGroup>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            disabled={isLoading}
          />
        </InputGroup>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </SubmitButton>
      </LoginForm>
    </LoginContainer>
  );
}
