import { useState, useCallback, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Info } from 'lucide-react';

// Fix for default marker icon in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletMapProps {
  center: [number, number];
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  onConfirm: () => void;
}

// Internal component to handle center-pin behavior
function MapController({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  const map = useMap();
  
  useMapEvents({
    moveend() {
      const center = map.getCenter();
      onChange(center.lat, center.lng);
    },
  });

  return null;
}

const LeafletMap = ({ center, onLocationSelect, onConfirm }: LeafletMapProps) => {
  const [currentPos, setCurrentPos] = useState<{lat: number, lng: number}>({ lat: center[0], lng: center[1] });
  const [addressPreview, setAddressPreview] = useState<string>("Fetching address...");

  // Reverse Geocoding using Nominatim
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      const addr = data.display_name || "Unknown Location";
      setAddressPreview(addr);
      onLocationSelect(lat, lng, addr);
    } catch (error) {
      setAddressPreview("Selection confirmed");
      onLocationSelect(lat, lng);
    }
  };

  useEffect(() => {
    fetchAddress(currentPos.lat, currentPos.lng);
  }, [currentPos]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPos({ lat: latitude, lng: longitude });
      });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-muted/10">
      <div className="flex-1 relative">
        <MapContainer 
          center={center} 
          zoom={16} 
          scrollWheelZoom={true} 
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController onChange={(lat, lng) => setCurrentPos({ lat, lng })} />
        </MapContainer>

        {/* Fixed Center Pin UX (Zomato Style) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[1000]">
          <div className="flex flex-col items-center translate-y-[-20px]">
             <div className="bg-foreground text-background px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter mb-2 shadow-xl animate-in slide-in-from-bottom-2">
                Order will be delivered here
             </div>
             <div className="relative">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full blur-[2px] absolute -bottom-1 left-1/2 -translate-x-1/2 scale-x-150" />
                <MapPin className="w-10 h-10 text-primary drop-shadow-2xl fill-primary/20" />
             </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-6 right-6 z-[1001] flex flex-col gap-2">
          <Button 
            size="icon" 
            variant="secondary" 
            className="rounded-2xl shadow-xl w-12 h-12 bg-white"
            onClick={handleUseCurrentLocation}
          >
            <Navigation className="w-5 h-5 text-primary" />
          </Button>
        </div>
      </div>

      {/* Bottom Info Card */}
      <div className="bg-background p-6 rounded-t-[32px] shadow-2xl relative z-[1002] border-t border-border/40">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
               <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black italic tracking-tighter text-lg leading-none mb-1 truncate">Current Selection</h4>
              <p className="text-xs font-medium text-muted-foreground line-clamp-2 leading-relaxed">
                {addressPreview}
              </p>
            </div>
          </div>

          <Button 
            className="w-full gradient-primary text-primary-foreground font-black italic tracking-tighter h-14 rounded-2xl shadow-xl hover:translate-y-[-2px] transition-all text-lg"
            onClick={onConfirm}
          >
            Confirm & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;
