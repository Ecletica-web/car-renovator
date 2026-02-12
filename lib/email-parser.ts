import * as cheerio from "cheerio";

export interface ParsedListing {
  title: string;
  url: string;
  price?: number;
  location?: string;
  postedAt?: Date;
}

/**
 * Parse OLX email HTML to extract listing information
 * OLX emails typically contain listings in HTML format with links and details
 */
export function parseOLXEmail(html: string, emailDate?: Date): ParsedListing[] {
  const $ = cheerio.load(html);
  const listings: ParsedListing[] = [];

  // Try multiple selectors that OLX might use in their emails
  // Common patterns: links with specific classes, table rows, list items
  
  // Pattern 1: Look for links that contain OLX URLs
  $('a[href*="olx.pt"], a[href*="olx.com"]').each((_, element) => {
    const $link = $(element);
    const href = $link.attr('href');
    const text = $link.text().trim();

    if (!href || !text) return;

    // Clean up the URL (remove tracking parameters)
    const cleanUrl = cleanOLXUrl(href);
    if (!cleanUrl) return;

    // Extract price from nearby text
    const price = extractPrice($link.parent().text() || $link.text());
    
    // Extract location from nearby text or parent elements
    const location = extractLocation($link.parent().text() || $link.text());

    // Try to find date information nearby
    const postedAt = extractDate($link.parent().text() || $link.text(), emailDate);

    // Avoid duplicates
    if (!listings.find(l => l.url === cleanUrl)) {
      listings.push({
        title: text,
        url: cleanUrl,
        price,
        location,
        postedAt,
      });
    }
  });

  // Pattern 2: Look for structured data in tables or divs
  $('.listing-item, .ad-item, [class*="listing"], [class*="ad"]').each((_, element) => {
    const $item = $(element);
    const $link = $item.find('a[href*="olx"]').first();
    
    if ($link.length === 0) return;

    const href = $link.attr('href');
    const title = $link.text().trim() || $item.find('h2, h3, .title').text().trim();

    if (!href || !title) return;

    const cleanUrl = cleanOLXUrl(href);
    if (!cleanUrl) return;

    const fullText = $item.text();
    const price = extractPrice(fullText);
    const location = extractLocation(fullText);
    const postedAt = extractDate(fullText, emailDate);

    if (!listings.find(l => l.url === cleanUrl)) {
      listings.push({
        title,
        url: cleanUrl,
        price,
        location,
        postedAt,
      });
    }
  });

  return listings;
}

/**
 * Clean OLX URL by removing tracking parameters and normalizing
 */
function cleanOLXUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Keep only essential parameters
    const cleanParams = new URLSearchParams();
    if (urlObj.searchParams.has('hash')) {
      cleanParams.set('hash', urlObj.searchParams.get('hash')!);
    }

    const cleanUrl = `${urlObj.origin}${urlObj.pathname}${cleanParams.toString() ? '?' + cleanParams.toString() : ''}`;
    return cleanUrl;
  } catch {
    return null;
  }
}

/**
 * Extract price from text (looks for €, EUR, or number patterns)
 */
function extractPrice(text: string): number | undefined {
  // Match patterns like "€100", "100€", "EUR 100", "100 EUR", "100,00€"
  const pricePatterns = [
    /€\s*(\d+(?:[.,]\d+)?)/i,
    /(\d+(?:[.,]\d+)?)\s*€/i,
    /EUR\s*(\d+(?:[.,]\d+)?)/i,
    /(\d+(?:[.,]\d+)?)\s*EUR/i,
  ];

  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      const priceStr = match[1].replace(',', '.');
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }
  }

  return undefined;
}

/**
 * Extract location from text
 */
function extractLocation(text: string): string | undefined {
  // Common location patterns in Portuguese (OLX Portugal)
  const locationPatterns = [
    /(?:em|de|em|localização|local)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*-\s*[A-Z][a-z]+/i, // "Lisboa - Lisboa"
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

/**
 * Extract date from text or use email date as fallback
 */
function extractDate(text: string, emailDate?: Date): Date | undefined {
  // Try to find date patterns
  const datePatterns = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY
    /(\d{1,2})-(\d{1,2})-(\d{4})/,   // DD-MM-YYYY
    /há\s+(\d+)\s+(?:dias?|horas?|minutos?)/i, // "há 2 dias"
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[4]) {
        // Relative date like "há 2 dias"
        const daysAgo = parseInt(match[4]);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date;
      } else if (match[3]) {
        // Absolute date
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // JS months are 0-indexed
        const year = parseInt(match[3]);
        return new Date(year, month, day);
      }
    }
  }

  // Fallback to email date
  return emailDate;
}

/**
 * Parse .eml file content
 */
export async function parseEMLFile(emlContent: string): Promise<{
  html: string;
  text: string;
  date?: Date;
}> {
  // Simple .eml parser - extract HTML and text parts
  // For production, consider using a library like mailparser
  
  const htmlMatch = emlContent.match(/Content-Type: text\/html[^]*?([\s\S]*?)(?=Content-Type:|--=|$)/i);
  const textMatch = emlContent.match(/Content-Type: text\/plain[^]*?([\s\S]*?)(?=Content-Type:|--=|$)/i);
  const dateMatch = emlContent.match(/Date:\s*(.+)/i);

  let html = htmlMatch ? htmlMatch[1].trim() : '';
  let text = textMatch ? textMatch[1].trim() : '';
  let date: Date | undefined;

  if (dateMatch) {
    date = new Date(dateMatch[1]);
    if (isNaN(date.getTime())) {
      date = undefined;
    }
  }

  // If no HTML found, try to extract from multipart
  if (!html && emlContent.includes('multipart')) {
    const parts = emlContent.split(/--[a-zA-Z0-9]+/);
    for (const part of parts) {
      if (part.includes('text/html')) {
        const htmlPart = part.split(/Content-Type: text\/html[^]*?\n\n/)[1];
        if (htmlPart) {
          html = htmlPart.split(/\n--/)[0].trim();
        }
      }
    }
  }

  return { html, text, date };
}
