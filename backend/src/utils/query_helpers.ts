export const buildSetClause = (fields: Record<string, unknown>): { setClause: string, values: unknown[] } => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  return { setClause, values };
};