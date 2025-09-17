import { TableSchema, Constraint } from './types';

export const generateCreateTableSQL = (schema: TableSchema): string => {
  const regularColumns = schema.columns.filter(col => 
    !col.constraints?.some(c => c.startsWith('FOREIGN KEY'))
  );

  const foreignKeys = schema.columns.filter(col => 
    col.constraints?.some(c => c.startsWith('FOREIGN KEY'))
  );

  const regularDefinitions = regularColumns.map(col => {
    let definition = `${col.name} ${col.type}`;
    if (col.constraints && col.constraints.length > 0) {
      definition += ` ${col.constraints.filter(c => !c.startsWith('FOREIGN KEY')).join(' ')}`;
    }
    return definition;
  });

  const foreignKeyDefinitions = foreignKeys.flatMap(col => 
    col.constraints?.filter(c => c.startsWith('FOREIGN KEY')) || []
  ) as string[]; // Cast the array to string[]

  const allDefinitions = regularDefinitions.concat(foreignKeyDefinitions).join(',\n    ');

  return `CREATE TABLE IF NOT EXISTS ${schema.name} (\n    ${allDefinitions}\n  )`;
};