// @ts-nocheck
import React, { useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Plane, Stamp, Wifi, Wallet, MapPin, Backpack, Home, ChevronRight, ChevronDown,
  ShieldCheck, ExternalLink, FileText, CheckCircle2, Circle, Bell,
  Zap, CreditCard, Banknote, Smartphone, CloudRain, Sun, Wind,
  AlertTriangle, Upload, Check, Compass, Utensils, Calendar, Clock,
  Settings2, ArrowRight, Radio, Eye, Car, Bike, TrainFront, Bus, Footprints,
  Coffee, Beer, ShoppingBag, Landmark, ArrowLeft, Search, X, Ticket, Navigation, Map
} from "lucide-react";


/* ---------- design tokens ---------- */
const T = {
  bg: "#F5F6F3",
  card: "#FFFFFF",
  ink: "#15201D",
  sub: "#5C6B66",
  jade: "#0D3B34",
  jadeSoft: "#E4EEE9",
  sand: "#EFE9DC",
  accent: "#C9A24B",      // gold — replaces tangerine for cohesion with jade/sand
  accentSoft: "#F6EFDD",
  line: "#E3E7E2",
  gold: "#C9A24B",
};

const font = {
  display: "'Fraunces', Georgia, serif",
  ui: "'Instrument Sans', -apple-system, sans-serif",
};

/* ---------- brand mark ----------
   The Lotus Pin: a map pin with a lotus opening inside it, gold seed at the
   centre. Geometry never changes — only the fill and the surface treatment.
     size >= 22  → deboss (pressed into the surface)
     20–21       → flat (filter is invisible at this scale, so skip the cost)
     < 20        → micro (petals turn to mush; pin + seed only)
   tone="dark" inverts it for use on a jade field. */
const MARK_PIN = "M32 58C32 58 52 40 52 26A20 20 0 0 0 12 26C12 40 32 58 32 58Z";
const MARK_PETALS = [
  "M18.88 18.91C27.15 20.19 32.14 25.93 32 34C23.99 33.01 19 27.28 18.88 18.91Z",
  "M32 14C37.4 20.4 37.4 28 32 34C26.6 28 26.6 20.4 32 14Z",
  "M45.12 18.91C45 27.28 40.01 33.01 32 34C31.86 25.93 36.85 20.19 45.12 18.91Z",
];

function TravelPalMark({ size = 24, tone = "light", variant = "auto", style }) {
  const uid = React.useId().replace(/:/g, "");
  const v = variant !== "auto" ? variant : size < 20 ? "micro" : size < 22 ? "flat" : "deboss";
  const pinFill = tone === "dark" ? T.sand : T.jade;
  const petalFill = tone === "dark" ? T.jade : T.sand;
  const common = {
    width: size, height: size, viewBox: "0 0 64 64",
    role: "img", "aria-label": "Travel Pal",
    style: { display: "block", flexShrink: 0, ...style },
  };

  if (v === "micro") {
    return (
      <svg {...common}>
        <path d={MARK_PIN} fill={pinFill} />
        <circle cx="32" cy="25" r="7.5" fill={T.gold} />
      </svg>
    );
  }

  const art = (
    <>
      <path d={MARK_PIN} fill={pinFill} />
      <g fill={petalFill}>{MARK_PETALS.map((d, i) => <path key={i} d={d} />)}</g>
      <circle cx="32" cy="37.5" r="3" fill={T.gold} />
    </>
  );

  if (v === "flat") return <svg {...common}>{art}</svg>;

  const fid = "tpDeboss-" + uid;
  return (
    <svg {...common}>
      <defs>
        <filter id={fid} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="b" />
          <feOffset in="b" dx="0" dy="1.5" result="o" />
          <feComposite in="SourceAlpha" in2="o" operator="out" result="i" />
          <feFlood floodColor="#04211B" floodOpacity="0.55" />
          <feComposite in2="i" operator="in" result="s" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="s" />
          </feMerge>
        </filter>
      </defs>
      <g filter={"url(#" + fid + ")"}>{art}</g>
    </svg>
  );
}

/* The one lockup. The mark now does the job the glyph used to. Don't re-space it by hand. */
function Brand({ size = 22, tone = "light" }) {
  return (
    <span className="flex items-center" style={{ gap: 8 }}>
      <TravelPalMark size={size} tone={tone} />
      <span style={{
        fontFamily: font.display, fontStyle: "italic", fontSize: 15,
        color: tone === "dark" ? T.sand : T.jade, whiteSpace: "nowrap",
      }}>
        travelpal việt nam
      </span>
    </span>
  );
}

/* ---------- data ---------- */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const DURATIONS = [
  { id: "short", label: "Under a week" },
  { id: "two", label: "1–2 weeks" },
  { id: "month", label: "2–4 weeks" },
  { id: "long", label: "A month or more" },
];

const DESTS = [
  { id: "hcmc", name: "Ho Chi Minh City", region: "south", blurb: "Street food, rooftops, momentum" },
  { id: "hanoi", name: "Hanoi", region: "north", blurb: "Old Quarter, lakes, egg coffee" },
  { id: "danang", name: "Đà Nẵng & Hội An", region: "central", blurb: "Beaches, lanterns, tailors" },
  { id: "hue", name: "Huế", region: "central", blurb: "Imperial citadel, royal food" },
  { id: "phuquoc", name: "Phú Quốc", region: "south", blurb: "Island beaches, sunsets" },
  { id: "mekong", name: "Mekong Delta", region: "south", blurb: "Floating markets, canals" },
  { id: "halong", name: "Hạ Long Bay", region: "north", blurb: "Karsts, overnight cruises" },
  { id: "sapa", name: "Sapa", region: "north", blurb: "Rice terraces, trekking" },
];

const REGION_META = {
  north: { name: "The North" },
  central: { name: "The Centre" },
  south: { name: "The South" },
};

const VISA_STEPS = [
  { id: "scan", label: "Scan passport bio page", hint: "JPG, straight-on, all corners visible" },
  { id: "photo", label: "Portrait photo, white background", hint: "No glasses, recent" },
  { id: "apply", label: "Apply on the official portal", hint: "evisa.gov.vn — nowhere else" },
  { id: "pay", label: "Pay the government fee by card", hint: "USD 25 single / 50 multiple entry" },
  { id: "download", label: "Download your e-visa PDF", hint: "Usually 3–5 working days" },
  { id: "print", label: "Print one paper copy", hint: "Border officers still ask for paper" },
];

const DOCS = [
  { id: "passport", label: "Passport", sub: "Bio page scan" },
  { id: "evisa", label: "E-visa PDF", sub: "Approval letter" },
  { id: "insurance", label: "Travel insurance", sub: "Policy certificate" },
];

const ESIMS = [
  { name: "Airalo", url: "https://www.airalo.com", note: "Cheapest per GB, huge range of Vietnam packs", tag: "Best value" },
  { name: "Saily", url: "https://saily.com", note: "Simple app, solid Vietnam coverage via local networks", tag: "Easiest setup" },
  { name: "Holafly", url: "https://esim.holafly.com", note: "Unlimited-data plans if you don't want to count GB", tag: "Unlimited" },
];

const ATMS = [
  { bank: "TPBank", limit: "≈ 5,000,000₫ / withdrawal", fee: "Low or no local fee", note: "LiveBank kiosks are everywhere in cities" },
  { bank: "VPBank", limit: "≈ 5,000,000₫ / withdrawal", fee: "Low local fee", note: "Reliable with foreign Visa/Mastercard" },
  { bank: "Agribank", limit: "≈ 3,000,000₫ / withdrawal", fee: "Small fee", note: "The one you'll find in small towns" },
  { bank: "HSBC / int'l banks", limit: "Higher limits", fee: "Higher fee (~2–3%)", note: "Useful for pulling larger sums at once" },
];

/* ---------- districts & neighbourhoods ----------
   Districts are the top level of Explore. A hood's `area` is the named
   sub-neighbourhood inside a district — null when the district has no
   distinct sub-area of its own (District 3, Bình Thạnh, Phú Nhuận).
   Every label in the app is derived from this, so tiles, filters and
   headings can never drift apart (previously DIST_NAME and DIST_FILTERS
   were hand-written and had drifted out of sync with each other). */
const DISTRICTS = [
  { id: "D1", name: "District 1" },
  { id: "D3", name: "District 3" },
  { id: "D4", name: "District 4" },
  { id: "D5", name: "District 5" },
  { id: "D2", name: "District 2" },
  { id: "BT", name: "Bình Thạnh" },
  { id: "PN", name: "Phú Nhuận" },
  { id: "D7", name: "District 7" },
];

const distName = (id) =>
  (DISTRICTS.find((d) => d.id === id) || {}).name || (id === "X" ? "Around town" : id);

/* Areas belonging to a district, in listed order. */
const areasIn = (id) => HOODS.filter((h) => h.dist === id && h.area).map((h) => h.area);

/* The one label rule: "District 5 · Chợ Lớn" when a district has a single
   named area, plain district name when it has none or several. */
const distLabel = (id) => {
  const a = areasIn(id);
  return a.length === 1 ? distName(id) + " · " + a[0] : distName(id);
};

/* A neighbourhood's own label always leads with its district. */
const hoodLabel = (h) => (h.area ? distName(h.dist) + " · " + h.area : distName(h.dist));

const HOODS = [
  {
    id: "d1-dongkhoi",
    area: "Đồng Khởi",
    price: "$$$",
    tags: ["First trip", "Walkable", "Landmarks"],
    feel: "The polished heart of Saigon: French-era boulevards, the Opera House, Nguyễn Huệ walking street. You can do your first three days here entirely on foot.",
    who: "First-timers, short stays, anyone who wants landmarks outside the hotel door.",
    eat: "Bánh mì Huỳnh Hoa for the city's most famous sandwich; the Café Apartment at 42 Nguyễn Huệ — nine floors of cafés in an old block.",
    watch: "Keep your phone off the kerb side of the pavement — drive-by snatching is D1's one real annoyance.",
    dist: "D1",
  },
  {
    id: "d1-buivien",
    area: "Bùi Viện",
    price: "$",
    tags: ["Nightlife", "Hostels", "Loud"],
    feel: "The backpacker artery. Neon, beer crates on the pavement, music until 4am. Chaotic in the fun way, then just chaotic.",
    who: "Night owls, solo travellers wanting instant company, tight budgets.",
    eat: "Street seafood carts after 9pm; walk two blocks off the strip and prices halve.",
    watch: "Genuinely hard to sleep before 2am on the strip itself. Book one street back minimum.",
    dist: "D1",
  },
  {
    id: "d3",
    area: null,
    price: "$$",
    tags: ["Local", "Cafés", "Colonial villas"],
    feel: "Ten minutes from D1, half the noise. Tree-lined streets, old villas turned into cafés, office workers queuing for bún at lunch. This is everyday Saigon.",
    who: "Second visits, remote workers, café people, anyone allergic to tourist menus.",
    eat: "Turtle Lake (Hồ Con Rùa) street-snack scene at night; hidden villa cafés around Tú Xương street.",
    watch: "Fewer hotels — look at serviced apartments and boutique stays instead.",
    dist: "D3",
  },
  {
    id: "d2-thaodien",
    area: "Thảo Điền",
    price: "$$$",
    tags: ["Expat", "Leafy", "Brunch"],
    feel: "Riverside and green, with international schools, wine bars and smoothie bowls. Feels like a different city — some love the calm, some feel they've left Vietnam.",
    who: "Families, longer stays, anyone who wants quiet mornings and western comforts.",
    eat: "Brunch spots along Xuân Thủy; The Deck for sunset drinks on the river.",
    watch: "Floods at high tide after heavy rain, and you'll Grab everywhere — it's 20–30 min to D1.",
    dist: "D2",
  },
  {
    id: "d4",
    area: null,
    price: "$",
    tags: ["Street food", "Cheap", "Untouristed"],
    feel: "One bridge from D1 and barely a tourist in sight. Dense alleys, plastic stools, and Saigon's best snail-and-seafood street.",
    who: "Eaters. Sleep in D1 or D3, spend your evenings here.",
    eat: "Vĩnh Khánh street — the famous ốc (snail) alley. Point at tanks, order rounds, repeat.",
    watch: "Very few hotels worth booking; treat it as a food destination, not a base.",
    dist: "D4",
  },
  {
    id: "d5-cholon",
    area: "Chợ Lớn",
    price: "$",
    tags: ["Chinatown", "Temples", "Markets"],
    feel: "Saigon's Chinatown — incense-thick pagodas, wholesale markets and old-school cơm tấm. The most photogenic morning in the city.",
    who: "Second visits, early risers, anyone chasing markets and temples over rooftops.",
    eat: "Phở Lệ for southern-style broth; Bình Tây market for the real wholesale trade.",
    watch: "Spread out and hot — plan a morning here, then Grab back before midday.",
    dist: "D5",
  },
  {
    id: "bt",
    area: null,
    price: "$$",
    tags: ["Local indie", "Hidden bars", "Nightlife"],
    feel: "Where the city's most interesting hidden bars live, alongside Landmark 81 and riverside towers. Local-feeling, low-tourist.",
    who: "Repeat visitors and night people who want bars locals actually go to.",
    eat: "Tủ Bar behind a wardrobe door; riverside towers for the skyline view.",
    watch: "Not walkable from D1 — arrive by Grab, and plan your ride home too.",
    dist: "BT",
  },
  {
    id: "pn",
    area: null,
    price: "$",
    tags: ["Residential", "Cafés", "Everyday"],
    feel: "Quiet residential district between the airport and the centre. Neighbourhood cafés, no tourist infrastructure, real daily Saigon.",
    who: "Long-stayers and anyone who wants to live somewhere rather than visit it.",
    eat: "Courtyard cafés with koi ponds; Chinese dessert counters worth the detour.",
    watch: "Little to do at night — it's a base, not a destination.",
    dist: "PN",
  },
  {
    id: "d7-pmh",
    area: "Phú Mỹ Hưng",
    price: "$$",
    tags: ["Planned", "Families", "Spacious"],
    feel: "Wide boulevards, actual footpaths and a large Korean and Japanese community. Feels nothing like the rest of the city.",
    who: "Families and long stays wanting space, quiet and easy driving.",
    eat: "Strong Japanese and Korean scene; pastry shops and mall dining.",
    watch: "A long way from D1 — 30–45 minutes each way. Only worth it if you're staying a while.",
    dist: "D7",
  },
];

const ROUTE_GUIDES = {
  hcmc: { stay: "District 1 or 3 — see the neighbourhood guide", eat: "Cơm tấm, hủ tiếu, bánh mì", tip: "Book 3–4 nights; day-trip to Củ Chi or the Mekong from here." },
  hanoi: { stay: "Old Quarter for atmosphere, Tây Hồ for calm", eat: "Phở gà, bún chả, egg coffee", tip: "Trains and sleeper buses to Sapa and Hạ Long leave from here." },
  danang: { stay: "Đà Nẵng beachside, or inside Hội An's old town", eat: "Cao lầu, mì Quảng, bánh xèo", tip: "Get suits and dresses tailored in Hội An on day one — fittings take 2–3 days." },
  hue: { stay: "South bank of the Perfume River", eat: "Bún bò Huế at the source", tip: "One full day for the citadel and royal tombs is enough for most." },
  phuquoc: { stay: "Long Beach for sunsets and restaurants", eat: "Grilled seafood at the night market", tip: "Direct flights from both SGN and Hanoi; ferries from Hà Tiên." },
  mekong: { stay: "Cần Thơ overnight for the floating market", eat: "Elephant-ear fish, coconut everything", tip: "Go early — Cái Răng floating market winds down by 8am." },
  halong: { stay: "One night on a mid-range cruise boat", eat: "Seafood on board", tip: "Book cruises ahead in peak months; day trips feel rushed." },
  sapa: { stay: "Homestays in Tả Van village beat the town", eat: "Thắng cố if brave, grilled everything if not", tip: "Pack real layers — it's cold up here even when Hanoi is warm." },
};

function seasonFor(region, m) {
  if (region === "south") {
    return m >= 4 && m <= 9
      ? { label: "Wet season", icon: "rain", temp: "26–33°C", note: "Short, hard afternoon downpours — mornings usually clear.", add: ["Packable rain shell", "Quick-dry footwear", "Dry bag for phone"] }
      : { label: "Dry season", icon: "sun", temp: "25–35°C", note: "Hot and bright, March–April is peak heat.", add: ["High-SPF sunscreen", "Hat & sunglasses", "Electrolyte sachets"] };
  }
  if (region === "central") {
    if (m >= 8 && m <= 10) return { label: "Typhoon season", icon: "wind", temp: "24–30°C", note: "Storms and flooding possible Sep–Nov. Build slack into plans.", add: ["Proper rain jacket", "Waterproof bag liner", "Flexible bookings"] };
    return { label: "Beach season", icon: "sun", temp: "24–34°C", note: "Feb–Aug is the sweet spot for Đà Nẵng and Hội An sands.", add: ["Swimwear", "Reef-safe sunscreen", "Light linen layers"] };
  }
  if (m === 11 || m <= 1) return { label: "Cool winter", icon: "wind", temp: "10–18°C", note: "Hanoi gets genuinely cold and damp; Sapa can approach freezing.", add: ["Warm mid-layer", "Light down jacket", "Closed shoes"] };
  if (m >= 4 && m <= 8) return { label: "Hot & humid", icon: "rain", temp: "26–37°C", note: "Sticky heat with heavy summer rain, especially Jul–Aug.", add: ["Rain shell", "Breathable fabrics", "Repellent (evenings)"] };
  return { label: "Mild & clear", icon: "sun", temp: "18–28°C", note: "Autumn and spring are the north at its best.", add: ["Light layers", "Comfortable walking shoes"] };
}

const PACK_BASE = [
  "Universal adapter (A/C plugs, 220V)",
  "Mosquito repellent",
  "Sandals + one closed pair",
  "Shoulder/knee cover for temples",
  "Basic meds & rehydration salts",
  "Paper copy of e-visa + passport",
];

/* ---------- atoms ---------- */
const Card = ({ children, style, onClick }) => (
  <div
    onClick={onClick}
    className={onClick ? "cursor-pointer active:opacity-80" : ""}
    style={{ background: T.card, borderRadius: 24, border: `1px solid ${T.line}`, padding: 18, ...style }}
  >
    {children}
  </div>
);

const Eyebrow = ({ children, color = T.sub }) => (
  <div style={{ fontFamily: font.ui, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color, fontWeight: 600 }}>
    {children}
  </div>
);

const H = ({ children, size = 24, style }) => (
  <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: size, color: T.ink, lineHeight: 1.15, ...style }}>
    {children}
  </div>
);

const P = ({ children, style }) => (
  <div style={{ fontFamily: font.ui, fontSize: 13.5, color: T.sub, lineHeight: 1.55, ...style }}>{children}</div>
);

const Tag = ({ children, tone = "jade" }) => (
  <span style={{
    fontFamily: font.ui, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
    background: tone === "accent" ? T.accentSoft : T.jadeSoft,
    color: tone === "accent" ? "#8A6D25" : T.jade,
  }}>{children}</span>
);

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)",
      background: T.ink, color: "#fff", fontFamily: font.ui, fontSize: 13,
      padding: "10px 16px", borderRadius: 999, whiteSpace: "nowrap", zIndex: 50,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <Check size={14} color="#7FD1B0" /> {msg}
    </div>
  );
}

/* ---------- onboarding ---------- */
function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState("planner");
  const [country, setCountry] = useState("vietnam");
  const [city, setCity] = useState("saigon");

  const ModeCard = ({ id, icon: Icon, title, desc }) => {
    const on = mode === id;
    return (
      <button onClick={() => setMode(id)}
        className="flex items-start gap-3"
        style={{
          padding: "16px 18px", borderRadius: 18, fontFamily: font.ui,
          background: on ? T.jade : "rgba(255,255,255,0.9)",
          border: `1px solid ${on ? T.jade : T.line}`, textAlign: "left", width: "100%",
        }}>
        <div style={{
          width: 40, height: 40, borderRadius: 14, flexShrink: 0,
          background: on ? "rgba(255,255,255,0.12)" : T.jadeSoft,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} color={on ? T.accent : T.jade} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: on ? "#fff" : T.ink }}>{title}</div>
          <div style={{ fontSize: 12.5, color: on ? "#B9CEC4" : T.sub, marginTop: 3, lineHeight: 1.45 }}>{desc}</div>
        </div>
        {on && <Check size={16} color={T.accent} style={{ flexShrink: 0, marginTop: 3 }} />}
      </button>
    );
  };

  const steps = [
    {
      eyebrow: "Welcome",
      title: "Travel Pal",
      subtitle: "Everything you need for your Vietnam trip — in one place.",
      body: (
        <div className="flex flex-col gap-4">
          <div style={{
            background: T.jade, borderRadius: 24, padding: "24px 20px 20px", color: "#F2F5F0", textAlign: "center",
          }}>
            <TravelPalMark size={58} tone="dark" style={{ margin: "0 auto 16px" }} />
            <div style={{ fontFamily: font.display, fontSize: 32, fontWeight: 700, lineHeight: 1.1 }}>
              Visa handled. Documents safe. Questions answered.
            </div>
            <P style={{ color: "#B9CEC4", marginTop: 12 }}>No booking, no fees — just guidance that doesn't go stale.</P>
          </div>
        </div>
      ),
      valid: true,
    },
    {
      eyebrow: "How can we help?",
      title: "Pick your path",
      body: (
        <div className="flex flex-col gap-2">
          <ModeCard id="planner" icon={Stamp} title="Plan my trip"
            desc="The full toolkit — visa checklist, document wallet, flight reminders, plus every guide." />
          <ModeCard id="guide" icon={Compass} title="Just exploring"
            desc="Skip the planning. Go straight to the travel guide — neighbourhoods, SIM, money, transport." />
          <P style={{ fontSize: 12, marginTop: 6 }}>You can switch anytime from the settings icon.</P>
        </div>
      ),
      valid: true,
    },
    {
      eyebrow: "Step 1",
      title: "Where are you going?",
      body: (
        <div className="flex flex-col gap-2">
          <button onClick={() => setCountry("vietnam")}
            className="flex items-center justify-between"
            style={{
              padding: "16px 18px", borderRadius: 18, fontFamily: font.ui, fontSize: 15, fontWeight: 600,
              background: country === "vietnam" ? T.jade : "rgba(255,255,255,0.9)",
              color: country === "vietnam" ? "#fff" : T.ink,
              border: `1px solid ${country === "vietnam" ? T.jade : T.line}`, textAlign: "left",
            }}>
            Vietnam
            {country === "vietnam" && <Check size={16} color={T.accent} />}
          </button>
          <P style={{ fontSize: 12, marginTop: 6 }}>We're focusing on Vietnam for now — other countries coming soon.</P>
        </div>
      ),
      valid: country === "vietnam",
    },
    {
      eyebrow: "Step 2",
      title: "Which city?",
      body: (
        <div className="flex flex-col gap-2">
          <button onClick={() => setCity("saigon")}
            className="flex items-center justify-between"
            style={{
              padding: "16px 18px", borderRadius: 18, fontFamily: font.ui, fontSize: 15, fontWeight: 600,
              background: city === "saigon" ? T.jade : "rgba(255,255,255,0.9)",
              color: city === "saigon" ? "#fff" : T.ink,
              border: `1px solid ${city === "saigon" ? T.jade : T.line}`, textAlign: "left",
            }}>
            Ho Chi Minh City
            {city === "saigon" && <Check size={16} color={T.accent} />}
          </button>
          <P style={{ fontSize: 12, marginTop: 6 }}>We'll personalise arrival guidance and neighbourhood advice for where you land.</P>
        </div>
      ),
      valid: city === "saigon",
    },
  ];

  const isLast = step === steps.length - 1 || (step === 1 && mode === "guide");
  const s = steps[step];

  const advance = () => {
    if (!s.valid) return;
    if (step === 1 && mode === "guide") {
      onDone({ mode, country, city });
      return;
    }
    if (step < steps.length - 1) setStep(step + 1);
    else onDone({ mode, country, city });
  };

  return (
    <div style={{ height: "100%", background: T.sand, display: "flex", flexDirection: "column", padding: "26px 22px 22px", overflowY: "auto" }}>
      <div className="flex items-center justify-between">
        <Brand />
        {step > 0 && (
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 99, background: i <= step ? T.jade : "#D5CFC0", transition: "width 0.25s" }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 34, flex: 1 }}>
        {s.eyebrow && <Eyebrow>{s.eyebrow}</Eyebrow>}
        <H size={30} style={{ margin: "10px 0 20px" }}>{s.title}</H>
        {s.subtitle && <P style={{ marginBottom: 16 }}>{s.subtitle}</P>}
        {s.body}
      </div>

      <div className="flex gap-2" style={{ marginTop: 20 }}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)}
            style={{ padding: "15px 20px", borderRadius: 18, fontFamily: font.ui, fontSize: 14, fontWeight: 700, background: "transparent", color: T.sub, border: `1px solid ${T.line}` }}>
            Back
          </button>
        )}
        <button
          onClick={advance}
          className="flex-1 flex items-center justify-center gap-2"
          style={{
            padding: "15px 0", borderRadius: 18, fontFamily: font.ui, fontSize: 15, fontWeight: 700,
            background: s.valid ? T.ink : "#C6CBC7", color: "#fff", border: "none",
          }}>
          {isLast ? (mode === "guide" ? "Open the guide" : "Let's go") : "Continue"} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ---------- trip card ---------- */
