export interface DailyChecklist {
    id: number;
    order_id: number;
    product_id: number;
    date: string;
    amount: number;
    activity: string;
    product_name?: string;
    room_name?: string;
}

export type CreateDailyChecklistInput = Omit<DailyChecklist, 'id' | 'product_name' | 'room_name'>;
export type UpdateDailyChecklistInput = Partial<Omit<DailyChecklist, 'id' | 'order_id' | 'product_id' | 'product_name' | 'room_name'>>;