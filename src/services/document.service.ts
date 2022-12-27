import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentCreateDto, DocumentUpdateDto } from 'src/dto/document.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { Document } from 'src/schema/document.schema';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel('document')
    private DocumentModel: Model<Document>,
  ) {}

  async createDocument(body: DocumentCreateDto): Promise<ResponsePattern> {
    try {
      const createDocument = new this.DocumentModel(body);
      await createDocument.save();
      return { statusCode: 201, message: 'Create Class Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Create Class Error', error };
    }
  }

  async listDocument(): Promise<ResponsePattern> {
    try {
      const data = [];
      return { statusCode: 200, message: 'List Class Successful', data };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'List Class Error', error };
    }
  }

  async updateDocument(
    _id: string,
    body: DocumentUpdateDto,
  ): Promise<ResponsePattern> {
    try {
      await this.DocumentModel.updateOne({ _id }, body, {
        runValidators: true,
      });
      return { statusCode: 200, message: 'Update Class Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Update Class Error', error };
    }
  }

  async deleteDocument(_id: string): Promise<ResponsePattern> {
    try {
      await this.DocumentModel.updateOne(
        { _id },
        { deletedAt: new Date() },
        { runValidators: true },
      );
      return { statusCode: 200, message: 'Delete Class Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Delete Class Error', error };
    }
  }
}
