import { OrderStatusName } from "@models/order_status";

export interface Order {
    id: number;
    name: string;
    created_by: number;
    status_id: number;
    start_date: string;
    expire_date?: string;
    created_by_name?: string;
    status_name?: OrderStatusName;
}

export type CreateOrderInput = Omit<Order, 'id' | 'created_by_name' | 'status_name'>;
export type UpdateOrderInput = Partial<Omit<Order, 'id' | 'created_by_name' | 'status_name'>>;