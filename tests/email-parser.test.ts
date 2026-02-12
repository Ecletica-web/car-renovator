import { parseOLXEmail, parseEMLFile } from "../lib/email-parser";

describe("OLX Email Parser", () => {
  describe("parseOLXEmail", () => {
    it("should parse simple HTML with OLX links", () => {
      const html = `
        <html>
          <body>
            <a href="https://www.olx.pt/item/123456">Front Bumper - Original</a>
            <a href="https://www.olx.pt/item/789012">Headlight Assembly €50</a>
          </body>
        </html>
      `;

      const listings = parseOLXEmail(html);
      expect(listings).toHaveLength(2);
      expect(listings[0].title).toBe("Front Bumper - Original");
      expect(listings[0].url).toContain("olx.pt");
      expect(listings[1].price).toBe(50);
    });

    it("should extract prices correctly", () => {
      const html = `
        <div>
          <a href="https://www.olx.pt/item/123">Part Name</a>
          <span>€100,50</span>
        </div>
      `;

      const listings = parseOLXEmail(html);
      expect(listings[0].price).toBe(100.5);
    });

    it("should extract location information", () => {
      const html = `
        <div>
          <a href="https://www.olx.pt/item/123">Part Name</a>
          <span>Localização: Lisboa</span>
        </div>
      `;

      const listings = parseOLXEmail(html);
      expect(listings[0].location).toBe("Lisboa");
    });

    it("should avoid duplicates", () => {
      const html = `
        <a href="https://www.olx.pt/item/123">Same Part</a>
        <a href="https://www.olx.pt/item/123">Same Part</a>
      `;

      const listings = parseOLXEmail(html);
      expect(listings).toHaveLength(1);
    });

    it("should clean URLs by removing tracking parameters", () => {
      const html = `
        <a href="https://www.olx.pt/item/123?hash=abc&utm_source=email">Part</a>
      `;

      const listings = parseOLXEmail(html);
      expect(listings[0].url).not.toContain("utm_source");
    });

    it("should handle empty HTML", () => {
      const listings = parseOLXEmail("");
      expect(listings).toHaveLength(0);
    });
  });

  describe("parseEMLFile", () => {
    it("should parse basic .eml structure", async () => {
      const emlContent = `
From: alerts@olx.pt
Date: Mon, 1 Jan 2024 12:00:00 +0000
Subject: New listings

Content-Type: text/html

<html><body><a href="https://www.olx.pt/item/123">Test</a></body></html>
      `;

      const result = await parseEMLFile(emlContent);
      expect(result.html).toContain("olx.pt");
      expect(result.date).toBeInstanceOf(Date);
    });
  });
});
