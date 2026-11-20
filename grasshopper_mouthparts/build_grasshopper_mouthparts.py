"""
Blender 5.3 script to reconstruct a watertight, segmented, photorealistic 3D model
of the Grasshopper Head & Mouthparts directly from the user's dissected specimen photo.

Generates:
1. grasshopper_mouthparts.blend  (Native Blender file with Collections, PBR UV-textured materials & keyframes)
   - Frame 1:   Assembled / Intact anatomical state (mouthparts nested on head capsule in 3D layers)
   - Frame 50:  Exploded 3D anatomical layers view (separated front-to-back & radially)
   - Frame 100: Laboratory Dissection Card layout (exact match to reference photo layout)
2. grasshopper_mouthparts.glb    (Web-ready glTF 2.0 binary with embedded textures & animations)
3. Preview renders (Cycles CPU):
   - render_dissection_card.png  (Frame 100 front view matching reference photo)
   - render_exploded_3d.png      (Frame 50 angled 3D perspective showing volumetric depth & layers)
   - render_intact_head.png      (Frame 1 assembled head + mouthparts view)
"""

import bpy
import bmesh
import os
import json
import math
import numpy as np
from mathutils import Vector, Euler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEX_DIR = os.path.join(BASE_DIR, "textures")

# Scale factor: 100 pixels in reference image = 1.0 Blender unit (so 652x784 image is ~6.52 x 7.84 units)
PX_SCALE = 0.01


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = 100
    scene.frame_set(100)
    return scene


def create_collection(name, parent=None):
    col = bpy.data.collections.new(name)
    if parent is None:
        bpy.context.scene.collection.children.link(col)
    else:
        parent.children.link(col)
    return col


def link_exclusive(obj, target_col):
    for col in list(obj.users_collection):
        col.objects.unlink(obj)
    target_col.objects.link(obj)


