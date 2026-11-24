import React, { useState, useEffect, useRef, useCallback } from 'react';

        // --- Native SVG Icons ---
        const Play = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>);
        const Pause = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="14" y="4" width="4" height="16"></rect><rect x="6" y="4" width="4" height="16"></rect></svg>);
        const RotateCcw = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>);
        const StepForward = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="6" y1="4" x2="6" y2="20"></line><polygon points="10,4 20,12 10,20"></polygon></svg>);
        const Activity = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 1 .48 0l2.35 8.36a2 2 0 0 0 1.93 1.46H22"></path></svg>);
        const Settings2 = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="7" r="3"></circle><circle cx="7" cy="17" r="3"></circle></svg>);
        const AlertTriangle = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
        const CheckCircle2 = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><path d="M9 12l2 2 4-4"></path></svg>);

        // --- Mathematical Functions Dictionary ---
        const FUNCTIONS = {
          convex: {
            id: 'convex',
            name: 'Simple Convex (Parabola)',
            description: 'A simple landscape with one clear Global Minimum. Represents a perfect, predictable problem.',
            formula: 'L(w) = w²',
            derivative: "L'(w) = 2w",
            // f(x) = x^2
            f: (x) => x * x,
            // f'(x) = 2x
            df: (x) => 2 * x,
            domain: [-4, 4],
            range: [-1, 16],
            defaultLr: 0.1,
            defaultStart: -3.5
          },
          nonconvex: {
            id: 'nonconvex',
            name: 'Non-Convex (Complex Landscape)',
            description: 'A realistic ML landscape with a shallow "Local Minimum" trap and a deep "Global Minimum".',
            formula: 'L(w) = w⁴/4 - w³/3 - w² + 2',
            derivative: "L'(w) = w³ - w² - 2w",
            // f(x) = x^4/4 - x^3/3 - x^2 + 2
            f: (x) => 0.25 * Math.pow(x, 4) - Math.pow(x, 3) / 3 - Math.pow(x, 2) + 2,
            // f'(x) = x^3 - x^2 - 2x
            df: (x) => Math.pow(x, 3) - Math.pow(x, 2) - 2 * x,
            domain: [-2.5, 3.5],
            range: [-2, 8],
            defaultLr: 0.05,
            defaultStart: -2.0
          }
        };

        export default function App() {
          const [activeFuncId, setActiveFuncId] = useState('convex');
          const [learningRate, setLearningRate] = useState(FUNCTIONS['convex'].defaultLr);
          const [startPoint, setStartPoint] = useState(FUNCTIONS['convex'].defaultStart);
          
          const [currentX, setCurrentX] = useState(startPoint);
          const [history, setHistory] = useState([]);
          const [isPlaying, setIsPlaying] = useState(false);
          const [iteration, setIteration] = useState(0);
          const [status, setStatus] = useState('Ready'); // Ready, Running, Converged, Diverged
          
          const animationRef = useRef(null);

          const activeFunc = FUNCTIONS[activeFuncId];

          // Reset simulation when function or starting point changes manually
          useEffect(() => {
            resetSimulation();
          }, [activeFuncId, startPoint, learningRate]);

          const resetSimulation = useCallback(() => {
            setIsPlaying(false);
            setCurrentX(startPoint);
            setHistory([{ x: startPoint, y: activeFunc.f(startPoint) }]);
            setIteration(0);
            setStatus('Ready');
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
          }, [activeFunc, startPoint]);

          const handleFuncChange = (id) => {
            setActiveFuncId(id);
            setLearningRate(FUNCTIONS[id].defaultLr);
            setStartPoint(FUNCTIONS[id].defaultStart);
          };

          const stepSimulation = useCallback(() => {
            setCurrentX((prevX) => {
              const gradient = activeFunc.df(prevX);
              const step = learningRate * gradient;
              const nextX = prevX - step;

              // Check for divergence (exploding gradients)
              if (Math.abs(nextX) > 10 || isNaN(nextX)) {
                setIsPlaying(false);
                setStatus('Diverged');
                return prevX; // stay at last valid position
              }

              // Check for convergence (gradient is extremely close to 0)
              if (Math.abs(gradient) < 0.001) {
                setIsPlaying(false);
                setStatus('Converged');
                return nextX;
              }

              setHistory((prev) => [...prev, { x: nextX, y: activeFunc.f(nextX) }]);
              setIteration((prev) => prev + 1);
              return nextX;
            });
          }, [activeFunc, learningRate]);

          // Animation Loop
          useEffect(() => {
            if (isPlaying) {
              let lastTime = 0;
              const animate = (time) => {
                if (time - lastTime > 200) { // Update every 200ms
                  stepSimulation();
                  lastTime = time;
                }
                animationRef.current = requestAnimationFrame(animate);
              };
              animationRef.current = requestAnimationFrame(animate);
            } else if (animationRef.current) {
              cancelAnimationFrame(animationRef.current);
            }
            return () => cancelAnimationFrame(animationRef.current);
          }, [isPlaying, stepSimulation]);


          // --- SVG Graph Plotting Logic ---
          const width = 800;
          const height = 400;
          const padding = 40;

          const mapX = (x) => padding + ((x - activeFunc.domain[0]) / (activeFunc.domain[1] - activeFunc.domain[0])) * (width - 2 * padding);
          const mapY = (y) => height - padding - ((y - activeFunc.range[0]) / (activeFunc.range[1] - activeFunc.range[0])) * (height - 2 * padding);

          // Generate the main function curve
          const generateCurvePath = () => {
            let path = '';
            const steps = 200;
            const dx = (activeFunc.domain[1] - activeFunc.domain[0]) / steps;
            for (let i = 0; i <= steps; i++) {
              const x = activeFunc.domain[0] + i * dx;
              const y = activeFunc.f(x);
              const px = mapX(x);
              const py = mapY(y);
              if (i === 0) path += `M ${px} ${py} `;
              else path += `L ${px} ${py} `;
            }
            return path;
          };

          // Generate the tangent line at the current point
          const generateTangentLine = () => {
            if (status === 'Diverged') return null;
            const gradient = activeFunc.df(currentX);
            const y = activeFunc.f(currentX);
            // Draw tangent extending slightly left and right
            const deltaX = (activeFunc.domain[1] - activeFunc.domain[0]) * 0.1; 
            const x1 = currentX - deltaX;
            const y1 = y - gradient * deltaX;
            const x2 = currentX + deltaX;
            const y2 = y + gradient * deltaX;
            
            return (
              <line 
                x1={mapX(x1)} y1={mapY(y1)} 
                x2={mapX(x2)} y2={mapY(y2)} 
                stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" 
              />
            );
          };

          return (
            <div className="min-h-[36rem] bg-slate-950 text-slate-200 font-sans p-4 lg:p-8">
              <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <header className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                      <Activity className="w-8 h-8 text-blue-500" />
                      Gradient Descent
                    </h1>
                    <p className="text-slate-400 mt-1">Minimizing the Loss Function in Machine Learning</p>
                  </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Controls Panel (Sidebar) */}
                  <div className="lg:col-span-1 space-y-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    
                    {/* Function Selection */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Settings2 className="w-4 h-4" /> Landscape (Loss Function)
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.values(FUNCTIONS).map(func => (
                          <button
                            key={func.id}
                            onClick={() => handleFuncChange(func.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeFuncId === func.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                          >
                            {func.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 italic bg-slate-950 p-3 rounded-lg border border-slate-800">
                        {activeFunc.description}
                      </p>
                    </div>

                    {/* Sliders */}
                    <div className="space-y-6 pt-4 border-t border-slate-800">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium text-slate-300">Start Weight (Initial Guess)</label>
                          <span className="text-xs font-mono text-blue-400">w₀ = {startPoint.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min={activeFunc.domain[0]} max={activeFunc.domain[1]} step="0.1"
                          value={startPoint}
                          onChange={(e) => setStartPoint(parseFloat(e.target.value))}
                          disabled={isPlaying}
                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium text-slate-300">Learning Rate (α / Step Size)</label>
                          <span className="text-xs font-mono text-emerald-400">α = {learningRate.toFixed(3)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.001" max={activeFuncId === 'convex' ? 1.05 : 0.2} step="0.005"
                          value={learningRate}
                          onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => { setIsPlaying(!isPlaying); if(status !== 'Running') setStatus('Running'); }}
                        disabled={status === 'Converged' || status === 'Diverged'}
                        className={`col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${isPlaying ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'}`}
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        {isPlaying ? 'Pause' : 'Start Descent'}
                      </button>
                      
                      <button
                        onClick={resetSimulation}
                        className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                        title="Reset"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => { setIsPlaying(false); stepSimulation(); if(status === 'Ready') setStatus('Running');}}
                        disabled={isPlaying || status === 'Converged' || status === 'Diverged'}
                        className="col-span-3 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50 text-sm font-medium"
                      >
                        <StepForward className="w-4 h-4" /> Step Forward (1 Iteration)
                      </button>
                    </div>
                    
                  </div>

                  {/* Main Visualizer & Math Panel */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Visualizer Canvas */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden relative">
                      
                      {/* Status Overlay */}
                      <div className="absolute top-6 left-6 z-10">
                         {status === 'Converged' && (
                            <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm animate-pulse">
                              <CheckCircle2 className="w-5 h-5" /> Minimum Found!
                            </div>
                         )}
                         {status === 'Diverged' && (
                            <div className="bg-red-950/80 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm animate-pulse">
                              <AlertTriangle className="w-5 h-5" /> Diverged! (Learning Rate Too High)
                            </div>
                         )}
                      </div>

                      {/* Math Canvas */}
                      <div className="w-full aspect-video bg-slate-950 rounded-xl relative">
                        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="absolute inset-0">
                          {/* Grid Lines */}
                          <line x1="0" y1={mapY(0)} x2={width} y2={mapY(0)} stroke="#1e293b" strokeWidth="2" />
                          <line x1={mapX(0)} y1="0" x2={mapX(0)} y2={height} stroke="#1e293b" strokeWidth="2" />
                          
                          {/* The Loss Function Curve */}
                          <path d={generateCurvePath()} fill="none" stroke="#3b82f6" strokeWidth="3" opacity="0.8" />
                          
                          {/* History Trail (Lines) */}
                          {history.map((pt, i) => {
                            if (i === 0) return null;
                            const prev = history[i - 1];
                            return (
                              <line 
                                key={`line-${i}`}
                                x1={mapX(prev.x)} y1={mapY(prev.y)} 
                                x2={mapX(pt.x)} y2={mapY(pt.y)} 
                                stroke="#10b981" strokeWidth="2" opacity="0.6" strokeDasharray="4 4"
                              />
                            );
                          })}

                          {/* History Trail (Dots) */}
                          {history.map((pt, i) => (
                            <circle 
                              key={`dot-${i}`}
                              cx={mapX(pt.x)} cy={mapY(pt.y)} 
                              r={i === history.length - 1 ? 0 : 3} 
                              fill="#10b981" opacity={0.4}
                            />
                          ))}

                          {/* Current Position Tangent Line */}
                          {generateTangentLine()}

                          {/* Current Position Ball */}
                          {status !== 'Diverged' && (
                            <circle 
                              cx={mapX(currentX)} cy={mapY(activeFunc.f(currentX))} 
                              r="8" fill="#ef4444" className="transition-all duration-200"
                            />
                          )}
                        </svg>
                      </div>
                    </div>

                    {/* Live Math Dashboard */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Iteration</p>
                        <p className="text-2xl font-mono text-white">{iteration}</p>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Weight (w)</p>
                        <p className="text-2xl font-mono text-blue-400">{status === 'Diverged' ? 'NaN' : currentX.toFixed(3)}</p>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Loss L(w)</p>
                        <p className="text-2xl font-mono text-amber-400">{status === 'Diverged' ? 'NaN' : activeFunc.f(currentX).toFixed(3)}</p>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Gradient L'(w)</p>
                        <p className="text-2xl font-mono text-emerald-400">{status === 'Diverged' ? 'NaN' : activeFunc.df(currentX).toFixed(3)}</p>
                      </div>
                    </div>

                    {/* Math Explanation Panel */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Under the Hood: The Update Rule</h3>
                      <div className="grid md:grid-cols-2 gap-6 items-center">
                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-center text-lg">
                          <span className="text-blue-400">w_new</span> = <span className="text-blue-400">w_old</span> - <span className="text-emerald-400">α</span> * <span className="text-red-400">L'(w_old)</span>
                        </div>
                        <div className="text-sm text-slate-400 space-y-2">
                          <p>The <span className="text-red-400 font-bold">Red Line</span> represents the gradient (slope) at your current position.</p>
                          <p>If the slope is negative (pointing down-right), the algorithm subtracts a negative number, stepping <span className="text-blue-400 font-bold">Forward</span>.</p>
                          <p>If the slope is positive (pointing up-right), it subtracts a positive number, stepping <span className="text-blue-400 font-bold">Backward</span>.</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          );
        }
