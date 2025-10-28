/**
 * @format
 * @file ingest-teams.ts
 * @description Script pour peupler la table "Team" à partir d'une API externe.
 */

import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { z } from "zod";

const prisma = new PrismaClient();

// ✅ Schéma de validation Zod
const TeamApiSchema = z.object({
  id: z.number(),
  competitionId: z.number(),
  name: z.string(),
  shortName: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  externalApiId: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
});

const TeamsApiSchema = z.array(TeamApiSchema);

async function fetchTeams(apiUrl: string) {
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error(`Erreur API ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return TeamsApiSchema.parse(data);
}

async function main() {
  const API_URL =
    process.env.TEAMS_API_URL ?? "https://frozen-bet-ext-api.vercel.app/teams";
  console.log(`🚀 Récupération des équipes depuis ${API_URL} ...`);

  const teams = await fetchTeams(API_URL);
  console.log(`📦 ${teams.length} équipe(s) récupérée(s)`);

  let created = 0;
  let updated = 0;

  for (const t of teams) {
    // Vérifie si la compétition liée existe
    const competition = await prisma.competition.findUnique({
      where: { id: t.competitionId },
    });

    if (!competition) {
      console.warn(
        `⛔ SKIP team ${t.id} : competition ${t.competitionId} introuvable`
      );
      continue;
    }

    await prisma.team.upsert({
      where: { id: t.id },
      create: {
        id: t.id,
        competitionId: t.competitionId,
        name: t.name,
        shortName: t.shortName ?? null,
        logoUrl: t.logoUrl ?? null,
        country: t.country ?? null,
        externalApiId: t.externalApiId ?? null,
      },
      update: {
        competitionId: t.competitionId,
        name: t.name,
        shortName: t.shortName ?? null,
        logoUrl: t.logoUrl ?? null,
        country: t.country ?? null,
        externalApiId: t.externalApiId ?? null,
      },
    });

    created++;
  }

  console.log(`✅ Terminé. ${created} équipes insérées ou mises à jour.`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur durant l’ingestion :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
