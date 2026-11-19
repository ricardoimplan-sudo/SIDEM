/**
 * PIMAgs 2026 - Módulo de Diagnóstico y Renovación de Red de Agua Potable
 * Municipio de Aguascalientes - MIAA / IMPLAN / CCAPAMA
 * Tablero de Control y Priorización Territorial para Cabildo y Tomadores de Decisiones
 * Cobertura Completa: 37,382 Tramos con Calles Oficiales, Colonias y Mapa de Calor de Fugas
 */

window.AguaPotableApp = {
  mapa: null,
  capaTuberias: null,
  capaCalorFugas: null,
  mostrarCalorFugas: true,
  opacidadCalorFugas: 0.50,
  canvasRenderer: null,
  tramos: [],
  metricas: null,
  filtroPrioridad: 'todos',
  filtroDelegacion: 'todas',
  filtroMaterial: 'todos',
  filtroDiametro: 'todos',
  filtroFugas: 'todos',
  busquedaTexto: '',
  tramoSeleccionado: null,
  paginaActual: 1,
  filasPorPagina: 100,

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

    // 1. Pane de Calor de Fugas (Raster térmico de fondo, zIndex 350, no interactivo)
    if (!this.mapa.getPane('fugasPane')) {
      this.mapa.createPane('fugasPane');
      this.mapa.getPane('fugasPane').style.zIndex = 350;
      this.mapa.getPane('fugasPane').style.pointerEvents = 'none';
    }

    // 2. Pane de Red de Tuberías (Líneas vectoriales en primer plano absoluto, zIndex 450)
    if (!this.mapa.getPane('tuberiasPane')) {
      this.mapa.createPane('tuberiasPane');
      this.mapa.getPane('tuberiasPane').style.zIndex = 450;
    }

    // Renderer Canvas de alto rendimiento asignado estrictamente al pane superior de tuberías
    this.canvasRenderer = L.canvas({ padding: 0.5, tolerance: 8, pane: 'tuberiasPane' });

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

    // Capa de Mapa de Calor de Fugas (Raster Georreferenciado en fugasPane)
    if (this.metricas && this.metricas.heatmap_fugas) {
      const hInfo = this.metricas.heatmap_fugas;
      this.capaCalorFugas = L.imageOverlay(hInfo.url, hInfo.bounds, {
        opacity: this.opacidadCalorFugas,
        pane: 'fugasPane',
        interactive: false
      });
      if (this.mostrarCalorFugas) {
        this.capaCalorFugas.addTo(this.mapa);
      }
    }

    this.capaTuberias = L.featureGroup().addTo(this.mapa);

    const baseMaps = {
      "Google Satélite e Híbrido": googleHybrid,
      "Google Calles": googleRoads,
      "Contraste Nocturno": cartoDark
    };

    const overlayMaps = {};
    if (this.capaCalorFugas) {
      overlayMaps["🔥 Mapa de Calor: Incidencias de Fugas"] = this.capaCalorFugas;
    }
    overlayMaps["💧 Red de Tuberías"] = this.capaTuberias;

    L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(this.mapa);
  },

  toggleMapaCalor(activo) {
    if (activo !== undefined) {
      this.mostrarCalorFugas = !!activo;
    } else {
      this.mostrarCalorFugas = !this.mostrarCalorFugas;
    }

    if (this.capaCalorFugas && this.mapa) {
      if (this.mostrarCalorFugas) {
        if (!this.mapa.hasLayer(this.capaCalorFugas)) {
          this.capaCalorFugas.addTo(this.mapa);
        }
      } else {
        if (this.mapa.hasLayer(this.capaCalorFugas)) {
          this.mapa.removeLayer(this.capaCalorFugas);
        }
      }
    }

    const btn = document.getElementById('btnToggleCalorFugas');
    if (btn) {
      if (this.mostrarCalorFugas) {
        btn.classList.add('bg-rose-600', 'text-white', 'border-rose-500');
        btn.classList.remove('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
      } else {
        btn.classList.remove('bg-rose-600', 'text-white', 'border-rose-500');
        btn.classList.add('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
      }
    }
  },

  cambiarOpacidadCalor(val) {
    this.opacidadCalorFugas = parseFloat(val);
    if (this.capaCalorFugas) {
      this.capaCalorFugas.setOpacity(this.opacidadCalorFugas);
    }
    const lbl = document.getElementById('lblOpacidadFugas');
    if (lbl) {
      lbl.innerText = `${Math.round(this.opacidadCalorFugas * 100)}%`;
    }
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

      // Filtro de Incidencia de Fugas
      if (this.filtroFugas !== 'todos') {
        if (this.filtroFugas === 'critica' && t.fuga_nivel !== 'CRÍTICA') return false;
        if (this.filtroFugas === 'alta' && t.fuga_nivel !== 'ALTA' && t.fuga_nivel !== 'CRÍTICA') return false;
        if (this.filtroFugas === 'media' && t.fuga_nivel !== 'MEDIA') return false;
      }

      // Filtro por Búsqueda de Texto (Calle, Colonia, ID, Delegación, Año, Material)
      if (this.busquedaTexto) {
        const q = this.busquedaTexto.toLowerCase();
        const codigo = (t.codigo || '').toLowerCase();
        const calle = (t.calle || '').toLowerCase();
        const colonia = (t.colonia || '').toLowerCase();
        const mat = (t.material || '').toLowerCase();
        const del = (t.delegacion || '').toLowerCase();
        const anio = String(t.anio || t.anio_instalacion || '');
        if (!codigo.includes(q) && !calle.includes(q) && !colonia.includes(q) && !mat.includes(q) && !del.includes(q) && !anio.includes(q)) {
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

    tramosFiltrados.forEach(tramo => {
      const coords = tramo.coords || tramo.coordenadas;
      if (!coords || coords.length === 0) return;

      const isCritico = tramo.prioridad === 'CRITICA';
      const isAlta = tramo.prioridad === 'ALTA';
      const isMedia = tramo.prioridad === 'MEDIA';

      // Semáforo de colores de alto contraste sobre el mapa de calor
      let color = '#10b981'; // Operativa / Normal
      let weight = 2.6;
      let opac = 0.9;
      if (isCritico) {
        color = '#ef4444'; // Rojo intenso brillante (Urgente / Desgaste crítico)
        weight = 4.8;
        opac = 1.0;
      } else if (isAlta) {
        color = '#f97316'; // Naranja brillante (Prioridad Alta)
        weight = 3.8;
        opac = 1.0;
      } else if (isMedia) {
        color = '#eab308'; // Amarillo oro (Preventivo)
        weight = 3.2;
        opac = 0.95;
      }

      const polyline = L.polyline(coords, {
        renderer: this.canvasRenderer,
        pane: 'tuberiasPane',
        color: color,
        weight: weight,
        opacity: opac,
        dashArray: null,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(this.capaTuberias);

      // Tooltip flotante rápido
      const fugaEmoji = tramo.fuga_nivel === 'CRÍTICA' ? '🔴' : (tramo.fuga_nivel === 'ALTA' ? '🟠' : (tramo.fuga_nivel === 'MEDIA' ? '🟡' : '🟢'));
      polyline.bindTooltip(`
        <div class="font-sans text-xs">
          <div class="font-black text-slate-900 flex items-center gap-1">
            <span>💧 Tramo ${tramo.codigo}</span>
            <span class="text-[10px] font-normal text-slate-500">• ${tramo.material} ${tramo.diametro}"</span>
          </div>
          <div class="font-bold text-sky-700 text-[11px] truncate max-w-[220px]">📍 ${tramo.calle || 'Calle Local'}</div>
          <div class="text-[10px] text-slate-600 truncate max-w-[220px]">Col. ${tramo.colonia || 'Zona Urbana'}</div>
          <div class="text-[10px] text-slate-700 mt-0.5 pt-0.5 border-t border-slate-200 flex items-center gap-1">
            <span>${fugaEmoji} Fugas: <b>${tramo.fuga_nivel}</b> (${tramo.fuga_val || '1.0'})</span>
          </div>
        </div>
      `, { sticky: true, opacity: 0.96 });

      // Popup completo al hacer clic
      polyline.bindPopup(() => this.crearPopupTramoHtml(tramo));

      polyline.on('mouseover', function () {
        this.setStyle({ weight: weight + 3, opacity: 1 });
      });
      polyline.on('mouseout', function () {
        this.setStyle({ weight: weight, opacity: opac });
      });
    });

    // Actualizar indicador de conteo
    const elConteo = document.getElementById('agua_conteo_filtrados');
    if (elConteo) {
      const sumMetros = tramosFiltrados.reduce((acc, t) => acc + (t.longitud_m || 0), 0);
      const sumInv = tramosFiltrados.reduce((acc, t) => acc + (t.inversion || 0), 0);
      const countCrit = tramosFiltrados.filter(t => t.prioridad === 'CRITICA').length;
      const countFugasAltas = tramosFiltrados.filter(t => t.fuga_nivel === 'CRÍTICA' || t.fuga_nivel === 'ALTA').length;

      elConteo.innerHTML = `Mostrando <b>${tramosFiltrados.length.toLocaleString('es-MX')} tramos</b> (${(sumMetros/1000).toLocaleString('es-MX', {maximumFractionDigits:1})} km de red) • Inversión requerida: <b class="text-cyan-300">$${(sumInv/1000000).toLocaleString('es-MX', {maximumFractionDigits:1})} MDP</b> • <span class="text-rose-400 font-bold">${countCrit.toLocaleString('es-MX')} tramos críticos</span> • <span class="text-amber-300 font-bold">${countFugasAltas.toLocaleString('es-MX')} en alta incidencia de fugas</span>`;
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
    const inversion = t.inversion || 0;
    const antiguedad = t.antiguedad || (2026 - (t.anio || 1993));
    const anio = t.anio || 1993;
    const codigo = t.codigo || `#${t.id}`;
    const delegacion = t.delegacion || 'Municipio de Aguascalientes';
    const calle = t.calle || 'Calle Local';
    const colonia = t.colonia || 'Zona Urbana';

    const badgeFuga = t.fuga_nivel === 'CRÍTICA'
      ? '<span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white shadow-xs animate-pulse">🔴 CRÍTICA / ALTA REINCIDENCIA</span>'
      : (t.fuga_nivel === 'ALTA'
          ? '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-600 text-white">🟠 ALTA DENSIDAD</span>'
          : (t.fuga_nivel === 'MEDIA'
              ? '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-900">🟡 DENSIDAD MEDIA</span>'
              : '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white">🟢 BAJA INCIDENCIA</span>'));

    const correlacionTexto = (t.fuga_nivel === 'CRÍTICA' || t.fuga_nivel === 'ALTA')
      ? (antiguedad >= 30
          ? `⚠️ <strong>Correlación Crítica Directa:</strong> Esta tubería con <b>${antiguedad} años de servicio</b> se encuentra en una zona de <b>${t.fuga_nivel} incidencia de fugas</b> (${t.fuga_val} / 3.0). La fatiga y cristalización del material provocan rupturas frecuentes bajo presión. Su sustitución es de máxima urgencia para evitar socavones y desperdicio de agua.`
          : `🔍 <strong>Zona de Alta Incidencia de Fugas (${t.fuga_val} / 3.0):</strong> Se detecta alta reincidencia de fugas en esta calle. Se recomienda sectorización hidrométrica y reemplazo de tomas domiciliarias.`)
      : (antiguedad >= 30
          ? `⏳ <strong>Vida Útil Superada (${antiguedad} años):</strong> Aunque la zona tiene incidencia moderada/baja (${t.fuga_val || '1.0'}), el material ha cumplido su ciclo de vida útil paramétrico y presenta alto riesgo de colapso repentino.`
          : `✅ <strong>Red en Buen Estado:</strong> Tramo operativo (${antiguedad} años) en zona de baja incidencia de fugas (${t.fuga_val || '1.0'}).`);

    return `
      <div class="p-3 font-sans text-xs min-w-[290px] max-w-[340px] space-y-3">
        
        <!-- Encabezado con Calle y Colonia -->
        <div class="border-b border-slate-200 pb-2">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="font-black text-slate-900 text-sm block">💧 Tramo ${codigo}</span>
              <div class="text-[12px] font-black text-sky-800 flex items-center gap-1 mt-0.5">
                <span>📍 ${calle}</span>
              </div>
              <div class="text-[10px] font-bold text-slate-600">
                Colonia: <span class="text-slate-900 font-extrabold">${colonia}</span>
              </div>
            </div>
            <div class="shrink-0 text-right">
              ${prioBadge}
            </div>
          </div>
          <div class="text-[10px] text-slate-400 mt-1">
            Demarcación: <span class="text-slate-700 font-medium">${delegacion}</span>
          </div>
        </div>

        <!-- Atributos Técnicos -->
        <div class="space-y-1.5 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px]">
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Material y Diámetro:</span>
            <span class="font-bold text-slate-900">${t.material} &bull; ${t.diametro}" (${Math.round(t.diametro * 25.4)} mm)</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Longitud del Tramo:</span>
            <span class="font-bold font-mono text-slate-900">${t.longitud_m} m lineales</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Año de Instalación:</span>
            <span class="font-bold font-mono ${isCritico ? 'text-rose-700 font-black' : 'text-slate-900'}">${anio} (${antiguedad} años de antigüedad)</span>
          </div>
        </div>

        <!-- Incidencia de Fugas y Correlación de Desgaste (Para Cabildo) -->
        <div class="p-2.5 rounded-xl bg-slate-900 text-white space-y-1.5 border border-slate-800">
          <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span class="text-[10px] uppercase font-bold text-rose-300 flex items-center gap-1">
              <span>🔥 Incidencia de Fugas:</span>
            </span>
            ${badgeFuga}
          </div>
          <p class="text-[11px] text-slate-300 leading-snug">
            ${correlacionTexto}
          </p>
        </div>

        <!-- Costo Paramétrico de Obra -->
        <div class="p-2.5 rounded-xl bg-cyan-950 text-white space-y-1 border border-cyan-800">
          <div class="text-[10px] uppercase tracking-wider text-cyan-300 font-bold">Inversión Estimada de Renovación:</div>
          <div class="text-base font-black text-white font-mono">${fmtMoney(inversion)}</div>
          <div class="text-[9px] text-slate-400">Incluye excavación, cama de asiento, tubería PEAD/PVC, reposición de tomas domiciliarias y bacheo asfáltico/concreto.</div>
        </div>

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
        btn.classList.add('bg-slate-800/80', 'text-slate-300');
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

  filtrarPorFugas(fuga) {
    this.filtroFugas = fuga;
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

      // Resaltar en blanco brillante
      const highlight = L.polyline(coords, {
        color: '#ffffff',
        weight: 9,
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

    // Ordenar: primero CRITICA, luego ALTA, luego MEDIA, luego por mayor antigüedad
    const sorted = [...tramosFiltrados].sort((a, b) => {
      const pOrder = { 'CRITICA': 1, 'ALTA': 2, 'MEDIA': 3, 'NORMAL': 4 };
      if (pOrder[a.prioridad] !== pOrder[b.prioridad]) {
        return pOrder[a.prioridad] - pOrder[b.prioridad];
      }
      const ageA = a.antiguedad || 0;
      const ageB = b.antiguedad || 0;
      return ageB - ageA;
    });

    if (sorted.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="py-8 text-center text-slate-400">
            No se encontraron tramos de tubería con los filtros seleccionados.
          </td>
        </tr>
      `;
      return;
    }

    const fmtMoney = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);

    // Primeros 150 tramos para fluidez óptima
    const topTramos = sorted.slice(0, 150);

    tbody.innerHTML = topTramos.map(t => {
      const badgePrio = t.prioridad === 'CRITICA'
        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">🔴 URGENTE (>32 años)</span>'
        : (t.prioridad === 'ALTA'
            ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">🟠 Prioridad Alta</span>'
            : (t.prioridad === 'MEDIA'
                ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">🟡 Preventivo</span>'
                : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">🟢 Operativa</span>'));

      const fVal = t.fuga_val || 1.0;
      const badgeFuga = t.fuga_nivel === 'CRÍTICA'
        ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-500/40 inline-flex items-center gap-1">🔴 Crítica (${fVal})</span>`
        : (t.fuga_nivel === 'ALTA'
            ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-950 text-orange-300 border border-orange-500/40 inline-flex items-center gap-1">🟠 Alta (${fVal})</span>`
            : (t.fuga_nivel === 'MEDIA'
                ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">🟡 Media (${fVal})</span>`
                : `<span class="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">🟢 Baja</span>`));

      const codigo = t.codigo || `#${t.id}`;
      const anio = t.anio || 1993;
      const antiguedad = t.antiguedad || (2026 - anio);
      const inv = t.inversion || 0;
      const calle = t.calle || 'Calle Local';
      const colonia = t.colonia || 'Zona Urbana';

      return `
        <tr class="hover:bg-white/5 transition border-b border-white/5 text-xs text-slate-300">
          <td class="py-2.5 px-3">
            <div class="font-mono font-bold text-white text-xs">${codigo}</div>
            <div class="text-[11px] font-bold text-cyan-300 flex items-center gap-1 mt-0.5">
              <span>📍 ${calle}</span>
            </div>
            <div class="text-[10px] text-slate-400">Col. ${colonia}</div>
          </td>
          <td class="py-2.5 px-3">${badgePrio}</td>
          <td class="py-2.5 px-3">${badgeFuga}</td>
          <td class="py-2.5 px-3"><span class="font-bold text-white">${t.material}</span> (${t.diametro}")</td>
          <td class="py-2.5 px-3 font-mono">${t.longitud_m} m</td>
          <td class="py-2.5 px-3 font-mono font-bold text-white">
            ${anio} <span class="text-[10px] font-normal text-slate-400">(${antiguedad} a)</span>
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
