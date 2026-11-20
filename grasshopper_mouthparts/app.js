/**
 * GrasshopperBio_3D — Interactive Mandibulate Mouthparts Virtual Dissection Atlas
 * Self-contained WebGL2 .glb engine with triangle-exact raycasting, PBR chitin shading,
 * guided anterior-to-posterior forceps dissection, 3D exploded layer scrubbing, and lab quiz mode.
 */

const ANATOMY_DATA = {
  Head_Capsule: {
    id: "Head_Capsule",
    name: "Head Capsule (Cranium)",
    subtitle: "Hypognathous Orthopteran Cranium, Compound Eyes & Filiform Antennae",
    step: 0,
    stepLabel: "Reference Base",
    shortSub: "Vertex, Frons, Genae, Eyes & Antennae",
    sprite: "textures/Head_Capsule_rgba.png",
    position:
      "Dorsoventrally elongated (hypognathous) cranial capsule oriented vertically, with mouthparts directed downward at the ventral peristomal margin.",
    function:
      "Houses the supraesophageal/subesophageal ganglia, supports the primary visual organs (large dorsolateral compound eyes and 3 simple ocelli) and multisensory filiform antennae, and provides rigid skeletal attachment for the massive mandibular adductor muscles.",
    instruction:
      "Hold the head capsule steady by the dorsal vertex/genae while using fine forceps to detach the mouthparts from the ventral peristomal margin in strict anterior-to-posterior sequence.",
    states: {
      assembled: { pos: [0.0, 2.115, 0.0], rot: [0.0, 0.0, 0.0] },
      exploded:  { pos: [0.0, 2.115, 0.0], rot: [0.0, 0.0, 0.0] },
      tray:      { pos: [0.0, 2.115, 0.0], rot: [0.0, 0.0, 0.0] },
    },
    pinLocal: [0.0, 0.72, 0.85],
    subStructures: [
      { name: "Compound Eyes", detail: "Large red-orange faceted eyes (ommatidia)", localPos: [-0.72, 0.35, 0.65] },
      { name: "Frontal Costa (Ridge)", detail: "Median carina & sulcus between antennae", localPos: [0.0, 0.12, 0.95] },
      { name: "Filiform Antennae", detail: "Multi-segmented mechano/chemoreceptors", localPos: [-2.1, 0.55, 0.45] },
      { name: "Genae (Cheeks)", detail: "Lateral cranial walls anchoring muscles", localPos: [0.78, -0.25, 0.55] },
      { name: "Clypeus", detail: "Ventral anterior sclerite hinging the labrum", localPos: [0.0, -0.82, 0.75] },
    ],
  },

  Labium: {
    id: "Labium",
    name: "Labium (Lower Lip & Labial Palps)",
    subtitle: "Fused Posterior Mouthpiece & 3-Segmented Palps • Dissection Step 1 of 5",
    step: 1,
    stepLabel: "Step 1 • Posterior",
    shortSub: "Step 1 • Submentum, Ligula & 3-Seg Palps",
    sprite: "textures/Labium_rgba.png",
    position:
      "Posterior-most mouthpiece forming the back wall and floor of the preoral cavity, attached to the ventral neck membrane behind the maxillae.",
    function:
      "Evolutionarily derived from a fused pair of second maxillae; seals the posterior side of the mouth, prevents food loss, and uses its bilobed ligula (paraglossae + glossae) and paired 3-segmented labial palps for sensory inspection.",
    instruction:
      "STEP 1: Begin on the posterior side of the head. Grasp the basal submentum/mentum near the neck membrane and peel the entire median labium—along with both 3-segmented labial palps—downward and posteriorly.",
    states: {
      assembled: { pos: [-0.01, 0.96, -0.72], rot: [-0.06, 0.0, 0.0] },
      exploded:  { pos: [1.39, -2.03, -1.15], rot: [0.18, -0.15, 0.0] },
      tray:      { pos: [0.0, -2.55, 0.0], rot: [0.0, 0.0, Math.PI] },
    },
    pinLocal: [0.0, -0.15, 0.22],
    subStructures: [
      { name: "Submental Cornua (Horns)", detail: "Paired dorsal amber projections attaching to postgena", localPos: [-0.36, 0.82, 0.10] },
      { name: "Mentum & Prementum", detail: "Central median sclerotized body plate", localPos: [0.0, 0.05, 0.18] },
      { name: "Bilobed Paraglossae", detail: "Large distal cleft lobes forming the lower lip pad", localPos: [0.22, -0.45, 0.20] },
      { name: "3-Segmented Labial Palps", detail: "Paired lateral sensory palps (shorter than maxillary)", localPos: [-0.68, -0.58, 0.10] },
    ],
  },

  Labrum: {
    id: "Labrum",
    name: "Labrum (Upper Lip)",
    subtitle: "Anterior-Most Bilobed Sclerite • Dissection Step 2 of 5",
    step: 2,
    stepLabel: "Step 2 • Anterior",
    shortSub: "Step 2 • Hinged Upper Lip",
    sprite: "textures/Labrum_rgba.png",
    position:
      "Anterior-most mouthpiece, suspended as a movable flap from the ventral margin of the clypeus along the clypeolabral suture, directly covering the mandibles.",
    function:
      "Acts as a protective upper lip that retains food inside the preoral cavity and uses its median ventral notch (emargination) to guide and hold grass blades vertically against the cutting mandibles.",
    instruction:
      "STEP 2: After removing the labium, turn to the anterior face, grip the lower margin of the glossy black labrum with fine forceps, and lift anteriorly/upward to unhinge it along the clypeolabral suture.",
    states: {
      assembled: { pos: [-0.01, 0.84, 0.82], rot: [0.06, 0.0, 0.0] },
      exploded:  { pos: [-1.51, -1.73, 1.55], rot: [-0.22, 0.18, 0.0] },
      tray:      { pos: [0.0, -0.05, 0.0], rot: [0.0, 0.0, 0.0] },
    },
    pinLocal: [0.0, 0.0, 0.25],
    subStructures: [
      { name: "Clypeolabral Hinge", detail: "Dorsal flexible suture attached to clypeus", localPos: [0.0, 0.36, 0.18] },
      { name: "Median Ventral Notch", detail: "Central indentation that guides leaf blades", localPos: [0.0, -0.35, 0.22] },
      { name: "Lateral Labral Lobes", detail: "Rounded convex chitinous anterior shields", localPos: [-0.42, -0.05, 0.22] },
      { name: "Epipharyngeal Wall", detail: "Concave inner sensory surface facing mandibles", localPos: [0.22, 0.0, -0.10] },
    ],
  },

  Maxilla_R: {
    id: "Maxilla_R",
    name: "Right Maxilla & Maxillary Palp",
    subtitle: "Secondary Branched Jaw & 5-Segmented Palp • Dissection Step 3 of 5",
    step: 3,
    stepLabel: "Step 3 • Secondary Jaw",
    shortSub: "Step 3 • Lacinia, Galea & 5-Seg Palp",
    sprite: "textures/Maxilla_R_rgba.png",
    position:
      "Positioned on the insect's right side (viewer's left) directly behind the right mandible and anterior to the labium.",
    function:
      "Composite appendage that holds, manipulates, and pre-chews food with its inner toothed lacinia and spoon-like galea while continuously tasting food chemistry with its 5-segmented maxillary palp.",
    instruction:
      "STEP 3: With the labium and labrum removed, grip the basal cardo/stipes of the right maxilla deep at its attachment so the lacinia, galea, and 5-segmented maxillary palp pull away as one complete unit.",
    states: {
      assembled: { pos: [-0.74, 0.87, -0.22], rot: [0.0, 0.0, -0.05] },
      exploded:  { pos: [-2.31, 0.37, -0.35], rot: [0.0, -0.28, 0.0] },
      tray:      { pos: [-2.10, -2.20, 0.0], rot: [0.0, 0.0, 0.0] },
    },
    pinLocal: [0.18, 0.05, 0.20],
    subStructures: [
      { name: "Cardo & Stipes", detail: "Basal hinge & central shaft of the maxilla", localPos: [0.35, 0.45, 0.16] },
      { name: "Toothed Lacinia", detail: "Inner sclerotized claw with sharp terminal teeth", localPos: [0.46, -0.35, 0.14] },
      { name: "Hooded Galea", detail: "Outer spoon-shaped lobe flanking the lacinia", localPos: [0.22, -0.32, 0.16] },
      { name: "5-Segmented Maxillary Palp", detail: "Long lateral sensory feeler with amber joints", localPos: [-0.42, -0.18, 0.10] },
    ],
  },

  Maxilla_L: {
    id: "Maxilla_L",
    name: "Left Maxilla & Maxillary Palp",
    subtitle: "Secondary Branched Jaw & 5-Segmented Palp • Dissection Step 3 of 5",
    step: 3,
    stepLabel: "Step 3 • Secondary Jaw",
    shortSub: "Step 3 • Lacinia, Galea & 5-Seg Palp",
    sprite: "textures/Maxilla_L_rgba.png",
    position:
      "Positioned on the insect's left side (viewer's right) directly behind the left mandible and anterior to the labium.",
    function:
      "Works synchronously with the right maxilla to sweep sheared plant fragments toward the pharynx while the 5-segmented maxillary palp samples leaf surface compounds.",
    instruction:
      "STEP 3: Grasp the basal cardo/stipes of the left maxilla with fine forceps and gently peel laterally and downward to preserve all 5 segments of the maxillary palp.",
    states: {
      assembled: { pos: [0.72, 0.87, -0.22], rot: [0.0, 0.0, 0.05] },
      exploded:  { pos: [2.39, 0.37, -0.35], rot: [0.0, 0.28, 0.0] },
      tray:      { pos: [2.10, -2.20, 0.0], rot: [0.0, 0.0, 0.0] },
    },
    pinLocal: [-0.18, 0.05, 0.20],
    subStructures: [
      { name: "Cardo & Stipes", detail: "Proximal basal sclerites articulating with head", localPos: [-0.32, 0.45, 0.16] },
      { name: "Lacinia (Inner Fork)", detail: "Sclerotized mesal blade with terminal maxadentes", localPos: [-0.40, -0.32, 0.14] },
      { name: "Galea (Outer Hood)", detail: "Rounded lobe overlapping the lacinia", localPos: [-0.12, -0.34, 0.16] },
      { name: "5-Segmented Maxillary Palp", detail: "Tactile & gustatory sensory appendage", localPos: [0.42, -0.18, 0.10] },
    ],
  },

  Mandible_R: {
    id: "Mandible_R",
    name: "Right Mandible (Primary Jaw)",
    subtitle: "Sclerotized Dicondylic Chewing Jaw • Dissection Step 4 of 5",
    step: 4,
    stepLabel: "Step 4 • Primary Jaw",
    shortSub: "Step 4 • Incisor & Molar Jaw",
    sprite: "textures/Mandible_R_rgba.png",
    position:
      "Located on the insect's right side (viewer's left) immediately posterior to the labrum and anterior to the right maxilla.",
    function:
      "Heavily sclerotized, asymmetric pyramidal jaw operating transversely (side-to-side) on two condyles. Sharp distal incisor teeth shear plant leaves while the ridged proximal molar surface grinds tough cellulose fibers.",
    instruction:
      "STEP 4: After removing the labium, labrum, and both maxillae, grasp the stout outer base of the right mandible with strong forceps and rock laterally outward to sever the dicondylic hinge and large adductor tendon.",
    states: {
      assembled: { pos: [-0.36, 0.96, 0.36], rot: [0.0, 0.0, -0.08] },
      exploded:  { pos: [-0.81, -0.13, 0.75], rot: [0.0, -0.25, -0.05] },
      tray:      { pos: [-1.85, -0.15, 0.0], rot: [0.0, 0.0, 0.0] },
    },
    pinLocal: [0.0, 0.0, 0.35],
    subStructures: [
      { name: "Distal Incisor Teeth", detail: "Sharp black cutting cusps at lower mesal apex", localPos: [0.36, -0.38, 0.15] },
      { name: "Molar Grinding Ridge", detail: "Proximal mesal chewing surface", localPos: [0.32, 0.05, 0.18] },
      { name: "Sensory Molar Fringe", detail: "Golden-orange setae at dorsal mesal margin", localPos: [0.22, 0.42, 0.18] },
      { name: "Dicondylic Base", detail: "Lateral articulation with gena & clypeus", localPos: [-0.36, 0.12, 0.25] },
    ],
  },

  Mandible_L: {
    id: "Mandible_L",
    name: "Left Mandible (Primary Jaw)",
    subtitle: "Sclerotized Dicondylic Chewing Jaw • Dissection Step 4 of 5",
    step: 4,
    stepLabel: "Step 4 • Primary Jaw",
    shortSub: "Step 4 • Incisor & Molar Jaw",
    sprite: "textures/Mandible_L_rgba.png",
    position:
      "Located on the insect's left side (viewer's right) immediately posterior to the labrum, interlocking asymmetrically with the right mandible at the midline.",
    function:
      "Works in opposition to the right mandible; its slightly asymmetric incisor cusps overlap the right mandible to create a self-sharpening scissor action on plant tissue.",
    instruction:
      "STEP 4: Grasp the left mandible near its lateral articulation with sturdy forceps and rock outward away from the midline to detach it intact, exposing the central hypopharynx.",
    states: {
      assembled: { pos: [0.34, 0.96, 0.32], rot: [0.0, 0.0, 0.08] },
      exploded:  { pos: [0.79, -0.13, 0.75], rot: [0.0, 0.25, 0.05] },
      tray:      { pos: [1.85, -0.15, 0.0], rot: [0.0, 0.0, 0.0] },
    },
    pinLocal: [0.0, 0.0, 0.35],
    subStructures: [
      { name: "Interlocking Incisors", detail: "Asymmetric black cutting teeth at mesal tip", localPos: [-0.38, -0.38, 0.15] },
      { name: "Molar Grinding Surface", detail: "Heavy ridged crushing block", localPos: [-0.32, 0.05, 0.18] },
      { name: "Dorsal Setal Fringe", detail: "Golden brush of sensory bristles", localPos: [-0.24, 0.42, 0.18] },
      { name: "Lateral Condyle Base", detail: "Hinge joint & adductor muscle insertion", localPos: [0.38, 0.10, 0.25] },
    ],
  },

  Hypopharynx: {
    id: "Hypopharynx",
    name: "Hypopharynx (Median Tongue)",
    subtitle: "Fleshy Central Preoral Lobe • Dissection Step 5 of 5",
    step: 5,
    stepLabel: "Step 5 • Central Tongue",
    shortSub: "Step 5 • Median Tongue & Salivarium",
    sprite: "textures/Hypopharynx_rgba.png",
    position:
      "Suspended centrally inside the preoral cavity between the mandibles and maxillae, dorsal to the labium and directly below the pharynx opening.",
    function:
      "Fleshy, tongue-like median organ that mixes macerated plant fragments with salivary secretions discharged from the salivarium at its base and directs the food bolus into the cibarium/pharynx.",
    instruction:
      "STEP 5 (FINAL): Now that all surrounding mouthparts have been cleared, gently pinch the dorsal suspensorial base of the fleshy central hypopharynx with fine forceps and extract it cleanly.",
    states: {
      assembled: { pos: [-0.01, 1.00, -0.34], rot: [0.0, 0.0, 0.0] },
      exploded:  { pos: [-0.01, -1.23, -0.45], rot: [-0.12, 0.0, 0.0] },
      tray:      { pos: [0.0, -0.98, 0.0], rot: [0.0, 0.0, 0.0] },
    },
    pinLocal: [0.0, 0.0, 0.16],
    subStructures: [
      { name: "Suspensorial Sclerites", detail: "Dorsal supporting rods anchoring to oral cavity", localPos: [0.0, 0.28, 0.08] },
      { name: "Median Tongue Lobe", detail: "Slender fleshy body covered in fine sensory setae", localPos: [0.0, 0.0, 0.14] },
      { name: "Salivarium Base", detail: "Posterior salivary duct opening near labium", localPos: [0.0, 0.16, -0.10] },
      { name: "Ventral Apex", detail: "Tapered distal tip guiding chewed plant bolus", localPos: [0.0, -0.30, 0.10] },
    ],
  },
};

