"use client";
import { useState } from "react";
import { ResponsiveCalendar } from "@nivo/calendar";
import { format, parseISO } from "date-fns";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
export default function ActivityCalendar({
  years,
  dataByYear,
}: {
  years: string[];
  dataByYear: Record<string, any[]>;
}) {
  const { resolvedTheme } = useTheme();
  const currentYearStr = String(new Date().getFullYear());
  const displayYears = years.length > 0 ? years : [currentYearStr];
  const [selectedYear, setSelectedYear] = useState<string>(
    years.at(-1) ?? currentYearStr,
  );
  const activeYear = selectedYear || currentYearStr;

  const borderColor = resolvedTheme === "light" ? "#ffffff" : "#0e1117";
  const data = dataByYear[activeYear] ?? [];
  const hoursMap = Object.fromEntries(
    data.map((d) => [d.day, d.hours ?? 0]),
  );
  return (
    <Card className="w-[100%]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-green-600">Activity Calendar</CardTitle>
          <Select value={activeYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]" aria-label="Select year">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {displayYears.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="h-[200px]">
        <ResponsiveCalendar
          data={data}
          from={`${activeYear}-01-01`}
          to={`${activeYear}-12-31`}
          emptyColor={resolvedTheme === "light" ? "#eeeeee" : "#30363d"}
          colors={["#90e0ef", "#48cae4", "#00b4d8", "#0096c7", "#0077b6"]}
          minValue={2}
          margin={{ top: 20, right: 0, bottom: 20, left: 0 }}
          yearSpacing={40}
          monthBorderColor={borderColor}
          dayBorderWidth={2}
          dayBorderColor={borderColor}
          tooltip={(day) => {
            const hours = hoursMap[day.day] ?? 0;
            return (
              <div
                style={{
                  background: "#1e293b",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                }}
              >
                <div><strong>{format(parseISO(day.day), "EEE MMM d, yyyy")}</strong></div>
                <div>{day.value} job{Number(day.value) === 1 ? "" : "s"} applied</div>
                <div>{hours} hr{hours === 1 ? "" : "s"} activity</div>
              </div>
            );
          }}
          theme={{
            text: {
              fill: "#9ca3af",
            },
            tooltip: {
              container: {
                background: "#1e293b",
                color: "#fff",
              },
            },
          }}
          legends={[
            {
              anchor: "bottom-right",
              direction: "row",
              translateY: 36,
              itemCount: 4,
              itemWidth: 42,
              itemHeight: 36,
              itemsSpacing: 14,
              itemDirection: "right-to-left",
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
