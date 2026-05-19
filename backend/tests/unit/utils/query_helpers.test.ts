import { buildSetClause } from '../../../src/utils/query_helpers';

describe('queryHelpers - Unit Tests', () => {

  describe('buildSetClause', () => {
    it('should build a correct set clause for one field', () => {
      const { setClause, values } = buildSetClause({ name: 'Yair' });
      expect(setClause).toBe('name = $1');
      expect(values).toEqual(['Yair']);
    });

    it('should build a correct set clause for multiple fields', () => {
      const { setClause, values } = buildSetClause({ name: 'Yair', phone_number: '0501234567' });
      expect(setClause).toBe('name = $1, phone_number = $2');
      expect(values).toEqual(['Yair', '0501234567']);
    });

    it('should handle integer values', () => {
      const { setClause, values } = buildSetClause({ role_id: 1 });
      expect(setClause).toBe('role_id = $1');
      expect(values).toEqual([1]);
    });

    it('should handle mixed field types', () => {
      const { setClause, values } = buildSetClause({ name: 'Yair', role_id: 2 });
      expect(setClause).toBe('name = $1, role_id = $2');
      expect(values).toEqual(['Yair', 2]);
    });
  });
});