"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isDevMode = process.env.NEXT_PUBLIC_DEV_AUTH_ENABLED === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/");
        router.refresh();
      } else {
        // Try email provider if credentials fails
        if (!isDevMode) {
          await signIn("email", {
            email,
            redirect: false,
          });
          router.push("/auth/verify");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    try {
      // Generate a random guest email
      const guestEmail = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}@guest.local`;
      
      console.log("Attempting guest sign-in with:", guestEmail);
      
      // Sign in with credentials (now always available)
      const result = await signIn("credentials", {
        email: guestEmail,
        redirect: false,
        callbackUrl: "/",
      });

      console.log("Sign-in result:", result);

      if (result?.ok) {
        console.log("Sign-in successful, redirecting...");
        window.location.href = "/";
      } else {
        console.error("Sign-in failed:", result?.error);
        // Try creating user first via API, then sign in
        const response = await fetch("/api/auth/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: guestEmail }),
        });
        
        if (response.ok) {
          console.log("Guest user created, attempting sign-in again...");
          // Try signing in again after user is created
          const signInResult = await signIn("credentials", {
            email: guestEmail,
            redirect: false,
            callbackUrl: "/",
          });
          
          if (signInResult?.ok) {
            window.location.href = "/";
          } else {
            console.error("Second sign-in attempt failed:", signInResult?.error);
            alert("Failed to sign in. Please try again.");
          }
        } else {
          const errorData = await response.json();
          console.error("Failed to create guest user:", errorData);
          alert("Failed to create guest account. Please try again.");
        }
      }
    } catch (error) {
      console.error("Guest sign-in error:", error);
      alert("Failed to sign in as guest. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            {isDevMode
              ? "Enter your email to sign in (dev mode)"
              : "Enter your email to receive a sign-in link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGuestSignIn}
              disabled={isLoading}
            >
              Continue as Guest
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Guest mode allows you to use the app without email verification
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