def create_textured_chitin_material(name, tex_path, roughness=0.26, specular=0.75, coat=0.35):
    """
    Creates a Principled BSDF material using the edge-dilated specimen photo texture
    for Base Color and also feeding a Bump node for subtle 3D chitin surface micro-sculpture.
    """
    mat = bpy.data.materials.new(name=name)
    tree = mat.node_tree
    nodes = tree.nodes
    links = tree.links
    nodes.clear()

    out_node = nodes.new(type="ShaderNodeOutputMaterial")
    out_node.location = (500, 0)

    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (180, 0)
    bsdf.inputs["Roughness"].default_value = roughness
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = specular
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = coat
        bsdf.inputs["Coat Roughness"].default_value = 0.15

    tex_node = nodes.new(type="ShaderNodeTexImage")
    tex_node.location = (-420, 100)
    img = bpy.data.images.load(tex_path, check_existing=True)
    tex_node.image = img
    tex_node.extension = 'EXTEND'

    # Bump from texture luminance for realistic pitted chitin sheen
    rgb2bw = nodes.new(type="ShaderNodeRGBToBW")
    rgb2bw.location = (-140, -160)

    bump_node = nodes.new(type="ShaderNodeBump")
    bump_node.location = (0, -160)
    bump_node.inputs["Strength"].default_value = 0.18
    bump_node.inputs["Distance"].default_value = 0.015

    links.new(tex_node.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(tex_node.outputs["Color"], rgb2bw.inputs["Color"])
    links.new(rgb2bw.outputs["Val"], bump_node.inputs["Height"])
    links.new(bump_node.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs["BSDF"], out_node.inputs["Surface"])

    return mat


def compute_anatomical_profile(part_name, u_norm, v_norm, d_px, d_cran_px=0.0):
    """
    Returns (ly_front, ly_back) in Blender units at normalized crop coordinates:
      u_norm in [0, 1] (left to right across piece)
      v_norm in [0, 1] (top to bottom across piece)
      d_px: exact pixel distance from silhouette boundary (100 px = 1.0 Blender unit)
      d_cran_px: for Head_Capsule, exact pixel distance from the oval cranium boundary (excluding antennae)
    Using physical distance d_units = d_px * PX_SCALE ensures that thin cylindrical appendages
    (antennae, maxillary palps, labial palps, submental horns) have circular 3D cross-sections (depth == width),
    while the large head cranium has full deep 3D cranial volume!
    """
    d_units = d_px * PX_SCALE

    # Smooth finite-slope dome function: avoids infinite derivative at boundary (t -> 0)
    # so perimeter quads never stretch 1 pixel of texture horizontally across a vertical cliff!
    def rounded_thickness(d_u, max_radius):
        if d_u <= 0.0:
            return 0.008
        t = min(1.0, d_u / max(0.01, max_radius))
        return 0.008 + max_radius * math.sin(math.pow(t, 0.76) * (math.pi * 0.5))

    if part_name == "Head_Capsule":
        center_dist = abs(u_norm - 0.5)
        d_cran_u = d_cran_px * PX_SCALE
        if d_cran_u > 0.0:
            # Cranium max radius is ~0.97 Blender units (width ~ 2.12 units, height ~ 2.50 units)
            t_cran = min(1.0, d_cran_u / 0.97)
            e_cran = math.sin(math.pow(t_cran, 0.76) * (math.pi * 0.5))

            # Compound eye 3D dorsolateral bulge
            eye_bulge = 0.0
            if 0.085 < center_dist < 0.165 and 0.10 < v_norm < 0.58:
                ex = math.sin((center_dist - 0.085) / 0.080 * math.pi)
                ez = math.sin((v_norm - 0.10) / 0.48 * math.pi)
                eye_bulge = 0.20 * ex * ez

            # Frontal ridge (costa) prominence along the midline
            frontal_ridge = 0.10 * max(0.0, 1.0 - center_dist / 0.045) * math.sin(v_norm * math.pi * 0.9)

            # Base plane where antennae & lateral cheek seams sit: Y = -0.35
            # Front face (-Y) bulges forward to Y = -1.15
            ly_front = -0.35 - (0.72 * e_cran + eye_bulge + frontal_ridge)

            # Back cranial vault (+Y: vertex, occiput & postgenae) extends deeply back to Y = +1.35
            # Total front-to-back 3D depth of the head capsule = ~2.50 Blender units
            neck_recess = 1.0 - 0.30 * max(0.0, (v_norm - 0.76) / 0.24)
            ly_back = -0.35 + (1.70 * e_cran * neck_recess)
            return ly_front, ly_back
        else:
            # Filiform antennae: true circular 3D cross-section (max radius ~ 0.085 units)
            ant_t = max(0.0, (center_dist - 0.16) / 0.34)
            ant_camber = -0.38 - 0.26 * math.sin(ant_t * math.pi * 0.55)
            ant_rad = rounded_thickness(d_units, max_radius=0.085)
            return ant_camber - ant_rad, ant_camber + ant_rad

    elif part_name == "Labrum":
        # Sleek concavo-convex domed chitin shield (matches low-profile shell seen in specimen video)
        half_t = rounded_thickness(d_units, max_radius=0.11)
        arch = math.sin(u_norm * math.pi) * math.sin(v_norm * math.pi)
        camber = -0.24 * arch
        return camber - half_t * 0.75, camber + half_t * 0.45

    elif part_name in ("Mandible_R", "Mandible_L"):
        # Stout, heavily volumetric 3D pyramidal chewing jaws (tallest relief in specimen video)
        is_right_mand = (part_name == "Mandible_R")
        inner_factor = u_norm if is_right_mand else (1.0 - u_norm)
        # Sharp taper from thick outer condylar base to sculpted medial incisor/molar cutting edge
        chisel = 1.0 - 0.72 * max(0.0, (inner_factor - 0.42) / 0.58)
        condyle_bulge = 0.14 * max(0.0, 1.0 - inner_factor / 0.55) * math.sin(v_norm * math.pi)
        half_t = rounded_thickness(d_units, max_radius=0.52) * chisel + condyle_bulge
        camber = -0.08 * math.sin(u_norm * math.pi)
        return camber - half_t, camber + half_t

    elif part_name in ("Maxilla_R", "Maxilla_L"):
        # Compact 3D stipes/galea body (r~0.20) with slender cylindrical 5-segmented palps
        # that curve anteriorly out of the flat plane as seen in the tilted specimen video
        half_t = rounded_thickness(d_units, max_radius=0.20)
        is_right_max = (part_name == "Maxilla_R")
        palp_dist = max(0.0, (0.50 - u_norm) / 0.50) if is_right_max else max(0.0, (u_norm - 0.50) / 0.50)
        palp_arc = -0.22 * (palp_dist ** 1.35)
        body_camber = -0.06 * math.sin(v_norm * math.pi)
        camber = body_camber + palp_arc
        return camber - half_t, camber + half_t

    elif part_name == "Labium":
        # Thinner dorsal submental plate (v_norm < 0.45), rounded cupped prementum/paraglossae,
        # and slightly forward-curving 3-segmented labial palps
        submentum_taper = 0.58 + 0.42 * min(1.0, max(0.0, (v_norm - 0.25) / 0.35))
        half_t = rounded_thickness(d_units, max_radius=0.22) * submentum_taper
        arch = math.sin(u_norm * math.pi) * math.sin(v_norm * math.pi)
        lat_dist = max(0.0, (abs(u_norm - 0.5) - 0.22) / 0.28)
        palp_lift = -0.14 * (lat_dist ** 1.4) * max(0.0, (v_norm - 0.45) / 0.55)
        camber = +0.16 * arch + palp_lift
        return camber - half_t * 0.78, camber + half_t

    return -rounded_thickness(d_units, 0.22), +rounded_thickness(d_units, 0.22)


def build_watertight_photo_mesh(part_name, part_info, img_w, img_h, step=2, smooth_iters=4, collection=None, material=None):
    """
    Constructs a closed, manifold, smooth 3D mesh from the binary mask and smooth distance field
    of a segmented specimen part, with exact UV mapping to the edge-dilated specimen texture.
    """
    mask_full = np.load(os.path.join(TEX_DIR, f"{part_name}_mask.npy"))
    dist_full = np.load(os.path.join(TEX_DIR, f"{part_name}_dist.npy"))
    crop_h, crop_w = mask_full.shape
    max_dist = max(1.0, float(np.max(dist_full)))

    if part_name == "Head_Capsule":
        cran_dist_full = np.load(os.path.join(TEX_DIR, "Head_Capsule_cranium_dist.npy"))
        max_cran_dist = max(1.0, float(np.max(cran_dist_full)))
    else:
        cran_dist_full = None
        max_cran_dist = 1.0

    # Subsample onto grid of step pixels
    ys = np.arange(0, crop_h, step)
    xs = np.arange(0, crop_w, step)
    gh, gw = len(ys), len(xs)

    mask_g = mask_full[np.ix_(ys, xs)]
    dist_g = dist_full[np.ix_(ys, xs)]
    cran_g = cran_dist_full[np.ix_(ys, xs)] if cran_dist_full is not None else None

    # Active cells (r, c) where all 4 corner vertices are inside the mask
    cell_active = (
        mask_g[:-1, :-1] &
        mask_g[1:, :-1] &
        mask_g[1:, 1:] &
        mask_g[:-1, 1:]
    )

    bm = bmesh.new()
    v_front = {}
    v_back = {}

    # Local coordinates centered at (crop_w/2, crop_h/2)
    half_w = 0.5 * crop_w
    half_h = 0.5 * crop_h

    # Create front and back vertices for all corners of active cells
    used_corners = np.zeros((gh, gw), dtype=bool)
    used_corners[:-1, :-1] |= cell_active
    used_corners[1:, :-1] |= cell_active
    used_corners[1:, 1:] |= cell_active
    used_corners[:-1, 1:] |= cell_active

    rs, cs = np.where(used_corners)
    for r, c in zip(rs, cs):
        px = float(xs[c])
        py = float(ys[r])
        u_norm = px / max(1.0, crop_w - 1.0)
        v_norm = py / max(1.0, crop_h - 1.0)
        d_px = float(dist_g[r, c])
        d_cran_px = float(cran_g[r, c]) if cran_g is not None else 0.0

        ly_front, ly_back = compute_anatomical_profile(part_name, u_norm, v_norm, d_px, d_cran_px)

        # Local X (right), Y (depth: -Y is front, +Y is back), Z (up)
        lx = (px - half_w) * PX_SCALE
        lz = -(py - half_h) * PX_SCALE

        v_front[(r, c)] = bm.verts.new((lx, ly_front, lz))
        v_back[(r, c)] = bm.verts.new((lx, ly_back, lz))

    # Add Front and Back quad faces, and perimeter Side-Wall quad faces
    cell_rs, cell_cs = np.where(cell_active)
    for r, c in zip(cell_rs, cell_cs):
        # Corners: p00=(r,c) top-left, p10=(r+1,c) bottom-left, p11=(r+1,c+1) bottom-right, p01=(r,c+1) top-right
        p00 = (r, c)
        p10 = (r + 1, c)
        p11 = (r + 1, c + 1)
        p01 = (r, c + 1)

        # Front face (normal points toward -Y: counter-clockwise when viewed from -Y)
        f_front = bm.faces.new((v_front[p00], v_front[p10], v_front[p11], v_front[p01]))
        f_front.material_index = 0

        # Back face (normal points toward +Y: reverse winding)
        f_back = bm.faces.new((v_back[p00], v_back[p01], v_back[p11], v_back[p10]))
        f_back.material_index = 1 if part_name == "Head_Capsule" else 0

        # Check 4 neighbor cells to bridge perimeter boundary edges
        side_mat = 1 if part_name == "Head_Capsule" else 0
        if r == 0 or not cell_active[r - 1, c]:
            f_s = bm.faces.new((v_front[p01], v_back[p01], v_back[p00], v_front[p00]))
            f_s.material_index = side_mat
        if r + 1 == gh - 1 or not cell_active[r + 1, c]:
            f_s = bm.faces.new((v_front[p10], v_back[p10], v_back[p11], v_front[p11]))
            f_s.material_index = side_mat
        if c == 0 or not cell_active[r, c - 1]:
            f_s = bm.faces.new((v_front[p00], v_back[p00], v_back[p10], v_front[p10]))
            f_s.material_index = side_mat
        if c + 1 == gw - 1 or not cell_active[r, c + 1]:
            f_s = bm.faces.new((v_front[p11], v_back[p11], v_back[p01], v_front[p01]))
            f_s.material_index = side_mat

    # Smooth vertex positions so pixel staircases become silky-smooth organic curves
    for _ in range(smooth_iters):
        bmesh.ops.smooth_vert(
            bm,
            verts=bm.verts,
            factor=0.5,
            use_axis_x=True,
            use_axis_y=True,
            use_axis_z=True
        )

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    # Assign UV coordinates from smoothed (lx, ly, lz) -> (u, v)
    uv_layer = bm.loops.layers.uv.new("UVMap")
    inv_w = 1.0 / (crop_w * PX_SCALE)
    inv_h = 1.0 / (crop_h * PX_SCALE)
    for face in bm.faces:
        is_head_back = (part_name == "Head_Capsule" and face.material_index == 1)
        for loop in face.loops:
            co = loop.vert.co
            if is_head_back and abs(co.x) < 1.15:
                # Smoothly vary u with both X and depth Y across the dark-chitin back texture so side walls never streak
                u = ((co.x * 0.45 + (co.y + 0.35) * 0.32) * inv_w) + 0.5
                v = ((co.z * 0.65) * inv_h) + 0.48
            else:
                u = (co.x * inv_w) + 0.5
                v = (co.z * inv_h) + 0.5
            loop[uv_layer].uv = (max(0.002, min(0.998, u)), max(0.002, min(0.998, v)))

    mesh = bpy.data.meshes.new(part_name)
    bm.to_mesh(mesh)
    bm.free()

    for poly in mesh.polygons:
        poly.use_smooth = True

    obj = bpy.data.objects.new(part_name, mesh)
    bpy.context.collection.objects.link(obj)
    if collection:
        link_exclusive(obj, collection)
    if material:
        obj.data.materials.append(material)
    if part_name == "Head_Capsule":
        back_tex_path = os.path.join(TEX_DIR, "Head_Capsule_back_tex.png")
        mat_back = create_textured_chitin_material("Mat_Head_Capsule_Back", back_tex_path, roughness=0.28, specular=0.75, coat=0.35)
        obj.data.materials.append(mat_back)

    # Compute world position in Reference Photo Dissection Layout (Frame 100)
    cx_px, cy_px = part_info["center_px"]
    world_x = (cx_px - 0.5 * img_w) * PX_SCALE
    world_z = -(cy_px - 0.5 * img_h) * PX_SCALE
    obj.location = Vector((world_x, 0.0, world_z))

    return obj


def build_hypopharynx(col):
    """
    Builds a sculpted, UV-mapped, textured median tongue-like Hypopharynx matching the compact,
    slender, slightly curved specimen seen in the dissection slide video.
    """
    bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=20, radius=1.0, location=(0, 0, 0))
    hypo = bpy.context.active_object
    hypo.name = "Hypopharynx"
    hypo.scale = (0.17, 0.12, 0.34)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Sculpt organic slender tongue profile: small flared suspensorial base, slender curved mid-body, tapered apex
    for v in hypo.data.vertices:
        t = (v.co.z + 0.34) / 0.68  # 0 at bottom apex, 1 at top suspensorium
        # Gentle taper toward ventral apex + subtle dorsal suspensorial flare
        base_flare = 0.25 * max(0.0, (t - 0.72) / 0.28)
        taper = 0.55 + 0.48 * math.sin(t * math.pi * 0.88) + base_flare
        v.co.x *= taper
        v.co.y *= (0.65 + 0.35 * math.sin(t * math.pi))
        # Subtle anterior tongue arch (-Y)
        v.co.y -= 0.07 * math.sin(t * math.pi)

    for poly in hypo.data.polygons:
        poly.use_smooth = True
    link_exclusive(hypo, col)

    hypo_tex = os.path.join(TEX_DIR, "Hypopharynx_tex.png")
    mat = create_textured_chitin_material("Mat_Hypopharynx", hypo_tex, roughness=0.34, specular=0.65, coat=0.25)
    hypo.data.materials.append(mat)
    return hypo


