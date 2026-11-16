(() => {
  "use strict";
  const C = window.ResistorCalculator;
  const $ = id => document.getElementById(id);
  const bandNames = ["Primera cifra", "Segunda cifra", "Tercera cifra", "Multiplicador", "Tolerancia", "Coeficiente térmico"];
  const state = { count: 4, bands: ["Café", "Negro", "Rojo", "Dorado"], history: [] };
  const digitOptions = C.DIGITS;
  const multiplierOptions = C.MULTIPLIERS;
  const toleranceOptions = C.TOLERANCES;

  function makeSelect(options, value, label, index) {
    const select = document.createElement("select");
    select.setAttribute("aria-label", label);
    options.forEach(color => {
      const option = document.createElement("option"); option.value = color.name; option.textContent = color.name;
      if (color.name === value) option.selected = true;
      select.appendChild(option);
    });
    select.addEventListener("change", () => { state.bands[index] = select.value; render(); });
    return select;
  }
  function createBandControls() {
    const count = state.count, sig = count === 4 ? 2 : 3;
    const container = $("band-fields"); container.replaceChildren();
    for (let i = 0; i < count; i++) {
      const options = i < sig ? digitOptions : i === sig ? multiplierOptions : i === sig + 1 ? toleranceOptions : C.TEMPERATURES.map(name => C.colorByName(name));
      const label = document.createElement("label"); label.className = "band-field";
      const cap = document.createElement("span"); cap.textContent = bandNames[i];
      label.append(cap, makeSelect(options, state.bands[i], bandNames[i], i)); container.appendChild(label);
    }
  }
  function renderPreview(id, names) {
    const host = $(id); host.replaceChildren();
    names.forEach((name, i) => { const color = C.colorByName(name), el = document.createElement("span"); el.className = "resistor-band"; el.style.backgroundColor = color.hex; el.title = `${i + 1}. ${name}`; el.setAttribute("aria-label", `${i + 1}. ${name}`); host.appendChild(el); });
  }
  function formatValue(value, suffix = "") {
    const abs = Math.abs(value); let scaled = value, unit = "Ω";
    if (abs >= 1e6) { scaled = value / 1e6; unit = "MΩ"; }
    else if (abs >= 1e3) { scaled = value / 1e3; unit = "kΩ"; }
    const digits = scaled >= 100 ? 1 : scaled >= 10 ? 2 : 3;
    return `${Number(scaled.toPrecision(digits)).toLocaleString("es-MX")}${suffix} ${unit}`;
  }
  function render() {
    createBandControls(); renderPreview("band-preview", state.bands);
    try {
      const result = C.decode(state.bands);
      $("result-value").innerHTML = `${formatValue(result.value).replace(/ (Ω|kΩ|MΩ)$/, " <span>$1</span>")}`;
      $("result-range").textContent = `Entre ${formatValue(result.min)} y ${formatValue(result.max)} · ±${result.tolerance}%${result.temperatureCoefficient === null ? "" : ` · ${result.temperatureCoefficient} ppm/°C`}`;
      $("copy-result").dataset.value = `${formatValue(result.value)} ±${result.tolerance}%`;
      addHistory(`${formatValue(result.value)} ±${result.tolerance}%`, state.bands.join(" · "));
    } catch (error) { $("result-value").textContent = "—"; $("result-range").textContent = error.message; }
  }
  function addHistory(value, colors) {
    if (!$('history-enabled').checked) return;
    const latest = state.history[0]; if (latest && latest.value === value && latest.colors === colors) return;
    state.history.unshift({ value, colors }); state.history = state.history.slice(0, 5); renderHistory();
  }
  function renderHistory() {
    const list = $("history-list"); list.replaceChildren();
    if (!state.history.length) { const li = document.createElement("li"); li.className = "empty-history"; li.textContent = "Aquí aparecerán tus cálculos."; list.append(li); return; }
    state.history.forEach(item => { const li = document.createElement("li"), strong = document.createElement("strong"), span = document.createElement("span"); strong.textContent = item.value; span.textContent = item.colors; li.append(strong, span); list.append(li); });
  }
  function renderInverse() {
    const value = Number($("target-value").value) * Number($("target-unit").value), tolerance = Number($("target-tolerance").value);
    try {
      const result = C.encode(value, tolerance, state.count); $("inverse-error").textContent = "";
      $("inverse-result").textContent = `${formatValue(result.value)} ±${result.tolerance}%`;
      $("inverse-bands-label").textContent = result.bands.join(" · "); renderPreview("inverse-preview", result.bands);
    } catch (error) { $("inverse-error").textContent = error.message; $("inverse-result").textContent = "Sin combinación"; $("inverse-bands-label").textContent = ""; $("inverse-preview").replaceChildren(); }
  }
  document.querySelectorAll("[data-bands]").forEach(button => button.addEventListener("click", () => {
    state.count = Number(button.dataset.bands); const defaults = { 4: ["Café", "Negro", "Rojo", "Dorado"], 5: ["Café", "Negro", "Negro", "Café", "Café"], 6: ["Café", "Negro", "Negro", "Café", "Café", "Café"] };
    state.bands = defaults[state.count].slice(); document.querySelectorAll("[data-bands]").forEach(b => { const active = b === button; b.classList.toggle("selected", active); b.setAttribute("aria-pressed", String(active)); }); render(); renderInverse();
  }));
  ["direct", "inverse"].forEach(mode => $(`${mode}-tab`).addEventListener("click", () => {
    const isDirect = mode === "direct"; $("direct-panel").hidden = !isDirect; $("inverse-panel").hidden = isDirect;
    $("direct-tab").classList.toggle("active", isDirect); $("inverse-tab").classList.toggle("active", !isDirect);
    $("direct-tab").setAttribute("aria-selected", String(isDirect)); $("inverse-tab").setAttribute("aria-selected", String(!isDirect)); if (!isDirect) renderInverse();
  }));
  ["target-value", "target-unit", "target-tolerance"].forEach(id => $(id).addEventListener("input", renderInverse));
  $("target-unit").addEventListener("change", renderInverse); $("target-tolerance").addEventListener("change", renderInverse);
  $("copy-result").addEventListener("click", async event => { try { await navigator.clipboard.writeText(event.currentTarget.dataset.value); event.currentTarget.textContent = "✓"; setTimeout(() => event.currentTarget.textContent = "⧉", 1200); } catch { event.currentTarget.title = "No se pudo copiar"; } });
  $("history-enabled").addEventListener("change", event => { if (!event.target.checked) { state.history = []; renderHistory(); } else render(); });
  $("clear-history").addEventListener("click", () => { state.history = []; renderHistory(); });
  C.COLORS.forEach(color => { const row = document.createElement("tr"); const temp = { Negro: 250, Café: 100, Rojo: 50, Naranja: 15, Amarillo: 25, Verde: 20, Azul: 10, Violeta: 5, Gris: 1 };
    [null, color.digit === undefined ? "—" : color.digit, color.multiplier === undefined ? "—" : `${color.multiplier < 1 ? color.multiplier : color.multiplier.toLocaleString("es-MX")}×`, color.tolerance === undefined ? "—" : `±${color.tolerance}%`, temp[color.name] === undefined ? "—" : temp[color.name]].forEach((value, i) => { const cell = document.createElement(i === 0 ? "th" : "td"); if (i === 0) { cell.scope = "row"; const swatch = document.createElement("i"); swatch.className = "swatch"; swatch.style.backgroundColor = color.hex; const name = document.createElement("span"); name.textContent = color.name; cell.append(swatch, name); } else cell.textContent = value; row.append(cell); }); $("color-table").append(row);
  });
  render(); renderInverse();
})();
