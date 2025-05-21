import type React from "react";
import Container from "@/components/layout/Container";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Gift,
  MapPin,
  Settings,
  User,
  Upload,
  Bell,
  Shield,
  LogOut,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import supabase from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
                      src="/placeholder.svg?height=96&width=96"
                      alt={formData.firstName}
                    />
                    <AvatarFallback>
                      {formData.firstName && formData.lastName
                        ? `${formData.firstName[0]}${formData.lastName[0]}`
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute right-0 bottom-0 h-8 w-8 rounded-full bg-[#2E7D32] p-0"
                    onClick={() =>
                      alert("Upload photo functionality would go here")
                    }
                  >
                    <Upload className="h-4 w-4" />
                    <span className="sr-only">Upload photo</span>
                  </Button>
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
                  <Badge variant="secondary">No communities yet</Badge>
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
                <Link
                  to="/my-communities"
                  className="flex items-center gap-2 text-sm transition-colors hover:text-[#2E7D32]"
                >
                  <MapPin className="h-4 w-4" />
                  <span>My Communities</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 text-sm transition-colors hover:text-[#2E7D32]"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                <button
                  className="flex w-full items-center gap-2 text-left text-sm text-red-500 transition-colors hover:text-red-600"
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
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

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent donations and received items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-10">
                    <div className="text-center">
                      <p className="text-muted-foreground">No activity yet</p>
                      <p className="text-muted-foreground mt-2 text-sm">
                        Start donating or receiving items to see your activity
                        here
                      </p>
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

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Notification Preferences
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notify-messages">New Messages</Label>
                          <p className="text-muted-foreground text-sm">
                            Receive notifications when you get new messages
                          </p>
                        </div>
                        <Switch id="notify-messages" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notify-items">
                            Item Reservations
                          </Label>
                          <p className="text-muted-foreground text-sm">
                            Receive notifications when your items are reserved
                          </p>
                        </div>
                        <Switch id="notify-items" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notify-communities">
                            Community Updates
                          </Label>
                          <p className="text-muted-foreground text-sm">
                            Receive notifications about new items in your
                            communities
                          </p>
                        </div>
                        <Switch id="notify-communities" defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>
                    Manage your privacy and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Profile Visibility</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="profile-visibility">
                            Public Profile
                          </Label>
                          <p className="text-muted-foreground text-sm">
                            Allow others to see your profile information
                          </p>
                        </div>
                        <Switch id="profile-visibility" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="activity-visibility">
                            Activity History
                          </Label>
                          <p className="text-muted-foreground text-sm">
                            Show your donation and receiving history to others
                          </p>
                        </div>
                        <Switch id="activity-visibility" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="text-muted-foreground h-5 w-5" />
                      <h3 className="text-lg font-medium">Account Security</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="two-factor">
                            Two-Factor Authentication
                          </Label>
                          <p className="text-muted-foreground text-sm">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable
                        </Button>
                      </div>
                      <div className="pt-2">
                        <Button
                          variant="destructive"
                          className="w-full sm:w-auto"
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
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
