const CONFIG = {
    temp: {
        key: "temp",
        title: "Температура воздуха",
        icon: "🌡️",
        unit: "°C",
        min: 14,
        max: 30,
        normalMin: 22,
        normalMax: 26,
        measure: "1 раз / 5 мин",
        description: "Температура влияет на фотосинтез и скорость роста растений.",
        updateInterval: 5 * 60 * 1000,
        changeRange: 0.6
    },
    hum: {
        key: "hum",
        title: "Влажность воздуха",
        icon: "💧",
        unit: "%",
        min: 50,
        max: 85,
        normalMin: 60,
        normalMax: 75,
        measure: "1 раз / 15 мин",
        description: "Влажность влияет на транспирацию и усвоение питательных веществ.",
        updateInterval: 15 * 60 * 1000,
        changeRange: 4
    },
    co2: {
        key: "co2",
        title: "Уровень CO₂",
        icon: "🌪️",
        unit: "ppm",
        min: 350,
        max: 800,
        normalMin: 400,
        normalMax: 600,
        measure: "1 раз / 10 мин",
        description: "Уровень CO₂ влияет на интенсивность фотосинтеза.",
        updateInterval: 10 * 60 * 1000,
        changeRange: 10
    },
    water: {
        key: "water",
        title: "Расход воды",
        icon: "🚰",
        unit: "л",
        min: 80,
        max: 180,
        normalMin: 90,
        normalMax: 160,
        measure: "постоянно",
        description: "Автоматический контроль расхода воды.",
        updateInterval: 60 * 1000,
        changeRange: 2.4
    }
};

const state = {
    temp: 23.3,
    hum: 73,
    co2: 450,
    water: 121.3,
    waterAvg: 118,
    waterLimit: 200,
    nextWatering: "2ч 12мин",
    
    area: 1800,
    plants: 4500,
    yield: 27000,
    price: 150,
    season: 7,
    winterMonths: 3,
    winterDays: 90,
    eveningLight: 5000,
    backlight: 0,
    revenue: 2700000,
    
    construction: 2300000,
    heating: 750000,
    lighting: 500000,
    watering: 300000,
    automation: 400000,
    monthlyExpenses: 5220000,
    harvestIncome: 2880000,
    netProfit: 2445000,
    
    dailyHeating: 5918,
    dailyElectricity: 2959,
    dailyWater: 493,
    dailySalary: 2630,
    dailyFertilizer: 1315,
    dailyMaintenance: 822,
    dailyInternet: 164,
    dailyTotal: 14301,
    monthlyTotal: 435000,
    yearlyTotal: 5220000,
    
    tomatoYield: 20,
    tomatoTotal: 36000,
    tomatoPrice: 80,
    tomatoIncome: 2880000,
    cucumberYield: 20,
    
    revenueYear: 2880000,
    expensesYear: 435000,
    netProfitYear: 2445000,
    investment: 5580000,
    paybackPeriod: 3,
    
    history: {
        temp: [23.2, 23.3, 23.5, 23.7, 23.9, 24.0, 24.1, 24.0, 23.8, 23.6, 23.4, 23.2, 23.1, 23.3, 23.5, 23.7, 23.9, 24.0, 24.1, 23.9, 23.7, 23.5, 23.3, 23.2],
        hum: [70, 71, 72, 73, 74, 75, 76, 75, 74, 73, 72, 71, 70, 71, 72, 73, 74, 75, 76, 75, 74, 73, 72, 71],
        co2: [443, 445, 447, 449, 450, 452, 454, 456, 455, 453, 451, 449, 447, 445, 443, 444, 446, 448, 450, 452, 454, 456, 454, 452],
        water: [112, 118, 124, 130, 125, 118, 112, 108, 115, 122, 128, 124, 118, 114, 110, 116, 122, 128, 132, 126, 120, 115, 110, 118]
    },
    
    lastUpdate: {
        temp: Date.now(),
        hum: Date.now(),
        co2: Date.now(),
        water: Date.now()
    }
};

const charts = {};
let economicsPeriod = "month";
let currentChartType = "expenses";
let activeModal = null;

