import type React from "react";
import { useState } from "react";

import { MapPin, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

export default function CreateCommunity() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    type: "public",
    password: "",
    categories: {
      books: true,
      furniture: true,
      electronics: true,
      clothing: true,
      kitchen: false,
      other: false,
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: checked,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle community creation logic here
    console.log(formData);
  };

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Create a Community</h1>
          <p className="text-muted-foreground">
            Set up a new community to start sharing items with others
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Community Details</CardTitle>
              <CardDescription>
                Provide information about your new community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Thomas More University"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your community and its purpose"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Geel, Belgium"
                    className="pl-10"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Community Image</Label>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6">
                  <Upload className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-center text-sm">
                    Drag and drop an image here, or click to browse
                  </p>
                  <Button variant="outline" className="mt-4">
                    Upload Image
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Community Type</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={handleTypeChange}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="font-normal">
                      Public - Anyone can join and view items
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="font-normal">
                      Private - Requires a password to join
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.type === "private" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Community Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password for your community"
                    value={formData.password}
                    onChange={handleChange}
                    required={formData.type === "private"}
                  />
                  <p className="text-muted-foreground text-xs">
                    Share this password with people you want to invite to your
                    community
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Item Categories</Label>
                <p className="text-muted-foreground mb-2 text-sm">
                  Select the categories of items that can be shared in your
                  community
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="books"
                      checked={formData.categories.books}
                      onCheckedChange={(checked) =>
                        handleCategoryChange("books", checked as boolean)
                      }
                    />
                    <Label htmlFor="books" className="font-normal">
                      Books
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="furniture"
                      checked={formData.categories.furniture}
                      onCheckedChange={(checked) =>
                        handleCategoryChange("furniture", checked as boolean)
                      }
                    />
                    <Label htmlFor="furniture" className="font-normal">
                      Furniture
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="electronics"
                      checked={formData.categories.electronics}
                      onCheckedChange={(checked) =>
                        handleCategoryChange("electronics", checked as boolean)
                      }
                    />
                    <Label htmlFor="electronics" className="font-normal">
                      Electronics
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="clothing"
                      checked={formData.categories.clothing}
                      onCheckedChange={(checked) =>
                        handleCategoryChange("clothing", checked as boolean)
                      }
                    />
                    <Label htmlFor="clothing" className="font-normal">
                      Clothing
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="kitchen"
                      checked={formData.categories.kitchen}
                      onCheckedChange={(checked) =>
                        handleCategoryChange("kitchen", checked as boolean)
                      }
                    />
                    <Label htmlFor="kitchen" className="font-normal">
                      Kitchen
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="other"
                      checked={formData.categories.other}
                      onCheckedChange={(checked) =>
                        handleCategoryChange("other", checked as boolean)
                      }
                    />
                    <Label htmlFor="other" className="font-normal">
                      Other
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#2E7D32] hover:bg-[#1B5E20]">
                Create Community
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
