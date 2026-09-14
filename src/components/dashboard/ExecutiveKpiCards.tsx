"use client";

import { useRouter } from "next/navigation";
import {
  Briefcase,
  CalendarCheck,
  Award,
  BellRing,
  PlusCircle,
  TrendingUp,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExecutiveKpiStats } from "@/actions/dashboard.actions";

interface ExecutiveKpiCardsProps {
  stats: ExecutiveKpiStats;
}

export default function ExecutiveKpiCards({ stats }: ExecutiveKpiCardsProps) {
  const router = useRouter();

  const kpis = [
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: Briefcase,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: `${stats.internshipCount} Internships · ${stats.fullTimeCount} Full-time`,
      actionUrl: "/dashboard/myjobs",
      badge: stats.internshipCount > 0 ? `${stats.internshipCount} Intern` : undefined,
    },
    {
      title: "Active Interviews",
      value: stats.activeInterviews,
      icon: CalendarCheck,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: stats.activeInterviews > 0 ? "In active interview rounds" : "Ready for interview scheduling",
      actionUrl: "/dashboard/myjobs",
      badge: stats.activeInterviews > 0 ? "In Progress" : undefined,
      badgeVariant: "secondary" as const,
    },
    {
      title: "Offers Received",
      value: stats.offersCount,
      icon: Award,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      description: `${stats.interviewConversionRate}% interview-to-offer rate`,
      actionUrl: "/dashboard/myjobs",
      badge: stats.offersCount > 0 ? "Milestone" : undefined,
      badgeVariant: "default" as const,
    },
    {
      title: "Follow-ups Due",
      value: stats.followUpsDueCount,
      icon: BellRing,
      color: stats.followUpsDueCount > 0 ? "text-amber-500" : "text-slate-400",
      bgColor: stats.followUpsDueCount > 0 ? "bg-amber-500/10" : "bg-slate-500/10",
      description:
        stats.followUpsDueCount > 0
          ? "Requires outreach or status check"
          : "All outreach up to date",
      actionUrl: "/dashboard/myjobs",
      badge: stats.followUpsDueCount > 0 ? "Action Required" : "All Clear",
      badgeVariant: stats.followUpsDueCount > 0 ? "destructive" as const : "outline" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Top Banner with Quick Actions & Conversion Rate */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border bg-card/60 backdrop-blur-sm shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Career &amp; Application Command Center
            </h2>
            <Badge variant="outline" className="hidden sm:inline-flex gap-1 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
              <TrendingUp className="h-3 w-3" />
              {stats.responseRate}% Response Rate
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Monitor application pipelines, upcoming interview rounds, and priority follow-ups.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5 shadow-xs font-medium"
            onClick={() => router.push("/dashboard/myjobs?add-job=true")}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Application</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs font-medium"
            onClick={() => router.push("/dashboard/automations?add-automation=true")}
          >
            <span>Automation</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs font-medium"
            onClick={() => router.push("/dashboard/tasks?add-task=true")}
          >
            <span>Task</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-border/80 cursor-pointer"
            onClick={() => router.push(kpi.actionUrl)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-medium text-muted-foreground">
                {kpi.title}
              </span>
              <div className={`p-2 rounded-lg ${kpi.bgColor} transition-transform group-hover:scale-110`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-extrabold tracking-tight tabular-nums">
                  {kpi.value}
                </div>
                {kpi.badge && (
                  <Badge variant={kpi.badgeVariant || "outline"} className="text-[10px] px-1.5 py-0">
                    {kpi.badge}
                  </Badge>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground truncate">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
