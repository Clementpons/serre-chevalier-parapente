import { CheckCircleIcon, PlusIcon } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@prisma/client";
import { Button } from "@/components/ui/button";

interface MonitorsStatsProps {
  monitors: User[];
  onAddMonitor?: () => void;
}

export function MonitorsStats({ monitors, onAddMonitor }: MonitorsStatsProps) {
  const totalMonitors = monitors.length;

  return (
    <div className="w-full flex items-center justify-between mb-6">
      <Card className="w-1/3">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Moniteurs</p>
              <p className="text-2xl font-bold">{totalMonitors}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Button className="ml-4" onClick={onAddMonitor}>
        <PlusIcon className="mr-2 h-4 w-4" />
        <span className="text-sm">Ajouter un Moniteur</span>
      </Button>
    </div>
  );
}
