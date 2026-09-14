"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  BellRing,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PendingFollowUpItem } from "@/actions/dashboard.actions";

interface FollowUpRemindersCardProps {
  reminders: PendingFollowUpItem[];
}

export default function FollowUpRemindersCard({ reminders }: FollowUpRemindersCardProps) {
  return (
    <Card className="h-full flex flex-col justify-between border shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BellRing className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold">Follow-Up Reminders</CardTitle>
          </div>
          {reminders.some((r) => r.isOverdue) ? (
            <Badge variant="destructive" className="text-[10px] gap-1">
              <AlertCircle className="h-3 w-3" /> Overdue Tasks
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              {reminders.length} Active
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          Never miss an application deadline or post-interview check-in.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground gap-2">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">All caught up!</p>
              <p className="text-[11px] text-muted-foreground max-w-[220px]">
                No pending follow-ups due right now. Set reminders on jobs to track outreach.
              </p>
            </div>
            <Button size="sm" variant="outline" className="mt-2 text-xs h-7" asChild>
              <Link href="/dashboard/myjobs">View Applications</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {reminders.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col gap-1.5 p-2.5 rounded-lg border bg-card/40 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {item.jobTitle}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.companyName}
                    </p>
                  </div>
                  {item.isOverdue ? (
                    <Badge variant="destructive" className="text-[10px] shrink-0 font-medium">
                      Overdue
                    </Badge>
                  ) : item.isDueToday ? (
                    <Badge variant="secondary" className="text-[10px] shrink-0 font-medium bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      Due Today
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] shrink-0 font-medium">
                      {format(new Date(item.followUpDate), "MMM d")}
                    </Badge>
                  )}
                </div>

                {item.followUpNotes && (
                  <p className="text-[11px] text-muted-foreground bg-muted/30 p-1.5 rounded text-left line-clamp-1 italic">
                    &ldquo;{item.followUpNotes}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {item.isOverdue ? "Overdue since: " : "Follow up on: "}
                      <strong>{format(new Date(item.followUpDate), "MMM d, yyyy")}</strong>
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/myjobs`}
                    className="inline-flex items-center gap-0.5 text-primary hover:underline text-[10px] ml-auto shrink-0"
                  >
                    Action <ArrowRight className="h-2.5 w-2.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
