import { useState, useEffect } from "react";

import {
  Settings,
  Users,
  Shield,
  ArrowLeft,
  Trash2,
  Save,
  Ban,
  UserX,
  UserCheck,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Container from "@/components/layout/Container";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import type { Community } from "@/models/community";
import type { Member } from "@/models/member";
import {
  fetchCommunity,
  updateCommunity,
  deleteCommunity,
} from "@/service/community.service";
import {
  fetchMembers,
  fetchMember,
  fetchBannedMembers,
  updateMemberRole,
  banMember,
  unbanMember,
  fetchRoles,
  transferOwnership,
} from "@/service/member.service";
import { fetchUserBySupabaseId } from "@/service/user.service";

type TabType = "general" | "users" | "bans";

export default function ManageCommunity() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [bannedMembers, setBannedMembers] = useState<Member[]>([]);
  const [currentUserMember, setCurrentUserMember] = useState<Member | null>(
    null,
  );
  const [roles, setRoles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedMemberForTransfer, setSelectedMemberForTransfer] =
    useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    visibility: "Public" as "Public" | "Private",
    password: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch community data
        const communityData = await fetchCommunity(Number(id));
        setCommunity(communityData);
        setFormData({
          name: communityData.name,
          location: communityData.location,
          description: communityData.description || "",
          visibility: communityData.visibility,
          password: "",
        });
        const membersData = await fetchMembers(Number(id));
        setMembers(membersData);
        if (user) {
          try {
            const backendUser = await fetchUserBySupabaseId(user.id);
            const currentMember = await fetchMember(Number(id), backendUser.id);
            setCurrentUserMember(currentMember);
          } catch (error) {
            console.error("Error fetching current user membership:", error);
            setCurrentUserMember(null);
          }
        }

        // Fetch roles
        const rolesData = await fetchRoles();
        setRoles(rolesData);

        try {
          const bannedData = await fetchBannedMembers(Number(id));
          setBannedMembers(bannedData);
        } catch (error) {
          console.log("No permission to fetch banned members", error);
        }
      } catch (error) {
        console.error("Error loading community data:", error);
        toast.error("Failed to load community data");
        navigate("/communities");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, navigate]);
  const getCurrentUserRole = (): string => {
    return currentUserMember?.role || "member";
  };
  const isOwner = (): boolean => {
    if (!community || !currentUserMember) return false;
    return currentUserMember.id === community.owner_id;
  };
  const canAccessTab = (tab: TabType): boolean => {
    const role = getCurrentUserRole();
    const owner = isOwner();

    switch (tab) {
      case "general":
        return role === "administrator" || owner;
      case "users":
      case "bans":
        return role === "moderator" || role === "administrator" || owner;
      default:
        return false;
    }
  };
  const canManageRole = (memberRole: string): boolean => {
    const currentRole = getCurrentUserRole();
    const owner = isOwner();

    if (owner) return true;

    if (currentRole === "administrator") {
      return memberRole === "moderator" || memberRole === "member";
    }

    if (currentRole === "moderator") {
      return memberRole === "member";
    }

    return false;
  };

  const canBanMember = (memberRole: string): boolean => {
    const currentRole = getCurrentUserRole();
    const owner = isOwner();
    if (owner) return true;

    if (currentRole === "administrator") {
      return memberRole === "moderator" || memberRole === "member";
    }

    if (currentRole === "moderator") {
      return memberRole === "member";
    }

    return false;
  };

  const getAvailableRoles = (): string[] => {
    const currentRole = getCurrentUserRole();
    const owner = isOwner();

    if (owner) {
      return ["member", "moderator", "administrator"];
    }

    if (currentRole === "administrator") {
      return ["member", "moderator"];
    }

    return [];
  };
  const handleSaveCommunity = async () => {
    if (!id) return;

    try {
      setSaving(true);
      const updateData: {
        name?: string;
        location?: string;
        description?: string;
        password?: string;
        visibility?: "Public" | "Private";
        image?: File;
      } = {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        visibility: formData.visibility,
      };

      if (formData.visibility === "Private" && formData.password) {
        updateData.password = formData.password;
      }

      if (imageFile) {
        updateData.image = imageFile;
      }

      const updatedCommunity = await updateCommunity(Number(id), updateData);
      setCommunity(updatedCommunity);
      toast.success("Community updated successfully");
    } catch (error) {
      console.error("Error updating community:", error);
      toast.error("Failed to update community");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!id) return;

    try {
      await deleteCommunity(Number(id));
      toast.success("Community deleted successfully");
      navigate("/communities");
    } catch (error) {
      console.error("Error deleting community:", error);
      toast.error("Failed to delete community");
    }
  };

  const handleRoleChange = async (memberId: number, newRole: string) => {
    if (!id) return;

    try {
      await updateMemberRole(Number(id), memberId, newRole);

      // Update local state
      setMembers(
        members.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member,
        ),
      );

      toast.success("Role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const handleBanMember = async (memberId: number) => {
    if (!id) return;

    try {
      await banMember(Number(id), memberId);

      // Refresh data
      const [membersData, bannedData] = await Promise.all([
        fetchMembers(Number(id)),
        fetchBannedMembers(Number(id)),
      ]);

      setMembers(membersData);
      setBannedMembers(bannedData);

      toast.success("Member banned successfully");
    } catch (error) {
      console.error("Error banning member:", error);
      toast.error("Failed to ban member");
    }
  };

  const handleUnbanMember = async (memberId: number) => {
    if (!id) return;

    try {
      await unbanMember(Number(id), memberId);

      const [membersData, bannedData] = await Promise.all([
        fetchMembers(Number(id)),
        fetchBannedMembers(Number(id)),
      ]);

      setMembers(membersData);
      setBannedMembers(bannedData);

      toast.success("Member unbanned successfully");
    } catch (error) {
      console.error("Error unbanning member:", error);
      toast.error("Failed to unban member");
    }
  };
  const handleTransferOwnership = async (memberId: number) => {
    if (!id) return;

    try {
      await transferOwnership(Number(id), memberId);

      const updatedCommunity = await fetchCommunity(Number(id));
      setCommunity(updatedCommunity);

      const membersData = await fetchMembers(Number(id));
      setMembers(membersData);

      setTransferDialogOpen(false);
      setSelectedMemberForTransfer(null);

      toast.success("Ownership transferred successfully");
    } catch (error) {
      console.error("Error transferring ownership:", error);
      toast.error("Failed to transfer ownership");
    }
  };
  // Filter and paginate members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" || (member.role && member.role === roleFilter);

    return matchesSearch && matchesRole;
  });

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-[#2E7D32]"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-500">Community not found</p>
          <Button onClick={() => navigate("/communities")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <Container className="py-10">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/communities/${id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Manage Community</h1>
            <p className="text-muted-foreground">{community.name}</p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            <div className="space-y-1">
              <h3 className="px-3 py-2 text-lg font-medium">Settings</h3>
              <Button
                variant={activeTab === "general" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("general")}
                disabled={!canAccessTab("general")}
              >
                <Settings className="mr-2 h-4 w-4" />
                General
              </Button>
            </div>

            <div className="space-y-1">
              <h3 className="px-3 py-2 text-lg font-medium">Manage</h3>
              <Button
                variant={activeTab === "users" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("users")}
                disabled={!canAccessTab("users")}
              >
                <Users className="mr-2 h-4 w-4" />
                Users
              </Button>
              <Button
                variant={activeTab === "bans" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("bans")}
                disabled={!canAccessTab("bans")}
              >
                <Shield className="mr-2 h-4 w-4" />
                Bans
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "general" && (
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage your community information and settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Community Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="visibility">Visibility</Label>
                      <Select
                        value={formData.visibility}
                        onValueChange={(value: "Public" | "Private") =>
                          setFormData({ ...formData, visibility: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Public">Public</SelectItem>
                          <SelectItem value="Private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.visibility === "Private" && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Leave empty to keep current password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Community Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <div>
                      {isOwner() && (
                        <Button
                          variant="destructive"
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Community
                        </Button>
                      )}
                    </div>
                    <Button onClick={handleSaveCommunity} disabled={saving}>
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "users" && (
              <Card>
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>
                    Manage your community users and roles.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter */}
                  <div className="mb-6 flex gap-4">
                    <div className="relative flex-1">
                      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        placeholder="Search for a user..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Users Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Given</TableHead>
                        <TableHead>Received</TableHead>
                        <TableHead>Reported</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={member.avatarUrl || "/placeholder.svg"}
                                  alt={`${member.firstName} ${member.lastName}`}
                                />
                                <AvatarFallback>
                                  {member.firstName[0]}
                                  {member.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {member.firstName} {member.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {member.role && canManageRole(member.role) ? (
                              <Select
                                value={member.role || "member"}
                                onValueChange={(newRole) =>
                                  handleRoleChange(member.id, newRole)
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableRoles().map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {role.charAt(0).toUpperCase() +
                                        role.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="outline">
                                {member.role
                                  ? member.role.charAt(0).toUpperCase() +
                                    member.role.slice(1)
                                  : "Unknown"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span>4.5</span>
                              <span className="text-yellow-500">⭐</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span>4</span>
                              <span className="text-green-600">⬆</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span>4</span>
                              <span className="text-blue-600">⬇</span>
                            </div>
                          </TableCell>
                          <TableCell>0 times</TableCell>
                          <TableCell>20/06/2024</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {member.role && canBanMember(member.role) && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleBanMember(member.id)}
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              )}
                              {isOwner() && member.role === "administrator" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMemberForTransfer(member);
                                    setTransferDialogOpen(true);
                                  }}
                                >
                                  Make Owner
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-muted-foreground text-sm">
                        Rows per page: {itemsPerPage}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1),
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "bans" && (
              <Card>
                <CardHeader>
                  <CardTitle>Banned Users</CardTitle>
                  <CardDescription>
                    Manage banned users in your community.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bannedMembers.length === 0 ? (
                    <div className="py-8 text-center">
                      <UserCheck className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                      <p className="text-muted-foreground">No banned users</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Ban Count</TableHead>
                          <TableHead>Last Banned</TableHead>
                          <TableHead>Banned By</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bannedMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={member.avatarUrl || "/placeholder.svg"}
                                    alt={`${member.firstName} ${member.lastName}`}
                                  />
                                  <AvatarFallback>
                                    {member.firstName[0]}
                                    {member.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span>
                                  {member.firstName} {member.lastName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{member.banCount || 0}</TableCell>
                            <TableCell>
                              {member.lastBannedAt
                                ? new Date(
                                    member.lastBannedAt,
                                  ).toLocaleDateString()
                                : "Unknown"}
                            </TableCell>
                            <TableCell>{member.lastBannedBy}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnbanMember(member.id)}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Unban
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Community</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this community? This action cannot
              be undone. All items, members, and conversations will be
              permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCommunity}>
              Delete Community
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Transfer Ownership Confirmation Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Ownership</DialogTitle>
            <DialogDescription>
              Are you sure you want to transfer ownership to
              <strong>
                {selectedMemberForTransfer?.firstName}
                {selectedMemberForTransfer?.lastName}
              </strong>
              ? You will become an administrator and they will become the owner
              of this community. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTransferDialogOpen(false);
                setSelectedMemberForTransfer(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedMemberForTransfer &&
                handleTransferOwnership(selectedMemberForTransfer.id)
              }
            >
              Transfer Ownership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
