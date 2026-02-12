import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartCard from "@/components/PartCard";
import ListingsFeed from "@/components/ListingsFeed";
import ScrapyardsList from "@/components/ScrapyardsList";
import OutreachTracker from "@/components/OutreachTracker";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const project = await db.carProject.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      parts: {
        include: {
          alerts: true,
          listings: {
            orderBy: { ingestedAt: "desc" },
            take: 5,
          },
        },
      },
      outreaches: {
        include: {
          scrapyard: true,
          part: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/projects">
            <Button variant="ghost">← Back to Projects</Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {project.year} {project.make} {project.model}
                {project.trim && ` ${project.trim}`}
              </h1>
              <p className="text-muted-foreground">
                {project.city && project.region
                  ? `${project.city}, ${project.region}`
                  : project.city || project.region || "No location"}
              </p>
            </div>
            {project.diagnosisCompleted && (
              <Link href={`/projects/${project.id}/diagnosis`}>
                <Button>View Diagnosis</Button>
              </Link>
            )}
          </div>
        </div>

        <Tabs defaultValue="parts" className="w-full">
          <TabsList>
            <TabsTrigger value="parts">Parts ({project.parts.length})</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="scrapyards">Scrapyards</TabsTrigger>
            <TabsTrigger value="outreach">Outreach ({project.outreaches.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="parts" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Parts Wishlist</h2>
              <Link href={`/projects/${project.id}/parts/new`}>
                <Button>Add Part</Button>
              </Link>
            </div>
            {project.parts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">No parts added yet</p>
                  <Link href={`/projects/${project.id}/parts/new`}>
                    <Button>Add Your First Part</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.parts.map((part) => (
                  <PartCard
                    key={part.id}
                    part={{
                      ...part,
                      keywords: JSON.parse(part.keywords || "[]"),
                    }}
                    projectId={project.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="listings" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Listings</h2>
              <Link href={`/projects/${project.id}/ingest`}>
                <Button>Upload Email</Button>
              </Link>
            </div>
            <ListingsFeed projectId={project.id} />
          </TabsContent>

          <TabsContent value="scrapyards" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Scrapyards Directory</h2>
              <Link href={`/projects/${project.id}/scrapyards`}>
                <Button>Manage Scrapyards</Button>
              </Link>
            </div>
            <ScrapyardsList projectId={project.id} />
          </TabsContent>

          <TabsContent value="outreach" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Outreach Tracker</h2>
              <Link href={`/projects/${project.id}/outreach`}>
                <Button>Manage Outreach</Button>
              </Link>
            </div>
            <OutreachTracker projectId={project.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
