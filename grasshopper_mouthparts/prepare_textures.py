"""
Extracts the 7 anatomical components from reference_mouthparts.png:
  - Head_Capsule (with compound eyes, frons, genae, clypeus, antennae)
  - Maxilla_R (viewer's left)
  - Maxilla_L (viewer's right)
  - Mandible_R (viewer's left)
  - Mandible_L (viewer's right)
  - Labrum (bottom left)
  - Labium (bottom right)

Produces for each component in ./textures/:
  - {name}_tex.png   : Edge-dilated RGB texture (prevents background halo on 3D curved borders)
  - {name}_rgba.png  : Clean RGBA cutout sprite
  - {name}_mask.npy  : Binary silhouette mask
  - {name}_dist.npy  : Smooth normalized distance field for 3D volumetric inflation
  - parts_meta.json  : Exact pixel bounding boxes and centroids in the reference image
"""

import os
import json
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

BASE_DIR = "/Users/jacquesolivier/.gemini/antigravity/scratch/grasshopper_mouthparts_3d"
REF_IMG_PATH = os.path.join(BASE_DIR, "reference_mouthparts.png")
TEX_DIR = os.path.join(BASE_DIR, "textures")
os.makedirs(TEX_DIR, exist_ok=True)


def compute_background_model(arr):
    H, W, _ = arr.shape
    fg_rough = np.zeros((H, W), dtype=bool)
    boxes = [
        (0, 652, 50, 312),    # Head + antennae
        (35, 185, 270, 430),  # Maxilla_R (viewer left)
        (490, 620, 270, 430), # Maxilla_L (viewer right)
        (205, 318, 330, 465), # Mandible_R (viewer left)
        (322, 442, 325, 468), # Mandible_L (viewer right)
        (145, 288, 515, 612), # Labrum
        (340, 520, 468, 725), # Labium
        (20, 125, 240, 282),  # Text 'Maxilla'
        (195, 335, 466, 508), # Text 'Mandibles'
        (140, 260, 612, 658), # Text 'Labrum'
        (485, 600, 542, 588), # Text 'Labium'
    ]
    for x0, x1, y0, y1 in boxes:
        fg_rough[y0:y1, x0:x1] = True

    yy, xx = np.mgrid[0:H, 0:W]
    bg_pts = ~fg_rough
    X_mat = np.column_stack([
        np.ones(np.sum(bg_pts)),
        xx[bg_pts] / W,
        yy[bg_pts] / H,
        (xx[bg_pts] / W) ** 2,
        (yy[bg_pts] / H) ** 2,
        (xx[bg_pts] / W) * (yy[bg_pts] / H),
    ])
    X_full = np.column_stack([
        np.ones(H * W),
        (xx / W).ravel(),
        (yy / H).ravel(),
        ((xx / W) ** 2).ravel(),
        ((yy / H) ** 2).ravel(),
        ((xx / W) * (yy / H)).ravel(),
    ])
    bg_model = np.zeros_like(arr)
    for c in range(3):
        coeffs, _, _, _ = np.linalg.lstsq(X_mat, arr[bg_pts, c], rcond=None)
        bg_model[:, :, c] = (X_full @ coeffs).reshape(H, W)
    return bg_model


def largest_connected_component(mask_bool):
    sh, sw = mask_bool.shape
    vis = np.zeros_like(mask_bool, dtype=bool)
    best_pts = []
    for y in range(sh):
        for x in range(sw):
            if mask_bool[y, x] and not vis[y, x]:
                q = deque([(y, x)])
                vis[y, x] = True
                pts = [(y, x)]
                while q:
                    cy, cx = q.popleft()
                    for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                        if 0 <= ny < sh and 0 <= nx < sw and mask_bool[ny, nx] and not vis[ny, nx]:
                            vis[ny, nx] = True
                            q.append((ny, nx))
                            pts.append((ny, nx))
                if len(pts) > len(best_pts):
                    best_pts = pts
    out = np.zeros_like(mask_bool, dtype=bool)
    for py, px in best_pts:
        out[py, px] = True
    return out


