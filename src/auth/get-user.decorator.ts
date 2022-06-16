import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from './user.entity';

export const GetUser = createParamDecorator(
  (_data: never, ctx: ExecutionContext): User => {
    // Grab the request body
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
