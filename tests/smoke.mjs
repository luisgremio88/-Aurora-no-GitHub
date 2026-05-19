import { existsSync } from "node:fs";
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.AURORA_URL || "http://localhost:3123";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} -> ${response.status}: ${text}`);
  }
  return data;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const health = await request("/api/health");
assert(health.ok, "health endpoint did not return ok");

const models = await request("/api/models");
assert(Array.isArray(models.models), "models response should include models array");

const modelAdvisor = await request("/api/model-advisor");
assert(Array.isArray(modelAdvisor.installPlan), "model advisor should include install plan");
assert(modelAdvisor.recommendedRoutes && typeof modelAdvisor.recommendedRoutes === "object", "model advisor should include recommended routes");

const aiProviders = await request("/api/ai-providers");
assert(Array.isArray(aiProviders.providers), "ai providers should include providers array");
assert(aiProviders.providers.some((provider) => provider.id === "ollama"), "ai providers should include local Ollama");
assert(aiProviders.providers.some((provider) => provider.id === "openrouter"), "ai providers should include OpenRouter");
assert(aiProviders.providers.some((provider) => provider.id === "gemini"), "ai providers should include Gemini");
assert(!aiProviders.providers.some((provider) => provider.id === "openai"), "ai providers should not include direct OpenAI provider");
assert(!aiProviders.providers.some((provider) => provider.id === "copilot"), "ai providers should not include Copilot provider");
assert(!JSON.stringify(aiProviders).includes(process.env.OPENROUTER_API_KEY || "__missing_openrouter_key__"), "ai providers should not leak OpenRouter key");
assert(!JSON.stringify(aiProviders).includes(process.env.GEMINI_API_KEY || "__missing_gemini_key__"), "ai providers should not leak Gemini key");

const portable = await request("/api/portable-check");
assert(portable.appPath && Array.isArray(portable.checklist), "portable check should include appPath and checklist");
assert(portable.stats?.data?.exists, "portable check should include data folder stats");

const maintenance = await request("/api/maintenance?session=default");
assert(typeof maintenance.messageCount === "number", "maintenance should include messageCount");
assert(Array.isArray(maintenance.warnings), "maintenance should include warnings");
assert(typeof maintenance.dbSize === "number", "maintenance should include dbSize");

const benchmark = await request("/api/benchmark");
assert(typeof benchmark.overallScore === "number", "benchmark should include overallScore");
assert(Array.isArray(benchmark.areas), "benchmark should include areas");
assert(benchmark.areas.some((area) => area.id === "models"), "benchmark should include models area");
assert(Array.isArray(benchmark.recommendedNextActions), "benchmark should include recommended actions");

const capabilities = await request("/api/capabilities");
assert(Array.isArray(capabilities.tools), "capabilities should include system tools array");
assert(capabilities.tools.some((item) => item.command === "node" && item.available), "capabilities should detect node");
assert(Array.isArray(capabilities.capabilities), "capabilities should include capabilities array");
assert(capabilities.capabilities.some((item) => item.id === "xlsx"), "capabilities should include xlsx support check");

const toolRadar = await request("/api/tool-radar");
assert(Array.isArray(toolRadar.tools), "tool radar should include tools array");
assert(toolRadar.tools.some((item) => item.name === "Continue"), "tool radar should include Continue");
assert(Array.isArray(toolRadar.nextImprovements), "tool radar should include next improvements");

const plugins = await request("/api/plugins");
assert(Array.isArray(plugins.plugins), "plugins should include plugins array");
assert(plugins.plugins.some((plugin) => plugin.id === "preview-browser" && plugin.status === "active"), "plugins should include active preview browser");
assert(plugins.plugins.some((plugin) => plugin.id === "repo-engineering" && plugin.status === "active"), "plugins should include active repository engineering");
assert(plugins.plugins.some((plugin) => plugin.id === "external-ai-router"), "plugins should include external AI router");
assert(typeof plugins.summary?.missing === "number", "plugins should include summary");

const imageProviders = await request("/api/image-providers");
assert(Array.isArray(imageProviders.providers), "image providers should include providers array");
assert(imageProviders.providers.some((provider) => provider.id === "comfyui"), "image providers should include ComfyUI");
assert(imageProviders.providers.some((provider) => provider.id === "gemini-image"), "image providers should include Gemini image");
assert(imageProviders.providers.some((provider) => provider.id === "svg-fallback"), "image providers should include SVG fallback");

const repositoryEngineering = await request("/api/repository-engineering");
assert(repositoryEngineering.architecture?.indexedFiles >= 0, "repository engineering should include architecture index count");
assert(Array.isArray(repositoryEngineering.autonomyMatrix), "repository engineering should include autonomy matrix");
assert(repositoryEngineering.autonomyMatrix.some((item) => item.capability.includes("GitHub")), "repository engineering should mention GitHub capability");

const engineeringTask = await request("/api/engineering-tasks", {
  method: "POST",
  body: JSON.stringify({ objective: "Validar mini PR local com evidencias." })
});
assert(engineeringTask.task?.id, "engineering task creation should return id");

const engineeringTaskRun = await request("/api/engineering-tasks/run", {
  method: "POST",
  body: JSON.stringify({ id: engineeringTask.task.id, commandIds: ["npm-run-check"] })
});
assert(engineeringTaskRun.ok, "engineering task run should complete safe checks");
assert(engineeringTaskRun.task?.summary?.commands >= 1, "engineering task run should attach command evidence");

const resourceLibrary = await request("/api/resource-library");
assert(Array.isArray(resourceLibrary.resources), "resource library should include resources array");

const attachedProject = await request("/api/attached-project", {
  method: "POST",
  body: JSON.stringify({ path: process.cwd(), analyze: true })
});
assert(attachedProject.project?.path, "attached project should save project path");
assert(attachedProject.index?.totalFiles >= 1, "attached project should generate an index");
assert(attachedProject.codeMap?.totalFiles >= 1, "attached project should generate a code map");

const loadedAttachedProject = await request("/api/attached-project");
assert(loadedAttachedProject.project?.path === attachedProject.project.path, "attached project should be persisted");

const attachedEditRelative = `generated/smoke-attached-edit-${Date.now()}.md`;
const attachedEditFullPath = path.join(process.cwd(), attachedEditRelative);
await writeFile(attachedEditFullPath, "# Smoke attached\n\nAntes.\n", "utf8");
const attachedRead = await request("/api/read-file", {
  method: "POST",
  body: JSON.stringify({ scope: "attached", path: attachedEditRelative })
});
assert(attachedRead.path === `attached-project/${attachedEditRelative}`, "attached read should return attached-project path");
assert(attachedRead.content.includes("Antes."), "attached read should return file content");
const attachedApply = await request("/api/apply-edit", {
  method: "POST",
  body: JSON.stringify({
    path: `attached-project/${attachedEditRelative}`,
    proposed: "# Smoke attached\n\nDepois.\n",
    reason: "Smoke test de edicao segura no projeto anexado."
  })
});
assert(attachedApply.path === `attached-project/${attachedEditRelative}`, "attached apply should edit attached project path");
assert(attachedApply.backup?.startsWith("attached-project/"), "attached apply should create attached backup");
await rm(attachedEditFullPath, { force: true });
await rm(path.join(process.cwd(), attachedApply.backup.replace(/^attached-project\//, "")), { force: true });

const scannedResource = await request("/api/resource-library", {
  method: "POST",
  body: JSON.stringify({ title: "Aurora App", path: process.cwd() })
});
assert(scannedResource.resources.some((item) => item.title === "Aurora App"), "resource library should save scanned folder");
assert(scannedResource.resources[0].stats?.totalFiles > 0, "scanned resource should include file stats");

const behaviorSettings = await request("/api/behavior-settings");
assert(typeof behaviorSettings.settings?.freeBuilder !== "undefined", "behavior settings should include freeBuilder");

const savedBehaviorSettings = await request("/api/behavior-settings", {
  method: "POST",
  body: JSON.stringify({ freeBuilder: true, advancedExecutor: true })
});
assert(Boolean(savedBehaviorSettings.settings?.freeBuilder), "behavior settings should save freeBuilder mode");
assert(Boolean(savedBehaviorSettings.settings?.advancedExecutor), "behavior settings should save advanced executor mode");

const imageResult = await request("/api/create-image", {
  method: "POST",
  body: JSON.stringify({ prompt: "Imagem simples de um cachorro feliz.", fileName: "smoke-cachorro", provider: "svg" })
});
assert(imageResult.image?.path?.endsWith(".svg"), "image creation should return svg path");
assert(imageResult.image?.url?.includes("/generated/images/"), "image creation should return public generated URL");
assert(existsSync(path.resolve(process.cwd(), "..", imageResult.image.path)), "image SVG should exist on disk");

const imageChat = await request("/api/chat", {
  method: "POST",
  body: JSON.stringify({
    mode: "general",
    imageProvider: "svg",
    messages: [{ role: "user", content: "Faça uma imagem de cachorro simples." }]
  })
});
assert(imageChat.message?.includes("/generated/images/"), "image chat should create local image instead of ASCII art");
assert(imageChat.image?.url?.includes("/generated/images/"), "image chat should return image metadata for inline preview");
assert(imageChat.image?.type === "image/svg+xml", "image chat should return svg image type");

const sessions = await request("/api/sessions");
assert(Array.isArray(sessions.sessions), "sessions response should include sessions array");

const changes = await request("/api/change-log");
assert(Array.isArray(changes.changes), "change log response should include changes array");

const schema = await request("/api/sql");
assert(Array.isArray(schema.tables), "sql schema response should include tables array");
assert(schema.tables.some((table) => Array.isArray(table.columns)), "sql schema should include columns");

const sql = await request("/api/sql", {
  method: "POST",
  body: JSON.stringify({ sql: "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name" })
});
assert(Array.isArray(sql.rows), "sql response should include rows");
assert(typeof sql.durationMs === "number", "sql response should include durationMs");

const explain = await request("/api/sql", {
  method: "POST",
  body: JSON.stringify({ sql: "EXPLAIN QUERY PLAN SELECT name FROM sqlite_master WHERE type = 'table'" })
});
assert(Array.isArray(explain.rows), "explain response should include rows");
assert(explain.rows.length > 0, "explain response should include a query plan");

const sqlHistory = await request("/api/sql-history");
assert(Array.isArray(sqlHistory.queries), "sql history response should include queries array");
assert(sqlHistory.queries.some((query) => query.sql.includes("sqlite_master")), "sql history should include recent query");

const localDatabase = await request("/api/local-database", {
  method: "POST",
  body: JSON.stringify({ objective: "Criar banco de dados para clientes, produtos, pedidos e pagamentos." })
});
assert(localDatabase.databasePath?.endsWith(".sqlite"), "local database builder should return sqlite path");
assert(localDatabase.schemaPath?.endsWith("schema.sql"), "local database builder should return schema path");
assert(localDatabase.seedPath?.endsWith("seed.sql"), "local database builder should return seed path");
assert(localDatabase.validation?.ok, "local database builder should pass validation");
assert(localDatabase.validation?.tables?.includes("customers"), "local database should include customers table");
assert(localDatabase.validation?.tables?.includes("orders"), "local database should include orders table");
assert(existsSync(path.resolve(process.cwd(), "..", localDatabase.databasePath)), "local database sqlite file should exist");
assert(existsSync(path.resolve(process.cwd(), "..", localDatabase.schemaPath)), "local database schema should exist");
await rm(path.resolve(process.cwd(), "..", localDatabase.path), { recursive: true, force: true });

const postgresDatabase = await request("/api/local-database", {
  method: "POST",
  body: JSON.stringify({ objective: "Criar banco PostgreSQL para clientes, pedidos e pagamentos." })
});
assert(postgresDatabase.engine === "postgresql", "database builder should detect PostgreSQL");
assert(postgresDatabase.dockerComposePath?.endsWith("docker-compose.yml"), "postgres database should include docker compose");
assert(postgresDatabase.envExamplePath?.endsWith(".env.example"), "postgres database should include env example");
assert(postgresDatabase.validation?.ok, "postgres database artifact validation should pass");
assert(existsSync(path.resolve(process.cwd(), "..", postgresDatabase.dockerComposePath)), "postgres docker compose should exist");
const postgresDockerStatus = await request("/api/local-database/docker", {
  method: "POST",
  body: JSON.stringify({ path: postgresDatabase.path, action: "status" })
});
assert(typeof postgresDockerStatus.ok === "boolean", "postgres docker status should return ok boolean");
await rm(path.resolve(process.cwd(), "..", postgresDatabase.path), { recursive: true, force: true });

const autonomousTask = await request("/api/autonomous-task", {
  method: "POST",
  body: JSON.stringify({ objective: "Criar banco PostgreSQL para clientes e pedidos." })
});
assert(autonomousTask.source === "autonomous-orchestrator", "autonomous task should use orchestrator");
assert(autonomousTask.database?.engine === "postgresql", "autonomous task should create postgres database artifacts");
assert(Array.isArray(autonomousTask.steps) && autonomousTask.steps.length >= 2, "autonomous task should report steps");
assert(autonomousTask.steps.some((step) => step.title.includes("Criar banco")), "autonomous task should include database creation step");
await rm(path.resolve(process.cwd(), "..", autonomousTask.database.path), { recursive: true, force: true });

const codexMode = await request("/api/codex-mode", {
  method: "POST",
  body: JSON.stringify({ objective: "Preparar Modo Codex para melhorar a Aurora Local.", updateProfile: true })
});
assert(codexMode.source === "codex-mode", "codex mode should return source");
assert(codexMode.stack?.stack?.includes("Node.js"), "codex mode should detect Node.js");
assert(Array.isArray(codexMode.lanes) && codexMode.lanes.length >= 5, "codex mode should include work lanes");
assert(codexMode.plan?.includes("Modo Codex da Aurora"), "codex mode should include plan");

const codexExecutor = await request("/api/codex-executor", {
  method: "POST",
  body: JSON.stringify({
    objective: "Rodar ciclo Codex para validar contexto, plano e checks seguros.",
    commandIds: ["npm-run-check"]
  })
});
assert(codexExecutor.source === "codex-executor-cycle", "codex executor should return cycle source");
assert(codexExecutor.executorPlan?.plan?.includes("Executor avancado"), "codex executor should include executor plan");
assert(Array.isArray(codexExecutor.nextActions), "codex executor should include next actions");
assert(codexExecutor.safeRun?.skipped || codexExecutor.safeRun?.results?.some((result) => result.commandId === "npm-run-check"), "codex executor should run or explicitly skip safe checks");

const blockedSql = await fetch(`${baseUrl}/api/sql`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ sql: "SELECT 1; DROP TABLE sessions" })
});
assert(blockedSql.status === 403, "unsafe SQL should be blocked");

const blockedSqlAnalysis = await fetch(`${baseUrl}/api/sql-analyze`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ sql: "DELETE FROM sessions" })
});
assert(blockedSqlAnalysis.status === 400, "sql analysis should only accept SELECT");

const plan = await request("/api/plan", {
  method: "POST",
  body: JSON.stringify({ mode: "code", task: "Adicionar teste de smoke." })
});
assert(plan.plan && Array.isArray(plan.likelyFiles), "plan should include text and likelyFiles");

const mission = await request("/api/missions", {
  method: "POST",
  body: JSON.stringify({ objective: "Continuar remake de Digimon 3 com seguranca e testes." })
});
assert(mission.mission?.id, "mission creation should return an id");
assert(Array.isArray(mission.mission.needs), "mission should include needs");
assert(mission.mission.needs.length > 0, "mission should include at least one need");
assert(Array.isArray(mission.mission.actions), "mission should include actions");

const missions = await request("/api/missions");
assert(Array.isArray(missions.missions), "missions response should include missions array");
assert(missions.missions.some((item) => item.id === mission.mission.id), "missions list should include created mission");

const executorPlan = await request("/api/executor-plan", {
  method: "POST",
  body: JSON.stringify({ objective: "Construir site completo com banco, testes e seguranca." })
});
assert(executorPlan.plan?.includes("Executor avancado"), "executor plan should include executor header");
assert(Array.isArray(executorPlan.likelyFiles), "executor plan should include likelyFiles");
assert(Array.isArray(executorPlan.missingCapabilities), "executor plan should include missingCapabilities");
assert(Array.isArray(executorPlan.executionQueue), "executor plan should include executionQueue");
assert(executorPlan.executionQueue.some((step) => step.id === "run-checks"), "executor queue should include validation step");

const autopilotPlan = await request("/api/autopilot-plan", {
  method: "POST",
  body: JSON.stringify({
    objective: "Criar site com Java, Python, HTML, CSS e banco PostgreSQL para cadastro de clientes.",
    createScaffold: false,
    runSafeChecks: true,
    commandIds: ["npm-run-check"]
  })
});
assert(autopilotPlan.plan?.includes("Autopiloto Aurora"), "autopilot should include autopilot header");
assert(autopilotPlan.profile?.languages?.includes("java"), "autopilot should detect Java");
assert(autopilotPlan.profile?.languages?.includes("python"), "autopilot should detect Python");
assert(autopilotPlan.profile?.database === "postgresql", "autopilot should detect PostgreSQL");
assert(autopilotPlan.artifact?.url?.includes("/generated/autopilot/"), "autopilot should expose generated artifact URL");
assert(existsSync(path.resolve(process.cwd(), "..", autopilotPlan.artifact.path)), "autopilot artifact should exist on disk");
assert(autopilotPlan.safeRun?.results?.some((result) => result.commandId === "npm-run-check" && result.ok), "autopilot should run safe check when requested");

const executorRunStep = await request("/api/executor-run-step", {
  method: "POST",
  body: JSON.stringify({ stepId: "smoke-check", commandIds: ["npm-run-check"] })
});
assert(executorRunStep.ok, "executor run step should return ok");
assert(executorRunStep.results?.some((result) => result.commandId === "npm-run-check" && result.ok), "executor run step should execute safe command");

const evidence = await request("/api/execution-evidence?limit=5");
assert(Array.isArray(evidence.evidence), "execution evidence should include evidence array");
assert(evidence.evidence.some((item) => item.stepId === "smoke-check" && item.commandId === "npm-run-check"), "execution evidence should record executor command");

const engineeringTasks = await request("/api/engineering-tasks");
const smokeTask = engineeringTasks.tasks.find((task) => task.id === engineeringTask.task.id);
assert(smokeTask, "engineering tasks list should include created task");
assert(smokeTask.summary?.totalEvidence >= 1, "engineering task should summarize evidence since creation");

const completedEngineeringTask = await request("/api/engineering-tasks", {
  method: "PATCH",
  body: JSON.stringify({ id: engineeringTask.task.id, status: "done", result: "Smoke test concluido." })
});
assert(completedEngineeringTask.task?.status === "done", "engineering task should be completed");

const webProjectPlan = await request("/api/web-project-plan", {
  method: "POST",
  body: JSON.stringify({
    objective: "Criar SaaS com login, painel admin, PostgreSQL, auditoria e deploy seguro.",
    appType: "saas",
    stack: "next-prisma",
    database: "postgresql",
    auth: "email-rbac",
    deployment: "docker-vps"
  })
});
assert(webProjectPlan.plan?.includes("Fabrica de Projeto Web Robusto"), "web project plan should include factory header");
assert(webProjectPlan.kind === "web", "web project should return web kind");
assert(Array.isArray(webProjectPlan.securityChecklist), "web project should include security checklist");
assert(webProjectPlan.databasePlan?.tables?.some((table) => table.includes("users")), "web project should include user table");
assert(Array.isArray(webProjectPlan.likelyFiles), "web project should include likelyFiles");

const webScaffoldName = `smoke-web-${Date.now()}`;
const webScaffold = await request("/api/web-project-scaffold", {
  method: "POST",
  body: JSON.stringify({
    objective: "Criar SaaS com login, painel admin, PostgreSQL, auditoria e deploy seguro.",
    projectName: webScaffoldName,
    appType: "saas",
    stack: "next-prisma",
    database: "postgresql",
    auth: "email-rbac",
    deployment: "docker-vps"
  })
});
assert(webScaffold.scaffold?.path?.includes(webScaffoldName), "web scaffold should include generated path");
assert(webScaffold.scaffold?.files?.some((file) => file.endsWith("README.md")), "web scaffold should create README");
assert(existsSync(webScaffold.scaffold.fullPath), "web scaffold folder should exist on disk");
for (const file of [
  "Dockerfile",
  "docker-compose.yml",
  "scripts/doctor.mjs",
  "tests/scaffold.test.mjs",
  "app/api/auth/login/route.ts",
  "lib/db.ts",
  "prisma/seed.mjs"
]) {
  assert(existsSync(path.join(webScaffold.scaffold.fullPath, file)), `web scaffold should create ${file}`);
}
await rm(webScaffold.scaffold.fullPath, { recursive: true, force: true });

const webPreviewCheck = await request("/api/web-preview-check?url=http%3A%2F%2Flocalhost%3A3123");
assert(webPreviewCheck.ok, "web preview check should detect local Aurora server");
assert(webPreviewCheck.title === "Aurora Local", "web preview check should read local page title");

const blockedPreviewCheck = await fetch(`${baseUrl}/api/web-preview-check?url=${encodeURIComponent("https://example.com")}`);
assert(blockedPreviewCheck.status === 400, "web preview check should block non-local URLs");

const gamePlan = await request("/api/game-creator-plan", {
  method: "POST",
  body: JSON.stringify({ objective: "Criar RPG de criaturas com mapa, batalha em turno, evolucao e save." })
});
assert(gamePlan.plan?.includes("Modo Criador de Jogos"), "game creator plan should include game creator header");
assert(gamePlan.kind === "game", "game creator should return game kind");
assert(Array.isArray(gamePlan.systems), "game creator should include systems");
assert(gamePlan.systems.some((system) => system.includes("batalha")), "game creator should include battle systems");

const securityPlan = await request("/api/security-plan", {
  method: "POST",
  body: JSON.stringify({ objective: "Proteger SQL, arquivos e comandos locais." })
});
assert(securityPlan.plan?.includes("Modelo de ameacas"), "security plan should include a threat model");
assert(Array.isArray(securityPlan.likelyFiles), "security plan should include likelyFiles");

const securityAudit = await request("/api/security-audit");
assert(securityAudit.scope === "app", "security audit default scope should be app");
assert(typeof securityAudit.scannedFiles === "number", "security audit should include scannedFiles");
assert(Array.isArray(securityAudit.findings), "security audit should include findings array");
assert(securityAudit.summary && typeof securityAudit.summary === "object", "security audit should include summary");

const workspaceSecurityAudit = await request("/api/security-audit?scope=workspace");
assert(workspaceSecurityAudit.scope === "workspace", "security audit should support workspace scope");

const search = await request("/api/search?q=aurora");
assert(Array.isArray(search.results), "search should include results");

const diagnostics = await request("/api/diagnostics");
assert(diagnostics.checks?.every((check) => typeof check.ok === "boolean"), "diagnostics should include checks");

const codeMapUpdate = await request("/api/code-map", { method: "POST" });
const serverMap = codeMapUpdate.codeMap?.files?.find((file) => file.path === "ai-assistant/server.js");
assert(serverMap, "code map should include server.js");
assert(!serverMap.imports.includes("zod"), "code map should ignore imports inside scaffold templates");
assert(!serverMap.imports.includes("next/server"), "code map should ignore Next imports inside scaffold templates");

const documentResult = await request("/api/create-document", {
  method: "POST",
  body: JSON.stringify({
    type: "markdown",
    title: "Smoke Document",
    content: "Documento criado pelo smoke test da Aurora."
  })
});
assert(documentResult.path?.endsWith(".md"), "document creation should return markdown path");

const editResult = await request("/api/apply-edit", {
  method: "POST",
  body: JSON.stringify({
    path: documentResult.path,
    proposed: "# Smoke Document\n\nDocumento atualizado pelo smoke test da Aurora.\n",
    reason: "Smoke test de evidencia de diff."
  })
});
assert(editResult.backup, "apply edit should create a backup");

const diffEvidence = await request("/api/execution-evidence?limit=10");
assert(diffEvidence.evidence.some((item) => item.kind === "code-diff" && item.commandId === "apply-edit"), "execution evidence should record code diff");

console.log("Aurora smoke test passed.");
