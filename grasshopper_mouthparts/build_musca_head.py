"""
Blender 5.3 script to process the high-resolution Musca domestica (Housefly) head STL,
segment it into anatomical structures, apply realistic Musca domestica PBR coloration,
and export a web-ready GLB + native .blend + preview renders & inspector thumbnails.

Source STL attribution:
  "Housefly head (Musca domestica)" by Make_it_Visible (Sketchfab, CC BY-NC-SA 4.0)
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(BASE_DIR)
TEX_DIR = os.path.join(BASE_DIR, "textures")
STL_PATH = os.path.join(REPO_ROOT, "!Fly_head_compound_eye scaled at 10cm width.stl")


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def make_pbr_mat(name, rgba, roughness=0.35, specular=0.65, coat=0.15, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = rgba
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = specular
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = coat
        bsdf.inputs["Coat Roughness"].default_value = 0.16
    return mat


def create_collection(name, parent=None):
    col = bpy.data.collections.new(name)
    if parent is None:
        bpy.context.scene.collection.children.link(col)
    else:
        parent.children.link(col)
    return col


def link_exclusive(obj, col):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    col.objects.link(obj)


def classify_mesh_faces(obj):
    """
    Classifies every face of the decimated Musca domestica head into:
      0: Musca_Cranium_Group (sub-material 0: Silvery-grey parafrontalia/genae)
      1: Musca_Cranium_Group (sub-material 1: Velvet-black frontal vitta)
      2: Musca_Cranium_Group (sub-material 2: Dark charcoal occiput & neck)
      3: Musca_Compound_Eyes (deep glossy brick-red faceted eyes)
      4: Musca_Antennae      (dark chitinous paired flagellomeres)
      5: Musca_Rostrum_Haustellum (dark amber-brown proboscis shaft & rostrum)
      6: Musca_Labellum      (warm ochre-brown terminal sponging pad)
    """
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.faces.ensure_lookup_table()
    bm.verts.ensure_lookup_table()

    # Compute local normal variation per face to detect sculpted ommatidia facets!
    face_roughness = [0.0] * len(bm.faces)
    for f in bm.faces:
        n = f.normal
        # Gather neighbor face normals across edges
        diffs = []
        for e in f.edges:
            for nf in e.link_faces:
                if nf is not f:
                    diffs.append(1.0 - max(-1.0, min(1.0, n.dot(nf.normal))))
        face_roughness[f.index] = sum(diffs) / max(1, len(diffs))

    # Smooth the roughness field over 3 graph-diffusion passes so facet bumps form solid eye islands
    smooth_r = list(face_roughness)
    for _ in range(4):
        nxt = [0.0] * len(bm.faces)
        for f in bm.faces:
            vals = [smooth_r[f.index]]
            for e in f.edges:
                for nf in e.link_faces:
                    if nf is not f:
                        vals.append(smooth_r[nf.index])
            nxt[f.index] = sum(vals) / len(vals)
        smooth_r = nxt

    # Initial eye mask: faces inside lateral ocular hemispheres with elevated facet roughness
    eye_mask = [False] * len(bm.faces)
    for f in bm.faces:
        c = f.calc_center_median()
        ax = abs(c.x)
        # Spatial envelope for the two huge lateral compound eyes of Musca domestica
        in_eye_zone = (
            ax > 0.36
            and c.z > -0.35
            and c.z < 2.38
            and c.y < 1.38
            # Exclude the anterior antennal depression & lower cheek margin
            and not (ax < 0.72 and c.y < -0.65 and c.z < 1.45)
            and not (c.z < 0.25 and ax < 1.20)
        )
        if in_eye_zone and smooth_r[f.index] > 0.032:
            eye_mask[f.index] = True

    # Morphological closing (2 dilations + 2 erosions) to fill any tiny smooth gaps inside the eyes
    for _ in range(3):
        dil = list(eye_mask)
        for f in bm.faces:
            if not eye_mask[f.index]:
                c = f.calc_center_median()
                if abs(c.x) > 0.38 and c.z > -0.30 and c.y < 1.35:
                    cnt = sum(1 for e in f.edges for nf in e.link_faces if nf is not f and eye_mask[nf.index])
                    if cnt >= 2:
                        dil[f.index] = True
        eye_mask = dil

    for _ in range(2):
        ero = list(eye_mask)
        for f in bm.faces:
            if eye_mask[f.index]:
                cnt = sum(1 for e in f.edges for nf in e.link_faces if nf is not f and eye_mask[nf.index])
                if cnt < 2:
                    ero[f.index] = False
        eye_mask = ero

    # Keep ONLY the 2 largest connected components (Left & Right compound eyes) to eliminate any stray cheek specks!
    visited = [False] * len(bm.faces)
    components = []
    for f in bm.faces:
        if eye_mask[f.index] and not visited[f.index]:
            comp = []
            stack = [f]
            visited[f.index] = True
            while stack:
                cur = stack.pop()
                comp.append(cur.index)
                for e in cur.edges:
                    for nf in e.link_faces:
                        if eye_mask[nf.index] and not visited[nf.index]:
                            visited[nf.index] = True
                            stack.append(nf)
            components.append(comp)
    components.sort(key=len, reverse=True)
    clean_eye_mask = [False] * len(bm.faces)
    for comp in components[:2]:
        for idx in comp:
            clean_eye_mask[idx] = True
    eye_mask = clean_eye_mask

    # Classify every face into anatomical groups
    labels = [0] * len(bm.faces)
    for f in bm.faces:
        c = f.calc_center_median()
        idx = f.index

        # 1. Proboscis — Labellum (distal bilobed sponging pad)
        if c.z < -1.52 and c.y < 0.15 and -0.75 < c.x < 0.35:
            labels[idx] = 6
            continue

        # 2. Proboscis — Rostrum & Haustellum (basal cone & middle shaft)
        if c.z < -0.68 and c.y < 0.35 and -0.85 < c.x < 0.50:
            labels[idx] = 5
            continue

        # 3. Paired Aristate Antennae (protruding forward in the central antennal fossa)
        if (-0.42 < c.x < 0.36) and (0.68 < c.z < 1.85) and (c.y < -1.24):
            labels[idx] = 4
            continue

        # 4. Compound Eyes
        if eye_mask[idx]:
            labels[idx] = 3
            continue

        # 5. Cranium sub-regions (all stay in Musca_Cranium_Group with distinct realistic materials)
        # Velvet-black median frontal vitta running vertically between the compound eyes
        if abs(c.x + 0.04) < 0.34 and c.z > 1.15 and c.y < 0.95:
            labels[idx] = 1
        # Dark charcoal-slate occiput / posterior vault & neck base
        elif c.y > 0.72 or (c.z < -0.45 and c.y > 0.20):
            labels[idx] = 2
        # Silvery-grey pollinose parafrontalia, facial ridges & genae
        else:
            labels[idx] = 0

    bm.free()
    return labels


def extract_part_mesh(src_obj, name, face_indices, mat_map, sub_labels, collection):
    bm_src = bmesh.new()
    bm_src.from_mesh(src_obj.data)
    bm_src.faces.ensure_lookup_table()

    keep_set = set(face_indices)
    del_faces = [f for f in bm_src.faces if f.index not in keep_set]
    bmesh.ops.delete(bm_src, geom=del_faces, context='FACES')

    # Clean up loose verts/edges
    loose_verts = [v for v in bm_src.verts if not v.link_faces]
    if loose_verts:
        bmesh.ops.delete(bm_src, geom=loose_verts, context='VERTS')

    # Assign material indices
    mesh = bpy.data.meshes.new(name)
    bm_src.to_mesh(mesh)
    bm_src.free()

    # Map sub_labels in exact order of remaining faces
    kept_labels = [sub_labels[i] for i in sorted(keep_set)]
    unique_mats = sorted(set(kept_labels))
    mat_idx_lookup = {lbl: i for i, lbl in enumerate(unique_mats)}

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    link_exclusive(obj, collection)

    for lbl in unique_mats:
        obj.data.materials.append(mat_map[lbl])

    for poly, lbl in zip(mesh.polygons, kept_labels):
        poly.material_index = mat_idx_lookup[lbl]
        poly.use_smooth = True

    return obj


def setup_studio(scene):
    world = bpy.data.worlds.new("MuscaStudio")
    scene.world = world
    bg = world.node_tree.nodes.get("Background")
    bg.inputs[0].default_value = (0.14, 0.16, 0.20, 1.0)
    bg.inputs[1].default_value = 0.85

    lights = [
        ("Key", (-4.0, -6.5, 4.5), 360.0, (1.0, 0.98, 0.95), 6.0),
        ("Fill", (4.5, -5.5, 1.5), 220.0, (0.94, 0.97, 1.0), 7.0),
        ("Rim", (0.0, 6.0, 3.5), 260.0, (0.98, 0.95, 1.0), 6.0),
        ("BottomFill", (0.0, -5.0, -4.5), 140.0, (1.0, 0.96, 0.92), 5.0),
    ]
    for name, loc, en, col, sz in lights:
        ld = bpy.data.lights.new(name, 'AREA')
        ld.energy = en
        ld.size = sz
        ld.color = col
        lo = bpy.data.objects.new(name, ld)
        bpy.context.collection.objects.link(lo)
        lo.location = Vector(loc)
        lo.rotation_euler = (Vector((0, 0, 0)) - lo.location).to_track_quat('-Z', 'Y').to_euler()

    cd = bpy.data.cameras.new("Cam")
    cd.lens = 50.0
    cam = bpy.data.objects.new("Cam", cd)
    bpy.context.collection.objects.link(cam)
    scene.camera = cam
    return cam


def look_at(cam, target):
    cam.rotation_euler = (Vector(target) - cam.location).to_track_quat('-Z', 'Y').to_euler()


def main():
    scene = reset_scene()

    print(f"Importing STL: {STL_PATH}")
    bpy.ops.wm.stl_import(filepath=STL_PATH)
    src = [o for o in bpy.context.scene.objects if o.type == 'MESH'][0]

    # Orient upright: Face -> -Y, Dorsal -> +Z, Proboscis -> -Z
    src.rotation_euler = (math.pi / 2.0, 0.0, 0.0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

    # Center & scale width to 4.6 Blender units (matches Grasshopper scene scale)
    bb = [Vector(c) for c in src.bound_box]
    xs = [v.x for v in bb]; ys = [v.y for v in bb]; zs = [v.z for v in bb]
    cx, cy, cz = (min(xs)+max(xs))/2, (min(ys)+max(ys))/2, (min(zs)+max(zs))/2
    scale = 4.6 / (max(xs) - min(xs))
    src.location = (-cx * scale, -cy * scale, -cz * scale)
    src.scale = (scale, scale, scale)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)

    # Decimate cleanly from ~1.0M faces to ~72k faces (preserves ommatidia facets + fast WebGL2!)
    mod = src.modifiers.new("WebDecimate", 'DECIMATE')
    mod.ratio = 0.072
    bpy.ops.object.modifier_apply(modifier="WebDecimate")
    print(f"Decimated mesh: verts={len(src.data.vertices)}, polys={len(src.data.polygons)}")

    # Classify faces into realistic Musca domestica anatomical zones
    labels = classify_mesh_faces(src)

    # Realistic Musca domestica PBR materials (linear sRGB converted nicely by Blender)
    mat_map = {
        # Silvery-grey pollinose parafrontalia, facialia & genae
        0: make_pbr_mat("Mat_Musca_PollinoseGrey", (0.16, 0.165, 0.175, 1.0), roughness=0.48, specular=0.55, coat=0.10, metallic=0.06),
        # Velvet-black median frontal vitta between the eyes
        1: make_pbr_mat("Mat_Musca_FrontalVitta", (0.025, 0.022, 0.024, 1.0), roughness=0.62, specular=0.35, coat=0.05),
        # Dark charcoal-slate occiput & postgenal vault
        2: make_pbr_mat("Mat_Musca_OcciputDark", (0.075, 0.080, 0.090, 1.0), roughness=0.44, specular=0.55, coat=0.10),
        # Deep glossy brick-red / burgundy-red compound eyes (signature Musca domestica eye color!)
        3: make_pbr_mat("Mat_Musca_CompoundEyes", (0.24, 0.024, 0.015, 1.0), roughness=0.18, specular=0.88, coat=0.55),
        # Dark brownish-black chitinous antennae (postpedicel & arista base)
        4: make_pbr_mat("Mat_Musca_Antennae", (0.045, 0.032, 0.026, 1.0), roughness=0.36, specular=0.60, coat=0.18),
        # Dark amber-brown sclerotized rostrum & haustellum shaft
        5: make_pbr_mat("Mat_Musca_RostrumHaustellum", (0.11, 0.055, 0.032, 1.0), roughness=0.30, specular=0.72, coat=0.28),
        # Warm fleshy ochre-brown bilobed sponging labellum
        6: make_pbr_mat("Mat_Musca_Labellum", (0.26, 0.13, 0.068, 1.0), roughness=0.36, specular=0.65, coat=0.25),
    }

    root_col = create_collection("Musca_Domestica_Head_3D")
    groups = {
        "Musca_Cranium_Group":      [i for i, l in enumerate(labels) if l in (0, 1, 2)],
        "Musca_Compound_Eyes":      [i for i, l in enumerate(labels) if l == 3],
        "Musca_Antennae":           [i for i, l in enumerate(labels) if l == 4],
        "Musca_Rostrum_Haustellum": [i for i, l in enumerate(labels) if l == 5],
        "Musca_Labellum":           [i for i, l in enumerate(labels) if l == 6],
    }

    part_objs = {}
    for gname, f_idxs in groups.items():
        if not f_idxs:
            print(f"WARNING: {gname} has 0 faces!")
            continue
        pobj = extract_part_mesh(src, gname, f_idxs, mat_map, labels, root_col)
        part_objs[gname] = pobj
        print(f"Built {gname:26s}: verts={len(pobj.data.vertices):5d}, faces={len(pobj.data.polygons):5d}")

    # Remove original unsegmented STL mesh
    bpy.data.objects.remove(src, do_unlink=True)

    # Save native .blend
    blend_path = os.path.join(BASE_DIR, "musca_domestica_head.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved {blend_path}")

    # Export web-ready GLB
    glb_path = os.path.join(BASE_DIR, "musca_domestica_head.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        export_apply=True,
        export_animations=False
    )
    print(f"Exported {glb_path} ({os.path.getsize(glb_path) / (1024*1024):.2f} MB)")

    # Render preview images + transparent cutout thumbnails for the Inspector UI
    cam = setup_studio(scene)
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 24
    scene.render.resolution_x = 640
    scene.render.resolution_y = 640
    scene.render.image_settings.file_format = 'PNG'

    # 1. Front 3/4 preview
    cam.location = Vector((-3.2, -7.8, 1.4))
    look_at(cam, (0.0, 0.0, 0.0))
    scene.render.filepath = os.path.join(BASE_DIR, "render_musca_oblique.png")
    bpy.ops.render.render(write_still=True)

    # 2. Direct Front preview
    cam.location = Vector((0.0, -8.2, 0.1))
    look_at(cam, (0.0, 0.0, 0.0))
    scene.render.filepath = os.path.join(BASE_DIR, "render_musca_front.png")
    bpy.ops.render.render(write_still=True)

    # 3. Side profile preview (shows proboscis & compound eye dome)
    cam.location = Vector((8.2, -0.5, 0.0))
    look_at(cam, (0.0, 0.0, 0.0))
    scene.render.filepath = os.path.join(BASE_DIR, "render_musca_side.png")
    bpy.ops.render.render(write_still=True)

    # 4. Transparent cutout thumbnails for Inspector panel (256x256)
    scene.render.film_transparent = True
    scene.render.resolution_x = 256
    scene.render.resolution_y = 256
    scene.cycles.samples = 16

    thumb_views = {
        "Musca_Cranium_Group":      (Vector((-2.6, -7.5, 1.2)), (0.0, 0.0, 0.2)),
        "Musca_Compound_Eyes":      (Vector((-2.8, -7.2, 1.0)), (0.0, 0.0, 0.8)),
        "Musca_Antennae":           (Vector((0.0, -4.6, 0.9)),  (0.0, -1.2, 0.95)),
        "Musca_Rostrum_Haustellum": (Vector((3.4, -3.4, -1.1)), (-0.15, -0.5, -1.15)),
        "Musca_Labellum":           (Vector((2.8, -3.2, -2.0)), (-0.2, -1.0, -2.05)),
    }

    for gname, (cloc, ctgt) in thumb_views.items():
        for k, o in part_objs.items():
            o.hide_render = (k != gname)
        cam.location = cloc
        look_at(cam, ctgt)
        scene.render.filepath = os.path.join(TEX_DIR, f"{gname}_rgba.png")
        bpy.ops.render.render(write_still=True)
        print(f"Rendered thumbnail {gname}_rgba.png")


if __name__ == "__main__":
    main()