def animate_dissection_states(objs, meta):
    """
    Keyframes 3 educational states:
      - Frame 1 (Assembled / Intact Head State):
        All mouthparts nested in their true anterior-to-posterior 3D anatomical order
        on the lower oral rim of the Head Capsule.
      - Frame 50 (Exploded 3D Layers State):
        Separated along the anterior-posterior Y axis and radially in X/Z for 3D orbital inspection.
      - Frame 100 (Laboratory Dissection Card Layout):
        Exact match to the user's dissected specimen reference photograph!
    """
    img_w = meta["image_width"]
    img_h = meta["image_height"]

    def px_to_vec(px_x, px_y, depth_y=0.0):
        return Vector(((px_x - 0.5 * img_w) * PX_SCALE, depth_y, -(px_y - 0.5 * img_h) * PX_SCALE))

    # Head Capsule stays stationary at its top-center reference position across all frames
    head_obj = objs["Head_Capsule"]
    head_loc = head_obj.location.copy()
    for fr in (1, 50, 100):
        bpy.context.scene.frame_set(fr)
        head_obj.location = head_loc
        head_obj.keyframe_insert(data_path="location", frame=fr)

    # Oral rim center of Head Capsule in image pixels is roughly (x=325, y=275)
    # Because Head_Capsule now spans Y from -1.18 (anterior face) to +1.48 (posterior occiput),
    # at Frame 1 (Assembled), the mouthparts nest across the full 3D depth underneath the head!
    configs = {
        "Labrum": {
            # Step 2 (Anterior-most): hinges from anterior clypeus rim at Y = -0.82
            # Dissection Card (Frame 100): Top-Center of mouthpieces (matching video slide layout)
            "f1_loc": px_to_vec(325, 308, -0.82),
            "f1_rot": Euler((0.08, 0.0, 0.0)),
            "f50_loc": px_to_vec(175, 565, -1.55),
            "f50_rot": Euler((-0.22, 0.18, 0.0)),
            "f100_loc": Vector((0.0, 0.0, -0.05)),
        },
        "Mandible_R": {
            # Step 4 (Viewer's left, behind Labrum at Y = -0.36)
            # Dissection Card (Frame 100): Top-Left of mouthpieces (matching video slide layout)
            "f1_loc": px_to_vec(290, 296, -0.36),
            "f1_rot": Euler((0.0, 0.08, 0.0)),
            "f50_loc": px_to_vec(245, 405, -0.75),
            "f50_rot": Euler((0.0, 0.25, 0.05)),
            "f100_loc": Vector((-1.85, 0.0, -0.15)),
        },
        "Mandible_L": {
            # Step 4 (Viewer's right, behind Labrum at Y = -0.32)
            # Dissection Card (Frame 100): Top-Right of mouthpieces (matching video slide layout)
            "f1_loc": px_to_vec(360, 296, -0.32),
            "f1_rot": Euler((0.0, -0.08, 0.0)),
            "f50_loc": px_to_vec(405, 405, -0.75),
            "f50_rot": Euler((0.0, -0.25, -0.05)),
            "f100_loc": Vector((1.85, 0.0, -0.15)),
        },
        "Maxilla_R": {
            # Step 3 (Viewer's left, behind Mandible_R at Y = +0.22)
            # Dissection Card (Frame 100): Bottom-Left of mouthpieces (matching video slide layout)
            "f1_loc": px_to_vec(252, 305, 0.22),
            "f1_rot": Euler((0.0, 0.05, 0.0)),
            "f50_loc": px_to_vec(95, 355, 0.35),
            "f50_rot": Euler((0.0, 0.28, 0.0)),
            "f100_loc": Vector((-2.10, 0.0, -2.20)),
        },
        "Maxilla_L": {
            # Step 3 (Viewer's right, behind Mandible_L at Y = +0.22)
            # Dissection Card (Frame 100): Bottom-Right of mouthpieces (matching video slide layout)
            "f1_loc": px_to_vec(398, 305, 0.22),
            "f1_rot": Euler((0.0, -0.05, 0.0)),
            "f50_loc": px_to_vec(565, 355, 0.35),
            "f50_rot": Euler((0.0, -0.28, 0.0)),
            "f100_loc": Vector((2.10, 0.0, -2.20)),
        },
        "Labium": {
            # Step 1 of Dissection (Posterior lower lip closing the preoral cavity at Y = +0.72)
            # Dissection Card (Frame 100): Bottom-Center of mouthpieces, paraglossae/palps up (matching video)
            "f1_loc": px_to_vec(325, 296, 0.72),
            "f1_rot": Euler((-0.06, 0.0, 0.0)),
            "f50_loc": px_to_vec(465, 595, 1.15),
            "f50_rot": Euler((0.18, -0.15, 0.0)),
            "f100_loc": Vector((0.0, 0.0, -2.55)),
            "f100_rot": Euler((0.0, math.pi, 0.0)),
        },
        "Hypopharynx": {
            # Step 5 of Dissection (Central median tongue inside the preoral cavity at Y = +0.34)
            # Dissection Card (Frame 100): Center, tucked directly below Labrum & above Labium (matching video)
            "f1_loc": px_to_vec(325, 292, 0.34),
            "f1_rot": Euler((0.0, 0.0, 0.0)),
            "f50_loc": px_to_vec(325, 515, 0.45),
            "f50_rot": Euler((-0.12, 0.0, 0.0)),
            "f100_loc": Vector((0.0, 0.0, -0.98)),
        },
    }

    for name, cfg in configs.items():
        obj = objs[name]
        # Frame 100 location & rotation match the video's Dissection Card layout
        f100_loc = cfg.get("f100_loc", obj.location.copy())
        f100_rot = cfg.get("f100_rot", Euler((0.0, 0.0, 0.0)))

        # Frame 1 (Assembled on Head)
        bpy.context.scene.frame_set(1)
        obj.location = cfg["f1_loc"]
        obj.rotation_euler = cfg["f1_rot"]
        obj.keyframe_insert(data_path="location", frame=1)
        obj.keyframe_insert(data_path="rotation_euler", frame=1)

        # Frame 50 (Exploded 3D Layers)
        bpy.context.scene.frame_set(50)
        obj.location = cfg["f50_loc"]
        obj.rotation_euler = cfg["f50_rot"]
        obj.keyframe_insert(data_path="location", frame=50)
        obj.keyframe_insert(data_path="rotation_euler", frame=50)

        # Frame 100 (Exact Reference Photo Layout)
        bpy.context.scene.frame_set(100)
        obj.location = f100_loc
        obj.rotation_euler = f100_rot
        obj.keyframe_insert(data_path="location", frame=100)
        obj.keyframe_insert(data_path="rotation_euler", frame=100)


