import { Spinner } from "@/components/ui/spinner";

interface ListLoadingProps {
  readonly message?: string;
  readonly className?: string;
}

export function ListLoading({
  message = "Carregando...",
  className = "p-6",
}: ListLoadingProps) {
  return (
    <div className={className}>
      <div className="text-center py-12">
        <Spinner className="h-8 w-8 mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
