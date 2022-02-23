import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Book } from './book';
import { Indexation } from './indexation';
// import { InvertedToken } from './inverted-token';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'phpmyadmin',
    password: 'admin',
    database: 'book_store',
    entities: [Book, Indexation],
    synchronize: true
  }),
    HttpModule,
  TypeOrmModule.forFeature([Book,Indexation]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
