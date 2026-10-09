import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'EcoRadar - Arquitetura Técnica & MVP Workbench',
  description: 'Especificação técnica completa, arquitetura de sistemas cloud, mocks de código React Native/Node.js/PostGIS e simulador interativo para a plataforma EcoRadar.',
  openGraph: {
    title: 'EcoRadar - Arquitetura Técnica & MVP Workbench',
    description: 'Especificação técnica completa, arquitetura de sistemas cloud, mocks de código React Native/Node.js/PostGIS e simulador interativo para a plataforma EcoRadar.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EcoRadar - Arquitetura Técnica & MVP Workbench',
    description: 'Especificação técnica completa, arquitetura de sistemas cloud, mocks de código React Native/Node.js/PostGIS e simulador interativo para a plataforma EcoRadar.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
