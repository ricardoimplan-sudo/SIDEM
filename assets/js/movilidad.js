/**
 * PIMAgs - Portal de Inteligencia Municipal de Aguascalientes
 * Módulo de Movilidad Urbana y Transporte Público
 * Integración de:
 * - 33 Ciclovías Municipales (88.5 km)
 * - 92 Rutas de Autobús Urbano YoVoy (SITMA)
 * - 55 Rutas de Transporte Colectivo (Combis)
 * - 1,704 Paradas de Autobús YoVoy con rutas asociadas
 * - 321 Paradas de Combi con rutas asociadas
 * - Buscador espacial interactivo de cercanía: coloca tu punto en el mapa y
 *   descubre qué parada te queda más cerca y qué rutas pasan por ahí.
 */

window.MovilidadApp = {
  mapa: null,
  capaCiclovias: null,
  capaYoVoy: null,
  capaCombis: null,
  capaParadasCamiones: null,
  capaParadasCombis: null,
  capaCercania: null,
  marcadorUsuario: null,
  lineaResaltada: null,
  filtroActivo: 'todas',
  textoBusqueda: '',
  ubicacionActual: null,
  ultimoResultadoCercania: null,
  modoColocarPunto: false,

  // Inicialización del módulo
  init() {
    this.renderMetricas();
    this.renderDirectorio();
  },

  // Inicialización del mapa en la sección Movilidad
  initMapa() {
    if (this.mapa) {
      setTimeout(() => {
        if (this.mapa) this.mapa.invalidateSize();
      }, 200);
      return;
    }

    const mapaEl = document.getElementById('mapaMovilidad');
    if (!mapaEl) return;

    try {
      this.mapa = L.map('mapaMovilidad', {
        center: [21.8853, -102.2916],
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      // Capas Base
      const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(this.mapa);

      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      });

      const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      });

      // Control de Capas Base
      L.control.layers({
        "Mapa Claro": cartoLight,
        "Calles OSM": osm,
        "Satélite": esriSat
      }, null, { position: 'topright' }).addTo(this.mapa);

      // Layer groups
      this.capaCiclovias = L.featureGroup().addTo(this.mapa);
      this.capaYoVoy = L.featureGroup().addTo(this.mapa);
      this.capaCombis = L.featureGroup().addTo(this.mapa);

      // Cluster groups o feature groups para paradas
      if (typeof L.markerClusterGroup === 'function') {
        this.capaParadasCamiones = L.markerClusterGroup({
          maxClusterRadius: 45,
          disableClusteringAtZoom: 16,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false
        }).addTo(this.mapa);

        this.capaParadasCombis = L.markerClusterGroup({
          maxClusterRadius: 45,
          disableClusteringAtZoom: 16,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false
        }).addTo(this.mapa);
      } else {
        this.capaParadasCamiones = L.featureGroup().addTo(this.mapa);
        this.capaParadasCombis = L.featureGroup().addTo(this.mapa);
      }

      this.capaCercania = L.featureGroup().addTo(this.mapa);

      // Cargar geometrías y paradas
      this.cargarCapasEnMapa();

      // Evento de clic en mapa para búsqueda de transporte más cercano
      this.mapa.on('click', (e) => {
        this.calcularTransporteMasCercano(e.latlng.lat, e.latlng.lng, 'Punto seleccionado en el mapa');
      });

      setTimeout(() => {
        if (this.mapa) this.mapa.invalidateSize();
      }, 300);

    } catch (e) {
      console.error("Error al inicializar mapa de Movilidad:", e);
    }
  },

  // Carga de geometrías y paradas en el mapa de Movilidad
  cargarCapasEnMapa() {
    // 1. Ciclovías (Verde Esmeralda)
    if (window.MOVILIDAD_CICLOVIAS && Array.isArray(window.MOVILIDAD_CICLOVIAS)) {
      window.MOVILIDAD_CICLOVIAS.forEach(c => {
        if (!c.coords) return;
        const poly = L.polyline(c.coords, {
          color: '#10b981',
          weight: 4,
          opacity: 0.9,
          dashArray: c.tipo && c.tipo.toLowerCase().includes('compartida') ? '6,6' : null
        });

        poly.bindPopup(`
          <div class="p-2 space-y-1.5 font-sans min-w-[200px]">
            <div class="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <span>🚲 Ciclovía Municipal</span>
            </div>
            <h4 class="font-bold text-slate-800 text-sm leading-snug">${c.nombre}</h4>
            <div class="text-[11px] text-slate-600 space-y-0.5">
              <div><span class="font-semibold text-slate-700">Tipo:</span> ${c.tipo || 'Vía Ciclista'}</div>
              <div><span class="font-semibold text-slate-700">Longitud:</span> ${c.longitud_km ? c.longitud_km.toFixed(2) + ' km' : 'N/D'}</div>
            </div>
          </div>
        `);
        poly.addTo(this.capaCiclovias);
      });
    }

    // 2. Rutas YoVoy SITMA (Azul Océano)
    if (window.MOVILIDAD_YOVOY && Array.isArray(window.MOVILIDAD_YOVOY)) {
      window.MOVILIDAD_YOVOY.forEach(y => {
        if (!y.coords) return;
        const poly = L.polyline(y.coords, {
          color: '#0284c7',
          weight: 3,
          opacity: 0.75
        });

        poly.bindPopup(`
          <div class="p-2 space-y-1.5 font-sans min-w-[220px]">
            <div class="flex items-center gap-1.5 text-sky-700 font-bold text-xs uppercase tracking-wider">
              <span>🚌 Autobús Urbano YoVoy</span>
            </div>
            <h4 class="font-bold text-slate-800 text-sm leading-snug">${y.nombre}</h4>
            <div class="text-[11px] text-slate-600">
              <span class="inline-block px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold mt-1">SITMA Aguascalientes</span>
            </div>
          </div>
        `);
        poly.addTo(this.capaYoVoy);
      });
    }

    // 3. Rutas Combis (Ámbar / Naranja)
    if (window.MOVILIDAD_COMBIS && Array.isArray(window.MOVILIDAD_COMBIS)) {
      window.MOVILIDAD_COMBIS.forEach(cb => {
        if (!cb.coords) return;
        const poly = L.polyline(cb.coords, {
          color: '#f59e0b',
          weight: 3,
          opacity: 0.8
        });

        poly.bindPopup(`
          <div class="p-2 space-y-1.5 font-sans min-w-[220px]">
            <div class="flex items-center gap-1.5 text-amber-700 font-bold text-xs uppercase tracking-wider">
              <span>🚐 Combi / Transporte Colectivo</span>
            </div>
            <h4 class="font-bold text-slate-800 text-sm leading-snug">Ruta ${cb.ruta}</h4>
            <div class="text-[11px] text-slate-600 space-y-0.5">
              <div><span class="font-semibold text-slate-700">Recorrido:</span> ${cb.traslado}</div>
            </div>
          </div>
        `);
        poly.addTo(this.capaCombis);
      });
    }

    // 4. Paradas de Camión YoVoy (Puntos azúles)
    if (window.PARADAS_CAMIONES && Array.isArray(window.PARADAS_CAMIONES)) {
      window.PARADAS_CAMIONES.forEach(s => {
        const marker = L.circleMarker([s.lat, s.lng], {
          radius: 5,
          fillColor: '#0284c7',
          color: '#ffffff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.9
        });

        const rutasBadges = (s.rutas || []).map(r => `
          <button onclick="MovilidadApp.resaltarRutaEnMapa('yovoy', '${r}')" class="px-2 py-0.5 rounded bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-800 text-[10px] font-bold transition cursor-pointer">
            ${r}
          </button>
        `).join('');

        marker.bindPopup(`
          <div class="p-2.5 font-sans min-w-[230px] space-y-2">
            <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
              <span class="text-[10px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                <span>🚏 Parada YoVoy #${s.id}</span>
              </span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                ${s.num_rutas} ${s.num_rutas === 1 ? 'ruta' : 'rutas'}
              </span>
            </div>
            <div class="space-y-1">
              <span class="text-[10px] font-bold text-slate-600 block">Rutas que pasan por aquí:</span>
              <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                ${rutasBadges || '<span class="text-xs text-slate-400">Ruta urbana</span>'}
              </div>
            </div>
            ${s.destinos ? `<div class="text-[10px] text-slate-500 pt-1 border-t border-slate-100 line-clamp-2">${s.destinos}</div>` : ''}
            <div class="pt-1 text-center">
              <button onclick="MovilidadApp.calcularTransporteMasCercano(${s.lat}, ${s.lng}, 'Parada #${s.id}')" class="w-full text-center text-[10px] text-cyan-600 hover:text-cyan-800 font-bold">
                📍 Calcular cercanía desde aquí
              </button>
            </div>
          </div>
        `);

        this.capaParadasCamiones.addLayer(marker);
      });
    }

    // 5. Paradas de Combis (Puntos naranjas)
    if (window.PARADAS_COMBIS && Array.isArray(window.PARADAS_COMBIS)) {
      window.PARADAS_COMBIS.forEach(s => {
        const marker = L.circleMarker([s.lat, s.lng], {
          radius: 5,
          fillColor: '#f59e0b',
          color: '#ffffff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.95
        });

        const rutasBadges = (s.rutas || []).map(r => `
          <button onclick="MovilidadApp.resaltarRutaEnMapa('combi', '${r}')" class="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-bold transition cursor-pointer">
            ${r}
          </button>
        `).join('');

        marker.bindPopup(`
          <div class="p-2.5 font-sans min-w-[230px] space-y-2">
            <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
              <span class="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                <span>🚏 Parada Combi #${s.id}</span>
              </span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                ${s.num_rutas} ${s.num_rutas === 1 ? 'ruta' : 'rutas'}
              </span>
            </div>
            <div class="space-y-1">
              <span class="text-[10px] font-bold text-slate-600 block">Rutas que pasan por aquí:</span>
              <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                ${rutasBadges || '<span class="text-xs text-slate-400">Ruta foránea</span>'}
              </div>
            </div>
            ${s.destinos ? `<div class="text-[10px] text-slate-500 pt-1 border-t border-slate-100 line-clamp-2">${s.destinos}</div>` : ''}
            <div class="pt-1 text-center">
              <button onclick="MovilidadApp.calcularTransporteMasCercano(${s.lat}, ${s.lng}, 'Parada Combi #${s.id}')" class="w-full text-center text-[10px] text-amber-600 hover:text-amber-800 font-bold">
                📍 Calcular cercanía desde aquí
              </button>
            </div>
          </div>
        `);

        this.capaParadasCombis.addLayer(marker);
      });
    }
  },

  // Alternar visibilidad de capas en el mapa propio de Movilidad
  toggleCapaPropia(tipo) {
    if (!this.mapa) return;
    const chk = document.getElementById('chkMov_' + tipo);
    const visible = chk ? chk.checked : true;

    if (tipo === 'ciclovias' && this.capaCiclovias) {
      if (visible) this.mapa.addLayer(this.capaCiclovias);
      else this.mapa.removeLayer(this.capaCiclovias);
    } else if (tipo === 'yovoy' && this.capaYoVoy) {
      if (visible) this.mapa.addLayer(this.capaYoVoy);
      else this.mapa.removeLayer(this.capaYoVoy);
    } else if (tipo === 'combis' && this.capaCombis) {
      if (visible) this.mapa.addLayer(this.capaCombis);
      else this.mapa.removeLayer(this.capaCombis);
    } else if (tipo === 'paradas_camiones' && this.capaParadasCamiones) {
      if (visible) this.mapa.addLayer(this.capaParadasCamiones);
      else this.mapa.removeLayer(this.capaParadasCamiones);
    } else if (tipo === 'paradas_combis' && this.capaParadasCombis) {
      if (visible) this.mapa.addLayer(this.capaParadasCombis);
      else this.mapa.removeLayer(this.capaParadasCombis);
    }
  },

  // Activa o coloca el punto del usuario directamente al centro del mapa
  activarColocarPunto() {
    this.initMapa();
    const centro = this.mapa.getCenter();
    this.calcularTransporteMasCercano(centro.lat, centro.lng, 'Mi punto colocado (Arrastrable)');
    
    // Notificación en pantalla
    const notif = document.getElementById('mov_punto_instruccion');
    if (notif) {
      notif.classList.remove('hidden');
      setTimeout(() => { notif.classList.add('hidden'); }, 5000);
    }
  },

  // =========================================================================
  // MOTOR ESPACIAL: Búsqueda del transporte y parada más cercana
  // =========================================================================

  distanciaHaversine(lat1, lon1, lat2, lon2) {
    const R = 6371000.0;
    const dLat = (lat2 - lat1) * Math.PI / 180.0;
    const dLon = (lon2 - lon1) * Math.PI / 180.0;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180.0) * Math.cos(lat2 * Math.PI / 180.0) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Algoritmo proyectivo para distancia punto-a-segmento
  distanciaPuntoASegmento(plat, plng, alat, alng, blat, blng) {
    const cosLat = Math.cos(plat * Math.PI / 180.0);
    const mPerDegLat = 110574.0;
    const mPerDegLng = 111320.0 * cosLat;

    const ax = (alng - plng) * mPerDegLng;
    const ay = (alat - plat) * mPerDegLat;
    const bx = (blng - plng) * mPerDegLng;
    const by = (blat - plat) * mPerDegLat;

    const dx = bx - ax;
    const dy = by - ay;
    const l2 = dx * dx + dy * dy;

    let t = 0;
    if (l2 > 0) {
      t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / l2));
    }

    const cx = ax + t * dx;
    const cy = ay + t * dy;
    const distMetros = Math.sqrt(cx * cx + cy * cy);

    const clat = plat + cy / mPerDegLat;
    const clng = plng + cx / mPerDegLng;

    return {
      distancia: distMetros,
      puntoMasCercano: [clat, clng]
    };
  },

  // Busca la parada más cercana en un array de paradas puntuales
  encontrarParadaMasCercana(plat, plng, paradas) {
    let mejor = null;
    let minDist = Infinity;

    if (!Array.isArray(paradas)) return { parada: null, distanciaMetros: Infinity };

    for (let i = 0; i < paradas.length; i++) {
      const p = paradas[i];
      const d = this.distanciaHaversine(plat, plng, p.lat, p.lng);
      if (d < minDist) {
        minDist = d;
        mejor = p;
      }
    }

    return {
      parada: mejor,
      distanciaMetros: minDist,
      coords: mejor ? [mejor.lat, mejor.lng] : null
    };
  },

  // Busca la ciclovía más cercana (geometría polilínea)
  encontrarCicloviaMasCercana(plat, plng, ciclovias) {
    let mejor = null;
    let minDist = Infinity;
    let mejorPunto = null;

    if (!Array.isArray(ciclovias)) return { ciclovia: null, distanciaMetros: Infinity, puntoMasCercano: null };

    ciclovias.forEach(item => {
      if (!item.coords) return;

      const processLine = (pts) => {
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          if (!a || !b || a.length < 2 || b.length < 2) continue;

          const res = this.distanciaPuntoASegmento(plat, plng, a[0], a[1], b[0], b[1]);
          if (res.distancia < minDist) {
            minDist = res.distancia;
            mejor = item;
            mejorPunto = res.puntoMasCercano;
          }
        }
      };

      if (Array.isArray(item.coords)) {
        if (item.coords.length > 0 && Array.isArray(item.coords[0])) {
          if (Array.isArray(item.coords[0][0])) {
            item.coords.forEach(part => processLine(part));
          } else {
            processLine(item.coords);
          }
        }
      }
    });

    return {
      ciclovia: mejor,
      distanciaMetros: minDist,
      puntoMasCercano: mejorPunto
    };
  },

  // Obtiene todas las rutas (YoVoy y Combis) que pasan a menos de X metros del punto
  encontrarRutasEnRadio(plat, plng, radioMetros = 250) {
    const rutasCercanasYoVoy = new Set();
    const rutasCercanasCombis = new Set();

    // YoVoy
    (window.MOVILIDAD_YOVOY || []).forEach(r => {
      if (!r.coords) return;
      const pts = r.coords;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        if (!a || !b) continue;
        const res = this.distanciaPuntoASegmento(plat, plng, a[0], a[1], b[0], b[1]);
        if (res.distancia <= radioMetros) {
          let nombreLimpio = r.nombre;
          const match = nombreLimpio.match(/^(SITMA\s+\d+[A-Z]?|Ruta\s+\d+[A-Z]?)/i);
          if (match) nombreLimpio = match[1];
          else if (nombreLimpio.length > 22) nombreLimpio = nombreLimpio.substring(0, 22).trim();
          rutasCercanasYoVoy.add(nombreLimpio);
          break;
        }
      }
    });

    // Combis
    (window.MOVILIDAD_COMBIS || []).forEach(cb => {
      if (!cb.coords) return;
      const pts = cb.coords;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        if (!a || !b) continue;
        const res = this.distanciaPuntoASegmento(plat, plng, a[0], a[1], b[0], b[1]);
        if (res.distancia <= radioMetros) {
          rutasCercanasCombis.add('Ruta ' + cb.ruta);
          break;
        }
      }
    });

    return {
      yovoy: Array.from(rutasCercanasYoVoy),
      combis: Array.from(rutasCercanasCombis)
    };
  },

  // Calcula y visualiza las paradas y rutas más cercanas
  calcularTransporteMasCercano(lat, lng, origenTexto) {
    this.initMapa();
    this.ubicacionActual = [lat, lng];

    // 1. Parada YoVoy más cercana
    const paradaCamionRes = this.encontrarParadaMasCercana(lat, lng, window.PARADAS_CAMIONES || []);

    // 2. Parada Combi más cercana
    const paradaCombiRes = this.encontrarParadaMasCercana(lat, lng, window.PARADAS_COMBIS || []);

    // 3. Ciclovía más cercana
    const cicloviaRes = this.encontrarCicloviaMasCercana(lat, lng, window.MOVILIDAD_CICLOVIAS || []);

    // 4. Rutas en radio de 250m
    const rutasRadio = this.encontrarRutasEnRadio(lat, lng, 250);

    this.ultimoResultadoCercania = {
      origen: [lat, lng],
      origenTexto: origenTexto || 'Punto en el mapa',
      paradaCamion: paradaCamionRes,
      paradaCombi: paradaCombiRes,
      ciclovia: cicloviaRes,
      rutasRadio: rutasRadio
    };

    // Limpiar capa de cercanía previa
    this.capaCercania.clearLayers();

    // Marcador del Usuario / Punto de consulta (ARRASTRABLE)
    const userIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center cursor-move">
          <div class="absolute w-10 h-10 rounded-full bg-cyan-500/30 animate-ping"></div>
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
            📍
          </div>
        </div>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    this.marcadorUsuario = L.marker([lat, lng], {
      icon: userIcon,
      draggable: true
    }).addTo(this.capaCercania);

    this.marcadorUsuario.bindPopup(`
      <div class="p-2 font-sans text-xs space-y-1">
        <span class="font-bold text-cyan-700 block flex items-center gap-1">
          <span>📍 ${origenTexto || 'Tu Punto'}</span>
        </span>
        <span class="text-slate-600 font-mono text-[10px] block">${lat.toFixed(5)}, ${lng.toFixed(5)}</span>
        <span class="text-[10px] text-slate-500 italic block pt-1 border-t border-slate-100">
          💡 Puedes arrastrar este marcador a cualquier lugar para recalcular.
        </span>
      </div>
    `).openPopup();

    // Evento de arrastre del marcador
    this.marcadorUsuario.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      this.calcularTransporteMasCercano(pos.lat, pos.lng, 'Punto arrastrado');
    });

    const boundsPoints = [[lat, lng]];

    // Helper formato distancia y tiempo caminando (a ~80 m/min)
    const fmt = (m) => {
      const tiempoMin = Math.max(1, Math.round(m / 80));
      let distStr = m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(2)} km`;
      return { distStr, tiempoMin };
    };

    // 1. Línea y marcador a Parada YoVoy (Azul)
    if (paradaCamionRes.parada && paradaCamionRes.coords) {
      const f = fmt(paradaCamionRes.distanciaMetros);
      boundsPoints.push(paradaCamionRes.coords);

      L.polyline([[lat, lng], paradaCamionRes.coords], {
        color: '#0284c7',
        weight: 3.5,
        dashArray: '6,6',
        opacity: 0.95
      }).addTo(this.capaCercania);

      const busIcon = L.divIcon({
        html: `<div class="w-8 h-8 rounded-full bg-sky-600 border-2 border-white shadow-lg flex items-center justify-center text-xs text-white font-bold">🚏</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const rutasPills = (paradaCamionRes.parada.rutas || []).map(r => `
        <span class="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">${r}</span>
      `).join('');

      L.marker(paradaCamionRes.coords, { icon: busIcon }).addTo(this.capaCercania)
        .bindPopup(`
          <div class="p-2 text-xs space-y-1.5 font-sans min-w-[220px]">
            <span class="font-bold text-sky-700 block">🚏 Parada YoVoy más cercana</span>
            <div class="font-semibold text-slate-800">${paradaCamionRes.parada.nombre}</div>
            <div class="text-slate-600">A <b>${f.distStr}</b> (~${f.tiempoMin} min caminando)</div>
            <div class="pt-1 border-t border-slate-100">
              <span class="text-[10px] font-bold text-slate-600 block mb-1">Rutas que pasan por aquí:</span>
              <div class="flex flex-wrap gap-1">${rutasPills}</div>
            </div>
          </div>
        `);
    }

    // 2. Línea y marcador a Parada Combi (Ámbar)
    if (paradaCombiRes.parada && paradaCombiRes.coords) {
      const f = fmt(paradaCombiRes.distanciaMetros);
      boundsPoints.push(paradaCombiRes.coords);

      L.polyline([[lat, lng], paradaCombiRes.coords], {
        color: '#f59e0b',
        weight: 3.5,
        dashArray: '6,6',
        opacity: 0.95
      }).addTo(this.capaCercania);

      const combiIcon = L.divIcon({
        html: `<div class="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-xs text-white font-bold">🚏</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const combiPills = (paradaCombiRes.parada.rutas || []).map(r => `
        <span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">${r}</span>
      `).join('');

      L.marker(paradaCombiRes.coords, { icon: combiIcon }).addTo(this.capaCercania)
        .bindPopup(`
          <div class="p-2 text-xs space-y-1.5 font-sans min-w-[220px]">
            <span class="font-bold text-amber-700 block">🚏 Parada de Combi más cercana</span>
            <div class="font-semibold text-slate-800">${paradaCombiRes.parada.nombre}</div>
            <div class="text-slate-600">A <b>${f.distStr}</b> (~${f.tiempoMin} min caminando)</div>
            <div class="pt-1 border-t border-slate-100">
              <span class="text-[10px] font-bold text-slate-600 block mb-1">Rutas que pasan por aquí:</span>
              <div class="flex flex-wrap gap-1">${combiPills}</div>
            </div>
          </div>
        `);
    }

    // 3. Línea y marcador a Ciclovía (Verde)
    if (cicloviaRes.ciclovia && cicloviaRes.puntoMasCercano) {
      const f = fmt(cicloviaRes.distanciaMetros);
      boundsPoints.push(cicloviaRes.puntoMasCercano);

      L.polyline([[lat, lng], cicloviaRes.puntoMasCercano], {
        color: '#10b981',
        weight: 3.5,
        dashArray: '6,6',
        opacity: 0.95
      }).addTo(this.capaCercania);

      const cicloIcon = L.divIcon({
        html: `<div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-xs text-white font-bold">🚲</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker(cicloviaRes.puntoMasCercano, { icon: cicloIcon }).addTo(this.capaCercania)
        .bindPopup(`
          <div class="p-2 text-xs font-sans space-y-1">
            <span class="font-bold text-emerald-700 block">🚲 Ciclovía más cercana</span>
            <div class="font-semibold text-slate-800">${cicloviaRes.ciclovia.nombre}</div>
            <div class="text-slate-600">A <b>${f.distStr}</b> (~${f.tiempoMin} min caminando)</div>
            <div class="text-[10px] text-slate-500">${cicloviaRes.ciclovia.tipo || 'Vía Ciclista'}</div>
          </div>
        `);
    }

    // Ajustar zoom para mostrar el punto y sus destinos más cercanos
    if (boundsPoints.length > 1) {
      this.mapa.fitBounds(L.latLngBounds(boundsPoints), { padding: [70, 70], maxZoom: 16 });
    }

    // Actualizar el panel interactivo de resultados
    this.renderPanelResultadosCercania(lat, lng, origenTexto, paradaCamionRes, paradaCombiRes, cicloviaRes, rutasRadio);
  },

  // Muestra los resultados en el widget del DOM
  renderPanelResultadosCercania(lat, lng, origenTexto, paradaCamionRes, paradaCombiRes, cicloviaRes, rutasRadio) {
    const contenedor = document.getElementById('mov_panel_cercania');
    if (!contenedor) return;

    const fmt = (m) => {
      if (m === Infinity || !m) return { distStr: 'N/D', tiempoMin: 0 };
      const tiempoMin = Math.max(1, Math.round(m / 80));
      let distStr = m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(2)} km`;
      return { distStr, tiempoMin };
    };

    const yFmt = fmt(paradaCamionRes.distanciaMetros);
    const cbFmt = fmt(paradaCombiRes.distanciaMetros);
    const cFmt = fmt(cicloviaRes.distanciaMetros);

    // Badges de rutas YoVoy en la parada
    const rutasYoVoy = (paradaCamionRes.parada && paradaCamionRes.parada.rutas) ? paradaCamionRes.parada.rutas : [];
    const yovoyBadgesHtml = rutasYoVoy.length > 0
      ? rutasYoVoy.map(r => `
          <button onclick="MovilidadApp.resaltarRutaEnMapa('yovoy', '${r}')" title="Haz clic para resaltar ruta en el mapa" class="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer">
            <i data-lucide="bus" class="w-3 h-3 text-sky-400"></i>
            <span>${r}</span>
          </button>
        `).join('')
      : '<span class="text-xs text-slate-400">Sin rutas registradas</span>';

    // Badges de rutas Combis en la parada
    const rutasCombis = (paradaCombiRes.parada && paradaCombiRes.parada.rutas) ? paradaCombiRes.parada.rutas : [];
    const combisBadgesHtml = rutasCombis.length > 0
      ? rutasCombis.map(r => `
          <button onclick="MovilidadApp.resaltarRutaEnMapa('combi', '${r}')" title="Haz clic para resaltar ruta en el mapa" class="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer">
            <i data-lucide="van" class="w-3 h-3 text-amber-400"></i>
            <span>${r}</span>
          </button>
        `).join('')
      : '<span class="text-xs text-slate-400">Sin rutas registradas</span>';

    contenedor.innerHTML = `
      <div class="p-5 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-cyan-500/40 shadow-2xl space-y-4 animate-fadeIn">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
            <div>
              <span class="text-xs font-black text-white uppercase tracking-wider block">Transporte Más Cercano a tu Ubicación</span>
              <span class="text-[11px] text-slate-400">${origenTexto}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 font-mono text-[11px] border border-white/10">
              📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Tarjeta 1: Parada YoVoy más cercana -->
          <div class="p-4 rounded-xl bg-sky-950/40 border border-sky-500/30 flex flex-col justify-between space-y-3">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <i data-lucide="bus" class="w-4 h-4"></i>
                  <span>Parada de Autobús (YoVoy)</span>
                </span>
                <span class="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold text-xs font-mono">
                  ${yFmt.distStr}
                </span>
              </div>
              <h5 class="font-bold text-white text-sm leading-snug">
                ${paradaCamionRes.parada ? paradaCamionRes.parada.nombre : 'No disponible'}
              </h5>
              <div class="flex items-center gap-2 text-[11px] text-sky-300">
                <i data-lucide="footprints" class="w-3.5 h-3.5"></i>
                <span class="font-semibold">~${yFmt.tiempoMin} min caminando</span>
                <span class="text-slate-400">(${paradaCamionRes.parada ? paradaCamionRes.parada.num_rutas : 0} rutas)</span>
              </div>
              <div class="space-y-1.5 pt-1">
                <span class="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Rutas que pasan por aquí:</span>
                <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  ${yovoyBadgesHtml}
                </div>
              </div>
            </div>
            <div class="pt-2 border-t border-sky-500/20 flex items-center justify-between text-xs">
              <span class="text-[11px] text-slate-400">Haz clic en una ruta para ver su trazo</span>
              <button onclick="MovilidadApp.centrarPuntoCercano('paradaCamion')" class="text-sky-300 hover:text-white font-bold transition flex items-center gap-1 cursor-pointer">
                <span>Centrar</span>
                <i data-lucide="crosshair" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>

          <!-- Tarjeta 2: Parada Combi más cercana -->
          <div class="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 flex flex-col justify-between space-y-3">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <i data-lucide="van" class="w-4 h-4"></i>
                  <span>Parada de Combi</span>
                </span>
                <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs font-mono">
                  ${cbFmt.distStr}
                </span>
              </div>
              <h5 class="font-bold text-white text-sm leading-snug">
                ${paradaCombiRes.parada ? paradaCombiRes.parada.nombre : 'No disponible'}
              </h5>
              <div class="flex items-center gap-2 text-[11px] text-amber-300">
                <i data-lucide="footprints" class="w-3.5 h-3.5"></i>
                <span class="font-semibold">~${cbFmt.tiempoMin} min caminando</span>
                <span class="text-slate-400">(${paradaCombiRes.parada ? paradaCombiRes.parada.num_rutas : 0} rutas)</span>
              </div>
              <div class="space-y-1.5 pt-1">
                <span class="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Rutas que pasan por aquí:</span>
                <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  ${combisBadgesHtml}
                </div>
              </div>
            </div>
            <div class="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
              <span class="text-[11px] text-slate-400">Haz clic en una ruta para ver su trazo</span>
              <button onclick="MovilidadApp.centrarPuntoCercano('paradaCombi')" class="text-amber-300 hover:text-white font-bold transition flex items-center gap-1 cursor-pointer">
                <span>Centrar</span>
                <i data-lucide="crosshair" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>

          <!-- Tarjeta 3: Ciclovía más cercana -->
          <div class="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col justify-between space-y-3">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <i data-lucide="bike" class="w-4 h-4"></i>
                  <span>Ciclovía más cercana</span>
                </span>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs font-mono">
                  ${cFmt.distStr}
                </span>
              </div>
              <h5 class="font-bold text-white text-sm leading-snug">
                ${cicloviaRes.ciclovia ? cicloviaRes.ciclovia.nombre : 'No disponible'}
              </h5>
              <div class="flex items-center gap-2 text-[11px] text-emerald-300">
                <i data-lucide="footprints" class="w-3.5 h-3.5"></i>
                <span class="font-semibold">~${cFmt.tiempoMin} min caminando</span>
              </div>
              <p class="text-[11px] text-slate-300">
                ${cicloviaRes.ciclovia ? (cicloviaRes.ciclovia.tipo || 'Vía Ciclista Municipal') : ''}
              </p>
            </div>
            <div class="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs">
              <span class="text-[11px] text-slate-400">Prioridad ciclista</span>
              <button onclick="MovilidadApp.centrarPuntoCercano('ciclovia')" class="text-emerald-300 hover:text-white font-bold transition flex items-center gap-1 cursor-pointer">
                <span>Centrar</span>
                <i data-lucide="crosshair" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="text-center pt-1 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>💡 <em>Arrastra el marcador azul o haz clic en cualquier lugar del mapa para recalcular.</em></span>
          <button onclick="MovilidadApp.usarMiUbicacionActual()" class="text-cyan-400 hover:text-cyan-200 font-bold flex items-center gap-1 cursor-pointer">
            <i data-lucide="crosshair" class="w-3.5 h-3.5"></i>
            <span>Usar mi GPS</span>
          </button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  // Resalta una ruta específica en el mapa al hacer clic en su badge
  resaltarRutaEnMapa(tipo, nombreRuta) {
    this.initMapa();
    let dataset = [];
    if (tipo === 'yovoy') dataset = window.MOVILIDAD_YOVOY || [];
    else if (tipo === 'combi') dataset = window.MOVILIDAD_COMBIS || [];

    const item = dataset.find(x => {
      if (tipo === 'yovoy') {
        return x.nombre.toLowerCase().includes(nombreRuta.toLowerCase());
      } else {
        return ('Ruta ' + x.ruta).toLowerCase() === nombreRuta.toLowerCase() || x.ruta.toLowerCase() === nombreRuta.toLowerCase();
      }
    });

    if (!item || !item.coords) {
      console.warn("No se encontró trazo para:", nombreRuta);
      return;
    }

    if (this.lineaResaltada && this.mapa.hasLayer(this.lineaResaltada)) {
      this.mapa.removeLayer(this.lineaResaltada);
    }

    const color = tipo === 'yovoy' ? '#38bdf8' : '#fbbf24';
    this.lineaResaltada = L.polyline(item.coords, {
      color: '#ffffff',
      weight: 7,
      opacity: 0.95
    }).addTo(this.mapa);

    const innerPoly = L.polyline(item.coords, {
      color: color,
      weight: 5,
      opacity: 1
    }).addTo(this.mapa);

    try {
      this.mapa.fitBounds(this.lineaResaltada.getBounds(), { padding: [50, 50], maxZoom: 15 });
    } catch (e) {}

    setTimeout(() => {
      if (this.mapa.hasLayer(this.lineaResaltada)) this.mapa.removeLayer(this.lineaResaltada);
      if (this.mapa.hasLayer(innerPoly)) this.mapa.removeLayer(innerPoly);
    }, 6000);
  },

  centrarPuntoCercano(tipo) {
    if (!this.mapa || !this.ultimoResultadoCercania) return;
    const res = this.ultimoResultadoCercania[tipo];
    let pt = null;
    if (tipo === 'paradaCamion' && res && res.coords) pt = res.coords;
    else if (tipo === 'paradaCombi' && res && res.coords) pt = res.coords;
    else if (tipo === 'ciclovia' && res && res.puntoMasCercano) pt = res.puntoMasCercano;

    if (pt) {
      this.mapa.setView(pt, 16, { animate: true });
    }
  },

  // Usa la geolocalización del navegador
  usarMiUbicacionActual() {
    const btn = document.getElementById('btnMiUbicacionMov');
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 animate-spin inline mr-1.5"></i>GPS...`;
      if (window.lucide) window.lucide.createIcons();
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<i data-lucide="crosshair" class="w-3.5 h-3.5 inline mr-1"></i>Mi Ubicación GPS`;
          if (window.lucide) window.lucide.createIcons();
        }
        this.calcularTransporteMasCercano(pos.coords.latitude, pos.coords.longitude, 'Tu ubicación GPS actual');
      },
      (err) => {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<i data-lucide="crosshair" class="w-3.5 h-3.5 inline mr-1"></i>Mi Ubicación GPS`;
          if (window.lucide) window.lucide.createIcons();
        }
        alert("No fue posible obtener tu ubicación GPS (" + err.message + "). Haz clic directamente en el mapa para colocar tu punto.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  },

  // Renderizado de métricas en tarjetas superiores
  renderMetricas() {
    const ciclovias = window.MOVILIDAD_CICLOVIAS || [];
    const yovoy = window.MOVILIDAD_YOVOY || [];
    const combis = window.MOVILIDAD_COMBIS || [];
    const paradasCamiones = window.PARADAS_CAMIONES || [];
    const paradasCombis = window.PARADAS_COMBIS || [];

    const totalCiclovias = ciclovias.length;
    let kmCiclovias = 0;
    ciclovias.forEach(c => { kmCiclovias += (c.longitud_km || 0); });

    const totalYoVoy = yovoy.length;
    const totalCombis = combis.length;

    const elTotalCiclo = document.getElementById('mov_met_ciclovias');
    const elKmCiclo = document.getElementById('mov_met_km_ciclovias');
    const elTotalYoVoy = document.getElementById('mov_met_yovoy');
    const elTotalCombis = document.getElementById('mov_met_combis');

    if (elTotalCiclo) elTotalCiclo.textContent = totalCiclovias.toLocaleString('es-MX');
    if (elKmCiclo) elKmCiclo.textContent = kmCiclovias.toFixed(1) + ' km';
    if (elTotalYoVoy) elTotalYoVoy.textContent = `${totalYoVoy} (${paradasCamiones.length.toLocaleString('es-MX')} paradas)`;
    if (elTotalCombis) elTotalCombis.textContent = `${totalCombis} (${paradasCombis.length.toLocaleString('es-MX')} paradas)`;
  },

  // Renderizado del directorio interactivo de rutas
  renderDirectorio() {
    const contenedor = document.getElementById('mov_lista_rutas');
    if (!contenedor) return;

    const texto = (this.textoBusqueda || '').toLowerCase().trim();
    const filtro = this.filtroActivo;

    let items = [];

    if (filtro === 'todas' || filtro === 'ciclovias') {
      (window.MOVILIDAD_CICLOVIAS || []).forEach(c => {
        if (!texto || c.nombre.toLowerCase().includes(texto) || (c.tipo && c.tipo.toLowerCase().includes(texto))) {
          items.push({
            tipo: 'ciclovia',
            badge: 'Ciclovía',
            badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            titulo: c.nombre,
            subtitulo: c.tipo || 'Vía ciclista',
            extra: (c.longitud_km ? c.longitud_km.toFixed(2) + ' km' : ''),
            raw: c
          });
        }
      });
    }

    if (filtro === 'todas' || filtro === 'yovoy') {
      (window.MOVILIDAD_YOVOY || []).forEach(y => {
        if (!texto || y.nombre.toLowerCase().includes(texto)) {
          items.push({
            tipo: 'yovoy',
            badge: 'YoVoy SITMA',
            badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
            titulo: y.nombre,
            subtitulo: 'Transporte Urbano Colectivo',
            extra: 'Ruta Oficial',
            raw: y
          });
        }
      });
    }

    if (filtro === 'todas' || filtro === 'combis') {
      (window.MOVILIDAD_COMBIS || []).forEach(cb => {
        if (!texto || cb.ruta.toLowerCase().includes(texto) || cb.traslado.toLowerCase().includes(texto)) {
          items.push({
            tipo: 'combi',
            badge: 'Combi',
            badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            titulo: 'Ruta ' + cb.ruta,
            subtitulo: cb.traslado,
            extra: 'Foráneo/Urbano',
            raw: cb
          });
        }
      });
    }

    const badgeCount = document.getElementById('mov_conteo_filtrado');
    if (badgeCount) badgeCount.textContent = `${items.length} encontradas`;

    if (items.length === 0) {
      contenedor.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400">
          <i data-lucide="compass" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
          <p class="font-medium">No se encontraron rutas con el criterio especificado.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const sliceItems = items.slice(0, 60);

    let html = '';
    sliceItems.forEach((it) => {
      let clickAction = `window.MovilidadApp.enfocarRuta('${it.tipo}', ${it.raw.id})`;

      html += `
        <div onclick="${clickAction}" class="group p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${it.badgeColor}">${it.badge}</span>
              ${it.extra ? `<span class="text-[11px] font-semibold text-slate-400">${it.extra}</span>` : ''}
            </div>
            <h4 class="font-bold text-white text-xs leading-snug group-hover:text-cyan-300 transition line-clamp-2">${it.titulo}</h4>
            <p class="text-[11px] text-slate-400 line-clamp-2">${it.subtitulo}</p>
          </div>
          <div class="pt-2.5 mt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-cyan-400 group-hover:text-cyan-300">
            <span class="flex items-center gap-1 font-medium">Ver trazado</span>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"></i>
          </div>
        </div>
      `;
    });

    if (items.length > 60) {
      html += `
        <div class="col-span-full py-2 text-center text-xs text-slate-400">
          Mostrando 60 de ${items.length} rutas. Utiliza el buscador para afinar resultados.
        </div>
      `;
    }

    contenedor.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  },

  setFiltro(nuevoFiltro) {
    this.filtroActivo = nuevoFiltro;
    const btns = document.querySelectorAll('.btn-filtro-mov');
    btns.forEach(b => {
      if (b.dataset.filtro === nuevoFiltro) {
        b.className = 'btn-filtro-mov px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 text-white shadow-sm transition cursor-pointer';
      } else {
        b.className = 'btn-filtro-mov px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white transition cursor-pointer';
      }
    });
    this.renderDirectorio();
  },

  filtrarTexto(val) {
    this.textoBusqueda = val;
    this.renderDirectorio();
  },

  enfocarRuta(tipo, id) {
    this.initMapa();
    let dataset = [];
    if (tipo === 'ciclovia') dataset = window.MOVILIDAD_CICLOVIAS || [];
    else if (tipo === 'yovoy') dataset = window.MOVILIDAD_YOVOY || [];
    else if (tipo === 'combis') dataset = window.MOVILIDAD_COMBIS || [];

    const item = dataset.find(x => x.id === id);
    if (!item || !item.coords) return;

    try {
      const tempPoly = L.polyline(item.coords);
      const bounds = tempPoly.getBounds();
      this.mapa.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });

      const highlight = L.polyline(item.coords, {
        color: '#ffffff',
        weight: 6,
        opacity: 0.9,
        dashArray: '8,8'
      }).addTo(this.mapa);

      setTimeout(() => {
        if (this.mapa.hasLayer(highlight)) this.mapa.removeLayer(highlight);
      }, 4000);

      const mapEl = document.getElementById('mapaMovilidad');
      if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (e) {
      console.warn("No se pudo enfocar ruta:", e);
    }
  },

  // =========================================================================
  // INTEGRACIÓN CON EL GEOVISOR PRINCIPAL (sec-visor / mapPimags)
  // =========================================================================

  crearCapaCiclovias() {
    const fg = L.featureGroup();
    if (!window.MOVILIDAD_CICLOVIAS || !Array.isArray(window.MOVILIDAD_CICLOVIAS)) return fg;
    try {
      window.MOVILIDAD_CICLOVIAS.forEach(c => {
        if (!c.coords) return;
        const poly = L.polyline(c.coords, {
          color: '#10b981',
          weight: 4,
          opacity: 0.95,
          dashArray: c.tipo && c.tipo.toLowerCase().includes('compartida') ? '5,5' : null
        });

        poly.bindPopup(`
          <div class="p-2 space-y-1 font-sans text-xs min-w-[200px]">
            <div class="font-bold text-emerald-700">🚲 Ciclovía: ${c.nombre}</div>
            <div class="text-slate-600"><b>Tipo:</b> ${c.tipo || 'Vía Ciclista'}</div>
            <div class="text-slate-600"><b>Longitud:</b> ${c.longitud_km ? c.longitud_km.toFixed(2) + ' km' : 'N/D'}</div>
          </div>
        `);
        fg.addLayer(poly);
      });
    } catch (e) {
      console.error("Error al crear capa Ciclovías:", e);
    }
    return fg;
  },

  inicializarCapaCicloviasVisor() {
    const fg = this.crearCapaCiclovias();
    if (window.visorCapas) window.visorCapas.ciclovias = fg;
    return fg;
  },

  crearCapaYoVoy() {
    const fg = L.featureGroup();
    if (!window.MOVILIDAD_YOVOY || !Array.isArray(window.MOVILIDAD_YOVOY)) return fg;
    try {
      window.MOVILIDAD_YOVOY.forEach(y => {
        if (!y.coords) return;
        const poly = L.polyline(y.coords, {
          color: '#0284c7',
          weight: 3.5,
          opacity: 0.9
        });

        poly.bindPopup(`
          <div class="p-2 space-y-1 font-sans text-xs min-w-[210px]">
            <div class="font-bold text-sky-700">🚌 Autobús YoVoy</div>
            <div class="text-slate-800 font-semibold">${y.nombre}</div>
            <div class="text-[11px] text-sky-800">SITMA Aguascalientes</div>
          </div>
        `);
        fg.addLayer(poly);
      });
    } catch (e) {
      console.error("Error al crear capa YoVoy:", e);
    }
    return fg;
  },

  inicializarCapaYoVoyVisor() {
    const fg = this.crearCapaYoVoy();
    if (window.visorCapas) window.visorCapas.yovoy = fg;
    return fg;
  },

  crearCapaCombis() {
    const fg = L.featureGroup();
    if (!window.MOVILIDAD_COMBIS || !Array.isArray(window.MOVILIDAD_COMBIS)) return fg;
    try {
      window.MOVILIDAD_COMBIS.forEach(cb => {
        if (!cb.coords) return;
        const poly = L.polyline(cb.coords, {
          color: '#f59e0b',
          weight: 3.5,
          opacity: 0.9
        });

        poly.bindPopup(`
          <div class="p-2 space-y-1 font-sans text-xs min-w-[210px]">
            <div class="font-bold text-amber-700">🚐 Combi Ruta ${cb.ruta}</div>
            <div class="text-slate-800 font-semibold">${cb.traslado}</div>
          </div>
        `);
        fg.addLayer(poly);
      });
    } catch (e) {
      console.error("Error al crear capa Combis:", e);
    }
    return fg;
  },

  inicializarCapaCombisVisor() {
    const fg = this.crearCapaCombis();
    if (window.visorCapas) window.visorCapas.combis = fg;
    return fg;
  },

  // Capa Paradas de Camiones (YoVoy) para el Geovisor
  crearCapaParadasCamiones() {
    let group = null;
    if (typeof L.markerClusterGroup === 'function') {
      group = L.markerClusterGroup({
        maxClusterRadius: 40,
        disableClusteringAtZoom: 16,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false
      });
    } else {
      group = L.featureGroup();
    }

    if (!window.PARADAS_CAMIONES || !Array.isArray(window.PARADAS_CAMIONES)) return group;

    try {
      window.PARADAS_CAMIONES.forEach(s => {
        const marker = L.circleMarker([s.lat, s.lng], {
          radius: 5,
          fillColor: '#0284c7',
          color: '#ffffff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.9
        });

        const rutasBadges = (s.rutas || []).map(r => `
          <span class="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">${r}</span>
        `).join('');

        marker.bindPopup(`
          <div class="p-2 font-sans text-xs min-w-[220px] space-y-1.5">
            <div class="font-bold text-sky-700 flex items-center justify-between">
              <span>🚏 Parada YoVoy #${s.id}</span>
              <span class="text-[10px] px-1.5 py-0.2 bg-sky-600 text-white rounded-full font-bold">${s.num_rutas} rutas</span>
            </div>
            <div class="text-slate-800 font-semibold">${s.nombre}</div>
            <div class="space-y-1 pt-1 border-t border-slate-100">
              <span class="text-[10px] font-bold text-slate-600 block">Rutas que pasan por aquí:</span>
              <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto">${rutasBadges}</div>
            </div>
          </div>
        `);

        group.addLayer(marker);
      });
    } catch (e) {
      console.error("Error al crear capa Paradas YoVoy:", e);
    }

    return group;
  },

  inicializarCapaParadasCamionesVisor() {
    const fg = this.crearCapaParadasCamiones();
    if (window.visorCapas) window.visorCapas.paradas_camiones = fg;
    return fg;
  },

  // Capa Paradas de Combis para el Geovisor
  crearCapaParadasCombis() {
    let group = null;
    if (typeof L.markerClusterGroup === 'function') {
      group = L.markerClusterGroup({
        maxClusterRadius: 40,
        disableClusteringAtZoom: 16,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false
      });
    } else {
      group = L.featureGroup();
    }

    if (!window.PARADAS_COMBIS || !Array.isArray(window.PARADAS_COMBIS)) return group;

    try {
      window.PARADAS_COMBIS.forEach(s => {
        const marker = L.circleMarker([s.lat, s.lng], {
          radius: 5,
          fillColor: '#f59e0b',
          color: '#ffffff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.95
        });

        const rutasBadges = (s.rutas || []).map(r => `
          <span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">${r}</span>
        `).join('');

        marker.bindPopup(`
          <div class="p-2 font-sans text-xs min-w-[220px] space-y-1.5">
            <div class="font-bold text-amber-700 flex items-center justify-between">
              <span>🚏 Parada Combi #${s.id}</span>
              <span class="text-[10px] px-1.5 py-0.2 bg-amber-600 text-white rounded-full font-bold">${s.num_rutas} rutas</span>
            </div>
            <div class="text-slate-800 font-semibold">${s.nombre}</div>
            <div class="space-y-1 pt-1 border-t border-slate-100">
              <span class="text-[10px] font-bold text-slate-600 block">Rutas que pasan por aquí:</span>
              <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto">${rutasBadges}</div>
            </div>
          </div>
        `);

        group.addLayer(marker);
      });
    } catch (e) {
      console.error("Error al crear capa Paradas Combis:", e);
    }

    return group;
  },

  inicializarCapaParadasCombisVisor() {
    const fg = this.crearCapaParadasCombis();
    if (window.visorCapas) window.visorCapas.paradas_combis = fg;
    return fg;
  }
};

// Auto-inicialización al cargar
document.addEventListener('DOMContentLoaded', () => {
  if (window.MovilidadApp) {
    window.MovilidadApp.init();
  }
});
