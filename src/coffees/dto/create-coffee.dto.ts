import { IsString, IsUUID } from 'class-validator';

export class CreateCoffeeDto {
  @IsUUID()
  id: string;
  @IsString()
  readonly name: string;
  @IsString()
  readonly brand: string;
  @IsString({ each: true })
  readonly flavors: string[];
}
