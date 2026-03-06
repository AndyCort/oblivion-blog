import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../stores/AuthContext';
import { API_BASE } from '../api/config';

const API = `${API_BASE}/api`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface GitStatus {
    branch: string;
    remoteUrl: string;
    lastCommit: { hash: string; subject: string; relTime: string; author: string };
    ahead: number;
    behind: number;
}

type DeployState = 'idle' | 'pulling' | 'success' | 'error';

// ─── Animations ───────────────────────────────────────────────────────────────
const spin = keyframes`to { transform: rotate(360deg); }`;
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
`;
const blink = keyframes`
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
`;
const pulseAnim = keyframes`
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.2; }
`;

// ─── Styled components ────────────────────────────────────────────────────────
const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    animation: ${fadeIn} 0.3s ease;
`;

const Card = styled.div`
    background: var(--glass-bg-color);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border-color);
    border-radius: 14px;
    padding: 28px;
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    gap: 12px;
    flex-wrap: wrap;

    h2 {
        color: var(--title-color);
        font-size: 17px;
        font-weight: 700;
        margin: 0;
    }
`;

const TitleRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
`;

const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;

    label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.5;
        color: var(--text-color);
    }

    .info-value {
        color: var(--title-color);
        font-size: 13px;
        font-family: 'JetBrains Mono', 'Courier New', monospace;
        word-break: break-all;
    }
`;


const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
`;

const SecondaryBtn = styled.button`
    padding: 10px 18px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: transparent;
    color: var(--text-color);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
        background: rgba(255,255,255,0.05);
        color: var(--title-color);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// Pill badges — use data attributes to avoid DOM prop warnings
const GreenBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    background: rgba(72, 199, 142, 0.12);
    border: 1px solid rgba(72, 199, 142, 0.35);
    color: #48c78e;
`;

const OrangeBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    background: rgba(255, 165, 0, 0.12);
    border: 1px solid rgba(255, 165, 0, 0.3);
    color: orange;
`;

// Deploy button — style changes via CSS classes rather than props to avoid DOM leaks
const DeployBtnBase = styled.button`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    border-radius: 10px;
    border: none;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.25s ease;
    flex-shrink: 0;

    &.idle {
        background: var(--main-color);
        color: var(--theme-color);
        &:hover { opacity: 0.87; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
    }
    &.pulling {
        background: rgba(255,255,255,0.06);
        border: 1px solid var(--glass-border-color);
        color: var(--text-color);
        cursor: not-allowed;
    }
    &.success {
        background: rgba(72, 199, 142, 0.12);
        border: 1px solid rgba(72, 199, 142, 0.35);
        color: #48c78e;
        &:hover { opacity: 0.87; transform: translateY(-2px); }
    }
    &.error {
        background: rgba(255, 80, 80, 0.1);
        border: 1px solid rgba(255, 80, 80, 0.3);
        color: #ff7070;
        &:hover { opacity: 0.87; transform: translateY(-2px); }
    }

    &:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
`;

const Spinner = styled.div`
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255, 255, 255, 0.25);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: ${spin} 0.7s linear infinite;
    flex-shrink: 0;
`;

const Cursor = styled.span`
    animation: ${blink} 1s ease infinite;
`;

const LogBox = styled.pre`
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 10px;
    padding: 20px;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.7;
    color: #c0cdd8;
    max-height: 380px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;

    &::-webkit-scrollbar { width: 5px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
`;

// Status dot — use className instead of props
const StatusDotBase = styled.div`
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
    transition: background 0.3s;

    &.idle    { background: rgba(255,255,255,0.2); }
    &.pulling { background: #f5a623; animation: ${pulseAnim} 0.8s ease infinite; }
    &.success { background: #48c78e; }
    &.error   { background: #ff7070; }
`;

const StateLabel: Record<DeployState, string> = {
    idle: '就绪',
    pulling: '正在更新…',
    success: '更新成功',
    error: '更新失败',
};

const BtnLabel: Record<DeployState, string> = {
    idle: '🚀 一键傻瓜式更新',
    pulling: '更新中…',
    success: '🚀 再次一键更新',
    error: '🔄 重试一键更新',
};

