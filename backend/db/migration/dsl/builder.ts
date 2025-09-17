import { Column, TableSchema, ColumnType, Constraint } from './types';

// Builder for a single column
export const column = (name: string, type: ColumnType, constraints: Constraint[] = []): Column => ({
  name,
  type,
  constraints,
});

// Builder for a single table
export const table = (name: string, columns: Column[]): TableSchema => ({
  name,
  columns,
});