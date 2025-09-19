-- Tabela de perguntas
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('multiple', 'text')),
    options JSONB,
    correct_answer TEXT NOT NULL,
    difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    subject VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
    correct_answers INTEGER DEFAULT 0,
    total_answers INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de respostas
CREATE TABLE user_answers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    question_id INTEGER REFERENCES questions(id),
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir perguntas de exemplo
INSERT INTO questions (question, type, options, correct_answer, difficulty, subject) VALUES
('Quanto é 2 + 2?', 'multiple', '["3", "4", "5", "6"]', '4', 1, 'matemática'),
('Qual é a capital do Brasil?', 'multiple', '["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"]', 'Brasília', 1, 'geografia'),
('Quanto é 15 × 8?', 'multiple', '["120", "125", "115", "130"]', '120', 2, 'matemática'),
('Qual é a fórmula da água?', 'text', null, 'H2O', 2, 'química'),
('Resolva: x² - 5x + 6 = 0', 'text', null, 'x = 2 ou x = 3', 3, 'matemática'),
('Qual país tem mais fusos horários?', 'multiple', '["Rússia", "Estados Unidos", "China", "França"]', 'França', 3, 'geografia'),
('Calcule a derivada de x³', 'text', null, '3x²', 4, 'matemática'),
('Qual é a velocidade da luz?', 'text', null, '299792458 m/s', 4, 'física'),
('Resolva a integral de sen(x)', 'text', null, '-cos(x) + C', 5, 'matemática'),
('Explique a teoria da relatividade', 'text', null, 'E=mc²', 5, 'física');