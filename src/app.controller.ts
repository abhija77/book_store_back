import { Controller, Get, HttpService, Param, Response } from '@nestjs/common';
import { AppService } from './app.service';
import axios from "axios";
import BookInterface from './model/book.model';
import { Any } from 'typeorm';

const HOST_GUTENBERG = "https://gutendex.com";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private http: HttpService) { }

  @Get("/book/:id")
  async getBookTokens(@Param("id") id: number) {
    return this.appService.getBookId(id);
  }

  @Get("/books")
  async getBooks(): Promise<any> {
    let response = await axios.get(`${HOST_GUTENBERG}/books`).then(value => value.data);
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
}