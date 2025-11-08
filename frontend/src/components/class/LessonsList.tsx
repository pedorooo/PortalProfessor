import { Card, CardContent } from "@/components/ui/card";
import type { ClassLesson } from "@/hooks/use-class-lessons";

interface LessonsListProps {
  readonly lessons: ClassLesson[];
  readonly isLoading?: boolean;
}

export function LessonsList({ lessons, isLoading = false }: LessonsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Carregando aulas...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (lessons.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nenhuma aula encontrada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {lessons.map((lesson) => {
            let statusClass = "bg-green-100 text-green-800";
            if (lesson.status === "Em Progresso") {
              statusClass = "bg-blue-100 text-blue-800";
            } else if (lesson.status === "Programada") {
              statusClass = "bg-gray-100 text-gray-800";
            }

            return (
              <div
                key={lesson.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-semibold">{lesson.topic}</p>
                  <p className="text-sm text-muted-foreground">{lesson.date}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}
                >
                  {lesson.status}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
