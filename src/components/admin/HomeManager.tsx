"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import {
  ImageIcon,
  Link2,
  Plus,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface HomeData {
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  cloudinaryPublicId?: string;
  /** Images for the 4 pinned hero panels (index 0–3). Empty = use defaults. */
  heroPanelImages?: string[];
  typeAnimationSequence?: (string | number)[];
  socialLinks: {
    platform: string;
    url: string;
  }[];
}

const HERO_PANEL_LABELS = [
  "Panel 1 — Convert",
  "Panel 2 — Proof",
  "Panel 3 — Offer",
  "Panel 4 — Next step",
];

const emptyHeroPanels = () => ["", "", "", ""];

const DEFAULT_TYPE_SEQUENCE: (string | number)[] = [
  "I am Aime Patrick Ndagijimana",
  3000,
  "Full Stack & AI Solutions Engineer",
  3000,
  "Software Engineer",
  3000,
  "AI Agent Developer",
  3000,
  "AI Engineer",
  3000,
];

const DEFAULT_SOCIAL_LINKS = [
  { platform: "instagram", url: "" },
  { platform: "linkedin", url: "" },
  { platform: "github", url: "" },
];

export default function HomeManager() {
  const [homeData, setHomeData] = useState<HomeData>({
    name: "",
    title: "",
    bio: "",
    profileImage: "",
    heroPanelImages: emptyHeroPanels(),
    typeAnimationSequence: DEFAULT_TYPE_SEQUENCE,
    socialLinks: DEFAULT_SOCIAL_LINKS,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageInputRef, setImageInputRef] = useState<HTMLInputElement | null>(
    null
  );
  const [panelImageFiles, setPanelImageFiles] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [panelImagePreviews, setPanelImagePreviews] =
    useState<string[]>(emptyHeroPanels());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newAnimationText, setNewAnimationText] = useState("");
  const [newAnimationDuration, setNewAnimationDuration] = useState("3000");
  const [accordionValue, setAccordionValue] = useState<string[]>([
    "basics",
    "animation",
    "socials",
    "media",
  ]);

  useEffect(() => {
    void fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const profileDoc = doc(db, "profile", "main");
      const profileSnapshot = await getDoc(profileDoc);

      if (profileSnapshot.exists()) {
        const data = profileSnapshot.data();
        const panels = Array.isArray(data.heroPanelImages)
          ? [...data.heroPanelImages, "", "", "", ""].slice(0, 4)
          : emptyHeroPanels();
        const homeDataUpdate: HomeData = {
          name: data.name || "",
          title: data.title || "",
          bio: data.bio || "",
          profileImage: data.profileImage || "",
          heroPanelImages: panels,
          typeAnimationSequence:
            data.typeAnimationSequence || DEFAULT_TYPE_SEQUENCE,
          socialLinks: data.socialLinks || DEFAULT_SOCIAL_LINKS,
        };
        if (data.cloudinaryPublicId) {
          homeDataUpdate.cloudinaryPublicId = data.cloudinaryPublicId;
        }
        setHomeData(homeDataUpdate);
        setImagePreview(data.profileImage || "");
        setPanelImagePreviews(panels);
        setPanelImageFiles([null, null, null, null]);
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
      toast.error("Failed to load home data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setHomeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 20 * 1024 * 1024;

      if (file.size > maxSize) {
        toast.error(
          `File size too large. Maximum size is 20 MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB`
        );
        e.target.value = "";
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteImage = () => {
    setImageFile(null);
    setImagePreview("");
    setHomeData((prev) => {
      const { cloudinaryPublicId: _, ...rest } = prev;
      return {
        ...rest,
        profileImage: "",
      };
    });
    toast.success("Image removed!");
  };

  const handlePanelImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size too large. Maximum size is 20 MB.");
      e.target.value = "";
      return;
    }
    setPanelImageFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
    setPanelImagePreviews((prev) => {
      const next = [...prev];
      next[index] = URL.createObjectURL(file);
      return next;
    });
  };

  const clearPanelImage = (index: number) => {
    setPanelImageFiles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setPanelImagePreviews((prev) => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
    setHomeData((prev) => {
      const panels = [...(prev.heroPanelImages || emptyHeroPanels())];
      panels[index] = "";
      return { ...prev, heroPanelImages: panels };
    });
    toast.success(`${HERO_PANEL_LABELS[index]} image cleared`);
  };

  const uploadToCloudinary = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET!);
    formData.append("folder", folder);
    formData.append("max_file_size", "20971520");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || "Failed to upload image");
    }

    const data = await response.json();
    return { url: data.secure_url as string, publicId: data.public_id as string };
  };

  const handleSocialLinkChange = (platform: string, url: string) => {
    setHomeData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link) =>
        link.platform === platform ? { ...link, url } : link
      ),
    }));
  };

  const addAnimationItem = () => {
    if (newAnimationText.trim()) {
      const duration = parseInt(newAnimationDuration) || 3000;
      setHomeData((prev) => ({
        ...prev,
        typeAnimationSequence: [
          ...(prev.typeAnimationSequence || []),
          newAnimationText.trim(),
          duration,
        ],
      }));
      setNewAnimationText("");
      setNewAnimationDuration("3000");
    }
  };

  const removeAnimationItem = (originalIndex: number) => {
    setHomeData((prev) => {
      const newSequence = [...(prev.typeAnimationSequence || [])];
      const actualIndex = originalIndex * 2;
      newSequence.splice(actualIndex, 2);
      return {
        ...prev,
        typeAnimationSequence: newSequence,
      };
    });
    toast.success("Animation item removed!");
  };

  const updateAnimationItem = (
    originalIndex: number,
    text: string,
    duration: number
  ) => {
    setHomeData((prev) => {
      const newSequence = [...(prev.typeAnimationSequence || [])];
      const actualIndex = originalIndex * 2;
      newSequence[actualIndex] = text;
      newSequence[actualIndex + 1] = duration;
      return {
        ...prev,
        typeAnimationSequence: newSequence,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error("Cloudinary is not configured");
      return;
    }

    try {
      setSaving(true);
      let imageUrl = homeData.profileImage;
      let cloudinaryPublicId = homeData.cloudinaryPublicId;

      if (imageFile) {
        toast.loading("Uploading profile image...");
        const uploaded = await uploadToCloudinary(imageFile, "portfolio/home");
        imageUrl = uploaded.url;
        cloudinaryPublicId = uploaded.publicId;
        toast.dismiss();
        toast.success("Profile image uploaded!");
      }

      const heroPanelImages = [
        ...(homeData.heroPanelImages || emptyHeroPanels()),
      ];
      for (let i = 0; i < 4; i++) {
        const file = panelImageFiles[i];
        if (file) {
          toast.loading(`Uploading ${HERO_PANEL_LABELS[i]}...`);
          const uploaded = await uploadToCloudinary(
            file,
            "portfolio/home/panels"
          );
          heroPanelImages[i] = uploaded.url;
          toast.dismiss();
        }
      }

      const profileDoc = doc(db, "profile", "main");
      const { cloudinaryPublicId: _, ...homeDataWithoutCloudinaryId } = homeData;
      const dataToSave: Record<string, unknown> = {
        ...homeDataWithoutCloudinaryId,
        profileImage: imageUrl,
        heroPanelImages,
      };
      if (cloudinaryPublicId) {
        dataToSave.cloudinaryPublicId = cloudinaryPublicId;
      }
      await setDoc(profileDoc, dataToSave, { merge: true });

      setHomeData((prev) => ({
        ...prev,
        profileImage: imageUrl,
        heroPanelImages,
      }));
      setPanelImagePreviews(heroPanelImages);
      toast.success("Home section updated successfully!");
      setImageFile(null);
      setPanelImageFiles([null, null, null, null]);
    } catch (error: unknown) {
      console.error("Error saving home data:", error);
      toast.dismiss();
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save home data";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  const animationItems: Array<{
    text: string;
    duration: number;
    originalIndex: number;
  }> = [];
  const sequence = homeData.typeAnimationSequence || [];
  for (let i = 0; i < sequence.length; i += 2) {
    if (
      i + 1 < sequence.length &&
      typeof sequence[i] === "string" &&
      typeof sequence[i + 1] === "number"
    ) {
      animationItems.push({
        text: sequence[i] as string,
        duration: sequence[i + 1] as number,
        originalIndex: i,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Accordion
        type="multiple"
        value={accordionValue}
        onValueChange={setAccordionValue}
        className="w-full"
      >
        <AccordionItem value="basics" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="text-left">
              <p className="font-medium">Basic Info</p>
              <p className="text-xs font-normal text-muted-foreground">
                Name, title, and bio shown on the home section
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-1">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={homeData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Aime Patrick Ndagijimana"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={homeData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Description</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={homeData.bio}
                  onChange={handleInputChange}
                  placeholder="Brief description for the home section..."
                  className="min-h-28"
                  required
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="animation" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="text-left">
              <p className="font-medium">Animated Titles</p>
              <p className="text-xs font-normal text-muted-foreground">
                TypeAnimation sequence in the hero
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-1">
              {animationItems.length > 0 && (
                <div className="space-y-3">
                  {animationItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`anim-text-${idx}`}>Text</Label>
                        <Input
                          id={`anim-text-${idx}`}
                          value={item.text}
                          onChange={(e) =>
                            updateAnimationItem(
                              idx,
                              e.target.value,
                              item.duration
                            )
                          }
                          placeholder="Animation text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`anim-duration-${idx}`}>
                          Duration (ms)
                        </Label>
                        <Input
                          id={`anim-duration-${idx}`}
                          type="number"
                          value={item.duration}
                          onChange={(e) =>
                            updateAnimationItem(
                              idx,
                              item.text,
                              parseInt(e.target.value) || 3000
                            )
                          }
                          min={1000}
                          step={1000}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeAnimationItem(idx)}
                          aria-label="Remove animation item"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              <div className="space-y-3 rounded-lg border p-4">
                <Label className="flex items-center gap-2">
                  <Plus className="size-4" />
                  Add Animation Line
                </Label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="newAnimationText">Text</Label>
                    <Input
                      id="newAnimationText"
                      value={newAnimationText}
                      onChange={(e) => setNewAnimationText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAnimationItem();
                        }
                      }}
                      placeholder="New animation text"
                    />
                  </div>
                  <div className="w-full space-y-2 sm:w-28">
                    <Label htmlFor="newAnimationDuration">Duration</Label>
                    <Input
                      id="newAnimationDuration"
                      type="number"
                      value={newAnimationDuration}
                      onChange={(e) => setNewAnimationDuration(e.target.value)}
                      min={1000}
                      step={1000}
                    />
                  </div>
                  <Button type="button" variant="secondary" onClick={addAnimationItem}>
                    <Plus className="size-4" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="socials" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="text-left">
              <p className="font-medium flex items-center gap-2">
                <Link2 className="size-4" />
                Social Links
              </p>
              <p className="text-xs font-normal text-muted-foreground">
                Instagram, LinkedIn, and GitHub profile URLs
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-1">
              {homeData.socialLinks.map((link) => (
                <div
                  key={link.platform}
                  className="space-y-2 rounded-lg border p-3"
                >
                  <Label
                    htmlFor={`social-${link.platform}`}
                    className="capitalize"
                  >
                    {link.platform}
                  </Label>
                  <Input
                    id={`social-${link.platform}`}
                    type="url"
                    value={link.url}
                    onChange={(e) =>
                      handleSocialLinkChange(link.platform, e.target.value)
                    }
                    placeholder={`https://${link.platform}.com/your-profile`}
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="media" className="border-b-0">
          <AccordionTrigger className="hover:no-underline">
            <div className="text-left">
              <p className="font-medium flex items-center gap-2">
                <ImageIcon className="size-4" />
                Media
              </p>
              <p className="text-xs font-normal text-muted-foreground">
                Profile portrait and hero panel images
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-1">
              <div className="space-y-2">
                <Label htmlFor="profileImage">Profile Image</Label>
                <Input
                  id="profileImage"
                  ref={(input) => setImageInputRef(input)}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {(imagePreview || homeData.profileImage) && (
                  <div className="relative mt-2 inline-block overflow-hidden rounded-md border">
                    <button
                      type="button"
                      onClick={() => imageInputRef?.click()}
                      className="block"
                      aria-label="Change profile image"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview || homeData.profileImage}
                        alt="Profile preview"
                        className="max-h-48 w-full object-cover"
                      />
                    </button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 size-8"
                      onClick={() => setShowDeleteConfirm(true)}
                      aria-label="Delete image"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Max 20 MB. Click the preview to replace.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Hero Panel Images</Label>
                <p className="text-xs text-muted-foreground">
                  Leave empty to use defaults. Panel 2 defaults to the proof
                  photo on the public site.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {HERO_PANEL_LABELS.map((label, index) => (
                    <div
                      key={label}
                      className="space-y-3 rounded-lg border p-3"
                    >
                      <p className="text-sm font-medium">{label}</p>
                      <div className="space-y-2">
                        <Label htmlFor={`panel-${index}`}>Image</Label>
                        <Input
                          id={`panel-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePanelImageChange(index, e)}
                        />
                      </div>
                      {(panelImagePreviews[index] ||
                        homeData.heroPanelImages?.[index]) && (
                        <div className="relative overflow-hidden rounded-md border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              panelImagePreviews[index] ||
                              homeData.heroPanelImages?.[index]
                            }
                            alt={label}
                            className="h-28 w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 size-8"
                            onClick={() => clearPanelImage(index)}
                            aria-label={`Clear ${label}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Save Home Section
                    </>
                  )}
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete image?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the current profile image? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteImage}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
