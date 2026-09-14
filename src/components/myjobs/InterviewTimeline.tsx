"use client";

import { useState } from "react";
import { format, isPast } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  PlusCircle,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InterviewDialog } from "./InterviewDialog";
import { deleteInterviewRound, updateInterviewRound } from "@/actions/interview.actions";
import { toastSuccess, toastError } from "@/lib/toast";

interface InterviewTimelineProps {
  jobId: string;
  interviews?: any[];
  onRefresh?: () => void;
}

export function InterviewTimeline({ jobId, interviews = [], onRefresh }: InterviewTimelineProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAdd = () => {
    setSelectedInterview(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (interview: any) => {
    setSelectedInterview(interview);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this interview round?")) return;
    const res = await deleteInterviewRound(id);
    if (res.success) {
      toastSuccess("Interview round removed");
      onRefresh?.();
    } else {
      const errorMsg = ("message" in res && res.message) ? res.message : "Failed to delete interview round";
      toastError(errorMsg);
    }
  };

  const handleToggleComplete = async (interview: any) => {
    const nextStatus = interview.status === "completed" ? "scheduled" : "completed";
    const res = await updateInterviewRound(interview.id, {
      status: nextStatus,
    });
    if (res.success) {
      toastSuccess(nextStatus === "completed" ? "Round marked as completed!" : "Round marked as scheduled");
      onRefresh?.();
    } else {
      const errorMsg = ("message" in res && res.message) ? res.message : "Failed to update round";
      toastError(errorMsg);
    }
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            Interview Timeline &amp; Stages
          </CardTitle>
          <CardDescription className="text-xs">
            Track multi-round interview stages, technical assessments, and interviewer feedback.
          </CardDescription>
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="gap-1 text-xs h-8">
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Schedule Round</span>
        </Button>
      </CardHeader>

      <CardContent>
        {interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
            <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">No interview rounds scheduled yet</p>
            <p className="text-[11px] text-muted-foreground max-w-sm mt-0.5 mb-3">
              Add your recruiter screens, technical assessments, and hiring manager meetings to keep preparation notes and feedback in one place.
            </p>
            <Button size="sm" variant="outline" onClick={handleOpenAdd} className="text-xs h-7 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              Schedule First Round
            </Button>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {interviews.map((item, idx) => {
              const isCompleted = item.status === "completed";
              const isCancelled = item.status === "cancelled";
              const isPastDate = item.interviewDate && isPast(new Date(item.interviewDate));
              const isExpanded = expandedNotes[item.id];
              const isMeetingLink =
                item.location &&
                (item.location.startsWith("http") ||
                  item.location.toLowerCase().includes("zoom") ||
                  item.location.toLowerCase().includes("meet"));

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline Dot Icon */}
                  <div
                    className={`absolute -left-6 top-1 h-5 w-5 rounded-full border flex items-center justify-center bg-background text-[10px] font-bold ${
                      isCompleted
                        ? "border-emerald-500 text-emerald-600 bg-emerald-500/10"
                        : isCancelled
                        ? "border-rose-500 text-rose-600 bg-rose-500/10"
                        : "border-purple-500 text-purple-600 bg-purple-500/10"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : isCancelled ? (
                      <XCircle className="h-3.5 w-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Round Content Card */}
                  <div className="p-3.5 rounded-lg border bg-card/60 hover:bg-card hover:shadow-xs transition-all space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-foreground">
                            {item.round || `Round ${idx + 1}`}
                          </h4>
                          {isCompleted ? (
                            <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                              Completed
                            </Badge>
                          ) : isCancelled ? (
                            <Badge variant="destructive" className="text-[10px]">
                              Cancelled
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              Scheduled
                            </Badge>
                          )}
                        </div>

                        {/* Date & Time */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-foreground/80">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            {item.interviewDate
                              ? format(new Date(item.interviewDate), "EEEE, MMM d, yyyy · h:mm a")
                              : "Date not set"}
                          </span>

                          {item.location && (
                            <span className="flex items-center gap-1">
                              {isMeetingLink ? (
                                <Video className="h-3.5 w-3.5 text-blue-500" />
                              ) : (
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              {isMeetingLink ? (
                                <a
                                  href={item.location.startsWith("http") ? item.location : `https://${item.location}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-0.5"
                                >
                                  Join Meeting <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              ) : (
                                <span>{item.location}</span>
                              )}
                            </span>
                          )}

                          {item.interviewers && item.interviewers.length > 0 && (
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{item.interviewers[0].name}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleComplete(item)}
                          className="h-7 text-xs px-2"
                          title={isCompleted ? "Mark as Scheduled" : "Mark as Completed"}
                        >
                          {isCompleted ? "Reopen" : "Complete"}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenEdit(item)}
                          className="h-7 w-7"
                          title="Edit round"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          title="Delete round"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Collapsible Notes & Feedback */}
                    {(item.notes || item.feedback) && (
                      <div className="pt-2 border-t border-border/40 space-y-2">
                        <button
                          type="button"
                          onClick={() => toggleNotes(item.id)}
                          className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          {isExpanded ? "Hide notes & feedback" : "Show prep notes & debrief"}
                        </button>

                        {isExpanded && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                            {item.notes && (
                              <div className="p-2 rounded bg-muted/40 border border-border/30 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                  Preparation Notes
                                </span>
                                <p className="whitespace-pre-wrap text-foreground/90 text-[11px]">
                                  {item.notes}
                                </p>
                              </div>
                            )}
                            {item.feedback && (
                              <div className="p-2 rounded bg-muted/40 border border-border/30 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                  Debrief &amp; Feedback
                                </span>
                                <p className="whitespace-pre-wrap text-foreground/90 text-[11px]">
                                  {item.feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <InterviewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        jobId={jobId}
        interviewToEdit={selectedInterview}
        onSaved={() => onRefresh?.()}
      />
    </Card>
  );
}
