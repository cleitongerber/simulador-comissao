const STORAGE_KEY = "commission-simulator-v2";
const ADMIN_PASSWORD_KEY = "commission-admin-password";
const ADMIN_SESSION_KEY = "commission-admin-session";
const DASHBOARD_SESSION_KEY = "commission-dashboard-session";
const OWNER_SESSION_KEY = "commission-owner-session";
const COLLAB_SESSION_KEY = "commission-collaborator-session";
const COLLAB_SESSION_META_KEY = `${COLLAB_SESSION_KEY}-meta`;
const BRANCH_SESSION_KEY = "commission-branch-session";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const pct = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
const num = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const num0 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const num1 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const CAMPAIGN_STATUS = {
  OPEN: "Aberta",
  OPERATIONAL_CLOSED: "Encerrada operacionalmente",
  ADMIN_CLOSING: "Em fechamento administrativo",
  OFFICIAL_CLOSED: "Fechada oficial",
};
const PARTIAL_STATUS = {
  DRAFT: "Rascunho",
  REVIEW: "Em conferencia",
  PUBLISHED: "Publicada",
  REPLACED: "Substituida",
  CANCELED: "Cancelada",
};
const CLOSING_STATUS = {
  NOT_STARTED: "Nao iniciado",
  REVIEW: "Em conferencia",
  READY: "Pronto para fechar",
  OFFICIAL_CLOSED: "Fechado oficialmente",
  AWAITING_EXTRACTS: "Fechado oficialmente - aguardando publicacao de extratos",
  PUBLISHED: "Publicado para vendedores",
};
const CLOSING_BASE = {
  LATEST_PARTIAL: "Ultima parcial publicada",
  FINAL_IMPORT: "Importacao final",
};
const PRIMARY_METRIC_GROUPS = ["Produtos", "Servicos Movel", "Servicos Residencial"];
const METRIC_GROUPS = [...PRIMARY_METRIC_GROUPS, "Informativo", "Sem bloco"];
const METRIC_TYPES = ["volume", "receita", "percentual", "informativo"];
const METRIC_FORMULA_TYPES = [
  { value: "unit100", label: "Quantidade x taxa x 100" },
  { value: "revenue", label: "Receita x taxa" },
  { value: "deviceRevenue", label: "Receita de aparelho" },
  { value: "deviceQty", label: "Quantidade de aparelho" },
];

function makeId() {
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function adminPassword() {
  return state?.settings?.adminPassword || localStorage.getItem(ADMIN_PASSWORD_KEY) || "admin123";
}

function isOwnerUnlocked() {
  return sessionStorage.getItem(OWNER_SESSION_KEY) === "ok";
}

function isAdminUnlocked() {
  return isOwnerUnlocked() || sessionStorage.getItem(ADMIN_SESSION_KEY) === "ok";
}

function isDashboardUnlocked() {
  return isAdminUnlocked() || sessionStorage.getItem(DASHBOARD_SESSION_KEY) === "ok";
}

function dashboardPassword() {
  return state?.settings?.dashboardPassword || "dashboard123";
}

function defaultSettings() {
  return { adminPassword: "admin123", dashboardPassword: "dashboard123", partnerName: "" };
}

const areaMetrics = {
  Cabo: [
    { id: "gross", name: "GROSS", unit: "R$", type: "revenue", goal: 2100 },
    { id: "banda", name: "BANDA LARGA", unit: "Qtd.", type: "unit100", goal: 12 },
    { id: "tv", name: "TV", unit: "Qtd.", type: "unit100", goal: 6 },
    { id: "combo", name: "COMBO", unit: "Qtd.", type: "unit100", goal: 12 },
    { id: "aparelhos_qtd", name: "APARELHOS QTDE", unit: "Qtd.", type: "deviceQty", goal: 10 },
    { id: "aparelhos_receita", name: "APARELHOS RECEITA", unit: "R$", type: "deviceRevenue", goal: 0 },
    { id: "seguros", name: "SEGUROS", unit: "Qtd.", type: "unit100", goal: 4 },
    { id: "peliculas", name: "PELICULAS", unit: "R$", type: "revenue", goal: 1350 },
    { id: "acessorios", name: "ACESSORIOS", unit: "R$", type: "revenue", goal: 1000 },
    { id: "delta", name: "DELTA", unit: "R$", type: "revenue", goal: 250 },
    { id: "fidel", name: "FIDEL APARELHO", unit: "R$", type: "revenue", goal: 750 },
  ],
  "Nao Cabo": [
    { id: "gross", name: "GROSS", unit: "R$", type: "revenue", goal: 2800 },
    { id: "tv", name: "TV", unit: "Qtd.", type: "unit100", goal: 4 },
    { id: "aparelhos_qtd", name: "APARELHOS QTDE", unit: "Qtd.", type: "deviceQty", goal: 16 },
    { id: "aparelhos_receita", name: "APARELHOS RECEITA", unit: "R$", type: "deviceRevenue", goal: 0 },
    { id: "seguros", name: "SEGUROS", unit: "Qtd.", type: "unit100", goal: 8 },
    { id: "peliculas", name: "PELICULAS", unit: "R$", type: "revenue", goal: 2160 },
    { id: "acessorios", name: "ACESSORIOS", unit: "R$", type: "revenue", goal: 1000 },
    { id: "delta", name: "DELTA", unit: "R$", type: "revenue", goal: 300 },
    { id: "fidel", name: "FIDEL APARELHO", unit: "R$", type: "revenue", goal: 1000 },
  ],
};

const defaultRules = {
  Cabo: {
    gross: [{ at: 1, rate: 0.12 }, { at: 0.9, rate: 0.08 }, { at: 0.8, rate: 0.06 }],
    banda: [{ at: 1.2, rate: 0.3 }, { at: 1, rate: 0.2 }, { at: 0.9, rate: 0.15 }, { at: 0.8, rate: 0.1 }],
    tv: [{ at: 1.2, rate: 0.35 }, { at: 1, rate: 0.25 }, { at: 0.9, rate: 0.2 }, { at: 0.8, rate: 0.15 }],
    combo: [{ at: 1, rate: 0.1 }, { at: 0.8, rate: 0.05 }],
    aparelhos_qtd: [{ at: 1.2, rate: 0.015 }, { at: 1, rate: 0.012 }, { at: 0.88, rate: 0.007 }, { at: 0.77, rate: 0.005 }],
    seguros: [{ at: 1, rate: 0.1 }, { at: 0.8, rate: 0.05 }],
    peliculas: [{ at: 1.2, rate: 0.16 }, { at: 1, rate: 0.12 }, { at: 0.9, rate: 0.1 }, { at: 0.8, rate: 0.08 }],
    acessorios: [{ at: 1.2, rate: 0.12 }, { at: 1, rate: 0.1 }, { at: 0.9, rate: 0.07 }, { at: 0.8, rate: 0.05 }],
    delta: [{ at: 1, rate: 0.2 }, { at: 0.9, rate: 0.15 }, { at: 0.8, rate: 0.1 }],
    fidel: [{ at: 1, rate: 0.1 }, { at: 0.9, rate: 0.075 }, { at: 0.8, rate: 0.05 }],
  },
  "Nao Cabo": {
    gross: [{ at: 1, rate: 0.12 }, { at: 0.9, rate: 0.08 }, { at: 0.8, rate: 0.06 }],
    tv: [{ at: 1, rate: 0.5 }, { at: 0.75, rate: 0.4 }, { at: 0.5, rate: 0.3 }, { at: 0.25, rate: 0.2 }],
    aparelhos_qtd: [{ at: 1.2, rate: 0.015 }, { at: 1, rate: 0.012 }, { at: 0.9, rate: 0.007 }, { at: 0.8, rate: 0.005 }],
    seguros: [{ at: 1, rate: 0.1 }, { at: 0.75, rate: 0.05 }],
    peliculas: [{ at: 1.2, rate: 0.16 }, { at: 1, rate: 0.12 }, { at: 0.9, rate: 0.1 }, { at: 0.8, rate: 0.08 }],
    acessorios: [{ at: 1.2, rate: 0.1 }, { at: 1, rate: 0.08 }, { at: 0.9, rate: 0.06 }, { at: 0.8, rate: 0.04 }],
    delta: [{ at: 1, rate: 0.2 }, { at: 0.9, rate: 0.15 }, { at: 0.8, rate: 0.1 }],
    fidel: [{ at: 1, rate: 0.1 }, { at: 0.9, rate: 0.075 }, { at: 0.8, rate: 0.05 }],
  },
};

const defaultDeflators = {
  Cabo: [
    { id: "def-cabo-gross", metricId: "gross", name: "GROSS minimo", min: 0.8, penaltyRate: 0.5 },
    { id: "def-cabo-tv", metricId: "tv", name: "TV minimo", min: 0.8, penaltyRate: 0.5 },
    { id: "def-cabo-bl", metricId: "banda", name: "BL minimo", min: 0.8, penaltyRate: 0.5 },
  ],
  "Nao Cabo": [
    { id: "def-nao-cabo-gross", metricId: "gross", name: "GROSS minimo", min: 0.8, penaltyRate: 0.5 },
    { id: "def-nao-cabo-tv", metricId: "tv", name: "TV minimo", min: 0.25, penaltyRate: 0.5 },
  ],
};
function seedState() {
  return {
    period: { month: "JUNHO", daysDone: 15, daysTotal: 26 },
    sellers: [
      { id: makeId(), name: "VENDEDOR", branch: "FILIAL", area: "Nao Cabo", adjustments: { quality: 0, insurance: 0, carousel: 0 }, password: "1234", emExperiencia: false, values: {} },
    ],
    rules: structuredClone(defaultRules),
    metricCatalog: normalizeMetricCatalog(),
    customMetrics: { Cabo: [], "Nao Cabo": [] },
    metricOrder: {
      Cabo: areaMetrics.Cabo.map((metric) => metric.id),
      "Nao Cabo": areaMetrics["Nao Cabo"].map((metric) => metric.id),
    },
    branches: ["FILIAL"],
    deflators: structuredClone(defaultDeflators),
    branchPasswords: { FILIAL: "1234" },
    settings: defaultSettings(),
    auditLogs: [],
    closings: [],
  };
}

var state = loadState();
let activeAreaFilter = "Todas";
let activeBranchFilter = "Todas";
let activeDashboardIndicator = "Todos";
let activeDashboardStatus = "Todos";
let activeDashboardDeflator = "Todos";
let activeDashboardPartialId = "latest";
let activeDashboardCompareBaseId = "";
let activeDashboardCompareTargetId = "";
let activeDashboardCompareBlock = "Todos";
let activeDashboardSellerDetailId = "";
let activeDashboardBranchDetail = "";
let activeCollaboratorId = sessionStorage.getItem(COLLAB_SESSION_KEY) || "";
let activeBranchSession = sessionStorage.getItem(BRANCH_SESSION_KEY) || "";
let activeManagerSellerId = "";
let activeManagerIndicator = "Todos";
let activeManagerPartialId = "latest";
let activeManagerCompareBaseId = "";
let activeManagerCompareTargetId = "";
let activeManagerCompareBlock = "Todos";
let activeManagerGraphicBlock = "Todos";
let activeCollaboratorPartialId = "latest";
let activeCollaboratorGraphicBlock = "Todos";
let activeCollaboratorSimulationDaysDone = sessionStorage.getItem("commission-collaborator-simulation-days-done") || "";
let activeCollaboratorTab = "resumo";
let activeAdminTab = "visao";
let pendingAccessView = "dashboard";
let activeAuditLogId = "";
let activeClosingSellerDetailId = "";
let lastAccessLogKey = "";
let confirmedCriticalEditKeys = new Set();
let pendingPartialImport = null;
let partialPreviewFilter = "Todos";
let showBranchPartialDetails = false;

function activeCampaign() {
  return state?.campaigns?.find((campaign) => campaign.id === state.activeCampaignId) || state?.campaigns?.[0] || null;
}

function campaignStatusLabel(campaign = activeCampaign()) {
  return campaign?.status || CAMPAIGN_STATUS.OPEN;
}

function isCampaignOfficialClosed(campaign = activeCampaign()) {
  const status = campaignStatusLabel(campaign);
  if ([CAMPAIGN_STATUS.OFFICIAL_CLOSED, CLOSING_STATUS.OFFICIAL_CLOSED, CLOSING_STATUS.AWAITING_EXTRACTS, CLOSING_STATUS.PUBLISHED, "Fechada oficialmente"].includes(status)) return true;
  if (campaign?.snapshot && (campaign.closedAt || campaign.officialCloseDate || campaign.officialFileCsv)) return true;
  return Boolean(campaign && Array.isArray(state?.closings) && state.closings.some((closing) => (
    closing?.campaignId === campaign.id && [CLOSING_STATUS.OFFICIAL_CLOSED, CLOSING_STATUS.AWAITING_EXTRACTS, CLOSING_STATUS.PUBLISHED].includes(normalizeClosingStatus(closing?.status))
  )));
}

function isCampaignOperationLocked(campaign = activeCampaign()) {
  return campaignStatusLabel(campaign) !== CAMPAIGN_STATUS.OPEN;
}

const REVERSIBLE_OPERATIONAL_CAMPAIGN_STATUSES = new Set([
  CAMPAIGN_STATUS.OPERATIONAL_CLOSED,
  CAMPAIGN_STATUS.ADMIN_CLOSING,
  "Congelada",
  "Encerrada operacionalmente",
  "Em fechamento administrativo",
]);

function canReopenOperationalCampaign(campaign = activeCampaign()) {
  if (!campaign || isCampaignOfficialClosed(campaign)) return false;
  const closing = officialClosingForCampaign(campaign);
  if (closingIsOfficial(closing) || closingExtractsPublished(closing)) return false;
  return REVERSIBLE_OPERATIONAL_CAMPAIGN_STATUSES.has(campaignStatusLabel(campaign));
}

function canEditCampaignData(campaign = activeCampaign()) {
  return !(isCampaignOfficialClosed(campaign) || officialClosingForCampaign(campaign)) || isOwnerUnlocked();
}

const ADMIN_ONLY_ACTIONS = new Set([
  "createCampaign",
  "updateCampaign",
  "deleteCampaign",
  "updateSeller",
  "deleteSeller",
  "updateBranch",
  "deleteBranch",
  "updateMetric",
  "updateRules",
  "updateDeflator",
  "updatePassword",
  "importGoals",
  "importPartial",
  "publishPartial",
  "cancelPartial",
  "replacePartial",
  "deletePartial",
  "exportBackup",
  "importBackup",
  "restoreBackup",
  "restoreDefault",
  "updateOfficialBusinessDays",
  "updateOfficialElapsedDays",
  "closeOperationalCampaign",
  "startOfficialClosing",
  "reopenOperationalCampaign",
  "closeOfficialCampaign",
  "exportClosing",
  "exportAudit",
  "adminMutation",
]);

function normalizedPermissionProfile(profile = currentAuditProfile()) {
  const value = String(profile || "").toLowerCase();
  if (value.includes("desenvolvedor") || value.includes("proprietario")) return "owner";
  if (value.includes("admin")) return "admin";
  if (value.includes("dashboard")) return "dashboard";
  if (value.includes("filial")) return "filial";
  if (value.includes("vendedor") || value.includes("colaborador")) return "colaborador";
  return "sistema";
}

function canAccessModule(profile, module) {
  const normalized = normalizedPermissionProfile(profile);
  const moduleKey = String(module || "").toLowerCase();
  if (normalized === "owner" || normalized === "admin") return true;
  if (moduleKey.includes("admin") || moduleKey.includes("seguranca") || moduleKey.includes("auditoria") || moduleKey.includes("backup")) return false;
  if (normalized === "dashboard") return moduleKey.includes("dashboard") || moduleKey.includes("home");
  if (normalized === "filial") return moduleKey.includes("filial") || moduleKey.includes("home");
  if (normalized === "colaborador") return moduleKey.includes("vendedor") || moduleKey.includes("colaborador") || moduleKey.includes("home");
  return moduleKey.includes("home");
}

function canPerformAction(profile, action) {
  const normalized = normalizedPermissionProfile(profile);
  if (normalized === "owner") return true;
  if (ADMIN_ONLY_ACTIONS.has(action)) return normalized === "admin";
  if (action === "updateSimulation") return normalized === "colaborador";
  if (action === "readDashboard") return ["admin", "dashboard", "owner"].includes(normalized);
  if (action === "readBranch") return ["admin", "filial", "owner"].includes(normalized);
  if (action === "readOwnPartial") return ["admin", "colaborador", "owner"].includes(normalized);
  return normalized === "admin";
}

function isReadOnlyProfile(profile = currentAuditProfile()) {
  return ["dashboard", "filial"].includes(normalizedPermissionProfile(profile));
}

function logBlockedAttempt(action, module = "Sistema", message = "Acesso bloqueado por permissao.", extra = {}) {
  logAccess({
    status: "Bloqueado",
    module,
    action,
    message,
    ...extra,
  }, { persist: true });
}

function requireAdminAction(action, module = "Admin", options = {}) {
  if (canPerformAction(currentAuditProfile(), action)) return true;
  const message = options.message || "Voce nao tem permissao para realizar esta acao.";
  logBlockedAttempt(options.auditAction || "Tentativa bloqueada", module, message, { itemName: options.itemName || "" });
  if (!options.silent) alert(message);
  return false;
}

function criticalConfirm(message, options = {}) {
  const lines = [message];
  if (options.backup) lines.push("", "Recomendamos exportar um backup antes de continuar.");
  if (options.irreversible) lines.push("", "Esta acao nao podera ser desfeita facilmente.");
  return confirm(lines.join("\n"));
}

function campaignHasPublishedPartial(campaign = activeCampaign()) {
  return Boolean(campaign && (campaign.partials || []).some((partial) => partial.status === PARTIAL_STATUS.PUBLISHED));
}

function criticalEditKey(target) {
  if (!target) return "";
  return [
    target.id || "",
    target.dataset?.sellerId || "",
    target.dataset?.sellerField || "",
    target.dataset?.adjustment || "",
    target.dataset?.closingAdjustment || "",
    target.dataset?.metricGoal || "",
    target.dataset?.metricRealized || "",
    target.dataset?.catalogMetricArea || "",
    target.dataset?.catalogMetricId || "",
    target.dataset?.catalogMetricField || "",
    target.dataset?.customMetricArea || "",
    target.dataset?.customMetricId || "",
    target.dataset?.customMetricField || "",
    target.dataset?.ruleAt || "",
    target.dataset?.ruleRate || "",
    target.dataset?.deflatorId || "",
    target.dataset?.deflatorField || "",
    target.dataset?.branchName || "",
    target.dataset?.campaignField || "",
  ].join(":");
}

function targetAffectsPublishedCampaign(target) {
  if (!campaignHasPublishedPartial()) return false;
  if (target?.dataset?.campaignField === "plannedBusinessDays") return false;
  return Boolean(target?.dataset?.metricGoal
    || target?.dataset?.metricRealized
    || target?.dataset?.catalogMetricField
    || target?.dataset?.customMetricField
    || target?.dataset?.ruleAt
    || target?.dataset?.ruleRate
    || target?.dataset?.deflatorField
    || target?.dataset?.adjustment
    || target?.dataset?.closingAdjustment
    || target?.dataset?.sellerField
    || target?.dataset?.sellerExperience
    || target?.dataset?.branchName
    || target?.dataset?.campaignField);
}

function confirmPublishedCampaignEdit(target) {
  if (!targetAffectsPublishedCampaign(target)) return true;
  const key = criticalEditKey(target);
  if (confirmedCriticalEditKeys.has(key)) return true;
  const accepted = criticalConfirm("Esta campanha ja possui parcial publicada. Alterar este dado oficial pode afetar novas visualizacoes da campanha aberta. Deseja continuar?", { backup: true });
  if (accepted) confirmedCriticalEditKeys.add(key);
  return accepted;
}

function syncActiveCampaignFromRoot(options = {}) {
  const campaign = activeCampaign();
  if (!campaign) return;
  if (isCampaignOfficialClosed(campaign) && !options.force) return;
  Object.assign(campaign, campaignPayloadFrom(state));
  campaign.reference = campaign.reference || state.period?.month || "";
  campaign.updatedAt = new Date().toISOString();
}

function normalizedIdentity(value) {
  return String(value || "").trim().toUpperCase();
}

function findMatchingSeller(previousSeller) {
  if (!previousSeller) return null;
  return state.sellers.find((seller) => seller.id === previousSeller.id)
    || state.sellers.find((seller) => (
      normalizedIdentity(seller.name) === normalizedIdentity(previousSeller.name)
      && normalizedIdentity(seller.branch) === normalizedIdentity(previousSeller.branch)
      && normalizedIdentity(seller.area) === normalizedIdentity(previousSeller.area)
      && String(seller.password || "1234") === String(previousSeller.password || "1234")
    ))
    || null;
}

function collaboratorSessionMeta(seller) {
  if (!seller) return null;
  return {
    id: seller.id,
    name: seller.name || "",
    branch: seller.branch || "",
    area: seller.area || "",
  };
}

function setCollaboratorSession(seller) {
  if (!seller) {
    clearCollaboratorSession();
    return;
  }
  activeCollaboratorId = seller.id;
  activeCollaboratorPartialId = "latest";
  sessionStorage.setItem(COLLAB_SESSION_KEY, seller.id);
  sessionStorage.setItem(COLLAB_SESSION_META_KEY, JSON.stringify(collaboratorSessionMeta(seller)));
}

function clearCollaboratorSession() {
  activeCollaboratorId = "";
  activeCollaboratorPartialId = "latest";
  sessionStorage.removeItem(COLLAB_SESSION_KEY);
  sessionStorage.removeItem(COLLAB_SESSION_META_KEY);
}

function storedCollaboratorSessionMeta() {
  try {
    return JSON.parse(sessionStorage.getItem(COLLAB_SESSION_META_KEY) || "null");
  } catch (error) {
    return null;
  }
}

function resolveAuthenticatedCollaborator() {
  if (!activeCollaboratorId) return null;
  const direct = state.sellers.find((seller) => seller.id === activeCollaboratorId);
  if (direct) {
    sessionStorage.setItem(COLLAB_SESSION_META_KEY, JSON.stringify(collaboratorSessionMeta(direct)));
    return direct;
  }
  const meta = storedCollaboratorSessionMeta();
  const matched = meta ? state.sellers.find((seller) => (
    normalizedIdentity(seller.name) === normalizedIdentity(meta.name)
    && normalizedIdentity(seller.branch) === normalizedIdentity(meta.branch)
    && normalizedIdentity(seller.area) === normalizedIdentity(meta.area)
  )) : null;
  if (matched) {
    setCollaboratorSession(matched);
    return matched;
  }
  clearCollaboratorSession();
  return null;
}

function setActiveCampaign(campaignId) {
  if (!state.campaigns?.some((campaign) => campaign.id === campaignId)) return;
  const previousCollaborator = state.sellers.find((seller) => seller.id === activeCollaboratorId) || null;
  const previousBranch = activeBranchSession;
  const previousManagerSeller = state.sellers.find((seller) => seller.id === activeManagerSellerId) || null;
  syncActiveCampaignFromRoot();
  state.activeCampaignId = campaignId;
  applyCampaignToState(state, activeCampaign());
  const matchingCollaborator = findMatchingSeller(previousCollaborator);
  if (matchingCollaborator) {
    setCollaboratorSession(matchingCollaborator);
  } else if (activeCollaboratorId) {
    clearCollaboratorSession();
  }
  const matchingBranch = previousBranch ? branches().find((branch) => normalizedIdentity(branch) === normalizedIdentity(previousBranch)) : "";
  if (matchingBranch) {
    activeBranchSession = matchingBranch;
    sessionStorage.setItem(BRANCH_SESSION_KEY, matchingBranch);
  } else if (activeBranchSession) {
    activeBranchSession = "";
    sessionStorage.removeItem(BRANCH_SESSION_KEY);
  }
  const matchingManagerSeller = findMatchingSeller(previousManagerSeller);
  activeManagerSellerId = matchingManagerSeller?.id || "";
  activeDashboardPartialId = "latest";
  activeManagerPartialId = "latest";
  activeCollaboratorPartialId = "latest";
  activeDashboardCompareBaseId = "";
  activeDashboardCompareTargetId = "";
  activeManagerCompareBaseId = "";
  activeManagerCompareTargetId = "";
  activeDashboardSellerDetailId = "";
  activeDashboardBranchDetail = "";
  showBranchPartialDetails = false;
  const campaign = activeCampaign();
  logAccess({
    status: "Sucesso",
    module: auditModuleName(document.body.dataset.view),
    action: "Selecionou campanha",
    campaignId: campaign?.id || campaignId,
    campaignName: campaign?.name || "",
    message: `${currentAuditProfile()} selecionou a campanha ${campaign?.name || campaignId}.`,
  });
  saveState("Campanha selecionada");
  renderAll();
}

const routeByView = {
  home: "/",
  dashboard: "/dashboard",
  admin: "/admin",
  gerente: "/filial",
  colaborador: "/colaborador",
};

const viewByRoute = {
  "/": "home",
  "/dashboard": "dashboard",
  "/admin": "admin",
  "/filial": "gerente",
  "/colaborador": "colaborador",
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("commission-simulator-v1");
  const fallback = seedState();
  fallback.settings = { ...defaultSettings(), ...(fallback.settings || {}) };
  if (!saved) return normalizeState(fallback);
  try {
    const parsed = normalizeState(JSON.parse(saved));
    return parsed;
  } catch {
    return normalizeState(fallback);
  }
}

function updateSaveStatus(message = "Salvo no banco") {
  const status = document.getElementById("saveStatus");
  if (!status) return;
  status.textContent = message;
  window.clearTimeout(updateSaveStatus.timer);
  updateSaveStatus.timer = window.setTimeout(() => {
    status.textContent = "Salvo no banco";
  }, 2200);
}

function sanitizeAuditValue(value, field = "") {
  if (/senha|password/i.test(field)) return value ? "Senha alterada" : "";
  if (value === undefined || value === null) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value).slice(0, 700);
    } catch {
      return "[valor nao disponivel]";
    }
  }
  return String(value).slice(0, 700);
}

function normalizeAuditLog(log) {
  if (!log || typeof log !== "object") return null;
  return {
    id: log.id || makeId(),
    timestamp: log.timestamp || log.date || new Date().toISOString(),
    type: log.type || "Atualizacao",
    status: log.status || "Sucesso",
    profile: log.profile || "",
    userId: log.userId || "",
    userName: log.userName || "",
    sellerName: log.sellerName || "",
    branchName: log.branchName || "",
    module: log.module || "",
    action: log.action || "",
    campaignId: log.campaignId || "",
    campaignName: log.campaignName || "",
    itemId: log.itemId || "",
    itemName: log.itemName || "",
    previousValue: sanitizeAuditValue(log.previousValue, log.action || log.itemName || ""),
    newValue: sanitizeAuditValue(log.newValue, log.action || log.itemName || ""),
    message: log.message || "",
    device: log.device || "",
  };
}

function normalizeAuditLogs(source) {
  return Array.isArray(source) ? source.map(normalizeAuditLog).filter(Boolean) : [];
}

function auditCampaignInfo(campaign = activeCampaign()) {
  return {
    campaignId: campaign?.id || "",
    campaignName: campaign?.name || campaign?.reference || "",
  };
}

function currentAuditProfile() {
  if (isOwnerUnlocked()) return "Desenvolvedor/Proprietario";
  if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "ok") return "Admin";
  if (sessionStorage.getItem(DASHBOARD_SESSION_KEY) === "ok") return "Dashboard";
  if (activeBranchSession) return "Filial";
  if (activeCollaboratorId) return "Vendedor";
  return "Sistema";
}

function currentAuditUser() {
  const seller = state?.sellers?.find((item) => item.id === activeCollaboratorId);
  if (seller) return { userId: seller.id, userName: seller.name, sellerName: seller.name, branchName: seller.branch };
  if (activeBranchSession) return { userName: activeBranchSession, branchName: activeBranchSession };
  return {};
}

function addAuditLog(entry, options = {}) {
  try {
    state.auditLogs = normalizeAuditLogs(state.auditLogs);
    const field = entry.field || entry.action || entry.itemName || "";
    const log = normalizeAuditLog({
      id: makeId(),
      timestamp: new Date().toISOString(),
      type: entry.type || "Atualizacao",
      status: entry.status || "Sucesso",
      profile: entry.profile || currentAuditProfile(),
      ...auditCampaignInfo(),
      ...currentAuditUser(),
      ...entry,
      previousValue: sanitizeAuditValue(entry.previousValue, field),
      newValue: sanitizeAuditValue(entry.newValue, field),
      device: navigator?.userAgent || "",
    });
    state.auditLogs.push(log);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (options.persist) {
      window.clearTimeout(cloudSaveTimer);
      cloudSaveTimer = window.setTimeout(() => saveStateToCloud("Log registrado"), 350);
    }
  } catch (error) {
    console.error("Falha ao registrar log", error);
  }
}

function logAccess(entry, options = {}) {
  addAuditLog({ type: "Acesso", ...entry }, options);
}

function logUpdate(entry, options = {}) {
  addAuditLog({ type: "Atualizacao", ...entry }, options);
}

function auditModuleName(view) {
  return { home: "Home", dashboard: "Dashboard", admin: "Admin", gerente: "Filial", colaborador: "Vendedor" }[view] || view || "";
}

function auditText(value) {
  return String(value || "").toLowerCase();
}

function auditLogDate(log) {
  return String(log.timestamp || "").slice(0, 10);
}

function auditLogDisplayDate(log) {
  const date = new Date(log.timestamp);
  return Number.isNaN(date.getTime()) ? "-" : dateTime.format(date);
}

function auditLogMatchesFilters(log, filters) {
  const date = auditLogDate(log);
  if (filters.start && date && date < filters.start) return false;
  if (filters.end && date && date > filters.end) return false;
  if (filters.type && log.type !== filters.type) return false;
  if (filters.profile && log.profile !== filters.profile) return false;
  if (filters.module && log.module !== filters.module) return false;
  if (filters.status && log.status !== filters.status) return false;
  if (filters.campaign && log.campaignId !== filters.campaign && log.campaignName !== filters.campaign) return false;
  if (filters.search) {
    const haystack = [
      log.profile, log.userName, log.sellerName, log.branchName, log.module,
      log.action, log.campaignName, log.itemName, log.message,
    ].map(auditText).join(" ");
    if (!haystack.includes(auditText(filters.search))) return false;
  }
  return true;
}

function auditFiltersFromDom() {
  return {
    start: document.getElementById("auditStartDate")?.value || "",
    end: document.getElementById("auditEndDate")?.value || "",
    type: document.getElementById("auditTypeFilter")?.value || "",
    profile: document.getElementById("auditProfileFilter")?.value || "",
    module: document.getElementById("auditModuleFilter")?.value || "",
    campaign: document.getElementById("auditCampaignFilter")?.value || "",
    status: document.getElementById("auditStatusFilter")?.value || "",
    search: document.getElementById("auditSearch")?.value || "",
  };
}

function filteredAuditLogs() {
  const filters = auditFiltersFromDom();
  return normalizeAuditLogs(state.auditLogs)
    .filter((log) => auditLogMatchesFilters(log, filters))
    .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
}

function normalizeCustomMetrics(source) {
  return {
    Cabo: Array.isArray(source?.Cabo) ? source.Cabo.map(normalizeCustomMetric) : [],
    "Nao Cabo": Array.isArray(source?.["Nao Cabo"]) ? source["Nao Cabo"].map(normalizeCustomMetric) : [],
  };
}

function normalizeCustomMetric(metric) {
  return normalizeMetricDefinition(metric, {
    id: metric?.id || `custom_${makeId()}`,
    name: metric?.name || "NOVA META",
    unit: metric?.unit || "Qtd.",
    type: metric?.type || "unit100",
    goal: Number(metric?.goal) || 0,
    sortOrder: Number(metric?.sortOrder) || 0,
  });
}

function normalizeMetricDefinition(metric, fallback = {}) {
  const merged = { ...(fallback || {}), ...(metric || {}) };
  const base = {
    id: merged.id || fallback.id || `custom_${makeId()}`,
    name: String(merged.name || fallback.name || "NOVA META").trim() || "NOVA META",
    unit: String(merged.unit || fallback.unit || "Qtd.").trim() || "Qtd.",
    type: merged.type || fallback.type || "unit100",
    goal: Number(merged.goal ?? fallback.goal) || 0,
    sortOrder: Number(merged.sortOrder ?? fallback.sortOrder) || 0,
    active: merged.active !== false,
    importKey: String(merged.importKey || fallback.importKey || fallback.id || merged.id || merged.name || "").trim(),
    observation: String(merged.observation || merged.notes || fallback.observation || "").trim(),
  };
  const inferred = metricClassification(base);
  return {
    ...base,
    groupMeta: METRIC_GROUPS.includes(merged.groupMeta) ? merged.groupMeta : inferred.groupMeta,
    tipoIndicador: METRIC_TYPES.includes(merged.tipoIndicador) ? merged.tipoIndicador : inferred.tipoIndicador,
    participaAtingimento: typeof merged.participaAtingimento === "boolean" ? merged.participaAtingimento : inferred.participaAtingimento,
  };
}

function normalizeMetricCatalog(source) {
  const normalized = { Cabo: {}, "Nao Cabo": {} };
  for (const area of ["Cabo", "Nao Cabo"]) {
    const current = source?.[area];
    const entries = Array.isArray(current)
      ? current.map((item) => [item?.id, item])
      : Object.entries(current && typeof current === "object" ? current : {});
    for (const [id, config] of entries) {
      if (!id) continue;
      const fallback = areaMetrics[area]?.find((metric) => metric.id === id) || { id };
      normalized[area][id] = normalizeMetricDefinition({ id, ...(config || {}) }, fallback);
    }
  }
  return normalized;
}

function normalizePartialItem(item) {
  return {
    id: item?.id || makeId(),
    lineNumber: Number(item?.lineNumber) || 0,
    sellerName: String(item?.sellerName || "").trim(),
    sellerId: item?.sellerId || "",
    branch: String(item?.branch || "").trim(),
    branchId: item?.branchId || "",
    area: normalizeAreaName(item?.area || "Nao Cabo"),
    metricName: String(item?.metricName || "").trim(),
    metricId: item?.metricId || "",
    realized: Number(item?.realized) || 0,
    status: item?.status || "OK",
    message: item?.message || "",
  };
}

function normalizePartials(source) {
  return Array.isArray(source) ? source.map((partial, index) => {
    const period = normalizePartialPeriodData(partial);
    return {
      id: partial?.id || makeId(),
      campaignId: partial?.campaignId || "",
      campaignName: partial?.campaignName || "",
      number: Number(partial?.number) || index + 1,
      name: partial?.name || `Parcial ${String(Number(partial?.number) || index + 1).padStart(2, "0")}`,
      baseDate: partial?.baseDate || "",
      daysDone: period.daysDone,
      daysTotal: period.daysTotal,
      period,
      importedAt: partial?.importedAt || new Date().toISOString(),
      publishedAt: partial?.publishedAt || "",
      responsible: partial?.responsible || "Admin",
      status: Object.values(PARTIAL_STATUS).includes(partial?.status) ? partial.status : PARTIAL_STATUS.DRAFT,
      totalRows: Number(partial?.totalRows) || 0,
      validRows: Number(partial?.validRows) || 0,
      warningRows: Number(partial?.warningRows) || 0,
      errorRows: Number(partial?.errorRows) || 0,
      summary: partial?.summary || {},
      items: Array.isArray(partial?.items) ? partial.items.map(normalizePartialItem) : [],
    };
  }) : [];
}

function normalizeClosingStatus(status) {
  if (Object.values(CLOSING_STATUS).includes(status)) return status;
  if (status === CAMPAIGN_STATUS.OFFICIAL_CLOSED || status === "Fechada oficial") return CLOSING_STATUS.AWAITING_EXTRACTS;
  if (status === CAMPAIGN_STATUS.ADMIN_CLOSING) return CLOSING_STATUS.REVIEW;
  return status || CLOSING_STATUS.NOT_STARTED;
}

function normalizeClosingTotals(source = {}) {
  return {
    totalSellers: Number(source.totalSellers) || 0,
    totalBranches: Number(source.totalBranches) || 0,
    totalGoal: Number(source.totalGoal) || 0,
    totalRealized: Number(source.totalRealized) || 0,
    totalProjected: Number(source.totalProjected) || 0,
    currentPercent: Number.isFinite(Number(source.currentPercent)) ? Number(source.currentPercent) : null,
    projectedPercent: Number.isFinite(Number(source.projectedPercent)) ? Number(source.projectedPercent) : null,
    commissionGrossTotal: Number(source.commissionGrossTotal) || 0,
    deflatorTotal: Number(source.deflatorTotal) || 0,
    estornosTotal: Number(source.estornosTotal) || 0,
    commissionFinalTotal: Number(source.commissionFinalTotal) || 0,
    riskSellers: Number(source.riskSellers) || 0,
    highlightSellers: Number(source.highlightSellers) || 0,
    riskBranches: Number(source.riskBranches) || 0,
  };
}

function normalizeClosing(closing, fallback = {}) {
  const snapshot = closing?.snapshot || fallback.snapshot || null;
  const campaignId = closing?.campaignId || snapshot?.campaignId || fallback.campaignId || "";
  const status = normalizeClosingStatus(closing?.status || snapshot?.status || fallback.status);
  const createdAt = closing?.createdAt || snapshot?.createdAt || snapshot?.closedAt || new Date().toISOString();
  return {
    id: closing?.id || fallback.id || (campaignId ? `closing-${campaignId}` : makeId()),
    campaignId,
    campaignName: closing?.campaignName || snapshot?.campaignName || fallback.campaignName || "Campanha",
    reference: closing?.reference || snapshot?.reference || fallback.reference || "",
    status,
    baseType: closing?.baseType || snapshot?.baseType || fallback.baseType || CLOSING_BASE.LATEST_PARTIAL,
    basePartialId: closing?.basePartialId || snapshot?.basePartialId || fallback.basePartialId || "",
    basePartialNumber: Number(closing?.basePartialNumber ?? snapshot?.basePartialNumber ?? fallback.basePartialNumber) || 0,
    basePartialName: closing?.basePartialName || snapshot?.basePartialName || fallback.basePartialName || "",
    baseDate: closing?.baseDate || snapshot?.baseDate || fallback.baseDate || "",
    createdAt,
    createdBy: closing?.createdBy || snapshot?.createdBy || fallback.createdBy || "Admin",
    closedAt: closing?.closedAt || snapshot?.closedAt || fallback.closedAt || "",
    closedBy: closing?.closedBy || snapshot?.closedBy || fallback.closedBy || "",
    publishedAt: closing?.publishedAt || "",
    publishedBy: closing?.publishedBy || "",
    totals: normalizeClosingTotals(closing?.totals || snapshot || {}),
    sellerResults: Array.isArray(closing?.sellerResults) ? cloneData(closing.sellerResults) : cloneData(snapshot?.sellers || []),
    indicatorResults: Array.isArray(closing?.indicatorResults) ? cloneData(closing.indicatorResults) : cloneData(snapshot?.indicators || []),
    deflators: cloneData(closing?.deflators || snapshot?.deflators || []),
    estornos: cloneData(closing?.estornos || snapshot?.estornos || []),
    commissionGrossTotal: Number(closing?.commissionGrossTotal ?? snapshot?.commissionGrossTotal) || 0,
    deflatorTotal: Number(closing?.deflatorTotal ?? snapshot?.deflatorTotal) || 0,
    estornosTotal: Number(closing?.estornosTotal ?? snapshot?.estornosTotal) || 0,
    commissionFinalTotal: Number(closing?.commissionFinalTotal ?? snapshot?.commissionFinalTotal) || 0,
    snapshot: snapshot ? cloneData(snapshot) : null,
  };
}

function normalizeClosings(source) {
  return Array.isArray(source) ? source.map((closing) => normalizeClosing(closing)).filter(Boolean) : [];
}

function migrateCampaignSnapshotsToClosings(candidate) {
  candidate.closings = normalizeClosings(candidate.closings);
  for (const campaign of candidate.campaigns || []) {
    if (!campaign?.snapshot) continue;
    const exists = candidate.closings.some((closing) => closing.campaignId === campaign.id && closing.snapshot);
    if (exists) continue;
    candidate.closings.push(normalizeClosing({
      id: `closing-${campaign.id}`,
      campaignId: campaign.id,
      campaignName: campaign.name,
      reference: campaign.reference || campaign.period?.month || "",
      status: CLOSING_STATUS.AWAITING_EXTRACTS,
      closedAt: campaign.closedAt || campaign.snapshot.closedAt || "",
      closedBy: campaign.snapshot.closedBy || "Admin",
      snapshot: campaign.snapshot,
    }));
  }
}

function metricIdsForArea(area, customMetrics = state?.customMetrics) {
  return [
    ...(areaMetrics[area] || []).map((metric) => metric.id),
    ...((customMetrics?.[area] || []).map((metric) => metric.id)),
  ];
}

function normalizeMetricOrder(source, customMetrics = source?.customMetrics) {
  const normalized = {};
  for (const area of ["Cabo", "Nao Cabo"]) {
    const validIds = metricIdsForArea(area, customMetrics);
    const savedOrder = Array.isArray(source?.metricOrder?.[area]) ? source.metricOrder[area] : [];
    const ordered = savedOrder.filter((id, index, list) => validIds.includes(id) && list.indexOf(id) === index);
    normalized[area] = [...ordered, ...validIds.filter((id) => !ordered.includes(id))];
  }
  return normalized;
}

function ensureMetricOrder(area) {
  state.metricOrder = normalizeMetricOrder(state, state.customMetrics);
  state.metricOrder[area] = normalizeMetricOrder(state, state.customMetrics)[area];
  return state.metricOrder[area];
}

function metricOrderIndex(area, metricId, sourceState = state) {
  const order = normalizeMetricOrder(sourceState, sourceState?.customMetrics)[area] || [];
  const index = order.indexOf(metricId);
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

function canReorderMetrics() {
  const status = campaignStatusLabel();
  if (status === CAMPAIGN_STATUS.OFFICIAL_CLOSED) return false;
  if (status === CAMPAIGN_STATUS.OPEN) return isAdminUnlocked();
  return isOwnerUnlocked();
}

function metricOrderLockMessage() {
  const status = campaignStatusLabel();
  if (status === CAMPAIGN_STATUS.OFFICIAL_CLOSED) return "Campanha fechada oficialmente. A ordem das metas está congelada.";
  if (status !== CAMPAIGN_STATUS.OPEN && !isOwnerUnlocked()) return "Esta campanha está encerrada e não permite alteração na ordem das metas.";
  return "";
}

function moveMetricOrder(area, metricId, direction) {
  if (!canReorderMetrics()) {
    alert(metricOrderLockMessage() || "Apenas Admin pode alterar a ordem das metas.");
    return;
  }
  const order = ensureMetricOrder(area);
  const index = order.indexOf(metricId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= order.length) return;
  const metric = metricsFor(area, state, { includeInactive: true }).find((item) => item.id === metricId);
  [order[index], order[target]] = [order[target], order[index]];
  state.metricOrder[area] = order;
  syncCustomMetricSortOrder(area);
  logUpdate({
    action: "Reordenou metas",
    module: "Metas",
    itemId: metricId,
    itemName: metric?.name || metricId,
    previousValue: `Posicao ${index + 1}`,
    newValue: `Posicao ${target + 1}`,
    message: `Meta ${metric?.name || metricId} movida na area ${area}.`,
  });
  saveState("Ordem das metas atualizada com sucesso.");
  renderAll();
}

function syncCustomMetricSortOrder(area) {
  const order = ensureMetricOrder(area);
  for (const metric of state.customMetrics?.[area] || []) {
    const index = order.indexOf(metric.id);
    metric.sortOrder = index >= 0 ? index + 1 : order.length + 1;
  }
}

function normalizeDeflators(source) {
  const normalized = structuredClone(defaultDeflators);
  for (const area of ["Cabo", "Nao Cabo"]) {
    const current = source?.[area];
    if (Array.isArray(current)) {
      normalized[area] = current.map((item) => ({
        id: item.id || makeId(),
        metricId: item.metricId || "gross",
        name: item.name || "Deflator",
        min: Number(item.min ?? item.grossMin ?? 0) || 0,
        penaltyRate: Number(item.penaltyRate) || 0,
      }));
    } else if (current && typeof current === "object") {
      normalized[area] = [
        { id: `legacy-${area}-gross`, metricId: "gross", name: "GROSS minimo", min: Number(current.grossMin) || 0, penaltyRate: Number(current.penaltyRate) || 0 },
        { id: `legacy-${area}-tv`, metricId: "tv", name: "TV minimo", min: Number(current.tvMin) || 0, penaltyRate: Number(current.penaltyRate) || 0 },
      ];
    }
  }
  if (!normalized.Cabo.some((item) => item.metricId === "banda")) {
    normalized.Cabo.push({ id: "def-cabo-bl", metricId: "banda", name: "BL minimo", min: 0.8, penaltyRate: 0.5 });
  }
  return normalized;
}

function normalizeBranches(branches, sellers = []) {
  const values = Array.isArray(branches) ? branches : [];
  const fromSellers = sellers.map((seller) => seller.branch || "Sem filial");
  return [...new Set([...values, ...fromSellers].map((branch) => String(branch || "").trim()).filter(Boolean))];
}
function normalizeBranchPasswords(source, legacyAccess, managers, branchesList) {
  const passwords = source && typeof source === "object" && !Array.isArray(source) ? { ...source } : {};
  if (legacyAccess && typeof legacyAccess === "object" && !Array.isArray(legacyAccess)) {
    for (const [branch, password] of Object.entries(legacyAccess)) if (!passwords[branch]) passwords[branch] = password || "1234";
  }
  if (Array.isArray(managers)) {
    for (const manager of managers) if (manager.branch && !passwords[manager.branch]) passwords[manager.branch] = manager.password || "1234";
  }
  for (const branch of branchesList || []) if (!passwords[branch]) passwords[branch] = "1234";
  return passwords;
}
function branchesFromSellers(sellers = state?.sellers || []) {
  return [...new Set(sellers.map((seller) => seller.branch || "Sem filial"))].sort();
}

function cloneData(value) {
  return structuredClone(value ?? null);
}

function campaignPayloadFrom(source, options = {}) {
  const plannedBusinessDays = positiveInteger(source.plannedBusinessDays, positiveInteger(source.period?.daysTotal, 1));
  const payload = {
    plannedBusinessDays,
    period: cloneData(source.period || { month: "JUNHO", daysDone: 0, daysTotal: plannedBusinessDays }),
    sellers: cloneData(source.sellers || []),
    rules: cloneData(source.rules || defaultRules),
    metricCatalog: normalizeMetricCatalog(source.metricCatalog),
    customMetrics: normalizeCustomMetrics(source.customMetrics),
    metricOrder: normalizeMetricOrder(source, normalizeCustomMetrics(source.customMetrics)),
    branches: cloneData(source.branches || []),
    deflators: normalizeDeflators(source.deflators),
    branchPasswords: cloneData(source.branchPasswords || {}),
  };
  payload.branches = normalizeBranches(payload.branches, payload.sellers);
  payload.branchPasswords = normalizeBranchPasswords(payload.branchPasswords, source.managerAccess, source._legacyManagers, payload.branches);
  payload.period.daysTotal = plannedBusinessDays;
  if (options.resetOperational) {
    payload.period.daysDone = 0;
    for (const seller of payload.sellers) {
      seller.adjustments = { quality: 0, insurance: 0, carousel: 0 };
      for (const value of Object.values(seller.values || {})) value.realized = 0;
    }
  }
  return payload;
}

function emptyCampaignSource(reference = "Novo periodo") {
  const plannedBusinessDays = positiveInteger(state?.period?.daysTotal, 1);
  return {
    plannedBusinessDays,
    period: { month: reference, daysDone: 0, daysTotal: plannedBusinessDays },
    sellers: [],
    rules: structuredClone(defaultRules),
    metricCatalog: normalizeMetricCatalog(),
    customMetrics: { Cabo: [], "Nao Cabo": [] },
    metricOrder: {
      Cabo: areaMetrics.Cabo.map((metric) => metric.id),
      "Nao Cabo": areaMetrics["Nao Cabo"].map((metric) => metric.id),
    },
    branches: [],
    deflators: structuredClone(defaultDeflators),
    branchPasswords: {},
  };
}

function createCampaignFromSource(source, overrides = {}) {
  const now = new Date().toISOString();
  const payload = campaignPayloadFrom(source, { resetOperational: overrides.resetOperational });
  return {
    id: overrides.id || makeId(),
    name: overrides.name || source.name || "Campanha Atual",
    reference: overrides.reference || payload.period.month || "Mes atual",
    startDate: overrides.startDate || "",
    operationalCloseDate: overrides.operationalCloseDate || "",
    officialCloseDate: overrides.officialCloseDate || "",
    status: overrides.status || CAMPAIGN_STATUS.OPEN,
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    closedAt: overrides.closedAt || "",
    officialFileName: overrides.officialFileName || "",
    officialFileCsv: overrides.officialFileCsv || "",
    snapshot: overrides.snapshot || null,
    partials: normalizePartials(overrides.partials || []),
    ...payload,
  };
}

function normalizeCampaign(campaign, fallback) {
  const base = createCampaignFromSource(fallback, {
    id: campaign?.id || makeId(),
    name: campaign?.name || "Campanha Atual",
    reference: campaign?.reference || campaign?.period?.month || fallback.period?.month || "Mes atual",
    status: campaign?.status || CAMPAIGN_STATUS.OPEN,
    createdAt: campaign?.createdAt,
    updatedAt: campaign?.updatedAt,
    closedAt: campaign?.closedAt,
    officialFileName: campaign?.officialFileName,
    officialFileCsv: campaign?.officialFileCsv,
    snapshot: campaign?.snapshot || null,
  });
  const normalized = { ...base, ...(campaign || {}) };
  normalized.period = normalized.period || fallback.period || { month: "JUNHO", daysDone: 1, daysTotal: 1 };
  normalized.plannedBusinessDays = positiveInteger(normalized.plannedBusinessDays, positiveInteger(normalized.period?.daysTotal, 1));
  normalized.period.daysTotal = normalized.plannedBusinessDays;
  normalized.sellers = Array.isArray(normalized.sellers) ? normalized.sellers : cloneData(fallback.sellers || []);
  normalized.rules = normalized.rules || cloneData(fallback.rules || defaultRules);
  normalized.metricCatalog = normalizeMetricCatalog(normalized.metricCatalog);
  normalized.customMetrics = normalizeCustomMetrics(normalized.customMetrics);
  normalized.metricOrder = normalizeMetricOrder(normalized, normalized.customMetrics);
  normalized.deflators = normalizeDeflators(normalized.deflators);
  normalized.branches = normalizeBranches(normalized.branches, normalized.sellers);
  normalized.branchPasswords = normalizeBranchPasswords(normalized.branchPasswords, normalized.managerAccess, normalized._legacyManagers, normalized.branches);
  normalized.partials = normalizePartials(normalized.partials);
  for (const area of ["Cabo", "Nao Cabo"]) {
    normalized.rules[area] = normalized.rules[area] || {};
    for (const metric of metricsFor(area, normalized)) normalized.rules[area][metric.id] = normalized.rules[area][metric.id] || [];
  }
  for (const seller of normalized.sellers) {
    seller.emExperiencia = seller.emExperiencia === true;
    ensureSellerValues(seller, normalized);
  }
  return normalized;
}

function normalizeCampaigns(candidate) {
  const existing = Array.isArray(candidate.campaigns) ? candidate.campaigns : [];
  const campaigns = existing.length
    ? existing.map((campaign) => normalizeCampaign(campaign, candidate))
    : [createCampaignFromSource(candidate, { name: "Campanha Atual", reference: candidate.period?.month || "Mes atual" })];
  return campaigns;
}

function applyCampaignToState(target, campaign) {
  if (!campaign) return;
  campaign.plannedBusinessDays = positiveInteger(campaign.plannedBusinessDays, positiveInteger(campaign.period?.daysTotal, 1));
  campaign.period = { ...(campaign.period || {}), daysTotal: campaign.plannedBusinessDays };
  target.period = cloneData(campaign.period);
  target.sellers = cloneData(campaign.sellers);
  target.rules = cloneData(campaign.rules);
  target.metricCatalog = normalizeMetricCatalog(campaign.metricCatalog);
  target.customMetrics = normalizeCustomMetrics(campaign.customMetrics);
  target.metricOrder = normalizeMetricOrder(campaign, target.customMetrics);
  target.branches = normalizeBranches(cloneData(campaign.branches), target.sellers);
  target.deflators = normalizeDeflators(campaign.deflators);
  target.branchPasswords = normalizeBranchPasswords(campaign.branchPasswords, campaign.managerAccess, campaign._legacyManagers, target.branches);
}

function normalizeState(candidate) {
  if (!candidate || typeof candidate !== "object" || !Array.isArray(candidate.sellers)) {
    throw new Error("Arquivo de backup invalido.");
  }
  candidate.period = candidate.period || { month: "JUNHO", daysDone: 1, daysTotal: 1 };
  candidate.settings = { ...defaultSettings(), ...(candidate.settings || {}) };
  candidate.rules = candidate.rules || structuredClone(defaultRules);
  candidate.metricCatalog = normalizeMetricCatalog(candidate.metricCatalog);
  candidate.customMetrics = normalizeCustomMetrics(candidate.customMetrics);
  candidate.metricOrder = normalizeMetricOrder(candidate, candidate.customMetrics);
  candidate.deflators = normalizeDeflators(candidate.deflators);
  candidate.branches = normalizeBranches(candidate.branches, candidate.sellers);
  candidate.branchPasswords = normalizeBranchPasswords(candidate.branchPasswords, candidate.managerAccess, candidate._legacyManagers, candidate.branches);
  candidate.auditLogs = normalizeAuditLogs(candidate.auditLogs);
  candidate.campaigns = normalizeCampaigns(candidate);
  candidate.closings = normalizeClosings(candidate.closings);
  migrateCampaignSnapshotsToClosings(candidate);
  if (!candidate.campaigns.some((campaign) => campaign.id === candidate.activeCampaignId)) {
    candidate.activeCampaignId = candidate.campaigns.find((campaign) => campaign.status === CAMPAIGN_STATUS.OPEN)?.id || candidate.campaigns[0]?.id;
  }
  applyCampaignToState(candidate, candidate.campaigns.find((campaign) => campaign.id === candidate.activeCampaignId));
  for (const area of ["Cabo", "Nao Cabo"]) {
    candidate.rules[area] = candidate.rules[area] || {};
    for (const metric of metricsFor(area, candidate)) candidate.rules[area][metric.id] = candidate.rules[area][metric.id] || [];
  }
  for (const seller of candidate.sellers) {
    seller.emExperiencia = seller.emExperiencia === true;
    ensureSellerValues(seller, candidate);
  }
  return candidate;
}
let cloudSaveTimer = 0;

async function loadStateFromCloud() {
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (!response.ok) throw new Error("Falha ao carregar banco.");
    state = normalizeState(await response.json());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateSaveStatus("Dados carregados do banco");
    renderAll();
    openRouteView({ skipHistory: true });
  } catch (error) {
    console.error(error);
    updateSaveStatus("Modo offline: salvando local");
  }
}

async function saveStateToCloud(message) {
  try {
    const response = await fetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    if (!response.ok) throw new Error("Falha ao salvar banco.");
    updateSaveStatus(message);
  } catch (error) {
    console.error(error);
    updateSaveStatus("Offline: salvo neste navegador");
  }
}

function saveState(message = "Salvo no banco") {
  syncActiveCampaignFromRoot();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateSaveStatus("Salvando...");
  window.clearTimeout(cloudSaveTimer);
  cloudSaveTimer = window.setTimeout(() => saveStateToCloud(message), 350);
}

function flushSaveState(message = "Salvo no banco") {
  syncActiveCampaignFromRoot();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateSaveStatus("Salvando...");
  window.clearTimeout(cloudSaveTimer);
  return saveStateToCloud(message);
}

function metricsFor(area, sourceState = state, options = {}) {
  const catalog = normalizeMetricCatalog(sourceState?.metricCatalog);
  const defaults = (areaMetrics[area] || []).map((metric) => ({
    ...normalizeMetricDefinition(catalog?.[area]?.[metric.id], metric),
    id: metric.id,
    isCustom: false,
  }));
  const customMetrics = normalizeCustomMetrics(sourceState?.customMetrics);
  const custom = (customMetrics[area] || []).map((metric) => ({ ...metric, isCustom: true }));
  const order = normalizeMetricOrder(sourceState, sourceState?.customMetrics)[area] || [];
  return [...defaults, ...custom]
    .map((metric) => {
      const index = order.indexOf(metric.id);
      const inferred = metricClassification(metric);
      return {
        ...metric,
        groupMeta: METRIC_GROUPS.includes(metric.groupMeta) ? metric.groupMeta : inferred.groupMeta,
        tipoIndicador: METRIC_TYPES.includes(metric.tipoIndicador) ? metric.tipoIndicador : inferred.tipoIndicador,
        participaAtingimento: typeof metric.participaAtingimento === "boolean" ? metric.participaAtingimento : inferred.participaAtingimento,
        sortOrder: index >= 0 ? index + 1 : order.length + 1,
      };
    })
    .filter((metric) => options.includeInactive || metric.active !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

function metricClassification(metric) {
  const alias = metricAliasKey(metric?.name || metric?.id || "");
  const sourceType = metric?.type || "";
  if (sourceType === "deviceRevenue" || alias === "aparelhos receita") {
    return { groupMeta: "Produtos", tipoIndicador: "receita", participaAtingimento: false };
  }
  if (sourceType === "deviceQty" || alias === "aparelhos qtde") {
    return { groupMeta: "Produtos", tipoIndicador: "volume", participaAtingimento: true };
  }
  if (alias === "acessorios" || alias === "peliculas") {
    return { groupMeta: "Produtos", tipoIndicador: "volume", participaAtingimento: true };
  }
  if (alias === "gross") {
    return { groupMeta: "Servicos Movel", tipoIndicador: "receita", participaAtingimento: true };
  }
  if (["gross volume", "delta", "fidel aparelho", "seguros"].includes(alias)) {
    return { groupMeta: "Servicos Movel", tipoIndicador: "volume", participaAtingimento: true };
  }
  if (["banda larga", "tv", "combo"].includes(alias)) {
    return { groupMeta: "Servicos Residencial", tipoIndicador: "volume", participaAtingimento: true };
  }
  if (sourceType === "deviceRevenue") {
    return { groupMeta: "Produtos", tipoIndicador: "receita", participaAtingimento: false };
  }
  return { groupMeta: "Sem bloco", tipoIndicador: sourceType === "revenue" ? "receita" : "volume", participaAtingimento: true };
}

function metricGroup(metric) {
  if (!metric) return "Sem bloco";
  return METRIC_GROUPS.includes(metric.groupMeta) ? metric.groupMeta : metricClassification(metric).groupMeta;
}

function metricTypeKind(metric) {
  if (!metric) return "informativo";
  return METRIC_TYPES.includes(metric.tipoIndicador) ? metric.tipoIndicador : metricClassification(metric).tipoIndicador;
}

function metricParticipates(metric) {
  if (!metric) return false;
  if (typeof metric.participaAtingimento === "boolean") return metric.participaAtingimento;
  return metricClassification(metric).participaAtingimento;
}

function metricGroupDisplay(group) {
  const labels = {
    Produtos: "Produtos",
    "Servicos Movel": "Servi\u00e7os M\u00f3vel",
    "Servicos Residencial": "Servi\u00e7os Residencial",
    Informativo: "Informativo",
    "Sem bloco": "Sem bloco",
  };
  return labels[group] || group || "Sem bloco";
}

function metricTypeDisplay(type) {
  const labels = {
    volume: "Volume",
    receita: "Receita",
    percentual: "Percentual",
    informativo: "Informativo",
  };
  return labels[type] || type || "Informativo";
}

function ensureSellerValues(seller, sourceState = state) {
  seller.values = seller.values || {};
  seller.adjustments = seller.adjustments || { quality: 0, insurance: 0, carousel: 0 };
  if (!seller.password) seller.password = "1234";
  for (const metric of metricsFor(seller.area, sourceState)) {
    if (!seller.values[metric.id]) seller.values[metric.id] = { goal: metric.goal, realized: 0 };
  }
}

const estornoFields = [
  { id: "quality", label: "Qualidade" },
  { id: "insurance", label: "Seguro" },
  { id: "carousel", label: "Carrossel" },
];

function moneyInputValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function sellerEstornos(seller) {
  const adjustments = seller?.adjustments || {};
  const items = estornoFields.map((field) => ({
    ...field,
    value: moneyInputValue(adjustments[field.id]),
  }));
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return { items, total };
}

function discountMoney(value) {
  const amount = Math.abs(Number(value) || 0);
  return amount ? money.format(-amount) : money.format(0);
}

function sortedBands(area, metricId) {
  return [...(state.rules[area]?.[metricId] || [])].sort((a, b) => Number(b.at) - Number(a.at));
}

function rateFor(area, metricId, percent) {
  const band = sortedBands(area, metricId).find((item) => percent >= Number(item.at));
  return band ? Number(band.rate) : 0;
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function validGoalValue(value) {
  const goal = Number(value);
  return Number.isFinite(goal) && goal > 0 ? goal : null;
}

function integerValue(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.floor(number) : fallback;
}

function positiveInteger(value, fallback = 0) {
  const number = integerValue(value, fallback);
  return number > 0 ? number : fallback;
}

function normalizePartialPeriodData(partial = {}) {
  const rawPeriod = partial?.period || {};
  const daysDone = integerValue(partial?.daysDone ?? rawPeriod.daysDone, 0);
  const daysTotal = integerValue(partial?.daysTotal ?? rawPeriod.daysTotal, 0);
  return {
    month: rawPeriod.month || partial?.month || "",
    daysDone: daysDone > 0 ? daysDone : 0,
    daysTotal: daysTotal > 0 ? daysTotal : 0,
  };
}

function campaignPlannedBusinessDays(campaign = activeCampaign()) {
  return positiveInteger(campaign?.plannedBusinessDays, positiveInteger(campaign?.period?.daysTotal, positiveInteger(state?.period?.daysTotal, 1)));
}

function periodWithCalculation(period, source) {
  const base = {
    month: period?.month || state?.period?.month || activeCampaign()?.reference || "",
    daysDone: integerValue(period?.daysDone, 0),
    daysTotal: integerValue(period?.daysTotal, 0),
  };
  const info = periodCalculationInfo(base);
  return { ...base, ...info, source };
}

function getPeriodForPartial(partial, campaign = activeCampaign()) {
  const month = partial?.period?.month || campaign?.reference || campaign?.period?.month || state?.period?.month || "";
  const directDone = positiveInteger(partial?.daysDone, 0);
  const directTotal = positiveInteger(partial?.daysTotal, 0);
  if (directDone && directTotal) return periodWithCalculation({ month, daysDone: directDone, daysTotal: directTotal }, "partial");

  const periodDone = positiveInteger(partial?.period?.daysDone, 0);
  const periodTotal = positiveInteger(partial?.period?.daysTotal, 0);
  if (periodDone && periodTotal) return periodWithCalculation({ month, daysDone: periodDone, daysTotal: periodTotal }, "partial.period");

  const plannedDays = campaignPlannedBusinessDays(campaign);
  if (plannedDays) return periodWithCalculation({ month, daysDone: 0, daysTotal: plannedDays }, "campaignFallback");

  return periodWithCalculation({ month: state?.period?.month || month, daysDone: state?.period?.daysDone, daysTotal: state?.period?.daysTotal }, "legacyStateFallback");
}

function partialPeriodDisplay(partial, campaign = activeCampaign()) {
  const period = getPeriodForPartial(partial, campaign);
  if (period.daysDone && period.daysTotal) return `${num.format(period.daysDone)} de ${num.format(period.daysTotal)} dias`;
  if (period.daysTotal) return `Revisar dias (${num.format(period.daysTotal)} uteis)`;
  return "Revisar dias";
}

function partialPeriodWarning(partial, campaign = activeCampaign()) {
  const period = getPeriodForPartial(partial, campaign);
  if (period.source === "partial" || period.source === "partial.period") return "";
  return "Esta parcial foi criada antes da configuracao de dias por parcial. Revise os dias antes de usar como base oficial.";
}

function periodCalculationInfo(period = projectionPeriodOverride || state.period) {
  const daysDone = Number(period?.daysDone);
  const daysTotal = Number(period?.daysTotal);
  const hasDaysDone = Number.isFinite(daysDone) && daysDone > 0;
  const hasDaysTotal = Number.isFinite(daysTotal) && daysTotal > 0;
  return {
    daysDone: hasDaysDone ? daysDone : 0,
    daysTotal: hasDaysTotal ? daysTotal : 0,
    daysRemaining: hasDaysTotal ? Math.max(daysTotal - (hasDaysDone ? daysDone : 0), 0) : 0,
    periodPercent: hasDaysDone && hasDaysTotal ? daysDone / daysTotal : null,
    canProject: hasDaysDone && hasDaysTotal,
  };
}

function projectionForPeriod(realized, period = projectionPeriodOverride || state.period) {
  const info = periodCalculationInfo(period);
  if (!info.canProject) return null;
  return finiteNumber(realized) / info.daysDone * info.daysTotal;
}

function projected(realized) {
  return projectionForPeriod(realized) ?? 0;
}

let projectionPeriodOverride = null;

function withProjectionPeriod(period, callback) {
  const previous = projectionPeriodOverride;
  projectionPeriodOverride = period || null;
  try {
    return callback();
  } finally {
    projectionPeriodOverride = previous;
  }
}

function metricCommission(seller, metric, mode) {
  ensureSellerValues(seller);
  const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
  const goal = metricGoalForSeller(seller, metric);
  const realized = mode === "projected" ? (projectionForPeriod(value.realized) ?? 0) : finiteNumber(value.realized);
  if (metric.type === "deviceRevenue") {
    const qtyMetric = metricsFor(seller.area).find((item) => item.id === "aparelhos_qtd");
    const qtyValue = seller.values.aparelhos_qtd || { goal: qtyMetric?.goal || 0, realized: 0 };
    const qtyGoal = metricGoalForSeller(seller, qtyMetric);
    const qtyRealized = mode === "projected" ? (projectionForPeriod(qtyValue.realized) ?? 0) : finiteNumber(qtyValue.realized);
    const qtyPercent = qtyGoal ? qtyRealized / qtyGoal : 0;
    return realized * rateFor(seller.area, "aparelhos_qtd", qtyPercent);
  }
  if (metric.type === "deviceQty") return 0;
  const percent = goal ? realized / goal : 0;
  const rate = rateFor(seller.area, metric.id, percent);
  if (metric.type === "unit100") return realized * rate * 100;
  return realized * rate;
}

function metricGoalForSeller(seller, metric) {
  if (!seller || !metric) return null;
  const value = seller.values?.[metric.id];
  const rawGoal = value?.goal !== undefined && value.goal !== "" ? value.goal : metric.goal;
  return validGoalValue(rawGoal);
}

function indicatorCalculation({ metric, goal, realized, projectedValue = null, participates = true }) {
  const officialRealized = finiteNumber(realized);
  const eligibleGoal = participates ? validGoalValue(goal) : null;
  const canCalculate = Boolean(metric) && participates && eligibleGoal !== null;
  const projection = projectedValue === null || projectedValue === undefined ? null : finiteNumber(projectedValue, null);
  const currentPercent = canCalculate ? officialRealized / eligibleGoal : null;
  const projectedPercent = canCalculate && projection !== null ? projection / eligibleGoal : null;
  const gap = canCalculate ? Math.max(eligibleGoal - officialRealized, 0) : null;
  const status = !metric
    ? { label: "Meta nao configurada", cls: "neutral", action: "Revisar meta" }
    : !participates
      ? { label: "Informativo", cls: "neutral", action: "Consulta" }
      : eligibleGoal
        ? partialStatusFromProjected(projectedPercent, currentPercent)
        : { label: "Meta nao configurada", cls: "neutral", action: "Revisar meta" };
  return { goal: eligibleGoal, realized: officialRealized, projectedValue: projection, currentPercent, projectedPercent, gap, status, canCalculate };
}

function metricAttainmentForSeller(seller, metricId, useProjected) {
  if (!seller) return null;
  const metric = metricsFor(seller?.area).find((item) => item.id === metricId);
  if (!metric || !metricParticipates(metric)) return null;
  const value = seller.values?.[metricId] || { goal: metric.goal, realized: 0 };
  const goal = metricGoalForSeller(seller, metric);
  if (!goal) return null;
  const realized = useProjected ? projectionForPeriod(value.realized) : finiteNumber(value.realized);
  if (realized === null) return null;
  return realized / goal;
}

function percentFor(seller, metricId, useProjected) {
  return metricAttainmentForSeller(seller, metricId, useProjected) ?? 0;
}

function achievementClass(percent) {
  if (percent === null || !Number.isFinite(percent)) return "";
  if (percent >= 1) return "ok";
  if (percent >= 0.8) return "warn";
  return "bad";
}

function achievementPill(percent) {
  if (percent === null || !Number.isFinite(percent)) return `<span class="achievement-pill neutral">-</span>`;
  return `<span class="achievement-pill ${achievementClass(percent)}">${pct.format(percent)}</span>`;
}

function metricIsMoney(metric) {
  return metric?.unit === "R$" || metricTypeKind(metric) === "receita";
}

function formatMetricAmount(metric, value) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  if (metricIsMoney(metric)) return money.format(number);
  return num0.format(Math.round(number));
}

function formatMetricPace(metric, value) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  if (metricIsMoney(metric)) return `${money.format(number)}/dia`;
  return `${num1.format(number)}/dia`;
}

function formatGoalLabel(metric, goal, participates = true) {
  if (!participates) return "Informativo";
  return validGoalValue(goal) === null ? "Meta nao configurada" : formatMetricAmount(metric, goal);
}

function formatPercent(value) {
  return value === null || value === undefined || !Number.isFinite(Number(value)) ? "-" : pct.format(Number(value));
}

function effectiveAttainmentPercent(item) {
  const projectedPercent = Number(item?.projectedPercent);
  if (Number.isFinite(projectedPercent)) return projectedPercent;
  const currentPercent = Number(item?.currentPercent ?? item?.percent);
  return Number.isFinite(currentPercent) ? currentPercent : null;
}

function metricGoalApplies(item) {
  return Boolean(item?.participates) && validGoalValue(item?.goal) !== null && effectiveAttainmentPercent(item) !== null;
}

function goalCompletionStatus(percent) {
  if (percent === null || !Number.isFinite(percent)) return { label: "Sem metas", cls: "neutral", action: "Configurar metas" };
  if (percent >= 1) return { label: "Atingida", cls: "ok", action: "Manter ritmo" };
  if (percent >= 0.8) return { label: "Em atenção", cls: "warn", action: "Acompanhar" };
  return { label: "Crítica", cls: "bad", action: "Plano de ação" };
}

function goalCompletionStats(items) {
  const applicable = items.filter(metricGoalApplies);
  const met = applicable.filter((item) => effectiveAttainmentPercent(item) >= 1);
  const critical = applicable.filter((item) => effectiveAttainmentPercent(item) < 0.8);
  const projectedAverage = applicable.length ? applicable.reduce((sum, item) => sum + effectiveAttainmentPercent(item), 0) / applicable.length : null;
  const metPercent = applicable.length ? met.length / applicable.length : null;
  return {
    applicable,
    met,
    critical,
    applicableCount: applicable.length,
    metCount: met.length,
    criticalCount: critical.length,
    metPercent,
    projectedAverage,
    status: goalCompletionStatus(metPercent),
  };
}

function groupedMetricGoalApplies(row) {
  const participates = Boolean(row?.participates) || Number(row?.participatingCount || 0) > 0;
  return participates && validGoalValue(row?.goal) !== null && effectiveAttainmentPercent(row) !== null;
}
function criticalMetricList(items, limit = 3) {
  return items
    .filter(metricGoalApplies)
    .filter((item) => effectiveAttainmentPercent(item) < 0.8)
    .sort((a, b) => effectiveAttainmentPercent(a) - effectiveAttainmentPercent(b))
    .slice(0, limit);
}

function criticalMetricNames(items, limit = 3) {
  const rows = criticalMetricList(items, limit);
  return rows.map((item) => `${item.metric?.name || item.item?.metricName || item.key}: ${formatPercent(effectiveAttainmentPercent(item))}`).join(", ");
}

function dashboardMetricRowName(row) {
  return row?.metricName || row?.metric?.name || row?.item?.metricName || row?.key || "-";
}

function dashboardMetricAggregationKey(record) {
  const group = record.groupMeta || metricGroup(record.metric);
  const metricName = record.metric?.name || record.item?.metricName || record.metric?.id || record.item?.metricId || "";
  const alias = metricAliasKey(metricName);
  return `${group}|${alias || metricName}`;
}

function branchMetricGoalRows(records) {
  return groupedPartialRows(records, dashboardMetricAggregationKey).map((row) => {
    const sample = records.find((record) => dashboardMetricAggregationKey(record) === row.key) || {};
    const metric = sample.metric || { id: sample.item?.metricId || row.key, name: sample.item?.metricName || row.key, unit: sample.item?.unit || "" };
    return {
      ...row,
      groupKey: row.key,
      key: metric.name || sample.item?.metricName || row.key,
      metric,
      metricName: metric.name || sample.item?.metricName || row.key,
      item: sample.item || { metricName: metric.name || row.key },
      groupMeta: sample.groupMeta || metricGroup(metric),
      participates: row.participatingCount > 0,
    };
  });
}

function branchGoalCompletionStats(records) {
  return goalCompletionStats(branchMetricGoalRows(records));
}

function branchCriticalMetricRows(records, limit = 3) {
  return criticalMetricList(branchMetricGoalRows(records), limit);
}

function consolidatedMetricGoalRows(records) {
  return branchMetricGoalRows(records).filter(groupedMetricGoalApplies);
}

function consolidatedMetricTotals(rows) {
  const applicable = rows.filter(groupedMetricGoalApplies);
  const goal = applicable.reduce((sum, row) => sum + Number(row.goal || 0), 0);
  const realized = applicable.reduce((sum, row) => sum + Number(row.realized || 0), 0);
  const projectedRows = applicable.filter((row) => row.projected !== null && row.projected !== undefined && Number.isFinite(Number(row.projected)));
  const projected = projectedRows.length ? projectedRows.reduce((sum, row) => sum + Number(row.projected || 0), 0) : null;
  const percent = goal ? realized / goal : null;
  const projectedPercent = goal && projected !== null ? projected / goal : null;
  const gap = goal ? Math.max(goal - realized, 0) : null;
  const status = applicable.length
    ? partialStatusFromProjected(projectedPercent, percent)
    : { label: "Sem metas", cls: "neutral", action: "Sem dados" };
  return { goal, realized, projected, percent, projectedPercent, gap, status };
}

function averageFinitePercent(rows, key) {
  const values = rows.map((row) => Number(row?.[key])).filter((value) => Number.isFinite(value));
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function indicatorVolumeStats(rows) {
  const applicable = rows.filter(groupedMetricGoalApplies);
  const currentMet = applicable.filter((row) => Number(row.percent) >= 1);
  const projectedMet = applicable.filter((row) => Number(row.projectedPercent) >= 1);
  const critical = applicable.filter((row) => effectiveAttainmentPercent(row) !== null && effectiveAttainmentPercent(row) < 0.8);
  const indicatorCount = applicable.length;
  return {
    applicable,
    currentMet,
    projectedMet,
    critical,
    indicatorCount,
    currentMetCount: currentMet.length,
    projectedMetCount: projectedMet.length,
    criticalCount: critical.length,
    currentRatio: indicatorCount ? currentMet.length / indicatorCount : null,
    projectedRatio: indicatorCount ? projectedMet.length / indicatorCount : null,
    currentAverage: averageFinitePercent(applicable, "percent"),
    projectedAverage: averageFinitePercent(applicable, "projectedPercent"),
  };
}

function consolidatedBlockRows(records) {
  const metricRows = consolidatedMetricGoalRows(records);
  return PRIMARY_METRIC_GROUPS.map((group) => {
    const items = metricRows.filter((row) => (row.groupMeta || metricGroup(row.metric)) === group);
    const totals = consolidatedMetricTotals(items);
    const stats = goalCompletionStats(items);
    const volume = indicatorVolumeStats(items);
    return {
      key: group,
      items,
      totals,
      ...stats,
      ...volume,
      status: stats.applicableCount ? stats.status : totals.status,
    };
  });
}

function blockSummaryCardMarkup(row) {
  const critical = criticalMetricNames(row.items, 3) || "Nenhum";
  return `<article class="block-summary-card ${row.status.cls}">
    <span>${escapeHtml(metricGroupDisplay(row.key))}</span>
    <strong><small>Hoje na meta</small>${row.currentMetCount} de ${row.indicatorCount}</strong>
    <small>Projetados na meta: ${row.projectedMetCount} de ${row.indicatorCount}</small>
    <small>Media atual: ${achievementPill(row.currentAverage)}</small>
    <small>Media projetada: ${achievementPill(row.projectedAverage)}</small>
    <small>Criticos: ${escapeHtml(critical)}</small>
  </article>`;
}

function dashboardCriticalMetricRows(records, limit = 8) {
  const metricKey = (record) => record.metric?.name || record.item.metricName;
  return groupedPartialRows(records, metricKey)
    .filter(groupedMetricGoalApplies)
    .filter((row) => effectiveAttainmentPercent(row) < 0.8)
    .map((row) => {
      const metricRecords = records.filter((record) => metricKey(record) === row.key);
      const sellerIds = new Set(metricRecords
        .filter(metricGoalApplies)
        .filter((record) => effectiveAttainmentPercent(record) < 0.8)
        .map((record) => record.seller?.id || record.item?.sellerName || "")
        .filter(Boolean));
      const branchIds = new Set([...groupItems(metricRecords, (record) => record.seller?.branch || record.item?.branch || "").entries()]
        .filter(([branch]) => Boolean(branch))
        .filter(([, branchRecords]) => {
          const branchRow = branchMetricGoalRows(branchRecords)[0];
          return branchRow && groupedMetricGoalApplies(branchRow) && effectiveAttainmentPercent(branchRow) < 0.8;
        })
        .map(([branch]) => branch));
      return { ...row, sellerIds, branchIds };
    })
    .sort((a, b) => effectiveAttainmentPercent(a) - effectiveAttainmentPercent(b))
    .slice(0, limit);
}

function bestBranchByIndicatorVolume(branchRows) {
  return [...branchRows].filter((row) => row.indicatorCount)
    .sort((a, b) =>
      Number(b.projectedMetCount || 0) - Number(a.projectedMetCount || 0)
      || Number(b.projectedAverage ?? -1) - Number(a.projectedAverage ?? -1)
      || Number(a.criticalCount || 0) - Number(b.criticalCount || 0)
      || String(a.branch || "").localeCompare(String(b.branch || ""))
    )[0] || null;
}

function indicatorCountText(count, total) {
  return `${Number(count || 0)} de ${Number(total || 0)}`;
}

function commercialMetricKeys(record) {
  const values = [
    record?.metric?.id,
    record?.metric?.name,
    record?.metric?.importKey,
    record?.item?.metricId,
    record?.item?.metricName,
  ].filter(Boolean);
  const keys = new Set();
  for (const value of values) {
    const text = String(value || "");
    const spaced = text.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
    for (const candidate of [text, spaced]) {
      const normalized = normalizedKey(candidate).replace(/\s+/g, " ").trim();
      const compact = normalized.replace(/\s+/g, "");
      const alias = metricAliasKey(candidate);
      if (normalized) keys.add(normalized);
      if (compact) keys.add(compact);
      if (alias) {
        keys.add(alias);
        keys.add(alias.replace(/\s+/g, ""));
      }
    }
  }
  return keys;
}

function commercialMetricCategory(record) {
  const keys = commercialMetricKeys(record);
  const has = (...values) => values.some((value) => keys.has(value));
  if (has("aparelhos receita", "aparelhosreceita", "receita aparelhos", "receitaaparelhos", "device revenue", "devicerevenue", "aparelhos_receita")) return "deviceRevenue";
  if (has("aparelhos qtde", "aparelhosqtde", "aparelhos qtd", "aparelhosqtd", "aparelhos", "volume aparelhos", "volumeaparelhos", "device quantity", "devicequantity", "aparelho volume", "aparelhovolume", "aparelhos volume", "aparelhosvolume")) return "deviceVolume";
  if (has("gross volume", "grossvolume")) return "grossVolume";
  if (has("franquia bruta", "franquiabruta", "franquia bruta gross", "franquiabrutagross", "gross revenue", "grossrevenue", "receita gross", "receitagross", "receita de gross", "receitadegross", "gross receita", "grossreceita", "gross franchise revenue", "grossfranchiserevenue", "gross")) return "grossRevenue";
  return "";
}

function commercialReadingTotals(records) {
  const totals = {
    deviceVolume: { current: 0, projected: 0, hasCurrent: false, hasProjected: false },
    deviceRevenue: { current: 0, projected: 0, hasCurrent: false, hasProjected: false },
    grossVolume: { current: 0, projected: 0, hasCurrent: false, hasProjected: false },
    grossRevenue: { current: 0, projected: 0, hasCurrent: false, hasProjected: false },
  };
  for (const record of records || []) {
    const category = commercialMetricCategory(record);
    if (!category || !totals[category]) continue;
    const realized = Number(record.realized);
    if (Number.isFinite(realized)) {
      totals[category].current += realized;
      totals[category].hasCurrent = true;
    }
    const projected = Number(record.projectedValue);
    if (Number.isFinite(projected)) {
      totals[category].projected += projected;
      totals[category].hasProjected = true;
    }
  }
  const safeMetricRatio = (numeratorItem, denominatorItem, mode) => {
    const hasNumerator = Boolean(numeratorItem?.[`has${mode === "current" ? "Current" : "Projected"}`]);
    const hasDenominator = Boolean(denominatorItem?.[`has${mode === "current" ? "Current" : "Projected"}`]);
    const numerator = Number(numeratorItem?.[mode]);
    const denominator = Number(denominatorItem?.[mode]);
    return hasNumerator && hasDenominator && Number.isFinite(numerator) && Number.isFinite(denominator) && denominator > 0 ? numerator / denominator : null;
  };
  return {
    ...totals,
    deviceTicket: {
      current: safeMetricRatio(totals.deviceRevenue, totals.deviceVolume, "current"),
      projected: safeMetricRatio(totals.deviceRevenue, totals.deviceVolume, "projected"),
    },
    deviceGrossShare: {
      current: safeMetricRatio(totals.deviceVolume, totals.grossVolume, "current"),
      projected: safeMetricRatio(totals.deviceVolume, totals.grossVolume, "projected"),
    },
    grossAverage: {
      current: safeMetricRatio(totals.grossRevenue, totals.grossVolume, "current"),
      projected: safeMetricRatio(totals.grossRevenue, totals.grossVolume, "projected"),
    },
  };
}

function commercialNumberValue(item, mode = "current", formatter = num0) {
  if (!item?.[`has${mode === "current" ? "Current" : "Projected"}`]) return "-";
  return formatter.format(item[mode]);
}

function commercialOptionalValue(value, formatter) {
  return value === null || value === undefined || !Number.isFinite(Number(value)) ? "-" : formatter.format(Number(value));
}

function commercialMetricPairMarkup(label, current, projected) {
  return `<div class="commercial-metric">
    <span>${escapeHtml(label)}</span>
    <strong><small>Atual</small>${current}</strong>
    <strong><small>Proj.</small>${projected}</strong>
  </div>`;
}

function commercialReadingMarkup({ title, subtitle, records, emptyMessage }) {
  if (!records?.length) {
    return `<div class="dashboard-card-head"><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(subtitle)}</p></div></div><p class="muted-note">${escapeHtml(emptyMessage || "Nenhuma parcial oficial disponivel para leitura comercial.")}</p>`;
  }
  const data = commercialReadingTotals(records);
  return `<div class="dashboard-card-head">
    <div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(subtitle)}</p></div>
  </div>
  <div class="commercial-reading-grid">
    <article class="commercial-card">
      <div class="commercial-card-head"><strong>Aparelhos</strong><span>Volume, receita, ticket medio e participacao no Gross.</span></div>
      <div class="commercial-metric-grid">
        ${commercialMetricPairMarkup("Aparelhos vendidos", commercialNumberValue(data.deviceVolume, "current", num0), commercialNumberValue(data.deviceVolume, "projected", num0))}
        ${commercialMetricPairMarkup("Receita de aparelhos", commercialNumberValue(data.deviceRevenue, "current", money), commercialNumberValue(data.deviceRevenue, "projected", money))}
        ${commercialMetricPairMarkup("Ticket medio", commercialOptionalValue(data.deviceTicket.current, money), commercialOptionalValue(data.deviceTicket.projected, money))}
        ${commercialMetricPairMarkup("Participacao sobre Gross Volume", commercialOptionalValue(data.deviceGrossShare.current, pct), commercialOptionalValue(data.deviceGrossShare.projected, pct))}
      </div>
    </article>
    <article class="commercial-card">
      <div class="commercial-card-head"><strong>Gross</strong><span>Volume, franquia bruta e franquia media.</span></div>
      <div class="commercial-metric-grid">
        ${commercialMetricPairMarkup("Gross Volume", commercialNumberValue(data.grossVolume, "current", num0), commercialNumberValue(data.grossVolume, "projected", num0))}
        ${commercialMetricPairMarkup("Franquia bruta", commercialNumberValue(data.grossRevenue, "current", money), commercialNumberValue(data.grossRevenue, "projected", money))}
        ${commercialMetricPairMarkup("Franquia media bruta", commercialOptionalValue(data.grossAverage.current, money), commercialOptionalValue(data.grossAverage.projected, money))}
      </div>
    </article>
  </div>`;
}
function groupItems(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

function goalCompletionByGroup(items, keyFn, orderedKeys = []) {
  const grouped = groupItems(items, keyFn);
  const keys = [...orderedKeys, ...[...grouped.keys()].filter((key) => !orderedKeys.includes(key))];
  return keys.map((key) => {
    const groupItemsList = grouped.get(key) || [];
    const totals = partialRecordTotals(groupItemsList);
    const stats = goalCompletionStats(groupItemsList);
    return { key, items: groupItemsList, totals, ...stats };
  });
}

function goalCompletionByMetricRows(rows) {
  return goalCompletionStats(rows);
}

function goalCompletionBlocksFromRows(rows) {
  return goalCompletionByGroup(rows, (row) => row.groupMeta || metricGroup(row.metric), PRIMARY_METRIC_GROUPS);
}

function goalCompletionBlocksFromRecords(records) {
  return goalCompletionByGroup(records, (record) => record.groupMeta || metricGroup(record.metric), PRIMARY_METRIC_GROUPS);
}

function sellerRecordAnalyticRows(records) {
  return [...groupItems(records, (record) => record.seller.id).entries()].map(([key, sellerRecords]) => {
    const seller = sellerRecords[0]?.seller;
    const totals = partialRecordTotals(sellerRecords);
    const stats = goalCompletionStats(sellerRecords);
    const critical = criticalMetricList(sellerRecords, 1)[0] || null;
    const criticalBlock = critical ? metricGroupDisplay(critical.groupMeta || metricGroup(critical.metric)) : "-";
    return {
      key,
      seller,
      records: sellerRecords,
      totals,
      ...stats,
      criticalMetric: critical,
      criticalBlock,
    };
  }).filter((row) => row.seller);
}

function sortGoalCompletionRows(rows) {
  return [...rows].sort((a, b) =>
    Number(b.metPercent ?? -1) - Number(a.metPercent ?? -1)
    || Number(b.projectedAverage ?? -1) - Number(a.projectedAverage ?? -1)
    || Number(a.criticalCount || 0) - Number(b.criticalCount || 0)
    || String(a.seller?.name || a.key).localeCompare(String(b.seller?.name || b.key))
  );
}

function totalAttainmentForSellers(sellers, mode = "projected") {
  const totals = sellers.reduce((acc, seller) => {
    ensureSellerValues(seller);
    for (const metric of metricsFor(seller.area)) {
      if (!metricParticipates(metric)) continue;
      const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
      const goal = metricGoalForSeller(seller, metric);
      if (!goal) continue;
      const realized = mode === "projected" ? projectionForPeriod(value.realized) : finiteNumber(value.realized);
      if (realized === null) continue;
      acc.goal += goal;
      acc.value += realized;
    }
    return acc;
  }, { goal: 0, value: 0 });
  return totals.goal ? totals.value / totals.goal : null;
}

function deflatorFor(seller, subtotal, useProjected) {
  if (seller?.emExperiencia === true) return 0;
  const config = state.deflators?.[seller.area] || defaultDeflators[seller.area];
  const rules = Array.isArray(config) ? config : [
    { metricId: "gross", min: Number(config?.grossMin) || 0, penaltyRate: Number(config?.penaltyRate) || 0 },
    { metricId: "tv", min: Number(config?.tvMin) || 0, penaltyRate: Number(config?.penaltyRate) || 0 },
  ];
  const penaltyRate = rules.reduce((max, rule) => {
    const min = Number(rule.min) || 0;
    const metric = metricsFor(seller.area).find((item) => item.id === rule.metricId);
    const percent = metricAttainmentForSeller(seller, rule.metricId, useProjected);
    if (!rule.metricId || !metric || !metricParticipates(metric) || percent === null || percent >= min) return max;
    return Math.max(max, Number(rule.penaltyRate) || 0);
  }, 0);
  return penaltyRate ? -subtotal * penaltyRate : 0;
}

function sellerResult(seller) {
  ensureSellerValues(seller);
  const metrics = metricsFor(seller.area);
  const currentSubtotal = metrics.reduce((sum, metric) => sum + metricCommission(seller, metric, "current"), 0);
  const projectedSubtotal = metrics.reduce((sum, metric) => sum + metricCommission(seller, metric, "projected"), 0);
  const currentDeflator = deflatorFor(seller, currentSubtotal, false);
  const projectedDeflator = deflatorFor(seller, projectedSubtotal, true);
  const estornos = sellerEstornos(seller).total;
  const current = currentSubtotal + currentDeflator - estornos;
  const proj = projectedSubtotal + projectedDeflator - estornos;
  return { current, projected: proj, gain: proj - current, currentSubtotal, projectedSubtotal, currentDeflator, projectedDeflator, estornos, adjustments: estornos };
}

function statusFor(seller) {
  const result = sellerResult(seller);
  const metricPercents = metricsFor(seller.area)
    .filter(metricParticipates)
    .map((metric) => ({ metric, percent: metricAttainmentForSeller(seller, metric.id, true) }))
    .filter((item) => item.percent !== null);
  if (!metricPercents.length) return { label: "Sem metas", cls: "neutral" };
  if (result.projected <= 0) return { label: "Critico", cls: "bad" };
  const lowMetrics = metricPercents.filter((item) => item.percent < 0.8);
  if (lowMetrics.length === 0) return { label: "Meta batida", cls: "ok" };
  return lowMetrics.length <= 2 ? { label: "Em risco", cls: "warn" } : { label: "Critico", cls: "bad" };
}

function sellerClosingRecord(seller) {
  const result = sellerResult(seller);
  const metrics = collaboratorMetricRows(seller);
  const estornos = sellerEstornos(seller);
  const preview = projectedDeflatorPreview(seller);
  const currentPercent = metrics.totals.currentPercent;
  const projectedPercent = metrics.totals.projectedPercent ?? null;
  const status = seller.emExperiencia ? { label: "Em experiencia" } : branchStatusFromPercent(projectedPercent ?? currentPercent);
  return {
    sellerId: seller.id,
    name: seller.name,
    branch: seller.branch,
    area: seller.area,
    emExperiencia: seller.emExperiencia === true,
    goal: metrics.totals.goal,
    realized: metrics.totals.realized,
    currentPercent,
    missing: metrics.totals.missing,
    projected: metrics.totals.projected,
    projectedPercent,
    commissionGross: result.projectedSubtotal,
    deflator: result.projectedDeflator,
    deflatorReason: preview.triggered.map((item) => item.metric?.name).filter(Boolean).join(", ") || "Sem deflator",
    deflatorImpact: seller.emExperiencia ? 0 : result.projectedDeflator,
    estornoQuality: estornos.items.find((item) => item.id === "quality")?.value || 0,
    estornoInsurance: estornos.items.find((item) => item.id === "insurance")?.value || 0,
    estornoCarousel: estornos.items.find((item) => item.id === "carousel")?.value || 0,
    estornosTotal: estornos.total,
    commissionFinal: result.projected,
    status: status.label,
    indicators: metrics.rows.map((row) => ({
      seller: seller.name,
      branch: seller.branch,
      metricId: row.metric.id,
      metric: row.metric.name,
      unit: row.metric.unit,
      groupMeta: row.groupMeta,
      tipoIndicador: row.tipoIndicador,
      participaAtingimento: row.participates,
      goal: row.goal,
      realized: row.realized,
      currentPercent: row.currentPercent ?? null,
      missing: row.missing,
      projected: row.projectedValue,
      projectedPercent: row.projectedPercent ?? null,
      commission: row.commission,
      deflator: row.deflator,
      status: row.status.label,
    })),
  };
}

function buildCampaignSnapshot(campaign = activeCampaign(), options = {}) {
  const snapshotPeriod = options.period || state.period || {};
  const basePartialPeriod = options.basePartial ? getPeriodForPartial(options.basePartial, campaign) : periodWithCalculation(snapshotPeriod, "snapshot");
  const sellerRows = state.sellers.map(sellerClosingRecord);
  const indicatorRows = sellerRows.flatMap((seller) => seller.indicators);
  const totalGoal = sellerRows.reduce((sum, row) => sum + row.goal, 0);
  const totalRealized = sellerRows.reduce((sum, row) => sum + row.realized, 0);
  const totalProjected = sellerRows.reduce((sum, row) => sum + row.projected, 0);
  const branchesList = [...new Set(sellerRows.map((row) => row.branch))];
  const riskBranches = branchesList.filter((branch) => {
    const rows = sellerRows.filter((row) => row.branch === branch);
    const goal = rows.reduce((sum, row) => sum + row.goal, 0);
    const realized = rows.reduce((sum, row) => sum + row.realized, 0);
    return goal ? realized / goal < 0.7 : false;
  }).length;
  return {
    campaignId: campaign?.id,
    campaignName: campaign?.name || "Campanha",
    reference: campaign?.reference || state.period.month,
    status: options.status || CAMPAIGN_STATUS.OFFICIAL_CLOSED,
    baseType: options.baseType || "",
    basePartialId: options.basePartial?.id || options.basePartialId || "",
    basePartialNumber: Number(options.basePartial?.number ?? options.basePartialNumber) || 0,
    basePartialName: options.basePartial?.name || options.basePartialName || "",
    baseDate: options.basePartial?.baseDate || options.baseDate || "",
    createdAt: options.createdAt || "",
    createdBy: options.createdBy || "",
    closedBy: options.closedBy || "",
    closedAt: Object.prototype.hasOwnProperty.call(options, "closedAt") ? options.closedAt : new Date().toISOString(),
    period: cloneData(snapshotPeriod),
    daysDone: Number(snapshotPeriod?.daysDone) || 0,
    daysTotal: Number(snapshotPeriod?.daysTotal) || 0,
    basePartialDaysDone: Number(basePartialPeriod?.daysDone) || 0,
    basePartialDaysTotal: Number(basePartialPeriod?.daysTotal) || 0,
    campaign: {
      id: campaign?.id || "",
      name: campaign?.name || "Campanha",
      reference: campaign?.reference || state.period.month || "",
      status: campaign?.status || "",
      startDate: campaign?.startDate || "",
      operationalCloseDate: campaign?.operationalCloseDate || "",
      officialCloseDate: campaign?.officialCloseDate || "",
      period: cloneData(snapshotPeriod),
    },
    basePartial: options.basePartial ? cloneData(options.basePartial) : null,
    branchesSnapshot: cloneData(state.branches || []),
    sellersSnapshot: cloneData(state.sellers || []),
    metricCatalogSnapshot: cloneData(state.metricCatalog || {}),
    customMetricsSnapshot: cloneData(state.customMetrics || {}),
    metricOrderSnapshot: cloneData(state.metricOrder || {}),
    rulesSnapshot: cloneData(state.rules || {}),
    deflatorsSnapshot: cloneData(state.deflators || {}),
    totalSellers: sellerRows.length,
    totalBranches: branchesList.length,
    totalGoal,
    totalRealized,
    currentPercent: totalGoal ? totalRealized / totalGoal : null,
    totalProjected,
    projectedPercent: totalGoal ? totalProjected / totalGoal : null,
    commissionGrossTotal: sellerRows.reduce((sum, row) => sum + row.commissionGross, 0),
    deflatorTotal: sellerRows.reduce((sum, row) => sum + row.deflator, 0),
    estornosTotal: sellerRows.reduce((sum, row) => sum + row.estornosTotal, 0),
    commissionFinalTotal: sellerRows.reduce((sum, row) => sum + row.commissionFinal, 0),
    riskSellers: sellerRows.filter((row) => row.currentPercent !== null && row.currentPercent < 0.7).length,
    highlightSellers: sellerRows.filter((row) => row.currentPercent !== null && row.currentPercent >= 1).length,
    riskBranches,
    sellers: sellerRows,
    indicators: indicatorRows,
  };
}

function campaignFileName(campaign, snapshot) {
  const safe = String(`${campaign?.name || "Campanha"}_${campaign?.reference || snapshot?.reference || ""}`)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "");
  return `Comissao_360_Comissionamento_${safe || "campanha"}.csv`;
}

function csvDateTime(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? dateTime.format(date) : "-";
}

function generateOfficialCommissionCsv(snapshot) {
  const lines = [];
  lines.push(["Resumo da campanha"]);
  lines.push(["Comissao 360"]);
  lines.push(["Nome da campanha", snapshot.campaignName]);
  lines.push(["Mes/ano", snapshot.reference]);
  lines.push(["Periodo base", `${snapshot.daysDone || snapshot.basePartialDaysDone || "-"} de ${snapshot.daysTotal || snapshot.basePartialDaysTotal || "-"} dias`]);
  lines.push(["Data/hora fechamento", csvDateTime(snapshot.closedAt)]);
  lines.push(["Total vendedores", snapshot.totalSellers]);
  lines.push(["Total filiais", snapshot.totalBranches]);
  lines.push(["Comissao bruta total", csvMoney(snapshot.commissionGrossTotal)]);
  lines.push(["Deflatores totais", csvMoney(snapshot.deflatorTotal)]);
  lines.push(["Estornos totais", csvDiscountMoney(snapshot.estornosTotal)]);
  lines.push(["Comissao final total", csvMoney(snapshot.commissionFinalTotal)]);
  lines.push(["Status", snapshot.status]);
  lines.push([]);
  lines.push(["Detalhe por vendedor"]);
  lines.push(["Campanha", "Mes/ano", "Vendedor", "Filial", "Area", "Vendedor em experiencia", "Comissao bruta", "Deflator aplicado", "Motivo do deflator", "Impacto financeiro do deflator", "Estorno Qualidade", "Estorno Seguro", "Estorno Carrossel", "Total de estornos", "Comissao final", "Status do fechamento"]);
  for (const row of snapshot.sellers) lines.push([
    snapshot.campaignName,
    snapshot.reference,
    row.name,
    row.branch,
    row.area,
    row.emExperiencia ? "Sim" : "Nao",
    csvMoney(row.commissionGross),
    csvMoney(row.deflator),
    row.deflatorReason,
    csvMoney(row.deflatorImpact),
    csvDiscountMoney(row.estornoQuality),
    csvDiscountMoney(row.estornoInsurance),
    csvDiscountMoney(row.estornoCarousel),
    csvDiscountMoney(row.estornosTotal),
    csvMoney(row.commissionFinal),
    row.status,
  ]);
  lines.push([]);
  lines.push(["Detalhe por indicador"]);
  lines.push(["Campanha", "Mes/ano", "Vendedor", "Filial", "Bloco", "Indicador", "Tipo", "Participa atingimento", "Meta", "Realizado", "% atual", "Falta", "Projetado", "% projetado", "Comissao do indicador", "Deflator do indicador", "Status"]);
  for (const row of snapshot.indicators) lines.push([snapshot.campaignName, snapshot.reference, row.seller, row.branch, row.groupMeta || "", row.metric, row.tipoIndicador || "", row.participaAtingimento ? "Sim" : "Nao", row.goal || "-", row.realized, row.participaAtingimento ? formatPercent(row.currentPercent) : "-", row.missing ?? "-", row.projected ?? "-", row.participaAtingimento ? formatPercent(row.projectedPercent) : "-", csvMoney(row.commission), row.deflator, row.status]);
  lines.push([]);
  lines.push(["Desenvolvido por Cleiton Gerber"]);
  return `\uFEFF${lines.map((line) => line.map(csvCell).join(";")).join("\n")}`;
}

function closings() {
  state.closings = normalizeClosings(state.closings);
  return state.closings;
}

function closingsForCampaign(campaign = activeCampaign()) {
  if (!campaign) return [];
  return closings()
    .filter((closing) => closing.campaignId === campaign.id)
    .sort((a, b) => String(b.closedAt || b.createdAt).localeCompare(String(a.closedAt || a.createdAt)));
}

function closingIsOfficial(closing) {
  return [CLOSING_STATUS.OFFICIAL_CLOSED, CLOSING_STATUS.AWAITING_EXTRACTS, CLOSING_STATUS.PUBLISHED].includes(closing?.status);
}

function officialClosingForCampaign(campaign = activeCampaign()) {
  return closingsForCampaign(campaign).find(closingIsOfficial) || null;
}

function closingExtractsPublished(closing) {
  return normalizeClosingStatus(closing?.status) === CLOSING_STATUS.PUBLISHED;
}

function publishedOfficialClosingForCampaign(campaign = activeCampaign()) {
  const closing = officialClosingForCampaign(campaign);
  return closing && closingExtractsPublished(closing) ? closing : null;
}

function closingForCampaign(campaign = activeCampaign()) {
  const official = officialClosingForCampaign(campaign);
  return official || closingsForCampaign(campaign)[0] || null;
}

function closingStatusClass(status) {
  if (status === CLOSING_STATUS.PUBLISHED) return "ok";
  if (status === CLOSING_STATUS.AWAITING_EXTRACTS || status === CLOSING_STATUS.OFFICIAL_CLOSED) return "neutral";
  if (status === CLOSING_STATUS.REVIEW || status === CLOSING_STATUS.READY) return "warn";
  return "bad";
}

function closingBasePartial(closing, campaign = activeCampaign()) {
  if (!campaign) return null;
  return (closing?.basePartialId ? partialById(closing.basePartialId, campaign) : null) || latestPublishedPartial(campaign);
}

function closingPayloadFromPartial(campaign, partial) {
  const payload = campaignPayloadFrom(campaign);
  const period = getPeriodForPartial(partial, campaign);
  payload.period = {
    month: period.month || campaign?.reference || campaign?.period?.month || "",
    daysDone: period.daysDone,
    daysTotal: period.daysTotal,
  };
  payload.plannedBusinessDays = period.daysTotal || payload.plannedBusinessDays;
  const sellerMap = new Map(payload.sellers.map((seller) => [seller.id, seller]));
  const sellerKeys = new Map(payload.sellers.map((seller) => [`${normalizedKey(seller.name)}|${normalizedKey(seller.branch)}`, seller]));
  for (const seller of payload.sellers) {
    seller.values = seller.values || {};
    for (const metric of metricsFor(seller.area, payload, { includeInactive: true })) {
      const current = seller.values[metric.id] || {};
      seller.values[metric.id] = { goal: current.goal ?? metric.goal, realized: 0 };
    }
  }
  for (const item of partial?.items || []) {
    if (!isPartialUsableItem(item)) continue;
    const seller = sellerMap.get(item.sellerId) || sellerKeys.get(`${normalizedKey(item.sellerName)}|${normalizedKey(item.branch)}`);
    if (!seller || !item.metricId) continue;
    seller.values = seller.values || {};
    const current = seller.values[item.metricId] || { goal: 0, realized: 0 };
    seller.values[item.metricId] = {
      ...current,
      realized: finiteNumber(current.realized) + finiteNumber(item.realized),
    };
  }
  return payload;
}

function withTemporaryCampaignPayload(campaign, payload, callback) {
  const activeId = state.activeCampaignId;
  const originalPayload = campaignPayloadFrom(state);
  try {
    applyCampaignToState(state, { ...campaign, ...payload });
    return withProjectionPeriod(payload.period, callback);
  } finally {
    applyCampaignToState(state, originalPayload);
    state.activeCampaignId = activeId;
  }
}

function buildClosingSnapshotFromPartial(campaign, partial, options = {}) {
  if (!campaign || !partial) return null;
  const payload = closingPayloadFromPartial(campaign, partial);
  return withTemporaryCampaignPayload(campaign, payload, () => buildCampaignSnapshot({ ...campaign, ...payload }, {
    status: options.status || CLOSING_STATUS.REVIEW,
    baseType: options.baseType || CLOSING_BASE.LATEST_PARTIAL,
    basePartial: partial,
    createdAt: options.createdAt || "",
    createdBy: options.createdBy || "",
    closedAt: Object.prototype.hasOwnProperty.call(options, "closedAt") ? options.closedAt : "",
    closedBy: options.closedBy || "",
  }));
}

function recalculateClosingSnapshotTotals(snapshot) {
  if (!snapshot) return null;
  snapshot.sellers = (snapshot.sellers || []).map((row) => {
    const estornoQuality = moneyInputValue(row.estornoQuality);
    const estornoInsurance = moneyInputValue(row.estornoInsurance);
    const estornoCarousel = moneyInputValue(row.estornoCarousel);
    const estornosTotal = estornoQuality + estornoInsurance + estornoCarousel;
    const commissionGross = finiteNumber(row.commissionGross);
    const effectiveDeflator = row.emExperiencia ? 0 : finiteNumber(row.deflatorImpact ?? row.deflator);
    return {
      ...row,
      estornoQuality,
      estornoInsurance,
      estornoCarousel,
      estornosTotal,
      deflator: row.emExperiencia ? 0 : finiteNumber(row.deflator),
      deflatorImpact: effectiveDeflator,
      commissionFinal: commissionGross + effectiveDeflator - estornosTotal,
    };
  });
  snapshot.estornosTotal = snapshot.sellers.reduce((sum, row) => sum + finiteNumber(row.estornosTotal), 0);
  snapshot.commissionGrossTotal = snapshot.sellers.reduce((sum, row) => sum + finiteNumber(row.commissionGross), 0);
  snapshot.deflatorTotal = snapshot.sellers.reduce((sum, row) => sum + finiteNumber(row.deflatorImpact ?? row.deflator), 0);
  snapshot.commissionFinalTotal = snapshot.sellers.reduce((sum, row) => sum + finiteNumber(row.commissionFinal), 0);
  return snapshot;
}

function closingTotalsFromSnapshot(snapshot) {
  return normalizeClosingTotals(snapshot || {});
}

function closingDraftFromSnapshot(campaign, partial, snapshot, existing = {}) {
  const finalSnapshot = recalculateClosingSnapshotTotals(cloneData(snapshot));
  return normalizeClosing({
    ...existing,
    id: existing.id || makeId(),
    campaignId: campaign.id,
    campaignName: campaign.name,
    reference: campaign.reference || campaign.period?.month || "",
    status: existing.status || CLOSING_STATUS.REVIEW,
    baseType: CLOSING_BASE.LATEST_PARTIAL,
    basePartialId: partial.id,
    basePartialNumber: partial.number,
    basePartialName: partial.name,
    baseDate: partial.baseDate,
    createdAt: existing.createdAt || new Date().toISOString(),
    createdBy: existing.createdBy || currentAuditProfile(),
    totals: closingTotalsFromSnapshot(finalSnapshot),
    sellerResults: finalSnapshot?.sellers || [],
    indicatorResults: finalSnapshot?.indicators || [],
    deflators: finalSnapshot?.sellers?.filter((row) => row.deflatorImpact).map((row) => ({ sellerId: row.sellerId, value: row.deflatorImpact, reason: row.deflatorReason })) || [],
    estornos: finalSnapshot?.sellers?.filter((row) => row.estornosTotal).map((row) => ({ sellerId: row.sellerId, total: row.estornosTotal })) || [],
    commissionGrossTotal: finalSnapshot?.commissionGrossTotal || 0,
    deflatorTotal: finalSnapshot?.deflatorTotal || 0,
    estornosTotal: finalSnapshot?.estornosTotal || 0,
    commissionFinalTotal: finalSnapshot?.commissionFinalTotal || 0,
    snapshot: finalSnapshot,
  });
}

function replaceCampaignReviewClosing(campaign, closing) {
  state.closings = closings().filter((item) => !(item.campaignId === campaign.id && !closingIsOfficial(item)));
  state.closings.push(normalizeClosing(closing));
}

function replaceClosingById(closing) {
  if (!closing?.id) return;
  state.closings = closings().filter((item) => item.id !== closing.id);
  state.closings.push(normalizeClosing(closing));
}

function closingSnapshotForDisplay(campaign = activeCampaign(), closing = closingForCampaign(campaign)) {
  if (!campaign || !closing) return null;
  if (closing.snapshot) return recalculateClosingSnapshotTotals(cloneData(closing.snapshot));
  const partial = closingBasePartial(closing, campaign);
  return partial ? buildClosingSnapshotFromPartial(campaign, partial, {
    status: closing.status,
    createdAt: closing.createdAt,
    createdBy: closing.createdBy,
    closedAt: closing.closedAt || new Date().toISOString(),
    closedBy: closing.closedBy || "",
  }) : null;
}

function updateClosingFromSnapshot(closing, snapshot) {
  if (!closing || !snapshot) return closing;
  recalculateClosingSnapshotTotals(snapshot);
  closing.snapshot = cloneData(snapshot);
  closing.totals = closingTotalsFromSnapshot(snapshot);
  closing.sellerResults = cloneData(snapshot.sellers || []);
  closing.indicatorResults = cloneData(snapshot.indicators || []);
  closing.deflators = snapshot.sellers?.filter((row) => row.deflatorImpact).map((row) => ({ sellerId: row.sellerId, seller: row.name, value: row.deflatorImpact, reason: row.deflatorReason })) || [];
  closing.estornos = snapshot.sellers?.filter((row) => row.estornosTotal).map((row) => ({ sellerId: row.sellerId, seller: row.name, total: row.estornosTotal })) || [];
  closing.commissionGrossTotal = snapshot.commissionGrossTotal;
  closing.deflatorTotal = snapshot.deflatorTotal;
  closing.estornosTotal = snapshot.estornosTotal;
  closing.commissionFinalTotal = snapshot.commissionFinalTotal;
  return closing;
}

function updateClosingAdjustment(target) {
  const campaign = activeCampaign();
  const closing = closingForCampaign(campaign);
  if (!campaign || !closing || closingIsOfficial(closing)) {
    alert("O fechamento oficial esta congelado e nao permite alterar estornos.");
    renderAdminClosingPanel();
    return;
  }
  const sellerId = target.dataset.sellerId || "";
  const field = target.dataset.closingAdjustment;
  const snapshot = closingSnapshotForDisplay(campaign, closing);
  const row = snapshot?.sellers?.find((item) => item.sellerId === sellerId);
  if (!row || !field) return;
  if (Number(target.value) < 0) {
    alert("Estornos negativos nao sao permitidos.");
    target.value = "0";
  }
  row[`estorno${field[0].toUpperCase()}${field.slice(1)}`] = moneyInputValue(target.value);
  updateClosingFromSnapshot(closing, snapshot);
  logUpdate({
    action: "Lancou ou alterou estorno",
    module: "Fechamento",
    campaignId: campaign.id,
    campaignName: campaign.name,
    itemId: sellerId,
    itemName: row.name,
    field: `Estorno ${field}`,
    newValue: discountMoney(row.estornosTotal),
    message: `Admin atualizou estornos do fechamento para ${row.name}.`,
  });
  saveState("Estorno do fechamento atualizado");
  renderAdminClosingPanel();
}

function validateClosingSnapshot(snapshot, campaign = activeCampaign(), partial = null) {
  const errors = [];
  const warnings = [];
  const daysDone = Number(snapshot?.daysDone ?? state.period?.daysDone);
  const daysTotal = Number(snapshot?.daysTotal ?? state.period?.daysTotal);
  if (!campaign) errors.push("campanha nao selecionada");
  if (!partial && !snapshot?.basePartialId) errors.push("base de fechamento nao carregada");
  if (!Array.isArray(snapshot?.sellers) || !snapshot.sellers.length) errors.push("resultado por vendedor vazio");
  if (!Number.isFinite(daysDone) || daysDone <= 0) errors.push("dias realizados oficiais nao configurados");
  if (!Number.isFinite(daysTotal) || daysTotal <= 0) errors.push("dias uteis oficiais nao configurados");
  if (Number.isFinite(daysDone) && Number.isFinite(daysTotal) && daysDone > daysTotal) errors.push("dias realizados maiores que dias uteis");
  const numericFields = ["commissionGrossTotal", "deflatorTotal", "estornosTotal", "commissionFinalTotal", "totalGoal", "totalRealized", "totalProjected"];
  for (const field of numericFields) {
    if (!Number.isFinite(Number(snapshot?.[field] ?? 0))) errors.push(`valor invalido em ${field}`);
  }
  for (const row of snapshot?.sellers || []) {
    for (const field of ["commissionGross", "deflator", "deflatorImpact", "estornosTotal", "commissionFinal"]) {
      if (!Number.isFinite(Number(row?.[field] ?? 0))) errors.push(`valor invalido em ${row?.name || "vendedor"} (${field})`);
    }
    for (const field of ["estornoQuality", "estornoInsurance", "estornoCarousel"]) {
      if (!Number.isFinite(Number(row?.[field] ?? 0)) || Number(row?.[field] ?? 0) < 0) errors.push(`estorno invalido em ${row?.name || "vendedor"}`);
    }
    for (const indicator of row.indicators || []) {
      for (const field of ["realized", "commission"]) {
        if (!Number.isFinite(Number(indicator?.[field] ?? 0))) errors.push(`valor invalido em ${indicator?.metric || "indicador"}`);
      }
      for (const field of ["goal", "currentPercent", "projected", "projectedPercent", "missing"]) {
        const value = indicator?.[field];
        if (value !== null && value !== undefined && value !== "" && !Number.isFinite(Number(value))) errors.push(`calculo invalido em ${indicator?.metric || "indicador"} (${field})`);
      }
      if (indicator.participaAtingimento && metricTypeKind(indicator) === "informativo") warnings.push(`${indicator.metric} esta informativo, mas marcado para compor atingimento.`);
    }
  }
  return { ok: errors.length === 0, errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

function startClosingFromLatestPartial() {
  const campaign = activeCampaign();
  if (!requireAdminAction("startOfficialClosing", "Fechamento")) return;
  if (!campaign) {
    alert("Selecione uma campanha para iniciar o fechamento.");
    return;
  }
  if (isCampaignOfficialClosed(campaign) || officialClosingForCampaign(campaign)) {
    alert("Esta campanha ja possui fechamento oficial. Os dados estao em modo consulta.");
    return;
  }
  const partial = latestPublishedPartial(campaign);
  if (!partial) {
    logUpdate({
      status: "Erro",
      action: "Tentou iniciar fechamento sem parcial publicada",
      module: "Fechamento",
      campaignId: campaign.id,
      campaignName: campaign.name,
      message: "Nao ha parcial publicada para usar como base do fechamento.",
    }, { persist: true });
    alert("Nao e possivel fechar: nao ha parcial publicada para esta campanha.");
    return;
  }
  const existing = closingForCampaign(campaign);
  if (existing && !closingIsOfficial(existing) && !criticalConfirm("Ja existe um fechamento em conferencia para esta campanha. Deseja recarregar a base usando a ultima parcial publicada?")) return;
  syncActiveCampaignFromRoot();
  const snapshot = buildClosingSnapshotFromPartial(campaign, partial, {
    status: CLOSING_STATUS.REVIEW,
    baseType: CLOSING_BASE.LATEST_PARTIAL,
    createdAt: existing?.createdAt || new Date().toISOString(),
    createdBy: existing?.createdBy || currentAuditProfile(),
  });
  const closing = closingDraftFromSnapshot(campaign, partial, snapshot, existing || {});
  replaceCampaignReviewClosing(campaign, closing);
  logUpdate({
    action: "Iniciou fechamento oficial",
    module: "Fechamento",
    campaignId: campaign.id,
    campaignName: campaign.name,
    itemId: closing.id,
    itemName: campaign.name,
    newValue: CLOSING_STATUS.REVIEW,
    message: `Fechamento oficial iniciado para a campanha ${campaign.name}.`,
  });
  logUpdate({
    action: "Usou ultima parcial publicada como base",
    module: "Fechamento",
    campaignId: campaign.id,
    campaignName: campaign.name,
    itemId: partial.id,
    itemName: partial.name,
    newValue: CLOSING_STATUS.REVIEW,
    message: `Fechamento da campanha ${campaign.name} carregado em conferencia com base na ${partial.name}.`,
  });
  saveState("Fechamento em conferencia");
  renderAll();
}

function closingSnapshotFileName(campaign, snapshot) {
  return campaignFileName(campaign, snapshot).replace("Comissao_360_Comissionamento_", "Comissao_360_Fechamento_");
}

function officialCloseActiveCampaign() {
  const campaign = activeCampaign();
  if (!requireAdminAction("closeOfficialCampaign", "Fechamento")) return;
  if (!campaign) return;
  if (isCampaignOfficialClosed(campaign) || officialClosingForCampaign(campaign)) {
    alert("Esta campanha ja esta fechada oficialmente.");
    return;
  }
  const closing = closingForCampaign(campaign);
  if (!closing || closingIsOfficial(closing)) {
    alert("Nao e possivel fechar: nenhuma base de fechamento foi carregada.");
    return;
  }
  const closingStatus = normalizeClosingStatus(closing.status);
  if (![CLOSING_STATUS.REVIEW, CLOSING_STATUS.READY].includes(closingStatus)) {
    alert("Nao e possivel fechar: carregue ou revise a base de fechamento antes de concluir.");
    return;
  }
  const partial = closingBasePartial(closing, campaign);
  if (!partial) {
    alert("Nao e possivel fechar: nao ha parcial publicada para esta campanha.");
    return;
  }
  const closedAt = new Date().toISOString();
  const closedBy = currentAuditProfile();
  const snapshot = recalculateClosingSnapshotTotals(closingSnapshotForDisplay(campaign, closing));
  if (!snapshot) {
    alert("Nao e possivel fechar: resultado final nao foi carregado.");
    return;
  }
  snapshot.status = CLOSING_STATUS.AWAITING_EXTRACTS;
  snapshot.closedAt = closedAt;
  snapshot.closedBy = closedBy;
  snapshot.createdAt = snapshot.createdAt || closing.createdAt;
  snapshot.createdBy = snapshot.createdBy || closing.createdBy;
  snapshot.baseType = snapshot.baseType || CLOSING_BASE.LATEST_PARTIAL;
  snapshot.basePartialId = snapshot.basePartialId || partial.id;
  snapshot.basePartialNumber = snapshot.basePartialNumber || partial.number;
  snapshot.basePartialName = snapshot.basePartialName || partial.name;
  snapshot.baseDate = snapshot.baseDate || partial.baseDate;
  if (snapshot.campaign) snapshot.campaign.status = CAMPAIGN_STATUS.OFFICIAL_CLOSED;
  const validation = validateClosingSnapshot(snapshot, campaign, partial);
  if (!validation.ok) {
    logUpdate({
      status: "Erro",
      action: "Validacao de fechamento bloqueou conclusao",
      module: "Fechamento",
      campaignId: campaign.id,
      campaignName: campaign.name,
      itemId: closing.id,
      itemName: closing.basePartialName,
      message: `Nao foi possivel fechar: ${validation.errors.join("; ")}.`,
    }, { persist: true });
    alert(`Nao e possivel fechar:\n- ${validation.errors.join("\n- ")}`);
    return;
  }
  logUpdate({
    action: "Validou fechamento",
    module: "Fechamento",
    campaignId: campaign.id,
    campaignName: campaign.name,
    itemId: closing.id,
    itemName: closing.basePartialName,
    message: `Fechamento da campanha ${campaign.name} validado sem inconsistencias criticas.`,
  });
  const message = [
    "Voce esta fechando oficialmente o comissionamento desta campanha.",
    "",
    `Campanha: ${campaign.name}`,
    `Mes/ano: ${campaign.reference || state.period.month}`,
    `Base: ${partial.name} - ${partial.baseDate || "-"}`,
    `Vendedores: ${snapshot.totalSellers}`,
    `Filiais: ${snapshot.totalBranches}`,
    `Comissao bruta: ${money.format(snapshot.commissionGrossTotal)}`,
    `Deflatores: ${money.format(snapshot.deflatorTotal)}`,
    `Estornos: ${discountMoney(snapshot.estornosTotal)}`,
    `Comissao final: ${money.format(snapshot.commissionFinalTotal)}`,
    "",
    "Apos confirmar, os resultados serao congelados e nao poderao ser alterados por edicoes comuns de metas, vendedores, parciais ou simulacoes. Deseja continuar?",
  ].join("\n");
  if (!confirm(message)) return;
  const finalized = closingDraftFromSnapshot(campaign, partial, snapshot, {
    ...closing,
    status: CLOSING_STATUS.AWAITING_EXTRACTS,
    closedAt,
    closedBy,
    snapshot,
  });
  finalized.status = CLOSING_STATUS.AWAITING_EXTRACTS;
  finalized.closedAt = closedAt;
  finalized.closedBy = closedBy;
  finalized.snapshot = snapshot;
  finalized.totals = closingTotalsFromSnapshot(snapshot);
  finalized.sellerResults = cloneData(snapshot.sellers || []);
  finalized.indicatorResults = cloneData(snapshot.indicators || []);
  finalized.deflators = snapshot.sellers?.filter((row) => row.deflatorImpact).map((row) => ({ sellerId: row.sellerId, seller: row.name, value: row.deflatorImpact, reason: row.deflatorReason })) || [];
  finalized.estornos = snapshot.sellers?.filter((row) => row.estornosTotal).map((row) => ({ sellerId: row.sellerId, seller: row.name, total: row.estornosTotal })) || [];
  finalized.commissionGrossTotal = snapshot.commissionGrossTotal;
  finalized.deflatorTotal = snapshot.deflatorTotal;
  finalized.estornosTotal = snapshot.estornosTotal;
  finalized.commissionFinalTotal = snapshot.commissionFinalTotal;
  replaceCampaignReviewClosing(campaign, finalized);
  campaign.snapshot = snapshot;
  campaign.status = CAMPAIGN_STATUS.OFFICIAL_CLOSED;
  campaign.closedAt = closedAt;
  campaign.officialCloseDate = campaign.officialCloseDate || closedAt.slice(0, 10);
  campaign.officialFileName = closingSnapshotFileName(campaign, snapshot);
  campaign.officialFileCsv = generateOfficialCommissionCsv(snapshot);
  campaign.updatedAt = closedAt;
  activeClosingSellerDetailId = "";
  logUpdate({
    action: "Fechou comissionamento oficial",
    module: "Fechamento",
    campaignId: campaign.id,
    campaignName: campaign.name,
    itemId: finalized.id,
    itemName: finalized.basePartialName,
    newValue: `Comissao final total: ${money.format(snapshot.commissionFinalTotal)}`,
    message: `Comissionamento da campanha ${campaign.name} fechado oficialmente. Extratos aguardam publicacao futura.`,
  });
  saveState("Fechamento oficial concluido");
  renderAll();
}

function publishOfficialExtracts() {
  const campaign = activeCampaign();
  if (!requireAdminAction("publishOfficialExtracts", "Fechamento")) return;
  if (!campaign) {
    alert("Selecione uma campanha para publicar os extratos.");
    return;
  }
  const closing = officialClosingForCampaign(campaign);
  if (!closing || !closingIsOfficial(closing)) {
    alert("Feche oficialmente a campanha antes de publicar os extratos.");
    return;
  }
  if (closingExtractsPublished(closing)) {
    alert("Os extratos oficiais ja foram publicados para esta campanha.");
    return;
  }
  const snapshot = closingSnapshotForDisplay(campaign, closing);
  if (!snapshot || !Array.isArray(snapshot.sellers) || !snapshot.sellers.length) {
    alert("Nao foi possivel publicar: snapshot oficial sem resultados de vendedores.");
    return;
  }
  const message = [
    "Voce esta publicando os extratos oficiais desta campanha para os vendedores.",
    "",
    `Campanha: ${campaign.name}`,
    `Fechamento: ${closing.basePartialName || snapshot.basePartialName || "-"}`,
    `Vendedores com extrato: ${snapshot.sellers.length}`,
    "",
    "Apos publicados, cada vendedor podera consultar seu resultado oficial fechado na tela Colaborador. Deseja continuar?",
  ].join("\n");
  if (!confirm(message)) return;
  const publishedAt = new Date().toISOString();
  const publishedBy = currentAuditProfile();
  snapshot.status = CLOSING_STATUS.PUBLISHED;
  snapshot.publishedAt = publishedAt;
  snapshot.publishedBy = publishedBy;
  const finalClosing = normalizeClosing({
    ...closing,
    status: CLOSING_STATUS.PUBLISHED,
    publishedAt,
    publishedBy,
    snapshot,
  });
  updateClosingFromSnapshot(finalClosing, snapshot);
  finalClosing.status = CLOSING_STATUS.PUBLISHED;
  finalClosing.publishedAt = publishedAt;
  finalClosing.publishedBy = publishedBy;
  finalClosing.snapshot.status = CLOSING_STATUS.PUBLISHED;
  finalClosing.snapshot.publishedAt = publishedAt;
  finalClosing.snapshot.publishedBy = publishedBy;
  replaceClosingById(finalClosing);
  campaign.snapshot = cloneData(finalClosing.snapshot);
  campaign.status = CAMPAIGN_STATUS.OFFICIAL_CLOSED;
  campaign.officialFileName = closingSnapshotFileName(campaign, finalClosing.snapshot);
  campaign.officialFileCsv = generateOfficialCommissionCsv(finalClosing.snapshot);
  campaign.updatedAt = publishedAt;
  logUpdate({
    action: "Publicou extratos oficiais",
    module: "Fechamento",
    campaignId: campaign.id,
    campaignName: campaign.name,
    itemId: finalClosing.id,
    itemName: finalClosing.basePartialName || campaign.name,
    newValue: CLOSING_STATUS.PUBLISHED,
    message: `Extratos oficiais da campanha ${campaign.name} publicados para vendedores.`,
  });
  saveState("Extratos oficiais publicados");
  renderAll();
}

function operationalCloseCampaign(campaign = activeCampaign(), module = "Fechamento") {
  if (!requireAdminAction("closeOperationalCampaign", module)) return;
  if (!campaign) {
    alert("Selecione uma campanha para congelar.");
    return;
  }
  const targetCampaign = state.campaigns.find((item) => item.id === campaign.id) || campaign;
  const previousStatus = campaignStatusLabel(targetCampaign);
  if (isCampaignOfficialClosed(targetCampaign) || officialClosingForCampaign(targetCampaign)) {
    const message = "Campanha fechada oficialmente nao pode ser congelada por este fluxo.";
    logUpdate({
      status: "Bloqueado",
      action: "Tentou congelar campanha fechada oficialmente",
      module,
      campaignId: targetCampaign.id,
      campaignName: targetCampaign.name,
      itemName: targetCampaign.name,
      previousValue: previousStatus,
      newValue: previousStatus,
      message,
    }, { persist: true });
    alert(message);
    return;
  }
  if (previousStatus !== CAMPAIGN_STATUS.OPEN) {
    const message = "Somente campanhas abertas podem ser congeladas operacionalmente.";
    logUpdate({
      status: "Bloqueado",
      action: "Tentou congelar campanha em status nao permitido",
      module,
      campaignId: targetCampaign.id,
      campaignName: targetCampaign.name,
      itemName: targetCampaign.name,
      previousValue: previousStatus,
      newValue: previousStatus,
      message,
    }, { persist: true });
    alert(message);
    return;
  }
  if (!criticalConfirm("Voce esta encerrando esta campanha para operacao. Vendedores e filiais nao poderao mais alterar ou simular resultados desta campanha. Deseja continuar?", { backup: true })) return;
  if (targetCampaign.id === state.activeCampaignId) syncActiveCampaignFromRoot();
  const liveCampaign = state.campaigns.find((item) => item.id === targetCampaign.id) || targetCampaign;
  liveCampaign.status = CAMPAIGN_STATUS.OPERATIONAL_CLOSED;
  liveCampaign.operationalCloseDate = liveCampaign.operationalCloseDate || new Date().toISOString().slice(0, 10);
  liveCampaign.updatedAt = new Date().toISOString();
  logUpdate({
    action: "Encerrou campanha operacionalmente",
    module,
    campaignId: liveCampaign.id,
    campaignName: liveCampaign.name,
    itemName: liveCampaign.name,
    previousValue: previousStatus,
    newValue: liveCampaign.status,
    message: `Campanha ${liveCampaign.name} encerrada operacionalmente.`,
  });
  saveState("Campanha encerrada operacionalmente");
  renderAll();
}

function reopenOperationalCampaign(campaign = activeCampaign(), module = "Fechamento") {
  if (!requireAdminAction("reopenOperationalCampaign", module)) return;
  if (!campaign) {
    alert("Selecione uma campanha para descongelar.");
    return;
  }
  const targetCampaign = state.campaigns.find((item) => item.id === campaign.id) || campaign;
  const previousStatus = campaignStatusLabel(targetCampaign);
  if (isCampaignOfficialClosed(targetCampaign) || officialClosingForCampaign(targetCampaign) || closingExtractsPublished(closingForCampaign(targetCampaign))) {
    const message = "Esta campanha ja possui fechamento oficial. Para corrigir um fechamento oficial, sera necessario um fluxo controlado de reabertura, que nao faz parte desta correcao.";
    logUpdate({
      status: "Bloqueado",
      action: "Tentou descongelar campanha fechada oficialmente",
      module,
      campaignId: targetCampaign.id,
      campaignName: targetCampaign.name,
      itemName: targetCampaign.name,
      previousValue: previousStatus,
      newValue: previousStatus,
      message,
    }, { persist: true });
    alert(message);
    return;
  }
  if (!canReopenOperationalCampaign(targetCampaign)) {
    const message = previousStatus === CAMPAIGN_STATUS.OPEN
      ? "A campanha ja esta aberta."
      : "O status atual da campanha nao permite descongelamento operacional.";
    logUpdate({
      status: "Bloqueado",
      action: "Tentou descongelar campanha em status nao permitido",
      module,
      campaignId: targetCampaign.id,
      campaignName: targetCampaign.name,
      itemName: targetCampaign.name,
      previousValue: previousStatus,
      newValue: previousStatus,
      message,
    }, { persist: true });
    alert(message);
    return;
  }
  const reviewClosings = closingsForCampaign(targetCampaign).filter((closing) => !closingIsOfficial(closing) && normalizeClosingStatus(closing.status) !== CLOSING_STATUS.NOT_STARTED);
  const confirmLines = [
    "Voce esta descongelando esta campanha. Ela voltara para o status Aberta e podera receber ajustes operacionais novamente. Parciais, metas, vendedores e estornos ja cadastrados serao mantidos. Deseja continuar?",
  ];
  if (campaignHasPublishedPartial(targetCampaign)) {
    confirmLines.push("", "Esta campanha possui parciais publicadas. Elas serao mantidas no historico.");
  }
  if (reviewClosings.length) {
    confirmLines.push("", "Existe fechamento em conferencia. Ao descongelar, revise se a base de fechamento ainda deve ser mantida ou recarregada.");
  }
  if (!criticalConfirm(confirmLines.join("\n"))) return;
  if (targetCampaign.id === state.activeCampaignId) syncActiveCampaignFromRoot();
  const liveCampaign = state.campaigns.find((item) => item.id === targetCampaign.id) || targetCampaign;
  const now = new Date().toISOString();
  liveCampaign.status = CAMPAIGN_STATUS.OPEN;
  liveCampaign.operationalCloseDate = "";
  liveCampaign.updatedAt = now;
  for (const closing of reviewClosings) {
    closing.status = CLOSING_STATUS.NOT_STARTED;
    closing.reopenedAt = now;
    closing.reopenedBy = currentAuditProfile();
  }
  logUpdate({
    action: "Descongelou campanha",
    module,
    campaignId: liveCampaign.id,
    campaignName: liveCampaign.name,
    itemName: liveCampaign.name,
    previousValue: previousStatus,
    newValue: liveCampaign.status,
    message: `Campanha ${liveCampaign.name} descongelada e reaberta para operacao.`,
  });
  saveState("Campanha descongelada");
  renderAll();
}

function branches() {
  state.branches = normalizeBranches(state.branches, state.sellers);
  return state.branches;
}

function visibleSellers() {
  return state.sellers.filter((seller) => {
    const areaOk = activeAreaFilter === "Todas" || seller.area === activeAreaFilter;
    const branchOk = activeBranchFilter === "Todas" || seller.branch === activeBranchFilter;
    return areaOk && branchOk;
  });
}

function sellerAttainment(seller) {
  return totalAttainmentForSellers([seller], "projected");
}

function metricAttainmentRows(sellers) {
  const rows = [];
  for (const seller of sellers) {
    for (const metric of metricsFor(seller.area).filter(metricParticipates)) {
      const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
      const goal = metricGoalForSeller(seller, metric);
      const realized = finiteNumber(value.realized);
      const projectedValue = projectionForPeriod(value.realized);
      if (!goal) continue;
      const projectedPercent = projectedValue === null ? null : projectedValue / goal;
      const currentPercent = realized / goal;
      rows.push({
        seller,
        metric,
        percent: projectedPercent ?? currentPercent,
        currentPercent,
        projectedPercent,
        goal,
        realized,
        projected: projectedValue,
      });
    }
  }
  return rows;
}

function sellerRankCard(seller, index, cls = "") {
  const attainment = sellerAttainment(seller);
  const result = sellerResult(seller);
  const status = statusFor(seller);
  return `<div class="rank-card ${cls}">
    <strong>${index + 1}. ${escapeHtml(seller.name)}</strong><br>
    <span>${escapeHtml(seller.branch)} - ${escapeHtml(seller.area)} - ${formatPercent(attainment)} - ${money.format(result.projected)} - <span class="status ${status.cls}">${status.label}</span></span>
  </div>`;
}

function renderAchievementBars(sellers) {
  const container = document.getElementById("achievementBars");
  if (!container) return;
  const highlights = [...sellers]
    .filter((seller) => (sellerAttainment(seller) ?? -1) >= 1)
    .sort((a, b) => sellerAttainment(b) - sellerAttainment(a));
  container.innerHTML = highlights.map((seller, index) => sellerRankCard(seller, index, "ok-card")).join("") || `<p class="muted-note">Nenhum vendedor com meta batida no filtro atual.</p>`;
}

function renderDashboardInsights(sellers) {
  const offendersContainer = document.getElementById("insightList");
  const goals = document.getElementById("goalOffenderList");
  if (!offendersContainer || !goals) return;

  const offenders = [...sellers]
    .filter((seller) => sellerAttainment(seller) !== null && sellerAttainment(seller) < 1)
    .sort((a, b) => sellerAttainment(a) - sellerAttainment(b));
  offendersContainer.innerHTML = offenders.map((seller, index) => sellerRankCard(seller, index, "bad-card")).join("") || `<p class="muted-note">Todos os vendedores do filtro bateram meta.</p>`;

  const rows = criticalGoalRows(sellers).slice(0, 20);
  goals.innerHTML = rows.map((row, index) => `<div class="rank-card bad-card critical-goal-card">
    <strong>${index + 1}. ${escapeHtml(row.metricName)} (${escapeHtml(row.area)})</strong>
    <span class="critical-count">${row.sellerCount} vendedor${row.sellerCount === 1 ? "" : "es"} abaixo</span>
    <span>Ating. medio ${pct.format(row.percent)} | Falta total ${num.format(row.missing)} | Meta total ${num.format(row.goal)} | Proj. total ${num.format(row.projected)}</span>
  </div>`).join("") || `<p class="muted-note">Sem indicadores críticos no filtro atual.</p>`;
}

function criticalGoalRows(sellers) {
  const grouped = new Map();
  for (const row of metricAttainmentRows(sellers)) {
    const goal = validGoalValue(row.goal);
    const projectedValue = row.projected === null ? null : Number(row.projected);
    const percent = effectiveAttainmentPercent(row);
    if (!goal || percent === null) continue;
    if (percent >= 0.8) continue;
    const referenceValue = projectedValue === null || !Number.isFinite(projectedValue) ? finiteNumber(row.realized) : projectedValue;
    const key = `${row.seller.area}::${row.metric.id}`;
    const current = grouped.get(key) || {
      area: row.seller.area,
      metricName: row.metric.name,
      sellerCount: 0,
      goal: 0,
      realized: 0,
      projected: 0,
      missing: 0,
    };
    current.sellerCount += 1;
    current.goal += goal;
    current.realized += Number(row.realized) || 0;
    current.projected += referenceValue;
    current.missing += Math.max(goal - referenceValue, 0);
    grouped.set(key, current);
  }
  return [...grouped.values()]
    .map((row) => ({ ...row, percent: row.goal ? row.projected / row.goal : 0 }))
    .sort((a, b) => {
      const gap = (1 - b.percent) - (1 - a.percent);
      return gap || b.sellerCount - a.sellerCount || b.missing - a.missing;
    });
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

function downloadFile(filename, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    link.remove();
  }, 0);
}

function exportDashboardExcel() {
  const sellers = typeof dashboardSellers === "function" ? dashboardSellers() : visibleSellers();
  const rows = sellers.map((seller) => {
    const result = typeof dashboardSellerSummaryResult === "function" ? dashboardSellerSummaryResult(seller) : sellerResult(seller);
    const currentPercent = result.currentPercent ?? totalAttainmentForSellers([seller], "current");
    const projectedPercent = result.projectedPercent ?? totalAttainmentForSellers([seller], "projected");
    const projectedNoDeflator = result.projectedNoDeflator ?? result.projectedSubtotal ?? result.projected;
    const deflator = result.deflator ?? result.projectedDeflator ?? 0;
    const estornos = result.estornos ?? result.adjustments ?? 0;
    const finalProjected = result.finalProjected ?? result.projected;
    const status = typeof dashboardStatusFromPercent === "function" ? dashboardStatusFromPercent(currentPercent) : statusFor(seller);
    return `<tr><td>${escapeHtml(seller.name)}</td><td>${escapeHtml(seller.branch)}</td><td>${escapeHtml(seller.area)}</td><td>${money.format(result.current)}</td><td>${formatPercent(currentPercent)}</td><td>${money.format(projectedNoDeflator)}</td><td>${formatPercent(projectedPercent)}</td><td>${money.format(deflator)}</td><td>${discountMoney(estornos)}</td><td>${money.format(finalProjected)}</td><td>${escapeHtml(status.label)}</td></tr>`;
  }).join("");
  const html = `<html><head><meta charset="UTF-8"></head><body><table><thead><tr><th>Vendedor</th><th>Filial</th><th>Area</th><th>Atual</th><th>% atual</th><th>Comissao bruta</th><th>% projetado</th><th>Deflator</th><th>Estornos</th><th>Comissao estimada</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  downloadFile(`resultado-vendedores-${new Date().toISOString().slice(0, 10)}.xls`, "application/vnd.ms-excel;charset=utf-8", html);
  logUpdate({ action: "Exportou resultado por vendedor", module: "Dashboard", message: "Relatorio do Dashboard exportado em Excel." }, { persist: true });
}

function exportCriticalGoalsExcel() {
  const rows = criticalGoalRows(typeof dashboardSellers === "function" ? dashboardSellers() : visibleSellers()).map((row) => `<tr><td>${escapeHtml(row.metricName)}</td><td>${escapeHtml(row.area)}</td><td>${row.sellerCount}</td><td>${num.format(row.goal)}</td><td>${num.format(row.realized)}</td><td>${num.format(row.projected)}</td><td>${pct.format(row.percent)}</td><td>${num.format(row.missing)}</td></tr>`).join("");
  const html = `<html><head><meta charset="UTF-8"></head><body><table><thead><tr><th>Indicador</th><th>Area</th><th>Vendedores abaixo</th><th>Meta total</th><th>Realizado total</th><th>Projetado total</th><th>Atingimento medio</th><th>Falta total</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  downloadFile(`metas-criticas-${new Date().toISOString().slice(0, 10)}.xls`, "application/vnd.ms-excel;charset=utf-8", html);
  logUpdate({ action: "Exportou metas criticas", module: "Dashboard", message: "Metas criticas exportadas em Excel." }, { persist: true });
}
function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function csvMoney(value) {
  return money.format(Number(value) || 0).replace(/\u00a0/g, " ");
}

function csvDiscountMoney(value) {
  return discountMoney(value).replace(/\u00a0/g, " ");
}

function downloadGoalTemplateCsv() {
  const lines = [["vendedor", "filial", "area", "metrica", "meta", "realizado"]];
  for (const seller of state.sellers) {
    ensureSellerValues(seller);
    for (const metric of metricsFor(seller.area)) {
      const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
      lines.push([seller.name, seller.branch, seller.area, metric.name, value.goal, value.realized]);
    }
  }
  downloadFile("modelo-metas-comissao.csv", "text/csv;charset=utf-8", lines.map((line) => line.map(csvCell).join(";")).join("\n"));
  logUpdate({ action: "Baixou modelo CSV", module: "Importacao e Backup", message: "Modelo CSV de metas baixado." }, { persist: true });
}

function parseCsv(text) {
  const separator = text.includes(";") ? ";" : ",";
  return text.trim().split(/\r?\n/).map((line) => line.split(separator).map((cell) => cell.trim().replace(/^"|"$/g, "").replace(/""/g, '"')));
}

async function readCsvFileText(file) {
  const buffer = await file.arrayBuffer();
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch (error) {
    return new TextDecoder("windows-1252").decode(buffer);
  }
}

function normalizedKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function metricAliasKey(value) {
  const key = normalizedKey(value)
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\bmeta\b/g, " ")
    .replace(/\bde\b/g, " ")
    .replace(/\bquitados\b/g, "qtde")
    .replace(/\bqtd(e)?\b/g, "qtde")
    .replace(/\bfidelizacao\b/g, "fidel")
    .replace(/\bfidelidade\b/g, "fidel")
    .replace(/\s+/g, " ")
    .trim();
  if (key === "bl" || key === "banda" || key === "banda larga") return "banda larga";
  if (key === "gross receita" || key === "receita gross" || key === "gross r" || key === "gross rs") return "gross";
  if (key === "gross volume" || key === "volume gross" || key === "volume de gross") return "gross volume";
  if (key === "aparelho receita" || key === "aparelhos receita" || key === "receita aparelho" || key === "receita aparelhos" || key === "valor aparelhos" || key === "valor aparelho" || key === "faturamento aparelhos" || key === "faturamento aparelho" || key === "receita") return "aparelhos receita";
  if (key === "aparelho" || key === "aparelhos" || key === "aparelho qtde" || key === "aparelhos qtde" || key === "aparelho qtd" || key === "aparelhos qtd" || key === "volume aparelho" || key === "volume aparelhos" || key === "aparelho volume" || key === "aparelhos volume" || key === "quantidade aparelho" || key === "quantidade aparelhos") return "aparelhos qtde";
  if (key === "pelicula") return "peliculas";
  if (key === "acessorio") return "acessorios";
  if (key === "seguro") return "seguros";
  if (key === "fidel" || key === "fidel aparelho" || key === "fidel aparelhos") return "fidel aparelho";
  return key;
}

function metricComparableKeys(value) {
  const full = normalizedKey(value).replace(/\s+/g, " ").trim();
  const alias = metricAliasKey(value);
  const compact = full.replace(/\s+/g, "");
  return new Set([full, alias, compact].filter(Boolean));
}

function metricNameMatches(metric, metricName) {
  const metricKeys = new Set([
    ...metricComparableKeys(metric?.name || ""),
    ...metricComparableKeys(metric?.importKey || ""),
    ...metricComparableKeys(metric?.id || ""),
  ]);
  const importedKeys = metricComparableKeys(metricName);
  for (const key of importedKeys) if (metricKeys.has(key)) return true;
  return false;
}

function findMetricByImportedName(area, metricName, options = {}) {
  const metrics = metricsFor(area, state, options);
  const importedFull = normalizedKey(metricName).replace(/\s+/g, " ").trim();
  const importedAlias = metricAliasKey(metricName);
  return metrics.find((metric) => normalizedKey(metric.name).replace(/\s+/g, " ").trim() === importedFull)
    || metrics.find((metric) => metric.importKey && normalizedKey(metric.importKey).replace(/\s+/g, " ").trim() === importedFull)
    || metrics.find((metric) => metricAliasKey(metric.name || metric.id) === importedAlias)
    || metrics.find((metric) => metric.importKey && metricAliasKey(metric.importKey) === importedAlias)
    || metrics.find((metric) => metricNameMatches(metric, metricName))
    || null;
}

function parseImportedNumber(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  if (raw.includes(",")) return Number(raw.replace(/\./g, "").replace(",", ".")) || 0;
  if (/^-?\d{1,3}(\.\d{3})+$/.test(raw)) return Number(raw.replace(/\./g, "")) || 0;
  return Number(raw.replace(",", ".")) || 0;
}

function isValidImportedNumber(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return false;
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(normalized);
}

function normalizeAreaName(value) {
  const key = normalizedKey(value);
  return key === "cabo" ? "Cabo" : "Nao Cabo";
}

function metricTypeFromName(name) {
  const key = metricAliasKey(name);
  if (key === "aparelhos receita") return "deviceRevenue";
  if (key === "aparelhos qtde") return "deviceQty";
  if (key === "gross volume") return "unit100";
  if (["gross", "peliculas", "acessorios", "delta", "fidel aparelho"].includes(key)) return "revenue";
  return "unit100";
}

function shouldIgnoreImportedMetric(area, metricName) {
  const areaKey = normalizedKey(area);
  const metricKey = normalizedKey(metricName);
  return areaKey === "nao cabo" && (metricKey === "banda larga" || metricKey === "bl" || metricKey === "combo");
}
function findOrCreateMetric(area, metricName, goalValue) {
  state.customMetrics = normalizeCustomMetrics(state.customMetrics);
  let metric = findMetricByImportedName(area, metricName);
  if (metric) return metric;
  const id = `custom_${makeId()}`;
  metric = {
    id,
    name: metricName.trim(),
    unit: metricTypeFromName(metricName) === "revenue" || metricTypeFromName(metricName) === "deviceRevenue" ? "R$" : "Qtd.",
    type: metricTypeFromName(metricName),
    goal: parseImportedNumber(goalValue),
  };
  Object.assign(metric, metricClassification(metric));
  state.customMetrics[area] = state.customMetrics[area] || [];
  state.customMetrics[area].push(metric);
  ensureMetricOrder(area);
  if (!state.metricOrder[area].includes(id)) state.metricOrder[area].push(id);
  syncCustomMetricSortOrder(area);
  state.rules[area] = state.rules[area] || {};
  state.rules[area][id] = [];
  return metric;
}

function findOrCreateSeller(name, branch, area) {
  const sellerKey = normalizedKey(name);
  const branchKey = normalizedKey(branch);
  area = normalizeAreaName(area);
  let seller = state.sellers.find((item) => normalizedKey(item.name) === sellerKey && normalizedKey(item.branch) === branchKey);
  if (seller) {
    if (seller.area !== area) {
      seller.area = area;
      ensureSellerValues(seller);
    }
    return seller;
  }
  seller = { id: makeId(), name: name.trim(), branch: branch.trim(), area, adjustments: { quality: 0, insurance: 0, carousel: 0 }, password: "1234", emExperiencia: false, values: {} };
  state.sellers.push(seller);
  ensureSellerValues(seller);
  return seller;
}

function resetCampaignDataForGoalImport() {
  state.sellers = [];
  state.branches = [];
  state.branchPasswords = {};
  state.metricCatalog = normalizeMetricCatalog();
  state.customMetrics = { Cabo: [], "Nao Cabo": [] };
  state.metricOrder = {
    Cabo: areaMetrics.Cabo.map((metric) => metric.id),
    "Nao Cabo": areaMetrics["Nao Cabo"].map((metric) => metric.id),
  };
  clearCollaboratorSession();
  activeManagerSellerId = "";
  activeBranchSession = "";
  sessionStorage.removeItem(BRANCH_SESSION_KEY);
}

function importGoalTemplateCsv(text) {
  const rows = parseCsv(text);
  const header = rows.shift()?.map((item) => normalizedKey(item.replace(/^\uFEFF/, ""))) || [];
  const index = (name) => header.indexOf(normalizedKey(name));
  for (const required of ["vendedor", "filial", "metrica"]) {
    if (index(required) < 0) throw new Error(`Coluna obrigatoria ausente no CSV: ${required}.`);
  }
  const importRows = [];
  let ignoredRows = 0;
  for (const row of rows) {
    const sellerName = row[index("vendedor")] || "";
    const branch = row[index("filial")] || "";
    const area = normalizeAreaName(row[index("area")] || "Nao Cabo");
    const metricName = row[index("metrica")] || "";
    const goalValue = row[index("meta")];
    const realizedValue = row[index("realizado")];
    if (!sellerName || !branch || !metricName) continue;
    if (shouldIgnoreImportedMetric(area, metricName)) {
      ignoredRows += 1;
      continue;
    }
    importRows.push({ sellerName, branch, area, metricName, goalValue, realizedValue });
  }
  if (!importRows.length) throw new Error("Nenhuma linha valida encontrada para importar.");
  resetCampaignDataForGoalImport();
  let updated = 0;
  let createdSellers = 0;
  let createdBranches = 0;
  let createdMetrics = 0;
  for (const { sellerName, branch, area, metricName, goalValue, realizedValue } of importRows) {
    const branchExists = state.branches.some((item) => normalizedKey(item) === normalizedKey(branch));
    if (!branchExists) {
      state.branches.push(branch.trim());
      state.branchPasswords = state.branchPasswords || {};
      state.branchPasswords[branch.trim()] = "1234";
      createdBranches += 1;
    }

    const sellerExists = state.sellers.some((item) => normalizedKey(item.name) === normalizedKey(sellerName) && normalizedKey(item.branch) === normalizedKey(branch));
    const seller = findOrCreateSeller(sellerName, branch, area);
    if (!sellerExists) createdSellers += 1;

    const metricExists = metricsFor(seller.area).some((item) => metricNameMatches(item, metricName));
    const metric = findOrCreateMetric(seller.area, metricName, goalValue);
    if (!metricExists) createdMetrics += 1;
    ensureSellerValues(seller);
    if (goalValue !== undefined && goalValue !== "") seller.values[metric.id].goal = parseImportedNumber(goalValue);
    if (realizedValue !== undefined && realizedValue !== "") seller.values[metric.id].realized = parseImportedNumber(realizedValue);
    updated += 1;
  }
  state.branches = normalizeBranches(state.branches, state.sellers);
  logUpdate({
    action: "Importou CSV",
    module: "Importacao e Backup",
    newValue: `${updated} linhas; ${createdSellers} vendedores; ${createdBranches} filiais; ${createdMetrics} metas novas; ${ignoredRows} ignoradas`,
    message: `CSV importado com ${updated} linhas atualizadas.`,
  });
  saveState(`${updated} linhas importadas (${createdSellers} vendedores, ${createdBranches} filiais, ${createdMetrics} metas novas, ${ignoredRows} ignoradas)`);
  renderAll();
}

function partialsForCampaign(campaign = activeCampaign()) {
  if (!campaign) return [];
  campaign.partials = normalizePartials(campaign.partials);
  return campaign.partials;
}

function partialById(partialId, campaign = activeCampaign()) {
  return partialsForCampaign(campaign).find((partial) => partial.id === partialId) || null;
}

function latestPublishedPartial(campaign = activeCampaign()) {
  return partialsForCampaign(campaign)
    .filter((partial) => partial.status === PARTIAL_STATUS.PUBLISHED)
    .sort((a, b) => String(b.publishedAt || b.importedAt || b.baseDate).localeCompare(String(a.publishedAt || a.importedAt || a.baseDate)))[0] || null;
}

function publishedPartialsForCampaign(campaign = activeCampaign()) {
  return partialsForCampaign(campaign)
    .filter((partial) => partial.status === PARTIAL_STATUS.PUBLISHED)
    .sort((a, b) => String(b.publishedAt || b.importedAt || b.baseDate).localeCompare(String(a.publishedAt || a.importedAt || a.baseDate)));
}

function getVisiblePartial(context = "dashboard", campaign = activeCampaign()) {
  if (!campaign) return null;
  const published = publishedPartialsForCampaign(campaign);
  const latest = published[0] || null;
  const selectedId = context === "colaborador" ? activeCollaboratorPartialId : context === "filial" ? activeManagerPartialId : activeDashboardPartialId;
  if (selectedId && selectedId !== "latest") return published.find((partial) => partial.id === selectedId) || latest;
  return latest;
}

function partialIsLatest(partial, campaign = activeCampaign()) {
  const latest = latestPublishedPartial(campaign);
  return Boolean(partial && latest && partial.id === latest.id);
}

function partialVisibilityBadge(partial, campaign = activeCampaign(), prefix = "") {
  if (!partial) return `<span class="status neutral">Sem parcial</span>`;
  const latest = partialIsLatest(partial, campaign);
  const label = latest ? "Última parcial publicada" : "Parcial histórica";
  return `<span class="status ${latest ? "ok" : "neutral"}">${escapeHtml(prefix ? `${prefix}: ${label}` : label)}</span>`;
}

function partialHistoryMessage(partial, campaign = activeCampaign()) {
  if (!partial || partialIsLatest(partial, campaign)) return "";
  return `<p class="admin-inline-note warning">Você está consultando uma parcial anterior. A última parcial publicada continua sendo a referência atual da campanha.</p>`;
}

function partialOptionLabel(partial) {
  return `${partial.name || "Parcial"}${partial.baseDate ? ` - ${partial.baseDate}` : ""}`;
}

function publishedPartialOptionsMarkup(selectedId = "latest", campaign = activeCampaign()) {
  const published = publishedPartialsForCampaign(campaign);
  const options = [`<option value="latest" ${selectedId === "latest" ? "selected" : ""}>Última publicada</option>`];
  options.push(...published.map((partial) => `<option value="${escapeHtml(partial.id)}" ${partial.id === selectedId ? "selected" : ""}>${escapeHtml(partialOptionLabel(partial))}</option>`));
  return options.join("");
}

function selectedDashboardPartial() {
  return getVisiblePartial("dashboard");
}

function partialStatusClass(status) {
  if (status === PARTIAL_STATUS.PUBLISHED) return "ok";
  if (status === PARTIAL_STATUS.REVIEW) return "warn";
  if (status === PARTIAL_STATUS.CANCELED || status === PARTIAL_STATUS.REPLACED) return "neutral";
  return "";
}

function partialLineClass(status) {
  if (status === "Erro") return "bad";
  if (status === "Alerta") return "warn";
  if (status === "Ignorado") return "neutral";
  return "ok";
}

function isPartialUsableItem(item) {
  return item?.status !== "Erro" && item?.status !== "Ignorado" && Boolean(item?.metricId);
}

function partialSummary(items, totalRows = items.length) {
  const errorRows = items.filter((item) => item.status === "Erro").length;
  const warningRows = items.filter((item) => item.status === "Alerta").length;
  const ignoredRows = items.filter((item) => item.status === "Ignorado").length;
  const usableItems = items.filter(isPartialUsableItem);
  const validRows = usableItems.length;
  const sellers = new Set(usableItems.map((item) => item.sellerId || normalizedKey(item.sellerName)));
  const branches = new Set(usableItems.map((item) => normalizedKey(item.branch)));
  const metrics = new Set(usableItems.map((item) => item.metricId || normalizedKey(item.metricName)));
  return {
    totalRows,
    validRows,
    warningRows,
    errorRows,
    ignoredRows,
    sellers: sellers.size,
    branches: branches.size,
    metrics: metrics.size,
    totalRealized: usableItems.reduce((sum, item) => sum + (Number(item.realized) || 0), 0),
  };
}

function findPartialMetric(area, metricName) {
  return findMetricByImportedName(area, metricName);
}

function partialItemMetric(item, seller) {
  const area = seller?.area || item?.area || "Nao Cabo";
  const metrics = metricsFor(area, state, { includeInactive: true });
  const byName = item?.metricName ? findMetricByImportedName(area, item.metricName, { includeInactive: true }) : null;
  const byId = item?.metricId ? metrics.find((candidate) => candidate.id === item.metricId) : null;
  if (byName) return byName;
  if (byId && (!item?.metricName || metricNameMatches(byId, item.metricName))) return byId;
  return null;
}

function metricExistsInAnotherArea(area, metricName) {
  const otherAreas = Object.keys(areaMetrics).filter((item) => item !== normalizeAreaName(area));
  return otherAreas.some((item) => findPartialMetric(item, metricName));
}

function partialMetricGoal(metric, seller) {
  if (!metric) return null;
  const valueGoal = seller?.values?.[metric.id]?.goal;
  const rawGoal = valueGoal !== undefined && valueGoal !== "" ? valueGoal : metric.goal;
  const goal = Number(rawGoal);
  return Number.isFinite(goal) && goal > 0 ? goal : null;
}

function partialPeriodInfo(partial = null, campaign = activeCampaign()) {
  if (partial?.source && Object.prototype.hasOwnProperty.call(partial, "daysRemaining")) return partial;
  if (partial) return getPeriodForPartial(partial, campaign);
  if (projectionPeriodOverride) return periodWithCalculation(projectionPeriodOverride, "override");
  return periodWithCalculation({ month: campaign?.reference || campaign?.period?.month || state.period.month, daysDone: 0, daysTotal: campaignPlannedBusinessDays(campaign) }, "campaignFallback");
}

function partialProjectionFor(realized, periodOrPartial = null, campaign = activeCampaign()) {
  const period = periodOrPartial ? partialPeriodInfo(periodOrPartial, campaign) : partialPeriodInfo();
  return projectionForPeriod(realized, period);
}

function partialPaceNeeded(goal, realized, periodOrPartial = null, campaign = activeCampaign()) {
  const { daysRemaining } = periodOrPartial ? partialPeriodInfo(periodOrPartial, campaign) : partialPeriodInfo();
  const safeGoal = validGoalValue(goal);
  if (!daysRemaining || !safeGoal) return null;
  return Math.max(safeGoal - finiteNumber(realized), 0) / daysRemaining;
}

function partialStatusFromProjected(projectedPercent, fallbackPercent = null) {
  const value = Number.isFinite(projectedPercent) ? projectedPercent : fallbackPercent;
  if (value === null || value === undefined || !Number.isFinite(value)) return { label: "Meta não configurada", cls: "neutral", action: "Revisar meta" };
  if (value >= 1) return { label: "Acima da meta", cls: "ok", action: "Acompanhamento" };
  if (value >= 0.8) return { label: "Em atenção", cls: "warn", action: "Plano de ação" };
  return { label: "Crítico", cls: "bad", action: "Ação imediata" };
}

function partialMetricContext(item, seller, partial = null, campaign = activeCampaign()) {
  const metric = partialItemMetric(item, seller);
  const participates = metricParticipates(metric);
  const groupMeta = metricGroup(metric);
  const tipoIndicador = metricTypeKind(metric);
  const goal = participates ? partialMetricGoal(metric, seller) : null;
  const realized = Number(item?.realized) || 0;
  const period = partial ? getPeriodForPartial(partial, campaign) : partialPeriodInfo();
  const projectedValue = partialProjectionFor(realized, period);
  const calc = indicatorCalculation({ metric, goal, realized, projectedValue, participates });
  const paceNeeded = participates && goal ? partialPaceNeeded(goal, realized, period) : null;
  return {
    metric,
    goal: calc.goal,
    realized: calc.realized,
    projectedValue: calc.projectedValue,
    percent: calc.currentPercent,
    projectedPercent: calc.projectedPercent,
    gap: calc.gap,
    paceNeeded,
    status: calc.status,
    participates,
    groupMeta,
    tipoIndicador,
    period,
  };
}

function partialMetaFromForm(campaign = activeCampaign()) {
  const plannedDays = campaignPlannedBusinessDays(campaign);
  return {
    number: document.getElementById("partialNumber")?.value,
    name: document.getElementById("partialName")?.value,
    baseDate: document.getElementById("partialBaseDate")?.value,
    daysDone: document.getElementById("partialDaysDone")?.value,
    daysTotal: document.getElementById("partialDaysTotal")?.value || plannedDays,
  };
}

function validatePartialMeta(meta = {}, campaign = activeCampaign()) {
  const errors = [];
  const number = positiveInteger(meta.number, 0);
  const baseDate = String(meta.baseDate || "").trim();
  const daysDone = positiveInteger(meta.daysDone, 0);
  const daysTotal = positiveInteger(meta.daysTotal, 0);
  if (!number) errors.push("Numero da parcial e obrigatorio.");
  if (!baseDate) errors.push("Data base e obrigatoria.");
  if (!daysDone) errors.push("Dias realizados da parcial e obrigatorio.");
  if (!daysTotal) errors.push("Dias uteis da parcial e obrigatorio.");
  if (daysDone && daysTotal && daysDone > daysTotal) errors.push("Dias realizados nao podem ser maiores que dias uteis.");
  if (!campaign || isCampaignOfficialClosed(campaign) || campaign.status !== CAMPAIGN_STATUS.OPEN) errors.push("Campanha fechada oficialmente nao permite nova parcial comum.");
  return { ok: errors.length === 0, errors, number, baseDate, daysDone, daysTotal };
}

function validatePartialCsv(text, meta = {}) {
  const campaign = activeCampaign();
  if (!campaign) throw new Error("Nenhuma campanha selecionada.");
  const metaValidation = validatePartialMeta(meta, campaign);
  if (!metaValidation.ok) throw new Error(metaValidation.errors[0]);
  const rows = parseCsv(text).filter((row) => row.some((cell) => String(cell || "").trim()));
  const header = rows.shift()?.map((item) => normalizedKey(item.replace(/^\uFEFF/, ""))) || [];
  const index = (name) => header.indexOf(normalizedKey(name));
  for (const required of ["vendedor", "filial", "area", "metrica", "realizado"]) {
    if (index(required) < 0) throw new Error(`Coluna obrigatoria ausente no CSV: ${required}.`);
  }
  if (!rows.length) throw new Error("Arquivo sem dados validos para importacao.");
  const duplicateKeys = new Set();
  const items = rows.map((row, rowIndex) => {
    const sellerName = String(row[index("vendedor")] || "").trim();
    const branch = String(row[index("filial")] || "").trim();
    const area = normalizeAreaName(row[index("area")] || "Nao Cabo");
    const metricName = String(row[index("metrica")] || "").trim();
    const realizedRaw = row[index("realizado")];
    const errors = [];
    const warnings = [];
    if (!sellerName) errors.push("Vendedor vazio.");
    if (!branch) errors.push("Filial vazia.");
    if (!metricName) errors.push("Metrica vazia.");
    const rawNumber = String(realizedRaw ?? "").trim();
    const realized = parseImportedNumber(rawNumber);
    if (!isValidImportedNumber(rawNumber) || !Number.isFinite(realized)) errors.push("Realizado invalido.");

    const branchExists = state.branches.some((item) => normalizedKey(item) === normalizedKey(branch));
    if (branch && !branchExists) errors.push("Filial inexistente na campanha.");

    const sellerCandidates = state.sellers.filter((seller) => normalizedKey(seller.name) === normalizedKey(sellerName));
    const seller = sellerCandidates.find((item) => normalizedKey(item.branch) === normalizedKey(branch)) || sellerCandidates[0] || null;
    if (!seller && sellerName) errors.push("Vendedor inexistente na campanha.");
    if (seller) {
      if (normalizedKey(seller.name) !== normalizedKey(sellerName) || seller.name !== sellerName) warnings.push("Vendedor localizado por normalizacao de nome.");
      if (normalizedKey(seller.branch) !== normalizedKey(branch)) warnings.push(`Filial divergente do cadastro (${seller.branch}).`);
      if (normalizeAreaName(seller.area) !== area) warnings.push(`Area divergente do cadastro (${seller.area}).`);
    }

    const metricArea = seller?.area || area;
    const metric = metricName ? findPartialMetric(metricArea, metricName) : null;
    const ignoredBySegment = !metric && metricName && !errors.length && (shouldIgnoreImportedMetric(metricArea, metricName) || metricExistsInAnotherArea(metricArea, metricName));
    if (!metric && metricName && !ignoredBySegment) errors.push("Metrica inexistente na campanha.");
    if (ignoredBySegment) warnings.push("Metrica nao configurada para este segmento; linha ignorada.");
    if (metric && metric.name !== metricName) warnings.push("Metrica localizada por normalizacao de nome.");
    if (metric && metricParticipates(metric) && !partialMetricGoal(metric, seller)) warnings.push("Meta nao configurada para esta metrica.");

    const duplicateKey = `${seller?.id || normalizedKey(sellerName)}:${metric?.id || normalizedKey(metricName)}`;
    if (sellerName && metricName && !ignoredBySegment) {
      if (duplicateKeys.has(duplicateKey)) errors.push("Linha duplicada para vendedor + metrica.");
      duplicateKeys.add(duplicateKey);
    }
    const status = ignoredBySegment ? "Ignorado" : errors.length ? "Erro" : warnings.length ? "Alerta" : "OK";
    return {
      id: makeId(),
      lineNumber: rowIndex + 2,
      sellerName,
      sellerId: seller?.id || "",
      branch,
      branchId: branchExists ? branch : "",
      area,
      metricName,
      metricId: metric?.id || "",
      realized,
      status,
      message: [...errors, ...warnings].join(" "),
    };
  });
  const summary = partialSummary(items, rows.length);
  const number = metaValidation.number || (partialsForCampaign(campaign).length + 1);
  const period = {
    month: campaign.reference || campaign.period?.month || state.period.month || "",
    daysDone: metaValidation.daysDone,
    daysTotal: metaValidation.daysTotal,
  };
  return {
    id: makeId(),
    campaignId: campaign.id,
    campaignName: campaign.name,
    number,
    name: meta.name || `Parcial ${String(number).padStart(2, "0")}`,
    baseDate: metaValidation.baseDate || new Date().toISOString().slice(0, 10),
    daysDone: period.daysDone,
    daysTotal: period.daysTotal,
    period,
    importedAt: new Date().toISOString(),
    publishedAt: "",
    responsible: currentAuditProfile() || "Admin",
    status: PARTIAL_STATUS.REVIEW,
    totalRows: summary.totalRows,
    validRows: summary.validRows,
    warningRows: summary.warningRows,
    errorRows: summary.errorRows,
    summary,
    items,
  };
}

function savePendingPartial(status) {
  const campaign = activeCampaign();
  if (!campaign || !pendingPartialImport) return;
  if (pendingPartialImport._readOnly) return;
  if (!requireAdminAction(status === PARTIAL_STATUS.PUBLISHED ? "publishPartial" : "importPartial", "Parciais")) return;
  if (isCampaignOfficialClosed(campaign) || campaign.status === CAMPAIGN_STATUS.OPERATIONAL_CLOSED) {
    logBlockedAttempt(
      status === PARTIAL_STATUS.PUBLISHED ? "Publicacao de parcial bloqueada" : "Salvamento de parcial bloqueado",
      "Parciais",
      "Tentativa de salvar/publicar parcial em campanha sem permissao operacional.",
      { campaignId: campaign.id, campaignName: campaign.name },
    );
    alert("Esta campanha nao permite salvar nova parcial neste status.");
    return;
  }
  if (pendingPartialImport.errorRows > 0) {
    alert("Corrija os erros antes de salvar ou publicar esta parcial.");
    return;
  }
  const metaValidation = validatePartialMeta(pendingPartialImport, campaign);
  if (!metaValidation.ok) {
    alert(metaValidation.errors[0]);
    return;
  }
  const partial = normalizePartials([{ ...pendingPartialImport, status }])[0];
  partial.publishedAt = status === PARTIAL_STATUS.PUBLISHED ? new Date().toISOString() : "";
  partialsForCampaign(campaign).push(partial);
  pendingPartialImport = null;
  logUpdate({
    action: status === PARTIAL_STATUS.PUBLISHED ? "Publicou parcial" : "Salvou parcial como rascunho",
    module: "Parciais",
    campaignId: campaign.id,
    campaignName: campaign.name,
    itemId: partial.id,
    itemName: partial.name,
    newValue: partial.status,
    message: `${partial.name} da campanha ${campaign.name} ${status === PARTIAL_STATUS.PUBLISHED ? "publicada" : "salva como rascunho"}.`,
  });
  saveState(status === PARTIAL_STATUS.PUBLISHED ? "Parcial publicada" : "Parcial salva como rascunho");
  renderAll();
}

function publishPartial(partialId) {
  const campaign = activeCampaign();
  const partial = partialById(partialId, campaign);
  if (!campaign || !partial) return;
  if (!requireAdminAction("publishPartial", "Parciais", { itemName: partial.name })) return;
  if (isCampaignOfficialClosed(campaign) || campaign.status === CAMPAIGN_STATUS.OPERATIONAL_CLOSED) {
    logBlockedAttempt("Publicacao de parcial bloqueada", "Parciais", "Tentativa de publicar parcial em campanha encerrada.", {
      campaignId: campaign.id,
      campaignName: campaign.name,
      itemId: partial.id,
      itemName: partial.name,
    });
    alert("Esta campanha nao permite publicar parcial neste status.");
    return;
  }
  if (partial.errorRows > 0) {
    alert("Corrija os erros antes de publicar esta parcial.");
    return;
  }
  const metaValidation = validatePartialMeta(partial, campaign);
  if (!metaValidation.ok) {
    alert(metaValidation.errors[0]);
    return;
  }
  if (!criticalConfirm("Voce esta publicando esta parcial para consulta dos vendedores, filiais e dashboard. A simulacao dos vendedores continuara separada e nao sera alterada. Deseja continuar?")) return;
  partial.status = PARTIAL_STATUS.PUBLISHED;
  partial.publishedAt = new Date().toISOString();
  logUpdate({
    action: "Publicou parcial",
    module: "Parciais",
    campaignId: campaign.id,
    campaignName: campaign.name,
    itemId: partial.id,
    itemName: partial.name,
    newValue: partial.status,
    message: `${partial.name} publicada para consulta.`,
  });
  saveState("Parcial publicada");
  renderAll();
}

function updatePartialStatus(partialId, status) {
  const campaign = activeCampaign();
  const partial = partialById(partialId, campaign);
  if (!campaign || !partial) return;
  const action = status === PARTIAL_STATUS.CANCELED ? "cancelPartial" : status === PARTIAL_STATUS.REPLACED ? "replacePartial" : "publishPartial";
  if (!requireAdminAction(action, "Parciais", { itemName: partial.name })) return;
  const statusImpact = status === PARTIAL_STATUS.CANCELED
    ? "cancelando esta parcial. Ela deixara de ser usada como referencia publicada."
    : status === PARTIAL_STATUS.REPLACED
      ? "marcando esta parcial como substituida. Ela sera mantida no historico, mas nao deve ser usada como referencia atual."
      : `alterando esta parcial para ${status}.`;
  if (status === PARTIAL_STATUS.PUBLISHED) {
    const metaValidation = validatePartialMeta(partial, campaign);
    if (!metaValidation.ok) {
      alert(metaValidation.errors[0]);
      return;
    }
  }
  if (!criticalConfirm(`Voce esta ${statusImpact} Deseja continuar?`)) return;
  partial.status = status;
  logUpdate({
    action: `Atualizou parcial para ${status}`,
    module: "Parciais",
    campaignId: campaign.id,
    campaignName: campaign.name,
    itemId: partial.id,
    itemName: partial.name,
    newValue: status,
    message: `${partial.name} atualizada para ${status}.`,
  });
  saveState("Parcial atualizada");
  renderAll();
}

function deleteDraftPartial(partialId) {
  const campaign = activeCampaign();
  const partial = partialById(partialId, campaign);
  if (!campaign || !partial) return;
  if (!requireAdminAction("deletePartial", "Parciais", { itemName: partial.name })) return;
  if (partial.status !== PARTIAL_STATUS.DRAFT) {
    alert("Somente parciais em rascunho podem ser excluidas.");
    return;
  }
  if (!criticalConfirm(`Excluir o rascunho ${partial.name}?`, { irreversible: true })) return;
  campaign.partials = partialsForCampaign(campaign).filter((item) => item.id !== partialId);
  logUpdate({
    action: "Excluiu rascunho de parcial",
    module: "Parciais",
    campaignId: campaign.id,
    campaignName: campaign.name,
    itemId: partial.id,
    itemName: partial.name,
    message: `${partial.name} excluida.`,
  });
  saveState("Parcial excluida");
  renderAll();
}

function partialItemsForSeller(partial, seller) {
  if (!partial || !seller) return [];
  return partial.items.filter((item) => isPartialUsableItem(item) && (
    item.sellerId === seller.id
    || (normalizedKey(item.sellerName) === normalizedKey(seller.name) && normalizedKey(item.branch) === normalizedKey(seller.branch))
  )).sort((a, b) => {
    const metricA = partialItemMetric(a, seller);
    const metricB = partialItemMetric(b, seller);
    return metricOrderIndex(seller.area, metricA?.id || a.metricId) - metricOrderIndex(seller.area, metricB?.id || b.metricId);
  });
}

function partialItemsForBranch(partial, branch) {
  if (!partial || !branch) return [];
  return partial.items.filter((item) => isPartialUsableItem(item) && normalizedKey(item.branch) === normalizedKey(branch));
}
function renderBranchFilter() {
  const select = document.getElementById("branchFilter");
  if (!select) return;
  const options = ["Todas", ...branches()];
  select.innerHTML = options.map((branch) => `<option value="${escapeHtml(branch)}">${escapeHtml(branch)}</option>`).join("");
  if (!options.includes(activeBranchFilter)) activeBranchFilter = "Todas";
  select.value = activeBranchFilter;
}

function renderDashboardFilterControls(baseSellers) {
  const areaSelect = document.getElementById("dashboardAreaFilter");
  const indicatorSelect = document.getElementById("dashboardIndicatorFilter");
  const statusSelect = document.getElementById("dashboardStatusFilter");
  const deflatorSelect = document.getElementById("dashboardDeflatorFilter");
  const partialSelect = document.getElementById("dashboardPartialFilter");
  if (areaSelect) areaSelect.value = activeAreaFilter;
  if (statusSelect) statusSelect.value = activeDashboardStatus;
  if (deflatorSelect) deflatorSelect.value = activeDashboardDeflator;
  if (partialSelect) {
    const published = publishedPartialsForCampaign();
    partialSelect.innerHTML = publishedPartialOptionsMarkup(activeDashboardPartialId);
    if (activeDashboardPartialId !== "latest" && !published.some((partial) => partial.id === activeDashboardPartialId)) activeDashboardPartialId = "latest";
    partialSelect.value = activeDashboardPartialId;
  }
  if (indicatorSelect) {
    const names = [];
    for (const seller of baseSellers) {
      for (const metric of metricsFor(seller.area)) {
        if (!names.includes(metric.name)) names.push(metric.name);
      }
    }
    const options = ["Todos", ...names];
    indicatorSelect.innerHTML = options.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
    if (!options.includes(activeDashboardIndicator)) activeDashboardIndicator = "Todos";
    indicatorSelect.value = activeDashboardIndicator;
  }
}

function dashboardBaseSellers() {
  return state.sellers.filter((seller) => {
    const areaOk = activeAreaFilter === "Todas" || seller.area === activeAreaFilter;
    const branchOk = activeBranchFilter === "Todas" || seller.branch === activeBranchFilter;
    return areaOk && branchOk;
  });
}

function officialPartialRecords(partial, sellers, options = {}) {
  if (!partial) return [];
  const sellerMap = new Map(sellers.map((seller) => [seller.id, seller]));
  const sellerKeys = new Map(sellers.map((seller) => [`${normalizedKey(seller.name)}|${normalizedKey(seller.branch)}`, seller]));
  const records = [];
  for (const item of partial.items || []) {
    if (!isPartialUsableItem(item)) continue;
    const seller = sellerMap.get(item.sellerId) || sellerKeys.get(`${normalizedKey(item.sellerName)}|${normalizedKey(item.branch)}`) || null;
    if (!seller) continue;
    if (options.sellerId && seller.id !== options.sellerId) continue;
    const context = partialMetricContext(item, seller, partial);
    if (!context.metric && options.requireMetric !== false) continue;
    if (options.metricName && options.metricName !== "Todos") {
      const recordMetric = context.metric || { name: item.metricName, id: item.metricId };
      if (!metricNameMatches(recordMetric, options.metricName) && !metricNameMatches({ name: options.metricName, id: options.metricName }, item.metricName)) continue;
    }
    records.push({ item, seller, ...context });
  }
  return records.sort((a, b) => a.seller.name.localeCompare(b.seller.name) || metricOrderIndex(a.seller.area, a.metric?.id || a.item.metricId) - metricOrderIndex(b.seller.area, b.metric?.id || b.item.metricId));
}

function partialRecordTotals(records) {
  const totals = records.reduce((acc, record) => {
    acc.operationalRealized += record.realized || 0;
    if (record.projectedValue !== null && record.projectedValue !== undefined) {
      acc.operationalProjected += record.projectedValue || 0;
      acc.operationalProjectionCount += 1;
    }
    if (record.participates && record.goal) {
      acc.goal += record.goal || 0;
      acc.realized += record.realized || 0;
      if (record.projectedValue !== null && record.projectedValue !== undefined) {
        acc.projected += record.projectedValue || 0;
        acc.withProjection += 1;
      }
      acc.withGoal += 1;
    } else if (record.participates) {
      acc.withoutGoal += 1;
    } else {
      acc.informative += 1;
      acc.infoRealized += record.realized || 0;
      if (record.projectedValue !== null && record.projectedValue !== undefined) {
        acc.infoProjected += record.projectedValue || 0;
        acc.infoProjectionCount += 1;
      }
    }
    const sellerId = record.seller?.id || record.sellerId || "";
    const branch = record.seller?.branch || record.item?.branch || record.branch || "";
    const metricKey = record.metric?.id || record.item?.metricName || record.metric?.name || record.metricId || "";
    if (sellerId) acc.sellerIds.add(sellerId);
    if (branch) acc.branches.add(branch);
    if (metricKey) acc.metrics.add(metricKey);
    return acc;
  }, { goal: 0, realized: 0, projected: 0, infoRealized: 0, infoProjected: 0, operationalRealized: 0, operationalProjected: 0, withGoal: 0, withoutGoal: 0, informative: 0, withProjection: 0, infoProjectionCount: 0, operationalProjectionCount: 0, sellerIds: new Set(), branches: new Set(), metrics: new Set() });
  const displayRealized = totals.withGoal ? totals.realized : totals.operationalRealized;
  const displayProjected = totals.withGoal
    ? (totals.withProjection ? totals.projected : null)
    : (totals.operationalProjectionCount ? totals.operationalProjected : null);
  const percent = totals.goal ? totals.realized / totals.goal : null;
  const projectedPercent = totals.goal && totals.withProjection ? totals.projected / totals.goal : null;
  const gap = totals.goal ? Math.max(totals.goal - totals.realized, 0) : null;
  const period = records.find((record) => record.period)?.period || null;
  const paceNeeded = totals.goal ? partialPaceNeeded(totals.goal, totals.realized, period) : null;
  const status = totals.withGoal
    ? partialStatusFromProjected(projectedPercent, percent)
    : totals.withoutGoal
      ? { label: "Meta nao configurada", cls: "neutral", action: "Revisar meta" }
      : records.length
        ? { label: "Informativo", cls: "neutral", action: "Consulta" }
        : { label: "Sem dados", cls: "neutral", action: "Sem dados" };
  return { ...totals, realized: displayRealized, projected: displayProjected, percent, projectedPercent, gap, paceNeeded, status };
}

function groupedPartialRows(records, keyFn) {
  const map = new Map();
  for (const record of records) {
    const key = keyFn(record);
    const row = map.get(key) || { key, goal: 0, realized: 0, projected: 0, infoRealized: 0, infoProjected: 0, operationalRealized: 0, operationalProjected: 0, count: 0, participatingCount: 0, eligibleCount: 0, projectedCount: 0, infoProjectedCount: 0, operationalProjectedCount: 0, sellerIds: new Set(), metricIds: new Set(), branchIds: new Set() };
    row.operationalRealized += record.realized || 0;
    if (record.projectedValue !== null && record.projectedValue !== undefined) {
      row.operationalProjected += record.projectedValue || 0;
      row.operationalProjectedCount += 1;
    }
    if (record.participates) row.participatingCount += 1;
    if (record.participates && record.goal) {
      row.goal += record.goal || 0;
      row.realized += record.realized || 0;
      if (record.projectedValue !== null && record.projectedValue !== undefined) {
        row.projected += record.projectedValue || 0;
        row.projectedCount += 1;
      }
      row.eligibleCount += 1;
    } else {
      row.infoRealized += record.realized || 0;
      if (!record.participates && record.projectedValue !== null && record.projectedValue !== undefined) {
        row.infoProjected += record.projectedValue || 0;
        row.infoProjectedCount += 1;
      }
    }
    row.count += 1;
    row.sellerIds.add(record.seller.id);
    row.branchIds.add(record.seller.branch || record.item.branch);
    row.metricIds.add(record.metric?.id || record.item.metricName);
    map.set(key, row);
  }
  return [...map.values()].map((row) => {
    const displayRealized = row.goal ? row.realized : row.operationalRealized;
    const displayProjected = row.goal
      ? (row.projectedCount ? row.projected : null)
      : (row.operationalProjectedCount ? row.operationalProjected : null);
    const percent = row.goal ? row.realized / row.goal : null;
    const projectedPercent = row.goal && row.projectedCount ? row.projected / row.goal : null;
    const gap = row.goal ? Math.max(row.goal - row.realized, 0) : null;
    const period = records.find((record) => record.period)?.period || null;
    const paceNeeded = row.goal ? partialPaceNeeded(row.goal, row.realized, period) : null;
    const status = row.goal
      ? partialStatusFromProjected(projectedPercent, percent)
      : row.participatingCount
        ? { label: "Meta nao configurada", cls: "neutral", action: "Revisar meta" }
        : { label: "Informativo", cls: "neutral" };
    return { ...row, realized: displayRealized, projected: displayProjected, percent, projectedPercent, gap, paceNeeded, status };
  });
}

function partialGraphicKey(record) {
  const metricId = record.metric?.id || record.item?.metricId || metricAliasKey(record.metric?.name || record.item?.metricName || "");
  return `${record.groupMeta || metricGroup(record.metric)}|${metricId}`;
}

function partialGraphicRows(records) {
  return groupedPartialRows(records, partialGraphicKey).map((row) => {
    const sample = records.find((record) => partialGraphicKey(record) === row.key) || {};
    const metric = sample.metric || { id: sample.item?.metricId || row.key, name: sample.item?.metricName || row.key, unit: "" };
    const participates = row.participatingCount > 0;
    return {
      ...row,
      metric,
      metricName: metric.name || sample.item?.metricName || row.key,
      block: sample.groupMeta || metricGroup(metric),
      participates,
      sample,
    };
  }).sort((a, b) =>
    (PRIMARY_METRIC_GROUPS.includes(a.block) ? PRIMARY_METRIC_GROUPS.indexOf(a.block) : 99) - (PRIMARY_METRIC_GROUPS.includes(b.block) ? PRIMARY_METRIC_GROUPS.indexOf(b.block) : 99)
    || metricOrderIndex(a.sample?.seller?.area || "Cabo", a.metric?.id || a.metricName) - metricOrderIndex(b.sample?.seller?.area || "Cabo", b.metric?.id || b.metricName)
    || a.metricName.localeCompare(b.metricName)
  );
}

function partialGraphicShortLabel(name = "") {
  const label = String(name || "Indicador").trim() || "Indicador";
  const alias = metricAliasKey(label);
  const labels = {
    acessorios: "Acessórios",
    peliculas: "Películas",
    "aparelhos qtde": "Aparelhos",
    "aparelhos qtd": "Aparelhos",
    "aparelhos receita": "Aparelhos Receita",
    gross_volume: "Gross Vol.",
    "gross volume": "Gross Vol.",
    fidel: "Fidel Ap.",
    "fidel aparelho": "Fidel Ap.",
    banda: "BL",
    "banda larga": "BL",
    seguro: "Seguro",
    seguros: "Seguro",
  };
  if (labels[alias]) return labels[alias];
  if (label.length <= 13) return label;
  return label.split(/\s+/).map((part) => part.length > 7 ? `${part.slice(0, 6)}.` : part).join(" ");
}

function partialGraphicScale(rows, mode = "current") {
  const values = rows
    .map((row) => Number(mode === "projected" ? row.projectedPercent : row.percent))
    .filter((value) => Number.isFinite(value) && value > 0);
  return Math.max(1.2, Math.ceil(Math.max(1, 0.8, ...values) * 10) / 10);
}

function partialGraphicBarData(row, mode = "current", maxPercent = 1.2) {
  const value = mode === "projected" ? row.projectedPercent : row.percent;
  const valid = Number.isFinite(Number(value));
  const percent = valid ? Number(value) : null;
  const size = valid ? Math.min(100, Math.max(3, (percent / maxPercent) * 100)) : 0;
  const label = valid ? pct.format(percent) : "-";
  const block = metricGroupDisplay(row.block);
  const shortLabel = partialGraphicShortLabel(row.metricName);
  const title = `${row.metricName} | ${label} | ${block}`;
  return { cls: achievementClass(percent), label, block, shortLabel, title, metricName: row.metricName, size };
}

function partialGraphicInformativeCard(row) {
  return `<article class="partial-info-card">
    <div><span>${escapeHtml(metricGroupDisplay(row.block))}</span><strong>${escapeHtml(row.metricName)}</strong></div>
    <dl>
      <dt>Realizado</dt><dd>${formatMetricAmount(row.metric, row.realized)}</dd>
      <dt>Projeção</dt><dd>${row.projected === null ? "-" : formatMetricAmount(row.metric, row.projected)}</dd>
    </dl>
    <em class="status neutral">Informativo</em>
  </article>`;
}

function partialGraphicBlockChips(rows, activeBlock = "Todos", context = "") {
  if (!context) return "";
  const available = new Set(rows.map((row) => row.block));
  const blocks = ["Todos", ...PRIMARY_METRIC_GROUPS];
  return `<div class="partial-graphic-block-filter" aria-label="Filtro de bloco dos gráficos">
    ${blocks.map((block) => {
      const disabled = block !== "Todos" && !available.has(block);
      const active = block === activeBlock || (!blocks.includes(activeBlock) && block === "Todos");
      return `<button class="${active ? "active" : ""}" data-partial-graphic-block="${escapeHtml(context)}" data-graphic-block="${escapeHtml(block)}" type="button" ${disabled ? "disabled" : ""}>${escapeHtml(block === "Todos" ? "Todos" : metricGroupDisplay(block))}</button>`;
    }).join("")}
  </div>`;
}

function partialGraphicChartMarkup({ title, subtitle, rows, mode, emptyMessage }) {
  const scale = partialGraphicScale(rows, mode);
  const target80 = Math.min(100, (0.8 / scale) * 100);
  const target100 = Math.min(100, (1 / scale) * 100);
  const bars = rows.map((row) => partialGraphicBarData(row, mode, scale));
  return `<article class="partial-chart-card">
    <div class="partial-chart-head"><div><h4>${escapeHtml(title)}</h4><p>${escapeHtml(subtitle)}</p></div><small>Escala até ${pct.format(scale)}</small></div>
    <div class="partial-chart-legend" aria-label="Legenda das faixas do gráfico">
      <span><i class="bad"></i>Abaixo de 80%</span>
      <span><i class="warn"></i>80% a 99,9%</span>
      <span><i class="ok"></i>100% ou mais</span>
    </div>
    <div class="partial-chart-scale"><span>0%</span><span>Atenção 80%</span><span>Meta 100%</span><span>${pct.format(scale)}</span></div>
    ${bars.length ? `<div class="partial-chart-area">
      <div class="partial-chart-values">${bars.map((bar) => `<div class="partial-graphic-bar-value" title="${escapeHtml(bar.title)}"><span>${bar.label}</span></div>`).join("")}</div>
      <div class="partial-chart-plot" style="--target-80:${target80}%;--target-100:${target100}%">
        <div class="partial-chart-columns">${bars.map((bar) => `<article class="partial-graphic-bar ${bar.cls}" title="${escapeHtml(bar.title)}">
          <div class="partial-graphic-mobile-label"><strong title="${escapeHtml(bar.metricName)}">${escapeHtml(bar.shortLabel)}</strong><small>${escapeHtml(bar.block)}</small></div>
          <div class="partial-graphic-track" aria-label="${escapeHtml(bar.title)}" style="--bar-size:${bar.size}%"><i></i></div>
          <div class="partial-graphic-mobile-value"><span>${bar.label}</span></div>
        </article>`).join("")}</div>
        <b class="target-line target-80" title="Atenção 80%"><small>Atenção 80%</small></b>
        <b class="target-line target-100" title="Meta 100%"><small>Meta 100%</small></b>
      </div>
      <div class="partial-chart-labels">${bars.map((bar) => `<div class="partial-graphic-bar-label"><strong title="${escapeHtml(bar.metricName)}">${escapeHtml(bar.shortLabel)}</strong><small>${escapeHtml(bar.block)}</small></div>`).join("")}</div>
    </div>` : `<p class="partial-chart-empty">${escapeHtml(emptyMessage)}</p>`}
  </article>`;
}

function partialGraphicMarkup({ title, subtitle, partial, period, records, context = "", activeBlock = "Todos", showBlockFilter = false, emptyMessage = "Nenhuma parcial publicada para gerar a visão gráfica." }) {
  if (!partial) {
    return `<section class="partial-graphic-card"><div class="partial-graphic-section-head"><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(emptyMessage)}</p></div></div><article class="partial-chart-card"><p class="partial-chart-empty">Não há parcial oficial publicada para exibir gráficos.</p></article></section>`;
  }
  const rows = partialGraphicRows(records || []);
  const blocks = ["Todos", ...PRIMARY_METRIC_GROUPS];
  const selectedBlock = blocks.includes(activeBlock) ? activeBlock : "Todos";
  const filteredRows = selectedBlock === "Todos" ? rows : rows.filter((row) => row.block === selectedBlock);
  const participantRows = filteredRows.filter((row) => row.participates);
  const informativeRows = filteredRows.filter((row) => !row.participates);
  const periodLabel = `${partial.name || "Parcial oficial"} — Base ${partial.baseDate || "-"} — ${period?.daysDone || "-"} de ${period?.daysTotal || "-"} dias`;
  return `<section class="partial-graphic-card" data-graphic-context="${escapeHtml(context || "geral")}">
    <div class="partial-graphic-section-head">
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(subtitle || "Baseado na parcial oficial selecionada.")}</p>
      </div>
      ${partialVisibilityBadge(partial)}
    </div>
    <div class="partial-meta-line partial-graphic-meta">
      <strong>${escapeHtml(periodLabel)}</strong>
      <span>Indicadores participantes em percentual; informativos em card separado.</span>
    </div>
    ${showBlockFilter ? partialGraphicBlockChips(rows, selectedBlock, context) : ""}
    <div class="partial-graphic-grid">
      ${partialGraphicChartMarkup({ title: "Atingimento atual por indicador", subtitle: "Mostra o percentual realizado até a parcial oficial.", rows: participantRows, mode: "current", emptyMessage: "Não há indicadores de atingimento configurados para esta parcial." })}
      ${partialGraphicChartMarkup({ title: "Projeção de fechamento por indicador", subtitle: "Mostra a tendência de fechamento mantendo o ritmo da parcial.", rows: participantRows, mode: "projected", emptyMessage: "Projeção indisponível para esta parcial." })}
    </div>
    <section class="partial-info-section">
      <div class="partial-chart-head"><div><h4>Indicadores informativos</h4><p>Não entram no atingimento, mas ajudam na leitura operacional.</p></div></div>
      <div class="partial-info-grid">${informativeRows.map(partialGraphicInformativeCard).join("") || `<p class="partial-chart-empty">Sem indicadores informativos nesta parcial.</p>`}</div>
    </section>
  </section>`;
}

function partialBlockRows(records) {
  return PRIMARY_METRIC_GROUPS.map((group) => {
    const row = groupedPartialRows(records.filter((record) => record.groupMeta === group), () => group)[0];
    return row || {
      key: group,
      goal: 0,
      realized: 0,
      projected: 0,
      infoRealized: 0,
      infoProjected: 0,
      operationalRealized: 0,
      operationalProjected: 0,
      count: 0,
      participatingCount: 0,
      eligibleCount: 0,
      projectedCount: 0,
      infoProjectedCount: 0,
      operationalProjectedCount: 0,
      sellerIds: new Set(),
      branchIds: new Set(),
      metricIds: new Set(),
      percent: null,
      projectedPercent: null,
      gap: null,
      paceNeeded: null,
      status: { label: "Sem dados", cls: "neutral" },
    };
  });
}

function metricRowsBlockSummary(rows) {
  return goalCompletionBlocksFromRows(rows).map((row) => ({
    ...row,
    count: row.applicableCount,
    goal: row.totals.goal,
    realized: row.totals.realized,
    projectedValue: row.totals.projected,
    currentPercent: row.totals.percent,
    projectedPercent: row.totals.projectedPercent,
  }));
}

function metricGroupHeaderRows(rows, colSpan, rowMarkup) {
  const grouped = new Map();
  for (const row of rows) {
    const group = row.groupMeta || metricGroup(row.metric) || "Sem bloco";
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group).push(row);
  }
  const orderedGroups = [...PRIMARY_METRIC_GROUPS, "Informativo", "Sem bloco"].filter((group) => grouped.has(group));
  return orderedGroups.map((group) => `<tr class="metric-group-row"><td colspan="${colSpan}">${escapeHtml(metricGroupDisplay(group))}</td></tr>${grouped.get(group).map(rowMarkup).join("")}`).join("");
}

function publishedPartialsForComparison(campaign = activeCampaign()) {
  return [...publishedPartialsForCampaign(campaign)].sort((a, b) => {
    const numberA = Number(a.number);
    const numberB = Number(b.number);
    if (Number.isFinite(numberA) && Number.isFinite(numberB) && numberA !== numberB) return numberA - numberB;
    return String(a.baseDate || a.publishedAt || a.importedAt).localeCompare(String(b.baseDate || b.publishedAt || b.importedAt));
  });
}

function comparisonDefaultSelection(campaign = activeCampaign()) {
  const published = publishedPartialsForComparison(campaign);
  const compare = published[published.length - 1] || null;
  const base = published[published.length - 2] || published[0] || null;
  return { published, baseId: base?.id || "", compareId: compare?.id || "" };
}

function normalizeComparisonSelection(scope = "dashboard", campaign = activeCampaign()) {
  const defaults = comparisonDefaultSelection(campaign);
  const ids = new Set(defaults.published.map((partial) => partial.id));
  let baseId = scope === "filial" ? activeManagerCompareBaseId : activeDashboardCompareBaseId;
  let compareId = scope === "filial" ? activeManagerCompareTargetId : activeDashboardCompareTargetId;
  const hadBase = ids.has(baseId);
  const hadCompare = ids.has(compareId);
  if (!hadBase) baseId = defaults.baseId;
  if (!hadCompare) compareId = defaults.compareId;
  if (baseId && compareId && baseId === compareId && defaults.published.length > 1 && (!hadBase || !hadCompare)) {
    baseId = defaults.published[Math.max(0, defaults.published.length - 2)]?.id || baseId;
    compareId = defaults.published[defaults.published.length - 1]?.id || compareId;
  }
  if (scope === "filial") {
    activeManagerCompareBaseId = baseId;
    activeManagerCompareTargetId = compareId;
  } else {
    activeDashboardCompareBaseId = baseId;
    activeDashboardCompareTargetId = compareId;
  }
  return {
    published: defaults.published,
    basePartial: defaults.published.find((partial) => partial.id === baseId) || null,
    comparePartial: defaults.published.find((partial) => partial.id === compareId) || null,
    baseId,
    compareId,
  };
}

function comparisonPartialOptionsMarkup(selectedId, campaign = activeCampaign()) {
  const published = publishedPartialsForComparison(campaign);
  return published.map((partial) => `<option value="${escapeHtml(partial.id)}" ${partial.id === selectedId ? "selected" : ""}>${escapeHtml(partialOptionLabel(partial))}</option>`).join("");
}

function comparisonBlockOptionsMarkup(selected = "Todos") {
  return ["Todos", ...PRIMARY_METRIC_GROUPS, "Informativo", "Sem bloco"].map((group) => `<option value="${escapeHtml(group)}" ${group === selected ? "selected" : ""}>${escapeHtml(group === "Todos" ? "Todos" : metricGroupDisplay(group))}</option>`).join("");
}

function signedNumber(value, formatter = num1) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "-";
  const number = Number(value);
  return `${number > 0 ? "+" : ""}${formatter.format(number)}`;
}

function formatSignedMetricAmount(metric, value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "-";
  const number = Number(value);
  const formatted = metricIsMoney(metric) ? money.format(Math.abs(number)) : num0.format(Math.round(Math.abs(number)));
  if (number > 0) return `+${formatted}`;
  if (number < 0) return `-${formatted}`;
  return metricIsMoney(metric) ? money.format(0) : num0.format(0);
}

function formatPercentPoints(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "-";
  return `${signedNumber(Number(value) * 100, num1)} p.p.`;
}

function comparisonTone(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "neutral";
  if (Number(value) > 0.01) return "ok";
  if (Number(value) < -0.01) return "bad";
  return "neutral";
}

function comparisonStatusClass(label) {
  if (["Melhorou", "Recuperado", "Atingiu meta", "Novo indicador"].includes(label)) return "ok";
  if (["Piorou", "Novo critico", "Permanece critico", "Ausente"].includes(label)) return "bad";
  return "neutral";
}

function recordIndicatorKey(record) {
  const metricId = record.metric?.id || record.item?.metricId || metricAliasKey(record.metric?.name || record.item?.metricName || "");
  return `${record.groupMeta || metricGroup(record.metric)}|${metricId}`;
}

function indicatorComparisonInputs(records) {
  return [...groupItems(records, recordIndicatorKey).entries()].map(([key, items]) => {
    const sample = items[0];
    const totals = partialRecordTotals(items);
    return {
      key,
      items,
      sample,
      metric: sample.metric,
      metricName: sample.metric?.name || sample.item.metricName || key,
      block: sample.groupMeta || metricGroup(sample.metric),
      participates: items.some((record) => record.participates),
      totals,
    };
  });
}

function compareIndicatorRows(baseRecords, compareRecords) {
  const baseMap = new Map(indicatorComparisonInputs(baseRecords).map((row) => [row.key, row]));
  const compareMap = new Map(indicatorComparisonInputs(compareRecords).map((row) => [row.key, row]));
  const keys = new Set([...baseMap.keys(), ...compareMap.keys()]);
  return [...keys].map((key) => {
    const base = baseMap.get(key) || null;
    const compared = compareMap.get(key) || null;
    const sample = compared?.sample || base?.sample || {};
    const metric = compared?.metric || base?.metric || sample.metric || null;
    const participates = Boolean(compared?.participates || base?.participates);
    const baseTotals = base?.totals || null;
    const compareTotals = compared?.totals || null;
    const basePercent = baseTotals ? effectiveAttainmentPercent(baseTotals) : null;
    const comparePercent = compareTotals ? effectiveAttainmentPercent(compareTotals) : null;
    const percentVariation = basePercent !== null && comparePercent !== null ? comparePercent - basePercent : null;
    const realizedVariation = (compareTotals?.realized ?? null) !== null && (baseTotals?.realized ?? null) !== null ? compareTotals.realized - baseTotals.realized : null;
    const projectedVariation = (compareTotals?.projected ?? null) !== null && (baseTotals?.projected ?? null) !== null ? compareTotals.projected - baseTotals.projected : null;
    const baseCritical = basePercent !== null && basePercent < 0.8;
    const compareCritical = comparePercent !== null && comparePercent < 0.8;
    let status = "Estavel";
    if (!base && compared) status = "Novo indicador";
    else if (base && !compared) status = "Ausente";
    else if (!participates) status = "Informativo";
    else if (baseCritical && !compareCritical) status = "Recuperado";
    else if (!baseCritical && compareCritical) status = "Novo critico";
    else if (baseCritical && compareCritical) status = "Permanece critico";
    else if (basePercent !== null && comparePercent !== null && basePercent < 1 && comparePercent >= 1) status = "Atingiu meta";
    else if (percentVariation !== null && percentVariation > 0.01) status = "Melhorou";
    else if (percentVariation !== null && percentVariation < -0.01) status = "Piorou";
    else if (realizedVariation !== null && realizedVariation > 0 && !participates) status = "Informativo";
    const metaChanged = Boolean(baseTotals?.goal && compareTotals?.goal && Math.abs(baseTotals.goal - compareTotals.goal) > 0.0001);
    return {
      key,
      block: compared?.block || base?.block || "Sem bloco",
      metric,
      metricName: compared?.metricName || base?.metricName || sample.item?.metricName || key,
      participates,
      baseTotals,
      compareTotals,
      baseRealized: baseTotals?.realized ?? null,
      compareRealized: compareTotals?.realized ?? null,
      realizedVariation,
      baseProjected: baseTotals?.projected ?? null,
      compareProjected: compareTotals?.projected ?? null,
      projectedVariation,
      basePercent,
      comparePercent,
      percentVariation,
      metaChanged,
      status,
      statusClass: comparisonStatusClass(status),
    };
  }).sort((a, b) =>
    PRIMARY_METRIC_GROUPS.indexOf(a.block) - PRIMARY_METRIC_GROUPS.indexOf(b.block)
    || comparisonStatusClass(b.status).localeCompare(comparisonStatusClass(a.status))
    || Math.abs(Number(b.percentVariation ?? b.realizedVariation ?? 0)) - Math.abs(Number(a.percentVariation ?? a.realizedVariation ?? 0))
    || a.metricName.localeCompare(b.metricName)
  );
}

function compareGroupedRows(baseRecords, compareRecords, keyFn, labelFn) {
  const baseGroups = groupItems(baseRecords, keyFn);
  const compareGroups = groupItems(compareRecords, keyFn);
  const keys = new Set([...baseGroups.keys(), ...compareGroups.keys()]);
  return [...keys].map((key) => {
    const baseItems = baseGroups.get(key) || [];
    const compareItems = compareGroups.get(key) || [];
    const baseStats = goalCompletionStats(baseItems);
    const compareStats = goalCompletionStats(compareItems);
    const baseTotals = partialRecordTotals(baseItems);
    const compareTotals = partialRecordTotals(compareItems);
    const variation = baseStats.metPercent !== null && compareStats.metPercent !== null ? compareStats.metPercent - baseStats.metPercent : null;
    const indicators = compareIndicatorRows(baseItems, compareItems);
    const improvedCount = indicators.filter((row) => ["Melhorou", "Recuperado", "Atingiu meta"].includes(row.status)).length;
    const worsenedCount = indicators.filter((row) => ["Piorou", "Novo critico"].includes(row.status)).length;
    const recoveredCount = indicators.filter((row) => row.status === "Recuperado").length;
    const newCriticalCount = indicators.filter((row) => row.status === "Novo critico").length;
    let status = "Estavel";
    if (!baseItems.length && compareItems.length) status = "Novo indicador";
    else if (baseItems.length && !compareItems.length) status = "Ausente";
    else if (variation !== null && variation > 0.01) status = "Melhorou";
    else if (variation !== null && variation < -0.01) status = "Piorou";
    return {
      key,
      label: labelFn ? labelFn(key, compareItems, baseItems) : key,
      baseStats,
      compareStats,
      baseTotals,
      compareTotals,
      variation,
      improvedCount,
      worsenedCount,
      recoveredCount,
      newCriticalCount,
      criticalCount: compareStats.criticalCount,
      indicators,
      status,
      statusClass: comparisonStatusClass(status),
    };
  }).sort((a, b) => Number(b.variation ?? -999) - Number(a.variation ?? -999) || String(a.label).localeCompare(String(b.label)));
}

function comparisonInsights(comparison) {
  const insights = [];
  const improved = comparison.byIndicator.filter((row) => ["Melhorou", "Recuperado", "Atingiu meta"].includes(row.status) && row.percentVariation !== null).sort((a, b) => b.percentVariation - a.percentVariation)[0];
  const worsened = comparison.byIndicator.filter((row) => ["Piorou", "Novo critico"].includes(row.status) && row.percentVariation !== null).sort((a, b) => a.percentVariation - b.percentVariation)[0];
  const informative = comparison.byIndicator.filter((row) => !row.participates && row.realizedVariation !== null).sort((a, b) => Math.abs(b.realizedVariation) - Math.abs(a.realizedVariation))[0];
  const branch = comparison.byBranch.filter((row) => row.variation !== null).sort((a, b) => b.variation - a.variation)[0];
  if (improved) insights.push(`${improved.metricName} evoluiu ${formatPercentPoints(improved.percentVariation)}.`);
  if (worsened) insights.push(`${worsened.metricName} piorou ${formatPercentPoints(worsened.percentVariation)}.`);
  if (informative) insights.push(`${informative.metricName} variou ${formatSignedMetricAmount(informative.metric, informative.realizedVariation)} no realizado.`);
  if (branch) insights.push(`${branch.label} teve variacao de ${formatPercentPoints(branch.variation)} em metas atingidas.`);
  return insights.slice(0, 4);
}

function comparePartials(basePartial, comparePartial, options = {}) {
  const campaign = options.campaign || activeCampaign();
  const sellers = options.sellers || state.sellers;
  const metricName = options.metricName || "Todos";
  const block = options.block || "Todos";
  const filterRecords = (records) => records.filter((record) => {
    const branchOk = !options.branch || normalizedKey(record.seller.branch || record.item.branch) === normalizedKey(options.branch);
    const sellerOk = !options.sellerId || record.seller.id === options.sellerId;
    const blockOk = block === "Todos" || (record.groupMeta || metricGroup(record.metric)) === block;
    return branchOk && sellerOk && blockOk;
  });
  const baseRecords = filterRecords(officialPartialRecords(basePartial, sellers, { metricName }));
  const compareRecords = filterRecords(officialPartialRecords(comparePartial, sellers, { metricName }));
  const baseGoal = goalCompletionStats(baseRecords);
  const compareGoal = goalCompletionStats(compareRecords);
  const byIndicator = compareIndicatorRows(baseRecords, compareRecords);
  const byBranch = compareGroupedRows(baseRecords, compareRecords, (record) => record.seller.branch || record.item.branch, (key) => key);
  const bySeller = compareGroupedRows(baseRecords, compareRecords, (record) => record.seller.id, (key, compareItems, baseItems) => (compareItems[0] || baseItems[0])?.seller?.name || key);
  const byBlock = compareGroupedRows(baseRecords, compareRecords, (record) => record.groupMeta || metricGroup(record.metric), (key) => metricGroupDisplay(key));
  const summary = {
    basePartialName: basePartial?.name || "",
    comparePartialName: comparePartial?.name || "",
    baseDate: basePartial?.baseDate || "",
    compareDate: comparePartial?.baseDate || "",
    baseDays: getPeriodForPartial(basePartial, campaign),
    compareDays: getPeriodForPartial(comparePartial, campaign),
    totalSellers: partialRecordTotals(compareRecords).sellerIds.size,
    totalBranches: partialRecordTotals(compareRecords).branches.size,
    baseMetPercent: baseGoal.metPercent,
    compareMetPercent: compareGoal.metPercent,
    metPercentVariation: baseGoal.metPercent !== null && compareGoal.metPercent !== null ? compareGoal.metPercent - baseGoal.metPercent : null,
    metricsImproved: byIndicator.filter((row) => ["Melhorou", "Recuperado", "Atingiu meta"].includes(row.status)).length,
    metricsWorsened: byIndicator.filter((row) => ["Piorou", "Novo critico"].includes(row.status)).length,
    recoveredMetrics: byIndicator.filter((row) => row.status === "Recuperado").length,
    newCriticalMetrics: byIndicator.filter((row) => row.status === "Novo critico").length,
    stableMetrics: byIndicator.filter((row) => row.status === "Estavel").length,
    permanentCriticalMetrics: byIndicator.filter((row) => row.status === "Permanece critico").length,
  };
  const comparison = { campaign, basePartial, comparePartial, baseRecords, compareRecords, summary, byBranch, bySeller, byBlock, byIndicator, insights: [] };
  comparison.insights = comparisonInsights(comparison);
  return comparison;
}

function comparisonEmptyState(title, message) {
  return `<div class="dashboard-card-head"><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p></div></div><div class="empty-state">${escapeHtml(message)}</div>`;
}

function comparisonControlsMarkup(scope, selection, blockValue) {
  const prefix = scope === "filial" ? "branch" : "dashboard";
  const campaign = activeCampaign();
  return `<div class="comparison-filter-grid">
    <label>Parcial base<select id="${prefix}CompareBasePartial">${comparisonPartialOptionsMarkup(selection.baseId, campaign)}</select></label>
    <label>Parcial comparada<select id="${prefix}CompareTargetPartial">${comparisonPartialOptionsMarkup(selection.compareId, campaign)}</select></label>
    <label>Bloco<select id="${prefix}CompareBlockFilter">${comparisonBlockOptionsMarkup(blockValue)}</select></label>
  </div>`;
}

function comparisonMetaLine(comparison) {
  return `<div class="partial-meta-line comparison-meta-line">
    <strong>${escapeHtml(comparison.summary.basePartialName)} -> ${escapeHtml(comparison.summary.comparePartialName)}</strong>
    <span>Base ${escapeHtml(comparison.summary.baseDate || "-")} (${comparison.summary.baseDays.daysDone || "-"} de ${comparison.summary.baseDays.daysTotal || "-"} dias) | Comparada ${escapeHtml(comparison.summary.compareDate || "-")} (${comparison.summary.compareDays.daysDone || "-"} de ${comparison.summary.compareDays.daysTotal || "-"} dias)</span>
  </div>`;
}

function comparisonSummaryCardsMarkup(comparison, context = "dashboard") {
  const bestBlock = comparison.byBlock.filter((row) => row.variation !== null).sort((a, b) => b.variation - a.variation)[0];
  const bestBranch = comparison.byBranch.filter((row) => row.variation !== null).sort((a, b) => b.variation - a.variation)[0];
  const bestSeller = comparison.bySeller.filter((row) => row.variation !== null).sort((a, b) => b.variation - a.variation)[0];
  const entityCard = context === "filial"
    ? ["Vendedores evoluiram", String(comparison.bySeller.filter((row) => Number(row.variation) > 0.01).length), bestSeller ? `${bestSeller.label} ${formatPercentPoints(bestSeller.variation)}` : "Sem variacao"]
    : ["Filial destaque", bestBranch?.label || "-", bestBranch ? formatPercentPoints(bestBranch.variation) : "Sem variacao"];
  const cards = [
    ["Evolucao metas", formatPercentPoints(comparison.summary.metPercentVariation), `${formatPercent(comparison.summary.baseMetPercent)} -> ${formatPercent(comparison.summary.compareMetPercent)}`, comparison.summary.metPercentVariation],
    ["Melhoraram", String(comparison.summary.metricsImproved), "indicadores com evolucao", null],
    ["Pioraram", String(comparison.summary.metricsWorsened), "indicadores com queda", null],
    ["Recuperados", String(comparison.summary.recoveredMetrics), "sairam de abaixo de 80%", null],
    ["Novos criticos", String(comparison.summary.newCriticalMetrics), "entraram abaixo de 80%", null],
    ["Bloco destaque", bestBlock?.label || "-", bestBlock ? formatPercentPoints(bestBlock.variation) : "Sem variacao", bestBlock?.variation ?? null],
    [...entityCard, context === "filial" ? bestSeller?.variation ?? null : bestBranch?.variation ?? null],
  ];
  return `<div class="comparison-kpi-grid">${cards.map(([label, value, detail, tone]) => `<article class="comparison-kpi ${comparisonTone(tone)}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong><small>${escapeHtml(String(detail))}</small></article>`).join("")}</div>`;
}

function comparisonInsightsMarkup(comparison) {
  return `<div class="comparison-insights">${comparison.insights.map((item) => `<div class="attention-row neutral"><strong>${escapeHtml(item)}</strong></div>`).join("") || `<p class="muted-note">Sem destaques automaticos para as parciais selecionadas.</p>`}</div>`;
}

function comparisonEntityTableMarkup(rows, options = {}) {
  const title = options.title || "Comparativo";
  const firstColumn = options.firstColumn || "Item";
  const empty = options.empty || "Nenhum resultado encontrado para os filtros selecionados.";
  return `<section class="comparison-subsection"><div class="dashboard-card-head"><div><h4>${escapeHtml(title)}</h4><p>${escapeHtml(options.subtitle || "")}</p></div></div>
    <div class="table-wrap dashboard-table-wrap branch-table-wrap comparison-table-wrap">
      <table class="comparison-table">
        <thead><tr><th>${escapeHtml(firstColumn)}</th><th>% base</th><th>% comparada</th><th>Variacao</th><th>Melhoraram</th><th>Pioraram</th><th>Novos criticos</th><th>Recuperados</th><th>Status</th></tr></thead>
        <tbody>${rows.map((row) => `<tr>
          <td data-label="${escapeHtml(firstColumn)}">${escapeHtml(row.label)}</td>
          <td data-label="% base">${achievementPill(row.baseStats.metPercent)}</td>
          <td data-label="% comparada">${achievementPill(row.compareStats.metPercent)}</td>
          <td data-label="Variacao"><strong class="${comparisonTone(row.variation)}">${formatPercentPoints(row.variation)}</strong></td>
          <td data-label="Melhoraram">${row.improvedCount}</td>
          <td data-label="Pioraram">${row.worsenedCount}</td>
          <td data-label="Novos criticos">${row.newCriticalCount}</td>
          <td data-label="Recuperados">${row.recoveredCount}</td>
          <td data-label="Status"><span class="status ${row.statusClass}">${escapeHtml(row.status)}</span></td>
        </tr>`).join("") || `<tr><td colspan="9">${escapeHtml(empty)}</td></tr>`}</tbody>
      </table>
    </div>
  </section>`;
}

function comparisonIndicatorTableMarkup(rows, options = {}) {
  const empty = options.empty || "Nenhum indicador encontrado para os filtros selecionados.";
  return `<section class="comparison-subsection"><div class="dashboard-card-head"><div><h4>${escapeHtml(options.title || "Comparativo por indicador")}</h4><p>${escapeHtml(options.subtitle || "")}</p></div></div>
    <div class="table-wrap dashboard-table-wrap branch-table-wrap comparison-table-wrap">
      <table class="comparison-table indicator-comparison-table">
        <thead><tr><th>Bloco</th><th>Indicador</th><th>Realizado base</th><th>Realizado comp.</th><th>Var. realizado</th><th>Proj. base</th><th>Proj. comp.</th><th>Var. proj.</th><th>% base</th><th>% comp.</th><th>Var. p.p.</th><th>Status</th></tr></thead>
        <tbody>${rows.map((row) => `<tr>
          <td data-label="Bloco">${escapeHtml(metricGroupDisplay(row.block))}</td>
          <td data-label="Indicador"><strong>${escapeHtml(row.metricName)}</strong>${row.metaChanged ? `<small class="warning">Meta alterada entre parciais</small>` : ""}</td>
          <td data-label="Realizado base">${row.baseRealized === null ? "-" : formatMetricAmount(row.metric, row.baseRealized)}</td>
          <td data-label="Realizado comp.">${row.compareRealized === null ? "-" : formatMetricAmount(row.metric, row.compareRealized)}</td>
          <td data-label="Var. realizado"><strong class="${comparisonTone(row.realizedVariation)}">${formatSignedMetricAmount(row.metric, row.realizedVariation)}</strong></td>
          <td data-label="Proj. base">${row.baseProjected === null ? "-" : formatMetricAmount(row.metric, row.baseProjected)}</td>
          <td data-label="Proj. comp.">${row.compareProjected === null ? "-" : formatMetricAmount(row.metric, row.compareProjected)}</td>
          <td data-label="Var. proj."><strong class="${comparisonTone(row.projectedVariation)}">${formatSignedMetricAmount(row.metric, row.projectedVariation)}</strong></td>
          <td data-label="% base">${row.participates ? achievementPill(row.basePercent) : "-"}</td>
          <td data-label="% comp.">${row.participates ? achievementPill(row.comparePercent) : "-"}</td>
          <td data-label="Var. p.p."><strong class="${comparisonTone(row.percentVariation)}">${row.participates ? formatPercentPoints(row.percentVariation) : "-"}</strong></td>
          <td data-label="Status"><span class="status ${row.statusClass}">${escapeHtml(row.status)}</span></td>
        </tr>`).join("") || `<tr><td colspan="12">${escapeHtml(empty)}</td></tr>`}</tbody>
      </table>
    </div>
  </section>`;
}

function renderDashboardComparisonPanel() {
  const container = document.getElementById("dashboardComparisonPanel");
  if (!container) return;
  const campaign = activeCampaign();
  const selection = normalizeComparisonSelection("dashboard", campaign);
  if (!selection.published.length) {
    container.innerHTML = comparisonEmptyState("Comparativo entre Parciais", "Nenhuma parcial publicada para comparacao.");
    return;
  }
  if (selection.published.length < 2) {
    container.innerHTML = comparisonEmptyState("Comparativo entre Parciais", "E necessario ter pelo menos duas parciais publicadas para comparar evolucao.");
    return;
  }
  const controls = comparisonControlsMarkup("dashboard", selection, activeDashboardCompareBlock);
  if (!selection.basePartial || !selection.comparePartial) {
    container.innerHTML = `<div class="dashboard-card-head"><div><h3>Comparativo entre Parciais</h3><p>Selecione duas parciais para comparar.</p></div></div>${controls}<div class="empty-state">Selecione duas parciais para comparar.</div>`;
    return;
  }
  if (selection.basePartial.id === selection.comparePartial.id) {
    container.innerHTML = `<div class="dashboard-card-head"><div><h3>Comparativo entre Parciais</h3><p>As parciais devem ser diferentes.</p></div></div>${controls}<div class="empty-state">Selecione parciais diferentes para comparar.</div>`;
    return;
  }
  const comparison = comparePartials(selection.basePartial, selection.comparePartial, {
    campaign,
    sellers: dashboardBaseSellers(),
    metricName: activeDashboardIndicator,
    block: activeDashboardCompareBlock,
  });
  container.innerHTML = `<div class="dashboard-card-head">
    <div><h3>Comparativo entre Parciais</h3><p>Evolucao oficial entre parciais publicadas da campanha.</p></div>
  </div>
  ${controls}
  ${comparisonMetaLine(comparison)}
  ${comparisonSummaryCardsMarkup(comparison, "dashboard")}
  ${comparisonInsightsMarkup(comparison)}
  <div class="comparison-grid">
    ${comparisonEntityTableMarkup(comparison.byBranch, { title: "Comparativo por Filial", firstColumn: "Filial", subtitle: "Ranking de evolucao por % de metas atingidas." })}
    ${comparisonIndicatorTableMarkup(comparison.byIndicator, { title: "Comparativo por Indicador", subtitle: "Indicadores participantes e informativos consolidados." })}
  </div>`;
}

function renderDashboardGraphicPanel() {
  const container = document.getElementById("dashboardGraphicPanel");
  if (!container) return;
  const campaign = activeCampaign();
  const partial = selectedDashboardPartial();
  const period = partial ? getPeriodForPartial(partial, campaign) : null;
  const records = partial ? officialPartialRecords(partial, dashboardBaseSellers(), { metricName: activeDashboardIndicator }) : [];
  container.innerHTML = partialGraphicMarkup({
    title: "Visão gráfica consolidada",
    subtitle: "Veja o desempenho consolidado da operação na parcial atual.",
    partial,
    period,
    records,
    emptyMessage: "Nenhuma parcial publicada para gerar a visão gráfica consolidada.",
  });
}

function renderDashboardCommercialPanel() {
  const container = document.getElementById("dashboardCommercialPanel");
  if (!container) return;
  const partial = selectedDashboardPartial();
  const sellers = dashboardSellers();
  const records = partial ? officialPartialRecords(partial, sellers, { metricName: "Todos" }) : [];
  container.innerHTML = commercialReadingMarkup({
    title: "Leitura comercial da rede",
    subtitle: "Indicadores complementares de qualidade e composicao da venda.",
    records,
    emptyMessage: "Nenhuma parcial oficial publicada para leitura comercial da rede.",
  });
}

function renderDashboardPartialPanel() {
  const container = document.getElementById("dashboardPartialPanel");
  const hero = document.getElementById("dashboardHero");
  const criticalPanel = document.getElementById("dashboardCriticalPanel");
  const infoPanel = document.getElementById("dashboardPartialInfo");
  const partial = selectedDashboardPartial();
  if (!partial) {
    if (hero) hero.innerHTML = `<div><p class="eyebrow">Dashboard executivo</p><h2>Dashboard Executivo</h2><span>Nenhuma parcial publicada para esta campanha.</span></div>`;
    if (container) container.innerHTML = `<div class="dashboard-card-head"><div><h3>Blocos de metas da rede</h3><p>Publique uma parcial para visualizar a analise por bloco.</p></div></div>`;
    if (criticalPanel) criticalPanel.innerHTML = `<div class="dashboard-card-head"><div><h3>Indicadores abaixo de 80%</h3><p>Nenhuma parcial publicada para esta campanha.</p></div></div>`;
    if (infoPanel) infoPanel.innerHTML = `<div class="dashboard-card-head"><div><h3>Informacoes da parcial</h3><p>Nenhuma parcial publicada.</p></div></div>`;
    return;
  }
  const records = officialPartialRecords(partial, dashboardBaseSellers(), { metricName: activeDashboardIndicator });
  const totals = partialRecordTotals(records);
  const campaign = activeCampaign();
  const period = getPeriodForPartial(partial, campaign);
  const periodWarning = partialPeriodWarning(partial, campaign);
  const blockRows = consolidatedBlockRows(records);
  const metricRows = dashboardCriticalMetricRows(records, 8);
  const branchRows = [...groupItems(records, (record) => record.seller.branch || record.item.branch).entries()].map(([branch, items]) => {
    const stats = branchGoalCompletionStats(items);
    const branchTotals = partialRecordTotals(items);
    const critical = branchCriticalMetricRows(items, 2);
    const volume = indicatorVolumeStats(consolidatedMetricGoalRows(items));
    return { branch, stats, totals: branchTotals, critical, ...volume };
  }).sort((a, b) =>
    Number(b.projectedMetCount || 0) - Number(a.projectedMetCount || 0)
    || Number(b.projectedAverage ?? -1) - Number(a.projectedAverage ?? -1)
    || Number(a.criticalCount || 0) - Number(b.criticalCount || 0)
    || a.branch.localeCompare(b.branch)
  ).slice(0, 8);
  const partialHistoric = !partialIsLatest(partial, campaign);
  if (hero) {
    hero.innerHTML = `<div>
      <p class="eyebrow">Dashboard executivo</p>
      <h2>Dashboard Executivo</h2>
      <span>${escapeHtml(campaign?.name || "Campanha atual")} - ${escapeHtml(campaign?.reference || state.month || "")}</span>
      <span>${partialHistoric ? "Você está analisando uma parcial histórica" : "Você está analisando a última parcial publicada"}: ${escapeHtml(partial.name)} - Base ${escapeHtml(partial.baseDate || "-")}</span>
    </div>
    <div class="dashboard-hero-meta">
      <span><strong>Parcial</strong>${escapeHtml(partial.name)}</span>
      <span><strong>Base</strong>${escapeHtml(partial.baseDate || "-")}</span>
      <span><strong>Status</strong><em class="status ok">${escapeHtml(partial.status)}</em></span>
      <span><strong>Dias</strong>${period.daysDone || "-"} de ${period.daysTotal || "-"}</span>
      ${partialVisibilityBadge(partial, campaign)}
    </div>`;
  }
  if (container) container.innerHTML = `<div class="dashboard-card-head">
    <div><h3>Blocos de metas da rede</h3><p>Consolidado da parcial oficial por bloco, sem multiplicar por vendedor.</p></div>
  </div>
  <div class="block-summary-grid dashboard-block-grid">
    ${blockRows.map(blockSummaryCardMarkup).join("")}
  </div>`;
  if (criticalPanel) criticalPanel.innerHTML = `<div class="dashboard-card-head">
    <div><h3>Indicadores abaixo de 80%</h3><p>Ordenado do indicador mais critico para o menos critico.</p></div>
  </div>
  <div class="partial-dashboard-grid dashboard-critical-grid">
    <div><h4>Indicadores abaixo de 80%</h4>${metricRows.map(partialDashboardRowMarkup).join("") || `<p class="muted-note">Nenhum indicador critico abaixo de 80%.</p>`}</div>
    <div><h4>Atingimento por filial</h4><div class="dashboard-branch-ranking-list compact">${branchRows.map((row, index) => branchRankingRowMarkup(row, index)).join("") || `<p class="muted-note">Sem filiais no filtro atual.</p>`}</div></div>
  </div>`;
  if (infoPanel) infoPanel.innerHTML = `<div class="dashboard-card-head">
    <div><h3>Informacoes da parcial</h3><p>Dados operacionais da importacao publicada.</p></div>
  </div>
  <div class="partial-meta-line">
    <strong>${escapeHtml(partial.name)}</strong>
    <span>Base ${escapeHtml(partial.baseDate || "-")} | ${period.daysDone || "-"} de ${period.daysTotal || "-"} dias | ${totals.sellerIds.size} vendedores | ${totals.branches.size} filiais | ${records.length} linhas publicadas</span>
    ${periodWarning ? `<small class="warning">${escapeHtml(periodWarning)}</small>` : ""}
  </div>`;
}

function partialDashboardRowMarkup(row) {
  const percent = effectiveAttainmentPercent(row);
  const width = Number.isFinite(percent) ? Math.min(100, Math.max(3, percent * 100)) : 0;
  const cls = achievementClass(Number.isFinite(percent) ? percent : null);
  const label = !Number.isFinite(percent) ? "-" : `${formatPercent(percent)} ${row.projectedPercent === null ? "atual" : "proj."}`;
  return `<div class="partial-dashboard-row ${cls}">
    <strong title="${escapeHtml(row.key)}">${escapeHtml(row.key)}<small>${row.sellerIds?.size || 0} vendedor(es) | ${row.branchIds?.size || 0} filial(is)</small></strong>
    <span class="partial-dashboard-track"><i style="width:${width}%"></i></span>
    <em>${label}</em>
  </div>`;
}

function branchRankingRowMarkup(row, index) {
  const percent = row.projectedRatio === null ? null : Number(row.projectedRatio);
  const width = Number.isFinite(percent) ? Math.min(100, Math.max(2, percent * 100)) : 0;
  const critical = row.critical.map((item) => `${dashboardMetricRowName(item)}: ${formatPercent(effectiveAttainmentPercent(item))}`).join(", ") || "Nenhum";
  return `<div class="dashboard-branch-ranking-row ${achievementClass(percent)}">
    <strong>${index + 1}</strong>
    <span class="dashboard-branch-ranking-name">${escapeHtml(row.branch)}<small>Hoje: ${indicatorCountText(row.currentMetCount, row.indicatorCount)} | Projecao: ${indicatorCountText(row.projectedMetCount, row.indicatorCount)} indicadores</small></span>
    <span class="dashboard-branch-ranking-track"><i style="width:${width}%"></i></span>
    <em>${indicatorCountText(row.projectedMetCount, row.indicatorCount)}</em>
    <small class="dashboard-branch-ranking-critical">Críticos: ${escapeHtml(critical)}</small>
  </div>`;
}
function dashboardStatusFromPercent(percent) {
  if (percent === null || percent === undefined || !Number.isFinite(Number(percent))) return { label: "Sem metas", cls: "neutral", action: "Revisar meta" };
  if (percent >= 1) return { label: "Acima da meta", cls: "ok", action: "Acompanhamento" };
  if (percent >= 0.8) return { label: "Em atenção", cls: "warn", action: "Plano de ação" };
  return { label: "Crítico", cls: "bad", action: "Ação imediata" };
}

function sellerDashboardStatus(seller) {
  const result = dashboardSellerSummaryResult(seller);
  return dashboardStatusFromPercent(result.projectedPercent ?? result.currentPercent);
}

function sellerHasProjectedDeflator(seller) {
  return sellerResult(seller).projectedDeflator < 0;
}

function selectedDashboardMetric(seller) {
  if (activeDashboardIndicator === "Todos") return null;
  return metricsFor(seller.area).find((metric) => metric.name === activeDashboardIndicator) || null;
}

function dashboardSellerSummaryResult(seller) {
  const result = sellerResult(seller);
  const metric = selectedDashboardMetric(seller);
  const estornos = result.estornos || 0;
  if (metric) {
    const projectedNoDeflator = metricCommission(seller, metric, "projected");
    const currentNoDeflator = metricCommission(seller, metric, "current");
    return {
      current: currentNoDeflator + result.currentDeflator - estornos,
      projectedNoDeflator,
      deflator: result.projectedDeflator,
      estornos,
      finalProjected: projectedNoDeflator + result.projectedDeflator - estornos,
      currentPercent: metricAttainmentForSeller(seller, metric.id, false),
      projectedPercent: metricAttainmentForSeller(seller, metric.id, true),
    };
  }
  const projectedNoDeflator = result.projectedSubtotal;
  return {
    current: result.current,
    projectedNoDeflator,
    deflator: result.projectedDeflator,
    estornos,
    finalProjected: result.projected,
    currentPercent: totalAttainmentForSellers([seller], "current"),
    projectedPercent: totalAttainmentForSellers([seller], "projected"),
  };
}

function dashboardSellers() {
  return dashboardBaseSellers().filter((seller) => {
    const partial = selectedDashboardPartial();
    const records = partial ? officialPartialRecords(partial, [seller], { metricName: activeDashboardIndicator }) : [];
    const hasPartial = records.length > 0;
    const statusOk = activeDashboardStatus === "Todos" || (hasPartial && partialRecordTotals(records).status.label === activeDashboardStatus);
    const deflatorOk = true;
    return hasPartial && statusOk && deflatorOk;
  });
}

function branchDashboardRows(sellers) {
  const partial = selectedDashboardPartial();
  const records = officialPartialRecords(partial, sellers, { metricName: activeDashboardIndicator });
  return [...groupItems(records, (record) => record.seller.branch || record.item.branch).entries()].map(([branch, items]) => {
    const metricRows = consolidatedMetricGoalRows(items);
    const volume = indicatorVolumeStats(metricRows);
    const totals = consolidatedMetricTotals(metricRows);
    return {
      branch,
      sellers: partialRecordTotals(items).sellerIds,
      items,
      metricRows,
      ...volume,
      goal: totals.goal,
      realized: totals.realized,
      projectedValue: totals.projected,
      commissionProjected: totals.projected,
      currentPercent: volume.currentAverage,
      projectedPercent: volume.projectedAverage,
      gap: totals.gap,
      status: goalCompletionStatus(volume.projectedRatio),
    };
  });
}

function dashboardTotals(sellers) {
  const records = officialPartialRecords(selectedDashboardPartial(), sellers, { metricName: activeDashboardIndicator });
  const totals = partialRecordTotals(records);
  return { current: totals.realized, gross: totals.realized, projected: totals.projected, gain: Math.max((totals.projected || 0) - (totals.realized || 0), 0), deflator: 0, estornos: 0, gap: totals.gap, partial: totals };
}

function dashboardAttainmentForSellers(sellers, mode) {
  const records = officialPartialRecords(selectedDashboardPartial(), sellers, { metricName: activeDashboardIndicator });
  const totals = partialRecordTotals(records);
  return mode === "projected" ? totals.projectedPercent : totals.percent;
}

function renderDashboard() {
  renderBranchFilter();
  const baseSellers = dashboardBaseSellers();
  renderDashboardFilterControls(baseSellers);
  renderDashboardPartialPanel();
  renderDashboardGraphicPanel();
  const sellers = dashboardSellers();
  renderDashboardCommercialPanel();
  const empty = document.getElementById("dashboardEmptyState");
  const hasData = sellers.length > 0;
  if (empty) {
    empty.classList.toggle("active", !hasData);
    empty.innerHTML = !hasData ? `<strong>Nenhum dado disponivel para a parcial oficial selecionada.</strong><span>Publique uma parcial no Admin para visualizar o Dashboard.</span>` : "";
  }

  const totals = dashboardTotals(sellers);
  const totalCurrentPercent = dashboardAttainmentForSellers(sellers, "current");
  const totalProjectedPercent = dashboardAttainmentForSellers(sellers, "projected");
  const branchRows = branchDashboardRows(sellers);
  const riskBranches = branchRows.filter((row) => effectiveAttainmentPercent(row) !== null && effectiveAttainmentPercent(row) < 0.8).length;
  const records = officialPartialRecords(selectedDashboardPartial(), sellers, { metricName: activeDashboardIndicator });
  const sellerRows = sellerRecordAnalyticRows(records);
  const dashboardIndicators = indicatorVolumeStats(consolidatedMetricGoalRows(records));
  const lowSellers = sellerRows.filter((row) => row.projectedAverage !== null && row.projectedAverage < 0.8).length;
  const offender = dashboardCriticalMetricRows(records, 1)[0];
  const bestBranch = bestBranchByIndicatorVolume(branchRows);

  renderDashboardExecutiveCards(totals, totalCurrentPercent, totalProjectedPercent, riskBranches, lowSellers, bestBranch, offender, dashboardIndicators);
  renderExecutiveSummary(sellers, branchRows, riskBranches, lowSellers, dashboardIndicators);
  renderSellerSummary(sellers);
  renderBranchAttainmentBars(records);
  renderBranchCommissionBars(records);
  renderRanking(sellers);
  renderCriticalGoals(sellers);
  renderAttentionPoints(sellers, branchRows, totalCurrentPercent, totalProjectedPercent);
}

function renderDashboardExecutiveCards(totals, currentPercent, projectedPercent, riskBranches, lowSellers, bestBranch, offender, indicators) {
  const container = document.getElementById("dashboardExecutiveCards");
  if (!container) return;
  const cards = [
    ["Vendedores", String(totals.partial?.sellerIds?.size || 0), "com parcial oficial", "star", 1],
    ["Indicadores na meta hoje", indicatorCountText(indicators.currentMetCount, indicators.indicatorCount), "rede hoje", "percent", indicators.currentRatio],
    ["Indicadores projetados", indicatorCountText(indicators.projectedMetCount, indicators.indicatorCount), "na meta ate o fechamento", "trend", indicators.projectedRatio],
    ["Filiais criticas", String(riskBranches), "Abaixo de 80% projetado", "alert", riskBranches ? 0 : 1],
    ["Vendedores abaixo de 80%", String(lowSellers), "projecao individual", "alert", lowSellers ? 0 : 1],
    ["Melhor filial", bestBranch?.branch || "-", bestBranch ? `Projeta ${indicatorCountText(bestBranch.projectedMetCount, bestBranch.indicatorCount)}` : "Sem filial", "star", bestBranch?.projectedRatio ?? null],
    ["Principal ofensor", offender?.key || "-", offender?.projectedPercent !== null && offender ? `${formatPercent(offender.projectedPercent)} projetado` : "Sem indicador", "target", offender?.projectedPercent ?? null],
  ];
  const financialComposition = `<article class="dashboard-kpi dashboard-finance-composition">
    <span aria-hidden="true"></span>
    <div>
      <small>Parcial oficial</small>
      <div class="finance-mini-grid">
        <strong><b>Realizado</b>${num.format(totals.current)}</strong>
        <strong><b>Projetado</b>${totals.projected ? num.format(totals.projected) : "-"}</strong>
        <strong><b>% parcial</b>${formatPercent(currentPercent)}</strong>
        <strong><b>% projetado</b>${formatPercent(projectedPercent)}</strong>
      </div>
    </div>
  </article>`;
  container.innerHTML = cards.map(([label, value, detail, icon, percent]) => `<article class="dashboard-kpi ${icon}">
    <span aria-hidden="true"></span>
    <div><small>${label}</small><strong>${value}</strong><em class="${achievementClass(percent)}">${detail}</em></div>
  </article>`).join("") + financialComposition;
}

function renderExecutiveSummary(sellers, branchRows, riskBranches, lowSellers, indicators) {
  const container = document.getElementById("executiveSummary");
  if (!container) return;
  if (!sellers.length) {
    container.textContent = "Ainda nao ha dados suficientes para gerar um resumo executivo da parcial oficial.";
    return;
  }
  {
    const records = officialPartialRecords(selectedDashboardPartial(), sellers, { metricName: activeDashboardIndicator });
    const bestBranch = bestBranchByIndicatorVolume(branchRows);
    const priorities = dashboardCriticalMetricRows(records, 3).map((row) => row.key).join(", ") || "Nenhuma prioridade critica";
    const situation = indicators.projectedMetCount >= indicators.indicatorCount && indicators.indicatorCount
      ? "A operacao projeta fechar todos os indicadores principais na meta."
      : indicators.projectedMetCount > indicators.currentMetCount
        ? "A operacao melhora na projecao, mas ainda exige atuacao nos indicadores criticos."
        : "A operacao esta abaixo do ritmo esperado nos indicadores principais.";
    container.innerHTML = `<div class="executive-summary-grid">
      <article><span>Situacao geral</span><strong>${escapeHtml(situation)}</strong></article>
      <article><span>Indicadores da rede</span><strong>Hoje: ${indicatorCountText(indicators.currentMetCount, indicators.indicatorCount)} na meta.</strong><strong>Projecao: ${indicatorCountText(indicators.projectedMetCount, indicators.indicatorCount)} na meta.</strong></article>
      <article><span>Melhor desempenho</span><strong>${bestBranch ? `${escapeHtml(bestBranch.branch)} lidera com projecao de ${indicatorCountText(bestBranch.projectedMetCount, bestBranch.indicatorCount)} indicadores na meta.` : "Sem filial lider definida."}</strong>${bestBranch?.projectedAverage !== null && bestBranch ? `<small>Media projetada: ${formatPercent(bestBranch.projectedAverage)}</small>` : ""}</article>
      <article><span>Pontos de atencao</span><strong>${riskBranches} filial(is) critica(s) e ${lowSellers} vendedor(es) abaixo de 80% projetado.</strong></article>
      <article><span>Prioridade sugerida</span><strong>Atuar em ${escapeHtml(priorities)} antes da proxima parcial.</strong></article>
    </div>`;
    return;
  }
}

function renderSellerSummary(sellers) {
  const body = document.getElementById("sellerSummaryBody");
  if (!body) return;
  const records = officialPartialRecords(selectedDashboardPartial(), sellers, { metricName: activeDashboardIndicator });
  const rows = sortGoalCompletionRows(sellerRecordAnalyticRows(records));
  body.innerHTML = rows.map((row) => {
    const status = row.status;
    const detailRows = activeDashboardSellerDetailId === row.seller.id
      ? `<tr class="dashboard-detail-row"><td colspan="9">${dashboardSellerDetailMarkup(row.records)}</td></tr>`
      : "";
    return `<tr>
      <td data-label="Vendedor">${escapeHtml(row.seller.name)}</td>
      <td data-label="Filial">${escapeHtml(row.seller.branch)}</td>
      <td data-label="% metas">${achievementPill(row.metPercent)}<small>${row.metCount}/${row.applicableCount}</small></td>
      <td data-label="% projetado">${achievementPill(row.projectedAverage)}</td>
      <td data-label="Criticos">${row.criticalCount}</td>
      <td data-label="Bloco critico">${escapeHtml(row.criticalBlock)}</td>
      <td data-label="Indicador critico">${escapeHtml(row.criticalMetric?.metric?.name || row.criticalMetric?.item?.metricName || "-")}</td>
      <td data-label="Status"><span class="status ${status.cls}">${status.label}</span></td>
      <td data-label="Detalhes"><button class="ghost-button compact-action" type="button" data-dashboard-seller-detail="${escapeHtml(row.seller.id)}">${activeDashboardSellerDetailId === row.seller.id ? "Ocultar" : "Detalhes"}</button></td>
    </tr>${detailRows}`;
  }).join("") || `<tr><td colspan="9">Nenhum vendedor na parcial oficial selecionada.</td></tr>`;
}

function dashboardSellerDetailMarkup(records) {
  return `<div class="dashboard-detail-card-grid">${records.map((record) => `<article class="dashboard-detail-card ${record.status.cls}">
    <span>${escapeHtml(metricGroupDisplay(record.groupMeta))}</span>
    <strong>${escapeHtml(record.metric?.name || record.item.metricName)}</strong>
    <dl>
      <div><dt>Meta</dt><dd>${record.goal ? formatMetricAmount(record.metric, record.goal) : record.participates ? "Meta nao configurada" : "Informativo"}</dd></div>
      <div><dt>Realizado</dt><dd>${formatMetricAmount(record.metric, record.realized)}</dd></div>
      <div><dt>Projecao</dt><dd>${record.projectedValue === null ? "-" : formatMetricAmount(record.metric, record.projectedValue)}</dd></div>
      <div><dt>% proj.</dt><dd>${achievementPill(record.projectedPercent)}</dd></div>
    </dl>
    <em class="status ${record.status.cls}">${record.status.label}</em>
  </article>`).join("")}</div>`;
}

function chartTone(percent) {
  if (percent === null || percent === undefined || !Number.isFinite(Number(percent))) return "neutral";
  if (percent >= 1) return "ok";
  if (percent >= 0.8) return "warn";
  return "bad";
}

function renderBranchAttainmentBars(records) {
  const container = document.getElementById("branchAttainmentBars");
  if (!container) return;
  const branchRows = [...groupItems(records, (record) => record.seller.branch || record.item.branch).entries()].map(([branch, items]) => {
    const metricRows = consolidatedMetricGoalRows(items);
    const volume = indicatorVolumeStats(metricRows);
    const totals = partialRecordTotals(items);
    const critical = branchCriticalMetricRows(items, 3);
    const mainCritical = critical[0];
    const stats = branchGoalCompletionStats(items);
    return { branch, items, stats, totals, critical, mainCritical, ...volume, status: goalCompletionStatus(volume.projectedRatio) };
  }).sort((a, b) =>
    Number(a.projectedMetCount ?? 999) - Number(b.projectedMetCount ?? 999)
    || Number(a.projectedAverage ?? 999) - Number(b.projectedAverage ?? 999)
    || a.branch.localeCompare(b.branch)
  );
  container.innerHTML = `<div class="dashboard-branch-table">${branchRows.map((row) => {
    const isOpen = activeDashboardBranchDetail === row.branch;
    const criticalText = row.critical.map((item) => dashboardMetricRowName(item)).slice(0, 3).join(", ") || "Nenhum";
    return `<article class="dashboard-branch-row ${row.status.cls}">
      <div><span>Filial</span><strong>${escapeHtml(row.branch)}</strong></div>
      <div><span>Hoje na meta</span><strong>${indicatorCountText(row.currentMetCount, row.indicatorCount)}</strong><small>indicadores</small></div>
      <div><span>Projetados na meta</span><strong>${indicatorCountText(row.projectedMetCount, row.indicatorCount)}</strong><small>Media ${formatPercent(row.projectedAverage)}</small></div>
      <div><span>Indicadores &lt;80%</span><strong>${row.critical.length}</strong><small>${escapeHtml(criticalText)}</small></div>
      <div><span>Principal ofensor</span><strong>${escapeHtml(dashboardMetricRowName(row.mainCritical))}</strong></div>
      <div><span>Status</span><strong><em class="status ${row.status.cls}">${row.status.label}</em></strong></div>
      <button class="ghost-button compact-action" type="button" data-dashboard-branch-detail="${escapeHtml(row.branch)}">${isOpen ? "Ocultar" : "Detalhes"}</button>
      ${isOpen ? `<div class="dashboard-branch-detail">${dashboardBranchDetailMarkup(row.items)}</div>` : ""}
    </article>`;
  }).join("") || `<p class="muted-note">Sem filiais no filtro atual.</p>`}</div>`;
  return;
  const detailScope = activeBranchFilter === "Todas" ? "Rede" : activeBranchFilter;
  const detailRows = [...groupItems(records, (record) => `${record.groupMeta}|${record.metric?.id || record.item.metricName}`).entries()].map(([key, items]) => {
    const [group] = key.split("|");
    const sample = items[0];
    const totals = partialRecordTotals(items);
    return { group, metric: sample.metric, metricName: sample.metric?.name || sample.item.metricName, totals, sample };
  }).filter((row) => effectiveAttainmentPercent(row.totals) !== null)
    .sort((a, b) => PRIMARY_METRIC_GROUPS.indexOf(a.group) - PRIMARY_METRIC_GROUPS.indexOf(b.group) || effectiveAttainmentPercent(a.totals) - effectiveAttainmentPercent(b.totals));
  container.innerHTML = `
    <div class="dashboard-detail-table-head">
      <div><h4>Detalhes por indicador</h4><p>${escapeHtml(detailScope)} consolidado por indicador, no mesmo padrão da tela Filial.</p></div>
    </div>
    <div class="table-wrap dashboard-table-wrap"><table><thead><tr><th>Bloco</th><th>Indicador</th><th>Meta consolidada</th><th>Realizado</th><th>% parcial</th><th>Projecao</th><th>% proj.</th><th>Falta</th><th>Ritmo/dia</th><th>Status</th></tr></thead><tbody>${detailRows.map((row) => `<tr><td>${escapeHtml(metricGroupDisplay(row.group))}</td><td>${escapeHtml(row.metricName)}</td><td>${row.totals.goal ? formatMetricAmount(row.metric, row.totals.goal) : row.sample.participates ? "Meta nao configurada" : "Informativo"}</td><td>${formatMetricAmount(row.metric, row.totals.realized)}</td><td>${achievementPill(row.totals.percent)}</td><td>${formatMetricAmount(row.metric, row.totals.projected)}</td><td>${achievementPill(row.totals.projectedPercent)}</td><td>${row.totals.gap === null ? "-" : formatMetricAmount(row.metric, row.totals.gap)}</td><td>${row.totals.paceNeeded === null ? "-" : formatMetricPace(row.metric, row.totals.paceNeeded)}</td><td><span class="status ${row.totals.status.cls}">${row.totals.status.label}</span></td></tr>`).join("") || `<tr><td colspan="10">Sem dados por indicador no filtro atual.</td></tr>`}</tbody></table></div>`;
}

function dashboardBranchDetailMarkup(records) {
  const detailRows = [...groupItems(records, (record) => `${record.groupMeta}|${record.metric?.id || record.item.metricName}`).entries()].map(([key, items]) => {
    const [group] = key.split("|");
    const sample = items[0];
    const totals = partialRecordTotals(items);
    return { group, metric: sample.metric, metricName: sample.metric?.name || sample.item.metricName, totals, sample };
  }).sort((a, b) => PRIMARY_METRIC_GROUPS.indexOf(a.group) - PRIMARY_METRIC_GROUPS.indexOf(b.group)
    || (effectiveAttainmentPercent(a.totals) ?? 999) - (effectiveAttainmentPercent(b.totals) ?? 999)
    || a.metricName.localeCompare(b.metricName));
  return `<div class="dashboard-detail-card-grid">${detailRows.map((row) => `<article class="dashboard-detail-card ${row.totals.status.cls}">
    <span>${escapeHtml(metricGroupDisplay(row.group))}</span>
    <strong>${escapeHtml(row.metricName)}</strong>
    <dl>
      <div><dt>Meta</dt><dd>${row.totals.goal ? formatMetricAmount(row.metric, row.totals.goal) : row.sample.participates ? "Meta nao configurada" : "Informativo"}</dd></div>
      <div><dt>Realizado</dt><dd>${formatMetricAmount(row.metric, row.totals.realized)}</dd></div>
      <div><dt>Projecao</dt><dd>${formatMetricAmount(row.metric, row.totals.projected)}</dd></div>
      <div><dt>% proj.</dt><dd>${achievementPill(row.totals.projectedPercent)}</dd></div>
      <div><dt>Gap</dt><dd>${row.totals.gap === null ? "-" : formatMetricAmount(row.metric, row.totals.gap)}</dd></div>
      <div><dt>Ritmo/dia</dt><dd>${row.totals.paceNeeded === null ? "-" : formatMetricPace(row.metric, row.totals.paceNeeded)}</dd></div>
    </dl>
    <em class="status ${row.totals.status.cls}">${row.totals.status.label}</em>
  </article>`).join("") || `<p class="muted-note">Sem dados por indicador no filtro atual.</p>`}</div>`;
}

function renderBranchCommissionBars(records) {
  const container = document.getElementById("branchCommissionBars");
  if (!container) return;
  const blockRows = consolidatedBlockRows(records).filter((row) => row.applicableCount);
  const priorities = blockRows
    .filter((row) => {
      const percent = effectiveAttainmentPercent(row.totals);
      return (percent !== null && percent < 1) || row.criticalCount;
    })
    .sort((a, b) => (effectiveAttainmentPercent(a.totals) ?? 999) - (effectiveAttainmentPercent(b.totals) ?? 999))
    .slice(0, 3);
  container.innerHTML = priorities.map((row, index) => {
    const percent = effectiveAttainmentPercent(row.totals);
    return `<div class="attention-row ${percent !== null && percent < 0.8 ? "bad" : "warn"}"><strong>${index + 1}. Atuar em ${escapeHtml(metricGroupDisplay(row.key))}</strong><span>${row.criticalCount} indicador(es) abaixo de 80%; projeção do bloco ${achievementPill(row.totals.projectedPercent)}.</span></div>`;
  }).join("") || `<p class="muted-note">Nenhuma prioridade critica no filtro atual.</p>`;
}

function renderRanking(sellers) {
  const container = document.getElementById("rankingList");
  if (!container) return;
  const records = officialPartialRecords(selectedDashboardPartial(), sellers, { metricName: activeDashboardIndicator });
  const ranked = sortGoalCompletionRows(sellerRecordAnalyticRows(records)).slice(0, 8);
  container.innerHTML = ranked.map((row, index) => `<div class="executive-list-row"><strong>${index + 1}</strong><span>${escapeHtml(row.seller.name)}<small>${escapeHtml(row.seller.branch)} | ${row.metCount}/${row.applicableCount} metas | ${row.criticalCount} critico(s)</small></span><em>${achievementPill(row.metPercent)}</em></div>`).join("") || `<p class="muted-note">Sem dados suficientes para ranking.</p>`;
}

function renderTopSellers(sellers) {
  const container = document.getElementById("topSellersList");
  if (!container) return;
  const records = officialPartialRecords(selectedDashboardPartial(), sellers, { metricName: activeDashboardIndicator });
  const ranked = sortGoalCompletionRows(sellerRecordAnalyticRows(records)).slice(0, 5);
  container.innerHTML = ranked.map((row, index) => `<div class="executive-list-row"><strong>${index + 1}</strong><span>${escapeHtml(row.seller.name)}<small>${escapeHtml(row.seller.branch)} | ${row.metCount}/${row.applicableCount} metas</small></span><em class="${achievementClass(row.metPercent)}">${achievementPill(row.metPercent)}</em></div>`).join("") || `<p class="muted-note">Sem dados suficientes para top vendedores.</p>`;
}

function renderCriticalGoals(sellers) {
  const container = document.getElementById("goalOffenderList");
  if (!container) return;
  const records = officialPartialRecords(selectedDashboardPartial(), sellers, { metricName: activeDashboardIndicator });
  const rows = dashboardCriticalMetricRows(records, 8);
  container.innerHTML = rows.map((row) => {
    const status = partialStatusFromProjected(row.projectedPercent, row.percent);
    return `<div class="critical-row">
      <strong>${escapeHtml(row.key)}</strong>
      <span>Abaixo de 80%</span>
      <span>${row.sellerIds.size} vendedor${row.sellerIds.size === 1 ? "" : "es"}</span>
      <span>${achievementPill(row.projectedPercent)}</span>
      <em class="status ${status.cls}">${status.label}</em>
      <small>${row.branchIds.size} filial(is) impactada(s)</small>
    </div>`;
  }).join("") || `<p class="muted-note">Nenhum indicador abaixo de 80% no filtro atual.</p>`;
}

function renderAttentionPoints(sellers, branchRows, currentPercent, projectedPercent) {
  const container = document.getElementById("attentionPointsList");
  if (!container) return;
  const records = officialPartialRecords(selectedDashboardPartial(), sellers, { metricName: activeDashboardIndicator });
  const criticalMetrics = dashboardCriticalMetricRows(records, 50)
    .sort((a, b) => b.branchIds.size - a.branchIds.size || effectiveAttainmentPercent(a) - effectiveAttainmentPercent(b))
    .slice(0, 5);
  const points = [];
  for (const row of criticalMetrics) points.push({ cls: "bad", title: `${row.key}: abaixo de 80% em ${row.branchIds.size} filial(is)`, detail: `${achievementPill(row.projectedPercent)} projetado | ${row.sellerIds.size} vendedor(es) impactado(s).` });
  if (projectedPercent !== null && projectedPercent < 1 && !points.length) points.push({ cls: "warn", title: "Projecao consolidada abaixo de 100%", detail: `Atingimento projetado em ${formatPercent(projectedPercent)}.` });
  if (!points.length && sellers.length) points.push({ cls: "ok", title: "Nenhum indicador critico abaixo de 80%", detail: `Parcial oficial com ${formatPercent(projectedPercent)} projetado.` });
  container.innerHTML = points.map((point) => `<div class="attention-row ${point.cls}"><strong>${escapeHtml(point.title)}</strong><span>${point.detail}</span></div>`).join("") || `<p class="muted-note">Nenhum dado disponivel.</p>`;
}
function branchOptions(selected) {
  return branches().map((branch) => `<option value="${branch}" ${branch === selected ? "selected" : ""}>${branch}</option>`).join("");
}

function renderBranchEditor() {
  const container = document.getElementById("branchEditorList");
  if (!container) return;
  state.branches = normalizeBranches(state.branches, state.sellers);
  container.innerHTML = state.branches.map((branch) => `
    <div class="branch-card">
      <label>Filial<input data-branch-name="${escapeHtml(branch)}" value="${escapeHtml(branch)}"></label>
      <button class="danger-button" data-delete-branch="${escapeHtml(branch)}" type="button">Excluir filial</button>
    </div>
  `).join("");
}

function campaignSummary(campaign) {
  if (campaign?.snapshot) {
    return {
      sellers: campaign.snapshot.totalSellers,
      branches: campaign.snapshot.totalBranches,
      commissionFinal: campaign.snapshot.commissionFinalTotal,
    };
  }
  const activeId = state.activeCampaignId;
  const currentPayload = campaignPayloadFrom(state);
  try {
    applyCampaignToState(state, campaign);
    return {
      sellers: state.sellers.length,
      branches: branchesFromSellers(state.sellers).length,
      commissionFinal: state.sellers.reduce((sum, seller) => sum + sellerResult(seller).projected, 0),
    };
  } finally {
    applyCampaignToState(state, currentPayload);
    state.activeCampaignId = activeId;
  }
}

function campaignOptionsMarkup(selected = state.activeCampaignId) {
  return (state.campaigns || [])
    .map((campaign) => `<option value="${campaign.id}" ${campaign.id === selected ? "selected" : ""}>${escapeHtml(campaign.name)} - ${escapeHtml(campaign.reference || campaign.period?.month || "")}</option>`)
    .join("");
}

function renderCampaignSelectors() {
  const selected = state.activeCampaignId;
  document.querySelectorAll("[data-campaign-select]").forEach((select) => {
    select.innerHTML = campaignOptionsMarkup(selected);
    if (state.campaigns?.some((campaign) => campaign.id === selected)) select.value = selected;
  });
  const campaign = activeCampaign();
  const status = campaignStatusLabel(campaign);
  document.querySelectorAll("[data-campaign-status]").forEach((badge) => {
    badge.textContent = status;
    badge.className = `campaign-status-badge ${campaignStatusClass(status)}`;
  });
}

function moduleCampaignSelectorMarkup(scope) {
  const status = campaignStatusLabel();
  return `<div class="module-campaign-box">
    <label>Campanha<select data-campaign-select="${escapeHtml(scope)}">${campaignOptionsMarkup()}</select></label>
    <span class="campaign-status-badge ${campaignStatusClass(status)}" data-campaign-status="${escapeHtml(scope)}">${escapeHtml(status)}</span>
  </div>`;
}

function campaignStatusClass(status) {
  if (status === CAMPAIGN_STATUS.OPEN) return "ok";
  if (status === CAMPAIGN_STATUS.OFFICIAL_CLOSED) return "neutral";
  if (status === CAMPAIGN_STATUS.ADMIN_CLOSING) return "warn";
  return "bad";
}

function closingIndicatorValueMarkup(indicator, field) {
  const metric = { unit: indicator.unit || "", tipoIndicador: indicator.tipoIndicador || "", type: indicator.tipoIndicador === "receita" ? "revenue" : "unit100" };
  if (field === "percent") return achievementPill(indicator.currentPercent);
  if (field === "projectedPercent") return achievementPill(indicator.projectedPercent);
  return formatMetricAmount(metric, indicator[field]);
}

function closingSellerDetailMarkup(row) {
  const indicators = row?.indicators || [];
  const body = indicators.map((indicator) => `<tr>
    <td>${escapeHtml(metricGroupDisplay(indicator.groupMeta))}</td>
    <td>${escapeHtml(indicator.metric || "-")}</td>
    <td>${indicator.participaAtingimento ? closingIndicatorValueMarkup(indicator, "goal") : "Informativo"}</td>
    <td>${closingIndicatorValueMarkup(indicator, "realized")}</td>
    <td>${achievementPill(indicator.currentPercent)}</td>
    <td>${indicator.projected === null ? "-" : closingIndicatorValueMarkup(indicator, "projected")}</td>
    <td>${achievementPill(indicator.projectedPercent)}</td>
    <td>${indicator.missing === null ? "-" : closingIndicatorValueMarkup(indicator, "missing")}</td>
    <td>${escapeHtml(indicator.deflator || "-")}</td>
    <td><span class="status ${partialStatusFromProjected(indicator.projectedPercent, indicator.currentPercent).cls}">${escapeHtml(indicator.status || "-")}</span></td>
  </tr>`).join("");
  return `<div class="closing-detail-card">
    <div class="section-title"><h4>Indicadores do vendedor</h4><p>${escapeHtml(row?.name || "Vendedor")} - snapshot de fechamento.</p></div>
    <div class="table-wrap campaign-closing-panel"><table><thead><tr><th>Bloco</th><th>Indicador</th><th>Meta</th><th>Realizado</th><th>% atual</th><th>Projetado</th><th>% proj.</th><th>Falta</th><th>Deflator</th><th>Status</th></tr></thead><tbody>${body || `<tr><td colspan="10">Nenhum indicador para este vendedor.</td></tr>`}</tbody></table></div>
  </div>`;
}

function campaignClosingRowsMarkup(snapshot = null, options = {}) {
  const canEditEstornos = !options.readOnly && canEditCampaignData() && isAdminUnlocked();
  const rows = snapshot?.sellers || state.sellers.map(sellerClosingRecord);
  return rows.map((row) => {
    const sellerId = row.sellerId || "";
    const detail = activeClosingSellerDetailId === sellerId ? `<tr class="closing-detail-row"><td colspan="10">${closingSellerDetailMarkup(row)}</td></tr>` : "";
    return `<tr>
      <td><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.branch)} - ${escapeHtml(row.area)}</small></td>
      <td>${money.format(row.commissionGross)}</td>
      <td>${money.format(row.deflator)}</td>
      <td><input data-closing-adjustment="quality" data-seller-id="${escapeHtml(sellerId)}" type="number" min="0" step="0.01" value="${Number(row.estornoQuality) || 0}" ${canEditEstornos ? "" : "disabled"}></td>
      <td><input data-closing-adjustment="insurance" data-seller-id="${escapeHtml(sellerId)}" type="number" min="0" step="0.01" value="${Number(row.estornoInsurance) || 0}" ${canEditEstornos ? "" : "disabled"}></td>
      <td><input data-closing-adjustment="carousel" data-seller-id="${escapeHtml(sellerId)}" type="number" min="0" step="0.01" value="${Number(row.estornoCarousel) || 0}" ${canEditEstornos ? "" : "disabled"}></td>
      <td>${discountMoney(row.estornosTotal)}</td>
      <td>${money.format(row.commissionFinal)}</td>
      <td>${row.emExperiencia ? `<span class="status neutral">Em experiencia</span><small>Deflator ignorado</small>` : `<span class="status">${escapeHtml(row.status)}</span>`}</td>
      <td><button class="ghost-button compact-action" data-closing-seller-detail="${escapeHtml(sellerId)}" type="button">${activeClosingSellerDetailId === sellerId ? "Ocultar" : "Detalhes"}</button></td>
    </tr>${detail}`;
  }).join("");
}

function campaignShortStatus(status = campaignStatusLabel()) {
  if (status === CAMPAIGN_STATUS.OPERATIONAL_CLOSED) return "Congelada";
  if (status === CAMPAIGN_STATUS.ADMIN_CLOSING) return "Em revisao";
  if (status === CAMPAIGN_STATUS.OFFICIAL_CLOSED) return "Fechada";
  return "Aberta";
}

function campaignNextActionsMarkup(campaign) {
  const status = campaignStatusLabel(campaign);
  const steps = [
    ["Configurar periodo da campanha", "campanhas", "done"],
    ["Salvar campanha", "campanhas", "done"],
    ["Abrir etapa de congelamento", "fechamento", status === CAMPAIGN_STATUS.OPEN ? "active" : "done"],
    ["Revisar resultados", "fechamento", status === CAMPAIGN_STATUS.OPERATIONAL_CLOSED ? "active" : status === CAMPAIGN_STATUS.OPEN ? "" : "done"],
    ["Lancar estornos", "fechamento", status === CAMPAIGN_STATUS.ADMIN_CLOSING ? "active" : status === CAMPAIGN_STATUS.OFFICIAL_CLOSED ? "done" : ""],
    ["Baixar prévia do arquivo", "fechamento", status === CAMPAIGN_STATUS.ADMIN_CLOSING ? "active" : status === CAMPAIGN_STATUS.OFFICIAL_CLOSED ? "done" : ""],
    ["Fechar comissao oficial", "fechamento", status === CAMPAIGN_STATUS.ADMIN_CLOSING ? "active" : status === CAMPAIGN_STATUS.OFFICIAL_CLOSED ? "done" : ""],
    ["Baixar arquivo oficial", "fechamento", status === CAMPAIGN_STATUS.OFFICIAL_CLOSED ? "done" : ""],
    ["Iniciar novo mes/campanha", "campanhas", status === CAMPAIGN_STATUS.OFFICIAL_CLOSED ? "active" : ""],
  ];
  return steps.map((step, index) => `<button class="campaign-step ${step[2]}" data-admin-tab-jump="${step[1]}" type="button"><span>${index + 1}</span>${escapeHtml(step[0])}</button>`).join("");
}

function renderCampaignAdminPanel() {
  const container = document.getElementById("campaignAdminPanel");
  if (!container) return;
  const campaign = activeCampaign();
  if (!campaign) {
    container.innerHTML = `<div class="section-title"><h3>Campanhas</h3><p>Nenhuma campanha cadastrada. Crie uma campanha para iniciar o acompanhamento de comissoes.</p></div><button id="createCampaign" class="primary-button" type="button">Nova campanha</button>`;
    return;
  }
  const summary = campaignSummary(campaign);
  const officialClosed = isCampaignOfficialClosed(campaign);
  const canAdminEdit = canEditCampaignData();
  const metricCount = ["Cabo", "Nao Cabo"].reduce((total, area) => total + metricsFor(area).length, 0);
  const deflatorCount = ["Cabo", "Nao Cabo"].reduce((total, area) => total + (state.deflators?.[area] || []).length, 0);
  const listRows = state.campaigns.map((item) => {
    const itemSummary = campaignSummary(item);
    return `<tr>
      <td><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.reference || item.period?.month || "")}</small></td>
      <td>${escapeHtml(item.startDate || "-")}</td>
      <td>${escapeHtml(item.operationalCloseDate || "-")}</td>
      <td>${escapeHtml(item.officialCloseDate || item.closedAt?.slice(0, 10) || "-")}</td>
      <td><span class="campaign-status-badge ${campaignStatusClass(item.status)}">${escapeHtml(item.status)}</span></td>
      <td>${itemSummary.sellers}</td>
      <td>${itemSummary.branches}</td>
      <td>${item.officialFileCsv
        ? `<button class="ghost-button compact-action" data-download-campaign="${item.id}" type="button">Baixar oficial</button>`
        : item.status !== CAMPAIGN_STATUS.OFFICIAL_CLOSED
          ? `<button class="ghost-button compact-action" data-download-preview-campaign="${item.id}" type="button">Baixar prévia</button>`
          : "Nao disponivel"}</td>
      <td>
        <button class="ghost-button compact-action" data-select-campaign="${item.id}" type="button">Visualizar</button>
        <button class="ghost-button compact-action" data-duplicate-campaign="${item.id}" type="button">Duplicar</button>
        ${campaignStatusLabel(item) === CAMPAIGN_STATUS.OPEN && !isCampaignOfficialClosed(item) ? `<button class="warning-button compact-action" data-operational-close-campaign="${item.id}" type="button">Congelar</button>` : ""}
        ${canReopenOperationalCampaign(item) ? `<button class="warning-button compact-action" data-reopen-campaign="${item.id}" type="button">Descongelar</button>` : ""}
        <button class="danger-button compact-action" data-delete-campaign="${item.id}" type="button" ${item.status === CAMPAIGN_STATUS.OFFICIAL_CLOSED ? "disabled" : ""}>Excluir</button>
      </td>
    </tr>`;
  }).join("");
  container.innerHTML = `
    <div class="section-title inline-title">
      <div>
        <h3>Admin / Campanha</h3>
        <p>Painel de controle da campanha ativa e historico de campanhas independentes.</p>
      </div>
      <div class="campaign-actions">
        <button id="createCampaign" class="primary-button" type="button">Nova campanha</button>
        <button id="duplicateActiveCampaign" class="ghost-button" type="button">Duplicar campanha</button>
        ${campaignStatusLabel(campaign) === CAMPAIGN_STATUS.OPEN && canAdminEdit && !officialClosed ? `<button class="warning-button" data-operational-close-campaign="${escapeHtml(campaign.id)}" type="button">Congelar campanha</button>` : ""}
        ${canReopenOperationalCampaign(campaign) && canAdminEdit ? `<button class="warning-button" data-reopen-campaign="${escapeHtml(campaign.id)}" type="button">Descongelar campanha</button>` : ""}
      </div>
    </div>
    <div class="campaign-command-card">
      <div>
        <span>Campanha atual</span>
        <strong>${escapeHtml(campaign.name)}</strong>
        <small>${escapeHtml(campaign.reference || campaign.period?.month || "-")}</small>
      </div>
      <div><span>Dias uteis planejados</span><strong>${num.format(campaignPlannedBusinessDays(campaign))}</strong><small>Padrao para novas parciais</small></div>
      <div><span>Ultima parcial</span><strong>${escapeHtml(latestPublishedPartial(campaign)?.name || "Nenhuma")}</strong><small>Dias realizados ficam na parcial</small></div>
      <div><span>Status</span><strong class="${campaignStatusClass(campaign.status)}">${campaignShortStatus(campaign.status)}</strong><small>${escapeHtml(campaign.status)}</small></div>
    </div>
    <div class="campaign-kpi-strip">
      <span>Vendedores ativos<strong>${summary.sellers}</strong></span>
      <span>Filiais ativas<strong>${summary.branches}</strong></span>
      <span>Metas cadastradas<strong>${metricCount}</strong></span>
      <span>Deflatores ativos<strong>${deflatorCount}</strong></span>
    </div>
    <div class="campaign-next-actions">
      <div class="section-title">
        <h3>Proximas acoes</h3>
        <p>Use este roteiro para conduzir a campanha ate o fechamento oficial.</p>
      </div>
      <div class="campaign-step-grid">${campaignNextActionsMarkup(campaign)}</div>
    </div>
    <div class="campaign-current-grid">
      <label>Nome da campanha<input data-campaign-field="name" value="${escapeHtml(campaign.name)}" ${officialClosed && !isOwnerUnlocked() ? "disabled" : ""}></label>
      <label>Mes/ano<input data-campaign-field="reference" value="${escapeHtml(campaign.reference || "")}" ${officialClosed && !isOwnerUnlocked() ? "disabled" : ""}></label>
      <label>Dias uteis planejados<input data-campaign-field="plannedBusinessDays" type="number" min="1" value="${campaignPlannedBusinessDays(campaign)}" ${officialClosed && !isOwnerUnlocked() ? "disabled" : ""}><small>Dias uteis planejados serao usados como padrao para novas parciais.</small></label>
      <label>Data de inicio<input data-campaign-field="startDate" type="date" value="${escapeHtml(campaign.startDate || "")}" ${officialClosed && !isOwnerUnlocked() ? "disabled" : ""}></label>
      <label>Encerramento operacional<input data-campaign-field="operationalCloseDate" type="date" value="${escapeHtml(campaign.operationalCloseDate || "")}" ${officialClosed && !isOwnerUnlocked() ? "disabled" : ""}></label>
      <label>Fechamento oficial<input data-campaign-field="officialCloseDate" type="date" value="${escapeHtml(campaign.officialCloseDate || "")}" ${officialClosed && !isOwnerUnlocked() ? "disabled" : ""}></label>
      <div class="campaign-current-status"><span>Status</span><strong class="${campaignStatusClass(campaign.status)}">${escapeHtml(campaign.status)}</strong></div>
    </div>
    <div class="table-wrap campaign-table-wrap">
      <table>
        <thead><tr><th>Campanha</th><th>Inicio</th><th>Enc. oper.</th><th>Fech. oficial</th><th>Status</th><th>Vendedores</th><th>Filiais</th><th>Arquivo</th><th>Acoes</th></tr></thead>
        <tbody>${listRows}</tbody>
      </table>
    </div>
  `;
}

function createCampaignFromActive(options = {}) {
  if (!requireAdminAction("createCampaign", "Campanhas")) return;
  syncActiveCampaignFromRoot();
  const isDuplicate = Boolean(options.source);
  const reference = options.reference || "Novo periodo";
  const source = isDuplicate ? options.source : emptyCampaignSource(reference);
  const campaign = createCampaignFromSource(source, {
    name: options.name || "Nova campanha",
    reference,
    resetOperational: isDuplicate,
  });
  campaign.period.month = campaign.reference;
  campaign.period.daysDone = 0;
  state.campaigns.push(campaign);
  state.activeCampaignId = campaign.id;
  applyCampaignToState(state, campaign);
  logUpdate({
    action: options.source ? "Duplicou campanha" : "Criou campanha",
    module: "Campanhas",
    campaignId: campaign.id,
    campaignName: campaign.name,
    itemId: campaign.id,
    itemName: campaign.name,
    message: options.source ? `Campanha ${campaign.name} criada a partir de campanha anterior.` : `Campanha ${campaign.name} criada.`,
  });
  saveState(isDuplicate ? "Campanha duplicada" : "Campanha criada vazia");
  renderAll();
}

function duplicateCampaign(campaignId) {
  if (!requireAdminAction("createCampaign", "Campanhas")) return;
  const source = state.campaigns.find((campaign) => campaign.id === campaignId) || activeCampaign();
  if (!source) return;
  createCampaignFromActive({
    source,
    name: `${source.name} - copia`,
    reference: source.reference || source.period?.month || "Novo periodo",
  });
}

function deleteCampaign(campaignId) {
  if (!requireAdminAction("deleteCampaign", "Campanhas")) return;
  const campaign = state.campaigns.find((item) => item.id === campaignId);
  if (!campaign) return;
  if ((state.campaigns || []).length <= 1) {
    alert("Nao e possivel excluir a unica campanha do sistema.");
    return;
  }
  if (isCampaignOfficialClosed(campaign) && !isOwnerUnlocked()) {
    alert("Campanha fechada oficialmente nao pode ser excluida pelo Admin.");
    return;
  }
  const typed = prompt(`Digite a senha admin para excluir a campanha "${campaign.name}".`);
  if (typed === null) return;
  if (typed !== adminPassword()) {
    logAccess({
      status: "Falha",
      profile: "Admin",
      module: "Campanhas",
      action: "Tentativa invalida de exclusao de campanha",
      campaignId: campaign.id,
      campaignName: campaign.name,
      message: "Senha admin invalida ao tentar excluir campanha.",
    }, { persist: true });
    alert("Senha admin invalida. Campanha nao excluida.");
    return;
  }
  if (!confirm(`Confirma a exclusao da campanha "${campaign.name}"? Esta acao remove a campanha da lista e nao deve ser usada para campanhas ja fechadas oficialmente.`)) return;
  syncActiveCampaignFromRoot();
  const deletedName = campaign.name;
  const deletedReference = campaign.reference || campaign.period?.month || "";
  state.campaigns = state.campaigns.filter((item) => item.id !== campaignId);
  if (state.activeCampaignId === campaignId) {
    const nextCampaign = state.campaigns.find((item) => item.status === CAMPAIGN_STATUS.OPEN) || state.campaigns[0];
    state.activeCampaignId = nextCampaign.id;
    applyCampaignToState(state, nextCampaign);
  }
  logUpdate({
    action: "Excluiu campanha",
    module: "Campanhas",
    campaignId,
    campaignName: deletedName,
    itemId: campaignId,
    itemName: deletedName,
    previousValue: `${deletedName} - ${deletedReference}`,
    newValue: "Excluida",
    message: `Admin excluiu a campanha ${deletedName}.`,
  });
  saveState("Campanha excluida");
  renderAll();
}

function downloadCampaignOfficialFile(campaign = activeCampaign()) {
  const closing = officialClosingForCampaign(campaign);
  const snapshot = campaign?.snapshot || closing?.snapshot || null;
  const csv = campaign?.officialFileCsv || (snapshot ? generateOfficialCommissionCsv(snapshot) : "");
  if (!csv) {
    alert("Arquivo oficial nao disponivel para esta campanha.");
    return;
  }
  downloadFile(campaign.officialFileName || closingSnapshotFileName(campaign, snapshot), "text/csv;charset=utf-8", csv);
  logUpdate({
    action: "Baixou arquivo oficial",
    module: "Fechamento",
    campaignId: campaign.id,
    campaignName: campaign.name,
    itemName: campaign.officialFileName || closingSnapshotFileName(campaign, snapshot),
    message: `Arquivo oficial de comissionamento da campanha ${campaign.name} baixado.`,
  }, { persist: true });
}

function previewCampaignFileName(campaign, snapshot) {
  return campaignFileName(campaign, snapshot).replace("Comissao_360_Comissionamento_", "Comissao_360_Previa_");
}

function downloadCampaignPreviewFile(campaign = activeCampaign()) {
  if (!campaign) {
    alert("Nenhuma campanha selecionada.");
    return;
  }
  const closing = closingForCampaign(campaign);
  if (closing) {
    const snapshot = closingSnapshotForDisplay(campaign, closing);
    if (!snapshot) {
      alert("Carregue a base de fechamento antes de baixar a previa.");
      return;
    }
    downloadFile(previewCampaignFileName(campaign, snapshot), "text/csv;charset=utf-8", generateOfficialCommissionCsv(snapshot));
    logUpdate({
      action: "Gerou previa do fechamento",
      module: "Fechamento",
      campaignId: campaign.id,
      campaignName: campaign.name,
      itemId: closing.id,
      itemName: closing.basePartialName,
      message: `Previa do fechamento da campanha ${campaign.name} gerada a partir da ${closing.basePartialName}.`,
    }, { persist: true });
    return;
  }
  const originalRoot = campaign.id !== state.activeCampaignId ? campaignPayloadFrom(state) : null;
  try {
    if (campaign.id === state.activeCampaignId && !isCampaignOfficialClosed(campaign)) {
      syncActiveCampaignFromRoot();
    } else if (campaign.id !== state.activeCampaignId) {
      applyCampaignToState(state, campaign);
    }
    const snapshot = buildCampaignSnapshot(campaign, { status: campaignStatusLabel(campaign) });
    downloadFile(previewCampaignFileName(campaign, snapshot), "text/csv;charset=utf-8", generateOfficialCommissionCsv(snapshot));
    logUpdate({
      action: "Gerou previa do comissionamento",
      module: "Fechamento",
      campaignId: campaign.id,
      campaignName: campaign.name,
      message: `Previa do arquivo de comissionamento da campanha ${campaign.name} gerada.`,
    }, { persist: true });
  } finally {
    if (originalRoot) applyCampaignToState(state, originalRoot);
  }
}

function renderSelectors() {
  const authenticatedCollaborator = resolveAuthenticatedCollaborator();
  const adminSelected = document.getElementById("adminSellerSelect")?.value;
  const collabSelected = authenticatedCollaborator?.id || document.getElementById("collabSellerSelect")?.value;
  const options = state.sellers.map((seller) => `<option value="${seller.id}">${seller.name} - ${seller.branch} - ${seller.area}</option>`).join("");
  const adminSelect = document.getElementById("adminSellerSelect");
  const collabSelect = document.getElementById("collabSellerSelect");
  adminSelect.innerHTML = options;
  collabSelect.innerHTML = options;
  collabSelect.disabled = Boolean(authenticatedCollaborator);
  if (state.sellers.some((seller) => seller.id === adminSelected)) adminSelect.value = adminSelected;
  if (state.sellers.some((seller) => seller.id === collabSelected)) collabSelect.value = collabSelected;
}

function updateAdminTabs() {
  document.querySelectorAll(".admin-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.adminTab === activeAdminTab);
  });
  document.querySelectorAll(".admin-tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.adminPanel === activeAdminTab);
  });
}

function renderAdminSummary() {
  const container = document.getElementById("adminSummaryCards");
  if (!container) return;
  const campaign = activeCampaign();
  const metricCount = ["Cabo", "Nao Cabo"].reduce((total, area) => total + metricsFor(area).length, 0);
  const latestPartial = latestPublishedPartial(campaign);
  const cards = [
    { icon: "calendar", title: "Campanha ativa", value: campaign?.name || "-", note: campaign?.reference || state.period.month || "-" },
    { icon: "status", title: "Status da campanha", value: campaignShortStatus(campaign?.status), note: campaign?.status || CAMPAIGN_STATUS.OPEN },
    { icon: "user", title: "Vendedores cadastrados", value: state.sellers.length, note: "Total na campanha ativa" },
    { icon: "store", title: "Filiais cadastradas", value: branches().length, note: "Unidades operacionais" },
    { icon: "target", title: "Metas configuradas", value: metricCount, note: "Indicadores por area" },
    { icon: "partial", title: "Ultima parcial publicada", value: latestPartial?.name || "Nenhuma", note: latestPartial?.baseDate || "Sem parcial publicada" },
  ];
  container.innerHTML = cards.map((card) => `
    <article class="admin-summary-card ${card.icon}">
      <span aria-hidden="true"></span>
      <div><small>${escapeHtml(card.title)}</small><strong>${escapeHtml(String(card.value))}</strong><em>${escapeHtml(String(card.note))}</em></div>
    </article>
  `).join("");
}

function nextPartialNumber() {
  const numbers = partialsForCampaign().map((partial) => Number(partial.number) || 0);
  return Math.max(0, ...numbers) + 1;
}

function partialPreviewMarkup(partial, options = {}) {
  if (!partial) return `<p class="muted-note">Nenhuma pre-visualizacao carregada.</p>`;
  const filter = partialPreviewFilter;
  const visibleItems = partial.items.filter((item) => filter === "Todos" || item.status === filter);
  const canSave = !options.readOnly && partial.errorRows === 0;
  const summary = partial.summary || partialSummary(partial.items, partial.totalRows);
  const period = getPeriodForPartial(partial, activeCampaign());
  const periodWarning = partialPeriodWarning(partial, activeCampaign());
  const filters = ["Todos", "OK", "Alerta", "Ignorado", "Erro"].map((item) => `<button class="ghost-button compact-action ${filter === item ? "active" : ""}" data-partial-preview-filter="${item}" type="button">${item}</button>`).join("");
  return `<div class="partial-preview">
    <div class="campaign-kpi-strip compact-strip">
      <span>Dias da parcial<strong>${period.daysDone ? num.format(period.daysDone) : "-"} / ${period.daysTotal ? num.format(period.daysTotal) : "-"}</strong></span>
      <span>Linhas lidas<strong>${summary.totalRows}</strong></span>
      <span>Validas<strong>${summary.validRows}</strong></span>
      <span>Alertas<strong>${summary.warningRows}</strong></span>
      <span>Ignoradas<strong>${summary.ignoredRows || 0}</strong></span>
      <span>Erros<strong>${summary.errorRows}</strong></span>
      <span>Vendedores<strong>${summary.sellers}</strong></span>
      <span>Metricas<strong>${summary.metrics}</strong></span>
    </div>
    <div class="admin-toolbar partial-toolbar">
      <div>${filters}</div>
      ${options.readOnly ? "" : `<div><button id="cancelPartialPreview" class="ghost-button" type="button">Cancelar</button><button id="savePartialDraft" class="ghost-button" type="button" ${canSave ? "" : "disabled"}>Salvar como rascunho</button><button id="publishPendingPartial" class="primary-button" type="button" ${canSave ? "" : "disabled"}>Publicar parcial</button></div>`}
    </div>
    ${partial.errorRows ? `<p class="admin-inline-note warning">Corrija os erros antes de salvar ou publicar esta parcial.</p>` : `<p class="admin-inline-note">Previa validada. A publicacao nao altera a simulacao dos vendedores.</p>`}
    ${periodWarning ? `<p class="admin-inline-note warning">${escapeHtml(periodWarning)}</p>` : ""}
    <div class="table-wrap partial-preview-table"><table>
      <thead><tr><th>Linha</th><th>Vendedor</th><th>Filial</th><th>Area</th><th>Metrica</th><th>Realizado</th><th>Status</th><th>Mensagem</th></tr></thead>
      <tbody>${visibleItems.map((item) => `<tr class="${partialLineClass(item.status)}"><td>${item.lineNumber}</td><td>${escapeHtml(item.sellerName)}</td><td>${escapeHtml(item.branch)}</td><td>${escapeHtml(item.area)}</td><td>${escapeHtml(item.metricName)}</td><td>${num.format(item.realized)}</td><td><span class="status ${partialLineClass(item.status)}">${item.status}</span></td><td>${escapeHtml(item.message || "-")}</td></tr>`).join("") || `<tr><td colspan="8">Nenhuma linha para este filtro.</td></tr>`}</tbody>
    </table></div>
  </div>`;
}

function renderAdminPartialsPanel() {
  const container = document.getElementById("adminPartialsPanel");
  if (!container) return;
  const campaign = activeCampaign();
  if (!campaign) {
    container.innerHTML = `<div class="section-title"><h3>Parciais de resultado</h3><p>Nenhuma campanha selecionada.</p></div>`;
    return;
  }
  const locked = isCampaignOfficialClosed(campaign) || campaign.status === CAMPAIGN_STATUS.OPERATIONAL_CLOSED;
  const disabled = locked ? "disabled" : "";
  const plannedDays = campaignPlannedBusinessDays(campaign);
  const partials = partialsForCampaign(campaign).sort((a, b) => Number(b.number) - Number(a.number) || String(b.importedAt).localeCompare(String(a.importedAt)));
  const rows = partials.map((partial) => {
    const summary = partial.summary || partialSummary(partial.items, partial.totalRows);
    const periodWarning = partialPeriodWarning(partial, campaign);
    return `<tr>
      <td>${escapeHtml(campaign.name)}</td>
      <td>${partial.number}</td>
      <td><strong>${escapeHtml(partial.name)}</strong><small>${escapeHtml(partial.baseDate || "-")}</small></td>
      <td>${escapeHtml(partialPeriodDisplay(partial, campaign))}${periodWarning ? `<small class="warning">${escapeHtml(periodWarning)}</small>` : ""}</td>
      <td>${partial.importedAt ? dateTime.format(new Date(partial.importedAt)) : "-"}</td>
      <td>${escapeHtml(partial.responsible || "Admin")}</td>
      <td><span class="status ${partialStatusClass(partial.status)}">${escapeHtml(partial.status)}</span></td>
      <td>${summary.sellers}</td>
      <td>${summary.metrics}</td>
      <td>${summary.totalRows}</td>
      <td>
        <button class="ghost-button compact-action" data-view-partial="${partial.id}" type="button">Visualizar</button>
        <button class="ghost-button compact-action" data-publish-partial="${partial.id}" type="button" ${locked || partial.errorRows || partial.status === PARTIAL_STATUS.PUBLISHED ? "disabled" : ""}>Publicar</button>
        <button class="ghost-button compact-action" data-cancel-partial="${partial.id}" type="button" ${locked || partial.status === PARTIAL_STATUS.CANCELED ? "disabled" : ""}>Cancelar</button>
        <button class="ghost-button compact-action" data-replace-partial="${partial.id}" type="button" ${locked || partial.status !== PARTIAL_STATUS.PUBLISHED ? "disabled" : ""}>Substituida</button>
        <button class="danger-button compact-action" data-delete-draft-partial="${partial.id}" type="button" ${locked || partial.status !== PARTIAL_STATUS.DRAFT ? "disabled" : ""}>Excluir</button>
      </td>
    </tr>`;
  }).join("");
  container.innerHTML = `
    <div class="section-title inline-title">
      <div>
        <h3>Parciais de resultado</h3>
        <p>Importe resultados oficiais parciais sem alterar a simulacao dos vendedores.</p>
      </div>
      <span class="campaign-status-badge ${campaignStatusClass(campaign.status)}">${escapeHtml(campaign.status)}</span>
    </div>
    <p class="admin-inline-note">Parciais sao usadas para acompanhamento durante o mes. O fechamento oficial da comissao deve ser realizado na aba Fechamento.</p>
    <div class="admin-section-grid single">
      <section class="admin-section-card">
        <div class="section-title">
          <h3>Importar parcial</h3>
          <p>Formato aceito: vendedor;filial;area;metrica;realizado</p>
        </div>
        <div class="period-admin-grid">
          <label>Campanha<input value="${escapeHtml(campaign.name)}" disabled></label>
          <label>Tipo<input value="Parcial" disabled></label>
          <label>Numero da parcial<input id="partialNumber" type="number" min="1" value="${nextPartialNumber()}" ${disabled}></label>
          <label>Nome da parcial<input id="partialName" placeholder="Parcial ${String(nextPartialNumber()).padStart(2, "0")}" ${disabled}></label>
          <label>Data base<input id="partialBaseDate" type="date" value="${new Date().toISOString().slice(0, 10)}" ${disabled}></label>
          <label>Dias realizados da parcial<input id="partialDaysDone" type="number" min="1" ${disabled}></label>
          <label>Dias uteis da parcial<input id="partialDaysTotal" type="number" min="1" value="${plannedDays}" ${disabled}></label>
        </div>
        <div class="csv-import-layout">
          <div class="csv-dropzone" id="partialCsvDropzone"><strong>Selecionar CSV de parcial</strong><span>O arquivo sera validado antes de salvar.</span></div>
          <div class="csv-actions"><button id="selectPartialCsv" class="primary-button" type="button" ${disabled}>Importar parcial</button><input id="partialCsvFile" type="file" accept=".csv,text/csv" hidden ${disabled} /></div>
        </div>
        ${locked ? `<p class="admin-inline-note warning">Esta campanha nao permite novas parciais neste status.</p>` : `<p class="admin-inline-note">A parcial publicada sera exibida para Dashboard, Filial e Vendedor; a simulacao permanece separada.</p>`}
      </section>
      <section class="admin-section-card">
        <div class="section-title"><h3>Previa da importacao</h3><p>Confira erros e alertas antes de publicar.</p></div>
        <div id="partialPreviewPanel">${partialPreviewMarkup(pendingPartialImport, { readOnly: locked || Boolean(pendingPartialImport?._readOnly) })}</div>
      </section>
      <section class="admin-section-card">
        <div class="section-title"><h3>Parciais importadas</h3><p>Historico da campanha selecionada.</p></div>
        <div class="table-wrap"><table><thead><tr><th>Campanha</th><th>N.</th><th>Parcial</th><th>Dias</th><th>Importacao</th><th>Responsavel</th><th>Status</th><th>Vendedores</th><th>Metricas</th><th>Linhas</th><th>Acoes</th></tr></thead><tbody>${rows || `<tr><td colspan="11">Nenhuma parcial importada para esta campanha.</td></tr>`}</tbody></table></div>
      </section>
    </div>
  `;
}

function renderAdminClosingPanelLegacy() {
  const container = document.getElementById("adminClosingPanel");
  if (!container) return;
  const campaign = activeCampaign();
  const snapshot = buildCampaignSnapshot(campaign);
  const canAdminEdit = canEditCampaignData();
  container.innerHTML = `
    <div class="section-title inline-title">
      <div>
        <h3>Fechamento</h3>
        <p>Confira totais, lance estornos por vendedor e gere o arquivo oficial de comissionamento.</p>
      </div>
      <span class="campaign-status-badge ${campaignStatusClass(campaign?.status)}">${campaignShortStatus(campaign?.status)}</span>
    </div>
    <div class="campaign-command-card closing-summary">
      <div><span>Campanha</span><strong>${escapeHtml(campaign?.name || "-")}</strong><small>${escapeHtml(campaign?.reference || "-")}</small></div>
      <div><span>Vendedores</span><strong>${snapshot.totalSellers}</strong><small>Base do fechamento</small></div>
      <div><span>Comissao bruta</span><strong>${money.format(snapshot.commissionGrossTotal)}</strong><small>Antes de descontos</small></div>
      <div><span>Deflatores</span><strong>${money.format(snapshot.deflatorTotal)}</strong><small>Impacto total</small></div>
      <div><span>Estornos</span><strong>${discountMoney(snapshot.estornosTotal)}</strong><small>Qualidade, seguro e carrossel</small></div>
      <div><span>Comissao final</span><strong>${money.format(snapshot.commissionFinalTotal)}</strong><small>Total liquido</small></div>
    </div>
    <div class="campaign-flow-actions">
      <button id="operationalCloseCampaign" class="warning-button" type="button" ${campaign?.status !== CAMPAIGN_STATUS.OPEN || !canAdminEdit ? "disabled" : ""}>Congelar campanha</button>
      <button id="reopenOperationalCampaign" class="ghost-button" type="button" ${!canReopenOperationalCampaign(campaign) || !canAdminEdit ? "disabled" : ""}>Descongelar campanha</button>
      <button id="startAdministrativeClosing" class="ghost-button" type="button" ${campaign?.status !== CAMPAIGN_STATUS.OPERATIONAL_CLOSED || !canAdminEdit ? "disabled" : ""}>Iniciar revisão administrativa</button>
      <button id="downloadPreviewCampaignFile" class="ghost-button" type="button" ${campaign && campaign.status !== CAMPAIGN_STATUS.OFFICIAL_CLOSED ? "" : "disabled"}>Baixar prévia</button>
      <button id="officialCloseCampaign" class="danger-button" type="button" ${campaign?.status !== CAMPAIGN_STATUS.ADMIN_CLOSING || !canAdminEdit ? "disabled" : ""}>Fechar comissao oficial</button>
      <button id="downloadOfficialCampaignFile" class="ghost-button" type="button" ${campaign?.officialFileCsv ? "" : "disabled"}>Baixar oficial</button>
    </div>
    <div class="table-wrap campaign-closing-panel">
      <table>
        <thead><tr><th>Vendedor</th><th>Comissao bruta</th><th>Deflator</th><th>Qualidade</th><th>Seguro</th><th>Carrossel</th><th>Total estornos</th><th>Comissao final</th><th>Status</th></tr></thead>
        <tbody>${campaignClosingRowsMarkup() || `<tr><td colspan="9">Nenhum vendedor nesta campanha.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function renderAdminClosingPanel() {
  const container = document.getElementById("adminClosingPanel");
  if (!container) return;
  const campaign = activeCampaign();
  if (!campaign) {
    container.innerHTML = `<div class="section-title"><h3>Fechamento</h3><p>Selecione uma campanha para iniciar o fechamento.</p></div>`;
    return;
  }
  const closing = closingForCampaign(campaign);
  const latestPartial = latestPublishedPartial(campaign);
  const basePartial = closing ? closingBasePartial(closing, campaign) : null;
  const snapshot = closing ? closingSnapshotForDisplay(campaign, closing) : null;
  const closingPeriod = snapshot
    ? periodWithCalculation(snapshot.period || { month: snapshot.reference, daysDone: snapshot.daysDone, daysTotal: snapshot.daysTotal }, "closingSnapshot")
    : latestPartial
      ? getPeriodForPartial(latestPartial, campaign)
      : periodWithCalculation({ month: campaign.reference || state.period.month, daysDone: 0, daysTotal: campaignPlannedBusinessDays(campaign) }, "campaignFallback");
  const validation = snapshot ? validateClosingSnapshot(snapshot, campaign, basePartial) : { ok: false, errors: [], warnings: [] };
  const totals = snapshot ? closingTotalsFromSnapshot(snapshot) : normalizeClosingTotals();
  const canAdminEdit = canEditCampaignData() && isAdminUnlocked();
  const alreadyClosed = isCampaignOfficialClosed(campaign) || closingIsOfficial(closing);
  const extractsPublished = closingExtractsPublished(closing);
  const status = closing?.status || CLOSING_STATUS.NOT_STARTED;
  const closingStatus = normalizeClosingStatus(status);
  const metricCount = ["Cabo", "Nao Cabo"].reduce((total, area) => total + metricsFor(area).length, 0);
  const startDisabled = alreadyClosed || !latestPartial || !canAdminEdit;
  const canOperationalClose = !alreadyClosed && campaignStatusLabel(campaign) === CAMPAIGN_STATUS.OPEN && canAdminEdit;
  const canReopenOperational = canReopenOperationalCampaign(campaign) && canAdminEdit;
  const closingReadyToFinish = [CLOSING_STATUS.REVIEW, CLOSING_STATUS.READY].includes(closingStatus);
  const closeDisabled = alreadyClosed || !closingReadyToFinish || !closing || !snapshot || !validation.ok || !canAdminEdit;
  const publishDisabled = !alreadyClosed || extractsPublished || !snapshot || !isAdminUnlocked();
  const stateMessage = alreadyClosed
    ? extractsPublished
      ? `Campanha fechada oficialmente. Extratos publicados para vendedores${closing?.publishedAt ? ` em ${dateTime.format(new Date(closing.publishedAt))}` : ""}.`
      : "Campanha fechada oficialmente. Os dados estao congelados e os extratos aguardam publicacao."
    : closing
      ? "Fechamento em conferencia. Revise os dados, estornos e validacoes antes de fechar oficialmente."
      : latestPartial
        ? "Fechamento ainda nao iniciado para esta campanha."
        : "Nenhuma parcial publicada encontrada. Voce pode importar um arquivo final de fechamento em evolucao futura.";
  const validationMarkup = snapshot ? `
    <div class="closing-validation ${validation.ok ? "ok" : "bad"}">
      <strong>${validation.ok ? "Validacao pronta para fechamento" : "Pendencias para fechar"}</strong>
      ${validation.errors.length ? `<ul>${validation.errors.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : `<span>Nenhum erro critico encontrado.</span>`}
      ${validation.warnings.length ? `<small>Avisos: ${escapeHtml(validation.warnings.join("; "))}</small>` : ""}
    </div>` : "";
  container.innerHTML = `
    <div class="section-title inline-title">
      <div>
        <h3>Fechamento oficial</h3>
        <p>Transforme a ultima parcial publicada em resultado oficial congelado da campanha.</p>
      </div>
      ${moduleCampaignSelectorMarkup("fechamento")}
    </div>
    <div class="closing-stage-banner ${closingStatusClass(status)}">
      <div>
        <span>Status do fechamento</span>
        <strong>${escapeHtml(status)}</strong>
        <small>${escapeHtml(stateMessage)}</small>
      </div>
      <span class="campaign-status-badge ${campaignStatusClass(campaign.status)}">${escapeHtml(campaign.status)}</span>
    </div>
    <div class="campaign-command-card closing-summary">
      <div><span>Campanha</span><strong>${escapeHtml(campaign.name || "-")}</strong><small>${escapeHtml(campaign.reference || "-")}</small></div>
      <div><span>Dias da base</span><strong>${closingPeriod.daysDone || "-"} / ${closingPeriod.daysTotal || "-"}</strong><small>Realizados / uteis</small></div>
      <div><span>Ultima parcial</span><strong>${escapeHtml(latestPartial?.name || "Nenhuma")}</strong><small>${escapeHtml(latestPartial?.baseDate || "Sem parcial publicada")}</small></div>
      <div><span>Vendedores</span><strong>${state.sellers.length}</strong><small>${branches().length} filiais</small></div>
      <div><span>Indicadores ativos</span><strong>${metricCount}</strong><small>Metas da campanha</small></div>
      <div><span>Base selecionada</span><strong>${escapeHtml(basePartial?.name || "-")}</strong><small>${escapeHtml(basePartial?.baseDate || "Aguardando base")}</small></div>
    </div>
    <div class="closing-step-grid">
      <article class="closing-step-card ${closing ? "done" : "active"}">
        <span>1</span><strong>Escolher base</strong><small>Use a ultima parcial publicada ou prepare importacao final.</small>
        <button id="startClosingFromLatestPartial" class="primary-button" type="button" ${startDisabled ? "disabled" : ""}>Usar ultima parcial publicada</button>
      </article>
      <article class="closing-step-card">
        <span>2</span><strong>Importar arquivo final</strong><small>Preparado para evolucao futura com o mesmo CSV.</small>
        <button id="importFinalClosingFile" class="ghost-button" type="button" disabled title="Por enquanto, use a ultima parcial publicada como base do fechamento.">Importar fechamento - em breve</button>
      </article>
      <article class="closing-step-card ${snapshot ? "done" : ""}">
        <span>3</span><strong>Conferir e validar</strong><small>Revise vendedores, indicadores, deflatores e estornos.</small>
        <button id="downloadPreviewCampaignFile" class="ghost-button" type="button" ${snapshot ? "" : "disabled"}>Baixar previa</button>
      </article>
      <article class="closing-step-card ${alreadyClosed ? "done" : ""}">
        <span>4</span><strong>Fechar oficialmente</strong><small>Congela o snapshot e prepara extratos futuros.</small>
        <button id="officialCloseCampaign" class="danger-button" type="button" ${closeDisabled ? "disabled" : ""}>Fechar campanha oficialmente</button>
      </article>
    </div>
    <div class="campaign-flow-actions">
      ${canOperationalClose ? `<button id="operationalCloseCampaign" class="warning-button" type="button">Congelar campanha</button>` : ""}
      ${canReopenOperational ? `<button id="reopenOperationalCampaign" class="warning-button" type="button">Descongelar campanha</button>` : ""}
      <button id="downloadOfficialCampaignFile" class="ghost-button" type="button" ${campaign.officialFileCsv || officialClosingForCampaign(campaign)?.snapshot ? "" : "disabled"}>Baixar fechamento</button>
      ${alreadyClosed ? `<button id="publishOfficialExtracts" class="primary-button" type="button" ${publishDisabled ? "disabled" : ""}>Publicar extratos para vendedores</button>` : ""}
      ${alreadyClosed
        ? extractsPublished
          ? `<span class="admin-inline-note">Extratos oficiais publicados. Vendedores podem consultar o extrato na tela Colaborador.</span>`
          : `<span class="admin-inline-note warning">Fechamento concluido. Os extratos ainda nao foram publicados para os vendedores.</span>`
        : `<span class="admin-inline-note">A parcial original permanece no historico. Simulacoes nao alteram este fechamento.</span>`}
    </div>
    ${snapshot ? `<div class="campaign-command-card closing-summary">
      <div><span>Total vendedores</span><strong>${totals.totalSellers}</strong><small>Resultado carregado</small></div>
      <div><span>Comissao bruta</span><strong>${money.format(totals.commissionGrossTotal)}</strong><small>Antes de descontos</small></div>
      <div><span>Deflatores</span><strong>${money.format(totals.deflatorTotal)}</strong><small>${totals.deflatorTotal ? "Impacto aplicado" : "Sem impacto"}</small></div>
      <div><span>Estornos</span><strong>${discountMoney(totals.estornosTotal)}</strong><small>Qualidade, seguro e carrossel</small></div>
      <div><span>Comissao final</span><strong>${money.format(totals.commissionFinalTotal)}</strong><small>Total liquido</small></div>
      <div><span>Criticos</span><strong>${totals.riskSellers}</strong><small>Vendedores em risco</small></div>
    </div>${validationMarkup}` : `<div class="dashboard-empty-state active"><strong>${latestPartial ? "Fechamento ainda nao iniciado." : "Nenhuma parcial publicada encontrada."}</strong><span>${latestPartial ? "Clique em Usar ultima parcial publicada para carregar a conferencia." : "Publique uma parcial ou aguarde a importacao final de fechamento."}</span></div>`}
    <div class="table-wrap campaign-closing-panel">
      <table>
        <thead><tr><th>Vendedor</th><th>Comissao bruta</th><th>Deflator</th><th>Qualidade</th><th>Seguro</th><th>Carrossel</th><th>Total estornos</th><th>Comissao final</th><th>Status</th><th>Detalhes</th></tr></thead>
        <tbody>${snapshot ? campaignClosingRowsMarkup(snapshot, { readOnly: alreadyClosed }) : `<tr><td colspan="10">Carregue uma base de fechamento para revisar os vendedores.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function renderAdminFilters() {
  const branchFilter = document.getElementById("adminBranchFilter");
  if (branchFilter) {
    const selected = branchFilter.value || "";
    branchFilter.innerHTML = `<option value="">Todas</option>${branches().map((branch) => `<option value="${escapeHtml(branch)}">${escapeHtml(branch)}</option>`).join("")}`;
    if ([...branchFilter.options].some((option) => option.value === selected)) branchFilter.value = selected;
  }
}

function renderAdminSecurityAccesses() {
  const adminPasswordInput = document.getElementById("newAdminPassword");
  const dashboardPasswordInput = document.getElementById("newDashboardPassword");
  if (adminPasswordInput && document.activeElement !== adminPasswordInput) adminPasswordInput.value = adminPassword();
  if (dashboardPasswordInput && document.activeElement !== dashboardPasswordInput) dashboardPasswordInput.value = dashboardPassword();
  const sellerContainer = document.getElementById("sellerPasswordList");
  if (sellerContainer) {
    sellerContainer.innerHTML = state.sellers.map((seller) => `
      <label class="access-row security-access-row">
        <span><strong>${escapeHtml(seller.name)}</strong><small>${escapeHtml(seller.branch)} - ${escapeHtml(seller.area)}</small></span>
        <input data-seller-field="password" data-seller-id="${seller.id}" type="password" minlength="1" value="${escapeHtml(seller.password || "1234")}" autocomplete="off">
      </label>
    `).join("") || `<p class="muted-note">Nenhum vendedor cadastrado.</p>`;
  }
  const branchContainer = document.getElementById("branchPasswordList");
  if (branchContainer) {
    branchContainer.innerHTML = branches().map((branch) => `
      <label class="access-row security-access-row">
        <span><strong>${escapeHtml(branch)}</strong><small>Acesso da filial</small></span>
        <input data-branch-password="${escapeHtml(branch)}" type="password" minlength="1" value="${escapeHtml(state.branchPasswords?.[branch] || "1234")}" autocomplete="off">
      </label>
    `).join("") || `<p class="muted-note">Nenhuma filial cadastrada.</p>`;
  }
}

function filteredAdminSellers() {
  const search = (document.getElementById("adminSellerSearch")?.value || "").trim().toLowerCase();
  const branch = document.getElementById("adminBranchFilter")?.value || "";
  const area = document.getElementById("adminAreaFilter")?.value || "";
  return state.sellers.filter((seller) => {
    const matchesSearch = !search || seller.name.toLowerCase().includes(search);
    const matchesBranch = !branch || seller.branch === branch;
    const matchesArea = !area || seller.area === area;
    return matchesSearch && matchesBranch && matchesArea;
  });
}

function renderAdminPeriodMessage() {
  const message = document.getElementById("adminPeriodMessage");
  if (!message) return;
  const plannedDays = campaignPlannedBusinessDays(activeCampaign());
  message.textContent = plannedDays > 0
    ? "Dias uteis planejados serao usados como padrao para novas parciais. Parciais publicadas mantem os dias salvos."
    : "Dias uteis planejados deve ser maior que zero.";
  message.classList.toggle("warning", plannedDays <= 0);
  return;
  const invalid = false;
  message.textContent = invalid ? "Dias realizados não podem passar dos dias úteis." : "Período pronto para cálculo da projeção.";
  message.classList.toggle("warning", invalid);
}

function renderAuditCampaignFilter() {
  const select = document.getElementById("auditCampaignFilter");
  if (!select) return;
  const previous = select.value;
  const options = [`<option value="">Todas</option>`]
    .concat((state.campaigns || []).map((campaign) => `<option value="${escapeHtml(campaign.id)}">${escapeHtml(campaign.name || campaign.reference || "Campanha")}</option>`));
  select.innerHTML = options.join("");
  if ([...select.options].some((option) => option.value === previous)) select.value = previous;
}

function auditProfileUser(log) {
  const user = log.userName || log.sellerName || log.branchName || "";
  return user ? `${log.profile} / ${user}` : log.profile || "-";
}

function renderAuditLogDetail(logs) {
  const container = document.getElementById("auditLogDetail");
  if (!container) return;
  const log = logs.find((item) => item.id === activeAuditLogId) || logs[0];
  activeAuditLogId = log?.id || "";
  if (!log) {
    container.className = "audit-log-detail empty";
    container.textContent = "Nenhum log selecionado.";
    return;
  }
  container.className = "audit-log-detail";
  container.innerHTML = `
    <div class="audit-detail-grid">
      <span>Data/hora<strong>${escapeHtml(auditLogDisplayDate(log))}</strong></span>
      <span>Tipo<strong>${escapeHtml(log.type)}</strong></span>
      <span>Status<strong>${escapeHtml(log.status)}</strong></span>
      <span>Responsavel<strong>${escapeHtml(auditProfileUser(log))}</strong></span>
      <span>Modulo<strong>${escapeHtml(log.module || "-")}</strong></span>
      <span>Acao<strong>${escapeHtml(log.action || "-")}</strong></span>
      <span>Campanha<strong>${escapeHtml(log.campaignName || "-")}</strong></span>
      <span>Item<strong>${escapeHtml(log.itemName || "-")}</strong></span>
      <span>Dispositivo<strong>${escapeHtml(log.device || "-")}</strong></span>
    </div>
    <div class="audit-detail-values">
      <span>Valor anterior<strong>${escapeHtml(log.previousValue || "Nao disponivel")}</strong></span>
      <span>Valor novo<strong>${escapeHtml(log.newValue || "Nao disponivel")}</strong></span>
    </div>
    <p class="muted-note">${escapeHtml(log.message || "Sem descricao adicional.")}</p>
  `;
}

function renderAuditLogs() {
  renderAuditCampaignFilter();
  const body = document.getElementById("auditLogBody");
  if (!body) return;
  const logs = filteredAuditLogs();
  body.innerHTML = logs.length ? logs.slice(0, 250).map((log) => `
    <tr>
      <td>${escapeHtml(auditLogDisplayDate(log))}</td>
      <td>${escapeHtml(log.type)}</td>
      <td>${escapeHtml(auditProfileUser(log))}</td>
      <td>${escapeHtml(log.module || "-")}</td>
      <td>${escapeHtml(log.action || "-")}</td>
      <td>${escapeHtml(log.campaignName || "-")}</td>
      <td><span class="status ${log.status === "Sucesso" ? "ok" : log.status === "Bloqueado" ? "warn" : "bad"}">${escapeHtml(log.status)}</span></td>
      <td><button class="audit-row-button" data-audit-log-detail="${escapeHtml(log.id)}" type="button">Ver</button></td>
    </tr>
  `).join("") : `<tr><td colspan="8">Nenhum log encontrado para os filtros selecionados.</td></tr>`;
  renderAuditLogDetail(logs);
}

function exportAuditLogsCsv() {
  if (!requireAdminAction("exportAudit", "Auditoria")) return;
  const rows = filteredAuditLogs().map((log) => [
    auditLogDisplayDate(log),
    log.type,
    auditProfileUser(log),
    log.module,
    log.action,
    log.campaignName,
    log.message,
    log.status,
  ]);
  const header = ["Data/hora", "Tipo", "Perfil/usuario", "Modulo", "Acao", "Campanha", "Descricao", "Status"];
  const csv = `\uFEFF${[header, ...rows].map((line) => line.map(csvCell).join(";")).join("\n")}`;
  downloadFile(`logs-auditoria-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8", csv);
  logUpdate({ action: "Exportou logs", module: "Auditoria", message: "Admin exportou logs de auditoria em CSV." }, { persist: true });
}

function restoreDefaultState() {
  if (!requireAdminAction("restoreDefault", "Importacao e Backup")) return;
  if (!criticalConfirm("Restaurar os dados padrao? Esta acao substitui a base atual pelo modelo inicial e preserva os logs de auditoria.", { backup: true, irreversible: true })) return;
  const auditLogs = normalizeAuditLogs(state.auditLogs);
  state = seedState();
  state.auditLogs = auditLogs;
  logUpdate({
    action: "Restaurou padrao",
    module: "Importacao e Backup",
    message: "Dados padrao restaurados. Logs de auditoria preservados.",
  });
  saveState();
  renderAll();
}

function exportBackupJson() {
  if (!requireAdminAction("exportBackup", "Importacao e Backup")) return;
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `simulador-comissao-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  updateSaveStatus("Backup exportado");
  logUpdate({ action: "Exportou backup", module: "Importacao e Backup", message: "Backup JSON exportado." }, { persist: true });
}

function isSecurityPasswordTarget(target) {
  return Boolean(target && (
    target.id === "newAdminPassword"
    || target.id === "newDashboardPassword"
    || target.dataset?.sellerField === "password"
    || target.dataset?.branchPassword
  ));
}

function securityPasswordDescriptor(target) {
  if (target.id === "newAdminPassword") return { label: "Admin", min: 4 };
  if (target.id === "newDashboardPassword") return { label: "Dashboard", min: 4 };
  if (target.dataset?.sellerField === "password") {
    const seller = state.sellers.find((item) => item.id === target.dataset.sellerId);
    return { label: `Vendedor ${seller?.name || ""}`.trim(), seller, min: 1 };
  }
  if (target.dataset?.branchPassword) return { label: `Filial ${target.dataset.branchPassword}`, branch: target.dataset.branchPassword, min: 1 };
  return { label: "Acesso", min: 4 };
}

function updateSecurityPassword(target) {
  if (!isSecurityPasswordTarget(target)) return false;
  if (!requireAdminAction("updatePassword", "Seguranca")) {
    renderAdminSecurityAccesses();
    return true;
  }
  const descriptor = securityPasswordDescriptor(target);
  const value = String(target.value || "").trim();
  if (value.length < descriptor.min) {
    alert(`A senha de ${descriptor.label} deve ter pelo menos ${descriptor.min} caractere${descriptor.min > 1 ? "s" : ""}.`);
    renderAdminSecurityAccesses();
    return true;
  }
  if (!criticalConfirm(`Voce esta alterando a senha de acesso de ${descriptor.label}. Deseja continuar?`)) {
    renderAdminSecurityAccesses();
    return true;
  }
  let itemName = descriptor.label;
  if (target.id === "newAdminPassword") {
    state.settings = { ...defaultSettings(), ...(state.settings || {}) };
    state.settings.adminPassword = value;
    localStorage.setItem(ADMIN_PASSWORD_KEY, value);
    itemName = "Senha Admin";
  } else if (target.id === "newDashboardPassword") {
    state.settings = { ...defaultSettings(), ...(state.settings || {}) };
    state.settings.dashboardPassword = value;
    itemName = "Senha Dashboard";
  } else if (descriptor.seller) {
    descriptor.seller.password = value;
    itemName = descriptor.seller.name;
  } else if (descriptor.branch) {
    state.branchPasswords = state.branchPasswords || {};
    state.branchPasswords[descriptor.branch] = value;
    itemName = descriptor.branch;
  }
  logUpdate({
    type: "Seguranca",
    action: "Senha alterada",
    module: "Seguranca",
    itemName,
    previousValue: "Senha alterada",
    newValue: "Senha alterada",
    message: "Senha alterada.",
  });
  saveState("Senha salva");
  renderAdminSecurityAccesses();
  return true;
}

function isOfficialPeriodTarget(target) {
  return Boolean(target && target.id === "adminDaysTotal");
}

function officialPeriodDraftFromInputs(target = null) {
  const adminDaysTotal = document.getElementById("adminDaysTotal")?.value;
  const campaign = activeCampaign();
  const draft = {
    month: campaign?.reference || campaign?.period?.month || state.period.month,
    daysDone: 0,
    daysTotal: positiveInteger(adminDaysTotal ?? campaignPlannedBusinessDays(campaign), 0),
  };
  if (target?.id === "adminDaysTotal") draft.daysTotal = positiveInteger(target.value, 0);
  return draft;
}

function commitOfficialPeriodChange(target = null, options = {}) {
  if (!requireAdminAction("updateOfficialBusinessDays", "Campanhas")) {
    renderAll();
    return false;
  }
  const draft = officialPeriodDraftFromInputs(target);
  if (Number(draft.daysTotal) <= 0) {
    alert("Dias uteis deve ser maior que zero.");
    renderAll();
    return false;
  }
  const campaign = activeCampaign();
  if (!campaign) return false;
  const previous = campaignPlannedBusinessDays(campaign);
  const changed = Number(previous) !== Number(draft.daysTotal);
  if (!changed) return true;
  const hasPublished = publishedPartialsForCampaign(campaign).length > 0;
  const confirmMessage = hasPublished
    ? "Esta alteracao sera usada como padrao para novas parciais. Parciais ja publicadas manterao os dias uteis salvos no momento da publicacao. Deseja continuar?"
    : "Voce esta alterando os dias uteis planejados da campanha. Este valor sera usado como padrao para novas parciais. Deseja continuar?";
  if (!criticalConfirm(confirmMessage)) {
    renderAll();
    return false;
  }
  campaign.plannedBusinessDays = draft.daysTotal;
  campaign.period = { ...(campaign.period || {}), month: draft.month, daysTotal: draft.daysTotal };
  state.period.month = draft.month;
  state.period.daysTotal = draft.daysTotal;
  logUpdate({
    action: options.action || "Alterou dias uteis planejados da campanha",
    module: "Campanhas",
    campaignId: campaign.id,
    campaignName: campaign.name,
    itemName: campaign.name || "",
    previousValue: previous,
    newValue: draft.daysTotal,
    message: "Admin alterou dias uteis planejados da campanha. Parciais publicadas mantem os dias salvos.",
  });
  saveState("Dias uteis planejados salvos");
  renderAll();
  return true;
}

function auditRawElementValue(target) {
  if (target.type === "checkbox") return target.checked ? "Sim" : "Nao";
  if (target.type === "password" || target.dataset?.sellerField === "password" || target.dataset?.branchPassword || /password|senha/i.test(target.id || "")) {
    return target.value ? "Senha alterada" : "";
  }
  return target.value ?? "";
}

function auditMetricName(area, metricId) {
  return metricsFor(area).find((metric) => metric.id === metricId)?.name || metricId || "";
}

function auditFieldDescriptor(target) {
  if (!target) return null;
  if (target.dataset.campaignField) {
    const campaign = activeCampaign();
    return { action: "Editou campanha", module: "Campanhas", itemId: campaign?.id || "", itemName: campaign?.name || "", field: target.dataset.campaignField, message: `Admin editou a campanha ${campaign?.name || ""}.` };
  }
  if (target.id === "adminDaysTotal") {
    return { action: "Alterou dias uteis planejados", module: "Campanhas", itemName: activeCampaign()?.name || "", field: target.id, message: "Admin alterou dias uteis planejados da campanha." };
  }
  if (target.id === "partnerName") {
    return { action: "Alterou identidade do sistema", module: "Identidade", itemName: "Nome da parceira", field: "partnerName", message: "Admin alterou o nome da parceira/franquia." };
  }
  if (target.id === "newAdminPassword" || target.id === "newDashboardPassword") {
    const profile = target.id === "newAdminPassword" ? "Admin" : "Dashboard";
    return { type: "Seguranca", action: "Alterou senha de acesso", module: "Seguranca", itemName: `Senha ${profile}`, field: target.id, forceLog: target.value.trim().length >= 4, message: "Senha alterada." };
  }
  if (target.dataset.sellerExperience) {
    const seller = state.sellers.find((item) => item.id === target.dataset.sellerExperience);
    return { action: target.checked ? "Marcou vendedor em experiencia" : "Removeu vendedor de experiencia", module: "Vendedores", itemId: seller?.id || "", itemName: seller?.name || "", field: "emExperiencia", message: `Status de experiencia do vendedor ${seller?.name || ""} alterado.` };
  }
  if (target.dataset.sellerField) {
    const seller = state.sellers.find((item) => item.id === target.dataset.sellerId);
    const field = target.dataset.sellerField;
    const action = field === "password" ? "Alterou senha do vendedor" : "Editou vendedor";
    return { type: field === "password" ? "Seguranca" : "Atualizacao", action, module: field === "password" ? "Seguranca" : "Vendedores", itemId: seller?.id || "", itemName: seller?.name || "", field, forceLog: field === "password", message: field === "password" ? "Senha alterada." : `Admin editou o vendedor ${seller?.name || ""}.` };
  }
  if (target.dataset.adjustment) {
    const seller = state.sellers.find((item) => item.id === target.dataset.sellerId);
    const label = estornoFields.find((item) => item.id === target.dataset.adjustment)?.label || target.dataset.adjustment;
    return { action: "Editou estornos", module: "Fechamento", itemId: seller?.id || "", itemName: seller?.name || "", field: `Estorno ${label}`, message: `Admin alterou estorno ${label} do vendedor ${seller?.name || ""}.` };
  }
  if (target.dataset.closingAdjustment) {
    const snapshot = closingSnapshotForDisplay();
    const row = snapshot?.sellers?.find((item) => item.sellerId === target.dataset.sellerId);
    const label = estornoFields.find((item) => item.id === target.dataset.closingAdjustment)?.label || target.dataset.closingAdjustment;
    return { action: "Lancou ou alterou estorno", module: "Fechamento", itemId: row?.sellerId || "", itemName: row?.name || "", field: `Estorno ${label}`, message: `Admin alterou estorno ${label} do vendedor ${row?.name || ""} no fechamento.` };
  }
  if (target.dataset.metricGoal || target.dataset.metricRealized) {
    const seller = selectedAdminSeller();
    const metricId = target.dataset.metricGoal || target.dataset.metricRealized;
    const metric = auditMetricName(seller?.area, metricId);
    return { action: target.dataset.metricGoal ? "Alterou meta por vendedor" : "Alterou realizado por vendedor", module: "Metas", itemId: metricId, itemName: `${seller?.name || ""} / ${metric}`, field: target.dataset.metricGoal ? "Meta" : "Realizado", message: `Admin alterou ${target.dataset.metricGoal ? "meta" : "realizado"} de ${metric} para ${seller?.name || ""}.` };
  }
  if (target.dataset.collabRealized) {
    const seller = selectedCollabSeller();
    const metric = auditMetricName(seller?.area, target.dataset.collabRealized);
    return { action: "Alterou realizado pelo vendedor", module: "Vendedor", itemId: target.dataset.collabRealized, itemName: `${seller?.name || ""} / ${metric}`, field: "Realizado", profile: "Vendedor", userId: seller?.id || "", userName: seller?.name || "", sellerName: seller?.name || "", branchName: seller?.branch || "", message: `Vendedor ${seller?.name || ""} alterou realizado de ${metric}.` };
  }
  if (target.dataset.catalogMetricField) {
    const metric = metricsFor(target.dataset.catalogMetricArea, state, { includeInactive: true }).find((item) => item.id === target.dataset.catalogMetricId);
    return { action: "Editou indicador", module: "Metas e Indicadores", itemId: metric?.id || "", itemName: metric?.name || "", field: target.dataset.catalogMetricField, message: `Admin editou o indicador ${metric?.name || ""}.` };
  }
  if (target.dataset.customMetricField) {
    const metric = state.customMetrics?.[target.dataset.customMetricArea]?.find((item) => item.id === target.dataset.customMetricId);
    return { action: "Editou meta", module: "Metas e Indicadores", itemId: metric?.id || "", itemName: metric?.name || "", field: target.dataset.customMetricField, message: `Admin editou a meta ${metric?.name || ""}.` };
  }
  if (target.dataset.ruleAt || target.dataset.ruleRate) {
    const area = document.getElementById("ruleAreaSelect")?.value || "";
    const metricId = target.dataset.ruleAt || target.dataset.ruleRate;
    return { action: "Editou regra", module: "Regras e Deflatores", itemId: metricId, itemName: auditMetricName(area, metricId), field: target.dataset.ruleAt ? "Faixa" : "Taxa", message: `Admin editou regra de ${auditMetricName(area, metricId)}.` };
  }
  if (target.dataset.deflatorField) {
    const item = state.deflators?.[target.dataset.deflatorArea]?.find((deflator) => deflator.id === target.dataset.deflatorId);
    return { action: "Editou deflator", module: "Regras e Deflatores", itemId: item?.id || "", itemName: item?.name || "", field: target.dataset.deflatorField, message: `Admin editou o deflator ${item?.name || ""}.` };
  }
  if (target.dataset.branchName) {
    return { action: "Editou filial", module: "Filiais", itemName: target.dataset.branchName, field: "Filial", message: `Admin editou a filial ${target.dataset.branchName}.` };
  }
  if (target.dataset.branchPassword) {
    return { type: "Seguranca", action: "Alterou senha da filial", module: "Seguranca", itemName: target.dataset.branchPassword, field: "Senha da filial", forceLog: true, message: "Senha alterada." };
  }
  return null;
}

function rememberAuditPreviousValue(target) {
  const descriptor = auditFieldDescriptor(target);
  if (!descriptor) return;
  target.dataset.auditPreviousValue = auditRawElementValue(target);
}

function recordAuditFieldChange(target) {
  const descriptor = auditFieldDescriptor(target);
  if (!descriptor) return;
  if ((target.matches("[data-seller-field], [data-seller-experience], [data-adjustment], [data-closing-adjustment], [data-metric-goal], [data-metric-realized], [data-catalog-metric-field], [data-custom-metric-field], [data-branch-name], [data-branch-password], [data-rule-at], [data-rule-rate], [data-deflator-field]") || target.id === "adminDaysTotal") && !canEditCampaignData()) return;
  if (target.dataset.collabRealized && isCampaignOperationLocked()) return;
  const previousValue = target.dataset.auditPreviousValue || "";
  const newValue = auditRawElementValue(target);
  if (!descriptor.forceLog && previousValue === newValue) return;
  logUpdate({ ...descriptor, previousValue, newValue });
  target.dataset.auditPreviousValue = newValue;
}

function renderAdmin() {
  renderSelectors();
  updateAdminTabs();
  renderCampaignAdminPanel();
  renderAdminSummary();
  renderAdminPartialsPanel();
  renderAdminClosingPanel();
  renderAdminFilters();
  renderAdminSecurityAccesses();
  const adminDaysTotal = document.getElementById("adminDaysTotal");
  if (adminDaysTotal) adminDaysTotal.value = campaignPlannedBusinessDays(activeCampaign());
  renderAdminPeriodMessage();
  const list = document.getElementById("sellerEditorList");
  const sellers = filteredAdminSellers();
  list.innerHTML = sellers.length ? sellers.map((seller) => `
    <div class="seller-card">
      <label>Nome<input data-seller-field="name" data-seller-id="${seller.id}" value="${escapeHtml(seller.name)}">${seller.emExperiencia ? `<span class="experience-badge">Em experiencia</span>` : ""}</label>
      <label>Area
        <select data-seller-field="area" data-seller-id="${seller.id}">
          <option ${seller.area === "Cabo" ? "selected" : ""}>Cabo</option>
          <option ${seller.area === "Nao Cabo" ? "selected" : ""}>Nao Cabo</option>
        </select>
      </label>
      <label>Filial<select data-seller-field="branch" data-seller-id="${seller.id}">${branchOptions(seller.branch)}</select></label>
      <label class="checkbox-line"><input data-seller-experience="${seller.id}" type="checkbox" ${seller.emExperiencia ? "checked" : ""}> Vendedor em experiência</label>
      <button class="delete-seller-button" data-delete-seller="${seller.id}" type="button">Excluir vendedor</button>
    </div>
  `).join("") : `<p class="muted-note">Nenhum vendedor encontrado com os filtros atuais.</p>`;
  renderAdminMetrics();
  renderRules();
  renderBranchEditor();
  renderEditableMetricCatalogEditor();
  renderDeflators();
  renderAuditLogs();
}
function selectedAdminSeller() {
  const id = document.getElementById("adminSellerSelect")?.value || state.sellers[0]?.id;
  return state.sellers.find((seller) => seller.id === id) || state.sellers[0];
}

function renderAdminMetrics() {
  const seller = selectedAdminSeller();
  const summary = document.getElementById("adminDeflatorSummary");
  const body = document.getElementById("adminMetricsBody");
  if (!summary || !body) return;
  if (!seller) {
    summary.innerHTML = "";
    body.innerHTML = "";
    return;
  }
  ensureSellerValues(seller);
  summary.innerHTML = `Use esta área apenas para manutenção operacional dos valores da campanha. A leitura analítica fica no Dashboard, na Filial e na tela do Vendedor.`;
  body.innerHTML = metricsFor(seller.area).map((metric) => {
    const value = seller.values[metric.id];
    const participates = metricParticipates(metric);
    return `<tr>
      <td>${escapeHtml(metric.name)}</td>
      <td>${escapeHtml(metricGroupDisplay(metricGroup(metric)))}</td>
      <td>${escapeHtml(metricTypeDisplay(metricTypeKind(metric)))}</td>
      <td><input data-metric-goal="${metric.id}" type="number" value="${value.goal}"></td>
      <td><input data-metric-realized="${metric.id}" type="number" value="${value.realized}"></td>
      <td><span class="status ${participates ? "ok" : "neutral"}">${participates ? "Sim" : "Não"}</span></td>
    </tr>`;
  }).join("");
}

function renderRules() {
  const area = document.getElementById("ruleAreaSelect").value;
  document.getElementById("rulesEditor").innerHTML = metricsFor(area)
    .filter(metricParticipates)
    .map((metric) => {
      const bands = sortedBands(area, metric.id);
      const inputs = [0, 1, 2, 3].map((index) => {
        const band = bands[index] || { at: "", rate: "" };
        return `<label>Faixa ${index + 1}
          <input data-rule-at="${metric.id}" data-rule-index="${index}" type="number" step="0.01" value="${band.at}">
          <input data-rule-rate="${metric.id}" data-rule-index="${index}" type="number" step="0.001" value="${band.rate}">
        </label>`;
      }).join("");
      return `<div class="rule-card"><h4>${metric.name}</h4><div class="band-grid">${inputs}</div></div>`;
    }).join("");
}

function renderDeflators() {
  document.getElementById("deflatorEditor").innerHTML = ["Cabo", "Nao Cabo"].map((area) => {
    const rules = state.deflators[area] || [];
    const rows = rules.map((item) => `<div class="metric-row">
      <label>Nome<input data-deflator-field="name" data-deflator-area="${area}" data-deflator-id="${item.id}" value="${item.name}"></label>
      <label>Item da meta<select data-deflator-field="metricId" data-deflator-area="${area}" data-deflator-id="${item.id}">${metricOptions(area, item.metricId)}</select></label>
      <label>Minimo %<input data-deflator-field="min" data-deflator-area="${area}" data-deflator-id="${item.id}" type="number" step="0.01" value="${item.min}"></label>
      <label>Penalidade %<input data-deflator-field="penaltyRate" data-deflator-area="${area}" data-deflator-id="${item.id}" type="number" step="0.01" value="${item.penaltyRate}"></label>
      <button class="danger-button" data-delete-deflator="${item.id}" data-deflator-area="${area}" type="button">Excluir</button>
    </div>`).join("");
    return `<div class="rule-card"><h4>${area}</h4>${rows}<button class="ghost-button" data-add-deflator="${area}" type="button">Adicionar deflator</button></div>`;
  }).join("");
}
function metricOptions(area, selectedId) {
  return metricsFor(area, state, { includeInactive: true })
    .filter((metric) => metric.active !== false || metric.id === selectedId)
    .filter((metric) => metricParticipates(metric) || metric.id === selectedId)
    .map((metric) => `<option value="${metric.id}" ${metric.id === selectedId ? "selected" : ""}>${escapeHtml(metric.name)}${metric.active === false ? " (inativo)" : ""}</option>`).join("");
}

function metricFormulaOptions(selectedType) {
  return METRIC_FORMULA_TYPES.map((item) => `<option value="${item.value}" ${item.value === selectedType ? "selected" : ""}>${item.label}</option>`).join("");
}

function ensureMetricCatalogEntry(area, metricId) {
  state.metricCatalog = normalizeMetricCatalog(state.metricCatalog);
  state.metricCatalog[area] = state.metricCatalog[area] || {};
  const fallback = areaMetrics[area]?.find((metric) => metric.id === metricId) || { id: metricId };
  state.metricCatalog[area][metricId] = normalizeMetricDefinition(state.metricCatalog[area][metricId] || fallback, fallback);
  return state.metricCatalog[area][metricId];
}

function editableMetricRecord(area, metricId) {
  state.customMetrics = normalizeCustomMetrics(state.customMetrics);
  const custom = state.customMetrics?.[area]?.find((metric) => metric.id === metricId);
  return custom || ensureMetricCatalogEntry(area, metricId);
}

function metricHasHistory(area, metricId) {
  const hasPartialHistory = (state.campaigns || []).some((campaign) => (
    (campaign.partials || []).some((partial) => (partial.items || []).some((item) => item.metricId === metricId && normalizeAreaName(item.area || area) === area))
  ));
  const hasSellerValue = state.sellers.some((seller) => seller.area === area && seller.values?.[metricId] && (
    Number(seller.values[metricId].realized)
  ));
  return hasPartialHistory || hasSellerValue;
}

function setMetricActive(area, metricId, active) {
  if (!requireAdminAction("updateMetric", "Metas e Indicadores")) return;
  const metric = editableMetricRecord(area, metricId);
  const previous = metric.active !== false ? "Ativo" : "Inativo";
  metric.active = active;
  logUpdate({
    action: active ? "Ativou indicador" : "Inativou indicador",
    module: "Metas e Indicadores",
    itemId: metricId,
    itemName: metric.name || metricId,
    previousValue: previous,
    newValue: active ? "Ativo" : "Inativo",
    message: `Admin ${active ? "ativou" : "inativou"} o indicador ${metric.name || metricId}.`,
  });
  saveState(active ? "Indicador ativado com sucesso." : "Indicador inativado com sucesso.");
  renderAll();
}

function duplicateMetric(area, metricId) {
  if (!requireAdminAction("updateMetric", "Metas e Indicadores")) return;
  const original = metricsFor(area, state, { includeInactive: true }).find((metric) => metric.id === metricId);
  if (!original) return;
  const id = `custom_${makeId()}`;
  const copy = normalizeCustomMetric({
    ...original,
    id,
    name: `${original.name} COPIA`,
    active: true,
    importKey: `${original.importKey || original.id}_copia`,
    sortOrder: metricOrderIndex(area, metricId) + 2,
  });
  state.customMetrics[area] = state.customMetrics[area] || [];
  state.customMetrics[area].push(copy);
  ensureMetricOrder(area);
  const order = state.metricOrder[area].filter((item) => item !== id);
  const sourceIndex = order.indexOf(metricId);
  order.splice(sourceIndex >= 0 ? sourceIndex + 1 : order.length, 0, id);
  state.metricOrder[area] = order;
  syncCustomMetricSortOrder(area);
  state.rules[area] = state.rules[area] || {};
  state.rules[area][id] = structuredClone(state.rules[area]?.[metricId] || []);
  for (const seller of state.sellers.filter((item) => item.area === area)) ensureSellerValues(seller);
  logUpdate({
    action: "Duplicou indicador",
    module: "Metas e Indicadores",
    itemId: id,
    itemName: copy.name,
    previousValue: original.name,
    newValue: copy.name,
    message: `Admin duplicou o indicador ${original.name}.`,
  });
  saveState("Indicador duplicado com sucesso.");
  renderAll();
}

function removeOrInactivateMetric(area, metricId) {
  if (!requireAdminAction("updateMetric", "Metas e Indicadores")) return;
  const metric = metricsFor(area, state, { includeInactive: true }).find((item) => item.id === metricId);
  if (!metric) return;
  const isSystem = metric.isCustom !== true;
  if (isSystem || metricHasHistory(area, metricId)) {
    alert("Este indicador possui historico de uso. Para preservar os dados, ele sera inativado.");
    setMetricActive(area, metricId, false);
    return;
  }
  if (!criticalConfirm("Excluir definitivamente este indicador?", { backup: true, irreversible: true })) return;
  state.customMetrics[area] = (state.customMetrics[area] || []).filter((item) => item.id !== metricId);
  state.metricOrder[area] = (state.metricOrder[area] || []).filter((id) => id !== metricId);
  state.deflators[area] = (state.deflators[area] || []).filter((item) => item.metricId !== metricId);
  delete state.rules[area]?.[metricId];
  logUpdate({
    action: "Excluiu indicador",
    module: "Metas e Indicadores",
    itemId: metricId,
    itemName: metric.name,
    previousValue: metric.name,
    message: `Admin excluiu o indicador ${metric.name}.`,
  });
  saveState("Indicador excluido.");
  renderAll();
}

function updateMetricCatalogField(target) {
  if (!requireAdminAction("updateMetric", "Metas e Indicadores")) return;
  const area = target.dataset.catalogMetricArea;
  const metricId = target.dataset.catalogMetricId;
  const field = target.dataset.catalogMetricField;
  if (!area || !metricId || !field) return;
  const metric = editableMetricRecord(area, metricId);
  const previousName = metric.name || metricId;
  if (field === "goal") metric.goal = Number(target.value) || 0;
  else if (field === "participaAtingimento") metric.participaAtingimento = target.value === "true";
  else if (field === "active") metric.active = target.value === "true";
  else if (field === "name") metric.name = target.value.trim() || previousName;
  else if (field === "unit") metric.unit = target.value.trim() || "Qtd.";
  else if (field === "importKey") metric.importKey = target.value.trim();
  else if (field === "observation") metric.observation = target.value.trim();
  else metric[field] = target.value;
  syncCustomMetricSortOrder(area);
  state.rules[area] = state.rules[area] || {};
  state.rules[area][metric.id] = state.rules[area][metric.id] || [];
  for (const seller of state.sellers.filter((item) => item.area === area)) {
    ensureSellerValues(seller);
    if (field === "goal" && seller.values?.[metric.id]) seller.values[metric.id].goal = metric.goal;
  }
  if (field === "tipoIndicador" && metric.tipoIndicador === "informativo") metric.participaAtingimento = false;
  saveState("Indicador atualizado com sucesso.");
  renderDashboard();
  renderAdminMetrics();
  renderManager();
  renderCollaborator();
}

function renderMetricCatalogEditor() {
  const container = document.getElementById("metricCatalogEditor");
  if (!container) return;
  const allowReorder = canReorderMetrics();
  const allowEdit = canEditCampaignData();
  const lockMessage = metricOrderLockMessage();
  container.innerHTML = ["Cabo", "Nao Cabo"].map((area) => {
    const metrics = metricsFor(area, state, { includeInactive: true });
    const rows = metrics.map((metric, index) => {
      const isCustom = metric.isCustom === true;
      const moveDisabledUp = !allowReorder || index === 0;
      const moveDisabledDown = !allowReorder || index === metrics.length - 1;
      const disabledAttr = allowEdit ? "" : "disabled";
      const groupOptions = METRIC_GROUPS.map((group) => `<option value="${group}" ${metricGroup(metric) === group ? "selected" : ""}>${metricGroupDisplay(group)}</option>`).join("");
      const typeOptions = METRIC_TYPES.map((type) => `<option value="${type}" ${metricTypeKind(metric) === type ? "selected" : ""}>${metricTypeDisplay(type)}</option>`).join("");
      const statusOptions = `<option value="true" ${metric.active !== false ? "selected" : ""}>Ativo</option><option value="false" ${metric.active === false ? "selected" : ""}>Inativo</option>`;
      const dataAttrs = (field) => `data-catalog-metric-field="${field}" data-catalog-metric-area="${area}" data-catalog-metric-id="${metric.id}"`;
      return `
        <div class="metric-row metric-catalog-row ${metric.isCustom ? "custom" : "system"} ${metric.active === false ? "inactive" : ""}">
          <div class="metric-order-cell">
            <span>${metric.sortOrder}</span>
            <button class="ghost-button compact-action icon-order-button" data-move-metric-order="-1" data-metric-order-area="${area}" data-metric-order-id="${metric.id}" type="button" title="Mover para cima" aria-label="Mover ${escapeHtml(metric.name)} para cima" ${moveDisabledUp ? "disabled" : ""}>&#8593;</button>
            <button class="ghost-button compact-action icon-order-button" data-move-metric-order="1" data-metric-order-area="${area}" data-metric-order-id="${metric.id}" type="button" title="Mover para baixo" aria-label="Mover ${escapeHtml(metric.name)} para baixo" ${moveDisabledDown ? "disabled" : ""}>&#8595;</button>
          </div>
          <label>Indicador<input ${dataAttrs("name")} value="${escapeHtml(metric.name)}" ${disabledAttr}></label>
          <label>Unidade<input ${dataAttrs("unit")} value="${escapeHtml(metric.unit || "Qtd.")}" ${disabledAttr}></label>
          <label>Tipo
            <select ${dataAttrs("type")} ${disabledAttr}>${metricFormulaOptions(metric.type)}</select>
          </label>
          <label>Bloco
            <select ${dataAttrs("groupMeta")} ${disabledAttr}>${groupOptions}</select>
          </label>
          <label>Tipo indicador
            <select ${dataAttrs("tipoIndicador")} ${disabledAttr}>${typeOptions}</select>
          </label>
          <label>Atingimento
            <select ${dataAttrs("participaAtingimento")} ${disabledAttr}>
              <option value="true" ${metricParticipates(metric) ? "selected" : ""}>Participa</option>
              <option value="false" ${!metricParticipates(metric) ? "selected" : ""}>Informativo</option>
            </select>
          </label>
          <label>Meta padrão<input ${isCustom ? `data-custom-metric-field="goal" data-custom-metric-area="${area}" data-custom-metric-id="${metric.id}"` : "disabled"} type="number" step="0.01" value="${metric.goal || 0}"></label>
          ${isCustom
            ? `<button class="danger-button" data-delete-custom-metric="${metric.id}" data-custom-metric-area="${area}" type="button">Excluir item</button>`
            : `<span class="system-metric-badge">Padrão do sistema</span>`}
        </div>
      `;
    }).join("");
    const note = lockMessage ? `<p class="admin-inline-note warning">${lockMessage}</p>` : `<p class="admin-inline-note">Use Subir/Descer para definir a sequência das metas nesta campanha.</p>`;
    return `<div class="rule-card metric-catalog-card"><h4>${area}</h4>${note}${rows}<button class="ghost-button" data-add-custom-metric="${area}" type="button">Adicionar meta</button></div>`;
  }).join("");
}

function renderEditableMetricCatalogEditor() {
  const container = document.getElementById("metricCatalogEditor");
  if (!container) return;
  const allowReorder = canReorderMetrics();
  const allowEdit = canEditCampaignData();
  const lockMessage = metricOrderLockMessage();
  container.innerHTML = ["Cabo", "Nao Cabo"].map((area) => {
    const metrics = metricsFor(area, state, { includeInactive: true });
    const rows = metrics.map((metric, index) => {
      const moveDisabledUp = !allowReorder || index === 0;
      const moveDisabledDown = !allowReorder || index === metrics.length - 1;
      const disabledAttr = allowEdit ? "" : "disabled";
      const groupOptions = METRIC_GROUPS.map((group) => `<option value="${group}" ${metricGroup(metric) === group ? "selected" : ""}>${metricGroupDisplay(group)}</option>`).join("");
      const typeOptions = METRIC_TYPES.map((type) => `<option value="${type}" ${metricTypeKind(metric) === type ? "selected" : ""}>${metricTypeDisplay(type)}</option>`).join("");
      const statusOptions = `<option value="true" ${metric.active !== false ? "selected" : ""}>Ativo</option><option value="false" ${metric.active === false ? "selected" : ""}>Inativo</option>`;
      const dataAttrs = (field) => `data-catalog-metric-field="${field}" data-catalog-metric-area="${area}" data-catalog-metric-id="${metric.id}"`;
      return `
        <div class="metric-row metric-catalog-row ${metric.isCustom ? "custom" : "system"} ${metric.active === false ? "inactive" : ""}">
          <div class="metric-order-cell">
            <span>${metric.sortOrder}</span>
            <button class="ghost-button compact-action icon-order-button" data-move-metric-order="-1" data-metric-order-area="${area}" data-metric-order-id="${metric.id}" type="button" title="Mover para cima" aria-label="Mover ${escapeHtml(metric.name)} para cima" ${moveDisabledUp ? "disabled" : ""}>&#8593;</button>
            <button class="ghost-button compact-action icon-order-button" data-move-metric-order="1" data-metric-order-area="${area}" data-metric-order-id="${metric.id}" type="button" title="Mover para baixo" aria-label="Mover ${escapeHtml(metric.name)} para baixo" ${moveDisabledDown ? "disabled" : ""}>&#8595;</button>
          </div>
          <label>Indicador<input ${dataAttrs("name")} value="${escapeHtml(metric.name)}" ${disabledAttr}></label>
          <label>Unidade<input ${dataAttrs("unit")} value="${escapeHtml(metric.unit || "Qtd.")}" ${disabledAttr}></label>
          <label>Tipo
            <select ${dataAttrs("type")} ${disabledAttr}>${metricFormulaOptions(metric.type)}</select>
          </label>
          <label>Bloco
            <select ${dataAttrs("groupMeta")} ${disabledAttr}>${groupOptions}</select>
          </label>
          <label>Tipo indicador
            <select ${dataAttrs("tipoIndicador")} ${disabledAttr}>${typeOptions}</select>
          </label>
          <label>Atingimento
            <select ${dataAttrs("participaAtingimento")} ${disabledAttr}>
              <option value="true" ${metricParticipates(metric) ? "selected" : ""}>Participa</option>
              <option value="false" ${!metricParticipates(metric) ? "selected" : ""}>Informativo</option>
            </select>
          </label>
          <label>Meta padrao<input ${dataAttrs("goal")} type="number" step="0.01" value="${metric.goal || 0}" ${disabledAttr}></label>
          <label>Chave CSV<input ${dataAttrs("importKey")} value="${escapeHtml(metric.importKey || metric.id)}" ${disabledAttr}></label>
          <label>Status
            <select ${dataAttrs("active")} ${disabledAttr}>${statusOptions}</select>
          </label>
          <div class="metric-catalog-actions">
            <button class="ghost-button compact-action" data-duplicate-metric="${metric.id}" data-catalog-metric-area="${area}" type="button" ${allowEdit ? "" : "disabled"}>Duplicar</button>
            <button class="${metric.active === false ? "ghost-button" : "danger-button"} compact-action" data-toggle-metric-active="${metric.id}" data-catalog-metric-area="${area}" data-next-active="${metric.active === false ? "true" : "false"}" type="button" ${allowEdit ? "" : "disabled"}>${metric.active === false ? "Ativar" : "Inativar"}</button>
            <button class="danger-button compact-action" data-remove-metric="${metric.id}" data-catalog-metric-area="${area}" type="button" ${allowEdit ? "" : "disabled"}>${metric.isCustom ? "Excluir" : "Inativar"}</button>
          </div>
        </div>
      `;
    }).join("");
    const editNote = allowEdit ? "Edite nome, unidade, tipo, bloco, participacao, meta padrao e chave CSV da campanha." : "Campanha fechada oficialmente. Indicadores congelados para edicao comum.";
    const note = lockMessage ? `<p class="admin-inline-note warning">${lockMessage}</p>` : `<p class="admin-inline-note">Use Subir/Descer para definir a sequencia das metas nesta campanha. ${editNote}</p>`;
    const empty = `<p class="muted-note">Nao ha metas ou indicadores cadastrados para esta campanha.</p>`;
    return `<div class="rule-card metric-catalog-card"><h4>${area}</h4>${note}${rows || empty}<button class="ghost-button" data-add-custom-metric="${area}" type="button" ${allowEdit ? "" : "disabled"}>Criar novo indicador</button></div>`;
  }).join("");
}

function branchMetricRows(sellers) {
  const byMetric = new Map();
  for (const seller of sellers) {
    ensureSellerValues(seller);
    for (const metric of metricsFor(seller.area).filter(metricParticipates)) {
      const key = `${seller.area}::${metric.id}`;
      const current = byMetric.get(key) || { id: metric.id, area: seller.area, name: `${metric.name} (${seller.area})`, goal: 0, realized: 0, projected: 0, hasGoal: false, hasProjection: false };
      const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
      const goal = metricGoalForSeller(seller, metric);
      if (!goal) continue;
      current.goal += goal;
      current.hasGoal = true;
      current.realized += finiteNumber(value.realized);
      const projectedValue = projectionForPeriod(value.realized);
      if (projectedValue !== null) {
        current.projected += projectedValue;
        current.hasProjection = true;
      }
      byMetric.set(key, current);
    }
  }
  return [...byMetric.values()].map((row) => ({
    ...row,
    currentPercent: row.goal ? row.realized / row.goal : null,
    projectedPercent: row.goal && row.hasProjection ? row.projected / row.goal : null,
    status: partialStatusFromProjected(row.goal && row.hasProjection ? row.projected / row.goal : null, row.goal ? row.realized / row.goal : null),
  })).sort((a, b) => metricOrderIndex(a.area, a.id) - metricOrderIndex(b.area, b.id) || a.area.localeCompare(b.area));
}

function branchStatusFromPercent(percent) {
  if (percent === null || percent === undefined || !Number.isFinite(Number(percent))) return { label: "Sem metas", cls: "neutral", action: "Revisar meta" };
  if (percent >= 1) return { label: "Acima da meta", cls: "ok", action: "Acompanhamento" };
  if (percent >= 0.8) return { label: "Em atenção", cls: "warn", action: "Plano de ação" };
  return { label: "Crítico", cls: "bad", action: "Ação imediata" };
}

function sellerBranchSummary(seller) {
  const result = sellerResult(seller);
  const gross = result.projectedSubtotal;
  const estornos = result.estornos || 0;
  const final = result.projected;
  const currentPercent = totalAttainmentForSellers([seller], "current");
  const projectedPercent = totalAttainmentForSellers([seller], "projected");
  const status = seller.emExperiencia ? { label: "Em experiencia", cls: "neutral", action: "Acompanhamento" } : branchStatusFromPercent(projectedPercent ?? currentPercent);
  return { result, gross, final, estornos, currentPercent, projectedPercent, status, deflator: result.projectedDeflator };
}

function projectedDeflatorPreview(seller) {
  const subtotal = sellerResult(seller).projectedSubtotal;
  const config = state.deflators?.[seller.area] || defaultDeflators[seller.area];
  const rules = Array.isArray(config) ? config : [
    { metricId: "gross", min: Number(config?.grossMin) || 0, penaltyRate: Number(config?.penaltyRate) || 0, name: "GROSS minimo" },
    { metricId: "tv", min: Number(config?.tvMin) || 0, penaltyRate: Number(config?.penaltyRate) || 0, name: "TV minimo" },
  ];
  const triggered = rules
    .map((rule) => {
      const metric = metricsFor(seller.area).find((item) => item.id === rule.metricId);
      const min = Number(rule.min) || 0;
      const percent = metric ? metricAttainmentForSeller(seller, metric.id, true) : null;
      return {
        ...rule,
        metric,
        percent,
        triggered: Boolean(metric && metricParticipates(metric) && min > 0 && percent !== null && percent < min),
        rate: Number(rule.penaltyRate) || 0,
      };
    })
    .filter((rule) => rule.triggered)
    .sort((a, b) => b.rate - a.rate);
  const rate = triggered.reduce((max, rule) => Math.max(max, rule.rate), 0);
  const previewImpact = rate ? -subtotal * rate : 0;
  const appliedImpact = seller.emExperiencia ? 0 : previewImpact;
  return { triggered, rate, previewImpact, appliedImpact, ignored: seller.emExperiencia && rate > 0 };
}

function metricDeflatorLabel(seller, metric) {
  const preview = projectedDeflatorPreview(seller);
  const rule = preview.triggered.find((item) => item.metric?.id === metric.id);
  if (!rule) return "Sem deflator";
  const label = `${escapeHtml(metric.name)} abaixo de ${pct.format(Number(rule.min) || 0)} aplica -${pct.format(rule.rate)}`;
  return seller.emExperiencia ? `${label} (ignorado)` : label;
}

function branchTotals(sellers) {
  const rows = branchMetricRows(sellers);
  const totalGoal = rows.reduce((sum, row) => sum + row.goal, 0);
  const realized = rows.reduce((sum, row) => sum + row.realized, 0);
  const projectedTotal = rows.reduce((sum, row) => sum + row.projected, 0);
  const commissionGross = sellers.reduce((sum, seller) => sum + sellerBranchSummary(seller).gross, 0);
  const commissionFinal = sellers.reduce((sum, seller) => sum + sellerBranchSummary(seller).final, 0);
  const deflatorImpact = sellers.reduce((sum, seller) => sum + sellerBranchSummary(seller).deflator, 0);
  const estornosTotal = sellers.reduce((sum, seller) => sum + sellerBranchSummary(seller).estornos, 0);
  return {
    rows,
    totalGoal,
    realized,
    projectedTotal,
    currentPercent: totalGoal ? realized / totalGoal : null,
    projectedPercent: totalGoal ? projectedTotal / totalGoal : null,
    commissionGross,
    commissionFinal,
    deflatorImpact,
    estornosTotal,
  };
}

function branchKpiCards(branch, sellers, totals) {
  const cards = [
    ["Meta da filial", num.format(totals.totalGoal), "Meta consolidada", "target", null],
    ["Realizado", num.format(totals.realized), "Resultado atual", "trend", totals.currentPercent],
    ["% atual", pct.format(totals.currentPercent), "Atingimento atual", "percent", totals.currentPercent],
    ["Projetado", `${num.format(totals.projectedTotal)} (${pct.format(totals.projectedPercent)})`, "Projeção / meta", "trend", totals.projectedPercent],
    ["Comissão estimada", money.format(totals.commissionFinal), `Bruta ${money.format(totals.commissionGross)} | Estornos ${discountMoney(totals.estornosTotal)}`, "money", null],
  ];
  return `<div class="branch-kpi-grid">${cards.map(([label, value, detail, icon, percent]) => `<article class="branch-kpi ${icon}"><span aria-hidden="true"></span><div><small>${label}</small><strong>${value}</strong><em class="${achievementClass(percent)}">${detail}</em></div></article>`).join("")}</div>`;
}

function branchAlerts(sellers, totals) {
  const riskSellers = sellers.filter((seller) => sellerBranchSummary(seller).currentPercent < 0.7);
  const projectedGap = Math.max(totals.totalGoal - totals.projectedTotal, 0);
  const deflatorSellers = sellers.filter((seller) => projectedDeflatorPreview(seller).rate > 0);
  const estornoSellers = sellers.filter((seller) => sellerBranchSummary(seller).estornos > 0);
  const deflatorText = deflatorSellers.length
    ? `${deflatorSellers.length} vendedor${deflatorSellers.length === 1 ? "" : "es"} possuem deflator aplicado ou previsto. Impacto estimado: ${money.format(totals.deflatorImpact)}.`
    : "Nenhum deflator aplicado no momento.";
  const estornoText = estornoSellers.length
    ? `${estornoSellers.length} vendedor${estornoSellers.length === 1 ? "" : "es"} com estornos. Impacto total: ${discountMoney(totals.estornosTotal)}.`
    : "Nenhum estorno aplicado no momento.";
  return `<div class="branch-alert-grid">
    <article class="branch-alert ${riskSellers.length ? "bad" : "ok"}"><strong>${riskSellers.length} vendedor${riskSellers.length === 1 ? "" : "es"} em risco</strong><span>${riskSellers.length ? "Estão com performance abaixo de 70% da meta atual." : "Nenhum vendedor abaixo de 70% no momento."}</span></article>
    <article class="branch-alert ${totals.projectedPercent >= 1 ? "ok" : "warn"}"><strong>Meta projetada</strong><span>A filial deve atingir ${pct.format(totals.projectedPercent)} da meta. ${projectedGap ? `Faltam ${num.format(projectedGap)} para atingir 100%.` : "Meta projetada atingida."}</span></article>
    <article class="branch-alert ${deflatorSellers.length ? "bad" : "ok"}"><strong>Deflatores ativos</strong><span>${deflatorText}</span></article>
    <article class="branch-alert ${estornoSellers.length ? "warn" : "ok"}"><strong>Estornos</strong><span>${estornoText}</span></article>
  </div>`;
}

function branchTeamTable(sellers) {
  const rows = [...sellers].sort((a, b) => sellerBranchSummary(b).currentPercent - sellerBranchSummary(a).currentPercent).map((seller) => {
    const summary = sellerBranchSummary(seller);
    const experience = seller.emExperiencia ? `<span class="status neutral">Em experiencia</span><small>Deflator ignorado</small>` : "";
    return `<tr>
      <td><strong>${escapeHtml(seller.name)}</strong><small>${escapeHtml(seller.area)}</small>${experience}</td>
      <td>${money.format(summary.result.current)}</td>
      <td>${achievementPill(summary.currentPercent)}</td>
      <td>${money.format(summary.gross)}</td>
      <td>${achievementPill(summary.projectedPercent)}</td>
      <td>${money.format(summary.gross)}</td>
      <td>${money.format(summary.deflator)}</td>
      <td>${discountMoney(summary.estornos)}</td>
      <td>${money.format(summary.final)}</td>
      <td><span class="status ${summary.status.cls}">${summary.status.label}</span></td>
      <td><button class="ghost-button compact-action" data-manager-seller-detail="${seller.id}" type="button">Ver detalhes</button></td>
    </tr>`;
  }).join("");
  return `<section class="branch-card-panel branch-team-panel"><div class="branch-card-head"><div><h3>Equipe da filial</h3><p>Comissão bruta, deflator, estornos e comissão estimada por vendedor.</p></div></div><div class="table-wrap branch-table-wrap"><table><thead><tr><th>Vendedor</th><th>Realizado</th><th>% atual</th><th>Projetado</th><th>% proj.</th><th>Comissão bruta</th><th>Deflator</th><th>Estornos</th><th>Comissão estimada</th><th>Status</th><th>Ações</th></tr></thead><tbody>${rows || `<tr><td colspan="11">Nenhum vendedor vinculado a esta filial.</td></tr>`}</tbody></table></div></section>`;
}

function branchSellerFilter(sellers) {
  const options = [`<option value="">Todos</option>`, ...sellers.map((seller) => `<option value="${seller.id}" ${seller.id === activeManagerSellerId ? "selected" : ""}>${escapeHtml(seller.name)}</option>`)];
  return `<section class="branch-card-panel branch-filter-panel"><label>Vendedor<select id="managerSellerFilter">${options.join("")}</select></label></section>`;
}

function branchPartialFilterControls(branch, sellers) {
  const published = publishedPartialsForCampaign();
  if (activeManagerPartialId !== "latest" && !published.some((partial) => partial.id === activeManagerPartialId)) activeManagerPartialId = "latest";
  const partial = getVisiblePartial("filial");
  const period = partial ? getPeriodForPartial(partial, activeCampaign()) : null;
  const records = branchPartialRecords(partial, branch, sellers, "", "Todos");
  const indicatorNames = [...new Set(records.map((record) => record.metric?.name || record.item.metricName).filter(Boolean))];
  const sellerOptions = [`<option value="">Todos</option>`, ...sellers.map((seller) => `<option value="${seller.id}" ${seller.id === activeManagerSellerId ? "selected" : ""}>${escapeHtml(seller.name)}</option>`)];
  const indicatorOptions = ["Todos", ...indicatorNames].map((name) => `<option value="${escapeHtml(name)}" ${name === activeManagerIndicator ? "selected" : ""}>${escapeHtml(name)}</option>`);
  const partialLabel = partialIsLatest(partial) ? "Exibindo" : "Exibindo parcial historica";
  const partialInfo = partial
    ? `${escapeHtml(partial.name)} - Base ${escapeHtml(partial.baseDate || "-")} - ${period?.daysDone || "-"} de ${period?.daysTotal || "-"} dias - ${escapeHtml(partial.status)}`
    : "Nenhuma parcial publicada para esta campanha.";
  return `<section class="branch-card-panel branch-filter-panel branch-partial-filter-panel">
    <div class="branch-filter-grid">
    <label>Parcial<select id="managerPartialFilter">${publishedPartialOptionsMarkup(activeManagerPartialId)}</select></label>
    <label>Vendedor<select id="managerSellerFilter">${sellerOptions.join("")}</select></label>
    <label>Indicador<select id="managerIndicatorFilter">${indicatorOptions.join("")}</select></label>
    </div>
    <div class="partial-meta-line"><strong>${partialIsLatest(partial) ? "Exibindo" : "Exibindo parcial histórica"}</strong><span>${partial ? `${escapeHtml(partial.name)} - Base ${escapeHtml(partial.baseDate || "-")} - ${escapeHtml(partial.status)}` : "Nenhuma parcial publicada para esta campanha."}</span></div>
  </section>`;
}

function sellerIndicatorDetailRows(seller) {
  ensureSellerValues(seller);
  let totalGoal = 0;
  let totalRealized = 0;
  let totalProjected = 0;
  const rows = metricsFor(seller.area).map((metric) => {
    const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
    const goal = Number(value.goal) || 0;
    const realized = Number(value.realized) || 0;
    const projectedValue = projected(realized);
    totalGoal += goal;
    totalRealized += realized;
    totalProjected += projectedValue;
    const currentPercent = goal ? realized / goal : null;
    const projectedPercent = goal ? projectedValue / goal : null;
    const status = branchStatusFromPercent(currentPercent || 0);
    return `<tr>
      <td>${escapeHtml(metric.name)}</td><td>${goal ? num.format(goal) : "-"}</td><td>${num.format(realized)}</td><td>${achievementPill(currentPercent)}</td><td>${num.format(Math.max(goal - realized, 0))}</td><td>${num.format(projectedValue)}</td><td>${achievementPill(projectedPercent)}</td><td>${metricDeflatorLabel(seller, metric)}</td><td><span class="status ${status.cls}">${status.label}</span></td>
    </tr>`;
  }).join("");
  const totalStatus = branchStatusFromPercent(totalGoal ? totalRealized / totalGoal : 0);
  return `${rows}<tr class="total-row"><td>Total</td><td>${num.format(totalGoal)}</td><td>${num.format(totalRealized)}</td><td>${achievementPill(totalGoal ? totalRealized / totalGoal : null)}</td><td>${num.format(Math.max(totalGoal - totalRealized, 0))}</td><td>${num.format(totalProjected)}</td><td>${achievementPill(totalGoal ? totalProjected / totalGoal : null)}</td><td>-</td><td><span class="status ${totalStatus.cls}">${totalStatus.label}</span></td></tr>`;
}

function sellerIndicatorDetailRowsGrouped(seller) {
  const { rows: detailRows, totals } = collaboratorMetricRows(seller);
  const rows = metricGroupHeaderRows(detailRows, 9, (row) => `<tr>
    <td>${escapeHtml(row.metric.name)}</td><td>${formatGoalLabel(row.metric, row.goal, row.participates)}</td><td>${formatMetricAmount(row.metric, row.realized)}</td><td>${achievementPill(row.currentPercent)}</td><td>${row.missing === null ? "-" : formatMetricAmount(row.metric, row.missing)}</td><td>${row.projectedValue === null ? "-" : formatMetricAmount(row.metric, row.projectedValue)}</td><td>${achievementPill(row.projectedPercent)}</td><td>${row.participates ? metricDeflatorLabel(seller, row.metric) : "Informativo"}</td><td><span class="status ${row.status.cls}">${row.status.label}</span></td>
  </tr>`);
  return `${rows}<tr class="total-row"><td>Total</td><td>${totals.goalCompletion.metCount}/${totals.goalCompletion.applicableCount} metas</td><td>${formatMetricAmount(null, totals.realized)}</td><td>${achievementPill(totals.currentPercent)}</td><td>${formatMetricAmount(null, totals.missing)}</td><td>${totals.projectedPercent === null ? "-" : formatMetricAmount(null, totals.projected)}</td><td>${achievementPill(totals.projectedPercent)}</td><td>-</td><td><span class="status ${totals.goalCompletion.status.cls}">${totals.goalCompletion.status.label}</span></td></tr>`;
}

function sellerDeflatorImpactCard(seller) {
  const summary = sellerBranchSummary(seller);
  const preview = projectedDeflatorPreview(seller);
  const reason = preview.triggered[0]?.metric?.name ? `${preview.triggered[0].metric.name} abaixo da meta minima` : "Sem motivo de deflator";
  const list = preview.triggered.length ? preview.triggered.map((rule) => `<li>Deflator ${escapeHtml(rule.metric.name)}: -${pct.format(rule.rate)} (${pct.format(rule.percent)} atual proj.)</li>`).join("") : `<li>Nenhum deflator aplicado para este vendedor.</li>`;
  const ignored = preview.ignored ? `<p class="admin-inline-note warning">Aplicacao: ignorado por vendedor em experiencia.</p>` : "";
  return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Impacto dos deflatores</h3><p>Impacto financeiro previsto no resultado do vendedor.</p></div></div><div class="deflator-impact-grid"><span>Comissao bruta<strong>${money.format(summary.gross)}</strong></span><span>Deflator aplicado<strong>${preview.rate ? `-${pct.format(preview.rate)}` : "0,0%"}</strong></span><span>Impacto financeiro<strong>${money.format(preview.ignored ? preview.previewImpact : summary.deflator)}</strong></span><span>Comissao estimada<strong>${money.format(summary.final)}</strong></span></div><strong class="deflator-reason">Motivo principal: ${escapeHtml(reason)}</strong><ul class="deflator-list">${list}</ul>${ignored}</section>`;
}

function sellerEstornoImpactCard(seller) {
  const summary = sellerBranchSummary(seller);
  const estornos = sellerEstornos(seller);
  const rows = estornos.items.map((item) => `<li>${escapeHtml(item.label)}: <strong>${discountMoney(item.value)}</strong></li>`).join("");
  if (!estornos.total) return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Estornos</h3><p>Valores descontados da comissao estimada.</p></div></div><p class="muted-note">Nenhum estorno aplicado.</p></section>`;
  return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Estornos</h3><p>Valores descontados da comissao estimada.</p></div></div><ul class="deflator-list">${rows}</ul><div class="deflator-impact-grid"><span>Total de estornos<strong>${discountMoney(estornos.total)}</strong></span><span>Comissao estimada<strong>${money.format(summary.final)}</strong></span></div></section>`;
}

function sellerRecommendedAction(seller) {
  const summary = sellerBranchSummary(seller);
  const preview = projectedDeflatorPreview(seller);
  const gaps = metricsFor(seller.area).filter(metricParticipates).map((metric) => {
    const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
    const goal = metricGoalForSeller(seller, metric);
    const projectedValue = projectionForPeriod(value.realized);
    if (!goal || projectedValue === null) return null;
    const missing = Math.max(goal - projectedValue, 0);
    return { metric, missing, percent: projectedValue / goal };
  }).filter((item) => item && item.missing > 0).sort((a, b) => a.percent - b.percent).slice(0, 2);
  {
    let safeText = "Ainda nao ha dados suficientes para gerar recomendacao.";
    if (summary.currentPercent !== null && summary.currentPercent >= 1 && !preview.triggered.length) safeText = "O vendedor esta acima da meta e sem deflatores aplicados. Mantenha o acompanhamento para proteger o resultado ate o fechamento.";
    else if (summary.currentPercent !== null && summary.currentPercent < 0.7) safeText = `O vendedor esta em situacao critica, com atingimento atual de ${formatPercent(summary.currentPercent)}. Priorizar plano de acao nos indicadores ${gaps.map((item) => item.metric.name).join(" e ") || "com maior falta"}.`;
    else if (preview.triggered.length) safeText = `O vendedor esta projetado para ${formatPercent(summary.projectedPercent)}, porem possui deflator de -${pct.format(preview.rate)} causado por ${preview.triggered[0].metric.name}. A recuperacao deste indicador pode elevar a comissao projetada para ${money.format(summary.gross)}.`;
    if (seller.emExperiencia && preview.triggered.length) safeText = `O vendedor esta em experiencia. Existe deflator previsto de -${pct.format(preview.rate)}, mas a aplicacao esta ignorada; acompanhe os indicadores ${preview.triggered.map((item) => item.metric.name).join(", ")} para evolucao.`;
    return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Acao recomendada</h3><p>Orientacao automatica para atuacao do gerente.</p></div></div><p class="recommended-action">${escapeHtml(safeText)}</p></section>`;
  }
  let text = "Ainda não há dados suficientes para gerar recomendação.";
  if (summary.currentPercent >= 1 && !preview.triggered.length) text = "O vendedor está acima da meta e sem deflatores aplicados. Mantenha o acompanhamento para proteger o resultado até o fechamento.";
  else if (summary.currentPercent < 0.7) text = `O vendedor está em situação crítica, com atingimento atual de ${formatPercent(summary.currentPercent)}. Priorizar plano de ação nos indicadores ${gaps.map((item) => item.metric.name).join(" e ") || "com maior falta"}.`;
  else if (preview.triggered.length) text = `O vendedor está projetado para ${formatPercent(summary.projectedPercent)}, porém possui deflator de -${pct.format(preview.rate)} causado por ${preview.triggered[0].metric.name}. A recuperação deste indicador pode elevar a comissão projetada para ${money.format(summary.gross)}.`;
  if (seller.emExperiencia && preview.triggered.length) text = `O vendedor está em experiência. Existe deflator previsto de -${pct.format(preview.rate)}, mas a aplicação está ignorada; acompanhe os indicadores ${preview.triggered.map((item) => item.metric.name).join(", ")} para evolução.`;
  return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Ação recomendada</h3><p>Orientação automática para atuação do gerente.</p></div></div><p class="recommended-action">${escapeHtml(text)}</p></section>`;
}

function sellerDetailPanel(seller) {
  if (!seller) return "";
  const summary = sellerBranchSummary(seller);
  return `<section class="branch-detail-grid"><section class="branch-card-panel wide"><div class="branch-card-head"><div><h3>Detalhamento por vendedor</h3><p>${escapeHtml(seller.name)} - ${escapeHtml(seller.branch)} - ${escapeHtml(seller.area)}</p></div></div><div class="seller-detail-kpis"><article><span>Realizado</span><strong>${money.format(summary.result.current)}</strong></article><article><span>% atual</span><strong>${formatPercent(summary.currentPercent)}</strong></article><article><span>Projetado</span><strong>${money.format(summary.gross)}</strong></article><article><span>% projetado</span><strong>${formatPercent(summary.projectedPercent)}</strong></article><article><span>Comissao bruta</span><strong>${money.format(summary.gross)}</strong></article><article><span>Deflator</span><strong>${money.format(summary.deflator)}</strong></article><article><span>Estornos</span><strong>${discountMoney(summary.estornos)}</strong></article><article><span>Comissao estimada</span><strong>${money.format(summary.final)}</strong></article><article><span>Status</span><strong><span class="status ${summary.status.cls}">${summary.status.label}</span></strong></article></div><div class="table-wrap branch-table-wrap"><table><thead><tr><th>Indicador</th><th>Meta</th><th>Realizado</th><th>% atual</th><th>Falta</th><th>Projetado</th><th>% projetado</th><th>Deflator</th><th>Status</th></tr></thead><tbody>${sellerIndicatorDetailRowsGrouped(seller)}</tbody></table></div></section><div>${sellerDeflatorImpactCard(seller)}${sellerEstornoImpactCard(seller)}${sellerRecommendedAction(seller)}</div></section>`;
}

function branchAttentionPoints(sellers) {
  const points = [];
  for (const seller of sellers) {
    const summary = sellerBranchSummary(seller);
    const preview = projectedDeflatorPreview(seller);
    if (summary.currentPercent < 0.7) points.push({ cls: "bad", text: `${seller.name} - ${formatPercent(summary.currentPercent)} da meta - Crítico` });
    else if (summary.currentPercent < 1) points.push({ cls: "warn", text: `${seller.name} - ${formatPercent(summary.currentPercent)} da meta - Em atenção` });
    if (preview.triggered.length) points.push({ cls: preview.ignored ? "neutral" : "bad", text: `${seller.name} - Deflator -${pct.format(preview.rate)} - ${preview.triggered[0].metric.name} abaixo do minimo${preview.ignored ? " (ignorado)" : ""}` });
    if (summary.estornos > 0) points.push({ cls: "warn", text: `${seller.name} possui ${money.format(summary.estornos)} em estornos aplicados no fechamento.` });
    if (seller.emExperiencia) points.push({ cls: "neutral", text: `${seller.name} - Em experiencia - Deflator ignorado` });
  }
  return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Pontos de atenção</h3><p>Vendedores e indicadores que exigem ação.</p></div></div><div class="branch-attention-list">${points.slice(0, 8).map((point) => `<div class="attention-row ${point.cls}"><strong>${escapeHtml(point.text)}</strong></div>`).join("") || `<p class="muted-note">Nenhum ponto crítico identificado no momento.</p>`}</div></section>`;
}

function branchRankingCard(sellers) {
  const ranked = [...sellers].sort((a, b) => sellerBranchSummary(b).currentPercent - sellerBranchSummary(a).currentPercent).slice(0, 8);
  return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Ranking interno</h3><p>Ranking dos vendedores da filial.</p></div></div><div class="executive-list">${ranked.map((seller, index) => { const summary = sellerBranchSummary(seller); return `<div class="executive-list-row"><strong>${index + 1}</strong><span>${escapeHtml(seller.name)}<small>${formatPercent(summary.currentPercent)} atual - ${formatPercent(summary.projectedPercent)} proj.</small></span><em>${money.format(summary.final)}</em></div>`; }).join("") || `<p class="muted-note">Nenhum vendedor para ranking.</p>`}</div></section>`;
}

function branchIndicatorAchievementCard(sellers) {
  const rows = branchMetricRows(sellers);
  return `<section class="branch-card-panel wide"><div class="branch-card-head"><div><h3>Atingimento por indicador da filial</h3><p>Indicadores consolidados da filial.</p></div></div><div class="branch-indicator-list">${rows.map((row) => {
    const percent = effectiveAttainmentPercent(row);
    const width = percent === null ? 0 : Math.min(140, Math.max(2, percent * 100));
    return `<div class="branch-chart-row ${achievementClass(percent)}"><div class="branch-chart-label"><strong>${escapeHtml(row.name)}</strong><span>${achievementPill(row.currentPercent)} ${achievementPill(row.projectedPercent)}</span></div><div class="branch-chart-track"><i style="width:${width}%"></i></div><small>Meta ${num.format(row.goal)} | Realizado ${num.format(row.realized)} | Projetado ${row.projectedPercent === null ? "-" : num.format(row.projected)} | <span class="status ${row.status.cls}">${row.status.label}</span></small></div>`;
  }).join("") || `<p class="muted-note">Nenhum indicador encontrado.</p>`}</div></section>`;
}

function branchDeflatorSummary(sellers) {
  const rows = sellers.map((seller) => ({ seller, summary: sellerBranchSummary(seller), preview: projectedDeflatorPreview(seller) })).filter((row) => row.preview.rate > 0 || row.summary.deflator < 0);
  const totalImpact = rows.reduce((sum, row) => sum + (row.preview.ignored ? 0 : row.summary.deflator), 0);
  const reasonCounts = new Map();
  for (const row of rows) for (const trigger of row.preview.triggered) reasonCounts.set(trigger.metric.name, (reasonCounts.get(trigger.metric.name) || 0) + 1);
  const mainReason = [...reasonCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "Sem deflator";
  return `<section class="branch-card-panel wide"><div class="branch-card-head"><div><h3>Resumo dos deflatores</h3><p>${rows.length} vendedor${rows.length === 1 ? "" : "es"} com deflator aplicado ou previsto. Impacto financeiro total: ${money.format(totalImpact)}. Principal motivo: ${escapeHtml(mainReason)}.</p></div></div><div class="table-wrap branch-table-wrap"><table><thead><tr><th>Vendedor</th><th>Deflator</th><th>Motivo</th><th>Impacto</th><th>Status</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${escapeHtml(row.seller.name)}</td><td>-${pct.format(row.preview.rate)}</td><td>${escapeHtml(row.preview.triggered[0]?.metric?.name || "-")} abaixo do minimo</td><td>${money.format(row.preview.ignored ? 0 : row.summary.deflator)}</td><td><span class="status ${row.preview.ignored ? "neutral" : "bad"}">${row.preview.ignored ? "Ignorado por experiencia" : "Aplicado"}</span></td></tr>`).join("") || `<tr><td colspan="5">Nenhum deflator aplicado no momento.</td></tr>`}</tbody></table></div></section>`;
}

function branchPartialRecords(partial, branch, sellers, sellerId = "", metricName = activeManagerIndicator) {
  if (!partial) return [];
  const branchSellers = sellerId ? sellers.filter((seller) => seller.id === sellerId) : sellers;
  return officialPartialRecords(partial, branchSellers, { metricName }).filter((record) => normalizedKey(record.seller.branch || record.item.branch) === normalizedKey(branch));
}

function branchPartialSellerRows(records) {
  return sortGoalCompletionRows(sellerRecordAnalyticRows(records));
}

function partialCriticalMetric(records) {
  return groupedPartialRows(records, (record) => record.metric?.name || record.item.metricName)
    .filter((row) => effectiveAttainmentPercent(row) !== null && effectiveAttainmentPercent(row) < 0.8)
    .sort((a, b) => effectiveAttainmentPercent(a) - effectiveAttainmentPercent(b) || (b.gap || 0) - (a.gap || 0))[0] || null;
}

function partialCriticalBlock(records) {
  return partialBlockRows(records)
    .filter((row) => effectiveAttainmentPercent(row) !== null && effectiveAttainmentPercent(row) < 0.8)
    .sort((a, b) => effectiveAttainmentPercent(a) - effectiveAttainmentPercent(b))[0] || null;
}

function partialOpportunityText(records, scope = "filial") {
  const block = partialCriticalBlock(records);
  const metric = partialCriticalMetric(records);
  if (!records.length) return `Nenhuma parcial publicada para gerar oportunidades da ${scope}.`;
  if (!block && !metric) return "Ainda nao ha metas suficientes para calcular oportunidades.";
  if (effectiveAttainmentPercent(block) >= 1) return `${metricGroupDisplay(block.key)} esta dentro do ritmo. Mantenha acompanhamento e proteja os indicadores com maior gap.`;
  return `Priorizar ${metricGroupDisplay(block?.key || "Sem bloco")}: ${metric?.key || "indicador critico"} esta com ${formatPercent(effectiveAttainmentPercent(metric))} projetado e gap de ${metric?.gap !== null && metric ? num.format(metric.gap) : "-"}.`;
}

function branchOfficialPartialCard(branch, sellers) {
  const partial = getVisiblePartial("filial");
  if (!partial) return `<section class="branch-card-panel wide"><div class="branch-card-head"><div><h3>Resultado parcial oficial</h3><p>Nenhuma parcial publicada para esta campanha.</p></div></div></section>`;
  const records = branchPartialRecords(partial, branch, sellers, showBranchPartialDetails ? activeManagerSellerId : "");
  const period = getPeriodForPartial(partial, activeCampaign());
  const totals = partialRecordTotals(records);
  const blockRows = consolidatedBlockRows(records);
  const indicatorStats = indicatorVolumeStats(consolidatedMetricGoalRows(records));
  const sellerRows = branchPartialSellerRows(records);
  const riskSellers = sellerRows.filter((row) => (row.metPercent !== null && row.metPercent < 0.8) || (row.projectedAverage !== null && row.projectedAverage < 0.8)).length;
  const criticalNames = criticalMetricList(consolidatedMetricGoalRows(records), 3).map((row) => dashboardMetricRowName(row)).join(", ") || "Nenhum";
  return `<section class="branch-card-panel wide"><div class="branch-card-head"><div><h3>Resultado parcial oficial</h3><p>${escapeHtml(partial.name)} - data base ${escapeHtml(partial.baseDate || "-")}.</p></div>${partialVisibilityBadge(partial)}</div>
    ${partialHistoryMessage(partial)}
    <div class="partial-meta-line"><strong>Informacoes da parcial</strong><span>${escapeHtml(partial.name)} | Base ${escapeHtml(partial.baseDate || "-")} | ${period.daysDone || "-"} de ${period.daysTotal || "-"} dias | ${totals.sellerIds.size} vendedores | ${totals.metrics.size} indicadores | ${records.length} linhas</span></div>
    <div class="branch-partial-summary analytic">
      <article><span>Indicadores na meta hoje</span><strong>${indicatorCountText(indicatorStats.currentMetCount, indicatorStats.indicatorCount)}</strong><small>Media atual ${formatPercent(indicatorStats.currentAverage)}</small></article>
      <article><span>Indicadores projetados</span><strong>${indicatorCountText(indicatorStats.projectedMetCount, indicatorStats.indicatorCount)}</strong><small>Media projetada ${formatPercent(indicatorStats.projectedAverage)}</small></article>
      <article><span>Vendedores em risco</span><strong>${riskSellers}</strong><small>Abaixo de 80% proj.</small></article>
      <article><span>Principais criticos</span><strong>${escapeHtml(criticalNames)}</strong><small>Indicadores abaixo de 80% proj.</small></article>
    </div>
    <div class="block-summary-head"><strong>Blocos de metas da filial</strong><span>Consolidado da equipe na parcial oficial.</span></div>
    <div class="block-summary-grid branch-block-summary">
      ${blockRows.map(blockSummaryCardMarkup).join("")}
    </div>
    <div class="branch-partial-actions"><button class="ghost-button" data-toggle-branch-partial-details type="button">${showBranchPartialDetails ? "Ocultar detalhes" : "Detalhes"}</button></div>
  </section>`;
}

function branchPartialTeamSummary(branch, sellers) {
  const partial = getVisiblePartial("filial");
  const records = branchPartialRecords(partial, branch, sellers, showBranchPartialDetails ? activeManagerSellerId : "");
  const rows = branchPartialSellerRows(records).slice(0, 8);
  return `<section class="branch-card-panel branch-team-panel"><div class="branch-card-head"><div><h3>Equipe da filial</h3><p>Gestao por vendedor com base na parcial oficial publicada.</p></div></div><div class="table-wrap branch-table-wrap"><table><thead><tr><th>Vendedor</th><th>% metas atingidas</th><th>% projetado</th><th>Gap</th><th>Bloco critico</th><th>Indicador critico</th><th>Criticos</th><th>Status</th><th>Detalhes</th></tr></thead><tbody>${rows.map((row) => {
    const sellerRecords = records.filter((record) => record.seller.id === row.seller.id);
    const criticalMetric = partialCriticalMetric(sellerRecords);
    const criticalBlock = partialCriticalBlock(sellerRecords);
    return `<tr><td data-label="Vendedor"><strong>${escapeHtml(row.seller.name)}</strong><small>${escapeHtml(row.seller.area)}</small></td><td data-label="% metas">${achievementPill(row.metPercent)}<small>${row.metCount}/${row.applicableCount}</small></td><td data-label="% projetado">${achievementPill(row.totals.projectedPercent)}</td><td data-label="Gap">${row.totals.gap === null ? "-" : num.format(row.totals.gap)}</td><td data-label="Bloco critico">${escapeHtml(metricGroupDisplay(criticalBlock?.key || "-"))}</td><td data-label="Indicador critico">${escapeHtml(criticalMetric?.key || "-")}</td><td data-label="Criticos">${row.criticalCount}</td><td data-label="Status"><span class="status ${row.status.cls}">${row.status.label}</span></td><td data-label="Detalhes"><button class="ghost-button compact-action" data-branch-partial-detail="${row.seller.id}" type="button">Ver detalhes</button></td></tr>`;
  }).join("") || `<tr><td colspan="9">Nenhum resultado parcial para esta filial.</td></tr>`}</tbody></table></div></section>`;
}

function branchPartialDetails(branch, sellers) {
  if (!showBranchPartialDetails) return "";
  const partial = getVisiblePartial("filial");
  const records = branchPartialRecords(partial, branch, sellers, activeManagerSellerId);
  if (activeManagerSellerId) {
    const body = metricGroupHeaderRows(records, 10, (record) => `<tr><td data-label="Bloco">${escapeHtml(metricGroupDisplay(record.groupMeta))}</td><td data-label="Indicador">${escapeHtml(record.metric?.name || record.item.metricName)}</td><td data-label="Meta">${record.goal ? formatMetricAmount(record.metric, record.goal) : record.participates ? "Meta nao configurada" : "Informativo"}</td><td data-label="Realizado">${formatMetricAmount(record.metric, record.realized)}</td><td data-label="% parcial">${achievementPill(record.percent)}</td><td data-label="Projecao">${record.projectedValue === null ? "-" : formatMetricAmount(record.metric, record.projectedValue)}</td><td data-label="% proj.">${achievementPill(record.projectedPercent)}</td><td data-label="Falta">${record.gap === null ? "-" : formatMetricAmount(record.metric, record.gap)}</td><td data-label="Ritmo/dia">${record.paceNeeded === null ? "-" : formatMetricPace(record.metric, record.paceNeeded)}</td><td data-label="Status"><span class="status ${record.status.cls}">${record.status.label}</span></td></tr>`);
    return `<section class="branch-card-panel wide"><div class="branch-card-head"><div><h3>Detalhes do vendedor</h3><p>${escapeHtml(records[0]?.seller?.name || "Vendedor")} na parcial selecionada.</p></div></div><div class="table-wrap branch-table-wrap"><table><thead><tr><th>Bloco</th><th>Indicador</th><th>Meta</th><th>Realizado</th><th>% parcial</th><th>Projecao</th><th>% proj.</th><th>Falta</th><th>Ritmo/dia</th><th>Status</th></tr></thead><tbody>${body || `<tr><td colspan="10">Nenhum dado parcial para o vendedor selecionado.</td></tr>`}</tbody></table></div></section>`;
  }
  const metricGroups = [...groupItems(records, (record) => `${record.groupMeta || metricGroup(record.metric)}|${record.metric?.id || record.item.metricName}`).entries()].map(([key, metricRecords]) => {
    const sample = metricRecords[0];
    const totals = partialRecordTotals(metricRecords);
    return { key, sample, totals };
  }).sort((a, b) => metricOrderIndex(a.sample.seller.area, a.sample.metric?.id || a.sample.item.metricId) - metricOrderIndex(b.sample.seller.area, b.sample.metric?.id || b.sample.item.metricId));
  const body = metricGroups.map((row) => {
    const metric = row.sample.metric;
    const status = row.totals.status;
    return `<tr><td data-label="Bloco">${escapeHtml(metricGroupDisplay(row.sample.groupMeta))}</td><td data-label="Indicador">${escapeHtml(metric?.name || row.sample.item.metricName)}</td><td data-label="Meta filial">${row.totals.goal ? formatMetricAmount(metric, row.totals.goal) : row.sample.participates ? "Meta nao configurada" : "Informativo"}</td><td data-label="Realizado">${formatMetricAmount(metric, row.totals.realized)}</td><td data-label="% parcial">${achievementPill(row.totals.percent)}</td><td data-label="Projecao">${row.totals.projected === null ? "-" : formatMetricAmount(metric, row.totals.projected)}</td><td data-label="% proj.">${achievementPill(row.totals.projectedPercent)}</td><td data-label="Falta">${row.totals.gap === null ? "-" : formatMetricAmount(metric, row.totals.gap)}</td><td data-label="Ritmo/dia">${row.totals.paceNeeded === null ? "-" : formatMetricPace(metric, row.totals.paceNeeded)}</td><td data-label="Status"><span class="status ${status.cls}">${status.label}</span></td></tr>`;
  }).join("");
  return `<section class="branch-card-panel wide"><div class="branch-card-head"><div><h3>Detalhes da filial</h3><p>Consolidado por indicador da filial na parcial selecionada.</p></div></div><div class="table-wrap branch-table-wrap"><table><thead><tr><th>Bloco</th><th>Indicador</th><th>Meta filial</th><th>Realizado</th><th>% parcial</th><th>Projecao</th><th>% proj.</th><th>Falta</th><th>Ritmo/dia</th><th>Status</th></tr></thead><tbody>${body || `<tr><td colspan="10">Nenhum dado parcial para o filtro selecionado.</td></tr>`}</tbody></table></div></section>`;
}

function branchPartialAttention(branch, sellers) {
  const records = branchPartialRecords(getVisiblePartial("filial"), branch, sellers);
  const rows = criticalMetricList(consolidatedMetricGoalRows(records), 8);
  return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Pontos de atencao</h3><p>Indicadores consolidados abaixo de 80% projetado.</p></div></div><div class="branch-attention-list">${rows.map((row) => `<div class="attention-row bad"><strong>${escapeHtml(dashboardMetricRowName(row))} - ${formatPercent(effectiveAttainmentPercent(row))} projetado</strong><span>Prioridade de atuacao da filial</span></div>`).join("") || `<p class="muted-note">Nenhum indicador critico abaixo de 80%.</p>`}</div></section>`;
}

function branchPartialRanking(branch, sellers) {
  const records = branchPartialRecords(getVisiblePartial("filial"), branch, sellers);
  const ranked = branchPartialSellerRows(records).slice(0, 8);
  return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Ranking interno</h3><p>Ranking por metas atingidas na parcial oficial.</p></div></div><div class="executive-list">${ranked.map((row, index) => `<div class="executive-list-row"><strong>${index + 1}</strong><span>${escapeHtml(row.seller.name)}<small>${row.metCount}/${row.applicableCount} metas | ${row.criticalCount} critico(s)</small></span><em>${achievementPill(row.metPercent)}</em></div>`).join("") || `<p class="muted-note">Nenhum vendedor para ranking.</p>`}</div></section>`;
}

function branchPartialOpportunities(branch, sellers) {
  const records = branchPartialRecords(getVisiblePartial("filial"), branch, sellers);
  return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Oportunidades da filial</h3><p>Prioridade sugerida pela parcial oficial.</p></div></div><p class="recommended-action">${escapeHtml(partialOpportunityText(records, "filial"))}</p></section>`;
}

function branchComparisonPanel(branch, sellers) {
  const campaign = activeCampaign();
  const selection = normalizeComparisonSelection("filial", campaign);
  if (!selection.published.length) {
    return `<section class="branch-card-panel wide comparison-panel">${comparisonEmptyState("Comparativo entre Parciais", "Nenhuma parcial publicada para comparacao.")}</section>`;
  }
  if (selection.published.length < 2) {
    return `<section class="branch-card-panel wide comparison-panel">${comparisonEmptyState("Comparativo entre Parciais", "E necessario ter pelo menos duas parciais publicadas para comparar evolucao.")}</section>`;
  }
  const controls = comparisonControlsMarkup("filial", selection, activeManagerCompareBlock);
  if (!selection.basePartial || !selection.comparePartial) {
    return `<section class="branch-card-panel wide comparison-panel"><div class="branch-card-head"><div><h3>Comparativo entre Parciais</h3><p>Selecione duas parciais para comparar.</p></div></div>${controls}<div class="empty-state">Selecione duas parciais para comparar.</div></section>`;
  }
  if (selection.basePartial.id === selection.comparePartial.id) {
    return `<section class="branch-card-panel wide comparison-panel"><div class="branch-card-head"><div><h3>Comparativo entre Parciais</h3><p>As parciais devem ser diferentes.</p></div></div>${controls}<div class="empty-state">Selecione parciais diferentes para comparar.</div></section>`;
  }
  const comparison = comparePartials(selection.basePartial, selection.comparePartial, {
    campaign,
    sellers,
    branch,
    metricName: activeManagerIndicator,
    block: activeManagerCompareBlock,
  });
  return `<section class="branch-card-panel wide comparison-panel">
    <div class="branch-card-head"><div><h3>Comparativo entre Parciais</h3><p>Evolucao da equipe por parciais oficiais publicadas.</p></div></div>
    ${controls}
    ${comparisonMetaLine(comparison)}
    ${comparisonSummaryCardsMarkup(comparison, "filial")}
    ${comparisonInsightsMarkup(comparison)}
    <div class="comparison-grid">
      ${comparisonEntityTableMarkup(comparison.bySeller, { title: "Comparativo por Vendedor", firstColumn: "Vendedor", subtitle: "Evolucao individual da equipe por % de metas atingidas." })}
      ${comparisonIndicatorTableMarkup(comparison.byIndicator, { title: "Comparativo por Indicador da Filial", subtitle: "Consolidado da filial, incluindo indicadores informativos." })}
    </div>
  </section>`;
}

function branchGraphicPanel(branch, sellers) {
  const partial = getVisiblePartial("filial");
  const period = partial ? getPeriodForPartial(partial, activeCampaign()) : null;
  const records = partial ? branchPartialRecords(partial, branch, sellers, activeManagerSellerId, activeManagerIndicator) : [];
  const sellerName = activeManagerSellerId ? sellers.find((seller) => seller.id === activeManagerSellerId)?.name : "";
  return partialGraphicMarkup({
    title: "Visão gráfica da filial",
    subtitle: sellerName
      ? `Veja o desempenho de ${sellerName} na parcial atual.`
      : "Veja o desempenho consolidado da equipe na parcial atual.",
    partial,
    period,
    records,
    context: "filial",
    activeBlock: activeManagerGraphicBlock,
    showBlockFilter: true,
    emptyMessage: "Nenhuma parcial publicada para gerar a visão gráfica da filial.",
  });
}

function branchCommercialPanel(branch, sellers) {
  const partial = getVisiblePartial("filial");
  const records = partial ? branchPartialRecords(partial, branch, sellers, "", "Todos") : [];
  return `<section class="branch-card-panel wide commercial-reading-panel">${commercialReadingMarkup({
    title: "Leitura comercial da filial",
    subtitle: "Indicadores complementares da equipe na parcial oficial.",
    records,
    emptyMessage: "Nenhuma parcial oficial publicada para leitura comercial da filial.",
  })}</section>`;
}

function branchDashboardMarkup(branch, sellers) {
  if (!sellers.length) return `<div class="branch-modern"><div class="branch-title-row"><div><p class="eyebrow">Comissao 360</p><h2>Gestao da Filial</h2><span>${escapeHtml(branch)}</span></div>${moduleCampaignSelectorMarkup("filial")}</div><div class="dashboard-empty-state active"><strong>Nenhum dado disponivel para esta filial.</strong><span>Configure vendedores, metas e realizados no Admin para visualizar o painel.</span></div></div>`;
  return `<div class="branch-modern"><div class="branch-title-row"><div><p class="eyebrow">Comissao 360</p><h2>Gestao da Filial</h2><span>${escapeHtml(branch)}</span></div>${moduleCampaignSelectorMarkup("filial")}</div>${branchPartialFilterControls(branch, sellers)}<div class="branch-main-grid"><div>${branchOfficialPartialCard(branch, sellers)}${branchPartialTeamSummary(branch, sellers)}</div><aside>${branchPartialAttention(branch, sellers)}${branchPartialRanking(branch, sellers)}${branchPartialOpportunities(branch, sellers)}</aside></div>${branchGraphicPanel(branch, sellers)}${branchCommercialPanel(branch, sellers)}${branchPartialDetails(branch, sellers)}</div>`;
}
function renderManager() {
  const loginPanel = document.getElementById("managerLoginPanel");
  const dashboard = document.getElementById("managerDashboard");
  const topAccess = document.getElementById("branchTopAccess");
  const managerView = document.getElementById("gerenteView");
  if (!loginPanel || !dashboard) return;
  state.branches = normalizeBranches(state.branches, state.sellers);
  state.branchPasswords = normalizeBranchPasswords(state.branchPasswords, state.managerAccess, state._legacyManagers, state.branches);
  if (!activeBranchSession || !state.branches.includes(activeBranchSession)) {
    activeManagerSellerId = "";
    activeManagerIndicator = "Todos";
    managerView?.classList.remove("manager-authenticated");
    managerView?.classList.add("manager-login-mode");
    if (topAccess) {
      topAccess.hidden = true;
      topAccess.innerHTML = "";
    }
    const options = state.branches.map((branch) => `<option value="${escapeHtml(branch)}">${escapeHtml(branch)}</option>`).join("");
    loginPanel.innerHTML = options ? `<div class="branch-login-card">
      <div class="branch-login-title"><span>Área da filial</span><strong>Acesso do gerente</strong></div>
      ${moduleCampaignSelectorMarkup("filial-login")}
      <label>Filial<select id="managerBranchSelect">${options}</select></label>
      <label>Senha<input id="managerPassword" type="password" placeholder="Senha da filial"></label>
      <span id="managerLoginError" class="form-error"></span>
      <button id="managerLogin" class="nav-button active" type="button">Entrar</button>
    </div>` : `<div class="branch-login-card">${moduleCampaignSelectorMarkup("filial-login")}<div class="empty-state">Cadastre uma filial no Admin para liberar esta visao.</div></div>`;
    dashboard.innerHTML = `<div class="branch-login-helper"><strong>Painel da filial</strong><span>A filial acessa somente a parcial oficial e o atingimento dos vendedores vinculados a ela.</span></div>`;
    return;
  }
  const sellers = state.sellers.filter((seller) => (seller.branch || "Sem filial") === activeBranchSession);
  if (activeManagerSellerId && !sellers.some((seller) => seller.id === activeManagerSellerId)) activeManagerSellerId = "";
  if (activeManagerIndicator !== "Todos" && !branchPartialRecords(getVisiblePartial("filial"), activeBranchSession, sellers, "", "Todos").some((record) => metricNameMatches(record.metric || { name: record.item.metricName }, activeManagerIndicator))) activeManagerIndicator = "Todos";
  managerView?.classList.add("manager-authenticated");
  managerView?.classList.remove("manager-login-mode");
  loginPanel.innerHTML = "";
  if (topAccess) {
    topAccess.hidden = document.body.dataset.view !== "gerente";
    topAccess.innerHTML = `<span>Filial</span><strong>${escapeHtml(activeBranchSession)}</strong><button id="managerLogout" class="ghost-button" type="button">Trocar filial</button>`;
  }
  dashboard.innerHTML = branchDashboardMarkup(activeBranchSession, sellers);
}

function selectedCollabSeller() {
  const authenticatedCollaborator = resolveAuthenticatedCollaborator();
  const id = authenticatedCollaborator?.id || document.getElementById("collabSellerSelect")?.value || state.sellers[0]?.id;
  return state.sellers.find((seller) => seller.id === id) || state.sellers[0];
}

function legacyCollaboratorLoginMarkup(seller) {
  return `<div class="collab-login">
    <div class="hero-number"><span>Vendedor</span><strong>${seller?.name || "Selecione"}</strong></div>
    <label>Senha
      <input id="collabPassword" type="password" placeholder="Senha do vendedor">
    </label>
    <span id="collabLoginError" class="form-error"></span>
    <button id="collabLogin" class="nav-button active" type="button">Entrar</button>
  </div>`;
}

function legacyPrepareCollaboratorPdfExport() {
  const seller = selectedCollabSeller();
  if (!seller || activeCollaboratorId !== seller.id) {
    alert("Entre com a senha do vendedor antes de exportar.");
    return;
  }
  const stamp = document.getElementById("collabExportStamp");
  if (stamp) {
    const period = partialPeriodInfo(getVisiblePartial("colaborador"));
    stamp.innerHTML = `
      <strong>Relatório do vendedor</strong>
      <span>${seller.name} - ${seller.branch} - ${seller.area}</span>
      <span>Periodo: ${period.month || state.period.month} | Dias realizados: ${period.daysDone || "-"} | Dias uteis: ${period.daysTotal || "-"}</span>
      <span>Exportado em ${dateTime.format(new Date())}</span>
    `;
  }
  document.body.classList.add("print-collaborator");
  window.setTimeout(() => window.print(), 150);
}

function legacyRenderCollaborator() {
  renderSelectors();
  const seller = selectedCollabSeller();
  if (!seller) return;
  if (activeCollaboratorId !== seller.id) {
    document.getElementById("collabHero").innerHTML = collaboratorLoginMarkup(seller);
    document.getElementById("collabMetricsBody").innerHTML = "";
    return;
  }
  ensureSellerValues(seller);
  const result = sellerResult(seller);
  const status = statusFor(seller);
  const projectedTotalBeforeDeflator = result.projectedSubtotal;
  document.getElementById("collabHero").innerHTML = `
    <div class="hero-number"><span>${seller.branch} - ${seller.area}</span><strong>${seller.name}</strong></div>
    <div class="hero-number"><span>Comissão total proj.</span><strong>${money.format(projectedTotalBeforeDeflator)}</strong></div>
    <div class="hero-number"><span>Deflator</span><strong>${money.format(result.projectedDeflator)}</strong></div>
    <div class="hero-number"><span>Comissão estimada</span><strong>${money.format(result.projected)}</strong></div>
    <div class="hero-number"><span>Status</span><strong><span class="status ${status.cls}">${status.label}</span></strong></div>
    <button id="collabLogout" class="ghost-button" type="button">Trocar vendedor</button>
  `;
  document.getElementById("collabMetricsBody").innerHTML = metricsFor(seller.area).map((metric) => {
    const value = seller.values[metric.id];
    const projectedValue = projected(value.realized);
    const missing = Math.max((Number(value.goal) || 0) - (Number(value.realized) || 0), 0);
    const currentPercent = Number(value.goal) ? (Number(value.realized) || 0) / Number(value.goal) : null;
    const projectedPercent = Number(value.goal) ? projectedValue / Number(value.goal) : null;
    const progressPercent = Math.max(0, Math.min(100, (currentPercent || 0) * 100));
    return `<tr>
      <td><span class="metric-title">${metric.name}</span><span class="metric-progress"><span style="width:${progressPercent}%"></span></span></td>
      <td>${num.format(value.goal)}</td>
      <td><input data-collab-realized="${metric.id}" type="number" value="${value.realized}"></td>
      <td>${achievementPill(currentPercent)}</td>
      <td>${num.format(missing)}</td>
      <td>${num.format(projectedValue)}</td>
      <td>${achievementPill(projectedPercent)}</td>
      <td>${money.format(metricCommission(seller, metric, "projected"))}</td>
    </tr>`;
  }).join("");
}

function collaboratorMetricRows(seller) {
  ensureSellerValues(seller);
  const rows = metricsFor(seller.area).map((metric) => {
    const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
    const participates = metricParticipates(metric);
    const goal = metricGoalForSeller(seller, metric);
    const realized = finiteNumber(value.realized);
    const projectedValue = projectionForPeriod(realized);
    const calc = indicatorCalculation({ metric, goal, realized, projectedValue, participates });
    const missing = calc.gap;
    return {
      metric,
      groupMeta: metricGroup(metric),
      tipoIndicador: metricTypeKind(metric),
      participates,
      goal: calc.goal,
      realized: calc.realized,
      projectedValue: calc.projectedValue,
      currentPercent: calc.currentPercent,
      projectedPercent: calc.projectedPercent,
      missing,
      status: calc.status,
      commission: metricCommission(seller, metric, "projected"),
      deflator: metricDeflatorLabel(seller, metric),
    };
  });
  const totals = rows.reduce((acc, row) => {
    acc.operationalRealized += row.realized;
    if (row.projectedValue !== null) {
      acc.operationalProjected += row.projectedValue;
      acc.operationalProjectionCount += 1;
    }
    if (!row.participates) {
      acc.infoRealized += row.realized;
      if (row.projectedValue !== null) {
        acc.infoProjected += row.projectedValue;
        acc.infoProjectionCount += 1;
      }
      acc.commission += row.commission;
      return acc;
    }
    if (!row.goal) {
      acc.withoutGoal += 1;
      acc.commission += row.commission;
      return acc;
    }
    acc.goal += row.goal;
    acc.realized += row.realized;
    if (row.projectedValue !== null) {
      acc.projected += row.projectedValue;
      acc.withProjection += 1;
    }
    acc.missing += row.missing || 0;
    acc.commission += row.commission;
    acc.withGoal += 1;
    return acc;
  }, { goal: 0, realized: 0, projected: 0, missing: 0, commission: 0, infoRealized: 0, infoProjected: 0, operationalRealized: 0, operationalProjected: 0, withGoal: 0, withoutGoal: 0, withProjection: 0, infoProjectionCount: 0, operationalProjectionCount: 0 });
  totals.currentPercent = totals.goal ? totals.realized / totals.goal : null;
  totals.projectedPercent = totals.goal && totals.withProjection ? totals.projected / totals.goal : null;
  totals.status = totals.withGoal ? partialStatusFromProjected(totals.projectedPercent, totals.currentPercent) : totals.withoutGoal ? { label: "Meta nao configurada", cls: "neutral", action: "Revisar meta" } : { label: "Sem metas", cls: "neutral", action: "Revisar meta" };
  totals.goalCompletion = goalCompletionByMetricRows(rows);
  return { rows, totals };
}

function collaboratorSummary(seller) {
  const result = sellerResult(seller);
  const metrics = collaboratorMetricRows(seller);
  const gross = result.projectedSubtotal;
  const estornos = result.estornos || 0;
  const final = result.projected;
  const preview = projectedDeflatorPreview(seller);
  const status = seller.emExperiencia ? { label: "Em experiencia", cls: "neutral", action: "Acompanhamento" } : metrics.totals.goalCompletion.status;
  return { result, metrics, gross, estornos, final, preview, status, currentPercent: metrics.totals.currentPercent, projectedPercent: metrics.totals.projectedPercent, goalCompletion: metrics.totals.goalCompletion };
}

function collaboratorLoginMarkup(seller) {
  return `<div class="collab-login">
    <div class="collab-login-identity"><span>Vendedor</span><strong>${escapeHtml(seller?.name || "Selecione")}</strong><small>${escapeHtml(seller ? `${seller.branch} - ${seller.area}` : "Selecione um vendedor")}</small></div>
    <label>Senha<input id="collabPassword" type="password" placeholder="Senha do vendedor"></label>
    <span id="collabLoginError" class="form-error"></span>
    <button id="collabLogin" class="nav-button active" type="button">Entrar</button>
    <p class="muted-note">Selecione um vendedor e informe a senha para visualizar seu desempenho.</p>
  </div>`;
}

function collaboratorGuidance(seller) {
  const summary = collaboratorSummary(seller);
  {
    const weak = [...summary.metrics.rows].filter(metricGoalApplies).sort((a, b) => effectiveAttainmentPercent(a) - effectiveAttainmentPercent(b)).slice(0, 2);
    const missingTotal = Math.ceil(summary.metrics.totals.missing || 0);
    if (!summary.metrics.rows.length) return "Ainda nao ha dados suficientes para gerar uma orientacao.";
    if (!summary.goalCompletion.applicableCount) return "Nenhuma meta aplicavel configurada para calcular atingimento.";
    if (summary.preview.triggered.length && !summary.preview.ignored) return `Voce possui deflator aplicado no momento. Atue no indicador ${summary.preview.triggered[0].metric.name} para recuperar parte da comissao.`;
    if (summary.projectedPercent !== null && summary.currentPercent !== null && summary.projectedPercent >= 1 && summary.currentPercent >= 1) return "Voce esta acima da meta. Continue protegendo seus indicadores para evitar deflatores.";
    if (summary.projectedPercent !== null && summary.projectedPercent < 1) return `Atencao: sua projecao esta abaixo da meta. Priorize ${weak.map((item) => item.metric.name).join(" e ") || "os indicadores criticos"} para recuperar sua comissao.`;
    return `Faltam ${num.format(missingTotal)} pontos de meta para atingir 100%. Mantenha o ritmo atual para alcancar sua projecao.`;
  }
}

function collaboratorOpportunity(seller) {
  const summary = collaboratorSummary(seller);
  {
    const weak = [...summary.metrics.rows].filter(metricGoalApplies).sort((a, b) => effectiveAttainmentPercent(a) - effectiveAttainmentPercent(b))[0];
    if (!summary.metrics.rows.length) return "Ainda nao ha dados suficientes para calcular oportunidades de ganho.";
    if (!summary.goalCompletion.applicableCount) return "Configure metas aplicaveis para calcular oportunidades.";
    if (summary.preview.triggered.length) {
      const trigger = summary.preview.triggered[0];
      const value = seller.values[trigger.metric.id] || { goal: trigger.metric.goal, realized: 0 };
      const goal = metricGoalForSeller(seller, trigger.metric);
      const projectedValue = projectionForPeriod(value.realized);
      const neededProjected = Math.ceil((goal || 0) * (Number(trigger.min) || 0));
      const needed = projectedValue === null ? 0 : Math.max(neededProjected - projectedValue, 0);
      return `Venda mais ${num.format(needed)} em ${trigger.metric.name} para remover o deflator de -${pct.format(summary.preview.rate)}. Isso pode aumentar sua comissao projetada em ${money.format(Math.abs(summary.preview.previewImpact))}.`;
    }
    if (summary.currentPercent !== null && summary.currentPercent >= 1) return "Voce esta acima da meta e sem deflatores. Continue mantendo o ritmo ate o fechamento.";
    return `Seu melhor caminho e acelerar ${weak?.metric?.name || "os indicadores abaixo da meta"}, que esta abaixo do ritmo necessario para atingir a meta.`;
  }
}

function collaboratorKpiMarkup(seller) {
  const summary = collaboratorSummary(seller);
  const progress = Math.max(0, Math.min(100, (summary.goalCompletion.metPercent || 0) * 100));
  const blockRows = metricRowsBlockSummary(summary.metrics.rows);
  const blockSummary = `<div class="block-summary-grid collab-block-summary">
    ${blockRows.map((row) => `<article class="block-summary-card ${row.status.cls}">
      <span>${escapeHtml(metricGroupDisplay(row.key))}</span>
      <strong>${achievementPill(row.metPercent)}</strong>
      <small>Indicadores na meta: ${row.metCount} de ${row.applicableCount}</small>
      <small>Projetado: ${achievementPill(row.projectedPercent)}</small>
    </article>`).join("")}
  </div>`;
  return `<section class="collab-card collab-main-kpi">
    <div class="collab-card-head"><h3>Minha comissao estimada</h3><span class="status ${summary.status.cls}">${summary.status.label}</span></div>
    <strong class="collab-money">${money.format(summary.final)}</strong>
    <div class="collab-kpi-line"><span>Metas atingidas: <b>${summary.goalCompletion.metCount}/${summary.goalCompletion.applicableCount}</b></span><span>% metas atingidas: <b>${formatPercent(summary.goalCompletion.metPercent)}</b></span></div>
    ${blockSummary}
    <div class="collab-commission-breakdown"><span>Comissao bruta <strong>${money.format(summary.gross)}</strong></span><span>Deflatores <strong>${money.format(summary.result.projectedDeflator)}</strong></span><span>Estornos <strong>${discountMoney(summary.estornos)}</strong></span><span>Comissao estimada <strong>${money.format(summary.final)}</strong></span></div>
    <div class="collab-progress"><span style="width:${progress}%"></span></div>
    <div class="collab-progress-meta"><small>${formatPercent(summary.goalCompletion.metPercent)} das metas</small><small>Meta 100%</small></div>
  </section>`;
}

function collaboratorMonthMarkup(periodOverride = null) {
  const partial = getVisiblePartial("colaborador");
  const period = periodOverride || partialPeriodInfo(partial);
  const done = Number(period.daysDone) || 0;
  const total = Number(period.daysTotal) || 0;
  const percent = total ? done / total : 0;
  return `<section class="collab-card collab-month-card"><div class="collab-card-head"><h3>Base da parcial</h3><span>${total && done ? pct.format(percent) : "-"}</span></div><div class="collab-month-grid"><span>Periodo<strong>${escapeHtml(period.month || activeCampaign()?.reference || "-")}</strong></span><span>Dias realizados<strong>${done ? num.format(done) : "-"}</strong></span><span>Dias uteis<strong>${total ? num.format(total) : "-"}</strong></span><span>Periodo concluido<strong>${total && done ? pct.format(percent) : "-"}</strong></span></div></section>`;
  return `<section class="collab-card collab-month-card"><div class="collab-card-head"><h3>Resumo do mês</h3><span>${total ? pct.format(percent) : "-"}</span></div><div class="collab-month-grid"><span>Mês<strong>${escapeHtml(state.period.month)}</strong></span><span>Dias realizados<strong>${num.format(done)}</strong></span><span>Dias úteis<strong>${num.format(total)}</strong></span><span>Período concluído<strong>${total ? pct.format(percent) : "-"}</strong></span></div></section>`;
}

function collaboratorDeflatorMarkup(seller) {
  const summary = collaboratorSummary(seller);
  const items = summary.preview.triggered.map((item) => `<li>Deflator ${escapeHtml(item.metric.name)}: -${pct.format(item.rate)} | Motivo: abaixo de ${pct.format(item.min)}</li>`).join("");
  if (seller.emExperiencia && summary.preview.triggered.length) return `<section class="collab-card collab-deflator-card"><div class="collab-card-head"><h3>Deflatores</h3><span class="status neutral">Ignorado</span></div><p><strong>Vendedor em experiencia.</strong> Deflator previsto: -${pct.format(summary.preview.rate)}.</p><p>Aplicacao: ignorado por periodo de experiencia.</p><p>Estornos aplicados: <strong>${discountMoney(summary.estornos)}</strong></p><p>Comissao estimada: <strong>${money.format(summary.final)}</strong></p><ul>${items}</ul></section>`;
  if (summary.preview.triggered.length) return `<section class="collab-card collab-deflator-card"><div class="collab-card-head"><h3>Deflatores</h3><span class="status bad">Aplicado</span></div><p>Deflator aplicado: <strong>-${pct.format(summary.preview.rate)}</strong></p><p>Impacto financeiro: <strong>${money.format(summary.result.projectedDeflator)}</strong></p><p>Comissao bruta: <strong>${money.format(summary.gross)}</strong></p><p>Estornos: <strong>${discountMoney(summary.estornos)}</strong></p><p>Comissao estimada: <strong>${money.format(summary.final)}</strong></p><ul>${items}</ul></section>`;
  return `<section class="collab-card collab-deflator-card"><div class="collab-card-head"><h3>Deflatores</h3><span class="status ok">Sem desconto</span></div><p>Nenhum deflator aplicado no momento.</p><p>Sua comissao projetada nao possui desconto de deflator.</p></section>`;
}

function collaboratorEstornosMarkup(seller) {
  const summary = collaboratorSummary(seller);
  const estornos = sellerEstornos(seller);
  if (!estornos.total) return `<section class="collab-card collab-estornos-card"><div class="collab-card-head"><h3>Estornos</h3><span class="status ok">Sem estorno</span></div><p>Nenhum estorno aplicado.</p></section>`;
  return `<section class="collab-card collab-estornos-card"><div class="collab-card-head"><h3>Estornos</h3><span class="status warn">Desconto</span></div><dl class="estorno-breakdown">${estornos.items.map((item) => `<dt>${escapeHtml(item.label)}</dt><dd>${discountMoney(item.value)}</dd>`).join("")}<dt>Total de estornos</dt><dd><strong>${discountMoney(estornos.total)}</strong></dd><dt>Comissao estimada</dt><dd><strong>${money.format(summary.final)}</strong></dd></dl></section>`;
}

function sellerWithPartialValues(seller, records) {
  const clone = {
    ...seller,
    values: JSON.parse(JSON.stringify(seller.values || {})),
    adjustments: { ...(seller.adjustments || {}) },
  };
  ensureSellerValues(clone);
  for (const record of records) {
    if (!record.metric) continue;
    const current = clone.values[record.metric.id] || { goal: record.metric.goal, realized: 0 };
    const goal = record.goal !== null && record.goal !== undefined ? record.goal : (current.goal !== undefined && current.goal !== "" ? current.goal : record.metric.goal);
    clone.values[record.metric.id] = {
      ...current,
      goal,
      realized: record.realized,
    };
  }
  return clone;
}

function collaboratorOfficialPartialData(seller) {
  const partial = getVisiblePartial("colaborador");
  const records = partial ? officialPartialRecords(partial, [seller]) : [];
  const totals = partialRecordTotals(records);
  const blockRows = partialBlockRows(records);
  const criticalMetric = partialCriticalMetric(records);
  const partialSeller = sellerWithPartialValues(seller, records);
  const period = partial ? getPeriodForPartial(partial, activeCampaign()) : null;
  const commission = records.length ? withProjectionPeriod(period, () => sellerResult(partialSeller)) : null;
  return { partial, records, totals, blockRows, criticalMetric, commission };
}

function collaboratorPartialSelectorMarkup(seller) {
  const published = publishedPartialsForCampaign();
  if (activeCollaboratorPartialId !== "latest" && !published.some((partial) => partial.id === activeCollaboratorPartialId)) activeCollaboratorPartialId = "latest";
  const partial = getVisiblePartial("colaborador");
  const period = partial ? getPeriodForPartial(partial, activeCampaign()) : null;
  const sellerHasRecords = partial && officialPartialRecords(partial, [seller]).length > 0;
  return `<section class="collab-card collab-partial-selector">
    <div class="collab-card-head">
      <div><h3>Histórico de parciais</h3><p>Consulte parciais publicadas sem alterar sua simulação.</p></div>
      ${partialVisibilityBadge(partial)}
    </div>
    <div class="branch-filter-panel compact-filter">
      <label>Parcial<select id="collabPartialFilter">${publishedPartialOptionsMarkup(activeCollaboratorPartialId)}</select></label>
      <div class="partial-meta-line"><strong>${partial ? (partialIsLatest(partial) ? "Exibindo" : "Parcial histórica") : "Sem parcial"}</strong><span>${partial ? `${escapeHtml(partial.name)} - Base ${escapeHtml(partial.baseDate || "-")} - ${escapeHtml(partial.status)}` : "Resultado parcial oficial ainda não disponível para esta campanha."}</span></div>
    </div>
    ${partialHistoryMessage(partial)}
    ${partial && !sellerHasRecords ? `<p class="admin-inline-note warning">Nao ha resultado parcial publicado para este vendedor nesta parcial.</p>` : ""}
    ${partial ? `<div class="partial-meta-line"><strong>Base da parcial</strong><span>${period?.daysDone || "-"} de ${period?.daysTotal || "-"} dias</span></div>` : ""}
  </section>`;
}

function collaboratorGraphicPanel(seller) {
  const { partial, records } = collaboratorOfficialPartialData(seller);
  const period = partial ? getPeriodForPartial(partial, activeCampaign()) : null;
  return partialGraphicMarkup({
    title: "Visão gráfica da parcial",
    subtitle: "Veja rapidamente como estão suas metas na parcial atual.",
    partial,
    period,
    records,
    context: "colaborador",
    activeBlock: activeCollaboratorGraphicBlock,
    showBlockFilter: true,
    emptyMessage: "Resultado parcial oficial ainda não disponível para gerar a visão gráfica.",
  });
}

function sellerMatchesClosingRow(row, seller) {
  if (!row || !seller) return false;
  if (row.sellerId && row.sellerId === seller.id) return true;
  return normalizedIdentity(row.name || row.seller) === normalizedIdentity(seller.name)
    && normalizedIdentity(row.branch) === normalizedIdentity(seller.branch)
    && (!row.area || normalizedIdentity(row.area) === normalizedIdentity(seller.area));
}

function officialExtractForSeller(seller, campaign = activeCampaign()) {
  const closing = publishedOfficialClosingForCampaign(campaign);
  if (!closing || !seller) return null;
  const snapshot = closingSnapshotForDisplay(campaign, closing);
  const row = snapshot?.sellers?.find((item) => sellerMatchesClosingRow(item, seller)) || null;
  return row ? { closing, snapshot, row } : null;
}

function closingIndicatorMetricLike(indicator) {
  return {
    id: indicator?.metricId || indicator?.metric || "",
    name: indicator?.metric || "Indicador",
    unit: indicator?.unit || "",
    groupMeta: indicator?.groupMeta || "Sem bloco",
    tipoIndicador: indicator?.tipoIndicador || (indicator?.unit === "R$" ? "receita" : "volume"),
    participaAtingimento: indicator?.participaAtingimento === true,
  };
}

function closingIndicatorRowsForSeller(row) {
  return (row?.indicators || []).map((indicator) => {
    const metric = closingIndicatorMetricLike(indicator);
    const participates = indicator.participaAtingimento === true;
    const goal = validGoalValue(indicator.goal);
    const status = !participates
      ? { label: "Informativo", cls: "neutral" }
      : goal === null
        ? { label: "Meta nao configurada", cls: "neutral" }
        : partialStatusFromProjected(indicator.currentPercent, indicator.currentPercent);
    return {
      ...indicator,
      metric,
      groupMeta: indicator.groupMeta || metric.groupMeta,
      participates,
      goal,
      realized: finiteNumber(indicator.realized),
      projected: Number.isFinite(Number(indicator.projected)) ? Number(indicator.projected) : null,
      currentPercent: Number.isFinite(Number(indicator.currentPercent)) ? Number(indicator.currentPercent) : null,
      projectedPercent: Number.isFinite(Number(indicator.projectedPercent)) ? Number(indicator.projectedPercent) : null,
      missing: goal === null ? null : Math.max(goal - finiteNumber(indicator.realized), 0),
      statusObj: status,
    };
  });
}

function closingIndicatorDeflatorLabel(item) {
  if (!item?.participates) return "Informativo";
  const value = item.deflator;
  if (value === null || value === undefined || value === "") return "-";
  return Number.isFinite(Number(value)) ? money.format(Number(value)) : String(value);
}

function officialExtractStateMessage(seller) {
  const campaign = activeCampaign();
  const closing = officialClosingForCampaign(campaign);
  if (!closing) return "Extrato oficial ainda nao disponivel para esta campanha.";
  if (!closingExtractsPublished(closing)) return "Extrato oficial ainda nao disponivel para esta campanha.";
  if (!officialExtractForSeller(seller, campaign)) return "Nenhum extrato oficial encontrado para este vendedor nesta campanha.";
  return "";
}

function collaboratorOfficialExtractMarkup(seller) {
  const campaign = activeCampaign();
  const data = officialExtractForSeller(seller, campaign);
  if (!data) {
    return `<section class="collab-card collab-official-extract-card">
      <div class="collab-card-head"><div><h3>Extrato oficial</h3><p>Resultado fechado da campanha.</p></div><span class="status neutral">Indisponivel</span></div>
      <section class="collab-empty-state">${escapeHtml(officialExtractStateMessage(seller))}</section>
    </section>`;
  }
  const { closing, snapshot, row } = data;
  const rows = closingIndicatorRowsForSeller(row);
  const completion = goalCompletionStats(rows);
  const closedAt = row.closedAt || snapshot.closedAt || closing.closedAt;
  const publishedAt = closing.publishedAt || snapshot.publishedAt;
  const deflatorValue = finiteNumber(row.deflatorImpact ?? row.deflator);
  const deflatorText = row.emExperiencia && finiteNumber(row.deflator)
    ? "Vendedor em experiencia - deflator ignorado."
    : deflatorValue
      ? `${row.deflatorReason || "Deflator aplicado"} | Impacto: ${money.format(deflatorValue)}`
      : "Nenhum deflator aplicado.";
  const tableRows = metricGroupHeaderRows(rows, 10, (item) => `<tr>
    <td>${escapeHtml(item.metric.name)}</td>
    <td>${formatGoalLabel(item.metric, item.goal, item.participates)}</td>
    <td>${formatMetricAmount(item.metric, item.realized)}</td>
    <td>${formatMetricAmount(item.metric, item.projected)}</td>
    <td>${achievementPill(item.currentPercent)}</td>
    <td>${item.missing === null ? "-" : formatMetricAmount(item.metric, item.missing)}</td>
    <td>${money.format(finiteNumber(item.commission))}</td>
    <td>${escapeHtml(closingIndicatorDeflatorLabel(item))}</td>
    <td><span class="status ${item.statusObj.cls}">${escapeHtml(item.status || item.statusObj.label)}</span></td>
    <td>${item.participates ? "Meta" : "Informativo"}</td>
  </tr>`);
  const cards = rows.map((item) => `<article class="collab-indicator-card">
    <div><strong>${escapeHtml(item.metric.name)}</strong><span class="status ${item.statusObj.cls}">${escapeHtml(item.status || item.statusObj.label)}</span></div>
    <small class="metric-block-label">${escapeHtml(metricGroupDisplay(item.groupMeta))}</small>
    <dl>
      <dt>Meta</dt><dd>${formatGoalLabel(item.metric, item.goal, item.participates)}</dd>
      <dt>Realizado final</dt><dd>${formatMetricAmount(item.metric, item.realized)}</dd>
      <dt>Projecao</dt><dd>${formatMetricAmount(item.metric, item.projected)}</dd>
      <dt>% atingimento</dt><dd>${formatPercent(item.currentPercent)}</dd>
      <dt>Falta</dt><dd>${item.missing === null ? "-" : formatMetricAmount(item.metric, item.missing)}</dd>
      <dt>Comissao</dt><dd>${money.format(finiteNumber(item.commission))}</dd>
      <dt>Deflator</dt><dd>${escapeHtml(closingIndicatorDeflatorLabel(item))}</dd>
    </dl>
  </article>`).join("");
  return `<section class="collab-card collab-official-extract-card">
    <div class="collab-card-head">
      <div><h3>Extrato oficial</h3><p>Resultado oficial fechado da campanha. Somente leitura.</p></div>
      <span class="status ok">Publicado</span>
    </div>
    <p class="metric-info-note">Este extrato vem do snapshot congelado do fechamento oficial. Metas atuais, parciais futuras e simulacoes nao recalculam estes valores.</p>
    <div class="collab-month-grid official-extract-meta">
      <span>Campanha<strong>${escapeHtml(snapshot.campaignName || campaign?.name || "-")}</strong></span>
      <span>Referencia<strong>${escapeHtml(snapshot.reference || campaign?.reference || "-")}</strong></span>
      <span>Periodo base<strong>${snapshot.daysDone || snapshot.basePartialDaysDone || "-"} de ${snapshot.daysTotal || snapshot.basePartialDaysTotal || "-"} dias</strong></span>
      <span>Fechado em<strong>${closedAt ? dateTime.format(new Date(closedAt)) : "-"}</strong></span>
      <span>Publicado em<strong>${publishedAt ? dateTime.format(new Date(publishedAt)) : "-"}</strong></span>
      <span>Vendedor<strong>${escapeHtml(row.name || seller.name)}</strong></span>
      <span>Filial<strong>${escapeHtml(row.branch || seller.branch)}</strong></span>
      <span>Area<strong>${escapeHtml(row.area || seller.area)}</strong></span>
      <span>Status oficial<strong>${escapeHtml(closing.status)}</strong></span>
    </div>
    <div class="branch-partial-summary analytic official-extract-finance">
      <article><span>Comissao bruta</span><strong>${money.format(finiteNumber(row.commissionGross))}</strong><small>Antes dos descontos</small></article>
      <article><span>Deflatores</span><strong>${money.format(deflatorValue)}</strong><small>${escapeHtml(row.deflatorReason || "Sem deflator")}</small></article>
      <article><span>Estornos</span><strong>${discountMoney(row.estornosTotal)}</strong><small>Qualidade, seguro e carrossel</small></article>
      <article><span>Comissao final</span><strong>${money.format(finiteNumber(row.commissionFinal))}</strong><small>Valor oficial fechado</small></article>
      <article><span>Metas atingidas</span><strong>${completion.metCount}/${completion.applicableCount}</strong><small>${formatPercent(completion.metPercent)}</small></article>
    </div>
    <div class="official-extract-breakdown">
      <article class="partial-meta-line"><strong>Deflatores</strong><span>${escapeHtml(deflatorText)}</span></article>
      <article class="partial-meta-line"><strong>Estornos</strong><span>Qualidade: ${discountMoney(row.estornoQuality)} | Seguro: ${discountMoney(row.estornoInsurance)} | Carrossel: ${discountMoney(row.estornoCarousel)} | Total: ${discountMoney(row.estornosTotal)}</span></article>
    </div>
    <div class="table-wrap collab-table-wrap"><table><thead><tr><th>Indicador</th><th>Meta</th><th>Realizado final</th><th>Projecao</th><th>% atingimento</th><th>Falta</th><th>Comissao</th><th>Deflator</th><th>Status</th><th>Tipo</th></tr></thead><tbody>${tableRows}</tbody></table></div>
    <div class="collab-indicator-cards collab-detail-cards">${cards}</div>
  </section>`;
}

function collaboratorTabsMarkup() {
  const tabs = [
    ["resumo", "Resumo"],
    ["detalhes", "Detalhes da parcial"],
    ["simulador", "Simulador"],
    ["extrato", "Extrato oficial"],
  ];
  return `<nav class="collab-tabs" aria-label="Navegacao do vendedor">${tabs.map(([id, label]) => `<button type="button" data-collab-tab="${id}" class="${activeCollaboratorTab === id ? "active" : ""}">${label}</button>`).join("")}</nav>`;
}

function collaboratorOfficialSummaryMarkup(seller) {
  const { partial, records, totals, blockRows, criticalMetric, commission } = collaboratorOfficialPartialData(seller);
  if (!partial) return `<section class="collab-card collab-official-partial-card"><div class="collab-card-head"><h3>Resultado parcial oficial</h3><span class="status neutral">Indisponível</span></div><p>Resultado parcial oficial ainda não disponível para esta campanha.</p></section>`;
  if (!records.length) return `<section class="collab-card collab-official-partial-card"><div class="collab-card-head"><h3>Resultado parcial oficial</h3><span class="status neutral">${escapeHtml(partial.name)}</span></div><p>Não há resultado parcial publicado para este vendedor.</p></section>`;
  const period = partialPeriodInfo(partial);
  const blockGoalRows = goalCompletionBlocksFromRecords(records);
  const completion = goalCompletionStats(records);
  const previewSeller = sellerWithPartialValues(seller, records);
  const preview = projectedDeflatorPreview(previewSeller);
  const opportunity = criticalMetric
    ? `Principal oportunidade: ${criticalMetric.key} esta com ${achievementPill(criticalMetric.projectedPercent)} projetado, gap de ${criticalMetric.gap === null ? "-" : num.format(criticalMetric.gap)} e ritmo necessario de ${criticalMetric.paceNeeded === null ? "-" : `${num1.format(criticalMetric.paceNeeded)}/dia`}.`
    : "Ainda nao ha oportunidade calculada para esta parcial.";
  const deflatorBox = preview.triggered.length
    ? `<div class="partial-meta-line warning"><strong>Deflatores identificados</strong><span>${preview.triggered.map((item) => `${item.metric.name} abaixo da regra minima`).join(" | ")}${preview.ignored ? " | Ignorado por experiencia" : ""}</span></div>`
    : `<div class="partial-meta-line"><strong>Deflatores</strong><span>Nenhum deflator identificado.</span></div>`;
  return `<section class="collab-card collab-official-summary-card">
    <div class="collab-card-head"><div><h3>Resultado parcial oficial</h3><p>Este é o resultado parcial oficial importado pela empresa.</p></div>${partialVisibilityBadge(partial)}</div>
    <div class="collab-month-grid">
      <span>Campanha<strong>${escapeHtml(partial.campaignName || activeCampaign()?.name || "-")}</strong></span>
      <span>Parcial<strong>${escapeHtml(partial.name)}</strong></span>
      <span>Data base<strong>${escapeHtml(partial.baseDate || "-")}</strong></span>
      <span>Status<strong>${escapeHtml(partial.status || "-")}</strong></span>
      <span>Dias realizados<strong>${num.format(period.daysDone)}</strong></span>
      <span>Dias úteis<strong>${num.format(period.daysTotal)}</strong></span>
      <span>Dias restantes<strong>${num.format(period.daysRemaining)}</strong></span>
    </div>
    <div class="block-summary-grid collab-block-summary">
      ${blockGoalRows.map((row) => `<article class="block-summary-card ${row.status.cls}"><span>${escapeHtml(metricGroupDisplay(row.key))}</span><strong>${achievementPill(row.metPercent)}</strong><small>Indicadores na meta: ${row.metCount} de ${row.applicableCount}</small><small>Projetado do bloco: ${achievementPill(row.totals.projectedPercent)} | Criticos: ${criticalMetricNames(row.items, 3) || "Nenhum"}</small></article>`).join("")}
    </div>
    <div class="branch-partial-summary analytic">
      <article><span>Comissao estimada</span><strong>${commission ? money.format(commission.projected) : "-"}</strong><small>Com base na parcial</small></article>
      <article><span>Metas atingidas</span><strong>${completion.metCount}/${completion.applicableCount}</strong><small>${completion.metPercent === null ? "-" : pct.format(completion.metPercent)}</small></article>
      <article><span>Indicadores abaixo de 80%</span><strong>${completion.criticalCount}</strong><small>Base: % projetado</small></article>
      <article><span>Parcial publicada</span><strong>${escapeHtml(partial.name)}</strong><small>${escapeHtml(partial.baseDate || "-")}</small></article>
    </div>
    ${deflatorBox}
    <p class="recommended-action">${opportunity}</p>
  </section>`;
}

function collaboratorOfficialPartialMarkup(seller) {
  const partial = getVisiblePartial("colaborador");
  if (!partial) return `<section class="collab-card collab-official-partial-card"><div class="collab-card-head"><h3>Resultado parcial oficial</h3><span class="status neutral">Indisponível</span></div><p>Resultado parcial oficial ainda não disponível para esta campanha.</p></section>`;
  const items = partialItemsForSeller(partial, seller);
  if (!items.length) return `<section class="collab-card collab-official-partial-card"><div class="collab-card-head"><h3>Resultado parcial oficial</h3><span class="status neutral">${escapeHtml(partial.name)}</span></div><p>Não há resultado parcial publicado para este vendedor.</p></section>`;
  const period = partialPeriodInfo(partial);
  const rows = items.map((item) => ({ item, ...partialMetricContext(item, seller, partial) }));
  const body = metricGroupHeaderRows(rows, 10, (row) => `<tr>
    <td>${escapeHtml(row.metric?.name || row.item.metricName)}</td>
    <td>${escapeHtml(metricGroupDisplay(row.groupMeta))}</td>
    <td>${row.goal ? formatMetricAmount(row.metric, row.goal) : row.participates ? "Meta nao configurada" : "Informativo"}</td>
    <td>${formatMetricAmount(row.metric, row.realized)}</td>
    <td>${achievementPill(row.percent)}</td>
    <td>${row.projectedValue === null ? "-" : formatMetricAmount(row.metric, row.projectedValue)}</td>
    <td>${achievementPill(row.projectedPercent)}</td>
    <td>${row.gap === null ? "-" : formatMetricAmount(row.metric, row.gap)}</td>
    <td>${row.paceNeeded === null ? "-" : formatMetricPace(row.metric, row.paceNeeded)}</td>
    <td><span class="status ${row.status.cls}">${row.status.label}</span></td>
  </tr>`);
  const cards = rows.map((row) => `<article class="collab-indicator-card">
    <div><strong>${escapeHtml(row.metric?.name || row.item.metricName)}</strong><span class="status ${row.status.cls}">${row.status.label}</span></div>
    <small class="metric-block-label">${escapeHtml(metricGroupDisplay(row.groupMeta))}</small>
    <dl>
      <dt>Meta</dt><dd>${row.goal ? formatMetricAmount(row.metric, row.goal) : row.participates ? "Meta nao configurada" : "Informativo"}</dd>
      <dt>Realizado</dt><dd>${formatMetricAmount(row.metric, row.realized)}</dd>
      <dt>% parcial</dt><dd>${row.percent === null ? "-" : pct.format(row.percent)}</dd>
      <dt>Projecao</dt><dd>${row.projectedValue === null ? "-" : formatMetricAmount(row.metric, row.projectedValue)}</dd>
      <dt>% projetado</dt><dd>${row.projectedPercent === null ? "-" : pct.format(row.projectedPercent)}</dd>
      <dt>Falta</dt><dd>${row.gap === null ? "-" : formatMetricAmount(row.metric, row.gap)}</dd>
      <dt>Ritmo/dia</dt><dd>${row.paceNeeded === null ? "-" : formatMetricPace(row.metric, row.paceNeeded)}</dd>
    </dl>
  </article>`).join("");
  const hasInformative = rows.some((row) => !row.participates);
  return `<section class="collab-card collab-official-partial-card">
    <div class="collab-card-head"><div><h3>Detalhes da parcial</h3><p>Tabela completa por blocos com projeção, gap e ritmo necessário.</p></div>${partialVisibilityBadge(partial)}</div>
    ${partialHistoryMessage(partial)}
    <div class="collab-month-grid"><span>Campanha<strong>${escapeHtml(partial.campaignName || activeCampaign()?.name || "-")}</strong></span><span>Parcial<strong>${escapeHtml(partial.name)}</strong></span><span>Data base<strong>${escapeHtml(partial.baseDate || "-")}</strong></span><span>Dias da parcial<strong>${period.daysDone || "-"} de ${period.daysTotal || "-"}</strong></span><span>Importado em<strong>${partial.importedAt ? dateTime.format(new Date(partial.importedAt)) : "-"}</strong></span></div>
    ${hasInformative ? `<p class="metric-info-note">Receita de aparelhos e indicadores informativos nao compoem o atingimento de metas. Apenas o volume de aparelhos entra no calculo.</p>` : ""}
    <div class="table-wrap collab-table-wrap"><table><thead><tr><th>Indicador</th><th>Bloco</th><th>Meta</th><th>Realizado</th><th>% parcial</th><th>Projecao</th><th>% proj.</th><th>Falta</th><th>Ritmo/dia</th><th>Status</th></tr></thead><tbody>${body}</tbody></table></div>
    <div class="collab-indicator-cards collab-detail-cards">${cards}</div>
  </section>`;
}

function collaboratorIndicatorTable(seller) {
  return collaboratorIndicatorTableGrouped(seller);
}

function collaboratorIndicatorTableGrouped(seller) {
  const { rows, totals } = collaboratorMetricRows(seller);
  const locked = isCampaignOperationLocked();
  const disabled = locked ? "disabled" : "";
  const body = metricGroupHeaderRows(rows, 10, (row) => `<tr><td>${escapeHtml(row.metric.name)}</td><td>${formatGoalLabel(row.metric, row.goal, row.participates)}</td><td><input data-collab-realized="${row.metric.id}" type="number" value="${row.realized}" ${disabled}></td><td>${achievementPill(row.currentPercent)}</td><td>${row.participates ? formatMetricAmount(row.metric, row.missing) : "-"}</td><td>${formatMetricAmount(row.metric, row.projectedValue)}</td><td>${achievementPill(row.projectedPercent)}</td><td>${money.format(row.commission)}</td><td>${row.participates ? escapeHtml(row.deflator) : "Informativo"}</td><td><span class="status ${row.status.cls}">${row.status.label}</span></td></tr>`);
  const cards = rows.map((row) => `<article class="collab-indicator-card"><div><strong>${escapeHtml(row.metric.name)}</strong><span class="status ${row.status.cls}">${row.status.label}</span></div><small class="metric-block-label">${escapeHtml(metricGroupDisplay(row.groupMeta))}</small><dl><dt>Meta</dt><dd>${formatGoalLabel(row.metric, row.goal, row.participates)}</dd><dt>Realizado</dt><dd><input data-collab-realized="${row.metric.id}" type="number" value="${row.realized}" ${disabled}></dd><dt>% atual</dt><dd>${formatPercent(row.currentPercent)}</dd><dt>Falta</dt><dd>${row.participates ? formatMetricAmount(row.metric, row.missing) : "-"}</dd><dt>Projetado</dt><dd>${formatMetricAmount(row.metric, row.projectedValue)}</dd><dt>% projetado</dt><dd>${formatPercent(row.projectedPercent)}</dd><dt>Comissao</dt><dd>${money.format(row.commission)}</dd><dt>Deflator</dt><dd>${row.participates ? escapeHtml(row.deflator) : "Informativo"}</dd></dl></article>`).join("");
  const helper = locked ? "Esta campanha está encerrada e não permite novas alterações." : "Use esta área para simular cenários. A simulação não altera o resultado parcial oficial.";
  const note = locked ? `<p class="admin-inline-note warning">Esta campanha está encerrada e não permite novas alterações.</p>` : "";
  const infoNote = `<p class="metric-info-note">Receita de aparelhos e indicadores informativos nao compoem o atingimento de metas. Apenas o volume de aparelhos entra no calculo.</p>`;
  return `<section class="collab-card collab-results-card"><div class="collab-card-head"><h3>Minha simulação</h3><p>${helper}</p></div>${note}${infoNote}<div class="table-wrap collab-table-wrap"><table><thead><tr><th>Indicador</th><th>Meta</th><th>Realizado</th><th>% atual</th><th>Falta</th><th>Projetado</th><th>% projetado</th><th>Comissão</th><th>Deflator</th><th>Status</th></tr></thead><tbody>${body}<tr class="total-row"><td>Total</td><td>${totals.goalCompletion.metCount}/${totals.goalCompletion.applicableCount} metas</td><td>${achievementPill(totals.goalCompletion.metPercent)}</td><td colspan="3">Atingimento do simulador por metas atingidas</td><td>${achievementPill(totals.goalCompletion.projectedAverage)}</td><td>${money.format(collaboratorSummary(seller).final)}</td><td>-</td><td><span class="status ${totals.goalCompletion.status.cls}">${totals.goalCompletion.status.label}</span></td></tr></tbody></table></div><div class="collab-indicator-cards">${cards}</div></section>`;
}

function collaboratorGuidanceMarkup(seller) {
  return `<section class="collab-card collab-guidance-card"><span class="collab-guidance-icon">◎</span><div><h3>Orientação</h3><p>${escapeHtml(collaboratorGuidance(seller))}</p></div></section>`;
}

function collaboratorOpportunityMarkup(seller) {
  const summary = collaboratorSummary(seller);
  const diff = summary.final - summary.result.current;
  return `<section class="collab-card collab-opportunity-card"><div class="collab-card-head"><h3>Como aumentar minha comissão</h3><span>${diff >= 0 ? "+" : ""}${money.format(diff)}</span></div><p>${escapeHtml(collaboratorOpportunity(seller))}</p></section>`;
}

function collaboratorScenarioMarkup(seller) {
  const summary = collaboratorSummary(seller);
  const current = summary.result.current;
  const simulated = summary.final;
  const diff = simulated - current;
  return `<section class="collab-card collab-scenario-card"><div class="collab-card-head"><h3>Simular novo cenário</h3><span>${diff >= 0 ? "+" : ""}${money.format(diff)}</span></div><div class="collab-scenario-grid"><span>Cenário atual<strong>${money.format(current)}</strong></span><span>Cenário simulado<strong>${money.format(simulated)}</strong></span><span>Novo % projetado<strong>${formatPercent(summary.projectedPercent)}</strong></span><span>Deflator previsto<strong>${summary.preview.rate ? `-${pct.format(summary.preview.rate)}` : "Sem deflator"}</strong></span></div><p>Altere os valores em Resultado por indicador para atualizar automaticamente o cenário.</p></section>`;
}

function collaboratorSimulationPeriod() {
  const partial = getVisiblePartial("colaborador");
  const official = partialPeriodInfo(partial);
  const officialTotal = official.daysTotal || campaignPlannedBusinessDays(activeCampaign()) || 1;
  const requestedDaysDone = Number(activeCollaboratorSimulationDaysDone) || official.daysDone || 1;
  const daysDone = Math.max(1, Math.min(officialTotal, requestedDaysDone));
  return {
    month: official.month || activeCampaign()?.reference || state.period.month,
    daysDone,
    daysTotal: officialTotal,
    source: "simulation",
  };
}

function collaboratorSimulationPeriodMarkup() {
  const period = collaboratorSimulationPeriod();
  const official = partialPeriodInfo(getVisiblePartial("colaborador"));
  return `<section class="collab-card collab-simulation-period-card">
    <div class="collab-card-head">
      <div><h3>Dias da simulação</h3><p>Este campo altera apenas a simulação. Os dias oficiais da parcial são definidos pelo Admin na aba Parciais.</p></div>
    </div>
    <div class="collab-month-grid">
      <span>Dias realizados oficiais<strong>${official.daysDone ? num.format(official.daysDone) : "-"}</strong></span>
      <span>Dias uteis da parcial<strong>${official.daysTotal ? num.format(official.daysTotal) : "-"}</strong></span>
      <label>Dias realizados para simulação<input id="collabSimulationDaysDone" type="number" min="1" max="${official.daysTotal || ""}" value="${period.daysDone}"></label>
    </div>
  </section>`;
}

function collaboratorSimulatorMarkup(seller) {
  const partial = getVisiblePartial("colaborador");
  const usePartialButton = partial && partialItemsForSeller(partial, seller).length
    ? `<button class="ghost-button compact-action" type="button" data-use-partial-simulation="${escapeHtml(partial.id)}" ${isCampaignOperationLocked() ? "disabled" : ""}>Usar parcial como base da simulação</button>`
    : "";
  return withProjectionPeriod(collaboratorSimulationPeriod(), () => `<div class="collab-tab-panel">
    <div class="collab-top-grid">${collaboratorKpiMarkup(seller)}${collaboratorGuidanceMarkup(seller)}</div>
    <div class="collab-mid-grid">${collaboratorMonthMarkup()}${collaboratorSimulationPeriodMarkup()}${collaboratorDeflatorMarkup(seller)}${collaboratorEstornosMarkup(seller)}</div>
    <section class="collab-card collab-simulator-intro">
      <div class="collab-card-head">
        <div><h3>Minha simulação</h3><p>Use esta área para simular cenários. A simulação não altera o resultado parcial oficial.</p></div>
        ${usePartialButton}
      </div>
    </section>
    ${collaboratorIndicatorTableGrouped(seller)}
    <div class="collab-bottom-grid">${collaboratorOpportunityMarkup(seller)}${collaboratorScenarioMarkup(seller)}</div>
  </div>`);
}

function collaboratorReportHtml(seller) {
  const summary = collaboratorSummary(seller);
  const rows = collaboratorMetricRows(seller);
  const estornos = sellerEstornos(seller);
  const exportedAt = dateTime.format(new Date());
  const campaign = activeCampaign();
  const reportPeriod = partialPeriodInfo(getVisiblePartial("colaborador"));
  const campaignStatus = campaignShortStatus(campaign?.status);
  const deflatorText = summary.preview.triggered.length ? `Deflator aplicado: -${pct.format(summary.preview.rate)} | Impacto financeiro: ${money.format(summary.result.projectedDeflator)} | Comissão bruta: ${money.format(summary.gross)} | Estornos: ${discountMoney(summary.estornos)} | Comissão estimada: ${money.format(summary.final)}` : "Nenhum deflator aplicado no momento.";
  const experienceText = seller.emExperiencia && summary.preview.triggered.length ? "Vendedor em experiência - deflator previsto ignorado." : "";
  const estornoText = estornos.total ? estornos.items.map((item) => `${item.label}: ${discountMoney(item.value)}`).join(" | ") + ` | Total de estornos: ${discountMoney(estornos.total)}` : "Nenhum estorno aplicado.";
  const tableRows = rows.rows.map((row) => `<tr><td>${escapeHtml(row.metric.name)}</td><td>${escapeHtml(metricGroupDisplay(row.groupMeta))}</td><td>${formatGoalLabel(row.metric, row.goal, row.participates)}</td><td>${formatMetricAmount(row.metric, row.realized)}</td><td>${formatPercent(row.currentPercent)}</td><td>${row.missing === null ? "-" : formatMetricAmount(row.metric, row.missing)}</td><td>${formatMetricAmount(row.metric, row.projectedValue)}</td><td>${formatPercent(row.projectedPercent)}</td><td>${money.format(row.commission)}</td><td>${row.participates ? escapeHtml(row.deflator) : "Informativo"}</td><td>${row.status.label}</td></tr>`).join("");
  return `<div class="report-page print-report">
    <header class="print-header">
      <div>
        <h1>Comiss&atilde;o 360</h1>
        <p>Simulador e painel de gest&atilde;o de comiss&otilde;es, metas e performance comercial.</p>
      </div>
      <div class="report-title">
        <strong>Relat&oacute;rio do vendedor</strong>
        <span>Gerado em: ${escapeHtml(exportedAt)}</span>
      </div>
    </header>
    <section class="report-meta">
      <span>Vendedor<strong>${escapeHtml(seller.name)}</strong></span>
      <span>Filial<strong>${escapeHtml(seller.branch)}</strong></span>
      <span>Fun&ccedil;&atilde;o / &Aacute;rea<strong>${escapeHtml(seller.area)}</strong></span>
      <span>Campanha / M&ecirc;s<strong>${escapeHtml(campaign?.reference || state.period.month)}</strong></span>
      <span>Dias realizados<strong>${reportPeriod.daysDone ? num.format(reportPeriod.daysDone) : "-"}</strong></span>
      <span>Dias &uacute;teis<strong>${reportPeriod.daysTotal ? num.format(reportPeriod.daysTotal) : "-"}</strong></span>
      <span>Status campanha<strong>${escapeHtml(campaignStatus)}</strong></span>
    </section>
    <section class="report-summary">
      <span>Comiss&atilde;o estimada<strong>${money.format(summary.final)}</strong></span>
      <span>Comiss&atilde;o bruta<strong>${money.format(summary.gross)}</strong></span>
      <span>Deflatores<strong>${money.format(summary.result.projectedDeflator)}</strong></span>
      <span>Estornos<strong>${discountMoney(summary.estornos)}</strong></span>
      <span>Comiss&atilde;o estimada<strong>${money.format(summary.final)}</strong></span>
      <span>Status performance<strong>${escapeHtml(summary.status.label)}</strong></span>
      <span>Atingimento atual<strong>${formatPercent(summary.currentPercent)}</strong></span>
      <span>Atingimento projetado<strong>${formatPercent(summary.projectedPercent)}</strong></span>
    </section>
    <table class="print-table">
      <thead><tr><th>Indicador</th><th>Bloco</th><th>Meta</th><th>Realizado</th><th>% atual</th><th>Falta</th><th>Projetado</th><th>% projetado</th><th>Comiss&atilde;o</th><th>Deflator</th><th>Status</th></tr></thead>
      <tbody>${tableRows}<tr class="total-row"><td>Total</td><td>-</td><td>${rows.totals.goalCompletion.metCount}/${rows.totals.goalCompletion.applicableCount} metas</td><td>${formatMetricAmount(null, rows.totals.realized)}</td><td>${formatPercent(rows.totals.currentPercent)}</td><td>${formatMetricAmount(null, rows.totals.missing)}</td><td>${formatMetricAmount(null, rows.totals.projected)}</td><td>${formatPercent(rows.totals.projectedPercent)}</td><td>${money.format(summary.final)}</td><td>-</td><td>${escapeHtml(rows.totals.status.label)}</td></tr></tbody>
    </table>
    <section class="print-notes">
      <div class="report-block"><h2>Deflatores</h2><p>${escapeHtml(experienceText || deflatorText)}</p></div>
      <div class="report-block"><h2>Estornos</h2><p>${escapeHtml(estornoText)}</p></div>
      <div class="report-block"><h2>Orienta&ccedil;&atilde;o</h2><p>${escapeHtml(collaboratorGuidance(seller))}</p></div>
    </section>
    <footer class="print-footer">Desenvolvido por Cleiton Gerber | Comiss&atilde;o 360</footer>
  </div>`;
}

function collaboratorOfficialExtractReportHtml(seller) {
  const data = officialExtractForSeller(seller);
  if (!data) return "";
  const { closing, snapshot, row } = data;
  const rows = closingIndicatorRowsForSeller(row);
  const completion = goalCompletionStats(rows);
  const closedAt = row.closedAt || snapshot.closedAt || closing.closedAt;
  const publishedAt = closing.publishedAt || snapshot.publishedAt;
  const tableRows = rows.map((item) => `<tr>
    <td>${escapeHtml(item.metric.name)}</td>
    <td>${escapeHtml(metricGroupDisplay(item.groupMeta))}</td>
    <td>${formatGoalLabel(item.metric, item.goal, item.participates)}</td>
    <td>${formatMetricAmount(item.metric, item.realized)}</td>
    <td>${formatPercent(item.currentPercent)}</td>
    <td>${item.missing === null ? "-" : formatMetricAmount(item.metric, item.missing)}</td>
    <td>${money.format(finiteNumber(item.commission))}</td>
    <td>${escapeHtml(closingIndicatorDeflatorLabel(item))}</td>
    <td>${escapeHtml(item.status || item.statusObj.label)}</td>
  </tr>`).join("");
  const deflatorValue = finiteNumber(row.deflatorImpact ?? row.deflator);
  const deflatorText = row.emExperiencia && finiteNumber(row.deflator)
    ? "Vendedor em experiencia - deflator ignorado."
    : deflatorValue
      ? `${row.deflatorReason || "Deflator aplicado"} | Impacto: ${money.format(deflatorValue)}`
      : "Nenhum deflator aplicado.";
  return `<div class="report-page print-report">
    <header class="print-header">
      <div>
        <h1>Comiss&atilde;o 360</h1>
        <p>Extrato oficial do vendedor.</p>
      </div>
      <div class="report-title">
        <strong>Extrato oficial</strong>
        <span>Gerado em: ${escapeHtml(dateTime.format(new Date()))}</span>
      </div>
    </header>
    <section class="report-meta">
      <span>Campanha<strong>${escapeHtml(snapshot.campaignName || "-")}</strong></span>
      <span>Refer&ecirc;ncia<strong>${escapeHtml(snapshot.reference || "-")}</strong></span>
      <span>Periodo base<strong>${snapshot.daysDone || snapshot.basePartialDaysDone || "-"} de ${snapshot.daysTotal || snapshot.basePartialDaysTotal || "-"} dias</strong></span>
      <span>Fechado em<strong>${closedAt ? dateTime.format(new Date(closedAt)) : "-"}</strong></span>
      <span>Publicado em<strong>${publishedAt ? dateTime.format(new Date(publishedAt)) : "-"}</strong></span>
      <span>Vendedor<strong>${escapeHtml(row.name || seller.name)}</strong></span>
      <span>Filial<strong>${escapeHtml(row.branch || seller.branch)}</strong></span>
      <span>Status<strong>${escapeHtml(closing.status)}</strong></span>
    </section>
    <section class="report-summary">
      <span>Comiss&atilde;o bruta<strong>${money.format(finiteNumber(row.commissionGross))}</strong></span>
      <span>Deflatores<strong>${money.format(deflatorValue)}</strong></span>
      <span>Estornos<strong>${discountMoney(row.estornosTotal)}</strong></span>
      <span>Comiss&atilde;o final<strong>${money.format(finiteNumber(row.commissionFinal))}</strong></span>
      <span>Metas atingidas<strong>${completion.metCount}/${completion.applicableCount}</strong></span>
      <span>% metas<strong>${formatPercent(completion.metPercent)}</strong></span>
      <span>Status vendedor<strong>${escapeHtml(row.status || "-")}</strong></span>
      <span>Base<strong>${escapeHtml(snapshot.basePartialName || closing.basePartialName || "-")}</strong></span>
    </section>
    <table class="print-table">
      <thead><tr><th>Indicador</th><th>Bloco</th><th>Meta</th><th>Realizado final</th><th>% atingimento</th><th>Falta</th><th>Comiss&atilde;o</th><th>Deflator</th><th>Status</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <section class="print-notes">
      <div class="report-block"><h2>Deflatores</h2><p>${escapeHtml(deflatorText)}</p></div>
      <div class="report-block"><h2>Estornos</h2><p>Qualidade: ${discountMoney(row.estornoQuality)} | Seguro: ${discountMoney(row.estornoInsurance)} | Carrossel: ${discountMoney(row.estornoCarousel)} | Total: ${discountMoney(row.estornosTotal)}</p></div>
      <div class="report-block"><h2>Observa&ccedil;&atilde;o</h2><p>Extrato baseado no snapshot congelado do fechamento oficial. Este documento e somente leitura.</p></div>
    </section>
    <footer class="print-footer">Desenvolvido por Cleiton Gerber | Comiss&atilde;o 360</footer>
  </div>`;
}

function collaboratorPrintDocumentHtml(reportHtml) {
  return `<!doctype html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Relat&oacute;rio do vendedor - Comiss&atilde;o 360</title>
      <style>
        @page { size: A4 landscape; margin: 10mm; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        html, body { margin: 0; background: #fff; color: #111; font-family: Arial, Helvetica, sans-serif; }
        body { padding: 0; }
        .report-page { display: grid; gap: 7px; width: 100%; max-width: none; margin: 0; }
        .print-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 6px; border-bottom: 2px solid #c80013; break-inside: avoid; page-break-inside: avoid; }
        .print-header h1, .print-header p { margin: 0; }
        .print-header h1 { color: #c80013; font-size: 19px; line-height: 1.1; }
        .print-header p { margin-top: 2px; color: #444; font-size: 9px; }
        .report-title { display: grid; gap: 2px; text-align: right; }
        .report-title strong { font-size: 13px; }
        .report-title span { color: #555; font-size: 8px; }
        .report-meta, .report-summary { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; break-inside: avoid; page-break-inside: avoid; }
        .report-summary { grid-template-columns: repeat(8, minmax(0, 1fr)); }
        .report-meta span, .report-summary span, .report-block { display: grid; gap: 2px; padding: 5px; border: 1px solid #e5e7eb; border-radius: 3px; background: #fff6f7; color: #555; font-size: 7px; font-weight: 700; text-transform: uppercase; }
        .report-meta strong, .report-summary strong { color: #111; font-size: 9px; line-height: 1.15; text-transform: none; overflow-wrap: anywhere; }
        .print-table { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 7.8px; }
        .print-table thead { display: table-header-group; }
        .print-table tfoot { display: table-footer-group; }
        .print-table tr { break-inside: avoid; page-break-inside: avoid; }
        .print-table th, .print-table td { padding: 4px; border: 1px solid #ddd; text-align: left; vertical-align: top; white-space: normal; overflow-wrap: anywhere; }
        .print-table th { background: #c80013; color: #fff; font-weight: 800; }
        .print-table th:nth-child(1), .print-table td:nth-child(1) { width: 18%; }
        .print-table th:nth-child(8), .print-table td:nth-child(8) { width: 10%; }
        .print-table th:nth-child(9), .print-table td:nth-child(9) { width: 10%; }
        .print-table th:nth-child(10), .print-table td:nth-child(10) { width: 10%; }
        .total-row td { background: #fff1f3; color: #c80013; font-weight: 900; }
        .print-notes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; break-inside: avoid; page-break-inside: avoid; }
        .report-block { min-height: 44px; text-transform: none; }
        .report-block h2, .report-block p { margin: 0; }
        .report-block h2 { color: #c80013; font-size: 9px; }
        .report-block p { color: #222; font-size: 8px; line-height: 1.25; }
        .print-footer { padding-top: 4px; border-top: 1px solid #e5e7eb; color: #666; text-align: right; font-size: 7px; break-inside: avoid; page-break-inside: avoid; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>${reportHtml}</body>
  </html>`;
}

function prepareCollaboratorPdfExport() {
  const seller = selectedCollabSeller();
  if (!seller || activeCollaboratorId !== seller.id) {
    alert("Entre com a senha do vendedor antes de exportar.");
    return;
  }
  const reportHtml = activeCollaboratorTab === "extrato" ? collaboratorOfficialExtractReportHtml(seller) : collaboratorReportHtml(seller);
  if (!reportHtml) {
    alert("Extrato oficial ainda nao disponivel para esta campanha.");
    return;
  }
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    try {
      printWindow.opener = null;
    } catch (error) {
      console.warn("Nao foi possivel isolar a janela de impressao", error);
    }
    printWindow.document.open();
    printWindow.document.write(collaboratorPrintDocumentHtml(reportHtml));
    printWindow.document.close();
    printWindow.focus();
    printWindow.onafterprint = () => printWindow.close();
    window.setTimeout(() => {
      printWindow.print();
    }, 350);
    return;
  }
  const report = document.getElementById("collabPrintReport");
  if (report) report.innerHTML = reportHtml;
  document.body.classList.add("print-collaborator");
  window.setTimeout(() => window.print(), 150);
}

function renderCollaborator() {
  renderSelectors();
  const seller = selectedCollabSeller();
  const dashboard = document.getElementById("collabDashboard");
  const accessCard = document.getElementById("collabAccessCard");
  const authenticatedSeller = resolveAuthenticatedCollaborator();
  const isAuthenticated = Boolean(seller && authenticatedSeller?.id === seller.id);
  if (!seller || !dashboard) return;
  accessCard?.classList.toggle("is-authenticated", isAuthenticated);
  if (!isAuthenticated) {
    document.getElementById("collabHero").innerHTML = collaboratorLoginMarkup(seller);
    dashboard.innerHTML = `<section class="collab-empty-state">Selecione um vendedor e informe a senha para visualizar seu desempenho.</section>`;
    return;
  }
  ensureSellerValues(seller);
  document.getElementById("collabHero").innerHTML = `<div class="collab-login-identity"><span>Vendedor</span><strong>${escapeHtml(seller.name)}</strong><small>${escapeHtml(seller.branch)} - ${escapeHtml(seller.area)}</small></div><button id="collabLogout" class="ghost-button compact-action" type="button">Trocar</button>`;
  if (!["resumo", "detalhes", "simulador", "extrato"].includes(activeCollaboratorTab)) activeCollaboratorTab = "resumo";
  let activeTabContent = "";
  try {
    if (activeCollaboratorTab === "detalhes") {
      activeTabContent = `<div class="collab-tab-panel">${collaboratorOfficialPartialMarkup(seller)}</div>`;
    } else if (activeCollaboratorTab === "simulador") {
      activeTabContent = collaboratorSimulatorMarkup(seller);
    } else if (activeCollaboratorTab === "extrato") {
      activeTabContent = `<div class="collab-tab-panel">${collaboratorOfficialExtractMarkup(seller)}</div>`;
    } else {
      activeTabContent = `<div class="collab-tab-panel">${collaboratorOfficialSummaryMarkup(seller)}${collaboratorGraphicPanel(seller)}${collaboratorMonthMarkup()}</div>`;
    }
  } catch (error) {
    console.error("Erro ao montar painel do vendedor", error);
    activeTabContent = `<section class="collab-empty-state">Nao foi possivel carregar o painel deste vendedor. Tente atualizar a tela ou trocar o vendedor.</section>`;
  }
  dashboard.innerHTML = `
    ${collaboratorPartialSelectorMarkup(seller)}
    ${collaboratorTabsMarkup()}
    ${activeTabContent}
  `;
}

function updateActionVisibility() {
  const isAdminView = document.getElementById("adminView").classList.contains("active");
  const isDashboardView = document.getElementById("dashboardView").classList.contains("active");
  const canUseAdminActions = isAdminUnlocked() && (isAdminView || isDashboardView);
  document.querySelectorAll(".admin-action").forEach((item) => {
    item.hidden = !canUseAdminActions;
  });
  const topAccess = document.getElementById("branchTopAccess");
  if (topAccess) topAccess.hidden = !(document.body.dataset.view === "gerente" && activeBranchSession);
  const hasSession = isOwnerUnlocked() || sessionStorage.getItem(ADMIN_SESSION_KEY) === "ok" || sessionStorage.getItem(DASHBOARD_SESSION_KEY) === "ok" || activeBranchSession || activeCollaboratorId;
  const logout = document.getElementById("globalLogout");
  if (logout) logout.hidden = !hasSession || document.body.dataset.view === "home";
}

function renderBrand() {
  const partner = (state.settings?.partnerName || "").trim();
  const display = document.getElementById("partnerNameDisplay");
  const partnerInput = document.getElementById("partnerName");
  if (display) {
    display.textContent = partner;
    display.hidden = !partner;
  }
  if (partnerInput && document.activeElement !== partnerInput) partnerInput.value = partner;
}

function safeRender(label, action) {
  try {
    action();
  } catch (error) {
    console.error(`Erro ao renderizar ${label}`, error);
  }
}
function renderAll() {
  renderBrand();
  renderCampaignSelectors();
  const campaign = activeCampaign();
  const latestPartial = latestPublishedPartial(campaign);
  const topPeriod = latestPartial ? getPeriodForPartial(latestPartial, campaign) : null;
  const periodMonthDisplay = document.getElementById("periodMonthDisplay");
  const daysTotalDisplay = document.getElementById("daysTotalDisplay");
  const daysDoneLegacyRemoved = document.getElementById("daysDoneLegacyRemoved");
  if (periodMonthDisplay) periodMonthDisplay.textContent = campaign?.reference || state.period.month;
  if (daysTotalDisplay) daysTotalDisplay.textContent = latestPartial ? `${topPeriod.daysDone || "-"} de ${topPeriod.daysTotal || "-"} dias` : `${campaignPlannedBusinessDays(campaign)} dias planej.`;
  if (daysDoneLegacyRemoved) daysDoneLegacyRemoved.textContent = latestPartial ? latestPartial.name : "Sem parcial";
  safeRender("dashboard", renderDashboard);
  safeRender("filial", renderManager);
  safeRender("admin", renderAdmin);
  safeRender("colaborador", renderCollaborator);
  safeRender("acoes", updateActionVisibility);
}

function updateSeller(id, field, value) {
  if (!requireAdminAction(field === "password" ? "updatePassword" : "updateSeller", field === "password" ? "Seguranca" : "Vendedores")) return false;
  const seller = state.sellers.find((item) => item.id === id);
  if (!seller) return false;
  if (field === "area" && seller.area !== value) {
    seller.area = value;
    seller.values = {};
    ensureSellerValues(seller);
    saveState();
    renderAll();
    return true;
  }
  seller[field] = value;
  saveState();
  renderDashboard();
  renderSelectors();
  return false;
}

function setMetricValue(seller, metricId, field, value) {
  ensureSellerValues(seller);
  seller.values[metricId][field] = Number(value) || 0;
  saveState();
}

function showAccessLogin(view = "dashboard") {
  pendingAccessView = view;
  document.getElementById("accessLock").classList.add("active");
  document.getElementById("accessPassword").value = "";
  document.getElementById("accessLoginError").textContent = "";
  document.getElementById("accessPassword").focus();
}

function closeAccessLogin() {
  document.getElementById("accessLock").classList.remove("active");
}

async function verifyOwnerAccess(password) {
  try {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data?.role === "owner";
  } catch {
    return false;
  }
}

async function handleAccessLogin() {
  const typed = document.getElementById("accessPassword").value;
  const error = document.getElementById("accessLoginError");
  error.textContent = "";

  if (pendingAccessView === "dashboard" && typed === dashboardPassword()) {
    logAccess({
      status: "Sucesso",
      profile: "Dashboard",
      module: "Dashboard",
      action: "Login realizado",
      message: "Dashboard acessou a visualizacao executiva.",
    }, { persist: true });
    sessionStorage.setItem(DASHBOARD_SESSION_KEY, "ok");
    closeAccessLogin();
    renderAll();
    openView("dashboard");
    return;
  }

  if (typed === adminPassword()) {
    logAccess({
      status: "Sucesso",
      profile: "Admin",
      module: pendingAccessView === "dashboard" ? "Dashboard" : "Admin",
      action: "Login realizado",
      message: pendingAccessView === "dashboard" ? "Admin acessou o Dashboard." : "Admin acessou as configuracoes administrativas.",
    }, { persist: true });
    sessionStorage.setItem(ADMIN_SESSION_KEY, "ok");
    closeAccessLogin();
    renderAll();
    openView(pendingAccessView === "dashboard" ? "dashboard" : "admin");
    return;
  }

  if (await verifyOwnerAccess(typed)) {
    logAccess({
      status: "Sucesso",
      profile: "Desenvolvedor/Proprietario",
      module: pendingAccessView === "dashboard" ? "Dashboard" : "Admin",
      action: "Login realizado",
      message: "Desenvolvedor/Proprietario acessou o sistema.",
    }, { persist: true });
    sessionStorage.setItem(OWNER_SESSION_KEY, "ok");
    sessionStorage.setItem(ADMIN_SESSION_KEY, "ok");
    sessionStorage.setItem(DASHBOARD_SESSION_KEY, "ok");
    closeAccessLogin();
    renderAll();
    openView(pendingAccessView === "dashboard" ? "dashboard" : "admin");
    return;
  }

  logAccess({
    status: "Falha",
    profile: pendingAccessView === "dashboard" ? "Dashboard" : "Admin",
    module: pendingAccessView === "dashboard" ? "Dashboard" : "Admin",
    action: "Tentativa de login invalida",
    message: `Tentativa invalida de acesso ao modulo ${auditModuleName(pendingAccessView)}.`,
  }, { persist: true });
  error.textContent = "Senha incorreta";
}

function openRouteView(options = {}) {
  const view = viewByRoute[window.location.pathname] || "home";
  openView(view, options);
}

function openView(view, options = {}) {
  if (!document.getElementById(`${view}View`)) view = "home";
  if (view === "admin" && !isAdminUnlocked()) {
    if (!["Sistema", "Admin"].includes(currentAuditProfile())) {
      logBlockedAttempt("Acesso bloqueado ao modulo Admin", "Admin", "Perfil sem permissao tentou acessar o modulo Admin.");
    }
    showAccessLogin("admin");
    return;
  }
  if (view === "dashboard" && !isDashboardUnlocked()) {
    showAccessLogin("dashboard");
    return;
  }
  document.querySelectorAll(".nav-button").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  document.querySelectorAll(".view").forEach((panel) => panel.classList.remove("active"));
  document.getElementById(`${view}View`).classList.add("active");
  document.getElementById("viewTitle").textContent = document.querySelector(`.nav-button[data-view="${view}"]`)?.textContent || "Home";
  document.body.dataset.view = view;
  if (!options.skipHistory && routeByView[view] && window.location.pathname !== routeByView[view]) {
    history.pushState({ view }, "", routeByView[view]);
  }
  updateActionVisibility();
  const profile = currentAuditProfile();
  const canLogAccess = view !== "home" && profile !== "Sistema" && (
    (view === "admin" && isAdminUnlocked())
    || (view === "dashboard" && isDashboardUnlocked())
    || (view === "gerente" && activeBranchSession)
    || (view === "colaborador" && activeCollaboratorId)
  );
  const accessKey = `${view}:${profile}:${activeCollaboratorId}:${activeBranchSession}:${state.activeCampaignId}`;
  if (canLogAccess && accessKey !== lastAccessLogKey) {
    lastAccessLogKey = accessKey;
    logAccess({
      status: "Sucesso",
      profile,
      module: auditModuleName(view),
      action: "Acesso ao modulo",
      message: `${profile} acessou o modulo ${auditModuleName(view)}.`,
    }, { persist: true });
  }
}

document.addEventListener("click", async (event) => {
  const graphBlockButton = event.target.closest("[data-partial-graphic-block]");
  if (graphBlockButton) {
    const block = graphBlockButton.dataset.graphicBlock || "Todos";
    if (graphBlockButton.dataset.partialGraphicBlock === "filial") {
      activeManagerGraphicBlock = block;
      renderManager();
    } else if (graphBlockButton.dataset.partialGraphicBlock === "colaborador") {
      activeCollaboratorGraphicBlock = block;
      renderCollaborator();
    }
    return;
  }
  const nav = event.target.closest(".nav-button");
  if (nav && nav.dataset.view) openView(nav.dataset.view);

  const adminTab = event.target.closest("[data-admin-tab]");
  if (adminTab) {
    activeAdminTab = adminTab.dataset.adminTab;
    updateAdminTabs();
    return;
  }

  const adminTabJump = event.target.closest("[data-admin-tab-jump]");
  if (adminTabJump) {
    activeAdminTab = adminTabJump.dataset.adminTabJump;
    updateAdminTabs();
    return;
  }

  const auditDetailButton = event.target.closest("[data-audit-log-detail]");
  if (auditDetailButton) {
    activeAuditLogId = auditDetailButton.dataset.auditLogDetail;
    renderAuditLogs();
    return;
  }

  if (event.target.id === "exportAuditLogs") {
    exportAuditLogsCsv();
    return;
  }

  const protectedAdminClick = event.target.closest([
    "#createCampaign",
    "#duplicateActiveCampaign",
    "[data-duplicate-campaign]",
    "[data-delete-campaign]",
    "[data-select-campaign]",
    "[data-download-campaign]",
    "[data-download-preview-campaign]",
    "#downloadOfficialCampaignFile",
    "#downloadPreviewCampaignFile",
    "#startClosingFromLatestPartial",
    "#importFinalClosingFile",
    "#operationalCloseCampaign",
    "[data-operational-close-campaign]",
    "#reopenOperationalCampaign",
    "[data-reopen-campaign]",
    "#startAdministrativeClosing",
    "#officialCloseCampaign",
    "#publishOfficialExtracts",
    "#savePeriodAdmin",
    "#addBranch",
    "[data-delete-branch]",
    "#downloadGoalTemplate",
    "#importGoalSheet",
    "#goalSheetDropzone",
    "#selectPartialCsv",
    "#partialCsvDropzone",
    "#savePartialDraft",
    "#publishPendingPartial",
    "[data-publish-partial]",
    "[data-cancel-partial]",
    "[data-replace-partial]",
    "[data-delete-draft-partial]",
    "#adminImportBackup",
    "#adminExportBackup",
    "#adminRestoreDefault",
    "[data-move-metric-order]",
    "[data-add-custom-metric]",
    "[data-duplicate-metric]",
    "[data-toggle-metric-active]",
    "[data-remove-metric]",
    "[data-delete-custom-metric]",
    "[data-add-deflator]",
    "[data-delete-deflator]",
    "#addSeller",
    "[data-delete-seller]",
    "#saveNow",
  ].join(","));
  if (protectedAdminClick && !requireAdminAction("adminMutation", "Admin", { auditAction: "Tentativa de acao administrativa bloqueada" })) return;

  if (event.target.id === "createCampaign") {
    createCampaignFromActive();
    return;
  }

  if (event.target.id === "duplicateActiveCampaign") {
    duplicateCampaign(state.activeCampaignId);
    return;
  }

  const duplicateCampaignButton = event.target.closest("[data-duplicate-campaign]");
  if (duplicateCampaignButton) {
    duplicateCampaign(duplicateCampaignButton.dataset.duplicateCampaign);
    return;
  }

  const deleteCampaignButton = event.target.closest("[data-delete-campaign]");
  if (deleteCampaignButton) {
    deleteCampaign(deleteCampaignButton.dataset.deleteCampaign);
    return;
  }

  const selectCampaignButton = event.target.closest("[data-select-campaign]");
  if (selectCampaignButton) {
    if (!criticalConfirm("Voce esta alterando a campanha ativa do sistema. As telas passarao a consultar os dados desta campanha. Deseja continuar?")) return;
    setActiveCampaign(selectCampaignButton.dataset.selectCampaign);
    return;
  }

  const downloadCampaignButton = event.target.closest("[data-download-campaign]");
  if (downloadCampaignButton) {
    downloadCampaignOfficialFile(state.campaigns.find((campaign) => campaign.id === downloadCampaignButton.dataset.downloadCampaign));
    return;
  }

  const downloadPreviewCampaignButton = event.target.closest("[data-download-preview-campaign]");
  if (downloadPreviewCampaignButton) {
    downloadCampaignPreviewFile(state.campaigns.find((campaign) => campaign.id === downloadPreviewCampaignButton.dataset.downloadPreviewCampaign));
    return;
  }

  if (event.target.id === "downloadOfficialCampaignFile") {
    downloadCampaignOfficialFile();
    return;
  }

  if (event.target.id === "downloadPreviewCampaignFile") {
    downloadCampaignPreviewFile();
    return;
  }

  if (event.target.id === "startClosingFromLatestPartial") {
    startClosingFromLatestPartial();
    return;
  }

  if (event.target.id === "importFinalClosingFile") {
    alert("A importacao final de fechamento esta preparada para uma evolucao futura. Nesta etapa, use a ultima parcial publicada como base.");
    return;
  }

  if (event.target.id === "operationalCloseCampaign") {
    operationalCloseCampaign(activeCampaign(), "Fechamento");
    return;
  }

  const operationalCloseCampaignButton = event.target.closest("[data-operational-close-campaign]");
  if (operationalCloseCampaignButton) {
    const campaign = state.campaigns.find((item) => item.id === operationalCloseCampaignButton.dataset.operationalCloseCampaign);
    operationalCloseCampaign(campaign, "Campanhas");
    return;
  }

  if (event.target.id === "reopenOperationalCampaign") {
    reopenOperationalCampaign(activeCampaign(), "Fechamento");
    return;
  }

  const reopenCampaignButton = event.target.closest("[data-reopen-campaign]");
  if (reopenCampaignButton) {
    const campaign = state.campaigns.find((item) => item.id === reopenCampaignButton.dataset.reopenCampaign);
    reopenOperationalCampaign(campaign, "Campanhas");
    return;
  }

  if (event.target.id === "startAdministrativeClosing") {
    const campaign = activeCampaign();
    if (!campaign || campaign.status !== CAMPAIGN_STATUS.OPERATIONAL_CLOSED) return;
    campaign.status = CAMPAIGN_STATUS.ADMIN_CLOSING;
    logUpdate({
      action: "Iniciou fechamento administrativo",
      module: "Fechamento",
      campaignId: campaign.id,
      campaignName: campaign.name,
      itemName: campaign.name,
      newValue: campaign.status,
      message: `Fechamento administrativo iniciado para a campanha ${campaign.name}.`,
    });
    saveState("Fechamento administrativo iniciado");
    renderAll();
    return;
  }

  if (event.target.id === "officialCloseCampaign") {
    officialCloseActiveCampaign();
    return;
  }

  if (event.target.id === "publishOfficialExtracts") {
    publishOfficialExtracts();
    return;
  }

  const closingSellerDetailButton = event.target.closest("[data-closing-seller-detail]");
  if (closingSellerDetailButton) {
    const sellerId = closingSellerDetailButton.dataset.closingSellerDetail;
    activeClosingSellerDetailId = activeClosingSellerDetailId === sellerId ? "" : sellerId;
    renderAdminClosingPanel();
    return;
  }

  const protectedMutation = event.target.closest("#savePeriodAdmin,#addBranch,[data-delete-branch],[data-add-custom-metric],[data-delete-custom-metric],[data-duplicate-metric],[data-toggle-metric-active],[data-remove-metric],[data-add-deflator],[data-delete-deflator],#addSeller,[data-delete-seller],#importGoalSheet,#goalSheetDropzone,#adminImportBackup,#adminRestoreDefault");
  if (protectedMutation && !canEditCampaignData()) {
    logBlockedAttempt("Alteracao bloqueada em campanha fechada", "Admin", "Tentativa de alterar dados oficiais em campanha fechada oficialmente.");
    alert("Esta campanha esta fechada oficialmente e nao permite alteracoes.");
    return;
  }

  const goalSheetDropzone = event.target.closest("#goalSheetDropzone");
  if (goalSheetDropzone) {
    document.getElementById("goalSheetFile")?.click();
  }

  if (event.target.id === "savePeriodAdmin") {
    commitOfficialPeriodChange(null, { action: "Salvou dias uteis planejados da campanha" });
    return;
    if (Number(state.period.daysTotal) <= 0) {
      alert("Dias úteis deve ser maior que zero.");
      return;
    }
    if (false) {
      alert("Dias realizados não pode ser maior que dias úteis.");
      return;
    }
    flushSaveState("Periodo salvo");
    renderAdminPeriodMessage();
    return;
  }

  const area = event.target.closest(".area-filter");
  if (area) {
    activeAreaFilter = area.dataset.area;
    document.querySelectorAll(".area-filter").forEach((button) => button.classList.remove("active"));
    area.classList.add("active");
    renderDashboard();
  }

  if (event.target.id === "exportDashboardXls") {
    exportDashboardExcel();
  }

  if (event.target.id === "exportCriticalGoalsXls") {
    exportCriticalGoalsExcel();
  }

  if (event.target.id === "clearDashboardFilters") {
    activeBranchFilter = "Todas";
    activeAreaFilter = "Todas";
    activeDashboardIndicator = "Todos";
    activeDashboardStatus = "Todos";
    activeDashboardDeflator = "Todos";
    activeDashboardPartialId = "latest";
    activeDashboardCompareBaseId = "";
    activeDashboardCompareTargetId = "";
    activeDashboardCompareBlock = "Todos";
    activeDashboardSellerDetailId = "";
    activeDashboardBranchDetail = "";
    document.querySelectorAll(".area-filter").forEach((button) => button.classList.toggle("active", button.dataset.area === "Todas"));
    renderDashboard();
    return;
  }

  if (event.target.id === "downloadGoalTemplate") {
    downloadGoalTemplateCsv();
  }

  if (event.target.id === "importGoalSheet") {
    document.getElementById("goalSheetFile").click();
  }

  if (event.target.id === "selectPartialCsv" || event.target.closest("#partialCsvDropzone")) {
    document.getElementById("partialCsvFile")?.click();
    return;
  }

  const partialPreviewFilterButton = event.target.closest("[data-partial-preview-filter]");
  if (partialPreviewFilterButton) {
    partialPreviewFilter = partialPreviewFilterButton.dataset.partialPreviewFilter;
    renderAdminPartialsPanel();
    return;
  }

  if (event.target.id === "cancelPartialPreview") {
    pendingPartialImport = null;
    partialPreviewFilter = "Todos";
    renderAdminPartialsPanel();
    return;
  }

  if (event.target.id === "savePartialDraft") {
    savePendingPartial(PARTIAL_STATUS.DRAFT);
    return;
  }

  if (event.target.id === "publishPendingPartial") {
    if (!criticalConfirm("Voce esta publicando esta parcial para consulta dos vendedores, filiais e dashboard. A simulacao dos vendedores continuara separada e nao sera alterada. Deseja continuar?")) return;
    savePendingPartial(PARTIAL_STATUS.PUBLISHED);
    return;
  }

  const viewPartialButton = event.target.closest("[data-view-partial]");
  if (viewPartialButton) {
    const partial = partialById(viewPartialButton.dataset.viewPartial);
    if (!partial) return;
    pendingPartialImport = { ...partial, _readOnly: true };
    partialPreviewFilter = "Todos";
    renderAdminPartialsPanel();
    return;
  }

  const publishPartialButton = event.target.closest("[data-publish-partial]");
  if (publishPartialButton) {
    publishPartial(publishPartialButton.dataset.publishPartial);
    return;
  }

  const cancelPartialButton = event.target.closest("[data-cancel-partial]");
  if (cancelPartialButton) {
    updatePartialStatus(cancelPartialButton.dataset.cancelPartial, PARTIAL_STATUS.CANCELED);
    return;
  }

  const replacePartialButton = event.target.closest("[data-replace-partial]");
  if (replacePartialButton) {
    updatePartialStatus(replacePartialButton.dataset.replacePartial, PARTIAL_STATUS.REPLACED);
    return;
  }

  const deleteDraftPartialButton = event.target.closest("[data-delete-draft-partial]");
  if (deleteDraftPartialButton) {
    deleteDraftPartial(deleteDraftPartialButton.dataset.deleteDraftPartial);
    return;
  }

  if (event.target.id === "adminImportBackup") {
    if (!criticalConfirm("Voce esta importando um backup. Esta acao pode substituir dados existentes do sistema.", { backup: true })) return;
    document.getElementById("importDataFile")?.click();
  }

  if (event.target.id === "adminExportBackup") {
    exportBackupJson();
    return;
  }

  if (event.target.id === "adminRestoreDefault") {
    restoreDefaultState();
    return;
  }

  if (event.target.id === "addBranch") {
    let base = "NOVA FILIAL";
    let name = base;
    let count = 2;
    while (branches().includes(name)) name = `${base} ${count++}`;
    state.branches.push(name);
    state.branchPasswords = state.branchPasswords || {};
    state.branchPasswords[name] = "1234";
    logUpdate({
      action: "Criou filial",
      module: "Filiais",
      itemName: name,
      newValue: name,
      message: `Filial ${name} criada.`,
    });
    saveState("Filial adicionada");
    renderAll();
  }

  const deleteBranchButton = event.target.closest("[data-delete-branch]");
  if (deleteBranchButton) {
    const branch = deleteBranchButton.dataset.deleteBranch;
    const inUse = state.sellers.some((seller) => seller.branch === branch);
    if (inUse) {
      alert("Esta filial esta vinculada a vendedor. Altere o cadastro antes de excluir.");
      return;
    }
    if (!criticalConfirm(`Excluir a filial ${branch}?`, { backup: true, irreversible: true })) return;
    state.branches = state.branches.filter((item) => item !== branch);
    if (state.branchPasswords) delete state.branchPasswords[branch];
    logUpdate({
      action: "Excluiu filial",
      module: "Filiais",
      itemName: branch,
      previousValue: branch,
      message: `Filial ${branch} excluida.`,
    });
    saveState("Filial excluida");
    renderAll();
  }
  if (event.target.id === "saveNow") {
    logUpdate({ action: "Salvou manualmente", module: "Admin", message: "Admin executou salvamento manual." });
    flushSaveState("Salvo manualmente");
  }

  const moveMetricButton = event.target.closest("[data-move-metric-order]");
  if (moveMetricButton) {
    moveMetricOrder(moveMetricButton.dataset.metricOrderArea, moveMetricButton.dataset.metricOrderId, Number(moveMetricButton.dataset.moveMetricOrder));
    return;
  }

  const addMetricButton = event.target.closest("[data-add-custom-metric]");
  if (addMetricButton) {
    const area = addMetricButton.dataset.addCustomMetric;
    const id = `custom_${makeId()}`;
    state.customMetrics = normalizeCustomMetrics(state.customMetrics);
    state.customMetrics[area] = state.customMetrics[area] || [];
    state.customMetrics[area].push(normalizeCustomMetric({ id, name: "NOVA META", unit: "Qtd.", type: "unit100", goal: 1, active: true, importKey: id }));
    ensureMetricOrder(area);
    if (!state.metricOrder[area].includes(id)) state.metricOrder[area].push(id);
    syncCustomMetricSortOrder(area);
    logUpdate({
      action: "Criou meta",
      module: "Metas",
      itemId: id,
      itemName: "NOVA META",
      newValue: `Area ${area}`,
      message: `Nova meta criada na area ${area}.`,
    });
    saveState("Meta adicionada");
    renderAll();
  }

  const duplicateMetricButton = event.target.closest("[data-duplicate-metric]");
  if (duplicateMetricButton) {
    duplicateMetric(duplicateMetricButton.dataset.catalogMetricArea, duplicateMetricButton.dataset.duplicateMetric);
    return;
  }

  const toggleMetricButton = event.target.closest("[data-toggle-metric-active]");
  if (toggleMetricButton) {
    const willActivate = toggleMetricButton.dataset.nextActive === "true";
    if (!willActivate && !criticalConfirm("Voce esta inativando um indicador. Se ele ja tiver historico, os dados serao preservados, mas ele deixara de aparecer como meta ativa. Deseja continuar?")) return;
    setMetricActive(toggleMetricButton.dataset.catalogMetricArea, toggleMetricButton.dataset.toggleMetricActive, willActivate);
    return;
  }

  const removeMetricButton = event.target.closest("[data-remove-metric]");
  if (removeMetricButton) {
    removeOrInactivateMetric(removeMetricButton.dataset.catalogMetricArea, removeMetricButton.dataset.removeMetric);
    return;
  }

  const deleteMetricButton = event.target.closest("[data-delete-custom-metric]");
  if (deleteMetricButton) {
    const area = deleteMetricButton.dataset.customMetricArea;
    const metricId = deleteMetricButton.dataset.deleteCustomMetric;
    const metric = state.customMetrics[area]?.find((item) => item.id === metricId);
    if (!criticalConfirm("Excluir este item de meta? Se houver historico, prefira inativar para preservar dados.", { backup: true, irreversible: true })) return;
    state.customMetrics[area] = state.customMetrics[area].filter((metric) => metric.id !== metricId);
    state.metricOrder = normalizeMetricOrder(state, state.customMetrics);
    state.metricOrder[area] = (state.metricOrder[area] || []).filter((id) => id !== metricId);
    syncCustomMetricSortOrder(area);
    state.deflators[area] = state.deflators[area].filter((item) => item.metricId !== metricId);
    for (const seller of state.sellers.filter((item) => item.area === area)) delete seller.values[metricId];
    delete state.rules[area][metricId];
    logUpdate({
      action: "Excluiu meta",
      module: "Metas",
      itemId: metricId,
      itemName: metric?.name || metricId,
      previousValue: metric?.name || metricId,
      message: `Meta ${metric?.name || metricId} excluida da area ${area}.`,
    });
    saveState("Meta excluida");
    renderAll();
  }

  const addDeflatorButton = event.target.closest("[data-add-deflator]");
  if (addDeflatorButton) {
    const area = addDeflatorButton.dataset.addDeflator;
    const deflator = { id: makeId(), metricId: metricsFor(area)[0]?.id || "gross", name: "Novo deflator", min: 0.8, penaltyRate: 0.1 };
    state.deflators[area].push(deflator);
    logUpdate({
      action: "Criou deflator",
      module: "Regras e Deflatores",
      itemId: deflator.id,
      itemName: deflator.name,
      newValue: `Area ${area}`,
      message: `Deflator criado na area ${area}.`,
    });
    saveState("Deflator adicionado");
    renderAll();
  }

  const deleteDeflatorButton = event.target.closest("[data-delete-deflator]");
  if (deleteDeflatorButton) {
    const area = deleteDeflatorButton.dataset.deflatorArea;
    const deflator = state.deflators[area]?.find((item) => item.id === deleteDeflatorButton.dataset.deleteDeflator);
    if (!criticalConfirm(`Excluir o deflator ${deflator?.name || ""}? Esta regra pode impactar calculos administrativos futuros.`, { backup: true })) return;
    state.deflators[area] = state.deflators[area].filter((item) => item.id !== deleteDeflatorButton.dataset.deleteDeflator);
    logUpdate({
      action: "Excluiu deflator",
      module: "Regras e Deflatores",
      itemId: deleteDeflatorButton.dataset.deleteDeflator,
      itemName: deflator?.name || deleteDeflatorButton.dataset.deleteDeflator,
      previousValue: deflator?.name || "",
      message: `Deflator ${deflator?.name || ""} excluido da area ${area}.`,
    });
    saveState("Deflator excluido");
    renderAll();
  }

  if (event.target.id === "managerLogin") {
    const branch = document.getElementById("managerBranchSelect").value;
    const typed = document.getElementById("managerPassword").value;
    if (typed === String(state.branchPasswords?.[branch] || "1234")) {
      activeBranchSession = branch;
      activeManagerPartialId = "latest";
      activeManagerSellerId = "";
      activeManagerIndicator = "Todos";
      sessionStorage.setItem(BRANCH_SESSION_KEY, branch);
      logAccess({
        status: "Sucesso",
        profile: "Filial",
        module: "Filial",
        action: "Login realizado",
        branchName: branch,
        userName: branch,
        message: `Filial ${branch} acessou o painel da filial.`,
      }, { persist: true });
      renderAll();
    } else {
      logAccess({
        status: "Falha",
        profile: "Filial",
        module: "Filial",
        action: "Tentativa de login invalida",
        branchName: branch,
        userName: branch,
        message: `Tentativa invalida de acesso da filial ${branch}.`,
      }, { persist: true });
      document.getElementById("managerLoginError").textContent = "Senha incorreta";
    }
  }

  if (event.target.id === "managerLogout") {
    logAccess({
      status: "Sucesso",
      profile: "Filial",
      module: "Filial",
      action: "Logout",
      branchName: activeBranchSession,
      userName: activeBranchSession,
      message: `Filial ${activeBranchSession} saiu do sistema.`,
    }, { persist: true });
    activeBranchSession = "";
    activeManagerSellerId = "";
    activeManagerIndicator = "Todos";
    activeManagerPartialId = "latest";
    sessionStorage.removeItem(BRANCH_SESSION_KEY);
    renderAll();
  }
  const managerSellerDetail = event.target.closest("[data-manager-seller-detail]");
  if (managerSellerDetail) {
    activeManagerSellerId = managerSellerDetail.dataset.managerSellerDetail || "";
    showBranchPartialDetails = true;
    renderManager();
  }
  const branchPartialToggle = event.target.closest("[data-toggle-branch-partial-details]");
  if (branchPartialToggle) {
    showBranchPartialDetails = !showBranchPartialDetails;
    renderManager();
  }
  const branchPartialDetail = event.target.closest("[data-branch-partial-detail]");
  if (branchPartialDetail) {
    activeManagerSellerId = branchPartialDetail.dataset.branchPartialDetail || "";
    showBranchPartialDetails = true;
    renderManager();
  }
  const dashboardSellerDetail = event.target.closest("[data-dashboard-seller-detail]");
  if (dashboardSellerDetail) {
    const id = dashboardSellerDetail.dataset.dashboardSellerDetail || "";
    activeDashboardSellerDetailId = activeDashboardSellerDetailId === id ? "" : id;
    renderDashboard();
    return;
  }
  const dashboardBranchDetail = event.target.closest("[data-dashboard-branch-detail]");
  if (dashboardBranchDetail) {
    const branch = dashboardBranchDetail.dataset.dashboardBranchDetail || "";
    activeDashboardBranchDetail = activeDashboardBranchDetail === branch ? "" : branch;
    renderDashboard();
    return;
  }
  const collabTab = event.target.closest("[data-collab-tab]");
  if (collabTab) {
    activeCollaboratorTab = collabTab.dataset.collabTab || "resumo";
    if (activeCollaboratorTab === "extrato") {
      const seller = selectedCollabSeller();
      const data = seller && activeCollaboratorId === seller.id ? officialExtractForSeller(seller) : null;
      if (data) {
        logAccess({
          status: "Sucesso",
          profile: "Vendedor",
          module: "Colaborador",
          action: "Acessou extrato oficial",
          campaignId: data.snapshot.campaignId || activeCampaign()?.id || "",
          campaignName: data.snapshot.campaignName || activeCampaign()?.name || "",
          itemId: data.closing.id,
          itemName: data.snapshot.campaignName || data.closing.campaignName,
          userId: seller.id,
          userName: seller.name,
          sellerName: seller.name,
          branchName: seller.branch,
          message: `${seller.name} acessou o extrato oficial publicado da campanha ${data.snapshot.campaignName || activeCampaign()?.name || ""}.`,
        }, { persist: true });
      }
    }
    renderCollaborator();
  }
  if (event.target.id === "addSeller") {
    const seller = { id: makeId(), name: "NOVO VENDEDOR", branch: "FILIAL", area: "Cabo", adjustments: { quality: 0, insurance: 0, carousel: 0 }, password: "1234", emExperiencia: false, values: {} };
    state.sellers.push(seller);
    logUpdate({
      action: "Criou vendedor",
      module: "Vendedores",
      itemId: seller.id,
      itemName: seller.name,
      newValue: `${seller.branch} - ${seller.area}`,
      message: `Vendedor ${seller.name} criado.`,
    });
    saveState();
    renderAll();
  }

  const deleteButton = event.target.closest("[data-delete-seller]");
  if (deleteButton) {
    const sellerId = deleteButton.dataset.deleteSeller;
    const seller = state.sellers.find((item) => item.id === sellerId);
    if (!seller) return;
    if (state.sellers.length <= 1) {
      alert("Mantenha pelo menos um vendedor cadastrado.");
      return;
    }
    if (!criticalConfirm(`Excluir o vendedor ${seller.name}? Esta acao pode afetar historicos e filtros da campanha aberta.`, { backup: true, irreversible: true })) return;
    state.sellers = state.sellers.filter((item) => item.id !== sellerId);
    if (activeCollaboratorId === sellerId) {
      clearCollaboratorSession();
    }
    logUpdate({
      action: "Excluiu vendedor",
      module: "Vendedores",
      itemId: seller.id,
      itemName: seller.name,
      previousValue: `${seller.branch} - ${seller.area}`,
      message: `Vendedor ${seller.name} excluido.`,
    });
    saveState("Vendedor excluido");
    renderAll();
  }
  if (event.target.id === "exportCollaboratorPdf") {
    const seller = selectedCollabSeller();
    const isExtractTab = activeCollaboratorTab === "extrato";
    const exportingExtract = isExtractTab && seller && Boolean(officialExtractForSeller(seller));
    logUpdate({
      action: exportingExtract ? "Exportou extrato oficial" : isExtractTab ? "Tentou exportar extrato oficial indisponivel" : "Exportou relatorio do vendedor",
      module: isExtractTab ? "Colaborador" : "Vendedor",
      itemId: seller?.id || "",
      itemName: seller?.name || "",
      sellerName: seller?.name || "",
      branchName: seller?.branch || "",
      message: seller ? `${exportingExtract ? "Extrato oficial" : isExtractTab ? "Extrato oficial indisponivel" : "Relatorio do vendedor"} de ${seller.name}${exportingExtract || !isExtractTab ? " exportado em PDF." : "."}` : "Tentativa de exportar relatorio do vendedor.",
    }, { persist: true });
    prepareCollaboratorPdfExport();
  }

  if (event.target.id === "collabLogin") {
    const seller = selectedCollabSeller();
    const typed = document.getElementById("collabPassword").value;
    if (seller && typed === String(seller.password || "1234")) {
      setCollaboratorSession(seller);
      activeCollaboratorTab = "resumo";
      renderAll();
    } else {
      document.getElementById("collabLoginError").textContent = "Senha inválida ou acesso não autorizado.";
    }
  }

  if (event.target.id === "collabLogout") {
    clearCollaboratorSession();
    activeCollaboratorTab = "resumo";
    renderAll();
  }

  const usePartialSimulationButton = event.target.closest("[data-use-partial-simulation]");
  if (usePartialSimulationButton) {
    const seller = selectedCollabSeller();
    const partial = partialById(usePartialSimulationButton.dataset.usePartialSimulation);
    if (!seller || activeCollaboratorId !== seller.id || !partial) return;
    if (isCampaignOperationLocked()) {
      alert("Esta campanha esta encerrada e nao permite novas alteracoes.");
      return;
    }
    for (const item of partialItemsForSeller(partial, seller)) {
      const context = partialMetricContext(item, seller, partial);
      if (!context.metric) continue;
      ensureSellerValues(seller);
      seller.values[context.metric.id] = seller.values[context.metric.id] || { goal: context.goal || context.metric.goal || 0, realized: 0 };
      seller.values[context.metric.id].realized = Number(context.realized) || 0;
    }
    logUpdate({
      action: "Usou parcial como base da simulacao",
      module: "Colaborador",
      campaignId: activeCampaign()?.id || "",
      campaignName: activeCampaign()?.name || "",
      itemId: partial.id,
      itemName: partial.name,
      sellerName: seller.name,
      message: `${seller.name} usou ${partial.name} como base da simulacao.`,
    });
    saveState("Simulacao atualizada pela parcial");
    renderAll();
  }

  if (event.target.id === "globalLogout") {
    clearCollaboratorSession();
    activeCollaboratorTab = "resumo";
    activeBranchSession = "";
    activeManagerSellerId = "";
    sessionStorage.removeItem(BRANCH_SESSION_KEY);
    sessionStorage.removeItem(DASHBOARD_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem(OWNER_SESSION_KEY);
    renderAll();
    openView("home");
  }

  if (event.target.id === "accessLogin") await handleAccessLogin();
  if (event.target.id === "accessCancel") closeAccessLogin();
});

document.addEventListener("click", (event) => {
  if (event.target.id === "collabLogin") {
    const seller = selectedCollabSeller();
    const typed = document.getElementById("collabPassword")?.value;
    const success = seller && typed === String(seller.password || "1234");
    logAccess({
      status: success ? "Sucesso" : "Falha",
      profile: "Vendedor",
      module: "Vendedor",
      action: success ? "Login realizado" : "Tentativa de login invalida",
      userId: seller?.id || "",
      userName: seller?.name || "",
      sellerName: seller?.name || "",
      branchName: seller?.branch || "",
      message: success ? `Vendedor ${seller.name} acessou seu desempenho.` : (seller ? `Tentativa invalida de acesso do vendedor ${seller.name}.` : "Tentativa invalida de acesso de vendedor."),
    }, { persist: true });
  }

  if (event.target.id === "collabLogout") {
    const seller = state.sellers.find((item) => item.id === activeCollaboratorId);
    logAccess({
      status: "Sucesso",
      profile: "Vendedor",
      module: "Vendedor",
      action: "Logout",
      userId: seller?.id || "",
      userName: seller?.name || "",
      sellerName: seller?.name || "",
      branchName: seller?.branch || "",
      message: seller ? `Vendedor ${seller.name} saiu do sistema.` : "Vendedor saiu do sistema.",
    }, { persist: true });
  }

  if (event.target.id === "globalLogout") {
    const profile = currentAuditProfile();
    const module = auditModuleName(document.body.dataset.view);
    logAccess({
      status: "Sucesso",
      profile,
      module,
      action: "Logout",
      message: `${profile} saiu do sistema.`,
    }, { persist: true });
  }
}, true);

document.addEventListener("focusin", (event) => {
  rememberAuditPreviousValue(event.target);
});

document.addEventListener("change", (event) => {
  if (event.target.id?.startsWith("audit") || event.target.id === "auditSearch") {
    renderAuditLogs();
    return;
  }
  if (isSecurityPasswordTarget(event.target)) {
    updateSecurityPassword(event.target);
    return;
  }
  if (isOfficialPeriodTarget(event.target)) {
    commitOfficialPeriodChange(event.target);
    return;
  }
  recordAuditFieldChange(event.target);
  if (event.target.dataset.catalogMetricField && event.target.tagName === "SELECT") {
    updateMetricCatalogField(event.target);
    if (event.target.dataset.catalogMetricField === "active") renderEditableMetricCatalogEditor();
    return;
  }
}, true);

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target.id === "auditSearch") {
    renderAuditLogs();
    return;
  }
  if (target.id === "collabSimulationDaysDone") {
    activeCollaboratorSimulationDaysDone = target.value;
    sessionStorage.setItem("commission-collaborator-simulation-days-done", activeCollaboratorSimulationDaysDone);
    return;
  }
  if (isSecurityPasswordTarget(target) || isOfficialPeriodTarget(target)) return;
  const protectedInput = target.matches("[data-seller-field], [data-seller-experience], [data-adjustment], [data-closing-adjustment], [data-metric-goal], [data-metric-realized], [data-catalog-metric-field], [data-custom-metric-field], [data-branch-name], [data-branch-password], [data-rule-at], [data-rule-rate], [data-deflator-field]") ||
    target.id === "adminDaysTotal";
  if (protectedInput && !requireAdminAction("adminMutation", "Admin", { auditAction: "Tentativa de alteracao oficial bloqueada" })) {
    renderAll();
    return;
  }
  if (protectedInput && !canEditCampaignData()) {
    logBlockedAttempt("Alteracao bloqueada em campanha fechada", "Admin", "Tentativa de alterar dados oficiais em campanha fechada oficialmente.");
    alert("Esta campanha esta fechada oficialmente e nao permite alteracoes.");
    renderAll();
    return;
  }
  if (protectedInput && !confirmPublishedCampaignEdit(target)) {
    renderAll();
    return;
  }
  if (target.id === "adminDaysTotal" && !isAdminUnlocked()) {
    alert("Os dias oficiais da campanha so podem ser alterados pelo Admin.");
    renderAll();
    return;
  }
  if (target.dataset.collabRealized && isCampaignOperationLocked()) {
    alert("Esta campanha esta encerrada e nao permite novas alteracoes.");
    renderCollaborator();
    return;
  }
  if (target.dataset.campaignField) {
    if (!requireAdminAction("updateCampaign", "Campanhas", { auditAction: "Tentativa de alterar campanha bloqueada" })) {
      renderCampaignAdminPanel();
      return;
    }
    const campaign = activeCampaign();
    if (!campaign) return;
    if (isCampaignOfficialClosed(campaign) && !isOwnerUnlocked()) {
      alert("Esta campanha esta fechada oficialmente e nao permite alteracoes.");
      renderCampaignAdminPanel();
      return;
    }
    if (!confirmPublishedCampaignEdit(target)) {
      renderCampaignAdminPanel();
      return;
    }
    const field = target.dataset.campaignField;
    if (field === "plannedBusinessDays") {
      const plannedDays = positiveInteger(target.value, 0);
      if (!plannedDays) {
        alert("Dias uteis planejados deve ser maior que zero.");
        renderCampaignAdminPanel();
        return;
      }
      const hasPublished = publishedPartialsForCampaign(campaign).length > 0;
      if (hasPublished && !criticalConfirm("Esta alteracao sera usada como padrao para novas parciais. Parciais ja publicadas manterao os dias uteis salvos no momento da publicacao. Deseja continuar?")) {
        renderCampaignAdminPanel();
        return;
      }
      campaign.plannedBusinessDays = plannedDays;
      campaign.period = { ...(campaign.period || {}), daysTotal: plannedDays };
      if (campaign.id === state.activeCampaignId) state.period.daysTotal = plannedDays;
    } else {
      campaign[field] = target.value;
    }
    if (target.dataset.campaignField === "reference") {
      campaign.period.month = target.value;
      state.period.month = target.value;
    }
    campaign.updatedAt = new Date().toISOString();
    saveState("Campanha atualizada");
    renderCampaignSelectors();
    return;
  }

  if (target.id === "branchFilter") {
    activeBranchFilter = target.value;
    renderDashboard();
  }

  if (target.id === "adminSellerSearch" || target.id === "adminBranchFilter" || target.id === "adminAreaFilter") {
    renderAdmin();
    return;
  }

  if (target.id === "partnerName") {
    state.settings = { ...defaultSettings(), ...(state.settings || {}) };
    state.settings.partnerName = target.value.trim();
    saveState("Nome da parceira salvo");
    renderBrand();
    return;
  }

  if (target.dataset.catalogMetricField && target.tagName !== "SELECT") {
    updateMetricCatalogField(target);
    return;
  }

  if (target.dataset.customMetricField) {
    const area = target.dataset.customMetricArea;
    const metric = state.customMetrics[area].find((item) => item.id === target.dataset.customMetricId);
    if (!metric) return;
    const field = target.dataset.customMetricField;
    if (field === "goal") metric[field] = Number(target.value) || 0;
    else if (field === "participaAtingimento") metric[field] = target.value === "true";
    else metric[field] = target.value;
    if (field === "name" || field === "type") Object.assign(metric, metricClassification(metric));
    syncCustomMetricSortOrder(area);
    state.rules[area][metric.id] = state.rules[area][metric.id] || [];
    for (const seller of state.sellers.filter((item) => item.area === area)) ensureSellerValues(seller);
    saveState("Meta atualizada");
    renderDashboard();
    renderAdminMetrics();
    renderManager();
    renderCollaborator();
    return;
  }

  if (target.dataset.branchName) {
    const oldBranch = target.dataset.branchName;
    const newBranch = target.value.trim() || oldBranch;
    if (oldBranch === newBranch) return;
    state.branches = state.branches.map((branch) => branch === oldBranch ? newBranch : branch);
    for (const seller of state.sellers) if (seller.branch === oldBranch) seller.branch = newBranch;
    if (state.branchPasswords?.[oldBranch] && !state.branchPasswords[newBranch]) {
      state.branchPasswords[newBranch] = state.branchPasswords[oldBranch];
      delete state.branchPasswords[oldBranch];
    }
    if (activeBranchSession === oldBranch) {
      activeBranchSession = newBranch;
      sessionStorage.setItem(BRANCH_SESSION_KEY, newBranch);
    }
    target.dataset.branchName = newBranch;
    saveState("Filial atualizada");
    renderDashboard();
    renderManager();
    return;
  }
  if (target.dataset.sellerExperience) {
    const seller = state.sellers.find((item) => item.id === target.dataset.sellerExperience);
    if (!seller) return;
    seller.emExperiencia = target.checked;
    saveState("Vendedor atualizado");
    renderAll();
    return;
  }
  if (target.dataset.sellerField) {
    updateSeller(target.dataset.sellerId, target.dataset.sellerField, target.value);
    return;
  }
  if (target.dataset.adjustment) {
    const seller = state.sellers.find((item) => item.id === target.dataset.sellerId);
    seller.adjustments[target.dataset.adjustment] = moneyInputValue(target.value);
    saveState();
    renderDashboard();
    renderAdminMetrics();
    renderCollaborator();
    return;
  }
  if (target.dataset.closingAdjustment) {
    updateClosingAdjustment(target);
    return;
  }

  const adminSeller = selectedAdminSeller();
  if (target.dataset.metricGoal) {
    setMetricValue(adminSeller, target.dataset.metricGoal, "goal", target.value);
    renderDashboard();
    renderCollaborator();
    return;
  }
  if (target.dataset.metricRealized) {
    setMetricValue(adminSeller, target.dataset.metricRealized, "realized", target.value);
    renderDashboard();
    renderCollaborator();
    return;
  }

  const collabSeller = selectedCollabSeller();
  if (target.dataset.collabRealized) {
    setMetricValue(collabSeller, target.dataset.collabRealized, "realized", target.value);
    renderDashboard();
    return;
  }

  if (target.dataset.ruleAt || target.dataset.ruleRate) {
    const area = document.getElementById("ruleAreaSelect").value;
    const metricId = target.dataset.ruleAt || target.dataset.ruleRate;
    const index = Number(target.dataset.ruleIndex);
    state.rules[area][metricId] = sortedBands(area, metricId);
    if (!state.rules[area][metricId][index]) state.rules[area][metricId][index] = { at: 0, rate: 0 };
    if (target.dataset.ruleAt) state.rules[area][metricId][index].at = Number(target.value) || 0;
    if (target.dataset.ruleRate) state.rules[area][metricId][index].rate = Number(target.value) || 0;
    saveState();
    renderDashboard();
    renderAdminMetrics();
    renderCollaborator();
  }

  if (target.dataset.deflatorField) {
    const area = target.dataset.deflatorArea;
    const item = state.deflators[area].find((deflator) => deflator.id === target.dataset.deflatorId);
    if (!item) return;
    const field = target.dataset.deflatorField;
    item[field] = field === "name" || field === "metricId" ? target.value : Number(target.value) || 0;
    saveState("Deflator atualizado");
    renderDashboard();
    renderAdminMetrics();
    renderManager();
    renderCollaborator();
    return;
  }
  saveState();
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-campaign-select]")) {
    setActiveCampaign(event.target.value);
    return;
  }

  if (event.target.id === "dashboardPartialFilter") {
    activeDashboardPartialId = event.target.value || "latest";
    activeDashboardSellerDetailId = "";
    activeDashboardBranchDetail = "";
    const partial = selectedDashboardPartial();
    logAccess({
      status: "Sucesso",
      profile: currentAuditProfile(),
      module: "Dashboard",
      action: "Selecionou parcial",
      itemId: partial?.id || activeDashboardPartialId,
      itemName: partial?.name || "Ultima publicada",
      message: `${currentAuditProfile()} selecionou ${partial?.name || "a ultima parcial publicada"} no Dashboard.`,
    }, { persist: true });
    renderDashboard();
    return;
  }

  if (event.target.id === "dashboardCompareBasePartial") {
    activeDashboardCompareBaseId = event.target.value || "";
    renderDashboard();
    return;
  }

  if (event.target.id === "dashboardCompareTargetPartial") {
    activeDashboardCompareTargetId = event.target.value || "";
    renderDashboard();
    return;
  }

  if (event.target.id === "dashboardCompareBlockFilter") {
    activeDashboardCompareBlock = event.target.value || "Todos";
    renderDashboard();
    return;
  }

  if (event.target.id === "goalSheetFile") {
    if (!requireAdminAction("importGoals", "Importacao e Backup")) {
      event.target.value = "";
      return;
    }
    if (!canEditCampaignData()) {
      logBlockedAttempt("Importacao de metas bloqueada", "Importacao e Backup", "Tentativa de importar metas em campanha fechada oficialmente.");
      alert("Esta campanha esta fechada oficialmente e nao permite alteracoes.");
      event.target.value = "";
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    const hasCampaignData = state.sellers.length || state.branches.length || Object.values(state.customMetrics || {}).some((items) => items?.length);
    if (hasCampaignData && !criticalConfirm("A importacao CSV vai substituir vendedores, filiais e metas customizadas da campanha ativa. Isso evita duplicidade e faz a campanha respeitar o arquivo importado. Deseja continuar?", { backup: true })) {
      event.target.value = "";
      return;
    }
    readCsvFileText(file).then((text) => {
      try {
        importGoalTemplateCsv(text);
      } catch (error) {
        logUpdate({
          status: "Erro",
          action: "Erro na importacao de metas",
          module: "Importacao e Backup",
          message: error.message || "Nao foi possivel importar a planilha de metas.",
        }, { persist: true });
        alert(error.message || "Nao foi possivel importar a planilha de metas.");
      }
    }).catch((error) => {
      logUpdate({
        status: "Erro",
        action: "Erro na leitura do CSV de metas",
        module: "Importacao e Backup",
        message: error.message || "Nao foi possivel importar a planilha de metas.",
      }, { persist: true });
      alert(error.message || "Nao foi possivel importar a planilha de metas.");
    }).finally(() => {
      event.target.value = "";
    });
  }

  if (event.target.id === "partialCsvFile") {
    const campaign = activeCampaign();
    if (!requireAdminAction("importPartial", "Parciais")) {
      event.target.value = "";
      return;
    }
    if (!campaign || isCampaignOfficialClosed(campaign) || campaign.status === CAMPAIGN_STATUS.OPERATIONAL_CLOSED) {
      logBlockedAttempt("Importacao de parcial bloqueada", "Parciais", "Tentativa de importar parcial em campanha sem permissao operacional.", {
        campaignId: campaign?.id || "",
        campaignName: campaign?.name || "",
      });
      alert("Esta campanha nao permite importar nova parcial neste status.");
      event.target.value = "";
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    logUpdate({
      action: "Iniciou importacao de parcial",
      module: "Parciais",
      campaignId: campaign.id,
      campaignName: campaign.name,
      itemName: file.name,
      message: `Admin iniciou importacao do arquivo ${file.name}.`,
    });
    readCsvFileText(file).then((text) => {
      const meta = partialMetaFromForm(campaign);
      pendingPartialImport = validatePartialCsv(text, meta);
      partialPreviewFilter = pendingPartialImport.errorRows ? "Erro" : "Todos";
      logUpdate({
        action: "Validou previa de parcial",
        module: "Parciais",
        campaignId: campaign.id,
        campaignName: campaign.name,
        itemName: pendingPartialImport.name,
        newValue: `${pendingPartialImport.validRows} validas; ${pendingPartialImport.warningRows} alertas; ${pendingPartialImport.errorRows} erros`,
        message: `Previa da ${pendingPartialImport.name} validada.`,
      });
      renderAdminPartialsPanel();
    }).catch((error) => {
      logUpdate({
        status: "Erro",
        action: "Erro na importacao de parcial",
        module: "Parciais",
        campaignId: campaign.id,
        campaignName: campaign.name,
        itemName: file.name,
        message: error.message || "Nao foi possivel importar a parcial.",
      }, { persist: true });
      alert(error.message || "Nao foi possivel importar a parcial.");
    }).finally(() => {
      event.target.value = "";
    });
  }

  if (event.target.id === "importDataFile") {
    if (!requireAdminAction("importBackup", "Importacao e Backup")) {
      event.target.value = "";
      return;
    }
    if (!canEditCampaignData()) {
      logBlockedAttempt("Importacao de backup bloqueada", "Importacao e Backup", "Tentativa de importar backup em campanha fechada oficialmente.");
      alert("Esta campanha esta fechada oficialmente e nao permite importacao de backup.");
      event.target.value = "";
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const currentLogs = normalizeAuditLogs(state.auditLogs);
        const imported = normalizeState(JSON.parse(reader.result));
        const byId = new Map([...currentLogs, ...normalizeAuditLogs(imported.auditLogs)].map((log) => [log.id, log]));
        state = { ...imported, auditLogs: [...byId.values()] };
        logUpdate({
          action: "Importou backup",
          module: "Importacao e Backup",
          message: "Backup JSON importado. Historico de auditoria preservado.",
        });
        saveState("Backup importado");
        renderAll();
      } catch (error) {
        logUpdate({
          status: "Erro",
          action: "Erro na importacao de backup",
          module: "Importacao e Backup",
          message: error.message || "Nao foi possivel importar o backup.",
        }, { persist: true });
        alert(error.message || "Nao foi possivel importar o backup.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  if (event.target.matches("[data-seller-field], [data-adjustment], [data-closing-adjustment], [data-metric-goal], [data-metric-realized], [data-collab-realized], [data-deflator-field], [data-catalog-metric-field], [data-custom-metric-field], [data-branch-name], [data-branch-password]")) renderAll();
  if (event.target.id === "adminSellerSelect") renderAdminMetrics();
  if (event.target.id === "collabSellerSelect") renderCollaborator();
  if (event.target.id === "ruleAreaSelect") renderRules();
  if (event.target.id === "branchFilter") {
    activeBranchFilter = event.target.value;
    activeDashboardSellerDetailId = "";
    activeDashboardBranchDetail = "";
    renderDashboard();
  }
  if (event.target.id === "dashboardAreaFilter") {
    activeAreaFilter = event.target.value;
    activeDashboardSellerDetailId = "";
    activeDashboardBranchDetail = "";
    document.querySelectorAll(".area-filter").forEach((button) => button.classList.toggle("active", button.dataset.area === activeAreaFilter));
    renderDashboard();
  }
  if (event.target.id === "dashboardIndicatorFilter") {
    activeDashboardIndicator = event.target.value;
    activeDashboardSellerDetailId = "";
    activeDashboardBranchDetail = "";
    renderDashboard();
  }
  if (event.target.id === "dashboardStatusFilter") {
    activeDashboardStatus = event.target.value;
    activeDashboardSellerDetailId = "";
    activeDashboardBranchDetail = "";
    renderDashboard();
  }
  if (event.target.id === "dashboardDeflatorFilter") {
    activeDashboardDeflator = event.target.value;
    activeDashboardSellerDetailId = "";
    activeDashboardBranchDetail = "";
    renderDashboard();
  }
  if (event.target.id === "managerSellerFilter") {
    activeManagerSellerId = event.target.value;
    showBranchPartialDetails = true;
    renderManager();
  }
  if (event.target.id === "managerPartialFilter") {
    activeManagerPartialId = event.target.value || "latest";
    activeManagerSellerId = "";
    showBranchPartialDetails = false;
    const partial = getVisiblePartial("filial");
    logAccess({
      status: "Sucesso",
      profile: "Filial",
      module: "Filial",
      action: "Selecionou parcial",
      itemId: partial?.id || activeManagerPartialId,
      itemName: partial?.name || "Ultima publicada",
      message: `Filial ${activeBranchSession || ""} selecionou ${partial?.name || "a ultima parcial publicada"}.`,
    }, { persist: true });
    renderManager();
  }
  if (event.target.id === "branchCompareBasePartial") {
    activeManagerCompareBaseId = event.target.value || "";
    renderManager();
    return;
  }
  if (event.target.id === "branchCompareTargetPartial") {
    activeManagerCompareTargetId = event.target.value || "";
    renderManager();
    return;
  }
  if (event.target.id === "branchCompareBlockFilter") {
    activeManagerCompareBlock = event.target.value || "Todos";
    renderManager();
    return;
  }
  if (event.target.id === "managerIndicatorFilter") {
    activeManagerIndicator = event.target.value || "Todos";
    renderManager();
  }
  if (event.target.id === "collabPartialFilter") {
    activeCollaboratorPartialId = event.target.value || "latest";
    const seller = selectedCollabSeller();
    const partial = getVisiblePartial("colaborador");
    logAccess({
      status: "Sucesso",
      profile: "Colaborador",
      module: "Vendedor",
      action: partialIsLatest(partial) ? "Selecionou ultima parcial" : "Consultou parcial historica",
      itemId: partial?.id || activeCollaboratorPartialId,
      itemName: partial?.name || "Ultima publicada",
      sellerName: seller?.name || "",
      message: `${seller?.name || "Vendedor"} consultou ${partial?.name || "a ultima parcial publicada"}.`,
    }, { persist: true });
    renderCollaborator();
  }
  if (event.target.id === "collabSimulationDaysDone") {
    activeCollaboratorSimulationDaysDone = event.target.value;
    sessionStorage.setItem("commission-collaborator-simulation-days-done", activeCollaboratorSimulationDaysDone);
    const seller = selectedCollabSeller();
    logUpdate({
      action: "Alterou dias realizados da simulacao",
      module: "Vendedor",
      itemId: seller?.id || "",
      itemName: seller?.name || "",
      sellerName: seller?.name || "",
      newValue: event.target.value,
      message: `${seller?.name || "Vendedor"} alterou dias realizados apenas na simulacao.`,
    }, { persist: true });
    renderCollaborator();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && document.getElementById("accessLock").classList.contains("active")) {
    document.getElementById("accessLogin").click();
  }
});

// Acesso de manutenção/proprietário: clique 5 vezes no rodapé discreto ou mantenha pressionado.
// A senha não fica no frontend; o backend valida via OWNER_PASSWORD ou APP_OWNER_PASSWORD.
let ownerCreditClicks = 0;
let ownerCreditTimer = 0;
let ownerCreditHoldTimer = 0;
const ownerCredit = document.getElementById("ownerCredit");
if (ownerCredit) {
  ownerCredit.addEventListener("click", () => {
    ownerCreditClicks += 1;
    window.clearTimeout(ownerCreditTimer);
    ownerCreditTimer = window.setTimeout(() => { ownerCreditClicks = 0; }, 1200);
    if (ownerCreditClicks >= 5) {
      ownerCreditClicks = 0;
      showAccessLogin("admin");
    }
  });
  ownerCredit.addEventListener("pointerdown", () => {
    ownerCreditHoldTimer = window.setTimeout(() => showAccessLogin("admin"), 1400);
  });
  ownerCredit.addEventListener("pointerup", () => window.clearTimeout(ownerCreditHoldTimer));
  ownerCredit.addEventListener("pointerleave", () => window.clearTimeout(ownerCreditHoldTimer));
}

window.addEventListener("afterprint", () => {
  document.body.classList.remove("print-collaborator");
});

window.addEventListener("popstate", () => {
  openRouteView({ skipHistory: true });
});

for (const seller of state.sellers) ensureSellerValues(seller);
state.metricCatalog = normalizeMetricCatalog(state.metricCatalog);
state.customMetrics = normalizeCustomMetrics(state.customMetrics);
state.metricOrder = normalizeMetricOrder(state, state.customMetrics);
for (const area of ["Cabo", "Nao Cabo"]) syncCustomMetricSortOrder(area);
state.branches = normalizeBranches(state.branches, state.sellers);
state.deflators = normalizeDeflators(state.deflators);
state.branchPasswords = normalizeBranchPasswords(state.branchPasswords, state.managerAccess, state._legacyManagers, state.branches);
state.settings = { ...defaultSettings(), ...(state.settings || {}), adminPassword: adminPassword(), dashboardPassword: dashboardPassword() };
state.auditLogs = normalizeAuditLogs(state.auditLogs);
localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
renderAll();
openRouteView({ skipHistory: true });
loadStateFromCloud();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((error) => {
      console.warn("Falha ao registrar service worker", error);
    });
  });
}
