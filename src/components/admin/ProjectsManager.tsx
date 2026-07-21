"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "sonner";
import {
  FolderKanban,
  Pencil,
  Trash2,
  Plus,
  Link2,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import { auth, db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
import type { ProjectImportDraft } from "@/lib/projectImport";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface Project {
  id: string;
  image: string;
  subtitle: string;
  title: string;
  description: string;
  links: { url: string; label: string }[];
  imageFile?: File;
  cloudinaryPublicId?: string;
}

const emptyProject = (): Project => ({
  id: "",
  image: "",
  subtitle: "",
  title: "",
  description: "",
  links: [
    { url: "", label: "GitHub" },
    { url: "", label: "Live" },
  ],
});

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [importDraft, setImportDraft] = useState<ProjectImportDraft | null>(
    null
  );
  const [currentProject, setCurrentProject] = useState<Project>(emptyProject());
  const [accordionValue, setAccordionValue] = useState<string[]>([
    "form",
    "list",
  ]);

  useEffect(() => {
    void fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsSnapshot = await getDocs(collection(db, "projects"));
      const projectsList = projectsSnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Project[];
      setProjects(projectsList);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleLinkChange = (
    index: number,
    field: "url" | "label",
    value: string
  ) => {
    const updatedLinks = [...currentProject.links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setCurrentProject((prev) => ({ ...prev, links: updatedLinks }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const maxSize = 20 * 1024 * 1024;

      if (file.size > maxSize) {
        toast.error(
          `File size too large. Maximum size is 20 MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB`
        );
        e.target.value = "";
        return;
      }

      setCurrentProject((prev) => ({
        ...prev,
        imageFile: file,
        image: URL.createObjectURL(file),
      }));
    }
  };

  const handleFetchFromUrl = async () => {
    if (!websiteUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      setFetchingUrl(true);
      setImportDraft(null);
      const toastId = toast.loading("Scraping with Firecrawl + AI…");

      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.dismiss(toastId);
        toast.error("Sign in again to import from URL");
        return;
      }

      const response = await fetch("/api/projects/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: websiteUrl.trim() }),
      });

      const data = (await response.json()) as
        | ProjectImportDraft
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Failed to import project from URL"
        );
      }

      setImportDraft(data as ProjectImportDraft);
      toast.dismiss(toastId);
      toast.success("Draft ready — review and apply");
    } catch (error) {
      console.error("Error importing project:", error);
      toast.dismiss();
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to import. Enter details manually."
      );
    } finally {
      setFetchingUrl(false);
    }
  };

  const applyImportDraft = () => {
    if (!importDraft) return;
    setCurrentProject((prev) => ({
      ...prev,
      title: importDraft.title,
      subtitle: importDraft.subtitle,
      description: importDraft.description,
      image: importDraft.image || prev.image,
      links: [
        {
          url: importDraft.links[0]?.url || "",
          label: importDraft.links[0]?.label || "GitHub",
        },
        {
          url: importDraft.links[1]?.url || importDraft.url,
          label: importDraft.links[1]?.label || "Live",
        },
      ],
    }));
    setWebsiteUrl(importDraft.url);
    setImportDraft(null);
    toast.success("Applied to form — edit anything before saving");
  };

  const resetForm = () => {
    setCurrentProject(emptyProject());
    setWebsiteUrl("");
    setImportDraft(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error(
        "Cloudinary is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env file"
      );
      return;
    }

    try {
      const { id, imageFile, image, ...projectData } = currentProject;
      const validLinks = currentProject.links.filter(
        (link) => link.url.trim() !== ""
      );

      let imageUrl = image;
      let cloudinaryPublicId = currentProject.cloudinaryPublicId;

      if (imageFile) {
        toast.loading("Uploading image to Cloudinary...");

        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder", "portfolio/projects");
        formData.append("max_file_size", "20971520");

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData?.error?.message ||
            "Failed to upload image to Cloudinary";
          throw new Error(errorMessage);
        }

        const data = await response.json();
        imageUrl = data.secure_url;
        cloudinaryPublicId = data.public_id;

        toast.dismiss();
        toast.success("Image uploaded successfully!");
      } else if (
        image &&
        image.startsWith("http") &&
        !image.includes("cloudinary.com") &&
        !image.includes("data:")
      ) {
        toast.loading("Uploading image from URL to Cloudinary...");

        try {
          const formData = new FormData();
          formData.append("file", image);
          formData.append("upload_preset", UPLOAD_PRESET);
          formData.append("folder", "portfolio/projects");

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            { method: "POST", body: formData }
          );

          if (!response.ok) {
            throw new Error("Failed to upload image from URL to Cloudinary");
          }

          const data = await response.json();
          imageUrl = data.secure_url;
          cloudinaryPublicId = data.public_id;

          toast.dismiss();
          toast.success("Image uploaded to Cloudinary!");
        } catch (error) {
          console.error("Error uploading external image:", error);
          toast.dismiss();
          toast.error("Could not upload image to Cloudinary, using external URL");
        }
      }

      const projectDataToSave: {
        [key: string]: string | { url: string; label: string }[] | undefined;
      } = {
        ...projectData,
        links: validLinks,
        image: imageUrl,
      };
      if (cloudinaryPublicId) {
        projectDataToSave.cloudinaryPublicId = cloudinaryPublicId;
      }

      if (isEditing) {
        await updateDoc(doc(db, "projects", id), projectDataToSave);
        toast.success("Project updated successfully");
      } else {
        // createdAt lets the assistant treat the newest project as the "current" one.
        await addDoc(collection(db, "projects"), {
          ...projectDataToSave,
          createdAt: serverTimestamp(),
        });
        toast.success("Project added successfully");
      }

      resetForm();
      void fetchProjects();
    } catch (error: unknown) {
      console.error("Error saving project:", error);
      toast.dismiss();
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save project. Check console for details.";
      toast.error(errorMessage);
    }
  };

  const handleEdit = (project: Project) => {
    setCurrentProject({
      ...project,
      links:
        project.links?.length >= 2
          ? project.links
          : [
              { url: "", label: "GitHub" },
              { url: "", label: "Live" },
              ...(project.links || []),
            ].slice(0, 2),
    });
    setIsEditing(true);
    setAccordionValue((prev) =>
      prev.includes("form") ? prev : [...prev, "form"]
    );
  };

  const handleDelete = async (project: Project) => {
    try {
      await deleteDoc(doc(db, "projects", project.id));
      toast.success("Project deleted successfully");
      void fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  return (
    <Accordion
      type="multiple"
      value={accordionValue}
      onValueChange={setAccordionValue}
      className="w-full"
    >
      <AccordionItem value="form" className="border-b">
        <AccordionTrigger className="hover:no-underline">
          <div className="text-left">
            <p className="font-medium">
              {isEditing ? "Edit Project" : "Add New Project"}
            </p>
            <p className="text-xs font-normal text-muted-foreground">
              {isEditing
                ? "Update project details below"
                : "Fill in the form or import from a URL"}
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <form onSubmit={handleSubmit} className="space-y-6 pt-1">
            <div className="space-y-3 rounded-lg border p-4">
              <Label htmlFor="websiteUrl" className="flex items-center gap-2">
                <Sparkles className="size-4" />
                AI Import from URL
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="websiteUrl"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => {
                    setWebsiteUrl(e.target.value);
                    setImportDraft(null);
                  }}
                  placeholder="https://example.com"
                  className="flex-1"
                  disabled={fetchingUrl}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleFetchFromUrl()}
                  disabled={fetchingUrl || !websiteUrl.trim()}
                >
                  {fetchingUrl ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  {fetchingUrl ? "Importing…" : "Import"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Firecrawl scrapes the page, then AI drafts title, subtitle, and
                description. Review before applying.
              </p>

              {importDraft ? (
                <div className="overflow-hidden rounded-lg border bg-muted/30">
                  {importDraft.image ? (
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={importDraft.image}
                        alt="Imported preview"
                        className="size-full object-cover object-top"
                      />
                    </div>
                  ) : null}
                  <div className="space-y-2 p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {importDraft.source.aiPolished ? (
                        <Badge variant="secondary">AI polished</Badge>
                      ) : (
                        <Badge variant="outline">Meta fallback</Badge>
                      )}
                      {importDraft.source.hasScreenshot ? (
                        <Badge variant="outline">Screenshot</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm font-semibold leading-snug">
                      {importDraft.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {importDraft.subtitle}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {importDraft.description}
                    </p>
                    <div className="flex gap-2 pt-1">
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
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={currentProject.title}
                  onChange={handleInputChange}
                  placeholder="Project title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={currentProject.subtitle}
                  onChange={handleInputChange}
                  placeholder="Category"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={currentProject.description}
                onChange={handleInputChange}
                placeholder="Describe your project..."
                className="min-h-28"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Project Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!isEditing && !currentProject.image}
              />
              {currentProject.image && (
                <div className="mt-2 overflow-hidden rounded-md border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentProject.image}
                    alt="Project preview"
                    className="max-h-48 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Link2 className="size-4" />
                Project Links
              </Label>
              {currentProject.links.map((link, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2"
                >
                  <div className="space-y-2">
                    <Label htmlFor={`link-label-${index}`}>
                      Label{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id={`link-label-${index}`}
                      value={link.label}
                      onChange={(e) =>
                        handleLinkChange(index, "label", e.target.value)
                      }
                      placeholder="e.g. GitHub, Live Demo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`link-url-${index}`}>
                      URL{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id={`link-url-${index}`}
                      type="url"
                      value={link.url}
                      onChange={(e) =>
                        handleLinkChange(index, "url", e.target.value)
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {isEditing ? (
                  <>
                    <Pencil className="size-4" />
                    Update Project
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Add Project
                  </>
                )}
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="list" className="border-b-0">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2 text-left">
            <span className="font-medium">Your Projects</span>
            <Badge variant="secondary">{projects.length}</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="mb-3 size-10 text-muted-foreground" />
              <p className="font-medium text-muted-foreground">No projects yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first project using the form above
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="gap-0 overflow-hidden py-0 shadow-none"
                >
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.image}
                      alt={project.title}
                      className="size-full object-cover object-top"
                    />
                  </div>
                  <CardHeader className="gap-1.5 px-4 py-3">
                    <Badge
                      variant="outline"
                      className="max-w-full truncate font-normal"
                      title={project.subtitle}
                    >
                      {project.subtitle}
                    </Badge>
                    <CardTitle
                      className="line-clamp-2 text-base leading-snug"
                      title={project.title}
                    >
                      {project.title}
                    </CardTitle>
                    <CardDescription
                      className="line-clamp-3 text-xs leading-relaxed"
                      title={project.description}
                    >
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="gap-2 border-t px-4 py-3 [.border-t]:pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(project)}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
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
                          <AlertDialogTitle>Delete project?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes &ldquo;{project.title}&rdquo; from
                            Firestore. The Cloudinary image will remain.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => void handleDelete(project)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
