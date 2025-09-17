export interface Template {
  id: number;
  user_id: number;
  name: string;
  content: string;
  variables: string; // Stored as TEXT in SQLite, often JSON data as a string
  created_at: string;
}