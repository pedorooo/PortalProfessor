import { ClassCard } from "./class-card";
import type { Class } from "@/types";

interface ClassesGridProps {
  classes: Class[];
  onEdit: (classData: Class) => void;
  onDelete: (classData: Class) => void;
  onClassClick: (classId: number) => void;
}

export function ClassesGrid({
  classes,
  onEdit,
  onDelete,
  onClassClick,
}: Readonly<ClassesGridProps>) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {classes.map((classData) => (
        <ClassCard
          key={classData.id}
          classData={classData}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={() => onClassClick(classData.id)}
        />
      ))}
    </div>
  );
}
