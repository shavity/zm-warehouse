export const israeliPhoneRegex = /^(\+972|0)(5[0-9]|7[0-9]|2|3|4|8|9)\d{7}$/;

export const isValidIsraeliPhone = (phone: string): boolean => {
    return israeliPhoneRegex.test(phone.trim());
};

export const isNonEmptyString = (value: unknown): boolean => {
    return typeof value === 'string' && value.trim() !== '';
};

export const isNatural = (value: unknown): boolean => {
    return Number.isInteger(value) && (value as number) > 0;
};

export const isNonNegativeInteger = (value: unknown): boolean => {
    return Number.isInteger(value) && (value as number) >= 0;
};
