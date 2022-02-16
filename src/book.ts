import internal from "stream";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Book {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    id_book: number;

    @Column({
        type: "mediumtext",
        nullable: true
    })
    url_content: string;

    @Column({
        type: "longtext",
        nullable: true
    })
    tokenList: string;
}
