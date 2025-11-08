import { PipeTransform, BadRequestException } from '@nestjs/common';
import type { ZodType } from 'zod';
import { ZodError } from 'zod';
import { formatZodErrors } from '../utils/zod-error.util';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new BadRequestException(formatZodErrors(err));
      }
      throw new BadRequestException('Invalid request body');
    }
  }
}
