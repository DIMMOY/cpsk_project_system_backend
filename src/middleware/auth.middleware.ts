import { Injectable, NestMiddleware, Req, Res } from '@nestjs/common';
import { NextFunction } from 'express';
import { adminFirebase } from 'src/database/db.firebase';
import { UserService } from 'src/services/user.service';
import { UserHasRoleService } from 'src/services/userHasRole.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UserService,
    private readonly userHasRoleService: UserHasRoleService,
  ) {}

  async use(@Req() request, @Res() response, next: NextFunction) {
    let token = request.headers.authorization;

    if (!token) {
      return response
        .status(401)
        .send({ statusCode: 401, message: 'Unauthorized' });
    }

    token = token.replace('Bearer ', '');

    try {
      const decoded = await adminFirebase.auth().verifyIdToken(token);

      const { email } = decoded;
      const userData = await this.userService.findOne({
        email,
        deletedAt: null,
      });
      if (userData.statusCode !== 200)
        return response.status(userData.statusCode).send(userData);

      // find All Role
      const userHasRoleData = await this.userHasRoleService.list({
        userId: userData.data._id,
        deletedAt: null,
      });

      request.user = userData.data ? userData.data : decoded;
      request.role = userHasRoleData.data.map((e) => e.role);

      next();
    } catch (error) {
      return response
        .status(401)
        .send({ statusCode: 401, message: 'Unauthorized' });
    }
  }
}
