import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { testDbConnection, runInstall } from '../api/install';

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 520px;
  background: var(--glass-bg-color);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border-color);
  border-radius: 20px;
  padding: 48px 40px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
  animation: ${fadeIn} 0.4s ease;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
`;

interface StepDotProps { active: boolean; done: boolean; }
const StepDot = styled.div<StepDotProps>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid ${p => p.done ? 'var(--accent-color)' : p.active ? 'var(--main-color)' : 'var(--glass-border-color)'};
  background: ${p => p.done ? 'var(--accent-color)' : p.active ? 'var(--main-color)' : 'transparent'};
  color: ${p => (p.done || p.active) ? 'var(--theme-color)' : 'var(--text-color)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.35s ease;
  flex-shrink: 0;
`;

interface ConnectorProps { done: boolean; }
const Connector = styled.div<ConnectorProps>`
  flex: 1;
  height: 2px;
  background: ${p => p.done ? 'var(--accent-color)' : 'var(--glass-border-color)'};
  transition: background 0.35s ease;
`;

// ─── Typography ───────────────────────────────────────────────────────────────
const Title = styled.h1`
  color: var(--title-color);
  font-size: 22px;
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.p`
  color: var(--text-color);
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
  white-space: normal;
`;



// ─── Form elements ────────────────────────────────────────────────────────────
const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    color: var(--text-color);
    font-size: 13px;
    font-weight: 600;
  }

  input {
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid var(--glass-border-color);
    background: rgba(255, 255, 255, 0.06);
    color: var(--title-color);
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      border-color: var(--main-color);
      box-shadow: 0 0 0 3px rgba(128, 128, 255, 0.15);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
      font-size: 13px;
    }
  }

  small {
    color: var(--text-color);
    font-size: 12px;
    opacity: 0.55;
    line-height: 1.5;
  }
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const TestRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-end;

  ${Field} { flex: 1; }
`;

// ─── Buttons ──────────────────────────────────────────────────────────────────
const Btn = styled.button<{ variant?: 'primary' | 'ghost' | 'test' }>`
  padding: 13px 24px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  flex-shrink: 0;

  ${p => p.variant === 'test' && `
    padding: 13px 18px;
    font-size: 13px;
    background: rgba(255,255,255,0.08);
    border: 1px solid var(--glass-border-color);
    color: var(--title-color);
    &:hover:not(:disabled) { background: rgba(255,255,255,0.15); }
  `}

  ${p => (!p.variant || p.variant === 'primary') && `
    background: var(--main-color);
    color: var(--theme-color);
    &:hover:not(:disabled) { opacity: 0.87; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
  `}

  ${p => p.variant === 'ghost' && `
    background: transparent;
    border: 1px solid var(--glass-border-color);
    color: var(--text-color);
    &:hover:not(:disabled) { background: rgba(255,255,255,0.06); }
  `}

  &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
`;

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 4px;
`;

// ─── Status messages ──────────────────────────────────────────────────────────
const Alert = styled.div<{ type: 'error' | 'success' | 'info' }>`
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.55;
  border: 1px solid;

  ${p => p.type === 'error' && `
    background: rgba(255, 80, 80, 0.1);
    border-color: rgba(255, 80, 80, 0.25);
    color: #ff7070;
  `}
  ${p => p.type === 'success' && `
    background: rgba(72, 199, 142, 0.1);
    border-color: rgba(72, 199, 142, 0.25);
    color: #48c78e;
  `}
  ${p => p.type === 'info' && `
    background: rgba(100, 160, 255, 0.08);
    border-color: rgba(100, 160, 255, 0.2);
    color: var(--text-color);
  `}
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.25);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
`;

// ─── Success screen ───────────────────────────────────────────────────────────
const SuccessIcon = styled.div`
  font-size: 56px;
  text-align: center;
  animation: ${pulse} 1.5s ease infinite;
