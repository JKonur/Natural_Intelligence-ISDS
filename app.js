/**
 * JACKSON KONUR — INTERACTIVE SCRIPTS & PHYSICS ENGINE
 * Features:
 * - Realtime Zero-G Particle Simulation & Constellation Mesh
 * - Dynamic 3D Card Tilt with Perspective Mathematics
 * - Interactive Terminal (CLI) with Command History & Easter Eggs
 * - Hologram Gyroscope Deflection
 * - Animated Number Counters
 * - Clipboard Toast Notifications
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initCustomCursor();
  init3DTilt();
  initHologramParallax();
  initTabs();
  initMetricCounters();
  initTerminal();
  initHeaderScroll();
  initContactActions();
});

/* ==========================================================================
   ZERO-G PARTICLE & CONSTELLATION SIMULATION
   ========================================================================== */
let isZeroGravity = true;
let triggerShockwave = null;

function initParticleCanvas() {
  const canvas = document.getElementById('gravity-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const mouse = { x: width / 2, y: height / 2, active: false, radius: 150 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Particle pool
  const particleCount = Math.min(Math.floor((width * height) / 11000), 120);
  const particles = [];

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.radius = Math.random() * 2.2 + 0.8;
      this.baseVy = -(Math.random() * 0.4 + 0.2); // drifting up
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = this.baseVy;
      this.alpha = Math.random() * 0.6 + 0.2;
      this.hue = Math.random() > 0.4 ? 185 : 275; // Cyan or violet
      this.friction = 0.98;
    }

    update() {
      if (isZeroGravity) {
        // Zero-G drift: upward buoyancy
        this.vy += this.baseVy * 0.04;
      } else {
        // Normal gravity: slow downward settling
        this.vy += 0.08;
      }

      this.vx *= this.friction;
      this.vy *= this.friction;

      // Mouse interactive force field
      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          // Push particles away smoothly
          this.vx -= Math.cos(angle) * force * 1.8;
          this.vy -= Math.sin(angle) * force * 1.8;
        }
      }

      this.x += this.vx;
      this.y += this.vy;

      // Wrap-around bounds
      if (this.y < -20) this.reset(false);
      if (this.y > height + 20) this.y = -10;
      if (this.x < -20) this.x = width + 10;
      if (this.x > width + 20) this.x = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.alpha})`;
      ctx.shadowBlur = this.radius * 4;
      ctx.shadowColor = `hsla(${this.hue}, 100%, 65%, 0.8)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Shockwave implementation
  const shockwaves = [];
  triggerShockwave = (originX, originY) => {
    shockwaves.push({
      x: originX || width / 2,
      y: originY || height / 2,
      radius: 5,
      maxRadius: Math.max(width, height) * 0.6,
      alpha: 1,
      speed: 18,
    });
  };

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update & draw shockwaves
    for (let s = shockwaves.length - 1; s >= 0; s--) {
      const sw = shockwaves[s];
      sw.radius += sw.speed;
      sw.alpha -= 0.02;

      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 242, 254, ${Math.max(0, sw.alpha * 0.7)})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Shockwave impulse on nearby particles
      particles.forEach((p) => {
        const dx = p.x - sw.x;
        const dy = p.y - sw.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (Math.abs(dist - sw.radius) < 40) {
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * 8;
          p.vy += Math.sin(angle) * 8;
        }
      });

      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        shockwaves.splice(s, 1);
      }
    }

    // Connect close particles with delicate luminous filaments
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          const alpha = (1 - dist / 110) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(138, 43, 226, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Update & draw particles
    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();

  // Gravity Toggle Button Handling
  const gravityToggleBtn = document.getElementById('gravity-toggle-btn');
  const gravityBtnText = document.getElementById('gravity-btn-text');
  const zeroGPulseBtn = document.getElementById('zero-g-pulse-btn');

  function updateGravityState(active) {
    isZeroGravity = active;
    if (gravityBtnText) {
      gravityBtnText.textContent = isZeroGravity ? 'Zero-G Mode' : 'Earth Gravity';
    }
    if (gravityToggleBtn) {
      gravityToggleBtn.style.borderColor = isZeroGravity ? 'var(--accent-cyan)' : 'var(--accent-amber)';
      gravityToggleBtn.style.color = isZeroGravity ? 'var(--accent-cyan)' : 'var(--accent-amber)';
    }
  }

  if (gravityToggleBtn) {
    gravityToggleBtn.addEventListener('click', (e) => {
      updateGravityState(!isZeroGravity);
      triggerShockwave(e.clientX, e.clientY);
      showToast(isZeroGravity ? 'Zero-Gravity Engine Activated 🪐' : 'Standard Gravity Restored 🌍');
    });
  }

  if (zeroGPulseBtn) {
    zeroGPulseBtn.addEventListener('click', (e) => {
      const rect = zeroGPulseBtn.getBoundingClientRect();
      triggerShockwave(rect.left + rect.width / 2, rect.top + rect.height / 2);
      showToast('Disruption Wave Emitted ⚡');
    });
  }
}

