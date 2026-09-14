// Effects module for Andrey V Studio
const Effects = {
  active: [],
  params: {},
  canvas: null,

  init(canvas) {
    this.canvas = canvas;
    this.params = {
      chroma: { keyColor: '#00ff00', softness: 0.15, spill: 0.1, brightness: 1.0 },
      glitch: { intensity: 0.5, rows: 8, speed: 1.0, rgbShift: 0.3 },
      film: { grain: 0.3, vignette: 0.4, blur: 0.0, tint: '#ff9900', tintAmount: 0.15 },
      rgb: { split: 0.5, angle: 0.0, intensity: 0.6 },
      wave: { amplitude: 20, frequency: 0.05, speed: 1.0, direction: 0 },
      pixelate: { size: 8, shape: 'square' },
      neon: { glow: 0.5, hue: 180, brightness: 1.2, saturation: 1.5 },
      retro: { scanlines: 0.3, curvature: 0.2, chroma: 0.1 },
      blur: { amount: 3, direction: 'vertical' }
    };
  },

  toggle(id) {
    const i = this.active.indexOf(id);
    if (i >= 0) this.active.splice(i, 1);
    else this.active.push(id);
    this.updateUI();
  },

  updateUI() {
    document.querySelectorAll('.effect-chip').forEach(c => {
      c.classList.toggle('active', this.active.includes(c.dataset.id));
    });
    const panel = document.getElementById('paramsPanel');
    panel.innerHTML = '';
    this.active.forEach(id => {
      const def = this.params[id];
      if (!def) return;
      const block = document.createElement('div');
      block.className = 'param-group';
      block.innerHTML = this.renderParams(id, def);
      panel.appendChild(block);
    });
    this.bindSliders();
  },

renderParams(id, def) {
    const ranges = { amount: 30, size: 30, rows: 30, amplitude: 100, hue: 360, frequency: 1, speed: 1 };
    let h = '<div class=pg-title>' + id + '</div>';
    for (const k in def) {
      const v = def[k];
      if (typeof v === 'number') {
        const mx = ranges[k] || 2;
        h += '<div class=row><span>' + k + '</span><input type=range data-id=' + id + ' data-key=' + k + ' min=0 max=' + mx + ' step=0.01 value=' + v + '><span class=val>' + v.toFixed(2) + '</span></div>';
      } else if (typeof v === 'string' && v.startsWith('#')) {
        h += '<div class=row><span>' + k + '</span><input type=color data-id=' + id + ' data-key=' + k + ' value=' + v + '></div>';
      }
    }
    return h;
  },

  bindSliders() {
    document.querySelectorAll('input[type=range]').forEach(s => {
      s.addEventListener('input', e => {
        const id = e.target.dataset.id, key = e.target.dataset.key;
        const v = parseFloat(e.target.value);
        this.params[id][key] = v;
        e.target.nextElementSibling.textContent = v.toFixed(2);
      });
    });
    document.querySelectorAll('input[type=color]').forEach(s => {
      s.addEventListener('input', e => {
        const id = e.target.dataset.id, key = e.target.dataset.key;
        this.params[id][key] = e.target.value;
      });
    });
  },

  toHex(n) {
    const h = Math.round(n * 255).toString(16).padStart(2, '0');
    return h + h + h;
  },

  hexToRgb(hex) {
    const v = hex.replace('#', '');
    return [parseInt(v.substr(0,2),16), parseInt(v.substr(2,2),16), parseInt(v.substr(4,2),16)];
  },

  apply(ctx, w, h, t) {
    const a = this.active;
    if (a.includes('chroma')) this.chromaKey(ctx, w, h);
    if (a.includes('glitch')) this.glitch(ctx, w, h, t);
    if (a.includes('film')) this.filmGrain(ctx, w, h, t);
    if (a.includes('rgb')) this.rgbSplit(ctx, w, h);
    if (a.includes('wave')) this.wave(ctx, w, h, t);
    if (a.includes('pixelate')) this.pixelate(ctx, w, h);
    if (a.includes('neon')) this.neon(ctx, w, h);
if (a.includes('retro')) this.retro(ctx, w, h, t);
    if (a.includes('blur')) this.directionalBlur(ctx, w, h);
  },

  // ---------- EFFECTS ----------
  chromaKey(ctx, w, h) {
    const p = this.params.chroma;
    const [kr, kg, kb] = this.hexToRgb(p.keyColor);
const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;
    const soft = p.softness * 255;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      const dist = Math.sqrt((r-kr)**2 + (g-kg)**2 + (b-kb)**2);
      if (dist < soft) {
        const a = dist / soft;
        data[i+3] = Math.round(a * 255);
        data[i] = Math.round(r * a + 255 * (1-a));
        data[i+1] = Math.round(g * a + 255 * (1-a));
        data[i+2] = Math.round(b * a + 255 * (1-a));
      }
    }
    ctx.putImageData(img, 0, 0);
  },

  glitch(ctx, w, h, t) {
    const p = this.params.glitch;
    const rows = Math.floor(p.rows);
    const amp = p.intensity;
    for (let r = 0; r < rows; r++) {
      const y = Math.floor((r / rows) * h);
      const hh = Math.floor((1 / rows) * h * (0.5 + Math.random()));
      const shift = Math.sin(t * p.speed + r) * w * amp * 0.1;
      const sx = Math.floor(shift);
      ctx.drawImage(ctx.canvas, 0, y, w, hh, sx, y, w, hh);
    }
    // RGB shift stripes
    if (p.rgbShift > 0) {
      const off = Math.floor(w * p.rgbShift);
      const tmp = ctx.getImageData(0, 0, w, h);
      const out = ctx.createImageData(w, h);
      for (let i = 0; i < out.data.length; i += 4) {
        out.data[i] = tmp.data[i + off*4] || tmp.data[i];
        out.data[i+2] = tmp.data[i - off*4] || tmp.data[i+2];
        out.data[i+1] = tmp.data[i+1];
        out.data[i+3] = tmp.data[i+3];
      }
      ctx.putImageData(out, 0, 0);
    }
  },

