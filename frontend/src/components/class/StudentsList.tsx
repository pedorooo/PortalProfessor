import { Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ClassStudent } from "@/hooks/use-class-students";

interface StudentsListProps {
  readonly students: ClassStudent[];
  readonly isLoading?: boolean;
}

export function StudentsList({
  students,
  isLoading = false,
}: StudentsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Carregando alunos...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nenhum aluno encontrado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex flex-col sm:flex-row items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4"
            >
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <p className="font-semibold truncate">{student.name}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 min-w-0">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-1 min-w-0">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{student.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-8 text-right flex-shrink-0">
                <div>
                  <p className="text-xs text-muted-foreground">Média</p>
                  <p className="text-lg font-bold text-orange-500">
                    {student.grade}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Frequência</p>
                  <p className="text-lg font-bold text-green-600">
                    {student.attendance}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
