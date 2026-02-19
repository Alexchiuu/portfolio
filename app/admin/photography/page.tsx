"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import exifr from "exifr";

interface PendingPhoto {
  file: File;
  previewUrl: string;
  filename: string;
  latitude: number | null;
  longitude: number | null;
  city: string;
  date: string | null;
  status: "pending" | "uploading" | "done" | "error" | "duplicate";
}

interface ExistingPhoto {
  filename: string;
  city: string;
  date: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function AdminPhotographyPage() {
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [existing, setExisting] = useState<ExistingPhoto[]>([]);
  const [existingFilenames, setExistingFilenames] = useState<Set<string>>(new Set());
  const [uploadLog, setUploadLog] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "manage">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing photos from metadata
  useEffect(() => {
    fetch("/photography/metadata.json")
      .then((r) => r.json())
      .then((data) => {
        const photos: ExistingPhoto[] = (data.photos || []).map((p: ExistingPhoto) => ({
          filename: p.filename,
          city: p.city,
          date: p.date,
          latitude: p.latitude,
          longitude: p.longitude,
        }));
        setExisting(photos);
        setExistingFilenames(new Set(photos.map((p) => p.filename)));
      })
      .catch(() => {});
  }, []);

  const processFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((f) =>
        f.type.startsWith("image/") || f.name.toLowerCase().endsWith(".jpg") || f.name.toLowerCase().endsWith(".jpeg") || f.name.toLowerCase().endsWith(".png")
      );

      const newPending: PendingPhoto[] = await Promise.all(
        imageFiles.map(async (file) => {
          const previewUrl = URL.createObjectURL(file);
          let latitude: number | null = null;
          let longitude: number | null = null;
          let date: string | null = null;
          let city = "Locating…";

          try {
            const exif = await exifr.parse(file, { gps: true, exif: true });
            if (exif) {
              latitude = exif.latitude ?? null;
              longitude = exif.longitude ?? null;
              const rawDate = exif.DateTimeOriginal || exif.CreateDate;
              date = rawDate ? new Date(rawDate).toISOString() : null;
            }
          } catch {}

          if (!latitude || !longitude) {
            city = "No GPS Data";
          }

          const isDuplicate = existingFilenames.has(file.name);

          return {
            file,
            previewUrl,
            filename: file.name,
            latitude,
            longitude,
            city,
            date,
            status: isDuplicate ? "duplicate" : "pending",
          } as PendingPhoto;
        })
      );

      setPending((prev) => {
        const existingNames = new Set(prev.map((p) => p.filename));
        return [...prev, ...newPending.filter((p) => !existingNames.has(p.filename))];
      });

      // Reverse geocode for photos with GPS (in background)
      newPending.forEach(async (photo, _i) => {
        if (photo.latitude && photo.longitude && photo.city === "Locating…") {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${photo.latitude}&lon=${photo.longitude}&zoom=10&addressdetails=1`,
              { headers: { "User-Agent": "personal-portfolio/1.0" } }
            );
            const data = await res.json();
            const resolvedCity =
              data?.address?.city ||
              data?.address?.town ||
              data?.address?.village ||
              data?.address?.municipality ||
              data?.address?.county ||
              "Unknown";

            setPending((prev) =>
              prev.map((p) =>
                p.filename === photo.filename ? { ...p, city: resolvedCity } : p
              )
            );
          } catch {
            setPending((prev) =>
              prev.map((p) =>
                p.filename === photo.filename ? { ...p, city: "Unknown" } : p
              )
            );
          }
        }
      });
    },
    [existingFilenames]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [processFiles]
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(Array.from(e.target.files));
        e.target.value = "";
      }
    },
    [processFiles]
  );

  const removePending = (filename: string) => {
    setPending((prev) => {
      const photo = prev.find((p) => p.filename === filename);
      if (photo) URL.revokeObjectURL(photo.previewUrl);
      return prev.filter((p) => p.filename !== filename);
    });
  };

  const uploadAll = async () => {
    const toUpload = pending.filter((p) => p.status === "pending");
    if (toUpload.length === 0) return;
    setIsUploading(true);
    setUploadLog([]);

    for (const photo of toUpload) {
      setPending((prev) =>
        prev.map((p) => (p.filename === photo.filename ? { ...p, status: "uploading" } : p))
      );

      const formData = new FormData();
      formData.append("photos", photo.file);
      if (photo.latitude) formData.append(`lat_${photo.filename}`, String(photo.latitude));
      if (photo.longitude) formData.append(`lon_${photo.filename}`, String(photo.longitude));
      if (photo.date) formData.append(`date_${photo.filename}`, photo.date);
      formData.append(`city_${photo.filename}`, photo.city);

      try {
        const res = await fetch("/api/upload-photos", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          const result = data.results?.[0];
          setPending((prev) =>
            prev.map((p) => (p.filename === photo.filename ? { ...p, status: "done" } : p))
          );
          setUploadLog((l) => [...l, `✅ ${photo.filename} — ${result?.city || photo.city}`]);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        setPending((prev) =>
          prev.map((p) => (p.filename === photo.filename ? { ...p, status: "error" } : p))
        );
        setUploadLog((l) => [...l, `❌ ${photo.filename} — ${String(err)}`]);
      }
    }

    // Refresh existing list
    const res = await fetch("/photography/metadata.json");
    const data = await res.json();
    const updated: ExistingPhoto[] = (data.photos || []).map((p: ExistingPhoto) => ({
      filename: p.filename,
      city: p.city,
      date: p.date,
      latitude: p.latitude,
      longitude: p.longitude,
    }));
    setExisting(updated);
    setExistingFilenames(new Set(updated.map((p) => p.filename)));
    setIsUploading(false);
  };

  const deletePhoto = async (filename: string) => {
    try {
      await fetch("/api/delete-photo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      setExisting((prev) => prev.filter((p) => p.filename !== filename));
      setExistingFilenames((prev) => {
        const next = new Set(prev);
        next.delete(filename);
        return next;
      });
      setDeleteConfirm(null);
    } catch {}
  };

  const pendingCount = pending.filter((p) => p.status === "pending").length;
  const doneCount = pending.filter((p) => p.status === "done").length;

  const statusBadge = (status: PendingPhoto["status"]) => {
    switch (status) {
      case "pending": return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Ready</span>;
      case "uploading": return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 animate-pulse">Uploading…</span>;
      case "done": return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Done ✓</span>;
      case "error": return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Error</span>;
      case "duplicate": return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Already exists</span>;
    }
  };

  // Group existing photos by city
  const grouped = existing.reduce<Record<string, ExistingPhoto[]>>((acc, p) => {
    const key = p.city || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});
  const sortedCities = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/photography" className="text-gray-400 hover:text-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">📷 Photo Manager</h1>
            <span className="text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{existing.length} photos</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "upload" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Upload
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "manage" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Manage
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="space-y-6">
            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-blue-500 bg-blue-50 scale-[1.01]"
                  : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                className="hidden"
                onChange={onFileSelect}
              />
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                <div className={`text-5xl transition-transform duration-200 ${isDragging ? "scale-125" : ""}`}>
                  {isDragging ? "📂" : "🖼️"}
                </div>
                <p className="text-lg font-semibold text-gray-700">
                  {isDragging ? "Drop photos here!" : "Drag & drop photos here"}
                </p>
                <p className="text-sm text-gray-400">or click to browse · JPG, JPEG, PNG supported</p>
                <p className="text-xs text-gray-400">EXIF GPS data will be extracted automatically</p>
              </div>
            </div>

            {/* Pending Photos */}
            {pending.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-900">Queue</h2>
                    <span className="text-sm text-gray-400">{pending.length} photos</span>
                    {doneCount > 0 && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{doneCount} uploaded</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
                        setPending([]);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Clear all
                    </button>
                    <button
                      onClick={uploadAll}
                      disabled={isUploading || pendingCount === 0}
                      className="text-sm font-semibold bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Uploading…
                        </>
                      ) : (
                        <>Upload {pendingCount > 0 ? pendingCount : ""} photo{pendingCount !== 1 ? "s" : ""}</>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-gray-100">
                  {pending.map((photo) => (
                    <div key={photo.filename} className="bg-white relative group">
                      {/* Thumbnail */}
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <Image
                          src={photo.previewUrl}
                          alt={photo.filename}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          {photo.status === "pending" && (
                            <button
                              onClick={() => removePending(photo.filename)}
                              className="bg-red-500 text-white text-xs px-3 py-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        {/* Status indicator */}
                        <div className="absolute top-2 left-2">
                          {statusBadge(photo.status)}
                        </div>
                        {photo.status === "uploading" && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                          </div>
                        )}
                        {photo.status === "done" && (
                          <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-800 truncate">{photo.filename}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {photo.city === "Locating…" ? (
                            <span className="text-xs text-gray-400 animate-pulse">📍 Locating…</span>
                          ) : photo.city === "No GPS Data" ? (
                            <span className="text-xs text-gray-400">No GPS</span>
                          ) : (
                            <span className="text-xs text-blue-600">📍 {photo.city}</span>
                          )}
                        </div>
                        {photo.date && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(photo.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Log */}
            {uploadLog.length > 0 && (
              <div className="bg-gray-900 text-gray-100 rounded-2xl p-4 font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Upload log</span>
                  <button onClick={() => setUploadLog([])} className="text-gray-500 hover:text-gray-300 text-xs">Clear</button>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {uploadLog.map((line, i) => (
                    <div key={i} className="text-sm">{line}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === "manage" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{existing.length} photos across {sortedCities.length} locations</span>
            </div>

            {sortedCities.map((city) => (
              <div key={city} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                  <span className="text-base">📍</span>
                  <h3 className="font-semibold text-gray-800">{city}</h3>
                  <span className="text-sm text-gray-400 ml-1">{grouped[city].length} photo{grouped[city].length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-px bg-gray-100">
                  {grouped[city].map((photo) => (
                    <div key={photo.filename} className="bg-white relative group">
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <Image
                          src={`/photography/${photo.filename}`}
                          alt={photo.filename}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          {deleteConfirm === photo.filename ? (
                            <div className="flex flex-col items-center gap-1 px-1">
                              <span className="text-white text-xs text-center">Delete?</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => deletePhoto(photo.filename)}
                                  className="bg-red-500 text-white text-xs px-2 py-0.5 rounded hover:bg-red-600"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="bg-gray-500 text-white text-xs px-2 py-0.5 rounded hover:bg-gray-600"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(photo.filename)}
                              className="bg-red-500 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                              🗑 Delete
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="p-1.5">
                        <p className="text-xs text-gray-500 truncate" title={photo.filename}>{photo.filename}</p>
                        {photo.date && (
                          <p className="text-xs text-gray-400">
                            {new Date(photo.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {existing.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <div className="text-4xl mb-3">🖼️</div>
                <p>No photos yet. Upload some in the Upload tab.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
