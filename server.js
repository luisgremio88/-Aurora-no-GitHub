import http from "node:http";
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { DatabaseSync } from "node:sqlite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const dataDir = path.join(__dirname, "data");
const generatedDir = path.join(__dirname, "generated");
const memoryFile = path.join(dataDir, "memory.json");
const projectIndexFile = path.join(dataDir, "project-index.json");
const projectProfileFile = path.join(dataDir, "project-profile.json");
const attachedProjectFile = path.join(dataDir, "attached-project.json");
const attachedProjectIndexFile = path.join(dataDir, "attached-project-index.json");
const attachedProjectCodeMapFile = path.join(dataDir, "attached-project-code-map.json");
const chatHistoryFile = path.join(dataDir, "chat-history.json");
const codeMapFile = path.join(dataDir, "code-map.json");
const knowledgeFile = path.join(dataDir, "knowledge.json");
const resourceLibraryFile = path.join(dataDir, "resource-library.json");
const appDbFile = path.join(dataDir, "aurora.sqlite");
const workspaceDir = path.resolve(__dirname, "..");
const externalNodeToolsDir = process.env.AURORA_NODE_TOOLS_DIR || "C:\\AuroraTools\\aurora-node-tools";
const port = Number(process.env.PORT || 3123);
const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const defaultModel = process.env.OLLAMA_MODEL || "llama3.2:3b";
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const geminiImageModel = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const openRouterApiKey = process.env.OPENROUTER_API_KEY || "";
const openRouterModel = process.env.OPENROUTER_MODEL || "openrouter/auto";
const aiProviderMode = (process.env.AURORA_AI_PROVIDER || "auto").toLowerCase();
const comfyUiUrl = process.env.COMFYUI_URL || "http://127.0.0.1:8188";

const systemPrompt = `Voce e uma IA pessoal local chamada Aurora.
Fale em portugues do Brasil por padrao.
Seja inteligente, direta, calorosa e pratica.
Use a memoria fornecida como contexto, mas nao invente fatos.
Quando nao souber algo, diga claramente e proponha o proximo passo.
Ajude o usuario a criar projetos, estudar, programar e organizar ideias.
Se o usuario pedir uma imagem, foto, desenho, logo ou arte visual, nao finja que texto ASCII e uma imagem real.
Quando houver motor de imagem configurado, trate pedidos de imagem como uma acao que a Aurora pode executar pela rota local de imagem.
Nao diga que nao tem acesso a Gemini, OpenRouter ou ComfyUI se o contexto de capacidades disser que eles estao configurados.
Voce nunca ve nem revela chaves de API; voce apenas sabe se uma rota esta configurada e pode ser usada pelo backend.`;
const modePrompts = {
  general: `Modo geral: ajude com clareza, organize ideias e proponha proximos passos praticos.`,
  code: `Modo programacao: aja como uma engenheira senior.
Priorize entender o codigo existente, apontar riscos, explicar decisoes tecnicas e propor mudancas pequenas e testaveis.
Quando escrever codigo, preserve o estilo do projeto, evite refatoracoes desnecessarias e mencione testes importantes.
Se faltar contexto, diga exatamente qual arquivo, erro ou decisao precisa ser verificado.`,
  database: `Modo banco de dados: aja como especialista em modelagem, SQL, performance e integridade.
Priorize schema claro, chaves, indices, normalizacao quando fizer sentido, transacoes, migracoes seguras e consultas legiveis.
Quando avaliar indices, sempre considere: consultas reais, filtros WHERE, JOINs, ORDER BY, GROUP BY, cardinalidade, seletividade, indices compostos, custo de escrita, chaves estrangeiras e EXPLAIN/EXPLAIN ANALYZE.
Nao invente tabelas ou colunas se o schema nao foi fornecido; peça ou procure contexto antes.
Ao sugerir SQL destrutivo, destaque risco e prefira uma versao de verificacao antes da alteracao.
Responda com passos acionaveis e exemplos SQL pequenos quando ajudarem.`,
  architect: `Modo arquitetura: aja como arquiteta de software pragmatica.
Transforme objetivos em componentes, fluxos, contratos, dados, telas, riscos e uma ordem de implementacao.
Prefira uma primeira versao funcional, com caminho claro para evoluir sem reescrever tudo.
Explique tradeoffs de forma objetiva e recomende uma decisao quando houver informacao suficiente.`,
  security: `Modo seguranca: aja como especialista defensiva em seguranca por construcao.
Ajude a criar sistemas seguros desde o desenho: ameacas, dados sensiveis, autenticacao, autorizacao, validacao, segredos, logs, backups, privacidade, dependencias e testes.
Nao ajude com invasao, exploracao ofensiva, roubo de dados, bypass ou persistencia maliciosa.
Prefira controles praticos, verificaveis e proporcionais ao risco.`
};
const ignoredDirs = new Set([".git", "node_modules", "external-resources", "Library", "Temp", "Logs", "obj", "bin"]);
const portableIgnoredDirs = new Set([".git", "node_modules", "external-resources", "tools", ".venv", "__pycache__"]);
const textExtensions = new Set([
  ".txt",
  ".md",
  ".json",
  ".js",
  ".mjs",
  ".css",
  ".html",
  ".cs",
  ".py",
  ".xml",
  ".yml",
  ".yaml",
  ".toml",
  ".csv",
  ".ini",
  ".cfg",
  ".shader",
  ".asset",
  ".meta"
]);
const searchMaxFileSize = 160_000;
const searchMaxResults = 40;
const securityAuditMaxFiles = 500;
const securityAuditMaxFindings = 80;
const chatHistoryMaxMessages = 80;
const compactSessionKeepMessages = 24;
const knowledgeMaxItems = 80;
const indexMaxFileSize = 220_000;
const codeMapMaxFileSize = 400_000;
const codeMapExtensions = new Set([".js", ".mjs", ".cs", ".py"]);
const codeMapIgnoredDirs = new Set([...ignoredDirs, "generated"]);
const indexInterestingNames = new Set([
  "package.json",
  "readme.md",
  "agents.md",
  "server.js",
  "app.js",
  "index.html",
  "config.json",
  "manifest.json",
  "projectsettings.asset"
]);
const indexNoisyFolders = new Set(["decoded", "extracted"]);
const editInstruction = `Voce vai receber um arquivo e uma tarefa de edicao.
Responda somente com o conteudo completo do arquivo revisado.
Nao use markdown, nao coloque cercas de codigo e nao explique a alteracao.`;
const planInstruction = `Voce vai criar um plano de implementacao para uma tarefa de software.
Responda em portugues do Brasil.
Use secoes curtas:
Objetivo
Arquivos provaveis
Passos
Riscos
Testes
Nao invente fatos especificos se o contexto nao existir; indique o que precisa verificar.`;
const execFileAsync = promisify(execFile);
let db;

function getModePrompt(mode) {
  return modePrompts[mode] || modePrompts.general;
}

async function ensureMemory() {
  await mkdir(dataDir, { recursive: true });
  if (!existsSync(memoryFile)) {
    await writeFile(memoryFile, JSON.stringify({ notes: [] }, null, 2), "utf8");
  }
  ensureDatabase();
}

function ensureDatabase() {
  if (db) return db;

  db = new DatabaseSync(appDbFile);
  db.exec(`
    CREATE TABLE IF NOT EXISTS memory_notes (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS knowledge_items (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS project_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      stack TEXT NOT NULL DEFAULT '',
      database_info TEXT NOT NULL DEFAULT '',
      run_commands TEXT NOT NULL DEFAULT '',
      test_commands TEXT NOT NULL DEFAULT '',
      goals TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      read_files INTEGER NOT NULL DEFAULT 1,
      propose_edits INTEGER NOT NULL DEFAULT 1,
      apply_edits INTEGER NOT NULL DEFAULT 1,
      run_commands INTEGER NOT NULL DEFAULT 0,
      sql_write INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS model_routes (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      general_model TEXT NOT NULL DEFAULT '',
      code_model TEXT NOT NULL DEFAULT '',
      database_model TEXT NOT NULL DEFAULT '',
      architect_model TEXT NOT NULL DEFAULT '',
      fallback_model TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS behavior_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      free_builder INTEGER NOT NULL DEFAULT 1,
      advanced_executor INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS change_log (
      id TEXT PRIMARY KEY,
      file_path TEXT NOT NULL,
      backup_path TEXT NOT NULL,
      patch TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sql_query_log (
      id TEXT PRIMARY KEY,
      sql TEXT NOT NULL,
      read_only INTEGER NOT NULL,
      success INTEGER NOT NULL,
      row_count INTEGER NOT NULL DEFAULT 0,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      error TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS missions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      objective TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      priority TEXT NOT NULL DEFAULT 'medium',
      needs_json TEXT NOT NULL DEFAULT '[]',
      actions_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS execution_evidence (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      step_id TEXT NOT NULL DEFAULT '',
      command_id TEXT NOT NULL DEFAULT '',
      ok INTEGER NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      stdout TEXT NOT NULL DEFAULT '',
      stderr TEXT NOT NULL DEFAULT '',
      error TEXT NOT NULL DEFAULT '',
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS engineering_tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      objective TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      evidence_since TEXT NOT NULL,
      result TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    INSERT OR IGNORE INTO sessions (id, title, created_at, updated_at)
      VALUES ('default', 'Conversa principal', datetime('now'), datetime('now'));
    INSERT OR IGNORE INTO project_profile (id) VALUES (1);
    INSERT OR IGNORE INTO permissions (id) VALUES (1);
    INSERT OR IGNORE INTO model_routes (id) VALUES (1);
    INSERT OR IGNORE INTO behavior_settings (id, free_builder, updated_at) VALUES (1, 1, datetime('now'));
  `);
  ensureBehaviorSettingsColumns();

  migrateJsonToSqlite();
  return db;
}

function ensureBehaviorSettingsColumns() {
  const columns = db.prepare("PRAGMA table_info(behavior_settings)").all().map((column) => column.name);
  if (!columns.includes("advanced_executor")) {
    db.exec("ALTER TABLE behavior_settings ADD COLUMN advanced_executor INTEGER NOT NULL DEFAULT 1;");
  }
}

function migrateJsonToSqlite() {
  const noteCount = db.prepare("SELECT COUNT(*) AS count FROM memory_notes").get().count;
  if (noteCount === 0 && existsSync(memoryFile)) {
    try {
      const memory = JSON.parse(requireTextFile(memoryFile));
      const insert = db.prepare("INSERT OR IGNORE INTO memory_notes (id, text, created_at) VALUES (?, ?, ?)");
      for (const note of memory.notes || []) {
        insert.run(note.id || crypto.randomUUID(), String(note.text || ""), note.createdAt || new Date().toISOString());
      }
    } catch {}
  }

  const knowledgeCount = db.prepare("SELECT COUNT(*) AS count FROM knowledge_items").get().count;
  if (knowledgeCount === 0 && existsSync(knowledgeFile)) {
    try {
      const knowledge = JSON.parse(requireTextFile(knowledgeFile));
      const insert = db.prepare("INSERT OR IGNORE INTO knowledge_items (id, category, title, content, created_at) VALUES (?, ?, ?, ?, ?)");
      for (const item of knowledge.items || []) {
        insert.run(
          item.id || crypto.randomUUID(),
          item.category || "geral",
          item.title || "",
          item.content || "",
          item.createdAt || new Date().toISOString()
        );
      }
    } catch {}
  }

  const profile = db.prepare("SELECT updated_at AS updatedAt FROM project_profile WHERE id = 1").get();
  if (!profile?.updatedAt && existsSync(projectProfileFile)) {
    try {
      const savedProfile = JSON.parse(requireTextFile(projectProfileFile));
      db.prepare(`
        UPDATE project_profile
        SET stack = ?, database_info = ?, run_commands = ?, test_commands = ?, goals = ?, notes = ?, updated_at = ?
        WHERE id = 1
      `).run(
        savedProfile.stack || "",
        savedProfile.database || "",
        savedProfile.runCommands || "",
        savedProfile.testCommands || "",
        savedProfile.goals || "",
        savedProfile.notes || "",
        savedProfile.updatedAt || new Date().toISOString()
      );
    } catch {}
  }
}

function requireTextFile(filePath) {
  return readFileSync(filePath, "utf8");
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function readMemory() {
  await ensureMemory();
  const rows = ensureDatabase()
    .prepare("SELECT id, text, created_at AS createdAt FROM memory_notes ORDER BY created_at DESC LIMIT 100")
    .all();
  return { notes: rows };
}

async function saveMemory(memory) {
  await ensureMemory();
  const database = ensureDatabase();
  database.exec("DELETE FROM memory_notes");
  const insert = database.prepare("INSERT INTO memory_notes (id, text, created_at) VALUES (?, ?, ?)");
  for (const note of memory.notes || []) {
    insert.run(note.id || crypto.randomUUID(), String(note.text || ""), note.createdAt || new Date().toISOString());
  }
}

async function readProjectIndex() {
  if (!existsSync(projectIndexFile)) return null;
  return JSON.parse(await readFile(projectIndexFile, "utf8"));
}

async function readCodeMap() {
  if (!existsSync(codeMapFile)) return null;
  return JSON.parse(await readFile(codeMapFile, "utf8"));
}

async function readAttachedProject() {
  if (!existsSync(attachedProjectFile)) return null;
  return JSON.parse(await readFile(attachedProjectFile, "utf8"));
}

async function readAttachedProjectIndex() {
  if (!existsSync(attachedProjectIndexFile)) return null;
  return JSON.parse(await readFile(attachedProjectIndexFile, "utf8"));
}

async function readAttachedProjectCodeMap() {
  if (!existsSync(attachedProjectCodeMapFile)) return null;
  return JSON.parse(await readFile(attachedProjectCodeMapFile, "utf8"));
}

async function readProjectProfile() {
  await ensureMemory();
  const row = ensureDatabase()
    .prepare("SELECT stack, database_info AS database, run_commands AS runCommands, test_commands AS testCommands, goals, notes, updated_at AS updatedAt FROM project_profile WHERE id = 1")
    .get();
  return row || { stack: "", database: "", runCommands: "", testCommands: "", goals: "", notes: "" };
}

async function saveProjectProfile(profile) {
  await ensureMemory();
  ensureDatabase().prepare(`
    UPDATE project_profile
    SET stack = ?, database_info = ?, run_commands = ?, test_commands = ?, goals = ?, notes = ?, updated_at = ?
    WHERE id = 1
  `).run(
    profile.stack || "",
    profile.database || "",
    profile.runCommands || "",
    profile.testCommands || "",
    profile.goals || "",
    profile.notes || "",
    profile.updatedAt || new Date().toISOString()
  );
}

function normalizeSessionId(value) {
  return String(value || "default").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80) || "default";
}

async function readChatHistory(sessionId = "default") {
  await ensureMemory();
  const safeSessionId = normalizeSessionId(sessionId);
  const rows = ensureDatabase()
    .prepare("SELECT role, content, created_at AS savedAt FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ?")
    .all(safeSessionId, chatHistoryMaxMessages);
  return { messages: rows };
}

async function readKnowledge() {
  await ensureMemory();
  const rows = ensureDatabase()
    .prepare("SELECT id, category, title, content, created_at AS createdAt FROM knowledge_items ORDER BY created_at DESC LIMIT ?")
    .all(knowledgeMaxItems);
  return { items: rows };
}

async function readResourceLibrary() {
  await ensureMemory();
  if (!existsSync(resourceLibraryFile)) return { resources: [] };
  try {
    const data = JSON.parse(await readFile(resourceLibraryFile, "utf8"));
    return { resources: Array.isArray(data.resources) ? data.resources : [] };
  } catch {
    return { resources: [] };
  }
}

async function saveResourceLibrary(resources) {
  await ensureMemory();
  const cleanResources = resources
    .filter((resource) => resource && resource.path && resource.title)
    .slice(0, 20);
  const data = { resources: cleanResources };
  await writeFile(resourceLibraryFile, JSON.stringify(data, null, 2), "utf8");
  return data;
}

async function saveKnowledge(items) {
  await ensureMemory();
  const cleanItems = items
    .map((item) => ({
      id: item.id || crypto.randomUUID(),
      category: String(item.category || "geral").trim().slice(0, 40),
      title: String(item.title || "").trim().slice(0, 120),
      content: String(item.content || "").trim().slice(0, 4000),
      createdAt: item.createdAt || new Date().toISOString()
    }))
    .filter((item) => item.title && item.content)
    .slice(0, knowledgeMaxItems);

  const database = ensureDatabase();
  database.exec("DELETE FROM knowledge_items");
  const insert = database.prepare("INSERT INTO knowledge_items (id, category, title, content, created_at) VALUES (?, ?, ?, ?, ?)");
  for (const item of cleanItems) {
    insert.run(item.id, item.category, item.title, item.content, item.createdAt);
  }
  return { items: cleanItems };
}

function formatKnowledgeForPrompt(knowledge) {
  const items = knowledge?.items || [];
  if (!items.length) return "Nenhum conhecimento salvo.";

  return items
    .slice(0, 20)
    .map((item) => `- [${item.category}] ${item.title}: ${item.content}`)
    .join("\n");
}

function formatResourceLibraryForPrompt(library) {
  const resources = library?.resources || [];
  if (!resources.length) return "Nenhuma biblioteca externa cadastrada.";

  return resources
    .slice(0, 8)
    .map((resource) => {
      const modules = (resource.modules || []).slice(0, 8).join("; ");
      const requirements = (resource.requirements || []).slice(0, 8).join(", ");
      const site = resource.siteIntelligence || {};
      const siteLines = site.isWebsite
        ? `
  Inteligencia web:
  - Stack/frameworks: ${(site.frameworks || []).slice(0, 8).join(", ") || "nao detectado"}
  - Paginas/rotas: ${(site.routingHints || site.pages || []).slice(0, 8).map((item) => item.path || item).join("; ") || "nao mapeadas"}
  - Padroes de layout: ${(site.layoutPatterns || []).slice(0, 8).join("; ") || "nao mapeados"}
  - Componentes/pistas: ${(site.componentHints || []).slice(0, 10).join(", ") || "nao mapeados"}
  - Licoes reutilizaveis: ${(site.architectureLessons || []).slice(0, 6).join(" ")}
  - Cuidado: usar como referencia de arquitetura, nao copiar marca, textos, imagens ou codigo proprietario.`
        : "";
      return `- ${resource.title}: ${resource.summary}
  Caminho: ${resource.path}
  Modulos: ${modules || "nao mapeados"}
  Requisitos: ${requirements || "nao mapeados"}${siteLines}`;
    })
    .join("\n");
}

function formatBehaviorForPrompt(settings) {
  const executor = booleanPermission(settings?.advancedExecutor)
    ? `
Modo executor avancado: ligado.
- Quando receber um objetivo de construcao, aja proativamente: identifique requisitos, dependencias, arquivos, permissoes, validacoes e uma primeira entrega concreta.
- Se a tarefa for grande, divida em etapas pequenas e continue pela etapa mais segura e verificavel.
- Antes de pedir orientacao, tente descobrir contexto usando indice, mapa de codigo, arquivos anexados, perfil, capacidades e historico.
- Quando faltar uma ferramenta, diga o comando de instalacao e o caminho para testar depois.`
    : `
Modo executor avancado: desligado.
- Planeje antes de executar e peca mais contexto quando a tarefa estiver ambigua.`;

  if (booleanPermission(settings?.freeBuilder)) {
    return `Modo construtor livre responsavel: ligado.
- Para pedidos legitimos de criacao, programacao, sites, jogos, documentos, Excel, banco de dados, automacoes e ferramentas, nao recuse por cautela generica.
- Tente construir, adaptar, prototipar, explicar requisitos, sugerir bibliotecas e entregar passos executaveis.
- Se faltar ferramenta, diga exatamente o que instalar e por que.
- Se houver risco local, prefira backup, validacao e confirmacao antes de alterar arquivos, rodar comandos ou escrever SQL.
- Limites firmes: nao ajudar a invadir sistemas, roubar dados ou credenciais, criar malware, fraudar, burlar seguranca, causar dano fisico, perseguir pessoas, destruir dados sem recuperacao ou orientar atividade ilegal.
- Quando um pedido cruzar esses limites, explique curto e ofereca uma alternativa defensiva, educacional ou segura.${executor}`;
  }

  return `Modo construtor livre responsavel: desligado.
Atue com cautela padrao, confirme riscos antes de operacoes sensiveis e recuse pedidos perigosos ou ilegais.${executor}`;
}

async function readPermissions() {
  await ensureMemory();
  return ensureDatabase()
    .prepare("SELECT read_files AS readFiles, propose_edits AS proposeEdits, apply_edits AS applyEdits, run_commands AS runCommands, sql_write AS sqlWrite FROM permissions WHERE id = 1")
    .get();
}

async function savePermissions(body) {
  await ensureMemory();
  const permissions = {
    readFiles: body.readFiles ? 1 : 0,
    proposeEdits: body.proposeEdits ? 1 : 0,
    applyEdits: body.applyEdits ? 1 : 0,
    runCommands: body.runCommands ? 1 : 0,
    sqlWrite: body.sqlWrite ? 1 : 0
  };
  ensureDatabase()
    .prepare("UPDATE permissions SET read_files = ?, propose_edits = ?, apply_edits = ?, run_commands = ?, sql_write = ? WHERE id = 1")
    .run(permissions.readFiles, permissions.proposeEdits, permissions.applyEdits, permissions.runCommands, permissions.sqlWrite);
  return await readPermissions();
}

function booleanPermission(value) {
  return value === 1 || value === true;
}

async function readModelRoutes() {
  await ensureMemory();
  return ensureDatabase()
    .prepare("SELECT general_model AS generalModel, code_model AS codeModel, database_model AS databaseModel, architect_model AS architectModel, fallback_model AS fallbackModel FROM model_routes WHERE id = 1")
    .get();
}

async function readBehaviorSettings() {
  await ensureMemory();
  return ensureDatabase()
    .prepare("SELECT free_builder AS freeBuilder, advanced_executor AS advancedExecutor, updated_at AS updatedAt FROM behavior_settings WHERE id = 1")
    .get() || { freeBuilder: 1, advancedExecutor: 1, updatedAt: null };
}

async function saveBehaviorSettings(body) {
  await ensureMemory();
  const freeBuilder = body.freeBuilder ? 1 : 0;
  const advancedExecutor = body.advancedExecutor ? 1 : 0;
  const updatedAt = new Date().toISOString();
  ensureDatabase()
    .prepare("UPDATE behavior_settings SET free_builder = ?, advanced_executor = ?, updated_at = ? WHERE id = 1")
    .run(freeBuilder, advancedExecutor, updatedAt);
  return await readBehaviorSettings();
}

async function saveModelRoutes(body) {
  await ensureMemory();
  ensureDatabase()
    .prepare("UPDATE model_routes SET general_model = ?, code_model = ?, database_model = ?, architect_model = ?, fallback_model = ? WHERE id = 1")
    .run(body.generalModel || "", body.codeModel || "", body.databaseModel || "", body.architectModel || "", body.fallbackModel || "");
  return await readModelRoutes();
}

async function chooseModel(explicitModel, mode) {
  if (explicitModel) return explicitModel;
  const routes = await readModelRoutes();
  return {
    general: routes.generalModel,
    code: routes.codeModel,
    database: routes.databaseModel,
    architect: routes.architectModel
  }[mode] || routes.fallbackModel || defaultModel;
}

function hasExternalAiEnabled() {
  return Boolean(geminiApiKey || openRouterApiKey);
}

function normalizeProviderName(provider) {
  const value = String(provider || "").trim().toLowerCase();
  if (["ollama", "local"].includes(value)) return "ollama";
  if (["openrouter", "router", "or"].includes(value)) return "openrouter";
  if (["gemini", "google"].includes(value)) return "gemini";
  return "";
}

function splitProviderModel(model) {
  const value = String(model || "").trim();
  const match = value.match(/^(ollama|local|openrouter|router|or|gemini|google):(.+)$/i);
  if (!match) return { provider: "", model: value };
  return {
    provider: normalizeProviderName(match[1]),
    model: match[2].trim()
  };
}

function inferAiTaskKind({ mode, latestUserMessage }) {
  const text = String(latestUserMessage || "").toLowerCase();
  if (mode === "code" || /\b(codigo|código|programa|bug|erro|stack|trace|teste|npm|arquivo|refator|api|endpoint)\b/.test(text)) return "code";
  if (mode === "database" || /\b(sql|banco|query|schema|tabela|indice|índice|sqlite|postgres|mysql)\b/.test(text)) return "database";
  if (mode === "architect" || /\b(arquitetura|planej|sistema|escala|componentes|fluxo)\b/.test(text)) return "architect";
  return "general";
}

function chooseAiProvider({ requestedProvider, explicitModel, mode, latestUserMessage }) {
  const parsed = splitProviderModel(explicitModel);
  const providerFromModel = parsed.provider;
  const provider = normalizeProviderName(requestedProvider) || providerFromModel;
  const taskKind = inferAiTaskKind({ mode, latestUserMessage });

  if (provider === "openrouter") {
    return { provider: "openrouter", model: parsed.model || openRouterModel, taskKind };
  }
  if (provider === "gemini") {
    return { provider: "gemini", model: parsed.model || geminiModel, taskKind };
  }
  if (provider === "ollama") {
    return { provider: "ollama", model: parsed.model || "", taskKind };
  }

  if (aiProviderMode === "openrouter" && openRouterApiKey) return { provider: "openrouter", model: openRouterModel, taskKind };
  if (aiProviderMode === "gemini" && geminiApiKey) return { provider: "gemini", model: geminiModel, taskKind };
  if (aiProviderMode === "local" || aiProviderMode === "ollama") return { provider: "ollama", model: parsed.model || "", taskKind };

  if (["code", "database", "architect"].includes(taskKind) && openRouterApiKey) {
    return { provider: "openrouter", model: openRouterModel, taskKind };
  }
  if (geminiApiKey) {
    return { provider: "gemini", model: geminiModel, taskKind };
  }
  if (openRouterApiKey) {
    return { provider: "openrouter", model: openRouterModel, taskKind };
  }
  return { provider: "ollama", model: parsed.model || "", taskKind };
}

function buildAiProviderStatus() {
  return {
    mode: aiProviderMode,
    externalEnabled: hasExternalAiEnabled(),
    providers: [
      {
        id: "ollama",
        name: "Ollama local",
        configured: true,
        secretEnv: "",
        defaultModel,
        notes: "Sempre disponivel como rota local quando o Ollama estiver rodando."
      },
      {
        id: "openrouter",
        name: "OpenRouter",
        configured: Boolean(openRouterApiKey),
        secretEnv: "OPENROUTER_API_KEY",
        modelEnv: "OPENROUTER_MODEL",
        defaultModel: openRouterModel,
        notes: "Use como provedor forte para codigo, arquitetura e modelos variados via API compativel com chat completions."
      },
      {
        id: "gemini",
        name: "Google Gemini API",
        configured: Boolean(geminiApiKey),
        secretEnv: "GEMINI_API_KEY ou GOOGLE_API_KEY",
        modelEnv: "GEMINI_MODEL",
        defaultModel: geminiModel,
        notes: "Use para respostas gerais rapidas, resumo e raciocinio auxiliar quando houver chave de API."
      }
    ]
  };
}

async function buildRuntimeCapabilityContext() {
  const aiStatus = buildAiProviderStatus();
  let imageStatus = null;
  try {
    imageStatus = await checkComfyUiStatus({ timeoutMs: 800 });
  } catch {
    imageStatus = { online: false, checkpoints: [], error: "nao verificado" };
  }

  const aiLines = aiStatus.providers.map((provider) => {
    const state = provider.configured ? "configurado" : "nao configurado";
    const model = provider.defaultModel ? `, modelo padrao: ${provider.defaultModel}` : "";
    return `- ${provider.name}: ${state}${model}. ${provider.notes}`;
  });

  const imageLines = [
    `- ComfyUI local: ${imageStatus.online ? "online" : "offline"}${imageStatus.checkpoints?.length ? `, modelos: ${imageStatus.checkpoints.join(", ")}` : ""}.`,
    `- Gemini Image / Nano Banana: ${geminiApiKey ? "configurado" : "nao configurado"}, modelo padrao: ${geminiImageModel}.`,
    "- SVG local: disponivel apenas como fallback simples quando os motores bitmap falham."
  ];

  return `Capacidades reais desta instancia:
Rotas de IA:
${aiLines.join("\n")}

Motores de imagem:
${imageLines.join("\n")}

Regras praticas:
- Se perguntarem quais IAs voce usa, responda com base nesta lista, sem pedir arquivos.
- OpenRouter e Gemini podem estar ativos mesmo que voce nao veja as chaves; o backend cuida disso.
- Para imagem, a rota do chat tenta gerar e mostrar a imagem automaticamente: ComfyUI local primeiro, depois Gemini Image, depois SVG fallback.
- Se uma geracao falhar por cota, chave recusada ou servico offline, explique a falha compacta e sugira o proximo passo.
- A interface aceita atalhos no campo principal: /ias, /imagens, /plugins, /projeto, /engenharia, /benchmark, /web, /executor.
- Para anexar uma pasta, o usuario pode digitar @C:\\Caminho\\Do\\Projeto ou "anexar projeto C:\\Caminho\\Do\\Projeto".`;
}

function isProviderConfigured(provider) {
  if (provider === "ollama") return true;
  if (provider === "openrouter") return Boolean(openRouterApiKey);
  if (provider === "gemini") return Boolean(geminiApiKey);
  return false;
}

function providerDisplayName(provider) {
  return {
    ollama: "Ollama local",
    openrouter: "OpenRouter",
    gemini: "Gemini"
  }[provider] || provider;
}

function buildProviderFallbacks(primaryProvider, taskKind) {
  const preferred = taskKind === "general"
    ? [primaryProvider, "gemini", "openrouter", "ollama"]
    : [primaryProvider, "openrouter", "gemini", "ollama"];
  return [...new Set(preferred)].filter(isProviderConfigured);
}

function compactProviderError(error) {
  const message = String(error?.message || error || "");
  if (message.includes("insufficient_quota")) return "cota insuficiente no provedor";
  if (message.includes("invalid_api_key") || message.includes("API key not valid")) return "chave de API recusada";
  if (message.includes("429")) return "limite de uso atingido";
  if (message.includes("401") || message.includes("403")) return "autenticacao recusada";
  return message.slice(0, 220) || "falha desconhecida";
}

function compactImageError(error) {
  const message = String(error?.message || error || "");
  if (message.includes("RESOURCE_EXHAUSTED") || message.includes("Quota exceeded") || message.includes("429")) {
    return "cota/limite do provedor de imagem atingido";
  }
  if (message.includes("API key not valid") || message.includes("invalid_api_key")) return "chave de imagem recusada";
  if (message.includes("401") || message.includes("403")) return "autenticacao recusada pelo provedor de imagem";
  return message.slice(0, 240) || "falha desconhecida";
}

async function saveChatHistory(messages, sessionId = "default", title = "Conversa") {
  await ensureMemory();
  const safeSessionId = normalizeSessionId(sessionId);
  const now = new Date().toISOString();
  const cleanMessages = messages
    .filter((message) => ["user", "assistant"].includes(message.role))
    .map((message) => ({
      role: message.role,
      content: String(message.content || "").slice(0, 20_000),
      savedAt: message.savedAt || new Date().toISOString()
    }))
    .slice(-chatHistoryMaxMessages);

  const database = ensureDatabase();
  database.prepare("INSERT OR IGNORE INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)").run(safeSessionId, title || "Conversa", now, now);
  database.prepare("UPDATE sessions SET title = COALESCE(NULLIF(?, ''), title), updated_at = ? WHERE id = ?").run(title || "", now, safeSessionId);
  database.prepare("DELETE FROM chat_messages WHERE session_id = ?").run(safeSessionId);
  const insert = database.prepare("INSERT INTO chat_messages (id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)");
  for (const message of cleanMessages) {
    insert.run(crypto.randomUUID(), safeSessionId, message.role, message.content, message.savedAt);
  }
  return { messages: cleanMessages };
}

function estimateTextTokens(text) {
  return Math.ceil(String(text || "").length / 4);
}

async function getMaintenanceStatus(sessionId = "default") {
  await ensureMemory();
  const database = ensureDatabase();
  const safeSessionId = normalizeSessionId(sessionId);
  const permissions = await readPermissions();
  const messages = database
    .prepare("SELECT role, content, created_at AS savedAt FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC")
    .all(safeSessionId);
  const memoryCount = database.prepare("SELECT COUNT(*) AS count FROM memory_notes").get().count;
  const knowledgeCount = database.prepare("SELECT COUNT(*) AS count FROM knowledge_items").get().count;
  const sessionCount = database.prepare("SELECT COUNT(*) AS count FROM sessions").get().count;
  const sqlHistoryCount = database.prepare("SELECT COUNT(*) AS count FROM sql_query_log").get().count;
  const changeLogCount = database.prepare("SELECT COUNT(*) AS count FROM change_log").get().count;
  const dbSize = existsSync(appDbFile) ? (await stat(appDbFile)).size : 0;
  const messageCount = messages.length;
  const estimatedTokens = messages.reduce((total, message) => total + estimateTextTokens(message.content), 0);
  const disabledPermissions = Object.entries(permissions)
    .filter(([, value]) => !booleanPermission(value))
    .map(([name]) => name);
  const warnings = [];

  if (messageCount > 60) warnings.push("Conversa longa: considere compactar para reduzir contexto.");
  if (estimatedTokens > 12000) warnings.push("Contexto estimado alto: respostas podem ficar lentas ou menos focadas.");
  if (memoryCount > 80) warnings.push("Memoria com muitas notas: revise e remova informacoes antigas.");
  if (knowledgeCount > 70) warnings.push("Conhecimentos perto do limite: consolide regras repetidas.");
  if (sqlHistoryCount > 100) warnings.push("Historico SQL grande: use Otimizar banco para manter os registros recentes.");
  if (dbSize > 20 * 1024 * 1024) warnings.push("Banco SQLite grande: considere otimizar e revisar historicos.");
  if (disabledPermissions.length) warnings.push(`Permissoes desligadas: ${disabledPermissions.join(", ")}.`);

  return {
    sessionId: safeSessionId,
    messageCount,
    estimatedTokens,
    memoryCount,
    knowledgeCount,
    sessionCount,
    sqlHistoryCount,
    changeLogCount,
    dbSize,
    permissions,
    disabledPermissions,
    limits: {
      chatHistoryMaxMessages,
      compactSessionKeepMessages,
      knowledgeMaxItems
    },
    warnings
  };
}

async function optimizeLocalDatabase() {
  await ensureMemory();
  const database = ensureDatabase();
  const beforeSize = existsSync(appDbFile) ? (await stat(appDbFile)).size : 0;
  const beforeSqlHistory = database.prepare("SELECT COUNT(*) AS count FROM sql_query_log").get().count;

  database.exec(`
    DELETE FROM sql_query_log
    WHERE id NOT IN (
      SELECT id FROM sql_query_log
      ORDER BY created_at DESC
      LIMIT 100
    );
  `);
  database.exec("PRAGMA optimize;");
  database.exec("VACUUM;");

  const afterSize = existsSync(appDbFile) ? (await stat(appDbFile)).size : 0;
  const afterSqlHistory = database.prepare("SELECT COUNT(*) AS count FROM sql_query_log").get().count;
  return {
    beforeSize,
    afterSize,
    reclaimedBytes: Math.max(0, beforeSize - afterSize),
    beforeSqlHistory,
    afterSqlHistory,
    removedSqlHistory: Math.max(0, beforeSqlHistory - afterSqlHistory)
  };
}

async function compactChatSession(sessionId = "default") {
  await ensureMemory();
  const safeSessionId = normalizeSessionId(sessionId);
  const history = await readChatHistory(safeSessionId);
  const messages = history.messages || [];
  if (messages.length <= compactSessionKeepMessages) {
    return { compacted: false, messages, removed: 0 };
  }

  const older = messages.slice(0, -compactSessionKeepMessages);
  const recent = messages.slice(-compactSessionKeepMessages);
  const summaryLines = older.slice(-18).map((message) => {
    const text = String(message.content || "").replace(/\s+/g, " ").trim().slice(0, 220);
    return `- ${message.role}: ${text}`;
  });
  const summary = {
    role: "assistant",
    content: `Resumo compacto da conversa anterior para manter a Aurora focada.
Mensagens compactadas: ${older.length}.
Pontos recentes antes da compactacao:
${summaryLines.join("\n")}`,
    savedAt: new Date().toISOString()
  };
  const nextMessages = [summary, ...recent];
  await saveChatHistory(nextMessages, safeSessionId, "Conversa compactada");
  return { compacted: true, messages: nextMessages, removed: older.length };
}

function formatProfileForPrompt(profile) {
  if (!profile) return "Perfil do projeto nao definido.";

  const sections = [
    ["Stack", profile.stack],
    ["Banco de dados", profile.database],
    ["Comandos para rodar", profile.runCommands],
    ["Comandos de teste", profile.testCommands],
    ["Objetivos", profile.goals],
    ["Notas", profile.notes]
  ].filter(([, value]) => String(value || "").trim());

  if (!sections.length) return "Perfil do projeto ainda nao definido.";
  return sections.map(([label, value]) => `${label}: ${value}`).join("\n");
}

async function buildAssistantContext({ mode = "code", fileContext = [], compact = false } = {}) {
  const memory = await readMemory();
  const projectIndex = await readProjectIndex();
  const projectProfile = await readProjectProfile();
  const codeMap = await readCodeMap();
  const attachedProject = await readAttachedProject();
  const attachedProjectIndex = await readAttachedProjectIndex();
  const attachedProjectCodeMap = await readAttachedProjectCodeMap();
  const knowledge = await readKnowledge();
  const resourceLibrary = await readResourceLibrary();
  const behaviorSettings = await readBehaviorSettings();
  const runtimeCapabilities = await buildRuntimeCapabilityContext();
  const notes = memory.notes.map((note) => `- ${note.text}`).join("\n") || "- Sem memorias salvas ainda.";
  const files = Array.isArray(fileContext) && fileContext.length
    ? fileContext.map((file) => `Arquivo: ${file.path}\n${compact ? String(file.content).slice(0, 6000) : file.content}`).join("\n\n---\n\n")
    : "Nenhum arquivo selecionado.";
  const indexText = formatIndexForPrompt(projectIndex);
  const codeMapText = formatCodeMapForPrompt(codeMap);
  const attachedProjectText = attachedProject
    ? `Nome: ${attachedProject.name}
Pasta: ${attachedProject.path}

Indice:
${formatIndexForPrompt(attachedProjectIndex)}

Mapa de codigo:
${formatCodeMapForPrompt(attachedProjectCodeMap)}`
    : "Nenhum projeto externo anexado.";

  return `${systemPrompt}

${getModePrompt(mode)}

${runtimeCapabilities}

Perfil do projeto:
${formatProfileForPrompt(projectProfile)}

Memoria atual:
${notes}

Conhecimentos salvos:
${formatKnowledgeForPrompt(knowledge)}

Bibliotecas externas:
${formatResourceLibraryForPrompt(resourceLibrary)}

Comportamento configurado:
${formatBehaviorForPrompt(behaviorSettings)}

Indice do projeto:
${compact ? indexText.slice(0, 2500) : indexText}

Mapa de codigo:
${compact ? codeMapText.slice(0, 3500) : codeMapText}

Projeto externo anexado:
${compact ? attachedProjectText.slice(0, 5000) : attachedProjectText}

Contexto de arquivos escolhido pelo usuario:
${files}`;
}

