import { useState } from "react";

import {
  Search,
  Plus,
  Users,
  Lock,
  MapPin,
  Settings,
  Filter,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Container from "@/components/layout/Container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
//import { Breadcrumb } from "@/components/ui/breadcrumb"

export default function Community() {
  const { id } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Mock community data
  const community = {
    id: Number.parseInt(id || "1"),
    name: "Thomas More University",
    description:
      "A private community for students and teachers to donate and exchange items within the university. Share books, furniture, electronics, and more with fellow students and staff.",
    image: "/placeholder.svg?height=300&width=1200",
    type: "private",
    location: "Geel, Belgium",
    members: 245,
    items: 56,
    isAdmin: true,
    categories: [
      "Books",
      "Furniture",
      "Electronics",
      "Clothing",
      "Kitchen",
      "Other",
    ],
    itemList: [
      {
        id: 1,
        title: "Desk Lamp",
        description:
          "White desk lamp in good condition. Works perfectly, I just got a new one.",
        image: "/placeholder.svg?height=200&width=200",
        category: "Electronics",
        donor: {
          name: "Michael Johnson",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        postedDate: "2 days ago",
        status: "Available",
      },
      {
        id: 2,
        title: "Computer Science Textbook",
        description:
          "Introduction to Algorithms textbook, 3rd edition. Some highlighting but otherwise in good condition.",
        image: "/placeholder.svg?height=200&width=200",
        category: "Books",
        donor: {
          name: "Sarah Williams",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        postedDate: "1 week ago",
        status: "Available",
      },
      {
        id: 3,
        title: "Office Chair",
        description:
          "Black office chair with adjustable height. Very comfortable, I'm just moving and can't take it with me.",
        image: "/placeholder.svg?height=200&width=200",
        category: "Furniture",
        donor: {
          name: "David Chen",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        postedDate: "3 days ago",
        status: "Reserved",
      },
      {
        id: 4,
        title: "Coffee Maker",
        description:
          "Drip coffee maker, makes 12 cups. Works perfectly, I just upgraded to an espresso machine.",
        image: "/placeholder.svg?height=200&width=200",
        category: "Kitchen",
        donor: {
          name: "Emma Rodriguez",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        postedDate: "5 days ago",
        status: "Available",
      },
    ],
    memberList: [
      {
        id: 1,
        name: "Michael Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Admin",
      },
      {
        id: 2,
        name: "Sarah Williams",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Moderator",
      },
      {
        id: 3,
        name: "David Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Member",
      },
      {
        id: 4,
        name: "Emma Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Member",
      },
      {
        id: 5,
        name: "John Smith",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Member",
      },
    ],
  };

  // Filter items based on search query and category filter
  const filteredItems = community.itemList.filter(
    (item) =>
      (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (categoryFilter === "all" || item.category === categoryFilter),
  );

  // Breadcrumb items for this page
  /* const breadcrumbItems = [
    { label: "Communities", to: "/communities" },
    { label: community.name, to: `/communities/${community.id}`, isCurrent: true },
  ]*/

  return (
    <div>
      {/* Community Header */}
      <div className="relative h-64 w-full overflow-hidden">
        <img
          src={community.image || "/placeholder.svg"}
          alt={community.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 mx-auto p-6 px-4 text-white md:px-16">
          <h1 className="text-3xl font-bold">{community.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge
              className={`${community.type === "private" ? "bg-[#424242]" : "bg-[#2E7D32]"}`}
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
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{community.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{community.memberList.length} members</span>
            </div>
          </div>
        </div>
        {community.isAdmin && (
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
        {/* Breadcrumb Navigation 
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>*/}

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
                    {community.categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <Card key={item.id}>
                      <CardHeader className="p-0">
                        <div className="relative h-48 w-full overflow-hidden">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                          <Badge
                            className={`absolute top-4 right-4 ${
                              item.status === "Available"
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
                        <Badge variant="outline" className="mt-1">
                          {item.category}
                        </Badge>
                        <CardDescription className="mt-2 line-clamp-2">
                          {item.description}
                        </CardDescription>
                        <div className="mt-4 flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={item.donor.avatar || "/placeholder.svg"}
                              alt={item.donor.name}
                            />
                            <AvatarFallback>
                              {item.donor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground text-sm">
                            {item.donor.name} • {item.postedDate}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className={`w-full ${
                            item.status === "Available"
                              ? "bg-[#2E7D32] hover:bg-[#1B5E20]"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                          disabled={item.status !== "Available"}
                          asChild
                        >
                          <Link
                            to={`/communities/${community.id}/items/${item.id}`}
                          >
                            {item.status === "Available"
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
                {community.memberList.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={member.avatar || "/placeholder.svg"}
                            alt={member.name}
                          />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to={`/profile/${member.id}`}>View Profile</Link>
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
                    <h3 className="text-lg font-medium">Community Type</h3>
                    <p className="text-muted-foreground mt-2">
                      {community.type === "private" ? (
                        <>
                          This is a private community. You need an invitation or
                          password to join.
                        </>
                      ) : (
                        <>
                          This is a public community. Anyone can join and
                          participate.
                        </>
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Categories</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {community.categories.map((category) => (
                        <Badge key={category} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
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
