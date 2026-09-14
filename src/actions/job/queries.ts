"use server";
import prisma from "@/lib/db";
import { handleError } from "@/lib/utils";
import { JOB_TYPES } from "@/models/job.model";
import { APP_CONSTANTS } from "@/lib/constants";
import { requireUser } from "../shared";

const JOB_LIST_SELECT = {
  id: true,
  JobSource: true,
  JobTitle: true,
  jobType: true,
  workplaceType: true,
  Company: true,
  Status: true,
  Location: true,
  dueDate: true,
  appliedDate: true,
  createdAt: true,
  description: false,
  Resume: true,
  CoverLetter: true,
  matchScore: true,
  discoveryStatus: true,
  followUpDate: true,
  followUpNotes: true,
  Interview: {
    select: {
      id: true,
      round: true,
      interviewDate: true,
      location: true,
      status: true,
    },
    orderBy: {
      interviewDate: "asc" as const,
    },
  },
  tags: true,
  _count: { select: { Notes: true } },
};

const JOB_EXPORT_SELECT = {
  id: true,
  createdAt: true,
  JobSource: true,
  JobTitle: true,
  jobType: true,
  workplaceType: true,
  Company: true,
  Status: true,
  Location: true,
  dueDate: true,
  applied: true,
  appliedDate: true,
  followUpDate: true,
};

const JOB_DETAILS_INCLUDE = {
  JobSource: true,
  JobTitle: true,
  Company: true,
  Status: true,
  Location: true,
  Resume: {
    include: {
      File: true,
    },
  },
  CoverLetter: true,
  tags: true,
  Interview: {
    include: {
      interviewers: true,
    },
    orderBy: {
      interviewDate: "asc" as const,
    },
  },
};

type JobsListFilters = {
  filter?: string;
  search?: string;
  companyValue?: string;
  appliedOnly?: boolean;
  titleValue?: string;
  locationValue?: string;
  sourceValue?: string;
  jobType?: string;
  urgency?: string;
  sortBy?: string;
};

const buildJobsWhereClause = (userId: string, filters: JobsListFilters) => {
  const {
    filter,
    search,
    companyValue,
    appliedOnly,
    titleValue,
    locationValue,
    sourceValue,
    jobType,
    urgency,
  } = filters;

  const filterBy = filter
    ? filter === "PT" || filter === "FT" || filter === "C" || filter === "I"
      ? {
          jobType: filter,
        }
      : filter === "accepted" || filter === "dismissed"
        ? {
            discoveryStatus: filter,
          }
        : {
            Status: {
              value: filter,
            },
          }
    : {};

  const whereClause: any = {
    userId,
    ...filterBy,
  };

  // Explicit job type filter override
  if (jobType && jobType !== "all") {
    whereClause.jobType = jobType;
  }

  // Urgency filter: follow-up or interview
  if (urgency === "needs-followup") {
    whereClause.followUpDate = { not: null };
  } else if (urgency === "has-interview") {
    whereClause.Interview = { some: {} };
  }

  // Dismissed discovered jobs are kept only for dedup and shouldn't
  // clutter the tracked jobs list unless explicitly filtered for.
  if (filter !== "dismissed") {
    whereClause.AND = [
      {
        OR: [{ discoveryStatus: null }, { discoveryStatus: { not: "dismissed" } }],
      },
    ];
  }

  if (companyValue) {
    whereClause.Company = { value: companyValue };
  }

  if (titleValue) {
    whereClause.JobTitle = { value: titleValue };
  }

  if (locationValue) {
    whereClause.Location = { value: locationValue };
  }

  if (sourceValue) {
    whereClause.JobSource = { value: sourceValue };
  }

  if (appliedOnly) {
    whereClause.applied = true;
  }

  // Search across Title, Company, Location, Source, Description, Tags, and Notes
  if (search && search.trim()) {
    const trimmed = search.trim();
    const searchConditions: Record<string, any>[] = [
      { JobTitle: { label: { contains: trimmed } } },
      { Company: { label: { contains: trimmed } } },
      { Location: { label: { contains: trimmed } } },
      { JobSource: { label: { contains: trimmed } } },
      { description: { contains: trimmed } },
      { tags: { some: { label: { contains: trimmed } } } },
      { Notes: { some: { content: { contains: trimmed } } } },
    ];
    whereClause.OR = searchConditions;
  }

  return whereClause;
};

export const getJobsList = async (
  page: number = 1,
  limit: number = APP_CONSTANTS.RECORDS_PER_PAGE,
  filter?: string,
  search?: string,
  companyValue?: string,
  appliedOnly?: boolean,
  titleValue?: string,
  locationValue?: string,
  sourceValue?: string,
  jobType?: string,
  urgency?: string,
  sortBy: string = "newest",
): Promise<any | undefined> => {
  try {
    const user = await requireUser();
    const skip = (page - 1) * limit;

    const whereClause = buildJobsWhereClause(user.id, {
      filter,
      search,
      companyValue,
      appliedOnly,
      titleValue,
      locationValue,
      sourceValue,
      jobType,
      urgency,
    });

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sortBy === "applied-recent") {
      orderBy = { appliedDate: "desc" };
    } else if (sortBy === "due-soon") {
      orderBy = { dueDate: "asc" };
    } else if (sortBy === "followup-soon") {
      orderBy = { followUpDate: "asc" };
    } else if (sortBy === "company") {
      orderBy = { Company: { label: "asc" } };
    } else if (sortBy === "matchScore") {
      orderBy = { matchScore: "desc" };
    }

    const [data, total] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: JOB_LIST_SELECT,
        orderBy,
      }),
      prisma.job.count({
        where: whereClause,
      }),
    ]);
    return { success: true, data, total };
  } catch (error) {
    const msg = "Failed to fetch jobs list. ";
    return handleError(error, msg);
  }
};

export async function* getJobsIterator(filter?: string, pageSize = 200) {
  const user = await requireUser();
  let page = 1;
  let fetchedCount = 0;

  while (true) {
    const skip = (page - 1) * pageSize;
    const filterBy = filter
      ? filter === Object.keys(JOB_TYPES)[1]
        ? { status: filter }
        : { type: filter }
      : {};

    const chunk = await prisma.job.findMany({
      where: {
        userId: user.id,
        ...filterBy,
      },
      select: JOB_EXPORT_SELECT,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    if (!chunk.length) {
      break;
    }

    yield chunk;
    fetchedCount += chunk.length;
    page++;
  }
}

export const getJobDetails = async (
  jobId: string,
): Promise<any | undefined> => {
  try {
    if (!jobId) {
      throw new Error("Please provide job id");
    }
    const user = await requireUser();

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
        userId: user.id,
      },
      include: JOB_DETAILS_INCLUDE,
    });
    return { job, success: true };
  } catch (error) {
    const msg = "Failed to fetch job details. ";
    return handleError(error, msg);
  }
};
