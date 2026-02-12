"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Phone, Mail, MapPin } from "lucide-react";
import { getSpecialistLabel } from "@/lib/car-knowledge-base";

interface SpecialistContact {
  id: string;
  name: string;
  type: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  rating?: number | null;
  isPlaceholder: boolean;
}

interface DiagnosisItem {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  priority: number;
  estimatedCost?: number | null;
  estimatedTime?: string | null;
  children?: DiagnosisItem[];
  specialistContacts: SpecialistContact[];
}

interface DiagnosisTreeProps {
  items: DiagnosisItem[];
}

export default function DiagnosisTree({ items }: DiagnosisTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const renderItem = (item: DiagnosisItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded.has(item.id);
    const isParent = hasChildren && (item.children?.length ?? 0) > 0;

    return (
      <div key={item.id} className={level > 0 ? "ml-6 mt-2" : ""}>
        <Card className={`${isParent ? "border-2" : ""}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {hasChildren && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(item.id)}
                      className="h-6 w-6 p-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <span
                    className={`text-xs px-2 py-1 rounded border ${getSeverityColor(
                      item.severity
                    )}`}
                  >
                    {item.severity.toUpperCase()}
                  </span>
                </div>
                <CardDescription className="mt-1">{item.description}</CardDescription>
                {item.estimatedCost && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Estimated: €{item.estimatedCost.toLocaleString()}
                    {item.estimatedTime && ` • ${item.estimatedTime}`}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>

          {isExpanded && hasChildren && item.children && (
            <CardContent className="pt-0">
              <div className="space-y-2">
                {item.children.map((child) => renderItem(child, level + 1))}
              </div>
            </CardContent>
          )}

          {item.specialistContacts && item.specialistContacts.length > 0 && (
            <CardContent className="pt-0 border-t">
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">
                  {getSpecialistLabel(item.category)} Contacts:
                </h4>
                <div className="space-y-2">
                  {item.specialistContacts.map((contact) => (
                    <Card key={contact.id} className="bg-muted/50">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{contact.name}</h5>
                            {contact.isPlaceholder && (
                              <span className="text-xs text-muted-foreground">
                                (Placeholder - Update with real contacts)
                              </span>
                            )}
                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                              {contact.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {contact.phone}
                                </div>
                              )}
                              {contact.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {contact.email}
                                </div>
                              )}
                              {(contact.address || contact.city) && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {contact.address || contact.city}
                                </div>
                              )}
                              {contact.rating && (
                                <div>Rating: {contact.rating}/5</div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {contact.phone && (
                              <a href={`tel:${contact.phone}`}>
                                <Button variant="outline" size="sm">
                                  <Phone className="h-3 w-3" />
                                </Button>
                              </a>
                            )}
                            {contact.email && (
                              <a href={`mailto:${contact.email}`}>
                                <Button variant="outline" size="sm">
                                  <Mail className="h-3 w-3" />
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    );
  };

  // Filter parent items (items without a parentId or items that are parents)
  const parentItems = items.filter((item) => {
    // Check if this item is a child of any other item
    const isChild = items.some((other) => 
      other.children?.some((child) => child.id === item.id) ?? false
    );
    return !isChild;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Diagnosis Breakdown</h2>
      {parentItems.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No diagnosis items found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {parentItems.map((item) => renderItem(item))}
        </div>
      )}
    </div>
  );
}