function sendJson(res, status, data) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function resolveWorkspacePath(relativePath = "") {
  const normalized = path.normalize(String(relativePath).replace(/^[/\\]+/, ""));
  const fullPath = path.resolve(workspaceDir, normalized);

  if (fullPath !== workspaceDir && !fullPath.startsWith(`${workspaceDir}${path.sep}`)) {
    throw new Error("Caminho fora do workspace bloqueado.");
  }

  return fullPath;
}

async function resolveAttachedProjectPath(relativePath = "") {
  const project = await readAttachedProject();
  if (!project?.path) throw new Error("Nenhum projeto anexado.");

  const rootDir = path.resolve(project.path);
  const cleanPath = String(relativePath || "")
    .replace(/^attached-project[/\\]/, "")
    .replace(/^[/\\]+/, "");
  const normalized = path.normalize(cleanPath);
  const fullPath = path.resolve(rootDir, normalized);

  if (fullPath !== rootDir && !fullPath.startsWith(`${rootDir}${path.sep}`)) {
    throw new Error("Caminho fora do projeto anexado bloqueado.");
  }

  return { fullPath, rootDir };
}

async function resolveEditableTarget(filePath = "", scope = "") {
  const rawPath = String(filePath || "").trim();
  const useAttached = scope === "attached" || rawPath.startsWith("attached-project/");

  if (useAttached) {
    const { fullPath, rootDir } = await resolveAttachedProjectPath(rawPath);
    return {
      fullPath,
      rootDir,
      scope: "attached",
      relativePath: `attached-project/${toRootRelative(fullPath, rootDir)}`
    };
  }

  const fullPath = resolveWorkspacePath(rawPath);
  return {
    fullPath,
    rootDir: workspaceDir,
    scope: "workspace",
    relativePath: toRelative(fullPath)
  };
}

async function resolveLoggedPath(loggedPath = "") {
  const value = String(loggedPath || "");
  if (value.startsWith("attached-project/")) {
    const { fullPath } = await resolveAttachedProjectPath(value);
    return fullPath;
  }
  return resolveWorkspacePath(value);
}

function toRelative(fullPath) {
  return path.relative(workspaceDir, fullPath).replaceAll(path.sep, "/");
}

function toRootRelative(fullPath, rootDir) {
  return path.relative(rootDir, fullPath).replaceAll(path.sep, "/");
}

async function normalizeProjectFolder(folderPath) {
  const raw = String(folderPath || "").trim();
  if (!raw) throw new Error("Informe a pasta do projeto.");
  const fullPath = path.resolve(raw);
  const info = await stat(fullPath);
  if (!info.isDirectory()) throw new Error("O caminho informado nao e uma pasta.");
  const blockedRoots = [path.parse(fullPath).root, "C:\\Windows", "C:\\Program Files", "C:\\Program Files (x86)"]
    .map((item) => path.resolve(item).toLowerCase());
  if (blockedRoots.includes(fullPath.toLowerCase())) {
    throw new Error("Essa pasta e ampla demais para anexar com seguranca.");
  }
  return fullPath;
}

function slugifyFileName(value, fallback = "documento") {
  const slug = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || fallback;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseJsonSafe(text, fallback) {
  try {
    return JSON.parse(String(text || ""));
  } catch {
    return fallback;
  }
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function readPackageManifest(packagePath = path.join(__dirname, "package.json")) {
  if (!existsSync(packagePath)) return {};
  try {
    return JSON.parse(readFileSync(packagePath, "utf8"));
  } catch {
    return {};
  }
}

function readExternalToolsManifest() {
  return readPackageManifest(path.join(externalNodeToolsDir, "package.json"));
}

function packageVersion(packageName, manifest = readPackageManifest()) {
  return manifest.dependencies?.[packageName] || manifest.devDependencies?.[packageName] || "";
}

function hasPackage(packageName, manifest = readPackageManifest(), externalManifest = readExternalToolsManifest()) {
  return Boolean(packageVersion(packageName, manifest) || packageVersion(packageName, externalManifest));
}

function packageSource(packageName, manifest = readPackageManifest(), externalManifest = readExternalToolsManifest()) {
  if (packageVersion(packageName, manifest)) return "Projeto";
  if (packageVersion(packageName, externalManifest)) return "C:\\AuroraTools";
  return "";
}

function resolveSystemCommand(command) {
  if (process.platform !== "win32") return { command, argsPrefix: [] };
  if (command === "npm") return { command: "cmd.exe", argsPrefix: ["/c", "npm"] };
  if (command === "git") {
    const candidates = [
      "C:\\Program Files\\Git\\cmd\\git.exe",
      "C:\\Program Files\\Git\\bin\\git.exe",
      "C:\\Program Files (x86)\\Git\\cmd\\git.exe"
    ];
    const installed = candidates.find((candidate) => existsSync(candidate));
    if (installed) return { command: installed, argsPrefix: [] };
  }
  return { command, argsPrefix: [] };
}

function systemCommandSpec(command, args = [], cwd = __dirname, timeout = 10_000) {
  const resolved = resolveSystemCommand(command);
  return {
    command: resolved.command,
    args: [...resolved.argsPrefix, ...args],
    cwd,
    timeout
  };
}

async function checkSystemTool(command, args = ["--version"], install = "") {
  const spec = systemCommandSpec(command, args);
  try {
    const result = await execFileAsync(spec.command, spec.args, { cwd: spec.cwd, timeout: spec.timeout, windowsHide: true });
    return {
      command,
      available: true,
      version: String(result.stdout || result.stderr || "").trim().split(/\r?\n/)[0] || "detectado",
      install
    };
  } catch (error) {
    return {
      command,
      available: false,
      version: "",
      install,
      error: String(error.message || error).slice(0, 300)
    };
  }
}

async function buildCapabilityStatus() {
  const manifest = readPackageManifest();
  const externalManifest = readExternalToolsManifest();
  const pkg = (name) => ({
    available: hasPackage(name, manifest, externalManifest),
    source: packageSource(name, manifest, externalManifest),
    version: packageVersion(name, manifest) || packageVersion(name, externalManifest)
  });
  const tools = await Promise.all([
    checkSystemTool("node", ["--version"], "https://nodejs.org/"),
    checkSystemTool("npm", ["--version"], "Instalado junto com Node.js"),
    checkSystemTool("ollama", ["--version"], "https://ollama.com/download"),
    checkSystemTool("git", ["--version"], "https://git-scm.com/downloads"),
    checkSystemTool("docker", ["--version"], "https://www.docker.com/products/docker-desktop/")
  ]);
  const capabilities = [
    {
      id: "xlsx",
      name: "Excel formatado",
      ...pkg("exceljs"),
      packages: ["exceljs"],
      install: "npm install --prefix C:\\AuroraTools\\aurora-node-tools exceljs",
      use: "Gerar .xlsx com abas, estilos, formulas e largura de colunas."
    },
    {
      id: "docx",
      name: "Word formatado",
      ...pkg("docx"),
      packages: ["docx"],
      install: "npm install --prefix C:\\AuroraTools\\aurora-node-tools docx",
      use: "Gerar .docx com titulos, paragrafos, tabelas e estilos."
    },
    {
      id: "web-app",
      name: "Sites/apps modernos",
      ...pkg("vite"),
      packages: ["vite"],
      install: "npm install --prefix C:\\AuroraTools\\aurora-node-tools vite",
      use: "Criar e rodar projetos web modernos com servidor de desenvolvimento."
    },
    {
      id: "web-test",
      name: "Teste visual de sites",
      ...pkg("@playwright/test"),
      packages: ["@playwright/test"],
      install: "npm install --prefix C:\\AuroraTools\\aurora-node-tools @playwright/test",
      use: "Automatizar testes de navegador, screenshots e fluxos de UI."
    },
    {
      id: "game-2d",
      name: "Jogos 2D",
      ...pkg("phaser"),
      packages: ["phaser"],
      install: "npm install --prefix C:\\AuroraTools\\aurora-node-tools phaser",
      use: "Criar jogos 2D com cenas, sprites, fisica e controles."
    },
    {
      id: "game-3d",
      name: "Jogos/3D web",
      ...pkg("three"),
      packages: ["three"],
      install: "npm install --prefix C:\\AuroraTools\\aurora-node-tools three",
      use: "Criar experiencias 3D, visualizadores e prototipos web."
    },
    {
      id: "repo-agent",
      name: "Agente de repositorio",
      available: ["simple-git", "fast-glob", "ignore"].every((name) => hasPackage(name, manifest, externalManifest)),
      source: ["simple-git", "fast-glob", "ignore"].map((name) => packageSource(name, manifest, externalManifest)).find(Boolean),
      packages: ["simple-git", "fast-glob", "ignore"],
      install: "npm install --prefix C:\\AuroraTools\\aurora-node-tools simple-git fast-glob ignore",
      use: "Mapear repositorios, respeitar ignores, preparar diffs e evoluir para PRs."
    },
    {
      id: "agent-runtime",
      name: "Runtime de agente",
      available: ["execa", "zod", "chokidar"].every((name) => hasPackage(name, manifest, externalManifest)),
      source: ["execa", "zod", "chokidar"].map((name) => packageSource(name, manifest, externalManifest)).find(Boolean),
      packages: ["execa", "zod", "chokidar"],
      install: "npm install --prefix C:\\AuroraTools\\aurora-node-tools execa zod chokidar",
      use: "Executar comandos com evidencias, validar contratos e observar arquivos durante construcoes."
    },
    {
      id: "database-orm",
      name: "Banco com Prisma",
      ...pkg("prisma"),
      packages: ["prisma"],
      install: "npm install --prefix C:\\AuroraTools\\aurora-node-tools prisma",
      use: "Gerar schemas, migracoes e base de banco para projetos web."
    }
  ];

  return {
    packageName: manifest.name || "",
    externalToolsDir: externalNodeToolsDir,
    externalToolsInstalled: existsSync(path.join(externalNodeToolsDir, "node_modules")),
    tools,
    capabilities,
    missing: capabilities.filter((capability) => !capability.available),
    note: "Ferramentas grandes podem ficar em C:\\AuroraTools para nao travar o Google Drive. A Aurora detecta essa pasta automaticamente."
  };
}

async function buildAuroraPlugins() {
  const status = await buildCapabilityStatus();
  const imageStatus = await checkComfyUiStatus({ timeoutMs: 1_500 });
  const comfyReady = imageStatus.online && imageStatus.checkpoints.length > 0;
  const toolAvailable = (command) => status.tools.some((tool) => tool.command === command && tool.available);
  const capabilityAvailable = (id) => status.capabilities.some((capability) => capability.id === id && capability.available);

  const plugins = [
    {
      id: "image-svg",
      name: "Criador de Imagens SVG",
      status: "active",
      priority: "high",
      category: "creative",
      tools: ["SVG local", "ilustracoes simples", "arquivo visual"],
      install: "Ja incluido na Aurora.",
      nextAction: "Conectar um gerador bitmap como ComfyUI, Stable Diffusion ou API externa opcional.",
      description: "Cria imagens SVG simples em generated/images quando nao ha modelo bitmap instalado."
    },
    {
      id: "image-bitmap",
      name: "ComfyUI Imagem Real",
      status: comfyReady ? "active" : imageStatus.online ? "partial" : "ready",
      priority: "high",
      category: "creative",
      tools: ["PNG", "Stable Diffusion", "ComfyUI", "localhost:8188"],
      install: "powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\Instalar-ComfyUI-Aurora.ps1",
      nextAction: comfyReady
        ? `Pronto com ${imageStatus.checkpoints[0]}. Peca uma imagem no chat.`
        : imageStatus.online
          ? "ComfyUI online, mas falta checkpoint em C:\\AuroraTools\\ComfyUI\\models\\checkpoints."
          : "Iniciar ComfyUI ou abrir a Aurora pelo Abrir-Aurora.bat.",
      description: "Gera imagens bitmap reais via ComfyUI local quando o backend esta online."
    },
    {
      id: "preview-browser",
      name: "Preview Browser",
      status: "active",
      priority: "high",
      category: "web",
      tools: ["Preview local", "Checagem localhost", "Auto-refresh"],
      install: "Ja incluido na Aurora.",
      nextAction: "Adicionar screenshot, erros de console e testes de clique no preview.",
      description: "Mostra e verifica apps em localhost durante a construcao."
    },
    {
      id: "safe-executor",
      name: "Executor Seguro",
      status: "active",
      priority: "high",
      category: "agent",
      tools: ["Fila de etapas", "npm run check", "npm test"],
      install: "Ja incluido na Aurora.",
      nextAction: "Adicionar etapa de proposta de edicao com diff antes de aplicar.",
      description: "Roda comandos permitidos da fila do agente e captura saida."
    },
    {
      id: "repo-engineering",
      name: "Engenharia de Repositorios",
      status: "active",
      priority: "high",
      category: "engineering",
      tools: ["Arquitetura do projeto", "scripts", "evidencias", "matriz de autonomia"],
      install: "Ja incluido na Aurora.",
      nextAction: "Conectar Git local e depois GitHub para PRs.",
      description: "Resume o repositorio inteiro e compara capacidades locais com fluxo Codex/Claude."
    },
    {
      id: "external-ai-router",
      name: "Roteador Gemini/OpenRouter",
      status: hasExternalAiEnabled() ? "ready" : "partial",
      priority: "high",
      category: "models",
      tools: ["GEMINI_API_KEY", "OPENROUTER_API_KEY", "AURORA_AI_PROVIDER"],
      install: "setx GEMINI_API_KEY \"sua-chave\" ou setx OPENROUTER_API_KEY \"sua-chave\"",
      nextAction: hasExternalAiEnabled()
        ? "Chaves externas detectadas no ambiente; a Aurora pode rotear tarefas para provedores externos."
        : "Configurar GEMINI_API_KEY ou OPENROUTER_API_KEY no ambiente do servidor para ativar IA externa.",
      description: "Escolhe entre Ollama local, Gemini API e OpenRouter conforme tarefa e configuracao."
    },
    {
      id: "git-local",
      name: "Git Local",
      status: toolAvailable("git") ? "ready" : "missing",
      priority: "high",
      category: "versioning",
      tools: ["git status", "git diff", "commits", "branches"],
      install: "Instale Git e reabra o terminal: https://git-scm.com/downloads",
      nextAction: toolAvailable("git") ? "Adicionar botoes git status e git diff na Aurora." : "Instalar Git ou corrigir PATH.",
      description: "Mostra mudancas, diffs e historico de trabalho por tarefa."
    },
    {
      id: "github",
      name: "GitHub",
      status: toolAvailable("git") ? "planned" : "missing",
      priority: "high",
      category: "versioning",
      tools: ["repos remotos", "issues", "pull requests", "reviews"],
      install: "Requer Git no PATH e depois token/conector GitHub.",
      nextAction: "Adicionar leitura de remote origin e preparar fluxo de PR.",
      description: "Permitira abrir PRs e trabalhar com repositorios remotos com revisao humana."
    },
    {
      id: "documents",
      name: "Documentos",
      status: capabilityAvailable("docx") ? "ready" : "missing",
      priority: "medium",
      category: "office",
      tools: ["Word .docx", "relatorios", "manuais"],
      install: "npm install docx",
      nextAction: capabilityAvailable("docx") ? "Criar gerador .docx formatado." : "Instalar docx quando quiser Word real.",
      description: "Gera documentos formatados para entrega, auditoria e documentacao."
    },
    {
      id: "spreadsheets",
      name: "Planilhas",
      status: capabilityAvailable("xlsx") ? "ready" : "missing",
      priority: "medium",
      category: "office",
      tools: ["Excel .xlsx", "abas", "formulas", "checklists"],
      install: "npm install exceljs",
      nextAction: capabilityAvailable("xlsx") ? "Criar gerador .xlsx formatado." : "Instalar exceljs quando precisar Excel real.",
      description: "Cria planilhas para planejamento, dados e relatorios."
    },
    {
      id: "playwright",
      name: "Teste Visual",
      status: capabilityAvailable("web-test") ? "ready" : "missing",
      priority: "high",
      category: "web",
      tools: ["screenshots", "testes de UI", "fluxos de navegador"],
      install: "npm install -D @playwright/test",
      nextAction: capabilityAvailable("web-test") ? "Adicionar screenshots do preview local." : "Instalar Playwright para testes visuais reais.",
      description: "Automatiza validacoes visuais e fluxos web."
    },
    {
      id: "game-tools",
      name: "Jogos Web",
      status: capabilityAvailable("game-2d") || capabilityAvailable("game-3d") ? "ready" : "missing",
      priority: "low",
      category: "games",
      tools: ["Phaser", "Three.js", "prototipos jogaveis"],
      install: "npm install phaser three",
      nextAction: "Ligar o Criador de jogos a templates jogaveis.",
      description: "Cria prototipos 2D/3D e valida cenas no preview."
    }
  ];

  return {
    generatedAt: new Date().toISOString(),
    plugins,
    summary: {
      active: plugins.filter((plugin) => plugin.status === "active").length,
      ready: plugins.filter((plugin) => plugin.status === "ready").length,
      planned: plugins.filter((plugin) => plugin.status === "planned").length,
      missing: plugins.filter((plugin) => plugin.status === "missing").length
    },
    note: "Plugins da Aurora sao capacidades locais. Alguns ja estao embutidos; outros dependem de ferramentas ou pacotes instalados."
  };
}

async function runOptionalCommand(command, args = [], cwd = __dirname, timeout = 10_000) {
  const spec = systemCommandSpec(command, args, cwd, timeout);
  try {
    const result = await execFileAsync(spec.command, spec.args, { cwd: spec.cwd, timeout: spec.timeout, windowsHide: true });
    return {
      ok: true,
      stdout: String(result.stdout || "").trim(),
      stderr: String(result.stderr || "").trim()
    };
  } catch (error) {
    return {
      ok: false,
      stdout: String(error.stdout || "").trim(),
      stderr: String(error.stderr || "").trim(),
      error: String(error.message || error).slice(0, 500)
    };
  }
}

async function buildRepositoryEngineeringStatus() {
  const [projectIndex, codeMap, profile, capabilities, plugins] = await Promise.all([
    readProjectIndex(),
    readCodeMap(),
    readProjectProfile(),
    buildCapabilityStatus(),
    buildAuroraPlugins()
  ]);
  const manifest = readPackageManifest();
  const codeFiles = codeMap?.files || [];
  const endpoints = codeFiles.flatMap((file) => (file.endpoints || []).map((endpoint) => ({ file: file.path, endpoint }))).slice(0, 40);
  const importantFiles = (projectIndex?.importantFiles || []).slice(0, 14).map((file) => file.path);
  const scripts = Object.entries(manifest.scripts || {}).map(([name, command]) => ({ name, command }));
  const gitVersion = capabilities.tools.find((tool) => tool.command === "git");
  const gitRoot = gitVersion?.available ? await runOptionalCommand("git", ["rev-parse", "--show-toplevel"], __dirname) : { ok: false, error: gitVersion?.error || "Git nao detectado." };
  const gitCwd = gitRoot.ok && gitRoot.stdout ? gitRoot.stdout : __dirname;
  const gitStatus = gitVersion?.available ? await runOptionalCommand("git", ["status", "--short"], gitCwd) : { ok: false, error: gitVersion?.error || "Git nao detectado." };
  const gitBranch = gitVersion?.available ? await runOptionalCommand("git", ["branch", "--show-current"], gitCwd) : { ok: false, error: gitVersion?.error || "Git nao detectado." };
  const gitRemote = gitVersion?.available ? await runOptionalCommand("git", ["remote", "get-url", "origin"], gitCwd) : { ok: false, error: gitVersion?.error || "Git nao detectado." };
  const changedFiles = gitStatus.ok
    ? gitStatus.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 60)
    : [];

  const autonomyMatrix = [
    {
      capability: "Entender arquitetura do repositorio",
      status: projectIndex?.totalFiles && codeFiles.length ? "active" : "partial",
      evidence: `${projectIndex?.totalFiles || 0} arquivos no indice; ${codeFiles.length} arquivos no mapa de codigo.`
    },
    {
      capability: "Executar checks com evidencias",
      status: "active",
      evidence: "Executor seguro roda npm run check/npm test e devolve stdout/stderr."
    },
    {
      capability: "Git local e diffs",
      status: gitVersion?.available && gitStatus.ok ? "ready" : "missing",
      evidence: gitVersion?.available ? (gitStatus.ok ? `${changedFiles.length} mudancas detectadas.` : gitStatus.error) : "Git nao esta disponivel no PATH deste processo."
    },
    {
      capability: "GitHub e Pull Requests",
      status: gitRemote.ok && gitRemote.stdout.includes("github.com") ? "planned" : "missing",
      evidence: gitRemote.ok ? `Remote: ${gitRemote.stdout}` : "Falta conector/token GitHub e remote detectavel."
    },
    {
      capability: "Sandbox isolado",
      status: "partial",
      evidence: "Aurora executa checks locais com allowlist; cloud sandbox/worktrees ainda serao implementados."
    },
    {
      capability: "Agentes em paralelo",
      status: "planned",
      evidence: "Base de missoes/fila existe; falta dividir tarefas em worktrees paralelos."
    },
    {
      capability: "Evidencias verificaveis",
      status: "active",
      evidence: "Comandos seguros, smoke test, preview local e diffs de edicao ja existem."
    }
  ];

  return {
    generatedAt: new Date().toISOString(),
    workspace: workspaceDir,
    appPath: __dirname,
    architecture: {
      packageName: manifest.name || "",
      stack: profile.stack || "Nao informado",
      database: profile.database || "Nao informado",
      goals: profile.goals || "Nao informado",
      scripts,
      indexedFiles: projectIndex?.totalFiles || 0,
      codeFiles: codeFiles.length,
      endpoints,
      importantFiles
    },
    git: {
      available: Boolean(gitVersion?.available),
      version: gitVersion?.version || "",
      root: gitRoot.ok ? gitRoot.stdout : "",
      branch: gitBranch.ok ? gitBranch.stdout : "",
      remote: gitRemote.ok ? gitRemote.stdout : "",
      changedFiles,
      error: gitVersion?.available ? (gitStatus.ok ? "" : gitStatus.error) : gitVersion?.error || "Git nao detectado."
    },
    github: {
      connected: Boolean(gitRemote.ok && gitRemote.stdout.includes("github.com")),
      remote: gitRemote.ok ? gitRemote.stdout : "",
      prCreation: "planned",
      requirements: ["Git disponivel", "remote GitHub", "token/conector GitHub", "branch segura", "diff revisavel"]
    },
    automation: {
      safeCommands: [...allowedCommands.keys()],
      sandbox: "local-allowlist",
      parallelAgents: "planned-worktrees",
      evidence: ["stdout/stderr de comandos", "diff antes de aplicar", "smoke test", "preview localhost"]
    },
    plugins: plugins.plugins,
    evidenceLog: readExecutionEvidence(12),
    autonomyMatrix,
    nextSteps: [
      "Ativar Git local: detectar status, diff e branch pela interface.",
      "Adicionar registro persistente de evidencias por execucao.",
      "Criar fluxo de tarefa: plano -> branch/worktree -> edicao -> teste -> diff -> revisao.",
      "Depois conectar GitHub para abrir Pull Requests com aprovacao humana."
    ]
  };
}

function buildDeveloperToolRadar() {
  const tools = [
    {
      category: "Agentes no editor",
      priority: "alta",
      name: "Continue",
      use: "Usar modelos locais/Ollama dentro do VS Code para chat, refatoracao e edicao com contexto.",
      fit: "Bom parceiro para a Aurora quando voce quiser editar codigo direto no editor.",
      install: "Instalar extensao Continue no VS Code e apontar para Ollama."
    },
    {
      category: "Agentes no editor",
      priority: "media",
      name: "Cline/Kilo Code",
      use: "Agente autonomo no VS Code que edita arquivos, roda comandos e usa navegador com permissao.",
      fit: "Referencia para melhorar o fluxo de permissao, execucao e validacao da Aurora.",
      install: "Instalar extensao no VS Code quando quiser comparar fluxo."
    },
    {
      category: "Agentes no terminal",
      priority: "alta",
      name: "Aider",
      use: "Agente CLI focado em alteracoes multi-arquivo e commits.",
      fit: "Inspira uma futura funcao da Aurora para gerar patch, revisar diff e preparar commit.",
      install: "pipx install aider-chat"
    },
    {
      category: "Contexto de codigo",
      priority: "alta",
      name: "sourcebook / codesight",
      use: "Gerar contexto, mapa de arquitetura, arquivos centrais e regras para agentes.",
      fit: "Base para melhorar o indice/mapa da Aurora e reduzir contexto desperdicado.",
      install: "Avaliar depois via npx/pacote do projeto escolhido."
    },
    {
      category: "Busca semantica local",
      priority: "media",
      name: "SeaGOAT",
      use: "Busca semantica local no codebase.",
      fit: "Pode inspirar uma busca melhor que a busca leve atual da Aurora.",
      install: "Avaliar instalacao quando o projeto crescer muito."
    },
    {
      category: "Banco e SQL",
      priority: "media",
      name: "Wren AI / TEXT2SQL",
      use: "Gerar, explicar e otimizar SQL a partir de linguagem natural.",
      fit: "Inspira melhorias no painel SQL: explicar schema, sugerir indices e validar consultas.",
      install: "Usar como referencia; manter SQLite local da Aurora por enquanto."
    },
    {
      category: "UI e sites",
      priority: "media",
      name: "v0 / shadcn MCP / Bolt.diy",
      use: "Gerar interfaces, componentes e apps web por prompt.",
      fit: "Inspira o Criador de Sites futuro da Aurora com componentes, estados e testes visuais.",
      install: "Opcional; primeiro melhorar gerador local com Vite/Playwright."
    },
    {
      category: "Testes",
      priority: "alta",
      name: "Playwright / Checksum AI",
      use: "Testes de navegador, screenshots e fluxos de UI.",
      fit: "Prioridade para a Aurora validar sites e jogos web automaticamente.",
      install: "npm install -D @playwright/test"
    },
    {
      category: "Configuracao de agentes",
      priority: "alta",
      name: "AGENTS.md / ContextKit / Caliber",
      use: "Gerar instrucoes persistentes para agentes entenderem padroes do projeto.",
      fit: "Boa melhoria: criar um AGENTS.md da Aurora com stack, comandos, regras e rotas.",
      install: "Sem instalacao obrigatoria; a Aurora pode gerar o arquivo."
    },
    {
      category: "Revisao e PR",
      priority: "media",
      name: "PR template + checks",
      use: "Padronizar descricao, checklist e validacoes de PR.",
      fit: "Podemos criar um gerador de checklist de entrega para cada missao.",
      install: "Sem instalacao obrigatoria; usar templates locais."
    }
  ];

  const nextImprovements = [
    "Criar AGENTS.md local para ensinar a Aurora/Codex sobre o projeto.",
    "Adicionar Criador de Sites com estrutura, componentes, estados e validacao visual.",
    "Adicionar checklist de entrega por missao inspirado em PR templates.",
    "Melhorar busca semantica local para projetos grandes.",
    "Adicionar fluxo de patch + revisao + testes antes de aplicar mudancas grandes.",
    "Adicionar instalador assistido para dependencias opcionais, sempre com confirmacao."
  ];

  return {
    source: "awesome-ai-devtools-main/README.md",
    tools,
    nextImprovements
  };
}

function buildGeneratedDocument({ type, title, content }) {
  const cleanTitle = String(title || "Documento gerado").trim().slice(0, 160) || "Documento gerado";
  const cleanContent = String(content || "").trim();
  const now = new Date().toISOString();

  if (type === "csv") {
    const rows = cleanContent
      ? cleanContent.split(/\r?\n/).map((line) => [line])
      : [["Item"], ["Preencha os dados aqui"]];
    return {
      extension: ".csv",
      content: [["Titulo", cleanTitle], ["Gerado em", now], [], ...rows]
        .map((row) => row.map(csvCell).join(";"))
        .join("\n")
    };
  }

  if (type === "html") {
    return {
      extension: ".html",
      content: `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(cleanTitle)}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.5; margin: 40px; color: #1d252c; }
    h1 { font-size: 28px; margin-bottom: 8px; }
    .meta { color: #66727f; font-size: 13px; margin-bottom: 24px; }
    pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
  </style>
</head>
<body>
  <h1>${escapeHtml(cleanTitle)}</h1>
  <div class="meta">Gerado pela Aurora em ${escapeHtml(now)}</div>
  <pre>${escapeHtml(cleanContent || "Conteudo do documento.")}</pre>
</body>
</html>`
    };
  }

  return {
    extension: ".md",
    content: `# ${cleanTitle}

Gerado pela Aurora em ${now}

${cleanContent || "Conteudo do documento."}
`
  };
}

function detectDatabaseEntities(objective) {
  const text = String(objective || "").toLowerCase();
  const entities = [];
  const add = (id, table, label, fields) => {
    if (!entities.some((entity) => entity.id === id)) entities.push({ id, table, label, fields });
  };

  if (/\b(cliente|clientes|customer|customers)\b/.test(text)) {
    add("customers", "customers", "clientes", [
      "name TEXT NOT NULL",
      "email TEXT UNIQUE",
      "phone TEXT",
      "document TEXT"
    ]);
  }
  if (/\b(produto|produtos|product|products|estoque)\b/.test(text)) {
    add("products", "products", "produtos", [
      "name TEXT NOT NULL",
      "sku TEXT UNIQUE",
      "price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0)",
      "stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0)",
      "active INTEGER NOT NULL DEFAULT 1"
    ]);
  }
  if (/\b(pedido|pedidos|order|orders|venda|vendas)\b/.test(text)) {
    if (!entities.some((entity) => entity.id === "customers")) {
      add("customers", "customers", "clientes", [
        "name TEXT NOT NULL",
        "email TEXT UNIQUE",
        "phone TEXT",
        "document TEXT"
      ]);
    }
    add("orders", "orders", "pedidos", [
      "customer_id TEXT NOT NULL",
      "status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'paid', 'cancelled'))",
      "total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0)",
      "FOREIGN KEY (customer_id) REFERENCES customers(id)"
    ]);
  }
  if (/\b(item|itens|order item|order_items|carrinho)\b/.test(text) || entities.some((entity) => entity.id === "orders") && entities.some((entity) => entity.id === "products")) {
    add("order_items", "order_items", "itens do pedido", [
      "order_id TEXT NOT NULL",
      "product_id TEXT NOT NULL",
      "quantity INTEGER NOT NULL CHECK (quantity > 0)",
      "unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0)",
      "FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE",
      "FOREIGN KEY (product_id) REFERENCES products(id)"
    ]);
  }
  if (/\b(pagamento|pagamentos|payment|payments)\b/.test(text)) {
    if (!entities.some((entity) => entity.id === "orders")) {
      add("orders", "orders", "pedidos", [
        "customer_id TEXT NOT NULL",
        "status TEXT NOT NULL DEFAULT 'draft'",
        "total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0)"
      ]);
    }
    add("payments", "payments", "pagamentos", [
      "order_id TEXT NOT NULL",
      "provider TEXT NOT NULL DEFAULT 'manual'",
      "status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded'))",
      "amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0)",
      "paid_at TEXT",
      "FOREIGN KEY (order_id) REFERENCES orders(id)"
    ]);
  }
  if (/\b(usuario|usuarios|user|users|login|auth|permissao|permissão)\b/.test(text)) {
    add("users", "users", "usuarios", [
      "name TEXT NOT NULL",
      "email TEXT NOT NULL UNIQUE",
      "password_hash TEXT",
      "role TEXT NOT NULL DEFAULT 'user'",
      "active INTEGER NOT NULL DEFAULT 1"
    ]);
  }

  if (!entities.length) {
    add("records", "records", "registros", [
      "title TEXT NOT NULL",
      "description TEXT",
      "status TEXT NOT NULL DEFAULT 'active'"
    ]);
  }

  return entities;
}

function detectDatabaseEngine(objective) {
  const text = String(objective || "").toLowerCase();
  if (/\b(postgres|postgresql)\b/.test(text)) return "postgresql";
  if (/\b(mysql|mariadb)\b/.test(text)) return "mysql";
  return "sqlite";
}

function normalizeDatabaseField(field, engine) {
  let value = String(field || "");
  if (engine === "sqlite") return value;
  value = value.replace(/\bINTEGER NOT NULL DEFAULT 1\b/g, "BOOLEAN NOT NULL DEFAULT TRUE");
  value = value.replace(/\bINTEGER NOT NULL DEFAULT 0\b/g, "INTEGER NOT NULL DEFAULT 0");
  return value;
}

function buildLocalDatabaseSql(objective, engine = "sqlite") {
  const entities = detectDatabaseEntities(objective);
  const tableSql = entities.map((entity) => {
    const normalFields = entity.fields.filter((field) => !String(field).trim().toUpperCase().startsWith("FOREIGN KEY"));
    const tableConstraints = entity.fields.filter((field) => String(field).trim().toUpperCase().startsWith("FOREIGN KEY"));
    const fields = [
      "id TEXT PRIMARY KEY",
      ...normalFields.map((field) => normalizeDatabaseField(field, engine)),
      engine === "postgresql" ? "created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP" : "created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
      engine === "postgresql" ? "updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP" : "updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
      ...tableConstraints
    ];
    return `CREATE TABLE ${entity.table} (\n  ${fields.join(",\n  ")}\n);`;
  });
  const indexes = [];

  if (entities.some((entity) => entity.id === "customers")) indexes.push("CREATE INDEX idx_customers_email ON customers(email);");
  if (entities.some((entity) => entity.id === "products")) indexes.push("CREATE INDEX idx_products_sku ON products(sku);");
  if (entities.some((entity) => entity.id === "orders")) {
    indexes.push("CREATE INDEX idx_orders_customer_id ON orders(customer_id);");
    indexes.push("CREATE INDEX idx_orders_status ON orders(status);");
  }
  if (entities.some((entity) => entity.id === "order_items")) {
    indexes.push("CREATE INDEX idx_order_items_order_id ON order_items(order_id);");
    indexes.push("CREATE INDEX idx_order_items_product_id ON order_items(product_id);");
  }
  if (entities.some((entity) => entity.id === "payments")) indexes.push("CREATE INDEX idx_payments_order_id ON payments(order_id);");
  if (entities.some((entity) => entity.id === "users")) indexes.push("CREATE INDEX idx_users_email ON users(email);");

  const seed = [];
  if (entities.some((entity) => entity.id === "customers")) {
    seed.push("INSERT INTO customers (id, name, email, phone, document) VALUES ('cust_001', 'Cliente Teste', 'cliente@example.com', '+55 11 99999-0000', '00000000000');");
  }
  if (entities.some((entity) => entity.id === "products")) {
    seed.push("INSERT INTO products (id, name, sku, price_cents, stock_quantity) VALUES ('prod_001', 'Produto Teste', 'SKU-001', 9900, 10);");
  }
  if (entities.some((entity) => entity.id === "orders")) {
    seed.push("INSERT INTO orders (id, customer_id, status, total_cents) VALUES ('ord_001', 'cust_001', 'pending', 9900);");
  }
  if (entities.some((entity) => entity.id === "order_items")) {
    seed.push("INSERT INTO order_items (id, order_id, product_id, quantity, unit_price_cents) VALUES ('item_001', 'ord_001', 'prod_001', 1, 9900);");
  }
  if (entities.some((entity) => entity.id === "payments")) {
    seed.push("INSERT INTO payments (id, order_id, provider, status, amount_cents) VALUES ('pay_001', 'ord_001', 'manual', 'pending', 9900);");
  }
  if (entities.some((entity) => entity.id === "users")) {
    seed.push("INSERT INTO users (id, name, email, role) VALUES ('user_001', 'Usuario Admin', 'admin@example.com', 'admin');");
  }
  if (entities.some((entity) => entity.id === "records")) {
    seed.push("INSERT INTO records (id, title, description) VALUES ('rec_001', 'Registro teste', 'Criado pelo seed da Aurora.');");
  }

  return {
    entities,
    schemaSql: [engine === "sqlite" ? "PRAGMA foreign_keys = ON;" : "", ...tableSql, ...indexes].filter(Boolean).join("\n\n") + "\n",
    seedSql: [engine === "sqlite" ? "PRAGMA foreign_keys = ON;" : "", ...seed].filter(Boolean).join("\n\n") + "\n"
  };
}

function buildDatabaseDockerCompose(engine, slug) {
  if (engine === "postgresql") {
    return `services:
  db:
    image: postgres:16-alpine
    container_name: ${slug}-postgres
    environment:
      POSTGRES_DB: aurora_app
      POSTGRES_USER: aurora
      POSTGRES_PASSWORD: aurora_local_dev
    ports:
      - "5432:5432"
    volumes:
      - ./schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
      - ./seed.sql:/docker-entrypoint-initdb.d/02-seed.sql:ro
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
`;
  }

  if (engine === "mysql") {
    return `services:
  db:
    image: mysql:8
    container_name: ${slug}-mysql
    environment:
      MYSQL_DATABASE: aurora_app
      MYSQL_USER: aurora
      MYSQL_PASSWORD: aurora_local_dev
      MYSQL_ROOT_PASSWORD: aurora_root_dev
    ports:
      - "3306:3306"
    volumes:
      - ./schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
      - ./seed.sql:/docker-entrypoint-initdb.d/02-seed.sql:ro
      - db_data:/var/lib/mysql

volumes:
  db_data:
`;
  }

  return "";
}

function buildDatabaseEnvExample(engine) {
  if (engine === "postgresql") {
    return "DATABASE_URL=postgresql://aurora:aurora_local_dev@localhost:5432/aurora_app\n";
  }
  if (engine === "mysql") {
    return "DATABASE_URL=mysql://aurora:aurora_local_dev@localhost:3306/aurora_app\n";
  }
  return "DATABASE_URL=file:./app.sqlite\n";
}

function resolveGeneratedDatabaseDir(relativePath = "") {
  const raw = String(relativePath || "").trim();
  if (!raw) throw new Error("Informe a pasta do banco criado pela Aurora.");
  const normalized = path.normalize(raw.replace(/^[/\\]+/, ""));
  const databasesRoot = path.resolve(generatedDir, "databases");
  const fullPath = path.resolve(workspaceDir, normalized);

  if (fullPath !== databasesRoot && !fullPath.startsWith(`${databasesRoot}${path.sep}`)) {
    throw new Error("So posso controlar bancos dentro de generated/databases.");
  }
  if (!existsSync(path.join(fullPath, "docker-compose.yml"))) {
    throw new Error("Essa pasta nao tem docker-compose.yml gerado pela Aurora.");
  }
  return fullPath;
}

async function checkDockerAvailable() {
  try {
    const result = await execFileAsync("docker", ["--version"], { cwd: __dirname, timeout: 10_000, windowsHide: true });
    return { available: true, version: String(result.stdout || result.stderr || "").trim() };
  } catch (error) {
    return { available: false, error: String(error.message || error).slice(0, 500) };
  }
}

async function runGeneratedDatabaseDocker({ databaseDir, action }) {
  const permissions = await readPermissions();
  if (!booleanPermission(permissions.runCommands)) {
    const error = new Error("Permissao de comandos desativada.");
    error.statusCode = 403;
    throw error;
  }

  const docker = await checkDockerAvailable();
  if (!docker.available) {
    return { ok: false, skipped: true, docker, stdout: "", stderr: "", action };
  }

  const cwd = resolveGeneratedDatabaseDir(databaseDir);
  const safeAction = ["up", "down", "status"].includes(action) ? action : "status";
  const args = safeAction === "up"
    ? ["compose", "up", "-d"]
    : safeAction === "down"
      ? ["compose", "down"]
      : ["compose", "ps"];

  try {
    const result = await execFileAsync("docker", args, { cwd, timeout: 120_000, windowsHide: true });
    const payload = {
      ok: true,
      action: safeAction,
      docker,
      path: toRelative(cwd),
      stdout: result.stdout || "",
      stderr: result.stderr || ""
    };
    recordExecutionEvidence({
      kind: "database-docker",
      stepId: "local-database-docker",
      commandId: `docker-compose-${safeAction}`,
      ok: true,
      summary: `Docker ${safeAction} executado em ${payload.path}.`,
      stdout: payload.stdout,
      stderr: payload.stderr,
      metadata: { path: payload.path, action: safeAction }
    });
    return payload;
  } catch (error) {
    recordExecutionEvidence({
      kind: "database-docker",
      stepId: "local-database-docker",
      commandId: `docker-compose-${safeAction}`,
      ok: false,
      summary: `Docker ${safeAction} falhou.`,
      stdout: error.stdout || "",
      stderr: error.stderr || "",
      error: error.message,
      metadata: { path: toRelative(cwd), action: safeAction }
    });
    return {
      ok: false,
      action: safeAction,
      docker,
      path: toRelative(cwd),
      stdout: error.stdout || "",
      stderr: error.stderr || "",
      error: error.message
    };
  }
}

function inspectSqliteDatabase(filePath) {
  const database = new DatabaseSync(filePath);
  try {
    database.exec("PRAGMA foreign_keys = ON;");
    const tables = database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
    const foreignKeyCheck = database.prepare("PRAGMA foreign_key_check").all();
    return {
      tables: tables.map((table) => table.name),
      foreignKeyCheck,
      ok: foreignKeyCheck.length === 0
    };
  } finally {
    database.close();
  }
}

async function buildLocalDatabase({ objective, name = "" }) {
  const cleanObjective = String(objective || "").trim();
  if (!cleanObjective) throw new Error("Descreva o banco de dados que voce quer criar.");

  const engine = detectDatabaseEngine(cleanObjective);
  const slug = slugifyFileName(name || cleanObjective, "banco-local");
  const rootDir = path.join(generatedDir, "databases", `${slug}-${Date.now()}`);
  await mkdir(rootDir, { recursive: true });

  const databasePath = path.join(rootDir, `${slug}.sqlite`);
  const schemaPath = path.join(rootDir, "schema.sql");
  const seedPath = path.join(rootDir, "seed.sql");
  const readmePath = path.join(rootDir, "README.md");
  const dockerComposePath = path.join(rootDir, "docker-compose.yml");
  const envExamplePath = path.join(rootDir, ".env.example");
  const { entities, schemaSql, seedSql } = buildLocalDatabaseSql(cleanObjective, engine);

  await writeFile(schemaPath, schemaSql, "utf8");
  await writeFile(seedPath, seedSql, "utf8");
  await writeFile(envExamplePath, buildDatabaseEnvExample(engine), "utf8");

  let validation;
  if (engine === "sqlite") {
    const database = new DatabaseSync(databasePath);
    try {
      database.exec("PRAGMA foreign_keys = ON;");
      database.exec(schemaSql);
      database.exec(seedSql);
    } finally {
      database.close();
    }
    validation = inspectSqliteDatabase(databasePath);
  } else {
    await writeFile(dockerComposePath, buildDatabaseDockerCompose(engine, slug), "utf8");
    validation = {
      ok: true,
      mode: "docker-artifact",
      tables: entities.map((entity) => entity.table),
      foreignKeyCheck: [],
      note: "Artefatos Docker gerados. Execute docker compose up -d para criar o servidor local."
    };
  }

  const readme = `# Banco Local Aurora

Pedido:
${cleanObjective}

Engine:
${engine}

${engine === "sqlite" ? `Arquivo SQLite:\n${path.basename(databasePath)}` : `Servidor via Docker:\ndocker compose up -d`}

Tabelas:
${validation.tables.map((table) => `- ${table}`).join("\n")}

Arquivos:
- schema.sql
- seed.sql
- .env.example
${engine === "sqlite" ? `- ${path.basename(databasePath)}` : "- docker-compose.yml"}

Validacao:
- ${engine === "sqlite" ? "foreign_key_check" : "artefatos"}: ${validation.ok ? "OK" : "ERRO"}

Como usar:
${engine === "sqlite"
    ? "1. Abra o arquivo .sqlite com uma ferramenta SQLite.\n2. Use schema.sql para recriar estrutura.\n3. Use seed.sql para popular dados iniciais."
    : "1. Instale/abra Docker Desktop.\n2. Rode docker compose up -d nesta pasta.\n3. Use a DATABASE_URL do .env.example no seu app."}
`;
  await writeFile(readmePath, readme, "utf8");

  const result = {
    objective: cleanObjective,
    engine,
    path: toRelative(rootDir),
    databasePath: engine === "sqlite" ? toRelative(databasePath) : "",
    schemaPath: toRelative(schemaPath),
    seedPath: toRelative(seedPath),
    readmePath: toRelative(readmePath),
    dockerComposePath: engine === "sqlite" ? "" : toRelative(dockerComposePath),
    envExamplePath: toRelative(envExamplePath),
    entities,
    validation
  };

  recordExecutionEvidence({
    kind: "database-build",
    stepId: "local-database-builder",
    commandId: "sqlite-create",
    ok: validation.ok,
    summary: engine === "sqlite"
      ? `Banco SQLite local criado em ${result.databasePath}.`
      : `Artefatos ${engine} criados em ${result.path}.`,
    stdout: `Tabelas:\n${validation.tables.join("\n")}\n\nSchema:\n${schemaSql}`,
    stderr: validation.ok ? "" : JSON.stringify(validation.foreignKeyCheck, null, 2),
    metadata: result
  });

  return result;
}

async function orchestrateAutonomousTask({ objective, fileContext = [] }) {
  const cleanObjective = String(objective || "").trim();
  if (!cleanObjective) throw new Error("Descreva o que voce quer construir.");

  const steps = [];
  const addStep = (step) => steps.push({
    at: new Date().toISOString(),
    ...step
  });
  const lower = cleanObjective.toLowerCase();
  const wantsDatabase = /\b(banco|banco de dados|database|sqlite|postgres|postgresql|mysql|mariadb|tabela|schema)\b/i.test(lower);
  const wantsBuild = /\b(site|sistema|app|aplicativo|api|backend|frontend|java|python|html|css|react|next|spring|fastapi|django)\b/i.test(lower);
  let database = null;
  let docker = null;
  let autopilot = null;

  addStep({ status: "running", title: "Entender pedido", detail: wantsDatabase ? "Pedido precisa de banco." : "Pedido geral de construcao." });

  if (wantsDatabase) {
    database = await buildLocalDatabase({ objective: cleanObjective });
    addStep({
      status: "done",
      title: "Criar banco/artefatos",
      detail: database.engine === "sqlite"
        ? `SQLite criado em ${database.databasePath}.`
        : `${database.engine} preparado em ${database.path}.`
    });

    if (database.engine !== "sqlite") {
      docker = await runGeneratedDatabaseDocker({ databaseDir: database.path, action: "up" });
      addStep({
        status: docker.ok ? "done" : docker.skipped ? "blocked" : "failed",
        title: "Subir banco Docker",
        detail: docker.ok
          ? "Docker compose up executado."
          : docker.skipped
            ? "Docker indisponivel ou fechado."
            : docker.error || "Docker retornou erro."
      });
    }
  }

  if (wantsBuild) {
    autopilot = await buildAutopilotPlan({
      objective: cleanObjective,
      fileContext,
      createScaffold: true
    });
    addStep({
      status: "done",
      title: "Preparar projeto/autopiloto",
      detail: autopilot.scaffold ? `Scaffold criado em ${autopilot.scaffold.path}.` : `Plano salvo em ${autopilot.artifact?.path}.`
    });

    const safeRun = await runAutopilotSafeChecks({ objective: cleanObjective, commandIds: ["npm-run-check"] });
    autopilot.safeRun = safeRun;
    addStep({
      status: safeRun.skipped ? "blocked" : safeRun.ok ? "done" : "failed",
      title: "Rodar validacao segura",
      detail: safeRun.skipped ? safeRun.reason : safeRun.ok ? "npm-run-check passou." : "npm-run-check falhou; veja Atividade."
    });
  }

  if (!wantsDatabase && !wantsBuild) {
    autopilot = await buildAutopilotPlan({
      objective: cleanObjective,
      fileContext,
      createScaffold: false
    });
    addStep({
      status: "done",
      title: "Preparar plano autonomo",
      detail: `Plano salvo em ${autopilot.artifact?.path}.`
    });
  }

  const ok = steps.every((step) => ["done", "blocked"].includes(step.status));
  recordExecutionEvidence({
    kind: "autonomous-orchestrator",
    stepId: "autonomous-task",
    commandId: "orchestrate",
    ok,
    summary: `Orquestrador autonomo processou: ${cleanObjective.slice(0, 180)}`,
    stdout: steps.map((step) => `${step.status.toUpperCase()} ${step.title}: ${step.detail}`).join("\n"),
    stderr: steps.filter((step) => step.status === "failed").map((step) => step.detail).join("\n"),
    metadata: {
      objective: cleanObjective,
      databasePath: database?.path || "",
      autopilotPath: autopilot?.artifact?.path || ""
    }
  });

  return {
    source: "autonomous-orchestrator",
    objective: cleanObjective,
    ok,
    steps,
    database,
    docker,
    autopilot
  };
}

function readJsonFileIfExists(filePath, fallback = null) {
  if (!existsSync(filePath)) return fallback;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function detectProjectStack(rootDir) {
  const has = (relativePath) => existsSync(path.join(rootDir, relativePath));
  const packageJson = readJsonFileIfExists(path.join(rootDir, "package.json"), {});
  const dependencies = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
  const scripts = packageJson.scripts || {};
  const stack = [];
  const packageManagers = [];
  const installCommands = [];
  const testCommands = [];
  const runCommands = [];

  if (has("package.json")) {
    stack.push("Node.js");
    if (dependencies.next) stack.push("Next.js");
    if (dependencies.react) stack.push("React");
    if (dependencies.express) stack.push("Express");
    if (dependencies.prisma || has("prisma/schema.prisma")) stack.push("Prisma");
    if (dependencies.vite || scripts.dev?.includes("vite")) stack.push("Vite");
    packageManagers.push(has("pnpm-lock.yaml") ? "pnpm" : has("yarn.lock") ? "yarn" : "npm");
    installCommands.push(has("pnpm-lock.yaml") ? "pnpm install" : has("yarn.lock") ? "yarn install" : "npm install");
    if (scripts.check) testCommands.push("npm run check");
    if (scripts.test) testCommands.push("npm test");
    if (scripts.dev) runCommands.push("npm run dev");
    if (scripts.start) runCommands.push("npm start");
  }
  if (has("requirements.txt") || has("pyproject.toml") || has("Pipfile")) {
    stack.push("Python");
    packageManagers.push(has("pyproject.toml") ? "pip/pyproject" : "pip");
    installCommands.push(has("requirements.txt") ? "python -m pip install -r requirements.txt" : "python -m pip install -e .");
    testCommands.push("python -m pytest");
  }
  if (has("pom.xml")) {
    stack.push("Java", "Maven");
    packageManagers.push("maven");
    testCommands.push("mvn test");
    runCommands.push("mvn spring-boot:run");
  }
  if (has("build.gradle") || has("build.gradle.kts")) {
    stack.push("Java/Kotlin", "Gradle");
    packageManagers.push("gradle");
    testCommands.push(".\\gradlew test");
    runCommands.push(".\\gradlew bootRun");
  }
  if (has("docker-compose.yml") || has("compose.yml")) stack.push("Docker Compose");
  if (has("Dockerfile")) stack.push("Docker");
  if (has("schema.sql") || has("seed.sql")) stack.push("SQL");
  if (has("README.md")) stack.push("README");

  const database = [
    has("prisma/schema.prisma") ? "Prisma schema" : "",
    has("docker-compose.yml") ? "docker-compose.yml" : "",
    has("schema.sql") ? "schema.sql" : "",
    has("data") ? "data/" : ""
  ].filter(Boolean).join(", ");

  return {
    stack: [...new Set(stack)],
    packageManagers: [...new Set(packageManagers)],
    installCommands: [...new Set(installCommands)],
    testCommands: [...new Set(testCommands)],
    runCommands: [...new Set(runCommands)],
    database
  };
}

function buildCodexWorkLanes({ objective, stack }) {
  const lanes = [
    {
      id: "context",
      title: "Contexto e memoria",
      status: "ready",
      actions: ["Atualizar indice", "Atualizar mapa de codigo", "Salvar perfil vivo do projeto"]
    },
    {
      id: "dependencies",
      title: "Dependencias locais",
      status: stack.installCommands.length ? "ready" : "needs-review",
      actions: stack.installCommands.length ? stack.installCommands : ["Detectar gerenciador antes de instalar"]
    },
    {
      id: "implementation",
      title: "Edicao coordenada",
      status: "ready",
      actions: ["Planejar multiplos arquivos", "Aplicar diffs com backup", "Reverter por change log se precisar"]
    },
    {
      id: "validation",
      title: "Testes e reparo",
      status: stack.testCommands.length ? "ready" : "needs-review",
      actions: stack.testCommands.length ? stack.testCommands : ["Definir comando de teste"]
    },
    {
      id: "preview",
      title: "Preview local",
      status: stack.runCommands.length ? "ready" : "planned",
      actions: stack.runCommands.length ? stack.runCommands : ["Definir comando de servidor local"]
    },
    {
      id: "git",
      title: "Git/GitHub",
      status: "planned",
      actions: ["git status", "git diff", "branch segura", "PR quando GitHub estiver conectado"]
    },
    {
      id: "parallel",
      title: "Agentes paralelos",
      status: "planned",
      actions: ["Separar frontend", "backend", "banco", "docs/testes"]
    }
  ];
  if (/\b(banco|database|postgres|mysql|sqlite)\b/i.test(objective)) {
    lanes.splice(3, 0, {
      id: "database",
      title: "Banco de dados",
      status: "ready",
      actions: ["Modelar entidades", "Gerar schema/seed", "Criar SQLite ou Docker Compose", "Validar chaves estrangeiras"]
    });
  }
  return lanes;
}

async function buildCodexMode({ objective = "", fileContext = [], updateProfile = true } = {}) {
  const attachedProject = await readAttachedProject();
  const rootDir = attachedProject?.path ? path.resolve(attachedProject.path) : __dirname;
  const stack = detectProjectStack(rootDir);
  const capabilities = await buildCapabilityStatus();
  const gitTool = capabilities.tools.find((tool) => tool.command === "git");
  const dockerTool = capabilities.tools.find((tool) => tool.command === "docker");
  const git = gitTool?.available
    ? {
      status: await runOptionalCommand("git", ["status", "--short"], rootDir, 20_000),
      branch: await runOptionalCommand("git", ["branch", "--show-current"], rootDir, 20_000),
      remote: await runOptionalCommand("git", ["remote", "get-url", "origin"], rootDir, 20_000)
    }
    : { status: { ok: false, error: gitTool?.error || "Git nao detectado." } };
  const lanes = buildCodexWorkLanes({ objective, stack });
  const permission = await readPermissions();
  const profile = {
    stack: stack.stack.join(", ") || "Nao detectado",
    database: stack.database || "Nao detectado",
    runCommands: stack.runCommands.join("\n"),
    testCommands: stack.testCommands.join("\n"),
    goals: String(objective || "Trabalhar em modo Codex com autonomia segura.").slice(0, 2000),
    notes: [
      `Projeto raiz: ${rootDir}`,
      `Gerenciadores: ${stack.packageManagers.join(", ") || "nao detectado"}`,
      `Instalacao sugerida: ${stack.installCommands.join(" && ") || "nao detectada"}`,
      `Docker: ${dockerTool?.available ? "disponivel" : "indisponivel"}`,
      `Git: ${gitTool?.available ? "disponivel" : "indisponivel"}`
    ].join("\n"),
    updatedAt: new Date().toISOString()
  };

  if (updateProfile) await saveProjectProfile(profile);

  const plan = `Modo Codex da Aurora
Objetivo: ${objective || "Preparar autonomia do projeto"}

Projeto
- Raiz: ${rootDir}
- Stack: ${profile.stack}
- Banco: ${profile.database}
- Run: ${profile.runCommands || "a detectar"}
- Testes: ${profile.testCommands || "a detectar"}

Permissoes
- Ler arquivos: ${permission.readFiles ? "sim" : "nao"}
- Propor edicoes: ${permission.proposeEdits ? "sim" : "nao"}
- Aplicar edicoes: ${permission.applyEdits ? "sim" : "nao"}
- Rodar comandos: ${permission.runCommands ? "sim" : "nao"}
- SQL escrita: ${permission.sqlWrite ? "sim" : "nao"}

Linhas de trabalho
${lanes.map((lane) => `- ${lane.title} [${lane.status}]: ${lane.actions.join("; ")}`).join("\n")}

Regra de autonomia
- Fazer automaticamente o que estiver em generated/, checks seguros e comandos allowlist.
- Pedir confirmacao antes de instalacao global, apagar arquivos, escrita SQL destrutiva ou mudanca ampla no projeto anexado.
- Registrar tudo na Atividade.`;

  recordExecutionEvidence({
    kind: "codex-mode",
    stepId: "codex-mode",
    commandId: "prepare",
    ok: true,
    summary: `Modo Codex preparado para ${path.basename(rootDir)}.`,
    stdout: plan,
    stderr: "",
    metadata: { rootDir, stack, lanes }
  });

  return {
    source: "codex-mode",
    objective,
    rootDir,
    stack,
    profile,
    git,
    docker: dockerTool || null,
    capabilities,
    lanes,
    plan,
    fileContext: Array.isArray(fileContext) ? fileContext.map((file) => file.path) : []
  };
}

function isImageRequest(text) {
  const value = String(text || "").toLowerCase();
  const asksAboutImageTools =
    /\b(quais|qual|como|configurad[ao]s?|consegue usar|voce usa|você usa|pode usar|tem acesso)\b/i.test(value)
    && /\b(motores? de imagem|provedores? de imagem|ferramentas? de imagem|apis?|chaves?|gemini|openrouter|comfyui|nano banana)\b/i.test(value);
  if (asksAboutImageTools) return false;

  const hasImageSubject = /\b(imagem|foto|desenho|ilustracao|ilustração|arte|logo|sprite|icone|ícone)\b/i.test(value);
  if (!hasImageSubject) return false;

  const hasCreateIntent = /\b(crie|cria|criar|gere|gera|gerar|faca|faça|fazer|desenhe|desenhar|produza|produzir|quero|preciso|monte|renderize)\b/i.test(value);
  const hasImplicitPrompt = /^\s*(uma?\s+)?(imagem|foto|desenho|logo|sprite|icone|ícone)\s+(de|do|da|com)\b/i.test(value);
  return hasCreateIntent || hasImplicitPrompt;
}

function wantsBitmapImage(text) {
  return /\b(jpeg|jpg|png|foto|realista|real|bitmap|alta qualidade|hd|photorealistic|fotorealista)\b/i.test(String(text || ""));
}

function normalizeComfyBaseUrl() {
  return String(comfyUiUrl || "http://127.0.0.1:8188").replace(/\/+$/, "");
}

async function checkComfyUiStatus({ timeoutMs = 4_000 } = {}) {
  const baseUrl = normalizeComfyBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const systemResponse = await fetch(`${baseUrl}/system_stats`, { signal: controller.signal });
    if (!systemResponse.ok) throw new Error(`ComfyUI respondeu ${systemResponse.status}`);
    const system = await systemResponse.json();
    let checkpoints = [];
    try {
      const objectResponse = await fetch(`${baseUrl}/object_info/CheckpointLoaderSimple`, { signal: controller.signal });
      if (objectResponse.ok) {
        const objectInfo = await objectResponse.json();
        checkpoints = objectInfo.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0] || [];
      }
    } catch {
      checkpoints = [];
    }
    return {
      online: true,
      url: baseUrl,
      checkpoints,
      system
    };
  } catch (error) {
    return {
      online: false,
      url: baseUrl,
      checkpoints: [],
      error: error.name === "AbortError" ? "ComfyUI nao respondeu dentro do tempo." : error.message
    };
  } finally {
    clearTimeout(timeout);
  }
}

