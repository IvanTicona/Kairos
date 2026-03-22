import Database, { type Database as DatabaseType } from "better-sqlite3";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

mkdirSync(dirname(config.CHRONOS_DB_PATH), { recursive: true });

export const db: DatabaseType = new Database(config.CHRONOS_DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8");
db.exec(schema);
