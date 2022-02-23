import { Controller, Get, HttpException, HttpService, Param, Query, Response } from '@nestjs/common';
import { AppService } from './app.service';
import axios, { Axios } from "axios";
import BookInterface from './model/book.model';
import { Any } from 'typeorm';
import { IncomingMessage, ServerResponse } from 'http';
import { url } from 'inspector';

const HOST_GUTENBERG = "https://gutendex.com";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private http: HttpService) { }

  @Get("/books")
  async getBooks(@Query("topic") topic: string, @Query("lang") lang: string, @Query("limit") limit: number, @Query("search") search: string): Promise<any> {
    const askTopic = topic != null;
    const askLang = lang != null;
    const askSearch = search != null;
    let url = `${HOST_GUTENBERG}/books`;
    if (askLang && askTopic)
      url += `?topic=${topic}&languages=${lang}`;
    else if (askLang)
      url += `?languages=${lang}`;
    else if (askTopic)
      url += `?topic=${topic}`;
    let response: any[] = await axios.get(url).then(value => value.data.results);

    if(askSearch){
      const resp = await this.appService.findIndexationOne(search);
      
      if(resp){
        const idBooks = JSON.parse(resp.index).map(val => val.book);
        response = response.filter(book => idBooks.indexOf(book.id) > -1);
      } else {
        console.log("NOT");
      }
    }
    if (limit && limit > 1)
      response = response.slice(0, limit - 1);
    return response;
  }

  @Get("/book/detail/:id")
  async getBookDetail(@Param("id") id: number) {
    let response = await axios.get(`${HOST_GUTENBERG}/books/${id}`).then(value => value.data);
    return response;
  }


  @Get("/addBooks")
  async addBooks() {
    let url = `${HOST_GUTENBERG}/books`;
    return this.appService.createMany(url);
  }


  // @Get("/jaccard/:word")
  // async jaccard(@Param("word") word: string) {
  //   let v1 = {
  //     "le": 1,
  //     "moteur":
  //       1,
  //     "de":
  //       2,
  //     "recherche":
  //       2,
  //     "ideal":
  //       1,
  //     "doit":
  //       1,
  //     "comprendre":
  //       1,
  //     "exactement":
  //       2,
  //     "l":
  //       1,
  //     "objet":
  //       1,
  //     "la":
  //       1,
  //     "pour":
  //       1,
  //     "fournir":
  //       1,
  //     "les":
  //       1,
  //     "informations":
  //       1,
  //     "demandees":
  //       1
  //   }

  //   let v2 = {
  //     "le":
  //       2
  //   }
  //   // return this.appService.algojaccard(v1, v2);
  //   return this.appService.algojaccard(word)
  // }
  @Get("indexationJaccard")
  async indexationJaccard() {
    return this.appService.indexationJaccard();
  }
  @Get("/indexation")
  async indexation() {
    return this.appService.indexation();
  }
}