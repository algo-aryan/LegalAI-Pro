const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup directories
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const VECTORSTORE_DIR = path.join(__dirname, '../vectorstore');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(VECTORSTORE_DIR)) {
    fs.mkdirSync(VECTORSTORE_DIR, { recursive: true });
}

// Multer storage for PDFs
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

/**
 * Helper to run Python script and parse JSON output
 */
function runPythonScript(scriptName, args) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, scriptName);
        const pythonProcess = spawn('python3', [scriptPath, ...args]);

        let stdoutData = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}: ${stderrData}`);
                return reject(new Error(stderrData || 'Unknown Python error'));
            }
            try {
                // Parse the last line as JSON to avoid logging noise
                const lines = stdoutData.trim().split('\n');
                const lastLine = lines[lines.length - 1];
                const result = JSON.parse(lastLine);
                resolve(result);
            } catch (err) {
                console.error('Failed to parse Python output:', stdoutData);
                reject(new Error('Failed to parse Python output'));
            }
        });
    });
}

// Routes
app.post('/api/chat/general', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const result = await runPythonScript('general_legal_bot.py', ['--query', message]);
        res.json(result);
    } catch (error) {
        console.error('General chat error:', error);
        res.status(500).json({ error: 'Failed to process general chat' });
    }
});

app.post('/api/contract/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const sessionId = uuidv4();
        const filePath = req.file.path;

        // Run analysis and save vectorstore
        const result = await runPythonScript('contract_bot.py', [
            '--mode', 'analyze',
            '--file', filePath,
            '--session', sessionId
        ]);

        res.json({
            session_id: sessionId,
            message: result.message || 'Contract loaded successfully'
        });
    } catch (error) {
        console.error('Contract upload error:', error);
        res.status(500).json({ error: 'Failed to analyze contract' });
    }
});

app.post('/api/contract/chat', async (req, res) => {
    try {
        const { session_id, message } = req.body;
        if (!session_id || !message) {
            return res.status(400).json({ error: 'Session ID and message are required' });
        }

        const result = await runPythonScript('contract_bot.py', [
            '--mode', 'chat',
            '--session', session_id,
            '--query', message
        ]);

        res.json(result);
    } catch (error) {
        console.error('Contract chat error:', error);
        res.status(500).json({ error: 'Failed to answer question' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Node Express API listening on port ${PORT}`);
});
