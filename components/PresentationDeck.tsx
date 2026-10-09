'use client';

import React, { useState } from 'react';
import { 
  User, 
  Mic, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Smartphone, 
  Server, 
  Database, 
  Rocket, 
  Copy, 
  Check, 
  Sparkles,
  ExternalLink,
  Clock,
  Compass
} from 'lucide-react';

interface PresenterPart {
  id: string;
  speaker: string;
  role: string;
  title: string;
  duration: string;
  targetModule: 'arquitetura' | 'mobile' | 'api' | 'database' | 'comando' | 'deploy';
  whatToSay: string[];
  keyHighlights: string[];
  systemHook: string;
  icon: any;
  color: string;
}

const PRESENTATION_PARTS: PresenterPart[] = [
  {
    id: 'pablo',
    speaker: 'Pablo',
    role: 'Abertura & Visão Arquitetural de Solução',
    title: 'O Problema da Impunidade Ambiental & A Arquitetura Cloud do EcoRadar',
    duration: '2 a 3 minutos',
    targetModule: 'arquitetura',
    color: 'emerald',
    icon: Layers,
    whatToSay: [
      '“Boa tarde a todos os avaliadores. Hoje apresentamos o EcoRadar, uma plataforma de alta tecnologia desenvolvida para resolver uma das maiores dores do Brasil: a subnotificação e a impunidade em crimes ambientais corporativos.”',
      '“Tradicionalmente, quando um cidadão presencia um desmatamento ilegal ou contaminação de rio, ele tem medo de denunciar por retaliação de grandes fazendeiros ou mineradoras. E quando denuncia, a fiscalização leva semanas para checar in loco.”',
      '“O EcoRadar une três pilares técnicos inegociáveis: primeiro, anonimato criptográfico na ponta; segundo, auditoria autônoma via imagens de satélite Sentinel-2; e terceiro, responsabilização imediata cruzando as coordenadas com o Cadastro Ambiental Rural (CAR).”',
      '“Para sustentar essa missão, desenhamos uma arquitetura cloud com API Gateway blindado (que descarta o IP do usuário), backend em Node.js com filas assíncronas no Redis, e banco relacional PostgreSQL com extensão PostGIS.”',
    ],
    keyHighlights: [
      'Dor central: Crimes corporativos no Cerrado, Amazônia e Pantanal sem responsabilização imediata.',
      'Proposta de Valor: Crowdsourcing georreferenciado + Verificação física via Satélite.',
      'Stack Principal: React Native + Node.js 20 LTS + PostgreSQL 16 / PostGIS 3.4 + MinIO S3.',
    ],
    systemHook: 'Apresentar o Diagrama de Blocos e a Matriz de Decisão Arquitetural na Aba 1.',
  },
  {
    id: 'josue',
    speaker: 'Josué',
    role: 'Engenheiro Frontend & Mobile Security',
    title: 'Aplicativo Mobile em Campo & O Algoritmo de Higienização de Metadados EXIF/GPS',
    duration: '2 a 3 minutos',
    targetModule: 'mobile',
    color: 'sky',
    icon: Smartphone,
    whatToSay: [
      '“Dando continuidade ao que o Pablo explicou, eu fiquei responsável pela ponta da coleta: o aplicativo mobile do EcoRadar desenvolvido em React Native e TypeScript.”',
      '“O grande desafio de segurança era: como permitir que um ribeirinho ou morador local fotografe um trator derrubando árvores sem assinar sua própria sentença de morte?”',
      '“Toda câmera de smartphone embute tags EXIF ocultas no arquivo JPEG: o número serial de fábrica da lente, o modelo exato do aparelho e as coordenadas GPS de onde a pessoa estava.”',
      '“Desenvolvemos o módulo exifSanitizer. Ele intercepta a imagem no próprio aparelho antes de qualquer envio de rede, faz a re-renderização pura dos pixels em canvas descartando 100% dos cabeçalhos binários EXIF/GPS, e gera um hash SHA-256 da prova limpa.”',
      '“Agora vou demonstrar ao vivo no nosso simulador de smartphone a tela de Nova Denúncia e o expurgo imediato do EXIF.”',
    ],
    keyHighlights: [
      'Zero-KYC: Sem login, sem telefone e sem armazenamento de dados cadastrais.',
      'Componente de Mapa interativo para o usuário posicionar o pino georreferenciado (WGS 84).',
      'Re-codificação de pixels local: destruição comprovada de headers EXIF, IPTC e XMP.',
    ],
    systemHook: 'Abrir a Aba 2 (App Mobile), selecionar uma foto de teste e clicar em "Higienizar Metadados & Garantir Anonimato".',
  },
  {
    id: 'thalles',
    speaker: 'Thalles',
    role: 'Engenheiro de Backend & Inteligência Satelital',
    title: 'Backend RESTful em Node.js & Validação Autônoma por Satélite (Sentinel-2 / MapBiomas)',
    duration: '2 a 3 minutos',
    targetModule: 'api',
    color: 'blue',
    icon: Server,
    whatToSay: [
      '“Com a denúncia transmitida de forma 100% anônima, entra em ação a camada de backend que implementei em Node.js com Express e filas assíncronas no Redis.”',
      '“A rota POST /api/denuncias recebe o payload multipart, valida a consistência das coordenadas geodésicas (-90 a 90 / -180 a 180) e salva a geometria no PostGIS como ponto SRID 4326.”',
      '“Mas aqui está o diferencial: o sistema não depende de um funcionário público ir checar a denúncia manualmente. Ele dispara um job no BullMQ para o nosso Worker de Satélite.”',
      '“Esse worker consulta os alertas multiespectrais do satélite Copernicus Sentinel-2 L2A e do MapBiomas Alertas num raio de 500 metros em torno do ponto.”',
      '“Se o satélite detectar queda de biomassa (delta NDVI severo, ex: -0.48), a denúncia é promovida automaticamente para o status VALIDADO_COM_EVIDENCIA com mais de 90% de confiança probatória.”',
    ],
    keyHighlights: [
      'Rota POST /api/denuncias com ingestão em memória e hashing SHA-256.',
      'Processamento desacoplado via BullMQ / Redis sem travar o app do usuário.',
      'Algoritmo de auditoria espectral: cálculo de NDVI e intersecção de buffers de 500m.',
    ],
    systemHook: 'Ir para a Aba 3 (Backend API), clicar em "Disparar Chamada POST" e mostrar o console com o log do Sentinel-2 validando a queima de vegetação.',
  },
  {
    id: 'gustavo',
    speaker: 'Gustavo',
    role: 'Arquiteto de Banco de Dados Geoespacial',
    title: 'PostgreSQL + PostGIS & Cruzamento Espacial com a Malha do CAR (ST_Contains)',
    duration: '2 a 3 minutos',
    targetModule: 'database',
    color: 'purple',
    icon: Database,
    whatToSay: [
      '“Uma vez que a denúncia foi validada fisicamente pelo satélite, o desafio principal passa a ser jurídico: a quem pertence essa terra? Quem é o responsável corporativo pelo desmatamento?”',
      '“Para resolver isso, estruturei o banco de dados no PostgreSQL 16 com a extensão geoespacial PostGIS 3.4.”',
      '“Temos duas tabelas chave: a tabela denuncias (com campo GEOMETRY Point) e a tabela empresas_risco, que armazena os MultiPolígonos de todas as fazendas registradas no CAR (Cadastro Ambiental Rural).”',
      '“Através do operador espacial ST_Contains(geometria_propriedade, coordenadas), o banco executa uma busca em árvore R-Tree via índice GiST em menos de 2 milissegundos.”',
      '“O resultado é imediato: o sistema revela na hora a Razão Social, o CNPJ da empresa, o código do CAR e se a propriedade já possui embargos ativos no IBAMA.”',
    ],
    keyHighlights: [
      'Índices espaciais GiST R-Tree sobre coordenadas WGS84 (EPSG:4326).',
      'Query ST_Contains para contenção estrita do crime dentro da fazenda.',
      'Query ST_DWithin para crimes difusos com buffer de 1.000 metros (contaminação hídrica em rios).',
    ],
    systemHook: 'Acessar a Aba 4 (PostGIS), rodar a query ST_Contains e mostrar o SVG ilustrando o ponto do crime dentro do polígono do CAR com o CNPJ exposto.',
  },
  {
    id: 'miguel',
    speaker: 'Miguel',
    role: 'Tech Lead / DevOps & Operação do Radar',
    title: 'Centro de Comando Operacional (Globo 3D + Google Maps) & Deploy Escalável',
    duration: '2 a 3 minutos',
    targetModule: 'comando',
    color: 'amber',
    icon: Rocket,
    whatToSay: [
      '“Para fechar com chave de ouro nossa apresentação, eu liderei a construção do nosso Centro de Comando Operacional e a infraestrutura de deploy do MVP.”',
      '“Para dar total visibilidade pública aos órgãos ambientais e à imprensa, desenvolvemos este Globo 3D interativo holográfico em WebGL que monitora em tempo real a órbita do satélite Sentinel-2 cruzando os biomas brasileiros.”',
      '“Integrado a ele, temos o mapa em alta definição via Google Maps Satélite com a malha vetorial do CAR desenhada em tempo real.”',
      '“Ao clicar em qualquer ponto quente, a banca pode auditar o laudo completo: as fotos limpas, as coordenadas, o CNPJ da empresa infratora e o índice de destruição de biomassa.”',
      '“E para colocar tudo isso no ar, encapsulamos toda a stack em containers Docker (PostGIS, Redis, MinIO e Node.js). Qualquer desenvolvedor júnior sobe o ecossistema completo com um simples docker-compose up em menos de 5 minutos.”',
      '“Com isso, encerramos a apresentação do EcoRadar e abrimos para as perguntas da banca. Muito obrigado!”',
    ],
    keyHighlights: [
      'Globo 3D interativo em Three.js com telemetria orbital do Sentinel-2.',
      'Google Maps em modo Satélite de alta resolução com polígonos reais do CAR.',
      'Deploy pronto para produção em Docker Compose e orquestração de microsserviços.',
    ],
    systemHook: 'Mostrar a Aba do Centro de Comando (Globo 3D e Google Maps ao vivo) e finalizar na Aba 5 (Guia de Deploy).',
  },
];

