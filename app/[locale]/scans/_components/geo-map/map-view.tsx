"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"

import { MapPoint } from "./types"
import {
  TILE_URL_LIGHT,
  TILE_URL_DARK,
  TILE_ATTRIBUTION,
  COUNTRIES_GEOJSON_URL,
  CAMEROON_ISO3,
  REGION_BOUNDS,
  CAMEROON_CENTER,
  ASSET_DETAIL_ZOOM,
  DIM_COLOR_LIGHT,
  DIM_COLOR_DARK,
  HIGHLIGHT_COLOR_LIGHT,
  HIGHLIGHT_COLOR_DARK,
  OUTLINE_COLOR_LIGHT,
  OUTLINE_COLOR_DARK,
  assetTypeIconSvg,
} from "./constants"
import { buildInverseMask } from "./utils"

interface MapViewProps {
  points: MapPoint[]
  onSelect: (point: MapPoint) => void
  onTilesFailed: (failed: boolean) => void
}

// Icône de cluster thème-adaptative — remplace les couleurs vert/jaune/orange
// par défaut du plugin, pour rester cohérent avec le rendu monochrome.
function makeClusterIcon(count: number): L.DivIcon {
  const size = count < 10 ? 34 : count < 50 ? 42 : 50
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: ${size}px; height: ${size}px; border-radius: 9999px;
        background: var(--primary, #6d28d9);
        border: 2px solid var(--card, #fff);
        display: flex; align-items: center; justify-content: center;
        color: var(--primary-foreground, #fff);
        font-size: ${count < 100 ? 13 : 11}px;
        font-weight: 600;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">${count}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export default function MapView({ points, onSelect, onTilesFailed }: MapViewProps) {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const dimLayerRef = useRef<L.GeoJSON | null>(null)
  const highlightLayerRef = useRef<L.GeoJSON | null>(null)
  const outlineLayerRef = useRef<L.GeoJSON | null>(null)
  const cameroonGeoRef = useRef<GeoJSON.Feature | null>(null)
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)

  // ---------------------------------------------------------------------
  // Initialisation carte + tuiles + masque + groupe de clustering
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return

    const getIsDark = () => document.documentElement.classList.contains("dark")

    const map = L.map(mapDivRef.current, {
      center: CAMEROON_CENTER,
      zoom: 6,
      minZoom: 5,
      maxZoom: 14,
      zoomControl: true,
      attributionControl: true,
      maxBounds: REGION_BOUNDS,
      maxBoundsViscosity: 0.8,
    })
    map.fitBounds(REGION_BOUNDS)
    map.getContainer().style.background = "transparent"
    mapRef.current = map

    const applyTiles = (isDark: boolean) => {
      if (tileLayerRef.current) map.removeLayer(tileLayerRef.current)
      const tiles = L.tileLayer(isDark ? TILE_URL_DARK : TILE_URL_LIGHT, {
        attribution: TILE_ATTRIBUTION,
        subdomains: "abcd",
        maxZoom: 19,
      })
      tiles.on("tileerror", () => onTilesFailed(true))
      tiles.on("tileload", () => onTilesFailed(false))
      tiles.addTo(map)
      tiles.bringToBack()
      tileLayerRef.current = tiles
    }

    const applyHighlight = (isDark: boolean) => {
      if (!cameroonGeoRef.current) return
      const geom = cameroonGeoRef.current

      if (dimLayerRef.current) map.removeLayer(dimLayerRef.current)
      if (highlightLayerRef.current) map.removeLayer(highlightLayerRef.current)
      if (outlineLayerRef.current) map.removeLayer(outlineLayerRef.current)

      const dimMask = buildInverseMask(geom.geometry)
      dimLayerRef.current = L.geoJSON(dimMask, {
        style: { fillColor: isDark ? DIM_COLOR_DARK : DIM_COLOR_LIGHT, fillOpacity: 1, stroke: false },
      }).addTo(map)

      highlightLayerRef.current = L.geoJSON(geom, {
        style: { fillColor: isDark ? HIGHLIGHT_COLOR_DARK : HIGHLIGHT_COLOR_LIGHT, fillOpacity: 1, stroke: false },
      }).addTo(map)

      outlineLayerRef.current = L.geoJSON(geom, {
        style: {
          fill: false,
          color: isDark ? OUTLINE_COLOR_DARK : OUTLINE_COLOR_LIGHT,
          weight: 1.2,
          opacity: 0.55,
        },
      }).addTo(map)
    }

    applyTiles(getIsDark())

    // Groupe de clustering : au zoom faible, les points proches fusionnent en
    // bulles numérotées ; en zoomant, les clusters se scindent progressivement
    // jusqu'aux marqueurs individuels.
    clusterGroupRef.current = L.markerClusterGroup({
      maxClusterRadius: 55,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => makeClusterIcon(cluster.getChildCount()),
    })
    map.addLayer(clusterGroupRef.current)

    fetch(COUNTRIES_GEOJSON_URL)
      .then((r) => r.json())
      .then((geojson: GeoJSON.FeatureCollection) => {
        const cameroon = geojson.features.find(
          (f) => (f.properties as any)?.["ISO3166-1-Alpha-3"] === CAMEROON_ISO3
        )
        if (!cameroon) return
        cameroonGeoRef.current = cameroon
        applyHighlight(getIsDark())
      })
      .catch(() => {})

    const resizeObserver = new ResizeObserver(() => map.invalidateSize())
    resizeObserver.observe(mapDivRef.current)
    const t = setTimeout(() => map.invalidateSize(), 250)

    const themeObserver = new MutationObserver(() => {
      const nowDark = getIsDark()
      applyTiles(nowDark)
      applyHighlight(nowDark)
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    return () => {
      resizeObserver.disconnect()
      themeObserver.disconnect()
      clearTimeout(t)
      map.remove()
      mapRef.current = null
      tileLayerRef.current = null
      dimLayerRef.current = null
      highlightLayerRef.current = null
      outlineLayerRef.current = null
      clusterGroupRef.current = null
    }
  }, [onTilesFailed])

  // ---------------------------------------------------------------------
  // Marqueurs : ajoutés au groupe de clustering, clic → zoom + sélection
  // ---------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current
    const clusterGroup = clusterGroupRef.current
    if (!map || !clusterGroup) return

    clusterGroup.clearLayers()

    points.forEach((point) => {
      const iconSvg =
        point.kind === "asset" ? assetTypeIconSvg(point.assetType) : assetTypeIconSvg("network")

      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            width: 30px; height: 30px; border-radius: 9999px;
            background: var(--card, #fff);
            border: 1.5px solid var(--border, #ccc);
            display: flex; align-items: center; justify-content: center;
            color: var(--foreground, #333);
            box-shadow: 0 1px 3px rgba(0,0,0,0.25);
            cursor: pointer;
          ">
            <div style="width: 16px; height: 16px;">${iconSvg}</div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      const marker = L.marker(point.coords, { icon })

      marker.on("click", () => {
        map.flyTo(point.coords, Math.max(map.getZoom(), ASSET_DETAIL_ZOOM), { duration: 0.6 })
        onSelect(point)
      })

      clusterGroup.addLayer(marker)
    })
  }, [points, onSelect])

  return <div ref={mapDivRef} className="w-full h-full" style={{ minHeight: 420, background: "transparent" }} />
}