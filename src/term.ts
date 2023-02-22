import figlet, { Fonts } from 'figlet';

function replaceAt(base: string, index: number, replaceWith: string): string {
  if (!base || typeof(base) == "undefined") {
    return "";
  }
  if (!replaceWith || typeof(replaceWith) == "undefined") {
    return base;
  }
  if (index > base.length) {
    return base;
  }
  if (index < 0) {
    return replaceWith.substring(-index) + base.substring(replaceWith.length + index);
  }
  return base.substring(0, index) + replaceWith + base.substring(index + replaceWith.length);
}

function smoothstep(min: number, max: number, x: number): number {
  if (x <= min) {
    return 0;
  } else if (x >= max) {
    return 1;
  } else {
    let i = (x-min) / (max - min);
    return (i*i)*(3.0-2.0*i);
  }
}

function createElement(elemObj: any, time: number, lineBuffer: string[], bufWidth: number, bufHeight: number, charsScrolled: number): TermElement {
  let elem = new TermElement(time, lineBuffer, bufWidth, bufHeight, charsScrolled);

  if (elemObj["type"] === "string") {
    let x = Number(elemObj["x"]) ?? 0;
    let y = Number(elemObj["y"]) ?? 0;
    let font = elemObj["font"] ?? null;
    let align = elemObj["align"] ?? "l";
    elem = new TermString(time, lineBuffer, bufWidth, bufHeight, charsScrolled,
      elemObj["value"], font, x, y, align, elemObj["cursor"], elemObj["slide"]);
  }
  if (elemObj["type"] === "box") {
    let x = Number(elemObj["x"]) ?? 0;
    let y = Number(elemObj["y"]) ?? 0;
    let w = Number(elemObj["w"]) ?? 5;
    let h = Number(elemObj["h"]) ?? 5;
    elem = new TermBox(time, lineBuffer, bufWidth, bufHeight, charsScrolled, x, y, w, h, elemObj["clear"]);
  }
  if (elemObj["type"] === "matrix") {
    let amount = Number(elemObj["amount"]) ?? 50;
    let speed = Number(elemObj["speed"]) ?? 5;
    elem = new TermMatrix(time, lineBuffer, bufWidth, bufHeight, charsScrolled, amount, speed);
  }

  if (elemObj["scroll"] == "true") {
    elem.scroll = true;
  }
  return elem;
}

class TermElement {
  lineBuffer: string[];
  bufWidth: number;
  bufHeight: number;
  scroll: boolean;
  constructor(time: number, lineBuffer: string[], bufWidth: number, bufHeight: number, charsScrolled: number) {
    this.lineBuffer = lineBuffer;
    this.bufWidth = bufWidth;
    this.bufHeight = bufHeight;
    this.scroll = false;
  }
  render(secs: number, dt: number, charsScrolled: number) {}
}

class TermString extends TermElement {
  lines: string[];
  x: number;
  y: number;
  align: string;
  cursor: boolean;
  font: string | null;
  str: string;
  lastCursorUpdate: number;
  cursorActive: boolean;
  slide: number | null;
  slideTime: number;
  startX: number;
  endX: number;
  originalX: number;
  canRender: boolean;
  creationTime: number;
  
  constructor(time: number, lineBuffer: string[], bufWidth: number, bufHeight: number, charsScrolled: number,
      str: string, font: string | null, x: number, y: number, align: string,
      cursor: string | undefined, slide: string | undefined) {
    super(time, lineBuffer, bufWidth, bufHeight, charsScrolled);
    this.x = x;
    this.originalX = x;
    this.y = y;
    this.creationTime = time;
    this.lines = [];
    this.align = align;
    this.font = font;
    this.str = str;
    this.canRender = true;
    this.lastCursorUpdate = time;
    if (cursor) {
      this.cursor = cursor === "true";
    } else {
      this.cursor = false;
    }
    if (slide) {
      [this.slide, this.slideTime] = slide.split(' ').map((s) => Number(s));
      this.canRender = false;
    } else {
      this.slide = null;
      this.slideTime = 0.0;
    }
    this.startX = 0.0;
    this.endX = 0.0;
    this.cursorActive = true;
    this.setLines(time);
    this.render(time, 0.0, charsScrolled);
  }

