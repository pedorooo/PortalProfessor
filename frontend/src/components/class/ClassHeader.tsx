import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SUBJECT_COLORS } from "@/constants/subjects";

interface ClassHeaderProps {
  readonly name: string;
  readonly subject?: string;
  readonly professor: string;
  readonly description: string;
}

export function ClassHeader({
  name,
  subject,
  professor,
  description,
}: ClassHeaderProps) {
  const navigate = useNavigate();

  const colors =
    (subject && SUBJECT_COLORS[subject]) || SUBJECT_COLORS.Matemática;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/classes")}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Turmas
        </Button>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{name}</h1>
            {subject && (
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${colors.badge}`}
              >
                {subject}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-lg">{description}</p>
          <p className="text-sm text-muted-foreground">Prof. {professor}</p>
        </div>
      </div>
    </div>
  );
}
