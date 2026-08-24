// Création du premier compte administrateur — usage unique, local.
// Usage : node scripts/create-admin.mjs <email> <prenom> <nom> <motDePasse> [telephone]
import { readFileSync } from "node:fs";
import pg from "pg";
import bcrypt from "bcryptjs";

function databaseUrlFromEnv() {
  const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
  const line = env.split("\n").find((l) => l.startsWith("DATABASE_URL="));
  if (!line) throw new Error("DATABASE_URL introuvable dans .env");
  return line.slice("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
}

const [email, prenom, nom, password, telephone] = process.argv.slice(2);

if (!email || !prenom || !nom || !password) {
  console.error(
    "Usage : node scripts/create-admin.mjs <email> <prenom> <nom> <motDePasse> [telephone]"
  );
  process.exit(1);
}
if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
  console.error("Mot de passe faible : 8 caracteres min, 1 majuscule, 1 chiffre.");
  process.exit(1);
}

const hashed = await bcrypt.hash(password, 12);
const client = new pg.Client({ connectionString: databaseUrlFromEnv() });

await client.connect();
try {
  const existing = await client.query("SELECT id, role FROM \"User\" WHERE email = $1", [
    email.toLowerCase(),
  ]);

  if (existing.rows.length > 0) {
    await client.query(
      `UPDATE "User"
       SET password = $2, role = 'administrateur', actif = true,
           "tentativesEchouees" = 0, "verrouilleJusqua" = NULL
       WHERE id = $1`,
      [existing.rows[0].id, hashed]
    );
    console.log(`Compte existant mis a jour en administrateur : ${email}`);
  } else {
    await client.query(
      `INSERT INTO "User" (id, email, password, nom, prenom, telephone, role, actif)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'administrateur', true)`,
      [email.toLowerCase(), hashed, nom, prenom, telephone ?? null]
    );
    console.log(`Administrateur cree : ${email}`);
  }
} finally {
  await client.end();
}
