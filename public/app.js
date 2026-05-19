const messagesEl = document.querySelector("#messages");
const form = document.querySelector("#chatForm");
const promptEl = document.querySelector("#prompt");
const statusEl = document.querySelector("#status");
const clearChatEl = document.querySelector("#clearChat");
const toggleWorkspaceEl = document.querySelector("#toggleWorkspace");
const closeWorkspaceEl = document.querySelector("#closeWorkspace");
const modelEl = document.querySelector("#model");
const routeGeneralEl = document.querySelector("#routeGeneral");
const routeCodeEl = document.querySelector("#routeCode");
const routeDatabaseEl = document.querySelector("#routeDatabase");
const routeArchitectEl = document.querySelector("#routeArchitect");
const routeFallbackEl = document.querySelector("#routeFallback");
const saveModelRoutesEl = document.querySelector("#saveModelRoutes");
const analyzeModelsEl = document.querySelector("#analyzeModels");
const applyRecommendedRoutesEl = document.querySelector("#applyRecommendedRoutes");
const modelRoutesStatusEl = document.querySelector("#modelRoutesStatus");
const modelAdvisorOutputEl = document.querySelector("#modelAdvisorOutput");
const checkPortableEl = document.querySelector("#checkPortable");
const portableOutputEl = document.querySelector("#portableOutput");
const checkMaintenanceEl = document.querySelector("#checkMaintenance");
const compactSessionEl = document.querySelector("#compactSession");
const optimizeDatabaseEl = document.querySelector("#optimizeDatabase");
const maintenanceOutputEl = document.querySelector("#maintenanceOutput");
const checkCapabilitiesEl = document.querySelector("#checkCapabilities");
const checkPluginsEl = document.querySelector("#checkPlugins");
const checkAiProvidersEl = document.querySelector("#checkAiProviders");
const checkImageProvidersEl = document.querySelector("#checkImageProviders");
const checkToolRadarEl = document.querySelector("#checkToolRadar");
const capabilitiesOutputEl = document.querySelector("#capabilitiesOutput");
const checkRepositoryEngineeringEl = document.querySelector("#checkRepositoryEngineering");
const repositoryEngineeringOutputEl = document.querySelector("#repositoryEngineeringOutput");
const reloadActivityEl = document.querySelector("#reloadActivity");
const openChangesFromActivityEl = document.querySelector("#openChangesFromActivity");
const activityTimelineEl = document.querySelector("#activityTimeline");
const engineeringTaskObjectiveEl = document.querySelector("#engineeringTaskObjective");
const createEngineeringTaskEl = document.querySelector("#createEngineeringTask");
const reloadEngineeringTasksEl = document.querySelector("#reloadEngineeringTasks");
const engineeringTaskListEl = document.querySelector("#engineeringTaskList");
const runBenchmarkEl = document.querySelector("#runBenchmark");
const benchmarkOutputEl = document.querySelector("#benchmarkOutput");
const modeEl = document.querySelector("#mode");
const sessionSelectEl = document.querySelector("#sessionSelect");
const newSessionEl = document.querySelector("#newSession");
const deleteSessionEl = document.querySelector("#deleteSession");
const memoryTextEl = document.querySelector("#memoryText");
const saveMemoryEl = document.querySelector("#saveMemory");
const memoryListEl = document.querySelector("#memoryList");
const attachedProjectPathEl = document.querySelector("#attachedProjectPath");
const attachProjectEl = document.querySelector("#attachProject");
const reloadAttachedProjectEl = document.querySelector("#reloadAttachedProject");
const attachedProjectSummaryEl = document.querySelector("#attachedProjectSummary");
const buildIndexEl = document.querySelector("#buildIndex");
const indexSummaryEl = document.querySelector("#indexSummary");
const buildCodeMapEl = document.querySelector("#buildCodeMap");
const codeMapSummaryEl = document.querySelector("#codeMapSummary");
const profileStackEl = document.querySelector("#profileStack");
const profileDatabaseEl = document.querySelector("#profileDatabase");
const profileRunEl = document.querySelector("#profileRun");
const profileTestEl = document.querySelector("#profileTest");
const profileGoalsEl = document.querySelector("#profileGoals");
const profileNotesEl = document.querySelector("#profileNotes");
const saveProfileEl = document.querySelector("#saveProfile");
const profileStatusEl = document.querySelector("#profileStatus");
const planTaskEl = document.querySelector("#planTask");
const generatePlanEl = document.querySelector("#generatePlan");
const planOutputEl = document.querySelector("#planOutput");
const planFilesEl = document.querySelector("#planFiles");
const missionObjectiveEl = document.querySelector("#missionObjective");
const createMissionEl = document.querySelector("#createMission");
const reloadMissionsEl = document.querySelector("#reloadMissions");
const missionListEl = document.querySelector("#missionList");
const executorObjectiveEl = document.querySelector("#executorObjective");
const prepareExecutorEl = document.querySelector("#prepareExecutor");
const runCodexExecutorEl = document.querySelector("#runCodexExecutor");
const executorOutputEl = document.querySelector("#executorOutput");
const executorFilesEl = document.querySelector("#executorFiles");
const webObjectiveEl = document.querySelector("#webObjective");
const webProjectNameEl = document.querySelector("#webProjectName");
const webAppTypeEl = document.querySelector("#webAppType");
const webStackEl = document.querySelector("#webStack");
const webDatabaseEl = document.querySelector("#webDatabase");
const webAuthEl = document.querySelector("#webAuth");
const webDeploymentEl = document.querySelector("#webDeployment");
const prepareWebProjectEl = document.querySelector("#prepareWebProject");
const createWebScaffoldEl = document.querySelector("#createWebScaffold");
const webOutputEl = document.querySelector("#webOutput");
const webFilesEl = document.querySelector("#webFiles");
const webPreviewUrlEl = document.querySelector("#webPreviewUrl");
const checkWebPreviewEl = document.querySelector("#checkWebPreview");
const loadWebPreviewEl = document.querySelector("#loadWebPreview");
const refreshWebPreviewEl = document.querySelector("#refreshWebPreview");
const autoRefreshWebPreviewEl = document.querySelector("#autoRefreshWebPreview");
const webPreviewStatusEl = document.querySelector("#webPreviewStatus");
const webPreviewFrameEl = document.querySelector("#webPreviewFrame");
const gameObjectiveEl = document.querySelector("#gameObjective");
const prepareGameEl = document.querySelector("#prepareGame");
const gameOutputEl = document.querySelector("#gameOutput");
const gameFilesEl = document.querySelector("#gameFiles");
const securityObjectiveEl = document.querySelector("#securityObjective");
const generateSecurityPlanEl = document.querySelector("#generateSecurityPlan");
const securityOutputEl = document.querySelector("#securityOutput");
const securityFilesEl = document.querySelector("#securityFiles");
const runSecurityAuditEl = document.querySelector("#runSecurityAudit");
const securityAuditScopeEl = document.querySelector("#securityAuditScope");
const securityAuditSeverityEl = document.querySelector("#securityAuditSeverity");
const securityAuditSearchEl = document.querySelector("#securityAuditSearch");
const securityAuditEl = document.querySelector("#securityAudit");
const knowledgeCategoryEl = document.querySelector("#knowledgeCategory");
const knowledgeTitleEl = document.querySelector("#knowledgeTitle");
const knowledgeContentEl = document.querySelector("#knowledgeContent");
const saveKnowledgeEl = document.querySelector("#saveKnowledge");
const knowledgeListEl = document.querySelector("#knowledgeList");
const resourceTitleEl = document.querySelector("#resourceTitle");
const resourcePathEl = document.querySelector("#resourcePath");
const scanResourceEl = document.querySelector("#scanResource");
const resourceSearchEl = document.querySelector("#resourceSearch");
const searchResourceEl = document.querySelector("#searchResource");
const consolidateProjectMemoryEl = document.querySelector("#consolidateProjectMemory");
const referenceSiteObjectiveEl = document.querySelector("#referenceSiteObjective");
const createReferenceSiteEl = document.querySelector("#createReferenceSite");
const resourceInsightOutputEl = document.querySelector("#resourceInsightOutput");
const resourceListEl = document.querySelector("#resourceList");
const fileListEl = document.querySelector("#fileList");
const reloadFilesEl = document.querySelector("#reloadFiles");
const fileContextStatusEl = document.querySelector("#fileContextStatus");
const searchFormEl = document.querySelector("#searchForm");
const searchInputEl = document.querySelector("#searchInput");
const searchResultsEl = document.querySelector("#searchResults");
const semanticSearchEl = document.querySelector("#semanticSearch");
const permReadEl = document.querySelector("#permRead");
const permProposeEl = document.querySelector("#permPropose");
const permApplyEl = document.querySelector("#permApply");
const permCommandsEl = document.querySelector("#permCommands");
const permSqlWriteEl = document.querySelector("#permSqlWrite");
const savePermissionsEl = document.querySelector("#savePermissions");
const freeBuilderModeEl = document.querySelector("#freeBuilderMode");
const advancedExecutorModeEl = document.querySelector("#advancedExecutorMode");
const saveBehaviorEl = document.querySelector("#saveBehavior");
const behaviorStatusEl = document.querySelector("#behaviorStatus");
const runDiagnosticsEl = document.querySelector("#runDiagnostics");
const runNodeCheckEl = document.querySelector("#runNodeCheck");
const toolOutputEl = document.querySelector("#toolOutput");
const reloadChangesEl = document.querySelector("#reloadChanges");
const changeListEl = document.querySelector("#changeList");
const changeDetailsEl = document.querySelector("#changeDetails");
const sqlInputEl = document.querySelector("#sqlInput");
const runSqlEl = document.querySelector("#runSql");
const explainSqlEl = document.querySelector("#explainSql");
const analyzeSqlEl = document.querySelector("#analyzeSql");
const sqlOutputEl = document.querySelector("#sqlOutput");
const sqlAnalysisEl = document.querySelector("#sqlAnalysis");
const localDatabasePathEl = document.querySelector("#localDatabasePath");
const databaseDockerStatusEl = document.querySelector("#databaseDockerStatus");
const databaseDockerUpEl = document.querySelector("#databaseDockerUp");
const databaseDockerDownEl = document.querySelector("#databaseDockerDown");
const databaseDockerOutputEl = document.querySelector("#databaseDockerOutput");
const loadSqlSchemaEl = document.querySelector("#loadSqlSchema");
const sqlSchemaEl = document.querySelector("#sqlSchema");
const loadSqlHistoryEl = document.querySelector("#loadSqlHistory");
const sqlHistoryEl = document.querySelector("#sqlHistory");
const editPathEl = document.querySelector("#editPath");
const editTaskEl = document.querySelector("#editTask");
const proposeEditEl = document.querySelector("#proposeEdit");
const applyEditEl = document.querySelector("#applyEdit");
const editPreviewEl = document.querySelector("#editPreview");
const proposalTextEl = document.querySelector("#proposalText");
const previewPatchEl = document.querySelector("#previewPatch");
const runEditCycleEl = document.querySelector("#runEditCycle");
const documentTypeEl = document.querySelector("#documentType");
const documentTitleEl = document.querySelector("#documentTitle");
const documentContentEl = document.querySelector("#documentContent");
const createDocumentEl = document.querySelector("#createDocument");
const documentOutputEl = document.querySelector("#documentOutput");
const quickLaunchEl = document.querySelector(".quick-launch");
const selectedFiles = [];
let pendingEdit = null;
let currentSessionId = "default";
let availableModels = [];
let lastSecurityAudit = null;
let lastModelAdvisor = null;
let webPreviewTimer = null;

const initialMessage = {
  role: "assistant",
  content: "Estou pronta. Posso conversar, lembrar informacoes, analisar projetos anexados e usar as IAs configuradas pela Aurora, como Ollama, Gemini, OpenRouter e motores de imagem quando estiverem ativos."
};

const history = [
  {
    ...initialMessage
  }
];

