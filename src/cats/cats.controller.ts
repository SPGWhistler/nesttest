import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';
import { CreateCatDto } from './create-cat.dto';

@Controller('cats')
export class CatsController {
  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    return `created a new cat: ${createCatDto.name}`;
  }

  @Get(':id')
  findAll(@Param() id: string, @Query('q') query: string): string {
    console.log(id);
    return `This action returns all the cats: ${query}`;
  }
}
