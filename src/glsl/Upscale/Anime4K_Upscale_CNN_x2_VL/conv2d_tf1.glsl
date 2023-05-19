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

precision mediump float;

uniform sampler2D MAIN;
uniform vec2 u_resolution;
uniform vec2 u_texture_size;

varying vec2 v_texture_coord;

#define MAIN_pos (v_texture_coord)
#define MAIN_tex(pos) (texture2D(MAIN, pos))
#define MAIN_size (u_texture_size)
#define MAIN_pt (1.0 / MAIN_size)
#define MAIN_texOff(offset) (MAIN_tex(MAIN_pos + MAIN_pt * offset))

#define go_0(x_off, y_off) (MAIN_texOff(vec2(x_off, y_off)))
void main() {
  vec4 result = mat4(-0.112743355, 0.0422517, 0.21350034, -0.0967133, 0.16265953, 0.0022497, 0.015078242, 0.08204187, 0.035236806, -0.0468228, -0.09464228, -0.001864949, 0.0, 0.0, 0.0, 0.0) * go_0(-1.0, -1.0);
  result += mat4(0.25631642, -0.41485596, -0.16662048, 0.13201024, 0.057921384, 0.2240005, -0.30038536, -0.08305622, 0.2228756, 0.32263795, 0.10608189, -0.18616734, 0.0, 0.0, 0.0, 0.0) * go_0(-1.0, 0.0);
  result += mat4(0.08997524, 0.11516871, 0.19212262, -0.035154644, 0.11612274, -0.04056247, 0.14974374, 0.029173585, -0.07629641, -0.14353512, 0.041081246, 0.20230265, 0.0, 0.0, 0.0, 0.0) * go_0(-1.0, 1.0);
  result += mat4(0.2262286, 0.055954933, -0.14499907, 0.17314723, 0.16590612, -0.06688698, -0.11118816, -0.012938116, -0.043101817, 0.026133137, 0.2958395, 0.06543993, 0.0, 0.0, 0.0, 0.0) * go_0(0.0, -1.0);
  result += mat4(-0.07311521, -0.3041244, -0.47978505, -0.6350967, -0.17432262, 0.34965977, 0.25399777, -0.16590433, -0.49957857, 0.0549526, -0.40869385, -0.08780993, 0.0, 0.0, 0.0, 0.0) * go_0(0.0, 0.0);
  result += mat4(-0.3014447, -0.00021343959, -0.14953177, 0.028001398, -0.14931908, -0.14910097, -0.13287953, -0.45026535, 0.17378895, 0.024704922, -0.027308129, -0.10292025, 0.0, 0.0, 0.0, 0.0) * go_0(0.0, 1.0);
  result += mat4(-0.06732655, -0.13119644, 0.066014715, 0.081011154, -0.15154321, 0.2407805, 0.07733481, 0.12312706, 0.1741804, 0.008495716, -0.14125362, -0.043644864, 0.0, 0.0, 0.0, 0.0) * go_0(1.0, -1.0);
  result += mat4(0.11465958, 0.42001364, 0.011069392, 0.3203028, -0.058801666, -0.37830314, -0.030540617, 0.2245139, -0.11310525, -0.14845212, 0.19957744, 0.25789997, 0.0, 0.0, 0.0, 0.0) * go_0(1.0, 0.0);
  result += mat4(-0.16037206, 0.21326372, 0.020099448, 0.018666709, 0.122083254, -0.16033986, -0.10725163, 0.2556128, 0.1650688, -0.10475823, 0.048623525, -0.103755645, 0.0, 0.0, 0.0, 0.0) * go_0(1.0, 1.0);
  result += vec4(0.007717166, -0.027800834, 0.0795002, 0.0053199283);
  gl_FragColor = result;
}
