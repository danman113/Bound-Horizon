precision highp float;

// Varying
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;
varying float t;

// Uniforms
uniform mat4 world;
uniform float vScale;
uniform vec3 lightPos;

// Refs
uniform vec3 cameraPosition;
uniform sampler2D textureSampler;
float sunRadius = 4.;
float sunSize = (1.0*1000.)/sunRadius;
vec3 sunDirection = vec3(0,1,0)*2000.;

void main(void) {
    vec2 xy = vUV;
    float uTime = t;
    float undulate = sin(uTime)*0.4;
    vec2 phase = vec2(xy.x*vScale+undulate,xy.y*vScale+undulate);
    vec3 vLightPosition = sunDirection + cameraPosition;
    
    // World values
    vec3 vPositionW = vec3(world * vec4(vPosition, 1.0));
    vec3 vNormalW = normalize(vec3(world * vec4(vNormal, 0.0)));
    vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
    
    // Light
    vec3 lightVectorW = normalize(vLightPosition - vPositionW);
    vec3 color = texture2D(textureSampler, phase).rgb;
    
    // diffuse
    float ndl = max(0.0, dot(vNormalW, lightVectorW));
    
    // Specular
    vec3 angleW = normalize(viewDirectionW + lightVectorW);
    float specComp = max(0., dot(vNormalW, angleW));
    specComp = pow(specComp, max(1., sunSize)) * 2.;
    
    gl_FragColor = vec4(color * ndl + vec3(specComp), 1.);
}