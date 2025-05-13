import {Link} from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, Gift, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-[#F5F5F5] to-white dark:from-background dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Share What You Don't Need,
                  <span className="text-[#2E7D32]"> Find What You Do</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Hand Me Down connects communities through sustainable giving. Join a community, donate items you no
                  longer need, or find something you've been looking for.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 min-[400px]:gap-4">
                <Button asChild size="lg" className="bg-[#2E7D32] hover:bg-[#1B5E20]">
                  <Link to="/communities">Find Communities</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto lg:ml-auto flex items-center justify-center">
              <img
                alt="Hand Me Down Community"
                className="aspect-video overflow-hidden rounded-xl object-cover object-center"
                height="550"
                src="/placeholder.svg?height=550&width=700"
                width="700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join our platform in three simple steps and start making a difference today.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFC107] text-[#242424]">
                <Users className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Join a Community</h3>
                <p className="text-muted-foreground">
                  Find and join public communities in your area or create your own private community.
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
                  Post items you no longer need or browse available items in your communities.
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
                  Chat with donors, arrange pickup details, and confirm when the exchange is complete.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Communities Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-[#F5F5F5] dark:bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Communities</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Discover active communities making a difference through sustainable giving.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {/* Community Card 1 */}
            <Card>
              <CardHeader>
                <CardTitle>Thomas More University</CardTitle>
                <CardDescription>Private Community</CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  alt="Thomas More University Community"
                  className="aspect-video w-full rounded-lg object-cover"
                  height="200"
                  src="/placeholder.svg?height=200&width=400"
                  width="400"
                />
                <p className="mt-4 text-sm text-muted-foreground line-clamp-3 h-[4.5rem]">
                  A private community for students and teachers to donate and exchange items within the university.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Request to Join
                </Button>
              </CardFooter>
            </Card>

            {/* Community Card 2 */}
            <Card>
              <CardHeader>
                <CardTitle>City of Geel</CardTitle>
                <CardDescription>Public Community</CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  alt="City of Geel Community"
                  className="aspect-video w-full rounded-lg object-cover"
                  height="200"
                  src="/placeholder.svg?height=200&width=400"
                  width="400"
                />
                <p className="mt-4 text-sm text-muted-foreground line-clamp-3 h-[4.5rem]">
                  A public community for residents of Geel to share and exchange items locally.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#2E7D32] hover:bg-[#1B5E20]">Join Community</Button>
              </CardFooter>
            </Card>

            {/* Community Card 3 */}
            <Card>
              <CardHeader>
                <CardTitle>Sustainable Living</CardTitle>
                <CardDescription>Public Community</CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  alt="Sustainable Living Community"
                  className="aspect-video w-full rounded-lg object-cover"
                  height="200"
                  src="/placeholder.svg?height=200&width=400"
                  width="400"
                />
                <p className="mt-4 text-sm text-muted-foreground line-clamp-3 h-[4.5rem]">
                  A community focused on sustainable living practices and reducing waste through item sharing.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#2E7D32] hover:bg-[#1B5E20]">Join Community</Button>
              </CardFooter>
            </Card>
          </div>
          <div className="flex justify-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/communities" className="flex items-center gap-2">
                View All Communities <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-[#2E7D32] text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Make a Difference?
              </h2>
              <p className="max-w-[900px] text-white/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join Hand Me Down today and be part of a growing movement of sustainable giving.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 min-[400px]:gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link to="/register">Create an Account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                <Link to="/communities">Explore Communities</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
