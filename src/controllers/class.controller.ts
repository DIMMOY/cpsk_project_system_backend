import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClassCreateDto, ClassUpdateDto } from 'src/dto/class.dto';
import { ClassService } from 'src/services/class.service';

@Controller('class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get()
  @HttpCode(200)
  async listClass(
    @Query('sort') sort: string,
    @Query('select') select: string,
    @Query('major') major: string,
  ) {
    return await this.classService.listClass(sort, select, major);
  }

  @Post()
  @HttpCode(201)
  async createClass(@Body() body: ClassCreateDto) {
    return await this.classService.createClass(body);
  }

  @Put(':id')
  @HttpCode(200)
  async updateClass(@Param('id') id: string, @Body() body: ClassUpdateDto) {
    return await this.classService.updateClass(id, body);
  }

  @Delete(':id')
  @HttpCode(200)
  async deleteClass(@Param('id') id: string) {
    return await this.classService.deleteClass(id);
  }
}
