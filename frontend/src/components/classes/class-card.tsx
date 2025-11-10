import { Edit2, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUBJECT_COLORS } from "@/constants/subjects";
import type { Class } from "@/types";

interface ClassCardProps {
  classData: Class;
  onEdit: (classData: Class) => void;
  onDelete: (classData: Class) => void;
  onClick: () => void;
}

export function ClassCard({
  classData,
  onEdit,
  onDelete,
  onClick,
}: Readonly<ClassCardProps>) {
  const colors = classData.subject
    ? SUBJECT_COLORS[classData.subject] || SUBJECT_COLORS.Matemática
    : SUBJECT_COLORS.Matemática;

  const enrollmentPercentage =
    (classData.studentCount / classData.maxCapacity) * 100;

  return (
    <Card
      key={classData.id}
      className="hover:shadow-lg transition-shadow bg-white flex flex-col cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {classData.subject && (
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${colors.badge}`}
                  >
                    {classData.subject}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold">{classData.name}</h3>
              <p className={`text-sm font-medium`}>
                Prof. {classData.professor}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Class actions"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(classData);
                }}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(classData);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {classData.description && (
          <p className="text-sm text-muted-foreground">
            {classData.description}
          </p>
        )}
      </CardContent>

      <div className="px-6 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Matrícula de Alunos
          </span>
          <span className="text-sm font-semibold">
            {classData.studentCount}/{classData.maxCapacity}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full transition-all rounded-full bg-purple-700`}
            style={{
              width: `${enrollmentPercentage}%`,
            }}
          />
        </div>
      </div>
    </Card>
  );
}
