"use client";

import { Filter, Layers, BarChart3, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplicationFunnelStats } from "@/actions/dashboard.actions";

interface ApplicationFunnelCardProps {
  stats: ApplicationFunnelStats;
}

export default function ApplicationFunnelCard({ stats }: ApplicationFunnelCardProps) {
  const totalInFunnel =
    stats.draft + stats.applied + stats.interview + stats.offer + stats.rejected;

  const funnelStages = [
    {
      label: "Draft",
      count: stats.draft,
      color: "bg-slate-500",
      textColor: "text-slate-500",
    },
    {
      label: "Applied",
      count: stats.applied,
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
    {
      label: "Interviewing",
      count: stats.interview,
      color: "bg-purple-500",
      textColor: "text-purple-500",
    },
    {
      label: "Offer",
      count: stats.offer,
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
    },
    {
      label: "Rejected",
      count: stats.rejected,
      color: "bg-rose-500",
      textColor: "text-rose-500",
    },
  ];

  const totalTypes =
    stats.byJobType.fullTime +
    stats.byJobType.internship +
    stats.byJobType.partTime +
    stats.byJobType.contract;

  return (
    <Card className="h-full flex flex-col justify-between border shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Filter className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold">Application Funnel</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {totalInFunnel} Total
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Conversion rate across pipeline stages and job type distribution.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 flex-1">
        {/* Visual Progress Stacked Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>Pipeline Progression</span>
            <span>{totalInFunnel > 0 ? "100%" : "No data"}</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex">
            {totalInFunnel > 0 ? (
              funnelStages.map((stage) => {
                const pct = (stage.count / totalInFunnel) * 100;
                if (pct === 0) return null;
                return (
                  <div
                    key={stage.label}
                    style={{ width: `${pct}%` }}
                    className={`${stage.color} h-full transition-all duration-500`}
                    title={`${stage.label}: ${stage.count} (${Math.round(pct)}%)`}
                  />
                );
              })
            ) : (
              <div className="w-full bg-muted h-full" />
            )}
          </div>
        </div>

        {/* Funnel Stage Breakdown Grid */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {funnelStages.map((stage) => {
            const pct = totalInFunnel > 0 ? Math.round((stage.count / totalInFunnel) * 100) : 0;
            return (
              <div
                key={stage.label}
                className="flex flex-col items-center p-2 rounded-lg border bg-card/30 text-center"
              >
                <span className="text-[10px] text-muted-foreground font-medium truncate w-full">
                  {stage.label}
                </span>
                <span className="text-base font-bold tabular-nums text-foreground mt-0.5">
                  {stage.count}
                </span>
                <span className="text-[9px] text-muted-foreground/80 tabular-nums">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Job Type Distribution Section */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              Role Category Distribution
            </span>
            <span className="text-[11px] text-muted-foreground">
              {stats.byJobType.internship} Internships
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="flex flex-col p-2 rounded-md bg-muted/40 border border-border/40">
              <span className="text-[10px] text-muted-foreground">Full-time</span>
              <span className="text-sm font-semibold tabular-nums mt-0.5">
                {stats.byJobType.fullTime}
              </span>
            </div>
            <div className="flex flex-col p-2 rounded-md bg-primary/5 border border-primary/20">
              <span className="text-[10px] text-primary font-medium">Internship</span>
              <span className="text-sm font-semibold tabular-nums text-primary mt-0.5">
                {stats.byJobType.internship}
              </span>
            </div>
            <div className="flex flex-col p-2 rounded-md bg-muted/40 border border-border/40">
              <span className="text-[10px] text-muted-foreground">Part-time</span>
              <span className="text-sm font-semibold tabular-nums mt-0.5">
                {stats.byJobType.partTime}
              </span>
            </div>
            <div className="flex flex-col p-2 rounded-md bg-muted/40 border border-border/40">
              <span className="text-[10px] text-muted-foreground">Contract</span>
              <span className="text-sm font-semibold tabular-nums mt-0.5">
                {stats.byJobType.contract}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