function renderMessages() {
  messagesEl.innerHTML = history
    .map(renderMessage)
    .join("");
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderMessage(message) {
  const image = message.image?.url
    ? `<figure class="chat-image">
        <img src="${escapeHtml(message.image.url)}" alt="${escapeHtml(message.image.alt || "Imagem gerada pela Aurora")}" loading="lazy" />
        <figcaption>${escapeHtml(message.image.path || message.image.url)}</figcaption>
      </figure>`
    : "";
  const content = message.role === "assistant"
    ? renderAssistantText(message.content)
    : escapeHtml(message.content);
  return `<article class="message ${message.role}">${content}${image}</article>`;
}

function renderAssistantText(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");
}

function renderSelectedFiles() {
  fileContextStatusEl.textContent = selectedFiles.length
    ? `Anexado: ${selectedFiles.map((file) => file.path).join(", ")}`
    : "Nenhum arquivo anexado.";
  if (selectedFiles[0] && editPathEl && !editPathEl.value.trim()) {
    editPathEl.value = selectedFiles[0].path;
  }
}

function setEditPreview(text) {
  editPreviewEl.innerHTML = escapeHtml(text);
}

function resetPendingEdit() {
  pendingEdit = null;
  applyEditEl.disabled = true;
  previewPatchEl.disabled = true;
  proposalTextEl.value = "";
  setEditPreview("Nenhuma proposta gerada.");
}

function openWorkspacePanel(title) {
  setWorkspaceOpen(true);
  const summaries = [...document.querySelectorAll(".side-panel details > summary")];
  const summary = summaries.find((item) => item.textContent.trim() === title);
  if (!summary) return;
  const details = summary.closest("details");
  details.open = true;
  details.scrollIntoView({ block: "start" });
}

function setWorkspaceOpen(isOpen) {
  document.body.classList.toggle("workspace-open", isOpen);
  toggleWorkspaceEl.setAttribute("aria-expanded", String(isOpen));
}

function pushAssistantStatus(content) {
  history.push({ role: "assistant", content });
  renderMessages();
  saveChatHistory();
}

function normalizePanelCommand(value) {
  const command = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return {
    "/ferramentas": "Ferramentas",
    "/permissoes": "Ferramentas",
    "/plugins": "Capacidades",
    "/marketplace": "Capacidades",
    "/ias": "Capacidades",
    "/imagens": "Capacidades",
    "/imagem": "Capacidades",
    "/projeto": "Projeto anexado",
    "/anexar": "Projeto anexado",
    "/engenharia": "Engenharia",
    "/repositorio": "Engenharia",
    "/benchmark": "Benchmark 60%",
    "/web": "Fabrica Web",
    "/executor": "Executor avancado",
    "/atividade": "Atividade",
    "/evidencias": "Atividade",
    "/diffs": "Historico de alteracoes",
    "/codex": "Atividade"
  }[command] || "";
}

async function attachProjectFromCommand(rawPath) {
  const folderPath = String(rawPath || "").trim().replace(/^["']|["']$/g, "");
  if (!folderPath) {
    openWorkspacePanel("Projeto anexado");
    pushAssistantStatus("Abra Projeto anexado e informe a pasta que quer analisar.");
    return true;
  }

  openWorkspacePanel("Projeto anexado");
  attachedProjectPathEl.value = folderPath;
  attachedProjectSummaryEl.textContent = "Anexando e analisando projeto...";

  const response = await fetch("/api/attached-project", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path: folderPath, analyze: true })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || data.error || "Nao consegui anexar o projeto.");

  renderAttachedProject(data);
  pushAssistantStatus(`Projeto anexado e analisado: ${data.project.path}\nArquivos no indice: ${data.index?.totalFiles || 0}\nArquivos no mapa de codigo: ${data.codeMap?.totalFiles || 0}`);
  return true;
}

async function runQuickCommand(content) {
  const text = String(content || "").trim();
  if (!text) return false;

  const panel = normalizePanelCommand(text);
  if (panel) {
    openWorkspacePanel(panel);
    if (text === "/codex") runCodexMode("Preparar Modo Codex para este projeto.");
    if (text === "/ias") checkAiProvidersEl.click();
    if (text === "/imagens" || text === "/imagem") checkImageProvidersEl.click();
    if (text === "/plugins" || text === "/marketplace") checkPluginsEl.click();
    if (text === "/benchmark") runBenchmarkEl.click();
    if (text === "/atividade" || text === "/evidencias") loadActivityTimeline();
    if (text === "/diffs") loadChanges();
    pushAssistantStatus(`Abri ${panel}. Voce tambem pode continuar escrevendo no chat que eu escolho as ferramentas.`);
    return true;
  }

  const atProject = text.match(/^@(.+)$/);
  if (atProject) return attachProjectFromCommand(atProject[1]);

  const attachPhrase = text.match(/^(?:anexar|abrir|usar)\s+(?:projeto|pasta)\s+(.+)$/i);
  if (attachPhrase) return attachProjectFromCommand(attachPhrase[1]);

  return false;
}

function looksLikeAutopilotRequest(content) {
  const text = String(content || "").toLowerCase();
  const buildIntent = /\b(crie|criar|construa|construir|programa|programar|desenvolva|desenvolver|monte|faca|faça|implemente|implementar)\b/i.test(text);
  const projectSurface = /\b(site|sistema|app|aplicativo|api|backend|frontend|banco de dados|database|java|python|html|css|react|next|spring|fastapi|django|postgres|mysql|sqlite)\b/i.test(text);
  return buildIntent && projectSurface;
}

function looksLikeDatabaseBuildRequest(content) {
  const text = String(content || "").toLowerCase();
  const createIntent = /\b(crie|criar|construa|construir|monte|faca|faça|gerar|gere)\b/i.test(text);
  const databaseTarget = /\b(banco|banco de dados|database|sqlite|tabela|schema)\b/i.test(text);
  return createIntent && databaseTarget;
}

function formatDatabaseBuildMessage(data) {
  const engineLine = data.engine === "sqlite"
    ? `SQLite: ${data.databasePath}`
    : `Docker Compose: ${data.dockerComposePath}`;
  const nextLine = data.engine === "sqlite"
    ? "Abra o arquivo .sqlite ou use schema.sql/seed.sql no seu app."
    : "Rode docker compose up -d na pasta criada para subir o servidor local.";
  return `Banco local criado.

Pasta: ${data.path}
Engine: ${data.engine || "sqlite"}
${engineLine}
Schema: ${data.schemaPath}
Seed: ${data.seedPath}
README: ${data.readmePath}
.env: ${data.envExamplePath || "-"}

Tabelas:
${(data.validation?.tables || []).map((table) => `- ${table}`).join("\n") || "- nenhuma"}

Validacao: ${data.validation?.ok ? "OK" : "verificar"}

Proximo passo:
${nextLine}`;
}

function looksLikeAutonomousRequest(content) {
  const text = String(content || "").toLowerCase();
  const intent = /\b(crie|criar|construa|construir|monte|faca|faça|gerar|gere|implemente|desenvolva|programa|programar)\b/i.test(text);
  const target = /\b(site|sistema|app|aplicativo|api|backend|frontend|banco|database|sqlite|postgres|postgresql|mysql|java|python|html|css|react|next|spring|fastapi|django)\b/i.test(text);
  return intent && target;
}

function looksLikeCodexModeRequest(content) {
  const text = String(content || "").toLowerCase();
  return /\b(codex|modo codex|igual o codex|melhore este projeto|melhorar este projeto|trabalhe autonomo|trabalhe autonomamente|organize o projeto|analise o projeto inteiro)\b/i.test(text);
}

function formatCodexModeMessage(data) {
  const lanes = (data.lanes || [])
    .map((lane) => `- ${lane.title} [${lane.status}]: ${(lane.actions || []).join("; ")}`)
    .join("\n");
  return `Modo Codex preparado.

Projeto: ${data.rootDir}
Stack: ${(data.stack?.stack || []).join(", ") || "nao detectada"}
Gerenciador: ${(data.stack?.packageManagers || []).join(", ") || "nao detectado"}
Instalar: ${(data.stack?.installCommands || []).join(" && ") || "nao detectado"}
Rodar: ${(data.stack?.runCommands || []).join(" && ") || "nao detectado"}
Testar: ${(data.stack?.testCommands || []).join(" && ") || "nao detectado"}
Git: ${data.git?.status?.ok ? "disponivel" : "indisponivel"}
Docker: ${data.docker?.available ? "disponivel" : "indisponivel"}

Linhas de trabalho:
${lanes || "- nenhuma"}

Perfil vivo do projeto atualizado. Veja Atividade para evidencias.`;
}

async function runCodexMode(content) {
  const pending = { role: "assistant", content: "Preparando Modo Codex: lendo projeto, stack, comandos, permissoes e linhas de trabalho..." };
  history.push(pending);
  renderMessages();

  const response = await fetch("/api/codex-mode", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      objective: content,
      fileContext: selectedFiles,
      updateProfile: true
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || data.error || "Falha ao preparar Modo Codex.");

  pending.content = formatCodexModeMessage(data);
  renderMessages();
  await saveChatHistory();
  await loadProjectProfile();
  await loadActivityTimeline();
  openWorkspacePanel("Atividade");
}

function formatAutonomousMessage(data) {
  const steps = (data.steps || [])
    .map((step) => `- ${step.status.toUpperCase()} ${step.title}: ${step.detail || ""}`)
    .join("\n");
  const db = data.database
    ? `\n\nBanco:\n- Engine: ${data.database.engine}\n- Pasta: ${data.database.path}${data.database.databasePath ? `\n- SQLite: ${data.database.databasePath}` : ""}${data.database.dockerComposePath ? `\n- Docker: ${data.database.dockerComposePath}` : ""}`
    : "";
  const project = data.autopilot
    ? `\n\nProjeto/Plano:\n- Plano: ${data.autopilot.artifact?.path || "-"}${data.autopilot.scaffold?.path ? `\n- Scaffold: ${data.autopilot.scaffold.path}` : ""}`
    : "";
  const docker = data.docker
    ? `\n\nDocker:\n- OK: ${data.docker.ok ? "sim" : "nao"}${data.docker.skipped ? "\n- Docker indisponivel/fechado." : ""}${data.docker.error ? `\n- Erro: ${data.docker.error}` : ""}`
    : "";
  return `Orquestrador autonomo executado.

${steps || "- Nenhuma etapa registrada."}${db}${project}${docker}

Veja a aba Atividade para comandos, diffs e evidencias.`;
}

async function runAutonomousTask(content) {
  const pending = { role: "assistant", content: "Pensando e executando o maximo possivel com seguranca..." };
  history.push(pending);
  renderMessages();

  const response = await fetch("/api/autonomous-task", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      objective: content,
      fileContext: selectedFiles
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || data.error || "Falha no orquestrador autonomo.");

  pending.content = formatAutonomousMessage(data);
  if (data.database?.dockerComposePath && localDatabasePathEl) {
    localDatabasePathEl.value = data.database.path;
  }
  renderMessages();
  await saveChatHistory();
  await loadActivityTimeline();
  openWorkspacePanel("Atividade");
}

async function runDatabaseBuilder(content) {
  const pending = { role: "assistant", content: "Modelando e criando banco SQLite local..." };
  history.push(pending);
  renderMessages();

  const response = await fetch("/api/local-database", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ objective: content })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || data.error || "Falha ao criar banco local.");

  pending.content = formatDatabaseBuildMessage(data);
  if (data.dockerComposePath && localDatabasePathEl) {
    localDatabasePathEl.value = data.path;
  }
  renderMessages();
  await saveChatHistory();
  await loadActivityTimeline();
  openWorkspacePanel("Atividade");
}

async function runDatabaseDockerAction(action) {
  const databasePath = localDatabasePathEl.value.trim();
  if (!databasePath) {
    databaseDockerOutputEl.textContent = "Informe a pasta em generated/databases criada pela Aurora.";
    return;
  }

  databaseDockerOutputEl.textContent = `${action}: executando...`;
  const response = await fetch("/api/local-database/docker", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path: databasePath, action })
  });
  const data = await response.json();
  databaseDockerOutputEl.textContent = [
    `Acao: ${data.action || action}`,
    `OK: ${data.ok ? "sim" : "nao"}`,
    data.skipped ? `Pulado: ${data.docker?.error || data.reason || "Docker indisponivel"}` : "",
    data.path ? `Pasta: ${data.path}` : "",
    data.docker?.version ? `Docker: ${data.docker.version}` : "",
    data.stdout ? `stdout:\n${data.stdout}` : "",
    data.stderr ? `stderr:\n${data.stderr}` : "",
    data.error ? `erro:\n${data.error}` : data.detail ? `erro:\n${data.detail}` : ""
  ].filter(Boolean).join("\n\n");
  await loadActivityTimeline();
}

function formatAutopilotMessage(data) {
  const profile = data.profile || {};
  const scaffold = data.scaffold
    ? `\n\nScaffold criado: ${data.scaffold.path}\nArquivos: ${(data.scaffold.files || []).length}\nProximos passos:\n${(data.scaffold.nextSteps || []).map((item) => `- ${item}`).join("\n")}`
    : "";
  const artifact = data.artifact?.path ? `\n\nPlano salvo: ${data.artifact.path}` : "";
  const safeRun = data.safeRun?.skipped
    ? `\n\nValidacao segura: pulada (${data.safeRun.reason || "sem motivo informado"}).`
    : data.safeRun?.results?.length
      ? `\n\nValidacao segura:\n${data.safeRun.results.map((result) => `- ${result.ok ? "OK" : "ERRO"} ${result.commandId}${result.error ? `: ${result.error}` : ""}`).join("\n")}`
      : "";
  return `Autopiloto ativado.

Tipo: ${profile.kind || "software"}
Linguagens: ${(profile.languages || []).join(", ") || "a definir"}
Frameworks: ${(profile.frameworks || []).join(", ") || "a definir"}
Banco: ${profile.database || "a definir"}

${data.plan || "Plano preparado."}${safeRun}${scaffold}${artifact}`;
}

async function runAutopilot(content) {
  const pending = { role: "assistant", content: "Autopiloto analisando pedido, stack, banco e proximas acoes..." };
  history.push(pending);
  renderMessages();

  const response = await fetch("/api/autopilot-plan", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      objective: content,
      fileContext: selectedFiles,
      createScaffold: true,
      runSafeChecks: true
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || data.error || "Falha ao ativar autopiloto.");

  pending.content = formatAutopilotMessage(data);
  renderMessages();
  await saveChatHistory();
  await loadActivityTimeline();

  executorObjectiveEl.value = content;
  renderExecutorResult(data.executorPlan || {});
  openWorkspacePanel("Executor avancado");
}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function renderPortableCheck(data) {
  const checklist = (data.checklist || [])
    .map((item) => `${item.ok ? "OK" : "PENDENTE"} - ${item.item}`)
    .join("\n");
  const offline = data.offlineReadiness || {};
  const offlineWorks = (offline.worksOffline || [])
    .map((item) => `${item.ok ? "OK" : "PENDENTE"} - ${item.feature}: ${item.detail || ""}`)
    .join("\n");
  const internetNeeds = (offline.needsInternet || [])
    .map((item) => `- ${item.feature}: ${item.detail || ""}`)
    .join("\n");
  const offlineRecommendations = (offline.recommendations || [])
    .map((item) => `- ${item}`)
    .join("\n");
  const stats = Object.entries(data.stats || {})
    .map(([name, value]) => `${name}: ${value.files || 0} arquivos, ${value.folders || 0} pastas, ${formatBytes(value.bytes)}`)
    .join("\n");

  portableOutputEl.textContent = `Pasta da Aurora
${data.appPath}

Node
${data.nodeVersion}

Ollama
${data.ollama?.online ? "online" : `offline: ${data.ollama?.error || "sem resposta"}`}
Modelos: ${(data.ollama?.models || []).join(", ") || "nenhum"}
Modelo padrao: ${data.defaultModel}

Prontidao offline
${offline.ready ? "OK" : "PARCIAL"} - ${offline.summary || "Sem avaliacao offline."}

Funciona sem internet
${offlineWorks || "- Sem dados."}

Depende de internet
${internetNeeds || "- Nada listado."}

Antes de ficar sem rede
${offlineRecommendations || "- Sem recomendacoes."}

Checklist
${checklist}

Copiar para o pendrive
${(data.recommendedCopy || []).map((item) => `- ${item}`).join("\n")}

Tamanho resumido
${stats}

Comandos no outro PC
${(data.commands || []).join("\n")}

Abrir
${data.url}`;
}

function renderMaintenanceStatus(data) {
  const permissions = data.permissions || {};
  const permissionLines = Object.entries(permissions)
    .map(([name, value]) => `${value ? "OK" : "OFF"} - ${name}`)
    .join("\n");
  const warnings = (data.warnings || []).length
    ? data.warnings.map((warning) => `- ${warning}`).join("\n")
    : "- Nenhum alerta importante.";

  maintenanceOutputEl.textContent = `Sessao
${data.sessionId}

Contexto
Mensagens: ${data.messageCount}
Tokens estimados: ${data.estimatedTokens}
Limite salvo de mensagens: ${data.limits?.chatHistoryMaxMessages}
Compactacao mantem: ${data.limits?.compactSessionKeepMessages} mensagens recentes

Memoria e conhecimento
Notas de memoria: ${data.memoryCount}
Conhecimentos: ${data.knowledgeCount}
Sessoes: ${data.sessionCount}

Banco e historicos
Tamanho SQLite: ${formatBytes(data.dbSize)}
Historico SQL: ${data.sqlHistoryCount}
Historico de alteracoes: ${data.changeLogCount}

Permissoes
${permissionLines}

Alertas
${warnings}`;
}

function renderCapabilities(data) {
  const items = data.capabilities || [];
  const tools = data.tools || [];
  if (!items.length && !tools.length) {
    capabilitiesOutputEl.innerHTML = "<p class=\"empty-text\">Nenhuma capacidade mapeada.</p>";
    return;
  }

  const toolCards = tools.map((tool) => `
    <article class="knowledge-item">
      <strong>${tool.available ? "OK" : "FALTA"} | ${escapeHtml(tool.command)}</strong>
      <p>${escapeHtml(tool.available ? tool.version : tool.error || "Nao encontrado.")}</p>
      <p>${tool.available ? "Ferramenta disponivel no sistema." : `Instalar/ver: ${tool.install}`}</p>
    </article>
  `).join("");

  const capabilityCards = items.map((item) => `
    <article class="knowledge-item">
      <strong>${item.available ? "OK" : "FALTA"} | ${escapeHtml(item.name)}</strong>
      <p>${escapeHtml(item.use)}</p>
      <p>Pacotes: ${escapeHtml((item.packages || []).join(", "))}</p>
      <p>${item.available ? `Disponivel para uso${item.source ? ` em ${item.source}` : ""}${item.version ? ` (${item.version})` : ""}.` : `Instalar quando precisar: ${item.install}`}</p>
    </article>
  `).join("");

  capabilitiesOutputEl.innerHTML = `
    <article class="knowledge-item">
      <strong>Ferramentas do sistema</strong>
      <p>Essas ferramentas ajudam a Aurora a trabalhar de forma independente neste PC.</p>
      <p>${escapeHtml(data.note || "")}</p>
      ${data.externalToolsDir ? `<code>${escapeHtml(data.externalToolsDir)}</code>` : ""}
    </article>
    ${toolCards}
    <article class="knowledge-item">
      <strong>Bibliotecas opcionais</strong>
      <p>Instale apenas quando precisar criar Excel, Word, sites modernos ou jogos.</p>
    </article>
    ${capabilityCards}
  `;
}

