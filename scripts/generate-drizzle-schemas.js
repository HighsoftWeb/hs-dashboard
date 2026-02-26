#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const mssql = require("mssql");
const cliProgress = require("cli-progress");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const color = {
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function toZodType(col) {
  const type = col.DATA_TYPE.toLowerCase();
  if (
    type.includes("int") ||
    type.includes("numeric") ||
    type.includes("decimal") ||
    type.includes("money") ||
    type.includes("float") ||
    type.includes("real")
  )
    return "z.number()";
  if (type.includes("bit")) return "z.boolean()";
  return "z.string()";
}

function toLabel(name) {
  return String(name)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function shouldSkipColumn(columnName) {
  return String(columnName).toUpperCase() === "IND_ATUALIZACAO";
}

function msToHuman(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rS = s % 60;
  if (m > 0) return `${m}m ${rS}s`;
  return `${rS}s`;
}

async function main() {
  const startedAt = Date.now();

  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    options: {
      trustServerCertificate: true,
      enableArithAbort: true,
    },
  };

  if (!config.user || !config.password || !config.database) {
    console.error(
      color.red("Missing DB credentials in env (DB_USER/DB_PASSWORD/DB_NAME).")
    );
    process.exit(1);
  }

  const schema = process.env.DB_SCHEMA || "dbo";

  console.log(color.bold(color.cyan("\n▶ Drizzle/Zod schema generator")));
  console.log(color.gray(`   Server: ${config.server}:${config.port || 1433}`));
  console.log(color.gray(`   Database: ${config.database}`));
  console.log(color.gray(`   Schema: ${schema}\n`));

  console.log(color.yellow("• Conectando ao SQL Server..."));
  const pool = await mssql.connect(config);

  try {
    console.log(color.yellow("• Buscando tabelas..."));
    const tablesRes = await pool
      .request()
      .query(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='${schema}' AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME`
      );

    const tables = tablesRes.recordset.map((r) => r.TABLE_NAME);

    if (!tables.length) {
      console.log(color.yellow("Nenhuma tabela encontrada."));
      return;
    }

    console.log(color.green(`✓ Encontrada ${tables.length} tabelas\n`));

    const out = [];
    out.push(`import { z } from "zod";\n`);

    const bar = new cliProgress.SingleBar(
      {
        format:
          color.gray("{bar}") +
          " " +
          "{percentage}%" +
          " | " +
          color.cyan("{value}/{total}") +
          " | " +
          "{table}",
        barCompleteChar: "█",
        barIncompleteChar: "░",
        hideCursor: true,
        clearOnComplete: false,
      },
      cliProgress.Presets.shades_classic
    );

    bar.start(tables.length, 0, { table: "Iniciando..." });

    const errors = [];
    let totalColumns = 0;
    let skippedColumns = 0;

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      bar.update(i, { table });

      try {
        const colsRes = await pool.request().query(`
          SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA='${schema}' AND TABLE_NAME='${table}'
          ORDER BY ORDINAL_POSITION
        `);

        const cols = colsRes.recordset;
        const filtered = cols.filter((c) => !shouldSkipColumn(c.COLUMN_NAME));

        totalColumns += cols.length;
        skippedColumns += cols.length - filtered.length;

        const tableVar = table.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        const schemaName = tableVar + "Schema";

        out.push(`export const ${schemaName} = z.object({`);
        filtered.forEach((c) => {
          const zt = toZodType(c);
          const nullable = c.IS_NULLABLE === "YES";
          out.push(
            `  ${c.COLUMN_NAME}: ${nullable ? `${zt}.nullable()` : zt},`
          );
        });
        out.push(`});\n`);

        out.push(`export const ${tableVar.toUpperCase()}_COLUMNS = [`);
        filtered.forEach((c) => {
          out.push(
            `  { key: "${c.COLUMN_NAME}", label: "${toLabel(
              c.COLUMN_NAME
            )}", length: ${c.CHARACTER_MAXIMUM_LENGTH || null}, type: "${c.DATA_TYPE}" },`
          );
        });
        out.push(`];\n`);
      } catch (e) {
        errors.push({ table, error: e?.message || String(e) });
      }

      bar.update(i + 1, { table });
    }

    bar.stop();

    const outPath = path.resolve(__dirname, "../core/schemas/schemas.ts");
    console.log(color.yellow(`\n• Escrevendo arquivo: ${outPath}`));
    fs.writeFileSync(outPath, out.join("\n"), "utf8");

    const elapsed = Date.now() - startedAt;

    console.log(color.green(`✓ Terminou em ${msToHuman(elapsed)}`));
    console.log(color.gray(`   Tabelas: ${tables.length}`));
    console.log(color.gray(`   Colunas encontradas: ${totalColumns}`));
    if (skippedColumns)
      console.log(
        color.gray(`   Colunas puladas: ${skippedColumns} (IND_ATUALIZACAO)`)
      );
    console.log(color.gray(`   Saida: ${outPath}`));

    if (errors.length) {
      console.log(color.red(`\n⚠ Completado com ${errors.length} erros:`));
      for (const e of errors.slice(0, 10)) {
        console.log(color.red(`   - ${e.table}: ${e.error}`));
      }
      if (errors.length > 10)
        console.log(color.red(`   ...e ${errors.length - 10} mais`));
      process.exitCode = 1;
    } else {
      console.log("");
    }
  } finally {
    pool.close();
  }
}

main().catch((err) => {
  console.error(color.red("\n✖ Fatal error"));
  console.error(err);
  process.exit(1);
});
