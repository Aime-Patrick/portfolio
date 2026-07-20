"use client";

import { useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import {
  Briefcase,
  Code2,
  GraduationCap,
  Pencil,
  Plus,
  Save,
  Trash2,
  User,
  Loader2,
} from "lucide-react";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  Card,
  CardDescription,
  CardFooter,
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

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface Experience {
  id?: string;
  title: string;
  description: string;
  shortDescription?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

interface AboutData {
  name: string;
  title: string;
  bio: string;
  experience: Experience[];
  education: string;
  skills: string[];
  image: string;
  cloudinaryPublicId?: string;
}

const emptyExperience: Experience = {
  title: "",
  description: "",
  shortDescription: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
};

export default function AboutManager() {
  const [aboutData, setAboutData] = useState<AboutData>({
    name: "",
    title: "",
    bio: "",
    experience: [],
    education: "",
    skills: [],
    image: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(
    null
  );
  const [experienceForm, setExperienceForm] =
    useState<Experience>(emptyExperience);
  const [accordionValue, setAccordionValue] = useState<string[]>([
    "basics",
    "experience",
    "education",
    "skills",
    "image",
  ]);

  useEffect(() => {
    void fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const aboutDoc = doc(db, "about", "main");
      const aboutSnapshot = await getDoc(aboutDoc);

      if (aboutSnapshot.exists()) {
        const data = aboutSnapshot.data() as AboutData & {
          experience?: Experience[] | string;
        };
        let experiences: Experience[] = [];
        if (Array.isArray(data.experience)) {
          experiences = data.experience;
        } else if (
          typeof data.experience === "string" &&
          data.experience.trim()
        ) {
          experiences = [
            {
              title: "Experience",
              description: data.experience,
              shortDescription: data.experience.substring(0, 100) + "...",
            },
          ];
        }

        setAboutData({
          ...data,
          experience: experiences,
          skills: data.skills || [],
        });
        setImagePreview(data.image || "");
      }
    } catch (error) {
      console.error("Error fetching about data:", error);
      toast.error("Failed to load about data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAboutData((prev) => ({ ...prev, [name]: value }));
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
    setAboutData((prev) => {
      const { cloudinaryPublicId: _, ...rest } = prev;
      return { ...rest, image: "" };
    });
    toast.success("Image removed!");
  };

  const addSkill = () => {
    if (skillInput.trim() && !aboutData.skills.includes(skillInput.trim())) {
      setAboutData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setAboutData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const resetExperienceForm = () => {
    setExperienceForm(emptyExperience);
    setEditingExperience(null);
    setShowExperienceForm(false);
  };

  const handleExperienceFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setExperienceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddExperience = () => {
    if (!experienceForm.title.trim() || !experienceForm.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    const newExperience: Experience = {
      ...experienceForm,
      id: editingExperience?.id || `exp-${Date.now()}`,
      shortDescription:
        experienceForm.shortDescription ||
        experienceForm.description.substring(0, 100) + "...",
    };

    if (editingExperience) {
      setAboutData((prev) => ({
        ...prev,
        experience: prev.experience.map((exp) =>
          exp.id === editingExperience.id ? newExperience : exp
        ),
      }));
      toast.success("Experience updated!");
    } else {
      setAboutData((prev) => ({
        ...prev,
        experience: [...prev.experience, newExperience],
      }));
      toast.success("Experience added!");
    }

    resetExperienceForm();
  };

  const handleEditExperience = (exp: Experience) => {
    setExperienceForm(exp);
    setEditingExperience(exp);
    setShowExperienceForm(true);
    setAccordionValue((prev) =>
      prev.includes("experience") ? prev : [...prev, "experience"]
    );
  };

  const handleRemoveExperience = (expId: string | undefined) => {
    if (!expId) return;
    setAboutData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== expId),
    }));
    toast.success("Experience removed!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error("Cloudinary is not configured");
      return;
    }

    try {
      setSaving(true);
      let imageUrl = aboutData.image;
      let cloudinaryPublicId = aboutData.cloudinaryPublicId;

      if (imageFile) {
        toast.loading("Uploading image...");

        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder", "portfolio/about");
        formData.append("max_file_size", "20971520");

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            (errorData as { error?: { message?: string } })?.error?.message ||
            "Failed to upload image";
          throw new Error(errorMessage);
        }

        const data = await response.json();
        imageUrl = data.secure_url;
        cloudinaryPublicId = data.public_id;

        toast.dismiss();
        toast.success("Image uploaded!");
      }

      const aboutDoc = doc(db, "about", "main");
      const dataToSave: Record<string, unknown> = {
        ...aboutData,
        image: imageUrl,
      };
      if (cloudinaryPublicId) {
        dataToSave.cloudinaryPublicId = cloudinaryPublicId;
      }
      await setDoc(aboutDoc, dataToSave);

      toast.success("About section updated successfully!");
      setImageFile(null);
    } catch (error: unknown) {
      console.error("Error saving about data:", error);
      toast.dismiss();
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save about data";
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
              <p className="font-medium">Basic Information</p>
              <p className="text-xs font-normal text-muted-foreground">
                Name, title, and introduction
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-1">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="size-3.5" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={aboutData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., NDAGIJIMANA Aime Patrick"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2">
                    <Briefcase className="size-3.5" />
                    Professional Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={aboutData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Full Stack Developer"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Introduction</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={aboutData.bio}
                  onChange={handleInputChange}
                  className="min-h-28"
                  placeholder="Tell visitors about yourself..."
                  required
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="experience" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-left">
              <span className="font-medium">Experience</span>
              <Badge variant="secondary">{aboutData.experience.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-1">
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    resetExperienceForm();
                    setShowExperienceForm(true);
                  }}
                >
                  <Plus className="size-4" />
                  Add Experience
                </Button>
              </div>

              {showExperienceForm && (
                <div className="space-y-4 rounded-lg border p-4">
                  <p className="text-sm font-medium">
                    {editingExperience ? "Edit Experience" : "Add Experience"}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="exp-title">Job Title</Label>
                      <Input
                        id="exp-title"
                        name="title"
                        value={experienceForm.title}
                        onChange={handleExperienceFormChange}
                        placeholder="e.g., Full Stack Developer"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exp-company">Company</Label>
                      <Input
                        id="exp-company"
                        name="company"
                        value={experienceForm.company}
                        onChange={handleExperienceFormChange}
                        placeholder="Company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exp-start">Start Date</Label>
                      <Input
                        id="exp-start"
                        name="startDate"
                        value={experienceForm.startDate}
                        onChange={handleExperienceFormChange}
                        placeholder="e.g., Jan 2020"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exp-end">End Date</Label>
                      <Input
                        id="exp-end"
                        name="endDate"
                        value={experienceForm.endDate}
                        onChange={handleExperienceFormChange}
                        disabled={experienceForm.isCurrent}
                        placeholder={
                          experienceForm.isCurrent ? "Current" : "e.g., Dec 2023"
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isCurrent"
                      checked={!!experienceForm.isCurrent}
                      onCheckedChange={(checked) =>
                        setExperienceForm((prev) => ({
                          ...prev,
                          isCurrent: checked === true,
                          endDate: checked === true ? "" : prev.endDate,
                        }))
                      }
                    />
                    <Label htmlFor="isCurrent">Current position</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exp-location">Location</Label>
                    <Input
                      id="exp-location"
                      name="location"
                      value={experienceForm.location}
                      onChange={handleExperienceFormChange}
                      placeholder="e.g., Remote, Kigali, Rwanda"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exp-short">Short Description</Label>
                    <Textarea
                      id="exp-short"
                      name="shortDescription"
                      value={experienceForm.shortDescription}
                      onChange={handleExperienceFormChange}
                      className="min-h-16"
                      placeholder="Brief card preview (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exp-desc">Full Description</Label>
                    <Textarea
                      id="exp-desc"
                      name="description"
                      value={experienceForm.description}
                      onChange={handleExperienceFormChange}
                      className="min-h-28"
                      placeholder="Detailed description..."
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={handleAddExperience}
                    >
                      {editingExperience ? (
                        <>
                          <Pencil className="size-4" />
                          Update Experience
                        </>
                      ) : (
                        <>
                          <Plus className="size-4" />
                          Add Experience
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetExperienceForm}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {aboutData.experience.length === 0 && !showExperienceForm ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Briefcase className="mb-3 size-10 text-muted-foreground" />
                  <p className="font-medium text-muted-foreground">
                    No experience yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add roles and work history above
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {aboutData.experience.map((exp, index) => (
                    <Card
                      key={exp.id || index}
                      className="gap-0 overflow-hidden py-0 shadow-none"
                    >
                      <CardHeader className="gap-1.5 px-4 py-3">
                        {exp.company ? (
                          <Badge
                            variant="outline"
                            className="max-w-full truncate font-normal"
                          >
                            {exp.company}
                          </Badge>
                        ) : null}
                        <CardTitle className="line-clamp-2 text-base leading-snug">
                          {exp.title}
                        </CardTitle>
                        {(exp.startDate || exp.endDate || exp.isCurrent) && (
                          <p className="text-xs text-muted-foreground">
                            {exp.startDate || "N/A"}
                            {exp.isCurrent
                              ? " – Present"
                              : exp.endDate
                                ? ` – ${exp.endDate}`
                                : ""}
                          </p>
                        )}
                        <CardDescription className="line-clamp-3 text-xs leading-relaxed">
                          {exp.shortDescription ||
                            exp.description.substring(0, 100) + "..."}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="gap-2 border-t px-4 py-3 [.border-t]:pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditExperience(exp)}
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex-1 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove experience?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Remove this experience entry? Remember to save
                                About Me afterward.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() =>
                                  handleRemoveExperience(exp.id)
                                }
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="education" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="text-left">
              <p className="font-medium flex items-center gap-2">
                <GraduationCap className="size-4" />
                Education
              </p>
              <p className="text-xs font-normal text-muted-foreground">
                Degrees and institutions
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              <Label htmlFor="education">Education Background</Label>
              <Textarea
                id="education"
                name="education"
                value={aboutData.education}
                onChange={handleInputChange}
                className="min-h-24"
                placeholder="List degrees and institutions..."
                required
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="skills" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-left">
              <span className="font-medium flex items-center gap-2">
                <Code2 className="size-4" />
                Skills
              </span>
              <Badge variant="secondary">{aboutData.skills.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-1">
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Add a skill (e.g., React, TypeScript)"
                />
                <Button type="button" variant="secondary" onClick={addSkill}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
              {aboutData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {aboutData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                      {skill}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-5"
                        onClick={() => removeSkill(skill)}
                        aria-label={`Remove ${skill}`}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No skills added yet
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="image" className="border-b-0">
          <AccordionTrigger className="hover:no-underline">
            <div className="text-left">
              <p className="font-medium">Profile Image</p>
              <p className="text-xs font-normal text-muted-foreground">
                Upload an image (max 20 MB)
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-1">
              <div className="space-y-2">
                <Label htmlFor="about-image">Image File</Label>
                <Input
                  ref={imageInputRef}
                  id="about-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              {(imagePreview || aboutData.image) && (
                <div className="relative inline-block overflow-hidden rounded-md border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview || aboutData.image}
                    alt="Profile preview"
                    onClick={() => imageInputRef.current?.click()}
                    className="max-h-48 cursor-pointer object-cover"
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 size-8"
                        aria-label="Delete image"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent size="sm">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete image?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the current image?
                          Remember to save About Me afterward.
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
                </div>
              )}

              <Separator />

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
                      Save About Me
                    </>
                  )}
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </form>
  );
}
