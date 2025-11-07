#!/usr/bin/env python3
"""
City Guardian Image Collector
Automatically downloads images for training using Unsplash API
"""

import os
import requests
import time
from pathlib import Path

# Configuration
TRAINING_DATA_PATH = "training_data"
IMAGES_PER_CATEGORY = 50  # Start with 50, you can increase later

# Search queries for each category (using free image sources)
SEARCH_QUERIES = {
    "soil_pollution": [
        "garbage dump", "land pollution", "waste dump", "littered ground",
        "soil contamination", "illegal dumping", "trash pile", "landfill"
    ],
    "water_pollution": [
        "polluted river", "contaminated water", "dirty lake", "water pollution",
        "floating garbage water", "polluted pond", "sewage water", "dirty stream"
    ],
    "water_sewage_pollution": [
        "sewage overflow", "clogged drain", "sewage leak", "drainage problem",
        "manhole overflow", "sewage spill", "wastewater street", "drain blockage"
    ],
    "air_pollution": [
        "smoke pollution", "smog city", "industrial smoke", "air pollution",
        "dust storm", "vehicle smoke", "factory emissions", "burning waste smoke"
    ],
    "door_to_door_cleaning": [
        "garbage truck", "waste collection", "trash bin full", "residential waste",
        "household garbage", "garbage collector", "waste disposal home", "trash collection"
    ],
    "mohallah_cleaning": [
        "street cleaning", "dirty street", "littered road", "street garbage",
        "neighborhood cleaning", "street sweeper", "public area trash", "road litter"
    ],
    "road_maintenance": [
        "pothole road", "damaged road", "broken pavement", "cracked road",
        "road repair needed", "road damage", "bad road condition", "road crater"
    ],
    "infrastructure": [
        "broken street light", "damaged building", "public facility damage",
        "infrastructure damage", "broken bench", "damaged public property", "facility repair needed"
    ],
    "others": [
        "civic issue", "public problem", "urban issue", "city problem",
        "municipal issue", "public complaint", "city maintenance", "urban complaint"
    ]
}

def download_from_picsum(category, count):
    """
    Download random images from Picsum (Lorem Picsum)
    These are placeholder images - YOU NEED TO REPLACE with real category-specific images
    """
    print(f"📥 Downloading {count} placeholder images for {category}...")
    
    category_path = Path(TRAINING_DATA_PATH) / category
    category_path.mkdir(parents=True, exist_ok=True)
    
    downloaded = 0
    for i in range(count):
        try:
            # Using Lorem Picsum for placeholder images (640x640)
            # NOTE: These are random images, not category-specific!
            url = f"https://picsum.photos/640/640?random={category}_{i}"
            
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                filename = category_path / f"{category}_{i+1:03d}.jpg"
                with open(filename, 'wb') as f:
                    f.write(response.content)
                downloaded += 1
                print(f"   ✓ Downloaded {downloaded}/{count}: {filename.name}")
                time.sleep(0.5)  # Rate limiting
            else:
                print(f"   ✗ Failed to download image {i+1}")
        except Exception as e:
            print(f"   ✗ Error downloading image {i+1}: {e}")
    
    print(f"✅ Downloaded {downloaded} images for {category}\n")
    return downloaded

def main():
    print("=" * 70)
    print("🏙️  CITY GUARDIAN IMAGE COLLECTOR")
    print("=" * 70)
    print()
    print("⚠️  IMPORTANT NOTE:")
    print("   This script downloads PLACEHOLDER images from Lorem Picsum.")
    print("   These are NOT category-specific images!")
    print()
    print("   For best results, you should:")
    print("   1. Use Google Images with appropriate search terms")
    print("   2. Use Unsplash/Pexels APIs (requires API key)")
    print("   3. Collect real images from your city")
    print("   4. Use existing City Guardian submissions")
    print()
    print(f"📂 Target: {IMAGES_PER_CATEGORY} images per category")
    print()
    
    input("Press Enter to continue with placeholder images...")
    print()
    
    total_downloaded = 0
    
    for category in SEARCH_QUERIES.keys():
        downloaded = download_from_picsum(category, IMAGES_PER_CATEGORY)
        total_downloaded += downloaded
    
    print("=" * 70)
    print(f"✅ DOWNLOAD COMPLETE!")
    print(f"   Total images downloaded: {total_downloaded}")
    print(f"   Categories: {len(SEARCH_QUERIES)}")
    print()
    print("⚠️  NEXT STEPS:")
    print("   1. Replace placeholder images with real category-specific images")
    print("   2. Ensure each category has 500 images (currently only 50)")
    print("   3. Verify image quality and relevance")
    print("   4. Run: npm run train")
    print("=" * 70)

if __name__ == "__main__":
    main()
