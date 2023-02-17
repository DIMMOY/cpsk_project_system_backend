import { Injectable, NestMiddleware, Req, Res } from '@nestjs/common';
import { NextFunction } from 'express';
import { adminFirebase } from 'src/database/db.firebase';
import { UserService } from 'src/services/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

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

      request.user = userData.data ? userData.data : decoded;

      next();
    } catch (error) {
      return response
        .status(401)
        .send({ statusCode: 401, message: 'Unauthorized' });
    }
  }
}
