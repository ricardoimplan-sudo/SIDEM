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

  // Biblioteca Digital - 10 Ejes Temáticos con Fichas Completas, Indicadores y Catálogo Documental
  ejesBiblioteca: [
    {
      id: "municipio",
      nombre: "Nuestro Municipio",
      icono: "globe",
      count: 18,
      color: "text-blue-600",
      bgGradient: "from-blue-700 to-indigo-900",
      badge: "Marco Institucional & Territorial",
      descripcion: "Historia, límites territoriales, división delegacional y marco legal del municipio.",
      resumenCompleto: "Compilación de instrumentos normativos, diagnósticos territoriales, reglamentación interior y el Plan Municipal de Desarrollo que rige la planeación estratégica y el crecimiento ordenado del Municipio de Aguascalientes.",
      indicadores: [
        { etiqueta: "Superficie Municipal", valor: "1,178.85 km²", icono: "map" },
        { etiqueta: "Delegaciones", valor: "8 Demarcaciones", icono: "compass" },
        { etiqueta: "Población Total", valor: "948,990 hab.", icono: "users" },
        { etiqueta: "Grado de Urbanización", valor: "89.2% Urbano", icono: "building" }
      ],
      documentos: [
        {
          id: "doc-pmd-2024",
          titulo: "Plan Municipal de Desarrollo Aguascalientes 2024-2027",
          tipo: "Plan Rector",
          anio: "2024",
          formato: "PDF",
          tamano: "18.5 MB",
          descripcion: "Instrumento rector de planeación que define los ejes estratégicos, objetivos, metas e indicadores de la administración municipal.",
          dependencia: "H. Ayuntamiento de Aguascalientes",
          enlace: "https://www.ags.gob.mx/"
        },
        {
          id: "doc-pduca-2040",
          titulo: "Programa de Desarrollo Urbano de la Ciudad de Aguascalientes (PDUCA 2040)",
          tipo: "Programa Urbano",
          anio: "2024",
          formato: "PDF / SHP",
          tamano: "42.0 MB",
          descripcion: "Directrices de ordenamiento territorial, densificación urbana, zonificación secundaria, usos de suelo y reservas territoriales metropolitanas.",
          dependencia: "IMPLAN Aguascalientes",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-atlas-riesgos",
          titulo: "Atlas Municipal de Peligros y Riesgos Naturales y Antropogénicos",
          tipo: "Atlas / Cartografía",
          anio: "2025",
          formato: "PDF / SIG",
          tamano: "65.0 MB",
          descripcion: "Identificación y zonificación georreferenciada de fallas geológicas, zonas inundables, sismicidad y riesgos químicos del municipio.",
          dependencia: "Protección Civil Municipal & IMPLAN",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-bando-gobierno",
          titulo: "Bando de Policía y Gobierno del Municipio de Aguascalientes",
          tipo: "Marco Jurídico",
          anio: "2024",
          formato: "PDF",
          tamano: "4.2 MB",
          descripcion: "Normatividad rectora de la convivencia cívica, atribuciones de las dependencias municipales y derechos y obligaciones de la ciudadanía.",
          dependencia: "Secretaría del H. Ayuntamiento",
          enlace: "https://transparencia.ags.gob.mx/"
        },
        {
          id: "doc-marco-delegacional",
          titulo: "Delimitación y Marco Geoestadístico de las 8 Delegaciones Municipales",
          tipo: "Cartografía / Estudio",
          anio: "2025",
          formato: "PDF / SHP",
          tamano: "12.0 MB",
          descripcion: "Límites oficiales, colonias integradas, cartografía y estadísticas poblacionales de cada una de las 8 delegaciones urbanas y rurales.",
          dependencia: "IMPLAN Aguascalientes",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-reglamento-implan",
          titulo: "Reglamento Interior del Instituto Municipal de Planeación (IMPLAN)",
          tipo: "Reglamento",
          anio: "2024",
          formato: "PDF",
          tamano: "2.1 MB",
          descripcion: "Estructura orgánica, facultades técnicas, comisiones y atribuciones legales del IMPLAN para la planeación urbana de Aguascalientes.",
          dependencia: "IMPLAN Aguascalientes",
          enlace: "http://www.implanags.gob.mx/"
        }
      ]
    },
    {
      id: "culdep",
      nombre: "Cultura y Deporte",
      icono: "trophy",
      count: 12,
      color: "text-amber-600",
      bgGradient: "from-amber-600 to-orange-800",
      badge: "Patrimonio & Recreación",
      descripcion: "Centros deportivos, casas de cultura, eventos y patrimonio histórico.",
      resumenCompleto: "Diagnósticos de infraestructura deportiva comunitaria, catálogo del patrimonio arquitectónico de la ciudad, preservación de monumentos y oferta cultural por delegación.",
      indicadores: [
        { etiqueta: "Centros Deportivos", valor: "142 Espacios", icono: "activity" },
        { etiqueta: "Casas de Cultura y Museos", valor: "38 Recintos", icono: "landmark" },
        { etiqueta: "Eventos Anuales", valor: "450+ Actividades", icono: "calendar" },
        { etiqueta: "Inversión Deporte", valor: "$45.8 MDP", icono: "dollar-sign" }
      ],
      documentos: [
        {
          id: "doc-infra-deportiva",
          titulo: "Diagnóstico de Infraestructura y Cobertura Deportiva Municipal",
          tipo: "Diagnóstico",
          anio: "2025",
          formato: "PDF",
          tamano: "14.8 MB",
          descripcion: "Evaluación del estado físico, equipamiento, canchas de pasto sintético, albercas municipales y radios de cobertura por colonia.",
          dependencia: "IDEA & IMPLAN",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-patrimonio-refugio",
          titulo: "Catálogo del Patrimonio Arquitectónico y Obras de Refugio Reyes Rivas",
          tipo: "Catálogo Histórico",
          anio: "2024",
          formato: "PDF",
          tamano: "38.0 MB",
          descripcion: "Inventario gráfico y arquitectónico de templos, casonas y monumentos emblemáticos del ilustre arquitecto empírico hidrocálido.",
          dependencia: "IMAC & IMPLAN",
          enlace: "https://ags.gob.mx/turismo/"
        },
        {
          id: "doc-red-bibliotecas",
          titulo: "Programa Municipal de Fomento a la Lectura y Red de Bibliotecas",
          tipo: "Programa Social",
          anio: "2025",
          formato: "PDF",
          tamano: "6.4 MB",
          descripcion: "Estrategias de modernización digital, acervo bibliográfico y talleres en las 16 bibliotecas públicas municipales.",
          dependencia: "Instituto Municipal Aguascalentense para la Cultura",
          enlace: "https://ags.gob.mx/imac/"
        },
        {
          id: "doc-guia-museos",
          titulo: "Guía y Mapa del Circuito de Museos del Centro Histórico",
          tipo: "Guía Turística",
          anio: "2025",
          formato: "PDF / JPG",
          tamano: "8.5 MB",
          descripcion: "Rutas peatonales por museos, galerías, salas de exposición y centros culturales del primer cuadro de la ciudad.",
          dependencia: "Secretaría de Economía Social y Turismo",
          enlace: "https://www.ags.gob.mx/turismo/"
        }
      ]
    },
    {
      id: "desoc",
      nombre: "Desarrollo Social",
      icono: "heart-handshake",
      count: 15,
      color: "text-rose-600",
      bgGradient: "from-rose-600 to-pink-800",
      badge: "Bienestar & Cohesión Social",
      descripcion: "Programas de apoyo social, grupos vulnerables y bienestar comunitario.",
      resumenCompleto: "Focalización territorial de zonas de atención prioritaria (ZAP), diagnósticos de pobreza multidimensional, apoyo alimentario y centros comunitarios.",
      indicadores: [
        { etiqueta: "Zonas ZAP 2026", valor: "68 Secciones", icono: "alert-circle" },
        { etiqueta: "Centros CEDECO", valor: "24 Centros", icono: "home" },
        { etiqueta: "Adultos Mayores", valor: "78,400 hab.", icono: "users" },
        { etiqueta: "Beneficiarios", valor: "125,000 personas", icono: "smile" }
      ],
      documentos: [
        {
          id: "doc-zap-2026",
          titulo: "Diagnóstico Territorial de Zonas de Atención Prioritaria ZAP 2025-2026",
          tipo: "Diagnóstico Oficial",
          anio: "2025",
          formato: "PDF / Excel",
          tamano: "22.0 MB",
          descripcion: "Identificación de secciones electorales y polígonos con mayor rezago en servicios, ingresos y marginación urbana y rural.",
          dependencia: "IMPLAN Aguascalientes",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-pobreza-multidim",
          titulo: "Estudio de Pobreza Multidimensional y Rezago Social por Colonia",
          tipo: "Estudio Estadístico",
          anio: "2024",
          formato: "PDF",
          tamano: "15.6 MB",
          descripcion: "Análisis basado en datos CONEVAL e INEGI sobre carencias de vivienda, salud, educación y servicios básicos en el municipio.",
          dependencia: "CONEVAL & IMPLAN",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-inclusion-adultos",
          titulo: "Diagnóstico Integral de Inclusión y Accesibilidad Universal",
          tipo: "Estudio de Inclusión",
          anio: "2025",
          formato: "PDF",
          tamano: "18.2 MB",
          descripcion: "Diagnóstico de personas con discapacidad, personas de la tercera edad y adecuaciones requeridas en espacio público.",
          dependencia: "DIF Municipal de Aguascalientes",
          enlace: "https://ags.gob.mx/dif/"
        },
        {
          id: "doc-padron-programas",
          titulo: "Padrón y Reglas de Operación de Programas Sociales Municipales",
          tipo: "Normativa / Padrón",
          anio: "2025",
          formato: "PDF",
          tamano: "7.8 MB",
          descripcion: "Lineamientos de entrega de becas, despensas, tinacos, calentadores solares y apoyos productivos directos.",
          dependencia: "SEDESOM",
          enlace: "https://transparencia.ags.gob.mx/"
        }
      ]
    },
    {
      id: "economia",
      nombre: "Economía y Empleo",
      icono: "trending-up",
      count: 24,
      color: "text-emerald-600",
      bgGradient: "from-emerald-600 to-teal-800",
      badge: "Inversión & Competitividad",
      descripcion: "Actividad industrial, comercio, servicios, empleo e inversión.",
      resumenCompleto: "Información sobre el dinamismo industrial, parques tecnológicos, comercio local, mercados públicos, unidades económicas registradas y empleo formal.",
      indicadores: [
        { etiqueta: "Unidades Económicas", valor: "48,250 Empresas", icono: "briefcase" },
        { etiqueta: "Población Activa (PEA)", valor: "462,800 hab.", icono: "user-check" },
        { etiqueta: "Parques Industriales", valor: "16 Parques", icono: "factory" },
        { etiqueta: "Tasa Desocupación", valor: "2.8% (Baja)", icono: "trending-down" }
      ],
      documentos: [
        {
          id: "doc-anuario-economico",
          titulo: "Anuario Estadístico y Económico del Municipio de Aguascalientes 2025-2026",
          tipo: "Anuario Estadístico",
          anio: "2025",
          formato: "PDF / Excel",
          tamano: "28.5 MB",
          descripcion: "Compendio de variables macroeconómicas, empleo, inversión extranjera directa, manufactura y servicios en la capital.",
          dependencia: "SEDECYT & IMPLAN",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-censo-economico",
          titulo: "Censo y Diagnóstico de Unidades Económicas por Delegación",
          tipo: "Censo / SIG",
          anio: "2024",
          formato: "PDF / SHP",
          tamano: "34.0 MB",
          descripcion: "Distribución territorial del comercio al por menor, industrias, servicios profesionales y microempresas hidrocálidas.",
          dependencia: "INEGI & IMPLAN",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-vocaciones-productivas",
          titulo: "Estudio de Vocaciones Productivas, Clústeres y Atracción de Inversiones",
          tipo: "Estudio de Competitividad",
          anio: "2025",
          formato: "PDF",
          tamano: "19.4 MB",
          descripcion: "Análisis del sector automotriz, tecnologías de información, dispositivos médicos, agroindustria y logística.",
          dependencia: "Secretaría de Economía Social y Turismo",
          enlace: "https://ags.gob.mx/turismo/"
        },
        {
          id: "doc-mercados-abastos",
          titulo: "Diagnóstico y Plan de Modernización de Mercados Municipales",
          tipo: "Diagnóstico Urbano",
          anio: "2025",
          formato: "PDF",
          tamano: "14.2 MB",
          descripcion: "Evaluación de los 9 mercados municipales, infraestructura de locales, servicios y abasto alimentario de la ciudad.",
          dependencia: "Dirección de Mercados & IMPLAN",
          enlace: "https://www.ags.gob.mx/"
        }
      ]
    },
    {
      id: "educacion",
      nombre: "Educación",
      icono: "graduation-cap",
      count: 14,
      color: "text-indigo-600",
      bgGradient: "from-indigo-600 to-blue-800",
      badge: "Formación & Cobertura Escolar",
      descripcion: "Nivel de escolaridad, cobertura educativa e instituciones en el municipio.",
      resumenCompleto: "Censo georreferenciado de escuelas desde nivel preescolar hasta universidades, diagnósticos de cobertura peatonal, deserción y programas de becas.",
      indicadores: [
        { etiqueta: "Planteles Educativos", valor: "1,180 Escuelas", icono: "book" },
        { etiqueta: "Escolaridad Media", valor: "10.8 Años (Prepa)", icono: "award" },
        { etiqueta: "Tasa de Alfabetismo", valor: "98.6%", icono: "check-circle" },
        { etiqueta: "Matrícula Total", valor: "285,400 Estudiantes", icono: "users" }
      ],
      documentos: [
        {
          id: "doc-cobertura-educativa",
          titulo: "Diagnóstico de Cobertura y Rezago Educativo por Sección Electoral",
          tipo: "Diagnóstico SIG",
          anio: "2025",
          formato: "PDF / Excel",
          tamano: "16.5 MB",
          descripcion: "Análisis de oferta y demanda educativa, identificación de secciones sin cobertura de secundaria y media superior.",
          dependencia: "IEA & IMPLAN",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-directorio-escuelas",
          titulo: "Directorio Georreferenciado y Radios de Cobertura de Planteles",
          tipo: "Cartografía / Base de Datos",
          anio: "2025",
          formato: "PDF / SHP",
          tamano: "25.0 MB",
          descripcion: "Ubicación geográfica precisa de cada jardín de niños, primaria, secundaria, bachillerato y universidad en el municipio.",
          dependencia: "IMPLAN Aguascalientes",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-rutas-escolares",
          titulo: "Estudio de Accesibilidad Peatonal y Rutas Seguras a Escuelas Públicas",
          tipo: "Estudio de Movilidad",
          anio: "2024",
          formato: "PDF",
          tamano: "12.8 MB",
          descripcion: "Auditorías de seguridad vial en entornos escolares, banquetas accesibles y señalización en polígonos de alta afluencia.",
          dependencia: "Movilidad Municipal & IMPLAN",
          enlace: "http://www.implanags.gob.mx/"
        }
      ]
    },
    {
      id: "ambiente",
      nombre: "Medio Ambiente",
      icono: "leaf",
      count: 20,
      color: "text-green-600",
      bgGradient: "from-green-600 to-emerald-800",
      badge: "Sustentabilidad & Recursos",
      descripcion: "Áreas naturales protegidas, calidad del aire, arbolado y recursos hídricos.",
      resumenCompleto: "Programas de mitigación climática, censo del arbolado urbano, protección de microcuencas, áreas naturales protegidas y diagnóstico del acuífero.",
      indicadores: [
        { etiqueta: "Áreas Protegidas", valor: "4 Reservas (Cobos)", icono: "shield" },
        { etiqueta: "Árboles Urbanos", valor: "320,000 Censados", icono: "trees" },
        { etiqueta: "Área Verde / Hab.", valor: "6.8 m² / persona", icono: "maximize-2" },
        { etiqueta: "Calidad del Aire", valor: "Monitoreo 24/7", icono: "wind" }
      ],
      documentos: [
        {
          id: "doc-paccm-clima",
          titulo: "Programa Municipal de Acción ante el Cambio Climático (PACCM)",
          tipo: "Programa Rector",
          anio: "2025",
          formato: "PDF",
          tamano: "26.4 MB",
          descripcion: "Inventario de emisiones de gases de efecto invernadero, metas de descarbonización y medidas de adaptación municipal.",
          dependencia: "SEMADESU & IMPLAN",
          enlace: "https://ags.gob.mx/semadesu/"
        },
        {
          id: "doc-censo-arbolado",
          titulo: "Inventario y Censo del Arbolado Urbano de Aguascalientes",
          tipo: "Censo Ambiental / SIG",
          anio: "2025",
          formato: "PDF / SHP",
          tamano: "45.0 MB",
          descripcion: "Especies nativas, estado fitosanitario, paleta vegetal recomendada y servicios ambientales del arbolado de la ciudad.",
          dependencia: "SEMADESU",
          enlace: "https://ags.gob.mx/semadesu/"
        },
        {
          id: "doc-anp-cobos",
          titulo: "Plan de Manejo del Área Natural Protegida Municipal Cobos-Parga",
          tipo: "Plan de Manejo",
          anio: "2024",
          formato: "PDF",
          tamano: "32.0 MB",
          descripcion: "Zonificación de conservación, flora y fauna endémica, yacimientos paleontológicos y reglas de uso del suelo.",
          dependencia: "SEMADESU & PROESPA",
          enlace: "https://ags.gob.mx/semadesu/"
        },
        {
          id: "doc-balance-hidrico",
          titulo: "Balance Hídrico Municipal y Estrategias de Conservación del Acuífero",
          tipo: "Estudio Hídrico",
          anio: "2025",
          formato: "PDF",
          tamano: "21.5 MB",
          descripcion: "Diagnóstico de recarga del acuífero del Valle de Aguascalientes, reúso de aguas tratadas e infraestructura hidráulica MIAA.",
          dependencia: "MIAA & IMPLAN",
          enlace: "http://www.implanags.gob.mx/"
        }
      ]
    },
    {
      id: "salud",
      nombre: "Salud",
      icono: "activity",
      count: 11,
      color: "text-red-600",
      bgGradient: "from-red-600 to-rose-800",
      badge: "Salud Pública & Bienestar",
      descripcion: "Centros de salud, clínicas municipales, prevención y cobertura médica.",
      resumenCompleto: "Infraestructura hospitalaria pública y privada, unidades médicas móviles, salud mental, prevención de adicciones y atención veterinaria pública.",
      indicadores: [
        { etiqueta: "Centros de Salud", valor: "112 Unidades", icono: "cross" },
        { etiqueta: "Derechohabiencia", valor: "81.4% Cobertura", icono: "shield-check" },
        { etiqueta: "Hospital Veterinario", valor: "1er Hospital Público", icono: "heart" },
        { etiqueta: "Consultorios DIF", valor: "32 Módulos", icono: "home" }
      ],
      documentos: [
        {
          id: "doc-infra-salud",
          titulo: "Diagnóstico de Infraestructura y Cobertura de Servicios de Salud",
          tipo: "Diagnóstico",
          anio: "2025",
          formato: "PDF / SIG",
          tamano: "19.8 MB",
          descripcion: "Evaluación de camas hospitalarias, médicos por cada mil habitantes y tiempos de traslado en urgencias por delegación.",
          dependencia: "ISSEA & IMPLAN",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-directorio-salud",
          titulo: "Directorio Georreferenciado de Unidades Médicas Públicas y Privadas",
          tipo: "Directorio / SIG",
          anio: "2025",
          formato: "PDF / SHP",
          tamano: "16.0 MB",
          descripcion: "Localización precisa de clínicas IMSS, ISSSTE, ISSEA, centros de salud comunitarios y hospitales privados.",
          dependencia: "IMPLAN Aguascalientes",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-salud-mental",
          titulo: "Plan Municipal de Salud Mental y Prevención de Conductas de Riesgo",
          tipo: "Programa Preventivo",
          anio: "2025",
          formato: "PDF",
          tamano: "11.5 MB",
          descripcion: "Líneas de atención psicológica 24 horas, módulos en secundarias y preparatorias, y brigadas comunitarias de orientación.",
          dependencia: "DIF Municipal & IMAC",
          enlace: "https://ags.gob.mx/dif/"
        },
        {
          id: "doc-manual-hospital-vet",
          titulo: "Protocolo de Operatividad y Servicios del Hospital Veterinario Municipal",
          tipo: "Manual Operativo",
          anio: "2025",
          formato: "PDF",
          tamano: "8.4 MB",
          descripcion: "Cartera de servicios, esterilizaciones gratuitas, quirófanos, vacunas y adopciones responsables de animales de compañía.",
          dependencia: "Coordinación General de Salud Municipal",
          enlace: "https://ags.gob.mx/hospitalveterinario/"
        }
      ]
    },
    {
      id: "seguridad",
      nombre: "Seguridad Pública",
      icono: "shield-check",
      count: 16,
      color: "text-slate-700",
      bgGradient: "from-slate-800 to-blue-950",
      badge: "Justicia Cívica & Prevención",
      descripcion: "Sectores de vigilancia, programas de prevención y justicia cívica.",
      resumenCompleto: "Sectores policiales, mapas de calor de incidencia delictiva, tiempos de respuesta del C4 Municipal, juzgados cívicos y profesionalización en el ISSP.",
      indicadores: [
        { etiqueta: "Sectores Operativos", valor: "5 Sectores", icono: "compass" },
        { etiqueta: "Policía Municipal", valor: "1,650 Oficiales", icono: "users" },
        { etiqueta: "Cámaras C4 Municipal", valor: "1,200+ Puntos", icono: "video" },
        { etiqueta: "Juzgados Cívicos", valor: "4 Sedes", icono: "scale" }
      ],
      documentos: [
        {
          id: "doc-programa-seguridad",
          titulo: "Programa Sectorial de Seguridad Pública y Prevención del Delito",
          tipo: "Programa Sectorial",
          anio: "2025",
          formato: "PDF",
          tamano: "24.0 MB",
          descripcion: "Estrategias de policía de proximidad, comités de vecinos vigilantes, patrullaje inteligente y coordinación metropolitana.",
          dependencia: "Secretaría de Seguridad Pública Municipal (SSPM)",
          enlace: "https://ags.gob.mx/issp/"
        },
        {
          id: "doc-justicia-civica",
          titulo: "Modelo de Justicia Cívica y Mediación Comunitaria de Aguascalientes",
          tipo: "Modelo Operativo",
          anio: "2024",
          formato: "PDF",
          tamano: "14.5 MB",
          descripcion: "Audiencias públicas orales, trabajo en favor de la comunidad, mediación vecinal y prevención de faltas administrativas.",
          dependencia: "Dirección de Justicia Cívica",
          enlace: "https://www.ags.gob.mx/"
        },
        {
          id: "doc-atlas-incidencia",
          titulo: "Atlas de Incidencia Urbana y Mapas de Calor Preventivos",
          tipo: "Atlas / SIG",
          anio: "2025",
          formato: "PDF / SIG",
          tamano: "36.0 MB",
          descripcion: "Georreferenciación de llamadas al 911 y 072, zonas prioritarias de patrullaje e iluminación disuasiva.",
          dependencia: "C4 Municipal & IMPLAN",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-curricula-issp",
          titulo: "Plan Curricular y Formación del Instituto Superior en Seguridad Pública",
          tipo: "Plan Educativo Policial",
          anio: "2025",
          formato: "PDF",
          tamano: "6.8 MB",
          descripcion: "Programa de Técnico Superior Universitario en Policía de Proximidad y Licenciatura en Seguridad Ciudadana.",
          dependencia: "ISSP Aguascalientes",
          enlace: "https://ags.gob.mx/issp/"
        }
      ]
    },
    {
      id: "serviciospub",
      nombre: "Servicios Públicos",
      icono: "zap",
      count: 19,
      color: "text-yellow-600",
      bgGradient: "from-amber-600 to-yellow-800",
      badge: "Limpia, Alumbrado & Parques",
      descripcion: "Alumbrado público, limpia y recolección, parques y jardines.",
      resumenCompleto: "Modernización del alumbrado público a tecnología LED, rutas diarias de recolección de basura, mantenimiento de áreas verdes y panteones.",
      indicadores: [
        { etiqueta: "Luminarias LED", valor: "78,500 Puntos (85%)", icono: "sun" },
        { etiqueta: "Basura Recolectada", valor: "650 Ton/Día", icono: "trash-2" },
        { etiqueta: "Contenedores", valor: "4,500 Unidades", icono: "box" },
        { etiqueta: "Áreas Verdes Mant.", valor: "3.8 Millones m²", icono: "scissors" }
      ],
      documentos: [
        {
          id: "doc-alumbrado-led",
          titulo: "Plan Maestro de Modernización de Alumbrado Público y Eficiencia Energética",
          tipo: "Plan Técnico",
          anio: "2025",
          formato: "PDF",
          tamano: "17.5 MB",
          descripcion: "Sustitución de tecnología de vapor de sodio por luminarias LED inteligentes de bajo consumo y telemetría.",
          dependencia: "Secretaría de Servicios Públicos (SSP)",
          enlace: "https://www.ags.gob.mx/"
        },
        {
          id: "doc-rutas-recoleccion",
          titulo: "Diagnóstico de Rutas, Frecuencias y Cobertura de Limpia y Aseo Público",
          tipo: "Diagnóstico Logístico",
          anio: "2025",
          formato: "PDF / Excel",
          tamano: "22.0 MB",
          descripcion: "Mapeo de rutas de camiones recolectores, barrido mecánico y disposición en el Relleno Sanitario San Nicolás.",
          dependencia: "Dirección de Limpia y Aseo Público",
          enlace: "https://www.ags.gob.mx/"
        },
        {
          id: "doc-censo-contenedores",
          titulo: "Censo Georreferenciado de Contenedores y Puntos Limpios",
          tipo: "Censo / SIG",
          anio: "2025",
          formato: "PDF / SHP",
          tamano: "28.0 MB",
          descripcion: "Localización GPS de los 4,500 contenedores y estaciones de reciclaje en el municipio de Aguascalientes.",
          dependencia: "IMPLAN & SSP",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-panteones-municipales",
          titulo: "Reglamento y Operatividad de Panteones Municipales y Rastro",
          tipo: "Normativa / Manual",
          anio: "2024",
          formato: "PDF",
          tamano: "8.9 MB",
          descripcion: "Lineamientos del Panteón de la Cruz, Los Ángeles y Asunción, así como procesos sanitarios Tipo Inspección Federal (TIF).",
          dependencia: "Secretaría de Servicios Públicos",
          enlace: "https://www.ags.gob.mx/"
        }
      ]
    },
    {
      id: "urbanos",
      nombre: "Servicios Urbanos y Movilidad",
      icono: "truck",
      count: 22,
      color: "text-cyan-600",
      bgGradient: "from-cyan-600 to-blue-900",
      badge: "Movilidad & Conectividad",
      descripcion: "Vialidades, transporte, ciclovías, uso de suelo y desarrollo urbano.",
      resumenCompleto: "Red vial municipal de 3,250 km, movilidad no motorizada, ciclovías protegidas, pasos a desnivel en anillos periféricos y pavimentación.",
      indicadores: [
        { etiqueta: "Red Vial Total", valor: "3,250 km", icono: "navigation" },
        { etiqueta: "Anillos Periféricos", valor: "3 Circuitos", icono: "disc" },
        { etiqueta: "Ciclovías Seguras", valor: "85 km Conectados", icono: "bike" },
        { etiqueta: "Cruces Semafóricos", valor: "340 Intersecciones", icono: "traffic-cone" }
      ],
      documentos: [
        {
          id: "doc-pimus-movilidad",
          titulo: "Plan Integral de Movilidad Urbana Sustentable (PIMUS Aguascalientes)",
          tipo: "Plan Maestro",
          anio: "2025",
          formato: "PDF / SIG",
          tamano: "48.0 MB",
          descripcion: "Estrategias de jerarquía de movilidad, transporte público integrado, movilidad activa y reducción de emisiones.",
          dependencia: "IMPLAN & Movilidad",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-manual-calles",
          titulo: "Manual de Criterios de Diseño de Calles, Banquetas y Ciclovías",
          tipo: "Manual de Diseño",
          anio: "2024",
          formato: "PDF",
          tamano: "35.0 MB",
          descripcion: "Especificaciones técnicas para secciones viales, banquetas accesibles, arbolado en camellones y ciclocarriles.",
          dependencia: "IMPLAN Aguascalientes",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-aforos-anillos",
          titulo: "Estudio de Aforos Vehiculares, Velocidades y Capacidad en los 3 Anillos",
          tipo: "Estudio de Tránsito",
          anio: "2025",
          formato: "PDF / Excel",
          tamano: "26.8 MB",
          descripcion: "Conteo de volumen vehicular, cuellos de botella y modelación de flujo en Av. Convención, Aguascalientes y Siglo XXI.",
          dependencia: "IMPLAN Aguascalientes",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-red-ciclovias",
          titulo: "Red de Ciclovías: Diagnóstico de Conectividad y Nuevos Tramos",
          tipo: "Diagnóstico / SIG",
          anio: "2025",
          formato: "PDF / SHP",
          tamano: "21.0 MB",
          descripcion: "Evaluación de los 85 km de ciclovías existentes y propuesta de conectividad oriente-poniente y norte-sur.",
          dependencia: "IMPLAN & SEDESOM",
          enlace: "http://www.implanags.gob.mx/"
        },
        {
          id: "doc-indice-rodadura",
          titulo: "Diagnóstico de Pavimentación, Índice de Rodadura y Priorización de Bacheo",
          tipo: "Diagnóstico de Pavimentos",
          anio: "2025",
          formato: "PDF / SIG",
          tamano: "19.5 MB",
          descripcion: "Evaluación técnica del estado del pavimento asfáltico e hidráulico en las principales avenidas y colonias.",
          dependencia: "SOPMA & IMPLAN",
          enlace: "https://www.ags.gob.mx/"
        }
      ]
    }
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
