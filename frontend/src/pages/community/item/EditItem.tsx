import { useState, useEffect } from "react";

import { Upload, ArrowLeft } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAllCategories } from "@/models/categories";
import type { Item } from "@/models/item";
import { fetchItem, updateItem, deleteItem } from "@/service/item.service";

export default function EditItem() {
  const { id, itemId } = useParams<{ id: string; itemId: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    keywords: [] as string[],
    image: null as File | null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = getAllCategories();

  useEffect(() => {
    if (!id || !itemId) return;

    const loadItem = async () => {
      try {
        const itemData = await fetchItem(Number(itemId));
        setItem(itemData);
        setFormData({
          title: itemData.title,
          description: itemData.description || "",
          keywords: itemData.keywords || [],
          image: null,
        });
      } catch (error) {
        console.error("Error loading item:", error);
        toast.error("Failed to load item data");
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id, itemId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, keywords: [value] }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setFormData((prev) => ({ ...prev, image: file }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !itemId) {
      toast.error("Missing item or community ID");
      return;
    }

    setSubmitting(true);
    try {
      await updateItem(Number(itemId), {
        title: formData.title,
        description: formData.description,
        keywords: formData.keywords,
        image: formData.image || undefined,
      });

      toast.success("Item updated successfully!");
      navigate(`/communities/${id}/items/${itemId}`);
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete item
  const handleDelete = async () => {
    if (!item) return;

    setIsDeleting(true);
    try {
      await deleteItem(item.id);
      toast.success("Item deleted successfully!");
      setDeleteDialogOpen(false);
      navigate(`/communities/${id}`);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-[#2E7D32]"></div>
          <p className="text-muted-foreground">Loading item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-500">Item not found</p>
          <Button asChild>
            <Link to={`/communities/${id}`}>Back to Community</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link to={`/communities/${id}/items/${itemId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to item</span>
            </Link>
          </Button>
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold">Edit Item</h1>
            <p className="text-muted-foreground">
              Update your item information
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>
                Update information about your item
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Item Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Desk Lamp"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your item, including its condition and any other relevant details"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.keywords[0] || ""}
                  onValueChange={handleCategoryChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Item Image (optional)</Label>
                <div
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 ${
                    dragActive
                      ? "border-[#2E7D32] bg-green-50"
                      : "border-gray-300"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {formData.image ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="Item preview"
                        className="mb-4 max-h-48 object-contain"
                      />
                      <p className="text-sm">{formData.image.name}</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, image: null }))
                        }
                        type="button"
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <>
                      {item.imageUrl && (
                        <div className="mb-4 flex flex-col items-center">
                          <img
                            src={
                              import.meta.env.VITE_API_BASE_URL + item.imageUrl
                            }
                            alt="Current item"
                            className="mb-2 max-h-48 object-contain"
                          />
                          <p className="text-muted-foreground text-sm">
                            Current image
                          </p>
                        </div>
                      )}
                      <Upload className="text-muted-foreground mb-2 h-8 w-8" />
                      <p className="text-muted-foreground text-center text-sm">
                        Drag and drop a new image here, or click to browse
                      </p>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() =>
                          document.getElementById("image")?.click()
                        }
                        type="button"
                      >
                        Choose New Image
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  Leave empty to keep the current image
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(`/communities/${id}/items/${itemId}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                <Dialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      type="button"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={submitting || isDeleting}
                    >
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Item</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this item? This action
                        cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  type="submit"
                  className="bg-[#2E7D32] hover:bg-[#1B5E20]"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
