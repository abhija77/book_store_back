import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class InvertedToken {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    token: string;

    @Column()
    positions: string;
}
