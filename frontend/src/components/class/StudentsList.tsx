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
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-semibold">{student.name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {student.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {student.phone}
                  </div>
                </div>
              </div>

              <div className="flex gap-8 text-right">
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
