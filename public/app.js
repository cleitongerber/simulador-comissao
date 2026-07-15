const STORAGE_KEY = "commission-simulator-v2";
const ADMIN_PASSWORD_KEY = "commission-admin-password";
const ADMIN_SESSION_KEY = "commission-admin-session";
const DASHBOARD_SESSION_KEY = "commission-dashboard-session";
const OWNER_SESSION_KEY = "commission-owner-session";
const COLLAB_SESSION_KEY = "commission-collaborator-session";
const BRANCH_SESSION_KEY = "commission-branch-session";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const pct = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
const num = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
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
  };
}

var state = loadState();
let activeAreaFilter = "Todas";
let activeBranchFilter = "Todas";
let activeDashboardIndicator = "Todos";
let activeDashboardStatus = "Todos";
let activeDashboardDeflator = "Todos";
let activeDashboardPartialId = "latest";
let activeCollaboratorId = sessionStorage.getItem(COLLAB_SESSION_KEY) || "";
let activeBranchSession = sessionStorage.getItem(BRANCH_SESSION_KEY) || "";
let activeManagerSellerId = "";
let activeAdminTab = "campanha";
let pendingAccessView = "dashboard";
let activeAuditLogId = "";
let lastAccessLogKey = "";
let pendingPartialImport = null;
let partialPreviewFilter = "Todos";

function activeCampaign() {
  return state?.campaigns?.find((campaign) => campaign.id === state.activeCampaignId) || state?.campaigns?.[0] || null;
}

function campaignStatusLabel(campaign = activeCampaign()) {
  return campaign?.status || CAMPAIGN_STATUS.OPEN;
}

function isCampaignOfficialClosed(campaign = activeCampaign()) {
  return campaignStatusLabel(campaign) === CAMPAIGN_STATUS.OFFICIAL_CLOSED;
}

function isCampaignOperationLocked(campaign = activeCampaign()) {
  return campaignStatusLabel(campaign) !== CAMPAIGN_STATUS.OPEN;
}

