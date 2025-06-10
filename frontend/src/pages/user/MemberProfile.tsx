import { useState, useEffect } from "react";

import { Users, ArrowLeft, MapPin, Lock, Star } from "lucide-react";
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
import type { Community } from "@/models/community";
import type { User as UserType } from "@/models/user";
import { fetchUserCommunities } from "@/service/community.service";
import { fetchUser } from "@/service/user.service";

// Helper function to render star rating
const renderStars = (rating: number): React.JSX.Element[] => {
  const stars: React.JSX.Element[] = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
    );
  }
  
  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative">
        <Star className="h-4 w-4 text-gray-300" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        </div>
      </div>
    );
  }
  
  // Add empty stars to make 5 total
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
    );
  }
  
  return stars;
};

export default function MemberProfile() {
  const { communityId, userId } = useParams<{
    communityId: string;
    userId: string;
  }>();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const [communitiesData] = await Promise.all([
          fetchUserCommunities(Number(userId)),
        ]);
        setUserCommunities(communitiesData);
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
                      src={
                        import.meta.env.VITE_API_BASE_URL +
                          profileUser.avatarUrl || "/placeholder.svg"
                      }
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
                    </h2>                    <p className="text-muted-foreground text-sm">
                      Member since
                      {" " +
                        new Date(profileUser.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Stats */}
                  <div className="w-full space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {profileUser.itemsGivenCount}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Items Given
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {profileUser.itemsReceivedCount}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Items Received
                        </div>
                      </div>                    </div>
                    <div className="text-center">
                      <div className="mb-1 flex items-center justify-center gap-1">
                        {profileUser.rating !== null && renderStars(profileUser.rating)}
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        {profileUser.rating !== null ? profileUser.rating.toFixed(1) : "--"}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        User Rating
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>{" "}
          {/* Communities Section */}
          <div className="lg:w-2/3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Communities
                </CardTitle>
                <CardDescription>
                  Communities that {profileUser.firstName} has joined
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userCommunities.length === 0 ? (
                  <div className="py-8 text-center">
                    <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <h3 className="mb-2 text-lg font-medium">
                      No communities yet
                    </h3>
                    <p className="text-muted-foreground">
                      {profileUser.firstName} hasn't joined any communities yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {userCommunities.map((community) => (
                      <Card key={community.id} className="overflow-hidden">
                        <div className="relative h-32 w-full overflow-hidden">
                          <img
                            src={
                              import.meta.env.VITE_API_BASE_URL +
                              community.imageUrl
                            }
                            alt={community.name}
                            className="h-full w-full object-cover"
                          />
                          <Badge
                            className={`absolute top-2 right-2 ${
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
                        <CardContent className="p-4">
                          <h3 className="truncate font-semibold">
                            {community.name}
                          </h3>
                          <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span>{community.location}</span>
                          </div>
                          {community.description && (
                            <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                              {community.description}
                            </p>
                          )}
                          <div className="text-muted-foreground mt-3 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{community.memberCount || 0} members</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}
