import { useState, useRef, useEffect, useCallback } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:       "#080810",
  surface:  "#12121F",
  card:     "#1A1A2C",
  border:   "#252538",
  gold:     "#C8A96E",
  goldDim:  "#C8A96E44",
  purple:   "#6C5CE7",
  cream:    "#F0EDE8",
  muted:    "#9090A8",
  dim:      "#44445A",
};

// ── Services ──────────────────────────────────────────────────────────────────
const SERVICES = [
  { id:"netflix", name:"Netflix",     short:"N",  color:"#E50914", url:"https://www.netflix.com" },
  { id:"prime",   name:"Prime Video", short:"P",  color:"#00A8E1", url:"https://www.amazon.co.jp/Prime-Video" },
  { id:"disney",  name:"Disney+",     short:"D+", color:"#1A3EBF", url:"https://www.disneyplus.com/ja-jp" },
  { id:"unext",   name:"U-NEXT",      short:"U",  color:"#FF6B35", url:"https://video.unext.jp" },
  { id:"hulu",    name:"Hulu",        short:"H",  color:"#1CE783", url:"https://www.hulu.jp" },
  { id:"abema",   name:"ABEMA",       short:"A",  color:"#00BFFF", url:"https://abema.tv" },
];

const TITLES = [
  { id:1,  title:"オッペンハイマー",        type:"映画",  service:"prime",   year:2023, genre:"ドラマ",    duration:"180分",   thumb:"🎬", yt:"uYPbbksJxIg", desc:"原爆の父が向き合った光と影。クリストファー・ノーラン渾身の問題作。" },
  { id:2,  title:"The Last of Us",          type:"ドラマ", service:"unext",   year:2023, genre:"アクション", duration:"S1 9話", thumb:"🎭", yt:"uLtkt6qdGbU", desc:"終末後の世界を旅するジョエルとエリー。ゲーム原作の傑作ドラマ化。" },
  { id:3,  title:"ストレンジャー・シングス", type:"ドラマ", service:"netflix", year:2022, genre:"SF",       duration:"S4 9話", thumb:"🔮", yt:"sBEvEcpnG7k", desc:"ホーキンスの少年たちと逆さの世界の戦い。シーズン4は過去最高傑作。" },
  { id:4,  title:"君たちはどう生きるか",     type:"映画",  service:"prime",   year:2023, genre:"アニメ",    duration:"124分",   thumb:"🦋", yt:"f7EDFdA10pg", desc:"宮崎駿の集大成。少年マヒトが迷い込む、生と死の狭間の世界。" },
  { id:5,  title:"SHOGUN 将軍",             type:"ドラマ", service:"disney",  year:2024, genre:"時代劇",   duration:"S1 10話", thumb:"⚔️", yt:"o1gwnWs7sSc", desc:"戦国時代の日本に流れ着いたイギリス人航海士の壮大な物語。" },
  { id:6,  title:"哀れなるものたち",         type:"映画",  service:"hulu",    year:2023, genre:"ドラマ",    duration:"141分",   thumb:"🌸", yt:"W4IVkGMSUkk", desc:"死から蘇った女性ベラの奇想天外な自己探求の旅。ヴェネチア金獅子賞受賞。" },
  { id:7,  title:"ボーはおそれている",       type:"映画",  service:"unext",   year:2023, genre:"ホラー",    duration:"179分",   thumb:"😰", yt:"RNiDLGM9gAQ", desc:"アリ・アスター最新作。母の死の知らせから始まる悪夢の帰省。" },
  { id:8,  title:"全裸監督",                type:"ドラマ", service:"netflix", year:2023, genre:"コメディ",  duration:"S2 7話", thumb:"🎥", yt:"N01X3_2MBdw", desc:"AV業界に革命を起こした村西とおるの破天荒な実話。" },
  { id:9,  title:"CODA コーダ",            type:"映画",  service:"abema",   year:2021, genre:"ドラマ",    duration:"111分",   thumb:"🎵", yt:"O1N7T4S-bPU", desc:"ろう者の家族の中で一人だけ聴こえる少女の夢と葛藤。サンダンス映画祭席巻作。" },
  { id:10, title:"インセプション",           type:"映画",  service:"netflix", year:2010, genre:"SF",       duration:"148分",   thumb:"🌀", yt:"YoHD9XEInc0", desc:"夢の中の夢を潜る泥棒たち。ノーランが仕掛けた壮大な知的迷宮。" },
  { id:11, title:"ミッドサマー",            type:"映画",  service:"prime",   year:2019, genre:"ホラー",    duration:"148分",   thumb:"🌻", yt:"1Vnghdsjmd0", desc:"スウェーデンの白夜の祭りに迷い込んだカップルの悪夢。明るい画面のホラー。" },
  { id:12, title:"パラサイト",              type:"映画",  service:"netflix", year:2019, genre:"スリラー",   duration:"132分",   thumb:"🏠", yt:"5xH0HfJHsaY", desc:"貧富の格差を描いたポン・ジュノの傑作。アカデミー賞4冠達成。" },
];

const PLAYLISTS_INIT = [
  { id:1, name:"アカデミーの夜",  desc:"受賞・ノミネート作を一気見",  items:[1,6,12,4], shared:true,  color:"#C8A96E", mood:"✨" },
  { id:2, name:"深夜のホラー祭",  desc:"眠れなくなる系を厳選",        items:[7,11],     shared:false, color:"#6C5CE7", mood:"🌑" },
  { id:3, name:"週末ドラマ一気見", desc:"シーズン通しで見たい名作たち", items:[2,3,5,8],  shared:true,  color:"#00A8E1", mood:"🎭" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const svc  = id => SERVICES.find(s => s.id === id);
const titl = id => TITLES.find(t => t.id === id);

// Film perforation dots — the signature element
function Perforations({ color = T.gold, vertical = false }) {
  const count = vertical ? 8 : 5;
  return (
    <div style={{ display:"flex", flexDirection: vertical?"column":"row", gap: vertical?6:8, alignItems:"center", justifyContent:"center" }}>
      {Array.from({length: count}).map((_,i) => (
        <div key={i} style={{ width: vertical?6:5, height: vertical?5:6, borderRadius:1, background: color, opacity:0.35 }} />
      ))}
    </div>
  );
}

// Cinematic label
function Label({ children, color = T.gold }) {
  return (
    <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color, marginBottom:10 }}>
      {children}
    </div>
  );
}

