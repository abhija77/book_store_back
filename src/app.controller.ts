import { Controller, Get, HttpService, Param } from '@nestjs/common';
import { AppService } from './app.service';
import axios from "axios";
import BookInterface from './model/book.model';
import { Any } from 'typeorm';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private http: HttpService) { }

  @Get("/book/:id")
  async getHello(@Param("id") id: number) {
    console.log(id);

    this.appService.getTokens(id)
  }

  @Get("/books")
  async getBooks(): Promise<BookInterface[]> {
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
    this.toto(books);

  }

  async toto(books) {

    for (const element of books) {

      if (element.tokenList == null) {
        try {
          console.log("debut : " + element.id);
          let url = await this.appService.getTokens(element.id_book);
          console.log("toto");

          this.appService.updateBook(element.id, JSON.stringify(url));
        } catch (err) {
          console.log(err);

        }
      }
    }
  }
}