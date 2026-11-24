import React, { useState } from 'react';
import { Search, Activity, Sun, Moon } from 'lucide-react';

// --- Data Preparation ---
// Simplified electron shell data for the animation
// Electrons per principal shell, filled in Aufbau order.
// A few elements (Cr, Cu, …) have real exceptions to this order.
const getShells = (atomicNumber) => {
  const order = [
    [1, 2], [2, 2], [2, 6], [3, 2], [3, 6], [4, 2], [3, 10], [4, 6],
    [5, 2], [4, 10], [5, 6], [6, 2], [4, 14], [5, 10], [6, 6], [7, 2],
    [5, 14], [6, 10], [7, 6],
  ];
  const count = [0, 0, 0, 0, 0, 0, 0];
  let left = atomicNumber;
  for (const [n, cap] of order) {
    if (left <= 0) break;
    const take = Math.min(cap, left);
    count[n - 1] += take;
    left -= take;
  }
  return count.filter((c) => c > 0);
};

// Standard periodic table data
const elements = [
  { num: 1, sym: 'H', name: 'Hydrogen', cat: 'diatomic nonmetal', r: 1, c: 1, mass: 1.008, en: 2.20 },
  { num: 2, sym: 'He', name: 'Helium', cat: 'noble gas', r: 1, c: 18, mass: 4.0026, en: null },
  { num: 3, sym: 'Li', name: 'Lithium', cat: 'alkali metal', r: 2, c: 1, mass: 6.94, en: 0.98 },
  { num: 4, sym: 'Be', name: 'Beryllium', cat: 'alkaline earth metal', r: 2, c: 2, mass: 9.0122, en: 1.57 },
  { num: 5, sym: 'B', name: 'Boron', cat: 'metalloid', r: 2, c: 13, mass: 10.81, en: 2.04 },
  { num: 6, sym: 'C', name: 'Carbon', cat: 'polyatomic nonmetal', r: 2, c: 14, mass: 12.011, en: 2.55 },
  { num: 7, sym: 'N', name: 'Nitrogen', cat: 'diatomic nonmetal', r: 2, c: 15, mass: 14.007, en: 3.04 },
  { num: 8, sym: 'O', name: 'Oxygen', cat: 'diatomic nonmetal', r: 2, c: 16, mass: 15.999, en: 3.44 },
  { num: 9, sym: 'F', name: 'Fluorine', cat: 'diatomic nonmetal', r: 2, c: 17, mass: 18.998, en: 3.98 },
  { num: 10, sym: 'Ne', name: 'Neon', cat: 'noble gas', r: 2, c: 18, mass: 20.180, en: null },
  { num: 11, sym: 'Na', name: 'Sodium', cat: 'alkali metal', r: 3, c: 1, mass: 22.990, en: 0.93 },
  { num: 12, sym: 'Mg', name: 'Magnesium', cat: 'alkaline earth metal', r: 3, c: 2, mass: 24.305, en: 1.31 },
  { num: 13, sym: 'Al', name: 'Aluminium', cat: 'post-transition metal', r: 3, c: 13, mass: 26.982, en: 1.61 },
  { num: 14, sym: 'Si', name: 'Silicon', cat: 'metalloid', r: 3, c: 14, mass: 28.085, en: 1.90 },
  { num: 15, sym: 'P', name: 'Phosphorus', cat: 'polyatomic nonmetal', r: 3, c: 15, mass: 30.974, en: 2.19 },
  { num: 16, sym: 'S', name: 'Sulfur', cat: 'polyatomic nonmetal', r: 3, c: 16, mass: 32.06, en: 2.58 },
  { num: 17, sym: 'Cl', name: 'Chlorine', cat: 'diatomic nonmetal', r: 3, c: 17, mass: 35.45, en: 3.16 },
  { num: 18, sym: 'Ar', name: 'Argon', cat: 'noble gas', r: 3, c: 18, mass: 39.95, en: null },
  { num: 19, sym: 'K', name: 'Potassium', cat: 'alkali metal', r: 4, c: 1, mass: 39.098, en: 0.82 },
  { num: 20, sym: 'Ca', name: 'Calcium', cat: 'alkaline earth metal', r: 4, c: 2, mass: 40.078, en: 1.00 },
  { num: 21, sym: 'Sc', name: 'Scandium', cat: 'transition metal', r: 4, c: 3, mass: 44.956, en: 1.36 },
  { num: 22, sym: 'Ti', name: 'Titanium', cat: 'transition metal', r: 4, c: 4, mass: 47.867, en: 1.54 },
  { num: 23, sym: 'V', name: 'Vanadium', cat: 'transition metal', r: 4, c: 5, mass: 50.942, en: 1.63 },
  { num: 24, sym: 'Cr', name: 'Chromium', cat: 'transition metal', r: 4, c: 6, mass: 51.996, en: 1.66 },
  { num: 25, sym: 'Mn', name: 'Manganese', cat: 'transition metal', r: 4, c: 7, mass: 54.938, en: 1.55 },
  { num: 26, sym: 'Fe', name: 'Iron', cat: 'transition metal', r: 4, c: 8, mass: 55.845, en: 1.83 },
  { num: 27, sym: 'Co', name: 'Cobalt', cat: 'transition metal', r: 4, c: 9, mass: 58.933, en: 1.88 },
  { num: 28, sym: 'Ni', name: 'Nickel', cat: 'transition metal', r: 4, c: 10, mass: 58.693, en: 1.91 },
  { num: 29, sym: 'Cu', name: 'Copper', cat: 'transition metal', r: 4, c: 11, mass: 63.546, en: 1.90 },
  { num: 30, sym: 'Zn', name: 'Zinc', cat: 'transition metal', r: 4, c: 12, mass: 65.38, en: 1.65 },
  { num: 31, sym: 'Ga', name: 'Gallium', cat: 'post-transition metal', r: 4, c: 13, mass: 69.723, en: 1.81 },
  { num: 32, sym: 'Ge', name: 'Germanium', cat: 'metalloid', r: 4, c: 14, mass: 72.630, en: 2.01 },
  { num: 33, sym: 'As', name: 'Arsenic', cat: 'metalloid', r: 4, c: 15, mass: 74.922, en: 2.18 },
  { num: 34, sym: 'Se', name: 'Selenium', cat: 'polyatomic nonmetal', r: 4, c: 16, mass: 78.971, en: 2.55 },
  { num: 35, sym: 'Br', name: 'Bromine', cat: 'diatomic nonmetal', r: 4, c: 17, mass: 79.904, en: 2.96 },
  { num: 36, sym: 'Kr', name: 'Krypton', cat: 'noble gas', r: 4, c: 18, mass: 83.798, en: 3.00 },
  { num: 37, sym: 'Rb', name: 'Rubidium', cat: 'alkali metal', r: 5, c: 1, mass: 85.468, en: 0.82 },
  { num: 38, sym: 'Sr', name: 'Strontium', cat: 'alkaline earth metal', r: 5, c: 2, mass: 87.62, en: 0.95 },
  { num: 39, sym: 'Y', name: 'Yttrium', cat: 'transition metal', r: 5, c: 3, mass: 88.906, en: 1.22 },
  { num: 40, sym: 'Zr', name: 'Zirconium', cat: 'transition metal', r: 5, c: 4, mass: 91.224, en: 1.33 },
  { num: 41, sym: 'Nb', name: 'Niobium', cat: 'transition metal', r: 5, c: 5, mass: 92.906, en: 1.6 },
  { num: 42, sym: 'Mo', name: 'Molybdenum', cat: 'transition metal', r: 5, c: 6, mass: 95.95, en: 2.16 },
  { num: 43, sym: 'Tc', name: 'Technetium', cat: 'transition metal', r: 5, c: 7, mass: 98, en: 1.9 },
  { num: 44, sym: 'Ru', name: 'Ruthenium', cat: 'transition metal', r: 5, c: 8, mass: 101.07, en: 2.2 },
  { num: 45, sym: 'Rh', name: 'Rhodium', cat: 'transition metal', r: 5, c: 9, mass: 102.91, en: 2.28 },
  { num: 46, sym: 'Pd', name: 'Palladium', cat: 'transition metal', r: 5, c: 10, mass: 106.42, en: 2.20 },
  { num: 47, sym: 'Ag', name: 'Silver', cat: 'transition metal', r: 5, c: 11, mass: 107.87, en: 1.93 },
  { num: 48, sym: 'Cd', name: 'Cadmium', cat: 'transition metal', r: 5, c: 12, mass: 112.41, en: 1.69 },
  { num: 49, sym: 'In', name: 'Indium', cat: 'post-transition metal', r: 5, c: 13, mass: 114.82, en: 1.78 },
  { num: 50, sym: 'Sn', name: 'Tin', cat: 'post-transition metal', r: 5, c: 14, mass: 118.71, en: 1.96 },
  { num: 51, sym: 'Sb', name: 'Antimony', cat: 'metalloid', r: 5, c: 15, mass: 121.76, en: 2.05 },
  { num: 52, sym: 'Te', name: 'Tellurium', cat: 'metalloid', r: 5, c: 16, mass: 127.60, en: 2.1 },
  { num: 53, sym: 'I', name: 'Iodine', cat: 'diatomic nonmetal', r: 5, c: 17, mass: 126.90, en: 2.66 },
  { num: 54, sym: 'Xe', name: 'Xenon', cat: 'noble gas', r: 5, c: 18, mass: 131.29, en: 2.6 },
  { num: 55, sym: 'Cs', name: 'Cesium', cat: 'alkali metal', r: 6, c: 1, mass: 132.91, en: 0.79 },
  { num: 56, sym: 'Ba', name: 'Barium', cat: 'alkaline earth metal', r: 6, c: 2, mass: 137.33, en: 0.89 },
  // Lanthanides (Row 8)
  { num: 57, sym: 'La', name: 'Lanthanum', cat: 'lanthanide', r: 8, c: 4, mass: 138.91, en: 1.1 },
  { num: 58, sym: 'Ce', name: 'Cerium', cat: 'lanthanide', r: 8, c: 5, mass: 140.12, en: 1.12 },
  { num: 59, sym: 'Pr', name: 'Praseodymium', cat: 'lanthanide', r: 8, c: 6, mass: 140.91, en: 1.13 },
  { num: 60, sym: 'Nd', name: 'Neodymium', cat: 'lanthanide', r: 8, c: 7, mass: 144.24, en: 1.14 },
  { num: 61, sym: 'Pm', name: 'Promethium', cat: 'lanthanide', r: 8, c: 8, mass: 145, en: 1.13 },
  { num: 62, sym: 'Sm', name: 'Samarium', cat: 'lanthanide', r: 8, c: 9, mass: 150.36, en: 1.17 },
  { num: 63, sym: 'Eu', name: 'Europium', cat: 'lanthanide', r: 8, c: 10, mass: 151.96, en: 1.2 },
  { num: 64, sym: 'Gd', name: 'Gadolinium', cat: 'lanthanide', r: 8, c: 11, mass: 157.25, en: 1.2 },
  { num: 65, sym: 'Tb', name: 'Terbium', cat: 'lanthanide', r: 8, c: 12, mass: 158.93, en: 1.2 },
  { num: 66, sym: 'Dy', name: 'Dysprosium', cat: 'lanthanide', r: 8, c: 13, mass: 162.50, en: 1.22 },
  { num: 67, sym: 'Ho', name: 'Holmium', cat: 'lanthanide', r: 8, c: 14, mass: 164.93, en: 1.23 },
  { num: 68, sym: 'Er', name: 'Erbium', cat: 'lanthanide', r: 8, c: 15, mass: 167.26, en: 1.24 },
  { num: 69, sym: 'Tm', name: 'Thulium', cat: 'lanthanide', r: 8, c: 16, mass: 168.93, en: 1.25 },
  { num: 70, sym: 'Yb', name: 'Ytterbium', cat: 'lanthanide', r: 8, c: 17, mass: 173.05, en: 1.1 },
  { num: 71, sym: 'Lu', name: 'Lutetium', cat: 'lanthanide', r: 8, c: 18, mass: 174.97, en: 1.27 },
  // Back to main block
  { num: 72, sym: 'Hf', name: 'Hafnium', cat: 'transition metal', r: 6, c: 4, mass: 178.49, en: 1.3 },
  { num: 73, sym: 'Ta', name: 'Tantalum', cat: 'transition metal', r: 6, c: 5, mass: 180.95, en: 1.5 },
  { num: 74, sym: 'W', name: 'Tungsten', cat: 'transition metal', r: 6, c: 6, mass: 183.84, en: 2.36 },
  { num: 75, sym: 'Re', name: 'Rhenium', cat: 'transition metal', r: 6, c: 7, mass: 186.21, en: 1.9 },
  { num: 76, sym: 'Os', name: 'Osmium', cat: 'transition metal', r: 6, c: 8, mass: 190.23, en: 2.2 },
  { num: 77, sym: 'Ir', name: 'Iridium', cat: 'transition metal', r: 6, c: 9, mass: 192.22, en: 2.2 },
  { num: 78, sym: 'Pt', name: 'Platinum', cat: 'transition metal', r: 6, c: 10, mass: 195.08, en: 2.28 },
  { num: 79, sym: 'Au', name: 'Gold', cat: 'transition metal', r: 6, c: 11, mass: 196.97, en: 2.54 },
  { num: 80, sym: 'Hg', name: 'Mercury', cat: 'transition metal', r: 6, c: 12, mass: 200.59, en: 2.00 },
  { num: 81, sym: 'Tl', name: 'Thallium', cat: 'post-transition metal', r: 6, c: 13, mass: 204.38, en: 1.62 },
  { num: 82, sym: 'Pb', name: 'Lead', cat: 'post-transition metal', r: 6, c: 14, mass: 207.2, en: 2.33 },
  { num: 83, sym: 'Bi', name: 'Bismuth', cat: 'post-transition metal', r: 6, c: 15, mass: 208.98, en: 2.02 },
  { num: 84, sym: 'Po', name: 'Polonium', cat: 'post-transition metal', r: 6, c: 16, mass: 209, en: 2.0 },
  { num: 85, sym: 'At', name: 'Astatine', cat: 'metalloid', r: 6, c: 17, mass: 210, en: 2.2 },
  { num: 86, sym: 'Rn', name: 'Radon', cat: 'noble gas', r: 6, c: 18, mass: 222, en: 2.2 },
  { num: 87, sym: 'Fr', name: 'Francium', cat: 'alkali metal', r: 7, c: 1, mass: 223, en: 0.7 },
  { num: 88, sym: 'Ra', name: 'Radium', cat: 'alkaline earth metal', r: 7, c: 2, mass: 226, en: 0.9 },
  // Actinides (Row 9)
  { num: 89, sym: 'Ac', name: 'Actinium', cat: 'actinide', r: 9, c: 4, mass: 227, en: 1.1 },
  { num: 90, sym: 'Th', name: 'Thorium', cat: 'actinide', r: 9, c: 5, mass: 232.04, en: 1.3 },
  { num: 91, sym: 'Pa', name: 'Protactinium', cat: 'actinide', r: 9, c: 6, mass: 231.04, en: 1.5 },
  { num: 92, sym: 'U', name: 'Uranium', cat: 'actinide', r: 9, c: 7, mass: 238.03, en: 1.38 },
  { num: 93, sym: 'Np', name: 'Neptunium', cat: 'actinide', r: 9, c: 8, mass: 237, en: 1.36 },
  { num: 94, sym: 'Pu', name: 'Plutonium', cat: 'actinide', r: 9, c: 9, mass: 244, en: 1.28 },
  { num: 95, sym: 'Am', name: 'Americium', cat: 'actinide', r: 9, c: 10, mass: 243, en: 1.13 },
  { num: 96, sym: 'Cm', name: 'Curium', cat: 'actinide', r: 9, c: 11, mass: 247, en: 1.28 },
  { num: 97, sym: 'Bk', name: 'Berkelium', cat: 'actinide', r: 9, c: 12, mass: 247, en: 1.3 },
  { num: 98, sym: 'Cf', name: 'Californium', cat: 'actinide', r: 9, c: 13, mass: 251, en: 1.3 },
  { num: 99, sym: 'Es', name: 'Einsteinium', cat: 'actinide', r: 9, c: 14, mass: 252, en: 1.3 },
  { num: 100, sym: 'Fm', name: 'Fermium', cat: 'actinide', r: 9, c: 15, mass: 257, en: 1.3 },
  { num: 101, sym: 'Md', name: 'Mendelevium', cat: 'actinide', r: 9, c: 16, mass: 258, en: 1.3 },
  { num: 102, sym: 'No', name: 'Nobelium', cat: 'actinide', r: 9, c: 17, mass: 259, en: 1.3 },
  { num: 103, sym: 'Lr', name: 'Lawrencium', cat: 'actinide', r: 9, c: 18, mass: 266, en: 1.3 },
  // Back to main block
  { num: 104, sym: 'Rf', name: 'Rutherfordium', cat: 'transition metal', r: 7, c: 4, mass: 267, en: null },
  { num: 105, sym: 'Db', name: 'Dubnium', cat: 'transition metal', r: 7, c: 5, mass: 268, en: null },
  { num: 106, sym: 'Sg', name: 'Seaborgium', cat: 'transition metal', r: 7, c: 6, mass: 269, en: null },
  { num: 107, sym: 'Bh', name: 'Bohrium', cat: 'transition metal', r: 7, c: 7, mass: 270, en: null },
  { num: 108, sym: 'Hs', name: 'Hassium', cat: 'transition metal', r: 7, c: 8, mass: 269, en: null },
  { num: 109, sym: 'Mt', name: 'Meitnerium', cat: 'transition metal', r: 7, c: 9, mass: 278, en: null },
  { num: 110, sym: 'Ds', name: 'Darmstadtium', cat: 'transition metal', r: 7, c: 10, mass: 281, en: null },
  { num: 111, sym: 'Rg', name: 'Roentgenium', cat: 'transition metal', r: 7, c: 11, mass: 282, en: null },
  { num: 112, sym: 'Cn', name: 'Copernicium', cat: 'transition metal', r: 7, c: 12, mass: 285, en: null },
  { num: 113, sym: 'Nh', name: 'Nihonium', cat: 'post-transition metal', r: 7, c: 13, mass: 286, en: null },
  { num: 114, sym: 'Fl', name: 'Flerovium', cat: 'post-transition metal', r: 7, c: 14, mass: 289, en: null },
  { num: 115, sym: 'Mc', name: 'Moscovium', cat: 'post-transition metal', r: 7, c: 15, mass: 290, en: null },
  { num: 116, sym: 'Lv', name: 'Livermorium', cat: 'post-transition metal', r: 7, c: 16, mass: 293, en: null },
  { num: 117, sym: 'Ts', name: 'Tennessine', cat: 'halogen', r: 7, c: 17, mass: 294, en: null },
  { num: 118, sym: 'Og', name: 'Oganesson', cat: 'noble gas', r: 7, c: 18, mass: 294, en: null },
];

