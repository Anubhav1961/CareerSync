"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireUser } from "./shared";
import { handleError } from "@/lib/utils";

export interface InterviewFormData {
  id?: string;
  jobId: string;
  round: string;
  interviewDate: Date;
  location?: string | null;
  status?: string;
  notes?: string | null;
  feedback?: string | null;
  interviewerName?: string | null;
  interviewerEmail?: string | null;
}

export async function addInterviewRound(data: InterviewFormData) {
  try {
    const user = await requireUser();

    // Verify job belongs to user
    const job = await prisma.job.findFirst({
      where: { id: data.jobId, userId: user.id },
      select: { id: true, statusId: true },
    });

    if (!job) {
      throw new Error("Job not found or unauthorized");
    }

    const interview = await prisma.interview.create({
      data: {
        jobId: data.jobId,
        round: data.round,
        interviewDate: new Date(data.interviewDate),
        location: data.location || null,
        status: data.status || "scheduled",
        notes: data.notes || null,
        feedback: data.feedback || null,
        createdAt: new Date(),
        ...(data.interviewerName
          ? {
              interviewers: {
                create: {
                  name: data.interviewerName,
                  email: data.interviewerEmail || "",
                  createdAt: new Date(),
                  createdBy: user.id,
                },
              },
            }
          : {}),
      },
      include: {
        interviewers: true,
      },
    });

    // Also auto-update job status to 'interview' if it's currently draft or applied
    const interviewStatus = await prisma.jobStatus.findUnique({
      where: { value: "interview" },
    });
    if (interviewStatus) {
      await prisma.job.update({
        where: { id: data.jobId },
        data: { statusId: interviewStatus.id },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/myjobs/${data.jobId}`);
    revalidatePath("/dashboard/myjobs");

    return { success: true, data: interview };
  } catch (error) {
    return handleError(error, "Failed to create interview round.");
  }
}

export async function updateInterviewRound(interviewId: string, data: Partial<InterviewFormData>) {
  try {
    const user = await requireUser();

    // Verify interview belongs to user's job
    const existing = await prisma.interview.findFirst({
      where: { id: interviewId, job: { userId: user.id } },
      select: { id: true, jobId: true },
    });

    if (!existing) {
      throw new Error("Interview not found or unauthorized");
    }

    const updated = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        round: data.round,
        ...(data.interviewDate ? { interviewDate: new Date(data.interviewDate) } : {}),
        location: data.location,
        status: data.status,
        notes: data.notes,
        feedback: data.feedback,
        updatedAt: new Date(),
      },
      include: {
        interviewers: true,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/myjobs/${existing.jobId}`);
    revalidatePath("/dashboard/myjobs");

    return { success: true, data: updated };
  } catch (error) {
    return handleError(error, "Failed to update interview round.");
  }
}

export async function deleteInterviewRound(interviewId: string) {
  try {
    const user = await requireUser();

    const existing = await prisma.interview.findFirst({
      where: { id: interviewId, job: { userId: user.id } },
      select: { id: true, jobId: true },
    });

    if (!existing) {
      throw new Error("Interview not found or unauthorized");
    }

    await prisma.interview.delete({
      where: { id: interviewId },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/myjobs/${existing.jobId}`);
    revalidatePath("/dashboard/myjobs");

    return { success: true };
  } catch (error) {
    return handleError(error, "Failed to delete interview round.");
  }
}

export async function getJobInterviews(jobId: string) {
  try {
    const user = await requireUser();

    const interviews = await prisma.interview.findMany({
      where: {
        jobId,
        job: { userId: user.id },
      },
      include: {
        interviewers: true,
      },
      orderBy: { interviewDate: "asc" },
    });

    return { success: true, data: interviews };
  } catch (error) {
    return handleError(error, "Failed to fetch interviews.");
  }
}

export async function updateJobFollowUp(
  jobId: string,
  followUpDate: Date | null,
  followUpNotes?: string | null,
) {
  try {
    const user = await requireUser();

    const job = await prisma.job.update({
      where: { id: jobId, userId: user.id },
      data: {
        followUpDate,
        followUpNotes,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/myjobs/${jobId}`);
    revalidatePath("/dashboard/myjobs");

    return { success: true, data: job };
  } catch (error) {
    return handleError(error, "Failed to update follow-up date.");
  }
}
