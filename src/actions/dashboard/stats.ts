import prisma from "@/lib/db";
import { calculatePercentageDifference } from "@/lib/utils";
import { requireUser } from "../shared";
import { getLocalDayRange, roundToTenth } from "./shared";

export interface TopActivityType {
  label: string;
  hours: number;
}

export interface JobsActivitySummary {
  jobsApplied: number;
  jobsTrend: number;
  topActivities: TopActivityType[];
  otherActivities: TopActivityType[];
  otherHours: number;
  totalHours: number;
}

// One read for the merged Jobs & Activity card. Both halves share
// getLocalDayRange so "7d" means the same window on each; the retired
// getJobsAppliedForPeriod counted a rolling 7x24h window instead.
// Auth guard sits outside the try so an unauthenticated call surfaces
// "Not authenticated" rather than this function's generic message.
export const getJobsActivitySummary = async (
  daysAgo: number,
): Promise<JobsActivitySummary> => {
  const user = await requireUser();

  try {
    const { start, end } = getLocalDayRange(daysAgo - 1);
    // The equally long window immediately before this one, for the trend.
    const { start: priorStart } = getLocalDayRange(daysAgo * 2 - 1);

    const [jobsApplied, priorJobs, activities] = await prisma.$transaction([
      prisma.job.count({
        where: {
          userId: user.id,
          applied: true,
          appliedDate: { gte: start, lte: end },
        },
      }),
      prisma.job.count({
        where: {
          userId: user.id,
          applied: true,
          appliedDate: { gte: priorStart, lt: start },
        },
      }),
      prisma.activity.findMany({
        where: {
          userId: user.id,
          startTime: { gte: start, lte: end },
        },
        select: {
          duration: true,
          activityType: { select: { label: true } },
        },
      }),
    ]);

    const groupedByType = activities.reduce(
      (acc: Record<string, number>, activity: { duration: number | null; activityType: { label: string } | null }) => {
        const label = activity.activityType?.label || "Unknown";
        acc[label] = (acc[label] || 0) + (activity.duration || 0) / 60;
        return acc;
      },
      {},
    );

    const sorted = Object.entries(groupedByType)
      .map(([label, hours]: [string, number]) => ({ label, hours }))
      .sort((a: { hours: number }, b: { hours: number }) => b.hours - a.hours);

    const topActivities = sorted
      .slice(0, 3)
      .map(({ label, hours }: { label: string; hours: number }) => ({ label, hours: roundToTenth(hours) }));
    const otherActivities = sorted
      .slice(3)
      .map(({ label, hours }: { label: string; hours: number }) => ({ label, hours: roundToTenth(hours) }));
    // Summed from the same rounded values as otherActivities so the donut's
    // "Other" slice and its tooltip breakdown never disagree.
    const otherHours = roundToTenth(
      otherActivities.reduce((sum: number, entry: { hours: number }) => sum + entry.hours, 0),
    );
    // Totalled from the rounded parts so the number in the donut's
    // center always equals the legend beside it.
    const totalHours = roundToTenth(
      topActivities.reduce((sum: number, entry: { hours: number }) => sum + entry.hours, 0) + otherHours,
    );

    const jobsTrend =
      calculatePercentageDifference(priorJobs, jobsApplied) ?? 0;

    return {
      jobsApplied,
      jobsTrend,
      topActivities,
      otherActivities,
      otherHours,
      totalHours,
    };
  } catch (error) {
    console.error("Failed to fetch jobs and activity summary", error);
    return {
      jobsApplied: 0,
      jobsTrend: 0,
      topActivities: [],
      otherActivities: [],
      otherHours: 0,
      totalHours: 0,
    };
  }
};

export interface ExecutiveKpiStats {
  totalApplications: number;
  activeInterviews: number;
  offersCount: number;
  followUpsDueCount: number;
  responseRate: number;
  interviewConversionRate: number;
  activeJobsCount: number;
  internshipCount: number;
  fullTimeCount: number;
}

export const getExecutiveKpiStats = async (): Promise<ExecutiveKpiStats> => {
  const user = await requireUser();
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  try {
    const [
      totalApplications,
      activeInterviews,
      offersCount,
      followUpsDueCount,
      totalAppliedEver,
      internshipCount,
      fullTimeCount,
    ] = await prisma.$transaction([
      prisma.job.count({ where: { userId: user.id } }),
      prisma.job.count({
        where: {
          userId: user.id,
          Status: { value: "interview" },
        },
      }),
      prisma.job.count({
        where: {
          userId: user.id,
          Status: { value: { in: ["offer", "offer-accepted", "offer-declined"] } },
        },
      }),
      prisma.job.count({
        where: {
          userId: user.id,
          followUpDate: { lte: endOfToday },
        },
      }),
      prisma.job.count({
        where: {
          userId: user.id,
          applied: true,
        },
      }),
      prisma.job.count({
        where: {
          userId: user.id,
          jobType: "I",
        },
      }),
      prisma.job.count({
        where: {
          userId: user.id,
          jobType: "FT",
        },
      }),
    ]);

    const progressedCount = activeInterviews + offersCount;
    const responseRate = totalAppliedEver > 0 ? Math.round((progressedCount / totalAppliedEver) * 100) : 0;
    const interviewConversionRate = progressedCount > 0 ? Math.round((offersCount / progressedCount) * 100) : 0;

    return {
      totalApplications,
      activeInterviews,
      offersCount,
      followUpsDueCount,
      responseRate,
      interviewConversionRate,
      activeJobsCount: totalApplications,
      internshipCount,
      fullTimeCount,
    };
  } catch (error) {
    console.error("Failed to fetch executive KPI stats", error);
    return {
      totalApplications: 0,
      activeInterviews: 0,
      offersCount: 0,
      followUpsDueCount: 0,
      responseRate: 0,
      interviewConversionRate: 0,
      activeJobsCount: 0,
      internshipCount: 0,
      fullTimeCount: 0,
    };
  }
};

