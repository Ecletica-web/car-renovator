import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ScrapyardCardProps {
  scrapyard: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    region?: string | null;
    tags: string[];
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ScrapyardCard({
  scrapyard,
  onEdit,
  onDelete,
}: ScrapyardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{scrapyard.name}</CardTitle>
        <CardDescription>
          {scrapyard.city && scrapyard.region
            ? `${scrapyard.city}, ${scrapyard.region}`
            : scrapyard.city || scrapyard.region || "No location"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm mb-4">
          {scrapyard.address && (
            <p className="text-muted-foreground">{scrapyard.address}</p>
          )}
          {scrapyard.phone && (
            <p className="text-muted-foreground">Phone: {scrapyard.phone}</p>
          )}
          {scrapyard.email && (
            <p className="text-muted-foreground">Email: {scrapyard.email}</p>
          )}
          {scrapyard.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {scrapyard.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-secondary px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
