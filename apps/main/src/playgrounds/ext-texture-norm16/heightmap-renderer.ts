export type TextureFormat = 'r8' | 'r16f' | 'r16';

type HeightRange = {
  low: number;
  high: number;
};

const SIZE = 256;
const MAX_UINT16 = 65_535;
const BASE_HEIGHT = 32_768;
const RELIEF = 150;

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform highp sampler2D u_heights;
uniform float u_low;
uniform float u_high;
in vec2 v_uv;
out vec4 outColor;

void main() {
  float height = texture(u_heights, v_uv).r;
  float shade = (height - u_low) / (u_high - u_low);
  outColor = vec4(vec3(shade), 1.0);
}`;

// 高さ32768の平地に、小さな丘とくぼみがある16bitの高さデータ
const createHeights = (): Uint16Array => {
  const heights = new Uint16Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const u = x / (SIZE - 1);
      const v = y / (SIZE - 1);
      const hill = Math.exp(-((u - 0.35) ** 2 + (v - 0.4) ** 2) / 0.04);
      const hollow = Math.exp(-((u - 0.7) ** 2 + (v - 0.65) ** 2) / 0.03);
      heights[y * SIZE + x] = Math.round(
        BASE_HEIGHT + RELIEF * (hill - 0.7 * hollow),
      );
    }
  }
  return heights;
};

const HEIGHTS = createHeights();

const findRange = (heights: Uint16Array): HeightRange => {
  let low = MAX_UINT16;
  let high = 0;
  for (const height of heights) {
    low = Math.min(low, height);
    high = Math.max(high, height);
  }
  return { low, high };
};

// くぼみの底を黒、丘のてっぺんを白にして描く
export const terrainRange: HeightRange = findRange(HEIGHTS);

const uploadHeights = (
  gl: WebGL2RenderingContext,
  format: TextureFormat,
  heights: Uint16Array,
): boolean => {
  switch (format) {
    case 'r8': {
      const data = Uint8Array.from(heights, (height) =>
        Math.round((height / MAX_UINT16) * 255),
      );
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.R8,
        SIZE,
        SIZE,
        0,
        gl.RED,
        gl.UNSIGNED_BYTE,
        data,
      );
      return true;
    }
    case 'r16f': {
      const data = Float32Array.from(heights, (height) => height / MAX_UINT16);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.R16F,
        SIZE,
        SIZE,
        0,
        gl.RED,
        gl.FLOAT,
        data,
      );
      return true;
    }
    case 'r16': {
      const ext = gl.getExtension('EXT_texture_norm16');
      if (ext === null) return false;
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        ext.R16_EXT,
        SIZE,
        SIZE,
        0,
        gl.RED,
        gl.UNSIGNED_SHORT,
        heights,
      );
      return true;
    }
  }
};

const compileShader = (
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string,
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (shader === null) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== true) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const createProgram = (gl: WebGL2RenderingContext): WebGLProgram | null => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (vertexShader === null || fragmentShader === null) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.deleteProgram(program);
    return null;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (gl.getProgramParameter(program, gl.LINK_STATUS) !== true) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
};

export const heightmapSize = SIZE;

// canvasに描き、使ったWebGLの資源を片付ける関数を返す
export const drawHeightmap = (
  canvas: HTMLCanvasElement,
  format: TextureFormat,
): (() => void) => {
  const gl = canvas.getContext('webgl2');
  if (gl === null) return () => {};

  const program = createProgram(gl);
  if (program === null) return () => {};

  const vertexArray = gl.createVertexArray();
  gl.bindVertexArray(vertexArray);
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const dispose = (): void => {
    gl.deleteTexture(texture);
    gl.deleteBuffer(positionBuffer);
    gl.deleteVertexArray(vertexArray);
    gl.deleteProgram(program);
  };

  if (!uploadHeights(gl, format, HEIGHTS)) {
    dispose();
    return () => {};
  }

  gl.useProgram(program);
  gl.uniform1f(
    gl.getUniformLocation(program, 'u_low'),
    terrainRange.low / MAX_UINT16,
  );
  gl.uniform1f(
    gl.getUniformLocation(program, 'u_high'),
    terrainRange.high / MAX_UINT16,
  );
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  return dispose;
};
