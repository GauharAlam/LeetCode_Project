import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Flame,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  Rocket,
  ChevronDown,
  Filter,
  PlayCircle,
  BookOpen,
  Bell,
  User,
  Settings,
  Medal,
  TrendingUp,
  Calendar,
  Sparkle,
  Brain,
  Zap,
} from "lucide-react";

const promptsSeed = [
  {
    id: 1,
    slug: "summarize-article",
    title: "Summarize Any Article",
    skill: "Prompt Engineering",
    acceptance: 0.87,
    paidOnly: false,
    tags: ["Summarization", "Text"],
    status: "Saved",
  },
  {
    id: 2,
    slug: "code-explanation",
    title: "Code Explanation",
    skill: "Programming",
    acceptance: 0.78,
    paidOnly: false,
    tags: ["Programming", "Explain"],
    status: "Tried",
  },
  {
    id: 3,
    slug: "creative-story-ideas",
    title: "Creative Story Ideas",
    skill: "Creativity",
    acceptance: 0.95,
    paidOnly: true,
    tags: ["Story", "Creativity", "Writing"],
    status: "Saved",
  },
  {
    id: 4,
    slug: "sql-query-generator",
    title: "SQL Query Generator",
    skill: "Data",
    acceptance: 0.66,
    paidOnly: false,
    tags: ["SQL", "Data", "Database"],
    status: "New",
  },
];

const skillColors = {
  "Prompt Engineering": "text-indigo-700 bg-indigo-50 ring-indigo-200",
  Programming: "text-emerald-700 bg-emerald-50 ring-emerald-200",
  Creativity: "text-pink-700 bg-pink-50 ring-pink-200",
  Data: "text-orange-700 bg-orange-50 ring-orange-200",
};

