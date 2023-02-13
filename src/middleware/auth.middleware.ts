import { Injectable, NestMiddleware, Req, Res } from '@nestjs/common';
import { NextFunction } from 'express';
import { adminFirebase } from 'src/database/db.firebase';
import { UserService } from 'src/services/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(@Req() request, @Res() response, next: NextFunction) {
    const token = request.headers.authorization;

    if (!token) {
      return response
        .status(401)
        .send({ statusCode: 401, message: 'Unauthorized' });
    }

    try {
      const decoded = await adminFirebase.auth().verifyIdToken(token);

      const { email } = decoded;
      const userData = await this.userService.findOne({
        email,
        deletedAt: null,
      });
      const currentTime = new Date().getTime() / 1000;
      if (currentTime > decoded.exp)
        return response
          .status(401)
          .send({ statusCode: 401, message: 'Unauthorized' });

      request.user = userData.data ? userData.data : decoded;

      next();
    } catch (error) {
      return response
        .status(401)
        .send({ statusCode: 401, message: 'Unauthorized' });
    }
  }
}