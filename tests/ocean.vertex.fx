precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform float time;
uniform float chopyness;
uniform float size;

// Varying
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;
varying float t;
//float chopyness = 5.0;
//float size = 1.0;

void main(void) {
    vec3 v = position;
    v.y += sin(chopyness * position.z + (time)) * size*2.0 + sin(chopyness*2.0 * position.x + (time)) * size;
    
    gl_Position = worldViewProjection * vec4(v, 1.0);
    t = time;
    vPosition = position;
    vNormal = normal;
    vUV = uv;
}