/**
 * PIMAgs 2026 - Módulo de Preferencia Electoral y Simpatía Política
 * Análisis Territorial de Preferencias y Zonas de Voto No Afiliado (Gris)
 * Municipio de Aguascalientes - Cobertura Total de 505 Secciones Electorales
 * 12 Distritos Locales (5, 6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18) y 2 Distritos Federales (2 y 3)
 */

window.PoliticoApp = {
  mapa: null,
  capaPoligonos: null,
  secciones: [],
  metricas: null,
  modoVisualizacion: 'preferencia', // 'preferencia', 'indecisos', 'semaforo'
  filtroDistrito: 'todos',
  filtroGanador: 'todos',
  filtroSemaforo: 'todos',
  filtroNivelGris: 'todos',
  filtroOrigen: 'todos', // 'todos', 'vp', 'iee'
  busquedaTexto: '',
  seccionSeleccionada: null,

  init() {
    this.secciones = window.POLITICO_SECCIONES || [];
    this.metricas = window.POLITICO_METRICAS || null;

    this.renderMetricasCabecera();
    this.initMapa();
    this.aplicarFiltrosYRenderizar();
    this.renderTablaSecciones();
    if (window.lucide) window.lucide.createIcons();
  },

  renderMetricasCabecera() {
    if (!this.metricas) return;
    const m = this.metricas;

    const elTotalLn = document.getElementById('pol_kpi_total_ln');
    const elPan = document.getElementById('pol_kpi_pan');
    const elMorena = document.getElementById('pol_kpi_morena');
    const elGris = document.getElementById('pol_kpi_gris');
    const elPartic = document.getElementById('pol_kpi_participacion');

    if (elTotalLn) elTotalLn.innerText = `${m.total_ln.toLocaleString('es-MX')} electores`;
    if (elPan) elPan.innerHTML = `${m.pan.votos.toLocaleString('es-MX')} <span class="text-xs font-normal text-blue-300">(${m.pan.porcentaje}%)</span>`;
    if (elMorena) elMorena.innerHTML = `${m.morena.votos.toLocaleString('es-MX')} <span class="text-xs font-normal text-rose-300">(${m.morena.porcentaje}%)</span>`;
    if (elGris) elGris.innerHTML = `${m.no_simpatizan_gris.personas.toLocaleString('es-MX')} <span class="text-xs font-normal text-slate-300">(${m.no_simpatizan_gris.porcentaje_ln}%)</span>`;
    if (elPartic) elPartic.innerText = `${m.pct_participacion}% de participación en urnas`;
  },

  normalizarCoords(coords) {
    if (!coords || !Array.isArray(coords) || coords.length === 0) return null;
    // Si ya es un arreglo de pares [[lat, lng], [lat, lng], ...]
    if (Array.isArray(coords[0]) && coords[0].length >= 2) {
      return coords;
    }
    // Si viene como arreglo plano [lat, lng, lat, lng, ...]
    if (typeof coords[0] === 'number') {
      const pares = [];
      for (let i = 0; i < coords.length; i += 2) {
        if (coords[i + 1] !== undefined) {
          pares.push([coords[i], coords[i + 1]]);
        }
      }
      return pares.length >= 3 ? pares : null;
    }
    return null;
  },

  initMapa() {
    if (this.mapa) return;

    const contenedor = document.getElementById('mapaPolitico');
    if (!contenedor) return;

    this.mapa = L.map('mapaPolitico', {
      center: [21.8853, -102.2916],
      zoom: 12,
      zoomControl: true,
      maxZoom: 18
    });

    // Capas Base
    const googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '© Google Maps'
    });

    const googleRoads = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '© Google Maps'
    });

    const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© CartoDB'
    });

    googleHybrid.addTo(this.mapa);

    const baseMaps = {
      "Google Satélite e Híbrido": googleHybrid,
      "Google Calles": googleRoads,
      "Contraste Nocturno": cartoDark
    };

    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(this.mapa);

    this.capaPoligonos = L.featureGroup().addTo(this.mapa);
  },

  cambiarModo(modo) {
    this.modoVisualizacion = modo;

    document.querySelectorAll('.btn-modo-pol').forEach(btn => {
      if (btn.dataset.modo === modo) {
        btn.classList.add('bg-cyan-600', 'text-white', 'border-cyan-500');
        btn.classList.remove('bg-slate-800/80', 'text-slate-300');
      } else {
        btn.classList.remove('bg-cyan-600', 'text-white', 'border-cyan-500');
        btn.classList.add('bg-slate-800/80');
      }
    });

    this.aplicarFiltrosYRenderizar();
  },

  obtenerSeccionesFiltradas() {
    return this.secciones.filter(s => {
      // Filtro Distrito (Local o Federal)
      if (this.filtroDistrito !== 'todos') {
        if (this.filtroDistrito.startsWith('fed-')) {
          const fedNum = parseInt(this.filtroDistrito.replace('fed-', ''));
          if (s.distrito_f !== fedNum) return false;
        } else {
          if (s.distrito_l !== parseInt(this.filtroDistrito)) return false;
        }
      }

      // Filtro Origen de Datos
      if (this.filtroOrigen === 'vp') {
        if (!s.es_muestra_vp) return false;
      } else if (this.filtroOrigen === 'iee') {
        if (s.es_muestra_vp) return false;
      }

      // Filtro Ganador
      if (this.filtroGanador !== 'todos') {
        if (s.ganador !== this.filtroGanador) return false;
      }

      // Filtro Semáforo
      if (this.filtroSemaforo !== 'todos') {
        if (!s.semaforo.toUpperCase().includes(this.filtroSemaforo.toUpperCase())) return false;
      }

      // Filtro Nivel de Indecisos / No Voto (Gris)
      if (this.filtroNivelGris !== 'todos') {
        const threshold = parseFloat(this.filtroNivelGris);
        if (s.pct_no_voto < threshold) return false;
      }

      // Filtro Texto (Sección, Colonia o Distrito)
      if (this.busquedaTexto) {
        const q = this.busquedaTexto.toLowerCase();
        const seccStr = String(s.seccion);
        const distStr = `distrito ${s.distrito_l}`;
        const desStr = (s.desarrollo || '').toLowerCase();
        const delStr = (s.deleg || '').toLowerCase();
        if (!seccStr.includes(q) && !distStr.includes(q) && !desStr.includes(q) && !delStr.includes(q)) return false;
      }

      return true;
    });
  },

  aplicarFiltrosYRenderizar() {
    if (!this.mapa || !this.capaPoligonos) return;
    this.capaPoligonos.clearLayers();

    const seccionesFiltradas = this.obtenerSeccionesFiltradas();

    seccionesFiltradas.forEach(s => {
      const coords = this.normalizarCoords(s.coords);
      if (!coords || coords.length === 0) return;

      let fillColor = '#2563eb';
      let strokeColor = '#1d4ed8';
      let fillOpacity = 0.65;

      if (this.modoVisualizacion === 'preferencia') {
        // Azul PAN vs Rojo MORENA
        if (s.ganador === 'MORENA') {
          fillColor = '#dc2626';
          strokeColor = '#b91c1c';
          fillOpacity = Math.min(0.85, 0.45 + (s.pct_margen / 100));
        } else if (s.ganador === 'PAN') {
          fillColor = '#2563eb';
          strokeColor = '#1e40af';
          fillOpacity = Math.min(0.85, 0.45 + (s.pct_margen / 100));
        } else {
          fillColor = '#6b7280';
          strokeColor = '#4b5563';
        }
      } else if (this.modoVisualizacion === 'indecisos') {
        // Enfoque en No Simpatizantes / Voto Gris (>50%, >60%, >70%)
        if (s.pct_no_voto >= 65) {
          fillColor = '#475569'; // Gris oscuro intenso
          strokeColor = '#0f172a';
          fillOpacity = 0.85;
        } else if (s.pct_no_voto >= 50) {
          fillColor = '#64748b'; // Gris medio
          strokeColor = '#334155';
          fillOpacity = 0.70;
        } else if (s.pct_no_voto >= 40) {
          fillColor = '#94a3b8'; // Gris claro
          strokeColor = '#475569';
          fillOpacity = 0.55;
        } else {
          fillColor = '#cbd5e1'; // Gris muy claro
          strokeColor = '#64748b';
          fillOpacity = 0.40;
        }
      } else if (this.modoVisualizacion === 'semaforo') {
        if (s.semaforo.includes('ALTO')) {
          fillColor = '#ef4444'; // Rojo riesgo alto
          strokeColor = '#991b1b';
          fillOpacity = 0.8;
        } else if (s.semaforo.includes('MEDIANO')) {
          fillColor = '#f59e0b'; // Ámbar mediano riesgo
          strokeColor = '#b45309';
          fillOpacity = 0.7;
        } else {
          fillColor = '#10b981'; // Verde bajo riesgo
          strokeColor = '#047857';
          fillOpacity = 0.65;
        }
      }

      const polygon = L.polygon(coords, {
        color: strokeColor,
        weight: 1.5,
        fillColor: fillColor,
        fillOpacity: fillOpacity
      }).addTo(this.capaPoligonos);

      // Tooltip rápido al pasar el cursor
      const desCorto = s.desarrollo ? (s.desarrollo.length > 35 ? s.desarrollo.substring(0, 35) + '...' : s.desarrollo) : 'Zona Urbana';
      polygon.bindTooltip(`
        <div class="font-sans text-xs font-bold">
          Sección ${s.seccion} &bull; Distrito Local ${s.distrito_l} (Fed. ${s.distrito_f})<br>
          <span class="text-slate-500 font-normal text-[10px]">${desCorto}</span><br>
          <span style="color:#2563eb">🔵 PAN: ${s.pct_pan}%</span> &bull; 
          <span style="color:#dc2626">🔴 MORENA: ${s.pct_morena}%</span><br>
          <span style="color:#64748b">⚪ No simpatizan: ${s.pct_no_voto}% (${s.no_voto.toLocaleString('es-MX')} pers.)</span>
        </div>
      `, { sticky: true, opacity: 0.95 });

      // Popup completo interactivo
      polygon.bindPopup(() => this.crearPopupSeccionHtml(s));

      polygon.on('mouseover', function () {
        this.setStyle({ weight: 3.5, fillOpacity: 0.95, color: '#ffffff' });
      });
      polygon.on('mouseout', function () {
        this.setStyle({ weight: 1.5, fillOpacity: fillOpacity, color: strokeColor });
      });
    });

    // Actualizar indicador de conteo
    const elConteo = document.getElementById('pol_conteo_filtradas');
    if (elConteo) {
      const sumLn = seccionesFiltradas.reduce((acc, s) => acc + s.ln, 0);
      const sumNoVoto = seccionesFiltradas.reduce((acc, s) => acc + s.no_voto, 0);
      const pctGris = sumLn > 0 ? ((sumNoVoto / sumLn) * 100).toFixed(1) : 0;
      const countVp = seccionesFiltradas.filter(s => s.es_muestra_vp).length;
      const countIee = seccionesFiltradas.length - countVp;
      elConteo.innerHTML = `Mostrando <b>${seccionesFiltradas.length} secciones</b> de 505 electorales &bull; Lista Nominal: <b>${sumLn.toLocaleString('es-MX')}</b> electores &bull; No simpatizantes / voto flotante (Gris): <b class="text-amber-300">${sumNoVoto.toLocaleString('es-MX')} (${pctGris}%)</b> &bull; <span class="text-slate-400 text-[11px]">(Muestra VP: ${countVp} | Cobertura IEE: ${countIee})</span>`;
    }

    this.renderTablaSecciones();
  },

  crearPopupSeccionHtml(s) {
    const isPan = s.ganador === 'PAN';
    const isMor = s.ganador === 'MORENA';

    const semaforoBadge = s.semaforo.includes('ALTO')
      ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-xs">🔴 RIESGO ALTO</span>'
      : (s.semaforo.includes('MEDIANO')
          ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-900 shadow-xs">🟡 MEDIANO RIESGO</span>'
          : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">🟢 BAJO RIESGO</span>');

    const badgeOrigen = s.es_muestra_vp
      ? '<span class="px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-100 text-blue-900 border border-blue-300 inline-flex items-center gap-1">📁 Base de Datos VP</span>'
      : '<span class="px-2 py-0.5 rounded-md text-[9px] font-bold bg-purple-100 text-purple-900 border border-purple-300 inline-flex items-center gap-1">🗺️ Cartografía Oficial IEE / Proy.</span>';

    return `
      <div class="p-3 font-sans text-xs min-w-[310px] max-w-[360px] space-y-3">
        
        <!-- Encabezado -->
        <div class="flex items-start justify-between border-b border-slate-200 pb-2">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-black text-slate-900 text-base">🗳️ Sección ${s.seccion}</span>
              ${badgeOrigen}
            </div>
            <span class="text-[11px] font-bold text-slate-700 block mt-0.5">
              Distrito Local ${s.distrito_l} &bull; Distrito Federal ${s.distrito_f}
            </span>
            ${s.desarrollo ? `<span class="text-[10px] text-slate-500 block truncate max-w-[240px] font-medium" title="${s.desarrollo}">📍 ${s.desarrollo}</span>` : ''}
          </div>
          ${semaforoBadge}
        </div>

        <!-- Barras de Preferencia y Simpatía -->
        <div class="space-y-2">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-600">Simpatía y Voto Ciudadano:</div>
          
          <!-- Barra PAN (Azul) -->
          <div class="space-y-1">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-blue-700 flex items-center gap-1">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>PAN (Azul)</span>
              </span>
              <span class="font-mono font-bold text-slate-800">${s.pan.toLocaleString('es-MX')} votos (${s.pct_pan}%)</span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div class="h-full bg-blue-600 rounded-full" style="width: ${Math.min(100, s.pct_pan)}%"></div>
            </div>
          </div>

          <!-- Barra MORENA (Rojo) -->
          <div class="space-y-1">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-rose-700 flex items-center gap-1">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <span>MORENA (Rojo)</span>
              </span>
              <span class="font-mono font-bold text-slate-800">${s.morena.toLocaleString('es-MX')} votos (${s.pct_morena}%)</span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div class="h-full bg-rose-600 rounded-full" style="width: ${Math.min(100, s.pct_morena)}%"></div>
            </div>
          </div>

          <!-- Barra GRIS: Gente que no simpatiza aún / No voto -->
          <div class="space-y-1 p-2 rounded-xl bg-slate-100 border border-slate-200">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-slate-700 flex items-center gap-1">
                <span class="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                <span>No Simpatiza / Indecisos (Gris)</span>
              </span>
              <span class="font-mono font-black text-slate-900">${s.no_voto.toLocaleString('es-MX')} (${s.pct_no_voto}%)</span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-300 overflow-hidden">
              <div class="h-full bg-slate-600 rounded-full" style="width: ${Math.min(100, s.pct_no_voto)}%"></div>
            </div>
            <span class="text-[10px] text-slate-500 block leading-tight">
              Población de la Lista Nominal que no votó o aún no tiene partido definido.
            </span>
          </div>

        </div>

        <!-- Otros Partidos (PRI, MC, PRD, PVEM, PT) -->
        <div class="grid grid-cols-4 gap-1 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px]">
          <div><span class="text-slate-400 block font-bold">MC:</span><span class="font-bold text-amber-700">${s.mc || 0}</span></div>
          <div><span class="text-slate-400 block font-bold">PRI:</span><span class="font-bold text-red-700">${s.pri || 0}</span></div>
          <div><span class="text-slate-400 block font-bold">PVEM:</span><span class="font-bold text-emerald-700">${s.pvem || 0}</span></div>
          <div><span class="text-slate-400 block font-bold">PT:</span><span class="font-bold text-rose-800">${s.pt || 0}</span></div>
        </div>

        <!-- Datos Clave -->
        <div class="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200">
          <div>
            <span class="text-slate-500 block">Margen de Ventaja:</span>
            <span class="font-bold ${isPan ? 'text-blue-700' : 'text-rose-700'}">${s.diferencia.toLocaleString('es-MX')} votos (${s.pct_margen}%)</span>
          </div>
          <div>
            <span class="text-slate-500 block">Lista Nominal Total:</span>
            <span class="font-bold text-slate-800 font-mono">${s.ln.toLocaleString('es-MX')} electores</span>
          </div>
        </div>

        <!-- Recomendación Territorial para Políticos -->
        <div class="p-2.5 rounded-xl bg-slate-900 text-white space-y-1">
          <div class="text-[10px] font-bold uppercase tracking-wider text-cyan-300">🎯 Recomendación Territorial:</div>
          <p class="text-[11px] text-slate-300 leading-tight">
            ${s.pct_no_voto >= 50 
              ? `<strong>Zona de Máxima Oportunidad:</strong> ${s.no_voto.toLocaleString('es-MX')} personas no tienen filiación activa. Se recomienda intensificar brigadeo territorial, obras de cercanía y eventos de afiliación.`
              : `Zona con participación activa (${(100 - s.pct_no_voto).toFixed(1)}%). Reforzar fidelización y estructura electoral.`}
          </p>
        </div>

      </div>
    `;
  },

  filtrarPorDistrito(dist) {
    this.filtroDistrito = dist;
    this.aplicarFiltrosYRenderizar();
  },

  filtrarPorOrigen(orig) {
    this.filtroOrigen = orig;
    this.aplicarFiltrosYRenderizar();
  },

  filtrarPorGanador(gan) {
    this.filtroGanador = gan;
    this.aplicarFiltrosYRenderizar();
  },

  filtrarPorSemaforo(sem) {
    this.filtroSemaforo = sem;
    this.aplicarFiltrosYRenderizar();
  },

  filtrarPorNivelGris(val) {
    this.filtroNivelGris = val;
    this.aplicarFiltrosYRenderizar();
  },

  filtrarPorBusqueda(txt) {
    this.busquedaTexto = txt.trim();
    this.aplicarFiltrosYRenderizar();
  },

  centrarSeccion(seccNum) {
    const s = this.secciones.find(item => item.seccion === seccNum);
    if (!s) return;
    const coords = this.normalizarCoords(s.coords);
    if (!coords || coords.length === 0) return;

    if (this.mapa) {
      const bounds = L.polygon(coords).getBounds();
      this.mapa.fitBounds(bounds, { padding: [80, 80], maxZoom: 16 });

      const highlight = L.polygon(coords, {
        color: '#ffffff',
        weight: 6,
        fillColor: '#ffffff',
        fillOpacity: 0.3
      }).addTo(this.mapa);

      setTimeout(() => {
        if (this.mapa && this.mapa.hasLayer(highlight)) {
          this.mapa.removeLayer(highlight);
        }
      }, 3500);
    }
  },

  renderTablaSecciones() {
    const tbody = document.getElementById('tabla_politico_body');
    if (!tbody) return;

    const seccionesFiltradas = this.obtenerSeccionesFiltradas();

    // Ordenar por defecto por mayor volumen de indecisos (Gris) para guiar la estrategia
    const sorted = [...seccionesFiltradas].sort((a, b) => b.no_voto - a.no_voto);

    if (sorted.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-slate-400">
            No se encontraron secciones con los filtros seleccionados.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = sorted.slice(0, 100).map(s => {
      const badgeGanador = s.ganador === 'PAN'
        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40">🔵 PAN</span>'
        : '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">🔴 MORENA</span>';

      const semBadge = s.semaforo.includes('ALTO')
        ? '<span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/30 text-rose-300">🔴 Alto</span>'
        : (s.semaforo.includes('MEDIANO')
            ? '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/30 text-amber-300">🟡 Medio</span>'
            : '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/30 text-emerald-300">🟢 Bajo</span>');

      const colName = s.desarrollo ? (s.desarrollo.length > 25 ? s.desarrollo.substring(0, 25) + '...' : s.desarrollo) : '';

      return `
        <tr class="hover:bg-white/5 transition border-b border-white/5 text-xs text-slate-300">
          <td class="py-2.5 px-3 font-mono font-bold text-white">
            <span>Secc. ${s.seccion}</span>
            <span class="text-[10px] text-cyan-400 block font-sans">Distrito ${s.distrito_l} (Fed. ${s.distrito_f})</span>
            ${colName ? `<span class="text-[10px] text-slate-400 block font-normal truncate max-w-[140px]" title="${s.desarrollo}">${colName}</span>` : ''}
          </td>
          <td class="py-2.5 px-3">${badgeGanador}</td>
          <td class="py-2.5 px-3 font-mono">
            <span class="font-bold text-blue-400">${s.pan.toLocaleString('es-MX')}</span>
            <span class="text-[10px] text-slate-400 block">(${s.pct_pan}%)</span>
          </td>
          <td class="py-2.5 px-3 font-mono">
            <span class="font-bold text-rose-400">${s.morena.toLocaleString('es-MX')}</span>
            <span class="text-[10px] text-slate-400 block">(${s.pct_morena}%)</span>
          </td>
          <td class="py-2.5 px-3 font-mono">
            <span class="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
              ⚪ ${s.no_voto.toLocaleString('es-MX')}
            </span>
            <span class="text-[10px] text-amber-300 block font-bold">${s.pct_no_voto}% de LN</span>
          </td>
          <td class="py-2.5 px-3">${semBadge}</td>
          <td class="py-2.5 px-3 text-right">
            <button onclick="PoliticoApp.centrarSeccion(${s.seccion})" class="px-2.5 py-1 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white text-[11px] font-bold transition cursor-pointer flex items-center gap-1 inline-flex shadow-xs">
              <span>Ubicar</span>
              <i data-lucide="crosshair" class="w-3 h-3"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  imprimirResumenPolitico() {
    window.print();
  }
};
