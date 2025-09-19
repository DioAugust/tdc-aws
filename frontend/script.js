const API_BASE = 'https://d3vq5f4ity3pv8.cloudfront.net/proxy/3001/api';

let currentQuestion = null;
let selectedAnswer = '';
let score = 0;
let level = 1;
let answeredQuestions = [];

// Elementos DOM
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const questionTextEl = document.getElementById('question-text');
const difficultyEl = document.getElementById('difficulty');
const optionsEl = document.getElementById('options');
const textInputEl = document.getElementById('text-input');
const submitBtn = document.getElementById('submit-btn');
const feedbackEl = document.getElementById('feedback');
const loadingEl = document.getElementById('loading');

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    fetchQuestion();
});

async function fetchQuestion() {
    showLoading(true);
    try {
        const excludeParam = answeredQuestions.length > 0 ? `&exclude=${answeredQuestions.join(',')}` : '';
        const response = await fetch(`${API_BASE}/question?level=${level}${excludeParam}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        currentQuestion = data;
        displayQuestion(data);
        clearFeedback();
        selectedAnswer = '';
        
    } catch (error) {
        console.error('Erro ao buscar pergunta:', error);
        questionTextEl.textContent = 'Erro ao conectar com servidor. Verifique se o backend está rodando na porta 3001.';
        difficultyEl.textContent = 'Status: Desconectado';
    }
    showLoading(false);
}

function displayQuestion(question) {
    questionTextEl.textContent = question.question;
    difficultyEl.textContent = `Dificuldade: ${question.difficulty}`;
    
    if (question.type === 'multiple') {
        optionsEl.style.display = 'grid';
        textInputEl.style.display = 'none';
        
        optionsEl.innerHTML = '';
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option;
            button.onclick = () => selectOption(button, option);
            optionsEl.appendChild(button);
        });
    } else {
        optionsEl.style.display = 'none';
        textInputEl.style.display = 'block';
        textInputEl.value = '';
    }
}

function selectOption(button, option) {
    // Remove seleção anterior
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Seleciona nova opção
    button.classList.add('selected');
    selectedAnswer = option;
}

async function submitAnswer() {
    const answer = currentQuestion.type === 'multiple' ? selectedAnswer : textInputEl.value.trim();
    
    if (!answer) {
        showFeedback('Por favor, selecione ou digite uma resposta.', false);
        return;
    }
    
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'session-id': 'user-session-' + Date.now()
            },
            body: JSON.stringify({
                questionId: currentQuestion.id,
                answer: answer,
                currentLevel: level
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Adicionar pergunta à lista de respondidas
        answeredQuestions.push(currentQuestion.id);
        
        score += data.score;
        
        updateStats();
        showFeedback(data.feedback, data.correct);
        
        setTimeout(() => {
            fetchQuestion();
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao enviar resposta:', error);
        showFeedback('Erro ao processar resposta. Verifique a conexão com o servidor.', false);
    }
    showLoading(false);
}

function updateStats() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
}

function showFeedback(message, isCorrect) {
    feedbackEl.textContent = message;
    feedbackEl.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackEl.style.display = 'block';
}

function clearFeedback() {
    feedbackEl.style.display = 'none';
}

function showLoading(show) {
    if (show) {
        loadingEl.style.display = 'flex';
        submitBtn.disabled = true;
    } else {
        loadingEl.style.display = 'none';
        submitBtn.disabled = false;
    }
}