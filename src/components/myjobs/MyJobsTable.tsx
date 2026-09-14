"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { StickyNote, BellRing, Calendar, GraduationCap } from "lucide-react";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { useState } from "react";
import { JobResponse, JobStatus } from "@/models/job.model";
import Link from "next/link";
import { DeleteAlertDialog } from "../DeleteAlertDialog";
import { CircularScore } from "@/components/CircularScore";
import { JobStatusBadgeMenu } from "./JobStatusBadgeMenu";
import { TooltipProvider } from "../ui/tooltip";
import { JobActionsMenu } from "./JobActionsMenu";

type MyJobsTableProps = {
  jobs: JobResponse[];
  jobStatuses: JobStatus[];
  deleteJob: (id: string) => void;
  editJob: (id: string) => void;
  onChangeJobStatus: (id: string, status: JobStatus) => void;
  onAddNote: (jobId: string) => void;
};

function MyJobsTable({
  jobs,
  jobStatuses,
  deleteJob,
  editJob,
  onChangeJobStatus,
  onAddNote,
}: MyJobsTableProps) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [jobIdToDelete, setJobIdToDelete] = useState("");

  const onDeleteJob = (jobId: string) => {
    setAlertOpen(true);
    setJobIdToDelete(jobId);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden w-[100px] sm:table-cell">
              <span className="sr-only">Company Logo</span>
            </TableHead>
            <TableHead className="hidden md:table-cell">Date Applied</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Match</TableHead>
            <TableHead className="hidden md:table-cell">Source</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job: JobResponse) => {
            return (
              <TableRow key={job.id}>
                <TableCell className="hidden sm:table-cell">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Company logo"
                    className="rounded-md object-cover h-8 w-8 min-w-8"
                    src={job.Company?.logoUrl || "/images/careersync-logo.svg"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/careersync-logo.svg";
                    }}
                  />
                </TableCell>
                <TableCell className="hidden md:table-cell w-[120px] whitespace-nowrap">
                  {job.appliedDate ? format(job.appliedDate, "PP") : "N/A"}
                </TableCell>
                <TableCell
                  className="font-medium cursor-pointer max-w-[140px] md:max-w-[260px]"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link href={`/dashboard/myjobs/${job?.id}`} className="font-semibold truncate hover:underline">
                        {job.JobTitle?.label}
                      </Link>
                      {job.jobType === "I" && (
                        <Badge variant="outline" className="border-primary/40 text-primary text-[10px] px-1 py-0 h-4 font-medium gap-0.5">
                          <GraduationCap className="h-2.5 w-2.5" />
                          Intern
                        </Badge>
                      )}
                      {(job._count?.Notes ?? 0) > 0 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 shrink-0">
                          <StickyNote className="h-2.5 w-2.5 mr-0.5" />
                          {job._count!.Notes}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {job.followUpDate && (
                        <Badge
                          variant={new Date(job.followUpDate) < new Date() ? "destructive" : "outline"}
                          className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-normal"
                          title={`Follow-up: ${format(new Date(job.followUpDate), "PP")}`}
                        >
                          <BellRing className="h-2.5 w-2.5 mr-1" />
                          {new Date(job.followUpDate) < new Date() ? "Follow-up Overdue" : `Follow up ${format(new Date(job.followUpDate), "MMM d")}`}
                        </Badge>
                      )}
                      {job.Interview && job.Interview.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 shrink-0 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-normal"
                        >
                          <Calendar className="h-2.5 w-2.5 mr-1" />
                          {job.Interview[0].round || "Interview"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium max-w-[100px] md:max-w-[160px]">
                  <span className="block truncate">{job.Company?.label}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell whitespace-nowrap max-w-[120px]">
                  <span className="block truncate">{job.Location?.label}</span>
                </TableCell>
                <TableCell>
                  <JobStatusBadgeMenu
                    job={job}
                    jobStatuses={jobStatuses}
                    onChangeJobStatus={onChangeJobStatus}
                    className="w-[110px] whitespace-nowrap justify-center"
                  />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {job.matchScore != null ? (
                    <CircularScore score={job.matchScore} size="sm" animate={false} />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {job.JobSource?.label}
                </TableCell>
                <TableCell>
                  <JobActionsMenu
                    job={job}
                    jobStatuses={jobStatuses}
                    editJob={editJob}
                    onChangeJobStatus={onChangeJobStatus}
                    onAddNote={onAddNote}
                    onDeleteJob={onDeleteJob}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <DeleteAlertDialog
        pageTitle="job"
        open={alertOpen}
        onOpenChange={setAlertOpen}
        onDelete={() => deleteJob(jobIdToDelete)}
      />
    </TooltipProvider>
  );
}

export default MyJobsTable;
