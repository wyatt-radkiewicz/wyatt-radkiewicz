import figlet, { Fonts } from 'figlet';
import { onMobile, getRealSizeForScroll } from 'src/useTermSize';

const CHAR_WIDTH = 8;
const CHAR_HEIGHT = 8;

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

function createElement(elemObj: any, time: number, lineBuffer: number[], bufWidth: number, bufHeight: number, charsScrolled: number): TermElement {
  let elem = new TermElement(time, lineBuffer, bufWidth, bufHeight, charsScrolled);

  if (elemObj["type"] === "string") {
    let x = elemObj["x"] != undefined ? Number(elemObj["x"]) : 0;
    let y = elemObj["y"] != undefined ? Number(elemObj["y"]) : 0;
    let font = elemObj["font"] != undefined ? elemObj["font"] : null;
    let align = elemObj["align"] != undefined ? elemObj["align"] : "l";
    elem = new TermString(time, lineBuffer, bufWidth, bufHeight, charsScrolled,
      elemObj["value"], font, x, y, align, elemObj["cursor"], elemObj["slide"]);
  }
  if (elemObj["type"] === "box") {
    let x = elemObj["x"] != undefined ? Number(elemObj["x"]) : 0;
    let y = elemObj["y"] != undefined ? Number(elemObj["y"]) : 0;
    let w = elemObj["w"] != undefined ? Number(elemObj["w"]) : 5;
    let h = elemObj["h"] != undefined ? Number(elemObj["h"]) : 5;
    elem = new TermBox(time, lineBuffer, bufWidth, bufHeight, charsScrolled, x, y, w, h, elemObj["clear"]);
  }
  if (elemObj["type"] === "matrix") {
    let amount = elemObj["amount"] != undefined ? Number(elemObj["amount"]) : 50;
    let speed = elemObj["speed"] != undefined ? Number(elemObj["speed"]) : 5;
    let starty = elemObj["starty"] != undefined ? Number(elemObj["starty"]) : 0;
    let endy = elemObj["endy"] != undefined ? Number(elemObj["endy"]) : 10000000;
    elem = new TermMatrix(time, lineBuffer, bufWidth, bufHeight, charsScrolled, amount, speed, starty, endy);
  }
  if (elemObj["type"] === "cube") {
    let starty = elemObj["starty"] != undefined ? Number(elemObj["starty"]) : 0;
    let endy = elemObj["endy"] != undefined ? Number(elemObj["endy"]) : 10000000;
    elem = new TermCube(time, lineBuffer, bufWidth, bufHeight, charsScrolled, starty, endy);
  }
  if (elemObj["type"] === "donut") {
    let starty = elemObj["starty"] != undefined ? Number(elemObj["starty"]) : 0;
    let endy = elemObj["endy"] != undefined ? Number(elemObj["endy"]) : 10000000;
    elem = new TermDonut(time, lineBuffer, bufWidth, bufHeight, charsScrolled, starty, endy);
  }

  if (elemObj["scroll"] == "true") {
    elem.scroll = true;
  }
  return elem;
}

class TermElement {
  lineBuffer: number[];
  bufWidth: number;
  bufHeight: number;
  scroll: boolean;
  constructor(time: number, lineBuffer: number[], bufWidth: number, bufHeight: number, charsScrolled: number) {
    this.lineBuffer = lineBuffer;
    this.bufWidth = bufWidth;
    this.bufHeight = bufHeight;
    this.scroll = false;
  }
  render(secs: number, dt: number, charsScrolled: number) {}
}

function rotatePoint(x: number, y: number, z: number, rx: number, ry: number): [number, number, number] {
  return [
    x * Math.cos(ry) - Math.sin(ry) * (z * Math.cos(rx) - y * Math.sin(rx)),
    y * Math.cos(rx) + z * Math.sin(rx),
    x * Math.sin(ry) + Math.cos(ry) * (z * Math.cos(rx) - y * Math.sin(rx)),
  ];
}