function renderToolRadar(data) {
  const tools = data.tools || [];
  const improvements = data.nextImprovements || [];
  if (!tools.length) {
    capabilitiesOutputEl.innerHTML = "<p class=\"empty-text\">Nenhuma recomendacao encontrada.</p>";
    return;
  }

  const improvementCards = improvements.map((item) => `
    <article class="knowledge-item">
      <strong>Proxima melhoria</strong>
      <p>${escapeHtml(item)}</p>
    </article>
  `).join("");

  const toolCards = tools.map((tool) => `
    <article class="knowledge-item">
      <strong>${escapeHtml(tool.priority.toUpperCase())} | ${escapeHtml(tool.category)} | ${escapeHtml(tool.name)}</strong>
      <p>${escapeHtml(tool.use)}</p>
      <p>${escapeHtml(tool.fit)}</p>
      <p>Como usar/instalar: ${escapeHtml(tool.install)}</p>
    </article>
  `).join("");

  capabilitiesOutputEl.innerHTML = `
    <article class="knowledge-item">
      <strong>Radar de devtools</strong>
      <p>Fonte local: ${escapeHtml(data.source || "lista de ferramentas")}</p>
      <p>Ideias que podem melhorar a Aurora sem instalar nada automaticamente.</p>
    </article>
    ${improvementCards}
    ${toolCards}
  `;
}

function renderPlugins(data) {
  const plugins = data.plugins || [];
  if (!plugins.length) {
    capabilitiesOutputEl.innerHTML = "<p class=\"empty-text\">Nenhum plugin mapeado.</p>";
    return;
  }

  const statusLabel = {
    active: "ATIVO",
    ready: "PRONTO",
    missing: "INSTALAR"
  };

  const cards = plugins.map((plugin) => `
    <article class="knowledge-item plugin-card plugin-${escapeHtml(plugin.status)}">
      <strong>${escapeHtml(statusLabel[plugin.status] || plugin.status)} | ${escapeHtml(plugin.name)}</strong>
      <p>${escapeHtml(plugin.description)}</p>
      <p>Categoria: ${escapeHtml(plugin.category)} | Prioridade: ${escapeHtml(plugin.priority)}</p>
      <p>Ferramentas: ${escapeHtml((plugin.tools || []).join(", "))}</p>
      <p>${escapeHtml(plugin.nextAction)}</p>
      <code>${escapeHtml(plugin.install)}</code>
    </article>
  `).join("");

  capabilitiesOutputEl.innerHTML = `
    <article class="knowledge-item">
      <strong>Plugins da Aurora</strong>
      <p>Ativos: ${escapeHtml(String(data.summary?.active || 0))} | Prontos: ${escapeHtml(String(data.summary?.ready || 0))} | Planejados: ${escapeHtml(String(data.summary?.planned || 0))} | Para instalar: ${escapeHtml(String(data.summary?.missing || 0))}</p>
      <p>${escapeHtml(data.note || "")}</p>
    </article>
    ${cards}
  `;
}

function renderAiProviders(data) {
  const providers = data.providers || [];
  const cards = providers.map((provider) => `
    <article class="knowledge-item plugin-card ${provider.configured ? "plugin-active" : "plugin-partial"}">
      <strong>${provider.configured ? "PRONTA" : "NAO CONFIGURADA"} | ${escapeHtml(provider.name)}</strong>
      <p>Modelo padrao: ${escapeHtml(provider.defaultModel || "-")}</p>
      <p>Variavel: ${escapeHtml(provider.secretEnv || "sem chave")}</p>
      <p>${escapeHtml(provider.notes || "")}</p>
    </article>
  `).join("");

  capabilitiesOutputEl.innerHTML = `
    <article class="knowledge-item plugin-card ${data.externalEnabled ? "plugin-ready" : "plugin-partial"}">
      <strong>Roteador de IAs | ${escapeHtml(data.mode || "auto")}</strong>
      <p>${data.externalEnabled ? "Ha pelo menos uma IA externa configurada no ambiente." : "A Aurora esta usando Ollama local ate voce configurar uma chave externa."}</p>
    </article>
    ${cards}
  `;
}

function renderImageProviders(data) {
  const providers = data.providers || [];
  const cards = providers.map((provider) => `
    <article class="knowledge-item plugin-card ${provider.configured ? "plugin-active" : provider.online ? "plugin-partial" : "plugin-missing"}">
      <strong>${provider.configured ? "PRONTO" : provider.online ? "PARCIAL" : "OFFLINE"} | ${escapeHtml(provider.name)}</strong>
      <p>${escapeHtml(provider.notes || "")}</p>
      <p>URL: ${escapeHtml(provider.url || "-")}</p>
      <p>Modelos: ${escapeHtml((provider.checkpoints || []).join(", ") || "-")}</p>
      ${provider.error ? `<p>${escapeHtml(provider.error)}</p>` : ""}
    </article>
  `).join("");

  capabilitiesOutputEl.innerHTML = `
    <article class="knowledge-item plugin-card plugin-ready">
      <strong>Motores de imagem</strong>
      <p>A Aurora tenta ComfyUI local, depois Gemini Image, e usa SVG apenas como fallback.</p>
    </article>
    ${cards}
  `;
}

function renderRepositoryEngineering(data) {
  const architecture = data.architecture || {};
  const git = data.git || {};
  const github = data.github || {};
  const automation = data.automation || {};
  const matrix = data.autonomyMatrix || [];
  const evidenceLog = data.evidenceLog || [];
  const statusLabel = {
    active: "ATIVO",
    ready: "PRONTO",
    partial: "PARCIAL",
    planned: "PLANEJADO",
    missing: "FALTA"
  };
  const matrixCards = matrix.map((item) => `
    <article class="knowledge-item plugin-card plugin-${escapeHtml(item.status)}">
      <strong>${escapeHtml(statusLabel[item.status] || item.status)} | ${escapeHtml(item.capability)}</strong>
      <p>${escapeHtml(item.evidence)}</p>
    </article>
  `).join("");
  const scripts = (architecture.scripts || []).map((script) => `${script.name}: ${script.command}`).join("\n") || "Nenhum script encontrado.";
  const endpoints = (architecture.endpoints || []).slice(0, 12).map((item) => `${item.endpoint} (${item.file})`).join("\n") || "Nenhum endpoint mapeado.";
  const changedFiles = (git.changedFiles || []).join("\n") || (git.available ? "Sem mudancas detectadas." : git.error || "Git indisponivel.");
  const evidenceCards = evidenceLog.length
    ? evidenceLog.map((item) => `
      <article class="knowledge-item plugin-card ${item.ok ? "plugin-active" : "plugin-missing"}">
        <strong>${item.ok ? "OK" : "ERRO"} | ${escapeHtml(item.commandId || item.kind)}</strong>
        <p>${escapeHtml(item.summary || "")}</p>
        <p>${escapeHtml(item.createdAt || "")}</p>
        <pre>${escapeHtml([item.stdout, item.stderr, item.error].filter(Boolean).join("\n\n") || "Sem saida.")}</pre>
      </article>
    `).join("")
    : `<article class="knowledge-item"><strong>Evidencias recentes</strong><p>Nenhuma execucao registrada ainda.</p></article>`;

  repositoryEngineeringOutputEl.innerHTML = `
    <article class="knowledge-item benchmark-summary">
      <strong>Engenharia de Repositorios</strong>
      <p>Workspace: ${escapeHtml(data.workspace || "")}</p>
      <p>Arquivos indexados: ${escapeHtml(String(architecture.indexedFiles || 0))} | Arquivos de codigo: ${escapeHtml(String(architecture.codeFiles || 0))}</p>
      <p>Git: ${git.available ? "detectado" : "indisponivel"} | GitHub: ${github.connected ? "remote detectado" : "nao conectado"}</p>
    </article>
    <article class="knowledge-item">
      <strong>Arquitetura</strong>
      <p>Stack: ${escapeHtml(architecture.stack || "")}</p>
      <p>Banco: ${escapeHtml(architecture.database || "")}</p>
      <p>Objetivo: ${escapeHtml(architecture.goals || "")}</p>
      <pre>${escapeHtml(scripts)}</pre>
    </article>
    <article class="knowledge-item">
      <strong>Git e GitHub</strong>
      <p>Branch: ${escapeHtml(git.branch || "nao detectada")}</p>
      <p>Remote: ${escapeHtml(git.remote || "nao detectado")}</p>
      <pre>${escapeHtml(changedFiles)}</pre>
    </article>
    <article class="knowledge-item">
      <strong>Endpoints e evidencias</strong>
      <pre>${escapeHtml(endpoints)}</pre>
      <p>Comandos seguros: ${escapeHtml((automation.safeCommands || []).join(", "))}</p>
      <p>Evidencias: ${escapeHtml((automation.evidence || []).join(", "))}</p>
    </article>
    <article class="knowledge-item benchmark-summary">
      <strong>Trilha de evidencias</strong>
      <p>Ultimas execucoes registradas pelo executor seguro.</p>
    </article>
    ${evidenceCards}
    ${matrixCards}
    ${(data.nextSteps || []).map((step) => `
      <article class="knowledge-item">
        <strong>Proximo passo</strong>
        <p>${escapeHtml(step)}</p>
      </article>
    `).join("")}
  `;
}

function renderEngineeringTasks(tasks) {
  if (!tasks.length) {
    engineeringTaskListEl.innerHTML = "<p class=\"empty-text\">Nenhuma tarefa local criada.</p>";
    return;
  }

  engineeringTaskListEl.innerHTML = tasks.map((task) => {
    const evidence = task.summary || {};
    const latest = (task.evidence || []).slice(0, 3).map((item) => `${item.ok ? "OK" : "ERRO"} ${item.commandId || item.kind}: ${item.summary}`).join("\n") || "Sem evidencias ainda.";
    return `
      <article class="knowledge-item plugin-card ${task.status === "done" ? "plugin-active" : "plugin-partial"}">
        <strong>${escapeHtml(task.status.toUpperCase())} | ${escapeHtml(task.title)}</strong>
        <p>${escapeHtml(task.objective)}</p>
        <p>Evidencias: ${escapeHtml(String(evidence.totalEvidence || 0))} | comandos: ${escapeHtml(String(evidence.commands || 0))} | diffs: ${escapeHtml(String(evidence.diffs || 0))} | erros: ${escapeHtml(String(evidence.failed || 0))}</p>
        <pre>${escapeHtml(latest)}</pre>
        <button class="ghost-button" type="button" data-run-engineering-task="${escapeHtml(task.id)}">Executar checks</button>
        <button class="ghost-button" type="button" data-complete-engineering-task="${escapeHtml(task.id)}">Concluir tarefa</button>
      </article>
    `;
  }).join("");
}

async function loadEngineeringTasks() {
  const response = await fetch("/api/engineering-tasks");
  const data = await response.json();
  if (!response.ok) {
    engineeringTaskListEl.innerHTML = `<p class="empty-text">${escapeHtml(data.error || "Falha ao carregar tarefas.")}</p>`;
    return;
  }
  renderEngineeringTasks(data.tasks || []);
}

async function loadRepositoryEngineering() {
  checkRepositoryEngineeringEl.disabled = true;
  repositoryEngineeringOutputEl.textContent = "Analisando repositorio, Git, plugins e evidencias...";

  try {
    const response = await fetch("/api/repository-engineering");
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao analisar repositorio.");
    renderRepositoryEngineering(data);
  } catch (error) {
    repositoryEngineeringOutputEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
  } finally {
    checkRepositoryEngineeringEl.disabled = false;
  }
}

function scoreLabel(score) {
  if (score >= 60) return "META";
  if (score >= 45) return "PERTO";
  if (score >= 30) return "BASE";
  return "BAIXO";
}

function renderScoreBar(score) {
  const safeScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  return `
    <div class="score-bar" aria-label="Pontuacao ${safeScore} de 100">
      <span style="width: ${safeScore}%"></span>
    </div>
  `;
}

function renderBenchmark(data) {
  const areas = data.areas || [];
  const actions = data.recommendedNextActions || [];
  const areaCards = areas.map((area) => {
    const checks = (area.checks || []).slice(0, 8).map((check) => {
      const value = "value" in check ? Number(check.value) : (check.ok ? 1 : 0);
      const state = value >= 0.8 ? "OK" : value >= 0.35 ? "PARCIAL" : "PENDENTE";
      return `<li><strong>${state}</strong> ${escapeHtml(check.label)} <span>${escapeHtml(check.detail || "")}</span></li>`;
    }).join("");

    return `
      <article class="knowledge-item benchmark-card">
        <div class="score-row">
          <strong>${escapeHtml(area.name)}</strong>
          <span>${scoreLabel(area.score)} ${Math.round(area.score || 0)}%</span>
        </div>
        ${renderScoreBar(area.score)}
        <ul class="benchmark-checks">${checks}</ul>
      </article>
    `;
  }).join("");

  const actionCards = actions.map((action) => `
    <article class="knowledge-item">
      <strong>Proxima acao</strong>
      <p>${escapeHtml(action)}</p>
    </article>
  `).join("");

  benchmarkOutputEl.innerHTML = `
    <article class="knowledge-item benchmark-summary">
      <strong>Nota geral: ${Math.round(data.overallScore || 0)}% / meta ${data.targetScore || 60}%</strong>
      ${renderScoreBar(data.overallScore)}
      <p>Faltam ${Math.round(data.gapToTarget || 0)} pontos para a meta. Gerado em ${escapeHtml(data.generatedAt || "")}.</p>
      <p>Modelos: ${escapeHtml((data.installedModels || []).join(", ") || "nenhum")}</p>
    </article>
    ${actionCards}
    ${areaCards}
  `;
}

function buildLineDiff(original, proposed) {
  const oldLines = String(original || "").split("\n");
  const newLines = String(proposed || "").split("\n");
  const rows = [];
  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex];
    const newLine = newLines[newIndex];

    if (oldLine === newLine) {
      rows.push({ type: "same", text: oldLine || " " });
      oldIndex += 1;
      newIndex += 1;
      continue;
    }

    if (newLines[newIndex + 1] === oldLine) {
      rows.push({ type: "add", text: newLine || " " });
      newIndex += 1;
      continue;
    }

    if (oldLines[oldIndex + 1] === newLine) {
      rows.push({ type: "remove", text: oldLine || " " });
      oldIndex += 1;
      continue;
    }

    if (oldIndex < oldLines.length) {
      rows.push({ type: "remove", text: oldLine || " " });
      oldIndex += 1;
    }

    if (newIndex < newLines.length) {
      rows.push({ type: "add", text: newLine || " " });
      newIndex += 1;
    }
  }

  return rows.map((row) => {
    const marker = row.type === "add" ? "+" : row.type === "remove" ? "-" : " ";
    return `<div class="diff-line ${row.type}"><span>${marker}</span><code>${escapeHtml(row.text)}</code></div>`;
  }).join("");
}

function setEditDiff(original, proposed) {
  editPreviewEl.innerHTML = buildLineDiff(original, proposed);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("\n", "<br>");
}

async function loadModels() {
  const response = await fetch("/api/models");
  const data = await response.json();
  modelEl.innerHTML = "";

  availableModels = data.models.length ? data.models : [data.defaultModel];
  for (const model of availableModels) {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    modelEl.append(option);
  }

  statusEl.textContent = data.online
    ? data.models.length ? "Ollama conectado" : "Ollama sem modelos"
    : "Ollama offline";
  statusEl.className = `status ${data.online && data.models.length ? "ok" : "warn"}`;
}

