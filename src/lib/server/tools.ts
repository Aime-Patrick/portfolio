import { tool } from "ai";
import { z } from "zod";
import { getAdminDb } from "./firebaseAdmin";
import type { ChatScope } from "./scopes";

/** Keep tool payloads small so the follow-up LLM call stays fast. */
function compact(data: unknown, maxChars = 4500): unknown {
  try {
    const raw = JSON.stringify(data);
    if (raw.length <= maxChars) return data;
    return {
      truncated: true,
      preview: raw.slice(0, maxChars),
      note: "Result truncated for latency; ask a more specific question if needed.",
    };
  } catch {
    return data;
  }
}

async function safeGetDoc(path: [string, string]) {
  try {
    const snap = await getAdminDb().doc(`${path[0]}/${path[1]}`).get();
    return compact(snap.exists ? snap.data() : null);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to load document",
      hint: "Configure FIREBASE_ADMIN_CONFIG_BASE64 for live data tools.",
    };
  }
}

/** Firestore Timestamp | number | ISO string → epoch millis (0 when unknown). */
function toMillis(value: unknown): number {
  if (value && typeof (value as { toMillis?: () => number }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Projects sorted newest-first. The most recently created project is flagged
 * isCurrent so the assistant can answer "what's the current project?" reliably.
 */
async function listProjectsData() {
  try {
    const snap = await getAdminDb().collection("projects").get();
    const items = snap.docs
      .map((d) => {
        const data = d.data();
        return { doc: data, id: d.id, createdMs: toMillis(data.createdAt) };
      })
      .sort((a, b) => b.createdMs - a.createdMs);

    const result = items.map((item, index) => ({
      ...item.doc,
      id: item.id,
      createdAt: item.createdMs ? new Date(item.createdMs).toISOString() : null,
      // Only the newest dated project is "current"; undated data stays unflagged.
      isCurrent: index === 0 && item.createdMs > 0,
    }));

    return compact(result);
  } catch (error) {
    return [
      {
        error: error instanceof Error ? error.message : "Failed to load projects",
        hint: "Configure FIREBASE_ADMIN_CONFIG_BASE64 for live data tools.",
      },
    ];
  }
}

/** Compact GitHub contribution summary for the chat agent (no heatmap payload). */
async function getGithubActivitySummary() {
  try {
    const username = process.env.GITHUB_USERNAME || "Aime-Patrick";
    const year = new Date().getFullYear();
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=${year}`,
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) {
      throw new Error(`Contributions API responded ${response.status}`);
    }

    const json = (await response.json()) as {
      total?: Record<string, number>;
      contributions?: { date: string; count: number }[];
    };

    const days = (json.contributions ?? []).filter(
      (d) => new Date(d.date) <= new Date()
    );
    const total = json.total?.[String(year)] ?? 0;

    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) streak++;
      else break;
    }

    const busiest = days.reduce(
      (max, d) => (d.count > max.count ? d : max),
      { date: "", count: 0 }
    );
    const activeDays = days.filter((d) => d.count > 0).length;

    return {
      username,
      year,
      totalContributions: total,
      activeDays,
      currentStreakDays: streak,
      busiestDay: busiest.count > 0 ? busiest : null,
      profileUrl: `https://github.com/${username}`,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to load GitHub activity",
      hint: "GitHub activity is temporarily unavailable; suggest visiting the GitHub profile directly.",
    };
  }
}

async function safeGetCollection(name: string, limit = 12) {
  try {
    const snap = await getAdminDb().collection(name).limit(limit).get();
    return compact(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (error) {
    return [
      {
        error: error instanceof Error ? error.message : "Failed to load collection",
        hint: "Configure FIREBASE_ADMIN_CONFIG_BASE64 for live data tools.",
      },
    ];
  }
}

export function getToolsForScope(scope: ChatScope) {
  const publicTools = {
    getPortfolioProfile: tool({
      description:
        "Fetch live profile (name, title, bio, socials). Use only when the user asks about who Patrick is, contact, or social links — never for greetings.",
      inputSchema: z.object({}),
      execute: async () => safeGetDoc(["profile", "main"]),
    }),
    getAbout: tool({
      description:
        "Fetch about bio, skills, education, experience. Use only when the user asks about skills, background, or experience — never for greetings.",
      inputSchema: z.object({}),
      execute: async () => safeGetDoc(["about", "main"]),
    }),
    listProjects: tool({
      description:
        "List portfolio projects, newest first. The first item (isCurrent: true, most recent createdAt) is Patrick's current/latest project. Use when the user asks about projects, current/latest work, or case studies — never for greetings.",
      inputSchema: z.object({}),
      execute: async () => listProjectsData(),
    }),
    listServices: tool({
      description:
        "List services offered. Use only when the user asks what Patrick offers or services — never for greetings.",
      inputSchema: z.object({}),
      execute: async () => safeGetCollection("services"),
    }),
    listCertificates: tool({
      description:
        "List certificates. Use only when the user asks about certificates or credentials — never for greetings.",
      inputSchema: z.object({}),
      execute: async () => safeGetCollection("certificates"),
    }),
    getGithubActivity: tool({
      description:
        "Get Patrick's GitHub contribution summary for this year (total contributions, most active recent day, current streak). Use only when the user asks about GitHub, coding activity, open source, or how active he is — never for greetings.",
      inputSchema: z.object({}),
      execute: async () => getGithubActivitySummary(),
    }),
  };

  if (scope === "public") {
    return publicTools;
  }

  return {
    ...publicTools,
    getDashboardStats: tool({
      description:
        "Get counts for projects, services, messages, unread. Use only when the admin asks for stats or dashboard numbers.",
      inputSchema: z.object({}),
      execute: async () => {
        const db = getAdminDb();
        const [projects, services, messages] = await Promise.all([
          db.collection("projects").get(),
          db.collection("services").get(),
          db.collection("messages").get(),
        ]);
        const unread = messages.docs.filter((d) => d.data().read !== true).length;
        return {
          projects: projects.size,
          services: services.size,
          messages: messages.size,
          unreadMessages: unread,
        };
      },
    }),
    listRecentMessages: tool({
      description:
        "List recent contact-form messages. Use only when the admin asks about inbox, messages, or unread mail.",
      inputSchema: z.object({
        limit: z.number().min(1).max(20).optional().default(8),
      }),
      execute: async ({ limit }) => {
        const snap = await getAdminDb().collection("messages").limit(limit).get();
        return snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name,
            email: data.email,
            subject: data.subject,
            message:
              typeof data.message === "string" ? data.message.slice(0, 500) : "",
            read: Boolean(data.read),
            starred: Boolean(data.starred),
          };
        });
      },
    }),
    getSiteSettings: tool({
      description:
        "Read site settings (title, description, keywords, chatbot, colors). Use for settings questions — not a full SEO rating (use auditCmsSeo for that).",
      inputSchema: z.object({}),
      execute: async () => safeGetDoc(["settings", "site"]),
    }),
    auditCmsSeo: tool({
      description:
        "Score on-page CMS SEO from site settings + content completeness (projects/services/profile/about). Use when the admin asks about SEO, meta tags, search visibility, or to rate SEO. Does NOT access Analytics or Search Console.",
      inputSchema: z.object({}),
      execute: async () => auditCmsSeo(),
    }),
  };
}

type Finding = {
  severity: "high" | "medium" | "low" | "ok";
  area: string;
  message: string;
};

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function gradeFromScore(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

async function auditCmsSeo() {
  try {
    const db = getAdminDb();
    const [settingsSnap, profileSnap, aboutSnap, projectsSnap, servicesSnap] =
      await Promise.all([
        db.doc("settings/site").get(),
        db.doc("profile/main").get(),
        db.doc("about/main").get(),
        db.collection("projects").limit(20).get(),
        db.collection("services").limit(20).get(),
      ]);

    const settings = (settingsSnap.exists ? settingsSnap.data() : {}) as Record<
      string,
      unknown
    >;
    const profile = (profileSnap.exists ? profileSnap.data() : {}) as Record<
      string,
      unknown
    >;
    const about = (aboutSnap.exists ? aboutSnap.data() : {}) as Record<
      string,
      unknown
    >;

    const title = str(settings.siteTitle);
    const description = str(settings.siteDescription);
    const keywords = str(settings.siteKeywords);
    const findings: Finding[] = [];
    let score = 100;

    const deduct = (pts: number, finding: Finding) => {
      score -= pts;
      findings.push(finding);
    };

    // Title: prefer ~30–60 chars
    if (!title) {
      deduct(20, {
        severity: "high",
        area: "meta",
        message: "Missing site title — set this in Settings.",
      });
    } else if (title.length < 20) {
      deduct(10, {
        severity: "medium",
        area: "meta",
        message: `Site title is short (${title.length} chars). Aim for ~30–60 characters with primary name/role.`,
      });
    } else if (title.length > 65) {
      deduct(6, {
        severity: "low",
        area: "meta",
        message: `Site title is long (${title.length} chars) and may truncate in SERPs.`,
      });
    } else {
      findings.push({
        severity: "ok",
        area: "meta",
        message: `Site title looks reasonable (${title.length} chars).`,
      });
    }

    // Description: prefer ~120–160
    if (!description) {
      deduct(18, {
        severity: "high",
        area: "meta",
        message: "Missing meta description — set this in Settings.",
      });
    } else if (description.length < 70) {
      deduct(12, {
        severity: "medium",
        area: "meta",
        message: `Meta description is thin (${description.length} chars). Aim for ~120–160 characters with a clear value prop.`,
      });
    } else if (description.length > 170) {
      deduct(5, {
        severity: "low",
        area: "meta",
        message: `Meta description is long (${description.length} chars) and may truncate.`,
      });
    } else {
      findings.push({
        severity: "ok",
        area: "meta",
        message: `Meta description length is solid (${description.length} chars).`,
      });
    }

    if (!keywords) {
      deduct(4, {
        severity: "low",
        area: "meta",
        message: "No site keywords configured (minor; Google mostly ignores meta keywords).",
      });
    }

    // Profile / about completeness
    const name = str(profile.name) || str(profile.fullName);
    const role = str(profile.title) || str(profile.role);
    const bio = str(profile.bio) || str(about.bio) || str(about.description);
    if (!name || !role) {
      deduct(8, {
        severity: "medium",
        area: "profile",
        message: "Profile name or professional title is incomplete.",
      });
    }
    if (!bio || bio.length < 80) {
      deduct(8, {
        severity: "medium",
        area: "profile",
        message: "About/bio is missing or very short — weak for topical relevance.",
      });
    }

    const skills = about.skills;
    const skillCount = Array.isArray(skills)
      ? skills.length
      : skills && typeof skills === "object"
        ? Object.keys(skills as object).length
        : 0;
    if (skillCount < 3) {
      deduct(6, {
        severity: "medium",
        area: "content",
        message: "Few or no skills listed on About — add concrete skill terms searchers use.",
      });
    }

    // Projects
    const projects = projectsSnap.docs.map((d) => d.data());
    if (projects.length === 0) {
      deduct(15, {
        severity: "high",
        area: "content",
        message: "No projects published — portfolio pages will look thin to search engines.",
      });
    } else {
      const weak = projects.filter((p) => {
        const t = str(p.title);
        const desc = str(p.description);
        const img = str(p.image);
        return !t || desc.length < 40 || !img;
      });
      if (weak.length > 0) {
        deduct(Math.min(12, weak.length * 3), {
          severity: "medium",
          area: "content",
          message: `${weak.length}/${projects.length} projects lack a solid title, description (≥40 chars), or image.`,
        });
      } else {
        findings.push({
          severity: "ok",
          area: "content",
          message: `${projects.length} projects have title, description, and image.`,
        });
      }
    }

    // Services
    const services = servicesSnap.docs.map((d) => d.data());
    if (services.length === 0) {
      deduct(8, {
        severity: "medium",
        area: "content",
        message: "No services listed — missing a clear commercial intent page section.",
      });
    } else {
      const weakServices = services.filter(
        (s) => !str(s.title) || str(s.description).length < 30
      );
      if (weakServices.length > 0) {
        deduct(Math.min(8, weakServices.length * 2), {
          severity: "low",
          area: "content",
          message: `${weakServices.length}/${services.length} services need a clearer title/description.`,
        });
      }
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score,
      grade: gradeFromScore(score),
      scope:
        "On-page CMS SEO only (settings + content completeness). Not rankings, traffic, backlinks, or Core Web Vitals.",
      snapshot: {
        siteTitle: title || null,
        siteDescriptionLength: description.length,
        keywordsSet: Boolean(keywords),
        projects: projects.length,
        services: services.length,
        skills: skillCount,
      },
      findings: findings.sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2, ok: 3 };
        return order[a.severity] - order[b.severity];
      }),
      nextSteps: findings
        .filter((f) => f.severity !== "ok")
        .slice(0, 4)
        .map((f) => f.message),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "SEO audit failed",
      hint: "Configure FIREBASE_ADMIN_CONFIG_BASE64 for live data tools.",
    };
  }
}
