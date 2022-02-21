import { Controller, Get, HttpException, HttpService, Param, Query, Response } from '@nestjs/common';
import { AppService } from './app.service';
import axios, { Axios } from "axios";
import BookInterface from './model/book.model';
import { Any } from 'typeorm';
import { IncomingMessage, ServerResponse } from 'http';

const HOST_GUTENBERG = "https://gutendex.com";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private http: HttpService) { }

  @Get("/book/:id")
  async getBookTokens(@Param("id") id: number) {
    return this.appService.getBookId(id);
  }

  @Get("/books")
  async getBooks(@Query("topic") topic: string, @Query("lang") lang: string,@Query("limit") limit: number): Promise<any> {
    const askTopic = topic != null;
    const askLang = lang != null;
    let url = `${HOST_GUTENBERG}/books`;
    if(askLang && askTopic)
      url += `?topic=${topic}&languages=${lang}`;
    else if(askLang)
      url += `?languages=${lang}`;
    else if(askTopic)
      url += `?topic=${topic}`;

    let response: any = await axios.get(url).then(value => value.data);
    
    if(limit && limit > 1)
      response = response.results.slice(0,limit - 1);
    return response;
  }

  @Get("/book/detail/:id")
  async getBookDetail(@Param("id")id: number){
    let response = await axios.get(`${HOST_GUTENBERG}/books/${id}`).then(value => value.data);
    return response;
  }


  @Get("/books/tokens")
  async getBooksTokens(): Promise<BookInterface[]> {
    return this.appService.findAll();
  }

  @Get("/addBooks")
  async addBooks() {
    let url = "https://gutendex.com/books"
    return this.appService.createMany(url);
  }

  @Get("/updateBooks")
  async updateBooks() {
    const books = await this.appService.findAll();
    this.tokenize(books);
    return {message: "books updated"};
  }

  async tokenize(books) {

    for (const element of books) {

      if (element.tokenList == null) {
        try {
          let url = await this.appService.getTokens(element.id_book);
          this.appService.updateBook(element.id, JSON.stringify(url));
        } catch (err) {
          console.log(err);

        }
      }
    }
  }

  @Get("/jaccard")
  async jaccard() {
    let v1 = {
      "le": 1,
      "moteur":
        1,
      "de":
        2,
      "recherche":
        2,
      "ideal":
        1,
      "doit":
        1,
      "comprendre":
        1,
      "exactement":
        2,
      "l":
        1,
      "objet":
        1,
      "la":
        1,
      "pour":
        1,
      "fournir":
        1,
      "les":
        1,
      "informations":
        1,
      "demandees":
        1
    }

    let v2 = {
      "le":
        2,
      "moustachee":
        1
    }
    return this.appService.algojaccard(v1, v2);
  }
}