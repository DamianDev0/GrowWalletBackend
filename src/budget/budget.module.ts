import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { Budget } from './entities/budget.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/guard/auth.guard';
import { CategoryModule } from '../category/category.module';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Budget, User, Category]),
    CategoryModule,
    UserModule,
  ],
  controllers: [BudgetController],
  providers: [BudgetService, JwtService, AuthGuard],
})
export class BudgetModule {}
