import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentUpdateDto } from 'src/dto/document.dto';
import {
  ProjectSendDocumentCreateDto,
  ProjectSendDocumentDeleteDto,
} from 'src/dto/projectSendDocument.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { ClassHasDocument } from 'src/schema/classHasDocument.schema';
import { Project } from 'src/schema/project.schema';
import { ProjectSendDocument } from 'src/schema/projectSendDocument.schema';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

@Injectable()
export class ProjectSendDocumentService {
  constructor(
    @InjectModel('project_send_document')
    private projectSendDocumentModel: Model<ProjectSendDocument>,
    @InjectModel('project')
    private projectModel: Model<Project>,
    @InjectModel('class_has_document')
    private classHasDocumentModel: Model<ClassHasDocument>,
  ) {}

  async createOrUpdate(
    body: ProjectSendDocumentCreateDto,
  ): Promise<ResponsePattern> {
    try {
      const { projectId, documentId, pathDocument } = body;
      const mProjectId = toMongoObjectId({
        value: projectId,
        key: 'projectId',
      });
      const mDocumentId = toMongoObjectId({
        value: documentId,
        key: 'documentId',
      });

      // ===== check 404 =====
      const project = await this.projectModel
        .findOne({
          _id: mProjectId,
          deletedAt: null,
        })
        .populate('classId');
      if (!project)
        return {
          statusCode: 404,
          message: 'Project Not Found',
        };
      const mClassId = project.classId._id;
      const documentInClass = await this.classHasDocumentModel.findOne({
        documentId: mDocumentId,
        classId: mClassId,
        deletedAt: null,
        status: true,
        startDate: { $lte: new Date() },
      });
      if (!documentInClass)
        return {
          statusCode: 404,
          message: 'Document Not Found',
        };
      // =====================

      await this.projectSendDocumentModel.updateOne(
        {
          projectId: mProjectId,
          classHasDocumentId: documentInClass._id,
        },
        {
          projectId: mProjectId,
          classHasDocumentId: documentInClass._id,
          pathDocument,
          deletedAt: null,
        },
        { upsert: true },
      );
      return {
        statusCode: 201,
        message: 'Create Or Update ProjectSendDocument Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Create Or Update ProjectSendDocument Error',
        error,
      };
    }
  }

  async findOne(filter: any): Promise<ResponsePattern> {
    try {
      const data = await this.projectSendDocumentModel
        .findOne(filter)
        .populate('classHasDocumentId')
        .populate('projectId');
      return {
        statusCode: 200,
        message: 'Find ProjectSendDocument Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'Find ProjectSendDocument Error',
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
        .populate('classHasDocumentId');
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

  async delete(body: ProjectSendDocumentDeleteDto): Promise<ResponsePattern> {
    try {
      const { projectId, documentId } = body;
      const mProjectId = toMongoObjectId({
        value: projectId,
        key: 'projectId',
      });
      const mDocumentId = toMongoObjectId({
        value: documentId,
        key: 'documentId',
      });

      // ===== check 404 =====
      const project = await this.projectModel
        .findOne({
          _id: mProjectId,
          deletedAt: null,
        })
        .populate('classId');
      if (!project)
        return {
          statusCode: 404,
          message: 'Project Not Found',
        };
      const mClassId = project.classId._id;
      const documentInClass = await this.classHasDocumentModel.findOne({
        documentId: mDocumentId,
        classId: mClassId,
        deletedAt: null,
      });
      if (!documentInClass)
        return {
          statusCode: 404,
          message: 'Document Not Found',
        };
      // =====================

      await this.projectSendDocumentModel.updateOne(
        {
          projectId: mProjectId,
          classHasDocumentId: documentInClass._id,
          deletedAt: null,
        },
        { deletedAt: new Date() },
        {
          timestamps: false,
        },
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
