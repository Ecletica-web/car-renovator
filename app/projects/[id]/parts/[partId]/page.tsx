import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AlertConfig from "@/components/AlertConfig";

export default async function PartDetailPage({
  params,
}: {
  params: { id: string; partId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const part = await db.part.findFirst({
    where: { id: params.partId },
    include: {
      project: true,
      alerts: {
        orderBy: { createdAt: "desc" },
      },
      listings: {
        orderBy: { ingestedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!part || part.project.userId !== session.user.id || part.projectId !== params.id) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/projects/${params.id}`}>
            <Button variant="ghost">← Back to Project</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{part.name}</CardTitle>
            {part.description && (
              <CardDescription>{part.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {part.notes && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">{part.notes}</p>
              </div>
            )}
            {JSON.parse(part.keywords || "[]").length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Keywords:</p>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(part.keywords || "[]").map((keyword: string, idx: number) => (
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
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">OLX Alerts</h2>
            </div>
            <AlertConfig partId={part.id} alerts={part.alerts.map(a => ({
              ...a,
              keywords: JSON.parse(a.keywords || "[]"),
            }))} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Recent Listings</h2>
            {part.listings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No listings found yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {part.listings.map((listing) => (
                  <Card key={listing.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{listing.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {listing.location || "Location unknown"}
                            {listing.price && ` • €${listing.price}`}
                          </p>
                        </div>
                        <a
                          href={listing.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