function canEditCampaignData() {
  return !isCampaignOfficialClosed() || isOwnerUnlocked();
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
    activeCollaboratorId = matchingCollaborator.id;
    sessionStorage.setItem(COLLAB_SESSION_KEY, matchingCollaborator.id);
  } else if (activeCollaboratorId) {
    activeCollaboratorId = "";
    sessionStorage.removeItem(COLLAB_SESSION_KEY);
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
  return {
    id: metric?.id || `custom_${makeId()}`,
    name: metric?.name || "NOVA META",
    unit: metric?.unit || "Qtd.",
    type: metric?.type || "unit100",
    goal: Number(metric?.goal) || 0,
    sortOrder: Number(metric?.sortOrder) || 0,
  };
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
  return Array.isArray(source) ? source.map((partial, index) => ({
    id: partial?.id || makeId(),
    campaignId: partial?.campaignId || "",
    campaignName: partial?.campaignName || "",
    number: Number(partial?.number) || index + 1,
    name: partial?.name || `Parcial ${String(Number(partial?.number) || index + 1).padStart(2, "0")}`,
    baseDate: partial?.baseDate || "",
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
  })) : [];
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
  const metric = metricsFor(area).find((item) => item.id === metricId);
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
  const payload = {
    period: cloneData(source.period || { month: "JUNHO", daysDone: 1, daysTotal: 1 }),
    sellers: cloneData(source.sellers || []),
    rules: cloneData(source.rules || defaultRules),
    customMetrics: normalizeCustomMetrics(source.customMetrics),
    metricOrder: normalizeMetricOrder(source, normalizeCustomMetrics(source.customMetrics)),
    branches: cloneData(source.branches || []),
    deflators: normalizeDeflators(source.deflators),
    branchPasswords: cloneData(source.branchPasswords || {}),
  };
  payload.branches = normalizeBranches(payload.branches, payload.sellers);
  payload.branchPasswords = normalizeBranchPasswords(payload.branchPasswords, source.managerAccess, source._legacyManagers, payload.branches);
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
  return {
    period: { month: reference, daysDone: 0, daysTotal: Number(state?.period?.daysTotal) || 1 },
    sellers: [],
    rules: structuredClone(defaultRules),
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
  normalized.sellers = Array.isArray(normalized.sellers) ? normalized.sellers : cloneData(fallback.sellers || []);
  normalized.rules = normalized.rules || cloneData(fallback.rules || defaultRules);
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
  target.period = cloneData(campaign.period);
  target.sellers = cloneData(campaign.sellers);
  target.rules = cloneData(campaign.rules);
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
  candidate.customMetrics = normalizeCustomMetrics(candidate.customMetrics);
  candidate.metricOrder = normalizeMetricOrder(candidate, candidate.customMetrics);
  candidate.deflators = normalizeDeflators(candidate.deflators);
  candidate.branches = normalizeBranches(candidate.branches, candidate.sellers);
  candidate.branchPasswords = normalizeBranchPasswords(candidate.branchPasswords, candidate.managerAccess, candidate._legacyManagers, candidate.branches);
  candidate.auditLogs = normalizeAuditLogs(candidate.auditLogs);
  candidate.campaigns = normalizeCampaigns(candidate);
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

function metricsFor(area, sourceState = state) {
  const defaults = (areaMetrics[area] || []).map((metric) => ({ ...metric, isCustom: false }));
  const custom = (sourceState?.customMetrics?.[area] || []).map((metric) => ({ ...metric, isCustom: true }));
  const order = normalizeMetricOrder(sourceState, sourceState?.customMetrics)[area] || [];
  return [...defaults, ...custom]
    .map((metric) => {
      const index = order.indexOf(metric.id);
      return { ...metric, sortOrder: index >= 0 ? index + 1 : order.length + 1 };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
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

function projected(realized) {
  const done = Math.max(1, Number(state.period.daysDone) || 1);
  const total = Math.max(done, Number(state.period.daysTotal) || done);
  return (Number(realized) || 0) / done * total;
}

function metricCommission(seller, metric, mode) {
  ensureSellerValues(seller);
  const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
  const goal = Number(value.goal) || 0;
  const realized = mode === "projected" ? projected(value.realized) : Number(value.realized) || 0;
  if (metric.type === "deviceRevenue") {
    const qtyMetric = metricsFor(seller.area).find((item) => item.id === "aparelhos_qtd");
    const qtyValue = seller.values.aparelhos_qtd || { goal: qtyMetric?.goal || 0, realized: 0 };
    const qtyRealized = mode === "projected" ? projected(qtyValue.realized) : Number(qtyValue.realized) || 0;
    const qtyPercent = qtyRealized / (Number(qtyValue.goal) || 1);
    return realized * rateFor(seller.area, "aparelhos_qtd", qtyPercent);
  }
  if (metric.type === "deviceQty") return 0;
  const percent = goal ? realized / goal : 0;
  const rate = rateFor(seller.area, metric.id, percent);
  if (metric.type === "unit100") return realized * rate * 100;
  return realized * rate;
}

function percentFor(seller, metricId, useProjected) {
  const metric = metricsFor(seller.area).find((item) => item.id === metricId);
  if (!metric) return 0;
  const value = seller.values[metricId] || { goal: metric.goal, realized: 0 };
  const goal = Number(value.goal) || 0;
  const realized = useProjected ? projected(value.realized) : Number(value.realized) || 0;
  return goal ? realized / goal : 0;
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

function totalAttainmentForSellers(sellers, mode = "projected") {
  const totals = sellers.reduce((acc, seller) => {
    ensureSellerValues(seller);
    for (const metric of metricsFor(seller.area)) {
      const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
      const goal = Number(value.goal) || 0;
      if (goal <= 0) continue;
      acc.goal += goal;
      acc.value += mode === "projected" ? projected(value.realized) : Number(value.realized) || 0;
    }
    return acc;
  }, { goal: 0, value: 0 });
  return totals.goal ? totals.value / totals.goal : 0;
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
    if (!rule.metricId || percentFor(seller, rule.metricId, useProjected) >= min) return max;
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
  if (result.projected <= 0) return { label: "Critico", cls: "bad" };
  const lowMetrics = metricsFor(seller.area).filter((metric) => metric.type !== "deviceRevenue" && percentFor(seller, metric.id, true) < 0.8);
  if (lowMetrics.length === 0) return { label: "Meta batida", cls: "ok" };
  return lowMetrics.length <= 2 ? { label: "Em risco", cls: "warn" } : { label: "Critico", cls: "bad" };
}

function sellerClosingRecord(seller) {
  const result = sellerResult(seller);
  const metrics = collaboratorMetricRows(seller);
  const estornos = sellerEstornos(seller);
  const preview = projectedDeflatorPreview(seller);
  const currentPercent = metrics.totals.currentPercent || 0;
  const status = seller.emExperiencia ? { label: "Em experiencia" } : branchStatusFromPercent(currentPercent);
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
    projectedPercent: metrics.totals.projectedPercent || 0,
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
      metric: row.metric.name,
      goal: row.goal,
      realized: row.realized,
      currentPercent: row.currentPercent || 0,
      missing: row.missing,
      projected: row.projectedValue,
      projectedPercent: row.projectedPercent || 0,
      commission: row.commission,
      deflator: row.deflator,
      status: row.status.label,
    })),
  };
}

function buildCampaignSnapshot(campaign = activeCampaign(), options = {}) {
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
    closedAt: options.closedAt || new Date().toISOString(),
    totalSellers: sellerRows.length,
    totalBranches: branchesList.length,
    totalGoal,
    totalRealized,
    currentPercent: totalGoal ? totalRealized / totalGoal : 0,
    totalProjected,
    projectedPercent: totalGoal ? totalProjected / totalGoal : 0,
    commissionGrossTotal: sellerRows.reduce((sum, row) => sum + row.commissionGross, 0),
    deflatorTotal: sellerRows.reduce((sum, row) => sum + row.deflator, 0),
    estornosTotal: sellerRows.reduce((sum, row) => sum + row.estornosTotal, 0),
    commissionFinalTotal: sellerRows.reduce((sum, row) => sum + row.commissionFinal, 0),
    riskSellers: sellerRows.filter((row) => row.currentPercent < 0.7).length,
    highlightSellers: sellerRows.filter((row) => row.currentPercent >= 1).length,
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

function generateOfficialCommissionCsv(snapshot) {
  const lines = [];
  lines.push(["Resumo da campanha"]);
  lines.push(["Comissao 360"]);
  lines.push(["Nome da campanha", snapshot.campaignName]);
  lines.push(["Mes/ano", snapshot.reference]);
  lines.push(["Data/hora fechamento", dateTime.format(new Date(snapshot.closedAt))]);
  lines.push(["Total vendedores", snapshot.totalSellers]);
  lines.push(["Total filiais", snapshot.totalBranches]);
  lines.push(["Comissao bruta total", snapshot.commissionGrossTotal]);
  lines.push(["Deflatores totais", snapshot.deflatorTotal]);
  lines.push(["Estornos totais", snapshot.estornosTotal]);
  lines.push(["Comissao final total", snapshot.commissionFinalTotal]);
  lines.push(["Status", snapshot.status]);
  lines.push([]);
  lines.push(["Detalhe por vendedor"]);
  lines.push(["Campanha", "Mes/ano", "Vendedor", "Filial", "Area", "Vendedor em experiencia", "Comissao bruta", "Deflator aplicado", "Motivo do deflator", "Impacto financeiro do deflator", "Estorno Qualidade", "Estorno Seguro", "Estorno Carrossel", "Total de estornos", "Comissao final", "Status do fechamento"]);
  for (const row of snapshot.sellers) lines.push([snapshot.campaignName, snapshot.reference, row.name, row.branch, row.area, row.emExperiencia ? "Sim" : "Nao", row.commissionGross, row.deflator, row.deflatorReason, row.deflatorImpact, row.estornoQuality, row.estornoInsurance, row.estornoCarousel, row.estornosTotal, row.commissionFinal, row.status]);
  lines.push([]);
  lines.push(["Detalhe por indicador"]);
  lines.push(["Campanha", "Mes/ano", "Vendedor", "Filial", "Indicador", "Meta", "Realizado", "% atual", "Falta", "Projetado", "% projetado", "Comissao do indicador", "Deflator do indicador", "Status"]);
  for (const row of snapshot.indicators) lines.push([snapshot.campaignName, snapshot.reference, row.seller, row.branch, row.metric, row.goal, row.realized, pct.format(row.currentPercent), row.missing, row.projected, pct.format(row.projectedPercent), row.commission, row.deflator, row.status]);
  lines.push([]);
  lines.push(["Desenvolvido por Cleiton Gerber"]);
  return `\uFEFF${lines.map((line) => line.map(csvCell).join(";")).join("\n")}`;
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
  const metrics = metricsFor(seller.area).filter((metric) => metric.type !== "deviceRevenue");
  if (!metrics.length) return 0;
  const total = metrics.reduce((sum, metric) => sum + percentFor(seller, metric.id, true), 0);
  return total / metrics.length;
}

function metricAttainmentRows(sellers) {
  const rows = [];
  for (const seller of sellers) {
    for (const metric of metricsFor(seller.area).filter((item) => item.type !== "deviceRevenue")) {
      const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
      rows.push({
        seller,
        metric,
        percent: percentFor(seller, metric.id, true),
        goal: Number(value.goal) || 0,
        realized: Number(value.realized) || 0,
        projected: projected(value.realized),
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
    <span>${escapeHtml(seller.branch)} - ${escapeHtml(seller.area)} - ${pct.format(attainment)} - ${money.format(result.projected)} - <span class="status ${status.cls}">${status.label}</span></span>
  </div>`;
}

function renderAchievementBars(sellers) {
  const container = document.getElementById("achievementBars");
  if (!container) return;
  const highlights = [...sellers]
    .filter((seller) => sellerAttainment(seller) >= 1)
    .sort((a, b) => sellerAttainment(b) - sellerAttainment(a));
  container.innerHTML = highlights.map((seller, index) => sellerRankCard(seller, index, "ok-card")).join("") || `<p class="muted-note">Nenhum vendedor com meta batida no filtro atual.</p>`;
}

function renderDashboardInsights(sellers) {
  const offendersContainer = document.getElementById("insightList");
  const goals = document.getElementById("goalOffenderList");
  if (!offendersContainer || !goals) return;

  const offenders = [...sellers]
    .filter((seller) => sellerAttainment(seller) < 1)
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
    const goal = Number(row.goal) || 0;
    const projectedValue = Number(row.projected) || 0;
    const percent = goal ? projectedValue / goal : 0;
    if (goal <= 0 || percent >= 1) continue;
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
    current.projected += projectedValue;
    current.missing += Math.max(goal - projectedValue, 0);
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
  link.click();
  URL.revokeObjectURL(url);
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
    return `<tr><td>${escapeHtml(seller.name)}</td><td>${escapeHtml(seller.branch)}</td><td>${escapeHtml(seller.area)}</td><td>${money.format(result.current)}</td><td>${pct.format(currentPercent)}</td><td>${money.format(projectedNoDeflator)}</td><td>${pct.format(projectedPercent)}</td><td>${money.format(deflator)}</td><td>${discountMoney(estornos)}</td><td>${money.format(finalProjected)}</td><td>${escapeHtml(status.label)}</td></tr>`;
  }).join("");
  const html = `<html><head><meta charset="UTF-8"></head><body><table><thead><tr><th>Vendedor</th><th>Filial</th><th>Area</th><th>Atual</th><th>% atual</th><th>Comissao bruta</th><th>% projetado</th><th>Deflator</th><th>Estornos</th><th>Comissao final</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
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
  logUpdate({ action: "Baixou modelo CSV", module: "Importacao / Backup", message: "Modelo CSV de metas baixado." }, { persist: true });
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
  const key = normalizedKey(name);
  if (key.includes("receita")) return "deviceRevenue";
  if (key.includes("aparelhos qtde") || key.includes("aparelho qtde")) return "deviceQty";
  if (["gross", "peliculas", "acessorios", "delta", "fidel aparelho"].some((item) => key.includes(item))) return "revenue";
  return "unit100";
}

function shouldIgnoreImportedMetric(area, metricName) {
  const areaKey = normalizedKey(area);
  const metricKey = normalizedKey(metricName);
  return areaKey === "nao cabo" && (metricKey === "banda larga" || metricKey === "bl" || metricKey === "combo");
}
function findOrCreateMetric(area, metricName, goalValue) {
  state.customMetrics = normalizeCustomMetrics(state.customMetrics);
  const key = normalizedKey(metricName);
  let metric = metricsFor(area).find((item) => normalizedKey(item.name) === key || normalizedKey(item.id) === key);
  if (metric) return metric;
  const id = `custom_${makeId()}`;
  metric = {
    id,
    name: metricName.trim(),
    unit: metricTypeFromName(metricName) === "revenue" || metricTypeFromName(metricName) === "deviceRevenue" ? "R$" : "Qtd.",
    type: metricTypeFromName(metricName),
    goal: parseImportedNumber(goalValue),
  };
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
  state.customMetrics = { Cabo: [], "Nao Cabo": [] };
  state.metricOrder = {
    Cabo: areaMetrics.Cabo.map((metric) => metric.id),
    "Nao Cabo": areaMetrics["Nao Cabo"].map((metric) => metric.id),
  };
  activeCollaboratorId = "";
  activeManagerSellerId = "";
  activeBranchSession = "";
  sessionStorage.removeItem(COLLAB_SESSION_KEY);
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

    const metricExists = metricsFor(seller.area).some((item) => normalizedKey(item.name) === normalizedKey(metricName) || normalizedKey(item.id) === normalizedKey(metricName));
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
    module: "Importacao / Backup",
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

function selectedDashboardPartial() {
  const campaign = activeCampaign();
  if (!campaign) return null;
  if (activeDashboardPartialId && activeDashboardPartialId !== "latest") return partialById(activeDashboardPartialId, campaign) || latestPublishedPartial(campaign);
  return latestPublishedPartial(campaign);
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
  const key = normalizedKey(metricName);
  return metricsFor(area).find((metric) => normalizedKey(metric.name) === key || normalizedKey(metric.id) === key) || null;
}

function metricExistsInAnotherArea(area, metricName) {
  const otherAreas = Object.keys(areaMetrics).filter((item) => item !== normalizeAreaName(area));
  return otherAreas.some((item) => findPartialMetric(item, metricName));
}

function validatePartialCsv(text, meta = {}) {
  const campaign = activeCampaign();
  if (!campaign) throw new Error("Nenhuma campanha selecionada.");
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
  const number = Number(meta.number) || (partialsForCampaign(campaign).length + 1);
  return {
    id: makeId(),
    campaignId: campaign.id,
    campaignName: campaign.name,
    number,
    name: meta.name || `Parcial ${String(number).padStart(2, "0")}`,
    baseDate: meta.baseDate || new Date().toISOString().slice(0, 10),
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
  if (campaign.status === CAMPAIGN_STATUS.OFFICIAL_CLOSED || campaign.status === CAMPAIGN_STATUS.OPERATIONAL_CLOSED) {
    alert("Esta campanha nao permite salvar nova parcial neste status.");
    return;
  }
  if (pendingPartialImport.errorRows > 0) {
    alert("Corrija os erros antes de salvar ou publicar esta parcial.");
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
  if (campaign.status === CAMPAIGN_STATUS.OFFICIAL_CLOSED || campaign.status === CAMPAIGN_STATUS.OPERATIONAL_CLOSED) {
    alert("Esta campanha nao permite publicar parcial neste status.");
    return;
  }
  if (partial.errorRows > 0) {
    alert("Corrija os erros antes de publicar esta parcial.");
    return;
  }
  if (!confirm("Voce esta publicando esta parcial para consulta dos vendedores, filiais e dashboard. A simulacao dos vendedores continuara separada e nao sera alterada. Deseja continuar?")) return;
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
  if (partial.status !== PARTIAL_STATUS.DRAFT) {
    alert("Somente parciais em rascunho podem ser excluidas.");
    return;
  }
  if (!confirm(`Excluir o rascunho ${partial.name}?`)) return;
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
  )).sort((a, b) => metricOrderIndex(seller.area, a.metricId) - metricOrderIndex(seller.area, b.metricId));
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
    const published = partialsForCampaign().filter((partial) => partial.status === PARTIAL_STATUS.PUBLISHED);
    const options = [`<option value="latest">Ultima publicada</option>`, ...published.map((partial) => `<option value="${escapeHtml(partial.id)}">${escapeHtml(partial.name)} - ${escapeHtml(partial.baseDate || "")}</option>`)];
    partialSelect.innerHTML = options.join("");
    if (activeDashboardPartialId !== "latest" && !published.some((partial) => partial.id === activeDashboardPartialId)) activeDashboardPartialId = "latest";
    partialSelect.value = activeDashboardPartialId;
  }
  if (indicatorSelect) {
    const names = [];
    for (const seller of baseSellers) {
      for (const metric of metricsFor(seller.area).filter((item) => item.type !== "deviceRevenue")) {
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

function renderDashboardPartialPanel() {
  const container = document.getElementById("dashboardPartialPanel");
  if (!container) return;
  const partial = selectedDashboardPartial();
  if (!partial) {
    container.innerHTML = `<div class="dashboard-card-head"><div><h3>Resultado parcial oficial</h3><p>Nenhuma parcial publicada para esta campanha.</p></div></div>`;
    return;
  }
  const sellers = dashboardSellers();
  const sellerIds = new Set(sellers.map((seller) => seller.id));
  const items = partial.items.filter((item) => isPartialUsableItem(item) && sellerIds.has(item.sellerId));
  const branchTotals = new Map();
  const sellerTotals = new Map();
  const metricTotals = new Map();
  for (const item of items) {
    branchTotals.set(item.branch, (branchTotals.get(item.branch) || 0) + item.realized);
    sellerTotals.set(item.sellerName, (sellerTotals.get(item.sellerName) || 0) + item.realized);
    metricTotals.set(item.metricName, (metricTotals.get(item.metricName) || 0) + item.realized);
  }
  const branchRows = [...branchTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const metricRows = [...metricTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  container.innerHTML = `<div class="dashboard-card-head">
    <div><h3>Resultado parcial oficial</h3><p>Exibindo ${escapeHtml(partial.name)} - data base ${escapeHtml(partial.baseDate || "-")}.</p></div>
    <span class="status ok">${escapeHtml(partial.status)}</span>
  </div>
  <div class="campaign-kpi-strip compact-strip">
    <span>Linhas publicadas<strong>${items.length}</strong></span>
    <span>Vendedores<strong>${new Set(items.map((item) => item.sellerId || item.sellerName)).size}</strong></span>
    <span>Filiais<strong>${branchTotals.size}</strong></span>
    <span>Metricas<strong>${metricTotals.size}</strong></span>
    <span>Total realizado<strong>${num.format(items.reduce((sum, item) => sum + item.realized, 0))}</strong></span>
  </div>
  <div class="partial-dashboard-grid">
    <div><h4>Parcial por filial</h4>${branchRows.map(([branch, value]) => `<div class="executive-list-row"><span>${escapeHtml(branch)}</span><em>${num.format(value)}</em></div>`).join("") || `<p class="muted-note">Sem dados.</p>`}</div>
    <div><h4>Parcial por metrica</h4>${metricRows.map(([metric, value]) => `<div class="executive-list-row"><span>${escapeHtml(metric)}</span><em>${num.format(value)}</em></div>`).join("") || `<p class="muted-note">Sem dados.</p>`}</div>
  </div>`;
}

function dashboardStatusFromPercent(percent) {
  if (percent >= 1) return { label: "Acima da meta", cls: "ok", action: "Acompanhamento" };
  if (percent >= 0.7) return { label: "Em atenção", cls: "warn", action: "Plano de ação" };
  return { label: "Crítico", cls: "bad", action: "Ação imediata" };
}

function sellerDashboardStatus(seller) {
  return dashboardStatusFromPercent(dashboardSellerSummaryResult(seller).currentPercent);
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
      currentPercent: percentFor(seller, metric.id, false),
      projectedPercent: percentFor(seller, metric.id, true),
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
    const indicatorOk = activeDashboardIndicator === "Todos" || metricsFor(seller.area).some((metric) => metric.name === activeDashboardIndicator);
    const statusOk = activeDashboardStatus === "Todos" || sellerDashboardStatus(seller).label === activeDashboardStatus;
    const hasDeflator = sellerHasProjectedDeflator(seller);
    const deflatorOk =
      activeDashboardDeflator === "Todos" ||
      (activeDashboardDeflator === "Com deflator" && hasDeflator) ||
      (activeDashboardDeflator === "Sem deflator" && !hasDeflator);
    return indicatorOk && statusOk && deflatorOk;
  });
}

function branchDashboardRows(sellers) {
  const byBranch = new Map();
  for (const seller of sellers) {
    ensureSellerValues(seller);
    const branch = seller.branch || "Sem filial";
    const current = byBranch.get(branch) || { branch, sellers: new Set(), goal: 0, realized: 0, projectedValue: 0, commissionProjected: 0 };
    current.sellers.add(seller.id);
    current.commissionProjected += dashboardSellerSummaryResult(seller).finalProjected;
    for (const metric of metricsFor(seller.area).filter((item) => item.type !== "deviceRevenue")) {
      if (activeDashboardIndicator !== "Todos" && metric.name !== activeDashboardIndicator) continue;
      const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
      current.goal += Number(value.goal) || 0;
      current.realized += Number(value.realized) || 0;
      current.projectedValue += projected(value.realized);
    }
    byBranch.set(branch, current);
  }
  return [...byBranch.values()].map((row) => ({
    ...row,
    currentPercent: row.goal ? row.realized / row.goal : 0,
    projectedPercent: row.goal ? row.projectedValue / row.goal : 0,
    status: dashboardStatusFromPercent(row.goal ? row.realized / row.goal : 0),
  }));
}

function dashboardTotals(sellers) {
  return sellers.reduce((acc, seller) => {
    const result = dashboardSellerSummaryResult(seller);
    acc.current += result.current;
    acc.gross += result.projectedNoDeflator;
    acc.projected += result.finalProjected;
    acc.gain += result.finalProjected - result.current;
    acc.deflator += result.deflator;
    acc.estornos += result.estornos || 0;
    return acc;
  }, { current: 0, gross: 0, projected: 0, gain: 0, deflator: 0, estornos: 0 });
}

function dashboardAttainmentForSellers(sellers, mode) {
  if (activeDashboardIndicator === "Todos") return totalAttainmentForSellers(sellers, mode);
  const totals = sellers.reduce((acc, seller) => {
    const metric = selectedDashboardMetric(seller);
    if (!metric) return acc;
    const value = seller.values?.[metric.id] || { goal: metric.goal, realized: 0 };
    const goal = Number(value.goal) || 0;
    acc.goal += goal;
    acc.value += mode === "projected" ? projected(value.realized) : Number(value.realized) || 0;
    return acc;
  }, { goal: 0, value: 0 });
  return totals.goal ? totals.value / totals.goal : 0;
}

function renderDashboard() {
  renderBranchFilter();
  const baseSellers = dashboardBaseSellers();
  renderDashboardFilterControls(baseSellers);
  const sellers = dashboardSellers();
  renderDashboardPartialPanel();
  const empty = document.getElementById("dashboardEmptyState");
  const hasData = state.sellers.length > 0 && sellers.length > 0;
  if (empty) {
    empty.classList.toggle("active", !hasData);
    empty.innerHTML = !hasData ? `<strong>Nenhum dado disponivel para o periodo selecionado.</strong><span>Configure metas e realizados no Admin para visualizar o Dashboard.</span>` : "";
  }

  const totals = dashboardTotals(sellers);
  const totalCurrentPercent = dashboardAttainmentForSellers(sellers, "current");
  const totalProjectedPercent = dashboardAttainmentForSellers(sellers, "projected");
  const branchRows = branchDashboardRows(sellers);
  const riskBranches = branchRows.filter((row) => row.currentPercent < 0.7).length;
  const highlightSellers = sellers.filter((seller) => dashboardSellerSummaryResult(seller).currentPercent >= 1.2).length;
  const deflatorCounts = sellers.reduce((acc, seller) => {
    if (sellerHasProjectedDeflator(seller)) acc.withDeflator += 1;
    else acc.withoutDeflator += 1;
    return acc;
  }, { withDeflator: 0, withoutDeflator: 0 });

  renderDashboardExecutiveCards(totals, totalCurrentPercent, totalProjectedPercent, riskBranches, highlightSellers, deflatorCounts);
  renderExecutiveSummary(sellers, branchRows, totalCurrentPercent, totalProjectedPercent, riskBranches);
  renderSellerSummary(sellers);
  renderBranchAttainmentBars(branchRows);
  renderBranchCommissionBars(branchRows);
  renderRanking(sellers);
  renderTopSellers(sellers);
  renderCriticalGoals(sellers);
  renderAttentionPoints(sellers, branchRows, totalCurrentPercent, totalProjectedPercent);
}

function renderDashboardExecutiveCards(totals, currentPercent, projectedPercent, riskBranches, highlightSellers, deflatorCounts) {
  const container = document.getElementById("dashboardExecutiveCards");
  if (!container) return;
  const cards = [
    ["Comissão final", money.format(totals.projected), "Após deflatores e estornos", "money", null],
    ["% atual geral", pct.format(currentPercent), "Atingimento atual", "percent", currentPercent],
    ["% projetado geral", pct.format(projectedPercent), "Projeção da meta", "trend", projectedPercent],
    ["Risco / destaque", `${riskBranches}/${highlightSellers}`, "Filiais em risco / vendedores destaque", "alert", riskBranches ? 0 : highlightSellers ? 1 : null],
  ];
  const financialComposition = `<article class="dashboard-kpi dashboard-finance-composition">
    <span aria-hidden="true"></span>
    <div>
      <small>Composição da comissão</small>
      <div class="finance-mini-grid">
        <strong><b>Bruta</b>${money.format(totals.gross)}</strong>
        <strong><b>Deflatores</b>${discountMoney(totals.deflator)}</strong>
        <strong><b>Estornos</b>${discountMoney(totals.estornos)}</strong>
        <strong><b>Com / sem deflator</b>${deflatorCounts.withDeflator}/${deflatorCounts.withoutDeflator}</strong>
      </div>
    </div>
  </article>`;
  container.innerHTML = cards.map(([label, value, detail, icon, percent]) => `<article class="dashboard-kpi ${icon}">
    <span aria-hidden="true"></span>
    <div><small>${label}</small><strong>${value}</strong><em class="${achievementClass(percent)}">${detail}</em></div>
  </article>`).join("") + financialComposition;
}

function renderExecutiveSummary(sellers, branchRows, currentPercent, projectedPercent, riskBranches) {
  const container = document.getElementById("executiveSummary");
  if (!container) return;
  if (!sellers.length) {
    container.textContent = "Ainda nao ha dados suficientes para gerar um resumo executivo.";
    return;
  }
  const bestBranch = [...branchRows].sort((a, b) => b.currentPercent - a.currentPercent)[0];
  const lowSellers = sellers.filter((seller) => dashboardSellerSummaryResult(seller).currentPercent < 0.7).length;
  const health = projectedPercent >= 1 ? "acima da meta projetada" : "abaixo da meta projetada";
  const branchText = bestBranch ? `${bestBranch.branch} lidera com ${pct.format(bestBranch.currentPercent)} de atingimento atual.` : "";
  const branchRiskText = `${riskBranches} ${riskBranches === 1 ? "filial em risco" : "filiais em risco"}`;
  const sellerRiskText = `${lowSellers} ${lowSellers === 1 ? "vendedor" : "vendedores"} abaixo de 70%`;
  container.innerHTML = `A operação está com <strong>${pct.format(currentPercent)}</strong> de atingimento atual e projeção de <strong>${pct.format(projectedPercent)}</strong>, ficando ${health}. ${branchText} ${branchRiskText} e ${sellerRiskText} exigem atenção.`;
}

function renderSellerSummary(sellers) {
  const body = document.getElementById("sellerSummaryBody");
  if (!body) return;
  body.innerHTML = sellers.map((seller) => {
    const result = dashboardSellerSummaryResult(seller);
    const currentPercent = result.currentPercent;
    const projectedPercent = result.projectedPercent;
    const status = dashboardStatusFromPercent(currentPercent);
    return `<tr>
      <td>${escapeHtml(seller.name)}</td>
      <td>${escapeHtml(seller.branch)}</td>
      <td>${escapeHtml(seller.area)}</td>
      <td>${money.format(result.current)}</td>
      <td>${achievementPill(currentPercent)}</td>
      <td>${money.format(result.projectedNoDeflator)}</td>
      <td>${achievementPill(projectedPercent)}</td>
      <td>${money.format(result.deflator)}</td>
      <td>${discountMoney(result.estornos)}</td>
      <td>${money.format(result.finalProjected)}</td>
      <td><span class="status ${status.cls}">${status.label}</span></td>
    </tr>`;
  }).join("") || `<tr><td colspan="11">Nenhum vendedor no filtro atual.</td></tr>`;
}

function chartTone(percent) {
  if (percent >= 1) return "ok";
  if (percent >= 0.7) return "warn";
  return "bad";
}

function renderBranchAttainmentBars(rows) {
  const container = document.getElementById("branchAttainmentBars");
  if (!container) return;
  const sorted = [...rows].sort((a, b) => b.currentPercent - a.currentPercent);
  container.innerHTML = sorted.map((row) => `<div class="branch-chart-row ${chartTone(row.currentPercent)}">
    <div class="branch-chart-label"><strong>${escapeHtml(row.branch)}</strong><span>${pct.format(row.currentPercent)}</span></div>
    <div class="branch-chart-track"><span class="reference-line"></span><i style="width:${Math.min(140, Math.max(2, row.currentPercent * 100))}%"></i></div>
  </div>`).join("") || `<p class="muted-note">Sem filiais no filtro atual.</p>`;
}

function renderBranchCommissionBars(rows) {
  const container = document.getElementById("branchCommissionBars");
  if (!container) return;
  const sorted = [...rows].sort((a, b) => b.commissionProjected - a.commissionProjected);
  const max = Math.max(1, ...sorted.map((row) => Math.abs(row.commissionProjected)));
  container.innerHTML = sorted.map((row) => `<div class="branch-chart-row money">
    <div class="branch-chart-label"><strong>${escapeHtml(row.branch)}</strong><span>${money.format(row.commissionProjected)}</span></div>
    <div class="branch-chart-track"><i style="width:${Math.max(2, Math.abs(row.commissionProjected) / max * 100)}%"></i></div>
  </div>`).join("") || `<p class="muted-note">Sem comissão no filtro atual.</p>`;
}

function renderRanking(sellers) {
  const ranked = [...sellers].sort((a, b) => (dashboardSellerSummaryResult(b).finalProjected - dashboardSellerSummaryResult(b).current) - (dashboardSellerSummaryResult(a).finalProjected - dashboardSellerSummaryResult(a).current)).slice(0, 5);
  const container = document.getElementById("rankingList");
  if (!container) return;
  container.innerHTML = ranked.map((seller, index) => {
    const result = dashboardSellerSummaryResult(seller);
    return `<div class="executive-list-row"><strong>${index + 1}</strong><span>${escapeHtml(seller.name)}<small>${escapeHtml(seller.branch)}</small></span><em>${money.format(result.finalProjected - result.current)}</em></div>`;
  }).join("") || `<p class="muted-note">Sem dados suficientes para ranking.</p>`;
}

function renderTopSellers(sellers) {
  const container = document.getElementById("topSellersList");
  if (!container) return;
  const ranked = [...sellers].sort((a, b) => dashboardSellerSummaryResult(b).currentPercent - dashboardSellerSummaryResult(a).currentPercent).slice(0, 5);
  container.innerHTML = ranked.map((seller, index) => {
    const currentPercent = dashboardSellerSummaryResult(seller).currentPercent;
    return `<div class="executive-list-row"><strong>${index + 1}</strong><span>${escapeHtml(seller.name)}<small>${escapeHtml(seller.branch)}</small></span><em class="${achievementClass(currentPercent)}">${pct.format(currentPercent)}</em></div>`;
  }).join("") || `<p class="muted-note">Sem dados suficientes para top vendedores.</p>`;
}

function renderCriticalGoals(sellers) {
  const container = document.getElementById("goalOffenderList");
  if (!container) return;
  const rows = criticalGoalRows(sellers).slice(0, 8);
  container.innerHTML = rows.map((row) => {
    const status = dashboardStatusFromPercent(row.percent);
    return `<div class="critical-row">
      <strong>${escapeHtml(row.metricName)}</strong>
      <span>${escapeHtml(row.area)}</span>
      <span>${row.sellerCount} vendedor${row.sellerCount === 1 ? "" : "es"}</span>
      <span>${pct.format(row.percent)}</span>
      <em class="status ${status.cls}">${status.label}</em>
      <small>${status.action}</small>
    </div>`;
  }).join("") || `<p class="muted-note">Nenhuma meta critica no filtro atual.</p>`;
}

function renderAttentionPoints(sellers, branchRows, currentPercent, projectedPercent) {
  const container = document.getElementById("attentionPointsList");
  if (!container) return;
  const riskBranches = branchRows.filter((row) => row.currentPercent < 0.7).length;
  const lowSellers = sellers.filter((seller) => dashboardSellerSummaryResult(seller).currentPercent < 0.7).length;
  const criticalGoals = criticalGoalRows(sellers).slice(0, 1)[0];
  const points = [];
  if (riskBranches) points.push({ cls: "bad", title: `${riskBranches} ${riskBranches === 1 ? "filial abaixo de 70%" : "filiais abaixo de 70%"}`, detail: "Priorizar plano de ação por loja." });
  if (lowSellers) points.push({ cls: "bad", title: `${lowSellers} vendedor${lowSellers === 1 ? "" : "es"} abaixo de 70%`, detail: "Acompanhar gaps individuais." });
  if (projectedPercent < 1) points.push({ cls: "warn", title: "Projeção abaixo de 100%", detail: `Atingimento projetado em ${pct.format(projectedPercent)}.` });
  if (criticalGoals) points.push({ cls: "warn", title: `${criticalGoals.metricName} abaixo da meta`, detail: `${criticalGoals.sellerCount} vendedor${criticalGoals.sellerCount === 1 ? "" : "es"} impactando o indicador.` });
  if (!points.length && sellers.length) points.push({ cls: "ok", title: "Nenhum ponto critico identificado", detail: `Operacao com ${pct.format(currentPercent)} de atingimento atual.` });
  container.innerHTML = points.map((point) => `<div class="attention-row ${point.cls}"><strong>${escapeHtml(point.title)}</strong><span>${escapeHtml(point.detail)}</span></div>`).join("") || `<p class="muted-note">Nenhum dado disponivel.</p>`;
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
      <label>Senha da filial<input data-branch-password="${escapeHtml(branch)}" type="text" value="${escapeHtml(state.branchPasswords?.[branch] || "1234")}"></label>
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

function campaignClosingRowsMarkup() {
  const canEditEstornos = canEditCampaignData() && isAdminUnlocked();
  return state.sellers.map((seller) => {
    const row = sellerClosingRecord(seller);
    return `<tr>
      <td><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.branch)} - ${escapeHtml(row.area)}</small></td>
      <td>${money.format(row.commissionGross)}</td>
      <td>${money.format(row.deflator)}</td>
      <td><input data-adjustment="quality" data-seller-id="${seller.id}" type="number" min="0" step="0.01" value="${row.estornoQuality}" ${canEditEstornos ? "" : "disabled"}></td>
      <td><input data-adjustment="insurance" data-seller-id="${seller.id}" type="number" min="0" step="0.01" value="${row.estornoInsurance}" ${canEditEstornos ? "" : "disabled"}></td>
      <td><input data-adjustment="carousel" data-seller-id="${seller.id}" type="number" min="0" step="0.01" value="${row.estornoCarousel}" ${canEditEstornos ? "" : "disabled"}></td>
      <td>${discountMoney(row.estornosTotal)}</td>
      <td>${money.format(row.commissionFinal)}</td>
      <td>${row.emExperiencia ? `<span class="status neutral">Em experiencia</span>` : `<span class="status">${escapeHtml(row.status)}</span>`}</td>
    </tr>`;
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
    ["Configurar periodo da campanha", "campanha", "done"],
    ["Salvar campanha", "campanha", "done"],
    ["Congelar campanha", "fechamento", status === CAMPAIGN_STATUS.OPEN ? "active" : "done"],
    ["Revisar resultados", "fechamento", status === CAMPAIGN_STATUS.OPERATIONAL_CLOSED ? "active" : status === CAMPAIGN_STATUS.OPEN ? "" : "done"],
    ["Lancar estornos", "estornos", status === CAMPAIGN_STATUS.ADMIN_CLOSING ? "active" : status === CAMPAIGN_STATUS.OFFICIAL_CLOSED ? "done" : ""],
    ["Baixar prévia do arquivo", "fechamento", status === CAMPAIGN_STATUS.ADMIN_CLOSING ? "active" : status === CAMPAIGN_STATUS.OFFICIAL_CLOSED ? "done" : ""],
    ["Fechar comissao oficial", "fechamento", status === CAMPAIGN_STATUS.ADMIN_CLOSING ? "active" : status === CAMPAIGN_STATUS.OFFICIAL_CLOSED ? "done" : ""],
    ["Baixar arquivo oficial", "fechamento", status === CAMPAIGN_STATUS.OFFICIAL_CLOSED ? "done" : ""],
    ["Iniciar novo mes/campanha", "campanha", status === CAMPAIGN_STATUS.OFFICIAL_CLOSED ? "active" : ""],
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
      <td>${money.format(itemSummary.commissionFinal || 0)}</td>
      <td>${item.officialFileCsv
        ? `<button class="ghost-button compact-action" data-download-campaign="${item.id}" type="button">Baixar oficial</button>`
        : item.status !== CAMPAIGN_STATUS.OFFICIAL_CLOSED
          ? `<button class="ghost-button compact-action" data-download-preview-campaign="${item.id}" type="button">Baixar prévia</button>`
          : "Nao disponivel"}</td>
      <td>
        <button class="ghost-button compact-action" data-select-campaign="${item.id}" type="button">Visualizar</button>
        <button class="ghost-button compact-action" data-duplicate-campaign="${item.id}" type="button">Duplicar</button>
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
      </div>
    </div>
    <div class="campaign-command-card">
      <div>
        <span>Campanha atual</span>
        <strong>${escapeHtml(campaign.name)}</strong>
        <small>${escapeHtml(campaign.reference || campaign.period?.month || "-")}</small>
      </div>
      <div><span>Dias uteis</span><strong>${num.format(state.period.daysTotal || 0)}</strong><small>Planejados</small></div>
      <div><span>Dias realizados</span><strong>${num.format(state.period.daysDone || 0)}</strong><small>Projecao ativa</small></div>
      <div><span>Status</span><strong class="${campaignStatusClass(campaign.status)}">${campaignShortStatus(campaign.status)}</strong><small>${escapeHtml(campaign.status)}</small></div>
    </div>
    <div class="campaign-kpi-strip">
      <span>Vendedores ativos<strong>${summary.sellers}</strong></span>
      <span>Filiais ativas<strong>${summary.branches}</strong></span>
      <span>Metas cadastradas<strong>${metricCount}</strong></span>
      <span>Deflatores ativos<strong>${deflatorCount}</strong></span>
      <span>Comissao final<strong>${money.format(summary.commissionFinal || 0)}</strong></span>
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
      <label>Data de inicio<input data-campaign-field="startDate" type="date" value="${escapeHtml(campaign.startDate || "")}" ${officialClosed && !isOwnerUnlocked() ? "disabled" : ""}></label>
      <label>Encerramento operacional<input data-campaign-field="operationalCloseDate" type="date" value="${escapeHtml(campaign.operationalCloseDate || "")}" ${officialClosed && !isOwnerUnlocked() ? "disabled" : ""}></label>
      <label>Fechamento oficial<input data-campaign-field="officialCloseDate" type="date" value="${escapeHtml(campaign.officialCloseDate || "")}" ${officialClosed && !isOwnerUnlocked() ? "disabled" : ""}></label>
      <div class="campaign-current-status"><span>Status</span><strong class="${campaignStatusClass(campaign.status)}">${escapeHtml(campaign.status)}</strong></div>
    </div>
    <div class="table-wrap campaign-table-wrap">
      <table>
        <thead><tr><th>Campanha</th><th>Inicio</th><th>Enc. oper.</th><th>Fech. oficial</th><th>Status</th><th>Vendedores</th><th>Filiais</th><th>Comissao final</th><th>Arquivo</th><th>Acoes</th></tr></thead>
        <tbody>${listRows}</tbody>
      </table>
    </div>
  `;
}

function createCampaignFromActive(options = {}) {
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
  const source = state.campaigns.find((campaign) => campaign.id === campaignId) || activeCampaign();
  if (!source) return;
  createCampaignFromActive({
    source,
    name: `${source.name} - copia`,
    reference: source.reference || source.period?.month || "Novo periodo",
  });
}

function deleteCampaign(campaignId) {
  const campaign = state.campaigns.find((item) => item.id === campaignId);
  if (!campaign) return;
  if ((state.campaigns || []).length <= 1) {
    alert("Nao e possivel excluir a unica campanha do sistema.");
    return;
  }
  if (campaign.status === CAMPAIGN_STATUS.OFFICIAL_CLOSED && !isOwnerUnlocked()) {
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
  if (!campaign?.officialFileCsv) {
    alert("Arquivo oficial nao disponivel para esta campanha.");
    return;
  }
  downloadFile(campaign.officialFileName || campaignFileName(campaign, campaign.snapshot), "text/csv;charset=utf-8", campaign.officialFileCsv);
  logUpdate({
    action: "Baixou arquivo oficial",
    module: "Fechamento",
    campaignId: campaign.id,
    campaignName: campaign.name,
    itemName: campaign.officialFileName || campaignFileName(campaign, campaign.snapshot),
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

function officialCloseActiveCampaign() {
  const campaign = activeCampaign();
  if (!campaign) return;
  syncActiveCampaignFromRoot({ force: true });
  const snapshot = buildCampaignSnapshot(campaign);
  const message = [
    `Campanha: ${campaign.name}`,
    `Mes/ano: ${campaign.reference}`,
    `Vendedores: ${snapshot.totalSellers}`,
    `Filiais: ${snapshot.totalBranches}`,
    `Comissao bruta: ${money.format(snapshot.commissionGrossTotal)}`,
    `Deflatores: ${money.format(snapshot.deflatorTotal)}`,
    `Estornos: ${discountMoney(snapshot.estornosTotal)}`,
    `Comissao final: ${money.format(snapshot.commissionFinalTotal)}`,
    "",
    "Apos confirmar, os dados ficarao congelados e sera gerado o arquivo oficial. Deseja continuar?",
  ].join("\n");
  if (!confirm(message)) return;
  campaign.snapshot = snapshot;
  campaign.status = CAMPAIGN_STATUS.OFFICIAL_CLOSED;
  campaign.closedAt = snapshot.closedAt;
  campaign.officialCloseDate = campaign.officialCloseDate || snapshot.closedAt.slice(0, 10);
  campaign.officialFileName = campaignFileName(campaign, snapshot);
  campaign.officialFileCsv = generateOfficialCommissionCsv(snapshot);
  campaign.updatedAt = snapshot.closedAt;
  logUpdate({
    action: "Fechou comissionamento oficial",
    module: "Fechamento",
    campaignId: campaign.id,
    campaignName: campaign.name,
    itemId: campaign.id,
    itemName: campaign.name,
    newValue: `Comissao final total: ${money.format(snapshot.commissionFinalTotal)}`,
    message: `Comissionamento da campanha ${campaign.name} fechado oficialmente. Comissao final total: ${money.format(snapshot.commissionFinalTotal)}.`,
  });
  saveState("Comissionamento fechado");
  renderAll();
}

function renderSelectors() {
  const adminSelected = document.getElementById("adminSellerSelect")?.value;
  const collabSelected = activeCollaboratorId || document.getElementById("collabSellerSelect")?.value;
  const options = state.sellers.map((seller) => `<option value="${seller.id}">${seller.name} - ${seller.branch} - ${seller.area}</option>`).join("");
  const adminSelect = document.getElementById("adminSellerSelect");
  const collabSelect = document.getElementById("collabSellerSelect");
  adminSelect.innerHTML = options;
  collabSelect.innerHTML = options;
  collabSelect.disabled = Boolean(activeCollaboratorId);
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
  const metricCount = ["Cabo", "Nao Cabo"].reduce((total, area) => total + metricsFor(area).length, 0);
  const deflatorCount = ["Cabo", "Nao Cabo"].reduce((total, area) => total + (state.deflators?.[area] || []).length, 0);
  const cards = [
    { icon: "user", title: "Vendedores cadastrados", value: state.sellers.length, note: "Total atual" },
    { icon: "store", title: "Filiais ativas", value: branches().length, note: "Lojas cadastradas" },
    { icon: "target", title: "Itens de meta", value: metricCount, note: "Indicadores ativos" },
    { icon: "percent", title: "Deflatores ativos", value: deflatorCount, note: "Vigentes no periodo" },
  ];
  container.innerHTML = cards.map((card) => `
    <article class="admin-summary-card ${card.icon}">
      <span aria-hidden="true"></span>
      <div><small>${card.title}</small><strong>${card.value}</strong><em>${card.note}</em></div>
    </article>
  `).join("");
}

function renderAdminEstornosPanel() {
  const container = document.getElementById("adminEstornosPanel");
  if (!container) return;
  const campaign = activeCampaign();
  const canEditEstornos = canEditCampaignData() && isAdminUnlocked();
  const rows = state.sellers.map((seller) => {
    const record = sellerClosingRecord(seller);
    return `<tr>
      <td><strong>${escapeHtml(record.name)}</strong><small>${escapeHtml(record.branch)} - ${escapeHtml(record.area)}</small></td>
      <td><input data-adjustment="quality" data-seller-id="${seller.id}" type="number" min="0" step="0.01" value="${record.estornoQuality}" ${canEditEstornos ? "" : "disabled"}></td>
      <td><input data-adjustment="insurance" data-seller-id="${seller.id}" type="number" min="0" step="0.01" value="${record.estornoInsurance}" ${canEditEstornos ? "" : "disabled"}></td>
      <td><input data-adjustment="carousel" data-seller-id="${seller.id}" type="number" min="0" step="0.01" value="${record.estornoCarousel}" ${canEditEstornos ? "" : "disabled"}></td>
      <td>${discountMoney(record.estornosTotal)}</td>
      <td>${money.format(record.commissionFinal)}</td>
      <td><span class="status ${record.estornosTotal ? "warn" : "neutral"}">${record.estornosTotal ? "Aplicado" : "Sem estorno"}</span></td>
    </tr>`;
  }).join("");
  const totals = state.sellers.reduce((acc, seller) => acc + sellerEstornos(seller).total, 0);
  container.innerHTML = `
    <div class="section-title inline-title">
      <div>
        <h3>Estornos</h3>
        <p>Informe descontos de Qualidade, Seguro e Carrossel antes do fechamento oficial.</p>
      </div>
      <span class="campaign-status-badge ${campaignStatusClass(campaign?.status)}">${campaignShortStatus(campaign?.status)}</span>
    </div>
    <div class="campaign-kpi-strip compact-strip">
      <span>Campanha<strong>${escapeHtml(campaign?.name || "-")}</strong></span>
      <span>Total de estornos<strong>${discountMoney(totals)}</strong></span>
      <span>Edicao<strong>${canEditEstornos ? "Liberada" : "Bloqueada"}</strong></span>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Vendedor</th><th>Qualidade</th><th>Seguro</th><th>Carrossel</th><th>Total estornos</th><th>Comissao final</th><th>Status</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="7">Nenhum vendedor nesta campanha.</td></tr>`}</tbody>
      </table>
    </div>
    <p class="admin-inline-note">Estornos sempre reduzem a comissao final. A edicao e bloqueada apos fechamento oficial.</p>
  `;
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
  const filters = ["Todos", "OK", "Alerta", "Ignorado", "Erro"].map((item) => `<button class="ghost-button compact-action ${filter === item ? "active" : ""}" data-partial-preview-filter="${item}" type="button">${item}</button>`).join("");
  return `<div class="partial-preview">
    <div class="campaign-kpi-strip compact-strip">
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
  const locked = campaign.status === CAMPAIGN_STATUS.OFFICIAL_CLOSED || campaign.status === CAMPAIGN_STATUS.OPERATIONAL_CLOSED;
  const partials = partialsForCampaign(campaign).sort((a, b) => Number(b.number) - Number(a.number) || String(b.importedAt).localeCompare(String(a.importedAt)));
  const rows = partials.map((partial) => {
    const summary = partial.summary || partialSummary(partial.items, partial.totalRows);
    return `<tr>
      <td>${escapeHtml(campaign.name)}</td>
      <td>${partial.number}</td>
      <td><strong>${escapeHtml(partial.name)}</strong><small>${escapeHtml(partial.baseDate || "-")}</small></td>
      <td>${partial.importedAt ? dateTime.format(new Date(partial.importedAt)) : "-"}</td>
      <td>${escapeHtml(partial.responsible || "Admin")}</td>
      <td><span class="status ${partialStatusClass(partial.status)}">${escapeHtml(partial.status)}</span></td>
      <td>${summary.sellers}</td>
      <td>${summary.metrics}</td>
      <td>${summary.totalRows}</td>
      <td>
        <button class="ghost-button compact-action" data-view-partial="${partial.id}" type="button">Visualizar</button>
        <button class="ghost-button compact-action" data-publish-partial="${partial.id}" type="button" ${partial.errorRows || partial.status === PARTIAL_STATUS.PUBLISHED ? "disabled" : ""}>Publicar</button>
        <button class="ghost-button compact-action" data-cancel-partial="${partial.id}" type="button" ${partial.status === PARTIAL_STATUS.CANCELED ? "disabled" : ""}>Cancelar</button>
        <button class="ghost-button compact-action" data-replace-partial="${partial.id}" type="button" ${partial.status !== PARTIAL_STATUS.PUBLISHED ? "disabled" : ""}>Substituida</button>
        <button class="danger-button compact-action" data-delete-draft-partial="${partial.id}" type="button" ${partial.status !== PARTIAL_STATUS.DRAFT ? "disabled" : ""}>Excluir</button>
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
    <div class="admin-section-grid single">
      <section class="admin-section-card">
        <div class="section-title">
          <h3>Importar parcial</h3>
          <p>Formato aceito: vendedor;filial;area;metrica;realizado</p>
        </div>
        <div class="period-admin-grid">
          <label>Campanha<input value="${escapeHtml(campaign.name)}" disabled></label>
          <label>Tipo<input value="Parcial" disabled></label>
          <label>Numero da parcial<input id="partialNumber" type="number" min="1" value="${nextPartialNumber()}"></label>
          <label>Nome da parcial<input id="partialName" placeholder="Parcial ${String(nextPartialNumber()).padStart(2, "0")}"></label>
          <label>Data base<input id="partialBaseDate" type="date" value="${new Date().toISOString().slice(0, 10)}"></label>
        </div>
        <div class="csv-import-layout">
          <div class="csv-dropzone" id="partialCsvDropzone"><strong>Selecionar CSV de parcial</strong><span>O arquivo sera validado antes de salvar.</span></div>
          <div class="csv-actions"><button id="selectPartialCsv" class="primary-button" type="button" ${locked ? "disabled" : ""}>Importar parcial</button><input id="partialCsvFile" type="file" accept=".csv,text/csv" hidden /></div>
        </div>
        ${locked ? `<p class="admin-inline-note warning">Esta campanha nao permite novas parciais neste status.</p>` : `<p class="admin-inline-note">A parcial publicada sera exibida para Dashboard, Filial e Vendedor; a simulacao permanece separada.</p>`}
      </section>
      <section class="admin-section-card">
        <div class="section-title"><h3>Previa da importacao</h3><p>Confira erros e alertas antes de publicar.</p></div>
        <div id="partialPreviewPanel">${partialPreviewMarkup(pendingPartialImport, { readOnly: Boolean(pendingPartialImport?._readOnly) })}</div>
      </section>
      <section class="admin-section-card">
        <div class="section-title"><h3>Parciais importadas</h3><p>Historico da campanha selecionada.</p></div>
        <div class="table-wrap"><table><thead><tr><th>Campanha</th><th>N.</th><th>Parcial</th><th>Importacao</th><th>Responsavel</th><th>Status</th><th>Vendedores</th><th>Metricas</th><th>Linhas</th><th>Acoes</th></tr></thead><tbody>${rows || `<tr><td colspan="10">Nenhuma parcial importada para esta campanha.</td></tr>`}</tbody></table></div>
      </section>
    </div>
  `;
}

function renderAdminClosingPanel() {
  const container = document.getElementById("adminClosingPanel");
  if (!container) return;
  const campaign = activeCampaign();
  const snapshot = buildCampaignSnapshot(campaign);
  const canAdminEdit = canEditCampaignData();
  container.innerHTML = `
    <div class="section-title inline-title">
      <div>
        <h3>Fechamento</h3>
        <p>Confira totais, estornos e gere o arquivo oficial de comissionamento.</p>
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
      <button id="reopenOperationalCampaign" class="ghost-button" type="button" ${![CAMPAIGN_STATUS.OPERATIONAL_CLOSED, CAMPAIGN_STATUS.ADMIN_CLOSING].includes(campaign?.status) || !canAdminEdit ? "disabled" : ""}>Descongelar campanha</button>
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

function renderAdminFilters() {
  const branchFilter = document.getElementById("adminBranchFilter");
  if (branchFilter) {
    const selected = branchFilter.value || "";
    branchFilter.innerHTML = `<option value="">Todas</option>${branches().map((branch) => `<option value="${escapeHtml(branch)}">${escapeHtml(branch)}</option>`).join("")}`;
    if ([...branchFilter.options].some((option) => option.value === selected)) branchFilter.value = selected;
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
  const invalid = Number(state.period.daysDone) > Number(state.period.daysTotal);
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
      <td><span class="status ${log.status === "Falha" ? "bad" : "ok"}">${escapeHtml(log.status)}</span></td>
      <td><button class="audit-row-button" data-audit-log-detail="${escapeHtml(log.id)}" type="button">Ver</button></td>
    </tr>
  `).join("") : `<tr><td colspan="8">Nenhum log encontrado para os filtros selecionados.</td></tr>`;
  renderAuditLogDetail(logs);
}

function exportAuditLogsCsv() {
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
  logUpdate({ action: "Exportou logs", module: "Seguranca", message: "Admin exportou logs de auditoria em CSV." }, { persist: true });
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
  if (["daysDone", "adminDaysDone", "adminPeriodMonth", "adminDaysTotal"].includes(target.id)) {
    return { action: "Alterou periodo da campanha", module: "Campanhas", itemName: activeCampaign()?.name || "", field: target.id, message: "Admin alterou dados do periodo da campanha." };
  }
  if (target.id === "partnerName") {
    return { action: "Alterou identidade do sistema", module: "Identidade", itemName: "Nome da parceira", field: "partnerName", message: "Admin alterou o nome da parceira/franquia." };
  }
  if (target.id === "newAdminPassword" || target.id === "newDashboardPassword") {
    const profile = target.id === "newAdminPassword" ? "Admin" : "Dashboard";
    return { type: "Seguranca", action: "Alterou senha de acesso", module: "Seguranca", itemName: `Senha ${profile}`, field: target.id, forceLog: target.value.trim().length >= 4, message: `Senha de acesso ${profile} alterada.` };
  }
  if (target.dataset.sellerExperience) {
    const seller = state.sellers.find((item) => item.id === target.dataset.sellerExperience);
    return { action: target.checked ? "Marcou vendedor em experiencia" : "Removeu vendedor de experiencia", module: "Vendedores", itemId: seller?.id || "", itemName: seller?.name || "", field: "emExperiencia", message: `Status de experiencia do vendedor ${seller?.name || ""} alterado.` };
  }
  if (target.dataset.sellerField) {
    const seller = state.sellers.find((item) => item.id === target.dataset.sellerId);
    const field = target.dataset.sellerField;
    const action = field === "password" ? "Alterou senha do vendedor" : "Editou vendedor";
    return { type: field === "password" ? "Seguranca" : "Atualizacao", action, module: "Vendedores", itemId: seller?.id || "", itemName: seller?.name || "", field, forceLog: field === "password", message: `Admin editou o vendedor ${seller?.name || ""}.` };
  }
  if (target.dataset.adjustment) {
    const seller = state.sellers.find((item) => item.id === target.dataset.sellerId);
    const label = estornoFields.find((item) => item.id === target.dataset.adjustment)?.label || target.dataset.adjustment;
    return { action: "Editou estornos", module: "Estornos", itemId: seller?.id || "", itemName: seller?.name || "", field: `Estorno ${label}`, message: `Admin alterou estorno ${label} do vendedor ${seller?.name || ""}.` };
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
  if (target.dataset.customMetricField) {
    const metric = state.customMetrics?.[target.dataset.customMetricArea]?.find((item) => item.id === target.dataset.customMetricId);
    return { action: "Editou meta", module: "Metas", itemId: metric?.id || "", itemName: metric?.name || "", field: target.dataset.customMetricField, message: `Admin editou a meta ${metric?.name || ""}.` };
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
    return { type: "Seguranca", action: "Alterou senha da filial", module: "Filiais", itemName: target.dataset.branchPassword, field: "Senha da filial", forceLog: true, message: `Senha da filial ${target.dataset.branchPassword} alterada.` };
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
  if ((target.matches("[data-seller-field], [data-adjustment], [data-metric-goal], [data-metric-realized], [data-custom-metric-field], [data-branch-name], [data-branch-password], [data-rule-at], [data-rule-rate], [data-deflator-field]") || ["daysDone", "adminDaysDone", "adminPeriodMonth", "adminDaysTotal"].includes(target.id)) && !canEditCampaignData()) return;
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
  renderAdminEstornosPanel();
  renderAdminPartialsPanel();
  renderAdminClosingPanel();
  renderAdminFilters();
  const adminPeriodMonth = document.getElementById("adminPeriodMonth");
  const adminDaysTotal = document.getElementById("adminDaysTotal");
  const adminDaysDone = document.getElementById("adminDaysDone");
  if (adminPeriodMonth) adminPeriodMonth.value = state.period.month;
  if (adminDaysTotal) adminDaysTotal.value = state.period.daysTotal;
  if (adminDaysDone) adminDaysDone.value = state.period.daysDone;
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
      <div class="seller-estornos-panel">
        <div class="seller-estornos-head"><strong>Estornos</strong><span>Valores descontados da comissao final.</span></div>
        <label>Qualidade<input data-adjustment="quality" data-seller-id="${seller.id}" type="number" min="0" step="0.01" placeholder="R$ 0,00" value="${sellerEstornos(seller).items.find((item) => item.id === "quality")?.value || 0}"></label>
        <label>Seguro<input data-adjustment="insurance" data-seller-id="${seller.id}" type="number" min="0" step="0.01" placeholder="R$ 0,00" value="${sellerEstornos(seller).items.find((item) => item.id === "insurance")?.value || 0}"></label>
        <label>Carrossel<input data-adjustment="carousel" data-seller-id="${seller.id}" type="number" min="0" step="0.01" placeholder="R$ 0,00" value="${sellerEstornos(seller).items.find((item) => item.id === "carousel")?.value || 0}"></label>
        <span class="seller-estornos-total">Total de estornos <strong>${discountMoney(sellerEstornos(seller).total)}</strong></span>
      </div>
      <label>Senha vendedor<input data-seller-field="password" data-seller-id="${seller.id}" type="text" value="${escapeHtml(seller.password || "1234")}"></label>
      <label class="checkbox-line"><input data-seller-experience="${seller.id}" type="checkbox" ${seller.emExperiencia ? "checked" : ""}> Vendedor em experiência</label>
      <button class="delete-seller-button" data-delete-seller="${seller.id}" type="button">Excluir vendedor</button>
    </div>
  `).join("") : `<p class="muted-note">Nenhum vendedor encontrado com os filtros atuais.</p>`;
  renderAdminMetrics();
  renderRules();
  renderBranchEditor();
  renderMetricCatalogEditor();
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
  const result = sellerResult(seller);
  summary.innerHTML = `Comissao bruta proj.: <strong>${money.format(result.projectedSubtotal)}</strong> | Deflator proj.: <strong>${money.format(result.projectedDeflator)}</strong> | Estornos: <strong>${discountMoney(result.estornos)}</strong> | Comissao final proj.: <strong>${money.format(result.projected)}</strong>`;
  body.innerHTML = metricsFor(seller.area).map((metric) => {
    const value = seller.values[metric.id];
    return `<tr>
      <td>${metric.name}</td>
      <td><input data-metric-goal="${metric.id}" type="number" value="${value.goal}"></td>
      <td><input data-metric-realized="${metric.id}" type="number" value="${value.realized}"></td>
      <td>${achievementPill(percentFor(seller, metric.id, false))}</td>
      <td>${num.format(projected(value.realized))}</td>
      <td>${achievementPill(percentFor(seller, metric.id, true))}</td>
    </tr>`;
  }).join("");
}

function renderRules() {
  const area = document.getElementById("ruleAreaSelect").value;
  document.getElementById("rulesEditor").innerHTML = metricsFor(area)
    .filter((metric) => metric.type !== "deviceRevenue")
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
  return metricsFor(area).map((metric) => `<option value="${metric.id}" ${metric.id === selectedId ? "selected" : ""}>${metric.name}</option>`).join("");
}

function renderMetricCatalogEditor() {
  const container = document.getElementById("metricCatalogEditor");
  if (!container) return;
  const allowReorder = canReorderMetrics();
  const lockMessage = metricOrderLockMessage();
  container.innerHTML = ["Cabo", "Nao Cabo"].map((area) => {
    const metrics = metricsFor(area);
    const rows = metrics.map((metric, index) => {
      const isCustom = metric.isCustom === true;
      const moveDisabledUp = !allowReorder || index === 0;
      const moveDisabledDown = !allowReorder || index === metrics.length - 1;
      return `
        <div class="metric-row metric-catalog-row ${isCustom ? "custom" : "system"}">
          <div class="metric-order-cell">
            <span>${metric.sortOrder}</span>
            <button class="ghost-button compact-action icon-order-button" data-move-metric-order="-1" data-metric-order-area="${area}" data-metric-order-id="${metric.id}" type="button" title="Mover para cima" aria-label="Mover ${escapeHtml(metric.name)} para cima" ${moveDisabledUp ? "disabled" : ""}>↑</button>
            <button class="ghost-button compact-action icon-order-button" data-move-metric-order="1" data-metric-order-area="${area}" data-metric-order-id="${metric.id}" type="button" title="Mover para baixo" aria-label="Mover ${escapeHtml(metric.name)} para baixo" ${moveDisabledDown ? "disabled" : ""}>↓</button>
          </div>
          <label>Indicador<input ${isCustom ? `data-custom-metric-field="name" data-custom-metric-area="${area}" data-custom-metric-id="${metric.id}"` : "disabled"} value="${escapeHtml(metric.name)}"></label>
          <label>Unidade<input ${isCustom ? `data-custom-metric-field="unit" data-custom-metric-area="${area}" data-custom-metric-id="${metric.id}"` : "disabled"} value="${escapeHtml(metric.unit || "Qtd.")}"></label>
          <label>Tipo
            <select ${isCustom ? `data-custom-metric-field="type" data-custom-metric-area="${area}" data-custom-metric-id="${metric.id}"` : "disabled"}>
              <option value="unit100" ${metric.type === "unit100" ? "selected" : ""}>Quantidade x taxa x 100</option>
              <option value="revenue" ${metric.type === "revenue" ? "selected" : ""}>Receita x taxa</option>
              <option value="deviceRevenue" ${metric.type === "deviceRevenue" ? "selected" : ""}>Receita de aparelho</option>
              <option value="deviceQty" ${metric.type === "deviceQty" ? "selected" : ""}>Quantidade de aparelho</option>
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

function branchMetricRows(sellers) {
  const byMetric = new Map();
  for (const seller of sellers) {
    ensureSellerValues(seller);
    for (const metric of metricsFor(seller.area).filter((item) => item.type !== "deviceRevenue")) {
      const key = `${seller.area}::${metric.id}`;
      const current = byMetric.get(key) || { id: metric.id, area: seller.area, name: `${metric.name} (${seller.area})`, goal: 0, realized: 0, projected: 0, hasGoal: false };
      const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
      current.goal += Number(value.goal) || 0;
      current.hasGoal = current.hasGoal || Number(value.goal) > 0;
      current.realized += Number(value.realized) || 0;
      current.projected += projected(value.realized);
      byMetric.set(key, current);
    }
  }
  return [...byMetric.values()].map((row) => ({
    ...row,
    currentPercent: row.goal ? row.realized / row.goal : null,
    projectedPercent: row.goal ? row.projected / row.goal : null,
    status: branchStatusFromPercent(row.goal ? row.realized / row.goal : 0),
  })).sort((a, b) => metricOrderIndex(a.area, a.id) - metricOrderIndex(b.area, b.id) || a.area.localeCompare(b.area));
}

function branchStatusFromPercent(percent) {
  if (percent >= 1) return { label: "Acima da meta", cls: "ok", action: "Acompanhamento" };
  if (percent >= 0.7) return { label: "Em atenção", cls: "warn", action: "Plano de ação" };
  return { label: "Crítico", cls: "bad", action: "Ação imediata" };
}

function sellerBranchSummary(seller) {
  const result = sellerResult(seller);
  const gross = result.projectedSubtotal;
  const estornos = result.estornos || 0;
  const final = result.projected;
  const currentPercent = totalAttainmentForSellers([seller], "current");
  const projectedPercent = totalAttainmentForSellers([seller], "projected");
  const status = seller.emExperiencia ? { label: "Em experiencia", cls: "neutral", action: "Acompanhamento" } : branchStatusFromPercent(currentPercent);
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
      const percent = metric ? percentFor(seller, metric.id, true) : 1;
      return {
        ...rule,
        metric,
        percent,
        triggered: Boolean(metric && min > 0 && percent < min),
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
    currentPercent: totalGoal ? realized / totalGoal : 0,
    projectedPercent: totalGoal ? projectedTotal / totalGoal : 0,
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
    ["Comissão final", money.format(totals.commissionFinal), `Bruta ${money.format(totals.commissionGross)} | Estornos ${discountMoney(totals.estornosTotal)}`, "money", null],
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
  return `<section class="branch-card-panel branch-team-panel"><div class="branch-card-head"><div><h3>Equipe da filial</h3><p>Comissão bruta, deflator, estornos e comissão final por vendedor.</p></div></div><div class="table-wrap branch-table-wrap"><table><thead><tr><th>Vendedor</th><th>Realizado</th><th>% atual</th><th>Projetado</th><th>% proj.</th><th>Comissão bruta</th><th>Deflator</th><th>Estornos</th><th>Comissão final</th><th>Status</th><th>Ações</th></tr></thead><tbody>${rows || `<tr><td colspan="11">Nenhum vendedor vinculado a esta filial.</td></tr>`}</tbody></table></div></section>`;
}

function branchSellerFilter(sellers) {
  const options = [`<option value="">Todos</option>`, ...sellers.map((seller) => `<option value="${seller.id}" ${seller.id === activeManagerSellerId ? "selected" : ""}>${escapeHtml(seller.name)}</option>`)];
  return `<section class="branch-card-panel branch-filter-panel"><label>Vendedor<select id="managerSellerFilter">${options.join("")}</select></label></section>`;
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

function sellerDeflatorImpactCard(seller) {
  const summary = sellerBranchSummary(seller);
  const preview = projectedDeflatorPreview(seller);
  const reason = preview.triggered[0]?.metric?.name ? `${preview.triggered[0].metric.name} abaixo da meta minima` : "Sem motivo de deflator";
  const list = preview.triggered.length ? preview.triggered.map((rule) => `<li>Deflator ${escapeHtml(rule.metric.name)}: -${pct.format(rule.rate)} (${pct.format(rule.percent)} atual proj.)</li>`).join("") : `<li>Nenhum deflator aplicado para este vendedor.</li>`;
  const ignored = preview.ignored ? `<p class="admin-inline-note warning">Aplicacao: ignorado por vendedor em experiencia.</p>` : "";
  return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Impacto dos deflatores</h3><p>Impacto financeiro previsto no resultado do vendedor.</p></div></div><div class="deflator-impact-grid"><span>Comissao bruta<strong>${money.format(summary.gross)}</strong></span><span>Deflator aplicado<strong>${preview.rate ? `-${pct.format(preview.rate)}` : "0,0%"}</strong></span><span>Impacto financeiro<strong>${money.format(preview.ignored ? preview.previewImpact : summary.deflator)}</strong></span><span>Comissao final projetada<strong>${money.format(summary.final)}</strong></span></div><strong class="deflator-reason">Motivo principal: ${escapeHtml(reason)}</strong><ul class="deflator-list">${list}</ul>${ignored}</section>`;
}

function sellerEstornoImpactCard(seller) {
  const summary = sellerBranchSummary(seller);
  const estornos = sellerEstornos(seller);
  const rows = estornos.items.map((item) => `<li>${escapeHtml(item.label)}: <strong>${discountMoney(item.value)}</strong></li>`).join("");
  if (!estornos.total) return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Estornos</h3><p>Valores descontados da comissao final.</p></div></div><p class="muted-note">Nenhum estorno aplicado.</p></section>`;
  return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Estornos</h3><p>Valores descontados da comissao final.</p></div></div><ul class="deflator-list">${rows}</ul><div class="deflator-impact-grid"><span>Total de estornos<strong>${discountMoney(estornos.total)}</strong></span><span>Comissao final<strong>${money.format(summary.final)}</strong></span></div></section>`;
}

function sellerRecommendedAction(seller) {
  const summary = sellerBranchSummary(seller);
  const preview = projectedDeflatorPreview(seller);
  const gaps = metricsFor(seller.area).filter((metric) => metric.type !== "deviceRevenue").map((metric) => {
    const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
    const missing = Math.max((Number(value.goal) || 0) - projected(value.realized), 0);
    return { metric, missing, percent: percentFor(seller, metric.id, true) };
  }).filter((item) => item.missing > 0).sort((a, b) => a.percent - b.percent).slice(0, 2);
  let text = "Ainda não há dados suficientes para gerar recomendação.";
  if (summary.currentPercent >= 1 && !preview.triggered.length) text = "O vendedor está acima da meta e sem deflatores aplicados. Mantenha o acompanhamento para proteger o resultado até o fechamento.";
  else if (summary.currentPercent < 0.7) text = `O vendedor está em situação crítica, com atingimento atual de ${pct.format(summary.currentPercent)}. Priorizar plano de ação nos indicadores ${gaps.map((item) => item.metric.name).join(" e ") || "com maior falta"}.`;
  else if (preview.triggered.length) text = `O vendedor está projetado para ${pct.format(summary.projectedPercent)}, porém possui deflator de -${pct.format(preview.rate)} causado por ${preview.triggered[0].metric.name}. A recuperação deste indicador pode elevar a comissão projetada para ${money.format(summary.gross)}.`;
  if (seller.emExperiencia && preview.triggered.length) text = `O vendedor está em experiência. Existe deflator previsto de -${pct.format(preview.rate)}, mas a aplicação está ignorada; acompanhe os indicadores ${preview.triggered.map((item) => item.metric.name).join(", ")} para evolução.`;
  return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Ação recomendada</h3><p>Orientação automática para atuação do gerente.</p></div></div><p class="recommended-action">${escapeHtml(text)}</p></section>`;
}

function sellerDetailPanel(seller) {
  if (!seller) return "";
  const summary = sellerBranchSummary(seller);
  return `<section class="branch-detail-grid"><section class="branch-card-panel wide"><div class="branch-card-head"><div><h3>Detalhamento por vendedor</h3><p>${escapeHtml(seller.name)} - ${escapeHtml(seller.branch)} - ${escapeHtml(seller.area)}</p></div></div><div class="seller-detail-kpis"><article><span>Realizado</span><strong>${money.format(summary.result.current)}</strong></article><article><span>% atual</span><strong>${pct.format(summary.currentPercent)}</strong></article><article><span>Projetado</span><strong>${money.format(summary.gross)}</strong></article><article><span>% projetado</span><strong>${pct.format(summary.projectedPercent)}</strong></article><article><span>Comissao bruta</span><strong>${money.format(summary.gross)}</strong></article><article><span>Deflator</span><strong>${money.format(summary.deflator)}</strong></article><article><span>Estornos</span><strong>${discountMoney(summary.estornos)}</strong></article><article><span>Comissao final</span><strong>${money.format(summary.final)}</strong></article><article><span>Status</span><strong><span class="status ${summary.status.cls}">${summary.status.label}</span></strong></article></div><div class="table-wrap branch-table-wrap"><table><thead><tr><th>Indicador</th><th>Meta</th><th>Realizado</th><th>% atual</th><th>Falta</th><th>Projetado</th><th>% projetado</th><th>Deflator</th><th>Status</th></tr></thead><tbody>${sellerIndicatorDetailRows(seller)}</tbody></table></div></section><div>${sellerDeflatorImpactCard(seller)}${sellerEstornoImpactCard(seller)}${sellerRecommendedAction(seller)}</div></section>`;
}

function branchAttentionPoints(sellers) {
  const points = [];
  for (const seller of sellers) {
    const summary = sellerBranchSummary(seller);
    const preview = projectedDeflatorPreview(seller);
    if (summary.currentPercent < 0.7) points.push({ cls: "bad", text: `${seller.name} - ${pct.format(summary.currentPercent)} da meta - Crítico` });
    else if (summary.currentPercent < 1) points.push({ cls: "warn", text: `${seller.name} - ${pct.format(summary.currentPercent)} da meta - Em atenção` });
    if (preview.triggered.length) points.push({ cls: preview.ignored ? "neutral" : "bad", text: `${seller.name} - Deflator -${pct.format(preview.rate)} - ${preview.triggered[0].metric.name} abaixo do minimo${preview.ignored ? " (ignorado)" : ""}` });
    if (summary.estornos > 0) points.push({ cls: "warn", text: `${seller.name} possui ${money.format(summary.estornos)} em estornos aplicados no fechamento.` });
    if (seller.emExperiencia) points.push({ cls: "neutral", text: `${seller.name} - Em experiencia - Deflator ignorado` });
  }
  return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Pontos de atenção</h3><p>Vendedores e indicadores que exigem ação.</p></div></div><div class="branch-attention-list">${points.slice(0, 8).map((point) => `<div class="attention-row ${point.cls}"><strong>${escapeHtml(point.text)}</strong></div>`).join("") || `<p class="muted-note">Nenhum ponto crítico identificado no momento.</p>`}</div></section>`;
}

function branchRankingCard(sellers) {
  const ranked = [...sellers].sort((a, b) => sellerBranchSummary(b).currentPercent - sellerBranchSummary(a).currentPercent).slice(0, 8);
  return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Ranking interno</h3><p>Ranking dos vendedores da filial.</p></div></div><div class="executive-list">${ranked.map((seller, index) => { const summary = sellerBranchSummary(seller); return `<div class="executive-list-row"><strong>${index + 1}</strong><span>${escapeHtml(seller.name)}<small>${pct.format(summary.currentPercent)} atual - ${pct.format(summary.projectedPercent)} proj.</small></span><em>${money.format(summary.final)}</em></div>`; }).join("") || `<p class="muted-note">Nenhum vendedor para ranking.</p>`}</div></section>`;
}

function branchIndicatorAchievementCard(sellers) {
  const rows = branchMetricRows(sellers);
  return `<section class="branch-card-panel wide"><div class="branch-card-head"><div><h3>Atingimento por indicador da filial</h3><p>Indicadores consolidados da filial.</p></div></div><div class="branch-indicator-list">${rows.map((row) => `<div class="branch-chart-row ${achievementClass(row.currentPercent)}"><div class="branch-chart-label"><strong>${escapeHtml(row.name)}</strong><span>${achievementPill(row.currentPercent)} ${achievementPill(row.projectedPercent)}</span></div><div class="branch-chart-track"><i style="width:${Math.min(140, Math.max(2, (row.currentPercent || 0) * 100))}%"></i></div><small>Meta ${num.format(row.goal)} | Realizado ${num.format(row.realized)} | Projetado ${num.format(row.projected)} | <span class="status ${row.status.cls}">${row.status.label}</span></small></div>`).join("") || `<p class="muted-note">Nenhum indicador encontrado.</p>`}</div></section>`;
}

function branchDeflatorSummary(sellers) {
  const rows = sellers.map((seller) => ({ seller, summary: sellerBranchSummary(seller), preview: projectedDeflatorPreview(seller) })).filter((row) => row.preview.rate > 0 || row.summary.deflator < 0);
  const totalImpact = rows.reduce((sum, row) => sum + (row.preview.ignored ? 0 : row.summary.deflator), 0);
  const reasonCounts = new Map();
  for (const row of rows) for (const trigger of row.preview.triggered) reasonCounts.set(trigger.metric.name, (reasonCounts.get(trigger.metric.name) || 0) + 1);
  const mainReason = [...reasonCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "Sem deflator";
  return `<section class="branch-card-panel wide"><div class="branch-card-head"><div><h3>Resumo dos deflatores</h3><p>${rows.length} vendedor${rows.length === 1 ? "" : "es"} com deflator aplicado ou previsto. Impacto financeiro total: ${money.format(totalImpact)}. Principal motivo: ${escapeHtml(mainReason)}.</p></div></div><div class="table-wrap branch-table-wrap"><table><thead><tr><th>Vendedor</th><th>Deflator</th><th>Motivo</th><th>Impacto</th><th>Status</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${escapeHtml(row.seller.name)}</td><td>-${pct.format(row.preview.rate)}</td><td>${escapeHtml(row.preview.triggered[0]?.metric?.name || "-")} abaixo do minimo</td><td>${money.format(row.preview.ignored ? 0 : row.summary.deflator)}</td><td><span class="status ${row.preview.ignored ? "neutral" : "bad"}">${row.preview.ignored ? "Ignorado por experiencia" : "Aplicado"}</span></td></tr>`).join("") || `<tr><td colspan="5">Nenhum deflator aplicado no momento.</td></tr>`}</tbody></table></div></section>`;
}

function branchOfficialPartialCard(branch, sellers) {
  const partial = latestPublishedPartial();
  if (!partial) return `<section class="branch-card-panel wide"><div class="branch-card-head"><div><h3>Resultado parcial da filial</h3><p>Nenhuma parcial publicada para esta campanha.</p></div></div></section>`;
  const sellerIds = new Set(sellers.map((seller) => seller.id));
  const items = partialItemsForBranch(partial, branch).filter((item) => !item.sellerId || sellerIds.has(item.sellerId));
  const rows = items.sort((a, b) => a.sellerName.localeCompare(b.sellerName) || metricOrderIndex(a.area, a.metricId) - metricOrderIndex(b.area, b.metricId)).map((item) => {
    const seller = sellers.find((candidate) => candidate.id === item.sellerId || normalizedKey(candidate.name) === normalizedKey(item.sellerName));
    const metric = seller ? metricsFor(seller.area).find((candidate) => candidate.id === item.metricId) : null;
    const goal = Number(seller?.values?.[item.metricId]?.goal ?? metric?.goal ?? 0) || 0;
    const percent = goal ? item.realized / goal : null;
    const status = branchStatusFromPercent(percent || 0);
    return `<tr><td>${escapeHtml(item.sellerName)}</td><td>${escapeHtml(item.metricName)}</td><td>${num.format(item.realized)}</td><td>${goal ? num.format(goal) : "-"}</td><td>${achievementPill(percent)}</td><td><span class="status ${status.cls}">${status.label}</span></td></tr>`;
  }).join("");
  return `<section class="branch-card-panel wide"><div class="branch-card-head"><div><h3>Resultado parcial da filial</h3><p>${escapeHtml(partial.name)} - data base ${escapeHtml(partial.baseDate || "-")}.</p></div><span class="status ok">${escapeHtml(partial.status)}</span></div><div class="table-wrap branch-table-wrap"><table><thead><tr><th>Vendedor</th><th>Metrica</th><th>Realizado parcial</th><th>Meta</th><th>% parcial</th><th>Status</th></tr></thead><tbody>${rows || `<tr><td colspan="6">Nenhum dado parcial para esta filial.</td></tr>`}</tbody></table></div></section>`;
}

function branchDashboardMarkup(branch, sellers) {
  const totals = branchTotals(sellers);
  const selectedSeller = sellers.find((seller) => seller.id === activeManagerSellerId) || null;
  if (!sellers.length) return `<div class="branch-modern"><div class="branch-title-row"><div><p class="eyebrow">Simulador operacional</p><h2>Painel da Filial</h2><span>${escapeHtml(branch)}</span></div>${moduleCampaignSelectorMarkup("filial")}</div><div class="dashboard-empty-state active"><strong>Nenhum dado disponivel para esta filial.</strong><span>Configure vendedores, metas e realizados no Admin para visualizar o painel.</span></div></div>`;
  return `<div class="branch-modern"><div class="branch-title-row"><div><p class="eyebrow">Simulador operacional</p><h2>Painel da Filial</h2><span>${escapeHtml(branch)}</span></div>${moduleCampaignSelectorMarkup("filial")}</div>${branchKpiCards(branch, sellers, totals)}${branchAlerts(sellers, totals)}${branchSellerFilter(sellers)}<div class="branch-main-grid"><div>${branchOfficialPartialCard(branch, sellers)}${branchTeamTable(sellers)}${sellerDetailPanel(selectedSeller)}${branchIndicatorAchievementCard(sellers)}${branchDeflatorSummary(sellers)}</div><aside>${branchAttentionPoints(sellers)}${branchRankingCard(sellers)}</aside></div></div>`;
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
    managerView?.classList.remove("manager-authenticated");
    if (topAccess) {
      topAccess.hidden = true;
      topAccess.innerHTML = "";
    }
    const options = state.branches.map((branch) => `<option value="${escapeHtml(branch)}">${escapeHtml(branch)}</option>`).join("");
    loginPanel.innerHTML = options ? `
      ${moduleCampaignSelectorMarkup("filial-login")}
      <label>Filial<select id="managerBranchSelect">${options}</select></label>
      <label>Senha<input id="managerPassword" type="password" placeholder="Senha da filial"></label>
      <span id="managerLoginError" class="form-error"></span>
      <button id="managerLogin" class="nav-button active" type="button">Entrar</button>
    ` : `${moduleCampaignSelectorMarkup("filial-login")}<div class="empty-state">Cadastre uma filial no Admin para liberar esta visao.</div>`;
    dashboard.innerHTML = `<div class="empty-state">A filial acessa somente o atingimento dos vendedores vinculados a ela.</div>`;
    return;
  }
  const sellers = state.sellers.filter((seller) => (seller.branch || "Sem filial") === activeBranchSession);
  if (activeManagerSellerId && !sellers.some((seller) => seller.id === activeManagerSellerId)) activeManagerSellerId = "";
  managerView?.classList.add("manager-authenticated");
  loginPanel.innerHTML = "";
  if (topAccess) {
    topAccess.hidden = document.body.dataset.view !== "gerente";
    topAccess.innerHTML = `<span>Filial</span><strong>${escapeHtml(activeBranchSession)}</strong><button id="managerLogout" class="ghost-button" type="button">Trocar filial</button>`;
  }
  dashboard.innerHTML = branchDashboardMarkup(activeBranchSession, sellers);
}

function selectedCollabSeller() {
  const id = activeCollaboratorId || document.getElementById("collabSellerSelect").value || state.sellers[0]?.id;
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
    stamp.innerHTML = `
      <strong>Relatório do vendedor</strong>
      <span>${seller.name} - ${seller.branch} - ${seller.area}</span>
      <span>Mês: ${state.period.month} | Dias realizados: ${state.period.daysDone} | Dias úteis: ${state.period.daysTotal}</span>
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
    <div class="hero-number"><span>Comissão final proj.</span><strong>${money.format(result.projected)}</strong></div>
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
    const goal = Number(value.goal) || 0;
    const realized = Number(value.realized) || 0;
    const projectedValue = projected(realized);
    const currentPercent = goal ? realized / goal : null;
    const projectedPercent = goal ? projectedValue / goal : null;
    const missing = Math.max(goal - realized, 0);
    const status = branchStatusFromPercent(currentPercent || 0);
    return {
      metric,
      goal,
      realized,
      projectedValue,
      currentPercent,
      projectedPercent,
      missing,
      status,
      commission: metricCommission(seller, metric, "projected"),
      deflator: metricDeflatorLabel(seller, metric),
    };
  });
  const totals = rows.reduce((acc, row) => {
    acc.goal += row.goal;
    acc.realized += row.realized;
    acc.projected += row.projectedValue;
    acc.missing += row.missing;
    acc.commission += row.commission;
    return acc;
  }, { goal: 0, realized: 0, projected: 0, missing: 0, commission: 0 });
  totals.currentPercent = totals.goal ? totals.realized / totals.goal : null;
  totals.projectedPercent = totals.goal ? totals.projected / totals.goal : null;
  totals.status = branchStatusFromPercent(totals.currentPercent || 0);
  return { rows, totals };
}

function collaboratorSummary(seller) {
  const result = sellerResult(seller);
  const metrics = collaboratorMetricRows(seller);
  const gross = result.projectedSubtotal;
  const estornos = result.estornos || 0;
  const final = result.projected;
  const preview = projectedDeflatorPreview(seller);
  const status = seller.emExperiencia ? { label: "Em experiencia", cls: "neutral", action: "Acompanhamento" } : branchStatusFromPercent(metrics.totals.currentPercent || 0);
  return { result, metrics, gross, estornos, final, preview, status, currentPercent: metrics.totals.currentPercent || 0, projectedPercent: metrics.totals.projectedPercent || 0 };
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
  const weak = [...summary.metrics.rows].filter((row) => row.goal > 0).sort((a, b) => (a.currentPercent || 0) - (b.currentPercent || 0)).slice(0, 2);
  const missingTotal = Math.ceil(summary.metrics.totals.missing || 0);
  if (!summary.metrics.rows.length) return "Ainda não há dados suficientes para gerar uma orientação.";
  if (summary.preview.triggered.length && !summary.preview.ignored) return `Você possui deflator aplicado no momento. Atue no indicador ${summary.preview.triggered[0].metric.name} para recuperar parte da comissão.`;
  if (summary.projectedPercent >= 1 && summary.currentPercent >= 1) return "Você está acima da meta. Continue protegendo seus indicadores para evitar deflatores.";
  if (summary.projectedPercent < 1) return `Atenção: sua projeção está abaixo da meta. Priorize ${weak.map((item) => item.metric.name).join(" e ") || "os indicadores críticos"} para recuperar sua comissão.`;
  return `Faltam ${num.format(missingTotal)} pontos de meta para atingir 100%. Mantenha o ritmo atual para alcançar sua projeção.`;
}

function collaboratorOpportunity(seller) {
  const summary = collaboratorSummary(seller);
  const weak = [...summary.metrics.rows].filter((row) => row.goal > 0).sort((a, b) => (a.projectedPercent || 0) - (b.projectedPercent || 0))[0];
  if (!summary.metrics.rows.length) return "Ainda não há dados suficientes para calcular oportunidades de ganho.";
  if (summary.preview.triggered.length) {
    const trigger = summary.preview.triggered[0];
    const value = seller.values[trigger.metric.id] || { goal: trigger.metric.goal, realized: 0 };
    const neededProjected = Math.ceil((Number(value.goal) || 0) * (Number(trigger.min) || 0));
    const needed = Math.max(neededProjected - projected(value.realized), 0);
    return `Venda mais ${num.format(needed)} em ${trigger.metric.name} para remover o deflator de -${pct.format(summary.preview.rate)}. Isso pode aumentar sua comissão projetada em ${money.format(Math.abs(summary.preview.previewImpact))}.`;
  }
  if (summary.currentPercent >= 1) return "Você está acima da meta e sem deflatores. Continue mantendo o ritmo até o fechamento.";
  return `Seu melhor caminho é acelerar ${weak?.metric?.name || "os indicadores abaixo da meta"}, que está abaixo do ritmo necessário para atingir a meta.`;
}

function collaboratorKpiMarkup(seller) {
  const summary = collaboratorSummary(seller);
  const progress = Math.max(0, Math.min(100, summary.currentPercent * 100));
  return `<section class="collab-card collab-main-kpi"><div class="collab-card-head"><h3>Minha comissao estimada</h3><span class="status ${summary.status.cls}">${summary.status.label}</span></div><strong class="collab-money">${money.format(summary.final)}</strong><div class="collab-kpi-line"><span>Atingimento atual: <b>${pct.format(summary.currentPercent)}</b></span><span>Atingimento projetado: <b>${pct.format(summary.projectedPercent)}</b></span></div><div class="collab-commission-breakdown"><span>Comissao bruta <strong>${money.format(summary.gross)}</strong></span><span>Deflatores <strong>${money.format(summary.result.projectedDeflator)}</strong></span><span>Estornos <strong>${discountMoney(summary.estornos)}</strong></span><span>Comissao final <strong>${money.format(summary.final)}</strong></span></div><div class="collab-progress"><span style="width:${progress}%"></span></div><div class="collab-progress-meta"><small>${pct.format(summary.currentPercent)} atual</small><small>Meta 100%</small></div></section>`;
}

function collaboratorMonthMarkup() {
  const done = Number(state.period.daysDone) || 0;
  const total = Number(state.period.daysTotal) || 0;
  const percent = total ? done / total : 0;
  return `<section class="collab-card collab-month-card"><div class="collab-card-head"><h3>Resumo do mês</h3><span>${total ? pct.format(percent) : "-"}</span></div><div class="collab-month-grid"><span>Mês<strong>${escapeHtml(state.period.month)}</strong></span><span>Dias realizados<strong>${num.format(done)}</strong></span><span>Dias úteis<strong>${num.format(total)}</strong></span><span>Período concluído<strong>${total ? pct.format(percent) : "-"}</strong></span></div></section>`;
}

function collaboratorDeflatorMarkup(seller) {
  const summary = collaboratorSummary(seller);
  const items = summary.preview.triggered.map((item) => `<li>Deflator ${escapeHtml(item.metric.name)}: -${pct.format(item.rate)} | Motivo: abaixo de ${pct.format(item.min)}</li>`).join("");
  if (seller.emExperiencia && summary.preview.triggered.length) return `<section class="collab-card collab-deflator-card"><div class="collab-card-head"><h3>Deflatores</h3><span class="status neutral">Ignorado</span></div><p><strong>Vendedor em experiencia.</strong> Deflator previsto: -${pct.format(summary.preview.rate)}.</p><p>Aplicacao: ignorado por periodo de experiencia.</p><p>Estornos aplicados: <strong>${discountMoney(summary.estornos)}</strong></p><p>Comissao final: <strong>${money.format(summary.final)}</strong></p><ul>${items}</ul></section>`;
  if (summary.preview.triggered.length) return `<section class="collab-card collab-deflator-card"><div class="collab-card-head"><h3>Deflatores</h3><span class="status bad">Aplicado</span></div><p>Deflator aplicado: <strong>-${pct.format(summary.preview.rate)}</strong></p><p>Impacto financeiro: <strong>${money.format(summary.result.projectedDeflator)}</strong></p><p>Comissao bruta: <strong>${money.format(summary.gross)}</strong></p><p>Estornos: <strong>${discountMoney(summary.estornos)}</strong></p><p>Comissao final: <strong>${money.format(summary.final)}</strong></p><ul>${items}</ul></section>`;
  return `<section class="collab-card collab-deflator-card"><div class="collab-card-head"><h3>Deflatores</h3><span class="status ok">Sem desconto</span></div><p>Nenhum deflator aplicado no momento.</p><p>Sua comissao projetada nao possui desconto de deflator.</p></section>`;
}

function collaboratorEstornosMarkup(seller) {
  const summary = collaboratorSummary(seller);
  const estornos = sellerEstornos(seller);
  if (!estornos.total) return `<section class="collab-card collab-estornos-card"><div class="collab-card-head"><h3>Estornos</h3><span class="status ok">Sem estorno</span></div><p>Nenhum estorno aplicado.</p></section>`;
  return `<section class="collab-card collab-estornos-card"><div class="collab-card-head"><h3>Estornos</h3><span class="status warn">Desconto</span></div><dl class="estorno-breakdown">${estornos.items.map((item) => `<dt>${escapeHtml(item.label)}</dt><dd>${discountMoney(item.value)}</dd>`).join("")}<dt>Total de estornos</dt><dd><strong>${discountMoney(estornos.total)}</strong></dd><dt>Comissao final</dt><dd><strong>${money.format(summary.final)}</strong></dd></dl></section>`;
}

function collaboratorOfficialPartialMarkup(seller) {
  const partial = latestPublishedPartial();
  if (!partial) return `<section class="collab-card collab-official-partial-card"><div class="collab-card-head"><h3>Resultado parcial oficial</h3><span class="status neutral">Indisponivel</span></div><p>Resultado parcial oficial ainda nao disponivel para esta campanha.</p></section>`;
  const items = partialItemsForSeller(partial, seller);
  if (!items.length) return `<section class="collab-card collab-official-partial-card"><div class="collab-card-head"><h3>Resultado parcial oficial</h3><span class="status neutral">${escapeHtml(partial.name)}</span></div><p>Nao ha resultado parcial publicado para este vendedor.</p></section>`;
  const rows = items.map((item) => {
    const metric = metricsFor(seller.area).find((candidate) => candidate.id === item.metricId);
    const goal = Number(seller.values?.[item.metricId]?.goal ?? metric?.goal ?? 0) || 0;
    const percent = goal ? item.realized / goal : null;
    const status = branchStatusFromPercent(percent || 0);
    return `<tr><td>${escapeHtml(item.metricName)}</td><td>${goal ? num.format(goal) : "-"}</td><td>${num.format(item.realized)}</td><td>${achievementPill(percent)}</td><td><span class="status ${status.cls}">${status.label}</span></td></tr>`;
  }).join("");
  return `<section class="collab-card collab-official-partial-card">
    <div class="collab-card-head"><div><h3>Resultado parcial oficial</h3><p>Este e o resultado parcial oficial importado pela empresa.</p></div><span class="status ok">${escapeHtml(partial.status)}</span></div>
    <div class="collab-month-grid"><span>Campanha<strong>${escapeHtml(partial.campaignName || activeCampaign()?.name || "-")}</strong></span><span>Parcial<strong>${escapeHtml(partial.name)}</strong></span><span>Data base<strong>${escapeHtml(partial.baseDate || "-")}</strong></span><span>Importado em<strong>${partial.importedAt ? dateTime.format(new Date(partial.importedAt)) : "-"}</strong></span></div>
    <div class="table-wrap collab-table-wrap"><table><thead><tr><th>Indicador</th><th>Meta</th><th>Realizado oficial</th><th>% parcial</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
    <button class="ghost-button compact-action" data-use-partial-simulation="${partial.id}" type="button" ${isCampaignOperationLocked() ? "disabled" : ""}>Usar parcial como base da simulacao</button>
  </section>`;
}

function collaboratorIndicatorTable(seller) {
  const { rows, totals } = collaboratorMetricRows(seller);
  const locked = isCampaignOperationLocked();
  const disabled = locked ? "disabled" : "";
  const body = rows.map((row) => `<tr><td>${escapeHtml(row.metric.name)}</td><td>${num.format(row.goal)}</td><td><input data-collab-realized="${row.metric.id}" type="number" value="${row.realized}" ${disabled}></td><td>${achievementPill(row.currentPercent)}</td><td>${num.format(row.missing)}</td><td>${num.format(row.projectedValue)}</td><td>${achievementPill(row.projectedPercent)}</td><td>${money.format(row.commission)}</td><td>${escapeHtml(row.deflator)}</td><td><span class="status ${row.status.cls}">${row.status.label}</span></td></tr>`).join("");
  const cards = rows.map((row) => `<article class="collab-indicator-card"><div><strong>${escapeHtml(row.metric.name)}</strong><span class="status ${row.status.cls}">${row.status.label}</span></div><dl><dt>Meta</dt><dd>${num.format(row.goal)}</dd><dt>Realizado</dt><dd><input data-collab-realized="${row.metric.id}" type="number" value="${row.realized}" ${disabled}></dd><dt>% atual</dt><dd>${pct.format(row.currentPercent || 0)}</dd><dt>Falta</dt><dd>${num.format(row.missing)}</dd><dt>Projetado</dt><dd>${num.format(row.projectedValue)}</dd><dt>% projetado</dt><dd>${pct.format(row.projectedPercent || 0)}</dd><dt>Comissão</dt><dd>${money.format(row.commission)}</dd><dt>Deflator</dt><dd>${escapeHtml(row.deflator)}</dd></dl></article>`).join("");
  const helper = locked ? "Esta campanha esta encerrada e nao permite novas alteracoes." : "Use esta area para simular cenarios. A simulacao nao altera o resultado parcial oficial.";
  const note = locked ? `<p class="admin-inline-note warning">Esta campanha esta encerrada e nao permite novas alteracoes.</p>` : "";
  return `<section class="collab-card collab-results-card"><div class="collab-card-head"><h3>Minha simulacao</h3><p>${helper}</p></div>${note}<div class="table-wrap collab-table-wrap"><table><thead><tr><th>Indicador</th><th>Meta</th><th>Realizado</th><th>% atual</th><th>Falta</th><th>Projetado</th><th>% projetado</th><th>Comissão</th><th>Deflator</th><th>Status</th></tr></thead><tbody>${body}<tr class="total-row"><td>Total</td><td>${num.format(totals.goal)}</td><td>${num.format(totals.realized)}</td><td>${achievementPill(totals.currentPercent)}</td><td>${num.format(totals.missing)}</td><td>${num.format(totals.projected)}</td><td>${achievementPill(totals.projectedPercent)}</td><td>${money.format(collaboratorSummary(seller).final)}</td><td>-</td><td><span class="status ${totals.status.cls}">${totals.status.label}</span></td></tr></tbody></table></div><div class="collab-indicator-cards">${cards}</div></section>`;
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
  return `<section class="collab-card collab-scenario-card"><div class="collab-card-head"><h3>Simular novo cenário</h3><span>${diff >= 0 ? "+" : ""}${money.format(diff)}</span></div><div class="collab-scenario-grid"><span>Cenário atual<strong>${money.format(current)}</strong></span><span>Cenário simulado<strong>${money.format(simulated)}</strong></span><span>Novo % projetado<strong>${pct.format(summary.projectedPercent)}</strong></span><span>Deflator previsto<strong>${summary.preview.rate ? `-${pct.format(summary.preview.rate)}` : "Sem deflator"}</strong></span></div><p>Altere os valores em Resultado por indicador para atualizar automaticamente o cenário.</p></section>`;
}

function collaboratorReportHtml(seller) {
  const summary = collaboratorSummary(seller);
  const rows = collaboratorMetricRows(seller);
  const estornos = sellerEstornos(seller);
  const exportedAt = dateTime.format(new Date());
  const campaign = activeCampaign();
  const campaignStatus = campaignShortStatus(campaign?.status);
  const deflatorText = summary.preview.triggered.length ? `Deflator aplicado: -${pct.format(summary.preview.rate)} | Impacto financeiro: ${money.format(summary.result.projectedDeflator)} | Comissão bruta: ${money.format(summary.gross)} | Estornos: ${discountMoney(summary.estornos)} | Comissão final: ${money.format(summary.final)}` : "Nenhum deflator aplicado no momento.";
  const experienceText = seller.emExperiencia && summary.preview.triggered.length ? "Vendedor em experiência - deflator previsto ignorado." : "";
  const estornoText = estornos.total ? estornos.items.map((item) => `${item.label}: ${discountMoney(item.value)}`).join(" | ") + ` | Total de estornos: ${discountMoney(estornos.total)}` : "Nenhum estorno aplicado.";
  const tableRows = rows.rows.map((row) => `<tr><td>${escapeHtml(row.metric.name)}</td><td>${num.format(row.goal)}</td><td>${num.format(row.realized)}</td><td>${pct.format(row.currentPercent || 0)}</td><td>${num.format(row.missing)}</td><td>${num.format(row.projectedValue)}</td><td>${pct.format(row.projectedPercent || 0)}</td><td>${money.format(row.commission)}</td><td>${escapeHtml(row.deflator)}</td><td>${row.status.label}</td></tr>`).join("");
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
      <span>Dias realizados<strong>${num.format(state.period.daysDone)}</strong></span>
      <span>Dias &uacute;teis<strong>${num.format(state.period.daysTotal)}</strong></span>
      <span>Status campanha<strong>${escapeHtml(campaignStatus)}</strong></span>
    </section>
    <section class="report-summary">
      <span>Comiss&atilde;o estimada<strong>${money.format(summary.final)}</strong></span>
      <span>Comiss&atilde;o bruta<strong>${money.format(summary.gross)}</strong></span>
      <span>Deflatores<strong>${money.format(summary.result.projectedDeflator)}</strong></span>
      <span>Estornos<strong>${discountMoney(summary.estornos)}</strong></span>
      <span>Comiss&atilde;o final<strong>${money.format(summary.final)}</strong></span>
      <span>Status performance<strong>${escapeHtml(summary.status.label)}</strong></span>
      <span>Atingimento atual<strong>${pct.format(summary.currentPercent)}</strong></span>
      <span>Atingimento projetado<strong>${pct.format(summary.projectedPercent)}</strong></span>
    </section>
    <table class="print-table">
      <thead><tr><th>Indicador</th><th>Meta</th><th>Realizado</th><th>% atual</th><th>Falta</th><th>Projetado</th><th>% projetado</th><th>Comiss&atilde;o</th><th>Deflator</th><th>Status</th></tr></thead>
      <tbody>${tableRows}<tr class="total-row"><td>Total</td><td>${num.format(rows.totals.goal)}</td><td>${num.format(rows.totals.realized)}</td><td>${pct.format(rows.totals.currentPercent || 0)}</td><td>${num.format(rows.totals.missing)}</td><td>${num.format(rows.totals.projected)}</td><td>${pct.format(rows.totals.projectedPercent || 0)}</td><td>${money.format(summary.final)}</td><td>-</td><td>${escapeHtml(rows.totals.status.label)}</td></tr></tbody>
    </table>
    <section class="print-notes">
      <div class="report-block"><h2>Deflatores</h2><p>${escapeHtml(experienceText || deflatorText)}</p></div>
      <div class="report-block"><h2>Estornos</h2><p>${escapeHtml(estornoText)}</p></div>
      <div class="report-block"><h2>Orienta&ccedil;&atilde;o</h2><p>${escapeHtml(collaboratorGuidance(seller))}</p></div>
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
  const reportHtml = collaboratorReportHtml(seller);
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
  if (!seller || !dashboard) return;
  accessCard?.classList.toggle("is-authenticated", activeCollaboratorId === seller.id);
  if (activeCollaboratorId !== seller.id) {
    document.getElementById("collabHero").innerHTML = collaboratorLoginMarkup(seller);
    dashboard.innerHTML = `<section class="collab-empty-state">Selecione um vendedor e informe a senha para visualizar seu desempenho.</section>`;
    return;
  }
  ensureSellerValues(seller);
  document.getElementById("collabHero").innerHTML = `<div class="collab-login-identity"><span>Vendedor</span><strong>${escapeHtml(seller.name)}</strong><small>${escapeHtml(seller.branch)} - ${escapeHtml(seller.area)}</small></div><button id="collabLogout" class="ghost-button compact-action" type="button">Trocar</button>`;
  dashboard.innerHTML = `
    <div class="collab-top-grid">${collaboratorKpiMarkup(seller)}${collaboratorGuidanceMarkup(seller)}</div>
    <div class="collab-mid-grid">${collaboratorMonthMarkup()}${collaboratorDeflatorMarkup(seller)}${collaboratorEstornosMarkup(seller)}</div>
    ${collaboratorOfficialPartialMarkup(seller)}
    ${collaboratorIndicatorTable(seller)}
    <div class="collab-bottom-grid">${collaboratorOpportunityMarkup(seller)}${collaboratorScenarioMarkup(seller)}</div>
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
  document.getElementById("periodMonthDisplay").textContent = state.period.month;
  document.getElementById("daysDone").value = state.period.daysDone;
  document.getElementById("daysTotalDisplay").textContent = state.period.daysTotal;
  safeRender("dashboard", renderDashboard);
  safeRender("filial", renderManager);
  safeRender("admin", renderAdmin);
  safeRender("colaborador", renderCollaborator);
  safeRender("acoes", updateActionVisibility);
}

function updateSeller(id, field, value) {
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

  if (event.target.id === "operationalCloseCampaign") {
    const campaign = activeCampaign();
    if (!campaign || campaign.status !== CAMPAIGN_STATUS.OPEN) return;
    if (!confirm("Voce esta encerrando esta campanha para operacao. Vendedores e filiais nao poderao mais alterar ou simular resultados desta campanha. Deseja continuar?")) return;
    syncActiveCampaignFromRoot();
    campaign.status = CAMPAIGN_STATUS.OPERATIONAL_CLOSED;
    campaign.operationalCloseDate = campaign.operationalCloseDate || new Date().toISOString().slice(0, 10);
    logUpdate({
      action: "Encerrou campanha operacionalmente",
      module: "Campanhas",
      campaignId: campaign.id,
      campaignName: campaign.name,
      itemName: campaign.name,
      newValue: campaign.status,
      message: `Campanha ${campaign.name} encerrada operacionalmente.`,
    });
    saveState("Campanha encerrada operacionalmente");
    renderAll();
    return;
  }

  if (event.target.id === "reopenOperationalCampaign") {
    const campaign = activeCampaign();
    if (!campaign || ![CAMPAIGN_STATUS.OPERATIONAL_CLOSED, CAMPAIGN_STATUS.ADMIN_CLOSING].includes(campaign.status)) return;
    if (!confirm("Voce esta descongelando esta campanha. Vendedores e filiais voltarao a poder alterar e simular resultados. Os estornos ja lancados serao mantidos. Deseja continuar?")) return;
    syncActiveCampaignFromRoot();
    campaign.status = CAMPAIGN_STATUS.OPEN;
    campaign.operationalCloseDate = "";
    campaign.updatedAt = new Date().toISOString();
    logUpdate({
      action: "Descongelou campanha",
      module: "Campanhas",
      campaignId: campaign.id,
      campaignName: campaign.name,
      itemName: campaign.name,
      newValue: campaign.status,
      message: `Campanha ${campaign.name} descongelada e reaberta para operacao.`,
    });
    saveState("Campanha descongelada");
    renderAll();
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

  const protectedMutation = event.target.closest("#savePeriodAdmin,#addBranch,[data-delete-branch],[data-add-custom-metric],[data-delete-custom-metric],[data-add-deflator],[data-delete-deflator],#addSeller,[data-delete-seller],#resetData,#importGoalSheet,#goalSheetDropzone,#importData,#adminImportBackup,#adminRestoreDefault");
  if (protectedMutation && !canEditCampaignData()) {
    alert("Esta campanha esta fechada oficialmente e nao permite alteracoes.");
    return;
  }

  const goalSheetDropzone = event.target.closest("#goalSheetDropzone");
  if (goalSheetDropzone) {
    document.getElementById("goalSheetFile")?.click();
  }

  if (event.target.id === "savePeriodAdmin") {
    if (Number(state.period.daysTotal) <= 0) {
      alert("Dias úteis deve ser maior que zero.");
      return;
    }
    if (Number(state.period.daysDone) > Number(state.period.daysTotal)) {
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
    if (!confirm("Voce esta publicando esta parcial para consulta dos vendedores, filiais e dashboard. A simulacao dos vendedores continuara separada e nao sera alterada. Deseja continuar?")) return;
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
    document.getElementById("importData")?.click();
  }

  if (event.target.id === "adminExportBackup") {
    document.getElementById("exportData")?.click();
  }

  if (event.target.id === "adminRestoreDefault") {
    document.getElementById("resetData")?.click();
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
    state.customMetrics[area].push({ id, name: "NOVA META", unit: "Qtd.", type: "unit100", goal: 1 });
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

  const deleteMetricButton = event.target.closest("[data-delete-custom-metric]");
  if (deleteMetricButton) {
    const area = deleteMetricButton.dataset.customMetricArea;
    const metricId = deleteMetricButton.dataset.deleteCustomMetric;
    const metric = state.customMetrics[area]?.find((item) => item.id === metricId);
    if (!confirm("Excluir este item de meta?")) return;
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
    sessionStorage.removeItem(BRANCH_SESSION_KEY);
    renderAll();
  }
  const managerSellerDetail = event.target.closest("[data-manager-seller-detail]");
  if (managerSellerDetail) {
    activeManagerSellerId = managerSellerDetail.dataset.managerSellerDetail || "";
    renderManager();
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
    if (!confirm(`Excluir o vendedor ${seller.name}?`)) return;
    state.sellers = state.sellers.filter((item) => item.id !== sellerId);
    if (activeCollaboratorId === sellerId) {
      activeCollaboratorId = "";
      sessionStorage.removeItem(COLLAB_SESSION_KEY);
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
  if (event.target.id === "resetData" && confirm("Restaurar os dados padrao?")) {
    const auditLogs = normalizeAuditLogs(state.auditLogs);
    state = seedState();
    state.auditLogs = auditLogs;
    logUpdate({
      action: "Restaurou padrao",
      module: "Importacao / Backup",
      message: "Dados padrao restaurados. Logs de auditoria preservados.",
    });
    saveState();
    renderAll();
  }

  if (event.target.id === "importData") {
    document.getElementById("importDataFile").click();
  }

  if (event.target.id === "exportData") {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `simulador-comissao-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    updateSaveStatus("Backup exportado");
    logUpdate({ action: "Exportou backup", module: "Importacao / Backup", message: "Backup JSON exportado." }, { persist: true });
  }

  if (event.target.id === "exportCollaboratorPdf") {
    const seller = selectedCollabSeller();
    logUpdate({
      action: "Exportou relatorio do vendedor",
      module: "Vendedor",
      itemId: seller?.id || "",
      itemName: seller?.name || "",
      sellerName: seller?.name || "",
      branchName: seller?.branch || "",
      message: seller ? `Relatorio do vendedor ${seller.name} exportado em PDF.` : "Tentativa de exportar relatorio do vendedor.",
    }, { persist: true });
    prepareCollaboratorPdfExport();
  }

  if (event.target.id === "collabLogin") {
    const seller = selectedCollabSeller();
    const typed = document.getElementById("collabPassword").value;
    if (seller && typed === String(seller.password || "1234")) {
      activeCollaboratorId = seller.id;
      sessionStorage.setItem(COLLAB_SESSION_KEY, seller.id);
      renderAll();
    } else {
      document.getElementById("collabLoginError").textContent = "Senha inválida ou acesso não autorizado.";
    }
  }

  if (event.target.id === "collabLogout") {
    activeCollaboratorId = "";
    sessionStorage.removeItem(COLLAB_SESSION_KEY);
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
      if (!item.metricId) continue;
      ensureSellerValues(seller);
      seller.values[item.metricId] = seller.values[item.metricId] || { goal: 0, realized: 0 };
      seller.values[item.metricId].realized = Number(item.realized) || 0;
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
    activeCollaboratorId = "";
    activeBranchSession = "";
    activeManagerSellerId = "";
    sessionStorage.removeItem(COLLAB_SESSION_KEY);
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
  recordAuditFieldChange(event.target);
}, true);

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target.id === "auditSearch") {
    renderAuditLogs();
    return;
  }
  const protectedInput = target.matches("[data-seller-field], [data-adjustment], [data-metric-goal], [data-metric-realized], [data-custom-metric-field], [data-branch-name], [data-branch-password], [data-rule-at], [data-rule-rate], [data-deflator-field]") ||
    ["daysDone", "adminDaysDone", "adminPeriodMonth", "adminDaysTotal"].includes(target.id);
  if (protectedInput && !canEditCampaignData()) {
    alert("Esta campanha esta fechada oficialmente e nao permite alteracoes.");
    renderAll();
    return;
  }
  if (target.dataset.collabRealized && isCampaignOperationLocked()) {
    alert("Esta campanha esta encerrada e nao permite novas alteracoes.");
    renderCollaborator();
    return;
  }
  if (target.id === "daysDone" && isCampaignOperationLocked() && document.body.dataset.view !== "admin") {
    alert("Esta campanha esta encerrada e nao permite novas alteracoes.");
    renderAll();
    return;
  }
  if (target.dataset.campaignField) {
    const campaign = activeCampaign();
    if (!campaign) return;
    if (isCampaignOfficialClosed(campaign) && !isOwnerUnlocked()) {
      alert("Esta campanha esta fechada oficialmente e nao permite alteracoes.");
      renderCampaignAdminPanel();
      return;
    }
    campaign[target.dataset.campaignField] = target.value;
    if (target.dataset.campaignField === "reference") {
      campaign.period.month = target.value;
      state.period.month = target.value;
    }
    campaign.updatedAt = new Date().toISOString();
    saveState("Campanha atualizada");
    renderCampaignSelectors();
    return;
  }
  if (target.id === "daysDone" || target.id === "adminDaysDone") state.period.daysDone = Number(target.value) || 0;
  if (target.id === "adminPeriodMonth") state.period.month = target.value;
  if (target.id === "adminDaysTotal") state.period.daysTotal = Number(target.value) || 1;
  if (target.id === "daysDone" || target.id === "adminDaysDone" || target.id === "adminPeriodMonth" || target.id === "adminDaysTotal") {
    saveState();
    document.getElementById("periodMonthDisplay").textContent = state.period.month;
    document.getElementById("daysTotalDisplay").textContent = state.period.daysTotal;
    const adminDaysDone = document.getElementById("adminDaysDone");
    if (adminDaysDone && target.id !== "adminDaysDone") adminDaysDone.value = state.period.daysDone;
    renderAdminPeriodMessage();
    renderDashboard();
    renderAdminMetrics();
    renderManager();
    renderCollaborator();
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

  if (target.id === "newAdminPassword") {
    if (target.value.trim().length >= 4) {
      state.settings = { ...defaultSettings(), ...(state.settings || {}) };
      state.settings.adminPassword = target.value.trim();
      saveState("Senha admin salva");
    }
  }

  if (target.id === "newDashboardPassword") {
    if (target.value.trim().length >= 4) {
      state.settings = { ...defaultSettings(), ...(state.settings || {}) };
      state.settings.dashboardPassword = target.value.trim();
      saveState("Senha dashboard salva");
    }
  }


  if (target.dataset.customMetricField) {
    const area = target.dataset.customMetricArea;
    const metric = state.customMetrics[area].find((item) => item.id === target.dataset.customMetricId);
    if (!metric) return;
    const field = target.dataset.customMetricField;
    metric[field] = field === "goal" ? Number(target.value) || 0 : target.value;
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


  if (target.dataset.branchPassword) {
    state.branchPasswords = state.branchPasswords || {};
    state.branchPasswords[target.dataset.branchPassword] = target.value || "1234";
    saveState("Senha da filial salva");
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
    renderDashboard();
    return;
  }

  if (event.target.id === "goalSheetFile") {
    if (!canEditCampaignData()) {
      alert("Esta campanha esta fechada oficialmente e nao permite alteracoes.");
      event.target.value = "";
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    const hasCampaignData = state.sellers.length || state.branches.length || Object.values(state.customMetrics || {}).some((items) => items?.length);
    if (hasCampaignData && !confirm("A importacao CSV vai substituir vendedores, filiais e metas customizadas da campanha ativa. Isso evita duplicidade e faz a campanha respeitar o arquivo importado. Deseja continuar?")) {
      event.target.value = "";
      return;
    }
    readCsvFileText(file).then((text) => {
      try {
        importGoalTemplateCsv(text);
      } catch (error) {
        alert(error.message || "Nao foi possivel importar a planilha de metas.");
      }
    }).catch((error) => {
      alert(error.message || "Nao foi possivel importar a planilha de metas.");
    }).finally(() => {
      event.target.value = "";
    });
  }

  if (event.target.id === "partialCsvFile") {
    const campaign = activeCampaign();
    if (!campaign || campaign.status === CAMPAIGN_STATUS.OFFICIAL_CLOSED || campaign.status === CAMPAIGN_STATUS.OPERATIONAL_CLOSED) {
      alert("Esta campanha nao permite importar nova parcial neste status.");
      event.target.value = "";
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    readCsvFileText(file).then((text) => {
      const meta = {
        number: document.getElementById("partialNumber")?.value,
        name: document.getElementById("partialName")?.value,
        baseDate: document.getElementById("partialBaseDate")?.value,
      };
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
      alert(error.message || "Nao foi possivel importar a parcial.");
    }).finally(() => {
      event.target.value = "";
    });
  }

  if (event.target.id === "importDataFile") {
    if (!canEditCampaignData()) {
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
          module: "Importacao / Backup",
          message: "Backup JSON importado. Historico de auditoria preservado.",
        });
        saveState("Backup importado");
        renderAll();
      } catch (error) {
        alert(error.message || "Nao foi possivel importar o backup.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  if (event.target.matches("[data-seller-field], [data-adjustment], [data-metric-goal], [data-metric-realized], [data-collab-realized], [data-deflator-field], [data-custom-metric-field], [data-branch-name], [data-branch-password]")) renderAll();
  if (event.target.id === "adminSellerSelect") renderAdminMetrics();
  if (event.target.id === "collabSellerSelect") renderCollaborator();
  if (event.target.id === "ruleAreaSelect") renderRules();
  if (event.target.id === "branchFilter") {
    activeBranchFilter = event.target.value;
    renderDashboard();
  }
  if (event.target.id === "dashboardAreaFilter") {
    activeAreaFilter = event.target.value;
    document.querySelectorAll(".area-filter").forEach((button) => button.classList.toggle("active", button.dataset.area === activeAreaFilter));
    renderDashboard();
  }
  if (event.target.id === "dashboardIndicatorFilter") {
    activeDashboardIndicator = event.target.value;
    renderDashboard();
  }
  if (event.target.id === "dashboardStatusFilter") {
    activeDashboardStatus = event.target.value;
    renderDashboard();
  }
  if (event.target.id === "dashboardDeflatorFilter") {
    activeDashboardDeflator = event.target.value;
    renderDashboard();
  }
  if (event.target.id === "managerSellerFilter") {
    activeManagerSellerId = event.target.value;
    renderManager();
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
