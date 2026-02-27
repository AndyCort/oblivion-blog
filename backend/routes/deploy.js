const express = require('express');
const router = express.Router();
const { execFile, spawn } = require('child_process');
const path = require('path');
const { protect } = require('../middleware/auth');

// Root of the project (two levels up from backend/routes/)
const PROJECT_ROOT = path.join(__dirname, '../../');

// Helper: run a git command and return stdout/stderr as a promise
const runGit = (args, cwd) =>
    new Promise((resolve, reject) => {
        execFile('git', args, { cwd }, (err, stdout, stderr) => {
            if (err) return reject(stderr || err.message);
            resolve((stdout + stderr).trim());
        });
    });

// @desc    Get current git status (branch, last commit, remote URL)
// @route   GET /api/deploy/status
// @access  Private
router.get('/status', protect, async (req, res) => {
    try {
        const [branch, lastCommit, remoteUrl, behindAhead] = await Promise.all([
            runGit(['rev-parse', '--abbrev-ref', 'HEAD'], PROJECT_ROOT),
            runGit(['log', '-1', '--format=%h|%s|%ar|%an'], PROJECT_ROOT),
            runGit(['remote', 'get-url', 'origin'], PROJECT_ROOT),
            runGit(['rev-list', '--left-right', '--count', 'HEAD...@{u}'], PROJECT_ROOT).catch(() => '0\t0'),
        ]);

        const [hash, subject, relTime, author] = lastCommit.split('|');
        const [behind, ahead] = behindAhead.split(/\s+/).map(Number);

        res.json({
            branch,
            remoteUrl,
            lastCommit: { hash, subject, relTime, author },
            ahead: ahead || 0,
            behind: behind || 0,
        });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// @desc    Pull latest code from GitHub (SSE stream)
// @route   POST /api/deploy/pull
// @access  Private
router.post('/pull', protect, (req, res) => {
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    const send = (type, data) => {
        res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
    };

    send('log', '🚀 Starting deployment...\n');
    send('log', `📁 Working directory: ${PROJECT_ROOT}\n`);

    // Step 1: git fetch
    send('log', '\n$ git fetch origin\n');
    const fetch = spawn('git', ['fetch', 'origin'], { cwd: PROJECT_ROOT });

    fetch.stdout.on('data', d => send('log', d.toString()));
    fetch.stderr.on('data', d => send('log', d.toString()));

    fetch.on('close', (fetchCode) => {
        if (fetchCode !== 0) {
            send('log', `\n❌ git fetch failed (exit ${fetchCode})\n`);
            send('done', { success: false });
            return res.end();
        }

        // Step 2: git pull
        send('log', '\n$ git pull origin main\n');
        const pull = spawn('git', ['pull', 'origin', 'main'], { cwd: PROJECT_ROOT });

        pull.stdout.on('data', d => send('log', d.toString()));
        pull.stderr.on('data', d => send('log', d.toString()));

        pull.on('close', (pullCode) => {
            if (pullCode !== 0) {
                send('log', `\n❌ git pull failed (exit ${pullCode})\n`);
                send('done', { success: false });
                return res.end();
            }

            send('log', '\n✅ Code updated successfully!\n');

            // Build task queue
            const tasks = [];
            if (req.body?.installBackend) {
                tasks.push({
                    cmd: 'npm',
                    args: ['install'],
                    cwd: path.join(PROJECT_ROOT, 'backend'),
                    message: '\n$ npm install --prefix backend\n'
                });
            }
            if (req.body?.buildFrontend) {
                tasks.push({
                    cmd: 'npm',
                    args: ['install'],
                    cwd: path.join(PROJECT_ROOT, 'frontend'),
                    message: '\n$ npm install --prefix frontend\n'
                });
                tasks.push({
                    cmd: 'npm',
                    args: ['run', 'build'],
                    cwd: path.join(PROJECT_ROOT, 'frontend'),
                    message: '\n$ npm run build --prefix frontend\n'
                });
            }

            const runNextTask = () => {
                if (tasks.length === 0) {
                    send('done', { success: true });
                    return res.end();
                }

                const task = tasks.shift();
                send('log', task.message);
                const proc = spawn(task.cmd, task.args, { cwd: task.cwd });

                proc.stdout.on('data', d => send('log', d.toString()));
                proc.stderr.on('data', d => send('log', d.toString()));

                proc.on('close', (code) => {
                    if (code !== 0) {
                        send('log', `\n❌ Command failed (exit ${code}): ${task.cmd} ${task.args.join(' ')}\n`);
                        send('done', { success: false });
                        return res.end();
                    }
                    runNextTask();
                });
            };

            runNextTask();
        });
    });

    // Clean up if client disconnects
    req.on('close', () => {
        res.end();
    });
});

module.exports = router;
