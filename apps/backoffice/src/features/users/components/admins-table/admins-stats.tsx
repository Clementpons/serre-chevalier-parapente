import { CheckCircleIcon } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@prisma/client";

interface AdminsStatsProps {
  admins: User[];
}

export function AdminsStats({ admins }: AdminsStatsProps) {
  const totalAdmins = admins.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Admins</p>
              <p className="text-2xl font-bold">{totalAdmins}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