  private setLines(secs: number) {
    this.lines = [];
    let str = this.str;
    if (this.cursor) {
      if (this.cursorActive) {
        str += '_';
      } else {
        str += '   ';
      }
    }
    if (this.font) {
      figlet(str, this.font as unknown as Fonts, (err, result) => {
        if (result) {
          this.lines = result.split('\n');
          this.doAlign(secs);
        }
      });
    } else {
      this.lines = str.split('\n');
      this.doAlign(secs);
    }
  }

  private doAlign(secs: number) {
    if (this.lines.length == 0) {
      return;
    }
    if (this.align == "c") {
      let x = Math.floor(this.lines[0].length / 2);
      this.startX = -x*2;
      this.endX = this.originalX - x;
      if (this.slide !== null) {
        this.x = this.endX;
      }
    } else if (this.align == "r") {
      this.endX = this.originalX - this.lines[0].length;
      if (this.slide !== null) {
        this.x = this.endX;
      }
    } else if (this.align == "l") {
      this.endX = this.originalX;
      this.startX = -this.lines[0].length;
    }
    if (!this.canRender) {
      this.x = this.startX;
      if (this.slide === null) {
        this.x = this.endX;
      }
      this.creationTime = secs;
    }
  }

  render(secs: number, dt: number, charsScrolled: number) {
    let y = this.y;
    if (this.scroll) {
      y -= charsScrolled;
    }

    if (y + this.lines.length + 3 >= this.bufHeight && this.slide !== null) {
      // We're off screen so reset the animation
      if (y >= this.bufHeight) {
        this.canRender = false;
      }
      this.doAlign(secs);
    } else if (y + this.lines.length < this.bufHeight) {
      this.canRender = true;
    }

    if (!this.canRender) {
      return;
    }

    if (this.slide !== null) {
      this.x = this.startX
        + smoothstep(this.creationTime + this.slide, this.creationTime + this.slide + this.slideTime, secs)
        * (this.endX - this.startX);
    }

    if (this.lastCursorUpdate + 0.4 < secs && this.cursor) {
      this.lastCursorUpdate = secs;
      this.cursorActive = !this.cursorActive;
      this.setLines(secs);
    }

    for (let i = 0; i < this.lines.length; i++) {
      if (y + i >= 0 && y + i < this.bufHeight) {
        this.lineBuffer[y + i] = replaceAt(this.lineBuffer[y + i], Math.floor(this.x), this.lines[i]);
      }
    }
  }
}

class TermBox extends TermElement {
  x: number;
  y: number;
  w: number;
  h: number;
  clear: boolean;
  
  constructor(time: number, lineBuffer: string[], bufWidth: number, bufHeight: number, charsScrolled: number,
    x: number, y: number, w: number, h: number, clear: string | undefined) {
    super(time, lineBuffer, bufWidth, bufHeight, charsScrolled);
    this.x = x;
    this.y = y;
    this.w = w - 1;
    this.h = h - 1;
    if (clear) {
      this.clear = Boolean(clear);
    } else {
      this.clear = false;
    }
    this.render(time, 0.0, charsScrolled);
  }

  render(secs: number, dt: number, charsScrolled: number) {
    let sy = this.y;
    if (this.scroll) {
      sy -= charsScrolled;
    }

    if (this.clear) {
      let str = "";
      for (let x = 0; x < this.w; x++) {
        str += ' ';
      }
      for (let y = sy; y < sy + this.h; y++) {
        if (y >= 0 && y < this.bufHeight) {
          this.lineBuffer[y] = replaceAt(this.lineBuffer[y], this.x, str);
        }
      }
    }

    if (sy >= 0 && sy < this.bufHeight) {
      this.lineBuffer[sy] = replaceAt(this.lineBuffer[sy], this.x, "+");
      this.lineBuffer[sy] = replaceAt(this.lineBuffer[sy], this.x + this.w, "+");
    }
    if (sy + this.h >= 0 && sy + this.h < this.bufHeight) {
      this.lineBuffer[sy + this.h] = replaceAt(this.lineBuffer[sy + this.h], this.x, "+");
      this.lineBuffer[sy + this.h] = replaceAt(this.lineBuffer[sy + this.h], this.x + this.w, "+");
    }
    let bars = [...Array(this.w - 1).keys()].map(() => '=').join('');

    for (let y = sy + 1; y < sy + this.h; y++) {
      if (y >= 0 && y < this.bufHeight) {
        this.lineBuffer[y] = replaceAt(this.lineBuffer[y], this.x, "|");
        this.lineBuffer[y] = replaceAt(this.lineBuffer[y], this.x + this.w, "|");
      }
    }
    for (let x = this.x + 1; x < this.x + this.w; x++) {
      if (sy >= 0 && sy < this.bufHeight) {
        this.lineBuffer[sy] = replaceAt(this.lineBuffer[sy], this.x + 1, bars);
      }
      if (sy + this.h >= 0 && sy + this.h < this.bufHeight) {
        this.lineBuffer[sy + this.h] = replaceAt(this.lineBuffer[sy + this.h], this.x + 1, bars);
      }
    }
  }
}

