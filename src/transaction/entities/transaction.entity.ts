import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Budget } from '../../budget/entities/budget.entity';
import { Category } from '../../category/entities/category.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne(() => Budget, (budget) => budget.transactions, { eager: true })
  budget: Budget;

  @ManyToOne(() => Category, (category) => category.transactions, {
    eager: true,
  })
  category: Category;

  @ManyToOne(() => User, (user) => user.transactions, { eager: true })
  @JoinColumn()
  user: User;
}
