import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class IndexationJaccard {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "longtext"
    })
    indexJaccard: string;

}
