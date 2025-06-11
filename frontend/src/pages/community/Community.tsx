import { useState, useEffect, useMemo } from "react";

import {
  Search,
  Plus,
  Users,
  Lock,
  MapPin,
  Filter,
  Settings,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

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
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MemberCardSkeleton, ItemCardSkeleton } from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { getAllCategories } from "@/models/categories";
import type { Community } from "@/models/community";
import type { Item } from "@/models/item";
import type { Member } from "@/models/member";
import type { User } from "@/models/user";
import { fetchCommunity } from "@/service/community.service";
import { fetchItems } from "@/service/item.service";
import { fetchMembers, fetchMember } from "@/service/member.service";
import { fetchUser, fetchUserBySupabaseId } from "@/service/user.service";

export default function Community() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [donors, setDonors] = useState<Record<number, User>>({});
  const [currentUserMember, setCurrentUserMember] = useState<Member | null>(
    null,
  );
  const [currentBackendUser, setCurrentBackendUser] = useState<User | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const categories = getAllCategories();
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ||
        (item.keywords && item.keywords.includes(categoryFilter));

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);
  useEffect(() => {
    if (!id) return;

    const loadCommunityData = async () => {
      setLoading(true);
      setError(null);

      try {
        // fetch communities
        const communityData = await fetchCommunity(Number(id));
        setCommunity(communityData);
        setLoading(false);

        // fetch items
        setItemsLoading(true);
        const itemsData = await fetchItems(Number(id));
        setItems(itemsData);

        // fetch donor information for each item
        const donorPromises = itemsData.map(async (item) => {
          try {
            const donor = await fetchUser(item.donor);
            return { itemId: item.id, donor };
          } catch (error) {
            console.error(`Error fetching donor for item ${item.id}:`, error);
            return null;
          }
        });

        const donorResults = await Promise.all(donorPromises);
        const donorMap: Record<number, User> = {};
        donorResults.forEach((result) => {
          if (result) {
            donorMap[result.itemId] = result.donor;
          }
        });
        setDonors(donorMap);
        setItemsLoading(false);
        setMembersLoading(true);
        const membersData = await fetchMembers(Number(id));
        setMembers(membersData);

        if (user) {
          try {
            const backendUser = await fetchUserBySupabaseId(user.id);
            setCurrentBackendUser(backendUser);

            const currentMember = await fetchMember(Number(id), backendUser.id);
            setCurrentUserMember(currentMember);
          } catch (error) {
            console.error("Error fetching current user membership:", error);
            setCurrentUserMember(null);
            setCurrentBackendUser(null);
          }
        }
      } catch (err) {
        console.error("Error loading community data:", err);
        setError("Failed to load community data");
        setLoading(false);
      } finally {
        setMembersLoading(false);
        setItemsLoading(false);
      }
    };
    loadCommunityData();
  }, [id, user]);

  // Helper functions for role checking
  const getCurrentUserRole = (): string => {
    return currentUserMember?.role || "member";
  };

  const isOwner = (): boolean => {
    if (!community || !currentBackendUser) return false;
    return currentBackendUser.id === community.owner;
  };

  const canManageCommunity = (): boolean => {
    const role = getCurrentUserRole();
    const owner = isOwner();

    // Can manage if owner, administrator, or moderator
    return owner || role === "administrator" || role === "moderator";
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-[#2E7D32]"></div>
          <p className="text-muted-foreground">Loading community...</p>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-500">{error || "Community not found"}</p>
          <button
            onClick={() => window.history.back()}
            className="rounded bg-[#2E7D32] px-4 py-2 text-white hover:bg-[#1B5E20]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Community Header */}
      <div className="relative h-64 w-full overflow-hidden">
        <img
          src={import.meta.env.VITE_API_BASE_URL + community.imageUrl}
          alt={community.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 mx-auto p-6 px-4 text-white md:px-16">
          <h1 className="text-3xl font-bold">{community.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge
              className={`${community.visibility === "Private" ? "bg-[#424242]" : "bg-[#2E7D32]"}`}
            >
              {community.visibility === "Private" ? (
                <>
                  <Lock className="mr-1 h-3 w-3" /> Private
                </>
              ) : (
                <>
                  <Users className="mr-1 h-3 w-3" /> Public
                </>
              )}
            </Badge>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{community.location}</span>
            </div>{" "}
          </div>
        </div>
        {canManageCommunity() && (
          <Button
            variant="outline"
            className="absolute top-6 right-6 border-white/20 bg-white/10 text-white hover:bg-white/20"
            asChild
          >
            <Link to={`/communities/${community.id}/manage`}>
              <Settings className="mr-2 h-4 w-4" />
              Manage Community
            </Link>
          </Button>
        )}
      </div>

      {/* Community Content */}
      <Container className="py-10">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="md:w-2/3">
              <p className="text-muted-foreground">{community.description}</p>
            </div>
            <div className="flex justify-end md:w-1/3">
              <Button asChild className="bg-[#2E7D32] hover:bg-[#1B5E20]">
                <Link to={`/communities/${community.id}/items/create`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Post Item
                </Link>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="items">
            <TabsList>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            {/* Items Tab */}
            <TabsContent value="items" className="mt-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search items..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {itemsLoading ? (
                  // Show loading skeletons while items are loading
                  Array.from({ length: 6 }).map((_, index) => (
                    <ItemCardSkeleton key={index} />
                  ))
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <Card key={item.id}>
                      <CardHeader className="p-0">
                        <div className="relative h-48 w-full overflow-hidden">
                          <img
                            src={
                              import.meta.env.VITE_API_BASE_URL + item.imageUrl
                            }
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                          <Badge
                            className={`absolute top-4 right-4 ${
                              item.status === "Open"
                                ? "bg-[#2E7D32]"
                                : "bg-[#1976D2]"
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <CardTitle>{item.title}</CardTitle>
                        {item.keywords && item.keywords.length > 0 && (
                          <Badge variant="outline" className="mt-1">
                            {item.keywords[0]}
                          </Badge>
                        )}
                        <CardDescription className="mt-2 line-clamp-2">
                          {item.description}
                        </CardDescription>
                        <div className="mt-4 flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={
                                import.meta.env.VITE_API_BASE_URL +
                                  donors[item.id].avatarUrl ||
                                "/placeholder.svg"
                              }
                              alt="Donor"
                            />
                            <AvatarFallback>
                              {donors[item.id]
                                ? `${donors[item.id].firstName[0]}${donors[item.id].lastName[0]}`
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground text-sm">
                            {donors[item.id]
                              ? `${donors[item.id].firstName} ${donors[item.id].lastName}`
                              : "Loading..."}
                            •
                            {item.postedAt
                              ? new Date(item.postedAt).toLocaleDateString()
                              : new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>{" "}
                      <CardFooter>
                        <Button
                          className={`w-full ${
                            item.status === "Open"
                              ? "bg-[#2E7D32] hover:bg-[#1B5E20]"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                          disabled={item.status !== "Open"}
                          asChild
                        >
                          <Link
                            to={`/communities/${community.id}/items/${item.id}`}
                          >
                            {/* Show different button text based on ownership */}
                            {donors[item.id] &&
                            currentBackendUser &&
                            donors[item.id].id === currentBackendUser.id
                              ? "View Item"
                              : item.status === "Open"
                                ? "Reserve Item"
                                : "View Item"}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-muted-foreground">
                      No items found matching your search criteria
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            {/* Members Tab */}
            <TabsContent value="members" className="mt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {membersLoading
                  ? // Show loading skeletons
                    Array.from({ length: 6 }).map((_, index) => (
                      <MemberCardSkeleton key={index} />
                    ))
                  : members.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage
                                src={member.avatarUrl || "/placeholder.svg"}
                                alt={`${member.firstName} ${member.lastName}`}
                              />
                              <AvatarFallback>
                                {`${member.firstName[0] ?? ""}${member.lastName ? member.lastName[0] : ""}`}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">
                                {`${member.firstName} ${member.lastName}`}
                              </h3>
                              <Badge variant="outline" className="mt-1">
                                {member.role}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full" asChild>
                            <Link to={`/communities/${id}/member/${member.id}`}>
                              View Profile
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
              </div>
            </TabsContent>
            {/* About Tab */}
            <TabsContent value="about" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {community.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Description</h3>
                    <p className="text-muted-foreground mt-2">
                      {community.description}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Location</h3>
                    <p className="text-muted-foreground mt-2">
                      {community.location}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">
                      Community visibility
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      This community is
                      <Badge
                        className={`${community.visibility === "Private" ? "bg-[#424242]" : "bg-[#2E7D32]"}`}
                      >
                        {community.visibility}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Members</h3>
                    <p className="text-muted-foreground mt-2">
                      {members.length} members
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    </div>
  );
}
