import { Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ClassInfoProps {
  readonly professor: string;
}

export function ClassInfo({ professor }: ClassInfoProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horário da Aula
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">Seg/Qua/Sex</p>
          <p className="text-2xl font-bold text-purple-600">08:00 - 09:30</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Professor Responsável
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{professor}</p>
          <p className="text-sm text-muted-foreground mt-2">
            professor@email.com
          </p>
          <p className="text-sm text-muted-foreground">(11) 99999-9999</p>
        </CardContent>
      </Card>
    </div>
  );
}
