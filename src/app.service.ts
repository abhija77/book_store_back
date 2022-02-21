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


  resolveText(text: string) {
    const words: BookWords[] = [];
    const allWords: string[] = text.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\r\n]/gi, " ")
      .split(" ").filter(word => word != '').map(word => word.toLowerCase());
    let wordMostPresent: BookWords = null;
    const wordsF = allWords
      .filter(val => {

        const value = val.toLowerCase();
        return !wordsNotAllowed.find(val => val == value);
      }
      );
    let wordNumber: number = allWords.length;
    wordsF.forEach((value: string) => {

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
  async updateBook(idUpdate: number, token: any) {
    try {
      await getConnection()
        .createQueryBuilder()
        .update(Book)
        .set({ tokenList: token })
        .where("id = :id", { id: idUpdate })
        .execute();
      return this.booksRepository.findOne(idUpdate)
    } catch (err) {
      console.log(err);

    }
  }
  findAll(): Promise<BookInterface[]> {
    return this.booksRepository.find();
  }

  async getTokens(id: number) {
    const res = await axios.get("https://www.gutenberg.org/files/" + id + "/" + id + "-0.txt", { timeout: 500000 }).then(value => value.data);
    const resResolved = this.resolveText(res);

    return resResolved;
  }

  async getBookId(id: number) {
    return this.booksRepository.findOne(id);
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
}