function fillModelRouteSelect(select, value) {
  const models = ["", ...availableModels];
  select.innerHTML = models.map((model) => {
    const label = model || "Usar fallback";
    return `<option value="${escapeHtml(model)}">${escapeHtml(label)}</option>`;
  }).join("");
  select.value = value || "";
}

async function loadModelRoutes() {
  const response = await fetch("/api/model-routes");
  const data = await response.json();
  const routes = data.routes || {};

  fillModelRouteSelect(routeGeneralEl, routes.generalModel);
  fillModelRouteSelect(routeCodeEl, routes.codeModel);
  fillModelRouteSelect(routeDatabaseEl, routes.databaseModel);
  fillModelRouteSelect(routeArchitectEl, routes.architectModel);
  fillModelRouteSelect(routeFallbackEl, routes.fallbackModel || availableModels[0]);
  modelRoutesStatusEl.textContent = "Rotas carregadas.";
}

function setRouteSelectValues(routes = {}) {
  routeGeneralEl.value = routes.generalModel || "";
  routeCodeEl.value = routes.codeModel || "";
  routeDatabaseEl.value = routes.databaseModel || "";
  routeArchitectEl.value = routes.architectModel || "";
  routeFallbackEl.value = routes.fallbackModel || "";
}

function renderModelAdvisor(data) {
  const routes = data.recommendedRoutes || {};
  const installPlan = (data.installPlan || [])
    .map((item) => `${item.installed ? "OK" : "FALTA"} ${item.model} - ${item.use}${item.installed ? "" : `\n  ${item.command}`}`)
    .join("\n");
  const notes = (data.notes || []).length ? data.notes.map((note) => `- ${note}`).join("\n") : "- Nenhum alerta.";

  modelAdvisorOutputEl.textContent = `Modelos instalados
${(data.installed || []).join("\n") || "Nenhum modelo detectado."}

Rotas recomendadas
Geral: ${routes.generalModel || "-"}
Programacao: ${routes.codeModel || "-"}
Banco: ${routes.databaseModel || "-"}
Arquitetura: ${routes.architectModel || "-"}
Fallback: ${routes.fallbackModel || "-"}

Instalacao sugerida
${installPlan || "- Nenhuma sugestao."}

Notas
${notes}`;
}

async function analyzeModelRoutes() {
  analyzeModelsEl.disabled = true;
  modelAdvisorOutputEl.textContent = "Analisando modelos instalados...";

  try {
    const response = await fetch("/api/model-advisor");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao analisar modelos.");
    lastModelAdvisor = data;
    renderModelAdvisor(data);
  } catch (error) {
    modelAdvisorOutputEl.textContent = error.message;
  } finally {
    analyzeModelsEl.disabled = false;
  }
}

async function loadChatHistory() {
  const response = await fetch(`/api/chat-history?session=${encodeURIComponent(currentSessionId)}`);
  const data = await response.json();

  if (data.messages?.length) {
    history.splice(0, history.length, ...data.messages.map((message) => ({
      role: message.role,
      content: message.content
    })));
    renderMessages();
  }
}