const economicData = {
    day: {
        expenses: Array.from({length: 24}, (_, i) => 150000 + Math.random() * 30000),
        income: Array.from({length: 24}, (_, i) => 80000 + Math.random() * 20000),
        profit: Array.from({length: 24}, (_, i) => -20000 + Math.random() * 40000),
        labels: Array.from({length: 24}, (_, i) => `${i}:00`)
    },
    month: {
        expenses: [5220000, 5742000, 6316200, 6947820, 7642602, 8406864],
        income: [2880000, 2880000, 2880000, 2880000, 2880000, 2880000],
        profit: [-2340000, -2862000, -3436200, -4067820, -4762602, -5526864],
        labels: ['2025', '2026', '2027', '2028', '2029', '2030']
    },
    year: {
        expenses: [5220000 * 12, 5742000 * 12, 6316200 * 12, 6947820 * 12, 7642602 * 12, 8406864 * 12],
        income: [2880000 * 12, 2880000 * 12, 2880000 * 12, 2880000 * 12, 2880000 * 12, 2880000 * 12],
        profit: [-2340000 * 12, -2862000 * 12, -3436200 * 12, -4067820 * 12, -4762602 * 12, -5526864 * 12],
        labels: ['2025', '2026', '2027', '2028', '2029', '2030']
    }
};

const PERIOD_META = {
    day: { label: "день", fromMonthlyFactor: 1 / 30, toMonthlyFactor: 30 },
    month: { label: "месяц", fromMonthlyFactor: 1, toMonthlyFactor: 1 },
    year: { label: "год", fromMonthlyFactor: 12, toMonthlyFactor: 1 / 12 }
};

function getPeriodMeta(period) {
    return PERIOD_META[period] || PERIOD_META.month;
}

function getPeriodLabels(period, length) {
    const now = new Date();

    if (period === "day") {
        return Array.from({ length }, (_, i) => {
            const d = new Date(now);
            d.setHours(now.getHours() - (length - 1 - i), 0, 0, 0);
            return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
        });
    }

    if (period === "month") {
        return Array.from({ length }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (length - 1 - i), 1);
            const month = String(d.getMonth() + 1).padStart(2, "0");
            return `${month}.${d.getFullYear()}`;
        });
    }

    return Array.from({ length }, (_, i) => String(now.getFullYear() - (length - 1 - i)));
}

function getTrend(values) {
    if (!Array.isArray(values) || values.length < 2) {
        return { cls: "trend-flat", arrow: "→", percent: 0 };
    }

    const last = values[values.length - 1];
    const prev = values[values.length - 2];
    const delta = last - prev;
    const percent = prev === 0 ? 0 : (delta / Math.abs(prev)) * 100;

    if (delta > 0) return { cls: "trend-up", arrow: "▲", percent };
    if (delta < 0) return { cls: "trend-down", arrow: "▼", percent };
    return { cls: "trend-flat", arrow: "→", percent: 0 };
}

function getEconomicsSnapshot(period) {
    const periodData = economicData[period];
    const idx = periodData.income.length - 1;

    return {
        income: periodData.income[idx],
        expenses: periodData.expenses[idx],
        profit: periodData.profit[idx],
        incomeTrend: getTrend(periodData.income),
        expensesTrend: getTrend(periodData.expenses),
        profitTrend: getTrend(periodData.profit),
        labels: getPeriodLabels(period, periodData.labels.length)
    };
}

function getPeriodValueFromMonth(value, period) {
    return value * getPeriodMeta(period).fromMonthlyFactor;
}

function getEconomicsPeriodValues(period) {
    const monthlyRevenue = state.yield * state.price;
    const monthlyExpenses = state.monthlyExpenses;
    const revenue = getPeriodValueFromMonth(monthlyRevenue, period);
    const expenses = getPeriodValueFromMonth(monthlyExpenses, period);
    const profit = revenue - expenses;

    return {
        revenue,
        expenses,
        profit,
        paybackMonths: getDisplayPaybackMonths(profit, period)
    };
}

function getPaybackMonthsByProfit(periodProfit, period) {
    if (periodProfit <= 0) return null;
    const monthlyProfit = periodProfit * getPeriodMeta(period).toMonthlyFactor;
    if (monthlyProfit <= 0) return null;
    return state.investment / monthlyProfit;
}

function getDisplayPaybackMonths(periodProfit, period) {
    const dynamicPayback = getPaybackMonthsByProfit(periodProfit, period);
    if (dynamicPayback && Number.isFinite(dynamicPayback) && dynamicPayback > 0) {
        return dynamicPayback;
    }
    return state.paybackPeriod;
}

