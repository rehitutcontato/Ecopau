'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  Smartphone, 
  Server, 
  Database, 
  Rocket, 
  FileText, 
  ShieldCheck, 
  MapPin, 
  Satellite, 
  ExternalLink,
  ChevronRight,
  Terminal,
  Activity,
  Trees,
  CheckCircle2,
  Lock,
  Copy,
  Check
} from 'lucide-react';
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram';
import { MobileSimulator } from '@/components/MobileSimulator';
import { ApiSandbox } from '@/components/ApiSandbox';
import { DatabaseViewer } from '@/components/DatabaseViewer';
import { DeployGuide } from '@/components/DeployGuide';
import { TechDocViewer } from '@/components/TechDocViewer';
import { INITIAL_REPORTS, MockReport } from '@/lib/mockData';
import { CODE_SNIPPETS } from '@/lib/codeSnippets';

type ActiveModule = 'arquitetura' | 'mobile' | 'api' | 'database' | 'deploy' | 'doc';

export default function HomePage() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('arquitetura');
  const [reportsList, setReportsList] = useState<MockReport[]>(INITIAL_REPORTS);
  const [copiedQuick, setCopiedQuick] = useState(false);

  const handleAddNewReport = (newReport: any) => {
    setReportsList((prev) => [newReport, ...prev]);
  };

  const handleCopySpecSummary = () => {
    navigator.clipboard.writeText(CODE_SNIPPETS.architectureOverview);
    setCopiedQuick(true);
    setTimeout(() => setCopiedQuick(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. TOP BAR CONTRACT: Single text brand + 4-6 text links + 1-2 primary actions */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/40">
              <Trees className="w-4 h-4" />
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setActiveModule('arquitetura'); }}
              className="text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors"
            >
              EcoRadar
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <button
              onClick={() => setActiveModule('arquitetura')}
              className={`transition-colors hover:text-white ${activeModule === 'arquitetura' ? 'text-emerald-400 font-semibold' : ''}`}
            >
              1. Arquitetura Cloud
            </button>
            <button
              onClick={() => setActiveModule('mobile')}
              className={`transition-colors hover:text-white ${activeModule === 'mobile' ? 'text-emerald-400 font-semibold' : ''}`}
            >
              2. App Mobile (React Native)
            </button>
            <button
              onClick={() => setActiveModule('api')}
              className={`transition-colors hover:text-white ${activeModule === 'api' ? 'text-emerald-400 font-semibold' : ''}`}
            >
              3. API REST & Satélite
            </button>
            <button
              onClick={() => setActiveModule('database')}
              className={`transition-colors hover:text-white ${activeModule === 'database' ? 'text-emerald-400 font-semibold' : ''}`}
            >
              4. PostGIS & CAR
            </button>
            <button
              onClick={() => setActiveModule('deploy')}
              className={`transition-colors hover:text-white ${activeModule === 'deploy' ? 'text-emerald-400 font-semibold' : ''}`}
            >
              5. Guia de Deploy
            </button>
            <button
              onClick={() => setActiveModule('doc')}
              className={`transition-colors hover:text-white ${activeModule === 'doc' ? 'text-emerald-400 font-semibold' : ''}`}
            >
              6. Especificação Completa
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopySpecSummary}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {copiedQuick ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedQuick ? 'Copiado!' : 'Copiar Stack'}</span>
            </button>

            <button
              onClick={() => setActiveModule('mobile')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors shadow-sm shadow-emerald-950 flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Testar Simulador</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/70 to-slate-950 border border-slate-800 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Arquitetura de Solução Cloud · MVP 1.0</span>
              <span aria-hidden="true">·</span>
              <span>Engenharia de Software Sênior</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-balance leading-tight">
              EcoRadar: Plataforma Georreferenciada para Denúncia de Crimes Ambientais Corporativos
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed text-balance">
              Especificação técnica completa e bancada interativa de execução de mocks. Desenvolvida para unir <strong>anonimato criptográfico na ponta</strong> (expurgo de EXIF/GPS), <strong>validação autônoma via satélite</strong> (Sentinel-2 e MapBiomas) e <strong>responsabilização territorial</strong> através de sobreposição vetorial PostGIS com a malha do CAR.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero-KYC / Purgador Local de EXIF</span>
              </div>
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-blue-400" />
                <span>Sentinel-2 L2A & MapBiomas (500m Buffer)</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                <span>PostgreSQL 16 + PostGIS 3.4 (SRID 4326)</span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Docker Compose Ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Segmented Module Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveModule('arquitetura')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeModule === 'arquitetura'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Arquitetura de Sistema</span>
          </button>

          <button
            onClick={() => setActiveModule('mobile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeModule === 'mobile'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>2. Frontend Mobile (React Native)</span>
          </button>

          <button
            onClick={() => setActiveModule('api')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeModule === 'api'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>3. Backend API & Satélite</span>
          </button>

          <button
            onClick={() => setActiveModule('database')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeModule === 'database'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>4. Banco Geoespacial (PostGIS)</span>
          </button>

          <button
            onClick={() => setActiveModule('deploy')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeModule === 'deploy'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>5. Guia de Deploy & DevOps</span>
          </button>

          <button
            onClick={() => setActiveModule('doc')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeModule === 'doc'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>6. Documento Técnico Consolidado</span>
          </button>
        </div>

        {/* Dynamic Module Content Viewport */}
        <div className="pt-2">
          {activeModule === 'arquitetura' && <ArchitectureDiagram />}
          {activeModule === 'mobile' && <MobileSimulator onReportCreated={handleAddNewReport} />}
          {activeModule === 'api' && <ApiSandbox reports={reportsList} onAddNewReport={handleAddNewReport} />}
          {activeModule === 'database' && <DatabaseViewer />}
          {activeModule === 'deploy' && <DeployGuide />}
          {activeModule === 'doc' && <TechDocViewer />}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 px-6 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">EcoRadar Architecture Blueprint</span>
            <span>·</span>
            <span>Projetado para denúncia anônima e responsabilização de crimes socioambientais corporativos</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-emerald-400">PostGIS 3.4 · Sentinel-2 · MapBiomas Alertas · SICAR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