function buildComfyWorkflow({ prompt, checkpoint }) {
  const positivePrompt = `${String(prompt || "imagem bonita").trim()}, high quality, detailed, pleasing composition`;
  return {
    "3": {
      class_type: "KSampler",
      inputs: {
        seed: Math.floor(Math.random() * 1_000_000_000),
        steps: 24,
        cfg: 7,
        sampler_name: "euler",
        scheduler: "normal",
        denoise: 1,
        model: ["4", 0],
        positive: ["6", 0],
        negative: ["7", 0],
        latent_image: ["5", 0]
      }
    },
    "4": {
      class_type: "CheckpointLoaderSimple",
      inputs: { ckpt_name: checkpoint }
    },
    "5": {
      class_type: "EmptyLatentImage",
      inputs: { width: 768, height: 768, batch_size: 1 }
    },
    "6": {
      class_type: "CLIPTextEncode",
      inputs: { text: positivePrompt, clip: ["4", 1] }
    },
    "7": {
      class_type: "CLIPTextEncode",
      inputs: { text: "low quality, blurry, distorted, deformed, bad anatomy, watermark, text", clip: ["4", 1] }
    },
    "8": {
      class_type: "VAEDecode",
      inputs: { samples: ["3", 0], vae: ["4", 2] }
    },
    "9": {
      class_type: "SaveImage",
      inputs: { filename_prefix: "aurora", images: ["8", 0] }
    }
  };
}

async function downloadComfyImage({ filename, subfolder = "", type = "output" }) {
  const baseUrl = normalizeComfyBaseUrl();
  const params = new URLSearchParams({ filename, subfolder, type });
  const response = await fetch(`${baseUrl}/view?${params}`);
  if (!response.ok) throw new Error(`Falha ao baixar imagem do ComfyUI: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  const imageDir = path.join(generatedDir, "images");
  await mkdir(imageDir, { recursive: true });
  const extension = path.extname(filename) || ".png";
  const safeName = `${slugifyFileName(path.basename(filename, extension), "comfyui")}-${Date.now()}${extension}`;
  const fullPath = path.join(imageDir, safeName);
  await writeFile(fullPath, Buffer.from(arrayBuffer));
  return {
    path: toRelative(fullPath),
    url: `/${toRelative(fullPath).replaceAll("\\", "/").replace(/^ai-assistant\//, "")}`,
    type: extension.toLowerCase() === ".jpg" || extension.toLowerCase() === ".jpeg" ? "image/jpeg" : "image/png",
    size: Buffer.byteLength(Buffer.from(arrayBuffer))
  };
}

async function createComfyImage({ prompt, timeoutMs = 180_000 }) {
  const status = await checkComfyUiStatus();
  if (!status.online) throw new Error(status.error || "ComfyUI offline.");
  const checkpoint = status.checkpoints[0];
  if (!checkpoint) throw new Error("ComfyUI online, mas nenhum checkpoint/modelo foi encontrado em ComfyUI/models/checkpoints.");

  const baseUrl = normalizeComfyBaseUrl();
  const clientId = crypto.randomUUID();
  const promptResponse = await fetch(`${baseUrl}/prompt`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      prompt: buildComfyWorkflow({ prompt, checkpoint })
    })
  });
  if (!promptResponse.ok) {
    const text = await promptResponse.text();
    throw new Error(text || `ComfyUI respondeu ${promptResponse.status}`);
  }
  const queued = await promptResponse.json();
  const promptId = queued.prompt_id;
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const historyResponse = await fetch(`${baseUrl}/history/${promptId}`);
    if (!historyResponse.ok) continue;
    const history = await historyResponse.json();
    const item = history[promptId];
    const images = item?.outputs ? Object.values(item.outputs).flatMap((output) => output.images || []) : [];
    if (images.length) {
      const image = await downloadComfyImage(images[0]);
      return {
        ...image,
        backend: "comfyui",
        checkpoint
      };
    }
  }
  throw new Error("ComfyUI demorou demais para gerar a imagem.");
}

async function createGeminiImage({ prompt, fileName = "", timeoutMs = 120_000 }) {
  if (!geminiApiKey) throw new Error("GEMINI_API_KEY nao configurada.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiImageModel)}:generateContent`, {
      method: "POST",
      headers: {
        "x-goog-api-key": geminiApiKey,
        "content-type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Crie uma imagem bonita, polida e detalhada a partir deste pedido. Nao coloque texto escrito na imagem, a menos que o pedido exija. Pedido: ${String(prompt || "").trim()}`
              }
            ]
          }
        ]
      })
    });
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Gemini Image demorou demais para responder.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Gemini Image respondeu ${response.status}`);
  }

  const data = await response.json();
  const parts = (data.candidates || []).flatMap((candidate) => candidate.content?.parts || []);
  const inline = parts.find((part) => part.inlineData?.data || part.inline_data?.data);
  if (!inline) throw new Error("Gemini Image nao retornou dados de imagem.");

  const inlineData = inline.inlineData || inline.inline_data;
  const mimeType = inlineData.mimeType || inlineData.mime_type || "image/png";
  const extension = mimeType.includes("jpeg") || mimeType.includes("jpg") ? ".jpg" : ".png";
  const imageBuffer = Buffer.from(inlineData.data, "base64");
  const imageDir = path.join(generatedDir, "images");
  await mkdir(imageDir, { recursive: true });
  const baseName = slugifyFileName(fileName || prompt || "gemini-image", "gemini-image");
  const fullPath = path.join(imageDir, `${baseName}-${Date.now()}${extension}`);
  await writeFile(fullPath, imageBuffer);
  return {
    path: toRelative(fullPath),
    url: `/${toRelative(fullPath).replaceAll("\\", "/").replace(/^ai-assistant\//, "")}`,
    type: mimeType,
    size: imageBuffer.byteLength,
    backend: "gemini-image",
    model: geminiImageModel
  };
}

function buildSimpleSvgImage(prompt) {
  const text = String(prompt || "Imagem gerada pela Aurora").slice(0, 180);
  const lower = text.toLowerCase();
  const isDog = /\b(cachorro|cao|cão|dog|filhote)\b/.test(lower);
  const title = escapeHtml(isDog ? "Cachorro gerado pela Aurora" : "Imagem gerada pela Aurora");
  const subtitle = escapeHtml(text);
  const subject = isDog
    ? `<ellipse cx="400" cy="330" rx="122" ry="90" fill="#c98b5a"/>
      <circle cx="310" cy="250" r="58" fill="#d49a68"/>
      <circle cx="490" cy="250" r="58" fill="#d49a68"/>
      <circle cx="400" cy="250" r="92" fill="#dfaa78"/>
      <ellipse cx="365" cy="240" rx="13" ry="17" fill="#17191c"/>
      <ellipse cx="435" cy="240" rx="13" ry="17" fill="#17191c"/>
      <ellipse cx="400" cy="272" rx="22" ry="16" fill="#17191c"/>
      <path d="M380 300 Q400 318 420 300" fill="none" stroke="#17191c" stroke-width="8" stroke-linecap="round"/>
      <path d="M285 298 Q230 365 258 430" fill="none" stroke="#dfaa78" stroke-width="28" stroke-linecap="round"/>
      <path d="M515 298 Q570 365 542 430" fill="none" stroke="#dfaa78" stroke-width="28" stroke-linecap="round"/>
      <ellipse cx="350" cy="430" rx="34" ry="20" fill="#f1caa0"/>
      <ellipse cx="450" cy="430" rx="34" ry="20" fill="#f1caa0"/>`
    : `<rect x="255" y="190" width="290" height="220" rx="38" fill="#43c59e"/>
      <circle cx="345" cy="285" r="34" fill="#0f1316"/>
      <circle cx="455" cy="285" r="34" fill="#0f1316"/>
      <path d="M340 350 Q400 390 460 350" fill="none" stroke="#0f1316" stroke-width="16" stroke-linecap="round"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" role="img" aria-label="${title}">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#101214"/>
        <stop offset="55%" stop-color="#18251f"/>
        <stop offset="100%" stop-color="#0f1316"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#bg)"/>
    <circle cx="160" cy="120" r="70" fill="#43c59e" opacity="0.24"/>
    <circle cx="665" cy="130" r="92" fill="#e7b85b" opacity="0.18"/>
    <ellipse cx="400" cy="455" rx="210" ry="42" fill="#050607" opacity="0.32"/>
    ${subject}
    <text x="400" y="535" text-anchor="middle" fill="#edf1f5" font-family="Arial, sans-serif" font-size="24" font-weight="700">${title}</text>
    <text x="400" y="565" text-anchor="middle" fill="#9eaab4" font-family="Arial, sans-serif" font-size="14">${subtitle}</text>
  </svg>`;
}

async function createLocalImage({ prompt, fileName = "" }) {
  const imageDir = path.join(generatedDir, "images");
  await mkdir(imageDir, { recursive: true });
  const baseName = slugifyFileName(fileName || prompt || "imagem-aurora", "imagem-aurora");
  const fullPath = path.join(imageDir, `${baseName}.svg`);
  const svg = buildSimpleSvgImage(prompt);
  await writeFile(fullPath, svg, "utf8");
  return {
    path: toRelative(fullPath),
    url: `/${toRelative(fullPath).replaceAll("\\", "/").replace(/^ai-assistant\//, "")}`,
    type: "image/svg+xml",
    size: Buffer.byteLength(svg, "utf8")
  };
}

async function createBestImage({ prompt, fileName = "", provider = "" }) {
  const forcedProvider = normalizeProviderName(provider);
  if (forcedProvider === "ollama" || provider === "svg") {
    const image = await createLocalImage({ prompt, fileName });
    return {
      image,
      message: `Criei uma imagem SVG local e mostrei aqui no chat.\n\nArquivo: ${image.path}\nPreview: ${image.url}`,
      fallback: ""
    };
  }

  const preferBitmap = wantsBitmapImage(prompt) || Boolean(geminiApiKey);
  try {
    const image = await createComfyImage({ prompt });
    return {
      image,
      message: `Criei uma imagem real com ComfyUI e mostrei aqui no chat.\n\nArquivo: ${image.path}\nPreview: ${image.url}\nModelo: ${image.checkpoint}`,
      fallback: ""
    };
  } catch (error) {
    if (preferBitmap && geminiApiKey) {
      try {
        const image = await createGeminiImage({ prompt, fileName });
        return {
          image,
          message: `Criei uma imagem com Gemini Image/Nano Banana e mostrei aqui no chat.\n\nArquivo: ${image.path}\nPreview: ${image.url}\nModelo: ${image.model}`,
          fallback: `ComfyUI indisponivel: ${error.message}`
        };
      } catch (geminiError) {
        const comfyMessage = compactImageError(error);
        const geminiMessage = compactImageError(geminiError);
        const image = await createLocalImage({ prompt, fileName });
        return {
          image,
          message: `Ainda nao consegui gerar PNG/JPEG real.\n\nComfyUI: ${comfyMessage}\nGemini Image: ${geminiMessage}\n\nMostrei um fallback SVG simples por enquanto.\n\nArquivo: ${image.path}\nPreview: ${image.url}`,
          fallback: `ComfyUI: ${comfyMessage} | Gemini Image: ${geminiMessage}`
        };
      }
    }
    const image = await createLocalImage({ prompt, fileName });
    return {
      image,
      message: preferBitmap
        ? `Ainda nao consegui gerar JPEG/PNG real porque o ComfyUI nao esta pronto: ${error.message}\n\nMostrei um fallback SVG simples por enquanto.\n\nArquivo: ${image.path}\nPreview: ${image.url}`
        : `Criei uma imagem SVG local e mostrei aqui no chat.\n\nArquivo: ${image.path}\nPreview: ${image.url}`,
      fallback: error.message
    };
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const safePath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(publicDir, safePath));

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    const ext = path.extname(filePath);
    const contentType = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8"
    }[ext] || "application/octet-stream";
    res.writeHead(200, { "content-type": contentType });
    res.end(file);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

async function serveGenerated(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const relativePath = decodeURIComponent(url.pathname.replace(/^\/generated\//, ""));
  const filePath = path.normalize(path.join(generatedDir, relativePath));

  if (!filePath.startsWith(generatedDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    const ext = path.extname(filePath);
    const contentType = {
      ".svg": "image/svg+xml; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".html": "text/html; charset=utf-8",
      ".md": "text/markdown; charset=utf-8",
      ".csv": "text/csv; charset=utf-8"
    }[ext] || "application/octet-stream";
    res.writeHead(200, { "content-type": contentType });
    res.end(file);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

async function handleModels(res) {
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`);
    if (!response.ok) throw new Error(`Ollama respondeu ${response.status}`);
    const data = await response.json();
    sendJson(res, 200, {
      online: true,
      defaultModel,
      models: data.models?.map((model) => model.name) || []
    });
  } catch (error) {
    sendJson(res, 200, {
      online: false,
      defaultModel,
      models: [],
      error: error.message
    });
  }
}

function rankInstalledModel(models, candidates) {
  const normalized = models.map((model) => ({ model, lower: model.toLowerCase() }));
  for (const candidate of candidates) {
    const exact = normalized.find((item) => item.lower === candidate.toLowerCase());
    if (exact) return exact.model;
  }
  for (const candidate of candidates) {
    const fuzzy = normalized.find((item) => item.lower.includes(candidate.toLowerCase()));
    if (fuzzy) return fuzzy.model;
  }
  return "";
}

function buildModelAdvisor({ models = [], defaultModel: fallbackDefault = defaultModel, routes = {} }) {
  const installed = Array.isArray(models) ? models : [];
  const codeModel = rankInstalledModel(installed, [
    "qwen2.5-coder:14b",
    "qwen2.5-coder:7b",
    "deepseek-coder:6.7b",
    "codellama:7b",
    "llama3.1:8b",
    fallbackDefault
  ]);
  const architectModel = rankInstalledModel(installed, [
    "deepseek-r1:14b",
    "llama3.1:8b",
    "qwen2.5-coder:14b",
    "qwen2.5-coder:7b",
    fallbackDefault
  ]);
  const generalModel = rankInstalledModel(installed, [
    "llama3.1:8b",
    "llama3.2:3b",
    "qwen2.5-coder:7b",
    fallbackDefault
  ]);
  const fastModel = rankInstalledModel(installed, [
    "qwen2.5-coder:7b",
    "llama3.2:3b",
    "deepseek-coder:6.7b",
    fallbackDefault
  ]);
  const recommendedRoutes = {
    generalModel: generalModel || installed[0] || fallbackDefault,
    codeModel: codeModel || installed[0] || fallbackDefault,
    databaseModel: codeModel || installed[0] || fallbackDefault,
    architectModel: architectModel || installed[0] || fallbackDefault,
    fallbackModel: fastModel || installed[0] || fallbackDefault
  };
  const installPlan = [
    { model: "qwen2.5-coder:7b", use: "programacao rapida e banco de dados" },
    { model: "qwen2.5-coder:14b", use: "programacao mais dificil quando o PC aguentar" },
    { model: "deepseek-r1:14b", use: "raciocinio, arquitetura e planejamento" },
    { model: "llama3.1:8b", use: "conversa geral e arquitetura leve" }
  ].map((item) => ({
    ...item,
    installed: installed.some((model) => model.toLowerCase() === item.model.toLowerCase()),
    command: `ollama pull ${item.model}`
  }));
  const installedSet = new Set(installed.map((model) => model.toLowerCase()));
  const notes = [];
  if (!installed.length) notes.push("Ollama nao retornou modelos instalados.");
  if (!installedSet.has("qwen2.5-coder:7b")) notes.push("Instale qwen2.5-coder:7b para melhorar programacao sem pesar demais.");
  if (!installedSet.has("qwen2.5-coder:14b")) notes.push("No PC com RTX 3060 12 GB, teste qwen2.5-coder:14b para tarefas dificeis.");
  if (!installedSet.has("deepseek-r1:14b")) notes.push("Teste deepseek-r1:14b para raciocinio e arquitetura, aceitando respostas mais lentas.");

  return {
    installed,
    currentRoutes: routes,
    recommendedRoutes,
    installPlan,
    notes,
    profiles: [
      { name: "Agil", description: "Prioriza velocidade para tarefas do dia a dia.", routes: { ...recommendedRoutes, codeModel: fastModel || recommendedRoutes.codeModel, databaseModel: fastModel || recommendedRoutes.databaseModel } },
      { name: "Forte", description: "Prioriza qualidade em programacao e banco.", routes: recommendedRoutes }
    ]
  };
}

async function getOllamaStatus() {
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`);
    if (!response.ok) throw new Error(`Ollama respondeu ${response.status}`);
    const data = await response.json();
    return { online: true, models: data.models?.map((model) => model.name) || [], error: "" };
  } catch (error) {
    return { online: false, models: [], error: error.message };
  }
}

async function handleModelAdvisor(req, res) {
  try {
    const modelsResponse = await fetch(`${ollamaUrl}/api/tags`);
    if (!modelsResponse.ok) throw new Error(`Ollama respondeu ${modelsResponse.status}`);
    const data = await modelsResponse.json();
    const routes = await readModelRoutes();
    const advisor = buildModelAdvisor({
      models: data.models?.map((model) => model.name) || [],
      defaultModel,
      routes
    });
    sendJson(res, 200, advisor);
  } catch (error) {
    sendJson(res, 200, buildModelAdvisor({ models: [], defaultModel, routes: await readModelRoutes() }));
  }
}

async function handleChat(req, res) {
  const body = await readJsonBody(req);
  const latestUserMessage = [...(body.messages || [])].reverse().find((message) => message.role === "user")?.content || "";
  if (isImageRequest(latestUserMessage)) {
    const result = await createBestImage({ prompt: latestUserMessage, provider: body.imageProvider });
    sendJson(res, 200, {
      message: result.message,
      image: result.image,
      fallback: result.fallback
    });
    return;
  }

  const context = await buildAssistantContext({
    mode: body.mode,
    fileContext: body.fileContext
  });

  const messages = [
    { role: "system", content: context },
    ...(body.messages || [])
  ];

  try {
    const route = chooseAiProvider({
      requestedProvider: body.provider,
      explicitModel: body.model,
      mode: body.mode,
      latestUserMessage
    });
    const attempts = [];
    for (const provider of buildProviderFallbacks(route.provider, route.taskKind)) {
      const model = provider === "ollama"
        ? await chooseModel(provider === route.provider ? route.model || body.model : "", body.mode)
        : provider === "openrouter"
          ? openRouterModel
          : geminiModel;
      try {
        const message = await callAiChat({ provider, model, messages });
        sendJson(res, 200, {
          message,
          provider,
          model,
          taskKind: route.taskKind,
          fallbackFrom: attempts.length ? route.provider : "",
          attempts
        });
        return;
      } catch (error) {
        attempts.push({
          provider,
          model,
          error: compactProviderError(error)
        });
      }
    }
    throw new Error(attempts.map((item) => `${providerDisplayName(item.provider)}: ${item.error}`).join(" | "));
  } catch (error) {
    sendJson(res, 500, {
      error: "Nao consegui conversar com o provedor de IA.",
      detail: error.message
    });
  }
}

async function handleCreateImage(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const prompt = String(body.prompt || "").trim();
    if (!prompt) {
      sendJson(res, 400, { error: "Descreva a imagem que voce quer criar." });
      return;
    }
    const result = await createBestImage({ prompt, fileName: body.fileName, provider: body.provider || body.imageProvider });
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui criar a imagem.", detail: error.message });
  }
}

function handleAiProviders(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }
  sendJson(res, 200, buildAiProviderStatus());
}

async function handleImageProviders(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }
  const comfy = await checkComfyUiStatus();
  sendJson(res, 200, {
    providers: [
      {
        id: "comfyui",
        name: "ComfyUI",
        configured: comfy.online && comfy.checkpoints.length > 0,
        online: comfy.online,
        url: comfy.url,
        checkpoints: comfy.checkpoints,
        error: comfy.error || "",
        notes: comfy.online
          ? comfy.checkpoints.length ? "Pronto para gerar PNG local." : "ComfyUI online, mas falta modelo/checkpoint."
          : "ComfyUI offline. Use scripts/Instalar-ComfyUI-Aurora.ps1 e depois scripts/Iniciar-ComfyUI-Aurora.ps1."
      },
      {
        id: "gemini-image",
        name: "Gemini Image / Nano Banana",
        configured: Boolean(geminiApiKey),
        online: Boolean(geminiApiKey),
        url: "https://generativelanguage.googleapis.com",
        checkpoints: [geminiImageModel],
        error: geminiApiKey ? "" : "GEMINI_API_KEY nao configurada.",
        notes: "Gera PNG de melhor qualidade via Gemini. Pode ter cotas ou custo conforme a chave."
      },
      {
        id: "svg-fallback",
        name: "SVG local",
        configured: true,
        online: true,
        url: "/generated/images",
        checkpoints: [],
        error: "",
        notes: "Fallback simples embutido na Aurora."
      }
    ]
  });
}

