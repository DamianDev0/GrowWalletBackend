/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { addDays } from 'date-fns';
import { ActiveUserInterface } from '../common/interface/activeUserInterface';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  private async saveUpdatedBudget(
    budget: Budget,
    updatedData: Partial<Budget>,
    user: ActiveUserInterface,
  ) {
    Object.assign(budget, updatedData);
    return this.budgetRepository.save(budget);
  }

  private async findCategoryById(categoryId: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  private async findBudgetById(id: number, userId: string): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }
    return budget;
  }

  async create(createBudgetDto: CreateBudgetDto, user: ActiveUserInterface) {
    const { categoryId, currency, amount, ...budgetData } = createBudgetDto;
    const category = await this.findCategoryById(categoryId);
    const startDate = new Date();
    const endDate = addDays(startDate, 30);

    const newBudget = this.budgetRepository.create({
      ...budgetData,
      amount,
      currency,
      startDate,
      endDate,
      user: { id: user.id },
      category,
    });

    return this.budgetRepository.save(newBudget);
  }

  async update(
    id: number,
    updateBudgetDto: UpdateBudgetDto,
    user: ActiveUserInterface,
  ) {
    const budget = await this.findBudgetById(id, user.id);
    const updatedCategory = updateBudgetDto.categoryId
      ? await this.findCategoryById(updateBudgetDto.categoryId)
      : budget.category;
    const fullUser = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (!fullUser) {
      throw new NotFoundException(`User with ID ${user.id} not found`);
    }

    const updatedBudgetData = {
      ...updateBudgetDto,
      category: updatedCategory,
      user: fullUser,
    };

    return this.saveUpdatedBudget(budget, updatedBudgetData, user);
  }

  async remove(id: number, user: ActiveUserInterface) {
    const budget = await this.findBudgetById(id, user.id);
    return this.budgetRepository.remove(budget);
  }
}
