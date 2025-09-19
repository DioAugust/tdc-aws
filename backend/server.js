const express = require('express');
const cors = require('cors');
require('dotenv').config();
const quizRoutes = require('./routes/quiz');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// Rotas
app.use('/api', quizRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Quiz Adaptativo API funcionando!' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;