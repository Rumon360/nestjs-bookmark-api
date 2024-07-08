import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookMarkDto, EditBookMartDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async getBookmarks(userId: number) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId: userId },
    });
    if (!bookmarks || bookmarks.length === 0) {
      throw new NotFoundException('Bookmarks Not Found');
    }
    return bookmarks;
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId, userId: userId },
    });
    if (!bookmark) {
      throw new NotFoundException('Bookmark Not Found');
    }
    delete bookmark.userId;
    return bookmark;
  }

  async createBookmark(userId: number, createBookmarkDto: CreateBookMarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        title: createBookmarkDto.title,
        description: createBookmarkDto.description,
        link: createBookmarkDto.link,
        userId: userId,
      },
    });
    delete bookmark.userId;
    return bookmark;
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    editBookmarkDto: EditBookMartDto,
  ) {
    const bookmark = await this.prisma.bookmark.update({
      where: { id: bookmarkId, userId: userId },
      data: {
        title: editBookmarkDto.title,
        description: editBookmarkDto.description,
        link: editBookmarkDto.link,
      },
    });
    if (!bookmark) {
      throw new NotFoundException('Bookmark Not Found');
    }
    return bookmark;
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.delete({
      where: { id: bookmarkId, userId: userId },
    });
    if (!bookmark) {
      throw new NotFoundException('Bookmark Not Found');
    }
    return bookmark;
  }
}
