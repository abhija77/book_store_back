import { HttpService, Injectable } from '@nestjs/common';
import axios,{ Axios, AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import BookWords from './model/book-words.model';

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
  getHello(): string {
    return 'Hello World!';
  }

  constructor(private http : HttpService){

  }

  createBook(): any {

    
    return null;
  }


  resolveText(text: string){
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
                  
          const word :BookWords[]= words.filter((book: BookWords) => book.token.toLowerCase() === value.toLowerCase() && book.token.length == value.length);
          let obj = word.length > 0 ? 
            word[0]
          : {
            token: value.toLowerCase(),
            occurence: 0,
            ratio : 0
          }
          obj.occurence ++;
          
          if(word.length == 0){
            words.push(obj);
          }
          
        });

        words.forEach((word:BookWords) => {
          if(wordMostPresent == null || word.occurence > wordMostPresent.occurence){
            wordMostPresent = word
          }
          word.ratio = word.occurence /wordNumber;
        });
        
        return words;
        
  }
}
