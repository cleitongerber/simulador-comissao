const STORAGE_KEY = "commission-simulator-v2";
const ADMIN_PASSWORD_KEY = "commission-admin-password";
const ADMIN_SESSION_KEY = "commission-admin-session";
const COLLAB_SESSION_KEY = "commission-collaborator-session";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const pct = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
const num = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

function makeId() {
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function adminPassword() {
  return state?.settings?.adminPassword || localStorage.getItem(ADMIN_PASSWORD_KEY) || "admin123";
}

function isAdminUnlocked() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "ok";
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
  Cabo: { grossMin: 0.8, tvMin: 0.8, penaltyRate: 0.5 },
  "Nao Cabo": { grossMin: 0.8, tvMin: 0.25, penaltyRate: 0.5 },
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
    deflators: structuredClone(defaultDeflators),
  };
}

let state = loadState();
let activeAreaFilter = "Todas";
let activeBranchFilter = "Todas";
let activeCollaboratorId = sessionStorage.getItem(COLLAB_SESSION_KEY) || "";

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("commission-simulator-v1");
  const fallback = seedState();
  fallback.settings = fallback.settings || { adminPassword: "admin123" };
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

function normalizeState(candidate) {
  if (!candidate || typeof candidate !== "object" || !Array.isArray(candidate.sellers)) {
    throw new Error("Arquivo de backup invalido.");
  }
  candidate.period = candidate.period || { month: "JUNHO", daysDone: 1, daysTotal: 1 };
  candidate.settings = candidate.settings || { adminPassword: "admin123" };
  candidate.rules = candidate.rules || structuredClone(defaultRules);
  candidate.deflators = candidate.deflators || structuredClone(defaultDeflators);
  for (const seller of candidate.sellers) ensureSellerValues(seller);
  return candidate;
}

function saveState(message = "Salvo no banco") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateSaveStatus(message);
}

function metricsFor(area) {
  return areaMetrics[area] || [];
}

