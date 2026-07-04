import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

export type QuoteRequest = {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

export type QuoteRequestInput = {
  fullName: string;
  email: string;
  phone: string;
  service: string;
  message?: string;
};

const quoteRequestsFilePath = join(process.cwd(), "src", "data", "quote-requests.json");

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
  const message = cleanText(request.message, 500);

  if (!fullName || !email || !phone || !service) {
    return null;
  }

  return { id, createdAt, fullName, email, phone, service, message };
}

export function getQuoteRequests(): QuoteRequest[] {
  if (!existsSync(quoteRequestsFilePath)) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(readFileSync(quoteRequestsFilePath, "utf8")) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map((item) => normalizeQuoteRequest(item as Partial<QuoteRequest>))
      .filter((item): item is QuoteRequest => Boolean(item))
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  } catch {
    return [];
  }
}

export function saveQuoteRequest(input: QuoteRequestInput) {
  const request = normalizeQuoteRequest({
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  });

  if (!request) {
    throw new Error("Invalid quote request");
  }

  const requests = [request, ...getQuoteRequests()].slice(0, 500);
  writeFileSync(quoteRequestsFilePath, `${JSON.stringify(requests, null, 2)}\n`, "utf8");

  return request;
}