function formatSignedMoney(v) {
    const sign = v > 0 ? "+" : v < 0 ? "-" : "";
    return `${sign}${formatMoney(Math.abs(v))}`;
}

function formatTrendText(trend) {
    const pct = trend.percent > 0 ? `+${formatNumber(trend.percent, 1)}` : formatNumber(trend.percent, 1);
    return `${trend.arrow} ${pct}%`;
}

const METRIC_IDS = {
    temp: { value: "tempValueDisplay", min: "tempMinVal", max: "tempMaxVal", avg: "tempAvgVal", status: "tempStatusBadge", chart: "tempChart", decimals: 1, color: "#ff7b47" },
    hum: { value: "humValueDisplay", min: "humMinVal", max: "humMaxVal", avg: "humAvgVal", status: "humStatusBadge", chart: "humChart", decimals: 0, color: "#4f88ff" },
    co2: { value: "co2ValueDisplay", min: "co2MinVal", max: "co2MaxVal", avg: "co2AvgVal", status: "co2StatusBadge", chart: "co2Chart", decimals: 0, color: "#9b59b6" },
    water: { value: "waterValueDisplay", status: "waterStatusBadge", chart: "waterChart", decimals: 1, color: "#4f88ff" }
};

document.addEventListener("DOMContentLoaded", init);

function init() {
    const saved = localStorage.getItem("teplicaTheme");
    if (saved === "dark") {
        document.body.classList.add("dark-theme");
    }
    syncThemeIcon();
    bindModal();
    cacheCharts();
    resizeCanvases();
    renderAll();
    
    setInterval(() => updateParameter("temp"), CONFIG.temp.updateInterval);
    setInterval(() => updateParameter("hum"), CONFIG.hum.updateInterval);
    setInterval(() => updateParameter("co2"), CONFIG.co2.updateInterval);
    setInterval(() => updateParameter("water"), CONFIG.water.updateInterval);
    setInterval(() => updateEconomicsData(), 60 * 60 * 1000);
    
    window.addEventListener("resize", handleViewportResize, { passive: true });
}

function updateParameter(key) {
    const cfg = CONFIG[key];
    const range = cfg.changeRange;
    
    switch(key) {
        case "temp":
            state.temp = clamp(round(state.temp + rand(-range/2, range/2), 1), 21.6, 25.6);
            pushHistory("temp", state.temp);
            break;
        case "hum":
            state.hum = clamp(Math.round(state.hum + rand(-range/2, range/2)), 66, 79);
            pushHistory("hum", state.hum);
            break;
        case "co2":
            state.co2 = clamp(Math.round(state.co2 + rand(-range/2, range/2)), 430, 470);
            pushHistory("co2", state.co2);
            break;
        case "water":
            state.water = clamp(round(state.water + rand(-range/2, range/2), 1), 98, 148);
            pushHistory("water", state.water);
            break;
    }
    
    state.lastUpdate[key] = Date.now();
    renderAll();
}

function updateEconomicsData() {
    state.netProfit = Math.round(state.netProfit * (1 + rand(-0.02, 0.02)));
    state.revenue = Math.round(state.revenue * (1 + rand(-0.01, 0.01)));
    renderAll();
}

function bindModal() {
    const modal = document.getElementById("modal");
    modal.addEventListener("click", (e) => {
        if (e.target === modal || e.target.closest("[data-close]")) {
            closeModal();
        }
        const periodBtn = e.target.closest(".period-btn[data-period]");
        if (periodBtn) {
            economicsPeriod = periodBtn.dataset.period;
            renderEconomicsSection();
            openEconomicsModal();
        }
        const chartBtn = e.target.closest(".chart-type-btn");
        if (chartBtn) {
            currentChartType = chartBtn.dataset.chart;
            openEconomicsModal();
        }
    });
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.style.display === "flex") closeModal();
    });
}

function cacheCharts() {
    Object.values(METRIC_IDS).forEach((meta) => {
        const canvas = document.getElementById(meta.chart);
        if (canvas) charts[meta.chart] = canvas;
    });
}

function resizeCanvases() {
    Object.values(charts).forEach((canvas) => {
        fitCanvasToContainer(canvas);
    });
    drawMainSparklines();
}

