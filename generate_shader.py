#!/usr/bin/env python3

import argparse
from pathlib import Path

import os
from typing import TextIO

import re
from textwrap import indent

VIRT = '''
precision mediump float;

attribute vec2 a_position;
attribute vec2 a_texture_coord;

uniform vec2 u_resolution;

varying vec2 v_texture_coord;

void main() {
  vec2 zeroToOne = a_position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, 1), 0, 1);

  v_texture_coord = a_texture_coord;
}
'''

class Program:
  def __init__(self, desc):
    self.desc: str = desc
    self.hook: str = ''
    self.bind: list[str] = []
    self.save: str | None = None
    self.width: list[str] = []
    self.height: list[str] = []
    self.when: list[str] = []
    self.shader: str = ''

  def is_vaild(self):
    if not self.hook: return False
    if not self.save: return False
    return True

  def set_hook(self, name: str):
    self.hook: str = name
  def get_hook(self):
    return self.hook

  def add_bind(self, bind: str):
    self.bind.append(bind)
  def get_bind(self):
    return self.bind

  def set_save(self, save: str):
    self.save = save
  def get_save(self):
    return self.save or self.hook

  def set_width(self, width: list[str]):
    self.width = width
  def get_width(self):
    if len(self.width) == 0: return f'({self.get_hook()}.width)'
    if len(self.width) == 1:
      width = self.width[0]
      width = width + 'idth' if width.endswith('.w') else width
      width = width + 'eight' if width.endswith('.h') else width
      self.width[0] = width
      return width
    stack = list()
    while len(self.width) > 0:
      arg: str = self.width.pop(0)
      if arg == '*':
        snd = stack.pop(-1)
        fst = stack.pop(-1)
        stack.append(f'({fst} * {snd})')
      elif arg == '/':
        snd = stack.pop(-1)
        fst = stack.pop(-1)
        stack.append(f'({fst} / {snd})')
      else:
        arg = arg + 'idth' if arg.endswith('.w') else arg
        arg = arg + 'eight' if arg.endswith('.h') else arg
        stack.append(arg)
    self.width = stack
    return self.width[0]

  def set_height(self, height: list[str]):
    self.height = height
  def get_height(self):
    if len(self.height) == 0: return f'({self.get_hook()}.height)'
    if len(self.height) == 1:
      height = self.height[0]
      height = height + 'idth' if height.endswith('.w') else height
      height = height + 'eight' if height.endswith('.h') else height
      self.height[0] = height
      return height
    stack = list()
    while len(self.height) > 0:
      arg = self.height.pop(0)
      if arg == '*':
        snd = stack.pop(-1)
        fst = stack.pop(-1)
        stack.append(f'({fst} * {snd})')
      elif arg == '/':
        snd = stack.pop(-1)
        fst = stack.pop(-1)
        stack.append(f'({fst} / {snd})')
      else:
        arg = arg + 'idth' if arg.endswith('.w') else arg
        arg = arg + 'eight' if arg.endswith('.h') else arg
        stack.append(arg)
    self.height = stack
    return self.height[0]

  def set_when(self, when: list[str]):
    self.when = when
  def get_when_cond(self):
    if len(self.when) == 0: return ''
    if len(self.when) == 1:
      when = self.when[0]
      when = when + 'idth' if when.endswith('.w') else when
      when = when + 'eight' if when.endswith('.h') else when
      self.when[0] = when
      return self.when[0]
    stack = list()
    while len(self.when) > 0:
      arg = self.when.pop(0)
      if arg == '*':
        snd = stack.pop(-1)
        fst = stack.pop(-1)
        stack.append(f'({fst} && {snd})')
      elif arg == '/':
        snd = stack.pop(-1)
        fst = stack.pop(-1)
        stack.append(f'({fst} / {snd})')
      elif arg == '<':
        snd = stack.pop(-1)
        fst = stack.pop(-1)
        stack.append(f'({fst} < {snd})')
      elif arg == '>':
        snd = stack.pop(-1)
        fst = stack.pop(-1)
        stack.append(f'({fst} > {snd})')
      else:
        arg = arg + 'idth' if arg.endswith('.w') else arg
        arg = arg + 'eight' if arg.endswith('.h') else arg
        stack.append(arg)
    self.when = stack
    return self.when[0]

  def append_shader(self, line):
    self.shader += line

  def __str__(self):
    head = """
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_texture_size;
varying vec2 v_texture_coord;
""".lstrip()
    textures = '\n'.join([f"""
uniform sampler2D {bind};
#define {bind}_pos (v_texture_coord)
#define {bind}_tex(pos) (texture2D({bind}, pos))
#define {bind}_size (u_texture_size)
#define {bind}_pt (1.0 / {bind}_size)
#define {bind}_texOff(offset) ({bind}_tex({bind}_pos + {bind}_pt * offset))
""".lstrip() for bind in self.get_bind()]) + '\n'

    replaced = self.shader.replace('vec4 hook', 'void main').replace('float c3 = c2', 'float c3 = 0.0').replace('HOOKED', self.hook).replace('PREKERNEL_tex(PREKERNEL_pos) - (current_luma - new_luma);', 'vec4((PREKERNEL_tex(PREKERNEL_pos) - (current_luma - new_luma)).rgb, 1);').split('\n')
    body = '\n'.join(replaced[:-4]) + '\n' + '\n'.join(replaced[-4:]).replace('return', 'gl_FragColor =')
    body = re.sub(r'\s*float c(\d) = (.*)\[.*\]', indent("""
float c\\1 = 0.0;
if (i\\1.y * 2 + i\\1.x == 0) {
  c\\1 = \\2[0];
} else if (i\\1.y * 2 + i\\1.x == 1) {
  c\\1 = \\2[1];
} else if (i\\1.y * 2 + i\\1.x == 2) {
  c\\1 = \\2[2];
} else if (i\\1.y * 2 + i\\1.x == 3) {
  c\\1 = \\2[3];
}
""".rstrip(), '  '), body)

    return head + textures + body