def fill_internal_holes(mask_bool):
    """Flood-fills background from border of mask; any unreached False pixel is an internal hole."""
    sh, sw = mask_bool.shape
    ext = np.zeros_like(mask_bool, dtype=bool)
    q = deque()
    for y in range(sh):
        for x in (0, sw - 1):
            if not mask_bool[y, x] and not ext[y, x]:
                ext[y, x] = True
                q.append((y, x))
    for x in range(sw):
        for y in (0, sh - 1):
            if not mask_bool[y, x] and not ext[y, x]:
                ext[y, x] = True
                q.append((y, x))
    while q:
        cy, cx = q.popleft()
        for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
            if 0 <= ny < sh and 0 <= nx < sw and not mask_bool[ny, nx] and not ext[ny, nx]:
                ext[ny, nx] = True
                q.append((ny, nx))
    return ~ext


def compute_distance_field_and_dilated_rgb(mask_bool, rgb_crop, score_crop, dilate_iters=18):
    """
    1. Computes exact BFS/chamfer distance transform inside mask_bool.
    2. Dilates foreground RGB colors outward outside mask_bool so UV seams have zero background bleed.
    """
    sh, sw = mask_bool.shape
    # Chamfer distance inside mask
    INF = 1e9
    dist = np.where(mask_bool, INF, 0.0).astype(np.float32)
    for y in range(sh):
        for x in range(sw):
            if mask_bool[y, x]:
                d = dist[y, x]
                if y > 0:
                    d = min(d, dist[y - 1, x] + 1.0)
                    if x > 0:
                        d = min(d, dist[y - 1, x - 1] + 1.4142)
                    if x + 1 < sw:
                        d = min(d, dist[y - 1, x + 1] + 1.4142)
                if x > 0:
                    d = min(d, dist[y, x - 1] + 1.0)
                dist[y, x] = d
    for y in range(sh - 1, -1, -1):
        for x in range(sw - 1, -1, -1):
            if mask_bool[y, x]:
                d = dist[y, x]
                if y + 1 < sh:
                    d = min(d, dist[y + 1, x] + 1.0)
                    if x > 0:
                        d = min(d, dist[y + 1, x - 1] + 1.4142)
                    if x + 1 < sw:
                        d = min(d, dist[y + 1, x + 1] + 1.4142)
                if x + 1 < sw:
                    d = min(d, dist[y, x + 1] + 1.0)
                dist[y, x] = d

    # Smooth distance field using PIL GaussianBlur
    dist_max = float(np.max(dist)) if np.max(dist) > 0 else 1.0
    dist_img = Image.fromarray(np.clip(dist / dist_max * 255.0, 0, 255).astype(np.uint8), mode='L')
    dist_smooth_img = dist_img.filter(ImageFilter.GaussianBlur(radius=2.2))
    dist_smooth = (np.array(dist_smooth_img, dtype=np.float32) / 255.0) * dist_max
    dist_smooth = np.where(mask_bool, dist_smooth, 0.0)

    # Reject soft background-blended border pixels (dist <= 4.0 with low foreground contrast)
    # while preserving thin dark/amber structures (antennae, palps, horn tips) that have high score_crop
    eroded = mask_bool & ((dist > 4.0) | ((dist > 1.3) & (score_crop > 42.0)))
    if not np.any(eroded):
        eroded = mask_bool.copy()

    dilated_rgb = rgb_crop.copy().astype(np.float32)
    filled = eroded.copy()
    for _ in range(dilate_iters + 6):
        next_rgb = dilated_rgb.copy()
        next_filled = filled.copy()
        for y in range(sh):
            for x in range(sw):
                if not filled[y, x]:
                    acc = np.zeros(3, dtype=np.float32)
                    cnt = 0
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            ny, nx = y + dy, x + dx
                            if 0 <= ny < sh and 0 <= nx < sw and filled[ny, nx]:
                                acc += dilated_rgb[ny, nx]
                                cnt += 1
                    if cnt > 0:
                        next_rgb[y, x] = acc / cnt
                        next_filled[y, x] = True
        dilated_rgb = next_rgb
        filled = next_filled

    return dist_smooth, np.clip(dilated_rgb, 0, 255).astype(np.uint8)


