import { Injectable } from '@nestjs/common';
import { CoffeesService } from '../coffees';

@Injectable()
export class CoffeeRatingService {
  constructor(private readonly coffeeService: CoffeesService) {}
}
