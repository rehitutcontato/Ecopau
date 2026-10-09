export interface CrimeCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  severity: 'ALTA' | 'CRITICA' | 'MEDIA';
  description: string;
}

export interface MockCARProperty {
  id: number;
  cnpj: string;
  razaoSocial: string;
  codigoCAR: string;
  bioma: string;
  embargoIBAMA: boolean;
  areaHectares: number;
  // GeoJSON Polygon coordinates [lon, lat]
  polygon: [number, number][];
}

export interface MockReport {
  id: string;
  categoriaId: number;
  categoriaNome: string;
  latitude: number;
  longitude: number;
  midiaHash: string;
  statusId: 'RECEBIDO' | 'EM_ANALISE_SATELITE' | 'VALIDADO_COM_EVIDENCIA' | 'REJEITADO';
  confiancaSatelite: number | null;
  sateliteProvider: string | null;
  alertaMapBiomasId: string | null;
  dataCriacao: string;
  descricao: string;
  empresaAssociada?: {
    razaoSocial: string;
    cnpj: string;
    codigoCAR: string;
    tipoSobreposicao: 'CONTIDO_NO_CAR' | 'BUFFER_1KM';
    distanciaMetros?: number;
  };
}

export interface SatelliteAlert {
  id: string;
  provider: 'Sentinel-2 L2A' | 'MapBiomas Alertas' | 'DETER/INPE';
  latitude: number;
  longitude: number;
  dataDeteccao: string;
  areaEstimadaHectares: number;
  indiceNDVIDelta: number; // e.g. -0.42 (queda severa de biomassa)
  confianca: number;
  bioma: string;
}

export const CATEGORIAS_CRIME: CrimeCategory[] = [
  {
    id: 1,
    name: 'Desmatamento Ilegal de Floresta Primária',
    slug: 'desmatamento',
    icon: 'TreePine',
    severity: 'CRITICA',
    description: 'Corte raso de vegetação nativa em Terra Indígena, UC ou Reserva Legal sem autorização do órgão ambiental.',
  },
  {
    id: 2,
    name: 'Queimada Clandestina / Uso de Fogo Não Autorizado',
    slug: 'queimada',
    icon: 'Flame',
    severity: 'CRITICA',
    description: 'Ignição intencional para limpeza de pasto ou avanço de fronteira agropecuária em período de defeso.',
  },
  {
    id: 3,
    name: 'Contaminação Hídrica / Despejo Químico',
    slug: 'contaminacao-hidrica',
    icon: 'Droplet',
    severity: 'ALTA',
    description: 'Lançamento de efluentes industriais, agrotóxicos ou rejeitos em corpos d’água e bacias hidrográficas.',
  },
  {
    id: 4,
    name: 'Garimpo Ilegal / Draga Fluvial',
    slug: 'garimpo-ilegal',
    icon: 'Mountain',
    severity: 'CRITICA',
    description: 'Extração mineral clandestina com uso de mercúrio, abertura de pistas de pouso e assoreamento de rios.',
  },
  {
    id: 5,
    name: 'Grilagem de Terras Públicas / Invasão de UC',
    slug: 'grilagem',
    icon: 'ShieldAlert',
    severity: 'ALTA',
    description: 'Cercamento irregular, abertura de estradas não autorizadas e descaracterização de patrimônio público.',
  },
];

export const MOCK_CAR_PROPERTIES: MockCARProperty[] = [
  {
    id: 101,
    cnpj: '14.892.341/0001-89',
    razaoSocial: 'Agropecuária Rio Verde & Grãos S.A.',
    codigoCAR: 'RO-1100015-9981A72819',
    bioma: 'Amazônia',
    embargoIBAMA: true,
    areaHectares: 12450.8,
    polygon: [
      [-63.60, -9.15],
      [-63.54, -9.15],
      [-63.54, -9.22],
      [-63.60, -9.22],
      [-63.60, -9.15],
    ],
  },
  {
    id: 102,
    cnpj: '08.214.990/0002-14',
    razaoSocial: 'Mineração Ouro Velho & Dragagens Ltda.',
    codigoCAR: 'PA-1502400-3329B81023',
    bioma: 'Amazônia / Bacia do Tapajós',
    embargoIBAMA: true,
    areaHectares: 8900.2,
    polygon: [
      [-55.75, -4.80],
      [-55.68, -4.80],
      [-55.68, -4.88],
      [-55.75, -4.88],
      [-55.75, -4.80],
    ],
  },
  {
    id: 103,
    cnpj: '23.409.811/0001-52',
    razaoSocial: 'Madeireira & Exportadora Vale Verde S/A',
    codigoCAR: 'MT-5103403-1120C99451',
    bioma: 'Cerrado / Amazônia de Transição',
    embargoIBAMA: false,
    areaHectares: 6320.0,
    polygon: [
      [-58.45, -11.35],
      [-58.38, -11.35],
      [-58.38, -11.42],
      [-58.45, -11.42],
      [-58.45, -11.35],
    ],
  },
];