const ORDERED_PART_IDS = [
  "Head_Capsule",
  "Labium",
  "Labrum",
  "Maxilla_R",
  "Maxilla_L",
  "Mandible_R",
  "Mandible_L",
  "Hypopharynx",
];

const QUIZ_QUESTIONS = [
  {
    prompt: "Step 1 of Dissection: Click the posterior-most mouthpiece (Lower Lip) bearing paired 3-segmented labial palps.",
    targets: ["Labium"],
    explanation: "Correct! The Labium is removed first (Step 1) from the posterior margin of the preoral cavity.",
  },
  {
    prompt: "Step 2 of Dissection: Click the anterior-most mouthpiece (Upper Lip) hinged to the clypeus with a median ventral notch.",
    targets: ["Labrum"],
    explanation: "Correct! The Labrum is the glossy black bilobed upper lip removed second (Step 2).",
  },
  {
    prompt: "Step 3 of Dissection: Click either of the branched secondary jaws equipped with a cardo, stipes, toothed lacinia, hooded galea, and 5-segmented palp.",
    targets: ["Maxilla_R", "Maxilla_L"],
    explanation: "Great job! The paired Maxillae are extracted third (Step 3) along with their 5-segmented maxillary palps.",
  },
  {
    prompt: "Step 4 of Dissection: Click either of the heavily sclerotized primary chewing jaws featuring sharp distal incisor teeth and a molar grinding surface.",
    targets: ["Mandible_R", "Mandible_L"],
    explanation: "Spot on! The paired Mandibles are detached fourth (Step 4) to shear and grind plant tissue.",
  },
  {
    prompt: "Step 5 (Final): Click the fleshy median tongue-like organ suspended in the center of the preoral cavity.",
    targets: ["Hypopharynx"],
    explanation: "Exact match! The Hypopharynx is the central tongue extracted last (Step 5) after clearing the surrounding mouthparts.",
  },
  {
    prompt: "Click the hypognathous cranium that bears the large red-orange compound eyes, frontal costa, and filiform antennae.",
    targets: ["Head_Capsule"],
    explanation: "Correct! The Head Capsule serves as the rigid cranial foundation for the eyes, antennae, and mandibular muscles.",
  },
];

