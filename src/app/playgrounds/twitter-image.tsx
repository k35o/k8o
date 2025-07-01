import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Playgrounds | K8O';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background:
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          flexDirection: 'column',
        }}
      >
        <div style={{ marginBottom: 20 }}>🎮</div>
        <div style={{ textAlign: 'center' }}>Playgrounds</div>
        <div
          style={{
            fontSize: 24,
            opacity: 0.8,
            textAlign: 'center',
            marginTop: 20,
          }}
        >
          インタラクティブなWeb技術のデモ集
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
