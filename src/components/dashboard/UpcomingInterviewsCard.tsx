"use client";

import Link from "next/link";
import { format, isToday, isTomorrow } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpcomingInterviewItem } from "@/actions/dashboard.actions";

interface UpcomingInterviewsCardProps {
  interviews: UpcomingInterviewItem[];
}

export default function UpcomingInterviewsCard({ interviews }: UpcomingInterviewsCardProps) {
  const formatInterviewTime = (date: Date) => {
    const d = new Date(date);
    let dayStr = format(d, "MMM d");
    if (isToday(d)) dayStr = "Today";
    else if (isTomorrow(d)) dayStr = "Tomorrow";
    return `${dayStr} at ${format(d, "h:mm a")}`;
  };

  return (
    <Card className="h-full flex flex-col justify-between border shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Calendar className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold">Upcoming Interviews</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {interviews.length} Scheduled
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Chronological schedule of upcoming interview rounds &amp; meetings.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground gap-2">
            <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-muted-foreground/70" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">No interviews scheduled</p>
              <p className="text-[11px] text-muted-foreground max-w-[220px]">
                When you schedule interview stages on your applications, they will appear here.
              </p>
            </div>
            <Button size="sm" variant="outline" className="mt-2 text-xs h-7" asChild>
              <Link href="/dashboard/myjobs">View Applications</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {interviews.map((item) => (
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
                  <Badge variant="outline" className="text-[10px] shrink-0 font-medium border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5">
                    {item.round}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{formatInterviewTime(item.interviewDate)}</span>
                  </div>

                  {item.location && (
                    <div className="flex items-center gap-1 truncate max-w-[140px]" title={item.location}>
                      {item.location.toLowerCase().includes("meet") ||
                      item.location.toLowerCase().includes("zoom") ||
                      item.location.toLowerCase().includes("http") ? (
                        <Video className="h-3 w-3 text-blue-500 shrink-0" />
                      ) : (
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}

                  <Link
                    href={`/dashboard/myjobs`}
                    className="inline-flex items-center gap-0.5 text-primary hover:underline text-[10px] ml-auto shrink-0"
                  >
                    Details <ArrowRight className="h-2.5 w-2.5" />
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
