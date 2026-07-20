"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import {
  Briefcase,
  Check,
  ExternalLink,
  GraduationCap,
  ImageIcon,
  Link2,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { auth, db, storage } from "@/firebase";
import type { ProfileImportDraft } from "@/lib/profileImport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProfileData {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  profileImage: string;
  resumeUrl: string;
  skills: string[];
  experience: {
    years: string;
    description: string;
  };
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  socialLinks: {
    platform: string;
    url: string;
  }[];
}

const defaultProfile: ProfileData = {
  name: "",
  title: "",
  bio: "",
  email: "",
  phone: "",
  location: "",
  profileImage: "",
  resumeUrl: "",
  skills: [],
  experience: {
    years: "",
    description: "",
  },
  education: [{ degree: "", institution: "", year: "" }],
  socialLinks: [
    { platform: "github", url: "" },
    { platform: "linkedin", url: "" },
    { platform: "twitter", url: "" },
  ],
};

export default function ProfileManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfile);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [importDraft, setImportDraft] = useState<ProfileImportDraft | null>(
    null
  );
  const [accordionValue, setAccordionValue] = useState<string[]>([
    "import",
    "personal",
    "media",
    "education",
    "socials",
  ]);

  useEffect(() => {
    void fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const profileDoc = await getDoc(doc(db, "profile", "main"));

      if (profileDoc.exists()) {
        const data = {
          ...defaultProfile,
          ...(profileDoc.data() as ProfileData),
        };
        setProfileData(data);
        setProfileImagePreview(data.profileImage || "");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExperienceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      experience: { ...prev.experience, [name]: value },
    }));
  };

  const handleEducationChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedEducation = [...profileData.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setProfileData((prev) => ({ ...prev, education: updatedEducation }));
  };

  const addEducation = () => {
    setProfileData((prev) => ({
      ...prev,
      education: [...prev.education, { degree: "", institution: "", year: "" }],
    }));
    setAccordionValue((prev) =>
      prev.includes("education") ? prev : [...prev, "education"]
    );
  };

  const removeEducation = (index: number) => {
    if (profileData.education.length > 1) {
      const updatedEducation = [...profileData.education];
      updatedEducation.splice(index, 1);
      setProfileData((prev) => ({ ...prev, education: updatedEducation }));
    } else {
      toast.error("You must have at least one education entry");
    }
  };

  const handleSocialLinkChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedLinks = [...profileData.socialLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setProfileData((prev) => ({ ...prev, socialLinks: updatedLinks }));
  };

  const addSocialLink = () => {
    setProfileData((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "", url: "" }],
    }));
    setAccordionValue((prev) =>
      prev.includes("socials") ? prev : [...prev, "socials"]
    );
  };

  const removeSocialLink = (index: number) => {
    if (profileData.socialLinks.length > 1) {
      const updatedLinks = [...profileData.socialLinks];
      updatedLinks.splice(index, 1);
      setProfileData((prev) => ({ ...prev, socialLinks: updatedLinks }));
    } else {
      toast.error("You must have at least one social link");
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      setImportDraft(null);
    }
  };

  const handleImportResume = async () => {
    if (!resumeFile) {
      toast.error("Choose a resume file first");
      return;
    }

    try {
      setImporting(true);
      setImportDraft(null);
      const toastId = toast.loading("Parsing resume with Firecrawl + AI…");

      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.dismiss(toastId);
        toast.error("Sign in again to import your resume");
        return;
      }

      const form = new FormData();
      form.append("file", resumeFile);

      const response = await fetch("/api/profile/import-resume", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = (await response.json()) as
        | ProfileImportDraft
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Failed to import from resume"
        );
      }

      setImportDraft(data as ProfileImportDraft);
      toast.dismiss(toastId);
      toast.success("Draft ready — review and apply");
    } catch (error) {
      console.error("Resume import failed:", error);
      toast.dismiss();
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to import. Fill the form manually."
      );
    } finally {
      setImporting(false);
    }
  };

  const applyImportDraft = async () => {
    if (!importDraft) return;

    setProfileData((prev) => ({
      ...prev,
      name: importDraft.name || prev.name,
      title: importDraft.title || prev.title,
      bio: importDraft.bio || prev.bio,
      email: importDraft.email || prev.email,
      phone: importDraft.phone || prev.phone,
      location: importDraft.location || prev.location,
      skills:
        importDraft.skills.length > 0 ? importDraft.skills : prev.skills,
      experience: {
        years: importDraft.experience.years || prev.experience.years,
        description:
          importDraft.experience.description || prev.experience.description,
      },
      education:
        importDraft.education.length > 0 &&
        importDraft.education.some((e) => e.degree || e.institution)
          ? importDraft.education
          : prev.education,
      socialLinks: importDraft.socialLinks.some((l) => l.url)
        ? importDraft.socialLinks
        : prev.socialLinks,
    }));

    // Public About section owns skills (and a freeform education blurb)
    if (importDraft.skills.length > 0 || importDraft.education.length > 0) {
      try {
        const aboutRef = doc(db, "about", "main");
        const aboutSnap = await getDoc(aboutRef);
        const existing = aboutSnap.exists()
          ? (aboutSnap.data() as Record<string, unknown>)
          : {};

        const educationBlurb = importDraft.education
          .filter((e) => e.degree || e.institution)
          .map((e) =>
            [e.degree, e.institution, e.year].filter(Boolean).join(" — ")
          )
          .join("; ");

        await setDoc(
          aboutRef,
          {
            ...existing,
            ...(importDraft.skills.length > 0
              ? { skills: importDraft.skills }
              : {}),
            ...(educationBlurb &&
            !(
              typeof existing.education === "string" &&
              existing.education.trim()
            )
              ? { education: educationBlurb }
              : {}),
            ...(importDraft.name ? { name: importDraft.name } : {}),
            ...(importDraft.title ? { title: importDraft.title } : {}),
            ...(importDraft.bio ? { bio: importDraft.bio } : {}),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Failed to sync About from resume import:", error);
        toast.error(
          "Profile form updated, but About skills sync failed — edit About manually"
        );
      }
    }

    setImportDraft(null);
    setAccordionValue((prev) => {
      const next = new Set(prev);
      ["personal", "media", "education", "socials"].forEach((k) => next.add(k));
      return Array.from(next);
    });
    toast.success(
      "Applied to Profile — skills synced to About. Review, then Save Profile."
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileData.name.trim() || !profileData.title.trim()) {
      toast.error("Name and title are required");
      setAccordionValue((prev) =>
        prev.includes("personal") ? prev : [...prev, "personal"]
      );
      return;
    }
    if (!profileData.bio.trim() || !profileData.email.trim()) {
      toast.error("Bio and email are required");
      setAccordionValue((prev) =>
        prev.includes("personal") ? prev : [...prev, "personal"]
      );
      return;
    }

    try {
      setSaving(true);
      const education = profileData.education
        .map((edu) => ({
          degree: edu.degree.trim(),
          institution: edu.institution.trim(),
          year: edu.year.trim(),
        }))
        .filter((edu) => edu.degree || edu.institution || edu.year);

      const socialLinks = profileData.socialLinks
        .map((link) => ({
          platform: link.platform.trim(),
          url: link.url.trim(),
        }))
        .filter((link) => link.platform && link.url);

      const updatedProfileData: ProfileData = {
        ...profileData,
        name: profileData.name.trim(),
        title: profileData.title.trim(),
        bio: profileData.bio.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim(),
        location: profileData.location.trim(),
        education:
          education.length > 0
            ? education
            : [{ degree: "", institution: "", year: "" }],
        socialLinks:
          socialLinks.length > 0
            ? socialLinks
            : [
                { platform: "github", url: "" },
                { platform: "linkedin", url: "" },
              ],
      };

      if (profileImageFile) {
        try {
          const storageRef = ref(storage, "profile/profile-image");
          await uploadBytes(storageRef, profileImageFile);
          updatedProfileData.profileImage = await getDownloadURL(storageRef);
        } catch (uploadError) {
          console.error("Profile image upload failed:", uploadError);
          toast.error(
            "Could not upload profile image. Check Firebase Storage rules."
          );
          return;
        }
      }

      if (resumeFile) {
        try {
          const storageRef = ref(storage, "profile/resume");
          await uploadBytes(storageRef, resumeFile);
          updatedProfileData.resumeUrl = await getDownloadURL(storageRef);
        } catch (uploadError) {
          console.error("Resume upload failed:", uploadError);
          toast.error(
            "Profile will save without the resume file — Storage upload failed."
          );
        }
      }

      await setDoc(doc(db, "profile", "main"), updatedProfileData);
      setProfileData(updatedProfileData);
      setProfileImagePreview(updatedProfileData.profileImage || "");
      setProfileImageFile(null);
      setResumeFile(null);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save profile"
      );
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Accordion
        type="multiple"
        value={accordionValue}
        onValueChange={setAccordionValue}
        className="w-full"
      >
        <AccordionItem value="import" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="text-left">
              <p className="flex items-center gap-2 font-medium">
                <Sparkles className="size-4" />
                AI Import from Resume
              </p>
              <p className="text-xs font-normal text-muted-foreground">
                Upload a CV — Firecrawl + AI fill the form for you
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 rounded-lg border p-4 pt-1">
              <div className="space-y-2">
                <Label htmlFor="resume-import">Resume / CV</Label>
                <Input
                  id="resume-import"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf"
                  onChange={handleResumeChange}
                  disabled={importing}
                />
                {resumeFile ? (
                  <p className="text-xs text-muted-foreground">
                    Selected: {resumeFile.name}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => void handleImportResume()}
                disabled={importing || !resumeFile}
              >
                {importing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {importing ? "Importing…" : "Generate profile from resume"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Parses PDF/DOCX, then drafts profile fields. Skills are saved to
                the About section (what visitors see).
              </p>

              {importDraft ? (
                <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {importDraft.source.aiPolished ? (
                      <Badge variant="secondary">AI polished</Badge>
                    ) : (
                      <Badge variant="outline">Basic extract</Badge>
                    )}
                    <Badge variant="outline">{importDraft.source.filename}</Badge>
                    <Badge variant="outline">
                      {importDraft.skills.length} skills
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{importDraft.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {importDraft.title}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {importDraft.bio}
                    </p>
                  </div>
                  {importDraft.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {importDraft.skills.slice(0, 8).map((skill) => (
                        <Badge key={skill} variant="outline" className="font-normal">
                          {skill}
                        </Badge>
                      ))}
                      {importDraft.skills.length > 8 ? (
                        <Badge variant="outline" className="font-normal">
                          +{importDraft.skills.length - 8}
                        </Badge>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1"
                      onClick={applyImportDraft}
                    >
                      <Check className="size-3.5" />
                      Apply to form
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setImportDraft(null)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="personal" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="text-left">
              <p className="font-medium flex items-center gap-2">
                <User className="size-4" />
                Personal Information
              </p>
              <p className="text-xs font-normal text-muted-foreground">
                Contact details and bio
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
                    value={profileData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={profileData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Full Stack Developer"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  className="min-h-28"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., New York, USA"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="media" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="text-left">
              <p className="font-medium flex items-center gap-2">
                <ImageIcon className="size-4" />
                Media & Experience
              </p>
              <p className="text-xs font-normal text-muted-foreground">
                Photo, resume, and experience summary
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-1">
              <div className="space-y-2">
                <Label htmlFor="profileImage">Profile Image</Label>
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                />
                {(profileImagePreview || profileData.profileImage) && (
                  <div className="mt-2 overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profileImagePreview || profileData.profileImage}
                      alt="Profile"
                      className="max-h-48 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume">Resume file (saved with profile)</Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                />
                {resumeFile ? (
                  <p className="text-xs text-muted-foreground">
                    Selected: {resumeFile.name} — use AI Import above to autofill
                    fields
                  </p>
                ) : null}
                {profileData.resumeUrl ? (
                  <Button variant="link" className="h-auto px-0" asChild>
                    <a
                      href={profileData.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-3.5" />
                      View current resume
                    </a>
                  </Button>
                ) : null}
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Briefcase className="size-4" />
                  Experience Summary
                </Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="years">Years of Experience</Label>
                    <Input
                      id="years"
                      name="years"
                      value={profileData.experience.years}
                      onChange={handleExperienceChange}
                      placeholder="e.g., 5+"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="exp-description">Description</Label>
                    <Textarea
                      id="exp-description"
                      name="description"
                      value={profileData.experience.description}
                      onChange={handleExperienceChange}
                      className="min-h-24"
                      placeholder="Brief description of your experience"
                    />
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="education" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-left">
              <span className="font-medium flex items-center gap-2">
                <GraduationCap className="size-4" />
                Education
              </span>
              <Badge variant="secondary">{profileData.education.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-1">
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={addEducation}
                >
                  <Plus className="size-4" />
                  Add Education
                </Button>
              </div>
              {profileData.education.map((edu, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-lg border p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Education #{index + 1}
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove education?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Remove this education entry? Remember to save your
                            profile afterward.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => removeEducation(index)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor={`degree-${index}`}>Degree</Label>
                      <Input
                        id={`degree-${index}`}
                        value={edu.degree}
                        onChange={(e) =>
                          handleEducationChange(index, "degree", e.target.value)
                        }
                        placeholder="e.g., Bachelor of Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`institution-${index}`}>
                        Institution
                      </Label>
                      <Input
                        id={`institution-${index}`}
                        value={edu.institution}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "institution",
                            e.target.value
                          )
                        }
                        placeholder="e.g., University of Example"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`year-${index}`}>Year</Label>
                      <Input
                        id={`year-${index}`}
                        value={edu.year}
                        onChange={(e) =>
                          handleEducationChange(index, "year", e.target.value)
                        }
                        placeholder="e.g., 2020"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="socials" className="border-b-0">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-left">
              <span className="font-medium flex items-center gap-2">
                <Link2 className="size-4" />
                Social Links
              </span>
              <Badge variant="secondary">{profileData.socialLinks.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-1">
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={addSocialLink}
                >
                  <Plus className="size-4" />
                  Add Link
                </Button>
              </div>
              {profileData.socialLinks.map((link, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-lg border p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Social link #{index + 1}
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove social link?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Remove this social link? Remember to save your
                            profile afterward.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => removeSocialLink(index)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`platform-${index}`}>Platform</Label>
                      <Input
                        id={`platform-${index}`}
                        value={link.platform}
                        onChange={(e) =>
                          handleSocialLinkChange(
                            index,
                            "platform",
                            e.target.value
                          )
                        }
                        placeholder="e.g., github, linkedin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`url-${index}`}>URL</Label>
                      <Input
                        id={`url-${index}`}
                        type="url"
                        value={link.url}
                        onChange={(e) =>
                          handleSocialLinkChange(index, "url", e.target.value)
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="sticky bottom-0 z-10 border-t bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
