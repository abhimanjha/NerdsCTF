import { User, Role } from '@prisma/client';

export interface IUserRepository {
    findById(id: number): Promise<(User & { role: Role }) | null>;
    findByEmail(email: string): Promise<(User & { role: Role & { permissions: { name: string }[] } }) | null>;
    findByUsername(username: string): Promise<User | null>;
    create(data: { email: string; username: string; passwordHash: string; roleId: number }): Promise<User>;
    update(id: number, data: Partial<User>): Promise<User>;
    findAll(skip?: number, take?: number): Promise<User[]>;
    delete(id: number): Promise<User>;
    count(): Promise<number>;
}
