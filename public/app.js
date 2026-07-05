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
      { id: makeId(), name: "HENRIQUE", branch: "CURITIBANOS", area: "Nao Cabo", adjustments: { quality: 0, insurance: 0, carousel: 0 }, password: "1234", emExperiencia: false, values: {} },
      { id: makeId(), name: "MAKELLY", branch: "CURITIBANOS", area: "Nao Cabo", adjustments: { quality: 0, insurance: 0, carousel: 0 }, password: "1234", emExperiencia: false, values: {} },
      { id: makeId(), name: "VENDEDOR CABO", branch: "FRAIBURGO", area: "Cabo", adjustments: { quality: 0, insurance: 0, carousel: 0 }, password: "1234", emExperiencia: false, values: {} },
    ],
    rules: structuredClone(defaultRules),
    customMetrics: { Cabo: [], "Nao Cabo": [] },
    branches: ["CURITIBANOS", "FRAIBURGO"],
    deflators: structuredClone(defaultDeflators),
    branchPasswords: { CURITIBANOS: "1234", FRAIBURGO: "1234" },
    settings: defaultSettings(),
  };
}

var state = loadState();
let activeAreaFilter = "Todas";
let activeBranchFilter = "Todas";
let activeDashboardIndicator = "Todos";
let activeDashboardStatus = "Todos";
let activeDashboardDeflator = "Todos";
let activeCollaboratorId = sessionStorage.getItem(COLLAB_SESSION_KEY) || "";
let activeBranchSession = sessionStorage.getItem(BRANCH_SESSION_KEY) || "";
let activeManagerSellerId = "";
let activeAdminTab = "campanha";
let pendingAccessView = "dashboard";

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
  if (!saved) return fallback;
  try {
    const parsed = normalizeState(JSON.parse(saved));
    return parsed;
  } catch {
    return fallback;
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

function normalizeCustomMetrics(source) {
  return {
    Cabo: Array.isArray(source?.Cabo) ? source.Cabo : [],
    "Nao Cabo": Array.isArray(source?.["Nao Cabo"]) ? source["Nao Cabo"] : [],
  };
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
function normalizeState(candidate) {
  if (!candidate || typeof candidate !== "object" || !Array.isArray(candidate.sellers)) {
    throw new Error("Arquivo de backup invalido.");
  }
  candidate.period = candidate.period || { month: "JUNHO", daysDone: 1, daysTotal: 1 };
  candidate.settings = { ...defaultSettings(), ...(candidate.settings || {}) };
  candidate.rules = candidate.rules || structuredClone(defaultRules);
  candidate.customMetrics = normalizeCustomMetrics(candidate.customMetrics);
  candidate.deflators = normalizeDeflators(candidate.deflators);
  candidate.branches = normalizeBranches(candidate.branches, candidate.sellers);
  candidate.branchPasswords = normalizeBranchPasswords(candidate.branchPasswords, candidate.managerAccess, candidate._legacyManagers, candidate.branches);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateSaveStatus("Salvando...");
  window.clearTimeout(cloudSaveTimer);
  cloudSaveTimer = window.setTimeout(() => saveStateToCloud(message), 350);
}

function flushSaveState(message = "Salvo no banco") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateSaveStatus("Salvando...");
  window.clearTimeout(cloudSaveTimer);
  return saveStateToCloud(message);
}

function metricsFor(area, sourceState = state) {
  const defaults = areaMetrics[area] || [];
  const custom = sourceState?.customMetrics?.[area] || [];
  return [...defaults, ...custom];
}

function ensureSellerValues(seller, sourceState = state) {
  seller.values = seller.values || {};
  seller.adjustments = seller.adjustments || { quality: 0, insurance: 0, carousel: 0 };
  if (!seller.password) seller.password = "1234";
  for (const metric of metricsFor(seller.area, sourceState)) {
    if (!seller.values[metric.id]) seller.values[metric.id] = { goal: metric.goal, realized: 0 };
  }
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
  const adjustments = Object.values(seller.adjustments || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const current = currentSubtotal + currentDeflator + adjustments;
  const proj = projectedSubtotal + projectedDeflator + adjustments;
  return { current, projected: proj, gain: proj - current, currentSubtotal, projectedSubtotal, currentDeflator, projectedDeflator, adjustments };
}

function statusFor(seller) {
  const result = sellerResult(seller);
  if (result.projected <= 0) return { label: "Critico", cls: "bad" };
  const lowMetrics = metricsFor(seller.area).filter((metric) => metric.type !== "deviceRevenue" && percentFor(seller, metric.id, true) < 0.8);
  if (lowMetrics.length === 0) return { label: "Meta batida", cls: "ok" };
  return lowMetrics.length <= 2 ? { label: "Em risco", cls: "warn" } : { label: "Critico", cls: "bad" };
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
    const projectedNoDeflator = result.projectedNoDeflator ?? result.projected;
    const deflator = result.deflator ?? result.projectedDeflator;
    const finalProjected = result.finalProjected ?? result.projected;
    const status = typeof dashboardStatusFromPercent === "function" ? dashboardStatusFromPercent(currentPercent) : statusFor(seller);
    return `<tr><td>${escapeHtml(seller.name)}</td><td>${escapeHtml(seller.branch)}</td><td>${escapeHtml(seller.area)}</td><td>${money.format(result.current)}</td><td>${pct.format(currentPercent)}</td><td>${money.format(projectedNoDeflator)}</td><td>${pct.format(projectedPercent)}</td><td>${money.format(deflator)}</td><td>${money.format(finalProjected)}</td><td>${escapeHtml(status.label)}</td></tr>`;
  }).join("");
  const html = `<html><head><meta charset="UTF-8"></head><body><table><thead><tr><th>Vendedor</th><th>Filial</th><th>Area</th><th>Atual</th><th>% atual</th><th>Projetado sem deflator</th><th>% projetado</th><th>Deflator</th><th>Ganho final</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  downloadFile(`resultado-vendedores-${new Date().toISOString().slice(0, 10)}.xls`, "application/vnd.ms-excel;charset=utf-8", html);
}

function exportCriticalGoalsExcel() {
  const rows = criticalGoalRows(typeof dashboardSellers === "function" ? dashboardSellers() : visibleSellers()).map((row) => `<tr><td>${escapeHtml(row.metricName)}</td><td>${escapeHtml(row.area)}</td><td>${row.sellerCount}</td><td>${num.format(row.goal)}</td><td>${num.format(row.realized)}</td><td>${num.format(row.projected)}</td><td>${pct.format(row.percent)}</td><td>${num.format(row.missing)}</td></tr>`).join("");
  const html = `<html><head><meta charset="UTF-8"></head><body><table><thead><tr><th>Indicador</th><th>Area</th><th>Vendedores abaixo</th><th>Meta total</th><th>Realizado total</th><th>Projetado total</th><th>Atingimento medio</th><th>Falta total</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  downloadFile(`metas-criticas-${new Date().toISOString().slice(0, 10)}.xls`, "application/vnd.ms-excel;charset=utf-8", html);
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
}

