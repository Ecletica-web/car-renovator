"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Alert {
  id: string;
  keywords: string[];
  priceRangeMin?: number | null;
  priceRangeMax?: number | null;
  locationRadius?: number | null;
  isActive: boolean;
}

interface AlertConfigProps {
  partId: string;
  alerts: Alert[];
}

export default function AlertConfig({ partId, alerts: initialAlerts }: AlertConfigProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    keywords: "",
    priceRangeMin: "",
    priceRangeMax: "",
    locationRadius: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const keywordsArray = formData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      if (keywordsArray.length === 0) {
        alert("Please enter at least one keyword");
        return;
      }

      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partId,
          keywords: keywordsArray,
          priceRangeMin: formData.priceRangeMin
            ? parseFloat(formData.priceRangeMin)
            : undefined,
          priceRangeMax: formData.priceRangeMax
            ? parseFloat(formData.priceRangeMax)
            : undefined,
          locationRadius: formData.locationRadius
            ? parseInt(formData.locationRadius)
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create alert");
      }

      const newAlert = await response.json();
      setAlerts([newAlert, ...alerts]);
      setFormData({
        keywords: "",
        priceRangeMin: "",
        priceRangeMax: "",
        locationRadius: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error creating alert:", error);
      alert("Failed to create alert. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = async (alertId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update alert");
      }

      setAlerts(
        alerts.map((a) =>
          a.id === alertId ? { ...a, isActive: !currentStatus } : a
        )
      );
    } catch (error) {
      console.error("Error updating alert:", error);
      alert("Failed to update alert. Please try again.");
    }
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) {
      return;
    }

    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete alert");
      }

      setAlerts(alerts.filter((a) => a.id !== alertId));
    } catch (error) {
      console.error("Error deleting alert:", error);
      alert("Failed to delete alert. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      {alerts.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No alerts configured</p>
            <Button onClick={() => setShowForm(true)}>Create Alert</Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create OLX Alert</CardTitle>
            <CardDescription>
              Configure keywords and filters for OLX email alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma-separated) *</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                  placeholder="e.g., bumper, front, chrome"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceRangeMin">Min Price (€)</Label>
                  <Input
                    id="priceRangeMin"
                    type="number"
                    value={formData.priceRangeMin}
                    onChange={(e) =>
                      setFormData({ ...formData, priceRangeMin: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceRangeMax">Max Price (€)</Label>
                  <Input
                    id="priceRangeMax"
                    type="number"
                    value={formData.priceRangeMax}
                    onChange={(e) =>
                      setFormData({ ...formData, priceRangeMax: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationRadius">Location Radius (km)</Label>
                <Input
                  id="locationRadius"
                  type="number"
                  value={formData.locationRadius}
                  onChange={(e) =>
                    setFormData({ ...formData, locationRadius: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Alert"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      keywords: "",
                      priceRangeMin: "",
                      priceRangeMax: "",
                      locationRadius: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {alerts.map((alert) => (
        <Card key={alert.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {alert.keywords.join(", ")}
                </CardTitle>
                <CardDescription>
                  {alert.priceRangeMin || alert.priceRangeMax
                    ? `€${alert.priceRangeMin || 0} - €${alert.priceRangeMax || "∞"}`
                    : "No price filter"}
                  {alert.locationRadius && ` • ${alert.locationRadius}km radius`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    alert.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {alert.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggle(alert.id, alert.isActive)}
              >
                {alert.isActive ? "Deactivate" : "Activate"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(alert.id)}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {alerts.length > 0 && !showForm && (
        <Button onClick={() => setShowForm(true)}>Add Another Alert</Button>
      )}
    </div>
  );
}
