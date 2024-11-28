import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { Category } from '../../category/entities/category.entity';
import { Period } from '../../common/enum/period.enum';
import { Currency } from '../../common/enum/currency';

@Entity()
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.COP,
  })
  currency: Currency;

  @Column({ type: 'enum', enum: Period, default: Period.MONTHLY })
  period: Period;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @ManyToOne(() => User, (user) => user.budgets, { eager: true })
  @JoinColumn()
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.budget)
  transactions: Transaction[];

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn()
  category: Category;
}