class TermMatrix extends TermElement {
  numbers: [number, number, number, string][];
  numberMatrix: string[];
  
  constructor(time: number, lineBuffer: string[], bufWidth: number, bufHeight: number, charsScrolled: number, amount: number, speed: number) {
    super(time, lineBuffer, bufWidth, bufHeight, charsScrolled);
    this.numbers = [];
    this.numberMatrix = [];
    for (let y = 0; y < bufHeight; y++) {
      let str = '';
      for (let x = 0; x < bufWidth; x++) {
        str += ' ';
      }
      this.numberMatrix.push(str);
    }
    for (let x = 0; x < bufWidth; x++) {
      for (let i = 0; i < amount; i++) {
        this.numbers.push([
          x,
          Math.floor((Math.random() * bufHeight * 1.5) - (bufHeight * 0.5)),
          Math.random() * 0.5 - 0.25 + speed,
          ['0', ' ', ' ', ' '][Math.floor(Math.random() * 4)],
        ]);
      }
    }
    this.render(time, 0.0, charsScrolled);
  }

  render(secs: number, dt: number, charsScrolled: number) {
    this.numbers.forEach((num, idx) => {
      let oldHeight = Math.floor(num[1]);
      num[1] += dt * num[2];
      if (Math.floor(num[1]) != oldHeight && num[3] != ' ') {
        num[3] = ['0', '1'][Math.floor(Math.random() * 2)];
      }
      if (num[1] >= this.bufHeight) {
        num[1] = Math.floor((Math.random() * this.bufHeight * 1.5) - (this.bufHeight * 0.5));
      } else {
        let y = Math.floor(num[1]);
        if (y < this.bufHeight) {
          this.numberMatrix[y] = replaceAt(this.numberMatrix[y], num[0], num[3]);
        }
      }
    });

    this.numberMatrix.forEach((line, idx) => {
      this.lineBuffer[idx] = line;
    });
  }
}

export default class Term {
  lines: string[];
  private mouseX: number;
  private mouseY: number;
  private charsScrolled: number;
  private elements: TermElement[];
  private timePassed: number;
  private deltaTime: number;
  private gl: WebGL2RenderingContext;
  private textContext: CanvasRenderingContext2D;
  private glCanvas: HTMLCanvasElement;
  private textCanvas: HTMLCanvasElement;
  private textFontFamily: string;
  private widthChars: number;
  private heightChars: number;

  private glRawTextTexture: WebGLTexture;
  private glTextFramebuffer: WebGLFramebuffer;
  private glTextColorbuffer: WebGLTexture;
  private glQuadVertexArray: WebGLVertexArrayObject;
  private glQuadVertexBuffer: WebGLBuffer;
  private glTextShader: WebGLProgram;
  private glCrtShader: WebGLProgram;

  private testImage: HTMLImageElement | null;
  private testImageDoneDownloading: boolean;

