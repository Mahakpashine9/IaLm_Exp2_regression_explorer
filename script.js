const DB = {
  housing: {
    name: "Housing Prices",
    target: "Price (₹ lakh)",
    y: "Price",
    features: [
      ["Area", "Area (sq ft)"],
      ["Bedrooms", "Bedrooms"],
      ["Age", "Age (years)"],
    ],
    rows: [
      { Area: 650, Bedrooms: 1, Age: 18, Price: 32 },
      { Area: 800, Bedrooms: 2, Age: 12, Price: 41 },
      { Area: 900, Bedrooms: 2, Age: 10, Price: 47 },
      { Area: 1050, Bedrooms: 2, Age: 8, Price: 53 },
      { Area: 1200, Bedrooms: 3, Age: 7, Price: 61 },
      { Area: 1350, Bedrooms: 3, Age: 6, Price: 68 },
      { Area: 1450, Bedrooms: 3, Age: 5, Price: 73 },
      { Area: 1600, Bedrooms: 3, Age: 4, Price: 81 },
      { Area: 1750, Bedrooms: 4, Age: 3, Price: 89 },
      { Area: 1900, Bedrooms: 4, Age: 2, Price: 96 },
      { Area: 2050, Bedrooms: 4, Age: 1, Price: 103 },
      { Area: 2200, Bedrooms: 4, Age: 1, Price: 112 },
    ],
  },
  student: {
    name: "Student Performance",
    target: "Exam score (%)",
    y: "Score",
    features: [
      ["StudyHours", "Study hours / week"],
      ["Attendance", "Attendance (%)"],
      ["Sleep", "Sleep hours"],
    ],
    rows: [
      { StudyHours: 2, Attendance: 62, Sleep: 5, Score: 42 },
      { StudyHours: 3, Attendance: 68, Sleep: 6, Score: 48 },
      { StudyHours: 4, Attendance: 70, Sleep: 7, Score: 53 },
      { StudyHours: 5, Attendance: 75, Sleep: 6, Score: 58 },
      { StudyHours: 6, Attendance: 78, Sleep: 7, Score: 64 },
      { StudyHours: 7, Attendance: 80, Sleep: 8, Score: 68 },
      { StudyHours: 8, Attendance: 84, Sleep: 7, Score: 74 },
      { StudyHours: 9, Attendance: 87, Sleep: 8, Score: 79 },
      { StudyHours: 10, Attendance: 90, Sleep: 7, Score: 83 },
      { StudyHours: 11, Attendance: 91, Sleep: 8, Score: 88 },
      { StudyHours: 12, Attendance: 94, Sleep: 8, Score: 92 },
      { StudyHours: 13, Attendance: 96, Sleep: 7, Score: 96 },
    ],
  },
  ev: {
    name: "EV Population",
    target: "Registered EVs (thousands)",
    y: "EVs",
    features: [
      ["Chargers", "Public chargers"],
      ["Income", "Income index"],
      ["Urban", "Urbanization (%)"],
    ],
    rows: [
      { Chargers: 18, Income: 52, Urban: 48, EVs: 4.2 },
      { Chargers: 25, Income: 55, Urban: 51, EVs: 5.1 },
      { Chargers: 31, Income: 58, Urban: 54, EVs: 6.4 },
      { Chargers: 39, Income: 60, Urban: 57, EVs: 7.0 },
      { Chargers: 46, Income: 63, Urban: 59, EVs: 8.3 },
      { Chargers: 54, Income: 65, Urban: 63, EVs: 9.4 },
      { Chargers: 62, Income: 68, Urban: 66, EVs: 10.8 },
      { Chargers: 70, Income: 70, Urban: 69, EVs: 11.5 },
      { Chargers: 79, Income: 73, Urban: 72, EVs: 13.1 },
      { Chargers: 88, Income: 76, Urban: 75, EVs: 14.2 },
      { Chargers: 97, Income: 78, Urban: 78, EVs: 15.5 },
      { Chargers: 108, Income: 82, Urban: 81, EVs: 17.3 },
    ],
  },
};
const $ = (id) => document.getElementById(id);
let data,
  selectedFit,
  results = [],
  activeTab = "overview";
