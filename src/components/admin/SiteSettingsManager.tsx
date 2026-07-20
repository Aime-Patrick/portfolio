"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  footerText: string;
  enableChatbot: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const defaults: SiteSettings = {
  siteTitle: "AimePatrick",
  siteDescription: "Software Engineer Portfolio",
  siteKeywords: "software engineer, web development, react, portfolio",
  footerText: "© 2026 NDAGIJIMANA Aime Patrick. All rights reserved.",
  enableChatbot: true,
  primaryColor: "#f44a00",
  secondaryColor: "#121212",
};

export default function SiteSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(defaults);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "site"));
        if (snap.exists()) {
          setSettings({ ...defaults, ...(snap.data() as SiteSettings) });
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
        toast.error("Failed to load site settings");
      } finally {
        setLoading(false);
      }
    };
    void fetchSettings();
  }, []);

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "site"), settings);
      toast.success("Settings saved");
    } catch (error) {
      console.error("Error updating site settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
          <CardDescription>Title, description, and keywords for search.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="siteTitle">Site title</Label>
            <Input
              id="siteTitle"
              value={settings.siteTitle}
              onChange={(e) => update("siteTitle", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Description</Label>
            <Input
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => update("siteDescription", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="siteKeywords">Keywords</Label>
            <Input
              id="siteKeywords"
              value={settings.siteKeywords}
              onChange={(e) => update("siteKeywords", e.target.value)}
              placeholder="developer, portfolio, react"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="footerText">Footer text</Label>
            <Input
              id="footerText"
              value={settings.footerText}
              onChange={(e) => update("footerText", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand color</CardTitle>
          <CardDescription>
            Primary accent used on the public portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary</Label>
            <div className="flex items-center gap-2">
              <Input
                id="primaryColorPicker"
                type="color"
                value={settings.primaryColor}
                onChange={(e) => update("primaryColor", e.target.value)}
                className="h-9 w-12 cursor-pointer p-1"
              />
              <Input
                id="primaryColor"
                value={settings.primaryColor}
                onChange={(e) => update("primaryColor", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Secondary</Label>
            <div className="flex items-center gap-2">
              <Input
                id="secondaryColorPicker"
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => update("secondaryColor", e.target.value)}
                className="h-9 w-12 cursor-pointer p-1"
              />
              <Input
                id="secondaryColor"
                value={settings.secondaryColor}
                onChange={(e) => update("secondaryColor", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>Toggle public site features.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="enableChatbot" className="text-sm font-medium">
                Portfolio assistant
              </Label>
              <p className="text-xs text-muted-foreground">
                Show the AI chat button on the public site.
              </p>
            </div>
            <Switch
              id="enableChatbot"
              checked={settings.enableChatbot}
              onCheckedChange={(checked) => update("enableChatbot", checked)}
            />
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="justify-end pt-4">
          <Button type="submit" disabled={saving}>
            <Save className="size-3.5" />
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
