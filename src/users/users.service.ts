import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Password, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  public getAll(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }

  public getById(id: User['id']): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  public async getByEmail(
    email: User['email'],
  ): Promise<(User & { password: Password }) | null> {
    return this.prismaService.user.findUnique({
      where: { email },
      include: { password: true },
    });
  }

  public async create(
    userData: { email: string },
    password: string,
  ): Promise<User> {
    try {
      return await this.prismaService.user.create({
        data: {
          ...userData,
          password: {
            create: {
              hashedPassword: password,
            },
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002')
        throw new ConflictException('Email is already taken');
      throw error;
    }
  }

  public async updateById(
    id: User['id'],
    userData: { email: string },
    password?: string,
  ): Promise<User> {
    try {
      if (password) {
        return await this.prismaService.user.update({
          where: { id },
          data: {
            ...userData,
            password: {
              update: {
                hashedPassword: password,
              },
            },
          },
        });
      }
      return await this.prismaService.user.update({
        where: { id },
        data: userData,
      });
    } catch (error: any) {
      if (error.code === 'P2002')
        throw new ConflictException('Email is already taken');
      throw error;
    }
  }

  public deleteById(id: User['id']): Promise<User> {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
