import { Injectable, NestMiddleware, Req, Res } from '@nestjs/common';
import { NextFunction } from 'express';
import { adminFirebase } from 'src/database/db.firebase';
import { UserService } from 'src/services/user.service';
import { UserHasRoleService } from 'src/services/userHasRole.service';

@Injectable()
export class IsAdminOrAdvisorMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UserService,
    private readonly userHasRoleService: UserHasRoleService,
  ) {}

  async use(@Req() request, @Res() response, next: NextFunction) {
    const token = request.headers.authorization;

    if (!token) {
      return response
        .status(401)
        .send({ statusCode: 401, message: 'Unauthorized' });
    }

    try {
      const decoded = await adminFirebase.auth().verifyIdToken(token);
      const currentTime = new Date().getTime() / 1000;
      if (currentTime > decoded.exp)
        return response
          .status(401)
          .send({ statusCode: 401, message: 'Unauthorized' });

      const { email } = decoded;
      const userData = await this.userService.findOne({
        email,
        deletedAt: null,
      });
      if (userData.statusCode !== 200)
        return response.status(userData.statusCode).send(userData);

      // Is Admin Or Advisor
      const userHasRoleData = await this.userHasRoleService.find({
        userId: userData.data._id,
        role: { $in: [1, 2] },
        deletedAt: null,
      });
      if (userHasRoleData.statusCode !== 200)
        return response.status(userData.statusCode).send(userHasRoleData);
      if (!userHasRoleData.data.length)
        return response
          .status(403)
          .send({ statusCode: 403, message: 'Permission Denied' });

      request.user = userData.data;

      next();
    } catch (error) {
      return response
        .status(401)
        .send({ statusCode: 401, message: 'Unauthorized' });
    }
  }
}
