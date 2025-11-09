import { Filter } from "lucide-react";
import { SearchInput } from "@/components/common/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBJECTS } from "@/constants/subjects";

interface ClassesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
}

export function ClassesFilters({
  searchTerm,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
}: Readonly<ClassesFiltersProps>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Buscar turmas..."
        debounceDelay={300}
      />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filtros</span>
        </div>
        <Select value={selectedSubject} onValueChange={onSubjectChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por disciplina" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as disciplinas</SelectItem>
            {SUBJECTS.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