async function saveChatHistory() {
  await fetch(`/api/chat-history?session=${encodeURIComponent(currentSessionId)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionId: currentSessionId, title: sessionSelectEl.selectedOptions[0]?.textContent || "Conversa", messages: history })
  });
}

async function loadSessions() {
  const response = await fetch("/api/sessions");
  const data = await response.json();
  sessionSelectEl.innerHTML = (data.sessions || [])
    .map((session) => `<option value="${escapeHtml(session.id)}">${escapeHtml(session.title)}</option>`)
    .join("");
  if (![...sessionSelectEl.options].some((option) => option.value === currentSessionId)) currentSessionId = "default";
  sessionSelectEl.value = currentSessionId;
}

async function switchSession(sessionId) {
  currentSessionId = sessionId || "default";
  history.splice(0, history.length, { ...initialMessage });
  renderMessages();
  await loadChatHistory();
}

async function loadPermissions() {
  const response = await fetch("/api/permissions");
  const data = await response.json();
  const permissions = data.permissions || {};
  permReadEl.checked = Boolean(permissions.readFiles);
  permProposeEl.checked = Boolean(permissions.proposeEdits);
  permApplyEl.checked = Boolean(permissions.applyEdits);
  permCommandsEl.checked = Boolean(permissions.runCommands);
  permSqlWriteEl.checked = Boolean(permissions.sqlWrite);
}

async function loadBehaviorSettings() {
  const response = await fetch("/api/behavior-settings");
  const data = await response.json();
  const settings = data.settings || {};
  freeBuilderModeEl.checked = Boolean(settings.freeBuilder);
  advancedExecutorModeEl.checked = Boolean(settings.advancedExecutor);
  behaviorStatusEl.textContent = [
    settings.freeBuilder
      ? "Construtor livre ligado."
      : "Construtor livre desligado.",
    settings.advancedExecutor
      ? "Executor avancado ligado."
      : "Executor avancado desligado."
  ].join(" ");
}

function renderChanges(changes) {
  if (!changes.length) {
    changeListEl.innerHTML = "<p class=\"empty-text\">Nenhuma alteracao registrada.</p>";
    return;
  }

  changeListEl.innerHTML = changes.map((change) => `
    <article class="knowledge-item">
      <strong>${escapeHtml(change.filePath)}</strong>
      <p>${escapeHtml(change.reason || "")}</p>
      <p>${escapeHtml(new Date(change.createdAt).toLocaleString())}</p>
      <button class="ghost-button" type="button" data-change-id="${escapeHtml(change.id)}">Ver patch</button>
      <button class="ghost-button" type="button" data-restore-change-id="${escapeHtml(change.id)}">Restaurar</button>
    </article>
  `).join("");
}

function renderActivityTimeline({ evidence = [], changes = [] } = {}) {
  const items = [
    ...evidence.map((item) => ({
      type: item.kind || "evidence",
      ok: item.ok,
      title: item.commandId || item.stepId || item.kind || "atividade",
      summary: item.summary || item.error || "",
      detail: [item.stdout, item.stderr, item.error].filter(Boolean).join("\n\n"),
      createdAt: item.createdAt
    })),
    ...changes.map((change) => ({
      type: "diff",
      ok: true,
      title: change.filePath,
      summary: change.reason || "Alteracao registrada.",
      detail: `Backup: ${change.backupPath}`,
      createdAt: change.createdAt
    }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 16);

  if (!items.length) {
    activityTimelineEl.innerHTML = "<p class=\"empty-text\">Nenhuma atividade registrada ainda.</p>";
    return;
  }

  activityTimelineEl.innerHTML = items.map((item) => `
    <article class="activity-item ${item.ok ? "activity-ok" : "activity-error"}">
      <div>
        <strong>${escapeHtml(item.title || "atividade")}</strong>
        <span>${escapeHtml(item.type)} | ${escapeHtml(new Date(item.createdAt).toLocaleString())}</span>
      </div>
      <p>${escapeHtml(item.summary || "Sem resumo.")}</p>
      ${item.detail ? `<pre>${escapeHtml(String(item.detail).slice(0, 1800))}</pre>` : ""}
    </article>
  `).join("");
}

async function loadActivityTimeline() {
  activityTimelineEl.textContent = "Carregando atividade...";
  const [evidenceResponse, changesResponse] = await Promise.all([
    fetch("/api/execution-evidence?limit=20"),
    fetch("/api/change-log")
  ]);
  const evidenceData = await evidenceResponse.json();
  const changesData = await changesResponse.json();
  renderActivityTimeline({
    evidence: evidenceResponse.ok ? evidenceData.evidence || [] : [],
    changes: changesResponse.ok ? changesData.changes || [] : []
  });
}

function renderSqlSchema(tables) {
  if (!tables.length) {
    sqlSchemaEl.innerHTML = "<p class=\"empty-text\">Nenhuma tabela encontrada.</p>";
    return;
  }

  sqlSchemaEl.innerHTML = tables.map((table) => {
    const columns = table.columns.map((column) => {
      const flags = [
        column.primaryKey ? "PK" : "",
        column.notNull ? "NOT NULL" : "",
        column.defaultValue !== null && column.defaultValue !== undefined ? `DEFAULT ${column.defaultValue}` : ""
      ].filter(Boolean).join(" | ");
      return `<li><code>${escapeHtml(column.name)}</code><span>${escapeHtml(column.type || "sem tipo")}${flags ? ` | ${escapeHtml(flags)}` : ""}</span></li>`;
    }).join("");

    const indexes = table.indexes.length
      ? table.indexes.map((index) => `<li><code>${escapeHtml(index.name)}</code><span>${index.unique ? "UNIQUE" : "INDEX"}</span></li>`).join("")
      : "<li><span>Sem indices declarados.</span></li>";

    return `
      <article class="sql-table">
        <div class="sql-table-header">
          <strong>${escapeHtml(table.name)}</strong>
          <button class="ghost-button" type="button" data-sql-table="${escapeHtml(table.name)}">SELECT</button>
        </div>
        <ul>${columns}</ul>
        <details>
          <summary>Indices</summary>
          <ul>${indexes}</ul>
        </details>
      </article>
    `;
  }).join("");
}

async function loadSqlSchema() {
  sqlSchemaEl.textContent = "Carregando schema...";
  const response = await fetch("/api/sql");
  const data = await response.json();
  if (!response.ok) {
    sqlSchemaEl.textContent = data.error || "Erro ao carregar schema.";
    return;
  }
  renderSqlSchema(data.tables || []);
}

function renderSqlHistory(queries) {
  if (!queries.length) {
    sqlHistoryEl.innerHTML = "<p class=\"empty-text\">Nenhuma consulta recente.</p>";
    return;
  }

  sqlHistoryEl.innerHTML = queries.map((query) => `
    <article class="knowledge-item">
      <strong>${query.success ? "OK" : "Erro"} | ${escapeHtml(new Date(query.createdAt).toLocaleString())}</strong>
      <p>${escapeHtml(query.sql)}</p>
      <p>${query.readOnly ? "Somente leitura" : "Escrita"} | Linhas: ${escapeHtml(String(query.rowCount))} | ${escapeHtml(String(query.durationMs))} ms</p>
      ${query.error ? `<p>${escapeHtml(query.error)}</p>` : ""}
      <button class="ghost-button" type="button" data-sql-query="${escapeHtml(query.sql)}">Reusar</button>
    </article>
  `).join("");
}

function renderMissions(missions) {
  if (!missions.length) {
    missionListEl.innerHTML = "<p class=\"empty-text\">Nenhuma missao criada.</p>";
    return;
  }

  missionListEl.innerHTML = missions.map((mission) => {
    const needs = (mission.needs || []).slice(0, 8).map((need) => `
      <li>
        <span>${escapeHtml(need.priority)} | ${escapeHtml(need.status)} | ${escapeHtml(need.text)}</span>
        ${need.status !== "done" ? `<button class="ghost-button" type="button" data-mission-id="${escapeHtml(mission.id)}" data-need-id="${escapeHtml(need.id)}">Concluir</button>` : ""}
      </li>
    `).join("");
    const actions = (mission.actions || []).slice(0, 6).map((action) => `
      <li>
        <span>${action.safe ? "segura" : "confirmar"} | ${escapeHtml(action.status)} | ${escapeHtml(action.label)}</span>
        ${action.status !== "done" ? `<button class="ghost-button" type="button" data-mission-id="${escapeHtml(mission.id)}" data-action-id="${escapeHtml(action.id)}">Concluir</button>` : ""}
      </li>
    `).join("");
    return `
      <article class="knowledge-item">
        <strong>${escapeHtml(mission.priority)} | ${escapeHtml(mission.status)} | ${escapeHtml(mission.title)}</strong>
        <p>${escapeHtml(mission.objective)}</p>
        <p>Atualizada: ${escapeHtml(new Date(mission.updatedAt).toLocaleString())}</p>
        <button class="ghost-button" type="button" data-executor-mission-id="${escapeHtml(mission.id)}" data-executor-objective="${escapeHtml(mission.objective)}">Preparar execucao</button>
        <details>
          <summary>Necessidades</summary>
          <ul class="mission-list">${needs}</ul>
        </details>
        <details>
          <summary>Acoes seguras sugeridas</summary>
          <ul class="mission-list">${actions}</ul>
        </details>
      </article>
    `;
  }).join("");
}

async function loadMissions() {
  const response = await fetch("/api/missions");
  const data = await response.json();
  if (!response.ok) {
    missionListEl.innerHTML = `<p class="empty-text">${escapeHtml(data.error || "Erro ao carregar missoes.")}</p>`;
    return;
  }
  renderMissions(data.missions || []);
}

function renderExecutorResult(data) {
  const queue = data.executionQueue || [];
  const queueHtml = queue.length
    ? `<div class="executor-queue">
        ${queue.map((step, index) => `
          <article class="executor-step">
            <div>
              <strong>${index + 1}. ${escapeHtml(step.title || "Etapa")}</strong>
              <span>${escapeHtml(step.status || "pending")} | risco ${escapeHtml(step.risk || "medio")}</span>
            </div>
            <p>${escapeHtml(step.action || "")}</p>
            ${step.expectedOutput ? `<small>${escapeHtml(step.expectedOutput)}</small>` : ""}
            ${step.commandIds?.length ? `<button class="ghost-button" type="button" data-executor-step-id="${escapeHtml(step.id || "")}" data-executor-command-ids="${escapeHtml(step.commandIds.join(","))}">Executar etapa segura</button>` : ""}
            <pre class="executor-step-output" data-executor-step-output="${escapeHtml(step.id || "")}"></pre>
          </article>
        `).join("")}
      </div>`
    : "";
  executorOutputEl.innerHTML = `
    <pre>${escapeHtml(data.plan || "Executor preparado sem plano textual.")}</pre>
    ${queueHtml}
  `;
  executorFilesEl.innerHTML = (data.likelyFiles || [])
    .map((file) => `<button class="plan-file-button" type="button" data-executor-file="${escapeHtml(file)}">${escapeHtml(file)}</button>`)
    .join("");
}

function renderCodexExecutorCycle(data) {
  const checks = data.safeRun?.skipped
    ? `Checks pulados: ${data.safeRun.reason || "sem motivo informado"}`
    : (data.safeRun?.results || [])
      .map((result) => `${result.ok ? "OK" : "ERRO"} ${result.commandId}${result.error ? `: ${result.error}` : ""}`)
      .join("\n") || "Nenhum check executado.";
  const nextActions = (data.nextActions || []).map((item) => `- ${item}`).join("\n") || "- Escolher a proxima etapa segura.";
  const plan = data.executorPlan?.plan || data.codexMode?.plan || "";
  renderExecutorResult(data.executorPlan || {});
  executorOutputEl.innerHTML = `
    <pre>${escapeHtml(`${data.summary || "Ciclo Codex concluido."}\n\nValidacao\n${checks}\n\nProximas acoes\n${nextActions}\n\n${plan}`)}</pre>
    ${executorOutputEl.querySelector(".executor-queue")?.outerHTML || ""}
  `;
}

async function runExecutorStep(button) {
  const stepId = button.dataset.executorStepId || "";
  const commandIds = String(button.dataset.executorCommandIds || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const outputEl = executorOutputEl.querySelector(`[data-executor-step-output="${CSS.escape(stepId)}"]`);
  button.disabled = true;
  if (outputEl) outputEl.textContent = "Executando etapa segura...";

  try {
    const response = await fetch("/api/executor-run-step", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stepId, commandIds })
    });
    const data = await response.json();
    const lines = (data.results || []).map((result) => {
      const header = `${result.ok ? "OK" : "ERRO"} ${result.commandId}`;
      return [header, result.stdout, result.stderr, result.error].filter(Boolean).join("\n");
    });
    if (outputEl) outputEl.textContent = lines.join("\n\n") || data.error || "Etapa concluida sem saida.";
    await loadActivityTimeline();
    if (!response.ok) throw new Error(data.error || "Etapa terminou com erro.");
  } catch (error) {
    if (outputEl) outputEl.textContent = outputEl.textContent
      ? `${outputEl.textContent}\n\n${error.message}`
      : error.message;
  } finally {
    button.disabled = false;
  }
}

function renderWebProjectResult(data) {
  const scaffoldFeatures = data.scaffold?.features?.length
    ? `Recursos:\n${data.scaffold.features.map((item) => `- ${item}`).join("\n")}\n\n`
    : "";
  const scaffoldNextSteps = data.scaffold?.nextSteps?.length
    ? `Proximos passos:\n${data.scaffold.nextSteps.map((item) => `- ${item}`).join("\n")}\n\n`
    : "";
  const scaffoldText = data.scaffold
    ? `Scaffold criado\n${data.scaffold.path}\nArquivos: ${(data.scaffold.files || []).length}\n\n${scaffoldFeatures}${scaffoldNextSteps}`
    : "";
  webOutputEl.textContent = `${scaffoldText}${data.plan || "Projeto web preparado sem plano textual."}`;
  const files = data.scaffold?.files?.length ? data.scaffold.files : data.likelyFiles || [];
  webFilesEl.innerHTML = files
    .map((file) => `<button class="plan-file-button" type="button" data-web-file="${escapeHtml(file)}">${escapeHtml(file)}</button>`)
    .join("");
}

function renderGameCreatorResult(data) {
  gameOutputEl.textContent = data.plan || "Jogo preparado sem plano textual.";
  gameFilesEl.innerHTML = (data.likelyFiles || [])
    .map((file) => `<button class="plan-file-button" type="button" data-game-file="${escapeHtml(file)}">${escapeHtml(file)}</button>`)
    .join("");
}

async function prepareExecutor({ objective, missionId = "" }) {
  const cleanObjective = String(objective || "").trim();
  if (!cleanObjective && !missionId) {
    executorOutputEl.textContent = "Descreva o objetivo ou escolha uma missao.";
    return;
  }

  prepareExecutorEl.disabled = true;
  executorOutputEl.textContent = "Preparando execucao avancada...";
  executorFilesEl.innerHTML = "";

  try {
    const response = await fetch("/api/executor-plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: cleanObjective,
        missionId,
        fileContext: selectedFiles
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao preparar execucao.");
    renderExecutorResult(data);
  } catch (error) {
    executorOutputEl.textContent = error.message;
  } finally {
    prepareExecutorEl.disabled = false;
  }
}

async function runCodexExecutorCycle({ objective, missionId = "" }) {
  const cleanObjective = String(objective || "").trim();
  if (!cleanObjective && !missionId) {
    executorOutputEl.textContent = "Descreva o objetivo para o ciclo Codex.";
    return;
  }

  runCodexExecutorEl.disabled = true;
  executorOutputEl.textContent = "Rodando ciclo Codex: preparando contexto, fila e checks seguros...";
  executorFilesEl.innerHTML = "";

  try {
    const response = await fetch("/api/codex-executor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: cleanObjective,
        missionId,
        fileContext: selectedFiles,
        runSafeChecks: true,
        commandIds: ["npm-run-check"]
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao rodar ciclo Codex.");
    renderCodexExecutorCycle(data);
    await loadActivityTimeline();
  } catch (error) {
    executorOutputEl.textContent = error.message;
  } finally {
    runCodexExecutorEl.disabled = false;
  }
}

async function prepareWebProject() {
  const objective = webObjectiveEl.value.trim();
  if (!objective) {
    webOutputEl.textContent = "Descreva o sistema web que voce quer construir.";
    return;
  }

  prepareWebProjectEl.disabled = true;
  webOutputEl.textContent = "Projetando arquitetura web robusta...";
  webFilesEl.innerHTML = "";

  try {
    const response = await fetch("/api/web-project-plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective,
        appType: webAppTypeEl.value,
        stack: webStackEl.value,
        database: webDatabaseEl.value,
        auth: webAuthEl.value,
        deployment: webDeploymentEl.value,
        fileContext: selectedFiles
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao projetar sistema web.");
    renderWebProjectResult(data);
  } catch (error) {
    webOutputEl.textContent = error.message;
  } finally {
    prepareWebProjectEl.disabled = false;
  }
}

async function createWebScaffold() {
  const objective = webObjectiveEl.value.trim();
  if (!objective) {
    webOutputEl.textContent = "Descreva o sistema web que voce quer construir.";
    return;
  }

  createWebScaffoldEl.disabled = true;
  webOutputEl.textContent = "Criando scaffold em generated/web-projects...";
  webFilesEl.innerHTML = "";

  try {
    const response = await fetch("/api/web-project-scaffold", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective,
        projectName: webProjectNameEl.value,
        appType: webAppTypeEl.value,
        stack: webStackEl.value,
        database: webDatabaseEl.value,
        auth: webAuthEl.value,
        deployment: webDeploymentEl.value,
        fileContext: selectedFiles
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao criar scaffold web.");
    renderWebProjectResult(data);
  } catch (error) {
    webOutputEl.textContent = error.message;
  } finally {
    createWebScaffoldEl.disabled = false;
  }
}

function normalizeLocalPreviewUrl(value) {
  const withProtocol = String(value || "").trim().match(/^https?:\/\//i)
    ? String(value || "").trim()
    : `http://${String(value || "").trim()}`;
  const url = new URL(withProtocol);
  const allowedHosts = ["localhost", "127.0.0.1", "::1"];
  if (!allowedHosts.includes(url.hostname)) {
    throw new Error("Use uma URL local, como http://localhost:3000.");
  }
  return url.toString();
}

async function checkWebPreview() {
  try {
    const url = normalizeLocalPreviewUrl(webPreviewUrlEl.value);
    webPreviewUrlEl.value = url;
    webPreviewStatusEl.textContent = `Checando ${url}...`;
    const response = await fetch(`/api/web-preview-check?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao checar preview.");
    if (data.ok) {
      const title = data.title ? ` | ${data.title}` : "";
      webPreviewStatusEl.textContent = `Online ${data.status} em ${data.durationMs} ms${title}`;
    } else {
      webPreviewStatusEl.textContent = `Offline: ${data.error || `HTTP ${data.status}`}`;
    }
    return data;
  } catch (error) {
    webPreviewStatusEl.textContent = error.message;
    return { ok: false, error: error.message };
  }
}

async function loadWebPreview({ forceReload = false } = {}) {
  try {
    const url = normalizeLocalPreviewUrl(webPreviewUrlEl.value);
    localStorage.setItem("aurora-web-preview-url", url);
    webPreviewUrlEl.value = url;
    webPreviewStatusEl.textContent = forceReload ? `Recarregando ${url}` : `Mostrando ${url}`;
    webPreviewFrameEl.src = forceReload
      ? `${url}${url.includes("?") ? "&" : "?"}auroraReload=${Date.now()}`
      : url;
    await checkWebPreview();
  } catch (error) {
    webPreviewStatusEl.textContent = error.message;
  }
}

function setWebPreviewAutoRefresh(enabled) {
  if (webPreviewTimer) {
    clearInterval(webPreviewTimer);
    webPreviewTimer = null;
  }

  localStorage.setItem("aurora-web-preview-auto", enabled ? "1" : "0");
  if (enabled) {
    webPreviewStatusEl.textContent = "Auto-refresh ligado para o preview local.";
    webPreviewTimer = setInterval(() => loadWebPreview({ forceReload: true }), 5000);
  }
}

function restoreWebPreviewSettings() {
  const savedUrl = localStorage.getItem("aurora-web-preview-url");
  if (savedUrl) webPreviewUrlEl.value = savedUrl;
  const auto = localStorage.getItem("aurora-web-preview-auto") === "1";
  autoRefreshWebPreviewEl.checked = auto;
  setWebPreviewAutoRefresh(auto);
}

async function prepareGameCreator(objective) {
  const cleanObjective = String(objective || "").trim();
  if (!cleanObjective) {
    gameOutputEl.textContent = "Descreva o jogo que voce quer criar.";
    return;
  }

  prepareGameEl.disabled = true;
  gameOutputEl.textContent = "Preparando modo criador de jogos...";
  gameFilesEl.innerHTML = "";

  try {
    const response = await fetch("/api/game-creator-plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: cleanObjective,
        fileContext: selectedFiles
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao preparar jogo.");
    renderGameCreatorResult(data);
  } catch (error) {
    gameOutputEl.textContent = error.message;
  } finally {
    prepareGameEl.disabled = false;
  }
}

async function loadSqlHistory() {
  sqlHistoryEl.textContent = "Carregando historico SQL...";
  const response = await fetch("/api/sql-history");
  const data = await response.json();
  if (!response.ok) {
    sqlHistoryEl.textContent = data.error || "Erro ao carregar historico SQL.";
    return;
  }
  renderSqlHistory(data.queries || []);
}

function buildExplainSql(sql) {
  const normalized = sql.trim().replace(/;+\s*$/, "");
  const lower = normalized.toLowerCase();
  if (lower.startsWith("explain")) return normalized;
  if (!lower.startsWith("select")) {
    throw new Error("EXPLAIN automatico aceita apenas SELECT nesta interface.");
  }
  return `EXPLAIN QUERY PLAN ${normalized}`;
}

async function executeSql(sql, label = "Executando SQL...") {
  if (!sql) return;
  sqlOutputEl.textContent = label;
  const response = await fetch("/api/sql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sql })
  });
  const data = await response.json();
  sqlOutputEl.textContent = JSON.stringify(response.ok ? {
    rows: data.rows || [],
    rowCount: data.rowCount || 0,
    durationMs: data.durationMs || 0
  } : data, null, 2);
  await loadSqlHistory();
}

async function analyzeSql() {
  const sql = sqlInputEl.value.trim();
  if (!sql) return;
  sqlAnalysisEl.textContent = "Analisando SQL com a Aurora...";
  const response = await fetch("/api/sql-analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sql, model: modelEl.value })
  });
  const data = await response.json();
  sqlAnalysisEl.textContent = response.ok
    ? `${data.analysis}\n\nPlano:\n${JSON.stringify(data.plan || [], null, 2)}`
    : [data.error, data.detail].filter(Boolean).join("\n") || "Erro ao analisar SQL.";
}

async function loadChanges() {
  const response = await fetch("/api/change-log");
  const data = await response.json();
  renderChanges(data.changes || []);
}

async function loadMemory() {
  const response = await fetch("/api/memory");
  const memory = await response.json();
  memoryListEl.innerHTML = memory.notes
    .map((note) => `<li>${escapeHtml(note.text)}</li>`)
    .join("");
}

function renderKnowledge(items) {
  if (!items.length) {
    knowledgeListEl.innerHTML = "<p class=\"empty-text\">Nenhum conhecimento salvo.</p>";
    return;
  }

  knowledgeListEl.innerHTML = items.map((item) => `
    <article class="knowledge-item">
      <strong>[${escapeHtml(item.category)}] ${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.content)}</p>
      <button class="ghost-button" type="button" data-knowledge-id="${escapeHtml(item.id)}">Remover</button>
    </article>
  `).join("");
}

function renderResourceLibrary(resources) {
  if (!resources.length) {
    resourceListEl.innerHTML = "<p class=\"empty-text\">Nenhuma biblioteca cadastrada.</p>";
    return;
  }

  resourceListEl.innerHTML = resources.map((resource) => {
    const extensions = Object.entries(resource.stats?.byExtension || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([ext, count]) => `${ext}: ${count}`)
      .join(" | ");
    const modules = (resource.modules || []).slice(0, 8).join(" | ");
    const requirements = (resource.requirements || []).slice(0, 8).join(", ");
    const site = resource.siteIntelligence || {};
    const webIntelligence = site.isWebsite ? `
        <p>Inteligencia web: ${escapeHtml((site.frameworks || []).slice(0, 6).join(", ") || "site estatico")}</p>
        <p>Paginas/rotas: ${escapeHtml((site.routingHints || site.pages || []).slice(0, 6).map((item) => item.path || item).join(" | ") || "nao mapeadas")}</p>
        <p>Padroes: ${escapeHtml((site.layoutPatterns || []).slice(0, 6).join(" | ") || "nao mapeados")}</p>
        <p>Licoes: ${escapeHtml((site.architectureLessons || []).slice(0, 4).join(" "))}</p>
      ` : "";
    return `
      <article class="knowledge-item">
        <strong>${escapeHtml(resource.title)}</strong>
        <p>${escapeHtml(resource.summary || "")}</p>
        <p>${escapeHtml(resource.path)}</p>
        <p>Modulos: ${escapeHtml(modules || "nao mapeados")}</p>
        <p>Extensoes: ${escapeHtml(extensions || "nao mapeadas")}</p>
        <p>Requisitos: ${escapeHtml(requirements || "nenhum")}</p>
        ${webIntelligence}
        <div class="button-row">
          <button class="ghost-button" type="button" data-resource-action="teach" data-resource-id="${escapeHtml(resource.id)}">Explicar</button>
          <button class="ghost-button" type="button" data-resource-action="visual" data-resource-id="${escapeHtml(resource.id)}">Visual</button>
          <button class="ghost-button" type="button" data-resource-action="security" data-resource-id="${escapeHtml(resource.id)}">Seguranca</button>
          <button class="ghost-button" type="button" data-resource-action="remove" data-resource-id="${escapeHtml(resource.id)}">Remover</button>
        </div>
      </article>
    `;
  }).join("");
}

async function loadKnowledge() {
  const response = await fetch("/api/knowledge");
  const data = await response.json();
  renderKnowledge(data.items || []);
}

async function loadResourceLibrary() {
  const response = await fetch("/api/resource-library");
  const data = await response.json();
  renderResourceLibrary(data.resources || []);
}

function renderAttachedProject(data) {
  const project = data.project;
  if (!project) {
    attachedProjectSummaryEl.textContent = "Nenhum projeto anexado.";
    return;
  }

  attachedProjectPathEl.value = project.path || "";
  const index = data.index || {};
  const codeMap = data.codeMap || {};
  const important = (index.importantFiles || [])
    .slice(0, 8)
    .map((file) => file.path)
    .join("\n");
  const highlights = (codeMap.files || [])
    .filter((file) => file.functions?.length || file.classes?.length || file.endpoints?.length)
    .slice(0, 8)
    .map((file) => file.path)
    .join("\n");

  attachedProjectSummaryEl.textContent = [
    `Projeto: ${project.name || "Projeto anexado"}`,
    `Pasta: ${project.path}`,
    `Anexado: ${project.attachedAt ? new Date(project.attachedAt).toLocaleString() : "-"}`,
    `Arquivos: ${index.totalFiles || 0}`,
    `Arquivos de codigo: ${codeMap.totalFiles || 0}`,
    "",
    "Importantes:",
    important || "Nenhum ainda.",
    "",
    "Codigo relevante:",
    highlights || "Nenhum ainda."
  ].join("\n");
}

async function loadAttachedProject() {
  const response = await fetch("/api/attached-project");
  const data = await response.json();
  renderAttachedProject(data);
}

function renderIndex(index) {
  if (!index) {
    indexSummaryEl.textContent = "Indice ainda nao gerado.";
    return;
  }

  const folders = Object.entries(index.byTopFolder || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([folder, count]) => `${folder}: ${count}`)
    .join("\n");

  const important = (index.importantFiles || [])
    .slice(0, 8)
    .map((file) => file.path)
    .join("\n");

  indexSummaryEl.textContent = [
    `Gerado: ${new Date(index.generatedAt).toLocaleString()}`,
    `Arquivos: ${index.totalFiles}`,
    "",
    "Pastas:",
    folders || "Nenhuma",
    "",
    "Importantes:",
    important || "Nenhum"
  ].join("\n");
}

async function loadProjectIndex() {
  const response = await fetch("/api/project-index");
  const data = await response.json();
  renderIndex(data.index);
}

function renderCodeMap(codeMap) {
  if (!codeMap) {
    codeMapSummaryEl.textContent = "Mapa ainda nao gerado.";
    return;
  }

  const folders = Object.entries(codeMap.byTopFolder || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([folder, count]) => `${folder}: ${count}`)
    .join("\n");

  const highlights = (codeMap.files || [])
    .filter((file) => file.functions?.length || file.classes?.length || file.endpoints?.length)
    .slice(0, 8)
    .map((file) => {
      const parts = [];
      if (file.classes?.length) parts.push(`classes ${file.classes.slice(0, 3).join(", ")}`);
      if (file.functions?.length) parts.push(`funcoes ${file.functions.slice(0, 4).join(", ")}`);
      if (file.endpoints?.length) parts.push(`rotas ${file.endpoints.slice(0, 4).join(", ")}`);
      return `${file.path}\n  ${parts.join("; ")}`;
    })
    .join("\n");

  codeMapSummaryEl.textContent = [
    `Gerado: ${new Date(codeMap.generatedAt).toLocaleString()}`,
    `Arquivos de codigo: ${codeMap.totalFiles}`,
    "",
    "Pastas:",
    folders || "Nenhuma",
    "",
    "Destaques:",
    highlights || "Nenhum"
  ].join("\n");
}

async function loadCodeMap() {
  const response = await fetch("/api/code-map");
  const data = await response.json();
  renderCodeMap(data.codeMap);
}

function fillProfile(profile) {
  profileStackEl.value = profile.stack || "";
  profileDatabaseEl.value = profile.database || "";
  profileRunEl.value = profile.runCommands || "";
  profileTestEl.value = profile.testCommands || "";
  profileGoalsEl.value = profile.goals || "";
  profileNotesEl.value = profile.notes || "";
  profileStatusEl.textContent = profile.updatedAt
    ? `Salvo em ${new Date(profile.updatedAt).toLocaleString()}`
    : "Perfil ainda nao salvo.";
}

async function loadProjectProfile() {
  const response = await fetch("/api/project-profile");
  const data = await response.json();
  fillProfile(data.profile || {});
}

function renderFileTree(items) {
  if (!items.length) return "<p class=\"empty-text\">Nenhum arquivo de texto encontrado.</p>";

  return `<ul>${items.map((item) => {
    if (item.type === "dir") {
      return `<li><details><summary>${escapeHtml(item.name)}</summary>${renderFileTree(item.children || [])}</details></li>`;
    }

    return `<li><button class="file-button" type="button" data-path="${escapeHtml(item.path)}">${escapeHtml(item.name)}</button></li>`;
  }).join("")}</ul>`;
}

async function loadFiles() {
  fileListEl.innerHTML = "<p class=\"empty-text\">Carregando...</p>";

  try {
    const response = await fetch("/api/files");
    const data = await response.json();
    fileListEl.innerHTML = renderFileTree(data.tree || []);
  } catch (error) {
    fileListEl.innerHTML = `<p class="empty-text">Erro: ${escapeHtml(error.message)}</p>`;
  }
}

async function attachFile(filePath, sourceButton = null) {
  try {
    const response = await fetch("/api/read-file", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: filePath })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Nao foi possivel ler o arquivo.");

    selectedFiles.splice(0, selectedFiles.length, data);
    document.querySelectorAll(".file-button.selected, .result-button.selected")
      .forEach((node) => node.classList.remove("selected"));
    sourceButton?.classList.add("selected");
    resetPendingEdit();
    renderSelectedFiles();
  } catch (error) {
    fileContextStatusEl.textContent = error.message;
  }
}

function renderSearchResults(results) {
  if (!results.length) {
    searchResultsEl.innerHTML = "<p class=\"empty-text\">Nada encontrado.</p>";
    return;
  }

  searchResultsEl.innerHTML = results.map((result) => `
    <button class="result-button" type="button" data-path="${escapeHtml(result.path)}">
      <strong>${escapeHtml(result.path)}</strong>
      <span>${escapeHtml(result.match === "path" ? "nome do arquivo" : result.snippet)}</span>
    </button>
  `).join("");
}

function looksLikeImageGenerationRequest(text) {
  const value = String(text || "").toLowerCase();
  const asksAboutImageTools =
    /\b(quais|qual|como|configurad[ao]s?|consegue usar|voce usa|você usa|pode usar|tem acesso)\b/i.test(value)
    && /\b(motores? de imagem|provedores? de imagem|ferramentas? de imagem|apis?|chaves?|gemini|openrouter|comfyui|nano banana)\b/i.test(value);
  if (asksAboutImageTools) return false;

  const hasCreateIntent = /\b(crie|cria|criar|gere|gera|gerar|faz|faca|faça|fazer|desenha|desenhe|desenhar|produza|produzir|quero|preciso|monte|renderize)\b/i.test(value);
  const hasImageSubject = /\b(imagem|foto|desenho|ilustracao|ilustração|arte|logo|sprite|icone|ícone|avatar|personagem|anime|manga|mangá|mascote|poster|banner|wallpaper|retrato)\b/i.test(value);
  const hasVisualStyle = /\b(estilo anime|anime|manga|mangá|cartoon|pixel art|realista|fotorealista|cinematic|3d|aquarela|pintura digital)\b/i.test(value);
  const hasImplicitPrompt = /^\s*(uma?\s+)?(imagem|foto|desenho|logo|sprite|icone|ícone|avatar|personagem|mascote|poster|banner|wallpaper|retrato)\s+(de|do|da|com)\b/i.test(value);
  if (!hasImageSubject && !hasVisualStyle) return false;
  return hasCreateIntent || hasImplicitPrompt;
}

function looksLikeImageRetryRequest(text) {
  return /\b(tenta|tente|refaz|refaca|refaça|novamente|de novo|agora sim|faz de novo|faca de novo|faça de novo)\b/i.test(String(text || ""));
}

function findImagePromptFromHistory(currentContent) {
  if (looksLikeImageGenerationRequest(currentContent)) return currentContent;
  if (!looksLikeImageRetryRequest(currentContent)) return "";

  const previousImageMessage = [...history]
    .slice(0, -1)
    .reverse()
    .find((message) => message.role === "user" && looksLikeImageGenerationRequest(message.content));
  if (!previousImageMessage) return "";
  return `${previousImageMessage.content}\nPedido de ajuste: ${currentContent}`;
}

promptEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = promptEl.value.trim();
  if (!content) return;

  history.push({ role: "user", content });
  promptEl.value = "";
  renderMessages();

  try {
    const handled = await runQuickCommand(content);
    if (handled) {
      await saveChatHistory();
      return;
    }

    if (looksLikeCodexModeRequest(content)) {
      await runCodexMode(content);
      return;
    }

    if (looksLikeAutonomousRequest(content)) {
      await runAutonomousTask(content);
      return;
    }
  } catch (error) {
    pushAssistantStatus(`Nao consegui executar esse atalho: ${error.message}`);
    return;
  }

  const pending = { role: "assistant", content: "Pensando..." };
  history.push(pending);
  renderMessages();

  try {
    const imagePrompt = findImagePromptFromHistory(content);
    if (imagePrompt) {
      const response = await fetch("/api/create-image", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt,
          imageProvider: "auto"
        })
      });
      const data = await response.json();
      if (response.ok) {
        pending.content = data.message;
        pending.image = data.image || null;
      } else {
        pending.content = `${data.error}\n${data.detail || ""}`;
      }
      renderMessages();
      await saveChatHistory();
      return;
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: modelEl.value,
        mode: modeEl.value,
        imageProvider: "auto",
        fileContext: selectedFiles,
        messages: history.filter((message) => message.content !== "Pensando...")
      })
    });
    const data = await response.json();
    if (response.ok) {
      const providerNote = data.provider
        ? `\n\nFonte: ${data.provider}${data.model ? ` (${data.model})` : ""}${data.fallbackFrom ? `, fallback de ${data.fallbackFrom}` : ""}.`
        : "";
      pending.content = `${data.message}${providerNote}`;
      pending.image = data.image || null;
    } else {
      pending.content = `${data.error}\n${data.detail || ""}`;
    }
  } catch (error) {
    pending.content = `Erro ao chamar a IA: ${error.message}`;
  }

  renderMessages();
  await saveChatHistory();
});

clearChatEl.addEventListener("click", async () => {
  history.splice(0, history.length, { ...initialMessage });
  renderMessages();
  await fetch(`/api/chat-history?session=${encodeURIComponent(currentSessionId)}`, { method: "DELETE" });
});

sessionSelectEl.addEventListener("change", async () => {
  await switchSession(sessionSelectEl.value);
});

newSessionEl.addEventListener("click", async () => {
  const title = `Conversa ${new Date().toLocaleString()}`;
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title })
  });
  const data = await response.json();
  currentSessionId = data.id;
  await loadSessions();
  await switchSession(currentSessionId);
});

deleteSessionEl.addEventListener("click", async () => {
  if (currentSessionId === "default") return;
  await fetch(`/api/sessions?id=${encodeURIComponent(currentSessionId)}`, { method: "DELETE" });
  currentSessionId = "default";
  await loadSessions();
  await switchSession(currentSessionId);
});

saveMemoryEl.addEventListener("click", async () => {
  const text = memoryTextEl.value.trim();
  if (!text) return;

  await fetch("/api/memory", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text })
  });

  memoryTextEl.value = "";
  await loadMemory();
});

reloadFilesEl.addEventListener("click", loadFiles);

fileListEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-path]");
  if (!button) return;

  const filePath = button.dataset.path;
  const existingIndex = selectedFiles.findIndex((file) => file.path === filePath);
  if (existingIndex >= 0) {
    selectedFiles.splice(existingIndex, 1);
    button.classList.remove("selected");
    resetPendingEdit();
    renderSelectedFiles();
    return;
  }

  await attachFile(filePath, button);
});

searchFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = searchInputEl.value.trim();
  if (query.length < 2) {
    searchResultsEl.innerHTML = "<p class=\"empty-text\">Digite pelo menos 2 caracteres.</p>";
    return;
  }

  searchResultsEl.innerHTML = "<p class=\"empty-text\">Buscando...</p>";

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha na busca.");
    renderSearchResults(data.results || []);
  } catch (error) {
    searchResultsEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
  }
});

searchResultsEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-path]");
  if (!button) return;

  await attachFile(button.dataset.path, button);
});

semanticSearchEl.addEventListener("click", async () => {
  const query = searchInputEl.value.trim();
  if (query.length < 2) {
    searchResultsEl.innerHTML = "<p class=\"empty-text\">Digite pelo menos 2 caracteres.</p>";
    return;
  }
  searchResultsEl.innerHTML = "<p class=\"empty-text\">Buscando por significado aproximado...</p>";
  try {
    const response = await fetch(`/api/rag-search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha na busca semantica.");
    renderSearchResults((data.results || []).map((item) => ({ ...item, match: "content" })));
  } catch (error) {
    searchResultsEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
  }
});

