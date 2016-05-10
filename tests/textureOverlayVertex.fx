precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform float time;

// Varying
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;
varying vec4 vel;

float random(float p) {
  return fract(sin(p)*1.);
}

void main(void) {
	vec4 outPosition = worldViewProjection * vec4(position, 1.0);
    vec3 v = position;
    float chopyness = 5.0;
    float size = 1.0;
    v.y += sin(chopyness * position.z + (time)) * size*2.0 + sin(chopyness*2.0 * position.x + (time)) * size;
    
    gl_Position = worldViewProjection * vec4(v, 1.0);
    vel = outPosition;
    vPosition = position;
    vNormal = normal;
    vUV = uv;
}