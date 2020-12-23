precision highp float;

uniform vec2 resolution;
uniform float time;
uniform sampler2D backbuffer; //1つ前の描画

#define size 0.4 //粒サイズ
#define scale 300. //拡大縮小率
#define threshold vec2(0.3, 1.0) //密度

float noise(in vec3 uv);

//グラデーションノイズ
vec2 random(vec2 uv){
    uv = vec2( dot(uv, vec2(127.1, 311.7)),
               dot(uv, vec2(269.5, 183.3)));
    return 2.0 * fract(sin(uv) * 43758.5453123) - 1.0;
}

float gnoise(vec2 uv) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix( mix( dot( random(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                     dot( random(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( random(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                     dot( random(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

vec2 particle(vec2 p)
{
    // Repeat
    p = p * .5 + .5;

    vec2 cellP = floor(p * scale);  //pを拡大縮小して整数部を取り出す

    p = fract(p * scale); //pを拡大縮小して少数部を取り出す
    p = p * 2. - 1.;

    // ドット描画
    float color = smoothstep(size, size * 0.9, length(p));

    // ノイズでドット消す
    float cell = gnoise(cellP * 0.5 + 0.5);
    //sin * 0.5 + 0.5 で 0.0〜1.0 の範囲におさめる
    color *= smoothstep(0.2, max(0.5 * (sin(time * 5.4) * 0.5 + 0.5), 0.35), cell); //このcellをさらにランダムにしてみたら良いんじゃないか
    // 数値上がると密度高まる
    // color *= smoothstep(size * 0.01, size * 0.02 , cell * sin(time * 3.4));

    return vec2(color);
}

vec2 particles(in vec2 p) {
    // 歪ませる
   	p.x += gnoise((p + 20.)) * 0.53;
  	p.y += gnoise((p + 10.)) * 0.57;
    return particle(p) + particle(p * 0.93 + 3.) + particle(p * 0.63 + 40.);
}



vec3 gradient(vec2 uv) {
    // return vec3(
    //     noise(vec3(uv * 0.3, time * 1.4)) * 0.5 + 0.3, //r
    //     noise(vec3(uv * 0.3, time * 1.4)) * 0.5 + 0.0, //g
    //     noise(vec3(uv * 0.3, time * 1.4)) * 0.5 + 0.3  //b
    // );
        return vec3(
        // noise(vec3(uv * 0.3, time * 5.4)) * 0.5 + 0.5
        gnoise(uv * 0.3) * 0.5 + 0.5
    );
}

float fbm(in vec2 uv) {
    float value = 0.0;
    float amp = 0.5;
    float scl = 2.7;
    for (int i = 0; i < 4; i++) {
        value += noise(vec3(uv, time * 0.1)) * amp;
        amp *= amp;
        uv *= scl;
    }
    return value;
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 p = uv * 2. - 1.;
    p.x *= resolution.x / resolution.y;

    p *= 0.5;

    vec2 prt = particles(p);

    // Gradient
    vec4 color = vec4(prt.x * gradient(uv), 1.);

    gl_FragColor = color;

    gl_FragColor += texture2D(backbuffer, uv) * 0.7;
}


//-----------------------
//　glsl-noise
//-----------------------

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float noise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // タイル
    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //   x0 = x0 - 0.0 + 0.0 * C.xxx;
    //   x1 = x0 - i1  + 1.0 * C.xxx;
    //   x2 = x0 - i2  + 2.0 * C.xxx;
    //   x3 = x0 - 1.0 + 3.0 * C.xxx;
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

    // Permutations
    i = mod289(i);
    vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
    //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
