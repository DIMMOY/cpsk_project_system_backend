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
import {
  MeetingScheduleCreateDto,
  MeetingScheduleUpdateDto,
} from 'src/dto/meetingSchedule.dto';
import { MeetingScheduleService } from 'src/services/meetingSchedule.service';

@Controller('meeting-schedule')
export class MeetingScheduleController {
  constructor(
    private readonly meetingScheduleService: MeetingScheduleService,
  ) {}

  @Get()
  @HttpCode(200)
  async listDocument(@Query('sort') sort: string) {
    return await this.meetingScheduleService.listMeetingSchedule(sort);
  }

  @Post()
  @HttpCode(201)
  async createDocument(@Body() body: MeetingScheduleCreateDto) {
    return await this.meetingScheduleService.createMeetingSchedule(body);
  }

  @Put(':id')
  @HttpCode(200)
  async updateDocument(
    @Param('id') id: string,
    @Body() body: MeetingScheduleUpdateDto,
  ) {
    return await this.meetingScheduleService.updateMeetingSchedule(id, body);
  }

  @Delete(':id')
  @HttpCode(200)
  async deleteDocument(@Param('id') id: string) {
    return await this.meetingScheduleService.deleteMeetingSchedule(id);
  }
}
