// Proyectiles de las técnicas: estela, final al chocar y dibujo de cada tipo.
const SHOT_T = {
  hielo: {
    trail: s =>
      G.pt.push({
        x: s.x + rnd(-1, 1),
        y: s.y + rnd(-1, 1),
        vx: -s.vx * 0.1,
        vy: -s.vy * 0.1,
        l: 12,
        m: 12,
        c: Math.random() < 0.5 ? '#bff6ff' : '#5ee7ff',
        s: 1,
        g: 0,
      }),
    fin: s => {
      burst(s.x, s.y, 10, '#bff6ff', 2.2, 22, 1, 0.12);
      ring(s.x, s.y, 9, '#ffffff', 8, 1);
      decal(s.x, s.y + 6, 4, '#3a6a7a', 160);
      sfx('hieloRompe');
    },
    draw: s => {
      w.save();
      w.translate(s.x, s.y);
      w.rotate(Math.atan2(s.vy, s.vx));
      w.fillStyle = '#5ee7ff';
      w.beginPath();
      w.moveTo(7, 0);
      w.lineTo(0, -2.5);
      w.lineTo(-6, 0);
      w.lineTo(0, 2.5);
      w.fill();
      w.fillStyle = '#fff';
      w.fillRect(-2, -0.5, 7, 1);
      w.restore();
    },
  },
  fuego: {
    trail: s => {
      G.pt.push({
        x: s.x + rnd(-2, 2),
        y: s.y + rnd(-2, 2),
        vx: -s.vx * 0.2 + rnd(-0.4, 0.4),
        vy: -s.vy * 0.2 + rnd(-0.4, 0.4),
        l: 16,
        m: 16,
        c: Math.random() < 0.5 ? '#ff8a2a' : '#ffe94a',
        s: 2,
        g: 0,
      });
      if (G.t % 3 == 0)
        G.pt.push({
          x: s.x,
          y: s.y,
          vx: rnd(-0.2, 0.2),
          vy: -0.4,
          l: 30,
          m: 30,
          c: '#4a3a4a',
          s: 2,
          g: -0.004,
        });
    },
    fin: s => explotar(s.x, s.y),
    draw: s => {
      const r = 6 + Math.sin(G.t * 0.8);
      w.globalAlpha = 0.45;
      w.fillStyle = '#ff4a1a';
      w.beginPath();
      w.arc(s.x, s.y, r + 3, 0, 7);
      w.fill();
      w.globalAlpha = 1;
      w.fillStyle = '#ff8a2a';
      w.beginPath();
      w.arc(s.x, s.y, r, 0, 7);
      w.fill();
      w.fillStyle = '#ffe94a';
      w.beginPath();
      w.arc(s.x, s.y, r * 0.6, 0, 7);
      w.fill();
      w.fillStyle = '#fff';
      w.fillRect(Math.round(s.x - 1), Math.round(s.y - 1), 2, 2);
    },
  },
  flecha: {
    trail: s => {
      if (G.t % 2 == 0) G.pt.push({ x: s.x, y: s.y, vx: 0, vy: 0, l: 8, m: 8, c: '#b4ff8a', s: 1, g: 0 });
    },
    fin: s => burst(s.x, s.y, 6, '#c8a070', 1.5, 14, 1, 0.1),
    draw: s => {
      w.save();
      w.translate(s.x, s.y);
      w.rotate(Math.atan2(s.vy, s.vx) + Math.PI / 2);
      w.drawImage(atlas, 324, 202, 7, 21, -3.5, -10, 7, 21);
      w.restore();
    },
  },
  espinas: {
    trail: s =>
      G.pt.push({
        x: s.x,
        y: s.y,
        vx: rnd(-0.3, 0.3),
        vy: rnd(-0.3, 0.3),
        l: 14,
        m: 14,
        c: '#3a8a1a',
        s: 2,
        g: 0,
      }),
    fin: s => {
      const n = lvl('espinas') ? 16 : 8;
      for (let i = 0; i < n; i++) disparo('espina', s.x, s.y, (i * 6.283) / n, 3, { dmg: 9, l: 30, r: 2 });
      ring(s.x, s.y, 20, '#7cff4a', 12, 2);
      burst(s.x, s.y, 20, '#3a8a1a', 3);
      sfx('hit');
    },
    draw: s => {
      SHOT_T.flecha.draw(s);
      w.fillStyle = '#7cff4a';
      w.fillRect(Math.round(s.x - 1), Math.round(s.y - 1), 3, 3);
    },
  },
  espina: {
    fin: s => burst(s.x, s.y, 3, '#3a8a1a', 1),
    draw: s => {
      w.fillStyle = '#7cff4a';
      w.fillRect(Math.round(s.x - 1), Math.round(s.y - 1), 3, 2);
      w.fillStyle = '#1a4a0a';
      w.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
    },
  },
  onda: {
    fantasma: 1,
    trail: s =>
      G.pt.push({
        x: s.x + rnd(-4, 4),
        y: s.y + rnd(-4, 4),
        vx: 0,
        vy: 0,
        l: 10,
        m: 10,
        c: '#fff1b0',
        s: 1,
        g: 0,
      }),
    draw: s => {
      w.save();
      w.translate(s.x, s.y);
      w.rotate(Math.atan2(s.vy, s.vx));
      w.globalAlpha = Math.min(1, s.l / 15);
      w.strokeStyle = '#fff1b0';
      w.lineWidth = 3;
      w.beginPath();
      w.arc(-6, 0, 10, -1, 1);
      w.stroke();
      w.strokeStyle = '#fff';
      w.lineWidth = 1;
      w.stroke();
      w.restore();
      w.globalAlpha = 1;
    },
  },
  hacha: {
    fantasma: 1,
    mover: s => {
      const P = G.P;
      if (s.ida > 0) {
        s.ida--;
        s.x += s.vx;
        s.y += s.vy;
        if (s.ida == 0 || solidAt(s.x, s.y, 0)) {
          s.ida = 0;
          s.hits = [];
        }
      } else {
        const a = Math.atan2(P.y - 12 - s.y, P.x - s.x);
        s.x += Math.cos(a) * 4.6;
        s.y += Math.sin(a) * 4.6;
        if (Math.hypot(P.x - s.x, P.y - 12 - s.y) < 8) s.l = 0;
      }
    },
    trail: s => {
      if (G.t % 2 == 0) G.pt.push({ x: s.x, y: s.y, vx: 0, vy: 0, l: 10, m: 10, c: '#8a8fa8', s: 1, g: 0 });
    },
    draw: s => {
      w.save();
      w.translate(s.x, s.y);
      w.rotate(G.t * 0.5);
      w.drawImage(atlas, 340, 161, 10, 14, -5, -7, 10, 14);
      w.restore();
    },
  },
  daga: {
    fin: s => burst(s.x, s.y, 4, '#c3c8d8', 1.2, 12),
    draw: s => {
      w.save();
      w.translate(s.x, s.y);
      w.rotate(Math.atan2(s.vy, s.vx) + Math.PI / 2);
      w.drawImage(atlas, 293, 10, 6, 13, -3, -6, 6, 13);
      w.restore();
    },
  },
  reflejo: {
    trail: s => G.pt.push({ x: s.x, y: s.y, vx: 0, vy: 0, l: 10, m: 10, c: '#ffd24a', s: 1, g: 0 }),
    fin: s => burst(s.x, s.y, 6, '#ffd24a', 1.5),
    draw: s => {
      w.fillStyle = '#ffd24a';
      w.beginPath();
      w.arc(s.x, s.y, 3.5, 0, 7);
      w.fill();
      w.fillStyle = '#fff';
      w.fillRect(Math.round(s.x - 1), Math.round(s.y - 1), 2, 2);
    },
  },
};
