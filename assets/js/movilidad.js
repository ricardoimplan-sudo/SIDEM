/**
 * PIMAgs - Portal de Inteligencia Municipal de Aguascalientes
 * Módulo de Movilidad Urbana y Transporte Público
 * Integración de Ciclovías, Rutas YoVoy (SITMA) y Combis Foráneas/Urbanas
 * Con buscador espacial de cercanía (Nearest-Neighbor)
 */

window.MovilidadApp = {
  mapa: null,
  capaCiclovias: null,
  capaYoVoy: null,
  capaCombis: null,
  capaCercania: null,
  marcadorUsuario: null,
  lineasCercania: null,
  filtroActivo: 'todas',
  textoBusqueda: '',
  ubicacionActual: null,
  ultimoResultadoCercania: null,

  // Inicialización del módulo
  init() {
    this.renderMetricas();
    this.renderDirectorio();
  },

  // Inicialización del mapa en la sección Movilidad
  initMapa() {
    if (this.mapa) {
      setTimeout(() => {
        this.mapa.invalidateSize();
      }, 200);
      return;
    }

    const mapaEl = document.getElementById('mapaMovilidad');
    if (!mapaEl) return;

    try {
      this.mapa = L.map('mapaMovilidad', {
        center: [21.8853, -102.2916],
        zoom: 12,
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
      this.capaCercania = L.featureGroup().addTo(this.mapa);

      // Cargar geometrías
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

  // Carga de geometrías en el mapa de Movilidad
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
          opacity: 0.8
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
          opacity: 0.85
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
    }
  },

  // Renderizado de métricas en tarjetas superiores
  renderMetricas() {
    const ciclovias = window.MOVILIDAD_CICLOVIAS || [];
    const yovoy = window.MOVILIDAD_YOVOY || [];
    const combis = window.MOVILIDAD_COMBIS || [];

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
    if (elTotalYoVoy) elTotalYoVoy.textContent = totalYoVoy.toLocaleString('es-MX');
    if (elTotalCombis) elTotalCombis.textContent = totalCombis.toLocaleString('es-MX');
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

    // Limitar render a máximo 60 para ultra rendimiento, con paginación implícita
    const sliceItems = items.slice(0, 60);

    let html = '';
    sliceItems.forEach((it, idx) => {
      let icon = it.tipo === 'ciclovia' ? 'bike' : (it.tipo === 'yovoy' ? 'bus' : 'van');
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

  // Enfoca una ruta específica en el mapa de Movilidad
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

      // Resaltado temporal
      const highlight = L.polyline(item.coords, {
        color: '#ffffff',
        weight: 6,
        opacity: 0.9,
        dashArray: '8,8'
      }).addTo(this.mapa);

      setTimeout(() => {
        if (this.mapa.hasLayer(highlight)) this.mapa.removeLayer(highlight);
      }, 4000);

      // Scroll hacia el mapa
      const mapEl = document.getElementById('mapaMovilidad');
      if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (e) {
      console.warn("No se pudo enfocar ruta:", e);
    }
  },

  // =========================================================================
  // MOTOR ESPACIAL: Búsqueda del transporte más cercano (Nearest-Neighbor)
  // =========================================================================

  // Usa la geolocalización del navegador
  usarMiUbicacionActual() {
    const btn = document.getElementById('btnMiUbicacionMov');
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 animate-spin inline mr-1.5"></i>Obteniendo GPS...`;
      if (window.lucide) window.lucide.createIcons();
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<i data-lucide="crosshair" class="w-4 h-4 inline mr-1.5"></i>Mi Ubicación GPS`;
          if (window.lucide) window.lucide.createIcons();
        }
        this.calcularTransporteMasCercano(pos.coords.latitude, pos.coords.longitude, 'Tu ubicación GPS actual');
      },
      (err) => {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<i data-lucide="crosshair" class="w-4 h-4 inline mr-1.5"></i>Mi Ubicación GPS`;
          if (window.lucide) window.lucide.createIcons();
        }
        alert("No fue posible obtener tu ubicación (" + err.message + "). Puedes hacer clic directamente en cualquier punto del mapa para seleccionarlo.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  },

  // Algoritmo proyectivo para distancia punto-a-segmento
  // P en (lat, lng), segmento A->B
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
      // Proyección escalar de P(0,0) sobre AB
      t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / l2));
    }

    const cx = ax + t * dx;
    const cy = ay + t * dy;
    const distMetros = Math.sqrt(cx * cx + cy * cy);

    // Convertir de regreso a coordenadas geográficas (lat, lng) del punto más cercano
    const clat = plat + cy / mPerDegLat;
    const clng = plng + cx / mPerDegLng;

    return {
      distancia: distMetros,
      puntoMasCercano: [clat, clng]
    };
  },

  // Recorre las polilíneas de un dataset y encuentra el elemento más cercano
  encontrarMinimoEnDataset(plat, plng, dataset, nombreId) {
    let mejor = null;
    let minDist = Infinity;
    let mejorPunto = null;

    dataset.forEach(item => {
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

      // Si coords es un arreglo de polilíneas (MultiLineString) o simple
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
      elemento: mejor,
      distanciaMetros: minDist,
      puntoMasCercano: mejorPunto
    };
  },

  // Calcula y visualiza las paradas y rutas más cercanas
  calcularTransporteMasCercano(lat, lng, origenTexto) {
    this.initMapa();
    this.ubicacionActual = [lat, lng];

    const cicloviaRes = this.encontrarMinimoEnDataset(lat, lng, window.MOVILIDAD_CICLOVIAS || [], 'ciclovia');
    const yovoyRes = this.encontrarMinimoEnDataset(lat, lng, window.MOVILIDAD_YOVOY || [], 'yovoy');
    const combiRes = this.encontrarMinimoEnDataset(lat, lng, window.MOVILIDAD_COMBIS || [], 'combi');

    this.ultimoResultadoCercania = {
      origen: [lat, lng],
      origenTexto: origenTexto || 'Punto en el mapa',
      ciclovia: cicloviaRes,
      yovoy: yovoyRes,
      combi: combiRes
    };

    // Limpiar capa de cercanía previa
    this.capaCercania.clearLayers();

    // 1. Marcador del Usuario / Punto de consulta
    const userIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-cyan-500/30 animate-ping"></div>
          <div class="w-6 h-6 rounded-full bg-cyan-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
            <span class="w-2 h-2 rounded-full bg-white"></span>
          </div>
        </div>
      `,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(this.capaCercania);
    userMarker.bindPopup(`
      <div class="p-2 font-sans text-xs">
        <span class="font-bold text-cyan-700 block">📍 ${origenTexto || 'Punto de partida'}</span>
        <span class="text-slate-600 font-mono text-[10px]">${lat.toFixed(5)}, ${lng.toFixed(5)}</span>
      </div>
    `).openPopup();

    const boundsPoints = [[lat, lng]];

    // Helper formato distancia y tiempo caminando (a ~80 m/min o 4.8 km/h)
    const fmt = (m) => {
      const tiempoMin = Math.max(1, Math.round(m / 80));
      let distStr = m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(2)} km`;
      return { distStr, tiempoMin };
    };

    // 2. Línea y marcador a Ciclovía (Verde)
    if (cicloviaRes.elemento && cicloviaRes.puntoMasCercano) {
      const f = fmt(cicloviaRes.distanciaMetros);
      boundsPoints.push(cicloviaRes.puntoMasCercano);

      L.polyline([[lat, lng], cicloviaRes.puntoMasCercano], {
        color: '#10b981',
        weight: 3,
        dashArray: '5,5',
        opacity: 0.95
      }).addTo(this.capaCercania);

      const cicloIcon = L.divIcon({
        html: `<div class="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white shadow flex items-center justify-center text-xs">🚲</div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker(cicloviaRes.puntoMasCercano, { icon: cicloIcon }).addTo(this.capaCercania)
        .bindPopup(`
          <div class="p-2 text-xs">
            <span class="font-bold text-emerald-700 block">🚲 Ciclovía más cercana</span>
            <div class="font-semibold text-slate-800">${cicloviaRes.elemento.nombre}</div>
            <div class="text-slate-600 mt-1">A <b>${f.distStr}</b> (~${f.tiempoMin} min caminando)</div>
          </div>
        `);
    }

    // 3. Línea y marcador a YoVoy (Azul)
    if (yovoyRes.elemento && yovoyRes.puntoMasCercano) {
      const f = fmt(yovoyRes.distanciaMetros);
      boundsPoints.push(yovoyRes.puntoMasCercano);

      L.polyline([[lat, lng], yovoyRes.puntoMasCercano], {
        color: '#0284c7',
        weight: 3,
        dashArray: '5,5',
        opacity: 0.95
      }).addTo(this.capaCercania);

      const busIcon = L.divIcon({
        html: `<div class="w-7 h-7 rounded-full bg-sky-600 border-2 border-white shadow flex items-center justify-center text-xs">🚌</div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker(yovoyRes.puntoMasCercano, { icon: busIcon }).addTo(this.capaCercania)
        .bindPopup(`
          <div class="p-2 text-xs">
            <span class="font-bold text-sky-700 block">🚌 Camión YoVoy más cercano</span>
            <div class="font-semibold text-slate-800">${yovoyRes.elemento.nombre}</div>
            <div class="text-slate-600 mt-1">A <b>${f.distStr}</b> (~${f.tiempoMin} min caminando)</div>
          </div>
        `);
    }

    // 4. Línea y marcador a Combi (Ámbar)
    if (combiRes.elemento && combiRes.puntoMasCercano) {
      const f = fmt(combiRes.distanciaMetros);
      boundsPoints.push(combiRes.puntoMasCercano);

      L.polyline([[lat, lng], combiRes.puntoMasCercano], {
        color: '#f59e0b',
        weight: 3,
        dashArray: '5,5',
        opacity: 0.95
      }).addTo(this.capaCercania);

      const combiIcon = L.divIcon({
        html: `<div class="w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow flex items-center justify-center text-xs">🚐</div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker(combiRes.puntoMasCercano, { icon: combiIcon }).addTo(this.capaCercania)
        .bindPopup(`
          <div class="p-2 text-xs">
            <span class="font-bold text-amber-700 block">🚐 Combi más cercana</span>
            <div class="font-semibold text-slate-800">Ruta ${combiRes.elemento.ruta}: ${combiRes.elemento.traslado}</div>
            <div class="text-slate-600 mt-1">A <b>${f.distStr}</b> (~${f.tiempoMin} min caminando)</div>
          </div>
        `);
    }

    // Ajustar zoom a todos los puntos calculados
    if (boundsPoints.length > 1) {
      this.mapa.fitBounds(L.latLngBounds(boundsPoints), { padding: [60, 60], maxZoom: 16 });
    }

    // Actualizar el panel interactivo de resultados
    this.renderPanelResultadosCercania(lat, lng, origenTexto, cicloviaRes, yovoyRes, combiRes);
  },

  // Muestra los resultados en el widget del DOM
  renderPanelResultadosCercania(lat, lng, origenTexto, cicloviaRes, yovoyRes, combiRes) {
    const contenedor = document.getElementById('mov_panel_cercania');
    if (!contenedor) return;

    const fmt = (m) => {
      if (m === Infinity || !m) return { distStr: 'N/D', tiempoMin: 0 };
      const tiempoMin = Math.max(1, Math.round(m / 80));
      let distStr = m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(2)} km`;
      return { distStr, tiempoMin };
    };

    const cFmt = fmt(cicloviaRes.distanciaMetros);
    const yFmt = fmt(yovoyRes.distanciaMetros);
    const cbFmt = fmt(combiRes.distanciaMetros);

    contenedor.innerHTML = `
      <div class="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/95 border border-cyan-500/40 shadow-xl space-y-3.5 animate-fadeIn">
        <div class="flex items-center justify-between pb-2 border-b border-white/10">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span class="text-xs font-bold text-white uppercase tracking-wider">Transportes Más Cercanos a tu Ubicación</span>
          </div>
          <span class="text-[11px] text-cyan-300 font-mono">${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- Ciclovía -->
          <div class="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between">
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span class="flex items-center gap-1.5">🚲 Ciclovía</span>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">${cFmt.distStr}</span>
              </div>
              <h5 class="font-bold text-white text-xs line-clamp-1">${cicloviaRes.elemento ? cicloviaRes.elemento.nombre : 'No disponible'}</h5>
              <p class="text-[11px] text-slate-400 line-clamp-1">${cicloviaRes.elemento ? (cicloviaRes.elemento.tipo || 'Vía ciclista') : ''}</p>
            </div>
            <div class="pt-2 mt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
              <span class="text-emerald-300 font-medium">~${cFmt.tiempoMin} min a pie</span>
              <button onclick="window.MovilidadApp.centrarPuntoCercano('ciclovia')" class="text-emerald-400 hover:text-emerald-200 font-bold transition flex items-center gap-1">
                Centrar <i data-lucide="crosshair" class="w-3 h-3"></i>
              </button>
            </div>
          </div>

          <!-- YoVoy SITMA -->
          <div class="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 flex flex-col justify-between">
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs font-bold text-sky-400">
                <span class="flex items-center gap-1.5">🚌 Camión YoVoy</span>
                <span class="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">${yFmt.distStr}</span>
              </div>
              <h5 class="font-bold text-white text-xs line-clamp-1">${yovoyRes.elemento ? yovoyRes.elemento.nombre : 'No disponible'}</h5>
              <p class="text-[11px] text-slate-400 line-clamp-1">Ruta Urbana SITMA</p>
            </div>
            <div class="pt-2 mt-2 border-t border-sky-500/20 flex items-center justify-between text-[11px]">
              <span class="text-sky-300 font-medium">~${yFmt.tiempoMin} min a pie</span>
              <button onclick="window.MovilidadApp.centrarPuntoCercano('yovoy')" class="text-sky-400 hover:text-sky-200 font-bold transition flex items-center gap-1">
                Centrar <i data-lucide="crosshair" class="w-3 h-3"></i>
              </button>
            </div>
          </div>

          <!-- Combi -->
          <div class="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex flex-col justify-between">
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs font-bold text-amber-400">
                <span class="flex items-center gap-1.5">🚐 Combi</span>
                <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">${cbFmt.distStr}</span>
              </div>
              <h5 class="font-bold text-white text-xs line-clamp-1">${combiRes.elemento ? 'Ruta ' + combiRes.elemento.ruta : 'No disponible'}</h5>
              <p class="text-[11px] text-slate-400 line-clamp-1">${combiRes.elemento ? combiRes.elemento.traslado : ''}</p>
            </div>
            <div class="pt-2 mt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px]">
              <span class="text-amber-300 font-medium">~${cbFmt.tiempoMin} min a pie</span>
              <button onclick="window.MovilidadApp.centrarPuntoCercano('combi')" class="text-amber-400 hover:text-amber-200 font-bold transition flex items-center gap-1">
                Centrar <i data-lucide="crosshair" class="w-3 h-3"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="text-center pt-1">
          <p class="text-[11px] text-slate-400">
            💡 <em>Haz clic en cualquier otro punto del mapa o presiona "📍 Mi Ubicación GPS" para recalcular distancias.</em>
          </p>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  centrarPuntoCercano(tipo) {
    if (!this.mapa || !this.ultimoResultadoCercania) return;
    const res = this.ultimoResultadoCercania[tipo];
    if (res && res.puntoMasCercano) {
      this.mapa.setView(res.puntoMasCercano, 16, { animate: true });
    }
  },

  // =========================================================================
  // INTEGRACIÓN CON EL GEOVISOR PRINCIPAL (sec-visor / mapPimags)
  // =========================================================================

  inicializarCapaCicloviasVisor() {
    if (!window.MOVILIDAD_CICLOVIAS || !Array.isArray(window.MOVILIDAD_CICLOVIAS)) return;
    try {
      window.visorCapas.ciclovias = L.featureGroup();
      window.MOVILIDAD_CICLOVIAS.forEach(c => {
        if (!c.coords) return;
        const poly = L.polyline(c.coords, {
          color: '#10b981',
          weight: 3.5,
          opacity: 0.9,
          dashArray: c.tipo && c.tipo.toLowerCase().includes('compartida') ? '5,5' : null
        });

        poly.bindPopup(`
          <div class="p-2 space-y-1 font-sans text-xs min-w-[190px]">
            <div class="font-bold text-emerald-700">🚲 Ciclovía: ${c.nombre}</div>
            <div class="text-slate-600"><b>Tipo:</b> ${c.tipo || 'Vía Ciclista'}</div>
            <div class="text-slate-600"><b>Longitud:</b> ${c.longitud_km ? c.longitud_km.toFixed(2) + ' km' : 'N/D'}</div>
          </div>
        `);
        window.visorCapas.ciclovias.addLayer(poly);
      });
    } catch (e) {
      console.error("Error al inicializar capa Ciclovías en Geovisor:", e);
    }
  },

  inicializarCapaYoVoyVisor() {
    if (!window.MOVILIDAD_YOVOY || !Array.isArray(window.MOVILIDAD_YOVOY)) return;
    try {
      window.visorCapas.yovoy = L.featureGroup();
      window.MOVILIDAD_YOVOY.forEach(y => {
        if (!y.coords) return;
        const poly = L.polyline(y.coords, {
          color: '#0284c7',
          weight: 2.8,
          opacity: 0.8
        });

        poly.bindPopup(`
          <div class="p-2 space-y-1 font-sans text-xs min-w-[200px]">
            <div class="font-bold text-sky-700">🚌 Autobús YoVoy</div>
            <div class="text-slate-800 font-semibold">${y.nombre}</div>
            <div class="text-[11px] text-sky-800">SITMA Aguascalientes</div>
          </div>
        `);
        window.visorCapas.yovoy.addLayer(poly);
      });
    } catch (e) {
      console.error("Error al inicializar capa YoVoy en Geovisor:", e);
    }
  },

  inicializarCapaCombisVisor() {
    if (!window.MOVILIDAD_COMBIS || !Array.isArray(window.MOVILIDAD_COMBIS)) return;
    try {
      window.visorCapas.combis = L.featureGroup();
      window.MOVILIDAD_COMBIS.forEach(cb => {
        if (!cb.coords) return;
        const poly = L.polyline(cb.coords, {
          color: '#f59e0b',
          weight: 2.8,
          opacity: 0.85
        });

        poly.bindPopup(`
          <div class="p-2 space-y-1 font-sans text-xs min-w-[200px]">
            <div class="font-bold text-amber-700">🚐 Combi Ruta ${cb.ruta}</div>
            <div class="text-slate-800 font-semibold">${cb.traslado}</div>
          </div>
        `);
        window.visorCapas.combis.addLayer(poly);
      });
    } catch (e) {
      console.error("Error al inicializar capa Combis en Geovisor:", e);
    }
  }
};

// Auto-inicialización al cargar
document.addEventListener('DOMContentLoaded', () => {
  if (window.MovilidadApp) {
    window.MovilidadApp.init();
  }
});
