"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  url: string;
  price?: number | null;
  location?: string | null;
  postedAt?: Date | null;
  isNew: boolean;
  status: string;
  part?: {
    id: string;
    name: string;
  } | null;
}

interface ListingsFeedProps {
  projectId: string;
}

export default function ListingsFeed({ projectId }: ListingsFeedProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "viewed" | "contacted">("all");

  useEffect(() => {
    fetchListings();
  }, [projectId, filter]);

  const fetchListings = async () => {
    try {
      const response = await fetch(
        `/api/listings?projectId=${projectId}&filter=${filter}`
      );
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (listingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setListings(
          listings.map((l) =>
            l.id === listingId ? { ...l, status: newStatus, isNew: false } : l
          )
        );
      }
    } catch (error) {
      console.error("Error updating listing:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading listings...</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">No listings found</p>
          <Link href={`/projects/${projectId}/ingest`}>
            <Button>Upload Email</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "new" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("new")}
        >
          New
        </Button>
        <Button
          variant={filter === "viewed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("viewed")}
        >
          Viewed
        </Button>
        <Button
          variant={filter === "contacted" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("contacted")}
        >
          Contacted
        </Button>
      </div>

      <div className="space-y-2">
        {listings.map((listing) => (
          <Card key={listing.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {listing.isNew && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        New
                      </span>
                    )}
                    {listing.part && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {listing.part.name}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium mb-1">{listing.title}</h3>
                  <div className="text-sm text-muted-foreground">
                    {listing.location && <span>{listing.location}</span>}
                    {listing.price && (
                      <span className="ml-2">€{listing.price}</span>
                    )}
                    {listing.postedAt && (
                      <span className="ml-2">
                        {new Date(listing.postedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </a>
                  {listing.status === "new" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateStatus(listing.id, "viewed")}
                    >
                      Mark Viewed
                    </Button>
                  )}
                  {listing.status === "viewed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateStatus(listing.id, "contacted")}
                    >
                      Mark Contacted
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
