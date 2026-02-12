import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DiagnosisTree from "@/components/DiagnosisTree";
import { getSpecialistLabel } from "@/lib/car-knowledge-base";

export default async function DiagnosisPage({
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
      diagnosis: {
        include: {
          items: {
            include: {
              specialistContacts: true,
              children: {
                include: {
                  specialistContacts: true,
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  if (!project.diagnosis) {
    redirect(`/projects/${params.id}`);
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

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Diagnosis: {project.year} {project.make} {project.model}
          </h1>
          <p className="text-muted-foreground">
            Generated on {new Date(project.diagnosis.generatedAt).toLocaleDateString()}
          </p>
        </div>

        {project.diagnosis.summary && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {project.diagnosis.summary}
              </pre>
            </CardContent>
          </Card>
        )}

        <DiagnosisTree items={project.diagnosis.items} />
      </div>
    </div>
  );
}
