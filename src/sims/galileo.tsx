import React, { useState, useEffect } from 'react';

        // --- Inline SVG Icons (Replacing lucide-react) ---
        const Trophy = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>);
        const Star = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
        const ArrowDown = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>);
        const Info = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>);
        const RotateCcw = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>);
        const Play = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="6 3 20 12 6 21 6 3"/></svg>);

        // --- Core Application ---
        const BASE_D = 24; // 1 unit of distance (d) in pixels
        const MAX_INTERVALS = 4;
        const ODD_NUMBERS = [1, 3, 5, 7, 9];

        export default function App() {
            const [currentInterval, setCurrentInterval] = useState(0); // 0 means haven't started
            const [xp, setXp] = useState(0);
            const [attempts, setAttempts] = useState(0);
            const [gameState, setGameState] = useState('intro'); // intro, predicting, animating, completed
            const [prediction, setPrediction] = useState('');
            const [feedback, setFeedback] = useState('');
            
            // Calculate total distance (in 'd' units) the ball has fallen so far
            const getTotalD = (interval) => {
                let sum = 0;
                for (let i = 0; i < interval; i++) sum += ODD_NUMBERS[i];
                return sum;
            };

            const totalD = getTotalD(currentInterval);
            const ballY = 30 + totalD * BASE_D; // Start at y=30

            // Handle the initial drop (Interval 1)
            const handleInitialDrop = () => {
                setGameState('animating');
                setCurrentInterval(1);
                setFeedback('The ball fell 1d in the first second.');
                
                setTimeout(() => {
                setGameState('predicting');
                setPrediction('');
                setAttempts(0);
                setFeedback('');
                }, 1200);
            };

            // Handle predictions for intervals 2, 3, and 4
            const handleGuess = (e) => {
                e.preventDefault();
                if (gameState !== 'predicting') return;

                const guess = parseInt(prediction);
                if (isNaN(guess)) {
                setFeedback('Please enter a valid number.');
                return;
                }

                const expectedAnswer = ODD_NUMBERS[currentInterval];

                if (guess === expectedAnswer) {
                // Correct!
                const earnedXp = attempts === 0 ? 100 : 50;
                setXp(x => x + earnedXp);
                setGameState('animating');
                setCurrentInterval(prev => prev + 1);
                
                if (attempts === 0) {
                    setFeedback(`Perfect! +${earnedXp} XP. You saw the pattern!`);
                } else {
                    setFeedback(`Correct! +${earnedXp} XP.`);
                }

                setTimeout(() => {
                    if (currentInterval + 1 === MAX_INTERVALS) {
                    setGameState('completed');
                    } else {
                    setGameState('predicting');
                    setAttempts(0);
                    setPrediction('');
                    }
                }, 1200);

                } else {
                // Incorrect
                setAttempts(a => a + 1);
                if (attempts === 0) {
                    setFeedback('Incorrect. Hint: Look at the pattern of odd numbers. 50 XP remaining for this level.');
                } else {
                    setFeedback('Incorrect. What is the NEXT odd number after the last one?');
                }
                }
            };

            const restartGame = () => {
                setCurrentInterval(0);
                setXp(0);
                setAttempts(0);
                setGameState('intro');
                setPrediction('');
                setFeedback('');
            };

            // Generate background grid lines
            const gridLines = [];
            for (let i = 0; i <= 16; i++) {
                gridLines.push(
                <line 
                    key={i} 
                    x1="40" y1={30 + i * BASE_D} 
                    x2="280" y2={30 + i * BASE_D} 
                    stroke="rgba(255,255,255,0.05)" 
                    strokeWidth="1" 
                />
                );
            }

            // Generate Neon Green Ratio Trackers (Brackets) for completed intervals
            const ratioTrackers = [];
            for (let i = 0; i < currentInterval; i++) {
                const startY = 30 + getTotalD(i) * BASE_D;
                const dropHeight = ODD_NUMBERS[i] * BASE_D;
                const labelY = startY + dropHeight / 2;
                
                ratioTrackers.push(
                <g key={i} className="animate-fade-in text-green-400">
                    {/* Bracket line */}
                    <path 
                    d={`M 140 ${startY} h 15 m 0 0 v ${dropHeight} m 0 0 h -15`}
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="2"
                    />
                    {/* Label */}
                    <text x="165" y={labelY} fill="#4ade80" fontSize="16" fontWeight="bold" alignmentBaseline="middle">
                    {ODD_NUMBERS[i]}d
                    </text>
                    {/* Interval Time Label on the left */}
                    <text x="35" y={startY + dropHeight} fill="#9ca3af" fontSize="12" textAnchor="end" alignmentBaseline="middle">
                    t={i+1}s
                    </text>
                </g>
                );
            }

            return (
                <div className="min-h-[36rem] p-4 md:p-8 flex flex-col items-center">
                {/* Header */}
                <div className="w-full max-w-4xl flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                    <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Galileo's Odd Numbers Quest
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Master kinematics through pattern recognition.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <span className="text-xl font-mono font-bold text-yellow-400">{xp} XP</span>
                    </div>
                </div>

                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Left Panel: Drop Tower Canvas */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-center items-center relative overflow-hidden shadow-2xl">
                    <svg viewBox="0 0 300 480" className="w-full max-w-[320px] h-auto bg-slate-950 rounded-xl border border-slate-800">
                        {/* Grid */}
                        {gridLines}
                        
                        {/* Tower Structure */}
                        <rect x="90" y="20" width="20" height="420" fill="#1e293b" rx="4" />
                        <rect x="98" y="20" width="4" height="420" fill="#0f172a" />
                        
                        {/* Trackers */}
                        {ratioTrackers}
                        
                        {/* The Ball */}
                        <circle 
                        cx="100" 
                        cy={ballY} 
                        r="12" 
                        fill="#3b82f6" 
                        className="shadow-lg transition-all duration-1000 ease-in"
                        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 1, 1)' }} // Accelerating easing (gravity)
                        />

                        {/* Base Unit 'd' Legend */}
                        <g className="opacity-50">
                        <path d="M 240 30 h 10 v 24 h -10" fill="none" stroke="#9ca3af" strokeWidth="1" />
                        <text x="255" y="46" fill="#9ca3af" fontSize="12" fontStyle="italic">1d</text>
                        </g>
                    </svg>
                    </div>

                    {/* Right Panel: Control Dashboard */}
                    <div className="flex flex-col gap-6">
                    
                    {/* Information Panel */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-blue-400 mb-4">
                        <Info className="w-5 h-5" /> Mission Briefing
                        </h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                        Galileo discovered that an object falling from rest doesn't just fall randomly. The distance it covers in <span className="text-emerald-400 font-semibold">equal, consecutive time intervals</span> follows a precise mathematical ratio.
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-800 rounded-full h-2.5 mb-2">
                        <div 
                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${(currentInterval / MAX_INTERVALS) * 100}%` }}
                        ></div>
                        </div>
                        <p className="text-xs text-slate-500 text-right">Time Interval: {currentInterval} / {MAX_INTERVALS}s</p>
                    </div>

                    {/* Action Panel */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex-grow flex flex-col justify-center">
                        
                        {gameState === 'intro' && (
                        <div className="text-center">
                            <p className="text-slate-300 mb-6">Let's drop the ball for the first 1 second to establish our base distance unit, <span className="text-blue-400 font-mono font-bold">d</span>.</p>
                            <button 
                            onClick={handleInitialDrop}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                            >
                            <Play className="w-5 h-5 fill-current" /> Initialize Drop (t=1s)
                            </button>
                        </div>
                        )}

                        {gameState === 'predicting' && (
                        <div className="animate-fade-in">
                            <div className="bg-slate-800 p-4 rounded-xl mb-6 border border-slate-700">
                            <p className="text-slate-200">
                                The ball just fell <span className="text-green-400 font-bold">{ODD_NUMBERS[currentInterval-1]}d</span> during second {currentInterval}.
                            </p>
                            <p className="text-emerald-300 font-semibold mt-2 text-lg">
                                How far will it fall in ONLY the {currentInterval + 1}{currentInterval+1 === 2 ? 'nd' : currentInterval+1 === 3 ? 'rd' : 'th'} second?
                            </p>
                            </div>

                            <form onSubmit={handleGuess} className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <input 
                                type="number" 
                                value={prediction}
                                onChange={(e) => setPrediction(e.target.value)}
                                placeholder="?"
                                className="w-24 bg-slate-950 border-2 border-blue-500 rounded-xl px-4 py-3 text-2xl font-mono text-center text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                autoFocus
                                />
                                <span className="text-2xl font-mono text-slate-400">× d</span>
                            </div>
                            
                            <button 
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                            >
                                Predict & Drop
                            </button>
                            </form>

                            {/* Score Potential Indicator */}
                            <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>Potential XP: <strong className={attempts === 0 ? "text-yellow-400" : "text-orange-400"}>{attempts === 0 ? "100" : "50"}</strong></span>
                            </div>
                        </div>
                        )}

                        {gameState === 'animating' && (
                        <div className="text-center py-8">
                            <div className="animate-bounce">
                            <ArrowDown className="w-12 h-12 text-blue-500 mx-auto" />
                            </div>
                            <p className="text-xl text-blue-400 mt-4 font-bold animate-pulse">Physics Engine Running...</p>
                        </div>
                        )}

                        {gameState === 'completed' && (
                        <div className="text-center animate-fade-in">
                            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">Quest Complete!</h3>
                            <p className="text-slate-300 mb-6">
                            You successfully proved Galileo's Law! The distances fallen in equal time intervals are precisely in the ratio of <span className="text-green-400 font-bold">1 : 3 : 5 : 7</span>.
                            </p>
                            <button 
                            onClick={restartGame}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl flex justify-center items-center gap-2 transition-all"
                            >
                            <RotateCcw className="w-5 h-5" /> Run Simulation Again
                            </button>
                        </div>
                        )}

                        {/* Live Feedback Toast */}
                        {feedback && (
                        <div className={`mt-6 p-4 rounded-xl border ${feedback.includes('Correct') ? 'bg-emerald-900/30 border-emerald-800 text-emerald-300' : feedback.includes('Incorrect') ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-blue-900/30 border-blue-800 text-blue-300'}`}>
                            {feedback}
                        </div>
                        )}

                    </div>
                    </div>
                </div>
                </div>
            );
        }

        // Render the application
