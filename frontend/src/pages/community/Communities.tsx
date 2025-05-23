import { useEffect, useState } from "react";

import { Search, Plus, Users, Lock, MapPin, Filter } from "lucide-react";
import { Link } from "react-router-dom";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Community } from "@/models/community";
import { fetchCommunities } from "@/service/community.service";

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setvisibilityFilter] = useState("all");
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    fetchCommunities().then((data) => {
      setCommunities(data);
    });
  }, []);

  // Filter communities based on search query and visibility filter
  const filteredCommunities = communities.filter(
    (community) =>
      (community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (community.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ??
          false) ||
        community.location.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (visibilityFilter === "all" || community.visibility === visibilityFilter),
  );

  // TODO: Replace with real joined communities logic
  const joinedCommunities: Community[] = [];

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
          <Link to="/map">
            <Button variant="outline">
              <MapPin className="mr-2 h-4 w-4" />
              View Map
            </Button>
          </Link>
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
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCommunities.length > 0 ? (
                filteredCommunities.map((community) => (
                  <Card key={community.id}>
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={community.imageUrl || "/placeholder.svg"}
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
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle>{community.name}</CardTitle>
                      <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        <span>{community.location}</span>
                      </div>
                      <CardDescription className="mt-2 line-clamp-3 h-[4.5rem]">
                        {community.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter>
                      {" "}
                      <Button
                        className={`w-full ${
                          joinedCommunities.some((c) => c.id === community.id)
                            ? "bg-muted hover:bg-muted/80 text-[#424242]"
                            : community.visibility === "Private"
                              ? "bg-[#FFC107] text-[#242424] hover:bg-[#FFA000]"
                              : "bg-[#2E7D32] hover:bg-[#1B5E20]"
                        }`}
                        asChild
                      >
                        <Link to={`/communities/${community.id}`}>
                          {joinedCommunities.some((c) => c.id === community.id)
                            ? "View Community"
                            : community.visibility === "Private"
                              ? "Request to Join"
                              : "Join Community"}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground">
                    No communities found
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="joined" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {joinedCommunities.length > 0 ? (
                joinedCommunities.map((community) => (
                  <Card key={community.id}>
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={community.imageUrl || "/placeholder.svg"}
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
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle>{community.name}</CardTitle>
                      <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        <span>{community.location}</span>
                      </div>
                      <CardDescription className="mt-2 line-clamp-3 h-[4.5rem]">
                        {community.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter>
                      {" "}
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
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}
