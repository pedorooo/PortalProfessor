import { getStatusStyle, getStatusLabel } from "@/lib/utils/status";

interface StatusBadgeProps {
  readonly status: string;
  readonly className?: string;
}

/**
 * Reusable status badge component
 */
export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(
        status
      )} ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
