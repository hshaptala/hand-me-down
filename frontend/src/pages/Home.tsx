import { MapPin, Users, Gift } from "lucide-react";
import { Link } from "react-router-dom";

import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="dark:from-background dark:to-background w-full bg-white py-12 md:py-24 lg:py-32">
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
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-[#FFC107] text-[#242424] hover:bg-[#FFA000]"
              >
                <Link to="/register">Create an Account</Link>
              </Button>{" "}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-[#424242]"
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
