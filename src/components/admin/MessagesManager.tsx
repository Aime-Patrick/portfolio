"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import {
  Mail,
  MailOpen,
  Star,
  Trash2,
  Reply,
} from "lucide-react";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: Date;
  read: boolean;
  starred: boolean;
}

type Filter = "all" | "unread" | "starred";

export default function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    void fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "messages"));
      const list = snap.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Message, "id" | "timestamp">),
          timestamp: d.data().timestamp?.toDate?.() || new Date(),
          read: Boolean(d.data().read),
          starred: Boolean(d.data().starred),
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setMessages(list);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const selected = useMemo(
    () => messages.find((m) => m.id === selectedId) || null,
    [messages, selectedId]
  );

  const filtered = useMemo(() => {
    if (filter === "unread") return messages.filter((m) => !m.read);
    if (filter === "starred") return messages.filter((m) => m.starred);
    return messages;
  }, [messages, filter]);

  const patchMessage = async (id: string, data: Partial<Message>) => {
    await updateDoc(doc(db, "messages", id), data);
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data } : m))
    );
  };

  const selectMessage = async (message: Message) => {
    setSelectedId(message.id);
    if (!message.read) {
      try {
        await patchMessage(message.id, { read: true });
      } catch {
        toast.error("Failed to mark as read");
      }
    }
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle>Inbox</CardTitle>
          <CardDescription>{filtered.length} messages</CardDescription>
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as Filter)}
            className="pt-1"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="starred">Starred</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <Separator />
        <CardContent className="max-h-[60vh] space-y-1 overflow-y-auto p-2">
          {loading ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No messages
            </p>
          ) : (
            filtered.map((message) => (
              <button
                key={message.id}
                type="button"
                onClick={() => void selectMessage(message)}
                className={cn(
                  "flex w-full gap-2 rounded-md border border-transparent p-2.5 text-left transition-colors hover:bg-accent",
                  selectedId === message.id && "border-border bg-accent",
                  !message.read && "font-medium"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                    message.read
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {message.read ? (
                    <MailOpen className="size-3.5" />
                  ) : (
                    <Mail className="size-3.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-sm">{message.name}</p>
                    {message.starred ? (
                      <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {message.email}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {message.message}
                  </p>
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="min-h-[420px]">
        {selected ? (
          <>
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
              <div className="min-w-0">
                <CardTitle className="truncate">{selected.name}</CardTitle>
                <CardDescription className="truncate">
                  {selected.email}
                </CardDescription>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(selected.timestamp)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    void patchMessage(selected.id, {
                      starred: !selected.starred,
                    }).catch(() => toast.error("Failed to update"))
                  }
                  aria-label={selected.starred ? "Unstar" : "Star"}
                >
                  <Star
                    className={cn(
                      "size-4",
                      selected.starred && "fill-amber-400 text-amber-400"
                    )}
                  />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    void patchMessage(selected.id, {
                      read: !selected.read,
                    }).catch(() => toast.error("Failed to update"))
                  }
                  aria-label={selected.read ? "Mark unread" : "Mark read"}
                >
                  {selected.read ? (
                    <MailOpen className="size-4" />
                  ) : (
                    <Mail className="size-4" />
                  )}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label="Delete">
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="admin-shell">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete message?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          try {
                            await deleteDoc(doc(db, "messages", selected.id));
                            setMessages((prev) =>
                              prev.filter((m) => m.id !== selected.id)
                            );
                            setSelectedId(null);
                            toast.success("Message deleted");
                          } catch {
                            toast.error("Failed to delete");
                          }
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-4 pt-4">
              {!selected.read ? (
                <Badge variant="secondary">Unread</Badge>
              ) : null}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {selected.message}
              </p>
              <Button asChild>
                <a href={`mailto:${selected.email}`}>
                  <Reply className="size-3.5" />
                  Reply via email
                </a>
              </Button>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex h-full min-h-[420px] flex-col items-center justify-center gap-2 text-center">
            <Mail className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Select a message</p>
            <p className="text-xs text-muted-foreground">
              Choose one from the inbox to read details
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
