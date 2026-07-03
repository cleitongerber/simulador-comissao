const STORAGE_KEY = "commission-simulator-v2";
const ADMIN_PASSWORD_KEY = "commission-admin-password";
const ADMIN_SESSION_KEY = "commission-admin-session";
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

function isAdminUnlocked() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "ok";
}

function defaultSettings() {
  return { adminPassword: "admin123", partnerName: "" };
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
      { id: makeId(), name: "HENRIQUE", branch: "CURITIBANOS", area: "Nao Cabo", adjustments: { quality: 0, insurance: 0, carousel: 0 }, password: "1234", values: {} },
      { id: makeId(), name: "MAKELLY", branch: "CURITIBANOS", area: "Nao Cabo", adjustments: { quality: 0, insurance: 0, carousel: 0 }, password: "1234", values: {} },
      { id: makeId(), name: "VENDEDOR CABO", branch: "FRAIBURGO", area: "Cabo", adjustments: { quality: 0, insurance: 0, carousel: 0 }, password: "1234", values: {} },
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
let activeCollaboratorId = sessionStorage.getItem(COLLAB_SESSION_KEY) || "";
let activeBranchSession = sessionStorage.getItem(BRANCH_SESSION_KEY) || "";

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
  for (const seller of candidate.sellers) ensureSellerValues(seller, candidate);
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

function deflatorFor(seller, subtotal, useProjected) {
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
  const sellers = visibleSellers();
  const rows = sellers.map((seller) => {
    const result = sellerResult(seller);
    const status = statusFor(seller);
    return `<tr><td>${escapeHtml(seller.name)}</td><td>${escapeHtml(seller.branch)}</td><td>${escapeHtml(seller.area)}</td><td>${money.format(result.current)}</td><td>${money.format(result.projected)}</td><td>${money.format(result.projectedDeflator)}</td><td>${money.format(result.gain)}</td><td>${escapeHtml(status.label)}</td></tr>`;
  }).join("");
  const html = `<html><head><meta charset="UTF-8"></head><body><table><thead><tr><th>Vendedor</th><th>Filial</th><th>Area</th><th>Atual</th><th>Projetado</th><th>Deflator</th><th>Ganho</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  downloadFile(`resultado-vendedores-${new Date().toISOString().slice(0, 10)}.xls`, "application/vnd.ms-excel;charset=utf-8", html);
}

function exportCriticalGoalsExcel() {
  const rows = criticalGoalRows(visibleSellers()).map((row) => `<tr><td>${escapeHtml(row.metricName)}</td><td>${escapeHtml(row.area)}</td><td>${row.sellerCount}</td><td>${num.format(row.goal)}</td><td>${num.format(row.realized)}</td><td>${num.format(row.projected)}</td><td>${pct.format(row.percent)}</td><td>${num.format(row.missing)}</td></tr>`).join("");
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
  seller = { id: makeId(), name: name.trim(), branch: branch.trim(), area, adjustments: { quality: 0, insurance: 0, carousel: 0 }, password: "1234", values: {} };
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
  select.innerHTML = options.map((branch) => `<option value="${branch}">${branch}</option>`).join("");
  if (!options.includes(activeBranchFilter)) activeBranchFilter = "Todas";
  select.value = activeBranchFilter;
}

function renderDashboard() {
  renderBranchFilter();
  const sellers = visibleSellers();
  const totals = sellers.reduce((acc, seller) => {
    const result = sellerResult(seller);
    acc.current += result.current;
    acc.projected += result.projected;
    acc.gain += result.gain;
    acc.deflator += result.projectedDeflator;
    return acc;
  }, { current: 0, projected: 0, gain: 0, deflator: 0 });

  document.getElementById("kpiGrid").innerHTML = [
    ["Total atual", money.format(totals.current)],
    ["Total projetado", money.format(totals.projected)],
    ["Ganho potencial", money.format(totals.gain)],
    ["Deflator projetado", money.format(totals.deflator)],
  ].map(([label, value]) => `<article class="kpi"><span>${label}</span><strong>${value}</strong></article>`).join("");

  document.getElementById("sellerSummaryBody").innerHTML = sellers.map((seller) => {
    const result = sellerResult(seller);
    const status = statusFor(seller);
    return `<tr>
      <td>${seller.name}</td>
      <td>${seller.branch}</td>
      <td>${seller.area}</td>
      <td>${money.format(result.current)}</td>
      <td>${money.format(result.projected)}</td>
      <td>${money.format(result.projectedDeflator)}</td>
      <td>${money.format(result.gain)}</td>
      <td><span class="status ${status.cls}">${status.label}</span></td>
    </tr>`;
  }).join("");

  renderAreaBars(sellers);
  renderBranchAttainmentBars(sellers);
  renderRanking(sellers);
  renderAchievementBars(sellers);
  renderDashboardInsights(sellers);
}

function renderAreaBars(sellers) {
  const byBranch = new Map();
  for (const seller of sellers) {
    const branch = seller.branch || "Sem filial";
    byBranch.set(branch, (byBranch.get(branch) || 0) + sellerResult(seller).projected);
  }
  const branches = [...byBranch.entries()]
    .map(([branch, total]) => ({ branch, total }))
    .sort((a, b) => b.total - a.total);
  const max = Math.max(1, ...branches.map((item) => Math.abs(item.total)));
  document.getElementById("areaBars").innerHTML = branches.map((item) => `
    <div class="bar-row">
      <div class="bar-label"><span>${escapeHtml(item.branch)}</span><span>${money.format(item.total)}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.max(2, Math.abs(item.total) / max * 100)}%"></div></div>
    </div>
  `).join("") || `<p class="muted-note">Sem filiais no filtro atual.</p>`;
}

function renderBranchAttainmentBars(sellers) {
  const container = document.getElementById("branchAttainmentBars");
  if (!container) return;
  const byBranch = new Map();
  for (const seller of sellers) {
    ensureSellerValues(seller);
    const branch = seller.branch || "Sem filial";
    const current = byBranch.get(branch) || { branch, sellers: new Set(), goal: 0, projected: 0 };
    current.sellers.add(seller.id);
    for (const metric of metricsFor(seller.area).filter((item) => item.type !== "deviceRevenue")) {
      const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
      current.goal += Number(value.goal) || 0;
      current.projected += projected(value.realized);
    }
    byBranch.set(branch, current);
  }
  const rows = [...byBranch.values()]
    .map((row) => ({ ...row, percent: row.goal ? row.projected / row.goal : 0 }))
    .sort((a, b) => b.percent - a.percent);
  container.innerHTML = rows.map((row) => `
    <div class="bar-row">
      <div class="bar-label"><span>${escapeHtml(row.branch)} (${row.sellers.size})</span><span>${pct.format(row.percent)}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, Math.max(2, row.percent * 100))}%"></div></div>
    </div>
  `).join("") || `<p class="muted-note">Sem filiais no filtro atual.</p>`;
}

function renderRanking(sellers) {
  const ranked = [...sellers].sort((a, b) => sellerResult(b).gain - sellerResult(a).gain).slice(0, 5);
  document.getElementById("rankingList").innerHTML = ranked.map((seller, index) => {
    const result = sellerResult(seller);
    return `<div class="rank-card"><strong>${index + 1}. ${seller.name}</strong><br><span>${seller.branch} - ${seller.area} - ${money.format(result.gain)}</span></div>`;
  }).join("");
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

function renderAdmin() {
  renderSelectors();
  const adminPeriodMonth = document.getElementById("adminPeriodMonth");
  const adminDaysTotal = document.getElementById("adminDaysTotal");
  if (adminPeriodMonth) adminPeriodMonth.value = state.period.month;
  if (adminDaysTotal) adminDaysTotal.value = state.period.daysTotal;
  const list = document.getElementById("sellerEditorList");
  list.innerHTML = state.sellers.map((seller) => `
    <div class="seller-card">
      <label>Nome<input data-seller-field="name" data-seller-id="${seller.id}" value="${seller.name}"></label>
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
      <label>Senha colaborador<input data-seller-field="password" data-seller-id="${seller.id}" type="text" value="${seller.password || "1234"}"></label>
      <button class="delete-seller-button" data-delete-seller="${seller.id}" type="button">Excluir vendedor</button>
    </div>
  `).join("");
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
      <td>${pct.format(percentFor(seller, metric.id, false))}</td>
      <td>${pct.format(percentFor(seller, metric.id, true))}</td>
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
    for (const metric of metricsFor(seller.area)) {
      const key = `${seller.area}::${metric.id}`;
      const current = byMetric.get(key) || { name: `${metric.name} (${seller.area})`, goal: 0, realized: 0, projected: 0, hasGoal: false };
      const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
      current.goal += Number(value.goal) || 0;
      current.hasGoal = current.hasGoal || Number(value.goal) > 0;
      current.realized += Number(value.realized) || 0;
      current.projected += projected(value.realized);
      byMetric.set(key, current);
    }
  }
  return [...byMetric.values()].map((row) => ({ ...row, percent: row.goal ? row.projected / row.goal : null }));
}

function sellerGapSummary(seller) {
  const gaps = metricsFor(seller.area)
    .filter((metric) => metric.type !== "deviceRevenue")
    .map((metric) => {
      const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
      const goal = Number(value.goal) || 0;
      const projectedValue = projected(value.realized);
      const percent = goal ? projectedValue / goal : 0;
      return {
        name: metric.name,
        percent,
        missing: Math.max(goal - projectedValue, 0),
      };
    })
    .filter((gap) => gap.missing > 0 && gap.percent < 1)
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 3);
  if (!gaps.length) return `<span class="status ok">Sem gaps projetados</span>`;
  return `<div class="gap-list">${gaps.map((gap) => `<span>${escapeHtml(gap.name)}: ${pct.format(gap.percent)} | falta ${num.format(gap.missing)}</span>`).join("")}</div>`;
}

function sellerIndicatorRows(seller) {
  ensureSellerValues(seller);
  return metricsFor(seller.area).map((metric) => {
    const value = seller.values[metric.id] || { goal: metric.goal, realized: 0 };
    const goal = Number(value.goal) || 0;
    const realized = Number(value.realized) || 0;
    const projectedValue = projected(realized);
    const percent = goal ? projectedValue / goal : null;
    return `<tr>
      <td>${escapeHtml(metric.name)}</td>
      <td>${goal ? num.format(goal) : "-"}</td>
      <td>${num.format(realized)}</td>
      <td>${num.format(projectedValue)}</td>
      <td>${percent === null ? "-" : pct.format(percent)}</td>
    </tr>`;
  }).join("");
}

function branchSellerRows(sellers) {
  const rows = [...sellers].sort((a, b) => sellerAttainment(a) - sellerAttainment(b));
  return rows.map((seller) => {
    const result = sellerResult(seller);
    const status = statusFor(seller);
    return `<article class="seller-indicator-card">
      <div class="seller-indicator-header">
        <div><span>Vendedor</span><strong>${escapeHtml(seller.name)}</strong></div>
        <div><span>Area</span><strong>${escapeHtml(seller.area)}</strong></div>
        <div><span>Atingimento</span><strong>${pct.format(sellerAttainment(seller))}</strong></div>
        <div><span>Projetado</span><strong>${money.format(result.projected)}</strong></div>
        <div><span>Status</span><strong><span class="status ${status.cls}">${status.label}</span></strong></div>
      </div>
      <div class="table-wrap"><table><thead><tr><th>Meta</th><th>Meta total</th><th>Realizado</th><th>Projetado</th><th>Atingimento</th></tr></thead><tbody>${sellerIndicatorRows(seller)}</tbody></table></div>
    </article>`;
  }).join("") || `<p class="muted-note">Nenhum vendedor vinculado a esta filial.</p>`;
}
function branchDashboardMarkup(branch, sellers) {
  const rows = branchMetricRows(sellers);
  const attainmentRows = rows.filter((row) => row.percent !== null);
  const totalGoal = attainmentRows.reduce((sum, row) => sum + row.goal, 0);
  const projectedForAttainment = attainmentRows.reduce((sum, row) => sum + row.projected, 0);
  const totalProjected = rows.reduce((sum, row) => sum + row.projected, 0);
  const totalPercent = totalGoal ? projectedForAttainment / totalGoal : 0;
  const tableRows = rows.map((row) => `<tr><td>${row.name}</td><td>${row.hasGoal ? num.format(row.goal) : "-"}</td><td>${num.format(row.realized)}</td><td>${num.format(row.projected)}</td><td>${row.percent === null ? "-" : pct.format(row.percent)}</td></tr>`).join("");
  return `
    <div class="kpi-grid manager-kpis">
      <article class="kpi"><span>Filial</span><strong>${branch}</strong></article>
      <article class="kpi"><span>Vendedores</span><strong>${sellers.length}</strong></article>
      <article class="kpi"><span>Atingimento total</span><strong>${pct.format(totalPercent)}</strong></article>
      <article class="kpi"><span>Projetado total</span><strong>${num.format(totalProjected)}</strong></article>
    </div>
    <div class="table-wrap"><table><thead><tr><th>Meta</th><th>Meta total</th><th>Realizado</th><th>Projetado</th><th>Atingimento</th></tr></thead><tbody>${tableRows || `<tr><td colspan="5">Nenhuma meta encontrada para esta filial.</td></tr>`}</tbody></table></div>
    <section class="branch-seller-panel">
      <div class="panel-header"><h3>Resultado individual por vendedor</h3></div>
      <div class="seller-indicator-list">${branchSellerRows(sellers)}</div>
    </section>
  `;
}
function dashboardSummaryMarkup(sellers) {
  const totals = sellers.reduce((acc, seller) => {
    const result = sellerResult(seller);
    acc.current += result.current;
    acc.projected += result.projected;
    acc.gain += result.gain;
    acc.deflator += result.projectedDeflator;
    return acc;
  }, { current: 0, projected: 0, gain: 0, deflator: 0 });
  const kpis = [
    ["Total atual", money.format(totals.current)],
    ["Total projetado", money.format(totals.projected)],
    ["Ganho potencial", money.format(totals.gain)],
    ["Deflator projetado", money.format(totals.deflator)],
  ].map(([label, value]) => `<article class="kpi"><span>${label}</span><strong>${value}</strong></article>`).join("");
  const rows = sellers.map((seller) => {
    const result = sellerResult(seller);
    const status = statusFor(seller);
    return `<tr><td>${seller.name}</td><td>${seller.area}</td><td>${money.format(result.current)}</td><td>${money.format(result.projected)}</td><td>${money.format(result.projectedDeflator)}</td><td><span class="status ${status.cls}">${status.label}</span></td></tr>`;
  }).join("");
  return `<div class="kpi-grid manager-kpis">${kpis}</div><div class="table-wrap"><table><thead><tr><th>Vendedor</th><th>Area</th><th>Atual</th><th>Projetado</th><th>Deflator</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderManager() {
  const loginPanel = document.getElementById("managerLoginPanel");
  const dashboard = document.getElementById("managerDashboard");
  if (!loginPanel || !dashboard) return;
  state.branches = normalizeBranches(state.branches, state.sellers);
  state.branchPasswords = normalizeBranchPasswords(state.branchPasswords, state.managerAccess, state._legacyManagers, state.branches);
  if (!activeBranchSession || !state.branches.includes(activeBranchSession)) {
    const options = state.branches.map((branch) => `<option value="${branch}">${branch}</option>`).join("");
    loginPanel.innerHTML = options ? `
      <label>Filial<select id="managerBranchSelect">${options}</select></label>
      <label>Senha<input id="managerPassword" type="password" placeholder="Senha da filial"></label>
      <span id="managerLoginError" class="form-error"></span>
      <button id="managerLogin" class="nav-button active" type="button">Entrar</button>
    ` : `<div class="empty-state">Cadastre uma filial no Admin para liberar esta visao.</div>`;
    dashboard.innerHTML = `<div class="empty-state">A filial acessa somente o atingimento dos vendedores vinculados a ela.</div>`;
    return;
  }
  const sellers = state.sellers.filter((seller) => (seller.branch || "Sem filial") === activeBranchSession);
  loginPanel.innerHTML = `
    <div class="hero-number"><span>Filial</span><strong>${activeBranchSession}</strong></div>
    <button id="managerLogout" class="ghost-button" type="button">Trocar filial</button>
  `;
  dashboard.innerHTML = branchDashboardMarkup(activeBranchSession, sellers);
}
function selectedCollabSeller() {
  const id = activeCollaboratorId || document.getElementById("collabSellerSelect").value || state.sellers[0]?.id;
  return state.sellers.find((seller) => seller.id === id) || state.sellers[0];
}

