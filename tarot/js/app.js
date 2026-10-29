/* ============================================================
   そらるの星詠みタロット — app logic
   ============================================================ */
(function () {
  "use strict";

  const CARDS = window.TAROT_CARDS;
  const MODES = window.TAROT_MODES;
  const YN = window.TAROT_YN;
  const REVERSED_RATE = 0.40;
  const FLIP_MS = 1400; // めくりアニメーションの長さ（CSSの flip3d と合わせる）
  const IMG_DIR = "img/cards/";
  const SITE_TITLE = "そらるの星詠みタロット";
  const HASHTAG = "#そらるの星詠みタロット";

  const $ = (id) => document.getElementById(id);
  const el = {
    home: $("screen-home"),
    reading: $("screen-reading"),
    modeEn: $("reading-mode-en"),
    modeJa: $("reading-mode-ja"),
    instruction: $("instruction"),
    slots: $("slots"),
    spreadWrap: $("spread-wrap"),
    spread: $("spread"),
    result: $("result"),
    resultCards: $("result-cards"),
    resultYn: $("result-yn"),
    ynEn: $("yn-en"),
    toast: $("toast")
  };

  const state = { mode: null, picks: [], busy: false, fromShare: false, gen: 0 }; // gen: 占い直すたびに増える

  /* ---------- utils ---------- */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const imgSrc = (id) => IMG_DIR + id + ".jpg";
  // 「。」「？」「！」の直後で文を分ける
  const sentences = (text) => text.split(/(?<=[。？！])\s*/).filter(Boolean);

  // 日本語を文節のまとまりで改行する（「チャレンジし／ていい」のように語の途中で折れないように）
  // Intl.Segmenter で単語に分け、助詞・助動詞などを前の語につなげた塊の境目だけに <wbr> を入れる。
  // CSS 側（html.has-phrase .rc-msg）で word-break: keep-all にして、<wbr> の位置でだけ折り返す。
  const PARTICLES = new Set(["は","が","を","に","へ","と","の","で","も","や","か","な","ね","よ","て","た","だ","です","ます","ない","たい","し","ば","から","まで","より","ので","のに","けど","けれど","かも","っぽい","ちゃ","じゃ","なら","だけ","ほど","くらい","ぐらい","など","って","とか","でも","さえ","こそ","しか","ずつ","のみ","ある","いる","いい","する","なる","れる","られる","せる","させる","てる","でる","そう","よう","みたい","らしい","べき","はず","わけ","もの","こと","とき","ところ","う","ん","ず","ぬ","ぞ","ぜ","さ","わ","っ","ー","やすい","にくい","がち","気味"]);
  const WEAK = new Set(["いい","ある","いる","する","なる","こと","もの","とき","ところ","わけ","はず","やつ","ほう","ぶん","まま","あと"]);
  const seg = (typeof Intl !== "undefined" && Intl.Segmenter) ? new Intl.Segmenter("ja", { granularity: "word" }) : null;
  if (seg) document.documentElement.classList.add("has-phrase");
  const isKana = (t) => /^[ぁ-ゖー]+$/.test(t);
  function phrases(text) {
    if (!seg) return [text];
    const out = []; let cur = "", stick = false;
    for (const { segment: t, isWordLike } of seg.segment(text)) {
      let brk;
      if (t === "「") brk = cur !== "";
      else if (!isWordLike || cur === "" || /「$/.test(cur) || stick) brk = false;
      else if (/、$/.test(cur)) brk = true;
      else if (t.length === 1 && isKana(t)) brk = false;           // 1文字のかなは前につなげる
      else if (WEAK.has(t) && cur.length >= 6 && !/[てで]$/.test(cur)) brk = true;         // 塊が長いときは「ほうが｜いい」のように切ってよい語
      else if (PARTICLES.has(t)) brk = false;                      // 助詞・助動詞は前につなげる
      else if (cur.length <= 2) brk = false;                       // 2文字以下の塊は作らない
      else if (/(けど|けれど|から|ので|のに|たら|れば|ても|でも)$/.test(cur) && cur.length >= 4) brk = true; // 接続のあとで切る（長い塊を防ぐ）
      else if (t.length === 1) brk = true;                         // 1文字の漢字・カタカナは次の語とひとまとまりに
      else if (isKana(t) && (t.length <= 2 || cur.length < 6 || /^[てで]/.test(t))) brk = false;
      else if (/[一-龥][ぁ-ゖ]$/.test(cur) && cur.length <= 3 && !/[はがをにのでともへなやか]$/.test(cur) && /^[一-龥]/.test(t)) brk = false; // 落ち＋着く のような複合動詞
      else brk = true;
      stick = brk && t.length === 1;
      if (brk) { out.push(cur); cur = t; } else cur += t;
    }
    if (cur) out.push(cur);
    // 単語分割が「てい／い」になって「ていい」の前で切れないことがあるので、長い塊は「〜て｜いい」で分ける
    return out.flatMap((c) => (c.length > 9 ? c.split(/(?<=て)(?=いい)/) : [c]));
  }
  const msgHtml = (text) => sentences(text).map((s) => phrases(s).join("<wbr>")).join("<br>");
  const BACK_SRC = IMG_DIR + "ura.jpg";

  let toastTimer;
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2200);
  }

  function showScreen(name) {
    document.body.classList.toggle("on-home", name === "home");
    el.home.classList.toggle("is-active", name === "home");
    el.reading.classList.toggle("is-active", name === "reading");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 占い画面が一画面に収まらないとき、はみ出した分だけ選んだカードを縮めて収める（スマホも、横向きの iPad や縦の短い PC 画面も）
  const SLOT_MIN_W = 56;
  function fitSlots() {
    const slots = [...el.slots.querySelectorAll(".slot")];
    slots.forEach((s) => s.style.removeProperty("--w"));
    if (!el.reading.classList.contains("is-active") || !slots.length) return;
    const over = document.documentElement.scrollHeight - window.innerHeight;
    if (over <= 0) return;
    const h = slots[0].offsetWidth * 1200 / 662;
    const minW = window.innerWidth > 760 ? 96 : SLOT_MIN_W; // PC では小さくしすぎない
    const w = Math.max(minW, (h - over) * 662 / 1200);
    slots.forEach((s) => s.style.setProperty("--w", w.toFixed(1) + "px"));
  }

  /* ---------- reading flow ---------- */
  function startReading(modeKey) {
    stopWash();
    state.gen++;
    const mode = MODES[modeKey];
    state.mode = modeKey;
    state.picks = [];
    state.busy = false;
    state.fromShare = false;

    el.modeEn.textContent = mode.en;
    el.modeJa.textContent = mode.label;
    // スマホでは「、」の後で改行（末尾の「ね」だけが次の行に落ちないように）
    el.instruction.innerHTML = mode.count === 1
      ? (modeKey === "yn" ? "質問を心に浮かべながら、<br class=\"sp-only\">気になるカードを一枚選んでね" : "心を落ち着けて、<br class=\"sp-only\">気になるカードを一枚選んでね")
      : "気になるカードを、順番に3枚選んでね";
    el.instruction.style.opacity = 1;
    el.instruction.classList.remove("is-collapsed");
    $("btn-again").textContent = "もう一度引く";

    try { history.replaceState(null, "", location.pathname + location.search); } catch { /* ignore */ } // 占い直すときは URL の結果（#以降）を消す
    el.result.hidden = true;
    el.reading.classList.remove("has-result");
    el.resultCards.innerHTML = "";
    el.resultYn.hidden = true;
    el.spreadWrap.classList.remove("is-gone");
    const old = el.reading.querySelector(".shared-notice");
    if (old) old.remove();

    buildSlots(mode);
    buildSpread();
    showScreen("reading");
    fitSlots();
    // 扇が配られ終わってから（dealIn アニメーションの後）もう一度収め直す
    const g = state.gen;
    setTimeout(() => { if (g === state.gen && !wash.active) fitSlots(); }, 1600);
  }

  function buildSlots(mode) {
    el.slots.innerHTML = "";
    el.slots.classList.toggle("is-three", mode.count === 3);
    for (let i = 0; i < mode.count; i++) {
      const slot = document.createElement("div");
      slot.className = "slot";
      if (mode.positions) {
        slot.innerHTML = `<div class="slot-pos">${mode.positionsEn[i]}<small>${mode.positions[i]}</small></div>`;
      }
      const card = document.createElement("div");
      card.className = "slot-card";
      card.dataset.index = i;
      slot.appendChild(card);
      el.slots.appendChild(slot);
    }
  }

  function buildSpread() {
    el.spread.innerHTML = "";
    // 扇のカードには中身を持たせない（どのカードが出るかはタップした瞬間に決める）
    const n = CARDS.length;
    const mid = (n - 1) / 2;
    CARDS.forEach((_, i) => {
      const b = document.createElement("button");
      b.className = "spread-card";
      b.type = "button";
      b.setAttribute("aria-label", "カード " + (i + 1));
      const t = (i - mid) / mid; // -1..1
      b.style.setProperty("--rot", (t * 10).toFixed(2) + "deg");
      b.style.setProperty("--ty", (Math.abs(t) * 18).toFixed(1) + "px");
      b.style.setProperty("--delay", (i * 0.03).toFixed(2) + "s");
      b.style.left = `calc(${(i / (n - 1)) * 100}% - var(--cw) * ${(i / (n - 1)).toFixed(4)})`;
      b.style.setProperty("--tx", "0px");
      b.style.zIndex = i;
      b.innerHTML = `<img src="${BACK_SRC}" alt="">`;
      b.addEventListener("click", () => pickCard(b));
      el.spread.appendChild(b);
    });
    $("btn-shuffle").disabled = false;
  }

  /* ---------- shuffle (wash) ---------- */
  // 「カードを混ぜる」で場に散らし、指でなぞって混ぜる。「混ぜ終わる」で山にまとめ、切ってから扇に配り直す。
  // 出るカードはタップした瞬間に決めるので、なぞり方で確率は変わらない。
  // 座標は「場の下端中央に置いたカード」からのずれ（x: 左右, y: 上が負）
  const WASH_H = 2.3; // 場の高さ（カード何枚ぶんか）
  const wash = { active: false, gen: 0, raf: 0, cards: [], ptr: null, z: 100, instruction: "", size: null };
  const cardTransform = (s) => `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) rotate(${s.a.toFixed(1)}deg)`;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  function setShuffleLabel(washing) {
    const btn = $("btn-shuffle");
    btn.querySelector(".shuffle-en").textContent = washing ? "✦ DONE ✦" : "✦ SHUFFLE ✦";
    btn.querySelector(".shuffle-ja").textContent = washing ? "混ぜ終わる" : "カードを混ぜる";
  }

  function startWash() {
    if (state.busy || state.picks.length) return;
    state.busy = true;
    wash.active = true;
    const gen = ++wash.gen;
    wash.instruction = el.instruction.innerHTML;
    el.instruction.innerHTML = "指でなぞって、<br class=\"sp-only\">カードを混ぜてね";
    setShuffleLabel(true);

    const first = el.spread.firstElementChild;
    const cw = first.offsetWidth, ch = first.offsetHeight;
    const W = el.spread.clientWidth;
    const slotsBlock = el.slots.offsetHeight + parseFloat(getComputedStyle(el.slots).marginBottom);
    const topAfter = el.spread.getBoundingClientRect().top + window.scrollY - slotsBlock;
    const btn = $("btn-shuffle");
    const below = btn.offsetHeight + parseFloat(getComputedStyle(btn).marginTop)
      + parseFloat(getComputedStyle(document.querySelector(".app")).paddingBottom);
    const room = window.innerHeight - topAfter - below;
    const H = Math.round(Math.max(ch * 1.3, Math.min(ch * WASH_H, room)));
    // 回転したカードが場からはみ出さないよう、カードの対角線の半分ぶん内側に収める
    const m = Math.hypot(cw, ch) / 2;
    wash.size = { cw, ch, W, H, maxX: Math.max(0, W / 2 - m), minY: Math.min(0, m - H + ch / 2), maxY: Math.min(0, ch / 2 - m) };
    el.spread.style.height = H + "px";
    el.spread.classList.add("is-washing");
    el.reading.classList.add("is-washing");
    document.documentElement.classList.add("is-washing"); // 背景をつかんでもページが動かないように

    wash.cards = [...el.spread.children].map((c) => {
      const s = {
        el: c, vx: 0, vy: 0, va: 0,
        x: (Math.random() * 2 - 1) * wash.size.maxX,
        y: wash.size.minY + Math.random() * (wash.size.maxY - wash.size.minY),
        a: Math.random() * 360 - 180
      };
      c.style.transform = cardTransform(s);
      return s;
    });
    // 散らばり終わってから指に追従させる
    setTimeout(() => {
      if (gen !== wash.gen) return;
      el.spread.classList.add("is-live");
      wash.raf = requestAnimationFrame(washStep);
    }, 500);
  }

  function washStep() {
    const { maxX, minY, maxY } = wash.size;
    wash.cards.forEach((s) => {
      if (!s.vx && !s.vy && !s.va) return;
      s.x += s.vx; s.y += s.vy; s.a += s.va;
      s.vx *= 0.86; s.vy *= 0.86; s.va *= 0.88;
      if (Math.abs(s.vx) < 0.02) s.vx = 0;
      if (Math.abs(s.vy) < 0.02) s.vy = 0;
      if (Math.abs(s.va) < 0.02) s.va = 0;
      // 場の端で軽く跳ね返る
      if (s.x > maxX || s.x < -maxX) { s.x = clamp(s.x, -maxX, maxX); s.vx *= -0.4; }
      if (s.y > maxY || s.y < minY) { s.y = clamp(s.y, minY, maxY); s.vy *= -0.4; }
      s.el.style.transform = cardTransform(s);
    });
    wash.raf = requestAnimationFrame(washStep);
  }

  // 指の近くのカードを、指の動いた向きに押して回す
  function washPush(e) {
    if (!wash.active || !wash.ptr) return;
    const dx = e.clientX - wash.ptr.x, dy = e.clientY - wash.ptr.y;
    wash.ptr = { x: e.clientX, y: e.clientY };
    const r = el.spread.getBoundingClientRect();
    const { ch, W, H } = wash.size;
    const px = e.clientX - r.left, py = e.clientY - r.top;
    const R = ch * 0.75;
    wash.cards.forEach((s) => {
      const ox = W / 2 + s.x - px, oy = H - ch / 2 + s.y - py;
      const d = Math.hypot(ox, oy);
      if (d > R) return;
      const f = 1 - d / R;
      s.vx = clamp(s.vx + dx * f * 0.5, -40, 40);
      s.vy = clamp(s.vy + dy * f * 0.5, -40, 40);
      s.va = clamp(s.va + ((ox * dy - oy * dx) / R) * f * 0.15, -20, 20);
      if (f > 0.4) s.el.style.zIndex = ++wash.z; // 触ったカードが上に重なる
    });
  }
  el.spread.addEventListener("pointerdown", (e) => {
    if (!wash.active) return;
    el.spread.setPointerCapture(e.pointerId);
    wash.ptr = { x: e.clientX, y: e.clientY };
  });
  el.spread.addEventListener("pointermove", washPush);
  el.spread.addEventListener("pointerup", () => { wash.ptr = null; });
  // iOS Safari は CSS だけではスクロールを止めきれないので、混ぜている間は指の動きでページを動かさない
  document.addEventListener("touchmove", (e) => { if (wash.active) e.preventDefault(); }, { passive: false });
  el.spread.addEventListener("pointercancel", () => { wash.ptr = null; });

  async function endWash() {
    if (!wash.active) return;
    wash.active = false;
    wash.ptr = null;
    const gen = wash.gen;
    cancelAnimationFrame(wash.raf);
    $("btn-shuffle").disabled = true;

    // 回転を -180〜180 に揃えてから山へ（ぐるぐる巻き戻らないように）
    wash.cards.forEach((s) => { s.a = (((s.a % 360) + 540) % 360) - 180; s.el.style.transform = cardTransform(s); });
    void el.spread.offsetWidth;
    el.spread.classList.remove("is-live");
    el.spread.classList.add("is-gathering");
    wash.cards.forEach((s) => { s.el.style.transform = ""; });
    await sleep(450);
    if (gen !== wash.gen) return;

    // 山を2回切る
    for (let n = 0; n < 2; n++) {
      wash.cards.forEach((s) => {
        const side = Math.random() < 0.5 ? -1 : 1;
        s.el.style.setProperty("--jx", (side * (16 + Math.random() * 28)).toFixed(1) + "px");
        s.el.style.setProperty("--jr", ((Math.random() - 0.5) * 14).toFixed(1) + "deg");
      });
      await sleep(200);
      wash.cards.forEach((s) => { s.el.style.setProperty("--jx", "0px"); s.el.style.setProperty("--jr", "0deg"); });
      await sleep(200);
      if (gen !== wash.gen) return;
    }

    // 扇に配り直す
    wash.cards.forEach((s, i) => { s.el.style.zIndex = i; });
    el.spread.classList.remove("is-washing", "is-gathering");
    el.reading.classList.remove("is-washing");
    document.documentElement.classList.remove("is-washing");
    el.spread.style.height = "";
    el.instruction.innerHTML = wash.instruction;
    setShuffleLabel(false);
    await sleep(550);
    fitSlots();
    if (gen !== wash.gen) return;
    $("btn-shuffle").disabled = false;
    state.busy = false;
  }

  // 混ぜている途中で画面を離れたとき用
  function stopWash() {
    wash.gen++;
    wash.active = false;
    wash.ptr = null;
    cancelAnimationFrame(wash.raf);
    el.spread.classList.remove("is-washing", "is-live", "is-gathering");
    el.reading.classList.remove("is-washing");
    document.documentElement.classList.remove("is-washing");
    el.spread.style.height = "";
    setShuffleLabel(false);
  }

  async function pickCard(btn) {
    if (state.busy || btn.classList.contains("is-picked")) return;
    const mode = MODES[state.mode];
    if (state.picks.length >= mode.count) return;

    // 残りの山からランダムに1枚（どのカードも同じ確率）
    const rest = CARDS.map((c) => c.id).filter((cid) => !state.picks.some((p) => p.id === cid));
    const id = rest[Math.floor(Math.random() * rest.length)];
    const reversed = Math.random() < REVERSED_RATE;
    state.picks.push({ id, reversed });
    btn.classList.add("is-picked");
    $("btn-shuffle").disabled = true; // 引き始めたら混ぜ直さない

    const idx = state.picks.length - 1;
    fillSlot(idx, id, reversed);
    const isLast = state.picks.length >= mode.count;

    if (!isLast) {
      const left = mode.count - state.picks.length;
      el.instruction.textContent = `あと ${left} 枚、選んでね`;
    } else {
      state.busy = true;
      el.instruction.style.opacity = 0;
      el.spreadWrap.classList.add("is-gone");
    }

    // 表面画像のデコードを待ってからめくる（めくり中のカクつき防止）
    // 待っている間にメニューへ戻る・占い直すをされたら、この続きは捨てる
    const gen = state.gen;
    const slotCard = el.slots.querySelector(`.slot-card[data-index="${idx}"]`);
    const frontImg = slotCard.querySelector(".face.front img");
    // decode() が終わらない環境もあるので、最大1.5秒で見切ってめくる
    await Promise.all([sleep(700), Promise.race([frontImg.decode().catch(() => {}), sleep(1500)])]);
    if (gen !== state.gen) return;
    slotCard.classList.add("flipped");

    if (!isLast) return;

    await sleep(FLIP_MS + 1200); // めくり終わりの余韻
    if (gen !== state.gen) return;
    renderResult();
    state.busy = false;
  }

  function fillSlot(index, id, reversed) {
    const slotCard = el.slots.querySelector(`.slot-card[data-index="${index}"]`);
    slotCard.classList.add("filled");
    slotCard.innerHTML = `
      <div class="face back"><img src="${BACK_SRC}" alt=""></div>
      <div class="face front${reversed ? " reversed" : ""}"><img src="${imgSrc(id)}" alt=""></div>`;
  }

  function renderResult() {
    const mode = MODES[state.mode];
    el.resultCards.innerHTML = "";
    el.resultCards.classList.toggle("is-three", mode.count === 3);

    state.picks.forEach((p, i) => {
      const card = CARDS[p.id];
      const data = p.reversed ? card.rev : card.up;
      const div = document.createElement("div");
      div.className = "result-card" + (mode.count === 1 ? " is-wide" : "");
      div.style.setProperty("--delay", (i * 0.35) + "s");
      div.innerHTML = `
        ${mode.positions ? `<div class="rc-pos">${mode.positionsEn[i]}<small>${mode.positions[i]}</small></div>` : ""}
        <div class="rc-num">${card.num}</div>
        <h2 class="rc-name">${card.ja}</h2>
        <div class="rc-en">${card.en}</div>
        <span class="rc-ori${p.reversed ? " rev" : ""}">${p.reversed ? "逆位置" : "正位置"}</span>
        <p class="rc-key">${data.key}</p>
        <p class="rc-msg">${msgHtml(data.msg)}</p>`;
      el.resultCards.appendChild(div);
    });

    if (state.mode === "yn") {
      const p = state.picks[0];
      const data = p.reversed ? CARDS[p.id].rev : CARDS[p.id].up;
      el.ynEn.textContent = YN[data.yn].en;
      el.resultYn.hidden = false;
    } else {
      el.resultYn.hidden = true;
    }

    el.instruction.classList.add("is-collapsed");
    // スマホでは結果をカードと横並びにする（CSS の .has-result）。切り替わったカードを元の位置からすべらせる
    const slot = el.slots.querySelector(".slot");
    const before = slot.getBoundingClientRect();
    el.reading.classList.toggle("has-result", mode.count === 1);
    el.result.hidden = false;
    fitSlots();
    const after = slot.getBoundingClientRect();
    if (before.width && after.width && (Math.abs(before.left - after.left) > 1 || Math.abs(before.top - after.top) > 1)) {
      slot.animate([
        { transformOrigin: "0 0", transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width})` },
        { transformOrigin: "0 0", transform: "none" }
      ], { duration: 700, easing: "cubic-bezier(.2,.7,.2,1)" });
    }
    updateShareLinks();
    // keep the shareable state in the URL (no reload)
    try { history.replaceState(null, "", "#" + shareToken()); } catch { /* ignore */ }
  }

  /* ---------- share ---------- */
  // 結果はハッシュで表す（例: #one_17_1 / #three_1.5.9_010）。クエリ文字列が使えない環境でも届く
  function shareToken() {
    return `${state.mode}_${state.picks.map((p) => p.id).join(".")}_${state.picks.map((p) => (p.reversed ? 1 : 0)).join("")}`;
  }
  function shareUrl() {
    const u = new URL(location.href);
    u.search = ""; u.hash = shareToken();
    return u.toString();
  }
  function shareText() {
    const mode = MODES[state.mode];
    const lines = [`${SITE_TITLE}｜${mode.label}`];
    state.picks.forEach((p, i) => {
      const card = CARDS[p.id];
      const data = p.reversed ? card.rev : card.up;
      const pos = mode.positions ? `${mode.positions[i]}：` : "";
      lines.push(`${pos}${card.num} ${card.ja}（${p.reversed ? "逆位置" : "正位置"}）`);
      if (mode.count === 1) lines.push(`「${data.msg}」`);
    });
    if (state.mode === "yn") {
      const p = state.picks[0];
      const data = p.reversed ? CARDS[p.id].rev : CARDS[p.id].up;
      lines.push(`答え：${YN[data.yn].en}`);
    }
    lines.push(HASHTAG);
    return lines.join("\n");
  }

  function updateShareLinks() {
    const text = encodeURIComponent(shareText());
    const url = encodeURIComponent(shareUrl());
    $("share-x").href = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    $("share-line").href = `https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`;
  }

  $("share-copy").addEventListener("click", async () => {
    const text = shareText() + "\n" + shareUrl();
    try {
      await navigator.clipboard.writeText(text);
      toast("結果とリンクをコピーしました");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); ta.remove();
      toast("結果とリンクをコピーしました");
    }
  });

  /* ---------- navigation ---------- */
  document.querySelectorAll(".menu-btn").forEach((b) =>
    b.addEventListener("click", () => startReading(b.dataset.mode))
  );
  $("btn-back").addEventListener("click", goHome);
  $("btn-menu").addEventListener("click", goHome);
  $("btn-shuffle").addEventListener("click", () => (wash.active ? endWash() : startWash()));
  $("btn-again").addEventListener("click", () => startReading(state.mode));

  function goHome() {
    stopWash();
    state.gen++;
    try { history.replaceState(null, "", location.pathname + location.search); } catch { /* ignore */ }
    showScreen("home");
  }


  /* ---------- scrolling card grid background (home) ---------- */
  // 固定配置：裏面と表面を市松模様に半々。表面は BG_PRIORITY の順で上の段から埋める。
  const THUMB_DIR = IMG_DIR + "thumb/";
  const BG_PRIORITY = [1, 15, 4, 19, 7, 17, 0, 21]; // 魔術師, 悪魔, 皇帝, 太陽, 戦車, 星, 愚者, 世界
  const BG_ROWS = 8;
  let bgCols = 0;
  function buildBgGrid() {
    const wrap = $("bg-cards");
    if (!wrap) return;
    const cols = window.innerWidth < 760 ? 3 : 6;
    if (cols === bgCols) return;
    bgCols = cols;
    wrap.style.setProperty("--cols", cols);
    wrap.innerHTML = "";

    // 表面の並び：優先カード → 残りのカード（番号順）→ 足りなければ先頭から繰り返し
    const rest = CARDS.map((c) => c.id).filter((id) => !BG_PRIORITY.includes(id));
    const order = BG_PRIORITY.concat(rest);
    let k = 0;
    const grid = Array.from({ length: cols }, () => []);
    for (let r = 0; r < BG_ROWS; r++) {
      for (let c = 0; c < cols; c++) {
        const isFront = (r + c) % 2 === 0;
        grid[c].push(isFront ? order[k++ % order.length] + ".jpg" : "ura.jpg");
      }
    }
    grid.forEach((items, i) => {
      const col = document.createElement("div");
      col.className = "bg-col";
      if (i % 2 === 1) col.classList.add("is-offset");
      items.concat(items).forEach((f) => { // duplicated for seamless loop
        const im = document.createElement("img");
        im.src = THUMB_DIR + f; im.alt = ""; im.decoding = "async";
        col.appendChild(im);
      });
      wrap.appendChild(col);
    });
  }
  // 奇数列をカード縦幅の半分だけ上にずらす（幅に応じて再計算）
  function updateBgOffset() {
    const wrap = $("bg-cards");
    if (!wrap || !bgCols) return;
    // 非表示中でも計算できるよう、画面幅からカード高さを求める
    const gap = parseFloat(getComputedStyle(wrap).getPropertyValue("--gap")) || 14;
    const colW = (window.innerWidth - gap * (bgCols + 1)) / bgCols;
    const h = colW * 1200 / 662;
    wrap.style.setProperty("--offset", (-h / 2).toFixed(1) + "px");
  }
  let bgTimer;
  window.addEventListener("resize", () => {
    clearTimeout(bgTimer);
    bgTimer = setTimeout(() => { buildBgGrid(); updateBgOffset(); if (!wash.active) fitSlots(); }, 200);
  });

  /* ---------- restore shared result from URL ---------- */
  function restoreFromUrl() {
    let m, ids, rev;
    const h = /^#?([a-z]+)_([\d.]+)_([01]+)$/.exec(location.hash);
    if (h) {
      m = h[1]; ids = h[2].split(".").map(Number); rev = h[3];
    } else {
      const q = new URLSearchParams(location.search);
      m = q.get("m"); ids = (q.get("c") || "").split(",").map(Number); rev = q.get("r") || "";
    }
    if (!m || !MODES[m]) return false;
    ids = ids.filter((n) => Number.isInteger(n) && n >= 0 && n < CARDS.length);
    if (ids.length !== MODES[m].count) return false;

    state.mode = m;
    state.picks = ids.map((id, i) => ({ id, reversed: rev[i] === "1" }));
    state.fromShare = true;

    el.modeEn.textContent = MODES[m].en;
    el.modeJa.textContent = MODES[m].label;
    el.instruction.textContent = "";
    el.spreadWrap.classList.add("is-gone");
    buildSlots(MODES[m]);
    state.picks.forEach((p, i) => fillSlot(i, p.id, p.reversed));
    el.slots.querySelectorAll(".slot-card").forEach((c) => c.classList.add("flipped", "no-anim"));

    const oldNotice = el.reading.querySelector(".shared-notice");
    if (oldNotice) oldNotice.remove();
    const notice = document.createElement("p");
    notice.className = "shared-notice";
    notice.textContent = "✦ シェアされた結果です ✦";
    el.reading.querySelector(".reading-head").appendChild(notice); // 見出しの段に入れる（結果画面の段数を固定するため）

    renderResult();
    $("btn-again").textContent = "自分も占ってみる";
    showScreen("reading");
    fitSlots();
    return true;
  }

  buildBgGrid();
  updateBgOffset();
  /* ---------- カード画像の保存防止 ---------- */
  // 右クリック／長押しのメニューはリンク以外では出さない（「画像を保存」を出さないため）
  // ※ カードは <button> なので、ボタンは除外しない
  document.addEventListener("contextmenu", (e) => {
    if (!e.target.closest("a")) e.preventDefault();
  });
  // 画像をデスクトップやタブにドラッグして保存できないようにする
  document.addEventListener("dragstart", (e) => {
    if (e.target.closest("img, .spread-card, .slot-card, .bg-cards")) e.preventDefault();
  });

  if (!restoreFromUrl()) document.body.classList.add("on-home");
  // 開いたままのページで別のシェアリンク（#one_…）に移ったときも、読み込み直さずに結果を表示する
  window.addEventListener("hashchange", () => {
    if (!/^#[a-z]+_[\d.]+_[01]+$/.test(location.hash)) return;
    stopWash();
    state.gen++;
    restoreFromUrl();
  });
  // フォントの読み込みで高さが変わるので、読み込み後にもう一度収め直す
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!wash.active) fitSlots(); });
  window.addEventListener("load", () => { if (!wash.active) fitSlots(); });
})();
