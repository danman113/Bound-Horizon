precision highp float;

// Varying
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;
varying vec4 vel;

// Uniforms
uniform mat4 world;

// Refs
uniform vec3 cameraPosition;
uniform sampler2D textureSampler;
float vScale = 3.0;

void main(void) {
    vec2 texCoords;
    texCoords.x = vel.x / vel.w / 2.0 + 0.5;
    texCoords.y = vel.y / vel.w / 2.0 + 0.5;
    vec2 xy = vUV;
    if(xy.x > 0.5) xy.y += 0.25;
    vec2 phase = fract(xy / vec2(1.0/vScale,1.0/vScale));
    vec3 vLightPosition = vec3(0,200,10);
    
    // World values
    vec3 vPositionW = vec3(world * vec4(vPosition, 1.0));
    vec3 vNormalW = normalize(vec3(world * vec4(vNormal, 0.0)));
    vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
    
    // Light
    vec3 lightVectorW = normalize(vLightPosition - vPositionW);
    vec3 color = texture2D(textureSampler, texCoords).rgb;
    
    // diffuse
    float ndl = max(0., dot(vNormalW, lightVectorW));
    
    // Specular
    vec3 angleW = normalize(viewDirectionW + lightVectorW);
    float specComp = max(0., dot(vNormalW, angleW));
    specComp = pow(specComp, max(1., 64.)) * 2.;
    
    gl_FragColor = vec4(color * ndl + vec3(specComp), 1.);
}