function Homepage() {
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("All");

  const filtered = useMemo(() => {
    return promptsSeed.filter((p) => {
      const okSkill = skill === "All" ? true : p.skill === skill;
      const okQ =
        q.trim().length
          ? p.title.toLowerCase().includes(q.toLowerCase()) ||
            p.tags.join(" ").toLowerCase().includes(q.toLowerCase())
          : true;
      return okSkill && okQ;
    });
  }, [q, skill]);

  return (
    <div className="bg-gradient-to-tr from-indigo-50 via-white to-emerald-50 min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col gap-4 p-6 bg-white border-r border-gray-200 w-[260px]">
        <div className="flex items-center gap-3 mb-6">
          <Sparkle className="h-6 w-6 text-fuchsia-500" />
          <span className="font-bold text-xl tracking-tight text-gray-900">GPT-5 Studio</span>
        </div>
        <nav className="flex flex-col gap-4 text-gray-800">
          <a href="#dashboard" className="flex gap-2 items-center hover:text-fuchsia-600 transition">
            <BarChart3 /> Dashboard
          </a>
          <a href="#prompts" className="flex gap-2 items-center hover:text-fuchsia-600 transition">
            <BookOpen /> Prompt Library
          </a>
          <a href="#history" className="flex gap-2 items-center hover:text-fuchsia-600 transition">
            <Clock /> History
          </a>
          <a href="#labs" className="flex gap-2 items-center hover:text-fuchsia-600 transition">
            <Zap /> Labs
          </a>
          <a href="#contest" className="flex gap-2 items-center hover:text-fuchsia-600 transition">
            <Medal /> Contests
          </a>
          <a href="#skill" className="flex gap-2 items-center hover:text-fuchsia-600 transition">
            <TrendingUp /> Skill Tracks
          </a>
          <a href="#discuss" className="flex gap-2 items-center hover:text-fuchsia-600 transition">
            <MessageSquare /> Community
          </a>
        </nav>
        <div className="mt-auto flex gap-2 items-center pt-6 border-t border-gray-100">
          <User className="h-5 w-5 text-gray-500" />
          <span className="text-gray-800 font-medium">AI Enthusiast</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-2 md:px-8 py-5">
        {/* Sticky Top Nav/Notifications */}
        <header className="sticky top-0 z-50 flex justify-between items-center bg-white/60 backdrop-blur px-4 py-2 border-b border-gray-100">
          <div className="font-bold text-base text-gray-900 flex items-center gap-2">
            <Sparkle className="h-5 w-5 text-fuchsia-500" /> GPT-5 Studio
          </div>
          <div className="flex gap-3 items-center">
            <button className="relative">
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-fuchsia-500 rounded-full border border-white" />
            </button>
            <button className="rounded-full overflow-hidden border-2 border-gray-200">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" className="w-8 h-8" />
            </button>
          </div>
        </header>

        {/* Hero - Trending Lab / Challenge */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-white shadow-md px-6 py-6 mt-4 flex flex-col md:flex-row gap-8 items-center justify-between"
        >
          <div>
            <div className="flex gap-2 items-center mb-2">
              <Brain className="h-5 w-5 text-fuchsia-500" />
              <span className="text-sm font-medium text-fuchsia-700">Trending Lab</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">
              Next-Gen Code Generation (GPT-5 Beta)
            </h2>
            <div className="flex gap-2">
              <span className="inline-flex rounded-full px-2.5 py-1 text-sm ring-1 text-fuchsia-700 bg-white ring-fuchsia-200">Creativity</span>
              <span className="inline-flex rounded-full px-2.5 py-1 text-sm ring-1 text-emerald-800 bg-white ring-emerald-200">Code</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow hover:bg-fuchsia-700 transition">
              <PlayCircle className="h-5 w-5" />
              Try Lab Now
            </button>
          </div>
        </motion.section>

        {/* Progress, Leaderboard, Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Progress + Leaderboard */}
          <aside className="lg:col-span-1 flex flex-col gap-6">
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-xl border border-gray-200 bg-white shadow p-6 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-gray-800">Your Stats</span>
                <a href="#stats" className="text-xs text-fuchsia-600 hover:underline">Details</a>
              </div>
              <div className="flex gap-8 justify-between">
                <div>
                  <span className="block text-xs text-gray-500">Prompts Used</span>
                  <span className="block text-xl font-bold text-fuchsia-700">432</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Contests</span>
                  <span className="block text-xl font-bold text-blue-500">3</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Skill Level</span>
                  <span className="block text-xl font-bold text-emerald-700">Pro</span>
                </div>
              </div>
              <div className="mt-4 h-3 w-full rounded-full bg-gray-100">
                <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-fuchsia-400 to-blue-500" />
              </div>
            </motion.section>

            <section className="rounded-xl border border-gray-200 bg-white shadow p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-gray-800">Leaderboard</span>
                <a href="#lead" className="text-xs text-fuchsia-600 hover:underline">View All</a>
              </div>
              <ul className="flex flex-col gap-3">
                <li className="flex gap-2 items-center">
                  <Medal className="h-5 w-5 text-amber-500" />
                  Jane Doe - 812 points
                </li>
                <li className="flex gap-2 items-center">
                  <Rocket className="h-5 w-5 text-purple-600" />
                  Ravi Kumar - 781 points
                </li>
                <li className="flex gap-2 items-center text-fuchsia-900">
                  <User className="h-5 w-5" />
                  You - 690 points
                </li>
              </ul>
            </section>
          </aside>

          {/* Center: Prompt Search/List Table */}
          <section className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 gap-3">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search prompts, tags…"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-base outline-none ring-0 placeholder:text-gray-400 focus:border-fuchsia-400"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {["All", "Prompt Engineering", "Programming", "Creativity", "Data"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setSkill(f)}
                    className={`rounded-xl border px-4 py-2 text-sm transition font-semibold ${
                      skill === f
                        ? "border-fuchsia-600 bg-fuchsia-600 text-white shadow"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-fuchsia-50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
                <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ml-auto">
                  <Filter className="h-4 w-4" />
                  Advanced
                </button>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-100 mt-2">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Approval</th>
                    <th className="px-4 py-3">Skill</th>
                    <th className="px-4 py-3">Try</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-fuchsia-50/60 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {p.status === "Saved" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : p.status === "Tried" ? (
                            <Circle className="h-5 w-5 text-orange-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                          <span className="text-gray-700">{p.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`#/prompts/${p.slug}`} className="font-semibold text-fuchsia-900 hover:underline">{p.title}</a>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {p.tags.map((t) => (
                            <span key={t} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ring-1 bg-gray-50 text-gray-500 ring-gray-100">{t}</span>
                          ))}
                          {p.paidOnly && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ring-1 bg-yellow-50 text-amber-700 ring-amber-200">
                              <Star className="h-3.5 w-3.5" /> Premium
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{Math.round(p.acceptance * 100)}%</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ring-1 ${skillColors[p.skill]}`}>{p.skill}</span>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`#/run/${p.slug}`} className="inline-flex items-center gap-1 text-gray-700 hover:text-fuchsia-800">
                          Try <ChevronRight className="h-4 w-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Labs, Contests, Skill Tracks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl border border-gray-200 shadow p-6 flex flex-col gap-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-gray-800">Featured Labs</span>
              <button className="inline-flex items-center gap-1 text-sm text-fuchsia-800 hover:text-fuchsia-600 font-medium">All <ChevronDown className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "Prompt Composer", desc: "Craft advanced instructions", color: "bg-indigo-50" },
                { title: "API Playground", desc: "Try new GPT-5 APIs", color: "bg-fuchsia-50" },
                { title: "Voice-to-Prompt", desc: "Speak for instant text", color: "bg-blue-50" },
                { title: "Image Generation", desc: "AI-generated visuals", color: "bg-pink-50" },
              ].map((c) => (
                <a key={c.title} href="#" className={`rounded-xl border border-gray-200 p-4 ${c.color} hover:bg-gray-50 flex items-center justify-between group transition`}>
                  <div>
                    <div className="font-bold text-gray-900">{c.title}</div>
                    <div className="text-sm text-gray-500">{c.desc}</div>
                  </div>
                  <Zap className="h-6 w-6 text-fuchsia-400 group-hover:text-fuchsia-700" />
                </a>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-white rounded-xl border border-gray-200 shadow p-6 flex flex-col gap-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-gray-800">AI Contests</span>
              <a href="#contest" className="text-xs text-fuchsia-600 hover:underline">See all</a>
            </div>
            <div className="flex items-center gap-4 justify-between">
              <div className="flex gap-3 items-center">
                <Medal className="h-8 w-8 text-fuchsia-500" />
                <div>
                  <div className="font-semibold text-gray-900">PromptFest #20</div>
                  <div className="text-sm text-gray-500">Starts in 01:44:07</div>
                </div>
              </div>
              <button className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-bold text-white hover:bg-fuchsia-700 shadow transition">Register</button>
            </div>
          </motion.section>
        </div>

        {/* Footer */}
        <footer className="mt-16 px-2 md:px-8 py-6 border-t border-gray-200 text-sm text-gray-500 flex flex-col gap-4 md:flex-row justify-between items-center">
          <div className="flex gap-2 items-center">
            <Sparkle className="h-5 w-5 text-fuchsia-500" />
            <span className="font-semibold">GPT-5 Studio</span>
            <span>• Next-gen generative playground.</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-900">About</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Help</a>
          </div>
          <div className="mt-2 md:mt-0 text-xs text-gray-400">© {new Date().getFullYear()} GPT-5 Studio. Powered by AI ✨</div>
        </footer>
      </main>
    </div>
  );
}

export default Homepage;