  constructor(fontFamily: string, canvas: HTMLCanvasElement, widthChars: number, heightChars: number, termElements: object[]) {
    // Create the DOM elements and get the contexts
    console.log("Term Creation");
    this.timePassed = window.performance.now() / 1000;
    this.mouseX = 0;
    this.mouseY = 0;
    this.deltaTime = 0.0;
    this.charsScrolled = 0;
    this.updateCharsScrolled();
    this.widthChars = widthChars;
    this.heightChars = heightChars;
    this.lines = [];
    for (let y = 0; y < this.heightChars; y++) {
      let s = "";
      for (let x = 0; x < this.widthChars; x++) {
        s += ' ';
      }
      this.lines.push(s);
    }
    this.textFontFamily = fontFamily;
    this.textCanvas = document.createElement('canvas');
    this.textCanvas.style.position = "absolute";
    this.textCanvas.style.opacity = "0";
    this.glCanvas = canvas;
    this.glCanvas.appendChild(this.textCanvas);

    this.testImageDoneDownloading = false;
    // this.testImage = new Image();
    this.testImage = null;
    // if (this.testImage !== null) {
    //   this.testImage.src = "/images/sonic_the_hedgehog_3_profilelarge.jpg";
    //   this.testImage.addEventListener("load", (e) => {
    //     this.testImageDoneDownloading = true;
    //   });
    // }

    // Create the elements in the terminal, and draw and remove the static ones
    this.elements = termElements.map((elem) => createElement(elem, this.timePassed, this.lines, this.widthChars, this.heightChars, this.charsScrolled));

    // Initialize the drawing contexts
    {
      let glContext = this.glCanvas.getContext('webgl2');
      if (glContext) {
        this.gl = glContext;
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        [this.glQuadVertexArray, this.glQuadVertexBuffer] = createQuad(this.gl);
        [this.glTextFramebuffer, this.glTextColorbuffer] = createFramebuffer(this.gl, this.glCanvas.width, this.glCanvas.height);
        this.glRawTextTexture = createTexture(this.gl, 640, 288);
        let vertexSrc =
        `attribute vec2 a_position;
        attribute vec2 a_tex_coord;
        varying highp vec2 v_uv;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
          v_uv = a_tex_coord;
        }`;
        this.glTextShader = createShader(this.gl, vertexSrc,
        `precision mediump float;
        varying highp vec2 v_uv;
        uniform sampler2D tex;
        void main() {
          vec4 color = texture2D(tex, vec2(v_uv.x, 1.0 - v_uv.y));
          if (color.a < 0.7) {
            discard;
          } else {
            gl_FragColor = vec4(min(color.rgb, vec3(0.7)), 1.0);
          }
        }`);
        this.glCrtShader = createShader(this.gl, vertexSrc,
        `precision highp float;
        varying highp vec2 v_uv;
        uniform sampler2D tex;
        uniform vec2 texsize;
        uniform float timesecs;
        #define HORIZ_BLUR_PIXELS 1.0
        
        vec4 getBlur(vec2 uv) {
          vec4 color = vec4(0.0);
          vec2 hoff = vec2(texsize.x, 0.0);
          // Horizontal Pass
          for(int i = 0; i <= int(HORIZ_BLUR_PIXELS) * 2; i++) {
            float dist = (float(i) - HORIZ_BLUR_PIXELS);
            color += texture2D(tex, uv + hoff * dist) * 0.2;
          }
          // Vertical Pass
          vec2 voff = vec2(0.0, texsize.y);
          color += texture2D(tex, uv + voff) * 0.25;
          color += texture2D(tex, uv - voff) * 0.25;
          return color;
        }

        vec2 warpUv(vec2 uv) {
          vec2 curvature = vec2(7.0);
          uv = uv * 2.0 - 1.0;
          vec2 offset = abs(uv.yx) / vec2(curvature.x, curvature.y);
          uv += uv * offset * offset;
          uv = uv * 0.5 + 0.5;
          return uv;
        }

        vec4 scanline(vec2 uv) {
          float maxDepth = 0.3;
          float depth = sin(uv.y / texsize.y * 3.0) / 2.0 + 0.5;
          return vec4(depth*depth * -maxDepth);
        }

        float rollingShutter(float y) {
          float depth = 0.85;
          float height = 0.1;
          float modtime = mod(timesecs * 0.1, 1.0 + 0.07 + height + 0.3 + 1.1) - height - 0.3;
          if (y < modtime) {
            return (1.0 - smoothstep(modtime - 0.07, modtime, y) + depth);
          } else {
            return (smoothstep(modtime + height, modtime + height + 0.3, y) + depth);
          }
        }

        vec4 vignette(vec4 color, vec2 uv) {
          color *= smoothstep(0.0, 2.0 * 8.0 * texsize.x, 1.0 - abs(uv.x * 2.0 - 1.0));
          color *= smoothstep(0.0, 1.7 * 12.0 * texsize.y, 1.0 - abs(uv.y * 2.0 - 1.0));
          return color;
        }

        vec2 scanlineJitterOffset(vec2 uv) {
          return vec2(sin((uv.y / texsize.y * 3.0) + (timesecs * 1694.0)) * min(texsize.x * 0.8, 0.009125), 0.0);
        }

        vec4 glare(vec2 uv) {
          float power = 0.25;
          float xGlare = (-pow(1.5 * uv.x - 0.75, 8.0) + 0.05) / 0.05;
          vec4 final = vec4(0.0);
          if (uv.y < 0.8) {
            final = vec4(smoothstep(0.0, 0.7, uv.y) * xGlare * power);
          } else {
            final = vec4(smoothstep(0.0, 0.3, 1.0 - uv.y + 0.15) * xGlare * power);
          }
          return final + scanline(uv);
        }

        vec4 shadowMask(vec2 uv) {
          return vec4(
            cos(uv.x/texsize.x*2.0-1.0)*0.25+0.75,
            cos(uv.x/texsize.x*2.0-3.0)*0.25+0.75,
            cos(uv.x/texsize.x*2.0-5.0)*0.25+0.75,
            1.0);
        }

        void main() {
          vec2 uv = warpUv(v_uv + scanlineJitterOffset(v_uv));
          vec4 color = getBlur(uv) * 2.0 + scanline(uv);
          color *= shadowMask(uv);
          //color += glare(uv);
          //color *= rollingShutter(1.0 - uv.y);
          color = vignette(color, uv);
          gl_FragColor = color;
        }`);
      } else {
        throw "Couldn't create the webgl2 context!";
      }

      let textContext = this.textCanvas.getContext('2d');
      if (textContext) {
        this.textContext = textContext;
        this.resizeTextCanvas();
      } else {
        throw "Couldn't create the 2d context!";
      }
    }
  }