export interface ApplicationFunnelStats {
  draft: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
  byJobType: {
    fullTime: number;
    internship: number;
    partTime: number;
    contract: number;
  };
}

export const getApplicationFunnelStats = async (): Promise<ApplicationFunnelStats> => {
  const user = await requireUser();

  try {
    const [draft, applied, interview, offer, rejected, fullTime, internship, partTime, contract] =
      await prisma.$transaction([
        prisma.job.count({ where: { userId: user.id, Status: { value: "draft" } } }),
        prisma.job.count({ where: { userId: user.id, Status: { value: "applied" } } }),
        prisma.job.count({ where: { userId: user.id, Status: { value: "interview" } } }),
        prisma.job.count({
          where: {
            userId: user.id,
            Status: { value: { in: ["offer", "offer-accepted", "offer-declined"] } },
          },
        }),
        prisma.job.count({ where: { userId: user.id, Status: { value: "rejected" } } }),
        prisma.job.count({ where: { userId: user.id, jobType: "FT" } }),
        prisma.job.count({ where: { userId: user.id, jobType: "I" } }),
        prisma.job.count({ where: { userId: user.id, jobType: "PT" } }),
        prisma.job.count({ where: { userId: user.id, jobType: "C" } }),
      ]);

    return {
      draft,
      applied,
      interview,
      offer,
      rejected,
      byJobType: {
        fullTime,
        internship,
        partTime,
        contract,
      },
    };
  } catch (error) {
    console.error("Failed to fetch application funnel stats", error);
    return {
      draft: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      byJobType: {
        fullTime: 0,
        internship: 0,
        partTime: 0,
        contract: 0,
      },
    };
  }
};

export interface UpcomingInterviewItem {
  id: string;
  round: string;
  interviewDate: Date;
  location: string | null;
  status: string;
  notes: string | null;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogoUrl: string | null;
}

export const getUpcomingInterviews = async (limit: number = 5): Promise<UpcomingInterviewItem[]> => {
  const user = await requireUser();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  try {
    const interviews = await prisma.interview.findMany({
      where: {
        job: { userId: user.id },
        interviewDate: { gte: startOfToday },
        OR: [
          { status: { in: ["scheduled", "confirmed"] } },
          { status: null },
        ],
      },
      include: {
        job: {
          select: {
            id: true,
            JobTitle: { select: { label: true } },
            Company: { select: { label: true, logoUrl: true } },
          },
        },
      },
      orderBy: { interviewDate: "asc" },
      take: limit,
    });

    type InterviewRow = {
      id: string;
      round: string | null;
      interviewDate: Date | null;
      location: string | null;
      status: string | null;
      notes: string | null;
      jobId: string;
      job: {
        id: string;
        JobTitle: { label: string } | null;
        Company: { label: string; logoUrl: string | null } | null;
      } | null;
    };

    return (interviews as InterviewRow[]).map((item) => ({
      id: item.id,
      round: item.round || "Interview",
      interviewDate: item.interviewDate ?? new Date(),
      location: item.location,
      status: item.status || "scheduled",
      notes: item.notes,
      jobId: item.jobId,
      jobTitle: item.job?.JobTitle?.label || "Job Application",
      companyName: item.job?.Company?.label || "Unknown Company",
      companyLogoUrl: item.job?.Company?.logoUrl || null,
    }));
  } catch (error) {
    console.error("Failed to fetch upcoming interviews", error);
    return [];
  }
};

export interface PendingFollowUpItem {
  id: string;
  jobTitle: string;
  companyName: string;
  companyLogoUrl: string | null;
  status: string;
  statusLabel: string;
  appliedDate: Date | null;
  followUpDate: Date;
  followUpNotes: string | null;
  isOverdue: boolean;
  isDueToday: boolean;
}

export const getPendingFollowUps = async (limit: number = 5): Promise<PendingFollowUpItem[]> => {
  const user = await requireUser();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  try {
    const jobs = await prisma.job.findMany({
      where: {
        userId: user.id,
        followUpDate: { not: null },
      },
      select: {
        id: true,
        followUpDate: true,
        followUpNotes: true,
        appliedDate: true,
        Status: { select: { value: true, label: true } },
        JobTitle: { select: { label: true } },
        Company: { select: { label: true, logoUrl: true } },
      },
      orderBy: { followUpDate: "asc" },
      take: limit,
    });

    type JobRow = {
      id: string;
      followUpDate: Date | null;
      followUpNotes: string | null;
      appliedDate: Date | null;
      Status: { value: string; label: string } | null;
      JobTitle: { label: string } | null;
      Company: { label: string; logoUrl: string | null } | null;
    };

    return (jobs as JobRow[])
      .filter((j) => j.followUpDate !== null)
      .map((j) => {
        const fDate = new Date(j.followUpDate!);
        return {
          id: j.id,
          jobTitle: j.JobTitle?.label || "Job Application",
          companyName: j.Company?.label || "Unknown Company",
          companyLogoUrl: j.Company?.logoUrl || null,
          status: j.Status?.value || "applied",
          statusLabel: j.Status?.label || "Applied",
          appliedDate: j.appliedDate,
          followUpDate: fDate,
          followUpNotes: j.followUpNotes,
          isOverdue: fDate < startOfToday,
          isDueToday: fDate >= startOfToday && fDate <= endOfToday,
        };
      });
  } catch (error) {
    console.error("Failed to fetch pending follow-ups", error);
    return [];
  }
};