async function callOllamaChat({ model, messages, temperature = 0.7, timeoutMs = 120_000 }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: model || defaultModel,
        messages,
        stream: false,
        options: {
          temperature,
          num_ctx: 8192
        }
      })
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Ollama demorou mais de ${Math.round(timeoutMs / 1000)} segundos para responder.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Ollama respondeu ${response.status}`);
  }

  const data = await response.json();
  return data.message?.content || "";
}

async function callAiChat({ provider, model, messages, temperature = 0.7 }) {
  if (provider === "openrouter") return callOpenRouterChat({ model, messages, temperature });
  if (provider === "gemini") return callGeminiChat({ model, messages, temperature });
  return callOllamaChat({ model, messages, temperature });
}

async function callOpenRouterChat({ model, messages, temperature = 0.7, timeoutMs = 120_000 }) {
  if (!openRouterApiKey) {
    throw new Error("OPENROUTER_API_KEY nao configurada no ambiente.");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "authorization": `Bearer ${openRouterApiKey}`,
        "content-type": "application/json",
        "http-referer": "http://localhost:3123",
        "x-title": "Aurora Local"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: model || openRouterModel,
        messages: messages.map((message) => ({
          role: message.role === "assistant" ? "assistant" : message.role === "system" ? "system" : "user",
          content: String(message.content || "")
        })),
        temperature
      })
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`OpenRouter demorou mais de ${Math.round(timeoutMs / 1000)} segundos para responder.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `OpenRouter respondeu ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callGeminiChat({ model, messages, temperature = 0.7, timeoutMs = 120_000 }) {
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY ou GOOGLE_API_KEY nao configurada no ambiente.");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const systemMessages = messages.filter((message) => message.role === "system").map((message) => message.content).join("\n\n");
  const contents = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: String(message.content || "") }]
    }));

  let response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model || geminiModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: systemMessages ? { parts: [{ text: systemMessages }] } : undefined,
        contents,
        generationConfig: {
          temperature
        }
      })
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Gemini demorou mais de ${Math.round(timeoutMs / 1000)} segundos para responder.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Gemini respondeu ${response.status}`);
  }

  const data = await response.json();
  return (data.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function handleMemory(req, res) {
  if (req.method === "GET") {
    sendJson(res, 200, await readMemory());
    return;
  }

  const body = await readJsonBody(req);
  const memory = await readMemory();
  const text = String(body.text || "").trim();

  if (!text) {
    sendJson(res, 400, { error: "Texto de memoria vazio." });
    return;
  }

  memory.notes.unshift({
    id: crypto.randomUUID(),
    text,
    createdAt: new Date().toISOString()
  });

  memory.notes = memory.notes.slice(0, 100);
  await saveMemory(memory);
  sendJson(res, 200, memory);
}

async function listFiles(dir, depth = 0) {
  if (depth > 3) return [];

  const entries = await readdir(dir, { withFileTypes: true });
  const visible = entries
    .filter((entry) => !entry.name.startsWith(".") && !codeMapIgnoredDirs.has(entry.name))
    .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));

  const items = [];
  for (const entry of visible.slice(0, 120)) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = toRelative(fullPath);

    if (entry.isDirectory()) {
      items.push({
        type: "dir",
        name: entry.name,
        path: relativePath,
        children: await listFiles(fullPath, depth + 1)
      });
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (textExtensions.has(ext)) {
      const info = await stat(fullPath);
      items.push({
        type: "file",
        name: entry.name,
        path: relativePath,
        size: info.size
      });
    }
  }

  return items;
}

async function searchFiles(dir, query, results = [], depth = 0) {
  if (results.length >= searchMaxResults || depth > 5) return results;

  const entries = await readdir(dir, { withFileTypes: true });
  const visible = entries
    .filter((entry) => !entry.name.startsWith(".") && !ignoredDirs.has(entry.name))
    .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));

  for (const entry of visible) {
    if (results.length >= searchMaxResults) break;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await searchFiles(fullPath, query, results, depth + 1);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!textExtensions.has(ext)) continue;

    const info = await stat(fullPath);
    if (info.size > searchMaxFileSize) continue;

    const relativePath = toRelative(fullPath);
    const lowerPath = relativePath.toLowerCase();
    const pathMatch = lowerPath.includes(query);
    let snippet = "";

    if (!pathMatch) {
      const content = await readFile(fullPath, "utf8");
      const lowerContent = content.toLowerCase();
      const index = lowerContent.indexOf(query);
      if (index < 0) continue;

      const start = Math.max(0, index - 90);
      const end = Math.min(content.length, index + query.length + 140);
      snippet = content.slice(start, end).replace(/\s+/g, " ").trim();
    }

    results.push({
      path: relativePath,
      name: entry.name,
      size: info.size,
      match: pathMatch ? "path" : "content",
      snippet
    });
  }

  return results;
}

async function collectResourceFiles(dir, rootDir, statsData, depth = 0) {
  if (depth > 7 || statsData.totalFiles >= 2500) return;

  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (statsData.totalFiles >= 2500) break;
    if (entry.name.startsWith(".") || ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectResourceFiles(fullPath, rootDir, statsData, depth + 1);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase() || "(sem extensao)";
    const relativePath = path.relative(rootDir, fullPath).replaceAll(path.sep, "/");
    statsData.totalFiles += 1;
    statsData.byExtension[ext] = (statsData.byExtension[ext] || 0) + 1;
    if (ext === ".ipynb" && statsData.notebooks.length < 20) statsData.notebooks.push(relativePath);
    if (ext === ".md" && statsData.markdowns.length < 20) statsData.markdowns.push(relativePath);
    if ([".csv", ".json", ".txt"].includes(ext) && statsData.dataFiles.length < 20) statsData.dataFiles.push(relativePath);
  }
}

function extractMarkdownHeadings(text, limit = 16) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.match(/^(#{1,3})\s+(.+)$/)?.[2]?.replace(/[#*_`:[\]()]/g, "").trim())
    .filter(Boolean)
    .slice(0, limit);
}

async function collectWebsiteFiles(dir, rootDir, files = [], depth = 0) {
  if (depth > 7 || files.length >= 180) return files;

  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    if (files.length >= 180) break;
    if (entry.name.startsWith(".") || ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectWebsiteFiles(fullPath, rootDir, files, depth + 1);
      continue;
    }

    const name = entry.name.toLowerCase();
    const ext = path.extname(name).toLowerCase();
    const isWebFile = [".html", ".css", ".js", ".mjs", ".jsx", ".ts", ".tsx", ".json"].includes(ext)
      || ["package.json", "vite.config.js", "next.config.js", "tailwind.config.js", "astro.config.mjs"].includes(name);
    if (!isWebFile) continue;

    const info = await stat(fullPath);
    if (info.size > searchMaxFileSize) continue;
    files.push({
      path: path.relative(rootDir, fullPath).replaceAll(path.sep, "/"),
      fullPath,
      name,
      ext: ext || "(sem extensao)",
      size: info.size
    });
  }

  return files;
}

function uniqueLimited(values, limit = 12) {
  return [...new Set(values.filter(Boolean))].slice(0, limit);
}

function detectWebsiteFrameworks(files, packageJson, contentBundle) {
  const deps = {
    ...packageJson?.dependencies,
    ...packageJson?.devDependencies
  };
  const names = Object.keys(deps || {});
  const lower = contentBundle.toLowerCase();
  const frameworks = [];

  for (const [name, tests] of [
    ["React", ["react", "react-dom", "jsx"]],
    ["Next.js", ["next", "next.config"]],
    ["Vue", ["vue", "createapp("]],
    ["Nuxt", ["nuxt", "nuxt.config"]],
    ["Svelte", ["svelte", "sveltekit"]],
    ["Astro", ["astro", "astro.config"]],
    ["Vite", ["vite", "vite.config"]],
    ["Tailwind CSS", ["tailwindcss", "tailwind.config", "@tailwind"]],
    ["Bootstrap", ["bootstrap", "btn btn-", "container-fluid"]],
    ["Three.js", ["three", "three.js"]]
  ]) {
    if (tests.some((test) => names.includes(test) || lower.includes(test))) frameworks.push(name);
  }

  if (files.some((file) => file.name === "package.json")) frameworks.push("Node/npm");
  if (files.some((file) => file.ext === ".html") && !frameworks.length) frameworks.push("HTML/CSS/JS estatico");
  return uniqueLimited(frameworks, 10);
}

function inferLayoutPatterns(contentBundle) {
  const lower = contentBundle.toLowerCase();
  const patterns = [];
  if (lower.includes("display: grid") || lower.includes("grid-template")) patterns.push("layouts em CSS Grid");
  if (lower.includes("display: flex") || lower.includes("flex-direction")) patterns.push("alinhamento com Flexbox");
  if (lower.includes("@media")) patterns.push("responsividade com media queries");
  if (lower.includes("position: sticky") || lower.includes("position: fixed")) patterns.push("navegacao fixa/sticky");
  if (/<(header|main|section|article|footer|nav)\b/i.test(contentBundle)) patterns.push("HTML semantico por secoes");
  if (/class=["'][^"']*(card|panel|tile|item)/i.test(contentBundle)) patterns.push("componentes visuais reutilizaveis");
  if (/aria-[a-z]+|role=["']/i.test(contentBundle)) patterns.push("sinais de acessibilidade");
  return uniqueLimited(patterns, 12);
}

function inferComponentHints(contentBundle) {
  const classes = [];
  for (const match of contentBundle.matchAll(/class(?:Name)?=["']([^"']+)["']/g)) {
    classes.push(...match[1].split(/\s+/).filter((name) => /^(app|nav|hero|card|panel|modal|toast|form|input|btn|button|toolbar|sidebar|grid|list|item|footer|header|section)/i.test(name)));
  }
  return uniqueLimited(classes.map((item) => item.replace(/[{}]/g, "")), 16);
}

function extractDesignTokens(contentBundle) {
  const colors = uniqueLimited(contentBundle.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\)/gi) || [], 18);
  const fonts = [];
  for (const match of contentBundle.matchAll(/font-family\s*:\s*([^;}{]+)/gi)) {
    fonts.push(match[1].replace(/["']/g, "").trim());
  }
  return { colors, fonts: uniqueLimited(fonts, 8) };
}

function inferArchitectureLessons({ frameworks, layoutPatterns, pages, cssFiles, jsFiles, designTokens }) {
  const lessons = [];
  if (frameworks.length) lessons.push(`Comecar projetos parecidos definindo stack: ${frameworks.slice(0, 4).join(", ")}.`);
  if (pages.length > 1) lessons.push("Mapear paginas primeiro e criar navegacao antes de detalhar componentes.");
  if (cssFiles.length) lessons.push("Separar tokens visuais, layout responsivo e estados de componente em CSS organizado.");
  if (jsFiles.length) lessons.push("Isolar comportamento interativo em modulos pequenos ligados aos elementos da interface.");
  if (layoutPatterns.length) lessons.push(`Reutilizar padroes detectados: ${layoutPatterns.slice(0, 4).join(", ")}.`);
  if (designTokens.colors.length || designTokens.fonts.length) lessons.push("Extrair paleta e tipografia como referencia, sem copiar marca, textos ou assets.");
  return uniqueLimited(lessons, 8);
}

async function analyzeWebsiteArchitecture(rootPath, statsData) {
  const files = await collectWebsiteFiles(rootPath, rootPath);
  const htmlFiles = files.filter((file) => file.ext === ".html");
  const cssFiles = files.filter((file) => file.ext === ".css").map((file) => file.path).slice(0, 20);
  const jsFiles = files.filter((file) => [".js", ".mjs", ".jsx", ".ts", ".tsx"].includes(file.ext)).map((file) => file.path).slice(0, 20);
  const packagePath = files.find((file) => file.name === "package.json")?.fullPath;
  let packageJson = {};
  if (packagePath) {
    try {
      packageJson = JSON.parse(await readFile(packagePath, "utf8"));
    } catch {
      packageJson = {};
    }
  }

  const sampled = [];
  for (const file of files.filter((item) => item.ext !== ".json").slice(0, 60)) {
    try {
      sampled.push(await readFile(file.fullPath, "utf8"));
    } catch {
      // Ignore unreadable reference files.
    }
  }
  const contentBundle = sampled.join("\n").slice(0, 500_000);
  const pages = [];
  for (const file of htmlFiles.slice(0, 30)) {
    let title = "";
    try {
      const html = await readFile(file.fullPath, "utf8");
      title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || "";
    } catch {
      title = "";
    }
    pages.push({ path: file.path, title });
  }

  const frameworks = detectWebsiteFrameworks(files, packageJson, contentBundle);
  const layoutPatterns = inferLayoutPatterns(contentBundle);
  const componentHints = inferComponentHints(contentBundle);
  const designTokens = extractDesignTokens(contentBundle);
  const assetHints = Object.entries(statsData.byExtension || {})
    .filter(([ext]) => [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".mp4", ".webm"].includes(ext))
    .sort((a, b) => b[1] - a[1])
    .map(([ext, count]) => `${ext}: ${count}`)
    .slice(0, 8);
  const routingHints = uniqueLimited([
    ...pages.map((page) => page.path),
    ...files.filter((file) => /routes?|pages?|app\//i.test(file.path)).map((file) => file.path)
  ], 20);
  const isWebsite = Boolean(htmlFiles.length || cssFiles.length || jsFiles.length || frameworks.length);
  const architectureLessons = inferArchitectureLessons({
    frameworks,
    layoutPatterns,
    pages,
    cssFiles,
    jsFiles,
    designTokens
  });

  return {
    isWebsite,
    pages,
    cssFiles,
    jsFiles,
    frameworks,
    layoutPatterns,
    componentHints,
    assetHints,
    routingHints,
    designTokens,
    architectureLessons,
    note: "Use como referencia de arquitetura e padroes. Nao copie textos, marcas, imagens ou codigo proprietario sem permissao."
  };
}

async function scanResourceFolder(rawPath, title = "") {
  const rootPath = path.resolve(String(rawPath || "").trim());
  if (!rootPath || !existsSync(rootPath)) {
    throw new Error("Pasta da biblioteca nao encontrada.");
  }

  const info = await stat(rootPath);
  if (!info.isDirectory()) {
    throw new Error("Informe uma pasta, nao um arquivo.");
  }

  const entries = await readdir(rootPath, { withFileTypes: true });
  const topFolders = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith(".")).map((entry) => entry.name).slice(0, 20);
  const readmePath = path.join(rootPath, "README.md");
  const requirementsPath = path.join(rootPath, "requirements.txt");
  const readme = existsSync(readmePath) ? await readFile(readmePath, "utf8") : "";
  const requirements = existsSync(requirementsPath)
    ? (await readFile(requirementsPath, "utf8")).split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    : [];
  const temasPath = path.join(rootPath, "Temas");
  const modules = existsSync(temasPath)
    ? (await readdir(temasPath, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).slice(0, 20)
    : topFolders;
  const statsData = { totalFiles: 0, byExtension: {}, notebooks: [], markdowns: [], dataFiles: [] };
  await collectResourceFiles(rootPath, rootPath, statsData);
  const siteIntelligence = await analyzeWebsiteArchitecture(rootPath, statsData);
  const headings = extractMarkdownHeadings(readme);
  const finalTitle = String(title || headings[0] || path.basename(rootPath)).trim().slice(0, 120);
  const summaryParts = [
    `${statsData.totalFiles} arquivos mapeados`,
    `${statsData.byExtension[".ipynb"] || 0} notebooks`,
    `${modules.length} modulos/pastas principais`
  ];
  if (requirements.length) summaryParts.push(`requisitos: ${requirements.slice(0, 6).join(", ")}`);

  return {
    id: crypto.randomUUID(),
    title: finalTitle,
    path: rootPath,
    summary: summaryParts.join("; "),
    topFolders,
    modules,
    headings,
    requirements,
    stats: statsData,
    siteIntelligence,
    updatedAt: new Date().toISOString()
  };
}

const securityAuditRules = [
  {
    id: "possible-secret",
    severity: "high",
    title: "Possivel segredo hardcoded",
    pattern: /\b(api[_-]?key|secret|token|password|senha|private[_-]?key)\b\s*[:=]\s*["'][^"']{8,}["']/i,
    advice: "Mover segredos para variaveis de ambiente ou armazenamento seguro. Nao versionar tokens."
  },
  {
    id: "dynamic-eval",
    severity: "high",
    title: "Execucao dinamica de codigo",
    pattern: /\b(eval|new Function)\s*\(/,
    advice: "Evitar execucao dinamica; trocar por parser/validador explicito ou tabela de funcoes permitidas."
  },
  {
    id: "shell-exec",
    severity: "medium",
    title: "Execucao de comando",
    pattern: /(?<!\.)\b(exec|execSync|spawn|spawnSync|execFile|execFileSync|Start-Process)\b/,
    advice: "Usar allowlist, argumentos separados e nunca montar comando com entrada do usuario."
  },
  {
    id: "sql-write",
    severity: "medium",
    title: "SQL de escrita/destrutivo",
    pattern: /\b(DELETE\s+FROM|DROP\s+TABLE|ALTER\s+TABLE|UPDATE\s+\w+|INSERT\s+INTO)\b/i,
    advice: "Confirmar permissoes, backups, transacoes e testes de bloqueio para comandos destrutivos."
  },
  {
    id: "path-sensitive",
    severity: "medium",
    title: "Manipulacao de caminho/arquivo",
    pattern: /\b(readFile|writeFile|unlink|rmSync|Remove-Item|path\.join|path\.resolve)\b/,
    advice: "Garantir normalizacao, bloqueio fora do workspace, limite de tamanho e extensoes permitidas."
  },
  {
    id: "broad-cors",
    severity: "low",
    title: "CORS permissivo",
    pattern: /access-control-allow-origin["']?\s*[:,]\s*["']\*/i,
    advice: "Restringir origens quando houver dados sensiveis ou rede externa."
  },
  {
    id: "debug-log",
    severity: "low",
    title: "Log/debug",
    pattern: /\b(console\.log|debugger)\b/,
    advice: "Revisar se logs podem expor dados sensiveis antes de entregar."
  }
];

function scanContentForSecurity(content, relativePath) {
  const findings = [];
  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (
      trimmed.startsWith("import ") ||
      trimmed.startsWith("const __dirname") ||
      /^const \w+Dir = path\.join\(__dirname/.test(trimmed) ||
      /^const \w+File = path\.join\(dataDir/.test(trimmed)
    ) {
      continue;
    }

    for (const rule of securityAuditRules) {
      if (!rule.pattern.test(line)) continue;
      findings.push({
        ruleId: rule.id,
        severity: rule.severity,
        title: rule.title,
        path: relativePath,
        line: index + 1,
        snippet: line.trim().slice(0, 220),
        advice: rule.advice
      });
    }
  }
  return findings;
}

async function runSecurityAudit(dir, findings = [], stats = { scannedFiles: 0, skippedLargeFiles: 0 }, depth = 0) {
  if (findings.length >= securityAuditMaxFindings || stats.scannedFiles >= securityAuditMaxFiles || depth > 5) {
    return { findings, stats };
  }

  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries.filter((item) => !item.name.startsWith(".") && !ignoredDirs.has(item.name))) {
    if (findings.length >= securityAuditMaxFindings || stats.scannedFiles >= securityAuditMaxFiles) break;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await runSecurityAudit(fullPath, findings, stats, depth + 1);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!textExtensions.has(ext)) continue;
    const info = await stat(fullPath);
    if (info.size > searchMaxFileSize) {
      stats.skippedLargeFiles += 1;
      continue;
    }

    const relativePath = toRelative(fullPath);
    const content = await readFile(fullPath, "utf8");
    stats.scannedFiles += 1;
    findings.push(...scanContentForSecurity(content, relativePath));
  }

  return { findings, stats };
}

async function collectPortableStats(targetPath, depth = 0) {
  if (!existsSync(targetPath) || depth > 8) return { exists: false, files: 0, folders: 0, bytes: 0 };

  const info = await stat(targetPath);
  if (info.isFile()) return { exists: true, files: 1, folders: 0, bytes: info.size };
  if (!info.isDirectory()) return { exists: true, files: 0, folders: 0, bytes: 0 };

  const totals = { exists: true, files: 0, folders: 1, bytes: 0 };
  const entries = await readdir(targetPath, { withFileTypes: true });
  for (const entry of entries.filter((item) => !portableIgnoredDirs.has(item.name))) {
    const child = await collectPortableStats(path.join(targetPath, entry.name), depth + 1);
    totals.files += child.files;
    totals.folders += child.folders;
    totals.bytes += child.bytes;
  }
  return totals;
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9_]+/)
    .filter((token) => token.length >= 3);
}

async function semanticSearchFiles(dir, query, results = [], depth = 0) {
  if (results.length >= searchMaxResults || depth > 5) return results;
  const queryTokens = new Set(tokenize(query));
  if (!queryTokens.size) return results;

  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries.filter((item) => !item.name.startsWith(".") && !ignoredDirs.has(item.name))) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await semanticSearchFiles(fullPath, query, results, depth + 1);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!textExtensions.has(ext)) continue;
    const info = await stat(fullPath);
    if (info.size > searchMaxFileSize) continue;
    const content = await readFile(fullPath, "utf8");
    const haystack = `${toRelative(fullPath)} ${content.slice(0, 20_000)}`;
    const tokens = new Set(tokenize(haystack));
    let score = 0;
    for (const token of queryTokens) {
      if (tokens.has(token)) score += 1;
    }
    if (score > 0) {
      results.push({
        path: toRelative(fullPath),
        name: entry.name,
        size: info.size,
        score,
        snippet: content.slice(0, 260).replace(/\s+/g, " ").trim()
      });
      results.sort((a, b) => b.score - a.score);
      results.splice(searchMaxResults);
    }
  }
  return results;
}

async function collectIndexFiles(dir, files = [], depth = 0, rootDir = dir) {
  if (depth > 6) return files;

  const entries = await readdir(dir, { withFileTypes: true });
  const visible = entries
    .filter((entry) => !entry.name.startsWith(".") && !ignoredDirs.has(entry.name))
    .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));

  for (const entry of visible) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await collectIndexFiles(fullPath, files, depth + 1, rootDir);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!textExtensions.has(ext)) continue;

    const info = await stat(fullPath);
    if (info.size > indexMaxFileSize) continue;

    files.push({
      path: toRootRelative(fullPath, rootDir),
      name: entry.name,
      ext: ext || "(sem extensao)",
      size: info.size
    });
  }

  return files;
}

function buildProjectIndex(files, rootDir = workspaceDir) {
  const byExtension = {};
  const byTopFolder = {};

  for (const file of files) {
    byExtension[file.ext] = (byExtension[file.ext] || 0) + 1;
    const topFolder = file.path.split("/")[0] || "(raiz)";
    byTopFolder[topFolder] = (byTopFolder[topFolder] || 0) + 1;
  }

  const importantFiles = files
    .filter((file) => {
      const topFolder = file.path.split("/")[0];
      const name = file.name.toLowerCase();
      if (indexNoisyFolders.has(topFolder) && name === "manifest.json") return false;
      return indexInterestingNames.has(name) || file.path.toLowerCase().includes("/readme");
    })
    .slice(0, 80);

  return {
    generatedAt: new Date().toISOString(),
    workspace: rootDir,
    totalFiles: files.length,
    byExtension,
    byTopFolder,
    importantFiles
  };
}

function formatIndexForPrompt(index) {
  if (!index) return "Indice do projeto ainda nao gerado.";

  const folders = Object.entries(index.byTopFolder || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([folder, count]) => `- ${folder}: ${count} arquivos`)
    .join("\n");

  const important = (index.importantFiles || [])
    .slice(0, 25)
    .map((file) => `- ${file.path} (${file.ext}, ${file.size} bytes)`)
    .join("\n");

  return `Gerado em: ${index.generatedAt}
Total indexado: ${index.totalFiles} arquivos
Pastas principais:
${folders || "- Nenhuma pasta"}
Arquivos importantes:
${important || "- Nenhum arquivo importante identificado"}`;
}

function collectMatches(content, patterns, limit = 30) {
  const found = [];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      const value = match[1] || match[0];
      if (value && !found.includes(value)) found.push(value);
      if (found.length >= limit) return found;
    }
  }

  return found;
}

function stripJsTemplateLiterals(content) {
  let output = "";
  let inTemplate = false;
  let escaped = false;

  for (const char of content) {
    if (!inTemplate) {
      if (char === "`") {
        inTemplate = true;
        escaped = false;
        output += " ";
      } else {
        output += char;
      }
      continue;
    }

    if (char === "\n" || char === "\r") {
      output += char;
      escaped = false;
      continue;
    }

    output += " ";
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === "`") {
      inTemplate = false;
    }
  }

  return output;
}

function analyzeCodeFile(file, content) {
  const ext = path.extname(file.path).toLowerCase();

  if (ext === ".js" || ext === ".mjs") {
    const codeOnly = stripJsTemplateLiterals(content);
    return {
      ...file,
      imports: collectMatches(codeOnly, [
        /import\s+.*?\s+from\s+["']([^"']+)["']/g,
        /import\s+["']([^"']+)["']/g,
        /require\(["']([^"']+)["']\)/g
      ], 20),
      functions: collectMatches(codeOnly, [
        /function\s+([A-Za-z0-9_$]+)\s*\(/g,
        /(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z0-9_$]+)\s*=>/g,
        /async\s+function\s+([A-Za-z0-9_$]+)\s*\(/g
      ], 40),
      classes: collectMatches(codeOnly, [/class\s+([A-Za-z0-9_$]+)/g], 20),
      endpoints: collectMatches(codeOnly, [
        /url\.pathname\s*===\s*["']([^"']+)["']/g,
        /(?:app|router)\.(?:get|post|put|patch|delete)\(["']([^"']+)["']/g
      ], 30)
    };
  }

  if (ext === ".cs") {
    return {
      ...file,
      imports: collectMatches(content, [/using\s+([A-Za-z0-9_.]+);/g], 20),
      functions: collectMatches(content, [
        /(?:public|private|protected|internal)?\s*(?:static\s+)?[A-Za-z0-9_<>,\[\]?]+\s+([A-Za-z0-9_]+)\s*\(/g
      ], 40),
      classes: collectMatches(content, [/(?:class|struct|interface)\s+([A-Za-z0-9_]+)/g], 20),
      endpoints: []
    };
  }

  if (ext === ".py") {
    return {
      ...file,
      imports: collectMatches(content, [
        /from\s+([A-Za-z0-9_.]+)\s+import/g,
        /import\s+([A-Za-z0-9_.]+)/g
      ], 20),
      functions: collectMatches(content, [/def\s+([A-Za-z0-9_]+)\s*\(/g], 40),
      classes: collectMatches(content, [/class\s+([A-Za-z0-9_]+)/g], 20),
      endpoints: collectMatches(content, [/@app\.(?:get|post|put|patch|delete)\(["']([^"']+)["']\)/g], 30)
    };
  }

  return { ...file, imports: [], functions: [], classes: [], endpoints: [] };
}

async function collectCodeMapFiles(dir, files = [], depth = 0, rootDir = dir) {
  if (depth > 6) return files;

  const entries = await readdir(dir, { withFileTypes: true });
  const visible = entries
    .filter((entry) => !entry.name.startsWith(".") && !ignoredDirs.has(entry.name))
    .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));

  for (const entry of visible) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await collectCodeMapFiles(fullPath, files, depth + 1, rootDir);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!codeMapExtensions.has(ext)) continue;

    const info = await stat(fullPath);
    if (info.size > codeMapMaxFileSize) continue;

    const relativePath = toRootRelative(fullPath, rootDir);
    const content = await readFile(fullPath, "utf8");
    files.push(analyzeCodeFile({
      path: relativePath,
      name: entry.name,
      ext,
      size: info.size
    }, content));
  }

  return files;
}

function buildCodeMap(files, rootDir = workspaceDir) {
  const byExtension = {};
  const byTopFolder = {};
  const filesWithEndpoints = [];
  const filesWithClasses = [];
  const filesWithManyFunctions = [];

  for (const file of files) {
    byExtension[file.ext] = (byExtension[file.ext] || 0) + 1;
    const topFolder = file.path.split("/")[0] || "(raiz)";
    byTopFolder[topFolder] = (byTopFolder[topFolder] || 0) + 1;
    if (file.endpoints.length) filesWithEndpoints.push(file);
    if (file.classes.length) filesWithClasses.push(file);
    if (file.functions.length >= 5) filesWithManyFunctions.push(file);
  }

  return {
    generatedAt: new Date().toISOString(),
    workspace: rootDir,
    totalFiles: files.length,
    byExtension,
    byTopFolder,
    files,
    highlights: {
      filesWithEndpoints: filesWithEndpoints.slice(0, 30),
      filesWithClasses: filesWithClasses.slice(0, 30),
      filesWithManyFunctions: filesWithManyFunctions.slice(0, 30)
    }
  };
}

function formatCodeMapForPrompt(codeMap) {
  if (!codeMap) return "Mapa de codigo ainda nao gerado.";

  const folders = Object.entries(codeMap.byTopFolder || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([folder, count]) => `- ${folder}: ${count} arquivos de codigo`)
    .join("\n");

  const highlights = (codeMap.files || [])
    .filter((file) => file.functions.length || file.classes.length || file.endpoints.length)
    .slice(0, 30)
    .map((file) => {
      const parts = [];
      if (file.classes.length) parts.push(`classes: ${file.classes.slice(0, 6).join(", ")}`);
      if (file.functions.length) parts.push(`funcoes: ${file.functions.slice(0, 8).join(", ")}`);
      if (file.endpoints.length) parts.push(`endpoints: ${file.endpoints.slice(0, 8).join(", ")}`);
      return `- ${file.path} (${parts.join("; ")})`;
    })
    .join("\n");

  return `Gerado em: ${codeMap.generatedAt}
Total: ${codeMap.totalFiles} arquivos de codigo
Pastas com codigo:
${folders || "- Nenhuma"}
Arquivos relevantes:
${highlights || "- Nenhum destaque"}`;
}

async function buildFastImplementationPlan({ task, mode = "code", fileContext = [] }) {
  const projectProfile = await readProjectProfile();
  const projectIndex = await readProjectIndex();
  const codeMap = await readCodeMap();
  const attachedProject = await readAttachedProject();
  const attachedProjectIndex = await readAttachedProjectIndex();
  const attachedProjectCodeMap = await readAttachedProjectCodeMap();
  const lowerTask = task.toLowerCase();
  const attached = Array.isArray(fileContext) ? fileContext.map((file) => file.path) : [];
  const candidates = new Set(attached);

  for (const file of projectIndex?.importantFiles || []) {
    const pathLower = file.path.toLowerCase();
    if (
      pathLower.includes("ai-assistant") ||
      lowerTask.includes("frontend") && pathLower.includes("public") ||
      lowerTask.includes("backend") && pathLower.includes("server") ||
      lowerTask.includes("readme") && pathLower.includes("readme")
    ) {
      candidates.add(file.path);
    }
  }

  for (const file of codeMap?.files || []) {
    const pathLower = file.path.toLowerCase();
    if (pathLower.includes("ai-assistant/server.js") || pathLower.includes("ai-assistant/public/app.js")) {
      candidates.add(file.path);
    }
  }

  const likelyFiles = [...candidates].slice(0, 10);
  const tests = projectProfile.testCommands || "node --check server.js; node --check public/app.js";

  const plan = `Objetivo
Implementar: ${task}

Arquivos provaveis
${likelyFiles.length ? likelyFiles.map((file) => `- ${file}`).join("\n") : "- Gerar/atualizar indice e mapa de codigo antes de escolher arquivos."}

Passos
1. Confirmar o comportamento esperado e quais dados precisam persistir.
2. Ler os arquivos provaveis e localizar os handlers, funcoes de UI e estruturas de dados existentes.
3. Fazer a menor mudanca funcional no backend primeiro, mantendo limites e validacoes de seguranca.
4. Conectar a interface depois, preservando o fluxo atual de confirmar antes de aplicar alteracoes.
5. Atualizar README e, se houver persistencia nova, documentar o arquivo em data/.

Riscos
- Mudar formato de JSON salvo e quebrar dados existentes.
- Aumentar demais o contexto enviado ao modelo e deixar a Aurora lenta.
- Permitir escrita sem confirmacao ou sem backup.
- Criar UI que funciona no caso feliz, mas nao mostra erros ao usuario.

Testes
- ${tests}
- Testar o endpoint novo via API antes de testar pela interface.
- Recarregar a pagina e confirmar que dados persistentes continuam aparecendo.
- Validar no navegador o fluxo principal e pelo menos um estado de erro.`;

  return { plan, likelyFiles };
}

function detectMissionKind(objective) {
  const lower = objective.toLowerCase();
  if (lower.includes("digimon") || lower.includes("time stranger") || lower.includes("remake") || lower.includes("unity") || lower.includes("jogo") || lower.includes("game") || lower.includes("rpg")) return "game";
  if (lower.includes("site") || lower.includes("web") || lower.includes("landing")) return "web";
  if (lower.includes("excel") || lower.includes("planilha")) return "spreadsheet";
  if (lower.includes("word") || lower.includes("relatorio") || lower.includes("documento")) return "document";
  if (lower.includes("banco") || lower.includes("sql") || lower.includes("sqlite")) return "database";
  return "software";
}

