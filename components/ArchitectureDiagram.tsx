'use client';

import React, { useState } from 'react';
import { 
  Smartphone, 
  ShieldCheck, 
  Server, 
  Database, 
  Satellite, 
  HardDrive, 
  Eye, 
  Lock, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Code2,
  Copy,
  Check
} from 'lucide-react';
import { CODE_SNIPPETS } from '@/lib/codeSnippets';

interface ArchitectureNode {
  id: string;
  name: string;
  sub: string;
  category: 'client' | 'gateway' | 'app' | 'data' | 'external';
  tech: string;
  description: string;
  securityFeatures: string[];
  protocol: string;
  icon: any;
}

const NODES: ArchitectureNode[] = [
  {
    id: 'mobile',
    name: 'App Mobile Anônimo',
    sub: 'React Native + TypeScript',
    category: 'client',
    tech: 'React Native, Expo, Mapbox/Leaflet, EXIF Sanitizer',
    description: 'Interface mobile nativa para coleta de denúncias em campo. Opera sem exigência de login, KYC ou cadastro. Toda foto tem seus metadados de GPS, modelo do aparelho e data purgados localmente antes de qualquer transmissão.',
    securityFeatures: [
      'Sem identificadores de usuário (Zero KYC / Zero Account)',
      'Purga de EXIF/GPS/Serial via re-codificação de pixels local',
      'Certificate Pinning e criptografia TLS 1.3 ponta a ponta',
      'Armazenamento efêmero (sem logs de denúncias no dispositivo)',
    ],
    protocol: 'HTTPS / TLS 1.3 (Multipart/Form-Data)',
    icon: Smartphone,
  },
  {
    id: 'gateway',
    name: 'API Gateway & Blindagem',
    sub: 'Reverse Proxy / Nginx / Cloudflare',
    category: 'gateway',
    tech: 'Nginx, ModSecurity WAF, Tor Ingress',
    description: 'Camada de borda responsável por receber o tráfego do aplicativo móvel, mascarar headers de identificação de rede (X-Forwarded-For, IP do cliente) e aplicar Rate Limiting para evitar ataques de saturação.',
    securityFeatures: [
      'Anonimização de IPs de conexão (Drop de X-Forwarded-For)',
      'Rate Limit de 10 req/min por /24 para blindagem contra DoS',
      'WAF para bloqueio de injeções e ataques web comuns',
      'Compatibilidade nativa com roteamento de saída anônima',
    ],
    protocol: 'HTTP/2 & HTTP/3 Reverse Proxy',
    icon: ShieldCheck,
  },
  {
    id: 'backend',
    name: 'Backend REST API',
    sub: 'Node.js 20 LTS + Express',
    category: 'app',
    tech: 'Node.js, Express, TypeScript, Zod, Multer, BullMQ',
    description: 'Serviço central de ingestão e orquestração. Valida os limites geoespaciais, gera a assinatura criptográfica SHA-256 da mídia higienizada, persiste a geometria no PostGIS e enfileira a verificação de satélite no Redis.',
    securityFeatures: [
      'Validação rigorosa de tipos e polígonos com schemas Zod',
      'Processamento de mídia puramente em memória RAM',
      'Hashing SHA-256 para integridade judicial da evidência',
      'Arquitetura desacoplada e assíncrona orientada a jobs',
    ],
    protocol: 'REST JSON / TCP Pool',
    icon: Server,
  },
  {
    id: 'postgis',
    name: 'Banco Geoespacial PostGIS',
    sub: 'PostgreSQL 16 + PostGIS 3.4',
    category: 'data',
    tech: 'PostgreSQL 16, PostGIS, GiST R-Tree Indexing',
    description: 'Cérebro geoespacial do EcoRadar. Armazena as denúncias como pontos geodésicos (SRID 4326) e as fazendas/concessões do CAR como MultiPolígonos. Executa consultas de sobreposição espacial (ST_Contains e ST_DWithin) em milissegundos.',
    securityFeatures: [
      'Índices espaciais GiST para buscas ultra-rápidas em larga escala',
      'Criptografia de dados em repouso (pgcrypto / LUKS)',
      'Isolamento de privilégios de usuário de aplicação (Least Privilege)',
      'Histórico imutável de transações para integridade de relatórios',
    ],
    protocol: 'PostgreSQL Wire Protocol (Port 5432)',
    icon: Database,
  },
  {
    id: 'satellite',
    name: 'Validação Satelital Automática',
    sub: 'Sentinel-2 L2A & MapBiomas Alertas',
    category: 'external',
    tech: 'Copernicus Open Access, MapBiomas WFS, Google Earth Engine',
    description: 'Módulo autônomo que cruza as coordenadas denunciadas com feeds de observação da Terra. Detecta anomalias de desmatamento em um raio de 500m nos últimos 30 dias e calcula o índice delta de NDVI, atestando automaticamente a veracidade.',
    securityFeatures: [
      'Auditoria física objetiva sem interferência humana',
      'Cálculo de índice espectral multiespectral (NDVI / NBR)',
      'Atribuição de score de confiança (ex: 94.8%)',
      'Geração de histórico probatório contra fraudes e falsos positivos',
    ],
    protocol: 'REST APIs & OGC WFS / WMS',
    icon: Satellite,
  },
  {
    id: 'car',
    name: 'Cadastro Ambiental Rural (CAR)',
    sub: 'SICAR / Bases Públicas de CNPJ',
    category: 'external',
    tech: 'SICAR Shapefiles, Receita Federal CNPJ Open Data',
    description: 'Base de dados oficial de limites de propriedades rurais privadas e concessões florestais/minerárias no Brasil. O EcoRadar cruza as coordenadas da denúncia com esta malha vetorial para expor o CNPJ e razão social da empresa infratora.',
    securityFeatures: [
      'Vinculação objetiva do crime ao CNPJ registrado no CAR',
      'Identificação de sobreposições em Terras Indígenas e UCs',
      'Cruzamento com lista de embargos vigentes do IBAMA',
    ],
    protocol: 'GeoPackage / PostGIS Ingestion Pipeline',
    icon: Layers,
  },
  {
    id: 'minio',
    name: 'Object Storage Anônimo',
    sub: 'MinIO / AWS S3 Compatível',
    category: 'data',
    tech: 'MinIO, AWS S3 SDK, Content-Addressed Storage',
    description: 'Repositório de armazenamento distribuído para as fotos sanitizadas. Os arquivos são nomeados e acessados exclusivamente pelo seu hash SHA-256, impedindo a rastreabilidade do remetente.',
    securityFeatures: [
      'Nomenclatura baseada puramente em SHA-256 (CAS)',
      'Buckets com bloqueio de leitura pública irrestrita',
      'Políticas de retenção com immutability (WORM)',
    ],
    protocol: 'S3 API (Port 9000)',
    icon: HardDrive,
  },
];

