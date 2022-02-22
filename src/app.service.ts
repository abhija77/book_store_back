/* eslint-disable prettier/prettier */
import { HttpService, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { Axios, AxiosResponse } from 'axios';
import { Observable, timeout } from 'rxjs';
import { Connection, getConnection, Repository } from 'typeorm';
import { Book } from './book';
import BookWords from './model/book-words.model';
import BookInterface from './model/book.model';

const wordsNotAllowed = [
  "de",
  "le",
  "la",
  "les",
  "du",
  "des",
  "un",
  "une",
  ".",
  ",",
  "a",
  "the",
  "an",
  "to",
  "if",
  "we",
  "on",
  "at",
  "us",
  "our",
  "of",
  "or",
  "and",
  "by",
  "this",
  "is",
  "are",
  "for",
  "in",
  "you",
  "it",
  "tm",
  "re"
]

@Injectable()
export class AppService {


  constructor(private http: HttpService, private connection: Connection, @InjectRepository(Book)
  private booksRepository: Repository<BookInterface>) {

  }

  createBook(): any {


    return null;
  }

  tokenize(text) {
    const allWords: string[] = text.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\r\n]/gi, " ")
      .split(" ")
      .filter(word => word != '')
      .map(word => word.toLowerCase());
    const wordsF = allWords
      .filter(val => {

        const value = val.toLowerCase();
        return !wordsNotAllowed.find(val => val == value);
      }
      );

    return { size: allWords.length, words: wordsF };
  }

  resolveText(text: string) {
    const words: BookWords[] = [];
    const list = this.tokenize(text);
    let wordMostPresent: BookWords = null;
    let wordNumber: number = list.size;

    list.words.forEach((value: string) => {

      const word: BookWords[] = words.filter((book: BookWords) => book.token.toLowerCase() === value.toLowerCase() && book.token.length == value.length);
      let obj = word.length > 0 ?
        word[0]
        : {
          token: value.toLowerCase(),
          occurence: 0,
          ratio: 0
        }
      obj.occurence++;

      if (word.length == 0) {
        words.push(obj);
      }

    });

    words.forEach((word: BookWords) => {
      if (wordMostPresent == null || word.occurence > wordMostPresent.occurence) {
        wordMostPresent = word
      }
      word.ratio = word.occurence / wordNumber;
    });

    return words;

  }



  async createMany(url: any) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const res = await axios.get(url).then(value => value.data);
    let results = res.results;
    results.forEach(async element => {
      let book: Book = new Book()
      book.url_content = element.formats["text/plain; charset=utf-8"];
      if (book.url_content != null && book.url_content.includes("txt")) {
        book.id_book = element.id
        try {
          await queryRunner.manager.save(book)
          await queryRunner.commitTransaction();

        }
        catch (err) {
          await queryRunner.rollbackTransaction();
          console.log("erreur : " + err)
          return err;
        }
      }

    });
  }

  findAll(): Promise<BookInterface[]> {
    return this.booksRepository.find();
  }

  async getTokens(url) {
    const res = await axios.get(url)
      .then(value => { console.log(value.status); return value.data; })
      .catch(error => { console.log("erreur : " + error) })
    let resResolved;
    if (res) {
      resResolved = this.resolveText(res);
    }
    return resResolved;
  }

  async algojaccard(v1, v2) {

    {
      /*Nombre d’éléments contenus dans les deux vecteurs (intersection)*/
      let i: number = 0;
      /*Nombre d’éléments total des deux vecteurs (union)*/
      let u: number = 0;
      /*On parcourt le premier vecteur d’occurrence*/
      for (const [w, c] of (Object.entries(v1) as [string, number][])) {
        /*On ajoute le nombre d’occurrence du mot à l'union*/
        u = u + c;
        /*Si le mot est présent dans le second vecteur on ajoute le nombre d’occurrence à l'intersection*/
        if (v2[w] != null) {
          i += c + v2[w];
        }
      }
      /*On parcourt le second vecteur d’occurrence pour ajouter les occurrences à l'union*/
      for (const [w, c] of (Object.entries(v1) as [string, number][])) {
        u += c;
      }
      /*On retourne l'Indice de Jaccard*/
      return i / u;
    }

  }

  //InProgress
  async getIndexTable() {
    let indexTable = {};
    let books = await this.findAll();
    // books.forEach(async book => {
    //   const listToken =  await this.getTokens(book.url_content);
    //   console.log(listToken);
    //   if (listToken != null && listToken != []) {
    //     listToken.forEach(tokens => {
    //       console.log("running");
    //       let objWord;
    //       if (indexTable[tokens.token]) {
    //         objWord = { "book": book.id_book, "occurences": tokens.occurence };
    //       }
    //       else {
    //         objWord = { "book": book.id_book, "occurences": tokens.occurence };
    //         indexTable[tokens.token] = [];
    //       }
    //       indexTable[tokens.token].push(objWord)
    //     });
    //   }
    // });
    for (const (book: BookInterface) of books) {
      const listToken = await this.getTokens(book.url_content);
      console.log(listToken);
      if (listToken != null && listToken != []) {
        listToken.forEach(tokens => {
          console.log("running");
          let objWord;
          if (indexTable[tokens.token]) {
            objWord = { "book": book.id_book, "occurences": tokens.occurence };
          }
          else {
            objWord = { "book": book.id_book, "occurences": tokens.occurence };
            indexTable[tokens.token] = [];
          }
          indexTable[tokens.token].push(objWord)
        });
      }
      console.log("finish");
      return indexTable;

    }
  }

  async indexation() {
    console.log("salut");
    return await this.getIndexTable();

  }
}
