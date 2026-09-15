import { APP_CONSTANTS } from "@/lib/constants";
import prisma from "@/lib/db";
import { requireUser } from "../shared";

export const getRecentJobs = async (): Promise<any | undefined> => {
  const user = await requireUser();
  try {
    const list = await prisma.job.findMany({
      where: {
        userId: user.id,
        applied: true,
      },
      include: {
        JobSource: true,
        JobTitle: true,
        Company: true,
        Status: true,
        Location: true,
      },
      orderBy: {
        appliedDate: "desc",
      },
      take: APP_CONSTANTS.RECENT_NUM_JOBS_ACTIVITIES,
    });
    return list;
  } catch (error) {
    console.error("Failed to fetch recent jobs", error);
    return [];
  }
};

export const getRecentActivities = async () => {
  const user = await requireUser();
  try {
    const list = await prisma.activity.findMany({
      where: {
        userId: user.id,
        endTime: { not: null },
      },
      include: {
        activityType: true,
      },
      orderBy: {
        endTime: "desc",
      },
      take: APP_CONSTANTS.RECENT_NUM_JOBS_ACTIVITIES,
    });
    return list;
  } catch (error) {
    console.error("Failed to fetch recent activities", error);
    return [];
  }
};
