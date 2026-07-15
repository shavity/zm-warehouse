import { idParser } from "../../../src/utils/parsers";

describe('Parsers - Unit Tests', () => {
    describe('idParser', () =>{
        it('Should return null for non-digit string', () => {
            expect(idParser('hello')).toBe(null);
        });

        it('Should return pre-point for floating point string', () => {
            expect(idParser("123.456")).toBe(123);
        });

        it('Should return a number for digit-only string', () => {
            expect(idParser("123")).toBe(123);
        });

        it('Should return number for black space with digits string', () => {
            expect(idParser("   123 ")).toBe(123);
        });
    });
});
