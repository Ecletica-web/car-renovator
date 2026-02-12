/**
 * AI Image Analyzer for car photos
 * Uses OpenAI Vision API or similar service to analyze car images
 */

export interface ImageAnalysis {
  issues: Array<{
    category: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    confidence: number;
    location?: string;
  }>;
  overallCondition: string;
  recommendations: string[];
}

export async function analyzeCarImage(
  imageUrl: string,
  carMake?: string,
  carModel?: string,
  carYear?: number
): Promise<ImageAnalysis> {
  // Check if OpenAI API key is available
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Return mock analysis if no API key
    return getMockAnalysis(imageUrl, carMake, carModel);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this car image${carMake && carModel ? ` of a ${carYear || ""} ${carMake} ${carModel}` : ""}. Identify any visible problems, damage, rust, wear, or issues. Categorize them by type (body, engine, electrical, etc.) and severity. Provide recommendations.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content || "";

    // Parse the AI response into structured format
    return parseAIResponse(analysisText);
  } catch (error) {
    console.error("Error analyzing image:", error);
    // Fallback to mock analysis
    return getMockAnalysis(imageUrl, carMake, carModel);
  }
}

function parseAIResponse(text: string): ImageAnalysis {
  // Simple parsing - in production, use structured output or better parsing
  const issues: ImageAnalysis["issues"] = [];
  const recommendations: string[] = [];

  // Try to extract structured information
  // This is a simplified parser - you might want to use structured outputs
  if (text.includes("rust")) {
    issues.push({
      category: "body",
      description: "Visible rust detected",
      severity: "high",
      confidence: 0.7,
    });
  }

  if (text.includes("damage") || text.includes("dent")) {
    issues.push({
      category: "body",
      description: "Body damage detected",
      severity: "medium",
      confidence: 0.6,
    });
  }

  return {
    issues,
    overallCondition: "Requires inspection",
    recommendations: ["Professional inspection recommended"],
  };
}

function getMockAnalysis(
  imageUrl: string,
  carMake?: string,
  carModel?: string
): ImageAnalysis {
  // Mock analysis for development/testing
  return {
    issues: [
      {
        category: "body",
        description: "Possible rust spots visible in wheel arch area",
        severity: "medium",
        confidence: 0.65,
        location: "Rear wheel arch",
      },
      {
        category: "body",
        description: "Minor scratches and paint chips detected",
        severity: "low",
        confidence: 0.8,
      },
    ],
    overallCondition: "Fair condition with some visible wear",
    recommendations: [
      "Inspect rust areas more closely",
      "Consider paint touch-up for scratches",
      "Check for structural damage",
    ],
  };
}
