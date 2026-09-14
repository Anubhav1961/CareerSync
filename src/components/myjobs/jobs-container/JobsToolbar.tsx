"use client";

import {
  File,
  ListFilter,
  RefreshCw,
  X,
  Search,
  GraduationCap,
  BellRing,
  CalendarCheck,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { RecordsCount } from "../../RecordsCount";
import { JobsViewToggle } from "../JobsViewToggle";
import { AddJob } from "../AddJob";
import {
  Company,
  JobLocation,
  JobResponse,
  JobSource,
  JobStatus,
  JobsViewMode,
  JobTitle,
  Tag,
  JOB_TYPES,
} from "@/models/job.model";

export function JobsToolbar({
  jobsCount,
  totalJobs,
  initialLoading,
  viewMode,
  onChangeViewMode,
  companyLabel,
  onClearCompanyFilter,
  titleLabel,
  onClearTitleFilter,
  locationLabel,
  onClearLocationFilter,
  sourceLabel,
  onClearSourceFilter,
  jobTypeFilter,
  onSelectJobType,
  urgencyFilter,
  onSelectUrgency,
  sortBy,
  onSelectSortBy,
  hasActiveFilters,
  onClearAllFilters,
  onReload,
  searchTerm,
  onSearchTermChange,
  filterKey,
  onFilterChange,
  onDownload,
  statuses,
  companies,
  titles,
  locations,
  sources,
  tags,
  editJob,
  resetEditJob,
  addJobInitialOpen,
}: {
  jobsCount: number;
  totalJobs: number;
  initialLoading: boolean;
  viewMode: JobsViewMode;
  onChangeViewMode: (mode: JobsViewMode) => void;
  companyLabel?: string | null;
  onClearCompanyFilter: () => void;
  titleLabel?: string | null;
  onClearTitleFilter: () => void;
  locationLabel?: string | null;
  onClearLocationFilter: () => void;
  sourceLabel?: string | null;
  onClearSourceFilter: () => void;
  jobTypeFilter?: string | null;
  onSelectJobType: (type: string) => void;
  urgencyFilter?: string | null;
  onSelectUrgency: (urg: string) => void;
  sortBy: string;
  onSelectSortBy: (sort: string) => void;
  hasActiveFilters: boolean;
  onClearAllFilters: () => void;
  onReload: () => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  filterKey: string;
  onFilterChange: (filterBy: string) => void;
  onDownload: () => void;
  statuses: JobStatus[];
  companies: Company[];
  titles: JobTitle[];
  locations: JobLocation[];
  sources: JobSource[];
  tags: Tag[];
  editJob: JobResponse | null;
  resetEditJob: () => void;
  addJobInitialOpen: boolean;
}) {
  return (
    <CardHeader className="flex flex-col gap-3 pb-3">
      {/* Top Header Row: Title, Record Count, View Toggle, Export, Add Job */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <CardTitle className="text-xl font-bold tracking-tight">
            Applications &amp; Internships
          </CardTitle>
          {!initialLoading && totalJobs > 0 && (
            <RecordsCount count={jobsCount} total={totalJobs} label="applications" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <JobsViewToggle value={viewMode} onChange={onChangeViewMode} />

          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={initialLoading}
            title="Reload applications"
            onClick={onReload}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${initialLoading ? "animate-spin" : ""}`}
            />
            <span className="sr-only">Reload applications</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-xs"
            disabled={initialLoading}
            onClick={onDownload}
            title="Export CSV"
          >
            <File className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <AddJob
            jobStatuses={statuses}
            companies={companies}
            jobTitles={titles}
            locations={locations}
            jobSources={sources}
            tags={tags}
            editJob={editJob}
            resetEditJob={resetEditJob}
            initialOpen={addJobInitialOpen}
          />
        </div>
      </div>

      {/* Second Row: Multi-faceted Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 pt-1">
        {/* Full-text search input */}
        <div className="relative sm:col-span-2 lg:col-span-4">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Search company, title, notes, tags..."
            className="h-8 pl-8 pr-8 text-xs bg-background"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchTermChange("")}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Role Type Filter (Internship, Full-time, etc.) */}
        <div className="sm:col-span-1 lg:col-span-2">
          <Select
            value={jobTypeFilter || "all"}
            onValueChange={onSelectJobType}
          >
            <SelectTrigger className="h-8 text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
                <SelectValue placeholder="All Roles" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="I">🎓 Internships</SelectItem>
              <SelectItem value="FT">Full-time</SelectItem>
              <SelectItem value="PT">Part-time</SelectItem>
              <SelectItem value="C">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-1 lg:col-span-2">
          <Select value={filterKey} onValueChange={onFilterChange}>
            <SelectTrigger className="h-8 text-xs" data-testid="job-filter-select">
              <div className="flex items-center gap-1.5 truncate">
                <ListFilter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-xs">Status Filter</SelectLabel>
                <SelectSeparator />
                <SelectItem value="none">All Statuses</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Urgency Filter (Follow-up / Interview) */}
        <div className="sm:col-span-1 lg:col-span-2">
          <Select
            value={urgencyFilter || "all"}
            onValueChange={onSelectUrgency}
          >
            <SelectTrigger className="h-8 text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <BellRing className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <SelectValue placeholder="Urgency" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activity</SelectItem>
              <SelectItem value="needs-followup">🔔 Needs Follow-up</SelectItem>
              <SelectItem value="has-interview">📅 Has Interview</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="sm:col-span-1 lg:col-span-2">
          <Select value={sortBy} onValueChange={onSelectSortBy}>
            <SelectTrigger className="h-8 text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Sort" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest Added</SelectItem>
              <SelectItem value="oldest">Oldest Added</SelectItem>
              <SelectItem value="applied-recent">Recently Applied</SelectItem>
              <SelectItem value="due-soon">Deadline Soonest</SelectItem>
              <SelectItem value="followup-soon">Follow-up Due</SelectItem>
              <SelectItem value="matchScore">High AI Match</SelectItem>
              <SelectItem value="company">Company (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Third Row: Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-muted-foreground font-medium mr-1">Active filters:</span>

          {jobTypeFilter && (
            <Badge
              variant="secondary"
              className="gap-1 text-[11px] font-medium py-0.5 cursor-pointer hover:bg-muted"
              onClick={() => onSelectJobType("all")}
            >
              Role: {(JOB_TYPES as Record<string, string>)[jobTypeFilter] || jobTypeFilter}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {filterKey && filterKey !== "none" && (
            <Badge
              variant="secondary"
              className="gap-1 text-[11px] font-medium py-0.5 cursor-pointer hover:bg-muted"
              onClick={() => onFilterChange("none")}
            >
              Status: {filterKey}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {urgencyFilter && (
            <Badge
              variant="secondary"
              className="gap-1 text-[11px] font-medium py-0.5 cursor-pointer hover:bg-muted"
              onClick={() => onSelectUrgency("all")}
            >
              {urgencyFilter === "needs-followup" ? "Needs Follow-up" : "Has Interview"}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {companyLabel && (
            <Badge
              variant="secondary"
              className="gap-1 text-[11px] font-medium py-0.5 cursor-pointer hover:bg-muted"
              onClick={onClearCompanyFilter}
            >
              Company: {companyLabel}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {titleLabel && (
            <Badge
              variant="secondary"
              className="gap-1 text-[11px] font-medium py-0.5 cursor-pointer hover:bg-muted"
              onClick={onClearTitleFilter}
            >
              Title: {titleLabel}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {locationLabel && (
            <Badge
              variant="secondary"
              className="gap-1 text-[11px] font-medium py-0.5 cursor-pointer hover:bg-muted"
              onClick={onClearLocationFilter}
            >
              Location: {locationLabel}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {sourceLabel && (
            <Badge
              variant="secondary"
              className="gap-1 text-[11px] font-medium py-0.5 cursor-pointer hover:bg-muted"
              onClick={onClearSourceFilter}
            >
              Source: {sourceLabel}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {sortBy !== "newest" && (
            <Badge
              variant="outline"
              className="gap-1 text-[11px] font-medium py-0.5 cursor-pointer hover:bg-muted"
              onClick={() => onSelectSortBy("newest")}
            >
              Sorted: {sortBy}
              <X className="h-3 w-3" />
            </Badge>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={onClearAllFilters}
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1 ml-1"
          >
            <RotateCcw className="h-3 w-3" />
            Reset all
          </Button>
        </div>
      )}
    </CardHeader>
  );
}
