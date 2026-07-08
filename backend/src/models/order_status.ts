export enum OrderStatusName {
    Draft = 'draft',
    Active = 'active',
    Loaded = 'loaded',
    Returned = 'returned',
    Completed = 'completed',
    Cancelled = 'cancelled',
}

export interface OrderStatus {
    id: number;
    name: OrderStatusName;
}