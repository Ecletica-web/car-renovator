import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center p-24">
          <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
            <h1 className="text-4xl font-bold mb-4">Classic Car Project Hub</h1>
            <p className="text-lg mb-8 text-muted-foreground">
              Manage your classic car renovation projects, parts sourcing, and scrapyard outreach
            </p>
            <Link href="/auth/login">
              <Button size="lg">Get Started</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  redirect("/projects");
}
