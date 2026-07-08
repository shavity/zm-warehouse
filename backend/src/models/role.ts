export enum RoleName {
    Admin = 'admin',
    Member = 'member',
}

export interface Role {
    id: number;
    name: RoleName;
}