function collaboratorLoginMarkup(seller) {
  return `<div class="collab-login">
    <div class="hero-number"><span>Colaborador</span><strong>${seller?.name || "Selecione"}</strong></div>
    <label>Senha
      <input id="collabPassword" type="password" placeholder="Senha do colaborador">
    </label>
    <span id="collabLoginError" class="form-error"></span>
    <button id="collabLogin" class="nav-button active" type="button">Entrar</button>
  </div>`;
}

function prepareCollaboratorPdfExport() {
  const seller = selectedCollabSeller();
  if (!seller || activeCollaboratorId !== seller.id) {
    alert("Entre com a senha do colaborador antes de exportar.");
    return;
  }
  const stamp = document.getElementById("collabExportStamp");
  if (stamp) {
    stamp.innerHTML = `
      <strong>Relatorio do colaborador</strong>
      <span>${seller.name} - ${seller.branch} - ${seller.area}</span>
      <span>Mes: ${state.period.month} | Dias realizados: ${state.period.daysDone} | Dias uteis: ${state.period.daysTotal}</span>
      <span>Exportado em ${dateTime.format(new Date())}</span>
    `;
  }
  document.body.classList.add("print-collaborator");
  window.setTimeout(() => window.print(), 150);
}

function renderCollaborator() {
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
    <div class="hero-number"><span>${seller.name}</span><strong>${seller.area}</strong></div>
    <div class="hero-number"><span>Comissao total proj.</span><strong>${money.format(projectedTotalBeforeDeflator)}</strong></div>
    <div class="hero-number"><span>Deflator</span><strong>${money.format(result.projectedDeflator)}</strong></div>
    <div class="hero-number"><span>Comissao final proj.</span><strong>${money.format(result.projected)}</strong></div>
    <div class="hero-number"><span>Status</span><strong><span class="status ${status.cls}">${status.label}</span></strong></div>
    <button id="collabLogout" class="ghost-button" type="button">Trocar colaborador</button>
  `;
  document.getElementById("collabMetricsBody").innerHTML = metricsFor(seller.area).map((metric) => {
    const value = seller.values[metric.id];
    const projectedValue = projected(value.realized);
    const missing = Math.max((Number(value.goal) || 0) - (Number(value.realized) || 0), 0);
    return `<tr>
      <td>${metric.name}</td>
      <td>${num.format(value.goal)}</td>
      <td><input data-collab-realized="${metric.id}" type="number" value="${value.realized}"></td>
      <td>${num.format(missing)}</td>
      <td>${num.format(projectedValue)}</td>
      <td>${money.format(metricCommission(seller, metric, "projected"))}</td>
    </tr>`;
  }).join("");
}

function updateActionVisibility() {
  const isPrivilegedView = document.getElementById("adminView").classList.contains("active") || document.getElementById("dashboardView").classList.contains("active");
  document.querySelectorAll(".admin-action").forEach((item) => {
    item.hidden = !isPrivilegedView;
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

function showAdminLogin() {
  document.getElementById("adminLock").classList.add("active");
  document.getElementById("adminPassword").value = "";
  document.getElementById("adminPassword").focus();
}

function openView(view) {
  if ((view === "admin" || view === "dashboard") && !isAdminUnlocked()) {
    showAdminLogin();
    return;
  }
  document.querySelectorAll(".nav-button").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  document.querySelectorAll(".view").forEach((panel) => panel.classList.remove("active"));
  document.getElementById(`${view}View`).classList.add("active");
  document.getElementById("viewTitle").textContent = document.querySelector(`[data-view="${view}"]`).textContent;
  updateActionVisibility();
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest(".nav-button");
  if (nav && nav.dataset.view) openView(nav.dataset.view);

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
    sessionStorage.removeItem(BRANCH_SESSION_KEY);
    renderAll();
  }
  if (event.target.id === "addSeller") {
    state.sellers.push({ id: makeId(), name: "NOVO VENDEDOR", branch: "FILIAL", area: "Cabo", adjustments: { quality: 0, insurance: 0, carousel: 0 }, password: "1234", values: {} });
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
      document.getElementById("collabLoginError").textContent = "Senha incorreta";
    }
  }

  if (event.target.id === "collabLogout") {
    activeCollaboratorId = "";
    sessionStorage.removeItem(COLLAB_SESSION_KEY);
    renderAll();
  }

  if (event.target.id === "adminLogin") {
    const typed = document.getElementById("adminPassword").value;
    if (typed === adminPassword()) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "ok");
      document.getElementById("adminLock").classList.remove("active");
      openView("admin");
    } else {
      document.getElementById("adminLoginError").textContent = "Senha incorreta";
    }
  }

  if (event.target.id === "adminCancel") document.getElementById("adminLock").classList.remove("active");
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target.id === "daysDone") state.period.daysDone = Number(target.value) || 1;
  if (target.id === "adminPeriodMonth") state.period.month = target.value;
  if (target.id === "adminDaysTotal") state.period.daysTotal = Number(target.value) || 1;
  if (target.id === "daysDone" || target.id === "adminPeriodMonth" || target.id === "adminDaysTotal") {
    saveState();
    document.getElementById("periodMonthDisplay").textContent = state.period.month;
    document.getElementById("daysTotalDisplay").textContent = state.period.daysTotal;
    renderDashboard();
    renderAdminMetrics();
    renderManager();
    renderCollaborator();
  }

  if (target.id === "branchFilter") {
    activeBranchFilter = target.value;
    renderDashboard();
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
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && document.getElementById("adminLock").classList.contains("active")) {
    document.getElementById("adminLogin").click();
  }
});

window.addEventListener("afterprint", () => {
  document.body.classList.remove("print-collaborator");
});

for (const seller of state.sellers) ensureSellerValues(seller);
state.customMetrics = normalizeCustomMetrics(state.customMetrics);
state.branches = normalizeBranches(state.branches, state.sellers);
state.deflators = normalizeDeflators(state.deflators);
state.branchPasswords = normalizeBranchPasswords(state.branchPasswords, state.managerAccess, state._legacyManagers, state.branches);
state.settings = { ...defaultSettings(), ...(state.settings || {}), adminPassword: adminPassword() };
localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
renderAll();
loadStateFromCloud();

