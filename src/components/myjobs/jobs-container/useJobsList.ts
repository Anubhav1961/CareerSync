"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getJobsList } from "@/actions/job.actions";
import { toastError } from "@/lib/toast";
import { JobResponse, JobsViewMode } from "@/models/job.model";
import { APP_CONSTANTS } from "@/lib/constants";
import {
  getFromLocalStorage,
  saveToLocalStorage,
} from "@/utils/localstorage.utils";
import { useAgentChat } from "@/components/agent/AgentChatProvider";

export function useJobsList({
  companyFilter,
  appliedFilter,
  titleFilter,
  locationFilter,
  sourceFilter,
  jobTypeFilter,
  urgencyFilter,
  sortBy = "newest",
}: {
  companyFilter: string | null;
  appliedFilter: boolean;
  titleFilter: string | null;
  locationFilter: string | null;
  sourceFilter: string | null;
  jobTypeFilter?: string | null;
  urgencyFilter?: string | null;
  sortBy?: string;
}) {
  const { jobWrites } = useAgentChat();
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [viewMode, setViewMode] = useState<JobsViewMode>("table");
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [filterKey, setFilterKey] = useState<string>("none");
  const [searchTerm, setSearchTerm] = useState("");
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const hasSearched = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = getFromLocalStorage(
      APP_CONSTANTS.JOBS_VIEW_MODE_STORAGE_KEY,
      null,
    );
    if (saved === "cards" || saved === "table") setViewMode(saved);
  }, []);

  const onChangeViewMode = (mode: JobsViewMode) => {
    setViewMode(mode);
    saveToLocalStorage(APP_CONSTANTS.JOBS_VIEW_MODE_STORAGE_KEY, mode);
  };

  const jobsPerPage = APP_CONSTANTS.RECORDS_PER_PAGE;

  const loadJobs = useCallback(
    async (page: number, filter?: string, search?: string) => {
      if (page === 1) setInitialLoading(true);
      else setLoadingMore(true);
      const { success, data, total, message } = await getJobsList(
        page,
        jobsPerPage,
        filter && filter !== "none" ? filter : undefined,
        search,
        companyFilter || undefined,
        appliedFilter || undefined,
        titleFilter || undefined,
        locationFilter || undefined,
        sourceFilter || undefined,
        jobTypeFilter || undefined,
        urgencyFilter || undefined,
        sortBy || "newest",
      );
      if (success && data) {
        setJobs((prev) => (page === 1 ? data : [...prev, ...data]));
        setTotalJobs(total);
        setPage(page);
      } else {
        toastError(message);
      }
      setInitialLoading(false);
      setLoadingMore(false);
    },
    [
      jobsPerPage,
      companyFilter,
      appliedFilter,
      titleFilter,
      locationFilter,
      sourceFilter,
      jobTypeFilter,
      urgencyFilter,
      sortBy,
    ],
  );

  const reloadJobs = useCallback(async () => {
    await loadJobs(1, filterKey !== "none" ? filterKey : undefined, searchTerm || undefined);
  }, [loadJobs, filterKey, searchTerm]);

  // Load when any filter or sort order changes
  useEffect(() => {
    void loadJobs(1, filterKey !== "none" ? filterKey : undefined, searchTerm || undefined);
  }, [loadJobs, filterKey, companyFilter, appliedFilter, titleFilter, locationFilter, sourceFilter, jobTypeFilter, urgencyFilter, sortBy]);

  // The agent saves the job server-side
  useEffect(() => {
    if (jobWrites === 0) return;
    void reloadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobWrites]);

  // Search input debouncer
  useEffect(() => {
    if (searchTerm !== "") {
      hasSearched.current = true;
    }
    if (searchTerm === "" && !hasSearched.current) return;

    const timer = setTimeout(() => {
      loadJobs(1, filterKey !== "none" ? filterKey : undefined, searchTerm || undefined);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !initialLoading &&
          !loadingMore &&
          jobs.length < totalJobs
        ) {
          loadJobs(page + 1, filterKey !== "none" ? filterKey : undefined, searchTerm || undefined);
        }
      },
      { threshold: APP_CONSTANTS.INTERSECTION_OBSERVER_THRESHOLD },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    jobs.length,
    totalJobs,
    page,
    filterKey,
    searchTerm,
    initialLoading,
    loadingMore,
    loadJobs,
  ]);

  const onFilterChange = (filterBy: string) => {
    setFilterKey(filterBy);
    loadJobs(1, filterBy !== "none" ? filterBy : undefined, searchTerm || undefined);
  };

  return {
    jobs,
    viewMode,
    onChangeViewMode,
    page,
    totalJobs,
    filterKey,
    searchTerm,
    setSearchTerm,
    initialLoading,
    loadingMore,
    loadJobs,
    reloadJobs,
    onFilterChange,
    sentinelRef,
  };
}
