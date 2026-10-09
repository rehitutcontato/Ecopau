'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Satellite, Radio, Crosshair, Sparkles, Eye, ShieldAlert, Compass } from 'lucide-react';
import { MockReport } from '@/lib/mockData';

interface Globe3DViewerProps {
  reports: MockReport[];
  selectedReport: MockReport | null;
  onSelectReport: (report: MockReport) => void;
}

// Converte latitude e longitude para coordenadas cartesianas 3D numa esfera
function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function Globe3DViewer({ reports, selectedReport, onSelectReport }: Globe3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [satelliteTelemetry, setSatelliteTelemetry] = useState({
    altitude: '786 km',
    orbitSpeed: '7.5 km/s',
    sensor: 'MSI Multispectral 13-Bands',
    swath: '290 km',
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Globo Terrestre Estilizado (Radar Holográfico Verde/Cyan)
    const globeRadius = 7.5;
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
    
    // Shader/Material de base escuro com grade vetorial
    const globeMaterial = new THREE.MeshBasicMaterial({
      color: 0x061812,
      wireframe: false,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Grade de paralelos e meridianos (Geodésia)
    const wireframeGeo = new THREE.SphereGeometry(globeRadius + 0.02, 36, 18);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const gridSphere = new THREE.Mesh(wireframeGeo, wireframeMat);
    scene.add(gridSphere);

    // Equador e Trópicos em destaque
    const equatorGeo = new THREE.RingGeometry(globeRadius + 0.05, globeRadius + 0.12, 64);
    const equatorMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const equator = new THREE.Mesh(equatorGeo, equatorMat);
    equator.rotation.x = Math.PI / 2;
    scene.add(equator);

    // Atmosfera com brilho esmeralda
    const atmosphereGeo = new THREE.SphereGeometry(globeRadius * 1.15, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphere);

    // 3. Órbita do Satélite Sentinel-2
    const orbitRadius = globeRadius + 3.2;
    const orbitPoints: THREE.Vector3[] = [];
    const orbitSegments = 120;
    for (let i = 0; i <= orbitSegments; i++) {
      const theta = (i / orbitSegments) * Math.PI * 2;
      orbitPoints.push(new THREE.Vector3(Math.cos(theta) * orbitRadius, Math.sin(theta) * (orbitRadius * 0.4), Math.sin(theta) * (orbitRadius * 0.9)));
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    scene.add(orbitLine);

    // Satélite Modelo 3D (Corpo com painéis solares)
    const satGroup = new THREE.Group();
    const satBodyGeo = new THREE.BoxGeometry(0.35, 0.2, 0.2);
    const satBodyMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const satBody = new THREE.Mesh(satBodyGeo, satBodyMat);
    satGroup.add(satBody);

    const solarPanelGeo = new THREE.BoxGeometry(1.2, 0.04, 0.35);
    const solarPanelMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const solarPanel = new THREE.Mesh(solarPanelGeo, solarPanelMat);
    satGroup.add(solarPanel);

    // Feixe de Radar / Sensor do Satélite apontando para a Terra
    const beamGeo = new THREE.ConeGeometry(0.8, 3.2, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = -1.6;
    satGroup.add(beam);

    scene.add(satGroup);

    // 4. Marcadores dos Crimes Ambientais (Hotspots)
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);

    reports.forEach((rep) => {
      const pos = latLongToVector3(rep.latitude, rep.longitude, globeRadius + 0.1);

      // Ponto de pulso
      const markerGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const isCritical = rep.categoriaId === 1 || rep.categoriaId === 4;
      const markerMat = new THREE.MeshBasicMaterial({
        color: isCritical ? 0xef4444 : 0xf59e0b,
      });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.copy(pos);
      markerMesh.userData = { report: rep };

      // Anel de radar pulsante ao redor do crime
      const ringGeo = new THREE.RingGeometry(0.3, 0.42, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isCritical ? 0xef4444 : 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      markerMesh.add(ringMesh);

      markersGroup.add(markerMesh);
    });

    // 5. Interação de Mouse e Rotação
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.2;
    let targetRotationY = -1.1; // Centralizado na América do Sul / Brasil
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        targetRotationY += deltaX * 0.005;
        targetRotationX += deltaY * 0.005;
        prevMousePos = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Raycaster para clique nos crimes
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markersGroup.children, true);

      if (intersects.length > 0) {
        let obj: any = intersects[0].object;
        while (obj && !obj.userData?.report && obj.parent) {
          obj = obj.parent;
        }
        if (obj?.userData?.report) {
          onSelectReport(obj.userData.report);
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);

    // 6. Loop de Animação
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotação suave do globo se não estiver arrastando
      if (isRotating && !isDragging) {
        targetRotationY += 0.0015;
      }

      globe.rotation.y += (targetRotationY - globe.rotation.y) * 0.05;
      globe.rotation.x += (targetRotationX - globe.rotation.x) * 0.05;
      gridSphere.rotation.copy(globe.rotation);
      markersGroup.rotation.copy(globe.rotation);

      // Trajetória do Satélite
      const satSpeed = elapsed * 0.6;
      satGroup.position.x = Math.cos(satSpeed) * orbitRadius;
      satGroup.position.y = Math.sin(satSpeed) * (orbitRadius * 0.4);
      satGroup.position.z = Math.sin(satSpeed) * (orbitRadius * 0.9);
      satGroup.lookAt(new THREE.Vector3(0, 0, 0));

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [reports, isRotating, onSelectReport]);

  return (
    <div className="relative w-full h-[540px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between">
      {/* Top HUD Bar */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-600/60 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
                Radar Planetário 3D · EcoRadar
              </h3>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                Ao Vivo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Constelação Sentinel-2 monitorando focos críticos de desmatamento no Brasil
            </p>
          </div>
        </div>

        {/* Telemetria do Satélite */}
        <div className="hidden md:flex items-center gap-4 bg-slate-900/90 border border-slate-800/90 px-3.5 py-1.5 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-1.5 text-sky-400">
            <Satellite className="w-3.5 h-3.5" />
            <span>Sentinel-2A</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-slate-300">
            Alt: <span className="text-emerald-400">{satelliteTelemetry.altitude}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-slate-300">
            Vel: <span className="text-emerald-400">{satelliteTelemetry.orbitSpeed}</span>
          </div>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
              isRotating
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isRotating ? 'Giro Ativo' : 'Giro Pausado'}
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Bottom HUD: Hotspots & Selected Report Trigger */}
      <div className="relative z-10 p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Focos Críticos Detectados:</span>
          <div className="flex gap-2">
            {reports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <button
                  key={rep.id}
                  onClick={() => onSelectReport(rep)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${rep.categoriaId === 1 ? 'bg-red-500 animate-ping' : 'bg-amber-400'}`} />
                  <span>{rep.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>Arraste para rotacionar o globo · Clique nos pontos vermelhos para inspecionar</span>
        </div>
      </div>
    </div>
  );
}
