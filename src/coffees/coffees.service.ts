import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { isUndefined, has } from 'lodash';
import { Coffee, Flavor } from './entities';
import { CreateCoffeeDto, UpdateCoffeeDto } from './dto';
import { PaginationQueryDto } from '../common';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly _repository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly _flavorRepository: Repository<Flavor>,
  ) {}

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit: take, offset: skip } = paginationQuery;
    return this._repository.find({ relations: ['flavors'], skip, take });
  }

  async findOne(id: string) {
    const coffee = await this._repository.findOne(id, {
      relations: ['flavors'],
    });
    if (isUndefined(coffee)) {
      throw new NotFoundException(`Coffee #${id} not found.`);
    }
    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
    );
    const coffee = this._repository.create({ ...createCoffeeDto, flavors });
    return this._repository.save(coffee);
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const flavors =
      has(updateCoffeeDto, 'flavors') &&
      (await Promise.all(
        updateCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
      ));

    const coffee = await this._repository.preload({
      id,
      ...updateCoffeeDto,
      flavors,
    });
    if (isUndefined(coffee)) {
      throw new NotFoundException(`Coffee #${id} not found.`);
    }
    return this._repository.save(coffee);
  }

  async remove(id: string) {
    const coffee = await this.findOne(id);
    return this._repository.remove(coffee);
  }

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this._flavorRepository.findOne({ name });
    if (existingFlavor) {
      return existingFlavor;
    }
    return this._flavorRepository.create({ name });
  }
}
