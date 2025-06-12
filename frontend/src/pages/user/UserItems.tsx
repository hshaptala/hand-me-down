import { useEffect, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Container from "@/components/layout/Container";
import type { Item } from "@/models/item";
import { fetchUserDonations, fetchUserReceipts, fetchUserReservations } from "@/service/item.service";
import type { Community } from "@/models/community";
import { fetchCommunities } from "@/service/community.service";
import UserItem from "./UserItem";

export default function UserItemsPage() {
    const [activeTab, setActiveTab] = useState("reservations");
    const [reservations, setReservations] = useState<Item[]>([]);
    const [donations, setDonations] = useState<Item[]>([]);
    const [receipts, setReceipts] = useState<Item[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);

    useEffect(
        ()=>{
            fetchDonations();
            fetchReceipts();
            fetchReservations();
            fetchAllCommunities();
        }
    ,[]);

    const fetchAllCommunities = async ()=>{
      const c = await fetchCommunities();
      setCommunities(c);
    }

    const fetchDonations = async ()=>{
        const d = await fetchUserDonations();
        setDonations(d);
    }

    const fetchReceipts = async ()=>{
        const d = await fetchUserReceipts();
        setReceipts(d);
    }

    const fetchReservations = async ()=>{
        const d = await fetchUserReservations();
        setReservations(d);
    }


  return (
      <Container className="py-10">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold">Items</h1>
            <p className="text-muted-foreground">
              Manage your items
            </p>
          </div>

        <Tabs
            defaultValue="reservations"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <TabsList className="grid w-full sm:grid-cols-3 not-sm:grid-rows-3 not-sm:h-fit">
              <TabsTrigger value="reservations" className="flex items-center gap-2">
                <span className="sm:inline">Reservations</span>
              </TabsTrigger>
              <TabsTrigger value="donations" className="flex items-center gap-2">
                <span className="sm:inline">Donations</span>
              </TabsTrigger>
              <TabsTrigger value="receipts" className="flex items-center gap-2">
                <span className="sm:inline">Receipts</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="reservations">
              <Card>
                <CardHeader className="mt-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Reservations</CardTitle>
                    <CardDescription>
                      Items you are currently reserving
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {reservations.length > 0 ? (
                        reservations.map((item) => {
                          const community = communities.find((c: Community)=> c.id === item.community);
                          return <UserItem item={item} community={community} key={item.id} />})
                        ) : (
                        <div className="col-span-full py-12 text-center">
                            <p className="text-muted-foreground">
                            No items found
                            </p>
                        </div>
                        )}
                    </div>
                </CardContent>
              </Card>
            </TabsContent>


            {/* Donations */}
            <TabsContent value="donations">
              <Card>
                <CardHeader className="mt-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Donations</CardTitle>
                    <CardDescription>
                      Item you are giving or gave in the past.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {donations.length > 0 ? (
                        donations.map((item) => {
                          const community = communities.find((c: Community)=> c.id === item.community);
                          return <UserItem item={item} community={community} key={item.id} />})
                        ) : (
                        <div className="col-span-full py-12 text-center">
                            <p className="text-muted-foreground">
                            No items found
                            </p>
                        </div>
                        )}
                    </div>
                </CardContent>
              </Card>
            </TabsContent>


            {/* Receipts */}
            <TabsContent value="receipts">
              <Card>
                <CardHeader className="mt-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Receipts</CardTitle>
                    <CardDescription>
                      Item you received.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {receipts.length > 0 ? (
                        receipts.map((item) => {
                          const community = communities.find((c: Community)=> c.id === item.community);
                          return <UserItem item={item} community={community} key={item.id} />})
                        ) : (
                        <div className="col-span-full py-12 text-center">
                            <p className="text-muted-foreground">
                            No items found
                            </p>
                        </div>
                        )}
                    </div>
                </CardContent>
              </Card>
            </TabsContent>


          </Tabs>
        </div>
      </Container>
  );
}
