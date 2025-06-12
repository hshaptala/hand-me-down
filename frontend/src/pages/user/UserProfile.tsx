import type React from "react";
import { useState, useEffect, useRef } from "react";

import {
  Gift,
  Settings,
  User,
  Upload,
  Bell,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";

import Container from "@/components/layout/Container";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import supabase from "@/lib/supabase";
import { fetchUserBySupabaseId, uploadAvatar } from "@/service/user.service";
import * as UserAPIModels from "@/models/user";
import type { Community } from "@/models/community";
import { fetchUserCommunities } from "@/service/community.service";

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const avatarUploadRef = useRef<HTMLInputElement>(null) ;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);

  // Load user data
  useEffect(() => {

    if (user) {
      const metadata = user.user_metadata || {};
      setFormData({
        firstName: metadata.first_name || "",
        lastName: metadata.last_name || "",
        email: user.email || "",
        bio: metadata.bio || "",
        location: metadata.location || "",
      });
      fetchAvatar(user.id);
      fetchCommunities(user.id);
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          full_name: `${formData.firstName} ${formData.lastName}`,
          bio: formData.bio,
          location: formData.location,
        },
      });

      if (error) {
        throw error;
      }

      setSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An error occurred while updating your profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommunities = async(userId: string)=>{
    const u: UserAPIModels.User = await fetchUserBySupabaseId(userId);
    if (u){
      const c: Community[] = await fetchUserCommunities(u.id);
      setUserCommunities(c);
    }
  }

  const fetchAvatar = async(userId: string)=>{
    const u: UserAPIModels.User = await fetchUserBySupabaseId(userId);
    setAvatarUrl(u.avatarUrl ? u.avatarUrl + "?" + new Date().getTime() : null);
  }

  const openAvatarSelector = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!avatarUploadRef || !avatarUploadRef.current) return;
    avatarUploadRef.current.click();
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get file
    const files = e.target.files;
    if (!files) return;
    const file = files[0];
    
    // Send it to the api
    await uploadAvatar(file);
    if (user !== null) fetchAvatar(user.id);
  }
  
  return (
    <Container className="py-10">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={avatarUrl !== null ? import.meta.env.VITE_API_BASE_URL + avatarUrl : "/placeholder.svg?height=96&width=96"}
                      alt={formData.firstName}
                    />
                  </Avatar>
                  <form>
                    <Button
                      size="sm"
                      className="absolute right-0 bottom-0 h-8 w-8 rounded-full bg-[#2E7D32] p-0"
                      onClick={openAvatarSelector}
                    >
                      <Upload className="h-4 w-4" />
                      <span className="sr-only">Upload photo</span>
                    </Button>
                    <input ref={avatarUploadRef} type='file' hidden onChange={handleAvatarUpload}/>
                  </form>
                </div>
                <div className="space-y-1 text-center">
                  <h2 className="text-2xl font-bold">{`${formData.firstName} ${formData.lastName}`}</h2>
                  <p className="text-muted-foreground text-sm">
                    {formData.location || "No location set"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Member since{" "}
                    {new Date(
                      user?.created_at || Date.now(),
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-muted-foreground text-xs">Donated</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-muted-foreground text-xs">Received</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-1">
                <h3 className="mb-3 text-sm font-medium">My Communities</h3>
                <div className="flex flex-wrap gap-2">
                  {userCommunities.length === 0 ? (
                    <Badge variant="secondary">No communities yet</Badge>
                  ) : (
                    userCommunities.map((community)=>(
                      <Link to={`/communities/${community.id}`}>
                        <Avatar className="h-9 w-9" title={community.name}>
                          <AvatarImage
                          src={import.meta.env.VITE_API_BASE_URL +
                                  community.imageUrl
                              }
                          alt={community.name}
                          />
                        </Avatar>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <Link
                  to="/conversations"
                  className="flex items-center gap-2 text-sm transition-colors hover:text-[#2E7D32]"
                >
                  <Bell className="h-4 w-4" />
                  <span>Messages</span>
                </Link>
                <Link
                  to="/my-items"
                  className="flex items-center gap-2 text-sm transition-colors hover:text-[#2E7D32]"
                >
                  <Gift className="h-4 w-4" />
                  <span>My Items</span>
                </Link>
                <button
                  className="flex w-full items-center cursor-pointer gap-2 text-left text-sm text-red-500 transition-colors hover:text-red-600"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs
            defaultValue="profile"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader className="mt-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      View and update your profile information
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() =>
                      isEditing ? handleSaveProfile() : setIsEditing(true)
                    }
                    className={
                      isEditing ? "" : "bg-[#2E7D32] hover:bg-[#1B5E20]"
                    }
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Saving..."
                      : isEditing
                        ? "Save Changes"
                        : "Edit Profile"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert
                      variant="default"
                      className="border-[#2E7D32] bg-[#E8F5E9] text-[#2E7D32]"
                    >
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="bio">About Me</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about yourself"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      disabled={!isEditing || isLoading}
                      className={!isEditing ? "opacity-70" : ""}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!isEditing || isLoading}
                        className={!isEditing ? "opacity-70" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={!isEditing || isLoading}
                        className={!isEditing ? "opacity-70" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        disabled={true}
                        className="opacity-70"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={!isEditing || isLoading}
                        className={!isEditing ? "opacity-70" : ""}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Password</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">
                          Current Password
                        </Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div></div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                          Confirm New Password
                        </Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </div>
                    <Button className="bg-[#2E7D32] hover:bg-[#1B5E20]">
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Container>
  );
}