/* ==========================================================================
   CUSTOM CURSOR FOLLOWER
   ========================================================================== */
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const glow = document.getElementById('cursor-glow');
  if (!dot || !glow) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX = mouseX;
  let glowY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  // Lerping glow follower
  function updateGlow() {
    glowX += (mouseX - glowX) * 0.18;
    glowY += (mouseY - glowY) * 0.18;
    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;
    requestAnimationFrame(updateGlow);
  }
  updateGlow();

  // Enlarge cursor on interactive targets
  const interactables = document.querySelectorAll('a, button, input, .chip-btn, .metric-card, .feature-card, .project-showcase-card');
  interactables.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      glow.style.width = '60px';
      glow.style.height = '60px';
      glow.style.borderColor = 'var(--accent-cyan)';
      glow.style.backgroundColor = 'rgba(0, 242, 254, 0.12)';
    });
    el.addEventListener('mouseleave', () => {
      glow.style.width = '40px';
      glow.style.height = '40px';
      glow.style.borderColor = 'rgba(0, 242, 254, 0.3)';
      glow.style.backgroundColor = 'transparent';
    });
  });
}

/* ==========================================================================
   DYNAMIC 3D PERSPECTIVE CARD TILT
   ========================================================================== */
function init3DTilt() {
  const tiltCards = document.querySelectorAll('[data-tilt]');
  if (!tiltCards.length) return;

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg tilt
      const rotateY = ((x - centerX) / centerX) * 9;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* ==========================================================================
   HOLOGRAM GYROSCOPE DEFLECTION
   ========================================================================== */
function initHologramParallax() {
  const stage = document.getElementById('hologram-stage');
  if (!stage) return;

  window.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / window.innerWidth - 0.5) * 2;
    const normY = (e.clientY / window.innerHeight - 0.5) * 2;

    const rotX = -normY * 20;
    const rotY = normX * 25;

    stage.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });
}

/* ==========================================================================
   CAPABILITIES TAB SYSTEM
   ========================================================================== */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetTabId = button.getAttribute('data-tab');

      // Update button active state
      tabButtons.forEach((btn) => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');

      // Update panel visibility
      tabPanels.forEach((panel) => {
        if (panel.id === `tab-${targetTabId}`) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });
}

/* ==========================================================================
   ANIMATED METRIC COUNTERS
   ========================================================================== */
function initMetricCounters() {
  const counters = document.querySelectorAll('.metric-val');
  if (!counters.length) return;

  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        counters.forEach((counter) => {
          const target = parseFloat(counter.getAttribute('data-target'));
          const isDecimal = target % 1 !== 0;
          const duration = 1800; // ms
          const startTime = performance.now();

          function updateCounter(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = target * ease;

            counter.textContent = isDecimal ? current.toFixed(2) : Math.floor(current);

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = isDecimal ? target.toFixed(2) : target;
            }
          }

          requestAnimationFrame(updateCounter);
        });
      }
    });
  }, { threshold: 0.3 });

  const metricsGrid = document.getElementById('metrics-grid');
  if (metricsGrid) observer.observe(metricsGrid);
}

