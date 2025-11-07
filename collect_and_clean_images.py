"""
collect_and_clean_images.py

Usage:
    python collect_and_clean_images.py

What it does:
- For each class it runs a set of Bing image searches (via icrawler)
- Downloads up to `TARGET_PER_CLASS` images per class into training_data/<class>/
- Removes corrupt images
- Deduplicates images using perceptual hashing
- Resizes images to IMAGE_SIZE and converts to JPEG

Caveats:
- Change TARGET_PER_CLASS if you want fewer/more images.
- If running on a network with restrictions, adjust concurrency params.
- Always verify licensing of downloaded images before commercial use.
"""

import os
import shutil
from pathlib import Path
from icrawler.builtin import BingImageCrawler
from PIL import Image, UnidentifiedImageError
import imagehash
from tqdm import tqdm

# --------- CONFIG ----------
DATA_DIR = Path("training_data")
TARGET_PER_CLASS = 500   # desired final count per class
IMAGE_SIZE = (512, 512)  # final image size
TEMP_DIR = Path("tmp_downloads")
HASH_DIFF_THRESHOLD = 5  # smaller = stricter deduplication
# --------------------------

# Map of folder name -> list of search queries
CATEGORIES_QUERIES = {
    "soil_pollution": [
        "garbage dumps on land",
        "illegal waste dumping land",
        "contaminated soil",
        "littered ground",
        "construction debris on land",
        "land pollution construction debris"
    ],
    "water_pollution": [
        "polluted river",
        "polluted lake",
        "floating garbage in water",
        "industrial discharge into water",
        "dirty pond",
        "contaminated water body"
    ],
    "water_sewage_pollution": [
        "sewage overflow",
        "open drainage sewage",
        "clogged sewer",
        "wastewater on streets",
        "manhole overflowing",
        "sewage on road"
    ],
    "air_pollution": [
        "vehicle smoke air pollution",
        "industrial smoke emissions",
        "dust pollution street",
        "burning waste smoke",
        "smog haze city",
        "industrial emissions smokestack"
    ],
    "door_to_door_cleaning": [
        "household garbage not collected",
        "overflowing garbage bins at home",
        "door to door waste collection issue",
        "residential overflowing bin",
        "household waste on street"
    ],
    "mohallah_cleaning": [
        "dirty neighborhood street",
        "litter in neighborhood",
        "unswept road in locality",
        "community garbage public space",
        "mohallah cleaning issue"
    ],
    "road_maintenance": [
        "potholes road",
        "damaged road pavement",
        "cracked asphalt",
        "broken pavement",
        "road surface deterioration"
    ],
    "infrastructure": [
        "broken street light",
        "damaged public property",
        "broken bench public park",
        "building damage public facility",
        "infrastructure problem street"
    ],
    "others": [
        "urban waste problem",
        "public cleanliness issue",
        "miscellaneous civic issue",
        "city garbage dump",
        "trash at public space"
    ]
}


def ensure_dirs():
    DATA_DIR.mkdir(exist_ok=True)
    TEMP_DIR.mkdir(exist_ok=True)
    for cat in CATEGORIES_QUERIES:
        (DATA_DIR / cat).mkdir(exist_ok=True)


def download_for_category(category, queries, target):
    out_dir = TEMP_DIR / category
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # We'll download more than target to allow for cleaning & dedup
    per_query_limit = max(100, int(target / max(1, len(queries)) * 1.5))

    crawler = BingImageCrawler(storage={"root_dir": str(out_dir)})
    print(f"\n[DOWNLOAD] Category: {category} -> target {target}, per-query ~{per_query_limit}")
    for q in queries:
        print(f"  Searching: '{q}'")
        try:
            crawler.crawl(
                keyword=q,
                max_num=per_query_limit,
                min_size=(200, 200),
                file_idx_offset='auto'
            )
        except Exception as e:
            print(f"    Warning: crawler error for query '{q}': {e}")

    return out_dir


def is_image_valid(path):
    try:
        with Image.open(path) as im:
            im.verify()
        return True
    except (UnidentifiedImageError, OSError):
        return False


def normalize_and_move(temp_dir, final_dir, target, image_size, hash_threshold):
    final_dir = Path(final_dir)
    final_dir.mkdir(parents=True, exist_ok=True)
    existing_hashes = set()

    # load existing hashes from final_dir (if any)
    for p in final_dir.iterdir():
        try:
            with Image.open(p) as im:
                h = imagehash.phash(im)
                existing_hashes.add(str(h))
        except Exception:
            continue

    temp_images = list(temp_dir.glob("**/*"))
    temp_images = [p for p in temp_images if p.is_file()]
    # Quality filter: verify images
    valid_images = []
    for p in temp_images:
        if is_image_valid(p):
            valid_images.append(p)
        else:
            p.unlink(missing_ok=True)

    # Process & deduplicate
    added = 0
    for p in tqdm(valid_images, desc=f"Processing {temp_dir.name}", unit="img"):
        if added >= target:
            break
        try:
            with Image.open(p) as im:
                # convert to RGB, resize
                im = im.convert("RGB")
                im = im.resize(image_size, Image.LANCZOS)
                # compute hash
                h = imagehash.phash(im)
                # Check near-duplicates
                dup = False
                for eh in list(existing_hashes):
                    # compare integer difference (string -> imagehash object)
                    if imagehash.hex_to_hash(eh) - h < hash_threshold:
                        dup = True
                        break
                if dup:
                    continue
                # Save final image
                idx = 1
                while True:
                    fname = final_dir / f"{final_dir.name}_{str(idx).zfill(5)}.jpg"
                    if not fname.exists():
                        im.save(fname, format="JPEG", quality=90)
                        existing_hashes.add(str(h))
                        added += 1
                        break
                    idx += 1
        except Exception:
            continue

    print(f"  Saved {added} images to {final_dir} (target was {target})")
    return added


def cleanup_temp():
    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR)
    TEMP_DIR.mkdir(exist_ok=True)


def main():
    ensure_dirs()
    # For each category:
    for cat, queries in CATEGORIES_QUERIES.items():
        final_folder = DATA_DIR / cat
        current_count = len(list(final_folder.glob("*.*")))
        remaining = max(0, TARGET_PER_CLASS - current_count)
        if remaining == 0:
            print(f"[SKIP] {cat}: already has {current_count} images.")
            continue

        # Download to temp dir
        temp_out = download_for_category(cat, queries, remaining)

        # Normalize, dedup, resize and move to final folder
        added = normalize_and_move(temp_out, final_folder, remaining, IMAGE_SIZE, HASH_DIFF_THRESHOLD)

        # optionally repeat if added < remaining (try additional queries or increase per-query limit)
        if added < remaining:
            print(f"[INFO] {cat}: only {added} new images added (needed {remaining}).")
            print("  You can rerun the script or add more queries to CATEGORIES_QUERIES for better coverage.")

        # cleanup category temp
        shutil.rmtree(temp_out, ignore_errors=True)

    # final cleanup
    cleanup_temp()
    print("\nAll done. Check training_data/ for results.")


if __name__ == "__main__":
    main()
