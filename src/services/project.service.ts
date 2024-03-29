import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProjectCreateDto } from 'src/dto/project.dto';
import { Project } from 'src/schema/project.schema';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { ProjectHasUser } from 'src/schema/projectHasUser.schema';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel('project')
    private projectModel: Model<Project>,
    @InjectModel('project_has_user')
    private projectHasUserModel: Model<ProjectHasUser>,
  ) {}

  async create(projectCreateDto: {
    userId: Types.ObjectId;
    classId: Types.ObjectId;
    nameTH: string;
    nameEN: string;
    description: string;
    partners: Array<Types.ObjectId>;
    advisors: Array<Types.ObjectId>;
  }): Promise<ResponsePattern> {
    let projectId = null;
    try {
      const {
        userId,
        classId,
        nameTH,
        nameEN,
        description,
        partners,
        advisors,
      } = projectCreateDto;
      const createProject = new this.projectModel(
        {
          classId,
          nameTH,
          nameEN,
          description,
        },
        null,
        { new: true },
      );
      projectId = (await createProject.save())._id;
      const ownerRole = [
        { classId, projectId, userId, role: 0, isAccept: true },
      ];

      // partners
      const partnersRole = partners.map((userId) => ({
        classId,
        projectId,
        userId,
        role: 1,
        isAccept: true,
      }));

      // advisors
      const advisorsRole = advisors.map((userId) => ({
        classId,
        projectId,
        userId,
        role: 2,
      }));

      await this.projectHasUserModel.insertMany([
        ...ownerRole,
        ...partnersRole,
        ...advisorsRole,
      ]);
      return { statusCode: 201, message: 'Create Project Successful' };
    } catch (error) {
      console.log(error);
      if (projectId) {
        this.projectModel.updateOne(
          { _id: projectId },
          { deletedAt: new Date() },
        );
      }
      return { statusCode: 400, message: 'Create Project Error', error };
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

      const data = await this.projectModel.find(filter, null, {
        sort: sortSelect,
      });
      return { statusCode: 200, message: 'List Project Successful', data };
    } catch (error) {
      console.log(error);
      return { statusCode: 400, message: 'List Project Error', error };
    }
  }

  async findOne(filter: any): Promise<ResponsePattern> {
    try {
      const data = await this.projectModel.findOne(filter);
      if (!data) {
        return {
          statusCode: 404,
          message: 'Project Not Found',
        };
      }
      return {
        statusCode: 200,
        message: 'Find Project Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return { statusCode: 400, message: 'Find Project Error', error };
    }
  }

  async update(
    projectUpdateDto: {
      userId: Types.ObjectId;
      classId: Types.ObjectId;
      nameTH: string;
      nameEN: string;
      description: string;
      partners: Array<Types.ObjectId>;
      advisors: Array<Types.ObjectId>;
    },
    projectId: Types.ObjectId,
  ): Promise<ResponsePattern> {
    try {
      const { classId, nameTH, nameEN, description, partners, advisors } =
        projectUpdateDto;

      // partners
      const partnersRole = partners.map((userId) => ({
        classId,
        projectId,
        userId,
        role: 1,
        isAccept: true,
      }));

      await this.projectModel.updateOne(
        {
          _id: projectId,
          deletedAt: null,
        },
        { nameTH, nameEN, description },
      );

      // insert new partners
      await this.projectHasUserModel.insertMany(partnersRole);

      // delete advisor
      await this.projectHasUserModel.updateMany(
        {
          projectId,
          classId,
          userId: { $nin: advisors },
          role: 2,
          deletedAt: null,
        },
        { deletedAt: new Date() },
        { timestamps: false },
      );

      const currentAdvisor = await this.projectHasUserModel.find({
        projectId,
        classId,
        role: 2,
        deletedAt: null,
      });

      console.log(advisors);

      const newAdvisor = advisors.filter(
        (id) =>
          !currentAdvisor.find(
            (user) => id.toString() === user.userId.toString(),
          ),
      );

      // advisors
      if (newAdvisor.length) {
        const advisorsRole = newAdvisor.map((userId) => ({
          classId,
          projectId,
          userId,
          role: 2,
        }));
        // update new advisor
        await this.projectHasUserModel.insertMany(advisorsRole);
      }

      return { statusCode: 200, message: 'Update Project Successful' };
    } catch (error) {
      console.log(error);
      return { statusCode: 400, message: 'Update Project Error', error };
    }
  }
}
