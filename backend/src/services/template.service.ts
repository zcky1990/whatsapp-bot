import db from '../lib/database';
import { Template } from '../types/template';

export interface CreateTemplateData {
  user_id: number;
  name: string;
  content: string;
  variables: string;
}

export interface UpdateTemplateData {
  name: string;
  content: string;
  variables: string;
}

export const createTemplate = async (templateData: CreateTemplateData): Promise<Template> => {
  
  return new Promise((resolve, reject) => {
    const { user_id, name, content, variables } = templateData;
    
    const sql = `
      INSERT INTO templates (user_id, name, content, variables, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    db.run(sql, [user_id, name, content, variables], function(err) {
      if (err) {
        console.error('Error creating template:', err);
        return reject(err);
      }
      
      // Fetch the created template
      const selectSql = 'SELECT * FROM templates WHERE id = ?';
      db.get(selectSql, [this.lastID], (err, row) => {
        if (err) {
          console.error('Error fetching created template:', err);
          return reject(err);
        }
        resolve(row as Template);
      });
    });
  });
};

export const getAllTemplates = async (userId: number): Promise<Template[]> => {
  
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM templates WHERE user_id = ? ORDER BY created_at DESC';
    
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        console.error('Error fetching templates:', err);
        return reject(err);
      }
      resolve(rows as Template[]);
    });
  });
};

export const getTemplateById = async (id: number, userId: number): Promise<Template | null> => {
  
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM templates WHERE id = ? AND user_id = ?';
    
    db.get(sql, [id, userId], (err, row) => {
      if (err) {
        console.error('Error fetching template:', err);
        return reject(err);
      }
      resolve(row as Template || null);
    });
  });
};

export const updateTemplate = async (
  id: number, 
  templateData: UpdateTemplateData, 
  userId: number
): Promise<Template | null> => {
  
  return new Promise((resolve, reject) => {
    const { name, content, variables } = templateData;
    
    const sql = `
      UPDATE templates 
      SET name = ?, content = ?, variables = ?
      WHERE id = ? AND user_id = ?
    `;
    
    db.run(sql, [name, content, variables, id, userId], function(err) {
      if (err) {
        console.error('Error updating template:', err);
        return reject(err);
      }
      
      if (this.changes === 0) {
        return resolve(null); // No template found or updated
      }
      
      // Fetch the updated template
      const selectSql = 'SELECT * FROM templates WHERE id = ?';
      db.get(selectSql, [id], (err, row) => {
        if (err) {
          console.error('Error fetching updated template:', err);
          return reject(err);
        }
        resolve(row as Template);
      });
    });
  });
};

export const deleteTemplate = async (id: number, userId: number): Promise<boolean> => {
  
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM templates WHERE id = ? AND user_id = ?';
    
    db.run(sql, [id, userId], function(err) {
      if (err) {
        console.error('Error deleting template:', err);
        return reject(err);
      }
      resolve(this.changes > 0);
    });
  });
};
