import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Format an array of objects containing date fields to Brazilian Portuguese format
 * @param data Array of objects containing date fields
 * @param formatStr Optional custom date format string
 * @returns Array with formatted dates
 */
export function formatDateFields<T>(
  data: T[],
  formatStr: string = "dd 'de' MMMM 'de' yyyy"
): T[] {
  return data.map((item) => ({
    ...item,
    dueDate:
      typeof (item as any).dueDate === "string"
        ? format(new Date((item as any).dueDate), formatStr, { locale: ptBR })
        : "Data não definida",
  })) as T[];
}
