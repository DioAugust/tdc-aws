const request = require('supertest');
const app = require('../server');

// Mock dos modelos
jest.mock('../models/Question');
const Question = require('../models/Question');

describe('Quiz API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/question', () => {
    test('deve retornar pergunta por nível', async () => {
      const mockQuestion = {
        id: 1,
        question: 'Quanto é 2 + 2?',
        type: 'multiple',
        options: ['3', '4', '5', '6'],
        difficulty: 1,
        subject: 'matemática',
        correct_answer: '4'
      };

      Question.findByLevel.mockResolvedValue(mockQuestion);

      const response = await request(app)
        .get('/api/question?level=1')
        .expect(200);

      expect(response.body).toEqual({
        id: 1,
        question: 'Quanto é 2 + 2?',
        type: 'multiple',
        options: ['3', '4', '5', '6'],
        difficulty: 1,
        subject: 'matemática'
      });
      expect(Question.findByLevel).toHaveBeenCalledWith(1, []);
    });

    test('deve usar nível padrão 1 se não especificado', async () => {
      const mockQuestion = { id: 1, question: 'Teste' };
      Question.findByLevel.mockResolvedValue(mockQuestion);

      await request(app)
        .get('/api/question')
        .expect(200);

      expect(Question.findByLevel).toHaveBeenCalledWith(1, []);
    });
  });

  describe('POST /api/answer', () => {
    test('deve processar resposta correta', async () => {
      const mockQuestion = {
        id: 1,
        question: 'Quanto é 2 + 2?',
        correct_answer: '4'
      };

      Question.findById.mockResolvedValue(mockQuestion);

      const response = await request(app)
        .post('/api/answer')
        .send({
          questionId: 1,
          answer: '4'
        })
        .expect(200);

      expect(response.body).toEqual({
        correct: true,
        feedback: 'Correto! A resposta é: 4',
        score: 10,
        newLevel: 1,
        accuracy: 1
      });
    });

    test('deve processar resposta incorreta', async () => {
      const mockQuestion = {
        id: 1,
        question: 'Quanto é 2 + 2?',
        correct_answer: '4'
      };

      Question.findById.mockResolvedValue(mockQuestion);

      const response = await request(app)
        .post('/api/answer')
        .send({
          questionId: 1,
          answer: '3'
        })
        .expect(200);

      expect(response.body).toEqual({
        correct: false,
        feedback: 'Incorreto. A resposta correta é: 4',
        score: 0,
        newLevel: 1,
        accuracy: 1
      });
    });

    test('deve retornar erro para pergunta não encontrada', async () => {
      Question.findById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/answer')
        .send({
          questionId: 999,
          answer: '4'
        })
        .expect(404);

      expect(response.body).toEqual({
        error: 'Pergunta não encontrada'
      });
    });
  });

  describe('GET /api/stats', () => {
    test('deve retornar estatísticas básicas', async () => {
      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body).toEqual({
        score: 0,
        level: 1,
        accuracy: 0,
        totalAnswers: 0,
        correctAnswers: 0
      });
    });
  });
});