export type SubjectId = "physics" | "chemistry" | "maths" | "biology";
export type ClassId = 9 | 10 | 11 | 12;

export interface Chapter {
  classId: ClassId;
  subject: SubjectId;
  number: number;
  name: string;
  /** Textbook the chapter number refers to. */
  book: string;
}

export const SUBJECTS: Record<
  SubjectId,
  { name: string; short: string; tint: string }
> = {
  physics: { name: "Physics", short: "Phy", tint: "#3b6fe0" },
  chemistry: { name: "Chemistry", short: "Chem", tint: "#a855f7" },
  maths: { name: "Maths", short: "Maths", tint: "#d97706" },
  biology: { name: "Biology", short: "Bio", tint: "#16a34a" },
};

export const CLASSES: ClassId[] = [9, 10, 11, 12];

function ch(
  classId: ClassId,
  subject: SubjectId,
  number: number,
  name: string,
  book: string,
): Chapter {
  return { classId, subject, number, name, book };
}

const sci9 = "NCERT Class 9 Science";
const math9 = "NCERT Class 9 Mathematics";
const sci10 = "NCERT Class 10 Science";
const math10 = "NCERT Class 10 Mathematics";
const phy11 = "NCERT Class 11 Physics";
const chem11 = "NCERT Class 11 Chemistry";
const phy12 = "NCERT Class 12 Physics";

/**
 * Rationalised NCERT chapter lists.
 * Class 11 & 12 Physics follow the current textbook numbering
 * (Physical World and Communication Systems are not in the book).
 * Class 9 and 10 Science is one textbook; chapters are grouped here
 * by the subject they belong to, keeping the textbook number.
 */
