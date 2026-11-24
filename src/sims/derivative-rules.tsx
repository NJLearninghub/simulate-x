import React, { useState, useEffect } from 'react';

        // Problem Bank
        const problems = [
            {
                id: 1,
                rule: 'product',
                title: 'Polynomial & Trig',
                expression: 'x² · sin(x)',
                u: 'x²', v: 'sin(x)',
                du: '2x', dv: 'cos(x)',
                optionsU: ['x²', 'sin(x)', '2x', 'x'],
                optionsV: ['cos(x)', 'sin(x)', 'x²', '-cos(x)'],
                optionsDu: ['2x', 'x', 'x³', 'cos(x)'],
                optionsDv: ['sin(x)', 'cos(x)', '-sin(x)', '1'],
                // Standard formula: u'v + uv'
                correctOrder: ['du', 'v', 'u', 'dv'],
                finalAnswer: '(2x · sin(x)) + (x² · cos(x))'
            },
            {
                id: 2,
                rule: 'division',
                title: 'Exponential & Linear',
                expression: 'eˣ / x',
                u: 'eˣ', v: 'x',
                du: 'eˣ', dv: '1', v2: 'x²',
                optionsU: ['eˣ', 'x', 'x²', '1'],
                optionsV: ['eˣ', 'x', '1', '1/x'],
                optionsDu: ['eˣ', 'xeˣ', '1', 'x'],
                optionsDv: ['x', '0', '1', 'x²'],
                optionsV2: ['2x', 'x²', 'x', 'e²ˣ'],
                // Standard formula: (u'v - uv') / v²
                correctOrder: ['du', 'v', 'u', 'dv', 'v2'],
                finalAnswer: '(eˣ · x - eˣ · 1) / x²'
            },
            {
                id: 3,
                rule: 'product',
                title: 'Exponential & Wave',
                expression: 'eˣ · cos(x)',
                u: 'eˣ', v: 'cos(x)',
                du: 'eˣ', dv: '-sin(x)',
                optionsU: ['cos(x)', 'eˣ', 'x', '-sin(x)'],
                optionsV: ['sin(x)', 'eˣ', 'cos(x)', '-cos(x)'],
                optionsDu: ['eˣ', 'xeˣ', 'cos(x)', '1'],
                optionsDv: ['sin(x)', '-sin(x)', 'cos(x)', '1'],
                correctOrder: ['du', 'v', 'u', 'dv'],
                finalAnswer: '(eˣ · cos(x)) + (eˣ · (-sin(x)))'
            },
            {
                id: 4,
                rule: 'division',
                title: 'Logarithm & Linear',
                expression: 'ln(x) / x',
                u: 'ln(x)', v: 'x',
                du: '1/x', dv: '1', v2: 'x²',
                optionsU: ['x', 'ln(x)', '1/x', '1'],
                optionsV: ['ln(x)', 'x', 'x²', '1/x'],
                optionsDu: ['1/x', 'ln(x)', '1', 'x'],
                optionsDv: ['x', '0', '1', 'x²'],
                optionsV2: ['x²', '2x', '1/x²', 'ln²(x)'],
                correctOrder: ['du', 'v', 'u', 'dv', 'v2'],
                finalAnswer: '((1/x) · x - ln(x) · 1) / x²'
            }
        ];

        // Color mapping for components
        const colors = {
            u: 'text-blue-400 bg-blue-900/30 border-blue-500',
            v: 'text-orange-400 bg-orange-900/30 border-orange-500',
            du: 'text-cyan-400 bg-cyan-900/30 border-cyan-500',
            dv: 'text-yellow-400 bg-yellow-900/30 border-yellow-500',
            v2: 'text-red-400 bg-red-900/30 border-red-500'
        };

        export default function App() {
            const [probIdx, setProbIdx] = useState(0);
            const [step, setStep] = useState(1);
            const [errorMsg, setErrorMsg] = useState("");
            
            // State for answers
            const [ansU, setAnsU] = useState(null);
            const [ansV, setAnsV] = useState(null);
            const [ansDu, setAnsDu] = useState(null);
            const [ansDv, setAnsDv] = useState(null);
            const [ansV2, setAnsV2] = useState(null); // for division

            // State for Step 3 Assembly
            const [slots, setSlots] = useState([]);
            const [availablePieces, setAvailablePieces] = useState([]);

            const p = problems[probIdx];

            // Initialize Assembly pieces when reaching step 3
            useEffect(() => {
                if (step === 3) {
                    const pieces = [
                        { id: 'u', val: p.u, color: colors.u, label: 'u' },
                        { id: 'v', val: p.v, color: colors.v, label: 'v' },
                        { id: 'du', val: p.du, color: colors.du, label: "u'" },
                        { id: 'dv', val: p.dv, color: colors.dv, label: "v'" }
                    ];
                    if (p.rule === 'division') {
                        pieces.push({ id: 'v2', val: p.v2, color: colors.v2, label: 'v²' });
                        setSlots([null, null, null, null, null]);
                    } else {
                        setSlots([null, null, null, null]);
                    }
                    // Shuffle available pieces
                    setAvailablePieces(pieces.sort(() => Math.random() - 0.5));
                }
            }, [step, p]);

            const triggerError = (msg) => {
                setErrorMsg(msg);
                setTimeout(() => setErrorMsg(""), 2500);
            };

            const checkStep1 = () => {
                if (!ansU || !ansV) return triggerError("Please select both u(x) and v(x)!");
                if (ansU !== p.u) return triggerError("Incorrect u(x). Look at the numerator or first term.");
                if (ansV !== p.v) return triggerError("Incorrect v(x). Look at the denominator or second term.");
                setStep(2);
            };

            const checkStep2 = () => {
                if (!ansDu || !ansDv || (p.rule === 'division' && !ansV2)) return triggerError("Please fill all derivatives!");
                if (ansDu !== p.du) return triggerError("Incorrect derivative for u(x).");
                if (ansDv !== p.dv) return triggerError("Incorrect derivative for v(x).");
                if (p.rule === 'division' && ansV2 !== p.v2) return triggerError("Incorrect v² calculation.");
                setStep(3);
            };

            const checkStep3 = () => {
                if (slots.includes(null)) return triggerError("Please fill all the formula slots!");
                
                const currentOrder = slots.map(s => s.id);
                const isCorrect = currentOrder.every((val, index) => val === p.correctOrder[index]);
                
                if (isCorrect) {
                    setStep(4);
                } else {
                    triggerError("Incorrect formula assembly! Check the standard rule layout.");
                }
            };

            const handleSlotClick = (index) => {
                if (!slots[index]) return;
                const piece = slots[index];
                const newSlots = [...slots];
                newSlots[index] = null;
                setSlots(newSlots);
                setAvailablePieces([...availablePieces, piece]);
            };

            const handlePieceClick = (piece) => {
                const firstEmptySlot = slots.indexOf(null);
                if (firstEmptySlot === -1) return; // Full
                
                const newSlots = [...slots];
                newSlots[firstEmptySlot] = piece;
                setSlots(newSlots);
                
                setAvailablePieces(availablePieces.filter(p => p.id !== piece.id));
            };

            const resetProblem = (nextIdx) => {
                setProbIdx(nextIdx);
                setStep(1);
                setAnsU(null); setAnsV(null);
                setAnsDu(null); setAnsDv(null); setAnsV2(null);
                setErrorMsg("");
            };

            const OptionButton = ({ value, selected, onClick, colorClass }) => (
                <button 
                    onClick={onClick}
                    className={`px-6 py-3 rounded-xl border-2 font-mono text-lg transition-all ${selected ? colorClass + ' scale-105 shadow-lg' : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'}`}
                >
                    {value}
                </button>
            );

            return (
                <div className="min-h-[36rem] p-4 md:p-8 flex flex-col items-center">
                    {/* Header */}
                    <div className="w-full max-w-4xl text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Calculus: Step-by-Step Problem Solver</h1>
                        <p className="text-slate-400">Master the logic of the Product and Division rules by assembling the solution piece by piece.</p>
                    </div>

                    {/* Progress Tracker */}
                    <div className="w-full max-w-4xl flex justify-between items-center mb-8 px-4">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className="flex flex-col items-center relative z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-colors duration-500 ${step >= s ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                    {s}
                                </div>
                                <span className={`text-xs uppercase tracking-wider ${step >= s ? 'text-indigo-300' : 'text-slate-600'}`}>
                                    {s === 1 ? 'Identify' : s === 2 ? 'Derive' : s === 3 ? 'Assemble' : 'Solve'}
                                </span>
                            </div>
                        ))}
                        {/* Connecting Line */}
                        <div className="absolute top-[68px] md:top-[88px] left-1/2 -translate-x-1/2 w-[80%] max-w-3xl h-1 bg-slate-800 -z-10 rounded">
                            <div className="h-full bg-indigo-500 transition-all duration-500 rounded" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
                        </div>
                    </div>

                    {/* Main Workspace */}
                    <div className="w-full max-w-4xl bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
                        
                        {/* Error Toast */}
                        {errorMsg && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-2 rounded-full font-semibold shadow-lg z-50 animate-bounce">
                                {errorMsg}
                            </div>
                        )}

                        {/* Current Problem Display */}
                        <div className="bg-slate-900 border border-slate-600 rounded-2xl p-6 text-center mb-8 shadow-inner">
                            <div className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-2">Target Function ({p.rule} rule)</div>
                            <div className="text-3xl md:text-5xl font-bold text-white math-font tracking-wider">
                                f(x) = {p.expression}
                            </div>
                        </div>

                        {/* --- STEP 1: IDENTIFY COMPONENTS --- */}
                        {step === 1 && (
                            <div className="fade-in space-y-8">
                                <h2 className="text-2xl font-semibold text-slate-200 text-center">Step 1: Identify your Base Components</h2>
                                
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 text-center">
                                        <h3 className="text-lg text-blue-300 mb-4 font-bold math-font">What is u(x)?</h3>
                                        <div className="flex flex-wrap justify-center gap-3">
                                            {p.optionsU.map(opt => (
                                                <OptionButton key={opt} value={opt} selected={ansU === opt} onClick={() => setAnsU(opt)} colorClass={colors.u} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 text-center">
                                        <h3 className="text-lg text-orange-300 mb-4 font-bold math-font">What is v(x)?</h3>
                                        <div className="flex flex-wrap justify-center gap-3">
                                            {p.optionsV.map(opt => (
                                                <OptionButton key={opt} value={opt} selected={ansV === opt} onClick={() => setAnsV(opt)} colorClass={colors.v} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <button onClick={checkStep1} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]">
                                    Verify & Continue
                                </button>
                            </div>
                        )}

                        {/* --- STEP 2: FIND DERIVATIVES --- */}
                        {step === 2 && (
                            <div className="fade-in space-y-8">
                                <h2 className="text-2xl font-semibold text-slate-200 text-center">Step 2: Differentiate the Components</h2>
                                
                                <div className="flex justify-center gap-6 mb-4">
                                    <div className={`px-4 py-2 rounded-lg border ${colors.u} font-mono text-lg`}>u = {ansU}</div>
                                    <div className={`px-4 py-2 rounded-lg border ${colors.v} font-mono text-lg`}>v = {ansV}</div>
                                </div>

                                <div className={`grid gap-6 ${p.rule === 'division' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700 text-center">
                                        <h3 className="text-lg text-cyan-300 mb-4 font-bold math-font">Derivative u'(x)</h3>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {p.optionsDu.map(opt => (
                                                <OptionButton key={opt} value={opt} selected={ansDu === opt} onClick={() => setAnsDu(opt)} colorClass={colors.du} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700 text-center">
                                        <h3 className="text-lg text-yellow-300 mb-4 font-bold math-font">Derivative v'(x)</h3>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {p.optionsDv.map(opt => (
                                                <OptionButton key={opt} value={opt} selected={ansDv === opt} onClick={() => setAnsDv(opt)} colorClass={colors.dv} />
                                            ))}
                                        </div>
                                    </div>
                                    {p.rule === 'division' && (
                                        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700 text-center">
                                            <h3 className="text-lg text-red-300 mb-4 font-bold math-font">Square v(x)²</h3>
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {p.optionsV2.map(opt => (
                                                    <OptionButton key={opt} value={opt} selected={ansV2 === opt} onClick={() => setAnsV2(opt)} colorClass={colors.v2} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <button onClick={checkStep2} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold rounded-xl transition-all shadow-lg">
                                    Verify Mini-Derivatives
                                </button>
                            </div>
                        )}

                        {/* --- STEP 3: ASSEMBLE FORMULA --- */}
                        {step === 3 && (
                            <div className="fade-in space-y-8">
                                <h2 className="text-2xl font-semibold text-slate-200 text-center">Step 3: Construct the Final Formula</h2>
                                <p className="text-center text-slate-400">Click a piece from the toolkit below to drop it into the formula slots in the correct standard order.</p>

                                {/* Formula Skeleton */}
                                <div className="bg-slate-900 border border-slate-600 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                                    <div className="text-emerald-400 font-bold text-2xl mb-4 math-font">f'(x) =</div>
                                    
                                    {p.rule === 'product' ? (
                                        <div className="flex items-center gap-2 md:gap-4 text-3xl font-light text-slate-500">
                                            <span>(</span>
                                            <div onClick={() => handleSlotClick(0)} className={`w-20 md:w-28 h-14 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${slots[0] ? slots[0].color + ' border-solid shadow-inner' : 'border-slate-600 hover:border-slate-400'}`}>
                                                {slots[0] ? <span className="font-mono text-xl">{slots[0].val}</span> : '?'}
                                            </div>
                                            <span>·</span>
                                            <div onClick={() => handleSlotClick(1)} className={`w-20 md:w-28 h-14 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${slots[1] ? slots[1].color + ' border-solid shadow-inner' : 'border-slate-600 hover:border-slate-400'}`}>
                                                {slots[1] ? <span className="font-mono text-xl">{slots[1].val}</span> : '?'}
                                            </div>
                                            <span>) + (</span>
                                            <div onClick={() => handleSlotClick(2)} className={`w-20 md:w-28 h-14 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${slots[2] ? slots[2].color + ' border-solid shadow-inner' : 'border-slate-600 hover:border-slate-400'}`}>
                                                {slots[2] ? <span className="font-mono text-xl">{slots[2].val}</span> : '?'}
                                            </div>
                                            <span>·</span>
                                            <div onClick={() => handleSlotClick(3)} className={`w-20 md:w-28 h-14 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${slots[3] ? slots[3].color + ' border-solid shadow-inner' : 'border-slate-600 hover:border-slate-400'}`}>
                                                {slots[3] ? <span className="font-mono text-xl">{slots[3].val}</span> : '?'}
                                            </div>
                                            <span>)</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            {/* Numerator */}
                                            <div className="flex items-center gap-2 md:gap-4 text-2xl md:text-3xl font-light text-slate-500 border-b-2 border-slate-500 pb-4 px-4">
                                                <span>(</span>
                                                <div onClick={() => handleSlotClick(0)} className={`w-16 md:w-24 h-12 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer ${slots[0] ? slots[0].color + ' border-solid' : 'border-slate-600'}`}>
                                                    {slots[0] ? <span className="font-mono text-lg">{slots[0].val}</span> : '?'}
                                                </div>
                                                <span>·</span>
                                                <div onClick={() => handleSlotClick(1)} className={`w-16 md:w-24 h-12 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer ${slots[1] ? slots[1].color + ' border-solid' : 'border-slate-600'}`}>
                                                    {slots[1] ? <span className="font-mono text-lg">{slots[1].val}</span> : '?'}
                                                </div>
                                                <span>) - (</span>
                                                <div onClick={() => handleSlotClick(2)} className={`w-16 md:w-24 h-12 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer ${slots[2] ? slots[2].color + ' border-solid' : 'border-slate-600'}`}>
                                                    {slots[2] ? <span className="font-mono text-lg">{slots[2].val}</span> : '?'}
                                                </div>
                                                <span>·</span>
                                                <div onClick={() => handleSlotClick(3)} className={`w-16 md:w-24 h-12 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer ${slots[3] ? slots[3].color + ' border-solid' : 'border-slate-600'}`}>
                                                    {slots[3] ? <span className="font-mono text-lg">{slots[3].val}</span> : '?'}
                                                </div>
                                                <span>)</span>
                                            </div>
                                            {/* Denominator */}
                                            <div className="pt-4">
                                                <div onClick={() => handleSlotClick(4)} className={`w-24 md:w-32 h-14 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer ${slots[4] ? slots[4].color + ' border-solid' : 'border-slate-600'}`}>
                                                    {slots[4] ? <span className="font-mono text-xl">{slots[4].val}</span> : '?'}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Toolkit */}
                                <div className="bg-slate-900/30 border border-slate-700 rounded-xl p-4">
                                    <div className="text-sm text-slate-400 mb-3 uppercase tracking-wider text-center">Your Toolkit</div>
                                    <div className="flex flex-wrap justify-center gap-4 min-h-[60px]">
                                        {availablePieces.map(piece => (
                                            <button
                                                key={piece.id}
                                                onClick={() => handlePieceClick(piece)}
                                                className={`px-6 py-2 rounded-lg border-2 font-mono text-lg flex items-center gap-2 hover:scale-105 transition-transform ${piece.color}`}
                                            >
                                                <span className="text-sm opacity-70 uppercase tracking-widest mr-1">{piece.label}:</span>
                                                {piece.val}
                                            </button>
                                        ))}
                                        {availablePieces.length === 0 && <span className="text-slate-500 italic mt-2">All pieces placed!</span>}
                                    </div>
                                </div>
                                
                                <button onClick={checkStep3} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold rounded-xl transition-all shadow-lg">
                                    Check Final Assembly
                                </button>
                            </div>
                        )}

                        {/* --- STEP 4: SUCCESS --- */}
                        {step === 4 && (
                            <div className="fade-in space-y-8 text-center py-6">
                                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-500">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                
                                <h2 className="text-3xl font-bold text-emerald-400">Perfect Assembly!</h2>
                                <p className="text-slate-300 text-lg">You correctly deconstructed and solved the {p.rule} rule derivative.</p>
                                
                                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 my-8 shadow-xl">
                                    <div className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-4">Final Derivative Algebraic Expression</div>
                                    <div className="text-2xl md:text-4xl font-bold text-white math-font break-words">
                                        f'(x) = {p.finalAnswer}
                                    </div>
                                </div>

                                <div className="flex justify-center gap-4">
                                    <button 
                                        onClick={() => resetProblem(probIdx === problems.length - 1 ? 0 : probIdx + 1)} 
                                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold rounded-xl transition-all shadow-lg"
                                    >
                                        Try Next Challenge
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            );
        };
