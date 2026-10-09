'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { CODE_SNIPPETS } from '@/lib/codeSnippets';

export function TechDocViewer() {
  const [copied, setCopied] = useState(false);

  const fullMarkdownDoc = `# DOCUMENTO DE ARQUITETURA TÉCNICA: ECORADAR (MVP)
Plataforma Crowdsourced e Georreferenciada para Denúncia de Crimes Ambientais Corporativos

---

## 1. ARQUITETURA DE SISTEMA (DIAGRAMA E STACK TECNOLÓGICA)

### 1.1 Stack Recomendada para o MVP
- **Frontend Mobile:** React Native (TypeScript) com Leaflet/Mapbox via WebView ou Mapbox GL Native.
- **Camada de Borda & Anonimização:** Reverse Proxy Nginx com remoção mandatória de cabeçalhos de identificação de rede (\`X-Forwarded-For\`, IP cliente mascarado) e rate limiting por subnet.
- **Backend API:** Node.js 20 LTS com Express / TypeScript.
- **Banco de Dados Geoespacial:** PostgreSQL 16 com extensão PostGIS 3.4 (Índices GiST R-Tree sobre projeção EPSG:4326).
- **Fila Assíncrona:** BullMQ com Redis 7 para processamento de satélite sem bloquear o usuário.
- **Object Storage:** MinIO / AWS S3 para evidências fotográficas identificadas exclusivamente pelo hash SHA-256.
- **APIs Externas:** Copernicus Sentinel-2 L2A (ESA), MapBiomas Alertas API (WFS/REST) e SICAR (Cadastro Ambiental Rural).

### 1.2 Diagrama de Alto Nível e Fluxo de Dados
\`\`\`
[ Whistleblower / App Mobile ]
       |  (1. Re-renderiza pixels localmente, expurga tags EXIF/GPS, gera SHA-256)
       v
[ API Gateway / Nginx Reverse Proxy ]
       |  (2. Descarta X-Forwarded-For, aplica Rate Limiting, terminação TLS 1.3)
       v
[ Backend REST API - Node.js Express ]
       |  (3. Valida coordenadas WGS84, valida hash da mídia)
       +---> [ PostgreSQL 16 + PostGIS 3.4 ] (4. INSERT com ST_SetSRID(ST_MakePoint, 4326))
       |
       +---> [ MinIO / S3 Storage ] (5. Upload com chave = midia_hash)
       |
       +---> [ Redis / BullMQ Queue ] (6. Enfileira job assíncrono de satélite)
                   |
                   v
       [ Satellite Verification Worker ]
             |  (7. Consulta Sentinel-2 L2A / MapBiomas em buffer de 500m)
             |  (8. Se delta NDVI < -30% -> Marca como VALIDADO_COM_EVIDENCIA)
             v
       [ PostGIS Spatial Overlap Engine ]
             |  (9. Executa ST_Contains(e.geometria_propriedade, d.coordenadas) no CAR)
             v
       [ Identificação do CNPJ / Empresa Responsável ]
\`\`\`

---

## 2. FRONTEND MOBILE (REACT NATIVE & HIGIENIZAÇÃO DE EXIF)

### 2.1 Código Essencial: NovaDenunciaScreen.tsx
\`\`\`tsx
${CODE_SNIPPETS.reactNativeNovaDenuncia}
\`\`\`

### 2.2 Algoritmo de Purga de Metadados: exifSanitizer.ts
\`\`\`typescript
${CODE_SNIPPETS.reactNativeExifSanitizer}
\`\`\`

---

## 3. BACKEND API (ROTAS, VALIDAÇÃO & SATÉLITE)

### 3.1 Servidor e Rotas REST: server.ts
\`\`\`typescript
${CODE_SNIPPETS.backendApiExpress}
\`\`\`

### 3.2 Validação Geoespacial com Satélite: satelliteValidationService.ts
\`\`\`typescript
${CODE_SNIPPETS.satelliteValidationService}
\`\`\`

---

## 4. BANCO DE DADOS GEOESPACIAL (POSTGRESQL + POSTGIS)

### 4.1 Criação de Tabelas e Índices Espaciais
\`\`\`sql
${CODE_SNIPPETS.postgisSqlScripts}
\`\`\`

### 4.2 Consultas de Sobreposição Territorial (CAR vs. Denúncia)
\`\`\`sql
${CODE_SNIPPETS.spatialQueriesSql}
\`\`\`

---

## 5. GUIA DE IMPLEMENTAÇÃO E DEPLOY (DEVOPS)

### 5.1 docker-compose.yml
\`\`\`yaml
${CODE_SNIPPETS.dockerCompose}
\`\`\`

### 5.2 Variáveis de Ambiente (.env.example)
\`\`\`bash
${CODE_SNIPPETS.envExample}
\`\`\`

### 5.3 Comandos de Inicialização (Bash)
\`\`\`bash
${CODE_SNIPPETS.deployStepByStep}
\`\`\`
`;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(fullMarkdownDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([fullMarkdownDoc], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'EcoRadar-Arquitetura-Tecnica-MVP.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            6. Documento Técnico Completo (Especificação de Engenharia)
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Visão consolidada de engenharia pronta para compartilhamento com a equipe de desenvolvimento, investidores e órgãos de auditoria ambiental.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Markdown Copiado!' : 'Copiar Markdown'}
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Arquivo .MD</span>
          </button>
        </div>
      </div>

      {/* Document Reader Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-8 max-w-5xl mx-auto space-y-8 text-slate-300 leading-relaxed text-sm">
        {/* Title Block */}
        <div className="border-b border-slate-800 pb-6">
          <div className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider mb-1">
            Engenharia de Software & Arquitetura Cloud
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            EcoRadar: Plataforma Crowdsourced & Georreferenciada de Denúncias Ambientais Corporativas
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Versão do Documento: 1.0 (MVP) · Classificação: Pública / Open Architecture · Projeção Geodésica: EPSG:4326 (WGS 84)
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-white border-l-2 border-emerald-500 pl-3">
            1. Arquitetura de Sistema & Stack Tecnológica
          </h2>
          <p>
            O EcoRadar foi concebido para resolver o gargalo de subnotificação e impunidade em crimes ambientais corporativos no Brasil (como desmatamento na Amazônia, queimadas ilegais no Cerrado e contaminação por garimpo). O sistema atua com três pilares inegociáveis:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
            <li><strong>Anonimato Criptográfico da Ponta:</strong> O denunciante nunca fornece login, número de telefone ou KYC. Todo metadado de hardware (EXIF) é destruído localmente.</li>
            <li><strong>Validação Autônoma por Satélite:</strong> O backend não depende de triagem humana inicial; cruza o ponto com imagens de 10m do Sentinel-2 e alertas do MapBiomas.</li>
            <li><strong>Responsabilização Legal Direta:</strong> PostGIS cruza o ponto denunciado com polígonos públicos do CAR (Cadastro Ambiental Rural) para apontar o CNPJ responsável.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-white border-l-2 border-emerald-500 pl-3">
            2. Frontend Mobile (React Native Mock)
          </h2>
          <p>
            A tela de Nova Denúncia foi desenvolvida com React Native e TypeScript. A higienização de imagens é realizada através de recompressão direta de pixels, descartando todos os blocos binários EXIF, IPTC e marcadores de GPS.
          </p>
          <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800">
            <code>{CODE_SNIPPETS.reactNativeExifSanitizer}</code>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-white border-l-2 border-emerald-500 pl-3">
            3. Backend REST API & Motor Satelital
          </h2>
          <p>
            O servidor Node.js Express expõe endpoints de ingestão (<code className="text-emerald-400 font-mono">POST /api/denuncias</code>) e mapa público GeoJSON (<code className="text-emerald-400 font-mono">GET /api/mapa/denuncias</code>). O job assíncrono executa a verificação física com índices espectrais de satélite.
          </p>
          <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800">
            <code>{CODE_SNIPPETS.backendApiExpress}</code>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-white border-l-2 border-emerald-500 pl-3">
            4. Banco de Dados Geoespacial PostGIS
          </h2>
          <p>
            Estrutura SQL contendo a tabela de denúncias e propriedades de risco com polígonos do CAR. Demonstração de queries com <code className="text-emerald-400 font-mono">ST_Contains</code> e <code className="text-cyan-400 font-mono">ST_DWithin</code>.
          </p>
          <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800">
            <code>{CODE_SNIPPETS.spatialQueriesSql}</code>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-white border-l-2 border-emerald-500 pl-3">
            5. Guia de Implementação e Deploy
          </h2>
          <p>
            Arquitetura pronta para orquestração em containers Docker com inicialização em menos de 5 minutos para novos desenvolvedores.
          </p>
          <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800">
            <code>{CODE_SNIPPETS.dockerCompose}</code>
          </div>
        </section>
      </div>
    </div>
  );
}
