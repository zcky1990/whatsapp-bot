import db from '../lib/database';
import { AIConfig } from '../types/ai.config';

export interface CreateAIConfigData {
  user_id: number;
  name: string;
  endpoint: string;
  api_key: string;
}

export interface UpdateAIConfigData {
  name: string;
  endpoint: string;
  api_key: string;
}

export const createAIConfig = async (aiConfigData: CreateAIConfigData): Promise<AIConfig> => {
  
  return new Promise((resolve, reject) => {
    const { user_id, name, endpoint, api_key } = aiConfigData;
    
    const sql = `
      INSERT INTO ai_configs (user_id, name, endpoint, api_key, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    db.run(sql, [user_id, name, endpoint, api_key], function(err) {
      if (err) {
        console.error('Error creating AI config:', err);
        return reject(err);
      }
      
      // Fetch the created AI config
      const selectSql = 'SELECT * FROM ai_configs WHERE id = ?';
      db.get(selectSql, [this.lastID], (err, row) => {
        if (err) {
          console.error('Error fetching created AI config:', err);
          return reject(err);
        }
        resolve(row as AIConfig);
      });
    });
  });
};

export const getAllAIConfigs = async (userId: number): Promise<AIConfig[]> => {
  
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM ai_configs WHERE user_id = ? ORDER BY created_at DESC';
    
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        console.error('Error fetching AI configs:', err);
        return reject(err);
      }
      resolve(rows as AIConfig[]);
    });
  });
};

export const getAIConfigById = async (id: number, userId: number): Promise<AIConfig | null> => {
  
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM ai_configs WHERE id = ? AND user_id = ?';
    
    db.get(sql, [id, userId], (err, row) => {
      if (err) {
        console.error('Error fetching AI config:', err);
        return reject(err);
      }
      resolve(row as AIConfig || null);
    });
  });
};

export const updateAIConfig = async (
  id: number, 
  aiConfigData: UpdateAIConfigData, 
  userId: number
): Promise<AIConfig | null> => {
  
  return new Promise((resolve, reject) => {
    const { name, endpoint, api_key } = aiConfigData;
    
    const sql = `
      UPDATE ai_configs 
      SET name = ?, endpoint = ?, api_key = ?
      WHERE id = ? AND user_id = ?
    `;
    
    db.run(sql, [name, endpoint, api_key, id, userId], function(err) {
      if (err) {
        console.error('Error updating AI config:', err);
        return reject(err);
      }
      
      if (this.changes === 0) {
        return resolve(null); // No AI config found or updated
      }
      
      // Fetch the updated AI config
      const selectSql = 'SELECT * FROM ai_configs WHERE id = ?';
      db.get(selectSql, [id], (err, row) => {
        if (err) {
          console.error('Error fetching updated AI config:', err);
          return reject(err);
        }
        resolve(row as AIConfig);
      });
    });
  });
};

export const deleteAIConfig = async (id: number, userId: number): Promise<boolean> => {
  
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM ai_configs WHERE id = ? AND user_id = ?';
    
    db.run(sql, [id, userId], function(err) {
      if (err) {
        console.error('Error deleting AI config:', err);
        return reject(err);
      }
      resolve(this.changes > 0);
    });
  });
};
