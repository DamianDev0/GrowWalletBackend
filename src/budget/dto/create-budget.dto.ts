import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { Currency } from '../../common/enum/currency';
import { Period } from '../../common/enum/period.enum';

export class CreateBudgetDto {
  @IsString()
  name: string;

  @IsNumber()
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(Period)
  period: Period;

  @IsOptional()
  categoryId?: number;
}
