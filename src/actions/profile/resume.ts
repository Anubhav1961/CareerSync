"use server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { handleError } from "@/lib/utils";
import { APP_CONSTANTS } from "@/lib/constants";
import { resumeDetailInclude } from "@/lib/jobs/resumeDetailInclude";
import { createFileEntry, requireUser, resumeListSelect } from "./shared";
import { deleteFile } from "./files";

export const getResumeList = async (
  page: number = 1,
  limit: number = APP_CONSTANTS.RECORDS_PER_PAGE,
  search?: string,
  minSections: number = 0,
): Promise<any | undefined> => {
  try {
    const user = await requireUser();

    const profile = await prisma.profile.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!profile) return { data: [], total: 0, success: true };

    const searchFilter = search?.trim()
      ? { title: { contains: search.trim() } }
      : {};
    const where = { profileId: profile.id, ...searchFilter };

    const [userRow, total] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { defaultResumeId: true },
      }),
      prisma.resume.count({ where }),
    ]);
    const defaultResumeId = userRow?.defaultResumeId ?? null;

    let rawData: Array<{
      id: string;
      title: string;
      createdAt: Date;
      updatedAt: Date;
      profileId: string;
      FileId: string | null;
      _count: { ResumeSections: number };
    }> = [];

    if (searchFilter.title) {
      rawData = await prisma.resume.findMany({
        where,
        select: resumeListSelect,
        orderBy: { createdAt: "desc" },
      });
      if (defaultResumeId) {
        const defaultIndex = rawData.findIndex(
          (r: { id: string }) => r.id === defaultResumeId,
        );
        if (defaultIndex > 0) {
          const [defaultResume] = rawData.splice(defaultIndex, 1);
          rawData.unshift(defaultResume);
        }
      }
    } else if (defaultResumeId) {
      const restWhere = { ...where, id: { not: defaultResumeId } };
      if (page === 1) {
        const [defaultResume, rest] = await Promise.all([
          prisma.resume.findFirst({
            where: { id: defaultResumeId, ...where },
            select: resumeListSelect,
          }),
          prisma.resume.findMany({
            where: restWhere,
            select: resumeListSelect,
            orderBy: { createdAt: "desc" },
            take: limit - 1,
          }),
        ]);
        rawData = defaultResume ? [defaultResume, ...rest] : rest;
      } else {
        rawData = await prisma.resume.findMany({
          where: restWhere,
          select: resumeListSelect,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit - 1,
          take: limit,
        });
      }
    } else {
      rawData = await prisma.resume.findMany({
        where,
        select: resumeListSelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
    }

    const data =
      minSections > 0
        ? rawData.filter(
            (r: { _count: { ResumeSections: number } }) =>
              r._count.ResumeSections >= minSections,
          )
        : rawData;

    return { data, total, success: true };
  } catch (error) {
    const msg = "Failed to get resume list.";
    return handleError(error, msg);
  }
};

export const getResumeById = async (
  resumeId: string,
): Promise<any | undefined> => {
  try {
    if (!resumeId) {
      throw new Error("Please provide resume id");
    }
    const user = await requireUser();

    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        profile: { userId: user.id },
      },
      include: resumeDetailInclude,
    });
    return { data: resume, success: true };
  } catch (error) {
    const msg = "Failed to get resume.";
    return handleError(error, msg);
  }
};

export const saveResumeReviewResult = async (
  resumeId: string,
  reviewData: string,
): Promise<any | undefined> => {
  try {
    const user = await requireUser();

    await prisma.resume.update({
      where: { id: resumeId, profile: { userId: user.id } },
      data: { reviewData },
    });

    return { success: true };
  } catch (error) {
    const msg = "Failed to save resume review result.";
    return handleError(error, msg);
  }
};

