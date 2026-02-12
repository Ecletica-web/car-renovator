"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Outreach {
  id: string;
  channel: string;
  messageDraft: string;
  status: string;
  lastContactedAt?: Date | null;
  notes?: string | null;
  part: {
    id: string;
    name: string;
  };
  scrapyard: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
}

interface OutreachTrackerProps {
  projectId: string;
}

export default function OutreachTracker({ projectId }: OutreachTrackerProps) {
  const [outreaches, setOutreaches] = useState<Outreach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "not_contacted" | "contacted" | "awaiting_reply" | "found_lead" | "closed">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchOutreaches();
  }, [projectId, filter]);

  const fetchOutreaches = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/outreach`);
      if (response.ok) {
        const data = await response.json();
        setOutreaches(data);
      }
    } catch (error) {
      console.error("Error fetching outreaches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/outreach/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOutreaches();
      }
    } catch (error) {
      console.error("Error updating outreach:", error);
    }
  };

  const filteredOutreaches = filter === "all" 
    ? outreaches 
    : outreaches.filter(o => o.status === filter);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All ({outreaches.length})
        </Button>
        <Button
          variant={filter === "not_contacted" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("not_contacted")}
        >
          Not Contacted ({outreaches.filter(o => o.status === "not_contacted").length})
        </Button>
        <Button
          variant={filter === "contacted" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("contacted")}
        >
          Contacted ({outreaches.filter(o => o.status === "contacted").length})
        </Button>
        <Button
          variant={filter === "awaiting_reply" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("awaiting_reply")}
        >
          Awaiting Reply ({outreaches.filter(o => o.status === "awaiting_reply").length})
        </Button>
        <Button
          variant={filter === "found_lead" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("found_lead")}
        >
          Found Lead ({outreaches.filter(o => o.status === "found_lead").length})
        </Button>
      </div>

      {filteredOutreaches.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No outreaches found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOutreaches.map((outreach) => (
            <Card key={outreach.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {outreach.part.name} → {outreach.scrapyard.name}
                    </CardTitle>
                    <CardDescription>
                      {outreach.channel === "email" ? "📧 Email" : "💬 WhatsApp"}
                      {outreach.lastContactedAt && (
                        <span className="ml-2">
                          • Last contacted: {new Date(outreach.lastContactedAt).toLocaleDateString()}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      outreach.status === "not_contacted"
                        ? "bg-gray-100 text-gray-800"
                        : outreach.status === "contacted"
                        ? "bg-blue-100 text-blue-800"
                        : outreach.status === "awaiting_reply"
                        ? "bg-yellow-100 text-yellow-800"
                        : outreach.status === "found_lead"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {outreach.status.replace("_", " ")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-3 rounded text-sm">
                  <pre className="whitespace-pre-wrap font-sans">
                    {outreach.messageDraft}
                  </pre>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(outreach.messageDraft, outreach.id)}
                  >
                    {copiedId === outreach.id ? "Copied!" : "Copy Message"}
                  </Button>
                  {outreach.channel === "email" && outreach.scrapyard.email && (
                    <a href={`mailto:${outreach.scrapyard.email}`}>
                      <Button variant="outline" size="sm">
                        Open Email
                      </Button>
                    </a>
                  )}
                  {outreach.channel === "whatsapp" && outreach.scrapyard.phone && (
                    <a
                      href={`https://wa.me/${outreach.scrapyard.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        Open WhatsApp
                      </Button>
                    </a>
                  )}
                  {outreach.status === "not_contacted" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => updateStatus(outreach.id, "contacted")}
                    >
                      Mark as Contacted
                    </Button>
                  )}
                  {outreach.status === "contacted" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(outreach.id, "awaiting_reply")}
                    >
                      Mark Awaiting Reply
                    </Button>
                  )}
                  {outreach.status === "awaiting_reply" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(outreach.id, "found_lead")}
                    >
                      Mark as Found Lead
                    </Button>
                  )}
                </div>

                {outreach.notes && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Notes:</strong> {outreach.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
