"use client";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "../ui/card";
import { ResponsiveCardHeader } from "../ResponsiveCardHeader";
import { getActivityTypeList } from "@/actions/activity.actions";
import { APP_CONSTANTS } from "@/lib/constants";
import { Activity } from "lucide-react";
import Loading from "../Loading";
import { Button } from "../ui/button";
import { RecordsCount } from "../RecordsCount";
import ActivityTypesTable from "./ActivityTypesTable";
import AddActivityType from "./AddActivityType";

function ActivityTypesContainer() {
  const [activityTypes, setActivityTypes] = useState<any[]>([]);
  const [totalActivityTypes, setTotalActivityTypes] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const loadActivityTypes = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const { data, total } = await getActivityTypeList(page, APP_CONSTANTS.RECORDS_PER_PAGE);
        if (data) {
          setActivityTypes((prev) => (page === 1 ? data : [...prev, ...data]));
          setTotalActivityTypes(total);
          setPage(page);
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reloadActivityTypes = useCallback(async () => {
    await loadActivityTypes(1);
  }, [loadActivityTypes]);

  useEffect(() => {
    (async () => await loadActivityTypes(1))();
  }, [loadActivityTypes]);

  return (
    <>
      <div className="col-span-3">
        <Card>
          <ResponsiveCardHeader>
            <div className="flex items-baseline gap-2">
              <CardTitle>Activity Types / Projects</CardTitle>
              {!loading && totalActivityTypes > 0 && (
                <RecordsCount count={activityTypes.length} total={totalActivityTypes} label="activity types" />
              )}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
              <AddActivityType reloadActivityTypes={reloadActivityTypes} />
            </div>
          </ResponsiveCardHeader>
          <CardContent>
            {loading && <Loading />}
            {!loading && activityTypes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-3">
                <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                  <Activity className="h-6 w-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-base font-semibold text-foreground">No activity types added yet</h3>
                  <p className="text-xs text-muted-foreground">
                    Activity types used to track time and effort on applications will appear here.
                  </p>
                </div>
              </div>
            )}
            {activityTypes.length > 0 && (
              <>
                <ActivityTypesTable
                  activityTypes={activityTypes}
                  reloadActivityTypes={reloadActivityTypes}
                />
              </>
            )}
            {activityTypes.length < totalActivityTypes && (
              <div className="flex justify-center p-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadActivityTypes(page + 1)}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default ActivityTypesContainer;