// Service badge
function ServiceBadge({ serviceId, size = "sm" }) {
  const s = svc(serviceId);
  if (!s) return null;
  const pad = size === "sm" ? "3px 7px" : "5px 12px";
  return (
    <span style={{ fontSize: size==="sm"?10:12, fontWeight:800, color:s.color, background:`${s.color}18`, borderRadius:5, padding:pad, letterSpacing:"0.05em" }}>
      {s.short}
    </span>
  );
}

// ── Mini Player ───────────────────────────────────────────────────────────────
function MiniPlayer({ mini, onExpand, onClose, onNext, onOpenService }) {
  const [tick, setTick] = useState(0);
  const current = mini.titles[mini.currentIdx];
  const next    = mini.titles[mini.currentIdx + 1];
  const s       = svc(current?.service);
  const isWatching = mini.mode === "watching";
  const isLast  = mini.currentIdx >= mini.titles.length - 1;
  const progress = (mini.currentIdx / Math.max(mini.titles.length - 1, 1)) * 100;

  useEffect(() => { setTick(t => t + 1); }, [mini.currentIdx, mini.mode]);

  return (
    <div style={{ position:"fixed", bottom:64, left:"50%", transform:"translateX(-50%)", width:"calc(100% - 20px)", maxWidth:460, zIndex:90 }}>
      {/* Next-up whisper */}
      {next && !isLast && (
        <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", marginBottom:5, opacity:0.65 }}>
          <div style={{ fontSize:10, color:T.muted }}>次は</div>
          <div style={{ fontSize:10, color:T.cream }}>{next.thumb} {next.title}</div>
          <button onClick={onNext} style={{ background:`${mini.playlistColor}22`, border:`1px solid ${mini.playlistColor}55`, borderRadius:20, padding:"2px 9px", color:mini.playlistColor, fontSize:9, fontWeight:700, cursor:"pointer", letterSpacing:"0.05em" }}>SKIP →</button>
        </div>
      )}

      {/* Bar */}
      <div style={{
        background:"rgba(10,10,20,0.88)",
        backdropFilter:"blur(28px)",
        WebkitBackdropFilter:"blur(28px)",
        borderRadius:16,
        border:`1px solid ${mini.playlistColor}40`,
        boxShadow:`0 8px 40px ${mini.playlistColor}18, inset 0 1px 0 ${mini.playlistColor}20`,
        overflow:"hidden",
      }}>
        {/* Progress strip */}
        <div style={{ height:2, background:T.border }}>
          <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg,${mini.playlistColor},${mini.playlistColor}88)`, transition:"width 0.6s ease" }} />
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px" }}>
          {/* Thumb */}
          <div onClick={onExpand} style={{ position:"relative", cursor:"pointer", flexShrink:0 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:`${mini.playlistColor}18`, border:`1.5px solid ${mini.playlistColor}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
              {current?.thumb}
            </div>
            {isWatching && <div style={{ position:"absolute", bottom:-2, right:-2, width:9, height:9, borderRadius:"50%", background:s?.color, border:`2px solid #0a0a14`, boxShadow:`0 0 6px ${s?.color}` }} />}
          </div>

          {/* Info */}
          <div onClick={onExpand} style={{ flex:1, minWidth:0, cursor:"pointer" }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.cream, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", letterSpacing:"-0.01em" }}>
              {current?.title}
            </div>
            <div style={{ fontSize:10, color: isWatching ? s?.color : T.muted, marginTop:2, display:"flex", alignItems:"center", gap:5 }}>
              {isWatching && <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:s?.color, boxShadow:`0 0 4px ${s?.color}`, animation:"dot 2s infinite" }} />}
              {isWatching ? `${s?.name} で視聴中` : `${mini.playlistName} · ${mini.currentIdx+1}/${mini.titles.length}`}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>
            <button onClick={onOpenService} style={{ background: isWatching ? s?.color : mini.playlistColor, border:"none", borderRadius:8, padding:"7px 11px", color:"#fff", fontSize:11, fontWeight:800, cursor:"pointer", letterSpacing:"0.02em" }}>
              {isWatching ? "開く" : "▶"}
            </button>
            {!isLast && (
              <button onClick={onNext} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, width:30, height:30, color:T.muted, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>⏭</button>
            )}
            <button onClick={onClose} style={{ background:"none", border:"none", color:T.dim, fontSize:14, cursor:"pointer", padding:4 }}>✕</button>
          </div>
        </div>
      </div>
      <style>{`@keyframes dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}`}</style>
    </div>
  );
}