/* ==========================================================================
   INTERACTIVE KONUR CLI TERMINAL
   ========================================================================== */
const commandHistory = [];
let historyIndex = -1;

function initTerminal() {
  const terminalForm = document.getElementById('terminal-form');
  const terminalInput = document.getElementById('terminal-input');
  if (!terminalForm || !terminalInput) return;

  terminalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const command = terminalInput.value.trim();
    if (command) {
      commandHistory.push(command);
      historyIndex = commandHistory.length;
      executeCommand(command);
      terminalInput.value = '';
    }
  });

  // History navigation with arrow keys
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      if (historyIndex > 0) {
        historyIndex--;
        terminalInput.value = commandHistory[historyIndex] || '';
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        terminalInput.value = commandHistory[historyIndex] || '';
      } else {
        historyIndex = commandHistory.length;
        terminalInput.value = '';
      }
      e.preventDefault();
    }
  });
}

// Global execution accessible from chips & buttons
window.runTerminalCommand = function (cmdText) {
  const terminalInput = document.getElementById('terminal-input');
  if (terminalInput) {
    terminalInput.value = cmdText;
    executeCommand(cmdText);
    terminalInput.value = '';
    // Scroll to terminal smoothly
    const terminalSection = document.getElementById('terminal-section');
    if (terminalSection) {
      terminalSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

function executeCommand(rawCommand) {
  const output = document.getElementById('terminal-output');
  if (!output) return;

  const cmd = rawCommand.toLowerCase().trim();

  // Print command user entered
  appendTerminalLine(`<span class="term-prompt-prefix">jackson@konur:~$</span> <span style="color:#fff;">${escapeHtml(rawCommand)}</span>`);

  switch (cmd) {
    case 'help':
      appendTerminalLine(`<span class="accent-cyan">Available System Directives:</span>`);
      appendTerminalLine(`  <span class="term-highlight">about</span>      - View Jackson Konur's background & technical ethos`);
      appendTerminalLine(`  <span class="term-highlight">skills</span>     - Inspect verified competencies & architecture stack`);
      appendTerminalLine(`  <span class="term-highlight">projects</span>   - Display active and completed software initiatives`);
      appendTerminalLine(`  <span class="term-highlight">gravity</span>    - Toggle zero-gravity physics simulation`);
      appendTerminalLine(`  <span class="term-highlight">matrix</span>     - Initialize matrix telemetry stream`);
      appendTerminalLine(`  <span class="term-highlight">contact</span>    - Show direct transmission coordinates`);
      appendTerminalLine(`  <span class="term-highlight">date</span>       - Query local node timestamp`);
      appendTerminalLine(`  <span class="term-highlight">whoami</span>     - Current user session details`);
      appendTerminalLine(`  <span class="term-highlight">clear</span>      - Flush terminal buffer`);
      break;

    case 'about':
      appendTerminalLine(`<span class="accent-cyan">[IDENTITY DISCLOSURE]</span>`);
      appendTerminalLine(`Name: <strong style="color:#fff">Jackson Konur</strong>`);
      appendTerminalLine(`Focus: Information Systems, Decision Science & Intelligent Agent Frameworks.`);
      appendTerminalLine(`Philosophy: Building systems that combine mathematical rigor with sensory elegance.`);
      break;

    case 'skills':
      appendTerminalLine(`<span class="accent-cyan">[SYSTEM COMPETENCY MATRIX]</span>`);
      appendTerminalLine(`• <strong style="color:#38bdf8">Languages:</strong> Python, JavaScript (ESNext), TypeScript, SQL, Bash`);
      appendTerminalLine(`• <strong style="color:#a855f7">Architectures:</strong> Distributed Systems, Event Streaming, REST/gRPC`);
      appendTerminalLine(`• <strong style="color:#34d399">Data & ML:</strong> Time-series telemetry, Vector Embeddings, Predictive Modeling`);
      appendTerminalLine(`• <strong style="color:#f59e0b">Frontend:</strong> Canvas 2D/WebGL, CSS Mathematics, Responsive Systems`);
      break;

    case 'projects':
    case 'project nebula':
    case 'project chronos':
      appendTerminalLine(`<span class="accent-cyan">[DEPLOYED INITIATIVES]</span>`);
      appendTerminalLine(`1. <strong style="color:#fff">AntiGravity Engine: ISDS Nexus</strong>`);
      appendTerminalLine(`   Status: <span style="color:#34d399">OPERATIONAL</span> | Latency: 0.12ms | Distributed Task Graph`);
      appendTerminalLine(`2. <strong style="color:#fff">Chronos: Predictive Signal Fabric</strong>`);
      appendTerminalLine(`   Status: <span style="color:#38bdf8">MONITORING</span> | Kafka Streaming + Anomalous Signal Detection`);
      break;

    case 'gravity':
      isZeroGravity = !isZeroGravity;
      const gBtnText = document.getElementById('gravity-btn-text');
      if (gBtnText) gBtnText.textContent = isZeroGravity ? 'Zero-G Mode' : 'Earth Gravity';
      if (triggerShockwave) triggerShockwave(window.innerWidth / 2, window.innerHeight / 2);
      appendTerminalLine(`<span style="color:#34d399;">Physics engine state changed: Zero-G = ${isZeroGravity}</span>`);
      showToast(isZeroGravity ? 'Zero-G Active 🪐' : 'Standard Gravity 🌍');
      break;

    case 'matrix':
      appendTerminalLine(`<span style="color:#34d399;">Awakening telemetry stream...</span>`);
      const matrixChars = "01001010 01000001 01000011 01001011 01010011 01001111 01001110";
      appendTerminalLine(`<span style="color:#34d399; font-family:monospace;">JACKSON_BINARY // ${matrixChars}</span>`);
      appendTerminalLine(`<span style="color:#34d399;">System stability at 100%. Reality parameters verified.</span>`);
      break;

    case 'contact':
      appendTerminalLine(`<span class="accent-cyan">[COMMUNICATION CHANNELS]</span>`);
      appendTerminalLine(`Email:  <strong style="color:#fff">jackson.konur@example.com</strong>`);
      appendTerminalLine(`GitHub: <a href="https://github.com" target="_blank" style="color:#38bdf8; text-decoration:underline;">github.com/jacksonkonur</a>`);
      break;

    case 'date':
      appendTerminalLine(`Local System Timestamp: <span style="color:#fff">${new Date().toLocaleString()}</span>`);
      break;

    case 'whoami':
      appendTerminalLine(`User: <strong style="color:#a855f7">guest@isds-nexus</strong> | Permissions: <span style="color:#34d399">READ / EXECUTE</span>`);
      break;

    case 'sudo':
      appendTerminalLine(`<span style="color:#ef4444;">Incident will be reported to Jackson Konur's security console. Nice try!</span>`);
      break;

    case 'clear':
      output.innerHTML = '';
      return;

    default:
      appendTerminalLine(`<span style="color:#ef4444;">Command not recognized: '${escapeHtml(rawCommand)}'</span>. Type <span class="term-highlight">'help'</span> for instructions.`);
      break;
  }

  appendTerminalLine(`<div class="term-line spacer"></div>`);
  output.scrollTop = output.scrollHeight;
}

function appendTerminalLine(htmlContent) {
  const output = document.getElementById('terminal-output');
  if (!output) return;
  const line = document.createElement('div');
  line.className = 'term-line';
  line.innerHTML = htmlContent;
  output.appendChild(line);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ==========================================================================
   SITE HEADER SCROLL EFFECT
   ========================================================================== */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   CONTACT ACTIONS & TOAST
   ========================================================================== */
function initContactActions() {
  const copyBtn = document.getElementById('copy-email-btn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const email = copyBtn.getAttribute('data-email') || 'jackson.konur@example.com';
    navigator.clipboard.writeText(email).then(() => {
      showToast('Email address copied to clipboard! ✉️');
    }).catch(() => {
      showToast(`Contact: ${email}`);
    });
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}
