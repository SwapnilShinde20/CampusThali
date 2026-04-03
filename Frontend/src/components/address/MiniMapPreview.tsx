import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface MiniMapPreviewProps {
  lat: number;
  lng: number;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 16);
  return null;
}

const MiniMapPreview = ({ lat, lng }: MiniMapPreviewProps) => {
  const position: [number, number] = [lat, lng];

  return (
    <div className="w-full h-[160px] rounded-[28px] overflow-hidden border-2 border-border/10 shadow-sm relative group isolate bg-muted/5">
      <MapContainer 
        center={position} 
        zoom={16} 
        scrollWheelZoom={false} 
        dragging={false}
        zoomControl={false}
        doubleClickZoom={false}
        touchZoom={false}
        className="h-full w-full z-0 grayscale-[0.2] contrast-[1.1]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={DefaultIcon} />
        <ChangeView center={position} />
      </MapContainer>
      
      {/* Overlay to ensure no interactions and better aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10 pointer-events-auto" />
      
      <div className="absolute bottom-4 left-4 z-20 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border/20 shadow-lg">
         <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground leading-none">Map Confirmation</p>
         </div>
      </div>
    </div>
  );
};

export default MiniMapPreview;