const getCategoryColors = (cat, isDark) => {
  const darkColors = {
    'diatomic nonmetal': 'bg-pink-900/40 text-pink-200 border-pink-700/50',
    'polyatomic nonmetal': 'bg-rose-900/40 text-rose-200 border-rose-700/50',
    'alkali metal': 'bg-red-900/40 text-red-200 border-red-700/50',
    'alkaline earth metal': 'bg-orange-900/40 text-orange-200 border-orange-700/50',
    'transition metal': 'bg-blue-900/40 text-blue-200 border-blue-700/50',
    'post-transition metal': 'bg-indigo-900/40 text-indigo-200 border-indigo-700/50',
    'metalloid': 'bg-teal-900/40 text-teal-200 border-teal-700/50',
    'halogen': 'bg-purple-900/40 text-purple-200 border-purple-700/50',
    'noble gas': 'bg-violet-900/40 text-violet-200 border-violet-700/50',
    'lanthanide': 'bg-cyan-900/40 text-cyan-200 border-cyan-700/50',
    'actinide': 'bg-fuchsia-900/40 text-fuchsia-200 border-fuchsia-700/50',
  };
  
  const lightColors = {
    'diatomic nonmetal': 'bg-pink-300 text-pink-900 border-pink-400/50',
    'polyatomic nonmetal': 'bg-pink-200 text-pink-900 border-pink-300/50',
    'alkali metal': 'bg-red-300 text-red-900 border-red-400/50',
    'alkaline earth metal': 'bg-orange-200 text-orange-900 border-orange-300/50',
    'transition metal': 'bg-sky-200 text-sky-900 border-sky-300/50',
    'post-transition metal': 'bg-purple-200 text-purple-900 border-purple-300/50',
    'metalloid': 'bg-fuchsia-200 text-fuchsia-900 border-fuchsia-300/50',
    'halogen': 'bg-fuchsia-300 text-fuchsia-900 border-fuchsia-400/50',
    'noble gas': 'bg-purple-300 text-purple-900 border-purple-400/50',
    'lanthanide': 'bg-indigo-200 text-indigo-900 border-indigo-300/50',
    'actinide': 'bg-violet-300 text-violet-900 border-violet-400/50',
  };

  const fallbackDark = 'bg-slate-800/50 text-slate-300 border-slate-700';
  const fallbackLight = 'bg-gray-200 text-gray-800 border-gray-300';

  return isDark ? (darkColors[cat] || fallbackDark) : (lightColors[cat] || fallbackLight);
};