function fitCanvasToContainer(canvas, fallbackHeight = 70) {
    if (!canvas) return false;
    const parent = canvas.parentElement;
    const width = Math.floor(canvas.clientWidth || parent?.clientWidth || 0);
    const heightBase = canvas.clientHeight || parent?.clientHeight || fallbackHeight;
    const height = Math.max(56, Math.floor(heightBase || fallbackHeight));
    if (width <= 0) return false;
    canvas.width = width;
    canvas.height = height;
    return true;
}

function handleViewportResize() {
    resizeCanvases();
    drawActiveModalChart();
}

function drawActiveModalChart() {
    const modal = document.getElementById("modal");
    if (!activeModal || !modal || modal.style.display !== "flex") return;

    switch (activeModal.type) {
        case "metric":
            drawMetricModalChart();
            break;
        case "water":
            drawWaterModalChart();
            break;
        case "economics":
            drawEconomicsModalChart();
            break;
    }
}

function drawMetricModalChart() {
    if (!activeModal || activeModal.type !== "metric") return;
    const canvas = document.getElementById("modalChart");
    if (!canvas || !fitCanvasToContainer(canvas, 92)) return;
    const key = activeModal.key;
    drawSparkCanvas(canvas, state.history[key], METRIC_IDS[key].color);
}

function drawWaterModalChart() {
    if (!activeModal || activeModal.type !== "water") return;
    const canvas = document.getElementById("modalWaterChart");
    if (!canvas || !fitCanvasToContainer(canvas, 92)) return;
    drawSparkCanvas(canvas, state.history.water.slice(-20), METRIC_IDS.water.color);
}

function drawEconomicsModalChart() {
    if (!activeModal || activeModal.type !== "economics") return;
    const canvas = document.getElementById("economicChart");
    if (!canvas || !fitCanvasToContainer(canvas, 160)) return;
    drawEconomicChart(canvas, economicsPeriod, currentChartType);
}

function renderAll() {
    renderMetricCard("temp");
    renderMetricCard("hum");
    renderMetricCard("co2");
    renderWaterCard();
    renderEconomicsSection();
    drawMainSparklines();
}

function renderMetricCard(key) {
    const meta = METRIC_IDS[key];
    const cfg = CONFIG[key];
    const val = state[key];
    const stats = getStats(state.history[key], meta.decimals);
    const status = getStatus(val, cfg);

    document.getElementById(meta.value).textContent = `${formatNumber(val, meta.decimals)} ${cfg.unit}`;
    if (meta.min) document.getElementById(meta.min).textContent = stats.min;
    if (meta.max) document.getElementById(meta.max).textContent = stats.max;
    if (meta.avg) document.getElementById(meta.avg).textContent = stats.avg;
    paintStatus(document.getElementById(meta.status), status);
}

function renderWaterCard() {
    const status = getStatus(state.water, CONFIG.water);
    document.getElementById("waterValueDisplay").textContent = `${formatNumber(state.water, 1)} л`;
    document.getElementById("waterAvg").textContent = formatNumber(state.waterAvg, 0);
    document.getElementById("waterLimit").textContent = formatNumber(state.waterLimit, 0);
    document.getElementById("waterLeft").textContent = formatNumber(state.waterLimit - state.water, 1);
    paintStatus(document.getElementById("waterStatusBadge"), status);
}

