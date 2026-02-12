interface OutreachDraftParams {
  carMake: string;
  carModel: string;
  carYear: number;
  partName: string;
  partKeywords: string[];
  scrapyardName: string;
  userLocation?: string;
  channel: "email" | "whatsapp";
}

export function generateOutreachDraft(params: OutreachDraftParams): string {
  const { carMake, carModel, carYear, partName, partKeywords, scrapyardName, userLocation, channel } = params;

  if (channel === "email") {
    return generateEmailDraft(params);
  } else {
    return generateWhatsAppDraft(params);
  }
}

function generateEmailDraft(params: OutreachDraftParams): string {
  const { carMake, carModel, carYear, partName, scrapyardName, userLocation } = params;

  return `Subject: Inquiry about ${partName} for ${carYear} ${carMake} ${carModel}

Dear ${scrapyardName},

I hope this message finds you well. I am currently working on a restoration project for a ${carYear} ${carMake} ${carModel} and I am looking for a ${partName}.

${userLocation ? `I am located in ${userLocation} and ` : ""}I would like to know if you currently have or might come across this part. I am particularly interested in original or good condition used parts.

If you have this part available or know of any leads, I would greatly appreciate if you could let me know the condition, price, and availability.

Thank you for your time and assistance.

Best regards`;
}

function generateWhatsAppDraft(params: OutreachDraftParams): string {
  const { carMake, carModel, carYear, partName, scrapyardName, userLocation } = params;

  return `Hello ${scrapyardName}! 👋

I'm working on restoring a ${carYear} ${carMake} ${carModel} and I'm looking for a ${partName}.

${userLocation ? `I'm in ${userLocation}. ` : ""}Do you currently have this part or might come across it? I'm looking for original or good condition used parts.

If you have it or know of any leads, please let me know the condition and price.

Thanks! 🙏`;
}
