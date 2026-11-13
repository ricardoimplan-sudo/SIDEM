/**
 * PIMAgs 2026 - Módulo de Diagnóstico y Renovación de Red de Agua Potable
 * Municipio de Aguascalientes - MIAA / IMPLAN / CCAPAMA
 * Tablero de Control y Priorización para Políticos y Tomadores de Decisiones
 */

window.AguaPotableApp = {
  mapa: null,
  capaTuberias: null,
  tramos: [],
  metricas: null,
  filtroPrioridad: 'todos',
  filtroDiametro: 'todos',
  busquedaTexto: '',
  tramoSeleccionado: null,

  init() {
    this.tramos = window.AGUA_POTABLE_TUBERIAS || [];
    this.metricas = window.AGUA_POTABLE_METRICAS || null;

    this.renderMetricasCabecera();
    this.initMapa();
    this.aplicarFiltrosYRenderizar();
    this.renderTablaPriorizacion();
    if (window.lucide) window.lucide.createIcons();
  },

  renderMetricasCabecera() {
    if (!this.metricas) return;
    const m = this.metricas;

    const elTotalKm = document.getElementById('agua_kpi_total_km');
    const elCriticosKm = document.getElementById('agua_kpi_criticos_km');
    const elInversionCritica = document.getElementById('agua_kpi_inversion_critica');
    const elInversionTotal = document.getElementById('agua_kpi_inversion_total');
    const elCriticosPct = document.getElementById('agua_kpi_criticos_pct');

    if (elTotalKm) elTotalKm.innerText = `${m.total_km} km (${m.total_tramos} tramos)`;
    if (elCriticosKm) elCriticosKm.innerText = `${m.criticos.km} km (${m.criticos.conteo} tramos)`;
    if (elInversionCritica) elInversionCritica.innerText = m.criticos.inversion_formato;
    if (elInversionTotal) elInversionTotal.innerText = m.inversion_total_formato;
    if (elCriticosPct) elCriticosPct.innerText = `${m.criticos.porcentaje_red}% de la red analizada`;
  },

  initMapa() {
    if (this.mapa) return;

    const contenedor = document.getElementById('mapaAguaPotable');
    if (!contenedor) return;

    this.mapa = L.map('mapaAguaPotable', {
      center: [21.8705, -102.2530],
      zoom: 15,
      zoomControl: true,
      maxZoom: 20
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

    // Añadir híbrido por defecto para observar calles y textura urbana
    googleHybrid.addTo(this.mapa);

    const baseMaps = {
      "Google Satélite e Híbrido": googleHybrid,
      "Google Calles": googleRoads,
      "Contraste Nocturno": cartoDark
    };

    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(this.mapa);

    this.capaTuberias = L.featureGroup().addTo(this.mapa);
  },

  aplicarFiltrosYRenderizar() {
    if (!this.mapa || !this.capaTuberias) return;
    this.capaTuberias.clearLayers();

    const tramosFiltrados = this.obtenerTramosFiltrados();
    const bounds = [];

    tramosFiltrados.forEach(tramo => {
      if (!tramo.coordenadas || tramo.coordenadas.length === 0) return;

      const isCritico = tramo.prioridad === 'CRITICA';
      const isAlta = tramo.prioridad === 'ALTA';
      const weight = isCritico ? 5.5 : (isAlta ? 4.5 : 3.5);
      const color = tramo.color || '#3b82f6';

      // Línea de tubería
      const polyline = L.polyline(tramo.coordenadas, {
        color: color,
        weight: weight,
        opacity: isCritico ? 0.95 : 0.85,
        dashArray: isCritico ? '8,4' : null,
        lineCap: 'round'
      }).addTo(this.capaTuberias);

      // Popup informativo para políticos y directores
      polyline.bindPopup(this.crearPopupTramoHtml(tramo));

      polyline.on('mouseover', function () {
        this.setStyle({ weight: weight + 3, opacity: 1 });
      });
      polyline.on('mouseout', function () {
        this.setStyle({ weight: weight, opacity: isCritico ? 0.95 : 0.85 });
      });

      tramo.coordenadas.forEach(pt => bounds.push(pt));
    });

    if (bounds.length > 0) {
      try {
        this.mapa.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 17 });
      } catch (e) {}
    }

    // Actualizar conteo visible
    const elConteo = document.getElementById('agua_conteo_filtrados');
    if (elConteo) {
      const sumMetros = tramosFiltrados.reduce((acc, t) => acc + (t.longitud_m || 0), 0);
      const sumInv = tramosFiltrados.reduce((acc, t) => acc + (t.inversion_estimada_mxn || 0), 0);
      elConteo.innerHTML = `Mostrando <b>${tramosFiltrados.length} tramos</b> (${(sumMetros/1000).toFixed(2)} km) • Inversión estimada: <b>$${(sumInv/1000000).toFixed(2)} MDP</b>`;
    }

    this.renderTablaPriorizacion();
  },

  obtenerTramosFiltrados() {
    return this.tramos.filter(t => {
      // Filtro de prioridad
      if (this.filtroPrioridad === 'criticos' && t.prioridad !== 'CRITICA') return false;
      if (this.filtroPrioridad === 'altos' && t.prioridad !== 'ALTA') return false;
      if (this.filtroPrioridad === 'medios' && t.prioridad !== 'MEDIA') return false;
      if (this.filtroPrioridad === 'normales' && t.prioridad !== 'NORMAL') return false;

      // Filtro de diámetro
      if (this.filtroDiametro !== 'todos' && String(t.diametro) !== String(this.filtroDiametro)) return false;

      // Filtro de búsqueda de texto
      if (this.busquedaTexto) {
        const q = this.busquedaTexto.toLowerCase();
        const str = `tramo ${t.id} ${t.material} ${t.diametro} ${t.anio_instalacion} ${t.prioridad} ${t.tipo_red}`.toLowerCase();
        if (!str.includes(q)) return false;
      }

      return true;
    });
  },

  crearPopupTramoHtml(t) {
    const invFmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(t.inversion_estimada_mxn);
    const colorBadge = t.prioridad === 'CRITICA' 
      ? 'bg-rose-600 text-white animate-pulse'
      : (t.prioridad === 'ALTA' ? 'bg-orange-600 text-white' : (t.prioridad === 'MEDIA' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'));

    return `
      <div class="p-3 font-sans min-w-[280px] max-w-[340px] space-y-2.5 text-xs text-slate-800">
        <div class="flex items-center justify-between border-b border-slate-200 pb-1.5">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${t.color}"></span>
            <strong class="text-sm font-black text-slate-900">Tramo de Tubería #${t.id}</strong>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${colorBadge}">
            ${t.prioridad === 'CRITICA' ? '🔴 URGENTE' : t.prioridad}
          </span>
        </div>

        <!-- Alerta Ejecutiva -->
        <div class="p-2 rounded-xl text-[11px] leading-snug font-medium ${t.prioridad === 'CRITICA' ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-slate-50 border border-slate-200 text-slate-700'}">
          ${t.estado_diagnostico}
        </div>

        <div class="grid grid-cols-2 gap-2 text-[11px]">
          <div class="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <span class="text-slate-400 block text-[9px] uppercase font-bold">Material y Diámetro</span>
            <strong class="text-slate-800 font-bold">${t.material} • ${t.diametro}" pulg</strong>
          </div>
          <div class="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <span class="text-slate-400 block text-[9px] uppercase font-bold">Longitud</span>
            <strong class="text-slate-800 font-bold">${t.longitud_m} metros</strong>
          </div>
          <div class="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <span class="text-slate-400 block text-[9px] uppercase font-bold">Año de Instalación</span>
            <strong class="text-slate-800 font-bold">${t.anio_instalacion}</strong>
          </div>
          <div class="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <span class="text-slate-400 block text-[9px] uppercase font-bold">Antigüedad en Red</span>
            <strong class="text-rose-600 font-black text-xs">${t.antiguedad_anios} años</strong>
          </div>
        </div>

        <!-- Inversión Estimada Paramétrica -->
        <div class="p-2 rounded-xl bg-cyan-50/80 border border-cyan-200 text-cyan-950 flex items-center justify-between">
          <div>
            <span class="text-[9px] uppercase font-bold text-cyan-800 block">Presupuesto Estimado de Reposición</span>
            <strong class="text-sm font-black text-cyan-900">${invFmt} MXN</strong>
          </div>
          <div class="text-right text-[10px] text-cyan-700 font-mono">
            $${t.costo_metro_estimado}/m lin
          </div>
        </div>

        <div class="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span>Red: <b>${t.tipo_red}</b> (${t.tipo_agua})</span>
          <button onclick="AguaPotableApp.centrarTramo(${t.id})" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer">
            Enfocar
          </button>
        </div>
      </div>
    `;
  },

  filtrarPorPrioridad(prioridad) {
    this.filtroPrioridad = prioridad;
    document.querySelectorAll('.btn-filtro-agua').forEach(btn => {
      if (btn.dataset.prio === prioridad) {
        btn.classList.add('bg-cyan-600', 'text-white', 'border-cyan-500');
        btn.classList.remove('bg-slate-800/80', 'text-slate-300', 'border-white/10');
      } else {
        btn.classList.remove('bg-cyan-600', 'text-white', 'border-cyan-500');
        btn.classList.add('bg-slate-800/80', 'text-slate-300', 'border-white/10');
      }
    });
    this.aplicarFiltrosYRenderizar();
  },

  filtrarPorDiametro(diam) {
    this.filtroDiametro = diam;
    this.aplicarFiltrosYRenderizar();
  },

  filtrarPorBusqueda(txt) {
    this.busquedaTexto = txt.trim();
    this.aplicarFiltrosYRenderizar();
  },

  centrarTramo(id) {
    const tramo = this.tramos.find(t => t.id === id);
    if (!tramo || !tramo.coordenadas || tramo.coordenadas.length === 0) return;

    if (this.mapa) {
      const bounds = L.latLngBounds(tramo.coordenadas);
      this.mapa.fitBounds(bounds, { padding: [100, 100], maxZoom: 18 });

      // Resaltar momentáneamente
      const highlight = L.polyline(tramo.coordenadas, {
        color: '#ffffff',
        weight: 9,
        opacity: 0.9
      }).addTo(this.mapa);

      setTimeout(() => {
        if (this.mapa && this.mapa.hasLayer(highlight)) {
          this.mapa.removeLayer(highlight);
        }
      }, 4000);
    }
  },

  renderTablaPriorizacion() {
    const tbody = document.getElementById('tabla_tuberias_body');
    if (!tbody) return;

    const tramosFiltrados = this.obtenerTramosFiltrados();
    // Ordenar primero los críticos, luego alta, luego longitud descendente
    const sorted = [...tramosFiltrados].sort((a, b) => {
      const pOrder = { 'CRITICA': 1, 'ALTA': 2, 'MEDIA': 3, 'NORMAL': 4 };
      if (pOrder[a.prioridad] !== pOrder[b.prioridad]) {
        return pOrder[a.prioridad] - pOrder[b.prioridad];
      }
      return b.antiguedad_anios - a.antiguedad_anios;
    });

    if (sorted.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-slate-400">
            No se encontraron tramos de tubería con los filtros seleccionados.
          </td>
        </tr>
      `;
      return;
    }

    const fmtMoney = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);

    tbody.innerHTML = sorted.slice(0, 100).map(t => {
      const badgePrio = t.prioridad === 'CRITICA'
        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">🔴 URGENTE (>32 años)</span>'
        : (t.prioridad === 'ALTA'
            ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">🟠 Prioridad Alta</span>'
            : (t.prioridad === 'MEDIA'
                ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">🟡 Preventivo</span>'
                : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">🟢 Operativa</span>'));

      return `
        <tr class="hover:bg-white/5 transition border-b border-white/5 text-xs text-slate-300">
          <td class="py-2.5 px-3 font-mono font-bold text-white">#${t.id}</td>
          <td class="py-2.5 px-3">${badgePrio}</td>
          <td class="py-2.5 px-3"><span class="font-bold text-white">${t.material}</span> (${t.diametro}")</td>
          <td class="py-2.5 px-3 font-mono">${t.longitud_m} m</td>
          <td class="py-2.5 px-3">
            <span class="font-bold text-white">${t.anio_instalacion}</span> 
            <span class="text-[10px] text-slate-400">(${t.antiguedad_anios} años)</span>
          </td>
          <td class="py-2.5 px-3 font-mono font-bold text-cyan-300">${fmtMoney(t.inversion_estimada_mxn)}</td>
          <td class="py-2.5 px-3 text-right">
            <button onclick="AguaPotableApp.centrarTramo(${t.id})" class="px-2 py-1 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white text-[11px] font-bold transition cursor-pointer flex items-center gap-1 inline-flex shadow-xs">
              <span>Ver en mapa</span>
              <i data-lucide="crosshair" class="w-3 h-3"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  imprimirResumenEjecutivo() {
    window.print();
  }
};