function renderEconomicsSection() {
    const root = document.getElementById("economicsContent");
    const periodMeta = getPeriodMeta(economicsPeriod);
    const snapshot = getEconomicsSnapshot(economicsPeriod);
    const periodValues = getEconomicsPeriodValues(economicsPeriod);
    const paybackMonths = periodValues.paybackMonths;
    const profitClass = periodValues.profit > 0 ? "value-up" : periodValues.profit < 0 ? "value-down" : "value-flat";

    root.innerHTML = `
        <div class="economics-soil-grid">
            <div class="soil-item">
                <div class="soil-head">
                    <span class="soil-icon">📐</span>
                    <span class="soil-label">Площадь</span>
                </div>
                <div class="soil-value">${formatNumber(state.area, 0)} м²</div>
            </div>
            <div class="soil-item">
                <div class="soil-head">
                    <span class="soil-icon">🌿</span>
                    <span class="soil-label">Растений</span>
                </div>
                <div class="soil-value">${formatNumber(state.plants, 0)} шт</div>
            </div>
        </div>
        <div class="economics-grid">
            <div class="economics-item"><div class="economics-label">Урожайность</div><div class="economics-value">${formatNumber(state.yield, 0)} кг</div><div class="economics-subvalue">6 кг/растение</div></div>
            <div class="economics-item"><div class="economics-label">Цена</div><div class="economics-value">${formatMoney(state.price)} сом</div><div class="economics-subvalue">за кг</div></div>
            <div class="economics-item"><div class="economics-label">Выручка</div><div class="economics-value">${formatMoney(periodValues.revenue)} сом</div><div class="economics-subvalue trend-chip ${snapshot.incomeTrend.cls}">${formatTrendText(snapshot.incomeTrend)} за ${periodMeta.label}</div></div>
            <div class="economics-item"><div class="economics-label">Чистая прибыль</div><div class="economics-value ${profitClass}">${formatSignedMoney(periodValues.profit)} сом</div><div class="economics-subvalue trend-chip ${snapshot.profitTrend.cls}">${formatTrendText(snapshot.profitTrend)} за ${periodMeta.label}</div></div>
        </div>
        <div class="economics-total-row"><span class="total-label">Инвестиции</span><span class="total-value">${formatMoney(state.investment)} сом</span></div>
        <div class="profit-row"><span class="profit-label">Окупаемость</span><span class="profit-value">≈ ${formatNumber(paybackMonths, 1)} мес</span></div>
    `;
}

function drawMainSparklines() {
    drawSpark("tempChart", state.history.temp, METRIC_IDS.temp.color);
    drawSpark("humChart", state.history.hum, METRIC_IDS.hum.color);
    drawSpark("co2Chart", state.history.co2, METRIC_IDS.co2.color);
    drawSpark("waterChart", state.history.water, METRIC_IDS.water.color);
}

function drawSpark(id, values, color) {
    const canvas = charts[id];
    if (!canvas || values.length < 2) return;
    drawSparkCanvas(canvas, values, color);
}

function drawSparkCanvas(canvas, values, color) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    if (w <= 0 || h <= 0) return;
    ctx.clearRect(0, 0, w, h);

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const pad = 6;
    const step = (w - pad * 2) / (values.length - 1);

    const points = values.map((v, i) => ({
        x: pad + i * step,
        y: h - pad - ((v - min) / range) * (h - pad * 2)
    }));

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + "44");
    grad.addColorStop(1, color + "08");

    ctx.beginPath();
    ctx.moveTo(points[0].x, h - pad);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h - pad);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function openModal(key) {
    openMetricModal(key);
}

function openMetricModal(key) {
    const cfg = CONFIG[key];
    const val = state[key];
    const history = state.history[key];
    const stats = getStats(history, METRIC_IDS[key].decimals);
    const status = getStatus(val, cfg);
    const lastUpdateTime = new Date(state.lastUpdate[key]).toLocaleTimeString('ru-RU');

    setModalHTML(`
        <div class="modal-header">
            <span class="modal-icon">${cfg.icon}</span>
            <h2>${cfg.title}</h2>
            <span class="modal-status ${status.cls}">${status.text}</span>
            <button class="modal-close" type="button" data-close aria-label="Закрыть">×</button>
        </div>
        <div class="modal-body">
            <div class="modal-current-value">${formatNumber(val, METRIC_IDS[key].decimals)} ${cfg.unit}</div>
            <div class="modal-stats">
                <div class="modal-stat-item"><div class="modal-stat-label">Минимум</div><div class="modal-stat-value">${stats.min} ${cfg.unit}</div></div>
                <div class="modal-stat-item"><div class="modal-stat-label">Максимум</div><div class="modal-stat-value">${stats.max} ${cfg.unit}</div></div>
                <div class="modal-stat-item"><div class="modal-stat-label">Среднее</div><div class="modal-stat-value">${stats.avg} ${cfg.unit}</div></div>
            </div>
            <div class="modal-ranges">
                <div class="range-item"><div class="range-label">Рекомендуемый диапазон</div><div class="range-value">${cfg.normalMin}-${cfg.normalMax} ${cfg.unit}</div></div>
                <div class="range-item"><div class="range-label">Критические значения</div><div class="range-value">ниже ${cfg.min} ${cfg.unit}<br>выше ${cfg.max} ${cfg.unit}</div></div>
            </div>
            <div class="modal-description">
                ${cfg.description}
                <div class="modal-note">⏱️ Частота: ${cfg.measure}</div>
                <div class="modal-note">🕒 Последнее: ${lastUpdateTime}</div>
            </div>
            <div class="modal-chart-container"><canvas id="modalChart"></canvas></div>
        </div>
    `);

    activeModal = { type: "metric", key };
    drawMetricModalChart();
    requestAnimationFrame(drawMetricModalChart);
}

