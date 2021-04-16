import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Flavor } from './flavor.entity';

@Entity('coffees')
export class Coffee {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column({ nullable: true })
  description: string;
  @Column()
  brand: string;
  @Column({ default: 0 })
  recommendations: number;
  @JoinTable()
  @ManyToMany(() => Flavor, (flavor: Flavor) => flavor.coffees, {
    cascade: true, // ['insert']
  })
  flavors: Flavor[];
}
