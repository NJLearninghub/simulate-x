import { useState } from "react";
import { imageNature, locateImage, type Optic } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

type Kind = "concave-mirror" | "convex-mirror" | "convex-lens" | "concave-lens";

const KINDS: Record<Kind, { optic: Optic; sign: number; label: string; f: number; u: number }> = {
  "concave-mirror": { optic: "mirror", sign: -1, label: "Concave mirror", f: 20, u: 45 },
  "convex-mirror": { optic: "mirror", sign: 1, label: "Convex mirror", f: 15, u: 25 },
  "convex-lens": { optic: "lens", sign: 1, label: "Convex lens", f: 15, u: 40 },
  "concave-lens": { optic: "lens", sign: -1, label: "Concave lens", f: 15, u: 30 },
};

export default function RayOpticsSim() {
  const [kind, setKind] = useState<Kind>("concave-mirror");
  const [focal, setFocal] = useState(20);
  const [objectDistance, setObjectDistance] = useState(45);
  const spec = KINDS[kind];
  const f = spec.sign * focal;
  const u = -objectDistance;
  const image = locateImage(spec.optic, u, f);
  const nature = imageNature(spec.optic, image.v, image.m);
  const reach = Math.max(28, objectDistance, Number.isFinite(image.v) ? Math.abs(image.v) : focal * 3, focal) * 1.25;
  const scale = 150 / reach;
  const origin = 180;
  const axis = 132;
  const X = (cm: number) => origin + cm * scale;
  const height = Math.min(26, 78 / Math.max(1, Math.abs(image.m) || 1));
  const objectTip: [number, number] = [X(u), axis - height];
  const imageTip: [number, number] | null = Number.isFinite(image.v) ? [X(image.v), axis - height * image.m] : null;
  const hit: [number, number] = [origin, objectTip[1]];

  function forward(from: [number, number], toward: [number, number], toTheRight: boolean) {
    const dx = toward[0] - from[0];
    const dy = toward[1] - from[1];
    const steps = 220 / Math.max(8, Math.abs(dx));
    const end: [number, number] = [from[0] + dx * steps, from[1] + dy * steps];
    const goingRight = end[0] > from[0];
    return goingRight === toTheRight ? end : ([from[0] - dx * steps, from[1] - dy * steps] as [number, number]);
  }

  const rays: { d: string; dashed?: boolean }[] = [];
  if (imageTip && Number.isFinite(image.v)) {
    const virtual = spec.optic === "mirror" ? image.v > 0 : image.v < 0;
    rays.push({ d: `M ${objectTip[0]} ${objectTip[1]} L ${hit[0]} ${hit[1]}` });
    if (!virtual) rays.push({ d: `M ${hit[0]} ${hit[1]} L ${imageTip[0]} ${imageTip[1]}` });
    else {
      rays.push({ d: `M ${hit[0]} ${hit[1]} L ${forward(hit, imageTip, spec.optic === "lens")[0]} ${forward(hit, imageTip, spec.optic === "lens")[1]}` });
      rays.push({ d: `M ${hit[0]} ${hit[1]} L ${imageTip[0]} ${imageTip[1]}`, dashed: true });
    }
    const centreEnd = forward([origin, axis], imageTip, spec.optic === "lens" ? !virtual : false);
    rays.push({ d: `M ${objectTip[0]} ${objectTip[1]} L ${origin} ${axis} L ${centreEnd[0]} ${centreEnd[1]}` });
    if (virtual) rays.push({ d: `M ${origin} ${axis} L ${imageTip[0]} ${imageTip[1]}`, dashed: true });
  } else {
    rays.push({ d: `M ${objectTip[0]} ${objectTip[1]} L ${hit[0]} ${hit[1]} L ${spec.optic === "lens" ? 350 : 20} ${hit[1]}` });
    rays.push({ d: `M ${objectTip[0]} ${objectTip[1]} L ${origin} ${axis} L ${spec.optic === "lens" ? 350 : 20} ${axis + (axis - objectTip[1])}` });
  }

  return (
    <Lesson
      idea="Rays from one point on the object meet again at one point on the image. Move the object past the focus and that meeting place jumps from a real image to a virtual one."
      graph={
        <PlotFrame label="Ray diagram">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <line x1={16} y1={axis} x2={344} y2={axis} stroke="var(--text-muted)" />
          {spec.optic === "mirror" ? (
            <path d={spec.sign < 0 ? `M ${origin} 58 Q ${origin + 18} ${axis} ${origin} 206` : `M ${origin} 58 Q ${origin - 18} ${axis} ${origin} 206`} fill="none" stroke="var(--text)" strokeWidth={3} />
          ) : (
            <path d={spec.sign > 0 ? `M ${origin - 8} 70 Q ${origin + 16} ${axis} ${origin - 8} 194 M ${origin + 8} 70 Q ${origin - 16} ${axis} ${origin + 8} 194` : `M ${origin - 10} 78 Q ${origin - 2} ${axis} ${origin - 10} 186 M ${origin + 10} 78 Q ${origin + 2} ${axis} ${origin + 10} 186`} fill="none" stroke="var(--text)" strokeWidth={3} />
          )}
          {rays.map((ray, index) => (
            <path key={index} d={ray.d} fill="none" stroke="var(--primary)" strokeWidth={1.5} strokeDasharray={ray.dashed ? "5 4" : undefined} />
          ))}
          <line x1={objectTip[0]} y1={axis} x2={objectTip[0]} y2={objectTip[1]} stroke="var(--text)" strokeWidth={3} />
          {imageTip && <line x1={imageTip[0]} y1={axis} x2={imageTip[0]} y2={imageTip[1]} stroke="#d97706" strokeWidth={3} strokeDasharray={nature.real ? undefined : "4 3"} />}
          <Handle x={X(u)} y={axis + 24} label="object" onDrag={(point) => setObjectDistance(Math.min(70, Math.max(6, (origin - point.x) / scale)))} />
          <Handle x={X(f)} y={axis} label="F" onDrag={(point) => setFocal(Math.min(40, Math.max(8, Math.abs(point.x - origin) / scale)))} />
          <text x={16} y={22} fill="var(--text-muted)" fontSize={13}>{nature.atInfinity ? "Rays leave parallel. The image is at infinity." : nature.real ? "Solid arrow: real image, rays actually meet." : "Dashed arrow: virtual image, rays only appear to meet."}</text>
        </PlotFrame>
      }
      presets={
        <Presets
          items={(Object.keys(KINDS) as Kind[]).map((id) => ({
            id,
            label: KINDS[id].label,
            active: kind === id,
            onClick: () => {
              setKind(id);
              setFocal(KINDS[id].f);
              setObjectDistance(KINDS[id].u);
            },
          }))}
        />
      }
      tries={
        <>
          <Predict
            prompt="A concave mirror, with the object between the pole and the focus. The image is…"
            options={[{ id: "real", label: "Real and inverted" }, { id: "virtual", label: "Virtual and erect" }, { id: "infinity", label: "At infinity" }]}
            answer="virtual"
            because="Inside the focus the reflected rays diverge. They only appear to meet behind the mirror, so the image is virtual and erect."
          />
          <Goal
            ok={kind === "concave-mirror" && objectDistance < focal}
            pending="Drag the object inside the focus of the concave mirror."
            done="The image is virtual and erect, behind the mirror. Move it outside F and it becomes real and inverted."
          />
          <Goal
            ok={kind === "concave-mirror" && Math.abs(objectDistance - 2 * focal) < 2}
            pending="Place the object at the centre of curvature, about twice the focal length."
            done="At C the image is real, inverted and the same size. Magnification is −1."
          />
          <Goal
            ok={kind === "convex-mirror"}
            pending="Switch to the convex mirror and drag the object. The image stays virtual, erect and smaller."
            done={`Magnification is ${num(image.m, 2)}. A convex mirror never brings the rays to a real meeting point.`}
          />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Object distance u", value: `${num(u, 1)} cm` },
            { label: "Focal length f", value: `${num(f, 1)} cm` },
            { label: "Image distance v", value: Number.isFinite(image.v) ? `${num(image.v, 1)} cm` : "infinity" },
            { label: "Magnification m", value: Number.isFinite(image.m) ? num(image.m, 2) : "—" },
            { label: "Where it is", value: nature.atInfinity ? "At infinity" : nature.real ? "Real" : "Virtual" },
            { label: "Orientation", value: nature.atInfinity ? "—" : nature.inverted ? "Inverted" : "Erect" },
          ]}
        />
      }
      explain={
        <>
          <p>Light travels from left to right. Distances against that direction are negative, so the object distance u is negative. A concave mirror and a concave lens have negative f. A convex lens and a convex mirror have positive f.</p>
          <p>Mirror: 1/v + 1/u = 1/f and m = −v/u. Lens: 1/v − 1/u = 1/f and m = v/u. A negative magnification means the image is upside down.</p>
        </>
      }
    />
  );
}