def main():
    img = Image.open(REF_IMG_PATH).convert("RGB")
    arr = np.array(img, dtype=np.float32)
    H, W, _ = arr.shape

    bg_model = compute_background_model(arr)
    rgb_dist = np.linalg.norm(arr - bg_model, axis=2)
    amber_diff = (arr[:, :, 0] - arr[:, :, 2]) - (bg_model[:, :, 0] - bg_model[:, :, 2])
    score = np.maximum(rgb_dist, amber_diff * 1.5)

    part_Search_boxes = {
        "Head_Capsule": (0, 652, 50, 312, 28.0),
        "Maxilla_R":    (35, 185, 270, 430, 21.0),
        "Maxilla_L":    (490, 620, 270, 430, 21.0),
        "Mandible_R":   (205, 318, 330, 465, 21.0),
        "Mandible_L":   (322, 442, 325, 468, 21.0),
        "Labrum":       (145, 288, 515, 612, 22.0),
        "Labium":       (340, 520, 468, 725, 17.5),
    }

    meta = {"image_width": W, "image_height": H, "parts": {}}
    pad = 8

    for name, (sx0, sx1, sy0, sy1, thresh) in part_Search_boxes.items():
        raw_sub = score[sy0:sy1, sx0:sx1] > thresh
        comp = largest_connected_component(raw_sub)
        comp = fill_internal_holes(comp)

        ys, xs = np.where(comp)
        ymin, ymax = int(ys.min()) + sy0, int(ys.max()) + sy0
        xmin, xmax = int(xs.min()) + sx0, int(xs.max()) + sx0

        # Padded crop box in full image coordinates (can extend beyond 0..W if padded)
        cx0 = max(0, xmin - pad)
        cx1 = min(W, xmax + 1 + pad)
        cy0 = max(0, ymin - pad)
        cy1 = min(H, ymax + 1 + pad)

        mask_crop = np.zeros((cy1 - cy0, cx1 - cx0), dtype=bool)
        # Map comp into mask_crop
        for py, px in zip(ys + sy0, xs + sx0):
            mask_crop[py - cy0, px - cx0] = True

        # Smooth binary silhouette slightly via PIL filter to remove 1px staircases
        m_img = Image.fromarray((mask_crop * 255).astype(np.uint8), mode='L')
        m_blur = m_img.filter(ImageFilter.GaussianBlur(radius=0.8))
        mask_crop = np.array(m_blur) >= 120
        mask_crop = largest_connected_component(mask_crop)
        mask_crop = fill_internal_holes(mask_crop)

        rgb_crop = arr[cy0:cy1, cx0:cx1].astype(np.uint8)
        score_crop = score[cy0:cy1, cx0:cx1]
        dist_smooth, dilated_rgb = compute_distance_field_and_dilated_rgb(mask_crop, rgb_crop, score_crop, dilate_iters=18)

        if name == "Head_Capsule":
            # Extract a rich dark pitted chitin patch from the lower frons (y: 135..215, x: 280..320)
            # and tile it smoothly into the lateral UV-unwrap regions (x < 232 and x > 430) outside the cranium mask
            # so when the 3D side/back of the head capsule unwraps into those UV coordinates, it renders with
            # authentic dark pitted grasshopper cuticle instead of stretched red eye pixels!
            chitin_patch = rgb_crop[135:210, 282:318].copy()
            # Make patch horizontally & vertically mirror-tileable
            tile_h = np.vstack([chitin_patch, chitin_patch[::-1, :, :]])
            tile_full = np.hstack([tile_h, tile_h[:, ::-1, :]])
            th, tw, _ = tile_full.shape
            sh, sw, _ = dilated_rgb.shape
            tiled_canvas = np.zeros_like(dilated_rgb)
            for ty in range(0, sh, th):
                for tx in range(0, sw, tw):
                    bh = min(th, sh - ty)
                    bw = min(tw, sw - tx)
                    tiled_canvas[ty:ty + bh, tx:tx + bw] = tile_full[:bh, :bw]

            # Also compute distance transform specifically for the central oval cranium (x in [226, 437])
            cranium_mask = mask_crop.copy()
            cranium_mask[:, :226] = False
            cranium_mask[:, 438:] = False
            cranium_dist, _ = compute_distance_field_and_dilated_rgb(cranium_mask, rgb_crop, score_crop, dilate_iters=2)
            np.save(os.path.join(TEX_DIR, "Head_Capsule_cranium_dist.npy"), cranium_dist)

            # Save a dedicated Posterior Cranium texture (Head_Capsule_back_tex.png) where the entire cranium region
            # uses the dark pitted grasshopper cuticle (keeping the antennae intact)
            is_cran_region = np.zeros_like(mask_crop, dtype=bool)
            is_cran_region[:, 220:444] = True
            is_cran_region[56:90, 215:268] = False
            is_cran_region[56:90, 400:448] = False
            back_mask_img = Image.fromarray((is_cran_region * 255).astype(np.uint8), mode='L').filter(ImageFilter.GaussianBlur(radius=3.0))
            alpha_back = (np.array(back_mask_img, dtype=np.float32) / 255.0)[:, :, None]
            back_rgb = np.clip((1.0 - alpha_back) * dilated_rgb.astype(np.float32) + alpha_back * tiled_canvas.astype(np.float32), 0, 255).astype(np.uint8)
            back_tex_path = os.path.join(TEX_DIR, "Head_Capsule_back_tex.png")
            Image.fromarray(back_rgb, mode="RGB").save(back_tex_path)

            # Also feather the outermost 6 pixels of the cranium perimeter (cranium_dist < 6.5, excluding antennae)
            # into the dark pitted chitin canvas to form the natural dark circumocular/genal sclerite rim,
            # ensuring a 100% seamless transition between the front face/eye and the lateral temple/postgena!
            front_interior = (~is_cran_region) | (cranium_dist > 6.5)
            front_int_img = Image.fromarray((front_interior * 255).astype(np.uint8), mode='L').filter(ImageFilter.GaussianBlur(radius=3.0))
            alpha_front = (np.array(front_int_img, dtype=np.float32) / 255.0)[:, :, None]
            dilated_rgb = np.clip(alpha_front * dilated_rgb.astype(np.float32) + (1.0 - alpha_front) * tiled_canvas.astype(np.float32), 0, 255).astype(np.uint8)

        # Save Texture (edge-dilated RGB)
        tex_path = os.path.join(TEX_DIR, f"{name}_tex.png")
        Image.fromarray(dilated_rgb, mode="RGB").save(tex_path)

        # Save RGBA cutout
        alpha = np.array(m_img.filter(ImageFilter.GaussianBlur(radius=0.6)), dtype=np.uint8)
        rgba = np.dstack([dilated_rgb, alpha])
        rgba_path = os.path.join(TEX_DIR, f"{name}_rgba.png")
        Image.fromarray(rgba, mode="RGBA").save(rgba_path)

        # Save numpy arrays for Blender mesh builder
        np.save(os.path.join(TEX_DIR, f"{name}_mask.npy"), mask_crop)
        np.save(os.path.join(TEX_DIR, f"{name}_dist.npy"), dist_smooth)

        meta["parts"][name] = {
            "crop_box": [cx0, cx1, cy0, cy1],
            "tight_box": [xmin, xmax, ymin, ymax],
            "center_px": [0.5 * (cx0 + cx1), 0.5 * (cy0 + cy1)],
            "size_px": [cx1 - cx0, cy1 - cy0],
            "max_dist": float(np.max(dist_smooth)),
            "tex_path": tex_path,
            "rgba_path": rgba_path,
        }
        print(f"Prepared {name:14s}: crop=({cx1-cx0}x{cy1-cy0}), max_dist={np.max(dist_smooth):.1f}")

    with open(os.path.join(TEX_DIR, "parts_meta.json"), "w") as f:
        json.dump(meta, f, indent=2)
    print("Saved parts_meta.json successfully.")


if __name__ == "__main__":
    main()
