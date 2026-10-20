'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  Navigation,
  Compass,
  Layers,
  Info,
  Check,
} from 'lucide-react';
import { LOCATION_PRESETS } from '@/lib/constants';

interface InteractiveFarmMapProps {
  latitude: number;
  longitude: number;
  fieldSizeHectares: number;
  onLocationChange: (lat: number, lon: number, regionName?: string) => void;
  readOnly?: boolean;
}

export const InteractiveFarmMap: React.FC<InteractiveFarmMapProps> = ({
  latitude,
  longitude,
  fieldSizeHectares,
  onLocationChange,
  readOnly = false,
}) => {
  const [currentLat, setCurrentLat] = useState(latitude);
  const [currentLon, setCurrentLon] = useState(longitude);
  const [zoom, setZoom] = useState<number>(10);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; lat: number; lon: number } | null>(null);
  const [mapType, setMapType] = useState<'osm' | 'terrain'>('osm');
  const [geoLocating, setGeoLocating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync props to internal state
  useEffect(() => {
    setCurrentLat(latitude);
    setCurrentLon(longitude);
  }, [latitude, longitude]);

  // Convert lat/lon to Mercator projection coordinates for tile calculation
  const lat2tile = (lat: number, z: number) => {
    return (
      ((1 -
        Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) /
          Math.PI) /
        2) *
      Math.pow(2, z)
    );
  };

  const lon2tile = (lon: number, z: number) => {
    return ((lon + 180) / 360) * Math.pow(2, z);
  };

  const tile2lon = (x: number, z: number) => {
    return (x / Math.pow(2, z)) * 360 - 180;
  };

  const tile2lat = (y: number, z: number) => {
    const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  };

  // Calculate 9 surrounding tiles for current view
  const centerTileX = lon2tile(currentLon, zoom);
  const centerTileY = lat2tile(currentLat, zoom);

  const baseTileX = Math.floor(centerTileX);
  const baseTileY = Math.floor(centerTileY);

  const fracX = centerTileX - baseTileX;
  const fracY = centerTileY - baseTileY;

  // Handle map click to place pin
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || isDragging) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const deltaPixelX = clickX - centerX;
    const deltaPixelY = clickY - centerY;

    const tileSize = 256;
    const newTileX = centerTileX + deltaPixelX / tileSize;
    const newTileY = centerTileY + deltaPixelY / tileSize;

    const newLon = Number(tile2lon(newTileX, zoom).toFixed(4));
    const newLat = Number(tile2lat(newTileY, zoom).toFixed(4));

    setCurrentLat(newLat);
    setCurrentLon(newLon);
    onLocationChange(newLat, newLon);
  };

  // Mouse pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    setIsDragging(false);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      lat: currentLat,
      lon: currentLon,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      setIsDragging(true);
    }

    const tileSize = 256;
    const origTileX = lon2tile(dragStart.lon, zoom);
    const origTileY = lat2tile(dragStart.lat, zoom);

    const newTileX = origTileX - deltaX / tileSize;
    const newTileY = origTileY - deltaY / tileSize;

    const newLon = Number(tile2lon(newTileX, zoom).toFixed(4));
    const newLat = Number(tile2lat(newTileY, zoom).toFixed(4));

    setCurrentLat(newLat);
    setCurrentLon(newLon);
  };

  const handleMouseUp = () => {
    if (dragStart && isDragging) {
      onLocationChange(currentLat, currentLon);
    }
    setDragStart(null);
    setTimeout(() => setIsDragging(false), 50);
  };

  // Handle Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        setCurrentLat(lat);
        setCurrentLon(lon);
        onLocationChange(lat, lon);
        setGeoLocating(false);
      },
      () => {
        setGeoLocating(false);
      },
      { timeout: 7000 }
    );
  };

  // Select regional preset
  const handleSelectPreset = (preset: typeof LOCATION_PRESETS[0]) => {
    setCurrentLat(preset.latitude);
    setCurrentLon(preset.longitude);
    onLocationChange(preset.latitude, preset.longitude, preset.name);
    setZoom(11);
  };

  // Generate 3x3 tiles
  const tiles: { key: string; x: number; y: number; url: string; offsetX: number; offsetY: number }[] = [];
  const range = [-1, 0, 1];
  const maxTile = Math.pow(2, zoom);

  for (const dx of range) {
    for (const dy of range) {
      const tileX = (baseTileX + dx + maxTile) % maxTile;
      const tileY = baseTileY + dy;
      if (tileY >= 0 && tileY < maxTile) {
        const url =
          mapType === 'osm'
            ? `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`
            : `https://tiles.stadiamaps.com/tiles/alidade_smooth/${zoom}/${tileX}/${tileY}.png`;

        tiles.push({
          key: `${zoom}-${tileX}-${tileY}`,
          x: tileX,
          y: tileY,
          url,
          offsetX: (dx - fracX) * 256,
          offsetY: (dy - fracY) * 256,
        });
      }
    }
  }

  // Field radius visually in pixels (approximate ground scale at zoom)
  const groundMetersPerPixel = (156543.03392 * Math.cos((currentLat * Math.PI) / 180)) / Math.pow(2, zoom);
  const fieldRadiusMeters = Math.sqrt((fieldSizeHectares * 10000) / Math.PI);
  const fieldRadiusPixels = Math.max(12, Math.min(120, Math.round(fieldRadiusMeters / groundMetersPerPixel)));

  return (
    <div className="space-y-3">
      {/* Interactive Map Canvas Container */}
      <div
        ref={containerRef}
        onClick={handleMapClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-56 min-[400px]:h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-200/90 shadow-inner bg-slate-100 select-none cursor-crosshair group"
      >
        {/* Render OpenStreetMap Slippy Tiles */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {tiles.map((t) => (
            <div
              key={t.key}
              style={{
                width: 256,
                height: 256,
                transform: `translate(${t.offsetX}px, ${t.offsetY}px)`,
                position: 'absolute',
              }}
              className="bg-slate-200"
            >
              {/* Image tile with fallback */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.url}
                alt=""
                className="w-full h-full object-cover select-none pointer-events-none"
                loading="eager"
                onError={(e) => {
                  // Fallback tile styling
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>

        {/* Center Field Boundary Radius Overlay */}
        <div
          style={{
            width: fieldRadiusPixels * 2,
            height: fieldRadiusPixels * 2,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-500/80 bg-emerald-400/20 pointer-events-none animate-pulse-subtle shadow-xs"
          title={`Approximate field perimeter for ${fieldSizeHectares} ha (~${Math.round(fieldRadiusMeters)}m radius)`}
        />

        {/* Center Crosshair Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping" />
            <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center backdrop-blur-2xs">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="w-4 h-4 fill-white" />
              </div>
            </div>
          </div>
          {/* Coordinates readout badge */}
          <div className="mt-1 px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-[11px] font-mono font-bold shadow-md backdrop-blur-xs border border-white/20 whitespace-nowrap">
            {currentLat.toFixed(4)}°, {currentLon.toFixed(4)}°
          </div>
        </div>

        {/* Map Controls: Zoom in/out, Geolocation & Layers */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.min(16, z + 1));
            }}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200 flex items-center justify-center text-xs font-bold transition-transform active:scale-90"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.max(4, z - 1));
            }}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200 flex items-center justify-center text-xs font-bold transition-transform active:scale-90"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleUseCurrentLocation();
            }}
            disabled={geoLocating}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-sky-50 text-sky-700 shadow-md border border-slate-200 flex items-center justify-center text-xs font-bold transition-transform active:scale-90 disabled:opacity-50"
            title="Detect My Location"
          >
            <Navigation className={`w-4 h-4 ${geoLocating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Map Notice & Instructions */}
        <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-sm">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>Click map or drag to set coordinates</span>
            <span className="text-slate-400">• OpenStreetMap</span>
          </div>
        </div>
      </div>

      {/* Quick Regional Presets Chips */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-3 h-3 text-emerald-600" />
            Major Central Asia Agricultural Districts:
          </span>
          <span className="text-[10px] text-slate-400">Click to center</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LOCATION_PRESETS.map((p) => {
            const isMatch = Math.abs(currentLat - p.latitude) < 0.05 && Math.abs(currentLon - p.longitude) < 0.05;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                  isMatch
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold ring-1 ring-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isMatch && <span className="mr-1 text-emerald-600">✓</span>}
                {p.name.replace(' Irrigation District', '').replace(' Lower Basin', '').replace(' Agricultural Plain', '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Coordinates Input as Accessible Fallback */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-sky-600" />
            Manual Coordinates (Decimal Degrees Fallback)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">WGS-84</span>
        </div>

        <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-3">
          <div>
            <label htmlFor="manual-latitude" className="block text-[11px] font-semibold text-slate-600 mb-1">
              Latitude (°N)
            </label>
            <input
              id="manual-latitude"
              type="number"
              step="0.0001"
              min="-90"
              max="90"
              value={currentLat}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  setCurrentLat(val);
                  onLocationChange(val, currentLon);
                }
              }}
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="e.g. 43.3015"
            />
          </div>

          <div>
            <label htmlFor="manual-longitude" className="block text-[11px] font-semibold text-slate-600 mb-1">
              Longitude (°E)
            </label>
            <input
              id="manual-longitude"
              type="number"
              step="0.0001"
              min="-180"
              max="180"
              value={currentLon}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  setCurrentLon(val);
                  onLocationChange(currentLat, val);
                }
              }}
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="e.g. 68.2723"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
