import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Indexation {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    token: string;

    @Column({
        type: "longtext"
    })
    index: string;

}