function TripCard({ trip, onVisa, visaDone, visaTotal }) {
  return (
    <div style={{ background: T.jade, borderRadius: 28, padding: 22, position: "relative", overflow: "hidden", color: "#F2F5F0" }}>
      <svg style={{ position: "absolute", inset: 0, opacity: 0.08 }} width="100%" height="100%">
        {[...Array(6)].map((_, i) => (
          <circle key={i} cx="85%" cy="10%" r={40 + i * 34} fill="none" stroke="#fff" strokeWidth="1" />
        ))}
      </svg>
      <div className="flex items-start justify-between" style={{ position: "relative" }}>
        <div>
          <Eyebrow color="#9DBBAF">Your destination</Eyebrow>
          <div style={{ fontFamily: font.display, fontSize: 28, fontWeight: 600, marginTop: 6, lineHeight: 1.1 }}>
            Ho Chi Minh City
          </div>
          <div style={{ fontFamily: font.ui, fontSize: 13, color: "#B9CEC4", marginTop: 5 }}>
            Vietnam · Tân Sơn Nhất Airport
          </div>
        </div>
      </div>
      <div style={{ borderTop: "2px dashed rgba(255,255,255,0.25)", margin: "18px -22px 0", padding: "14px 22px 0" }}>
        <div className="flex items-center justify-between" onClick={onVisa} style={{ cursor: "pointer" }}>
          <div className="flex items-center gap-2">
            <Stamp size={16} color={T.accent} />
            <span style={{ fontFamily: font.ui, fontSize: 13, fontWeight: 600 }}>
              Visa · {visaDone}/{visaTotal} steps done
            </span>
          </div>
          <ChevronRight size={16} color="#B9CEC4" />
        </div>
      </div>
    </div>
  );
}

/* ---------- flight card ---------- */
function FlightCard({ flight, setFlight, toast }) {
  const [form, setForm] = useState({ code: "", date: "" });
  return (
    <Card>
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <div className="flex items-center gap-2">
          <Plane size={16} color={T.jade} />
          <Eyebrow>Your flight</Eyebrow>
        </div>
        {flight && <Tag tone="gold"><Radio size={10} style={{ display: "inline", marginRight: 4 }} />Live status — demo</Tag>}
      </div>
      {flight ? (
        <div>
          <div className="flex items-center justify-between">
            <div>
              <H size={20}>{flight.code.toUpperCase()}</H>
              <P>Arrives SGN · {flight.date || "date TBC"}</P>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: font.ui, fontSize: 13, fontWeight: 700, color: T.jade }}>On time</div>
              <P style={{ fontSize: 11 }}>checked just now</P>
            </div>
          </div>
          <div className="flex gap-2" style={{ marginTop: 12 }}>
            <button onClick={() => toast("Reminder set for 24h before")}
              className="flex-1 flex items-center justify-center gap-2"
              style={{ background: T.ink, color: "#fff", border: "none", borderRadius: 14, padding: "11px 0", fontFamily: font.ui, fontSize: 13, fontWeight: 700 }}>
              <Bell size={13} /> Remind me
            </button>
            <button onClick={() => toast("We'll ping you on delay or gate change")}
              className="flex-1 flex items-center justify-center gap-2"
              style={{ background: T.jadeSoft, color: T.jade, border: "none", borderRadius: 14, padding: "11px 0", fontFamily: font.ui, fontSize: 13, fontWeight: 700 }}>
              <Eye size={13} /> Watch flight
            </button>
          </div>
          <P style={{ marginTop: 10, fontSize: 11.5 }}>
            Status is demo data for now — live delay & cancellation tracking plugs in here via a flight API when the backend is wired.
          </P>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="Flight number — e.g. VN782"
            style={{ fontFamily: font.ui, fontSize: 14, padding: "11px 14px", borderRadius: 14, border: `1px solid ${T.line}`, background: T.bg, outline: "none", color: T.ink }}
          />
          <div className="flex gap-2">
            <input
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              placeholder="Date — 12 Sep, 10:45"
              style={{ flex: 1, fontFamily: font.ui, fontSize: 14, padding: "11px 14px", borderRadius: 14, border: `1px solid ${T.line}`, background: T.bg, outline: "none", color: T.ink }}
            />
            <button
              onClick={() => { if (form.code) { setFlight(form); toast("Flight added"); } }}
              style={{ background: T.ink, color: "#fff", border: "none", borderRadius: 14, padding: "0 18px", fontFamily: font.ui, fontSize: 13, fontWeight: 700 }}>
              Add
            </button>
          </div>
          <P style={{ fontSize: 11.5 }}>Add it once — delay and cancellation alerts arrive with the live version.</P>
        </div>
      )}
    </Card>
  );
}

/* ---------- home ---------- */
function HomeScreen({ trip, go, visaDone, flight, setFlight, toast }) {
  const quick = [
    { icon: Wifi, label: "SIM & data", tab: "arrive" },
    { icon: Wallet, label: "Money", tab: "arrive" },
    { icon: Car, label: "Getting around", tab: "arrive" },
    { icon: Zap, label: "Fast track", tab: "visa" },
    { icon: MapPin, label: "Where to stay", tab: "explore" },
  ];
  
  return (
    <div className="flex flex-col gap-4">
      <div>
        <P style={{ fontSize: 13 }}>Xin chào, Mark</P>
        <H size={28}>Vietnam is waiting.</H>
      </div>

      <TripCard trip={trip} onVisa={() => go("visa")} visaDone={visaDone} visaTotal={VISA_STEPS.length} />

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ margin: "0 -4px", padding: "0 4px" }}>
        {quick.map((q) => (
          <button key={q.label} onClick={() => go(q.tab)} className="flex items-center gap-2 flex-shrink-0"
            style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 999, padding: "9px 14px", fontFamily: font.ui, fontSize: 12.5, fontWeight: 600, color: T.ink }}>
            <q.icon size={14} color={T.jade} /> {q.label}
          </button>
        ))}
      </div>

      <FlightCard flight={flight} setFlight={setFlight} toast={toast} />

      <Card onClick={() => go("pack")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ width: 40, height: 40, borderRadius: 14, background: T.sand, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Backpack size={18} color={T.jade} />
            </div>
            <div>
              <div style={{ fontFamily: font.ui, fontWeight: 600, fontSize: 14, color: T.ink }}>Packing tips</div>
              <P style={{ fontSize: 12.5 }}>What to bring for Ho Chi Minh City — by season</P>
            </div>
          </div>
          <ChevronRight size={16} color={T.sub} />
        </div>
      </Card>
    </div>
  );
}

