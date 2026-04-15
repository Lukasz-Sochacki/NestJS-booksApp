import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Book } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDTO } from './dtos/create-book.dto';
import { UpdateAuthorDTO } from 'src/authors/dtos/update-author.dto';
import { UpdateBookDTO } from './dtos/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prismaService: PrismaService) {}

  public getAll(): Promise<Book[]> {
    return this.prismaService.book.findMany({ include: { author: true } });
  }

  public getById(id: Book['id']): Promise<Book | null> {
    return this.prismaService.book.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  public deleteById(id: Book['id']): Promise<Book> {
    return this.prismaService.book.delete({
      where: { id },
    });
  }

  public async create(bookData: CreateBookDTO): Promise<Book> {
    // Sprawdzenie czy autor istnieje (wymóg zadania: 400 Bad Request)
    const author = await this.prismaService.author.findUnique({
      where: { id: bookData.authorId },
    });
    if (!author) throw new BadRequestException('Author does not exist');

    try {
      return await this.prismaService.book.create({
        data: bookData,
      });
    } catch (error: any) {
      if (error.code === 'P2002')
        throw new ConflictException('Title is already taken');
      throw error;
    }
  }

  public async updateById(
    id: Book['id'],
    bookData: UpdateBookDTO,
  ): Promise<Book> {
    const author = await this.prismaService.author.findUnique({
      where: { id: bookData.authorId },
    });
    if (!author) throw new BadRequestException('Author does not exist');
    try {
      return await this.prismaService.book.update({
        where: { id },
        data: bookData,
      });
    } catch (error: any) {
      if (error.code === 'P2002')
        throw new ConflictException('Title is already taken');
      throw error;
    }
  }
}