function parseCsv(text) {
  const separator = text.includes(";") ? ";" : ",";
  return text.trim().split(/\r?\n/).map((line) => line.split(separator).map((cell) => cell.trim().replace(/^"|"$/g, "").replace(/""/g, '"')));
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
  state.rules[area] = state.rules[area] || {};
  state.rules[area][id] = [];
  return metric;
}

function findOrCreateSeller(name, branch, area) {
  const sellerKey = normalizedKey(name);
  const branchKey = normalizedKey(branch);
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

function importGoalTemplateCsv(text) {
  const rows = parseCsv(text);
  const header = rows.shift()?.map((item) => normalizedKey(item.replace(/^\uFEFF/, ""))) || [];
  const index = (name) => header.indexOf(normalizedKey(name));
  let updated = 0;
  let createdSellers = 0;
  let createdBranches = 0;
  let createdMetrics = 0;
  let ignoredRows = 0;
  for (const row of rows) {
    const sellerName = row[index("vendedor")] || "";
    const branch = row[index("filial")] || "";
    const area = row[index("area")] || "Nao Cabo";
    const metricName = row[index("metrica")] || "";
    const goalValue = row[index("meta")];
    const realizedValue = row[index("realizado")];
    if (!sellerName || !branch || !metricName) continue;
    if (shouldIgnoreImportedMetric(area, metricName)) {
      ignoredRows += 1;
      continue;
    }

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
  saveState(`${updated} linhas importadas (${createdSellers} vendedores, ${createdBranches} filiais, ${createdMetrics} metas novas, ${ignoredRows} ignoradas)`);
  renderAll();
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
  if (areaSelect) areaSelect.value = activeAreaFilter;
  if (statusSelect) statusSelect.value = activeDashboardStatus;
  if (deflatorSelect) deflatorSelect.value = activeDashboardDeflator;
  if (indicatorSelect) {
    const names = [...new Set(baseSellers.flatMap((seller) => metricsFor(seller.area).filter((metric) => metric.type !== "deviceRevenue").map((metric) => metric.name)))].sort();
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

function dashboardStatusFromPercent(percent) {
  if (percent >= 1) return { label: "Acima da meta", cls: "ok", action: "Acompanhamento" };
  if (percent >= 0.7) return { label: "Em atencao", cls: "warn", action: "Plano de acao" };
  return { label: "Critico", cls: "bad", action: "Acao imediata" };
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
  if (metric) {
    return {
      current: metricCommission(seller, metric, "current"),
      projectedNoDeflator: metricCommission(seller, metric, "projected"),
      deflator: result.projectedDeflator,
      finalProjected: metricCommission(seller, metric, "projected") + result.projectedDeflator,
      currentPercent: percentFor(seller, metric.id, false),
      projectedPercent: percentFor(seller, metric.id, true),
    };
  }
  const projectedNoDeflator = result.projectedSubtotal + result.adjustments;
  return {
    current: result.current,
    projectedNoDeflator,
    deflator: result.projectedDeflator,
    finalProjected: projectedNoDeflator + result.projectedDeflator,
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
    acc.projected += result.finalProjected;
    acc.gain += result.finalProjected - result.current;
    acc.deflator += result.deflator;
    return acc;
  }, { current: 0, projected: 0, gain: 0, deflator: 0 });
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
    ["Resultado geral", money.format(totals.current), "Comissão atual", "target", null],
    ["% atual geral", pct.format(currentPercent), "Atingimento atual", "percent", currentPercent],
    ["% projetado geral", pct.format(projectedPercent), "Projeção da meta", "trend", projectedPercent],
    ["Comissão total projetada", money.format(totals.projected), "Todas as filiais", "money", null],
    ["Filiais em risco", riskBranches, "Abaixo de 70%", "alert", riskBranches ? 0 : 1],
    ["Vendedores em destaque", highlightSellers, "Acima de 120%", "star", highlightSellers ? 1 : null],
    ["Deflator", `${deflatorCounts.withDeflator}/${deflatorCounts.withoutDeflator}`, "Com / sem deflator", "scale", deflatorCounts.withDeflator ? 0 : 1],
  ];
  container.innerHTML = cards.map(([label, value, detail, icon, percent]) => `<article class="dashboard-kpi ${icon}">
    <span aria-hidden="true"></span>
    <div><small>${label}</small><strong>${value}</strong><em class="${achievementClass(percent)}">${detail}</em></div>
  </article>`).join("");
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
  container.innerHTML = `A operacao esta com <strong>${pct.format(currentPercent)}</strong> de atingimento atual e projecao de <strong>${pct.format(projectedPercent)}</strong>, ficando ${health}. ${branchText} ${riskBranches} filial${riskBranches === 1 ? "" : "is"} em risco e ${lowSellers} vendedor${lowSellers === 1 ? "" : "es"} abaixo de 70% exigem atencao.`;
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
      <td>${money.format(result.finalProjected)}</td>
      <td><span class="status ${status.cls}">${status.label}</span></td>
    </tr>`;
  }).join("") || `<tr><td colspan="10">Nenhum vendedor no filtro atual.</td></tr>`;
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
  if (riskBranches) points.push({ cls: "bad", title: `${riskBranches} filial${riskBranches === 1 ? "" : "is"} abaixo de 70%`, detail: "Priorizar plano de acao por loja." });
  if (lowSellers) points.push({ cls: "bad", title: `${lowSellers} vendedor${lowSellers === 1 ? "" : "es"} abaixo de 70%`, detail: "Acompanhar gaps individuais." });
  if (projectedPercent < 1) points.push({ cls: "warn", title: "Projecao abaixo de 100%", detail: `Atingimento projetado em ${pct.format(projectedPercent)}.` });
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

function renderAdmin() {
  renderSelectors();
  updateAdminTabs();
  renderAdminSummary();
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
      <label>Qualidade<input data-adjustment="quality" data-seller-id="${seller.id}" type="number" value="${seller.adjustments?.quality || 0}"></label>
      <label>Seguro<input data-adjustment="insurance" data-seller-id="${seller.id}" type="number" value="${seller.adjustments?.insurance || 0}"></label>
      <label>Carrossel<input data-adjustment="carousel" data-seller-id="${seller.id}" type="number" value="${seller.adjustments?.carousel || 0}"></label>
      <label>Senha colaborador<input data-seller-field="password" data-seller-id="${seller.id}" type="text" value="${escapeHtml(seller.password || "1234")}"></label>
      <label class="checkbox-line"><input data-seller-experience="${seller.id}" type="checkbox" ${seller.emExperiencia ? "checked" : ""}> Vendedor em experiência</label>
      <button class="delete-seller-button" data-delete-seller="${seller.id}" type="button">Excluir vendedor</button>
    </div>
  `).join("") : `<p class="muted-note">Nenhum vendedor encontrado com os filtros atuais.</p>`;
  renderAdminMetrics();
  renderRules();
  renderBranchEditor();
  renderMetricCatalogEditor();
  renderDeflators();
  renderManagerAccessEditor();
}
function selectedAdminSeller() {
  const id = document.getElementById("adminSellerSelect").value || state.sellers[0]?.id;
  return state.sellers.find((seller) => seller.id === id) || state.sellers[0];
}

function renderAdminMetrics() {
  const seller = selectedAdminSeller();
  if (!seller) return;
  ensureSellerValues(seller);
  const result = sellerResult(seller);
  document.getElementById("adminDeflatorSummary").innerHTML = `Subtotal proj.: <strong>${money.format(result.projectedSubtotal)}</strong> | Deflator proj.: <strong>${money.format(result.projectedDeflator)}</strong> | Total proj.: <strong>${money.format(result.projected)}</strong>`;
  document.getElementById("adminMetricsBody").innerHTML = metricsFor(seller.area).map((metric) => {
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
  container.innerHTML = ["Cabo", "Nao Cabo"].map((area) => {
    const custom = state.customMetrics?.[area] || [];
    const rows = custom.length ? custom.map((metric) => `
      <div class="metric-row">
        <label>Nome<input data-custom-metric-field="name" data-custom-metric-area="${area}" data-custom-metric-id="${metric.id}" value="${metric.name}"></label>
        <label>Unidade<input data-custom-metric-field="unit" data-custom-metric-area="${area}" data-custom-metric-id="${metric.id}" value="${metric.unit || "Qtd."}"></label>
        <label>Tipo
          <select data-custom-metric-field="type" data-custom-metric-area="${area}" data-custom-metric-id="${metric.id}">
            <option value="unit100" ${metric.type === "unit100" ? "selected" : ""}>Quantidade x taxa x 100</option>
            <option value="revenue" ${metric.type === "revenue" ? "selected" : ""}>Receita x taxa</option>
          </select>
        </label>
        <label>Meta padrao<input data-custom-metric-field="goal" data-custom-metric-area="${area}" data-custom-metric-id="${metric.id}" type="number" step="0.01" value="${metric.goal || 0}"></label>
        <button class="danger-button" data-delete-custom-metric="${metric.id}" data-custom-metric-area="${area}" type="button">Excluir item</button>
      </div>
    `).join("") : `<p class="muted-note">Nenhum item extra cadastrado.</p>`;
    return `<div class="rule-card"><h4>${area}</h4>${rows}<button class="ghost-button" data-add-custom-metric="${area}" type="button">Adicionar meta</button></div>`;
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
  })).sort((a, b) => (a.currentPercent || 0) - (b.currentPercent || 0));
}

function branchStatusFromPercent(percent) {
  if (percent >= 1) return { label: "Acima da meta", cls: "ok", action: "Acompanhamento" };
  if (percent >= 0.7) return { label: "Em atencao", cls: "warn", action: "Plano de acao" };
  return { label: "Critico", cls: "bad", action: "Acao imediata" };
}

function sellerBranchSummary(seller) {
  const result = sellerResult(seller);
  const gross = result.projectedSubtotal + result.adjustments;
  const final = result.projected;
  const currentPercent = totalAttainmentForSellers([seller], "current");
  const projectedPercent = totalAttainmentForSellers([seller], "projected");
  const status = seller.emExperiencia ? { label: "Em experiencia", cls: "neutral", action: "Acompanhamento" } : branchStatusFromPercent(currentPercent);
  return { result, gross, final, currentPercent, projectedPercent, status, deflator: result.projectedDeflator };
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
  };
}

function branchKpiCards(branch, sellers, totals) {
  const cards = [
    ["Meta da filial", num.format(totals.totalGoal), "Meta consolidada", "target", null],
    ["Realizado", num.format(totals.realized), "Resultado atual", "trend", totals.currentPercent],
    ["% atual", pct.format(totals.currentPercent), "Atingimento atual", "percent", totals.currentPercent],
    ["Projetado", num.format(totals.projectedTotal), "Projeção da filial", "trend", totals.projectedPercent],
    ["% projetado", pct.format(totals.projectedPercent), "Projeção / meta", "percent", totals.projectedPercent],
    ["Comissão estimada", money.format(totals.commissionFinal), `Bruta ${money.format(totals.commissionGross)}`, "money", null],
  ];
  return `<div class="branch-kpi-grid">${cards.map(([label, value, detail, icon, percent]) => `<article class="branch-kpi ${icon}"><span aria-hidden="true"></span><div><small>${label}</small><strong>${value}</strong><em class="${achievementClass(percent)}">${detail}</em></div></article>`).join("")}</div>`;
}

function branchAlerts(sellers, totals) {
  const riskSellers = sellers.filter((seller) => sellerBranchSummary(seller).currentPercent < 0.7);
  const projectedGap = Math.max(totals.totalGoal - totals.projectedTotal, 0);
  const deflatorSellers = sellers.filter((seller) => projectedDeflatorPreview(seller).rate > 0);
  const deflatorText = deflatorSellers.length
    ? `${deflatorSellers.length} vendedor${deflatorSellers.length === 1 ? "" : "es"} possuem deflator aplicado ou previsto. Impacto estimado: ${money.format(totals.deflatorImpact)}.`
    : "Nenhum deflator aplicado no momento.";
  return `<div class="branch-alert-grid">
    <article class="branch-alert ${riskSellers.length ? "bad" : "ok"}"><strong>${riskSellers.length} vendedor${riskSellers.length === 1 ? "" : "es"} em risco</strong><span>${riskSellers.length ? "Estão com performance abaixo de 70% da meta atual." : "Nenhum vendedor abaixo de 70% no momento."}</span></article>
    <article class="branch-alert ${totals.projectedPercent >= 1 ? "ok" : "warn"}"><strong>Meta projetada</strong><span>A filial deve atingir ${pct.format(totals.projectedPercent)} da meta. ${projectedGap ? `Faltam ${num.format(projectedGap)} para atingir 100%.` : "Meta projetada atingida."}</span></article>
    <article class="branch-alert ${deflatorSellers.length ? "bad" : "ok"}"><strong>Deflatores ativos</strong><span>${deflatorText}</span></article>
  </div>`;
}

function branchTeamTable(sellers) {
  const rows = [...sellers].sort((a, b) => sellerBranchSummary(b).currentPercent - sellerBranchSummary(a).currentPercent).map((seller) => {
    const summary = sellerBranchSummary(seller);
    const experience = seller.emExperiencia ? `<span class="status neutral">Em experiência</span><small>Deflator ignorado</small>` : "";
    return `<tr>
      <td><strong>${escapeHtml(seller.name)}</strong><small>${escapeHtml(seller.area)}</small>${experience}</td>
      <td>${money.format(summary.result.current)}</td>
      <td>${achievementPill(summary.currentPercent)}</td>
      <td>${money.format(summary.gross)}</td>
      <td>${achievementPill(summary.projectedPercent)}</td>
      <td>${money.format(summary.gross)}</td>
      <td>${money.format(summary.deflator)}</td>
      <td>${money.format(summary.final)}</td>
      <td><span class="status ${summary.status.cls}">${summary.status.label}</span></td>
      <td><button class="ghost-button compact-action" data-manager-seller-detail="${seller.id}" type="button">Ver detalhes</button></td>
    </tr>`;
  }).join("");
  return `<section class="branch-card-panel branch-team-panel"><div class="branch-card-head"><div><h3>Equipe da filial</h3><p>Comissão bruta, deflator e comissão final por vendedor.</p></div></div><div class="table-wrap branch-table-wrap"><table><thead><tr><th>Colaborador</th><th>Realizado</th><th>% atual</th><th>Projetado</th><th>% proj.</th><th>Comissão bruta</th><th>Deflator</th><th>Comissão final</th><th>Status</th><th>Ações</th></tr></thead><tbody>${rows || `<tr><td colspan="10">Nenhum vendedor vinculado a esta filial.</td></tr>`}</tbody></table></div></section>`;
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
  const rows = metricsFor(seller.area).filter((metric) => metric.type !== "deviceRevenue").map((metric) => {
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
  const reason = preview.triggered[0]?.metric?.name ? `${preview.triggered[0].metric.name} abaixo da meta mínima` : "Sem motivo de deflator";
  const list = preview.triggered.length ? preview.triggered.map((rule) => `<li>Deflator ${escapeHtml(rule.metric.name)}: -${pct.format(rule.rate)} (${pct.format(rule.percent)} atual proj.)</li>`).join("") : `<li>Nenhum deflator aplicado para este vendedor.</li>`;
  const ignored = preview.ignored ? `<p class="admin-inline-note warning">Aplicação: ignorado por vendedor em experiência.</p>` : "";
  return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Impacto dos deflatores</h3><p>Impacto financeiro previsto no resultado do vendedor.</p></div></div><div class="deflator-impact-grid"><span>Comissão sem deflator<strong>${money.format(summary.gross)}</strong></span><span>Deflator aplicado<strong>${preview.rate ? `-${pct.format(preview.rate)}` : "0,0%"}</strong></span><span>Impacto financeiro<strong>${money.format(preview.ignored ? preview.previewImpact : summary.deflator)}</strong></span><span>Comissão final projetada<strong>${money.format(summary.final)}</strong></span></div><strong class="deflator-reason">Motivo principal: ${escapeHtml(reason)}</strong><ul class="deflator-list">${list}</ul>${ignored}</section>`;
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
  return `<section class="branch-detail-grid"><section class="branch-card-panel wide"><div class="branch-card-head"><div><h3>Detalhamento por vendedor</h3><p>${escapeHtml(seller.name)} - ${escapeHtml(seller.branch)} - ${escapeHtml(seller.area)}</p></div></div><div class="seller-detail-kpis"><article><span>Realizado</span><strong>${money.format(summary.result.current)}</strong></article><article><span>% atual</span><strong>${pct.format(summary.currentPercent)}</strong></article><article><span>Projetado</span><strong>${money.format(summary.gross)}</strong></article><article><span>% projetado</span><strong>${pct.format(summary.projectedPercent)}</strong></article><article><span>Comissão bruta</span><strong>${money.format(summary.gross)}</strong></article><article><span>Comissão final</span><strong>${money.format(summary.final)}</strong></article><article><span>Status</span><strong><span class="status ${summary.status.cls}">${summary.status.label}</span></strong></article></div><div class="table-wrap branch-table-wrap"><table><thead><tr><th>Indicador</th><th>Meta</th><th>Realizado</th><th>% atual</th><th>Falta</th><th>Projetado</th><th>% projetado</th><th>Deflator</th><th>Status</th></tr></thead><tbody>${sellerIndicatorDetailRows(seller)}</tbody></table></div></section><div>${sellerDeflatorImpactCard(seller)}${sellerRecommendedAction(seller)}</div></section>`;
}

function branchAttentionPoints(sellers) {
  const points = [];
  for (const seller of sellers) {
    const summary = sellerBranchSummary(seller);
    const preview = projectedDeflatorPreview(seller);
    if (summary.currentPercent < 0.7) points.push({ cls: "bad", text: `${seller.name} - ${pct.format(summary.currentPercent)} da meta - Crítico` });
    else if (summary.currentPercent < 1) points.push({ cls: "warn", text: `${seller.name} - ${pct.format(summary.currentPercent)} da meta - Em atenção` });
    if (preview.triggered.length) points.push({ cls: preview.ignored ? "neutral" : "bad", text: `${seller.name} - Deflator -${pct.format(preview.rate)} - ${preview.triggered[0].metric.name} abaixo do mínimo${preview.ignored ? " (ignorado)" : ""}` });
    if (seller.emExperiencia) points.push({ cls: "neutral", text: `${seller.name} - Em experiência - Deflator ignorado` });
  }
  return `<section class="branch-card-panel"><div class="branch-card-head"><div><h3>Pontos de atencao</h3><p>Vendedores e indicadores que exigem acao.</p></div></div><div class="branch-attention-list">${points.slice(0, 8).map((point) => `<div class="attention-row ${point.cls}"><strong>${escapeHtml(point.text)}</strong></div>`).join("") || `<p class="muted-note">Nenhum ponto critico identificado no momento.</p>`}</div></section>`;
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

function branchDashboardMarkup(branch, sellers) {
  const totals = branchTotals(sellers);
  const selectedSeller = sellers.find((seller) => seller.id === activeManagerSellerId) || null;
  if (!sellers.length) return `<div class="branch-modern"><div class="dashboard-empty-state active"><strong>Nenhum dado disponivel para esta filial.</strong><span>Configure vendedores, metas e realizados no Admin para visualizar o painel.</span></div></div>`;
  return `<div class="branch-modern"><div class="branch-title-row"><div><p class="eyebrow">Simulador operacional</p><h2>Painel da Filial</h2><span>${escapeHtml(branch)}</span></div></div>${branchKpiCards(branch, sellers, totals)}${branchAlerts(sellers, totals)}${branchSellerFilter(sellers)}<div class="branch-main-grid"><div>${branchTeamTable(sellers)}${sellerDetailPanel(selectedSeller)}${branchIndicatorAchievementCard(sellers)}${branchDeflatorSummary(sellers)}</div><aside>${branchAttentionPoints(sellers)}${branchRankingCard(sellers)}</aside></div></div>`;
}

function renderManager() {
  const loginPanel = document.getElementById("managerLoginPanel");
  const dashboard = document.getElementById("managerDashboard");
  if (!loginPanel || !dashboard) return;
  state.branches = normalizeBranches(state.branches, state.sellers);
  state.branchPasswords = normalizeBranchPasswords(state.branchPasswords, state.managerAccess, state._legacyManagers, state.branches);
  if (!activeBranchSession || !state.branches.includes(activeBranchSession)) {
    activeManagerSellerId = "";
    const options = state.branches.map((branch) => `<option value="${escapeHtml(branch)}">${escapeHtml(branch)}</option>`).join("");
    loginPanel.innerHTML = options ? `
      <label>Filial<select id="managerBranchSelect">${options}</select></label>
      <label>Senha<input id="managerPassword" type="password" placeholder="Senha da filial"></label>
      <span id="managerLoginError" class="form-error"></span>
      <button id="managerLogin" class="nav-button active" type="button">Entrar</button>
    ` : `<div class="empty-state">Cadastre uma filial no Admin para liberar esta visão.</div>`;
    dashboard.innerHTML = `<div class="empty-state">A filial acessa somente o atingimento dos vendedores vinculados a ela.</div>`;
    return;
  }
  const sellers = state.sellers.filter((seller) => (seller.branch || "Sem filial") === activeBranchSession);
  if (activeManagerSellerId && !sellers.some((seller) => seller.id === activeManagerSellerId)) activeManagerSellerId = "";
  loginPanel.innerHTML = `
    <div class="hero-number"><span>Filial</span><strong>${escapeHtml(activeBranchSession)}</strong></div>
    <button id="managerLogout" class="ghost-button" type="button">Trocar filial</button>
  `;
  dashboard.innerHTML = branchDashboardMarkup(activeBranchSession, sellers);
}function selectedCollabSeller() {
  const id = activeCollaboratorId || document.getElementById("collabSellerSelect").value || state.sellers[0]?.id;
  return state.sellers.find((seller) => seller.id === id) || state.sellers[0];
}

function legacyCollaboratorLoginMarkup(seller) {
  return `<div class="collab-login">
    <div class="hero-number"><span>Colaborador</span><strong>${seller?.name || "Selecione"}</strong></div>
    <label>Senha
      <input id="collabPassword" type="password" placeholder="Senha do colaborador">
    </label>
    <span id="collabLoginError" class="form-error"></span>
    <button id="collabLogin" class="nav-button active" type="button">Entrar</button>
  </div>`;
}

function legacyPrepareCollaboratorPdfExport() {
  const seller = selectedCollabSeller();
  if (!seller || activeCollaboratorId !== seller.id) {
    alert("Entre com a senha do colaborador antes de exportar.");
    return;
  }
  const stamp = document.getElementById("collabExportStamp");
  if (stamp) {
    stamp.innerHTML = `
      <strong>Relatório do colaborador</strong>
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
  const projectedTotalBeforeDeflator = result.projectedSubtotal + result.adjustments;
  document.getElementById("collabHero").innerHTML = `
    <div class="hero-number"><span>${seller.branch} - ${seller.area}</span><strong>${seller.name}</strong></div>
    <div class="hero-number"><span>Comissão total proj.</span><strong>${money.format(projectedTotalBeforeDeflator)}</strong></div>
    <div class="hero-number"><span>Deflator</span><strong>${money.format(result.projectedDeflator)}</strong></div>
    <div class="hero-number"><span>Comissão final proj.</span><strong>${money.format(result.projected)}</strong></div>
    <div class="hero-number"><span>Status</span><strong><span class="status ${status.cls}">${status.label}</span></strong></div>
    <button id="collabLogout" class="ghost-button" type="button">Trocar colaborador</button>
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
  const rows = metricsFor(seller.area).filter((metric) => metric.type !== "deviceRevenue").map((metric) => {
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
  const gross = result.projectedSubtotal + result.adjustments;
  const final = result.projected;
  const preview = projectedDeflatorPreview(seller);
  const status = seller.emExperiencia ? { label: "Em experiência", cls: "neutral", action: "Acompanhamento" } : branchStatusFromPercent(metrics.totals.currentPercent || 0);
  return { result, metrics, gross, final, preview, status, currentPercent: metrics.totals.currentPercent || 0, projectedPercent: metrics.totals.projectedPercent || 0 };
}

function collaboratorLoginMarkup(seller) {
  return `<div class="collab-login">
    <div class="collab-login-identity"><span>Colaborador</span><strong>${escapeHtml(seller?.name || "Selecione")}</strong><small>${escapeHtml(seller ? `${seller.branch} - ${seller.area}` : "Selecione um colaborador")}</small></div>
    <label>Senha<input id="collabPassword" type="password" placeholder="Senha do colaborador"></label>
    <span id="collabLoginError" class="form-error"></span>
    <button id="collabLogin" class="nav-button active" type="button">Entrar</button>
    <p class="muted-note">Selecione um colaborador e informe a senha para visualizar seu desempenho.</p>
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
  return `<section class="collab-card collab-main-kpi"><div class="collab-card-head"><h3>Minha comissão estimada</h3><span class="status ${summary.status.cls}">${summary.status.label}</span></div><strong class="collab-money">${money.format(summary.final)}</strong><div class="collab-kpi-line"><span>Atingimento atual: <b>${pct.format(summary.currentPercent)}</b></span><span>Atingimento projetado: <b>${pct.format(summary.projectedPercent)}</b></span></div><div class="collab-progress"><span style="width:${progress}%"></span></div><div class="collab-progress-meta"><small>${pct.format(summary.currentPercent)} atual</small><small>Meta 100%</small></div></section>`;
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
  if (seller.emExperiencia && summary.preview.triggered.length) return `<section class="collab-card collab-deflator-card"><div class="collab-card-head"><h3>Deflatores</h3><span class="status neutral">Ignorado</span></div><p><strong>Vendedor em experiência.</strong> Deflator previsto: -${pct.format(summary.preview.rate)}.</p><p>Aplicação: ignorado por período de experiência.</p><p>Comissão final sem desconto: <strong>${money.format(summary.final)}</strong></p><ul>${items}</ul></section>`;
  if (summary.preview.triggered.length) return `<section class="collab-card collab-deflator-card"><div class="collab-card-head"><h3>Deflatores</h3><span class="status bad">Aplicado</span></div><p>Deflator aplicado: <strong>-${pct.format(summary.preview.rate)}</strong></p><p>Impacto financeiro: <strong>${money.format(summary.result.projectedDeflator)}</strong></p><p>Comissão sem deflator: <strong>${money.format(summary.gross)}</strong></p><p>Comissão final: <strong>${money.format(summary.final)}</strong></p><ul>${items}</ul></section>`;
  return `<section class="collab-card collab-deflator-card"><div class="collab-card-head"><h3>Deflatores</h3><span class="status ok">Sem desconto</span></div><p>Nenhum deflator aplicado no momento.</p><p>Sua comissão projetada não possui desconto.</p></section>`;
}

function collaboratorIndicatorTable(seller) {
  const { rows, totals } = collaboratorMetricRows(seller);
  const body = rows.map((row) => `<tr><td>${escapeHtml(row.metric.name)}</td><td>${num.format(row.goal)}</td><td><input data-collab-realized="${row.metric.id}" type="number" value="${row.realized}"></td><td>${achievementPill(row.currentPercent)}</td><td>${num.format(row.missing)}</td><td>${num.format(row.projectedValue)}</td><td>${achievementPill(row.projectedPercent)}</td><td>${money.format(row.commission)}</td><td>${escapeHtml(row.deflator)}</td><td><span class="status ${row.status.cls}">${row.status.label}</span></td></tr>`).join("");
  const cards = rows.map((row) => `<article class="collab-indicator-card"><div><strong>${escapeHtml(row.metric.name)}</strong><span class="status ${row.status.cls}">${row.status.label}</span></div><dl><dt>Meta</dt><dd>${num.format(row.goal)}</dd><dt>Realizado</dt><dd><input data-collab-realized="${row.metric.id}" type="number" value="${row.realized}"></dd><dt>% atual</dt><dd>${pct.format(row.currentPercent || 0)}</dd><dt>Falta</dt><dd>${num.format(row.missing)}</dd><dt>Projetado</dt><dd>${num.format(row.projectedValue)}</dd><dt>% projetado</dt><dd>${pct.format(row.projectedPercent || 0)}</dd><dt>Comissão</dt><dd>${money.format(row.commission)}</dd><dt>Deflator</dt><dd>${escapeHtml(row.deflator)}</dd></dl></article>`).join("");
  return `<section class="collab-card collab-results-card"><div class="collab-card-head"><h3>Resultado por indicador</h3><p>Atualize os realizados para simular novos cenários.</p></div><div class="table-wrap collab-table-wrap"><table><thead><tr><th>Indicador</th><th>Meta</th><th>Realizado</th><th>% atual</th><th>Falta</th><th>Projetado</th><th>% projetado</th><th>Comissão</th><th>Deflator</th><th>Status</th></tr></thead><tbody>${body}<tr class="total-row"><td>Total</td><td>${num.format(totals.goal)}</td><td>${num.format(totals.realized)}</td><td>${achievementPill(totals.currentPercent)}</td><td>${num.format(totals.missing)}</td><td>${num.format(totals.projected)}</td><td>${achievementPill(totals.projectedPercent)}</td><td>${money.format(collaboratorSummary(seller).final)}</td><td>-</td><td><span class="status ${totals.status.cls}">${totals.status.label}</span></td></tr></tbody></table></div><div class="collab-indicator-cards">${cards}</div></section>`;
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
  const exportedAt = dateTime.format(new Date());
  const deflatorText = summary.preview.triggered.length ? `Deflator aplicado: -${pct.format(summary.preview.rate)} | Impacto financeiro: ${money.format(summary.result.projectedDeflator)} | Comissão sem deflator: ${money.format(summary.gross)} | Comissão final: ${money.format(summary.final)}` : "Nenhum deflator aplicado no momento.";
  const experienceText = seller.emExperiencia && summary.preview.triggered.length ? "Vendedor em experiência — deflator previsto ignorado." : "";
  const tableRows = rows.rows.map((row) => `<tr><td>${escapeHtml(row.metric.name)}</td><td>${num.format(row.goal)}</td><td>${num.format(row.realized)}</td><td>${pct.format(row.currentPercent || 0)}</td><td>${num.format(row.missing)}</td><td>${num.format(row.projectedValue)}</td><td>${pct.format(row.projectedPercent || 0)}</td><td>${money.format(row.commission)}</td><td>${escapeHtml(row.deflator)}</td><td>${row.status.label}</td></tr>`).join("");
  return `<div class="report-page"><header><div><h1>Comissão 360</h1><p>Simulador e painel de gestão de comissões, metas e performance comercial.</p></div><strong>Relatório do colaborador</strong></header><section class="report-meta"><span>Colaborador<strong>${escapeHtml(seller.name)}</strong></span><span>Filial<strong>${escapeHtml(seller.branch)}</strong></span><span>Área<strong>${escapeHtml(seller.area)}</strong></span><span>Mês<strong>${escapeHtml(state.period.month)}</strong></span><span>Dias realizados<strong>${num.format(state.period.daysDone)}</strong></span><span>Dias úteis<strong>${num.format(state.period.daysTotal)}</strong></span><span>Exportado em<strong>${exportedAt}</strong></span></section><section class="report-summary"><span>Comissão final<strong>${money.format(summary.final)}</strong></span><span>% atual<strong>${pct.format(summary.currentPercent)}</strong></span><span>% projetado<strong>${pct.format(summary.projectedPercent)}</strong></span><span>Status<strong>${summary.status.label}</strong></span><span>Comissão bruta<strong>${money.format(summary.gross)}</strong></span><span>Deflator<strong>${summary.preview.rate ? `-${pct.format(summary.preview.rate)}` : "Nenhum"}</strong></span><span>Impacto<strong>${money.format(summary.result.projectedDeflator)}</strong></span></section><table><thead><tr><th>Indicador</th><th>Meta</th><th>Realizado</th><th>% atual</th><th>Falta</th><th>Projetado</th><th>% projetado</th><th>Comissão</th><th>Deflator</th><th>Status</th></tr></thead><tbody>${tableRows}<tr class="total-row"><td>Total</td><td>${num.format(rows.totals.goal)}</td><td>${num.format(rows.totals.realized)}</td><td>${pct.format(rows.totals.currentPercent || 0)}</td><td>${num.format(rows.totals.missing)}</td><td>${num.format(rows.totals.projected)}</td><td>${pct.format(rows.totals.projectedPercent || 0)}</td><td>${money.format(summary.final)}</td><td>-</td><td>${rows.totals.status.label}</td></tr></tbody></table><section class="report-block"><h2>Deflatores</h2><p>${escapeHtml(experienceText || deflatorText)}</p></section><section class="report-block"><h2>Orientação</h2><p>${escapeHtml(collaboratorGuidance(seller))}</p></section><footer>Desenvolvido por Cleiton Gerber</footer></div>`;
}

function prepareCollaboratorPdfExport() {
  const seller = selectedCollabSeller();
  if (!seller || activeCollaboratorId !== seller.id) {
    alert("Entre com a senha do colaborador antes de exportar.");
    return;
  }
  const report = document.getElementById("collabPrintReport");
  if (report) report.innerHTML = collaboratorReportHtml(seller);
  document.body.classList.add("print-collaborator");
  window.setTimeout(() => window.print(), 150);
}

function renderCollaborator() {
  renderSelectors();
  const seller = selectedCollabSeller();
  const dashboard = document.getElementById("collabDashboard");
  if (!seller || !dashboard) return;
  if (activeCollaboratorId !== seller.id) {
    document.getElementById("collabHero").innerHTML = collaboratorLoginMarkup(seller);
    dashboard.innerHTML = `<section class="collab-empty-state">Selecione um colaborador e informe a senha para visualizar seu desempenho.</section>`;
    return;
  }
  ensureSellerValues(seller);
  document.getElementById("collabHero").innerHTML = `<div class="collab-login-identity"><span>Colaborador</span><strong>${escapeHtml(seller.name)}</strong><small>${escapeHtml(seller.branch)} - ${escapeHtml(seller.area)}</small></div><button id="collabLogout" class="ghost-button" type="button">Trocar colaborador</button>`;
  dashboard.innerHTML = `
    <div class="collab-top-grid">${collaboratorKpiMarkup(seller)}${collaboratorGuidanceMarkup(seller)}</div>
    <div class="collab-mid-grid">${collaboratorMonthMarkup()}${collaboratorDeflatorMarkup(seller)}</div>
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
    sessionStorage.setItem(DASHBOARD_SESSION_KEY, "ok");
    closeAccessLogin();
    openView("dashboard");
    return;
  }

  if (typed === adminPassword()) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "ok");
    closeAccessLogin();
    openView(pendingAccessView === "dashboard" ? "dashboard" : "admin");
    return;
  }

  if (await verifyOwnerAccess(typed)) {
    sessionStorage.setItem(OWNER_SESSION_KEY, "ok");
    sessionStorage.setItem(ADMIN_SESSION_KEY, "ok");
    sessionStorage.setItem(DASHBOARD_SESSION_KEY, "ok");
    closeAccessLogin();
    openView(pendingAccessView === "dashboard" ? "dashboard" : "admin");
    return;
  }

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
  document.getElementById("viewTitle").textContent = document.querySelector(`[data-view="${view}"]`).textContent;
  document.body.dataset.view = view;
  if (!options.skipHistory && routeByView[view] && window.location.pathname !== routeByView[view]) {
    history.pushState({ view }, "", routeByView[view]);
  }
  updateActionVisibility();
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

  if (event.target.id === "addBranch") {
    let base = "NOVA FILIAL";
    let name = base;
    let count = 2;
    while (branches().includes(name)) name = `${base} ${count++}`;
    state.branches.push(name);
    state.branchPasswords = state.branchPasswords || {};
    state.branchPasswords[name] = "1234";
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
    saveState("Filial excluida");
    renderAll();
  }
  if (event.target.id === "saveNow") {
    flushSaveState("Salvo manualmente");
  }


  const addMetricButton = event.target.closest("[data-add-custom-metric]");
  if (addMetricButton) {
    const area = addMetricButton.dataset.addCustomMetric;
    state.customMetrics[area].push({ id: `custom_${makeId()}`, name: "NOVA META", unit: "Qtd.", type: "unit100", goal: 1 });
    saveState("Meta adicionada");
    renderAll();
  }

  const deleteMetricButton = event.target.closest("[data-delete-custom-metric]");
  if (deleteMetricButton) {
    const area = deleteMetricButton.dataset.customMetricArea;
    const metricId = deleteMetricButton.dataset.deleteCustomMetric;
    if (!confirm("Excluir este item de meta?")) return;
    state.customMetrics[area] = state.customMetrics[area].filter((metric) => metric.id !== metricId);
    state.deflators[area] = state.deflators[area].filter((item) => item.metricId !== metricId);
    for (const seller of state.sellers.filter((item) => item.area === area)) delete seller.values[metricId];
    delete state.rules[area][metricId];
    saveState("Meta excluida");
    renderAll();
  }

  const addDeflatorButton = event.target.closest("[data-add-deflator]");
  if (addDeflatorButton) {
    const area = addDeflatorButton.dataset.addDeflator;
    state.deflators[area].push({ id: makeId(), metricId: metricsFor(area)[0]?.id || "gross", name: "Novo deflator", min: 0.8, penaltyRate: 0.1 });
    saveState("Deflator adicionado");
    renderAll();
  }

  const deleteDeflatorButton = event.target.closest("[data-delete-deflator]");
  if (deleteDeflatorButton) {
    const area = deleteDeflatorButton.dataset.deflatorArea;
    state.deflators[area] = state.deflators[area].filter((item) => item.id !== deleteDeflatorButton.dataset.deleteDeflator);
    saveState("Deflator excluido");
    renderAll();
  }

  if (event.target.id === "managerLogin") {
    const branch = document.getElementById("managerBranchSelect").value;
    const typed = document.getElementById("managerPassword").value;
    if (typed === String(state.branchPasswords?.[branch] || "1234")) {
      activeBranchSession = branch;
      sessionStorage.setItem(BRANCH_SESSION_KEY, branch);
      renderAll();
    } else {
      document.getElementById("managerLoginError").textContent = "Senha incorreta";
    }
  }

  if (event.target.id === "managerLogout") {
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
    state.sellers.push({ id: makeId(), name: "NOVO VENDEDOR", branch: "FILIAL", area: "Cabo", adjustments: { quality: 0, insurance: 0, carousel: 0 }, password: "1234", emExperiencia: false, values: {} });
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
    saveState("Vendedor excluido");
    renderAll();
  }
  if (event.target.id === "resetData" && confirm("Restaurar os dados padrao?")) {
    state = seedState();
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
  }

  if (event.target.id === "exportCollaboratorPdf") {
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

  if (event.target.id === "accessLogin") await handleAccessLogin();
  if (event.target.id === "accessCancel") closeAccessLogin();
});

document.addEventListener("input", (event) => {
  const target = event.target;
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
    seller.adjustments[target.dataset.adjustment] = Number(target.value) || 0;
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

  if (event.target.id === "goalSheetFile") {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importGoalTemplateCsv(reader.result);
      } catch (error) {
        alert(error.message || "Nao foi possivel importar a planilha de metas.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }
  if (event.target.id === "importDataFile") {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = normalizeState(JSON.parse(reader.result));
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
state.branches = normalizeBranches(state.branches, state.sellers);
state.deflators = normalizeDeflators(state.deflators);
state.branchPasswords = normalizeBranchPasswords(state.branchPasswords, state.managerAccess, state._legacyManagers, state.branches);
state.settings = { ...defaultSettings(), ...(state.settings || {}), adminPassword: adminPassword(), dashboardPassword: dashboardPassword() };
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