def setup_lighting_and_camera():
    scene = bpy.context.scene

    world = bpy.data.worlds.new("DissectionWorld")
    scene.world = world
    bg = world.node_tree.nodes.get("Background")
    if bg:
        # Warm neutral laboratory background matching the specimen aesthetics
        bg.inputs[0].default_value = (0.52, 0.45, 0.47, 1.0)
        bg.inputs[1].default_value = 0.95

    # Key Light (Front-Left-Top)
    key_data = bpy.data.lights.new(name="Key_Light", type='AREA')
    key_data.energy = 320.0
    key_data.size = 8.0
    key_data.color = (1.0, 0.98, 0.96)
    key_obj = bpy.data.objects.new(name="Key_Light", object_data=key_data)
    bpy.context.collection.objects.link(key_obj)
    key_obj.location = (-3.5, -8.5, 3.5)
    key_obj.rotation_euler = (math.radians(68), 0, math.radians(-22))

    # Fill Light (Front-Right)
    fill_data = bpy.data.lights.new(name="Fill_Light", type='AREA')
    fill_data.energy = 210.0
    fill_data.size = 9.0
    fill_data.color = (0.96, 0.98, 1.0)
    fill_obj = bpy.data.objects.new(name="Fill_Light", object_data=fill_data)
    bpy.context.collection.objects.link(fill_obj)
    fill_obj.location = (4.5, -8.0, 1.0)
    fill_obj.rotation_euler = (math.radians(80), 0, math.radians(28))

    # Back Rim Light (to highlight 3D edges)
    rim_data = bpy.data.lights.new(name="Rim_Light", type='AREA')
    rim_data.energy = 180.0
    rim_data.size = 7.0
    rim_obj = bpy.data.objects.new(name="Rim_Light", object_data=rim_data)
    bpy.context.collection.objects.link(rim_obj)
    rim_obj.location = (0.0, 5.5, 3.0)
    rim_obj.rotation_euler = (math.radians(-115), 0, 0)

    cam_data = bpy.data.cameras.new(name="Dissection_Camera")
    cam_data.lens = 50.0
    cam_obj = bpy.data.objects.new(name="Dissection_Camera", object_data=cam_data)
    bpy.context.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    return cam_obj


