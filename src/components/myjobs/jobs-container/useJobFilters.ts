"use client";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Company, JobLocation, JobSource, JobTitle, JOB_TYPES } from "@/models/job.model";

export function useJobFilters({
  companies,
  titles,
  locations,
  sources,
}: {
  companies: Company[];
  titles: JobTitle[];
  locations: JobLocation[];
  sources: JobSource[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const queryParams = useSearchParams();

  const [companyFilter, setCompanyFilter] = useState<string | null>(
    queryParams.get("company"),
  );
  const [titleFilter, setTitleFilter] = useState<string | null>(
    queryParams.get("title"),
  );
  const [locationFilter, setLocationFilter] = useState<string | null>(
    queryParams.get("location"),
  );
  const [sourceFilter, setSourceFilter] = useState<string | null>(
    queryParams.get("source"),
  );
  const [appliedFilter, setAppliedFilter] = useState(
    queryParams.get("applied") === "true",
  );
  const [jobTypeFilter, setJobTypeFilter] = useState<string | null>(
    queryParams.get("jobType"),
  );
  const [urgencyFilter, setUrgencyFilter] = useState<string | null>(
    queryParams.get("urgency"),
  );
  const [sortBy, setSortBy] = useState<string>(
    queryParams.get("sortBy") || "newest",
  );

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const current = new URLSearchParams(queryParams ? Array.from(queryParams.entries()) : []);
      if (value === null || value === "" || value === "all" || value === "newest") {
        current.delete(key);
      } else {
        current.set(key, value);
      }
      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`);
    },
    [pathname, queryParams, router],
  );

  const companyLabel = companyFilter
    ? companies.find((c) => c.value === companyFilter)?.label
    : null;

  const titleLabel = titleFilter
    ? titles.find((t) => t.value === titleFilter)?.label
    : null;

  const locationLabel = locationFilter
    ? locations.find((l) => l.value === locationFilter)?.label
    : null;

  const sourceLabel = sourceFilter
    ? sources.find((s) => s.value === sourceFilter)?.label
    : null;

  const jobTypeLabel = jobTypeFilter
    ? (JOB_TYPES as Record<string, string>)[jobTypeFilter] || jobTypeFilter
    : null;

  const clearCompanyFilter = () => {
    setCompanyFilter(null);
    updateParam("company", null);
  };

  const clearTitleFilter = () => {
    setTitleFilter(null);
    updateParam("title", null);
  };

  const clearLocationFilter = () => {
    setLocationFilter(null);
    updateParam("location", null);
  };

  const clearSourceFilter = () => {
    setSourceFilter(null);
    updateParam("source", null);
  };

  const clearJobTypeFilter = () => {
    setJobTypeFilter(null);
    updateParam("jobType", null);
  };

  const clearUrgencyFilter = () => {
    setUrgencyFilter(null);
    updateParam("urgency", null);
  };

  const onSelectJobType = (val: string) => {
    const nextVal = val === "all" ? null : val;
    setJobTypeFilter(nextVal);
    updateParam("jobType", nextVal);
  };

  const onSelectUrgency = (val: string) => {
    const nextVal = val === "all" ? null : val;
    setUrgencyFilter(nextVal);
    updateParam("urgency", nextVal);
  };

  const onSelectSortBy = (val: string) => {
    setSortBy(val);
    updateParam("sortBy", val);
  };

  const clearAllFilters = () => {
    setCompanyFilter(null);
    setTitleFilter(null);
    setLocationFilter(null);
    setSourceFilter(null);
    setAppliedFilter(false);
    setJobTypeFilter(null);
    setUrgencyFilter(null);
    setSortBy("newest");
    router.push(pathname);
  };

  useEffect(() => {
    const cp = queryParams.get("company");
    const tp = queryParams.get("title");
    const lp = queryParams.get("location");
    const sp = queryParams.get("source");
    const ap = queryParams.get("applied") === "true";
    const jt = queryParams.get("jobType");
    const urg = queryParams.get("urgency");
    const sort = queryParams.get("sortBy") || "newest";

    setCompanyFilter(cp);
    setTitleFilter(tp);
    setLocationFilter(lp);
    setSourceFilter(sp);
    setAppliedFilter(ap);
    setJobTypeFilter(jt);
    setUrgencyFilter(urg);
    setSortBy(sort);
  }, [queryParams]);

  const hasActiveFilters =
    Boolean(companyFilter) ||
    Boolean(titleFilter) ||
    Boolean(locationFilter) ||
    Boolean(sourceFilter) ||
    Boolean(appliedFilter) ||
    Boolean(jobTypeFilter) ||
    Boolean(urgencyFilter) ||
    sortBy !== "newest";

  return {
    queryParams,
    companyFilter,
    titleFilter,
    locationFilter,
    sourceFilter,
    appliedFilter,
    jobTypeFilter,
    urgencyFilter,
    sortBy,
    companyLabel,
    titleLabel,
    locationLabel,
    sourceLabel,
    jobTypeLabel,
    hasActiveFilters,
    clearCompanyFilter,
    clearTitleFilter,
    clearLocationFilter,
    clearSourceFilter,
    clearJobTypeFilter,
    clearUrgencyFilter,
    clearAllFilters,
    onSelectJobType,
    onSelectUrgency,
    onSelectSortBy,
  };
}
