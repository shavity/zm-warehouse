import { RoleName } from '@models/role';

export interface User {
    id: number;
    name: string;
    phone_number: string;
    role_id: number;
    role_name?: RoleName;
}

export type CreateUserInput = Omit<User, 'id' | 'role_name'>;
export type UpdateUserInput = Partial<Omit<User, 'id' | 'role_name'>>;