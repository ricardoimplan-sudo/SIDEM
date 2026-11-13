/**
 * PIMAgs 2026 - Módulo de Diagnóstico y Renovación de Red de Agua Potable
 * Municipio de Aguascalientes - MIAA / IMPLAN / CCAPAMA
 * Tablero de Control y Priorización para Políticos y Tomadores de Decisiones
 * Cobertura Completa Municipal: 37,384 Tramos (3,074 km)
 */

window.AguaPotableApp = {
  mapa: null,
  capaTuberias: null,
  canvasRenderer: null,
  tramos: [],
  metricas: null,
  filtroPrioridad: 'criticos', // Iniciar enfocado en los críticos urgentes para impacto inmediato
  filtroDelegacion: 'todas',
  filtroMaterial: 'todos',
  filtroDiametro: 'todos',
  busquedaTexto: '',
  tramoSeleccionado: null,
  paginaActual: 1,
  filasPorPagina: 50,

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

    if (elTotalKm) elTotalKm.innerText = `${m.total_km.toLocaleString('es-MX')} km (${m.total_tramos.toLocaleString('es-MX')} tramos)`;
    if (elCriticosKm) elCriticosKm.innerText = `${m.criticos.km.toLocaleString('es-MX')} km (${m.criticos.conteo.toLocaleString('es-MX')} tramos)`;
    if (elInversionCritica) elInversionCritica.innerText = m.criticos.inversion_formato || `$${m.criticos.inversion_mdp.toLocaleString('es-MX')} MDP`;
    if (elInversionTotal) elInversionTotal.innerText = m.inversion_total_formato || `$${m.inversion_total_mdp.toLocaleString('es-MX')} MDP`;
    if (elCriticosPct) elCriticosPct.innerText = `${m.criticos.porcentaje_red}% de la red municipal`;
  },

  initMapa() {
    if (this.mapa) return;

    const contenedor = document.getElementById('mapaAguaPotable');
    if (!contenedor) return;

    // Centro geográfico de Aguascalientes
    this.mapa = L.map('mapaAguaPotable', {
      center: [21.8853, -102.2916],
      zoom: 13,
      zoomControl: true,
      maxZoom: 20,
      preferCanvas: true
    });

    // Renderer Canvas de alto rendimiento para miles de vectores simultáneos
    this.canvasRenderer = L.canvas({ padding: 0.5, tolerance: 6 });

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

    // Google Híbrido por defecto
    googleHybrid.addTo(this.mapa);

    const baseMaps = {
      "Google Satélite e Híbrido": googleHybrid,
      "Google Calles": googleRoads,
      "Contraste Nocturno": cartoDark
    };

    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(this.mapa);

    this.capaTuberias = L.featureGroup().addTo(this.mapa);
  },

  obtenerTramosFiltrados() {
    return this.tramos.filter(t => {
      // Filtro de Prioridad
      if (this.filtroPrioridad === 'criticos' && t.prioridad !== 'CRITICA') return false;
      if (this.filtroPrioridad === 'altos' && t.prioridad !== 'ALTA') return false;
      if (this.filtroPrioridad === 'medios' && t.prioridad !== 'MEDIA') return false;
      if (this.filtroPrioridad === 'normales' && t.prioridad !== 'NORMAL') return false;

      // Filtro de Delegación
      if (this.filtroDelegacion !== 'todas') {
        const delT = (t.delegacion || '').toLowerCase();
        if (!delT.includes(this.filtroDelegacion.toLowerCase())) return false;
      }

      // Filtro de Material
      if (this.filtroMaterial !== 'todos') {
        if ((t.material || '').toUpperCase() !== this.filtroMaterial.toUpperCase()) return false;
      }

      // Filtro de Diámetro
      if (this.filtroDiametro !== 'todos') {
        const diamTarget = parseFloat(this.filtroDiametro);
        if (Math.abs(t.diametro - diamTarget) > 0.4) return false;
      }

      // Filtro por Texto
      if (this.busquedaTexto) {
        const q = this.busquedaTexto.toLowerCase();
        const codigo = (t.codigo || '').toLowerCase();
        const mat = (t.material || '').toLowerCase();
        const del = (t.delegacion || '').toLowerCase();
        const anio = String(t.anio || t.anio_instalacion || '');
        if (!codigo.includes(q) && !mat.includes(q) && !del.includes(q) && !anio.includes(q)) {
          return false;
        }
      }

      return true;
    });
  },

  aplicarFiltrosYRenderizar() {
    if (!this.mapa || !this.capaTuberias) return;
    this.capaTuberias.clearLayers();

    const tramosFiltrados = this.obtenerTramosFiltrados();

    // Renderizar con Canvas
    tramosFiltrados.forEach(tramo => {
      const coords = tramo.coords || tramo.coordenadas;
      if (!coords || coords.length === 0) return;

      const isCritico = tramo.prioridad === 'CRITICA';
      const isAlta = tramo.prioridad === 'ALTA';
      const isMedia = tramo.prioridad === 'MEDIA';

      // Color por semáforo
      let color = '#10b981'; // Normal
      if (isCritico) color = '#dc2626'; // Rojo
      else if (isAlta) color = '#ea580c'; // Naranja
      else if (isMedia) color = '#eab308'; // Amarillo

      const weight = isCritico ? 4.5 : (isAlta ? 3.5 : 2.5);

      const polyline = L.polyline(coords, {
        renderer: this.canvasRenderer,
        color: color,
        weight: weight,
        opacity: isCritico ? 0.95 : 0.8,
        dashArray: isCritico ? '6,3' : null,
        lineCap: 'round'
      }).addTo(this.capaTuberias);

      polyline.bindPopup(() => this.crearPopupTramoHtml(tramo));

      polyline.on('mouseover', function () {
        this.setStyle({ weight: weight + 3, opacity: 1 });
      });
      polyline.on('mouseout', function () {
        this.setStyle({ weight: weight, opacity: isCritico ? 0.95 : 0.8 });
      });
    });

    // Actualizar indicador de conteo en la barra
    const elConteo = document.getElementById('agua_conteo_filtrados');
    if (elConteo) {
      const sumMetros = tramosFiltrados.reduce((acc, t) => acc + (t.longitud_m || 0), 0);
      const sumInv = tramosFiltrados.reduce((acc, t) => acc + (t.inversion || t.inversion_estimada_mxn || 0), 0);
      elConteo.innerHTML = `Mostrando <b>${tramosFiltrados.length.toLocaleString('es-MX')} tramos</b> (${(sumMetros/1000).toLocaleString('es-MX', {maximumFractionDigits:1})} km de red) • Inversión estimada requerida: <b class="text-cyan-300">$${(sumInv/1000000).toLocaleString('es-MX', {maximumFractionDigits:1})} MDP</b>`;
    }

    this.paginaActual = 1;
    this.renderTablaPriorizacion();
  },

  crearPopupTramoHtml(t) {
    const isCritico = t.prioridad === 'CRITICA';
    const isAlta = t.prioridad === 'ALTA';
    const isMedia = t.prioridad === 'MEDIA';

    const prioBadge = isCritico
      ? '<span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-600 text-white shadow-xs">🔴 URGENTE / VIDA ÚTIL VENCIDA</span>'
      : (isAlta
          ? '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-600 text-white">🟠 Prioridad Alta</span>'
          : (isMedia
              ? '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-600 text-white">🟡 Preventivo</span>'
              : '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white">🟢 Red Operativa</span>'));

    const fmtMoney = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);
    const inversion = t.inversion || t.inversion_estimada_mxn || 0;
    const antiguedad = t.antiguedad || t.antiguedad_anios || (2026 - (t.anio || 1993));
    const anio = t.anio || t.anio_instalacion || 1993;
    const codigo = t.codigo || `#${t.id}`;
    const delegacion = t.delegacion || 'Municipio de Aguascalientes';

    return `
      <div class="p-3 font-sans text-xs min-w-[270px] max-w-[320px] space-y-2.5">
        <div class="flex items-center justify-between border-b border-slate-200 pb-2">
          <span class="font-black text-slate-800 text-sm">💧 Tramo ${codigo}</span>
          ${prioBadge}
        </div>

        <div class="space-y-1.5 text-slate-700">
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Demarcación:</span>
            <span class="font-bold text-slate-800">${delegacion}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Material y Diámetro:</span>
            <span class="font-bold text-slate-900">${t.material} &bull; ${t.diametro}"</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Longitud del Tramo:</span>
            <span class="font-bold font-mono text-slate-900">${t.longitud_m} m</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Año de Instalación:</span>
            <span class="font-bold font-mono ${isCritico ? 'text-rose-600' : 'text-slate-900'}">${anio} (${antiguedad} años de servicio)</span>
          </div>
        </div>

        <div class="p-2.5 rounded-xl bg-slate-900 text-white space-y-1">
          <div class="text-[10px] uppercase tracking-wider text-cyan-300 font-bold">Costo Paramétrico de Renovación:</div>
          <div class="text-base font-black text-white font-mono">${fmtMoney(inversion)}</div>
          <div class="text-[10px] text-slate-400">Incluye excavación, cama de arena, tubería PEAD/PVC, atraques y pavimentación.</div>
        </div>

        ${isCritico ? `
          <div class="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800 leading-tight">
            ⚠️ <strong>Recomendación para Cabildo / Directores:</strong> Se sugiere programar sustitución inmediata en el próximo paquete de obra pública para mitigar fugas y socavones.
          </div>
        ` : ''}
      </div>
    `;
  },

  filtrarPorPrioridad(prio) {
    this.filtroPrioridad = prio;

    document.querySelectorAll('.btn-filtro-agua').forEach(btn => {
      if (btn.dataset.prio === prio) {
        btn.classList.add('bg-cyan-600', 'text-white', 'border-cyan-500');
        btn.classList.remove('bg-slate-800/80', 'text-slate-300');
      } else {
        btn.classList.remove('bg-cyan-600', 'text-white', 'border-cyan-500');
        btn.classList.add('bg-slate-800/80');
      }
    });

    this.aplicarFiltrosYRenderizar();
  },

  filtrarPorDelegacion(del) {
    this.filtroDelegacion = del;
    this.aplicarFiltrosYRenderizar();
  },

  filtrarPorMaterial(mat) {
    this.filtroMaterial = mat;
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
    if (!tramo) return;
    const coords = tramo.coords || tramo.coordenadas;
    if (!coords || coords.length === 0) return;

    if (this.mapa) {
      const bounds = L.latLngBounds(coords);
      this.mapa.fitBounds(bounds, { padding: [100, 100], maxZoom: 18 });

      // Resaltar en blanco
      const highlight = L.polyline(coords, {
        color: '#ffffff',
        weight: 8,
        opacity: 0.95
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
    // Ordenar: primero CRITICA, luego ALTA, luego MEDIA, luego por antigüedad descendente
    const sorted = [...tramosFiltrados].sort((a, b) => {
      const pOrder = { 'CRITICA': 1, 'ALTA': 2, 'MEDIA': 3, 'NORMAL': 4 };
      if (pOrder[a.prioridad] !== pOrder[b.prioridad]) {
        return pOrder[a.prioridad] - pOrder[b.prioridad];
      }
      const ageA = a.antiguedad || a.antiguedad_anios || 0;
      const ageB = b.antiguedad || b.antiguedad_anios || 0;
      return ageB - ageA;
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

    // Paginación o primeros 100 tramos más urgentes
    const topTramos = sorted.slice(0, 150);

    tbody.innerHTML = topTramos.map(t => {
      const badgePrio = t.prioridad === 'CRITICA'
        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">🔴 URGENTE (>32 años)</span>'
        : (t.prioridad === 'ALTA'
            ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">🟠 Prioridad Alta</span>'
            : (t.prioridad === 'MEDIA'
                ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">🟡 Preventivo</span>'
                : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">🟢 Operativa</span>'));

      const codigo = t.codigo || `#${t.id}`;
      const anio = t.anio || t.anio_instalacion || 1993;
      const antiguedad = t.antiguedad || t.antiguedad_anios || (2026 - anio);
      const inv = t.inversion || t.inversion_estimada_mxn || 0;
      const del = t.delegacion || 'Aguascalientes';

      return `
        <tr class="hover:bg-white/5 transition border-b border-white/5 text-xs text-slate-300">
          <td class="py-2.5 px-3 font-mono font-bold text-white">
            <div>${codigo}</div>
            <div class="text-[10px] text-slate-400">${del}</div>
          </td>
          <td class="py-2.5 px-3">${badgePrio}</td>
          <td class="py-2.5 px-3"><span class="font-bold text-white">${t.material}</span> (${t.diametro}")</td>
          <td class="py-2.5 px-3 font-mono">${t.longitud_m} m</td>
          <td class="py-2.5 px-3">
            <span class="font-bold text-white">${anio}</span> 
            <span class="text-[10px] text-slate-400">(${antiguedad} años)</span>
          </td>
          <td class="py-2.5 px-3 font-mono font-bold text-cyan-300">${fmtMoney(inv)}</td>
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
