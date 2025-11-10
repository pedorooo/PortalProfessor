import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
