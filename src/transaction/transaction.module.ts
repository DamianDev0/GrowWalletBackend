import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Transaction } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from '../budget/entities/budget.entity';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/guard/auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Budget, User, Category])],
  controllers: [TransactionController],
  providers: [TransactionService, JwtService, AuthGuard],
})
export class TransactionModule {}
