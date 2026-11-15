/*
 * IEEE 1584-2018 arc-flash incident energy and arc-flash boundary (three-phase AC, 208 V to 15 kV).
 *
 * JavaScript port of the "arcflash" Python library by Li-aung Yip (MIT License,
 * https://github.com/LiaungYip/arcflash). Coefficient tables are those of IEEE 1584-2018 Tables 1-5, 7, 8 and 10.
 * Checked against the standard's Annex D worked examples (D.1 medium voltage, D.2 low voltage).
 *
 * Units: voltage kV, current kA, gap / distance / enclosure size mm, time ms, energy J/cm² (÷ 4.184 for cal/cm²).
 */
(function (root) {
  'use strict';
  const T1 = {
    'VCB,0.6': [-0.04287, 1.035, -0.083, 0, 0, -4.783e-9, 1.962e-6, -0.000229, 0.003141, 1.092],
    'VCB,2.7': [0.0065, 1.001, -0.024, -1.557e-12, 4.556e-10, -4.186e-8, 8.346e-7, 5.482e-5, -0.003191, 0.9729],
    'VCB,14.3': [0.005795, 1.015, -0.011, -1.557e-12, 4.556e-10, -4.186e-8, 8.346e-7, 5.482e-5, -0.003191, 0.9729],
    'VCBB,0.6': [-0.017432, 0.98, -0.05, 0, 0, -5.767e-9, 2.524e-6, -0.00034, 0.01187, 1.013],
    'VCBB,2.7': [0.002823, 0.995, -0.0125, 0, -9.204e-11, 2.901e-8, -3.262e-6, 0.0001569, -0.004003, 0.9825],
    'VCBB,14.3': [0.014827, 1.01, -0.01, 0, -9.204e-11, 2.901e-8, -3.262e-6, 0.0001569, -0.004003, 0.9825],
    'HCB,0.6': [0.054922, 0.988, -0.11, 0, 0, -5.382e-9, 2.316e-6, -0.000302, 0.0091, 0.9725],
    'HCB,2.7': [0.001011, 1.003, -0.0249, 0, 0, 4.859e-10, -1.814e-7, -9.128e-6, -0.0007, 0.9881],
    'HCB,14.3': [0.008693, 0.999, -0.02, 0, -5.043e-11, 2.233e-8, -3.046e-6, 0.000116, -0.001145, 0.9839],
    'VOA,0.6': [0.043785, 1.04, -0.18, 0, 0, -4.783e-9, 1.962e-6, -0.000229, 0.003141, 1.092],
    'VOA,2.7': [-0.02395, 1.006, -0.0188, -1.557e-12, 4.556e-10, -4.186e-8, 8.346e-7, 5.482e-5, -0.003191, 0.9729],
    'VOA,14.3': [0.005371, 1.0102, -0.029, -1.557e-12, 4.556e-10, -4.186e-8, 8.346e-7, 5.482e-5, -0.003191, 0.9729],
    'HOA,0.6': [0.111147, 1.008, -0.24, 0, 0, -3.895e-9, 1.641e-6, -0.000197, 0.002615, 1.1],
    'HOA,2.7': [0.000435, 1.006, -0.038, 0, 0, 7.859e-10, -1.914e-7, -9.128e-6, -0.0007, 0.9981],
    'HOA,14.3': [0.000904, 0.999, -0.02, 0, 0, 7.859e-10, -1.914e-7, -9.128e-6, -0.0007, 0.9981],
  };
  const T2 = {
    VCB: [0, -0.0000014269, 0.000083137, -0.0019382, 0.022366, -0.12645, 0.30226],
    VCBB: [1.138e-6, -6.0287e-5, 0.0012758, -0.013778, 0.080217, -0.24066, 0.33524],
    HCB: [0, -3.097e-6, 0.00016405, -0.0033609, 0.033308, -0.16182, 0.34627],
    VOA: [9.5606e-7, -5.1543e-5, 0.0011161, -0.01242, 0.075125, -0.23584, 0.33696],
    HOA: [0, -3.1555e-6, 0.0001682, -0.0034607, 0.034124, -0.1599, 0.34629],
  };
  const TE = {   // Tables 3, 4, 5: k1..k13 for 600 V, 2700 V, 14 300 V
    0.6: {
      VCB: [0.753364, 0.566, 1.752636, 0, 0, -4.783e-9, 0.000001962, -0.000229, 0.003141, 1.092, 0, -1.598, 0.957],
      VCBB: [3.068459, 0.26, -0.098107, 0, 0, -5.767e-9, 0.000002524, -0.00034, 0.01187, 1.013, -0.06, -1.809, 1.19],
      HCB: [4.073745, 0.344, -0.370259, 0, 0, -5.382e-9, 0.000002316, -0.000302, 0.0091, 0.9725, 0, -2.03, 1.036],
      VOA: [0.679294, 0.746, 1.222636, 0, 0, -4.783e-9, 0.000001962, -0.000229, 0.003141, 1.092, 0, -1.598, 0.997],
      HOA: [3.470417, 0.465, -0.261863, 0, 0, -3.895e-9, 0.000001641, -0.000197, 0.002615, 1.1, 0, -1.99, 1.04],
    },
    2.7: {
      VCB: [2.40021, 0.165, 0.354202, -1.557e-12, 4.556e-10, -4.186e-8, 8.346e-7, 5.482e-5, -0.003191, 0.9729, 0, -1.569, 0.9778],
      VCBB: [3.870592, 0.185, -0.736618, 0, -9.204e-11, 2.901e-8, -3.262e-6, 0.0001569, -0.004003, 0.9825, 0, -1.742, 1.09],
      HCB: [3.486391, 0.177, -0.193101, 0, 0, 4.859e-10, -1.814e-7, -9.128e-6, -0.0007, 0.9881, 0.027, -1.723, 1.055],
      VOA: [3.880724, 0.105, -1.906033, -1.557e-12, 4.556e-10, -4.186e-8, 8.346e-7, 5.482e-5, -0.003191, 0.9729, 0, -1.515, 1.115],
      HOA: [3.616266, 0.149, -0.761561, 0, 0, 7.859e-10, -1.914e-7, -9.128e-6, -0.0007, 0.9981, 0, -1.639, 1.078],
    },
    14.3: {
      VCB: [3.825917, 0.11, -0.999749, -1.557e-12, 4.556e-10, -4.186e-8, 8.346e-7, 5.482e-5, -0.003191, 0.9729, 0, -1.568, 0.99],
      VCBB: [3.644309, 0.215, -0.585522, 0, -9.204e-11, 2.901e-8, -3.262e-6, 0.0001569, -0.004003, 0.9825, 0, -1.677, 1.06],
      HCB: [3.044516, 0.125, 0.245106, 0, -5.043e-11, 2.233e-8, -3.046e-6, 0.000116, -0.001145, 0.9839, 0, -1.655, 1.084],
      VOA: [3.405454, 0.12, -0.93245, -1.557e-12, 4.556e-10, -4.186e-8, 8.346e-7, 5.482e-5, -0.003191, 0.9729, 0, -1.534, 0.979],
      HOA: [2.04049, 0.177, 1.005092, 0, 0, 7.859e-10, -1.914e-7, -9.128e-6, -0.0007, 0.9981, -0.05, -1.633, 1.151],
    },
  };
  const T7 = {
    'Typical,VCB': [-0.000302, 0.03441, 0.4325], 'Typical,VCBB': [-0.0002976, 0.032, 0.479], 'Typical,HCB': [-0.0001923, 0.01935, 0.6899],
    'Shallow,VCB': [0.002222, -0.02556, 0.6222], 'Shallow,VCBB': [-0.002778, 0.1194, -0.2778], 'Shallow,HCB': [-0.0005556, 0.03722, 0.4778],
  };
  // Tables 8 and 10: typical gap G, enclosure height / width / depth and working distance D (mm)
  const EQUIPMENT = {
    'LV switchgear': { G: 32, h: 508, w: 508, d: 508, D: 609.6, V: 0.48 },
    'LV MCC / panelboard': { G: 25, h: 355.6, w: 304.8, d: 250, D: 457.2, V: 0.48 },
    'LV MCC / panelboard (shallow)': { G: 25, h: 355.6, w: 304.8, d: 100, D: 457.2, V: 0.208 },
    'Cable junction box': { G: 13, h: 355.6, w: 304.8, d: 250, D: 457.2, V: 0.48 },
    '5 kV switchgear': { G: 104, h: 1143, w: 762, d: 762, D: 914.4, V: 4.16 },
    '5 kV MCC': { G: 104, h: 660.4, w: 660.4, d: 660.4, D: 914.4, V: 4.16 },
    '15 kV switchgear': { G: 152, h: 1143, w: 762, d: 762, D: 914.4, V: 13.8 },
    '15 kV MCC': { G: 152, h: 914.4, w: 914.4, d: 914.4, D: 914.4, V: 13.8 },
  };
  const poly = (k, x, n) => k.slice(0, n).reduce((s, c, i) => s + c * x ** (n - 1 - i), 0);

  function arcingCurrent(EC, Vref, Ibf, G) {          // Eq. 1, at 0.6 / 2.7 / 14.3 kV
    const k = T1[`${EC},${Vref}`];
    const x1 = k[0] + k[1] * Math.log10(Ibf) + k[2] * Math.log10(G);
    const x2 = k[3] * Ibf ** 6 + k[4] * Ibf ** 5 + k[5] * Ibf ** 4 + k[6] * Ibf ** 3 + k[7] * Ibf ** 2 + k[8] * Ibf + k[9];
    return 10 ** x1 * x2;
  }
  const varCF = (EC, V) => poly(T2[EC], V, 7);        // Eq. 2

  function correctionFactor(EC, V, h, w, d) {         // enclosure size correction, Eqs. 11-15 and Table 7
    if (EC === 'VOA' || EC === 'HOA') return { CF: 1, type: 'Open air' };
    const type = V < 0.6 && h < 508 && w < 508 && d <= 203.2 ? 'Shallow' : 'Typical';
    const [A, B] = { VCB: [4, 20], VCBB: [10, 24], HCB: [10, 22] }[EC];
    const eq = (dim) => (660.4 + (dim - 660.4) * ((V + A) / B)) / 25.4;
    const toIn = 0.03937;
    let w1, h1;
    if (w < 508) w1 = type === 'Typical' ? 20 : toIn * w;
    else if (w <= 660.4) w1 = toIn * w;
    else if (w <= 1244.6) w1 = eq(w);
    else w1 = eq(1244.6);
    if (h < 508) h1 = type === 'Typical' ? 20 : toIn * h;
    else if (h <= 660.4) h1 = toIn * h;
    else if (h <= 1244.6) h1 = EC === 'VCB' ? toIn * h : eq(h);
    else h1 = EC === 'VCB' ? 49 : eq(1244.6);
    const EES = (h1 + w1) / 2;
    const b = T7[`${type},${EC}`];
    const x = b[0] * EES ** 2 + b[1] * EES + b[2];
    return { CF: type === 'Typical' ? x : 1 / x, type, EES, w1, h1 };
  }

  function energy(Vref, EC, Iarc, Ibf, T, G, D, CF, Iarc600) {   // Eqs. 3-6 (J/cm²)
    const k = TE[Vref][EC];
    const x1 = (12.552 / 50) * T;
    const x2 = k[0] + k[1] * Math.log10(G);
    const den = k[3] * Ibf ** 7 + k[4] * Ibf ** 6 + k[5] * Ibf ** 5 + k[6] * Ibf ** 4 + k[7] * Ibf ** 3 + k[8] * Ibf ** 2 + k[9] * Ibf;
    const x3 = (k[2] * (Iarc600 ?? Iarc)) / den;
    const x4 = k[10] * Math.log10(Ibf) + k[12] * Math.log10(Iarc) + Math.log10(1 / CF);
    const x5 = k[11] * Math.log10(D);
    return x1 * 10 ** (x2 + x3 + x4 + x5);
  }
  const boundary = (Vref, EC, E, D) => { const k12 = TE[Vref][EC][11]; return (5.0208 / (E / D ** k12)) ** (1 / k12); };   // Eqs. 7-10, 1.2 cal/cm²

  function interpolate(V, x600, x2700, x14300) {     // Eqs. 16-18
    const x1 = ((x2700 - x600) / 2.1) * (V - 2.7) + x2700;
    const x2 = ((x14300 - x2700) / 11.6) * (V - 14.3) + x14300;
    const x3 = (x1 * (2.7 - V)) / 2.1 + (x2 * (V - 0.6)) / 2.1;
    return V <= 2.7 ? x3 : x2;
  }

  /**
   * One case. p = { V (kV), Ibf (kA), EC, G, D, h, w, d (mm), T (ms), reduced (bool) }.
   * Returns arcing current (kA), incident energy (J/cm² and cal/cm²), arc-flash boundary (mm) and intermediate values.
   */
  function calc(p) {
    const { V, Ibf, EC, G, D, h, w, d, T } = p;
    const warnings = [];
    const lv = V <= 0.6;
    if (V < 0.208 || V > 15) warnings.push('Voltage is outside the IEEE 1584-2018 range (208 V to 15 kV).');
    if (lv && (Ibf < 0.5 || Ibf > 106)) warnings.push('Bolted fault current is outside 500 A to 106 kA (low-voltage model range).');
    if (!lv && (Ibf < 0.2 || Ibf > 65)) warnings.push('Bolted fault current is outside 200 A to 65 kA (medium-voltage model range).');
    if (lv && (G < 6.35 || G > 76.2)) warnings.push('Gap is outside 6.35 to 76.2 mm (low-voltage model range).');
    if (!lv && (G < 19.05 || G > 254)) warnings.push('Gap is outside 19.05 to 254 mm (medium-voltage model range).');
    if (D < 305) warnings.push('Working distance is below 305 mm.');
    const cf = correctionFactor(EC, V, h, w, d);
    const vcf = varCF(EC, V);
    const red = p.reduced ? 1 - 0.5 * vcf : 1;
    const r = { lv, CF: cf.CF, enclosure: cf.type, EES: cf.EES, VarCF: vcf, warnings };
    if (lv) {
      const I600full = arcingCurrent(EC, 0.6, Ibf, G);
      const Ifull = 1 / Math.sqrt((0.6 / V) ** 2 * (1 / I600full ** 2 - (0.36 - V ** 2) / (0.36 * Ibf ** 2)));   // Eq. 25
      r.Iarc600 = I600full;
      r.Iarc = Ifull * red;
      r.E = energy(0.6, EC, r.Iarc, Ibf, T, G, D, cf.CF, I600full);
      r.AFB = boundary(0.6, EC, r.E, D);
    } else {
      const I = [0.6, 2.7, 14.3].map((vr) => arcingCurrent(EC, vr, Ibf, G) * red);
      const E = [0.6, 2.7, 14.3].map((vr, i) => energy(vr, EC, I[i], Ibf, T, G, D, cf.CF));
      const B = [0.6, 2.7, 14.3].map((vr, i) => boundary(vr, EC, E[i], D));
      Object.assign(r, { Iarc600: I[0], Iarc2700: I[1], Iarc14300: I[2], E600: E[0], E2700: E[1], E14300: E[2] });
      r.Iarc = interpolate(V, ...I);
      r.E = interpolate(V, ...E);
      r.AFB = interpolate(V, ...B);
    }
    r.cal = r.E / 4.184;
    return r;
  }

  /** NFPA 70E arc-rated clothing: minimum arc rating to cover the incident energy (incident energy method). */
  function ppe(cal) {
    if (cal < 1.2) return { level: 'Below 1.2 cal/cm²', note: 'Arc-rated clothing not required by incident energy; normal PPE for shock still applies.' };
    if (cal <= 4) return { level: 'Arc rating ≥ 4 cal/cm²', note: 'Arc-rated shirt and trousers or coverall, face shield, hard hat, safety glasses, hearing protection, gloves.' };
    if (cal <= 8) return { level: 'Arc rating ≥ 8 cal/cm²', note: 'Arc-rated clothing and arc-rated balaclava or flash hood, plus the 4 cal/cm² items.' };
    if (cal <= 25) return { level: 'Arc rating ≥ 25 cal/cm²', note: 'Arc flash suit with hood, arc-rated jacket and leggings, leather footwear.' };
    if (cal <= 40) return { level: 'Arc rating ≥ 40 cal/cm²', note: 'Arc flash suit with hood rated 40 cal/cm²; consider de-energising first.' };
    return { level: 'Above 40 cal/cm²', note: 'Energised work is not advised: de-energise, add arc-energy reduction, or work remotely.' };
  }

  const api = { calc, ppe, EQUIPMENT, correctionFactor, arcingCurrent, varCF };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.IEEE1584 = api;
})(typeof window !== 'undefined' ? window : globalThis);
