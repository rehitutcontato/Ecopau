'use client';

import React, { useState } from 'react';
import { 
  Rocket, 
  Terminal, 
  Key, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertTriangle,
  FolderGit2,
  Box,
  FileCode
} from 'lucide-react';
import { CODE_SNIPPETS } from '@/lib/codeSnippets';

interface ApiRequirement {
  name: string;
  provider: string;
  envVar: string;
  purpose: string;
  freeTier: string;
  docUrl: string;
}

const THIRD_PARTY_APIS: ApiRequirement[] = [
  {
    name: 'Mapbox GL / Maps SDK',
    provider: 'Mapbox',
    envVar: 'MAPBOX_PUBLIC_TOKEN',
    purpose: 'Renderização dos mapas vetoriais no app mobile e tiles de relevo e estradas.',
    freeTier: '50.000 requisições de mapa / mês gratuitas',
    docUrl: 'https://account.mapbox.com/',
  },
  {
    name: 'Copernicus Sentinel-2 L2A',
    provider: 'ESA / Sentinel Hub / Planetary Computer',
    envVar: 'SENTINEL_HUB_API_KEY',
    purpose: 'Imagens multiespectrais gratuitas de 10m de resolução para cálculo de perda de vegetação (NDVI/NBR).',
    freeTier: 'Acesso aberto e gratuito via Copernicus Open Access Hub',
    docUrl: 'https://browser.dataspace.copernicus.eu/',
  },
  {
    name: 'MapBiomas Alertas API',
    provider: 'MapBiomas Brasil',
    envVar: 'MAPBIOMAS_ALERTAS_TOKEN',
    purpose: 'Laudos prontos de alertas de desmatamento validados com imagens de alta resolução.',
    freeTier: 'API Pública para projetos socioambientais e pesquisa',
    docUrl: 'https://alerta.mapbiomas.org/',
  },
  {
    name: 'SICAR (Cadastro Ambiental Rural)',
    provider: 'Ministério da Agricultura / SFB',
    envVar: 'SICAR_WFS_ENDPOINT',
    purpose: 'Shapefiles públicos e camadas WFS de perímetros de imóveis rurais no Brasil.',
    freeTier: 'Dados Abertos Governamentais (100% gratuito)',
    docUrl: 'https://www.car.gov.br/publico/imoveis/index',
  },
];

export function DeployGuide() {
  const [activeTab, setActiveTab] = useState<'steps' | 'compose' | 'env'>('steps');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-emerald-400" />
            5. Guia de Implementação e Deploy (DevOps para Dev Júnior)
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Passo a passo descomplicado para rodar a stack completa do EcoRadar localmente em menos de 5 minutos, com Docker Compose, migrations do PostGIS e chaves de APIs externas.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-1 text-xs">
            <button
              onClick={() => setActiveTab('steps')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'steps'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Passo a Passo (CLI)
            </button>
            <button
              onClick={() => setActiveTab('compose')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'compose'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              docker-compose.yml
            </button>
            <button
              onClick={() => setActiveTab('env')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'env'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              .env.example
            </button>
          </div>
          <button
            onClick={() => handleCopy(
              activeTab === 'steps'
                ? CODE_SNIPPETS.deployStepByStep
                : activeTab === 'compose'
                ? CODE_SNIPPETS.dockerCompose
                : CODE_SNIPPETS.envExample
            )}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedCode ? 'Copiado!' : 'Copiar Trecho'}
          </button>
        </div>
      </div>

      {activeTab === 'steps' ? (
        <div className="space-y-6">
          {/* Prerequisites Banner */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-400" />
              Pré-requisitos Mínimos na Máquina de Desenvolvimento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="text-white font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Docker & Docker Compose
                </div>
                <div className="text-slate-400">Versão 24+ com Compose v2 habilitado. Necessário para subir o PostGIS e o MinIO.</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="text-white font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Node.js 20 LTS & npm
                </div>
                <div className="text-slate-400">Ambiente de execução JavaScript/TypeScript para o backend e tooling do app mobile.</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="text-white font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Git & Bash / Zsh
                </div>
                <div className="text-slate-400">Controle de versão e terminal compatível para execução dos scripts de inicialização.</div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Terminal Execution Flow */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Guia Rápido de Comandos para Subir o MVP
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Bash Commands</span>
            </div>

            <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed select-text">
              <code>{CODE_SNIPPETS.deployStepByStep}</code>
            </pre>
          </div>

          {/* Third-Party APIs Matrix */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Principais APIs de Terceiros Necessárias para Conectar
              </h3>
              <span className="text-xs text-slate-400">Credenciais & Tokens</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Serviço / Provedor</th>
                    <th className="px-4 py-3">Variável de Ambiente</th>
                    <th className="px-4 py-3">Objetivo no EcoRadar</th>
                    <th className="px-4 py-3">Política de Acesso Gratuito</th>
                    <th className="px-4 py-3 text-right">Documentação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  {THIRD_PARTY_APIS.map((api, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-white">
                        {api.name}
                        <div className="text-[10px] text-slate-400 font-normal">{api.provider}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-400">{api.envVar}</td>
                      <td className="px-4 py-3 text-slate-300">{api.purpose}</td>
                      <td className="px-4 py-3 text-emerald-400/90">{api.freeTier}</td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={api.docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                        >
                          Acessar <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'compose' ? (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-slate-300">docker-compose.yml</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono">
                PostGIS 16 + Redis + MinIO S3 + Node API
              </span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[680px] leading-relaxed select-text">
              <code>{CODE_SNIPPETS.dockerCompose}</code>
            </pre>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-slate-300">.env.example</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-400 font-mono">
                Template de Variáveis de Ambiente
              </span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[680px] leading-relaxed select-text">
              <code>{CODE_SNIPPETS.envExample}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
