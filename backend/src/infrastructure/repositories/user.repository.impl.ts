import { PrismaClient, User, Role } from '@prisma/client';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { PrismaService } from '../database/prisma.service';

export class UserRepositoryImpl implements IUserRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = PrismaService.getInstance();
    }

    async findById(id: number): Promise<(User & { role: Role }) | null> {
        return this.prisma.user.findUnique({
            where: { id },
            include: { role: true }
        });
    }

    async findByEmail(email: string): Promise<(User & { role: Role & { permissions: { name: string }[] } }) | null> {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                role: {
                    include: {
                        permissions: true
                    }
                }
            }
        }) as any;
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { username }
        });
    }

    async create(data: { email: string; username: string; passwordHash: string; roleId: number }): Promise<User> {
        return this.prisma.user.create({
            data
        });
    }

    async update(id: number, data: Partial<User>): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data
        });
    }

    async findAll(skip = 0, take = 50): Promise<User[]> {
        return this.prisma.user.findMany({
            skip,
            take,
            include: { role: true }
        });
    }

    async delete(id: number): Promise<User> {
        return this.prisma.user.delete({
            where: { id }
        });
    }

    async count(): Promise<number> {
        return this.prisma.user.count();
    }
}
