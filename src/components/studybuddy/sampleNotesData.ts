export interface SampleNotePreset {
  id: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  notes: string;
}

export const SAMPLE_NOTE_PRESETS: SampleNotePreset[] = [
  {
    id: 'bio-photosynthesis',
    subject: 'Biology',
    topic: 'Photosynthesis & Cellular Respiration',
    gradeLevel: 'Grade 10',
    notes: `Photosynthesis and Cellular Respiration are complementary bioenergetic cycles that sustain life on Earth.

1. Photosynthesis:
- Occurs inside chloroplasts of plant cells and autotrophs.
- Chemical Equation: 6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2
- Stage 1: Light-Dependent Reactions take place in the thylakoid membranes. Photons excite electrons in chlorophyll, splitting water (photolysis) to release O2 and produce ATP and NADPH.
- Stage 2: Light-Independent Reactions (Calvin Cycle) take place in the stroma. The enzyme RuBisCO fixes atmospheric CO2 into G3P sugars using ATP and NADPH energy.

2. Cellular Respiration:
- Occurs in mitochondria and cytoplasm of eukaryotic organisms.
- Chemical Equation: C6H12O6 + 6O2 -> 6CO2 + 6H2O + ATP (~30-32 ATP).
- Stage 1: Glycolysis occurs in the cytoplasm (anaerobic, produces 2 net ATP + 2 Pyruvate + 2 NADH).
- Stage 2: Krebs Cycle (Citric Acid Cycle) occurs in mitochondrial matrix, generating NADH, FADH2, and 2 ATP.
- Stage 3: Electron Transport Chain (Oxidative Phosphorylation) occurs on the cristae/inner mitochondrial membrane. Oxygen is the terminal electron acceptor, forming H2O and driving ATP Synthase to generate the bulk of cellular ATP (~26-28 ATP).`,
  },
  {
    id: 'phys-mechanics',
    subject: 'Physics',
    topic: "Newton's Laws of Motion & Momentum",
    gradeLevel: 'Grade 11',
    notes: `Core Mechanics Principles & Laws of Motion:

1. Newton's 1st Law (Law of Inertia):
- An object at rest remains at rest, and an object in motion continues at constant velocity unless acted upon by an external net force (ΣF = 0).
- Inertia is directly proportional to mass.

2. Newton's 2nd Law (Force & Acceleration):
- The net force acting on an object equals the rate of change of momentum: F_net = m * a.
- Acceleration is directly proportional to net force and inversely proportional to mass.
- Unit of Force is the Newton (1 N = 1 kg·m/s²).

3. Newton's 3rd Law (Action & Reaction):
- When object A exerts a force on object B, object B simultaneously exerts an equal in magnitude and opposite in direction force on object A (F_AB = -F_BA).
- Action-reaction force pairs act on DIFFERENT bodies, so they never cancel each other out.

4. Momentum & Impulse:
- Linear Momentum (p) = m * v (vector quantity, kg·m/s).
- Impulse (J) = F_avg * Δt = Δp (change in momentum).
- Law of Conservation of Momentum: In a closed, isolated system with no external net force, total initial momentum equals total final momentum (Σp_initial = Σp_final).
- Elastic Collisions conserve both momentum and kinetic energy; Inelastic Collisions conserve momentum but dissipate kinetic energy into thermal/sound energy.`,
  },
  {
    id: 'chem-bonding',
    subject: 'Chemistry',
    topic: 'Chemical Bonding & Molecular Geometry',
    gradeLevel: 'Grade 10',
    notes: `Chemical Bonding & Intermolecular Forces:

1. Octet Rule:
- Atoms tend to gain, lose, or share valence electrons to achieve a stable electronic configuration with 8 valence electrons (noble gas configuration).

2. Types of Primary Chemical Bonds:
- Ionic Bonds: Electrostatic attraction between oppositely charged ions formed by electron transfer (typically metal + non-metal, electronegativity difference ΔEN > 2.0). High melting points, conduct electricity in molten/aqueous state.
- Covalent Bonds: Sharing of electron pairs between non-metal atoms (ΔEN < 1.7). Can be non-polar covalent (equal sharing, ΔEN < 0.4) or polar covalent (unequal sharing, dipole moment created, 0.4 <= ΔEN <= 1.7).
- Metallic Bonds: Lattice of positive metal cations surrounded by a delocalized "sea of mobile valence electrons", explaining electrical and thermal conductivity, malleability, and ductility.

3. VSEPR Theory (Valence Shell Electron Pair Repulsion):
- Electron pairs around a central atom repel each other and arrange themselves in 3D space to minimize repulsion.
- Linear: 2 bonding pairs, 0 lone pairs (180° bond angle, e.g., CO2).
- Trigonal Planar: 3 bonding pairs, 0 lone pairs (120°, e.g., BF3).
- Tetrahedral: 4 bonding pairs, 0 lone pairs (109.5°, e.g., CH4).
- Trigonal Pyramidal: 3 bonding pairs, 1 lone pair (~107°, e.g., NH3).
- Bent: 2 bonding pairs, 2 lone pairs (~104.5°, e.g., H2O).`,
  },
  {
    id: 'math-quadratics',
    subject: 'Mathematics',
    topic: 'Quadratic Equations & Parabolic Functions',
    gradeLevel: 'Grade 9',
    notes: `Quadratic Equations and Functions:

1. Standard Form:
- ax² + bx + c = 0, where a ≠ 0.

2. Quadratic Formula:
- x = (-b ± √(b² - 4ac)) / (2a)

3. The Discriminant (Δ = b² - 4ac):
- If Δ > 0: Two distinct real roots (parabola intersects x-axis at 2 points).
- If Δ = 0: Exactly one real root / repeated root (vertex touches the x-axis).
- If Δ < 0: No real roots, two complex conjugate roots (parabola does not cross the x-axis).

4. Vertex Form & Parabola Characteristics:
- Vertex Form: y = a(x - h)² + k, where (h, k) is the vertex.
- Axis of Symmetry: x = -b / (2a).
- Vertex y-coordinate: k = f(-b / 2a).
- If a > 0: Parabola opens upward, vertex is an absolute minimum.
- If a < 0: Parabola opens downward, vertex is an absolute maximum.
- Y-intercept: (0, c).

5. Vieta's Formulas:
- Sum of roots: r1 + r2 = -b / a
- Product of roots: r1 * r2 = c / a`,
  },
  {
    id: 'cs-algorithms',
    subject: 'Computer Science',
    topic: 'Data Structures, Big-O & Sorting Algorithms',
    gradeLevel: 'Grade 11',
    notes: `Fundamental Algorithms and Time Complexity:

1. Big-O Asymptotic Notation:
- Quantifies algorithm runtime or space efficiency as input size (n) grows towards infinity.
- O(1) Constant Time: Hash table lookup (average), array index access.
- O(log n) Logarithmic Time: Binary Search on sorted arrays.
- O(n) Linear Time: Linear search, traversing linked list.
- O(n log n) Linearithmic: Efficient comparison sorts (MergeSort, QuickSort average, HeapSort).
- O(n²) Quadratic Time: BubbleSort, InsertionSort, SelectionSort.

2. Divide & Conquer Sorting:
- MergeSort: Divides array into halves recursively until size 1, then merges sorted subarrays in linear time. Stable sort with guaranteed O(n log n) worst-case time, but requires O(n) auxiliary space.
- QuickSort: Selects a pivot element, partitions elements smaller to left and larger to right, recurses. Average O(n log n), worst-case O(n²) when pivot selection is degraded, in-place O(log n) stack space.

3. Core Data Structures:
- Stacks: LIFO (Last In First Out), operations: push(), pop(), peek() in O(1).
- Queues: FIFO (First In First Out), operations: enqueue(), dequeue() in O(1).
- Hash Maps: Key-Value pairing using hash functions, average O(1) insertion, deletion, and lookup.`,
  },
];
