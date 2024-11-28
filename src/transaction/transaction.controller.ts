import {
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Get,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { ActiveUserInterface } from '../common/interface/activeUserInterface';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('statistics/:budgetId')
  async getStatistics(
    @Param('budgetId') budgetId: number,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.transactionService.getBudgetStatistics(budgetId, user.id);
  }
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.transactionService.remove(id, user);
  }

  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.transactionService.create(createTransactionDto, user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.transactionService.update(id, updateTransactionDto, user);
  }
}
