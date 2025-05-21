import type React from "react";
import { useState } from "react";

import { ArrowLeft, MessageSquare, MapPin } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

export default function Item() {
  const params = useParams<{ id: string; itemId: string }>();
  const [message, setMessage] = useState("");

  // Mock item data
  const item = {
    id: Number.parseInt(params.itemId || "0"),
    title: "Desk Lamp",
    description:
      "White desk lamp in good condition. Works perfectly, I just got a new one. It has an adjustable arm and three brightness settings. The bulb was recently replaced and should last for a long time.",
    image: "/placeholder.svg?height=400&width=400",
    category: "Electronics",
    donor: {
      id: 1,
      name: "Michael Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    postedDate: "May 2, 2023",
    status: "Available",
    community: {
      id: Number.parseInt(params.id || "0"),
      name: "Thomas More University",
    },
  };

  const handleReserve = () => {
    // Handle item reservation logic here
    console.log("Reserving item:", item.id);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // In a real app, you would send this message to your backend
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <Container className="py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link to={`/communities/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to community</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{item.title}</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Item Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="space-y-6 p-6">
                <div className="mx-auto aspect-square max-w-md overflow-hidden rounded-md">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{item.title}</h2>
                    <Badge
                      className={`${item.status === "Available" ? "bg-[#2E7D32]" : "bg-[#1976D2]"}`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {item.category}
                  </Badge>
                  <p className="text-muted-foreground mt-4">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 border-t pt-4">
                  <Avatar>
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
                  <div>
                    <p className="font-medium">{item.donor.name}</p>
                    <p className="text-muted-foreground text-sm">
                      Posted on {item.postedDate}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-4">
                <div className="w-full">
                  <Button
                    className={`w-full ${
                      item.status === "Available"
                        ? "bg-[#2E7D32] hover:bg-[#1B5E20]"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    disabled={item.status !== "Available"}
                    onClick={handleReserve}
                  >
                    {item.status === "Available"
                      ? "Reserve Item"
                      : "Item Reserved"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Contact Donor */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contact Donor</CardTitle>
                <CardDescription>
                  Send a message to arrange pickup details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <Textarea
                    placeholder="Write your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full bg-[#1976D2] hover:bg-[#0D47A1]"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Community Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="text-muted-foreground h-4 w-4" />
                  <span>{item.community.name}</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  This item is available in the {item.community.name} community.
                  The exact pickup location will be determined between you and
                  the donor in your conversation.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/communities/${item.community.id}`}>
                    View Community
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}
