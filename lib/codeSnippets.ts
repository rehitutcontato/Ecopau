export const CODE_SNIPPETS = {
  // 1. Arquitetura de Sistema
  architectureOverview: `/**
 * ARQUITETURA TÉCNICA ECORADAR (MVP)
 * ----------------------------------------------------
 * Stack Tecnológica Recomendada:
 * 
 * 1. Camada Cliente (Frontend Mobile):
 *    - Framework: React Native (Expo / Bare Workflow) + TypeScript
 *    - Mapas: Mapbox GL Native ou Leaflet via WebView otimizado
 *    - Sanitização Local: Pipeline nativo para purga de metadados EXIF/GPS antes da rede
 *    - Protocolo de Comunicação: HTTPS / TLS 1.3 com Certificate Pinning
 * 
 * 2. Camada de Borda & Segurança (API Gateway / Ingress):
 *    - Reverse Proxy: Nginx / Kong
 *    - Anonimização: Remoção de headers sensíveis (X-Forwarded-For mascarado, User-Agent sanitizado)
 *    - Rate Limiting: 10 requisições/min por subnet C (/24) para mitigar DoS sem exigir login
 * 
 * 3. Camada de Aplicação (Backend REST API):
 *    - Runtime: Node.js 20 LTS com Express / TypeScript (ou Python FastAPI)
 *    - Validação de Esquema: Zod / Joi para validação rigorosa de coordenadas e payloads
 *    - Gerenciador de Filas: BullMQ + Redis para processamento assíncrono de satélite
 *    - Armazenamento de Arquivos: Bucket S3 / MinIO (chaves criptografadas baseadas em SHA-256)
 * 
 * 4. Camada de Dados Geoespacial (RDBMS + Spatial Engine):
 *    - Banco: PostgreSQL 16 + PostGIS 3.4
 *    - Índices Espaciais: GiST (Generalized Search Tree) sobre colunas de GEOMETRY (Point e MultiPolygon)
 *    - Projeção Padrão: WGS 84 (EPSG:4326) para ingestão e EPSG:3857 para cálculos métricos/geography
 * 
 * 5. Provedores e APIs Externas:
 *    - Satélite / Alertas: Copernicus Sentinel-2 L2A API & MapBiomas Alertas API (WFS/REST)
 *    - Cadastro Ambiental: SICAR / CAR (shapefiles públicos de propriedades rurais georreferenciadas)
 */`,

  // 2. React Native Mock
  reactNativeNovaDenuncia: `import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
// Componente de Mapa: Mapbox ou Leaflet via react-native-maps / WebView
import MapView, { Marker } from 'react-native-maps';
import { launchImageLibrary } from 'react-native-image-picker';
import { sanitizeAndHashMedia } from './utils/exifSanitizer';

// Categorias oficiais de infrações ambientais
const CATEGORIAS = [
  { id: 1, label: 'Desmatamento Ilegal' },
  { id: 2, label: 'Queimada Clandestina' },
  { id: 3, label: 'Contaminação Hídrica' },
  { id: 4, label: 'Garimpo Clandestino' },
  { id: 5, label: 'Grilagem de Terra Pública' },
];

export default function NovaDenunciaScreen({ navigation }: any) {
  // Coordenadas georreferenciadas selecionadas pelo usuário no mapa
  const [coordenadas, setCoordenadas] = useState({
    latitude: -9.1823,
    longitude: -63.5829,
  });

  const [categoriaId, setCategoriaId] = useState<number | null>(1);
  const [descricao, setDescricao] = useState('');
  const [midiaSanitizada, setMidiaSanitizada] = useState<{
    uri: string;
    sha256: string;
    exifPurged: boolean;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusHigienizacao, setStatusHigienizacao] = useState<string>('');

  /**
   * Seleciona uma imagem da galeria e remove imediatamente metadados
   * de GPS, modelo da câmera, número de série e data original (EXIF/IPTC).
   */
  const handleSelecionarMidia = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.85,
        includeExtra: true, // Necessário para capturar e auditar o EXIF inicial
      });

      if (!result.assets || result.assets.length === 0) return;
      const asset = result.assets[0];

      setStatusHigienizacao('Limpando metadados EXIF/GPS da foto...');

      // Executa a purga criptográfica e re-renderização da imagem
      const sanitizado = await sanitizeAndHashMedia(asset.uri!);

      setMidiaSanitizada(sanitizado);
      setStatusHigienizacao('✓ Metadados purgados com sucesso. Mídia 100% anônima.');
    } catch (err: any) {
      Alert.alert('Erro ao processar mídia', 'Falha na higienização da imagem: ' + err.message);
      setStatusHigienizacao('');
    }
  };

  /**
   * Envia o relatório anônimo georreferenciado para o backend EcoRadar
   */
  const handleEnviarDenuncia = async () => {
    if (!categoriaId) {
      Alert.alert('Validação', 'Por favor, selecione uma categoria para a infração.');
      return;
    }
    if (!midiaSanitizada) {
      Alert.alert('Evidência Requerida', 'Anexe ao menos uma foto sanitizada para verificação.');
      return;
    }

    setLoading(true);

    try {
      // Cria FormData com a mídia limpa (sem rastro de identificação do aparelho)
      const formData = new FormData();
      formData.append('latitude', coordenadas.latitude.toString());
      formData.append('longitude', coordenadas.longitude.toString());
      formData.append('categoria_id', categoriaId.toString());
      formData.append('descricao', descricao);
      formData.append('midia_hash', midiaSanitizada.sha256);
      formData.append('foto', {
        uri: midiaSanitizada.uri,
        name: \`evidence_\${midiaSanitizada.sha256.substring(0, 12)}.jpg\`,
        type: 'image/jpeg',
      } as any);

      const response = await fetch('https://api.ecoradar.org/api/denuncias', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          // Note: sem Authorization bearer e sem tokens de rastreio de identidade
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao registrar denúncia');
      }

      Alert.alert(
        'Denúncia Registrada!',
        \`Protocolo: \${data.denunciaId}\\nStatus: Em análise automática via satélite.\`,
        [{ text: 'OK', onPress: () => navigation?.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Erro no envio', error.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Nova Denúncia Ambiental</Text>
      <Text style={styles.headerSubtitle}>
        Envio anônimo e criptografado com verificação automática de satélite
      </Text>

      {/* 1. Componente de Mapa para Georreferenciamento */}
      <Text style={styles.sectionLabel}>1. Localização do Ocorrido (Toque para ajustar)</Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: coordenadas.latitude,
            longitude: coordenadas.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={(e) => setCoordenadas(e.nativeEvent.coordinate)}
        >
          <Marker
            coordinate={coordenadas}
            draggable
            onDragEnd={(e) => setCoordenadas(e.nativeEvent.coordinate)}
            title="Local da Infração"
            pinColor="#16A34A"
          />
        </MapView>
        <View style={styles.coordsBadge}>
          <Text style={styles.coordsText}>
            Lat: {coordenadas.latitude.toFixed(5)} | Lon: {coordenadas.longitude.toFixed(5)}
          </Text>
        </View>
      </View>

      {/* 2. Seleção de Categoria */}
      <Text style={styles.sectionLabel}>2. Tipo de Infração</Text>
      <View style={styles.categoriesGrid}>
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.catButton,
              categoriaId === cat.id && styles.catButtonActive,
            ]}
            onPress={() => setCategoriaId(cat.id)}
          >
            <Text
              style={[
                styles.catButtonText,
                categoriaId === cat.id && styles.catButtonTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 3. Upload de Mídia e Sanitização EXIF */}
      <Text style={styles.sectionLabel}>3. Evidência Fotográfica</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={handleSelecionarMidia}>
        <Text style={styles.uploadButtonText}>
          {midiaSanitizada ? 'Trocar Foto Sanitizada' : '+ Selecionar Foto da Galeria'}
        </Text>
      </TouchableOpacity>

      {statusHigienizacao ? (
        <Text style={styles.sanitizerStatus}>{statusHigienizacao}</Text>
      ) : null}

      {midiaSanitizada && (
        <View style={styles.previewBox}>
          <Image source={{ uri: midiaSanitizada.uri }} style={styles.previewImage} />
          <View style={styles.hashInfo}>
            <Text style={styles.hashTitle}>Integridade Criptográfica (SHA-256):</Text>
            <Text style={styles.hashValue} numberOfLines={1}>
              {midiaSanitizada.sha256}
            </Text>
            <Text style={styles.hashSecurity}>
              ✓ Tags EXIF (GPS, Marca da Câmera, Serial, Timestamp) foram destruídas.
            </Text>
          </View>
        </View>
      )}

      {/* 4. Descrição Opcional */}
      <Text style={styles.sectionLabel}>4. Detalhes Adicionais (Opcional)</Text>
      <TextInput
        style={styles.inputArea}
        placeholder="Descreva maquinários avistados, placas de veículos ou empresas..."
        placeholderTextColor="#94A3B8"
        multiline
        numberOfLines={3}
        value={descricao}
        onChangeChangeText={setDescricao}
      />

      {/* Botão de Envio */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleEnviarDenuncia}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Transmitir Denúncia Anônima</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 16, paddingBottom: 40 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#F8FAFC', marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: '#94A3B8', marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#E2E8F0', marginTop: 14, marginBottom: 8 },
  mapContainer: { height: 220, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  map: { width: '100%', height: '100%' },
  coordsBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  coordsText: { color: '#38BDF8', fontSize: 11, fontFamily: 'monospace' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  catButtonActive: { backgroundColor: '#16A34A', borderColor: '#22C55E' },
  catButtonText: { color: '#94A3B8', fontSize: 13 },
  catButtonTextActive: { color: '#FFFFFF', fontWeight: '600' },
  uploadButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderStyle: 'dashed',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: { color: '#38BDF8', fontWeight: '600', fontSize: 14 },
  sanitizerStatus: { color: '#4ADE80', fontSize: 12, marginTop: 6 },
  previewBox: { marginTop: 10, backgroundColor: '#1E293B', borderRadius: 8, padding: 10, flexDirection: 'row', gap: 10 },
  previewImage: { width: 70, height: 70, borderRadius: 6 },
  hashInfo: { flex: 1, justifyContent: 'center' },
  hashTitle: { color: '#94A3B8', fontSize: 11 },
  hashValue: { color: '#F1F5F9', fontSize: 10, fontFamily: 'monospace', marginVertical: 2 },
  hashSecurity: { color: '#22C55E', fontSize: 10 },
  inputArea: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});`,

  // 2. EXIF Sanitizer Helper
  reactNativeExifSanitizer: `/**
 * utils/exifSanitizer.ts
 * 
 * Protocolo de Higienização de Metadados em Dispositivos Móveis
 * 
 * Por que é crítico?
 * Fotos tiradas por smartphones gravam tags EXIF sensíveis:
 * - GPSLatitude / GPSLongitude (local do usuário quando tirou a foto)
 * - Make / Model / CameraSerialNumber (identificador único do aparelho do denunciante)
 * - DateTimeOriginal (momento exato da captura)
 * - UserComment / LensModel
 * 
 * Este módulo:
 * 1. Faz a leitura e auditoria via 'react-native-exif-reader' para verificação.
 * 2. Re-codifica os pixels brutos via ImageResizer / Canvas, gerando um buffer JPEG
 *    sem nenhum header EXIF, XMP ou IPTC.
 * 3. Calcula o hash SHA-256 da imagem sanitizada para integridade judicial.
 */

// Em ambiente Bare React Native:
// import ExifReader from 'react-native-exif-reader';
// import ImageResizer from '@bam.tech/react-native-image-resizer';
// import * as Crypto from 'expo-crypto';

export interface SanitizedMediaResult {
  uri: string;
  sha256: string;
  exifPurged: boolean;
  auditoriaMetadadosRemovidos: string[];
}

export async function sanitizeAndHashMedia(sourceUri: string): Promise<SanitizedMediaResult> {
  // Passo 1: Leitura dos metadados originais (apenas para auditoria de proteção)
  // const tagsOriginais = await ExifReader.read(sourceUri);
  // const tagsIdentificadas = Object.keys(tagsOriginais).filter(k => 
  //   ['GPS', 'Model', 'Make', 'DateTime', 'Software', 'MakerNote'].some(s => k.includes(s))
  // );

  // Passo 2: Re-codificação pura de matriz de pixels (Strip EXIF)
  // Recomprime a imagem descartando qualquer cabeçalho de metadados binários:
  // const resizedImage = await ImageResizer.createResizedImage(
  //   sourceUri,
  //   1920, // max width mantendo alta fidelidade
  //   1080, // max height
  //   'JPEG',
  //   85,   // qualidade
  //   0,    // rotação fixa
  //   undefined,
  //   false, // keepExif: FALSE -> purga definitiva do cabeçalho EXIF
  //   { mode: 'contain', onlyScaleDown: true }
  // );

  // Passo 3: Geração de Hash Criptográfico SHA-256 do arquivo limpo
  // const fileData = await FileSystem.readAsStringAsync(resizedImage.uri, { encoding: 'base64' });
  // const sha256 = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, fileData);

  // Exemplo de retorno tipado
  return {
    uri: sourceUri,
    sha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    exifPurged: true,
    auditoriaMetadadosRemovidos: [
      'GPSLatitude: -9.18231',
      'GPSLongitude: -63.58294',
      'Make: Apple',
      'Model: iPhone 14 Pro',
      'DateTimeOriginal: 2026-09-28 14:10:02',
      'LensSerialNumber: 4091A8829'
    ]
  };
}`,

  // 3. Backend API Express
  backendApiExpress: `/**
 * backend/server.ts & routes/denuncias.ts
 * 
 * API RESTful Segura para Ingestão Anônima de Denúncias
 * Framework: Express 4/5 + TypeScript
 */

import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import multer from 'multer';
import crypto from 'crypto';
import { Pool } from 'pg';
import { enqueueSatelliteValidation } from './services/satelliteValidationService';

const app = express();
const port = process.env.PORT || 3000;

// Configuração da Pool de Conexão PostgreSQL + PostGIS
export const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://ecouser:ecopass@localhost:5432/ecoradar',
  max: 20,
  idleTimeoutMillis: 30000,
});

// Middleware de anonimização e segurança
app.use(helmet());
app.use(cors({ origin: '*' })); // Permitido em app mobile
app.use(express.json({ limit: '10mb' }));

// Upload de mídia em memória para cálculo do hash SHA-256 antes da persistência no S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'video/mp4'].includes(file.mimetype)) {
      return cb(new Error('Formato de arquivo não suportado. Apenas JPEG, PNG ou MP4.'));
    }
    cb(null, true);
  },
});

/**
 * POST /api/denuncias
 * 
 * Ingestão de Denúncia Anônima Georreferenciada
 */
app.post('/api/denuncias', upload.single('foto'), async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, categoria_id, descricao } = req.body;

    // 1. Validação de parâmetros geoespaciais
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ error: 'Coordenadas geográficas inválidas.' });
    }

    if (!categoria_id) {
      return res.status(400).json({ error: 'categoria_id é obrigatório.' });
    }

    // 2. Validação e cálculo do hash da evidência de mídia
    let midiaHash = '';
    if (req.file) {
      midiaHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
      // No MVP real: upload para MinIO/S3 usando o hash como chave (sem metadados de usuário)
    }

    // 3. Persistência no PostGIS com SRID 4326 (WGS 84)
    // O ponto é inserido diretamente com ST_SetSRID(ST_MakePoint(lon, lat), 4326)
    const insertQuery = \`
      INSERT INTO denuncias (
        coordenadas,
        categoria_id,
        midia_hash,
        status_id,
        descricao,
        data_criacao
      ) VALUES (
        ST_SetSRID(ST_MakePoint($1, $2), 4326),
        $3,
        $4,
        1, -- 1: RECEBIDO / AGUARDANDO_SATELITE
        $5,
        NOW()
      )
      RETURNING id, ST_X(coordenadas) as lon, ST_Y(coordenadas) as lat, status_id, data_criacao;
    \`;

    const result = await db.query(insertQuery, [lon, lat, parseInt(categoria_id), midiaHash, descricao || '']);
    const novaDenuncia = result.rows[0];

    // 4. Dispara validação assíncrona com Satélite (Sentinel-2 / MapBiomas)
    // Fila BullMQ / Redis não bloqueia a resposta HTTP do denunciante
    enqueueSatelliteValidation({
      denunciaId: novaDenuncia.id,
      latitude: lat,
      longitude: lon,
      categoriaId: parseInt(categoria_id),
    });

    return res.status(201).json({
      success: true,
      message: 'Denúncia registrada com sucesso e enfileirada para análise satelital.',
      denunciaId: novaDenuncia.id,
      coordenadas: { latitude: novaDenuncia.lat, longitude: novaDenuncia.lon },
      status: 'RECEBIDO_EM_ANALISE_SATELITAL',
      midiaHash: midiaHash,
    });
  } catch (error: any) {
    console.error('Erro ao processar denúncia:', error);
    return res.status(500).json({ error: 'Erro interno ao processar a denúncia.' });
  }
});

/**
 * GET /api/mapa/denuncias
 * 
 * Retorna os pontos de denúncia validados dentro de uma Bounding Box (BBOX)
 * no formato padrão GeoJSON FeatureCollection para visualização em mapas.
 */
app.get('/api/mapa/denuncias', async (req: Request, res: Response) => {
  try {
    const { bbox } = req.query; // Formato: minLon,minLat,maxLon,maxLat

    let bboxFilter = '';
    const params: any[] = [];

    if (bbox && typeof bbox === 'string') {
      const parts = bbox.split(',').map(Number);
      if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
        params.push(parts[0], parts[1], parts[2], parts[3]);
        // ST_MakeEnvelope(minLon, minLat, maxLon, maxLat, 4326)
        bboxFilter = 'AND d.coordenadas && ST_MakeEnvelope($1, $2, $3, $4, 4326)';
      }
    }

    const query = \`
      SELECT 
        d.id,
        ST_X(d.coordenadas) as lon,
        ST_Y(d.coordenadas) as lat,
        d.categoria_id,
        c.nome as categoria_nome,
        d.status_id,
        s.nome as status_nome,
        d.confianca_satelite,
        d.alerta_satelite_id,
        d.data_criacao,
        emp.razao_social as empresa_nome,
        emp.cnpj_responsavel as empresa_cnpj
      FROM denuncias d
      JOIN categorias c ON c.id = d.categoria_id
      JOIN status_denuncia s ON s.id = d.status_id
      LEFT JOIN LATERAL (
        SELECT e.razao_social, e.cnpj_responsavel
        FROM empresas_risco e
        WHERE ST_Contains(e.geometria_propriedade, d.coordenadas)
        LIMIT 1
      ) emp ON TRUE
      WHERE d.status_id IN (2, 3) -- 2: VALIDADO_COM_EVIDENCIA, 3: EM_ANALISE
      \${bboxFilter}
      ORDER BY d.data_criacao DESC
      LIMIT 500;
    \`;

    const result = await db.query(query, params);

    // Formata a resposta como GeoJSON FeatureCollection
    const geojson = {
      type: 'FeatureCollection',
      features: result.rows.map((row) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(row.lon), parseFloat(row.lat)],
        },
        properties: {
          id: row.id,
          categoria: row.categoria_nome,
          categoriaId: row.categoria_id,
          status: row.status_nome,
          confiancaSatelite: row.confianca_satelite ? parseFloat(row.confianca_satelite) : null,
          alertaSateliteId: row.alerta_satelite_id,
          dataCriacao: row.data_criacao,
          empresaInfratora: row.empresa_nome ? {
            razaoSocial: row.empresa_nome,
            cnpj: row.empresa_cnpj,
          } : null,
        },
      })),
    };

    return res.json(geojson);
  } catch (error: any) {
    console.error('Erro ao consultar mapa:', error);
    return res.status(500).json({ error: 'Erro ao carregar dados do mapa geoespacial.' });
  }
});

export default app;`,

  // 3. Satellite Validation Service
  satelliteValidationService: `/**
 * backend/services/satelliteValidationService.ts
 * 
 * Lógica de Validação Geoespacial Cruzada com Satélites (MapBiomas / Sentinel-2)
 * 
 * Fluxo de Auditoria:
 * 1. Recebe coordenadas (lat, lon) e data da denúncia.
 * 2. Consulta API Mock de Alertas (Sentinel-2 L2A / MapBiomas Alertas WFS).
 * 3. Cria um buffer espacial de 500 metros em torno do ponto denunciado.
 * 4. Calcula o índice delta de perda de biomassa (ex: NDVI antes vs depois).
 * 5. Se houver sobreposição e queda de NDVI > 30%:
 *    - Atualiza status para 'VALIDADO_COM_EVIDENCIA'
 *    - Salva índice de confiança (ex: 94.5%) e ID do polígono de satélite.
 */

import { db } from '../server';

interface ValidationJobPayload {
  denunciaId: string;
  latitude: number;
  longitude: number;
  categoriaId: number;
}

/**
 * Consulta a API externa de observação da Terra (Sentinel-2 / MapBiomas)
 */
async function queryExternalSatelliteProvider(lat: number, lon: number) {
  // Simulação de chamada HTTP REST para o endpoint do MapBiomas Alertas / Copernicus
  // const res = await axios.get('https://plataforma.alerta.mapbiomas.org/api/v1/alerts/nearby', {
  //   params: { lat, lon, radius_meters: 500, days: 30 }
  // });

  // Mock de detecção geoespacial com dados determinísticos realistas:
  // Se estiver na Amazônia/Cerrado crítico (coordenadas entre -3 e -15 lat e -70 e -50 lon)
  const isAmazonRegion = lat <= -4 && lat >= -13 && lon <= -55 && lon >= -65;

  if (isAmazonRegion) {
    return {
      alertaDetectado: true,
      provider: 'Sentinel-2 L2A + MapBiomas Alertas',
      alertaId: \`MB-ALERTA-2026-\${Math.floor(1000 + Math.random() * 9000)}\`,
      distanciaBufferMetros: 120, // Dentro do raio de 500m
      deltaNDVI: -0.47,           // Redução severa de índice de vegetação
      confiancaCalculada: 94.8,   // Confiança de 94.8%
      dataAlerta: new Date().toISOString(),
    };
  }

  // Caso padrão sem alerta recente de satélite
  return {
    alertaDetectado: false,
    provider: 'Copernicus Sentinel-2',
    alertaId: null,
    distanciaBufferMetros: null,
    deltaNDVI: -0.05,
    confiancaCalculada: 15.0,
    dataAlerta: null,
  };
}

export async function enqueueSatelliteValidation(payload: ValidationJobPayload) {
  // Em produção, isso é despachado em uma fila Redis/BullMQ:
  // await satelliteQueue.add('validate-evidence', payload);

  // Execução da rotina assíncrona:
  setTimeout(async () => {
    try {
      const satelliteResult = await queryExternalSatelliteProvider(payload.latitude, payload.longitude);

      if (satelliteResult.alertaDetectado && satelliteResult.confiancaCalculada >= 70) {
        // Validação Positiva Automática
        await db.query(\`
          UPDATE denuncias
          SET 
            status_id = 2, -- 2: VALIDADO_COM_EVIDENCIA
            confianca_satelite = $1,
            alerta_satelite_id = $2,
            provedor_satelite = $3
          WHERE id = $4
        \`, [
          satelliteResult.confiancaCalculada,
          satelliteResult.alertaId,
          satelliteResult.provider,
          payload.denunciaId
        ]);
        console.log(\`[EcoRadar Satellite] Denúncia \${payload.denunciaId} validada com sucesso via \${satelliteResult.provider}\`);
      } else {
        // Sem evidência conclusiva direta por satélite -> Permanece em análise para averiguação
        await db.query(\`
          UPDATE denuncias
          SET 
            status_id = 3, -- 3: EVIDENCIA_INCONCLUSIVA / AGUARDA_AUDITORIA
            confianca_satelite = $1
          WHERE id = $2
        \`, [satelliteResult.confiancaCalculada, payload.denunciaId]);
      }
    } catch (err) {
      console.error('[EcoRadar Satellite] Falha no job de satélite:', err);
    }
  }, 1200);
}`,

  // 4. PostgreSQL + PostGIS SQL Scripts
  postgisSqlScripts: `-- ====================================================================
-- BANCO DE DADOS GEOESPACIAL: ECORADAR MVP
-- Engine: PostgreSQL 16 + PostGIS 3.4
-- SRID: EPSG:4326 (WGS 84 - Coordenadas Geodésicas Padrão GPS)
-- ====================================================================

-- 1. Habilita a extensão geoespacial PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Tabela de Categorias de Crimes Ambientais
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(60) UNIQUE NOT NULL,
    severidade VARCHAR(20) DEFAULT 'ALTA' CHECK (severidade IN ('MEDIA', 'ALTA', 'CRITICA')),
    descricao TEXT
);

-- 3. Tabela de Status de Auditoria da Denúncia
CREATE TABLE IF NOT EXISTS status_denuncia (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(40) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

INSERT INTO status_denuncia (id, codigo, nome) VALUES
(1, 'RECEBIDO', 'Recebido / Aguardando Cruzamento Satelital'),
(2, 'VALIDADO_COM_EVIDENCIA', 'Validado com Evidência de Degradação por Satélite'),
(3, 'EM_AUDITORIA_TERRESTRE', 'Evidência Inconclusiva / Encaminhado para Auditoria'),
(4, 'REJEITADO', 'Falso Positivo / Rejeitado')
ON CONFLICT (id) DO NOTHING;

-- 4. Tabela Principal de Denúncias
-- Usa o tipo GEOMETRY(Point, 4326) para indexação espacial R-Tree
CREATE TABLE IF NOT EXISTS denuncias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coordenadas GEOMETRY(Point, 4326) NOT NULL,
    categoria_id INT NOT NULL REFERENCES categorias(id),
    midia_hash VARCHAR(64) NOT NULL, -- SHA-256 da imagem sanitizada
    status_id INT NOT NULL DEFAULT 1 REFERENCES status_denuncia(id),
    descricao TEXT,
    confianca_satelite NUMERIC(5,2), -- Ex: 94.80%
    alerta_satelite_id VARCHAR(100),
    provedor_satelite VARCHAR(100),
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice Espacial GiST para consultas de raio e sobreposição com latência sub-milissegundo
CREATE INDEX IF NOT EXISTS idx_denuncias_coordenadas 
    ON denuncias USING GIST (coordenadas);

-- Índice temporal para queries filtradas por período
CREATE INDEX IF NOT EXISTS idx_denuncias_data 
    ON denuncias (data_criacao DESC);

-- 5. Tabela de Empresas e Propriedades Rurais em Risco
-- Contém a geometria vetorial oficial de imóveis rurais (dados do CAR - Cadastro Ambiental Rural)
CREATE TABLE IF NOT EXISTS empresas_risco (
    id SERIAL PRIMARY KEY,
    cnpj_responsavel VARCHAR(18) NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    codigo_car VARCHAR(64) UNIQUE NOT NULL,
    geometria_propriedade GEOMETRY(MultiPolygon, 4326) NOT NULL,
    bioma VARCHAR(50),
    embargo_ibama BOOLEAN DEFAULT FALSE,
    data_sincronizacao TIMESTAMPTZ DEFAULT NOW()
);

-- Índice Espacial GiST para polígonos de fazendas e concessões minerárias
CREATE INDEX IF NOT EXISTS idx_empresas_geometria 
    ON empresas_risco USING GIST (geometria_propriedade);

-- Índice em CNPJ para joins fiscais e jurídicos
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj 
    ON empresas_risco (cnpj_responsavel);`,

  // 4. Spatial Overlap Query
  spatialQueriesSql: `-- ====================================================================
-- QUERY 1: SOBREPOSIÇÃO ESPACIAL DIRETA (ST_Contains)
-- Identifica qual empresa/propriedade cadastrada no CAR é a dona da terra
-- onde o crime ambiental foi denunciado.
-- ====================================================================

SELECT 
    d.id AS denuncia_id,
    d.data_criacao,
    c.nome AS crime,
    d.confianca_satelite,
    e.razao_social AS empresa_responsavel,
    e.cnpj_responsavel,
    e.codigo_car,
    e.embargo_ibama,
    ST_AsText(d.coordenadas) AS ponto_infracao
FROM denuncias d
JOIN categorias c ON c.id = d.categoria_id
JOIN empresas_risco e ON ST_Contains(e.geometria_propriedade, d.coordenadas)
WHERE d.id = '88f2b842-1209-4ce4-8931-a89e90099411';


-- ====================================================================
-- QUERY 2: SOBREPOSIÇÃO POR PROXIMIDADE / BUFFER DE IMPACTO (ST_DWithin)
-- Para casos como contaminação de rios ou fumaça de queimada onde o crime
-- ocorreu nas imediações (raio de 1.000 metros) de propriedades corporativas.
-- Utiliza ::geography para cálculo métrico real em metros.
-- ====================================================================

SELECT 
    d.id AS denuncia_id,
    e.razao_social AS empresa_proxima,
    e.cnpj_responsavel,
    e.codigo_car,
    ROUND(ST_Distance(d.coordenadas::geography, e.geometria_propriedade::geography)) AS distancia_metros
FROM denuncias d
JOIN empresas_risco e 
    ON ST_DWithin(d.coordenadas::geography, e.geometria_propriedade::geography, 1000)
WHERE d.id = '88f2b842-1209-4ce4-8931-a89e90099411'
ORDER BY distancia_metros ASC
LIMIT 3;


-- ====================================================================
-- QUERY 3: RELATÓRIO ANALÍTICO DE REINCIDÊNCIA CORPORATIVA
-- Agrupa denúncias validadas por CNPJ nos últimos 12 meses
-- ====================================================================

SELECT 
    e.cnpj_responsavel,
    e.razao_social,
    e.codigo_car,
    e.bioma,
    COUNT(d.id) AS total_denuncias_validadas,
    ROUND(AVG(d.confianca_satelite), 2) AS confianca_media_satelite,
    ARRAY_AGG(DISTINCT c.nome) AS crimes_cometidos
FROM empresas_risco e
JOIN denuncias d ON ST_Contains(e.geometria_propriedade, d.coordenadas)
JOIN categorias c ON c.id = d.categoria_id
WHERE d.status_id = 2 -- VALIDADO_COM_EVIDENCIA
  AND d.data_criacao >= NOW() - INTERVAL '365 days'
GROUP BY e.cnpj_responsavel, e.razao_social, e.codigo_car, e.bioma
ORDER BY total_denuncias_validadas DESC;`,

  // 5. Guia de Implementação e Deploy
  dockerCompose: `version: '3.8'

services:
  # Banco de Dados Geoespacial PostgreSQL com Extensão PostGIS
  db:
    image: postgis/postgis:16-3.4-alpine
    container_name: ecoradar-db
    restart: always
    environment:
      POSTGRES_USER: ecoradar_admin
      POSTGRES_PASSWORD: ecoradar_secret_pass
      POSTGRES_DB: ecoradar_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ecoradar_admin -d ecoradar_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Redis para Fila Assíncrona de Processamento de Satélite (BullMQ)
  redis:
    image: redis:7-alpine
    container_name: ecoradar-redis
    restart: always
    ports:
      - "6379:6379"

  # MinIO (Object Storage compatível com AWS S3 para mídia sanitizada)
  minio:
    image: minio/minio:RELEASE.2024-03-30T09-41-56Z
    container_name: ecoradar-minio
    restart: always
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio_admin
      MINIO_ROOT_PASSWORD: minio_secret_key_2026
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  # Backend REST API Node.js / Express
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ecoradar-api
    restart: always
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    environment:
      NODE_ENV: development
      PORT: 3000
      DATABASE_URL: postgresql://ecoradar_admin:ecoradar_secret_pass@db:5432/ecoradar_db
      REDIS_URL: redis://redis:6379
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: minio_admin
      MINIO_SECRET_KEY: minio_secret_key_2026
      SENTINEL_HUB_API_KEY: \${SENTINEL_HUB_API_KEY:-mock_key}
      MAPBIOMAS_API_KEY: \${MAPBIOMAS_API_KEY:-mock_key}
    ports:
      - "3000:3000"

volumes:
  postgres_data:
  minio_data:`,

  // 5. Env Example
  envExample: `# ===================================================================
# ARQUIVO DE CONFIGURAÇÃO DE AMBIENTE: .env
# EcoRadar MVP - Backend & Microserviços
# ===================================================================

# Servidor e Porta
PORT=3000
NODE_ENV=development

# Conexão PostgreSQL + PostGIS
DATABASE_URL=postgresql://ecoradar_admin:ecoradar_secret_pass@localhost:5432/ecoradar_db

# Fila e Cache Redis
REDIS_URL=redis://localhost:6379

# Object Storage S3 / MinIO (Mídia Higienizada)
S3_ENDPOINT=http://localhost:9000
S3_BUCKET_NAME=ecoradar-evidencias
S3_ACCESS_KEY=minio_admin
S3_SECRET_KEY=minio_secret_key_2026
S3_REGION=us-east-1

# Provedores de Satélite & Geodados
SENTINEL_HUB_INSTANCE_ID=your_sentinel_hub_instance_id
SENTINEL_HUB_API_KEY=sh_api_key_xxxxxxxxxxxxx
MAPBIOMAS_ALERTAS_TOKEN=mb_token_xxxxxxxxxxxx
MAPBOX_PUBLIC_TOKEN=pk.eyJ1IjoiZWNvcmFkYXIiLCJhIjoiY2x4xxxxxxxxxxxxxxx

# Taxa de Anonimização (Rate Limit)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30`,

  // 5. Step by Step Guide
  deployStepByStep: `# ===================================================================
# GUIA DE DEPLOY E EXECUÇÃO PARA DESENVOLVEDOR JÚNIOR
# ===================================================================

# 1. Clonar o repositório do projeto
git clone https://github.com/ecoradar-org/ecoradar-mvp.git
cd ecoradar-mvp

# 2. Configurar as variáveis de ambiente locais
cp .env.example .env

# 3. Subir a infraestrutura em containers (PostgreSQL+PostGIS, Redis, MinIO)
docker compose up -d db redis minio

# 4. Verificar se o PostGIS está ativo e saudável
docker compose ps
docker exec -it ecoradar-db psql -U ecoradar_admin -d ecoradar_db -c "SELECT PostGIS_Version();"

# 5. Instalar dependências e migrar o banco de dados
cd backend
npm install
npm run migrate:up
npm run seed:car_polygons   # Popula mock dos polígonos de fazendas do CAR

# 6. Iniciar o servidor de desenvolvimento
npm run dev

# 7. Executar os testes automatizados da API e do Sanitizador EXIF
npm test

# 8. Executar o App Mobile (React Native) em outro terminal
cd ../mobile
npm install
npx expo start --android    # ou npx react-native run-android`,
};
