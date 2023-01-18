import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClassHasDocumentCreateDto } from 'src/dto/classHasDocument.dto';
import { DocumentCreateDto, DocumentUpdateDto } from 'src/dto/document.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { ClassHasDocument } from 'src/schema/classHasDocument.schema';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

@Injectable()
export class ClassHasDocumentService {
  constructor(
    @InjectModel('class_has_document')
    private classHasDocumentModel: Model<ClassHasDocument>,
  ) {}

  async createOrUpdateClassHasDocument(
    body: ClassHasDocumentCreateDto,
  ): Promise<ResponsePattern> {
    try {
      const { classId, documentId } = body;
      await this.classHasDocumentModel.findOneAndUpdate(
        {
          classId,
          documentId,
          deletedAt: null,
        },
        body,
        { upsert: true },
      );
      return { statusCode: 201, message: 'Create ClassHasDocument Successful' };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Create ClassHasDocument Error',
        error,
      };
    }
  }

  async listClassHasDocument(
    sort: string | null,
    filter: any,
  ): Promise<ResponsePattern> {
    try {
      const typeSort = {
        createdAtASC: { createdAt: 1 },
        createdAtDESC: { createdAt: -1 },
        name: { name: 1 },
      };

      const sortSelect =
        sort && typeSort[sort] ? typeSort[sort] : { createdAt: -1 };

      const data = await this.classHasDocumentModel
        .find(filter, null, {
          sort: sortSelect,
        })
        .populate('documentId');
      return {
        statusCode: 200,
        message: 'List ClassHasDocument Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return { statusCode: 400, message: 'List ClassHasDocument Error', error };
    }
  }

  async updateClassHasDocument(
    _id: string,
    body: DocumentUpdateDto,
  ): Promise<ResponsePattern> {
    try {
      await this.classHasDocumentModel.updateOne({ _id }, body, {
        runValidators: true,
      });
      return { statusCode: 200, message: 'Update ClassHasDocument Successful' };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Update ClassHasDocument Error',
        error,
      };
    }
  }

  async deleteClassHasDocument(_id: string): Promise<ResponsePattern> {
    try {
      await this.classHasDocumentModel.updateOne(
        { _id },
        { deletedAt: new Date() },
        { runValidators: true },
      );
      return { statusCode: 200, message: 'Delete ClassHasDocument Successful' };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Delete ClassHasDocument Error',
        error,
      };
    }
  }
}