def look_at(cam_obj, target_pt):
    direction = Vector(target_pt) - cam_obj.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()


def main():
    scene = reset_scene()

    with open(os.path.join(TEX_DIR, "parts_meta.json"), "r") as f:
        meta = json.load(f)

    img_w = meta["image_width"]
    img_h = meta["image_height"]

    # Create organized Collections in Blender Outliner matching the 5-step Dissection Order
    root_col = create_collection("Grasshopper_Mouthparts_3D")
    cols = {
        "Head_Capsule": create_collection("00_Head_Capsule", root_col),
        "Labium":       create_collection("01_Labium", root_col),
        "Labrum":       create_collection("02_Labrum", root_col),
        "Maxillae":     create_collection("03_Maxillae", root_col),
        "Mandibles":    create_collection("04_Mandibles", root_col),
        "Hypopharynx":  create_collection("05_Hypopharynx", root_col),
    }

    part_to_col = {
        "Head_Capsule": cols["Head_Capsule"],
        "Labium":       cols["Labium"],
        "Labrum":       cols["Labrum"],
        "Maxilla_R":    cols["Maxillae"],
        "Maxilla_L":    cols["Maxillae"],
        "Mandible_R":   cols["Mandibles"],
        "Mandible_L":   cols["Mandibles"],
    }

    objs = {}
    for part_name, part_info in meta["parts"].items():
        local_tex_path = os.path.join(TEX_DIR, os.path.basename(part_info["tex_path"]))
        mat = create_textured_chitin_material(
            f"Mat_{part_name}",
            local_tex_path,
            roughness=0.22 if part_name in ("Labrum", "Mandible_R", "Mandible_L") else 0.28,
            specular=0.80,
            coat=0.40
        )
        step = 2
        obj = build_watertight_photo_mesh(
            part_name,
            part_info,
            img_w,
            img_h,
            step=step,
            smooth_iters=4,
            collection=part_to_col[part_name],
            material=mat
        )
        objs[part_name] = obj
        print(f"Built 3D mesh {part_name:14s}: verts={len(obj.data.vertices)}, faces={len(obj.data.polygons)}")

    objs["Hypopharynx"] = build_hypopharynx(cols["Hypopharynx"])
    print(f"Built 3D mesh Hypopharynx   : verts={len(objs['Hypopharynx'].data.vertices)}, faces={len(objs['Hypopharynx'].data.polygons)}")

    # Keyframe Frame 1 (Assembled), Frame 50 (Exploded 3D), Frame 100 (Reference Dissection Card Layout)
    animate_dissection_states(objs, meta)

    cam = setup_lighting_and_camera()

    # Save .blend at Frame 100 (Dissection Layout matching the video, ready to scrub to Frame 50 or Frame 1)
    scene.frame_set(100)
    cam.location = Vector((0.0, -11.6, -0.15))
    look_at(cam, (0.0, 0.0, -0.15))

    blend_path = os.path.join(BASE_DIR, "grasshopper_mouthparts.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved Blender file to {blend_path}")

    # Export glTF 2.0 (.glb)
    glb_path = os.path.join(BASE_DIR, "grasshopper_mouthparts.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        export_apply=True,
        export_animations=True
    )
    print(f"Exported GLB to {glb_path}")

    # Render updated preview images (Dissection Card + Low-Angle 3D Relief view)
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 24
    scene.render.resolution_x = 640
    scene.render.resolution_y = 720
    scene.render.image_settings.file_format = 'PNG'

    scene.frame_set(100)
    cam.location = Vector((0.0, -11.6, -0.15))
    look_at(cam, (0.0, 0.0, -0.15))
    scene.render.filepath = os.path.join(BASE_DIR, "render_dissection_card.png")
    bpy.ops.render.render(write_still=True)
    print("Rendered render_dissection_card.png")

    cam.location = Vector((5.8, -8.8, -3.6))
    look_at(cam, (0.0, 0.0, -1.0))
    scene.render.filepath = os.path.join(BASE_DIR, "render_side_profile.png")
    bpy.ops.render.render(write_still=True)
    print("Rendered render_side_profile.png")


if __name__ == "__main__":
    main()
