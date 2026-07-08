export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    user_id?: number;
    returned_by?: number;
    amount: number;
    actual_amount?: number;
    returned_amount?: number;
    comment?: string;
    deleted_at?: Date;
    product_name?: string;
    room_id?: number;
    room_name?: string;
    taken_by_name?: string;
    returned_by_name?: string;
}

export type CreateOrderItemInput = Pick<OrderItem, 'order_id' | 'product_id' | 'amount' | 'user_id'>;
export type UpdateOrderItemInput = Partial<Pick<OrderItem, 'amount' | 'actual_amount' | 'returned_amount' | 'comment' | 'user_id' | 'returned_by'>>;