import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { ActiveUserInterface } from '../common/interface/activeUserInterface';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('budget')
@UseGuards(AuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  async create(
    @Body() createBudgetDto: CreateBudgetDto,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.budgetService.create(createBudgetDto, user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.budgetService.update(id, updateBudgetDto, user);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.budgetService.remove(id, user);
  }
}