async function buildMissionFromObjective(objective, fileContext = []) {
  const projectProfile = await readProjectProfile();
  const projectIndex = await readProjectIndex();
  const codeMap = await readCodeMap();
  const kind = detectMissionKind(objective);
  const lower = objective.toLowerCase();
  const likelyFiles = new Set(Array.isArray(fileContext) ? fileContext.map((file) => file.path) : []);

  for (const file of projectIndex?.importantFiles || []) {
    const pathLower = file.path.toLowerCase();
    if (
      pathLower.startsWith("ai-assistant/") ||
      kind === "game" && (pathLower.includes("unity") || pathLower.includes("tools") || pathLower.includes("dw3") || pathLower.includes("digimon")) ||
      kind === "web" && (pathLower.includes("public") || pathLower.endsWith(".html") || pathLower.endsWith(".css")) ||
      lower.includes("readme") && pathLower.includes("readme")
    ) {
      likelyFiles.add(file.path);
    }
  }

  for (const file of codeMap?.files || []) {
    const pathLower = file.path.toLowerCase();
    if (
      kind === "game" && (pathLower.includes("tools/") || pathLower.includes("unity/") || pathLower.endsWith(".cs")) ||
      kind === "web" && pathLower.includes("public/") ||
      pathLower.includes("ai-assistant/server.js") ||
      pathLower.includes("ai-assistant/public/app.js")
    ) {
      likelyFiles.add(file.path);
    }
  }

  const baseNeeds = [
    { id: crypto.randomUUID(), priority: "high", status: "pending", text: "Entender objetivo, escopo e resultado esperado." },
    { id: crypto.randomUUID(), priority: "high", status: "pending", text: "Mapear arquivos, ferramentas e dados relevantes antes de alterar algo." },
    { id: crypto.randomUUID(), priority: "medium", status: "pending", text: "Definir testes/validacoes para confirmar que a entrega funcionou." },
    { id: crypto.randomUUID(), priority: "medium", status: "pending", text: "Registrar decisao, progresso e proximos passos para continuar depois." }
  ];

  const kindNeeds = {
    game: [
      "Identificar scripts de ferramentas, assets extraidos, pastas Unity e relatorios existentes.",
      "Separar acoes seguras de leitura/relatorio de acoes que alteram assets ou geram muitos arquivos.",
      "Criar checklist de backup antes de mexer em mapas, sprites, scripts ou dados extraidos."
    ],
    web: [
      "Definir paginas, componentes, formularios, estados e requisitos de responsividade.",
      "Checar seguranca de formularios, rotas, dados sensiveis e dependencias.",
      "Preparar validacao visual no navegador e testes de fluxo principal."
    ],
    spreadsheet: [
      "Definir abas, colunas, formulas, estilos e dados de entrada.",
      "Verificar se a biblioteca Excel formatado esta instalada antes de gerar .xlsx.",
      "Criar versao CSV temporaria quando .xlsx ainda nao estiver disponivel."
    ],
    document: [
      "Definir estrutura do documento, seções, tabelas e formato de saida.",
      "Verificar se docx esta instalado antes de gerar Word nativo.",
      "Criar HTML/Markdown temporario quando .docx ainda nao estiver disponivel."
    ],
    database: [
      "Ler schema, indices e historico SQL antes de sugerir mudancas.",
      "Rodar EXPLAIN em consultas importantes.",
      "Bloquear escrita SQL ate existir confirmacao e backup."
    ],
    software: [
      "Definir contratos, entradas, saidas, arquivos e permissoes necessarias.",
      "Fazer mudancas pequenas com backup e smoke test.",
      "Revisar seguranca e manutencao antes de concluir."
    ]
  }[kind];

  const needs = [
    ...baseNeeds,
    ...kindNeeds.map((text) => ({ id: crypto.randomUUID(), priority: "medium", status: "pending", text }))
  ];

  const actions = [
    { id: crypto.randomUUID(), safe: true, status: "suggested", label: "Gerar/atualizar indice do projeto", endpoint: "/api/project-index", method: "POST" },
    { id: crypto.randomUUID(), safe: true, status: "suggested", label: "Gerar/atualizar mapa de codigo", endpoint: "/api/code-map", method: "POST" },
    { id: crypto.randomUUID(), safe: true, status: "suggested", label: "Rodar auditoria rapida de seguranca no escopo Aurora", endpoint: "/api/security-audit?scope=app", method: "GET" },
    { id: crypto.randomUUID(), safe: true, status: "suggested", label: "Checar manutencao, contexto e permissoes", endpoint: "/api/maintenance", method: "GET" }
  ];

  if (kind === "game") {
    actions.push(
      { id: crypto.randomUUID(), safe: true, status: "suggested", label: "Buscar ferramentas do projeto", endpoint: "/api/search?q=tools", method: "GET" },
      { id: crypto.randomUUID(), safe: true, status: "suggested", label: "Buscar relatorios existentes", endpoint: "/api/search?q=reports", method: "GET" }
    );
  }

  return {
    title: objective.slice(0, 80),
    objective,
    kind,
    priority: kind === "game" ? "high" : "medium",
    needs,
    actions,
    likelyFiles: [...likelyFiles].slice(0, 12),
    context: {
      stack: projectProfile.stack || "",
      database: projectProfile.database || "",
      hasIndex: Boolean(projectIndex),
      hasCodeMap: Boolean(codeMap)
    }
  };
}

function buildGameFeatureSet(objective) {
  const lower = objective.toLowerCase();
  const wantsMonsterRpg = lower.includes("digimon") || lower.includes("monstro") || lower.includes("monster") || lower.includes("criatura") || lower.includes("evolu");
  const wantsTurnBattle = lower.includes("turno") || lower.includes("rpg") || lower.includes("digimon") || lower.includes("time stranger");
  const wants3d = lower.includes("3d") || lower.includes("unity");

  const systems = [
    "loop principal de jogo",
    "controle de cena/tela",
    "mapa inicial exploravel",
    "colisao simples",
    "dialogos/NPCs",
    "inventario",
    "save/load local",
    "menu inicial e pausa",
    "configuracoes",
    "logs de debug para desenvolvimento"
  ];

  if (wantsMonsterRpg) {
    systems.push(
      "banco de criaturas original/temporario",
      "recrutamento/captura",
      "evolucao por nivel ou item",
      "status: vida, energia, ataque, defesa, velocidade",
      "habilidades por criatura",
      "party/equipe do jogador"
    );
  }

  if (wantsTurnBattle) {
    systems.push(
      "batalha em turnos",
      "fila de turnos",
      "IA simples de inimigo",
      "experiencia e nivel",
      "recompensas pos-batalha"
    );
  }

  return {
    style: wants3d ? "3D/Unity ou Three.js" : "2D web/Phaser ou Unity 2D",
    wantsMonsterRpg,
    wantsTurnBattle,
    systems
  };
}

async function buildGameCreatorPlan({ objective, fileContext = [] }) {
  const projectProfile = await readProjectProfile();
  const capabilities = await buildCapabilityStatus();
  const mission = await buildMissionFromObjective(objective, fileContext);
  const features = buildGameFeatureSet(objective);
  const gameCapabilities = capabilities.capabilities.filter((capability) => ["game-2d", "game-3d", "web-test"].includes(capability.id));
  const missingCapabilities = gameCapabilities.filter((capability) => !capability.available);
  const likelyFiles = mission.likelyFiles.length ? mission.likelyFiles : [
    "package.json",
    "src/main.js",
    "src/scenes/BootScene.js",
    "src/scenes/WorldScene.js",
    "src/scenes/BattleScene.js",
    "src/data/creatures.json",
    "src/data/moves.json",
    "src/systems/save.js"
  ];
  const installLines = missingCapabilities.length
    ? missingCapabilities.map((capability) => `- ${capability.name}: ${capability.install}`).join("\n")
    : "- Dependencias de jogo/teste ja parecem suficientes ou serao escolhidas no scaffold.";
  const systems = features.systems.map((system) => `- ${system}`).join("\n");
  const tests = projectProfile.testCommands || "npm run check; npm test";
  const run = projectProfile.runCommands || "npm start";

  const plan = `Modo Criador de Jogos
Objetivo: ${objective}
Estilo sugerido: ${features.style}

Direcao de criacao
- Criar um prototipo jogavel primeiro, com assets temporarios/originais.
- Separar dados de jogo em JSON para facilitar edicao pela Aurora.
- Usar nomes e artes substituiveis quando houver inspiracao em franquias existentes.
- Preparar o projeto para trocar assets depois sem reescrever sistemas.

Primeiro prototipo jogavel
1. Tela inicial.
2. Mapa pequeno com personagem controlavel.
3. Um NPC ou ponto de encontro.
4. Uma batalha basica.
5. Uma criatura inicial e um inimigo.
6. Inventario minimo.
7. Save/load local.
8. Tela de vitoria/derrota.

Sistemas a construir
${systems}

Estrutura de dados sugerida
- creatures.json: id, nome, especie, nivel, atributos, evolucoes, habilidades.
- moves.json: id, nome, tipo, custo, poder, precisao, efeito.
- items.json: id, nome, tipo, efeito, preco.
- maps.json: id, nome, tileset, pontos de spawn, encontros, NPCs.
- saves: jogador, posicao, equipe, inventario, flags de quest.

Arquivos provaveis
${likelyFiles.map((file) => `- ${file}`).join("\n")}

Dependencias e ferramentas
${installLines}

Ordem recomendada
1. Escolher engine: Phaser para 2D web rapido, Unity para remake maior, Three.js para 3D web.
2. Criar scaffold minimo.
3. Criar dados iniciais de criaturas, habilidades e itens.
4. Implementar mapa e controles.
5. Implementar batalha em turno.
6. Implementar save/load.
7. Adicionar UI: menu, party, inventario e dialogo.
8. Rodar validacoes: ${tests}
9. Testar manualmente o fluxo: iniciar, andar, batalhar, ganhar, salvar e carregar.

Comandos conhecidos
- Rodar: ${run}
- Testar: ${tests}

Cuidados de qualidade
- Manter sistemas pequenos e separados.
- Criar logs de desenvolvimento removiveis.
- Evitar acoplar regra de batalha na UI.
- Criar dados mockados primeiro e trocar assets depois.
- Fazer backup antes de alterar projetos Unity ou assets gerados.`;

  return {
    source: "game-creator-local",
    objective,
    kind: "game",
    plan,
    likelyFiles,
    systems: features.systems,
    requiredCapabilities: gameCapabilities,
    missingCapabilities,
    actions: mission.actions,
    needs: mission.needs
  };
}

function normalizeWebProjectOptions(body = {}) {
  const objective = String(body.objective || "").trim();
  const lower = objective.toLowerCase();
  const appType = String(body.appType || "").trim() || (
    lower.includes("dashboard") || lower.includes("admin") ? "dashboard" :
    lower.includes("loja") || lower.includes("ecommerce") || lower.includes("e-commerce") ? "commerce" :
    lower.includes("saas") || lower.includes("assinatura") ? "saas" :
    lower.includes("api") ? "api" :
    "fullstack"
  );

  return {
    objective,
    appType,
    stack: String(body.stack || "next-prisma").trim(),
    database: String(body.database || "postgresql").trim(),
    auth: String(body.auth || "email-rbac").trim(),
    deployment: String(body.deployment || "docker-vps").trim()
  };
}

function buildWebProjectStructure(options) {
  const usesNext = options.stack === "next-prisma";
  const usesViteApi = options.stack === "vite-express";
  const databaseFolder = options.database === "sqlite" ? "data/" : "packages/db/";
  const base = usesNext ? [
    "app/layout.tsx",
    "app/globals.css",
    "app/(public)/page.tsx",
    "app/(app)/dashboard/page.tsx",
    "app/api/health/route.ts",
    "app/api/auth/login/route.ts",
    "app/api/admin/audit/route.ts",
    "components/ui/",
    "components/forms/",
    "lib/auth.ts",
    "lib/audit.ts",
    "lib/db.ts",
    "lib/env.ts",
    "lib/rate-limit.ts",
    "lib/security.ts",
    "middleware.ts"
  ] : usesViteApi ? [
    "apps/web/src/pages/",
    "apps/web/src/components/",
    "apps/web/src/lib/api.ts",
    "apps/api/src/server.ts",
    "apps/api/src/routes/",
    "apps/api/src/middleware/security.ts",
    "apps/api/src/middleware/auth.ts",
    "apps/api/src/config/env.ts"
  ] : [
    "public/index.html",
    "src/server.js",
    "src/routes/",
    "src/middleware/",
    "src/views/"
  ];

  return [
    "README.md",
    ".env.example",
    ".gitignore",
    ".dockerignore",
    "Dockerfile",
    "docker-compose.yml",
    "docs/architecture.md",
    "docs/security.md",
    "docs/database.md",
    "docs/runbook.md",
    databaseFolder,
    `${databaseFolder}schema/`,
    `${databaseFolder}migrations/`,
    `${databaseFolder}seed/`,
    "tests/unit/",
    "tests/integration/",
    "tests/e2e/",
    "tests/scaffold.test.mjs",
    "playwright.config.ts",
    "scripts/setup.ps1",
    "scripts/doctor.mjs",
    "scripts/backup-db.ps1",
    "scripts/check-security.ps1",
    ...base
  ];
}

function buildWebProjectPackages(options) {
  const packages = {
    runtime: [],
    dev: [],
    tools: []
  };

  if (options.stack === "next-prisma") {
    packages.runtime.push("next", "react", "react-dom", "zod", "bcryptjs", "@prisma/client");
    if (options.auth === "oauth-rbac") packages.runtime.push("next-auth");
    packages.dev.push("typescript", "eslint", "@types/node", "@types/react", "@playwright/test", "prisma");
    packages.tools.push("npx create-next-app@latest");
  } else if (options.stack === "vite-express") {
    packages.runtime.push("react", "react-dom", "express", "helmet", "cors", "zod", "jsonwebtoken", "bcryptjs", "dotenv", "@prisma/client");
    packages.dev.push("vite", "typescript", "tsx", "eslint", "vitest", "@playwright/test", "prisma");
    packages.tools.push("npm create vite@latest");
  } else {
    packages.runtime.push("express", "helmet", "zod", "better-sqlite3", "dotenv");
    packages.dev.push("node --test", "eslint");
  }

  if (options.database === "postgresql" && options.stack === "node-simple") packages.runtime.push("prisma", "@prisma/client");
  if (options.database === "sqlite") packages.runtime.push("better-sqlite3");
  if (options.database === "mysql") packages.runtime.push("drizzle-orm", "mysql2");

  return packages;
}

function buildWebProjectDatabasePlan(options) {
  const commonTables = [
    "users: id, name, email, password_hash, status, created_at, updated_at",
    "roles: id, name, description",
    "user_roles: user_id, role_id",
    "sessions: id, user_id, expires_at, ip_hash, user_agent_hash",
    "audit_logs: id, actor_id, action, target_type, target_id, metadata_json, created_at"
  ];

  const byType = {
    dashboard: [
      "organizations: id, name, slug, plan, created_at",
      "projects: id, organization_id, name, status",
      "metrics_snapshots: id, project_id, key, value, captured_at"
    ],
    commerce: [
      "products: id, sku, name, price_cents, status",
      "orders: id, user_id, status, total_cents, created_at",
      "order_items: id, order_id, product_id, quantity, price_cents",
      "payments: id, order_id, provider, status, amount_cents"
    ],
    saas: [
      "organizations: id, name, slug, plan, created_at",
      "memberships: id, organization_id, user_id, role",
      "subscriptions: id, organization_id, provider, status, renews_at",
      "usage_events: id, organization_id, feature, amount, created_at"
    ],
    api: [
      "api_keys: id, owner_id, key_hash, scopes_json, expires_at",
      "rate_limits: id, key_id, bucket, count, reset_at",
      "webhook_events: id, source, event_type, payload_hash, processed_at"
    ],
    fullstack: [
      "organizations: id, name, slug, created_at",
      "memberships: id, organization_id, user_id, role",
      "files: id, owner_id, path, mime_type, size_bytes, created_at"
    ]
  };

  return {
    engine: options.database,
    orm: options.database === "postgresql" ? "Prisma ou Drizzle com migracoes versionadas" : "Camada SQL com migracoes versionadas",
    tables: [...commonTables, ...(byType[options.appType] || byType.fullstack)],
    indexes: [
      "users.email unico",
      "audit_logs(actor_id, created_at)",
      "sessions(user_id, expires_at)",
      "foreign keys indexadas em tabelas de relacao",
      "indices compostos para filtros reais de listagem"
    ],
    protections: [
      "migracoes revisaveis antes de aplicar",
      "seed separado de dados sensiveis",
      "backup antes de migracoes destrutivas",
      "EXPLAIN em consultas de listagem/painel",
      "transacoes para fluxos de compra, convite, pagamento ou alteracao de permissao"
    ]
  };
}

function buildWebProjectSecurityPlan(options) {
  return [
    `Autenticacao: ${options.auth}`,
    "Autorizacao por roles/permissoes no servidor, nunca so na tela",
    "Validacao de entrada com schemas antes de usar dados em SQL, arquivos ou chamadas externas",
    "Rate limit em login, recuperacao de senha, endpoints publicos e API keys",
    "CSRF quando houver cookie de sessao; CORS restrito quando houver API separada",
    "Headers: CSP, HSTS em producao, X-Content-Type-Options, Referrer-Policy e frame-ancestors",
    "Senhas com hash forte; tokens e segredos apenas em variaveis de ambiente",
    "Logs sem senha, token, documento sensivel ou payload completo de terceiros",
    "Auditoria para login, alteracao de permissao, exportacao, exclusao e pagamento",
    "Backups, restore testado e plano de rollback de migracoes",
    "Testes negativos para path traversal, SQL destrutivo, permissao insuficiente e entrada grande"
  ];
}

async function buildWebProjectPlan({ objective, appType, stack, database, auth, deployment, fileContext = [] }) {
  const options = normalizeWebProjectOptions({ objective, appType, stack, database, auth, deployment });
  const projectProfile = await readProjectProfile();
  const capabilities = await buildCapabilityStatus();
  const mission = await buildMissionFromObjective(options.objective, fileContext);
  const packages = buildWebProjectPackages(options);
  const structure = buildWebProjectStructure(options);
  const databasePlan = buildWebProjectDatabasePlan(options);
  const securityChecklist = buildWebProjectSecurityPlan(options);
  const webCapabilities = capabilities.capabilities.filter((capability) => ["web-app", "web-test"].includes(capability.id));
  const missingCapabilities = webCapabilities.filter((capability) => !capability.available);
  const likelyFiles = mission.likelyFiles.length ? mission.likelyFiles : structure.slice(0, 14);
  const tests = [
    "lint/typecheck",
    "testes unitarios de regras e validacao",
    "testes de integracao das rotas principais",
    "testes e2e com login, fluxo principal e permissao negada",
    "auditoria rapida de seguranca antes de entregar"
  ];
  const installLines = missingCapabilities.length
    ? missingCapabilities.map((capability) => `- ${capability.name}: ${capability.install}`).join("\n")
    : "- Ferramentas web/teste parecem disponiveis ou serao instaladas no projeto gerado.";
  const packageLines = [
    `- Runtime: ${packages.runtime.join(", ")}`,
    `- Dev/teste: ${packages.dev.join(", ")}`,
    `- Ferramentas: ${packages.tools.join(", ") || "sem ferramenta externa obrigatoria"}`
  ].join("\n");
  const dbTables = databasePlan.tables.map((table) => `- ${table}`).join("\n");
  const dbIndexes = databasePlan.indexes.map((item) => `- ${item}`).join("\n");
  const dbProtections = databasePlan.protections.map((item) => `- ${item}`).join("\n");
  const securityLines = securityChecklist.map((item) => `- ${item}`).join("\n");
  const structureLines = structure.map((item) => `- ${item}`).join("\n");
  const testLines = tests.map((item) => `- ${item}`).join("\n");
  const runCommands = projectProfile.runCommands || "npm run dev";
  const testCommands = projectProfile.testCommands || "npm run lint; npm test; npx playwright test";

  const plan = `Fabrica de Projeto Web Robusto
Objetivo: ${options.objective}

Decisoes iniciais
- Tipo: ${options.appType}
- Stack: ${options.stack}
- Banco: ${options.database}
- Autenticacao: ${options.auth}
- Deploy alvo: ${options.deployment}

Arquitetura sugerida
- Separar UI, regras de negocio, acesso a dados, autenticacao, auditoria e configuracao.
- Criar contratos claros entre telas, APIs e banco.
- Usar variaveis de ambiente tipadas e um arquivo .env.example sem segredos.
- Manter docs de arquitetura, banco, seguranca e runbook desde a primeira versao.
- Criar uma primeira entrega pequena: login, dashboard vazio, CRUD principal, auditoria e testes.

Estrutura de pastas
${structureLines}

Banco de dados
- Engine: ${databasePlan.engine}
- ORM/camada: ${databasePlan.orm}

Tabelas iniciais
${dbTables}

Indices e performance
${dbIndexes}

Protecoes de dados
${dbProtections}

Seguranca por construcao
${securityLines}

Pacotes e ferramentas provaveis
${packageLines}

Instalacoes sugeridas se faltar capacidade na Aurora
${installLines}

Plano de testes
${testLines}

Ordem de execucao
1. Criar scaffold do projeto e .env.example.
2. Configurar banco, migracoes e seed minimo.
3. Implementar autenticacao e autorizacao no servidor.
4. Criar layout base, dashboard e fluxo principal.
5. Adicionar auditoria e logs seguros.
6. Criar testes unitarios, integracao e e2e.
7. Rodar validacoes: ${testCommands}
8. Preparar deploy com variaveis, build, backup e rollback.

Comandos conhecidos
- Rodar: ${runCommands}
- Testar: ${testCommands}

Arquivos provaveis
${likelyFiles.map((file) => `- ${file}`).join("\n")}`;

  return {
    source: "web-factory-local",
    objective: options.objective,
    kind: "web",
    options,
    plan,
    architecture: {
      structure,
      packages,
      tests,
      deployment: options.deployment
    },
    databasePlan,
    securityChecklist,
    likelyFiles,
    requiredCapabilities: webCapabilities,
    missingCapabilities,
    actions: mission.actions,
    needs: mission.needs
  };
}

function webProjectPackageJson(options) {
  if (options.stack === "vite-express") {
    return {
      scripts: {
        dev: "concurrently \"npm:dev:web\" \"npm:dev:api\"",
        "dev:web": "vite --host 127.0.0.1",
        "dev:api": "tsx apps/api/src/server.ts",
        build: "vite build",
        test: "node --test tests/*.test.mjs",
        "test:unit": "vitest run",
        "test:e2e": "playwright test",
        lint: "eslint .",
        "db:migrate": "prisma migrate dev",
        "db:studio": "prisma studio",
        doctor: "node scripts/doctor.mjs",
        "check:security": "powershell -ExecutionPolicy Bypass -File scripts/check-security.ps1"
      },
      dependencies: {
        "@prisma/client": "latest",
        bcryptjs: "latest",
        cors: "latest",
        dotenv: "latest",
        express: "latest",
        helmet: "latest",
        jsonwebtoken: "latest",
        react: "latest",
        "react-dom": "latest",
        zod: "latest"
      },
      devDependencies: {
        "@playwright/test": "latest",
        "@types/node": "latest",
        "@vitejs/plugin-react": "latest",
        concurrently: "latest",
        eslint: "latest",
        prisma: "latest",
        tsx: "latest",
        typescript: "latest",
        vite: "latest",
        vitest: "latest"
      }
    };
  }

  if (options.stack === "node-simple") {
    const nodeDatabaseDependency = options.database === "sqlite"
      ? { "better-sqlite3": "latest" }
      : { "@prisma/client": "latest" };
    const nodeDatabaseDevDependency = options.database === "sqlite"
      ? {}
      : { prisma: "latest" };

    return {
      scripts: {
        dev: "node src/server.js",
        start: "node src/server.js",
        test: "node --test tests/*.test.mjs",
        "test:e2e": "playwright test",
        doctor: "node scripts/doctor.mjs",
        "check:security": "powershell -ExecutionPolicy Bypass -File scripts/check-security.ps1"
      },
      dependencies: {
        bcryptjs: "latest",
        dotenv: "latest",
        express: "latest",
        helmet: "latest",
        zod: "latest",
        ...nodeDatabaseDependency
      },
      devDependencies: {
        "@playwright/test": "latest",
        eslint: "latest",
        ...nodeDatabaseDevDependency
      }
    };
  }

  const authDependency = options.auth === "oauth-rbac" ? { "next-auth": "latest" } : {};

  return {
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      test: "node --test tests/*.test.mjs",
      "test:e2e": "playwright test",
      "db:migrate": "prisma migrate dev",
      "db:studio": "prisma studio",
      doctor: "node scripts/doctor.mjs",
      "check:security": "powershell -ExecutionPolicy Bypass -File scripts/check-security.ps1"
    },
    dependencies: {
      "@prisma/client": "latest",
      bcryptjs: "latest",
      next: "latest",
      react: "latest",
      "react-dom": "latest",
      zod: "latest",
      ...authDependency
    },
    devDependencies: {
      "@playwright/test": "latest",
      "@types/node": "latest",
      "@types/react": "latest",
      eslint: "latest",
      prisma: "latest",
      typescript: "latest"
    }
  };
}

function webProjectEnvExample(options) {
  const databaseUrl = {
    postgresql: "postgresql://USER:PASSWORD@localhost:5432/APP_DB?schema=public",
    mysql: "mysql://USER:PASSWORD@localhost:3306/APP_DB",
    sqlite: "file:./dev.db"
  }[options.database] || "postgresql://USER:PASSWORD@localhost:5432/APP_DB?schema=public";

  return `NODE_ENV=development
APP_URL=http://localhost:3000
DATABASE_URL=${databaseUrl}
AUTH_SECRET=troque-este-valor-em-producao
SESSION_COOKIE_NAME=app_session
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
LOG_LEVEL=info
`;
}

function webProjectGitignore() {
  return `node_modules/
.next/
dist/
build/
coverage/
playwright-report/
test-results/
.env
.env.*
!.env.example
*.log
dev.db
dev.db-journal
`;
}

function webProjectDockerignore() {
  return `node_modules
.next
dist
build
coverage
playwright-report
test-results
.env
*.log
generated
`;
}

function webProjectDockerfile(plan) {
  const startCommand = plan.options.stack === "next-prisma"
    ? "npm run build && npm run start"
    : plan.options.stack === "vite-express"
      ? "npm run build && npm run dev:api"
      : "npm start";

  return `FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "${startCommand}"]
`;
}

function webProjectDockerCompose(plan, projectName) {
  const appName = slugifyFileName(projectName || plan.objective, "aurora-web-project");
  const appBlock = `  app:
    build: .
    env_file:
      - .env
    ports:
      - "3000:3000"
    depends_on:${plan.options.database === "sqlite" ? " []" : "\n      - db"}
`;

  if (plan.options.database === "sqlite") {
    return `services:
${appBlock}
    volumes:
      - ./data:/app/data
`;
  }

  if (plan.options.database === "mysql") {
    return `services:
${appBlock}
  db:
    image: mysql:8
    environment:
      MYSQL_DATABASE: ${appName.replaceAll("-", "_")}
      MYSQL_USER: app
      MYSQL_PASSWORD: app_password
      MYSQL_ROOT_PASSWORD: root_password
    ports:
      - "3306:3306"
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:
`;
  }

  return `services:
${appBlock}
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${appName.replaceAll("-", "_")}
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app_password
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
`;
}

function webProjectTsConfig(plan) {
  if (plan.options.stack === "node-simple") return "";

  return JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      lib: ["dom", "dom.iterable", "es2022"],
      allowJs: false,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: plan.options.stack === "next-prisma" ? "preserve" : "react-jsx",
      incremental: true,
      paths: {
        "@/*": ["./*"]
      }
    },
    include: ["**/*.ts", "**/*.tsx"],
    exclude: ["node_modules"]
  }, null, 2);
}

function webProjectNextConfig() {
  return `const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true
};

export default nextConfig;
`;
}

function webProjectPlaywrightConfig(plan) {
  const baseURL = plan.options.stack === "vite-express" ? "http://127.0.0.1:5173" : "http://127.0.0.1:3000";

  return `import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  use: {
    baseURL: "${baseURL}",
    trace: "on-first-retry"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ]
});
`;
}

function webProjectScaffoldTest(plan) {
  const requiredFiles = [
    "README.md",
    ".env.example",
    "docs/security.md",
    "docs/database.md",
    "scripts/check-security.ps1"
  ];
  if (plan.options.stack !== "node-simple") requiredFiles.push("tsconfig.json");
  if (plan.options.stack === "next-prisma") requiredFiles.push("app/api/health/route.ts", "lib/env.ts", "lib/auth.ts");
  if (plan.options.stack === "vite-express") requiredFiles.push("apps/api/src/server.ts", "apps/web/src/main.tsx");
  if (plan.options.stack === "node-simple") requiredFiles.push("src/server.js");

  return `import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const requiredFiles = ${JSON.stringify(requiredFiles, null, 2)};

test("scaffold contains the required foundation files", () => {
  for (const file of requiredFiles) {
    assert.equal(existsSync(file), true, \`\${file} should exist\`);
  }
});

test("env example does not contain production secrets", () => {
  const envExample = readFileSync(".env.example", "utf8");
  assert.match(envExample, /AUTH_SECRET=/);
  assert.doesNotMatch(envExample, /sk-[a-z0-9]/i);
});
`;
}

function webProjectSetupScript(plan) {
  const migrationLine = plan.options.stack === "node-simple"
    ? "Write-Host \"Sem migracao automatica configurada para Node simples.\""
    : "npm run db:migrate";

  return `Write-Host "Preparando projeto gerado pela Aurora"
if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Arquivo .env criado a partir do .env.example. Revise os segredos antes de usar."
}
npm install
${migrationLine}
npm test
`;
}

function webProjectDoctorScript(plan) {
  const stackCheck = plan.options.stack === "node-simple"
    ? "assertFile('src/server.js');"
    : plan.options.stack === "vite-express"
      ? "assertFile('apps/api/src/server.ts'); assertFile('apps/web/src/main.tsx');"
      : "assertFile('app/api/health/route.ts'); assertFile('lib/env.ts');";

  return `import { existsSync, readFileSync } from "node:fs";

function assertFile(file) {
  if (!existsSync(file)) {
    console.error(\`Arquivo obrigatorio ausente: \${file}\`);
    process.exitCode = 1;
  }
}

assertFile("README.md");
assertFile(".env.example");
assertFile("docs/security.md");
assertFile("docs/database.md");
${stackCheck}

const envExample = readFileSync(".env.example", "utf8");
for (const key of ["DATABASE_URL", "AUTH_SECRET", "APP_URL"]) {
  if (!envExample.includes(\`\${key}=\`)) {
    console.error(\`.env.example sem \${key}\`);
    process.exitCode = 1;
  }
}

if (!process.exitCode) {
  console.log("Doctor OK: base do scaffold parece integra.");
}
`;
}

function webProjectReadme(plan, projectName) {
  return `# ${projectName}

Scaffold gerado pela Aurora Local.

## Objetivo

${plan.objective}

## Stack

- Tipo: ${plan.options.appType}
- Stack: ${plan.options.stack}
- Banco: ${plan.options.database}
- Autenticacao: ${plan.options.auth}
- Deploy alvo: ${plan.options.deployment}

## Primeiros passos

1. Revise \`.env.example\` e crie seu \`.env\`.
2. Instale dependencias com \`npm install\`.
3. Configure o banco e rode as migracoes.
4. Rode \`npm run doctor\`, \`npm test\` e o checklist de seguranca.
5. Evolua uma funcionalidade pequena por vez.

## Comandos

\`\`\`powershell
npm install
npm run doctor
npm run dev
npm test
\`\`\`

## Docker

\`\`\`powershell
docker compose up --build
\`\`\`

## Segurança

Leia \`docs/security.md\` antes de expor qualquer rota publicamente.
`;
}

function webProjectArchitectureDoc(plan) {
  return `# Arquitetura

## Direcao

${plan.architecture.structure.map((item) => `- ${item}`).join("\n")}

## Pacotes

- Runtime: ${plan.architecture.packages.runtime.join(", ")}
- Desenvolvimento: ${plan.architecture.packages.dev.join(", ")}

## Ordem sugerida

1. Configurar ambiente e banco.
2. Implementar autenticacao.
3. Implementar autorizacao no servidor.
4. Criar fluxo principal pequeno.
5. Adicionar auditoria.
6. Cobrir com testes.
7. Preparar deploy e rollback.

## Fundacao gerada

- Dockerfile e docker-compose para desenvolvimento/primeiro deploy.
- Scripts npm run doctor, npm test e npm run check:security.
- Configuracao de testes e2e com Playwright.
- Guard rails iniciais para ambiente, autenticacao, rate limit e auditoria.
`;
}

function webProjectSecurityDoc(plan) {
  return `# Segurança

## Checklist

${plan.securityChecklist.map((item) => `- [ ] ${item}`).join("\n")}

## Regras

- Nunca salvar segredos no repositorio.
- Validar entrada antes de usar em SQL, arquivos ou chamadas externas.
- Criar logs uteis sem gravar senha, token ou dados sensiveis.
- Tratar permissao no servidor, mesmo quando a UI esconder botoes.
- Testar entradas invalidas e permissoes negadas.
`;
}

function webProjectDatabaseDoc(plan) {
  return `# Banco de Dados

## Engine

${plan.databasePlan.engine}

## Tabelas iniciais

${plan.databasePlan.tables.map((table) => `- ${table}`).join("\n")}

## Indices

${plan.databasePlan.indexes.map((item) => `- ${item}`).join("\n")}

## Protecoes

${plan.databasePlan.protections.map((item) => `- ${item}`).join("\n")}
`;
}

function webProjectRunbookDoc(plan) {
  return `# Runbook

## Desenvolvimento

1. Verificar \`.env\`.
2. Rodar \`npm install\`.
3. Rodar migracoes.
4. Rodar \`npm run dev\`.

## Antes de publicar

1. Rodar testes.
2. Rodar checklist de seguranca.
3. Confirmar backup do banco.
4. Confirmar variaveis de ambiente.
5. Registrar versao publicada.

## Rollback

1. Pausar trafego se necessario.
2. Restaurar versao anterior do app.
3. Restaurar backup do banco se a migracao alterou dados.
4. Registrar incidente em audit log.
`;
}

function webProjectPrismaSchema(plan) {
  const provider = { postgresql: "postgresql", mysql: "mysql", sqlite: "sqlite" }[plan.options.database] || "postgresql";
  const type = plan.options.appType;
  const userRelations = [];
  const extraModels = [];

  if (["saas", "dashboard", "fullstack"].includes(type)) {
    userRelations.push("  memberships  Membership[]");
    extraModels.push(`model Organization {
  id          String       @id @default(cuid())
  name        String
  slug        String       @unique
  plan        String       @default("free")
  createdAt   DateTime     @default(now()) @map("created_at")
  memberships Membership[]

  @@map("organizations")
}

model Membership {
  id             String       @id @default(cuid())
  organizationId String       @map("organization_id")
  userId         String       @map("user_id")
  role           String       @default("member")
  createdAt      DateTime     @default(now()) @map("created_at")
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userId])
  @@index([userId, role])
  @@map("memberships")
}`);
  }

  if (["commerce"].includes(type)) {
    userRelations.push("  orders       Order[]");
    extraModels.push(`model Product {
  id          String      @id @default(cuid())
  sku         String      @unique
  name        String
  priceCents  Int         @map("price_cents")
  status      String      @default("draft")
  createdAt   DateTime    @default(now()) @map("created_at")
  orderItems  OrderItem[]

  @@index([status, createdAt])
  @@map("products")
}

model Order {
  id         String      @id @default(cuid())
  userId     String      @map("user_id")
  status     String      @default("pending")
  totalCents Int         @map("total_cents")
  createdAt  DateTime    @default(now()) @map("created_at")
  user       User        @relation(fields: [userId], references: [id])
  items      OrderItem[]
  payments   Payment[]

  @@index([userId, createdAt])
  @@map("orders")
}

model OrderItem {
  id         String  @id @default(cuid())
  orderId    String  @map("order_id")
  productId  String  @map("product_id")
  quantity   Int
  priceCents Int     @map("price_cents")
  order      Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product    Product @relation(fields: [productId], references: [id])

  @@index([productId])
  @@map("order_items")
}

model Payment {
  id          String   @id @default(cuid())
  orderId     String   @map("order_id")
  provider    String
  status      String
  amountCents Int      @map("amount_cents")
  createdAt   DateTime @default(now()) @map("created_at")
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([provider, status])
  @@map("payments")
}`);
  }

  if (["api"].includes(type)) {
    userRelations.push("  apiKeys      ApiKey[]");
    extraModels.push(`model ApiKey {
  id         String    @id @default(cuid())
  ownerId    String    @map("owner_id")
  keyHash    String    @unique @map("key_hash")
  scopesJson String    @map("scopes_json")
  expiresAt  DateTime? @map("expires_at")
  createdAt  DateTime  @default(now()) @map("created_at")
  owner      User      @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  @@index([ownerId, expiresAt])
  @@map("api_keys")
}

model WebhookEvent {
  id          String    @id @default(cuid())
  source      String
  eventType   String    @map("event_type")
  payloadHash String    @map("payload_hash")
  processedAt DateTime? @map("processed_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  @@index([source, eventType, createdAt])
  @@map("webhook_events")
}`);
  }

  return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}

model User {
  id           String     @id @default(cuid())
  name         String
  email        String     @unique
  passwordHash String?    @map("password_hash")
  status       String     @default("active")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")
  roles        UserRole[]
  sessions     Session[]
  auditLogs    AuditLog[] @relation("ActorAuditLogs")
${userRelations.join("\n")}

  @@map("users")
}

model Role {
  id          String     @id @default(cuid())
  name        String     @unique
  description String?
  users       UserRole[]

  @@map("roles")
}

model UserRole {
  userId String @map("user_id")
  roleId String @map("role_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@map("user_roles")
}

model Session {
  id            String   @id @default(cuid())
  userId        String   @map("user_id")
  expiresAt     DateTime @map("expires_at")
  ipHash        String?  @map("ip_hash")
  userAgentHash String?  @map("user_agent_hash")
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, expiresAt])
  @@map("sessions")
}

model AuditLog {
  id           String   @id @default(cuid())
  actorId      String?  @map("actor_id")
  action       String
  targetType   String   @map("target_type")
  targetId     String?  @map("target_id")
  metadataJson String?  @map("metadata_json")
  createdAt    DateTime @default(now()) @map("created_at")
  actor        User?    @relation("ActorAuditLogs", fields: [actorId], references: [id])

  @@index([actorId, createdAt])
  @@map("audit_logs")
}
${extraModels.length ? `\n${extraModels.join("\n\n")}\n` : ""}
`;
}

function webProjectPrismaSeed() {
  return `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin", description: "Acesso administrativo" }
  });
  await prisma.role.upsert({
    where: { name: "member" },
    update: {},
    create: { name: "member", description: "Acesso padrao autenticado" }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
`;
}

function webProjectNextFiles(plan) {
  return {
    "next.config.mjs": webProjectNextConfig(),
    "app/layout.tsx": `import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "${slugifyFileName(plan.objective, "app")}",
  description: "Projeto gerado pela Aurora Local"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
`,
    "app/globals.css": `:root {
  color-scheme: light;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f7f7f2;
  color: #1d2430;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

main {
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
  padding: 48px 0;
}

.surface {
  border: 1px solid #d9ded6;
  border-radius: 8px;
  background: #ffffff;
  padding: 24px;
}

.grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

a {
  color: #145c52;
}
`,
    "app/(public)/page.tsx": `export default function HomePage() {
  return (
    <main>
      <section className="surface">
        <h1>${plan.options.appType} seguro</h1>
        <p>Base publica do projeto com ambiente, banco, seguranca e testes prontos para evoluir.</p>
        <a href="/dashboard">Entrar no painel</a>
      </section>
    </main>
  );
}
`,
    "app/(app)/dashboard/page.tsx": `export default function DashboardPage() {
  const cards = [
    "Autenticacao",
    "Banco de dados",
    "Auditoria",
    "Testes",
    "Deploy"
  ];

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Area autenticada preparada para metricas, auditoria e operacao.</p>
      <section className="grid">
        {cards.map((card) => (
          <article className="surface" key={card}>
            <h2>{card}</h2>
            <p>Conectar regra real na proxima iteracao.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
`,
    "app/api/health/route.ts": `export async function GET() {
  return Response.json({
    ok: true,
    app: "${slugifyFileName(plan.objective, "app")}",
    time: new Date().toISOString()
  });
}
`,
    "app/api/auth/login/route.ts": `import { NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200)
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit("login:" + ip, 5, 60000);
  if (!rateLimit.ok) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde e tente de novo." }, { status: 429 });
  }

  const payload = loginSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) {
    return NextResponse.json({ error: "Credenciais invalidas." }, { status: 400 });
  }

  await audit({
    action: "auth.login.requested",
    targetType: "user",
    targetId: payload.data.email
  });

  return NextResponse.json({
    ok: false,
    message: "Conecte esta rota ao banco e grave o cookie de sessao seguro."
  }, { status: 501 });
}
`,
    "app/api/admin/audit/route.ts": `import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  await requireRole(["admin"]);
  const events = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  });
  return NextResponse.json({ events });
}
`,
    "lib/env.ts": `import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(16),
  APP_URL: z.string().url(),
  SESSION_COOKIE_NAME: z.string().default("app_session"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120)
});