function rotatePoint3(x: number, y: number, z: number, A: number, B: number, C: number): [number, number, number] {
  return [
    x*Math.cos(B)*Math.cos(C)+y*(Math.sin(A)*Math.sin(B)*Math.cos(C)+Math.cos(A)*Math.sin(C))+z*(-Math.cos(A)*Math.sin(B)*Math.cos(C)+Math.sin(A)*Math.sin(C)),
    -x*Math.cos(B)*Math.sin(C)+y*(-Math.sin(A)+Math.sin(B)*Math.sin(C)+Math.cos(A)*Math.cos(C))+z*(Math.cos(A)*Math.sin(B)*Math.sin(C)+Math.sin(A)*Math.cos(C)),
    x*Math.sin(B)-y*Math.sin(A)*Math.cos(B)+z*Math.cos(A)*Math.cos(B),
  ];
}

function getShadeChar(nx: number, ny: number, nz: number, down: boolean): number {
  let sun = [0.577, -0.577, -0.577];
  if (down) {
    sun = [0.0, -1.0, 0.0];
  }
  let dot = ((nx*sun[0] + ny*sun[1] + nz*sun[2]) / 2.0 + 0.5);
  let shade = Math.floor(dot * dot * 4.999);
  return ['.', '-', '=', '*', '#'][shade].charCodeAt(0);
}

class TermCube extends TermElement {
  zBuffer: number[];
  ang: [number, number];
  nearPlane: number;
  cubeDist: number;
  cubeSize: number;
  starty: number;
  endy: number;
  scrollDist: number;
  scrollDistMax: number;
  
  constructor(time: number, lineBuffer: number[], bufWidth: number, bufHeight: number, charsScrolled: number, starty: number, endy: number) {
    super(time, lineBuffer, bufWidth, bufHeight, charsScrolled);
    this.ang = [0.0, 0.0];
    this.nearPlane = 15.0;
    this.cubeDist = 20;
    this.cubeSize = 5;
    this.zBuffer = [...Array(this.bufWidth * this.bufHeight)].map(() => 0);
    this.starty = starty;
    this.endy = endy;
    this.scrollDistMax = 60;
    this.scrollDist = this.scrollDistMax;
  }

  render(secs: number, dt: number, charsScrolled: number) {
    if (charsScrolled < this.starty || charsScrolled > this.endy) {
      if (this.scrollDist >= this.scrollDistMax) {
        this.scrollDist = this.scrollDistMax;
        return;
      } else {
        this.scrollDist += this.scrollDistMax * dt * 2.0;
      }
    } else {
      if (this.scrollDist > 0) {
        this.scrollDist -= this.scrollDistMax * dt * 2.0;
      }
      if (this.scrollDist <= 0) {
        this.scrollDist = 0;
      }
    }
    this.ang[0] += dt * 1.1;
    this.ang[1] -= dt * 1.1;
    this.cubeDist = Math.sin(secs) * 3.0 + 16.0 + this.scrollDist;
    this.zBuffer.fill(1000000000.0, 0);
    this.drawFace(0);
    this.drawFace(1);
    this.drawFace(2);
    this.drawFace(3);
    this.drawFace(4);
    this.drawFace(5);
  }

  private drawFace(faceId: number) {
    let points = [
      [0, 0, -1],
      [0, 0, 1],
      [0, -1, 0],
      [0, 1, 0],
      [-1, 0, 0],
      [1, 0, 0],
    ];
    let np = rotatePoint(points[faceId][0], points[faceId][1], points[faceId][2], this.ang[0], this.ang[1]);
    for (let ix = -this.cubeSize + 0.05; ix <= this.cubeSize - 0.05; ix += 0.4) {
      for (let iy = -this.cubeSize + 0.05; iy <= this.cubeSize - 0.05; iy += 0.4) {
        let rps = [
          [ix, iy, -this.cubeSize],
          [ix, iy, this.cubeSize],
          [ix, -this.cubeSize, iy],
          [ix, this.cubeSize, iy],
          [-this.cubeSize, ix, iy],
          [this.cubeSize, ix, iy],
        ];
        let rp = rotatePoint(rps[faceId][0], rps[faceId][1], rps[faceId][2], this.ang[0], this.ang[1]);
        let z = rp[2] + this.cubeDist;
        let x = Math.floor((this.bufWidth / 2) + (rp[0] * this.nearPlane) / z);
        let y = Math.floor((this.bufHeight / 2) + (rp[1] * this.nearPlane) / z);
        if (x >= 0 && x < this.bufWidth && y >= 0 && this.bufHeight && z > 0.0 && z < this.zBuffer[y * this.bufWidth + x]) {
          this.lineBuffer[y * this.bufWidth + x] = getShadeChar(np[0], np[1], np[2], false);
          this.zBuffer[y * this.bufWidth + x] = z;
        }
      }
    }
  }
}

