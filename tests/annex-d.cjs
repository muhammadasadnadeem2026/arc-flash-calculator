// Checks the engine against the IEEE 1584-2018 Annex D worked examples. Run: node tests/annex-d.cjs
const vm = require('vm'), fs = require('fs'), path = require('path');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'ieee1584.js'), 'utf8').replace("typeof window !== 'undefined' ? window : globalThis", 'this'), ctx);
const A = ctx.IEEE1584; let fails = 0;
const chk = (n, got, exp, dp) => { const ok = Math.abs(got - exp) <= 0.5 * 10 ** -dp + 1e-9; if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', n, got.toFixed(dp), 'expected', exp); };
const hv = { V: 4.16, Ibf: 15, EC: 'VCB', G: 104, D: 914.4, h: 1143, w: 762, d: 508 };
let a = A.calc({ ...hv, T: 197 }), b = A.calc({ ...hv, T: 223, reduced: true });
chk('D.17 Iarc', a.Iarc, 12.979, 3); chk('D.22 CF', a.CF, 1.284, 3); chk('D.32 E', a.E, 12.152, 3); chk('D.42 AFB', a.AFB, 1606, 0);
chk('D.43 VarCF', a.VarCF, 0.047, 3); chk('D.51 Iarc min', b.Iarc, 12.675, 3); chk('D.62 E min', b.E, 13.343, 3); chk('D.72 AFB min', b.AFB, 1704, 0);
const lv = { V: 0.48, Ibf: 45, EC: 'VCB', G: 32, D: 609.6, h: 610, w: 610, d: 254 };
a = A.calc({ ...lv, T: 61.3 }); b = A.calc({ ...lv, T: 319, reduced: true });
chk('D.84 Iarc', a.Iarc, 28.793, 3); chk('D.89 CF', a.CF, 1.085, 3); chk('D.91 E', a.E, 11.585, 3); chk('D.95 AFB', a.AFB, 1029, 0);
chk('D.96 VarCF', a.VarCF, 0.247, 3); chk('D.99 Iarc min', b.Iarc, 25.244, 3); chk('D.103 E min', b.E, 53.156, 3); chk('D.106 AFB min', b.AFB, 2669, 0);
console.log(fails ? `${fails} FAILED` : 'All 16 Annex D checks pass');
process.exit(fails ? 1 : 0);
