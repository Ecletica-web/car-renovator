import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PartCardProps {
  part: {
    id: string;
    name: string;
    description?: string | null;
    keywords: string[];
    notes?: string | null;
    alerts?: { id: string }[];
    listings?: { id: string }[];
  };
  projectId: string;
}

export default function PartCard({ part, projectId }: PartCardProps) {
  const alertsCount = part.alerts?.length || 0;
  const listingsCount = part.listings?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{part.name}</CardTitle>
        {part.description && (
          <CardDescription>{part.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {part.keywords.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">Keywords:</p>
            <div className="flex flex-wrap gap-1">
              {part.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-secondary px-2 py-1 rounded"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-4 text-sm text-muted-foreground mb-4">
          <span>{alertsCount} alerts</span>
          <span>{listingsCount} listings</span>
        </div>
        <Link href={`/projects/${projectId}/parts/${part.id}`}>
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