class TermDonut extends TermElement {
  zBuffer: number[];
  buffers: number[][];
  currBuffer: number;
  ang: [number, number];
  nearPlane: number;
  donutDist: number;
  donutThickness: number;
  donutRadius: number;
  starty: number;
  endy: number;
  scrollDist: number;
  scrollDistMax: number;
  drawIndex: number;
  lastUpdate: number;
  
  constructor(time: number, lineBuffer: number[], bufWidth: number, bufHeight: number, charsScrolled: number, starty: number, endy: number) {
    super(time, lineBuffer, bufWidth, bufHeight, charsScrolled);
    this.ang = [0.0, 0.0];
    this.nearPlane = 15.0;
    this.donutDist = 25;
    this.donutRadius = 8;
    this.donutThickness = 2.5;
    this.zBuffer = [...Array(this.bufWidth * this.bufHeight)].map(() => 0);
    this.buffers = [];
    for (let i = 0; i < 2; i++) {
      this.buffers.push([...Array(this.bufWidth * this.bufHeight)].map(() => ' '.charCodeAt(0)));
    }
    this.currBuffer = 0;
    this.drawIndex = 0;
    this.starty = starty;
    this.endy = endy;
    this.scrollDistMax = 90;
    this.scrollDist = this.scrollDistMax;
    this.lastUpdate = time;
  }

  render(secs: number, dt: number, charsScrolled: number) {
    let indexes = onMobile ? 3 : 2;
    this.drawIndex += 1;
    if (charsScrolled < this.starty || charsScrolled > this.endy) {
      if (this.scrollDist >= this.scrollDistMax) {
        this.lastUpdate = secs;
        this.scrollDist = this.scrollDistMax;
        return;
      }
    }
    if (this.drawIndex >= indexes) {
      let realDt = secs - this.lastUpdate;
      this.lastUpdate = secs;
      this.drawIndex = 0;
      if (charsScrolled < this.starty || charsScrolled > this.endy) {
        if (this.scrollDist >= this.scrollDistMax) {
          this.scrollDist = this.scrollDistMax;
          return;
        } else {
          this.scrollDist += this.scrollDistMax * realDt * 2.0;
        }
      } else {
        if (this.scrollDist > 0) {
          this.scrollDist -= this.scrollDistMax * realDt * 2.0;
        }
        if (this.scrollDist <= 0) {
          this.scrollDist = 0;
        }
      }
      this.ang[0] += realDt * 1.0;
      this.ang[1] -= realDt * 1.0;
      this.donutDist = Math.sin(secs) * 3.0 + 20.0 + this.scrollDist;
      this.currBuffer = (this.currBuffer + 1) % this.buffers.length;
      this.zBuffer.fill(1000000000.0, 0);
      this.buffers[this.currBuffer].fill(' '.charCodeAt(0), 0);
    }
    
    for (let A = this.drawIndex * (6.28 / indexes); A < (this.drawIndex + 1) * (6.28 / indexes); A += 0.07) {
      for (let B = 0.0; B < 6.28; B += 0.2) {
        let base = [this.donutRadius, 0.0, 0.0];
        let pt = [this.donutRadius-Math.cos(B)*this.donutThickness, 0.0, Math.sin(B)*this.donutThickness];
        let base2 = rotatePoint3(base[0], base[1], base[2], 0.0, 0.0, A);
        let base3 = rotatePoint(base2[0], base2[1], base2[2], this.ang[0], this.ang[1]);
        let dp = rotatePoint3(pt[0], pt[1], pt[2], 0.0, 0.0, A);
        let rp = rotatePoint(dp[0], dp[1], dp[2], this.ang[0], this.ang[1]);
        let z = rp[2] + this.donutDist;
        let x = Math.floor((this.bufWidth / 2) + (rp[0] * this.nearPlane) / z);
        let y = Math.floor((this.bufHeight / 2) + (rp[1] * this.nearPlane) / z);
        if (x >= 0 && x < this.bufWidth && y >= 0 && this.bufHeight && z > 0.0 && z < this.zBuffer[y * this.bufWidth + x]) {
          let np = [rp[0] - base3[0], rp[1] - base3[1], z - (base3[2] + this.donutDist)];
          let npLen = Math.sqrt(np[0]*np[0]+np[1]*np[1]+np[2]*np[2]);
          np[0] /= npLen; np[1] /= npLen; np[2] /= npLen;
          this.buffers[this.currBuffer][y * this.bufWidth + x] = getShadeChar(np[0], np[1], np[2], true);
          this.zBuffer[y * this.bufWidth + x] = z;
        }
      }
    }

    let drawBuffer = this.currBuffer - 1 < 0 ? this.buffers.length - 1 : this.currBuffer - 1;
    for (let y = 0; y < this.bufHeight * 2; y++) {
      for (let x = 0; x < this.bufWidth; x++) {
        this.lineBuffer[y * this.bufWidth + x] = this.buffers[drawBuffer][y * this.bufWidth + x];
      }
    }
  }
}