  render(timeStamp: DOMHighResTimeStamp) {
    this.resize();
    this.clearLines();
    this.updateCharsScrolled();
    let newTime = timeStamp / 1000;
    this.deltaTime = newTime - this.timePassed;
    this.timePassed = newTime;
    this.drawText();
    this.drawCrt();
  }

  onMouseUpdate(e: MouseEvent) {
    this.mouseX = Math.floor((e.clientX / window.innerWidth) * this.widthChars);
    this.mouseY = Math.floor((e.clientY / window.innerHeight) * this.heightChars);
  }

  private drawCursor() {
    if (this.mouseX >= 0 && this.mouseX < this.widthChars &&
        this.mouseY >= 0 && this.mouseY < this.heightChars) {
      this.lines[this.mouseY] = replaceAt(this.lines[this.mouseY], this.mouseX, ['█', '▒'][Math.floor(this.timePassed * 3) % 2]);
    }
  }

  private updateCharsScrolled() {
    this.charsScrolled = Math.floor((window.scrollY / window.innerHeight) * this.heightChars);
  }

  private clearLines() {
    let str = '';
    for (let i = 0; i < this.widthChars; i++) {
      str += ' ';
    }
    for (let y = 0; y < this.heightChars; y++) {
      this.lines[y] = str;
    }
  }

  private resizeTextCanvas() {
    this.textCanvas.width = this.widthChars * 8;
    this.textCanvas.height = this.heightChars * 12;
    this.textContext.fillStyle = "#fff";
    this.textContext.font = `12px ${this.textFontFamily}`;
    this.textContext.textBaseline = "top";
    this.textContext.direction = "ltr";
  }

  private resize() {
    if (this.glCanvas.clientWidth != this.glCanvas.width ||
        this.glCanvas.clientHeight != this.glCanvas.height) {
      this.glCanvas.width = this.glCanvas.clientWidth;
      this.glCanvas.height = this.glCanvas.clientHeight;
      this.resizeTextCanvas();
    }
  }

  private drawText() {
    let seed = 123412;
    let mulberry32butchered = (a: number): number => {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0);
    }

    this.elements.forEach((elem) => {
      elem.render(this.timePassed, this.deltaTime, this.charsScrolled);
    });
    this.drawCursor();

    this.textContext.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
    for (let y = 0; y < this.lines.length; y++) {
      for (let c = 0; c < this.lines[y].length; c++) {
        seed = mulberry32butchered(seed);
        this.textContext.fillStyle = ["#1f1", "#0f0", "#3f3", "#2f2"][seed % 4];
        this.textContext.fillText(this.lines[y].charAt(c), c * 8, y * 12);
      }
    }

