import { Injectable, NotFoundException } from '@nestjs/common';
import * as _ from 'lodash';
import { Coffee } from './entities';
import { CreateCoffeeDto, UpdateCoffeeDto } from './dto';

@Injectable()
export class CoffeesService {
  private coffees: Coffee[] = [
    {
      id: '1819104a-93e9-4c45-b70d-8ad246decb24',
      name: 'Shipwreck Roast',
      brand: 'Buddy Brew',
      flavors: ['chocolate', 'vanilla'],
    },
  ];

  findAll() {
    return this.coffees;
  }

  findOne(id: string) {
    const coffee = _.find(this.coffees, { id });
    if (_.isUndefined(coffee)) {
      throw new NotFoundException(`Coffee #${id} not found.`);
    }
    return coffee;
  }

  create(createCoffeeDto: CreateCoffeeDto) {
    this.coffees.push(createCoffeeDto);
    return createCoffeeDto;
  }

  update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const existingCoffee = this.findOne(id);
    if (existingCoffee) {
      // update the existing entity
    }
  }

  remove(id: string) {
    const coffeeIndex = _.findIndex(this.coffees, { id });
    if (coffeeIndex >= 0) {
      this.coffees.splice(coffeeIndex, 1);
    }
  }
}
