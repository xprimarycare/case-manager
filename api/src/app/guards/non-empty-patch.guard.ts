import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class NonEmptyPatchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only check PATCH requests
    if (method === 'PATCH') {
      const body = request.body;
      if (!body || Object.keys(body).length === 0) {
        throw new BadRequestException('PATCH body cannot be empty');
      }
    }

    return true;
  }
}
