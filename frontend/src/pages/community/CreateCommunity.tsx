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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { createCommunity } from "@/service/community.service";

export default function CreateCommunity() {  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    type: "public",
    password: "",
    image: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
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
      if (file.type.startsWith('image/')) {
        setFormData((prev) => ({ ...prev, image: file }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await createCommunity({
        name: formData.name,
        location: formData.location,
        description: formData.description,
        password: formData.type === "private" ? formData.password : undefined,
        visibility: formData.type === "private" ? "Private" : "Public",
        image: formData.image,
      });
      setSuccess(true);
    } catch (err: unknown) {
      let message = "Failed to create community";
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data &&
        typeof err.response.data.message === "string"
      ) {
        message = (err.response.data as { message: string }).message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
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
              </div>              <div className="space-y-2">
                <Label>Community Image</Label>
                <div 
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                    dragActive 
                      ? 'border-[#2E7D32] bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {formData.image ? (
                    <div className="flex flex-col items-center space-y-2">
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="Preview"
                        className="h-32 w-32 rounded-lg object-cover"
                      />
                      <p className="text-sm text-gray-600">{formData.image.name}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData((prev) => ({ ...prev, image: null }))}
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
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Button variant="outline" className="mt-4" type="button" asChild>
                      <span>
                        {formData.image ? "Change Image" : "Upload Image"}
                      </span>
                    </Button>
                  </label>
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
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#2E7D32] hover:bg-[#1B5E20]"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Community"}
              </Button>
            </CardFooter>
          </Card>
        </form>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-md bg-green-50 p-4 text-sm text-green-800">
            Community created successfully!
          </div>
        )}
      </div>
    </div>
  );
}