export const CHAPTERS: Chapter[] = [
  // Class 9 Science — physics
  ch(9, "physics", 7, "Motion", sci9),
  ch(9, "physics", 8, "Force and Laws of Motion", sci9),
  ch(9, "physics", 9, "Gravitation", sci9),
  ch(9, "physics", 10, "Work and Energy", sci9),
  ch(9, "physics", 11, "Sound", sci9),
  // Class 9 Science — chemistry
  ch(9, "chemistry", 1, "Matter in Our Surroundings", sci9),
  ch(9, "chemistry", 2, "Is Matter Around Us Pure", sci9),
  ch(9, "chemistry", 3, "Atoms and Molecules", sci9),
  ch(9, "chemistry", 4, "Structure of the Atom", sci9),
  // Class 9 Science — biology
  ch(9, "biology", 5, "The Fundamental Unit of Life", sci9),
  ch(9, "biology", 6, "Tissues", sci9),
  ch(9, "biology", 12, "Improvement in Food Resources", sci9),
  // Class 9 Maths
  ch(9, "maths", 1, "Number Systems", math9),
  ch(9, "maths", 2, "Polynomials", math9),
  ch(9, "maths", 3, "Coordinate Geometry", math9),
  ch(9, "maths", 4, "Linear Equations in Two Variables", math9),
  ch(9, "maths", 5, "Introduction to Euclid’s Geometry", math9),
  ch(9, "maths", 6, "Lines and Angles", math9),
  ch(9, "maths", 7, "Triangles", math9),
  ch(9, "maths", 8, "Quadrilaterals", math9),
  ch(9, "maths", 9, "Circles", math9),
  ch(9, "maths", 10, "Heron’s Formula", math9),
  ch(9, "maths", 11, "Surface Areas and Volumes", math9),
  ch(9, "maths", 12, "Statistics", math9),

  // Class 10 Science — physics
  ch(10, "physics", 9, "Light – Reflection and Refraction", sci10),
  ch(10, "physics", 10, "The Human Eye and the Colourful World", sci10),
  ch(10, "physics", 11, "Electricity", sci10),
  ch(10, "physics", 12, "Magnetic Effects of Electric Current", sci10),
  // Class 10 Science — chemistry
  ch(10, "chemistry", 1, "Chemical Reactions and Equations", sci10),
  ch(10, "chemistry", 2, "Acids, Bases and Salts", sci10),
  ch(10, "chemistry", 3, "Metals and Non-metals", sci10),
  ch(10, "chemistry", 4, "Carbon and its Compounds", sci10),
  // Class 10 Science — biology
  ch(10, "biology", 5, "Life Processes", sci10),
  ch(10, "biology", 6, "Control and Coordination", sci10),
  ch(10, "biology", 7, "How do Organisms Reproduce?", sci10),
  ch(10, "biology", 8, "Heredity", sci10),
  ch(10, "biology", 13, "Our Environment", sci10),
  // Class 10 Maths
  ch(10, "maths", 1, "Real Numbers", math10),
  ch(10, "maths", 2, "Polynomials", math10),
  ch(10, "maths", 3, "Pair of Linear Equations in Two Variables", math10),
  ch(10, "maths", 4, "Quadratic Equations", math10),
  ch(10, "maths", 5, "Arithmetic Progressions", math10),
  ch(10, "maths", 6, "Triangles", math10),
  ch(10, "maths", 7, "Coordinate Geometry", math10),
  ch(10, "maths", 8, "Introduction to Trigonometry", math10),
  ch(10, "maths", 9, "Some Applications of Trigonometry", math10),
  ch(10, "maths", 10, "Circles", math10),
  ch(10, "maths", 11, "Areas Related to Circles", math10),
  ch(10, "maths", 12, "Surface Areas and Volumes", math10),
  ch(10, "maths", 13, "Statistics", math10),
  ch(10, "maths", 14, "Probability", math10),

  // Class 11 Physics — full rationalised textbook
  ch(11, "physics", 1, "Units and Measurements", phy11),
  ch(11, "physics", 2, "Motion in a Straight Line", phy11),
  ch(11, "physics", 3, "Motion in a Plane", phy11),
  ch(11, "physics", 4, "Laws of Motion", phy11),
  ch(11, "physics", 5, "Work, Energy and Power", phy11),
  ch(11, "physics", 6, "System of Particles and Rotational Motion", phy11),
  ch(11, "physics", 7, "Gravitation", phy11),
  ch(11, "physics", 8, "Mechanical Properties of Solids", phy11),
  ch(11, "physics", 9, "Mechanical Properties of Fluids", phy11),
  ch(11, "physics", 10, "Thermal Properties of Matter", phy11),
  ch(11, "physics", 11, "Thermodynamics", phy11),
  ch(11, "physics", 12, "Kinetic Theory", phy11),
  ch(11, "physics", 13, "Oscillations", phy11),
  ch(11, "physics", 14, "Waves", phy11),

  // Class 11 Chemistry — rationalised textbook
  ch(11, "chemistry", 1, "Some Basic Concepts of Chemistry", chem11),
  ch(11, "chemistry", 2, "Structure of Atom", chem11),
  ch(11, "chemistry", 3, "Classification of Elements and Periodicity in Properties", chem11),
  ch(11, "chemistry", 4, "Chemical Bonding and Molecular Structure", chem11),
  ch(11, "chemistry", 5, "Thermodynamics", chem11),
  ch(11, "chemistry", 6, "Equilibrium", chem11),
  ch(11, "chemistry", 7, "Redox Reactions", chem11),
  ch(11, "chemistry", 8, "Organic Chemistry — Some Basic Principles and Techniques", chem11),
  ch(11, "chemistry", 9, "Hydrocarbons", chem11),

  // Class 12 Physics — full rationalised textbook
  ch(12, "physics", 1, "Electric Charges and Fields", phy12),
  ch(12, "physics", 2, "Electrostatic Potential and Capacitance", phy12),
  ch(12, "physics", 3, "Current Electricity", phy12),
  ch(12, "physics", 4, "Moving Charges and Magnetism", phy12),
  ch(12, "physics", 5, "Magnetism and Matter", phy12),
  ch(12, "physics", 6, "Electromagnetic Induction", phy12),
  ch(12, "physics", 7, "Alternating Current", phy12),
  ch(12, "physics", 8, "Electromagnetic Waves", phy12),
  ch(12, "physics", 9, "Ray Optics and Optical Instruments", phy12),
  ch(12, "physics", 10, "Wave Optics", phy12),
  ch(12, "physics", 11, "Dual Nature of Radiation and Matter", phy12),
  ch(12, "physics", 12, "Atoms", phy12),
  ch(12, "physics", 13, "Nuclei", phy12),
  ch(12, "physics", 14, "Semiconductor Electronics: Materials, Devices and Simple Circuits", phy12),
];

export function chaptersFor(classId: ClassId, subject: SubjectId): Chapter[] {
  return CHAPTERS.filter((c) => c.classId === classId && c.subject === subject).sort(
    (a, b) => a.number - b.number,
  );
}

export function subjectsFor(classId: ClassId): SubjectId[] {
  const seen = new Set<SubjectId>();
  const order: SubjectId[] = ["physics", "chemistry", "maths", "biology"];
  for (const c of CHAPTERS) if (c.classId === classId) seen.add(c.subject);
  return order.filter((s) => seen.has(s));
}

export function findChapter(classId: ClassId, subject: SubjectId, number: number): Chapter | undefined {
  return CHAPTERS.find((c) => c.classId === classId && c.subject === subject && c.number === number);
}
