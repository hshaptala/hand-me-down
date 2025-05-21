import { useState } from "react";

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

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Mock communities data
  const communities = [
    {
      id: 1,
      name: "Thomas More University",
      description:
        "A private community for students and teachers to donate and exchange items within the university.",
      image: "/placeholder.svg?height=200&width=400",
      type: "private",
      location: "Geel, Belgium",
      members: 245,
      items: 56,
    },
    {
      id: 2,
      name: "City of Geel",
      description:
        "A public community for residents of Geel to share and exchange items locally.",
      image: "/placeholder.svg?height=200&width=400",
      type: "public",
      location: "Geel, Belgium",
      members: 1203,
      items: 187,
    },
    {
      id: 3,
      name: "Sustainable Living",
      description:
        "A community focused on sustainable living practices and reducing waste through item sharing.",
      image: "/placeholder.svg?height=200&width=400",
      type: "public",
      location: "Antwerp, Belgium",
      members: 876,
      items: 134,
    },
    {
      id: 4,
      name: "Tech Enthusiasts",
      description:
        "Share and exchange tech gadgets, computer parts, and electronics with fellow tech lovers.",
      image: "/placeholder.svg?height=200&width=400",
      type: "public",
      location: "Brussels, Belgium",
      members: 543,
      items: 98,
    },
    {
      id: 5,
      name: "Book Exchange Club",
      description:
        "A community for book lovers to share their favorite reads with others.",
      image: "/placeholder.svg?height=200&width=400",
      type: "public",
      location: "Leuven, Belgium",
      members: 389,
      items: 712,
    },
    {
      id: 6,
      name: "Ghent University",
      description:
        "A private community for Ghent University students and staff to exchange items on campus.",
      image: "/placeholder.svg?height=200&width=400",
      type: "private",
      location: "Ghent, Belgium",
      members: 678,
      items: 123,
    },
  ];

  // Filter communities based on search query and type filter
  const filteredCommunities = communities.filter(
    (community) =>
      (community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        community.location.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (typeFilter === "all" || community.type === typeFilter),
  );

  // Mock user's joined communities
  const joinedCommunities = [communities[0], communities[1]];

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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
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
                          src={community.image || "/placeholder.svg"}
                          alt={community.name}
                          className="h-full w-full object-cover"
                        />
                        <Badge
                          className={`absolute top-4 right-4 ${
                            community.type === "private"
                              ? "bg-[#424242]"
                              : "bg-[#2E7D32]"
                          }`}
                        >
                          {community.type === "private" ? (
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
                      <div className="mt-4 flex gap-4 text-sm">
                        <div>
                          <span className="font-medium">
                            {community.members}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            members
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">{community.items}</span>
                          <span className="text-muted-foreground ml-1">
                            items
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className={`w-full ${
                          joinedCommunities.some((c) => c.id === community.id)
                            ? "bg-muted hover:bg-muted/80"
                            : community.type === "private"
                              ? "bg-[#FFC107] text-[#242424] hover:bg-[#FFA000]"
                              : "bg-[#2E7D32] hover:bg-[#1B5E20]"
                        }`}
                        asChild
                      >
                        <Link to={`/communities/${community.id}`}>
                          {joinedCommunities.some((c) => c.id === community.id)
                            ? "View Community"
                            : community.type === "private"
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
                    No communities found matching your search criteria
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
                          src={community.image || "/placeholder.svg"}
                          alt={community.name}
                          className="h-full w-full object-cover"
                        />
                        <Badge
                          className={`absolute top-4 right-4 ${
                            community.type === "private"
                              ? "bg-[#424242]"
                              : "bg-[#2E7D32]"
                          }`}
                        >
                          {community.type === "private" ? (
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
                      <div className="mt-4 flex gap-4 text-sm">
                        <div>
                          <span className="font-medium">
                            {community.members}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            members
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">{community.items}</span>
                          <span className="text-muted-foreground ml-1">
                            items
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="bg-muted hover:bg-muted/80 w-full"
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
                  <Button
                    className="mt-4 bg-[#2E7D32] hover:bg-[#1B5E20]"
                    asChild
                  >
                    <Link to="/communities?tab=all">Browse Communities</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}