const methodNames = { ols: "OLS", ridge: "Ridge (L2)", lasso: "Lasso (L1)" };
const fmt = (n, d = 3) => (Number.isFinite(n) ? n.toFixed(d) : "—");
function avg(a) {
  return a.reduce((s, v) => s + v, 0) / a.length;
}
function fit(rows, xk, yk, method) {
  let x = rows.map((r) => +r[xk]),
    y = rows.map((r) => +r[yk]),
    mx = avg(x),
    my = avg(y),
    cov = 0,
    v = 0;
  x.forEach((a, i) => {
    cov += (a - mx) * (y[i] - my);
    v += (a - mx) ** 2;
  });
  let slope = cov / (v || 1),
    alpha = method === "ridge" ? 0.18 : method === "lasso" ? 0.65 : 0;
  if (method !== "ols") {
    let shrink = Math.max(0, 1 - alpha / (Math.abs(cov / (v || 1)) + 1e-9));
    slope *= shrink;
  }
  let intercept = my - slope * mx,
    pred = x.map((a) => intercept + slope * a),
    res = y.map((a, i) => a - pred[i]),
    mse = avg(res.map((a) => a * a)),
    mae = avg(res.map(Math.abs)),
    sst = y.reduce((s, a) => s + (a - my) ** 2, 0),
    r2 = 1 - res.reduce((s, a) => s + a * a, 0) / (sst || 1);
  return {
    method,
    x,
    y,
    pred,
    res,
    slope,
    intercept,
    mse,
    mae,
    rmse: Math.sqrt(mse),
    r2,
  };
}
function base(svg) {
  svg.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    let y = 25 + i * 46;
    svg.innerHTML += `<line x1="48" y1="${y}" x2="580" y2="${y}" stroke="#eceef5"/>`;
  }
  for (let i = 0; i < 6; i++) {
    let x = 48 + i * 106;
    svg.innerHTML += `<line x1="${x}" y1="25" x2="${x}" y2="209" stroke="#f0f1f7"/>`;
  }
  svg.innerHTML += `<line x1="48" y1="209" x2="580" y2="209" stroke="#cfd3e1"/><line x1="48" y1="25" x2="48" y2="209" stroke="#cfd3e1"/>`;
}
function sc(v, min, max, a, b) {
  return a + ((v - min) / (max - min || 1)) * (b - a);
}
function scatter(svg, x, y, pred, actualMode = true) {
  base(svg);
  let all = [...y, ...pred],
    mn = Math.min(...all),
    mx = Math.max(...all);
  if (mn === mx) mx++;
  let xx = (v) => sc(v, mn, mx, 48, 580),
    yy = (v) => sc(v, mn, mx, 209, 25);
  svg.innerHTML += `<line x1="${xx(mn)}" y1="${yy(mn)}" x2="${xx(mx)}" y2="${yy(mx)}" stroke="#ff777f" stroke-dasharray="6 5" stroke-width="2"/>`;
  x.forEach((v, i) => {
    let a = actualMode ? y[i] : v,
      b = actualMode ? pred[i] : y[i];
    svg.innerHTML += `<circle cx="${xx(a)}" cy="${yy(b)}" r="4.5" fill="#3cbd80" stroke="#fff" stroke-width="1"/>`;
  });
  svg.innerHTML += `<text x="315" y="246" text-anchor="middle">${actualMode ? "Actual target" : "Feature value"}</text><text x="12" y="120" transform="rotate(-90 12 120)" text-anchor="middle">${actualMode ? "Predicted target" : "Target value"}</text>`;
}
function linePlot(svg, f) {
  base(svg);
  let xmin = Math.min(...f.x),
    xmax = Math.max(...f.x),
    ymin = Math.min(...f.y),
    ymax = Math.max(...f.y);
  if (ymin === ymax) ymax++;
  let xx = (v) => sc(v, xmin, xmax, 48, 580),
    yy = (v) => sc(v, ymin, ymax, 209, 25);
  f.x.forEach(
    (v, i) =>
      (svg.innerHTML += `<circle cx="${xx(v)}" cy="${yy(f.y[i])}" r="4.5" fill="#3cbd80"/>`),
  );
  svg.innerHTML += `<line x1="${xx(xmin)}" y1="${yy(f.intercept + f.slope * xmin)}" x2="${xx(xmax)}" y2="${yy(f.intercept + f.slope * xmax)}" stroke="#7662ce" stroke-width="3"/><text x="315" y="246" text-anchor="middle">Feature value</text><text x="12" y="120" transform="rotate(-90 12 120)" text-anchor="middle">Target</text>`;
}
function residualPlot(svg, f) {
  base(svg);
  let mn = Math.min(...f.pred),
    mx = Math.max(...f.pred),
    lo = Math.min(0, ...f.res),
    hi = Math.max(0, ...f.res);
  if (lo === hi) {
    lo--;
    hi++;
  }
  let xx = (v) => sc(v, mn, mx, 48, 580),
    yy = (v) => sc(v, lo, hi, 209, 25);
  svg.innerHTML += `<line x1="48" y1="${yy(0)}" x2="580" y2="${yy(0)}" stroke="#ff777f" stroke-dasharray="6 5" stroke-width="2"/>`;
  f.pred.forEach(
    (v, i) =>
      (svg.innerHTML += `<circle cx="${xx(v)}" cy="${yy(f.res[i])}" r="4.5" fill="#7180e9"/>`),
  );
  svg.innerHTML += `<text x="315" y="246" text-anchor="middle">Predicted value</text><text x="12" y="120" transform="rotate(-90 12 120)" text-anchor="middle">Residual</text>`;
}
function errorPlot(svg, f) {
  base(svg);
  let max = Math.max(...f.res.map(Math.abs), 0.01),
    w = 35;
  f.res.forEach((v, i) => {
    let h = (Math.abs(v) / max) * 145,
      x = 58 + i * 43;
    svg.innerHTML += `<rect x="${x}" y="${209 - h}" width="${w}" height="${h}" rx="4" fill="${v < 0 ? "#f17b87" : "#7180e9"}"/><text x="${x + w / 2}" y="226" text-anchor="middle">${i + 1}</text>`;
  });
  svg.innerHTML += `<text x="315" y="255" text-anchor="middle">Observation number</text>`;
}
function bars(container, arr, key) {
  container.innerHTML = arr
    .map(
      (r) =>
        `<div class="barrow"><span>${methodNames[r.method]}</span><div class="barbg"><div class="barfill" style="width:${Math.max(0, Math.min(100, r[key] * 100))}%"></div></div><strong>${fmt(r[key], 3)}</strong></div>`,
    )
    .join("");
}
function loadDataset() {
  data = DB[$("dataset").value];
  $("feature").innerHTML = data.features
    .map((f) => `<option value="${f[0]}">${f[1]}</option>`)
    .join("");
  $("rows").textContent = data.rows.length;
  $("features").textContent = data.features.length;
  let keys = Object.keys(data.rows[0]);
  $("preview").querySelector("thead").innerHTML =
    "<tr>" + ["#", ...keys].map((k) => `<th>${k}</th>`).join("") + "</tr>";
  $("preview").querySelector("tbody").innerHTML = data.rows
    .slice(0, 5)
    .map(
      (r, i) =>
        `<tr><td>${i + 1}</td>${keys.map((k) => `<td>${r[k]}</td>`).join("")}</tr>`,
    )
    .join("");
  $("title").textContent = data.name + " — Model Analysis";
  $("sumDataset").textContent = data.name;
  $("sumTarget").textContent = data.target;
  compareModels();
  fitSelected();
}
function compareModels() {
  results = ["ols", "ridge", "lasso"].map((m) =>
    fit(data.rows, $("feature").value || data.features[0][0], data.y, m),
  );
  let best = results.reduce((a, b) => (a.r2 > b.r2 ? a : b));
  $("sumBest").textContent = methodNames[best.method];
  $("compareBars").innerHTML = results
    .map(
      (r) =>
        `<div class="barrow"><span>${methodNames[r.method]}</span><div class="barbg"><div class="barfill" style="width:${Math.max(0, Math.min(100, r.r2 * 100))}%"></div></div><strong>${fmt(r.r2, 3)}</strong></div>`,
    )
    .join("");
  $("compareTable").querySelector("thead").innerHTML =
    "<tr><th>Model</th><th>MAE</th><th>MSE</th><th>RMSE</th><th>R²</th></tr>";
  $("compareTable").querySelector("tbody").innerHTML = results
    .map(
      (r) =>
        `<tr><td>${methodNames[r.method]} ${r.method === best.method ? '<span class="best">Best</span>' : ""}</td><td>${fmt(r.mae, 3)}</td><td>${fmt(r.mse, 3)}</td><td>${fmt(r.rmse, 3)}</td><td>${fmt(r.r2, 4)}</td></tr>`,
    )
    .join("");
  bars($("overviewBars"), results, "r2");
  return best;
}
function fitSelected() {
  let m = $("method").value,
    xk = $("feature").value || data.features[0][0];
  selectedFit = fit(data.rows, xk, data.y, m);
  let f = selectedFit,
    best = compareModels();
  $("sumMethod").textContent = methodNames[m];
  $("sumFeature").textContent = data.features.find((a) => a[0] === xk)[1];
  $("status").textContent = methodNames[m] + " fitted";
  $("subtitle").textContent =
    `${data.rows.length} observations · ${$("sumFeature").textContent} → ${data.target}`;
  $("mae").textContent = fmt(f.mae, 3);
  $("mse").textContent = fmt(f.mse, 3);
  $("rmse").textContent = fmt(f.rmse, 3);
  $("r2").textContent = fmt(f.r2, 4);
  $("insight").innerHTML =
    `<b>Model insight</b><br>${methodNames[m]} achieved R² = <b>${fmt(f.r2, 4)}</b> and MAE = <b>${fmt(f.mae, 3)}</b>. The best R² in this sample is currently <b>${methodNames[best.method]}</b>.`;
  scatter($("actualChart"), f.x, f.y, f.pred, true);
  scatter($("scatterChart"), f.x, f.y, f.pred, false);
  linePlot($("lineChart"), f);
  residualPlot($("residualChart"), f);
  errorPlot($("errorChart"), f);
  $("equation").textContent =
    `Predicted target ŷ = ${fmt(f.intercept, 3)} + (${fmt(f.slope, 4)} × ${xk})`;
  $("residualNote").textContent =
    `Mean absolute error: ${fmt(f.mae, 3)}. Mean residual: ${fmt(f.res.reduce((a, b) => a + b, 0) / f.res.length, 5)}. Prefer residuals scattered randomly around zero.`;
  $("quality").innerHTML =
    `<div class="line"><span>Dataset rows</span><strong>${data.rows.length}</strong></div><div class="line"><span>Target variable</span><strong>${data.y}</strong></div><div class="line"><span>Selected feature</span><strong>${xk}</strong></div><div class="line"><span>Methods compared</span><strong>3</strong></div><div class="line"><span>Missing values in demo</span><strong>0</strong></div><p class="explain">The embedded data is synthetic and intentionally small for demonstrating the dashboard. For coursework conclusions, load actual datasets and evaluate on held-out test data.</p>`;
  $("conclusion").textContent =
    `For ${data.name}, the ${methodNames[best.method]} model has the highest R² (${fmt(best.r2, 4)}) among the three methods on this illustrative sample. Its MAE is ${fmt(best.mae, 3)} and RMSE is ${fmt(best.rmse, 3)}. Confirm the selection with train/test or cross-validation results before reporting it as the best-performing model.`;
  $("conclusionEquation").textContent =
    `Best sample model: ${methodNames[best.method]} · MAE ${fmt(best.mae, 3)} · MSE ${fmt(best.mse, 3)} · RMSE ${fmt(best.rmse, 3)} · R² ${fmt(best.r2, 4)}`;
}
const tabText = {
  overview:
    "<b>Overview:</b> Compare predictions against actual values and review the selected model’s key performance metrics.",
  comparison:
    "<b>Model comparison:</b> Compare OLS, Ridge and Lasso on the same dataset using MAE, MSE, RMSE and R².",
  regression:
    "<b>Regression plot:</b> Inspect observed data points and the fitted regression line.",
  residuals:
    "<b>Residual analysis:</b> Check prediction errors and look for systematic patterns.",
  insights:
    "<b>Conclusions:</b> Review the best sample model and observations to guide your report.",
};
function showTab(t) {
  ["overview", "comparison", "regression", "residuals", "insights"].forEach(
    (x) => $(x).classList.toggle("hidden", x !== t),
  );
  document
    .querySelectorAll(".tab")
    .forEach((b) => b.classList.toggle("active", b.dataset.tab === t));
  $("banner").innerHTML = tabText[t];
}
$("dataset").addEventListener("change", loadDataset);
$("feature").addEventListener("change", () => {
  compareModels();
  fitSelected();
});
$("method").addEventListener("change", fitSelected);
$("fitBtn").addEventListener("click", fitSelected);
$("compareBtn").addEventListener("click", () => {
  compareModels();
  showTab("comparison");
});
document
  .querySelectorAll(".tab")
  .forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));
loadDataset();
