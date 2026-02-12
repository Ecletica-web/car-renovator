"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

interface ScrapyardFormProps {
  scrapyard?: Scrapyard;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ScrapyardForm({
  scrapyard,
  onSubmit,
  onCancel,
}: ScrapyardFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: scrapyard?.name || "",
    phone: scrapyard?.phone || "",
    email: scrapyard?.email || "",
    address: scrapyard?.address || "",
    city: scrapyard?.city || "",
    region: scrapyard?.region || "",
    tags: scrapyard?.tags.join(", ") || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        ...formData,
        tags: tagsArray,
        email: formData.email || undefined,
      };

      const url = scrapyard
        ? `/api/scrapyards/${scrapyard.id}`
        : "/api/scrapyards";
      const method = scrapyard ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save scrapyard");
      }

      onSubmit();
    } catch (error) {
      console.error("Error saving scrapyard:", error);
      alert("Failed to save scrapyard. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {scrapyard ? "Edit Scrapyard" : "Add New Scrapyard"}
        </CardTitle>
        <CardDescription>
          Add a scrapyard or dismantler to your directory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) =>
                  setFormData({ ...formData, region: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="e.g., classic cars, parts, dismantling"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : scrapyard ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
