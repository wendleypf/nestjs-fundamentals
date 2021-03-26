import { Injectable, NotFoundException } from '@nestjs/common';
import * as _ from 'lodash';
import { Coffee } from './entities';
import { CreateCoffeeDto, UpdateCoffeeDto } from './dto';

@Injectable()
export class CoffeesService {
  private coffees: Coffee[] = [
    {
      id: 1,
      name: 'Shipwreck Roast',
      brand: 'Buddy Brew',
      flavors: ['chocolate', 'vanilla'],
    },
  ];

  findAll() {
    return this.coffees;
  }

  findOne(id: number) {
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

  update(id: number, updateCoffeeDto: UpdateCoffeeDto) {
    const existingCoffee = this.findOne(id);
    if (existingCoffee) {
      // update the existing entity
    }
  }

  remove(id: number) {
    const coffeeIndex = _.findIndex(this.coffees, { id: +id });
    if (coffeeIndex >= 0) {
      this.coffees.splice(coffeeIndex, 1);
    }
  }
}
