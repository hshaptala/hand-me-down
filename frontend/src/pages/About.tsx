import { Heart, Leaf, Recycle, Users } from "lucide-react";
import { Link } from "react-router-dom";

import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="dark:from-background dark:to-background w-full bg-white py-12 md:py-24 lg:py-32">
        <Container className="px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                About Hand Me Down
              </h1>
              <p className="text-muted-foreground max-w-[900px] md:text-xl">
                Our mission is to create a more sustainable world by connecting
                communities through the sharing of resources.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Our Story Section */}
      <section className="dark:bg-background w-full bg-white py-12 md:py-24">
        <Container className="px-4 md:px-6">
          <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Our Story</h2>
              <p className="text-muted-foreground md:text-lg">
                Hand Me Down was born from a simple observation: while some
                people have items they no longer need, others are in search of
                those very same items. We saw an opportunity to create a
                platform that would connect these individuals, reducing waste
                and fostering community connections in the process.
              </p>
              <p className="text-muted-foreground md:text-lg">
                What started as a small project has grown into a vibrant
                platform connecting thousands of people across different
                communities. Today, Hand Me Down is helping reduce waste,
                promote sustainability, and build stronger community bonds
                through the simple act of giving.
              </p>
            </div>
            <div className="mx-auto flex items-center justify-center lg:ml-auto">
              <img
                alt="Hand Me Down Team"
                className="aspect-video overflow-hidden rounded-xl object-cover object-center"
                height="400"
                src="/placeholder.svg?height=400&width=600"
                width="600"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Our Values Section */}
      <section className="dark:bg-muted w-full bg-[#F5F5F5] py-12 md:py-24">
        <Container className="px-4 md:px-6">
          <div className="mb-12 flex flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter">Our Values</h2>
            <p className="text-muted-foreground max-w-[900px] md:text-lg">
              The principles that guide everything we do at Hand Me Down.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="dark:bg-card flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2E7D32] text-white">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Sustainability</h3>
              <p className="text-muted-foreground">
                We believe in reducing waste and promoting a circular economy
                through reuse and sharing.
              </p>
            </div>
            <div className="dark:bg-card flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFC107] text-[#242424]">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Community</h3>
              <p className="text-muted-foreground">
                We foster connections between people, strengthening local
                communities through shared resources.
              </p>
            </div>
            <div className="dark:bg-card flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#8D6E63] text-white">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Generosity</h3>
              <p className="text-muted-foreground">
                We celebrate the spirit of giving and the joy that comes from
                helping others in need.
              </p>
            </div>
            <div className="dark:bg-card flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#424242] text-white">
                <Recycle className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Accessibility</h3>
              <p className="text-muted-foreground">
                We strive to make our platform accessible to everyone,
                regardless of background or circumstances.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="dark:bg-background w-full bg-white py-12 md:py-24">
        <Container className="px-4 md:px-6">
          <div className="mb-12 flex flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter">
              How Hand Me Down Works
            </h2>
            <p className="text-muted-foreground max-w-[900px] md:text-lg">
              Our platform is designed to be simple and intuitive, making it
              easy for anyone to participate.
            </p>
          </div>
          <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E7D32] font-bold text-white">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    Join or Create a Community
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Browse our interactive map to find public communities in
                    your area, or create your own private community for your
                    organization, school, or neighborhood.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E7D32] font-bold text-white">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold">Post or Browse Items</h3>
                  <p className="text-muted-foreground mt-2">
                    List items you no longer need by adding a title,
                    description, and optional photo. Or browse available items
                    in your communities to find something you need.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E7D32] font-bold text-white">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    Connect and Arrange Pickup
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    When you find an item you want, you can reserve it and chat
                    with the donor to arrange pickup details. The item's
                    location is determined by both parties in the chat.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E7D32] font-bold text-white">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold">Confirm the Exchange</h3>
                  <p className="text-muted-foreground mt-2">
                    After receiving the item, confirm the exchange is complete.
                    This helps build trust within the community and keeps the
                    platform running smoothly.
                  </p>
                </div>
              </div>
            </div>
            <div className="mx-auto flex items-center justify-center lg:ml-auto">
              <img
                alt="Hand Me Down Process"
                className="aspect-video overflow-hidden rounded-xl object-cover object-center"
                height="400"
                src="/placeholder.svg?height=400&width=600"
                width="600"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-[#2E7D32] py-12 text-white md:py-24">
        <Container className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">
                Join the Hand Me Down Community
              </h2>
              <p className="max-w-[900px] text-white/80 md:text-xl">
                Be part of a growing movement to reduce waste and build stronger
                communities through sustainable giving.
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
