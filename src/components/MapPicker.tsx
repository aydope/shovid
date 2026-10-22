import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/toast";

export interface Picked { line: string; lat: number; lng: number; postcode?: string; city?: string }
interface Hit { lat: string; lon: string; display_name: string; address?: Record<string, string> }

const cityOf = (a?: Record<string, string>) => a?.city ?? a?.town ?? a?.village ?? a?.municipality;

export function MapPicker({ onPick, className }: { onPick: (p: Picked) => void; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const pick = useRef(onPick);
  const toast = useToast();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [status, setStatus] = useState("Search a place, click the map, or use your location");
  useEffect(() => { pick.current = onPick; }, [onPick]);

  const place = async (lat: number, lng: number, known?: Hit) => {
    if (!map.current) return;
    const icon = new L.DivIcon({ className: "", html: '<div class="h-5 w-5 rounded-full bg-gold ring-4 ring-white shadow-xl"></div>', iconSize: [20, 20], iconAnchor: [10, 10] });
    if (marker.current) marker.current.setLatLng([lat, lng]);
    else marker.current = new L.Marker([lat, lng], { icon }).addTo(map.current);
    const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    try {
      let hit = known;
      if (!hit) {
        setStatus("Looking up address...");
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`);
        hit = (await res.json()) as Hit;
      }
      pick.current({ line: hit.display_name ?? fallback, lat, lng, postcode: hit.address?.postcode, city: cityOf(hit.address) });
      setStatus("Address selected, check the details below");
    } catch {
      pick.current({ line: fallback, lat, lng });
      setStatus("Address lookup unavailable, coordinates used");
    }
  };

  const search = async () => {
    if (!q.trim()) return;
    setStatus("Searching...");
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(q.trim())}`);
      const list = (await res.json()) as Hit[];
      setHits(list);
      setStatus(list.length ? "Choose a result" : "No places found, try a different search");
    } catch {
      setStatus("Search unavailable, check your connection");
    }
  };

  const choose = (h: Hit) => {
    setHits([]);
    setQ(h.display_name);
    map.current?.setView([Number(h.lat), Number(h.lon)], 17);
    void place(Number(h.lat), Number(h.lon), h);
  };

  useEffect(() => {
    if (!el.current) return;
    const m = new L.Map(el.current).setView([41.1496, -8.611], 12);
    new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors", maxZoom: 19 }).addTo(m);
    m.on("click", (e: L.LeafletMouseEvent) => { void place(e.latlng.lat, e.latlng.lng); });
    map.current = m;
    return () => { m.remove(); map.current = null; marker.current = null; };
  }, []);

  const locate = () => {
    if (!navigator.geolocation) { toast("Geolocation is not supported by this browser", "error"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { map.current?.setView([pos.coords.latitude, pos.coords.longitude], 16); void place(pos.coords.latitude, pos.coords.longitude); },
      () => toast("Location permission denied", "error"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };
  const onKey = (e: KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); void search(); } };

  return (
    <div className={className}>
      <div className="relative">
        <div className="flex gap-2">
          <label className="relative flex-1"><Search size={15} className="absolute left-4 top-3.5 text-ink/40" /><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Search a street, area or place" aria-label="Search a place" className="h-11 w-full rounded-full border border-sand bg-white pl-10 pr-4 text-sm outline-none focus:border-gold" /></label>
          <Button type="button" size="sm" className="h-11" onClick={() => void search()}>Search</Button>
        </div>
        {hits.length > 0 && <ul className="absolute z-[500] mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-sand">{hits.map((h) => <li key={`${h.lat}${h.lon}`}><button type="button" onClick={() => choose(h)} className="flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left text-sm hover:bg-sand/60"><MapPin size={15} className="mt-0.5 shrink-0 text-gold" />{h.display_name}</button></li>)}</ul>}
      </div>
      <div ref={el} className="relative isolate z-0 mt-3 h-72 overflow-hidden rounded-3xl ring-1 ring-sand" role="application" aria-label="Map to choose delivery location" />
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-ink/60"><span>{status}</span><Button type="button" size="sm" variant="outline" onClick={locate}><LocateFixed size={14} /> Use my location</Button></div>
    </div>
  );
}
