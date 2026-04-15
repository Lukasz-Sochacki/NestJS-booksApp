import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [BooksController],
  providers: [BooksService],
  imports: [PrismaModule],
})
export class BooksModule {}
