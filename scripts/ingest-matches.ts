/** @format */

import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { z } from "zod";

const prisma = new PrismaClient();

// Schéma de validation des objets retournés par l'API externe
const MatchApiSchema = z.object({
  id: z.number(),
  competitionId: z.number(),
  homeTeamId: z.number(),
  awayTeamId: z.number(),
  scheduledDate: z.string().datetime(),
  status: z.string(),
  homeScore: z.number().nullable().optional(),
  awayScore: z.number().nullable().optional(),
  location: z.string().nullable().optional(),
  createdAat: z.string().datetime().optional(),
  updatedAat: z.string().datetime().optional(),
});
const MatchesApiSchema = z.array(MatchApiSchema);
const apiUrl = process.env.MATCHES_API_URL;
console.log("🔍 Using API:", apiUrl);

async function fetchMatches(apiUrl: string) {
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return MatchesApiSchema.parse(data); // validation Zod
}

async function main() {
  const API_URL =
    process.env.MATCHES_API_URL ??
    "https://frozen-bet-ext-api.vercel.app/matches";
  console.log(`🔎 Fetching matches from ${API_URL} ...`);

  const items = await fetchMatches(API_URL);
  console.log(`📦 ${items.length} match(es) récupéré(s)`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  // Traitement séquentiel (FK safe). Tu peux paralléliser plus tard avec p-limit si besoin.
  for (const m of items) {
    // Check FK (évite erreur de contrainte)
    const [comp, home, away] = await Promise.all([
      prisma.competition.findUnique({ where: { id: m.competitionId } }),
      prisma.team.findUnique({ where: { id: m.homeTeamId } }),
      prisma.team.findUnique({ where: { id: m.awayTeamId } }),
    ]);

    if (!comp || !home || !away) {
      console.warn(
        `⛔ SKIP match ${
          m.id
        } (FK manquantes) => competition:${!!comp}, home:${!!home}, away:${!!away}`
      );
      skipped++;
      continue;
    }

    // Upsert par id (on force l'id fourni par l'API)
    const res = await prisma.match.upsert({
      where: { id: m.id },
      create: {
        id: m.id,
        competitionId: m.competitionId,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        scheduledDate: new Date(m.scheduledDate),
        status: m.status,
        homeScore: m.homeScore ?? null,
        awayScore: m.awayScore ?? null,
        location: m.location ?? null,
      },
      update: {
        competitionId: m.competitionId,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        scheduledDate: new Date(m.scheduledDate),
        status: m.status,
        homeScore: m.homeScore ?? null,
        awayScore: m.awayScore ?? null,
        location: m.location ?? null,
      },
    });

    if (res.createdAt.getTime() === res.updatedAt.getTime()) {
      // heuristique: si createdAt == updatedAt juste après upsert, c'est probablement un create.
      created++;
    } else {
      updated++;
    }
  }

  console.log(
    `✅ Terminé. created=${created}, updated=${updated}, skipped=${skipped}`
  );
}

main()
  .catch((e) => {
    console.error("❌ Ingestion error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