export const MOCK_SATELLITE_ALERTS: SatelliteAlert[] = [
  {
    id: 'ALERTA-MB-2026-9042',
    provider: 'MapBiomas Alertas',
    latitude: -9.1823,
    longitude: -63.5829,
    dataDeteccao: '2026-09-28T09:14:00Z',
    areaEstimadaHectares: 84.5,
    indiceNDVIDelta: -0.48, // Queda drástica de verde
    confianca: 96.5,
    bioma: 'Amazônia',
  },
  {
    id: 'ALERTA-S2-2026-1184',
    provider: 'Sentinel-2 L2A',
    latitude: -4.8321,
    longitude: -55.7194,
    dataDeteccao: '2026-09-30T14:22:10Z',
    areaEstimadaHectares: 32.1,
    indiceNDVIDelta: -0.62, // Água turva/rejeito de mineração
    confianca: 94.0,
    bioma: 'Amazônia',
  },
  {
    id: 'ALERTA-DETER-2026-4410',
    provider: 'DETER/INPE',
    latitude: -11.3850,
    longitude: -58.4120,
    dataDeteccao: '2026-10-01T04:12:00Z',
    areaEstimadaHectares: 120.0,
    indiceNDVIDelta: -0.55,
    confianca: 91.8,
    bioma: 'Cerrado',
  },
];

export const INITIAL_REPORTS: MockReport[] = [
  {
    id: 'DEN-2026-8812',
    categoriaId: 1,
    categoriaNome: 'Desmatamento Ilegal de Floresta Primária',
    latitude: -9.1823,
    longitude: -63.5829,
    midiaHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    statusId: 'VALIDADO_COM_EVIDENCIA',
    confiancaSatelite: 96.5,
    sateliteProvider: 'MapBiomas Alertas (Sentinel-2)',
    alertaMapBiomasId: 'ALERTA-MB-2026-9042',
    dataCriacao: '2026-09-29T11:45:00Z',
    descricao: 'Tratores de esteira com correntão derrubando castanheiras centenárias e abrindo picada rumo ao igarapé.',
    empresaAssociada: {
      razaoSocial: 'Agropecuária Rio Verde & Grãos S.A.',
      cnpj: '14.892.341/0001-89',
      codigoCAR: 'RO-1100015-9981A72819',
      tipoSobreposicao: 'CONTIDO_NO_CAR',
    },
  },
  {
    id: 'DEN-2026-8813',
    categoriaId: 4,
    categoriaNome: 'Garimpo Ilegal / Draga Fluvial',
    latitude: -4.8321,
    longitude: -55.7194,
    midiaHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    statusId: 'VALIDADO_COM_EVIDENCIA',
    confiancaSatelite: 94.0,
    sateliteProvider: 'Sentinel-2 L2A Multispectral',
    alertaMapBiomasId: 'ALERTA-S2-2026-1184',
    dataCriacao: '2026-09-30T16:02:00Z',
    descricao: 'Três dragas de sucção operando continuamente no leito do rio, com água barrenta e forte cheiro de combustível.',
    empresaAssociada: {
      razaoSocial: 'Mineração Ouro Velho & Dragagens Ltda.',
      cnpj: '08.214.990/0002-14',
      codigoCAR: 'PA-1502400-3329B81023',
      tipoSobreposicao: 'CONTIDO_NO_CAR',
    },
  },
  {
    id: 'DEN-2026-8814',
    categoriaId: 2,
    categoriaNome: 'Queimada Clandestina / Uso de Fogo Não Autorizado',
    latitude: -11.3850,
    longitude: -58.4120,
    midiaHash: 'cb238edd7d4681648a14b518c7bf9e023b49918b99c7553591f86f788b77a0ba',
    statusId: 'VALIDADO_COM_EVIDENCIA',
    confiancaSatelite: 91.8,
    sateliteProvider: 'DETER/INPE',
    alertaMapBiomasId: 'ALERTA-DETER-2026-4410',
    dataCriacao: '2026-10-01T08:15:30Z',
    descricao: 'Foco de fogo ateado durante a madrugada se alastrando para área de preservação permanente.',
    empresaAssociada: {
      razaoSocial: 'Madeireira & Exportadora Vale Verde S/A',
      cnpj: '23.409.811/0001-52',
      codigoCAR: 'MT-5103403-1120C99451',
      tipoSobreposicao: 'CONTIDO_NO_CAR',
    },
  },
];
