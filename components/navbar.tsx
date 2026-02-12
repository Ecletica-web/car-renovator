"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Classic Car Hub
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/projects">
                <Button variant="ghost">Projects</Button>
              </Link>
              <span className="text-sm text-muted-foreground">
                {session.user?.email}
              </span>
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
