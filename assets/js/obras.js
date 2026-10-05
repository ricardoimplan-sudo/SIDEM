/**
 * PIMAgs - Controlador del Módulo de Obra Pública de Aguascalientes
 * Gestiona el visor cartográfico Leaflet (Puntos y Líneas viales), clusters,
 * métricas KPI reactivas, gráficos Chart.js dinámicos, filtros avanzados,
 * paginación de proyectos, ficha técnica y exportador CSV.
 */

window.ObrasApp = {
  mapa: null,
  clusterGroup: null,
  lineasGroup: null,
  radarCircle: null,
  capaCalles: null,
  capaSatelite: null,
  capaPositron: null,
  
  graficoRubros: null,
  graficoAnual: null,
  graficoTopObras: null,
  modoGraficoRubro: 'monto',

  itemSeleccionadoId: null,
  marcadorSeleccionado: null,
  inicializado: false,

  filtros: {
    anio: 'todos',
    rubro: 'todos',
    tipoGeom: 'todos',
    monto: 'todos',
    texto: ''
  },

  paginacion: {
    paginaActual: 1,
    porPagina: 15,
    totalPaginas: 1
  },

  itemsFiltrados: [],

  iconosRubro: {
    'Vialidades y Pavimentación': { icon: 'navigation', color: '#009FB9', bg: '#ECFEFF' },
    'Agua y Saneamiento': { icon: 'droplets', color: '#0A3B66', bg: '#EFF6FF' },
    'Espacios Públicos y Deporte': { icon: 'trees', color: '#72B626', bg: '#F0FDF4' },
    'Infraestructura Urbana': { icon: 'hammer', color: '#7C3AED', bg: '#F5F3FF' },
    'Edificación y Equipamiento': { icon: 'building-2', color: '#E11482', bg: '#FDF2F8' },
    'Alumbrado y Electrificación': { icon: 'zap', color: '#F5A800', bg: '#FFFBEB' }
  },

  iniciar() {
    if (!window.OBRAS_METRICAS || !window.OBRAS_ITEMS) {
      console.warn('Datos de Obra Pública no disponibles.');
      return;
    }

    try {
      this.itemsFiltrados = [...window.OBRAS_ITEMS];
      this.poblarSelectores();
      this.iniciarMapa();
      this.iniciarGraficos();
      this.aplicarFiltros();
      this.inicializado = true;
    } catch (err) {
      console.error('Error al iniciar ObrasApp:', err);
    }
  },

  poblarSelectores() {
    const selRubro = document.getElementById('obraFiltroRubro');
    if (selRubro) {
      const rubros = window.OBRAS_METRICAS.porRubro || [];
      let html = '<option value="todos">Todos los Rubros (6 sectores)</option>';
      rubros.forEach(r => {
        html += `<option value="${r.nombre}">${r.nombre} (${r.total} obras)</option>`;
      });
      selRubro.innerHTML = html;
    }
  },

  iniciarMapa() {
    const contenedor = document.getElementById('mapaObras');
    if (!contenedor) return;

    if (this.mapa) {
      try { this.mapa.remove(); } catch(e) {}
      this.mapa = null;
    }

    const centroAgs = [21.8853, -102.2916];

    this.mapa = L.map('mapaObras', {
      center: centroAgs,
      zoom: 12,
      zoomControl: false,
      scrollWheelZoom: true
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.mapa);

    // Capas Base
    this.capaCalles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | IMPLAN Aguascalientes',
      maxZoom: 19
    });

    this.capaSatelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar',
      maxZoom: 18
    });

    this.capaPositron = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Topo Map',
      maxZoom: 19
    });

    this.capaCalles.addTo(this.mapa);

    if (typeof L.markerClusterGroup === 'function') {
      this.clusterGroup = L.markerClusterGroup({
        maxClusterRadius: 45,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          let cClass = 'bg-brand-navy text-white';
          let size = 36;
          if (count > 50) {
            cClass = 'bg-brand-cyan text-white';
            size = 44;
          } else if (count > 20) {
            cClass = 'bg-brand-magenta text-white';
            size = 40;
          }
          return L.divIcon({
            html: `<div class="${cClass} w-full h-full rounded-full flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white ring-2 ring-black/10">${count}</div>`,
            className: 'custom-cluster-icon',
            iconSize: L.point(size, size)
          });
        }
      });
    } else {
      this.clusterGroup = L.featureGroup();
    }

    this.lineasGroup = L.featureGroup();

    this.mapa.addLayer(this.clusterGroup);
    this.mapa.addLayer(this.lineasGroup);
  },

  cambiarCapaMapa(tipo) {
    if (!this.mapa) return;

    if (this.capaCalles) this.mapa.removeLayer(this.capaCalles);
    if (this.capaSatelite) this.mapa.removeLayer(this.capaSatelite);
    if (this.capaPositron) this.mapa.removeLayer(this.capaPositron);

    const btnCalles = document.getElementById('btnObraCapaCalles');
    const btnSat = document.getElementById('btnObraCapaSat');
    const btnPos = document.getElementById('btnObraCapaPos');

    const baseClass = 'px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm border cursor-pointer transition';
    const activeClass = 'bg-brand-navy text-white border-brand-navy';
    const inactiveClass = 'bg-white/90 text-slate-700 hover:bg-slate-100 border-slate-200';

    if (btnCalles) btnCalles.className = `${baseClass} ${inactiveClass}`;
    if (btnSat) btnSat.className = `${baseClass} ${inactiveClass}`;
    if (btnPos) btnPos.className = `${baseClass} ${inactiveClass}`;

    if (tipo === 'satelite') {
      this.capaSatelite.addTo(this.mapa);
      if (btnSat) btnSat.className = `${baseClass} ${activeClass}`;
    } else if (tipo === 'positron') {
      this.capaPositron.addTo(this.mapa);
      if (btnPos) btnPos.className = `${baseClass} ${activeClass}`;
    } else {
      this.capaCalles.addTo(this.mapa);
      if (btnCalles) btnCalles.className = `${baseClass} ${activeClass}`;
    }
  },

  centrarMapa() {
    if (!this.mapa) return;
    try {
      if (this.lineasGroup && this.clusterGroup && (this.lineasGroup.getLayers().length > 0 || this.clusterGroup.getLayers().length > 0)) {
        const bounds = L.latLngBounds([]);
        if (this.clusterGroup.getLayers().length > 0) {
          bounds.extend(this.clusterGroup.getBounds());
        }
        if (this.lineasGroup.getLayers().length > 0) {
          bounds.extend(this.lineasGroup.getBounds());
        }
        if (bounds.isValid()) {
          this.mapa.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
          return;
        }
      }
      this.mapa.setView([21.8853, -102.2916], 12);
    } catch (e) {
      this.mapa.setView([21.8853, -102.2916], 12);
    }
  },

  filtrarPorAnio(anio, btnElement) {
    this.filtros.anio = anio;
    
    document.querySelectorAll('.tab-anio-obra').forEach(btn => {
      btn.classList.remove('bg-brand-navy', 'text-white', 'shadow-md');
      btn.classList.add('bg-white', 'text-slate-600', 'hover:bg-slate-50', 'border-slate-200');
    });

    if (btnElement) {
      btnElement.classList.remove('bg-white', 'text-slate-600', 'hover:bg-slate-50', 'border-slate-200');
      btnElement.classList.add('bg-brand-navy', 'text-white', 'shadow-md');
    }

    this.paginacion.paginaActual = 1;
    this.aplicarFiltros();
  },

  filtrarPorRubro(rubro) {
    this.filtros.rubro = rubro;
    this.paginacion.paginaActual = 1;
    this.aplicarFiltros();
  },

  filtrarPorTipo(tipo) {
    this.filtros.tipoGeom = tipo;
    this.paginacion.paginaActual = 1;
    this.aplicarFiltros();
  },

  filtrarPorMonto(monto) {
    this.filtros.monto = monto;
    this.paginacion.paginaActual = 1;
    this.aplicarFiltros();
  },

  filtrarPorTexto(texto) {
    this.filtros.texto = (texto || '').toLowerCase().trim();
    this.paginacion.paginaActual = 1;
    this.aplicarFiltros();
  },

  limpiarFiltros() {
    this.filtros = {
      anio: 'todos',
      rubro: 'todos',
      tipoGeom: 'todos',
      monto: 'todos',
      texto: ''
    };

    const selRubro = document.getElementById('obraFiltroRubro');
    const selTipo = document.getElementById('obraFiltroTipo');
    const selMonto = document.getElementById('obraFiltroMonto');
    const inputBusq = document.getElementById('obraInputBusqueda');

    if (selRubro) selRubro.value = 'todos';
    if (selTipo) selTipo.value = 'todos';
    if (selMonto) selMonto.value = 'todos';
    if (inputBusq) inputBusq.value = '';

    const tabTodos = document.getElementById('tabObraAnioTodos');
    if (tabTodos) {
      this.filtrarPorAnio('todos', tabTodos);
    } else {
      this.aplicarFiltros();
    }
  },

  aplicarFiltros() {
    const items = window.OBRAS_ITEMS || [];

    this.itemsFiltrados = items.filter(item => {
      if (this.filtros.anio !== 'todos' && item.anio.toString() !== this.filtros.anio.toString()) {
        return false;
      }
      if (this.filtros.rubro !== 'todos' && item.rubro !== this.filtros.rubro) {
        return false;
      }
      if (this.filtros.tipoGeom !== 'todos' && item.tipoGeom !== this.filtros.tipoGeom) {
        return false;
      }
      if (this.filtros.monto === 'con_monto' && (!item.monto || item.monto <= 0)) {
        return false;
      }
      if (this.filtros.monto === 'sin_monto' && item.monto > 0) {
        return false;
      }
      if (this.filtros.monto === 'mayor_1m' && item.monto < 1000000) {
        return false;
      }
      if (this.filtros.monto === 'mayor_5m' && item.monto < 5000000) {
        return false;
      }
      if (this.filtros.monto === 'mayor_10m' && item.monto < 10000000) {
        return false;
      }
      if (this.filtros.texto) {
        const fullTxt = `${item.nombre} ${item.descripcion} ${item.clave} ${item.colonia} ${item.rubro} ${item.fuente}`.toLowerCase();
        if (!fullTxt.includes(this.filtros.texto)) {
          return false;
        }
      }
      return true;
    });

    this.actualizarKPIs();
    this.renderizarMapa();
    this.renderizarTabla();
    this.actualizarGraficos();
    
    if (window.lucide) {
      setTimeout(() => lucide.createIcons(), 50);
    }
  },

  actualizarKPIs() {
    const total = this.itemsFiltrados.length;
    const invTotal = this.itemsFiltrados.reduce((sum, item) => sum + (item.monto || 0), 0);
    const paop2025 = this.itemsFiltrados.filter(item => item.anio === 2025).length;

    const rubrosCount = {};
    this.itemsFiltrados.forEach(i => {
      rubrosCount[i.rubro] = (rubrosCount[i.rubro] || 0) + 1;
    });
    let topRubro = 'Vialidades';
    let maxR = 0;
    for (const r in rubrosCount) {
      if (rubrosCount[r] > maxR) {
        maxR = rubrosCount[r];
        topRubro = r;
      }
    }

    const elTotal = document.getElementById('obraKpiTotal');
    const elInversion = document.getElementById('obraKpiInversion');
    const elTopRubro = document.getElementById('obraKpiTopRubro');
    const elPaop = document.getElementById('obraKpiPaop');

    if (elTotal) elTotal.innerText = total.toLocaleString('es-MX');
    if (elInversion) elInversion.innerText = this.formatearMoneda(invTotal);
    if (elTopRubro) elTopRubro.innerText = topRubro;
    if (elPaop) elPaop.innerText = paop2025.toLocaleString('es-MX');
  },

  formatearMoneda(monto) {
    if (!monto || monto === 0) return '$0.00 MXN';
    if (monto >= 1000000) {
      return `$${(monto / 1000000).toFixed(2)}M MXN`;
    }
    return `$${monto.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
  },

  formatearMonedaCompleta(monto) {
    if (!monto || monto === 0) return 'Sin monto registrado en KML';
    return `$${monto.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
  },

  renderizarMapa() {
    if (!this.mapa || !this.clusterGroup || !this.lineasGroup) return;

    this.clusterGroup.clearLayers();
    this.lineasGroup.clearLayers();
    this.removerRadar();

    this.itemsFiltrados.forEach(item => {
      const infoRubro = this.iconosRubro[item.rubro] || { color: '#009FB9', icon: 'hammer' };
      const color = infoRubro.color;

      const fotoHtml = item.foto ? `
        <div class="mb-2 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative group">
          <img src="${item.foto}" alt="Foto de obra" class="w-full h-32 object-cover" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null; if(this.dataset.retry !== '1' && '${item.fotoRemota || ''}') { this.dataset.retry='1'; this.src='${item.fotoRemota || ''}'; } else { this.parentElement.style.display='none'; }">
        </div>
      ` : '';

      const popupHtml = `
        <div class="p-3 max-w-[280px] font-sans">
          <div class="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100">
            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full text-white" style="background-color: ${color}">
              ${item.rubro}
            </span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded">
              ${item.anio}
            </span>
          </div>
          ${fotoHtml}
          <h4 class="font-bold text-xs text-slate-900 leading-tight mb-1">${item.nombre}</h4>
          <p class="text-[11px] text-slate-500 mb-2 line-clamp-2">${item.descripcion}</p>
          <div class="bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2.5 space-y-1 text-[11px]">
            <div class="flex justify-between">
              <span class="text-slate-400">Inversión:</span>
              <span class="font-bold text-brand-navy">${item.monto > 0 ? this.formatearMonedaCompleta(item.monto) : 'Por determinar / PDM'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Ubicación:</span>
              <span class="font-medium text-slate-700 truncate max-w-[140px]">${item.colonia}</span>
            </div>
            ${item.distancia ? `
              <div class="flex justify-between">
                <span class="text-slate-400">Longitud:</span>
                <span class="font-bold text-amber-800">${item.distancia}</span>
              </div>
            ` : ''}
            ${item.zap2026 ? `
              <div class="flex justify-between">
                <span class="text-slate-400">ZAP 2026:</span>
                <span class="font-bold text-emerald-700">${item.zap2026}</span>
              </div>
            ` : ''}
            <div class="flex justify-between">
              <span class="text-slate-400">Clave:</span>
              <span class="font-mono text-[10px] text-slate-600 truncate max-w-[140px]">${item.clave}</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            <button onclick="ObrasApp.abrirFicha(${item.id})" class="py-1.5 px-2 bg-brand-navy hover:bg-blue-900 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1 shadow-sm cursor-pointer">
              <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
              <span>Ficha</span>
            </button>
            ${(item.lat && item.lng) ? `
              <a href="https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}" target="_blank" rel="noopener" class="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1 border border-slate-200">
                <i data-lucide="map" class="w-3.5 h-3.5 text-brand-cyan"></i>
                <span>Maps</span>
              </a>
            ` : ''}
          </div>
        </div>
      `;

      if (item.tipoGeom === 'LineString' && item.linea && item.linea.length > 0) {
        const poly = L.polyline(item.linea, {
          color: color,
          weight: 5,
          opacity: 0.85,
          lineJoin: 'round'
        });

        poly.bindPopup(popupHtml);
        poly.on('click', () => {
          this.seleccionarObraEnMapa(item, poly);
        });

        this.lineasGroup.addLayer(poly);
      } else if (item.lat && item.lng && (item.lat !== 0 || item.lng !== 0)) {
        const markerHtml = `
          <div class="w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white transition transform hover:scale-110" style="background-color: ${color}">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-obra-pin',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14]
        });

        const marker = L.marker([item.lat, item.lng], { icon: customIcon });
        marker.bindPopup(popupHtml);
        marker.on('click', () => {
          this.seleccionarObraEnMapa(item, marker);
        });

        this.clusterGroup.addLayer(marker);
      }
    });

    if (this.filtros.anio !== 'todos' || this.filtros.rubro !== 'todos' || this.filtros.texto) {
      this.centrarMapa();
    }
  },

  seleccionarObraEnMapa(item, layer) {
    this.itemSeleccionadoId = item.id;
    this.marcadorSeleccionado = layer;

    const banner = document.getElementById('obraBannerSeleccionado');
    const bNombre = document.getElementById('obraBannerNombre');
    const bDetalle = document.getElementById('obraBannerDetalle');

    if (banner && bNombre && bDetalle) {
      bNombre.innerText = item.nombre;
      bDetalle.innerText = `${item.rubro} • ${item.anio} • ${item.monto > 0 ? this.formatearMoneda(item.monto) : 'Sin monto'} • ${item.colonia}`;
      banner.classList.remove('hidden');
    }

    this.removerRadar();
    if (item.lat && item.lng && (item.lat !== 0 || item.lng !== 0)) {
      this.radarCircle = L.circleMarker([item.lat, item.lng], {
        radius: 20,
        color: '#E11482',
        weight: 3,
        opacity: 0.9,
        fillColor: '#E11482',
        fillOpacity: 0.25,
        className: 'animate-ping'
      }).addTo(this.mapa);
    }
  },

  limpiarSeleccionMapa() {
    this.itemSeleccionadoId = null;
    this.marcadorSeleccionado = null;
    this.removerRadar();

    const banner = document.getElementById('obraBannerSeleccionado');
    if (banner) banner.classList.add('hidden');

    if (this.mapa) this.mapa.closePopup();
  },

  abrirFichaSeleccionada() {
    if (this.itemSeleccionadoId) {
      this.abrirFicha(this.itemSeleccionadoId);
    }
  },

  removerRadar() {
    if (this.radarCircle && this.mapa) {
      this.mapa.removeLayer(this.radarCircle);
      this.radarCircle = null;
    }
  },

  centrarEnMapa(id) {
    const item = (window.OBRAS_ITEMS || []).find(i => i.id === id);
    if (!item || !this.mapa) return;

    window.cambiarSeccion('obra');

    setTimeout(() => {
      if (this.mapa) this.mapa.invalidateSize();

      if (item.tipoGeom === 'LineString' && item.linea && item.linea.length > 0) {
        const bounds = L.latLngBounds(item.linea);
        this.mapa.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } else if (item.lat && item.lng && (item.lat !== 0 || item.lng !== 0)) {
        this.mapa.flyTo([item.lat, item.lng], 16, { animate: true, duration: 1.2 });
      }

      let targetLayer = null;
      if (this.clusterGroup) {
        this.clusterGroup.eachLayer(layer => {
          if (layer.getLatLng) {
            const ll = layer.getLatLng();
            if (Math.abs(ll.lat - item.lat) < 0.0001 && Math.abs(ll.lng - item.lng) < 0.0001) {
              targetLayer = layer;
            }
          }
        });
      }

      if (!targetLayer && this.lineasGroup) {
        this.lineasGroup.eachLayer(layer => {
          if (layer.getBounds && item.linea && item.linea.length > 0) {
            targetLayer = layer;
          }
        });
      }

      this.seleccionarObraEnMapa(item, targetLayer);

      if (targetLayer) {
        setTimeout(() => targetLayer.openPopup(), 400);
      }

      const mapElem = document.getElementById('mapaObras');
      if (mapElem) {
        mapElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  },

  renderizarTabla() {
    const tbody = document.getElementById('tablaObrasBody');
    const infoPaginacion = document.getElementById('obraInfoPaginacion');
    const btnAnt = document.getElementById('obraBtnPaginacionAnt');
    const btnSig = document.getElementById('obraBtnPaginacionSig');

    if (!tbody) return;

    const total = this.itemsFiltrados.length;
    this.paginacion.totalPaginas = Math.ceil(total / this.paginacion.porPagina) || 1;

    if (this.paginacion.paginaActual > this.paginacion.totalPaginas) {
      this.paginacion.paginaActual = this.paginacion.totalPaginas;
    }
    if (this.paginacion.paginaActual < 1) {
      this.paginacion.paginaActual = 1;
    }

    const inicio = (this.paginacion.paginaActual - 1) * this.paginacion.porPagina;
    const fin = Math.min(inicio + this.paginacion.porPagina, total);
    const itemsPagina = this.itemsFiltrados.slice(inicio, fin);

    if (infoPaginacion) {
      infoPaginacion.innerText = total > 0 ? `Mostrando ${inicio + 1} a ${fin} de ${total.toLocaleString('es-MX')} proyectos` : 'Sin proyectos encontrados';
    }

    if (btnAnt) btnAnt.disabled = this.paginacion.paginaActual <= 1;
    if (btnSig) btnSig.disabled = this.paginacion.paginaActual >= this.paginacion.totalPaginas;

    if (itemsPagina.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-8 text-center text-slate-400 text-xs">
            <i data-lucide="folder-search" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
            No se encontraron proyectos con los filtros seleccionados.<br>
            <button onclick="ObrasApp.limpiarFiltros()" class="mt-2 text-brand-navy font-bold hover:underline cursor-pointer">Restablecer filtros</button>
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    itemsPagina.forEach(item => {
      const infoRubro = this.iconosRubro[item.rubro] || { color: '#009FB9', bg: '#ECFEFF' };
      const esTramo = item.tipoGeom === 'LineString';

      html += `
        <tr class="hover:bg-slate-50/80 transition-colors duration-150 text-xs border-b border-slate-100 group">
          <td class="px-3.5 py-3 font-mono text-[11px] text-slate-500 font-bold whitespace-nowrap">
            <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700">${item.anio}</span>
          </td>
          <td class="px-3.5 py-3">
            <div class="font-bold text-slate-900 group-hover:text-brand-navy transition">${item.nombre}</div>
            <div class="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[280px]" title="${item.clave}">${item.clave}</div>
          </td>
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold" style="color: ${infoRubro.color}; background-color: ${infoRubro.bg}; border: 1px solid ${infoRubro.color}30">
              <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${infoRubro.color}"></span>
              ${item.rubro}
            </span>
          </td>
          <td class="px-3.5 py-3 whitespace-nowrap font-bold ${item.monto > 0 ? 'text-brand-navy' : 'text-slate-400 font-normal italic'}">
            ${item.monto > 0 ? this.formatearMoneda(item.monto) : 'Por determinar'}
          </td>
          <td class="px-3.5 py-3 text-slate-600 truncate max-w-[160px]" title="${item.colonia}">
            ${item.colonia || 'Aguascalientes'}
          </td>
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${esTramo ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-brand-navy border border-blue-100'}">
              <i data-lucide="${esTramo ? 'route' : 'map-pin'}" class="w-3 h-3"></i>
              ${esTramo ? 'Tramo Vial' : 'Punto'}
            </span>
          </td>
          <td class="px-3.5 py-3 whitespace-nowrap text-right space-x-1">
            <button onclick="ObrasApp.centrarEnMapa(${item.id})" class="px-2.5 py-1 bg-white hover:bg-slate-100 text-brand-navy font-bold rounded-lg border border-slate-200 shadow-sm transition inline-flex items-center gap-1 text-[11px] cursor-pointer" title="Ubicar en Mapa">
              <i data-lucide="map" class="w-3.5 h-3.5 text-brand-cyan"></i>
              <span class="hidden sm:inline">Mapa</span>
            </button>
            <button onclick="ObrasApp.abrirFicha(${item.id})" class="px-2.5 py-1 bg-brand-navy hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm transition inline-flex items-center gap-1 text-[11px] cursor-pointer" title="Ver Ficha Técnica">
              <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
              <span>Ficha</span>
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  paginaAnterior() {
    if (this.paginacion.paginaActual > 1) {
      this.paginacion.paginaActual--;
      this.renderizarTabla();
      if (window.lucide) lucide.createIcons();
    }
  },

  paginaSiguiente() {
    if (this.paginacion.paginaActual < this.paginacion.totalPaginas) {
      this.paginacion.paginaActual++;
      this.renderizarTabla();
      if (window.lucide) lucide.createIcons();
    }
  },

  abrirFicha(id) {
    const item = (window.OBRAS_ITEMS || []).find(i => i.id === id);
    if (!item) return;

    const modal = document.getElementById('modalFichaObra');
    const contenedor = document.getElementById('modalFichaObraContenido');
    if (!modal || !contenedor) return;

    const infoRubro = this.iconosRubro[item.rubro] || { color: '#009FB9', bg: '#ECFEFF' };
    const googleMapsUrl = (item.lat && item.lng) ? `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}` : null;
    const streetViewUrl = (item.lat && item.lng) ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${item.lat},${item.lng}` : null;
    const dirUrl = (item.lat && item.lng) ? `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}` : null;
    const photoUrl = item.foto || item.fotoRemota;

    contenedor.innerHTML = `
      <div class="space-y-5 font-sans">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm" style="background-color: ${infoRubro.color}">
              ${item.rubro}
            </span>
            <span class="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-extrabold rounded-full">
              Año ${item.anio}
            </span>
            <span class="px-2.5 py-1 ${item.tipoGeom === 'LineString' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-brand-navy border border-blue-200'} text-xs font-bold rounded-full">
              ${item.tipoGeom === 'LineString' ? 'Tramo Vial / Línea' : 'Punto Georreferenciado'}
            </span>
            ${item.zap2026 ? `
              <span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-full">
                ZAP 2026: ${item.zap2026}
              </span>
            ` : ''}
          </div>
          <span class="text-xs font-mono font-bold text-slate-400">ID #${item.id}</span>
        </div>

        ${photoUrl ? `
          <div class="rounded-2xl overflow-hidden border border-slate-200 shadow-md relative group bg-slate-100">
            <img src="${item.foto}" alt="${item.nombre}" class="w-full h-56 object-cover group-hover:scale-105 transition duration-500" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null; if(this.dataset.retry !== '1' && '${item.fotoRemota || ''}') { this.dataset.retry='1'; this.src='${item.fotoRemota || ''}'; } else { this.parentElement.style.display='none'; }">
            <a href="${item.fotoRemota || item.foto}" target="_blank" rel="noopener" class="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black text-white text-xs font-bold rounded-xl backdrop-blur-sm transition flex items-center gap-1.5">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              <span>Ver Foto Completa</span>
            </a>
          </div>
        ` : ''}

        <div>
          <h3 class="text-lg font-black text-slate-900 leading-snug font-display">${item.nombre}</h3>
          <p class="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">${item.descripcion}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div class="p-3 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl border border-slate-200">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inversión Registrada</span>
            <span class="text-base font-black text-brand-navy mt-0.5 block">${this.formatearMonedaCompleta(item.monto)}</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clave / Contrato</span>
            <span class="font-mono font-bold text-slate-800 mt-0.5 block truncate">${item.clave || 'No asignada'}</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Colonia / Localidad</span>
            <span class="font-bold text-slate-800 mt-0.5 block truncate">${item.colonia || 'Municipio de Aguascalientes'}</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Distrito Local</span>
            <span class="font-semibold text-slate-700 mt-0.5 block truncate">${item.distrito || 'Aguascalientes'}</span>
          </div>
          ${item.distancia ? `
            <div class="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
              <span class="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Longitud de Tramo</span>
              <span class="font-bold text-amber-900 mt-0.5 block">${item.distancia}</span>
            </div>
          ` : ''}
          ${item.folio ? `
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Folio Atención Ciudadana</span>
              <span class="font-mono font-bold text-slate-800 mt-0.5 block truncate">${item.folio}</span>
            </div>
          ` : ''}
          ${item.peticion ? `
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Petición / Solicitud</span>
              <span class="text-slate-700 mt-0.5 block leading-tight">${item.peticion}</span>
            </div>
          ` : ''}
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fuente Oficial</span>
            <span class="font-medium text-slate-700 mt-0.5 block">${item.fuente}</span>
          </div>
        </div>

        ${(item.lat && item.lng && (item.lat !== 0 || item.lng !== 0)) ? `
          <div class="p-4 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div class="space-y-0.5">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coordenadas Geográficas (WGS84)</span>
              <div class="font-mono text-xs font-bold text-cyan-400">${item.lat.toFixed(6)}, ${item.lng.toFixed(6)}</div>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <button onclick="ObrasApp.cerrarFicha(); ObrasApp.centrarEnMapa(${item.id});" class="px-3 py-1.5 bg-brand-cyan hover:bg-cyan-600 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm">
                <i data-lucide="map" class="w-3.5 h-3.5"></i>
                <span>Ver en Visor</span>
              </button>
              ${googleMapsUrl ? `
                <a href="${googleMapsUrl}" target="_blank" rel="noopener" class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5" title="Abrir en Google Maps">
                  <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                  <span>Google Maps</span>
                </a>
              ` : ''}
              ${streetViewUrl ? `
                <a href="${streetViewUrl}" target="_blank" rel="noopener" class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5" title="Abrir Street View 360°">
                  <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                  <span>Street View</span>
                </a>
              ` : ''}
              ${dirUrl ? `
                <a href="${dirUrl}" target="_blank" rel="noopener" class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5" title="Cómo Llegar con GPS">
                  <i data-lucide="navigation" class="w-3.5 h-3.5"></i>
                  <span>Ruta GPS</span>
                </a>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <div class="pt-2 flex justify-end">
          <button onclick="ObrasApp.cerrarFicha()" class="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer">
            Cerrar Ficha
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  cerrarFicha() {
    const modal = document.getElementById('modalFichaObra');
    if (modal) modal.classList.add('hidden');
  },

  iniciarGraficos() {
    try {
      this.iniciarGraficoRubros();
      this.iniciarGraficoAnual();
      this.iniciarGraficoTopObras();
    } catch(e) {
      console.warn('Error iniciando graficos:', e);
    }
  },

  iniciarGraficoRubros() {
    const canvas = document.getElementById('graficoObraRubros');
    if (!canvas) return;

    const metricas = window.OBRAS_METRICAS.porRubro || [];
    const labels = metricas.map(m => m.nombre);
    const dataMontos = metricas.map(m => m.inversion);
    const colors = metricas.map(m => m.color);

    if (this.graficoRubros) {
      try { this.graficoRubros.destroy(); } catch(e) {}
    }

    const ctx = canvas.getContext('2d');
    this.graficoRubros = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataMontos,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              font: { size: 10, family: 'sans-serif' },
              padding: 8
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = context.raw || 0;
                if (this.modoGraficoRubro === 'monto') {
                  return ` ${context.label}: $${(val / 1000000).toFixed(2)}M MXN`;
                }
                return ` ${context.label}: ${val} proyectos`;
              }
            }
          }
        },
        onClick: (evt, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const rubroSel = labels[index];
            const sel = document.getElementById('obraFiltroRubro');
            if (sel) sel.value = rubroSel;
            this.filtrarPorRubro(rubroSel);
          }
        }
      }
    });
  },

  toggleModoGraficoRubro(modo) {
    this.modoGraficoRubro = modo;
    const btnMonto = document.getElementById('btnGraficoRubroMonto');
    const btnCant = document.getElementById('btnGraficoRubroCant');

    if (btnMonto && btnCant) {
      if (modo === 'monto') {
        btnMonto.className = 'px-2.5 py-1 rounded-md text-[10px] font-bold bg-white text-brand-navy shadow-sm cursor-pointer';
        btnCant.className = 'px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer';
      } else {
        btnCant.className = 'px-2.5 py-1 rounded-md text-[10px] font-bold bg-white text-brand-navy shadow-sm cursor-pointer';
        btnMonto.className = 'px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer';
      }
    }

    this.actualizarGraficoRubros();
  },

  iniciarGraficoAnual() {
    const canvas = document.getElementById('graficoObraAnual');
    if (!canvas) return;

    const porAnio = window.OBRAS_METRICAS.porAnio || [];
    const labels = porAnio.map(a => a.anio.toString());
    const dataObras = porAnio.map(a => a.total);
    const dataInversionM = porAnio.map(a => (a.inversion / 1000000).toFixed(2));

    if (this.graficoAnual) {
      try { this.graficoAnual.destroy(); } catch(e) {}
    }

    const ctx = canvas.getContext('2d');
    this.graficoAnual = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Inversión ($ MDP)',
            data: dataInversionM,
            backgroundColor: '#009FB9',
            borderRadius: 6,
            yAxisID: 'y1'
          },
          {
            label: 'Número de Obras',
            data: dataObras,
            backgroundColor: '#0A3B66',
            borderRadius: 6,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 10,
              font: { size: 10 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                if (context.datasetIndex === 0) {
                  return ` Inversión: $${context.raw}M MXN`;
                }
                return ` Proyectos: ${context.raw} obras`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10, weight: 'bold' } }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: { color: '#f1f5f9' },
            ticks: { font: { size: 9 } }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { font: { size: 9 } }
          }
        },
        onClick: (evt, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const anioSel = labels[index];
            const tabBtn = document.getElementById(`tabObraAnio${anioSel}`);
            this.filtrarPorAnio(anioSel, tabBtn);
          }
        }
      }
    });
  },

  iniciarGraficoTopObras() {
    this.actualizarGraficoTopObras();
  },

  actualizarGraficos() {
    this.actualizarGraficoRubros();
    this.actualizarGraficoTopObras();
  },

  actualizarGraficoRubros() {
    if (!this.graficoRubros) return;

    const rubrosMap = {};
    const rubrosColores = {};
    (window.OBRAS_METRICAS.porRubro || []).forEach(r => {
      rubrosMap[r.nombre] = { total: 0, inversion: 0 };
      rubrosColores[r.nombre] = r.color;
    });

    this.itemsFiltrados.forEach(item => {
      if (!rubrosMap[item.rubro]) {
        rubrosMap[item.rubro] = { total: 0, inversion: 0 };
      }
      rubrosMap[item.rubro].total += 1;
      rubrosMap[item.rubro].inversion += (item.monto || 0);
    });

    const activeRubros = Object.keys(rubrosMap).filter(k => rubrosMap[k].total > 0);
    const labels = activeRubros;
    const data = activeRubros.map(k => this.modoGraficoRubro === 'monto' ? rubrosMap[k].inversion : rubrosMap[k].total);
    const colors = activeRubros.map(k => rubrosColores[k] || '#009FB9');

    this.graficoRubros.data.labels = labels;
    this.graficoRubros.data.datasets[0].data = data;
    this.graficoRubros.data.datasets[0].backgroundColor = colors;
    this.graficoRubros.update();
  },

  actualizarGraficoTopObras() {
    const canvas = document.getElementById('graficoObraTop');
    if (!canvas) return;

    const obrasConMonto = [...this.itemsFiltrados].filter(o => o.monto > 0).sort((a, b) => b.monto - a.monto).slice(0, 6);

    const labels = obrasConMonto.map(o => {
      const short = o.nombre.length > 25 ? o.nombre.substring(0, 22) + '...' : o.nombre;
      return short;
    });
    const data = obrasConMonto.map(o => (o.monto / 1000000).toFixed(2));
    const colors = obrasConMonto.map(o => {
      const info = this.iconosRubro[o.rubro];
      return info ? info.color : '#009FB9';
    });

    if (this.graficoTopObras) {
      try { this.graficoTopObras.destroy(); } catch(e) {}
    }

    const ctx = canvas.getContext('2d');
    this.graficoTopObras = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Inversión ($ MDP)',
          data: data,
          backgroundColor: colors,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => {
                if (items.length > 0) {
                  const idx = items[0].dataIndex;
                  return obrasConMonto[idx].nombre;
                }
                return '';
              },
              label: (context) => {
                const idx = context.dataIndex;
                const o = obrasConMonto[idx];
                return ` Inversión: $${context.raw}M MXN (${o.rubro})`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#f1f5f9' },
            ticks: { font: { size: 9 } }
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 9 } }
          }
        },
        onClick: (evt, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const targetObra = obrasConMonto[index];
            if (targetObra) {
              this.centrarEnMapa(targetObra.id);
            }
          }
        }
      }
    });
  },

  exportarCSV() {
    const items = this.itemsFiltrados || [];
    if (items.length === 0) {
      alert('No hay datos para exportar con los filtros actuales.');
      return;
    }

    const headers = ['ID', 'Año', 'Clave / Contrato', 'Nombre de Obra', 'Descripción', 'Rubro / Sector', 'Monto Inversión (MXN)', 'Colonia / Localidad', 'Tipo Geometría', 'Latitud', 'Longitud', 'Fuente'];
    
    let csvContent = '\uFEFF';
    csvContent += headers.map(h => `"${h}"`).join(',') + '\r\n';

    items.forEach(i => {
      const row = [
        i.id,
        i.anio,
        (i.clave || '').replace(/"/g, '""'),
        (i.nombre || '').replace(/"/g, '""'),
        (i.descripcion || '').replace(/"/g, '""'),
        (i.rubro || '').replace(/"/g, '""'),
        i.monto || 0,
        (i.colonia || '').replace(/"/g, '""'),
        i.tipoGeom,
        i.lat || '',
        i.lng || '',
        (i.fuente || '').replace(/"/g, '""')
      ];
      csvContent += row.map(v => `"${v}"`).join(',') + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PIMAgs_Obra_Publica_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
