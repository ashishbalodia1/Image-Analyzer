# Dataset Preparation Guide

## Overview
This guide explains how to organize and prepare 500 images per category for training the City Guardian Image Classifier.

## Directory Structure

Create the following folder structure in your project:

```
training_data/
├── soil_pollution/           (500 images)
├── water_pollution/          (500 images)
├── water_sewage_pollution/   (500 images)
├── air_pollution/            (500 images)
├── door_to_door_cleaning/    (500 images)
├── mohallah_cleaning/        (500 images)
├── road_maintenance/         (500 images)
├── infrastructure/           (500 images)
└── others/                   (500 images)
```

## Image Requirements

### Technical Specifications
- **Format**: JPEG, PNG, or WebP
- **Minimum Resolution**: 224x224 pixels (higher is better)
- **Recommended Resolution**: 640x640 or higher
- **File Size**: Keep under 5MB per image
- **Total Images**: 500 per category (4,500 total)

### Quality Guidelines
- ✅ Clear, well-lit images
- ✅ Focused on the problem area
- ✅ Diverse angles and perspectives
- ✅ Various lighting conditions
- ✅ Different times of day
- ❌ Blurry or out-of-focus images
- ❌ Heavily filtered or edited images
- ❌ Duplicate images

## Category-Specific Guidelines

### 1. Soil Pollution
Images showing:
- Garbage dumps on land
- Illegal waste dumping
- Contaminated soil
- Littered areas
- Land pollution from construction debris

### 2. Water Pollution
Images showing:
- Polluted rivers and lakes
- Contaminated water bodies
- Floating garbage in water
- Industrial discharge into water
- Dirty ponds

### 3. Water Sewage Pollution
Images showing:
- Sewage overflow
- Open drainage issues
- Clogged sewers
- Wastewater on streets
- Manholes overflowing

### 4. Air Pollution
Images showing:
- Smoke from vehicles or industries
- Dust pollution
- Burning waste
- Smog or haze
- Industrial emissions

### 5. Door to Door Cleaning
Images showing:
- Household waste not collected
- Overflowing garbage bins at homes
- Door-to-door collection issues
- Residential waste problems

### 6. Mohallah Cleaning
Images showing:
- Dirty streets
- Litter in neighborhoods
- Unswept roads
- Community area cleanliness issues
- Public space garbage

### 7. Road Maintenance
Images showing:
- Potholes
- Damaged roads
- Broken pavements
- Cracked asphalt
- Road surface deterioration

### 8. Infrastructure
Images showing:
- Broken street lights
- Damaged public property
- Building issues
- Damaged benches or structures
- Public facility problems

### 9. Others
Images showing:
- Civic issues not covered above
- Miscellaneous problems
- Ambiguous cases

## How to Collect Images

### Option 1: Web Scraping (Legal Sources)
Use Google Images, Unsplash, Pexels, or Pixabay with appropriate search terms:
- "soil pollution India"
- "sewage overflow street"
- "pothole road"
- etc.

**Important**: Ensure you have rights to use the images.

### Option 2: Crowdsourcing
- Request citizens to submit categorized images
- Use existing City Guardian submissions
- Organize community drives to collect images

### Option 3: Manual Collection
- Take photos yourself in your city
- Visit problem areas and document them
- Collaborate with local authorities

## Image Naming Convention

Use descriptive names:
```
soil_pollution_001.jpg
soil_pollution_002.jpg
water_sewage_overflow_001.jpg
pothole_main_road_001.jpg
```

## Data Augmentation (Automatic)

The training script will automatically:
- Resize images to 224x224
- Normalize pixel values
- Handle different formats

You don't need to manually resize or preprocess images.

## Quick Setup Script

Create all required folders:

```bash
mkdir -p training_data/{soil_pollution,water_pollution,water_sewage_pollution,air_pollution,door_to_door_cleaning,mohallah_cleaning,road_maintenance,infrastructure,others}
```

## Validation Checklist

Before training, verify:
- [ ] All 9 category folders exist
- [ ] Each folder has approximately 500 images
- [ ] Images are in JPEG/PNG/WebP format
- [ ] No corrupted or unreadable files
- [ ] Images represent the correct category
- [ ] Reasonable diversity in each category

## Download Sample Dataset Script

You can use this Node.js script to download sample images (requires API keys):

```javascript
// scripts/download-dataset.js
// Use Unsplash API or Pexels API to download images
// See: https://unsplash.com/developers
// See: https://www.pexels.com/api/
```

## Tips for Better Training Results

1. **Diversity is Key**: Include images from different:
   - Locations
   - Weather conditions
   - Times of day
   - Angles and perspectives

2. **Balance**: Try to have equal number of images per category

3. **Quality over Quantity**: 500 good images are better than 1000 poor ones

4. **Regular Updates**: Periodically add new images and retrain

5. **Test Images**: Keep 10% of images separate for testing (don't include in training_data)

## Next Steps

Once you have organized your images:

1. Verify the structure:
   ```bash
   ls -la training_data/*/
   ```

2. Start training:
   ```bash
   npm run train
   ```

3. Monitor the training process in the console

4. Test the model:
   ```bash
   npm run test
   ```

## Need Help?

If you need assistance with:
- Finding images for specific categories
- Organizing large datasets
- Automating image downloads
- Data quality issues

Contact the development team or check the main README.md for more resources.
