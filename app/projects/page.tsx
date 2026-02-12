import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const projects = await db.carProject.findMany({
    where: { userId: session.user.id },
    include: {
      parts: {
        include: {
          listings: {
            where: {
              isNew: true,
              status: "new",
            },
          },
        },
      },
      outreaches: {
        where: {
          status: {
            in: ["not_contacted", "contacted", "awaiting_reply"],
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate stats
  const totalNewListings = projects.reduce(
    (sum, p) =>
      sum + p.parts.reduce((partSum, part) => partSum + part.listings.length, 0),
    0
  );
  const totalOpenOutreaches = projects.reduce(
    (sum, p) => sum + p.outreaches.length,
    0
  );
  const totalParts = projects.reduce((sum, p) => sum + p.parts.length, 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Projects</h1>
          <Link href="/projects/new">
            <Button>New Project</Button>
          </Link>
        </div>

        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Projects</CardDescription>
                <CardTitle className="text-3xl">{projects.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>New Listings</CardDescription>
                <CardTitle className="text-3xl">{totalNewListings}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Open Outreaches</CardDescription>
                <CardTitle className="text-3xl">{totalOpenOutreaches}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Link href="/projects/new">
              <Button>Create Your First Project</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
