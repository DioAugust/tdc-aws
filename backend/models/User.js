const pool = require('../config/database');

class User {
  static async findOrCreate(sessionId) {
    let result = await pool.query('SELECT * FROM users WHERE session_id = $1', [sessionId]);
    
    if (result.rows.length === 0) {
      result = await pool.query(
        'INSERT INTO users (session_id) VALUES ($1) RETURNING *',
        [sessionId]
      );
    }
    
    return result.rows[0];
  }

  static async updateStats(userId, isCorrect, currentLevel) {
    const scoreIncrement = isCorrect ? currentLevel * 10 : 0;
    
    await pool.query(`
      UPDATE users 
      SET 
        score = score + $1,
        correct_answers = correct_answers + $2,
        total_answers = total_answers + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [scoreIncrement, isCorrect ? 1 : 0, userId]);
    
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const userData = user.rows[0];
    
    const accuracy = userData.total_answers > 0 ? userData.correct_answers / userData.total_answers : 0;
    let newLevel = userData.level;
    
    if (accuracy >= 0.8 && newLevel < 5) {
      newLevel++;
    } else if (accuracy < 0.5 && newLevel > 1) {
      newLevel--;
    }
    
    await pool.query('UPDATE users SET level = $1 WHERE id = $2', [newLevel, userId]);
    
    return { ...userData, level: newLevel, accuracy };
  }

  static async getAnsweredQuestions(userId) {
    const result = await pool.query(
      'SELECT question_id FROM user_answers WHERE user_id = $1',
      [userId]
    );
    return result.rows.map(row => row.question_id);
  }

  static async saveAnswer(userId, questionId, userAnswer, isCorrect) {
    await pool.query(
      'INSERT INTO user_answers (user_id, question_id, user_answer, is_correct) VALUES ($1, $2, $3, $4)',
      [userId, questionId, userAnswer, isCorrect]
    );
  }
}

module.exports = User;