// ── Playlist Card ─────────────────────────────────────────────────────────────
function PlaylistCard({ pl, onClick, onPlay, compact = false }) {
  const items = pl.items.map(titl).filter(Boolean);
  if (compact) return (
    <div onClick={onClick} style={{ minWidth:155, background:T.card, borderRadius:14, overflow:"hidden", cursor:"pointer", border:`1px solid ${T.border}`, flexShrink:0, position:"relative" }}>
      {/* Film strip top */}
      <div style={{ background:T.surface, padding:"5px 10px 4px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Perforations color={pl.color} />
        <div style={{ fontSize:11 }}>{pl.mood}</div>
        <Perforations color={pl.color} />
      </div>
      {/* Cover */}
      <div style={{ height:72, background:`linear-gradient(135deg,${pl.color}25,${pl.color}08)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, position:"relative" }}>
        {items[0]?.thumb || "🎬"}
        <button onClick={e=>{e.stopPropagation();onPlay();}} style={{ position:"absolute", bottom:6, right:6, width:26, height:26, borderRadius:"50%", background:pl.color, border:"none", color:"#000", fontSize:10, fontWeight:900, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>▶</button>
      </div>
      {/* Info */}
      <div style={{ padding:"10px 12px 12px" }}>
        <div style={{ fontSize:12, fontWeight:700, color:T.cream, letterSpacing:"-0.01em", marginBottom:3, lineHeight:1.3 }}>{pl.name}</div>
        <div style={{ fontSize:10, color:T.muted }}>{items.length} 作品</div>
        {pl.shared && <div style={{ marginTop:5, fontSize:8, color:pl.color, letterSpacing:"0.12em", textTransform:"uppercase" }}>● 共有中</div>}
      </div>
      {/* Film strip bottom */}
      <div style={{ background:T.surface, padding:"4px 10px 5px", display:"flex", justifyContent:"space-between" }}>
        <Perforations color={pl.color} />
        <Perforations color={pl.color} />
      </div>
    </div>
  );

  // Full card
  return (
    <div onClick={onClick} style={{ background:T.card, borderRadius:16, overflow:"hidden", cursor:"pointer", border:`1px solid ${T.border}`, marginBottom:12 }}>
      <div style={{ display:"flex", gap:0 }}>
        {/* Left film strip */}
        <div style={{ width:18, background:T.surface, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-evenly", padding:"8px 0" }}>
          <Perforations color={pl.color} vertical />
        </div>
        {/* Content */}
        <div style={{ flex:1, padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
            <div style={{ width:60, height:60, borderRadius:10, background:`linear-gradient(135deg,${pl.color}30,${pl.color}10)`, border:`1.5px solid ${pl.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>
              {items[0]?.thumb||"🎬"}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                <div style={{ fontSize:15, fontWeight:800, color:T.cream, letterSpacing:"-0.02em", lineHeight:1.2 }}>{pl.name}</div>
                <div style={{ fontSize:14 }}>{pl.mood}</div>
              </div>
              <div style={{ fontSize:11, color:T.muted, marginBottom:8, lineHeight:1.4 }}>{pl.desc}</div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, color:pl.color, fontWeight:700 }}>{items.length} 作品</span>
                {pl.shared && <span style={{ fontSize:9, color:pl.color, letterSpacing:"0.1em", textTransform:"uppercase", background:`${pl.color}18`, borderRadius:4, padding:"2px 7px" }}>共有中</span>}
                <div style={{ display:"flex", gap:3 }}>
                  {items.slice(0,4).map(it=>(<span key={it.id} style={{ fontSize:13 }}>{it.thumb}</span>))}
                  {items.length>4 && <span style={{ fontSize:10, color:T.dim }}>+{items.length-4}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right film strip */}
        <div style={{ width:18, background:T.surface, borderLeft:`1px solid ${T.border}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-evenly", padding:"8px 0" }}>
          <Perforations color={pl.color} vertical />
        </div>
      </div>
    </div>
  );
}

// ── Trailer Player ────────────────────────────────────────────────────────────
function TrailerPlayer({ titles, startIndex=0, playlistName, playlistColor, onClose, onMarkWatched, onEnterWatching }) {
  const [idx,       setIdx]       = useState(startIndex);
  const [mode,      setMode]      = useState("trailer");
  const [watched,   setWatched]   = useState({});
  const [countdown, setCountdown] = useState(null);
  const [elapsed,   setElapsed]   = useState(0);
  const cdRef = useRef(null);
  const elRef = useRef(null);

  const cur    = titles[idx];
  const s      = svc(cur?.service);
  const isLast = idx >= titles.length - 1;
  const done   = Object.keys(watched).length;

  const startCD = useCallback(() => {
    if (idx >= titles.length - 1) return;
    setCountdown(8);
  }, [idx, titles.length]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { goNext(); return; }
    cdRef.current = setTimeout(() => setCountdown(c => c-1), 1000);
    return () => clearTimeout(cdRef.current);
  }, [countdown]);

  useEffect(() => {
    if (mode !== "watching") { clearInterval(elRef.current); return; }
    setElapsed(0);
    elRef.current = setInterval(() => setElapsed(e => e+1), 1000);
    return () => clearInterval(elRef.current);
  }, [mode, idx]);

  const cancelCD = () => { clearTimeout(cdRef.current); setCountdown(null); };
  const goNext = () => { cancelCD(); setMode("trailer"); setIdx(i => Math.min(i+1, titles.length-1)); };
  const goPrev = () => { cancelCD(); setMode("trailer"); setIdx(i => Math.max(i-1, 0)); };

  const goWatch = () => {
    cancelCD(); setMode("watching");
    if (onEnterWatching) onEnterWatching(idx);
    window.open(s?.url, "_blank");
  };

  const markDone = () => {
    clearInterval(elRef.current);
    setWatched(p => ({...p, [cur.id]:true}));
    if (onMarkWatched) onMarkWatched(cur.id, Math.min(idx+1, titles.length-1));
    setMode("checkin");
  };

  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const ytSrc = cur?.yt ? `https://www.youtube.com/embed/${cur.yt}?autoplay=1&mute=1&rel=0&modestbranding=1` : null;

  const base = { position:"fixed", inset:0, zIndex:200, background:T.bg, display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto", fontFamily:"'Helvetica Neue','Hiragino Kaku Gothic ProN',sans-serif" };

  // DONE
  if (mode === "done") return (
    <div style={base}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32 }}>
        <div style={{ fontSize:10, letterSpacing:"0.2em", color:T.gold, marginBottom:20, textTransform:"uppercase" }}>Playlist Complete</div>
        <div style={{ fontSize:52, marginBottom:16 }}>🎉</div>
        <div style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", color:T.cream, textAlign:"center", marginBottom:6 }}>完走おめでとう</div>
        <div style={{ fontSize:13, color:T.muted, marginBottom:36, textAlign:"center", lineHeight:1.6 }}>{playlistName}<br/>{titles.length}作品すべて制覇</div>
        <div style={{ width:"100%", background:T.card, borderRadius:14, padding:16, marginBottom:24, border:`1px solid ${T.border}` }}>
          {titles.map((t,i)=>(
            <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:i<titles.length-1?`1px solid ${T.border}`:"none" }}>
              <div style={{ fontSize:14 }}>{watched[t.id]?"✅":"⬜"}</div>
              <div style={{ fontSize:13, color:watched[t.id]?T.cream:T.dim }}>{t.title}</div>
              {watched[t.id] && <ServiceBadge serviceId={t.service} />}
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ width:"100%", padding:15, background:playlistColor, border:"none", borderRadius:13, color:"#000", fontSize:14, fontWeight:800, cursor:"pointer", letterSpacing:"0.03em" }}>ホームへ戻る</button>
      </div>
    </div>
  );

  // CHECK-IN
  if (mode === "checkin") return (
    <div style={base}>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:130, opacity:0.04, userSelect:"none" }}>{cur?.thumb}</div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, position:"relative", zIndex:1 }}>
        <div style={{ fontSize:9, color:playlistColor, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:20 }}>Watched</div>
        <div style={{ fontSize:52, marginBottom:14 }}>✅</div>
        <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em", color:T.cream, textAlign:"center", marginBottom:4 }}>{cur?.title}</div>
        <div style={{ fontSize:12, color:T.muted, marginBottom:36 }}>お疲れさまでした</div>
        {/* Progress */}
        <div style={{ width:"100%", marginBottom:32 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <Label color={T.muted}>進捗</Label>
            <div style={{ fontSize:11, color:playlistColor, fontWeight:700 }}>{done} / {titles.length}</div>
          </div>
          <div style={{ height:3, background:T.border, borderRadius:2, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${(done/titles.length)*100}%`, background:playlistColor, borderRadius:2, transition:"width 0.7s ease" }} />
          </div>
          <div style={{ display:"flex", gap:5, marginTop:10, flexWrap:"wrap" }}>
            {titles.map((t,i)=>(
              <div key={t.id} style={{ width:30, height:30, borderRadius:7, background:watched[t.id]?`${playlistColor}25`:T.card, border:`1px solid ${watched[t.id]?playlistColor:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:watched[t.id]?13:10, color:watched[t.id]?playlistColor:T.dim, fontWeight:700 }}>
                {watched[t.id]?"✓":i+1}
              </div>
            ))}
          </div>
        </div>
        {!isLast ? (
          <>
            <div style={{ width:"100%", background:T.card, borderRadius:14, padding:16, marginBottom:14, border:`1px solid ${playlistColor}40` }}>
              <Label color={T.muted}>次の作品</Label>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:34 }}>{titles[idx+1]?.thumb}</div>
                <div>
                  <div style={{ fontSize:16, fontWeight:800, color:T.cream, letterSpacing:"-0.02em" }}>{titles[idx+1]?.title}</div>
                  <div style={{ fontSize:11, color:T.muted, marginTop:3 }}>{titles[idx+1]?.type} · {titles[idx+1]?.duration}</div>
                </div>
              </div>
            </div>
            <button onClick={()=>{setMode("trailer");setIdx(i=>i+1);}} style={{ width:"100%", padding:15, background:playlistColor, border:"none", borderRadius:13, color:"#000", fontSize:14, fontWeight:800, cursor:"pointer", marginBottom:10, letterSpacing:"0.02em" }}>次の予告編へ →</button>
          </>
        ):(
          <button onClick={()=>setMode("done")} style={{ width:"100%", padding:15, background:playlistColor, border:"none", borderRadius:13, color:"#000", fontSize:14, fontWeight:800, cursor:"pointer", marginBottom:10 }}>🎉 完走！結果を見る</button>
        )}
        <button onClick={onClose} style={{ background:"none", border:"none", color:T.dim, fontSize:13, cursor:"pointer" }}>ホームへ戻る</button>
      </div>
    </div>
  );

  // WATCHING
  if (mode === "watching") return (
    <div style={base}>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:130, opacity:0.04, userSelect:"none" }}>{cur?.thumb}</div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"28px 24px", position:"relative", zIndex:1 }}>
        <button onClick={()=>setMode("trailer")} style={{ background:"none", border:"none", color:T.dim, fontSize:13, cursor:"pointer", alignSelf:"flex-start", marginBottom:28, padding:0, letterSpacing:"0.05em" }}>← 予告編</button>
        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center" }}>
          <div style={{ fontSize:9, color:playlistColor, letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:14 }}>Now Watching</div>
          <div style={{ fontSize:28, fontWeight:800, textAlign:"center", marginBottom:5, color:T.cream, letterSpacing:"-0.03em", lineHeight:1.2 }}>{cur?.title}</div>
          <div style={{ fontSize:12, color:T.muted, marginBottom:4 }}>{cur?.type} · {cur?.duration}</div>
          <ServiceBadge serviceId={cur?.service} size="md" />
          {/* Elapsed */}
          <div style={{ fontSize:52, fontWeight:100, color:playlistColor, letterSpacing:"0.06em", marginTop:32, marginBottom:6, fontVariantNumeric:"tabular-nums" }}>{fmt(elapsed)}</div>
          <div style={{ fontSize:10, color:T.dim, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:44 }}>経過時間</div>
          {/* Live dot */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:40, color:T.muted, fontSize:11 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:s?.color, boxShadow:`0 0 8px ${s?.color}`, animation:"dot 2s infinite" }} />
            {s?.name} で視聴中
          </div>
          <style>{`@keyframes dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}`}</style>
          <button onClick={markDone} style={{ width:"100%", padding:"17px", background:playlistColor, border:"none", borderRadius:14, color:"#000", fontSize:16, fontWeight:800, cursor:"pointer", letterSpacing:"0.02em", boxShadow:`0 6px 30px ${playlistColor}40`, marginBottom:11 }}>✅ 見終わった！</button>
          <button onClick={()=>window.open(s?.url,"_blank")} style={{ width:"100%", padding:"12px", background:`${s?.color}18`, border:`1px solid ${s?.color}40`, borderRadius:12, color:s?.color, fontSize:13, fontWeight:700, cursor:"pointer" }}>{s?.name} をもう一度開く</button>
        </div>
      </div>
    </div>
  );

  // TRAILER
  return (
    <div style={{ ...base, background:"#000" }}>
      {/* Overlay header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px", background:"linear-gradient(180deg,rgba(0,0,0,.85)0%,transparent)", position:"absolute", top:0, left:0, right:0, zIndex:10 }}>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,0.12)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"50%", width:34, height:34, color:"#fff", fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:9, color:playlistColor, letterSpacing:"0.18em", textTransform:"uppercase" }}>{playlistName}</div>
          <div style={{ fontSize:13, fontWeight:700, color:"#fff", letterSpacing:"-0.01em" }}>{idx+1}/{titles.length} — {cur?.title}</div>
        </div>
        {watched[cur?.id] && <div style={{ fontSize:10, color:"#1CE783", background:"rgba(28,231,131,0.15)", borderRadius:6, padding:"3px 9px", letterSpacing:"0.05em" }}>✓ 視聴済</div>}
      </div>

      {/* YouTube */}
      <div style={{ position:"relative", width:"100%", paddingTop:"56.25%", background:"#050508" }}>
        {ytSrc
          ? <iframe key={cur?.yt} src={ytSrc} allow="autoplay; fullscreen" allowFullScreen style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", border:"none" }} onLoad={()=>setTimeout(()=>startCD(),15000)} />
          : <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:52 }}>{cur?.thumb}</div>
        }
      </div>

      {/* Controls panel */}
      <div style={{ flex:1, padding:"16px 18px", background:T.bg, overflowY:"auto" }}>
        {/* Title + desc */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:21, fontWeight:800, letterSpacing:"-0.03em", color:T.cream, marginBottom:4, lineHeight:1.2 }}>{cur?.title}</div>
          <div style={{ fontSize:11, color:T.muted, marginBottom:8 }}>{cur?.year} · {cur?.genre} · {cur?.type} · {cur?.duration}</div>
          {cur?.desc && <div style={{ fontSize:12, color:T.muted, lineHeight:1.6, borderLeft:`2px solid ${playlistColor}55`, paddingLeft:10 }}>{cur.desc}</div>}
        </div>

        {/* Primary CTA */}
        <button onClick={goWatch} style={{ width:"100%", padding:"14px", background:s?.color, border:"none", borderRadius:13, color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer", marginBottom:9, boxSizing:"border-box", letterSpacing:"0.02em" }}>
          {s?.name} で本編を見に行く →
        </button>

        {/* Check-in / already done */}
        {watched[cur?.id]
          ? <button onClick={()=>setMode("checkin")} style={{ width:"100%", padding:"11px", background:"rgba(28,231,131,0.1)", border:"1px solid rgba(28,231,131,0.3)", borderRadius:11, color:"#1CE783", fontSize:13, fontWeight:700, cursor:"pointer", marginBottom:12 }}>✅ 視聴済み — 次へ</button>
          : <button onClick={markDone} style={{ width:"100%", padding:"11px", background:T.card, border:`1px solid ${T.border}`, borderRadius:11, color:T.muted, fontSize:13, cursor:"pointer", marginBottom:12 }}>見終わった！チェックイン →</button>
        }

        {/* Prev / Next */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          <button onClick={goPrev} disabled={idx===0} style={{ flex:1, padding:"10px", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, color:idx===0?T.dim:T.muted, fontSize:12, cursor:idx===0?"default":"pointer" }}>← 前</button>
          <button onClick={goNext} disabled={isLast} style={{ flex:1, padding:"10px", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, color:isLast?T.dim:T.muted, fontSize:12, cursor:isLast?"default":"pointer" }}>次 →</button>
        </div>

        {/* Auto-skip countdown */}
        {countdown !== null && (
          <div style={{ background:`${playlistColor}12`, border:`1px solid ${playlistColor}40`, borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <svg width="34" height="34" style={{ flexShrink:0 }}>
              <circle cx="17" cy="17" r="13" fill="none" stroke={T.border} strokeWidth="2.5"/>
              <circle cx="17" cy="17" r="13" fill="none" stroke={playlistColor} strokeWidth="2.5"
                strokeDasharray={`${2*Math.PI*13}`} strokeDashoffset={`${2*Math.PI*13*(1-countdown/8)}`}
                strokeLinecap="round" style={{ transition:"stroke-dashoffset 1s linear", transform:"rotate(-90deg)", transformOrigin:"17px 17px" }}/>
              <text x="17" y="22" textAnchor="middle" fill={playlistColor} fontSize="11" fontWeight="700">{countdown}</text>
            </svg>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:playlistColor, fontWeight:700, letterSpacing:"0.02em" }}>次の予告編へ自動スキップ</div>
              <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{titles[idx+1]?.title}</div>
            </div>
            <button onClick={cancelCD} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:"5px 9px", color:T.muted, fontSize:10, cursor:"pointer" }}>停止</button>
          </div>
        )}

        {/* Queue */}
        <Label color={T.dim}>再生キュー</Label>
        {titles.map((t, i) => {
          const sv=svc(t.service); const isActive=i===idx; const isDone=watched[t.id];
          return (
            <div key={t.id} onClick={()=>{cancelCD();setMode("trailer");setIdx(i);}}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 11px", borderRadius:10, marginBottom:5, background:isActive?`${playlistColor}15`:T.card, border:`1px solid ${isActive?playlistColor+"50":T.border}`, cursor:"pointer", opacity:isDone&&!isActive?0.5:1, transition:"all 0.2s" }}>
              <div style={{ fontSize:9, color:isDone?"#1CE783":isActive?playlistColor:T.dim, width:14, textAlign:"center", fontWeight:800 }}>{isDone?"✓":isActive?"▶":i+1}</div>
              <div style={{ fontSize:18 }}>{t.thumb}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:isActive?700:400, color:isActive?T.cream:T.muted, letterSpacing:isActive?"-0.01em":0, textDecoration:isDone&&!isActive?"line-through":"none" }}>{t.title}</div>
                <div style={{ fontSize:10, color:T.dim }}>{t.type} · {t.duration}</div>
              </div>
              <ServiceBadge serviceId={t.service} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function StreamList() {
  const [tab,        setTab]        = useState("home");
  const [playlists,  setPlaylists]  = useState(PLAYLISTS_INIT);
  const [selPl,      setSelPl]      = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [playerSess, setPlayerSess] = useState(null);
  const [mini,       setMini]       = useState(null);
  const [plName,     setPlName]     = useState("");
  const [plDesc,     setPlDesc]     = useState("");
  const [plMood,     setPlMood]     = useState("🎬");
  const [watched,    setWatched]    = useState([1,12]);
  const [wantList,   setWantList]   = useState([3,5,9]);
  const [filter,     setFilter]     = useState("all");
  const [toast,      setToast]      = useState(null);
  const [addingTo,   setAddingTo]   = useState(null);
  const [search,     setSearch]     = useState("");
  const plId = useRef(20);

  const showToast = (msg, color=T.gold) => { setToast({msg,color}); setTimeout(()=>setToast(null),2500); };

  const launch = (pl, startIdx=0) => {
    const titles = pl.items.map(id=>TITLES.find(t=>t.id===id)).filter(Boolean);
    if (!titles.length) return;
    setPlayerSess({ titles, startIndex:startIdx, playlistName:pl.name, playlistColor:pl.color });
    setMini({ titles, currentIdx:startIdx, playlistName:pl.name, playlistColor:pl.color, mode:"paused" });
  };

  const onMarkWatched = (id, nextIdx) => {
    setWatched(p => p.includes(id)?p:[...p,id]);
    setMini(p => p?{...p, currentIdx:nextIdx??p.currentIdx, mode:"paused"}:p);
  };
  const onEnterWatching = idx => setMini(p => p?{...p, currentIdx:idx, mode:"watching"}:p);

  const toggleW = id => setWatched(p=>p.includes(id)?p.filter(i=>i!==id):[...p,id]);
  const toggleWL = id => setWantList(p=>p.includes(id)?p.filter(i=>i!==id):[...p,id]);

  const createPl = () => {
    if (!plName.trim()) return;
    const cols=["#C8A96E","#6C5CE7","#FF6B35","#1CE783","#00A8E1","#E50914"];
    setPlaylists(p=>[...p,{id:++plId.current,name:plName,desc:plDesc,items:[],shared:false,color:cols[Math.floor(Math.random()*cols.length)],mood:plMood}]);
    setPlName("");setPlDesc("");setPlMood("🎬");setShowCreate(false);
    showToast("プレイリストを作成しました");
  };

  const addToPl = (plId2, titleId) => { setPlaylists(p=>p.map(pl=>pl.id===plId2&&!pl.items.includes(titleId)?{...pl,items:[...pl.items,titleId]}:pl)); setAddingTo(null); showToast("追加しました"); };
  const removeFromPl = (plId2, titleId) => setPlaylists(p=>p.map(pl=>pl.id===plId2?{...pl,items:pl.items.filter(i=>i!==titleId)}:pl));
  const share = () => showToast("📋 共有リンクをコピーしました");

  const filtered = TITLES.filter(t => {
    const matchSvc = filter==="all" || t.service===filter;
    const matchQ   = !search || t.title.includes(search) || t.genre.includes(search);
    return matchSvc && matchQ;
  });

  const miniSvc = mini ? svc(mini.titles[mini.currentIdx]?.service) : null;
  const pb = mini ? "160px" : "90px";
  const MOODS = ["🎬","🌙","✨","😱","❤️","🎭","🌿","🔥","🌊","⭐"];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.cream, fontFamily:"'Helvetica Neue','Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif", maxWidth:480, margin:"0 auto", position:"relative" }}>

      {/* Full player */}
      {playerSess && (
        <TrailerPlayer
          titles={playerSess.titles} startIndex={playerSess.startIndex}
          playlistName={playerSess.playlistName} playlistColor={playerSess.playlistColor}
          onClose={()=>setPlayerSess(null)} onMarkWatched={onMarkWatched} onEnterWatching={onEnterWatching}
        />
      )}

      {/* Mini player */}
      {!playerSess && mini && (
        <MiniPlayer
          mini={mini}
          onExpand={()=>setPlayerSess({titles:mini.titles,startIndex:mini.currentIdx,playlistName:mini.playlistName,playlistColor:mini.playlistColor})}
          onClose={()=>setMini(null)}
          onNext={()=>setMini(p=>p&&p.currentIdx<p.titles.length-1?{...p,currentIdx:p.currentIdx+1,mode:"paused"}:p)}
          onOpenService={()=>{setMini(p=>p?{...p,mode:"watching"}:p);window.open(miniSvc?.url,"_blank");}}
        />
      )}

      {/* ── Header ── */}
      <div style={{ padding:"22px 20px 0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:9, letterSpacing:"0.22em", color:T.gold, textTransform:"uppercase", marginBottom:3 }}>StreamList</div>
          <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.04em", color:T.cream }}>
            {tab==="home"&&"ホーム"}{tab==="titles"&&"作品"}{tab==="playlists"&&"プレイリスト"}{tab==="mylist"&&"マイリスト"}
          </div>
        </div>
        <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${T.gold},${T.purple})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#000" }}>A</div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding:`14px 18px ${pb}` }}>

        {/* HOME */}
        {tab === "home" && (
          <div>
            {/* Services */}
            <div style={{ marginBottom:28 }}>
              <Label>登録中のサービス</Label>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                {SERVICES.map(s=>(
                  <div key={s.id} style={{ background:T.card, borderRadius:12, padding:"12px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:7, cursor:"pointer", border:`1px solid ${T.border}` }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:`${s.color}14`, border:`1.5px solid ${s.color}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:s.color }}>{s.short}</div>
                    <div style={{ fontSize:9, color:T.muted, textAlign:"center", letterSpacing:"0.03em" }}>{s.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Playlists */}
            <div style={{ marginBottom:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <Label>プレイリスト</Label>
                <button onClick={()=>setTab("playlists")} style={{ background:"none", border:"none", color:T.gold, fontSize:11, cursor:"pointer", letterSpacing:"0.05em" }}>すべて見る →</button>
              </div>
              <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:6 }}>
                {playlists.map(pl=>(
                  <PlaylistCard key={pl.id} pl={pl} compact onClick={()=>{setSelPl(pl.id);setTab("playlists");}} onPlay={()=>launch(pl,0)} />
                ))}
                <div onClick={()=>setShowCreate(true)} style={{ minWidth:100, background:T.card, borderRadius:14, border:`1px dashed ${T.border}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer", padding:16, flexShrink:0 }}>
                  <div style={{ fontSize:26, opacity:0.35 }}>＋</div>
                  <div style={{ fontSize:10, color:T.dim, letterSpacing:"0.05em" }}>新規作成</div>
                </div>
              </div>
            </div>

            {/* Recently watched */}
            <div>
              <Label>最近見た作品</Label>
              {watched.slice(0,3).map(id=>{
                const t=titl(id); const s=svc(t?.service); if (!t) return null;
                return (
                  <div key={id} style={{ background:T.card, borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"center", gap:12, marginBottom:8, border:`1px solid ${T.border}` }}>
                    <div style={{ fontSize:26 }}>{t.thumb}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:T.cream, letterSpacing:"-0.01em" }}>{t.title}</div>
                      <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{t.type} · {t.duration}</div>
                    </div>
                    <ServiceBadge serviceId={t.service} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TITLES */}
        {tab === "titles" && (
          <div>
            {/* Search */}
            <div style={{ position:"relative", marginBottom:14 }}>
              <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.dim, fontSize:14 }}>🔍</div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="タイトル・ジャンルで検索"
                style={{ width:"100%", padding:"11px 14px 11px 36px", background:T.card, border:`1px solid ${T.border}`, borderRadius:12, color:T.cream, fontSize:13, outline:"none", boxSizing:"border-box", letterSpacing:"-0.01em" }} />
            </div>
            {/* Filter chips */}
            <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:12, marginBottom:14 }}>
              {[{id:"all",name:"すべて",color:T.gold},...SERVICES.map(s=>({id:s.id,name:s.name,color:s.color}))].map(s=>(
                <button key={s.id} onClick={()=>setFilter(s.id)} style={{ background:filter===s.id?s.color:T.card, color:filter===s.id?"#000":T.muted, border:`1px solid ${filter===s.id?s.color:T.border}`, borderRadius:20, padding:"6px 13px", fontSize:11, cursor:"pointer", flexShrink:0, fontWeight:filter===s.id?800:400, letterSpacing:filter===s.id?"0.02em":0, transition:"all 0.15s" }}>{s.name}</button>
              ))}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {filtered.map(t=>{
                const s=svc(t.service); const isW=watched.includes(t.id); const isWL=wantList.includes(t.id);
                return (
                  <div key={t.id} style={{ background:T.card, borderRadius:14, padding:"14px", border:`1px solid ${T.border}` }}>
                    <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                      <div style={{ fontSize:36, flexShrink:0 }}>{t.thumb}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.02em", color:T.cream, marginBottom:2 }}>{t.title}</div>
                        <div style={{ fontSize:10, color:T.muted, marginBottom:6 }}>{t.year} · {t.genre} · {t.duration}</div>
                        {t.desc && <div style={{ fontSize:11, color:T.muted, lineHeight:1.5, marginBottom:10, borderLeft:`2px solid ${s?.color}40`, paddingLeft:8 }}>{t.desc}</div>}
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          <a href={s?.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, fontWeight:800, color:s?.color, background:`${s?.color}16`, borderRadius:7, padding:"4px 10px", textDecoration:"none", letterSpacing:"0.02em" }}>{s?.name} →</a>
                          <button onClick={()=>toggleW(t.id)} style={{ fontSize:11, border:"none", borderRadius:7, padding:"4px 10px", background:isW?"rgba(28,231,131,0.12)":T.surface, color:isW?"#1CE783":T.dim, cursor:"pointer" }}>{isW?"✓ 視聴済":"視聴済"}</button>
                          <button onClick={()=>toggleWL(t.id)} style={{ fontSize:11, border:"none", borderRadius:7, padding:"4px 10px", background:isWL?`${T.gold}15`:T.surface, color:isWL?T.gold:T.dim, cursor:"pointer" }}>{isWL?"★ 見たい":"見たい"}</button>
                          <button onClick={()=>setAddingTo(t.id)} style={{ fontSize:11, border:"none", borderRadius:7, padding:"4px 10px", background:`${T.purple}18`, color:T.purple, cursor:"pointer" }}>＋ リスト</button>
                        </div>
                      </div>
                    </div>
                    {addingTo===t.id && (
                      <div style={{ marginTop:12, padding:12, background:T.bg, borderRadius:11, border:`1px solid ${T.purple}40` }}>
                        <Label color={T.dim}>追加先を選択</Label>
                        {playlists.map(pl=>(
                          <button key={pl.id} onClick={()=>addToPl(pl.id,t.id)} style={{ display:"block", width:"100%", textAlign:"left", background:T.card, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 12px", marginBottom:6, cursor:"pointer", color:T.cream, fontSize:12 }}>
                            <span style={{ color:pl.color, marginRight:6 }}>{pl.mood}</span>{pl.name}
                            {pl.items.includes(t.id)&&<span style={{ color:T.dim, fontSize:10, marginLeft:6 }}>追加済</span>}
                          </button>
                        ))}
                        <button onClick={()=>setAddingTo(null)} style={{ background:"none", border:"none", color:T.dim, fontSize:11, cursor:"pointer", marginTop:4 }}>キャンセル</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {filtered.length===0 && <div style={{ textAlign:"center", padding:40, color:T.dim, fontSize:13 }}>作品が見つかりません</div>}
            </div>
          </div>
        )}

        {/* PLAYLISTS */}
        {tab === "playlists" && (
          <div>
            {!selPl ? (
              <>
                <button onClick={()=>setShowCreate(true)} style={{ width:"100%", padding:"13px", background:`${T.purple}15`, border:`1px dashed ${T.purple}`, borderRadius:14, color:T.purple, fontSize:13, fontWeight:700, cursor:"pointer", marginBottom:16, letterSpacing:"0.03em" }}>＋ 新しいプレイリストを作成</button>
                {playlists.map(pl=>(
                  <PlaylistCard key={pl.id} pl={pl} onClick={()=>setSelPl(pl.id)} onPlay={()=>launch(pl,0)} />
                ))}
              </>
            ):(()=>{
              const pl=playlists.find(p=>p.id===selPl); if(!pl) return null;
              const items=pl.items.map(titl).filter(Boolean);
              return (
                <div>
                  <button onClick={()=>setSelPl(null)} style={{ background:"none", border:"none", color:T.dim, fontSize:13, cursor:"pointer", marginBottom:16, padding:0, letterSpacing:"0.05em" }}>← 戻る</button>

                  {/* Hero */}
                  <div style={{ background:T.card, borderRadius:18, overflow:"hidden", marginBottom:16, border:`1px solid ${pl.color}40` }}>
                    <div style={{ background:T.surface, padding:"6px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <Perforations color={pl.color} />
                      <div style={{ fontSize:14 }}>{pl.mood}</div>
                      <Perforations color={pl.color} />
                    </div>
                    <div style={{ padding:"18px 18px 0" }}>
                      <div style={{ fontSize:9, color:pl.color, letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:8 }}>Playlist</div>
                      <div style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.04em", color:T.cream, marginBottom:4 }}>{pl.name}</div>
                      {pl.desc && <div style={{ fontSize:12, color:T.muted, marginBottom:10, lineHeight:1.5 }}>{pl.desc}</div>}
                      <div style={{ fontSize:12, color:pl.color, marginBottom:16, fontWeight:700 }}>{items.length} 作品</div>
                      <div style={{ display:"flex", gap:9, marginBottom:18 }}>
                        <button onClick={()=>launch(pl,0)} style={{ flex:1, padding:"12px", background:pl.color, color:"#000", border:"none", borderRadius:11, fontSize:13, fontWeight:800, cursor:"pointer", letterSpacing:"0.02em" }}>▶ 予告編を再生</button>
                        <button onClick={share} style={{ padding:"12px 16px", background:`${pl.color}16`, color:pl.color, border:`1px solid ${pl.color}40`, borderRadius:11, fontSize:13, fontWeight:700, cursor:"pointer" }}>📤</button>
                      </div>
                    </div>
                    <div style={{ background:T.surface, padding:"6px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <Perforations color={pl.color} />
                      <Perforations color={pl.color} />
                    </div>
                  </div>

                  {/* Items */}
                  {items.length===0 ? (
                    <div style={{ textAlign:"center", padding:40, color:T.dim }}>
                      <div style={{ fontSize:36, marginBottom:12 }}>🎬</div>
                      <div style={{ fontSize:13 }}>まだタイトルがありません</div>
                      <button onClick={()=>setTab("titles")} style={{ marginTop:12, background:T.purple, border:"none", borderRadius:10, padding:"9px 18px", color:"#fff", fontSize:12, cursor:"pointer" }}>作品から追加する →</button>
                    </div>
                  ):items.map((t,i)=>{
                    const s=svc(t.service);
                    return (
                      <div key={t.id} style={{ background:T.card, borderRadius:12, padding:"12px 14px", marginBottom:7, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:11 }}>
                        <div style={{ fontSize:11, color:T.dim, width:16, textAlign:"center", fontWeight:700 }}>{i+1}</div>
                        <div style={{ fontSize:26 }}>{t.thumb}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:T.cream, letterSpacing:"-0.01em" }}>{t.title}</div>
                          <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{t.type} · {t.duration}</div>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:5, alignItems:"flex-end" }}>
                          <button onClick={()=>launch(pl,i)} style={{ background:pl.color, border:"none", borderRadius:6, padding:"4px 9px", color:"#000", fontSize:10, fontWeight:900, cursor:"pointer" }}>▶</button>
                          <ServiceBadge serviceId={t.service} />
                          <button onClick={()=>removeFromPl(pl.id,t.id)} style={{ background:"none", border:"none", color:T.dim, fontSize:11, cursor:"pointer" }}>✕</button>
                        </div>
                      </div>
                    );
                  })}
                  <button onClick={()=>setTab("titles")} style={{ width:"100%", marginTop:10, padding:"12px", background:T.card, border:`1px dashed ${T.border}`, borderRadius:12, color:T.dim, fontSize:13, cursor:"pointer" }}>＋ タイトルを追加</button>
                </div>
              );
            })()}
          </div>
        )}

        {/* MY LIST */}
        {tab === "mylist" && (
          <div>
            <div style={{ marginBottom:26 }}>
              <Label>見たい作品 ({wantList.length})</Label>
              {wantList.length===0 ? <div style={{ color:T.dim, fontSize:13, padding:"20px 0" }}>「見たい」を追加しましょう</div> : wantList.map(id=>{
                const t=titl(id); const s=svc(t?.service); if(!t) return null;
                return (
                  <div key={id} style={{ background:T.card, borderRadius:12, padding:"12px 14px", marginBottom:7, border:`1px solid ${T.gold}25`, display:"flex", alignItems:"center", gap:11 }}>
                    <div style={{ fontSize:24 }}>{t.thumb}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:T.cream, letterSpacing:"-0.01em" }}>{t.title}</div>
                      <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{t.type} · {t.duration}</div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:5, alignItems:"flex-end" }}>
                      <ServiceBadge serviceId={t.service} />
                      <button onClick={()=>toggleWL(id)} style={{ background:"none", border:"none", color:T.dim, fontSize:11, cursor:"pointer" }}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <Label>視聴済み ({watched.length})</Label>
              {watched.length===0 ? <div style={{ color:T.dim, fontSize:13, padding:"20px 0" }}>視聴した作品がここに残ります</div> : watched.map(id=>{
                const t=titl(id); const s=svc(t?.service); if(!t) return null;
                return (
                  <div key={id} style={{ background:T.card, borderRadius:12, padding:"12px 14px", marginBottom:7, border:`1px solid rgba(28,231,131,0.15)`, display:"flex", alignItems:"center", gap:11, opacity:0.65 }}>
                    <div style={{ fontSize:24 }}>{t.thumb}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:T.muted, textDecoration:"line-through", letterSpacing:"-0.01em" }}>{t.title}</div>
                      <div style={{ fontSize:10, color:T.dim, marginTop:2 }}>✓ 視聴済み</div>
                    </div>
                    <ServiceBadge serviceId={t.service} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreate && (
        <div style={{ position:"fixed", inset:0, background:"rgba(8,8,16,0.85)", backdropFilter:"blur(12px)", display:"flex", alignItems:"flex-end", zIndex:150 }}>
          <div style={{ width:"100%", maxWidth:480, margin:"0 auto", background:T.card, borderRadius:"22px 22px 0 0", padding:26, border:`1px solid ${T.border}`, borderBottom:"none" }}>
            {/* Film strip top in modal */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
              <Perforations color={T.gold} />
            </div>
            <div style={{ fontSize:9, color:T.gold, letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:14 }}>New Playlist</div>
            <div style={{ marginBottom:13 }}>
              <div style={{ fontSize:10, color:T.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>タイトル</div>
              <input value={plName} onChange={e=>setPlName(e.target.value)} placeholder="例：週末の映画マラソン"
                style={{ width:"100%", padding:"12px 14px", background:T.bg, border:`1px solid ${T.border}`, borderRadius:11, color:T.cream, fontSize:14, outline:"none", boxSizing:"border-box", letterSpacing:"-0.01em" }} />
            </div>
            <div style={{ marginBottom:13 }}>
              <div style={{ fontSize:10, color:T.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>説明（任意）</div>
              <input value={plDesc} onChange={e=>setPlDesc(e.target.value)} placeholder="例：アカデミー賞受賞作を集めました"
                style={{ width:"100%", padding:"12px 14px", background:T.bg, border:`1px solid ${T.border}`, borderRadius:11, color:T.cream, fontSize:13, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ marginBottom:22 }}>
              <div style={{ fontSize:10, color:T.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>ムード</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {MOODS.map(m=>(
                  <button key={m} onClick={()=>setPlMood(m)} style={{ width:38, height:38, borderRadius:9, background:plMood===m?`${T.gold}25`:T.bg, border:`1.5px solid ${plMood===m?T.gold:T.border}`, fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>{m}</button>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", gap:9 }}>
              <button onClick={()=>setShowCreate(false)} style={{ flex:1, padding:"13px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, color:T.muted, fontSize:13, cursor:"pointer" }}>キャンセル</button>
              <button onClick={createPl} style={{ flex:2, padding:"13px", background:plName.trim()?T.purple:T.dim, border:"none", borderRadius:12, color:plName.trim()?"#fff":T.bg, fontSize:14, fontWeight:800, cursor:"pointer", letterSpacing:"0.02em" }}>作成する</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:100, left:"50%", transform:"translateX(-50%)", background: toast.color||T.gold, color:"#000", padding:"11px 22px", borderRadius:28, fontSize:12, fontWeight:800, zIndex:300, boxShadow:`0 4px 24px ${toast.color||T.gold}60`, letterSpacing:"0.03em", whiteSpace:"nowrap" }}>
          {toast.msg}
        </div>
      )}

      {/* Bottom Nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"rgba(8,8,16,0.94)", backdropFilter:"blur(24px)", borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"space-around", padding:"10px 0 20px", zIndex:60 }}>
        {[{id:"home",icon:"⌂",label:"ホーム"},{id:"titles",icon:"🎬",label:"作品"},{id:"playlists",icon:"▤",label:"リスト"},{id:"mylist",icon:"★",label:"マイ"}].map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);setSelPl(null);}} style={{ background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer", padding:"4px 14px" }}>
            <div style={{ fontSize:19, opacity:tab===t.id?1:0.3, filter:tab===t.id?"none":"grayscale(1)" }}>{t.icon}</div>
            <div style={{ fontSize:9, color:tab===t.id?T.gold:T.dim, fontWeight:tab===t.id?800:400, letterSpacing:"0.1em", textTransform:"uppercase" }}>{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
