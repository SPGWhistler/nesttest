import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import got from 'got';
import { parse } from 'fast-xml-parser';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BooksService {
  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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
    let result = {};
    const bookApiHost = this.configService.get<string>('BOOK_API_HOST');
    const bookApiKey = this.configService.get<string>('BOOK_API_KEY');
    try {
      const resp = await got(
        `${bookApiHost}/book/show.xml?key=${bookApiKey}&id=${id}`,
      );
      if (resp.statusCode === 200) {
        const jsonObj = parse(resp.body, {});
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
            authors: book.authors.reduce((acc, author) => {
              if (author.id && author.name && author.image_url) {
                acc.push({
                  author_image: author.image_url,
                  author_id: author.id,
                  author_name: author.name,
                });
              }
              return acc;
            }, []),
            desc: book.description,
            image: book.image_url,
            large_image: this.getLargeImageUrl(book.image_url),
            isbn13: book.isbn13,
            pages: book.num_pages,
            pub_date: new Date(
              book.publication_year,
              book.publication_month + 1,
            ),
            publisher: book.publisher,
            title: book.title,
          };
        }
      }
    } catch (ignored) {}
    return result;
  }

  getLargeImageUrl(url: string): string {
    let output = url;
    const matches = url.match(/(http(?:s)?:\/\/.*\._)s.*?(_\.jpg)/i);
    if (matches && Array.isArray(matches) && matches[1] && matches[2]) {
      output = matches[1] + 'SX800' + matches[2];
    }
    return output;
  }

  cleanResults(result: Record<any, unknown>): Record<any, unknown> {
    return result; //TODO
  }
}
