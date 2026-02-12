"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ScrapyardCard from "@/components/ScrapyardCard";
import ScrapyardForm from "@/components/ScrapyardForm";

interface Scrapyard {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  tags: string[];
}

export default function ScrapyardsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [scrapyards, setScrapyards] = useState<Scrapyard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingScrapyard, setEditingScrapyard] = useState<Scrapyard | null>(null);

  useEffect(() => {
    fetchScrapyards();
  }, []);

  const fetchScrapyards = async () => {
    try {
      const response = await fetch("/api/scrapyards");
      if (response.ok) {
        const data = await response.json();
        setScrapyards(data);
      }
    } catch (error) {
      console.error("Error fetching scrapyards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scrapyard?")) {
      return;
    }

    try {
      const response = await fetch(`/api/scrapyards/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setScrapyards(scrapyards.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Error deleting scrapyard:", error);
      alert("Failed to delete scrapyard");
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingScrapyard(null);
    fetchScrapyards();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
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

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Scrapyards Directory</h1>
          <Button onClick={() => setShowForm(true)}>Add Scrapyard</Button>
        </div>

        {showForm || editingScrapyard ? (
          <div className="mb-6">
            <ScrapyardForm
              scrapyard={editingScrapyard || undefined}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingScrapyard(null);
              }}
            />
          </div>
        ) : null}

        {scrapyards.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No scrapyards added yet</p>
              <Button onClick={() => setShowForm(true)}>Add Your First Scrapyard</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scrapyards.map((scrapyard) => (
              <ScrapyardCard
                key={scrapyard.id}
                scrapyard={scrapyard}
                onEdit={() => setEditingScrapyard(scrapyard)}
                onDelete={() => handleDelete(scrapyard.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
