import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Book } from './book';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'phpmyadmin',
    password: 'admin',
    database: 'book_store',
    entities: [Book],
    synchronize: true
  }),
    HttpModule,
  TypeOrmModule.forFeature([Book]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
