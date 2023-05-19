const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) { return null; }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }

  console.warn(gl.getShaderInfoLog(shader));

  gl.deleteShader(shader);
  return null;
};
export const createVertexShader = (gl: WebGLRenderingContext, source: string): ReturnType<typeof createShader> => {
  return createShader(gl, gl.VERTEX_SHADER, source);
};
export const createFragmentShader = (gl: WebGLRenderingContext, source: string): ReturnType<typeof createShader> => {
  return createShader(gl, gl.FRAGMENT_SHADER, source);
};

export const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null => {
  const program = gl.createProgram();
  if (!program) { return null; }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program;
  }

  console.warn(gl.getProgramInfoLog(program))

  gl.deleteProgram(program);
  return null;
};

export const createTexture = (gl: WebGLRenderingContext, type: number): WebGLTexture | null => {
  const texture = gl.createTexture();
  if (!texture) { return null; }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, type);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, type);
  // Unbind Texture
  gl.bindTexture(gl.TEXTURE_2D, null);

  return texture;
};
export const fillEmptyTexture = (gl: WebGLRenderingContext, texture: WebGLTexture, width: number, height: number): void => {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

export const createRectangleBuffer = (gl: WebGLRenderingContext, sx: number, sy: number, dx: number, dy: number): WebGLBuffer | null => {
  const buffer = gl.createBuffer();
  if (!buffer) { return null; }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    sx, sy,
    dx, sy,
    sx, dy,
    sx, dy,
    dx, sy,
    dx, dy
  ]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buffer;
};

export const enableVertexAttribArray = (gl: WebGLRenderingContext, name: string, program: WebGLProgram, buffer: WebGLBuffer) => {
  const location = gl.getAttribLocation(program, name);
  gl.enableVertexAttribArray(location)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
};

export type TextureData = {
  texture: WebGLTexture;
  width: number;
  height: number;
}