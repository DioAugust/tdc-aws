const pool = require('../config/database');

class Question {
  static async findByLevel(level, excludeIds = []) {
    let query = 'SELECT id, question, type, options, difficulty, subject FROM questions WHERE difficulty = $1';
    const params = [level];
    
    if (excludeIds.length > 0) {
      const placeholders = excludeIds.map((_, i) => `$${i + 2}`).join(',');
      query += ` AND id NOT IN (${placeholders})`;
      params.push(...excludeIds);
    }
    
    query += ' ORDER BY RANDOM() LIMIT 1';
    const result = await pool.query(query, params);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM questions WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async getAll() {
    const result = await pool.query('SELECT * FROM questions ORDER BY difficulty, id');
    return result.rows;
  }
}

module.exports = Question;