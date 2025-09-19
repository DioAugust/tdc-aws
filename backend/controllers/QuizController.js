const Question = require('../models/Question');
const User = require('../models/User');

class QuizController {
  static async getQuestion(req, res) {
    try {
      const { level, exclude } = req.query;
      const userLevel = parseInt(level) || 1;
      const excludeIds = exclude ? exclude.split(',').map(id => parseInt(id)) : [];
      
      let question = await Question.findByLevel(userLevel, excludeIds);
      
      if (!question) {
        const allQuestions = await Question.getAll();
        question = allQuestions.find(q => !excludeIds.includes(q.id)) || allQuestions[0];
      }
      
      const { correct_answer, ...questionData } = question;
      res.json(questionData);
    } catch (error) {
      console.error('Erro ao buscar pergunta:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async submitAnswer(req, res) {
    try {
      const { questionId, answer } = req.body;
      
      const question = await Question.findById(parseInt(questionId));
      
      if (!question) {
        return res.status(404).json({ error: 'Pergunta não encontrada' });
      }
      
      const isCorrect = QuizController.checkAnswer(question, answer);
      
      const feedback = isCorrect 
        ? `Correto! A resposta é: ${question.correct_answer}`
        : `Incorreto. A resposta correta é: ${question.correct_answer}`;
      
      res.json({
        correct: isCorrect,
        feedback,
        score: isCorrect ? 10 : 0,
        newLevel: 1,
        accuracy: 1
      });
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static checkAnswer(question, userAnswer) {
    const correct = question.correct_answer.toLowerCase().trim();
    const user = userAnswer.toLowerCase().trim();
    
    if (question.type === 'multiple') {
      return correct === user;
    } else {
      return user.includes(correct) || correct.includes(user);
    }
  }

  static async getStats(req, res) {
    try {
      res.json({
        score: 0,
        level: 1,
        accuracy: 0,
        totalAnswers: 0,
        correctAnswers: 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = QuizController;