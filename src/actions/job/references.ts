"use server";
import prisma from "@/lib/db";
import { handleError } from "@/lib/utils";
import { canonicalizeEntityValue } from "@/lib/jobs/canonicalize";
import { requireUser } from "../shared";
import { JOB_SOURCES, JOB_STATUSES } from "@/lib/constants";

// JobStatus is global reference data with no createdBy column, so unlike every
// other list here it is not scoped to the current user.
export const getStatusList = async (): Promise<any | undefined> => {
  try {
    let statuses = await prisma.jobStatus.findMany();
    if (statuses.length === 0) {
      for (const status of JOB_STATUSES) {
        await prisma.jobStatus.upsert({
          where: { value: status.value },
          update: {},
          create: status,
        });
      }
      statuses = await prisma.jobStatus.findMany();
    }
    return statuses;
  } catch (error) {
    const msg = "Failed to fetch status list. ";
    return handleError(error, msg);
  }
};

export const getJobSourceList = async (): Promise<any | undefined> => {
  try {
    const user = await requireUser();
    let list = await prisma.jobSource.findMany({
      where: {
        createdBy: user.id,
      },
    });
    if (list.length === 0) {
      await prisma.jobSource.createMany({
        data: JOB_SOURCES.map((source) => ({
          label: source.label,
          value: source.value,
          createdBy: user.id,
        })),
      });
      list = await prisma.jobSource.findMany({
        where: {
          createdBy: user.id,
        },
      });
    }
    return list;
  } catch (error) {
    const msg = "Failed to fetch job source list. ";
    return handleError(error, msg);
  }
};

export const createLocation = async (
  label: string,
): Promise<any | undefined> => {
  try {
    const user = await requireUser();

    const value = canonicalizeEntityValue(label.trim());

    if (!value) {
      throw new Error("Please provide location name");
    }

    const existing = await prisma.location.findFirst({
      where: { value, createdBy: user.id },
    });
    if (existing) {
      return { data: existing, success: true };
    }

    const location = await prisma.location.create({
      data: { label, value, createdBy: user.id },
    });

    return { data: location, success: true };
  } catch (error) {
    const msg = "Failed to create job location. ";
    return handleError(error, msg);
  }
};

export const createJobSource = async (
  label: string,
): Promise<any | undefined> => {
  try {
    const user = await requireUser();

    const value = canonicalizeEntityValue(label.trim());

    if (!value) {
      throw new Error("Please provide job source name");
    }

    const existing = await prisma.jobSource.findFirst({
      where: { value, createdBy: user.id },
    });
    if (existing) {
      return { data: existing, success: true };
    }

    const jobSource = await prisma.jobSource.create({
      data: { label, value, createdBy: user.id },
    });

    return { data: jobSource, success: true };
  } catch (error) {
    const msg = "Failed to create job source. ";
    return handleError(error, msg);
  }
};
