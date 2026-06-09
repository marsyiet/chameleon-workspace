"use client"

import "leaflet/dist/leaflet.css"

import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet"

delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

type Props = {
  scanName: string
}

export default function ScanMap({
  scanName,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <MapContainer
        center={[7.3697, 12.3547]}
        zoom={6}
        style={{
          height: "600px",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[
            3.848,
            11.502,
          ]}
        >
          <Popup>
            {scanName}
            <br />
            Yaoundé
          </Popup>
        </Marker>

        <Circle
          center={[
            3.848,
            11.502,
          ]}
          radius={50000}
        />
      </MapContainer>
    </div>
  )
}