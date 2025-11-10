import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useClasses } from "@/hooks/use-classes";
import { useClassStudents } from "@/hooks/use-class-students";

export default function ClassEnrolledStudentsPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const { classes } = useClasses();
  const { students: mockStudents } = useClassStudents(classId || "");

  const classIdNumber = classId ? Number.parseInt(classId, 10) : undefined;
  const classData = classIdNumber
    ? classes.find((cls) => cls.id === classIdNumber)
    : undefined;

  if (!classData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Turma não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(`/dashboard/classes/${classId}`)}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Detalhes
        </Button>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Alunos Matriculados</h1>
          <p className="text-muted-foreground">{classData.name}</p>
        </div>
      </div>

      {}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Lista de Alunos</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStudents.map((student) => (
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
                    {student.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {student.phone}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-8 text-right">
                  {/* <div>
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
                  <div>
                    <p className="text-xs text-muted-foreground">Desempenho</p>
                    <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${student.performance}%` }}
                      />
                    </div>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
