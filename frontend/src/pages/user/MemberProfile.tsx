import { useState, useEffect } from "react";

import { Gift, ArrowLeft } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";

import Container from "@/components/layout/Container";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Item } from "@/models/item";
import type { User as UserType } from "@/models/user";
import {
  fetchUserDonations,
  fetchUserReceipts,
  fetchUserReservations,
} from "@/service/item.service";
import { fetchUser } from "@/service/user.service";

export default function MemberProfile() {
  const { communityId, userId } = useParams<{
    communityId: string;
    userId: string;
  }>();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [donations, setDonations] = useState<Item[]>([]);
  const [receipts, setReceipts] = useState<Item[]>([]);
  const [reservations, setReservations] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("donations");

  useEffect(() => {
    if (!userId || !communityId) {
      setError("Invalid user or community ID");
      setIsLoading(false);
      return;
    }

    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch user profile
        const userData = await fetchUser(Number(userId));
        setProfileUser(userData);

        // Fetch user's items
        const [donationsData, receiptsData, reservationsData] =
          await Promise.all([
            fetchUserDonations(Number(userId)),
            fetchUserReceipts(Number(userId)),
            fetchUserReservations(Number(userId)),
          ]);

        setDonations(donationsData);
        setReceipts(receiptsData);
        setReservations(reservationsData);
      } catch (err) {
        console.error("Error loading profile data:", err);
        if (err instanceof Error && err.message.includes("403")) {
          setError(
            "You don't have permission to view this profile. You must be in the same community as this user.",
          );
        } else {
          setError("Failed to load profile data. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [userId, communityId]);

  const handleGoBack = () => {
    navigate(`/communities/${communityId}`);
  };

  if (isLoading) {
    return (
      <Container className="py-10">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="text-muted-foreground mt-2">Loading profile...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-10">
        <div className="mx-auto max-w-md">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleGoBack} className="mt-4" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Button>
        </div>
      </Container>
    );
  }

  if (!profileUser) {
    return (
      <Container className="py-10">
        <div className="mx-auto max-w-md">
          <Alert>
            <AlertTitle>User Not Found</AlertTitle>
            <AlertDescription>
              The requested user profile could not be found.
            </AlertDescription>
          </Alert>
          <Button onClick={handleGoBack} className="mt-4" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Button>
        </div>
      </Container>
    );
  }
  const ItemCard = ({ item }: { item: Item }) => (
    <Card key={item.id} className="overflow-hidden">
      <div className="aspect-square overflow-hidden">
        <img
          src={
            item.imageUrl
              ? import.meta.env.VITE_API_BASE_URL + item.imageUrl
              : "/placeholder.svg"
          }
          alt={item.title}
          className="h-full w-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="truncate font-semibold">{item.title}</h3>
        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
          {item.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {item.keywords?.slice(0, 2).map((keyword) => (
            <Badge key={keyword} variant="secondary" className="text-xs">
              {keyword}
            </Badge>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between"></div>
      </CardContent>
    </Card>
  );

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-6xl">
        {" "}
        {/* Header with back button */}
        <div className="mb-6 flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link to={`/communities/${communityId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to community</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Member Profile</h1>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Profile Sidebar */}
          <div className="lg:w-1/3">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage
                      src={import.meta.env.VITE_API_BASE_URL + profileUser.avatarUrl || "/placeholder.svg"}
                      alt={`${profileUser.firstName} ${profileUser.lastName}`}
                    />
                    <AvatarFallback className="text-2xl">
                      {profileUser.firstName?.[0]}
                      {profileUser.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold">
                      {profileUser.firstName} {profileUser.lastName}
                    </h2>

                    <p className="text-muted-foreground text-sm">
                      Member since
                      {" " +
                        new Date(profileUser.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {/* Stats */}
                  <div className="grid w-full grid-cols-3 gap-4 border-t pt-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{donations.length}</p>
                      <p className="text-xs text-black">Donated</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{receipts.length}</p>
                      <p className="text-xs text-black">Received</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {reservations.length}
                      </p>
                      <p className="text-xs text-black">Reserved</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items Tabs */}
          <div className="lg:w-2/3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Items
                </CardTitle>
                <CardDescription>
                  View {profileUser.firstName}'s donations, received items, and
                  current reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="donations">
                      Donations ({donations.length})
                    </TabsTrigger>
                    <TabsTrigger value="received">
                      Received ({receipts.length})
                    </TabsTrigger>
                    <TabsTrigger value="reserved">
                      Reserved ({reservations.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="donations" className="mt-6">
                    {donations.length === 0 ? (
                      <div className="py-8 text-center">
                        <Gift className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                        <h3 className="mb-2 text-lg font-medium">
                          No donations yet
                        </h3>
                        <p className="text-muted-foreground">
                          {profileUser.firstName} hasn't donated any items yet.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {donations.map((item) => (
                          <ItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="received" className="mt-6">
                    {receipts.length === 0 ? (
                      <div className="py-8 text-center">
                        <Gift className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                        <h3 className="mb-2 text-lg font-medium">
                          No received items
                        </h3>
                        <p className="text-muted-foreground">
                          {profileUser.firstName} hasn't received any items yet.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {receipts.map((item) => (
                          <ItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="reserved" className="mt-6">
                    {reservations.length === 0 ? (
                      <div className="py-8 text-center">
                        <Gift className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                        <h3 className="mb-2 text-lg font-medium">
                          No current reservations
                        </h3>
                        <p className="text-muted-foreground">
                          {profileUser.firstName} doesn't have any reserved
                          items.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {reservations.map((item) => (
                          <ItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}
