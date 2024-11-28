import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Budget } from '../../budget/entities/budget.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Budget, (budget) => budget.category)
  budgets: Budget[];

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];
}