filmGrain(ctx, w, h, t) {
    const p = this.params.film;
    const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;
    const grain = p.grain * 40;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * grain;
      data[i] += n; data[i+1] += n; data[i+2] += n;
    }
    ctx.putImageData(img, 0, 0);
    // vignette
    const grad = ctx.createRadialGradient(w/2, h/2, h*0.3, w/2, h/2, h*0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,' + p.vignette.toFixed(2) + ')');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // tint
    if (p.tintAmount > 0) {
      ctx.globalAlpha = p.tintAmount;
      ctx.fillStyle = p.tint;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
  },

  rgbSplit(ctx, w, h) {
    const p = this.params.rgb;
    const off = Math.floor(w * p.split);
    const tmp = ctx.getImageData(0, 0, w, h);
    const out = ctx.createImageData(w, h);
    const dx = Math.cos(p.angle) * off;
    const dy = Math.sin(p.angle) * off;
    const sx = Math.floor(dx), sy = Math.floor(dy);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y*w + x) * 4;
        const ix = Math.max(0, Math.min(w-1, x + sx));
        const iy = Math.max(0, Math.min(h-1, y + sy));
        const j = (iy*w + ix) * 4;
        out.data[i] = tmp.data[j];
        out.data[i+2] = tmp.data[i];
        out.data[i+1] = tmp.data[i+1];
        out.data[i+3] = tmp.data[i+3];
      }
    }
    ctx.putImageData(out, 0, 0);
  },

  wave(ctx, w, h, t) {
    const p = this.params.wave;
    const tmp = ctx.getImageData(0, 0, w, h);
    const out = ctx.createImageData(w, h);
    const amp = p.amplitude;
    const freq = p.frequency;
    for (let y = 0; y < h; y++) {
      const phase = t * p.speed + y * freq;
      const dx = Math.sin(phase) * amp;
      const sx = Math.floor(dx);
      for (let x = 0; x < w; x++) {
        const i = (y*w + x) * 4;
        const ix = Math.max(0, Math.min(w-1, x + sx));
        const j = (y*w + ix) * 4;
        out.data[i] = tmp.data[j];
        out.data[i+1] = tmp.data[j+1];
        out.data[i+2] = tmp.data[j+2];
        out.data[i+3] = tmp.data[j+3];
      }
    }
    ctx.putImageData(out, 0, 0);
  },

