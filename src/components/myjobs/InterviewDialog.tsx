"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, MapPin, User, FileText, CheckCircle2, Video } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addInterviewRound, updateInterviewRound } from "@/actions/interview.actions";
import { toastSuccess, toastError } from "@/lib/toast";

const ROUND_PRESETS = [
  "HR / Recruiter Screening",
  "Technical Screen",
  "Coding & Problem Solving",
  "System Design",
  "Behavioral & Values Fit",
  "Hiring Manager Round",
  "Take-Home Presentation",
  "Final Executive Round",
  "Other",
];

interface InterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  interviewToEdit?: any | null;
  onSaved: () => void;
}

export function InterviewDialog({
  open,
  onOpenChange,
  jobId,
  interviewToEdit,
  onSaved,
}: InterviewDialogProps) {
  const [round, setRound] = useState("HR / Recruiter Screening");
  const [customRound, setCustomRound] = useState("");
  const [dateStr, setDateStr] = useState(format(new Date(), "yyyy-MM-dd"));
  const [timeStr, setTimeStr] = useState("14:00");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [interviewerName, setInterviewerName] = useState("");
  const [interviewerEmail, setInterviewerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (interviewToEdit) {
      const isPreset = ROUND_PRESETS.includes(interviewToEdit.round || "");
      setRound(isPreset ? interviewToEdit.round : "Other");
      setCustomRound(isPreset ? "" : interviewToEdit.round || "");
      
      const d = interviewToEdit.interviewDate ? new Date(interviewToEdit.interviewDate) : new Date();
      setDateStr(format(d, "yyyy-MM-dd"));
      setTimeStr(format(d, "HH:mm"));

      setLocation(interviewToEdit.location || "");
      setStatus(interviewToEdit.status || "scheduled");
      setNotes(interviewToEdit.notes || "");
      setFeedback(interviewToEdit.feedback || "");

      if (interviewToEdit.interviewers && interviewToEdit.interviewers.length > 0) {
        setInterviewerName(interviewToEdit.interviewers[0].name || "");
        setInterviewerEmail(interviewToEdit.interviewers[0].email || "");
      } else {
        setInterviewerName("");
        setInterviewerEmail("");
      }
    } else {
      setRound("HR / Recruiter Screening");
      setCustomRound("");
      setDateStr(format(new Date(), "yyyy-MM-dd"));
      setTimeStr("14:00");
      setLocation("");
      setStatus("scheduled");
      setInterviewerName("");
      setInterviewerEmail("");
      setNotes("");
      setFeedback("");
    }
  }, [interviewToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalRound = round === "Other" && customRound.trim() ? customRound.trim() : round;
      const combinedDate = new Date(`${dateStr}T${timeStr}:00`);

      if (isNaN(combinedDate.getTime())) {
        throw new Error("Invalid interview date or time selected.");
      }

      if (interviewToEdit?.id) {
        const res = await updateInterviewRound(interviewToEdit.id, {
          round: finalRound,
          interviewDate: combinedDate,
          location: location.trim() || null,
          status,
          notes: notes.trim() || null,
          feedback: feedback.trim() || null,
        });

        if (!res.success) {
          const errorMsg = ("message" in res && res.message) ? res.message : "Failed to update interview.";
          throw new Error(errorMsg);
        }
        toastSuccess("Interview round updated!");
      } else {
        const res = await addInterviewRound({
          jobId,
          round: finalRound,
          interviewDate: combinedDate,
          location: location.trim() || null,
          status,
          notes: notes.trim() || null,
          feedback: feedback.trim() || null,
          interviewerName: interviewerName.trim() || null,
          interviewerEmail: interviewerEmail.trim() || null,
        });

        if (!res.success) {
          const errorMsg = ("message" in res && res.message) ? res.message : "Failed to schedule interview.";
          throw new Error(errorMsg);
        }
        toastSuccess("Interview round scheduled!");
      }

      onOpenChange(false);
      onSaved();
    } catch (err: any) {
      toastError(err?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5 text-purple-600" />
            {interviewToEdit ? "Edit Interview Round" : "Schedule Interview Round"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Log interview stages, meeting links, notes, and debrief feedback.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Round selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Interview Stage / Round</Label>
            <Select value={round} onValueChange={setRound}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select interview round" />
              </SelectTrigger>
              <SelectContent>
                {ROUND_PRESETS.map((p) => (
                  <SelectItem key={p} value={p} className="text-xs">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {round === "Other" && (
              <Input
                placeholder="Specify round name..."
                value={customRound}
                onChange={(e) => setCustomRound(e.target.value)}
                className="h-8 text-xs mt-1.5"
                required
              />
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <CalendarIcon className="h-3 w-3 text-muted-foreground" /> Date
              </Label>
              <Input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" /> Time
              </Label>
              <Input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
          </div>

          {/* Location & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Video className="h-3 w-3 text-muted-foreground" /> Meeting Link / Location
              </Label>
              <Input
                placeholder="e.g. Zoom, Google Meet, or Address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-muted-foreground" /> Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Interviewer Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <User className="h-3 w-3 text-muted-foreground" /> Interviewer Name (Optional)
              </Label>
              <Input
                placeholder="e.g. Sarah Connor"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Interviewer Email (Optional)</Label>
              <Input
                type="email"
                placeholder="e.g. sarah@company.com"
                value={interviewerEmail}
                onChange={(e) => setInterviewerEmail(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Preparation Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <FileText className="h-3 w-3 text-muted-foreground" /> Preparation Notes &amp; Questions to Ask
            </Label>
            <Textarea
              placeholder="Key project examples to discuss, talking points, questions for interviewers..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs min-h-[60px]"
            />
          </div>

          {/* Feedback & Impressions */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              Post-Interview Debrief / Impressions
            </Label>
            <Textarea
              placeholder="How did it go? Technical questions asked, compensation mentioned, next steps..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="text-xs min-h-[60px]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Saving..." : interviewToEdit ? "Update Round" : "Save Round"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
