"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Scrapyard {
  id: string;
  name: string;
  city?: string | null;
  region?: string | null;
}

interface ScrapyardsListProps {
  projectId: string;
}

export default function ScrapyardsList({ projectId }: ScrapyardsListProps) {
  const [scrapyards, setScrapyards] = useState<Scrapyard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchScrapyards();
  }, []);

  const fetchScrapyards = async () => {
    try {
      const response = await fetch("/api/scrapyards");
      if (response.ok) {
        const data = await response.json();
        setScrapyards(data.slice(0, 5)); // Show first 5
      }
    } catch (error) {
      console.error("Error fetching scrapyards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (scrapyards.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">No scrapyards added yet</p>
          <Link href={`/projects/${projectId}/scrapyards`}>
            <Button>Add Scrapyard</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {scrapyards.map((scrapyard) => (
        <Card key={scrapyard.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{scrapyard.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {scrapyard.city && scrapyard.region
                    ? `${scrapyard.city}, ${scrapyard.region}`
                    : scrapyard.city || scrapyard.region || "No location"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Link href={`/projects/${projectId}/scrapyards`}>
        <Button variant="outline" className="w-full mt-2">
          View All Scrapyards
        </Button>
      </Link>
    </div>
  );
}
