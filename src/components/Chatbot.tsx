import React, { useState, useRef, useEffect } from "react";
import { RiRobot3Fill } from "react-icons/ri";
import { IoIosClose, IoIosSend } from "react-icons/io";
import axios from "axios";
import { useSiteSettings } from "./SiteSettingsProvider";

const GITHUB_USERNAME = "Aime-Patrick";

const fetchGithubProfile = async () => {
  const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
  return await res.json();
};

const fetchGithubRepos = async () => {
  const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`);
  const repos: any[] = await res.json();
  return repos
    .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
    .map((repo: any) => `- ${repo.name}: ${repo.description || "No description"}`)
    .join("\n");
};

const fetchGithubReadme = async () => {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_USERNAME}/main/README.md`);
    if (res.ok) return await res.text();
    return "";
  } catch {
    return "";
  }
};

const fetchGithubContributions = async (token: string) => {
  const query = `
    {
      user(login: "Aime-Patrick") {
        contributionsCollection {
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          totalPullRequestReviewContributions
          contributionCalendar {
            totalContributions
          }
          commitContributionsByRepository(maxRepositories: 5) {
            repository {
              nameWithOwner
              url
            }
            contributions {
              totalCount
            }
          }
          pullRequestContributionsByRepository(maxRepositories: 5) {
            repository {
              nameWithOwner
              url
            }
            contributions {
              totalCount
            }
          }
        }
      }
    }
  `;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  return data.data.user.contributionsCollection;
};

function summarizeExternalContributions(contributions: any) {
  let summary = "";
  if (contributions?.commitContributionsByRepository?.length) {
    summary += "Commits to external repositories:\n";
    contributions.commitContributionsByRepository.forEach((item: any) => {
      summary += `- ${item.repository.nameWithOwner}: ${item.contributions.totalCount} commits\n`;
    });
  }
  if (contributions?.pullRequestContributionsByRepository?.length) {
    summary += "Pull requests to external repositories:\n";
    contributions.pullRequestContributionsByRepository.forEach((item: any) => {
      summary += `- ${item.repository.nameWithOwner}: ${item.contributions.totalCount} PRs\n`;
    });
  }
  return summary.trim();
}

const buildSystemPrompt = (
  profile: any,
  repos: string,
  readme: string,
  contributions: any
) => `
You are a helpful assistant for Aime Patrick Ndagijimana.
You can only answer questions about Aime Patrick Ndagijimana's skills, projects, performance, GitHub activity, and professional background.
If you are asked about anything else, or about topics unrelated to Aime Patrick Ndagijimana, you must respond with:
"I'm sorry, I can only answer questions about Aime Patrick Ndagijimana and his work."

Here is information about Patrick:
- Name: ${profile.name || "Aime Patrick Ndagijimana"}
- Bio: ${profile.bio || ""}
- Location: ${profile.location || ""}
- Skills: HTML, CSS, JavaScript, React, TypeScript, Node.js, MongoDB, PostgreSQL, MySQL, REST APIs, Figma, Tailwind, Bootstrap, React Native, NestJs, GraphQL
- Performance: 6+ Years of experience, many happy clients, strong UI/UX, quality work, collaborative projects (e.g., Andela)
- Latest GitHub Projects:
${repos}
- GitHub Contributions (this year):
  - Total: ${contributions?.contributionCalendar?.totalContributions ?? "N/A"}
  - Commits: ${contributions?.totalCommitContributions ?? "N/A"}
  - Pull Requests: ${contributions?.totalPullRequestContributions ?? "N/A"}
  - Issues: ${contributions?.totalIssueContributions ?? "N/A"}
  - Reviews: ${contributions?.totalPullRequestReviewContributions ?? "N/A"}
${summarizeExternalContributions(contributions)}
${readme ? `\nProfile README:\n${readme.substring(0, 500)}...` : ""}
\nAlways answer questions about Patrick, his skills, projects, and performance as if you are his personal assistant.
`;

