import db from '../lib/database';
import { Rule, CreateRuleData, UpdateRuleData } from '../types/rule';

export const createRule = async (ruleData: CreateRuleData): Promise<Rule> => {
  return new Promise((resolve, reject) => {
    const {
      user_id,
      name,
      description,
      is_active = true,
      priority = 0,
      condition_type,
      condition_value,
      condition_operator = 'contains',
      action_type,
      action_value,
      action_data
    } = ruleData;

    const sql = `
      INSERT INTO rules (
        user_id, name, description, is_active, priority,
        condition_type, condition_value, condition_operator,
        action_type, action_value, action_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      user_id, name, description, is_active, priority,
      condition_type, condition_value, condition_operator,
      action_type, action_value, action_data
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        // Fetch the created rule
        getRuleById(this.lastID).then(rule => {
          if (rule) {
            resolve(rule);
          } else {
            reject(new Error('Failed to retrieve created rule'));
          }
        }).catch(reject);
      }
    });
  });
};

export const getAllRules = async (userId: number): Promise<Rule[]> => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM rules 
      WHERE user_id = ? 
      ORDER BY priority DESC, created_at DESC
    `;

    db.all(sql, [userId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as Rule[]);
      }
    });
  });
};

export const getActiveRules = async (userId: number): Promise<Rule[]> => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM rules 
      WHERE user_id = ? AND is_active = 1 
      ORDER BY priority DESC, created_at DESC
    `;

    db.all(sql, [userId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as Rule[]);
      }
    });
  });
};

export const getRuleById = async (id: number): Promise<Rule | null> => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM rules WHERE id = ?';

    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as Rule || null);
      }
    });
  });
};

export const updateRule = async (id: number, ruleData: UpdateRuleData, userId: number): Promise<Rule | null> => {
  return new Promise((resolve, reject) => {
    const fields = [];
    const values = [];

    Object.entries(ruleData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return getRuleById(id).then(resolve).catch(reject);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id, userId);

    const sql = `
      UPDATE rules 
      SET ${fields.join(', ')} 
      WHERE id = ? AND user_id = ?
    `;

    db.run(sql, values, function(err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        resolve(null);
      } else {
        getRuleById(id).then(resolve).catch(reject);
      }
    });
  });
};

export const deleteRule = async (id: number, userId: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM rules WHERE id = ? AND user_id = ?';

    db.run(sql, [id, userId], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes > 0);
      }
    });
  });
};

export const toggleRuleStatus = async (id: number, userId: number): Promise<Rule | null> => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE rules 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ?
    `;

    db.run(sql, [id, userId], function(err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        resolve(null);
      } else {
        getRuleById(id).then(resolve).catch(reject);
      }
    });
  });
};

export const getRulesByConditionType = async (userId: number, conditionType: string): Promise<Rule[]> => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM rules 
      WHERE user_id = ? AND condition_type = ? AND is_active = 1 
      ORDER BY priority DESC, created_at DESC
    `;

    db.all(sql, [userId, conditionType], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as Rule[]);
      }
    });
  });
};
