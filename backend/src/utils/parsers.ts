export const idParser = (value: string): number | null => {
    const id = parseInt(value);
    return isNaN(id) ? null : id;
};