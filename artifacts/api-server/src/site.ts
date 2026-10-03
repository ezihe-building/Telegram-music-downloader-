export const botLandingPage = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f7f5ef">
    <meta name="description" content="Find songs, identify music from a short clip, and get audio in Telegram with Ezihe Music Bot.">
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%231c211d'/%3E%3Cpath d='M14 40V24l18 18V22l18 18V24' fill='none' stroke='%23b6f06c' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
    <meta property="og:title" content="Ezihe Music Bot — Find your next track">
    <meta property="og:description" content="Search by song or send a short clip. Your music scout is ready in Telegram.">
    <title>Ezihe Music Bot — Find your next track</title>
    <style>
      :root {
        color-scheme: light;
        --paper: #f7f5ef;
        --ink: #1c211d;
        --muted: #696e67;
        --line: #deded5;
        --green: #b6f06c;
        --deep-green: #203c2b;
        --card: #fffefa;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { margin: 0; color: var(--ink); background: var(--paper); }
      a { color: inherit; }
      .wrap { width: min(1120px, calc(100% - 40px)); margin: 0 auto; }
      header { height: 78px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }
      .brand { display: inline-flex; align-items: center; gap: 11px; text-decoration: none; font-size: 14px; font-weight: 800; letter-spacing: -.03em; }
      .brand-mark { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 50%; background: var(--ink); color: var(--green); }
      .brand-mark svg { width: 18px; height: 18px; }
      .nav { display: flex; align-items: center; gap: 28px; font-size: 13px; color: var(--muted); }
      .nav a { text-decoration: none; }
      .nav a:hover { color: var(--ink); }
      .nav-cta, .button { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 0 18px; border-radius: 999px; background: var(--ink); color: white !important; font-size: 13px; font-weight: 700; text-decoration: none; transition: transform .18s ease, background .18s ease; }
      .nav-cta:hover, .button:hover { transform: translateY(-2px); background: #344b38; }
      .hero { min-height: 570px; display: grid; grid-template-columns: 1.05fr .95fr; align-items: center; gap: 54px; padding: 68px 0 74px; }
      .eyebrow { display: inline-flex; align-items: center; gap: 9px; color: var(--deep-green); font-size: 11px; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
      .eyebrow-dot { width: 8px; height: 8px; border-radius: 50%; background: #67b84c; box-shadow: 0 0 0 4px #e5efd8; }
      h1 { max-width: 590px; margin: 22px 0 20px; font-size: clamp(48px, 6.2vw, 76px); font-weight: 650; line-height: .99; letter-spacing: -.075em; }
      h1 span { color: #5d795c; }
      .intro { max-width: 495px; margin: 0; color: var(--muted); font-size: 17px; line-height: 1.7; }
      .hero-actions { display: flex; align-items: center; gap: 17px; margin-top: 30px; }
      .text-link { display: inline-flex; align-items: center; gap: 7px; color: var(--muted); font-size: 13px; font-weight: 650; text-decoration: none; }
      .text-link:hover { color: var(--ink); }
      .fine-print { margin-top: 25px; color: #858a81; font-size: 11px; }
      .art { position: relative; min-height: 382px; display: grid; place-items: center; overflow: hidden; border: 1px solid #e4e0d5; border-radius: 28px; background: radial-gradient(ellipse at 54% 44%, #e5edcf 0, #dce5d0 28%, #e9e9da 58%, #eeece3 100%); }
      .art::before, .art::after { position: absolute; content: ""; border: 1px solid rgba(55, 74, 50, .13); border-radius: 50%; }
      .art::before { width: 345px; height: 345px; }
      .art::after { width: 425px; height: 425px; }
      .record { position: relative; z-index: 1; width: 226px; aspect-ratio: 1; display: grid; place-items: center; border-radius: 50%; background: repeating-radial-gradient(circle, #20271f 0 1px, #252d24 2px 4px, #171d18 5px 6px); box-shadow: 0 25px 60px rgba(35, 48, 34, .24); transform: rotate(-12deg); }
      .record-center { width: 83px; aspect-ratio: 1; display: grid; place-items: center; border-radius: 50%; background: var(--green); color: #263322; }
      .record-center svg { width: 34px; height: 34px; }
      .note { position: absolute; z-index: 2; padding: 12px 15px; border: 1px solid rgba(255,255,255,.8); border-radius: 14px; background: rgba(255,254,250,.88); box-shadow: 0 14px 35px rgba(43, 49, 38, .1); backdrop-filter: blur(10px); }
      .note small { display: block; margin-bottom: 4px; color: #858a81; font-size: 9px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
      .note strong { font-size: 13px; letter-spacing: -.02em; }
      .note-top { top: 47px; right: 34px; transform: rotate(4deg); }
      .note-bottom { bottom: 42px; left: 30px; transform: rotate(-4deg); }
      .wave { display: flex; height: 24px; align-items: center; gap: 3px; margin-top: 6px; }
      .wave i { width: 3px; height: var(--h); border-radius: 8px; background: #718a61; }
      .section { padding: 77px 0; border-top: 1px solid var(--line); }
      .section-heading { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 29px; }
      .section-kicker { margin: 0 0 11px; color: #6d8061; font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
      h2 { margin: 0; font-size: clamp(30px, 4vw, 43px); font-weight: 620; letter-spacing: -.06em; }
      .section-heading > p { max-width: 350px; margin: 0 0 3px; color: var(--muted); font-size: 14px; line-height: 1.65; }
      .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
      .feature { min-height: 186px; padding: 25px; border: 1px solid var(--line); border-radius: 19px; background: var(--card); }
      .feature-icon { width: 36px; height: 36px; display: grid; place-items: center; margin-bottom: 22px; border-radius: 12px; background: #edf2e5; color: var(--deep-green); }
      .feature-icon svg { width: 18px; height: 18px; }
      .feature h3 { margin: 0 0 8px; font-size: 16px; letter-spacing: -.03em; }
      .feature p { max-width: 280px; margin: 0; color: var(--muted); font-size: 13px; line-height: 1.6; }
      .how { display: grid; grid-template-columns: .75fr 1.25fr; gap: 65px; align-items: start; }
      .steps { display: grid; gap: 0; }
      .step { display: grid; grid-template-columns: 42px 1fr; gap: 15px; padding: 0 0 24px; }
      .step + .step { padding-top: 22px; border-top: 1px solid var(--line); }
      .step-num { width: 32px; height: 32px; display: grid; place-items: center; border: 1px solid #d3d8cb; border-radius: 50%; color: #55724e; font-size: 12px; font-weight: 750; }
      .step h3 { margin: 1px 0 6px; font-size: 15px; }
      .step p { max-width: 440px; margin: 0; color: var(--muted); font-size: 13px; line-height: 1.65; }
      .bottom-cta { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 27px 30px; border-radius: 21px; background: var(--deep-green); color: #fff; }
      .bottom-cta h2 { font-size: 25px; letter-spacing: -.045em; }
      .bottom-cta p { margin: 7px 0 0; color: #cbd5c6; font-size: 13px; }
      .bottom-cta .button { background: var(--green); color: #1c291d !important; white-space: nowrap; }
      .bottom-cta .button:hover { background: #c7fa8d; }
      footer { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 25px 0 31px; color: #82877f; font-size: 11px; }
      .health { display: inline-flex; align-items: center; gap: 7px; }
      .health-dot { width: 7px; height: 7px; border-radius: 50%; background: #a5aaa1; }
      .health.online .health-dot { background: #63aa46; box-shadow: 0 0 0 3px #e2efd9; }
      .health.offline .health-dot { background: #cb6c59; }
      @media (max-width: 760px) {
        .wrap { width: min(100% - 32px, 560px); }
        header { height: 68px; }
        .nav { gap: 14px; }
        .nav > a:not(.nav-cta) { display: none; }
        .nav-cta { min-height: 39px; padding: 0 14px; font-size: 12px; }
        .hero { min-height: 0; grid-template-columns: 1fr; gap: 35px; padding: 62px 0 55px; }
        h1 { max-width: 520px; font-size: clamp(47px, 13vw, 70px); }
        .intro { font-size: 15px; }
        .art { min-height: 320px; }
        .record { width: 190px; }
        .record-center { width: 72px; }
        .note-top { top: 27px; right: 20px; }
        .note-bottom { bottom: 26px; left: 19px; }
        .section { padding: 55px 0; }
        .section-heading { display: block; }
        .section-heading > p { margin-top: 14px; }
        .feature-grid { grid-template-columns: 1fr; }
        .feature { min-height: 0; }
        .feature-icon { margin-bottom: 16px; }
        .how { grid-template-columns: 1fr; gap: 27px; }
        .bottom-cta { align-items: flex-start; flex-direction: column; padding: 24px; }
        footer { align-items: flex-start; flex-direction: column; }
      }
      @media (prefers-reduced-motion: reduce) {
        html { scroll-behavior: auto; }
        *, *::before, *::after { transition-duration: .01ms !important; }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <header>
        <a class="brand" href="/" aria-label="Ezihe Music Bot home">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 16V8l7 8V8l7 8V8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span>EZIHE <span style="font-weight:500;color:#73786f">MUSIC BOT</span></span>
        </a>
        <nav class="nav" aria-label="Main navigation">
          <a href="#features">What it does</a>
          <a href="#how">How it works</a>
          <a class="nav-cta" href="https://t.me/Phicodm_bot" target="_blank" rel="noreferrer">Open in Telegram <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <main>
        <section class="hero" aria-labelledby="hero-title">
          <div>
            <div class="eyebrow"><span class="eyebrow-dot" aria-hidden="true"></span>Your music scout in Telegram</div>
            <h1 id="hero-title">Find your next <span>favorite.</span></h1>
            <p class="intro">Send a song name, an artist, or a short clip. Ezihe finds a match and brings the sound back to your Telegram chat.</p>
            <div class="hero-actions">
              <a class="button" href="https://t.me/Phicodm_bot" target="_blank" rel="noreferrer">Start listening <span aria-hidden="true">↗</span></a>
              <a class="text-link" href="#how">See how it works <span aria-hidden="true">↓</span></a>
            </div>
            <p class="fine-print">Search tracks · identify clips · keep a playlist</p>
          </div>
          <div class="art" aria-label="Illustration of a spinning record and audio waveform" role="img">
            <div class="record"><div class="record-center"><svg viewBox="0 0 24 24" fill="none"><path d="M5 16V8l7 8V8l7 8V8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>
            <div class="note note-top"><small>From a feeling to a song</small><strong>Brazilian phonk</strong><div class="wave" aria-hidden="true"><i style="--h:8px"></i><i style="--h:16px"></i><i style="--h:11px"></i><i style="--h:21px"></i><i style="--h:13px"></i><i style="--h:24px"></i><i style="--h:10px"></i><i style="--h:18px"></i><i style="--h:7px"></i><i style="--h:15px"></i><i style="--h:22px"></i><i style="--h:9px"></i><i style="--h:16px"></i><i style="--h:11px"></i></div></div>
            <div class="note note-bottom"><small>Send a clip</small><strong>We’ll try to name it.</strong></div>
          </div>
        </section>

        <section class="section" id="features" aria-labelledby="features-title">
          <div class="section-heading">
            <div><p class="section-kicker">A little music magic</p><h2 id="features-title">Your next song is one message away.</h2></div>
            <p>No complicated setup. Find a sound, choose a match, and listen right in Telegram.</p>
          </div>
          <div class="feature-grid">
            <article class="feature">
              <div class="feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4.4 4.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div>
              <h3>Search by song or mood</h3><p>Type a title, artist, genre, or the kind of sound you’re after. Pick a match from the results.</p>
            </article>
            <article class="feature">
              <div class="feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M4 10v4m4-8v12m4-15v18m4-14v10m4-7v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div>
              <h3>Recognize a short clip</h3><p>Send a clear audio or video snippet and Ezihe will try to identify the song for you.</p>
            </article>
            <article class="feature">
              <div class="feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M7 4.5h10a2 2 0 0 1 2 2v13l-7-4-7 4v-13a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div>
              <h3>Save the ones you love</h3><p>Keep your favorite finds in your chat playlist and get lyrics links with your audio.</p>
            </article>
          </div>
        </section>

        <section class="section" id="how" aria-labelledby="how-title">
          <div class="how">
            <div><p class="section-kicker">Easy as play</p><h2 id="how-title">Three steps to your soundtrack.</h2></div>
            <div class="steps">
              <article class="step"><span class="step-num">01</span><div><h3>Open the bot</h3><p>Tap the button below to start a conversation with Ezihe on Telegram.</p></div></article>
              <article class="step"><span class="step-num">02</span><div><h3>Send a song or clip</h3><p>Search with a few words, or send a short clip if you don’t know the title.</p></div></article>
              <article class="step"><span class="step-num">03</span><div><h3>Choose a match and listen</h3><p>Pick a result to receive audio in the chat. Save tracks to revisit your favorites.</p></div></article>
            </div>
          </div>
          <div class="bottom-cta">
            <div><h2>Ready when you are.</h2><p>Find Ezihe Music Bot on Telegram and send your first track.</p></div>
            <a class="button" href="https://t.me/Phicodm_bot" target="_blank" rel="noreferrer">Open @Phicodm_bot <span aria-hidden="true">↗</span></a>
          </div>
        </section>
      </main>

      <footer>
        <span>© Ezihe Music Bot</span>
        <span>Audio availability depends on source access and platform restrictions.</span>
        <span class="health" id="service-health" role="status" aria-live="polite"><i class="health-dot" aria-hidden="true"></i><span>Checking service…</span></span>
      </footer>
    </div>
    <script>
      const health = document.getElementById("service-health");
      fetch("/api/healthz", { headers: { accept: "application/json" } })
        .then((response) => {
          if (!response.ok) throw new Error("health check failed");
          return response.json();
        })
        .then((result) => {
          const label = health.querySelector("span:last-child");
          if (result.status === "ok") {
            health.classList.add("online");
            label.textContent = "Website service online";
          } else {
            health.classList.add("offline");
            label.textContent = "Service status unavailable";
          }
        })
        .catch(() => {
          health.classList.add("offline");
          health.querySelector("span:last-child").textContent = "Service status unavailable";
        });
    </script>
  </body>
</html>`;