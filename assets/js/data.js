/**
 * ARCHIVO DE DATOS MAESTRO - PIMAGS (IMPLAN AGUASCALIENTES)
 * Contiene información enriquecida para todos los módulos, fichas técnicas e infografías.
 */

var PIMAGS_DATA = {
  general: {
    nombre: "PIMAgs",
    subtitulo: "Plataforma de Información Municipal",
    municipio: "Municipio de Aguascalientes",
    institucion: "Instituto Municipal de Planeación (IMPLAN)",
    directora: "Arq. Austria Gabriela Dávila de la Llave",
    cargo: "Directora General del IMPLAN",
    descripcion: "La Plataforma de Información Municipal de Aguascalientes (PIMAgs) es el conjunto de las Dependencias de la Administración Pública Municipal coordinadas por el IMPLAN, para acopiar, integrar, generar, georreferenciar, difundir y conservar la Información de Interés Municipal, presentada con niveles de desagregación geográfica por municipio, localidad, delegación, región, unidad territorial y colonia.",
    direccion: "Calle Antonio Acevedo Escobedo #103-A, Zona Centro, C.P. 20000, Aguascalientes, Ags.",
    telefono: "(449) 910 10 10 Ext. 3117 / Línea 072 / WhatsApp: 449 508 9898",
    correo: "ricardoimplan@gmail.com",
    horario: "Lunes a Viernes de 8:00 a 15:30 hrs."
  },

  // Métricas Clave Principales
  metricas: [
    { id: "poblacion", valor: "948,990", etiqueta: "Habitantes en el Municipio", icono: "users", cambio: "+1.2% anual", tendencia: "up" },
    { id: "viviendas", valor: "284,350", etiqueta: "Viviendas Particulares Habitadas", icono: "home", cambio: "98.4% con servicios", tendencia: "up" },
    { id: "equipamiento", valor: "1,420+", etiqueta: "Espacios de Equipamiento Urbano", icono: "building-2", cambio: "Georreferenciados", tendencia: "neutral" },
    { id: "obras", valor: "350+", etiqueta: "Obras y Proyectos Municipales", icono: "hard-hat", cambio: "Monitoreadas", tendencia: "up" }
  ],

  // Accesos Rápidos Principales
  accesosRapidos: [
    {
      id: "censal",
      titulo: "Información Censal",
      descripcion: "Consulta la demografía, dinámica poblacional y vivienda del municipio desglosada por delegación.",
      icono: "users",
      color: "from-emerald-500 to-teal-600",
      badge: "INEGI & IMPLAN",
      enlace: "#censal"
    },
    {
      id: "equipamiento",
      titulo: "Equipamiento Urbano",
      descripcion: "Catálogo georreferenciado de escuelas, parques, centros de salud, cultura y recreación.",
      icono: "building-2",
      color: "from-indigo-500 to-purple-600",
      badge: "Infraestructura",
      enlace: "#equipamiento"
    },
    {
      id: "obra",
      titulo: "Obra Pública",
      descripcion: "Visualización de las obras de pavimentación, alumbrado, agua potable y proyectos de desarrollo urbano.",
      icono: "hard-hat",
      color: "from-cyan-500 to-blue-600",
      badge: "Inversión Municipal",
      enlace: "#obra"
    },
    {
      id: "biblioteca",
      titulo: "Biblioteca Digital",
      descripcion: "Repositorio de estudios, estadísticas y publicaciones organizadas en 10 ejes temáticos estratégicos.",
      icono: "book-open",
      color: "from-blue-600 to-indigo-700",
      badge: "10 Ejes Temáticos",
      enlace: "#biblioteca"
    },
    {
      id: "visor",
      titulo: "Visor IDEAgs",
      descripcion: "Plataforma de Infraestructura de Datos Espaciales con capas cartográficas interactivas del municipio.",
      icono: "map-pin",
      color: "from-amber-500 to-orange-600",
      badge: "Cartografía Digital",
      enlace: "#visor"
    },
    {
      id: "infografias",
      titulo: "Infografías Municipales",
      descripcion: "Resúmenes visuales con datos clave sobre movilidad, medio ambiente, salud, economía y sociedad.",
      icono: "pie-chart",
      color: "from-pink-500 to-rose-600",
      badge: "Descargables",
      enlace: "#infografias"
    }
  ],

  // Biblioteca Digital - 10 Ejes Temáticos
  ejesBiblioteca: [
    { id: "municipio", nombre: "Nuestro Municipio", icono: "globe", count: 18, color: "text-blue-600", descripcion: "Historia, límites territoriales, división delegacional y marco legal." },
    { id: "culdep", nombre: "Cultura y Deporte", icono: "trophy", count: 12, color: "text-amber-600", descripcion: "Centros deportivos, casas de cultura, eventos y patrimonio histórico." },
    { id: "desoc", nombre: "Desarrollo Social", icono: "heart-handshake", count: 15, color: "text-rose-600", descripcion: "Programas de apoyo social, grupos vulnerables y bienestar comunitario." },
    { id: "economia", nombre: "Economía y Empleo", icono: "trending-up", count: 24, color: "text-emerald-600", descripcion: "Actividad industrial, comercio, servicios, empleo e inversión." },
    { id: "educacion", nombre: "Educación", icono: "graduation-cap", count: 14, color: "text-indigo-600", descripcion: "Nivel de escolaridad, cobertura educativa e instituciones en el municipio." },
    { id: "ambiente", nombre: "Medio Ambiente", icono: "leaf", count: 20, color: "text-green-600", descripcion: "Áreas naturales protegidas, calidad del aire, arbolado y recursos hídricos." },
    { id: "salud", nombre: "Salud", icono: "activity", count: 11, color: "text-red-600", descripcion: "Centros de salud, clínicas municipales, prevención y cobertura médica." },
    { id: "seguridad", nombre: "Seguridad Pública", icono: "shield-check", count: 16, color: "text-slate-700", descripcion: "Sectores de vigilancia, programas de prevención y justicia cívica." },
    { id: "serviciospub", nombre: "Servicios Públicos", icono: "zap", count: 19, color: "text-yellow-600", descripcion: "Alumbrado público, limpia y recolección, parques y jardines." },
    { id: "urbanos", nombre: "Servicios Urbanos y Movilidad", icono: "truck", count: 22, color: "text-cyan-600", descripcion: "Vialidades, transporte, ciclovías, uso de suelo y desarrollo urbano." }
  ],

  // Catálogo Completo de Infografías y Campañas Oficiales (H. Ayuntamiento de Aguascalientes & IMPLAN)
  infografias: [
    {
      id: "info-barrenador",
      titulo: "¡Protege a tu mascota del gusano barrenador!",
      categoria: "Salud Animal & Bienestar",
      dependencia: "PROESPA & Gobierno del Estado de Aguascalientes",
      resumen: "Medidas preventivas inmediatas, identificación de lesiones, síntomas de alerta y canales de atención de Regulación Sanitaria para protección animal.",
      descripcionDetallada: "Campaña epidemiológica y sanitaria preventiva ante el riesgo del gusano barrenador del ganado y animales de compañía. Se orienta a la población a revisar heridas en mascotas, mantener higiene en zonas rurales y urbanas, y reportar casos sospechosos inmediatamente a las brigadas de sanidad animal.",
      acciones: [
        "Revisión diaria del pelaje y heridas expuestas en mascotas y ganado",
        "Aplicación de antisépticos y repelentes veterinarios certificados",
        "Reporte telefónico inmediato ante presencia de larvas en tejidos vivos",
        "Atención médica veterinaria gratuita y orientación en centros autorizados"
      ],
      telefono: "449 688 4162 / 449 392 4441 (Ext. 1017)",
      horario: "Lunes a Viernes de 8:00 a 16:00 hrs. (Urgencias 24 hrs)",
      ubicacion: "Coordinación General de Salud y Regulación Sanitaria del Estado",
      imagen: "assets/img/infografias/gusano_barrenador_oficial.png",
      badge: "Oficial &bull; PROESPA",
      enlace: "https://www.ags.gob.mx/",
      color: "#E11482"
    },
    {
      id: "info-numero-oficial",
      titulo: "Asignación de Número Oficial y Alineamiento Digital",
      categoria: "Trámites Urbanos y Catastro",
      dependencia: "Secretaría de Desarrollo Urbano (SEDUM)",
      resumen: "Gestiona tu número oficial y constancia de alineamiento 100% digital desde casa, garantizando certeza jurídica y localización precisa de tu predio.",
      descripcionDetallada: "Trámite oficial que certifica el número exterior asignado a cada lote o inmueble dentro de la traza urbana de Aguascalientes, así como las restricciones de alineamiento respecto a la vía pública para construcciones y escrituración formal.",
      acciones: [
        "Solicitud 100% en línea a través del portal de SEDUM Digital",
        "Validación catastral georreferenciada con la base de datos municipal",
        "Descarga de constancia oficial con firma electrónica y código QR",
        "Válido ante notarías públicas, CFE, MIAA y dependencias estatales"
      ],
      telefono: "449 910 1010 Ext. 3000 / 3001",
      horario: "Lunes a Viernes de 8:00 a 15:30 hrs.",
      ubicacion: "Av. Adolfo López Mateos Pte. #100, Zona Centro, Aguascalientes",
      imagen: "assets/img/infografias/01_numero_oficial.png",
      badge: "SEDUM &bull; Trámite Digital",
      enlace: "https://ags.gob.mx/tramites/numerooficial/",
      color: "#009FB9"
    },
    {
      id: "info-hospital-veterinario",
      titulo: "Hospital Veterinario Municipal de Aguascalientes",
      categoria: "Salud y Bienestar Animal",
      dependencia: "H. Ayuntamiento de Aguascalientes",
      resumen: "Servicios médicos veterinarios integrales a bajo costo: consultas generales, cirugías, esterilizaciones, vacunación, desparasitación y adopción responsable.",
      descripcionDetallada: "El primer hospital veterinario público de vanguardia en el estado, equipado con quirófanos, rayos X, laboratorio clínico, área de urgencias y programas permanentes de esterilización gratuita para reducir el abandono animal.",
      acciones: [
        "Consultas generales y de especialidad a tarifas sociales accesibles",
        "Esterilización quirúrgica gratuita para perros y gatos comunitarios",
        "Vacunación antirrábica permanente y aplicación de desparasitantes",
        "Programa de adopción responsable 'Adopta un Amigo con Causa'"
      ],
      telefono: "Línea 072 / (449) 910 1010 Ext. 2100",
      horario: "Lunes a Domingo de 8:00 a 20:00 hrs. (Urgencias 24/7)",
      ubicacion: "Av. Alcaldes s/n, Fracc. Loma Bonita, Aguascalientes, Ags.",
      imagen: "assets/img/infografias/02_hospital_veterinario.png",
      badge: "Municipio Ags &bull; Bienestar Animal",
      enlace: "https://ags.gob.mx/hospitalveterinario/",
      color: "#72B626"
    },
    {
      id: "info-movilidad-ciclista",
      titulo: "Manual del Ciclista Urbano de Aguascalientes",
      categoria: "Movilidad y Sustentabilidad",
      dependencia: "Secretaría de Desarrollo Social (SEDESOM) & Movilidad",
      resumen: "Guía completa de movilidad activa en bicicleta: derechos viales, reglas de circulación, equipo de seguridad y conectividad de ciclovías metropolitanas.",
      descripcionDetallada: "Publicación oficial que compila la normativa vial vigente, derechos y obligaciones de los ciclistas, mapas de la red municipal de ciclovías consolidadas y consejos prácticos de mantenimiento y seguridad urbana.",
      acciones: [
        "Mapa de conectividad ciclista: ciclovías protegidas y carriles compartidos",
        "Reglamento de Tránsito Municipal aplicado a vehículos no motorizados",
        "Cursos y talleres de ciclismo urbano en parques y escuelas",
        "Descarga libre del manual en formato digital PDF de alta resolución"
      ],
      telefono: "(449) 910 1010 Ext. 2150 / 2155",
      horario: "Lunes a Viernes de 8:00 a 15:30 hrs.",
      ubicacion: "Calle Juan de Montsoro #103, Zona Centro, Aguascalientes",
      imagen: "assets/img/infografias/03_movilidad_ciclista.png",
      badge: "Movilidad &bull; Ciclovías",
      enlace: "https://www.ags.gob.mx/sedesom/ManualDelCiclistaAguascalientes.pdf",
      color: "#F5A800"
    },
    {
      id: "info-centro-pagos",
      titulo: "Centro de Pagos Digital e-Pagos Municipio Ags",
      categoria: "Finanzas y Servicios Digitales",
      dependencia: "Secretaría de Finanzas del Municipio de Aguascalientes",
      resumen: "Paga tu predial, licencias comerciales, multas viales y derechos municipales con descuentos por pronto pago, seguridad bancaria y factura inmediata.",
      descripcionDetallada: "Plataforma digital transaccional que permite a los contribuyentes realizar pagos seguros las 24 horas del día con tarjetas bancarias, SPEI o tiendas de conveniencia, obteniendo recibo fiscal digital (CFDI) al instante.",
      acciones: [
        "Consulta de estado de cuenta de impuesto predial por clave catastral",
        "Descuentos de hasta el 15% por pronto pago en los primeros meses del año",
        "Renovación y pago de licencias de funcionamiento comercial",
        "Facturación electrónica inmediata y descarga de recibos oficiales"
      ],
      telefono: "(449) 910 1010 Ext. 7100 / 7120",
      horario: "Atención Digital 24/7 / Cajas: L-V 8:00 a 15:00 hrs.",
      ubicacion: "Palacio Municipal, Plaza de la Patria s/n, Zona Centro",
      imagen: "assets/img/infografias/04_centro_pagos.png",
      badge: "e-Pagos &bull; Servicios en Línea",
      enlace: "https://epagosmunicipio.ags.gob.mx/",
      color: "#0A3B66"
    },
    {
      id: "info-conoce-municipio",
      titulo: "Conoce Nuestro Municipio: Cultura, Tradición e Historia",
      categoria: "Turismo e Identidad",
      dependencia: "Dirección de Turismo Municipal (SEDECYT)",
      resumen: "Recorre los cuatro barrios fundacionales, la arquitectura de Refugio Reyes, museos, plazas históricas y la exquisita gastronomía de Aguascalientes.",
      descripcionDetallada: "Guía turística interactiva y patrimonial que promueve las rutas de los Barrios Antiguos (San Marcos, El Encino, La Estación y Guadalupe), la riqueza de monumentos neoclásicos y los festivales culturales a lo largo del año.",
      acciones: [
        "Rutas peatonales autoguiadas por el Centro Histórico y monumentos",
        "Información sobre museos: Museo Posada, Museo Aguascalientes, MCR",
        "Cartelera cultural y festividades tradicionales del municipio",
        "Guía gastronómica de dulces típicos, cocina hidrocálida y vinos"
      ],
      telefono: "(449) 910 1010 Ext. 3110 / (449) 915 1591",
      horario: "Lunes a Domingo de 9:00 a 19:00 hrs.",
      ubicacion: "Palacio Municipal y Módulos de Información Turística",
      imagen: "assets/img/infografias/05_conoce_municipio.png",
      badge: "Turismo &bull; Aguascalientes",
      enlace: "https://ags.gob.mx/turismo/turismoags.html",
      color: "#E11482"
    },
    {
      id: "info-turismo-cat",
      titulo: "Centro de Atención y Orientación al Turista (CAT)",
      categoria: "Atención al Visitante",
      dependencia: "Secretaría de Economía Social y Turismo",
      resumen: "Módulo central en Plaza de la Patria con orientación bilingüe, venta de boletos del Tranvía Turístico, mapas interactivos y folletos de rutas turísticas.",
      descripcionDetallada: "Espacio moderno de atención al visitante nacional y extranjero en el corazón de la ciudad. Brinda mapas impresos y digitales, venta de boletos para el Tranvía Turístico de Aguascalientes y vinculación con operadoras turísticas.",
      acciones: [
        "Venta de boletos e itinerarios del Tranvía Turístico",
        "Atención bilingüe personalizada para visitantes nacionales y extranjeros",
        "Mapas turísticos, guías de hoteles y directorio de servicios certificados",
        "Información de tours a haciendas, vinícolas y talleres artesanales"
      ],
      telefono: "(449) 915 1591 / WhatsApp: 449 508 9898",
      horario: "Lunes a Domingo de 9:00 a 18:00 hrs.",
      ubicacion: "Plaza de la Patria Poniente (a un costado del Palacio Municipal)",
      imagen: "assets/img/infografias/06_turismo_cat.jpg",
      badge: "CAT &bull; Plaza de la Patria",
      enlace: "https://www.ags.gob.mx/turismo/conocemas/centrodeatencionalturismo/index.html",
      color: "#009FB9"
    },
    {
      id: "info-turismo-medico",
      titulo: "Aguascalientes: Destino Líder en Turismo Médico",
      categoria: "Salud Especializada",
      dependencia: "Clúster de Salud y Turismo Municipal",
      resumen: "Infraestructura hospitalaria de vanguardia, tecnología de punta, médicos especialistas certificados y hotelería de primer nivel a tarifas altamente competitivas.",
      descripcionDetallada: "Iniciativa conjunta que posiciona a Aguascalientes como el polo médico del Bajío para cirugías especializadas, tratamientos oncológicos, odontología avanzada y medicina preventiva con estándares internacionales de calidad.",
      acciones: [
        "Directorio de hospitales privados y clínicas certificadas por CSG",
        "Red de médicos especialistas colegiados en más de 40 disciplinas",
        "Paquetes integrales de atención médica, estancia hotelera y traslados",
        "Ahorros de hasta 60% respecto a costos de tratamientos en el extranjero"
      ],
      telefono: "(449) 910 1010 / Atención Clúster Médico",
      horario: "Lunes a Viernes de 8:00 a 16:00 hrs.",
      ubicacion: "Secretaría de Economía Social y Turismo Municipal",
      imagen: "assets/img/infografias/07_turismo_medico.jpg",
      badge: "Salud &bull; Clúster Médico",
      enlace: "https://www.ags.gob.mx/turismo/medico",
      color: "#0A3B66"
    },
    {
      id: "info-issp-seguridad",
      titulo: "Instituto Superior en Seguridad Pública (ISSP)",
      categoria: "Seguridad y Formación Policial",
      dependencia: "Secretaría de Seguridad Pública Municipal (SSPM)",
      resumen: "Convocatoria abierta para formar parte de la Policía Municipal con formación académica superior, beca mensual durante entrenamiento y prestaciones de ley.",
      descripcionDetallada: "Academia policial de nivel superior acreditada a nivel nacional. Ofrece programas de formación inicial para cadetes con titulación como Técnico Superior Universitario en Policía de Proximidad y Licenciatura en Seguridad Pública.",
      acciones: [
        "Beca económica mensual y alimentos durante el curso de formación",
        "Capacitación en derechos humanos, tiro táctico, manejo y mediación",
        "Ingreso inmediato a la corporación policial con sueldo competitivo",
        "Prestaciones superiores de ley, seguro de vida y plan de carrera policial"
      ],
      telefono: "(449) 994 6640 / (449) 994 6600",
      horario: "Lunes a Viernes de 8:00 a 16:00 hrs.",
      ubicacion: "Av. Aguascalientes Ote. y Av. Barberena Vega, Fracc. Municipio Libre",
      imagen: "assets/img/infografias/08_issp_seguridad.png",
      badge: "SSPM &bull; Seguridad Pública",
      enlace: "https://ags.gob.mx/issp/",
      color: "#009FB9"
    },
    {
      id: "info-markitos-atencion",
      titulo: "Hagamos Equipo con Markitos: Atención Ciudadana 24/7",
      categoria: "Atención Ciudadana y Reportes",
      dependencia: "Coordinación General de Atención Ciudadana",
      resumen: "Genera reportes de baches, alumbrado, recolección, fugas y desmalezado en segundos enviando un mensaje de WhatsApp a Markitos o llamando al 072.",
      descripcionDetallada: "Asistente virtual inteligente del Municipio de Aguascalientes diseñado para recibir, clasificar y canalizar reportes urbanos en tiempo real a las cuadrillas de servicios públicos, dando seguimiento con folio digital hasta su resolución.",
      acciones: [
        "Reporte express de baches, fugas de agua y luminarias apagadas vía WhatsApp",
        "Envío de fotografías y geolocalización GPS del desperfecto urbano",
        "Generación automática de número de folio para seguimiento en línea",
        "Línea 072 gratuita disponible las 24 horas del día, los 365 días del año"
      ],
      telefono: "Línea 072 / WhatsApp: 449 459 0739",
      horario: "Servicio Automatizado e Interactivo 24 horas / 365 días",
      ubicacion: "Palacio Municipal, Planta Baja, Zona Centro",
      imagen: "assets/img/infografias/09_markitos_atencion.jpg",
      badge: "Línea 072 &bull; Markitos Bot",
      enlace: "https://wa.me/5214494590739/?text=Hola",
      color: "#72B626"
    },
    {
      id: "info-servicios-publicos",
      titulo: "Mantenimiento Integral de Servicios Públicos Municipales",
      categoria: "Servicios Urbanos",
      dependencia: "Secretaría de Servicios Públicos (SSP)",
      resumen: "Atención constante en modernización de luminarias LED, mantenimiento de áreas verdes, poda de árboles en riesgo y recolección eficiente de residuos.",
      descripcionDetallada: "Operatividad permanente de las Direcciones de Alumbrado Público, Parques y Jardines, y Limpia y Aseo Público para conservar a Aguascalientes como una de las ciudades más limpias, iluminadas y arboladas de México.",
      acciones: [
        "Sustitución y mantenimiento de luminarias de vapor de sodio por tecnología LED",
        "Rutas diarias de recolección de basura domiciliaria y contenedores",
        "Mantenimiento fitosanitario de camellones, jardines y parques urbanos",
        "Operativos especiales de desazolve, barrido mecánico y lavado de plazas"
      ],
      telefono: "(449) 910 1010 Ext. 2100 / Línea 072",
      horario: "Lunes a Domingo las 24 hrs.",
      ubicacion: "Silvestre Gómez s/n, Col. Primo Verdad, Aguascalientes",
      imagen: "assets/img/infografias/10_servicios_publicos.jpg",
      badge: "SSP &bull; Servicios Públicos",
      enlace: "https://www.ags.gob.mx/",
      color: "#F5A800"
    },
    {
      id: "info-mitos-leyendas",
      titulo: "Mitos y Leyendas en Panteones Históricos de Aguascalientes",
      categoria: "Tradición, Cultura y Espectáculos",
      dependencia: "Dirección de Panteones Municipales & Instituto Municipal Aguascalentense para la Cultura (IMAC)",
      resumen: "Tradición hidrocálida de recorridos nocturnos con actores profesionales en el Panteón de la Cruz y Panteón de los Ángeles durante la temporada de Día de Muertos.",
      descripcionDetallada: "Espectáculo cultural y teatral multipremiado que revive las leyendas urbanas, mitos coloniales e historias populares de Aguascalientes dentro de los monumentales mausoleos de cantera de los siglos XIX y XX.",
      acciones: [
        "Recorridos guiados nocturnos teatralizados en el Panteón de la Cruz",
        "Puesta en escena con actores profesionales, iluminación y efectos especiales",
        "Venta de boletos digital en línea y en taquillas del CAM",
        "Fomento a la preservación del patrimonio funerario y cultural"
      ],
      telefono: "(449) 915 3012 / (449) 929 4047",
      horario: "Temporada Octubre - Noviembre (Funciones de 19:00 a 23:00 hrs.)",
      ubicacion: "Panteón de la Cruz (Calle Guadalupe s/n, Barrio de Guadalupe)",
      imagen: "assets/img/infografias/11_mitos_leyendas.jpg",
      badge: "Tradición &bull; Mitos y Leyendas",
      enlace: "https://boleteo.com.mx/mitos-y-leyendas-2026.html",
      color: "#E11482"
    },
    {
      id: "info-medio-ambiente-enriqueta",
      titulo: "Premio Municipal al Mérito Ambiental 'Enriqueta Medellín'",
      categoria: "Medio Ambiente y Sustentabilidad",
      dependencia: "Secretaría de Medio Ambiente y Desarrollo Sustentable (SEMADESU)",
      resumen: "Galardón anual otorgado a proyectos ciudadanos, educativos y empresariales que promueven la conservación del agua, arbolado y ecosistemas locales.",
      descripcionDetallada: "Reconocimiento institucional instituido por el Cabildo de Aguascalientes en honor a la destacada activista ecológica Enriqueta Medellín Legorreta, premiando las mejores prácticas de mitigación ambiental y cuidado del agua.",
      acciones: [
        "Categorías: Escuelas, Empresas, Organizaciones Civiles y Ciudadanía",
        "Reconocimiento económico y presea oficial entregada en sesión de Cabildo",
        "Financiamiento y acompañamiento técnico a proyectos ganadores",
        "Publicación de la memoria ambiental de iniciativas destacadas"
      ],
      telefono: "(449) 910 1010 Ext. 3500 / 3505",
      horario: "Lunes a Viernes de 8:00 a 15:30 hrs.",
      ubicacion: "Calle Zaragoza #605, Zona Centro, Aguascalientes",
      imagen: "assets/img/infografias/12_medio_ambiente_enriqueta.png",
      badge: "SEMADESU &bull; Mérito Ambiental",
      enlace: "https://ags.gob.mx/premios/enriquetamedellin/",
      color: "#72B626"
    }
  ]
};

if (typeof window !== 'undefined') {
  window.PIMAGS_DATA = PIMAGS_DATA;
}
