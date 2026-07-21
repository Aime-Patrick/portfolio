import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;
// Contributions change slowly; cache for an hour on the server.
export const revalidate = 3600;

const GITHUB_USER_FALLBACK = "Aime-Patrick";

type ContributionDay = { date: string; value: number };

type ContributionsPayload = {
  username: string;
  total: number;
  days: ContributionDay[];
  source: "github-graphql" | "public-api";
};

/** GitHub GraphQL (needs GITHUB_TOKEN) — exact same data as the profile graph. */
async function fetchFromGraphql(
  username: string,
  token: string
): Promise<ContributionsPayload> {
  const query = `
    query ($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: username } }),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL responded ${response.status}`);
  }

  const json = (await response.json()) as {
    data?: {
      user?: {
        contributionsCollection?: {
          contributionCalendar?: {
            totalContributions?: number;
            weeks?: { contributionDays?: { date: string; contributionCount: number }[] }[];
          };
        };
      };
    };
    errors?: { message: string }[];
  };

  const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    throw new Error(json.errors?.[0]?.message || "No contribution data returned");
  }

  const days: ContributionDay[] = (calendar.weeks ?? []).flatMap((week) =>
    (week.contributionDays ?? []).map((day) => ({
      date: day.date,
      value: day.contributionCount,
    }))
  );

  return {
    username,
    total: calendar.totalContributions ?? days.reduce((s, d) => s + d.value, 0),
    days,
    source: "github-graphql",
  };
}

/** Tokenless fallback: community API that scrapes the public contribution graph. */
async function fetchFromPublicApi(username: string): Promise<ContributionsPayload> {
  const year = new Date().getFullYear();
  const response = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=${year}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error(`Public contributions API responded ${response.status}`);
  }

  const json = (await response.json()) as {
    total?: Record<string, number>;
    contributions?: { date: string; count: number }[];
  };

  const days: ContributionDay[] = (json.contributions ?? []).map((c) => ({
    date: c.date,
    value: c.count,
  }));

  return {
    username,
    total: json.total?.[String(year)] ?? days.reduce((s, d) => s + d.value, 0),
    days,
    source: "public-api",
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const username =
    url.searchParams.get("user")?.trim() ||
    process.env.GITHUB_USERNAME ||
    GITHUB_USER_FALLBACK;

  // Usernames: alphanumerics and hyphens only — reject anything else.
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  try {
    const token = process.env.GITHUB_TOKEN;
    const payload = token
      ? await fetchFromGraphql(username, token).catch(() =>
          fetchFromPublicApi(username)
        )
      : await fetchFromPublicApi(username);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[github/contributions]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load contributions",
      },
      { status: 502 }
    );
  }
}
