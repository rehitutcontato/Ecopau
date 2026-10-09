'use client';

import React, { useState } from 'react';
import { 
  Compass, 
  Satellite, 
  Globe2, 
  MapPin, 
  Layers, 
  Activity, 
  ShieldAlert, 
  Building2, 
  Radio, 
  Maximize2,
  TreePine,
  Flame,
  Droplet,
  Mountain
} from 'lucide-react';
import { Globe3DViewer } from './Globe3DViewer';
import { GoogleMapsRadar } from './GoogleMapsRadar';
import { MockReport, MOCK_CAR_PROPERTIES } from '@/lib/mockData';

interface CommandCenterProps {
  reports: MockReport[];
  selectedReport: MockReport;
  onSelectReport: (report: MockReport) => void;
}

export function CommandCenter({ reports, selectedReport, onSelectReport }: CommandCenterProps) {
  const [viewMode, setViewMode] = useState<'both' | 'globe' | 'maps'>('both');

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Centro de Comando Operacional · Monitoramento Planetário & CAR</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Radar Global 3D & Google Maps Satélite com Sobreposição do CAR
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Visão tática integrada. O Globo 3D rastreia a órbita do satélite Copernicus Sentinel-2 sobre o território brasileiro, enquanto o Google Maps renderiza a imagem multiespectral e os polígonos oficiais das propriedades rurais cadastradas no CAR.
          </p>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setViewMode('both')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'both'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Visão Dupla (Globo + Maps)
          </button>
          <button
            onClick={() => setViewMode('globe')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'globe'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Globo 3D Focado
          </button>
          <button
            onClick={() => setViewMode('maps')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'maps'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Google Maps Satélite
          </button>
        </div>
      </div>

      {/* Main Interactive Viewports */}
      <div className="space-y-6">
        {viewMode === 'both' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Globo 3D */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-white flex items-center gap-1.5 font-mono">
                  <Globe2 className="w-4 h-4 text-emerald-400" />
                  Órbita Sentinel-2 (Globo 3D)
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">Three.js WebGL</span>
              </div>
              <Globe3DViewer
                reports={reports}
                selectedReport={selectedReport}
                onSelectReport={onSelectReport}
              />
            </div>

            {/* Google Maps com CAR */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-white flex items-center gap-1.5 font-mono">
                  <Satellite className="w-4 h-4 text-sky-400" />
                  Google Maps Satélite + Polígonos do CAR
                </span>
                <span className="text-sky-400 font-mono text-[11px]">EPSG:4326 / CAR WFS</span>
              </div>
              <GoogleMapsRadar
                reports={reports}
                selectedReport={selectedReport}
                onSelectReport={onSelectReport}
              />
            </div>
          </div>
        ) : viewMode === 'globe' ? (
          <div className="space-y-3">
            <Globe3DViewer
              reports={reports}
              selectedReport={selectedReport}
              onSelectReport={onSelectReport}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <GoogleMapsRadar
              reports={reports}
              selectedReport={selectedReport}
              onSelectReport={onSelectReport}
            />
          </div>
        )}

        {/* Live Crime Hotspot Cards */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Infrações Ativas sob Monitoramento em Tempo Real
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {reports.length} Casos Auditados por Satélite
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reports.map((rep) => {
              const isSelected = selectedReport.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => onSelectReport(rep)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-950 border-emerald-500 shadow-lg shadow-emerald-950'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-emerald-400 font-bold">{rep.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {rep.confiancaSatelite}% Confiança
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">{rep.categoriaNome}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{rep.descricao}</p>

                  {rep.empresaAssociada && (
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono space-y-0.5">
                      <div className="text-slate-300 font-sans font-semibold truncate">
                        {rep.empresaAssociada.razaoSocial}
                      </div>
                      <div className="text-slate-400">CNPJ: {rep.empresaAssociada.cnpj}</div>
                      <div className="text-emerald-400 truncate">CAR: {rep.empresaAssociada.codigoCAR}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
