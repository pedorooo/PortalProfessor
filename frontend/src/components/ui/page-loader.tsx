import { Spinner } from "@/components/ui/spinner";

interface PageLoaderProps {
  readonly message?: string;
}

export function PageLoader({ message = "Carregando..." }: PageLoaderProps) {
  return (
    <div className="p-6">
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Spinner className="h-8 w-8" />
        <p className="text-lg text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