buildIndexEl.addEventListener("click", async () => {
  buildIndexEl.disabled = true;
  indexSummaryEl.textContent = "Gerando indice...";

  try {
    const response = await fetch("/api/project-index", { method: "POST" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao gerar indice.");
    renderIndex(data.index);
  } catch (error) {
    indexSummaryEl.textContent = error.message;
  } finally {
    buildIndexEl.disabled = false;
  }
});

attachProjectEl.addEventListener("click", async () => {
  const projectPath = attachedProjectPathEl.value.trim();
  if (!projectPath) {
    attachedProjectSummaryEl.textContent = "Informe a pasta do projeto.";
    return;
  }

  attachProjectEl.disabled = true;
  attachedProjectSummaryEl.textContent = "Anexando e analisando pasta...";

  try {
    const response = await fetch("/api/attached-project", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: projectPath, analyze: true })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao anexar projeto.");
    renderAttachedProject(data);
  } catch (error) {
    attachedProjectSummaryEl.textContent = error.message;
  } finally {
    attachProjectEl.disabled = false;
  }
});

reloadAttachedProjectEl.addEventListener("click", loadAttachedProject);

buildCodeMapEl.addEventListener("click", async () => {
  buildCodeMapEl.disabled = true;
  codeMapSummaryEl.textContent = "Gerando mapa...";

  try {
    const response = await fetch("/api/code-map", { method: "POST" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao gerar mapa.");
    renderCodeMap(data.codeMap);
  } catch (error) {
    codeMapSummaryEl.textContent = error.message;
  } finally {
    buildCodeMapEl.disabled = false;
  }
});

saveProfileEl.addEventListener("click", async () => {
  saveProfileEl.disabled = true;
  profileStatusEl.textContent = "Salvando...";

  try {
    const response = await fetch("/api/project-profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        stack: profileStackEl.value,
        database: profileDatabaseEl.value,
        runCommands: profileRunEl.value,
        testCommands: profileTestEl.value,
        goals: profileGoalsEl.value,
        notes: profileNotesEl.value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao salvar perfil.");
    fillProfile(data.profile);
  } catch (error) {
    profileStatusEl.textContent = error.message;
  } finally {
    saveProfileEl.disabled = false;
  }
});

generatePlanEl.addEventListener("click", async () => {
  const task = planTaskEl.value.trim();
  if (!task) {
    planOutputEl.textContent = "Descreva a tarefa antes de planejar.";
    return;
  }

  generatePlanEl.disabled = true;
  planOutputEl.textContent = "Gerando plano...";

  try {
    const response = await fetch("/api/plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: modelEl.value,
        mode: modeEl.value,
        task,
        fileContext: selectedFiles
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao gerar plano.");
    planOutputEl.textContent = data.plan;
    planFilesEl.innerHTML = (data.likelyFiles || [])
      .map((file) => `<button class="plan-file-button" type="button" data-plan-file="${escapeHtml(file)}">${escapeHtml(file)}</button>`)
      .join("");
  } catch (error) {
    planOutputEl.textContent = error.message;
    planFilesEl.innerHTML = "";
  } finally {
    generatePlanEl.disabled = false;
  }
});

planFilesEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-plan-file]");
  if (!button) return;
  await attachFile(button.dataset.planFile, button);
});

createMissionEl.addEventListener("click", async () => {
  const objective = missionObjectiveEl.value.trim();
  if (!objective) {
    missionListEl.innerHTML = "<p class=\"empty-text\">Descreva o objetivo da missao.</p>";
    return;
  }

  createMissionEl.disabled = true;
  missionListEl.innerHTML = "<p class=\"empty-text\">Criando missao...</p>";

  try {
    const response = await fetch("/api/missions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective, fileContext: selectedFiles })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao criar missao.");
    missionObjectiveEl.value = "";
    await loadMissions();
  } catch (error) {
    missionListEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
  } finally {
    createMissionEl.disabled = false;
  }
});

reloadMissionsEl.addEventListener("click", loadMissions);

missionListEl.addEventListener("click", async (event) => {
  const executorButton = event.target.closest("[data-executor-mission-id]");
  if (executorButton) {
    executorObjectiveEl.value = executorButton.dataset.executorObjective || "";
    await prepareExecutor({
      objective: executorObjectiveEl.value,
      missionId: executorButton.dataset.executorMissionId
    });
    return;
  }

  const button = event.target.closest("[data-mission-id][data-need-id], [data-mission-id][data-action-id]");
  if (!button) return;

  const body = { id: button.dataset.missionId };
  if (button.dataset.needId) {
    body.needId = button.dataset.needId;
    body.needStatus = "done";
  }
  if (button.dataset.actionId) {
    body.actionId = button.dataset.actionId;
    body.actionStatus = "done";
  }

  const response = await fetch("/api/missions", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    missionListEl.innerHTML = `<p class="empty-text">${escapeHtml(data.error || "Falha ao atualizar missao.")}</p>`;
    return;
  }
  await loadMissions();
});

prepareExecutorEl.addEventListener("click", async () => {
  await prepareExecutor({ objective: executorObjectiveEl.value });
});

runCodexExecutorEl.addEventListener("click", async () => {
  await runCodexExecutorCycle({ objective: executorObjectiveEl.value });
});

executorFilesEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-executor-file]");
  if (!button) return;
  await attachFile(button.dataset.executorFile, button);
});

executorOutputEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-executor-command-ids]");
  if (!button) return;
  await runExecutorStep(button);
});

prepareWebProjectEl.addEventListener("click", prepareWebProject);
createWebScaffoldEl.addEventListener("click", createWebScaffold);
checkWebPreviewEl.addEventListener("click", checkWebPreview);
loadWebPreviewEl.addEventListener("click", async () => loadWebPreview());
refreshWebPreviewEl.addEventListener("click", async () => loadWebPreview({ forceReload: true }));
autoRefreshWebPreviewEl.addEventListener("change", () => setWebPreviewAutoRefresh(autoRefreshWebPreviewEl.checked));
webPreviewFrameEl.addEventListener("load", () => {
  if (webPreviewFrameEl.src) {
    webPreviewStatusEl.textContent = `Preview carregado: ${webPreviewFrameEl.src}`;
  }
});

webFilesEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-web-file]");
  if (!button) return;
  await attachFile(button.dataset.webFile, button);
});

prepareGameEl.addEventListener("click", async () => {
  await prepareGameCreator(gameObjectiveEl.value);
});

gameFilesEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-game-file]");
  if (!button) return;
  await attachFile(button.dataset.gameFile, button);
});

generateSecurityPlanEl.addEventListener("click", async () => {
  const objective = securityObjectiveEl.value.trim();
  if (!objective) {
    securityOutputEl.textContent = "Descreva o que precisa ser construido com seguranca.";
    return;
  }

  generateSecurityPlanEl.disabled = true;
  securityOutputEl.textContent = "Gerando plano de seguranca...";
  securityFilesEl.innerHTML = "";

  try {
    const response = await fetch("/api/security-plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective,
        fileContext: selectedFiles
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao gerar plano de seguranca.");
    securityOutputEl.textContent = data.plan;
    securityFilesEl.innerHTML = (data.likelyFiles || [])
      .map((file) => `<button class="plan-file-button" type="button" data-security-file="${escapeHtml(file)}">${escapeHtml(file)}</button>`)
      .join("");
  } catch (error) {
    securityOutputEl.textContent = error.message;
  } finally {
    generateSecurityPlanEl.disabled = false;
  }
});

securityFilesEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-security-file]");
  if (!button) return;
  await attachFile(button.dataset.securityFile, button);
});

function renderSecurityAudit(data) {
  const severity = securityAuditSeverityEl.value;
  const query = securityAuditSearchEl.value.trim().toLowerCase();
  const findings = (data.findings || []).filter((finding) => {
    const matchesSeverity = severity === "all" || finding.severity === severity;
    const haystack = `${finding.title} ${finding.path} ${finding.snippet} ${finding.advice}`.toLowerCase();
    return matchesSeverity && (!query || haystack.includes(query));
  });
  if (!findings.length) {
    securityAuditEl.innerHTML = `<p class="empty-text">Nenhum achado para o filtro atual. Arquivos verificados: ${escapeHtml(String(data.scannedFiles || 0))}.</p>`;
    return;
  }

  const summary = data.summary || {};
  const header = `
    <article class="knowledge-item">
      <strong>Resumo</strong>
      <p>Escopo: ${escapeHtml(data.scope || "app")} | Raiz: ${escapeHtml(data.root || "")}</p>
      <p>Arquivos: ${escapeHtml(String(data.scannedFiles || 0))} | Altos: ${escapeHtml(String(summary.high || 0))} | Medios: ${escapeHtml(String(summary.medium || 0))} | Baixos: ${escapeHtml(String(summary.low || 0))}</p>
      <p>Mostrando: ${escapeHtml(String(findings.length))} de ${escapeHtml(String((data.findings || []).length))} achados.</p>
      <p>Achados para revisar. Confirme manualmente antes de tratar como vulnerabilidade.</p>
    </article>
  `;

  securityAuditEl.innerHTML = header + findings.map((finding) => `
    <article class="knowledge-item">
      <strong>${escapeHtml(finding.severity.toUpperCase())} | ${escapeHtml(finding.title)}</strong>
      <p>${escapeHtml(finding.path)}:${escapeHtml(String(finding.line))}</p>
      <p>${escapeHtml(finding.snippet)}</p>
      <p>${escapeHtml(finding.advice)}</p>
      <button class="ghost-button" type="button" data-security-audit-file="${escapeHtml(finding.path)}">Anexar arquivo</button>
    </article>
  `).join("");
}

runSecurityAuditEl.addEventListener("click", async () => {
  runSecurityAuditEl.disabled = true;
  securityAuditEl.textContent = "Rodando auditoria rapida...";

  try {
    const response = await fetch(`/api/security-audit?scope=${encodeURIComponent(securityAuditScopeEl.value)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao rodar auditoria.");
    lastSecurityAudit = data;
    renderSecurityAudit(data);
  } catch (error) {
    securityAuditEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
  } finally {
    runSecurityAuditEl.disabled = false;
  }
});

securityAuditSeverityEl.addEventListener("change", () => {
  if (lastSecurityAudit) renderSecurityAudit(lastSecurityAudit);
});

securityAuditSearchEl.addEventListener("input", () => {
  if (lastSecurityAudit) renderSecurityAudit(lastSecurityAudit);
});

securityAuditEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-security-audit-file]");
  if (!button) return;
  await attachFile(button.dataset.securityAuditFile, button);
});

saveKnowledgeEl.addEventListener("click", async () => {
  const title = knowledgeTitleEl.value.trim();
  const content = knowledgeContentEl.value.trim();

  if (!title || !content) {
    knowledgeListEl.innerHTML = "<p class=\"empty-text\">Preencha titulo e conteudo.</p>";
    return;
  }

  saveKnowledgeEl.disabled = true;

  try {
    const response = await fetch("/api/knowledge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        category: knowledgeCategoryEl.value,
        title,
        content
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao salvar conhecimento.");
    knowledgeTitleEl.value = "";
    knowledgeContentEl.value = "";
    renderKnowledge(data.items || []);
  } catch (error) {
    knowledgeListEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
  } finally {
    saveKnowledgeEl.disabled = false;
  }
});

knowledgeListEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-knowledge-id]");
  if (!button) return;

  const response = await fetch(`/api/knowledge?id=${encodeURIComponent(button.dataset.knowledgeId)}`, {
    method: "DELETE"
  });
  const data = await response.json();
  renderKnowledge(data.items || []);
});

scanResourceEl.addEventListener("click", async () => {
  const resourcePath = resourcePathEl.value.trim();
  if (!resourcePath) {
    resourceListEl.innerHTML = "<p class=\"empty-text\">Informe a pasta da biblioteca.</p>";
    return;
  }

  scanResourceEl.disabled = true;
  resourceListEl.innerHTML = "<p class=\"empty-text\">Mapeando biblioteca externa...</p>";

  try {
    const response = await fetch("/api/resource-library", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: resourceTitleEl.value.trim(),
        path: resourcePath
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao cadastrar biblioteca.");
    renderResourceLibrary(data.resources || []);
  } catch (error) {
    resourceListEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
  } finally {
    scanResourceEl.disabled = false;
  }
});

searchResourceEl.addEventListener("click", async () => {
  const query = resourceSearchEl.value.trim();
  if (query.length < 2) {
    resourceInsightOutputEl.textContent = "Digite uma busca com pelo menos 2 caracteres.";
    return;
  }
  resourceInsightOutputEl.textContent = "Buscando nas bibliotecas...";
  try {
    const response = await fetch(`/api/resource-library/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha na busca.");
    resourceInsightOutputEl.textContent = data.results?.length
      ? data.results.map((item) => `${item.title} | score ${item.score}\n${item.summary || ""}`).join("\n\n")
      : "Nenhuma biblioteca combinou com a busca.";
  } catch (error) {
    resourceInsightOutputEl.textContent = error.message;
  }
});

consolidateProjectMemoryEl.addEventListener("click", async () => {
  resourceInsightOutputEl.textContent = "Consolidando memoria do projeto...";
  try {
    const response = await fetch("/api/project-memory/consolidate", { method: "POST" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao consolidar memoria.");
    fillProfile(data.profile || {});
    resourceInsightOutputEl.textContent = [
      `Recursos usados: ${data.resourcesUsed || 0}`,
      `Stacks: ${(data.frameworks || []).join(", ") || "nenhuma"}`,
      `Padroes: ${(data.patterns || []).join(", ") || "nenhum"}`,
      `Licoes: ${(data.lessons || []).join(" ") || "nenhuma"}`
    ].join("\n");
  } catch (error) {
    resourceInsightOutputEl.textContent = error.message;
  }
});

createReferenceSiteEl.addEventListener("click", async () => {
  const objective = referenceSiteObjectiveEl.value.trim();
  if (!objective) {
    resourceInsightOutputEl.textContent = "Descreva o site que sera criado com referencia.";
    return;
  }
  const firstResourceButton = resourceListEl.querySelector("[data-resource-action='teach']");
  const resourceId = firstResourceButton?.dataset.resourceId || "";
  createReferenceSiteEl.disabled = true;
  resourceInsightOutputEl.textContent = "Criando site guiado pela biblioteca mais recente...";
  try {
    const response = await fetch("/api/resource-library/create-site", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective,
        resourceId,
        projectName: resourceTitleEl.value.trim() || "site-guiado",
        appType: webAppTypeEl.value,
        stack: webStackEl.value,
        database: webDatabaseEl.value,
        auth: webAuthEl.value,
        deployment: webDeploymentEl.value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao criar site guiado.");
    resourceInsightOutputEl.textContent = [
      data.message,
      `Referencia: ${data.reference?.title || "-"}`,
      `Pasta: ${data.scaffold?.path || "-"}`,
      "",
      "Arquivos:",
      ...(data.scaffold?.files || []).slice(0, 12)
    ].join("\n");
  } catch (error) {
    resourceInsightOutputEl.textContent = error.message;
  } finally {
    createReferenceSiteEl.disabled = false;
  }
});

resourceListEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-resource-id]");
  if (!button) return;

  const action = button.dataset.resourceAction || "remove";
  if (action === "remove") {
    const response = await fetch(`/api/resource-library?id=${encodeURIComponent(button.dataset.resourceId)}`, {
      method: "DELETE"
    });
    const data = await response.json();
    renderResourceLibrary(data.resources || []);
    return;
  }

  const endpoint = {
    teach: "/api/resource-library/teach",
    visual: "/api/resource-library/visual",
    security: "/api/resource-library/security"
  }[action];
  if (!endpoint) return;

  resourceInsightOutputEl.textContent = "Gerando leitura da biblioteca...";
  try {
    const response = await fetch(`${endpoint}?id=${encodeURIComponent(button.dataset.resourceId)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha na leitura da biblioteca.");
    resourceInsightOutputEl.textContent = data.explanation || JSON.stringify(data, null, 2);
  } catch (error) {
    resourceInsightOutputEl.textContent = error.message;
  }
});

savePermissionsEl.addEventListener("click", async () => {
  const response = await fetch("/api/permissions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      readFiles: permReadEl.checked,
      proposeEdits: permProposeEl.checked,
      applyEdits: permApplyEl.checked,
      runCommands: permCommandsEl.checked,
      sqlWrite: permSqlWriteEl.checked
    })
  });
  const data = await response.json();
  toolOutputEl.textContent = JSON.stringify(data.permissions, null, 2);
});

saveBehaviorEl.addEventListener("click", async () => {
  saveBehaviorEl.disabled = true;
  behaviorStatusEl.textContent = "Salvando comportamento...";

  try {
    const response = await fetch("/api/behavior-settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        freeBuilder: freeBuilderModeEl.checked,
        advancedExecutor: advancedExecutorModeEl.checked
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao salvar comportamento.");
    behaviorStatusEl.textContent = [
      data.settings?.freeBuilder ? "Construtor livre ligado." : "Construtor livre desligado.",
      data.settings?.advancedExecutor ? "Executor avancado ligado." : "Executor avancado desligado."
    ].join(" ");
  } catch (error) {
    behaviorStatusEl.textContent = error.message;
  } finally {
    saveBehaviorEl.disabled = false;
  }
});

saveModelRoutesEl.addEventListener("click", async () => {
  saveModelRoutesEl.disabled = true;
  modelRoutesStatusEl.textContent = "Salvando rotas...";

  try {
    const response = await fetch("/api/model-routes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        generalModel: routeGeneralEl.value,
        codeModel: routeCodeEl.value,
        databaseModel: routeDatabaseEl.value,
        architectModel: routeArchitectEl.value,
        fallbackModel: routeFallbackEl.value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao salvar rotas.");
    modelRoutesStatusEl.textContent = "Rotas salvas.";
  } catch (error) {
    modelRoutesStatusEl.textContent = error.message;
  } finally {
    saveModelRoutesEl.disabled = false;
  }
});

analyzeModelsEl.addEventListener("click", analyzeModelRoutes);

applyRecommendedRoutesEl.addEventListener("click", async () => {
  if (!lastModelAdvisor) await analyzeModelRoutes();
  if (!lastModelAdvisor?.recommendedRoutes) return;
  setRouteSelectValues(lastModelAdvisor.recommendedRoutes);
  modelRoutesStatusEl.textContent = "Rotas recomendadas aplicadas na tela. Clique em Salvar rotas para persistir.";
});

checkPortableEl.addEventListener("click", async () => {
  checkPortableEl.disabled = true;
  portableOutputEl.textContent = "Checando transferencia...";

  try {
    const response = await fetch("/api/portable-check");
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao checar portabilidade.");
    renderPortableCheck(data);
  } catch (error) {
    portableOutputEl.textContent = error.message;
  } finally {
    checkPortableEl.disabled = false;
  }
});

checkMaintenanceEl.addEventListener("click", async () => {
  checkMaintenanceEl.disabled = true;
  maintenanceOutputEl.textContent = "Checando memoria, contexto e permissoes...";

  try {
    const response = await fetch(`/api/maintenance?session=${encodeURIComponent(currentSessionId)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao checar manutencao.");
    renderMaintenanceStatus(data);
  } catch (error) {
    maintenanceOutputEl.textContent = error.message;
  } finally {
    checkMaintenanceEl.disabled = false;
  }
});

compactSessionEl.addEventListener("click", async () => {
  compactSessionEl.disabled = true;
  maintenanceOutputEl.textContent = "Compactando conversa atual...";

  try {
    const response = await fetch("/api/maintenance", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "compact-session", sessionId: currentSessionId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao compactar conversa.");
    history.splice(0, history.length, ...(data.messages || [{ ...initialMessage }]));
    renderMessages();
    renderMaintenanceStatus(data.status);
    maintenanceOutputEl.textContent += `\n\nCompactacao\n${data.compacted ? `Compactado. Mensagens removidas: ${data.removed}.` : "Nada para compactar ainda."}`;
  } catch (error) {
    maintenanceOutputEl.textContent = error.message;
  } finally {
    compactSessionEl.disabled = false;
  }
});

optimizeDatabaseEl.addEventListener("click", async () => {
  optimizeDatabaseEl.disabled = true;
  maintenanceOutputEl.textContent = "Otimizando banco SQLite...";

  try {
    const response = await fetch("/api/maintenance", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "optimize-database", sessionId: currentSessionId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao otimizar banco.");
    renderMaintenanceStatus(data.status);
    maintenanceOutputEl.textContent += `\n\nOtimizacao
Historico SQL removido: ${data.removedSqlHistory}
Antes: ${formatBytes(data.beforeSize)}
Depois: ${formatBytes(data.afterSize)}
Recuperado: ${formatBytes(data.reclaimedBytes)}`;
  } catch (error) {
    maintenanceOutputEl.textContent = error.message;
  } finally {
    optimizeDatabaseEl.disabled = false;
  }
});

checkCapabilitiesEl.addEventListener("click", async () => {
  checkCapabilitiesEl.disabled = true;
  capabilitiesOutputEl.textContent = "Checando ferramentas disponiveis...";

  try {
    const response = await fetch("/api/capabilities");
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao checar capacidades.");
    renderCapabilities(data);
  } catch (error) {
    capabilitiesOutputEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
  } finally {
    checkCapabilitiesEl.disabled = false;
  }
});

checkPluginsEl.addEventListener("click", async () => {
  checkPluginsEl.disabled = true;
  capabilitiesOutputEl.textContent = "Carregando plugins da Aurora...";

  try {
    const response = await fetch("/api/plugins");
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao carregar plugins.");
    renderPlugins(data);
  } catch (error) {
    capabilitiesOutputEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
  } finally {
    checkPluginsEl.disabled = false;
  }
});

checkAiProvidersEl.addEventListener("click", async () => {
  checkAiProvidersEl.disabled = true;
  capabilitiesOutputEl.textContent = "Checando IAs conectadas...";

  try {
    const response = await fetch("/api/ai-providers");
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao carregar IAs.");
    renderAiProviders(data);
  } catch (error) {
    capabilitiesOutputEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
  } finally {
    checkAiProvidersEl.disabled = false;
  }
});

checkImageProvidersEl.addEventListener("click", async () => {
  checkImageProvidersEl.disabled = true;
  capabilitiesOutputEl.textContent = "Checando motores de imagem...";

  try {
    const response = await fetch("/api/image-providers");
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao carregar motores de imagem.");
    renderImageProviders(data);
  } catch (error) {
    capabilitiesOutputEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
  } finally {
    checkImageProvidersEl.disabled = false;
  }
});

checkToolRadarEl.addEventListener("click", async () => {
  checkToolRadarEl.disabled = true;
  capabilitiesOutputEl.textContent = "Analisando radar de devtools...";

  try {
    const response = await fetch("/api/tool-radar");
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao carregar radar.");
    renderToolRadar(data);
  } catch (error) {
    capabilitiesOutputEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
  } finally {
    checkToolRadarEl.disabled = false;
  }
});

checkRepositoryEngineeringEl.addEventListener("click", loadRepositoryEngineering);

createEngineeringTaskEl.addEventListener("click", async () => {
  const objective = engineeringTaskObjectiveEl.value.trim();
  if (!objective) {
    engineeringTaskListEl.innerHTML = "<p class=\"empty-text\">Descreva o objetivo da tarefa.</p>";
    return;
  }
  createEngineeringTaskEl.disabled = true;
  engineeringTaskListEl.innerHTML = "<p class=\"empty-text\">Criando tarefa local...</p>";

  try {
    const response = await fetch("/api/engineering-tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao criar tarefa.");
    engineeringTaskObjectiveEl.value = "";
    await loadEngineeringTasks();
  } catch (error) {
    engineeringTaskListEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
  } finally {
    createEngineeringTaskEl.disabled = false;
  }
});

reloadEngineeringTasksEl.addEventListener("click", loadEngineeringTasks);

engineeringTaskListEl.addEventListener("click", async (event) => {
  const runButton = event.target.closest("[data-run-engineering-task]");
  if (runButton) {
    runButton.disabled = true;
    try {
      const response = await fetch("/api/engineering-tasks/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: runButton.dataset.runEngineeringTask })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao executar tarefa.");
      await loadEngineeringTasks();
      await loadRepositoryEngineering();
    } catch (error) {
      engineeringTaskListEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
    }
    return;
  }

  const button = event.target.closest("[data-complete-engineering-task]");
  if (!button) return;
  button.disabled = true;
  try {
    const response = await fetch("/api/engineering-tasks", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: button.dataset.completeEngineeringTask,
        status: "done",
        result: "Concluida pela interface da Aurora."
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao concluir tarefa.");
    await loadEngineeringTasks();
  } catch (error) {
    engineeringTaskListEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
  }
});

runBenchmarkEl.addEventListener("click", async () => {
  runBenchmarkEl.disabled = true;
  benchmarkOutputEl.textContent = "Medindo progresso da Aurora...";

  try {
    const response = await fetch("/api/benchmark");
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao medir benchmark.");
    renderBenchmark(data);
  } catch (error) {
    benchmarkOutputEl.innerHTML = `<p class="empty-text">${escapeHtml(error.message)}</p>`;
  } finally {
    runBenchmarkEl.disabled = false;
  }
});

runDiagnosticsEl.addEventListener("click", async () => {
  toolOutputEl.textContent = "Rodando diagnostico...";
  const response = await fetch("/api/diagnostics");
  const data = await response.json();
  toolOutputEl.textContent = JSON.stringify(data.checks, null, 2);
});

runNodeCheckEl.addEventListener("click", async () => {
  toolOutputEl.textContent = "Rodando checagens...";
  const outputs = [];
  for (const commandId of ["node-check-server", "node-check-app"]) {
    const response = await fetch("/api/command", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ commandId })
    });
    outputs.push(await response.json());
  }
  toolOutputEl.textContent = JSON.stringify(outputs, null, 2);
});

runSqlEl.addEventListener("click", async () => {
  const sql = sqlInputEl.value.trim();
  await executeSql(sql);
});

explainSqlEl.addEventListener("click", async () => {
  try {
    const sql = buildExplainSql(sqlInputEl.value);
    await executeSql(sql, "Gerando plano da consulta...");
  } catch (error) {
    sqlOutputEl.textContent = error.message;
  }
});
analyzeSqlEl.addEventListener("click", analyzeSql);

loadSqlSchemaEl.addEventListener("click", loadSqlSchema);
loadSqlHistoryEl.addEventListener("click", loadSqlHistory);

sqlSchemaEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-sql-table]");
  if (!button) return;
  const tableName = button.dataset.sqlTable.replaceAll('"', '""');
  sqlInputEl.value = `SELECT * FROM "${tableName}" LIMIT 50;`;
  sqlInputEl.focus();
});

sqlHistoryEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-sql-query]");
  if (!button) return;
  sqlInputEl.value = button.dataset.sqlQuery;
  sqlInputEl.focus();
});

databaseDockerStatusEl.addEventListener("click", () => runDatabaseDockerAction("status"));
databaseDockerUpEl.addEventListener("click", () => runDatabaseDockerAction("up"));
databaseDockerDownEl.addEventListener("click", () => runDatabaseDockerAction("down"));

reloadChangesEl.addEventListener("click", loadChanges);
reloadActivityEl.addEventListener("click", loadActivityTimeline);
openChangesFromActivityEl.addEventListener("click", () => {
  openWorkspacePanel("Historico de alteracoes");
  loadChanges();
});

changeListEl.addEventListener("click", async (event) => {
  const restoreButton = event.target.closest("[data-restore-change-id]");
  if (restoreButton) {
    changeDetailsEl.textContent = "Restaurando backup...";
    const response = await fetch("/api/restore-change", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: restoreButton.dataset.restoreChangeId })
    });
    const data = await response.json();
    changeDetailsEl.textContent = response.ok
      ? `Restaurado ${data.path}\nBackup do estado anterior: ${data.backup}`
      : data.error || data.detail || "Erro ao restaurar.";
    await loadChanges();
    return;
  }

  const button = event.target.closest("[data-change-id]");
  if (!button) return;

  const response = await fetch(`/api/change-log?id=${encodeURIComponent(button.dataset.changeId)}`);
  const data = await response.json();
  changeDetailsEl.textContent = response.ok
    ? `${data.filePath}\nBackup: ${data.backupPath}\nMotivo: ${data.reason}\n\n${data.patch}`
    : data.error || "Erro ao carregar alteracao.";
});

proposeEditEl.addEventListener("click", async () => {
  const file = selectedFiles[0];
  const filePath = editPathEl.value.trim() || file?.path || "";
  const task = editTaskEl.value.trim();

  if (!filePath) {
    setEditPreview("Selecione um arquivo ou informe um caminho. Para projeto anexado, use attached-project/caminho/do/arquivo.");
    return;
  }

  if (!task) {
    setEditPreview("Descreva a edicao desejada.");
    return;
  }

  proposeEditEl.disabled = true;
  applyEditEl.disabled = true;
  setEditPreview("Gerando proposta...");

  try {
    const response = await fetch("/api/propose-edit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: modelEl.value,
        mode: modeEl.value,
        path: filePath,
        task
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao gerar proposta.");

    pendingEdit = data;
    editPathEl.value = data.path;
    proposalTextEl.value = data.proposed;
    setEditDiff(data.original, data.proposed);
    applyEditEl.disabled = false;
    previewPatchEl.disabled = false;
  } catch (error) {
    pendingEdit = null;
    setEditPreview(error.message);
  } finally {
    proposeEditEl.disabled = false;
  }
});

applyEditEl.addEventListener("click", async () => {
  if (!pendingEdit) return;

  const editedProposal = proposalTextEl.value;
  applyEditEl.disabled = true;
  setEditPreview("Aplicando proposta...");

  try {
    const response = await fetch("/api/apply-edit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        path: pendingEdit.path,
        proposed: editedProposal,
        reason: editTaskEl.value.trim() || "Aplicado pela interface da Aurora."
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao aplicar proposta.");

    setEditPreview(`Aplicado em ${data.path}\nBackup criado em ${data.backup}`);
    selectedFiles.splice(0, selectedFiles.length, {
      path: data.path,
      content: editedProposal,
      scope: data.scope
    });
    pendingEdit = null;
    proposalTextEl.value = "";
    previewPatchEl.disabled = true;
    await loadFiles();
    await loadChanges();
    await loadActivityTimeline();
    renderSelectedFiles();
  } catch (error) {
    setEditPreview(error.message);
    applyEditEl.disabled = false;
  }
});

runEditCycleEl.addEventListener("click", async () => {
  const file = selectedFiles[0];
  const filePath = editPathEl.value.trim() || file?.path || "";
  const task = editTaskEl.value.trim();

  if (!filePath) {
    setEditPreview("Selecione um arquivo ou informe um caminho para o ciclo seguro.");
    return;
  }

  if (!task) {
    setEditPreview("Descreva a edicao desejada para o ciclo seguro.");
    return;
  }

  runEditCycleEl.disabled = true;
  applyEditEl.disabled = true;
  setEditPreview("Executando ciclo seguro: editando, testando e preparando reparo se precisar...");

  try {
    const response = await fetch("/api/safe-edit-cycle", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: modelEl.value,
        mode: modeEl.value,
        path: filePath,
        task,
        commandIds: ["npm-run-check"],
        autoRepair: true
      })
    });
    const data = await response.json();
    const attempts = (data.attempts || []).map((attempt) => {
      const checks = (attempt.checks?.results || [])
        .map((result) => `${result.ok ? "OK" : "ERRO"} ${result.commandId}${result.error ? `: ${result.error}` : ""}`)
        .join("\n");
      return `Rodada ${attempt.round}\nArquivo: ${attempt.applied?.path || "-"}\nBackup: ${attempt.applied?.backup || "-"}\n${checks}`;
    }).join("\n\n");
    setEditPreview(`${data.message || data.error || "Ciclo concluido."}\n\n${attempts}`);
    if (!response.ok) throw new Error(data.detail || data.error || "Ciclo terminou com erro.");
    await loadChanges();
    await loadActivityTimeline();
    await loadFiles();
  } catch (error) {
    setEditPreview(`${editPreviewEl.textContent}\n\n${error.message}`);
  } finally {
    runEditCycleEl.disabled = false;
  }
});

proposalTextEl.addEventListener("input", () => {
  if (!pendingEdit) return;

  pendingEdit.proposed = proposalTextEl.value;
  setEditDiff(pendingEdit.original, pendingEdit.proposed);
});

previewPatchEl.addEventListener("click", async () => {
  if (!pendingEdit) return;
  const response = await fetch("/api/patch", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      path: pendingEdit.path,
      proposed: proposalTextEl.value
    })
  });
  const data = await response.json();
  setEditPreview(response.ok ? data.patch : data.error || "Falha ao gerar patch.");
});

createDocumentEl.addEventListener("click", async () => {
  const title = documentTitleEl.value.trim();
  const content = documentContentEl.value.trim();
  if (!title || !content) {
    documentOutputEl.textContent = "Preencha titulo e conteudo antes de criar.";
    return;
  }

  createDocumentEl.disabled = true;
  documentOutputEl.textContent = "Criando documento...";

  try {
    const response = await fetch("/api/create-document", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: documentTypeEl.value,
        title,
        content
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Falha ao criar documento.");
    documentOutputEl.textContent = `Documento criado: ${data.path}\nTamanho: ${data.size} bytes`;
    await loadFiles();
  } catch (error) {
    documentOutputEl.textContent = error.message;
  } finally {
    createDocumentEl.disabled = false;
  }
});

quickLaunchEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-panel]");
  if (!button) return;
  openWorkspacePanel(button.dataset.openPanel);
});

document.addEventListener("click", (event) => {
  const panelButton = event.target.closest("[data-open-panel]");
  if (panelButton && !quickLaunchEl.contains(panelButton)) {
    openWorkspacePanel(panelButton.dataset.openPanel);
    return;
  }

  const actionButton = event.target.closest("[data-action='new-chat']");
  if (actionButton) {
    newSessionEl.click();
    return;
  }

  const suggestionButton = event.target.closest("[data-prompt]");
  if (suggestionButton) {
    promptEl.value = suggestionButton.dataset.prompt || "";
    promptEl.focus();
  }
});

toggleWorkspaceEl.addEventListener("click", () => {
  setWorkspaceOpen(!document.body.classList.contains("workspace-open"));
});

closeWorkspaceEl.addEventListener("click", () => {
  setWorkspaceOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setWorkspaceOpen(false);
  }
});

await loadModels();
await loadModelRoutes();
renderMessages();
await loadSessions();
await loadChatHistory();
await loadPermissions();
await loadBehaviorSettings();
await loadChanges();
await loadActivityTimeline();
await loadMemory();
await loadKnowledge();
await loadResourceLibrary();
await loadMissions();
await loadEngineeringTasks();
await loadAttachedProject();
await loadProjectIndex();
await loadCodeMap();
await loadProjectProfile();
restoreWebPreviewSettings();
await loadFiles();