export function PresentationDeck({ onNavigate }: { onNavigate: (module: any) => void }) {
  const [activeSpeakerId, setActiveSpeakerId] = useState<string>('pablo');
  const [copiedScript, setCopiedScript] = useState(false);

  const activePart = PRESENTATION_PARTS.find((p) => p.id === activeSpeakerId) || PRESENTATION_PARTS[0];

  const handleCopyFullScript = () => {
    const fullText = PRESENTATION_PARTS.map((p) => {
      return `=== PARTE DE ${p.speaker.toUpperCase()} (${p.role}) ===\nTema: ${p.title}\nTempo: ${p.duration}\n\nFALA RECOMENDADA:\n${p.whatToSay.join('\n\n')}\n\nPONTOS CHAVE:\n- ${p.keyHighlights.join('\n- ')}\n\nGANCHO NO SISTEMA: ${p.systemHook}\n\n`;
    }).join('\n-----------------------------------------\n\n');

    navigator.clipboard.writeText(fullText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <Mic className="w-3.5 h-3.5" />
            <span>Roteiro de Defesa de Projeto · Divisão em 5 Partes</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Apresentação da Equipe: Pablo, Josué, Thalles, Gustavo e Miguel
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Roteiro estruturado para uma apresentação de alto impacto de 10 a 15 minutos. Cada integrante possui sua fala exata, tópicos técnicos de suporte e atalho direto para a tela do sistema que vai demonstrar.
          </p>
        </div>

        <button
          onClick={handleCopyFullScript}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors w-fit"
        >
          {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedScript ? 'Roteiro Copiado!' : 'Copiar Roteiro Completo'}</span>
        </button>
      </div>

      {/* Segmented Presenter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {PRESENTATION_PARTS.map((part, index) => {
          const isActive = part.id === activeSpeakerId;
          const Icon = part.icon;
          return (
            <button
              key={part.id}
              onClick={() => setActiveSpeakerId(part.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-emerald-400">0{index + 1}. PARTE</span>
                <Icon className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-bold text-sm text-white">{part.speaker}</div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">{part.role.split('&')[0]}</div>
            </button>
          );
        })}
      </div>

      {/* Active Presenter Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-600/60 flex items-center justify-center text-emerald-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{activePart.speaker}</h3>
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                  {activePart.role}
                </span>
              </div>
              <h4 className="text-sm text-slate-300 font-medium mt-0.5">{activePart.title}</h4>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tempo: {activePart.duration}</span>
            </div>

            <button
              onClick={() => onNavigate(activePart.targetModule)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950"
            >
              <span>Ir para a Tela da Apresentação</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Script Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Teleprompter / O que falar */}
          <div className="lg:col-span-7 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Mic className="w-4 h-4" />
              <span>Roteiro de Fala Sugerido (O que falar na banca)</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-sm text-slate-300 leading-relaxed font-sans">
              {activePart.whatToSay.map((paragraph, idx) => (
                <p key={idx} className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Bullet points & Gancho de Demonstração */}
          <div className="lg:col-span-5 space-y-5">
            {/* Pontos Chave */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pontos-Chave para Destacar</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                {activePart.keyHighlights.map((hl, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-emerald-400 font-bold shrink-0">▸</span>
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gancho Prático no Sistema */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Momento de Demonstração ao Vivo</span>
              </div>
              <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 text-xs text-amber-200/90 space-y-2">
                <p className="leading-relaxed">
                  <strong>Ação no Sistema:</strong> {activePart.systemHook}
                </p>
                <button
                  onClick={() => onNavigate(activePart.targetModule)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Executar Demonstração Agora</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
