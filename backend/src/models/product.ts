export interface Product {
    id: number;
    name: string;
    room_id: number;
    category_id: number;
    in_stock: number;
    minimum_in_stock: number;
    is_expendable: boolean;
    weight?: number;
    picture_url?: string;
    room_name?: string;
    category_name?: string;
}

export type CreateProductInput = Omit<Product, 'id' | 'room_name' | 'category_name'>;
export type UpdateProductInput = Partial<Omit<Product, 'id' | 'room_name' | 'category_name'>>;