/**
 * Utility functions for generating WhatsApp links with pre-filled Arabic messages
 */

export const DEFAULT_WHATSAPP = "01226438938";

export function formatEgyptWhatsApp(phone: string): string {
  // Strip non-digit characters
  const clean = phone.replace(/\D/g, '');
  
  // If starts with 0 (e.g. 01226438938), replace leading 0 with 20
  if (clean.startsWith('0')) {
    return `20${clean.substring(1)}`;
  }
  // If already starts with 20, return as is
  if (clean.startsWith('20')) {
    return clean;
  }
  // Otherwise prepend 20
  return `20${clean}`;
}

export function buildWhatsAppLink(phone: string = DEFAULT_WHATSAPP, message: string = ''): string {
  const formattedPhone = formatEgyptWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message.trim());
  return `https://wa.me/${formattedPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}

export const PRESET_MESSAGES = {
  general: 'السلام عليكم يا حموكشة، حابب استفسر عن خدمات الإعلانات والتصوير لمشروعي.',
  startup: 'السلام عليكم يا حموكشة، عندي مشروع صغير وناشئ ومحتاج خطة دعم وإعلان تناسب ميزانيتي وتسمّع في سوهاج.',
  campaign: (title: string, client: string) => 
    `السلام عليكم يا حموكشة، شفت حملة "${title}" لـ "${client}" وحابب أعمل فكرة إعلان مشابهة لمحلي.`,
  offer: (offerTitle: string) => 
    `السلام عليكم يا حموكشة، حابب استفيد من العرض المعلن في الموقع: "${offerTitle}". هل العرض متاح؟`,
  areaInquiry: (areaName: string) => 
    `السلام عليكم، هل بتغطي تصوير وفلوجات في منطقة "${areaName}"؟ عايز أتفق على تصوير إعلان لمحلي هناك.`,
  vlogReel: (reelTitle: string) =>
    `السلام عليكم، شفت فلوج "${reelTitle}" وعايزك تيجي تصور فلوج وتغطية خاصة لمحلي.`
};
