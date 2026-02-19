import { NextRequest, NextResponse } from "next/server";
import { unlink, readFile, writeFile } from "fs/promises";
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

export async function DELETE(req: NextRequest) {
  try {
    const { filename } = await req.json();
    if (!filename) {
      return NextResponse.json({ success: false, error: "No filename" }, { status: 400 });
    }

    const photographyDir = path.join(process.cwd(), "public", "photography");
    const filePath = path.join(photographyDir, filename);

    // Delete the file if it exists
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    // Update metadata
    const metadataPath = path.join(photographyDir, "metadata.json");
    if (existsSync(metadataPath)) {
      const raw = await readFile(metadataPath, "utf-8");
      const meta: MetadataFile = JSON.parse(raw);

      meta.photos = meta.photos.filter((p) => p.filename !== filename);

      const groupedByCity: Record<string, PhotoMetadata[]> = {};
      meta.photos.forEach((p) => {
        if (!groupedByCity[p.city]) groupedByCity[p.city] = [];
        groupedByCity[p.city].push(p);
      });

      const finalMeta: MetadataFile = {
        photos: meta.photos,
        groupedByCity,
        totalPhotos: meta.photos.length,
        cities: Object.keys(groupedByCity).sort(),
      };

      await writeFile(metadataPath, JSON.stringify(finalMeta, null, 2));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
