import { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { Search, MapPin, Loader2, X, Navigation } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchProps {
  onSelect: (lat: number, lng: number, address: string) => void;
  onClose: () => void;
}

const LocationSearch = ({ onSelect, onClose }: LocationSearchProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const fetchSuggestions = useCallback(
    debounce(async (searchValue: string) => {
      if (searchValue.length < 3) return;
      
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchValue)}&limit=5&addressdetails=1`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsDetecting(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          onSelect(latitude, longitude, data.display_name || "Current Location");
        } catch (error) {
          onSelect(latitude, longitude, "Current Location");
        } finally {
          setIsDetecting(false);
        }
      }, (error) => {
        console.error("Geolocation failed:", error);
        setIsDetecting(false);
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 pb-2 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
             <h3 className="font-black italic tracking-tighter text-xl">Where to?</h3>
             <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Find your delivery spot</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            )}
          </div>
          <input 
            autoFocus
            type="text"
            placeholder="Search society, building or area"
            className="w-full bg-muted/20 border-none rounded-2xl h-14 pl-12 pr-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Use Current Location Button - Zepto Style */}
        <Button 
          variant="ghost" 
          onClick={handleUseCurrentLocation}
          disabled={isDetecting}
          className="w-full h-12 justify-start gap-4 px-0 hover:bg-transparent group active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
            {isDetecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 text-primary group-hover:text-white" />
            )}
          </div>
          <div className="text-left">
            <p className="font-black italic tracking-tighter text-sm uppercase text-primary leading-none mb-0.5">Use Current Location</p>
            <p className="text-[9px] uppercase tracking-widest font-black text-muted-foreground opacity-60">Using GPS for accuracy</p>
          </div>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {suggestions.length > 0 ? (
          suggestions.map((s) => (
            <button
              key={s.place_id}
              className="w-full text-left p-4 rounded-2xl hover:bg-muted/30 transition-all flex items-start gap-4 active:scale-[0.98]"
              onClick={() => onSelect(parseFloat(s.lat), parseFloat(s.lon), s.display_name)}
            >
              <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 mt-1">
                 <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-bold text-sm leading-tight line-clamp-1 mb-0.5">{s.display_name.split(',')[0] || "Location"}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed opacity-70 italic">{s.display_name.split(',').slice(1).join(',').trim() || "Address Details"}</p>
              </div>
            </button>
          ))
        ) : query.length >= 3 && !isLoading ? (
          <div className="py-20 text-center opacity-40 italic flex flex-col items-center">
             <MapPin className="w-8 h-8 mb-4 stroke-[1.5px]" />
             <p className="text-sm font-bold uppercase tracking-tighter">No locations found</p>
          </div>
        ) : query.length === 0 && (
          <div className="py-8 space-y-6">
             <div className="space-y-4">
                <p className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Previous Searches</p>
                <div className="px-4 py-8 text-center text-[10px] uppercase font-black tracking-widest text-muted-foreground border-2 border-dashed border-border/50 rounded-[40px] opacity-40">
                   Empty History
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSearch;
