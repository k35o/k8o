'use client';

import { Code } from '@k8ordo/ui';
import { useCallback } from 'react';

import {
  drawHeightmap,
  heightmapSize,
  terrainRange,
} from './heightmap-renderer';
import type { TextureFormat } from './heightmap-renderer';

import styles from './ext-texture-norm16-demo.module.css';

const PANELS = [
  { format: 'r8', name: 'R8', description: '8bitの正規化形式' },
  { format: 'r16f', name: 'R16F', description: '16bitの浮動小数点数' },
  { format: 'r16', name: 'R16_EXT', description: '16bitの正規化形式' },
] as const satisfies ReadonlyArray<{
  format: TextureFormat;
  name: string;
  description: string;
}>;

const LOW = String(terrainRange.low);
const HIGH = String(terrainRange.high);

const UPLOAD_PSEUDO_CODE = `// 256×256画素の高さを、1画素16bitの整数（0〜65535）で並べた配列
// 中身は高さ32768の平地に小さな丘とくぼみがある地形で、
// くぼみの底が${LOW}、丘のてっぺんが${HIGH}
const heights = new Uint16Array(256 * 256);

// R8: 0〜255に丸めて、Uint8Arrayで渡す
const r8 = Uint8Array.from(heights, (h) => Math.round((h / 65535) * 255));
gl.texImage2D(..., gl.R8, ..., gl.UNSIGNED_BYTE, r8);

// R16F: 0.0〜1.0の小数にして、Float32Arrayで渡す
const r16f = Float32Array.from(heights, (h) => h / 65535);
gl.texImage2D(..., gl.R16F, ..., gl.FLOAT, r16f);

// R16_EXT: Uint16Arrayのまま渡す
const ext = gl.getExtension('EXT_texture_norm16');
gl.texImage2D(..., ext.R16_EXT, ..., gl.UNSIGNED_SHORT, heights);`;

const SHADER_EXCERPT = `// テクスチャから高さを0.0〜1.0の小数で読む
float height = texture(u_heights, v_uv).r;
// くぼみの底(low)を黒の0.0、丘のてっぺん(high)を白の1.0にする
// low・highも、くぼみの底と丘のてっぺんを65535で割った0.0〜1.0の値
float shade = (height - low) / (high - low);`;

function HeightmapPanel({
  format,
  name,
  description,
}: {
  format: TextureFormat;
  name: string;
  description: string;
}) {
  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => drawHeightmap(canvas, format),
    [format],
  );

  return (
    <figure className={styles.panel}>
      <canvas
        aria-label={`${name}のテクスチャに入れた高さデータ`}
        className={styles.canvas}
        height={heightmapSize}
        ref={canvasRef}
        role="img"
        width={heightmapSize}
      />
      <figcaption className={styles.caption}>
        <Code>{name}</Code>
        <span>{description}</span>
      </figcaption>
    </figure>
  );
}

export function ExtTextureNorm16Demo() {
  return (
    <div className={styles.root}>
      <div className={styles.section}>
        <p className={styles.note}>
          くぼみの底（{LOW}）を黒、丘のてっぺん（{HIGH}）を白にして描いています
        </p>
        <div className={styles.panels}>
          {PANELS.map((panel) => (
            <HeightmapPanel key={panel.format} {...panel} />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.heading}>
          テクスチャへの入れ方（JavaScriptの擬似コード）
        </p>
        <pre className={styles.code}>
          <code>{UPLOAD_PSEUDO_CODE}</code>
        </pre>
      </div>

      <div className={styles.section}>
        <p className={styles.heading}>3つに共通のシェーダー（GLSLの抜粋）</p>
        <pre className={styles.code}>
          <code>{SHADER_EXCERPT}</code>
        </pre>
      </div>
    </div>
  );
}