// Strip ANSI escape codes from git output
function stripAnsi(str: string): string {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1B\[[0-9;]*[A-Za-z]/g, '').replace(/\r/g, '');
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Deploy() {
    const { token } = useAuth();
    const [status, setStatus] = useState<GitStatus | null>(null);
    const [statusError, setStatusError] = useState('');
    const [deployState, setDeployState] = useState<DeployState>('idle');
    const [log, setLog] = useState('');
    const logRef = useRef<HTMLPreElement>(null);
    const mountedRef = useRef(true);

    // Track mounted state to guard async setState calls
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    // Auto-scroll log to bottom
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [log]);

    const fetchStatus = () => {
        fetch(`${API}/deploy/status`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then((data: GitStatus & { error?: string }) => {
                if (!mountedRef.current) return;
                if (data.error) setStatusError(data.error);
                else { setStatus(data); setStatusError(''); }
            })
            .catch(() => {
                if (mountedRef.current) setStatusError('无法连接到后端服务');
            });
    };

    useEffect(fetchStatus, [token]);

    const handleDeploy = async (foolproof: boolean = true) => {
        if (deployState === 'pulling') return;

        setDeployState('pulling');
        setLog('');

        try {
            const response = await fetch(`${API}/deploy/pull`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    installBackend: foolproof,
                    buildFrontend: foolproof
                }),
            });

            if (!response.ok || !response.body) {
                if (mountedRef.current) {
                    setLog('❌ 请求失败，请检查后端是否运行\n');
                    setDeployState('error');
                }
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            // eslint-disable-next-line no-constant-condition
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (!mountedRef.current) { reader.cancel(); return; }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const event = JSON.parse(line.slice(6)) as { type: string; data: unknown };
                        if (!mountedRef.current) return;
                        if (event.type === 'log') {
                            const clean = stripAnsi(event.data as string);
                            setLog(prev => prev + clean);
                        } else if (event.type === 'done') {
                            const success = (event.data as { success: boolean }).success;
                            setDeployState(success ? 'success' : 'error');
                            if (success) setTimeout(fetchStatus, 500);
                        }
                    } catch (_) { /* ignore partial parse */ }
                }
            }
        } catch (err) {
            if (mountedRef.current) {
                setLog(prev => prev + `\n❌ 连接中断: ${String(err)}\n`);
                setDeployState('error');
            }
        }
    };

    return (
        <Wrap>
            {/* ── Repository Info ── */}
            <Card>
                <CardHeader>
                    <TitleRow>
                        <StatusDotBase className={deployState} />
                        <h2>仓库状态 — {StateLabel[deployState]}</h2>
                    </TitleRow>
                    <ButtonGroup>
                        <SecondaryBtn
                            disabled={deployState === 'pulling'}
                            onClick={() => handleDeploy(false)}
                            title="仅拉取代码，不安装依赖或构建"
                        >
                            仅拉取代码
                        </SecondaryBtn>
                        <DeployBtnBase
                            className={deployState}
                            disabled={deployState === 'pulling'}
                            onClick={() => handleDeploy(true)}
                        >
                            {deployState === 'pulling'
                                ? <><Spinner />{BtnLabel[deployState]}</>
                                : BtnLabel[deployState]
                            }
                        </DeployBtnBase>
                    </ButtonGroup>
                </CardHeader>

                {statusError ? (
                    <p style={{ color: '#ff7070', fontSize: 14, margin: 0 }}>⚠️ {statusError}</p>
                ) : status ? (
                    <InfoGrid>
                        <InfoItem>
                            <label>Branch</label>
                            <div className="info-value">
                                <GreenBadge>⎇ {status.branch}</GreenBadge>
                            </div>
                        </InfoItem>
                        <InfoItem>
                            <label>同步状态</label>
                            <div className="info-value">
                                {status.behind === 0
                                    ? <GreenBadge>✓ 已是最新</GreenBadge>
                                    : <OrangeBadge>↓ 落后 {status.behind} 个提交</OrangeBadge>
                                }
                            </div>
                        </InfoItem>
                        <InfoItem>
                            <label>最后提交</label>
                            <div className="info-value">{status.lastCommit.hash} — {status.lastCommit.subject}</div>
                        </InfoItem>
                        <InfoItem>
                            <label>提交时间 / 作者</label>
                            <div className="info-value">{status.lastCommit.relTime} · {status.lastCommit.author}</div>
                        </InfoItem>
                        <InfoItem style={{ gridColumn: '1 / -1' }}>
                            <label>Remote URL</label>
                            <div className="info-value">{status.remoteUrl}</div>
                        </InfoItem>
                    </InfoGrid>
                ) : (
                    <p style={{ color: 'var(--text-color)', fontSize: 14, margin: 0 }}>
                        <Cursor>▊</Cursor> 加载仓库信息…
                    </p>
                )}
            </Card>

            {/* ── Deploy Log ── */}
            {log && (
                <Card>
                    <CardHeader>
                        <h2>📋 部署日志</h2>
                    </CardHeader>
                    <LogBox ref={logRef}>
                        {log}
                        {deployState === 'pulling' && <Cursor>▊</Cursor>}
                    </LogBox>
                </Card>
            )}

            {/* ── Help ── */}
            <Card style={{ padding: '20px 28px' }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-color)', lineHeight: 1.7 }}>
                    💡 <strong style={{ color: 'var(--title-color)' }}>提示：</strong>
                    “一键傻瓜式更新”会自动帮您完成 <code style={{
                        background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 5, fontFamily: 'monospace', fontSize: 12
                    }}>git pull</code>、后端安装以及前端构建的所有步骤。如果您只想拉取最新的 Markdown 文章或静态文件，可以使用“仅拉取代码”。
                </p>
            </Card>
        </Wrap>
    );
}
