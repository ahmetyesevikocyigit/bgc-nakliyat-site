import { randomUUID } from "node:crypto";
import { readStoreJson, writeStoreJson } from "@/lib/persistent-store";

export type QuoteRequest = {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  service: string;
  fromAddress: string;
  toAddress: string;
  fromFloor: string;
  toFloor: string;
  roomCount: string;
  moveDate: string;
  elevatorNeed: string;
  photoUrls: string[];
  message: string;
};

export type QuoteRequestInput = {
  fullName: string;
  email: string;
  phone: string;
  service: string;
  fromAddress?: string;
  toAddress?: string;
  fromFloor?: string;
  toFloor?: string;
  roomCount?: string;
  moveDate?: string;
  elevatorNeed?: string;
  photoUrls?: string[];
  message?: string;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeQuoteRequest(request: Partial<QuoteRequest>): QuoteRequest | null {
  const id = cleanText(request.id, 120) || randomUUID();
  const createdAt = cleanText(request.createdAt, 40) || new Date().toISOString();
  const fullName = cleanText(request.fullName, 120);
  const email = cleanText(request.email, 180);
  const phone = cleanText(request.phone, 60);
  const service = cleanText(request.service, 140);
  const fromAddress = cleanText(request.fromAddress, 240);
  const toAddress = cleanText(request.toAddress, 240);
  const fromFloor = cleanText(request.fromFloor, 60);
  const toFloor = cleanText(request.toFloor, 60);
  const roomCount = cleanText(request.roomCount, 80);
  const moveDate = cleanText(request.moveDate, 40);
  const elevatorNeed = cleanText(request.elevatorNeed, 80);
  const photoUrls = Array.isArray(request.photoUrls)
    ? request.photoUrls
        .filter((url): url is string => typeof url === "string")
        .map((url) => url.trim())
        .filter((url) => url.startsWith("/uploads/quote-requests/"))
        .slice(0, 8)
    : [];
  const message = cleanText(request.message, 1000);

  if (!fullName || !email || !phone || !service) {
    return null;
  }

  return {
    id,
    createdAt,
    fullName,
    email,
    phone,
    service,
    fromAddress,
    toAddress,
    fromFloor,
    toFloor,
    roomCount,
    moveDate,
    elevatorNeed,
    photoUrls,
    message,
  };
}

export async function getQuoteRequests(): Promise<QuoteRequest[]> {
  const parsedValue = await readStoreJson<unknown>("quote-requests", []);

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue
    .map((item) => normalizeQuoteRequest(item as Partial<QuoteRequest>))
    .filter((item): item is QuoteRequest => Boolean(item))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export async function saveQuoteRequest(input: QuoteRequestInput) {
  const request = normalizeQuoteRequest({
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  });

  if (!request) {
    throw new Error("Invalid quote request");
  }

  const requests = [request, ...(await getQuoteRequests())].slice(0, 500);
  await writeStoreJson("quote-requests", requests);

  return request;
}
