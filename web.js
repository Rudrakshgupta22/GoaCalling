// Device type helper
function getDeviceType() {
  const w = window.innerWidth;
  if (w <= 768) return "mobile";
  if (w <= 1024) return "tablet";
  return "desktop";
}

// OPTIONAL: backend logging
// Set this to your backend URL if you add one, or leave empty to disable.
const ANALYTICS_BASE_URL = ""; // e.g. "https://your-api.com"

async function logResponse(answer) {
  if (!ANALYTICS_BASE_URL) return;
  try {
    await fetch(`${ANALYTICS_BASE_URL}/api/response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answer,
        deviceType: getDeviceType(),
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.warn("Logging failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const yesBtn = document.getElementById("yes-btn");
  const noBtn = document.getElementById("no-btn");
  const teaseText = document.getElementById("tease-text");
  const introSection = document.getElementById("intro-section");
  const tripSection = document.getElementById("trip-section");
  const confettiCanvas = document.getElementById("confetti-canvas");
  const shareWhatsappBtn = document.getElementById("share-whatsapp");
  const goaVideo = document.getElementById("goa-video");

  const isMobile = getDeviceType() === "mobile";
  let noBtnActivated = false;
  let noBtnIsMoving = false;

  const funnyMessages = [
    "Try again 😜",
    "You know you want to 😉",
    "Goa is calling 📞",
    "The beach misses you 🌴",
    "Sunsets > excuses 🌅",
    "Come on, live a little ✨",
  ];

  // Confetti setup
  const confettiCtx = confettiCanvas.getContext("2d");
  let confettiParticles = [];
  let confettiRunning = false;

  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function createConfettiBurst() {
    const count = isMobile ? 0 : 140; // disable confetti on mobile for smoother video
    confettiParticles = [];
    const colors = ["#ffb347", "#ff5f6d", "#24c6dc", "#ffffff", "#ffe29f"];

    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 3,
        angle: Math.random() * Math.PI * 2,
        speed: 4 + Math.random() * 3.5,
        radius: 3 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: -6 + Math.random() * 12,
        life: 0,
        maxLife: 60 + Math.random() * 40,
      });
    }
  }

  function drawConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiParticles.forEach((p) => {
      const progress = p.life / p.maxLife;
      const alpha = 1 - progress;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.fillStyle = `rgba(${hexToRgb(p.color)}, ${alpha})`;
      confettiCtx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
      confettiCtx.restore();
    });
  }

  function updateConfetti() {
    confettiParticles.forEach((p) => {
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed + 0.2; // slight gravity
      p.rotation += p.rotationSpeed;
      p.life++;
    });

    confettiParticles = confettiParticles.filter((p) => p.life < p.maxLife);
    if (confettiParticles.length === 0) {
      confettiRunning = false;
    }
  }

  function confettiLoop() {
    if (!confettiRunning) return;
    updateConfetti();
    drawConfetti();
    requestAnimationFrame(confettiLoop);
  }

  function startConfetti() {
    if (isMobile) return; // skip confetti entirely on mobile to keep playback smooth
    createConfettiBurst();
    confettiRunning = true;
    confettiLoop();
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }

  // Yes button click
  yesBtn.addEventListener("click", async () => {
    yesBtn.classList.add("clicked");
    setTimeout(() => yesBtn.classList.remove("clicked"), 450);

    await logResponse("yes");

    introSection.classList.add("hidden");
    tripSection.classList.remove("hidden");
    void tripSection.offsetWidth; // reflow for transition
    tripSection.classList.add("visible");

    // start video playback (with sound, inline) on user click
    if (goaVideo) {
      try {
        goaVideo.currentTime = 0;
        const playPromise = goaVideo.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch((err) => {
            console.warn("Video play failed:", err);
          });
        }
      } catch (err) {
        console.warn("Video play error:", err);
      }
    }

    startConfetti();
  });

  // No button evasive behavior
  // Desktop: moves within the intro card.
  // Mobile: moves within the viewport using window.innerWidth/innerHeight.
  // In both cases it remains visible, clickable, and never leaves the screen.
  let noAttempts = 0; // number of failed attempts
  let noBtnInitialized = false;

  /**
   * Initialize positioning once so subsequent moves are in pixels
   * and independent of layout changes.
   */
  function initNoButtonPositioning() {
    if (noBtnInitialized) return;
    noBtnInitialized = true;

    const rect = noBtn.getBoundingClientRect();

    if (isMobile) {
      // Mobile: position relative to viewport
      noBtn.style.position = "fixed";
      noBtn.style.left = `${rect.left}px`;
      noBtn.style.top = `${rect.top}px`;
      noBtn.style.margin = "0";
      noBtn.style.zIndex = "999"; // stay above other content
    } else {
      // Desktop: keep it inside the intro card
      const container = introSection;
      const containerRect = container.getBoundingClientRect();
      const initialLeft = rect.left - containerRect.left;
      const initialTop = rect.top - containerRect.top;

      container.style.position = "relative";
      noBtn.style.position = "absolute";
      noBtn.style.left = `${initialLeft}px`;
      noBtn.style.top = `${initialTop}px`;
    }
  }

  /**
   * Compute a new target position for the No button and animate to it.
   * - On mobile: stays within viewport safe area and avoids overlapping Yes.
   * - On desktop: stays within intro card and avoids overlapping Yes.
   */
  function jumpNoButtonOnce() {
    initNoButtonPositioning();
    noBtnIsMoving = true;

    if (isMobile) {
      jumpNoButtonMobile();
    } else {
      jumpNoButtonDesktop();
    }

    noAttempts += 1;

    // After 5+ attempts, gently guide user towards Yes
    if (noAttempts >= 5) {
      teaseText.textContent =
        "Okay, you tried. Maybe Goa on the Yes side isn’t such a bad idea 😇";
    } else {
      const message =
        funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
      teaseText.textContent = message;
    }
  }

  function jumpNoButtonMobile() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const btnRect = noBtn.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();

    // Safe band to avoid browser UI bars & edges
    const paddingX = 12;
    const safeTop = 80;
    const safeBottom = 80;

    const maxLeft = Math.max(0, vw - btnRect.width - paddingX);
    const maxTop = Math.max(0, vh - btnRect.height - safeBottom);

    const currentLeft = parseFloat(noBtn.style.left) || btnRect.left;
    const currentTop = parseFloat(noBtn.style.top) || btnRect.top;

    let targetLeft;
    let targetTop;
    let tries = 0;

    while (true) {
      targetLeft = paddingX + Math.random() * maxLeft;
      targetTop = safeTop + Math.random() * Math.max(0, maxTop - safeTop);

      const targetRight = targetLeft + btnRect.width;
      const targetBottom = targetTop + btnRect.height;

      const yesLeft = yesRect.left;
      const yesTop = yesRect.top;
      const yesRight = yesRect.right;
      const yesBottom = yesRect.bottom;

      const overlapsYes =
        targetLeft < yesRight &&
        targetRight > yesLeft &&
        targetTop < yesBottom &&
        targetBottom > yesTop;

      const movedEnough =
        Math.abs(targetLeft - currentLeft) >= 24 ||
        Math.abs(targetTop - currentTop) >= 24;

      if (!overlapsYes && movedEnough) {
        break;
      }

      tries += 1;
      // Failsafe: after enough tries, accept any position that moves enough
      if (tries > 30 && movedEnough) {
        break;
      }
    }

    noBtn.classList.add("shake");
    setTimeout(() => noBtn.classList.remove("shake"), 260);

    animateNoButton(currentLeft, currentTop, targetLeft, targetTop, 260, true);
  }

  function jumpNoButtonDesktop() {
    const container = introSection;
    const containerRect = container.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();

    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const padding = 12;
    const maxLeft = Math.max(0, containerWidth - btnRect.width - padding);
    const maxTop = Math.max(0, containerHeight - btnRect.height - padding);

    const currentLeft = btnRect.left - containerRect.left;
    const currentTop = btnRect.top - containerRect.top;

    const yesLeft = yesRect.left - containerRect.left;
    const yesTop = yesRect.top - containerRect.top;
    const yesRight = yesLeft + yesRect.width;
    const yesBottom = yesTop + yesRect.height;

    let targetLeft;
    let targetTop;
    let tries = 0;

    while (true) {
      targetLeft = padding + Math.random() * maxLeft;
      targetTop = padding + Math.random() * maxTop;

      const targetRight = targetLeft + btnRect.width;
      const targetBottom = targetTop + btnRect.height;

      const overlapsYes =
        targetLeft < yesRight &&
        targetRight > yesLeft &&
        targetTop < yesBottom &&
        targetBottom > yesTop;

      const movedEnough =
        Math.abs(targetLeft - currentLeft) >= 24 ||
        Math.abs(targetTop - currentTop) >= 24;

      if (!overlapsYes && movedEnough) {
        break;
      }

      tries += 1;
      if (tries > 30 && movedEnough) {
        break;
      }
    }

    noBtn.classList.add("shake");
    setTimeout(() => noBtn.classList.remove("shake"), 260);

    animateNoButton(currentLeft, currentTop, targetLeft, targetTop, 260, false);
  }

  function animateNoButton(fromLeft, fromTop, toLeft, toTop, duration, isFixed) {
    const start = performance.now();

    function frame(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - t) * (1 - t); // easeOutQuad

      const currentLeft = fromLeft + (toLeft - fromLeft) * eased;
      const currentTop = fromTop + (toTop - fromTop) * eased;

      noBtn.style.left = `${currentLeft}px`;
      noBtn.style.top = `${currentTop}px`;

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        noBtnIsMoving = false;
      }
    }

    requestAnimationFrame(frame);
  }

  function handleNoPress(e) {
    e.preventDefault();

    // Ignore extra taps while the button is mid-jump, to avoid double-triggering
    if (noBtnIsMoving) return;

    jumpNoButtonOnce();
    logResponse("no");
  }

  // Prefer pointer events when available (covers mouse + touch)
  if (window.PointerEvent) {
    noBtn.addEventListener("pointerdown", handleNoPress);
  } else {
    // Fallback for very old browsers: use touchstart + click with a simple guard
    let touchHandled = false;

    noBtn.addEventListener("touchstart", (e) => {
      touchHandled = true;
      handleNoPress(e);
    });

    noBtn.addEventListener("click", (e) => {
      if (touchHandled) {
        // Ignore the synthetic click that follows touchstart
        touchHandled = false;
        return;
      }
      handleNoPress(e);
    });
  }


  if (shareWhatsappBtn) {
    shareWhatsappBtn.addEventListener("click", () => {
      const text = encodeURIComponent(
        `I'm planning a Goa escape! 🌴✨ Wanna join me?\n\nCheck this out: ${window.location.href}`
      );
      const url = `https://wa.me/?text=${text}`;
      window.open(url, "_blank");
    });
  }
});