export const env = schema.parse(process.env);
`,
    "lib/db.ts": `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["warn", "error"]
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
`,
    "lib/auth.ts": `import { cookies } from "next/headers";
import { env } from "@/lib/env";

export type AppRole = "admin" | "member";

export type CurrentUser = {
  id: string;
  email: string;
  roles: AppRole[];
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(env.SESSION_COOKIE_NAME);
  if (!session?.value) return null;

  // Conecte aqui a validacao da sessao no banco antes de liberar dados reais.
  return null;
}

export async function requireRole(allowedRoles: AppRole[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Nao autenticado.");
  const allowed = user.roles.some((role) => allowedRoles.includes(role));
  if (!allowed) throw new Error("Permissao insuficiente.");
  return user;
}
`,
    "lib/audit.ts": `import { prisma } from "@/lib/db";

type AuditInput = {
  actorId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};

export async function audit(input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        metadataJson: input.metadata ? JSON.stringify(input.metadata) : undefined
      }
    });
  } catch (error) {
    console.warn("Falha ao registrar auditoria", error);
  }
}
`,
    "lib/rate-limit.ts": `type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }

  current.count += 1;
  return {
    ok: current.count <= max,
    remaining: Math.max(0, max - current.count),
    resetAt: current.resetAt
  };
}
`,
    "lib/security.ts": `export const securityHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()"
};
`,
    "middleware.ts": `import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  return response;
}
`
  };
}

function webProjectExpressFiles(plan) {
  return {
    "tsconfig.json": webProjectTsConfig(plan),
    "apps/api/src/server.ts": `import "dotenv/config";
import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { securityMiddleware } from "./middleware/security";
import { authMiddleware } from "./middleware/auth";

const app = express();
app.use(securityMiddleware);
app.use(cors({ origin: env.APP_URL }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, app: "${slugifyFileName(plan.objective, "app")}", time: new Date().toISOString() });
});

app.get("/api/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.listen(env.PORT, () => {
  console.log("API running on http://localhost:" + env.PORT);
});
`,
    "apps/api/src/config/env.ts": `import { z } from "zod";

const schema = z.object({
  APP_URL: z.string().url().default("http://localhost:5173"),
  AUTH_SECRET: z.string().min(16),
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(3333)
});

export const env = schema.parse(process.env);
`,
    "apps/api/src/middleware/security.ts": `import helmet from "helmet";

export const securityMiddleware = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
});
`,
    "apps/api/src/middleware/auth.ts": `import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; roles: string[] };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Nao autenticado." });
    return;
  }

  // Troque este placeholder por validacao de JWT/API key no banco.
  req.user = { id: "local-user", roles: ["member"] };
  next();
}
`,
    "apps/web/src/lib/api.ts": `const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(API_URL + path);
  if (!response.ok) throw new Error("Falha na API: " + response.status);
  return response.json() as Promise<T>;
}
`,
    "apps/web/src/main.tsx": `import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  const cards = ["API", "Banco", "Seguranca", "Testes"];

  return (
    <main>
      <h1>${plan.options.appType} seguro</h1>
      <p>Frontend inicial conectado ao plano da Aurora.</p>
      <section className="grid">
        {cards.map((card) => (
          <article key={card}>
            <h2>{card}</h2>
            <p>Base pronta para a proxima iteracao.</p>
          </article>
        ))}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
`,
    "apps/web/src/style.css": `:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f7f7f2;
  color: #1d2430;
}

body {
  margin: 0;
}

main {
  width: min(1080px, calc(100% - 32px));
  margin: 0 auto;
  padding: 48px 0;
}

.grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

article {
  border: 1px solid #d9ded6;
  border-radius: 8px;
  background: #ffffff;
  padding: 20px;
}
`,
    "apps/web/index.html": `<div id="root"></div><script type="module" src="/src/main.tsx"></script>
`
  };
}

function webProjectNodeFiles(plan) {
  return {
    "public/index.html": `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${slugifyFileName(plan.objective, "app")}</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <main>
      <section>
        <h1>${plan.options.appType} seguro</h1>
        <p>Base Node simples com seguranca, healthcheck e banco local preparados.</p>
      </section>
    </main>
  </body>
</html>
`,
    "public/style.css": `:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f7f7f2;
  color: #1d2430;
}

body {
  margin: 0;
}

main {
  width: min(920px, calc(100% - 32px));
  margin: 0 auto;
  padding: 48px 0;
}

section {
  border: 1px solid #d9ded6;
  border-radius: 8px;
  background: #ffffff;
  padding: 24px;
}
`,
    "src/server.js": `import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { z } from "zod";

const app = express();
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const envSchema = z.object({
  APP_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(16),
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(3000)
});

const env = envSchema.parse(process.env);

app.get("/health", (_req, res) => {
  res.json({ ok: true, app: "${slugifyFileName(plan.objective, "app")}", time: new Date().toISOString() });
});

app.post("/api/login", (req, res) => {
  const body = z.object({
    email: z.string().email(),
    password: z.string().min(8)
  }).safeParse(req.body);

  if (!body.success) {
    res.status(400).json({ error: "Entrada invalida." });
    return;
  }

  res.status(501).json({ error: "Conecte autenticacao ao banco antes de liberar login real." });
});

app.listen(env.PORT, () => {
  console.log("App running on http://localhost:" + env.PORT);
});
`
  };
}

function buildWebScaffoldFiles(plan, projectName) {
  const packageTemplate = webProjectPackageJson(plan.options);
  const files = {
    "README.md": webProjectReadme(plan, projectName),
    ".env.example": webProjectEnvExample(plan.options),
    ".gitignore": webProjectGitignore(),
    ".dockerignore": webProjectDockerignore(),
    "Dockerfile": webProjectDockerfile(plan),
    "docker-compose.yml": webProjectDockerCompose(plan, projectName),
    "package.json": JSON.stringify({
      name: slugifyFileName(projectName, "aurora-web-project"),
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: packageTemplate.scripts,
      dependencies: packageTemplate.dependencies,
      devDependencies: packageTemplate.devDependencies,
      prisma: {
        seed: "node prisma/seed.mjs"
      }
    }, null, 2),
    "docs/architecture.md": webProjectArchitectureDoc(plan),
    "docs/security.md": webProjectSecurityDoc(plan),
    "docs/database.md": webProjectDatabaseDoc(plan),
    "docs/runbook.md": webProjectRunbookDoc(plan),
    "prisma/schema.prisma": webProjectPrismaSchema(plan),
    "prisma/seed.mjs": webProjectPrismaSeed(),
    "tests/README.md": `# Testes

- Unitarios: regras puras, validacao e autorizacao.
- Integracao: rotas, banco e auditoria.
- E2E: login, fluxo principal e permissao negada.
`,
    "tests/scaffold.test.mjs": webProjectScaffoldTest(plan),
    "tests/e2e/README.md": `# E2E

Adicione aqui fluxos do Playwright: login, permissao negada e fluxo principal do produto.
`,
    "playwright.config.ts": webProjectPlaywrightConfig(plan),
    "scripts/setup.ps1": webProjectSetupScript(plan),
    "scripts/doctor.mjs": webProjectDoctorScript(plan),
    "scripts/check-security.ps1": `Write-Host "Checklist de seguranca"
Write-Host "- Revise docs/security.md"
Write-Host "- Rode testes negativos"
Write-Host "- Confirme variaveis de ambiente"
`,
    "scripts/backup-db.ps1": `Write-Host "Defina aqui o backup do banco para o ambiente escolhido."
`
  };

  const tsConfig = webProjectTsConfig(plan);
  if (tsConfig) files["tsconfig.json"] = tsConfig;

  if (plan.options.stack === "vite-express") return { ...files, ...webProjectExpressFiles(plan) };
  if (plan.options.stack === "node-simple") return { ...files, ...webProjectNodeFiles(plan) };
  return { ...files, ...webProjectNextFiles(plan) };
}

async function writeWebScaffold(plan, projectName) {
  const baseSlug = slugifyFileName(projectName || plan.objective, "web-project");
  const rootDir = path.join(generatedDir, "web-projects");
  await mkdir(rootDir, { recursive: true });

  let slug = baseSlug;
  let targetDir = path.join(rootDir, slug);
  for (let index = 2; existsSync(targetDir); index += 1) {
    slug = `${baseSlug}-${index}`;
    targetDir = path.join(rootDir, slug);
  }

  const resolvedRoot = path.resolve(rootDir);
  const resolvedTarget = path.resolve(targetDir);
  if (resolvedTarget !== resolvedRoot && !resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error("Destino de scaffold fora de generated/web-projects bloqueado.");
  }

  const files = buildWebScaffoldFiles(plan, projectName || slug);
  const writtenFiles = [];
  for (const [relativeFile, content] of Object.entries(files)) {
    const fullPath = path.join(targetDir, relativeFile);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, "utf8");
    writtenFiles.push(toRelative(fullPath));
  }

  return {
    slug,
    path: toRelative(targetDir),
    fullPath: targetDir,
    files: writtenFiles,
    features: [
      "Docker e docker-compose",
      "Doctor script",
      "Teste de scaffold",
      "Playwright preparado",
      "Prisma schema e seed",
      "Headers, rate limit, auditoria e autenticacao base"
    ],
    nextSteps: [
      `cd "${toRelative(targetDir)}"`,
      "npm install",
      "npm run doctor",
      "npm test"
    ]
  };
}

function requiredCapabilityIdsForKind(kind) {
  return {
    game: ["game-2d", "game-3d", "web-test"],
    web: ["web-app", "web-test"],
    spreadsheet: ["xlsx"],
    document: ["docx"],
    database: [],
    software: ["web-test"]
  }[kind] || [];
}

function buildExecutorQueue({ kind, likelyFiles, tests, runCommands, missingCapabilities, maintenanceWarnings }) {
  const firstFile = likelyFiles[0] || "";
  const hasMissingCapabilities = missingCapabilities.length > 0;
  const hasWarnings = maintenanceWarnings.length > 0;
  const webFactoryStep = kind === "web"
    ? [{
      id: "web-factory-scaffold",
      title: "Criar ou atualizar scaffold pela Fabrica Web",
      status: "ready",
      risk: "medium",
      action: "Gerar uma base pequena em generated/web-projects antes de integrar mudancas maiores.",
      expectedOutput: "Pasta de projeto com README, doctor script, testes, Prisma e checklist de seguranca."
    }]
    : [];

  return [
    {
      id: "refresh-context",
      title: "Atualizar contexto local",
      status: "ready",
      risk: "low",
      action: "Atualizar indice e mapa de codigo antes de escolher arquivos finais.",
      expectedOutput: "data/project-index.json e data/code-map.json recentes."
    },
    {
      id: "inspect-entrypoints",
      title: "Ler arquivos provaveis",
      status: firstFile ? "ready" : "blocked",
      risk: "low",
      action: firstFile ? `Comecar por ${firstFile} e confirmar os pontos de entrada.` : "Gerar indice/mapa para encontrar arquivos candidatos.",
      expectedOutput: "Lista curta de arquivos-alvo e riscos conhecidos."
    },
    {
      id: "check-capabilities",
      title: "Checar capacidades e permissoes",
      status: hasMissingCapabilities || hasWarnings ? "needs-review" : "ready",
      risk: hasMissingCapabilities ? "medium" : "low",
      action: hasMissingCapabilities
        ? "Mostrar comandos de instalacao sugeridos antes de depender dessas ferramentas."
        : "Prosseguir com as ferramentas disponiveis e permissoes atuais.",
      expectedOutput: hasWarnings ? maintenanceWarnings.slice(0, 2).join(" ") : "Ambiente pronto para a primeira entrega."
    },
    ...webFactoryStep,
    {
      id: "small-implementation",
      title: "Fazer menor entrega funcional",
      status: "pending-confirmation",
      risk: "medium",
      action: "Editar o menor conjunto de arquivos, mantendo backup e historico quando alterar arquivos existentes.",
      expectedOutput: "Mudanca pequena, testavel e reversivel."
    },
    {
      id: "run-checks",
      title: "Rodar validacoes",
      status: "ready",
      risk: "low",
      action: `Executar ${tests}.`,
      commandIds: ["npm-run-check", "npm-test"],
      expectedOutput: "Checks verdes ou erro capturado para a etapa de correcao."
    },
    {
      id: "fix-and-record",
      title: "Corrigir erro e registrar resultado",
      status: "pending",
      risk: "medium",
      action: "Se algum teste falhar, usar a saida para uma correcao pequena e repetir validacoes.",
      expectedOutput: `Resumo final, proximo passo e comando de execucao: ${runCommands}.`
    }
  ];
}

async function buildExecutorPlan({ objective, fileContext = [], missionId = "" }) {
  const projectProfile = await readProjectProfile();
  const projectIndex = await readProjectIndex();
  const codeMap = await readCodeMap();
  const capabilities = await buildCapabilityStatus();
  const maintenance = await getMaintenanceStatus("default");
  const mission = await buildMissionFromObjective(objective, fileContext);
  const kind = mission.kind;
  const requiredIds = requiredCapabilityIdsForKind(kind);
  const requiredCapabilities = capabilities.capabilities.filter((capability) => requiredIds.includes(capability.id));
  const missingCapabilities = requiredCapabilities.filter((capability) => !capability.available);
  const availableTools = capabilities.tools.filter((tool) => tool.available).map((tool) => tool.command);
  const missingTools = capabilities.tools.filter((tool) => !tool.available).map((tool) => `${tool.command}: ${tool.install}`);
  const tests = projectProfile.testCommands || "npm run check; npm test";
  const runCommands = projectProfile.runCommands || "npm start";
  const likelyFiles = mission.likelyFiles.length
    ? mission.likelyFiles
    : [
      ...(projectIndex?.importantFiles || []).slice(0, 6).map((file) => file.path),
      ...(codeMap?.files || []).slice(0, 6).map((file) => file.path)
    ].slice(0, 12);

  const installLines = missingCapabilities.length
    ? missingCapabilities.map((capability) => `- ${capability.name}: ${capability.install}`).join("\n")
    : "- Nenhuma dependencia obrigatoria faltando para este tipo de missao.";
  const toolLines = [
    `- Disponiveis: ${availableTools.join(", ") || "nenhuma ferramenta detectada"}`,
    missingTools.length ? `- Faltando: ${missingTools.join("; ")}` : "- Ferramentas base OK."
  ].join("\n");
  const permissionLines = Object.entries(maintenance.permissions || {})
    .map(([name, value]) => `- ${value ? "OK" : "OFF"} ${name}`)
    .join("\n");
  const actionLines = mission.actions
    .map((action) => `- ${action.safe ? "Seguro" : "Confirmar"}: ${action.label} (${action.method} ${action.endpoint})`)
    .join("\n");
  const needsLines = mission.needs.map((need) => `- ${need.priority}: ${need.text}`).join("\n");
  const executionQueue = buildExecutorQueue({
    kind,
    likelyFiles,
    tests,
    runCommands,
    missingCapabilities,
    maintenanceWarnings: maintenance.warnings || []
  });
  const queueLines = executionQueue
    .map((step, index) => `${index + 1}. [${step.status}] ${step.title} - ${step.action}`)
    .join("\n");

  const plan = `Executor avancado
Missao: ${objective}
Tipo detectado: ${kind}
${missionId ? `Missao vinculada: ${missionId}` : "Missao vinculada: nenhuma"}

Primeira entrega concreta
- Criar uma versao pequena, testavel e recuperavel antes de expandir.
- Salvar progresso em missao, historico de alteracoes e README quando mudar comportamento.
- Usar backups antes de gravar arquivos existentes.

Necessidades detectadas
${needsLines}

Arquivos provaveis
${likelyFiles.length ? likelyFiles.map((file) => `- ${file}`).join("\n") : "- Atualizar indice e mapa de codigo antes de escolher arquivos."}

Ferramentas e dependencias
${toolLines}

Instalacoes sugeridas se precisar
${installLines}

Permissoes atuais
${permissionLines}

Acoes preparatorias seguras
${actionLines}

Fila inicial de execucao
${queueLines}

Comandos conhecidos
- Rodar: ${runCommands}
- Testar: ${tests}

Regras de continuidade
- Se uma etapa falhar, capturar erro, apontar causa provavel e propor correcao.
- Se o contexto estiver grande, compactar conversa antes de continuar.
- Se precisar escrever SQL ou aplicar mudanca ampla, confirmar permissao e garantir backup.
- Nao parar em plano quando ja houver uma proxima acao segura e verificavel.`;

  return {
    source: "executor-local",
    missionId,
    objective,
    kind,
    plan,
    likelyFiles,
    requiredCapabilities,
    missingCapabilities,
    executionQueue,
    actions: mission.actions,
    needs: mission.needs,
    maintenanceWarnings: maintenance.warnings || []
  };
}

async function runCodexExecutorCycle({ objective, fileContext = [], missionId = "", runSafeChecks = true, commandIds = ["npm-run-check"] }) {
  const cleanObjective = String(objective || "Preparar e executar uma melhoria segura no projeto.").trim();
  const cycleId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const codexMode = await buildCodexMode({
    objective: cleanObjective,
    fileContext,
    updateProfile: true
  });
  const executorPlan = await buildExecutorPlan({
    objective: cleanObjective,
    fileContext,
    missionId
  });
  const permissions = await readPermissions();
  const safeCommandIds = Array.isArray(commandIds)
    ? commandIds.map((id) => String(id || "").trim()).filter((id) => allowedCommands.has(id)).slice(0, 4)
    : ["npm-run-check"];
  const safeRun = {
    skipped: !runSafeChecks || !booleanPermission(permissions.runCommands) || !safeCommandIds.length,
    reason: "",
    results: []
  };

  if (!runSafeChecks) {
    safeRun.reason = "Validacao automatica desligada para este ciclo.";
  } else if (!booleanPermission(permissions.runCommands)) {
    safeRun.reason = "Permissao de comandos seguros desativada.";
  } else if (!safeCommandIds.length) {
    safeRun.reason = "Nenhum comando permitido foi selecionado.";
  } else {
    safeRun.skipped = false;
    for (const commandId of safeCommandIds) {
      try {
        const result = await runAllowedCommand(commandId);
        safeRun.results.push(result);
        recordExecutionEvidence({
          kind: "codex-cycle",
          stepId: cycleId,
          commandId,
          ok: true,
          summary: `Ciclo Codex executou ${commandId} com sucesso.`,
          stdout: result.stdout,
          stderr: result.stderr,
          metadata: { source: "codex-executor-cycle", objective: cleanObjective }
        });
      } catch (error) {
        const failed = {
          commandId,
          ok: false,
          error: error.message,
          stdout: error.stdout || "",
          stderr: error.stderr || ""
        };
        safeRun.results.push(failed);
        recordExecutionEvidence({
          kind: "codex-cycle",
          stepId: cycleId,
          commandId,
          ok: false,
          summary: `Ciclo Codex falhou em ${commandId}.`,
          stdout: failed.stdout,
          stderr: failed.stderr,
          error: failed.error,
          metadata: { source: "codex-executor-cycle", objective: cleanObjective }
        });
        break;
      }
    }
  }

  const checksOk = safeRun.skipped ? null : safeRun.results.every((result) => result.ok);
  const nextActions = [
    executorPlan.executionQueue?.find((step) => step.status === "pending-confirmation")?.action,
    checksOk === false ? "Corrigir a primeira falha registrada na Atividade e repetir a validacao." : "",
    "Abrir os arquivos provaveis, aplicar uma mudanca pequena e registrar evidencia antes de expandir."
  ].filter(Boolean);
  const summary = [
    "Ciclo Codex preparado.",
    `Projeto: ${path.basename(codexMode.rootDir || __dirname)}`,
    `Tipo: ${executorPlan.kind}`,
    safeRun.skipped ? `Checks: pulados (${safeRun.reason})` : `Checks: ${checksOk ? "OK" : "com falha"}`,
    `Arquivos provaveis: ${(executorPlan.likelyFiles || []).slice(0, 4).join(", ") || "a detectar"}`
  ].join("\n");

  recordExecutionEvidence({
    kind: "codex-cycle",
    stepId: cycleId,
    commandId: "prepare",
    ok: checksOk !== false,
    summary,
    stdout: `${codexMode.plan}\n\n${executorPlan.plan}`,
    stderr: "",
    metadata: {
      source: "codex-executor-cycle",
      objective: cleanObjective,
      startedAt,
      safeRun: { skipped: safeRun.skipped, reason: safeRun.reason }
    }
  });

  return {
    source: "codex-executor-cycle",
    cycleId,
    objective: cleanObjective,
    summary,
    codexMode,
    executorPlan,
    safeRun,
    nextActions,
    startedAt,
    finishedAt: new Date().toISOString()
  };
}

function detectAutopilotProfile(objective) {
  const text = String(objective || "").toLowerCase();
  const has = (patterns) => patterns.some((pattern) => pattern.test(text));
  const languages = [];
  if (has([/\bjava\b/, /\bspring\b/])) languages.push("java");
  if (has([/\bpython\b/, /\bdjango\b/, /\bfastapi\b/, /\bflask\b/])) languages.push("python");
  if (has([/\bhtml\b/, /\bcss\b/, /\bfront[- ]?end\b/, /\bfrontend\b/, /\bsite\b/, /\bweb\b/])) languages.push("html-css");
  if (has([/\bjavascript\b/, /\bnode\b/, /\breact\b/, /\bnext\b/, /\bvite\b/])) languages.push("javascript");
  if (!languages.length && has([/\bcrie\b/, /\bcriar\b/, /\bconstruir\b/, /\bprogramar\b/, /\bsistema\b/, /\bapp\b/])) {
    languages.push("javascript", "html-css");
  }

  let database = "sqlite";
  if (has([/\bpostgres\b/, /\bpostgresql\b/])) database = "postgresql";
  else if (has([/\bmysql\b/, /\bmariadb\b/])) database = "mysql";
  else if (has([/\bmongo\b/, /\bmongodb\b/])) database = "mongodb";
  else if (has([/\bsqlite\b/])) database = "sqlite";

  const kind = has([/\bsite\b/, /\bweb\b/, /\bfrontend\b/, /\bhtml\b/, /\bcss\b/, /\breact\b/, /\bnext\b/, /\bvite\b/])
    ? "web"
    : has([/\bapi\b/, /\bbackend\b/, /\bservidor\b/])
      ? "api"
      : "software";

  const frameworks = [];
  if (languages.includes("java")) frameworks.push(text.includes("spring") ? "Spring Boot" : "Java/Spring Boot");
  if (languages.includes("python")) frameworks.push(text.includes("django") ? "Django" : text.includes("flask") ? "Flask" : "FastAPI");
  if (languages.includes("javascript")) frameworks.push(text.includes("next") ? "Next.js" : text.includes("react") ? "React" : "Node.js");
  if (languages.includes("html-css")) frameworks.push("HTML/CSS responsivo");

  return {
    kind,
    languages: [...new Set(languages)],
    database,
    frameworks: [...new Set(frameworks)]
  };
}

function buildAutopilotLibraryPlan(profile) {
  const libraries = [];
  if (profile.languages.includes("java")) {
    libraries.push("Spring Web", "Spring Data JPA", "Flyway ou Liquibase", "JUnit", "Testcontainers");
  }
  if (profile.languages.includes("python")) {
    libraries.push("FastAPI/Django", "SQLAlchemy ou ORM nativo", "Pydantic", "pytest", "Alembic");
  }
  if (profile.languages.includes("javascript")) {
    libraries.push("Vite/Next.js", "Zod", "Prisma", "Vitest", "Playwright");
  }
  if (profile.languages.includes("html-css")) {
    libraries.push("HTML semantico", "CSS responsivo", "componentes acessiveis");
  }
  if (profile.database === "postgresql") libraries.push("PostgreSQL", "Docker Compose para banco local");
  if (profile.database === "mysql") libraries.push("MySQL/MariaDB", "Docker Compose para banco local");
  if (profile.database === "mongodb") libraries.push("MongoDB", "schema validation");
  if (profile.database === "sqlite") libraries.push("SQLite para primeira versao local");
  return [...new Set(libraries)];
}

function buildAutopilotPlanText({ objective, profile, libraries, executorPlan, scaffold, attachedProject }) {
  const projectMode = attachedProject
    ? `Projeto anexado: ${attachedProject.path}`
    : "Sem projeto externo anexado; vou criar artefatos novos em generated/ ate voce apontar uma pasta.";
  const scaffoldText = scaffold
    ? `\nScaffold criado\n- Pasta: ${scaffold.path}\n- Arquivos: ${scaffold.files.length}\n- Proximos passos: ${scaffold.nextSteps.join("; ")}`
    : "\nScaffold automatico: ainda nao criado para esta stack. Vou preparar a arquitetura e aguardar permissao/stack final antes de escrever arquivos fora de generated/.";

  return `Autopiloto Aurora
Pedido: ${objective}

Decisao automatica
- Tipo: ${profile.kind}
- Linguagens: ${profile.languages.join(", ") || "a definir"}
- Frameworks provaveis: ${profile.frameworks.join(", ") || "a definir"}
- Banco sugerido: ${profile.database}
- ${projectMode}

Bibliotecas e infraestrutura provaveis
${libraries.map((item) => `- ${item}`).join("\n")}

Plano de acao
1. Entender o objetivo e escolher a menor primeira versao funcional.
2. Definir entidades do banco, rotas, telas e validacoes.
3. Criar estrutura inicial e arquivos de configuracao.
4. Rodar checks seguros disponiveis.
5. Usar os erros como entrada para corrigir em ciclos.
6. Registrar evidencias, comandos e arquivos alterados.

Fila do executor
${(executorPlan.executionQueue || []).map((step, index) => `${index + 1}. ${step.title}: ${step.action}`).join("\n")}
${scaffoldText}

Limite seguro atual
- Posso criar artefatos em generated/ automaticamente.
- Para alterar um projeto anexado de verdade, o proximo passo e ativar o modo de edicao segura com diff, backup e confirmacao.`;
}

async function writeAutopilotArtifact({ objective, plan, profile }) {
  const rootDir = path.join(generatedDir, "autopilot");
  await mkdir(rootDir, { recursive: true });
  const slug = slugifyFileName(objective, "autopilot");
  const fullPath = path.join(rootDir, `${slug}-${Date.now()}.md`);
  const content = `# Autopiloto Aurora

${plan}

## Perfil detectado

\`\`\`json
${JSON.stringify(profile, null, 2)}
\`\`\`
`;
  await writeFile(fullPath, content, "utf8");
  return {
    path: toRelative(fullPath),
    url: `/generated/autopilot/${path.basename(fullPath)}`
  };
}

async function buildAutopilotPlan({ objective, fileContext = [], createScaffold = true }) {
  const cleanObjective = String(objective || "").trim();
  const profile = detectAutopilotProfile(cleanObjective);
  const libraries = buildAutopilotLibraryPlan(profile);
  const attachedProject = await readAttachedProject();
  const executorPlan = await buildExecutorPlan({ objective: cleanObjective, fileContext });
  let scaffold = null;

  if (createScaffold && profile.kind === "web" && !attachedProject) {
    const webPlan = await buildWebProjectPlan({
      objective: cleanObjective,
      appType: "saas",
      stack: profile.languages.includes("javascript") ? "nextjs" : "vite-express",
      database: profile.database,
      auth: "email",
      deployment: "docker",
      fileContext
    });
    scaffold = await writeWebScaffold(webPlan, cleanObjective);
  }

  const plan = buildAutopilotPlanText({
    objective: cleanObjective,
    profile,
    libraries,
    executorPlan,
    scaffold,
    attachedProject
  });
  const artifact = await writeAutopilotArtifact({ objective: cleanObjective, plan, profile });

  return {
    source: "autopilot-local",
    objective: cleanObjective,
    profile,
    libraries,
    plan,
    artifact,
    scaffold,
    executorPlan
  };
}

async function runAutopilotSafeChecks({ objective, commandIds = ["npm-run-check"] } = {}) {
  const permissions = await readPermissions();
  if (!booleanPermission(permissions.runCommands)) {
    return {
      skipped: true,
      reason: "Permissao de comandos desativada.",
      results: []
    };
  }

  const safeCommandIds = commandIds
    .map((id) => String(id || "").trim())
    .filter((id) => allowedCommands.has(id))
    .slice(0, 2);

  if (!safeCommandIds.length) {
    return {
      skipped: true,
      reason: "Nenhum comando seguro selecionado.",
      results: []
    };
  }

  const results = [];
  for (const commandId of safeCommandIds) {
    try {
      const result = await runAllowedCommand(commandId);
      const entry = {
        ...result,
        ok: true
      };
      results.push(entry);
      recordExecutionEvidence({
        kind: "autopilot-step",
        stepId: "autopilot-safe-check",
        commandId,
        ok: true,
        summary: `Autopiloto validou ${commandId} para: ${String(objective || "").slice(0, 160)}`,
        stdout: result.stdout,
        stderr: result.stderr,
        metadata: { source: "autopilot", objective }
      });
    } catch (error) {
      const entry = {
        commandId,
        ok: false,
        error: error.message,
        stdout: error.stdout || "",
        stderr: error.stderr || ""
      };
      results.push(entry);
      recordExecutionEvidence({
        kind: "autopilot-step",
        stepId: "autopilot-safe-check",
        commandId,
        ok: false,
        summary: `Autopiloto encontrou falha em ${commandId}.`,
        stdout: entry.stdout,
        stderr: entry.stderr,
        error: entry.error,
        metadata: { source: "autopilot", objective }
      });
      break;
    }
  }

  return {
    skipped: false,
    ok: results.every((result) => result.ok),
    results
  };
}

async function buildSecurityConstructionPlan({ objective, fileContext = [] }) {
  const projectProfile = await readProjectProfile();
  const projectIndex = await readProjectIndex();
  const codeMap = await readCodeMap();
  const lowerObjective = objective.toLowerCase();
  const candidates = new Set(Array.isArray(fileContext) ? fileContext.map((file) => file.path) : []);

  for (const file of projectIndex?.importantFiles || []) {
    const pathLower = file.path.toLowerCase();
    const inAssistant = pathLower.startsWith("ai-assistant/");
    if (
      inAssistant && (
        pathLower.includes("server") ||
        pathLower.includes("app.") ||
        pathLower.includes("config") ||
        pathLower.includes("package.json") ||
        pathLower.includes("readme") ||
        lowerObjective.includes("banco") && pathLower.includes("data")
      )
    ) {
      candidates.add(file.path);
    }
  }

  for (const file of codeMap?.files || []) {
    const pathLower = file.path.toLowerCase();
    if (
      file.endpoints?.length ||
      pathLower.includes("server") ||
      pathLower.includes("auth") ||
      pathLower.includes("login") ||
      pathLower.includes("database") ||
      pathLower.includes("sql")
    ) {
      candidates.add(file.path);
    }
  }

  const likelyFiles = [...candidates].slice(0, 12);
  const tests = projectProfile.testCommands || "npm test; node --check server.js; node --check public/app.js";
  const stack = projectProfile.stack || "Stack ainda nao informada.";
  const databaseInfo = projectProfile.database || "Banco ainda nao informado.";

  const plan = `Objetivo de seguranca
Construir com seguranca: ${objective}

Contexto atual
- Stack: ${stack}
- Banco: ${databaseInfo}

Arquivos provaveis para revisar
${likelyFiles.length ? likelyFiles.map((file) => `- ${file}`).join("\n") : "- Gere/atualize o indice e o mapa de codigo antes de revisar arquivos especificos."}

Modelo de ameacas rapido
1. Ativos: dados do usuario, dados internos, chaves, sessoes, arquivos locais e banco.
2. Entradas: formularios, prompts, uploads, parametros de rota, SQL, comandos e integracoes externas.
3. Fronteiras de confianca: navegador, backend local, Ollama, filesystem, SQLite e rede.
4. Atores: usuario legitimo, erro acidental, dependencia comprometida e uso indevido local.

Controles por construcao
- Validar e normalizar toda entrada antes de usar em SQL, caminhos, comandos ou prompts.
- Bloquear escrita perigosa por padrao e exigir permissao explicita para operacoes sensiveis.
- Usar allowlist para comandos, extensoes, rotas e caminhos editaveis.
- Criar backup antes de alterar arquivos e registrar auditoria de mudancas.
- Separar dados sensiveis de logs, historico de chat e respostas do modelo.
- Evitar segredos no repositorio; usar variaveis de ambiente quando houver tokens.
- Limitar tamanho de arquivos, prompts e resultados para reduzir travamentos e abuso.
- Registrar erros de forma util, mas sem vazar conteudo sensivel.
- Testar estados negados: SQL destrutivo, path traversal, arquivo grande, extensao proibida e permissao desligada.

Checklist antes de entregar
- Autenticacao/autorizacao: existe alguma acao que deveria exigir permissao?
- Dados: quais campos sao sensiveis e onde ficam salvos?
- Banco: consultas destrutivas estao bloqueadas ou protegidas por confirmacao?
- Arquivos: paths sao resolvidos dentro do workspace?
- Comandos: apenas allowlist, sem montar shell com entrada do usuario?
- IA: o modelo recebe so o contexto necessario e nao executa instrucoes externas automaticamente?
- Recuperacao: existe backup, restore e historico auditavel?

Testes recomendados
- ${tests}
- Testar uma entrada invalida para cada ferramenta sensivel.
- Conferir no navegador mensagens de erro e fluxos bloqueados.
- Rodar smoke test depois de cada nova permissao ou endpoint.
- Revisar logs/historicos para garantir que nao gravam segredo sem necessidade.`;

  return { plan, likelyFiles };
}

async function buildPlanningContext({ mode = "code", fileContext = [] } = {}) {
  const projectProfile = await readProjectProfile();
  const projectIndex = await readProjectIndex();
  const codeMap = await readCodeMap();
  const files = Array.isArray(fileContext) && fileContext.length
    ? fileContext.map((file) => `- ${file.path}`).join("\n")
    : "- Nenhum arquivo anexado";
  const importantFiles = (projectIndex?.importantFiles || [])
    .slice(0, 12)
    .map((file) => `- ${file.path}`)
    .join("\n");
  const codeFiles = (codeMap?.files || [])
    .filter((file) => file.path.startsWith("ai-assistant/") || file.endpoints?.length)
    .slice(0, 12)
    .map((file) => `- ${file.path}: ${(file.functions || []).slice(0, 8).join(", ")} ${(file.endpoints || []).slice(0, 6).join(", ")}`)
    .join("\n");
  const attachedFiles = (attachedProjectIndex?.importantFiles || [])
    .slice(0, 16)
    .map((file) => `- ${file.path}`)
    .join("\n");
  const attachedCodeFiles = (attachedProjectCodeMap?.files || [])
    .filter((file) => file.functions?.length || file.classes?.length || file.endpoints?.length)
    .slice(0, 16)
    .map((file) => `- ${file.path}: ${(file.functions || []).slice(0, 8).join(", ")} ${(file.classes || []).slice(0, 4).join(", ")}`)
    .join("\n");

  return `${getModePrompt(mode)}

Perfil do projeto:
${formatProfileForPrompt(projectProfile)}

Arquivos importantes:
${importantFiles || "- Indice nao gerado"}

Mapa de codigo resumido:
${codeFiles || "- Mapa de codigo nao gerado"}

Projeto anexado:
${attachedProject ? `${attachedProject.name} em ${attachedProject.path}` : "- Nenhum projeto anexado"}

Arquivos importantes do projeto anexado:
${attachedFiles || "- Analise a pasta anexada para listar arquivos importantes"}

Codigo relevante do projeto anexado:
${attachedCodeFiles || "- Mapa de codigo do projeto anexado ainda nao gerado"}

Arquivos anexados:
${files}`;
}

async function handleFiles(res) {
  const tree = await listFiles(workspaceDir);
  sendJson(res, 200, { root: workspaceDir, tree });
}

async function handleProjectIndex(req, res) {
  if (req.method === "GET") {
    sendJson(res, 200, { index: await readProjectIndex() });
    return;
  }

  const files = await collectIndexFiles(workspaceDir);
  const index = buildProjectIndex(files);
  await ensureMemory();
  await writeFile(projectIndexFile, JSON.stringify(index, null, 2), "utf8");
  sendJson(res, 200, { index });
}

async function analyzeAttachedProject(project) {
  const rootDir = project.path;
  const [indexFiles, codeFiles] = await Promise.all([
    collectIndexFiles(rootDir, [], 0, rootDir),
    collectCodeMapFiles(rootDir, [], 0, rootDir)
  ]);
  const index = buildProjectIndex(indexFiles, rootDir);
  const codeMap = buildCodeMap(codeFiles, rootDir);
  await writeFile(attachedProjectIndexFile, JSON.stringify(index, null, 2), "utf8");
  await writeFile(attachedProjectCodeMapFile, JSON.stringify(codeMap, null, 2), "utf8");
  return { index, codeMap };
}