`;

// ─── Wizard data types ────────────────────────────────────────────────────────
interface WizardData {
    mongoUri: string;
    username: string;
    password: string;
    confirmPassword: string;
    siteTitle: string;
    siteSubtitle: string;
}

const STEPS = ['欢迎', '数据库', '管理员', '站点', '完成'];
const TOTAL = STEPS.length;

// ─── Component ────────────────────────────────────────────────────────────────
export default function Install() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [data, setData] = useState<WizardData>({
        mongoUri: '',
        username: '',
        password: '',
        confirmPassword: '',
        siteTitle: 'Oblivion Blog',
        siteSubtitle: 'A personal space for code and life',
    });

    const [dbTestStatus, setDbTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
    const [dbTestMsg, setDbTestMsg] = useState('');
    const [installing, setInstalling] = useState(false);
    const [error, setError] = useState('');

    const patch = (key: keyof WizardData, value: string) => {
        setData(prev => ({ ...prev, [key]: value }));
        setError('');
    };

    // ── Validation ──────────────────────────────────────────────────────────
    const canAdvance = (): boolean => {
        if (step === 2) return data.mongoUri.trim() !== '' && dbTestStatus === 'ok';
        if (step === 3) {
            if (!data.username.trim() || !data.password) return false;
            if (data.password !== data.confirmPassword) return false;
            if (data.password.length < 6) return false;
            return true;
        }
        return true;
    };

    const validate = (): string => {
        if (step === 2 && dbTestStatus !== 'ok') return '请先测试数据库连接并确认成功';
        if (step === 3) {
            if (!data.username.trim()) return '请输入管理员用户名';
            if (!data.password) return '请输入密码';
            if (data.password.length < 6) return '密码至少6位';
            if (data.password !== data.confirmPassword) return '两次密码不一致';
        }
        return '';
    };

    // ── DB test ─────────────────────────────────────────────────────────────
    const handleTestDb = async () => {
        setDbTestStatus('testing');
        setDbTestMsg('');
        try {
            const res = await testDbConnection(data.mongoUri);
            if (res.success) {
                setDbTestStatus('ok');
                setDbTestMsg(res.message || '连接成功！');
            } else {
                setDbTestStatus('fail');
                setDbTestMsg(res.error || '连接失败');
            }
        } catch {
            setDbTestStatus('fail');
            setDbTestMsg('无法联系后端服务，请确认后端已启动');
        }
    };

    // ── Navigation ──────────────────────────────────────────────────────────
    const next = () => {
        const err = validate();
        if (err) { setError(err); return; }
        setError('');
        setStep(s => s + 1);
    };

    const back = () => { setError(''); setStep(s => s - 1); };

    // ── Final install ───────────────────────────────────────────────────────
    const handleInstall = async () => {
        setInstalling(true);
        setError('');
        try {
            const res = await runInstall({
                mongoUri: data.mongoUri,
                username: data.username,
                password: data.password,
                siteTitle: data.siteTitle,
                siteSubtitle: data.siteSubtitle,
            });
            if (res.success) {
                setStep(TOTAL);
            } else {
                setError(res.error || '安装失败，请重试');
            }
        } catch {
            setError('无法联系后端服务');
        } finally {
            setInstalling(false);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <Page>
            <Card>
                {/* Progress bar */}
                {step < TOTAL && (
                    <ProgressWrap>
                        {STEPS.slice(0, -1).map((_label, i) => {
                            const num = i + 1;
                            return (
                                <React.Fragment key={num}>
                                    <StepDot active={step === num} done={step > num}>
                                        {step > num ? '✓' : num}
                                    </StepDot>
                                    {i < STEPS.length - 2 && <Connector done={step > num} />}
                                </React.Fragment>
                            );
                        })}
                    </ProgressWrap>
                )}

                {/* ── Step 1: Welcome ── */}
                {step === 1 && (
                    <>
                        <div>
                            <Title>🌒 欢迎安装 Oblivion Blog</Title>
                            <Subtitle style={{ marginTop: 12 }}>
                                接下来只需几步，即可完成博客的初始化配置。
                                安装向导将引导你完成数据库连接、管理员账号创建和站点基本设置。
                            </Subtitle>
                        </div>
                        <Alert type="info">
                            <strong>开始前请确认</strong><br />
                            ① 已准备好 MongoDB 连接地址（本地或 Atlas 均可）<br />
                            ② 后端服务正在运行（<code>npm run dev</code>）
                        </Alert>
                        <BtnRow>
                            <Btn onClick={next}>开始安装 →</Btn>
                        </BtnRow>
                    </>
                )}

                {/* ── Step 2: Database ── */}
                {step === 2 && (
                    <>
                        <div>
                            <Title>📦 数据库配置</Title>
                            <Subtitle style={{ marginTop: 8 }}>输入 MongoDB 连接字符串并测试连接。</Subtitle>
                        </div>
                        <TestRow>
                            <Field>
                                <label htmlFor="mongoUri">MongoDB URI</label>
                                <input
                                    id="mongoUri"
                                    type="text"
                                    placeholder="mongodb://localhost:27017/oblivion-blog"
                                    value={data.mongoUri}
                                    onChange={e => { patch('mongoUri', e.target.value); setDbTestStatus('idle'); setDbTestMsg(''); }}
                                />
                                <small>本地示例：<code>mongodb://localhost:27017/oblivion-blog</code><br />Atlas 示例：<code>mongodb+srv://user:pass@cluster.mongodb.net/dbname</code></small>
                            </Field>
                            <Btn
                                variant="test"
                                onClick={handleTestDb}
                                disabled={!data.mongoUri.trim() || dbTestStatus === 'testing'}
                            >
                                {dbTestStatus === 'testing' ? <><Spinner />测试中</> : '测试连接'}
                            </Btn>
                        </TestRow>

                        {dbTestStatus === 'ok' && <Alert type="success">✅ {dbTestMsg}</Alert>}
                        {dbTestStatus === 'fail' && <Alert type="error">❌ {dbTestMsg}</Alert>}
                        {error && <Alert type="error">{error}</Alert>}

                        <BtnRow>
                            <Btn variant="ghost" onClick={back}>← 返回</Btn>
                            <Btn onClick={next} disabled={dbTestStatus !== 'ok'}>下一步 →</Btn>
                        </BtnRow>
                    </>
                )}

                {/* ── Step 3: Admin account ── */}
                {step === 3 && (
                    <>
                        <div>
                            <Title>🔑 管理员账号</Title>
                            <Subtitle style={{ marginTop: 8 }}>创建用于登录管理后台的账号。</Subtitle>
                        </div>
                        <Field>
                            <label htmlFor="username">用户名</label>
                            <input
                                id="username"
                                type="text"
                                placeholder="admin"
                                value={data.username}
                                onChange={e => patch('username', e.target.value)}
                            />
                        </Field>
                        <FieldRow>
                            <Field>
                                <label htmlFor="password">密码</label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="至少6位"
                                    value={data.password}
                                    onChange={e => patch('password', e.target.value)}
                                />
                            </Field>
                            <Field>
                                <label htmlFor="confirmPassword">确认密码</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="再次输入"
                                    value={data.confirmPassword}
                                    onChange={e => patch('confirmPassword', e.target.value)}
                                />
                            </Field>
                        </FieldRow>
                        {error && <Alert type="error">{error}</Alert>}
                        <BtnRow>
                            <Btn variant="ghost" onClick={back}>← 返回</Btn>
                            <Btn onClick={next} disabled={!canAdvance()}>下一步 →</Btn>
                        </BtnRow>
                    </>
                )}

                {/* ── Step 4: Site settings ── */}
                {step === 4 && (
                    <>
                        <div>
                            <Title>🌐 站点设置</Title>
                            <Subtitle style={{ marginTop: 8 }}>配置博客的基本信息（可以之后在设置页修改）。</Subtitle>
                        </div>
                        <Field>
                            <label htmlFor="siteTitle">站点标题</label>
                            <input
                                id="siteTitle"
                                type="text"
                                value={data.siteTitle}
                                onChange={e => patch('siteTitle', e.target.value)}
                            />
                        </Field>
                        <Field>
                            <label htmlFor="siteSubtitle">站点副标题</label>
                            <input
                                id="siteSubtitle"
                                type="text"
                                value={data.siteSubtitle}
                                onChange={e => patch('siteSubtitle', e.target.value)}
                            />
                        </Field>
                        {error && <Alert type="error">{error}</Alert>}
                        <BtnRow>
                            <Btn variant="ghost" onClick={back}>← 返回</Btn>
                            <Btn onClick={handleInstall} disabled={installing}>
                                {installing ? <><Spinner />安装中…</> : '🚀 完成安装'}
                            </Btn>
                        </BtnRow>
                    </>
                )}

                {/* ── Step 5: Done ── */}
                {step === TOTAL && (
                    <>
                        <SuccessIcon>🎉</SuccessIcon>
                        <div style={{ textAlign: 'center' }}>
                            <Title style={{ textAlign: 'center' }}>安装完成！</Title>
                            <Subtitle style={{ marginTop: 10, textAlign: 'center' }}>
                                博客已成功初始化。现在可以用你创建的管理员账号登录，开始写作吧！
                            </Subtitle>
                        </div>
                        <Alert type="info" style={{ textAlign: 'center' }}>
                            <strong>⚠️ 温馨提示</strong><br />
                            请重启后端服务（<code>npm run dev</code>）以使配置完全生效。
                        </Alert>
                        <BtnRow style={{ justifyContent: 'center' }}>
                            <Btn onClick={() => navigate('/login')}>前往登录 →</Btn>
                        </BtnRow>
                    </>
                )}
            </Card>
        </Page>
    );
}
