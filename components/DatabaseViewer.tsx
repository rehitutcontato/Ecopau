'use client';

import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  Play, 
  Copy, 
  Check, 
  CheckCircle2, 
  FileCode, 
  ShieldAlert, 
  MapPin, 
  Building2,
  Table,
  Search
} from 'lucide-react';
import { MOCK_CAR_PROPERTIES, INITIAL_REPORTS, MockCARProperty, MockReport } from '@/lib/mockData';
import { CODE_SNIPPETS } from '@/lib/codeSnippets';

export function DatabaseViewer() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'ddl' | 'queries'>('simulator');
  const [selectedReportId, setSelectedReportId] = useState<string>(INITIAL_REPORTS[0].id);
  const [queryMode, setQueryMode] = useState<'st_contains' | 'st_dwithin'>('st_contains');
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);
  const [queryResults, setQueryResults] = useState<any[] | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedReport = INITIAL_REPORTS.find((r) => r.id === selectedReportId) || INITIAL_REPORTS[0];

  const handleCopyCode = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunSpatialQuery = () => {
    setIsExecutingQuery(true);
    setQueryResults(null);

    setTimeout(() => {
      if (queryMode === 'st_contains') {
        // Find property containing the point (ST_Contains simulation)
        // Checking if point falls within bounding box of polygon
        const matches = MOCK_CAR_PROPERTIES.filter((prop) => {
          const lons = prop.polygon.map((p) => p[0]);
          const lats = prop.polygon.map((p) => p[1]);
          const minLon = Math.min(...lons);
          const maxLon = Math.max(...lons);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);

          return (
            selectedReport.longitude >= minLon &&
            selectedReport.longitude <= maxLon &&
            selectedReport.latitude >= minLat &&
            selectedReport.latitude <= maxLat
          );
        });

        if (matches.length > 0) {
          setQueryResults(
            matches.map((m) => ({
              denuncia_id: selectedReport.id,
              data_criacao: selectedReport.dataCriacao,
              crime: selectedReport.categoriaNome,
              confianca_satelite: `${selectedReport.confiancaSatelite}%`,
              empresa_responsavel: m.razaoSocial,
              cnpj_responsavel: m.cnpj,
              codigo_car: m.codigoCAR,
              bioma: m.bioma,
              area_hectares: `${m.areaHectares} ha`,
              embargo_ibama: m.embargoIBAMA ? 'SIM (Reincidente)' : 'NÃO',
              tipo_sobreposicao: 'ST_Contains = TRUE (Ponto 100% dentro do perímetro do CAR)',
            }))
          );
        } else {
          setQueryResults([]);
        }
      } else {
        // ST_DWithin (Buffer 1.000m)
        setQueryResults(
          MOCK_CAR_PROPERTIES.map((m) => ({
            denuncia_id: selectedReport.id,
            empresa_proxima: m.razaoSocial,
            cnpj_responsavel: m.cnpj,
            codigo_car: m.codigoCAR,
            distancia_estimada_metros: m.id === 101 ? '140 m' : '1.250 m',
            intersecao_buffer_1km: m.id === 101 ? 'SIM (Dentro do buffer de 1km)' : 'NÃO',
          }))
        );
      }
      setIsExecutingQuery(false);
    }, 500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            4. Banco de Dados Geoespacial (PostgreSQL & PostGIS)
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Modelagem relacional e espacial com PostGIS 3.4.
            Tabelas fundamentais (<code className="text-emerald-400 font-mono">denuncias</code> e <code className="text-emerald-400 font-mono">empresas_risco</code>), indexação R-Tree (GiST) e consultas analíticas de sobreposição territorial (ST_Contains e ST_DWithin).
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-1 text-xs">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'simulator'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Simulador de Sobreposição (CAR)
            </button>
            <button
              onClick={() => setActiveTab('ddl')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'ddl'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Scripts DDL (Tabelas e Índices)
            </button>
            <button
              onClick={() => setActiveTab('queries')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'queries'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Queries de Auditoria Espacial
            </button>
          </div>
          <button
            onClick={() => handleCopyCode(
              activeTab === 'ddl' ? CODE_SNIPPETS.postgisSqlScripts : CODE_SNIPPETS.spatialQueriesSql
            )}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedCode ? 'Copiado!' : 'Copiar SQL'}
          </button>
        </div>
      </div>

      {activeTab === 'simulator' ? (
        /* Spatial Overlap Simulator */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Control Panel */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                Configurar Consulta de Sobreposição Espacial
              </h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                  Selecione o Ponto de Denúncia (<code className="text-emerald-400 font-mono">denuncias.coordenadas</code>)
                </label>
                <select
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {INITIAL_REPORTS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} - {r.categoriaNome.split('/')[0]} (Lat: {r.latitude}, Lon: {r.longitude})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                  Algoritmo Espacial PostGIS a Executar
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setQueryMode('st_contains')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      queryMode === 'st_contains'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-mono text-emerald-400 font-bold">ST_Contains()</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Contenção estrita dentro do polígono do CAR</div>
                  </button>

                  <button
                    onClick={() => setQueryMode('st_dwithin')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      queryMode === 'st_dwithin'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-mono text-cyan-400 font-bold">ST_DWithin(..., 1000)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Buffer métrico de proximidade (1 km)</div>
                  </button>
                </div>
              </div>

              <button
                onClick={handleRunSpatialQuery}
                disabled={isExecutingQuery}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Executar Cruzamento Espacial com CAR</span>
              </button>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="text-slate-500">{'// Prévia da Query SQL Gerada:'}</div>
                <div className="text-emerald-400 leading-tight">
                  {queryMode === 'st_contains' ? (
                    <>
                      SELECT e.razao_social, e.cnpj_responsavel<br />
                      FROM empresas_risco e<br />
                      JOIN denuncias d ON ST_Contains(e.geometria_propriedade, d.coordenadas)<br />
                      WHERE d.id = &apos;{selectedReport.id}&apos;;
                    </>
                  ) : (
                    <>
                      SELECT e.razao_social, ST_Distance(d.coordenadas::geography, e.geometria_propriedade::geography)<br />
                      FROM empresas_risco e, denuncias d<br />
                      WHERE d.id = &apos;{selectedReport.id}&apos;<br />
                      &nbsp;&nbsp;AND ST_DWithin(d.coordenadas::geography, e.geometria_propriedade::geography, 1000);
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Spatial Map Simulation */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Visualização Geométrica: Perímetro CAR vs. Ponto da Denúncia
                </span>
                <span className="text-[11px] text-slate-400 font-mono">EPSG:4326 (WGS 84)</span>
              </div>

              <div className="relative h-64 bg-slate-900/90 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                {/* SVG Visualizing Polygon and Point */}
                <svg viewBox="0 0 400 240" className="w-full h-full">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* CAR Farm Property Polygon 1 */}
                  <polygon
                    points="70,40 220,50 240,180 80,170"
                    fill="rgba(16, 185, 129, 0.15)"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <text x="85" y="65" fill="#34d399" fontSize="10" fontFamily="monospace">
                    CAR: RO-1100015 (Agropecuária Rio Verde)
                  </text>
                  <text x="85" y="80" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                    Área: 12.450 ha | CNPJ: 14.892.341/0001-89
                  </text>

                  {/* Adjacent Buffer Zone */}
                  <polygon
                    points="50,20 240,30 260,200 60,190"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="1"
                    strokeOpacity="0.3"
                  />

                  {/* Complaint Point Marker */}
                  <circle cx="150" cy="110" r="14" fill="rgba(239, 68, 68, 0.2)" className="animate-ping" />
                  <circle cx="150" cy="110" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="162" y="114" fill="#f87171" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    DEN-8812 (Ponto Infracional ST_Contains = TRUE)
                  </text>

                  {/* Coordinates label */}
                  <text x="162" y="128" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                    Lat: -9.1823 | Lon: -63.5829
                  </text>
                </svg>

                <div className="absolute bottom-2 left-2 bg-slate-900/90 border border-slate-700/80 px-2 py-1 rounded text-[10px] text-slate-300 flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-400 inline-block" />
                    Propriedade Rural (CAR)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    Ponto da Denúncia
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Table */}
          {queryResults && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Resultado da Consulta Espacial PostGIS (JSON / Rowset)
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  {queryResults.length} registro(s) retornado(s) em 1.4ms
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Empresa Responsável</th>
                      <th className="px-4 py-3">CNPJ</th>
                      <th className="px-4 py-3">Código CAR</th>
                      <th className="px-4 py-3">Bioma</th>
                      <th className="px-4 py-3">Embargo IBAMA</th>
                      <th className="px-4 py-3">Diagnóstico Espacial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                    {queryResults.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="px-4 py-3 font-sans font-medium text-white flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                          {row.empresa_responsavel || row.empresa_proxima}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{row.cnpj_responsavel}</td>
                        <td className="px-4 py-3 text-cyan-400">{row.codigo_car}</td>
                        <td className="px-4 py-3 font-sans text-slate-300">{row.bioma || 'Amazônia'}</td>
                        <td className="px-4 py-3 font-sans">
                          {row.embargo_ibama?.includes('SIM') ? (
                            <span className="text-red-400 font-bold flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Sim
                            </span>
                          ) : (
                            <span className="text-slate-400">Não</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-emerald-400 font-sans">
                          {row.tipo_sobreposicao || row.intersecao_buffer_1km}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'ddl' ? (
        /* DDL SQL Scripts */
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-slate-300">database/init_postgis.sql</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono">
                PostgreSQL 16 / PostGIS 3.4
              </span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[680px] leading-relaxed select-text">
              <code>{CODE_SNIPPETS.postgisSqlScripts}</code>
            </pre>
          </div>
        </div>
      ) : (
        /* Spatial Queries */
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-slate-300">database/spatial_queries.sql</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-cyan-400 font-mono">
                ST_Contains, ST_DWithin & Spatial Analytics
              </span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[680px] leading-relaxed select-text">
              <code>{CODE_SNIPPETS.spatialQueriesSql}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