async function handleAttachedProject(req, res) {
  if (req.method === "GET") {
    sendJson(res, 200, {
      project: await readAttachedProject(),
      index: await readAttachedProjectIndex(),
      codeMap: await readAttachedProjectCodeMap()
    });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  const body = await readJsonBody(req);
  const projectPath = await normalizeProjectFolder(body.path);
  const project = {
    name: String(body.name || path.basename(projectPath) || "Projeto anexado").trim(),
    path: projectPath,
    attachedAt: new Date().toISOString()
  };
  await writeFile(attachedProjectFile, JSON.stringify(project, null, 2), "utf8");
  const analysis = body.analyze === false ? { index: null, codeMap: null } : await analyzeAttachedProject(project);
  sendJson(res, 200, { project, ...analysis });
}

async function handleCodeMap(req, res) {
  if (req.method === "GET") {
    sendJson(res, 200, { codeMap: await readCodeMap() });
    return;
  }

  const files = await collectCodeMapFiles(workspaceDir);
  const codeMap = buildCodeMap(files);
  await ensureMemory();
  await writeFile(codeMapFile, JSON.stringify(codeMap, null, 2), "utf8");
  sendJson(res, 200, { codeMap });
}

async function handleProjectProfile(req, res) {
  if (req.method === "GET") {
    sendJson(res, 200, { profile: await readProjectProfile() });
    return;
  }

  const body = await readJsonBody(req);
  const profile = {
    stack: String(body.stack || "").trim(),
    database: String(body.database || "").trim(),
    runCommands: String(body.runCommands || "").trim(),
    testCommands: String(body.testCommands || "").trim(),
    goals: String(body.goals || "").trim(),
    notes: String(body.notes || "").trim(),
    updatedAt: new Date().toISOString()
  };

  await saveProjectProfile(profile);
  sendJson(res, 200, { profile });
}

async function handleChatHistory(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = normalizeSessionId(url.searchParams.get("session"));
  if (req.method === "GET") {
    sendJson(res, 200, await readChatHistory(sessionId));
    return;
  }

  if (req.method === "DELETE") {
    const empty = await saveChatHistory([], sessionId);
    sendJson(res, 200, empty);
    return;
  }

  const body = await readJsonBody(req);
  const saved = await saveChatHistory(body.messages || [], body.sessionId || sessionId, body.title || "");
  sendJson(res, 200, saved);
}

async function handleSessions(req, res) {
  await ensureMemory();
  const database = ensureDatabase();

  if (req.method === "GET") {
    const sessions = database.prepare("SELECT id, title, created_at AS createdAt, updated_at AS updatedAt FROM sessions ORDER BY updated_at DESC").all();
    sendJson(res, 200, { sessions });
    return;
  }

  if (req.method === "DELETE") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = normalizeSessionId(url.searchParams.get("id"));
    if (id !== "default") {
      database.prepare("DELETE FROM chat_messages WHERE session_id = ?").run(id);
      database.prepare("DELETE FROM sessions WHERE id = ?").run(id);
    }
    sendJson(res, 200, { sessions: database.prepare("SELECT id, title, created_at AS createdAt, updated_at AS updatedAt FROM sessions ORDER BY updated_at DESC").all() });
    return;
  }

  const body = await readJsonBody(req);
  const id = normalizeSessionId(body.id || crypto.randomUUID());
  const title = String(body.title || "Nova conversa").trim().slice(0, 120);
  const now = new Date().toISOString();
  database.prepare("INSERT OR REPLACE INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, COALESCE((SELECT created_at FROM sessions WHERE id = ?), ?), ?)").run(id, title, id, now, now);
  sendJson(res, 200, { id, title });
}

async function handleKnowledge(req, res) {
  const current = await readKnowledge();

  if (req.method === "GET") {
    sendJson(res, 200, current);
    return;
  }

  if (req.method === "DELETE") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get("id");
    const next = id ? current.items.filter((item) => item.id !== id) : [];
    sendJson(res, 200, await saveKnowledge(next));
    return;
  }

  const body = await readJsonBody(req);
  const item = {
    id: crypto.randomUUID(),
    category: body.category,
    title: body.title,
    content: body.content,
    createdAt: new Date().toISOString()
  };

  sendJson(res, 200, await saveKnowledge([item, ...current.items]));
}

async function handleResourceLibrary(req, res) {
  const current = await readResourceLibrary();

  if (req.method === "GET") {
    sendJson(res, 200, current);
    return;
  }

  if (req.method === "DELETE") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get("id");
    const next = id ? current.resources.filter((resource) => resource.id !== id) : [];
    sendJson(res, 200, await saveResourceLibrary(next));
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const resource = await scanResourceFolder(body.path, body.title);
    const next = [resource, ...current.resources.filter((item) => item.path !== resource.path)];
    sendJson(res, 200, await saveResourceLibrary(next));
  } catch (error) {
    sendJson(res, 400, { error: "Nao consegui cadastrar biblioteca.", detail: error.message });
  }
}

async function handlePlan(req, res) {
  try {
    const body = await readJsonBody(req);
    const task = String(body.task || "").trim();

    if (!task) {
      sendJson(res, 400, { error: "Descreva a tarefa para planejar." });
      return;
    }

    const result = await buildFastImplementationPlan({
      task,
      mode: body.mode || "code",
      fileContext: body.fileContext
    });
    sendJson(res, 200, { ...result, source: "fast-local" });
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui gerar o plano.", detail: error.message });
  }
}

function parseMissionRow(row) {
  return {
    id: row.id,
    title: row.title,
    objective: row.objective,
    status: row.status,
    priority: row.priority,
    needs: JSON.parse(row.needsJson || "[]"),
    actions: JSON.parse(row.actionsJson || "[]"),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

async function handleMissions(req, res) {
  await ensureMemory();
  const database = ensureDatabase();

  if (req.method === "GET") {
    const rows = database
      .prepare("SELECT id, title, objective, status, priority, needs_json AS needsJson, actions_json AS actionsJson, created_at AS createdAt, updated_at AS updatedAt FROM missions ORDER BY updated_at DESC LIMIT 50")
      .all();
    sendJson(res, 200, { missions: rows.map(parseMissionRow) });
    return;
  }

  if (req.method === "POST") {
    const body = await readJsonBody(req);
    const objective = String(body.objective || "").trim();
    if (!objective) {
      sendJson(res, 400, { error: "Descreva o objetivo da missao." });
      return;
    }

    const mission = await buildMissionFromObjective(objective, body.fileContext);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    database.prepare(`
      INSERT INTO missions (id, title, objective, status, priority, needs_json, actions_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      mission.title,
      mission.objective,
      "active",
      mission.priority,
      JSON.stringify(mission.needs),
      JSON.stringify(mission.actions),
      now,
      now
    );
    sendJson(res, 200, { mission: { id, status: "active", createdAt: now, updatedAt: now, ...mission } });
    return;
  }

  if (req.method === "PATCH") {
    const body = await readJsonBody(req);
    const id = String(body.id || "");
    const row = database
      .prepare("SELECT id, title, objective, status, priority, needs_json AS needsJson, actions_json AS actionsJson, created_at AS createdAt, updated_at AS updatedAt FROM missions WHERE id = ?")
      .get(id);
    if (!row) {
      sendJson(res, 404, { error: "Missao nao encontrada." });
      return;
    }

    const mission = parseMissionRow(row);
    if (body.status) mission.status = String(body.status).slice(0, 40);
    if (body.needId && body.needStatus) {
      mission.needs = mission.needs.map((need) => need.id === body.needId ? { ...need, status: String(body.needStatus).slice(0, 40) } : need);
    }
    if (body.actionId && body.actionStatus) {
      mission.actions = mission.actions.map((action) => action.id === body.actionId ? { ...action, status: String(body.actionStatus).slice(0, 40) } : action);
    }

    const now = new Date().toISOString();
    database.prepare("UPDATE missions SET status = ?, needs_json = ?, actions_json = ?, updated_at = ? WHERE id = ?")
      .run(mission.status, JSON.stringify(mission.needs), JSON.stringify(mission.actions), now, id);
    sendJson(res, 200, { mission: { ...mission, updatedAt: now } });
    return;
  }

  sendJson(res, 405, { error: "Metodo nao permitido." });
}

async function handleExecutorPlan(req, res) {
  try {
    const body = await readJsonBody(req);
    let objective = String(body.objective || "").trim();
    const missionId = String(body.missionId || "").trim();

    if (!objective && missionId) {
      const row = ensureDatabase()
        .prepare("SELECT objective FROM missions WHERE id = ?")
        .get(missionId);
      objective = String(row?.objective || "").trim();
    }

    if (!objective) {
      sendJson(res, 400, { error: "Descreva o objetivo para o executor avancado." });
      return;
    }

    const result = await buildExecutorPlan({
      objective,
      missionId,
      fileContext: body.fileContext
    });
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui preparar o executor avancado.", detail: error.message });
  }
}

async function handleAutopilotPlan(req, res) {
  try {
    const body = await readJsonBody(req);
    const objective = String(body.objective || body.task || "").trim();

    if (!objective) {
      sendJson(res, 400, { error: "Descreva o que voce quer que a Aurora construa." });
      return;
    }

    const result = await buildAutopilotPlan({
      objective,
      fileContext: body.fileContext,
      createScaffold: body.createScaffold !== false
    });
    const safeRun = body.runSafeChecks === false
      ? { skipped: true, reason: "Validacao automatica desativada nesta chamada.", results: [] }
      : await runAutopilotSafeChecks({
        objective,
        commandIds: Array.isArray(body.commandIds) ? body.commandIds : ["npm-run-check"]
      });
    sendJson(res, 200, { ...result, safeRun });
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui preparar o autopiloto.", detail: error.message });
  }
}

async function handleAutonomousTask(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const objective = String(body.objective || body.task || body.prompt || "").trim();
    const result = await orchestrateAutonomousTask({
      objective,
      fileContext: body.fileContext
    });
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui executar o orquestrador autonomo.", detail: error.message });
  }
}

async function handleCodexMode(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const result = await buildCodexMode({
      objective: body.objective || body.task || body.prompt || "",
      fileContext: body.fileContext,
      updateProfile: body.updateProfile !== false
    });
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui preparar o Modo Codex.", detail: error.message });
  }
}

async function handleCodexExecutor(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const objective = String(body.objective || body.task || body.prompt || "").trim();
    if (!objective) {
      sendJson(res, 400, { error: "Descreva o objetivo para o ciclo Codex." });
      return;
    }

    const result = await runCodexExecutorCycle({
      objective,
      missionId: body.missionId,
      fileContext: body.fileContext,
      runSafeChecks: body.runSafeChecks !== false,
      commandIds: Array.isArray(body.commandIds) ? body.commandIds : ["npm-run-check"]
    });
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui executar o ciclo Codex.", detail: error.message });
  }
}

async function handleGameCreatorPlan(req, res) {
  try {
    const body = await readJsonBody(req);
    const objective = String(body.objective || "").trim();

    if (!objective) {
      sendJson(res, 400, { error: "Descreva o jogo que voce quer criar." });
      return;
    }

    const result = await buildGameCreatorPlan({
      objective,
      fileContext: body.fileContext
    });
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui preparar o criador de jogos.", detail: error.message });
  }
}

async function handleWebProjectPlan(req, res) {
  try {
    const body = await readJsonBody(req);
    const objective = String(body.objective || "").trim();

    if (!objective) {
      sendJson(res, 400, { error: "Descreva o sistema web que voce quer construir." });
      return;
    }

    const result = await buildWebProjectPlan({
      objective,
      appType: body.appType,
      stack: body.stack,
      database: body.database,
      auth: body.auth,
      deployment: body.deployment,
      fileContext: body.fileContext
    });
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui preparar a fabrica web.", detail: error.message });
  }
}

async function handleWebProjectScaffold(req, res) {
  try {
    const body = await readJsonBody(req);
    const objective = String(body.objective || "").trim();

    if (!objective) {
      sendJson(res, 400, { error: "Descreva o sistema web que voce quer construir." });
      return;
    }

    const plan = await buildWebProjectPlan({
      objective,
      appType: body.appType,
      stack: body.stack,
      database: body.database,
      auth: body.auth,
      deployment: body.deployment,
      fileContext: body.fileContext
    });
    const scaffold = await writeWebScaffold(plan, String(body.projectName || "").trim());
    sendJson(res, 200, {
      ...plan,
      scaffold,
      message: `Scaffold criado em ${scaffold.path}`
    });
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui criar o scaffold web.", detail: error.message });
  }
}

async function handleSecurityPlan(req, res) {
  try {
    const body = await readJsonBody(req);
    const objective = String(body.objective || body.task || "").trim();

    if (!objective) {
      sendJson(res, 400, { error: "Descreva o que voce quer construir com seguranca." });
      return;
    }

    const result = await buildSecurityConstructionPlan({
      objective,
      fileContext: body.fileContext
    });
    sendJson(res, 200, { ...result, source: "security-local" });
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui gerar o plano de seguranca.", detail: error.message });
  }
}

async function handleSecurityAudit(req, res) {
  try {
    await ensureMemory();
    const url = new URL(req.url, `http://${req.headers.host}`);
    const scope = url.searchParams.get("scope") === "workspace" ? "workspace" : "app";
    const auditRoot = scope === "workspace" ? workspaceDir : __dirname;
    const { findings, stats } = await runSecurityAudit(auditRoot);
    const severityOrder = { high: 0, medium: 1, low: 2 };
    const sortedFindings = findings
      .sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9) || a.path.localeCompare(b.path) || a.line - b.line)
      .slice(0, securityAuditMaxFindings);
    const summary = {
      high: sortedFindings.filter((finding) => finding.severity === "high").length,
      medium: sortedFindings.filter((finding) => finding.severity === "medium").length,
      low: sortedFindings.filter((finding) => finding.severity === "low").length
    };
    sendJson(res, 200, {
      scope,
      root: toRelative(auditRoot),
      scannedFiles: stats.scannedFiles,
      skippedLargeFiles: stats.skippedLargeFiles,
      maxFindings: securityAuditMaxFindings,
      summary,
      findings: sortedFindings
    });
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui rodar a auditoria de seguranca.", detail: error.message });
  }
}

async function handlePortableCheck(req, res) {
  await ensureMemory();

  const [appStats, dataStats, generatedStats, publicStats, testsStats] = await Promise.all([
    collectPortableStats(__dirname),
    collectPortableStats(dataDir),
    collectPortableStats(generatedDir),
    collectPortableStats(publicDir),
    collectPortableStats(path.join(__dirname, "tests"))
  ]);

  let ollama = { online: false, models: [], error: "" };
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`);
    if (!response.ok) throw new Error(`Ollama respondeu ${response.status}`);
    const data = await response.json();
    ollama = { online: true, models: data.models?.map((model) => model.name) || [], error: "" };
  } catch (error) {
    ollama = { online: false, models: [], error: error.message };
  }

  const routes = await readModelRoutes();
  const capabilities = await buildCapabilityStatus();
  const gitTool = capabilities.tools.find((tool) => tool.command === "git");
  const recommendedCopy = [
    "server.js",
    "package.json",
    "README.md",
    "public/",
    "data/",
    "generated/",
    "tests/"
  ];
  const checklist = [
    { ok: existsSync(path.join(__dirname, "package.json")), item: "package.json presente" },
    { ok: existsSync(path.join(__dirname, "server.js")), item: "server.js presente" },
    { ok: publicStats.exists, item: "frontend public/ presente" },
    { ok: dataStats.exists && existsSync(appDbFile), item: "banco data/aurora.sqlite presente" },
    { ok: ollama.online, item: "Ollama respondendo neste PC" },
    { ok: ollama.models.includes(defaultModel), item: `modelo padrao instalado: ${defaultModel}` }
  ];
  const offlineReadiness = {
    ready: Boolean(ollama.online && ollama.models.includes(defaultModel) && existsSync(appDbFile)),
    summary: ollama.online && ollama.models.includes(defaultModel)
      ? "A Aurora continua operando sem internet para chat local, memoria, arquivos, SQL, Git local, executor e checks."
      : "A interface local continua abrindo, mas o chat offline depende do Ollama ligado e do modelo padrao instalado.",
    worksOffline: [
      { feature: "Interface local", ok: true, detail: `http://localhost:${port}` },
      { feature: "Memoria, sessoes e conhecimentos", ok: existsSync(appDbFile), detail: "SQLite local em data/aurora.sqlite" },
      { feature: "Chat com modelo local", ok: ollama.online && ollama.models.includes(defaultModel), detail: `${defaultModel} via Ollama` },
      { feature: "Leitura, busca e mapa de codigo", ok: true, detail: "Usa arquivos locais do workspace" },
      { feature: "Edicao assistida com backup", ok: true, detail: "Nao depende de rede para aplicar propostas locais" },
      { feature: "SQL local", ok: existsSync(appDbFile), detail: "Consultas no SQLite interno" },
      { feature: "Git status/diff/commits locais", ok: Boolean(gitTool?.available), detail: gitTool?.version || "Git nao detectado" },
      { feature: "Checks npm locais", ok: true, detail: "npm run check, npm test e npm run security" }
    ],
    needsInternet: [
      { feature: "GitHub push/pull/Actions", detail: "Sincronizacao online e validacoes no GitHub" },
      { feature: "Gemini/OpenRouter", detail: "Modelos externos dependem de internet e chave configurada" },
      { feature: "Downloads e instalacoes", detail: "winget, npm install, ollama pull e downloads de modelos" },
      { feature: "Busca web e APIs externas", detail: "Qualquer consulta fora da maquina local" }
    ],
    recommendations: [
      "Manter Ollama instalado e iniciar com ollama serve antes de usar chat offline.",
      `Baixar e testar o modelo ${defaultModel} enquanto houver internet.`,
      "Rodar npm run check, npm run security e npm test antes de ficar sem rede.",
      "Fazer commit local mesmo offline; quando a internet voltar, rodar git push.",
      "Nao depender de Gemini/OpenRouter para tarefas que precisam funcionar sem internet."
    ]
  };

  sendJson(res, 200, {
    appPath: __dirname,
    workspacePath: workspaceDir,
    nodeVersion: process.version,
    defaultModel,
    routes,
    ollama,
    offlineReadiness,
    stats: {
      app: appStats,
      data: dataStats,
      generated: generatedStats,
      public: publicStats,
      tests: testsStats
    },
    recommendedCopy,
    checklist,
    commands: [
      "ollama serve",
      `ollama pull ${defaultModel}`,
      "cd caminho\\para\\ai-assistant",
      "npm start"
    ],
    url: `http://localhost:${port}`
  });
}

async function handleCapabilities(req, res) {
  sendJson(res, 200, await buildCapabilityStatus());
}

async function handleToolRadar(req, res) {
  sendJson(res, 200, buildDeveloperToolRadar());
}

async function handlePlugins(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  sendJson(res, 200, await buildAuroraPlugins());
}

async function handleRepositoryEngineering(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  sendJson(res, 200, await buildRepositoryEngineeringStatus());
}

async function handleExecutionEvidence(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  sendJson(res, 200, { evidence: readExecutionEvidence(url.searchParams.get("limit") || 30) });
}

