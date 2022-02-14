import { Controller, Get, HttpService, Param } from '@nestjs/common';
import { AppService } from './app.service';
import axios from "axios";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private http: HttpService) {}

  @Get("/book/:id")
  async getHello(@Param("id") id: number) {
    console.log(id);
    
    const res =  await axios.get("https://www.gutenberg.org/files/"+id+"/"+id+"-0.txt").then(value => value.data);
    const resResolved = this.appService.resolveText(res);

    return resResolved;
  }
}
