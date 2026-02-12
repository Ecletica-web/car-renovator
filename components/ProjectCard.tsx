import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: {
    id: string;
    make: string;
    model: string;
    year: number;
    trim?: string | null;
    city?: string | null;
    region?: string | null;
    createdAt: Date;
    parts?: { id: string }[];
    outreaches?: { id: string }[];
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const partsCount = project.parts?.length || 0;
  const outreachesCount = project.outreaches?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {project.year} {project.make} {project.model}
          {project.trim && ` ${project.trim}`}
        </CardTitle>
        <CardDescription>
          {project.city && project.region
            ? `${project.city}, ${project.region}`
            : project.city || project.region || "No location"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{partsCount} parts</span>
          <span>{outreachesCount} outreaches</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/projects/${project.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Project
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
