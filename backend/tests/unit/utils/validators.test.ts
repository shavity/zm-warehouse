import {
    isNonEmptyString,
    isNatural,
    isNonNegativeInteger,
    isValidIsraeliPhone,
} from '../../../src/utils/validators';

describe('Validators - Unit Tests', () => {
    describe('isNonEmptyString', () => {
        it('should return true for a valid string', () => {
            expect(isNonEmptyString('hello')).toBe(true);
        });

        it('should return false for an empty string', () => {
            expect(isNonEmptyString('')).toBe(false);
        });

        it('should return false for a string with only spaces', () => {
            expect(isNonEmptyString('   ')).toBe(false);
        });

        it('should return false for a number', () => {
            expect(isNonEmptyString(123)).toBe(false);
        });

        it('should return false for null', () => {
            expect(isNonEmptyString(null)).toBe(false);
        });

        it('should return false for undefined', () => {
            expect(isNonEmptyString(undefined)).toBe(false);
        });
    });

    describe('isNatural', () => {
        it('should return true for a positive integer', () => {
            expect(isNatural(1)).toBe(true);
        });

        it('should return true for a large positive integer', () => {
            expect(isNatural(100)).toBe(true);
        });

        it('should return false for zero', () => {
            expect(isNatural(0)).toBe(false);
        });

        it('should return false for a negative integer', () => {
            expect(isNatural(-1)).toBe(false);
        });

        it('should return false for a float', () => {
            expect(isNatural(1.5)).toBe(false);
        });

        it('should return false for a string', () => {
            expect(isNatural('1')).toBe(false);
        });

        it('should return false for null', () => {
            expect(isNatural(null)).toBe(false);
        });
    });

    describe('isNonNegativeInteger', () => {
        it('should return true for zero', () => {
            expect(isNonNegativeInteger(0)).toBe(true);
        });

        it('should return true for a positive integer', () => {
            expect(isNonNegativeInteger(5)).toBe(true);
        });

        it('should return false for a negative integer', () => {
            expect(isNonNegativeInteger(-1)).toBe(false);
        });

        it('should return false for a float', () => {
            expect(isNonNegativeInteger(1.5)).toBe(false);
        });

        it('should return false for a string', () => {
            expect(isNonNegativeInteger('0')).toBe(false);
        });

        it('should return false for null', () => {
            expect(isNonNegativeInteger(null)).toBe(false);
        });
    });

    describe('isValidIsraeliPhone', () => {
        it('should return true for a valid mobile number', () => {
            expect(isValidIsraeliPhone('0501234567')).toBe(true);
        });

        it('should return true for a valid mobile number with +972', () => {
            expect(isValidIsraeliPhone('+972501234567')).toBe(true);
        });

        it('should return true for a valid landline', () => {
            expect(isValidIsraeliPhone('021234567')).toBe(true);
        });

        it('should return false for an invalid landline', () => {
            expect(isValidIsraeliPhone('0212345678')).toBe(false);
        });

        it('should return true with leading/trailing spaces', () => {
            expect(isValidIsraeliPhone('  0501234567  ')).toBe(true);
        });

        it('should return false for a number that is too short', () => {
            expect(isValidIsraeliPhone('050123')).toBe(false);
        });

        it('should return false for a number that is too long', () => {
            expect(isValidIsraeliPhone('050123456789')).toBe(false);
        });

        it('should return false for an empty string', () => {
            expect(isValidIsraeliPhone('')).toBe(false);
        });

        it('should return false for a non-israeli number', () => {
            expect(isValidIsraeliPhone('0012345678')).toBe(false);
        });
    });
});