def prepareTextures(program: Program):
  return f"""
const HOOKED = textures.get('{program.get_hook()}');
if (!HOOKED) {{ return; }}
""".strip() + '\n' + '\n'.join([ f"""
const {bind} = textures.get('{bind}');
if (!{bind}) {{ return; }}
""".strip() for bind in sorted(list(set(program.get_bind() + [program.get_hook(), 'OUTPUT', 'NATIVE'])))])

def prepareOutputTexture(program: Program, program_index: int):
  return f"""
const output = this.program_{program_index}_intermediate_texture;
fillEmptyTexture(gl, output, {program.get_width()}, {program.get_height()});
gl.viewport(0, 0, {program.get_width()}, {program.get_height()});
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);
""".strip()

def bindTextures(program: Program, program_index: int):
  return '\n'.join([ f"""
gl.activeTexture(gl.TEXTURE{index});
gl.bindTexture(gl.TEXTURE_2D, {bind}.texture);
gl.uniform1i(this.program_{program_index}_{bind}_TextureLocation, {index});
""".strip() for index, bind in enumerate(program.get_bind())])

def unbindTextures(program: Program):
  return '\n'.join([ f"""
gl.activeTexture(gl.TEXTURE{index});
gl.bindTexture(gl.TEXTURE_2D, null);
""".strip() for index, bind in enumerate(program.get_bind())])

def pushOutputTexture(program: Program):
  return f"""
textures.set('{program.get_save()}', {{ texture: output, width: {program.get_width()}, height: {program.get_height()}}});
""".strip()