export function ArchitectureDiagram() {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(NODES[0]);
  const [copied, setCopied] = useState(false);

  const copyArchitecture = () => {
    navigator.clipboard.writeText(CODE_SNIPPETS.architectureOverview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header and Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            1. Arquitetura de Sistema & Stack Tecnológica
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Topologia de alta disponibilidade para crowdsourcing de denúncias ambientais.
            Projetada para garantir anonimato criptográfico na ponta, validação automática por satélite e responsabilização corporativa via PostGIS.
          </p>
        </div>
        <button
          onClick={copyArchitecture}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-lg hover:bg-emerald-900/40 transition-colors w-fit"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado!' : 'Copiar Resumo da Stack'}
        </button>
      </div>

      {/* Visual Data Flow Diagram */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6 flex items-center justify-between">
          <span>Fluxo de Dados Ponta-a-Ponta (Clique em um componente para auditar)</span>
          <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
            <Lock className="w-3 h-3" /> Pipeline Anônimo Ativo
          </span>
        </div>

        {/* Diagram Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Step 1: Client Layer */}
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              01. Ponta Coletora
            </div>
            <button
              onClick={() => setSelectedNode(NODES[0])}
              className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                selectedNode.id === 'mobile'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-sm shadow-emerald-900/30'
                  : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 text-white font-medium text-sm">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>App React Native</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Coleta GPS + Purga local de EXIF/Serial
              </p>
              <div className="mt-2 text-[10px] text-emerald-400/90 font-mono">
                Anonimato Total
              </div>
            </button>
          </div>

          {/* Step 2: Gateway & API */}
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              02. Ingress & Orquestração
            </div>
            <button
              onClick={() => setSelectedNode(NODES[1])}
              className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                selectedNode.id === 'gateway'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-sm shadow-emerald-900/30'
                  : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 text-white font-medium text-sm">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>API Gateway (Nginx)</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Strip de IP / Rate Limiting
              </p>
              <div className="mt-2 text-[10px] text-cyan-400/90 font-mono">
                TLS 1.3 / WAF
              </div>
            </button>

            <button
              onClick={() => setSelectedNode(NODES[2])}
              className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                selectedNode.id === 'backend'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-sm shadow-emerald-900/30'
                  : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 text-white font-medium text-sm">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Node.js / Express API</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Validação de Coordenadas + Hash SHA-256
              </p>
              <div className="mt-2 text-[10px] text-emerald-400/90 font-mono">
                Fila BullMQ / Redis
              </div>
            </button>
          </div>

          {/* Step 3: Spatial Engine & Storage */}
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              03. Persistência Geoespacial
            </div>
            <button
              onClick={() => setSelectedNode(NODES[3])}
              className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                selectedNode.id === 'postgis'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-sm shadow-emerald-900/30'
                  : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 text-white font-medium text-sm">
                <Database className="w-4 h-4 text-purple-400" />
                <span>PostgreSQL + PostGIS</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                GEOMETRY Point SRID 4326 + GiST R-Tree
              </p>
              <div className="mt-2 text-[10px] text-purple-400/90 font-mono">
                ST_Contains / ST_DWithin
              </div>
            </button>

            <button
              onClick={() => setSelectedNode(NODES[6])}
              className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                selectedNode.id === 'minio'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-sm shadow-emerald-900/30'
                  : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 text-white font-medium text-sm">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span>Object Storage S3/MinIO</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Mídia acessada por hash SHA-256
              </p>
              <div className="mt-2 text-[10px] text-amber-400/90 font-mono">
                Content-Addressed
              </div>
            </button>
          </div>

          {/* Step 4: Verification & Accountability */}
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              04. Auditoria & Atribuição
            </div>
            <button
              onClick={() => setSelectedNode(NODES[4])}
              className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                selectedNode.id === 'satellite'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-sm shadow-emerald-900/30'
                  : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 text-white font-medium text-sm">
                <Satellite className="w-4 h-4 text-blue-400" />
                <span>Sentinel-2 & MapBiomas</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Cruzamento de NDVI e alertas de 500m
              </p>
              <div className="mt-2 text-[10px] text-blue-400/90 font-mono">
                Validação Autônoma
              </div>
            </button>

            <button
              onClick={() => setSelectedNode(NODES[5])}
              className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                selectedNode.id === 'car'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-sm shadow-emerald-900/30'
                  : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 text-white font-medium text-sm">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Base CAR / SICAR</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Polígonos de imóveis rurais e CNPJs
              </p>
              <div className="mt-2 text-[10px] text-emerald-400/90 font-mono">
                Responsabilização Legal
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Node Inspector */}
      {selectedNode && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-start justify-between flex-wrap gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/50 rounded-lg text-emerald-400">
                <selectedNode.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  {selectedNode.name}
                  <span className="text-xs font-normal text-slate-400 font-mono">({selectedNode.sub})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  <span className="font-semibold text-slate-300">Stack:</span> {selectedNode.tech}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Protocolo de Comunicação</div>
              <div className="text-xs font-mono text-emerald-400">{selectedNode.protocol}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-300 tracking-wider mb-2">
                Função no Sistema EcoRadar
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-300 tracking-wider mb-2">
                Garantias de Segurança, Anonimato & Confiabilidade
              </h4>
              <ul className="space-y-1.5">
                {selectedNode.securityFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Stack Comparison Matrix */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Matriz de Decisão Arquitetural: Escolhas Técnicas do MVP
          </h3>
          <span className="text-xs text-slate-400">Padrões de Produção</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Camada</th>
                <th className="px-4 py-3">Tecnologia Escolhida</th>
                <th className="px-4 py-3">Alternativas Avaliadas</th>
                <th className="px-4 py-3">Justificativa de Engenharia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="hover:bg-slate-800/30">
                <td className="px-4 py-3 font-sans font-medium text-white">Frontend Mobile</td>
                <td className="px-4 py-3 text-emerald-400">React Native + TypeScript</td>
                <td className="px-4 py-3 text-slate-400">Flutter / Swift+Kotlin</td>
                <td className="px-4 py-3 font-sans text-slate-300">Base de código única para iOS/Android, facilidade de manipulação de buffers para remoção de EXIF e maturidade de bibliotecas de mapa (Mapbox/Leaflet).</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="px-4 py-3 font-sans font-medium text-white">Banco Geoespacial</td>
                <td className="px-4 py-3 text-emerald-400">PostgreSQL 16 + PostGIS 3.4</td>
                <td className="px-4 py-3 text-slate-400">MongoDB Geospatial / MySQL</td>
                <td className="px-4 py-3 font-sans text-slate-300">PostGIS é o padrão ouro da indústria GIS. Suporta indexação R-Tree GiST, projeção WGS84, funções robustas como ST_Contains, ST_DWithin e cálculo métrico em geography.</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="px-4 py-3 font-sans font-medium text-white">Backend REST API</td>
                <td className="px-4 py-3 text-emerald-400">Node.js (Express) + TypeScript</td>
                <td className="px-4 py-3 text-slate-400">Python (FastAPI) / Go</td>
                <td className="px-4 py-3 font-sans text-slate-300">Alta velocidade de I/O assíncrono para ingestão de uploads multipart, ecossistema unificado TypeScript com o app mobile e integração com filas BullMQ.</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="px-4 py-3 font-sans font-medium text-white">Verificação de Satélite</td>
                <td className="px-4 py-3 text-emerald-400">Sentinel-2 L2A + MapBiomas</td>
                <td className="px-4 py-3 text-slate-400">Landsat 8/9 / PlanetScope</td>
                <td className="px-4 py-3 font-sans text-slate-300">Sentinel-2 oferece resolução de 10m gratuita e revisita a cada 5 dias. MapBiomas disponibiliza alertas validados por laudos de satélite com polígonos prontos.</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="px-4 py-3 font-sans font-medium text-white">Armazenamento de Mídia</td>
                <td className="px-4 py-3 text-emerald-400">MinIO (Local) / AWS S3</td>
                <td className="px-4 py-3 text-slate-400">Disco local da VM / GridFS</td>
                <td className="px-4 py-3 font-sans text-slate-300">Compatibilidade com protocolo S3, escalabilidade horizontal, indexação desacoplada por chave SHA-256 e suporte a políticas de imutabilidade (WORM).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
