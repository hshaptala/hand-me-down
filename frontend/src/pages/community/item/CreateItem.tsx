import type React from "react";
import { useState } from "react";

import { Upload } from "lucide-react";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function CreateItem() {
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null as File | null,
  });

  // Mock community data
  const community = {
    id: id ? Number.parseInt(id) : 0,
    name: "Thomas More University",
    categories: [
      "Books",
      "Furniture",
      "Electronics",
      "Clothing",
      "Kitchen",
      "Other",
    ],
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle item creation logic here
    console.log(formData);
  };

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Post an Item</h1>
          <p className="text-muted-foreground">
            Share an item with the {community.name} community
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>
                Provide information about the item you want to donate
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
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {community.categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Item Image (Optional)</Label>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6">
                  {formData.image ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={
                          URL.createObjectURL(formData.image) ||
                          "/placeholder.svg"
                        }
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
                      <Upload className="text-muted-foreground mb-2 h-8 w-8" />
                      <p className="text-muted-foreground text-center text-sm">
                        Drag and drop an image here, or click to browse
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
                        Upload Image
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  Adding an image helps others understand what you're offering
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#2E7D32] hover:bg-[#1B5E20]">
                Post Item
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
