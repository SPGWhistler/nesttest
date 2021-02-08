import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import got from 'got';
import { parse } from 'fast-xml-parser';
import { ConfigService } from '@nestjs/config';

interface Author {
  author_image: string;
  author_id: number;
  author_name: string;
}
export interface Result {
  id: number;
  authors: Array<Author>;
  desc: string;
  image: string;
  large_image: string;
  isbn13: string;
  pages: number;
  pub_date: Date | number;
  publisher: string;
  title: string;
}

@Injectable()
export class BooksService {
  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getResultForId(
    id: string,
    fields: string,
  ): Promise<Record<any, unknown>> {
    let result: Result;
    try {
      result = await this.cacheManager.get('bookid:' + id);
    } catch (ignored) {}
    if (!result) {
      result = await this.makeRequest(id);
      await this.cacheManager.set('bookid:' + id, result, { ttl: 86400 }); //cache for 24 hours
    }
    return this.filterResult(result, this.parseFieldsParam(fields));
  }

  async makeRequest(id: string): Promise<Result> {
    let result: Result = {
      id: 0,
      authors: [],
      desc: '',
      image: '',
      large_image: '',
      isbn13: '',
      pages: 0,
      pub_date: 0,
      publisher: '',
      title: '',
    };
    //const bookApiHost = this.configService.get<string>('BOOK_API_HOST');
    //const bookApiKey = this.configService.get<string>('BOOK_API_KEY');
    const bookApiHost = 'https://www.goodreads.com';
    const bookApiKey = 'RDfV4oPehM6jNhxfNQzzQ';
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

  filterResult(result: Result, fields: Array<string>): Record<any, unknown> {
    let output = {};
    if (fields.length) {
      Object.keys(result).forEach((key) => {
        if (fields.includes(key)) {
          output[key] = result[key];
        }
      });
    } else {
      output = result;
    }
    return output;
  }

  parseFieldsParam(dirtyFieldsParam: string): Array<string> {
    let fields = [];
    if (dirtyFieldsParam && dirtyFieldsParam !== '') {
      fields = dirtyFieldsParam.split(',').reduce((acc, field) => {
        field = field.trim();
        switch (field) {
          case 'id':
          case 'authors':
          case 'desc':
          case 'image':
          case 'large_image':
          case 'pages':
          case 'pub_date':
          case 'publisher':
          case 'title':
            acc.push(field);
            break;
        }
        return acc;
      }, []);
    }
    return fields;
  }
}