    if (this.testImageDoneDownloading && this.testImage) {
      this.textContext.drawImage(this.testImage, 0, 0, this.testImage.width, this.testImage.height, 0.0, 0.0, this.textCanvas.width, this.textCanvas.height);
    }
  }

  private drawCrt() {
    // Extract the text texture
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTextColorbuffer);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.textCanvas.width, this.textCanvas.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.glRawTextTexture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.textCanvas);

    // Setup the viewport and draw to the text framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.glTextFramebuffer);
    this.gl.viewport(0, 0, this.textCanvas.width, this.textCanvas.height);
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);

    // Create the "pixels" for the actual crt screen
    this.gl.useProgram(this.glTextShader);
    this.gl.uniform1i(this.gl.getUniformLocation(this.glTextShader, "tex"), 0);
    this.gl.bindVertexArray(this.glQuadVertexArray);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Setup the viewport and draw to the normal framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, this.glCanvas.width, this.glCanvas.height);
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);

    // Dummy draw to the crt screen
    this.gl.useProgram(this.glCrtShader);
    this.gl.uniform1i(this.gl.getUniformLocation(this.glCrtShader, "tex"), 0);
    this.gl.uniform2f(this.gl.getUniformLocation(this.glCrtShader, "texsize"), 1.0 / this.textCanvas.width, 1.0 / this.textCanvas.height);
    this.gl.uniform1f(this.gl.getUniformLocation(this.glCrtShader, "timesecs"), this.timePassed);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTextColorbuffer);
    this.gl.bindVertexArray(this.glQuadVertexArray);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  destroy() {
    console.log("Term Destruction");
    this.textCanvas.remove();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.deleteFramebuffer(this.glTextFramebuffer);
    this.gl.deleteTexture(this.glTextColorbuffer);
    this.gl.deleteTexture(this.glRawTextTexture);
    this.gl.deleteVertexArray(this.glQuadVertexArray);
    this.gl.deleteBuffer(this.glQuadVertexBuffer);
    this.gl.deleteProgram(this.glTextShader);
    this.gl.deleteProgram(this.glCrtShader);
  }
}

let createShader = (gl: WebGL2RenderingContext, vertexSrc: string, fragmentSrc: string): WebGLProgram => {
  let vertex = gl.createShader(gl.VERTEX_SHADER) ?? WebGLShader;
  gl.shaderSource(vertex, vertexSrc);
  gl.compileShader(vertex);
  const vertex_msg = gl.getShaderInfoLog(vertex) ?? "";
  if (vertex_msg.length > 0) {
    throw vertex_msg;
  }
  let fragment = gl.createShader(gl.FRAGMENT_SHADER) ?? WebGLShader;
  gl.shaderSource(fragment, fragmentSrc);
  gl.compileShader(fragment);
  const fragment_msg = gl.getShaderInfoLog(fragment) ?? "";
  if (fragment_msg.length > 0) {
    throw fragment_msg;
  }

  let program = gl.createProgram();
  if (program) {
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    const program_msg = gl.getProgramInfoLog(program) ?? "";
    if (program_msg.length > 0) {
      throw program_msg;
    }
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return program;
  } else {
    throw "Couldn't make the WebGL2 Program!";
  }
};

let createTexture = (gl: WebGL2RenderingContext, w: number, h: number): WebGLTexture => {
  let texture = gl.createTexture() ?? WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  return texture;
};

let createFramebuffer = (gl: WebGL2RenderingContext, w: number, h: number): [WebGLFramebuffer, WebGLTexture] => {
  let framebuffer = gl.createFramebuffer() ?? WebGLFramebuffer;
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  let colorBuffer = createTexture(gl, w, h);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorBuffer, 0);
  if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
    throw "WebGL framebuffer is incomplete!";
  }
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return [framebuffer, colorBuffer];
};

let createQuad = (gl: WebGL2RenderingContext): [WebGLVertexArrayObject, WebGLBuffer] => {
  let vao = gl.createVertexArray() ?? WebGLVertexArrayObject;
  gl.bindVertexArray(vao);
  let vbo = gl.createBuffer() ?? WebGLBuffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  let quad_verts = new Float32Array([
    //x    y    u    v
    -1.0,  1.0, 0.0, 1.0, // Top Left
    -1.0, -1.0, 0.0, 0.0, // Bottom Left
    1.0,  1.0, 1.0, 1.0, // Top Right

    -1.0, -1.0, 0.0, 0.0, // Bottom Left
    1.0, -1.0, 1.0, 0.0, // Bottom Right
    1.0,  1.0, 1.0, 1.0, // Top Right
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, quad_verts, gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4*4, 4*0);
  gl.enableVertexAttribArray(0);  // position
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 4*4, 4*2);
  gl.enableVertexAttribArray(1);  // texture coords
  gl.bindVertexArray(null);
  return [vao, vbo];
};
