"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OutreachTracker from "@/components/OutreachTracker";
import { generateOutreachDraft } from "@/lib/outreach-generator";

interface Part {
  id: string;
  name: string;
  keywords: string[];
}

interface Scrapyard {
  id: string;
  name: string;
}

export default function OutreachPage({
  params,
}: {
  params: { id: string };
}) {
  const [parts, setParts] = useState<Part[]>([]);
  const [scrapyards, setScrapyards] = useState<Scrapyard[]>([]);
  const [project, setProject] = useState<any>(null);
  const [selectedPart, setSelectedPart] = useState<string>("");
  const [selectedScrapyard, setSelectedScrapyard] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<"email" | "whatsapp">("email");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [projectRes, partsRes, scrapyardsRes] = await Promise.all([
        fetch(`/api/projects/${params.id}`),
        fetch(`/api/projects/${params.id}/parts`),
        fetch("/api/scrapyards"),
      ]);

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData);
      }

      if (partsRes.ok) {
        const partsData = await partsRes.json();
        setParts(partsData);
      }

      if (scrapyardsRes.ok) {
        const scrapyardsData = await scrapyardsRes.json();
        setScrapyards(scrapyardsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleCreateOutreach = async () => {
    if (!selectedPart || !selectedScrapyard) {
      alert("Please select both a part and a scrapyard");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: params.id,
          partId: selectedPart,
          scrapyardId: selectedScrapyard,
          channel: selectedChannel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create outreach");
      }

      // Reset form
      setSelectedPart("");
      setSelectedScrapyard("");
      setSelectedChannel("email");

      // Refresh tracker
      window.location.reload();
    } catch (error) {
      console.error("Error creating outreach:", error);
      alert("Failed to create outreach");
    } finally {
      setIsCreating(false);
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

        <h1 className="text-3xl font-bold mb-6">Outreach Tracker</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Outreach</CardTitle>
            <CardDescription>
              Generate a personalized message to contact a scrapyard about a part
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Part</label>
                <Select value={selectedPart} onValueChange={setSelectedPart}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a part" />
                  </SelectTrigger>
                  <SelectContent>
                    {parts.map((part) => (
                      <SelectItem key={part.id} value={part.id}>
                        {part.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Scrapyard</label>
                <Select value={selectedScrapyard} onValueChange={setSelectedScrapyard}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scrapyard" />
                  </SelectTrigger>
                  <SelectContent>
                    {scrapyards.map((scrapyard) => (
                      <SelectItem key={scrapyard.id} value={scrapyard.id}>
                        {scrapyard.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Channel</label>
                <Select
                  value={selectedChannel}
                  onValueChange={(v) => setSelectedChannel(v as "email" | "whatsapp")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleCreateOutreach}
              disabled={!selectedPart || !selectedScrapyard || isCreating}
            >
              {isCreating ? "Creating..." : "Generate Outreach"}
            </Button>
          </CardContent>
        </Card>

        <OutreachTracker projectId={params.id} />
      </div>
    </div>
  );
}