pixelate(ctx, w, h) {
    const p = this.params.pixelate;
    const s = Math.max(2, p.size);
    ctx.imageSmoothingEnabled = false;
    const bw = Math.floor(w / s) * s;
    const bh = Math.floor(h / s) * s;
    ctx.drawImage(ctx.canvas, 0, 0, bw, bh, 0, 0, bw / s, bh / s);
    ctx.drawImage(ctx.canvas, 0, 0, bw / s, bh / s, 0, 0, bw, bh);
    ctx.imageSmoothingEnabled = true;
  },

  neon(ctx, w, h) {
    const p = this.params.neon;
    const tmp = ctx.getImageData(0, 0, w, h);
    const out = ctx.createImageData(w, h);
    const glow = p.glow;
    for (let i = 0; i < out.data.length; i += 4) {
      const r = tmp.data[i], g = tmp.data[i+1], b = tmp.data[i+2];
      const lum = (r + g + b) / 3;
      const f = Math.pow(lum / 255, 1.5) * glow;
      out.data[i] = Math.min(255, r + f * 255);
      out.data[i+1] = Math.min(255, g + f * 255);
      out.data[i+2] = Math.min(255, b + f * 255);
      out.data[i+3] = tmp.data[i+3];
    }
    ctx.putImageData(out, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = 'blur(' + (glow * 8) + 'px)';
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-over';
  },

  retro(ctx, w, h, t) {
    const p = this.params.retro;
    // scanlines
const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x++) {
        const i = (y*w + x) * 4;
        const f = 1 - p.scanlines;
        data[i] *= f; data[i+1] *= f; data[i+2] *= f;
      }
    }
    ctx.putImageData(img, 0, 0);
    // chroma aberration
    if (p.chroma > 0) {
      const off = Math.floor(w * p.chroma);
      const tmp = ctx.getImageData(0, 0, w, h);
      const out = ctx.createImageData(w, h);
      for (let i = 0; i < out.data.length; i += 4) {
        out.data[i] = tmp.data[i + off*4] || tmp.data[i];
        out.data[i+2] = tmp.data[i - off*4] || tmp.data[i+2];
        out.data[i+1] = tmp.data[i+1];
        out.data[i+3] = tmp.data[i+3];
      }
      ctx.putImageData(out, 0, 0);
    }
  },

  directionalBlur(ctx, w, h) {
    const p = this.params.blur;
    const n = Math.max(1, Math.floor(p.amount));
    const vert = p.direction === 'vertical';
    const tmp = ctx.getImageData(0, 0, w, h);
    const out = ctx.createImageData(w, h);
    for (let i = 0; i < out.data.length; i += 4) {
      let r = 0, g = 0, b = 0, a = 0, cnt = 0;
      for (let k = -n; k <= n; k++) {
        let idx;
        if (vert) {
          const y = Math.floor(i / (w*4)) + k;
          if (y < 0 || y >= h) continue;
          idx = (y*w + (i % (w*4))/4) * 4;
        } else {
          const x = (i % (w*4)) / 4 + k;
          if (x < 0 || x >= w) continue;
          idx = (Math.floor(i/(w*4))*w + x) * 4;
        }
        r += tmp.data[idx]; g += tmp.data[idx+1]; b += tmp.data[idx+2]; a += tmp.data[idx+3]; cnt++;
      }
      out.data[i] = r/cnt; out.data[i+1] = g/cnt; out.data[i+2] = b/cnt; out.data[i+3] = a/cnt;
    }
    ctx.putImageData(out, 0, 0);
  }
};