def generateHook(programs: list[Program], hook: str):
  return '\n'.join([f"""
{{
{ indent(prepareTextures(program), '  ') }
{f'  if ({program.get_when_cond()})' if program.get_when_cond() else ''} {{
{ indent(prepareOutputTexture(program, index), '    ') }

    gl.useProgram(this.program_{index});

    const positionBuffer = createRectangleBuffer(gl, 0, 0, {program.get_width()}, {program.get_height()})!;
    const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

    enableVertexAttribArray(gl, this.program_{index}_a_position_location, positionBuffer);
    enableVertexAttribArray(gl, this.program_{index}_a_texture_coord_location, texcoordBuffer);

    gl.uniform2f(this.program_{index}_u_resolution_location, {program.get_width()}, {program.get_height()});
    gl.uniform2f(this.program_{index}_u_texture_size_location, {program.get_hook()}.width, {program.get_hook()}.height);

{ indent(bindTextures(program, index), '    ') }
    gl.drawArrays(gl.TRIANGLES, 0, 6);
{ indent(unbindTextures(program), '    ') }
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(texcoordBuffer);
{ indent(pushOutputTexture(program), '    ')}
  }}
}}
""".strip() for index, program in enumerate(programs) if program.hook == hook])

if __name__ == '__main__':
  parser = argparse.ArgumentParser(description=('Anime4K.js fragment shader generator'))

  parser.add_argument('-i', '--input', type=argparse.FileType('r'), required=True)
  parser.add_argument('-o', '--output', type=Path, required=True)

  args = parser.parse_args()

  outfile: Path = args.output
  infile: TextIO = args.input
  os.makedirs(outfile.parent, exist_ok=True)

  programs: list[Program] = []
  program: Program | None = None
  for line in infile.readlines():
    if not line.strip(): continue

    if line.startswith('//!'):
      if line.startswith('//!DESC'):
        if program is not None:
          programs.append(program)
        desc = line[len('//!DESC'):].strip()
        program = Program(desc)
      elif line.startswith('//!HOOK'):
        hook = line[len('//!HOOK'):].strip()
        program.set_hook(hook)
      elif line.startswith('//!BIND'):
        bind = line[len('//!BIND'):].strip()
        program.add_bind(bind.replace('HOOKED', program.hook))
      elif line.startswith('//!SAVE'):
        save = line[len('//!SAVE'):].strip()
        program.set_save(save)
      elif line.startswith('//!WIDTH'):
        width = line[len('//!WIDTH'):].strip().split(' ')
        program.set_width(width)
      elif line.startswith('//!HEIGHT'):
        height = line[len('//!HEIGHT'):].strip().split(' ')
        program.set_height(height)
      elif line.startswith('//!WHEN'):
        when = line[len('//!WHEN'):].strip().split(' ')
        program.set_when(when)

    elif program:
      program.append_shader(line.rstrip().replace('  ', ' ').replace('\t', '  ') + '\n')
  if program is not None: programs.append(program)

  with open(outfile, 'w') as out:
    out.write('''
// MIT License

// Copyright (c) 2019-2021 bloc97
// All rights reserved.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

'''.lstrip())
    out.write('import Anime4KShader from "../shader";\n')
    out.write('import { createVertexShader, createFragmentShader, createRectangleBuffer, createTexture, createProgram, enableVertexAttribArray, TextureData, fillEmptyTexture } from "../../utils/index";\n\n')
    out.write(f'const vertex_shader = `{VIRT}`;\n')
    for index, program in enumerate(programs):
      out.write(f'const fragment_{index}_shader = `\n{program}`;\n')
    webgl_programs_declare = '\n'.join([ f'private program_{index}: WebGLProgram;' for index in range(len(programs)) ])
    webgl_program_intermediate_texture_declare = '\n'.join([ f'private program_{index}_intermediate_texture: WebGLProgram;' for index in range(len(programs)) ])
    webgl_program_a_position_location_declare = '\n'.join([ f'private program_{index}_a_position_location: number;' for index in range(len(programs)) ])
    webgl_program_a_texture_coord_location_declare = '\n'.join([ f'private program_{index}_a_texture_coord_location: number;' for index in range(len(programs)) ])
    webgl_program_u_resolution_location_declare = '\n'.join([ f'private program_{index}_u_resolution_location: WebGLUniformLocation | null;' for index in range(len(programs)) ])
    webgl_program_u_texture_size_location_declare = '\n'.join([ f'private program_{index}_u_texture_size_location: WebGLUniformLocation | null;' for index in range(len(programs)) ])
    webgl_program_u_texture_location_declare = '\n'.join(['\n'.join([ f'private program_{index}_{bind}_TextureLocation: WebGLUniformLocation | null' for bind in program.get_bind()]) for index, program in enumerate(programs)])

    webgl_programs_assign = '\n'.join([ f'this.program_{index} = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_{index}_shader)!)!;' for index in range(len(programs)) ])
    webgl_program_intermediate_texture_assign = '\n'.join([ f'this.program_{index}_intermediate_texture = createTexture(gl, gl.NEAREST)!;' for index in range(len(programs)) ])
    webgl_program_a_position_location_assign = '\n'.join([ f'this.program_{index}_a_position_location = gl.getAttribLocation(this.program_{index}, "a_position");\ngl.enableVertexAttribArray(this.program_{index}_a_position_location);' for index in range(len(programs))])
    webgl_program_a_texture_coord_location_assign = '\n'.join([ f'this.program_{index}_a_texture_coord_location = gl.getAttribLocation(this.program_{index}, "a_texture_coord");\ngl.enableVertexAttribArray(this.program_{index}_a_texture_coord_location);' for index in range(len(programs)) ])
    webgl_program_u_resolution_location_assign = '\n'.join([ f'this.program_{index}_u_resolution_location = gl.getUniformLocation(this.program_{index}, "u_resolution");' for index in range(len(programs)) ])
    webgl_program_u_texture_size_location_assign = '\n'.join([ f'this.program_{index}_u_texture_size_location = gl.getUniformLocation(this.program_{index}, "u_texture_size");' for index in range(len(programs)) ])
    webgl_program_u_texture_location_assign = '\n'.join(['\n'.join([ f'this.program_{index}_{bind}_TextureLocation = gl.getUniformLocation(this.program_{index}, "{bind}")' for bind in program.get_bind()]) for index, program in enumerate(programs)])

    webgl_program_MAIN = generateHook(programs, 'MAIN')
    webgl_program_PREKERNEL = generateHook(programs, 'PREKERNEL')

    out.write(
f'''
export default class {outfile.stem.replace('+', '_')} extends Anime4KShader {{
  private gl: WebGLRenderingContext;
{indent(webgl_programs_declare, '  ')}
{indent(webgl_program_intermediate_texture_declare, '  ')}
{indent(webgl_program_a_position_location_declare, '  ')}
{indent(webgl_program_a_texture_coord_location_declare, '  ')}
{indent(webgl_program_u_resolution_location_declare, '  ')}
{indent(webgl_program_u_texture_size_location_declare, '  ')}
{indent(webgl_program_u_texture_location_declare, '  ')}


  public constructor(gl: WebGLRenderingContext) {{
    super();
    this.gl = gl;
{indent(webgl_programs_assign, '    ')}
{indent(webgl_program_intermediate_texture_assign, '    ')}
{indent(webgl_program_a_position_location_assign, '    ')}
{indent(webgl_program_a_texture_coord_location_assign, '    ')}
{indent(webgl_program_u_resolution_location_assign, '    ')}
{indent(webgl_program_u_texture_size_location_assign, '    ')}
{indent(webgl_program_u_texture_location_assign, '    ')}
  }}

  public hook_MAIN(textures: Map<string, TextureData>, framebuffer: WebGLFramebuffer) {{
    const gl = this.gl;
{indent(webgl_program_MAIN, '    ')}
  }}

  public hook_PREKERNEL(textures: Map<string, TextureData>, framebuffer: WebGLFramebuffer) {{
    const gl = this.gl;
{indent(webgl_program_PREKERNEL, '    ')}
  }}
}}
'''
    )
