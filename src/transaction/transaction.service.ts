import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Budget } from '../budget/entities/budget.entity';
import { Category } from '../category/entities/category.entity';
import { ActiveUserInterface } from '../common/interface/activeUserInterface';
import { format } from 'date-fns';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  private async getBudget(budgetId: number, userId: string): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({
      where: { id: budgetId, user: { id: userId } },
    });
    if (!budget)
      throw new NotFoundException(`Budget with ID ${budgetId} not found`);
    return budget;
  }

  private async getCategory(categoryId: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category)
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    return category;
  }

  private notifyUserIfBudgetLow(userId: string, budget: Budget): void {
    const threshold = 0.1;
    const remaining = budget.amount;
    const total = budget.amount;
    if (remaining / total <= threshold) {
      console.log(
        `User ${userId}: Your budget for ${budget.name} is running low. Only ${remaining} left.`,
      );
    }
  }

  private prepareTransactionResponse(transaction: Transaction) {
    return {
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      budget: {
        id: transaction.budget.id,
        name: transaction.budget.name,
        remainingAmount: transaction.budget.amount,
        currency: transaction.budget.currency,
      },
      category: {
        id: transaction.category.id,
        name: transaction.category.name,
      },
    };
  }

  async create(
    createTransactionDto: CreateTransactionDto,
    user: ActiveUserInterface,
  ) {
    const { budgetId, categoryId, amount, description } = createTransactionDto;
    const budget = await this.getBudget(budgetId, user.id);
    if (budget.amount < amount)
      throw new BadRequestException('Insufficient budget for this transaction');

    if (budget.category.id !== categoryId)
      throw new BadRequestException(
        'Transaction category must match the category of the associated budget',
      );

    this.notifyUserIfBudgetLow(user.id, budget);

    const category = await this.getCategory(categoryId);
    budget.amount -= amount;
    await this.budgetRepository.save(budget);

    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const transaction = this.transactionRepository.create({
      amount,
      description,
      date: currentDate,
      budget,
      category,
      user: { id: user.id },
    });

    const savedTransaction = await this.transactionRepository.save(transaction);
    return {
      code: 201,
      message: 'Transaction created successfully',
      data: this.prepareTransactionResponse(savedTransaction),
    };
  }

  async update(
    id: number,
    updateTransactionDto: Partial<CreateTransactionDto>,
    user: ActiveUserInterface,
  ) {
    const transaction = await this.transactionRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['budget', 'category'],
    });
    if (!transaction)
      throw new NotFoundException(`Transaction with ID ${id} not found`);

    const { amount, categoryId, description } = updateTransactionDto;
    if (amount !== undefined) {
      const budget = transaction.budget;
      const difference = amount - transaction.amount;
      if (budget.amount < difference)
        throw new BadRequestException('Insufficient budget for this update');

      this.notifyUserIfBudgetLow(user.id, budget);
      budget.amount -= difference;
      await this.budgetRepository.save(budget);
      transaction.amount = amount;
    }

    if (categoryId !== undefined) {
      if (transaction.budget.category.id !== categoryId)
        throw new BadRequestException(
          'Transaction category must match the category of the associated budget',
        );
      transaction.category = await this.getCategory(categoryId);
    }

    if (description !== undefined) {
      transaction.description = description;
    }

    const updatedTransaction =
      await this.transactionRepository.save(transaction);
    return {
      code: 200,
      message: 'Transaction updated successfully',
      data: this.prepareTransactionResponse(updatedTransaction),
    };
  }

  async remove(id: number, user: ActiveUserInterface) {
    const transaction = await this.transactionRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['budget'],
    });
    if (!transaction)
      throw new NotFoundException(`Transaction with ID ${id} not found`);

    const restoredAmount = transaction.budget.amount + transaction.amount;
    if (isNaN(restoredAmount))
      throw new BadRequestException(
        'Invalid amount value while restoring budget',
      );

    transaction.budget.amount = restoredAmount;
    this.notifyUserIfBudgetLow(user.id, transaction.budget);
    await this.budgetRepository.save(transaction.budget);
    await this.transactionRepository.remove(transaction);

    return {
      code: 200,
      message: 'Transaction deleted successfully',
    };
  }

  async getBudgetStatistics(budgetId: number, userId: string) {
    const budget = await this.getBudget(budgetId, userId);
    const transactions = await this.transactionRepository.find({
      where: { budget: { id: budgetId } },
    });

    const totalSpent = transactions.reduce(
      (total, transaction) => total + parseFloat(transaction.amount.toString()),
      0,
    );

    const remainingAmount = budget.amount - totalSpent;

    const usedPercentage = Math.min(
      100,
      Math.max(0, (totalSpent / budget.amount) * 100),
    );
    const remainingPercentage = Math.min(
      100,
      Math.max(0, (remainingAmount / budget.amount) * 100),
    );

    return {
      budgetAmount: budget.amount,
      totalSpent: totalSpent,
      remainingAmount: remainingAmount,
      usedPercentage: Number(usedPercentage.toFixed(2)),
      remainingPercentage: Number(remainingPercentage.toFixed(2)),
    };
  }
}
