/* Pure calculation helpers: safe to use in the browser or Node.js tests. */
(function (root) {
  "use strict";
  const COLORS = [
    { name: "Negro", hex: "#252729", digit: 0, multiplier: 1, text: "#fff" },
    { name: "Café", hex: "#82543b", digit: 1, multiplier: 10, tolerance: 1 },
    { name: "Rojo", hex: "#d84f48", digit: 2, multiplier: 100, tolerance: 2 },
    { name: "Naranja", hex: "#e98245", digit: 3, multiplier: 1e3 },
    { name: "Amarillo", hex: "#e9c957", digit: 4, multiplier: 1e4 },
    { name: "Verde", hex: "#588c70", digit: 5, multiplier: 1e5, tolerance: 0.5 },
    { name: "Azul", hex: "#6386ae", digit: 6, multiplier: 1e6, tolerance: 0.25 },
    { name: "Violeta", hex: "#9279ae", digit: 7, multiplier: 1e7, tolerance: 0.1 },
    { name: "Gris", hex: "#a6a8aa", digit: 8, multiplier: 1e8, tolerance: 0.05 },
    { name: "Blanco", hex: "#f1eee7", digit: 9, multiplier: 1e9, text: "#252729" },
    { name: "Dorado", hex: "#c6a25a", multiplier: 0.1, tolerance: 5 },
    { name: "Plateado", hex: "#aeb4ba", multiplier: 0.01, tolerance: 10 }
  ];
  const DIGITS = COLORS.slice(0, 10);
  const MULTIPLIERS = COLORS;
  const TOLERANCES = COLORS.filter(c => c.tolerance !== undefined);
  const TEMPERATURES = ["Negro", "Café", "Rojo", "Naranja", "Amarillo", "Verde", "Azul", "Violeta", "Gris"];
  const TEMP_COEFFICIENTS = { Negro: 250, Café: 100, Rojo: 50, Naranja: 15, Amarillo: 25, Verde: 20, Azul: 10, Violeta: 5, Gris: 1 };
  const colorByName = name => COLORS.find(c => c.name === name);

  function validateBands(bands) {
    if (![4, 5, 6].includes(bands.length)) throw new Error("Elige 4, 5 o 6 bandas.");
    const significantCount = bands.length === 4 ? 2 : 3;
    for (let i = 0; i < significantCount; i++) {
      if (!DIGITS.includes(colorByName(bands[i]))) throw new Error("El color de las cifras no es válido.");
      if (i === 0 && colorByName(bands[i]).digit === 0) throw new Error("La primera banda no puede ser negra.");
    }
    if (!MULTIPLIERS.includes(colorByName(bands[significantCount]))) throw new Error("El multiplicador no es válido.");
    const tolerance = colorByName(bands[significantCount + 1]);
    if (!tolerance || tolerance.tolerance === undefined) throw new Error("La tolerancia no es válida.");
    if (bands.length === 6 && !TEMPERATURES.includes(bands[5])) throw new Error("La banda de temperatura no es válida.");
  }

  function decode(bands) {
    validateBands(bands);
    const significantCount = bands.length === 4 ? 2 : 3;
    const digits = bands.slice(0, significantCount).map(name => colorByName(name).digit);
    const value = Number(digits.join("")) * colorByName(bands[significantCount]).multiplier;
    const tolerance = colorByName(bands[significantCount + 1]).tolerance;
    const temperatureCoefficient = bands.length === 6 ? TEMP_COEFFICIENTS[bands[5]] : null;
    return { value, tolerance, min: value * (1 - tolerance / 100), max: value * (1 + tolerance / 100), temperatureCoefficient };
  }

  function encode(value, tolerance, bandCount) {
    if (!Number.isFinite(value) || value <= 0) throw new Error("El valor debe ser un número mayor que cero.");
    if (![4, 5, 6].includes(bandCount)) throw new Error("Elige 4, 5 o 6 bandas.");
    const toleranceColor = TOLERANCES.find(c => c.tolerance === Number(tolerance));
    if (!toleranceColor) throw new Error("La tolerancia seleccionada no es válida.");
    const significantCount = bandCount === 4 ? 2 : 3;
    const maxDigits = 10 ** significantCount - 1;
    let best = null;
    for (const multiplier of MULTIPLIERS) {
      const raw = value / multiplier.multiplier;
      const digits = Math.round(raw);
      if (digits < (10 ** (significantCount - 1)) || digits > maxDigits) continue;
      const represented = digits * multiplier.multiplier;
      const error = Math.abs(represented - value) / value;
      if (!best || error < best.error) {
        const names = String(digits).padStart(significantCount, "0").split("").map(d => DIGITS[Number(d)].name);
        names.push(multiplier.name, toleranceColor.name);
        if (bandCount === 6) names.push(Object.keys(TEMP_COEFFICIENTS).find(name => TEMP_COEFFICIENTS[name] === 100) || "Café");
        best = { value: represented, tolerance: toleranceColor.tolerance, bands: names, error };
      }
    }
    if (!best) throw new Error("Ese valor no se puede representar con ese número de bandas.");
    return best;
  }
  const api = { COLORS, DIGITS, MULTIPLIERS, TOLERANCES, TEMPERATURES, decode, encode, colorByName };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ResistorCalculator = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
