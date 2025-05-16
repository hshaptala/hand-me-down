import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Users, Gift, ArrowRight, Lock } from "lucide-react";
import Container from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  // Mock data for joined communities to determine button styling
  const joinedCommunities = [1]; // Thomas More University is joined

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="dark:from-background dark:to-background w-full bg-gradient-to-b from-[#F5F5F5] to-white py-12 md:py-24 lg:py-32">
        <Container>
          <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Share What You Don't Need,
                  <span className="text-[#2E7D32]"> Find What You Do</span>
                </h1>
                <p className="text-muted-foreground max-w-[600px] md:text-xl">
                  Hand Me Down connects communities through sustainable giving.
                  Join a community, donate items you no longer need, or find
                  something you've been looking for.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#2E7D32] hover:bg-[#1B5E20]"
                >
                  <Link to="/communities">Find Communities</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto flex items-center justify-center lg:ml-auto">
              <img
                alt="Hand Me Down Community"
                className="aspect-video overflow-hidden rounded-xl object-cover object-center"
                height="550"
                src="/hero.png?height=550&width=700"
                width="700"
              />
            </div>
          </div>
        </Container>
      </section>
      {/* How It Works Section */}
      <section className="dark:bg-background w-full bg-white py-12 md:py-24 lg:py-32">
        <Container>
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join our platform in three simple steps and start making a
                difference today.
              </p>
            </div>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFC107] text-[#242424]">
                <Users className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Join a Community</h3>
                <p className="text-muted-foreground">
                  Find and join public communities in your area or create your
                  own private community.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2E7D32] text-white">
                <Gift className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Post or Find Items</h3>
                <p className="text-muted-foreground">
                  Post items you no longer need or browse available items in
                  your communities.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8D6E63] text-white">
                <MapPin className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Connect & Exchange</h3>
                <p className="text-muted-foreground">
                  Chat with donors, arrange pickup details, and confirm when the
                  exchange is complete.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>{" "}
      {/* Featured Communities Section */}
      <section className="dark:bg-muted w-full bg-[#F5F5F5] py-12 md:py-24 lg:py-32">
        <Container>
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Featured Communities
              </h2>
              <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Discover active communities making a difference through
                sustainable giving.
              </p>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Community Card 1 */}
            <Card key={1}>
              <CardHeader className="p-0">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src="/thomas-more.png?height=200&width=400"
                    alt="Thomas More University"
                    className="h-full w-full object-cover"
                  />                  <Badge
                    className="absolute top-4 right-4 bg-[#424242]"
                  >
                    <Lock className="mr-1 h-3 w-3" /> Private
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle>Thomas More University</CardTitle>
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Geel, Belgium</span>
                </div>
                <CardDescription className="mt-2 line-clamp-3 h-[4.5rem]">
                  A private community for students and teachers to donate and
                  exchange items within the university.
                </CardDescription>
                <div className="flex gap-4 mt-4 text-sm">
                  <div>
                    <span className="font-medium">245</span>
                    <span className="text-muted-foreground ml-1">members</span>
                  </div>
                  <div>
                    <span className="font-medium">56</span>
                    <span className="text-muted-foreground ml-1">items</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${
                    joinedCommunities.includes(1)
                      ? "bg-muted hover:bg-muted/80"
                      : "bg-[#FFC107] hover:bg-[#FFA000] text-[#242424]"
                  }`}
                  asChild
                >
                  <Link to="/communities/1">
                    {joinedCommunities.includes(1)
                      ? "View Community"
                      : "Request to Join"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            {/* Community Card 2 */}
            <Card key={2}>
              <CardHeader className="p-0">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src="/geel.jpg?height=200&width=400"
                    alt="City of Geel"
                    className="h-full w-full object-cover"
                  />
                  <Badge
                    className={`absolute top-4 right-4 ${"bg-[#2E7D32]"}`}
                  >
                    <>
                      <Users className="mr-1 h-3 w-3" /> Public
                    </>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle>City of Geel</CardTitle>
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Geel, Belgium</span>
                </div>
                <CardDescription className="mt-2 line-clamp-3 h-[4.5rem]">
                  A public community for residents of Geel to share and exchange
                  items locally.
                </CardDescription>
                <div className="flex gap-4 mt-4 text-sm">
                  <div>
                    <span className="font-medium">1203</span>
                    <span className="text-muted-foreground ml-1">members</span>
                  </div>
                  <div>
                    <span className="font-medium">187</span>
                    <span className="text-muted-foreground ml-1">items</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${
                    joinedCommunities.includes(2)
                      ? "bg-muted hover:bg-muted/80"
                      : "bg-[#2E7D32] hover:bg-[#1B5E20]"
                  }`}
                  asChild
                >
                  <Link to="/communities/2">
                    {joinedCommunities.includes(2)
                      ? "View Community"
                      : "Join Community"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            {/* Community Card 3 */}
            <Card key={3}>
              <CardHeader className="p-0">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src="/sustainable.jpg?height=200&width=400"
                    alt="Sustainable Living"
                    className="h-full w-full object-cover"
                  />
                  <Badge
                    className={`absolute top-4 right-4 ${"bg-[#2E7D32]"}`}
                  >
                    <>
                      <Users className="mr-1 h-3 w-3" /> Public
                    </>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle>Sustainable Living</CardTitle>
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Antwerp, Belgium</span>
                </div>
                <CardDescription className="mt-2 line-clamp-3 h-[4.5rem]">
                  A community focused on sustainable living practices and
                  reducing waste through item sharing.
                </CardDescription>
                <div className="flex gap-4 mt-4 text-sm">
                  <div>
                    <span className="font-medium">876</span>
                    <span className="text-muted-foreground ml-1">members</span>
                  </div>
                  <div>
                    <span className="font-medium">134</span>
                    <span className="text-muted-foreground ml-1">items</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${
                    joinedCommunities.includes(3)
                      ? "bg-muted hover:bg-muted/80"
                      : "bg-[#2E7D32] hover:bg-[#1B5E20]"
                  }`}
                  asChild
                >
                  <Link to="/communities/3">
                    {joinedCommunities.includes(3)
                      ? "View Community"
                      : "Join Community"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="mt-8 flex justify-center">
            <Button variant="outline" asChild>
              <Link to="/communities" className="flex items-center gap-2">
                View All Communities <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>
      {/* CTA Section */}
      <section className="w-full bg-[#2E7D32] py-12 text-white md:py-24 lg:py-32">
        <Container>
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Make a Difference?
              </h2>
              <p className="max-w-[900px] text-white/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join Hand Me Down today and be part of a growing movement of
                sustainable giving.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:gap-4 sm:flex-row">
              <Button asChild size="lg" variant="secondary">
                <Link to="/register">Create an Account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Link to="/communities">Explore Communities</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
