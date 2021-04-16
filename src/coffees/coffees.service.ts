import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { has, isUndefined } from 'lodash';
import { Coffee, Flavor } from './entities';
import { CreateCoffeeDto, UpdateCoffeeDto } from './dto';
import { COFFEE_BRANDS } from './coffees.constants';
import { PaginationQueryDto } from '../common';
import { Event } from '../events';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly _repository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly _flavorRepository: Repository<Flavor>,
    private readonly _connection: Connection,
    @Inject(COFFEE_BRANDS) private readonly _coffeeBrands: string[],
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

  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this._connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      coffee.recommendations++;
      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this._flavorRepository.findOne({ name });
    if (existingFlavor) {
      return existingFlavor;
    }
    return this._flavorRepository.create({ name });
  }
}
