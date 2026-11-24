import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Mode = "dir-cosines" | "two-points" | "point-dir" | "angle";
type Vec = [number, number, number];

const MODES: { id: Mode; label: string }[] = [
  { id: "dir-cosines", label: "Direction cosines" },
  { id: "two-points", label: "Two points" },
  { id: "point-dir", label: "Point and direction" },
  { id: "angle", label: "Angle between lines" },
];

function fmt(n: number) {
  const v = Math.abs(n) < 1e-9 ? 0 : n;
  return Number(v.toFixed(2));
}

function cartesian(x0: number, y0: number, z0: number, a: number, b: number, c: number) {
  const piece = (coord: string, origin: number, dr: number) =>
    Math.abs(dr) < 1e-9 ? `${coord} = ${fmt(origin)}` : `(${coord} − ${fmt(origin)})/${fmt(dr)}`;
  return [piece("x", x0, a), piece("y", y0, b), piece("z", z0, c)].join(" = ");
}

export default function Lines3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("dir-cosines");
  const [p, setP] = useState<Vec>([4, 5, 3]);
  const [a, setA] = useState<Vec>([2, 1, 3]);
  const [b, setB] = useState<Vec>([-1, 4, 1]);
  const [dir, setDir] = useState<Vec>([2, -1, 3]);
  const [v1, setV1] = useState<Vec>([2, 1, -2]);
  const [v2, setV2] = useState<Vec>([1, -2, 2]);

  const sceneRef = useRef<{
    group: THREE.Group;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    frame: number;
  } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(12, 10, 15);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(10, 20, 10);
    scene.add(sun);
    scene.add(new THREE.AxesHelper(10));
    const grid = new THREE.GridHelper(20, 20, 0x374151, 0x1f2937);
    grid.position.y = -0.01;
    scene.add(grid);
    const group = new THREE.Group();
    scene.add(group);

    const resize = () => {
      const w = mount.clientWidth || 320;
      const h = mount.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    const live = { frame: 0 };
    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      live.frame = requestAnimationFrame(tick);
    };
    tick();
    sceneRef.current = { group, renderer, camera, controls, frame: live.frame };
    return () => {
      cancelAnimationFrame(live.frame);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const bag = sceneRef.current;
    if (!bag) return;
    const group = bag.group;
    while (group.children.length) group.remove(group.children[0]);

    const color = 0xf59e0b;
    const color2 = 0xd946ef;
    const point = (pos: THREE.Vector3, col: number) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 16),
        new THREE.MeshLambertMaterial({ color: col }),
      );
      mesh.position.copy(pos);
      group.add(mesh);
    };
    const thick = (p1: THREE.Vector3, p2: THREE.Vector3, col: number, radius = 0.06) => {
      const distance = p1.distanceTo(p2);
      if (distance < 1e-4) return;
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, distance, 10),
        new THREE.MeshLambertMaterial({ color: col }),
      );
      mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
      group.add(mesh);
    };
    const arrow = (origin: THREE.Vector3, vec: THREE.Vector3, col: number) => {
      const length = vec.length();
      if (length < 1e-4) return;
      const dirN = vec.clone().normalize();
      const head = 0.65;
      const shaft = Math.max(0.05, length - head);
      thick(origin, origin.clone().addScaledVector(dirN, shaft), col, 0.07);
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, head, 14),
        new THREE.MeshLambertMaterial({ color: col }),
      );
      cone.position.copy(origin.clone().addScaledVector(dirN, shaft + head / 2));
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirN);
      group.add(cone);
    };
    const infinite = (origin: THREE.Vector3, direction: THREE.Vector3, col: number) => {
      if (direction.lengthSq() < 1e-6) return;
      const d = direction.clone().normalize();
      thick(origin.clone().addScaledVector(d, -18), origin.clone().addScaledVector(d, 18), col, 0.045);
    };

    if (mode === "dir-cosines") {
      const vec = new THREE.Vector3(...p);
      point(vec, color);
      arrow(new THREE.Vector3(), vec, color);
    } else if (mode === "two-points") {
      const p1 = new THREE.Vector3(...a);
      const p2 = new THREE.Vector3(...b);
      point(p1, 0x06b6d4);
      point(p2, 0x06b6d4);
      infinite(p1, p2.clone().sub(p1), color);
      thick(p1, p2, 0xffffff, 0.09);
    } else if (mode === "point-dir") {
      const pa = new THREE.Vector3(...a);
      const vd = new THREE.Vector3(...dir);
      point(pa, 0x06b6d4);
      arrow(pa, vd, color2);
      infinite(pa, vd, color);
    } else {
      const d1 = new THREE.Vector3(...v1);
      const d2 = new THREE.Vector3(...v2);
      infinite(new THREE.Vector3(), d1, color);
      infinite(new THREE.Vector3(), d2, color2);
      arrow(new THREE.Vector3(), d1, 0xffffff);
      arrow(new THREE.Vector3(), d2, 0xffffff);
    }
  }, [mode, p, a, b, dir, v1, v2]);

  const r = Math.hypot(...p);
  const cosines = r === 0 ? [0, 0, 0] : p.map((c) => c / r);
  const dAB = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  let cosTheta = 0;
  let angle = 0;
  const n1 = Math.hypot(...v1);
  const n2 = Math.hypot(...v2);
  if (n1 > 0 && n2 > 0) {
    cosTheta = Math.min(1, Math.max(-1, (v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]) / (n1 * n2)));
    angle = (Math.acos(Math.abs(cosTheta)) * 180) / Math.PI;
    cosTheta = Math.abs(cosTheta);
  }

  const fields =
    mode === "dir-cosines"
      ? [{ label: "Point P", value: p, set: setP }]
      : mode === "two-points"
        ? [
            { label: "Point A", value: a, set: setA },
            { label: "Point B", value: b, set: setB },
          ]
        : mode === "point-dir"
          ? [
              { label: "Point A", value: a, set: setA },
              { label: "Direction v", value: dir, set: setDir },
            ]
          : [
              { label: "Direction v₁", value: v1, set: setV1 },
              { label: "Direction v₂", value: v2, set: setV2 },
            ];

  return (
    <div className="flex min-h-[36rem] flex-col bg-slate-950 text-slate-100 lg:flex-row">
      <div className="flex w-full flex-col gap-3 border-b border-slate-700 p-4 lg:w-[380px] lg:border-b-0 lg:border-r">
        <div className="flex flex-wrap gap-2">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold ${mode === item.id ? "border-blue-500 bg-blue-600 text-white" : "border-slate-600 text-slate-300"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {fields.map((field) => (
          <div key={field.label}>
            <div className="mb-1 text-sm text-slate-400">{field.label}</div>
            <div className="grid grid-cols-3 gap-2">
              {field.value.map((coord, i) => (
                <input
                  key={i}
                  type="number"
                  step="0.5"
                  inputMode="decimal"
                  aria-label={`${field.label} ${"xyz"[i]}`}
                  value={coord}
                  onChange={(e) => {
                    const next = [...field.value] as Vec;
                    next[i] = Number(e.target.value);
                    field.set(next);
                  }}
                  className="min-h-11 rounded-lg border border-slate-600 bg-slate-800 px-2 text-base"
                />
              ))}
            </div>
          </div>
        ))}
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm leading-relaxed">
          {mode === "dir-cosines" && (
            <>
              <p>Direction ratios (a, b, c) = ({p.map(fmt).join(", ")})</p>
              <p>r = √(x²+y²+z²) = {r.toFixed(2)}</p>
              <p>l = cos α = x/r = {cosines[0].toFixed(3)}</p>
              <p>m = cos β = y/r = {cosines[1].toFixed(3)}</p>
              <p>n = cos γ = z/r = {cosines[2].toFixed(3)}</p>
              <p>l² + m² + n² = {(cosines[0] ** 2 + cosines[1] ** 2 + cosines[2] ** 2).toFixed(3)}</p>
            </>
          )}
          {mode === "two-points" && (
            <>
              <p>Direction ratios = ({dAB.map(fmt).join(", ")})</p>
              <p className="mt-1 font-mono text-xs">{cartesian(a[0], a[1], a[2], dAB[0], dAB[1], dAB[2])}</p>
            </>
          )}
          {mode === "point-dir" && (
            <>
              <p>r = a + λv</p>
              <p className="mt-1 font-mono text-xs">{cartesian(a[0], a[1], a[2], dir[0], dir[1], dir[2])}</p>
            </>
          )}
          {mode === "angle" && (
            <>
              <p>cos θ = |v₁ · v₂| / (|v₁| |v₂|) = {cosTheta.toFixed(3)}</p>
              <p>The angle between two lines is the acute one: θ ≈ {angle.toFixed(1)}°</p>
            </>
          )}
        </div>
      </div>
      <div ref={mountRef} className="relative order-first min-h-[300px] flex-1 touch-none lg:order-none" />
    </div>
  );
}
