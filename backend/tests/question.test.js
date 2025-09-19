const Question = require('../models/Question');

// Mock do pool de conexão
jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const pool = require('../config/database');

describe('Question Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('deve retornar todas as perguntas', async () => {
      const mockQuestions = [
        { id: 1, question: 'Teste 1', difficulty: 1 },
        { id: 2, question: 'Teste 2', difficulty: 2 }
      ];
      
      pool.query.mockResolvedValue({ rows: mockQuestions });
      
      const result = await Question.getAll();
      
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM questions ORDER BY difficulty, id');
      expect(result).toEqual(mockQuestions);
    });
  });

  describe('findById', () => {
    test('deve retornar pergunta por ID', async () => {
      const mockQuestion = { id: 1, question: 'Teste', difficulty: 1 };
      
      pool.query.mockResolvedValue({ rows: [mockQuestion] });
      
      const result = await Question.findById(1);
      
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM questions WHERE id = $1', [1]);
      expect(result).toEqual(mockQuestion);
    });
  });

  describe('findByLevel', () => {
    test('deve retornar pergunta por nível', async () => {
      const mockQuestion = { id: 1, question: 'Teste', difficulty: 1 };
      
      pool.query.mockResolvedValue({ rows: [mockQuestion] });
      
      const result = await Question.findByLevel(1, []);
      
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, question, type, options, difficulty, subject FROM questions WHERE difficulty = $1 ORDER BY RANDOM() LIMIT 1',
        [1]
      );
      expect(result).toEqual(mockQuestion);
    });

    test('deve excluir IDs especificados', async () => {
      const mockQuestion = { id: 3, question: 'Teste', difficulty: 1 };
      
      pool.query.mockResolvedValue({ rows: [mockQuestion] });
      
      const result = await Question.findByLevel(1, [1, 2]);
      
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, question, type, options, difficulty, subject FROM questions WHERE difficulty = $1 AND id NOT IN ($2,$3) ORDER BY RANDOM() LIMIT 1',
        [1, 1, 2]
      );
      expect(result).toEqual(mockQuestion);
    });
  });
});