function ensureSellerValues(seller) {
  seller.values = seller.values || {};
  seller.adjustments = seller.adjustments || { quality: 0, insurance: 0, carousel: 0 };
  if (!seller.password) seller.password = "1234";
  for (const metric of metricsFor(seller.area)) {
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
  const gross = percentFor(seller, "gross", useProjected);
  const tv = percentFor(seller, "tv", useProjected);
  const applies = gross < Number(config.grossMin) || tv < Number(config.tvMin);
  return applies ? -subtotal * Number(config.penaltyRate || 0) : 0;
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
  return [...new Set(state.sellers.map((seller) => seller.branch || "Sem filial"))].sort();
}

function visibleSellers() {
  return state.sellers.filter((seller) => {
    const areaOk = activeAreaFilter === "Todas" || seller.area === activeAreaFilter;
    const branchOk = activeBranchFilter === "Todas" || seller.branch === activeBranchFilter;
    return areaOk && branchOk;
  });
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
  renderRanking(sellers);
}

function renderAreaBars(sellers) {
  const areas = ["Cabo", "Nao Cabo"].map((area) => ({
    area,
    total: sellers.filter((seller) => seller.area === area).reduce((sum, seller) => sum + sellerResult(seller).projected, 0),
  }));
  const max = Math.max(1, ...areas.map((item) => Math.abs(item.total)));
  document.getElementById("areaBars").innerHTML = areas.map((item) => `
    <div class="bar-row">
      <div class="bar-label"><span>${item.area}</span><span>${money.format(item.total)}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.max(2, Math.abs(item.total) / max * 100)}%"></div></div>
    </div>
  `).join("");
}

function renderRanking(sellers) {
  const ranked = [...sellers].sort((a, b) => sellerResult(b).gain - sellerResult(a).gain).slice(0, 5);
  document.getElementById("rankingList").innerHTML = ranked.map((seller, index) => {
    const result = sellerResult(seller);
    return `<div class="rank-card"><strong>${index + 1}. ${seller.name}</strong><br><span>${seller.branch} - ${seller.area} - ${money.format(result.gain)}</span></div>`;
  }).join("");
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
      <label>Filial<input data-seller-field="branch" data-seller-id="${seller.id}" value="${seller.branch}"></label>
      <label>Qualidade<input data-adjustment="quality" data-seller-id="${seller.id}" type="number" value="${seller.adjustments?.quality || 0}"></label>
      <label>Seguro<input data-adjustment="insurance" data-seller-id="${seller.id}" type="number" value="${seller.adjustments?.insurance || 0}"></label>
      <label>Carrossel<input data-adjustment="carousel" data-seller-id="${seller.id}" type="number" value="${seller.adjustments?.carousel || 0}"></label>
      <label>Senha colaborador<input data-seller-field="password" data-seller-id="${seller.id}" type="text" value="${seller.password || "1234"}"></label>
      <button class="delete-seller-button" data-delete-seller="${seller.id}" type="button">Excluir vendedor</button>
    </div>
  `).join("");
  renderAdminMetrics();
  renderRules();
  renderDeflators();
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
    const config = state.deflators[area] || defaultDeflators[area];
    return `<div class="rule-card">
      <h4>${area}</h4>
      <div class="band-grid">
        <label>Gross minimo<input data-deflator="grossMin" data-deflator-area="${area}" type="number" step="0.01" value="${config.grossMin}"></label>
        <label>TV minimo<input data-deflator="tvMin" data-deflator-area="${area}" type="number" step="0.01" value="${config.tvMin}"></label>
        <label>Penalidade<input data-deflator="penaltyRate" data-deflator-area="${area}" type="number" step="0.01" value="${config.penaltyRate}"></label>
      </div>
    </div>`;
  }).join("");
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
  document.getElementById("collabHero").innerHTML = `
    <div class="hero-number"><span>${seller.name}</span><strong>${seller.area}</strong></div>
    <div class="hero-number"><span>Comissao atual</span><strong>${money.format(result.current)}</strong></div>
    <div class="hero-number"><span>Comissao projetada</span><strong>${money.format(result.projected)}</strong></div>
    <div class="hero-number"><span>Deflator projetado</span><strong>${money.format(result.projectedDeflator)}</strong></div>
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

function renderAll() {
  document.getElementById("periodMonth").value = state.period.month;
  document.getElementById("daysDone").value = state.period.daysDone;
  document.getElementById("daysTotal").value = state.period.daysTotal;
  renderDashboard();
  renderAdmin();
  renderCollaborator();
}

function updateSeller(id, field, value) {
  const seller = state.sellers.find((item) => item.id === id);
  if (!seller) return;
  if (field === "area" && seller.area !== value) {
    seller.area = value;
    seller.values = {};
    ensureSellerValues(seller);
  } else {
    seller[field] = value;
  }
  saveState();
  renderAll();
}

function setMetricValue(seller, metricId, field, value) {
  ensureSellerValues(seller);
  seller.values[metricId][field] = Number(value) || 0;
  saveState();
  renderAll();
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
  if (target.id === "periodMonth") state.period.month = target.value;
  if (target.id === "daysDone") state.period.daysDone = Number(target.value) || 1;
  if (target.id === "daysTotal") state.period.daysTotal = Number(target.value) || 1;
  if (target.id === "periodMonth" || target.id === "daysDone" || target.id === "daysTotal") {
    saveState();
    renderDashboard();
    renderAdminMetrics();
    renderCollaborator();
  }

  if (target.id === "branchFilter") {
    activeBranchFilter = target.value;
    renderDashboard();
  }

  if (target.id === "newAdminPassword") {
    if (target.value.trim().length >= 4) {
      state.settings = state.settings || {};
      state.settings.adminPassword = target.value.trim();
      saveState("Senha admin salva");
    }
  }

  if (target.dataset.sellerField) updateSeller(target.dataset.sellerId, target.dataset.sellerField, target.value);
  if (target.dataset.adjustment) {
    const seller = state.sellers.find((item) => item.id === target.dataset.sellerId);
    seller.adjustments[target.dataset.adjustment] = Number(target.value) || 0;
    saveState();
    renderAll();
  }

  const adminSeller = selectedAdminSeller();
  if (target.dataset.metricGoal) setMetricValue(adminSeller, target.dataset.metricGoal, "goal", target.value);
  if (target.dataset.metricRealized) setMetricValue(adminSeller, target.dataset.metricRealized, "realized", target.value);

  const collabSeller = selectedCollabSeller();
  if (target.dataset.collabRealized) setMetricValue(collabSeller, target.dataset.collabRealized, "realized", target.value);

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

  if (target.dataset.deflator) {
    const area = target.dataset.deflatorArea;
    state.deflators[area][target.dataset.deflator] = Number(target.value) || 0;
    saveState();
    renderAll();
  }

  saveState();
});

document.addEventListener("change", (event) => {
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

for (const seller of state.sellers) ensureSellerValues(seller);
state.deflators = state.deflators || structuredClone(defaultDeflators);
state.settings = state.settings || { adminPassword: adminPassword() };
localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
renderAll();
loadStateFromCloud();







