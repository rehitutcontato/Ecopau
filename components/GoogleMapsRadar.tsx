'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { 
  MapPin, 
  Layers, 
  Satellite, 
  ShieldAlert, 
  CheckCircle2, 
  Building2, 
  RefreshCw, 
  Maximize2, 
  Filter,
  Eye,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { MockReport, MOCK_CAR_PROPERTIES, MockCARProperty } from '@/lib/mockData';

// Chave fornecida pelo usuário na interface do Google Maps
const GOOGLE_MAPS_API_KEY = 
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyC8f__Zls2nKchPP4qQP7rTdMKY8gvFQRQ';

interface GoogleMapsRadarProps {
  reports: MockReport[];
  selectedReport: MockReport | null;
  onSelectReport: (report: MockReport) => void;
}

export function GoogleMapsRadar({
  reports,
  selectedReport,
  onSelectReport,
}: GoogleMapsRadarProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'satellite' | 'hybrid' | 'terrain'>('satellite');
  const [showCARPolygons, setShowCARPolygons] = useState(true);
  const [filterCategory, setFilterCategory] = useState<number | 'all'>('all');
  const [isScanning, setIsScanning] = useState(false);

  // Inicializa a API do Google Maps
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        setOptions({
          key: GOOGLE_MAPS_API_KEY,
          v: 'weekly',
          solutionChannel: 'gmp_mcp_codeassist_v1_aistudio',
        });

        const { Map, InfoWindow } = await importLibrary('maps');
        if (!isMounted || !mapElementRef.current) return;

        // Centro inicial: Rondônia / Amazônia
        const initialCenter = {
          lat: -9.1823,
          lng: -63.5829,
        };

        const map = new Map(mapElementRef.current, {
          center: initialCenter,
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new InfoWindow();
        setMapLoaded(true);
      } catch (err: any) {
        console.error('Erro ao carregar Google Maps:', err);
        if (isMounted) {
          setMapError(err?.message || 'Falha ao inicializar o mapa');
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // Atualiza polígonos do CAR (Cadastro Ambiental Rural)
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Limpa polígonos anteriores
    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];

    if (!showCARPolygons) return;

    MOCK_CAR_PROPERTIES.forEach((carProp) => {
      const coords = carProp.polygon.map((p) => ({
        lat: p[1],
        lng: p[0],
      }));

      const polygon = new google.maps.Polygon({
        paths: coords,
        strokeColor: carProp.embargoIBAMA ? '#ef4444' : '#10b981',
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: carProp.embargoIBAMA ? '#ef4444' : '#10b981',
        fillOpacity: 0.18,
        map: mapInstanceRef.current,
      });

      polygon.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!infoWindowRef.current || !e.latLng) return;
        const contentString = `
          <div style="color: #0f172a; font-family: sans-serif; padding: 6px; max-width: 260px;">
            <div style="font-size: 11px; font-weight: bold; color: #059669; text-transform: uppercase;">Cadastro Ambiental Rural (CAR)</div>
            <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${carProp.razaoSocial}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">CNPJ: <b>${carProp.cnpj}</b></div>
            <div style="font-size: 11px; color: #64748b;">Código: <code style="color: #0284c7;">${carProp.codigoCAR}</code></div>
            <div style="font-size: 11px; margin-top: 4px;">Área: <b>${carProp.areaHectares} ha</b> (${carProp.bioma})</div>
            ${carProp.embargoIBAMA ? '<div style="margin-top: 6px; font-size: 11px; color: #dc2626; font-weight: bold;">⚠️ EMBARGO ATIVO NO IBAMA</div>' : ''}
          </div>
        `;
        infoWindowRef.current.setContent(contentString);
        infoWindowRef.current.setPosition(e.latLng);
        infoWindowRef.current.open(mapInstanceRef.current);
      });

      polygonsRef.current.push(polygon);
    });
  }, [showCARPolygons, mapLoaded]);

  // Atualiza Marcadores de Crimes no Mapa
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const filteredReports = reports.filter((r) => 
      filterCategory === 'all' ? true : r.categoriaId === filterCategory
    );

    filteredReports.forEach((rep) => {
      const isSelected = selectedReport?.id === rep.id;
      const isCritical = rep.categoriaId === 1 || rep.categoriaId === 4;

      // Pin SVG customizado
      const marker = new google.maps.Marker({
        position: { lat: rep.latitude, lng: rep.longitude },
        map: mapInstanceRef.current,
        title: `${rep.id} - ${rep.categoriaNome}`,
        animation: isSelected ? google.maps.Animation.BOUNCE : undefined,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 12 : 9,
          fillColor: isCritical ? '#ef4444' : '#f59e0b',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
      });

      marker.addListener('click', () => {
        onSelectReport(rep);

        if (!infoWindowRef.current) return;
        const infoHtml = `
          <div style="color: #0f172a; font-family: sans-serif; padding: 6px; max-width: 280px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10px; font-weight: bold; background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px;">VALIDADO SATÉLITE</span>
              <span style="font-size: 10px; color: #64748b; font-family: monospace;">${rep.id}</span>
            </div>
            <div style="font-size: 13px; font-weight: 700; margin-top: 6px; color: #0f172a;">${rep.categoriaNome}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px;">${rep.descricao}</div>
            <div style="margin-top: 6px; padding: 6px; background: #f8fafc; border-radius: 6px; font-size: 10px;">
              <div>Satélite: <b>${rep.sateliteProvider || 'Sentinel-2 L2A'}</b></div>
              <div>Confiança: <b style="color: #16a34a;">${rep.confiancaSatelite}%</b></div>
              ${rep.empresaAssociada ? `<div style="margin-top: 4px; color: #0f172a;">Empresa CAR: <b>${rep.empresaAssociada.razaoSocial}</b></div>` : ''}
            </div>
          </div>
        `;
        infoWindowRef.current.setContent(infoHtml);
        infoWindowRef.current.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [reports, filterCategory, selectedReport, onSelectReport, mapLoaded]);

  // Centraliza o mapa quando o relatório selecionado muda
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedReport) return;
    mapInstanceRef.current.panTo({
      lat: selectedReport.latitude,
      lng: selectedReport.longitude,
    });
    mapInstanceRef.current.setZoom(13);
  }, [selectedReport]);

  // Alterna tipo de mapa
  const handleMapTypeChange = (type: 'satellite' | 'hybrid' | 'terrain') => {
    setMapType(type);
    if (!mapInstanceRef.current || !window.google) return;

    if (type === 'satellite') {
      mapInstanceRef.current.setMapTypeId(google.maps.MapTypeId.SATELLITE);
    } else if (type === 'hybrid') {
      mapInstanceRef.current.setMapTypeId(google.maps.MapTypeId.HYBRID);
    } else {
      mapInstanceRef.current.setMapTypeId(google.maps.MapTypeId.TERRAIN);
    }
  };

  // Simulação de Varredura de Satélite ao vivo
  const handleTriggerScan = () => {
    setIsScanning(true);
    if (mapInstanceRef.current && window.google && selectedReport) {
      const scanCircle = new google.maps.Circle({
        strokeColor: '#38bdf8',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#38bdf8',
        fillOpacity: 0.2,
        map: mapInstanceRef.current,
        center: { lat: selectedReport.latitude, lng: selectedReport.longitude },
        radius: 1200,
      });

      let radius = 200;
      const interval = setInterval(() => {
        radius += 150;
        scanCircle.setRadius(radius);
        if (radius > 2500) {
          clearInterval(interval);
          scanCircle.setMap(null);
          setIsScanning(false);
        }
      }, 100);
    } else {
      setTimeout(() => setIsScanning(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg text-xs font-mono text-white">
            <Satellite className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Maps Satélite L2A</span>
          </div>

          {/* Toggle Map Types */}
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => handleMapTypeChange('satellite')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mapType === 'satellite'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Satélite
            </button>
            <button
              onClick={() => handleMapTypeChange('hybrid')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mapType === 'hybrid'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Híbrido
            </button>
            <button
              onClick={() => handleMapTypeChange('terrain')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mapType === 'terrain'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Terreno
            </button>
          </div>

          {/* Toggle CAR Polygons */}
          <button
            onClick={() => setShowCARPolygons(!showCARPolygons)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              showCARPolygons
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Malha do CAR ({showCARPolygons ? 'Exibindo Fazendas' : 'Oculto'})</span>
          </button>
        </div>

        {/* Category Filter and Trigger Scan */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all">Todas Infrações</option>
              <option value="1">Desmatamento Ilegal</option>
              <option value="2">Queimadas</option>
              <option value="3">Contaminação Hídrica</option>
              <option value="4">Garimpo Ilegal</option>
            </select>
          </div>

          <button
            onClick={handleTriggerScan}
            disabled={isScanning}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Varrendo Satélite...' : 'Escanear Sentinel-2'}</span>
          </button>
        </div>
      </div>

      {/* Main Google Maps Viewport Container */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        <div ref={mapElementRef} className="w-full h-full" />

        {/* Fallback caso a API Key esteja bloqueando domínios */}
        {mapError && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-red-950/80 border border-red-800 text-red-400 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Google Maps API: {mapError}</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Verifique se sua API Key possui restrições de HTTP Referrer ou ative as APIs necessárias no console do Google Cloud.
              </p>
            </div>
          </div>
        )}

        {/* Interactive Floating Card for Selected Report */}
        {selectedReport && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-4 shadow-2xl space-y-3 z-10 text-white">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                  VALIDAÇÃO AUTOMÁTICA CONCLUÍDA
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5">
                  {selectedReport.categoriaNome}
                </h4>
              </div>
              <span className="text-xs font-mono text-slate-400">{selectedReport.id}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedReport.descricao}
            </p>

            {/* Georeferencing & CAR Overlay Data */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block">WGS84 Lat/Lon:</span>
                <span className="text-emerald-400">{selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Índice NDVI Delta:</span>
                <span className="text-red-400 font-bold">-0.48 (Perda Crítica)</span>
              </div>
            </div>

            {/* Corporate Attribution from CAR */}
            {selectedReport.empresaAssociada && (
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Empresa no CAR: {selectedReport.empresaAssociada.razaoSocial}</span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  CNPJ: <span className="text-white font-semibold">{selectedReport.empresaAssociada.cnpj}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  CAR: {selectedReport.empresaAssociada.codigoCAR} (Sobreposição 100% Confirmada)
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
