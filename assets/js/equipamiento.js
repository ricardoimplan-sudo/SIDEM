/**
 * PIMAgs - Controlador del Módulo de Equipamiento Urbano
 * Integra mapa interactivo Leaflet con clusters, filtros multidimensionales,
 * gráficos estadísticos dinámicos y directorio paginado con geolocalización de alta precisión.
 */

const EquipamientoApp = {
  mapa: null,
  clusterGroup: null,
  capaCalles: null,
  capaSatelite: null,
  capaPositron: null,
  graficoRegimen: null,
  graficoTopCategorias: null,
  graficoDelegaciones: null,
  
  itemSeleccionadoId: null,
  marcadorSeleccionado: null,

  filtros: {
    macro: 'todos',
    categoria: 'todas',
    delegacion: 'todas',
    regimen: 'todos',
    texto: ''
  },

  paginacion: {
    paginaActual: 1,
    porPagina: 15,
    totalPaginas: 1
  },

  itemsFiltrados: [],

  iconosMacro: {
    'Salud y Asistencia Social': { icon: 'activity', color: '#E11482', bg: '#FDF2F8' },
    'Educación': { icon: 'graduation-cap', color: '#0A3B66', bg: '#EFF6FF' },
    'Cultura y Recreación': { icon: 'palette', color: '#7C3AED', bg: '#F5F3FF' },
    'Deporte y Espacios Abiertos': { icon: 'trees', color: '#72B626', bg: '#F0FDF4' },
    'Comercio y Abasto': { icon: 'shopping-bag', color: '#F5A800', bg: '#FFFBEB' },
    'Servicios Urbanos e Infraestructura': { icon: 'wrench', color: '#009FB9', bg: '#ECFEFF' }
  },

  iniciar() {
    if (!window.EQUIPAMIENTO_METRICAS || !window.EQUIPAMIENTO_ITEMS) {
      console.warn('Equipamiento data no disponible aún.');
      return;
    }

    this.poblarSelectores();
    this.iniciarMapa();
    this.iniciarGraficos();
    this.aplicarFiltros();
  },

  poblarSelectores() {
    const selCat = document.getElementById('eqFiltroCategoria');
    const selDel = document.getElementById('eqFiltroDelegacion');

    if (selCat) {
      const cats = window.EQUIPAMIENTO_METRICAS.categorias || [];
      const sortedCats = [...cats].sort((a, b) => b.total - a.total);
      
      let html = '<option value="todas">Todas las Categorías (33 clasificaciones)</option>';
      sortedCats.forEach(c => {
        html += `<option value="${c.nombre}">${c.nombre} (${c.total.toLocaleString('es-MX')})</option>`;
      });
      selCat.innerHTML = html;
    }

    if (selDel) {
      const dels = window.EQUIPAMIENTO_METRICAS.delegaciones || [];
      const sortedDels = [...dels].sort((a, b) => b.total - a.total);

      let html = '<option value="todas">Todas las Delegaciones (Municipio)</option>';
      sortedDels.forEach(d => {
        html += `<option value="${d.nombre}">${d.nombre} (${d.total.toLocaleString('es-MX')})</option>`;
      });
      selDel.innerHTML = html;
    }
  },

  iniciarMapa() {
    const mapContainer = document.getElementById('mapaEquipamiento');
    if (!mapContainer || this.mapa) return;

    this.mapa = L.map('mapaEquipamiento', {
      center: [21.8853, -102.2915],
      zoom: 12,
      minZoom: 10,
      maxZoom: 19,
      scrollWheelZoom: true
    });

    this.capaCalles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | IMPLAN Aguascalientes',
      maxZoom: 19
    }).addTo(this.mapa);

    this.capaSatelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19
    });

    this.capaPositron = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Topo Map | PIMAgs',
      maxZoom: 19
    });

    if (typeof L.markerClusterGroup === 'function') {
      this.clusterGroup = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 45,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
      });
      this.mapa.addLayer(this.clusterGroup);
    }
  },

  cambiarCapaMapa(tipo) {
    if (!this.mapa) return;
    this.mapa.removeLayer(this.capaCalles);
    this.mapa.removeLayer(this.capaSatelite);
    this.mapa.removeLayer(this.capaPositron);

    const btnCalles = document.getElementById('btnEqCapaCalles');
    const btnSat = document.getElementById('btnEqCapaSat');
    const btnPos = document.getElementById('btnEqCapaPos');

    [btnCalles, btnSat, btnPos].forEach(b => {
      if (b) b.className = "px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/90 text-slate-700 hover:bg-slate-100 transition shadow-sm border border-slate-200 cursor-pointer";
    });

    if (tipo === 'satelite') {
      this.capaSatelite.addTo(this.mapa);
      if (btnSat) btnSat.className = "px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-navy text-white shadow-sm border border-brand-navy cursor-pointer";
    } else if (tipo === 'positron') {
      this.capaPositron.addTo(this.mapa);
      if (btnPos) btnPos.className = "px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-navy text-white shadow-sm border border-brand-navy cursor-pointer";
    } else {
      this.capaCalles.addTo(this.mapa);
      if (btnCalles) btnCalles.className = "px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-navy text-white shadow-sm border border-brand-navy cursor-pointer";
    }
  },

  centrarMapa() {
    if (this.mapa) {
      if (this.marcadorSeleccionado) {
        this.limpiarSeleccionMapa();
      }
      if (this.clusterGroup && this.clusterGroup.getLayers().length > 0) {
        this.mapa.fitBounds(this.clusterGroup.getBounds(), { padding: [40, 40], maxZoom: 15 });
      } else {
        this.mapa.setView([21.8853, -102.2915], 12);
      }
    }
  },

  filtrarPorMacro(macro) {
    this.filtros.macro = macro;
    const btns = document.querySelectorAll('.eq-macro-tab');
    btns.forEach(b => {
      if (b.getAttribute('data-macro') === macro) {
        b.className = "eq-macro-tab px-4 py-2 rounded-xl text-xs font-bold bg-brand-navy text-white shadow-md shadow-brand-navy/20 transition cursor-pointer flex items-center gap-2";
      } else {
        b.className = "eq-macro-tab px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer flex items-center gap-2";
      }
    });

    this.filtros.categoria = 'todas';
    const selCat = document.getElementById('eqFiltroCategoria');
    if (selCat) selCat.value = 'todas';

    this.paginacion.paginaActual = 1;
    this.aplicarFiltros();
  },

  cambiarFiltroCategoria(val) {
    this.filtros.categoria = val;
    this.paginacion.paginaActual = 1;
    this.aplicarFiltros();
  },

  cambiarFiltroDelegacion(val) {
    this.filtros.delegacion = val;
    this.paginacion.paginaActual = 1;
    this.aplicarFiltros();
  },

  cambiarFiltroRegimen(val) {
    this.filtros.regimen = val;
    this.paginacion.paginaActual = 1;
    this.aplicarFiltros();
  },

  buscarTexto(texto) {
    this.filtros.texto = (texto || '').trim().toLowerCase();
    this.paginacion.paginaActual = 1;
    this.aplicarFiltros();
  },

  resetearFiltros() {
    this.filtros.macro = 'todos';
    this.filtros.categoria = 'todas';
    this.filtros.delegacion = 'todas';
    this.filtros.regimen = 'todos';
    this.filtros.texto = '';

    const selCat = document.getElementById('eqFiltroCategoria');
    const selDel = document.getElementById('eqFiltroDelegacion');
    const selReg = document.getElementById('eqFiltroRegimen');
    const txtBus = document.getElementById('eqBuscadorTexto');

    if (selCat) selCat.value = 'todas';
    if (selDel) selDel.value = 'todas';
    if (selReg) selReg.value = 'todos';
    if (txtBus) txtBus.value = '';

    const btns = document.querySelectorAll('.eq-macro-tab');
    btns.forEach(b => {
      if (b.getAttribute('data-macro') === 'todos') {
        b.className = "eq-macro-tab px-4 py-2 rounded-xl text-xs font-bold bg-brand-navy text-white shadow-md shadow-brand-navy/20 transition cursor-pointer flex items-center gap-2";
      } else {
        b.className = "eq-macro-tab px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer flex items-center gap-2";
      }
    });

    this.limpiarSeleccionMapa();
    this.paginacion.paginaActual = 1;
    this.aplicarFiltros();
  },

  aplicarFiltros() {
    const raw = window.EQUIPAMIENTO_ITEMS || [];
    const fm = this.filtros.macro;
    const fc = this.filtros.categoria;
    const fd = this.filtros.delegacion;
    const fr = this.filtros.regimen;
    const ft = this.filtros.texto;

    this.itemsFiltrados = raw.filter(item => {
      if (fm !== 'todos' && item.m !== fm) return false;
      if (fc !== 'todas' && item.c !== fc) return false;
      if (fd !== 'todas' && item.d !== fd) return false;
      if (fr === 'publico' && !item.p.includes('Público')) return false;
      if (fr === 'privado' && !item.p.includes('Privado')) return false;
      if (fr === 'social' && !item.p.includes('Social')) return false;

      if (ft) {
        const busq = (item.n + ' ' + item.sc + ' ' + item.c + ' ' + item.d + ' ' + item.a + ' ' + item.col).toLowerCase();
        if (!busq.includes(ft)) return false;
      }
      return true;
    });

    this.actualizarKpis();
    this.actualizarGraficos();
    this.actualizarMapa();
    this.actualizarTabla();
  },

  actualizarKpis() {
    const total = this.itemsFiltrados.length;
    let pub = 0, priv = 0, soc = 0;
    const catCounts = {};

    this.itemsFiltrados.forEach(it => {
      if (it.p.includes('Público')) pub++;
      else if (it.p.includes('Privado')) priv++;
      else soc++;

      catCounts[it.c] = (catCounts[it.c] || 0) + 1;
    });

    let topCat = 'N/A';
    let topMax = 0;
    for (let c in catCounts) {
      if (catCounts[c] > topMax) {
        topMax = catCounts[c];
        topCat = c;
      }
    }

    const elTotal = document.getElementById('eqKpiTotal');
    const elPub = document.getElementById('eqKpiPublico');
    const elPriv = document.getElementById('eqKpiPrivado');
    const elTopCat = document.getElementById('eqKpiTopCat');

    if (elTotal) elTotal.innerText = total.toLocaleString('es-MX');
    if (elPub) {
      const pct = total > 0 ? Math.round((pub / total) * 100) : 0;
      elPub.innerHTML = `${pub.toLocaleString('es-MX')} <span class="text-xs font-normal text-slate-500">(${pct}%)</span>`;
    }
    if (elPriv) {
      const pct = total > 0 ? Math.round((priv / total) * 100) : 0;
      elPriv.innerHTML = `${priv.toLocaleString('es-MX')} <span class="text-xs font-normal text-slate-500">(${pct}%)</span>`;
    }
    if (elTopCat) {
      elTopCat.innerText = topCat !== 'N/A' ? `${topCat} (${topMax.toLocaleString('es-MX')})` : 'Sin datos';
    }
  },

  iniciarGraficos() {
    // 1. Gráfico de Régimen (Doughnut)
    const ctxReg = document.getElementById('eqChartRegimen');
    if (ctxReg) {
      this.graficoRegimen = new Chart(ctxReg, {
        type: 'doughnut',
        data: {
          labels: ['Público', 'Privado', 'Social'],
          datasets: [{
            data: [1838, 46171, 755],
            backgroundColor: ['#0A3B66', '#E11482', '#F5A800'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, family: 'Plus Jakarta Sans' } } }
          },
          cutout: '70%'
        }
      });
    }

    // 2. Gráfico Top Categorías (Horizontal Bar)
    const ctxTop = document.getElementById('eqChartTopCats');
    if (ctxTop) {
      this.graficoTopCategorias = new Chart(ctxTop, {
        type: 'bar',
        data: {
          labels: ['Comercio', 'Servicios Urbanos', 'Abasto', 'Salud', 'Educación', 'Otros'],
          datasets: [{
            label: 'Establecimientos',
            data: [25928, 9519, 3409, 2363, 1963, 5582],
            backgroundColor: '#009FB9',
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { grid: { display: false }, ticks: { font: { size: 10, family: 'Plus Jakarta Sans' } } }
          }
        }
      });
    }

    // 3. Gráfico Delegaciones (Vertical Bar)
    const ctxDel = document.getElementById('eqChartDelegaciones');
    if (ctxDel) {
      this.graficoDelegaciones = new Chart(ctxDel, {
        type: 'bar',
        data: {
          labels: ['Centro Pte', 'Pocitos', 'Centro Ote', 'San Marcos', 'Ojocaliente', 'Santa Anita'],
          datasets: [{
            label: 'Equipamientos',
            data: [8014, 7941, 7501, 3238, 3126, 3020],
            backgroundColor: '#0A3B66',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10, family: 'Plus Jakarta Sans' } } },
            y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 } } }
          }
        }
      });
    }
  },

  actualizarGraficos() {
    let pub = 0, priv = 0, soc = 0;
    const catMap = {};
    const delMap = {};

    this.itemsFiltrados.forEach(it => {
      if (it.p.includes('Público')) pub++;
      else if (it.p.includes('Privado')) priv++;
      else soc++;

      catMap[it.c] = (catMap[it.c] || 0) + 1;
      delMap[it.d] = (delMap[it.d] || 0) + 1;
    });

    if (this.graficoRegimen) {
      this.graficoRegimen.data.datasets[0].data = [pub, priv, soc];
      this.graficoRegimen.update();
    }

    if (this.graficoTopCategorias) {
      const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
      this.graficoTopCategorias.data.labels = sortedCats.map(x => x[0]);
      this.graficoTopCategorias.data.datasets[0].data = sortedCats.map(x => x[1]);
      this.graficoTopCategorias.update();
    }

    if (this.graficoDelegaciones) {
      const sortedDels = Object.entries(delMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
      this.graficoDelegaciones.data.labels = sortedDels.map(x => x[0].length > 18 ? x[0].substring(0, 16) + '...' : x[0]);
      this.graficoDelegaciones.data.datasets[0].data = sortedDels.map(x => x[1]);
      this.graficoDelegaciones.update();
    }
  },

  actualizarMapa() {
    if (!this.mapa || !this.clusterGroup) return;

    this.clusterGroup.clearLayers();

    const maxRender = 2500;
    const puntosValidos = this.itemsFiltrados.filter(it => it.lat && it.lng && it.lat !== 0 && it.lng !== 0);
    const puntos = puntosValidos.length > maxRender ? puntosValidos.slice(0, maxRender) : puntosValidos;

    const mapBadge = document.getElementById('eqMapaBadge');
    if (mapBadge) {
      if (puntosValidos.length > maxRender) {
        mapBadge.innerHTML = `<i data-lucide="info" class="w-3.5 h-3.5"></i> Mostrando ${maxRender.toLocaleString('es-MX')} de ${puntosValidos.length.toLocaleString('es-MX')} puntos georreferenciados (aplica filtros para detallar)`;
      } else {
        mapBadge.innerHTML = `<i data-lucide="check-circle" class="w-3.5 h-3.5"></i> ${puntosValidos.length.toLocaleString('es-MX')} ubicaciones en mapa`;
      }
      lucide.createIcons();
    }

    const markers = [];
    puntos.forEach(item => {
      let markerColor = this.obtenerColorCat(item.m);

      const customIcon = L.divIcon({
        className: 'custom-equip-pin',
        html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.4);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const m = L.marker([item.lat, item.lng], { icon: customIcon });

      const badgeRegimen = item.p.includes('Público') 
        ? `<span style="background: #E0F2FE; color: #0369A1; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: bold;">Público</span>`
        : `<span style="background: #FDF2F8; color: #BE185D; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: bold;">Privado</span>`;

      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; font-size: 12px; line-height: 1.4; min-width: 240px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${markerColor}; letter-spacing: 0.5px;">${item.c}</span>
            ${badgeRegimen}
          </div>
          <h4 style="font-size: 13px; font-weight: 800; color: #072B4B; margin: 0 0 4px 0;">${item.n}</h4>
          <p style="font-size: 11px; color: #64748B; margin: 0 0 6px 0;">${item.sc}</p>
          <div style="border-top: 1px solid #E2E8F0; padding-top: 6px; margin-top: 4px; font-size: 11px; color: #334155;">
            <div><strong>Delegación:</strong> ${item.d}</div>
            ${item.z ? `<div><strong>Región/ZUFO:</strong> ${item.z}</div>` : ''}
            <div><strong>Colonia:</strong> ${item.col || 'Sin especificar'}</div>
            <div><strong>Dirección:</strong> ${item.a}</div>
            ${item.tel && item.tel !== '0' ? `<div><strong>Tel:</strong> <a href="tel:${item.tel}" style="color: #009FB9; font-weight: bold;">${item.tel}</a></div>` : ''}
          </div>
          <div style="margin-top: 8px; display: flex; gap: 4px;">
            <button onclick="EquipamientoApp.abrirFicha(${item.id})" style="flex: 1; padding: 5px 8px; background: #0A3B66; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">Ver Ficha</button>
            <a href="https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}" target="_blank" rel="noopener" style="padding: 5px 8px; background: #F1F5F9; color: #0F172A; text-decoration: none; border-radius: 6px; font-size: 11px; font-weight: bold; display: inline-flex; align-items: center;">Maps ↗</a>
          </div>
        </div>
      `;

      m.bindPopup(popupHtml, { maxWidth: 280 });
      markers.push(m);
    });

    this.clusterGroup.addLayers(markers);
  },

  actualizarTabla() {
    const tbody = document.getElementById('eqTablaCuerpo');
    const infoPaginacion = document.getElementById('eqInfoPaginacion');
    const btnAnt = document.getElementById('eqBtnPaginacionAnt');
    const btnSig = document.getElementById('eqBtnPaginacionSig');

    if (!tbody) return;

    const total = this.itemsFiltrados.length;
    this.paginacion.totalPaginas = Math.max(1, Math.ceil(total / this.paginacion.porPagina));
    
    if (this.paginacion.paginaActual > this.paginacion.totalPaginas) {
      this.paginacion.paginaActual = this.paginacion.totalPaginas;
    }

    const inicio = (this.paginacion.paginaActual - 1) * this.paginacion.porPagina;
    const fin = Math.min(total, inicio + this.paginacion.porPagina);
    const itemsPagina = this.itemsFiltrados.slice(inicio, fin);

    if (itemsPagina.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-12 text-center text-slate-400">
            <i data-lucide="folder-search" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
            <p class="text-sm font-semibold text-slate-600">No se encontraron equipamientos con los filtros actuales</p>
            <p class="text-xs text-slate-400 mt-1">Prueba seleccionando otra delegación o modificando el término de búsqueda</p>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = itemsPagina.map(it => {
        const badgeReg = it.p.includes('Público')
          ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-brand-navy border border-blue-100">Público</span>`
          : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-brand-magenta border border-pink-100">Privado</span>`;

        return `
          <tr class="hover:bg-slate-50/80 transition text-xs border-b border-slate-100">
            <td class="px-4 py-3 font-medium text-slate-900">
              <div class="font-bold text-brand-navyDark">${it.n}</div>
              <div class="text-[11px] text-slate-500 font-normal line-clamp-1">${it.sc}</div>
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center gap-1 font-semibold text-slate-700">
                <span class="w-2 h-2 rounded-full" style="background-color: ${EquipamientoApp.obtenerColorCat(it.m)}"></span>
                ${it.c}
              </span>
            </td>
            <td class="px-4 py-3">${badgeReg}</td>
            <td class="px-4 py-3">
              <div class="font-semibold text-slate-800">${it.d}</div>
              <div class="text-[10px] text-slate-400">${it.z || '-'}</div>
            </td>
            <td class="px-4 py-3">
              <div class="text-slate-700">${it.a}</div>
              <div class="text-[11px] text-slate-400 font-medium">${it.col || 'Aguascalientes'}</div>
            </td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="EquipamientoApp.verEnMapa(${it.id})" title="Ver ubicación exacta en mapa" class="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-brand-navy hover:text-white text-brand-navy font-bold transition flex items-center gap-1 shadow-sm border border-blue-100 cursor-pointer">
                  <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
                  <span>Ver en Mapa</span>
                </button>
                <button onclick="EquipamientoApp.abrirFicha(${it.id})" title="Ficha Detallada" class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200 cursor-pointer">
                  <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (infoPaginacion) {
      infoPaginacion.innerText = `Mostrando ${total === 0 ? 0 : inicio + 1} a ${fin} de ${total.toLocaleString('es-MX')} equipamientos`;
    }

    if (btnAnt) {
      btnAnt.disabled = this.paginacion.paginaActual <= 1;
    }
    if (btnSig) {
      btnSig.disabled = this.paginacion.paginaActual >= this.paginacion.totalPaginas;
    }

    lucide.createIcons();
  },

  paginaAnterior() {
    if (this.paginacion.paginaActual > 1) {
      this.paginacion.paginaActual--;
      this.actualizarTabla();
    }
  },

  paginaSiguiente() {
    if (this.paginacion.paginaActual < this.paginacion.totalPaginas) {
      this.paginacion.paginaActual++;
      this.actualizarTabla();
    }
  },

  verEnMapa(id) {
    const it = (window.EQUIPAMIENTO_ITEMS || []).find(x => x.id === id);
    if (!it || !this.mapa || !it.lat || !it.lng) {
      console.warn('Equipamiento o coordenadas no encontradas para ID:', id);
      return;
    }

    this.itemSeleccionadoId = it.id;

    // Actualizar y mostrar el banner de selección activa sobre el mapa
    const banner = document.getElementById('eqBannerSeleccionado');
    const bNombre = document.getElementById('eqBannerNombre');
    const bDetalle = document.getElementById('eqBannerDetalle');
    if (banner && bNombre && bDetalle) {
      bNombre.innerText = it.n;
      bDetalle.innerHTML = `<span class="font-semibold text-brand-navy">${it.c}</span> &bull; ${it.d} &bull; ${it.a}`;
      banner.classList.remove('hidden');
      lucide.createIcons();
    }

    // Scroll suave hacia el contenedor del mapa
    const mapCard = document.getElementById('mapaEquipamiento');
    if (mapCard) {
      const headerOffset = 90;
      const rect = mapCard.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop - headerOffset;
      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    }

    // Remover marcador de selección anterior si existía
    if (this.marcadorSeleccionado) {
      this.mapa.removeLayer(this.marcadorSeleccionado);
      this.marcadorSeleccionado = null;
    }

    // Centrar mapa con animación a nivel de calle (zoom 18)
    this.mapa.flyTo([it.lat, it.lng], 18, {
      duration: 1.2,
      easeLinearity: 0.25
    });

    const markerColor = this.obtenerColorCat(it.m);
    
    // Pin destacado con radar animado
    const pinIcon = L.divIcon({
      className: 'eq-pin-animado',
      html: `
        <div style="position: relative; width: 50px; height: 50px; margin-left: -25px; margin-top: -50px; cursor: pointer;">
          <!-- Ondas de radar expansivas -->
          <div style="position: absolute; left: 50%; bottom: 0; width: 46px; height: 46px; margin-left: -23px; margin-bottom: -23px; border-radius: 50%; background: ${markerColor}; opacity: 0.8; animation: eqRadarPulse 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite;"></div>
          <div style="position: absolute; left: 50%; bottom: 0; width: 28px; height: 28px; margin-left: -14px; margin-bottom: -14px; border-radius: 50%; background: ${markerColor}; opacity: 0.9; animation: eqRadarPulse 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) 0.5s infinite;"></div>
          
          <!-- Pin con gota y estrella -->
          <div style="position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; z-index: 10;">
            <div style="width: 34px; height: 34px; border-radius: 50% 50% 50% 0; background: linear-gradient(135deg, ${markerColor} 0%, #072B4B 100%); transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(0,0,0,0.45); border: 2.5px solid #FFFFFF;">
              <div style="transform: rotate(45deg); color: #FFFFFF; font-size: 15px; font-weight: 900; line-height: 1;">★</div>
            </div>
            <div style="width: 8px; height: 4px; border-radius: 50%; background: rgba(7, 43, 75, 0.8); margin-top: -2px;"></div>
          </div>
        </div>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -50]
    });

    this.marcadorSeleccionado = L.marker([it.lat, it.lng], {
      icon: pinIcon,
      zIndexOffset: 25000
    }).addTo(this.mapa);

    const badgeRegimen = it.p.includes('Público') 
      ? `<span style="background: #E0F2FE; color: #0369A1; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800;">PÚBLICO</span>`
      : `<span style="background: #FDF2F8; color: #BE185D; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800;">PRIVADO</span>`;

    const popupHtml = `
      <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; font-size: 12px; line-height: 1.4; min-width: 260px; padding: 4px 2px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${markerColor}; letter-spacing: 0.5px;">📍 ${it.c}</span>
          ${badgeRegimen}
        </div>
        <h4 style="font-size: 14px; font-weight: 800; color: #072B4B; margin: 0 0 4px 0; line-height: 1.25;">${it.n}</h4>
        <p style="font-size: 11px; color: #64748B; margin: 0 0 8px 0; font-weight: 500;">${it.sc}</p>
        
        <div style="background: #F8FAFC; border-radius: 8px; padding: 8px; border: 1px solid #E2E8F0; font-size: 11px; color: #334155; margin-bottom: 8px;">
          <div style="margin-bottom: 3px;"><strong>Delegación:</strong> ${it.d}</div>
          ${it.z ? `<div style="margin-bottom: 3px;"><strong>Región/ZUFO:</strong> ${it.z}</div>` : ''}
          <div style="margin-bottom: 3px;"><strong>Colonia:</strong> ${it.col || 'Aguascalientes'}</div>
          <div style="margin-bottom: 3px;"><strong>Dirección:</strong> ${it.a}</div>
          ${it.tel && it.tel !== '0' ? `<div><strong>Teléfono:</strong> <a href="tel:${it.tel}" style="color: #009FB9; font-weight: bold;">${it.tel}</a></div>` : ''}
        </div>

        <div style="display: flex; gap: 6px;">
          <button onclick="EquipamientoApp.abrirFicha(${it.id})" style="flex: 1; padding: 6px 10px; background: #0A3B66; color: white; border: none; border-radius: 8px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
            <span>Ver Ficha Detallada</span>
          </button>
          <a href="https://www.google.com/maps/search/?api=1&query=${it.lat},${it.lng}" target="_blank" rel="noopener" style="padding: 6px 10px; background: #E2E8F0; color: #0F172A; text-decoration: none; border-radius: 8px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;">
            <span>Google Maps</span> ↗
          </a>
        </div>
      </div>
    `;

    this.marcadorSeleccionado.bindPopup(popupHtml, { 
      maxWidth: 300,
      autoPan: true,
      autoPanPadding: [50, 50],
      offset: [0, -10]
    });

    // Abrir el popup exactamente al finalizar el desplazamiento
    setTimeout(() => {
      if (this.marcadorSeleccionado) {
        this.marcadorSeleccionado.openPopup();
      }
    }, 500);

    // Expandir cluster si estuviera agrupado
    if (this.clusterGroup) {
      this.clusterGroup.eachLayer(layer => {
        const pos = layer.getLatLng();
        if (Math.abs(pos.lat - it.lat) < 0.000001 && Math.abs(pos.lng - it.lng) < 0.000001) {
          this.clusterGroup.zoomToShowLayer(layer, () => {});
        }
      });
    }
  },

  limpiarSeleccionMapa() {
    this.itemSeleccionadoId = null;
    if (this.marcadorSeleccionado) {
      this.mapa.removeLayer(this.marcadorSeleccionado);
      this.marcadorSeleccionado = null;
    }
    const banner = document.getElementById('eqBannerSeleccionado');
    if (banner) banner.classList.add('hidden');
  },

  abrirFichaSeleccionada() {
    if (this.itemSeleccionadoId) {
      this.abrirFicha(this.itemSeleccionadoId);
    }
  },

  abrirFicha(id) {
    const it = (window.EQUIPAMIENTO_ITEMS || []).find(x => x.id === id);
    if (!it) return;

    const modal = document.getElementById('modalFichaEquipamiento');
    const cont = document.getElementById('modalFichaContenido');
    if (!modal || !cont) return;

    const badgeReg = it.p.includes('Público')
      ? `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-brand-navy">Público</span>`
      : `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-100 text-brand-magenta">Privado</span>`;

    cont.innerHTML = `
      <div class="space-y-6">
        <div class="p-6 rounded-2xl text-white relative overflow-hidden" style="background: linear-gradient(135deg, #072B4B 0%, #0A3B66 100%);">
          <div class="flex items-center justify-between gap-4 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-cyan-300">${it.m} &bull; ${it.c}</span>
            ${badgeReg}
          </div>
          <h3 class="text-xl sm:text-2xl font-black font-display tracking-tight text-white">${it.n}</h3>
          <p class="text-xs text-slate-300 mt-1">${it.sc}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span class="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Ubicación y Delegación</span>
            <div class="font-bold text-slate-800 text-sm">${it.d}</div>
            <div class="text-slate-500 mt-0.5">${it.z ? 'Región / ZUFO: ' + it.z : 'Zona Urbana Aguascalientes'}</div>
          </div>

          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span class="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Colonia / Asentamiento</span>
            <div class="font-bold text-slate-800 text-sm">${it.col || 'Municipio de Aguascalientes'}</div>
            <div class="text-slate-500 mt-0.5">Dirección: ${it.a}</div>
          </div>

          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span class="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Contacto y Comunicación</span>
            <div class="font-bold text-slate-800 text-sm">${it.tel && it.tel !== '0' ? it.tel : 'Sin teléfono directo'}</div>
            <div class="text-slate-500 mt-0.5">Atención municipal: Línea 072</div>
          </div>

          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span class="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Coordenadas Georreferenciadas</span>
            <div class="font-bold font-mono text-slate-800">${it.lat.toFixed(5)}, ${it.lng.toFixed(5)}</div>
            <div class="text-slate-500 mt-0.5">Datum WGS84 / UTM 13N</div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button onclick="EquipamientoApp.verEnMapa(${it.id}); EquipamientoApp.cerrarFicha();" class="px-4 py-2 bg-brand-navy hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer">
            <i data-lucide="map-pin" class="w-4 h-4 text-cyan-300"></i>
            <span>Ver Ubicación en Mapa</span>
          </button>

          <a href="https://www.google.com/maps/search/?api=1&query=${it.lat},${it.lng}" target="_blank" rel="noopener" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-2">
            <span>Abrir en Google Maps</span>
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          </a>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    lucide.createIcons();
  },

  cerrarFicha() {
    const modal = document.getElementById('modalFichaEquipamiento');
    if (modal) modal.classList.add('hidden');
  },

  exportarCsv() {
    if (!this.itemsFiltrados || this.itemsFiltrados.length === 0) {
      alert('No hay datos disponibles para exportar.');
      return;
    }

    const headers = ["ID", "Categoria", "MacroSector", "Actividad_Giro", "Nombre_Establecimiento", "Regimen", "Delegacion", "ZUFO_REFOM", "Colonia", "Direccion", "Telefono", "Latitud", "Longitud"];
    
    let csvContent = "\uFEFF" + headers.join(",") + "\n";

    this.itemsFiltrados.forEach(it => {
      const row = [
        it.id,
        `"${(it.c || '').replace(/"/g, '""')}"`,
        `"${(it.m || '').replace(/"/g, '""')}"`,
        `"${(it.sc || '').replace(/"/g, '""')}"`,
        `"${(it.n || '').replace(/"/g, '""')}"`,
        `"${(it.p || '').replace(/"/g, '""')}"`,
        `"${(it.d || '').replace(/"/g, '""')}"`,
        `"${(it.z || '').replace(/"/g, '""')}"`,
        `"${(it.col || '').replace(/"/g, '""')}"`,
        `"${(it.a || '').replace(/"/g, '""')}"`,
        `"${(it.tel || '').replace(/"/g, '""')}"`,
        it.lat,
        it.lng
      ];
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Equipamiento_Urbano_Aguascalientes_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  obtenerColorCat(macro) {
    if (!macro) return '#009FB9';
    if (macro.includes('Salud')) return '#E11482';
    if (macro.includes('Educación')) return '#0A3B66';
    if (macro.includes('Cultura')) return '#7C3AED';
    if (macro.includes('Deporte')) return '#72B626';
    if (macro.includes('Comercio')) return '#F5A800';
    return '#009FB9';
  }
};

window.EquipamientoApp = EquipamientoApp;
