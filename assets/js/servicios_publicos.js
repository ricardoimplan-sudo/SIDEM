/**
 * PIMAgs - Módulo de Servicios Públicos Municipales (SSP)
 * Control de visualización cartográfica e indicadores PIM.SSP
 */

window.ServiciosPublicosApp = {
  tabActiva: 'limpia',

  init() {
    console.log("ServiciosPublicosApp inicializado.");
  },

  inicializarCapaContenedores() {
    if (!window.CONTENEDORES_DATA || !Array.isArray(window.CONTENEDORES_DATA)) {
      console.warn('CONTENEDORES_DATA no disponible');
      return;
    }

    try {
      if (typeof L.markerClusterGroup === 'function') {
        visorCapas.contenedores = L.markerClusterGroup({
          chunkedLoading: true,
          chunkInterval: 100,
          maxClusterRadius: 40,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          iconCreateFunction: function(cluster) {
            const count = cluster.getChildCount();
            let c = 'small';
            if (count > 50) c = 'medium';
            if (count > 250) c = 'large';
            return new L.DivIcon({
              html: '<div><span>' + count.toLocaleString('es-MX') + '</span></div>',
              className: 'marker-cluster marker-cluster-' + c,
              iconSize: new L.Point(40, 40)
            });
          }
        });
      } else {
        visorCapas.contenedores = L.layerGroup();
      }

      const markers = [];
      window.CONTENEDORES_DATA.forEach(c => {
        if (!c.lat || !c.lng) return;

        let colorTurno = '#0284c7'; // Nocturno
        if (c.turno === 'Matutino') colorTurno = '#f59e0b';
        else if (c.turno === 'Vespertino') colorTurno = '#ea580c';

        const marker = L.circleMarker([c.lat, c.lng], {
          radius: 5,
          fillColor: colorTurno,
          color: '#ffffff',
          weight: 1.5,
          fillOpacity: 0.95
        });

        const gMapUrl = `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`;
        const gDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;

        marker.bindPopup(`
          <div class="p-2 space-y-1.5 text-xs font-sans max-w-[260px]">
            <div class="flex items-center justify-between gap-1 border-b border-slate-100 pb-1">
              <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 flex items-center gap-1">
                <span>🗑️ Contenedor RSU</span>
              </span>
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">Folio: ${c.folio || 'S/F'}</span>
            </div>
            <strong class="text-slate-900 font-bold block leading-snug text-sm">${c.calle1 || 'Ubicación'}${c.calle2 ? ' y ' + c.calle2 : ''}</strong>
            <div class="text-[11px] text-slate-600">${c.colonia || 'Municipio de Aguascalientes'}</div>
            ${c.ref ? `<div class="text-[10px] text-slate-500 italic">Ref: ${c.ref}</div>` : ''}
            <div class="grid grid-cols-2 gap-1.5 pt-1 text-[10px] border-t border-slate-100">
              <div class="bg-slate-50 p-1 rounded font-semibold text-slate-700">Capacidad: <span class="font-bold text-sky-700">${c.capacidad || '2.6'} m³</span></div>
              <div class="bg-slate-50 p-1 rounded font-semibold text-slate-700">Turno: <span class="font-bold text-slate-900">${c.turno}</span></div>
              <div class="col-span-2 bg-slate-50 p-1 rounded font-semibold text-slate-700">Ruta de Recolección: <span class="font-bold text-brand-navy">Ruta #${c.ruta || 'N/A'}</span></div>
            </div>
            <div class="pt-1.5 flex items-center gap-1.5">
              <a href="${gMapUrl}" target="_blank" rel="noopener" class="flex-1 py-1 px-2 bg-brand-navy hover:bg-blue-900 text-white font-bold rounded-lg text-[10px] transition text-center shadow-sm">
                Google Maps
              </a>
              <a href="${gDirUrl}" target="_blank" rel="noopener" class="flex-1 py-1 px-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-[10px] transition text-center shadow-sm">
                Cómo llegar
              </a>
            </div>
          </div>
        `);

        markers.push(marker);
      });

      if (typeof visorCapas.contenedores.addLayers === 'function') {
        visorCapas.contenedores.addLayers(markers);
      } else {
        markers.forEach(m => visorCapas.contenedores.addLayer(m));
      }

    } catch(e) {
      console.error("Error al inicializar capa de Contenedores:", e);
    }
  },

  inicializarCapaParquesSSP() {
    if (!window.PARQUES_SSP_DATA || !Array.isArray(window.PARQUES_SSP_DATA)) {
      console.warn('PARQUES_SSP_DATA no disponible');
      return;
    }

    try {
      visorCapas.parques_ssp = L.layerGroup();

      window.PARQUES_SSP_DATA.forEach(p => {
        const gMapUrl = `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
        const gDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;

        const popupHtml = `
          <div class="p-2 space-y-1.5 text-xs font-sans max-w-[260px]">
            <div class="flex items-center justify-between gap-1 border-b border-slate-100 pb-1">
              <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span>🌳 ${p.tipo || 'Parque'}</span>
              </span>
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">${p.diagnostico || 'Operando'}</span>
            </div>
            <strong class="text-slate-900 font-bold block leading-snug text-sm">${p.nombre}</strong>
            <div class="text-[11px] text-slate-600">${p.calle ? p.calle + ', ' : ''}${p.colonia || 'Aguascalientes'}</div>
            ${p.delegacion ? `<div class="text-[10px] text-emerald-700 font-bold">Delegación ${p.delegacion}</div>` : ''}
            
            <div class="bg-emerald-50/70 p-1.5 rounded-lg text-[10px] space-y-0.5 text-slate-700">
              <div>Superficie: <strong class="text-emerald-900 font-extrabold">${p.superficie_m2 ? Number(p.superficie_m2).toLocaleString('es-MX') + ' m²' : 'No registrada'}</strong></div>
              ${p.infraestructura ? `<div class="text-slate-600 truncate" title="${p.infraestructura}">Equipamiento: ${p.infraestructura}</div>` : ''}
            </div>

            <div class="pt-1 flex items-center gap-1.5">
              <a href="${gMapUrl}" target="_blank" rel="noopener" class="flex-1 py-1 px-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10px] transition text-center shadow-sm">
                Google Maps
              </a>
              <a href="${gDirUrl}" target="_blank" rel="noopener" class="flex-1 py-1 px-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-[10px] transition text-center shadow-sm">
                Cómo llegar
              </a>
            </div>
          </div>
        `;

        if (p.poligono && p.poligono.length > 2) {
          L.polygon(p.poligono, {
            color: '#16a34a',
            weight: 2,
            fillColor: '#22c55e',
            fillOpacity: 0.35
          }).addTo(visorCapas.parques_ssp).bindPopup(popupHtml);
        }

        L.circleMarker([p.lat, p.lng], {
          radius: 5.5,
          fillColor: '#16a34a',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 0.95
        }).addTo(visorCapas.parques_ssp).bindPopup(popupHtml);
      });

    } catch(e) {
      console.error("Error al inicializar capa de Parques SSP:", e);
    }
  },

  abrirModal() {
    const m = document.getElementById('modalServiciosPublicos');
    if (!m) return;
    m.style.display = 'flex';
    m.classList.remove('hidden');
    this.cambiarTab(this.tabActiva || 'limpia');
    if (window.createIconsSafe) window.createIconsSafe();
  },

  cerrarModal() {
    const m = document.getElementById('modalServiciosPublicos');
    if (m) {
      m.style.display = 'none';
      m.classList.add('hidden');
    }
  },

  cambiarTab(tabName) {
    this.tabActiva = tabName;
    ['limpia', 'alumbrado', 'parques', 'panteones'].forEach(t => {
      const btn = document.getElementById('tabBtnSSP_' + t);
      const pane = document.getElementById('tabPaneSSP_' + t);
      if (btn) {
        if (t === tabName) {
          btn.className = 'tab-btn-ssp px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 bg-white text-emerald-800 shadow-sm border border-emerald-300';
        } else {
          btn.className = 'tab-btn-ssp px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 text-slate-600 hover:text-slate-900';
        }
      }
      if (pane) {
        if (t === tabName) {
          pane.classList.remove('hidden');
        } else {
          pane.classList.add('hidden');
        }
      }
    });
    if (window.createIconsSafe) window.createIconsSafe();
  },

  activarCapaYCentrar(nombreCapa) {
    this.cerrarModal();
    if (typeof cambiarSeccion === 'function') {
      cambiarSeccion('visor');
    }
    setTimeout(() => {
      if (nombreCapa === 'contenedores') {
        const chk = document.getElementById('chkCapaContenedores');
        if (chk && !chk.checked) {
          chk.checked = true;
          toggleCapaVisor('contenedores', true);
        }
      } else if (nombreCapa === 'parques_ssp') {
        const chk = document.getElementById('chkCapaParquesSSP');
        if (chk && !chk.checked) {
          chk.checked = true;
          toggleCapaVisor('parques_ssp', true);
        }
      }
      if (window.mapPimags) {
        window.mapPimags.flyTo([21.8853, -102.2916], 13, { duration: 1.2 });
      }
    }, 250);
  },

  irAParque(id) {
    if (!window.PARQUES_SSP_DATA || !window.mapPimags) return;
    const p = window.PARQUES_SSP_DATA.find(x => x.id === id);
    if (!p) return;

    const chk = document.getElementById('chkCapaParquesSSP');
    if (chk && !chk.checked) {
      chk.checked = true;
      toggleCapaVisor('parques_ssp', true);
    }

    window.mapPimags.flyTo([p.lat, p.lng], 16, { duration: 1 });
    if (typeof limpiarBuscadorVisor === 'function') limpiarBuscadorVisor();
  },

  irAContenedor(id) {
    if (!window.CONTENEDORES_DATA || !window.mapPimags) return;
    const c = window.CONTENEDORES_DATA.find(x => x.id === id);
    if (!c) return;

    const chk = document.getElementById('chkCapaContenedores');
    if (chk && !chk.checked) {
      chk.checked = true;
      toggleCapaVisor('contenedores', true);
    }

    window.mapPimags.flyTo([c.lat, c.lng], 18, { duration: 1 });
    if (typeof limpiarBuscadorVisor === 'function') limpiarBuscadorVisor();
  }
};

// Aliases globales para llamadas directas
window.abrirModalServiciosPublicos = () => ServiciosPublicosApp.abrirModal();
window.cerrarModalServiciosPublicos = () => ServiciosPublicosApp.cerrarModal();
window.cambiarTabModalSSP = (t) => ServiciosPublicosApp.cambiarTab(t);
window.activarCapaYCentrarSSP = (c) => ServiciosPublicosApp.activarCapaYCentrar(c);
window.irAParqueSSP = (id) => ServiciosPublicosApp.irAParque(id);
window.irAContenedorSSP = (id) => ServiciosPublicosApp.irAContenedor(id);
window.inicializarCapaContenedores = () => ServiciosPublicosApp.inicializarCapaContenedores();
window.inicializarCapaParquesSSP = () => ServiciosPublicosApp.inicializarCapaParquesSSP();
