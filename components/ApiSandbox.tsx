'use client';

import React, { useState } from 'react';
import { 
  Server, 
  Send, 
  Play, 
  Satellite, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  Layers, 
  FileCode,
  ArrowRight,
  Terminal,
  Activity
} from 'lucide-react';
import { INITIAL_REPORTS, MockReport } from '@/lib/mockData';
import { CODE_SNIPPETS } from '@/lib/codeSnippets';

interface ExecutionStep {
  time: string;
  stage: string;
  message: string;
  status: 'info' | 'success' | 'warn';
}

export function ApiSandbox({ 
  reports = INITIAL_REPORTS,
  onAddNewReport 
}: { 
  reports?: MockReport[];
  onAddNewReport?: (report: MockReport) => void;
}) {
  const [activeTab, setActiveTab] = useState<'tester' | 'routes' | 'satellite'>('tester');
  const [activeCodeFile, setActiveCodeFile] = useState<'server' | 'satellite'>('server');
  const [copiedCode, setCopiedCode] = useState(false);

  // Form states for POST /api/denuncias
  const [testLat, setTestLat] = useState(-9.1823);
  const [testLon, setTestLon] = useState(-63.5829);
  const [testCategoriaId, setTestCategoriaId] = useState(1);
  const [testDescricao, setTestDescricao] = useState('Desmatamento ativo detectado com motosserras em reserva biológica.');
  
  // Execution Simulation States
  const [isExecutingPost, setIsExecutingPost] = useState(false);
  const [postResponse, setPostResponse] = useState<any | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionStep[]>([]);
  
  // States for GET /api/mapa/denuncias
  const [isExecutingGet, setIsExecutingGet] = useState(false);
  const [bboxInput, setBboxInput] = useState('-65.0,-12.0,-55.0,-4.0');
  const [geoJsonResponse, setGeoJsonResponse] = useState<any | null>(null);

  const handleCopyCode = () => {
    const code = activeCodeFile === 'server'
      ? CODE_SNIPPETS.backendApiExpress
      : CODE_SNIPPETS.satelliteValidationService;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExecutePost = () => {
    setIsExecutingPost(true);
    setPostResponse(null);
    setExecutionLogs([]);

    const timestamp = () => new Date().toLocaleTimeString('pt-BR');

    // Simulate real-time API pipeline execution
    const steps: ExecutionStep[] = [
      {
        time: timestamp(),
        stage: 'INGRESS / WAF',
        message: 'Recebida requisição POST /api/denuncias. Header X-Forwarded-For descartado para anonimato.',
        status: 'info',
      },
    ];
    setExecutionLogs([...steps]);

    setTimeout(() => {
      steps.push({
        time: timestamp(),
        stage: 'GEO-VALIDAÇÃO',
        message: `Coordenadas validadas: [Lat: ${testLat}, Lon: ${testLon}]. Projeção WGS84 válida.`,
        status: 'info',
      });
      setExecutionLogs([...steps]);
    }, 400);

    setTimeout(() => {
      const generatedId = `DEN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const mockHash = 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592';

      steps.push({
        time: timestamp(),
        stage: 'POSTGIS SQL',
        message: `INSERT INTO denuncias (coordenadas, ...) VALUES (ST_SetSRID(ST_MakePoint(${testLon}, ${testLat}), 4326)). ID: ${generatedId}`,
        status: 'success',
      });
      setExecutionLogs([...steps]);

      steps.push({
        time: timestamp(),
        stage: 'REDIS / BULLMQ',
        message: `Job satellite-validation-${generatedId} enfileirado na fila de background.`,
        status: 'info',
      });
      setExecutionLogs([...steps]);

      const initialResp = {
        statusCode: 201,
        body: {
          success: true,
          message: 'Denúncia registrada e enfileirada para análise satelital.',
          denunciaId: generatedId,
          coordenadas: { latitude: testLat, longitude: testLon },
          status: 'RECEBIDO_EM_ANALISE_SATELITAL',
          midiaHash: mockHash,
        },
      };
      setPostResponse(initialResp);

      // Trigger Satellite Cross-Validation Worker simulation
      setTimeout(() => {
        steps.push({
          time: timestamp(),
          stage: 'SATELLITE WORKER',
          message: `Consultando Copernicus Sentinel-2 L2A & MapBiomas Alertas API (Buffer 500m)...`,
          status: 'info',
        });
        setExecutionLogs([...steps]);
      }, 1000);

      setTimeout(() => {
        const ndviDelta = -0.48;
        const confidence = 96.5;
        const alertId = `MB-ALERTA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        steps.push({
          time: timestamp(),
          stage: 'EVIDÊNCIA FÍSICA',
          message: `Alerta detectado! Delta NDVI: ${ndviDelta} (perda drástica de biomassa). Confiança: ${confidence}%. Alerta: ${alertId}`,
          status: 'success',
        });

        steps.push({
          time: timestamp(),
          stage: 'POSTGIS UPDATE',
          message: `UPDATE denuncias SET status_id = 2 (VALIDADO_COM_EVIDENCIA), confianca_satelite = ${confidence} WHERE id = '${generatedId}'`,
          status: 'success',
        });
        setExecutionLogs([...steps]);
        setIsExecutingPost(false);

        // Add to reports if callback provided
        if (onAddNewReport) {
          onAddNewReport({
            id: generatedId,
            categoriaId: testCategoriaId,
            categoriaNome: testCategoriaId === 1 ? 'Desmatamento Ilegal' : 'Crime Ambiental',
            latitude: testLat,
            longitude: testLon,
            midiaHash: mockHash,
            statusId: 'VALIDADO_COM_EVIDENCIA',
            confiancaSatelite: confidence,
            sateliteProvider: 'MapBiomas Alertas (Sentinel-2)',
            alertaMapBiomasId: alertId,
            dataCriacao: new Date().toISOString(),
            descricao: testDescricao,
            empresaAssociada: {
              razaoSocial: 'Agropecuária Rio Verde & Grãos S.A.',
              cnpj: '14.892.341/0001-89',
              codigoCAR: 'RO-1100015-9981A72819',
              tipoSobreposicao: 'CONTIDO_NO_CAR',
            },
          });
        }
      }, 2200);
    }, 900);
  };

  const handleExecuteGetMap = () => {
    setIsExecutingGet(true);
    setTimeout(() => {
      // Build GeoJSON FeatureCollection from existing reports
      const geojson = {
        type: 'FeatureCollection',
        bbox: bboxInput.split(',').map(Number),
        totalFeatures: reports.length,
        features: reports.map((r) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [r.longitude, r.latitude],
          },
          properties: {
            id: r.id,
            categoria: r.categoriaNome,
            status: r.statusId,
            confiancaSatelite: r.confiancaSatelite,
            alertaMapBiomasId: r.alertaMapBiomasId,
            empresaResponsavel: r.empresaAssociada ? {
              razaoSocial: r.empresaAssociada.razaoSocial,
              cnpj: r.empresaAssociada.cnpj,
              codigoCAR: r.empresaAssociada.codigoCAR,
            } : null,
            dataCriacao: r.dataCriacao,
          },
        })),
      };

      setGeoJsonResponse(geojson);
      setIsExecutingGet(false);
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            3. Backend API (Rotas, Validação & Motor de Satélite)
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Implementação da API REST em Node.js (Express) com suporte a PostGIS, validação de limites geoespaciais e cruzamento automatizado com APIs de satélite (Sentinel-2 e MapBiomas).
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-1 text-xs">
            <button
              onClick={() => setActiveTab('tester')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'tester'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Test Bench Interativo
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'routes'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Código das Rotas (server.ts)
            </button>
            <button
              onClick={() => setActiveTab('satellite')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'satellite'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Serviço Satelital (Worker)
            </button>
          </div>
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedCode ? 'Copiado!' : 'Copiar Código'}
          </button>
        </div>
      </div>

      {activeTab === 'tester' ? (
        /* Live API Test Bench */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: API Request Forms */}
          <div className="lg:col-span-6 space-y-6">
            {/* 1. Endpoint POST /api/denuncias */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                    POST
                  </span>
                  <span className="text-sm font-bold text-white font-mono">/api/denuncias</span>
                </div>
                <span className="text-[11px] text-slate-400">Ingestão Anônima</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-mono">latitude (Float)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={testLat}
                    onChange={(e) => setTestLat(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-mono">longitude (Float)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={testLon}
                    onChange={(e) => setTestLon(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-mono">categoria_id (Integer)</label>
                <select
                  value={testCategoriaId}
                  onChange={(e) => setTestCategoriaId(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value={1}>1 - Desmatamento Ilegal</option>
                  <option value={2}>2 - Queimada Clandestina</option>
                  <option value={3}>3 - Contaminação Hídrica</option>
                  <option value={4}>4 - Garimpo Ilegal</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-mono">descricao (String)</label>
                <input
                  type="text"
                  value={testDescricao}
                  onChange={(e) => setTestDescricao(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleExecutePost}
                disabled={isExecutingPost}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isExecutingPost ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processando Ingestão & Satélite...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Disparar Chamada POST /api/denuncias</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Endpoint GET /api/mapa/denuncias */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-blue-950 text-blue-400 border border-blue-800/80">
                    GET
                  </span>
                  <span className="text-sm font-bold text-white font-mono">/api/mapa/denuncias</span>
                </div>
                <span className="text-[11px] text-slate-400">GeoJSON FeatureCollection</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-mono">
                  Parâmetro: ?bbox=minLon,minLat,maxLon,maxLat
                </label>
                <input
                  type="text"
                  value={bboxInput}
                  onChange={(e) => setBboxInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleExecuteGetMap}
                disabled={isExecutingGet}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isExecutingGet ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executando Consulta PostGIS...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Consultar Denúncias em GeoJSON</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Terminal Output & Response Payloads */}
          <div className="lg:col-span-6 space-y-6">
            {/* Live Terminal Execution Steps */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Console de Execução do Backend & Worker de Satélite
                </span>
                <span className="text-[10px] text-slate-500 font-mono">STDOUT / Winston Logs</span>
              </div>

              <div className="p-4 space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
                {executionLogs.length === 0 ? (
                  <div className="text-slate-600 py-6 text-center text-xs">
                    Nenhuma requisição disparada ainda. Clique no botão de chamada POST acima para acompanhar o pipeline.
                  </div>
                ) : (
                  executionLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] leading-tight">
                      <span className="text-slate-600 shrink-0">[{log.time}]</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] shrink-0 font-bold ${
                        log.status === 'success' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {log.stage}
                      </span>
                      <span className={log.status === 'success' ? 'text-emerald-300' : 'text-slate-300'}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* HTTP Response Inspector */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Payload de Resposta HTTP
                </span>
                <span className="text-[10px] text-slate-500 font-mono">application/json</span>
              </div>

              <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-72 leading-relaxed bg-slate-950">
                <code>
                  {geoJsonResponse
                    ? JSON.stringify(geoJsonResponse, null, 2)
                    : postResponse
                    ? JSON.stringify(postResponse, null, 2)
                    : `// As respostas das requisições POST ou GET serão impressas aqui em tempo real...`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      ) : activeTab === 'routes' ? (
        /* Code: server.ts */
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-slate-300">backend/server.ts & routes/denuncias.ts</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono">
                Node.js 20 / Express / TypeScript
              </span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[680px] leading-relaxed select-text">
              <code>{CODE_SNIPPETS.backendApiExpress}</code>
            </pre>
          </div>
        </div>
      ) : (
        /* Code: satelliteValidationService.ts */
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-slate-300">backend/services/satelliteValidationService.ts</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-blue-400 font-mono">
                Sentinel-2 & MapBiomas Integration Worker
              </span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[680px] leading-relaxed select-text">
              <code>{CODE_SNIPPETS.satelliteValidationService}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