function openWaterModal() {
    const status = getStatus(state.water, CONFIG.water);
    const lastUpdateTime = new Date(state.lastUpdate.water).toLocaleTimeString('ru-RU');

    setModalHTML(`
        <div class="modal-header">
            <span class="modal-icon">🚰</span>
            <h2>Расход воды</h2>
            <span class="modal-status ${status.cls}">${status.text}</span>
            <button class="modal-close" type="button" data-close aria-label="Закрыть">×</button>
        </div>
        <div class="modal-body">
            <div class="modal-current-value">${formatNumber(state.water, 1)} л</div>
            <div class="modal-stats">
                <div class="modal-stat-item"><div class="modal-stat-label">Средний</div><div class="modal-stat-value">${formatNumber(state.waterAvg, 0)} л/день</div></div>
                <div class="modal-stat-item"><div class="modal-stat-label">Лимит</div><div class="modal-stat-value">${formatNumber(state.waterLimit, 0)} л/день</div></div>
                <div class="modal-stat-item"><div class="modal-stat-label">Остаток</div><div class="modal-stat-value">${formatNumber(state.waterLimit - state.water, 1)} л</div></div>
            </div>
            <div class="modal-water-next">⏳ Следующий полив через ${state.nextWatering}</div>
            <div class="modal-ranges">
                <div class="range-item"><div class="range-label">Рекомендуемый диапазон</div><div class="range-value">80-180 л/день</div></div>
                <div class="range-item"><div class="range-label">Критические значения</div><div class="range-value">ниже 80 л<br>выше 180 л</div></div>
            </div>
            <div class="modal-description">
                <p>${CONFIG.water.description}</p>
                <div class="modal-note">⏱️ Частота: ${CONFIG.water.measure}</div>
                <div class="modal-note">🕒 Последнее: ${lastUpdateTime}</div>
            </div>
            <div class="modal-chart-container"><canvas id="modalWaterChart"></canvas></div>
        </div>
    `);

    document.querySelector("#modal .modal-content").classList.add("water-modal");

    activeModal = { type: "water" };
    drawWaterModalChart();
    requestAnimationFrame(drawWaterModalChart);
}

function drawEconomicChart(canvas, period, type) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    if (w <= 0 || h <= 0) return;
    ctx.clearRect(0, 0, w, h);

    const data = economicData[period][type];
    
    let color;
    switch(type) {
        case 'expenses': color = "#ff7b47"; break;
        case 'income': color = "#4f88ff"; break;
        case 'profit': color = "#2b8c4c"; break;
        default: color = "#ff7b47";
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 8;
    const step = (w - pad * 2) / (data.length - 1);

    const points = data.map((v, i) => ({
        x: pad + i * step,
        y: h - pad - ((v - min) / range) * (h - pad * 2)
    }));

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + "44");
    grad.addColorStop(1, color + "08");

    ctx.beginPath();
    ctx.moveTo(points[0].x, h - pad);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h - pad);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const pointRadius = w < 420 ? 3 : 4;
    const shouldAnnotate = w >= 360;
    const dayLabelStep = Math.max(4, Math.ceil(data.length / Math.max(4, Math.floor(w / 80))));

    points.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, pointRadius, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (!shouldAnnotate) return;

        if (period === "day" && i % dayLabelStep === 0) {
            ctx.font = "bold 8px Inter";
            ctx.fillStyle = color;
            const value = data[i] >= 1000 ? `${(data[i] / 1000).toFixed(0)}K` : data[i].toFixed(0);
            ctx.fillText(value, p.x - 12, p.y - 12);
        } else if (period !== "day") {
            ctx.font = "bold 9px Inter";
            ctx.fillStyle = color;
            const value = data[i] >= 1000000 ? `${(data[i] / 1000000).toFixed(1)}M` :
                data[i] >= 1000 ? `${(data[i] / 1000).toFixed(0)}K` : data[i];
            ctx.fillText(value, p.x - 15, p.y - 12);
        }
    });
}

