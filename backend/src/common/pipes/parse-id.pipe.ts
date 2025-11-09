import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIdPipe implements PipeTransform {
  constructor(private readonly fieldName = 'id') {}

  transform(value: string | undefined): number | undefined {
    if (value === undefined || value === null) return undefined;

    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed) || parsed < 1) {
      throw new BadRequestException(
        `${this.fieldName} must be a positive number`,
      );
    }

    return parsed;
  }
}
