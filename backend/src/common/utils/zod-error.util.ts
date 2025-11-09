import { ZodError } from 'zod';

export function formatZodErrors(error: ZodError): string {
  const issues = error.issues.map((issue) => {
    const path =
      issue.path.length > 0 ? ` (field: ${issue.path.join('.')})` : '';
    return `${issue.message}${path}`;
  });
  return issues.join('; ');
}

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
