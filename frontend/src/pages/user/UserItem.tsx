import type { Community } from "@/models/community";
import type { Item } from "@/models/item";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

type UserItemsSectionParameters = {
    item: Item;
    community: Community|undefined
}

export default function UserItem({item, community}: UserItemsSectionParameters) {
    return (
        <Card key={item.id}>
        <CardHeader className="p-0">
            <div className="relative h-48 w-full overflow-hidden">
            <img
                src={
                import.meta.env.VITE_API_BASE_URL + item.imageUrl
                }
                alt={item.title}
                className="h-full w-full object-cover"
            />
            <Badge
                className={`absolute top-4 right-4 ${
                item.status === "Open"
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
            {item.keywords && item.keywords.length > 0 && (
            <Badge variant="outline" className="mt-1">
                {item.keywords[0]}
            </Badge>
            )}
            <CardDescription className="mt-2 line-clamp-2">
            {item.description}
            </CardDescription>
            <div className="mt-4 flex items-center gap-2">
            <Avatar className="h-6 w-6">
                <AvatarImage
                src={
                    community
                    ? import.meta.env.VITE_API_BASE_URL +
                        community.imageUrl
                    : "/placeholder.svg"
                }
                alt="Community"
                />
            </Avatar>
            <span className="text-muted-foreground text-sm">
                {community
                ? `${community.name}`
                : "Loading..."}
                •
                {item.postedAt
                ? new Date(item.postedAt).toLocaleDateString()
                : new Date().toLocaleDateString()}
            </span>
            </div>
        </CardContent>
        <CardFooter>
            <Button
            className="bg-muted hover:bg-muted/80 w-full text-[#424242]"
            asChild
            >
            <Link
                to={`/communities/${item.community}/items/${item.id}`}
            >
                View Item
            </Link>
            </Button>
        </CardFooter>
        </Card>
    );
}