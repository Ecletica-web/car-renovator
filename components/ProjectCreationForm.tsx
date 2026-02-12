"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Upload, Plus } from "lucide-react";

interface Problem {
  title: string;
  description: string;
  category: string;
}

interface Replacement {
  partName: string;
  date: string;
  cost: string;
  workshop: string;
}

export default function ProjectCreationForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  const [carInfo, setCarInfo] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    trim: "",
    city: "",
    region: "",
    mileage: "",
    vin: "",
    description: "",
  });

  const [problems, setProblems] = useState<Problem[]>([]);
  const [newProblem, setNewProblem] = useState({ title: "", description: "", category: "other" });
  const [photos, setPhotos] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [replacements, setReplacements] = useState<Replacement[]>([]);
  const [newReplacement, setNewReplacement] = useState<Replacement>({
    partName: "",
    date: "",
    cost: "",
    workshop: "",
  });

  const categories = [
    { value: "engine", label: "Engine" },
    { value: "electrical", label: "Electrical" },
    { value: "body", label: "Body" },
    { value: "suspension", label: "Suspension" },
    { value: "brakes", label: "Brakes" },
    { value: "transmission", label: "Transmission" },
    { value: "interior", label: "Interior" },
    { value: "other", label: "Other" },
  ];

  const handleCreateProject = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...carInfo,
          year: parseInt(carInfo.year.toString()),
          mileage: carInfo.mileage ? parseInt(carInfo.mileage) : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create project");
      const project = await response.json();
      setProjectId(project.id);
      setStep(2);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProblem = () => {
    if (newProblem.title.trim()) {
      setProblems([...problems, { ...newProblem }]);
      setNewProblem({ title: "", description: "", category: "other" });
    }
  };

  const handleRemoveProblem = (index: number) => {
    setProblems(problems.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos([...photos, ...files]);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments([...documents, ...files]);
  };

  const handleAddReplacement = () => {
    if (newReplacement.partName.trim()) {
      setReplacements([...replacements, { ...newReplacement }]);
      setNewReplacement({ partName: "", date: "", cost: "", workshop: "" });
    }
  };

  const handleRemoveReplacement = (index: number) => {
    setReplacements(replacements.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      // Upload photos
      for (const photo of photos) {
        const formData = new FormData();
        formData.append("file", photo);
        formData.append("type", "photo");
        await fetch(`/api/projects/${projectId}/upload`, {
          method: "POST",
          body: formData,
        });
      }

      // Upload documents
      for (const doc of documents) {
        const formData = new FormData();
        formData.append("file", doc);
        formData.append("type", "document");
        await fetch(`/api/projects/${projectId}/upload`, {
          method: "POST",
          body: formData,
        });
      }

      // Save problems
      for (const problem of problems) {
        await fetch(`/api/projects/${projectId}/problems`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(problem),
        });
      }

      // Save replacements
      for (const replacement of replacements) {
        await fetch(`/api/projects/${projectId}/replacements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...replacement,
            date: replacement.date || null,
            cost: replacement.cost ? parseFloat(replacement.cost) : null,
          }),
        });
      }

      // Generate diagnosis
      const diagnosisResponse = await fetch(`/api/projects/${projectId}/diagnosis/generate`, {
        method: "POST",
      });

      if (diagnosisResponse.ok) {
        router.push(`/projects/${projectId}/diagnosis`);
      } else {
        router.push(`/projects/${projectId}`);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Some files failed to upload, but project was created");
      if (projectId) router.push(`/projects/${projectId}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>
          Step {step} of 3: {step === 1 ? "Car Information" : step === 2 ? "Problems & Media" : "Review & Complete"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  value={carInfo.make}
                  onChange={(e) => setCarInfo({ ...carInfo, make: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={carInfo.model}
                  onChange={(e) => setCarInfo({ ...carInfo, model: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={carInfo.year}
                  onChange={(e) =>
                    setCarInfo({
                      ...carInfo,
                      year: parseInt(e.target.value) || new Date().getFullYear(),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trim">Trim</Label>
                <Input
                  id="trim"
                  value={carInfo.trim}
                  onChange={(e) => setCarInfo({ ...carInfo, trim: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={carInfo.mileage}
                  onChange={(e) => setCarInfo({ ...carInfo, mileage: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={carInfo.city}
                  onChange={(e) => setCarInfo({ ...carInfo, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={carInfo.region}
                  onChange={(e) => setCarInfo({ ...carInfo, region: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                value={carInfo.vin}
                onChange={(e) => setCarInfo({ ...carInfo, vin: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={carInfo.description}
                onChange={(e) => setCarInfo({ ...carInfo, description: e.target.value })}
                placeholder="Any additional information about the car..."
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={isLoading || !carInfo.make || !carInfo.model}>
                {isLoading ? "Creating..." : "Next: Add Problems"}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && projectId && (
          <div className="space-y-6">
            <Tabs defaultValue="problems">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="problems">Problems</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="replacements">Replacements</TabsTrigger>
              </TabsList>

              <TabsContent value="problems" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Reported Problems</Label>
                  <div className="space-y-2">
                    {problems.map((problem, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{problem.title}</h4>
                            {problem.description && (
                              <p className="text-sm text-muted-foreground">{problem.description}</p>
                            )}
                            <span className="text-xs bg-secondary px-2 py-1 rounded mt-1 inline-block">
                              {categories.find((c) => c.value === problem.category)?.label}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProblem(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <Label>Add Problem</Label>
                  <Input
                    placeholder="Problem title (e.g., Engine overheating)"
                    value={newProblem.title}
                    onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                  />
                  <textarea
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Description (optional)"
                    value={newProblem.description}
                    onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newProblem.category}
                      onChange={(e) => setNewProblem({ ...newProblem, category: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <Button type="button" onClick={handleAddProblem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="photos" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Upload Photos</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload photos of your car. AI will analyze them for issues.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="w-full"
                  />
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1"
                            onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Upload Documents</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload service records, repair invoices, manuals, etc.
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    multiple
                    onChange={handleDocumentUpload}
                    className="w-full"
                  />
                  {documents.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{doc.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="replacements" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Previous Replacements/Repairs</Label>
                  {replacements.map((replacement, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{replacement.partName}</h4>
                          {replacement.workshop && (
                            <p className="text-sm text-muted-foreground">Workshop: {replacement.workshop}</p>
                          )}
                          {replacement.date && (
                            <p className="text-sm text-muted-foreground">Date: {replacement.date}</p>
                          )}
                          {replacement.cost && (
                            <p className="text-sm text-muted-foreground">Cost: €{replacement.cost}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveReplacement(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Part name"
                      value={newReplacement.partName}
                      onChange={(e) => setNewReplacement({ ...newReplacement, partName: e.target.value })}
                    />
                    <Input
                      type="date"
                      placeholder="Date"
                      value={newReplacement.date}
                      onChange={(e) => setNewReplacement({ ...newReplacement, date: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Cost (€)"
                      value={newReplacement.cost}
                      onChange={(e) => setNewReplacement({ ...newReplacement, cost: e.target.value })}
                    />
                    <Input
                      placeholder="Workshop name"
                      value={newReplacement.workshop}
                      onChange={(e) => setNewReplacement({ ...newReplacement, workshop: e.target.value })}
                    />
                  </div>
                  <Button type="button" onClick={handleAddReplacement}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Replacement
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-4 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleUploadFiles} disabled={isLoading}>
                {isLoading ? "Processing..." : "Generate Diagnosis"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
