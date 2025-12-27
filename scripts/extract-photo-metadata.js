const fs = require('fs');
const path = require('path');
const exifr = require('exifr');

// Function to reverse geocode GPS coordinates to get city name
async function getCityFromGPS(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
    );
    const data = await response.json();
    
    if (data && data.address) {
      // Try to get city, town, village, or municipality
      return data.address.city || 
             data.address.town || 
             data.address.village || 
             data.address.municipality ||
             data.address.county ||
             'Unknown';
    }
    return 'Unknown';
  } catch (error) {
    console.error(`Error reverse geocoding ${latitude}, ${longitude}:`, error);
    return 'Unknown';
  }
}

// Function to extract GPS data from a photo
async function extractPhotoMetadata(photoPath, filename) {
  try {
    const exifData = await exifr.parse(photoPath, {
      gps: true,
      exif: true,
      iptc: true,
    });

    if (exifData && exifData.latitude && exifData.longitude) {
      const city = await getCityFromGPS(exifData.latitude, exifData.longitude);
      
      // Add a small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        filename,
        latitude: exifData.latitude,
        longitude: exifData.longitude,
        city: city,
        date: exifData.DateTimeOriginal || exifData.CreateDate || null,
      };
    }
    
    return {
      filename,
      latitude: null,
      longitude: null,
      city: 'No GPS Data',
      date: exifData?.DateTimeOriginal || exifData?.CreateDate || null,
    };
  } catch (error) {
    console.error(`Error processing ${filename}:`, error);
    return {
      filename,
      latitude: null,
      longitude: null,
      city: 'Error',
      date: null,
    };
  }
}

// Main function
async function main() {
  const photographyDir = path.join(__dirname, '../public/photography');
  const files = fs.readdirSync(photographyDir)
    .filter(file => file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg'))
    .sort();

  console.log(`Found ${files.length} photos to process...`);
  
  const photoMetadata = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(photographyDir, file);
    console.log(`Processing ${i + 1}/${files.length}: ${file}`);
    
    const metadata = await extractPhotoMetadata(filePath, file);
    photoMetadata.push(metadata);
  }

  // Sort by city
  photoMetadata.sort((a, b) => {
    if (a.city === b.city) {
      return a.filename.localeCompare(b.filename);
    }
    return a.city.localeCompare(b.city);
  });

  // Group by city
  const groupedByCity = {};
  photoMetadata.forEach(photo => {
    if (!groupedByCity[photo.city]) {
      groupedByCity[photo.city] = [];
    }
    groupedByCity[photo.city].push(photo);
  });

  // Save to JSON file
  const outputPath = path.join(__dirname, '../public/photography/metadata.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    photos: photoMetadata,
    groupedByCity: groupedByCity,
    totalPhotos: photoMetadata.length,
    cities: Object.keys(groupedByCity).sort()
  }, null, 2));

  console.log('\n=== Summary ===');
  console.log(`Total photos: ${photoMetadata.length}`);
  console.log(`Cities found: ${Object.keys(groupedByCity).length}`);
  console.log('\nPhotos by city:');
  Object.keys(groupedByCity).sort().forEach(city => {
    console.log(`  ${city}: ${groupedByCity[city].length} photos`);
  });
  
  console.log(`\nMetadata saved to: ${outputPath}`);
}

main().catch(console.error);