// --- Components ---

const AnimatedBohrModel = ({ element, isDark }) => {
  const shells = getShells(element.num);
  const maxRadius = 120; // Max size of container
  const baseRadius = 25;
  const radiusStep = (maxRadius - baseRadius) / (shells.length || 1);

  return (
    <div className={`relative w-full aspect-square max-w-[280px] mx-auto flex items-center justify-center overflow-hidden rounded-xl border transition-colors duration-500 shadow-inner ${isDark ? 'bg-slate-950/50 border-slate-800/50' : 'bg-white/50 border-white/50'}`}>
      {/* Nucleus */}
      <div className={`absolute z-10 w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${isDark ? 'bg-gradient-to-br from-red-500 to-rose-700 shadow-[0_0_20px_rgba(244,63,94,0.6)] border-red-400/50' : 'bg-gradient-to-br from-red-400 to-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.6)] border-red-300/50'}`}>
        <div className="text-white font-bold flex flex-col items-center leading-none">
          <span className="text-xs">{element.num}</span>
          <span className="text-[10px] opacity-80">p+</span>
        </div>
      </div>

      {/* Electron Shells */}
      {shells.map((electronCount, shellIndex) => {
        const radius = baseRadius + (shellIndex * radiusStep);
        const duration = 5 + (shellIndex * 3); // Outer shells slower
        const isReversed = shellIndex % 2 !== 0; // Alternate rotation direction

        return (
          <div
            key={`shell-${shellIndex}`}
            className={`absolute rounded-full border transition-colors duration-500 ${isDark ? 'border-slate-600/30' : 'border-slate-400/40'}`}
            style={{
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
              animation: `spin ${duration}s linear infinite ${isReversed ? 'reverse' : ''}`
            }}
          >
            {/* Electrons on this shell */}
            {Array.from({ length: electronCount }).map((_, eIndex) => {
              const angle = (eIndex / electronCount) * 360;
              return (
                <div
                  key={`e-${shellIndex}-${eIndex}`}
                  className={`absolute w-2.5 h-2.5 rounded-full transition-shadow duration-500 border ${isDark ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)] border-cyan-100' : 'bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)] border-cyan-100'}`}
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px)`,
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default function App() {
  // Default to Sulfur (Atomic Number 16)
  const [selected, setSelected] = useState(elements.find(e => e.num === 16));
  const [isDark, setIsDark] = useState(true);

  return (
    <div className={`min-h-[36rem] font-sans flex flex-col items-center justify-center overflow-hidden relative p-4 lg:p-8 transition-colors duration-500 ${isDark ? 'bg-slate-950 text-slate-100 selection:bg-blue-500/30' : 'bg-[#e8eaf2] text-slate-800 selection:bg-blue-200'}`}>
      
      {/* Theme Toggle Button */}
      <button 
        onClick={() => setIsDark(!isDark)}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className={`absolute top-4 right-4 lg:top-8 lg:right-8 p-3 rounded-full backdrop-blur-md border transition-all duration-300 z-50 shadow-lg ${isDark ? 'bg-slate-800/50 border-slate-700 text-yellow-400 hover:bg-slate-700 hover:scale-110' : 'bg-white/50 border-white/80 text-indigo-600 hover:bg-white hover:scale-110'}`}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Ambient Background Glows */}
      {isDark ? (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none transition-all duration-1000"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none transition-all duration-1000"></div>
        </>
      ) : (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-200/50 rounded-full blur-[120px] pointer-events-none transition-all duration-1000"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/50 rounded-full blur-[120px] pointer-events-none transition-all duration-1000"></div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col xl:flex-row gap-6 w-full max-w-[1600px] mx-auto h-full items-stretch justify-center z-10 pt-12 lg:pt-0">
        
        {/* Periodic Table Grid Container */}
        <div className={`flex-1 backdrop-blur-xl border rounded-3xl p-6 lg:p-8 overflow-auto flex flex-col justify-center min-w-[700px] transition-all duration-500 ${isDark ? 'bg-slate-900/40 border-slate-800/60 shadow-2xl shadow-black/40' : 'bg-white/40 border-white/60 shadow-xl shadow-slate-300/50'}`}>
          
          <div className="grid grid-cols-18 gap-1 md:gap-1.5 w-full max-w-[1200px] mx-auto relative pb-4">
            
            {/* Column Headers (Groups 1-18) */}
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={`col-${i}`} className={`text-center text-[10px] md:text-[11px] font-medium mb-1 md:mb-2 transition-colors duration-500 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ gridColumn: i + 1, gridRow: 1 }}>
                {i + 1}
              </div>
            ))}

            {/* Render Elements */}
            {elements.map((el) => {
              const isSelected = selected.num === el.num;
              const colorClass = getCategoryColors(el.cat, isDark);
              
              // Adjust row index to accommodate group headers (row 1) and gap before lanthanides
              let gridRow = el.r + 1; 
              if (el.r >= 8) gridRow += 1; // Add gap row before actinide/lanthanide

              // Complex class string to handle dark/light selected vs unselected states beautifully
              const selectionStyle = isSelected 
                ? (isDark 
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110 z-10 shadow-[0_0_20px_rgba(255,255,255,0.15)]' 
                    : 'ring-2 ring-slate-800 ring-offset-2 ring-offset-[#e8eaf2] scale-110 z-10 shadow-lg') 
                : (isDark
                    ? 'hover:scale-110 hover:z-10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] opacity-85 hover:opacity-100'
                    : 'hover:scale-110 hover:z-10 hover:shadow-md opacity-90 hover:opacity-100');

              return (
                <button
                  key={el.num}
                  onClick={() => setSelected(el)}
                  className={`
                    relative group flex flex-col items-center justify-center p-1 rounded-md md:rounded-lg transition-all duration-300 ease-out border backdrop-blur-sm
                    ${colorClass} 
                    ${selectionStyle}
                  `}
                  style={{
                    gridColumn: el.c,
                    gridRow: gridRow,
                    aspectRatio: '1/1'
                  }}
                  title={`${el.name} (${el.sym})`}
                >
                  <span className={`absolute top-0.5 md:top-1 left-1 md:left-1.5 text-[8px] md:text-[10px] font-semibold ${isDark ? 'opacity-70' : 'opacity-80'}`}>{el.num}</span>
                  <span className="text-sm md:text-xl font-bold leading-none mt-1.5 md:mt-2 tracking-tight">{el.sym}</span>
                  <span className={`text-[6px] md:text-[9px] truncate w-full px-0.5 text-center mt-0.5 md:mt-1 ${isDark ? 'opacity-80' : 'opacity-90'}`}>{el.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className={`w-full xl:w-96 shrink-0 backdrop-blur-2xl border rounded-3xl p-6 lg:p-8 flex flex-col h-full justify-between transition-all duration-500 ${isDark ? 'bg-slate-900/50 border-slate-800/60 shadow-2xl shadow-black/40' : 'bg-white/60 border-white/60 shadow-2xl shadow-slate-300/50'}`}>
          <div>
            <h2 className={`text-xl font-bold mb-6 flex items-center justify-between transition-colors duration-500 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
              Element Guide
              <Search className={`w-5 h-5 cursor-pointer transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`} />
            </h2>

            {/* Large Element Card */}
            <div className={`
              rounded-2xl p-8 flex flex-col items-center justify-center relative mb-8 shadow-inner border backdrop-blur-md transition-colors duration-500
              ${getCategoryColors(selected.cat, isDark)}
            `}>
              <span className={`absolute top-4 left-5 text-xl font-semibold ${isDark ? 'opacity-80' : 'opacity-90'}`}>{selected.num}</span>
              <span className="text-7xl font-bold my-4 drop-shadow-md">{selected.sym}</span>
              <span className="text-xl font-medium tracking-wide">{selected.name}</span>
            </div>

            {/* Key Details */}
            <div className="space-y-4 mb-8 text-sm md:text-base">
              <div className={`flex justify-between border-b pb-3 transition-colors duration-500 ${isDark ? 'border-slate-700/50 text-slate-400' : 'border-slate-200/80 text-slate-500'}`}>
                <span>Group</span>
                <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{selected.c <= 18 ? selected.c : '-'}</span>
              </div>
              <div className={`flex justify-between border-b pb-3 transition-colors duration-500 ${isDark ? 'border-slate-700/50 text-slate-400' : 'border-slate-200/80 text-slate-500'}`}>
                <span>Period</span>
                <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{selected.r <= 7 ? selected.r : (selected.r === 8 ? 6 : 7)}</span>
              </div>
              <div className={`flex justify-between border-b pb-3 transition-colors duration-500 ${isDark ? 'border-slate-700/50 text-slate-400' : 'border-slate-200/80 text-slate-500'}`}>
                <span>Electronegativity</span>
                <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{selected.en || 'N/A'}</span>
              </div>
              <div className={`flex justify-between pb-3 transition-colors duration-500 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>Atomic Mass</span>
                <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{selected.mass} u</span>
              </div>
            </div>
          </div>

          {/* Bohr Model Animation */}
          <div className="mt-4">
            <h3 className={`font-semibold mb-4 flex items-center gap-2 transition-colors duration-500 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <Activity className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} /> Atomic Structure
            </h3>
            <div className={`rounded-2xl p-4 transition-colors duration-500 ${isDark ? 'bg-slate-900/60 border border-slate-800/50 shadow-inner' : 'bg-white/50 border border-white/50 shadow-sm'}`}>
               <AnimatedBohrModel element={selected} isDark={isDark} />
               <div className={`text-center text-sm mt-4 font-medium tracking-widest transition-colors duration-500 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                 {getShells(selected.num).join(' • ')}
               </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .grid-cols-18 {
          grid-template-columns: repeat(18, minmax(0, 1fr));
        }
      `}} />
    </div>
  );
}