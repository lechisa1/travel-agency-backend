import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

interface WrappedData<T> {
  message?: string;
  data?: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: T) => {
        const response = context
          .switchToHttp()
          .getResponse<{ statusCode: number }>();
        const wrapped = data as WrappedData<T>;
        return {
          statusCode: response.statusCode,
          message: wrapped.message || 'Success',
          data: wrapped.data || data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
