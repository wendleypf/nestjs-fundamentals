import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';
import { Coffee } from './entities';
import { CreateCoffeeDto, UpdateCoffeeDto } from './dto';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee) private readonly _repository: Repository<Coffee>,
  ) {}

  findAll() {
    return this._repository.find();
  }

  async findOne(id: string) {
    const coffee = await this._repository.findOne({ id });
    if (_.isUndefined(coffee)) {
      throw new NotFoundException(`Coffee #${id} not found.`);
    }
    return coffee;
  }

  create(createCoffeeDto: CreateCoffeeDto) {
    const coffee = this._repository.create(createCoffeeDto);
    return this._repository.save(coffee);
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const coffee = await this._repository.preload({ id, ...updateCoffeeDto });
    if (_.isUndefined(coffee)) {
      throw new NotFoundException(`Coffee #${id} not found.`);
    }
    return this._repository.save(coffee);
  }

  async remove(id: string) {
    const coffee = await this.findOne(id);
    return this._repository.remove(coffee);
  }
}
