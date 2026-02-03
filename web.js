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
  // - Stays within its parent button row (no overflow/clipping)
  // - Remains visible and clickable for at least 5 attempts (and beyond)
  // - Works for both mouse and touch using pointer events
  const buttonRow = document.querySelector(".button-row");
  let noAttempts = 0;

  function activateNoBtn() {
    if (noBtnActivated) return;
    noBtnActivated = true;

    if (!buttonRow) return;

    // Lock the button into absolute positioning within its parent container
    const containerRect = buttonRow.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    const initialLeft = btnRect.left - containerRect.left;
    const initialTop = btnRect.top - containerRect.top;

    buttonRow.style.position = "relative"; // ensure parent is positioning context
    noBtn.style.position = "absolute";
    noBtn.style.left = `${initialLeft}px`;
    noBtn.style.top = `${initialTop}px`;
  }

  function jumpNoButtonOnce() {
    if (!buttonRow) return;
    activateNoBtn();
    noBtnIsMoving = true;

    const containerRect = buttonRow.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const padding = 6; // inner padding so we never touch edges

    const maxLeft = Math.max(0, containerWidth - btnRect.width - padding);
    const maxTop = Math.max(0, containerHeight - btnRect.height - padding);

    const currentLeft = btnRect.left - containerRect.left;
    const currentTop = btnRect.top - containerRect.top;

    let targetLeft;
    let targetTop;
    // Ensure noticeable movement
    do {
      targetLeft = padding + Math.random() * maxLeft;
      targetTop = padding + Math.random() * maxTop;
    } while (
      Math.abs(targetLeft - currentLeft) < 24 &&
      Math.abs(targetTop - currentTop) < 24
    );

    noBtn.classList.add("shake");
    setTimeout(() => noBtn.classList.remove("shake"), 260);

    animateNoButton(currentLeft, currentTop, targetLeft, targetTop, 260);

    noAttempts += 1;

    // After 5+ attempts, gently guide the user toward "Yes" with a message
    if (noAttempts >= 5) {
      teaseText.textContent =
        "Okay, you tried. Maybe Goa on the Yes side isn’t such a bad idea 😇";
    } else {
      const message =
        funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
      teaseText.textContent = message;
    }
  }

  function animateNoButton(fromLeft, fromTop, toLeft, toTop, duration) {
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

  // Use pointer events for unified mouse + touch handling
  noBtn.addEventListener("pointerdown", handleNoPress);


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
