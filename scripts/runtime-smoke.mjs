import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

// Disposable CI stack, internal network only. No production compose, data or integrations.
const prefix = `dayotter-runtime-${process.pid}`;
const network = `${prefix}-net`;
const names = ["db", "redis", "worker", "web"].map((name) => `${prefix}-${name}`);
const [db, redis, worker, web] = names;
const images = { web: `${prefix}-web`, worker: `${prefix}-worker` };
const docker = (...args) =>
  execFileSync("docker", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
async function until(check) {
  let lastFailure;
  for (let attempt = 0; attempt < 90; attempt++) {
    try {
      check();
      return;
    } catch (error) {
      lastFailure = error.stderr?.toString().trim() || error.message;
      await delay(1000);
    }
  }
  throw new Error(`disposable_stack_readiness_failed: ${lastFailure}`);
}
const environment = [
  "-e",
  "DATABASE_URL=postgresql://fixture:fixture@db:5432/fixture",
  "-e",
  "REDIS_URL=redis://redis:6379",
  "-e",
  "AUTH_SECRET=synthetic-runtime-fixture-secret-000000000000",
  "-e",
  "APP_URL=http://localhost:3000",
  "-e",
  "NEXT_TELEMETRY_DISABLED=1",
];
try {
  for (const service of ["web", "worker"]) {
    docker("build", "-f", `apps/${service}/Dockerfile`, "-t", images[service], ".");
    assert.equal(
      docker("run", "--rm", "--network", "none", images[service], "node", "-p", "process.version"),
      "v22.23.4",
    );
  }
  docker("pull", "postgres:17-alpine");
  docker("pull", "redis:7-alpine");
  docker("network", "create", "--internal", network);
  docker(
    "run",
    "-d",
    "--name",
    db,
    "--network",
    network,
    "--network-alias",
    "db",
    "-e",
    "POSTGRES_USER=fixture",
    "-e",
    "POSTGRES_PASSWORD=fixture",
    "-e",
    "POSTGRES_DB=fixture",
    "postgres:17-alpine",
  );
  docker(
    "run",
    "-d",
    "--name",
    redis,
    "--network",
    network,
    "--network-alias",
    "redis",
    "redis:7-alpine",
  );
  await until(() => docker("exec", db, "pg_isready", "-U", "fixture", "-d", "fixture"));
  const migrate = () =>
    docker(
      "run",
      "--rm",
      "--network",
      network,
      ...environment,
      images.worker,
      "pnpm",
      "--filter",
      "@dayotter/db",
      "migrate",
    );
  const migrationRows = () =>
    docker(
      "exec",
      db,
      "psql",
      "-U",
      "fixture",
      "-d",
      "fixture",
      "-Atc",
      "SELECT hash,created_at FROM drizzle.__drizzle_migrations ORDER BY id",
    );
  migrate();
  const before = migrationRows();
  assert.equal(before.split("\n").length, 64);
  migrate();
  assert.equal(migrationRows(), before);
  docker("run", "-d", "--name", worker, "--network", network, ...environment, images.worker);
  docker("run", "-d", "--name", web, "--network", network, ...environment, images.web);
  const probe = `const a=require('node:assert/strict');(async()=>{const r=await fetch('http://127.0.0.1:3000/api/health');a.equal(r.status,200,'health status');const j=await r.json();a.equal(j.db,true);a.equal(j.redis,true);a.equal(j.worker,'alive');const page=await fetch('http://127.0.0.1:3000/');a.equal(page.status,200,'home status');const session=await fetch('http://127.0.0.1:3000/api/auth/get-session');a.equal(session.status,200,'session status');a.equal(await session.json(),null)})().catch(e=>{console.error(e.message);process.exit(1)});`;
  await until(() => docker("exec", web, "node", "-e", probe));
  // Remove only the disposable heartbeat so stale liveness cannot mask a failed restart.
  docker("stop", worker);
  assert.equal(docker("exec", redis, "redis-cli", "DEL", "dayotter:worker:heartbeat"), "1");
  docker("start", worker);
  await until(() => {
    assert.equal(docker("inspect", "--format", "{{.State.Running}}", worker), "true");
    assert.ok(Number(docker("exec", redis, "redis-cli", "GET", "dayotter:worker:heartbeat")) > 0);
  });
  await until(() => docker("exec", web, "node", "-e", probe));
  assert.equal(migrationRows(), before);
  console.log(
    JSON.stringify({
      node: "22.23.4",
      images: 2,
      migrations: 64,
      migrationReplay: "unchanged",
      health: "passed",
      worker: "alive",
      anonymousSession: null,
      productionAccess: false,
    }),
  );
} catch (error) {
  // These containers contain only generated CI fixtures, never production data.
  for (const name of [worker, web]) {
    try {
      console.error(
        name,
        docker("inspect", "--format", "{{.State.Running}} {{.State.ExitCode}}", name),
      );
      execFileSync("docker", ["logs", "--tail", "25", name], { stdio: "inherit" });
    } catch {
      /* Preserve the original failure if startup failed before creation. */
    }
  }
  throw error;
} finally {
  for (const name of names) {
    try {
      docker("rm", "-f", name);
    } catch {
      /* Resource may not exist after early failure. */
    }
  }
  try {
    docker("network", "rm", network);
  } catch {
    /* Resource may not exist. */
  }
}
