import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { DocumentCreateDto, DocumentUpdateDto } from 'src/dto/document.dto';
import { DocumentService } from 'src/services/document.service';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  @HttpCode(200)
  async listDocument() {
    return await this.documentService.listDocument();
  }

  @Post()
  @HttpCode(201)
  async createDocument(@Body() body: DocumentCreateDto) {
    return await this.documentService.createDocument(body);
  }

  @Put(':id')
  @HttpCode(200)
  async updateDocument(
    @Param('id') id: string,
    @Body() body: DocumentUpdateDto,
  ) {
    return await this.documentService.updateDocument(id, body);
  }

  @Delete(':id')
  @HttpCode(200)
  async deleteDocument(@Param('id') id: string) {
    return await this.documentService.deleteDocument(id);
  }
}