function openEconomicsModal() {
    const periodMeta = getPeriodMeta(economicsPeriod);
    const snapshot = getEconomicsSnapshot(economicsPeriod);
    const periodValues = getEconomicsPeriodValues(economicsPeriod);
    const labels = snapshot.labels;
    const labelStep = economicsPeriod === "day" ? 3 : 1;
    const paybackMonths = periodValues.paybackMonths;
    const profitClass = periodValues.profit > 0 ? "value-up" : periodValues.profit < 0 ? "value-down" : "value-flat";

    setModalHTML(`
        <div class="modal-header">
            <span class="modal-icon">📊</span>
            <h2>Экономические показатели</h2>
            <span class="modal-status modal-status-normal">${periodMeta.label}</span>
            <button class="modal-close" type="button" data-close aria-label="Закрыть">×</button>
        </div>
        <div class="period-selector">
            <button class="period-btn ${economicsPeriod === "day" ? "active" : ""}" type="button" data-period="day">День</button>
            <button class="period-btn ${economicsPeriod === "month" ? "active" : ""}" type="button" data-period="month">Месяц</button>
            <button class="period-btn ${economicsPeriod === "year" ? "active" : ""}" type="button" data-period="year">Год</button>
        </div>
        <div class="modal-body">
            <div class="economics-detailed-grid">
                <div class="economics-detailed-item"><div class="economics-detailed-label">📐 Площадь</div><div class="economics-detailed-value">${formatNumber(state.area, 0)} м²</div><div class="economics-detailed-subvalue">30×60 м</div></div>
                <div class="economics-detailed-item"><div class="economics-detailed-label">🌿 Растений</div><div class="economics-detailed-value">${formatNumber(state.plants, 0)} шт</div><div class="economics-detailed-subvalue">2,5 раст/м²</div></div>
                <div class="economics-detailed-item"><div class="economics-detailed-label">🍅 Урожайность</div><div class="economics-detailed-value">${formatNumber(state.yield, 0)} кг</div><div class="economics-detailed-subvalue">6 кг/растение</div></div>
                <div class="economics-detailed-item"><div class="economics-detailed-label">💰 Цена</div><div class="economics-detailed-value">${formatMoney(state.price)} сом</div><div class="economics-detailed-subvalue">за кг</div></div>
                <div class="economics-detailed-item"><div class="economics-detailed-label">💵 Выручка</div><div class="economics-detailed-value">${formatMoney(periodValues.revenue)} сом</div><div class="economics-detailed-subvalue trend-chip ${snapshot.incomeTrend.cls}">${formatTrendText(snapshot.incomeTrend)} за ${periodMeta.label}</div></div>
                <div class="economics-detailed-item"><div class="economics-detailed-label">🏗️ Строительство</div><div class="economics-detailed-value">${formatMoney(state.construction)} сом</div><div class="economics-detailed-subvalue">разовые</div></div>
                <div class="economics-detailed-item"><div class="economics-detailed-label">🔥 Отопление</div><div class="economics-detailed-value">${formatMoney(state.heating)} сом</div><div class="economics-detailed-subvalue">зимний сезон</div></div>
                <div class="economics-detailed-item"><div class="economics-detailed-label">💡 Освещение</div><div class="economics-detailed-value">${formatMoney(state.lighting)} сом</div><div class="economics-detailed-subvalue">LED + проводка</div></div>
                <div class="economics-detailed-item"><div class="economics-detailed-label">💧 Полив</div><div class="economics-detailed-value">${formatMoney(state.watering)} сом</div><div class="economics-detailed-subvalue">капельный</div></div>
                <div class="economics-detailed-item"><div class="economics-detailed-label">🤖 Автоматизация</div><div class="economics-detailed-value">${formatMoney(state.automation)} сом</div><div class="economics-detailed-subvalue">умная теплица</div></div>
                <div class="economics-detailed-item"><div class="economics-detailed-label">📆 Расходы</div><div class="economics-detailed-value">${formatMoney(periodValues.expenses)} сом</div><div class="economics-detailed-subvalue trend-chip ${snapshot.expensesTrend.cls}">${formatTrendText(snapshot.expensesTrend)} за ${periodMeta.label}</div></div>
                <div class="economics-detailed-item"><div class="economics-detailed-label">🍅 Помидоры</div><div class="economics-detailed-value">${formatNumber(state.tomatoTotal, 0)} кг</div><div class="economics-detailed-subvalue">${formatMoney(state.tomatoPrice)} сом/кг</div></div>
            </div>
            
            <div class="economics-chart-panel">
                <div class="chart-type-controls">
                    <button class="period-btn chart-type-btn ${currentChartType === "expenses" ? "active" : ""}" type="button" data-chart="expenses">📉 Расходы</button>
                    <button class="period-btn chart-type-btn ${currentChartType === "income" ? "active" : ""}" type="button" data-chart="income">📈 Доход</button>
                    <button class="period-btn chart-type-btn ${currentChartType === "profit" ? "active" : ""}" type="button" data-chart="profit">💰 Прибыль</button>
                </div>
                <div class="modal-chart-container modal-chart-container-lg">
                    <canvas id="economicChart"></canvas>
                </div>
                <div class="economic-label-row">
                    ${labels.map((label, index) => {
                        const show = index % labelStep === 0 || index === labels.length - 1;
                        return `<span class="economic-label${show ? "" : " is-empty"}">${show ? label : ""}</span>`;
                    }).join("")}
                </div>
            </div>
            
            <div class="economics-total"><span class="economics-total-label">💰 Чистая прибыль</span><span class="economics-total-value economics-profit-value ${profitClass}">${formatSignedMoney(periodValues.profit)} сом</span></div>
            <div class="economics-total"><span class="economics-total-label">💼 Инвестиции</span><span class="economics-total-value">${formatMoney(state.investment)} сом</span></div>
            <div class="economics-total economics-total-profit"><span class="economics-total-label">⏱️ Окупаемость</span><span class="economics-total-value">≈ ${formatNumber(paybackMonths, 1)} мес</span></div>
            <div class="modal-description modal-description-compact">
                <p>📊 Данные из Excel-расчета теплицы 30×60 м</p>
                <p>📅 Период расчета: ${periodMeta.label}</p>
                <p>❄️ Отопление: ${state.winterMonths} мес (${state.winterDays} дней досветки)</p>
                <p>🌙 Вечерний свет: ${formatNumber(state.eveningLight, 0)} кВт·ч за сезон</p>
            </div>
        </div>
    `);

    activeModal = { type: "economics" };
    requestAnimationFrame(drawEconomicsModalChart);
}

