const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3333;
const QUIZ_DIR = path.join(__dirname, '..', 'quiz');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// List all quizzes
app.get('/api/quizzes', (req, res) => {
    try {
        const entries = fs.readdirSync(QUIZ_DIR, { withFileTypes: true });
        const quizzes = [];
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const jsonPath = path.join(QUIZ_DIR, entry.name, 'quiz.json');
                if (fs.existsSync(jsonPath)) {
                    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
                    quizzes.push({
                        id: entry.name,
                        questionCount: data.length
                    });
                }
            }
        }
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get questions for a quiz
app.get('/api/quizzes/:id', (req, res) => {
    const quizId = path.basename(req.params.id);
    const jsonPath = path.join(QUIZ_DIR, quizId, 'quiz.json');
    if (!fs.existsSync(jsonPath)) {
        return res.status(404).json({ error: 'Quiz not found' });
    }
    try {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        res.json({ id: quizId, questions: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save all questions for a quiz
app.put('/api/quizzes/:id', (req, res) => {
    const quizId = path.basename(req.params.id);
    const jsonPath = path.join(QUIZ_DIR, quizId, 'quiz.json');
    if (!fs.existsSync(jsonPath)) {
        return res.status(404).json({ error: 'Quiz not found' });
    }
    try {
        fs.writeFileSync(jsonPath, JSON.stringify(req.body.questions, null, 4), 'utf-8');
        res.json({ success: true, questionCount: req.body.questions.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new quiz
app.post('/api/quizzes', (req, res) => {
    const quizId = path.basename(req.body.id || '').replace(/[^a-z0-9_-]/gi, '');
    if (!quizId) {
        return res.status(400).json({ error: 'Invalid quiz ID' });
    }
    const quizDir = path.join(QUIZ_DIR, quizId);
    if (fs.existsSync(quizDir)) {
        return res.status(409).json({ error: 'Quiz already exists' });
    }
    try {
        fs.mkdirSync(quizDir, { recursive: true });
        fs.writeFileSync(path.join(quizDir, 'quiz.json'), '[]', 'utf-8');
        res.json({ success: true, id: quizId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a quiz
app.delete('/api/quizzes/:id', (req, res) => {
    const quizId = path.basename(req.params.id);
    const quizDir = path.join(QUIZ_DIR, quizId);
    if (!fs.existsSync(quizDir)) {
        return res.status(404).json({ error: 'Quiz not found' });
    }
    try {
        fs.rmSync(quizDir, { recursive: true, force: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n  Quiz Admin running at http://localhost:${PORT}\n`);
});
