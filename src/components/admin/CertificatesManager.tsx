"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { toast } from "sonner";
import {
  Award,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { db } from "@/firebase";
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

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  image: string;
  credentialUrl?: string;
  cloudinaryPublicId?: string;
  imageFile?: File;
}

const emptyCertificate = (): Certificate => ({
  id: "",
  title: "",
  issuer: "",
  date: "",
  description: "",
  image: "",
  credentialUrl: "",
});

export default function CertificatesManager() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCertificate, setCurrentCertificate] =
    useState<Certificate>(emptyCertificate());
  const [accordionValue, setAccordionValue] = useState<string[]>([
    "form",
    "list",
  ]);

  useEffect(() => {
    void fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const certificatesCollection = collection(db, "certificates");
      const certificatesSnapshot = await getDocs(certificatesCollection);
      const certificatesList = certificatesSnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Certificate[];

      certificatesList.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setCertificates(certificatesList);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentCertificate((prev) => ({ ...prev, [name]: value }));
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

      setCurrentCertificate((prev) => ({
        ...prev,
        imageFile: file,
        image: URL.createObjectURL(file),
      }));
    }
  };

  const resetForm = () => {
    setCurrentCertificate(emptyCertificate());
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error("Cloudinary is not configured");
      return;
    }

    try {
      setSaving(true);
      const { id, imageFile, image, ...certificateData } = currentCertificate;
      let imageUrl = image;
      let cloudinaryPublicId = currentCertificate.cloudinaryPublicId;

      if (imageFile) {
        toast.loading("Uploading image...");

        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder", "portfolio/certificates");
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

      const certificateDataToSave: {
        [key: string]: string | undefined;
      } = {
        ...certificateData,
        image: imageUrl,
      };
      if (cloudinaryPublicId) {
        certificateDataToSave.cloudinaryPublicId = cloudinaryPublicId;
      }

      if (isEditing) {
        const certRef = doc(db, "certificates", id);
        await updateDoc(certRef, certificateDataToSave);
        toast.success("Certificate updated successfully");
      } else {
        await addDoc(collection(db, "certificates"), certificateDataToSave);
        toast.success("Certificate added successfully");
      }

      resetForm();
      void fetchCertificates();
    } catch (error: unknown) {
      console.error("Error saving certificate:", error);
      toast.dismiss();
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save certificate";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (certificate: Certificate) => {
    setCurrentCertificate(certificate);
    setIsEditing(true);
    setAccordionValue((prev) =>
      prev.includes("form") ? prev : [...prev, "form"]
    );
  };

  const handleDelete = async (certificate: Certificate) => {
    try {
      await deleteDoc(doc(db, "certificates", certificate.id));
      toast.success("Certificate deleted successfully");
      void fetchCertificates();
    } catch (error) {
      console.error("Error deleting certificate:", error);
      toast.error("Failed to delete certificate");
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
              {isEditing ? "Edit Certificate" : "Add New Certificate"}
            </p>
            <p className="text-xs font-normal text-muted-foreground">
              {isEditing
                ? "Update certificate details below"
                : "Add a professional certification"}
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <form onSubmit={handleSubmit} className="space-y-6 pt-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={currentCertificate.title}
                  onChange={handleInputChange}
                  placeholder="e.g., AWS Certified Solutions Architect"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuer">Issuer</Label>
                <Input
                  id="issuer"
                  name="issuer"
                  value={currentCertificate.issuer}
                  onChange={handleInputChange}
                  placeholder="e.g., Amazon Web Services"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Issue Date</Label>
                <Input
                  id="date"
                  type="date"
                  name="date"
                  value={currentCertificate.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credentialUrl">
                  Credential URL{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="credentialUrl"
                  type="url"
                  name="credentialUrl"
                  value={currentCertificate.credentialUrl || ""}
                  onChange={handleInputChange}
                  placeholder="https://verify-certificate.com/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={currentCertificate.description}
                onChange={handleInputChange}
                className="min-h-28"
                placeholder="Describe what skills this certificate represents..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cert-image">Certificate Image</Label>
              <Input
                id="cert-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!isEditing && !currentCertificate.image}
              />
              {currentCertificate.image && (
                <div className="mt-2 overflow-hidden rounded-md border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentCertificate.image}
                    alt="Certificate preview"
                    className="max-h-48 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {isEditing ? (
                  <>
                    <Pencil className="size-4" />
                    {saving ? "Saving…" : "Update Certificate"}
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    {saving ? "Saving…" : "Add Certificate"}
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
            <span className="font-medium">Your Certificates</span>
            <Badge variant="secondary">{certificates.length}</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : certificates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Award className="mb-3 size-10 text-muted-foreground" />
              <p className="font-medium text-muted-foreground">
                No certificates yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first certificate using the form above
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {certificates.map((certificate) => (
                <Card
                  key={certificate.id}
                  className="gap-0 overflow-hidden py-0 shadow-none"
                >
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={certificate.image}
                      alt={certificate.title}
                      className="size-full object-cover object-top"
                    />
                  </div>
                  <CardHeader className="gap-1.5 px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge
                        variant="outline"
                        className="max-w-full truncate font-normal"
                        title={certificate.issuer}
                      >
                        {certificate.issuer}
                      </Badge>
                      {certificate.credentialUrl ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0"
                          asChild
                        >
                          <a
                            href={certificate.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View credential"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        </Button>
                      ) : null}
                    </div>
                    <CardTitle
                      className="line-clamp-2 text-base leading-snug"
                      title={certificate.title}
                    >
                      {certificate.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {new Date(certificate.date).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <CardDescription
                      className="line-clamp-3 text-xs leading-relaxed"
                      title={certificate.description}
                    >
                      {certificate.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="gap-2 border-t px-4 py-3 [.border-t]:pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(certificate)}
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
                          <AlertDialogTitle>
                            Delete certificate?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes &ldquo;{certificate.title}&rdquo; from
                            Firestore. The Cloudinary image will remain.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => void handleDelete(certificate)}
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
