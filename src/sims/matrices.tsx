import React, { useState, useEffect, useRef } from 'react';

    // --- Inline Icons ---
    const IconPlay = () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    const IconPause = () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    const IconRefresh = () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    );
    const IconChevronRight = () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    );
    const IconChevronLeft = () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
      </svg>
    );

    export default function App() {
      // Dimensions: A is m x n, B is n x p, Result C is m x p
      const [m, setM] = useState(2);
      const [n, setN] = useState(3);
      const [p, setP] = useState(2);

      // Matrices data
      const [matrixA, setMatrixA] = useState([
        [1, 2, 3],
        [4, 5, 6]
      ]);
      const [matrixB, setMatrixB] = useState([
        [7, 8],
        [9, 1],
        [2, 3]
      ]);

      // Selected element in result matrix C (i, j)
      const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });

      // Step-by-step dot product animation index
      const [activeStep, setActiveStep] = useState(0);
      const [isPlaying, setIsPlaying] = useState(false);

      // Application Mode Tab: 'explainer' | 'graphics' | 'business' | 'network' | 'ai'
      const [appTab, setAppTab] = useState('explainer');

      // Graphics App Specific State
      const [rotationAngle, setRotationAngle] = useState(30);
      const [scaleX, setScaleX] = useState(1.2);
      const [scaleY, setScaleY] = useState(1.2);

      // Update Matrix sizes when m, n, p change
      useEffect(() => {
        setMatrixA(prev => {
          const newA = Array(m).fill(0).map((_, r) =>
            Array(n).fill(0).map((_, c) => (prev[r] && prev[r][c] !== undefined ? prev[r][c] : Math.floor(Math.random() * 5 + 1)))
          );
          return newA;
        });
      }, [m, n]);

      useEffect(() => {
        setMatrixB(prev => {
          const newB = Array(n).fill(0).map((_, r) =>
            Array(p).fill(0).map((_, c) => (prev[r] && prev[r][c] !== undefined ? prev[r][c] : Math.floor(Math.random() * 5 + 1)))
          );
          return newB;
        });
      }, [n, p]);

      // Clamp selected cell when dimensions shift
      useEffect(() => {
        setSelectedCell(prev => ({
          row: Math.min(prev.row, m - 1),
          col: Math.min(prev.col, p - 1)
        }));
        setActiveStep(0);
      }, [m, p]);

      // Calculate Result Matrix C = A x B
      const resultMatrix = React.useMemo(() => {
        const C = Array(m).fill(0).map(() => Array(p).fill(0));
        for (let r = 0; r < m; r++) {
          for (let c = 0; c < p; c++) {
            let sum = 0;
            for (let k = 0; k < n; k++) {
              sum += (matrixA[r][k] || 0) * (matrixB[k][c] || 0);
            }
            C[r][c] = Number(sum.toFixed(2));
          }
        }
        return C;
      }, [matrixA, matrixB, m, n, p]);

      // Animation playback timer
      useEffect(() => {
        let interval;
        if (isPlaying) {
          interval = setInterval(() => {
            setActiveStep(prev => (prev + 1) % n);
          }, 1200);
        } else {
          clearInterval(interval);
        }
        return () => clearInterval(interval);
      }, [isPlaying, n]);

      // Matrix A cell change handler
      const handleAChange = (r, c, val) => {
        const num = parseFloat(val) || 0;
        setMatrixA(prev => {
          const copy = prev.map(row => [...row]);
          copy[r][c] = num;
          return copy;
        });
      };

      // Matrix B cell change handler
      const handleBChange = (r, c, val) => {
        const num = parseFloat(val) || 0;
        setMatrixB(prev => {
          const copy = prev.map(row => [...row]);
          copy[r][c] = num;
          return copy;
        });
      };

      // Presets
      const loadPreset = (type) => {
        setIsPlaying(false);
        setActiveStep(0);
        if (type === 'random') {
          setMatrixA(Array(m).fill(0).map(() => Array(n).fill(0).map(() => Math.floor(Math.random() * 9 - 2))));
          setMatrixB(Array(n).fill(0).map(() => Array(p).fill(0).map(() => Math.floor(Math.random() * 9 - 2))));
        } else if (type === 'identity') {
          setM(3); setN(3); setP(3);
          setMatrixA([[1,0,0],[0,1,0],[0,0,1]]);
          setMatrixB([[2,4,1],[3,0,-2],[5,1,3]]);
        } else if (type === 'graphics') {
          setM(2); setN(2); setP(4);
          const rad = (rotationAngle * Math.PI) / 180;
          const cos = Number(Math.cos(rad).toFixed(2));
          const sin = Number(Math.sin(rad).toFixed(2));
          setMatrixA([[cos, -sin], [sin, cos]]);
          setMatrixB([[1, 3, 3, 1], [1, 1, 4, 4]]); // House / box polygon points
          setAppTab('graphics');
        } else if (type === 'business') {
          setM(3); setN(3); setP(2);
          // Store orders: Laptops, Phones, Tablets
          setMatrixA([
            [10, 20, 15], // Store 1
            [25, 10, 5],  // Store 2
            [12, 18, 30]  // Store 3
          ]);
          // Cost and Profit per item
          setMatrixB([
            [800, 200],  // Laptop: Cost $800, Profit $200
            [500, 150],  // Phone: Cost $500, Profit $150
            [300, 80]    // Tablet: Cost $300, Profit $80
          ]);
          setAppTab('business');
        }
      };

      // Sync 2D graphics transform matrix when sliders change
      useEffect(() => {
        if (appTab === 'graphics' && m === 2 && n === 2) {
          const rad = (rotationAngle * Math.PI) / 180;
          const cθ = Math.cos(rad);
          const sθ = Math.sin(rad);
          // Scale, then rotate: R S = [[c sx, −s sy], [s sx, c sy]]
          setMatrixA([
            [Number((cθ * scaleX).toFixed(2)), Number((-sθ * scaleY).toFixed(2))],
            [Number((sθ * scaleX).toFixed(2)), Number((cθ * scaleY).toFixed(2))],
          ]);
        }
      }, [rotationAngle, scaleX, scaleY, appTab]);

      // Selected calculation detail terms
      const selectedRow = selectedCell.row;
      const selectedCol = selectedCell.col;
      const terms = Array(n).fill(0).map((_, k) => {
        const valA = matrixA[selectedRow]?.[k] ?? 0;
        const valB = matrixB[k]?.[selectedCol] ?? 0;
        return {
          k,
          a: valA,
          b: valB,
          prod: Number((valA * valB).toFixed(2))
        };
      });

      const currentTotal = terms.reduce((acc, t) => acc + t.prod, 0);

      return (
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full">
                  Linear Algebra Explorer
                </span>
                <span className="text-xs text-slate-400">Interactive Visualizer</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">
                Matrix Multiplication Simulation
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                Select dimensions, click any cell in the result matrix to visualize row-column dot products, and explore real-world applications in graphics, AI, and business.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => loadPreset('random')}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition"
              >
                <IconRefresh /> Random Numbers
              </button>
              <button
                onClick={() => loadPreset('identity')}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition"
              >
                3x3 Identity
              </button>
              <button
                onClick={() => loadPreset('graphics')}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg transition"
              >
                2D Graphics Demo
              </button>
              <button
                onClick={() => loadPreset('business')}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition"
              >
                Business Supply Chain
              </button>
            </div>
          </header>

          {/* Matrix Order / Dimension Selector */}
          <section className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Select Matrix Dimensions
                </h2>
              </div>

              {/* Order Controls */}
              <div className="flex flex-wrap items-center gap-4 text-sm font-mono">
                {/* Matrix A Dimensions */}
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold px-1">Matrix A</span>
                  <label className="text-xs text-slate-400">Rows (m):</label>
                  <select
                    value={m}
                    onChange={(e) => setM(Number(e.target.value))}
                    className="bg-slate-800 text-white px-2 py-1 rounded border border-slate-700 font-bold text-center focus:outline-none focus:border-amber-400"
                  >
                    {[1, 2, 3, 4].map(val => <option key={val} value={val}>{val}</option>)}
                  </select>
                  <span className="text-slate-500">×</span>
                  <label className="text-xs text-slate-400">Cols (n):</label>
                  <select
                    value={n}
                    onChange={(e) => setN(Number(e.target.value))}
                    className="bg-slate-800 text-amber-400 px-2 py-1 rounded border border-amber-500/50 font-bold text-center focus:outline-none"
                  >
                    {[1, 2, 3, 4].map(val => <option key={val} value={val}>{val}</option>)}
                  </select>
                </div>

                <span className="text-slate-500 text-lg font-bold">×</span>

                {/* Matrix B Dimensions */}
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-cyan-400 font-bold px-1">Matrix B</span>
                  <label className="text-xs text-slate-400">Rows (n):</label>

                  {/* Lock B's rows to A's columns for valid multiplication */}
                  <div className="bg-slate-800 text-cyan-400 font-bold px-3 py-1 rounded border border-cyan-500/50">
                    {n}
                  </div>

                  <span className="text-slate-500">×</span>
                  <label className="text-xs text-slate-400">Cols (p):</label>
                  <select
                    value={p}
                    onChange={(e) => setP(Number(e.target.value))}
                    className="bg-slate-800 text-white px-2 py-1 rounded border border-slate-700 font-bold text-center focus:outline-none focus:border-cyan-400"
                  >
                    {[1, 2, 3, 4].map(val => <option key={val} value={val}>{val}</option>)}
                  </select>
                </div>

                <span className="text-slate-500 text-lg font-bold">=</span>

                {/* Result C Dimension */}
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/30">
                  <span className="text-emerald-400 font-bold">Result C:</span>
                  <span className="font-bold text-emerald-300">{m} × {p}</span>
                </div>
              </div>
            </div>

            {/* Dimension Compatibility Rule Banner */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓ Multiplication Condition:</span>
                <span>Inner dimensions match (<span className="text-amber-400 font-bold">{n}</span> = <span className="text-cyan-400 font-bold">{n}</span>). Output order is outer dimensions (<span className="text-emerald-300 font-bold">{m} × {p}</span>).</span>
              </div>
              <span className="italic text-slate-500">Tip: Click any cell in Matrix C to trace its dot product calculation.</span>
            </div>
          </section>

          {/* Interactive Matrices Multiplication Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Interactive Matrix Equation (A x B = C) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Interactive Equation Grid</span>
                </h3>
                <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md font-mono">
                  c<sub>{selectedRow + 1},{selectedCol + 1}</sub> selected
                </span>
              </div>

              {/* Matrices Layout Grid */}
              <div className="flex flex-wrap items-center justify-center gap-4 py-2 overflow-x-auto">
                
                {/* MATRIX A */}
                <div className="flex flex-col items-center">
                  <div className="text-xs font-bold font-mono text-amber-400 mb-2 flex items-center gap-1">
                    Matrix A <span className="text-slate-500 font-normal">({m}×{n})</span>
                  </div>

                  <div className="relative p-2 bg-slate-950 border-x-2 border-amber-500/80 rounded-lg">
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`
                      }}
                    >
                      {matrixA.map((row, r) =>
                        row.map((val, c) => {
                          const isRowHighlighted = r === selectedRow;
                          const isStepHighlighted = isRowHighlighted && c === activeStep;

                          return (
                            <input
                              key={`a-${r}-${c}`}
                              type="number"
                              step="any"
                              value={val}
                              onChange={(e) => handleAChange(r, c, e.target.value)}
                              className={`w-14 h-12 text-center font-mono font-bold text-sm rounded-lg border transition-all ${
                                isStepHighlighted
                                  ? 'bg-amber-400 text-slate-950 border-white ring-2 ring-amber-300 scale-105 z-10 shadow-lg shadow-amber-500/40'
                                  : isRowHighlighted
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-inner'
                                  : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-slate-700'
                              }`}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400/80 mt-1 font-mono">Row {selectedRow + 1} highlighted</span>
                </div>

                <span className="text-2xl font-bold text-slate-600 font-mono mt-4">×</span>

                {/* MATRIX B */}
                <div className="flex flex-col items-center">
                  <div className="text-xs font-bold font-mono text-cyan-400 mb-2 flex items-center gap-1">
                    Matrix B <span className="text-slate-500 font-normal">({n}×{p})</span>
                  </div>

                  <div className="relative p-2 bg-slate-950 border-x-2 border-cyan-500/80 rounded-lg">
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: `repeat(${p}, minmax(0, 1fr))`
                      }}
                    >
                      {matrixB.map((row, r) =>
                        row.map((val, c) => {
                          const isColHighlighted = c === selectedCol;
                          const isStepHighlighted = isColHighlighted && r === activeStep;

                          return (
                            <input
                              key={`b-${r}-${c}`}
                              type="number"
                              step="any"
                              value={val}
                              onChange={(e) => handleBChange(r, c, e.target.value)}
                              className={`w-14 h-12 text-center font-mono font-bold text-sm rounded-lg border transition-all ${
                                isStepHighlighted
                                  ? 'bg-cyan-400 text-slate-950 border-white ring-2 ring-cyan-300 scale-105 z-10 shadow-lg shadow-cyan-500/40'
                                  : isColHighlighted
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-inner'
                                  : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-slate-700'
                              }`}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-cyan-400/80 mt-1 font-mono">Col {selectedCol + 1} highlighted</span>
                </div>

                <span className="text-2xl font-bold text-slate-600 font-mono mt-4">=</span>

                {/* RESULT MATRIX C */}
                <div className="flex flex-col items-center">
                  <div className="text-xs font-bold font-mono text-emerald-400 mb-2 flex items-center gap-1">
                    Result C <span className="text-slate-500 font-normal">({m}×{p})</span>
                  </div>

                  <div className="relative p-2 bg-slate-950 border-x-2 border-emerald-500/80 rounded-lg">
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: `repeat(${p}, minmax(0, 1fr))`
                      }}
                    >
                      {resultMatrix.map((row, r) =>
                        row.map((val, c) => {
                          const isSelected = r === selectedRow && c === selectedCol;

                          return (
                            <button
                              key={`c-${r}-${c}`}
                              onClick={() => {
                                setSelectedCell({ row: r, col: c });
                                setActiveStep(0);
                              }}
                              className={`w-14 h-12 text-center font-mono font-extrabold text-sm rounded-lg border transition-all flex flex-col items-center justify-center relative ${
                                isSelected
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 ring-2 ring-emerald-400/80 scale-105 shadow-lg shadow-emerald-500/30'
                                  : 'bg-slate-900 text-emerald-400 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800'
                              }`}
                            >
                              <span>{val}</span>
                              <span className={`text-[9px] ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                                c<sub>{r+1}{c+1}</sub>
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400/80 mt-1 font-mono">Click element to view step</span>
                </div>

              </div>

              {/* Color Key */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-400"></span>
                  <span>Row {selectedRow + 1} of Matrix A</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-cyan-500/40 border border-cyan-400"></span>
                  <span>Column {selectedCol + 1} of Matrix B</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-400"></span>
                  <span>Result Cell c<sub>{selectedRow+1},{selectedCol+1}</sub></span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Dot-Product Calculation Inspector */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span>Element Computation Breakdown</span>
                </h3>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                  c<sub>{selectedRow + 1},{selectedCol + 1}</sub> = {resultMatrix[selectedRow]?.[selectedCol]}
                </span>
              </div>

              {/* Math Formula Header */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm font-mono leading-relaxed">
                <div className="text-slate-400 text-xs mb-1">Dot Product Formula:</div>
                <div className="text-slate-200 font-bold">
                  c<sub>{selectedRow + 1},{selectedCol + 1}</sub> =
                  {terms.map((t, idx) => (
                    <span key={idx}>
                      {idx > 0 && <span className="text-slate-500 px-1">+</span>}
                      <span className={idx === activeStep ? "text-amber-300 underline font-extrabold" : "text-amber-400"}>
                        a<sub>{selectedRow + 1},{t.k + 1}</sub>
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className={idx === activeStep ? "text-cyan-300 underline font-extrabold" : "text-cyan-400"}>
                        b<sub>{t.k + 1},{selectedCol + 1}</sub>
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Numerical Substitution Steps */}
              <div className="flex flex-col gap-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Term-by-Term Sum:
                </div>

                <div className="space-y-2">
                  {terms.map((t, idx) => {
                    const isCurrent = idx === activeStep;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveStep(idx)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between font-mono text-sm ${
                          isCurrent
                            ? 'bg-slate-800 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCurrent ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-amber-400 font-bold">({t.a})</span>
                            <span className="text-slate-500 px-1">×</span>
                            <span className="text-cyan-400 font-bold">({t.b})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">=</span>
                          <span className="font-bold text-slate-100">{t.prod}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Step Controls */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveStep(prev => (prev - 1 + n) % n)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                    title="Previous term"
                  >
                    <IconChevronLeft />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition ${
                      isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    }`}
                  >
                    {isPlaying ? <><IconPause /> Pause</> : <><IconPlay /> Auto Step</>}
                  </button>
                  <button
                    onClick={() => setActiveStep(prev => (prev + 1) % n)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                    title="Next term"
                  >
                    <IconChevronRight />
                  </button>
                </div>

                <div className="text-xs font-mono text-slate-400">
                  Term <span className="text-emerald-400 font-bold">{activeStep + 1}</span> of {n}
                </div>
              </div>

              {/* Final Accumulation Total */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Accumulated Sum:</span>
                <span className="text-xl font-mono font-extrabold text-emerald-400">
                  {terms.slice(0, activeStep + 1).reduce((acc, t) => acc + t.prod, 0).toFixed(2)}
                  <span className="text-xs text-slate-400 font-normal pl-2">
                    (Total: {currentTotal.toFixed(2)})
                  </span>
                </span>
              </div>
            </div>

          </div>

          {/* REAL-WORLD APPLICATIONS PANEL */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  <span>Interactive Context Explorer</span>
                </div>
                <h3 className="text-xl font-bold text-white">Real-World Matrix Applications</h3>
              </div>

              {/* Application Tabs */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAppTab('graphics')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition ${
                    appTab === 'graphics'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  🎮 2D Computer Graphics
                </button>
                <button
                  onClick={() => setAppTab('business')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition ${
                    appTab === 'business'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  📊 Business Supply Chain
                </button>
                <button
                  onClick={() => setAppTab('network')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition ${
                    appTab === 'network'
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  🌐 Social Networks (Graphs)
                </button>
                <button
                  onClick={() => setAppTab('ai')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition ${
                    appTab === 'ai'
                      ? 'bg-purple-500 text-slate-950 shadow-lg shadow-purple-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  🧠 AI Neural Networks
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: 2D COMPUTER GRAPHICS */}
            {appTab === 'graphics' && (
              <GraphicsApplicationModule
                rotationAngle={rotationAngle}
                setRotationAngle={setRotationAngle}
                scaleX={scaleX}
                setScaleX={setScaleX}
                scaleY={scaleY}
                setScaleY={setScaleY}
                matrixA={matrixA}
                matrixB={matrixB}
                resultMatrix={resultMatrix}
              />
            )}

            {/* TAB CONTENT 2: BUSINESS SUPPLY CHAIN */}
            {appTab === 'business' && (
              <BusinessApplicationModule
                matrixA={matrixA}
                matrixB={matrixB}
                resultMatrix={resultMatrix}
                selectedCell={selectedCell}
                setSelectedCell={setSelectedCell}
              />
            )}

            {/* TAB CONTENT 3: SOCIAL NETWORK / GRAPH MULTIPLICATION */}
            {appTab === 'network' && (
              <SocialNetworkModule />
            )}

            {/* TAB CONTENT 4: NEURAL NETWORK LAYER */}
            {appTab === 'ai' && (
              <NeuralNetworkModule />
            )}
          </section>
        </div>
      );
    }

    // --- SUB-MODULE 1: 2D Graphics Canvas Visualization ---
    function GraphicsApplicationModule({
      rotationAngle,
      setRotationAngle,
      scaleX,
      setScaleX,
      scaleY,
      setScaleY,
      matrixA,
      matrixB,
      resultMatrix
    }) {
      const canvasRef = useRef(null);

      useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 35; // Pixels per unit

        ctx.clearRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;

        for (let x = -10; x <= 10; x++) {
          ctx.beginPath();
          ctx.moveTo(centerX + x * scale, 0);
          ctx.lineTo(centerX + x * scale, height);
          ctx.stroke();
        }
        for (let y = -10; y <= 10; y++) {
          ctx.beginPath();
          ctx.moveTo(0, centerY - y * scale);
          ctx.lineTo(width, centerY - y * scale);
          ctx.stroke();
        }

        // Draw axes
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
        ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height);
        ctx.stroke();

        // Original Polygon Vertices from Matrix B (if 2 rows)
        if (matrixB.length >= 2) {
          const cols = matrixB[0].length;
          const origPoints = [];
          for (let c = 0; c < cols; c++) {
            origPoints.push({
              x: matrixB[0][c],
              y: matrixB[1][c]
            });
          }

          // Draw Original Polygon (dashed grey/blue)
          ctx.strokeStyle = '#64748b';
          ctx.fillStyle = 'rgba(100, 116, 139, 0.15)';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          origPoints.forEach((pt, i) => {
            const px = centerX + pt.x * scale;
            const py = centerY - pt.y * scale;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.closePath();
          ctx.stroke();
          ctx.fill();
          ctx.setLineDash([]); // Reset line dash

          // Draw Transformed Polygon from Result Matrix C
          if (resultMatrix.length >= 2) {
            const transPoints = [];
            for (let c = 0; c < resultMatrix[0].length; c++) {
              transPoints.push({
                x: resultMatrix[0][c],
                y: resultMatrix[1][c]
              });
            }

            ctx.strokeStyle = '#f59e0b'; // Amber glowing transformed shape
            ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            transPoints.forEach((pt, i) => {
              const px = centerX + pt.x * scale;
              const py = centerY - pt.y * scale;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            });
            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            // Draw vertex dots
            transPoints.forEach((pt, i) => {
              const px = centerX + pt.x * scale;
              const py = centerY - pt.y * scale;
              ctx.fillStyle = '#fbbf24';
              ctx.beginPath();
              ctx.arc(px, py, 5, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#ffffff';
              ctx.font = '10px monospace';
              ctx.fillText(`P${i+1}`, px + 7, py - 7);
            });
          }
        }
      }, [matrixB, resultMatrix]);

      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-amber-400 mb-2">Matrix Multiplication in GPU Graphics</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                In game engines and 3D graphics (OpenGL/DirectX), every object rotation, scaling, and translation is performed by multiplying a <strong>Transformation Matrix (A)</strong> with a matrix of <strong>Vertex Coordinates (B)</strong>.
              </p>
            </div>

            {/* Controls */}
            <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Rotation Angle (θ):</span>
                  <span className="text-amber-400 font-bold">{rotationAngle}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Scale X:</span>
                  <span className="text-amber-400 font-bold">{scaleX}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={scaleX}
                  onChange={(e) => setScaleX(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Scale Y:</span>
                  <span className="text-amber-400 font-bold">{scaleY}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={scaleY}
                  onChange={(e) => setScaleY(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="md:col-span-7 flex flex-col items-center">
            <div className="relative bg-slate-950 rounded-2xl border border-slate-800 p-2 shadow-inner">
              <canvas
                ref={canvasRef}
                width={480}
                height={320}
                className="rounded-xl bg-slate-950 w-full h-auto max-w-full"
              ></canvas>
              <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> Original Shape
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Transformed Shape (C)
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // --- SUB-MODULE 2: Business Supply Chain Inventory ---
    function BusinessApplicationModule({ matrixA, matrixB, resultMatrix, selectedCell, setSelectedCell }) {
      const storeNames = ["Downtown Store", "Uptown Branch", "Suburban Mall"];
      const itemNames = ["Laptops", "Phones", "Tablets"];

      return (
        <div className="flex flex-col gap-6">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-sm font-bold text-emerald-400 mb-1">Supply Chain Inventory & Financial Yield</h4>
            <p className="text-xs text-slate-300">
              Matrix A represents <strong>inventory units ordered per store</strong>. Matrix B represents <strong>Unit Cost & Expected Profit per item</strong>. The product matrix C directly computes total expenditure and profit for each retail location in a single calculation!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Store Orders Table */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h5 className="text-xs font-bold text-amber-400 font-mono mb-3">Matrix A: Inventory Quantities</h5>
              <div className="space-y-2 text-xs font-mono">
                {matrixA.map((row, r) => (
                  <div key={r} className="p-2 bg-slate-900 rounded border border-slate-800">
                    <div className="text-slate-400 font-bold text-[11px] mb-1">{storeNames[r] || `Store ${r+1}`}</div>
                    <div className="flex justify-between text-slate-300">
                      {row.map((qty, c) => (
                        <span key={c}>{itemNames[c] || `Item ${c+1}`}: <strong className="text-amber-300">{qty}</strong></span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost & Profit Table */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h5 className="text-xs font-bold text-cyan-400 font-mono mb-3">Matrix B: Unit Cost & Profit ($)</h5>
              <div className="space-y-2 text-xs font-mono">
                {matrixB.map((row, r) => (
                  <div key={r} className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400 font-bold">{itemNames[r] || `Item ${r+1}`}</span>
                    <div className="space-x-3">
                      <span className="text-slate-300">Cost: <strong className="text-cyan-300">${row[0]}</strong></span>
                      <span className="text-slate-300">Profit: <strong className="text-emerald-300">${row[1] ?? 0}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Results */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h5 className="text-xs font-bold text-emerald-400 font-mono mb-3">Result C: Financial Summary</h5>
              <div className="space-y-2 text-xs font-mono">
                {resultMatrix.map((row, r) => (
                  <div key={r} className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <div className="text-slate-300 font-bold mb-1">{storeNames[r] || `Store ${r+1}`}</div>
                    <div className="flex justify-between text-slate-200">
                      <span className="text-slate-400">Total Cost: <strong className="text-cyan-400">${row[0]}</strong></span>
                      <span className="text-slate-400">Total Profit: <strong className="text-emerald-400">${row[1] ?? 0}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // --- SUB-MODULE 3: Social Network Graph Adjacency Matrix ---
    function SocialNetworkModule() {
      // 4 Users graph matrix
      const [adjMatrix, setAdjMatrix] = useState([
        [0, 1, 1, 0],
        [1, 0, 1, 1],
        [1, 1, 0, 1],
        [0, 1, 1, 0]
      ]);

      const names = ["Alice", "Bob", "Charlie", "David"];

      // Calculate A x A (2-step connection counts)
      const squaredMatrix = React.useMemo(() => {
        const size = 4;
        const res = Array(size).fill(0).map(() => Array(size).fill(0));
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            let sum = 0;
            for (let k = 0; k < size; k++) {
              sum += adjMatrix[r][k] * adjMatrix[k][c];
            }
            res[r][c] = sum;
          }
        }
        return res;
      }, [adjMatrix]);

      const toggleEdge = (r, c) => {
        if (r === c) return;
        setAdjMatrix(prev => {
          const copy = prev.map(row => [...row]);
          const newVal = copy[r][c] === 1 ? 0 : 1;
          copy[r][c] = newVal;
          copy[c][r] = newVal; // Undirected graph
          return copy;
        });
      };

      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-cyan-400 mb-1">Graph Paths & Network Theory</h4>
              <p className="text-xs text-slate-300">
                If <strong>Matrix A</strong> represents direct friendship links (1 = friends, 0 = not friends), then calculating <strong>A² (A × A)</strong> gives the number of <strong>2-step paths (mutual friends)</strong> between any two users!
              </p>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 mb-2">Direct Adjacency Matrix (A):</div>
              <div className="grid grid-cols-4 gap-1.5 font-mono text-center text-xs">
                {adjMatrix.map((row, r) =>
                  row.map((val, c) => (
                    <button
                      key={`adj-${r}-${c}`}
                      disabled={r === c}
                      onClick={() => toggleEdge(r, c)}
                      className={`p-2 rounded font-bold border transition ${
                        r === c
                          ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                          : val === 1
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-cyan-500/50'
                      }`}
                    >
                      {val}
                    </button>
                  ))
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Click cells to toggle connections</span>
            </div>
          </div>

          <div className="md:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-sm font-bold text-emerald-400 mb-2">Result Matrix A²: 2-Step Mutual Connections</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-2">User</th>
                    {names.map((n, i) => <th key={i} className="p-2 text-center">{n}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {squaredMatrix.map((row, r) => (
                    <tr key={r} className="border-b border-slate-800/60">
                      <td className="p-2 font-bold text-cyan-300">{names[r]}</td>
                      {row.map((val, c) => (
                        <td key={c} className="p-2 text-center">
                          <span className={`inline-block px-2 py-1 rounded font-bold ${
                            val > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-600'
                          }`}>
                            {val} paths
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // --- SUB-MODULE 4: Neural Network Dense Layer ---
    function NeuralNetworkModule() {
      // Inputs X (1 x 3), Weights W (3 x 2)
      const inputsX = [0.8, -0.5, 1.2];
      const weightsW = [
        [0.4, -0.2],
        [0.9, 0.5],
        [-0.1, 0.7]
      ];

      // Result C = X x W
      const rawOutput = [
        Number((inputsX[0]*weightsW[0][0] + inputsX[1]*weightsW[1][0] + inputsX[2]*weightsW[2][0]).toFixed(2)),
        Number((inputsX[0]*weightsW[0][1] + inputsX[1]*weightsW[1][1] + inputsX[2]*weightsW[2][1]).toFixed(2))
      ];

      // ReLU Activation max(0, x)
      const reluOutput = rawOutput.map(v => Math.max(0, v));

      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-purple-400">AI Deep Learning Linear Layer</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every artificial neural network layer computes <strong>Y = Activation(X · W + b)</strong>. Matrix multiplication is the foundational operation that powers AI models like ChatGPT and computer vision networks!
            </p>
            <div className="font-mono text-xs space-y-1 bg-slate-900 p-3 rounded border border-slate-800">
              <div className="text-slate-400">Inputs Vector X: <span className="text-amber-300 font-bold">[0.8, -0.5, 1.2]</span></div>
              <div className="text-slate-400">Weights Matrix W: <span className="text-purple-300 font-bold">(3×2 Shape)</span></div>
            </div>
          </div>

          <div className="md:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-4 font-mono">
            <div className="flex items-center justify-around gap-2 text-center text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Inputs X (1×3)</span>
                <span className="text-amber-300 font-bold">[0.8, -0.5, 1.2]</span>
              </div>
              <span className="text-slate-500 font-bold">×</span>
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Weights W (3×2)</span>
                <span className="text-purple-300 font-bold">Linear Synapses</span>
              </div>
              <span className="text-slate-500 font-bold">=</span>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Raw Logits (1×2)</span>
                <span className="text-emerald-300 font-bold">[{rawOutput.join(', ')}]</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">ReLU Activation max(0, Y):</span>
              <span className="text-emerald-400 font-bold text-sm bg-emerald-500/20 px-3 py-1 rounded border border-emerald-500/40">
                Neuron Output: [{reluOutput.join(', ')}]
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Render App