const Chatbot: React.FC = () => {
  const { settings } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [githubProfile, setGithubProfile] = useState<any>(null);
  const [githubRepos, setGithubRepos] = useState("");
  const [githubReadme, setGithubReadme] = useState("");
  const [githubContributions, setGithubContributions] = useState<any>(null);
  
  // If chatbot is disabled in settings, don't render anything
  if (settings.enableChatbot === false) {
    return null;
  }

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Fetch GitHub data on chatbot open
  useEffect(() => {
    if (open && !githubProfile) {
      (async () => {
        try {
          const [profile, repos, readme, contributions] = await Promise.all([
            fetchGithubProfile(),
            fetchGithubRepos(),
            fetchGithubReadme(),
            fetchGithubContributions(import.meta.env.VITE_GITHUB_TOKEN),
          ]);
          setGithubProfile(profile);
          setGithubRepos(repos);
          setGithubReadme(readme);
          setGithubContributions(contributions);
        } catch {
          setGithubProfile({ name: "Aime Patrick Ndagijimana", bio: "", location: "" });
          setGithubRepos("");
          setGithubReadme("");
          setGithubContributions(null);
        }
      })();
    }
  }, [open, githubProfile]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setInput("");
    setLoading(true);

    // Build system prompt with latest GitHub data
    const systemPrompt = buildSystemPrompt(
      githubProfile || { name: "Aime Patrick Ndagijimana", bio: "", location: "" },
      githubRepos,
      githubReadme,
      githubContributions
    );

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({
              role: m.from === "user" ? "user" : "assistant",
              content: m.text,
            })),
            { role: "user", content: input },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_REACT_OPEN_API}`,
          },
        }
      );
      const aiText = response.data.choices[0].message.content;
      setMessages((prev) => [...prev, { from: "bot", text: aiText }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, I couldn't get a response." },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="!fixed !bottom-6 !right-6 !z-[100] !flex !flex-col !items-end">
      {/* Floating Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`transition-transform duration-300 ease-in-out bg-gradient-to-br from-[var(--black-color-light)] to-[var(--color-black)] shadow-xl rounded-full w-16 h-16 flex items-center justify-center text-white text-3xl hover:scale-110 focus:outline-none animate-bounce ${open ? "rotate-12" : ""}`}
        aria-label="Open chatbot"
      >
        <span><RiRobot3Fill /></span>
      </button>
      {/* Chat Window */}
      <div
        className={`mt-4 !w-[350px] !max-w-[95vw] !bg-white !rounded-3xl !shadow-2xl !border !border-gray-200 transition-all duration-500 ease-in-out flex flex-col ${open ? "!opacity-100 !translate-y-0 !scale-100" : "!opacity-0 !pointer-events-none !translate-y-4 !scale-95"}`}
        style={{ minHeight: open ? "480px" : 0, maxHeight: open ? "80vh" : 0 }}
      >
        {/* Header */}
        <div className="relative !bg-gradient-to-r !from-[var(--black-color-light)] !to-[var(--color-black)] !text-white !px-6 !py-4 rounded-t-2xl flex items-center justify-center border-b border-black/10">
          <span className="!absolute !left-4 !text-2xl !bg-white/!10 !rounded-full !p-1"><RiRobot3Fill /></span>
          <span className="!font-semibold !text-lg !tracking-wide">AI Chatbot</span>
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 !text-white hover:!text-gray-200 focus:!outline-none text-2xl"
            aria-label="Close chatbot"
          >
            <IoIosClose />
          </button>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto !px-4 !py-4 space-y-3 !bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" style={{ minHeight: "200px" }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`!px-4 !py-2 !rounded-2xl text-sm !shadow max-w-[75%] transition-all duration-300 break-words ${
                  msg.from === "user"
                    ? "!bg-black !text-white rounded-br-md animate-slide-in-right mb-2"
                    : "!bg-white !text-gray-800 !border !border-gray-200 rounded-bl-md animate-slide-in-left"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="!flex !justify-start">
              <div className="!px-4 !py-2 rounded-2xl bg-gray-200 text-gray-600 text-sm animate-pulse max-w-[75%]">
                Bot is typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 !bg-white !px-4 !py-3 rounded-b-3xl !shadow-md">
          <input
            type="text"
            className="flex-1 !px-4 !py-2 !rounded-full !border !border-gray-200 focus:!outline-none focus:!ring-2 focus:!ring-gray-700 transition text-sm !bg-gray-50"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!open}
          />
          <button
            type="submit"
            className="!bg-black hover:!bg-[var(--black-color-light)] !text-white !px-5 !py-2 !rounded-full transition disabled:!opacity-50 !shadow"
            disabled={!input.trim()}
          >
            <IoIosSend />
          </button>
        </form>
        {/* Animations for message bubbles */}
        <style>{`
          @keyframes slide-in-right {
            0% { opacity: 0; transform: translateX(40px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes slide-in-left {
            0% { opacity: 0; transform: translateX(-40px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in-right { animation: slide-in-right 0.3s; }
          .animate-slide-in-left { animation: slide-in-left 0.3s; }
        `}</style>
      </div>
    </div>
  );
};

export default Chatbot;