// @ts-nocheck
import React, { useState, useMemo } from "react";
import {
  Plane, Stamp, Wifi, Wallet, MapPin, Backpack, Home, ChevronRight, ChevronDown,
  ShieldCheck, ExternalLink, FileText, CheckCircle2, Circle, Bell,
  Zap, CreditCard, Banknote, Smartphone, CloudRain, Sun, Wind,
  AlertTriangle, Upload, Check, Compass, Utensils, Calendar, Clock,
  Settings2, ArrowRight, Radio, Eye, Car, Bike, TrainFront, Bus, Footprints
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

const HOODS = [
  {
    name: "District 1 — Đồng Khởi side",
    price: "$$$",
    tags: ["First trip", "Walkable", "Landmarks"],
    feel: "The polished heart of Saigon: French-era boulevards, the Opera House, Nguyễn Huệ walking street. You can do your first three days here entirely on foot.",
    who: "First-timers, short stays, anyone who wants landmarks outside the hotel door.",
    eat: "Bánh mì Huỳnh Hoa for the city's most famous sandwich; the Café Apartment at 42 Nguyễn Huệ — nine floors of cafés in an old block.",
    watch: "Keep your phone off the kerb side of the pavement — drive-by snatching is D1's one real annoyance.",
  },
  {
    name: "District 1 — Bùi Viện",
    price: "$",
    tags: ["Nightlife", "Hostels", "Loud"],
    feel: "The backpacker artery. Neon, beer crates on the pavement, music until 4am. Chaotic in the fun way, then just chaotic.",
    who: "Night owls, solo travellers wanting instant company, tight budgets.",
    eat: "Street seafood carts after 9pm; walk two blocks off the strip and prices halve.",
    watch: "Genuinely hard to sleep before 2am on the strip itself. Book one street back minimum.",
  },
  {
    name: "District 3",
    price: "$$",
    tags: ["Local", "Cafés", "Colonial villas"],
    feel: "Ten minutes from D1, half the noise. Tree-lined streets, old villas turned into cafés, office workers queuing for bún at lunch. This is everyday Saigon.",
    who: "Second visits, remote workers, café people, anyone allergic to tourist menus.",
    eat: "Turtle Lake (Hồ Con Rùa) street-snack scene at night; hidden villa cafés around Tú Xương street.",
    watch: "Fewer hotels — look at serviced apartments and boutique stays instead.",
  },
  {
    name: "Thảo Điền (District 2)",
    price: "$$$",
    tags: ["Expat", "Leafy", "Brunch"],
    feel: "Riverside and green, with international schools, wine bars and smoothie bowls. Feels like a different city — some love the calm, some feel they've left Vietnam.",
    who: "Families, longer stays, anyone who wants quiet mornings and western comforts.",
    eat: "Brunch spots along Xuân Thủy; The Deck for sunset drinks on the river.",
    watch: "Floods at high tide after heavy rain, and you'll Grab everywhere — it's 20–30 min to D1.",
  },
  {
    name: "District 4",
    price: "$",
    tags: ["Street food", "Cheap", "Untouristed"],
    feel: "One bridge from D1 and barely a tourist in sight. Dense alleys, plastic stools, and Saigon's best snail-and-seafood street.",
    who: "Eaters. Sleep in D1 or D3, spend your evenings here.",
    eat: "Vĩnh Khánh street — the famous ốc (snail) alley. Point at tanks, order rounds, repeat.",
    watch: "Very few hotels worth booking; treat it as a food destination, not a base.",
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
      position: "absolute", bottom: 96, left: "50%", transform: "translateX(-50%)",
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
  const [country, setCountry] = useState("vietnam");
  const [city, setCity] = useState("saigon");

  const steps = [
    {
      eyebrow: "Welcome",
      title: "Travel Pal",
      subtitle: "Everything you need for your Vietnam trip — in one place.",
      body: (
        <div className="flex flex-col gap-4">
          <div style={{
            background: T.jade, borderRadius: 24, padding: 20, color: "#F2F5F0", textAlign: "center",
          }}>
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

  const s = steps[step];
  return (
    <div style={{ height: "100%", background: T.sand, display: "flex", flexDirection: "column", padding: "26px 22px 22px", overflowY: "auto" }}>
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: font.display, fontStyle: "italic", fontSize: 15, color: T.jade }}>travelpal ▲ việt nam</span>
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
          onClick={() => {
            if (!s.valid) return;
            if (step < 2) setStep(step + 1);
            else onDone({ country, city });
          }}
          className="flex-1 flex items-center justify-center gap-2"
          style={{
            padding: "15px 0", borderRadius: 18, fontFamily: font.ui, fontSize: 15, fontWeight: 700,
            background: s.valid ? T.accent : "#E5C9BC", color: "#fff", border: "none",
          }}>
          {step < 2 ? "Continue" : "Let's go"} <ArrowRight size={16} />
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
              style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 14, padding: "11px 0", fontFamily: font.ui, fontSize: 13, fontWeight: 700 }}>
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
              style={{ background: T.jade, color: "#fff", border: "none", borderRadius: 14, padding: "0 18px", fontFamily: font.ui, fontSize: 13, fontWeight: 700 }}>
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
          style={{ marginTop: 12, background: "#F2F5F0", color: T.jade, border: "none", borderRadius: 999, padding: "10px 16px", fontFamily: font.ui, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
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

/* ---------- explore ---------- */
function ExploreScreen({ trip }) {
  const [openHood, setOpenHood] = useState(null);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Eyebrow>Explore</Eyebrow>
        <H size={26}>Where you stay shapes the trip.</H>
      </div>

      <P>Ho Chi Minh City has neighbourhoods for every traveller — find the right one.</P>

      {HOODS.map((h) => {
        const open = openHood === h.name;
        return (
          <Card key={h.name} onClick={() => setOpenHood(open ? null : h.name)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={15} color={T.accent} />
                <span style={{ fontFamily: font.display, fontSize: 16.5, fontWeight: 600, color: T.ink }}>{h.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span style={{ fontFamily: font.ui, fontSize: 12, fontWeight: 700, color: T.gold }}>{h.price}</span>
                <ChevronDown size={15} color={T.sub} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap" style={{ margin: "8px 0 0" }}>
              {h.tags.map((t) => <Tag key={t}>{t}</Tag>)}
            </div>
            {open && (
              <div style={{ marginTop: 12, borderTop: `1px solid ${T.line}`, paddingTop: 12 }} className="flex flex-col gap-3">
                <div>
                  <Eyebrow>The feel</Eyebrow>
                  <P style={{ marginTop: 3 }}>{h.feel}</P>
                </div>
                <div>
                  <Eyebrow>Stay here if</Eyebrow>
                  <P style={{ marginTop: 3 }}>{h.who}</P>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Utensils size={12} color={T.jade} /><Eyebrow>Eat & drink</Eyebrow>
                  </div>
                  <P style={{ marginTop: 3 }}>{h.eat}</P>
                </div>
                <div style={{ background: T.accentSoft, borderRadius: 12, padding: 10 }}>
                  <P style={{ color: "#8A3A22", fontSize: 12.5 }}>{h.watch}</P>
                </div>
              </div>
            )}
          </Card>
        );
      })}


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

/* ---------- shell ---------- */
export default function TravelPal() {
  const [trip, setTrip] = useState(null);
  const [tab, setTab] = useState("home");
  const [steps, setSteps] = useState({ scan: true, photo: true });
  const [docs, setDocs] = useState({ passport: true });
  const [flight, setFlight] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

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
    <div style={{ minHeight: "100vh", background: "#DDE1DA", display: "flex", justifyContent: "center", alignItems: "center", padding: 16, fontFamily: font.ui }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Instrument+Sans:wght@400;500;600;700&display=swap');
        *::-webkit-scrollbar { display: none; }
        input::placeholder { color: #9AA6A1; }
        button { cursor: pointer; }
      `}</style>

      <div style={{
        width: 390, height: 812, background: T.bg, borderRadius: 44, overflow: "hidden",
        position: "relative", boxShadow: "0 30px 80px rgba(13,59,52,0.25)", border: "1px solid rgba(0,0,0,0.06)",
      }}>
        {!trip ? (
          <Onboarding onDone={(t) => { setTrip(t); setTab("home"); }} />
        ) : (
          <>
            <div className="flex items-center justify-between" style={{ padding: "16px 26px 8px", fontFamily: font.ui, fontSize: 13, fontWeight: 600, color: T.ink }}>
              <span>9:41</span>
              <span style={{ fontFamily: font.display, fontStyle: "italic", fontSize: 14, color: T.jade }}>travelpal ▲ việt nam</span>
              <button onClick={() => setTrip(null)} title="Edit trip"
                style={{ background: "none", border: "none", padding: 0, display: "flex" }}>
                <Settings2 size={16} color={T.sub} />
              </button>
            </div>

            <div style={{ height: "calc(100% - 118px)", overflowY: "auto", padding: "10px 20px 24px" }}>
              {tab === "home" && <HomeScreen trip={trip} go={setTab} visaDone={visaDone} flight={flight} setFlight={setFlight} toast={toast} />}
              {tab === "visa" && <VisaScreen trip={trip} steps={steps} toggleStep={toggleStep} docs={docs} addDoc={addDoc} toast={toast} />}
              {tab === "arrive" && <ArriveScreen />}
              {tab === "explore" && <ExploreScreen trip={trip} />}
              {tab === "pack" && <PackScreen trip={trip} />}
            </div>

            <Toast msg={toastMsg} />

            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 78,
              background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
              borderTop: `1px solid ${T.line}`, display: "flex", alignItems: "flex-start", paddingTop: 10,
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
