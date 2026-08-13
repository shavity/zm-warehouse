export interface Category {
    id: number;
    name: string;
}

export interface UpsertCategoryResult extends Category {
    inserted: boolean;
}