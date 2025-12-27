const fs = require('fs');
const path = require('path');

// Read the metadata file
const metadataPath = path.join(__dirname, '../public/photography/metadata.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

// Photos to move from "No GPS Data" to "Yosemite National Park"
const photosToMove = ['A6400838.JPG', 'A6400850.JPG', 'A6400851.JPG', 'A6400866.JPG', 'A6400948.JPG', 'A6401037.JPG'];

// Update photos
metadata.photos = metadata.photos.map(photo => {
  // Change "Mariposa County" to "Yosemite National Park"
  if (photo.city === 'Mariposa County') {
    photo.city = 'Yosemite National Park';
  }
  
  // Move specific photos from "No GPS Data" to "Yosemite National Park"
  if (photo.city === 'No GPS Data' && photosToMove.includes(photo.filename)) {
    photo.city = 'Yosemite National Park';
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
console.log(`- Changed "Mariposa County" to "Yosemite National Park"`);
console.log(`- Moved ${photosToMove.length} photos from "No GPS Data" to "Yosemite National Park"`);
console.log(`\nPhotos by city:`);
Object.keys(groupedByCity).sort().forEach(city => {
  console.log(`  ${city}: ${groupedByCity[city].length} photos`);
});