/* ---------- visa ---------- */
function VisaScreen({ trip, steps, toggleStep, docs, addDoc, toast }) {
  const [ftOpen, setFtOpen] = useState(false);
  const done = Object.values(steps).filter(Boolean).length;
  const longStay = trip.duration === "long";
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Eyebrow>Visa</Eyebrow>
        <H size={26}>One official website. That's it.</H>
      </div>

      <div style={{ background: T.jade, borderRadius: 24, padding: 18, color: "#F2F5F0" }}>
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} color={T.gold} />
          <span style={{ fontFamily: font.ui, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>OFFICIAL PORTAL</span>
        </div>
        <div style={{ fontFamily: font.display, fontSize: 22, marginTop: 8 }}>evisa.gov.vn</div>
        <P style={{ color: "#B9CEC4", marginTop: 6 }}>
          Government fee: USD 25 single entry · USD 50 multiple. Up to 90 days. Apply at least 2 weeks out.
        </P>
        <button onClick={() => window.open("https://evisa.gov.vn", "_blank")}
          style={{ marginTop: 12, background: T.ink, color: "#fff", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "10px 16px", fontFamily: font.ui, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          Apply now <ExternalLink size={13} />
        </button>
      </div>

      {longStay && (
        <div style={{ background: "#F6EFDD", borderRadius: 18, padding: 14, display: "flex", gap: 10 }}>
          <Clock size={16} color="#8A6D25" style={{ flexShrink: 0, marginTop: 2 }} />
          <P style={{ color: "#6E5720" }}>
            Staying a month or more? The e-visa covers up to 90 days — choose multiple entry if you'll hop to Cambodia or Thailand and back.
          </P>
        </div>
      )}

      <div style={{ background: T.accentSoft, borderRadius: 18, padding: 14, display: "flex", gap: 10 }}>
        <AlertTriangle size={16} color={T.accent} style={{ flexShrink: 0, marginTop: 2 }} />
        <P style={{ color: "#8A3A22" }}>
          Lookalike "agent" sites charge 5–10× the fee for the same visa. Some nationalities don't need a visa at all for short stays — check yours before paying anything.
        </P>
      </div>

      <Card>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <Eyebrow>Your steps</Eyebrow>
          <Tag>{done}/{VISA_STEPS.length}</Tag>
        </div>
        <div className="flex flex-col">
          {VISA_STEPS.map((s, i) => (
            <div key={s.id} onClick={() => toggleStep(s.id)} className="flex items-start gap-3 cursor-pointer"
              style={{ padding: "10px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
              {steps[s.id]
                ? <CheckCircle2 size={19} color={T.jade} style={{ flexShrink: 0, marginTop: 1 }} />
                : <Circle size={19} color={T.line} style={{ flexShrink: 0, marginTop: 1 }} />}
              <div>
                <div style={{ fontFamily: font.ui, fontSize: 14, fontWeight: 600, color: steps[s.id] ? T.sub : T.ink, textDecoration: steps[s.id] ? "line-through" : "none" }}>{s.label}</div>
                <P style={{ fontSize: 12 }}>{s.hint}</P>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Eyebrow>Document wallet</Eyebrow>
        <div className="flex flex-col" style={{ marginTop: 6 }}>
          {DOCS.map((d, i) => (
            <div key={d.id} className="flex items-center justify-between" style={{ padding: "12px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
              <div className="flex items-center gap-3">
                <FileText size={17} color={T.jade} />
                <div>
                  <div style={{ fontFamily: font.ui, fontSize: 14, fontWeight: 600, color: T.ink }}>{d.label}</div>
                  <P style={{ fontSize: 12 }}>{d.sub}</P>
                </div>
              </div>
              {docs[d.id] ? <Tag>Stored</Tag> : (
                <button onClick={() => { addDoc(d.id); toast(`${d.label} stored`); }}
                  className="flex items-center gap-1"
                  style={{ fontFamily: font.ui, fontSize: 12.5, fontWeight: 700, color: T.accent, background: "none", border: "none" }}>
                  <Upload size={13} /> Add
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card onClick={() => setFtOpen(!ftOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} color={T.accent} />
            <span style={{ fontFamily: font.ui, fontSize: 14, fontWeight: 600, color: T.ink }}>Airport fast track — worth it?</span>
          </div>
          <ChevronRight size={16} color={T.sub} style={{ transform: ftOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
        </div>
        {ftOpen && (
          <P style={{ marginTop: 10 }}>
            A greeter meets you at the aerobridge and walks you through a priority immigration lane — roughly US$25–35 per person, booked ahead. Worth it if you land 9pm–1am or during Tết, when queues at SGN can hit 60–90 minutes. On a quiet mid-morning arrival, skip it.
          </P>
        )}
      </Card>
    </div>
  );
}

/* ---------- arrive ---------- */
function ArriveScreen() {
  const [seg, setSeg] = useState("sim");
  const [moneyOpen, setMoneyOpen] = useState("cash");
  const [trOpen, setTrOpen] = useState("airport");
  const segs = [
    { id: "sim", label: "SIM", icon: Wifi },
    { id: "money", label: "Money", icon: Wallet },
    { id: "transport", label: "Transport", icon: Car },
  ];

  const TransportSection = ({ id, icon: Icon, title, badge, children }) => {
    const open = trOpen === id;
    return (
      <Card onClick={() => setTrOpen(open ? "" : id)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={16} color={T.jade} />
            <span style={{ fontFamily: font.ui, fontSize: 14.5, fontWeight: 700, color: T.ink }}>{title}</span>
            {badge && <Tag tone="gold">{badge}</Tag>}
          </div>
          <ChevronDown size={16} color={T.sub} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </div>
        {open && <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 10 }}>{children}</div>}
      </Card>
    );
  };

  const MoneySection = ({ id, icon: Icon, title, children }) => {
    const open = moneyOpen === id;
    return (
      <Card onClick={() => setMoneyOpen(open ? "" : id)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={16} color={T.jade} />
            <span style={{ fontFamily: font.ui, fontSize: 14.5, fontWeight: 700, color: T.ink }}>{title}</span>
          </div>
          <ChevronDown size={16} color={T.sub} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </div>
        {open && <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 10 }}>{children}</div>}
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Eyebrow>Arrival</Eyebrow>
        <H size={26}>Sorted in your first hour.</H>
      </div>

      <div className="flex gap-2">
        {segs.map((s) => (
          <button key={s.id} onClick={() => setSeg(s.id)} className="flex-1 flex items-center justify-center gap-2"
            style={{
              padding: "10px 0", borderRadius: 14, fontFamily: font.ui, fontSize: 12.5, fontWeight: 700,
              background: seg === s.id ? T.jade : T.card, color: seg === s.id ? "#fff" : T.sub,
              border: `1px solid ${seg === s.id ? T.jade : T.line}`,
            }}>
            <s.icon size={14} /> {s.label}
          </button>
        ))}
      </div>

      {seg === "sim" && (
        <div className="flex flex-col gap-3">
          <Card>
            <div className="flex items-center gap-2"><Smartphone size={16} color={T.jade} /><Eyebrow>Before you land — eSIM</Eyebrow></div>
            <P style={{ margin: "8px 0 4px" }}>Buy before your flight, activate on landing. A little pricier per GB than a local SIM, but you'll have data the second you clear the aerobridge — which is exactly when you need Grab and maps.</P>
            <div className="flex flex-col" style={{ marginTop: 8 }}>
              {ESIMS.map((e, i) => (
                <div key={e.name} className="flex items-center justify-between" style={{ padding: "11px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: font.ui, fontSize: 14, fontWeight: 700, color: T.ink }}>{e.name}</span>
                      <Tag tone="gold">{e.tag}</Tag>
                    </div>
                    <P style={{ fontSize: 12, marginTop: 2 }}>{e.note}</P>
                  </div>
                  <button onClick={() => window.open(e.url, "_blank")}
                    className="flex items-center gap-1 flex-shrink-0"
                    style={{ fontFamily: font.ui, fontSize: 12.5, fontWeight: 700, color: T.accent, background: "none", border: "none", marginLeft: 10 }}>
                    Open <ExternalLink size={12} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-2"><Wifi size={16} color={T.jade} /><Eyebrow>At the airport — local SIM</Eyebrow></div>
            <P style={{ marginTop: 8 }}>Best value if you don't mind ten minutes at a counter. Viettel has the strongest coverage nationwide; Mobifone and Vinaphone are close in cities. Tourist packs with generous data run roughly US$5–10 for 30 days — and Viettel sells eSIMs at the counter too. Bring your passport: SIM registration is required by law.</P>
            <div className="flex gap-2 flex-wrap" style={{ marginTop: 10 }}>
              <Tag>Viettel — best coverage</Tag>
              <Tag>~$5–10 / 30 days</Tag>
              <Tag>Passport required</Tag>
            </div>
          </Card>
        </div>
      )}

      {seg === "money" && (
        <div className="flex flex-col gap-3">
          <MoneySection id="cash" icon={Banknote} title="Cash — still king">
            <P>Vietnam runs on đồng, and street food, markets, taxis outside Grab and small cafés want cash. Rough anchor: 25,000₫ ≈ US$1.</P>
            <div style={{ background: T.accentSoft, borderRadius: 14, padding: 12, marginTop: 10 }}>
              <P style={{ color: "#8A3A22", fontSize: 12.5 }}>
                The classic mistake: the 20,000₫ and 500,000₫ notes are both blue. Travellers hand over 25× the price daily. Sort your wallet by colour on day one.
              </P>
            </div>
          </MoneySection>

          <MoneySection id="atm" icon={Wallet} title="ATMs & withdrawal limits">
            <P>Per-withdrawal limits are set by the local machine, not your bank — so pick the ATM well and pull the max each time to spread the fixed fees.</P>
            <div className="flex flex-col" style={{ marginTop: 8 }}>
              {ATMS.map((a, i) => (
                <div key={a.bank} style={{ padding: "10px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: font.ui, fontSize: 13.5, fontWeight: 700, color: T.ink }}>{a.bank}</span>
                    <span style={{ fontFamily: font.ui, fontSize: 12.5, fontWeight: 600, color: T.jade }}>{a.limit}</span>
                  </div>
                  <P style={{ fontSize: 12 }}>{a.fee} · {a.note}</P>
                </div>
              ))}
            </div>
            <P style={{ fontSize: 11.5, marginTop: 8 }}>
              Figures are a guide and change often. Always decline the ATM's currency conversion — choose to be charged in VND. For big sums, an over-the-counter withdrawal inside a bank branch beats five ATM runs.
            </P>
          </MoneySection>

          <MoneySection id="applepay" icon={CreditCard} title="Cards & Apple Pay">
            <P>Apple Pay and Google Pay work in Vietnam with foreign Visa and Mastercard — anywhere with a contactless terminal. In practice that means malls, supermarkets, convenience stores (Circle K, 7-Eleven), coffee chains like Highlands and Phúc Long, and most city restaurants and hotels.</P>
            <P style={{ marginTop: 8 }}>Where it won't work: street food, wet markets, small family-run spots. Plan on tap-to-pay for the polished half of your day and cash for the delicious half.</P>
            <div className="flex gap-2 flex-wrap" style={{ marginTop: 10 }}>
              <Tag>Malls & chains — tap away</Tag>
              <Tag tone="accent">Street food — cash only</Tag>
            </div>
          </MoneySection>

          <MoneySection id="apps" icon={Smartphone} title="Local payment apps">
            <P>Locals pay for everything with MoMo, ZaloPay and bank-QR transfers — but those need a Vietnamese bank account or phone number, so they're mostly out of reach on a short trip.</P>
            <P style={{ marginTop: 8 }}>Your workaround: link your international card to Grab on day one. Rides, food delivery and even some in-store payments go cashless instantly.</P>
          </MoneySection>
        </div>
      )}

      {seg === "transport" && (
        <div className="flex flex-col gap-3">
          <TransportSection id="airport" icon={Plane} title="From the airport">
            <P>Book a Grab from the app and follow signs to the ride-hailing pickup area. A trip to District 1 is typically 15–35 minutes depending on traffic. Skip anyone offering a "taxi" inside the arrivals hall — and fast track for immigration lives in the Visa tab.</P>
          </TransportSection>

          <TransportSection id="ride" icon={Bike} title="Ride-hailing" badge="Your daily driver">
            <P>Download Grab before you land — it's the Uber of Vietnam and how you'll move 90% of the time. GrabBike is roughly half the price of GrabCar and much faster in traffic; helmets are provided and it's how locals travel.</P>
            <P style={{ marginTop: 8 }}>Worth knowing too: <span style={{ fontWeight: 700, color: T.ink }}>Be</span> is the local rival, often slightly cheaper, and <span style={{ fontWeight: 700, color: T.ink }}>Xanh SM</span> runs quiet electric taxis and bikes at fixed prices — no surge. All three take international cards, so link one and never argue over a fare again.</P>
            <div className="flex gap-2 flex-wrap" style={{ marginTop: 10 }}>
              <Tag>Grab — default</Tag>
              <Tag>Be — often cheaper</Tag>
              <Tag>Xanh SM — electric, no surge</Tag>
            </div>
          </TransportSection>

          <TransportSection id="taxi" icon={Car} title="Traditional taxis">
            <P>If you flag one on the street, stick to the two reputable metered brands: <span style={{ fontWeight: 700, color: T.ink }}>Vinasun</span> (white-green) and <span style={{ fontWeight: 700, color: T.ink }}>Mai Linh</span> (green). Lookalike cars copy their colours with rigged meters — check the logo and phone number match before getting in.</P>
          </TransportSection>

          <TransportSection id="metro" icon={TrainFront} title="Metro & buses">
            <P>HCMC's Metro Line 1 runs from Bến Thành through District 1 out past Thảo Điền — cheap, air-conditioned and immune to traffic. City buses cost pennies and Google Maps knows the routes, but they're slow; treat them as an experience, not a schedule.</P>
          </TransportSection>

          <TransportSection id="moto" icon={Bike} title="Renting a motorbike — honestly">
            <P>Tempting, and half of Saigon's charm — but ride only if you genuinely ride at home. You legally need a motorbike-endorsed International Driving Permit, and without one most travel insurance won't pay out after an accident.</P>
            <div style={{ background: T.accentSoft, borderRadius: 12, padding: 10, marginTop: 8 }}>
              <P style={{ color: "#8A3A22", fontSize: 12.5 }}>City traffic here is a skill of its own. First trip? Take GrabBikes and let someone who grew up in it do the riding.</P>
            </div>
          </TransportSection>

          <TransportSection id="intercity" icon={Bus} title="Between cities">
            <P><span style={{ fontWeight: 700, color: T.ink }}>Flights</span> are cheap and everywhere — VietJet and Vietnam Airlines connect all major stops, often under US$50. <span style={{ fontWeight: 700, color: T.ink }}>The train</span> up the coast (the Reunification line) is slow but scenic; book soft sleepers a few days ahead. <span style={{ fontWeight: 700, color: T.ink }}>Sleeper buses</span> like FUTA/Phương Trang are the budget workhorse — full recline pods for a few dollars.</P>
          </TransportSection>

          <TransportSection id="walk" icon={Footprints} title="Crossing the street">
            <P>The scooters won't stop — they'll flow around you. Wait for a gap in cars, then walk at a slow, steady pace with no sudden moves. Eye contact with riders helps. It feels wrong for exactly one day, then it feels like a superpower.</P>
          </TransportSection>
        </div>
      )}
    </div>
  );
}

const PLACES = [
// ---- EAT ----
{n:"Bánh Mì Huỳnh Hoa",c:["eat"],d:"D1",p:1,pr:"60–80k ₫",t:["Bánh mì","Street food","Queue-worthy"],note:"The most famous stacked bánh mì in Saigon — heavy on meats & pâté. Expect a line.",lat:10.7712,lng:106.6910,a:"26 Lê Thị Riêng, D1"},
{n:"Phở Hòa / Phở Cao Vân",c:["eat"],d:"D1",p:1,pr:"70–95k ₫",t:["Phở bò","Historic"],note:"Historic phở institution; rich aromatic broth with plenty of fresh herbs.",lat:10.7838,lng:106.7003,a:"District 1"},
{n:"Bún Chả 145",c:["eat"],d:"D1",p:1,pr:"50–90k ₫",t:["Bún chả","Hanoi-style"],note:"Clean, accessible Hanoi-style grilled pork noodles in the Bùi Viện nightlife strip.",lat:10.7674,lng:106.6935,a:"145 Bùi Viện, D1"},
{n:"Bếp Mẹ Ỉn",c:["eat"],d:"D1",p:2,pr:"120–250k ₫",t:["Home cooking","Bánh xèo","Michelin Bib"],note:"Michelin Bib Gourmand home cooking tucked in an alley near Ben Thanh; colourful street-art decor.",lat:10.7735,lng:106.6987,a:"136/9 Lê Thánh Tôn, D1",g:"https://maps.google.com/?cid=4999984471408903447"},
{n:"Đèn Lồng",c:["eat"],d:"D1",p:2,pr:"100–220k ₫",t:["Vietnamese","Claypot","Cosy"],note:"Lantern-lit family-style Vietnamese; excellent claypot pork and morning glory.",lat:10.7671,lng:106.6884,a:"District 1"},
{n:"Mountain Retreat",c:["eat"],d:"D1",p:2,pr:"150–300k ₫",t:["Vietnamese","Rooftop"],note:"Rustic rooftop near Lê Lợi with great evening ambiance over the central skyline.",lat:10.7719,lng:106.7004,a:"36 Lê Lợi (top floor), D1"},
{n:"Cục Gạch Quán",c:["eat"],d:"D1",p:3,pr:"300–600k ₫ pp",t:["Countryside","Colonial villa","Fine"],note:"Elevated countryside comfort food in a restored French villa; hosts high-profile guests.",lat:10.7906,lng:106.6890,a:"10 Đặng Tất, D1"},
{n:"Pizza 4P's — Lê Thánh Tôn",c:["eat"],d:"D1",p:3,pr:"250–500k ₫ pp",t:["Japanese-Italian","Burrata","Book ahead"],note:"Wood-fired pizza with house-made burrata & crab spaghetti. Reservations recommended.",lat:10.7778,lng:106.7031,a:"8/15 Lê Thánh Tôn, D1"},
{n:"Pizza 4P's — Thảo Điền",c:["eat"],d:"D2",p:3,pr:"300–600k ₫ pp",t:["Japanese-Italian","Garden villa"],note:"Their most atmospheric location — a lush green villa with garden seating.",lat:10.8035,lng:106.7330,a:"Trần Ngọc Diện, Thảo Điền"},
{n:"The Deck Saigon",c:["eat","drink"],d:"D2",p:3,pr:"500k–1.2M ₫ pp",t:["Riverfront","Pan-Asian","Sunset"],note:"Right on the Saigon River — premiere sunset cocktails, high-end wine list, contemporary fusion.",lat:10.8106,lng:106.7256,a:"38 Nguyễn Ư Dĩ, Thảo Điền",g:"https://maps.google.com/?cid=13685370239740153323"},
{n:"Quán Ụt Ụt",c:["eat"],d:"D2",p:2,pr:"200–450k ₫",t:["American BBQ","Craft beer"],note:"Craft American BBQ and smoked ribs with a casual river-adjacent vibe.",lat:10.7995,lng:106.7360,a:"Thảo Điền, D2"},
{n:"Phở Lệ",c:["eat"],d:"D3",p:1,pr:"80–110k ₫",t:["Southern phở","Institution"],note:"Richer, slightly sweeter southern broth with generous tendon & meatball portions.",lat:10.7546,lng:106.6675,a:"Nguyễn Trãi, D3/D5 boundary"},
{n:"Bánh Xèo 46A",c:["eat"],d:"D3",p:1,pr:"90–160k ₫",t:["Bánh xèo","Bourdain","Wood-fire"],note:"Iconic outdoor wood-fired crispy pancakes, famously featured by Anthony Bourdain.",lat:10.7906,lng:106.6893,a:"46A Đinh Công Tráng, D3",g:"https://maps.google.com/?cid=5260223407053297133"},
{n:"Ốc Oanh",c:["eat"],d:"D4",p:1,pr:"100–250k ₫ /dish",t:["Seafood","Snails","Street strip"],note:"Vĩnh Khánh street-food energy. Order the salted-egg mud-creepers and garlic butter snails.",lat:10.7570,lng:106.6980,a:"Vĩnh Khánh St, D4"},
{n:"Cơm Tấm An Dương Vương",c:["eat"],d:"D5",p:1,pr:"50–90k ₫",t:["Cơm tấm","Breakfast"],note:"Quintessential broken rice with caramelised charcoal-grilled pork chop and egg loaf.",lat:10.7565,lng:106.6710,a:"An Dương Vương, D5"},
// ---- DRINK ----
{n:"Stir",c:["drink"],d:"D1",p:2,pr:"200–380k ₫",t:["Asia's 100 Best","Local flavours"],note:"Hidden up a narrow staircase opposite Ben Thanh; truffle & phở-infused cocktail twists.",lat:10.7717,lng:106.6969,a:"136 Lê Thánh Tôn, D1"},
{n:"Snuffbox",c:["drink"],d:"D1",p:2,pr:"200–450k ₫",t:["Speakeasy","Live jazz","1920s"],note:"Velvet-seated prohibition lounge inside a vintage apartment building; jazz & R&B nights.",lat:10.7712,lng:106.7040,a:"14 Tôn Thất Đạm, D1",g:"https://maps.google.com/?cid=16768234520235675945"},
{n:"Drinking & Healing",c:["drink"],d:"D1",p:2,pr:"220–400k ₫",t:["Industrial","Date night"],note:"Brick-and-beam craft cocktails above a historic building near Bitexco. Excellent mixologists.",lat:10.7708,lng:106.7043,a:"25 Hồ Tùng Mậu, D1"},
{n:"The Iron Bank",c:["drink"],d:"D1",p:1,pr:"150–300k ₫",t:["Speakeasy","Whiskey","Medieval"],note:"Cosy medieval-tavern speakeasy hidden in an alley; approachable prices, whiskey-forward.",lat:10.7700,lng:106.7037,a:"47 Tôn Thất Đạm, D1"},
{n:"Layla — Eatery & Bar",c:["drink","eat"],d:"D1",p:2,pr:"180–350k ₫",t:["Tapas","Garden bar"],note:"Energetic lounge in a leafy French-colonial building; big garden bar, great tapas.",lat:10.7757,lng:106.7042,a:"63 Đông Du, D1"},
{n:"Social Club Rooftop",c:["drink"],d:"D1",p:3,pr:"250–500k ₫",t:["Rooftop","Sunset","Upscale"],note:"24th-floor hotel rooftop with panoramic D1 views, infinity pool glamour and house music.",lat:10.7838,lng:106.6935,a:"Hôtel des Arts, 24F, D1",g:"https://maps.google.com/?cid=14342053608653436246"},
{n:"Zion Sky Lounge",c:["drink"],d:"D1",p:3,pr:"250–600k ₫",t:["Sky lounge","DJs","High energy"],note:"Skyline sunsets that turn into a vibrant night scene with live DJs and bottle service.",lat:10.7702,lng:106.7027,a:"87A Hàm Nghi, 14F, D1"},
{n:"Saigon Saigon Rooftop",c:["drink"],d:"D1",p:2,pr:"200–450k ₫",t:["Historic","Live music","Rooftop"],note:"Open since 1959 — wartime correspondents' hangout with live Latin/jazz and Opera House views.",lat:10.7765,lng:106.7034,a:"Caravelle Hotel, 9F, D1"},
{n:"Pasteur Street Brewing",c:["drink"],d:"D1",p:1,pr:"80–180k ₫ /pint",t:["Craft beer","Jasmine IPA","Alley"],note:"Birthplace of Vietnam's craft beer movement. Try the Jasmine IPA or Dragonfruit Sour.",lat:10.7746,lng:106.6996,a:"144 Pasteur, D1"},
{n:"East West Brewing",c:["drink","eat"],d:"D1",p:1,pr:"90–220k ₫ /pint",t:["Brewpub","Beer flights"],note:"Open-concept brewery with visible tanks, fantastic flights and American-fusion pub food.",lat:10.7719,lng:106.6953,a:"181–185 Lý Tự Trọng, D1"},
{n:"Rogue Saigon",c:["drink"],d:"D1",p:1,pr:"80–170k ₫",t:["Rooftop","Craft beer","Graffiti"],note:"Raw concrete rooftop over three floors with rotating guest taps and broad city views.",lat:10.7697,lng:106.7043,a:"13 Pasteur, D1"},
{n:"Rabbit Hole",c:["drink"],d:"D1",p:3,pr:"220–450k ₫",t:["Speakeasy","Jazz","Leather & moody"],note:"Underground lounge with moody lighting, classic leather seats and expertly built cocktails.",lat:10.7730,lng:106.6975,a:"District 1"},
{n:"Summer Experiment",c:["drink"],d:"D1",p:3,pr:"250–450k ₫",t:["Mixology","Tropical","Playful"],note:"Experimental cocktails with local tropical fruits, infused botanicals and playful serves.",lat:10.7900,lng:106.6950,a:"District 1"},
{n:"BiaCraft Artisan Beers",c:["drink"],d:"D2",p:1,pr:"70–180k ₫",t:["Beer garden","BBQ","Casual"],note:"Huge Vietnamese craft tap list with hilarious translated beer names and BBQ snacks.",lat:10.8018,lng:106.7308,a:"90 Xuân Thủy, Thảo Điền"},
{n:"Tủ Bar",c:["drink"],d:"BT",p:2,pr:"200–380k ₫",t:["Wardrobe door","12 seats","Bespoke"],note:"Enter through a hidden wardrobe into an ultra-intimate counter bar. Drinks tailored to your mood.",lat:10.7925,lng:106.7075,a:"160 Ngô Tất Tố, Bình Thạnh"},
{n:"Indika Saigon",c:["drink"],d:"D3",p:1,pr:"50–120k ₫",t:["Courtyard","Reggae/dub","Pizza"],note:"Crumbling-villa courtyard with craft brews, wood-fired pizza and acoustic/DJ sessions.",lat:10.7930,lng:106.6960,a:"43 Nguyễn Văn Giai, D1/D3"},
// ---- CAFE ----
{n:"The Cafe Apartment",c:["cafe","shop"],d:"D1",p:1,pr:"45–90k ₫",t:["9 floors","Vintage","Landmark"],note:"1960s residential block turned nine floors of boutique cafés and designer stores over Nguyễn Huệ.",lat:10.7737,lng:106.7040,a:"42 Nguyễn Huệ, D1"},
{n:"Cộng Cà Phê",c:["cafe"],d:"D1",p:1,pr:"40–75k ₫",t:["Coconut coffee","Retro"],note:"Communist-era nostalgia aesthetic; famous frozen coconut coffee (cà phê cốt dừa).",lat:10.7770,lng:106.7030,a:"Đồng Khởi / Lý Tự Trọng, D1"},
{n:"The Workshop Coffee",c:["cafe"],d:"D1",p:1,pr:"80–160k ₫",t:["Third-wave","Pour-over","Laptop-friendly"],note:"Lofty industrial attic near the Opera House; single-origin pour-overs and a great workspace.",lat:10.7740,lng:106.7050,a:"27 Ngô Đức Kế, D1"},
{n:"Cà Phê Đỗ Phủ",c:["cafe"],d:"D3",p:1,pr:"40–80k ₫",t:["Secret bunker","Wartime","Heritage"],note:"Secret Viet Cong bunker under a traditional eatery — trapdoors and authentic artifacts included.",lat:10.7920,lng:106.6900,a:"113A Đặng Dung, D3 area"},
{n:"Okkio Caffe",c:["cafe"],d:"D3",p:1,pr:"65–120k ₫",t:["Espresso","Art-deco"],note:"Warm mid-century art-deco rooms paired with serious specialty brews.",lat:10.7830,lng:106.6900,a:"Lê Văn Sỹ / NTMK, D3"},
// ---- SHOP ----
{n:"Levents",c:["shop"],d:"D1",p:2,pr:"350k–1.2M ₫",t:["Streetwear","Oversized tees"],note:"High-quality local streetwear — oversized graphics, hoodies and minimalist loungewear.",lat:10.7660,lng:106.6870,a:"Nguyễn Trãi, D1"},
{n:"DirtyCoins",c:["shop"],d:"D1",p:2,pr:"350k–1.5M ₫",t:["Streetwear","Dragon motifs","Souvenir-able"],note:"Vietnamese motifs (dragons, lacquer patterns) turned into wearable streetwear.",lat:10.7665,lng:106.6880,a:"Vincom / Nguyễn Trãi, D1"},
{n:"LSOUL",c:["shop"],d:"D1",p:2,pr:"450k–1.8M ₫",t:["Y2K","K-pop stage style"],note:"Bold trendy silhouettes, cropped jackets and statement womenswear.",lat:10.7650,lng:106.6850,a:"257B Nguyễn Trãi, D1"},
{n:"Nosbyn",c:["shop"],d:"D1",p:2,pr:"500k–1.5M ₫",t:["Minimalist","Womenswear"],note:"Clean timeless cuts and quality wardrobe essentials designed to last.",lat:10.7690,lng:106.6920,a:"28 Nguyễn Trãi, D1"},
{n:"Parahub",c:["shop"],d:"D1",p:2,pr:"200k–1.2M ₫",t:["Concept store","Skate"],note:"Concept-store spin-off of Paradise4saigon — streetwear, skate decks and accessories in Đa Kao.",lat:10.7915,lng:106.6945,a:"8A Trần Doãn Khanh, Đa Kao, D1",ax:1},
{n:"Metiseko",c:["shop"],d:"D1",p:3,pr:"990k–3.2M ₫",t:["Eco silk","Sustainable","Gifts"],note:"Sustainable silk & organic cotton with prints inspired by Vietnamese flora and heritage.",lat:10.7760,lng:106.7030,a:"Đồng Khởi area, D1"},
{n:"Ben Thanh Market",c:["shop"],d:"D1",p:1,pr:"Haggle it",t:["Souvenirs","Handicrafts","Landmark"],note:"Iconic market for lacquerware, coffee beans and trinkets. Bargaining required.",lat:10.7725,lng:106.6980,a:"Lê Lợi, D1"},
{n:"Fancì Club",c:["shop"],d:"D2",p:3,pr:"890k–3.5M ₫",t:["Y2K couture","Worn by Bella Hadid"],note:"Internationally acclaimed designer — sheer fabrics and corseted cuts worn by global celebrities.",lat:10.8130,lng:106.7290,a:"186 Nguyễn Văn Hưởng, D2"},
{n:"Bunny Hill Concept",c:["shop"],d:"D2",p:2,pr:"400k–2M ₫",t:["Indie designers","Rotating"],note:"Collective store showcasing rotating collections from emerging Vietnamese brands.",lat:10.8050,lng:106.7330,a:"Thảo Điền, D2"},
{n:"OHQUAO — Thảo Điền",c:["shop"],d:"D2",p:1,pr:"50–500k ₫",t:["Local art","Stationery","Gifts"],note:"Dedicated to local illustrators — unique postcards, art prints, stickers and gifts.",lat:10.8030,lng:106.7320,a:"Living Etc., 19 Đường số 38, Thảo Điền"},
{n:"OHQUAO — The Local Edit",c:["shop"],d:"D3",p:1,pr:"50–500k ₫",t:["Local art","Travel gifts"],note:"D3 branch of the creative design store; local art pieces, prints and thoughtful gifts.",lat:10.7830,lng:106.6930,a:"58/12 Phạm Ngọc Thạch, D3",g:"https://maps.google.com/?cid=17159458610705563493"},
{n:"In The Mood Saïgon",c:["shop"],d:"D2",p:2,pr:"200k–1.5M ₫",t:["Ceramics","Home decor"],note:"Local ceramics, mirrors, lighting and home accents celebrating Vietnamese craftsmanship.",lat:10.80541,lng:106.74084,a:"32 Trần Ngọc Diện, D2",g:"https://maps.google.com/?cid=1975468894066877703"},
{n:"Tân Định Market",c:["shop"],d:"D3",p:1,pr:"Budget–mid",t:["Fabric","Pink Church","Tailoring"],note:"Opposite the famous Pink Church — excellent for tailor fabric and street fashion.",lat:10.7900,lng:106.6905,a:"Hai Bà Trưng, D3"},
// ---- BRANCH CARDS (multi-location spots) ----
{n:"Paradise4saigon — Flagship",c:["shop"],d:"D1",p:2,pr:"300k–1.5M ₫",t:["Local brand","Streetwear","Flagship"],note:"One of Vietnam's premier local clothing brands — funky threads with a deeply Vietnamese design language. Hit this first, then Parahub.",lat:10.7723,lng:106.7020,a:"42 Tôn Thất Thiệp, D1",g:"https://maps.google.com/?cid=8426048901243796775"},
{n:"111 Concept Store — Vina Design x Đầu Hàng",c:["shop"],d:"D1",p:1,pr:"50–400k ₫",t:["Gifts","Stationery","Local art"],note:"Quirky collab gift shop — local designers' stickers, postcards and handmade bits at 111 Tôn Thất Đạm.",lat:10.7700,lng:106.7038,a:"111 Tôn Thất Đạm, D1",ax:1},
{n:"Pizza 4P's — Bến Thành",c:["eat"],d:"D1",p:3,pr:"250–500k ₫ pp",t:["Japanese-Italian","Burrata","Book ahead"],note:"The Bến Thành branch — same wood-fired pizza and house burrata, steps from the market.",lat:10.7727,lng:106.6960,a:"8 Thủ Khoa Huân, D1",ax:1},
{n:"Pizza 4P's — Hai Bà Trưng",c:["eat"],d:"D3",p:3,pr:"250–500k ₫ pp",t:["Japanese-Italian","Burrata"],note:"D3's own 4P's on Hai Bà Trưng — usually an easier booking than the D1 originals.",lat:10.7855,lng:106.6905,a:"151B Hai Bà Trưng, D3",ax:1},
{n:"Pizza 4P's — Saigon Pearl",c:["eat"],d:"BT",p:3,pr:"250–500k ₫ pp",t:["Japanese-Italian","Riverside towers"],note:"Bình Thạnh branch at Saigon Pearl — handy after a Landmark 81 or Vinhomes wander.",lat:10.7893,lng:106.7180,a:"92 Nguyễn Hữu Cảnh, Bình Thạnh",ax:1},
{n:"Pizza 4P's — Phú Mỹ Hưng",c:["eat"],d:"D7",p:3,pr:"250–500k ₫ pp",t:["Japanese-Italian","Burrata"],note:"The D7 outpost in Cobi Tower II — brings the burrata to Phú Mỹ Hưng.",lat:10.7290,lng:106.7190,a:"Cobi Tower II, Phú Mỹ Hưng, D7",ax:1},
{n:"Pizza 4P's — Vincom 3/2",c:["eat"],d:"D5",p:3,pr:"250–500k ₫ pp",t:["Japanese-Italian","Westside"],note:"Westside 4P's inside Vincom Plaza 3/2 — the D10 catchment's branch.",lat:10.7760,lng:106.6820,a:"3C Đường 3 Tháng 2, D10",ax:1},
// ---- FROM MARK'S SAVED LISTS (auto-imported) ----
{n:"Quán Cơm Tấm 47",c:["eat"],d:"D7",p:1,pr:"40–80k ₫",t:["Cơm tấm","Street food"],note:"Locals love this com tam place.",lat:10.73624,lng:106.7013,a:"",g:"https://maps.google.com/?cid=14058412733638983916",ax:1},
{n:"Nhàn",c:["eat"],d:"D4",p:2,pr:"100–250k ₫",t:["Brunch","Local eats"],note:"Brunch place.",lat:10.75916,lng:106.68939,a:"",g:"https://maps.google.com/?cid=5696042662644789705",ax:1},
{n:"NHAU NHAU",c:["eat","drink"],d:"D1",p:2,pr:"150–350k ₫",t:["Cocktails","Modern Viet"],note:"Cocktail bar with decent looking contemporary Vietnamese food — drinking-food ('nhậu') done modern.",lat:10.7705,lng:106.70959,a:"",g:"https://maps.google.com/?cid=2280245820929513815",ax:1},
{n:"Bún Thịt Nướng Chả Giò - Nguyễn Trung Trực",c:["eat"],d:"D1",p:1,pr:"40–85k ₫",t:["Street food","Noodles"],note:"Good looking bun thit nuong.",lat:10.77352,lng:106.69959,a:"Nguyễn Trung Trực",g:"https://maps.google.com/?cid=2770198550638406281",ax:1},
{n:"Bar Rơm",c:["eat","drink"],d:"X",p:2,pr:"200–400k ₫",t:["Wine","Natural wine","Modern Viet"],note:"Modern Vietnamese eatery. Really cool vibes. Natural wine to wash it down.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=8563311440822007994",ax:1},
{n:"Bánh mì - Xôi mặn Hắc Ngầu",c:["eat"],d:"X",p:1,pr:"25–60k ₫",t:["Bánh mì","Street food"],note:"Crazy good looking savour and sweet sticky rice place.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=6534664457981469078",ax:1},
{n:"Ralf's Artisan Gelato",c:["cafe"],d:"D2",p:1,pr:"60–120k ₫",t:["Gelato","Sweet"],note:"Great gelato in Thảo Điền — small-batch scoops, rotating flavours.",lat:10.803,lng:106.733,a:"Thảo Điền",g:"https://maps.google.com/?cid=1567300857787824727",ax:1},
{n:"234 Lý Tự Trọng",c:["eat"],d:"D1",p:1,pr:"40–80k ₫",t:["Cơm tấm","Street food"],note:"Jess recommended com tam.",lat:10.77232,lng:106.69454,a:"Lý Tự Trọng",g:"https://maps.google.com/?cid=12799982474753548087",ax:1},
{n:"Pasteloa",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Brazilian"],note:"Brazilian restaurant.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=8812172460029438905",ax:1},
{n:"Yeshi Taiwanese Kitchen",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Taiwanese"],note:"Taiwanese to try with mica.",lat:10.804997,lng:106.7368769,a:"",g:"https://maps.google.com/?cid=7720365190874347052",ax:1},
{n:"Cơm tấm Đề Thám",c:["eat"],d:"D1",p:1,pr:"40–80k ₫",t:["Cơm tấm","Street food"],note:"ComTam place looks juicy.",lat:10.774,lng:106.7,a:"Đề Thám",g:"https://maps.google.com/?cid=745082976618157529",ax:1},
{n:"GrillDog Burger",c:["eat"],d:"D5",p:2,pr:"100–220k ₫",t:["Burgers","Local eats"],note:"Interesting looking burger joint.",lat:10.74806,lng:106.67794,a:"",g:"https://maps.google.com/?cid=2984581791081380578",ax:1},
{n:"An's Saigon",c:["eat"],d:"D2",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Hana says I must try by myself.",lat:10.8035,lng:106.733,a:"",g:"https://maps.google.com/?cid=5979597170038440843",ax:1},
{n:"Mila Mushroom Pizza - Take Away",c:["eat"],d:"D5",p:2,pr:"150–350k ₫",t:["Pizza","Local eats"],note:"Looks like decent take no frills pizza. Check zalo delivery.",lat:10.82125,lng:106.64987,a:"",g:"https://maps.google.com/?cid=8242295852744486542",ax:1},
{n:"MARIANNE'S PIZZA",c:["eat"],d:"X",p:2,pr:"150–350k ₫",t:["Pizza","Local eats"],note:"Looks like a cute wood fired pizzeria.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=7750303343775827253",ax:1},
{n:"Banana Mama Rooftop Bar & Kitchen Saigon",c:["eat","drink"],d:"D1",p:2,pr:"90–200k ₫",t:["Rooftop","Near Bùi Viện"],note:"Cool chill rooftop near Bùi Viện — close to the chaos without being in it.",lat:10.774,lng:106.7,a:"near Bùi Viện, D1",g:"https://maps.google.com/?cid=13006624483278084179",ax:1},
{n:"Xèng Quán - Chi nhánh Huỳnh Mẫn Đạt",c:["eat","drink"],d:"D5",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Bia Hoi late night eating spot.",lat:10.757,lng:106.665,a:"Huỳnh Mẫn Đạt",g:"https://maps.google.com/?cid=7825952031767799886",ax:1},
{n:"Bánh mì Bùi Thị Xuân",c:["eat"],d:"D1",p:1,pr:"25–60k ₫",t:["Bánh mì","Street food"],note:"Cold cuts banh mi.",lat:10.76989,lng:106.68826,a:"Bùi Thị Xuân",g:"https://maps.google.com/?cid=5108558391170420286",ax:1},
{n:"Lulu - Bar & Eatery",c:["eat","drink"],d:"X",p:2,pr:"150–300k ₫",t:["Cocktails","Cuban"],note:"Cuban cocktail bar and eatery — rum, snacks and Latin energy.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=14390044012207103371",ax:1},
{n:"Thịnh Ký",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Big wok situations.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=18027088925141950243",ax:1},
{n:"Nhoàn - Nhà hàng chay / Cafe",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Vegan","Vegetarian"],note:"Vegan veg.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=13258900925491615437",ax:1},
{n:"COCOCake Minh Khai",c:["cafe"],d:"D3",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Vietnamese desserts.",lat:10.7588,lng:106.68974,a:"Minh Khai",g:"https://maps.google.com/?cid=2548787576060349851",ax:1},
{n:"Bánh Cuốn Tây Hồ 127",c:["eat"],d:"X",p:1,pr:"35–70k ₫",t:["Bánh cuốn","Street food"],note:"Nina recommended.",lat:10.7907465,lng:106.696988,a:"",g:"https://maps.google.com/?cid=7151154922053425995",ax:1},
{n:"Ivoire Pastry Boutique",c:["cafe"],d:"D7",p:1,pr:"45–95k ₫",t:["Pastry","Café"],note:"Beautiful little pastry shop.",lat:10.72175,lng:106.67862,a:"",g:"https://maps.google.com/?cid=3207190988256656467",ax:1},
{n:"Gom Sai Gon - Cafe & Pottery",c:["cafe"],d:"D1",p:1,pr:"50–95k ₫",t:["Café","Ceramics"],note:"Gốm in the Cafe Apartment — coffee among the ceramics in the famous 42 Nguyễn Huệ building.",lat:10.774,lng:106.7,a:"42 Nguyễn Huệ, D1",g:"https://maps.google.com/?cid=3740469176760747868",ax:1},
{n:"May Coffee",c:["cafe","eat"],d:"X",p:2,pr:"100–250k ₫",t:["Café","Coffee"],note:"Cute looking cafe and broth noods.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=1853454795613979139",ax:1},
{n:"PIRIPARAPO YATAI",c:["eat"],d:"X",p:3,pr:"300–600k ₫ pp",t:["Izakaya","Japanese"],note:"Cool looking Izakaya.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=10067324727010868288",ax:1},
{n:"INCH KA",c:["eat"],d:"X",p:2,pr:"120–280k ₫",t:["Tacos","Mexican"],note:"New kebab and taco place?",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=14243166469181584643",ax:1},
{n:"Old Sister Broken Rice",c:["eat"],d:"D5",p:1,pr:"40–80k ₫",t:["Cơm tấm","Street food"],note:"Juicy com tam.",lat:10.80925,lng:106.65106,a:"",g:"https://maps.google.com/?cid=11237461113876915747",ax:1},
{n:"Oishi Town",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Café","Japanese"],note:"Cute tucked away Japanese cafes,florist, and homewares.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=9868915964533455014",ax:1},
{n:"NÚC Kitchen & Bar",c:["eat","drink"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Interesting contemporary Vietnamese.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=7831379727204595265",ax:1},
{n:"Papaya Papa – Rooftop Restaurant, Bar & Club Ho Chi Minh City",c:["eat","drink"],d:"D5",p:3,pr:"200–450k ₫",t:["Rooftop","Club"],note:"Trendy rooftop bar-club hybrid — dress up a bit, stay for the view.",lat:10.74849,lng:106.67741,a:"",g:"https://maps.google.com/?cid=15677752460633080088",ax:1},
{n:"Fortune Ivy",c:["eat"],d:"D5",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Cute cosy cool looking restaurant.",lat:10.80398,lng:106.63957,a:"",g:"https://maps.google.com/?cid=14210500984814210724",ax:1},
{n:"SOMA @ Green Box",c:["eat"],d:"D2",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:10.80466,lng:106.73203,a:"",g:"https://maps.google.com/?cid=4447626482974150412",ax:1},
{n:"Gringo Tacos y Cantina",c:["eat"],d:"D1",p:2,pr:"100–250k ₫",t:["Tacos","Local eats"],note:"Looks decent for Mexican.",lat:10.77402,lng:106.69698,a:"",g:"https://maps.google.com/?cid=5279697462956372541",ax:1},
{n:"BOCĀO Basque Izakaya",c:["eat"],d:"X",p:3,pr:"300–600k ₫ pp",t:["Izakaya","Japanese"],note:"Nice sunset happy hour spot.",lat:10.8029885,lng:106.7274172,a:"",g:"https://maps.google.com/?cid=13770959111837596913",ax:1},
{n:"Bánh Canh Cua Gánh Thuý",c:["eat"],d:"X",p:1,pr:"50–110k ₫",t:["Crab","Bánh canh"],note:"Delicious crab noods.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=4608135949855882998",ax:1},
{n:"Tường By Double T - Smash Burger",c:["eat"],d:"D5",p:2,pr:"100–220k ₫",t:["Burgers","Local eats"],note:"Smash burger super tasty looking and cheap?!",lat:10.74768,lng:106.67685,a:"",g:"https://maps.google.com/?cid=12750150317996739476",ax:1},
{n:"Vườn Thiên Giới",c:["cafe"],d:"X",p:1,pr:"50–100k ₫",t:["Destination cafe","Jungle"],note:"Insane Avatar-like cafe — a jungle fever-dream of bridges, mist and waterfalls. Go for the spectacle.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=8142218349660227469",ax:1},
{n:"BahThai",c:["eat"],d:"D5",p:2,pr:"100–250k ₫",t:["Local eats","Thai"],note:"Great thai, similar vibes to modern bkk styles.",lat:10.74826,lng:106.67739,a:"",g:"https://maps.google.com/?cid=15242755945206672710",ax:1},
{n:"Fellini",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Italian"],note:"Hidden Italian.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=16903979386620807856",ax:1},
{n:"CCCP Saigon Restaurant",c:["eat"],d:"D1",p:2,pr:"100–250k ₫",t:["Local eats","Russian"],note:"Russian restaurant in Saigon.",lat:10.79195,lng:106.70051,a:"",g:"https://maps.google.com/?cid=13465630403196041792",ax:1},
{n:"Dong Pho Restaurant",c:["eat"],d:"D3",p:1,pr:"45–90k ₫",t:["Phở","Local eats"],note:"Hana’s cousin place.",lat:10.77636,lng:106.68747,a:"",g:"https://maps.google.com/?cid=9193568284814227265",ax:1},
{n:"Margherí pizza Phú Mỹ Hưng",c:["eat"],d:"D7",p:2,pr:"150–350k ₫",t:["Pizza","Local eats"],note:"Solid pizza option in D7.",lat:10.733,lng:106.707,a:"",g:"https://maps.google.com/?cid=4892671101189758311",ax:1},
{n:"Phở Hương Bình",c:["eat"],d:"D3",p:1,pr:"45–90k ₫",t:["Phở","Local eats"],note:"Phở house — one bowl, done right.",lat:10.78701,lng:106.69114,a:"",g:"https://maps.google.com/?cid=9576693014418456529",ax:1},
{n:"FEN Izakaya - The best modern izakaya Japanese restaurant in Sài Gòn",c:["eat"],d:"D5",p:3,pr:"300–600k ₫ pp",t:["Izakaya","Japanese"],note:"Roast duck Japanese style.",lat:10.74858,lng:106.67654,a:"",g:"https://maps.google.com/?cid=16752136924784187608",ax:1},
{n:"Táo Tào - Tiệm Chè Người Hoa - Ký Con",c:["cafe"],d:"D1",p:1,pr:"45–95k ₫",t:["Chè","Dessert"],note:"Vietnamese sweet-soup and dessert counter.",lat:10.774,lng:106.7,a:"Ký Con",g:"https://maps.google.com/?cid=14268960838029344545",ax:1},
{n:"Yukikitchen",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Vegetarian","Local eats"],note:"From the saved eats list — tap through for photos and menu.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=16077425833353734000",ax:1},
{n:"Delab Thảo Điền",c:["cafe"],d:"D2",p:1,pr:"55–110k ₫",t:["Café","Specialty coffee","Minimal"],note:"Specialty coffee lab in Thảo Điền — serious brews, minimal room.",lat:10.8035,lng:106.7325,a:"Thảo Điền",g:"https://maps.google.com/?cid=13520570623300524578",ax:1},
{n:"Ran Bien 8",c:["eat"],d:"D2",p:2,pr:"200–450k ₫ pp",t:["Seafood","Local eats"],note:"Good crispy seafood fried rice.",lat:10.79049,lng:106.73048,a:"",g:"https://maps.google.com/?cid=12621125234423677689",ax:1},
{n:"Ran Bien 5 Restaurant",c:["eat"],d:"D3",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Excellent fried rice. Ask for extra crispy.",lat:10.78679,lng:106.68653,a:"",g:"https://maps.google.com/?cid=3277350293307225002",ax:1},
{n:"Quán Thuý 94 - Miến Cua",c:["eat"],d:"D1",p:2,pr:"100–250k ₫",t:["Crab","Local eats"],note:"Soft shell crab noodles.",lat:10.79016,lng:106.69784,a:"",g:"https://maps.google.com/?cid=2610750245937094978",ax:1},
{n:"Minh Món Huế – Hue Rustic Flavors Restaurant",c:["eat"],d:"D7",p:2,pr:"100–250k ₫",t:["Local eats","Huế-style"],note:"Hue style food.",lat:10.74077,lng:106.69809,a:"",g:"https://maps.google.com/?cid=1522197410416328702",ax:1},
{n:"Cơm tấm 40A",c:["eat"],d:"D2",p:1,pr:"40–80k ₫",t:["Cơm tấm","Street food"],note:"Cơm tấm — smoky grilled pork chop over broken rice.",lat:10.80511,lng:106.73143,a:"",g:"https://maps.google.com/?cid=15898568832337787616",ax:1},
{n:"Matte Matcha & Teabar",c:["cafe","drink"],d:"D1",p:1,pr:"60–120k ₫",t:["Matcha","Teabar"],note:"Matcha — whisked-to-order bowls and matcha lattes in central D1.",lat:10.78858,lng:106.6978,a:"",g:"https://maps.google.com/?cid=4573351237350610271",ax:1},
{n:"Zeroism Vegan - Café & Sourdough Bakery",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Vegan","Vegetarian","Bakery"],note:"Really great Vietnamese vegan.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=4030122025937758201",ax:1},
{n:"Nấm - Vegetarian Bistro",c:["eat"],d:"X",p:1,pr:"60–150k ₫",t:["Vegetarian","Local eats"],note:"Meat-free kitchen from the saved list.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=3583090339714103361",ax:1},
{n:"A Xỉu - Quán Ăn Ngon",c:["eat"],d:"D2",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Chicken rice.",lat:10.78256,lng:106.72062,a:"",g:"https://maps.google.com/?cid=4972183245674149675",ax:1},
{n:"Nam Mê Saigon",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Viet recomendation.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=2516522878914147543",ax:1},
{n:"Extraordinary (cafe/wine bar)",c:["cafe","drink"],d:"X",p:2,pr:"70–250k ₫",t:["Wine","Café"],note:"Cafe wine bar thingy — coffee until it becomes wine o'clock.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=4216345444346967087",ax:1},
{n:"Cơm Tấm Dì Út",c:["eat"],d:"D4",p:1,pr:"40–80k ₫",t:["Cơm tấm","Street food"],note:"Com tam.",lat:10.74992,lng:106.70061,a:"",g:"https://maps.google.com/?cid=16646326524940592782",ax:1},
{n:"2cms Wine Bar & Bottle Shop",c:["eat","drink"],d:"X",p:2,pr:"150–300k ₫/glass",t:["Wine","Bottle shop"],note:"Cute wine bar and bottle shop — drink in or take a bottle home.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=636379810269447986",ax:1},
{n:"Apero Bar & Bistro",c:["eat","drink"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Italian"],note:"Fancy Italian.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=15395378955149592825",ax:1},
{n:"Today With You (Pasta & Pizza Restaurant)",c:["eat"],d:"X",p:2,pr:"150–350k ₫",t:["Pizza","Italian"],note:"Pizzeria from the saved eats list.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=6889643416074513300",ax:1},
{n:"Can Tin Bakery",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Bakery","Café"],note:"New bakery.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=4978163541701777151",ax:1},
{n:"SANSUNG korean restaurant bbq(산성식육점) Quán thịt nướng Hàn Quốc",c:["eat"],d:"X",p:2,pr:"200–400k ₫ pp",t:["BBQ","Group dinner"],note:"Recommended by Stella.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=7272769918675096791",ax:1},
{n:"Hong Malatang Canh Cay Tô",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Malatang"],note:"Stella’s recommendation.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=9805493183197228649",ax:1},
{n:"Mille Mille - Boutique Store - Trần Cao Vân",c:["cafe"],d:"D3",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Giant croissant!",lat:10.78,lng:106.685,a:"Trần Cao Vân",g:"https://maps.google.com/?cid=17053267431084915397",ax:1},
{n:"Bánh Mì Sáu Minh",c:["eat"],d:"D3",p:1,pr:"25–60k ₫",t:["Bánh mì","Street food"],note:"Cold cuts banh mi.",lat:10.78858,lng:106.67987,a:"",g:"https://maps.google.com/?cid=17644669954830422891",ax:1},
{n:"Cộng coffee - Xuan Thuy Branch",c:["cafe"],d:"D2",p:1,pr:"45–85k ₫",t:["Coconut coffee","Retro"],note:"Great coconut coffee — the Thảo Điền branch of the retro-militaria chain.",lat:10.8021,lng:106.7331,a:"Xuân Thủy, Thảo Điền",g:"https://maps.google.com/?cid=10298035646235820475",ax:1},
{n:"Roast & Smoke Thao Dien",c:["eat"],d:"D2",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:10.8035,lng:106.733,a:"Thảo Điền",g:"https://maps.google.com/?cid=3495729502540699938",ax:1},
{n:"WKND",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Brunch","Local eats"],note:"Great little brunch spot.",lat:10.8065107,lng:106.7338292,a:"",g:"https://maps.google.com/?cid=6041218171093882638",ax:1},
{n:"Bánh Canh Ghẹ Muối Ớt Xanh",c:["eat"],d:"D3",p:1,pr:"50–110k ₫",t:["Crab","Bánh canh"],note:"Recommend by Thao. Excellent crab noodle broth!!",lat:10.76713,lng:106.66739,a:"",g:"https://maps.google.com/?cid=4320199166363319725",ax:1},
{n:"Bún Riêu Cô Hương Béo Hà Nội - Quận 10",c:["eat"],d:"D5",p:1,pr:"40–80k ₫",t:["Street food","Bún riêu"],note:"Bun rieu recommended by Thao.",lat:10.757,lng:106.665,a:"",g:"https://maps.google.com/?cid=4342176130151608145",ax:1},
{n:"Hủ tiếu nam vang Tân Thành Đạt",c:["eat"],d:"X",p:1,pr:"40–85k ₫",t:["Hủ tiếu","Street food"],note:"Hu you recommended by Thao.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=10705515232349280220",ax:1},
{n:"Bun Mam Co Ba",c:["eat"],d:"X",p:1,pr:"40–85k ₫",t:["Street food","Noodles"],note:"Shrimp paste noodle soup recommended by Thao.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=8006750506828634943",ax:1},
{n:"Garden Kisses",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Great Scandinavian pastries, chill vibes. Lemon honey espresso tonic was pretty good too!",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=5774625269850648863",ax:1},
{n:"Chuối Nếp Nướng",c:["cafe"],d:"D4",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Grilled sticky rice banana dessert.",lat:10.76257,lng:106.68804,a:"",g:"https://maps.google.com/?cid=15748377015755951490",ax:1},
{n:"Chuối nếp nướng Võ Văn Tần",c:["eat"],d:"D3",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Grilled sticky rice with banana.",lat:10.77027,lng:106.6844,a:"Võ Văn Tần",g:"https://maps.google.com/?cid=10456983291937633608",ax:1},
{n:"BIN'S HOUSE COFFEE",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Trang’s cafe recommendation.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=7849465212712169049",ax:1},
{n:"Nhà Tú - Việt Nam Restaurant",c:["eat"],d:"D1",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Vietnamese cuisi e.",lat:10.77514,lng:106.68954,a:"",g:"https://maps.google.com/?cid=16599986691486725031",ax:1},
{n:"La Scène - Bistro Cafe ⬩ Listening Bar",c:["cafe","drink"],d:"X",p:2,pr:"80–200k ₫",t:["Café","Italian"],note:"Bistro pasta international foods.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=8758200484140829323",ax:1},
{n:"The Hummingbird Café & Roastery",c:["cafe"],d:"D1",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Cute cafe with excellent coffee.",lat:10.76683,lng:106.7026,a:"",g:"https://maps.google.com/?cid=6784318869373534947",ax:1},
{n:"Bún Bò Huế Mỡ Nổi Cô Như",c:["eat"],d:"D4",p:1,pr:"45–90k ₫",t:["Phở","Local eats"],note:"Michelin guided pho.",lat:10.74865,lng:106.7116,a:"",g:"https://maps.google.com/?cid=7625849282498582958",ax:1},
{n:"Trap Space",c:["cafe"],d:"D5",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Cosy cafe with a river view.",lat:10.74736,lng:106.67698,a:"",g:"https://maps.google.com/?cid=9310037484767216969",ax:1},
{n:"San May Cafe & Vegetarian Restaurant",c:["cafe"],d:"D1",p:1,pr:"45–95k ₫",t:["Vegetarian","Café"],note:"Meat-free kitchen from the saved list.",lat:10.7878,lng:106.69712,a:"",g:"https://maps.google.com/?cid=3046234055436785039",ax:1},
{n:"Sushi Sake Restaurant Kiyota",c:["eat"],d:"D1",p:3,pr:"300–800k ₫ pp",t:["Sushi","Japanese"],note:"Sushi.",lat:10.79029,lng:106.70987,a:"",g:"https://maps.google.com/?cid=17861541609897890028",ax:1},
{n:"Oasis Cafe",c:["cafe"],d:"PN",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Crazy cafe with so many sections and koi fish, ponds and trees.",lat:10.79267,lng:106.67085,a:"",g:"https://maps.google.com/?cid=15787164377276589841",ax:1},
{n:"Tiệm cà phê Noọng Ơi",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Beautifully aesthetic, nature and plants and just feels like a dream world.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=4724009860370681948",ax:1},
{n:"Nhâm Café",c:["cafe"],d:"D5",p:1,pr:"45–95k ₫",t:["Vintage","Pastry","Café"],note:"Crazy pastry cafe, vintage aesthetic.",lat:10.74858,lng:106.67904,a:"",g:"https://maps.google.com/?cid=12469136914667953228",ax:1},
{n:"Cái Tổ Chim",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Really picturesque place but 129k cover charge to get in.",lat:10.8107812,lng:106.7600197,a:"",g:"https://maps.google.com/?cid=3855642836272901195",ax:1},
{n:"Ducky's Smash Burger",c:["eat"],d:"X",p:2,pr:"100–220k ₫",t:["Burgers","Local eats"],note:"Great smash burgers.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=1364198849344768835",ax:1},
{n:"SOHO TOWN FOOD COURT",c:["eat"],d:"D4",p:2,pr:"100–250k ₫",t:["Street food","Local eats"],note:"BKK style food court? Range of street food.",lat:10.76163,lng:106.68951,a:"",g:"https://maps.google.com/?cid=4877544690471978980",ax:1},
{n:"Bếp Ốc Sài Gòn",c:["eat"],d:"D1",p:2,pr:"200–450k ₫ pp",t:["Seafood","Local eats"],note:"Great little seafood in a courtyard.",lat:10.77046,lng:106.71845,a:"",g:"https://maps.google.com/?cid=15363901656217831174",ax:1},
{n:"Phở bò Phú Gia",c:["eat"],d:"X",p:1,pr:"45–90k ₫",t:["Phở","Local eats"],note:"Pho highly recommended.",lat:10.7863243,lng:106.6845743,a:"",g:"https://maps.google.com/?cid=10195528633443323253",ax:1},
{n:"Pazzi Pizza",c:["eat"],d:"D5",p:2,pr:"150–350k ₫",t:["Pizza","Local eats"],note:"Good pizza and date spot.",lat:10.81407,lng:106.66086,a:"",g:"https://maps.google.com/?cid=8157051832600549305",ax:1},
{n:"Hủ tiếu gà cá Hà Ký",c:["eat"],d:"X",p:1,pr:"40–85k ₫",t:["Hủ tiếu","Street food"],note:"Egg noodles with fish or chicken, fresh and delicious.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=11652540330777958917",ax:1},
{n:"Restaurant Hương Lài",c:["eat"],d:"D1",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Employees disadvantaged youths to help.",lat:10.77737,lng:106.69943,a:"",g:"https://maps.google.com/?cid=2866550184445538586",ax:1},
{n:"Aoya Ramen",c:["eat"],d:"D5",p:2,pr:"120–220k ₫",t:["Ramen","Japanese"],note:"Ramen.",lat:10.74924,lng:106.67686,a:"",g:"https://maps.google.com/?cid=4876152627029677214",ax:1},
{n:"KAKU IZAKAYA",c:["eat"],d:"D7",p:3,pr:"300–600k ₫ pp",t:["Izakaya","Japanese"],note:"Izakaya.",lat:10.74078,lng:106.67865,a:"",g:"https://maps.google.com/?cid=14576620112682161366",ax:1},
{n:"一鳥 ICHITORI",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Yakitori.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=9830723579319829872",ax:1},
{n:"Omakase Tiger",c:["eat"],d:"X",p:3,pr:"800k–2M ₫ pp",t:["Omakase","Japanese"],note:"Excellent omakase and date spot.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=13127435834154685009",ax:1},
{n:"A+C Coffee Experience",c:["cafe"],d:"D5",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Picturesque stunning cafe.",lat:10.74701,lng:106.67868,a:"",g:"https://maps.google.com/?cid=12141718517298812806",ax:1},
{n:"FUME | Japanese Modern Cuisine",c:["eat"],d:"D7",p:2,pr:"100–250k ₫",t:["Local eats","Japanese"],note:"Japanese fine dining.",lat:10.73415,lng:106.69122,a:"",g:"https://maps.google.com/?cid=9888359046663086760",ax:1},
{n:"Lam Lam Xưa Restaurant & Bar",c:["eat","drink"],d:"D7",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Local Saigonese cuisines.",lat:10.73074,lng:106.69038,a:"",g:"https://maps.google.com/?cid=13549336704989281998",ax:1},
{n:"Prem Bistro and Cafe",c:["cafe"],d:"D1",p:1,pr:"45–95k ₫",t:["Vegetarian","Café"],note:"Delightful vegetarian, mid level, not too fancy. Cute little date spot.",lat:10.77525,lng:106.68921,a:"",g:"https://maps.google.com/?cid=14767520075004034669",ax:1},
{n:"Bánh mì thịt nướng Bà Hà",c:["eat"],d:"X",p:1,pr:"25–60k ₫",t:["Bánh mì","Street food"],note:"Bánh mì counter from the saved eats list.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=8184635017035193970",ax:1},
{n:"Bánh Mì Bà Huynh (Madam Win)",c:["eat"],d:"D4",p:1,pr:"25–60k ₫",t:["Bánh mì","Street food"],note:"Smaller than the extreme size of the touristy one everyone goes too. 55k.",lat:10.74913,lng:106.69025,a:"",g:"https://maps.google.com/?cid=8896932288202701631",ax:1},
{n:"Saveur Café Tân Định",c:["cafe"],d:"D1",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Amazing exterior looking cafe building. Indoor outdoor, leafy and rustic. Multi level.",lat:null,lng:null,a:"Tân Định",g:"https://maps.google.com/?cid=535466340715287651",ax:1},
{n:"ngâm CAFE",c:["cafe"],d:"D5",p:1,pr:"45–95k ₫",t:["Vintage","Café"],note:"Vintage aesthetic, influencer photo central, wall of croissants. Cool little leafy courtyard.",lat:10.74929,lng:106.67864,a:"",g:"https://maps.google.com/?cid=2205517350869085429",ax:1},
{n:"Tiem Mi Huu Ky",c:["eat"],d:"D1",p:2,pr:"100–250k ₫",t:["Street food","Local eats"],note:"Wonton huge!",lat:10.79235,lng:106.70904,a:"",g:"https://maps.google.com/?cid=16899537596642219129",ax:1},
{n:"Trần Pizza",c:["eat"],d:"D5",p:2,pr:"150–350k ₫",t:["Pizza","Local eats"],note:"Wood fired pizza.",lat:10.74808,lng:106.67806,a:"",g:"https://maps.google.com/?cid=7640938224498060475",ax:1},
{n:"Quán Lẩu Dê 218 - 老賴羊肉火锅 - 1980",c:["eat"],d:"D1",p:2,pr:"150–300k ₫ pp",t:["BBQ","Street food"],note:"Viet bbq.",lat:10.76791,lng:106.70046,a:"",g:"https://maps.google.com/?cid=6306746393950388866",ax:1},
{n:"Lamie Pizza",c:["eat"],d:"D1",p:2,pr:"150–350k ₫",t:["Pizza","Local eats"],note:"Detroit style pizza!",lat:10.7813,lng:106.70647,a:"",g:"https://maps.google.com/?cid=8685391558621809222",ax:1},
{n:"ten.coffee",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Café","Japanese"],note:"Japanese style cafe tucked away in the neighbourhood.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=2770371076522346319",ax:1},
{n:"Breadventure",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Bakery","Café"],note:"Scando style bakery, cool cafe, bread looks sick.",lat:10.8036445,lng:106.7289327,a:"",g:"https://maps.google.com/?cid=420202930159565115",ax:1},
{n:"Cokernut Cafe",c:["cafe"],d:"PN",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Cute little cafe my team took me to on day 1.",lat:10.79714,lng:106.66219,a:"",g:"https://maps.google.com/?cid=9488904172115832078",ax:1},
{n:"Hai Cái Tẩy Cafe",c:["cafe"],d:"PN",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Cosy art deco cafe.",lat:10.79165,lng:106.66573,a:"",g:"https://maps.google.com/?cid=5268308556412454651",ax:1},
{n:"café nuta",c:["cafe"],d:"D2",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Modern boujee cafe.",lat:10.74593,lng:106.7221,a:"",g:"https://maps.google.com/?cid=10027180011493679719",ax:1},
{n:"Rennoki Café",c:["cafe"],d:"D7",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Coffee stop from the saved list — tap through for the room.",lat:10.73134,lng:106.69862,a:"",g:"https://maps.google.com/?cid=13516948716748224470",ax:1},
{n:"The Orange Ball",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Coffee stop from the saved list — tap through for the room.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=4377872866285270916",ax:1},
{n:"Trapart room",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Homely cafe.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=6699168914382699731",ax:1},
{n:"OKKIO",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=17082727238992717743",ax:1},
{n:"Aramour Coffee Roasters Thao Dien",c:["cafe"],d:"D2",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Cool little coffee hangout.",lat:10.8035,lng:106.733,a:"Thảo Điền",g:"https://maps.google.com/?cid=15979436532484170053",ax:1},
{n:"Thái Fiên by 15.22café",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Café","Thai"],note:"Diner looking cafe.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=8273208399179984695",ax:1},
{n:"Keng cafe",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Coffee stop from the saved list — tap through for the room.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=9488853741559171183",ax:1},
{n:"Connect Saigon Cafe",c:["cafe"],d:"D5",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Cute little cafe.",lat:10.74692,lng:106.67858,a:"",g:"https://maps.google.com/?cid=16863380210592267040",ax:1},
{n:"Machiya Coffee",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Café","Japanese"],note:"Zen Japanese looking cafe.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=7582214868518337308",ax:1},
{n:"Kéo Ghế Ra Ngồi",c:["cafe"],d:"D2",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Minimalist light filled cafe.",lat:10.77606,lng:106.73874,a:"",g:"https://maps.google.com/?cid=8834389124712580247",ax:1},
{n:"Make Room",c:["cafe"],d:"D5",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Cute records and cafe.",lat:10.74688,lng:106.67724,a:"",g:"https://maps.google.com/?cid=4455297584963266186",ax:1},
{n:"HAUSE cafe",c:["cafe"],d:"D5",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Stylish scando cafe.",lat:10.74802,lng:106.67649,a:"",g:"https://maps.google.com/?cid=6734412441101204023",ax:1},
{n:"HÔM",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Coffee stop from the saved list — tap through for the room.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=16723430124565939966",ax:1},
{n:"Bò Né Bà Nũi",c:["eat"],d:"D1",p:2,pr:"100–250k ₫",t:["Street food","Local eats"],note:"HK dim sum and sizzling egg meat dishes.",lat:10.77999,lng:106.68805,a:"",g:"https://maps.google.com/?cid=14194176294383005816",ax:1},
{n:"Yuzu Omakase ゆずお任せ Ho Chi Minh",c:["eat"],d:"D1",p:3,pr:"800k–2M ₫ pp",t:["Omakase","Japanese"],note:"Fancy omakase.",lat:10.77551,lng:106.69138,a:"",g:"https://maps.google.com/?cid=8226006176679406222",ax:1},
{n:"Bánh Mì Chấm Hung Tubes - Hai Bà Trưng",c:["eat"],d:"D1",p:1,pr:"25–60k ₫",t:["Bánh mì","Street food"],note:"Dipping banh mi.",lat:10.78065,lng:106.71226,a:"Hai Bà Trưng",g:"https://maps.google.com/?cid=4933544081050976803",ax:1},
{n:"Pasteur Street Craft Beer Le Thanh Ton",c:["eat"],d:"D1",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:10.78057,lng:106.6911,a:"Pasteur",g:"https://maps.google.com/?cid=1409035383914615742",ax:1},
{n:"PAMA Stew & Brew",c:["eat"],d:"D5",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Bo Kho!",lat:10.74872,lng:106.67658,a:"",g:"https://maps.google.com/?cid=2113664451814978564",ax:1},
{n:"Tori Soba Mutahiro Ramen Restaurant",c:["eat"],d:"X",p:2,pr:"120–220k ₫",t:["Crab","Ramen","Japanese"],note:"Trang’s suggestion for ramen. Crab ramen 🦀.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=1531901194868505710",ax:1},
{n:"Tiệm chè Kai Kai - 佳佳糖水 - Chè người Hoa",c:["cafe"],d:"PN",p:1,pr:"45–95k ₫",t:["Chè","Dessert"],note:"Chinese tofu dessert.",lat:10.80314,lng:106.66238,a:"",g:"https://maps.google.com/?cid=4192327496078904005",ax:1},
{n:"Cơm chiên gà nướng sữa Thái Huy",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Thai"],note:"Thai kitchen from the saved eats list.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=6213131676808857681",ax:1},
{n:"Lion quán",c:["eat"],d:"D5",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Vietnamese curry noodles 👀.",lat:10.79493,lng:106.63725,a:"",g:"https://maps.google.com/?cid=17725624127157154957",ax:1},
{n:"BROS KOREA",c:["eat"],d:"D4",p:2,pr:"100–250k ₫",t:["BBQ","Local eats"],note:"Great kbbq. $20 buffet of all good quality meat. Didn’t even order rice with it 😅.",lat:10.7432,lng:106.71473,a:"",g:"https://maps.google.com/?cid=15114376348974717688",ax:1},
{n:"KHÁNH VY Sweets",c:["cafe"],d:"D3",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Local dessert shop.",lat:10.76067,lng:106.67308,a:"",g:"https://maps.google.com/?cid=14850556524447168744",ax:1},
{n:"Flower market",c:["eat"],d:"D1",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Loads of flowers and plants from dalat.",lat:10.77406,lng:106.688,a:"",g:"https://maps.google.com/?cid=9364746539282780090",ax:1},
{n:"Restaurant 13",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Banh khot.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=5515548684107363112",ax:1},
{n:"Cơm tấm đêm CUBO",c:["eat"],d:"D4",p:1,pr:"40–80k ₫",t:["Cơm tấm","Street food"],note:"Recommended by Khoa.",lat:10.74318,lng:106.69562,a:"",g:"https://maps.google.com/?cid=8222807451265015945",ax:1},
{n:"Nhà Ba Teria - Craft Matcha & Coffee",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Matcha","Café"],note:"Cool concept cafe.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=8194297469020873314",ax:1},
{n:"Little Bear Wine Bar",c:["eat","drink"],d:"X",p:2,pr:"100–250k ₫",t:["Wine","Local eats"],note:"Bar from the saved list — tap through for the vibe.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=12341986316489180438",ax:1},
{n:"Trung Nguyen Legend Coffee Thu Thiem",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Coffee stop from the saved list — tap through for the room.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=15085950676350759220",ax:1},
{n:"Mámi Cocktails - Tapas & Bar",c:["eat","drink"],d:"X",p:2,pr:"100–250k ₫",t:["Cocktails","Local eats"],note:"Same owner as 86 proof. Cute place.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=4135109678110360022",ax:1},
{n:"THE JOKERS - Coffee&Beer",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Coffee stop from the saved list — tap through for the room.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=4942046222233489667",ax:1},
{n:"Pizza 4P's — Xuân Thủy",c:["eat"],d:"D2",p:2,pr:"150–350k ₫",t:["Pizza","Crab"],note:"Excellent pizza and pasta. Dough is light and fluffy and crisp. The crab pasta so creamy and tomato velvety.",lat:10.8021,lng:106.7331,a:"Xuân Thủy",g:"https://maps.google.com/?cid=1924187985198418895",ax:1},
{n:"Dalcheeni Indian Restaurant Ho Chi Minh Saigon",c:["eat"],d:"D5",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Excellent Indian.",lat:10.82775,lng:106.6355,a:"",g:"https://maps.google.com/?cid=7548652263185269831",ax:1},
{n:"Bar Commune Saigon",c:["eat","drink"],d:"D3",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Cool little intimate bar that plays records.",lat:10.78545,lng:106.68529,a:"",g:"https://maps.google.com/?cid=16894044649090540338",ax:1},
{n:"Kapi Café",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=5996503327150601767",ax:1},
{n:"Mountain Pearl Roastery",c:["cafe"],d:"X",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Cool little concept coffee shop.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=3436077303630307023",ax:1},
{n:"Saigon Bagel",c:["eat"],d:"D1",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Heard it’s good bagels.",lat:10.76672,lng:106.69085,a:"",g:"https://maps.google.com/?cid=6701489942661253439",ax:1},
{n:"TONKOTSU RAMEN ICHIBANKEN - Thao Dien",c:["eat"],d:"D2",p:2,pr:"120–220k ₫",t:["Ramen","Japanese"],note:"Pretty damn good tonkatsu ramen.",lat:10.8035,lng:106.733,a:"Thảo Điền",g:"https://maps.google.com/?cid=7263205595832912073",ax:1},
{n:"Quán Cơm Tấm Ba Đạt",c:["eat"],d:"D2",p:1,pr:"40–80k ₫",t:["Cơm tấm","Street food"],note:"Good com tam, just make sure it’s grilled fresh.",lat:10.80085,lng:106.7329,a:"",g:"https://maps.google.com/?cid=4382522731610535502",ax:1},
{n:"Pendolasco",c:["eat"],d:"D2",p:2,pr:"100–250k ₫",t:["Local eats","Italian"],note:"Really good Italian.",lat:10.80667,lng:106.73474,a:"",g:"https://maps.google.com/?cid=16861075687303071768",ax:1},
{n:"86 PROOF Whiskey Bar",c:["eat","drink"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Great whiskey bar and great for people watching.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=1713473475052878941",ax:1},
{n:"Trạm Hầm",c:["eat"],d:"D5",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Dinner before NYE.",lat:10.74836,lng:106.67713,a:"",g:"https://maps.google.com/?cid=13814518923357021147",ax:1},
{n:"Captain Phook",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=4576162265167994921",ax:1},
{n:"Ben Nghe Street Food",c:["eat"],d:"D1",p:2,pr:"100–250k ₫",t:["Street food","Local eats"],note:"From the saved eats list — tap through for photos and menu.",lat:10.77346,lng:106.69727,a:"",g:"https://maps.google.com/?cid=11128028587886157075",ax:1},
{n:"Café Slow Thao Dien",c:["cafe"],d:"D2",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Cute quaint cafe. Excellent coffee and pretty decent croissant.",lat:10.8035,lng:106.733,a:"Thảo Điền",g:"https://maps.google.com/?cid=8214228417064823674",ax:1},
{n:"Oliver's Pizza",c:["eat"],d:"D1",p:2,pr:"150–350k ₫",t:["Pizza","Local eats"],note:"Good grandma slice of pizza.",lat:10.78781,lng:106.69646,a:"",g:"https://maps.google.com/?cid=12084639575453853988",ax:1},
{n:"Hải Hội Quán",c:["eat"],d:"D2",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Looks good for local cuisine in Thao Dien.",lat:10.80363,lng:106.73412,a:"Thảo Điền",g:"https://maps.google.com/?cid=12792869829578086145",ax:1},
{n:"Hà Ký Mì Gia",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Awesome fresh made noodles.",lat:10.7275094,lng:106.7080321,a:"",g:"https://maps.google.com/?cid=3322159543627302141",ax:1},
{n:"Cô Quyên Xứ Quảng",c:["eat"],d:"PN",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Central Vietnamese cuisine.",lat:10.79137,lng:106.67604,a:"",g:"https://maps.google.com/?cid=3589830300172950695",ax:1},
{n:"Bánh Xèo Bình Định Nẫu Ơi",c:["eat"],d:"BT",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Crispy crispy banh xeo.",lat:10.80324,lng:106.71562,a:"",g:"https://maps.google.com/?cid=9815002580156366251",ax:1},
{n:"Okra Food Bar",c:["eat","drink"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Bar from the saved list — tap through for the vibe.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=12843145178563224060",ax:1},
{n:"Ho Thi Ky Food Street",c:["eat"],d:"D4",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:10.74791,lng:106.68823,a:"",g:"https://maps.google.com/?cid=12662087525625938570",ax:1},
{n:"Bánh Mì 37",c:["eat"],d:"D5",p:1,pr:"25–60k ₫",t:["Bánh mì","Street food"],note:"Bánh mì counter from the saved eats list.",lat:10.7588,lng:106.68281,a:"",g:"https://maps.google.com/?cid=17655044038348101753",ax:1},
{n:"Phở Việt Nam | Phở Ngon Sài Gòn",c:["eat"],d:"D3",p:1,pr:"45–90k ₫",t:["Phở","Local eats"],note:"Phở house — one bowl, done right.",lat:10.76915,lng:106.68302,a:"",g:"https://maps.google.com/?cid=9251094531855348851",ax:1},
{n:"Phở Dậu",c:["eat"],d:"D1",p:1,pr:"45–90k ₫",t:["Phở","Local eats"],note:"Phở house — one bowl, done right.",lat:10.7717,lng:106.69234,a:"",g:"https://maps.google.com/?cid=8480321802118390278",ax:1},
{n:"CLAY - Cocktails & Cuisine",c:["eat","drink"],d:"X",p:2,pr:"100–250k ₫",t:["Cocktails","Local eats"],note:"Bar from the saved list — tap through for the vibe.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=8238215162200484375",ax:1},
{n:"Elgin Saigon",c:["eat"],d:"D7",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:10.7397,lng:106.70361,a:"",g:"https://maps.google.com/?cid=15791841343641597937",ax:1},
{n:"Glouglou Wine Shop",c:["eat","drink"],d:"D2",p:2,pr:"100–250k ₫",t:["Wine","Local eats"],note:"Bar from the saved list — tap through for the vibe.",lat:10.72551,lng:106.72097,a:"",g:"https://maps.google.com/?cid=3526757430579832442",ax:1},
{n:"Bún riêu tóp mỡ mọc giòn",c:["eat"],d:"D5",p:1,pr:"40–80k ₫",t:["Bún riêu","Street food"],note:"Bún riêu — crab-tomato noodle soup.",lat:10.75564,lng:106.68381,a:"",g:"https://maps.google.com/?cid=15712528943035768415",ax:1},
{n:"Com Tam Hong Calmette",c:["eat"],d:"D1",p:1,pr:"40–80k ₫",t:["Cơm tấm","Street food"],note:"Cơm tấm — smoky grilled pork chop over broken rice.",lat:10.76329,lng:106.70361,a:"Calmette",g:"https://maps.google.com/?cid=243794697659704199",ax:1},
{n:"Cơm tấm Nguyễn Văn Cừ",c:["eat"],d:"D2",p:1,pr:"40–80k ₫",t:["Cơm tấm","Street food"],note:"Cơm tấm — smoky grilled pork chop over broken rice.",lat:10.74842,lng:106.71937,a:"",g:"https://maps.google.com/?cid=11297353480852994875",ax:1},
{n:"Kanpaisaigon",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=3479434391091262973",ax:1},
{n:"Twist Cafe & Bar",c:["cafe","drink"],d:"X",p:2,pr:"80–200k ₫",t:["Café","Coffee"],note:"Coffee stop from the saved list — tap through for the room.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=10689558830531855038",ax:1},
{n:"El Camino Taqueria :: District 2",c:["eat"],d:"D4",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:10.76288,lng:106.7099,a:"",g:"https://maps.google.com/?cid=11177315925406312065",ax:1},
{n:"Le Café des Stagiaires - Saigon",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=16893446280067195176",ax:1},
{n:"Chợ 200",c:["eat"],d:"D4",p:2,pr:"100–250k ₫",t:["Street food","Local eats"],note:"Street food.",lat:10.7555,lng:106.70917,a:"",g:"https://maps.google.com/?cid=2136443511534546141",ax:1},
{n:"Phúc Long Coffee & Tea Express",c:["cafe"],d:"D5",p:1,pr:"45–95k ₫",t:["Café","Coffee"],note:"Coffee stop from the saved list — tap through for the room.",lat:10.75227,lng:106.66086,a:"",g:"https://maps.google.com/?cid=6466328933548369358",ax:1},
{n:"433/8 Hai Bà Trưng",c:["eat"],d:"PN",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:10.79062,lng:106.68766,a:"Hai Bà Trưng",g:"https://maps.google.com/?cid=15224786959884804661",ax:1},
{n:"Cơm Tấm Phúc Lộc Thọ",c:["eat"],d:"X",p:1,pr:"40–80k ₫",t:["Cơm tấm","Street food"],note:"Cơm tấm — smoky grilled pork chop over broken rice.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=8933196275653122103",ax:1},
{n:"Bánh Xèo Bánh Khọt Gỏi Cuốn",c:["eat"],d:"D3",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:10.79273,lng:106.69041,a:"",g:"https://maps.google.com/?cid=2249736338261188155",ax:1},
{n:"Quán Dì Gái",c:["eat"],d:"PN",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:10.7994,lng:106.67353,a:"",g:"https://maps.google.com/?cid=12381024562400778401",ax:1},
{n:"5KU Station",c:["eat"],d:"D1",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:10.77932,lng:106.70365,a:"",g:"https://maps.google.com/?cid=2119819535424726314",ax:1},
{n:"Bánh Mì Bảy Hổ",c:["eat"],d:"D1",p:1,pr:"25–60k ₫",t:["Bánh mì","Street food"],note:"Bánh mì counter from the saved eats list.",lat:10.79036,lng:106.69663,a:"",g:"https://maps.google.com/?cid=11573284370566081101",ax:1},
{n:"Binh Dien Product Market",c:["eat"],d:"X",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"Marketplace.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=7564006223935684127",ax:1},
{n:"Maison Marou Saigon",c:["eat"],d:"D1",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:10.76943,lng:106.69786,a:"",g:"https://maps.google.com/?cid=1553739568733118892",ax:1},
{n:"Kậu Ba Quán",c:["eat"],d:"D1",p:2,pr:"100–250k ₫",t:["Local eats","Saved find"],note:"From the saved eats list — tap through for photos and menu.",lat:10.79269,lng:106.70202,a:"",g:"https://maps.google.com/?cid=6232841967674330559",ax:1},
{n:"CO PORT Kajun Seafood",c:["eat"],d:"D3",p:2,pr:"200–450k ₫ pp",t:["Seafood","Local eats"],note:"Seafood house — pick it, point at it, feast.",lat:10.78284,lng:106.67135,a:"",g:"https://maps.google.com/?cid=15441673579126930309",ax:1},
{n:"Bar PICCOLO",c:["drink"],d:"D2",p:2,pr:"150–300k ₫",t:["Wine","Cocktails","Alley bar"],note:"Cute little alley wine bar with great cocktails — lowkey but quaint, hidden in a Thảo Điền hẻm.",lat:10.8035,lng:106.733,a:"Thảo Điền",g:"https://maps.google.com/?cid=1629627047635959167",ax:1},
{n:"Bodega Saigon",c:["drink"],d:"D4",p:2,pr:"90–200k ₫",t:["Casual","Hangout"],note:"Casual bodega-style hangout off the saved bar list — easy drinks with a snacky menu.",lat:10.74576,lng:106.7053,a:"",g:"https://maps.google.com/?cid=15718210318543222584",ax:1},
{n:"The Observatory",c:["drink"],d:"D4",p:2,pr:"150–350k ₫",t:["Rooftop","Club","Techno","Late night"],note:"Great rooftop club — Saigon's long-running home for proper techno and house, going till very late.",lat:10.7664,lng:106.706,a:"",g:"https://maps.google.com/?cid=7257621653164571611",ax:1},
{n:"RAW + Atelier",c:["drink"],d:"D5",p:3,pr:"250–420k ₫",t:["Cocktails","Craft"],note:"Epic and amazing cocktails — inventive craft builds with local ingredients; one of the city's serious cocktail rooms.",lat:10.7468,lng:106.68206,a:"",g:"https://maps.google.com/?cid=136497845216576088",ax:1},
{n:"Another Drink Saigon",c:["drink"],d:"D4",p:2,pr:"90–190k ₫",t:["Cocktails","Cosy"],note:"Cute little bar — the name is the pitch. Good stop on a D1 crawl.",lat:10.7439,lng:106.71318,a:"",g:"https://maps.google.com/?cid=599522014815549732",ax:1},
{n:"Úb Stairs",c:["drink"],d:"X",p:1,pr:"50–130k ₫",t:["Rooftop","Cheap & cheerful"],note:"Rooftop bar up a sneaky staircase — cheap cold beers, plastic-stool energy, big breeze.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=14617984993884069879",ax:1},
{n:"LEGATO",c:["drink"],d:"BT",p:2,pr:"80–180k ₫",t:["Bar strip","Bình Thạnh"],note:"Part of the Phạm Viết Chánh bar alley in Bình Thạnh — hop between this, Khoai and Birdy in one night.",lat:10.7905,lng:106.7052,a:"Phạm Viết Chánh",g:"https://maps.google.com/?cid=8992763135217843132",ax:1},
{n:"Khoai",c:["drink"],d:"BT",p:1,pr:"40–100k ₫",t:["Dive bar","Cats"],note:"Cute little dive bar with cats, on the Phạm Viết Chánh strip. Cheap drinks, zero pretension.",lat:10.7907,lng:106.705,a:"Phạm Viết Chánh",g:"https://maps.google.com/?cid=16354487899915626878",ax:1},
{n:"Birdy",c:["drink"],d:"BT",p:2,pr:"90–190k ₫",t:["Intimate","Listening bar"],note:"Intimate cute little bar — low-lit listening-bar energy on the Phạm Viết Chánh strip.",lat:10.7906,lng:106.7048,a:"Phạm Viết Chánh",g:"https://maps.google.com/?cid=14978492361717609215",ax:1},
{n:"The Rabbit Hole Irish Bar",c:["drink"],d:"D2",p:2,pr:"90–200k ₫",t:["Irish pub","Sports"],note:"Irish pub in Thảo Điền — pints, sport on the screens and pub comfort food.",lat:10.8035,lng:106.733,a:"Thảo Điền",g:"https://maps.google.com/?cid=4246694417109561833",ax:1},
{n:"NEO-",c:["drink"],d:"D3",p:2,pr:"90–200k ₫",t:["Rooftop","Chill"],note:"Chill rooftop bar in D3 — laid-back crowd, good for an easy evening rather than a big one.",lat:10.78,lng:106.685,a:"",g:"https://maps.google.com/?cid=7533317437649880821",ax:1},
{n:"CINÉ Saigon",c:["drink"],d:"D5",p:2,pr:"100–250k ₫",t:["Live music","Club"],note:"Club and live music venue — indie gigs, film-club energy and DJ nights in central D1.",lat:10.74932,lng:106.67633,a:"",g:"https://maps.google.com/?cid=5070320405928409999",ax:1},
{n:"Mowe Wine Space",c:["drink"],d:"X",p:2,pr:"150–280k ₫/glass",t:["Wine","Natural wine","Vinyl"],note:"Wine and vinyl — natural pours with records spinning; sit at the bar and let them choose.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=1504549485898530004",ax:1},
{n:"Fang Hub",c:["drink"],d:"X",p:1,pr:"60–150k ₫",t:["Live music","Local scene"],note:"Live music, Vietnamese rock — a local-scene venue worth the trek west when there's a gig on.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=16166771397897122444",ax:1},
{n:"CỘI",c:["drink"],d:"X",p:2,pr:"100–220k ₫",t:["Live music","Jazz"],note:"Live music, jazzy — mellow sets most nights in a warm little room.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=9292164277373497164",ax:1},
{n:"Cipherz Rooftop",c:["drink","cafe"],d:"PN",p:2,pr:"70–180k ₫",t:["Rooftop","Day-to-night"],note:"Cool rooftop bar and cafe — coffee by day, drinks and skyline by night.",lat:10.79243,lng:106.68664,a:"",g:"https://maps.google.com/?cid=6655091414461938649",ax:1},
{n:"BÀ BAR",c:["drink"],d:"X",p:2,pr:"80–180k ₫",t:["Neighbourhood","Cocktails"],note:"Small neighbourhood cocktail spot from the saved bar list — local crowd, easy prices.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=3851059323379454639",ax:1},
{n:"adidas Outlet Binh Thoi Ho Chi Minh City",c:["shop"],d:"D5",p:2,pr:"300k–1.5M ₫",t:["Outlet","Sportswear"],note:"Adidas outlet — discounted lines out west in Bình Thới; hit or miss but cheap when it hits.",lat:10.757,lng:106.665,a:"Bình Thới",g:"https://maps.google.com/?cid=2599315404948136407",ax:1},
{n:"Routine Lê Lợi",c:["shop"],d:"D3",p:2,pr:"200–600k ₫",t:["Local brand","Basics"],note:"Good local basics — clean everyday staples from a homegrown brand, right on Lê Lợi.",lat:10.78591,lng:106.69004,a:"Lê Lợi, D1",g:"https://maps.google.com/?cid=17528019569385408885",ax:1},
{n:"matchup REST & Wellness",c:["exp"],d:"D2",p:2,pr:"300–600k ₫/session",t:["Wellness","Ice bath","Sauna","Recovery"],note:"Ice bath and sauna — contrast-therapy studio for the post-padel recovery day.",lat:10.8035,lng:106.733,a:"",g:"https://maps.google.com/?cid=647337442606357378",ax:1},
{n:"Mèo Tuxedo",c:["shop"],d:"D5",p:1,pr:"50–90k ₫",t:["Cat cafe","Coffee"],note:"Cat café with resident tuxedo cats — coffee plus therapy animals.",lat:10.74782,lng:106.67897,a:"",g:"https://maps.google.com/?cid=13537777524991821446",ax:1},
{n:"grade b",c:["shop"],d:"D2",p:2,pr:"100–600k ₫",t:["Ceramics","Small batch"],note:"Ceramics — small-batch, imperfect-on-purpose pieces. Sits in the Thảo Điền craft cluster.",lat:10.8045,lng:106.7335,a:"Thảo Điền",g:"https://maps.google.com/?cid=7699222114139981682",ax:1},
{n:"TuHu Ceramics",c:["shop"],d:"D2",p:2,pr:"100–600k ₫",t:["Ceramics","Handmade"],note:"Ceramics — handmade tableware and objects, next door to the grade b crowd in Thảo Điền.",lat:10.8047,lng:106.7337,a:"Thảo Điền",g:"https://maps.google.com/?cid=15143970865984565465",ax:1},
{n:"Yêu Đĩa Than",c:["shop"],d:"X",p:2,pr:"200k–1.5M ₫",t:["Records & vinyl","Vintage","Crate digging"],note:"Can contain vintage records — crate-digging with genuine finds if you have the patience.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=13488912287092128475",ax:1},
{n:"SASA Spa & Relaxing",c:["exp"],d:"X",p:1,pr:"250–500k ₫ / 60–90 min",t:["Wellness","Massage"],note:"Reliable neighbourhood spa — solid massages at local prices.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=6276348462169524988",ax:1},
{n:"La Vela Saigon Hotel",c:["exp"],d:"D3",p:3,pr:"~500k ₫ day pass",t:["Pool day","Infinity pool"],note:"Epic infinity pool — buy a day pass and float above D3 for an afternoon.",lat:10.78856,lng:106.68543,a:"",g:"https://maps.google.com/?cid=15143436662454001615",ax:1},
{n:"Isla Oasis",c:["shop","cafe"],d:"D2",p:2,pr:"150–300k ₫ min spend",t:["Pool day","Café"],note:"Pool cafe in Thảo Điền — order a coffee, claim a lounger, pretend you're on holiday.",lat:10.8035,lng:106.733,a:"Thảo Điền",g:"https://maps.google.com/?cid=18241339968731174048",ax:1},
{n:"Mystic Night Show",c:["exp"],d:"X",p:3,pr:"from ~700k ₫",t:["Magic show","Date night"],note:"Petey Majik's magic show — polished illusion theatre; a genuinely fun date-night wildcard.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=12002210092889613469",ax:1},
{n:"32",c:["shop"],d:"D2",p:0,pr:"",t:["Mystery pin","Browse-worthy"],note:"Unlabelled saved pin — a Thảo Điền mystery. Tap through to Maps and find out.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=3464939686040072350",ax:1},
{n:"CỘNG HƯỞNG Art & Craft Shop",c:["shop"],d:"D3",p:1,pr:"50–400k ₫",t:["Gifts","Handmade"],note:"Arts & craft gifts — handmade pieces that don't feel like airport souvenirs.",lat:10.77396,lng:106.68742,a:"",g:"https://maps.google.com/?cid=2229532807512517520",ax:1},
{n:"Gốm Sài Gòn - Chi nhánh 3",c:["shop"],d:"D5",p:1,pr:"50–400k ₫",t:["Ceramics","Pottery"],note:"Pottery — affordable Vietnamese ceramics; stock up on bowls and cups.",lat:10.74823,lng:106.67917,a:"",g:"https://maps.google.com/?cid=18057531270624420998",ax:1},
{n:"Gốm Sài Gòn",c:["shop"],d:"PN",p:1,pr:"50–400k ₫",t:["Ceramics","Pottery"],note:"Pottery — the original branch; same affordable handmade ceramics.",lat:10.80035,lng:106.66333,a:"",g:"https://maps.google.com/?cid=7950614818219475470",ax:1},
{n:"Rue Miche Boutique",c:["shop"],d:"X",p:2,pr:"200–700k ₫",t:["Local brand","Boutique"],note:"Local clothing — feminine cuts from a small Saigon label.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=4925996654304028258",ax:1},
{n:"The New Playground",c:["shop"],d:"D1",p:2,pr:"200–800k ₫",t:["Local brand","Streetwear"],note:"Local streetwear in the famous underground mall off Lý Tự Trọng — a dozen homegrown labels in one basement.",lat:10.77825,lng:106.70104,a:"26 Lý Tự Trọng, D1",g:"https://maps.google.com/?cid=14617869431819714735",ax:1},
{n:"Mozaic Space",c:["exp"],d:"D7",p:2,pr:"200–800k ₫",t:["Wellness","Local brand","Multi-brand"],note:"Local clothing — multi-brand space for homegrown designers.",lat:10.72697,lng:106.69159,a:"",g:"https://maps.google.com/?cid=11526330211389544278",ax:1},
{n:"SEESON IRL FLAGSHIP 199 ĐBP",c:["shop"],d:"D1",p:2,pr:"400k–1.2M ₫",t:["Eyewear","Local brand"],note:"Local sunnies, maybe — homegrown eyewear flagship on Điện Biên Phủ.",lat:10.77982,lng:106.70715,a:"199 Điện Biên Phủ",g:"https://maps.google.com/?cid=17062489541937604178",ax:1},
{n:"LIDER",c:["shop"],d:"D1",p:2,pr:"200–600k ₫",t:["Local brand","Streetwear"],note:"Local clothing — streetwear staple from the Saigon scene.",lat:10.77372,lng:106.7026,a:"",g:"https://maps.google.com/?cid=10422816824322226952",ax:1},
{n:"Whose Studio",c:["shop"],d:"D5",p:1,pr:"100–400k ₫",t:["Local brand","Budget"],note:"Cheap quality local clothing brand — everyday pieces without the markup.",lat:10.74707,lng:106.67841,a:"",g:"https://maps.google.com/?cid=8045324498821750674",ax:1},
{n:"Big Daddy's",c:["exp"],d:"X",p:2,pr:"~300–400k ₫/session",t:["Axe throwing","Group fun"],note:"Axe & knife throwing with a Vietnam veteran — exactly as advertised, and a great story after.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=8847749436794833659",ax:1},
{n:"DAMNSHP",c:["shop"],d:"D1",p:2,pr:"200–900k ₫",t:["Skate","Screen print"],note:"Cool little skate shop, screen printing their own shirts — decks, tees and attitude.",lat:10.78531,lng:106.7188,a:"",g:"https://maps.google.com/?cid=13195530063832487668",ax:1},
{n:"Yêu Cây Studio",c:["exp"],d:"X",p:1,pr:"50–500k ₫",t:["Wellness","Plants","Nursery"],note:"Nursery recommended by a nice day spa — houseplants and pots for the apartment jungle.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=12478707129757504598",ax:1},
{n:"règarden",c:["shop"],d:"X",p:1,pr:"50–500k ₫",t:["Plants","Nursery"],note:"Nursery recommended by Trang — greenery, pots and repotting help.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=8031972073813395235",ax:1},
{n:"Flyover Starry Sky Art Museum",c:["exp"],d:"X",p:2,pr:"~200–350k ₫",t:["Museum","Immersive"],note:"Trippy immersive light exhibitions — bring a camera and low expectations of subtlety.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=18164400682429549904",ax:1},
{n:"SaigonExotic",c:["shop"],d:"D3",p:2,pr:"200k–1.2M ₫",t:["Skate","Local brand"],note:"Skate shop — boards and local streetwear from the scene.",lat:10.76696,lng:106.66408,a:"",g:"https://maps.google.com/?cid=448757556444966585",ax:1},
{n:"SECTOR Store",c:["shop"],d:"D7",p:2,pr:"200–800k ₫",t:["Local brand","Streetwear"],note:"Local multi-brand streetwear store from the saved list.",lat:10.73762,lng:106.67918,a:"",g:"https://maps.google.com/?cid=5200369255994744518",ax:1},
{n:"Van Thanh Swimming Pool",c:["exp"],d:"BT",p:1,pr:"~60–100k ₫ entry",t:["Pool day","Park"],note:"Public swimming pool and park — old-school Saigon weekend institution; cheap entry, shady lawns.",lat:10.79718,lng:106.71515,a:"",g:"https://maps.google.com/?cid=9930437989605271785",ax:1},
{n:"Vesta Lifestyle & Gifts - Flagship store",c:["shop"],d:"X",p:2,pr:"100–600k ₫",t:["Gifts","Local made"],note:"Great locally made gifts — a reliable one-stop before flying out.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=428940482737489109",ax:1},
{n:"26 Lý Tự Trọng",c:["shop"],d:"D1",p:1,pr:"50–400k ₫",t:["Thrift","Treasure hunt"],note:"Thrift shops stacked through an old building — dig through floor by floor.",lat:10.77813,lng:106.70117,a:"26 Lý Tự Trọng, D1",g:"https://maps.google.com/?cid=17100984792016624462",ax:1},
{n:"The Highball Garment Store",c:["shop"],d:"X",p:1,pr:"100–500k ₫",t:["Vintage","Thrift"],note:"Vintage thrift shop — curated secondhand with a workwear lean.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=9227087333533556285",ax:1},
{n:"Mayhem Saigon Vintage Store",c:["shop"],d:"D1",p:1,pr:"100–500k ₫",t:["Vintage","Local brand","Posters & pins"],note:"Cool little vintage store — great range of shirts and jackets, plus movie posters, pins and stickers.",lat:10.77381,lng:106.69812,a:"",g:"https://maps.google.com/?cid=14795586265961257459",ax:1},
{n:"TUYÊN OFFICIAL",c:["shop"],d:"X",p:2,pr:"200–600k ₫",t:["Local brand","90s style"],note:"Locally made 90's style clothing — baggy fits and throwback graphics.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=253066613510000014",ax:1},
{n:"Deeritage - Vintage Jewelry",c:["shop"],d:"X",p:2,pr:"200k–2M ₫",t:["Vintage","Jewellery","Local brand"],note:"Vintage jewellery store — one-off rings, chains and oddities.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=6174626808470813418",ax:1},
{n:"Vintage store - Have a good day",c:["shop"],d:"D5",p:1,pr:"50–300k ₫",t:["Vintage","Thrift","Local brand","Cheap finds"],note:"Cool little op shop — cheap racks, occasional gold.",lat:10.79381,lng:106.62967,a:"",g:"https://maps.google.com/?cid=1285697662791262894",ax:1},
{n:"LUMA Saigon",c:["shop","cafe"],d:"X",p:2,pr:"300k–1.5M ₫",t:["Designer","Café"],note:"Cafe / stylish clothing brand shop — browse the rails with a flat white in hand.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=6989560109795745630",ax:1},
{n:"JELLYFISH SAIGON",c:["shop"],d:"D5",p:2,pr:"300k–1.5M ₫",t:["Jewellery","Local brand","Designer","LGBTQIA+"],note:"Locally made LGBTQIA+ silverware jewellery — bold pieces from a proud local studio.",lat:10.74883,lng:106.68657,a:"",g:"https://maps.google.com/?cid=18009518676214901650",ax:1},
{n:"DMDSTUDIOS",c:["shop"],d:"D7",p:2,pr:"250–700k ₫",t:["Designer","Basics"],note:"Local basics — a high quality version of Uniqlo, as Mark puts it.",lat:10.74171,lng:106.69131,a:"",g:"https://maps.google.com/?cid=14763178053511258499",ax:1},
{n:"waa. studios",c:["shop"],d:"D5",p:3,pr:"700k–2M ₫",t:["Footwear","Designer","Handmade"],note:"Fancy leather sandals — handmade and worth the splurge.",lat:10.74722,lng:106.68015,a:"",g:"https://maps.google.com/?cid=12994798461372893824",ax:1},
{n:"Ananas Đặng Thị Nhu - Standard Store",c:["shop"],d:"D1",p:2,pr:"400–900k ₫",t:["Footwear","Local brand","Sneakers"],note:"Locally made Converse-style shoes from recycled materials, plus good quality t-shirts.",lat:10.77044,lng:106.71472,a:"Đặng Thị Nhu, D1",g:"https://maps.google.com/?cid=12322564665652189095",ax:1},
{n:"Therésa Spa",c:["exp"],d:"D2",p:2,pr:"400–800k ₫ / 60–90 min",t:["Wellness","Massage"],note:"Excellent therapeutic massage — firm, gets into the right knots. Great atmosphere and super friendly service. Mark-tested, 5 stars.",lat:10.802,lng:106.738,a:"Thảo Điền",g:"https://maps.google.com/?cid=4620402609465124766",ax:1},
{n:"Thuong Xanh Film Store",c:["shop"],d:"D4",p:1,pr:"100–300k ₫/roll",t:["Film & camera","Cheap film"],note:"Cheap film — stock up on rolls before a shoot weekend.",lat:10.74324,lng:106.6956,a:"",g:"https://maps.google.com/?cid=12887517589018696362",ax:1},
{n:"Botanist Lab by CIRCADIAN",c:["exp"],d:"X",p:2,pr:"nightly rates",t:["Stay","Plant-filled"],note:"Cute little Airbnb from 2023 — plant-filled stay if you need a design-y base or a staycation.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=17168211069945597963",ax:1},
{n:"47plus minilab",c:["shop"],d:"X",p:1,pr:"80–200k ₫/roll",t:["Film & camera","Dev & scan"],note:"Film development — reliable minilab for developing and scanning your rolls.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=6619027472617853704",ax:1},
{n:"COMPOUND GARMENT",c:["shop"],d:"X",p:2,pr:"300–900k ₫",t:["Designer","90s style"],note:"Cool plain and 90's-style pants, jackets and shirts — quiet, well-cut pieces.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=10335651771723261769",ax:1},
{n:"Mây Concept - Thảo Điền",c:["shop"],d:"D2",p:2,pr:"200–800k ₫",t:["Vegan","Designer","Fragrance"],note:"Vegan and ethical fragrances, face wash and creams — Aesop / Le Labo vibes, made locally.",lat:10.8036,lng:106.734,a:"Thảo Điền",g:"https://maps.google.com/?cid=12772447535616465093",ax:1},
{n:"themossbox",c:["shop"],d:"D1",p:2,pr:"200–800k ₫",t:["Plants","Terrarium"],note:"Mossy garden vibes — terrariums and tiny green worlds.",lat:10.78584,lng:106.7028,a:"",g:"https://maps.google.com/?cid=10058445282551487378",ax:1},
{n:"AquaGarden",c:["shop"],d:"X",p:2,pr:"200k–1M ₫",t:["Plants","Aquascape"],note:"Terrrrarium — aquascapes and glass gardens.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=9241923949178048815",ax:1},
{n:"so much closer Vietnam",c:["shop"],d:"X",p:1,pr:"50–400k ₫",t:["Gifts","Art"],note:"Cute art and gift store — prints, objects and small joys.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=9734438750337251003",ax:1},
{n:"Dinh Design Store - Independence Palace Souvenir Shop",c:["shop"],d:"D1",p:2,pr:"100–700k ₫",t:["Souvenirs","Design"],note:"Design art store at Independence Palace — actually-good souvenirs with a modernist streak.",lat:10.7796,lng:106.72093,a:"Independence Palace, D1",g:"https://maps.google.com/?cid=9317094664162518432",ax:1},
{n:"Vina Design Store at the Post Office",c:["shop"],d:"D1",p:2,pr:"100–600k ₫",t:["Souvenirs","Design"],note:"Design goods inside the Central Post Office — grab something better than a fridge magnet.",lat:10.76776,lng:106.68938,a:"Central Post Office, D1",g:"https://maps.google.com/?cid=2250908384630559984",ax:1},
{n:"Antique Street",c:["shop"],d:"D1",p:2,pr:"haggle",t:["Antiques","Street of shops"],note:"Lê Công Kiều antique row — a whole street of curios, brass, watches and maybe-genuine relics. Haggle.",lat:10.77054,lng:106.70016,a:"Lê Công Kiều, D1",g:"https://maps.google.com/?cid=14128651088171038717",ax:1},
{n:"Vina Groove",c:["shop"],d:"PN",p:2,pr:"200k–1.5M ₫",t:["Records & vinyl","Crate digging"],note:"Record store — Vietnamese pressings and imports for the crate diggers.",lat:10.81352,lng:106.66999,a:"",g:"https://maps.google.com/?cid=6724481135239675426",ax:1},
{n:"Hãng Đĩa Thời Đại (Times Records)",c:["shop"],d:"PN",p:2,pr:"300k–1.5M ₫",t:["Records & vinyl","New & reissue"],note:"Times Records — the best-known vinyl shop in town; new pressings, reissues and players.",lat:10.79935,lng:106.67483,a:"",g:"https://maps.google.com/?cid=17164358474306825309",ax:1},
{n:"Vinyl Việt",c:["shop"],d:"D5",p:2,pr:"200k–1.5M ₫",t:["Records & vinyl","Browse"],note:"Vinyl shop from the saved list — worth a flick-through when nearby.",lat:10.74717,lng:106.67878,a:"",g:"https://maps.google.com/?cid=5267652972320673893",ax:1},
{n:"Bluish Records",c:["shop"],d:"X",p:2,pr:"200k–1M ₫",t:["Records & vinyl","Indie"],note:"Small record store — indie leanings and a tidy secondhand crate.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=5107839947020009989",ax:1},
{n:"CAFE Sài Gòn ĐĨA THAN",c:["shop","cafe"],d:"D5",p:1,pr:"45–90k ₫",t:["Records & vinyl","Café"],note:"Vinyl café — cà phê with records playing on the house turntable.",lat:10.8215,lng:106.65348,a:"",g:"https://maps.google.com/?cid=6971717320014582054",ax:1},
{n:"Spa Đông Y Tĩnh An",c:["exp"],d:"X",p:2,pr:"300–600k ₫",t:["Wellness","Traditional"],note:"Traditional đông y (Eastern medicine) spa — herbal treatments, cupping and deep-pressure massage.",lat:null,lng:null,a:"",g:"https://maps.google.com/?cid=11007266470849705751",ax:1},
// ---- FROM MARK'S STAR REVIEWS ----
{n:"Drift Bar & Café",c:["drink","cafe"],d:"D1",p:2,pr:"60–160k ₫",t:["Canal-side","Day-to-night"],note:"Rated 5 stars by Mark — laid-back canal-side spot on Hoàng Sa; coffee by day, drinks by night.",lat:10.7896,lng:106.6975,a:"27 Hoàng Sa",g:"https://www.google.com/maps/place//data=!4m2!3m1!1s0x0:0x135da5f8eaad04db",ax:1},
{n:"Saigon on Motorbike",c:["exp"],d:"D3",p:3,pr:"~1–1.5M ₫ / tour",t:["Food tour","Back-of-bike"],note:"Rated 5 stars — city and street-food tours from the back of a motorbike. The right way to meet Saigon.",lat:10.7695,lng:106.6810,a:"51/11 Cao Thắng",g:"https://www.google.com/maps/place//data=!4m2!3m1!1s0x0:0x2f0dc811c0230e6e",ax:1},
{n:"Warning Zone — M Plaza",c:["exp"],d:"D1",p:2,pr:"100–300k ₫",t:["Arcade","Games","Rainy day"],note:"Rated 4 stars — arcade games, VR and time-attack fun inside M Plaza on Lê Duẩn.",lat:10.7822,lng:106.7000,a:"39 Lê Duẩn",g:"https://www.google.com/maps/place//data=!4m2!3m1!1s0x0:0x81b337c21bef409d",ax:1},
{n:"Pasteur Street — Lê Thánh Tôn",c:["drink"],d:"D1",p:1,pr:"80–180k ₫/pint",t:["Craft beer","Taproom"],note:"Rated 5 stars — the Japan-town taproom of Pasteur Street. Same Jasmine IPA, different alley.",lat:10.7822,lng:106.7043,a:"26A Lê Thánh Tôn",g:"https://www.google.com/maps/place//data=!4m2!3m1!1s0x0:0x138de6375e2fd3be",ax:1},
// ---- FROM THE MASTER GUIDE (landmarks & staples) ----
{n:"Bánh Xèo Ăn Là Nhớ",c:["eat"],d:"D3",p:0,pr:"",t:[],note:"Crispy Vietnamese sizzling pancakes.",lat:10.7842,lng:106.6851,a:""},
{n:"Cà Phê Muối Chú Long",c:["cafe"],d:"D1",p:0,pr:"",t:[],note:"Salted coffee takeaway stand.",lat:10.7735,lng:106.6920,a:""},
{n:"Phở Hòa C Pasteur",c:["eat"],d:"D3",p:0,pr:"",t:[],note:"Classic northern style pho staple.",lat:10.7863,lng:106.6890,a:""},
{n:"Bún Chả Hà Nội 1982",c:["eat"],d:"D1",p:0,pr:"",t:[],note:"Charcoal grilled pork noodles.",lat:10.7750,lng:106.6960,a:""},
{n:"Snob Coffee",c:["cafe"],d:"D1",p:0,pr:"",t:[],note:"24-hour work cafe with good Wi-Fi.",lat:10.7698,lng:106.6925,a:""},
{n:"L'Usine Le Loi",c:["cafe","shop"],d:"D1",p:0,pr:"",t:[],note:"Concept store, cafe, and brunch space.",lat:10.7740,lng:106.7001,a:""},
{n:"Secret Garden",c:["eat"],d:"D1",p:0,pr:"",t:[],note:"Rooftop country-style Vietnamese restaurant.",lat:10.7758,lng:106.6999,a:""},
{n:"Quán Bụi",c:["eat"],d:"D1",p:0,pr:"",t:[],note:"Upscale rustic Vietnamese home cooking.",lat:10.7801,lng:106.7042,a:""},
{n:"Bánh Cuốn Tây Hồ",c:["eat"],d:"D1",p:0,pr:"",t:[],note:"Steamed rice rolls stuffed with minced pork and wood ear mushrooms.",lat:10.7880,lng:106.6931,a:""},
{n:"Xôi Chè Bùi Thị Xuân",c:["eat"],d:"D1",p:0,pr:"",t:[],note:"Famous savoury sticky rice and sweet desserts.",lat:10.7690,lng:106.6888,a:""},
{n:"Cheo Leo Cafe",c:["cafe"],d:"D3",p:0,pr:"",t:[],note:"Oldest claypot stock-pot cafe in Saigon.",lat:10.7672,lng:106.6801,a:""},
{n:"Phở Thìn Hà Nội",c:["eat"],d:"D1",p:0,pr:"",t:[],note:"Stir-fried garlic beef pho broth.",lat:10.7720,lng:106.6980,a:""},
{n:"Bún Mắm 47",c:["eat"],d:"D1",p:0,pr:"",t:[],note:"Rich fermented fish broth noodles.",lat:10.7689,lng:106.6911,a:""},
{n:"Bánh Mì Hồng Hoa",c:["eat"],d:"D1",p:0,pr:"",t:[],note:"Freshly baked crispy baguettes packed high.",lat:10.7695,lng:106.6918,a:""},
{n:"Mì Quảng Mốt",c:["eat"],d:"D3",p:0,pr:"",t:[],note:"Central Vietnamese turmeric noodle soup.",lat:10.7780,lng:106.6820,a:""},
{n:"Cơm Tấm Ba Cường",c:["eat"],d:"D1",p:0,pr:"",t:[],note:"Classic broken rice with pork rib and egg loaf.",lat:10.7680,lng:106.6900,a:""},
{n:"Bún Thịt Nướng Chị Tuyền",c:["eat"],d:"D1",p:0,pr:"",t:[],note:"Grilled pork and spring roll cold rice noodles.",lat:10.7718,lng:106.6905,a:""},
{n:"Pasteur Street Brewing Co.",c:["drink","eat"],d:"D1",p:0,pr:"",t:[],note:"Craft beer pioneer taproom in an alley.",lat:10.7755,lng:106.7008,a:""},
{n:"Heart of Darkness Craft Brewery",c:["drink","eat"],d:"D1",p:0,pr:"",t:[],note:"Bold hop-forward craft beers and food.",lat:10.7782,lng:106.7031,a:""},
{n:"7000A Craft Beer",c:["drink"],d:"D1",p:0,pr:"",t:[],note:"Cosy hidden local microbrew taproom.",lat:10.7731,lng:106.6985,a:""},
{n:"East West Brewing Co.",c:["drink","eat"],d:"D1",p:0,pr:"",t:[],note:"Large operational brewery and restaurant.",lat:10.7702,lng:106.6961,a:""},
{n:"Belgo Belgian Beer",c:["drink","eat"],d:"D1",p:0,pr:"",t:[],note:"Authentic Belgian beers and abbey vibes.",lat:10.7811,lng:106.6950,a:""},
{n:"The Rabbit Hole",c:["drink"],d:"D1",p:0,pr:"",t:[],note:"Speakeasy jazz cocktail lounge.",lat:10.7760,lng:106.6980,a:""},
{n:"Firkin Cocktail Bar",c:["drink"],d:"D1",p:0,pr:"",t:[],note:"Tailored bespoke whiskey and cocktail bar.",lat:10.7751,lng:106.7020,a:""},
{n:"Snug Pub",c:["drink"],d:"D1",p:0,pr:"",t:[],note:"Chill Irish pub spot.",lat:10.7738,lng:106.7035,a:""},
{n:"Arcan",c:["drink","exp"],d:"BT",p:0,pr:"",t:[],note:"Underground electro and nightlife venue.",lat:10.8010,lng:106.7150,a:""},
{n:"Observatory",c:["drink","exp"],d:"D4",p:0,pr:"",t:[],note:"Iconic electronic music club venue.",lat:10.7610,lng:106.7080,a:""},
{n:"Lush Nightclub",c:["drink","exp"],d:"D1",p:0,pr:"",t:[],note:"Long-standing nightclub staple.",lat:10.7830,lng:106.7040,a:""},
{n:"BAMBAM",c:["drink"],d:"D1",p:0,pr:"",t:[],note:"Bali-inspired lounge and club.",lat:10.7710,lng:106.6970,a:""},
{n:"Commune",c:["cafe","eat"],d:"D2",p:0,pr:"",t:[],note:"Riverview casual community cafe space.",lat:10.8060,lng:106.7330,a:""},
{n:"Snap Cafe",c:["cafe","eat"],d:"D2",p:0,pr:"",t:[],note:"Outdoor family-friendly compound with shops.",lat:10.8070,lng:106.7320,a:""},
{n:"Mekong Merchant",c:["eat","cafe"],d:"D2",p:0,pr:"",t:[],note:"Rustic courtyard dining and western favorites.",lat:10.8040,lng:106.7310,a:""},
{n:"Dolphy Cafe",c:["cafe"],d:"D2",p:0,pr:"",t:[],note:"Neighbourhood staple corner coffee spot.",lat:10.8050,lng:106.7325,a:""},
{n:"Villa Song Saigon",c:["eat","drink"],d:"D2",p:0,pr:"",t:[],note:"Boutique hotel garden restaurant on the river.",lat:10.8120,lng:106.7360,a:""},
{n:"Bảo Tàng Mỹ Thuật",c:["exp"],d:"D1",p:0,pr:"",t:[],note:"Ho Chi Minh City Fine Arts Museum in yellow colonial mansion.",lat:10.7691,lng:106.6982,a:""},
{n:"War Remnants Museum",c:["exp"],d:"D3",p:0,pr:"",t:[],note:"Historical military exhibits and photography.",lat:10.7794,lng:106.6921,a:""},
{n:"Independence Palace",c:["exp"],d:"D1",p:0,pr:"",t:[],note:"Landmark 1960s presidential architecture.",lat:10.7770,lng:106.6953,a:""},
{n:"Notre-Dame Cathedral",c:["exp"],d:"D1",p:0,pr:"",t:[],note:"French colonial red-brick cathedral.",lat:10.7798,lng:106.6990,a:""},
{n:"Central Post Office",c:["exp","shop"],d:"D1",p:0,pr:"",t:[],note:"Iconic Gustave Eiffel vaulted postal hall.",lat:10.7798,lng:106.6998,a:""},
{n:"Tân Định Church",c:["exp"],d:"D3",p:0,pr:"",t:[],note:"Bright pink Romanian Gothic church.",lat:10.7890,lng:106.6905,a:""},
{n:"Chợ Bến Thành",c:["shop","eat"],d:"D1",p:0,pr:"",t:[],note:"Central bustling historical covered market.",lat:10.7725,lng:106.6980,a:""},
{n:"Chợ Lớn (Bình Tây Market)",c:["shop","eat"],d:"D5",p:0,pr:"",t:[],note:"Massive Chinatown wholesale trade hub.",lat:10.7500,lng:106.6510,a:""},
{n:"Chùa Ngọc Hoàng",c:["exp"],d:"D1",p:0,pr:"",t:[],note:"Jade Emperor Pagoda with ornate carvings and turtle pond.",lat:10.7918,lng:106.6982,a:""},
{n:"Thảo Cầm Viên",c:["exp"],d:"D1",p:0,pr:"",t:[],note:"Historic botanical gardens and zoo.",lat:10.7875,lng:106.7052,a:""},
{n:"Landmark 81 SkyView",c:["exp"],d:"BT",p:0,pr:"",t:[],note:"Tallest skyscraper observatory in Vietnam.",lat:10.7950,lng:106.7218,a:""},
{n:"Bitexco Financial Tower",c:["exp"],d:"D1",p:0,pr:"",t:[],note:"Helipad tower with skydeck views.",lat:10.7717,lng:106.7044,a:""},
{n:"Cầu Ánh Sao (Starlight Bridge)",c:["exp"],d:"D7",p:0,pr:"",t:[],note:"Illuminated pedestrian bridge across Phu My Hung lake.",lat:10.7290,lng:106.7190,a:""},
{n:"Crescent Mall",c:["shop"],d:"D7",p:0,pr:"",t:[],note:"Modern lakeside retail shopping center.",lat:10.7280,lng:106.7180,a:""},
{n:"SC VivoCity",c:["shop"],d:"D7",p:0,pr:"",t:[],note:"Large multi-level family shopping complex.",lat:10.7310,lng:106.7020,a:""},
{n:"Saigon Centre / Takashimaya",c:["shop"],d:"D1",p:0,pr:"",t:[],note:"Premier Japanese department store and retail mall.",lat:10.7736,lng:106.7011,a:""},
{n:"Vincom Center Dong Khoi",c:["shop"],d:"D1",p:0,pr:"",t:[],note:"Central luxury and high-street fashion hub.",lat:10.7780,lng:106.7018,a:""},
{n:"Diamond Plaza",c:["shop"],d:"D1",p:0,pr:"",t:[],note:"Classic department store near cathedral.",lat:10.7810,lng:106.6980,a:""},
{n:"The Cafe Apartments (42 Nguyễn Huệ)",c:["cafe","shop"],d:"D1",p:0,pr:"",t:[],note:"9-storey retro block filled entirely with cafes and boutiques.",lat:10.7742,lng:106.7030,a:""},
{n:"14 Tôn Thất Đạm Apartments",c:["cafe","shop"],d:"D1",p:0,pr:"",t:[],note:"Hip vintage apartment building housing hidden shops.",lat:10.7712,lng:106.7041,a:""},
{n:"26 Lý Tự Trọng Apartments",c:["shop","cafe"],d:"D1",p:0,pr:"",t:[],note:"Art galleries, fashion ateliers, and coffee spots.",lat:10.7771,lng:106.7015,a:""},
{n:"Gia Định Park",c:["exp"],d:"PN",p:0,pr:"",t:[],note:"Large leafy park near airport zone.",lat:10.8120,lng:106.6780,a:""},
{n:"Tao Đàn Park",c:["exp"],d:"D1",p:0,pr:"",t:[],note:"Central green space famous for morning bird collectors.",lat:10.7740,lng:106.6910,a:""},
{n:"Lê Văn Tám Park",c:["exp"],d:"D1",p:0,pr:"",t:[],note:"Shaded public park popular for evening walks.",lat:10.7870,lng:106.6950,a:""},
{n:"Bình Quới Tourist Village 1",c:["exp"],d:"BT",p:0,pr:"",t:[],note:"Mekong Delta-style green resort enclave on the river.",lat:10.8330,lng:106.7610,a:""},
{n:"Văn Thánh Tourist Village",c:["exp"],d:"BT",p:0,pr:"",t:[],note:"Lush oasis park right on the city edge.",lat:10.7990,lng:106.7180,a:""},
{n:"Đường Sách TP.HCM (Book Street)",c:["exp","shop"],d:"D1",p:0,pr:"",t:[],note:"Pedestrian book street with outdoor cafes.",lat:10.7802,lng:106.6995,a:""},
{n:"Phố Đi Bộ Nguyễn Huệ",c:["exp"],d:"D1",p:0,pr:"",t:[],note:"Wide pedestrian promenade stretching to riverfront.",lat:10.7738,lng:106.7032,a:""},
{n:"Phố Đi Bộ Bùi Viện",c:["drink","exp"],d:"D1",p:0,pr:"",t:[],note:"High-energy backpacker nightlife street.",lat:10.7675,lng:106.6938,a:""},
{n:"Phạm Ngũ Lão Street",c:["shop","eat"],d:"D1",p:0,pr:"",t:[],note:"Travel hub lined with bus operators and budget eats.",lat:10.7682,lng:106.6920,a:""},
{n:"Nhà Hát Thành Phố (Opera House)",c:["exp"],d:"D1",p:0,pr:"",t:[],note:"French colonial theater hosting A O Show performances.",lat:10.7766,lng:106.7031,a:""},
{n:"Bến Bạch Đằng Park",c:["exp"],d:"D1",p:0,pr:"",t:[],note:"Renovated riverfront promenade and water-bus terminal.",lat:10.7711,lng:106.7065,a:""},
{n:"Saigon Waterbus Terminal",c:["exp"],d:"D1",p:0,pr:"",t:[],note:"Commuter river ferry link out to District 2 and Thủ Đức.",lat:10.7715,lng:106.7068,a:""},
{n:"Thủ Thiêm Bridge Park",c:["exp"],d:"BT",p:0,pr:"",t:[],note:"Popular night spot for river breezes and skyline views.",lat:10.7890,lng:106.7180,a:""},
{n:"Chùa Vĩnh Nghiêm",c:["exp"],d:"D3",p:0,pr:"",t:[],note:"Large Mahayana temple with towering pagoda.",lat:10.7915,lng:106.6828,a:""},
{n:"Chùa Xá Lợi",c:["exp"],d:"D3",p:0,pr:"",t:[],note:"Historic 1950s Buddhist center with tall bell tower.",lat:10.7785,lng:106.6872,a:""},
{n:"Chùa Phổ Quang",c:["exp"],d:"X",p:0,pr:"",t:[],note:"Serene temple with dragon cave shrines.",lat:10.8080,lng:106.6620,a:""},
{n:"Lăng Ông Bà Chiểu",c:["exp"],d:"BT",p:0,pr:"",t:[],note:"Historic tomb complex near Bà Chiểu market.",lat:10.8018,lng:106.6985,a:""},
{n:"Chợ Bà Chiểu",c:["eat","shop"],d:"BT",p:0,pr:"",t:[],note:"Vibrant local market famous for night sticky rice stalls.",lat:10.8010,lng:106.6975,a:""},
{n:"Chợ Tân Định",c:["eat","shop"],d:"D1",p:0,pr:"",t:[],note:"Bustling market famous for fabrics and street eats.",lat:10.7882,lng:106.6901,a:""},
{n:"Chợ Hòa Bình",c:["eat"],d:"D5",p:0,pr:"",t:[],note:"Street food haven in District 5.",lat:10.7540,lng:106.6710,a:""},
{n:"Ốc Đào",c:["eat"],d:"D1",p:0,pr:"",t:[],note:"Celebrated alleyway sea-snail and seafood feast.",lat:10.7640,lng:106.6890,a:""},
{n:"Ốc Như",c:["eat"],d:"D3",p:0,pr:"",t:[],note:"Packed local seafood and snail stall.",lat:10.7810,lng:106.6810,a:""},
{n:"Bún Bò Huế Đông Ba",c:["eat"],d:"D1",p:0,pr:"",t:[],note:"Spicy Hue beef noodle soup specialist.",lat:10.7705,lng:106.6940,a:""},
{n:"Mì Vit Tiềm Thượng Hải",c:["eat"],d:"D5",p:0,pr:"",t:[],note:"Braised duck egg noodle soup infused with Chinese herbs.",lat:10.7520,lng:106.6620,a:""},
];

/* ---------- explore ---------- */
/* Places dataset imported from the Sàigòn Field Guide (markpeou/sai-gon).
   Shape: n=name, c=categories, d=district code, p=price tier, pr=price range,
   t=tags, note=description, a=address, g=exact Google Maps link. */
const PLACE_CATS = [
  { id: "all", label: "All", icon: Compass },
  { id: "eat", label: "Eat", icon: Utensils },
  { id: "drink", label: "Drink", icon: Beer },
  { id: "cafe", label: "Cafés", icon: Coffee },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "exp", label: "Do", icon: Ticket },
];

/* Derived, never hand-written — so a place tile, a filter row and a page
   heading always say the same thing about the same district. */
const DIST_NAME = {
  ...Object.fromEntries(DISTRICTS.map((d) => [d.id, distLabel(d.id)])),
  X: "Around town",
};

const DIST_FILTERS = [
  { id: "all", label: "All districts" },
  ...DISTRICTS.map((d) => ({ id: d.id, label: distLabel(d.id) })),
  { id: "X", label: "Around town" },
];

const PRICE_FILTERS = [
  { id: 0, label: "Any price" },
  { id: 1, label: "₫ Budget" },
  { id: 2, label: "₫₫ Mid" },
  { id: 3, label: "₫₫₫ Premium" },
];

/* Reads naturally in a page heading — "Places to eat in District 1". */
const CAT_NOUN = {
  all: "All places",
  eat: "Places to eat",
  drink: "Bars & drinks",
  cafe: "Cafés",
  shop: "Shops",
  exp: "Things to do",
};

/* Fold Vietnamese diacritics so "banh mi" matches "bánh mì". */
const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/₫/g, "d");

const mapsUrl = (p) =>
  p.g || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.n + " " + (p.a || "") + " Ho Chi Minh City")}`;

/* ---------- geolocation ---------- */
/* Straight-line (haversine) distance in km. */
const kmBetween = (a, b) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const fmtKm = (k, units = "km") => {
  if (units === "mi") {
    const mi = k * 0.621371;
    return mi < 0.1 ? `${Math.round(mi * 5280)} ft` : `${mi.toFixed(1)} mi`;
  }
  return k < 1 ? `${Math.round(k * 1000)} m` : `${k.toFixed(1)} km`;
};

/* status: idle | asking | on | denied | unavailable */
/* Base location: what "nearby" is measured from. Live is a fresh GPS read
   every time it's turned on; home/hotel are a single point captured once
   (either a GPS read while standing there, or a typed address) and kept
   until cleared. */
const BASE_TYPES = [
  { id: "live", label: "Live" },
  { id: "home", label: "Home" },
  { id: "hotel", label: "My hotel" },
];

/* Address -> coordinates via OpenStreetMap's free Nominatim search — no
   API key, biased to Vietnam since that's the only country this app covers. */
const shortAddress = (label) => (label ? label.split(",").slice(0, 2).join(",").trim() : null);

async function geocodeAddress(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&q=${encodeURIComponent(query)}`;
  let res;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch {
    throw new Error("network");
  }
  if (!res.ok) throw new Error("network");
  const results = await res.json();
  if (!results.length) throw new Error("no_match");
  const r = results[0];
  return { lat: parseFloat(r.lat), lng: parseFloat(r.lon), label: r.display_name };
}

function useBaseLocation() {
  const [type, setType] = useState(() => {
    try { return localStorage.getItem("tp_base_type") || "live"; } catch { return "live"; }
  });
  const [status, setStatus] = useState("idle");
  const [liveCoords, setLiveCoords] = useState(null);
  const [fixed, setFixed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tp_base_fixed") || "{}"); } catch { return {}; }
  });
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState(null);

  const persistFixed = (next) => {
    setFixed(next);
    try { localStorage.setItem("tp_base_fixed", JSON.stringify(next)); } catch {}
  };

  const chooseType = (t) => {
    setType(t);
    setGeocodeError(null);
    try { localStorage.setItem("tp_base_type", t); } catch {}
    setStatus(t === "live" ? (liveCoords ? "on" : "idle") : (fixed[t] ? "on" : "idle"));
  };

  /* Reads the device's current GPS position. For "live" that becomes the
     live point; for "home"/"hotel" it's saved once as that fixed point. */
  const capture = () => {
    if (!navigator.geolocation) { setStatus("unavailable"); return; }
    setGeocodeError(null);
    setStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (type === "live") setLiveCoords(c);
        else persistFixed({ ...fixed, [type]: c });
        setStatus("on");
      },
      (err) => setStatus(err && err.code === 1 ? "denied" : "unavailable"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  /* Home/hotel only: look up a typed address instead of standing there. */
  const saveAddress = async (query) => {
    if (type === "live" || !query.trim()) return false;
    setGeocoding(true);
    setGeocodeError(null);
    try {
      const point = await geocodeAddress(query.trim());
      persistFixed({ ...fixed, [type]: point });
      setStatus("on");
      return true;
    } catch (e) {
      setGeocodeError(
        e.message === "no_match"
          ? "Couldn't find that address — try adding more detail (street, district)."
          : "Search failed — check your connection and try again."
      );
      return false;
    } finally {
      setGeocoding(false);
    }
  };

  const clear = () => {
    setGeocodeError(null);
    if (type === "live") { setLiveCoords(null); setStatus("idle"); return; }
    const next = { ...fixed };
    delete next[type];
    persistFixed(next);
    setStatus("idle");
  };

  const coords = type === "live" ? liveCoords : fixed[type] || null;

  return { type, status, coords, fixed, chooseType, capture, clear, saveAddress, geocoding, geocodeError };
}

function PlaceCard({ p, dist, units }) {
  const cat = p.c[0];
  const Icon = (PLACE_CATS.find((c) => c.id === cat) || PLACE_CATS[0]).icon;
  return (
    <div style={{ background: T.card, borderRadius: 20, padding: 16, border: `1px solid ${T.line}` }}>
      <div className="flex items-start gap-3">
        <div style={{ width: 38, height: 38, borderRadius: 13, background: T.jadeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={17} color={T.jade} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 600, color: T.ink, lineHeight: 1.25 }}>{p.n}</div>
          <div style={{ fontFamily: font.ui, fontSize: 12, color: T.sub, marginTop: 3 }}>
            {DIST_NAME[p.d]}{p.a ? ` · ${p.a}` : ""}
          </div>
        </div>
        {dist !== undefined && (
          <span className="flex items-center gap-1 flex-shrink-0"
            style={{ background: T.accentSoft, color: "#8A6D25", fontFamily: font.ui, fontSize: 11.5, fontWeight: 700, padding: "5px 9px", borderRadius: 999 }}>
            <Navigation size={10} />~{fmtKm(dist, units)}
          </span>
        )}
      </div>
      <P style={{ marginTop: 10 }}>{p.note}</P>
      <div className="flex flex-wrap gap-1.5" style={{ marginTop: 10 }}>
        {p.t.map((t) => <Tag key={t}>{t}</Tag>)}
      </div>
      <div className="flex items-center justify-between" style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${T.line}` }}>
        <span style={{ fontFamily: font.ui, fontSize: 12, fontWeight: 600, color: T.sub }}>
          <span style={{ color: T.accent, letterSpacing: 1 }}>{"₫".repeat(p.p || 1)}</span> · {p.pr}
        </span>
        <a href={mapsUrl(p)} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5"
          style={{ fontFamily: font.ui, fontSize: 12.5, fontWeight: 700, color: T.accent, textDecoration: "none", flexShrink: 0 }}>
          Open in Maps <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

function PlacesBrowser({ onBack, initialDist = "all", initialCat = "all", heading = "All places", geo, units, openSettings }) {
  const [cat, setCat] = useState(initialCat);
  const [dist, setDist] = useState(initialDist);
  const [price, setPrice] = useState(0);
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(24);

  /* Live location is on by default — ask once when the browser first opens.
     Home/hotel are only ever captured by an explicit tap in Settings. */
  React.useEffect(() => {
    if (geo.type === "live" && geo.status === "idle") geo.capture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nearFirst = geo.status === "on" && geo.coords;

  const list = useMemo(() => {
    const nq = q.trim() ? norm(q.trim()) : "";
    const out = PLACES.filter((p) =>
      (cat === "all" || p.c.includes(cat)) &&
      (dist === "all" || p.d === dist) &&
      (price === 0 || p.p === price) &&
      (!nq || norm([p.n, p.note, p.a || "", ...p.t].join(" ")).includes(nq))
    ).map((p) => ({
      ...p,
      _km: nearFirst && p.lat != null && p.lng != null ? kmBetween(geo.coords, p) : undefined,
    }));
    if (nearFirst) out.sort((a, b) => (a._km ?? 1e9) - (b._km ?? 1e9));
    return out;
  }, [cat, dist, price, q, nearFirst, geo.coords]);

  /* Header reflects what you're actually looking at, and follows the filters.
     Arriving from a neighbourhood keeps that neighbourhood's own name. */
  const { title, subtitle } = useMemo(() => {
    const catNoun = CAT_NOUN[cat] || "All places";
    const fromHood = dist === initialDist && heading !== "All places" ? heading : null;

    let t;
    if (dist === "all") {
      t = catNoun;
    } else if (cat === "all") {
      /* No category chosen — the place itself is the headline. */
      t = fromHood || DIST_NAME[dist];
    } else {
      /* Combined: use the short district name so the line stays readable. */
      t = `${catNoun} in ${DIST_NAME[dist]}`;
    }

    const bits = [];
    if (price !== 0) bits.push(PRICE_FILTERS.find((p) => p.id === price).label);
    if (q.trim()) bits.push(`“${q.trim()}”`);
    return { title: t, subtitle: bits.join(" · ") };
  }, [cat, dist, price, q, initialDist, heading]);

  const reset = () => { setCat("all"); setDist("all"); setPrice(0); setQ(""); setLimit(24); };
  const bump = (fn) => (v) => { fn(v); setLimit(24); };

  return (
    <div className="flex flex-col gap-3">
      <button onClick={onBack} className="flex items-center gap-2"
        style={{ background: "none", border: "none", padding: "4px 0", fontFamily: font.ui, fontSize: 13.5, fontWeight: 700, color: T.jade, alignSelf: "flex-start" }}>
        <ArrowLeft size={16} /> Explore
      </button>

      <div>
        <H size={25} style={{ transition: "opacity 0.2s" }}>{title}</H>
        {subtitle && <P style={{ marginTop: 4 }}>{subtitle}</P>}
      </div>


      {/* search */}
      <div className="flex items-center gap-2"
        style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 999, padding: "11px 15px" }}>
        <Search size={15} color={T.sub} style={{ flexShrink: 0 }} />
        <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(24); }}
          placeholder="Search places, dishes, vibes…"
          style={{ border: "none", outline: "none", background: "none", width: "100%", fontFamily: font.ui, fontSize: 14, color: T.ink }} />
        {q && (
          <button onClick={() => setQ("")} style={{ background: "none", border: "none", padding: 0, display: "flex" }}>
            <X size={15} color={T.sub} />
          </button>
        )}
      </div>

      {/* category rail */}
      <div className="flex gap-2" style={{ overflowX: "auto", paddingBottom: 2, margin: "0 -20px", padding: "0 20px 2px" }}>
        {PLACE_CATS.map((c) => {
          const on = cat === c.id;
          return (
            <button key={c.id} onClick={() => bump(setCat)(c.id)}
              className="flex flex-col items-center gap-1.5"
              style={{
                flexShrink: 0, minWidth: 66, padding: "10px 12px", borderRadius: 14,
                background: on ? T.jadeSoft : T.card,
                border: `1px solid ${on ? "#CFE3DD" : T.line}`,
                fontFamily: font.ui, fontSize: 11.5, fontWeight: 700,
                color: on ? T.jade : T.sub,
              }}>
              <c.icon size={18} color={on ? T.jade : T.sub} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* district + price: two inline dropdowns */}
      <div className="flex gap-2">
        {[
          { value: dist, set: bump(setDist), opts: DIST_FILTERS.map((d) => [d.id, d.label]), active: dist !== "all" },
          { value: price, set: (v) => bump(setPrice)(Number(v)), opts: PRICE_FILTERS.map((p) => [p.id, p.label]), active: price !== 0 },
        ].map((sel, i) => (
          <div key={i} style={{ position: "relative", flex: 1 }}>
            <select value={sel.value} onChange={(e) => sel.set(e.target.value)}
              style={{
                width: "100%", appearance: "none", WebkitAppearance: "none",
                background: sel.active ? T.ink : T.card, color: sel.active ? "#fff" : T.ink,
                border: `1px solid ${sel.active ? T.ink : T.line}`, borderRadius: 999,
                padding: "10px 34px 10px 15px", fontFamily: font.ui, fontSize: 13, fontWeight: 600,
              }}>
              {sel.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown size={14} color={sel.active ? "#fff" : T.sub}
              style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between" style={{ marginTop: 2 }}>
        <div className="flex items-center gap-2">
          <P style={{ fontSize: 12.5 }}>
            <span style={{ fontWeight: 700, color: T.ink }}>{list.length}</span> place{list.length !== 1 ? "s" : ""}
            {nearFirst ? " · nearest first" : ""}
          </P>
          {!nearFirst && geo.status !== "asking" && (
            <button onClick={openSettings} className="flex items-center gap-1"
              style={{ background: "none", border: "none", padding: 0, fontFamily: font.ui, fontSize: 12.5, fontWeight: 700, color: T.accent }}>
              <Navigation size={11} /> Sort by distance
            </button>
          )}
        </div>
        {(cat !== "all" || dist !== "all" || price !== 0 || q) && (
          <button onClick={reset}
            style={{ background: "none", border: "none", fontFamily: font.ui, fontSize: 12.5, fontWeight: 700, color: T.accent }}>
            Clear filters
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 20px" }}>
          <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 600, color: T.ink }}>Nothing matches</div>
          <P style={{ marginTop: 6 }}>Try clearing a filter, or search for a dish, vibe or district.</P>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {list.slice(0, limit).map((p, i) => <PlaceCard key={p.n + i} p={p} dist={p._km} units={units} />)}
          {list.length > limit && (
            <button onClick={() => setLimit(limit + 24)}
              style={{ background: T.ink, color: "#fff", border: "none", borderRadius: 16, padding: "14px 0", fontFamily: font.ui, fontSize: 14, fontWeight: 700, marginTop: 4 }}>
              Show {Math.min(24, list.length - limit)} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- district map ----------
   Outlines come from districts.geojson in the repo (public/, served at
   the site root) — real OpenStreetMap boundaries, not anything we drew.
   If the file is missing or malformed the map entry points simply don't
   render; nothing half-works.

   ALIASES: our district ids vs. the names an OSM extract uses. District 2 was
   absorbed into Thủ Đức in 2021 and the whole district tier was replaced by
   wards on 1 Jul 2025, so a boundary file may carry any of these spellings.
   Matching is explicit — an unmatched id is reported, never silently dropped. */
const DIST_OSM_NAMES = {
  D1: ["District 1", "Quận 1", "Quan 1"],
  D2: ["District 2", "Quận 2", "Thảo Điền", "Thủ Đức", "Thu Duc", "Thành phố Thủ Đức"],
  D3: ["District 3", "Quận 3", "Quan 3"],
  D4: ["District 4", "Quận 4", "Quan 4"],
  D5: ["District 5", "Quận 5", "Quan 5"],
  D7: ["District 7", "Quận 7", "Quan 7"],
  BT: ["Bình Thạnh", "Binh Thanh", "Quận Bình Thạnh"],
  PN: ["Phú Nhuận", "Phu Nhuan", "Quận Phú Nhuận"],
};

/* District 2 was absorbed into Thủ Đức City in 2021, along with old
   District 9 — so the only real boundary left is roughly 5x the old D2's
   footprint. Thảo Điền is one corner of it, not the whole shape. Shown as
   a caveat under the map, not silently drawn as if it were "District 2". */
const DIST_MAP_CAVEATS = {
  D2: "This shape is Thủ Đức City's actual boundary — it absorbed old District 2 and District 9 in 2021. Thảo Điền sits in its southwest corner, closest to D1.",
};

/* Fetch once, cache for the session. status: loading | ready | none */
function useDistrictShapes() {
  const [state, setState] = useState({ status: "loading", byId: null });
  React.useEffect(() => {
    let alive = true;
    fetch(`${import.meta.env.BASE_URL}districts.geojson`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("no file"))))
      .then((gj) => {
        if (!alive) return;
        const feats = (gj && gj.features) || [];
        const byId = {};
        for (const id of Object.keys(DIST_OSM_NAMES)) {
          /* Prefer an explicit id on the feature (our own districts.geojson
             sets one) — falls back to name-matching for any other source. */
          let f = feats.find((ft) => (ft.properties || {}).id === id);
          if (!f) {
            const wanted = DIST_OSM_NAMES[id].map(norm);
            f = feats.find((ft) => {
              const pr = ft.properties || {};
              const names = [pr.name, pr["name:en"], pr.NAME_2, pr.district, pr.Name].filter(Boolean);
              return names.some((n) => wanted.includes(norm(String(n))));
            });
          }
          if (f) byId[id] = f;
        }
        const missing = Object.keys(DIST_OSM_NAMES).filter((id) => !byId[id]);
        if (missing.length) console.warn("districts.geojson: no outline matched", missing.join(", "));
        setState(Object.keys(byId).length ? { status: "ready", byId } : { status: "none", byId: null });
      })
      .catch(() => alive && setState({ status: "none", byId: null }));
    return () => { alive = false; };
  }, []);
  return state;
}

function DistrictMapSheet({ open, onClose, shapes, focus, setFocus }) {
  const holder = React.useRef(null);
  const map = React.useRef(null);
  const layers = React.useRef({});

  React.useEffect(() => {
    if (!open || !holder.current || map.current) return;
    const m = L.map(holder.current, { attributionControl: true, zoomControl: false })
      .setView([10.782, 106.695], 12);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap &copy; CARTO", maxZoom: 18,
    }).addTo(m);
    L.control.zoom({ position: "bottomright" }).addTo(m);

    Object.keys(shapes.byId).forEach((id) => {
      const layer = L.geoJSON(shapes.byId[id], {
        style: { color: T.jade, weight: 1.5, fillColor: T.jade, fillOpacity: 0.1 },
      }).addTo(m);
      layer.on("click", () => setFocus(id));
      layer.bindTooltip(distName(id), { permanent: false, direction: "center" });
      layers.current[id] = layer;
    });

    const all = L.featureGroup(Object.values(layers.current));
    m.fitBounds(all.getBounds(), { padding: [24, 24] });
    map.current = m;
    setTimeout(() => m.invalidateSize(), 120);
    return () => { m.remove(); map.current = null; layers.current = {}; };
  }, [open]);

  /* Selection drives styling and zoom — one source, no double state. */
  React.useEffect(() => {
    if (!map.current) return;
    Object.keys(layers.current).forEach((id) => {
      const on = id === focus;
      layers.current[id].setStyle({
        color: on ? T.accent : T.jade,
        weight: on ? 2.5 : 1.5,
        fillColor: on ? T.accent : T.jade,
        fillOpacity: on ? 0.28 : 0.1,
      });
      if (on) layers.current[id].bringToFront();
    });
    if (focus && layers.current[focus]) {
      map.current.fitBounds(layers.current[focus].getBounds(), { padding: [40, 40], maxZoom: 14 });
    }
  }, [focus, open]);

  if (!open) return null;
  const ids = Object.keys(shapes.byId || {});
  const count = focus ? PLACES.filter((p) => p.d === focus).length : 0;

  return (
    <>
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(21,32,29,0.45)", zIndex: 40 }} />
      <div style={{
        position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 0, width: "100%", maxWidth: 480,
        background: T.bg, borderRadius: "26px 26px 0 0", zIndex: 41, maxHeight: "90vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div className="flex items-center justify-between" style={{ padding: "16px 20px 12px" }}>
          <div>
            <Eyebrow>Where things are</Eyebrow>
            <H size={20} style={{ marginTop: 2 }}>Saigon by district</H>
          </div>
          <button onClick={onClose} aria-label="Close"
            style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 999, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} color={T.sub} />
          </button>
        </div>

        <div ref={holder} style={{ height: "46vh", minHeight: 240, background: "#E8EBE7" }} />

        <div style={{ padding: "12px 20px 0" }}>
          <div className="flex gap-2 overflow-x-auto" style={{ paddingBottom: 10 }}>
            {ids.map((id) => (
              <button key={id} onClick={() => setFocus(id === focus ? null : id)}
                style={{
                  flexShrink: 0, border: `1px solid ${id === focus ? T.accent : T.line}`,
                  background: id === focus ? T.accentSoft : T.card, color: id === focus ? "#8A6D25" : T.ink,
                  borderRadius: 999, padding: "8px 14px", fontFamily: font.ui, fontSize: 12.5, fontWeight: 700,
                }}>
                {distName(id)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 20px 22px", overflowY: "auto" }}>
          {focus ? (
            <Card style={{ padding: 14 }}>
              <div style={{ fontFamily: font.display, fontSize: 17, fontWeight: 600, color: T.ink }}>{distLabel(focus)}</div>
              <P style={{ fontSize: 12.5, marginTop: 4 }}>
                {count ? `${count} places in the guide` : "No places in the guide yet"}
                {areasIn(focus).length > 1 ? ` · ${areasIn(focus).join(", ")}` : ""}
              </P>
              {DIST_MAP_CAVEATS[focus] && (
                <div style={{ background: T.accentSoft, borderRadius: 12, padding: 10, marginTop: 10, display: "flex", gap: 8 }}>
                  <AlertTriangle size={13} color="#8A6D25" style={{ flexShrink: 0, marginTop: 1 }} />
                  <P style={{ fontSize: 11.5, color: "#6E5720" }}>{DIST_MAP_CAVEATS[focus]}</P>
                </div>
              )}
            </Card>
          ) : (
            <P style={{ fontSize: 12.5 }}>Tap a shape or a name to see which district is which, and what sits next to it.</P>
          )}
          <P style={{ fontSize: 11.5, marginTop: 12, color: T.sub }}>
            Districts stopped being official units on 1 Jul 2025, when Vietnam moved to wards.
            Hotels, drivers and locals still use these names, so we do too. Outlines show the
            pre-2025 districts.
          </P>
        </div>
      </div>
    </>
  );
}

function ExploreScreen({ trip, geo, units, openSettings }) {
  const [view, setView] = useState(null); // null | {type:'hood'|'places', ...}
  const [openDist, setOpenDist] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapFocus, setMapFocus] = useState(null);
  const shapes = useDistrictShapes();
  const hasMap = shapes.status === "ready";
  const aroundCount = PLACES.filter((p) => p.d === "X").length;

  if (view && view.type === "places") {
    return <PlacesBrowser onBack={() => setView(null)} initialDist={view.dist || "all"}
      initialCat={view.cat || "all"} heading={view.heading || "All places"} geo={geo} units={units} openSettings={openSettings} />;
  }

  if (view && view.type === "hood") {
    const h = HOODS.find((x) => x.id === view.id);
    const count = PLACES.filter((p) => p.d === h.dist).length;
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => setView(null)} className="flex items-center gap-2"
          style={{ background: "none", border: "none", padding: "4px 0", fontFamily: font.ui, fontSize: 13.5, fontWeight: 700, color: T.jade, alignSelf: "flex-start" }}>
          <ArrowLeft size={16} /> Explore
        </button>
        <div>
          <span style={{ fontFamily: font.ui, fontSize: 12, fontWeight: 700, color: "#8A6D25" }}>{h.price}</span>
          <H size={26} style={{ marginTop: 4 }}>{hoodLabel(h)}</H>
          <div className="flex gap-2 flex-wrap" style={{ marginTop: 10 }}>
            {h.tags.map((t) => <Tag key={t}>{t}</Tag>)}
          </div>
        </div>
        <Card>
          <Eyebrow>The feel</Eyebrow>
          <P style={{ marginTop: 6 }}>{h.feel}</P>
        </Card>
        <Card>
          <Eyebrow>Stay here if</Eyebrow>
          <P style={{ marginTop: 6 }}>{h.who}</P>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5">
            <Utensils size={13} color={T.jade} /><Eyebrow>Eat & drink</Eyebrow>
          </div>
          <P style={{ marginTop: 6 }}>{h.eat}</P>
        </Card>
        <div style={{ background: T.accentSoft, borderRadius: 18, padding: 14, display: "flex", gap: 10 }}>
          <AlertTriangle size={15} color="#8A6D25" style={{ flexShrink: 0, marginTop: 2 }} />
          <P style={{ color: "#6E5720" }}>{h.watch}</P>
        </div>
        {hasMap && (
          <button onClick={() => { setMapFocus(h.dist); setMapOpen(true); }}
            className="flex items-center justify-center gap-2"
            style={{ background: T.card, color: T.jade, border: `1px solid ${T.line}`, borderRadius: 18, padding: "14px 0", fontFamily: font.ui, fontSize: 14, fontWeight: 700 }}>
            <Map size={15} /> Where is {distName(h.dist)}?
          </button>
        )}
        {count > 0 && (
          <button onClick={() => setView({ type: "places", dist: h.dist, heading: hoodLabel(h) })}
            className="flex items-center justify-center gap-2"
            style={{ background: T.ink, color: "#fff", border: "none", borderRadius: 18, padding: "15px 0", fontFamily: font.ui, fontSize: 14.5, fontWeight: 700 }}>
            See {count} places here <ArrowRight size={16} />
          </button>
        )}
        <DistrictMapSheet open={mapOpen} onClose={() => setMapOpen(false)}
          shapes={shapes} focus={mapFocus} setFocus={setMapFocus} />
      </div>
    );
  }

  /* ---- overview: districts first, opened to their neighbourhoods ---- */
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Eyebrow>Explore</Eyebrow>
        <H size={26}>Start with where you'll stay.</H>
        <P style={{ marginTop: 8 }}>Read the districts first — then dive into {PLACES.length} places across the city.</P>
        {hasMap && (
          <button onClick={() => { setMapFocus(null); setMapOpen(true); }} className="flex items-center gap-1.5"
            style={{ marginTop: 12, background: T.jade, border: "none", borderRadius: 999, padding: "9px 16px", fontFamily: font.ui, fontSize: 13, fontWeight: 700, color: "#fff" }}>
            <Map size={14} /> See them on a map
          </button>
        )}
      </div>

      <button onClick={() => setView({ type: "places", heading: "All places" })}
        className="flex items-center justify-between"
        style={{ width: "100%", background: T.card, border: `1px solid ${T.line}`, borderRadius: 18, padding: "14px 16px", textAlign: "left" }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 36, height: 36, borderRadius: 12, background: T.jadeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Compass size={17} color={T.jade} />
          </div>
          <div>
            <div style={{ fontFamily: font.ui, fontSize: 14, fontWeight: 700, color: T.ink }}>Explore freely</div>
            <P style={{ fontSize: 12, marginTop: 2 }}>Skip ahead — search and filter all {PLACES.length} places now.</P>
          </div>
        </div>
        <ChevronRight size={16} color={T.sub} style={{ flexShrink: 0 }} />
      </button>

      <div>
        <Eyebrow>Districts</Eyebrow>
        <div className="flex flex-col gap-2" style={{ marginTop: 8 }}>
          {DISTRICTS.map((d) => {
            const hoods = HOODS.filter((h) => h.dist === d.id);
            const count = PLACES.filter((p) => p.d === d.id).length;
            const open = openDist === d.id;
            /* Price band across the district: "$–$$$" when its areas differ. */
            const bands = [...new Set(hoods.map((h) => h.price))];
            const band = bands.length > 1
              ? bands.sort((a, b) => a.length - b.length)[0] + "–" + bands.sort((a, b) => b.length - a.length)[0]
              : bands[0] || "";
            return (
              <div key={d.id} style={{ background: T.card, borderRadius: 20, border: `1px solid ${T.line}`, overflow: "hidden" }}>
                <button onClick={() => setOpenDist(open ? null : d.id)}
                  className="flex items-center justify-between w-full"
                  style={{ background: "none", border: "none", padding: 16, textAlign: "left" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} color={T.jade} style={{ flexShrink: 0 }} />
                      <span style={{ fontFamily: font.display, fontSize: 16, fontWeight: 600, color: T.ink }}>{d.name}</span>
                    </div>
                    <P style={{ fontSize: 12.5, marginTop: 4 }}>
                      {hoods.filter((h) => h.area).map((h) => h.area).join(" · ") || hoods.map((h) => h.tags[0]).join(" · ")}
                      {count ? ` · ${count} places` : ""}
                    </P>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0" style={{ marginLeft: 10 }}>
                    <span style={{ fontFamily: font.ui, fontSize: 12, fontWeight: 700, color: "#8A6D25" }}>{band}</span>
                    <ChevronDown size={15} color={T.sub}
                      style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
                  </div>
                </button>

                {open && (
                  <div style={{ borderTop: `1px solid ${T.line}`, background: "#FAFBF9" }}>
                    {hoods.map((h) => (
                      <button key={h.id} onClick={() => setView({ type: "hood", id: h.id })}
                        className="flex items-center justify-between w-full"
                        style={{ background: "none", border: "none", borderBottom: `1px solid ${T.line}`, padding: "13px 16px", textAlign: "left" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: font.ui, fontSize: 14, fontWeight: 700, color: T.ink }}>
                            {h.area || d.name}
                          </div>
                          <P style={{ fontSize: 12, marginTop: 3 }}>{h.tags.join(" · ")}</P>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0" style={{ marginLeft: 10 }}>
                          <span style={{ fontFamily: font.ui, fontSize: 11.5, fontWeight: 700, color: "#8A6D25" }}>{h.price}</span>
                          <ChevronRight size={14} color={T.sub} />
                        </div>
                      </button>
                    ))}
                    <div className="flex">
                      {hasMap && (
                        <button onClick={() => { setMapFocus(d.id); setMapOpen(true); }}
                          className="flex items-center justify-center gap-1.5"
                          style={{ flex: 1, background: "none", border: "none", borderRight: `1px solid ${T.line}`, padding: "13px 10px", fontFamily: font.ui, fontSize: 12.5, fontWeight: 700, color: T.jade }}>
                          <Map size={13} /> Where is it?
                        </button>
                      )}
                      {count > 0 && (
                        <button onClick={() => setView({ type: "places", dist: d.id, heading: distLabel(d.id) })}
                          className="flex items-center justify-center gap-1.5"
                          style={{ flex: 1, background: "none", border: "none", padding: "13px 10px", fontFamily: font.ui, fontSize: 12.5, fontWeight: 700, color: T.jade }}>
                          See {count} places <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* The honest bucket: places we hold but can't yet place in a district. */}
        {aroundCount > 0 && (
          <Card onClick={() => setView({ type: "places", dist: "X", heading: "Around town" })}
            style={{ padding: 16, marginTop: 8 }}>
            <div className="flex items-center justify-between">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-2">
                  <Compass size={14} color={T.sub} style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: font.display, fontSize: 16, fontWeight: 600, color: T.ink }}>Around town</span>
                </div>
                <P style={{ fontSize: 12.5, marginTop: 4 }}>{aroundCount} places outside these districts, or not yet mapped to one</P>
              </div>
              <ChevronRight size={15} color={T.sub} style={{ marginLeft: 10, flexShrink: 0 }} />
            </div>
          </Card>
        )}
      </div>

      <div>
        <Eyebrow>Browse the city</Eyebrow>
        <button onClick={() => setView({ type: "places", heading: "All places" })}
          className="flex items-center justify-between"
          style={{ width: "100%", background: T.jade, borderRadius: 22, padding: 18, border: "none", marginTop: 8, textAlign: "left" }}>
          <div>
            <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 600, color: "#fff" }}>All {PLACES.length} places</div>
            <div style={{ fontFamily: font.ui, fontSize: 12.5, color: "#B9CEC4", marginTop: 4 }}>Search and filter by category, district and price</div>
          </div>
          <ChevronRight size={18} color={T.accent} />
        </button>

        <div className="grid grid-cols-2 gap-2" style={{ marginTop: 8 }}>
          {PLACE_CATS.filter((c) => c.id !== "all").map((c) => {
            const n = PLACES.filter((p) => p.c.includes(c.id)).length;
            return (
              <Card key={c.id} onClick={() => setView({ type: "places", cat: c.id, heading: c.label })} style={{ padding: 16 }}>
                <div style={{ width: 38, height: 38, borderRadius: 13, background: T.jadeSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <c.icon size={17} color={T.jade} />
                </div>
                <div style={{ fontFamily: font.ui, fontSize: 14, fontWeight: 700, color: T.ink, marginTop: 10 }}>{c.label}</div>
                <P style={{ fontSize: 12 }}>{n} places</P>
              </Card>
            );
          })}
        </div>
      </div>

      <DistrictMapSheet open={mapOpen} onClose={() => setMapOpen(false)}
        shapes={shapes} focus={mapFocus} setFocus={setMapFocus} />
    </div>
  );
}

/* ---------- pack ---------- */
function PackScreen({ trip }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [region, setRegion] = useState("south"); // Default to South (HCMC region)
  const s = useMemo(() => seasonFor(region, month), [region, month]);
  const Icon = s.icon === "rain" ? CloudRain : s.icon === "wind" ? Wind : Sun;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Eyebrow>Packing</Eyebrow>
        <H size={26}>Pack for the month, not the country.</H>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ margin: "0 -4px", padding: "0 4px" }}>
        {MONTHS.map((m, i) => (
          <button key={m} onClick={() => setMonth(i)} className="flex-shrink-0"
            style={{
              padding: "8px 14px", borderRadius: 999, fontFamily: font.ui, fontSize: 12.5, fontWeight: 700,
              background: month === i ? T.ink : T.card, color: month === i ? "#fff" : T.sub, border: `1px solid ${month === i ? T.ink : T.line}`,
            }}>{m}</button>
        ))}
      </div>



      <div style={{ background: T.jade, borderRadius: 24, padding: 18, color: "#F2F5F0" }}>
        <div className="flex items-center justify-between">
          <div>
            <Eyebrow color="#9DBBAF">{MONTHS[month]} · {REGION_META[region].name}</Eyebrow>
            <div style={{ fontFamily: font.display, fontSize: 22, marginTop: 6 }}>{s.label}</div>
            <P style={{ color: "#B9CEC4", marginTop: 4 }}>{s.temp} · {s.note}</P>
          </div>
          <Icon size={34} color={T.gold} style={{ flexShrink: 0 }} />
        </div>
      </div>

      <Card>
        <Eyebrow>Add for this season</Eyebrow>
        <div className="flex flex-col" style={{ marginTop: 6 }}>
          {s.add.map((item, i) => (
            <div key={item} className="flex items-center gap-3" style={{ padding: "10px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
              <div style={{ width: 7, height: 7, borderRadius: 99, background: T.accent, flexShrink: 0 }} />
              <span style={{ fontFamily: font.ui, fontSize: 14, color: T.ink, fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Eyebrow>Always pack</Eyebrow>
        <div className="flex flex-col" style={{ marginTop: 6 }}>
          {PACK_BASE.map((item, i) => (
            <div key={item} className="flex items-center gap-3" style={{ padding: "10px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
              <div style={{ width: 7, height: 7, borderRadius: 99, background: T.jade, flexShrink: 0 }} />
              <span style={{ fontFamily: font.ui, fontSize: 14, color: T.ink, fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------- settings sheet ---------- */
function SettingsSheet({ open, onClose, geo, units, setUnits, onEditTrip }) {
  const [addressDraft, setAddressDraft] = useState("");
  if (!open) return null;
  const Row = ({ children }) => (
    <div style={{ padding: "16px 0", borderBottom: `1px solid ${T.line}` }}>{children}</div>
  );
  return (
    <>
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(21,32,29,0.45)", zIndex: 40 }} />
      <div style={{
        position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 0, width: "100%", maxWidth: 480,
        background: T.bg, borderRadius: "26px 26px 0 0", padding: "10px 22px 34px", zIndex: 41,
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: T.line, margin: "0 auto 14px" }} />
        <div className="flex items-center justify-between">
          <H size={21}>Settings</H>
          <button onClick={onClose} style={{ background: "none", border: "none", padding: 4, display: "flex" }}>
            <X size={18} color={T.sub} />
          </button>
        </div>

        {/* location base */}
        <Row>
          <div style={{ fontFamily: font.ui, fontSize: 14.5, fontWeight: 700, color: T.ink }}>Sort places by distance</div>
          <P style={{ fontSize: 12.5, marginTop: 3 }}>Choose what "nearby" is measured from.</P>

          <div className="flex gap-2" style={{ marginTop: 10 }}>
            {BASE_TYPES.map((b) => {
              const on = geo.type === b.id;
              return (
                <button key={b.id} onClick={() => geo.chooseType(b.id)}
                  style={{
                    flex: 1, padding: "9px 0", borderRadius: 12, fontFamily: font.ui, fontSize: 12.5, fontWeight: 700,
                    background: on ? T.jade : T.card, color: on ? "#fff" : T.ink,
                    border: `1px solid ${on ? T.jade : T.line}`,
                  }}>
                  {b.label}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 10 }}>
            {geo.type === "live" ? (
              <>
                <P style={{ fontSize: 12.5 }}>
                  {geo.status === "on" && "On — nearest places come first in Explore."}
                  {geo.status === "asking" && "Waiting for permission…"}
                  {geo.status === "denied" && "Blocked by your browser. Allow location for this site in browser settings, then try again."}
                  {geo.status === "unavailable" && "Location isn't available on this device."}
                  {geo.status === "idle" && "Off — places show in their usual order."}
                </P>
                <button onClick={geo.status === "on" ? geo.clear : geo.capture} disabled={geo.status === "asking"}
                  style={{
                    marginTop: 8, borderRadius: 12, padding: "10px 16px", fontFamily: font.ui, fontSize: 13, fontWeight: 700,
                    background: geo.status === "on" ? "none" : T.ink, color: geo.status === "on" ? T.sub : "#fff",
                    border: geo.status === "on" ? `1px solid ${T.line}` : "none", opacity: geo.status === "asking" ? 0.6 : 1,
                  }}>
                  {geo.status === "on" ? "Turn off" : geo.status === "denied" ? "Try again" : "Turn on"}
                </button>
              </>
            ) : (
              <>
                <P style={{ fontSize: 12.5 }}>
                  {geo.fixed[geo.type]
                    ? `Set${geo.fixed[geo.type].label ? ` — “${shortAddress(geo.fixed[geo.type].label)}”` : ""} — nearest places come first in Explore.`
                    : `Not set yet. Stand at your ${geo.type === "home" ? "home" : "hotel"} and save it once, or enter its address below.`}
                </P>
                <div className="flex gap-2" style={{ marginTop: 8 }}>
                  <button onClick={geo.capture} disabled={geo.status === "asking"}
                    style={{ background: T.ink, color: "#fff", border: "none", borderRadius: 12, padding: "10px 16px", fontFamily: font.ui, fontSize: 13, fontWeight: 700, opacity: geo.status === "asking" ? 0.6 : 1 }}>
                    {geo.status === "asking" ? "Locating…" : geo.fixed[geo.type] ? "Update to current location" : "Save current location"}
                  </button>
                  {geo.fixed[geo.type] && (
                    <button onClick={geo.clear}
                      style={{ background: "none", color: T.sub, border: `1px solid ${T.line}`, borderRadius: 12, padding: "10px 16px", fontFamily: font.ui, fontSize: 13, fontWeight: 700 }}>
                      Clear
                    </button>
                  )}
                </div>
                {geo.status === "denied" && <P style={{ fontSize: 12, marginTop: 6, color: "#B23A3A" }}>Blocked by your browser. Allow location for this site, then try again.</P>}
                {geo.status === "unavailable" && <P style={{ fontSize: 12, marginTop: 6, color: "#B23A3A" }}>Location isn't available on this device.</P>}

                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.line}` }}>
                  <div style={{ fontFamily: font.ui, fontSize: 12.5, fontWeight: 700, color: T.sub }}>Or enter an address</div>
                  <div className="flex gap-2" style={{ marginTop: 6 }}>
                    <input
                      value={addressDraft}
                      onChange={(e) => setAddressDraft(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        if (await geo.saveAddress(addressDraft)) setAddressDraft("");
                      }}
                      placeholder={`e.g. 42 Nguyễn Huệ, District 1`}
                      style={{
                        flex: 1, minWidth: 0, background: T.card, border: `1px solid ${T.line}`, borderRadius: 12,
                        padding: "10px 12px", fontFamily: font.ui, fontSize: 13.5, color: T.ink, outline: "none",
                      }}
                    />
                    <button
                      onClick={async () => { if (await geo.saveAddress(addressDraft)) setAddressDraft(""); }}
                      disabled={geo.geocoding || !addressDraft.trim()}
                      style={{
                        flexShrink: 0, background: T.ink, color: "#fff", border: "none", borderRadius: 12,
                        padding: "10px 14px", fontFamily: font.ui, fontSize: 13, fontWeight: 700,
                        opacity: geo.geocoding || !addressDraft.trim() ? 0.5 : 1,
                      }}>
                      {geo.geocoding ? "Searching…" : "Save"}
                    </button>
                  </div>
                  {geo.geocodeError && <P style={{ fontSize: 12, marginTop: 6, color: "#B23A3A" }}>{geo.geocodeError}</P>}
                  <P style={{ fontSize: 11, marginTop: 6 }}>Address search by OpenStreetMap.</P>
                </div>
              </>
            )}
          </div>
        </Row>

        {/* units */}
        <Row>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div style={{ fontFamily: font.ui, fontSize: 14.5, fontWeight: 700, color: T.ink }}>Distances</div>
              <P style={{ fontSize: 12.5, marginTop: 3 }}>How far away places are shown.</P>
            </div>
            <div className="flex" style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 999, padding: 3 }}>
              {["km", "mi"].map((u) => (
                <button key={u} onClick={() => setUnits(u)}
                  style={{
                    border: "none", borderRadius: 999, padding: "6px 16px",
                    background: units === u ? T.ink : "transparent", color: units === u ? "#fff" : T.sub,
                    fontFamily: font.ui, fontSize: 12.5, fontWeight: 700,
                  }}>
                  {u}
                </button>
              ))}
            </div>
          </div>
        </Row>

        {/* edit trip */}
        <button onClick={onEditTrip} className="flex items-center justify-between"
          style={{ width: "100%", background: "none", border: "none", padding: "16px 0", textAlign: "left" }}>
          <div>
            <div style={{ fontFamily: font.ui, fontSize: 14.5, fontWeight: 700, color: T.ink }}>Edit my trip</div>
            <P style={{ fontSize: 12.5, marginTop: 3 }}>Change destination or start over.</P>
          </div>
          <ChevronRight size={16} color={T.sub} />
        </button>
      </div>
    </>
  );
}

/* ---------- shell ---------- */
export default function TravelPal() {
  const [trip, setTrip] = useState(null);
  const [tab, setTab] = useState("home");
  const [steps, setSteps] = useState({ scan: true, photo: true });
  const [docs, setDocs] = useState({ passport: true });
  const [flight, setFlight] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const geo = useBaseLocation();
  const [units, setUnits] = useState("km");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toast = (msg) => {
    setToastMsg(msg);
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(() => setToastMsg(""), 2200);
  };

  const toggleStep = (id) => setSteps((s) => ({ ...s, [id]: !s[id] }));
  const addDoc = (id) => setDocs((d) => ({ ...d, [id]: true }));
  const visaDone = Object.values(steps).filter(Boolean).length;

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "visa", label: "Visa", icon: Stamp },
    { id: "arrive", label: "Arrive", icon: Plane },
    { id: "explore", label: "Explore", icon: MapPin },
    { id: "pack", label: "Pack", icon: Backpack },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: T.bg, fontFamily: font.ui, display: "flex", justifyContent: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Instrument+Sans:wght@400;500;600;700&display=swap');
        html, body { margin: 0; background: ${T.bg}; }
        *::-webkit-scrollbar { display: none; }
        input::placeholder { color: #9AA6A1; }
        button { cursor: pointer; }
      `}</style>

      <div style={{
        width: "100%", maxWidth: 480, minHeight: "100dvh", background: T.bg,
        position: "relative", display: "flex", flexDirection: "column",
      }}>
        {!trip ? (
          <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
            <Onboarding onDone={(t) => { setTrip(t); setTab(t.mode === "guide" ? "explore" : "home"); }} />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between" style={{ padding: "16px 22px 8px", fontFamily: font.ui, fontSize: 13, fontWeight: 600, color: T.ink, position: "sticky", top: 0, background: T.bg, zIndex: 20 }}>
              <Brand />
              <button onClick={() => setSettingsOpen(true)} title="Settings"
                style={{ background: "none", border: "none", padding: 0, display: "flex" }}>
                <Settings2 size={16} color={T.sub} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "10px 20px 110px" }}>
              {tab === "home" && <HomeScreen trip={trip} go={setTab} visaDone={visaDone} flight={flight} setFlight={setFlight} toast={toast} />}
              {tab === "visa" && <VisaScreen trip={trip} steps={steps} toggleStep={toggleStep} docs={docs} addDoc={addDoc} toast={toast} />}
              {tab === "arrive" && <ArriveScreen />}
              {tab === "explore" && <ExploreScreen trip={trip} geo={geo} units={units} openSettings={() => setSettingsOpen(true)} />}
              {tab === "pack" && <PackScreen trip={trip} />}
            </div>

            <Toast msg={toastMsg} />

            <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)}
              geo={geo} units={units} setUnits={setUnits}
              onEditTrip={() => { setSettingsOpen(false); setTrip(null); }} />

            <div style={{
              position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: "100%", maxWidth: 480, height: 78,
              background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
              borderTop: `1px solid ${T.line}`, display: "flex", alignItems: "flex-start", paddingTop: 10,
              zIndex: 30,
            }}>
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 flex flex-col items-center gap-1"
                  style={{ background: "none", border: "none" }}>
                  <t.icon size={20} color={tab === t.id ? T.jade : "#A7B2AD"} strokeWidth={tab === t.id ? 2.4 : 1.8} />
                  <span style={{ fontFamily: font.ui, fontSize: 10.5, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? T.jade : "#A7B2AD" }}>{t.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
