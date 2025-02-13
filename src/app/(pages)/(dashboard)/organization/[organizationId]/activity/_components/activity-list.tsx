import { ActivityItem } from "@/components/activity-item";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export const ActivityList = async () => {
  const { orgId } = auth();

  if (!orgId) {
    redirect("/select-org");
  }

  const auditLogs = await db.auditLog.findMany({
    where: {
      orgId,
    },
  });

  return (
    <ol className="space-y-4 mt-4">
      <p className="hidden last:block text-xs text-center text-muted-foreground">
        No activity found in this organization
      </p>

      {auditLogs.map((log) => (
        <ActivityItem key={log.id} data={log} />
      ))}
    </ol>
  );
};

ActivityList.Skeleton = () => {
  return (
    <ol className="space-y-4 mt-4">
      <Skeleton className="w-[80%] h-14" />
      <Skeleton className="w-[67%] h-14" />
      <Skeleton className="w-[54%] h-14" />
      <Skeleton className="w-[60%] h-14" />
      <Skeleton className="w-[90%] h-14" />
      <Skeleton className="w-[70%] h-14" />
    </ol>
  );
};
