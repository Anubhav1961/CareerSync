import {
  getActivityCalendarData,
  getActivityDataForPeriod,
  getJobsActivityForPeriod,
  getJobsActivitySummary,
  getRecentActivities,
  getRecentJobs,
  getExecutiveKpiStats,
  getApplicationFunnelStats,
  getUpcomingInterviews,
  getPendingFollowUps,
} from "@/actions/dashboard.actions";
import ActivityCalendar from "@/components/dashboard/ActivityCalendar";
import JobsActivityCard from "@/components/dashboard/JobsActivityCard";
import RecentCardToggle from "@/components/dashboard/RecentCardToggle";
import WeeklyBarChartToggle from "@/components/dashboard/WeeklyBarChartToggle";
import ExecutiveKpiCards from "@/components/dashboard/ExecutiveKpiCards";
import ApplicationFunnelCard from "@/components/dashboard/ApplicationFunnelCard";
import UpcomingInterviewsCard from "@/components/dashboard/UpcomingInterviewsCard";
import FollowUpRemindersCard from "@/components/dashboard/FollowUpRemindersCard";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Dashboard",
  description: "Executive Job and Internship Application Command Center",
};

export default async function Dashboard() {
  const [
    kpiStats,
    funnelStats,
    upcomingInterviews,
    pendingFollowUps,
    summary7Days,
    summary30Days,
    recentJobs,
    recentActivities,
    weeklyData,
    activitiesData,
    activityCalendarData,
  ] = await Promise.all([
    getExecutiveKpiStats(),
    getApplicationFunnelStats(),
    getUpcomingInterviews(5),
    getPendingFollowUps(5),
    getJobsActivitySummary(7),
    getJobsActivitySummary(30),
    getRecentJobs(),
    getRecentActivities(),
    getJobsActivityForPeriod(),
    getActivityDataForPeriod(),
    getActivityCalendarData(),
  ]);

  const activityCalendarDataKeys = Object.keys(activityCalendarData);

  return (
    <div className="col-span-3 flex flex-col gap-4 w-full">
      {/* 1. Executive Top Metrics Banner & Quick Launcher */}
      <ExecutiveKpiCards stats={kpiStats} />

      {/* 2. Middle Grid: Left side analytics + Right side action items */}
      <div className="@container grid grid-cols-1 @3xl/main:grid-cols-3 items-start gap-4">
        {/* Left Column: Funnel & Charts (2 cols on wide screen) */}
        <div className="flex flex-col gap-4 @3xl/main:col-span-2">
          <div className="grid grid-cols-1 @lg:grid-cols-2 gap-4">
            <ApplicationFunnelCard stats={funnelStats} />
            <JobsActivityCard
              data={[
                { label: "7d", summary: summary7Days },
                { label: "30d", summary: summary30Days },
              ]}
            />
          </div>

          <WeeklyBarChartToggle
            charts={[
              {
                label: "Jobs",
                data: weeklyData,
                keys: ["value"],
                axisLeftLegend: "JOBS APPLIED",
              },
              {
                label: "Activities",
                data: activitiesData.data,
                keys: activitiesData.keys,
                groupMode: "stacked",
                axisLeftLegend: "TIME SPENT (Hours)",
              },
            ]}
          />
        </div>

        {/* Right Column: Upcoming Interviews, Follow-ups, and Recent Feed */}
        <div className="flex flex-col gap-4 @3xl/main:col-span-1">
          <UpcomingInterviewsCard interviews={upcomingInterviews} />
          <FollowUpRemindersCard reminders={pendingFollowUps} />
          <RecentCardToggle jobs={recentJobs} activities={recentActivities} />
        </div>
      </div>

      {/* 3. Bottom Section: Heatmap Activity Calendar */}
      <div className="w-full pt-1">
        <ActivityCalendar
          years={activityCalendarDataKeys}
          dataByYear={activityCalendarData}
        />
      </div>
    </div>
  );
}
