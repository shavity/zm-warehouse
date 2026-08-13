export interface Room {
    id: number;
    name: string;
}

export interface UpsertRoomResult extends Room {
    inserted: boolean;
}