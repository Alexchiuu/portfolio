const fs = require('fs');
const path = require('path');

// Read the metadata file
const metadataPath = path.join(__dirname, '../public/photography/metadata.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

// Function to extract number from filename (e.g., "A6401139.JPG" -> 1139)
function getPhotoNumber(filename) {
  const match = filename.match(/A640(\d+)\.JPG/i);
  return match ? parseInt(match[1], 10) : null;
}

// Update photos: move A6401139 to A6401343 to Boston
metadata.photos = metadata.photos.map(photo => {
  const photoNum = getPhotoNumber(photo.filename);
  
  // If photo is in range 1139-1343 and currently "No GPS Data", move to Boston
  if (photoNum !== null && photoNum >= 1139 && photoNum <= 1343) {
    if (photo.city === 'No GPS Data') {
      photo.city = 'Boston';
    }
  }
  
  return photo;
});

// Rebuild groupedByCity
const groupedByCity = {};
metadata.photos.forEach(photo => {
  if (!groupedByCity[photo.city]) {
    groupedByCity[photo.city] = [];
  }
  groupedByCity[photo.city].push(photo);
});

// Update metadata object
metadata.groupedByCity = groupedByCity;
metadata.cities = Object.keys(groupedByCity).sort();

// Save updated metadata
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

console.log('Updated metadata:');
console.log(`- Moved photos A6401139 to A6401343 from "No GPS Data" to "Boston"`);

const bostonPhotos = metadata.photos.filter(p => p.city === 'Boston');
console.log(`\nBoston photos: ${bostonPhotos.length}`);
bostonPhotos.forEach(photo => {
  console.log(`  - ${photo.filename}`);
});

console.log(`\nPhotos by city:`);
Object.keys(groupedByCity).sort().forEach(city => {
  console.log(`  ${city}: ${groupedByCity[city].length} photos`);
});

