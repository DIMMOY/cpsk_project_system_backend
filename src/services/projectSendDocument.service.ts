import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentUpdateDto } from 'src/dto/document.dto';
import { ProjectSendDocumentCreateDto } from 'src/dto/projectSendDocument.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { ProjectSendDocument } from 'src/schema/projectSendDocument.schema';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

@Injectable()
export class ProjectSendDocumentService {
  constructor(
    @InjectModel('project_send_document')
    private projectSendDocumentModel: Model<ProjectSendDocument>,
  ) {}

  async createOrUpdate(
    body: ProjectSendDocumentCreateDto,
  ): Promise<ResponsePattern> {
    try {
      const { projectId, documentId } = body;
      await this.projectSendDocumentModel.findOneAndUpdate(
        {
          projectId,
          documentId,
          deletedAt: null,
        },
        body,
        { upsert: true },
      );
      return {
        statusCode: 201,
        message: 'Create ProjectSendDocument Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Create ProjectSendDocument Error',
        error,
      };
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

      const data = await this.projectSendDocumentModel
        .find(filter, null, {
          sort: sortSelect,
        })
        .populate('documentId');
      return {
        statusCode: 200,
        message: 'List ProjectSendDocument Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'List ProjectSendDocument Error',
        error,
      };
    }
  }

  async update(_id: string, body: DocumentUpdateDto): Promise<ResponsePattern> {
    try {
      await this.projectSendDocumentModel.updateOne({ _id }, body, {
        runValidators: true,
      });
      return {
        statusCode: 200,
        message: 'Update ProjectSendDocument Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Update ProjectSendDocument Error',
        error,
      };
    }
  }

  async delete(_id: string): Promise<ResponsePattern> {
    try {
      await this.projectSendDocumentModel.updateOne(
        { _id },
        { deletedAt: new Date() },
        { runValidators: true },
      );
      return {
        statusCode: 200,
        message: 'Delete ProjectSendDocument Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Delete ProjectSendDocument Error',
        error,
      };
    }
  }
}
