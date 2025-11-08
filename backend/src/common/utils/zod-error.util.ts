import { ZodError } from 'zod';

/**
 * Format Zod validation errors into a readable, user-friendly message
 * @param error ZodError instance
 * @returns Formatted error message string
 *
 * @example
 * try {
 *   const data = UserSchema.parse(input);
 * } catch (err) {
 *   if (err instanceof ZodError) {
 *     throw new BadRequestException(formatZodErrors(err));
 *   }
 * }
 */
export function formatZodErrors(error: ZodError): string {
  const issues = error.issues.map((issue) => {
    const path =
      issue.path.length > 0 ? ` (field: ${issue.path.join('.')})` : '';
    return `${issue.message}${path}`;
  });
  return issues.join('; ');
}

/**
 * Create a validation error response object
 * @param error ZodError instance
 * @returns Formatted error response with field-level details
 *
 * @example
 * const errorResponse = getZodErrorResponse(err);
 * // Returns: { message: "...", fields: { name: "Name must not be empty", ... } }
 */
export function getZodErrorResponse(error: ZodError): {
  message: string;
  fields: Record<string, string>;
} {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const fieldPath = issue.path.join('.');
    const key = fieldPath || 'root';
    fields[key] = issue.message;
  }

  return {
    message: formatZodErrors(error),
    fields,
  };
}
