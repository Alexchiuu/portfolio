export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

interface PhotoMetadata {
  filename: string;
  latitude: number | null;
  longitude: number | null;
  city: string;
  date: string | null;
}

interface MetadataFile {
  photos: PhotoMetadata[];
  groupedByCity: Record<string, PhotoMetadata[]>;
  totalPhotos: number;
  cities: string[];
}

async function getCityFromGPS(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      { headers: { "User-Agent": "personal-portfolio/1.0" } }
    );
    const data = await response.json();
    if (data?.address) {
      return (
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.municipality ||
        data.address.county ||
        "Unknown"
      );
    }
    return "Unknown";
  } catch {
    return "Unknown";
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const photographyDir = path.join(process.cwd(), "public", "photography");
    const metadataPath = path.join(photographyDir, "metadata.json");

    // Parse existing metadata
    let existingMeta: MetadataFile = {
      photos: [],
      groupedByCity: {},
      totalPhotos: 0,
      cities: [],
    };
    if (existsSync(metadataPath)) {
      const raw = await readFile(metadataPath, "utf-8");
      existingMeta = JSON.parse(raw);
    }

    const existingFilenames = new Set(
      existingMeta.photos.map((p) => p.filename)
    );

    const results: { filename: string; status: string; city?: string }[] = [];

    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      if (key !== "photos") continue;
      const file = value as File;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = file.name;

      // Save file
      const destPath = path.join(photographyDir, filename);
      await writeFile(destPath, buffer);

      if (existingFilenames.has(filename)) {
        results.push({ filename, status: "skipped (already exists)" });
        continue;
      }

      // Parse EXIF metadata sent from the client
      const lat = formData.get(`lat_${filename}`);
      const lon = formData.get(`lon_${filename}`);
      const dateStr = formData.get(`date_${filename}`);
      const clientCity = formData.get(`city_${filename}`) as string | null;

      let latitude: number | null = lat ? parseFloat(lat as string) : null;
      let longitude: number | null = lon ? parseFloat(lon as string) : null;
      let city = clientCity || "No GPS Data";
      const date: string | null = dateStr ? (dateStr as string) : null;

      // If we have GPS but no city yet, reverse geocode server-side
      if (latitude && longitude && (!clientCity || clientCity === "Locating…")) {
        city = await getCityFromGPS(latitude, longitude);
        // Rate limit
        await new Promise((r) => setTimeout(r, 1000));
      }

      const newMeta: PhotoMetadata = {
        filename,
        latitude,
        longitude,
        city,
        date,
      };

      existingMeta.photos.push(newMeta);
      results.push({ filename, status: "added", city });
    }

    // Rebuild grouped/cities
    existingMeta.photos.sort((a, b) => {
      if (a.city === b.city) return a.filename.localeCompare(b.filename);
      return a.city.localeCompare(b.city);
    });

    const groupedByCity: Record<string, PhotoMetadata[]> = {};
    existingMeta.photos.forEach((p) => {
      if (!groupedByCity[p.city]) groupedByCity[p.city] = [];
      groupedByCity[p.city].push(p);
    });

    const finalMeta: MetadataFile = {
      photos: existingMeta.photos,
      groupedByCity,
      totalPhotos: existingMeta.photos.length,
      cities: Object.keys(groupedByCity).sort(),
    };

    await writeFile(metadataPath, JSON.stringify(finalMeta, null, 2));

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
