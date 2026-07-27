export function buildInverseMask(countryGeometry: GeoJSON.Geometry): GeoJSON.Feature {
  const worldRing: [number, number][] = [
    [-180, -90],
    [180, -90],
    [180, 90],
    [-180, 90],
    [-180, -90],
  ]

  const holes: [number, number][][] =
    countryGeometry.type === "Polygon"
      ? [countryGeometry.coordinates[0] as [number, number][]]
      : countryGeometry.type === "MultiPolygon"
        ? countryGeometry.coordinates.map((poly) => poly[0] as [number, number][])
        : []

  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [worldRing, ...holes] },
  }
}