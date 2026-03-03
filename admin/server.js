const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3333;
const QUIZ_DIR = path.join(__dirname, '..', 'quiz');
const MAIN_INDEX = path.join(__dirname, '..', 'index.html');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Generate quiz index.html by using an existing quiz as a template
function generateQuizIndexHtml(title) {
    // Find an existing quiz index.html to use as template
    const entries = fs.readdirSync(QUIZ_DIR, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const templatePath = path.join(QUIZ_DIR, entry.name, 'index.html');
            if (fs.existsSync(templatePath)) {
                let html = fs.readFileSync(templatePath, 'utf-8');
                // Replace the title tag
                html = html.replace(/<title>.*?<\/title>/, '<title>' + title + ' - Kviz</title>');
                // Replace the completion message quiz name
                html = html.replace(/Završili ste kviz [^<]+/, 'Završili ste kviz ' + title + '.');
                return html;
            }
        }
    }
    return null;
}

// Generate a card HTML block for the main index.html
function generateCardHtml(quizId, title) {
    var abbrev = title.substring(0, 3).toUpperCase();
    return '\n                    <!-- quiz-card:' + quizId + ' -->\n' +
        '                    <div class="bg-slate-900/80 rounded-2xl p-6 border border-white/5 hover:border-slate-600 transition-all shadow card-glow flex flex-col">\n' +
        '                        <div class="mb-5">\n' +
        '                            <div class="w-10 h-10 rounded-xl bg-indigo-600/80 flex items-center justify-center mb-3">\n' +
        '                                <span class="text-white font-bold text-xs">' + abbrev + '</span>\n' +
        '                            </div>\n' +
        '                            <h3 class="text-xl font-bold text-white mb-1">' + title + '</h3>\n' +
        '                        </div>\n' +
        '                        <div class="mt-auto grid grid-cols-1 gap-2">\n' +
        '                            <div class="grid grid-cols-3 gap-2">\n' +
        '                                <button onclick="launchQuiz(\'quiz/' + quizId + '/quiz.json\', \'random10\', \'' + title + '\')" class="bg-indigo-700 hover:bg-indigo-600 text-white py-2 px-3 rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-1">\n' +
        '                                    <span class="font-bold">10</span> Pitanja\n' +
        '                                </button>\n' +
        '                                <button onclick="launchQuiz(\'quiz/' + quizId + '/quiz.json\', \'random20\', \'' + title + '\')" class="bg-indigo-700 hover:bg-indigo-600 text-white py-2 px-3 rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-1">\n' +
        '                                    <span class="font-bold">20</span> Pitanja\n' +
        '                                </button>\n' +
        '                                <button onclick="launchQuiz(\'quiz/' + quizId + '/quiz.json\', \'random30\', \'' + title + '\')" class="bg-indigo-700 hover:bg-indigo-600 text-white py-2 px-3 rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-1">\n' +
        '                                    <span class="font-bold">30</span> Pitanja\n' +
        '                                </button>\n' +
        '                            </div>\n' +
        '                            <div class="grid grid-cols-2 gap-2">\n' +
        '                                <button onclick="launchQuiz(\'quiz/' + quizId + '/quiz.json\', \'all\', \'' + title + '\')" class="bg-white/5 hover:bg-white/10 text-white py-2 px-4 rounded-xl font-medium transition-all text-sm border border-white/5">\n' +
        '                                    Sva pitanja\n' +
        '                                </button>\n' +
        '                                <button onclick="launchQuiz(\'quiz/' + quizId + '/quiz.json\', \'review\', \'' + title + '\')" class="bg-white/5 hover:bg-white/10 text-emerald-400 py-2 px-4 rounded-xl font-medium transition-all text-sm border border-white/5">\n' +
        '                                    Pregled\n' +
        '                                </button>\n' +
        '                            </div>\n' +
        '                        </div>\n' +
        '                    </div>\n' +
        '                    <!-- /quiz-card:' + quizId + ' -->\n';
}

// Add a quiz card to the main index.html
function addCardToMainIndex(quizId, title) {
    var html = fs.readFileSync(MAIN_INDEX, 'utf-8');
    var marker = '<!-- QUIZ-CARDS-END -->';
    var idx = html.indexOf(marker);
    if (idx === -1) return;
    var cardHtml = generateCardHtml(quizId, title);
    var updated = html.slice(0, idx) + cardHtml + '\n                    ' + html.slice(idx);
    fs.writeFileSync(MAIN_INDEX, updated, 'utf-8');
}

// Remove a quiz card from the main index.html
function removeCardFromMainIndex(quizId) {
    var html = fs.readFileSync(MAIN_INDEX, 'utf-8');
    var startMarker = '<!-- quiz-card:' + quizId + ' -->';
    var endMarker = '<!-- /quiz-card:' + quizId + ' -->';
    var startIdx = html.indexOf(startMarker);
    var endIdx = html.indexOf(endMarker);
    if (startIdx === -1 || endIdx === -1) return;
    var removeStart = startIdx;
    var removeEnd = endIdx + endMarker.length;
    // Trim leading whitespace/newlines
    while (removeStart > 0 && (html[removeStart - 1] === ' ' || html[removeStart - 1] === '\n' || html[removeStart - 1] === '\r')) {
        removeStart--;
    }
    // Trim trailing newline
    while (removeEnd < html.length && (html[removeEnd] === '\n' || html[removeEnd] === '\r')) {
        removeEnd++;
    }
    var updated = html.slice(0, removeStart) + '\n' + html.slice(removeEnd);
    fs.writeFileSync(MAIN_INDEX, updated, 'utf-8');
}

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
    const title = req.body.title || quizId;
    const quizDir = path.join(QUIZ_DIR, quizId);
    if (fs.existsSync(quizDir)) {
        return res.status(409).json({ error: 'Quiz already exists' });
    }
    try {
        fs.mkdirSync(quizDir, { recursive: true });
        fs.writeFileSync(path.join(quizDir, 'quiz.json'), '[]', 'utf-8');
        // Generate index.html for the quiz folder
        const indexHtml = generateQuizIndexHtml(title);
        if (indexHtml) {
            fs.writeFileSync(path.join(quizDir, 'index.html'), indexHtml, 'utf-8');
        }
        // Add a card to the main index.html
        addCardToMainIndex(quizId, title);
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
        // Remove the card from main index.html
        removeCardFromMainIndex(quizId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n  Quiz Admin running at http://localhost:${PORT}\n`);
});