class TermString extends TermElement {
  lines: number[];
  linesWidth: number;
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
  
  constructor(time: number, lineBuffer: number[], bufWidth: number, bufHeight: number, charsScrolled: number,
      str: string, font: string | null, x: number, y: number, align: string,
      cursor: string | undefined, slide: string | undefined) {
    super(time, lineBuffer, bufWidth, bufHeight, charsScrolled);
    this.x = x;
    this.originalX = x;
    this.y = Math.floor(y);
    this.creationTime = time;
    this.lines = [];
    this.linesWidth = 0;
    this.align = align;
    this.font = font;
    this.str = str;
    this.canRender = false;
    this.lastCursorUpdate = time;
    if (cursor) {
      this.cursor = cursor === "true";
    } else {
      this.cursor = false;
    }
    if (slide !== undefined) {
      [this.slide, this.slideTime] = slide.split(' ').map((s) => Number(s));
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
          let lines = result.split('\n');
          this.lines = lines.map((line) => line.split('').map((c) => c.charCodeAt(0))).flat();
          this.linesWidth = lines[0].length;
          this.doAlign(secs);
        }
      });
    } else {
      let lines = str.split('\n');
      this.linesWidth = Math.max(...(lines.map((str) => str.length)));
      lines = lines.map((line) => line.padEnd(this.linesWidth, ' '));
      this.lines = lines.map((line) => line.split('').map((c) => c.charCodeAt(0))).flat();
      this.doAlign(secs);
    }
  }

  private doAlign(secs: number) {
    if (this.align == "c") {
      let x = Math.floor(this.linesWidth / 2);
      this.startX = -x*2;
      this.endX = this.originalX - x;
    } else if (this.align == "r") {
      this.endX = this.originalX - this.linesWidth;
    } else if (this.align == "l") {
      this.endX = this.originalX;
      this.startX = -this.linesWidth;
    }
    if (!this.canRender) {
      this.x = Math.floor(this.startX);
      if (this.slide === null) {
        this.x = Math.floor(this.endX);
      }
      this.creationTime = secs;
    }
  }

  render(secs: number, dt: number, charsScrolled: number) {
    let y = this.y;
    if (this.scroll) {
      y -= charsScrolled;
    }

    let h = (this.lines.length / this.linesWidth);
    if (y + h + 3 >= this.bufHeight && this.slide !== null) {
      // We're off screen so reset the animation
      if (y >= this.bufHeight) {
        this.canRender = false;
      }
      this.doAlign(secs);
    } else if (y + h < this.bufHeight) {
      this.canRender = true;
    }

    if (!this.canRender) {
      return;
    }

    if (this.slide !== null) {
      this.x = Math.floor(this.startX
        + smoothstep(this.creationTime + this.slide, this.creationTime + this.slide + this.slideTime, secs)
        * (this.endX - this.startX));
    }

    if (this.lastCursorUpdate + 0.4 < secs && this.cursor) {
      this.lastCursorUpdate = secs;
      this.cursorActive = !this.cursorActive;
      this.setLines(secs);
    }

    for (let j = Math.max(y, 0); j < Math.min(y + h, this.bufHeight); j++) {
      for (let k = Math.max(this.x, 0); k < Math.min(this.x + this.linesWidth, this.bufWidth); k++) {
        this.lineBuffer[j * this.bufWidth + k] = this.lines[(j - y) * this.linesWidth + (k - this.x)];
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
  
  constructor(time: number, lineBuffer: number[], bufWidth: number, bufHeight: number, charsScrolled: number,
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
      for (let y = Math.max(sy, 0); y < Math.min(sy + this.h, this.bufHeight); y++) {
        for (let x = Math.max(this.x, 0); x < Math.min(this.x + this.w, this.bufWidth); x++) {
          this.lineBuffer[y * this.bufWidth + x] = ' '.charCodeAt(0);
        }
      }
    }

    for (let x = Math.max(this.x, 0); x < Math.min(this.x + this.w, this.bufWidth); x++) {
      if (sy >= 0 && sy < this.bufHeight) {
        this.lineBuffer[sy * this.bufWidth + x] = '='.charCodeAt(0);
      }
      if ((sy + this.h) >= 0 && (sy + this.h) < this.bufHeight) {
        this.lineBuffer[(sy + this.h) * this.bufWidth + x] = '='.charCodeAt(0);
      }
    }
    for (let y = Math.max(sy, 0); y < Math.min(sy + this.h + 1, this.bufHeight); y++) {
      if (this.x >= 0 && this.x < this.bufWidth) {
        this.lineBuffer[y * this.bufWidth + this.x] = '|'.charCodeAt(0);
        if (y == sy || y == sy + this.h) {
          this.lineBuffer[y * this.bufWidth + this.x] = '+'.charCodeAt(0);
        }
      }
      if ((this.x + this.w) >= 0 && (this.x + this.w) < this.bufWidth) {
        this.lineBuffer[y * this.bufWidth + this.x + this.w] = '|'.charCodeAt(0);
        if (y == sy || y == sy + this.h) {
          this.lineBuffer[y * this.bufWidth + this.x + this.w] = '+'.charCodeAt(0);
        }
      }
    }
  }
}

class TermMatrix extends TermElement {
  numbers: [number, number, number, number][];
  numberMatrix: number[];
  bottom: number[];
  top: number[];
  starty: number;
  endy: number;
  
  constructor(time: number, lineBuffer: number[], bufWidth: number, bufHeight: number,
    charsScrolled: number, amount: number, speed: number, starty: number, endy: number) {
    super(time, lineBuffer, bufWidth, bufHeight, charsScrolled);
    this.starty = starty;
    this.endy = endy;
    this.numbers = [];
    this.bottom = [];
    this.top = [];
    this.numberMatrix = [...Array(this.bufWidth * (this.bufHeight * 2))].map(() => ' '.charCodeAt(0));
    for (let x = 0; x < bufWidth; x++) {
      this.bottom.push(this.bufHeight * 1.4 + Math.random() * this.bufHeight * 0.5);
      this.top.push(Math.random() * this.bufHeight * 0.5);
      for (let i = 0; i < amount; i++) {
        this.numbers.push([
          x,
          Math.floor(Math.random() * bufHeight + this.top[i]),
          Math.random() * 0.5 - 0.25 + speed,
          ['0'.charCodeAt(0), ' '.charCodeAt(0), ' '.charCodeAt(0), ' '.charCodeAt(0)][Math.floor(Math.random() * 4)],
        ]);
      }
    }
    this.render(time, 0.0, charsScrolled);
  }

  render(secs: number, dt: number, charsScrolled: number) {
    let starty = Math.floor(this.bufHeight / -2.0);
    const transSize = 20;
    if (charsScrolled < this.starty - transSize || charsScrolled > this.endy + transSize) {
      return;
    } else if (charsScrolled < this.starty) {
      starty = Math.floor((this.bufHeight / -2.0) - ((this.starty - charsScrolled) / transSize) * (this.bufHeight * 1.5));
    } else if (charsScrolled > this.endy) {
      starty = Math.floor((this.bufHeight / -2.0) + ((charsScrolled - this.endy) / transSize) * (this.bufHeight * 1.5));
    }

    this.numbers.forEach((num, idx) => {
      let oldHeight = Math.floor(num[1]);
      num[1] += dt * num[2];
      if (Math.floor(num[1]) != oldHeight && num[3] != ' '.charCodeAt(0)) {
        num[3] = ['0'.charCodeAt(0), '1'.charCodeAt(0)][Math.floor(Math.random() * 2)];
      }
      if (num[1] >= this.bottom[num[0]]) {
        num[1] = this.top[num[0]];
      } else {
        let y = Math.floor(num[1]);
        if (y >= 0 && y < this.bufHeight * 2) {
          this.numberMatrix[y * this.bufWidth + num[0]] = num[3];
        }
      }
    });

    for (let y = 0; y < this.bufHeight * 2; y++) {
      for (let x = 0; x < this.bufWidth; x++) {
        let num = this.numberMatrix[y * this.bufWidth + x];
        if (y + starty > 0 && y + starty < this.bufHeight && num != ' '.charCodeAt(0)) {
          this.lineBuffer[(y + starty) * this.bufWidth + x] = this.numberMatrix[y * this.bufWidth + x];
        }
      }
    }
  }
}

export default class Term {
  lines: number[];
  private mouseX: number;
  private mouseY: number;
  private mouseClientX: number;
  private mouseClientY: number;
  private showCursor: boolean;
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

  constructor(fontFamily: string, canvas: HTMLCanvasElement, widthChars: number, heightChars: number, termElements: object[]) {
    // Create the DOM elements and get the contexts
    console.log("Term Creation");
    this.timePassed = window.performance.now() / 1000;
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseClientX = 0;
    this.mouseClientY = 0;
    this.showCursor = true;
    this.deltaTime = 0.0;
    this.charsScrolled = 0;
    this.widthChars = widthChars;
    this.heightChars = heightChars;
    this.lines = [...Array(this.widthChars * this.heightChars)].map(() => ' '.charCodeAt(0));
    this.textFontFamily = fontFamily;
    this.textCanvas = document.createElement('canvas');
    this.textCanvas.style.position = "absolute";
    this.textCanvas.style.opacity = "0";
    this.glCanvas = canvas;
    this.glCanvas.appendChild(this.textCanvas);

    // Create the elements in the terminal, and draw and remove the static ones
    this.elements = termElements.map((elem) => createElement(elem, this.timePassed, this.lines, this.widthChars, this.heightChars, this.charsScrolled));

    // Initialize the drawing contexts
    {
      let textContext = this.textCanvas.getContext('2d');
      if (textContext) {
        this.textContext = textContext;
        this.textCanvas.width = this.widthChars * CHAR_WIDTH;
        this.textCanvas.height = this.heightChars * CHAR_HEIGHT;
        this.textContext.font = `${CHAR_HEIGHT}px ${this.textFontFamily}`;
        this.textContext.textBaseline = "top";
        this.textContext.direction = "ltr";
      } else {
        throw "Couldn't create the 2d context!";
      }

      let glContext = this.glCanvas.getContext('webgl2');
      if (glContext) {
        this.glCanvas.width = this.glCanvas.clientWidth;
        this.glCanvas.height = this.glCanvas.clientHeight;
        this.gl = glContext;
        [this.glQuadVertexArray, this.glQuadVertexBuffer] = createQuad(this.gl);
        [this.glTextFramebuffer, this.glTextColorbuffer] = createFramebuffer(this.gl, this.textCanvas.width, this.textCanvas.height);
        this.glRawTextTexture = createTexture(this.gl, this.textCanvas.width, this.textCanvas.height);
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
          if (color.g < 0.7) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          } else {
            gl_FragColor = vec4(vec3(0.1, 1.0, 0.1), 1.0);
          }
        }`);
        this.glCrtShader = createShader(this.gl, vertexSrc,
        `precision lowp float;
        varying highp vec2 v_uv;
        uniform sampler2D tex;
        uniform vec2 texsize;
        uniform float timesecs;
        
        vec4 getBlur(vec2 uv) {
          vec4 color = texture2D(tex, vec2(uv.x - texsize.x, uv.y)) * 0.2;
          color += texture2D(tex, uv) * 0.6;
          color += texture2D(tex, vec2(uv.x + texsize.x, uv.y)) * 0.2;
          
          // Glare component
          float yshift = uv.y - 0.85;
          color += (yshift*yshift*yshift)+0.03;
          return color;
        }

        vec2 warpUv(vec2 uv) {
          uv = uv * 2.0 - 1.0;
          vec2 offset = abs(uv.yx) * 0.166;
          uv += uv * offset * offset;
          uv = uv * 0.5 + 0.5;
          return uv;
        }

        float scanline(vec2 uv) {
          float maxDepth = 0.75 / 2.0;
          float depth = sin(uv.y / texsize.y * 6.28)*maxDepth + (1.0 - maxDepth);
          return depth;
        }

        float vignette(vec2 uv) {
          vec2 v = smoothstep(vec2(0.0), vec2(2.5 * ${CHAR_WIDTH}.0 * texsize.x, 2.5 * ${CHAR_HEIGHT}.0 * texsize.y), 1.0 - abs(uv * 2.0 - 1.0));
          return v.x * v.y;
        }

        vec2 jitterUv(vec2 uv) {
          return vec2(uv.x + sin((uv.y / 0.0025) + (timesecs * 1694.0)) * 0.00065, uv.y);
        }

        void main() {
          vec2 uv = warpUv(jitterUv(v_uv));
          gl_FragColor = getBlur(uv) * scanline(uv) * 4.0 * vignette(uv) * min(timesecs - 0.75, 1.0);
        }`);
      } else {
        throw "Couldn't create the webgl2 context!";
      }
    }
  }

  render(timeStamp: DOMHighResTimeStamp) {
    this.lines.fill(' '.charCodeAt(0), 0);
    this.charsScrolled = Math.floor((window.scrollY / getRealSizeForScroll().height) * this.heightChars);
    let newTime = timeStamp / 1000;
    this.deltaTime = newTime - this.timePassed;
    this.timePassed = newTime;
    if (!onMobile) {
      let elem = document.elementFromPoint(this.mouseClientX, this.mouseClientY);
      this.showCursor = elem ? elem.className.includes("scrollSpace") : true;
    }
    this.drawText();
    this.drawCrt();
  }

  onMouseUpdate(e: MouseEvent) {
    let width = window.innerWidth;
    let height = window.innerHeight;
    this.mouseClientX = e.clientX;
    this.mouseClientY = e.clientY;
    this.mouseX = Math.floor((this.mouseClientX / width) * this.widthChars);
    this.mouseY = Math.floor((this.mouseClientY / height) * this.heightChars);
  }

  private drawText() {
    this.elements.forEach((elem) => {
      elem.render(this.timePassed, this.deltaTime, this.charsScrolled);
    });
    if (this.mouseX >= 0 && this.mouseX < this.widthChars &&
      this.mouseY >= 0 && this.mouseY < this.heightChars && this.showCursor) {
      this.lines[this.mouseY * this.widthChars + this.mouseX] = ['█'.charCodeAt(0), '▒'.charCodeAt(0)][Math.floor(this.timePassed * 3) % 2];
    }

    this.textContext.fillStyle = "#000";
    this.textContext.fillRect(0, 0, this.textCanvas.width, this.textCanvas.height);
    this.textContext.fillStyle = "#1f1";
    for (let y = 0; y < this.heightChars; y++) {
      this.textContext.fillText(String.fromCharCode(...this.lines.slice(y * this.widthChars, (y + 1) * this.widthChars)), 0, y * CHAR_HEIGHT);
    }
  }

  private drawCrt() {
    // Extract the text texture
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.glRawTextTexture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.textCanvas);

    // Setup the viewport and draw to the text framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.glTextFramebuffer);
    this.gl.viewport(0, 0, this.textCanvas.width, this.textCanvas.height);

    // Create the "pixels" for the actual crt screen
    this.gl.useProgram(this.glTextShader);
    this.gl.bindVertexArray(this.glQuadVertexArray);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Setup the viewport and draw to the normal framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, this.glCanvas.width, this.glCanvas.height);

    // Dummy draw to the crt screen
    this.gl.useProgram(this.glCrtShader);
    this.gl.uniform2f(this.gl.getUniformLocation(this.glCrtShader, "texsize"), 1.0 / this.textCanvas.width, 1.0 / this.textCanvas.height);
    this.gl.uniform1f(this.gl.getUniformLocation(this.glCrtShader, "timesecs"), this.timePassed);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTextColorbuffer);
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
