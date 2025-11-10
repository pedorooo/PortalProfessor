
export type StatusType =
  | "OPEN"
  | "CLOSED"
  | "em andamento"
  | "concluída"
  | "pendente";

interface StatusStyle {
  bg: string;
  text: string;
}

export function getStatusStyle(status: string): string {
  const statusMap: Record<string, StatusStyle> = {
    "em andamento": { bg: "bg-blue-100", text: "text-blue-800" },
    concluída: { bg: "bg-green-100", text: "text-green-800" },
    pendente: { bg: "bg-yellow-100", text: "text-yellow-800" },
    open: { bg: "bg-blue-100", text: "text-blue-800" },
    closed: { bg: "bg-green-100", text: "text-green-800" },
  };

  const style = statusMap[status.toLowerCase()] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
  };

  return `${style.bg} ${style.text}`;
}

export function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    OPEN: "em andamento",
    CLOSED: "concluída",
    open: "em andamento",
    closed: "concluída",
  };

  return labelMap[status] || status.toLowerCase();
}
