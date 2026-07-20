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
import { Pencil, Trash2, Plus, Wrench } from "lucide-react";
import { db } from "@/firebase";
import {
  getServiceIconComponent,
  serviceIconOptions,
} from "@/lib/serviceIcons";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  borderClass?: string;
}

const emptyService = (): Service => ({
  id: "",
  icon: "FiLayout",
  title: "",
  description: "",
  borderClass: "",
});

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Service>(emptyService());
  const [accordionValue, setAccordionValue] = useState<string[]>([
    "form",
    "list",
  ]);

  useEffect(() => {
    void fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const servicesSnapshot = await getDocs(collection(db, "services"));
      const servicesList = servicesSnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Service[];
      setServices(servicesList);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentService((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setCurrentService(emptyService());
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...serviceData } = currentService;

      if (isEditing) {
        await updateDoc(doc(db, "services", id), serviceData);
        toast.success("Service updated successfully");
      } else {
        await addDoc(collection(db, "services"), serviceData);
        toast.success("Service added successfully");
      }

      resetForm();
      void fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    }
  };

  const handleEdit = (service: Service) => {
    setCurrentService(service);
    setIsEditing(true);
    setAccordionValue((prev) =>
      prev.includes("form") ? prev : [...prev, "form"]
    );
  };

  const handleDelete = async (service: Service) => {
    try {
      await deleteDoc(doc(db, "services", service.id));
      toast.success("Service deleted successfully");
      void fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    }
  };

  const renderIconPreview = (iconName: string) =>
    getServiceIconComponent(iconName, 32, "");

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
              {isEditing ? "Edit Service" : "Add New Service"}
            </p>
            <p className="text-xs font-normal text-muted-foreground">
              {isEditing
                ? "Update service details below"
                : "Create a new service for the portfolio"}
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
                  value={currentService.title}
                  onChange={handleInputChange}
                  placeholder="Service title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={currentService.icon}
                  onValueChange={(value) =>
                    setCurrentService((prev) => ({ ...prev, icon: value }))
                  }
                  required
                >
                  <SelectTrigger id="icon" className="w-full">
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {serviceIconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <span className="[&_svg]:size-4">{option.preview}</span>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={currentService.description}
                onChange={handleInputChange}
                placeholder="Describe your service..."
                className="min-h-28"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="borderClass">
                Border Class{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="borderClass"
                name="borderClass"
                value={currentService.borderClass || ""}
                onChange={handleInputChange}
                placeholder="e.g. second"
              />
              <p className="text-xs text-muted-foreground">
                Used for special styling on the frontend
              </p>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {isEditing ? (
                  <>
                    <Pencil className="size-4" />
                    Update Service
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Add Service
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
            <span className="font-medium">Your Services</span>
            <Badge variant="secondary">{services.length}</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wrench className="mb-3 size-10 text-muted-foreground" />
              <p className="font-medium text-muted-foreground">No services yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first service using the form above
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="gap-0 overflow-hidden py-0 shadow-none"
                >
                  <CardHeader className="gap-1.5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
                        {renderIconPreview(service.icon)}
                      </div>
                      <CardTitle
                        className="line-clamp-2 text-base leading-snug"
                        title={service.title}
                      >
                        {service.title}
                      </CardTitle>
                    </div>
                    <CardDescription
                      className="line-clamp-3 text-xs leading-relaxed"
                      title={service.description}
                    >
                      {service.description}
                    </CardDescription>
                    {service.borderClass ? (
                      <Badge
                        variant="outline"
                        className="max-w-full truncate font-normal"
                      >
                        {service.borderClass}
                      </Badge>
                    ) : null}
                  </CardHeader>
                  <CardFooter className="gap-2 border-t px-4 py-3 [.border-t]:pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(service)}
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
                          <AlertDialogTitle>Delete service?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently removes &ldquo;{service.title}
                            &rdquo;.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => void handleDelete(service)}
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