/* =========================================================================
   Minimal 4x4 Matrix & Vector3 Math Utilities
   ========================================================================= */
function mat4Identity() {
  return new Float32Array([1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1]);
}

function mat4Multiply(a, b) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[0 * 4 + r] * b[c * 4 + 0] +
        a[1 * 4 + r] * b[c * 4 + 1] +
        a[2 * 4 + r] * b[c * 4 + 2] +
        a[3 * 4 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

function mat4Perspective(fovRad, aspect, near, far) {
  const f = 1.0 / Math.tan(fovRad / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

function vec3Sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function vec3Add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function vec3Scale(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
function vec3Dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function vec3Cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
function vec3Normalize(a) {
  const len = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / len, a[1] / len, a[2] / len];
}

function mat4LookAt(eye, target, up) {
  const z = vec3Normalize(vec3Sub(eye, target));
  const x = vec3Normalize(vec3Cross(up, z));
  const y = vec3Cross(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -vec3Dot(x, eye), -vec3Dot(y, eye), -vec3Dot(z, eye), 1,
  ]);
}

function mat4FromTRS(pos, eulerXYZ, scaleXYZ = [1, 1, 1]) {
  const [rx, ry, rz] = eulerXYZ;
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cz = Math.cos(rz), sz = Math.sin(rz);

  const m00 = cy * cz * scaleXYZ[0];
  const m01 = (sx * sy * cz + cx * sz) * scaleXYZ[0];
  const m02 = (-cx * sy * cz + sx * sz) * scaleXYZ[0];

  const m10 = -cy * sz * scaleXYZ[1];
  const m11 = (-sx * sy * sz + cx * cz) * scaleXYZ[1];
  const m12 = (cx * sy * sz + sx * cz) * scaleXYZ[1];

  const m20 = sy * scaleXYZ[2];
  const m21 = -sx * cy * scaleXYZ[2];
  const m22 = cx * cy * scaleXYZ[2];

  return new Float32Array([
    m00, m01, m02, 0,
    m10, m11, m12, 0,
    m20, m21, m22, 0,
    pos[0], pos[1], pos[2], 1,
  ]);
}

function mat4InvertRigidOrScaled(m) {
  // General 4x4 matrix inverse
  const inv = new Float32Array(16);
  inv[0] = m[5]*m[10]*m[15] - m[5]*m[11]*m[14] - m[9]*m[6]*m[15] + m[9]*m[7]*m[14] + m[13]*m[6]*m[11] - m[13]*m[7]*m[10];
  inv[4] = -m[4]*m[10]*m[15] + m[4]*m[11]*m[14] + m[8]*m[6]*m[15] - m[8]*m[7]*m[14] - m[12]*m[6]*m[11] + m[12]*m[7]*m[10];
  inv[8] = m[4]*m[9]*m[15] - m[4]*m[11]*m[13] - m[8]*m[5]*m[15] + m[8]*m[7]*m[13] + m[12]*m[5]*m[11] - m[12]*m[7]*m[9];
  inv[12] = -m[4]*m[9]*m[14] + m[4]*m[10]*m[13] + m[8]*m[5]*m[14] - m[8]*m[6]*m[13] - m[12]*m[5]*m[10] + m[12]*m[6]*m[9];
  inv[1] = -m[1]*m[10]*m[15] + m[1]*m[11]*m[14] + m[9]*m[2]*m[15] - m[9]*m[3]*m[14] - m[13]*m[2]*m[11] + m[13]*m[3]*m[10];
  inv[5] = m[0]*m[10]*m[15] - m[0]*m[11]*m[14] - m[8]*m[2]*m[15] + m[8]*m[3]*m[14] + m[12]*m[2]*m[11] - m[12]*m[3]*m[10];
  inv[9] = -m[0]*m[9]*m[15] + m[0]*m[11]*m[13] + m[8]*m[1]*m[15] - m[8]*m[3]*m[13] - m[12]*m[1]*m[11] + m[12]*m[3]*m[9];
  inv[13] = m[0]*m[9]*m[14] - m[0]*m[10]*m[13] - m[8]*m[1]*m[14] + m[8]*m[2]*m[13] + m[12]*m[1]*m[10] - m[12]*m[2]*m[9];
  inv[2] = m[1]*m[6]*m[15] - m[1]*m[7]*m[14] - m[5]*m[2]*m[15] + m[5]*m[3]*m[14] + m[13]*m[2]*m[7] - m[13]*m[3]*m[6];
  inv[6] = -m[0]*m[6]*m[15] + m[0]*m[7]*m[14] + m[4]*m[2]*m[15] - m[4]*m[3]*m[14] - m[12]*m[2]*m[7] + m[12]*m[3]*m[6];
  inv[10] = m[0]*m[5]*m[15] - m[0]*m[7]*m[13] - m[4]*m[1]*m[15] + m[4]*m[3]*m[13] + m[12]*m[1]*m[7] - m[12]*m[3]*m[5];
  inv[14] = -m[0]*m[5]*m[14] + m[0]*m[6]*m[13] + m[4]*m[1]*m[14] - m[4]*m[2]*m[13] - m[12]*m[1]*m[6] + m[12]*m[2]*m[5];
  inv[3] = -m[1]*m[6]*m[11] + m[1]*m[7]*m[10] + m[5]*m[2]*m[11] - m[5]*m[3]*m[10] - m[9]*m[2]*m[7] + m[9]*m[3]*m[6];
  inv[7] = m[0]*m[6]*m[11] - m[0]*m[7]*m[10] - m[4]*m[2]*m[11] + m[4]*m[3]*m[10] + m[8]*m[2]*m[7] - m[8]*m[3]*m[6];
  inv[11] = -m[0]*m[5]*m[11] + m[0]*m[7]*m[9] + m[4]*m[1]*m[11] - m[4]*m[3]*m[9] - m[8]*m[1]*m[7] + m[8]*m[3]*m[5];
  inv[15] = m[0]*m[5]*m[10] - m[0]*m[6]*m[9] - m[4]*m[1]*m[10] + m[4]*m[2]*m[9] + m[8]*m[1]*m[6] - m[8]*m[2]*m[5];

  let det = m[0]*inv[0] + m[1]*inv[4] + m[2]*inv[8] + m[3]*inv[12];
  if (Math.abs(det) < 1e-12) return mat4Identity();
  det = 1.0 / det;
  for (let i = 0; i < 16; i++) inv[i] *= det;
  return inv;
}

function transformPoint(m, p) {
  const x = p[0], y = p[1], z = p[2];
  const w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1.0;
  return [
    (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
    (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
    (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
  ];
}

function transformDirection(m, d) {
  const x = d[0], y = d[1], z = d[2];
  return vec3Normalize([
    m[0] * x + m[4] * y + m[8] * z,
    m[1] * x + m[5] * y + m[9] * z,
    m[2] * x + m[6] * y + m[10] * z,
  ]);
}

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpVec3(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }

/* =========================================================================
   WebGL2 Shader Sources (Studio PBR Chitin + Rim + Subsurface + Wireframe)
   ========================================================================= */
const VERT_SRC = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;

uniform mat4 uModel;
uniform mat4 uViewProj;

out vec3 vWorldPos;
out vec3 vWorldNormal;
out vec2 vUv;

void main() {
  vec4 worldPos = uModel * vec4(aPosition, 1.0);
  vWorldPos = worldPos.xyz;
  vWorldNormal = normalize(mat3(uModel) * aNormal);
  vUv = aUv;
  gl_Position = uViewProj * worldPos;
}
`;

const FRAG_SRC = `#version 300 es
precision highp float;

in vec3 vWorldPos;
in vec3 vWorldNormal;
in vec2 vUv;

uniform sampler2D uBaseTex;
uniform int uUseTexture;
uniform vec3 uBaseColorFactor;
uniform vec3 uCamPos;
uniform float uRoughness;
uniform float uAlpha;
uniform int uHighlightState; // 0 = normal, 1 = hovered, 2 = selected
uniform int uWireframePass;

out vec4 fragColor;

void main() {
  if (uWireframePass == 1) {
    fragColor = vec4(0.96, 0.62, 0.04, 0.32);
    return;
  }

  vec3 N = normalize(vWorldNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(uCamPos - vWorldPos);

  vec3 baseColor;
  if (uUseTexture == 1) {
    vec4 texSample = texture(uBaseTex, vUv);
    baseColor = pow(texSample.rgb, vec3(2.2)); // sRGB to linear
  } else {
    baseColor = uBaseColorFactor; // glTF baseColorFactor is already linear
  }

  // 3-Point Entomological Studio Lighting
  vec3 L1 = normalize(vec3(-0.45, 0.55, 0.70)); // Warm Key Light
  vec3 L2 = normalize(vec3(0.55, 0.25, 0.65));  // Cool Fill Light
  vec3 L3 = normalize(vec3(0.0, 0.45, -0.88));  // Rim Backlight

  float diff1 = max(dot(N, L1), 0.0);
  float diff2 = max(dot(N, L2), 0.0);
  float diff3 = max(dot(N, L3), 0.0);

  // Subsurface wrap lighting for translucent amber chitin (maxillae, labium, eyes)
  float wrap1 = max(0.0, (dot(N, L1) + 0.35) / 1.35);

  // Specular Blinn-Phong + Clearcoat chitin sheen
  vec3 H1 = normalize(L1 + V);
  vec3 H2 = normalize(L2 + V);
  float shininess = mix(96.0, 18.0, uRoughness);
  float spec1 = pow(max(dot(N, H1), 0.0), shininess) * 0.55;
  float spec2 = pow(max(dot(N, H2), 0.0), shininess * 0.7) * 0.25;

  // Fresnel Rim
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.2);

  vec3 ambient = baseColor * 0.34;
  vec3 diffuse = baseColor * (diff1 * vec3(1.02, 0.99, 0.95) * 0.72 + diff2 * vec3(0.90, 0.95, 1.02) * 0.40 + wrap1 * 0.16);
  vec3 specular = vec3(1.0, 0.97, 0.92) * (spec1 + spec2) + vec3(0.95, 0.78, 0.55) * fresnel * (0.18 + 0.25 * diff3);

  vec3 color = ambient + diffuse + specular;

  // Hover / Selection highlight feedback
  if (uHighlightState == 1) {
    color += vec3(0.35, 0.22, 0.02) * (0.35 + 0.65 * fresnel);
  } else if (uHighlightState == 2) {
    color += vec3(0.42, 0.26, 0.0) * (0.20 + 0.85 * fresnel);
  }

  // Tone map & gamma correct back to sRGB
  color = color / (color + vec3(1.0));
  color = pow(color * 1.35, vec3(1.0 / 2.2));

  fragColor = vec4(color, uAlpha);
}
`;

/* =========================================================================
   Main Application State & Engine
   ========================================================================= */
class GrasshopperDissectionApp {
  constructor() {
    this.canvas = document.getElementById("glCanvas");
    this.gl = this.canvas.getContext("webgl2", { antialias: true, alpha: false });
    if (!this.gl) {
      alert("WebGL2 is required to view the 3D Grasshopper Mouthparts model.");
      return;
    }

    // Scene State
    this.animStarted = false;
    this.parts = {};
    this.selectedPartId = "Head_Capsule";
    this.hoveredPartId = null;
    this.activeSubStructureIdx = null;
    this.isolatedPartId = null;

    // Modes & Controls
    this.toolMode = "inspect"; // 'inspect' | 'forceps' | 'quiz'
    this.strictOrder = true;
    this.explodePercent = 0; // 0 = Intact, 50 = Exploded, 100 = Dissection Card
    this.depthScale = 1.0;
    this.showLabels = true;
    this.showSubPins = true;
    this.ghostHead = false;
    this.showWireframe = false;

    // Camera Orbit State
    this.cam = {
      yaw: -0.36,
      pitch: 0.14,
      distance: 7.2,
      target: [0.0, 1.35, 0.0],
      targetYaw: -0.36,
      targetPitch: 0.14,
      targetDistance: 7.2,
      targetCenter: [0.0, 1.35, 0.0],
    };

    // Quiz State
    this.quizIndex = 0;
    this.quizCorrect = 0;
    this.quizTotal = 0;

    this.initShaders();
    this.bindUIEvents();
    this.bindCanvasEvents();
    this.initGrasshopperScene();
  }

  getActiveAnatomyData() {
    return ANATOMY_DATA;
  }

  getActiveOrderedIds() {
    return ORDERED_PART_IDS;
  }

  getActiveQuizQuestions() {
    return QUIZ_QUESTIONS;
  }

  initShaders() {
    const gl = this.gl;
    const vs = this.compileShader(gl.VERTEX_SHADER, VERT_SRC);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, FRAG_SRC);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Shader link error:", gl.getProgramInfoLog(prog));
    }
    this.program = prog;
    this.uniforms = {
      uModel: gl.getUniformLocation(prog, "uModel"),
      uViewProj: gl.getUniformLocation(prog, "uViewProj"),
      uBaseTex: gl.getUniformLocation(prog, "uBaseTex"),
      uUseTexture: gl.getUniformLocation(prog, "uUseTexture"),
      uBaseColorFactor: gl.getUniformLocation(prog, "uBaseColorFactor"),
      uCamPos: gl.getUniformLocation(prog, "uCamPos"),
      uRoughness: gl.getUniformLocation(prog, "uRoughness"),
      uAlpha: gl.getUniformLocation(prog, "uAlpha"),
      uHighlightState: gl.getUniformLocation(prog, "uHighlightState"),
      uWireframePass: gl.getUniformLocation(prog, "uWireframePass"),
    };
  }

  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  async initGrasshopperScene() {
    this.parts = await this.loadGLB("grasshopper_mouthparts.glb?v=3");
    this.renderPartsListUI();
    this.selectPart("Head_Capsule", false);
    this.recomputeTargetTransforms();
    this.updateDissectionProgressUI();
    this.setCameraPreset("oblique");

    if (!this.animStarted) {
      this.animStarted = true;
      requestAnimationFrame(() => this.animate());
    }
  }

  /* =======================================================================
     Direct Binary .glb Parser & WebGL2 Buffer Uploader
     ======================================================================= */
  async loadGLB(url) {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const dv = new DataView(arrayBuffer);

    const magic = dv.getUint32(0, true);
    if (magic !== 0x46546c67) {
      throw new Error("Invalid GLB file header");
    }

    const jsonChunkLen = dv.getUint32(12, true);
    const jsonBytes = new Uint8Array(arrayBuffer, 20, jsonChunkLen);
    const gltf = JSON.parse(new TextDecoder("utf-8").decode(jsonBytes));

    const binChunkOffset = 20 + jsonChunkLen + 8;
    const binBuffer = arrayBuffer.slice(binChunkOffset);

    // 1. Decode embedded PNG textures (if any) into WebGLTexture objects
    const gl = this.gl;
    const glTextures = await Promise.all(
      (gltf.images || []).map(async (imgDef) => {
        const bv = gltf.bufferViews[imgDef.bufferView];
        const slice = new Uint8Array(binBuffer, bv.byteOffset || 0, bv.byteLength);
        const blob = new Blob([slice], { type: imgDef.mimeType || "image/png" });
        const bitmap = await createImageBitmap(blob, { imageOrientation: "none" });
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return tex;
      })
    );

    const getAccessorData = (accIdx) => {
      const acc = gltf.accessors[accIdx];
      const bv = gltf.bufferViews[acc.bufferView];
      const byteOffset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
      const numComponents = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[acc.type];
      const count = acc.count * numComponents;
      if (acc.componentType === 5126) return new Float32Array(binBuffer, byteOffset, count);
      if (acc.componentType === 5123) return new Uint16Array(binBuffer, byteOffset, count);
      if (acc.componentType === 5125) return new Uint32Array(binBuffer, byteOffset, count);
      return null;
    };

    const partsMap = {};

    // 2. Build GPU VAOs and CPU Raycasting Triangles for each Node
    for (const node of gltf.nodes) {
      if (node.mesh === undefined) continue;
      const partId = node.name;
      if (!ANATOMY_DATA[partId]) continue;

      if (!partsMap[partId]) {
        const initPos = [...ANATOMY_DATA[partId].states.assembled.pos];
        const initRot = [...ANATOMY_DATA[partId].states.assembled.rot];
        partsMap[partId] = {
          id: partId,
          prims: [],
          bmin: [Infinity, Infinity, Infinity],
          bmax: [-Infinity, -Infinity, -Infinity],
          visible: true,
          dissected: false,
          curPos: initPos,
          curRot: initRot,
          targetPos: [...initPos],
          targetRot: [...initRot],
          modelMatrix: mat4Identity(),
          invModelMatrix: mat4Identity(),
        };
      }

      const partEntry = partsMap[partId];
      const meshDef = gltf.meshes[node.mesh];

      for (const prim of meshDef.primitives) {
        const posArr = getAccessorData(prim.attributes.POSITION);
        for (let i = 0; i < posArr.length; i += 3) {
          if (posArr[i] < partEntry.bmin[0]) partEntry.bmin[0] = posArr[i];
          if (posArr[i] > partEntry.bmax[0]) partEntry.bmax[0] = posArr[i];
          if (posArr[i + 1] < partEntry.bmin[1]) partEntry.bmin[1] = posArr[i + 1];
          if (posArr[i + 1] > partEntry.bmax[1]) partEntry.bmax[1] = posArr[i + 1];
          if (posArr[i + 2] < partEntry.bmin[2]) partEntry.bmin[2] = posArr[i + 2];
          if (posArr[i + 2] > partEntry.bmax[2]) partEntry.bmax[2] = posArr[i + 2];
        }

        const normArr = getAccessorData(prim.attributes.NORMAL);
        const uvArr = prim.attributes.TEXCOORD_0 !== undefined
          ? getAccessorData(prim.attributes.TEXCOORD_0)
          : new Float32Array((posArr.length / 3) * 2);
        const idxArr = getAccessorData(prim.indices);

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const uploadAttr = (loc, data, size) => {
          const buf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
        };

        uploadAttr(0, posArr, 3);
        uploadAttr(1, normArr, 3);
        uploadAttr(2, uvArr, 2);

        const ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxArr, gl.STATIC_DRAW);

        gl.bindVertexArray(null);

        // Material texture or solid baseColorFactor & roughness
        let texture = null;
        let useTexture = false;
        let baseColorFactor = [0.5, 0.5, 0.5];
        let roughness = 0.28;
        if (prim.material !== undefined) {
          const mat = gltf.materials[prim.material];
          const pbr = mat.pbrMetallicRoughness || {};
          if (pbr.roughnessFactor !== undefined) roughness = pbr.roughnessFactor;
          if (pbr.baseColorFactor !== undefined) {
            baseColorFactor = [pbr.baseColorFactor[0], pbr.baseColorFactor[1], pbr.baseColorFactor[2]];
          }
          if (pbr.baseColorTexture !== undefined) {
            const texDef = gltf.textures[pbr.baseColorTexture.index];
            texture = glTextures[texDef.source];
            useTexture = true;
          }
        }

        partEntry.prims.push({
          vao,
          indexCount: idxArr.length,
          indexType: idxArr instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
          posArr,
          idxArr,
          texture,
          useTexture,
          baseColorFactor,
          roughness,
        });
      }
    }

    return partsMap;
  }

  /* =======================================================================
     State Interpolation & Individual Forceps Dissection Logic
     ======================================================================= */
  recomputeTargetTransforms() {
    const tGlobal = this.explodePercent / 100.0; // 0 -> 1

    for (const partId of ORDERED_PART_IDS) {
      const part = this.parts[partId];
      if (!part) continue;
      const st = ANATOMY_DATA[partId].states;

      // If individually extracted via Virtual Forceps, target is its Dissection Card position
      if (part.dissected) {
        part.targetPos = [...st.tray.pos];
        part.targetRot = [...st.tray.rot];
        continue;
      }

      // Otherwise interpolate along the global Slider (0% = Assembled, 50% = Exploded 3D, 100% = Dissection Card)
      if (tGlobal <= 0.5) {
        const u = tGlobal / 0.5;
        part.targetPos = lerpVec3(st.assembled.pos, st.exploded.pos, u);
        part.targetRot = lerpVec3(st.assembled.rot, st.exploded.rot, u);
      } else {
        const u = (tGlobal - 0.5) / 0.5;
        part.targetPos = lerpVec3(st.exploded.pos, st.tray.pos, u);
        part.targetRot = lerpVec3(st.exploded.rot, st.tray.rot, u);
      }
    }
  }

  setGlobalStatePercent(pct, adjustCamera = true) {
    this.explodePercent = Math.max(0, Math.min(100, pct));
    document.getElementById("explodeSlider").value = String(this.explodePercent);
    document.getElementById("explodeValue").textContent = `${Math.round(this.explodePercent)}%`;

    document.querySelectorAll(".state-btn").forEach((btn) => {
      const btnState = Number(btn.dataset.state);
      btn.classList.toggle("active", Math.abs(btnState - this.explodePercent) < 12);
    });

    this.recomputeTargetTransforms();

    if (adjustCamera) {
      if (this.explodePercent < 25) {
        this.setCameraPreset("oblique");
      } else if (this.explodePercent < 75) {
        this.cam.targetYaw = -0.38;
        this.cam.targetPitch = 0.14;
        this.cam.targetDistance = 10.6;
        this.cam.targetCenter = [0.0, 0.25, 0.0];
      } else {
        this.cam.targetYaw = 0.0;
        this.cam.targetPitch = 0.02;
        this.cam.targetDistance = 11.4;
        this.cam.targetCenter = [0.0, -0.15, 0.0];
      }
    }
  }

  canDissectPart(partId) {
    if (partId === "Head_Capsule") {
      return { ok: false, reason: "The Head Capsule is the cranial reference base—extract the mouthparts attached to it!" };
    }
    if (!this.strictOrder) return { ok: true };

    const step = ANATOMY_DATA[partId].step;
    if (step === 2 && !this.parts.Labium?.dissected) {
      return {
        ok: false,
        reason: "Lab Protocol: Remove Step 1 (Labium / Lower Lip) first before extracting the Labrum!",
      };
    }
    if (step === 3 && (!this.parts.Labium?.dissected || !this.parts.Labrum?.dissected)) {
      return {
        ok: false,
        reason: "Lab Protocol: Remove Step 1 (Labium) and Step 2 (Labrum) before extracting the Maxillae!",
      };
    }
    if (step === 4 && (!this.parts.Maxilla_R?.dissected || !this.parts.Maxilla_L?.dissected)) {
      return {
        ok: false,
        reason: "Lab Protocol: Remove both Step 3 Maxillae before extracting the Mandibles!",
      };
    }
    if (step === 5 && (!this.parts.Mandible_R?.dissected || !this.parts.Mandible_L?.dissected)) {
      return {
        ok: false,
        reason: "Lab Protocol: Remove both Step 4 Mandibles before extracting the central Hypopharynx!",
      };
    }
    return { ok: true };
  }

  toggleDissectPart(partId) {
    const part = this.parts[partId];
    if (!part || partId === "Head_Capsule") return;

    if (!part.dissected) {
      const check = this.canDissectPart(partId);
      if (!check.ok) {
        this.showToast(check.reason);
        return;
      }
      part.dissected = true;
      this.showToast(`Extracted ${ANATOMY_DATA[partId].name} to Dissection Card`);

      // Frame camera out slightly so user sees both head and dissection tray
      if (this.cam.targetDistance < 9.5) {
        this.cam.targetDistance = 10.4;
        this.cam.targetCenter = [0.0, 0.25, 0.0];
      }
    } else {
      part.dissected = false;
      this.showToast(`Re-attached ${ANATOMY_DATA[partId].name} to Head Capsule`);
    }

    this.recomputeTargetTransforms();
    this.renderPartsListUI();
    this.selectPart(partId, false);
    this.updateDissectionProgressUI();
  }

  resetDissection() {
    for (const partId of ORDERED_PART_IDS) {
      if (this.parts[partId]) {
        this.parts[partId].dissected = false;
        this.parts[partId].visible = true;
      }
    }
    this.isolatedPartId = null;
    document.getElementById("btnIsolate").classList.remove("active");
    this.setGlobalStatePercent(0, true);
    this.renderPartsListUI();
    this.selectPart(this.selectedPartId, false);
    this.updateDissectionProgressUI();
    this.showToast("Reset all mouthparts to Intact Head position.");
  }

  updateDissectionProgressUI() {
    const dissectableIds = ORDERED_PART_IDS.filter((id) => id !== "Head_Capsule");
    const extractedCount = dissectableIds.filter((id) => this.parts[id]?.dissected).length;
    const pct = (extractedCount / dissectableIds.length) * 100;

    document.getElementById("dissectionProgressFill").style.width = `${pct}%`;
    document.getElementById("dissectionProgressText").textContent = `${extractedCount} / ${dissectableIds.length} Mouthpieces Extracted`;

    const promptEl = document.getElementById("guidedPrompt");
    if (!this.parts.Labium?.dissected) {
      promptEl.innerHTML = `<strong>Next Step (1/5):</strong> Extract the <strong>Labium</strong> (posterior lower lip &amp; 3-segmented palps).`;
    } else if (!this.parts.Labrum?.dissected) {
      promptEl.innerHTML = `<strong>Next Step (2/5):</strong> Extract the <strong>Labrum</strong> (anterior upper lip hinged to the clypeus).`;
    } else if (!this.parts.Maxilla_R?.dissected || !this.parts.Maxilla_L?.dissected) {
      promptEl.innerHTML = `<strong>Next Step (3/5):</strong> Extract both <strong>Right &amp; Left Maxillae</strong> (with their 5-segmented palps).`;
    } else if (!this.parts.Mandible_R?.dissected || !this.parts.Mandible_L?.dissected) {
      promptEl.innerHTML = `<strong>Next Step (4/5):</strong> Extract both <strong>Right &amp; Left Mandibles</strong> (heavy chewing jaws).`;
    } else if (!this.parts.Hypopharynx?.dissected) {
      promptEl.innerHTML = `<strong>Final Step (5/5):</strong> Extract the central <strong>Hypopharynx</strong> (median tongue inside the preoral cavity).`;
    } else {
      promptEl.innerHTML = `<strong>Dissection Complete!</strong> All 7 mouthpieces are arranged on the Dissection Card. Click any piece to inspect its sub-structures.`;
    }
  }

  /* =======================================================================
     Exact 3D Ray-Triangle Intersection for Sub-Millimeter Mouse Picking
     ======================================================================= */
  castRay(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2.0 - 1.0;
    const ndcY = 1.0 - ((clientY - rect.top) / rect.height) * 2.0;

    if (!this.invViewProjMatrix) return null;

    const nearPt = transformPoint(this.invViewProjMatrix, [ndcX, ndcY, -1.0]);
    const farPt = transformPoint(this.invViewProjMatrix, [ndcX, ndcY, 1.0]);
    const rayWorldOrigin = nearPt;
    const rayWorldDir = vec3Normalize(vec3Sub(farPt, nearPt));

    let closestPartId = null;
    let closestT = Infinity;

    for (const partId of this.getActiveOrderedIds()) {
      const part = this.parts[partId];
      if (!part || !part.visible) continue;
      if (this.isolatedPartId && this.isolatedPartId !== partId) continue;

      // Transform ray into object's local coordinate space
      const localOrigin = transformPoint(part.invModelMatrix, rayWorldOrigin);
      const localEnd = transformPoint(part.invModelMatrix, vec3Add(rayWorldOrigin, rayWorldDir));
      const localDir = vec3Normalize(vec3Sub(localEnd, localOrigin));

      // Fast Ray-AABB bounding box test first
      if (!this.rayIntersectsAABB(localOrigin, localDir, part.bmin, part.bmax)) continue;

      // Exact Möller–Trumbore ray-triangle test
      for (const prim of part.prims) {
        const pos = prim.posArr;
        const idx = prim.idxArr;
        for (let i = 0; i < idx.length; i += 3) {
          const i0 = idx[i] * 3, i1 = idx[i + 1] * 3, i2 = idx[i + 2] * 3;
          const v0 = [pos[i0], pos[i0 + 1], pos[i0 + 2]];
          const v1 = [pos[i1], pos[i1 + 1], pos[i1 + 2]];
          const v2 = [pos[i2], pos[i2 + 1], pos[i2 + 2]];

          const tLocal = this.rayTriangleIntersect(localOrigin, localDir, v0, v1, v2);
          if (tLocal !== null && tLocal > 0) {
            const hitLocal = vec3Add(localOrigin, vec3Scale(localDir, tLocal));
            const hitWorld = transformPoint(part.modelMatrix, hitLocal);
            const worldDist = Math.hypot(
              hitWorld[0] - rayWorldOrigin[0],
              hitWorld[1] - rayWorldOrigin[1],
              hitWorld[2] - rayWorldOrigin[2]
            );
            if (worldDist < closestT) {
              closestT = worldDist;
              closestPartId = partId;
            }
          }
        }
      }
    }

    return closestPartId;
  }

  rayIntersectsAABB(orig, dir, bmin, bmax) {
    let tmin = -Infinity, tmax = Infinity;
    for (let a = 0; a < 3; a++) {
      const invD = 1.0 / (Math.abs(dir[a]) > 1e-8 ? dir[a] : 1e-8);
      let t0 = (bmin[a] - orig[a]) * invD;
      let t1 = (bmax[a] - orig[a]) * invD;
      if (t0 > t1) { const tmp = t0; t0 = t1; t1 = tmp; }
      tmin = Math.max(tmin, t0);
      tmax = Math.min(tmax, t1);
      if (tmax < tmin) return false;
    }
    return tmax >= 0;
  }

  rayTriangleIntersect(orig, dir, v0, v1, v2) {
    const EPS = 1e-7;
    const edge1 = vec3Sub(v1, v0);
    const edge2 = vec3Sub(v2, v0);
    const h = vec3Cross(dir, edge2);
    const a = vec3Dot(edge1, h);
    if (a > -EPS && a < EPS) return null;
    const f = 1.0 / a;
    const s = vec3Sub(orig, v0);
    const u = f * vec3Dot(s, h);
    if (u < 0.0 || u > 1.0) return null;
    const q = vec3Cross(s, edge1);
    const v = f * vec3Dot(dir, q);
    if (v < 0.0 || u + v > 1.0) return null;
    const t = f * vec3Dot(edge2, q);
    return t > EPS ? t : null;
  }

  /* =======================================================================
     UI Rendering & Event Bindings
     ======================================================================= */
  renderPartsListUI() {
    const container = document.getElementById("partsList");
    container.innerHTML = "";
    const anatomyData = this.getActiveAnatomyData();
    const orderedIds = this.getActiveOrderedIds();
    const isMusca = this.activeSpecies === "musca";

    for (const partId of orderedIds) {
      const meta = anatomyData[partId];
      const part = this.parts[partId];
      if (!part || !meta) continue;

      const row = document.createElement("div");
      row.className = `part-item${this.selectedPartId === partId ? " selected" : ""}${part.dissected ? " dissected" : ""}`;
      row.setAttribute("role", "listitem");

      const stepSymbol = meta.step === 0 ? "H" : String(meta.step);
      const canExtract = !isMusca && partId !== "Head_Capsule";

      row.innerHTML = `
        <div class="part-left">
          <div class="part-step-dot">${stepSymbol}</div>
          <div class="part-info-col">
            <div class="part-name">${meta.name}</div>
            <div class="part-sub">${part.dissected ? "✓ Extracted to Card" : meta.shortSub}</div>
          </div>
        </div>
        <div class="part-actions">
          ${
            canExtract
              ? `<button class="icon-btn ${part.dissected ? "active-dissect" : ""}" data-action="dissect" title="${
                  part.dissected ? "Re-attach to Head Capsule" : "Extract with Forceps"
                }">🥢</button>`
              : ""
          }
          <button class="icon-btn ${part.visible ? "" : "hidden-part"}" data-action="visibility" title="Toggle 3D Visibility">
            ${part.visible ? "👁" : "🚫"}
          </button>
        </div>
      `;

      row.addEventListener("click", (e) => {
        const actionBtn = e.target.closest("[data-action]");
        if (actionBtn) {
          e.stopPropagation();
          const act = actionBtn.dataset.action;
          if (act === "dissect") {
            this.toggleDissectPart(partId);
          } else if (act === "visibility") {
            part.visible = !part.visible;
            this.renderPartsListUI();
          }
          return;
        }
        this.selectPart(partId, false);
      });

      container.appendChild(row);
    }
  }

  selectPart(partId, focusCamera = false) {
    const anatomyData = this.getActiveAnatomyData();
    if (!anatomyData[partId]) return;
    this.selectedPartId = partId;
    this.activeSubStructureIdx = null;
    const meta = anatomyData[partId];
    const part = this.parts[partId];
    const isMusca = this.activeSpecies === "musca";

    this.renderPartsListUI();

    document.getElementById("inspStepBadge").textContent = meta.stepLabel;
    const statusBadge = document.getElementById("inspStatusBadge");
    if (isMusca) {
      statusBadge.textContent = "3D Inspection";
      statusBadge.className = "status-badge";
    } else if (partId === "Head_Capsule") {
      statusBadge.textContent = "Cranial Base";
      statusBadge.className = "status-badge";
    } else if (part?.dissected) {
      statusBadge.textContent = "Extracted on Card";
      statusBadge.className = "status-badge extracted";
    } else {
      statusBadge.textContent = "Attached on Head";
      statusBadge.className = "status-badge";
    }

    document.getElementById("inspTitle").textContent = meta.name;
    document.getElementById("inspSubtitle").textContent = meta.subtitle;
    document.getElementById("inspImage").src = meta.sprite;
    document.getElementById("inspImage").alt = meta.name;
    document.getElementById("inspPosition").textContent = meta.position;
    document.getElementById("inspFunction").textContent = meta.function;
    document.getElementById("inspInstruction").textContent = meta.instruction;

    const btnDissect = document.getElementById("btnToggleDissectSelected");
    if (isMusca || partId === "Head_Capsule") {
      btnDissect.style.display = "none";
    } else {
      btnDissect.style.display = "inline-block";
      if (part?.dissected) {
        btnDissect.textContent = "↩ Re-Attach to Head";
        btnDissect.classList.add("reattach");
      } else {
        btnDissect.textContent = "🥢 Extract with Forceps";
        btnDissect.classList.remove("reattach");
      }
    }

    // Populate Sub-Structures list
    const subList = document.getElementById("inspSubStructures");
    subList.innerHTML = "";
    meta.subStructures.forEach((sub, idx) => {
      const li = document.createElement("li");
      li.className = "substructure-item";
      li.innerHTML = `<strong>${sub.name}</strong><span>${sub.detail}</span>`;
      li.addEventListener("click", () => {
        this.activeSubStructureIdx = idx;
        subList.querySelectorAll(".substructure-item").forEach((el, i) => {
          el.classList.toggle("active", i === idx);
        });
        this.focusOnSubStructure(partId, idx);
      });
      subList.appendChild(li);
    });

    if (focusCamera) {
      this.focusCameraOnPart(partId);
    }
  }

  focusCameraOnPart(partId) {
    const part = this.parts[partId];
    if (!part) return;
    if (this.activeSpecies === "musca") {
      const cx = 0.5 * (part.bmin[0] + part.bmax[0]);
      const cy = 0.5 * (part.bmin[1] + part.bmax[1]);
      const cz = 0.5 * (part.bmin[2] + part.bmax[2]);
      this.cam.targetCenter = [cx, cy, cz];
      this.cam.targetDistance = partId === "Musca_Cranium_Group" ? 6.2 : 3.8;
    } else {
      this.cam.targetCenter = [...part.curPos];
      this.cam.targetDistance = partId === "Head_Capsule" ? 5.8 : 3.4;
    }
    this.cam.targetYaw = -0.25;
    this.cam.targetPitch = 0.10;
  }

  focusOnSubStructure(partId, subIdx) {
    const part = this.parts[partId];
    const sub = this.getActiveAnatomyData()[partId]?.subStructures[subIdx];
    if (!part || !sub) return;
    const worldPt = transformPoint(part.modelMatrix, sub.localPos);
    this.cam.targetCenter = worldPt;
    this.cam.targetDistance = 2.8;
  }

  setCameraPreset(preset) {
    document.querySelectorAll(".cam-btn[data-cam]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.cam === preset);
    });

    const isMusca = this.activeSpecies === "musca";
    const isSpread = !isMusca && (this.explodePercent >= 30 || Object.values(this.parts).some((p) => p.dissected));
    const baseDist = isMusca ? 7.4 : isSpread ? 10.5 : 6.4;
    const baseCenter = isMusca ? [0.0, 0.25, 0.0] : isSpread ? [0.0, 0.25, 0.0] : [0.0, 1.45, 0.0];

    if (preset === "front") {
      this.cam.targetYaw = 0.0;
      this.cam.targetPitch = 0.02;
      this.cam.targetDistance = baseDist;
      this.cam.targetCenter = baseCenter;
    } else if (preset === "oblique") {
      this.cam.targetYaw = -0.45;
      this.cam.targetPitch = 0.16;
      this.cam.targetDistance = baseDist;
      this.cam.targetCenter = baseCenter;
    } else if (preset === "side") {
      this.cam.targetYaw = -1.32;
      this.cam.targetPitch = 0.08;
      this.cam.targetDistance = isMusca ? 7.6 : isSpread ? 10.2 : 6.2;
      this.cam.targetCenter = baseCenter;
    } else if (preset === "ventral") {
      this.cam.targetYaw = -0.15;
      this.cam.targetPitch = -0.82;
      this.cam.targetDistance = isMusca ? 5.6 : isSpread ? 9.5 : 5.6;
      this.cam.targetCenter = isMusca ? [0.0, -0.95, 0.25] : isSpread ? [0.0, -0.2, 0.0] : [0.0, 1.0, 0.0];
    }
  }

  setToolMode(mode) {
    this.toolMode = mode;
    document.querySelectorAll(".tool-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tool === mode);
    });
    this.canvas.classList.toggle("forceps-cursor", mode === "forceps");

    const quizBanner = document.getElementById("quizBanner");
    if (mode === "quiz") {
      quizBanner.hidden = false;
      this.updateQuizUI();
    } else {
      quizBanner.hidden = true;
    }
  }

  updateQuizUI() {
    const questions = this.getActiveQuizQuestions();
    const q = questions[this.quizIndex % questions.length];
    document.getElementById("quizQuestion").textContent = q.prompt;
    document.getElementById("quizScore").textContent = `Score: ${this.quizCorrect} / ${this.quizTotal}`;
    document.getElementById("quizFeedback").textContent = "";
  }

  handleQuizClick(partId) {
    const questions = this.getActiveQuizQuestions();
    const anatomyData = this.getActiveAnatomyData();
    const q = questions[this.quizIndex % questions.length];
    const fb = document.getElementById("quizFeedback");
    this.quizTotal++;

    if (q.targets.includes(partId)) {
      this.quizCorrect++;
      fb.style.color = "#10b981";
      fb.textContent = `✓ ${q.explanation}`;
      this.selectPart(partId, false);
      setTimeout(() => {
        this.quizIndex = (this.quizIndex + 1) % questions.length;
        this.updateQuizUI();
      }, 1500);
    } else {
      fb.style.color = "#f43f5e";
      fb.textContent = `✗ That is the ${anatomyData[partId].name}. Try again!`;
    }
    document.getElementById("quizScore").textContent = `Score: ${this.quizCorrect} / ${this.quizTotal}`;
  }

  showToast(msg) {
    const banner = document.getElementById("toastBanner");
    banner.textContent = msg;
    banner.hidden = false;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      banner.hidden = true;
    }, 3200);
  }

  bindUIEvents() {
    // State Preset Buttons & Slider
    document.querySelectorAll(".state-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = Number(btn.dataset.state);
        // Clear individual dissected overrides when switching global preset
        for (const p of Object.values(this.parts)) p.dissected = val === 100 && p.id !== "Head_Capsule";
        this.setGlobalStatePercent(val, true);
        this.renderPartsListUI();
        this.updateDissectionProgressUI();
      });
    });

    document.getElementById("explodeSlider").addEventListener("input", (e) => {
      const val = Number(e.target.value);
      for (const p of Object.values(this.parts)) p.dissected = false;
      this.setGlobalStatePercent(val, false);
      this.renderPartsListUI();
    });

    // Tool Mode Switcher
    document.querySelectorAll(".tool-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.setToolMode(btn.dataset.tool));
    });

    // Strict Order & Reset
    document.getElementById("chkStrictOrder").addEventListener("change", (e) => {
      this.strictOrder = e.target.checked;
    });

    document.getElementById("btnResetDissection").addEventListener("click", () => this.resetDissection());

    // Display Toggles
    document.getElementById("chkLabels").addEventListener("change", (e) => {
      this.showLabels = e.target.checked;
    });
    document.getElementById("chkSubPins").addEventListener("change", (e) => {
      this.showSubPins = e.target.checked;
    });
    document.getElementById("chkGhostHead").addEventListener("change", (e) => {
      this.ghostHead = e.target.checked;
    });
    document.getElementById("chkWireframe").addEventListener("change", (e) => {
      this.showWireframe = e.target.checked;
    });
    document.getElementById("depthScaleSlider").addEventListener("input", (e) => {
      this.depthScale = Number(e.target.value) / 100.0;
      document.getElementById("depthScaleVal").textContent = `${this.depthScale.toFixed(2)}×`;
    });

    // Camera Presets
    document.querySelectorAll(".cam-btn[data-cam]").forEach((btn) => {
      btn.addEventListener("click", () => this.setCameraPreset(btn.dataset.cam));
    });

    document.getElementById("btnIsolate").addEventListener("click", (e) => {
      if (this.isolatedPartId === this.selectedPartId) {
        this.isolatedPartId = null;
        e.currentTarget.classList.remove("active");
        this.setCameraPreset("oblique");
      } else {
        this.isolatedPartId = this.selectedPartId;
        e.currentTarget.classList.add("active");
        this.focusCameraOnPart(this.selectedPartId);
      }
    });

    document.getElementById("btnResetCam").addEventListener("click", () => {
      this.isolatedPartId = null;
      document.getElementById("btnIsolate").classList.remove("active");
      this.setCameraPreset("oblique");
    });

    // Inspector Actions
    document.getElementById("btnToggleDissectSelected").addEventListener("click", () => {
      this.toggleDissectPart(this.selectedPartId);
    });
    document.getElementById("btnFocusSelected").addEventListener("click", () => {
      this.focusCameraOnPart(this.selectedPartId);
    });

    // Quiz Next
    document.getElementById("btnNextQuiz").addEventListener("click", () => {
      const questions = this.getActiveQuizQuestions();
      this.quizIndex = (this.quizIndex + 1) % questions.length;
      this.updateQuizUI();
    });
  }

  bindCanvasEvents() {
    let isDragging = false;
    let isPanning = false;
    let downX = 0, downY = 0;
    let lastX = 0, lastY = 0;

    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    this.canvas.addEventListener("pointerdown", (e) => {
      isDragging = true;
      isPanning = e.button === 2 || e.shiftKey;
      downX = lastX = e.clientX;
      downY = lastY = e.clientY;
      this.canvas.setPointerCapture(e.pointerId);
    });

    this.canvas.addEventListener("pointermove", (e) => {
      if (!isDragging) {
        const hit = this.castRay(e.clientX, e.clientY);
        this.hoveredPartId = hit;
        return;
      }

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      if (isPanning) {
        const panScale = this.cam.distance * 0.0014;
        const right = [Math.cos(this.cam.yaw), 0, -Math.sin(this.cam.yaw)];
        this.cam.targetCenter[0] -= right[0] * dx * panScale;
        this.cam.targetCenter[2] -= right[2] * dx * panScale;
        this.cam.targetCenter[1] += dy * panScale;
      } else {
        this.cam.targetYaw -= dx * 0.0065;
        this.cam.targetPitch = Math.max(-1.45, Math.min(1.45, this.cam.targetPitch + dy * 0.0065));
      }
    });

    this.canvas.addEventListener("pointerup", (e) => {
      if (!isDragging) return;
      isDragging = false;
      this.canvas.releasePointerCapture(e.pointerId);

      const moveDist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moveDist < 5 && e.button === 0) {
        const hitPartId = this.castRay(e.clientX, e.clientY);
        if (hitPartId) {
          if (this.toolMode === "quiz") {
            this.handleQuizClick(hitPartId);
          } else if (this.toolMode === "forceps") {
            this.selectPart(hitPartId, false);
            this.toggleDissectPart(hitPartId);
          } else {
            this.selectPart(hitPartId, false);
          }
        }
      }
    });

    this.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const factor = Math.exp(e.deltaY * 0.0012);
        this.cam.targetDistance = Math.max(1.8, Math.min(22.0, this.cam.targetDistance * factor));
      },
      { passive: false }
    );
  }

  /* =======================================================================
     60fps Render Loop & 3D-to-2D Label Projection
     ======================================================================= */
  animate() {
    this.updatePhysicsAndCamera();
    this.renderWebGL();
    this.update3DOverlayPins();
    requestAnimationFrame(() => this.animate());
  }

  updatePhysicsAndCamera() {
    // Smooth camera damping
    const damp = 0.14;
    this.cam.yaw = lerp(this.cam.yaw, this.cam.targetYaw, damp);
    this.cam.pitch = lerp(this.cam.pitch, this.cam.targetPitch, damp);
    this.cam.distance = lerp(this.cam.distance, this.cam.targetDistance, damp);
    this.cam.target = lerpVec3(this.cam.target, this.cam.targetCenter, damp);

    // Smooth part position/rotation interpolation
    const orderedIds = this.getActiveOrderedIds();
    const isMusca = this.activeSpecies === "musca";
    for (const partId of orderedIds) {
      const part = this.parts[partId];
      if (!part) continue;
      part.curPos = lerpVec3(part.curPos, part.targetPos, 0.14);
      part.curRot = lerpVec3(part.curRot, part.targetRot, 0.14);
      part.modelMatrix = mat4FromTRS(part.curPos, part.curRot, [1.0, 1.0, isMusca ? 1.0 : this.depthScale]);
      part.invModelMatrix = mat4InvertRigidOrScaled(part.modelMatrix);
    }
  }

  renderWebGL() {
    const gl = this.gl;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(this.canvas.clientWidth * dpr);
    const h = Math.floor(this.canvas.clientHeight * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    gl.viewport(0, 0, w, h);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const aspect = w / Math.max(1, h);
    const proj = mat4Perspective((38 * Math.PI) / 180, aspect, 0.1, 100.0);

    const cx = this.cam.target[0] - Math.sin(this.cam.yaw) * Math.cos(this.cam.pitch) * this.cam.distance;
    const cy = this.cam.target[1] + Math.sin(this.cam.pitch) * this.cam.distance;
    const cz = this.cam.target[2] + Math.cos(this.cam.yaw) * Math.cos(this.cam.pitch) * this.cam.distance;
    this.camEye = [cx, cy, cz];

    const view = mat4LookAt(this.camEye, this.cam.target, [0, 1, 0]);
    this.viewProjMatrix = mat4Multiply(proj, view);
    this.invViewProjMatrix = mat4InvertRigidOrScaled(this.viewProjMatrix);

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.uniforms.uViewProj, false, this.viewProjMatrix);
    gl.uniform3fv(this.uniforms.uCamPos, this.camEye);

    const headId = this.activeSpecies === "musca" ? "Musca_Cranium_Group" : "Head_Capsule";
    // Draw opaque parts first, then translucent Ghost Head if enabled
    const drawOrder = this.getActiveOrderedIds().slice().sort((a, b) => {
      if (this.ghostHead && a === headId) return 1;
      if (this.ghostHead && b === headId) return -1;
      return 0;
    });

    for (const partId of drawOrder) {
      const part = this.parts[partId];
      if (!part || !part.visible) continue;
      if (this.isolatedPartId && this.isolatedPartId !== partId) continue;

      const isGhost = this.ghostHead && partId === headId;
      if (isGhost) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
      } else {
        gl.disable(gl.BLEND);
        gl.depthMask(true);
      }

      let highlight = 0;
      if (this.selectedPartId === partId) highlight = 2;
      else if (this.hoveredPartId === partId) highlight = 1;

      gl.uniformMatrix4fv(this.uniforms.uModel, false, part.modelMatrix);
      gl.uniform1f(this.uniforms.uAlpha, isGhost ? 0.26 : 1.0);
      gl.uniform1i(this.uniforms.uHighlightState, highlight);
      gl.uniform1i(this.uniforms.uWireframePass, 0);

      for (const prim of part.prims) {
        if (prim.useTexture && prim.texture) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, prim.texture);
          gl.uniform1i(this.uniforms.uBaseTex, 0);
          gl.uniform1i(this.uniforms.uUseTexture, 1);
        } else {
          gl.uniform1i(this.uniforms.uUseTexture, 0);
          gl.uniform3fv(this.uniforms.uBaseColorFactor, prim.baseColorFactor);
        }
        gl.uniform1f(this.uniforms.uRoughness, prim.roughness);

        gl.bindVertexArray(prim.vao);
        gl.drawElements(gl.TRIANGLES, prim.indexCount, prim.indexType, 0);

        if (this.showWireframe) {
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          gl.uniform1i(this.uniforms.uWireframePass, 1);
          gl.drawElements(gl.LINES, prim.indexCount, prim.indexType, 0);
          gl.uniform1i(this.uniforms.uWireframePass, 0);
          if (!isGhost) gl.disable(gl.BLEND);
        }
      }
    }

    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }

  projectToScreen(worldPt) {
    const m = this.viewProjMatrix;
    const x = worldPt[0], y = worldPt[1], z = worldPt[2];
    const w = m[3] * x + m[7] * y + m[11] * z + m[15];
    if (w <= 0.05) return null;
    const ndcX = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    const ndcY = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    if (ndcX < -1.1 || ndcX > 1.1 || ndcY < -1.1 || ndcY > 1.1) return null;

    const cw = this.canvas.clientWidth;
    const ch = this.canvas.clientHeight;
    return [((ndcX + 1.0) * 0.5) * cw, ((1.0 - ndcY) * 0.5) * ch];
  }

  update3DOverlayPins() {
    const overlay = document.getElementById("labelsOverlay");
    overlay.innerHTML = "";
    const anatomyData = this.getActiveAnatomyData();
    const orderedIds = this.getActiveOrderedIds();

    if (this.showLabels && this.toolMode !== "quiz") {
      for (const partId of orderedIds) {
        const part = this.parts[partId];
        if (!part || !part.visible) continue;
        if (this.isolatedPartId && this.isolatedPartId !== partId) continue;

        const meta = anatomyData[partId];
        if (!meta) continue;
        const worldAnchor = transformPoint(part.modelMatrix, meta.pinLocal);
        const screenPt = this.projectToScreen(worldAnchor);
        if (!screenPt) continue;

        const pin = document.createElement("button");
        pin.type = "button";
        pin.className = `callout-pin${this.selectedPartId === partId ? " selected" : ""}`;
        pin.style.left = `${screenPt[0]}px`;
        pin.style.top = `${screenPt[1]}px`;
        pin.innerHTML = `<span class="pin-dot"></span><span>${meta.name.split(" (")[0]}</span>`;
        pin.addEventListener("click", (e) => {
          e.stopPropagation();
          if (this.toolMode === "forceps") {
            this.selectPart(partId, false);
            this.toggleDissectPart(partId);
          } else {
            this.selectPart(partId, false);
          }
        });
        overlay.appendChild(pin);
      }
    }

    // Sub-structure markers for the currently selected structure
    if (this.showSubPins && this.selectedPartId && this.toolMode !== "quiz") {
      const part = this.parts[this.selectedPartId];
      const meta = anatomyData[this.selectedPartId];
      if (part && part.visible && meta) {
        meta.subStructures.forEach((sub, idx) => {
          if (this.activeSubStructureIdx !== null && this.activeSubStructureIdx !== idx) return;
          const worldPt = transformPoint(part.modelMatrix, sub.localPos);
          const screenPt = this.projectToScreen(worldPt);
          if (!screenPt) return;

          const tag = document.createElement("div");
          tag.className = "sub-pin";
          tag.style.left = `${screenPt[0]}px`;
          tag.style.top = `${screenPt[1]}px`;
          tag.textContent = `• ${sub.name}`;
          overlay.appendChild(tag);
        });
      }
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new GrasshopperDissectionApp();
});
