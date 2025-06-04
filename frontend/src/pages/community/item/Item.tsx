import { useEffect, useState } from "react";

import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { StartConversation } from "@/components/chat/StartConversation";
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
import { ChatProvider } from "@/context/ChatContext";
import type { Item } from "@/models/item";
import type { User } from "@/models/user";
import { fetchItem } from "@/service/item.service";
import { fetchUser } from "@/service/user.service";

export default function Item() {
  const params = useParams<{ id: string; itemId: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [donor, setDonor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!params.id || !params.itemId) return;

    const loadItemAndDonor = async () => {
      try {
        const itemData = await fetchItem(Number(params.itemId));
        setItem(itemData);

        // Fetch donor information
        const donorData = await fetchUser(itemData.donor);
        setDonor(donorData);
      } catch (error) {
        console.error("Error loading item or donor data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadItemAndDonor();
  }, [params.id, params.itemId]);

  if (loading || !item) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-[#2E7D32]"></div>
          <p className="text-muted-foreground">Loading item...</p>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider>
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
                      src={
                        import.meta.env.VITE_API_BASE_URL + item.imageUrl ||
                        "/placeholder.svg"
                      }
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">{item.title}</h2>
                      <Badge
                        className={`${
                          item.status === "Open"
                            ? "bg-[#2E7D32]"
                            : "bg-[#1976D2]"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    {item.keywords && item.keywords.length > 0 && (
                      <Badge variant="outline" className="mt-2">
                        {item.keywords[0]}
                      </Badge>
                    )}
                    <p className="text-muted-foreground mt-4">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 border-t pt-4">
                    <Avatar>
                      <AvatarImage
                        src={
                          donor?.avatarUrl
                            ? import.meta.env.VITE_API_BASE_URL +
                              donor.avatarUrl
                            : "/placeholder.svg"
                        }
                        alt="Donor"
                      />
                      <AvatarFallback>
                        {donor
                          ? `${donor.firstName[0]}${donor.lastName[0]}`
                          : "D"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {donor
                          ? `${donor.firstName} ${donor.lastName}`
                          : "Loading..."}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Posted on
                        {item.postedAt
                          ? new Date(item.postedAt).toLocaleDateString()
                          : new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Contact Donor */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Donor</CardTitle>
                  <CardDescription>
                    Start a conversation to arrange pickup details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {donor?.supabaseUserId && (
                    <StartConversation
                      recipientId={donor.supabaseUserId}
                      recipientName={`${donor.firstName} ${donor.lastName}`}
                      itemId={item.id.toString()}
                      itemTitle={item.title}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </ChatProvider>
  );
}
