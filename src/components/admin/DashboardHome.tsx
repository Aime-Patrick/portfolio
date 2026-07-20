"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Wrench,
  Sparkles,
  Inbox,
  ArrowUpRight,
} from "lucide-react";
import { db } from "../../firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  projects: number;
  services: number;
  skills: number;
  messages: number;
  unread: number;
}

type DashboardHomeProps = {
  onNavigate?: (section: string) => void;
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    services: 0,
    skills: 0,
    messages: 0,
    unread: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentMessages, setRecentMessages] = useState<
    Array<{
      id: string;
      name?: string;
      subject?: string;
      email?: string;
      read?: boolean;
      timestamp: Date;
    }>
  >([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsSnapshot, servicesSnapshot, aboutDoc, messagesSnapshot] =
        await Promise.all([
          getDocs(collection(db, "projects")),
          getDocs(collection(db, "services")),
          getDoc(doc(db, "about", "main")),
          getDocs(collection(db, "messages")),
        ]);

      const skillsCount = aboutDoc.exists()
        ? aboutDoc.data()?.skills?.length || 0
        : 0;

      const recent = messagesSnapshot.docs
        .map((d) => ({
          id: d.id,
          ...d.data(),
          timestamp: d.data().timestamp?.toDate?.() || new Date(),
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);

      const unread = messagesSnapshot.docs.filter(
        (d) => d.data().read !== true
      ).length;

      setStats({
        projects: projectsSnapshot.size,
        services: servicesSnapshot.size,
        skills: skillsCount,
        messages: messagesSnapshot.size,
        unread,
      });
      setRecentMessages(recent as typeof recentMessages);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const kpis = [
    {
      label: "Projects",
      value: stats.projects,
      icon: FolderKanban,
      hint: "Live case studies",
      action: () => onNavigate?.("content"),
    },
    {
      label: "Services",
      value: stats.services,
      icon: Wrench,
      hint: "Offerings",
      action: () => onNavigate?.("content"),
    },
    {
      label: "Skills",
      value: stats.skills,
      icon: Sparkles,
      hint: "About section",
      action: () => onNavigate?.("content"),
    },
    {
      label: "Unread",
      value: stats.unread,
      icon: Inbox,
      hint: `${stats.messages} total messages`,
      action: () => onNavigate?.("messages"),
    },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeUp}>
        <Card className="overflow-hidden border-border bg-gradient-to-br from-card via-card to-primary/5">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                Keep shipping, Patrick
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                {stats.unread > 0
                  ? `You have ${stats.unread} unread message${stats.unread === 1 ? "" : "s"}. Ask the copilot to summarize them.`
                  : "Inbox is clear. Use Content to update the public site."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => onNavigate?.("messages")}>
                Open inbox
              </Button>
              <Button variant="outline" onClick={() => onNavigate?.("content")}>
                Edit content
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={stagger}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} variants={fadeUp}>
              <button
                type="button"
                onClick={kpi.action}
                className="w-full text-left"
              >
                <Card className="border-border transition-all hover:border-primary/40 hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {kpi.label}
                    </CardTitle>
                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <p className="text-3xl font-bold tracking-tight">
                        {kpi.value}
                      </p>
                      <ArrowUpRight className="size-4 text-muted-foreground" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {kpi.hint}
                    </p>
                  </CardContent>
                </Card>
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent messages</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest contact form activity
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.("messages")}
            >
              See all
            </Button>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No messages yet. Share your contact section to get inquiries.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMessages.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell className="font-medium">
                        {msg.name || "Unknown"}
                        <div className="text-xs text-muted-foreground">
                          {msg.email}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {msg.subject || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={msg.read ? "secondary" : "default"}>
                          {msg.read ? "Read" : "Unread"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default DashboardHome;
