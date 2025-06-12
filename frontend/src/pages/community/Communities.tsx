import { useEffect, useState, useMemo, useCallback } from "react";

import { Search, Book, Plus, Users, Lock, MapPin, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import Container from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CommunityCardSkeleton } from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import type { Community } from "@/models/community";
import {
  fetchCommunities,
  joinCommunity,
  userCommunities,
} from "@/service/community.service";

export default function Communities() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setvisibilityFilter] = useState("all");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null,
  );
  const [password, setPassword] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [communitiesData, joinedData] = await Promise.all([
          fetchCommunities(),
          user ? userCommunities() : Promise.resolve([]),
        ]);
        setCommunities(communitiesData);
        setJoinedCommunities(joinedData);
      } catch (error) {
        console.error("Error loading communities:", error);
        toast.error("Failed to load communities");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleJoinCommunity = useCallback(
    async (community: Community) => {
      if (!user) {
        toast.error("Please log in to join communities");
        return;
      }

      if (!community.id) {
        toast.error("Invalid community");
        return;
      }

      if (community.visibility === "Private") {
        setSelectedCommunity(community);
        setShowPasswordDialog(true);
        return;
      }

      setJoinLoading(true);
      try {
        await joinCommunity(community.id);
        const updatedJoinedCommunities = await userCommunities();
        setJoinedCommunities(updatedJoinedCommunities);
        toast.success(`Successfully joined ${community.name}!`);
      } catch (error) {
        console.error("Error joining community:", error);
        toast.error("Failed to join community. Please try again.");
      } finally {
        setJoinLoading(false);
      }
    },
    [user],
  );

  const handleJoinPrivateCommunity = useCallback(async () => {
    if (!selectedCommunity || !password.trim()) {
      toast.error("Please enter a password");
      return;
    }

    if (!selectedCommunity.id) {
      toast.error("Invalid community");
      return;
    }

    setJoinLoading(true);
    try {
      await joinCommunity(selectedCommunity.id, password);
      const updatedJoinedCommunities = await userCommunities();
      setJoinedCommunities(updatedJoinedCommunities);
      toast.success(`Successfully joined ${selectedCommunity.name}!`);
      setShowPasswordDialog(false);
      setPassword("");
      setSelectedCommunity(null);
    } catch (error) {
      console.error("Error joining private community:", error);
      toast.error(
        "Failed to join community. Please check your password and try again.",
      );
    } finally {
      setJoinLoading(false);
    }
  }, [selectedCommunity, password]);
  const isJoined = useCallback(
    (communityId: number | undefined) => {
      if (!communityId) return false;
      return joinedCommunities.some((c) => c.id === communityId);
    },
    [joinedCommunities],
  );

  // Filter communities based on search query and visibility filter
  const filteredCommunities = useMemo(() => {
    return communities.filter((community) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        community.name.toLowerCase().includes(searchLower) ||
        (community.description?.toLowerCase().includes(searchLower) ?? false) ||
        community.location.toLowerCase().includes(searchLower);

      const matchesVisibility =
        visibilityFilter === "all" || community.visibility === visibilityFilter;

      return matchesSearch && matchesVisibility;
    });
  }, [communities, searchQuery, visibilityFilter]);
  if (loading) {
    return (
      <Container className="py-10">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold">Communities</h1>
            <p className="text-muted-foreground">
              Join existing communities or create your own to start sharing
              items
            </p>
          </div>

          <div className="flex justify-between">
            <Button asChild className="bg-[#2E7D32] hover:bg-[#1B5E20]">
              <Link to="/communities/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Community
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Communities</TabsTrigger>
              <TabsTrigger value="joined">My Communities</TabsTrigger>
            </TabsList>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search communities..."
                  className="pl-10"
                  disabled
                />
              </div>
              <Select disabled>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by visibility" />
                </SelectTrigger>
              </Select>
            </div>
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <CommunityCardSkeleton key={index} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="joined" className="mt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <CommunityCardSkeleton key={index} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Communities</h1>
          <p className="text-muted-foreground">
            Join existing communities or create your own to start sharing items
          </p>
        </div>

        <div className="flex justify-between">
          <Button asChild className="bg-[#2E7D32] hover:bg-[#1B5E20]">
            <Link to="/communities/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Community
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Communities</TabsTrigger>
            <TabsTrigger value="joined">My Communities</TabsTrigger>
          </TabsList>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search communities..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={visibilityFilter}
              onValueChange={setvisibilityFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="Public">Public</SelectItem>
                <SelectItem value="Private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCommunities.length > 0 ? (
                filteredCommunities.map((community) => (
                  <Card key={community.id} className="flex h-full flex-col">
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={
                            import.meta.env.VITE_API_BASE_URL +
                            community.imageUrl
                          }
                          alt={community.name}
                          className="h-full w-full object-cover"
                        />
                        <Badge
                          className={`absolute top-4 right-4 ${
                            community.visibility === "Private"
                              ? "bg-[#424242]"
                              : "bg-[#2E7D32]"
                          }`}
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
                      </div>
                    </CardHeader>{" "}
                    <CardContent className="flex-1 p-6">
                      <CardTitle>{community.name}</CardTitle>
                      <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        <span>{community.location}</span>
                      </div>
                      <CardDescription className="mt-2">
                        {community.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 p-6 pt-0">
                      <div className="text-muted-foreground flex w-full items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{community.memberCount || 0} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Book className="h-3 w-3" />
                          <span>{community.itemCount || 0} items</span>
                        </div>
                      </div>
                      {isJoined(community.id) ? (
                        <Button
                          className="bg-muted hover:bg-muted/80 w-full text-[#424242]"
                          asChild
                        >
                          <Link to={`/communities/${community.id}`}>
                            View Community
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          className={`w-full ${
                            community.visibility === "Private"
                              ? "bg-[#FFC107] text-[#242424] hover:bg-[#FFA000]"
                              : "bg-[#2E7D32] hover:bg-[#1B5E20]"
                          }`}
                          onClick={() => handleJoinCommunity(community)}
                          disabled={joinLoading}
                        >
                          {joinLoading
                            ? "Joining..."
                            : community.visibility === "Private"
                              ? "Request to Join"
                              : "Join Community"}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground">No communities found</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="joined" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {" "}
              {joinedCommunities.length > 0 ? (
                joinedCommunities.map((community) => (
                  <Card key={community.id} className="flex h-full flex-col">
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={
                            import.meta.env.VITE_API_BASE_URL +
                            community.imageUrl
                          }
                          alt={community.name}
                          className="h-full w-full object-cover"
                        />
                        <Badge
                          className={`absolute top-4 right-4 ${
                            community.visibility === "Private"
                              ? "bg-[#424242]"
                              : "bg-[#2E7D32]"
                          }`}
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
                      </div>
                    </CardHeader>{" "}
                    <CardContent className="flex-1 p-6">
                      <CardTitle>{community.name}</CardTitle>
                      <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        <span>{community.location}</span>
                      </div>
                      <CardDescription className="mt-2">
                        {community.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 p-6 pt-0">
                      <div className="text-muted-foreground flex w-full items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{community.memberCount || 0} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Plus className="h-3 w-3" />
                          <span>{community.itemCount || 0} items</span>
                        </div>
                      </div>
                      <Button
                        className="bg-muted hover:bg-muted/80 w-full text-[#424242]"
                        asChild
                      >
                        <Link to={`/communities/${community.id}`}>
                          View Community
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground">
                    You haven't joined any communities yet
                  </p>
                </div>
              )}
            </div>
          </TabsContent>{" "}
        </Tabs>
      </div>

      {/* Password Dialog for Private Communities */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join Private Community</DialogTitle>
            <DialogDescription>
              {selectedCommunity?.name} is a private community. Please enter the
              password to join.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="password" className="text-right">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder="Enter community password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleJoinPrivateCommunity();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPassword("");
                setSelectedCommunity(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleJoinPrivateCommunity}
              disabled={joinLoading || !password.trim()}
            >
              {joinLoading ? "Joining..." : "Join Community"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
