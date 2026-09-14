"use client";

import { useState } from "react";
import { format, addDays, isPast, isToday } from "date-fns";
import {
  BellRing,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Save,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateJobFollowUp } from "@/actions/interview.actions";
import { toastSuccess, toastError } from "@/lib/toast";

interface FollowUpManagerProps {
  jobId: string;
  initialDate?: Date | null;
  initialNotes?: string | null;
  onRefresh?: () => void;
}

export function FollowUpManager({
  jobId,
  initialDate,
  initialNotes,
  onRefresh,
}: FollowUpManagerProps) {
  const [isEditing, setIsEditing] = useState(!initialDate);
  const [dateStr, setDateStr] = useState(
    initialDate ? format(new Date(initialDate), "yyyy-MM-dd") : format(addDays(new Date(), 7), "yyyy-MM-dd")
  );
  const [notes, setNotes] = useState(initialNotes || "");
  const [loading, setLoading] = useState(false);

  const isOverdue = initialDate && isPast(new Date(initialDate)) && !isToday(new Date(initialDate));
  const isDueToday = initialDate && isToday(new Date(initialDate));

  const handleSave = async () => {
    setLoading(true);
    try {
      const targetDate = new Date(`${dateStr}T09:00:00`);
      const res = await updateJobFollowUp(jobId, targetDate, notes.trim() || null);
      if (!res.success) {
        const errorMsg = ("message" in res && res.message) ? res.message : "Failed to update follow-up";
        throw new Error(errorMsg);
      }
      toastSuccess("Follow-up reminder set!");
      setIsEditing(false);
      onRefresh?.();
    } catch (err: any) {
      toastError(err?.message || "Failed to save follow-up");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    try {
      const res = await updateJobFollowUp(jobId, null, null);
      if (!res.success) {
        const errorMsg = ("message" in res && res.message) ? res.message : "Failed to clear follow-up";
        throw new Error(errorMsg);
      }
      toastSuccess("Follow-up marked as completed!");
      setIsEditing(false);
      onRefresh?.();
    } catch (err: any) {
      toastError(err?.message || "Failed to clear follow-up");
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (days: number) => {
    setDateStr(format(addDays(new Date(), days), "yyyy-MM-dd"));
  };

  return (
    <Card className="border shadow-xs bg-card/60">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-md ${
              isOverdue
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : isDueToday
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            }`}
          >
            <BellRing className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-semibold">Follow-Up &amp; Outreach Tracker</CardTitle>
          {initialDate && !isEditing && (
            isOverdue ? (
              <Badge variant="destructive" className="text-[10px] gap-1">
                <AlertCircle className="h-3 w-3" /> Overdue
              </Badge>
            ) : isDueToday ? (
              <Badge variant="secondary" className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Due Today
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px]">
                Scheduled
              </Badge>
            )
          )}
        </div>

        {initialDate && !isEditing && (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              disabled={loading}
              className="h-7 text-xs gap-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Mark Resolved
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-7 w-7"
              title="Edit follow-up"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="px-4 pb-3 pt-0">
        {initialDate && !isEditing ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium text-foreground">
                Follow up date: <strong>{format(new Date(initialDate), "EEEE, MMMM d, yyyy")}</strong>
              </span>
            </div>
            {initialNotes && (
              <p className="text-xs text-muted-foreground italic bg-muted/40 p-2 rounded border border-border/40">
                &ldquo;{initialNotes}&rdquo;
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="h-8 text-xs w-[160px]"
              />
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span>Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset(3)}
                  className="px-1.5 py-0.5 rounded border hover:bg-muted transition-colors text-foreground"
                >
                  +3d
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(7)}
                  className="px-1.5 py-0.5 rounded border hover:bg-muted transition-colors text-foreground"
                >
                  +1 week
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(14)}
                  className="px-1.5 py-0.5 rounded border hover:bg-muted transition-colors text-foreground"
                >
                  +2 weeks
                </button>
              </div>
            </div>

            <Input
              placeholder="e.g. Follow up on status, send thank-you email..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-8 text-xs"
            />

            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSave} disabled={loading} className="h-7 text-xs gap-1">
                <Save className="h-3.5 w-3.5" />
                Save Reminder
              </Button>
              {initialDate && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
