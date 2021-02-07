import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import got from 'got';
import { parse } from 'fast-xml-parser';

@Injectable()
export class BookService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getResultForId(id: string): Promise<Record<any, unknown>> {
    let result;
    //TODO validate user input (probably in controller or before it?)
    try {
      result = await this.cacheManager.get('bookid:' + id);
    } catch (ignored) {}
    if (!Array.isArray(result)) {
      result = await this.makeRequest(id);
      result = this.cleanResults(result);
      await this.cacheManager.set('bookid:' + id, result, { ttl: 86400 }); //cache for 24 hours
    }
    return result;
  }

  async makeRequest(id: string): Promise<Record<any, unknown>> {
    const resp = await got(
      `https://www.goodreads.com/book/show.xml?key=RDfV4oPehM6jNhxfNQzzQ&id=${id}`,
    );
    const jsonObj = parse(resp.body, {});
    let result;
    if (
      jsonObj &&
      jsonObj.GoodreadsResponse &&
      jsonObj.GoodreadsResponse.book
    ) {
      const book = jsonObj.GoodreadsResponse.book;
      if (!Array.isArray(book.authors)) {
        book.authors = [book.authors.author];
      }
      result = {
        id: book.id,
        authors: book.authors.map((author) => ({
          author_image: author.image_url,
          author_id: author.id,
          author_name: author.name,
        })),
        desc: book.description,
        image: book.image_url,
        isbn13: book.isbn13,
        pages: book.num_pages,
        pub_date: new Date(book.publication_year, book.publication_month + 1),
        publisher: book.publisher,
        title: book.title,
      };
    }
    return result;
  }

  cleanResults(result: Record<any, unknown>): Record<any, unknown> {
    return result; //TODO
  }
}
