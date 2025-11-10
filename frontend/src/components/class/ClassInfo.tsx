import { Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ClassSchedule } from "@/types";

interface ClassInfoProps {
  readonly professor: string;
  readonly schedule?: ClassSchedule[];
}

export function ClassInfo({ professor, schedule }: ClassInfoProps) {
  const groupedSchedules = schedule?.reduce((acc, sched) => {
    const timeKey = `${sched.startTime} - ${sched.endTime}`;
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(sched.dayOfWeek);
    return acc;
  }, {} as Record<string, string[]>);

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
          {groupedSchedules && Object.keys(groupedSchedules).length > 0 ? (
            Object.entries(groupedSchedules).map(([timeRange, days]) => (
              <div key={timeRange} className="mb-2 last:mb-0">
                <p className="text-lg font-medium">{days.join("/")}</p>
                <p className="text-2xl font-bold text-purple-600">
                  {timeRange}
                </p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">Nenhum horário definido</p>
          )}
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