function setModalHTML(html) {
    const content = document.querySelector("#modal .modal-content");
    content.classList.remove("water-modal");
    content.innerHTML = html;
    const modal = document.getElementById("modal");
    modal.style.display = "flex";
    document.body.classList.add("modal-open");
}

function closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
    activeModal = null;
}

function toggleTheme() {
    document.body.classList.toggle("dark-theme");
    localStorage.setItem("teplicaTheme", document.body.classList.contains("dark-theme") ? "dark" : "light");
    syncThemeIcon();
}

function syncThemeIcon() {
    const icon = document.querySelector(".theme-icon");
    if (icon) {
        icon.textContent = document.body.classList.contains("dark-theme") ? "☀️" : "🌙";
    }
}

function getStats(arr, decimals) {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    return {
        min: formatNumber(min, decimals),
        max: formatNumber(max, decimals),
        avg: formatNumber(avg, decimals)
    };
}

function getStatus(value, cfg) {
    if (value <= cfg.min || value >= cfg.max) return { text: "Критично", cls: "modal-status-critical" };
    const band = (cfg.max - cfg.min) * 0.12;
    if (value <= cfg.min + band || value >= cfg.max - band) return { text: "Риск", cls: "modal-status-critical" };
    return { text: "Норма", cls: "modal-status-normal" };
}

function paintStatus(el, status) {
    el.textContent = status.text;
    el.classList.remove("modal-status-normal", "modal-status-critical");
    el.classList.add(status.cls);
}

function pushHistory(key, value) {
    state.history[key].push(value);
    state.history[key].shift();
}

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function round(v, decimals) {
    const p = 10 ** decimals;
    return Math.round(v * p) / p;
}

function formatNumber(v, decimals) {
    return Number(v).toLocaleString("ru-RU", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function formatMoney(v) {
    return Math.round(v).toLocaleString("ru-RU");
}
