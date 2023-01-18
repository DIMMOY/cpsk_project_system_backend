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
    private documentModel: Model<Document>,
  ) {}

  async create(body: DocumentCreateDto): Promise<ResponsePattern> {
    try {
      const createDocument = new this.documentModel(body);
      await createDocument.save();
      return { statusCode: 201, message: 'Create Document Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Create Document Error', error };
    }
  }

  async list(sort: string | null, filter: any): Promise<ResponsePattern> {
    try {
      const typeSort = {
        createdAtASC: { createdAt: 1 },
        createdAtDESC: { createdAt: -1 },
        name: { name: 1 },
      };

      const sortSelect =
        sort && typeSort[sort] ? typeSort[sort] : { createdAt: -1 };

      const data = await this.documentModel.find(filter, null, {
        sort: sortSelect,
      });
      return { statusCode: 200, message: 'List Document Successful', data };
    } catch (error) {
      console.log(error);
      return { statusCode: 400, message: 'List Document Error', error };
    }
  }

  async update(_id: string, body: DocumentUpdateDto): Promise<ResponsePattern> {
    try {
      await this.documentModel.updateOne({ _id }, body, {
        runValidators: true,
      });
      return { statusCode: 200, message: 'Update Document Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Update Document Error', error };
    }
  }

  async delete(_id: string): Promise<ResponsePattern> {
    try {
      await this.documentModel.updateOne(
        { _id },
        { deletedAt: new Date() },
        { runValidators: true },
      );
      return { statusCode: 200, message: 'Delete Document Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Delete Document Error', error };
    }
  }
}