export const createResumeProfile = async (
  title: string,
  fileName?: string,
  filePath?: string,
): Promise<any | undefined> => {
  try {
    const user = await requireUser();

    const existingTitles = await prisma.resume.findMany({
      where: { profile: { userId: user.id } },
      select: { title: true },
    });
    const taken = new Set(
      existingTitles.map((r: { title: string }) => r.title.toLowerCase()),
    );
    const base = title.trim();
    let uniqueTitle = base;
    let counter = 2;
    while (taken.has(uniqueTitle.toLowerCase())) {
      uniqueTitle = `${base} (${counter++})`;
    }

    const resumeCount = await prisma.resume.count({
      where: { profile: { userId: user.id } },
    });

    const profile = await prisma.profile.findFirst({
      where: {
        userId: user.id,
      },
    });

    let res: any;
    let createdResumeId: string;
    if (profile && profile.id) {
      res = await prisma.resume.create({
        data: {
          profileId: profile.id,
          title: uniqueTitle,
          FileId: fileName ? await createFileEntry(fileName, filePath) : null,
        },
      });
      createdResumeId = res.id;
    } else {
      res = await prisma.profile.create({
        data: {
          userId: user.id,
          resumes: {
            create: [
              {
                title: uniqueTitle,
                FileId: fileName
                  ? await createFileEntry(fileName, filePath)
                  : null,
              },
            ],
          },
        },
        include: { resumes: { select: { id: true } } },
      });
      createdResumeId = res.resumes[0].id;
    }

    if (resumeCount === 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { defaultResumeId: createdResumeId },
      });
    }

    return { success: true, data: res };
  } catch (error) {
    const msg = "Failed to create resume.";
    return handleError(error, msg);
  }
};

export const editResume = async (
  id: string,
  title: string,
  fileId?: string,
  fileName?: string,
  filePath?: string,
): Promise<any | undefined> => {
  try {
    let resolvedFileId = fileId;

    if (!fileId && fileName && filePath) {
      resolvedFileId = await createFileEntry(fileName, filePath);
    }

    if (resolvedFileId) {
      const isValidFileId = await prisma.file.findFirst({
        where: { id: resolvedFileId },
      });

      if (!isValidFileId) {
        throw new Error(
          `The provided FileId "${resolvedFileId}" does not exist.`,
        );
      }
    }

    const user = await requireUser();

    const res = await prisma.resume.update({
      where: { id, profile: { userId: user.id } },
      data: {
        title,
        FileId: resolvedFileId || null,
      },
    });
    return { success: true, data: res };
  } catch (error) {
    const msg = "Failed to update resume or file.";
    return handleError(error, msg);
  }
};

export const deleteResumeById = async (
  resumeId: string,
): Promise<any | undefined> => {
  try {
    const user = await requireUser();

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, profile: { userId: user.id } },
      select: { FileId: true },
    });

    if (!resume) {
      throw new Error("Resume not found or access denied");
    }

    if (resume.FileId) {
      await deleteFile(resume.FileId);
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.contactInfo.deleteMany({ where: { resumeId } });
      await tx.summary.deleteMany({
        where: { ResumeSection: { resumeId } },
      });
      await tx.workExperience.deleteMany({
        where: { ResumeSection: { resumeId } },
      });
      await tx.education.deleteMany({
        where: { ResumeSection: { resumeId } },
      });
      await tx.licenseOrCertification.deleteMany({
        where: { ResumeSection: { resumeId } },
      });
      await tx.skill.deleteMany({
        where: { ResumeSection: { resumeId } },
      });
      await tx.otherSection.deleteMany({
        where: { ResumeSection: { resumeId } },
      });
      await tx.resumeSection.deleteMany({ where: { resumeId } });

      await tx.user.updateMany({
        where: { defaultResumeId: resumeId },
        data: { defaultResumeId: null },
      });

      await tx.resume.delete({ where: { id: resumeId } });
    });

    return { success: true, message: "Resume deleted successfully." };
  } catch (error) {
    const msg = "Failed to delete resume.";
    return handleError(error, msg);
  }
};
