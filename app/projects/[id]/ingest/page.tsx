"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Link from "next/link";

export default function IngestPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    listingsFound?: number;
    listingsCreated?: number;
    listingsMatched?: number;
    error?: string;
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ingest/eml", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      setResult({
        success: true,
        listingsFound: data.listingsFound,
        listingsCreated: data.listingsCreated,
        listingsMatched: data.listingsMatched,
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Failed to process email",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/projects/${params.id}`}>
            <Button variant="ghost">← Back to Project</Button>
          </Link>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Upload OLX Email</CardTitle>
            <CardDescription>
              Upload a .eml file from OLX email alerts to import listings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="file-upload"
                className="block w-full p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".eml"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">
                    {isUploading ? "Processing..." : "Click to upload .eml file"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Select an OLX email alert file (.eml)
                  </p>
                </div>
              </label>
            </div>

            {result && (
              <div
                className={`p-4 rounded-lg ${
                  result.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {result.success ? (
                  <div>
                    <p className="font-medium text-green-800 mb-2">
                      Email processed successfully!
                    </p>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>Listings found: {result.listingsFound}</li>
                      <li>Listings created: {result.listingsCreated}</li>
                      <li>Matched to parts: {result.listingsMatched}</li>
                    </ul>
                    <div className="mt-4">
                      <Link href={`/projects/${params.id}`}>
                        <Button>View Project</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-800">{result.error}</p>
                )}
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">How to use:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Set up OLX alerts for your parts (save search)</li>
                <li>When you receive an email alert, save it as .eml file</li>
                <li>Upload the .eml file here</li>
                <li>Listings will be automatically matched to your parts</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