async function handleEngineeringTasks(req, res) {
  const database = ensureDatabase();

  if (req.method === "GET") {
    sendJson(res, 200, { tasks: readEngineeringTasks(20) });
    return;
  }

  if (req.method === "POST") {
    const body = await readJsonBody(req);
    const objective = String(body.objective || "").trim();
    if (!objective) {
      sendJson(res, 400, { error: "Descreva o objetivo da tarefa de engenharia." });
      return;
    }
    const now = new Date().toISOString();
    const title = String(body.title || objective).trim().slice(0, 120);
    const id = crypto.randomUUID();
    database
      .prepare(`
        INSERT INTO engineering_tasks (id, title, objective, status, evidence_since, result, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(id, title, objective.slice(0, 2000), "active", now, "", now, now);
    const row = database
      .prepare("SELECT id, title, objective, status, evidence_since AS evidenceSince, result, created_at AS createdAt, updated_at AS updatedAt FROM engineering_tasks WHERE id = ?")
      .get(id);
    sendJson(res, 200, { task: summarizeEngineeringTask(row) });
    return;
  }

  if (req.method === "PATCH") {
    const body = await readJsonBody(req);
    const id = String(body.id || "");
    const row = database
      .prepare("SELECT id, title, objective, status, evidence_since AS evidenceSince, result, created_at AS createdAt, updated_at AS updatedAt FROM engineering_tasks WHERE id = ?")
      .get(id);
    if (!row) {
      sendJson(res, 404, { error: "Tarefa de engenharia nao encontrada." });
      return;
    }
    const status = String(body.status || row.status).slice(0, 40);
    const result = String(body.result ?? row.result).slice(0, 4000);
    const now = new Date().toISOString();
    database.prepare("UPDATE engineering_tasks SET status = ?, result = ?, updated_at = ? WHERE id = ?")
      .run(status, result, now, id);
    const updated = database
      .prepare("SELECT id, title, objective, status, evidence_since AS evidenceSince, result, created_at AS createdAt, updated_at AS updatedAt FROM engineering_tasks WHERE id = ?")
      .get(id);
    sendJson(res, 200, { task: summarizeEngineeringTask(updated) });
    return;
  }

  sendJson(res, 405, { error: "Metodo nao permitido." });
}

async function handleRunEngineeringTask(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  const permissions = await readPermissions();
  if (!booleanPermission(permissions.runCommands)) {
    sendJson(res, 403, { error: "Permissao de comandos desativada." });
    return;
  }

  const body = await readJsonBody(req);
  const id = String(body.id || "");
  const database = ensureDatabase();
  const row = readEngineeringTaskRow(id);
  if (!row) {
    sendJson(res, 404, { error: "Tarefa de engenharia nao encontrada." });
    return;
  }

  const startedAt = new Date().toISOString();
  database.prepare("UPDATE engineering_tasks SET status = ?, result = ?, updated_at = ? WHERE id = ?")
    .run("running", "Executando checks seguros iniciais.", startedAt, id);

  const executorPlan = await buildExecutorPlan({ objective: row.objective, missionId: id });
  recordExecutionEvidence({
    kind: "engineering-plan",
    stepId: id,
    commandId: "executor-plan",
    ok: true,
    summary: `Plano de executor preparado para ${row.title}.`,
    stdout: executorPlan.plan,
    metadata: {
      taskId: id,
      likelyFiles: executorPlan.likelyFiles,
      queue: executorPlan.executionQueue?.map((step) => step.id)
    }
  });

  const commandIds = Array.isArray(body.commandIds) && body.commandIds.length
    ? body.commandIds.map((commandId) => String(commandId || "").trim()).filter(Boolean).slice(0, 4)
    : ["npm-run-check", "npm-test"];
  const results = [];

  for (const commandId of commandIds) {
    try {
      const result = await runAllowedCommand(commandId);
      results.push(result);
      recordExecutionEvidence({
        kind: "engineering-task",
        stepId: id,
        commandId,
        ok: true,
        summary: `Tarefa ${row.title} executou ${commandId} com sucesso.`,
        stdout: result.stdout,
        stderr: result.stderr,
        metadata: { taskId: id, source: "engineering-task-run" }
      });
    } catch (error) {
      const failed = {
        commandId,
        ok: false,
        error: error.message,
        stdout: error.stdout || "",
        stderr: error.stderr || ""
      };
      results.push(failed);
      recordExecutionEvidence({
        kind: "engineering-task",
        stepId: id,
        commandId,
        ok: false,
        summary: `Tarefa ${row.title} falhou ao executar ${commandId}.`,
        stdout: failed.stdout,
        stderr: failed.stderr,
        error: failed.error,
        metadata: { taskId: id, source: "engineering-task-run" }
      });
      break;
    }
  }

  const ok = results.every((result) => result.ok);
  const finishedAt = new Date().toISOString();
  const resultText = ok
    ? "Execucao segura inicial concluida. Revise evidencias, diffs e proximas acoes antes de aplicar mudancas maiores."
    : "Execucao segura inicial falhou. Revise a evidencia do comando com erro antes de continuar.";
  database.prepare("UPDATE engineering_tasks SET status = ?, result = ?, updated_at = ? WHERE id = ?")
    .run(ok ? "review" : "blocked", resultText, finishedAt, id);

  sendJson(res, ok ? 200 : 500, {
    ok,
    task: summarizeEngineeringTask(readEngineeringTaskRow(id)),
    executorPlan,
    results
  });
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function scoreFromChecks(checks) {
  const totalWeight = checks.reduce((total, check) => total + (check.weight || 1), 0) || 1;
  const earned = checks.reduce((total, check) => {
    const value = "value" in check ? clamp01(check.value) : (check.ok ? 1 : 0);
    return total + value * (check.weight || 1);
  }, 0);
  return Math.round((earned / totalWeight) * 100);
}

function benchmarkStatus(score) {
  if (score >= 60) return "meta";
  if (score >= 45) return "perto";
  if (score >= 30) return "base";
  return "baixo";
}

function createBenchmarkArea(id, name, weight, checks, nextActions = []) {
  const score = scoreFromChecks(checks);
  return {
    id,
    name,
    weight,
    score,
    status: benchmarkStatus(score),
    checks: checks.map(({ weight: _weight, ...check }) => check),
    nextActions
  };
}

function hasModelLike(models, fragments) {
  return models.some((model) => fragments.some((fragment) => model.includes(fragment)));
}

async function buildAuroraBenchmark() {
  await ensureMemory();
  const [
    ollama,
    routes,
    permissions,
    behavior,
    maintenance,
    projectIndex,
    codeMap,
    profile,
    knowledge,
    resourceLibrary,
    capabilities
  ] = await Promise.all([
    getOllamaStatus(),
    readModelRoutes(),
    readPermissions(),
    readBehaviorSettings(),
    getMaintenanceStatus("default"),
    readProjectIndex(),
    readCodeMap(),
    readProjectProfile(),
    readKnowledge(),
    readResourceLibrary(),
    buildCapabilityStatus()
  ]);

  const manifest = readPackageManifest();
  const models = ollama.models.map((model) => model.toLowerCase());
  const routeValues = Object.values(routes || {}).filter(Boolean);
  const uniqueRouteCount = new Set(routeValues.map((model) => model.toLowerCase())).size;
  const hasCoderModel = hasModelLike(models, ["qwen2.5-coder", "deepseek-coder", "codellama"]);
  const hasStrongCoderModel = hasModelLike(models, ["qwen2.5-coder:14b", "qwen3-coder", "gpt-oss:20b"]);
  const hasReasoningModel = hasModelLike(models, ["deepseek-r1", "llama3.1:8b", "gemma3"]);
  const hasBaseModel = hasModelLike(models, ["llama3.2:3b", "llama3.1:8b"]);
  const specializedRoutes = uniqueRouteCount > 1 || hasModelLike(routeValues.map((model) => model.toLowerCase()), ["qwen", "deepseek", "coder"]);
  const indexAgeMs = projectIndex?.generatedAt ? Date.now() - Date.parse(projectIndex.generatedAt) : Infinity;
  const codeMapAgeMs = codeMap?.generatedAt ? Date.now() - Date.parse(codeMap.generatedAt) : Infinity;
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const importantFiles = projectIndex?.importantFiles || [];
  const codeFiles = codeMap?.files || [];
  const profileFilled = [
    profile.stack,
    profile.database,
    profile.runCommands,
    profile.testCommands,
    profile.goals,
    profile.notes
  ].filter((value) => String(value || "").trim()).length;
  const toolAvailable = (command) => capabilities.tools?.some((tool) => tool.command === command && tool.available);
  const packageScripts = manifest.scripts || {};
  const testsDir = path.join(__dirname, "tests");
  const serverSource = readFileSync(path.join(__dirname, "server.js"), "utf8");
  const smokeSource = existsSync(path.join(testsDir, "smoke.mjs")) ? readFileSync(path.join(testsDir, "smoke.mjs"), "utf8") : "";
  const hasWebFactoryScaffold = serverSource.includes("/api/web-project-scaffold") && serverSource.includes("writeWebScaffold");
  const hasProductionScaffold = serverSource.includes("webProjectDockerfile") && serverSource.includes("webProjectDoctorScript");
  const hasCodeMapTemplateFilter = serverSource.includes("stripJsTemplateLiterals");
  const hasExecutorQueue = serverSource.includes("buildExecutorQueue") && serverSource.includes("executionQueue");
  const hasExecutorRunStep = serverSource.includes("/api/executor-run-step") && serverSource.includes("handleExecutorRunStep");
  const smokeCoversWebScaffold = smokeSource.includes("web scaffold should create Dockerfile") && smokeSource.includes("prisma/seed.mjs");

  const areas = [
    createBenchmarkArea("models", "Cerebro local", 45, [
      { label: "Ollama responde neste PC", ok: ollama.online, detail: ollama.error || "Online", weight: 1 },
      { label: "Ha pelo menos um modelo instalado", ok: ollama.models.length > 0, detail: ollama.models.join(", ") || "Nenhum", weight: 1 },
      { label: "Modelo base leve disponivel", value: hasBaseModel ? 1 : 0.3, detail: hasBaseModel ? "Llama local detectado" : "Instale um modelo base", weight: 1 },
      { label: "Modelo de programacao dedicado", value: hasCoderModel ? (hasStrongCoderModel ? 1 : 0.7) : 0, detail: hasCoderModel ? "Coder detectado" : "Falta qwen2.5-coder/deepseek-coder", weight: 2 },
      { label: "Modelo forte para o PC de casa", value: hasStrongCoderModel ? 1 : 0, detail: hasStrongCoderModel ? "Pronto para tarefas dificeis" : "Meta: qwen2.5-coder:14b ou gpt-oss:20b", weight: 2 },
      { label: "Rotas por modo especializadas", value: specializedRoutes ? 1 : 0.25, detail: `${uniqueRouteCount || 0} rota(s) distintas`, weight: 1.5 },
      { label: "Modelo de raciocinio/arquitetura", value: hasReasoningModel ? 1 : 0, detail: hasReasoningModel ? "Raciocinio detectado" : "Meta: deepseek-r1 ou equivalente", weight: 1.5 }
    ], [
      "No notebook, testar qwen2.5-coder:7b se a velocidade ficar aceitavel.",
      "No PC de casa, instalar qwen2.5-coder:14b e deepseek-r1:14b e aplicar rotas por modo."
    ]),
    createBenchmarkArea("context", "Memoria e contexto", 10, [
      { label: "Indice do projeto existe", ok: Boolean(projectIndex?.totalFiles), detail: `${projectIndex?.totalFiles || 0} arquivos mapeados`, weight: 1.5 },
      { label: "Indice esta recente", value: indexAgeMs < weekMs ? 1 : 0.35, detail: projectIndex?.generatedAt || "Nao gerado", weight: 1 },
      { label: "AGENTS.md esta no indice", ok: importantFiles.some((file) => file.path?.toLowerCase().endsWith("agents.md")), detail: "Manual interno para agentes", weight: 1 },
      { label: "Mapa de codigo existe", ok: Boolean(codeMap?.totalFiles || codeFiles.length), detail: `${codeMap?.totalFiles || codeFiles.length || 0} arquivos de codigo`, weight: 1.5 },
      { label: "Mapa de codigo esta recente", value: codeMapAgeMs < weekMs ? 1 : 0.45, detail: codeMap?.generatedAt || "Nao gerado", weight: 1 },
      { label: "Conhecimentos salvos", value: Math.min(1, (knowledge.items?.length || 0) / 8), detail: `${knowledge.items?.length || 0} itens`, weight: 1 },
      { label: "Bibliotecas externas cadastradas", value: Math.min(1, (resourceLibrary.resources?.length || 0) / 2), detail: `${resourceLibrary.resources?.length || 0} bibliotecas`, weight: 1 },
      { label: "Perfil do projeto preenchido", value: profileFilled / 6, detail: `${profileFilled}/6 campos`, weight: 1.5 },
      { label: "Historico e memoria no SQLite", ok: maintenance.sessionCount > 0 && maintenance.dbSize > 0, detail: `${maintenance.sessionCount} sessoes`, weight: 1 }
    ], [
      "Atualizar mapa de codigo depois de cada melhoria grande.",
      "Consolidar conhecimentos uteis para que entrem no contexto do chat."
    ]),
    createBenchmarkArea("agent", "Agente executor", 25, [
      { label: "Leitura de arquivos permitida", ok: booleanPermission(permissions.readFiles), detail: "Contexto de arquivos", weight: 1 },
      { label: "Proposta de edicao permitida", ok: booleanPermission(permissions.proposeEdits), detail: "Gera alteracoes antes de aplicar", weight: 1 },
      { label: "Aplicacao de edicoes com backup", ok: booleanPermission(permissions.applyEdits), detail: "Fluxo de patch e restore", weight: 1.5 },
      { label: "Historico de mudancas existe", value: maintenance.changeLogCount > 0 ? 0.8 : 0.4, detail: `${maintenance.changeLogCount} mudancas registradas`, weight: 1 },
      { label: "Comandos locais controlados", value: booleanPermission(permissions.runCommands) ? 0.65 : 0.25, detail: booleanPermission(permissions.runCommands) ? "Ativo" : "Desligado por permissao", weight: 1.5 },
      { label: "Allowlist de comandos", value: allowedCommands.size >= 4 ? 0.7 : 0.25, detail: `${allowedCommands.size} comandos seguros`, weight: 1 },
      { label: "Executor avancado ligado", value: booleanPermission(behavior.advancedExecutor) ? 0.75 : 0, detail: hasExecutorQueue ? "Planejamento com fila inicial" : "Ainda e planejamento textual", weight: 1 },
      { label: "Fabrica Web gera scaffold", value: hasWebFactoryScaffold ? 0.85 : 0, detail: hasWebFactoryScaffold ? "Plano + arquivos reais" : "Falta gerador de projeto", weight: 1.5 },
      { label: "Scaffold com base de producao", value: hasProductionScaffold ? 0.85 : 0, detail: hasProductionScaffold ? "Docker, doctor, testes e seguranca base" : "Falta fundacao robusta", weight: 1 },
      { label: "Missoes persistidas", value: maintenance.sessionCount > 0 ? 0.5 : 0.25, detail: "Base pronta para continuidade", weight: 1 },
      { label: "Fila estruturada do executor", value: hasExecutorQueue ? 0.55 : 0, detail: hasExecutorQueue ? "Etapas com status, risco e validacao" : "Ainda nao ha fila executavel", weight: 2 },
      { label: "Execucao assistida de etapa", value: hasExecutorRunStep ? 0.55 : 0, detail: hasExecutorRunStep ? "Roda comandos seguros da fila" : "Ainda nao executa etapas", weight: 2 },
      { label: "Loop autonomo completo", value: hasExecutorRunStep ? 0.28 : (hasExecutorQueue ? 0.18 : 0.1), detail: "Falta editar e corrigir automaticamente com confirmacao", weight: 2 },
      { label: "Correcao automatica apos testes", value: 0, detail: "Ainda nao implementado", weight: 2 },
      { label: "Estado de tarefas multi-etapa", value: hasExecutorQueue ? 0.65 : 0.35, detail: hasExecutorQueue ? "Fila inicial pronta para virar execucao" : "Missoes ajudam, mas ainda nao ha fila executavel", weight: 2 }
    ], [
      hasExecutorRunStep ? "Adicionar aplicacao assistida de edicoes pequenas dentro da fila." : "Adicionar execucao assistida da fila com confirmacao por etapa.",
      "Adicionar correcao guiada quando npm test ou npm run check falhar."
    ]),
    createBenchmarkArea("safety", "Seguranca defensiva", 7, [
      { label: "Painel de permissoes existe", ok: true, detail: "Leitura, edicao, comandos e SQL", weight: 1 },
      { label: "SQL destrutivo bloqueado por padrao", ok: !booleanPermission(permissions.sqlWrite), detail: "Escrita SQL desligada", weight: 1.5 },
      { label: "Comandos perigosos passam por allowlist", ok: allowedCommands.size > 0, detail: "Sem shell livre", weight: 1.5 },
      { label: "Backups antes de editar", ok: true, detail: "change_log e .bak", weight: 1 },
      { label: "Auditoria rapida de seguranca", ok: true, detail: "Endpoint /api/security-audit", weight: 1 },
      { label: "Caminhos presos ao workspace", ok: true, detail: "resolveWorkspacePath", weight: 1 },
      { label: "Modo seguranca no prompt", ok: Boolean(modePrompts.security), detail: "Foco defensivo", weight: 1 }
    ], [
      "Adicionar teste dedicado para path traversal e comandos negados.",
      "Evitar salvar segredos em memoria, historico ou conhecimento."
    ]),
    createBenchmarkArea("validation", "Testes e diagnostico", 8, [
      { label: "Script npm run check", ok: Boolean(packageScripts.check), detail: packageScripts.check || "Ausente", weight: 1 },
      { label: "Script npm test", ok: Boolean(packageScripts.test), detail: packageScripts.test || "Ausente", weight: 1 },
      { label: "Smoke test existe", ok: existsSync(path.join(testsDir, "smoke.mjs")), detail: "tests/smoke.mjs", weight: 1.5 },
      { label: "Diagnostico interno", ok: true, detail: "Endpoint /api/diagnostics", weight: 1 },
      { label: "Node detectado", ok: toolAvailable("node"), detail: "Ferramenta de execucao", weight: 1 },
      { label: "Git detectado", ok: toolAvailable("git"), detail: "Controle de versao", weight: 1 },
      { label: "Teste visual automatizado", value: hasPackage("@playwright/test", manifest) ? 1 : 0, detail: "Opcional para frontend", weight: 1 },
      { label: "Smoke cobre Fabrica Web", value: smokeCoversWebScaffold ? 1 : 0.35, detail: smokeCoversWebScaffold ? "Scaffold robusto validado" : "Cobrir Docker/doctor/seed", weight: 1 },
      { label: "Mapa ignora templates gerados", value: hasCodeMapTemplateFilter ? 1 : 0, detail: hasCodeMapTemplateFilter ? "Menos imports falsos" : "Pode confundir strings com codigo", weight: 1 }
    ], [
      "Adicionar testes para novos endpoints antes de empacotar para casa.",
      "Considerar Playwright quando a interface crescer."
    ]),
    createBenchmarkArea("portability", "Portabilidade", 5, [
      { label: "package.json presente", ok: existsSync(path.join(__dirname, "package.json")), detail: "Com scripts", weight: 1 },
      { label: "README presente", ok: existsSync(path.join(__dirname, "README.md")), detail: "Guia humano", weight: 1 },
      { label: "AGENTS.md presente", ok: existsSync(path.join(__dirname, "AGENTS.md")), detail: "Guia para agentes", weight: 1 },
      { label: "Banco local presente", ok: existsSync(appDbFile), detail: "data/aurora.sqlite", weight: 1.5 },
      { label: "Frontend presente", ok: existsSync(path.join(publicDir, "app.js")) && existsSync(path.join(publicDir, "index.html")), detail: "public/", weight: 1 },
      { label: "Testes presentes", ok: existsSync(testsDir), detail: "tests/", weight: 1 },
      { label: "Ferramentas base detectadas", value: ["node", "npm", "ollama"].filter(toolAvailable).length / 3, detail: "Node, npm e Ollama", weight: 1.5 }
    ], [
      "Antes de subir ao Google Drive, gerar zip da pasta newGame inteira.",
      "Em casa, instalar Node, Ollama e baixar os modelos fortes antes de abrir a Aurora."
    ])
  ];

  const totalWeight = areas.reduce((total, area) => total + area.weight, 0);
  const overallScore = Math.round(areas.reduce((total, area) => total + area.score * area.weight, 0) / totalWeight);
  const lowAreas = [...areas].sort((a, b) => a.score - b.score).slice(0, 2);

  return {
    generatedAt: new Date().toISOString(),
    targetScore: 60,
    overallScore,
    gapToTarget: Math.max(0, 60 - overallScore),
    status: benchmarkStatus(overallScore),
    installedModels: ollama.models,
    routes,
    areas,
    recommendedNextActions: [
      ...lowAreas.flatMap((area) => area.nextActions.slice(0, 1)),
      "Usar este benchmark como painel de progresso: melhorar uma area por vez e medir de novo."
    ].slice(0, 5)
  };
}

async function handleBenchmark(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  sendJson(res, 200, await buildAuroraBenchmark());
}

async function handleMaintenance(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = normalizeSessionId(url.searchParams.get("session"));

  if (req.method === "GET") {
    sendJson(res, 200, await getMaintenanceStatus(sessionId));
    return;
  }

  if (req.method === "POST") {
    const body = await readJsonBody(req);
    if (body.action === "compact-session") {
      const result = await compactChatSession(body.sessionId || sessionId);
      const status = await getMaintenanceStatus(body.sessionId || sessionId);
      sendJson(res, 200, { ...result, status });
      return;
    }

    if (body.action === "optimize-database") {
      const result = await optimizeLocalDatabase();
      const status = await getMaintenanceStatus(body.sessionId || sessionId);
      sendJson(res, 200, { optimized: true, ...result, status });
      return;
    }

    {
      sendJson(res, 400, { error: "Acao de manutencao desconhecida." });
      return;
    }
  }

  sendJson(res, 405, { error: "Metodo nao permitido." });
}

async function handlePermissions(req, res) {
  if (req.method === "GET") {
    sendJson(res, 200, { permissions: await readPermissions() });
    return;
  }

  const body = await readJsonBody(req);
  sendJson(res, 200, { permissions: await savePermissions(body) });
}

async function handleBehaviorSettings(req, res) {
  if (req.method === "GET") {
    sendJson(res, 200, { settings: await readBehaviorSettings() });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  const body = await readJsonBody(req);
  sendJson(res, 200, { settings: await saveBehaviorSettings(body) });
}

async function handleModelRoutes(req, res) {
  if (req.method === "GET") {
    sendJson(res, 200, { routes: await readModelRoutes() });
    return;
  }

  const body = await readJsonBody(req);
  sendJson(res, 200, { routes: await saveModelRoutes(body) });
}

function npmCommandSpec(args, timeout = 20_000) {
  return systemCommandSpec("npm", args, __dirname, timeout);
}

const allowedCommands = new Map([
  ["node-check-server", { command: "node", args: ["--check", "server.js"], cwd: __dirname }],
  ["node-check-app", { command: "node", args: ["--check", "public/app.js"], cwd: __dirname }],
  ["npm-run-check", npmCommandSpec(["run", "check"], 60_000)],
  ["npm-test", npmCommandSpec(["test"], 120_000)],
  ["git-status", systemCommandSpec("git", ["status", "--short"], __dirname, 20_000)],
  ["git-diff", systemCommandSpec("git", ["diff", "--", "."], __dirname, 20_000)],
  ["ollama-list", { command: "ollama", args: ["list"], cwd: __dirname }],
  ["npm-start-info", npmCommandSpec(["--version"])]
]);

function truncateEvidenceText(value, limit = 12_000) {
  const text = String(value || "");
  return text.length > limit ? `${text.slice(0, limit)}\n...[truncado]` : text;
}

function recordExecutionEvidence(entry) {
  const database = ensureDatabase();
  const now = new Date().toISOString();
  database.prepare(`
    INSERT INTO execution_evidence
      (id, kind, step_id, command_id, ok, summary, stdout, stderr, error, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    String(entry.kind || "command").slice(0, 80),
    String(entry.stepId || "").slice(0, 120),
    String(entry.commandId || "").slice(0, 120),
    entry.ok ? 1 : 0,
    String(entry.summary || "").slice(0, 500),
    truncateEvidenceText(entry.stdout),
    truncateEvidenceText(entry.stderr),
    truncateEvidenceText(entry.error, 4000),
    JSON.stringify(entry.metadata || {}),
    now
  );
}

function readExecutionEvidence(limit = 30) {
  const rows = ensureDatabase()
    .prepare(`
      SELECT id, kind, step_id AS stepId, command_id AS commandId, ok, summary, stdout, stderr, error, metadata_json AS metadataJson, created_at AS createdAt
      FROM execution_evidence
      ORDER BY created_at DESC
      LIMIT ?
    `)
    .all(Math.max(1, Math.min(100, Number(limit) || 30)));

  return rows.map((row) => ({
    ...row,
    ok: Boolean(row.ok),
    metadata: parseJsonSafe(row.metadataJson, {})
  }));
}

function summarizeEngineeringTask(row) {
  const evidence = ensureDatabase()
    .prepare(`
      SELECT id, kind, step_id AS stepId, command_id AS commandId, ok, summary, stdout, stderr, error, metadata_json AS metadataJson, created_at AS createdAt
      FROM execution_evidence
      WHERE created_at >= ?
      ORDER BY created_at DESC
      LIMIT 20
    `)
    .all(row.evidenceSince)
    .map((item) => ({
      ...item,
      ok: Boolean(item.ok),
      metadata: parseJsonSafe(item.metadataJson, {})
    }));
  const okCount = evidence.filter((item) => item.ok).length;
  const failedCount = evidence.filter((item) => !item.ok).length;

  return {
    id: row.id,
    title: row.title,
    objective: row.objective,
    status: row.status,
    result: row.result,
    evidenceSince: row.evidenceSince,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    evidence,
    summary: {
      totalEvidence: evidence.length,
      ok: okCount,
      failed: failedCount,
      diffs: evidence.filter((item) => item.kind === "code-diff").length,
      commands: evidence.filter((item) => ["executor-step", "engineering-task"].includes(item.kind)).length
    }
  };
}

function readEngineeringTasks(limit = 20) {
  const rows = ensureDatabase()
    .prepare(`
      SELECT id, title, objective, status, evidence_since AS evidenceSince, result, created_at AS createdAt, updated_at AS updatedAt
      FROM engineering_tasks
      ORDER BY updated_at DESC
      LIMIT ?
    `)
    .all(Math.max(1, Math.min(50, Number(limit) || 20)));
  return rows.map(summarizeEngineeringTask);
}

function readEngineeringTaskRow(id) {
  return ensureDatabase()
    .prepare("SELECT id, title, objective, status, evidence_since AS evidenceSince, result, created_at AS createdAt, updated_at AS updatedAt FROM engineering_tasks WHERE id = ?")
    .get(id);
}

async function runAllowedCommand(commandId) {
  const spec = allowedCommands.get(commandId);
  if (!spec) {
    const error = new Error("Comando nao permitido.");
    error.statusCode = 400;
    throw error;
  }

  const result = await execFileAsync(spec.command, spec.args, {
    cwd: spec.cwd,
    timeout: spec.timeout || 20_000,
    windowsHide: true
  });

  return {
    commandId,
    ok: true,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

async function handleCommand(req, res) {
  const permissions = await readPermissions();
  if (!booleanPermission(permissions.runCommands)) {
    sendJson(res, 403, { error: "Permissao de comandos desativada." });
    return;
  }

  if (req.method === "GET") {
    sendJson(res, 200, {
      commands: [...allowedCommands.keys()]
    });
    return;
  }

  const body = await readJsonBody(req);

  try {
    const result = await runAllowedCommand(String(body.commandId || ""));
    sendJson(res, 200, { stdout: result.stdout, stderr: result.stderr });
  } catch (error) {
    sendJson(res, error.statusCode || 500, { error: error.message, stdout: error.stdout, stderr: error.stderr });
  }
}

async function handleExecutorRunStep(req, res) {
  const permissions = await readPermissions();
  if (!booleanPermission(permissions.runCommands)) {
    sendJson(res, 403, { error: "Permissao de comandos desativada." });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  const body = await readJsonBody(req);
  const commandIds = Array.isArray(body.commandIds)
    ? body.commandIds.map((id) => String(id || "").trim()).filter(Boolean).slice(0, 3)
    : [];

  if (!commandIds.length) {
    sendJson(res, 400, { error: "Etapa sem comandos seguros para executar." });
    return;
  }

  const results = [];
  for (const commandId of commandIds) {
    try {
      const result = await runAllowedCommand(commandId);
      results.push(result);
      recordExecutionEvidence({
        kind: "executor-step",
        stepId: body.stepId,
        commandId,
        ok: true,
        summary: `Etapa ${body.stepId || "sem-id"} executou ${commandId} com sucesso.`,
        stdout: result.stdout,
        stderr: result.stderr,
        metadata: { source: "executor-run-step" }
      });
    } catch (error) {
      const failed = {
        commandId,
        ok: false,
        error: error.message,
        stdout: error.stdout || "",
        stderr: error.stderr || ""
      };
      results.push(failed);
      recordExecutionEvidence({
        kind: "executor-step",
        stepId: body.stepId,
        commandId,
        ok: false,
        summary: `Etapa ${body.stepId || "sem-id"} falhou ao executar ${commandId}.`,
        stdout: failed.stdout,
        stderr: failed.stderr,
        error: failed.error,
        metadata: { source: "executor-run-step" }
      });
      break;
    }
  }

  const ok = results.every((result) => result.ok);
  sendJson(res, ok ? 200 : 500, {
    stepId: String(body.stepId || "").slice(0, 80),
    ok,
    results,
    ranAt: new Date().toISOString()
  });
}

function isReadOnlySql(sql) {
  const normalized = String(sql || "").trim().toLowerCase();
  const withoutTrailingSemicolon = normalized.endsWith(";") ? normalized.slice(0, -1).trim() : normalized;
  const blockedWords = /\b(insert|update|delete|drop|alter|create|replace|truncate|attach|detach|vacuum|reindex)\b/;
  if (blockedWords.test(withoutTrailingSemicolon)) return false;
  if (withoutTrailingSemicolon.includes(";")) return false;
  return withoutTrailingSemicolon.startsWith("select") ||
    withoutTrailingSemicolon.startsWith("explain") ||
    withoutTrailingSemicolon.startsWith("pragma table_info") ||
    withoutTrailingSemicolon.startsWith("pragma index_list") ||
    withoutTrailingSemicolon.startsWith("pragma database_list");
}

function quoteSqlIdentifier(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

function readDatabaseSchema() {
  const db = ensureDatabase();
  const tableRows = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all();

  return tableRows.map((table) => {
    const quotedName = quoteSqlIdentifier(table.name);
    return {
      name: table.name,
      columns: db.prepare(`PRAGMA table_info(${quotedName})`).all().map((column) => ({
        name: column.name,
        type: column.type || "",
        notNull: Boolean(column.notnull),
        defaultValue: column.dflt_value,
        primaryKey: Boolean(column.pk)
      })),
      indexes: db.prepare(`PRAGMA index_list(${quotedName})`).all().map((index) => ({
        name: index.name,
        unique: Boolean(index.unique),
        origin: index.origin || "",
        partial: Boolean(index.partial)
      })),
      foreignKeys: db.prepare(`PRAGMA foreign_key_list(${quotedName})`).all().map((key) => ({
        from: key.from,
        table: key.table,
        to: key.to,
        onUpdate: key.on_update,
        onDelete: key.on_delete
      }))
    };
  });
}

function formatSchemaForPrompt(tables) {
  return tables.map((table) => {
    const columns = table.columns
      .map((column) => {
        const flags = [
          column.primaryKey ? "PK" : "",
          column.notNull ? "NOT NULL" : "",
          column.defaultValue !== null && column.defaultValue !== undefined ? `DEFAULT ${column.defaultValue}` : ""
        ].filter(Boolean).join(", ");
        return `  - ${column.name} ${column.type || ""}${flags ? ` (${flags})` : ""}`;
      })
      .join("\n");
    const indexes = table.indexes.length
      ? table.indexes.map((index) => `  - ${index.name}${index.unique ? " UNIQUE" : ""}`).join("\n")
      : "  - sem indices declarados";
    return `Tabela ${table.name}\nColunas:\n${columns}\nIndices:\n${indexes}`;
  }).join("\n\n");
}

function buildExplainQuery(sql) {
  const normalized = String(sql || "").trim().replace(/;+\s*$/, "");
  if (!normalized.toLowerCase().startsWith("select")) {
    throw new Error("A analise automatica aceita apenas SELECT.");
  }
  return `EXPLAIN QUERY PLAN ${normalized}`;
}

function recordSqlQuery({ sql, readOnly, success, rowCount = 0, durationMs = 0, error = "" }) {
  ensureDatabase()
    .prepare(`
      INSERT INTO sql_query_log (id, sql, read_only, success, row_count, duration_ms, error, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      crypto.randomUUID(),
      String(sql || "").slice(0, 5000),
      readOnly ? 1 : 0,
      success ? 1 : 0,
      Number(rowCount) || 0,
      Number(durationMs) || 0,
      String(error || "").slice(0, 1000),
      new Date().toISOString()
    );
}

async function handleSql(req, res) {
  await ensureMemory();

  if (req.method === "GET") {
    sendJson(res, 200, { database: appDbFile, tables: readDatabaseSchema() });
    return;
  }

  const permissions = await readPermissions();
  const body = await readJsonBody(req);
  const sql = String(body.sql || "").trim();
  if (!sql) {
    sendJson(res, 400, { error: "SQL vazio." });
    return;
  }

  const readOnly = isReadOnlySql(sql);
  const startedAt = Date.now();

  if (!readOnly && !booleanPermission(permissions.sqlWrite)) {
    recordSqlQuery({
      sql,
      readOnly,
      success: false,
      durationMs: Date.now() - startedAt,
      error: "SQL de escrita bloqueado. Ative permissao sqlWrite para permitir."
    });
    sendJson(res, 403, { error: "SQL de escrita bloqueado. Ative permissao sqlWrite para permitir." });
    return;
  }

  try {
    const statement = ensureDatabase().prepare(sql);
    const rows = readOnly ? statement.all() : (statement.run(), []);
    const limitedRows = rows.slice(0, 200);
    const durationMs = Date.now() - startedAt;
    recordSqlQuery({ sql, readOnly, success: true, rowCount: rows.length, durationMs });
    sendJson(res, 200, { rows: limitedRows, rowCount: rows.length, durationMs });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    recordSqlQuery({ sql, readOnly, success: false, durationMs, error: error.message });
    sendJson(res, 400, { error: error.message, durationMs });
  }
}

async function handleLocalDatabaseBuilder(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const result = await buildLocalDatabase({
      objective: body.objective || body.prompt || body.task,
      name: body.name
    });
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui criar o banco local.", detail: error.message });
  }
}

async function handleLocalDatabaseDocker(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const result = await runGeneratedDatabaseDocker({
      databaseDir: body.path || body.databaseDir,
      action: body.action || "status"
    });
    sendJson(res, result.ok || result.skipped ? 200 : 500, result);
  } catch (error) {
    sendJson(res, error.statusCode || 500, { error: "Nao consegui controlar o Docker do banco.", detail: error.message });
  }
}

async function handleSqlHistory(req, res) {
  await ensureMemory();
  const rows = ensureDatabase()
    .prepare(`
      SELECT
        id,
        sql,
        read_only AS readOnly,
        success,
        row_count AS rowCount,
        duration_ms AS durationMs,
        error,
        created_at AS createdAt
      FROM sql_query_log
      ORDER BY created_at DESC
      LIMIT 50
    `)
    .all()
    .map((row) => ({
      ...row,
      readOnly: Boolean(row.readOnly),
      success: Boolean(row.success)
    }));
  sendJson(res, 200, { queries: rows });
}

async function handleSqlAnalyze(req, res) {
  await ensureMemory();
  const body = await readJsonBody(req);
  const sql = String(body.sql || "").trim();
  if (!sql) {
    sendJson(res, 400, { error: "SQL vazio." });
    return;
  }

  let explainSql;
  try {
    explainSql = buildExplainQuery(sql);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }

  try {
    const schema = readDatabaseSchema();
    const planRows = ensureDatabase().prepare(explainSql).all();
    const prompt = `Analise esta consulta SQLite para programacao e banco de dados.

SQL:
${sql}

Plano do SQLite:
${JSON.stringify(planRows, null, 2)}

Schema disponivel:
${formatSchemaForPrompt(schema)}

Responda em portugues do Brasil com:
1. O que a consulta faz.
2. Como ler o plano.
3. Riscos de performance ou dados.
4. Indices ou ajustes recomendados, se houver.
Se nao houver informacao suficiente, diga exatamente o que falta.`;

    const analysis = await callOllamaChat({
      model: await chooseModel(body.model, "database"),
      temperature: 0.2,
      timeoutMs: 90_000,
      messages: [
        { role: "system", content: getModePrompt("database") },
        { role: "user", content: prompt }
      ]
    });

    sendJson(res, 200, { analysis, plan: planRows });
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui analisar o SQL.", detail: error.message });
  }
}

async function handleDiagnostics(req, res) {
  const checks = [];
  const commands = [
    ["server.js", "node", ["--check", "server.js"]],
    ["public/app.js", "node", ["--check", "public/app.js"]],
    ["ollama", "ollama", ["list"]]
  ];

  for (const [name, command, args] of commands) {
    try {
      const result = await execFileAsync(command, args, { cwd: __dirname, timeout: 20_000, windowsHide: true });
      checks.push({ name, ok: true, output: (result.stdout || result.stderr || "").slice(0, 4000) });
    } catch (error) {
      checks.push({ name, ok: false, output: String(error.stderr || error.stdout || error.message).slice(0, 4000) });
    }
  }

  sendJson(res, 200, { checks });
}

async function handleHealth(req, res) {
  await ensureMemory();
  const permissions = await readPermissions();
  const routes = await readModelRoutes();
  const sessionCount = ensureDatabase().prepare("SELECT COUNT(*) AS count FROM sessions").get().count;
  const changeCount = ensureDatabase().prepare("SELECT COUNT(*) AS count FROM change_log").get().count;

  sendJson(res, 200, {
    ok: true,
    app: "Aurora Local",
    database: {
      path: appDbFile,
      sessions: sessionCount,
      changes: changeCount
    },
    permissions,
    routes
  });
}

async function handleSearch(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const query = String(url.searchParams.get("q") || "").trim().toLowerCase();

  if (query.length < 2) {
    sendJson(res, 400, { error: "Digite pelo menos 2 caracteres." });
    return;
  }

  const results = await searchFiles(workspaceDir, query);
  sendJson(res, 200, { query, results });
}

async function handleRagSearch(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const query = String(url.searchParams.get("q") || "").trim();
  if (query.length < 2) {
    sendJson(res, 400, { error: "Digite pelo menos 2 caracteres." });
    return;
  }
  const results = await semanticSearchFiles(workspaceDir, query);
  sendJson(res, 200, { query, results });
}

async function handleReadFile(req, res) {
  let fullPath;
  let info;
  let target;

  try {
    const permissions = await readPermissions();
    if (!booleanPermission(permissions.readFiles)) {
      sendJson(res, 403, { error: "Permissao de leitura de arquivos desativada." });
      return;
    }
    const body = await readJsonBody(req);
    target = await resolveEditableTarget(body.path, body.scope);
    fullPath = target.fullPath;
    info = await stat(fullPath);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }

  if (!info.isFile()) {
    sendJson(res, 400, { error: "O caminho escolhido nao e um arquivo." });
    return;
  }

  if (info.size > 200_000) {
    sendJson(res, 400, { error: "Arquivo grande demais para esta v1. Limite: 200 KB." });
    return;
  }

  const ext = path.extname(fullPath).toLowerCase();
  if (!textExtensions.has(ext)) {
    sendJson(res, 400, { error: "Esta v1 le apenas arquivos de texto/codigo." });
    return;
  }

  const content = await readFile(fullPath, "utf8");
  sendJson(res, 200, { path: target.relativePath, scope: target.scope, content });
}

async function loadEditableFile(filePath, scope = "") {
  const target = await resolveEditableTarget(filePath, scope);
  const fullPath = target.fullPath;
  const info = await stat(fullPath);

  if (!info.isFile()) throw new Error("O caminho escolhido nao e um arquivo.");
  if (info.size > 120_000) throw new Error("Arquivo grande demais para edicao nesta v1. Limite: 120 KB.");

  const ext = path.extname(fullPath).toLowerCase();
  if (!textExtensions.has(ext)) throw new Error("Esta v1 edita apenas arquivos de texto/codigo.");

  return {
    fullPath,
    rootDir: target.rootDir,
    scope: target.scope,
    relativePath: target.relativePath,
    content: await readFile(fullPath, "utf8")
  };
}

async function generateFileEditProposal({ file, task, mode = "code", model = "", extraContext = "" }) {
  const profileContext = formatProfileForPrompt(await readProjectProfile());
  const proposed = await callOllamaChat({
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: `${editInstruction}\n\n${getModePrompt(mode)}\n\nPerfil do projeto:\n${profileContext}` },
      {
        role: "user",
        content: `Arquivo: ${file.relativePath}\n\nTarefa: ${task}${extraContext ? `\n\nContexto adicional:\n${extraContext}` : ""}\n\nConteudo atual:\n${file.content}`
      }
    ]
  });
  return proposed.trimEnd();
}

async function applyEditableFileContent({ file, proposed, reason = "Edicao aplicada pela Aurora.", stepId = "apply-edit" }) {
  const backupPath = `${file.fullPath}.${new Date().toISOString().replace(/[:.]/g, "-")}.bak`;
  const patch = createUnifiedPatch(file.content, proposed, file.relativePath);
  const cleanReason = String(reason || "Edicao aplicada pela Aurora.").slice(0, 1000);
  const backupRelativePath = file.scope === "attached"
    ? `attached-project/${toRootRelative(backupPath, file.rootDir)}`
    : toRelative(backupPath);

  await writeFile(backupPath, file.content, "utf8");
  await writeFile(file.fullPath, proposed, "utf8");
  ensureDatabase()
    .prepare("INSERT INTO change_log (id, file_path, backup_path, patch, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(
      crypto.randomUUID(),
      file.relativePath,
      backupRelativePath,
      patch,
      cleanReason,
      new Date().toISOString()
    );
  recordExecutionEvidence({
    kind: "code-diff",
    stepId,
    commandId: "apply-edit",
    ok: true,
    summary: `Edicao aplicada em ${file.relativePath}.`,
    stdout: patch,
    stderr: "",
    metadata: {
      path: file.relativePath,
      backup: backupRelativePath,
      reason: cleanReason
    }
  });

  return {
    path: file.relativePath,
    backup: backupRelativePath,
    scope: file.scope,
    patch
  };
}

async function handleProposeEdit(req, res) {
  try {
    const permissions = await readPermissions();
    if (!booleanPermission(permissions.proposeEdits)) {
      sendJson(res, 403, { error: "Permissao de proposta de edicao desativada." });
      return;
    }
    const body = await readJsonBody(req);
    const task = String(body.task || "").trim();
    if (!task) {
      sendJson(res, 400, { error: "Descreva a edicao desejada." });
      return;
    }

    const file = await loadEditableFile(body.path, body.scope);
    const proposed = await generateFileEditProposal({
      file,
      task,
      mode: body.mode,
      model: body.model
    });

    sendJson(res, 200, {
      path: file.relativePath,
      original: file.content,
      proposed
    });
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui gerar a proposta.", detail: error.message });
  }
}

async function handleApplyEdit(req, res) {
  try {
    const permissions = await readPermissions();
    if (!booleanPermission(permissions.applyEdits)) {
      sendJson(res, 403, { error: "Permissao de aplicar edicoes desativada." });
      return;
    }
    const body = await readJsonBody(req);
    const proposed = String(body.proposed || "");
    if (!proposed.trim()) {
      sendJson(res, 400, { error: "Proposta vazia." });
      return;
    }

    const file = await loadEditableFile(body.path, body.scope);
    const result = await applyEditableFileContent({
      file,
      proposed,
      reason: body.reason || body.task || "Edicao aplicada pela Aurora.",
      stepId: String(body.stepId || "apply-edit")
    });

    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui aplicar a edicao.", detail: error.message });
  }
}

async function runEditCycleChecks(commandIds = ["npm-run-check"]) {
  const safeCommandIds = commandIds
    .map((id) => String(id || "").trim())
    .filter((id) => allowedCommands.has(id))
    .slice(0, 2);
  const results = [];

  for (const commandId of safeCommandIds) {
    try {
      const result = await runAllowedCommand(commandId);
      results.push({ ...result, ok: true });
      recordExecutionEvidence({
        kind: "edit-cycle-check",
        stepId: "safe-edit-cycle",
        commandId,
        ok: true,
        summary: `Ciclo de edicao validou ${commandId}.`,
        stdout: result.stdout,
        stderr: result.stderr,
        metadata: { source: "safe-edit-cycle" }
      });
    } catch (error) {
      const failed = {
        commandId,
        ok: false,
        error: error.message,
        stdout: error.stdout || "",
        stderr: error.stderr || ""
      };
      results.push(failed);
      recordExecutionEvidence({
        kind: "edit-cycle-check",
        stepId: "safe-edit-cycle",
        commandId,
        ok: false,
        summary: `Ciclo de edicao falhou em ${commandId}.`,
        stdout: failed.stdout,
        stderr: failed.stderr,
        error: failed.error,
        metadata: { source: "safe-edit-cycle" }
      });
      break;
    }
  }

  return {
    ok: results.length > 0 && results.every((result) => result.ok),
    results
  };
}

async function handleSafeEditCycle(req, res) {
  try {
    const permissions = await readPermissions();
    if (!booleanPermission(permissions.proposeEdits) || !booleanPermission(permissions.applyEdits) || !booleanPermission(permissions.runCommands)) {
      sendJson(res, 403, { error: "Ciclo seguro exige permissoes de proposta, aplicacao e comandos." });
      return;
    }

    const body = await readJsonBody(req);
    const task = String(body.task || "").trim();
    if (!task) {
      sendJson(res, 400, { error: "Descreva a edicao desejada." });
      return;
    }

    const commandIds = Array.isArray(body.commandIds) ? body.commandIds : ["npm-run-check"];
    const attempts = [];
    let file = await loadEditableFile(body.path, body.scope);
    let proposed = await generateFileEditProposal({
      file,
      task,
      mode: body.mode,
      model: body.model
    });
    let applied = await applyEditableFileContent({
      file,
      proposed,
      reason: `Ciclo seguro: ${task}`,
      stepId: "safe-edit-cycle"
    });
    let checks = await runEditCycleChecks(commandIds);
    attempts.push({ round: 1, applied, checks });

    if (!checks.ok && body.autoRepair !== false) {
      const failure = checks.results.find((result) => !result.ok) || {};
      file = await loadEditableFile(applied.path, applied.scope);
      proposed = await generateFileEditProposal({
        file,
        task: `Corrija a edicao anterior mantendo o objetivo original: ${task}`,
        mode: body.mode,
        model: body.model,
        extraContext: `O check falhou.\nComando: ${failure.commandId || ""}\nErro: ${failure.error || ""}\nstdout:\n${failure.stdout || ""}\nstderr:\n${failure.stderr || ""}`
      });
      applied = await applyEditableFileContent({
        file,
        proposed,
        reason: `Ciclo seguro - correcao apos falha: ${task}`,
        stepId: "safe-edit-cycle-repair"
      });
      checks = await runEditCycleChecks(commandIds);
      attempts.push({ round: 2, applied, checks });
    }

    const ok = attempts.at(-1)?.checks?.ok || false;
    sendJson(res, ok ? 200 : 500, {
      ok,
      path: attempts.at(-1)?.applied?.path,
      attempts,
      message: ok
        ? "Ciclo seguro concluiu com validacao verde."
        : "Ciclo seguro aplicou mudancas, mas a validacao ainda falhou. Revise diffs e evidencias."
    });
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui executar o ciclo seguro.", detail: error.message });
  }
}

function createUnifiedPatch(original, proposed, filePath) {
  const oldLines = String(original || "").split("\n");
  const newLines = String(proposed || "").split("\n");
  const lines = [`--- ${filePath}`, `+++ ${filePath}`];
  const max = Math.max(oldLines.length, newLines.length);

  for (let index = 0; index < max; index += 1) {
    const oldLine = oldLines[index];
    const newLine = newLines[index];
    if (oldLine === newLine) continue;
    if (oldLine !== undefined) lines.push(`-${oldLine}`);
    if (newLine !== undefined) lines.push(`+${newLine}`);
  }

  return lines.join("\n");
}

async function handlePatch(req, res) {
  const body = await readJsonBody(req);
  const file = await loadEditableFile(body.path, body.scope);
  const proposed = String(body.proposed || "");
  sendJson(res, 200, {
    path: file.relativePath,
    patch: createUnifiedPatch(file.content, proposed, file.relativePath)
  });
}

async function handleCreateDocument(req, res) {
  try {
    const permissions = await readPermissions();
    if (!booleanPermission(permissions.applyEdits)) {
      sendJson(res, 403, { error: "Permissao de aplicar edicoes desativada." });
      return;
    }

    const body = await readJsonBody(req);
    const type = ["markdown", "csv", "html"].includes(body.type) ? body.type : "markdown";
    const title = String(body.title || "").trim();
    const generated = buildGeneratedDocument({ type, title, content: body.content });
    const baseName = slugifyFileName(body.fileName || title || "documento");
    const fullPath = path.join(generatedDir, `${baseName}${generated.extension}`);

    await mkdir(generatedDir, { recursive: true });
    await writeFile(fullPath, generated.content, "utf8");

    sendJson(res, 200, {
      path: toRelative(fullPath),
      type,
      size: Buffer.byteLength(generated.content, "utf8")
    });
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui criar o documento.", detail: error.message });
  }
}

async function handleChangeLog(req, res) {
  await ensureMemory();
  const url = new URL(req.url, `http://${req.headers.host}`);
  const id = url.searchParams.get("id");

  if (id) {
    const change = ensureDatabase()
      .prepare("SELECT id, file_path AS filePath, backup_path AS backupPath, patch, reason, created_at AS createdAt FROM change_log WHERE id = ?")
      .get(id);
    sendJson(res, change ? 200 : 404, change || { error: "Alteracao nao encontrada." });
    return;
  }

  const changes = ensureDatabase()
    .prepare("SELECT id, file_path AS filePath, backup_path AS backupPath, reason, created_at AS createdAt FROM change_log ORDER BY created_at DESC LIMIT 100")
    .all();
  sendJson(res, 200, { changes });
}

async function handleRestoreChange(req, res) {
  const permissions = await readPermissions();
  if (!booleanPermission(permissions.applyEdits)) {
    sendJson(res, 403, { error: "Permissao de aplicar edicoes desativada." });
    return;
  }

  const body = await readJsonBody(req);
  const id = String(body.id || "");
  const change = ensureDatabase()
    .prepare("SELECT id, file_path AS filePath, backup_path AS backupPath FROM change_log WHERE id = ?")
    .get(id);

  if (!change) {
    sendJson(res, 404, { error: "Alteracao nao encontrada." });
    return;
  }

  try {
    const currentPath = await resolveLoggedPath(change.filePath);
    const backupPath = await resolveLoggedPath(change.backupPath);
    const current = await readFile(currentPath, "utf8");
    const backup = await readFile(backupPath, "utf8");
    const rollbackBackup = `${currentPath}.${new Date().toISOString().replace(/[:.]/g, "-")}.restore.bak`;
    const rollbackBackupRelative = change.filePath.startsWith("attached-project/")
      ? `attached-project/${toRootRelative(rollbackBackup, path.resolve((await readAttachedProject()).path))}`
      : toRelative(rollbackBackup);
    const patch = createUnifiedPatch(current, backup, change.filePath);

    await writeFile(rollbackBackup, current, "utf8");
    await writeFile(currentPath, backup, "utf8");

    ensureDatabase()
      .prepare("INSERT INTO change_log (id, file_path, backup_path, patch, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(
        crypto.randomUUID(),
        change.filePath,
        rollbackBackupRelative,
        patch,
        `Restauracao do backup ${change.backupPath}`,
        new Date().toISOString()
      );

    sendJson(res, 200, {
      path: change.filePath,
      restoredFrom: change.backupPath,
      backup: rollbackBackupRelative
    });
  } catch (error) {
    sendJson(res, 500, { error: "Nao consegui restaurar backup.", detail: error.message });
  }
}

function parseLocalPreviewUrl(value) {
  const raw = String(value || "").trim();
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
  const url = new URL(withProtocol);
  const allowedHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  if (!allowedHosts.has(url.hostname)) {
    const error = new Error("Preview permite apenas localhost, 127.0.0.1 ou ::1.");
    error.statusCode = 400;
    throw error;
  }
  return url;
}

async function handleWebPreviewCheck(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  let target;
  try {
    target = parseLocalPreviewUrl(requestUrl.searchParams.get("url"));
  } catch (error) {
    sendJson(res, error.statusCode || 400, { ok: false, error: error.message });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  const startedAt = Date.now();

  try {
    const response = await fetch(target, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal
    });
    const contentType = response.headers.get("content-type") || "";
    const text = contentType.includes("text/html") ? await response.text() : "";
    const title = text.match(/<title[^>]*>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, " ").trim() || "";
    sendJson(res, 200, {
      ok: response.ok,
      url: target.toString(),
      status: response.status,
      statusText: response.statusText,
      contentType,
      title,
      durationMs: Date.now() - startedAt
    });
  } catch (error) {
    sendJson(res, 200, {
      ok: false,
      url: target.toString(),
      error: error.name === "AbortError" ? "Tempo esgotado ao checar preview." : error.message,
      durationMs: Date.now() - startedAt
    });
  } finally {
    clearTimeout(timeout);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/api/models") return handleModels(res);
    if (url.pathname === "/api/model-advisor" && req.method === "GET") return handleModelAdvisor(req, res);
    if (url.pathname === "/api/health" && req.method === "GET") return handleHealth(req, res);
    if (url.pathname === "/api/ai-providers") return handleAiProviders(req, res);
    if (url.pathname === "/api/image-providers") return handleImageProviders(req, res);
    if (url.pathname === "/api/chat" && req.method === "POST") return handleChat(req, res);
    if (url.pathname === "/api/create-image") return handleCreateImage(req, res);
    if (url.pathname === "/api/chat-history") return handleChatHistory(req, res);
    if (url.pathname === "/api/sessions") return handleSessions(req, res);
    if (url.pathname === "/api/plan" && req.method === "POST") return handlePlan(req, res);
    if (url.pathname === "/api/missions") return handleMissions(req, res);
    if (url.pathname === "/api/executor-plan" && req.method === "POST") return handleExecutorPlan(req, res);
    if (url.pathname === "/api/autopilot-plan" && req.method === "POST") return handleAutopilotPlan(req, res);
    if (url.pathname === "/api/autonomous-task") return handleAutonomousTask(req, res);
    if (url.pathname === "/api/codex-mode") return handleCodexMode(req, res);
    if (url.pathname === "/api/codex-executor") return handleCodexExecutor(req, res);
    if (url.pathname === "/api/game-creator-plan" && req.method === "POST") return handleGameCreatorPlan(req, res);
    if (url.pathname === "/api/web-project-plan" && req.method === "POST") return handleWebProjectPlan(req, res);
    if (url.pathname === "/api/web-project-scaffold" && req.method === "POST") return handleWebProjectScaffold(req, res);
    if (url.pathname === "/api/web-preview-check") return handleWebPreviewCheck(req, res);
    if (url.pathname === "/api/security-plan" && req.method === "POST") return handleSecurityPlan(req, res);
    if (url.pathname === "/api/security-audit" && req.method === "GET") return handleSecurityAudit(req, res);
    if (url.pathname === "/api/portable-check" && req.method === "GET") return handlePortableCheck(req, res);
    if (url.pathname === "/api/capabilities" && req.method === "GET") return handleCapabilities(req, res);
    if (url.pathname === "/api/tool-radar" && req.method === "GET") return handleToolRadar(req, res);
    if (url.pathname === "/api/plugins") return handlePlugins(req, res);
    if (url.pathname === "/api/repository-engineering") return handleRepositoryEngineering(req, res);
    if (url.pathname === "/api/execution-evidence") return handleExecutionEvidence(req, res);
    if (url.pathname === "/api/engineering-tasks") return handleEngineeringTasks(req, res);
    if (url.pathname === "/api/engineering-tasks/run") return handleRunEngineeringTask(req, res);
    if (url.pathname === "/api/benchmark") return handleBenchmark(req, res);
    if (url.pathname === "/api/maintenance") return handleMaintenance(req, res);
    if (url.pathname === "/api/permissions") return handlePermissions(req, res);
    if (url.pathname === "/api/behavior-settings") return handleBehaviorSettings(req, res);
    if (url.pathname === "/api/model-routes") return handleModelRoutes(req, res);
    if (url.pathname === "/api/command") return handleCommand(req, res);
    if (url.pathname === "/api/executor-run-step") return handleExecutorRunStep(req, res);
    if (url.pathname === "/api/sql") return handleSql(req, res);
    if (url.pathname === "/api/local-database" && req.method === "POST") return handleLocalDatabaseBuilder(req, res);
    if (url.pathname === "/api/local-database/docker") return handleLocalDatabaseDocker(req, res);
    if (url.pathname === "/api/sql-history" && req.method === "GET") return handleSqlHistory(req, res);
    if (url.pathname === "/api/sql-analyze" && req.method === "POST") return handleSqlAnalyze(req, res);
    if (url.pathname === "/api/diagnostics" && req.method === "GET") return handleDiagnostics(req, res);
    if (url.pathname === "/api/memory") return handleMemory(req, res);
    if (url.pathname === "/api/knowledge") return handleKnowledge(req, res);
    if (url.pathname === "/api/resource-library") return handleResourceLibrary(req, res);
    if (url.pathname === "/api/files" && req.method === "GET") return handleFiles(res);
    if (url.pathname === "/api/attached-project") return handleAttachedProject(req, res);
    if (url.pathname === "/api/project-index") return handleProjectIndex(req, res);
    if (url.pathname === "/api/code-map") return handleCodeMap(req, res);
    if (url.pathname === "/api/project-profile") return handleProjectProfile(req, res);
    if (url.pathname === "/api/search" && req.method === "GET") return handleSearch(req, res);
    if (url.pathname === "/api/rag-search" && req.method === "GET") return handleRagSearch(req, res);
    if (url.pathname === "/api/read-file" && req.method === "POST") return handleReadFile(req, res);
    if (url.pathname === "/api/propose-edit" && req.method === "POST") return handleProposeEdit(req, res);
    if (url.pathname === "/api/apply-edit" && req.method === "POST") return handleApplyEdit(req, res);
    if (url.pathname === "/api/safe-edit-cycle" && req.method === "POST") return handleSafeEditCycle(req, res);
    if (url.pathname === "/api/patch" && req.method === "POST") return handlePatch(req, res);
    if (url.pathname === "/api/create-document" && req.method === "POST") return handleCreateDocument(req, res);
    if (url.pathname === "/api/change-log" && req.method === "GET") return handleChangeLog(req, res);
    if (url.pathname === "/api/restore-change" && req.method === "POST") return handleRestoreChange(req, res);

    if (url.pathname.startsWith("/generated/")) return serveGenerated(req, res);
    return serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`Aurora local rodando em http://localhost:${port}`);
});
