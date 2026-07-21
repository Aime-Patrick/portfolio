"use client";

import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import {
  CalendarHeatmap,
  CalendarHeatmapBlock,
  CalendarHeatmapBody,
  CalendarHeatmapFooter,
  CalendarHeatmapLegend,
  CalendarHeatmapStat,
  type Activity,
} from "@/components/heatmap/calendar-heatmap";

type ContributionsResponse = {
  username: string;
  total: number;
  days: Activity[];
};

/** Extract "Aime-Patrick" from a GitHub profile URL. */
export function githubUsernameFromUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/github\.com\/([A-Za-z0-9-]{1,39})/i);
  return match?.[1] ?? null;
}

export default function GithubActivity({
  username,
  profileUrl,
}: {
  username?: string;
  profileUrl?: string;
}) {
  const [data, setData] = useState<ContributionsResponse | null>(null);
  const [failed, setFailed] = useState(false);

  const user = username || githubUsernameFromUrl(profileUrl) || undefined;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const query = user ? `?user=${encodeURIComponent(user)}` : "";
        const res = await fetch(`/api/github/contributions${query}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ContributionsResponse;
        if (!cancelled) setData(json);
      } catch (error) {
        console.error("Error loading GitHub contributions:", error);
        if (!cancelled) setFailed(true);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Fail quiet: the About page should not show a broken block.
  if (failed) return null;

  return (
    <div className="mb-8" data-about-reveal>
      <div className="mb-2 flex items-center gap-2">
        <FaGithub className="about-accent text-lg" />
        <h3 className="font-bold text-[var(--title-color)] text-xl">
          GitHub Activity
        </h3>
      </div>
      <p className="mb-3 text-sm text-[var(--text-color)]">
        Real contribution history, straight from GitHub.
      </p>
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--body-color)] transition-colors hover:border-[hsl(18,100%,48%)]">
        {data ? (
          <CalendarHeatmap
            data={data.days}
            totalCount={data.total}
            singleRow
            blockSize={10}
            blockMargin={3}
            fontSize={12}
            colors={{
              empty: "var(--container-color)",
              scale: "hsl(18, 100%, 48%)",
            }}
            className="w-full text-[var(--text-color)]"
          >
            <CalendarHeatmapBody
              hideYearLabels
              className="py-1"
              labelClassName="fill-[var(--text-muted)]"
            >
              {({ activity, dayIndex, weekIndex }) => (
                <CalendarHeatmapBlock
                  activity={activity}
                  dayIndex={dayIndex}
                  weekIndex={weekIndex}
                />
              )}
            </CalendarHeatmapBody>
            <CalendarHeatmapFooter className="items-center text-xs text-[var(--text-muted)]">
              <CalendarHeatmapStat label="{{value}} contributions in {{year}}" />
              <CalendarHeatmapLegend />
            </CalendarHeatmapFooter>
          </CalendarHeatmap>
        ) : (
          <div className="flex h-32 items-center justify-center p-4">
            <span className="text-sm text-[var(--text-muted)]">
              Loading GitHub activity…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
