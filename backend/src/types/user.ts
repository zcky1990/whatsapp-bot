export interface User {
  id: number;
  username: string;
  password?: string; // Optional because it might not be fetched for public use
  created_at: string; // Stored as TEXT (DATETIME) in SQLite, so a string in TS
}