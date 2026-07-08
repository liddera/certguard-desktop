import { app as mt, safeStorage as Sr, ipcMain as at, nativeImage as Ua, Tray as ui, Menu as li, BrowserWindow as fn, globalShortcut as cn } from "electron";
import { fileURLToPath as fi } from "node:url";
import Bt from "node:path";
import { hostname as hn, userInfo as ci, networkInterfaces as hi } from "os";
import * as Et from "fs";
import va from "crypto";
import * as di from "path";
import { exec as pi } from "child_process";
import { promisify as vi } from "util";
var yi = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, z = {
  // default options
  options: {
    usePureJavaScript: !1
  }
}, ya = {}, gi = ya, Pa = {};
ya.encode = function(e, t, a) {
  if (typeof t != "string")
    throw new TypeError('"alphabet" must be a string.');
  if (a !== void 0 && typeof a != "number")
    throw new TypeError('"maxline" must be a number.');
  var r = "";
  if (!(e instanceof Uint8Array))
    r = mi(e, t);
  else {
    var n = 0, s = t.length, i = t.charAt(0), o = [0];
    for (n = 0; n < e.length; ++n) {
      for (var l = 0, u = e[n]; l < o.length; ++l)
        u += o[l] << 8, o[l] = u % s, u = u / s | 0;
      for (; u > 0; )
        o.push(u % s), u = u / s | 0;
    }
    for (n = 0; e[n] === 0 && n < e.length - 1; ++n)
      r += i;
    for (n = o.length - 1; n >= 0; --n)
      r += t[o[n]];
  }
  if (a) {
    var f = new RegExp(".{1," + a + "}", "g");
    r = r.match(f).join(`\r
`);
  }
  return r;
};
ya.decode = function(e, t) {
  if (typeof e != "string")
    throw new TypeError('"input" must be a string.');
  if (typeof t != "string")
    throw new TypeError('"alphabet" must be a string.');
  var a = Pa[t];
  if (!a) {
    a = Pa[t] = [];
    for (var r = 0; r < t.length; ++r)
      a[t.charCodeAt(r)] = r;
  }
  e = e.replace(/\s/g, "");
  for (var n = t.length, s = t.charAt(0), i = [0], r = 0; r < e.length; r++) {
    var o = a[e.charCodeAt(r)];
    if (o === void 0)
      return;
    for (var l = 0, u = o; l < i.length; ++l)
      u += i[l] * n, i[l] = u & 255, u >>= 8;
    for (; u > 0; )
      i.push(u & 255), u >>= 8;
  }
  for (var f = 0; e[f] === s && f < e.length - 1; ++f)
    i.push(0);
  return typeof Buffer < "u" ? Buffer.from(i.reverse()) : new Uint8Array(i.reverse());
};
function mi(e, t) {
  var a = 0, r = t.length, n = t.charAt(0), s = [0];
  for (a = 0; a < e.length(); ++a) {
    for (var i = 0, o = e.at(a); i < s.length; ++i)
      o += s[i] << 8, s[i] = o % r, o = o / r | 0;
    for (; o > 0; )
      s.push(o % r), o = o / r | 0;
  }
  var l = "";
  for (a = 0; e.at(a) === 0 && a < e.length() - 1; ++a)
    l += n;
  for (a = s.length - 1; a >= 0; --a)
    l += t[s[a]];
  return l;
}
var Va = z, Oa = gi, E = Va.util = Va.util || {};
(function() {
  if (typeof process < "u" && process.nextTick && !process.browser) {
    E.nextTick = process.nextTick, typeof setImmediate == "function" ? E.setImmediate = setImmediate : E.setImmediate = E.nextTick;
    return;
  }
  if (typeof setImmediate == "function") {
    E.setImmediate = function() {
      return setImmediate.apply(void 0, arguments);
    }, E.nextTick = function(i) {
      return setImmediate(i);
    };
    return;
  }
  if (E.setImmediate = function(i) {
    setTimeout(i, 0);
  }, typeof window < "u" && typeof window.postMessage == "function") {
    let i = function(o) {
      if (o.source === window && o.data === e) {
        o.stopPropagation();
        var l = t.slice();
        t.length = 0, l.forEach(function(u) {
          u();
        });
      }
    };
    var e = "forge.setImmediate", t = [];
    E.setImmediate = function(o) {
      t.push(o), t.length === 1 && window.postMessage(e, "*");
    }, window.addEventListener("message", i, !0);
  }
  if (typeof MutationObserver < "u") {
    var a = Date.now(), r = !0, n = document.createElement("div"), t = [];
    new MutationObserver(function() {
      var o = t.slice();
      t.length = 0, o.forEach(function(l) {
        l();
      });
    }).observe(n, { attributes: !0 });
    var s = E.setImmediate;
    E.setImmediate = function(o) {
      Date.now() - a > 15 ? (a = Date.now(), s(o)) : (t.push(o), t.length === 1 && n.setAttribute("a", r = !r));
    };
  }
  E.nextTick = E.setImmediate;
})();
E.isNodejs = typeof process < "u" && process.versions && process.versions.node;
E.globalScope = function() {
  return E.isNodejs ? yi : typeof self > "u" ? window : self;
}();
E.isArray = Array.isArray || function(e) {
  return Object.prototype.toString.call(e) === "[object Array]";
};
E.isArrayBuffer = function(e) {
  return typeof ArrayBuffer < "u" && e instanceof ArrayBuffer;
};
E.isArrayBufferView = function(e) {
  return e && E.isArrayBuffer(e.buffer) && e.byteLength !== void 0;
};
function cr(e) {
  if (!(e === 8 || e === 16 || e === 24 || e === 32))
    throw new Error("Only 8, 16, 24, or 32 bits supported: " + e);
}
E.ByteBuffer = ga;
function ga(e) {
  if (this.data = "", this.read = 0, typeof e == "string")
    this.data = e;
  else if (E.isArrayBuffer(e) || E.isArrayBufferView(e))
    if (typeof Buffer < "u" && e instanceof Buffer)
      this.data = e.toString("binary");
    else {
      var t = new Uint8Array(e);
      try {
        this.data = String.fromCharCode.apply(null, t);
      } catch {
        for (var a = 0; a < t.length; ++a)
          this.putByte(t[a]);
      }
    }
  else (e instanceof ga || typeof e == "object" && typeof e.data == "string" && typeof e.read == "number") && (this.data = e.data, this.read = e.read);
  this._constructedStringLength = 0;
}
E.ByteStringBuffer = ga;
var Ci = 4096;
E.ByteStringBuffer.prototype._optimizeConstructedString = function(e) {
  this._constructedStringLength += e, this._constructedStringLength > Ci && (this.data.substr(0, 1), this._constructedStringLength = 0);
};
E.ByteStringBuffer.prototype.length = function() {
  return this.data.length - this.read;
};
E.ByteStringBuffer.prototype.isEmpty = function() {
  return this.length() <= 0;
};
E.ByteStringBuffer.prototype.putByte = function(e) {
  return this.putBytes(String.fromCharCode(e));
};
E.ByteStringBuffer.prototype.fillWithByte = function(e, t) {
  e = String.fromCharCode(e);
  for (var a = this.data; t > 0; )
    t & 1 && (a += e), t >>>= 1, t > 0 && (e += e);
  return this.data = a, this._optimizeConstructedString(t), this;
};
E.ByteStringBuffer.prototype.putBytes = function(e) {
  return this.data += e, this._optimizeConstructedString(e.length), this;
};
E.ByteStringBuffer.prototype.putString = function(e) {
  return this.putBytes(E.encodeUtf8(e));
};
E.ByteStringBuffer.prototype.putInt16 = function(e) {
  return this.putBytes(
    String.fromCharCode(e >> 8 & 255) + String.fromCharCode(e & 255)
  );
};
E.ByteStringBuffer.prototype.putInt24 = function(e) {
  return this.putBytes(
    String.fromCharCode(e >> 16 & 255) + String.fromCharCode(e >> 8 & 255) + String.fromCharCode(e & 255)
  );
};
E.ByteStringBuffer.prototype.putInt32 = function(e) {
  return this.putBytes(
    String.fromCharCode(e >> 24 & 255) + String.fromCharCode(e >> 16 & 255) + String.fromCharCode(e >> 8 & 255) + String.fromCharCode(e & 255)
  );
};
E.ByteStringBuffer.prototype.putInt16Le = function(e) {
  return this.putBytes(
    String.fromCharCode(e & 255) + String.fromCharCode(e >> 8 & 255)
  );
};
E.ByteStringBuffer.prototype.putInt24Le = function(e) {
  return this.putBytes(
    String.fromCharCode(e & 255) + String.fromCharCode(e >> 8 & 255) + String.fromCharCode(e >> 16 & 255)
  );
};
E.ByteStringBuffer.prototype.putInt32Le = function(e) {
  return this.putBytes(
    String.fromCharCode(e & 255) + String.fromCharCode(e >> 8 & 255) + String.fromCharCode(e >> 16 & 255) + String.fromCharCode(e >> 24 & 255)
  );
};
E.ByteStringBuffer.prototype.putInt = function(e, t) {
  cr(t);
  var a = "";
  do
    t -= 8, a += String.fromCharCode(e >> t & 255);
  while (t > 0);
  return this.putBytes(a);
};
E.ByteStringBuffer.prototype.putSignedInt = function(e, t) {
  return e < 0 && (e += 2 << t - 1), this.putInt(e, t);
};
E.ByteStringBuffer.prototype.putBuffer = function(e) {
  return this.putBytes(e.getBytes());
};
E.ByteStringBuffer.prototype.getByte = function() {
  return this.data.charCodeAt(this.read++);
};
E.ByteStringBuffer.prototype.getInt16 = function() {
  var e = this.data.charCodeAt(this.read) << 8 ^ this.data.charCodeAt(this.read + 1);
  return this.read += 2, e;
};
E.ByteStringBuffer.prototype.getInt24 = function() {
  var e = this.data.charCodeAt(this.read) << 16 ^ this.data.charCodeAt(this.read + 1) << 8 ^ this.data.charCodeAt(this.read + 2);
  return this.read += 3, e;
};
E.ByteStringBuffer.prototype.getInt32 = function() {
  var e = this.data.charCodeAt(this.read) << 24 ^ this.data.charCodeAt(this.read + 1) << 16 ^ this.data.charCodeAt(this.read + 2) << 8 ^ this.data.charCodeAt(this.read + 3);
  return this.read += 4, e;
};
E.ByteStringBuffer.prototype.getInt16Le = function() {
  var e = this.data.charCodeAt(this.read) ^ this.data.charCodeAt(this.read + 1) << 8;
  return this.read += 2, e;
};
E.ByteStringBuffer.prototype.getInt24Le = function() {
  var e = this.data.charCodeAt(this.read) ^ this.data.charCodeAt(this.read + 1) << 8 ^ this.data.charCodeAt(this.read + 2) << 16;
  return this.read += 3, e;
};
E.ByteStringBuffer.prototype.getInt32Le = function() {
  var e = this.data.charCodeAt(this.read) ^ this.data.charCodeAt(this.read + 1) << 8 ^ this.data.charCodeAt(this.read + 2) << 16 ^ this.data.charCodeAt(this.read + 3) << 24;
  return this.read += 4, e;
};
E.ByteStringBuffer.prototype.getInt = function(e) {
  cr(e);
  var t = 0;
  do
    t = (t << 8) + this.data.charCodeAt(this.read++), e -= 8;
  while (e > 0);
  return t;
};
E.ByteStringBuffer.prototype.getSignedInt = function(e) {
  var t = this.getInt(e), a = 2 << e - 2;
  return t >= a && (t -= a << 1), t;
};
E.ByteStringBuffer.prototype.getBytes = function(e) {
  var t;
  return e ? (e = Math.min(this.length(), e), t = this.data.slice(this.read, this.read + e), this.read += e) : e === 0 ? t = "" : (t = this.read === 0 ? this.data : this.data.slice(this.read), this.clear()), t;
};
E.ByteStringBuffer.prototype.bytes = function(e) {
  return typeof e > "u" ? this.data.slice(this.read) : this.data.slice(this.read, this.read + e);
};
E.ByteStringBuffer.prototype.at = function(e) {
  return this.data.charCodeAt(this.read + e);
};
E.ByteStringBuffer.prototype.setAt = function(e, t) {
  return this.data = this.data.substr(0, this.read + e) + String.fromCharCode(t) + this.data.substr(this.read + e + 1), this;
};
E.ByteStringBuffer.prototype.last = function() {
  return this.data.charCodeAt(this.data.length - 1);
};
E.ByteStringBuffer.prototype.copy = function() {
  var e = E.createBuffer(this.data);
  return e.read = this.read, e;
};
E.ByteStringBuffer.prototype.compact = function() {
  return this.read > 0 && (this.data = this.data.slice(this.read), this.read = 0), this;
};
E.ByteStringBuffer.prototype.clear = function() {
  return this.data = "", this.read = 0, this;
};
E.ByteStringBuffer.prototype.truncate = function(e) {
  var t = Math.max(0, this.length() - e);
  return this.data = this.data.substr(this.read, t), this.read = 0, this;
};
E.ByteStringBuffer.prototype.toHex = function() {
  for (var e = "", t = this.read; t < this.data.length; ++t) {
    var a = this.data.charCodeAt(t);
    a < 16 && (e += "0"), e += a.toString(16);
  }
  return e;
};
E.ByteStringBuffer.prototype.toString = function() {
  return E.decodeUtf8(this.bytes());
};
function Ei(e, t) {
  t = t || {}, this.read = t.readOffset || 0, this.growSize = t.growSize || 1024;
  var a = E.isArrayBuffer(e), r = E.isArrayBufferView(e);
  if (a || r) {
    a ? this.data = new DataView(e) : this.data = new DataView(e.buffer, e.byteOffset, e.byteLength), this.write = "writeOffset" in t ? t.writeOffset : this.data.byteLength;
    return;
  }
  this.data = new DataView(new ArrayBuffer(0)), this.write = 0, e != null && this.putBytes(e), "writeOffset" in t && (this.write = t.writeOffset);
}
E.DataBuffer = Ei;
E.DataBuffer.prototype.length = function() {
  return this.write - this.read;
};
E.DataBuffer.prototype.isEmpty = function() {
  return this.length() <= 0;
};
E.DataBuffer.prototype.accommodate = function(e, t) {
  if (this.length() >= e)
    return this;
  t = Math.max(t || this.growSize, e);
  var a = new Uint8Array(
    this.data.buffer,
    this.data.byteOffset,
    this.data.byteLength
  ), r = new Uint8Array(this.length() + t);
  return r.set(a), this.data = new DataView(r.buffer), this;
};
E.DataBuffer.prototype.putByte = function(e) {
  return this.accommodate(1), this.data.setUint8(this.write++, e), this;
};
E.DataBuffer.prototype.fillWithByte = function(e, t) {
  this.accommodate(t);
  for (var a = 0; a < t; ++a)
    this.data.setUint8(e);
  return this;
};
E.DataBuffer.prototype.putBytes = function(e, t) {
  if (E.isArrayBufferView(e)) {
    var a = new Uint8Array(e.buffer, e.byteOffset, e.byteLength), r = a.byteLength - a.byteOffset;
    this.accommodate(r);
    var n = new Uint8Array(this.data.buffer, this.write);
    return n.set(a), this.write += r, this;
  }
  if (E.isArrayBuffer(e)) {
    var a = new Uint8Array(e);
    this.accommodate(a.byteLength);
    var n = new Uint8Array(this.data.buffer);
    return n.set(a, this.write), this.write += a.byteLength, this;
  }
  if (e instanceof E.DataBuffer || typeof e == "object" && typeof e.read == "number" && typeof e.write == "number" && E.isArrayBufferView(e.data)) {
    var a = new Uint8Array(e.data.byteLength, e.read, e.length());
    this.accommodate(a.byteLength);
    var n = new Uint8Array(e.data.byteLength, this.write);
    return n.set(a), this.write += a.byteLength, this;
  }
  if (e instanceof E.ByteStringBuffer && (e = e.data, t = "binary"), t = t || "binary", typeof e == "string") {
    var s;
    if (t === "hex")
      return this.accommodate(Math.ceil(e.length / 2)), s = new Uint8Array(this.data.buffer, this.write), this.write += E.binary.hex.decode(e, s, this.write), this;
    if (t === "base64")
      return this.accommodate(Math.ceil(e.length / 4) * 3), s = new Uint8Array(this.data.buffer, this.write), this.write += E.binary.base64.decode(e, s, this.write), this;
    if (t === "utf8" && (e = E.encodeUtf8(e), t = "binary"), t === "binary" || t === "raw")
      return this.accommodate(e.length), s = new Uint8Array(this.data.buffer, this.write), this.write += E.binary.raw.decode(s), this;
    if (t === "utf16")
      return this.accommodate(e.length * 2), s = new Uint16Array(this.data.buffer, this.write), this.write += E.text.utf16.encode(s), this;
    throw new Error("Invalid encoding: " + t);
  }
  throw Error("Invalid parameter: " + e);
};
E.DataBuffer.prototype.putBuffer = function(e) {
  return this.putBytes(e), e.clear(), this;
};
E.DataBuffer.prototype.putString = function(e) {
  return this.putBytes(e, "utf16");
};
E.DataBuffer.prototype.putInt16 = function(e) {
  return this.accommodate(2), this.data.setInt16(this.write, e), this.write += 2, this;
};
E.DataBuffer.prototype.putInt24 = function(e) {
  return this.accommodate(3), this.data.setInt16(this.write, e >> 8 & 65535), this.data.setInt8(this.write, e >> 16 & 255), this.write += 3, this;
};
E.DataBuffer.prototype.putInt32 = function(e) {
  return this.accommodate(4), this.data.setInt32(this.write, e), this.write += 4, this;
};
E.DataBuffer.prototype.putInt16Le = function(e) {
  return this.accommodate(2), this.data.setInt16(this.write, e, !0), this.write += 2, this;
};
E.DataBuffer.prototype.putInt24Le = function(e) {
  return this.accommodate(3), this.data.setInt8(this.write, e >> 16 & 255), this.data.setInt16(this.write, e >> 8 & 65535, !0), this.write += 3, this;
};
E.DataBuffer.prototype.putInt32Le = function(e) {
  return this.accommodate(4), this.data.setInt32(this.write, e, !0), this.write += 4, this;
};
E.DataBuffer.prototype.putInt = function(e, t) {
  cr(t), this.accommodate(t / 8);
  do
    t -= 8, this.data.setInt8(this.write++, e >> t & 255);
  while (t > 0);
  return this;
};
E.DataBuffer.prototype.putSignedInt = function(e, t) {
  return cr(t), this.accommodate(t / 8), e < 0 && (e += 2 << t - 1), this.putInt(e, t);
};
E.DataBuffer.prototype.getByte = function() {
  return this.data.getInt8(this.read++);
};
E.DataBuffer.prototype.getInt16 = function() {
  var e = this.data.getInt16(this.read);
  return this.read += 2, e;
};
E.DataBuffer.prototype.getInt24 = function() {
  var e = this.data.getInt16(this.read) << 8 ^ this.data.getInt8(this.read + 2);
  return this.read += 3, e;
};
E.DataBuffer.prototype.getInt32 = function() {
  var e = this.data.getInt32(this.read);
  return this.read += 4, e;
};
E.DataBuffer.prototype.getInt16Le = function() {
  var e = this.data.getInt16(this.read, !0);
  return this.read += 2, e;
};
E.DataBuffer.prototype.getInt24Le = function() {
  var e = this.data.getInt8(this.read) ^ this.data.getInt16(this.read + 1, !0) << 8;
  return this.read += 3, e;
};
E.DataBuffer.prototype.getInt32Le = function() {
  var e = this.data.getInt32(this.read, !0);
  return this.read += 4, e;
};
E.DataBuffer.prototype.getInt = function(e) {
  cr(e);
  var t = 0;
  do
    t = (t << 8) + this.data.getInt8(this.read++), e -= 8;
  while (e > 0);
  return t;
};
E.DataBuffer.prototype.getSignedInt = function(e) {
  var t = this.getInt(e), a = 2 << e - 2;
  return t >= a && (t -= a << 1), t;
};
E.DataBuffer.prototype.getBytes = function(e) {
  var t;
  return e ? (e = Math.min(this.length(), e), t = this.data.slice(this.read, this.read + e), this.read += e) : e === 0 ? t = "" : (t = this.read === 0 ? this.data : this.data.slice(this.read), this.clear()), t;
};
E.DataBuffer.prototype.bytes = function(e) {
  return typeof e > "u" ? this.data.slice(this.read) : this.data.slice(this.read, this.read + e);
};
E.DataBuffer.prototype.at = function(e) {
  return this.data.getUint8(this.read + e);
};
E.DataBuffer.prototype.setAt = function(e, t) {
  return this.data.setUint8(e, t), this;
};
E.DataBuffer.prototype.last = function() {
  return this.data.getUint8(this.write - 1);
};
E.DataBuffer.prototype.copy = function() {
  return new E.DataBuffer(this);
};
E.DataBuffer.prototype.compact = function() {
  if (this.read > 0) {
    var e = new Uint8Array(this.data.buffer, this.read), t = new Uint8Array(e.byteLength);
    t.set(e), this.data = new DataView(t), this.write -= this.read, this.read = 0;
  }
  return this;
};
E.DataBuffer.prototype.clear = function() {
  return this.data = new DataView(new ArrayBuffer(0)), this.read = this.write = 0, this;
};
E.DataBuffer.prototype.truncate = function(e) {
  return this.write = Math.max(0, this.length() - e), this.read = Math.min(this.read, this.write), this;
};
E.DataBuffer.prototype.toHex = function() {
  for (var e = "", t = this.read; t < this.data.byteLength; ++t) {
    var a = this.data.getUint8(t);
    a < 16 && (e += "0"), e += a.toString(16);
  }
  return e;
};
E.DataBuffer.prototype.toString = function(e) {
  var t = new Uint8Array(this.data, this.read, this.length());
  if (e = e || "utf8", e === "binary" || e === "raw")
    return E.binary.raw.encode(t);
  if (e === "hex")
    return E.binary.hex.encode(t);
  if (e === "base64")
    return E.binary.base64.encode(t);
  if (e === "utf8")
    return E.text.utf8.decode(t);
  if (e === "utf16")
    return E.text.utf16.decode(t);
  throw new Error("Invalid encoding: " + e);
};
E.createBuffer = function(e, t) {
  return t = t || "raw", e !== void 0 && t === "utf8" && (e = E.encodeUtf8(e)), new E.ByteBuffer(e);
};
E.fillString = function(e, t) {
  for (var a = ""; t > 0; )
    t & 1 && (a += e), t >>>= 1, t > 0 && (e += e);
  return a;
};
E.xorBytes = function(e, t, a) {
  for (var r = "", n = "", s = "", i = 0, o = 0; a > 0; --a, ++i)
    n = e.charCodeAt(i) ^ t.charCodeAt(i), o >= 10 && (r += s, s = "", o = 0), s += String.fromCharCode(n), ++o;
  return r += s, r;
};
E.hexToBytes = function(e) {
  var t = "", a = 0;
  for (e.length & !0 && (a = 1, t += String.fromCharCode(parseInt(e[0], 16))); a < e.length; a += 2)
    t += String.fromCharCode(parseInt(e.substr(a, 2), 16));
  return t;
};
E.bytesToHex = function(e) {
  return E.createBuffer(e).toHex();
};
E.int32ToBytes = function(e) {
  return String.fromCharCode(e >> 24 & 255) + String.fromCharCode(e >> 16 & 255) + String.fromCharCode(e >> 8 & 255) + String.fromCharCode(e & 255);
};
var xt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", St = [
  /*43 -43 = 0*/
  /*'+',  1,  2,  3,'/' */
  62,
  -1,
  -1,
  -1,
  63,
  /*'0','1','2','3','4','5','6','7','8','9' */
  52,
  53,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  /*15, 16, 17,'=', 19, 20, 21 */
  -1,
  -1,
  -1,
  64,
  -1,
  -1,
  -1,
  /*65 - 43 = 22*/
  /*'A','B','C','D','E','F','G','H','I','J','K','L','M', */
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  /*'N','O','P','Q','R','S','T','U','V','W','X','Y','Z' */
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  /*91 - 43 = 48 */
  /*48, 49, 50, 51, 52, 53 */
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  /*97 - 43 = 54*/
  /*'a','b','c','d','e','f','g','h','i','j','k','l','m' */
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  /*'n','o','p','q','r','s','t','u','v','w','x','y','z' */
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51
], dn = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
E.encode64 = function(e, t) {
  for (var a = "", r = "", n, s, i, o = 0; o < e.length; )
    n = e.charCodeAt(o++), s = e.charCodeAt(o++), i = e.charCodeAt(o++), a += xt.charAt(n >> 2), a += xt.charAt((n & 3) << 4 | s >> 4), isNaN(s) ? a += "==" : (a += xt.charAt((s & 15) << 2 | i >> 6), a += isNaN(i) ? "=" : xt.charAt(i & 63)), t && a.length > t && (r += a.substr(0, t) + `\r
`, a = a.substr(t));
  return r += a, r;
};
E.decode64 = function(e) {
  e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  for (var t = "", a, r, n, s, i = 0; i < e.length; )
    a = St[e.charCodeAt(i++) - 43], r = St[e.charCodeAt(i++) - 43], n = St[e.charCodeAt(i++) - 43], s = St[e.charCodeAt(i++) - 43], t += String.fromCharCode(a << 2 | r >> 4), n !== 64 && (t += String.fromCharCode((r & 15) << 4 | n >> 2), s !== 64 && (t += String.fromCharCode((n & 3) << 6 | s)));
  return t;
};
E.encodeUtf8 = function(e) {
  return unescape(encodeURIComponent(e));
};
E.decodeUtf8 = function(e) {
  return decodeURIComponent(escape(e));
};
E.binary = {
  raw: {},
  hex: {},
  base64: {},
  base58: {},
  baseN: {
    encode: Oa.encode,
    decode: Oa.decode
  }
};
E.binary.raw.encode = function(e) {
  return String.fromCharCode.apply(null, e);
};
E.binary.raw.decode = function(e, t, a) {
  var r = t;
  r || (r = new Uint8Array(e.length)), a = a || 0;
  for (var n = a, s = 0; s < e.length; ++s)
    r[n++] = e.charCodeAt(s);
  return t ? n - a : r;
};
E.binary.hex.encode = E.bytesToHex;
E.binary.hex.decode = function(e, t, a) {
  var r = t;
  r || (r = new Uint8Array(Math.ceil(e.length / 2))), a = a || 0;
  var n = 0, s = a;
  for (e.length & 1 && (n = 1, r[s++] = parseInt(e[0], 16)); n < e.length; n += 2)
    r[s++] = parseInt(e.substr(n, 2), 16);
  return t ? s - a : r;
};
E.binary.base64.encode = function(e, t) {
  for (var a = "", r = "", n, s, i, o = 0; o < e.byteLength; )
    n = e[o++], s = e[o++], i = e[o++], a += xt.charAt(n >> 2), a += xt.charAt((n & 3) << 4 | s >> 4), isNaN(s) ? a += "==" : (a += xt.charAt((s & 15) << 2 | i >> 6), a += isNaN(i) ? "=" : xt.charAt(i & 63)), t && a.length > t && (r += a.substr(0, t) + `\r
`, a = a.substr(t));
  return r += a, r;
};
E.binary.base64.decode = function(e, t, a) {
  var r = t;
  r || (r = new Uint8Array(Math.ceil(e.length / 4) * 3)), e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""), a = a || 0;
  for (var n, s, i, o, l = 0, u = a; l < e.length; )
    n = St[e.charCodeAt(l++) - 43], s = St[e.charCodeAt(l++) - 43], i = St[e.charCodeAt(l++) - 43], o = St[e.charCodeAt(l++) - 43], r[u++] = n << 2 | s >> 4, i !== 64 && (r[u++] = (s & 15) << 4 | i >> 2, o !== 64 && (r[u++] = (i & 3) << 6 | o));
  return t ? u - a : r.subarray(0, u);
};
E.binary.base58.encode = function(e, t) {
  return E.binary.baseN.encode(e, dn, t);
};
E.binary.base58.decode = function(e, t) {
  return E.binary.baseN.decode(e, dn, t);
};
E.text = {
  utf8: {},
  utf16: {}
};
E.text.utf8.encode = function(e, t, a) {
  e = E.encodeUtf8(e);
  var r = t;
  r || (r = new Uint8Array(e.length)), a = a || 0;
  for (var n = a, s = 0; s < e.length; ++s)
    r[n++] = e.charCodeAt(s);
  return t ? n - a : r;
};
E.text.utf8.decode = function(e) {
  return E.decodeUtf8(String.fromCharCode.apply(null, e));
};
E.text.utf16.encode = function(e, t, a) {
  var r = t;
  r || (r = new Uint8Array(e.length * 2));
  var n = new Uint16Array(r.buffer);
  a = a || 0;
  for (var s = a, i = a, o = 0; o < e.length; ++o)
    n[i++] = e.charCodeAt(o), s += 2;
  return t ? s - a : r;
};
E.text.utf16.decode = function(e) {
  return String.fromCharCode.apply(null, new Uint16Array(e.buffer));
};
E.deflate = function(e, t, a) {
  if (t = E.decode64(e.deflate(E.encode64(t)).rval), a) {
    var r = 2, n = t.charCodeAt(1);
    n & 32 && (r = 6), t = t.substring(r, t.length - 4);
  }
  return t;
};
E.inflate = function(e, t, a) {
  var r = e.inflate(E.encode64(t)).rval;
  return r === null ? null : E.decode64(r);
};
var ma = function(e, t, a) {
  if (!e)
    throw new Error("WebStorage not available.");
  var r;
  if (a === null ? r = e.removeItem(t) : (a = E.encode64(JSON.stringify(a)), r = e.setItem(t, a)), typeof r < "u" && r.rval !== !0) {
    var n = new Error(r.error.message);
    throw n.id = r.error.id, n.name = r.error.name, n;
  }
}, Ca = function(e, t) {
  if (!e)
    throw new Error("WebStorage not available.");
  var a = e.getItem(t);
  if (e.init)
    if (a.rval === null) {
      if (a.error) {
        var r = new Error(a.error.message);
        throw r.id = a.error.id, r.name = a.error.name, r;
      }
      a = null;
    } else
      a = a.rval;
  return a !== null && (a = JSON.parse(E.decode64(a))), a;
}, xi = function(e, t, a, r) {
  var n = Ca(e, t);
  n === null && (n = {}), n[a] = r, ma(e, t, n);
}, Si = function(e, t, a) {
  var r = Ca(e, t);
  return r !== null && (r = a in r ? r[a] : null), r;
}, Ti = function(e, t, a) {
  var r = Ca(e, t);
  if (r !== null && a in r) {
    delete r[a];
    var n = !0;
    for (var s in r) {
      n = !1;
      break;
    }
    n && (r = null), ma(e, t, r);
  }
}, Ii = function(e, t) {
  ma(e, t, null);
}, kr = function(e, t, a) {
  var r = null;
  typeof a > "u" && (a = ["web", "flash"]);
  var n, s = !1, i = null;
  for (var o in a) {
    n = a[o];
    try {
      if (n === "flash" || n === "both") {
        if (t[0] === null)
          throw new Error("Flash local storage not available.");
        r = e.apply(this, t), s = n === "flash";
      }
      (n === "web" || n === "both") && (t[0] = localStorage, r = e.apply(this, t), s = !0);
    } catch (l) {
      i = l;
    }
    if (s)
      break;
  }
  if (!s)
    throw i;
  return r;
};
E.setItem = function(e, t, a, r, n) {
  kr(xi, arguments, n);
};
E.getItem = function(e, t, a, r) {
  return kr(Si, arguments, r);
};
E.removeItem = function(e, t, a, r) {
  kr(Ti, arguments, r);
};
E.clearItems = function(e, t, a) {
  kr(Ii, arguments, a);
};
E.isEmpty = function(e) {
  for (var t in e)
    if (e.hasOwnProperty(t))
      return !1;
  return !0;
};
E.format = function(e) {
  for (var t = /%./g, a, r, n = 0, s = [], i = 0; a = t.exec(e); ) {
    r = e.substring(i, t.lastIndex - 2), r.length > 0 && s.push(r), i = t.lastIndex;
    var o = a[0][1];
    switch (o) {
      case "s":
      case "o":
        n < arguments.length ? s.push(arguments[n++ + 1]) : s.push("<?>");
        break;
      case "%":
        s.push("%");
        break;
      default:
        s.push("<%" + o + "?>");
    }
  }
  return s.push(e.substring(i)), s.join("");
};
E.formatNumber = function(e, t, a, r) {
  var n = e, s = isNaN(t = Math.abs(t)) ? 2 : t, i = a === void 0 ? "," : a, o = r === void 0 ? "." : r, l = n < 0 ? "-" : "", u = parseInt(n = Math.abs(+n || 0).toFixed(s), 10) + "", f = u.length > 3 ? u.length % 3 : 0;
  return l + (f ? u.substr(0, f) + o : "") + u.substr(f).replace(/(\d{3})(?=\d)/g, "$1" + o) + (s ? i + Math.abs(n - u).toFixed(s).slice(2) : "");
};
E.formatSize = function(e) {
  return e >= 1073741824 ? e = E.formatNumber(e / 1073741824, 2, ".", "") + " GiB" : e >= 1048576 ? e = E.formatNumber(e / 1048576, 2, ".", "") + " MiB" : e >= 1024 ? e = E.formatNumber(e / 1024, 0) + " KiB" : e = E.formatNumber(e, 0) + " bytes", e;
};
E.bytesFromIP = function(e) {
  return e.indexOf(".") !== -1 ? E.bytesFromIPv4(e) : e.indexOf(":") !== -1 ? E.bytesFromIPv6(e) : null;
};
E.bytesFromIPv4 = function(e) {
  if (e = e.split("."), e.length !== 4)
    return null;
  for (var t = E.createBuffer(), a = 0; a < e.length; ++a) {
    var r = parseInt(e[a], 10);
    if (isNaN(r))
      return null;
    t.putByte(r);
  }
  return t.getBytes();
};
E.bytesFromIPv6 = function(e) {
  var t = 0;
  e = e.split(":").filter(function(i) {
    return i.length === 0 && ++t, !0;
  });
  for (var a = (8 - e.length + t) * 2, r = E.createBuffer(), n = 0; n < 8; ++n) {
    if (!e[n] || e[n].length === 0) {
      r.fillWithByte(0, a), a = 0;
      continue;
    }
    var s = E.hexToBytes(e[n]);
    s.length < 2 && r.putByte(0), r.putBytes(s);
  }
  return r.getBytes();
};
E.bytesToIP = function(e) {
  return e.length === 4 ? E.bytesToIPv4(e) : e.length === 16 ? E.bytesToIPv6(e) : null;
};
E.bytesToIPv4 = function(e) {
  if (e.length !== 4)
    return null;
  for (var t = [], a = 0; a < e.length; ++a)
    t.push(e.charCodeAt(a));
  return t.join(".");
};
E.bytesToIPv6 = function(e) {
  if (e.length !== 16)
    return null;
  for (var t = [], a = [], r = 0, n = 0; n < e.length; n += 2) {
    for (var s = E.bytesToHex(e[n] + e[n + 1]); s[0] === "0" && s !== "0"; )
      s = s.substr(1);
    if (s === "0") {
      var i = a[a.length - 1], o = t.length;
      !i || o !== i.end + 1 ? a.push({ start: o, end: o }) : (i.end = o, i.end - i.start > a[r].end - a[r].start && (r = a.length - 1));
    }
    t.push(s);
  }
  if (a.length > 0) {
    var l = a[r];
    l.end - l.start > 0 && (t.splice(l.start, l.end - l.start + 1, ""), l.start === 0 && t.unshift(""), l.end === 7 && t.push(""));
  }
  return t.join(":");
};
E.estimateCores = function(e, t) {
  if (typeof e == "function" && (t = e, e = {}), e = e || {}, "cores" in E && !e.update)
    return t(null, E.cores);
  if (typeof navigator < "u" && "hardwareConcurrency" in navigator && navigator.hardwareConcurrency > 0)
    return E.cores = navigator.hardwareConcurrency, t(null, E.cores);
  if (typeof Worker > "u")
    return E.cores = 1, t(null, E.cores);
  if (typeof Blob > "u")
    return E.cores = 2, t(null, E.cores);
  var a = URL.createObjectURL(new Blob([
    "(",
    (function() {
      self.addEventListener("message", function(i) {
        var o = Date.now(), l = o + 4;
        self.postMessage({ st: o, et: l });
      });
    }).toString(),
    ")()"
  ], { type: "application/javascript" }));
  r([], 5, 16);
  function r(i, o, l) {
    if (o === 0) {
      var u = Math.floor(i.reduce(function(f, c) {
        return f + c;
      }, 0) / i.length);
      return E.cores = Math.max(1, u), URL.revokeObjectURL(a), t(null, E.cores);
    }
    n(l, function(f, c) {
      i.push(s(l, c)), r(i, o - 1, l);
    });
  }
  function n(i, o) {
    for (var l = [], u = [], f = 0; f < i; ++f) {
      var c = new Worker(a);
      c.addEventListener("message", function(v) {
        if (u.push(v.data), u.length === i) {
          for (var m = 0; m < i; ++m)
            l[m].terminate();
          o(null, u);
        }
      }), l.push(c);
    }
    for (var f = 0; f < i; ++f)
      l[f].postMessage(f);
  }
  function s(i, o) {
    for (var l = [], u = 0; u < i; ++u)
      for (var f = o[u], c = l[u] = [], v = 0; v < i; ++v)
        if (u !== v) {
          var m = o[v];
          (f.st > m.st && f.st < m.et || m.st > f.st && m.st < f.et) && c.push(v);
        }
    return l.reduce(function(y, x) {
      return Math.max(y, x.length);
    }, 0);
  }
};
var Te = z;
Te.cipher = Te.cipher || {};
Te.cipher.algorithms = Te.cipher.algorithms || {};
Te.cipher.createCipher = function(e, t) {
  var a = e;
  if (typeof a == "string" && (a = Te.cipher.getAlgorithm(a), a && (a = a())), !a)
    throw new Error("Unsupported algorithm: " + e);
  return new Te.cipher.BlockCipher({
    algorithm: a,
    key: t,
    decrypt: !1
  });
};
Te.cipher.createDecipher = function(e, t) {
  var a = e;
  if (typeof a == "string" && (a = Te.cipher.getAlgorithm(a), a && (a = a())), !a)
    throw new Error("Unsupported algorithm: " + e);
  return new Te.cipher.BlockCipher({
    algorithm: a,
    key: t,
    decrypt: !0
  });
};
Te.cipher.registerAlgorithm = function(e, t) {
  e = e.toUpperCase(), Te.cipher.algorithms[e] = t;
};
Te.cipher.getAlgorithm = function(e) {
  return e = e.toUpperCase(), e in Te.cipher.algorithms ? Te.cipher.algorithms[e] : null;
};
var Ea = Te.cipher.BlockCipher = function(e) {
  this.algorithm = e.algorithm, this.mode = this.algorithm.mode, this.blockSize = this.mode.blockSize, this._finish = !1, this._input = null, this.output = null, this._op = e.decrypt ? this.mode.decrypt : this.mode.encrypt, this._decrypt = e.decrypt, this.algorithm.initialize(e);
};
Ea.prototype.start = function(e) {
  e = e || {};
  var t = {};
  for (var a in e)
    t[a] = e[a];
  t.decrypt = this._decrypt, this._finish = !1, this._input = Te.util.createBuffer(), this.output = e.output || Te.util.createBuffer(), this.mode.start(t);
};
Ea.prototype.update = function(e) {
  for (e && this._input.putBuffer(e); !this._op.call(this.mode, this._input, this.output, this._finish) && !this._finish; )
    ;
  this._input.compact();
};
Ea.prototype.finish = function(e) {
  e && (this.mode.name === "ECB" || this.mode.name === "CBC") && (this.mode.pad = function(a) {
    return e(this.blockSize, a, !1);
  }, this.mode.unpad = function(a) {
    return e(this.blockSize, a, !0);
  });
  var t = {};
  return t.decrypt = this._decrypt, t.overflow = this._input.length() % this.blockSize, !(!this._decrypt && this.mode.pad && !this.mode.pad(this._input, t) || (this._finish = !0, this.update(), this._decrypt && this.mode.unpad && !this.mode.unpad(this.output, t)) || this.mode.afterFinish && !this.mode.afterFinish(this.output, t));
};
var Se = z;
Se.cipher = Se.cipher || {};
var X = Se.cipher.modes = Se.cipher.modes || {};
X.ecb = function(e) {
  e = e || {}, this.name = "ECB", this.cipher = e.cipher, this.blockSize = e.blockSize || 16, this._ints = this.blockSize / 4, this._inBlock = new Array(this._ints), this._outBlock = new Array(this._ints);
};
X.ecb.prototype.start = function(e) {
};
X.ecb.prototype.encrypt = function(e, t, a) {
  if (e.length() < this.blockSize && !(a && e.length() > 0))
    return !0;
  for (var r = 0; r < this._ints; ++r)
    this._inBlock[r] = e.getInt32();
  this.cipher.encrypt(this._inBlock, this._outBlock);
  for (var r = 0; r < this._ints; ++r)
    t.putInt32(this._outBlock[r]);
};
X.ecb.prototype.decrypt = function(e, t, a) {
  if (e.length() < this.blockSize && !(a && e.length() > 0))
    return !0;
  for (var r = 0; r < this._ints; ++r)
    this._inBlock[r] = e.getInt32();
  this.cipher.decrypt(this._inBlock, this._outBlock);
  for (var r = 0; r < this._ints; ++r)
    t.putInt32(this._outBlock[r]);
};
X.ecb.prototype.pad = function(e, t) {
  var a = e.length() === this.blockSize ? this.blockSize : this.blockSize - e.length();
  return e.fillWithByte(a, a), !0;
};
X.ecb.prototype.unpad = function(e, t) {
  if (t.overflow > 0)
    return !1;
  var a = e.length(), r = e.at(a - 1);
  return r > this.blockSize << 2 ? !1 : (e.truncate(r), !0);
};
X.cbc = function(e) {
  e = e || {}, this.name = "CBC", this.cipher = e.cipher, this.blockSize = e.blockSize || 16, this._ints = this.blockSize / 4, this._inBlock = new Array(this._ints), this._outBlock = new Array(this._ints);
};
X.cbc.prototype.start = function(e) {
  if (e.iv === null) {
    if (!this._prev)
      throw new Error("Invalid IV parameter.");
    this._iv = this._prev.slice(0);
  } else if ("iv" in e)
    this._iv = Dr(e.iv, this.blockSize), this._prev = this._iv.slice(0);
  else
    throw new Error("Invalid IV parameter.");
};
X.cbc.prototype.encrypt = function(e, t, a) {
  if (e.length() < this.blockSize && !(a && e.length() > 0))
    return !0;
  for (var r = 0; r < this._ints; ++r)
    this._inBlock[r] = this._prev[r] ^ e.getInt32();
  this.cipher.encrypt(this._inBlock, this._outBlock);
  for (var r = 0; r < this._ints; ++r)
    t.putInt32(this._outBlock[r]);
  this._prev = this._outBlock;
};
X.cbc.prototype.decrypt = function(e, t, a) {
  if (e.length() < this.blockSize && !(a && e.length() > 0))
    return !0;
  for (var r = 0; r < this._ints; ++r)
    this._inBlock[r] = e.getInt32();
  this.cipher.decrypt(this._inBlock, this._outBlock);
  for (var r = 0; r < this._ints; ++r)
    t.putInt32(this._prev[r] ^ this._outBlock[r]);
  this._prev = this._inBlock.slice(0);
};
X.cbc.prototype.pad = function(e, t) {
  var a = e.length() === this.blockSize ? this.blockSize : this.blockSize - e.length();
  return e.fillWithByte(a, a), !0;
};
X.cbc.prototype.unpad = function(e, t) {
  if (t.overflow > 0)
    return !1;
  var a = e.length(), r = e.at(a - 1);
  return r > this.blockSize << 2 ? !1 : (e.truncate(r), !0);
};
X.cfb = function(e) {
  e = e || {}, this.name = "CFB", this.cipher = e.cipher, this.blockSize = e.blockSize || 16, this._ints = this.blockSize / 4, this._inBlock = null, this._outBlock = new Array(this._ints), this._partialBlock = new Array(this._ints), this._partialOutput = Se.util.createBuffer(), this._partialBytes = 0;
};
X.cfb.prototype.start = function(e) {
  if (!("iv" in e))
    throw new Error("Invalid IV parameter.");
  this._iv = Dr(e.iv, this.blockSize), this._inBlock = this._iv.slice(0), this._partialBytes = 0;
};
X.cfb.prototype.encrypt = function(e, t, a) {
  var r = e.length();
  if (r === 0)
    return !0;
  if (this.cipher.encrypt(this._inBlock, this._outBlock), this._partialBytes === 0 && r >= this.blockSize) {
    for (var n = 0; n < this._ints; ++n)
      this._inBlock[n] = e.getInt32() ^ this._outBlock[n], t.putInt32(this._inBlock[n]);
    return;
  }
  var s = (this.blockSize - r) % this.blockSize;
  s > 0 && (s = this.blockSize - s), this._partialOutput.clear();
  for (var n = 0; n < this._ints; ++n)
    this._partialBlock[n] = e.getInt32() ^ this._outBlock[n], this._partialOutput.putInt32(this._partialBlock[n]);
  if (s > 0)
    e.read -= this.blockSize;
  else
    for (var n = 0; n < this._ints; ++n)
      this._inBlock[n] = this._partialBlock[n];
  if (this._partialBytes > 0 && this._partialOutput.getBytes(this._partialBytes), s > 0 && !a)
    return t.putBytes(this._partialOutput.getBytes(
      s - this._partialBytes
    )), this._partialBytes = s, !0;
  t.putBytes(this._partialOutput.getBytes(
    r - this._partialBytes
  )), this._partialBytes = 0;
};
X.cfb.prototype.decrypt = function(e, t, a) {
  var r = e.length();
  if (r === 0)
    return !0;
  if (this.cipher.encrypt(this._inBlock, this._outBlock), this._partialBytes === 0 && r >= this.blockSize) {
    for (var n = 0; n < this._ints; ++n)
      this._inBlock[n] = e.getInt32(), t.putInt32(this._inBlock[n] ^ this._outBlock[n]);
    return;
  }
  var s = (this.blockSize - r) % this.blockSize;
  s > 0 && (s = this.blockSize - s), this._partialOutput.clear();
  for (var n = 0; n < this._ints; ++n)
    this._partialBlock[n] = e.getInt32(), this._partialOutput.putInt32(this._partialBlock[n] ^ this._outBlock[n]);
  if (s > 0)
    e.read -= this.blockSize;
  else
    for (var n = 0; n < this._ints; ++n)
      this._inBlock[n] = this._partialBlock[n];
  if (this._partialBytes > 0 && this._partialOutput.getBytes(this._partialBytes), s > 0 && !a)
    return t.putBytes(this._partialOutput.getBytes(
      s - this._partialBytes
    )), this._partialBytes = s, !0;
  t.putBytes(this._partialOutput.getBytes(
    r - this._partialBytes
  )), this._partialBytes = 0;
};
X.ofb = function(e) {
  e = e || {}, this.name = "OFB", this.cipher = e.cipher, this.blockSize = e.blockSize || 16, this._ints = this.blockSize / 4, this._inBlock = null, this._outBlock = new Array(this._ints), this._partialOutput = Se.util.createBuffer(), this._partialBytes = 0;
};
X.ofb.prototype.start = function(e) {
  if (!("iv" in e))
    throw new Error("Invalid IV parameter.");
  this._iv = Dr(e.iv, this.blockSize), this._inBlock = this._iv.slice(0), this._partialBytes = 0;
};
X.ofb.prototype.encrypt = function(e, t, a) {
  var r = e.length();
  if (e.length() === 0)
    return !0;
  if (this.cipher.encrypt(this._inBlock, this._outBlock), this._partialBytes === 0 && r >= this.blockSize) {
    for (var n = 0; n < this._ints; ++n)
      t.putInt32(e.getInt32() ^ this._outBlock[n]), this._inBlock[n] = this._outBlock[n];
    return;
  }
  var s = (this.blockSize - r) % this.blockSize;
  s > 0 && (s = this.blockSize - s), this._partialOutput.clear();
  for (var n = 0; n < this._ints; ++n)
    this._partialOutput.putInt32(e.getInt32() ^ this._outBlock[n]);
  if (s > 0)
    e.read -= this.blockSize;
  else
    for (var n = 0; n < this._ints; ++n)
      this._inBlock[n] = this._outBlock[n];
  if (this._partialBytes > 0 && this._partialOutput.getBytes(this._partialBytes), s > 0 && !a)
    return t.putBytes(this._partialOutput.getBytes(
      s - this._partialBytes
    )), this._partialBytes = s, !0;
  t.putBytes(this._partialOutput.getBytes(
    r - this._partialBytes
  )), this._partialBytes = 0;
};
X.ofb.prototype.decrypt = X.ofb.prototype.encrypt;
X.ctr = function(e) {
  e = e || {}, this.name = "CTR", this.cipher = e.cipher, this.blockSize = e.blockSize || 16, this._ints = this.blockSize / 4, this._inBlock = null, this._outBlock = new Array(this._ints), this._partialOutput = Se.util.createBuffer(), this._partialBytes = 0;
};
X.ctr.prototype.start = function(e) {
  if (!("iv" in e))
    throw new Error("Invalid IV parameter.");
  this._iv = Dr(e.iv, this.blockSize), this._inBlock = this._iv.slice(0), this._partialBytes = 0;
};
X.ctr.prototype.encrypt = function(e, t, a) {
  var r = e.length();
  if (r === 0)
    return !0;
  if (this.cipher.encrypt(this._inBlock, this._outBlock), this._partialBytes === 0 && r >= this.blockSize)
    for (var n = 0; n < this._ints; ++n)
      t.putInt32(e.getInt32() ^ this._outBlock[n]);
  else {
    var s = (this.blockSize - r) % this.blockSize;
    s > 0 && (s = this.blockSize - s), this._partialOutput.clear();
    for (var n = 0; n < this._ints; ++n)
      this._partialOutput.putInt32(e.getInt32() ^ this._outBlock[n]);
    if (s > 0 && (e.read -= this.blockSize), this._partialBytes > 0 && this._partialOutput.getBytes(this._partialBytes), s > 0 && !a)
      return t.putBytes(this._partialOutput.getBytes(
        s - this._partialBytes
      )), this._partialBytes = s, !0;
    t.putBytes(this._partialOutput.getBytes(
      r - this._partialBytes
    )), this._partialBytes = 0;
  }
  Ur(this._inBlock);
};
X.ctr.prototype.decrypt = X.ctr.prototype.encrypt;
X.gcm = function(e) {
  e = e || {}, this.name = "GCM", this.cipher = e.cipher, this.blockSize = e.blockSize || 16, this._ints = this.blockSize / 4, this._inBlock = new Array(this._ints), this._outBlock = new Array(this._ints), this._partialOutput = Se.util.createBuffer(), this._partialBytes = 0, this._R = 3774873600;
};
X.gcm.prototype.start = function(e) {
  if (!("iv" in e))
    throw new Error("Invalid IV parameter.");
  var t = Se.util.createBuffer(e.iv);
  this._cipherLength = 0;
  var a;
  if ("additionalData" in e ? a = Se.util.createBuffer(e.additionalData) : a = Se.util.createBuffer(), "tagLength" in e ? this._tagLength = e.tagLength : this._tagLength = 128, this._tag = null, e.decrypt && (this._tag = Se.util.createBuffer(e.tag).getBytes(), this._tag.length !== this._tagLength / 8))
    throw new Error("Authentication tag does not match tag length.");
  this._hashBlock = new Array(this._ints), this.tag = null, this._hashSubkey = new Array(this._ints), this.cipher.encrypt([0, 0, 0, 0], this._hashSubkey), this.componentBits = 4, this._m = this.generateHashTable(this._hashSubkey, this.componentBits);
  var r = t.length();
  if (r === 12)
    this._j0 = [t.getInt32(), t.getInt32(), t.getInt32(), 1];
  else {
    for (this._j0 = [0, 0, 0, 0]; t.length() > 0; )
      this._j0 = this.ghash(
        this._hashSubkey,
        this._j0,
        [t.getInt32(), t.getInt32(), t.getInt32(), t.getInt32()]
      );
    this._j0 = this.ghash(
      this._hashSubkey,
      this._j0,
      [0, 0].concat(Xr(r * 8))
    );
  }
  this._inBlock = this._j0.slice(0), Ur(this._inBlock), this._partialBytes = 0, a = Se.util.createBuffer(a), this._aDataLength = Xr(a.length() * 8);
  var n = a.length() % this.blockSize;
  for (n && a.fillWithByte(0, this.blockSize - n), this._s = [0, 0, 0, 0]; a.length() > 0; )
    this._s = this.ghash(this._hashSubkey, this._s, [
      a.getInt32(),
      a.getInt32(),
      a.getInt32(),
      a.getInt32()
    ]);
};
X.gcm.prototype.encrypt = function(e, t, a) {
  var r = e.length();
  if (r === 0)
    return !0;
  if (this.cipher.encrypt(this._inBlock, this._outBlock), this._partialBytes === 0 && r >= this.blockSize) {
    for (var n = 0; n < this._ints; ++n)
      t.putInt32(this._outBlock[n] ^= e.getInt32());
    this._cipherLength += this.blockSize;
  } else {
    var s = (this.blockSize - r) % this.blockSize;
    s > 0 && (s = this.blockSize - s), this._partialOutput.clear();
    for (var n = 0; n < this._ints; ++n)
      this._partialOutput.putInt32(e.getInt32() ^ this._outBlock[n]);
    if (s <= 0 || a) {
      if (a) {
        var i = r % this.blockSize;
        this._cipherLength += i, this._partialOutput.truncate(this.blockSize - i);
      } else
        this._cipherLength += this.blockSize;
      for (var n = 0; n < this._ints; ++n)
        this._outBlock[n] = this._partialOutput.getInt32();
      this._partialOutput.read -= this.blockSize;
    }
    if (this._partialBytes > 0 && this._partialOutput.getBytes(this._partialBytes), s > 0 && !a)
      return e.read -= this.blockSize, t.putBytes(this._partialOutput.getBytes(
        s - this._partialBytes
      )), this._partialBytes = s, !0;
    t.putBytes(this._partialOutput.getBytes(
      r - this._partialBytes
    )), this._partialBytes = 0;
  }
  this._s = this.ghash(this._hashSubkey, this._s, this._outBlock), Ur(this._inBlock);
};
X.gcm.prototype.decrypt = function(e, t, a) {
  var r = e.length();
  if (r < this.blockSize && !(a && r > 0))
    return !0;
  this.cipher.encrypt(this._inBlock, this._outBlock), Ur(this._inBlock), this._hashBlock[0] = e.getInt32(), this._hashBlock[1] = e.getInt32(), this._hashBlock[2] = e.getInt32(), this._hashBlock[3] = e.getInt32(), this._s = this.ghash(this._hashSubkey, this._s, this._hashBlock);
  for (var n = 0; n < this._ints; ++n)
    t.putInt32(this._outBlock[n] ^ this._hashBlock[n]);
  r < this.blockSize ? this._cipherLength += r % this.blockSize : this._cipherLength += this.blockSize;
};
X.gcm.prototype.afterFinish = function(e, t) {
  var a = !0;
  t.decrypt && t.overflow && e.truncate(this.blockSize - t.overflow), this.tag = Se.util.createBuffer();
  var r = this._aDataLength.concat(Xr(this._cipherLength * 8));
  this._s = this.ghash(this._hashSubkey, this._s, r);
  var n = [];
  this.cipher.encrypt(this._j0, n);
  for (var s = 0; s < this._ints; ++s)
    this.tag.putInt32(this._s[s] ^ n[s]);
  return this.tag.truncate(this.tag.length() % (this._tagLength / 8)), t.decrypt && this.tag.bytes() !== this._tag && (a = !1), a;
};
X.gcm.prototype.multiply = function(e, t) {
  for (var a = [0, 0, 0, 0], r = t.slice(0), n = 0; n < 128; ++n) {
    var s = e[n / 32 | 0] & 1 << 31 - n % 32;
    s && (a[0] ^= r[0], a[1] ^= r[1], a[2] ^= r[2], a[3] ^= r[3]), this.pow(r, r);
  }
  return a;
};
X.gcm.prototype.pow = function(e, t) {
  for (var a = e[3] & 1, r = 3; r > 0; --r)
    t[r] = e[r] >>> 1 | (e[r - 1] & 1) << 31;
  t[0] = e[0] >>> 1, a && (t[0] ^= this._R);
};
X.gcm.prototype.tableMultiply = function(e) {
  for (var t = [0, 0, 0, 0], a = 0; a < 32; ++a) {
    var r = a / 8 | 0, n = e[r] >>> (7 - a % 8) * 4 & 15, s = this._m[a][n];
    t[0] ^= s[0], t[1] ^= s[1], t[2] ^= s[2], t[3] ^= s[3];
  }
  return t;
};
X.gcm.prototype.ghash = function(e, t, a) {
  return t[0] ^= a[0], t[1] ^= a[1], t[2] ^= a[2], t[3] ^= a[3], this.tableMultiply(t);
};
X.gcm.prototype.generateHashTable = function(e, t) {
  for (var a = 8 / t, r = 4 * a, n = 16 * a, s = new Array(n), i = 0; i < n; ++i) {
    var o = [0, 0, 0, 0], l = i / r | 0, u = (r - 1 - i % r) * t;
    o[l] = 1 << t - 1 << u, s[i] = this.generateSubHashTable(this.multiply(o, e), t);
  }
  return s;
};
X.gcm.prototype.generateSubHashTable = function(e, t) {
  var a = 1 << t, r = a >>> 1, n = new Array(a);
  n[r] = e.slice(0);
  for (var s = r >>> 1; s > 0; )
    this.pow(n[2 * s], n[s] = []), s >>= 1;
  for (s = 2; s < r; ) {
    for (var i = 1; i < s; ++i) {
      var o = n[s], l = n[i];
      n[s + i] = [
        o[0] ^ l[0],
        o[1] ^ l[1],
        o[2] ^ l[2],
        o[3] ^ l[3]
      ];
    }
    s *= 2;
  }
  for (n[0] = [0, 0, 0, 0], s = r + 1; s < a; ++s) {
    var u = n[s ^ r];
    n[s] = [e[0] ^ u[0], e[1] ^ u[1], e[2] ^ u[2], e[3] ^ u[3]];
  }
  return n;
};
function Dr(e, t) {
  if (typeof e == "string" && (e = Se.util.createBuffer(e)), Se.util.isArray(e) && e.length > 4) {
    var a = e;
    e = Se.util.createBuffer();
    for (var r = 0; r < a.length; ++r)
      e.putByte(a[r]);
  }
  if (e.length() < t)
    throw new Error(
      "Invalid IV length; got " + e.length() + " bytes and expected " + t + " bytes."
    );
  if (!Se.util.isArray(e)) {
    for (var n = [], s = t / 4, r = 0; r < s; ++r)
      n.push(e.getInt32());
    e = n;
  }
  return e;
}
function Ur(e) {
  e[e.length - 1] = e[e.length - 1] + 1 & 4294967295;
}
function Xr(e) {
  return [e / 4294967296 | 0, e & 4294967295];
}
var ue = z;
ue.aes = ue.aes || {};
ue.aes.startEncrypting = function(e, t, a, r) {
  var n = Pr({
    key: e,
    output: a,
    decrypt: !1,
    mode: r
  });
  return n.start(t), n;
};
ue.aes.createEncryptionCipher = function(e, t) {
  return Pr({
    key: e,
    output: null,
    decrypt: !1,
    mode: t
  });
};
ue.aes.startDecrypting = function(e, t, a, r) {
  var n = Pr({
    key: e,
    output: a,
    decrypt: !0,
    mode: r
  });
  return n.start(t), n;
};
ue.aes.createDecryptionCipher = function(e, t) {
  return Pr({
    key: e,
    output: null,
    decrypt: !0,
    mode: t
  });
};
ue.aes.Algorithm = function(e, t) {
  xa || vn();
  var a = this;
  a.name = e, a.mode = new t({
    blockSize: 16,
    cipher: {
      encrypt: function(r, n) {
        return Zr(a._w, r, n, !1);
      },
      decrypt: function(r, n) {
        return Zr(a._w, r, n, !0);
      }
    }
  }), a._init = !1;
};
ue.aes.Algorithm.prototype.initialize = function(e) {
  if (!this._init) {
    var t = e.key, a;
    if (typeof t == "string" && (t.length === 16 || t.length === 24 || t.length === 32))
      t = ue.util.createBuffer(t);
    else if (ue.util.isArray(t) && (t.length === 16 || t.length === 24 || t.length === 32)) {
      a = t, t = ue.util.createBuffer();
      for (var r = 0; r < a.length; ++r)
        t.putByte(a[r]);
    }
    if (!ue.util.isArray(t)) {
      a = t, t = [];
      var n = a.length();
      if (n === 16 || n === 24 || n === 32) {
        n = n >>> 2;
        for (var r = 0; r < n; ++r)
          t.push(a.getInt32());
      }
    }
    if (!ue.util.isArray(t) || !(t.length === 4 || t.length === 6 || t.length === 8))
      throw new Error("Invalid key parameter.");
    var s = this.mode.name, i = ["CFB", "OFB", "CTR", "GCM"].indexOf(s) !== -1;
    this._w = yn(t, e.decrypt && !i), this._init = !0;
  }
};
ue.aes._expandKey = function(e, t) {
  return xa || vn(), yn(e, t);
};
ue.aes._updateBlock = Zr;
Zt("AES-ECB", ue.cipher.modes.ecb);
Zt("AES-CBC", ue.cipher.modes.cbc);
Zt("AES-CFB", ue.cipher.modes.cfb);
Zt("AES-OFB", ue.cipher.modes.ofb);
Zt("AES-CTR", ue.cipher.modes.ctr);
Zt("AES-GCM", ue.cipher.modes.gcm);
function Zt(e, t) {
  var a = function() {
    return new ue.aes.Algorithm(e, t);
  };
  ue.cipher.registerAlgorithm(e, a);
}
var xa = !1, Ht = 4, Me, jr, pn, Vt, nt;
function vn() {
  xa = !0, pn = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
  for (var e = new Array(256), t = 0; t < 128; ++t)
    e[t] = t << 1, e[t + 128] = t + 128 << 1 ^ 283;
  Me = new Array(256), jr = new Array(256), Vt = new Array(4), nt = new Array(4);
  for (var t = 0; t < 4; ++t)
    Vt[t] = new Array(256), nt[t] = new Array(256);
  for (var a = 0, r = 0, n, s, i, o, l, u, f, t = 0; t < 256; ++t) {
    o = r ^ r << 1 ^ r << 2 ^ r << 3 ^ r << 4, o = o >> 8 ^ o & 255 ^ 99, Me[a] = o, jr[o] = a, l = e[o], n = e[a], s = e[n], i = e[s], u = l << 24 ^ // 2
    o << 16 ^ // 1
    o << 8 ^ // 1
    (o ^ l), f = (n ^ s ^ i) << 24 ^ // E (14)
    (a ^ i) << 16 ^ // 9
    (a ^ s ^ i) << 8 ^ // D (13)
    (a ^ n ^ i);
    for (var c = 0; c < 4; ++c)
      Vt[c][a] = u, nt[c][o] = f, u = u << 24 | u >>> 8, f = f << 24 | f >>> 8;
    a === 0 ? a = r = 1 : (a = n ^ e[e[e[n ^ i]]], r ^= e[e[r]]);
  }
}
function yn(e, t) {
  for (var a = e.slice(0), r, n = 1, s = a.length, i = s + 6 + 1, o = Ht * i, l = s; l < o; ++l)
    r = a[l - 1], l % s === 0 ? (r = Me[r >>> 16 & 255] << 24 ^ Me[r >>> 8 & 255] << 16 ^ Me[r & 255] << 8 ^ Me[r >>> 24] ^ pn[n] << 24, n++) : s > 6 && l % s === 4 && (r = Me[r >>> 24] << 24 ^ Me[r >>> 16 & 255] << 16 ^ Me[r >>> 8 & 255] << 8 ^ Me[r & 255]), a[l] = a[l - s] ^ r;
  if (t) {
    var u, f = nt[0], c = nt[1], v = nt[2], m = nt[3], y = a.slice(0);
    o = a.length;
    for (var l = 0, x = o - Ht; l < o; l += Ht, x -= Ht)
      if (l === 0 || l === o - Ht)
        y[l] = a[x], y[l + 1] = a[x + 3], y[l + 2] = a[x + 2], y[l + 3] = a[x + 1];
      else
        for (var S = 0; S < Ht; ++S)
          u = a[x + S], y[l + (3 & -S)] = f[Me[u >>> 24]] ^ c[Me[u >>> 16 & 255]] ^ v[Me[u >>> 8 & 255]] ^ m[Me[u & 255]];
    a = y;
  }
  return a;
}
function Zr(e, t, a, r) {
  var n = e.length / 4 - 1, s, i, o, l, u;
  r ? (s = nt[0], i = nt[1], o = nt[2], l = nt[3], u = jr) : (s = Vt[0], i = Vt[1], o = Vt[2], l = Vt[3], u = Me);
  var f, c, v, m, y, x, S;
  f = t[0] ^ e[0], c = t[r ? 3 : 1] ^ e[1], v = t[2] ^ e[2], m = t[r ? 1 : 3] ^ e[3];
  for (var I = 3, b = 1; b < n; ++b)
    y = s[f >>> 24] ^ i[c >>> 16 & 255] ^ o[v >>> 8 & 255] ^ l[m & 255] ^ e[++I], x = s[c >>> 24] ^ i[v >>> 16 & 255] ^ o[m >>> 8 & 255] ^ l[f & 255] ^ e[++I], S = s[v >>> 24] ^ i[m >>> 16 & 255] ^ o[f >>> 8 & 255] ^ l[c & 255] ^ e[++I], m = s[m >>> 24] ^ i[f >>> 16 & 255] ^ o[c >>> 8 & 255] ^ l[v & 255] ^ e[++I], f = y, c = x, v = S;
  a[0] = u[f >>> 24] << 24 ^ u[c >>> 16 & 255] << 16 ^ u[v >>> 8 & 255] << 8 ^ u[m & 255] ^ e[++I], a[r ? 3 : 1] = u[c >>> 24] << 24 ^ u[v >>> 16 & 255] << 16 ^ u[m >>> 8 & 255] << 8 ^ u[f & 255] ^ e[++I], a[2] = u[v >>> 24] << 24 ^ u[m >>> 16 & 255] << 16 ^ u[f >>> 8 & 255] << 8 ^ u[c & 255] ^ e[++I], a[r ? 1 : 3] = u[m >>> 24] << 24 ^ u[f >>> 16 & 255] << 16 ^ u[c >>> 8 & 255] << 8 ^ u[v & 255] ^ e[++I];
}
function Pr(e) {
  e = e || {};
  var t = (e.mode || "CBC").toUpperCase(), a = "AES-" + t, r;
  e.decrypt ? r = ue.cipher.createDecipher(a, e.key) : r = ue.cipher.createCipher(a, e.key);
  var n = r.start;
  return r.start = function(s, i) {
    var o = null;
    i instanceof ue.util.ByteBuffer && (o = i, i = {}), i = i || {}, i.output = o, i.iv = s, n.call(r, i);
  }, r;
}
var sr = z;
sr.pki = sr.pki || {};
var Jr = sr.pki.oids = sr.oids = sr.oids || {};
function R(e, t) {
  Jr[e] = t, Jr[t] = e;
}
function te(e, t) {
  Jr[e] = t;
}
R("1.2.840.113549.1.1.1", "rsaEncryption");
R("1.2.840.113549.1.1.4", "md5WithRSAEncryption");
R("1.2.840.113549.1.1.5", "sha1WithRSAEncryption");
R("1.2.840.113549.1.1.7", "RSAES-OAEP");
R("1.2.840.113549.1.1.8", "mgf1");
R("1.2.840.113549.1.1.9", "pSpecified");
R("1.2.840.113549.1.1.10", "RSASSA-PSS");
R("1.2.840.113549.1.1.11", "sha256WithRSAEncryption");
R("1.2.840.113549.1.1.12", "sha384WithRSAEncryption");
R("1.2.840.113549.1.1.13", "sha512WithRSAEncryption");
R("1.3.101.112", "EdDSA25519");
R("1.2.840.10040.4.3", "dsa-with-sha1");
R("1.3.14.3.2.7", "desCBC");
R("1.3.14.3.2.26", "sha1");
R("1.3.14.3.2.29", "sha1WithRSASignature");
R("2.16.840.1.101.3.4.2.1", "sha256");
R("2.16.840.1.101.3.4.2.2", "sha384");
R("2.16.840.1.101.3.4.2.3", "sha512");
R("2.16.840.1.101.3.4.2.4", "sha224");
R("2.16.840.1.101.3.4.2.5", "sha512-224");
R("2.16.840.1.101.3.4.2.6", "sha512-256");
R("1.2.840.113549.2.2", "md2");
R("1.2.840.113549.2.5", "md5");
R("1.2.840.113549.1.7.1", "data");
R("1.2.840.113549.1.7.2", "signedData");
R("1.2.840.113549.1.7.3", "envelopedData");
R("1.2.840.113549.1.7.4", "signedAndEnvelopedData");
R("1.2.840.113549.1.7.5", "digestedData");
R("1.2.840.113549.1.7.6", "encryptedData");
R("1.2.840.113549.1.9.1", "emailAddress");
R("1.2.840.113549.1.9.2", "unstructuredName");
R("1.2.840.113549.1.9.3", "contentType");
R("1.2.840.113549.1.9.4", "messageDigest");
R("1.2.840.113549.1.9.5", "signingTime");
R("1.2.840.113549.1.9.6", "counterSignature");
R("1.2.840.113549.1.9.7", "challengePassword");
R("1.2.840.113549.1.9.8", "unstructuredAddress");
R("1.2.840.113549.1.9.14", "extensionRequest");
R("1.2.840.113549.1.9.20", "friendlyName");
R("1.2.840.113549.1.9.21", "localKeyId");
R("1.2.840.113549.1.9.22.1", "x509Certificate");
R("1.2.840.113549.1.12.10.1.1", "keyBag");
R("1.2.840.113549.1.12.10.1.2", "pkcs8ShroudedKeyBag");
R("1.2.840.113549.1.12.10.1.3", "certBag");
R("1.2.840.113549.1.12.10.1.4", "crlBag");
R("1.2.840.113549.1.12.10.1.5", "secretBag");
R("1.2.840.113549.1.12.10.1.6", "safeContentsBag");
R("1.2.840.113549.1.5.13", "pkcs5PBES2");
R("1.2.840.113549.1.5.12", "pkcs5PBKDF2");
R("1.2.840.113549.1.12.1.1", "pbeWithSHAAnd128BitRC4");
R("1.2.840.113549.1.12.1.2", "pbeWithSHAAnd40BitRC4");
R("1.2.840.113549.1.12.1.3", "pbeWithSHAAnd3-KeyTripleDES-CBC");
R("1.2.840.113549.1.12.1.4", "pbeWithSHAAnd2-KeyTripleDES-CBC");
R("1.2.840.113549.1.12.1.5", "pbeWithSHAAnd128BitRC2-CBC");
R("1.2.840.113549.1.12.1.6", "pbewithSHAAnd40BitRC2-CBC");
R("1.2.840.113549.2.7", "hmacWithSHA1");
R("1.2.840.113549.2.8", "hmacWithSHA224");
R("1.2.840.113549.2.9", "hmacWithSHA256");
R("1.2.840.113549.2.10", "hmacWithSHA384");
R("1.2.840.113549.2.11", "hmacWithSHA512");
R("1.2.840.113549.3.7", "des-EDE3-CBC");
R("2.16.840.1.101.3.4.1.2", "aes128-CBC");
R("2.16.840.1.101.3.4.1.22", "aes192-CBC");
R("2.16.840.1.101.3.4.1.42", "aes256-CBC");
R("2.5.4.3", "commonName");
R("2.5.4.4", "surname");
R("2.5.4.5", "serialNumber");
R("2.5.4.6", "countryName");
R("2.5.4.7", "localityName");
R("2.5.4.8", "stateOrProvinceName");
R("2.5.4.9", "streetAddress");
R("2.5.4.10", "organizationName");
R("2.5.4.11", "organizationalUnitName");
R("2.5.4.12", "title");
R("2.5.4.13", "description");
R("2.5.4.15", "businessCategory");
R("2.5.4.17", "postalCode");
R("2.5.4.42", "givenName");
R("2.5.4.65", "pseudonym");
R("1.3.6.1.4.1.311.60.2.1.2", "jurisdictionOfIncorporationStateOrProvinceName");
R("1.3.6.1.4.1.311.60.2.1.3", "jurisdictionOfIncorporationCountryName");
R("2.16.840.1.113730.1.1", "nsCertType");
R("2.16.840.1.113730.1.13", "nsComment");
te("2.5.29.1", "authorityKeyIdentifier");
te("2.5.29.2", "keyAttributes");
te("2.5.29.3", "certificatePolicies");
te("2.5.29.4", "keyUsageRestriction");
te("2.5.29.5", "policyMapping");
te("2.5.29.6", "subtreesConstraint");
te("2.5.29.7", "subjectAltName");
te("2.5.29.8", "issuerAltName");
te("2.5.29.9", "subjectDirectoryAttributes");
te("2.5.29.10", "basicConstraints");
te("2.5.29.11", "nameConstraints");
te("2.5.29.12", "policyConstraints");
te("2.5.29.13", "basicConstraints");
R("2.5.29.14", "subjectKeyIdentifier");
R("2.5.29.15", "keyUsage");
te("2.5.29.16", "privateKeyUsagePeriod");
R("2.5.29.17", "subjectAltName");
R("2.5.29.18", "issuerAltName");
R("2.5.29.19", "basicConstraints");
te("2.5.29.20", "cRLNumber");
te("2.5.29.21", "cRLReason");
te("2.5.29.22", "expirationDate");
te("2.5.29.23", "instructionCode");
te("2.5.29.24", "invalidityDate");
te("2.5.29.25", "cRLDistributionPoints");
te("2.5.29.26", "issuingDistributionPoint");
te("2.5.29.27", "deltaCRLIndicator");
te("2.5.29.28", "issuingDistributionPoint");
te("2.5.29.29", "certificateIssuer");
te("2.5.29.30", "nameConstraints");
R("2.5.29.31", "cRLDistributionPoints");
R("2.5.29.32", "certificatePolicies");
te("2.5.29.33", "policyMappings");
te("2.5.29.34", "policyConstraints");
R("2.5.29.35", "authorityKeyIdentifier");
te("2.5.29.36", "policyConstraints");
R("2.5.29.37", "extKeyUsage");
te("2.5.29.46", "freshestCRL");
te("2.5.29.54", "inhibitAnyPolicy");
R("1.3.6.1.4.1.11129.2.4.2", "timestampList");
R("1.3.6.1.5.5.7.1.1", "authorityInfoAccess");
R("1.3.6.1.5.5.7.3.1", "serverAuth");
R("1.3.6.1.5.5.7.3.2", "clientAuth");
R("1.3.6.1.5.5.7.3.3", "codeSigning");
R("1.3.6.1.5.5.7.3.4", "emailProtection");
R("1.3.6.1.5.5.7.3.8", "timeStamping");
var le = z, U = le.asn1 = le.asn1 || {};
U.Class = {
  UNIVERSAL: 0,
  APPLICATION: 64,
  CONTEXT_SPECIFIC: 128,
  PRIVATE: 192
};
U.Type = {
  NONE: 0,
  BOOLEAN: 1,
  INTEGER: 2,
  BITSTRING: 3,
  OCTETSTRING: 4,
  NULL: 5,
  OID: 6,
  ODESC: 7,
  EXTERNAL: 8,
  REAL: 9,
  ENUMERATED: 10,
  EMBEDDED: 11,
  UTF8: 12,
  ROID: 13,
  SEQUENCE: 16,
  SET: 17,
  PRINTABLESTRING: 19,
  IA5STRING: 22,
  UTCTIME: 23,
  GENERALIZEDTIME: 24,
  BMPSTRING: 30
};
U.maxDepth = 256;
U.create = function(e, t, a, r, n) {
  if (le.util.isArray(r)) {
    for (var s = [], i = 0; i < r.length; ++i)
      r[i] !== void 0 && s.push(r[i]);
    r = s;
  }
  var o = {
    tagClass: e,
    type: t,
    constructed: a,
    composed: a || le.util.isArray(r),
    value: r
  };
  return n && "bitStringContents" in n && (o.bitStringContents = n.bitStringContents, o.original = U.copy(o)), o;
};
U.copy = function(e, t) {
  var a;
  if (le.util.isArray(e)) {
    a = [];
    for (var r = 0; r < e.length; ++r)
      a.push(U.copy(e[r], t));
    return a;
  }
  return typeof e == "string" ? e : (a = {
    tagClass: e.tagClass,
    type: e.type,
    constructed: e.constructed,
    composed: e.composed,
    value: U.copy(e.value, t)
  }, t && !t.excludeBitStringContents && (a.bitStringContents = e.bitStringContents), a);
};
U.equals = function(e, t, a) {
  if (le.util.isArray(e)) {
    if (!le.util.isArray(t) || e.length !== t.length)
      return !1;
    for (var r = 0; r < e.length; ++r)
      if (!U.equals(e[r], t[r]))
        return !1;
    return !0;
  }
  if (typeof e != typeof t)
    return !1;
  if (typeof e == "string")
    return e === t;
  var n = e.tagClass === t.tagClass && e.type === t.type && e.constructed === t.constructed && e.composed === t.composed && U.equals(e.value, t.value);
  return a && a.includeBitStringContents && (n = n && e.bitStringContents === t.bitStringContents), n;
};
U.getBerValueLength = function(e) {
  var t = e.getByte();
  if (t !== 128) {
    var a, r = t & 128;
    return r ? a = e.getInt((t & 127) << 3) : a = t, a;
  }
};
function nr(e, t, a) {
  if (a > t) {
    var r = new Error("Too few bytes to parse DER.");
    throw r.available = e.length(), r.remaining = t, r.requested = a, r;
  }
}
var Ai = function(e, t) {
  var a = e.getByte();
  if (t--, a !== 128) {
    var r, n = a & 128;
    if (!n)
      r = a;
    else {
      var s = a & 127;
      nr(e, t, s), r = e.getInt(s << 3);
    }
    if (r < 0)
      throw new Error("Negative length: " + r);
    return r;
  }
};
U.fromDer = function(e, t) {
  t === void 0 && (t = {
    strict: !0,
    parseAllBytes: !0,
    decodeBitStrings: !0
  }), typeof t == "boolean" && (t = {
    strict: t,
    parseAllBytes: !0,
    decodeBitStrings: !0
  }), "strict" in t || (t.strict = !0), "parseAllBytes" in t || (t.parseAllBytes = !0), "decodeBitStrings" in t || (t.decodeBitStrings = !0), "maxDepth" in t || (t.maxDepth = U.maxDepth), typeof e == "string" && (e = le.util.createBuffer(e));
  var a = e.length(), r = Cr(e, e.length(), 0, t);
  if (t.parseAllBytes && e.length() !== 0) {
    var n = new Error("Unparsed DER bytes remain after ASN.1 parsing.");
    throw n.byteCount = a, n.remaining = e.length(), n;
  }
  return r;
};
function Cr(e, t, a, r) {
  if (a >= r.maxDepth)
    throw new Error("ASN.1 parsing error: Max depth exceeded.");
  var n;
  nr(e, t, 2);
  var s = e.getByte();
  t--;
  var i = s & 192, o = s & 31;
  n = e.length();
  var l = Ai(e, t);
  if (t -= n - e.length(), l !== void 0 && l > t) {
    if (r.strict) {
      var u = new Error("Too few bytes to read ASN.1 value.");
      throw u.available = e.length(), u.remaining = t, u.requested = l, u;
    }
    l = t;
  }
  var f, c, v = (s & 32) === 32;
  if (v)
    if (f = [], l === void 0)
      for (; ; ) {
        if (nr(e, t, 2), e.bytes(2) === "\0\0") {
          e.getBytes(2), t -= 2;
          break;
        }
        n = e.length(), f.push(Cr(e, t, a + 1, r)), t -= n - e.length();
      }
    else
      for (; l > 0; )
        n = e.length(), f.push(Cr(e, l, a + 1, r)), t -= n - e.length(), l -= n - e.length();
  if (f === void 0 && i === U.Class.UNIVERSAL && o === U.Type.BITSTRING && (c = e.bytes(l)), f === void 0 && r.decodeBitStrings && i === U.Class.UNIVERSAL && // FIXME: OCTET STRINGs not yet supported here
  // .. other parts of forge expect to decode OCTET STRINGs manually
  o === U.Type.BITSTRING && l > 1) {
    var m = e.read, y = t, x = 0;
    if (o === U.Type.BITSTRING && (nr(e, t, 1), x = e.getByte(), t--), x === 0)
      try {
        n = e.length();
        var S = {
          // enforce strict mode to avoid parsing ASN.1 from plain data
          strict: !0,
          decodeBitStrings: !0
        }, I = Cr(e, t, a + 1, S), b = n - e.length();
        t -= b, o == U.Type.BITSTRING && b++;
        var _ = I.tagClass;
        b === l && (_ === U.Class.UNIVERSAL || _ === U.Class.CONTEXT_SPECIFIC) && (f = [I]);
      } catch {
      }
    f === void 0 && (e.read = m, t = y);
  }
  if (f === void 0) {
    if (l === void 0) {
      if (r.strict)
        throw new Error("Non-constructed ASN.1 object of indefinite length.");
      l = t;
    }
    if (o === U.Type.BMPSTRING)
      for (f = ""; l > 0; l -= 2)
        nr(e, t, 2), f += String.fromCharCode(e.getInt16()), t -= 2;
    else
      f = e.getBytes(l), t -= l;
  }
  var V = c === void 0 ? null : {
    bitStringContents: c
  };
  return U.create(i, o, v, f, V);
}
U.toDer = function(e) {
  var t = le.util.createBuffer(), a = e.tagClass | e.type, r = le.util.createBuffer(), n = !1;
  if ("bitStringContents" in e && (n = !0, e.original && (n = U.equals(e, e.original))), n)
    r.putBytes(e.bitStringContents);
  else if (e.composed) {
    e.constructed ? a |= 32 : r.putByte(0);
    for (var s = 0; s < e.value.length; ++s)
      e.value[s] !== void 0 && r.putBuffer(U.toDer(e.value[s]));
  } else if (e.type === U.Type.BMPSTRING)
    for (var s = 0; s < e.value.length; ++s)
      r.putInt16(e.value.charCodeAt(s));
  else
    e.type === U.Type.INTEGER && e.value.length > 1 && // leading 0x00 for positive integer
    (e.value.charCodeAt(0) === 0 && !(e.value.charCodeAt(1) & 128) || // leading 0xFF for negative integer
    e.value.charCodeAt(0) === 255 && (e.value.charCodeAt(1) & 128) === 128) ? r.putBytes(e.value.substr(1)) : r.putBytes(e.value);
  if (t.putByte(a), r.length() <= 127)
    t.putByte(r.length() & 127);
  else {
    var i = r.length(), o = "";
    do
      o += String.fromCharCode(i & 255), i = i >>> 8;
    while (i > 0);
    t.putByte(o.length | 128);
    for (var s = o.length - 1; s >= 0; --s)
      t.putByte(o.charCodeAt(s));
  }
  return t.putBuffer(r), t;
};
U.oidToDer = function(e) {
  var t = e.split("."), a = le.util.createBuffer();
  a.putByte(40 * parseInt(t[0], 10) + parseInt(t[1], 10));
  for (var r, n, s, i, o = 2; o < t.length; ++o) {
    if (r = !0, n = [], s = parseInt(t[o], 10), s > 4294967295)
      throw new Error("OID value too large; max is 32-bits.");
    do
      i = s & 127, s = s >>> 7, r || (i |= 128), n.push(i), r = !1;
    while (s > 0);
    for (var l = n.length - 1; l >= 0; --l)
      a.putByte(n[l]);
  }
  return a;
};
U.derToOid = function(e) {
  var t;
  typeof e == "string" && (e = le.util.createBuffer(e));
  var a = e.getByte();
  t = Math.floor(a / 40) + "." + a % 40;
  for (var r = 0; e.length() > 0; ) {
    if (r > 70368744177663)
      throw new Error("OID value too large; max is 53-bits.");
    a = e.getByte(), r = r * 128, a & 128 ? r += a & 127 : (t += "." + (r + a), r = 0);
  }
  return t;
};
U.utcTimeToDate = function(e) {
  var t = /* @__PURE__ */ new Date(), a = parseInt(e.substr(0, 2), 10);
  a = a >= 50 ? 1900 + a : 2e3 + a;
  var r = parseInt(e.substr(2, 2), 10) - 1, n = parseInt(e.substr(4, 2), 10), s = parseInt(e.substr(6, 2), 10), i = parseInt(e.substr(8, 2), 10), o = 0;
  if (e.length > 11) {
    var l = e.charAt(10), u = 10;
    l !== "+" && l !== "-" && (o = parseInt(e.substr(10, 2), 10), u += 2);
  }
  if (t.setUTCFullYear(a, r, n), t.setUTCHours(s, i, o, 0), u && (l = e.charAt(u), l === "+" || l === "-")) {
    var f = parseInt(e.substr(u + 1, 2), 10), c = parseInt(e.substr(u + 4, 2), 10), v = f * 60 + c;
    v *= 6e4, l === "+" ? t.setTime(+t - v) : t.setTime(+t + v);
  }
  return t;
};
U.generalizedTimeToDate = function(e) {
  var t = /* @__PURE__ */ new Date(), a = parseInt(e.substr(0, 4), 10), r = parseInt(e.substr(4, 2), 10) - 1, n = parseInt(e.substr(6, 2), 10), s = parseInt(e.substr(8, 2), 10), i = parseInt(e.substr(10, 2), 10), o = parseInt(e.substr(12, 2), 10), l = 0, u = 0, f = !1;
  e.charAt(e.length - 1) === "Z" && (f = !0);
  var c = e.length - 5, v = e.charAt(c);
  if (v === "+" || v === "-") {
    var m = parseInt(e.substr(c + 1, 2), 10), y = parseInt(e.substr(c + 4, 2), 10);
    u = m * 60 + y, u *= 6e4, v === "+" && (u *= -1), f = !0;
  }
  return e.charAt(14) === "." && (l = parseFloat(e.substr(14), 10) * 1e3), f ? (t.setUTCFullYear(a, r, n), t.setUTCHours(s, i, o, l), t.setTime(+t + u)) : (t.setFullYear(a, r, n), t.setHours(s, i, o, l)), t;
};
U.dateToUtcTime = function(e) {
  if (typeof e == "string")
    return e;
  var t = "", a = [];
  a.push(("" + e.getUTCFullYear()).substr(2)), a.push("" + (e.getUTCMonth() + 1)), a.push("" + e.getUTCDate()), a.push("" + e.getUTCHours()), a.push("" + e.getUTCMinutes()), a.push("" + e.getUTCSeconds());
  for (var r = 0; r < a.length; ++r)
    a[r].length < 2 && (t += "0"), t += a[r];
  return t += "Z", t;
};
U.dateToGeneralizedTime = function(e) {
  if (typeof e == "string")
    return e;
  var t = "", a = [];
  a.push("" + e.getUTCFullYear()), a.push("" + (e.getUTCMonth() + 1)), a.push("" + e.getUTCDate()), a.push("" + e.getUTCHours()), a.push("" + e.getUTCMinutes()), a.push("" + e.getUTCSeconds());
  for (var r = 0; r < a.length; ++r)
    a[r].length < 2 && (t += "0"), t += a[r];
  return t += "Z", t;
};
U.integerToDer = function(e) {
  var t = le.util.createBuffer();
  if (e >= -128 && e < 128)
    return t.putSignedInt(e, 8);
  if (e >= -32768 && e < 32768)
    return t.putSignedInt(e, 16);
  if (e >= -8388608 && e < 8388608)
    return t.putSignedInt(e, 24);
  if (e >= -2147483648 && e < 2147483648)
    return t.putSignedInt(e, 32);
  var a = new Error("Integer too large; max is 32-bits.");
  throw a.integer = e, a;
};
U.derToInteger = function(e) {
  typeof e == "string" && (e = le.util.createBuffer(e));
  var t = e.length() * 8;
  if (t > 32)
    throw new Error("Integer too large; max is 32-bits.");
  return e.getSignedInt(t);
};
U.validate = function(e, t, a, r) {
  var n = !1;
  if ((e.tagClass === t.tagClass || typeof t.tagClass > "u") && (e.type === t.type || typeof t.type > "u"))
    if (e.constructed === t.constructed || typeof t.constructed > "u") {
      if (n = !0, t.value && le.util.isArray(t.value))
        for (var s = 0, i = 0; n && i < t.value.length; ++i) {
          var o = t.value[i];
          n = !!o.optional;
          var l = e.value[s];
          if (!l) {
            o.optional || (n = !1, r && r.push("[" + t.name + '] Missing required element. Expected tag class "' + o.tagClass + '", type "' + o.type + '"'));
            continue;
          }
          var u = typeof o.tagClass < "u" && typeof o.type < "u";
          if (u && (l.tagClass !== o.tagClass || l.type !== o.type))
            if (o.optional) {
              n = !0;
              continue;
            } else {
              n = !1, r && r.push("[" + t.name + "] Tag mismatch. Expected (" + o.tagClass + "," + o.type + "), got (" + l.tagClass + "," + l.type + ")");
              break;
            }
          var f = U.validate(l, o, a, r);
          if (f)
            ++s, n = !0;
          else if (o.optional)
            n = !0;
          else {
            n = !1;
            break;
          }
        }
      if (n && a && (t.capture && (a[t.capture] = e.value), t.captureAsn1 && (a[t.captureAsn1] = e), t.captureBitStringContents && "bitStringContents" in e && (a[t.captureBitStringContents] = e.bitStringContents), t.captureBitStringValue && "bitStringContents" in e))
        if (e.bitStringContents.length < 2)
          a[t.captureBitStringValue] = "";
        else {
          var c = e.bitStringContents.charCodeAt(0);
          if (c !== 0)
            throw new Error(
              "captureBitStringValue only supported for zero unused bits"
            );
          a[t.captureBitStringValue] = e.bitStringContents.slice(1);
        }
    } else r && r.push(
      "[" + t.name + '] Expected constructed "' + t.constructed + '", got "' + e.constructed + '"'
    );
  else r && (e.tagClass !== t.tagClass && r.push(
    "[" + t.name + '] Expected tag class "' + t.tagClass + '", got "' + e.tagClass + '"'
  ), e.type !== t.type && r.push(
    "[" + t.name + '] Expected type "' + t.type + '", got "' + e.type + '"'
  ));
  return n;
};
var Fa = /[^\\u0000-\\u00ff]/;
U.prettyPrint = function(e, t, a) {
  var r = "";
  t = t || 0, a = a || 2, t > 0 && (r += `
`);
  for (var n = "", s = 0; s < t * a; ++s)
    n += " ";
  switch (r += n + "Tag: ", e.tagClass) {
    case U.Class.UNIVERSAL:
      r += "Universal:";
      break;
    case U.Class.APPLICATION:
      r += "Application:";
      break;
    case U.Class.CONTEXT_SPECIFIC:
      r += "Context-Specific:";
      break;
    case U.Class.PRIVATE:
      r += "Private:";
      break;
  }
  if (e.tagClass === U.Class.UNIVERSAL)
    switch (r += e.type, e.type) {
      case U.Type.NONE:
        r += " (None)";
        break;
      case U.Type.BOOLEAN:
        r += " (Boolean)";
        break;
      case U.Type.INTEGER:
        r += " (Integer)";
        break;
      case U.Type.BITSTRING:
        r += " (Bit string)";
        break;
      case U.Type.OCTETSTRING:
        r += " (Octet string)";
        break;
      case U.Type.NULL:
        r += " (Null)";
        break;
      case U.Type.OID:
        r += " (Object Identifier)";
        break;
      case U.Type.ODESC:
        r += " (Object Descriptor)";
        break;
      case U.Type.EXTERNAL:
        r += " (External or Instance of)";
        break;
      case U.Type.REAL:
        r += " (Real)";
        break;
      case U.Type.ENUMERATED:
        r += " (Enumerated)";
        break;
      case U.Type.EMBEDDED:
        r += " (Embedded PDV)";
        break;
      case U.Type.UTF8:
        r += " (UTF8)";
        break;
      case U.Type.ROID:
        r += " (Relative Object Identifier)";
        break;
      case U.Type.SEQUENCE:
        r += " (Sequence)";
        break;
      case U.Type.SET:
        r += " (Set)";
        break;
      case U.Type.PRINTABLESTRING:
        r += " (Printable String)";
        break;
      case U.Type.IA5String:
        r += " (IA5String (ASCII))";
        break;
      case U.Type.UTCTIME:
        r += " (UTC time)";
        break;
      case U.Type.GENERALIZEDTIME:
        r += " (Generalized time)";
        break;
      case U.Type.BMPSTRING:
        r += " (BMP String)";
        break;
    }
  else
    r += e.type;
  if (r += `
`, r += n + "Constructed: " + e.constructed + `
`, e.composed) {
    for (var i = 0, o = "", s = 0; s < e.value.length; ++s)
      e.value[s] !== void 0 && (i += 1, o += U.prettyPrint(e.value[s], t + 1, a), s + 1 < e.value.length && (o += ","));
    r += n + "Sub values: " + i + o;
  } else {
    if (r += n + "Value: ", e.type === U.Type.OID) {
      var l = U.derToOid(e.value);
      r += l, le.pki && le.pki.oids && l in le.pki.oids && (r += " (" + le.pki.oids[l] + ") ");
    }
    if (e.type === U.Type.INTEGER)
      try {
        r += U.derToInteger(e.value);
      } catch {
        r += "0x" + le.util.bytesToHex(e.value);
      }
    else if (e.type === U.Type.BITSTRING) {
      if (e.value.length > 1 ? r += "0x" + le.util.bytesToHex(e.value.slice(1)) : r += "(none)", e.value.length > 0) {
        var u = e.value.charCodeAt(0);
        u == 1 ? r += " (1 unused bit shown)" : u > 1 && (r += " (" + u + " unused bits shown)");
      }
    } else if (e.type === U.Type.OCTETSTRING)
      Fa.test(e.value) || (r += "(" + e.value + ") "), r += "0x" + le.util.bytesToHex(e.value);
    else if (e.type === U.Type.UTF8)
      try {
        r += le.util.decodeUtf8(e.value);
      } catch (f) {
        if (f.message === "URI malformed")
          r += "0x" + le.util.bytesToHex(e.value) + " (malformed UTF8)";
        else
          throw f;
      }
    else e.type === U.Type.PRINTABLESTRING || e.type === U.Type.IA5String ? r += e.value : Fa.test(e.value) ? r += "0x" + le.util.bytesToHex(e.value) : e.value.length === 0 ? r += "[null]" : r += e.value;
  }
  return r;
};
var Tr = z;
Tr.md = Tr.md || {};
Tr.md.algorithms = Tr.md.algorithms || {};
var pt = z, Bi = pt.hmac = pt.hmac || {};
Bi.create = function() {
  var e = null, t = null, a = null, r = null, n = {};
  return n.start = function(s, i) {
    if (s !== null)
      if (typeof s == "string")
        if (s = s.toLowerCase(), s in pt.md.algorithms)
          t = pt.md.algorithms[s].create();
        else
          throw new Error('Unknown hash algorithm "' + s + '"');
      else
        t = s;
    if (i === null)
      i = e;
    else {
      if (typeof i == "string")
        i = pt.util.createBuffer(i);
      else if (pt.util.isArray(i)) {
        var o = i;
        i = pt.util.createBuffer();
        for (var l = 0; l < o.length; ++l)
          i.putByte(o[l]);
      }
      var u = i.length();
      u > t.blockLength && (t.start(), t.update(i.bytes()), i = t.digest()), a = pt.util.createBuffer(), r = pt.util.createBuffer(), u = i.length();
      for (var l = 0; l < u; ++l) {
        var o = i.at(l);
        a.putByte(54 ^ o), r.putByte(92 ^ o);
      }
      if (u < t.blockLength)
        for (var o = t.blockLength - u, l = 0; l < o; ++l)
          a.putByte(54), r.putByte(92);
      e = i, a = a.bytes(), r = r.bytes();
    }
    t.start(), t.update(a);
  }, n.update = function(s) {
    t.update(s);
  }, n.getMac = function() {
    var s = t.digest().bytes();
    return t.start(), t.update(r), t.update(s), t.digest();
  }, n.digest = n.getMac, n;
};
var ot = z, gn = ot.md5 = ot.md5 || {};
ot.md.md5 = ot.md.algorithms.md5 = gn;
gn.create = function() {
  mn || bi();
  var e = null, t = ot.util.createBuffer(), a = new Array(16), r = {
    algorithm: "md5",
    blockLength: 64,
    digestLength: 16,
    // 56-bit length of message so far (does not including padding)
    messageLength: 0,
    // true message length
    fullMessageLength: null,
    // size of message length in bytes
    messageLengthSize: 8
  };
  return r.start = function() {
    r.messageLength = 0, r.fullMessageLength = r.messageLength64 = [];
    for (var n = r.messageLengthSize / 4, s = 0; s < n; ++s)
      r.fullMessageLength.push(0);
    return t = ot.util.createBuffer(), e = {
      h0: 1732584193,
      h1: 4023233417,
      h2: 2562383102,
      h3: 271733878
    }, r;
  }, r.start(), r.update = function(n, s) {
    s === "utf8" && (n = ot.util.encodeUtf8(n));
    var i = n.length;
    r.messageLength += i, i = [i / 4294967296 >>> 0, i >>> 0];
    for (var o = r.fullMessageLength.length - 1; o >= 0; --o)
      r.fullMessageLength[o] += i[1], i[1] = i[0] + (r.fullMessageLength[o] / 4294967296 >>> 0), r.fullMessageLength[o] = r.fullMessageLength[o] >>> 0, i[0] = i[1] / 4294967296 >>> 0;
    return t.putBytes(n), Ka(e, a, t), (t.read > 2048 || t.length() === 0) && t.compact(), r;
  }, r.digest = function() {
    var n = ot.util.createBuffer();
    n.putBytes(t.bytes());
    var s = r.fullMessageLength[r.fullMessageLength.length - 1] + r.messageLengthSize, i = s & r.blockLength - 1;
    n.putBytes(ea.substr(0, r.blockLength - i));
    for (var o, l = 0, u = r.fullMessageLength.length - 1; u >= 0; --u)
      o = r.fullMessageLength[u] * 8 + l, l = o / 4294967296 >>> 0, n.putInt32Le(o >>> 0);
    var f = {
      h0: e.h0,
      h1: e.h1,
      h2: e.h2,
      h3: e.h3
    };
    Ka(f, a, n);
    var c = ot.util.createBuffer();
    return c.putInt32Le(f.h0), c.putInt32Le(f.h1), c.putInt32Le(f.h2), c.putInt32Le(f.h3), c;
  }, r;
};
var ea = null, Er = null, ir = null, qt = null, mn = !1;
function bi() {
  ea = "", ea += ot.util.fillString("\0", 64), Er = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    1,
    6,
    11,
    0,
    5,
    10,
    15,
    4,
    9,
    14,
    3,
    8,
    13,
    2,
    7,
    12,
    5,
    8,
    11,
    14,
    1,
    4,
    7,
    10,
    13,
    0,
    3,
    6,
    9,
    12,
    15,
    2,
    0,
    7,
    14,
    5,
    12,
    3,
    10,
    1,
    8,
    15,
    6,
    13,
    4,
    11,
    2,
    9
  ], ir = [
    7,
    12,
    17,
    22,
    7,
    12,
    17,
    22,
    7,
    12,
    17,
    22,
    7,
    12,
    17,
    22,
    5,
    9,
    14,
    20,
    5,
    9,
    14,
    20,
    5,
    9,
    14,
    20,
    5,
    9,
    14,
    20,
    4,
    11,
    16,
    23,
    4,
    11,
    16,
    23,
    4,
    11,
    16,
    23,
    4,
    11,
    16,
    23,
    6,
    10,
    15,
    21,
    6,
    10,
    15,
    21,
    6,
    10,
    15,
    21,
    6,
    10,
    15,
    21
  ], qt = new Array(64);
  for (var e = 0; e < 64; ++e)
    qt[e] = Math.floor(Math.abs(Math.sin(e + 1)) * 4294967296);
  mn = !0;
}
function Ka(e, t, a) {
  for (var r, n, s, i, o, l, u, f, c = a.length(); c >= 64; ) {
    for (n = e.h0, s = e.h1, i = e.h2, o = e.h3, f = 0; f < 16; ++f)
      t[f] = a.getInt32Le(), l = o ^ s & (i ^ o), r = n + l + qt[f] + t[f], u = ir[f], n = o, o = i, i = s, s += r << u | r >>> 32 - u;
    for (; f < 32; ++f)
      l = i ^ o & (s ^ i), r = n + l + qt[f] + t[Er[f]], u = ir[f], n = o, o = i, i = s, s += r << u | r >>> 32 - u;
    for (; f < 48; ++f)
      l = s ^ i ^ o, r = n + l + qt[f] + t[Er[f]], u = ir[f], n = o, o = i, i = s, s += r << u | r >>> 32 - u;
    for (; f < 64; ++f)
      l = i ^ (s | ~o), r = n + l + qt[f] + t[Er[f]], u = ir[f], n = o, o = i, i = s, s += r << u | r >>> 32 - u;
    e.h0 = e.h0 + n | 0, e.h1 = e.h1 + s | 0, e.h2 = e.h2 + i | 0, e.h3 = e.h3 + o | 0, c -= 64;
  }
}
var Ir = z, Cn = Ir.pem = Ir.pem || {};
Cn.encode = function(e, t) {
  t = t || {};
  var a = "-----BEGIN " + e.type + `-----\r
`, r;
  if (e.procType && (r = {
    name: "Proc-Type",
    values: [String(e.procType.version), e.procType.type]
  }, a += pr(r)), e.contentDomain && (r = { name: "Content-Domain", values: [e.contentDomain] }, a += pr(r)), e.dekInfo && (r = { name: "DEK-Info", values: [e.dekInfo.algorithm] }, e.dekInfo.parameters && r.values.push(e.dekInfo.parameters), a += pr(r)), e.headers)
    for (var n = 0; n < e.headers.length; ++n)
      a += pr(e.headers[n]);
  return e.procType && (a += `\r
`), a += Ir.util.encode64(e.body, t.maxline || 64) + `\r
`, a += "-----END " + e.type + `-----\r
`, a;
};
Cn.decode = function(e) {
  for (var t = [], a = /\s*-----BEGIN ([A-Z0-9- ]+)-----\r?\n?([\x21-\x7e\s]+?(?:\r?\n\r?\n))?([:A-Za-z0-9+\/=\s]+?)-----END \1-----/g, r = /([\x21-\x7e]+):\s*([\x21-\x7e\s^:]+)/, n = /\r?\n/, s; s = a.exec(e), !!s; ) {
    var i = s[1];
    i === "NEW CERTIFICATE REQUEST" && (i = "CERTIFICATE REQUEST");
    var o = {
      type: i,
      procType: null,
      contentDomain: null,
      dekInfo: null,
      headers: [],
      body: Ir.util.decode64(s[3])
    };
    if (t.push(o), !!s[2]) {
      for (var l = s[2].split(n), u = 0; s && u < l.length; ) {
        for (var f = l[u].replace(/\s+$/, ""), c = u + 1; c < l.length; ++c) {
          var v = l[c];
          if (!/\s/.test(v[0]))
            break;
          f += v, u = c;
        }
        if (s = f.match(r), s) {
          for (var m = { name: s[1], values: [] }, y = s[2].split(","), x = 0; x < y.length; ++x)
            m.values.push(_i(y[x]));
          if (o.procType)
            if (!o.contentDomain && m.name === "Content-Domain")
              o.contentDomain = y[0] || "";
            else if (!o.dekInfo && m.name === "DEK-Info") {
              if (m.values.length === 0)
                throw new Error('Invalid PEM formatted message. The "DEK-Info" header must have at least one subfield.');
              o.dekInfo = { algorithm: y[0], parameters: y[1] || null };
            } else
              o.headers.push(m);
          else {
            if (m.name !== "Proc-Type")
              throw new Error('Invalid PEM formatted message. The first encapsulated header must be "Proc-Type".');
            if (m.values.length !== 2)
              throw new Error('Invalid PEM formatted message. The "Proc-Type" header must have two subfields.');
            o.procType = { version: y[0], type: y[1] };
          }
        }
        ++u;
      }
      if (o.procType === "ENCRYPTED" && !o.dekInfo)
        throw new Error('Invalid PEM formatted message. The "DEK-Info" header must be present if "Proc-Type" is "ENCRYPTED".');
    }
  }
  if (t.length === 0)
    throw new Error("Invalid PEM formatted message.");
  return t;
};
function pr(e) {
  for (var t = e.name + ": ", a = [], r = function(l, u) {
    return " " + u;
  }, n = 0; n < e.values.length; ++n)
    a.push(e.values[n].replace(/^(\S+\r\n)/, r));
  t += a.join(",") + `\r
`;
  for (var s = 0, i = -1, n = 0; n < t.length; ++n, ++s)
    if (s > 65 && i !== -1) {
      var o = t[i];
      o === "," ? (++i, t = t.substr(0, i) + `\r
 ` + t.substr(i)) : t = t.substr(0, i) + `\r
` + o + t.substr(i + 1), s = n - i - 1, i = -1, ++n;
    } else (t[n] === " " || t[n] === "	" || t[n] === ",") && (i = n);
  return t;
}
function _i(e) {
  return e.replace(/^\s+/, "");
}
var ce = z;
ce.des = ce.des || {};
ce.des.startEncrypting = function(e, t, a, r) {
  var n = Vr({
    key: e,
    output: a,
    decrypt: !1,
    mode: r || (t === null ? "ECB" : "CBC")
  });
  return n.start(t), n;
};
ce.des.createEncryptionCipher = function(e, t) {
  return Vr({
    key: e,
    output: null,
    decrypt: !1,
    mode: t
  });
};
ce.des.startDecrypting = function(e, t, a, r) {
  var n = Vr({
    key: e,
    output: a,
    decrypt: !0,
    mode: r || (t === null ? "ECB" : "CBC")
  });
  return n.start(t), n;
};
ce.des.createDecryptionCipher = function(e, t) {
  return Vr({
    key: e,
    output: null,
    decrypt: !0,
    mode: t
  });
};
ce.des.Algorithm = function(e, t) {
  var a = this;
  a.name = e, a.mode = new t({
    blockSize: 8,
    cipher: {
      encrypt: function(r, n) {
        return Ma(a._keys, r, n, !1);
      },
      decrypt: function(r, n) {
        return Ma(a._keys, r, n, !0);
      }
    }
  }), a._init = !1;
};
ce.des.Algorithm.prototype.initialize = function(e) {
  if (!this._init) {
    var t = ce.util.createBuffer(e.key);
    if (this.name.indexOf("3DES") === 0 && t.length() !== 24)
      throw new Error("Invalid Triple-DES key size: " + t.length() * 8);
    this._keys = Vi(t), this._init = !0;
  }
};
ht("DES-ECB", ce.cipher.modes.ecb);
ht("DES-CBC", ce.cipher.modes.cbc);
ht("DES-CFB", ce.cipher.modes.cfb);
ht("DES-OFB", ce.cipher.modes.ofb);
ht("DES-CTR", ce.cipher.modes.ctr);
ht("3DES-ECB", ce.cipher.modes.ecb);
ht("3DES-CBC", ce.cipher.modes.cbc);
ht("3DES-CFB", ce.cipher.modes.cfb);
ht("3DES-OFB", ce.cipher.modes.ofb);
ht("3DES-CTR", ce.cipher.modes.ctr);
function ht(e, t) {
  var a = function() {
    return new ce.des.Algorithm(e, t);
  };
  ce.cipher.registerAlgorithm(e, a);
}
var Ni = [16843776, 0, 65536, 16843780, 16842756, 66564, 4, 65536, 1024, 16843776, 16843780, 1024, 16778244, 16842756, 16777216, 4, 1028, 16778240, 16778240, 66560, 66560, 16842752, 16842752, 16778244, 65540, 16777220, 16777220, 65540, 0, 1028, 66564, 16777216, 65536, 16843780, 4, 16842752, 16843776, 16777216, 16777216, 1024, 16842756, 65536, 66560, 16777220, 1024, 4, 16778244, 66564, 16843780, 65540, 16842752, 16778244, 16777220, 1028, 66564, 16843776, 1028, 16778240, 16778240, 0, 65540, 66560, 0, 16842756], Ri = [-2146402272, -2147450880, 32768, 1081376, 1048576, 32, -2146435040, -2147450848, -2147483616, -2146402272, -2146402304, -2147483648, -2147450880, 1048576, 32, -2146435040, 1081344, 1048608, -2147450848, 0, -2147483648, 32768, 1081376, -2146435072, 1048608, -2147483616, 0, 1081344, 32800, -2146402304, -2146435072, 32800, 0, 1081376, -2146435040, 1048576, -2147450848, -2146435072, -2146402304, 32768, -2146435072, -2147450880, 32, -2146402272, 1081376, 32, 32768, -2147483648, 32800, -2146402304, 1048576, -2147483616, 1048608, -2147450848, -2147483616, 1048608, 1081344, 0, -2147450880, 32800, -2147483648, -2146435040, -2146402272, 1081344], wi = [520, 134349312, 0, 134348808, 134218240, 0, 131592, 134218240, 131080, 134217736, 134217736, 131072, 134349320, 131080, 134348800, 520, 134217728, 8, 134349312, 512, 131584, 134348800, 134348808, 131592, 134218248, 131584, 131072, 134218248, 8, 134349320, 512, 134217728, 134349312, 134217728, 131080, 520, 131072, 134349312, 134218240, 0, 512, 131080, 134349320, 134218240, 134217736, 512, 0, 134348808, 134218248, 131072, 134217728, 134349320, 8, 131592, 131584, 134217736, 134348800, 134218248, 520, 134348800, 131592, 8, 134348808, 131584], Li = [8396801, 8321, 8321, 128, 8396928, 8388737, 8388609, 8193, 0, 8396800, 8396800, 8396929, 129, 0, 8388736, 8388609, 1, 8192, 8388608, 8396801, 128, 8388608, 8193, 8320, 8388737, 1, 8320, 8388736, 8192, 8396928, 8396929, 129, 8388736, 8388609, 8396800, 8396929, 129, 0, 0, 8396800, 8320, 8388736, 8388737, 1, 8396801, 8321, 8321, 128, 8396929, 129, 1, 8192, 8388609, 8193, 8396928, 8388737, 8193, 8320, 8388608, 8396801, 128, 8388608, 8192, 8396928], ki = [256, 34078976, 34078720, 1107296512, 524288, 256, 1073741824, 34078720, 1074266368, 524288, 33554688, 1074266368, 1107296512, 1107820544, 524544, 1073741824, 33554432, 1074266112, 1074266112, 0, 1073742080, 1107820800, 1107820800, 33554688, 1107820544, 1073742080, 0, 1107296256, 34078976, 33554432, 1107296256, 524544, 524288, 1107296512, 256, 33554432, 1073741824, 34078720, 1107296512, 1074266368, 33554688, 1073741824, 1107820544, 34078976, 1074266368, 256, 33554432, 1107820544, 1107820800, 524544, 1107296256, 1107820800, 34078720, 0, 1074266112, 1107296256, 524544, 33554688, 1073742080, 524288, 0, 1074266112, 34078976, 1073742080], Di = [536870928, 541065216, 16384, 541081616, 541065216, 16, 541081616, 4194304, 536887296, 4210704, 4194304, 536870928, 4194320, 536887296, 536870912, 16400, 0, 4194320, 536887312, 16384, 4210688, 536887312, 16, 541065232, 541065232, 0, 4210704, 541081600, 16400, 4210688, 541081600, 536870912, 536887296, 16, 541065232, 4210688, 541081616, 4194304, 16400, 536870928, 4194304, 536887296, 536870912, 16400, 536870928, 541081616, 4210688, 541065216, 4210704, 541081600, 0, 541065232, 16, 16384, 541065216, 4210704, 16384, 4194320, 536887312, 0, 541081600, 536870912, 4194320, 536887312], Ui = [2097152, 69206018, 67110914, 0, 2048, 67110914, 2099202, 69208064, 69208066, 2097152, 0, 67108866, 2, 67108864, 69206018, 2050, 67110912, 2099202, 2097154, 67110912, 67108866, 69206016, 69208064, 2097154, 69206016, 2048, 2050, 69208066, 2099200, 2, 67108864, 2099200, 67108864, 2099200, 2097152, 67110914, 67110914, 69206018, 69206018, 2, 2097154, 67108864, 67110912, 2097152, 69208064, 2050, 2099202, 69208064, 2050, 67108866, 69208066, 69206016, 2099200, 0, 2, 69208066, 0, 2099202, 69206016, 2048, 67108866, 67110912, 2048, 2097154], Pi = [268439616, 4096, 262144, 268701760, 268435456, 268439616, 64, 268435456, 262208, 268697600, 268701760, 266240, 268701696, 266304, 4096, 64, 268697600, 268435520, 268439552, 4160, 266240, 262208, 268697664, 268701696, 4160, 0, 0, 268697664, 268435520, 268439552, 266304, 262144, 266304, 262144, 268701696, 4096, 64, 268697664, 4096, 266304, 268439552, 64, 268435520, 268697600, 268697664, 268435456, 262144, 268439616, 0, 268701760, 262208, 268435520, 268697600, 268439552, 268439616, 0, 268701760, 266240, 266240, 4160, 4160, 262208, 268435456, 268701696];
function Vi(e) {
  for (var t = [0, 4, 536870912, 536870916, 65536, 65540, 536936448, 536936452, 512, 516, 536871424, 536871428, 66048, 66052, 536936960, 536936964], a = [0, 1, 1048576, 1048577, 67108864, 67108865, 68157440, 68157441, 256, 257, 1048832, 1048833, 67109120, 67109121, 68157696, 68157697], r = [0, 8, 2048, 2056, 16777216, 16777224, 16779264, 16779272, 0, 8, 2048, 2056, 16777216, 16777224, 16779264, 16779272], n = [0, 2097152, 134217728, 136314880, 8192, 2105344, 134225920, 136323072, 131072, 2228224, 134348800, 136445952, 139264, 2236416, 134356992, 136454144], s = [0, 262144, 16, 262160, 0, 262144, 16, 262160, 4096, 266240, 4112, 266256, 4096, 266240, 4112, 266256], i = [0, 1024, 32, 1056, 0, 1024, 32, 1056, 33554432, 33555456, 33554464, 33555488, 33554432, 33555456, 33554464, 33555488], o = [0, 268435456, 524288, 268959744, 2, 268435458, 524290, 268959746, 0, 268435456, 524288, 268959744, 2, 268435458, 524290, 268959746], l = [0, 65536, 2048, 67584, 536870912, 536936448, 536872960, 536938496, 131072, 196608, 133120, 198656, 537001984, 537067520, 537004032, 537069568], u = [0, 262144, 0, 262144, 2, 262146, 2, 262146, 33554432, 33816576, 33554432, 33816576, 33554434, 33816578, 33554434, 33816578], f = [0, 268435456, 8, 268435464, 0, 268435456, 8, 268435464, 1024, 268436480, 1032, 268436488, 1024, 268436480, 1032, 268436488], c = [0, 32, 0, 32, 1048576, 1048608, 1048576, 1048608, 8192, 8224, 8192, 8224, 1056768, 1056800, 1056768, 1056800], v = [0, 16777216, 512, 16777728, 2097152, 18874368, 2097664, 18874880, 67108864, 83886080, 67109376, 83886592, 69206016, 85983232, 69206528, 85983744], m = [0, 4096, 134217728, 134221824, 524288, 528384, 134742016, 134746112, 16, 4112, 134217744, 134221840, 524304, 528400, 134742032, 134746128], y = [0, 4, 256, 260, 0, 4, 256, 260, 1, 5, 257, 261, 1, 5, 257, 261], x = e.length() > 8 ? 3 : 1, S = [], I = [0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0], b = 0, _, V = 0; V < x; V++) {
    var k = e.getInt32(), w = e.getInt32();
    _ = (k >>> 4 ^ w) & 252645135, w ^= _, k ^= _ << 4, _ = (w >>> -16 ^ k) & 65535, k ^= _, w ^= _ << -16, _ = (k >>> 2 ^ w) & 858993459, w ^= _, k ^= _ << 2, _ = (w >>> -16 ^ k) & 65535, k ^= _, w ^= _ << -16, _ = (k >>> 1 ^ w) & 1431655765, w ^= _, k ^= _ << 1, _ = (w >>> 8 ^ k) & 16711935, k ^= _, w ^= _ << 8, _ = (k >>> 1 ^ w) & 1431655765, w ^= _, k ^= _ << 1, _ = k << 8 | w >>> 20 & 240, k = w << 24 | w << 8 & 16711680 | w >>> 8 & 65280 | w >>> 24 & 240, w = _;
    for (var G = 0; G < I.length; ++G) {
      I[G] ? (k = k << 2 | k >>> 26, w = w << 2 | w >>> 26) : (k = k << 1 | k >>> 27, w = w << 1 | w >>> 27), k &= -15, w &= -15;
      var Y = t[k >>> 28] | a[k >>> 24 & 15] | r[k >>> 20 & 15] | n[k >>> 16 & 15] | s[k >>> 12 & 15] | i[k >>> 8 & 15] | o[k >>> 4 & 15], re = l[w >>> 28] | u[w >>> 24 & 15] | f[w >>> 20 & 15] | c[w >>> 16 & 15] | v[w >>> 12 & 15] | m[w >>> 8 & 15] | y[w >>> 4 & 15];
      _ = (re >>> 16 ^ Y) & 65535, S[b++] = Y ^ _, S[b++] = re ^ _ << 16;
    }
  }
  return S;
}
function Ma(e, t, a, r) {
  var n = e.length === 32 ? 3 : 9, s;
  n === 3 ? s = r ? [30, -2, -2] : [0, 32, 2] : s = r ? [94, 62, -2, 32, 64, 2, 30, -2, -2] : [0, 32, 2, 62, 30, -2, 64, 96, 2];
  var i, o = t[0], l = t[1];
  i = (o >>> 4 ^ l) & 252645135, l ^= i, o ^= i << 4, i = (o >>> 16 ^ l) & 65535, l ^= i, o ^= i << 16, i = (l >>> 2 ^ o) & 858993459, o ^= i, l ^= i << 2, i = (l >>> 8 ^ o) & 16711935, o ^= i, l ^= i << 8, i = (o >>> 1 ^ l) & 1431655765, l ^= i, o ^= i << 1, o = o << 1 | o >>> 31, l = l << 1 | l >>> 31;
  for (var u = 0; u < n; u += 3) {
    for (var f = s[u + 1], c = s[u + 2], v = s[u]; v != f; v += c) {
      var m = l ^ e[v], y = (l >>> 4 | l << 28) ^ e[v + 1];
      i = o, o = l, l = i ^ (Ri[m >>> 24 & 63] | Li[m >>> 16 & 63] | Di[m >>> 8 & 63] | Pi[m & 63] | Ni[y >>> 24 & 63] | wi[y >>> 16 & 63] | ki[y >>> 8 & 63] | Ui[y & 63]);
    }
    i = o, o = l, l = i;
  }
  o = o >>> 1 | o << 31, l = l >>> 1 | l << 31, i = (o >>> 1 ^ l) & 1431655765, l ^= i, o ^= i << 1, i = (l >>> 8 ^ o) & 16711935, o ^= i, l ^= i << 8, i = (l >>> 2 ^ o) & 858993459, o ^= i, l ^= i << 2, i = (o >>> 16 ^ l) & 65535, l ^= i, o ^= i << 16, i = (o >>> 4 ^ l) & 252645135, l ^= i, o ^= i << 4, a[0] = o, a[1] = l;
}
function Vr(e) {
  e = e || {};
  var t = (e.mode || "CBC").toUpperCase(), a = "DES-" + t, r;
  e.decrypt ? r = ce.cipher.createDecipher(a, e.key) : r = ce.cipher.createCipher(a, e.key);
  var n = r.start;
  return r.start = function(s, i) {
    var o = null;
    i instanceof ce.util.ByteBuffer && (o = i, i = {}), i = i || {}, i.output = o, i.iv = s, n.call(r, i);
  }, r;
}
var Ye = z, Oi = Ye.pkcs5 = Ye.pkcs5 || {}, dt;
Ye.util.isNodejs && (dt = va);
Ye.pbkdf2 = Oi.pbkdf2 = function(e, t, a, r, n, s) {
  if (typeof n == "function" && (s = n, n = null), Ye.util.isNodejs && dt.pbkdf2 && (n === null || typeof n != "object") && (dt.pbkdf2Sync.length > 4 || !n || n === "sha1"))
    return typeof n != "string" && (n = "sha1"), e = Buffer.from(e, "binary"), t = Buffer.from(t, "binary"), s ? dt.pbkdf2Sync.length === 4 ? dt.pbkdf2(e, t, a, r, function(_, V) {
      if (_)
        return s(_);
      s(null, V.toString("binary"));
    }) : dt.pbkdf2(e, t, a, r, n, function(_, V) {
      if (_)
        return s(_);
      s(null, V.toString("binary"));
    }) : dt.pbkdf2Sync.length === 4 ? dt.pbkdf2Sync(e, t, a, r).toString("binary") : dt.pbkdf2Sync(e, t, a, r, n).toString("binary");
  if ((typeof n > "u" || n === null) && (n = "sha1"), typeof n == "string") {
    if (!(n in Ye.md.algorithms))
      throw new Error("Unknown hash algorithm: " + n);
    n = Ye.md[n].create();
  }
  var i = n.digestLength;
  if (r > 4294967295 * i) {
    var o = new Error("Derived key is too long.");
    if (s)
      return s(o);
    throw o;
  }
  var l = Math.ceil(r / i), u = r - (l - 1) * i, f = Ye.hmac.create();
  f.start(n, e);
  var c = "", v, m, y;
  if (!s) {
    for (var x = 1; x <= l; ++x) {
      f.start(null, null), f.update(t), f.update(Ye.util.int32ToBytes(x)), v = y = f.digest().getBytes();
      for (var S = 2; S <= a; ++S)
        f.start(null, null), f.update(y), m = f.digest().getBytes(), v = Ye.util.xorBytes(v, m, i), y = m;
      c += x < l ? v : v.substr(0, u);
    }
    return c;
  }
  var x = 1, S;
  function I() {
    if (x > l)
      return s(null, c);
    f.start(null, null), f.update(t), f.update(Ye.util.int32ToBytes(x)), v = y = f.digest().getBytes(), S = 2, b();
  }
  function b() {
    if (S <= a)
      return f.start(null, null), f.update(y), m = f.digest().getBytes(), v = Ye.util.xorBytes(v, m, i), y = m, ++S, Ye.util.setImmediate(b);
    c += x < l ? v : v.substr(0, u), ++x, I();
  }
  I();
};
var ut = z, En = ut.sha256 = ut.sha256 || {};
ut.md.sha256 = ut.md.algorithms.sha256 = En;
En.create = function() {
  xn || Fi();
  var e = null, t = ut.util.createBuffer(), a = new Array(64), r = {
    algorithm: "sha256",
    blockLength: 64,
    digestLength: 32,
    // 56-bit length of message so far (does not including padding)
    messageLength: 0,
    // true message length
    fullMessageLength: null,
    // size of message length in bytes
    messageLengthSize: 8
  };
  return r.start = function() {
    r.messageLength = 0, r.fullMessageLength = r.messageLength64 = [];
    for (var n = r.messageLengthSize / 4, s = 0; s < n; ++s)
      r.fullMessageLength.push(0);
    return t = ut.util.createBuffer(), e = {
      h0: 1779033703,
      h1: 3144134277,
      h2: 1013904242,
      h3: 2773480762,
      h4: 1359893119,
      h5: 2600822924,
      h6: 528734635,
      h7: 1541459225
    }, r;
  }, r.start(), r.update = function(n, s) {
    s === "utf8" && (n = ut.util.encodeUtf8(n));
    var i = n.length;
    r.messageLength += i, i = [i / 4294967296 >>> 0, i >>> 0];
    for (var o = r.fullMessageLength.length - 1; o >= 0; --o)
      r.fullMessageLength[o] += i[1], i[1] = i[0] + (r.fullMessageLength[o] / 4294967296 >>> 0), r.fullMessageLength[o] = r.fullMessageLength[o] >>> 0, i[0] = i[1] / 4294967296 >>> 0;
    return t.putBytes(n), Ha(e, a, t), (t.read > 2048 || t.length() === 0) && t.compact(), r;
  }, r.digest = function() {
    var n = ut.util.createBuffer();
    n.putBytes(t.bytes());
    var s = r.fullMessageLength[r.fullMessageLength.length - 1] + r.messageLengthSize, i = s & r.blockLength - 1;
    n.putBytes(ta.substr(0, r.blockLength - i));
    for (var o, l, u = r.fullMessageLength[0] * 8, f = 0; f < r.fullMessageLength.length - 1; ++f)
      o = r.fullMessageLength[f + 1] * 8, l = o / 4294967296 >>> 0, u += l, n.putInt32(u >>> 0), u = o >>> 0;
    n.putInt32(u);
    var c = {
      h0: e.h0,
      h1: e.h1,
      h2: e.h2,
      h3: e.h3,
      h4: e.h4,
      h5: e.h5,
      h6: e.h6,
      h7: e.h7
    };
    Ha(c, a, n);
    var v = ut.util.createBuffer();
    return v.putInt32(c.h0), v.putInt32(c.h1), v.putInt32(c.h2), v.putInt32(c.h3), v.putInt32(c.h4), v.putInt32(c.h5), v.putInt32(c.h6), v.putInt32(c.h7), v;
  }, r;
};
var ta = null, xn = !1, Sn = null;
function Fi() {
  ta = "", ta += ut.util.fillString("\0", 64), Sn = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ], xn = !0;
}
function Ha(e, t, a) {
  for (var r, n, s, i, o, l, u, f, c, v, m, y, x, S, I, b = a.length(); b >= 64; ) {
    for (u = 0; u < 16; ++u)
      t[u] = a.getInt32();
    for (; u < 64; ++u)
      r = t[u - 2], r = (r >>> 17 | r << 15) ^ (r >>> 19 | r << 13) ^ r >>> 10, n = t[u - 15], n = (n >>> 7 | n << 25) ^ (n >>> 18 | n << 14) ^ n >>> 3, t[u] = r + t[u - 7] + n + t[u - 16] | 0;
    for (f = e.h0, c = e.h1, v = e.h2, m = e.h3, y = e.h4, x = e.h5, S = e.h6, I = e.h7, u = 0; u < 64; ++u)
      i = (y >>> 6 | y << 26) ^ (y >>> 11 | y << 21) ^ (y >>> 25 | y << 7), o = S ^ y & (x ^ S), s = (f >>> 2 | f << 30) ^ (f >>> 13 | f << 19) ^ (f >>> 22 | f << 10), l = f & c | v & (f ^ c), r = I + i + o + Sn[u] + t[u], n = s + l, I = S, S = x, x = y, y = m + r >>> 0, m = v, v = c, c = f, f = r + n >>> 0;
    e.h0 = e.h0 + f | 0, e.h1 = e.h1 + c | 0, e.h2 = e.h2 + v | 0, e.h3 = e.h3 + m | 0, e.h4 = e.h4 + y | 0, e.h5 = e.h5 + x | 0, e.h6 = e.h6 + S | 0, e.h7 = e.h7 + I | 0, b -= 64;
  }
}
var vt = z, xr = null;
vt.util.isNodejs && !process.versions["node-webkit"] && (xr = va);
var Ki = vt.prng = vt.prng || {};
Ki.create = function(e) {
  for (var t = {
    plugin: e,
    key: null,
    seed: null,
    time: null,
    // number of reseeds so far
    reseeds: 0,
    // amount of data generated so far
    generated: 0,
    // no initial key bytes
    keyBytes: ""
  }, a = e.md, r = new Array(32), n = 0; n < 32; ++n)
    r[n] = a.create();
  t.pools = r, t.pool = 0, t.generate = function(u, f) {
    if (!f)
      return t.generateSync(u);
    var c = t.plugin.cipher, v = t.plugin.increment, m = t.plugin.formatKey, y = t.plugin.formatSeed, x = vt.util.createBuffer();
    t.key = null, S();
    function S(I) {
      if (I)
        return f(I);
      if (x.length() >= u)
        return f(null, x.getBytes(u));
      if (t.generated > 1048575 && (t.key = null), t.key === null)
        return vt.util.nextTick(function() {
          s(S);
        });
      var b = c(t.key, t.seed);
      t.generated += b.length, x.putBytes(b), t.key = m(c(t.key, v(t.seed))), t.seed = y(c(t.key, t.seed)), vt.util.setImmediate(S);
    }
  }, t.generateSync = function(u) {
    var f = t.plugin.cipher, c = t.plugin.increment, v = t.plugin.formatKey, m = t.plugin.formatSeed;
    t.key = null;
    for (var y = vt.util.createBuffer(); y.length() < u; ) {
      t.generated > 1048575 && (t.key = null), t.key === null && i();
      var x = f(t.key, t.seed);
      t.generated += x.length, y.putBytes(x), t.key = v(f(t.key, c(t.seed))), t.seed = m(f(t.key, t.seed));
    }
    return y.getBytes(u);
  };
  function s(u) {
    if (t.pools[0].messageLength >= 32)
      return o(), u();
    var f = 32 - t.pools[0].messageLength << 5;
    t.seedFile(f, function(c, v) {
      if (c)
        return u(c);
      t.collect(v), o(), u();
    });
  }
  function i() {
    if (t.pools[0].messageLength >= 32)
      return o();
    var u = 32 - t.pools[0].messageLength << 5;
    t.collect(t.seedFileSync(u)), o();
  }
  function o() {
    t.reseeds = t.reseeds === 4294967295 ? 0 : t.reseeds + 1;
    var u = t.plugin.md.create();
    u.update(t.keyBytes);
    for (var f = 1, c = 0; c < 32; ++c)
      t.reseeds % f === 0 && (u.update(t.pools[c].digest().getBytes()), t.pools[c].start()), f = f << 1;
    t.keyBytes = u.digest().getBytes(), u.start(), u.update(t.keyBytes);
    var v = u.digest().getBytes();
    t.key = t.plugin.formatKey(t.keyBytes), t.seed = t.plugin.formatSeed(v), t.generated = 0;
  }
  function l(u) {
    var f = null, c = vt.util.globalScope, v = c.crypto || c.msCrypto;
    v && v.getRandomValues && (f = function(k) {
      return v.getRandomValues(k);
    });
    var m = vt.util.createBuffer();
    if (f)
      for (; m.length() < u; ) {
        var y = Math.max(1, Math.min(u - m.length(), 65536) / 4), x = new Uint32Array(Math.floor(y));
        try {
          f(x);
          for (var S = 0; S < x.length; ++S)
            m.putInt32(x[S]);
        } catch (k) {
          if (!(typeof QuotaExceededError < "u" && k instanceof QuotaExceededError))
            throw k;
        }
      }
    if (m.length() < u)
      for (var I, b, _, V = Math.floor(Math.random() * 65536); m.length() < u; ) {
        b = 16807 * (V & 65535), I = 16807 * (V >> 16), b += (I & 32767) << 16, b += I >> 15, b = (b & 2147483647) + (b >> 31), V = b & 4294967295;
        for (var S = 0; S < 3; ++S)
          _ = V >>> (S << 3), _ ^= Math.floor(Math.random() * 256), m.putByte(_ & 255);
      }
    return m.getBytes(u);
  }
  return xr ? (t.seedFile = function(u, f) {
    xr.randomBytes(u, function(c, v) {
      if (c)
        return f(c);
      f(null, v.toString());
    });
  }, t.seedFileSync = function(u) {
    return xr.randomBytes(u).toString();
  }) : (t.seedFile = function(u, f) {
    try {
      f(null, l(u));
    } catch (c) {
      f(c);
    }
  }, t.seedFileSync = l), t.collect = function(u) {
    for (var f = u.length, c = 0; c < f; ++c)
      t.pools[t.pool].update(u.substr(c, 1)), t.pool = t.pool === 31 ? 0 : t.pool + 1;
  }, t.collectInt = function(u, f) {
    for (var c = "", v = 0; v < f; v += 8)
      c += String.fromCharCode(u >> v & 255);
    t.collect(c);
  }, t.registerWorker = function(u) {
    if (u === self)
      t.seedFile = function(c, v) {
        function m(y) {
          var x = y.data;
          x.forge && x.forge.prng && (self.removeEventListener("message", m), v(x.forge.prng.err, x.forge.prng.bytes));
        }
        self.addEventListener("message", m), self.postMessage({ forge: { prng: { needed: c } } });
      };
    else {
      var f = function(c) {
        var v = c.data;
        v.forge && v.forge.prng && t.seedFile(v.forge.prng.needed, function(m, y) {
          u.postMessage({ forge: { prng: { err: m, bytes: y } } });
        });
      };
      u.addEventListener("message", f);
    }
  }, t;
};
var Ke = z;
(function() {
  Ke.random && Ke.random.getBytes || function(e) {
    var t = {}, a = new Array(4), r = Ke.util.createBuffer();
    t.formatKey = function(c) {
      var v = Ke.util.createBuffer(c);
      return c = new Array(4), c[0] = v.getInt32(), c[1] = v.getInt32(), c[2] = v.getInt32(), c[3] = v.getInt32(), Ke.aes._expandKey(c, !1);
    }, t.formatSeed = function(c) {
      var v = Ke.util.createBuffer(c);
      return c = new Array(4), c[0] = v.getInt32(), c[1] = v.getInt32(), c[2] = v.getInt32(), c[3] = v.getInt32(), c;
    }, t.cipher = function(c, v) {
      return Ke.aes._updateBlock(c, v, a, !1), r.putInt32(a[0]), r.putInt32(a[1]), r.putInt32(a[2]), r.putInt32(a[3]), r.getBytes();
    }, t.increment = function(c) {
      return ++c[3], c;
    }, t.md = Ke.md.sha256;
    function n() {
      var c = Ke.prng.create(t);
      return c.getBytes = function(v, m) {
        return c.generate(v, m);
      }, c.getBytesSync = function(v) {
        return c.generate(v);
      }, c;
    }
    var s = n(), i = null, o = Ke.util.globalScope, l = o.crypto || o.msCrypto;
    if (l && l.getRandomValues && (i = function(c) {
      return l.getRandomValues(c);
    }), !Ke.util.isNodejs && !i) {
      if (s.collectInt(+/* @__PURE__ */ new Date(), 32), typeof navigator < "u") {
        var u = "";
        for (var f in navigator)
          try {
            typeof navigator[f] == "string" && (u += navigator[f]);
          } catch {
          }
        s.collect(u), u = null;
      }
      e && (e().mousemove(function(c) {
        s.collectInt(c.clientX, 16), s.collectInt(c.clientY, 16);
      }), e().keypress(function(c) {
        s.collectInt(c.charCode, 8);
      }));
    }
    if (!Ke.random)
      Ke.random = s;
    else
      for (var f in s)
        Ke.random[f] = s[f];
    Ke.random.createInstance = n;
  }(typeof jQuery < "u" ? jQuery : null);
})();
var qe = z, Gr = [
  217,
  120,
  249,
  196,
  25,
  221,
  181,
  237,
  40,
  233,
  253,
  121,
  74,
  160,
  216,
  157,
  198,
  126,
  55,
  131,
  43,
  118,
  83,
  142,
  98,
  76,
  100,
  136,
  68,
  139,
  251,
  162,
  23,
  154,
  89,
  245,
  135,
  179,
  79,
  19,
  97,
  69,
  109,
  141,
  9,
  129,
  125,
  50,
  189,
  143,
  64,
  235,
  134,
  183,
  123,
  11,
  240,
  149,
  33,
  34,
  92,
  107,
  78,
  130,
  84,
  214,
  101,
  147,
  206,
  96,
  178,
  28,
  115,
  86,
  192,
  20,
  167,
  140,
  241,
  220,
  18,
  117,
  202,
  31,
  59,
  190,
  228,
  209,
  66,
  61,
  212,
  48,
  163,
  60,
  182,
  38,
  111,
  191,
  14,
  218,
  70,
  105,
  7,
  87,
  39,
  242,
  29,
  155,
  188,
  148,
  67,
  3,
  248,
  17,
  199,
  246,
  144,
  239,
  62,
  231,
  6,
  195,
  213,
  47,
  200,
  102,
  30,
  215,
  8,
  232,
  234,
  222,
  128,
  82,
  238,
  247,
  132,
  170,
  114,
  172,
  53,
  77,
  106,
  42,
  150,
  26,
  210,
  113,
  90,
  21,
  73,
  116,
  75,
  159,
  208,
  94,
  4,
  24,
  164,
  236,
  194,
  224,
  65,
  110,
  15,
  81,
  203,
  204,
  36,
  145,
  175,
  80,
  161,
  244,
  112,
  57,
  153,
  124,
  58,
  133,
  35,
  184,
  180,
  122,
  252,
  2,
  54,
  91,
  37,
  85,
  151,
  49,
  45,
  93,
  250,
  152,
  227,
  138,
  146,
  174,
  5,
  223,
  41,
  16,
  103,
  108,
  186,
  201,
  211,
  0,
  230,
  207,
  225,
  158,
  168,
  44,
  99,
  22,
  1,
  63,
  88,
  226,
  137,
  169,
  13,
  56,
  52,
  27,
  171,
  51,
  255,
  176,
  187,
  72,
  12,
  95,
  185,
  177,
  205,
  46,
  197,
  243,
  219,
  71,
  229,
  165,
  156,
  119,
  10,
  166,
  32,
  104,
  254,
  127,
  193,
  173
], Ga = [1, 2, 3, 5], Mi = function(e, t) {
  return e << t & 65535 | (e & 65535) >> 16 - t;
}, Hi = function(e, t) {
  return (e & 65535) >> t | e << 16 - t & 65535;
};
qe.rc2 = qe.rc2 || {};
qe.rc2.expandKey = function(e, t) {
  typeof e == "string" && (e = qe.util.createBuffer(e)), t = t || 128;
  var a = e, r = e.length(), n = t, s = Math.ceil(n / 8), i = 255 >> (n & 7), o;
  for (o = r; o < 128; o++)
    a.putByte(Gr[a.at(o - 1) + a.at(o - r) & 255]);
  for (a.setAt(128 - s, Gr[a.at(128 - s) & i]), o = 127 - s; o >= 0; o--)
    a.setAt(o, Gr[a.at(o + 1) ^ a.at(o + s)]);
  return a;
};
var Tn = function(e, t, a) {
  var r = !1, n = null, s = null, i = null, o, l, u, f, c = [];
  for (e = qe.rc2.expandKey(e, t), u = 0; u < 64; u++)
    c.push(e.getInt16Le());
  a ? (o = function(y) {
    for (u = 0; u < 4; u++)
      y[u] += c[f] + (y[(u + 3) % 4] & y[(u + 2) % 4]) + (~y[(u + 3) % 4] & y[(u + 1) % 4]), y[u] = Mi(y[u], Ga[u]), f++;
  }, l = function(y) {
    for (u = 0; u < 4; u++)
      y[u] += c[y[(u + 3) % 4] & 63];
  }) : (o = function(y) {
    for (u = 3; u >= 0; u--)
      y[u] = Hi(y[u], Ga[u]), y[u] -= c[f] + (y[(u + 3) % 4] & y[(u + 2) % 4]) + (~y[(u + 3) % 4] & y[(u + 1) % 4]), f--;
  }, l = function(y) {
    for (u = 3; u >= 0; u--)
      y[u] -= c[y[(u + 3) % 4] & 63];
  });
  var v = function(y) {
    var x = [];
    for (u = 0; u < 4; u++) {
      var S = n.getInt16Le();
      i !== null && (a ? S ^= i.getInt16Le() : i.putInt16Le(S)), x.push(S & 65535);
    }
    f = a ? 0 : 63;
    for (var I = 0; I < y.length; I++)
      for (var b = 0; b < y[I][0]; b++)
        y[I][1](x);
    for (u = 0; u < 4; u++)
      i !== null && (a ? i.putInt16Le(x[u]) : x[u] ^= i.getInt16Le()), s.putInt16Le(x[u]);
  }, m = null;
  return m = {
    /**
     * Starts or restarts the encryption or decryption process, whichever
     * was previously configured.
     *
     * To use the cipher in CBC mode, iv may be given either as a string
     * of bytes, or as a byte buffer.  For ECB mode, give null as iv.
     *
     * @param iv the initialization vector to use, null for ECB mode.
     * @param output the output the buffer to write to, null to create one.
     */
    start: function(y, x) {
      y && typeof y == "string" && (y = qe.util.createBuffer(y)), r = !1, n = qe.util.createBuffer(), s = x || new qe.util.createBuffer(), i = y, m.output = s;
    },
    /**
     * Updates the next block.
     *
     * @param input the buffer to read from.
     */
    update: function(y) {
      for (r || n.putBuffer(y); n.length() >= 8; )
        v([
          [5, o],
          [1, l],
          [6, o],
          [1, l],
          [5, o]
        ]);
    },
    /**
     * Finishes encrypting or decrypting.
     *
     * @param pad a padding function to use, null for PKCS#7 padding,
     *           signature(blockSize, buffer, decrypt).
     *
     * @return true if successful, false on error.
     */
    finish: function(y) {
      var x = !0;
      if (a)
        if (y)
          x = y(8, n, !a);
        else {
          var S = n.length() === 8 ? 8 : 8 - n.length();
          n.fillWithByte(S, S);
        }
      if (x && (r = !0, m.update()), !a && (x = n.length() === 0, x))
        if (y)
          x = y(8, s, !a);
        else {
          var I = s.length(), b = s.at(I - 1);
          b > I ? x = !1 : s.truncate(b);
        }
      return x;
    }
  }, m;
};
qe.rc2.startEncrypting = function(e, t, a) {
  var r = qe.rc2.createEncryptionCipher(e, 128);
  return r.start(t, a), r;
};
qe.rc2.createEncryptionCipher = function(e, t) {
  return Tn(e, t, !0);
};
qe.rc2.startDecrypting = function(e, t, a) {
  var r = qe.rc2.createDecryptionCipher(e, 128);
  return r.start(t, a), r;
};
qe.rc2.createDecryptionCipher = function(e, t) {
  return Tn(e, t, !1);
};
var ra = z;
ra.jsbn = ra.jsbn || {};
var yt;
function B(e, t, a) {
  this.data = [], e != null && (typeof e == "number" ? this.fromNumber(e, t, a) : t == null && typeof e != "string" ? this.fromString(e, 256) : this.fromString(e, t));
}
ra.jsbn.BigInteger = B;
function J() {
  return new B(null);
}
function Gi(e, t, a, r, n, s) {
  for (; --s >= 0; ) {
    var i = t * this.data[e++] + a.data[r] + n;
    n = Math.floor(i / 67108864), a.data[r++] = i & 67108863;
  }
  return n;
}
function qi(e, t, a, r, n, s) {
  for (var i = t & 32767, o = t >> 15; --s >= 0; ) {
    var l = this.data[e] & 32767, u = this.data[e++] >> 15, f = o * l + u * i;
    l = i * l + ((f & 32767) << 15) + a.data[r] + (n & 1073741823), n = (l >>> 30) + (f >>> 15) + o * u + (n >>> 30), a.data[r++] = l & 1073741823;
  }
  return n;
}
function qa(e, t, a, r, n, s) {
  for (var i = t & 16383, o = t >> 14; --s >= 0; ) {
    var l = this.data[e] & 16383, u = this.data[e++] >> 14, f = o * l + u * i;
    l = i * l + ((f & 16383) << 14) + a.data[r] + n, n = (l >> 28) + (f >> 14) + o * u, a.data[r++] = l & 268435455;
  }
  return n;
}
typeof navigator > "u" ? (B.prototype.am = qa, yt = 28) : navigator.appName == "Microsoft Internet Explorer" ? (B.prototype.am = qi, yt = 30) : navigator.appName != "Netscape" ? (B.prototype.am = Gi, yt = 26) : (B.prototype.am = qa, yt = 28);
B.prototype.DB = yt;
B.prototype.DM = (1 << yt) - 1;
B.prototype.DV = 1 << yt;
var Sa = 52;
B.prototype.FV = Math.pow(2, Sa);
B.prototype.F1 = Sa - yt;
B.prototype.F2 = 2 * yt - Sa;
var Qi = "0123456789abcdefghijklmnopqrstuvwxyz", Or = new Array(), Jt, Ze;
Jt = 48;
for (Ze = 0; Ze <= 9; ++Ze) Or[Jt++] = Ze;
Jt = 97;
for (Ze = 10; Ze < 36; ++Ze) Or[Jt++] = Ze;
Jt = 65;
for (Ze = 10; Ze < 36; ++Ze) Or[Jt++] = Ze;
function Qa(e) {
  return Qi.charAt(e);
}
function In(e, t) {
  var a = Or[e.charCodeAt(t)];
  return a ?? -1;
}
function zi(e) {
  for (var t = this.t - 1; t >= 0; --t) e.data[t] = this.data[t];
  e.t = this.t, e.s = this.s;
}
function Yi(e) {
  this.t = 1, this.s = e < 0 ? -1 : 0, e > 0 ? this.data[0] = e : e < -1 ? this.data[0] = e + this.DV : this.t = 0;
}
function Tt(e) {
  var t = J();
  return t.fromInt(e), t;
}
function $i(e, t) {
  var a;
  if (t == 16) a = 4;
  else if (t == 8) a = 3;
  else if (t == 256) a = 8;
  else if (t == 2) a = 1;
  else if (t == 32) a = 5;
  else if (t == 4) a = 2;
  else {
    this.fromRadix(e, t);
    return;
  }
  this.t = 0, this.s = 0;
  for (var r = e.length, n = !1, s = 0; --r >= 0; ) {
    var i = a == 8 ? e[r] & 255 : In(e, r);
    if (i < 0) {
      e.charAt(r) == "-" && (n = !0);
      continue;
    }
    n = !1, s == 0 ? this.data[this.t++] = i : s + a > this.DB ? (this.data[this.t - 1] |= (i & (1 << this.DB - s) - 1) << s, this.data[this.t++] = i >> this.DB - s) : this.data[this.t - 1] |= i << s, s += a, s >= this.DB && (s -= this.DB);
  }
  a == 8 && e[0] & 128 && (this.s = -1, s > 0 && (this.data[this.t - 1] |= (1 << this.DB - s) - 1 << s)), this.clamp(), n && B.ZERO.subTo(this, this);
}
function Wi() {
  for (var e = this.s & this.DM; this.t > 0 && this.data[this.t - 1] == e; ) --this.t;
}
function Xi(e) {
  if (this.s < 0) return "-" + this.negate().toString(e);
  var t;
  if (e == 16) t = 4;
  else if (e == 8) t = 3;
  else if (e == 2) t = 1;
  else if (e == 32) t = 5;
  else if (e == 4) t = 2;
  else return this.toRadix(e);
  var a = (1 << t) - 1, r, n = !1, s = "", i = this.t, o = this.DB - i * this.DB % t;
  if (i-- > 0)
    for (o < this.DB && (r = this.data[i] >> o) > 0 && (n = !0, s = Qa(r)); i >= 0; )
      o < t ? (r = (this.data[i] & (1 << o) - 1) << t - o, r |= this.data[--i] >> (o += this.DB - t)) : (r = this.data[i] >> (o -= t) & a, o <= 0 && (o += this.DB, --i)), r > 0 && (n = !0), n && (s += Qa(r));
  return n ? s : "0";
}
function ji() {
  var e = J();
  return B.ZERO.subTo(this, e), e;
}
function Zi() {
  return this.s < 0 ? this.negate() : this;
}
function Ji(e) {
  var t = this.s - e.s;
  if (t != 0) return t;
  var a = this.t;
  if (t = a - e.t, t != 0) return this.s < 0 ? -t : t;
  for (; --a >= 0; ) if ((t = this.data[a] - e.data[a]) != 0) return t;
  return 0;
}
function Fr(e) {
  var t = 1, a;
  return (a = e >>> 16) != 0 && (e = a, t += 16), (a = e >> 8) != 0 && (e = a, t += 8), (a = e >> 4) != 0 && (e = a, t += 4), (a = e >> 2) != 0 && (e = a, t += 2), (a = e >> 1) != 0 && (e = a, t += 1), t;
}
function es() {
  return this.t <= 0 ? 0 : this.DB * (this.t - 1) + Fr(this.data[this.t - 1] ^ this.s & this.DM);
}
function ts(e, t) {
  var a;
  for (a = this.t - 1; a >= 0; --a) t.data[a + e] = this.data[a];
  for (a = e - 1; a >= 0; --a) t.data[a] = 0;
  t.t = this.t + e, t.s = this.s;
}
function rs(e, t) {
  for (var a = e; a < this.t; ++a) t.data[a - e] = this.data[a];
  t.t = Math.max(this.t - e, 0), t.s = this.s;
}
function as(e, t) {
  var a = e % this.DB, r = this.DB - a, n = (1 << r) - 1, s = Math.floor(e / this.DB), i = this.s << a & this.DM, o;
  for (o = this.t - 1; o >= 0; --o)
    t.data[o + s + 1] = this.data[o] >> r | i, i = (this.data[o] & n) << a;
  for (o = s - 1; o >= 0; --o) t.data[o] = 0;
  t.data[s] = i, t.t = this.t + s + 1, t.s = this.s, t.clamp();
}
function ns(e, t) {
  t.s = this.s;
  var a = Math.floor(e / this.DB);
  if (a >= this.t) {
    t.t = 0;
    return;
  }
  var r = e % this.DB, n = this.DB - r, s = (1 << r) - 1;
  t.data[0] = this.data[a] >> r;
  for (var i = a + 1; i < this.t; ++i)
    t.data[i - a - 1] |= (this.data[i] & s) << n, t.data[i - a] = this.data[i] >> r;
  r > 0 && (t.data[this.t - a - 1] |= (this.s & s) << n), t.t = this.t - a, t.clamp();
}
function is(e, t) {
  for (var a = 0, r = 0, n = Math.min(e.t, this.t); a < n; )
    r += this.data[a] - e.data[a], t.data[a++] = r & this.DM, r >>= this.DB;
  if (e.t < this.t) {
    for (r -= e.s; a < this.t; )
      r += this.data[a], t.data[a++] = r & this.DM, r >>= this.DB;
    r += this.s;
  } else {
    for (r += this.s; a < e.t; )
      r -= e.data[a], t.data[a++] = r & this.DM, r >>= this.DB;
    r -= e.s;
  }
  t.s = r < 0 ? -1 : 0, r < -1 ? t.data[a++] = this.DV + r : r > 0 && (t.data[a++] = r), t.t = a, t.clamp();
}
function ss(e, t) {
  var a = this.abs(), r = e.abs(), n = a.t;
  for (t.t = n + r.t; --n >= 0; ) t.data[n] = 0;
  for (n = 0; n < r.t; ++n) t.data[n + a.t] = a.am(0, r.data[n], t, n, 0, a.t);
  t.s = 0, t.clamp(), this.s != e.s && B.ZERO.subTo(t, t);
}
function os(e) {
  for (var t = this.abs(), a = e.t = 2 * t.t; --a >= 0; ) e.data[a] = 0;
  for (a = 0; a < t.t - 1; ++a) {
    var r = t.am(a, t.data[a], e, 2 * a, 0, 1);
    (e.data[a + t.t] += t.am(a + 1, 2 * t.data[a], e, 2 * a + 1, r, t.t - a - 1)) >= t.DV && (e.data[a + t.t] -= t.DV, e.data[a + t.t + 1] = 1);
  }
  e.t > 0 && (e.data[e.t - 1] += t.am(a, t.data[a], e, 2 * a, 0, 1)), e.s = 0, e.clamp();
}
function us(e, t, a) {
  var r = e.abs();
  if (!(r.t <= 0)) {
    var n = this.abs();
    if (n.t < r.t) {
      t != null && t.fromInt(0), a != null && this.copyTo(a);
      return;
    }
    a == null && (a = J());
    var s = J(), i = this.s, o = e.s, l = this.DB - Fr(r.data[r.t - 1]);
    l > 0 ? (r.lShiftTo(l, s), n.lShiftTo(l, a)) : (r.copyTo(s), n.copyTo(a));
    var u = s.t, f = s.data[u - 1];
    if (f != 0) {
      var c = f * (1 << this.F1) + (u > 1 ? s.data[u - 2] >> this.F2 : 0), v = this.FV / c, m = (1 << this.F1) / c, y = 1 << this.F2, x = a.t, S = x - u, I = t ?? J();
      for (s.dlShiftTo(S, I), a.compareTo(I) >= 0 && (a.data[a.t++] = 1, a.subTo(I, a)), B.ONE.dlShiftTo(u, I), I.subTo(s, s); s.t < u; ) s.data[s.t++] = 0;
      for (; --S >= 0; ) {
        var b = a.data[--x] == f ? this.DM : Math.floor(a.data[x] * v + (a.data[x - 1] + y) * m);
        if ((a.data[x] += s.am(0, b, a, S, 0, u)) < b)
          for (s.dlShiftTo(S, I), a.subTo(I, a); a.data[x] < --b; ) a.subTo(I, a);
      }
      t != null && (a.drShiftTo(u, t), i != o && B.ZERO.subTo(t, t)), a.t = u, a.clamp(), l > 0 && a.rShiftTo(l, a), i < 0 && B.ZERO.subTo(a, a);
    }
  }
}
function ls(e) {
  var t = J();
  return this.abs().divRemTo(e, null, t), this.s < 0 && t.compareTo(B.ZERO) > 0 && e.subTo(t, t), t;
}
function Ft(e) {
  this.m = e;
}
function fs(e) {
  return e.s < 0 || e.compareTo(this.m) >= 0 ? e.mod(this.m) : e;
}
function cs(e) {
  return e;
}
function hs(e) {
  e.divRemTo(this.m, null, e);
}
function ds(e, t, a) {
  e.multiplyTo(t, a), this.reduce(a);
}
function ps(e, t) {
  e.squareTo(t), this.reduce(t);
}
Ft.prototype.convert = fs;
Ft.prototype.revert = cs;
Ft.prototype.reduce = hs;
Ft.prototype.mulTo = ds;
Ft.prototype.sqrTo = ps;
function vs() {
  if (this.t < 1) return 0;
  var e = this.data[0];
  if (!(e & 1)) return 0;
  var t = e & 3;
  return t = t * (2 - (e & 15) * t) & 15, t = t * (2 - (e & 255) * t) & 255, t = t * (2 - ((e & 65535) * t & 65535)) & 65535, t = t * (2 - e * t % this.DV) % this.DV, t > 0 ? this.DV - t : -t;
}
function Kt(e) {
  this.m = e, this.mp = e.invDigit(), this.mpl = this.mp & 32767, this.mph = this.mp >> 15, this.um = (1 << e.DB - 15) - 1, this.mt2 = 2 * e.t;
}
function ys(e) {
  var t = J();
  return e.abs().dlShiftTo(this.m.t, t), t.divRemTo(this.m, null, t), e.s < 0 && t.compareTo(B.ZERO) > 0 && this.m.subTo(t, t), t;
}
function gs(e) {
  var t = J();
  return e.copyTo(t), this.reduce(t), t;
}
function ms(e) {
  for (; e.t <= this.mt2; )
    e.data[e.t++] = 0;
  for (var t = 0; t < this.m.t; ++t) {
    var a = e.data[t] & 32767, r = a * this.mpl + ((a * this.mph + (e.data[t] >> 15) * this.mpl & this.um) << 15) & e.DM;
    for (a = t + this.m.t, e.data[a] += this.m.am(0, r, e, t, 0, this.m.t); e.data[a] >= e.DV; )
      e.data[a] -= e.DV, e.data[++a]++;
  }
  e.clamp(), e.drShiftTo(this.m.t, e), e.compareTo(this.m) >= 0 && e.subTo(this.m, e);
}
function Cs(e, t) {
  e.squareTo(t), this.reduce(t);
}
function Es(e, t, a) {
  e.multiplyTo(t, a), this.reduce(a);
}
Kt.prototype.convert = ys;
Kt.prototype.revert = gs;
Kt.prototype.reduce = ms;
Kt.prototype.mulTo = Es;
Kt.prototype.sqrTo = Cs;
function xs() {
  return (this.t > 0 ? this.data[0] & 1 : this.s) == 0;
}
function Ss(e, t) {
  if (e > 4294967295 || e < 1) return B.ONE;
  var a = J(), r = J(), n = t.convert(this), s = Fr(e) - 1;
  for (n.copyTo(a); --s >= 0; )
    if (t.sqrTo(a, r), (e & 1 << s) > 0) t.mulTo(r, n, a);
    else {
      var i = a;
      a = r, r = i;
    }
  return t.revert(a);
}
function Ts(e, t) {
  var a;
  return e < 256 || t.isEven() ? a = new Ft(t) : a = new Kt(t), this.exp(e, a);
}
B.prototype.copyTo = zi;
B.prototype.fromInt = Yi;
B.prototype.fromString = $i;
B.prototype.clamp = Wi;
B.prototype.dlShiftTo = ts;
B.prototype.drShiftTo = rs;
B.prototype.lShiftTo = as;
B.prototype.rShiftTo = ns;
B.prototype.subTo = is;
B.prototype.multiplyTo = ss;
B.prototype.squareTo = os;
B.prototype.divRemTo = us;
B.prototype.invDigit = vs;
B.prototype.isEven = xs;
B.prototype.exp = Ss;
B.prototype.toString = Xi;
B.prototype.negate = ji;
B.prototype.abs = Zi;
B.prototype.compareTo = Ji;
B.prototype.bitLength = es;
B.prototype.mod = ls;
B.prototype.modPowInt = Ts;
B.ZERO = Tt(0);
B.ONE = Tt(1);
function Is() {
  var e = J();
  return this.copyTo(e), e;
}
function As() {
  if (this.s < 0) {
    if (this.t == 1) return this.data[0] - this.DV;
    if (this.t == 0) return -1;
  } else {
    if (this.t == 1) return this.data[0];
    if (this.t == 0) return 0;
  }
  return (this.data[1] & (1 << 32 - this.DB) - 1) << this.DB | this.data[0];
}
function Bs() {
  return this.t == 0 ? this.s : this.data[0] << 24 >> 24;
}
function bs() {
  return this.t == 0 ? this.s : this.data[0] << 16 >> 16;
}
function _s(e) {
  return Math.floor(Math.LN2 * this.DB / Math.log(e));
}
function Ns() {
  return this.s < 0 ? -1 : this.t <= 0 || this.t == 1 && this.data[0] <= 0 ? 0 : 1;
}
function Rs(e) {
  if (e == null && (e = 10), this.signum() == 0 || e < 2 || e > 36) return "0";
  var t = this.chunkSize(e), a = Math.pow(e, t), r = Tt(a), n = J(), s = J(), i = "";
  for (this.divRemTo(r, n, s); n.signum() > 0; )
    i = (a + s.intValue()).toString(e).substr(1) + i, n.divRemTo(r, n, s);
  return s.intValue().toString(e) + i;
}
function ws(e, t) {
  this.fromInt(0), t == null && (t = 10);
  for (var a = this.chunkSize(t), r = Math.pow(t, a), n = !1, s = 0, i = 0, o = 0; o < e.length; ++o) {
    var l = In(e, o);
    if (l < 0) {
      e.charAt(o) == "-" && this.signum() == 0 && (n = !0);
      continue;
    }
    i = t * i + l, ++s >= a && (this.dMultiply(r), this.dAddOffset(i, 0), s = 0, i = 0);
  }
  s > 0 && (this.dMultiply(Math.pow(t, s)), this.dAddOffset(i, 0)), n && B.ZERO.subTo(this, this);
}
function Ls(e, t, a) {
  if (typeof t == "number")
    if (e < 2) this.fromInt(1);
    else
      for (this.fromNumber(e, a), this.testBit(e - 1) || this.bitwiseTo(B.ONE.shiftLeft(e - 1), Ta, this), this.isEven() && this.dAddOffset(1, 0); !this.isProbablePrime(t); )
        this.dAddOffset(2, 0), this.bitLength() > e && this.subTo(B.ONE.shiftLeft(e - 1), this);
  else {
    var r = new Array(), n = e & 7;
    r.length = (e >> 3) + 1, t.nextBytes(r), n > 0 ? r[0] &= (1 << n) - 1 : r[0] = 0, this.fromString(r, 256);
  }
}
function ks() {
  var e = this.t, t = new Array();
  t[0] = this.s;
  var a = this.DB - e * this.DB % 8, r, n = 0;
  if (e-- > 0)
    for (a < this.DB && (r = this.data[e] >> a) != (this.s & this.DM) >> a && (t[n++] = r | this.s << this.DB - a); e >= 0; )
      a < 8 ? (r = (this.data[e] & (1 << a) - 1) << 8 - a, r |= this.data[--e] >> (a += this.DB - 8)) : (r = this.data[e] >> (a -= 8) & 255, a <= 0 && (a += this.DB, --e)), r & 128 && (r |= -256), n == 0 && (this.s & 128) != (r & 128) && ++n, (n > 0 || r != this.s) && (t[n++] = r);
  return t;
}
function Ds(e) {
  return this.compareTo(e) == 0;
}
function Us(e) {
  return this.compareTo(e) < 0 ? this : e;
}
function Ps(e) {
  return this.compareTo(e) > 0 ? this : e;
}
function Vs(e, t, a) {
  var r, n, s = Math.min(e.t, this.t);
  for (r = 0; r < s; ++r) a.data[r] = t(this.data[r], e.data[r]);
  if (e.t < this.t) {
    for (n = e.s & this.DM, r = s; r < this.t; ++r) a.data[r] = t(this.data[r], n);
    a.t = this.t;
  } else {
    for (n = this.s & this.DM, r = s; r < e.t; ++r) a.data[r] = t(n, e.data[r]);
    a.t = e.t;
  }
  a.s = t(this.s, e.s), a.clamp();
}
function Os(e, t) {
  return e & t;
}
function Fs(e) {
  var t = J();
  return this.bitwiseTo(e, Os, t), t;
}
function Ta(e, t) {
  return e | t;
}
function Ks(e) {
  var t = J();
  return this.bitwiseTo(e, Ta, t), t;
}
function An(e, t) {
  return e ^ t;
}
function Ms(e) {
  var t = J();
  return this.bitwiseTo(e, An, t), t;
}
function Bn(e, t) {
  return e & ~t;
}
function Hs(e) {
  var t = J();
  return this.bitwiseTo(e, Bn, t), t;
}
function Gs() {
  for (var e = J(), t = 0; t < this.t; ++t) e.data[t] = this.DM & ~this.data[t];
  return e.t = this.t, e.s = ~this.s, e;
}
function qs(e) {
  var t = J();
  return e < 0 ? this.rShiftTo(-e, t) : this.lShiftTo(e, t), t;
}
function Qs(e) {
  var t = J();
  return e < 0 ? this.lShiftTo(-e, t) : this.rShiftTo(e, t), t;
}
function zs(e) {
  if (e == 0) return -1;
  var t = 0;
  return e & 65535 || (e >>= 16, t += 16), e & 255 || (e >>= 8, t += 8), e & 15 || (e >>= 4, t += 4), e & 3 || (e >>= 2, t += 2), e & 1 || ++t, t;
}
function Ys() {
  for (var e = 0; e < this.t; ++e)
    if (this.data[e] != 0) return e * this.DB + zs(this.data[e]);
  return this.s < 0 ? this.t * this.DB : -1;
}
function $s(e) {
  for (var t = 0; e != 0; )
    e &= e - 1, ++t;
  return t;
}
function Ws() {
  for (var e = 0, t = this.s & this.DM, a = 0; a < this.t; ++a) e += $s(this.data[a] ^ t);
  return e;
}
function Xs(e) {
  var t = Math.floor(e / this.DB);
  return t >= this.t ? this.s != 0 : (this.data[t] & 1 << e % this.DB) != 0;
}
function js(e, t) {
  var a = B.ONE.shiftLeft(e);
  return this.bitwiseTo(a, t, a), a;
}
function Zs(e) {
  return this.changeBit(e, Ta);
}
function Js(e) {
  return this.changeBit(e, Bn);
}
function eo(e) {
  return this.changeBit(e, An);
}
function to(e, t) {
  for (var a = 0, r = 0, n = Math.min(e.t, this.t); a < n; )
    r += this.data[a] + e.data[a], t.data[a++] = r & this.DM, r >>= this.DB;
  if (e.t < this.t) {
    for (r += e.s; a < this.t; )
      r += this.data[a], t.data[a++] = r & this.DM, r >>= this.DB;
    r += this.s;
  } else {
    for (r += this.s; a < e.t; )
      r += e.data[a], t.data[a++] = r & this.DM, r >>= this.DB;
    r += e.s;
  }
  t.s = r < 0 ? -1 : 0, r > 0 ? t.data[a++] = r : r < -1 && (t.data[a++] = this.DV + r), t.t = a, t.clamp();
}
function ro(e) {
  var t = J();
  return this.addTo(e, t), t;
}
function ao(e) {
  var t = J();
  return this.subTo(e, t), t;
}
function no(e) {
  var t = J();
  return this.multiplyTo(e, t), t;
}
function io() {
  var e = J();
  return this.squareTo(e), e;
}
function so(e) {
  var t = J();
  return this.divRemTo(e, t, null), t;
}
function oo(e) {
  var t = J();
  return this.divRemTo(e, null, t), t;
}
function uo(e) {
  var t = J(), a = J();
  return this.divRemTo(e, t, a), new Array(t, a);
}
function lo(e) {
  this.data[this.t] = this.am(0, e - 1, this, 0, 0, this.t), ++this.t, this.clamp();
}
function fo(e, t) {
  if (e != 0) {
    for (; this.t <= t; ) this.data[this.t++] = 0;
    for (this.data[t] += e; this.data[t] >= this.DV; )
      this.data[t] -= this.DV, ++t >= this.t && (this.data[this.t++] = 0), ++this.data[t];
  }
}
function hr() {
}
function bn(e) {
  return e;
}
function co(e, t, a) {
  e.multiplyTo(t, a);
}
function ho(e, t) {
  e.squareTo(t);
}
hr.prototype.convert = bn;
hr.prototype.revert = bn;
hr.prototype.mulTo = co;
hr.prototype.sqrTo = ho;
function po(e) {
  return this.exp(e, new hr());
}
function vo(e, t, a) {
  var r = Math.min(this.t + e.t, t);
  for (a.s = 0, a.t = r; r > 0; ) a.data[--r] = 0;
  var n;
  for (n = a.t - this.t; r < n; ++r) a.data[r + this.t] = this.am(0, e.data[r], a, r, 0, this.t);
  for (n = Math.min(e.t, t); r < n; ++r) this.am(0, e.data[r], a, r, 0, t - r);
  a.clamp();
}
function yo(e, t, a) {
  --t;
  var r = a.t = this.t + e.t - t;
  for (a.s = 0; --r >= 0; ) a.data[r] = 0;
  for (r = Math.max(t - this.t, 0); r < e.t; ++r)
    a.data[this.t + r - t] = this.am(t - r, e.data[r], a, 0, 0, this.t + r - t);
  a.clamp(), a.drShiftTo(1, a);
}
function er(e) {
  this.r2 = J(), this.q3 = J(), B.ONE.dlShiftTo(2 * e.t, this.r2), this.mu = this.r2.divide(e), this.m = e;
}
function go(e) {
  if (e.s < 0 || e.t > 2 * this.m.t) return e.mod(this.m);
  if (e.compareTo(this.m) < 0) return e;
  var t = J();
  return e.copyTo(t), this.reduce(t), t;
}
function mo(e) {
  return e;
}
function Co(e) {
  for (e.drShiftTo(this.m.t - 1, this.r2), e.t > this.m.t + 1 && (e.t = this.m.t + 1, e.clamp()), this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3), this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); e.compareTo(this.r2) < 0; ) e.dAddOffset(1, this.m.t + 1);
  for (e.subTo(this.r2, e); e.compareTo(this.m) >= 0; ) e.subTo(this.m, e);
}
function Eo(e, t) {
  e.squareTo(t), this.reduce(t);
}
function xo(e, t, a) {
  e.multiplyTo(t, a), this.reduce(a);
}
er.prototype.convert = go;
er.prototype.revert = mo;
er.prototype.reduce = Co;
er.prototype.mulTo = xo;
er.prototype.sqrTo = Eo;
function So(e, t) {
  var a = e.bitLength(), r, n = Tt(1), s;
  if (a <= 0) return n;
  a < 18 ? r = 1 : a < 48 ? r = 3 : a < 144 ? r = 4 : a < 768 ? r = 5 : r = 6, a < 8 ? s = new Ft(t) : t.isEven() ? s = new er(t) : s = new Kt(t);
  var i = new Array(), o = 3, l = r - 1, u = (1 << r) - 1;
  if (i[1] = s.convert(this), r > 1) {
    var f = J();
    for (s.sqrTo(i[1], f); o <= u; )
      i[o] = J(), s.mulTo(f, i[o - 2], i[o]), o += 2;
  }
  var c = e.t - 1, v, m = !0, y = J(), x;
  for (a = Fr(e.data[c]) - 1; c >= 0; ) {
    for (a >= l ? v = e.data[c] >> a - l & u : (v = (e.data[c] & (1 << a + 1) - 1) << l - a, c > 0 && (v |= e.data[c - 1] >> this.DB + a - l)), o = r; !(v & 1); )
      v >>= 1, --o;
    if ((a -= o) < 0 && (a += this.DB, --c), m)
      i[v].copyTo(n), m = !1;
    else {
      for (; o > 1; )
        s.sqrTo(n, y), s.sqrTo(y, n), o -= 2;
      o > 0 ? s.sqrTo(n, y) : (x = n, n = y, y = x), s.mulTo(y, i[v], n);
    }
    for (; c >= 0 && !(e.data[c] & 1 << a); )
      s.sqrTo(n, y), x = n, n = y, y = x, --a < 0 && (a = this.DB - 1, --c);
  }
  return s.revert(n);
}
function To(e) {
  var t = this.s < 0 ? this.negate() : this.clone(), a = e.s < 0 ? e.negate() : e.clone();
  if (t.compareTo(a) < 0) {
    var r = t;
    t = a, a = r;
  }
  var n = t.getLowestSetBit(), s = a.getLowestSetBit();
  if (s < 0) return t;
  for (n < s && (s = n), s > 0 && (t.rShiftTo(s, t), a.rShiftTo(s, a)); t.signum() > 0; )
    (n = t.getLowestSetBit()) > 0 && t.rShiftTo(n, t), (n = a.getLowestSetBit()) > 0 && a.rShiftTo(n, a), t.compareTo(a) >= 0 ? (t.subTo(a, t), t.rShiftTo(1, t)) : (a.subTo(t, a), a.rShiftTo(1, a));
  return s > 0 && a.lShiftTo(s, a), a;
}
function Io(e) {
  if (e <= 0) return 0;
  var t = this.DV % e, a = this.s < 0 ? e - 1 : 0;
  if (this.t > 0)
    if (t == 0) a = this.data[0] % e;
    else for (var r = this.t - 1; r >= 0; --r) a = (t * a + this.data[r]) % e;
  return a;
}
function Ao(e) {
  if (this.signum() == 0)
    return B.ZERO;
  var t = e.isEven();
  if (this.isEven() && t || e.signum() == 0) return B.ZERO;
  for (var a = e.clone(), r = this.clone(), n = Tt(1), s = Tt(0), i = Tt(0), o = Tt(1); a.signum() != 0; ) {
    for (; a.isEven(); )
      a.rShiftTo(1, a), t ? ((!n.isEven() || !s.isEven()) && (n.addTo(this, n), s.subTo(e, s)), n.rShiftTo(1, n)) : s.isEven() || s.subTo(e, s), s.rShiftTo(1, s);
    for (; r.isEven(); )
      r.rShiftTo(1, r), t ? ((!i.isEven() || !o.isEven()) && (i.addTo(this, i), o.subTo(e, o)), i.rShiftTo(1, i)) : o.isEven() || o.subTo(e, o), o.rShiftTo(1, o);
    a.compareTo(r) >= 0 ? (a.subTo(r, a), t && n.subTo(i, n), s.subTo(o, s)) : (r.subTo(a, r), t && i.subTo(n, i), o.subTo(s, o));
  }
  if (r.compareTo(B.ONE) != 0) return B.ZERO;
  if (o.compareTo(e) >= 0) return o.subtract(e);
  if (o.signum() < 0) o.addTo(e, o);
  else return o;
  return o.signum() < 0 ? o.add(e) : o;
}
var rt = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997], Bo = (1 << 26) / rt[rt.length - 1];
function bo(e) {
  var t, a = this.abs();
  if (a.t == 1 && a.data[0] <= rt[rt.length - 1]) {
    for (t = 0; t < rt.length; ++t)
      if (a.data[0] == rt[t]) return !0;
    return !1;
  }
  if (a.isEven()) return !1;
  for (t = 1; t < rt.length; ) {
    for (var r = rt[t], n = t + 1; n < rt.length && r < Bo; ) r *= rt[n++];
    for (r = a.modInt(r); t < n; ) if (r % rt[t++] == 0) return !1;
  }
  return a.millerRabin(e);
}
function _o(e) {
  var t = this.subtract(B.ONE), a = t.getLowestSetBit();
  if (a <= 0) return !1;
  for (var r = t.shiftRight(a), n = No(), s, i = 0; i < e; ++i) {
    do
      s = new B(this.bitLength(), n);
    while (s.compareTo(B.ONE) <= 0 || s.compareTo(t) >= 0);
    var o = s.modPow(r, this);
    if (o.compareTo(B.ONE) != 0 && o.compareTo(t) != 0) {
      for (var l = 1; l++ < a && o.compareTo(t) != 0; )
        if (o = o.modPowInt(2, this), o.compareTo(B.ONE) == 0) return !1;
      if (o.compareTo(t) != 0) return !1;
    }
  }
  return !0;
}
function No() {
  return {
    // x is an array to fill with bytes
    nextBytes: function(e) {
      for (var t = 0; t < e.length; ++t)
        e[t] = Math.floor(Math.random() * 256);
    }
  };
}
B.prototype.chunkSize = _s;
B.prototype.toRadix = Rs;
B.prototype.fromRadix = ws;
B.prototype.fromNumber = Ls;
B.prototype.bitwiseTo = Vs;
B.prototype.changeBit = js;
B.prototype.addTo = to;
B.prototype.dMultiply = lo;
B.prototype.dAddOffset = fo;
B.prototype.multiplyLowerTo = vo;
B.prototype.multiplyUpperTo = yo;
B.prototype.modInt = Io;
B.prototype.millerRabin = _o;
B.prototype.clone = Is;
B.prototype.intValue = As;
B.prototype.byteValue = Bs;
B.prototype.shortValue = bs;
B.prototype.signum = Ns;
B.prototype.toByteArray = ks;
B.prototype.equals = Ds;
B.prototype.min = Us;
B.prototype.max = Ps;
B.prototype.and = Fs;
B.prototype.or = Ks;
B.prototype.xor = Ms;
B.prototype.andNot = Hs;
B.prototype.not = Gs;
B.prototype.shiftLeft = qs;
B.prototype.shiftRight = Qs;
B.prototype.getLowestSetBit = Ys;
B.prototype.bitCount = Ws;
B.prototype.testBit = Xs;
B.prototype.setBit = Zs;
B.prototype.clearBit = Js;
B.prototype.flipBit = eo;
B.prototype.add = ro;
B.prototype.subtract = ao;
B.prototype.multiply = no;
B.prototype.divide = so;
B.prototype.remainder = oo;
B.prototype.divideAndRemainder = uo;
B.prototype.modPow = So;
B.prototype.modInverse = Ao;
B.prototype.pow = po;
B.prototype.gcd = To;
B.prototype.isProbablePrime = bo;
B.prototype.square = io;
var lt = z, _n = lt.sha1 = lt.sha1 || {};
lt.md.sha1 = lt.md.algorithms.sha1 = _n;
_n.create = function() {
  Nn || Ro();
  var e = null, t = lt.util.createBuffer(), a = new Array(80), r = {
    algorithm: "sha1",
    blockLength: 64,
    digestLength: 20,
    // 56-bit length of message so far (does not including padding)
    messageLength: 0,
    // true message length
    fullMessageLength: null,
    // size of message length in bytes
    messageLengthSize: 8
  };
  return r.start = function() {
    r.messageLength = 0, r.fullMessageLength = r.messageLength64 = [];
    for (var n = r.messageLengthSize / 4, s = 0; s < n; ++s)
      r.fullMessageLength.push(0);
    return t = lt.util.createBuffer(), e = {
      h0: 1732584193,
      h1: 4023233417,
      h2: 2562383102,
      h3: 271733878,
      h4: 3285377520
    }, r;
  }, r.start(), r.update = function(n, s) {
    s === "utf8" && (n = lt.util.encodeUtf8(n));
    var i = n.length;
    r.messageLength += i, i = [i / 4294967296 >>> 0, i >>> 0];
    for (var o = r.fullMessageLength.length - 1; o >= 0; --o)
      r.fullMessageLength[o] += i[1], i[1] = i[0] + (r.fullMessageLength[o] / 4294967296 >>> 0), r.fullMessageLength[o] = r.fullMessageLength[o] >>> 0, i[0] = i[1] / 4294967296 >>> 0;
    return t.putBytes(n), za(e, a, t), (t.read > 2048 || t.length() === 0) && t.compact(), r;
  }, r.digest = function() {
    var n = lt.util.createBuffer();
    n.putBytes(t.bytes());
    var s = r.fullMessageLength[r.fullMessageLength.length - 1] + r.messageLengthSize, i = s & r.blockLength - 1;
    n.putBytes(aa.substr(0, r.blockLength - i));
    for (var o, l, u = r.fullMessageLength[0] * 8, f = 0; f < r.fullMessageLength.length - 1; ++f)
      o = r.fullMessageLength[f + 1] * 8, l = o / 4294967296 >>> 0, u += l, n.putInt32(u >>> 0), u = o >>> 0;
    n.putInt32(u);
    var c = {
      h0: e.h0,
      h1: e.h1,
      h2: e.h2,
      h3: e.h3,
      h4: e.h4
    };
    za(c, a, n);
    var v = lt.util.createBuffer();
    return v.putInt32(c.h0), v.putInt32(c.h1), v.putInt32(c.h2), v.putInt32(c.h3), v.putInt32(c.h4), v;
  }, r;
};
var aa = null, Nn = !1;
function Ro() {
  aa = "", aa += lt.util.fillString("\0", 64), Nn = !0;
}
function za(e, t, a) {
  for (var r, n, s, i, o, l, u, f, c = a.length(); c >= 64; ) {
    for (n = e.h0, s = e.h1, i = e.h2, o = e.h3, l = e.h4, f = 0; f < 16; ++f)
      r = a.getInt32(), t[f] = r, u = o ^ s & (i ^ o), r = (n << 5 | n >>> 27) + u + l + 1518500249 + r, l = o, o = i, i = (s << 30 | s >>> 2) >>> 0, s = n, n = r;
    for (; f < 20; ++f)
      r = t[f - 3] ^ t[f - 8] ^ t[f - 14] ^ t[f - 16], r = r << 1 | r >>> 31, t[f] = r, u = o ^ s & (i ^ o), r = (n << 5 | n >>> 27) + u + l + 1518500249 + r, l = o, o = i, i = (s << 30 | s >>> 2) >>> 0, s = n, n = r;
    for (; f < 32; ++f)
      r = t[f - 3] ^ t[f - 8] ^ t[f - 14] ^ t[f - 16], r = r << 1 | r >>> 31, t[f] = r, u = s ^ i ^ o, r = (n << 5 | n >>> 27) + u + l + 1859775393 + r, l = o, o = i, i = (s << 30 | s >>> 2) >>> 0, s = n, n = r;
    for (; f < 40; ++f)
      r = t[f - 6] ^ t[f - 16] ^ t[f - 28] ^ t[f - 32], r = r << 2 | r >>> 30, t[f] = r, u = s ^ i ^ o, r = (n << 5 | n >>> 27) + u + l + 1859775393 + r, l = o, o = i, i = (s << 30 | s >>> 2) >>> 0, s = n, n = r;
    for (; f < 60; ++f)
      r = t[f - 6] ^ t[f - 16] ^ t[f - 28] ^ t[f - 32], r = r << 2 | r >>> 30, t[f] = r, u = s & i | o & (s ^ i), r = (n << 5 | n >>> 27) + u + l + 2400959708 + r, l = o, o = i, i = (s << 30 | s >>> 2) >>> 0, s = n, n = r;
    for (; f < 80; ++f)
      r = t[f - 6] ^ t[f - 16] ^ t[f - 28] ^ t[f - 32], r = r << 2 | r >>> 30, t[f] = r, u = s ^ i ^ o, r = (n << 5 | n >>> 27) + u + l + 3395469782 + r, l = o, o = i, i = (s << 30 | s >>> 2) >>> 0, s = n, n = r;
    e.h0 = e.h0 + n | 0, e.h1 = e.h1 + s | 0, e.h2 = e.h2 + i | 0, e.h3 = e.h3 + o | 0, e.h4 = e.h4 + l | 0, c -= 64;
  }
}
var ct = z, Rn = ct.pkcs1 = ct.pkcs1 || {};
Rn.encode_rsa_oaep = function(e, t, a) {
  var r, n, s, i;
  typeof a == "string" ? (r = a, n = arguments[3] || void 0, s = arguments[4] || void 0) : a && (r = a.label || void 0, n = a.seed || void 0, s = a.md || void 0, a.mgf1 && a.mgf1.md && (i = a.mgf1.md)), s ? s.start() : s = ct.md.sha1.create(), i || (i = s);
  var o = Math.ceil(e.n.bitLength() / 8), l = o - 2 * s.digestLength - 2;
  if (t.length > l) {
    var u = new Error("RSAES-OAEP input message length is too long.");
    throw u.length = t.length, u.maxLength = l, u;
  }
  r || (r = ""), s.update(r, "raw");
  for (var f = s.digest(), c = "", v = l - t.length, m = 0; m < v; m++)
    c += "\0";
  var y = f.getBytes() + c + "" + t;
  if (!n)
    n = ct.random.getBytes(s.digestLength);
  else if (n.length !== s.digestLength) {
    var u = new Error("Invalid RSAES-OAEP seed. The seed length must match the digest length.");
    throw u.seedLength = n.length, u.digestLength = s.digestLength, u;
  }
  var x = Ar(n, o - s.digestLength - 1, i), S = ct.util.xorBytes(y, x, y.length), I = Ar(S, s.digestLength, i), b = ct.util.xorBytes(n, I, n.length);
  return "\0" + b + S;
};
Rn.decode_rsa_oaep = function(e, t, a) {
  var r, n, s;
  typeof a == "string" ? (r = a, n = arguments[3] || void 0) : a && (r = a.label || void 0, n = a.md || void 0, a.mgf1 && a.mgf1.md && (s = a.mgf1.md));
  var i = Math.ceil(e.n.bitLength() / 8);
  if (t.length !== i) {
    var S = new Error("RSAES-OAEP encoded message length is invalid.");
    throw S.length = t.length, S.expectedLength = i, S;
  }
  if (n === void 0 ? n = ct.md.sha1.create() : n.start(), s || (s = n), i < 2 * n.digestLength + 2)
    throw new Error("RSAES-OAEP key is too short for the hash function.");
  r || (r = ""), n.update(r, "raw");
  for (var o = n.digest().getBytes(), l = t.charAt(0), u = t.substring(1, n.digestLength + 1), f = t.substring(1 + n.digestLength), c = Ar(f, n.digestLength, s), v = ct.util.xorBytes(u, c, u.length), m = Ar(v, i - n.digestLength - 1, s), y = ct.util.xorBytes(f, m, f.length), x = y.substring(0, n.digestLength), S = l !== "\0", I = 0; I < n.digestLength; ++I)
    S |= o.charAt(I) !== x.charAt(I);
  for (var b = 1, _ = n.digestLength, V = n.digestLength; V < y.length; V++) {
    var k = y.charCodeAt(V), w = k & 1 ^ 1, G = b ? 65534 : 0;
    S |= k & G, b = b & w, _ += b;
  }
  if (S || y.charCodeAt(_) !== 1)
    throw new Error("Invalid RSAES-OAEP padding.");
  return y.substring(_ + 1);
};
function Ar(e, t, a) {
  a || (a = ct.md.sha1.create());
  for (var r = "", n = Math.ceil(t / a.digestLength), s = 0; s < n; ++s) {
    var i = String.fromCharCode(
      s >> 24 & 255,
      s >> 16 & 255,
      s >> 8 & 255,
      s & 255
    );
    a.start(), a.update(e + i), r += a.digest().getBytes();
  }
  return r.substring(0, t);
}
var wt = z;
(function() {
  if (wt.prime)
    return;
  var e = wt.prime = wt.prime || {}, t = wt.jsbn.BigInteger, a = [6, 4, 2, 4, 2, 4, 6, 2], r = new t(null);
  r.fromInt(30);
  var n = function(c, v) {
    return c | v;
  };
  e.generateProbablePrime = function(c, v, m) {
    typeof v == "function" && (m = v, v = {}), v = v || {};
    var y = v.algorithm || "PRIMEINC";
    typeof y == "string" && (y = { name: y }), y.options = y.options || {};
    var x = v.prng || wt.random, S = {
      // x is an array to fill with bytes
      nextBytes: function(I) {
        for (var b = x.getBytesSync(I.length), _ = 0; _ < I.length; ++_)
          I[_] = b.charCodeAt(_);
      }
    };
    if (y.name === "PRIMEINC")
      return s(c, S, y.options, m);
    throw new Error("Invalid prime generation algorithm: " + y.name);
  };
  function s(c, v, m, y) {
    return "workers" in m ? l(c, v, m, y) : i(c, v, m, y);
  }
  function i(c, v, m, y) {
    var x = u(c, v), S = 0, I = f(x.bitLength());
    "millerRabinTests" in m && (I = m.millerRabinTests);
    var b = 10;
    "maxBlockTime" in m && (b = m.maxBlockTime), o(x, c, v, S, I, b, y);
  }
  function o(c, v, m, y, x, S, I) {
    var b = +/* @__PURE__ */ new Date();
    do {
      if (c.bitLength() > v && (c = u(v, m)), c.isProbablePrime(x))
        return I(null, c);
      c.dAddOffset(a[y++ % 8], 0);
    } while (S < 0 || +/* @__PURE__ */ new Date() - b < S);
    wt.util.setImmediate(function() {
      o(c, v, m, y, x, S, I);
    });
  }
  function l(c, v, m, y) {
    if (typeof Worker > "u")
      return i(c, v, m, y);
    var x = u(c, v), S = m.workers, I = m.workLoad || 100, b = I * 30 / 8, _ = m.workerScript || "forge/prime.worker.js";
    if (S === -1)
      return wt.util.estimateCores(function(k, w) {
        k && (w = 2), S = w - 1, V();
      });
    V();
    function V() {
      S = Math.max(1, S);
      for (var k = [], w = 0; w < S; ++w)
        k[w] = new Worker(_);
      for (var w = 0; w < S; ++w)
        k[w].addEventListener("message", Y);
      var G = !1;
      function Y(re) {
        if (!G) {
          var ae = re.data;
          if (ae.found) {
            for (var ne = 0; ne < k.length; ++ne)
              k[ne].terminate();
            return G = !0, y(null, new t(ae.prime, 16));
          }
          x.bitLength() > c && (x = u(c, v));
          var he = x.toString(16);
          re.target.postMessage({
            hex: he,
            workLoad: I
          }), x.dAddOffset(b, 0);
        }
      }
    }
  }
  function u(c, v) {
    var m = new t(c, v), y = c - 1;
    return m.testBit(y) || m.bitwiseTo(t.ONE.shiftLeft(y), n, m), m.dAddOffset(31 - m.mod(r).byteValue(), 0), m;
  }
  function f(c) {
    return c <= 100 ? 27 : c <= 150 ? 18 : c <= 200 ? 15 : c <= 250 ? 12 : c <= 300 ? 9 : c <= 350 ? 8 : c <= 400 ? 7 : c <= 500 ? 6 : c <= 600 ? 5 : c <= 800 ? 4 : c <= 1250 ? 3 : 2;
  }
})();
var M = z;
if (typeof ee > "u")
  var ee = M.jsbn.BigInteger;
var na = M.util.isNodejs ? va : null, T = M.asn1, Je = M.util;
M.pki = M.pki || {};
M.pki.rsa = M.rsa = M.rsa || {};
var q = M.pki, wo = [6, 4, 2, 4, 2, 4, 6, 2], Lo = {
  // PrivateKeyInfo
  name: "PrivateKeyInfo",
  tagClass: T.Class.UNIVERSAL,
  type: T.Type.SEQUENCE,
  constructed: !0,
  value: [{
    // Version (INTEGER)
    name: "PrivateKeyInfo.version",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.INTEGER,
    constructed: !1,
    capture: "privateKeyVersion"
  }, {
    // privateKeyAlgorithm
    name: "PrivateKeyInfo.privateKeyAlgorithm",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.SEQUENCE,
    constructed: !0,
    value: [{
      name: "AlgorithmIdentifier.algorithm",
      tagClass: T.Class.UNIVERSAL,
      type: T.Type.OID,
      constructed: !1,
      capture: "privateKeyOid"
    }]
  }, {
    // PrivateKey
    name: "PrivateKeyInfo",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.OCTETSTRING,
    constructed: !1,
    capture: "privateKey"
  }]
}, ko = {
  // RSAPrivateKey
  name: "RSAPrivateKey",
  tagClass: T.Class.UNIVERSAL,
  type: T.Type.SEQUENCE,
  constructed: !0,
  value: [{
    // Version (INTEGER)
    name: "RSAPrivateKey.version",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.INTEGER,
    constructed: !1,
    capture: "privateKeyVersion"
  }, {
    // modulus (n)
    name: "RSAPrivateKey.modulus",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.INTEGER,
    constructed: !1,
    capture: "privateKeyModulus"
  }, {
    // publicExponent (e)
    name: "RSAPrivateKey.publicExponent",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.INTEGER,
    constructed: !1,
    capture: "privateKeyPublicExponent"
  }, {
    // privateExponent (d)
    name: "RSAPrivateKey.privateExponent",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.INTEGER,
    constructed: !1,
    capture: "privateKeyPrivateExponent"
  }, {
    // prime1 (p)
    name: "RSAPrivateKey.prime1",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.INTEGER,
    constructed: !1,
    capture: "privateKeyPrime1"
  }, {
    // prime2 (q)
    name: "RSAPrivateKey.prime2",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.INTEGER,
    constructed: !1,
    capture: "privateKeyPrime2"
  }, {
    // exponent1 (d mod (p-1))
    name: "RSAPrivateKey.exponent1",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.INTEGER,
    constructed: !1,
    capture: "privateKeyExponent1"
  }, {
    // exponent2 (d mod (q-1))
    name: "RSAPrivateKey.exponent2",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.INTEGER,
    constructed: !1,
    capture: "privateKeyExponent2"
  }, {
    // coefficient ((inverse of q) mod p)
    name: "RSAPrivateKey.coefficient",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.INTEGER,
    constructed: !1,
    capture: "privateKeyCoefficient"
  }]
}, Do = {
  // RSAPublicKey
  name: "RSAPublicKey",
  tagClass: T.Class.UNIVERSAL,
  type: T.Type.SEQUENCE,
  constructed: !0,
  value: [{
    // modulus (n)
    name: "RSAPublicKey.modulus",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.INTEGER,
    constructed: !1,
    capture: "publicKeyModulus"
  }, {
    // publicExponent (e)
    name: "RSAPublicKey.exponent",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.INTEGER,
    constructed: !1,
    capture: "publicKeyExponent"
  }]
}, Uo = M.pki.rsa.publicKeyValidator = {
  name: "SubjectPublicKeyInfo",
  tagClass: T.Class.UNIVERSAL,
  type: T.Type.SEQUENCE,
  constructed: !0,
  captureAsn1: "subjectPublicKeyInfo",
  value: [{
    name: "SubjectPublicKeyInfo.AlgorithmIdentifier",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.SEQUENCE,
    constructed: !0,
    value: [{
      name: "AlgorithmIdentifier.algorithm",
      tagClass: T.Class.UNIVERSAL,
      type: T.Type.OID,
      constructed: !1,
      capture: "publicKeyOid"
    }]
  }, {
    // subjectPublicKey
    name: "SubjectPublicKeyInfo.subjectPublicKey",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.BITSTRING,
    constructed: !1,
    value: [{
      // RSAPublicKey
      name: "SubjectPublicKeyInfo.subjectPublicKey.RSAPublicKey",
      tagClass: T.Class.UNIVERSAL,
      type: T.Type.SEQUENCE,
      constructed: !0,
      optional: !0,
      captureAsn1: "rsaPublicKey"
    }]
  }]
}, Po = {
  name: "DigestInfo",
  tagClass: T.Class.UNIVERSAL,
  type: T.Type.SEQUENCE,
  constructed: !0,
  value: [{
    name: "DigestInfo.DigestAlgorithm",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.SEQUENCE,
    constructed: !0,
    value: [{
      name: "DigestInfo.DigestAlgorithm.algorithmIdentifier",
      tagClass: T.Class.UNIVERSAL,
      type: T.Type.OID,
      constructed: !1,
      capture: "algorithmIdentifier"
    }, {
      // NULL parameters
      name: "DigestInfo.DigestAlgorithm.parameters",
      tagClass: T.Class.UNIVERSAL,
      type: T.Type.NULL,
      // captured only to check existence for md2 and md5
      capture: "parameters",
      optional: !0,
      constructed: !1
    }]
  }, {
    // digest
    name: "DigestInfo.digest",
    tagClass: T.Class.UNIVERSAL,
    type: T.Type.OCTETSTRING,
    constructed: !1,
    capture: "digest"
  }]
}, Vo = function(e) {
  var t;
  if (e.algorithm in q.oids)
    t = q.oids[e.algorithm];
  else {
    var a = new Error("Unknown message digest algorithm.");
    throw a.algorithm = e.algorithm, a;
  }
  var r = T.oidToDer(t).getBytes(), n = T.create(
    T.Class.UNIVERSAL,
    T.Type.SEQUENCE,
    !0,
    []
  ), s = T.create(
    T.Class.UNIVERSAL,
    T.Type.SEQUENCE,
    !0,
    []
  );
  s.value.push(T.create(
    T.Class.UNIVERSAL,
    T.Type.OID,
    !1,
    r
  )), s.value.push(T.create(
    T.Class.UNIVERSAL,
    T.Type.NULL,
    !1,
    ""
  ));
  var i = T.create(
    T.Class.UNIVERSAL,
    T.Type.OCTETSTRING,
    !1,
    e.digest().getBytes()
  );
  return n.value.push(s), n.value.push(i), T.toDer(n).getBytes();
}, wn = function(e, t, a) {
  if (a)
    return e.modPow(t.e, t.n);
  if (!t.p || !t.q)
    return e.modPow(t.d, t.n);
  t.dP || (t.dP = t.d.mod(t.p.subtract(ee.ONE))), t.dQ || (t.dQ = t.d.mod(t.q.subtract(ee.ONE))), t.qInv || (t.qInv = t.q.modInverse(t.p));
  var r;
  do
    r = new ee(
      M.util.bytesToHex(M.random.getBytes(t.n.bitLength() / 8)),
      16
    );
  while (r.compareTo(t.n) >= 0 || !r.gcd(t.n).equals(ee.ONE));
  e = e.multiply(r.modPow(t.e, t.n)).mod(t.n);
  for (var n = e.mod(t.p).modPow(t.dP, t.p), s = e.mod(t.q).modPow(t.dQ, t.q); n.compareTo(s) < 0; )
    n = n.add(t.p);
  var i = n.subtract(s).multiply(t.qInv).mod(t.p).multiply(t.q).add(s);
  return i = i.multiply(r.modInverse(t.n)).mod(t.n), i;
};
q.rsa.encrypt = function(e, t, a) {
  var r = a, n, s = Math.ceil(t.n.bitLength() / 8);
  a !== !1 && a !== !0 ? (r = a === 2, n = Ln(e, t, a)) : (n = M.util.createBuffer(), n.putBytes(e));
  for (var i = new ee(n.toHex(), 16), o = wn(i, t, r), l = o.toString(16), u = M.util.createBuffer(), f = s - Math.ceil(l.length / 2); f > 0; )
    u.putByte(0), --f;
  return u.putBytes(M.util.hexToBytes(l)), u.getBytes();
};
q.rsa.decrypt = function(e, t, a, r) {
  var n = Math.ceil(t.n.bitLength() / 8);
  if (e.length !== n) {
    var s = new Error("Encrypted message length is invalid.");
    throw s.length = e.length, s.expected = n, s;
  }
  var i = new ee(M.util.createBuffer(e).toHex(), 16);
  if (i.compareTo(t.n) >= 0)
    throw new Error("Encrypted message is invalid.");
  for (var o = wn(i, t, a), l = o.toString(16), u = M.util.createBuffer(), f = n - Math.ceil(l.length / 2); f > 0; )
    u.putByte(0), --f;
  return u.putBytes(M.util.hexToBytes(l)), r !== !1 ? Br(u.getBytes(), t, a) : u.getBytes();
};
q.rsa.createKeyPairGenerationState = function(e, t, a) {
  typeof e == "string" && (e = parseInt(e, 10)), e = e || 2048, a = a || {};
  var r = a.prng || M.random, n = {
    // x is an array to fill with bytes
    nextBytes: function(o) {
      for (var l = r.getBytesSync(o.length), u = 0; u < o.length; ++u)
        o[u] = l.charCodeAt(u);
    }
  }, s = a.algorithm || "PRIMEINC", i;
  if (s === "PRIMEINC")
    i = {
      algorithm: s,
      state: 0,
      bits: e,
      rng: n,
      eInt: t || 65537,
      e: new ee(null),
      p: null,
      q: null,
      qBits: e >> 1,
      pBits: e - (e >> 1),
      pqState: 0,
      num: null,
      keys: null
    }, i.e.fromInt(i.eInt);
  else
    throw new Error("Invalid key generation algorithm: " + s);
  return i;
};
q.rsa.stepKeyPairGenerationState = function(e, t) {
  "algorithm" in e || (e.algorithm = "PRIMEINC");
  var a = new ee(null);
  a.fromInt(30);
  for (var r = 0, n = function(c, v) {
    return c | v;
  }, s = +/* @__PURE__ */ new Date(), i, o = 0; e.keys === null && (t <= 0 || o < t); ) {
    if (e.state === 0) {
      var l = e.p === null ? e.pBits : e.qBits, u = l - 1;
      e.pqState === 0 ? (e.num = new ee(l, e.rng), e.num.testBit(u) || e.num.bitwiseTo(
        ee.ONE.shiftLeft(u),
        n,
        e.num
      ), e.num.dAddOffset(31 - e.num.mod(a).byteValue(), 0), r = 0, ++e.pqState) : e.pqState === 1 ? e.num.bitLength() > l ? e.pqState = 0 : e.num.isProbablePrime(
        Fo(e.num.bitLength())
      ) ? ++e.pqState : e.num.dAddOffset(wo[r++ % 8], 0) : e.pqState === 2 ? e.pqState = e.num.subtract(ee.ONE).gcd(e.e).compareTo(ee.ONE) === 0 ? 3 : 0 : e.pqState === 3 && (e.pqState = 0, e.p === null ? e.p = e.num : e.q = e.num, e.p !== null && e.q !== null && ++e.state, e.num = null);
    } else if (e.state === 1)
      e.p.compareTo(e.q) < 0 && (e.num = e.p, e.p = e.q, e.q = e.num), ++e.state;
    else if (e.state === 2)
      e.p1 = e.p.subtract(ee.ONE), e.q1 = e.q.subtract(ee.ONE), e.phi = e.p1.multiply(e.q1), ++e.state;
    else if (e.state === 3)
      e.phi.gcd(e.e).compareTo(ee.ONE) === 0 ? ++e.state : (e.p = null, e.q = null, e.state = 0);
    else if (e.state === 4)
      e.n = e.p.multiply(e.q), e.n.bitLength() === e.bits ? ++e.state : (e.q = null, e.state = 0);
    else if (e.state === 5) {
      var f = e.e.modInverse(e.phi);
      e.keys = {
        privateKey: q.rsa.setPrivateKey(
          e.n,
          e.e,
          f,
          e.p,
          e.q,
          f.mod(e.p1),
          f.mod(e.q1),
          e.q.modInverse(e.p)
        ),
        publicKey: q.rsa.setPublicKey(e.n, e.e)
      };
    }
    i = +/* @__PURE__ */ new Date(), o += i - s, s = i;
  }
  return e.keys !== null;
};
q.rsa.generateKeyPair = function(e, t, a, r) {
  if (arguments.length === 1 ? typeof e == "object" ? (a = e, e = void 0) : typeof e == "function" && (r = e, e = void 0) : arguments.length === 2 ? typeof e == "number" ? typeof t == "function" ? (r = t, t = void 0) : typeof t != "number" && (a = t, t = void 0) : (a = e, r = t, e = void 0, t = void 0) : arguments.length === 3 && (typeof t == "number" ? typeof a == "function" && (r = a, a = void 0) : (r = a, a = t, t = void 0)), a = a || {}, e === void 0 && (e = a.bits || 2048), t === void 0 && (t = a.e || 65537), !a.prng && e >= 256 && e <= 16384 && (t === 65537 || t === 3)) {
    if (r) {
      if (Ya("generateKeyPair"))
        return na.generateKeyPair("rsa", {
          modulusLength: e,
          publicExponent: t,
          publicKeyEncoding: {
            type: "spki",
            format: "pem"
          },
          privateKeyEncoding: {
            type: "pkcs8",
            format: "pem"
          }
        }, function(o, l, u) {
          if (o)
            return r(o);
          r(null, {
            privateKey: q.privateKeyFromPem(u),
            publicKey: q.publicKeyFromPem(l)
          });
        });
      if ($a("generateKey") && $a("exportKey"))
        return Je.globalScope.crypto.subtle.generateKey({
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: e,
          publicExponent: Xa(t),
          hash: { name: "SHA-256" }
        }, !0, ["sign", "verify"]).then(function(o) {
          return Je.globalScope.crypto.subtle.exportKey(
            "pkcs8",
            o.privateKey
          );
        }).then(void 0, function(o) {
          r(o);
        }).then(function(o) {
          if (o) {
            var l = q.privateKeyFromAsn1(
              T.fromDer(M.util.createBuffer(o))
            );
            r(null, {
              privateKey: l,
              publicKey: q.setRsaPublicKey(l.n, l.e)
            });
          }
        });
      if (Wa("generateKey") && Wa("exportKey")) {
        var n = Je.globalScope.msCrypto.subtle.generateKey({
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: e,
          publicExponent: Xa(t),
          hash: { name: "SHA-256" }
        }, !0, ["sign", "verify"]);
        n.oncomplete = function(o) {
          var l = o.target.result, u = Je.globalScope.msCrypto.subtle.exportKey(
            "pkcs8",
            l.privateKey
          );
          u.oncomplete = function(f) {
            var c = f.target.result, v = q.privateKeyFromAsn1(
              T.fromDer(M.util.createBuffer(c))
            );
            r(null, {
              privateKey: v,
              publicKey: q.setRsaPublicKey(v.n, v.e)
            });
          }, u.onerror = function(f) {
            r(f);
          };
        }, n.onerror = function(o) {
          r(o);
        };
        return;
      }
    } else if (Ya("generateKeyPairSync")) {
      var s = na.generateKeyPairSync("rsa", {
        modulusLength: e,
        publicExponent: t,
        publicKeyEncoding: {
          type: "spki",
          format: "pem"
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem"
        }
      });
      return {
        privateKey: q.privateKeyFromPem(s.privateKey),
        publicKey: q.publicKeyFromPem(s.publicKey)
      };
    }
  }
  var i = q.rsa.createKeyPairGenerationState(e, t, a);
  if (!r)
    return q.rsa.stepKeyPairGenerationState(i, 0), i.keys;
  Oo(i, a, r);
};
q.setRsaPublicKey = q.rsa.setPublicKey = function(e, t) {
  var a = {
    n: e,
    e: t
  };
  return a.encrypt = function(r, n, s) {
    if (typeof n == "string" ? n = n.toUpperCase() : n === void 0 && (n = "RSAES-PKCS1-V1_5"), n === "RSAES-PKCS1-V1_5")
      n = {
        encode: function(o, l, u) {
          return Ln(o, l, 2).getBytes();
        }
      };
    else if (n === "RSA-OAEP" || n === "RSAES-OAEP")
      n = {
        encode: function(o, l) {
          return M.pkcs1.encode_rsa_oaep(l, o, s);
        }
      };
    else if (["RAW", "NONE", "NULL", null].indexOf(n) !== -1)
      n = { encode: function(o) {
        return o;
      } };
    else if (typeof n == "string")
      throw new Error('Unsupported encryption scheme: "' + n + '".');
    var i = n.encode(r, a, !0);
    return q.rsa.encrypt(i, a, !0);
  }, a.verify = function(r, n, s, i) {
    typeof s == "string" ? s = s.toUpperCase() : s === void 0 && (s = "RSASSA-PKCS1-V1_5"), i === void 0 && (i = {
      _parseAllDigestBytes: !0,
      _skipPaddingChecks: !1
    }), "_parseAllDigestBytes" in i || (i._parseAllDigestBytes = !0), "_skipPaddingChecks" in i || (i._skipPaddingChecks = !1), s === "RSASSA-PKCS1-V1_5" ? s = {
      verify: function(l, u) {
        u = Br(u, a, !0, void 0, i);
        var f = T.fromDer(u, {
          parseAllBytes: i._parseAllDigestBytes
        }), c = {}, v = [];
        if (!T.validate(f, Po, c, v) || f.value.length !== 2) {
          var m = new Error(
            "ASN.1 object does not contain a valid RSASSA-PKCS1-v1_5 DigestInfo value."
          );
          throw m.errors = v, m;
        }
        var y = T.derToOid(c.algorithmIdentifier);
        if (!(y === M.oids.md2 || y === M.oids.md5 || y === M.oids.sha1 || y === M.oids.sha224 || y === M.oids.sha256 || y === M.oids.sha384 || y === M.oids.sha512 || y === M.oids["sha512-224"] || y === M.oids["sha512-256"])) {
          var m = new Error(
            "Unknown RSASSA-PKCS1-v1_5 DigestAlgorithm identifier."
          );
          throw m.oid = y, m;
        }
        if ((y === M.oids.md2 || y === M.oids.md5) && !("parameters" in c))
          throw new Error(
            "ASN.1 object does not contain a valid RSASSA-PKCS1-v1_5 DigestInfo value. Missing algorithm identifier NULL parameters."
          );
        return l === c.digest;
      }
    } : (s === "NONE" || s === "NULL" || s === null) && (s = {
      verify: function(l, u) {
        return u = Br(u, a, !0, void 0, i), l === u;
      }
    });
    var o = q.rsa.decrypt(n, a, !0, !1);
    return s.verify(r, o, a.n.bitLength());
  }, a;
};
q.setRsaPrivateKey = q.rsa.setPrivateKey = function(e, t, a, r, n, s, i, o) {
  var l = {
    n: e,
    e: t,
    d: a,
    p: r,
    q: n,
    dP: s,
    dQ: i,
    qInv: o
  };
  return l.decrypt = function(u, f, c) {
    typeof f == "string" ? f = f.toUpperCase() : f === void 0 && (f = "RSAES-PKCS1-V1_5");
    var v = q.rsa.decrypt(u, l, !1, !1);
    if (f === "RSAES-PKCS1-V1_5")
      f = { decode: Br };
    else if (f === "RSA-OAEP" || f === "RSAES-OAEP")
      f = {
        decode: function(m, y) {
          return M.pkcs1.decode_rsa_oaep(y, m, c);
        }
      };
    else if (["RAW", "NONE", "NULL", null].indexOf(f) !== -1)
      f = { decode: function(m) {
        return m;
      } };
    else
      throw new Error('Unsupported encryption scheme: "' + f + '".');
    return f.decode(v, l, !1);
  }, l.sign = function(u, f) {
    var c = !1;
    typeof f == "string" && (f = f.toUpperCase()), f === void 0 || f === "RSASSA-PKCS1-V1_5" ? (f = { encode: Vo }, c = 1) : (f === "NONE" || f === "NULL" || f === null) && (f = { encode: function() {
      return u;
    } }, c = 1);
    var v = f.encode(u, l.n.bitLength());
    return q.rsa.encrypt(v, l, c);
  }, l;
};
q.wrapRsaPrivateKey = function(e) {
  return T.create(T.Class.UNIVERSAL, T.Type.SEQUENCE, !0, [
    // version (0)
    T.create(
      T.Class.UNIVERSAL,
      T.Type.INTEGER,
      !1,
      T.integerToDer(0).getBytes()
    ),
    // privateKeyAlgorithm
    T.create(T.Class.UNIVERSAL, T.Type.SEQUENCE, !0, [
      T.create(
        T.Class.UNIVERSAL,
        T.Type.OID,
        !1,
        T.oidToDer(q.oids.rsaEncryption).getBytes()
      ),
      T.create(T.Class.UNIVERSAL, T.Type.NULL, !1, "")
    ]),
    // PrivateKey
    T.create(
      T.Class.UNIVERSAL,
      T.Type.OCTETSTRING,
      !1,
      T.toDer(e).getBytes()
    )
  ]);
};
q.privateKeyFromAsn1 = function(e) {
  var t = {}, a = [];
  if (T.validate(e, Lo, t, a) && (e = T.fromDer(M.util.createBuffer(t.privateKey))), t = {}, a = [], !T.validate(e, ko, t, a)) {
    var r = new Error("Cannot read private key. ASN.1 object does not contain an RSAPrivateKey.");
    throw r.errors = a, r;
  }
  var n, s, i, o, l, u, f, c;
  return n = M.util.createBuffer(t.privateKeyModulus).toHex(), s = M.util.createBuffer(t.privateKeyPublicExponent).toHex(), i = M.util.createBuffer(t.privateKeyPrivateExponent).toHex(), o = M.util.createBuffer(t.privateKeyPrime1).toHex(), l = M.util.createBuffer(t.privateKeyPrime2).toHex(), u = M.util.createBuffer(t.privateKeyExponent1).toHex(), f = M.util.createBuffer(t.privateKeyExponent2).toHex(), c = M.util.createBuffer(t.privateKeyCoefficient).toHex(), q.setRsaPrivateKey(
    new ee(n, 16),
    new ee(s, 16),
    new ee(i, 16),
    new ee(o, 16),
    new ee(l, 16),
    new ee(u, 16),
    new ee(f, 16),
    new ee(c, 16)
  );
};
q.privateKeyToAsn1 = q.privateKeyToRSAPrivateKey = function(e) {
  return T.create(T.Class.UNIVERSAL, T.Type.SEQUENCE, !0, [
    // version (0 = only 2 primes, 1 multiple primes)
    T.create(
      T.Class.UNIVERSAL,
      T.Type.INTEGER,
      !1,
      T.integerToDer(0).getBytes()
    ),
    // modulus (n)
    T.create(
      T.Class.UNIVERSAL,
      T.Type.INTEGER,
      !1,
      it(e.n)
    ),
    // publicExponent (e)
    T.create(
      T.Class.UNIVERSAL,
      T.Type.INTEGER,
      !1,
      it(e.e)
    ),
    // privateExponent (d)
    T.create(
      T.Class.UNIVERSAL,
      T.Type.INTEGER,
      !1,
      it(e.d)
    ),
    // privateKeyPrime1 (p)
    T.create(
      T.Class.UNIVERSAL,
      T.Type.INTEGER,
      !1,
      it(e.p)
    ),
    // privateKeyPrime2 (q)
    T.create(
      T.Class.UNIVERSAL,
      T.Type.INTEGER,
      !1,
      it(e.q)
    ),
    // privateKeyExponent1 (dP)
    T.create(
      T.Class.UNIVERSAL,
      T.Type.INTEGER,
      !1,
      it(e.dP)
    ),
    // privateKeyExponent2 (dQ)
    T.create(
      T.Class.UNIVERSAL,
      T.Type.INTEGER,
      !1,
      it(e.dQ)
    ),
    // coefficient (qInv)
    T.create(
      T.Class.UNIVERSAL,
      T.Type.INTEGER,
      !1,
      it(e.qInv)
    )
  ]);
};
q.publicKeyFromAsn1 = function(e) {
  var t = {}, a = [];
  if (T.validate(e, Uo, t, a)) {
    var r = T.derToOid(t.publicKeyOid);
    if (r !== q.oids.rsaEncryption) {
      var n = new Error("Cannot read public key. Unknown OID.");
      throw n.oid = r, n;
    }
    e = t.rsaPublicKey;
  }
  if (a = [], !T.validate(e, Do, t, a)) {
    var n = new Error("Cannot read public key. ASN.1 object does not contain an RSAPublicKey.");
    throw n.errors = a, n;
  }
  var s = M.util.createBuffer(t.publicKeyModulus).toHex(), i = M.util.createBuffer(t.publicKeyExponent).toHex();
  return q.setRsaPublicKey(
    new ee(s, 16),
    new ee(i, 16)
  );
};
q.publicKeyToAsn1 = q.publicKeyToSubjectPublicKeyInfo = function(e) {
  return T.create(T.Class.UNIVERSAL, T.Type.SEQUENCE, !0, [
    // AlgorithmIdentifier
    T.create(T.Class.UNIVERSAL, T.Type.SEQUENCE, !0, [
      // algorithm
      T.create(
        T.Class.UNIVERSAL,
        T.Type.OID,
        !1,
        T.oidToDer(q.oids.rsaEncryption).getBytes()
      ),
      // parameters (null)
      T.create(T.Class.UNIVERSAL, T.Type.NULL, !1, "")
    ]),
    // subjectPublicKey
    T.create(T.Class.UNIVERSAL, T.Type.BITSTRING, !1, [
      q.publicKeyToRSAPublicKey(e)
    ])
  ]);
};
q.publicKeyToRSAPublicKey = function(e) {
  return T.create(T.Class.UNIVERSAL, T.Type.SEQUENCE, !0, [
    // modulus (n)
    T.create(
      T.Class.UNIVERSAL,
      T.Type.INTEGER,
      !1,
      it(e.n)
    ),
    // publicExponent (e)
    T.create(
      T.Class.UNIVERSAL,
      T.Type.INTEGER,
      !1,
      it(e.e)
    )
  ]);
};
function Ln(e, t, a) {
  var r = M.util.createBuffer(), n = Math.ceil(t.n.bitLength() / 8);
  if (e.length > n - 11) {
    var s = new Error("Message is too long for PKCS#1 v1.5 padding.");
    throw s.length = e.length, s.max = n - 11, s;
  }
  r.putByte(0), r.putByte(a);
  var i = n - 3 - e.length, o;
  if (a === 0 || a === 1) {
    o = a === 0 ? 0 : 255;
    for (var l = 0; l < i; ++l)
      r.putByte(o);
  } else
    for (; i > 0; ) {
      for (var u = 0, f = M.random.getBytes(i), l = 0; l < i; ++l)
        o = f.charCodeAt(l), o === 0 ? ++u : r.putByte(o);
      i = u;
    }
  return r.putByte(0), r.putBytes(e), r;
}
function Br(e, t, a, r, n) {
  var s = Math.ceil(t.n.bitLength() / 8), i = M.util.createBuffer(e), o = i.getByte(), l = i.getByte();
  if (o !== 0 || a && l !== 0 && l !== 1 || !a && l !== 2 || a && l === 0 && typeof r > "u")
    throw new Error("Encryption block is invalid.");
  var u = 0;
  if (l === 0) {
    u = s - 3 - r;
    for (var f = 0; f < u; ++f)
      if (i.getByte() !== 0)
        throw new Error("Encryption block is invalid.");
  } else if (l === 1) {
    for (u = 0; i.length() > 1; ) {
      if (i.getByte() !== 255) {
        --i.read;
        break;
      }
      ++u;
    }
    if (u < 8 && !(n && n._skipPaddingChecks))
      throw new Error("Encryption block is invalid.");
  } else if (l === 2) {
    for (u = 0; i.length() > 1; ) {
      if (i.getByte() === 0) {
        --i.read;
        break;
      }
      ++u;
    }
    if (u < 8 && !(n && n._skipPaddingChecks))
      throw new Error("Encryption block is invalid.");
  }
  var c = i.getByte();
  if (c !== 0 || u !== s - 3 - i.length())
    throw new Error("Encryption block is invalid.");
  return i.getBytes();
}
function Oo(e, t, a) {
  typeof t == "function" && (a = t, t = {}), t = t || {};
  var r = {
    algorithm: {
      name: t.algorithm || "PRIMEINC",
      options: {
        workers: t.workers || 2,
        workLoad: t.workLoad || 100,
        workerScript: t.workerScript
      }
    }
  };
  "prng" in t && (r.prng = t.prng), n();
  function n() {
    s(e.pBits, function(o, l) {
      if (o)
        return a(o);
      if (e.p = l, e.q !== null)
        return i(o, e.q);
      s(e.qBits, i);
    });
  }
  function s(o, l) {
    M.prime.generateProbablePrime(o, r, l);
  }
  function i(o, l) {
    if (o)
      return a(o);
    if (e.q = l, e.p.compareTo(e.q) < 0) {
      var u = e.p;
      e.p = e.q, e.q = u;
    }
    if (e.p.subtract(ee.ONE).gcd(e.e).compareTo(ee.ONE) !== 0) {
      e.p = null, n();
      return;
    }
    if (e.q.subtract(ee.ONE).gcd(e.e).compareTo(ee.ONE) !== 0) {
      e.q = null, s(e.qBits, i);
      return;
    }
    if (e.p1 = e.p.subtract(ee.ONE), e.q1 = e.q.subtract(ee.ONE), e.phi = e.p1.multiply(e.q1), e.phi.gcd(e.e).compareTo(ee.ONE) !== 0) {
      e.p = e.q = null, n();
      return;
    }
    if (e.n = e.p.multiply(e.q), e.n.bitLength() !== e.bits) {
      e.q = null, s(e.qBits, i);
      return;
    }
    var f = e.e.modInverse(e.phi);
    e.keys = {
      privateKey: q.rsa.setPrivateKey(
        e.n,
        e.e,
        f,
        e.p,
        e.q,
        f.mod(e.p1),
        f.mod(e.q1),
        e.q.modInverse(e.p)
      ),
      publicKey: q.rsa.setPublicKey(e.n, e.e)
    }, a(null, e.keys);
  }
}
function it(e) {
  var t = e.toString(16);
  t[0] >= "8" && (t = "00" + t);
  var a = M.util.hexToBytes(t);
  return a.length > 1 && // leading 0x00 for positive integer
  (a.charCodeAt(0) === 0 && !(a.charCodeAt(1) & 128) || // leading 0xFF for negative integer
  a.charCodeAt(0) === 255 && (a.charCodeAt(1) & 128) === 128) ? a.substr(1) : a;
}
function Fo(e) {
  return e <= 100 ? 27 : e <= 150 ? 18 : e <= 200 ? 15 : e <= 250 ? 12 : e <= 300 ? 9 : e <= 350 ? 8 : e <= 400 ? 7 : e <= 500 ? 6 : e <= 600 ? 5 : e <= 800 ? 4 : e <= 1250 ? 3 : 2;
}
function Ya(e) {
  return M.util.isNodejs && typeof na[e] == "function";
}
function $a(e) {
  return typeof Je.globalScope < "u" && typeof Je.globalScope.crypto == "object" && typeof Je.globalScope.crypto.subtle == "object" && typeof Je.globalScope.crypto.subtle[e] == "function";
}
function Wa(e) {
  return typeof Je.globalScope < "u" && typeof Je.globalScope.msCrypto == "object" && typeof Je.globalScope.msCrypto.subtle == "object" && typeof Je.globalScope.msCrypto.subtle[e] == "function";
}
function Xa(e) {
  for (var t = M.util.hexToBytes(e.toString(16)), a = new Uint8Array(t.length), r = 0; r < t.length; ++r)
    a[r] = t.charCodeAt(r);
  return a;
}
var O = z;
if (typeof Ko > "u")
  var Ko = O.jsbn.BigInteger;
var A = O.asn1, Q = O.pki = O.pki || {};
Q.pbe = O.pbe = O.pbe || {};
var Lt = Q.oids, Mo = {
  name: "EncryptedPrivateKeyInfo",
  tagClass: A.Class.UNIVERSAL,
  type: A.Type.SEQUENCE,
  constructed: !0,
  value: [{
    name: "EncryptedPrivateKeyInfo.encryptionAlgorithm",
    tagClass: A.Class.UNIVERSAL,
    type: A.Type.SEQUENCE,
    constructed: !0,
    value: [{
      name: "AlgorithmIdentifier.algorithm",
      tagClass: A.Class.UNIVERSAL,
      type: A.Type.OID,
      constructed: !1,
      capture: "encryptionOid"
    }, {
      name: "AlgorithmIdentifier.parameters",
      tagClass: A.Class.UNIVERSAL,
      type: A.Type.SEQUENCE,
      constructed: !0,
      captureAsn1: "encryptionParams"
    }]
  }, {
    // encryptedData
    name: "EncryptedPrivateKeyInfo.encryptedData",
    tagClass: A.Class.UNIVERSAL,
    type: A.Type.OCTETSTRING,
    constructed: !1,
    capture: "encryptedData"
  }]
}, Ho = {
  name: "PBES2Algorithms",
  tagClass: A.Class.UNIVERSAL,
  type: A.Type.SEQUENCE,
  constructed: !0,
  value: [{
    name: "PBES2Algorithms.keyDerivationFunc",
    tagClass: A.Class.UNIVERSAL,
    type: A.Type.SEQUENCE,
    constructed: !0,
    value: [{
      name: "PBES2Algorithms.keyDerivationFunc.oid",
      tagClass: A.Class.UNIVERSAL,
      type: A.Type.OID,
      constructed: !1,
      capture: "kdfOid"
    }, {
      name: "PBES2Algorithms.params",
      tagClass: A.Class.UNIVERSAL,
      type: A.Type.SEQUENCE,
      constructed: !0,
      value: [{
        name: "PBES2Algorithms.params.salt",
        tagClass: A.Class.UNIVERSAL,
        type: A.Type.OCTETSTRING,
        constructed: !1,
        capture: "kdfSalt"
      }, {
        name: "PBES2Algorithms.params.iterationCount",
        tagClass: A.Class.UNIVERSAL,
        type: A.Type.INTEGER,
        constructed: !1,
        capture: "kdfIterationCount"
      }, {
        name: "PBES2Algorithms.params.keyLength",
        tagClass: A.Class.UNIVERSAL,
        type: A.Type.INTEGER,
        constructed: !1,
        optional: !0,
        capture: "keyLength"
      }, {
        // prf
        name: "PBES2Algorithms.params.prf",
        tagClass: A.Class.UNIVERSAL,
        type: A.Type.SEQUENCE,
        constructed: !0,
        optional: !0,
        value: [{
          name: "PBES2Algorithms.params.prf.algorithm",
          tagClass: A.Class.UNIVERSAL,
          type: A.Type.OID,
          constructed: !1,
          capture: "prfOid"
        }]
      }]
    }]
  }, {
    name: "PBES2Algorithms.encryptionScheme",
    tagClass: A.Class.UNIVERSAL,
    type: A.Type.SEQUENCE,
    constructed: !0,
    value: [{
      name: "PBES2Algorithms.encryptionScheme.oid",
      tagClass: A.Class.UNIVERSAL,
      type: A.Type.OID,
      constructed: !1,
      capture: "encOid"
    }, {
      name: "PBES2Algorithms.encryptionScheme.iv",
      tagClass: A.Class.UNIVERSAL,
      type: A.Type.OCTETSTRING,
      constructed: !1,
      capture: "encIv"
    }]
  }]
}, Go = {
  name: "pkcs-12PbeParams",
  tagClass: A.Class.UNIVERSAL,
  type: A.Type.SEQUENCE,
  constructed: !0,
  value: [{
    name: "pkcs-12PbeParams.salt",
    tagClass: A.Class.UNIVERSAL,
    type: A.Type.OCTETSTRING,
    constructed: !1,
    capture: "salt"
  }, {
    name: "pkcs-12PbeParams.iterations",
    tagClass: A.Class.UNIVERSAL,
    type: A.Type.INTEGER,
    constructed: !1,
    capture: "iterations"
  }]
};
Q.encryptPrivateKeyInfo = function(e, t, a) {
  a = a || {}, a.saltSize = a.saltSize || 8, a.count = a.count || 2048, a.algorithm = a.algorithm || "aes128", a.prfAlgorithm = a.prfAlgorithm || "sha1";
  var r = O.random.getBytesSync(a.saltSize), n = a.count, s = A.integerToDer(n), i, o, l;
  if (a.algorithm.indexOf("aes") === 0 || a.algorithm === "des") {
    var u, f, c;
    switch (a.algorithm) {
      case "aes128":
        i = 16, u = 16, f = Lt["aes128-CBC"], c = O.aes.createEncryptionCipher;
        break;
      case "aes192":
        i = 24, u = 16, f = Lt["aes192-CBC"], c = O.aes.createEncryptionCipher;
        break;
      case "aes256":
        i = 32, u = 16, f = Lt["aes256-CBC"], c = O.aes.createEncryptionCipher;
        break;
      case "des":
        i = 8, u = 8, f = Lt.desCBC, c = O.des.createEncryptionCipher;
        break;
      default:
        var v = new Error("Cannot encrypt private key. Unknown encryption algorithm.");
        throw v.algorithm = a.algorithm, v;
    }
    var m = "hmacWith" + a.prfAlgorithm.toUpperCase(), y = Dn(m), x = O.pkcs5.pbkdf2(t, r, n, i, y), S = O.random.getBytesSync(u), I = c(x);
    I.start(S), I.update(A.toDer(e)), I.finish(), l = I.output.getBytes();
    var b = qo(r, s, i, m);
    o = A.create(
      A.Class.UNIVERSAL,
      A.Type.SEQUENCE,
      !0,
      [
        A.create(
          A.Class.UNIVERSAL,
          A.Type.OID,
          !1,
          A.oidToDer(Lt.pkcs5PBES2).getBytes()
        ),
        A.create(A.Class.UNIVERSAL, A.Type.SEQUENCE, !0, [
          // keyDerivationFunc
          A.create(A.Class.UNIVERSAL, A.Type.SEQUENCE, !0, [
            A.create(
              A.Class.UNIVERSAL,
              A.Type.OID,
              !1,
              A.oidToDer(Lt.pkcs5PBKDF2).getBytes()
            ),
            // PBKDF2-params
            b
          ]),
          // encryptionScheme
          A.create(A.Class.UNIVERSAL, A.Type.SEQUENCE, !0, [
            A.create(
              A.Class.UNIVERSAL,
              A.Type.OID,
              !1,
              A.oidToDer(f).getBytes()
            ),
            // iv
            A.create(
              A.Class.UNIVERSAL,
              A.Type.OCTETSTRING,
              !1,
              S
            )
          ])
        ])
      ]
    );
  } else if (a.algorithm === "3des") {
    i = 24;
    var _ = new O.util.ByteBuffer(r), x = Q.pbe.generatePkcs12Key(t, _, 1, n, i), S = Q.pbe.generatePkcs12Key(t, _, 2, n, i), I = O.des.createEncryptionCipher(x);
    I.start(S), I.update(A.toDer(e)), I.finish(), l = I.output.getBytes(), o = A.create(
      A.Class.UNIVERSAL,
      A.Type.SEQUENCE,
      !0,
      [
        A.create(
          A.Class.UNIVERSAL,
          A.Type.OID,
          !1,
          A.oidToDer(Lt["pbeWithSHAAnd3-KeyTripleDES-CBC"]).getBytes()
        ),
        // pkcs-12PbeParams
        A.create(A.Class.UNIVERSAL, A.Type.SEQUENCE, !0, [
          // salt
          A.create(A.Class.UNIVERSAL, A.Type.OCTETSTRING, !1, r),
          // iteration count
          A.create(
            A.Class.UNIVERSAL,
            A.Type.INTEGER,
            !1,
            s.getBytes()
          )
        ])
      ]
    );
  } else {
    var v = new Error("Cannot encrypt private key. Unknown encryption algorithm.");
    throw v.algorithm = a.algorithm, v;
  }
  var V = A.create(A.Class.UNIVERSAL, A.Type.SEQUENCE, !0, [
    // encryptionAlgorithm
    o,
    // encryptedData
    A.create(
      A.Class.UNIVERSAL,
      A.Type.OCTETSTRING,
      !1,
      l
    )
  ]);
  return V;
};
Q.decryptPrivateKeyInfo = function(e, t) {
  var a = null, r = {}, n = [];
  if (!A.validate(e, Mo, r, n)) {
    var s = new Error("Cannot read encrypted private key. ASN.1 object is not a supported EncryptedPrivateKeyInfo.");
    throw s.errors = n, s;
  }
  var i = A.derToOid(r.encryptionOid), o = Q.pbe.getCipher(i, r.encryptionParams, t), l = O.util.createBuffer(r.encryptedData);
  return o.update(l), o.finish() && (a = A.fromDer(o.output)), a;
};
Q.encryptedPrivateKeyToPem = function(e, t) {
  var a = {
    type: "ENCRYPTED PRIVATE KEY",
    body: A.toDer(e).getBytes()
  };
  return O.pem.encode(a, { maxline: t });
};
Q.encryptedPrivateKeyFromPem = function(e) {
  var t = O.pem.decode(e)[0];
  if (t.type !== "ENCRYPTED PRIVATE KEY") {
    var a = new Error('Could not convert encrypted private key from PEM; PEM header type is "ENCRYPTED PRIVATE KEY".');
    throw a.headerType = t.type, a;
  }
  if (t.procType && t.procType.type === "ENCRYPTED")
    throw new Error("Could not convert encrypted private key from PEM; PEM is encrypted.");
  return A.fromDer(t.body);
};
Q.encryptRsaPrivateKey = function(e, t, a) {
  if (a = a || {}, !a.legacy) {
    var r = Q.wrapRsaPrivateKey(Q.privateKeyToAsn1(e));
    return r = Q.encryptPrivateKeyInfo(r, t, a), Q.encryptedPrivateKeyToPem(r);
  }
  var n, s, i, o;
  switch (a.algorithm) {
    case "aes128":
      n = "AES-128-CBC", i = 16, s = O.random.getBytesSync(16), o = O.aes.createEncryptionCipher;
      break;
    case "aes192":
      n = "AES-192-CBC", i = 24, s = O.random.getBytesSync(16), o = O.aes.createEncryptionCipher;
      break;
    case "aes256":
      n = "AES-256-CBC", i = 32, s = O.random.getBytesSync(16), o = O.aes.createEncryptionCipher;
      break;
    case "3des":
      n = "DES-EDE3-CBC", i = 24, s = O.random.getBytesSync(8), o = O.des.createEncryptionCipher;
      break;
    case "des":
      n = "DES-CBC", i = 8, s = O.random.getBytesSync(8), o = O.des.createEncryptionCipher;
      break;
    default:
      var l = new Error('Could not encrypt RSA private key; unsupported encryption algorithm "' + a.algorithm + '".');
      throw l.algorithm = a.algorithm, l;
  }
  var u = O.pbe.opensslDeriveBytes(t, s.substr(0, 8), i), f = o(u);
  f.start(s), f.update(A.toDer(Q.privateKeyToAsn1(e))), f.finish();
  var c = {
    type: "RSA PRIVATE KEY",
    procType: {
      version: "4",
      type: "ENCRYPTED"
    },
    dekInfo: {
      algorithm: n,
      parameters: O.util.bytesToHex(s).toUpperCase()
    },
    body: f.output.getBytes()
  };
  return O.pem.encode(c);
};
Q.decryptRsaPrivateKey = function(e, t) {
  var a = null, r = O.pem.decode(e)[0];
  if (r.type !== "ENCRYPTED PRIVATE KEY" && r.type !== "PRIVATE KEY" && r.type !== "RSA PRIVATE KEY") {
    var n = new Error('Could not convert private key from PEM; PEM header type is not "ENCRYPTED PRIVATE KEY", "PRIVATE KEY", or "RSA PRIVATE KEY".');
    throw n.headerType = n, n;
  }
  if (r.procType && r.procType.type === "ENCRYPTED") {
    var s, i;
    switch (r.dekInfo.algorithm) {
      case "DES-CBC":
        s = 8, i = O.des.createDecryptionCipher;
        break;
      case "DES-EDE3-CBC":
        s = 24, i = O.des.createDecryptionCipher;
        break;
      case "AES-128-CBC":
        s = 16, i = O.aes.createDecryptionCipher;
        break;
      case "AES-192-CBC":
        s = 24, i = O.aes.createDecryptionCipher;
        break;
      case "AES-256-CBC":
        s = 32, i = O.aes.createDecryptionCipher;
        break;
      case "RC2-40-CBC":
        s = 5, i = function(c) {
          return O.rc2.createDecryptionCipher(c, 40);
        };
        break;
      case "RC2-64-CBC":
        s = 8, i = function(c) {
          return O.rc2.createDecryptionCipher(c, 64);
        };
        break;
      case "RC2-128-CBC":
        s = 16, i = function(c) {
          return O.rc2.createDecryptionCipher(c, 128);
        };
        break;
      default:
        var n = new Error('Could not decrypt private key; unsupported encryption algorithm "' + r.dekInfo.algorithm + '".');
        throw n.algorithm = r.dekInfo.algorithm, n;
    }
    var o = O.util.hexToBytes(r.dekInfo.parameters), l = O.pbe.opensslDeriveBytes(t, o.substr(0, 8), s), u = i(l);
    if (u.start(o), u.update(O.util.createBuffer(r.body)), u.finish())
      a = u.output.getBytes();
    else
      return a;
  } else
    a = r.body;
  return r.type === "ENCRYPTED PRIVATE KEY" ? a = Q.decryptPrivateKeyInfo(A.fromDer(a), t) : a = A.fromDer(a), a !== null && (a = Q.privateKeyFromAsn1(a)), a;
};
Q.pbe.generatePkcs12Key = function(e, t, a, r, n, s) {
  var i, o;
  if (typeof s > "u" || s === null) {
    if (!("sha1" in O.md))
      throw new Error('"sha1" hash algorithm unavailable.');
    s = O.md.sha1.create();
  }
  var l = s.digestLength, u = s.blockLength, f = new O.util.ByteBuffer(), c = new O.util.ByteBuffer();
  if (e != null) {
    for (o = 0; o < e.length; o++)
      c.putInt16(e.charCodeAt(o));
    c.putInt16(0);
  }
  var v = c.length(), m = t.length(), y = new O.util.ByteBuffer();
  y.fillWithByte(a, u);
  var x = u * Math.ceil(m / u), S = new O.util.ByteBuffer();
  for (o = 0; o < x; o++)
    S.putByte(t.at(o % m));
  var I = u * Math.ceil(v / u), b = new O.util.ByteBuffer();
  for (o = 0; o < I; o++)
    b.putByte(c.at(o % v));
  var _ = S;
  _.putBuffer(b);
  for (var V = Math.ceil(n / l), k = 1; k <= V; k++) {
    var w = new O.util.ByteBuffer();
    w.putBytes(y.bytes()), w.putBytes(_.bytes());
    for (var G = 0; G < r; G++)
      s.start(), s.update(w.getBytes()), w = s.digest();
    var Y = new O.util.ByteBuffer();
    for (o = 0; o < u; o++)
      Y.putByte(w.at(o % l));
    var re = Math.ceil(m / u) + Math.ceil(v / u), ae = new O.util.ByteBuffer();
    for (i = 0; i < re; i++) {
      var ne = new O.util.ByteBuffer(_.getBytes(u)), he = 511;
      for (o = Y.length() - 1; o >= 0; o--)
        he = he >> 8, he += Y.at(o) + ne.at(o), ne.setAt(o, he & 255);
      ae.putBuffer(ne);
    }
    _ = ae, f.putBuffer(w);
  }
  return f.truncate(f.length() - n), f;
};
Q.pbe.getCipher = function(e, t, a) {
  switch (e) {
    case Q.oids.pkcs5PBES2:
      return Q.pbe.getCipherForPBES2(e, t, a);
    case Q.oids["pbeWithSHAAnd3-KeyTripleDES-CBC"]:
    case Q.oids["pbewithSHAAnd40BitRC2-CBC"]:
      return Q.pbe.getCipherForPKCS12PBE(e, t, a);
    default:
      var r = new Error("Cannot read encrypted PBE data block. Unsupported OID.");
      throw r.oid = e, r.supportedOids = [
        "pkcs5PBES2",
        "pbeWithSHAAnd3-KeyTripleDES-CBC",
        "pbewithSHAAnd40BitRC2-CBC"
      ], r;
  }
};
Q.pbe.getCipherForPBES2 = function(e, t, a) {
  var r = {}, n = [];
  if (!A.validate(t, Ho, r, n)) {
    var s = new Error("Cannot read password-based-encryption algorithm parameters. ASN.1 object is not a supported EncryptedPrivateKeyInfo.");
    throw s.errors = n, s;
  }
  if (e = A.derToOid(r.kdfOid), e !== Q.oids.pkcs5PBKDF2) {
    var s = new Error("Cannot read encrypted private key. Unsupported key derivation function OID.");
    throw s.oid = e, s.supportedOids = ["pkcs5PBKDF2"], s;
  }
  if (e = A.derToOid(r.encOid), e !== Q.oids["aes128-CBC"] && e !== Q.oids["aes192-CBC"] && e !== Q.oids["aes256-CBC"] && e !== Q.oids["des-EDE3-CBC"] && e !== Q.oids.desCBC) {
    var s = new Error("Cannot read encrypted private key. Unsupported encryption scheme OID.");
    throw s.oid = e, s.supportedOids = [
      "aes128-CBC",
      "aes192-CBC",
      "aes256-CBC",
      "des-EDE3-CBC",
      "desCBC"
    ], s;
  }
  var i = r.kdfSalt, o = O.util.createBuffer(r.kdfIterationCount);
  o = o.getInt(o.length() << 3);
  var l, u;
  switch (Q.oids[e]) {
    case "aes128-CBC":
      l = 16, u = O.aes.createDecryptionCipher;
      break;
    case "aes192-CBC":
      l = 24, u = O.aes.createDecryptionCipher;
      break;
    case "aes256-CBC":
      l = 32, u = O.aes.createDecryptionCipher;
      break;
    case "des-EDE3-CBC":
      l = 24, u = O.des.createDecryptionCipher;
      break;
    case "desCBC":
      l = 8, u = O.des.createDecryptionCipher;
      break;
  }
  var f = kn(r.prfOid), c = O.pkcs5.pbkdf2(a, i, o, l, f), v = r.encIv, m = u(c);
  return m.start(v), m;
};
Q.pbe.getCipherForPKCS12PBE = function(e, t, a) {
  var r = {}, n = [];
  if (!A.validate(t, Go, r, n)) {
    var s = new Error("Cannot read password-based-encryption algorithm parameters. ASN.1 object is not a supported EncryptedPrivateKeyInfo.");
    throw s.errors = n, s;
  }
  var i = O.util.createBuffer(r.salt), o = O.util.createBuffer(r.iterations);
  o = o.getInt(o.length() << 3);
  var l, u, f;
  switch (e) {
    case Q.oids["pbeWithSHAAnd3-KeyTripleDES-CBC"]:
      l = 24, u = 8, f = O.des.startDecrypting;
      break;
    case Q.oids["pbewithSHAAnd40BitRC2-CBC"]:
      l = 5, u = 8, f = function(x, S) {
        var I = O.rc2.createDecryptionCipher(x, 40);
        return I.start(S, null), I;
      };
      break;
    default:
      var s = new Error("Cannot read PKCS #12 PBE data block. Unsupported OID.");
      throw s.oid = e, s;
  }
  var c = kn(r.prfOid), v = Q.pbe.generatePkcs12Key(a, i, 1, o, l, c);
  c.start();
  var m = Q.pbe.generatePkcs12Key(a, i, 2, o, u, c);
  return f(v, m);
};
Q.pbe.opensslDeriveBytes = function(e, t, a, r) {
  if (typeof r > "u" || r === null) {
    if (!("md5" in O.md))
      throw new Error('"md5" hash algorithm unavailable.');
    r = O.md.md5.create();
  }
  t === null && (t = "");
  for (var n = [ja(r, e + t)], s = 16, i = 1; s < a; ++i, s += 16)
    n.push(ja(r, n[i - 1] + e + t));
  return n.join("").substr(0, a);
};
function ja(e, t) {
  return e.start().update(t).digest().getBytes();
}
function kn(e) {
  var t;
  if (!e)
    t = "hmacWithSHA1";
  else if (t = Q.oids[A.derToOid(e)], !t) {
    var a = new Error("Unsupported PRF OID.");
    throw a.oid = e, a.supported = [
      "hmacWithSHA1",
      "hmacWithSHA224",
      "hmacWithSHA256",
      "hmacWithSHA384",
      "hmacWithSHA512"
    ], a;
  }
  return Dn(t);
}
function Dn(e) {
  var t = O.md;
  switch (e) {
    case "hmacWithSHA224":
      t = O.md.sha512;
    case "hmacWithSHA1":
    case "hmacWithSHA256":
    case "hmacWithSHA384":
    case "hmacWithSHA512":
      e = e.substr(8).toLowerCase();
      break;
    default:
      var a = new Error("Unsupported PRF algorithm.");
      throw a.algorithm = e, a.supported = [
        "hmacWithSHA1",
        "hmacWithSHA224",
        "hmacWithSHA256",
        "hmacWithSHA384",
        "hmacWithSHA512"
      ], a;
  }
  if (!t || !(e in t))
    throw new Error("Unknown hash algorithm: " + e);
  return t[e].create();
}
function qo(e, t, a, r) {
  var n = A.create(A.Class.UNIVERSAL, A.Type.SEQUENCE, !0, [
    // salt
    A.create(
      A.Class.UNIVERSAL,
      A.Type.OCTETSTRING,
      !1,
      e
    ),
    // iteration count
    A.create(
      A.Class.UNIVERSAL,
      A.Type.INTEGER,
      !1,
      t.getBytes()
    )
  ]);
  return r !== "hmacWithSHA1" && n.value.push(
    // key length
    A.create(
      A.Class.UNIVERSAL,
      A.Type.INTEGER,
      !1,
      O.util.hexToBytes(a.toString(16))
    ),
    // AlgorithmIdentifier
    A.create(A.Class.UNIVERSAL, A.Type.SEQUENCE, !0, [
      // algorithm
      A.create(
        A.Class.UNIVERSAL,
        A.Type.OID,
        !1,
        A.oidToDer(Q.oids[r]).getBytes()
      ),
      // parameters (null)
      A.create(A.Class.UNIVERSAL, A.Type.NULL, !1, "")
    ])
  ), n;
}
var Wt = z, P = Wt.asn1, tr = Wt.pkcs7asn1 = Wt.pkcs7asn1 || {};
Wt.pkcs7 = Wt.pkcs7 || {};
Wt.pkcs7.asn1 = tr;
var Un = {
  name: "ContentInfo",
  tagClass: P.Class.UNIVERSAL,
  type: P.Type.SEQUENCE,
  constructed: !0,
  value: [{
    name: "ContentInfo.ContentType",
    tagClass: P.Class.UNIVERSAL,
    type: P.Type.OID,
    constructed: !1,
    capture: "contentType"
  }, {
    name: "ContentInfo.content",
    tagClass: P.Class.CONTEXT_SPECIFIC,
    type: 0,
    constructed: !0,
    optional: !0,
    captureAsn1: "content"
  }]
};
tr.contentInfoValidator = Un;
var Pn = {
  name: "EncryptedContentInfo",
  tagClass: P.Class.UNIVERSAL,
  type: P.Type.SEQUENCE,
  constructed: !0,
  value: [{
    name: "EncryptedContentInfo.contentType",
    tagClass: P.Class.UNIVERSAL,
    type: P.Type.OID,
    constructed: !1,
    capture: "contentType"
  }, {
    name: "EncryptedContentInfo.contentEncryptionAlgorithm",
    tagClass: P.Class.UNIVERSAL,
    type: P.Type.SEQUENCE,
    constructed: !0,
    value: [{
      name: "EncryptedContentInfo.contentEncryptionAlgorithm.algorithm",
      tagClass: P.Class.UNIVERSAL,
      type: P.Type.OID,
      constructed: !1,
      capture: "encAlgorithm"
    }, {
      name: "EncryptedContentInfo.contentEncryptionAlgorithm.parameter",
      tagClass: P.Class.UNIVERSAL,
      captureAsn1: "encParameter"
    }]
  }, {
    name: "EncryptedContentInfo.encryptedContent",
    tagClass: P.Class.CONTEXT_SPECIFIC,
    type: 0,
    /* The PKCS#7 structure output by OpenSSL somewhat differs from what
     * other implementations do generate.
     *
     * OpenSSL generates a structure like this:
     * SEQUENCE {
     *    ...
     *    [0]
     *       26 DA 67 D2 17 9C 45 3C B1 2A A8 59 2F 29 33 38
     *       C3 C3 DF 86 71 74 7A 19 9F 40 D0 29 BE 85 90 45
     *       ...
     * }
     *
     * Whereas other implementations (and this PKCS#7 module) generate:
     * SEQUENCE {
     *    ...
     *    [0] {
     *       OCTET STRING
     *          26 DA 67 D2 17 9C 45 3C B1 2A A8 59 2F 29 33 38
     *          C3 C3 DF 86 71 74 7A 19 9F 40 D0 29 BE 85 90 45
     *          ...
     *    }
     * }
     *
     * In order to support both, we just capture the context specific
     * field here.  The OCTET STRING bit is removed below.
     */
    capture: "encryptedContent",
    captureAsn1: "encryptedContentAsn1"
  }]
};
tr.envelopedDataValidator = {
  name: "EnvelopedData",
  tagClass: P.Class.UNIVERSAL,
  type: P.Type.SEQUENCE,
  constructed: !0,
  value: [{
    name: "EnvelopedData.Version",
    tagClass: P.Class.UNIVERSAL,
    type: P.Type.INTEGER,
    constructed: !1,
    capture: "version"
  }, {
    name: "EnvelopedData.RecipientInfos",
    tagClass: P.Class.UNIVERSAL,
    type: P.Type.SET,
    constructed: !0,
    captureAsn1: "recipientInfos"
  }].concat(Pn)
};
tr.encryptedDataValidator = {
  name: "EncryptedData",
  tagClass: P.Class.UNIVERSAL,
  type: P.Type.SEQUENCE,
  constructed: !0,
  value: [{
    name: "EncryptedData.Version",
    tagClass: P.Class.UNIVERSAL,
    type: P.Type.INTEGER,
    constructed: !1,
    capture: "version"
  }].concat(Pn)
};
var Qo = {
  name: "SignerInfo",
  tagClass: P.Class.UNIVERSAL,
  type: P.Type.SEQUENCE,
  constructed: !0,
  value: [{
    name: "SignerInfo.version",
    tagClass: P.Class.UNIVERSAL,
    type: P.Type.INTEGER,
    constructed: !1
  }, {
    name: "SignerInfo.issuerAndSerialNumber",
    tagClass: P.Class.UNIVERSAL,
    type: P.Type.SEQUENCE,
    constructed: !0,
    value: [{
      name: "SignerInfo.issuerAndSerialNumber.issuer",
      tagClass: P.Class.UNIVERSAL,
      type: P.Type.SEQUENCE,
      constructed: !0,
      captureAsn1: "issuer"
    }, {
      name: "SignerInfo.issuerAndSerialNumber.serialNumber",
      tagClass: P.Class.UNIVERSAL,
      type: P.Type.INTEGER,
      constructed: !1,
      capture: "serial"
    }]
  }, {
    name: "SignerInfo.digestAlgorithm",
    tagClass: P.Class.UNIVERSAL,
    type: P.Type.SEQUENCE,
    constructed: !0,
    value: [{
      name: "SignerInfo.digestAlgorithm.algorithm",
      tagClass: P.Class.UNIVERSAL,
      type: P.Type.OID,
      constructed: !1,
      capture: "digestAlgorithm"
    }, {
      name: "SignerInfo.digestAlgorithm.parameter",
      tagClass: P.Class.UNIVERSAL,
      constructed: !1,
      captureAsn1: "digestParameter",
      optional: !0
    }]
  }, {
    name: "SignerInfo.authenticatedAttributes",
    tagClass: P.Class.CONTEXT_SPECIFIC,
    type: 0,
    constructed: !0,
    optional: !0,
    capture: "authenticatedAttributes"
  }, {
    name: "SignerInfo.digestEncryptionAlgorithm",
    tagClass: P.Class.UNIVERSAL,
    type: P.Type.SEQUENCE,
    constructed: !0,
    capture: "signatureAlgorithm"
  }, {
    name: "SignerInfo.encryptedDigest",
    tagClass: P.Class.UNIVERSAL,
    type: P.Type.OCTETSTRING,
    constructed: !1,
    capture: "signature"
  }, {
    name: "SignerInfo.unauthenticatedAttributes",
    tagClass: P.Class.CONTEXT_SPECIFIC,
    type: 1,
    constructed: !0,
    optional: !0,
    capture: "unauthenticatedAttributes"
  }]
};
tr.signedDataValidator = {
  name: "SignedData",
  tagClass: P.Class.UNIVERSAL,
  type: P.Type.SEQUENCE,
  constructed: !0,
  value: [
    {
      name: "SignedData.Version",
      tagClass: P.Class.UNIVERSAL,
      type: P.Type.INTEGER,
      constructed: !1,
      capture: "version"
    },
    {
      name: "SignedData.DigestAlgorithms",
      tagClass: P.Class.UNIVERSAL,
      type: P.Type.SET,
      constructed: !0,
      captureAsn1: "digestAlgorithms"
    },
    Un,
    {
      name: "SignedData.Certificates",
      tagClass: P.Class.CONTEXT_SPECIFIC,
      type: 0,
      optional: !0,
      captureAsn1: "certificates"
    },
    {
      name: "SignedData.CertificateRevocationLists",
      tagClass: P.Class.CONTEXT_SPECIFIC,
      type: 1,
      optional: !0,
      captureAsn1: "crls"
    },
    {
      name: "SignedData.SignerInfos",
      tagClass: P.Class.UNIVERSAL,
      type: P.Type.SET,
      capture: "signerInfos",
      optional: !0,
      value: [Qo]
    }
  ]
};
tr.recipientInfoValidator = {
  name: "RecipientInfo",
  tagClass: P.Class.UNIVERSAL,
  type: P.Type.SEQUENCE,
  constructed: !0,
  value: [{
    name: "RecipientInfo.version",
    tagClass: P.Class.UNIVERSAL,
    type: P.Type.INTEGER,
    constructed: !1,
    capture: "version"
  }, {
    name: "RecipientInfo.issuerAndSerial",
    tagClass: P.Class.UNIVERSAL,
    type: P.Type.SEQUENCE,
    constructed: !0,
    value: [{
      name: "RecipientInfo.issuerAndSerial.issuer",
      tagClass: P.Class.UNIVERSAL,
      type: P.Type.SEQUENCE,
      constructed: !0,
      captureAsn1: "issuer"
    }, {
      name: "RecipientInfo.issuerAndSerial.serialNumber",
      tagClass: P.Class.UNIVERSAL,
      type: P.Type.INTEGER,
      constructed: !1,
      capture: "serial"
    }]
  }, {
    name: "RecipientInfo.keyEncryptionAlgorithm",
    tagClass: P.Class.UNIVERSAL,
    type: P.Type.SEQUENCE,
    constructed: !0,
    value: [{
      name: "RecipientInfo.keyEncryptionAlgorithm.algorithm",
      tagClass: P.Class.UNIVERSAL,
      type: P.Type.OID,
      constructed: !1,
      capture: "encAlgorithm"
    }, {
      name: "RecipientInfo.keyEncryptionAlgorithm.parameter",
      tagClass: P.Class.UNIVERSAL,
      constructed: !1,
      captureAsn1: "encParameter",
      optional: !0
    }]
  }, {
    name: "RecipientInfo.encryptedKey",
    tagClass: P.Class.UNIVERSAL,
    type: P.Type.OCTETSTRING,
    constructed: !1,
    capture: "encKey"
  }]
};
var Ot = z;
Ot.mgf = Ot.mgf || {};
var zo = Ot.mgf.mgf1 = Ot.mgf1 = Ot.mgf1 || {};
zo.create = function(e) {
  var t = {
    /**
     * Generate mask of specified length.
     *
     * @param {String} seed The seed for mask generation.
     * @param maskLen Number of bytes to generate.
     * @return {String} The generated mask.
     */
    generate: function(a, r) {
      for (var n = new Ot.util.ByteBuffer(), s = Math.ceil(r / e.digestLength), i = 0; i < s; i++) {
        var o = new Ot.util.ByteBuffer();
        o.putInt32(i), e.start(), e.update(a + o.getBytes()), n.putBuffer(e.digest());
      }
      return n.truncate(n.length() - r), n.getBytes();
    }
  };
  return t;
};
var br = z;
br.mgf = br.mgf || {};
br.mgf.mgf1 = br.mgf1;
var Dt = z, Yo = Dt.pss = Dt.pss || {};
Yo.create = function(e) {
  arguments.length === 3 && (e = {
    md: arguments[0],
    mgf: arguments[1],
    saltLength: arguments[2]
  });
  var t = e.md, a = e.mgf, r = t.digestLength, n = e.salt || null;
  typeof n == "string" && (n = Dt.util.createBuffer(n));
  var s;
  if ("saltLength" in e)
    s = e.saltLength;
  else if (n !== null)
    s = n.length();
  else
    throw new Error("Salt length not specified or specific salt not given.");
  if (n !== null && n.length() !== s)
    throw new Error("Given salt length does not match length of given salt.");
  var i = e.prng || Dt.random, o = {};
  return o.encode = function(l, u) {
    var f, c = u - 1, v = Math.ceil(c / 8), m = l.digest().getBytes();
    if (v < r + s + 2)
      throw new Error("Message is too long to encrypt.");
    var y;
    n === null ? y = i.getBytesSync(s) : y = n.bytes();
    var x = new Dt.util.ByteBuffer();
    x.fillWithByte(0, 8), x.putBytes(m), x.putBytes(y), t.start(), t.update(x.getBytes());
    var S = t.digest().getBytes(), I = new Dt.util.ByteBuffer();
    I.fillWithByte(0, v - s - r - 2), I.putByte(1), I.putBytes(y);
    var b = I.getBytes(), _ = v - r - 1, V = a.generate(S, _), k = "";
    for (f = 0; f < _; f++)
      k += String.fromCharCode(b.charCodeAt(f) ^ V.charCodeAt(f));
    var w = 65280 >> 8 * v - c & 255;
    return k = String.fromCharCode(k.charCodeAt(0) & ~w) + k.substr(1), k + S + "¼";
  }, o.verify = function(l, u, f) {
    var c, v = f - 1, m = Math.ceil(v / 8);
    if (u = u.substr(-m), m < r + s + 2)
      throw new Error("Inconsistent parameters to PSS signature verification.");
    if (u.charCodeAt(m - 1) !== 188)
      throw new Error("Encoded message does not end in 0xBC.");
    var y = m - r - 1, x = u.substr(0, y), S = u.substr(y, r), I = 65280 >> 8 * m - v & 255;
    if (x.charCodeAt(0) & I)
      throw new Error("Bits beyond keysize not zero as expected.");
    var b = a.generate(S, y), _ = "";
    for (c = 0; c < y; c++)
      _ += String.fromCharCode(x.charCodeAt(c) ^ b.charCodeAt(c));
    _ = String.fromCharCode(_.charCodeAt(0) & ~I) + _.substr(1);
    var V = m - r - s - 2;
    for (c = 0; c < V; c++)
      if (_.charCodeAt(c) !== 0)
        throw new Error("Leftmost octets not zero as expected");
    if (_.charCodeAt(V) !== 1)
      throw new Error("Inconsistent PSS signature, 0x01 marker not found");
    var k = _.substr(-s), w = new Dt.util.ByteBuffer();
    w.fillWithByte(0, 8), w.putBytes(l), w.putBytes(k), t.start(), t.update(w.getBytes());
    var G = t.digest().getBytes();
    return S === G;
  }, o;
};
var K = z, h = K.asn1, L = K.pki = K.pki || {}, Z = L.oids, de = {};
de.CN = Z.commonName;
de.commonName = "CN";
de.C = Z.countryName;
de.countryName = "C";
de.L = Z.localityName;
de.localityName = "L";
de.ST = Z.stateOrProvinceName;
de.stateOrProvinceName = "ST";
de.O = Z.organizationName;
de.organizationName = "O";
de.OU = Z.organizationalUnitName;
de.organizationalUnitName = "OU";
de.E = Z.emailAddress;
de.emailAddress = "E";
var Vn = K.pki.rsa.publicKeyValidator, $o = {
  name: "Certificate",
  tagClass: h.Class.UNIVERSAL,
  type: h.Type.SEQUENCE,
  constructed: !0,
  value: [{
    name: "Certificate.TBSCertificate",
    tagClass: h.Class.UNIVERSAL,
    type: h.Type.SEQUENCE,
    constructed: !0,
    captureAsn1: "tbsCertificate",
    value: [
      {
        name: "Certificate.TBSCertificate.version",
        tagClass: h.Class.CONTEXT_SPECIFIC,
        type: 0,
        constructed: !0,
        optional: !0,
        value: [{
          name: "Certificate.TBSCertificate.version.integer",
          tagClass: h.Class.UNIVERSAL,
          type: h.Type.INTEGER,
          constructed: !1,
          capture: "certVersion"
        }]
      },
      {
        name: "Certificate.TBSCertificate.serialNumber",
        tagClass: h.Class.UNIVERSAL,
        type: h.Type.INTEGER,
        constructed: !1,
        capture: "certSerialNumber"
      },
      {
        name: "Certificate.TBSCertificate.signature",
        tagClass: h.Class.UNIVERSAL,
        type: h.Type.SEQUENCE,
        constructed: !0,
        value: [{
          name: "Certificate.TBSCertificate.signature.algorithm",
          tagClass: h.Class.UNIVERSAL,
          type: h.Type.OID,
          constructed: !1,
          capture: "certinfoSignatureOid"
        }, {
          name: "Certificate.TBSCertificate.signature.parameters",
          tagClass: h.Class.UNIVERSAL,
          optional: !0,
          captureAsn1: "certinfoSignatureParams"
        }]
      },
      {
        name: "Certificate.TBSCertificate.issuer",
        tagClass: h.Class.UNIVERSAL,
        type: h.Type.SEQUENCE,
        constructed: !0,
        captureAsn1: "certIssuer"
      },
      {
        name: "Certificate.TBSCertificate.validity",
        tagClass: h.Class.UNIVERSAL,
        type: h.Type.SEQUENCE,
        constructed: !0,
        // Note: UTC and generalized times may both appear so the capture
        // names are based on their detected order, the names used below
        // are only for the common case, which validity time really means
        // "notBefore" and which means "notAfter" will be determined by order
        value: [{
          // notBefore (Time) (UTC time case)
          name: "Certificate.TBSCertificate.validity.notBefore (utc)",
          tagClass: h.Class.UNIVERSAL,
          type: h.Type.UTCTIME,
          constructed: !1,
          optional: !0,
          capture: "certValidity1UTCTime"
        }, {
          // notBefore (Time) (generalized time case)
          name: "Certificate.TBSCertificate.validity.notBefore (generalized)",
          tagClass: h.Class.UNIVERSAL,
          type: h.Type.GENERALIZEDTIME,
          constructed: !1,
          optional: !0,
          capture: "certValidity2GeneralizedTime"
        }, {
          // notAfter (Time) (only UTC time is supported)
          name: "Certificate.TBSCertificate.validity.notAfter (utc)",
          tagClass: h.Class.UNIVERSAL,
          type: h.Type.UTCTIME,
          constructed: !1,
          optional: !0,
          capture: "certValidity3UTCTime"
        }, {
          // notAfter (Time) (only UTC time is supported)
          name: "Certificate.TBSCertificate.validity.notAfter (generalized)",
          tagClass: h.Class.UNIVERSAL,
          type: h.Type.GENERALIZEDTIME,
          constructed: !1,
          optional: !0,
          capture: "certValidity4GeneralizedTime"
        }]
      },
      {
        // Name (subject) (RDNSequence)
        name: "Certificate.TBSCertificate.subject",
        tagClass: h.Class.UNIVERSAL,
        type: h.Type.SEQUENCE,
        constructed: !0,
        captureAsn1: "certSubject"
      },
      // SubjectPublicKeyInfo
      Vn,
      {
        // issuerUniqueID (optional)
        name: "Certificate.TBSCertificate.issuerUniqueID",
        tagClass: h.Class.CONTEXT_SPECIFIC,
        type: 1,
        constructed: !0,
        optional: !0,
        value: [{
          name: "Certificate.TBSCertificate.issuerUniqueID.id",
          tagClass: h.Class.UNIVERSAL,
          type: h.Type.BITSTRING,
          constructed: !1,
          // TODO: support arbitrary bit length ids
          captureBitStringValue: "certIssuerUniqueId"
        }]
      },
      {
        // subjectUniqueID (optional)
        name: "Certificate.TBSCertificate.subjectUniqueID",
        tagClass: h.Class.CONTEXT_SPECIFIC,
        type: 2,
        constructed: !0,
        optional: !0,
        value: [{
          name: "Certificate.TBSCertificate.subjectUniqueID.id",
          tagClass: h.Class.UNIVERSAL,
          type: h.Type.BITSTRING,
          constructed: !1,
          // TODO: support arbitrary bit length ids
          captureBitStringValue: "certSubjectUniqueId"
        }]
      },
      {
        // Extensions (optional)
        name: "Certificate.TBSCertificate.extensions",
        tagClass: h.Class.CONTEXT_SPECIFIC,
        type: 3,
        constructed: !0,
        captureAsn1: "certExtensions",
        optional: !0
      }
    ]
  }, {
    // AlgorithmIdentifier (signature algorithm)
    name: "Certificate.signatureAlgorithm",
    tagClass: h.Class.UNIVERSAL,
    type: h.Type.SEQUENCE,
    constructed: !0,
    value: [{
      // algorithm
      name: "Certificate.signatureAlgorithm.algorithm",
      tagClass: h.Class.UNIVERSAL,
      type: h.Type.OID,
      constructed: !1,
      capture: "certSignatureOid"
    }, {
      name: "Certificate.TBSCertificate.signature.parameters",
      tagClass: h.Class.UNIVERSAL,
      optional: !0,
      captureAsn1: "certSignatureParams"
    }]
  }, {
    // SignatureValue
    name: "Certificate.signatureValue",
    tagClass: h.Class.UNIVERSAL,
    type: h.Type.BITSTRING,
    constructed: !1,
    captureBitStringValue: "certSignature"
  }]
}, Wo = {
  name: "rsapss",
  tagClass: h.Class.UNIVERSAL,
  type: h.Type.SEQUENCE,
  constructed: !0,
  value: [{
    name: "rsapss.hashAlgorithm",
    tagClass: h.Class.CONTEXT_SPECIFIC,
    type: 0,
    constructed: !0,
    value: [{
      name: "rsapss.hashAlgorithm.AlgorithmIdentifier",
      tagClass: h.Class.UNIVERSAL,
      type: h.Class.SEQUENCE,
      constructed: !0,
      optional: !0,
      value: [{
        name: "rsapss.hashAlgorithm.AlgorithmIdentifier.algorithm",
        tagClass: h.Class.UNIVERSAL,
        type: h.Type.OID,
        constructed: !1,
        capture: "hashOid"
        /* parameter block omitted, for SHA1 NULL anyhow. */
      }]
    }]
  }, {
    name: "rsapss.maskGenAlgorithm",
    tagClass: h.Class.CONTEXT_SPECIFIC,
    type: 1,
    constructed: !0,
    value: [{
      name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier",
      tagClass: h.Class.UNIVERSAL,
      type: h.Class.SEQUENCE,
      constructed: !0,
      optional: !0,
      value: [{
        name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier.algorithm",
        tagClass: h.Class.UNIVERSAL,
        type: h.Type.OID,
        constructed: !1,
        capture: "maskGenOid"
      }, {
        name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier.params",
        tagClass: h.Class.UNIVERSAL,
        type: h.Type.SEQUENCE,
        constructed: !0,
        value: [{
          name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier.params.algorithm",
          tagClass: h.Class.UNIVERSAL,
          type: h.Type.OID,
          constructed: !1,
          capture: "maskGenHashOid"
          /* parameter block omitted, for SHA1 NULL anyhow. */
        }]
      }]
    }]
  }, {
    name: "rsapss.saltLength",
    tagClass: h.Class.CONTEXT_SPECIFIC,
    type: 2,
    optional: !0,
    value: [{
      name: "rsapss.saltLength.saltLength",
      tagClass: h.Class.UNIVERSAL,
      type: h.Class.INTEGER,
      constructed: !1,
      capture: "saltLength"
    }]
  }, {
    name: "rsapss.trailerField",
    tagClass: h.Class.CONTEXT_SPECIFIC,
    type: 3,
    optional: !0,
    value: [{
      name: "rsapss.trailer.trailer",
      tagClass: h.Class.UNIVERSAL,
      type: h.Class.INTEGER,
      constructed: !1,
      capture: "trailer"
    }]
  }]
}, Xo = {
  name: "CertificationRequestInfo",
  tagClass: h.Class.UNIVERSAL,
  type: h.Type.SEQUENCE,
  constructed: !0,
  captureAsn1: "certificationRequestInfo",
  value: [
    {
      name: "CertificationRequestInfo.integer",
      tagClass: h.Class.UNIVERSAL,
      type: h.Type.INTEGER,
      constructed: !1,
      capture: "certificationRequestInfoVersion"
    },
    {
      // Name (subject) (RDNSequence)
      name: "CertificationRequestInfo.subject",
      tagClass: h.Class.UNIVERSAL,
      type: h.Type.SEQUENCE,
      constructed: !0,
      captureAsn1: "certificationRequestInfoSubject"
    },
    // SubjectPublicKeyInfo
    Vn,
    {
      name: "CertificationRequestInfo.attributes",
      tagClass: h.Class.CONTEXT_SPECIFIC,
      type: 0,
      constructed: !0,
      optional: !0,
      capture: "certificationRequestInfoAttributes",
      value: [{
        name: "CertificationRequestInfo.attributes",
        tagClass: h.Class.UNIVERSAL,
        type: h.Type.SEQUENCE,
        constructed: !0,
        value: [{
          name: "CertificationRequestInfo.attributes.type",
          tagClass: h.Class.UNIVERSAL,
          type: h.Type.OID,
          constructed: !1
        }, {
          name: "CertificationRequestInfo.attributes.value",
          tagClass: h.Class.UNIVERSAL,
          type: h.Type.SET,
          constructed: !0
        }]
      }]
    }
  ]
}, jo = {
  name: "CertificationRequest",
  tagClass: h.Class.UNIVERSAL,
  type: h.Type.SEQUENCE,
  constructed: !0,
  captureAsn1: "csr",
  value: [
    Xo,
    {
      // AlgorithmIdentifier (signature algorithm)
      name: "CertificationRequest.signatureAlgorithm",
      tagClass: h.Class.UNIVERSAL,
      type: h.Type.SEQUENCE,
      constructed: !0,
      value: [{
        // algorithm
        name: "CertificationRequest.signatureAlgorithm.algorithm",
        tagClass: h.Class.UNIVERSAL,
        type: h.Type.OID,
        constructed: !1,
        capture: "csrSignatureOid"
      }, {
        name: "CertificationRequest.signatureAlgorithm.parameters",
        tagClass: h.Class.UNIVERSAL,
        optional: !0,
        captureAsn1: "csrSignatureParams"
      }]
    },
    {
      // signature
      name: "CertificationRequest.signature",
      tagClass: h.Class.UNIVERSAL,
      type: h.Type.BITSTRING,
      constructed: !1,
      captureBitStringValue: "csrSignature"
    }
  ]
};
L.RDNAttributesAsArray = function(e, t) {
  for (var a = [], r, n, s, i = 0; i < e.value.length; ++i) {
    r = e.value[i];
    for (var o = 0; o < r.value.length; ++o)
      s = {}, n = r.value[o], s.type = h.derToOid(n.value[0].value), s.value = n.value[1].value, s.valueTagClass = n.value[1].type, s.type in Z && (s.name = Z[s.type], s.name in de && (s.shortName = de[s.name])), t && (t.update(s.type), t.update(s.value)), a.push(s);
  }
  return a;
};
L.CRIAttributesAsArray = function(e) {
  for (var t = [], a = 0; a < e.length; ++a)
    for (var r = e[a], n = h.derToOid(r.value[0].value), s = r.value[1].value, i = 0; i < s.length; ++i) {
      var o = {};
      if (o.type = n, o.value = s[i].value, o.valueTagClass = s[i].type, o.type in Z && (o.name = Z[o.type], o.name in de && (o.shortName = de[o.name])), o.type === Z.extensionRequest) {
        o.extensions = [];
        for (var l = 0; l < o.value.length; ++l)
          o.extensions.push(L.certificateExtensionFromAsn1(o.value[l]));
      }
      t.push(o);
    }
  return t;
};
function _t(e, t) {
  typeof t == "string" && (t = { shortName: t });
  for (var a = null, r, n = 0; a === null && n < e.attributes.length; ++n)
    r = e.attributes[n], (t.type && t.type === r.type || t.name && t.name === r.name || t.shortName && t.shortName === r.shortName) && (a = r);
  return a;
}
var _r = function(e, t, a) {
  var r = {};
  if (e !== Z["RSASSA-PSS"])
    return r;
  a && (r = {
    hash: {
      algorithmOid: Z.sha1
    },
    mgf: {
      algorithmOid: Z.mgf1,
      hash: {
        algorithmOid: Z.sha1
      }
    },
    saltLength: 20
  });
  var n = {}, s = [];
  if (!h.validate(t, Wo, n, s)) {
    var i = new Error("Cannot read RSASSA-PSS parameter block.");
    throw i.errors = s, i;
  }
  return n.hashOid !== void 0 && (r.hash = r.hash || {}, r.hash.algorithmOid = h.derToOid(n.hashOid)), n.maskGenOid !== void 0 && (r.mgf = r.mgf || {}, r.mgf.algorithmOid = h.derToOid(n.maskGenOid), r.mgf.hash = r.mgf.hash || {}, r.mgf.hash.algorithmOid = h.derToOid(n.maskGenHashOid)), n.saltLength !== void 0 && (r.saltLength = n.saltLength.charCodeAt(0)), r;
}, Kr = function(e) {
  switch (Z[e.signatureOid]) {
    case "sha1WithRSAEncryption":
    case "sha1WithRSASignature":
      return K.md.sha1.create();
    case "md5WithRSAEncryption":
      return K.md.md5.create();
    case "sha256WithRSAEncryption":
      return K.md.sha256.create();
    case "sha384WithRSAEncryption":
      return K.md.sha384.create();
    case "sha512WithRSAEncryption":
      return K.md.sha512.create();
    case "RSASSA-PSS":
      return K.md.sha256.create();
    default:
      var t = new Error(
        "Could not compute " + e.type + " digest. Unknown signature OID."
      );
      throw t.signatureOid = e.signatureOid, t;
  }
}, On = function(e) {
  var t = e.certificate, a;
  switch (t.signatureOid) {
    case Z.sha1WithRSAEncryption:
    case Z.sha1WithRSASignature:
      break;
    case Z["RSASSA-PSS"]:
      var r, n;
      if (r = Z[t.signatureParameters.mgf.hash.algorithmOid], r === void 0 || K.md[r] === void 0) {
        var s = new Error("Unsupported MGF hash function.");
        throw s.oid = t.signatureParameters.mgf.hash.algorithmOid, s.name = r, s;
      }
      if (n = Z[t.signatureParameters.mgf.algorithmOid], n === void 0 || K.mgf[n] === void 0) {
        var s = new Error("Unsupported MGF function.");
        throw s.oid = t.signatureParameters.mgf.algorithmOid, s.name = n, s;
      }
      if (n = K.mgf[n].create(K.md[r].create()), r = Z[t.signatureParameters.hash.algorithmOid], r === void 0 || K.md[r] === void 0) {
        var s = new Error("Unsupported RSASSA-PSS hash function.");
        throw s.oid = t.signatureParameters.hash.algorithmOid, s.name = r, s;
      }
      a = K.pss.create(
        K.md[r].create(),
        n,
        t.signatureParameters.saltLength
      );
      break;
  }
  return t.publicKey.verify(
    e.md.digest().getBytes(),
    e.signature,
    a
  );
};
L.certificateFromPem = function(e, t, a) {
  var r = K.pem.decode(e)[0];
  if (r.type !== "CERTIFICATE" && r.type !== "X509 CERTIFICATE" && r.type !== "TRUSTED CERTIFICATE") {
    var n = new Error(
      'Could not convert certificate from PEM; PEM header type is not "CERTIFICATE", "X509 CERTIFICATE", or "TRUSTED CERTIFICATE".'
    );
    throw n.headerType = r.type, n;
  }
  if (r.procType && r.procType.type === "ENCRYPTED")
    throw new Error(
      "Could not convert certificate from PEM; PEM is encrypted."
    );
  var s = h.fromDer(r.body, a);
  return L.certificateFromAsn1(s, t);
};
L.certificateToPem = function(e, t) {
  var a = {
    type: "CERTIFICATE",
    body: h.toDer(L.certificateToAsn1(e)).getBytes()
  };
  return K.pem.encode(a, { maxline: t });
};
L.publicKeyFromPem = function(e) {
  var t = K.pem.decode(e)[0];
  if (t.type !== "PUBLIC KEY" && t.type !== "RSA PUBLIC KEY") {
    var a = new Error('Could not convert public key from PEM; PEM header type is not "PUBLIC KEY" or "RSA PUBLIC KEY".');
    throw a.headerType = t.type, a;
  }
  if (t.procType && t.procType.type === "ENCRYPTED")
    throw new Error("Could not convert public key from PEM; PEM is encrypted.");
  var r = h.fromDer(t.body);
  return L.publicKeyFromAsn1(r);
};
L.publicKeyToPem = function(e, t) {
  var a = {
    type: "PUBLIC KEY",
    body: h.toDer(L.publicKeyToAsn1(e)).getBytes()
  };
  return K.pem.encode(a, { maxline: t });
};
L.publicKeyToRSAPublicKeyPem = function(e, t) {
  var a = {
    type: "RSA PUBLIC KEY",
    body: h.toDer(L.publicKeyToRSAPublicKey(e)).getBytes()
  };
  return K.pem.encode(a, { maxline: t });
};
L.getPublicKeyFingerprint = function(e, t) {
  t = t || {};
  var a = t.md || K.md.sha1.create(), r = t.type || "RSAPublicKey", n;
  switch (r) {
    case "RSAPublicKey":
      n = h.toDer(L.publicKeyToRSAPublicKey(e)).getBytes();
      break;
    case "SubjectPublicKeyInfo":
      n = h.toDer(L.publicKeyToAsn1(e)).getBytes();
      break;
    default:
      throw new Error('Unknown fingerprint type "' + t.type + '".');
  }
  a.start(), a.update(n);
  var s = a.digest();
  if (t.encoding === "hex") {
    var i = s.toHex();
    return t.delimiter ? i.match(/.{2}/g).join(t.delimiter) : i;
  } else {
    if (t.encoding === "binary")
      return s.getBytes();
    if (t.encoding)
      throw new Error('Unknown encoding "' + t.encoding + '".');
  }
  return s;
};
L.certificationRequestFromPem = function(e, t, a) {
  var r = K.pem.decode(e)[0];
  if (r.type !== "CERTIFICATE REQUEST") {
    var n = new Error('Could not convert certification request from PEM; PEM header type is not "CERTIFICATE REQUEST".');
    throw n.headerType = r.type, n;
  }
  if (r.procType && r.procType.type === "ENCRYPTED")
    throw new Error("Could not convert certification request from PEM; PEM is encrypted.");
  var s = h.fromDer(r.body, a);
  return L.certificationRequestFromAsn1(s, t);
};
L.certificationRequestToPem = function(e, t) {
  var a = {
    type: "CERTIFICATE REQUEST",
    body: h.toDer(L.certificationRequestToAsn1(e)).getBytes()
  };
  return K.pem.encode(a, { maxline: t });
};
L.createCertificate = function() {
  var e = {};
  return e.version = 2, e.serialNumber = "00", e.signatureOid = null, e.signature = null, e.siginfo = {}, e.siginfo.algorithmOid = null, e.validity = {}, e.validity.notBefore = /* @__PURE__ */ new Date(), e.validity.notAfter = /* @__PURE__ */ new Date(), e.issuer = {}, e.issuer.getField = function(t) {
    return _t(e.issuer, t);
  }, e.issuer.addField = function(t) {
    et([t]), e.issuer.attributes.push(t);
  }, e.issuer.attributes = [], e.issuer.hash = null, e.subject = {}, e.subject.getField = function(t) {
    return _t(e.subject, t);
  }, e.subject.addField = function(t) {
    et([t]), e.subject.attributes.push(t);
  }, e.subject.attributes = [], e.subject.hash = null, e.extensions = [], e.publicKey = null, e.md = null, e.setSubject = function(t, a) {
    et(t), e.subject.attributes = t, delete e.subject.uniqueId, a && (e.subject.uniqueId = a), e.subject.hash = null;
  }, e.setIssuer = function(t, a) {
    et(t), e.issuer.attributes = t, delete e.issuer.uniqueId, a && (e.issuer.uniqueId = a), e.issuer.hash = null;
  }, e.setExtensions = function(t) {
    for (var a = 0; a < t.length; ++a)
      Fn(t[a], { cert: e });
    e.extensions = t;
  }, e.getExtension = function(t) {
    typeof t == "string" && (t = { name: t });
    for (var a = null, r, n = 0; a === null && n < e.extensions.length; ++n)
      r = e.extensions[n], (t.id && r.id === t.id || t.name && r.name === t.name) && (a = r);
    return a;
  }, e.sign = function(t, a) {
    e.md = a || K.md.sha1.create();
    var r = Z[e.md.algorithm + "WithRSAEncryption"];
    if (!r) {
      var n = new Error("Could not compute certificate digest. Unknown message digest algorithm OID.");
      throw n.algorithm = e.md.algorithm, n;
    }
    e.signatureOid = e.siginfo.algorithmOid = r, e.tbsCertificate = L.getTBSCertificate(e);
    var s = h.toDer(e.tbsCertificate);
    e.md.update(s.getBytes()), e.signature = t.sign(e.md);
  }, e.verify = function(t) {
    var a = !1;
    if (!e.issued(t)) {
      var r = t.issuer, n = e.subject, s = new Error(
        "The parent certificate did not issue the given child certificate; the child certificate's issuer does not match the parent's subject."
      );
      throw s.expectedIssuer = n.attributes, s.actualIssuer = r.attributes, s;
    }
    var i = t.md;
    if (i === null) {
      i = Kr({
        signatureOid: t.signatureOid,
        type: "certificate"
      });
      var o = t.tbsCertificate || L.getTBSCertificate(t), l = h.toDer(o);
      i.update(l.getBytes());
    }
    return i !== null && (a = On({
      certificate: e,
      md: i,
      signature: t.signature
    })), a;
  }, e.isIssuer = function(t) {
    var a = !1, r = e.issuer, n = t.subject;
    if (r.hash && n.hash)
      a = r.hash === n.hash;
    else if (r.attributes.length === n.attributes.length) {
      a = !0;
      for (var s, i, o = 0; a && o < r.attributes.length; ++o)
        s = r.attributes[o], i = n.attributes[o], (s.type !== i.type || s.value !== i.value) && (a = !1);
    }
    return a;
  }, e.issued = function(t) {
    return t.isIssuer(e);
  }, e.generateSubjectKeyIdentifier = function() {
    return L.getPublicKeyFingerprint(e.publicKey, { type: "RSAPublicKey" });
  }, e.verifySubjectKeyIdentifier = function() {
    for (var t = Z.subjectKeyIdentifier, a = 0; a < e.extensions.length; ++a) {
      var r = e.extensions[a];
      if (r.id === t) {
        var n = e.generateSubjectKeyIdentifier().getBytes();
        return K.util.hexToBytes(r.subjectKeyIdentifier) === n;
      }
    }
    return !1;
  }, e;
};
L.certificateFromAsn1 = function(e, t) {
  var a = {}, r = [];
  if (!h.validate(e, $o, a, r)) {
    var n = new Error("Cannot read X.509 certificate. ASN.1 object is not an X509v3 Certificate.");
    throw n.errors = r, n;
  }
  var s = h.derToOid(a.publicKeyOid);
  if (s !== L.oids.rsaEncryption)
    throw new Error("Cannot read public key. OID is not RSA.");
  var i = L.createCertificate();
  i.version = a.certVersion ? a.certVersion.charCodeAt(0) : 0;
  var o = K.util.createBuffer(a.certSerialNumber);
  i.serialNumber = o.toHex(), i.signatureOid = K.asn1.derToOid(a.certSignatureOid), i.signatureParameters = _r(
    i.signatureOid,
    a.certSignatureParams,
    !0
  ), i.siginfo.algorithmOid = K.asn1.derToOid(a.certinfoSignatureOid), i.siginfo.parameters = _r(
    i.siginfo.algorithmOid,
    a.certinfoSignatureParams,
    !1
  ), i.signature = a.certSignature;
  var l = [];
  if (a.certValidity1UTCTime !== void 0 && l.push(h.utcTimeToDate(a.certValidity1UTCTime)), a.certValidity2GeneralizedTime !== void 0 && l.push(h.generalizedTimeToDate(
    a.certValidity2GeneralizedTime
  )), a.certValidity3UTCTime !== void 0 && l.push(h.utcTimeToDate(a.certValidity3UTCTime)), a.certValidity4GeneralizedTime !== void 0 && l.push(h.generalizedTimeToDate(
    a.certValidity4GeneralizedTime
  )), l.length > 2)
    throw new Error("Cannot read notBefore/notAfter validity times; more than two times were provided in the certificate.");
  if (l.length < 2)
    throw new Error("Cannot read notBefore/notAfter validity times; they were not provided as either UTCTime or GeneralizedTime.");
  if (i.validity.notBefore = l[0], i.validity.notAfter = l[1], i.tbsCertificate = a.tbsCertificate, t) {
    i.md = Kr({
      signatureOid: i.signatureOid,
      type: "certificate"
    });
    var u = h.toDer(i.tbsCertificate);
    i.md.update(u.getBytes());
  }
  var f = K.md.sha1.create(), c = h.toDer(a.certIssuer);
  f.update(c.getBytes()), i.issuer.getField = function(y) {
    return _t(i.issuer, y);
  }, i.issuer.addField = function(y) {
    et([y]), i.issuer.attributes.push(y);
  }, i.issuer.attributes = L.RDNAttributesAsArray(a.certIssuer), a.certIssuerUniqueId && (i.issuer.uniqueId = a.certIssuerUniqueId), i.issuer.hash = f.digest().toHex();
  var v = K.md.sha1.create(), m = h.toDer(a.certSubject);
  return v.update(m.getBytes()), i.subject.getField = function(y) {
    return _t(i.subject, y);
  }, i.subject.addField = function(y) {
    et([y]), i.subject.attributes.push(y);
  }, i.subject.attributes = L.RDNAttributesAsArray(a.certSubject), a.certSubjectUniqueId && (i.subject.uniqueId = a.certSubjectUniqueId), i.subject.hash = v.digest().toHex(), a.certExtensions ? i.extensions = L.certificateExtensionsFromAsn1(a.certExtensions) : i.extensions = [], i.publicKey = L.publicKeyFromAsn1(a.subjectPublicKeyInfo), i;
};
L.certificateExtensionsFromAsn1 = function(e) {
  for (var t = [], a = 0; a < e.value.length; ++a)
    for (var r = e.value[a], n = 0; n < r.value.length; ++n)
      t.push(L.certificateExtensionFromAsn1(r.value[n]));
  return t;
};
L.certificateExtensionFromAsn1 = function(e) {
  var t = {};
  if (t.id = h.derToOid(e.value[0].value), t.critical = !1, e.value[1].type === h.Type.BOOLEAN ? (t.critical = e.value[1].value.charCodeAt(0) !== 0, t.value = e.value[2].value) : t.value = e.value[1].value, t.id in Z) {
    if (t.name = Z[t.id], t.name === "keyUsage") {
      var a = h.fromDer(t.value), r = 0, n = 0;
      a.value.length > 1 && (r = a.value.charCodeAt(1), n = a.value.length > 2 ? a.value.charCodeAt(2) : 0), t.digitalSignature = (r & 128) === 128, t.nonRepudiation = (r & 64) === 64, t.keyEncipherment = (r & 32) === 32, t.dataEncipherment = (r & 16) === 16, t.keyAgreement = (r & 8) === 8, t.keyCertSign = (r & 4) === 4, t.cRLSign = (r & 2) === 2, t.encipherOnly = (r & 1) === 1, t.decipherOnly = (n & 128) === 128;
    } else if (t.name === "basicConstraints") {
      var a = h.fromDer(t.value);
      a.value.length > 0 && a.value[0].type === h.Type.BOOLEAN ? t.cA = a.value[0].value.charCodeAt(0) !== 0 : t.cA = !1;
      var s = null;
      a.value.length > 0 && a.value[0].type === h.Type.INTEGER ? s = a.value[0].value : a.value.length > 1 && (s = a.value[1].value), s !== null && (t.pathLenConstraint = h.derToInteger(s));
    } else if (t.name === "extKeyUsage")
      for (var a = h.fromDer(t.value), i = 0; i < a.value.length; ++i) {
        var o = h.derToOid(a.value[i].value);
        o in Z ? t[Z[o]] = !0 : t[o] = !0;
      }
    else if (t.name === "nsCertType") {
      var a = h.fromDer(t.value), r = 0;
      a.value.length > 1 && (r = a.value.charCodeAt(1)), t.client = (r & 128) === 128, t.server = (r & 64) === 64, t.email = (r & 32) === 32, t.objsign = (r & 16) === 16, t.reserved = (r & 8) === 8, t.sslCA = (r & 4) === 4, t.emailCA = (r & 2) === 2, t.objCA = (r & 1) === 1;
    } else if (t.name === "subjectAltName" || t.name === "issuerAltName") {
      t.altNames = [];
      for (var l, a = h.fromDer(t.value), u = 0; u < a.value.length; ++u) {
        l = a.value[u];
        var f = {
          type: l.type,
          value: l.value
        };
        switch (t.altNames.push(f), l.type) {
          case 1:
          case 2:
          case 6:
            break;
          case 7:
            f.ip = K.util.bytesToIP(l.value);
            break;
          case 8:
            f.oid = h.derToOid(l.value);
            break;
        }
      }
    } else if (t.name === "subjectKeyIdentifier") {
      var a = h.fromDer(t.value);
      t.subjectKeyIdentifier = K.util.bytesToHex(a.value);
    }
  }
  return t;
};
L.certificationRequestFromAsn1 = function(e, t) {
  var a = {}, r = [];
  if (!h.validate(e, jo, a, r)) {
    var n = new Error("Cannot read PKCS#10 certificate request. ASN.1 object is not a PKCS#10 CertificationRequest.");
    throw n.errors = r, n;
  }
  var s = h.derToOid(a.publicKeyOid);
  if (s !== L.oids.rsaEncryption)
    throw new Error("Cannot read public key. OID is not RSA.");
  var i = L.createCertificationRequest();
  if (i.version = a.csrVersion ? a.csrVersion.charCodeAt(0) : 0, i.signatureOid = K.asn1.derToOid(a.csrSignatureOid), i.signatureParameters = _r(
    i.signatureOid,
    a.csrSignatureParams,
    !0
  ), i.siginfo.algorithmOid = K.asn1.derToOid(a.csrSignatureOid), i.siginfo.parameters = _r(
    i.siginfo.algorithmOid,
    a.csrSignatureParams,
    !1
  ), i.signature = a.csrSignature, i.certificationRequestInfo = a.certificationRequestInfo, t) {
    i.md = Kr({
      signatureOid: i.signatureOid,
      type: "certification request"
    });
    var o = h.toDer(i.certificationRequestInfo);
    i.md.update(o.getBytes());
  }
  var l = K.md.sha1.create();
  return i.subject.getField = function(u) {
    return _t(i.subject, u);
  }, i.subject.addField = function(u) {
    et([u]), i.subject.attributes.push(u);
  }, i.subject.attributes = L.RDNAttributesAsArray(
    a.certificationRequestInfoSubject,
    l
  ), i.subject.hash = l.digest().toHex(), i.publicKey = L.publicKeyFromAsn1(a.subjectPublicKeyInfo), i.getAttribute = function(u) {
    return _t(i, u);
  }, i.addAttribute = function(u) {
    et([u]), i.attributes.push(u);
  }, i.attributes = L.CRIAttributesAsArray(
    a.certificationRequestInfoAttributes || []
  ), i;
};
L.createCertificationRequest = function() {
  var e = {};
  return e.version = 0, e.signatureOid = null, e.signature = null, e.siginfo = {}, e.siginfo.algorithmOid = null, e.subject = {}, e.subject.getField = function(t) {
    return _t(e.subject, t);
  }, e.subject.addField = function(t) {
    et([t]), e.subject.attributes.push(t);
  }, e.subject.attributes = [], e.subject.hash = null, e.publicKey = null, e.attributes = [], e.getAttribute = function(t) {
    return _t(e, t);
  }, e.addAttribute = function(t) {
    et([t]), e.attributes.push(t);
  }, e.md = null, e.setSubject = function(t) {
    et(t), e.subject.attributes = t, e.subject.hash = null;
  }, e.setAttributes = function(t) {
    et(t), e.attributes = t;
  }, e.sign = function(t, a) {
    e.md = a || K.md.sha1.create();
    var r = Z[e.md.algorithm + "WithRSAEncryption"];
    if (!r) {
      var n = new Error("Could not compute certification request digest. Unknown message digest algorithm OID.");
      throw n.algorithm = e.md.algorithm, n;
    }
    e.signatureOid = e.siginfo.algorithmOid = r, e.certificationRequestInfo = L.getCertificationRequestInfo(e);
    var s = h.toDer(e.certificationRequestInfo);
    e.md.update(s.getBytes()), e.signature = t.sign(e.md);
  }, e.verify = function() {
    var t = !1, a = e.md;
    if (a === null) {
      a = Kr({
        signatureOid: e.signatureOid,
        type: "certification request"
      });
      var r = e.certificationRequestInfo || L.getCertificationRequestInfo(e), n = h.toDer(r);
      a.update(n.getBytes());
    }
    return a !== null && (t = On({
      certificate: e,
      md: a,
      signature: e.signature
    })), t;
  }, e;
};
function Xt(e) {
  for (var t = h.create(
    h.Class.UNIVERSAL,
    h.Type.SEQUENCE,
    !0,
    []
  ), a, r, n = e.attributes, s = 0; s < n.length; ++s) {
    a = n[s];
    var i = a.value, o = h.Type.PRINTABLESTRING;
    "valueTagClass" in a && (o = a.valueTagClass, o === h.Type.UTF8 && (i = K.util.encodeUtf8(i))), r = h.create(h.Class.UNIVERSAL, h.Type.SET, !0, [
      h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
        // AttributeType
        h.create(
          h.Class.UNIVERSAL,
          h.Type.OID,
          !1,
          h.oidToDer(a.type).getBytes()
        ),
        // AttributeValue
        h.create(h.Class.UNIVERSAL, o, !1, i)
      ])
    ]), t.value.push(r);
  }
  return t;
}
function et(e) {
  for (var t, a = 0; a < e.length; ++a) {
    if (t = e[a], typeof t.name > "u" && (t.type && t.type in L.oids ? t.name = L.oids[t.type] : t.shortName && t.shortName in de && (t.name = L.oids[de[t.shortName]])), typeof t.type > "u")
      if (t.name && t.name in L.oids)
        t.type = L.oids[t.name];
      else {
        var r = new Error("Attribute type not specified.");
        throw r.attribute = t, r;
      }
    if (typeof t.shortName > "u" && t.name && t.name in de && (t.shortName = de[t.name]), t.type === Z.extensionRequest && (t.valueConstructed = !0, t.valueTagClass = h.Type.SEQUENCE, !t.value && t.extensions)) {
      t.value = [];
      for (var n = 0; n < t.extensions.length; ++n)
        t.value.push(L.certificateExtensionToAsn1(
          Fn(t.extensions[n])
        ));
    }
    if (typeof t.value > "u") {
      var r = new Error("Attribute value not specified.");
      throw r.attribute = t, r;
    }
  }
}
function Fn(e, t) {
  if (t = t || {}, typeof e.name > "u" && e.id && e.id in L.oids && (e.name = L.oids[e.id]), typeof e.id > "u")
    if (e.name && e.name in L.oids)
      e.id = L.oids[e.name];
    else {
      var a = new Error("Extension ID not specified.");
      throw a.extension = e, a;
    }
  if (typeof e.value < "u")
    return e;
  if (e.name === "keyUsage") {
    var r = 0, n = 0, s = 0;
    e.digitalSignature && (n |= 128, r = 7), e.nonRepudiation && (n |= 64, r = 6), e.keyEncipherment && (n |= 32, r = 5), e.dataEncipherment && (n |= 16, r = 4), e.keyAgreement && (n |= 8, r = 3), e.keyCertSign && (n |= 4, r = 2), e.cRLSign && (n |= 2, r = 1), e.encipherOnly && (n |= 1, r = 0), e.decipherOnly && (s |= 128, r = 7);
    var i = String.fromCharCode(r);
    s !== 0 ? i += String.fromCharCode(n) + String.fromCharCode(s) : n !== 0 && (i += String.fromCharCode(n)), e.value = h.create(
      h.Class.UNIVERSAL,
      h.Type.BITSTRING,
      !1,
      i
    );
  } else if (e.name === "basicConstraints")
    e.value = h.create(
      h.Class.UNIVERSAL,
      h.Type.SEQUENCE,
      !0,
      []
    ), e.cA && e.value.value.push(h.create(
      h.Class.UNIVERSAL,
      h.Type.BOOLEAN,
      !1,
      "ÿ"
    )), "pathLenConstraint" in e && e.value.value.push(h.create(
      h.Class.UNIVERSAL,
      h.Type.INTEGER,
      !1,
      h.integerToDer(e.pathLenConstraint).getBytes()
    ));
  else if (e.name === "extKeyUsage") {
    e.value = h.create(
      h.Class.UNIVERSAL,
      h.Type.SEQUENCE,
      !0,
      []
    );
    var o = e.value.value;
    for (var l in e)
      e[l] === !0 && (l in Z ? o.push(h.create(
        h.Class.UNIVERSAL,
        h.Type.OID,
        !1,
        h.oidToDer(Z[l]).getBytes()
      )) : l.indexOf(".") !== -1 && o.push(h.create(
        h.Class.UNIVERSAL,
        h.Type.OID,
        !1,
        h.oidToDer(l).getBytes()
      )));
  } else if (e.name === "nsCertType") {
    var r = 0, n = 0;
    e.client && (n |= 128, r = 7), e.server && (n |= 64, r = 6), e.email && (n |= 32, r = 5), e.objsign && (n |= 16, r = 4), e.reserved && (n |= 8, r = 3), e.sslCA && (n |= 4, r = 2), e.emailCA && (n |= 2, r = 1), e.objCA && (n |= 1, r = 0);
    var i = String.fromCharCode(r);
    n !== 0 && (i += String.fromCharCode(n)), e.value = h.create(
      h.Class.UNIVERSAL,
      h.Type.BITSTRING,
      !1,
      i
    );
  } else if (e.name === "subjectAltName" || e.name === "issuerAltName") {
    e.value = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, []);
    for (var u, f = 0; f < e.altNames.length; ++f) {
      u = e.altNames[f];
      var i = u.value;
      if (u.type === 7 && u.ip) {
        if (i = K.util.bytesFromIP(u.ip), i === null) {
          var a = new Error(
            'Extension "ip" value is not a valid IPv4 or IPv6 address.'
          );
          throw a.extension = e, a;
        }
      } else u.type === 8 && (u.oid ? i = h.oidToDer(h.oidToDer(u.oid)) : i = h.oidToDer(i));
      e.value.value.push(h.create(
        h.Class.CONTEXT_SPECIFIC,
        u.type,
        !1,
        i
      ));
    }
  } else if (e.name === "nsComment" && t.cert) {
    if (!/^[\x00-\x7F]*$/.test(e.comment) || e.comment.length < 1 || e.comment.length > 128)
      throw new Error('Invalid "nsComment" content.');
    e.value = h.create(
      h.Class.UNIVERSAL,
      h.Type.IA5STRING,
      !1,
      e.comment
    );
  } else if (e.name === "subjectKeyIdentifier" && t.cert) {
    var c = t.cert.generateSubjectKeyIdentifier();
    e.subjectKeyIdentifier = c.toHex(), e.value = h.create(
      h.Class.UNIVERSAL,
      h.Type.OCTETSTRING,
      !1,
      c.getBytes()
    );
  } else if (e.name === "authorityKeyIdentifier" && t.cert) {
    e.value = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, []);
    var o = e.value.value;
    if (e.keyIdentifier) {
      var v = e.keyIdentifier === !0 ? t.cert.generateSubjectKeyIdentifier().getBytes() : e.keyIdentifier;
      o.push(
        h.create(h.Class.CONTEXT_SPECIFIC, 0, !1, v)
      );
    }
    if (e.authorityCertIssuer) {
      var m = [
        h.create(h.Class.CONTEXT_SPECIFIC, 4, !0, [
          Xt(e.authorityCertIssuer === !0 ? t.cert.issuer : e.authorityCertIssuer)
        ])
      ];
      o.push(
        h.create(h.Class.CONTEXT_SPECIFIC, 1, !0, m)
      );
    }
    if (e.serialNumber) {
      var y = K.util.hexToBytes(e.serialNumber === !0 ? t.cert.serialNumber : e.serialNumber);
      o.push(
        h.create(h.Class.CONTEXT_SPECIFIC, 2, !1, y)
      );
    }
  } else if (e.name === "cRLDistributionPoints") {
    e.value = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, []);
    for (var o = e.value.value, x = h.create(
      h.Class.UNIVERSAL,
      h.Type.SEQUENCE,
      !0,
      []
    ), S = h.create(
      h.Class.CONTEXT_SPECIFIC,
      0,
      !0,
      []
    ), u, f = 0; f < e.altNames.length; ++f) {
      u = e.altNames[f];
      var i = u.value;
      if (u.type === 7 && u.ip) {
        if (i = K.util.bytesFromIP(u.ip), i === null) {
          var a = new Error(
            'Extension "ip" value is not a valid IPv4 or IPv6 address.'
          );
          throw a.extension = e, a;
        }
      } else u.type === 8 && (u.oid ? i = h.oidToDer(h.oidToDer(u.oid)) : i = h.oidToDer(i));
      S.value.push(h.create(
        h.Class.CONTEXT_SPECIFIC,
        u.type,
        !1,
        i
      ));
    }
    x.value.push(h.create(
      h.Class.CONTEXT_SPECIFIC,
      0,
      !0,
      [S]
    )), o.push(x);
  }
  if (typeof e.value > "u") {
    var a = new Error("Extension value not specified.");
    throw a.extension = e, a;
  }
  return e;
}
function Ia(e, t) {
  switch (e) {
    case Z["RSASSA-PSS"]:
      var a = [];
      return t.hash.algorithmOid !== void 0 && a.push(h.create(h.Class.CONTEXT_SPECIFIC, 0, !0, [
        h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
          h.create(
            h.Class.UNIVERSAL,
            h.Type.OID,
            !1,
            h.oidToDer(t.hash.algorithmOid).getBytes()
          ),
          h.create(h.Class.UNIVERSAL, h.Type.NULL, !1, "")
        ])
      ])), t.mgf.algorithmOid !== void 0 && a.push(h.create(h.Class.CONTEXT_SPECIFIC, 1, !0, [
        h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
          h.create(
            h.Class.UNIVERSAL,
            h.Type.OID,
            !1,
            h.oidToDer(t.mgf.algorithmOid).getBytes()
          ),
          h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
            h.create(
              h.Class.UNIVERSAL,
              h.Type.OID,
              !1,
              h.oidToDer(t.mgf.hash.algorithmOid).getBytes()
            ),
            h.create(h.Class.UNIVERSAL, h.Type.NULL, !1, "")
          ])
        ])
      ])), t.saltLength !== void 0 && a.push(h.create(h.Class.CONTEXT_SPECIFIC, 2, !0, [
        h.create(
          h.Class.UNIVERSAL,
          h.Type.INTEGER,
          !1,
          h.integerToDer(t.saltLength).getBytes()
        )
      ])), h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, a);
    default:
      return h.create(h.Class.UNIVERSAL, h.Type.NULL, !1, "");
  }
}
function Zo(e) {
  var t = h.create(h.Class.CONTEXT_SPECIFIC, 0, !0, []);
  if (e.attributes.length === 0)
    return t;
  for (var a = e.attributes, r = 0; r < a.length; ++r) {
    var n = a[r], s = n.value, i = h.Type.UTF8;
    "valueTagClass" in n && (i = n.valueTagClass), i === h.Type.UTF8 && (s = K.util.encodeUtf8(s));
    var o = !1;
    "valueConstructed" in n && (o = n.valueConstructed);
    var l = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
      // AttributeType
      h.create(
        h.Class.UNIVERSAL,
        h.Type.OID,
        !1,
        h.oidToDer(n.type).getBytes()
      ),
      h.create(h.Class.UNIVERSAL, h.Type.SET, !0, [
        // AttributeValue
        h.create(
          h.Class.UNIVERSAL,
          i,
          o,
          s
        )
      ])
    ]);
    t.value.push(l);
  }
  return t;
}
var Jo = /* @__PURE__ */ new Date("1950-01-01T00:00:00Z"), e0 = /* @__PURE__ */ new Date("2050-01-01T00:00:00Z");
function Za(e) {
  return e >= Jo && e < e0 ? h.create(
    h.Class.UNIVERSAL,
    h.Type.UTCTIME,
    !1,
    h.dateToUtcTime(e)
  ) : h.create(
    h.Class.UNIVERSAL,
    h.Type.GENERALIZEDTIME,
    !1,
    h.dateToGeneralizedTime(e)
  );
}
L.getTBSCertificate = function(e) {
  var t = Za(e.validity.notBefore), a = Za(e.validity.notAfter), r = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
    // version
    h.create(h.Class.CONTEXT_SPECIFIC, 0, !0, [
      // integer
      h.create(
        h.Class.UNIVERSAL,
        h.Type.INTEGER,
        !1,
        h.integerToDer(e.version).getBytes()
      )
    ]),
    // serialNumber
    h.create(
      h.Class.UNIVERSAL,
      h.Type.INTEGER,
      !1,
      K.util.hexToBytes(e.serialNumber)
    ),
    // signature
    h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
      // algorithm
      h.create(
        h.Class.UNIVERSAL,
        h.Type.OID,
        !1,
        h.oidToDer(e.siginfo.algorithmOid).getBytes()
      ),
      // parameters
      Ia(
        e.siginfo.algorithmOid,
        e.siginfo.parameters
      )
    ]),
    // issuer
    Xt(e.issuer),
    // validity
    h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
      t,
      a
    ]),
    // subject
    Xt(e.subject),
    // SubjectPublicKeyInfo
    L.publicKeyToAsn1(e.publicKey)
  ]);
  return e.issuer.uniqueId && r.value.push(
    h.create(h.Class.CONTEXT_SPECIFIC, 1, !0, [
      h.create(
        h.Class.UNIVERSAL,
        h.Type.BITSTRING,
        !1,
        // TODO: support arbitrary bit length ids
        "\0" + e.issuer.uniqueId
      )
    ])
  ), e.subject.uniqueId && r.value.push(
    h.create(h.Class.CONTEXT_SPECIFIC, 2, !0, [
      h.create(
        h.Class.UNIVERSAL,
        h.Type.BITSTRING,
        !1,
        // TODO: support arbitrary bit length ids
        "\0" + e.subject.uniqueId
      )
    ])
  ), e.extensions.length > 0 && r.value.push(L.certificateExtensionsToAsn1(e.extensions)), r;
};
L.getCertificationRequestInfo = function(e) {
  var t = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
    // version
    h.create(
      h.Class.UNIVERSAL,
      h.Type.INTEGER,
      !1,
      h.integerToDer(e.version).getBytes()
    ),
    // subject
    Xt(e.subject),
    // SubjectPublicKeyInfo
    L.publicKeyToAsn1(e.publicKey),
    // attributes
    Zo(e)
  ]);
  return t;
};
L.distinguishedNameToAsn1 = function(e) {
  return Xt(e);
};
L.certificateToAsn1 = function(e) {
  var t = e.tbsCertificate || L.getTBSCertificate(e);
  return h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
    // TBSCertificate
    t,
    // AlgorithmIdentifier (signature algorithm)
    h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
      // algorithm
      h.create(
        h.Class.UNIVERSAL,
        h.Type.OID,
        !1,
        h.oidToDer(e.signatureOid).getBytes()
      ),
      // parameters
      Ia(e.signatureOid, e.signatureParameters)
    ]),
    // SignatureValue
    h.create(
      h.Class.UNIVERSAL,
      h.Type.BITSTRING,
      !1,
      "\0" + e.signature
    )
  ]);
};
L.certificateExtensionsToAsn1 = function(e) {
  var t = h.create(h.Class.CONTEXT_SPECIFIC, 3, !0, []), a = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, []);
  t.value.push(a);
  for (var r = 0; r < e.length; ++r)
    a.value.push(L.certificateExtensionToAsn1(e[r]));
  return t;
};
L.certificateExtensionToAsn1 = function(e) {
  var t = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, []);
  t.value.push(h.create(
    h.Class.UNIVERSAL,
    h.Type.OID,
    !1,
    h.oidToDer(e.id).getBytes()
  )), e.critical && t.value.push(h.create(
    h.Class.UNIVERSAL,
    h.Type.BOOLEAN,
    !1,
    "ÿ"
  ));
  var a = e.value;
  return typeof e.value != "string" && (a = h.toDer(a).getBytes()), t.value.push(h.create(
    h.Class.UNIVERSAL,
    h.Type.OCTETSTRING,
    !1,
    a
  )), t;
};
L.certificationRequestToAsn1 = function(e) {
  var t = e.certificationRequestInfo || L.getCertificationRequestInfo(e);
  return h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
    // CertificationRequestInfo
    t,
    // AlgorithmIdentifier (signature algorithm)
    h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
      // algorithm
      h.create(
        h.Class.UNIVERSAL,
        h.Type.OID,
        !1,
        h.oidToDer(e.signatureOid).getBytes()
      ),
      // parameters
      Ia(e.signatureOid, e.signatureParameters)
    ]),
    // signature
    h.create(
      h.Class.UNIVERSAL,
      h.Type.BITSTRING,
      !1,
      "\0" + e.signature
    )
  ]);
};
L.createCaStore = function(e) {
  var t = {
    // stored certificates
    certs: {}
  };
  t.getIssuer = function(i) {
    var o = a(i.issuer);
    return o;
  }, t.addCertificate = function(i) {
    if (typeof i == "string" && (i = K.pki.certificateFromPem(i)), r(i.subject), !t.hasCertificate(i))
      if (i.subject.hash in t.certs) {
        var o = t.certs[i.subject.hash];
        K.util.isArray(o) || (o = [o]), o.push(i), t.certs[i.subject.hash] = o;
      } else
        t.certs[i.subject.hash] = i;
  }, t.hasCertificate = function(i) {
    typeof i == "string" && (i = K.pki.certificateFromPem(i));
    var o = a(i.subject);
    if (!o)
      return !1;
    K.util.isArray(o) || (o = [o]);
    for (var l = h.toDer(L.certificateToAsn1(i)).getBytes(), u = 0; u < o.length; ++u) {
      var f = h.toDer(L.certificateToAsn1(o[u])).getBytes();
      if (l === f)
        return !0;
    }
    return !1;
  }, t.listAllCertificates = function() {
    var i = [];
    for (var o in t.certs)
      if (t.certs.hasOwnProperty(o)) {
        var l = t.certs[o];
        if (!K.util.isArray(l))
          i.push(l);
        else
          for (var u = 0; u < l.length; ++u)
            i.push(l[u]);
      }
    return i;
  }, t.removeCertificate = function(i) {
    var o;
    if (typeof i == "string" && (i = K.pki.certificateFromPem(i)), r(i.subject), !t.hasCertificate(i))
      return null;
    var l = a(i.subject);
    if (!K.util.isArray(l))
      return o = t.certs[i.subject.hash], delete t.certs[i.subject.hash], o;
    for (var u = h.toDer(L.certificateToAsn1(i)).getBytes(), f = 0; f < l.length; ++f) {
      var c = h.toDer(L.certificateToAsn1(l[f])).getBytes();
      u === c && (o = l[f], l.splice(f, 1));
    }
    return l.length === 0 && delete t.certs[i.subject.hash], o;
  };
  function a(i) {
    return r(i), t.certs[i.hash] || null;
  }
  function r(i) {
    if (!i.hash) {
      var o = K.md.sha1.create();
      i.attributes = L.RDNAttributesAsArray(Xt(i), o), i.hash = o.digest().toHex();
    }
  }
  if (e)
    for (var n = 0; n < e.length; ++n) {
      var s = e[n];
      t.addCertificate(s);
    }
  return t;
};
L.certificateError = {
  bad_certificate: "forge.pki.BadCertificate",
  unsupported_certificate: "forge.pki.UnsupportedCertificate",
  certificate_revoked: "forge.pki.CertificateRevoked",
  certificate_expired: "forge.pki.CertificateExpired",
  certificate_unknown: "forge.pki.CertificateUnknown",
  unknown_ca: "forge.pki.UnknownCertificateAuthority"
};
L.verifyCertificateChain = function(e, t, a) {
  typeof a == "function" && (a = { verify: a }), a = a || {}, t = t.slice(0);
  var r = t.slice(0), n = a.validityCheckDate;
  typeof n > "u" && (n = /* @__PURE__ */ new Date());
  var s = !0, i = null, o = 0;
  do {
    var l = t.shift(), u = null, f = !1;
    if (n && (n < l.validity.notBefore || n > l.validity.notAfter) && (i = {
      message: "Certificate is not valid yet or has expired.",
      error: L.certificateError.certificate_expired,
      notBefore: l.validity.notBefore,
      notAfter: l.validity.notAfter,
      // TODO: we might want to reconsider renaming 'now' to
      // 'validityCheckDate' should this API be changed in the future.
      now: n
    }), i === null) {
      if (u = t[0] || e.getIssuer(l), u === null && l.isIssuer(l) && (f = !0, u = l), u) {
        var c = u;
        K.util.isArray(c) || (c = [c]);
        for (var v = !1; !v && c.length > 0; ) {
          u = c.shift();
          try {
            v = u.verify(l);
          } catch {
          }
        }
        v || (i = {
          message: "Certificate signature is invalid.",
          error: L.certificateError.bad_certificate
        });
      }
      i === null && (!u || f) && !e.hasCertificate(l) && (i = {
        message: "Certificate is not trusted.",
        error: L.certificateError.unknown_ca
      });
    }
    if (i === null && u && !l.isIssuer(u) && (i = {
      message: "Certificate issuer is invalid.",
      error: L.certificateError.bad_certificate
    }), i === null)
      for (var m = {
        keyUsage: !0,
        basicConstraints: !0
      }, y = 0; i === null && y < l.extensions.length; ++y) {
        var x = l.extensions[y];
        x.critical && !(x.name in m) && (i = {
          message: "Certificate has an unsupported critical extension.",
          error: L.certificateError.unsupported_certificate
        });
      }
    if (i === null && (!s || t.length === 0 && (!u || f))) {
      var S = l.getExtension("basicConstraints"), I = l.getExtension("keyUsage");
      if (I !== null && (!I.keyCertSign || S === null) && (i = {
        message: "Certificate keyUsage or basicConstraints conflict or indicate that the certificate is not a CA. If the certificate is the only one in the chain or isn't the first then the certificate must be a valid CA.",
        error: L.certificateError.bad_certificate
      }), i === null && S === null && (i = {
        message: "Certificate is missing basicConstraints extension and cannot be used as a CA.",
        error: L.certificateError.bad_certificate
      }), i === null && S !== null && !S.cA && (i = {
        message: "Certificate basicConstraints indicates the certificate is not a CA.",
        error: L.certificateError.bad_certificate
      }), i === null && I !== null && "pathLenConstraint" in S) {
        var b = o - 1;
        b > S.pathLenConstraint && (i = {
          message: "Certificate basicConstraints pathLenConstraint violated.",
          error: L.certificateError.bad_certificate
        });
      }
    }
    var _ = i === null ? !0 : i.error, V = a.verify ? a.verify(_, o, r) : _;
    if (V === !0)
      i = null;
    else
      throw _ === !0 && (i = {
        message: "The application rejected the certificate.",
        error: L.certificateError.bad_certificate
      }), (V || V === 0) && (typeof V == "object" && !K.util.isArray(V) ? (V.message && (i.message = V.message), V.error && (i.error = V.error)) : typeof V == "string" && (i.error = V)), i;
    s = !1, ++o;
  } while (t.length > 0);
  return !0;
};
var oe = z, g = oe.asn1, $ = oe.pki, fr = oe.pkcs12 = oe.pkcs12 || {}, Kn = {
  name: "ContentInfo",
  tagClass: g.Class.UNIVERSAL,
  type: g.Type.SEQUENCE,
  // a ContentInfo
  constructed: !0,
  value: [{
    name: "ContentInfo.contentType",
    tagClass: g.Class.UNIVERSAL,
    type: g.Type.OID,
    constructed: !1,
    capture: "contentType"
  }, {
    name: "ContentInfo.content",
    tagClass: g.Class.CONTEXT_SPECIFIC,
    constructed: !0,
    captureAsn1: "content"
  }]
}, t0 = {
  name: "PFX",
  tagClass: g.Class.UNIVERSAL,
  type: g.Type.SEQUENCE,
  constructed: !0,
  value: [
    {
      name: "PFX.version",
      tagClass: g.Class.UNIVERSAL,
      type: g.Type.INTEGER,
      constructed: !1,
      capture: "version"
    },
    Kn,
    {
      name: "PFX.macData",
      tagClass: g.Class.UNIVERSAL,
      type: g.Type.SEQUENCE,
      constructed: !0,
      optional: !0,
      captureAsn1: "mac",
      value: [{
        name: "PFX.macData.mac",
        tagClass: g.Class.UNIVERSAL,
        type: g.Type.SEQUENCE,
        // DigestInfo
        constructed: !0,
        value: [{
          name: "PFX.macData.mac.digestAlgorithm",
          tagClass: g.Class.UNIVERSAL,
          type: g.Type.SEQUENCE,
          // DigestAlgorithmIdentifier
          constructed: !0,
          value: [{
            name: "PFX.macData.mac.digestAlgorithm.algorithm",
            tagClass: g.Class.UNIVERSAL,
            type: g.Type.OID,
            constructed: !1,
            capture: "macAlgorithm"
          }, {
            name: "PFX.macData.mac.digestAlgorithm.parameters",
            optional: !0,
            tagClass: g.Class.UNIVERSAL,
            captureAsn1: "macAlgorithmParameters"
          }]
        }, {
          name: "PFX.macData.mac.digest",
          tagClass: g.Class.UNIVERSAL,
          type: g.Type.OCTETSTRING,
          constructed: !1,
          capture: "macDigest"
        }]
      }, {
        name: "PFX.macData.macSalt",
        tagClass: g.Class.UNIVERSAL,
        type: g.Type.OCTETSTRING,
        constructed: !1,
        capture: "macSalt"
      }, {
        name: "PFX.macData.iterations",
        tagClass: g.Class.UNIVERSAL,
        type: g.Type.INTEGER,
        constructed: !1,
        optional: !0,
        capture: "macIterations"
      }]
    }
  ]
}, r0 = {
  name: "SafeBag",
  tagClass: g.Class.UNIVERSAL,
  type: g.Type.SEQUENCE,
  constructed: !0,
  value: [{
    name: "SafeBag.bagId",
    tagClass: g.Class.UNIVERSAL,
    type: g.Type.OID,
    constructed: !1,
    capture: "bagId"
  }, {
    name: "SafeBag.bagValue",
    tagClass: g.Class.CONTEXT_SPECIFIC,
    constructed: !0,
    captureAsn1: "bagValue"
  }, {
    name: "SafeBag.bagAttributes",
    tagClass: g.Class.UNIVERSAL,
    type: g.Type.SET,
    constructed: !0,
    optional: !0,
    capture: "bagAttributes"
  }]
}, a0 = {
  name: "Attribute",
  tagClass: g.Class.UNIVERSAL,
  type: g.Type.SEQUENCE,
  constructed: !0,
  value: [{
    name: "Attribute.attrId",
    tagClass: g.Class.UNIVERSAL,
    type: g.Type.OID,
    constructed: !1,
    capture: "oid"
  }, {
    name: "Attribute.attrValues",
    tagClass: g.Class.UNIVERSAL,
    type: g.Type.SET,
    constructed: !0,
    capture: "values"
  }]
}, n0 = {
  name: "CertBag",
  tagClass: g.Class.UNIVERSAL,
  type: g.Type.SEQUENCE,
  constructed: !0,
  value: [{
    name: "CertBag.certId",
    tagClass: g.Class.UNIVERSAL,
    type: g.Type.OID,
    constructed: !1,
    capture: "certId"
  }, {
    name: "CertBag.certValue",
    tagClass: g.Class.CONTEXT_SPECIFIC,
    constructed: !0,
    /* So far we only support X.509 certificates (which are wrapped in
       an OCTET STRING, hence hard code that here). */
    value: [{
      name: "CertBag.certValue[0]",
      tagClass: g.Class.UNIVERSAL,
      type: g.Class.OCTETSTRING,
      constructed: !1,
      capture: "cert"
    }]
  }]
};
function rr(e, t, a, r) {
  for (var n = [], s = 0; s < e.length; s++)
    for (var i = 0; i < e[s].safeBags.length; i++) {
      var o = e[s].safeBags[i];
      if (!(r !== void 0 && o.type !== r)) {
        if (t === null) {
          n.push(o);
          continue;
        }
        o.attributes[t] !== void 0 && o.attributes[t].indexOf(a) >= 0 && n.push(o);
      }
    }
  return n;
}
fr.pkcs12FromAsn1 = function(e, t, a) {
  typeof t == "string" ? (a = t, t = !0) : t === void 0 && (t = !0);
  var r = {}, n = [];
  if (!g.validate(e, t0, r, n)) {
    var s = new Error("Cannot read PKCS#12 PFX. ASN.1 object is not an PKCS#12 PFX.");
    throw s.errors = s, s;
  }
  var i = {
    version: r.version.charCodeAt(0),
    safeContents: [],
    /**
     * Gets bags with matching attributes.
     *
     * @param filter the attributes to filter by:
     *          [localKeyId] the localKeyId to search for.
     *          [localKeyIdHex] the localKeyId in hex to search for.
     *          [friendlyName] the friendly name to search for.
     *          [bagType] bag type to narrow each attribute search by.
     *
     * @return a map of attribute type to an array of matching bags or, if no
     *           attribute was given but a bag type, the map key will be the
     *           bag type.
     */
    getBags: function(S) {
      var I = {}, b;
      return "localKeyId" in S ? b = S.localKeyId : "localKeyIdHex" in S && (b = oe.util.hexToBytes(S.localKeyIdHex)), b === void 0 && !("friendlyName" in S) && "bagType" in S && (I[S.bagType] = rr(
        i.safeContents,
        null,
        null,
        S.bagType
      )), b !== void 0 && (I.localKeyId = rr(
        i.safeContents,
        "localKeyId",
        b,
        S.bagType
      )), "friendlyName" in S && (I.friendlyName = rr(
        i.safeContents,
        "friendlyName",
        S.friendlyName,
        S.bagType
      )), I;
    },
    /**
     * DEPRECATED: use getBags() instead.
     *
     * Get bags with matching friendlyName attribute.
     *
     * @param friendlyName the friendly name to search for.
     * @param [bagType] bag type to narrow search by.
     *
     * @return an array of bags with matching friendlyName attribute.
     */
    getBagsByFriendlyName: function(S, I) {
      return rr(
        i.safeContents,
        "friendlyName",
        S,
        I
      );
    },
    /**
     * DEPRECATED: use getBags() instead.
     *
     * Get bags with matching localKeyId attribute.
     *
     * @param localKeyId the localKeyId to search for.
     * @param [bagType] bag type to narrow search by.
     *
     * @return an array of bags with matching localKeyId attribute.
     */
    getBagsByLocalKeyId: function(S, I) {
      return rr(
        i.safeContents,
        "localKeyId",
        S,
        I
      );
    }
  };
  if (r.version.charCodeAt(0) !== 3) {
    var s = new Error("PKCS#12 PFX of version other than 3 not supported.");
    throw s.version = r.version.charCodeAt(0), s;
  }
  if (g.derToOid(r.contentType) !== $.oids.data) {
    var s = new Error("Only PKCS#12 PFX in password integrity mode supported.");
    throw s.oid = g.derToOid(r.contentType), s;
  }
  var o = r.content.value[0];
  if (o.tagClass !== g.Class.UNIVERSAL || o.type !== g.Type.OCTETSTRING)
    throw new Error("PKCS#12 authSafe content data is not an OCTET STRING.");
  if (o = Aa(o), r.mac) {
    var l = null, u = 0, f = g.derToOid(r.macAlgorithm);
    switch (f) {
      case $.oids.sha1:
        l = oe.md.sha1.create(), u = 20;
        break;
      case $.oids.sha256:
        l = oe.md.sha256.create(), u = 32;
        break;
      case $.oids.sha384:
        l = oe.md.sha384.create(), u = 48;
        break;
      case $.oids.sha512:
        l = oe.md.sha512.create(), u = 64;
        break;
      case $.oids.md5:
        l = oe.md.md5.create(), u = 16;
        break;
    }
    if (l === null)
      throw new Error("PKCS#12 uses unsupported MAC algorithm: " + f);
    var c = new oe.util.ByteBuffer(r.macSalt), v = "macIterations" in r ? parseInt(oe.util.bytesToHex(r.macIterations), 16) : 1, m = fr.generateKey(
      a,
      c,
      3,
      v,
      u,
      l
    ), y = oe.hmac.create();
    y.start(l, m), y.update(o.value);
    var x = y.getMac();
    if (x.getBytes() !== r.macDigest)
      throw new Error("PKCS#12 MAC could not be verified. Invalid password?");
  } else if (Array.isArray(e.value) && e.value.length > 2)
    throw new Error("Invalid PKCS#12. macData field present but MAC was not validated.");
  return i0(i, o.value, t, a), i;
};
function Aa(e) {
  if (e.composed || e.constructed) {
    for (var t = oe.util.createBuffer(), a = 0; a < e.value.length; ++a)
      t.putBytes(e.value[a].value);
    e.composed = e.constructed = !1, e.value = t.getBytes();
  }
  return e;
}
function i0(e, t, a, r) {
  if (t = g.fromDer(t, a), t.tagClass !== g.Class.UNIVERSAL || t.type !== g.Type.SEQUENCE || t.constructed !== !0)
    throw new Error("PKCS#12 AuthenticatedSafe expected to be a SEQUENCE OF ContentInfo");
  for (var n = 0; n < t.value.length; n++) {
    var s = t.value[n], i = {}, o = [];
    if (!g.validate(s, Kn, i, o)) {
      var l = new Error("Cannot read ContentInfo.");
      throw l.errors = o, l;
    }
    var u = {
      encrypted: !1
    }, f = null, c = i.content.value[0];
    switch (g.derToOid(i.contentType)) {
      case $.oids.data:
        if (c.tagClass !== g.Class.UNIVERSAL || c.type !== g.Type.OCTETSTRING)
          throw new Error("PKCS#12 SafeContents Data is not an OCTET STRING.");
        f = Aa(c).value;
        break;
      case $.oids.encryptedData:
        f = s0(c, r), u.encrypted = !0;
        break;
      default:
        var l = new Error("Unsupported PKCS#12 contentType.");
        throw l.contentType = g.derToOid(i.contentType), l;
    }
    u.safeBags = o0(f, a, r), e.safeContents.push(u);
  }
}
function s0(e, t) {
  var a = {}, r = [];
  if (!g.validate(
    e,
    oe.pkcs7.asn1.encryptedDataValidator,
    a,
    r
  )) {
    var n = new Error("Cannot read EncryptedContentInfo.");
    throw n.errors = r, n;
  }
  var s = g.derToOid(a.contentType);
  if (s !== $.oids.data) {
    var n = new Error(
      "PKCS#12 EncryptedContentInfo ContentType is not Data."
    );
    throw n.oid = s, n;
  }
  s = g.derToOid(a.encAlgorithm);
  var i = $.pbe.getCipher(s, a.encParameter, t), o = Aa(a.encryptedContentAsn1), l = oe.util.createBuffer(o.value);
  if (i.update(l), !i.finish())
    throw new Error("Failed to decrypt PKCS#12 SafeContents.");
  return i.output.getBytes();
}
function o0(e, t, a) {
  if (!t && e.length === 0)
    return [];
  if (e = g.fromDer(e, t), e.tagClass !== g.Class.UNIVERSAL || e.type !== g.Type.SEQUENCE || e.constructed !== !0)
    throw new Error(
      "PKCS#12 SafeContents expected to be a SEQUENCE OF SafeBag."
    );
  for (var r = [], n = 0; n < e.value.length; n++) {
    var s = e.value[n], i = {}, o = [];
    if (!g.validate(s, r0, i, o)) {
      var l = new Error("Cannot read SafeBag.");
      throw l.errors = o, l;
    }
    var u = {
      type: g.derToOid(i.bagId),
      attributes: u0(i.bagAttributes)
    };
    r.push(u);
    var f, c, v = i.bagValue.value[0];
    switch (u.type) {
      case $.oids.pkcs8ShroudedKeyBag:
        if (v = $.decryptPrivateKeyInfo(v, a), v === null)
          throw new Error(
            "Unable to decrypt PKCS#8 ShroudedKeyBag, wrong password?"
          );
      case $.oids.keyBag:
        try {
          u.key = $.privateKeyFromAsn1(v);
        } catch {
          u.key = null, u.asn1 = v;
        }
        continue;
      case $.oids.certBag:
        f = n0, c = function() {
          if (g.derToOid(i.certId) !== $.oids.x509Certificate) {
            var y = new Error(
              "Unsupported certificate type, only X.509 supported."
            );
            throw y.oid = g.derToOid(i.certId), y;
          }
          var x = g.fromDer(i.cert, t);
          try {
            u.cert = $.certificateFromAsn1(x, !0);
          } catch {
            u.cert = null, u.asn1 = x;
          }
        };
        break;
      default:
        var l = new Error("Unsupported PKCS#12 SafeBag type.");
        throw l.oid = u.type, l;
    }
    if (f !== void 0 && !g.validate(v, f, i, o)) {
      var l = new Error("Cannot read PKCS#12 " + f.name);
      throw l.errors = o, l;
    }
    c();
  }
  return r;
}
function u0(e) {
  var t = {};
  if (e !== void 0)
    for (var a = 0; a < e.length; ++a) {
      var r = {}, n = [];
      if (!g.validate(e[a], a0, r, n)) {
        var s = new Error("Cannot read PKCS#12 BagAttribute.");
        throw s.errors = n, s;
      }
      var i = g.derToOid(r.oid);
      if ($.oids[i] !== void 0) {
        t[$.oids[i]] = [];
        for (var o = 0; o < r.values.length; ++o)
          t[$.oids[i]].push(r.values[o].value);
      }
    }
  return t;
}
fr.toPkcs12Asn1 = function(e, t, a, r) {
  r = r || {}, r.saltSize = r.saltSize || 8, r.count = r.count || 2048, r.algorithm = r.algorithm || r.encAlgorithm || "aes128", "useMac" in r || (r.useMac = !0), "localKeyId" in r || (r.localKeyId = null), "generateLocalKeyId" in r || (r.generateLocalKeyId = !0);
  var n = r.localKeyId, s;
  if (n !== null)
    n = oe.util.hexToBytes(n);
  else if (r.generateLocalKeyId)
    if (t) {
      var i = oe.util.isArray(t) ? t[0] : t;
      typeof i == "string" && (i = $.certificateFromPem(i));
      var o = oe.md.sha1.create();
      o.update(g.toDer($.certificateToAsn1(i)).getBytes()), n = o.digest().getBytes();
    } else
      n = oe.random.getBytes(20);
  var l = [];
  n !== null && l.push(
    // localKeyID
    g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
      // attrId
      g.create(
        g.Class.UNIVERSAL,
        g.Type.OID,
        !1,
        g.oidToDer($.oids.localKeyId).getBytes()
      ),
      // attrValues
      g.create(g.Class.UNIVERSAL, g.Type.SET, !0, [
        g.create(
          g.Class.UNIVERSAL,
          g.Type.OCTETSTRING,
          !1,
          n
        )
      ])
    ])
  ), "friendlyName" in r && l.push(
    // friendlyName
    g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
      // attrId
      g.create(
        g.Class.UNIVERSAL,
        g.Type.OID,
        !1,
        g.oidToDer($.oids.friendlyName).getBytes()
      ),
      // attrValues
      g.create(g.Class.UNIVERSAL, g.Type.SET, !0, [
        g.create(
          g.Class.UNIVERSAL,
          g.Type.BMPSTRING,
          !1,
          r.friendlyName
        )
      ])
    ])
  ), l.length > 0 && (s = g.create(g.Class.UNIVERSAL, g.Type.SET, !0, l));
  var u = [], f = [];
  t !== null && (oe.util.isArray(t) ? f = t : f = [t]);
  for (var c = [], v = 0; v < f.length; ++v) {
    t = f[v], typeof t == "string" && (t = $.certificateFromPem(t));
    var m = v === 0 ? s : void 0, y = $.certificateToAsn1(t), x = g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
      // bagId
      g.create(
        g.Class.UNIVERSAL,
        g.Type.OID,
        !1,
        g.oidToDer($.oids.certBag).getBytes()
      ),
      // bagValue
      g.create(g.Class.CONTEXT_SPECIFIC, 0, !0, [
        // CertBag
        g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
          // certId
          g.create(
            g.Class.UNIVERSAL,
            g.Type.OID,
            !1,
            g.oidToDer($.oids.x509Certificate).getBytes()
          ),
          // certValue (x509Certificate)
          g.create(g.Class.CONTEXT_SPECIFIC, 0, !0, [
            g.create(
              g.Class.UNIVERSAL,
              g.Type.OCTETSTRING,
              !1,
              g.toDer(y).getBytes()
            )
          ])
        ])
      ]),
      // bagAttributes (OPTIONAL)
      m
    ]);
    c.push(x);
  }
  if (c.length > 0) {
    var S = g.create(
      g.Class.UNIVERSAL,
      g.Type.SEQUENCE,
      !0,
      c
    ), I = (
      // PKCS#7 ContentInfo
      g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
        // contentType
        g.create(
          g.Class.UNIVERSAL,
          g.Type.OID,
          !1,
          // OID for the content type is 'data'
          g.oidToDer($.oids.data).getBytes()
        ),
        // content
        g.create(g.Class.CONTEXT_SPECIFIC, 0, !0, [
          g.create(
            g.Class.UNIVERSAL,
            g.Type.OCTETSTRING,
            !1,
            g.toDer(S).getBytes()
          )
        ])
      ])
    );
    u.push(I);
  }
  var b = null;
  if (e !== null) {
    var _ = $.wrapRsaPrivateKey($.privateKeyToAsn1(e));
    a === null ? b = g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
      // bagId
      g.create(
        g.Class.UNIVERSAL,
        g.Type.OID,
        !1,
        g.oidToDer($.oids.keyBag).getBytes()
      ),
      // bagValue
      g.create(g.Class.CONTEXT_SPECIFIC, 0, !0, [
        // PrivateKeyInfo
        _
      ]),
      // bagAttributes (OPTIONAL)
      s
    ]) : b = g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
      // bagId
      g.create(
        g.Class.UNIVERSAL,
        g.Type.OID,
        !1,
        g.oidToDer($.oids.pkcs8ShroudedKeyBag).getBytes()
      ),
      // bagValue
      g.create(g.Class.CONTEXT_SPECIFIC, 0, !0, [
        // EncryptedPrivateKeyInfo
        $.encryptPrivateKeyInfo(_, a, r)
      ]),
      // bagAttributes (OPTIONAL)
      s
    ]);
    var V = g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [b]), k = (
      // PKCS#7 ContentInfo
      g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
        // contentType
        g.create(
          g.Class.UNIVERSAL,
          g.Type.OID,
          !1,
          // OID for the content type is 'data'
          g.oidToDer($.oids.data).getBytes()
        ),
        // content
        g.create(g.Class.CONTEXT_SPECIFIC, 0, !0, [
          g.create(
            g.Class.UNIVERSAL,
            g.Type.OCTETSTRING,
            !1,
            g.toDer(V).getBytes()
          )
        ])
      ])
    );
    u.push(k);
  }
  var w = g.create(
    g.Class.UNIVERSAL,
    g.Type.SEQUENCE,
    !0,
    u
  ), G;
  if (r.useMac) {
    var o = oe.md.sha1.create(), Y = new oe.util.ByteBuffer(
      oe.random.getBytes(r.saltSize)
    ), re = r.count, e = fr.generateKey(a, Y, 3, re, 20), ae = oe.hmac.create();
    ae.start(o, e), ae.update(g.toDer(w).getBytes());
    var ne = ae.getMac();
    G = g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
      // mac DigestInfo
      g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
        // digestAlgorithm
        g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
          // algorithm = SHA-1
          g.create(
            g.Class.UNIVERSAL,
            g.Type.OID,
            !1,
            g.oidToDer($.oids.sha1).getBytes()
          ),
          // parameters = Null
          g.create(g.Class.UNIVERSAL, g.Type.NULL, !1, "")
        ]),
        // digest
        g.create(
          g.Class.UNIVERSAL,
          g.Type.OCTETSTRING,
          !1,
          ne.getBytes()
        )
      ]),
      // macSalt OCTET STRING
      g.create(
        g.Class.UNIVERSAL,
        g.Type.OCTETSTRING,
        !1,
        Y.getBytes()
      ),
      // iterations INTEGER (XXX: Only support count < 65536)
      g.create(
        g.Class.UNIVERSAL,
        g.Type.INTEGER,
        !1,
        g.integerToDer(re).getBytes()
      )
    ]);
  }
  return g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
    // version (3)
    g.create(
      g.Class.UNIVERSAL,
      g.Type.INTEGER,
      !1,
      g.integerToDer(3).getBytes()
    ),
    // PKCS#7 ContentInfo
    g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
      // contentType
      g.create(
        g.Class.UNIVERSAL,
        g.Type.OID,
        !1,
        // OID for the content type is 'data'
        g.oidToDer($.oids.data).getBytes()
      ),
      // content
      g.create(g.Class.CONTEXT_SPECIFIC, 0, !0, [
        g.create(
          g.Class.UNIVERSAL,
          g.Type.OCTETSTRING,
          !1,
          g.toDer(w).getBytes()
        )
      ])
    ]),
    G
  ]);
};
fr.generateKey = oe.pbe.generatePkcs12Key;
var Nt = z, Ba = Nt.asn1, jt = Nt.pki = Nt.pki || {};
jt.pemToDer = function(e) {
  var t = Nt.pem.decode(e)[0];
  if (t.procType && t.procType.type === "ENCRYPTED")
    throw new Error("Could not convert PEM to DER; PEM is encrypted.");
  return Nt.util.createBuffer(t.body);
};
jt.privateKeyFromPem = function(e) {
  var t = Nt.pem.decode(e)[0];
  if (t.type !== "PRIVATE KEY" && t.type !== "RSA PRIVATE KEY") {
    var a = new Error('Could not convert private key from PEM; PEM header type is not "PRIVATE KEY" or "RSA PRIVATE KEY".');
    throw a.headerType = t.type, a;
  }
  if (t.procType && t.procType.type === "ENCRYPTED")
    throw new Error("Could not convert private key from PEM; PEM is encrypted.");
  var r = Ba.fromDer(t.body);
  return jt.privateKeyFromAsn1(r);
};
jt.privateKeyToPem = function(e, t) {
  var a = {
    type: "RSA PRIVATE KEY",
    body: Ba.toDer(jt.privateKeyToAsn1(e)).getBytes()
  };
  return Nt.pem.encode(a, { maxline: t });
};
jt.privateKeyInfoToPem = function(e, t) {
  var a = {
    type: "PRIVATE KEY",
    body: Ba.toDer(e).getBytes()
  };
  return Nt.pem.encode(a, { maxline: t });
};
var N = z, Mr = function(e, t, a, r) {
  var n = N.util.createBuffer(), s = e.length >> 1, i = s + (e.length & 1), o = e.substr(0, i), l = e.substr(s, i), u = N.util.createBuffer(), f = N.hmac.create();
  a = t + a;
  var c = Math.ceil(r / 16), v = Math.ceil(r / 20);
  f.start("MD5", o);
  var m = N.util.createBuffer();
  u.putBytes(a);
  for (var y = 0; y < c; ++y)
    f.start(null, null), f.update(u.getBytes()), u.putBuffer(f.digest()), f.start(null, null), f.update(u.bytes() + a), m.putBuffer(f.digest());
  f.start("SHA1", l);
  var x = N.util.createBuffer();
  u.clear(), u.putBytes(a);
  for (var y = 0; y < v; ++y)
    f.start(null, null), f.update(u.getBytes()), u.putBuffer(f.digest()), f.start(null, null), f.update(u.bytes() + a), x.putBuffer(f.digest());
  return n.putBytes(N.util.xorBytes(
    m.getBytes(),
    x.getBytes(),
    r
  )), n;
}, l0 = function(e, t, a) {
  var r = N.hmac.create();
  r.start("SHA1", e);
  var n = N.util.createBuffer();
  return n.putInt32(t[0]), n.putInt32(t[1]), n.putByte(a.type), n.putByte(a.version.major), n.putByte(a.version.minor), n.putInt16(a.length), n.putBytes(a.fragment.bytes()), r.update(n.getBytes()), r.digest().getBytes();
}, f0 = function(e, t, a) {
  var r = !1;
  try {
    var n = e.deflate(t.fragment.getBytes());
    t.fragment = N.util.createBuffer(n), t.length = n.length, r = !0;
  } catch {
  }
  return r;
}, c0 = function(e, t, a) {
  var r = !1;
  try {
    var n = e.inflate(t.fragment.getBytes());
    t.fragment = N.util.createBuffer(n), t.length = n.length, r = !0;
  } catch {
  }
  return r;
}, $e = function(e, t) {
  var a = 0;
  switch (t) {
    case 1:
      a = e.getByte();
      break;
    case 2:
      a = e.getInt16();
      break;
    case 3:
      a = e.getInt24();
      break;
    case 4:
      a = e.getInt32();
      break;
  }
  return N.util.createBuffer(e.getBytes(a));
}, je = function(e, t, a) {
  e.putInt(a.length(), t << 3), e.putBuffer(a);
}, p = {};
p.Versions = {
  TLS_1_0: { major: 3, minor: 1 },
  TLS_1_1: { major: 3, minor: 2 },
  TLS_1_2: { major: 3, minor: 3 }
};
p.SupportedVersions = [
  p.Versions.TLS_1_1,
  p.Versions.TLS_1_0
];
p.Version = p.SupportedVersions[0];
p.MaxFragment = 15360;
p.ConnectionEnd = {
  server: 0,
  client: 1
};
p.PRFAlgorithm = {
  tls_prf_sha256: 0
};
p.BulkCipherAlgorithm = {
  none: null,
  rc4: 0,
  des3: 1,
  aes: 2
};
p.CipherType = {
  stream: 0,
  block: 1,
  aead: 2
};
p.MACAlgorithm = {
  none: null,
  hmac_md5: 0,
  hmac_sha1: 1,
  hmac_sha256: 2,
  hmac_sha384: 3,
  hmac_sha512: 4
};
p.CompressionMethod = {
  none: 0,
  deflate: 1
};
p.ContentType = {
  change_cipher_spec: 20,
  alert: 21,
  handshake: 22,
  application_data: 23,
  heartbeat: 24
};
p.HandshakeType = {
  hello_request: 0,
  client_hello: 1,
  server_hello: 2,
  certificate: 11,
  server_key_exchange: 12,
  certificate_request: 13,
  server_hello_done: 14,
  certificate_verify: 15,
  client_key_exchange: 16,
  finished: 20
};
p.Alert = {};
p.Alert.Level = {
  warning: 1,
  fatal: 2
};
p.Alert.Description = {
  close_notify: 0,
  unexpected_message: 10,
  bad_record_mac: 20,
  decryption_failed: 21,
  record_overflow: 22,
  decompression_failure: 30,
  handshake_failure: 40,
  bad_certificate: 42,
  unsupported_certificate: 43,
  certificate_revoked: 44,
  certificate_expired: 45,
  certificate_unknown: 46,
  illegal_parameter: 47,
  unknown_ca: 48,
  access_denied: 49,
  decode_error: 50,
  decrypt_error: 51,
  export_restriction: 60,
  protocol_version: 70,
  insufficient_security: 71,
  internal_error: 80,
  user_canceled: 90,
  no_renegotiation: 100
};
p.HeartbeatMessageType = {
  heartbeat_request: 1,
  heartbeat_response: 2
};
p.CipherSuites = {};
p.getCipherSuite = function(e) {
  var t = null;
  for (var a in p.CipherSuites) {
    var r = p.CipherSuites[a];
    if (r.id[0] === e.charCodeAt(0) && r.id[1] === e.charCodeAt(1)) {
      t = r;
      break;
    }
  }
  return t;
};
p.handleUnexpected = function(e, t) {
  var a = !e.open && e.entity === p.ConnectionEnd.client;
  a || e.error(e, {
    message: "Unexpected message. Received TLS record out of order.",
    send: !0,
    alert: {
      level: p.Alert.Level.fatal,
      description: p.Alert.Description.unexpected_message
    }
  });
};
p.handleHelloRequest = function(e, t, a) {
  !e.handshaking && e.handshakes > 0 && (p.queue(e, p.createAlert(e, {
    level: p.Alert.Level.warning,
    description: p.Alert.Description.no_renegotiation
  })), p.flush(e)), e.process();
};
p.parseHelloMessage = function(e, t, a) {
  var r = null, n = e.entity === p.ConnectionEnd.client;
  if (a < 38)
    e.error(e, {
      message: n ? "Invalid ServerHello message. Message too short." : "Invalid ClientHello message. Message too short.",
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.illegal_parameter
      }
    });
  else {
    var s = t.fragment, i = s.length();
    if (r = {
      version: {
        major: s.getByte(),
        minor: s.getByte()
      },
      random: N.util.createBuffer(s.getBytes(32)),
      session_id: $e(s, 1),
      extensions: []
    }, n ? (r.cipher_suite = s.getBytes(2), r.compression_method = s.getByte()) : (r.cipher_suites = $e(s, 2), r.compression_methods = $e(s, 1)), i = a - (i - s.length()), i > 0) {
      for (var o = $e(s, 2); o.length() > 0; )
        r.extensions.push({
          type: [o.getByte(), o.getByte()],
          data: $e(o, 2)
        });
      if (!n)
        for (var l = 0; l < r.extensions.length; ++l) {
          var u = r.extensions[l];
          if (u.type[0] === 0 && u.type[1] === 0)
            for (var f = $e(u.data, 2); f.length() > 0; ) {
              var c = f.getByte();
              if (c !== 0)
                break;
              e.session.extensions.server_name.serverNameList.push(
                $e(f, 2).getBytes()
              );
            }
        }
    }
    if (e.session.version && (r.version.major !== e.session.version.major || r.version.minor !== e.session.version.minor))
      return e.error(e, {
        message: "TLS version change is disallowed during renegotiation.",
        send: !0,
        alert: {
          level: p.Alert.Level.fatal,
          description: p.Alert.Description.protocol_version
        }
      });
    if (n)
      e.session.cipherSuite = p.getCipherSuite(r.cipher_suite);
    else
      for (var v = N.util.createBuffer(r.cipher_suites.bytes()); v.length() > 0 && (e.session.cipherSuite = p.getCipherSuite(v.getBytes(2)), e.session.cipherSuite === null); )
        ;
    if (e.session.cipherSuite === null)
      return e.error(e, {
        message: "No cipher suites in common.",
        send: !0,
        alert: {
          level: p.Alert.Level.fatal,
          description: p.Alert.Description.handshake_failure
        },
        cipherSuite: N.util.bytesToHex(r.cipher_suite)
      });
    n ? e.session.compressionMethod = r.compression_method : e.session.compressionMethod = p.CompressionMethod.none;
  }
  return r;
};
p.createSecurityParameters = function(e, t) {
  var a = e.entity === p.ConnectionEnd.client, r = t.random.bytes(), n = a ? e.session.sp.client_random : r, s = a ? r : p.createRandom().getBytes();
  e.session.sp = {
    entity: e.entity,
    prf_algorithm: p.PRFAlgorithm.tls_prf_sha256,
    bulk_cipher_algorithm: null,
    cipher_type: null,
    enc_key_length: null,
    block_length: null,
    fixed_iv_length: null,
    record_iv_length: null,
    mac_algorithm: null,
    mac_length: null,
    mac_key_length: null,
    compression_algorithm: e.session.compressionMethod,
    pre_master_secret: null,
    master_secret: null,
    client_random: n,
    server_random: s
  };
};
p.handleServerHello = function(e, t, a) {
  var r = p.parseHelloMessage(e, t, a);
  if (!e.fail) {
    if (r.version.minor <= e.version.minor)
      e.version.minor = r.version.minor;
    else
      return e.error(e, {
        message: "Incompatible TLS version.",
        send: !0,
        alert: {
          level: p.Alert.Level.fatal,
          description: p.Alert.Description.protocol_version
        }
      });
    e.session.version = e.version;
    var n = r.session_id.bytes();
    n.length > 0 && n === e.session.id ? (e.expect = Mn, e.session.resuming = !0, e.session.sp.server_random = r.random.bytes()) : (e.expect = d0, e.session.resuming = !1, p.createSecurityParameters(e, r)), e.session.id = n, e.process();
  }
};
p.handleClientHello = function(e, t, a) {
  var r = p.parseHelloMessage(e, t, a);
  if (!e.fail) {
    var n = r.session_id.bytes(), s = null;
    if (e.sessionCache && (s = e.sessionCache.getSession(n), s === null ? n = "" : (s.version.major !== r.version.major || s.version.minor > r.version.minor) && (s = null, n = "")), n.length === 0 && (n = N.random.getBytes(32)), e.session.id = n, e.session.clientHelloVersion = r.version, e.session.sp = {}, s)
      e.version = e.session.version = s.version, e.session.sp = s.sp;
    else {
      for (var i, o = 1; o < p.SupportedVersions.length && (i = p.SupportedVersions[o], !(i.minor <= r.version.minor)); ++o)
        ;
      e.version = { major: i.major, minor: i.minor }, e.session.version = e.version;
    }
    s !== null ? (e.expect = ba, e.session.resuming = !0, e.session.sp.client_random = r.random.bytes()) : (e.expect = e.verifyClient !== !1 ? E0 : ia, e.session.resuming = !1, p.createSecurityParameters(e, r)), e.open = !0, p.queue(e, p.createRecord(e, {
      type: p.ContentType.handshake,
      data: p.createServerHello(e)
    })), e.session.resuming ? (p.queue(e, p.createRecord(e, {
      type: p.ContentType.change_cipher_spec,
      data: p.createChangeCipherSpec()
    })), e.state.pending = p.createConnectionState(e), e.state.current.write = e.state.pending.write, p.queue(e, p.createRecord(e, {
      type: p.ContentType.handshake,
      data: p.createFinished(e)
    }))) : (p.queue(e, p.createRecord(e, {
      type: p.ContentType.handshake,
      data: p.createCertificate(e)
    })), e.fail || (p.queue(e, p.createRecord(e, {
      type: p.ContentType.handshake,
      data: p.createServerKeyExchange(e)
    })), e.verifyClient !== !1 && p.queue(e, p.createRecord(e, {
      type: p.ContentType.handshake,
      data: p.createCertificateRequest(e)
    })), p.queue(e, p.createRecord(e, {
      type: p.ContentType.handshake,
      data: p.createServerHelloDone(e)
    })))), p.flush(e), e.process();
  }
};
p.handleCertificate = function(e, t, a) {
  if (a < 3)
    return e.error(e, {
      message: "Invalid Certificate message. Message too short.",
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.illegal_parameter
      }
    });
  var r = t.fragment, n = {
    certificate_list: $e(r, 3)
  }, s, i, o = [];
  try {
    for (; n.certificate_list.length() > 0; )
      s = $e(n.certificate_list, 3), i = N.asn1.fromDer(s), s = N.pki.certificateFromAsn1(i, !0), o.push(s);
  } catch (u) {
    return e.error(e, {
      message: "Could not parse certificate list.",
      cause: u,
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.bad_certificate
      }
    });
  }
  var l = e.entity === p.ConnectionEnd.client;
  (l || e.verifyClient === !0) && o.length === 0 ? e.error(e, {
    message: l ? "No server certificate provided." : "No client certificate provided.",
    send: !0,
    alert: {
      level: p.Alert.Level.fatal,
      description: p.Alert.Description.illegal_parameter
    }
  }) : o.length === 0 ? e.expect = l ? Ja : ia : (l ? e.session.serverCertificate = o[0] : e.session.clientCertificate = o[0], p.verifyCertificateChain(e, o) && (e.expect = l ? Ja : ia)), e.process();
};
p.handleServerKeyExchange = function(e, t, a) {
  if (a > 0)
    return e.error(e, {
      message: "Invalid key parameters. Only RSA is supported.",
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.unsupported_certificate
      }
    });
  e.expect = p0, e.process();
};
p.handleClientKeyExchange = function(e, t, a) {
  if (a < 48)
    return e.error(e, {
      message: "Invalid key parameters. Only RSA is supported.",
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.unsupported_certificate
      }
    });
  var r = t.fragment, n = {
    enc_pre_master_secret: $e(r, 2).getBytes()
  }, s = null;
  if (e.getPrivateKey)
    try {
      s = e.getPrivateKey(e, e.session.serverCertificate), s = N.pki.privateKeyFromPem(s);
    } catch (l) {
      e.error(e, {
        message: "Could not get private key.",
        cause: l,
        send: !0,
        alert: {
          level: p.Alert.Level.fatal,
          description: p.Alert.Description.internal_error
        }
      });
    }
  if (s === null)
    return e.error(e, {
      message: "No private key set.",
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.internal_error
      }
    });
  try {
    var i = e.session.sp;
    i.pre_master_secret = s.decrypt(n.enc_pre_master_secret);
    var o = e.session.clientHelloVersion;
    if (o.major !== i.pre_master_secret.charCodeAt(0) || o.minor !== i.pre_master_secret.charCodeAt(1))
      throw new Error("TLS version rollback attack detected.");
  } catch {
    i.pre_master_secret = N.random.getBytes(48);
  }
  e.expect = ba, e.session.clientCertificate !== null && (e.expect = x0), e.process();
};
p.handleCertificateRequest = function(e, t, a) {
  if (a < 3)
    return e.error(e, {
      message: "Invalid CertificateRequest. Message too short.",
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.illegal_parameter
      }
    });
  var r = t.fragment, n = {
    certificate_types: $e(r, 1),
    certificate_authorities: $e(r, 2)
  };
  e.session.certificateRequest = n, e.expect = v0, e.process();
};
p.handleCertificateVerify = function(e, t, a) {
  if (a < 2)
    return e.error(e, {
      message: "Invalid CertificateVerify. Message too short.",
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.illegal_parameter
      }
    });
  var r = t.fragment;
  r.read -= 4;
  var n = r.bytes();
  r.read += 4;
  var s = {
    signature: $e(r, 2).getBytes()
  }, i = N.util.createBuffer();
  i.putBuffer(e.session.md5.digest()), i.putBuffer(e.session.sha1.digest()), i = i.getBytes();
  try {
    var o = e.session.clientCertificate;
    if (!o.publicKey.verify(i, s.signature, "NONE"))
      throw new Error("CertificateVerify signature does not match.");
    e.session.md5.update(n), e.session.sha1.update(n);
  } catch {
    return e.error(e, {
      message: "Bad signature in CertificateVerify.",
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.handshake_failure
      }
    });
  }
  e.expect = ba, e.process();
};
p.handleServerHelloDone = function(e, t, a) {
  if (a > 0)
    return e.error(e, {
      message: "Invalid ServerHelloDone message. Invalid length.",
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.record_overflow
      }
    });
  if (e.serverCertificate === null) {
    var r = {
      message: "No server certificate provided. Not enough security.",
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.insufficient_security
      }
    }, n = 0, s = e.verify(e, r.alert.description, n, []);
    if (s !== !0)
      return (s || s === 0) && (typeof s == "object" && !N.util.isArray(s) ? (s.message && (r.message = s.message), s.alert && (r.alert.description = s.alert)) : typeof s == "number" && (r.alert.description = s)), e.error(e, r);
  }
  e.session.certificateRequest !== null && (t = p.createRecord(e, {
    type: p.ContentType.handshake,
    data: p.createCertificate(e)
  }), p.queue(e, t)), t = p.createRecord(e, {
    type: p.ContentType.handshake,
    data: p.createClientKeyExchange(e)
  }), p.queue(e, t), e.expect = m0;
  var i = function(o, l) {
    o.session.certificateRequest !== null && o.session.clientCertificate !== null && p.queue(o, p.createRecord(o, {
      type: p.ContentType.handshake,
      data: p.createCertificateVerify(o, l)
    })), p.queue(o, p.createRecord(o, {
      type: p.ContentType.change_cipher_spec,
      data: p.createChangeCipherSpec()
    })), o.state.pending = p.createConnectionState(o), o.state.current.write = o.state.pending.write, p.queue(o, p.createRecord(o, {
      type: p.ContentType.handshake,
      data: p.createFinished(o)
    })), o.expect = Mn, p.flush(o), o.process();
  };
  if (e.session.certificateRequest === null || e.session.clientCertificate === null)
    return i(e, null);
  p.getClientSignature(e, i);
};
p.handleChangeCipherSpec = function(e, t) {
  if (t.fragment.getByte() !== 1)
    return e.error(e, {
      message: "Invalid ChangeCipherSpec message received.",
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.illegal_parameter
      }
    });
  var a = e.entity === p.ConnectionEnd.client;
  (e.session.resuming && a || !e.session.resuming && !a) && (e.state.pending = p.createConnectionState(e)), e.state.current.read = e.state.pending.read, (!e.session.resuming && a || e.session.resuming && !a) && (e.state.pending = null), e.expect = a ? y0 : S0, e.process();
};
p.handleFinished = function(e, t, a) {
  var r = t.fragment;
  r.read -= 4;
  var n = r.bytes();
  r.read += 4;
  var s = t.fragment.getBytes();
  r = N.util.createBuffer(), r.putBuffer(e.session.md5.digest()), r.putBuffer(e.session.sha1.digest());
  var i = e.entity === p.ConnectionEnd.client, o = i ? "server finished" : "client finished", l = e.session.sp, u = 12, f = Mr;
  if (r = f(l.master_secret, o, r.getBytes(), u), r.getBytes() !== s)
    return e.error(e, {
      message: "Invalid verify_data in Finished message.",
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.decrypt_error
      }
    });
  e.session.md5.update(n), e.session.sha1.update(n), (e.session.resuming && i || !e.session.resuming && !i) && (p.queue(e, p.createRecord(e, {
    type: p.ContentType.change_cipher_spec,
    data: p.createChangeCipherSpec()
  })), e.state.current.write = e.state.pending.write, e.state.pending = null, p.queue(e, p.createRecord(e, {
    type: p.ContentType.handshake,
    data: p.createFinished(e)
  }))), e.expect = i ? g0 : T0, e.handshaking = !1, ++e.handshakes, e.peerCertificate = i ? e.session.serverCertificate : e.session.clientCertificate, p.flush(e), e.isConnected = !0, e.connected(e), e.process();
};
p.handleAlert = function(e, t) {
  var a = t.fragment, r = {
    level: a.getByte(),
    description: a.getByte()
  }, n;
  switch (r.description) {
    case p.Alert.Description.close_notify:
      n = "Connection closed.";
      break;
    case p.Alert.Description.unexpected_message:
      n = "Unexpected message.";
      break;
    case p.Alert.Description.bad_record_mac:
      n = "Bad record MAC.";
      break;
    case p.Alert.Description.decryption_failed:
      n = "Decryption failed.";
      break;
    case p.Alert.Description.record_overflow:
      n = "Record overflow.";
      break;
    case p.Alert.Description.decompression_failure:
      n = "Decompression failed.";
      break;
    case p.Alert.Description.handshake_failure:
      n = "Handshake failure.";
      break;
    case p.Alert.Description.bad_certificate:
      n = "Bad certificate.";
      break;
    case p.Alert.Description.unsupported_certificate:
      n = "Unsupported certificate.";
      break;
    case p.Alert.Description.certificate_revoked:
      n = "Certificate revoked.";
      break;
    case p.Alert.Description.certificate_expired:
      n = "Certificate expired.";
      break;
    case p.Alert.Description.certificate_unknown:
      n = "Certificate unknown.";
      break;
    case p.Alert.Description.illegal_parameter:
      n = "Illegal parameter.";
      break;
    case p.Alert.Description.unknown_ca:
      n = "Unknown certificate authority.";
      break;
    case p.Alert.Description.access_denied:
      n = "Access denied.";
      break;
    case p.Alert.Description.decode_error:
      n = "Decode error.";
      break;
    case p.Alert.Description.decrypt_error:
      n = "Decrypt error.";
      break;
    case p.Alert.Description.export_restriction:
      n = "Export restriction.";
      break;
    case p.Alert.Description.protocol_version:
      n = "Unsupported protocol version.";
      break;
    case p.Alert.Description.insufficient_security:
      n = "Insufficient security.";
      break;
    case p.Alert.Description.internal_error:
      n = "Internal error.";
      break;
    case p.Alert.Description.user_canceled:
      n = "User canceled.";
      break;
    case p.Alert.Description.no_renegotiation:
      n = "Renegotiation not supported.";
      break;
    default:
      n = "Unknown error.";
      break;
  }
  if (r.description === p.Alert.Description.close_notify)
    return e.close();
  e.error(e, {
    message: n,
    send: !1,
    // origin is the opposite end
    origin: e.entity === p.ConnectionEnd.client ? "server" : "client",
    alert: r
  }), e.process();
};
p.handleHandshake = function(e, t) {
  var a = t.fragment, r = a.getByte(), n = a.getInt24();
  if (n > a.length())
    return e.fragmented = t, t.fragment = N.util.createBuffer(), a.read -= 4, e.process();
  e.fragmented = null, a.read -= 4;
  var s = a.bytes(n + 4);
  a.read += 4, r in Nr[e.entity][e.expect] ? (e.entity === p.ConnectionEnd.server && !e.open && !e.fail && (e.handshaking = !0, e.session = {
    version: null,
    extensions: {
      server_name: {
        serverNameList: []
      }
    },
    cipherSuite: null,
    compressionMethod: null,
    serverCertificate: null,
    clientCertificate: null,
    md5: N.md.md5.create(),
    sha1: N.md.sha1.create()
  }), r !== p.HandshakeType.hello_request && r !== p.HandshakeType.certificate_verify && r !== p.HandshakeType.finished && (e.session.md5.update(s), e.session.sha1.update(s)), Nr[e.entity][e.expect][r](e, t, n)) : p.handleUnexpected(e, t);
};
p.handleApplicationData = function(e, t) {
  e.data.putBuffer(t.fragment), e.dataReady(e), e.process();
};
p.handleHeartbeat = function(e, t) {
  var a = t.fragment, r = a.getByte(), n = a.getInt16(), s = a.getBytes(n);
  if (r === p.HeartbeatMessageType.heartbeat_request) {
    if (e.handshaking || n > s.length)
      return e.process();
    p.queue(e, p.createRecord(e, {
      type: p.ContentType.heartbeat,
      data: p.createHeartbeat(
        p.HeartbeatMessageType.heartbeat_response,
        s
      )
    })), p.flush(e);
  } else if (r === p.HeartbeatMessageType.heartbeat_response) {
    if (s !== e.expectedHeartbeatPayload)
      return e.process();
    e.heartbeatReceived && e.heartbeatReceived(e, N.util.createBuffer(s));
  }
  e.process();
};
var h0 = 0, d0 = 1, Ja = 2, p0 = 3, v0 = 4, Mn = 5, y0 = 6, g0 = 7, m0 = 8, C0 = 0, E0 = 1, ia = 2, x0 = 3, ba = 4, S0 = 5, T0 = 6, d = p.handleUnexpected, Hn = p.handleChangeCipherSpec, Ie = p.handleAlert, He = p.handleHandshake, Gn = p.handleApplicationData, Ae = p.handleHeartbeat, _a = [];
_a[p.ConnectionEnd.client] = [
  //      CC,AL,HS,AD,HB
  /*SHE*/
  [d, Ie, He, d, Ae],
  /*SCE*/
  [d, Ie, He, d, Ae],
  /*SKE*/
  [d, Ie, He, d, Ae],
  /*SCR*/
  [d, Ie, He, d, Ae],
  /*SHD*/
  [d, Ie, He, d, Ae],
  /*SCC*/
  [Hn, Ie, d, d, Ae],
  /*SFI*/
  [d, Ie, He, d, Ae],
  /*SAD*/
  [d, Ie, He, Gn, Ae],
  /*SER*/
  [d, Ie, He, d, Ae]
];
_a[p.ConnectionEnd.server] = [
  //      CC,AL,HS,AD
  /*CHE*/
  [d, Ie, He, d, Ae],
  /*CCE*/
  [d, Ie, He, d, Ae],
  /*CKE*/
  [d, Ie, He, d, Ae],
  /*CCV*/
  [d, Ie, He, d, Ae],
  /*CCC*/
  [Hn, Ie, d, d, Ae],
  /*CFI*/
  [d, Ie, He, d, Ae],
  /*CAD*/
  [d, Ie, He, Gn, Ae],
  /*CER*/
  [d, Ie, He, d, Ae]
];
var Ct = p.handleHelloRequest, I0 = p.handleServerHello, qn = p.handleCertificate, en = p.handleServerKeyExchange, qr = p.handleCertificateRequest, vr = p.handleServerHelloDone, Qn = p.handleFinished, Nr = [];
Nr[p.ConnectionEnd.client] = [
  //      HR,01,SH,03,04,05,06,07,08,09,10,SC,SK,CR,HD,15,CK,17,18,19,FI
  /*SHE*/
  [d, d, I0, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d],
  /*SCE*/
  [Ct, d, d, d, d, d, d, d, d, d, d, qn, en, qr, vr, d, d, d, d, d, d],
  /*SKE*/
  [Ct, d, d, d, d, d, d, d, d, d, d, d, en, qr, vr, d, d, d, d, d, d],
  /*SCR*/
  [Ct, d, d, d, d, d, d, d, d, d, d, d, d, qr, vr, d, d, d, d, d, d],
  /*SHD*/
  [Ct, d, d, d, d, d, d, d, d, d, d, d, d, d, vr, d, d, d, d, d, d],
  /*SCC*/
  [Ct, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d],
  /*SFI*/
  [Ct, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, Qn],
  /*SAD*/
  [Ct, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d],
  /*SER*/
  [Ct, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d]
];
var A0 = p.handleClientHello, B0 = p.handleClientKeyExchange, b0 = p.handleCertificateVerify;
Nr[p.ConnectionEnd.server] = [
  //      01,CH,02,03,04,05,06,07,08,09,10,CC,12,13,14,CV,CK,17,18,19,FI
  /*CHE*/
  [d, A0, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d],
  /*CCE*/
  [d, d, d, d, d, d, d, d, d, d, d, qn, d, d, d, d, d, d, d, d, d],
  /*CKE*/
  [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, B0, d, d, d, d],
  /*CCV*/
  [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, b0, d, d, d, d, d],
  /*CCC*/
  [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d],
  /*CFI*/
  [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, Qn],
  /*CAD*/
  [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d],
  /*CER*/
  [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d]
];
p.generateKeys = function(e, t) {
  var a = Mr, r = t.client_random + t.server_random;
  e.session.resuming || (t.master_secret = a(
    t.pre_master_secret,
    "master secret",
    r,
    48
  ).bytes(), t.pre_master_secret = null), r = t.server_random + t.client_random;
  var n = 2 * t.mac_key_length + 2 * t.enc_key_length, s = e.version.major === p.Versions.TLS_1_0.major && e.version.minor === p.Versions.TLS_1_0.minor;
  s && (n += 2 * t.fixed_iv_length);
  var i = a(t.master_secret, "key expansion", r, n), o = {
    client_write_MAC_key: i.getBytes(t.mac_key_length),
    server_write_MAC_key: i.getBytes(t.mac_key_length),
    client_write_key: i.getBytes(t.enc_key_length),
    server_write_key: i.getBytes(t.enc_key_length)
  };
  return s && (o.client_write_IV = i.getBytes(t.fixed_iv_length), o.server_write_IV = i.getBytes(t.fixed_iv_length)), o;
};
p.createConnectionState = function(e) {
  var t = e.entity === p.ConnectionEnd.client, a = function() {
    var s = {
      // two 32-bit numbers, first is most significant
      sequenceNumber: [0, 0],
      macKey: null,
      macLength: 0,
      macFunction: null,
      cipherState: null,
      cipherFunction: function(i) {
        return !0;
      },
      compressionState: null,
      compressFunction: function(i) {
        return !0;
      },
      updateSequenceNumber: function() {
        s.sequenceNumber[1] === 4294967295 ? (s.sequenceNumber[1] = 0, ++s.sequenceNumber[0]) : ++s.sequenceNumber[1];
      }
    };
    return s;
  }, r = {
    read: a(),
    write: a()
  };
  if (r.read.update = function(s, i) {
    return r.read.cipherFunction(i, r.read) ? r.read.compressFunction(s, i, r.read) || s.error(s, {
      message: "Could not decompress record.",
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.decompression_failure
      }
    }) : s.error(s, {
      message: "Could not decrypt record or bad MAC.",
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        // doesn't matter if decryption failed or MAC was
        // invalid, return the same error so as not to reveal
        // which one occurred
        description: p.Alert.Description.bad_record_mac
      }
    }), !s.fail;
  }, r.write.update = function(s, i) {
    return r.write.compressFunction(s, i, r.write) ? r.write.cipherFunction(i, r.write) || s.error(s, {
      message: "Could not encrypt record.",
      send: !1,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.internal_error
      }
    }) : s.error(s, {
      message: "Could not compress record.",
      send: !1,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.internal_error
      }
    }), !s.fail;
  }, e.session) {
    var n = e.session.sp;
    switch (e.session.cipherSuite.initSecurityParameters(n), n.keys = p.generateKeys(e, n), r.read.macKey = t ? n.keys.server_write_MAC_key : n.keys.client_write_MAC_key, r.write.macKey = t ? n.keys.client_write_MAC_key : n.keys.server_write_MAC_key, e.session.cipherSuite.initConnectionState(r, e, n), n.compression_algorithm) {
      case p.CompressionMethod.none:
        break;
      case p.CompressionMethod.deflate:
        r.read.compressFunction = c0, r.write.compressFunction = f0;
        break;
      default:
        throw new Error("Unsupported compression algorithm.");
    }
  }
  return r;
};
p.createRandom = function() {
  var e = /* @__PURE__ */ new Date(), t = +e + e.getTimezoneOffset() * 6e4, a = N.util.createBuffer();
  return a.putInt32(t), a.putBytes(N.random.getBytes(28)), a;
};
p.createRecord = function(e, t) {
  if (!t.data)
    return null;
  var a = {
    type: t.type,
    version: {
      major: e.version.major,
      minor: e.version.minor
    },
    length: t.data.length(),
    fragment: t.data
  };
  return a;
};
p.createAlert = function(e, t) {
  var a = N.util.createBuffer();
  return a.putByte(t.level), a.putByte(t.description), p.createRecord(e, {
    type: p.ContentType.alert,
    data: a
  });
};
p.createClientHello = function(e) {
  e.session.clientHelloVersion = {
    major: e.version.major,
    minor: e.version.minor
  };
  for (var t = N.util.createBuffer(), a = 0; a < e.cipherSuites.length; ++a) {
    var r = e.cipherSuites[a];
    t.putByte(r.id[0]), t.putByte(r.id[1]);
  }
  var n = t.length(), s = N.util.createBuffer();
  s.putByte(p.CompressionMethod.none);
  var i = s.length(), o = N.util.createBuffer();
  if (e.virtualHost) {
    var l = N.util.createBuffer();
    l.putByte(0), l.putByte(0);
    var u = N.util.createBuffer();
    u.putByte(0), je(u, 2, N.util.createBuffer(e.virtualHost));
    var f = N.util.createBuffer();
    je(f, 2, u), je(l, 2, f), o.putBuffer(l);
  }
  var c = o.length();
  c > 0 && (c += 2);
  var v = e.session.id, m = v.length + 1 + // session ID vector
  2 + // version (major + minor)
  4 + 28 + // random time and random bytes
  2 + n + // cipher suites vector
  1 + i + // compression methods vector
  c, y = N.util.createBuffer();
  return y.putByte(p.HandshakeType.client_hello), y.putInt24(m), y.putByte(e.version.major), y.putByte(e.version.minor), y.putBytes(e.session.sp.client_random), je(y, 1, N.util.createBuffer(v)), je(y, 2, t), je(y, 1, s), c > 0 && je(y, 2, o), y;
};
p.createServerHello = function(e) {
  var t = e.session.id, a = t.length + 1 + // session ID vector
  2 + // version (major + minor)
  4 + 28 + // random time and random bytes
  2 + // chosen cipher suite
  1, r = N.util.createBuffer();
  return r.putByte(p.HandshakeType.server_hello), r.putInt24(a), r.putByte(e.version.major), r.putByte(e.version.minor), r.putBytes(e.session.sp.server_random), je(r, 1, N.util.createBuffer(t)), r.putByte(e.session.cipherSuite.id[0]), r.putByte(e.session.cipherSuite.id[1]), r.putByte(e.session.compressionMethod), r;
};
p.createCertificate = function(e) {
  var t = e.entity === p.ConnectionEnd.client, a = null;
  if (e.getCertificate) {
    var r;
    t ? r = e.session.certificateRequest : r = e.session.extensions.server_name.serverNameList, a = e.getCertificate(e, r);
  }
  var n = N.util.createBuffer();
  if (a !== null)
    try {
      N.util.isArray(a) || (a = [a]);
      for (var s = null, i = 0; i < a.length; ++i) {
        var o = N.pem.decode(a[i])[0];
        if (o.type !== "CERTIFICATE" && o.type !== "X509 CERTIFICATE" && o.type !== "TRUSTED CERTIFICATE") {
          var l = new Error('Could not convert certificate from PEM; PEM header type is not "CERTIFICATE", "X509 CERTIFICATE", or "TRUSTED CERTIFICATE".');
          throw l.headerType = o.type, l;
        }
        if (o.procType && o.procType.type === "ENCRYPTED")
          throw new Error("Could not convert certificate from PEM; PEM is encrypted.");
        var u = N.util.createBuffer(o.body);
        s === null && (s = N.asn1.fromDer(u.bytes(), !1));
        var f = N.util.createBuffer();
        je(f, 3, u), n.putBuffer(f);
      }
      a = N.pki.certificateFromAsn1(s), t ? e.session.clientCertificate = a : e.session.serverCertificate = a;
    } catch (m) {
      return e.error(e, {
        message: "Could not send certificate list.",
        cause: m,
        send: !0,
        alert: {
          level: p.Alert.Level.fatal,
          description: p.Alert.Description.bad_certificate
        }
      });
    }
  var c = 3 + n.length(), v = N.util.createBuffer();
  return v.putByte(p.HandshakeType.certificate), v.putInt24(c), je(v, 3, n), v;
};
p.createClientKeyExchange = function(e) {
  var t = N.util.createBuffer();
  t.putByte(e.session.clientHelloVersion.major), t.putByte(e.session.clientHelloVersion.minor), t.putBytes(N.random.getBytes(46));
  var a = e.session.sp;
  a.pre_master_secret = t.getBytes();
  var r = e.session.serverCertificate.publicKey;
  t = r.encrypt(a.pre_master_secret);
  var n = t.length + 2, s = N.util.createBuffer();
  return s.putByte(p.HandshakeType.client_key_exchange), s.putInt24(n), s.putInt16(t.length), s.putBytes(t), s;
};
p.createServerKeyExchange = function(e) {
  var t = N.util.createBuffer();
  return t;
};
p.getClientSignature = function(e, t) {
  var a = N.util.createBuffer();
  a.putBuffer(e.session.md5.digest()), a.putBuffer(e.session.sha1.digest()), a = a.getBytes(), e.getSignature = e.getSignature || function(r, n, s) {
    var i = null;
    if (r.getPrivateKey)
      try {
        i = r.getPrivateKey(r, r.session.clientCertificate), i = N.pki.privateKeyFromPem(i);
      } catch (o) {
        r.error(r, {
          message: "Could not get private key.",
          cause: o,
          send: !0,
          alert: {
            level: p.Alert.Level.fatal,
            description: p.Alert.Description.internal_error
          }
        });
      }
    i === null ? r.error(r, {
      message: "No private key set.",
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: p.Alert.Description.internal_error
      }
    }) : n = i.sign(n, null), s(r, n);
  }, e.getSignature(e, a, t);
};
p.createCertificateVerify = function(e, t) {
  var a = t.length + 2, r = N.util.createBuffer();
  return r.putByte(p.HandshakeType.certificate_verify), r.putInt24(a), r.putInt16(t.length), r.putBytes(t), r;
};
p.createCertificateRequest = function(e) {
  var t = N.util.createBuffer();
  t.putByte(1);
  var a = N.util.createBuffer();
  for (var r in e.caStore.certs) {
    var n = e.caStore.certs[r], s = N.pki.distinguishedNameToAsn1(n.subject), i = N.asn1.toDer(s);
    a.putInt16(i.length()), a.putBuffer(i);
  }
  var o = 1 + t.length() + 2 + a.length(), l = N.util.createBuffer();
  return l.putByte(p.HandshakeType.certificate_request), l.putInt24(o), je(l, 1, t), je(l, 2, a), l;
};
p.createServerHelloDone = function(e) {
  var t = N.util.createBuffer();
  return t.putByte(p.HandshakeType.server_hello_done), t.putInt24(0), t;
};
p.createChangeCipherSpec = function() {
  var e = N.util.createBuffer();
  return e.putByte(1), e;
};
p.createFinished = function(e) {
  var t = N.util.createBuffer();
  t.putBuffer(e.session.md5.digest()), t.putBuffer(e.session.sha1.digest());
  var a = e.entity === p.ConnectionEnd.client, r = e.session.sp, n = 12, s = Mr, i = a ? "client finished" : "server finished";
  t = s(r.master_secret, i, t.getBytes(), n);
  var o = N.util.createBuffer();
  return o.putByte(p.HandshakeType.finished), o.putInt24(t.length()), o.putBuffer(t), o;
};
p.createHeartbeat = function(e, t, a) {
  typeof a > "u" && (a = t.length);
  var r = N.util.createBuffer();
  r.putByte(e), r.putInt16(a), r.putBytes(t);
  var n = r.length(), s = Math.max(16, n - a - 3);
  return r.putBytes(N.random.getBytes(s)), r;
};
p.queue = function(e, t) {
  if (t && !(t.fragment.length() === 0 && (t.type === p.ContentType.handshake || t.type === p.ContentType.alert || t.type === p.ContentType.change_cipher_spec))) {
    if (t.type === p.ContentType.handshake) {
      var a = t.fragment.bytes();
      e.session.md5.update(a), e.session.sha1.update(a), a = null;
    }
    var r;
    if (t.fragment.length() <= p.MaxFragment)
      r = [t];
    else {
      r = [];
      for (var n = t.fragment.bytes(); n.length > p.MaxFragment; )
        r.push(p.createRecord(e, {
          type: t.type,
          data: N.util.createBuffer(n.slice(0, p.MaxFragment))
        })), n = n.slice(p.MaxFragment);
      n.length > 0 && r.push(p.createRecord(e, {
        type: t.type,
        data: N.util.createBuffer(n)
      }));
    }
    for (var s = 0; s < r.length && !e.fail; ++s) {
      var i = r[s], o = e.state.current.write;
      o.update(e, i) && e.records.push(i);
    }
  }
};
p.flush = function(e) {
  for (var t = 0; t < e.records.length; ++t) {
    var a = e.records[t];
    e.tlsData.putByte(a.type), e.tlsData.putByte(a.version.major), e.tlsData.putByte(a.version.minor), e.tlsData.putInt16(a.fragment.length()), e.tlsData.putBuffer(e.records[t].fragment);
  }
  return e.records = [], e.tlsDataReady(e);
};
var Qr = function(e) {
  switch (e) {
    case !0:
      return !0;
    case N.pki.certificateError.bad_certificate:
      return p.Alert.Description.bad_certificate;
    case N.pki.certificateError.unsupported_certificate:
      return p.Alert.Description.unsupported_certificate;
    case N.pki.certificateError.certificate_revoked:
      return p.Alert.Description.certificate_revoked;
    case N.pki.certificateError.certificate_expired:
      return p.Alert.Description.certificate_expired;
    case N.pki.certificateError.certificate_unknown:
      return p.Alert.Description.certificate_unknown;
    case N.pki.certificateError.unknown_ca:
      return p.Alert.Description.unknown_ca;
    default:
      return p.Alert.Description.bad_certificate;
  }
}, _0 = function(e) {
  switch (e) {
    case !0:
      return !0;
    case p.Alert.Description.bad_certificate:
      return N.pki.certificateError.bad_certificate;
    case p.Alert.Description.unsupported_certificate:
      return N.pki.certificateError.unsupported_certificate;
    case p.Alert.Description.certificate_revoked:
      return N.pki.certificateError.certificate_revoked;
    case p.Alert.Description.certificate_expired:
      return N.pki.certificateError.certificate_expired;
    case p.Alert.Description.certificate_unknown:
      return N.pki.certificateError.certificate_unknown;
    case p.Alert.Description.unknown_ca:
      return N.pki.certificateError.unknown_ca;
    default:
      return N.pki.certificateError.bad_certificate;
  }
};
p.verifyCertificateChain = function(e, t) {
  try {
    var a = {};
    for (var r in e.verifyOptions)
      a[r] = e.verifyOptions[r];
    a.verify = function(s, i, o) {
      var l = Qr(s), u = e.verify(e, s, i, o);
      if (u !== !0) {
        if (typeof u == "object" && !N.util.isArray(u)) {
          var f = new Error("The application rejected the certificate.");
          throw f.send = !0, f.alert = {
            level: p.Alert.Level.fatal,
            description: p.Alert.Description.bad_certificate
          }, u.message && (f.message = u.message), u.alert && (f.alert.description = u.alert), f;
        }
        u !== s && (u = _0(u));
      }
      return u;
    }, N.pki.verifyCertificateChain(e.caStore, t, a);
  } catch (s) {
    var n = s;
    (typeof n != "object" || N.util.isArray(n)) && (n = {
      send: !0,
      alert: {
        level: p.Alert.Level.fatal,
        description: Qr(s)
      }
    }), "send" in n || (n.send = !0), "alert" in n || (n.alert = {
      level: p.Alert.Level.fatal,
      description: Qr(n.error)
    }), e.error(e, n);
  }
  return !e.fail;
};
p.createSessionCache = function(e, t) {
  var a = null;
  if (e && e.getSession && e.setSession && e.order)
    a = e;
  else {
    a = {}, a.cache = e || {}, a.capacity = Math.max(t || 100, 1), a.order = [];
    for (var r in e)
      a.order.length <= t ? a.order.push(r) : delete e[r];
    a.getSession = function(n) {
      var s = null, i = null;
      if (n ? i = N.util.bytesToHex(n) : a.order.length > 0 && (i = a.order[0]), i !== null && i in a.cache) {
        s = a.cache[i], delete a.cache[i];
        for (var o in a.order)
          if (a.order[o] === i) {
            a.order.splice(o, 1);
            break;
          }
      }
      return s;
    }, a.setSession = function(n, s) {
      if (a.order.length === a.capacity) {
        var i = a.order.shift();
        delete a.cache[i];
      }
      var i = N.util.bytesToHex(n);
      a.order.push(i), a.cache[i] = s;
    };
  }
  return a;
};
p.createConnection = function(e) {
  var t = null;
  e.caStore ? N.util.isArray(e.caStore) ? t = N.pki.createCaStore(e.caStore) : t = e.caStore : t = N.pki.createCaStore();
  var a = e.cipherSuites || null;
  if (a === null) {
    a = [];
    for (var r in p.CipherSuites)
      a.push(p.CipherSuites[r]);
  }
  var n = e.server ? p.ConnectionEnd.server : p.ConnectionEnd.client, s = e.sessionCache ? p.createSessionCache(e.sessionCache) : null, i = {
    version: { major: p.Version.major, minor: p.Version.minor },
    entity: n,
    sessionId: e.sessionId,
    caStore: t,
    sessionCache: s,
    cipherSuites: a,
    connected: e.connected,
    virtualHost: e.virtualHost || null,
    verifyClient: e.verifyClient || !1,
    verify: e.verify || function(f, c, v, m) {
      return c;
    },
    verifyOptions: e.verifyOptions || {},
    getCertificate: e.getCertificate || null,
    getPrivateKey: e.getPrivateKey || null,
    getSignature: e.getSignature || null,
    input: N.util.createBuffer(),
    tlsData: N.util.createBuffer(),
    data: N.util.createBuffer(),
    tlsDataReady: e.tlsDataReady,
    dataReady: e.dataReady,
    heartbeatReceived: e.heartbeatReceived,
    closed: e.closed,
    error: function(f, c) {
      c.origin = c.origin || (f.entity === p.ConnectionEnd.client ? "client" : "server"), c.send && (p.queue(f, p.createAlert(f, c.alert)), p.flush(f));
      var v = c.fatal !== !1;
      v && (f.fail = !0), e.error(f, c), v && f.close(!1);
    },
    deflate: e.deflate || null,
    inflate: e.inflate || null
  };
  i.reset = function(f) {
    i.version = { major: p.Version.major, minor: p.Version.minor }, i.record = null, i.session = null, i.peerCertificate = null, i.state = {
      pending: null,
      current: null
    }, i.expect = i.entity === p.ConnectionEnd.client ? h0 : C0, i.fragmented = null, i.records = [], i.open = !1, i.handshakes = 0, i.handshaking = !1, i.isConnected = !1, i.fail = !(f || typeof f > "u"), i.input.clear(), i.tlsData.clear(), i.data.clear(), i.state.current = p.createConnectionState(i);
  }, i.reset();
  var o = function(f, c) {
    var v = c.type - p.ContentType.change_cipher_spec, m = _a[f.entity][f.expect];
    v in m ? m[v](f, c) : p.handleUnexpected(f, c);
  }, l = function(f) {
    var c = 0, v = f.input, m = v.length();
    if (m < 5)
      c = 5 - m;
    else {
      f.record = {
        type: v.getByte(),
        version: {
          major: v.getByte(),
          minor: v.getByte()
        },
        length: v.getInt16(),
        fragment: N.util.createBuffer(),
        ready: !1
      };
      var y = f.record.version.major === f.version.major;
      y && f.session && f.session.version && (y = f.record.version.minor === f.version.minor), y || f.error(f, {
        message: "Incompatible TLS version.",
        send: !0,
        alert: {
          level: p.Alert.Level.fatal,
          description: p.Alert.Description.protocol_version
        }
      });
    }
    return c;
  }, u = function(f) {
    var c = 0, v = f.input, m = v.length();
    if (m < f.record.length)
      c = f.record.length - m;
    else {
      f.record.fragment.putBytes(v.getBytes(f.record.length)), v.compact();
      var y = f.state.current.read;
      y.update(f, f.record) && (f.fragmented !== null && (f.fragmented.type === f.record.type ? (f.fragmented.fragment.putBuffer(f.record.fragment), f.record = f.fragmented) : f.error(f, {
        message: "Invalid fragmented record.",
        send: !0,
        alert: {
          level: p.Alert.Level.fatal,
          description: p.Alert.Description.unexpected_message
        }
      })), f.record.ready = !0);
    }
    return c;
  };
  return i.handshake = function(f) {
    if (i.entity !== p.ConnectionEnd.client)
      i.error(i, {
        message: "Cannot initiate handshake as a server.",
        fatal: !1
      });
    else if (i.handshaking)
      i.error(i, {
        message: "Handshake already in progress.",
        fatal: !1
      });
    else {
      i.fail && !i.open && i.handshakes === 0 && (i.fail = !1), i.handshaking = !0, f = f || "";
      var c = null;
      f.length > 0 && (i.sessionCache && (c = i.sessionCache.getSession(f)), c === null && (f = "")), f.length === 0 && i.sessionCache && (c = i.sessionCache.getSession(), c !== null && (f = c.id)), i.session = {
        id: f,
        version: null,
        cipherSuite: null,
        compressionMethod: null,
        serverCertificate: null,
        certificateRequest: null,
        clientCertificate: null,
        sp: {},
        md5: N.md.md5.create(),
        sha1: N.md.sha1.create()
      }, c && (i.version = c.version, i.session.sp = c.sp), i.session.sp.client_random = p.createRandom().getBytes(), i.open = !0, p.queue(i, p.createRecord(i, {
        type: p.ContentType.handshake,
        data: p.createClientHello(i)
      })), p.flush(i);
    }
  }, i.process = function(f) {
    var c = 0;
    return f && i.input.putBytes(f), i.fail || (i.record !== null && i.record.ready && i.record.fragment.isEmpty() && (i.record = null), i.record === null && (c = l(i)), !i.fail && i.record !== null && !i.record.ready && (c = u(i)), !i.fail && i.record !== null && i.record.ready && o(i, i.record)), c;
  }, i.prepare = function(f) {
    return p.queue(i, p.createRecord(i, {
      type: p.ContentType.application_data,
      data: N.util.createBuffer(f)
    })), p.flush(i);
  }, i.prepareHeartbeatRequest = function(f, c) {
    return f instanceof N.util.ByteBuffer && (f = f.bytes()), typeof c > "u" && (c = f.length), i.expectedHeartbeatPayload = f, p.queue(i, p.createRecord(i, {
      type: p.ContentType.heartbeat,
      data: p.createHeartbeat(
        p.HeartbeatMessageType.heartbeat_request,
        f,
        c
      )
    })), p.flush(i);
  }, i.close = function(f) {
    if (!i.fail && i.sessionCache && i.session) {
      var c = {
        id: i.session.id,
        version: i.session.version,
        sp: i.session.sp
      };
      c.sp.keys = null, i.sessionCache.setSession(c.id, c);
    }
    i.open && (i.open = !1, i.input.clear(), (i.isConnected || i.handshaking) && (i.isConnected = i.handshaking = !1, p.queue(i, p.createAlert(i, {
      level: p.Alert.Level.warning,
      description: p.Alert.Description.close_notify
    })), p.flush(i)), i.closed(i)), i.reset(f);
  }, i;
};
N.tls = N.tls || {};
for (var zr in p)
  typeof p[zr] != "function" && (N.tls[zr] = p[zr]);
N.tls.prf_tls1 = Mr;
N.tls.hmac_sha1 = l0;
N.tls.createSessionCache = p.createSessionCache;
N.tls.createConnection = p.createConnection;
var bt = z, tt = bt.tls;
tt.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA = {
  id: [0, 47],
  name: "TLS_RSA_WITH_AES_128_CBC_SHA",
  initSecurityParameters: function(e) {
    e.bulk_cipher_algorithm = tt.BulkCipherAlgorithm.aes, e.cipher_type = tt.CipherType.block, e.enc_key_length = 16, e.block_length = 16, e.fixed_iv_length = 16, e.record_iv_length = 16, e.mac_algorithm = tt.MACAlgorithm.hmac_sha1, e.mac_length = 20, e.mac_key_length = 20;
  },
  initConnectionState: zn
};
tt.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA = {
  id: [0, 53],
  name: "TLS_RSA_WITH_AES_256_CBC_SHA",
  initSecurityParameters: function(e) {
    e.bulk_cipher_algorithm = tt.BulkCipherAlgorithm.aes, e.cipher_type = tt.CipherType.block, e.enc_key_length = 32, e.block_length = 16, e.fixed_iv_length = 16, e.record_iv_length = 16, e.mac_algorithm = tt.MACAlgorithm.hmac_sha1, e.mac_length = 20, e.mac_key_length = 20;
  },
  initConnectionState: zn
};
function zn(e, t, a) {
  var r = t.entity === bt.tls.ConnectionEnd.client;
  e.read.cipherState = {
    init: !1,
    cipher: bt.cipher.createDecipher("AES-CBC", r ? a.keys.server_write_key : a.keys.client_write_key),
    iv: r ? a.keys.server_write_IV : a.keys.client_write_IV
  }, e.write.cipherState = {
    init: !1,
    cipher: bt.cipher.createCipher("AES-CBC", r ? a.keys.client_write_key : a.keys.server_write_key),
    iv: r ? a.keys.client_write_IV : a.keys.server_write_IV
  }, e.read.cipherFunction = L0, e.write.cipherFunction = N0, e.read.macLength = e.write.macLength = a.mac_length, e.read.macFunction = e.write.macFunction = tt.hmac_sha1;
}
function N0(e, t) {
  var a = !1, r = t.macFunction(t.macKey, t.sequenceNumber, e);
  e.fragment.putBytes(r), t.updateSequenceNumber();
  var n;
  e.version.minor === tt.Versions.TLS_1_0.minor ? n = t.cipherState.init ? null : t.cipherState.iv : n = bt.random.getBytesSync(16), t.cipherState.init = !0;
  var s = t.cipherState.cipher;
  return s.start({ iv: n }), e.version.minor >= tt.Versions.TLS_1_1.minor && s.output.putBytes(n), s.update(e.fragment), s.finish(R0) && (e.fragment = s.output, e.length = e.fragment.length(), a = !0), a;
}
function R0(e, t, a) {
  if (!a) {
    var r = e - t.length() % e;
    t.fillWithByte(r - 1, r);
  }
  return !0;
}
function w0(e, t, a) {
  var r = !0;
  if (a) {
    for (var n = t.length(), s = t.last(), i = n - 1 - s; i < n - 1; ++i)
      r = r && t.at(i) == s;
    r && t.truncate(s + 1);
  }
  return r;
}
function L0(e, t) {
  var a = !1, r;
  e.version.minor === tt.Versions.TLS_1_0.minor ? r = t.cipherState.init ? null : t.cipherState.iv : r = e.fragment.getBytes(16), t.cipherState.init = !0;
  var n = t.cipherState.cipher;
  n.start({ iv: r }), n.update(e.fragment), a = n.finish(w0);
  var s = t.macLength, i = bt.random.getBytesSync(s), o = n.output.length();
  o >= s ? (e.fragment = n.output.getBytes(o - s), i = n.output.getBytes(s)) : e.fragment = n.output.getBytes(), e.fragment = bt.util.createBuffer(e.fragment), e.length = e.fragment.length();
  var l = t.macFunction(t.macKey, t.sequenceNumber, e);
  return t.updateSequenceNumber(), a = k0(t.macKey, i, l) && a, a;
}
function k0(e, t, a) {
  var r = bt.hmac.create();
  return r.start("SHA1", e), r.update(t), t = r.digest().getBytes(), r.start(null, null), r.update(a), a = r.digest().getBytes(), t === a;
}
var fe = z, dr = fe.sha512 = fe.sha512 || {};
fe.md.sha512 = fe.md.algorithms.sha512 = dr;
var Yn = fe.sha384 = fe.sha512.sha384 = fe.sha512.sha384 || {};
Yn.create = function() {
  return dr.create("SHA-384");
};
fe.md.sha384 = fe.md.algorithms.sha384 = Yn;
fe.sha512.sha256 = fe.sha512.sha256 || {
  create: function() {
    return dr.create("SHA-512/256");
  }
};
fe.md["sha512/256"] = fe.md.algorithms["sha512/256"] = fe.sha512.sha256;
fe.sha512.sha224 = fe.sha512.sha224 || {
  create: function() {
    return dr.create("SHA-512/224");
  }
};
fe.md["sha512/224"] = fe.md.algorithms["sha512/224"] = fe.sha512.sha224;
dr.create = function(e) {
  if ($n || D0(), typeof e > "u" && (e = "SHA-512"), !(e in Ut))
    throw new Error("Invalid SHA-512 algorithm: " + e);
  for (var t = Ut[e], a = null, r = fe.util.createBuffer(), n = new Array(80), s = 0; s < 80; ++s)
    n[s] = new Array(2);
  var i = 64;
  switch (e) {
    case "SHA-384":
      i = 48;
      break;
    case "SHA-512/256":
      i = 32;
      break;
    case "SHA-512/224":
      i = 28;
      break;
  }
  var o = {
    // SHA-512 => sha512
    algorithm: e.replace("-", "").toLowerCase(),
    blockLength: 128,
    digestLength: i,
    // 56-bit length of message so far (does not including padding)
    messageLength: 0,
    // true message length
    fullMessageLength: null,
    // size of message length in bytes
    messageLengthSize: 16
  };
  return o.start = function() {
    o.messageLength = 0, o.fullMessageLength = o.messageLength128 = [];
    for (var l = o.messageLengthSize / 4, u = 0; u < l; ++u)
      o.fullMessageLength.push(0);
    r = fe.util.createBuffer(), a = new Array(t.length);
    for (var u = 0; u < t.length; ++u)
      a[u] = t[u].slice(0);
    return o;
  }, o.start(), o.update = function(l, u) {
    u === "utf8" && (l = fe.util.encodeUtf8(l));
    var f = l.length;
    o.messageLength += f, f = [f / 4294967296 >>> 0, f >>> 0];
    for (var c = o.fullMessageLength.length - 1; c >= 0; --c)
      o.fullMessageLength[c] += f[1], f[1] = f[0] + (o.fullMessageLength[c] / 4294967296 >>> 0), o.fullMessageLength[c] = o.fullMessageLength[c] >>> 0, f[0] = f[1] / 4294967296 >>> 0;
    return r.putBytes(l), tn(a, n, r), (r.read > 2048 || r.length() === 0) && r.compact(), o;
  }, o.digest = function() {
    var l = fe.util.createBuffer();
    l.putBytes(r.bytes());
    var u = o.fullMessageLength[o.fullMessageLength.length - 1] + o.messageLengthSize, f = u & o.blockLength - 1;
    l.putBytes(sa.substr(0, o.blockLength - f));
    for (var c, v, m = o.fullMessageLength[0] * 8, y = 0; y < o.fullMessageLength.length - 1; ++y)
      c = o.fullMessageLength[y + 1] * 8, v = c / 4294967296 >>> 0, m += v, l.putInt32(m >>> 0), m = c >>> 0;
    l.putInt32(m);
    for (var x = new Array(a.length), y = 0; y < a.length; ++y)
      x[y] = a[y].slice(0);
    tn(x, n, l);
    var S = fe.util.createBuffer(), I;
    e === "SHA-512" ? I = x.length : e === "SHA-384" ? I = x.length - 2 : I = x.length - 4;
    for (var y = 0; y < I; ++y)
      S.putInt32(x[y][0]), (y !== I - 1 || e !== "SHA-512/224") && S.putInt32(x[y][1]);
    return S;
  }, o;
};
var sa = null, $n = !1, oa = null, Ut = null;
function D0() {
  sa = "", sa += fe.util.fillString("\0", 128), oa = [
    [1116352408, 3609767458],
    [1899447441, 602891725],
    [3049323471, 3964484399],
    [3921009573, 2173295548],
    [961987163, 4081628472],
    [1508970993, 3053834265],
    [2453635748, 2937671579],
    [2870763221, 3664609560],
    [3624381080, 2734883394],
    [310598401, 1164996542],
    [607225278, 1323610764],
    [1426881987, 3590304994],
    [1925078388, 4068182383],
    [2162078206, 991336113],
    [2614888103, 633803317],
    [3248222580, 3479774868],
    [3835390401, 2666613458],
    [4022224774, 944711139],
    [264347078, 2341262773],
    [604807628, 2007800933],
    [770255983, 1495990901],
    [1249150122, 1856431235],
    [1555081692, 3175218132],
    [1996064986, 2198950837],
    [2554220882, 3999719339],
    [2821834349, 766784016],
    [2952996808, 2566594879],
    [3210313671, 3203337956],
    [3336571891, 1034457026],
    [3584528711, 2466948901],
    [113926993, 3758326383],
    [338241895, 168717936],
    [666307205, 1188179964],
    [773529912, 1546045734],
    [1294757372, 1522805485],
    [1396182291, 2643833823],
    [1695183700, 2343527390],
    [1986661051, 1014477480],
    [2177026350, 1206759142],
    [2456956037, 344077627],
    [2730485921, 1290863460],
    [2820302411, 3158454273],
    [3259730800, 3505952657],
    [3345764771, 106217008],
    [3516065817, 3606008344],
    [3600352804, 1432725776],
    [4094571909, 1467031594],
    [275423344, 851169720],
    [430227734, 3100823752],
    [506948616, 1363258195],
    [659060556, 3750685593],
    [883997877, 3785050280],
    [958139571, 3318307427],
    [1322822218, 3812723403],
    [1537002063, 2003034995],
    [1747873779, 3602036899],
    [1955562222, 1575990012],
    [2024104815, 1125592928],
    [2227730452, 2716904306],
    [2361852424, 442776044],
    [2428436474, 593698344],
    [2756734187, 3733110249],
    [3204031479, 2999351573],
    [3329325298, 3815920427],
    [3391569614, 3928383900],
    [3515267271, 566280711],
    [3940187606, 3454069534],
    [4118630271, 4000239992],
    [116418474, 1914138554],
    [174292421, 2731055270],
    [289380356, 3203993006],
    [460393269, 320620315],
    [685471733, 587496836],
    [852142971, 1086792851],
    [1017036298, 365543100],
    [1126000580, 2618297676],
    [1288033470, 3409855158],
    [1501505948, 4234509866],
    [1607167915, 987167468],
    [1816402316, 1246189591]
  ], Ut = {}, Ut["SHA-512"] = [
    [1779033703, 4089235720],
    [3144134277, 2227873595],
    [1013904242, 4271175723],
    [2773480762, 1595750129],
    [1359893119, 2917565137],
    [2600822924, 725511199],
    [528734635, 4215389547],
    [1541459225, 327033209]
  ], Ut["SHA-384"] = [
    [3418070365, 3238371032],
    [1654270250, 914150663],
    [2438529370, 812702999],
    [355462360, 4144912697],
    [1731405415, 4290775857],
    [2394180231, 1750603025],
    [3675008525, 1694076839],
    [1203062813, 3204075428]
  ], Ut["SHA-512/256"] = [
    [573645204, 4230739756],
    [2673172387, 3360449730],
    [596883563, 1867755857],
    [2520282905, 1497426621],
    [2519219938, 2827943907],
    [3193839141, 1401305490],
    [721525244, 746961066],
    [246885852, 2177182882]
  ], Ut["SHA-512/224"] = [
    [2352822216, 424955298],
    [1944164710, 2312950998],
    [502970286, 855612546],
    [1738396948, 1479516111],
    [258812777, 2077511080],
    [2011393907, 79989058],
    [1067287976, 1780299464],
    [286451373, 2446758561]
  ], $n = !0;
}
function tn(e, t, a) {
  for (var r, n, s, i, o, l, u, f, c, v, m, y, x, S, I, b, _, V, k, w, G, Y, re, ae, ne, he, ze, Xe, ie, ye, F, Rt, Mt, ge, me, Ee = a.length(); Ee >= 128; ) {
    for (ie = 0; ie < 16; ++ie)
      t[ie][0] = a.getInt32() >>> 0, t[ie][1] = a.getInt32() >>> 0;
    for (; ie < 80; ++ie)
      Rt = t[ie - 2], ye = Rt[0], F = Rt[1], r = ((ye >>> 19 | F << 13) ^ // ROTR 19
      (F >>> 29 | ye << 3) ^ // ROTR 61/(swap + ROTR 29)
      ye >>> 6) >>> 0, n = ((ye << 13 | F >>> 19) ^ // ROTR 19
      (F << 3 | ye >>> 29) ^ // ROTR 61/(swap + ROTR 29)
      (ye << 26 | F >>> 6)) >>> 0, ge = t[ie - 15], ye = ge[0], F = ge[1], s = ((ye >>> 1 | F << 31) ^ // ROTR 1
      (ye >>> 8 | F << 24) ^ // ROTR 8
      ye >>> 7) >>> 0, i = ((ye << 31 | F >>> 1) ^ // ROTR 1
      (ye << 24 | F >>> 8) ^ // ROTR 8
      (ye << 25 | F >>> 7)) >>> 0, Mt = t[ie - 7], me = t[ie - 16], F = n + Mt[1] + i + me[1], t[ie][0] = r + Mt[0] + s + me[0] + (F / 4294967296 >>> 0) >>> 0, t[ie][1] = F >>> 0;
    for (x = e[0][0], S = e[0][1], I = e[1][0], b = e[1][1], _ = e[2][0], V = e[2][1], k = e[3][0], w = e[3][1], G = e[4][0], Y = e[4][1], re = e[5][0], ae = e[5][1], ne = e[6][0], he = e[6][1], ze = e[7][0], Xe = e[7][1], ie = 0; ie < 80; ++ie)
      u = ((G >>> 14 | Y << 18) ^ // ROTR 14
      (G >>> 18 | Y << 14) ^ // ROTR 18
      (Y >>> 9 | G << 23)) >>> 0, f = ((G << 18 | Y >>> 14) ^ // ROTR 14
      (G << 14 | Y >>> 18) ^ // ROTR 18
      (Y << 23 | G >>> 9)) >>> 0, c = (ne ^ G & (re ^ ne)) >>> 0, v = (he ^ Y & (ae ^ he)) >>> 0, o = ((x >>> 28 | S << 4) ^ // ROTR 28
      (S >>> 2 | x << 30) ^ // ROTR 34/(swap + ROTR 2)
      (S >>> 7 | x << 25)) >>> 0, l = ((x << 4 | S >>> 28) ^ // ROTR 28
      (S << 30 | x >>> 2) ^ // ROTR 34/(swap + ROTR 2)
      (S << 25 | x >>> 7)) >>> 0, m = (x & I | _ & (x ^ I)) >>> 0, y = (S & b | V & (S ^ b)) >>> 0, F = Xe + f + v + oa[ie][1] + t[ie][1], r = ze + u + c + oa[ie][0] + t[ie][0] + (F / 4294967296 >>> 0) >>> 0, n = F >>> 0, F = l + y, s = o + m + (F / 4294967296 >>> 0) >>> 0, i = F >>> 0, ze = ne, Xe = he, ne = re, he = ae, re = G, ae = Y, F = w + n, G = k + r + (F / 4294967296 >>> 0) >>> 0, Y = F >>> 0, k = _, w = V, _ = I, V = b, I = x, b = S, F = n + i, x = r + s + (F / 4294967296 >>> 0) >>> 0, S = F >>> 0;
    F = e[0][1] + S, e[0][0] = e[0][0] + x + (F / 4294967296 >>> 0) >>> 0, e[0][1] = F >>> 0, F = e[1][1] + b, e[1][0] = e[1][0] + I + (F / 4294967296 >>> 0) >>> 0, e[1][1] = F >>> 0, F = e[2][1] + V, e[2][0] = e[2][0] + _ + (F / 4294967296 >>> 0) >>> 0, e[2][1] = F >>> 0, F = e[3][1] + w, e[3][0] = e[3][0] + k + (F / 4294967296 >>> 0) >>> 0, e[3][1] = F >>> 0, F = e[4][1] + Y, e[4][0] = e[4][0] + G + (F / 4294967296 >>> 0) >>> 0, e[4][1] = F >>> 0, F = e[5][1] + ae, e[5][0] = e[5][0] + re + (F / 4294967296 >>> 0) >>> 0, e[5][1] = F >>> 0, F = e[6][1] + he, e[6][0] = e[6][0] + ne + (F / 4294967296 >>> 0) >>> 0, e[6][1] = F >>> 0, F = e[7][1] + Xe, e[7][0] = e[7][0] + ze + (F / 4294967296 >>> 0) >>> 0, e[7][1] = F >>> 0, Ee -= 128;
  }
}
var Na = {}, U0 = z, xe = U0.asn1;
Na.privateKeyValidator = {
  // PrivateKeyInfo
  name: "PrivateKeyInfo",
  tagClass: xe.Class.UNIVERSAL,
  type: xe.Type.SEQUENCE,
  constructed: !0,
  value: [{
    // Version (INTEGER)
    name: "PrivateKeyInfo.version",
    tagClass: xe.Class.UNIVERSAL,
    type: xe.Type.INTEGER,
    constructed: !1,
    capture: "privateKeyVersion"
  }, {
    // privateKeyAlgorithm
    name: "PrivateKeyInfo.privateKeyAlgorithm",
    tagClass: xe.Class.UNIVERSAL,
    type: xe.Type.SEQUENCE,
    constructed: !0,
    value: [{
      name: "AlgorithmIdentifier.algorithm",
      tagClass: xe.Class.UNIVERSAL,
      type: xe.Type.OID,
      constructed: !1,
      capture: "privateKeyOid"
    }]
  }, {
    // PrivateKey
    name: "PrivateKeyInfo",
    tagClass: xe.Class.UNIVERSAL,
    type: xe.Type.OCTETSTRING,
    constructed: !1,
    capture: "privateKey"
  }]
};
Na.publicKeyValidator = {
  name: "SubjectPublicKeyInfo",
  tagClass: xe.Class.UNIVERSAL,
  type: xe.Type.SEQUENCE,
  constructed: !0,
  captureAsn1: "subjectPublicKeyInfo",
  value: [
    {
      name: "SubjectPublicKeyInfo.AlgorithmIdentifier",
      tagClass: xe.Class.UNIVERSAL,
      type: xe.Type.SEQUENCE,
      constructed: !0,
      value: [{
        name: "AlgorithmIdentifier.algorithm",
        tagClass: xe.Class.UNIVERSAL,
        type: xe.Type.OID,
        constructed: !1,
        capture: "publicKeyOid"
      }]
    },
    // capture group for ed25519PublicKey
    {
      tagClass: xe.Class.UNIVERSAL,
      type: xe.Type.BITSTRING,
      constructed: !1,
      composed: !0,
      captureBitStringValue: "ed25519PublicKey"
    }
    // FIXME: this is capture group for rsaPublicKey, use it in this API or
    // discard?
    /* {
      // subjectPublicKey
      name: 'SubjectPublicKeyInfo.subjectPublicKey',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.BITSTRING,
      constructed: false,
      value: [{
        // RSAPublicKey
        name: 'SubjectPublicKeyInfo.subjectPublicKey.RSAPublicKey',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.SEQUENCE,
        constructed: true,
        optional: true,
        captureAsn1: 'rsaPublicKey'
      }]
    } */
  ]
};
var Be = z, Wn = Na, P0 = Wn.publicKeyValidator, V0 = Wn.privateKeyValidator;
if (typeof O0 > "u")
  var O0 = Be.jsbn.BigInteger;
var ua = Be.util.ByteBuffer, Qe = typeof Buffer > "u" ? Uint8Array : Buffer;
Be.pki = Be.pki || {};
Be.pki.ed25519 = Be.ed25519 = Be.ed25519 || {};
var W = Be.ed25519;
W.constants = {};
W.constants.PUBLIC_KEY_BYTE_LENGTH = 32;
W.constants.PRIVATE_KEY_BYTE_LENGTH = 64;
W.constants.SEED_BYTE_LENGTH = 32;
W.constants.SIGN_BYTE_LENGTH = 64;
W.constants.HASH_BYTE_LENGTH = 64;
W.generateKeyPair = function(e) {
  e = e || {};
  var t = e.seed;
  if (t === void 0)
    t = Be.random.getBytesSync(W.constants.SEED_BYTE_LENGTH);
  else if (typeof t == "string") {
    if (t.length !== W.constants.SEED_BYTE_LENGTH)
      throw new TypeError(
        '"seed" must be ' + W.constants.SEED_BYTE_LENGTH + " bytes in length."
      );
  } else if (!(t instanceof Uint8Array))
    throw new TypeError(
      '"seed" must be a node.js Buffer, Uint8Array, or a binary string.'
    );
  t = gt({ message: t, encoding: "binary" });
  for (var a = new Qe(W.constants.PUBLIC_KEY_BYTE_LENGTH), r = new Qe(W.constants.PRIVATE_KEY_BYTE_LENGTH), n = 0; n < 32; ++n)
    r[n] = t[n];
  return H0(a, r), { publicKey: a, privateKey: r };
};
W.privateKeyFromAsn1 = function(e) {
  var t = {}, a = [], r = Be.asn1.validate(e, V0, t, a);
  if (!r) {
    var n = new Error("Invalid Key.");
    throw n.errors = a, n;
  }
  var s = Be.asn1.derToOid(t.privateKeyOid), i = Be.oids.EdDSA25519;
  if (s !== i)
    throw new Error('Invalid OID "' + s + '"; OID must be "' + i + '".');
  var o = t.privateKey, l = gt({
    message: Be.asn1.fromDer(o).value,
    encoding: "binary"
  });
  return { privateKeyBytes: l };
};
W.publicKeyFromAsn1 = function(e) {
  var t = {}, a = [], r = Be.asn1.validate(e, P0, t, a);
  if (!r) {
    var n = new Error("Invalid Key.");
    throw n.errors = a, n;
  }
  var s = Be.asn1.derToOid(t.publicKeyOid), i = Be.oids.EdDSA25519;
  if (s !== i)
    throw new Error('Invalid OID "' + s + '"; OID must be "' + i + '".');
  var o = t.ed25519PublicKey;
  if (o.length !== W.constants.PUBLIC_KEY_BYTE_LENGTH)
    throw new Error("Key length is invalid.");
  return gt({
    message: o,
    encoding: "binary"
  });
};
W.publicKeyFromPrivateKey = function(e) {
  e = e || {};
  var t = gt({
    message: e.privateKey,
    encoding: "binary"
  });
  if (t.length !== W.constants.PRIVATE_KEY_BYTE_LENGTH)
    throw new TypeError(
      '"options.privateKey" must have a byte length of ' + W.constants.PRIVATE_KEY_BYTE_LENGTH
    );
  for (var a = new Qe(W.constants.PUBLIC_KEY_BYTE_LENGTH), r = 0; r < a.length; ++r)
    a[r] = t[32 + r];
  return a;
};
W.sign = function(e) {
  e = e || {};
  var t = gt(e), a = gt({
    message: e.privateKey,
    encoding: "binary"
  });
  if (a.length === W.constants.SEED_BYTE_LENGTH) {
    var r = W.generateKeyPair({ seed: a });
    a = r.privateKey;
  } else if (a.length !== W.constants.PRIVATE_KEY_BYTE_LENGTH)
    throw new TypeError(
      '"options.privateKey" must have a byte length of ' + W.constants.SEED_BYTE_LENGTH + " or " + W.constants.PRIVATE_KEY_BYTE_LENGTH
    );
  var n = new Qe(
    W.constants.SIGN_BYTE_LENGTH + t.length
  );
  G0(n, t, t.length, a);
  for (var s = new Qe(W.constants.SIGN_BYTE_LENGTH), i = 0; i < s.length; ++i)
    s[i] = n[i];
  return s;
};
W.verify = function(e) {
  e = e || {};
  var t = gt(e);
  if (e.signature === void 0)
    throw new TypeError(
      '"options.signature" must be a node.js Buffer, a Uint8Array, a forge ByteBuffer, or a binary string.'
    );
  var a = gt({
    message: e.signature,
    encoding: "binary"
  });
  if (a.length !== W.constants.SIGN_BYTE_LENGTH)
    throw new TypeError(
      '"options.signature" must have a byte length of ' + W.constants.SIGN_BYTE_LENGTH
    );
  var r = gt({
    message: e.publicKey,
    encoding: "binary"
  });
  if (r.length !== W.constants.PUBLIC_KEY_BYTE_LENGTH)
    throw new TypeError(
      '"options.publicKey" must have a byte length of ' + W.constants.PUBLIC_KEY_BYTE_LENGTH
    );
  var n = new Qe(W.constants.SIGN_BYTE_LENGTH + t.length), s = new Qe(W.constants.SIGN_BYTE_LENGTH + t.length), i;
  for (i = 0; i < W.constants.SIGN_BYTE_LENGTH; ++i)
    n[i] = a[i];
  for (i = 0; i < t.length; ++i)
    n[i + W.constants.SIGN_BYTE_LENGTH] = t[i];
  return q0(s, n, n.length, r) >= 0;
};
function gt(e) {
  var t = e.message;
  if (t instanceof Uint8Array || t instanceof Qe)
    return t;
  var a = e.encoding;
  if (t === void 0)
    if (e.md)
      t = e.md.digest().getBytes(), a = "binary";
    else
      throw new TypeError('"options.message" or "options.md" not specified.');
  if (typeof t == "string" && !a)
    throw new TypeError('"options.encoding" must be "binary" or "utf8".');
  if (typeof t == "string") {
    if (typeof Buffer < "u")
      return Buffer.from(t, a);
    t = new ua(t, a);
  } else if (!(t instanceof ua))
    throw new TypeError(
      '"options.message" must be a node.js Buffer, a Uint8Array, a forge ByteBuffer, or a string with "options.encoding" specifying its encoding.'
    );
  for (var r = new Qe(t.length()), n = 0; n < r.length; ++n)
    r[n] = t.at(n);
  return r;
}
var la = H(), Rr = H([1]), F0 = H([
  30883,
  4953,
  19914,
  30187,
  55467,
  16705,
  2637,
  112,
  59544,
  30585,
  16505,
  36039,
  65139,
  11119,
  27886,
  20995
]), K0 = H([
  61785,
  9906,
  39828,
  60374,
  45398,
  33411,
  5274,
  224,
  53552,
  61171,
  33010,
  6542,
  64743,
  22239,
  55772,
  9222
]), rn = H([
  54554,
  36645,
  11616,
  51542,
  42930,
  38181,
  51040,
  26924,
  56412,
  64982,
  57905,
  49316,
  21502,
  52590,
  14035,
  8553
]), an = H([
  26200,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214
]), or = new Float64Array([
  237,
  211,
  245,
  92,
  26,
  99,
  18,
  88,
  214,
  156,
  247,
  162,
  222,
  249,
  222,
  20,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  16
]), M0 = H([
  41136,
  18958,
  6951,
  50414,
  58488,
  44335,
  6150,
  12099,
  55207,
  15867,
  153,
  11085,
  57099,
  20417,
  9344,
  11139
]);
function ur(e, t) {
  var a = Be.md.sha512.create(), r = new ua(e);
  a.update(r.getBytes(t), "binary");
  var n = a.digest().getBytes();
  if (typeof Buffer < "u")
    return Buffer.from(n, "binary");
  for (var s = new Qe(W.constants.HASH_BYTE_LENGTH), i = 0; i < 64; ++i)
    s[i] = n.charCodeAt(i);
  return s;
}
function H0(e, t) {
  var a = [H(), H(), H(), H()], r, n = ur(t, 32);
  for (n[0] &= 248, n[31] &= 127, n[31] |= 64, wa(a, n), Ra(e, a), r = 0; r < 32; ++r)
    t[r + 32] = e[r];
  return 0;
}
function G0(e, t, a, r) {
  var n, s, i = new Float64Array(64), o = [H(), H(), H(), H()], l = ur(r, 32);
  l[0] &= 248, l[31] &= 127, l[31] |= 64;
  var u = a + 64;
  for (n = 0; n < a; ++n)
    e[64 + n] = t[n];
  for (n = 0; n < 32; ++n)
    e[32 + n] = l[32 + n];
  var f = ur(e.subarray(32), a + 32);
  for (fa(f), wa(o, f), Ra(e, o), n = 32; n < 64; ++n)
    e[n] = r[n];
  var c = ur(e, a + 64);
  for (fa(c), n = 32; n < 64; ++n)
    i[n] = 0;
  for (n = 0; n < 32; ++n)
    i[n] = f[n];
  for (n = 0; n < 32; ++n)
    for (s = 0; s < 32; s++)
      i[n + s] += c[n] * l[s];
  return Xn(e.subarray(32), i), u;
}
function q0(e, t, a, r) {
  var n, s, i = new Qe(32), o = [H(), H(), H(), H()], l = [H(), H(), H(), H()];
  if (s = -1, a < 64 || z0(l, r) || !Q0(t, 32))
    return -1;
  for (n = 0; n < a; ++n)
    e[n] = t[n];
  for (n = 0; n < 32; ++n)
    e[n + 32] = r[n];
  var u = ur(e, a);
  if (fa(u), Jn(o, l, u), wa(l, t.subarray(32)), ca(o, l), Ra(i, o), a -= 64, jn(t, 0, i, 0)) {
    for (n = 0; n < a; ++n)
      e[n] = 0;
    return -1;
  }
  for (n = 0; n < a; ++n)
    e[n] = t[n + 64];
  return s = a, s;
}
function Q0(e, t) {
  var a;
  for (a = 31; a >= 0; --a) {
    if (e[t + a] < or[a])
      return !0;
    if (e[t + a] > or[a])
      return !1;
  }
  return !1;
}
function Xn(e, t) {
  var a, r, n, s;
  for (r = 63; r >= 32; --r) {
    for (a = 0, n = r - 32, s = r - 12; n < s; ++n)
      t[n] += a - 16 * t[r] * or[n - (r - 32)], a = t[n] + 128 >> 8, t[n] -= a * 256;
    t[n] += a, t[r] = 0;
  }
  for (a = 0, n = 0; n < 32; ++n)
    t[n] += a - (t[31] >> 4) * or[n], a = t[n] >> 8, t[n] &= 255;
  for (n = 0; n < 32; ++n)
    t[n] -= a * or[n];
  for (r = 0; r < 32; ++r)
    t[r + 1] += t[r] >> 8, e[r] = t[r] & 255;
}
function fa(e) {
  for (var t = new Float64Array(64), a = 0; a < 64; ++a)
    t[a] = e[a], e[a] = 0;
  Xn(e, t);
}
function ca(e, t) {
  var a = H(), r = H(), n = H(), s = H(), i = H(), o = H(), l = H(), u = H(), f = H();
  Qt(a, e[1], e[0]), Qt(f, t[1], t[0]), se(a, a, f), Gt(r, e[0], e[1]), Gt(f, t[0], t[1]), se(r, r, f), se(n, e[3], t[3]), se(n, n, K0), se(s, e[2], t[2]), Gt(s, s, s), Qt(i, r, a), Qt(o, s, n), Gt(l, s, n), Gt(u, r, a), se(e[0], i, o), se(e[1], u, l), se(e[2], l, o), se(e[3], i, u);
}
function nn(e, t, a) {
  for (var r = 0; r < 4; ++r)
    ei(e[r], t[r], a);
}
function Ra(e, t) {
  var a = H(), r = H(), n = H();
  X0(n, t[2]), se(a, t[0], n), se(r, t[1], n), wr(e, r), e[31] ^= Zn(a) << 7;
}
function wr(e, t) {
  var a, r, n, s = H(), i = H();
  for (a = 0; a < 16; ++a)
    i[a] = t[a];
  for (Yr(i), Yr(i), Yr(i), r = 0; r < 2; ++r) {
    for (s[0] = i[0] - 65517, a = 1; a < 15; ++a)
      s[a] = i[a] - 65535 - (s[a - 1] >> 16 & 1), s[a - 1] &= 65535;
    s[15] = i[15] - 32767 - (s[14] >> 16 & 1), n = s[15] >> 16 & 1, s[14] &= 65535, ei(i, s, 1 - n);
  }
  for (a = 0; a < 16; a++)
    e[2 * a] = i[a] & 255, e[2 * a + 1] = i[a] >> 8;
}
function z0(e, t) {
  var a = H(), r = H(), n = H(), s = H(), i = H(), o = H(), l = H();
  return It(e[2], Rr), Y0(e[1], t), Pt(n, e[1]), se(s, n, F0), Qt(n, n, e[2]), Gt(s, e[2], s), Pt(i, s), Pt(o, i), se(l, o, i), se(a, l, n), se(a, a, s), $0(a, a), se(a, a, n), se(a, a, s), se(a, a, s), se(e[0], a, s), Pt(r, e[0]), se(r, r, s), sn(r, n) && se(e[0], e[0], M0), Pt(r, e[0]), se(r, r, s), sn(r, n) ? -1 : (Zn(e[0]) === t[31] >> 7 && Qt(e[0], la, e[0]), se(e[3], e[0], e[1]), 0);
}
function Y0(e, t) {
  var a;
  for (a = 0; a < 16; ++a)
    e[a] = t[2 * a] + (t[2 * a + 1] << 8);
  e[15] &= 32767;
}
function $0(e, t) {
  var a = H(), r;
  for (r = 0; r < 16; ++r)
    a[r] = t[r];
  for (r = 250; r >= 0; --r)
    Pt(a, a), r !== 1 && se(a, a, t);
  for (r = 0; r < 16; ++r)
    e[r] = a[r];
}
function sn(e, t) {
  var a = new Qe(32), r = new Qe(32);
  return wr(a, e), wr(r, t), jn(a, 0, r, 0);
}
function jn(e, t, a, r) {
  return W0(e, t, a, r, 32);
}
function W0(e, t, a, r, n) {
  var s, i = 0;
  for (s = 0; s < n; ++s)
    i |= e[t + s] ^ a[r + s];
  return (1 & i - 1 >>> 8) - 1;
}
function Zn(e) {
  var t = new Qe(32);
  return wr(t, e), t[0] & 1;
}
function Jn(e, t, a) {
  var r, n;
  for (It(e[0], la), It(e[1], Rr), It(e[2], Rr), It(e[3], la), n = 255; n >= 0; --n)
    r = a[n / 8 | 0] >> (n & 7) & 1, nn(e, t, r), ca(t, e), ca(e, e), nn(e, t, r);
}
function wa(e, t) {
  var a = [H(), H(), H(), H()];
  It(a[0], rn), It(a[1], an), It(a[2], Rr), se(a[3], rn, an), Jn(e, a, t);
}
function It(e, t) {
  var a;
  for (a = 0; a < 16; a++)
    e[a] = t[a] | 0;
}
function X0(e, t) {
  var a = H(), r;
  for (r = 0; r < 16; ++r)
    a[r] = t[r];
  for (r = 253; r >= 0; --r)
    Pt(a, a), r !== 2 && r !== 4 && se(a, a, t);
  for (r = 0; r < 16; ++r)
    e[r] = a[r];
}
function Yr(e) {
  var t, a, r = 1;
  for (t = 0; t < 16; ++t)
    a = e[t] + r + 65535, r = Math.floor(a / 65536), e[t] = a - r * 65536;
  e[0] += r - 1 + 37 * (r - 1);
}
function ei(e, t, a) {
  for (var r, n = ~(a - 1), s = 0; s < 16; ++s)
    r = n & (e[s] ^ t[s]), e[s] ^= r, t[s] ^= r;
}
function H(e) {
  var t, a = new Float64Array(16);
  if (e)
    for (t = 0; t < e.length; ++t)
      a[t] = e[t];
  return a;
}
function Gt(e, t, a) {
  for (var r = 0; r < 16; ++r)
    e[r] = t[r] + a[r];
}
function Qt(e, t, a) {
  for (var r = 0; r < 16; ++r)
    e[r] = t[r] - a[r];
}
function Pt(e, t) {
  se(e, t, t);
}
function se(e, t, a) {
  var r, n, s = 0, i = 0, o = 0, l = 0, u = 0, f = 0, c = 0, v = 0, m = 0, y = 0, x = 0, S = 0, I = 0, b = 0, _ = 0, V = 0, k = 0, w = 0, G = 0, Y = 0, re = 0, ae = 0, ne = 0, he = 0, ze = 0, Xe = 0, ie = 0, ye = 0, F = 0, Rt = 0, Mt = 0, ge = a[0], me = a[1], Ee = a[2], be = a[3], _e = a[4], Ne = a[5], Re = a[6], we = a[7], Le = a[8], ke = a[9], De = a[10], Ue = a[11], Pe = a[12], Ve = a[13], Oe = a[14], Fe = a[15];
  r = t[0], s += r * ge, i += r * me, o += r * Ee, l += r * be, u += r * _e, f += r * Ne, c += r * Re, v += r * we, m += r * Le, y += r * ke, x += r * De, S += r * Ue, I += r * Pe, b += r * Ve, _ += r * Oe, V += r * Fe, r = t[1], i += r * ge, o += r * me, l += r * Ee, u += r * be, f += r * _e, c += r * Ne, v += r * Re, m += r * we, y += r * Le, x += r * ke, S += r * De, I += r * Ue, b += r * Pe, _ += r * Ve, V += r * Oe, k += r * Fe, r = t[2], o += r * ge, l += r * me, u += r * Ee, f += r * be, c += r * _e, v += r * Ne, m += r * Re, y += r * we, x += r * Le, S += r * ke, I += r * De, b += r * Ue, _ += r * Pe, V += r * Ve, k += r * Oe, w += r * Fe, r = t[3], l += r * ge, u += r * me, f += r * Ee, c += r * be, v += r * _e, m += r * Ne, y += r * Re, x += r * we, S += r * Le, I += r * ke, b += r * De, _ += r * Ue, V += r * Pe, k += r * Ve, w += r * Oe, G += r * Fe, r = t[4], u += r * ge, f += r * me, c += r * Ee, v += r * be, m += r * _e, y += r * Ne, x += r * Re, S += r * we, I += r * Le, b += r * ke, _ += r * De, V += r * Ue, k += r * Pe, w += r * Ve, G += r * Oe, Y += r * Fe, r = t[5], f += r * ge, c += r * me, v += r * Ee, m += r * be, y += r * _e, x += r * Ne, S += r * Re, I += r * we, b += r * Le, _ += r * ke, V += r * De, k += r * Ue, w += r * Pe, G += r * Ve, Y += r * Oe, re += r * Fe, r = t[6], c += r * ge, v += r * me, m += r * Ee, y += r * be, x += r * _e, S += r * Ne, I += r * Re, b += r * we, _ += r * Le, V += r * ke, k += r * De, w += r * Ue, G += r * Pe, Y += r * Ve, re += r * Oe, ae += r * Fe, r = t[7], v += r * ge, m += r * me, y += r * Ee, x += r * be, S += r * _e, I += r * Ne, b += r * Re, _ += r * we, V += r * Le, k += r * ke, w += r * De, G += r * Ue, Y += r * Pe, re += r * Ve, ae += r * Oe, ne += r * Fe, r = t[8], m += r * ge, y += r * me, x += r * Ee, S += r * be, I += r * _e, b += r * Ne, _ += r * Re, V += r * we, k += r * Le, w += r * ke, G += r * De, Y += r * Ue, re += r * Pe, ae += r * Ve, ne += r * Oe, he += r * Fe, r = t[9], y += r * ge, x += r * me, S += r * Ee, I += r * be, b += r * _e, _ += r * Ne, V += r * Re, k += r * we, w += r * Le, G += r * ke, Y += r * De, re += r * Ue, ae += r * Pe, ne += r * Ve, he += r * Oe, ze += r * Fe, r = t[10], x += r * ge, S += r * me, I += r * Ee, b += r * be, _ += r * _e, V += r * Ne, k += r * Re, w += r * we, G += r * Le, Y += r * ke, re += r * De, ae += r * Ue, ne += r * Pe, he += r * Ve, ze += r * Oe, Xe += r * Fe, r = t[11], S += r * ge, I += r * me, b += r * Ee, _ += r * be, V += r * _e, k += r * Ne, w += r * Re, G += r * we, Y += r * Le, re += r * ke, ae += r * De, ne += r * Ue, he += r * Pe, ze += r * Ve, Xe += r * Oe, ie += r * Fe, r = t[12], I += r * ge, b += r * me, _ += r * Ee, V += r * be, k += r * _e, w += r * Ne, G += r * Re, Y += r * we, re += r * Le, ae += r * ke, ne += r * De, he += r * Ue, ze += r * Pe, Xe += r * Ve, ie += r * Oe, ye += r * Fe, r = t[13], b += r * ge, _ += r * me, V += r * Ee, k += r * be, w += r * _e, G += r * Ne, Y += r * Re, re += r * we, ae += r * Le, ne += r * ke, he += r * De, ze += r * Ue, Xe += r * Pe, ie += r * Ve, ye += r * Oe, F += r * Fe, r = t[14], _ += r * ge, V += r * me, k += r * Ee, w += r * be, G += r * _e, Y += r * Ne, re += r * Re, ae += r * we, ne += r * Le, he += r * ke, ze += r * De, Xe += r * Ue, ie += r * Pe, ye += r * Ve, F += r * Oe, Rt += r * Fe, r = t[15], V += r * ge, k += r * me, w += r * Ee, G += r * be, Y += r * _e, re += r * Ne, ae += r * Re, ne += r * we, he += r * Le, ze += r * ke, Xe += r * De, ie += r * Ue, ye += r * Pe, F += r * Ve, Rt += r * Oe, Mt += r * Fe, s += 38 * k, i += 38 * w, o += 38 * G, l += 38 * Y, u += 38 * re, f += 38 * ae, c += 38 * ne, v += 38 * he, m += 38 * ze, y += 38 * Xe, x += 38 * ie, S += 38 * ye, I += 38 * F, b += 38 * Rt, _ += 38 * Mt, n = 1, r = s + n + 65535, n = Math.floor(r / 65536), s = r - n * 65536, r = i + n + 65535, n = Math.floor(r / 65536), i = r - n * 65536, r = o + n + 65535, n = Math.floor(r / 65536), o = r - n * 65536, r = l + n + 65535, n = Math.floor(r / 65536), l = r - n * 65536, r = u + n + 65535, n = Math.floor(r / 65536), u = r - n * 65536, r = f + n + 65535, n = Math.floor(r / 65536), f = r - n * 65536, r = c + n + 65535, n = Math.floor(r / 65536), c = r - n * 65536, r = v + n + 65535, n = Math.floor(r / 65536), v = r - n * 65536, r = m + n + 65535, n = Math.floor(r / 65536), m = r - n * 65536, r = y + n + 65535, n = Math.floor(r / 65536), y = r - n * 65536, r = x + n + 65535, n = Math.floor(r / 65536), x = r - n * 65536, r = S + n + 65535, n = Math.floor(r / 65536), S = r - n * 65536, r = I + n + 65535, n = Math.floor(r / 65536), I = r - n * 65536, r = b + n + 65535, n = Math.floor(r / 65536), b = r - n * 65536, r = _ + n + 65535, n = Math.floor(r / 65536), _ = r - n * 65536, r = V + n + 65535, n = Math.floor(r / 65536), V = r - n * 65536, s += n - 1 + 37 * (n - 1), n = 1, r = s + n + 65535, n = Math.floor(r / 65536), s = r - n * 65536, r = i + n + 65535, n = Math.floor(r / 65536), i = r - n * 65536, r = o + n + 65535, n = Math.floor(r / 65536), o = r - n * 65536, r = l + n + 65535, n = Math.floor(r / 65536), l = r - n * 65536, r = u + n + 65535, n = Math.floor(r / 65536), u = r - n * 65536, r = f + n + 65535, n = Math.floor(r / 65536), f = r - n * 65536, r = c + n + 65535, n = Math.floor(r / 65536), c = r - n * 65536, r = v + n + 65535, n = Math.floor(r / 65536), v = r - n * 65536, r = m + n + 65535, n = Math.floor(r / 65536), m = r - n * 65536, r = y + n + 65535, n = Math.floor(r / 65536), y = r - n * 65536, r = x + n + 65535, n = Math.floor(r / 65536), x = r - n * 65536, r = S + n + 65535, n = Math.floor(r / 65536), S = r - n * 65536, r = I + n + 65535, n = Math.floor(r / 65536), I = r - n * 65536, r = b + n + 65535, n = Math.floor(r / 65536), b = r - n * 65536, r = _ + n + 65535, n = Math.floor(r / 65536), _ = r - n * 65536, r = V + n + 65535, n = Math.floor(r / 65536), V = r - n * 65536, s += n - 1 + 37 * (n - 1), e[0] = s, e[1] = i, e[2] = o, e[3] = l, e[4] = u, e[5] = f, e[6] = c, e[7] = v, e[8] = m, e[9] = y, e[10] = x, e[11] = S, e[12] = I, e[13] = b, e[14] = _, e[15] = V;
}
var We = z;
We.kem = We.kem || {};
var on = We.jsbn.BigInteger;
We.kem.rsa = {};
We.kem.rsa.create = function(e, t) {
  t = t || {};
  var a = t.prng || We.random, r = {};
  return r.encrypt = function(n, s) {
    var i = Math.ceil(n.n.bitLength() / 8), o;
    do
      o = new on(
        We.util.bytesToHex(a.getBytesSync(i)),
        16
      ).mod(n.n);
    while (o.compareTo(on.ONE) <= 0);
    o = We.util.hexToBytes(o.toString(16));
    var l = i - o.length;
    l > 0 && (o = We.util.fillString("\0", l) + o);
    var u = n.encrypt(o, "NONE"), f = e.generate(o, s);
    return { encapsulation: u, key: f };
  }, r.decrypt = function(n, s, i) {
    var o = n.decrypt(s, "NONE");
    return e.generate(o, i);
  }, r;
};
We.kem.kdf1 = function(e, t) {
  ti(this, e, 0, t || e.digestLength);
};
We.kem.kdf2 = function(e, t) {
  ti(this, e, 1, t || e.digestLength);
};
function ti(e, t, a, r) {
  e.generate = function(n, s) {
    for (var i = new We.util.ByteBuffer(), o = Math.ceil(s / r) + a, l = new We.util.ByteBuffer(), u = a; u < o; ++u) {
      l.putInt32(u), t.start(), t.update(n + l.getBytes());
      var f = t.digest();
      i.putBytes(f.getBytes(r));
    }
    return i.truncate(i.length() - s), i.getBytes();
  };
}
var j = z;
j.log = j.log || {};
j.log.levels = [
  "none",
  "error",
  "warning",
  "info",
  "debug",
  "verbose",
  "max"
];
var Lr = {}, ha = [], lr = null;
j.log.LEVEL_LOCKED = 2;
j.log.NO_LEVEL_CHECK = 4;
j.log.INTERPOLATE = 8;
for (var At = 0; At < j.log.levels.length; ++At) {
  var un = j.log.levels[At];
  Lr[un] = {
    index: At,
    name: un.toUpperCase()
  };
}
j.log.logMessage = function(e) {
  for (var t = Lr[e.level].index, a = 0; a < ha.length; ++a) {
    var r = ha[a];
    if (r.flags & j.log.NO_LEVEL_CHECK)
      r.f(e);
    else {
      var n = Lr[r.level].index;
      t <= n && r.f(r, e);
    }
  }
};
j.log.prepareStandard = function(e) {
  "standard" in e || (e.standard = Lr[e.level].name + //' ' + +message.timestamp +
  " [" + e.category + "] " + e.message);
};
j.log.prepareFull = function(e) {
  if (!("full" in e)) {
    var t = [e.message];
    t = t.concat([]), e.full = j.util.format.apply(this, t);
  }
};
j.log.prepareStandardFull = function(e) {
  "standardFull" in e || (j.log.prepareStandard(e), e.standardFull = e.standard);
};
for (var ln = ["error", "warning", "info", "debug", "verbose"], At = 0; At < ln.length; ++At)
  (function(t) {
    j.log[t] = function(a, r) {
      var n = Array.prototype.slice.call(arguments).slice(2), s = {
        timestamp: /* @__PURE__ */ new Date(),
        level: t,
        category: a,
        message: r,
        arguments: n
        /*standard*/
        /*full*/
        /*fullMessage*/
      };
      j.log.logMessage(s);
    };
  })(ln[At]);
j.log.makeLogger = function(e) {
  var t = {
    flags: 0,
    f: e
  };
  return j.log.setLevel(t, "none"), t;
};
j.log.setLevel = function(e, t) {
  var a = !1;
  if (e && !(e.flags & j.log.LEVEL_LOCKED))
    for (var r = 0; r < j.log.levels.length; ++r) {
      var n = j.log.levels[r];
      if (t == n) {
        e.level = t, a = !0;
        break;
      }
    }
  return a;
};
j.log.lock = function(e, t) {
  typeof t > "u" || t ? e.flags |= j.log.LEVEL_LOCKED : e.flags &= ~j.log.LEVEL_LOCKED;
};
j.log.addLogger = function(e) {
  ha.push(e);
};
if (typeof console < "u" && "log" in console) {
  var ar;
  if (console.error && console.warn && console.info && console.debug) {
    var j0 = {
      error: console.error,
      warning: console.warn,
      info: console.info,
      debug: console.debug,
      verbose: console.debug
    }, La = function(e, t) {
      j.log.prepareStandard(t);
      var a = j0[t.level], r = [t.standard];
      r = r.concat(t.arguments.slice()), a.apply(console, r);
    };
    ar = j.log.makeLogger(La);
  } else {
    var La = function(t, a) {
      j.log.prepareStandardFull(a), console.log(a.standardFull);
    };
    ar = j.log.makeLogger(La);
  }
  j.log.setLevel(ar, "debug"), j.log.addLogger(ar), lr = ar;
} else
  console = {
    log: function() {
    }
  };
if (lr !== null && typeof window < "u" && window.location) {
  var yr = new URL(window.location.href).searchParams;
  if (yr.has("console.level") && j.log.setLevel(
    lr,
    yr.get("console.level").slice(-1)[0]
  ), yr.has("console.lock")) {
    var Z0 = yr.get("console.lock").slice(-1)[0];
    Z0 == "true" && j.log.lock(lr);
  }
}
j.log.consoleLogger = lr;
var D = z, C = D.asn1, Ge = D.pkcs7 = D.pkcs7 || {};
Ge.messageFromPem = function(e) {
  var t = D.pem.decode(e)[0];
  if (t.type !== "PKCS7") {
    var a = new Error('Could not convert PKCS#7 message from PEM; PEM header type is not "PKCS#7".');
    throw a.headerType = t.type, a;
  }
  if (t.procType && t.procType.type === "ENCRYPTED")
    throw new Error("Could not convert PKCS#7 message from PEM; PEM is encrypted.");
  var r = C.fromDer(t.body);
  return Ge.messageFromAsn1(r);
};
Ge.messageToPem = function(e, t) {
  var a = {
    type: "PKCS7",
    body: C.toDer(e.toAsn1()).getBytes()
  };
  return D.pem.encode(a, { maxline: t });
};
Ge.messageFromAsn1 = function(e) {
  var t = {}, a = [];
  if (!C.validate(e, Ge.asn1.contentInfoValidator, t, a)) {
    var r = new Error("Cannot read PKCS#7 message. ASN.1 object is not an PKCS#7 ContentInfo.");
    throw r.errors = a, r;
  }
  var n = C.derToOid(t.contentType), s;
  switch (n) {
    case D.pki.oids.envelopedData:
      s = Ge.createEnvelopedData();
      break;
    case D.pki.oids.encryptedData:
      s = Ge.createEncryptedData();
      break;
    case D.pki.oids.signedData:
      s = Ge.createSignedData();
      break;
    default:
      throw new Error("Cannot read PKCS#7 message. ContentType with OID " + n + " is not (yet) supported.");
  }
  return s.fromAsn1(t.content.value[0]), s;
};
Ge.createSignedData = function() {
  var e = null;
  return e = {
    type: D.pki.oids.signedData,
    version: 1,
    certificates: [],
    crls: [],
    // TODO: add json-formatted signer stuff here?
    signers: [],
    // populated during sign()
    digestAlgorithmIdentifiers: [],
    contentInfo: null,
    signerInfos: [],
    fromAsn1: function(r) {
      if (ka(e, r, Ge.asn1.signedDataValidator), e.certificates = [], e.crls = [], e.digestAlgorithmIdentifiers = [], e.contentInfo = null, e.signerInfos = [], e.rawCapture.certificates)
        for (var n = e.rawCapture.certificates.value, s = 0; s < n.length; ++s)
          e.certificates.push(D.pki.certificateFromAsn1(n[s]));
    },
    toAsn1: function() {
      e.contentInfo || e.sign();
      for (var r = [], n = 0; n < e.certificates.length; ++n)
        r.push(D.pki.certificateToAsn1(e.certificates[n]));
      var s = [], i = C.create(C.Class.CONTEXT_SPECIFIC, 0, !0, [
        C.create(C.Class.UNIVERSAL, C.Type.SEQUENCE, !0, [
          // Version
          C.create(
            C.Class.UNIVERSAL,
            C.Type.INTEGER,
            !1,
            C.integerToDer(e.version).getBytes()
          ),
          // DigestAlgorithmIdentifiers
          C.create(
            C.Class.UNIVERSAL,
            C.Type.SET,
            !0,
            e.digestAlgorithmIdentifiers
          ),
          // ContentInfo
          e.contentInfo
        ])
      ]);
      return r.length > 0 && i.value[0].value.push(
        C.create(C.Class.CONTEXT_SPECIFIC, 0, !0, r)
      ), s.length > 0 && i.value[0].value.push(
        C.create(C.Class.CONTEXT_SPECIFIC, 1, !0, s)
      ), i.value[0].value.push(
        C.create(
          C.Class.UNIVERSAL,
          C.Type.SET,
          !0,
          e.signerInfos
        )
      ), C.create(
        C.Class.UNIVERSAL,
        C.Type.SEQUENCE,
        !0,
        [
          // ContentType
          C.create(
            C.Class.UNIVERSAL,
            C.Type.OID,
            !1,
            C.oidToDer(e.type).getBytes()
          ),
          // [0] SignedData
          i
        ]
      );
    },
    /**
     * Add (another) entity to list of signers.
     *
     * Note: If authenticatedAttributes are provided, then, per RFC 2315,
     * they must include at least two attributes: content type and
     * message digest. The message digest attribute value will be
     * auto-calculated during signing and will be ignored if provided.
     *
     * Here's an example of providing these two attributes:
     *
     * forge.pkcs7.createSignedData();
     * p7.addSigner({
     *   issuer: cert.issuer.attributes,
     *   serialNumber: cert.serialNumber,
     *   key: privateKey,
     *   digestAlgorithm: forge.pki.oids.sha1,
     *   authenticatedAttributes: [{
     *     type: forge.pki.oids.contentType,
     *     value: forge.pki.oids.data
     *   }, {
     *     type: forge.pki.oids.messageDigest
     *   }]
     * });
     *
     * TODO: Support [subjectKeyIdentifier] as signer's ID.
     *
     * @param signer the signer information:
     *          key the signer's private key.
     *          [certificate] a certificate containing the public key
     *            associated with the signer's private key; use this option as
     *            an alternative to specifying signer.issuer and
     *            signer.serialNumber.
     *          [issuer] the issuer attributes (eg: cert.issuer.attributes).
     *          [serialNumber] the signer's certificate's serial number in
     *           hexadecimal (eg: cert.serialNumber).
     *          [digestAlgorithm] the message digest OID, as a string, to use
     *            (eg: forge.pki.oids.sha1).
     *          [authenticatedAttributes] an optional array of attributes
     *            to also sign along with the content.
     */
    addSigner: function(r) {
      var n = r.issuer, s = r.serialNumber;
      if (r.certificate) {
        var i = r.certificate;
        typeof i == "string" && (i = D.pki.certificateFromPem(i)), n = i.issuer.attributes, s = i.serialNumber;
      }
      var o = r.key;
      if (!o)
        throw new Error(
          "Could not add PKCS#7 signer; no private key specified."
        );
      typeof o == "string" && (o = D.pki.privateKeyFromPem(o));
      var l = r.digestAlgorithm || D.pki.oids.sha1;
      switch (l) {
        case D.pki.oids.sha1:
        case D.pki.oids.sha256:
        case D.pki.oids.sha384:
        case D.pki.oids.sha512:
        case D.pki.oids.md5:
          break;
        default:
          throw new Error(
            "Could not add PKCS#7 signer; unknown message digest algorithm: " + l
          );
      }
      var u = r.authenticatedAttributes || [];
      if (u.length > 0) {
        for (var f = !1, c = !1, v = 0; v < u.length; ++v) {
          var m = u[v];
          if (!f && m.type === D.pki.oids.contentType) {
            if (f = !0, c)
              break;
            continue;
          }
          if (!c && m.type === D.pki.oids.messageDigest) {
            if (c = !0, f)
              break;
            continue;
          }
        }
        if (!f || !c)
          throw new Error("Invalid signer.authenticatedAttributes. If signer.authenticatedAttributes is specified, then it must contain at least two attributes, PKCS #9 content-type and PKCS #9 message-digest.");
      }
      e.signers.push({
        key: o,
        version: 1,
        issuer: n,
        serialNumber: s,
        digestAlgorithm: l,
        signatureAlgorithm: D.pki.oids.rsaEncryption,
        signature: null,
        authenticatedAttributes: u,
        unauthenticatedAttributes: []
      });
    },
    /**
     * Signs the content.
     * @param options Options to apply when signing:
     *    [detached] boolean. If signing should be done in detached mode. Defaults to false.
     */
    sign: function(r) {
      if (r = r || {}, (typeof e.content != "object" || e.contentInfo === null) && (e.contentInfo = C.create(
        C.Class.UNIVERSAL,
        C.Type.SEQUENCE,
        !0,
        [
          // ContentType
          C.create(
            C.Class.UNIVERSAL,
            C.Type.OID,
            !1,
            C.oidToDer(D.pki.oids.data).getBytes()
          )
        ]
      ), "content" in e)) {
        var n;
        e.content instanceof D.util.ByteBuffer ? n = e.content.bytes() : typeof e.content == "string" && (n = D.util.encodeUtf8(e.content)), r.detached ? e.detachedContent = C.create(C.Class.UNIVERSAL, C.Type.OCTETSTRING, !1, n) : e.contentInfo.value.push(
          // [0] EXPLICIT content
          C.create(C.Class.CONTEXT_SPECIFIC, 0, !0, [
            C.create(
              C.Class.UNIVERSAL,
              C.Type.OCTETSTRING,
              !1,
              n
            )
          ])
        );
      }
      if (e.signers.length !== 0) {
        var s = t();
        a(s);
      }
    },
    verify: function() {
      throw new Error("PKCS#7 signature verification not yet implemented.");
    },
    /**
     * Add a certificate.
     *
     * @param cert the certificate to add.
     */
    addCertificate: function(r) {
      typeof r == "string" && (r = D.pki.certificateFromPem(r)), e.certificates.push(r);
    },
    /**
     * Add a certificate revokation list.
     *
     * @param crl the certificate revokation list to add.
     */
    addCertificateRevokationList: function(r) {
      throw new Error("PKCS#7 CRL support not yet implemented.");
    }
  }, e;
  function t() {
    for (var r = {}, n = 0; n < e.signers.length; ++n) {
      var s = e.signers[n], i = s.digestAlgorithm;
      i in r || (r[i] = D.md[D.pki.oids[i]].create()), s.authenticatedAttributes.length === 0 ? s.md = r[i] : s.md = D.md[D.pki.oids[i]].create();
    }
    e.digestAlgorithmIdentifiers = [];
    for (var i in r)
      e.digestAlgorithmIdentifiers.push(
        // AlgorithmIdentifier
        C.create(C.Class.UNIVERSAL, C.Type.SEQUENCE, !0, [
          // algorithm
          C.create(
            C.Class.UNIVERSAL,
            C.Type.OID,
            !1,
            C.oidToDer(i).getBytes()
          ),
          // parameters (null)
          C.create(C.Class.UNIVERSAL, C.Type.NULL, !1, "")
        ])
      );
    return r;
  }
  function a(r) {
    var n;
    if (e.detachedContent ? n = e.detachedContent : (n = e.contentInfo.value[1], n = n.value[0]), !n)
      throw new Error(
        "Could not sign PKCS#7 message; there is no content to sign."
      );
    var s = C.derToOid(e.contentInfo.value[0].value), i = C.toDer(n);
    i.getByte(), C.getBerValueLength(i), i = i.getBytes();
    for (var o in r)
      r[o].start().update(i);
    for (var l = /* @__PURE__ */ new Date(), u = 0; u < e.signers.length; ++u) {
      var f = e.signers[u];
      if (f.authenticatedAttributes.length === 0) {
        if (s !== D.pki.oids.data)
          throw new Error(
            "Invalid signer; authenticatedAttributes must be present when the ContentInfo content type is not PKCS#7 Data."
          );
      } else {
        f.authenticatedAttributesAsn1 = C.create(
          C.Class.CONTEXT_SPECIFIC,
          0,
          !0,
          []
        );
        for (var c = C.create(
          C.Class.UNIVERSAL,
          C.Type.SET,
          !0,
          []
        ), v = 0; v < f.authenticatedAttributes.length; ++v) {
          var m = f.authenticatedAttributes[v];
          m.type === D.pki.oids.messageDigest ? m.value = r[f.digestAlgorithm].digest() : m.type === D.pki.oids.signingTime && (m.value || (m.value = l)), c.value.push(da(m)), f.authenticatedAttributesAsn1.value.push(da(m));
        }
        i = C.toDer(c).getBytes(), f.md.start().update(i);
      }
      f.signature = f.key.sign(f.md, "RSASSA-PKCS1-V1_5");
    }
    e.signerInfos = nu(e.signers);
  }
};
Ge.createEncryptedData = function() {
  var e = null;
  return e = {
    type: D.pki.oids.encryptedData,
    version: 0,
    encryptedContent: {
      algorithm: D.pki.oids["aes256-CBC"]
    },
    /**
     * Reads an EncryptedData content block (in ASN.1 format)
     *
     * @param obj The ASN.1 representation of the EncryptedData content block
     */
    fromAsn1: function(t) {
      ka(e, t, Ge.asn1.encryptedDataValidator);
    },
    /**
     * Decrypt encrypted content
     *
     * @param key The (symmetric) key as a byte buffer
     */
    decrypt: function(t) {
      t !== void 0 && (e.encryptedContent.key = t), ri(e);
    }
  }, e;
};
Ge.createEnvelopedData = function() {
  var e = null;
  return e = {
    type: D.pki.oids.envelopedData,
    version: 0,
    recipients: [],
    encryptedContent: {
      algorithm: D.pki.oids["aes256-CBC"]
    },
    /**
     * Reads an EnvelopedData content block (in ASN.1 format)
     *
     * @param obj the ASN.1 representation of the EnvelopedData content block.
     */
    fromAsn1: function(t) {
      var a = ka(e, t, Ge.asn1.envelopedDataValidator);
      e.recipients = tu(a.recipientInfos.value);
    },
    toAsn1: function() {
      return C.create(C.Class.UNIVERSAL, C.Type.SEQUENCE, !0, [
        // ContentType
        C.create(
          C.Class.UNIVERSAL,
          C.Type.OID,
          !1,
          C.oidToDer(e.type).getBytes()
        ),
        // [0] EnvelopedData
        C.create(C.Class.CONTEXT_SPECIFIC, 0, !0, [
          C.create(C.Class.UNIVERSAL, C.Type.SEQUENCE, !0, [
            // Version
            C.create(
              C.Class.UNIVERSAL,
              C.Type.INTEGER,
              !1,
              C.integerToDer(e.version).getBytes()
            ),
            // RecipientInfos
            C.create(
              C.Class.UNIVERSAL,
              C.Type.SET,
              !0,
              ru(e.recipients)
            ),
            // EncryptedContentInfo
            C.create(
              C.Class.UNIVERSAL,
              C.Type.SEQUENCE,
              !0,
              iu(e.encryptedContent)
            )
          ])
        ])
      ]);
    },
    /**
     * Find recipient by X.509 certificate's issuer.
     *
     * @param cert the certificate with the issuer to look for.
     *
     * @return the recipient object.
     */
    findRecipient: function(t) {
      for (var a = t.issuer.attributes, r = 0; r < e.recipients.length; ++r) {
        var n = e.recipients[r], s = n.issuer;
        if (n.serialNumber === t.serialNumber && s.length === a.length) {
          for (var i = !0, o = 0; o < a.length; ++o)
            if (s[o].type !== a[o].type || s[o].value !== a[o].value) {
              i = !1;
              break;
            }
          if (i)
            return n;
        }
      }
      return null;
    },
    /**
     * Decrypt enveloped content
     *
     * @param recipient The recipient object related to the private key
     * @param privKey The (RSA) private key object
     */
    decrypt: function(t, a) {
      if (e.encryptedContent.key === void 0 && t !== void 0 && a !== void 0)
        switch (t.encryptedContent.algorithm) {
          case D.pki.oids.rsaEncryption:
          case D.pki.oids.desCBC:
            var r = a.decrypt(t.encryptedContent.content);
            e.encryptedContent.key = D.util.createBuffer(r);
            break;
          default:
            throw new Error("Unsupported asymmetric cipher, OID " + t.encryptedContent.algorithm);
        }
      ri(e);
    },
    /**
     * Add (another) entity to list of recipients.
     *
     * @param cert The certificate of the entity to add.
     */
    addRecipient: function(t) {
      e.recipients.push({
        version: 0,
        issuer: t.issuer.attributes,
        serialNumber: t.serialNumber,
        encryptedContent: {
          // We simply assume rsaEncryption here, since forge.pki only
          // supports RSA so far.  If the PKI module supports other
          // ciphers one day, we need to modify this one as well.
          algorithm: D.pki.oids.rsaEncryption,
          key: t.publicKey
        }
      });
    },
    /**
     * Encrypt enveloped content.
     *
     * This function supports two optional arguments, cipher and key, which
     * can be used to influence symmetric encryption.  Unless cipher is
     * provided, the cipher specified in encryptedContent.algorithm is used
     * (defaults to AES-256-CBC).  If no key is provided, encryptedContent.key
     * is (re-)used.  If that one's not set, a random key will be generated
     * automatically.
     *
     * @param [key] The key to be used for symmetric encryption.
     * @param [cipher] The OID of the symmetric cipher to use.
     */
    encrypt: function(t, a) {
      if (e.encryptedContent.content === void 0) {
        a = a || e.encryptedContent.algorithm, t = t || e.encryptedContent.key;
        var r, n, s;
        switch (a) {
          case D.pki.oids["aes128-CBC"]:
            r = 16, n = 16, s = D.aes.createEncryptionCipher;
            break;
          case D.pki.oids["aes192-CBC"]:
            r = 24, n = 16, s = D.aes.createEncryptionCipher;
            break;
          case D.pki.oids["aes256-CBC"]:
            r = 32, n = 16, s = D.aes.createEncryptionCipher;
            break;
          case D.pki.oids["des-EDE3-CBC"]:
            r = 24, n = 8, s = D.des.createEncryptionCipher;
            break;
          default:
            throw new Error("Unsupported symmetric cipher, OID " + a);
        }
        if (t === void 0)
          t = D.util.createBuffer(D.random.getBytes(r));
        else if (t.length() != r)
          throw new Error("Symmetric key has wrong length; got " + t.length() + " bytes, expected " + r + ".");
        e.encryptedContent.algorithm = a, e.encryptedContent.key = t, e.encryptedContent.parameter = D.util.createBuffer(
          D.random.getBytes(n)
        );
        var i = s(t);
        if (i.start(e.encryptedContent.parameter.copy()), i.update(e.content), !i.finish())
          throw new Error("Symmetric encryption failed.");
        e.encryptedContent.content = i.output;
      }
      for (var o = 0; o < e.recipients.length; ++o) {
        var l = e.recipients[o];
        if (l.encryptedContent.content === void 0)
          switch (l.encryptedContent.algorithm) {
            case D.pki.oids.rsaEncryption:
              l.encryptedContent.content = l.encryptedContent.key.encrypt(
                e.encryptedContent.key.data
              );
              break;
            default:
              throw new Error("Unsupported asymmetric cipher, OID " + l.encryptedContent.algorithm);
          }
      }
    }
  }, e;
};
function J0(e) {
  var t = {}, a = [];
  if (!C.validate(e, Ge.asn1.recipientInfoValidator, t, a)) {
    var r = new Error("Cannot read PKCS#7 RecipientInfo. ASN.1 object is not an PKCS#7 RecipientInfo.");
    throw r.errors = a, r;
  }
  return {
    version: t.version.charCodeAt(0),
    issuer: D.pki.RDNAttributesAsArray(t.issuer),
    serialNumber: D.util.createBuffer(t.serial).toHex(),
    encryptedContent: {
      algorithm: C.derToOid(t.encAlgorithm),
      parameter: t.encParameter ? t.encParameter.value : void 0,
      content: t.encKey
    }
  };
}
function eu(e) {
  return C.create(C.Class.UNIVERSAL, C.Type.SEQUENCE, !0, [
    // Version
    C.create(
      C.Class.UNIVERSAL,
      C.Type.INTEGER,
      !1,
      C.integerToDer(e.version).getBytes()
    ),
    // IssuerAndSerialNumber
    C.create(C.Class.UNIVERSAL, C.Type.SEQUENCE, !0, [
      // Name
      D.pki.distinguishedNameToAsn1({ attributes: e.issuer }),
      // Serial
      C.create(
        C.Class.UNIVERSAL,
        C.Type.INTEGER,
        !1,
        D.util.hexToBytes(e.serialNumber)
      )
    ]),
    // KeyEncryptionAlgorithmIdentifier
    C.create(C.Class.UNIVERSAL, C.Type.SEQUENCE, !0, [
      // Algorithm
      C.create(
        C.Class.UNIVERSAL,
        C.Type.OID,
        !1,
        C.oidToDer(e.encryptedContent.algorithm).getBytes()
      ),
      // Parameter, force NULL, only RSA supported for now.
      C.create(C.Class.UNIVERSAL, C.Type.NULL, !1, "")
    ]),
    // EncryptedKey
    C.create(
      C.Class.UNIVERSAL,
      C.Type.OCTETSTRING,
      !1,
      e.encryptedContent.content
    )
  ]);
}
function tu(e) {
  for (var t = [], a = 0; a < e.length; ++a)
    t.push(J0(e[a]));
  return t;
}
function ru(e) {
  for (var t = [], a = 0; a < e.length; ++a)
    t.push(eu(e[a]));
  return t;
}
function au(e) {
  var t = C.create(C.Class.UNIVERSAL, C.Type.SEQUENCE, !0, [
    // version
    C.create(
      C.Class.UNIVERSAL,
      C.Type.INTEGER,
      !1,
      C.integerToDer(e.version).getBytes()
    ),
    // issuerAndSerialNumber
    C.create(C.Class.UNIVERSAL, C.Type.SEQUENCE, !0, [
      // name
      D.pki.distinguishedNameToAsn1({ attributes: e.issuer }),
      // serial
      C.create(
        C.Class.UNIVERSAL,
        C.Type.INTEGER,
        !1,
        D.util.hexToBytes(e.serialNumber)
      )
    ]),
    // digestAlgorithm
    C.create(C.Class.UNIVERSAL, C.Type.SEQUENCE, !0, [
      // algorithm
      C.create(
        C.Class.UNIVERSAL,
        C.Type.OID,
        !1,
        C.oidToDer(e.digestAlgorithm).getBytes()
      ),
      // parameters (null)
      C.create(C.Class.UNIVERSAL, C.Type.NULL, !1, "")
    ])
  ]);
  if (e.authenticatedAttributesAsn1 && t.value.push(e.authenticatedAttributesAsn1), t.value.push(C.create(C.Class.UNIVERSAL, C.Type.SEQUENCE, !0, [
    // algorithm
    C.create(
      C.Class.UNIVERSAL,
      C.Type.OID,
      !1,
      C.oidToDer(e.signatureAlgorithm).getBytes()
    ),
    // parameters (null)
    C.create(C.Class.UNIVERSAL, C.Type.NULL, !1, "")
  ])), t.value.push(C.create(
    C.Class.UNIVERSAL,
    C.Type.OCTETSTRING,
    !1,
    e.signature
  )), e.unauthenticatedAttributes.length > 0) {
    for (var a = C.create(C.Class.CONTEXT_SPECIFIC, 1, !0, []), r = 0; r < e.unauthenticatedAttributes.length; ++r) {
      var n = e.unauthenticatedAttributes[r];
      a.values.push(da(n));
    }
    t.value.push(a);
  }
  return t;
}
function nu(e) {
  for (var t = [], a = 0; a < e.length; ++a)
    t.push(au(e[a]));
  return t;
}
function da(e) {
  var t;
  if (e.type === D.pki.oids.contentType)
    t = C.create(
      C.Class.UNIVERSAL,
      C.Type.OID,
      !1,
      C.oidToDer(e.value).getBytes()
    );
  else if (e.type === D.pki.oids.messageDigest)
    t = C.create(
      C.Class.UNIVERSAL,
      C.Type.OCTETSTRING,
      !1,
      e.value.bytes()
    );
  else if (e.type === D.pki.oids.signingTime) {
    var a = /* @__PURE__ */ new Date("1950-01-01T00:00:00Z"), r = /* @__PURE__ */ new Date("2050-01-01T00:00:00Z"), n = e.value;
    if (typeof n == "string") {
      var s = Date.parse(n);
      isNaN(s) ? n.length === 13 ? n = C.utcTimeToDate(n) : n = C.generalizedTimeToDate(n) : n = new Date(s);
    }
    n >= a && n < r ? t = C.create(
      C.Class.UNIVERSAL,
      C.Type.UTCTIME,
      !1,
      C.dateToUtcTime(n)
    ) : t = C.create(
      C.Class.UNIVERSAL,
      C.Type.GENERALIZEDTIME,
      !1,
      C.dateToGeneralizedTime(n)
    );
  }
  return C.create(C.Class.UNIVERSAL, C.Type.SEQUENCE, !0, [
    // AttributeType
    C.create(
      C.Class.UNIVERSAL,
      C.Type.OID,
      !1,
      C.oidToDer(e.type).getBytes()
    ),
    C.create(C.Class.UNIVERSAL, C.Type.SET, !0, [
      // AttributeValue
      t
    ])
  ]);
}
function iu(e) {
  return [
    // ContentType, always Data for the moment
    C.create(
      C.Class.UNIVERSAL,
      C.Type.OID,
      !1,
      C.oidToDer(D.pki.oids.data).getBytes()
    ),
    // ContentEncryptionAlgorithmIdentifier
    C.create(C.Class.UNIVERSAL, C.Type.SEQUENCE, !0, [
      // Algorithm
      C.create(
        C.Class.UNIVERSAL,
        C.Type.OID,
        !1,
        C.oidToDer(e.algorithm).getBytes()
      ),
      // Parameters (IV)
      e.parameter ? C.create(
        C.Class.UNIVERSAL,
        C.Type.OCTETSTRING,
        !1,
        e.parameter.getBytes()
      ) : void 0
    ]),
    // [0] EncryptedContent
    C.create(C.Class.CONTEXT_SPECIFIC, 0, !0, [
      C.create(
        C.Class.UNIVERSAL,
        C.Type.OCTETSTRING,
        !1,
        e.content.getBytes()
      )
    ])
  ];
}
function ka(e, t, a) {
  var r = {}, n = [];
  if (!C.validate(t, a, r, n)) {
    var s = new Error("Cannot read PKCS#7 message. ASN.1 object is not a supported PKCS#7 message.");
    throw s.errors = s, s;
  }
  var i = C.derToOid(r.contentType);
  if (i !== D.pki.oids.data)
    throw new Error("Unsupported PKCS#7 message. Only wrapped ContentType Data supported.");
  if (r.encryptedContent) {
    var o = "";
    if (D.util.isArray(r.encryptedContent))
      for (var l = 0; l < r.encryptedContent.length; ++l) {
        if (r.encryptedContent[l].type !== C.Type.OCTETSTRING)
          throw new Error("Malformed PKCS#7 message, expecting encrypted content constructed of only OCTET STRING objects.");
        o += r.encryptedContent[l].value;
      }
    else
      o = r.encryptedContent;
    e.encryptedContent = {
      algorithm: C.derToOid(r.encAlgorithm),
      parameter: D.util.createBuffer(r.encParameter.value),
      content: D.util.createBuffer(o)
    };
  }
  if (r.content) {
    var o = "";
    if (D.util.isArray(r.content))
      for (var l = 0; l < r.content.length; ++l) {
        if (r.content[l].type !== C.Type.OCTETSTRING)
          throw new Error("Malformed PKCS#7 message, expecting content constructed of only OCTET STRING objects.");
        o += r.content[l].value;
      }
    else
      o = r.content;
    e.content = D.util.createBuffer(o);
  }
  return e.version = r.version.charCodeAt(0), e.rawCapture = r, r;
}
function ri(e) {
  if (e.encryptedContent.key === void 0)
    throw new Error("Symmetric key not available.");
  if (e.content === void 0) {
    var t;
    switch (e.encryptedContent.algorithm) {
      case D.pki.oids["aes128-CBC"]:
      case D.pki.oids["aes192-CBC"]:
      case D.pki.oids["aes256-CBC"]:
        t = D.aes.createDecryptionCipher(e.encryptedContent.key);
        break;
      case D.pki.oids.desCBC:
      case D.pki.oids["des-EDE3-CBC"]:
        t = D.des.createDecryptionCipher(e.encryptedContent.key);
        break;
      default:
        throw new Error("Unsupported symmetric cipher, OID " + e.encryptedContent.algorithm);
    }
    if (t.start(e.encryptedContent.parameter), t.update(e.encryptedContent.content), !t.finish())
      throw new Error("Symmetric decryption failed.");
    e.content = t.output;
  }
}
var Ce = z, Hr = Ce.ssh = Ce.ssh || {};
Hr.privateKeyToPutty = function(e, t, a) {
  a = a || "", t = t || "";
  var r = "ssh-rsa", n = t === "" ? "none" : "aes256-cbc", s = "PuTTY-User-Key-File-2: " + r + `\r
`;
  s += "Encryption: " + n + `\r
`, s += "Comment: " + a + `\r
`;
  var i = Ce.util.createBuffer();
  zt(i, r), st(i, e.e), st(i, e.n);
  var o = Ce.util.encode64(i.bytes(), 64), l = Math.floor(o.length / 66) + 1;
  s += "Public-Lines: " + l + `\r
`, s += o;
  var u = Ce.util.createBuffer();
  st(u, e.d), st(u, e.p), st(u, e.q), st(u, e.qInv);
  var f;
  if (!t)
    f = Ce.util.encode64(u.bytes(), 64);
  else {
    var c = u.length() + 16 - 1;
    c -= c % 16;
    var v = gr(u.bytes());
    v.truncate(v.length() - c + u.length()), u.putBuffer(v);
    var m = Ce.util.createBuffer();
    m.putBuffer(gr("\0\0\0\0", t)), m.putBuffer(gr("\0\0\0", t));
    var y = Ce.aes.createEncryptionCipher(m.truncate(8), "CBC");
    y.start(Ce.util.createBuffer().fillWithByte(0, 16)), y.update(u.copy()), y.finish();
    var x = y.output;
    x.truncate(16), f = Ce.util.encode64(x.bytes(), 64);
  }
  l = Math.floor(f.length / 66) + 1, s += `\r
Private-Lines: ` + l + `\r
`, s += f;
  var S = gr("putty-private-key-file-mac-key", t), I = Ce.util.createBuffer();
  zt(I, r), zt(I, n), zt(I, a), I.putInt32(i.length()), I.putBuffer(i), I.putInt32(u.length()), I.putBuffer(u);
  var b = Ce.hmac.create();
  return b.start("sha1", S), b.update(I.bytes()), s += `\r
Private-MAC: ` + b.digest().toHex() + `\r
`, s;
};
Hr.publicKeyToOpenSSH = function(e, t) {
  var a = "ssh-rsa";
  t = t || "";
  var r = Ce.util.createBuffer();
  return zt(r, a), st(r, e.e), st(r, e.n), a + " " + Ce.util.encode64(r.bytes()) + " " + t;
};
Hr.privateKeyToOpenSSH = function(e, t) {
  return t ? Ce.pki.encryptRsaPrivateKey(
    e,
    t,
    { legacy: !0, algorithm: "aes128" }
  ) : Ce.pki.privateKeyToPem(e);
};
Hr.getPublicKeyFingerprint = function(e, t) {
  t = t || {};
  var a = t.md || Ce.md.md5.create(), r = "ssh-rsa", n = Ce.util.createBuffer();
  zt(n, r), st(n, e.e), st(n, e.n), a.start(), a.update(n.getBytes());
  var s = a.digest();
  if (t.encoding === "hex") {
    var i = s.toHex();
    return t.delimiter ? i.match(/.{2}/g).join(t.delimiter) : i;
  } else {
    if (t.encoding === "binary")
      return s.getBytes();
    if (t.encoding)
      throw new Error('Unknown encoding "' + t.encoding + '".');
  }
  return s;
};
function st(e, t) {
  var a = t.toString(16);
  a[0] >= "8" && (a = "00" + a);
  var r = Ce.util.hexToBytes(a);
  e.putInt32(r.length), e.putBytes(r);
}
function zt(e, t) {
  e.putInt32(t.length), e.putString(t);
}
function gr() {
  for (var e = Ce.md.sha1.create(), t = arguments.length, a = 0; a < t; ++a)
    e.update(arguments[a]);
  return e.digest();
}
var kt = z;
const Yt = di.join(mt.getPath("userData"), "device.key");
function su(e) {
  if (Sr.isEncryptionAvailable()) {
    const t = Sr.encryptString(e);
    Et.writeFileSync(Yt, t, { mode: 384 });
  } else
    Et.writeFileSync(Yt, e, { mode: 384 });
}
function ou() {
  if (!Et.existsSync(Yt))
    return null;
  if (Sr.isEncryptionAvailable())
    try {
      const e = Et.readFileSync(Yt);
      return Sr.decryptString(e);
    } catch {
      return Et.readFileSync(Yt, "utf-8");
    }
  return Et.readFileSync(Yt, "utf-8");
}
function uu() {
  const e = ou();
  if (e)
    try {
      const n = kt.pki.privateKeyFromPem(e), s = kt.pki.setRsaPublicKey(n.n, n.e);
      return {
        publicKey: kt.pki.publicKeyToPem(s),
        hasPrivateKey: !0
      };
    } catch {
      console.warn("Chave existente corrompida, gerando nova");
    }
  const t = kt.pki.rsa.generateKeyPair({ bits: 2048 }), a = kt.pki.privateKeyToPem(t.privateKey), r = kt.pki.publicKeyToPem(t.publicKey);
  return su(a), {
    publicKey: r,
    hasPrivateKey: !0
  };
}
function lu(e) {
  const t = kt.md.sha256.create();
  return t.update(e), t.digest().toHex();
}
const fu = [
  "password",
  "pfx",
  "pfx_path",
  "private_key",
  "public_key",
  "token",
  "authorization",
  "cookie",
  "session_code"
];
function ai(e) {
  if (e == null) return {};
  if (typeof e != "object") return { value: e };
  const t = {};
  for (const [a, r] of Object.entries(e))
    fu.some((n) => a.toLowerCase().includes(n)) ? t[a] = "[REDACTED]" : typeof r == "object" && r !== null ? t[a] = ai(r) : t[a] = r;
  return t;
}
const ve = {
  info(e, t, a) {
    mr("info", e, t, a);
  },
  warn(e, t, a) {
    mr("warn", e, t, a);
  },
  error(e, t, a) {
    mr("error", e, t, a);
  },
  debug(e, t, a) {
    process.env.NODE_ENV !== "production" && mr("debug", e, t, a);
  }
};
function mr(e, t, a, r) {
  const n = (/* @__PURE__ */ new Date()).toISOString(), s = r ? ai(r) : {}, i = JSON.stringify({
    timestamp: n,
    level: e,
    module: t,
    message: a,
    ...s
  });
  switch (e) {
    case "error":
      console.error(i);
      break;
    case "warn":
      console.warn(i);
      break;
    case "debug":
      console.debug(i);
      break;
    default:
      console.log(i);
  }
}
let Da = null;
function cu() {
  return Da;
}
function hu(e) {
  at.on("window:minimize", () => {
    var t;
    console.log("[IPC] window:minimize received"), (t = e()) == null || t.minimize();
  }), at.on("window:maximize", () => {
    console.log("[IPC] window:maximize received");
    const t = e();
    t && (t.isMaximized() ? t.unmaximize() : t.maximize());
  }), at.on("window:close", () => {
    var t;
    console.log("[IPC] window:close received"), (t = e()) == null || t.close();
  }), at.handle("system:get-os-info", async () => {
    const t = hn(), a = ci(), r = `${process.platform} ${process.arch}`, n = du(), s = lu(
      `${t}|${a.username}|${r}|${n}`
    );
    return {
      hostname: t,
      // Ex: "PC-JOAO-01"
      username: a.username,
      // Ex: "joao.silva"
      ip_address: n,
      // Ex: "192.168.1.100"
      platform: r,
      // Ex: "linux x64"
      os_release: pu(),
      // Ex: "Ubuntu 22.04"
      fingerprint: s
    };
  });
}
function du() {
  const e = hi();
  for (const t of Object.keys(e)) {
    const a = e[t];
    if (a) {
      for (const r of a)
        if (r.family !== "IPv6" && !r.internal)
          return r.address;
    }
  }
  return hn();
}
function pu() {
  try {
    const e = mt.getVersion();
    if (process.platform === "linux") {
      if (Et.existsSync("/etc/os-release")) {
        const a = Et.readFileSync("/etc/os-release", "utf-8").match(/PRETTY_NAME="?([^"\n]+)"?/);
        if (a) return a[1];
      }
    } else {
      if (process.platform === "darwin")
        return `macOS ${process.getSystemVersion()}`;
      if (process.platform === "win32")
        return `Windows ${process.getSystemVersion()}`;
    }
    return e;
  } catch {
    return process.platform;
  }
}
at.on("session:activated", (e, t) => {
  Da = t, ve.info("main", "Sessão registrada para cleanup", { sessionId: t.sessionId });
});
at.on("session:deactivated", () => {
  Da = null, ve.info("main", "Sessão removida do tracking");
});
const $r = vi(pi), Wr = "powershell.exe", $t = {
  /**
   * Cleans up orphan certificates on startup (RN: Cleanup at Initialization).
   * Removes temporary certs older than 1 hour that may have been left by
   * forced shutdowns.
   */
  async cleanupOrphanCerts() {
    const e = `
      Get-ChildItem Cert:\\CurrentUser\\My |
        Where-Object { $_.NotAfter -lt (Get-Date).AddHours(-1) -and $_.HasPrivateKey } |
        ForEach-Object {
          try {
            Remove-Item -Path $_.PSPath -Force -ErrorAction Stop
            Write-Output "Removed: $($_.Thumbprint)"
          } catch {
            Write-Warning "Failed to remove: $($_.Thumbprint)"
          }
        }
    `;
    try {
      const { stdout: t } = await $r(
        `${Wr} -NoProfile -Command "${e.replace(/\n/g, ";")}"`,
        { timeout: 3e4 }
      );
      console.log("[PowerShell] Cleanup:", t);
    } catch (t) {
      console.warn("[PowerShell] Cleanup failed:", t);
    }
  },
  /**
   * Installs a PFX certificate into the Windows Certificate Store in memory only.
   * No file is written to disk. Uses EphemeralKeySet to keep cert in RAM.
   */
  async installPfxInMemory(e, t, a) {
    const r = t.replace(/'/g, "''"), n = a.replace(/'/g, "''"), s = `
      try {
        $pfxBytes = [Convert]::FromBase64String('${e}')
        $pfx = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2(
          $pfxBytes,
          '${r}',
          [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::EphemeralKeySet
        )
        $store = New-Object System.Security.Cryptography.X509Certificates.X509Store('My', 'CurrentUser')
        $store.Open('ReadWrite')
        $store.Add($pfx)
        $store.Close()

        # Verificar se instalou
        $installed = Get-ChildItem Cert:\\CurrentUser\\My | Where-Object { $_.Thumbprint -eq '${n}' }
        if ($installed) {
          Write-Output "SUCCESS"
        } else {
          Write-Output "FAILED"
        }

        # Limpar variáveis
        $pfxBytes = $null
        $pfx = $null
      } catch {
        Write-Output "ERROR: $($_.Exception.Message)"
      }
    `;
    try {
      const { stdout: i } = await $r(
        `${Wr} -NoProfile -Command "${s.replace(/\n/g, ";")}"`,
        { timeout: 3e4 }
      );
      return i.trim().includes("SUCCESS");
    } catch (i) {
      return console.error("[PowerShell] Install failed:", i), !1;
    }
  },
  /**
   * Removes a certificate from the Windows Store by thumbprint.
   */
  async removeCertByThumbprint(e) {
    const a = `
      try {
        $cert = Get-ChildItem Cert:\\CurrentUser\\My | Where-Object { $_.Thumbprint -eq '${e.replace(/'/g, "''")}' }
        if ($cert) {
          Remove-Item -Path $cert.PSPath -Force
          Write-Output "REMOVED"
        } else {
          Write-Output "NOT_FOUND"
        }
      } catch {
        Write-Output "ERROR: $($_.Exception.Message)"
      }
    `;
    try {
      const { stdout: r } = await $r(
        `${Wr} -NoProfile -Command "${a.replace(/\n/g, ";")}"`,
        { timeout: 15e3 }
      );
      return r.trim() === "REMOVED";
    } catch (r) {
      return console.error("[PowerShell] Remove failed:", r), !1;
    }
  }
};
function vu() {
  at.handle("cert:cleanup-orphans", async () => $t.cleanupOrphanCerts()), at.handle("cert:generate-keys", async () => uu()), at.handle("cert:install-pfx", async (e, t) => $t.installPfxInMemory(
    t.pfxBase64,
    t.password,
    t.thumbprint
  )), at.handle("cert:decrypt-and-install", async (e, t) => {
    try {
      ve.info("cert", "Instalando PFX em memória", { thumbprint: t.thumbprint });
      const a = await $t.installPfxInMemory(
        t.pfxBase64,
        t.password,
        t.thumbprint
      );
      return a ? ve.info("cert", "PFX instalado com sucesso", { thumbprint: t.thumbprint }) : ve.error("cert", "Falha ao instalar PFX", { thumbprint: t.thumbprint }), a;
    } catch (a) {
      return ve.error("cert", "Erro ao instalar PFX", { error: String(a) }), !1;
    }
  }), at.handle("cert:remove-by-thumbprint", async (e, t) => $t.removeCertByThumbprint(t.thumbprint));
}
let ft = null;
function yu(e) {
  const t = Ua.createEmpty();
  return ft = new ui(t.isEmpty() ? Ua.createFromDataURL(Cu()) : t), ft.setToolTip("CertGuard Desktop"), gu(e), ft.on("click", () => {
    const a = e();
    a && (a.isVisible() && !a.isMinimized() ? a.hide() : (a.show(), a.focus()));
  }), ft.on("double-click", () => {
    const a = e();
    a && (a.show(), a.focus());
  }), ft;
}
function gu(e) {
  if (!ft) return;
  const t = li.buildFromTemplate([
    {
      label: "Abrir CertGuard",
      click: () => {
        const a = e();
        a && (a.show(), a.focus());
      }
    },
    {
      type: "separator"
    },
    {
      label: "Sobre",
      click: () => {
        const a = e();
        a && a.webContents.send("show-about");
      }
    },
    {
      type: "separator"
    },
    {
      label: "Sair",
      click: () => {
        mt.quit();
      }
    }
  ]);
  ft.setContextMenu(t);
}
function mu() {
  ft && (ft.destroy(), ft = null);
}
function Cu() {
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAOklEQVQ4y2NgGAWjYBSMglEwCkbBKBgFo2AUjIJRMApGwSgYBaNgFIyCUTAKRsEoGAWjYBSMglEwCkbBKBgFo2AUjIJRMApGwSgYBaNgFIyCUTAKRsEoGAWjYBQQDQAVDQH8Wz5sDwAAAABJRU5ErkJggg==";
}
const ni = Bt.dirname(fi(import.meta.url));
process.env.APP_ROOT = Bt.join(ni, "..");
const pa = process.env.VITE_DEV_SERVER_URL, bu = Bt.join(process.env.APP_ROOT, "dist-electron"), ii = Bt.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = pa ? Bt.join(process.env.APP_ROOT, "public") : ii;
let pe, si = !1;
function oi() {
  pe = new fn({
    width: 820,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    icon: Bt.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    titleBarStyle: "hidden",
    frame: !1,
    show: !1,
    // Não mostra até estar pronto
    webPreferences: {
      preload: Bt.join(ni, "preload.cjs"),
      contextIsolation: !0,
      nodeIntegration: !1,
      sandbox: !1
    }
  }), pe.once("ready-to-show", () => {
    pe == null || pe.show(), ve.info("main", "Janela principal exibida");
  }), pe.webContents.on("did-finish-load", () => {
    pe == null || pe.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), pe.webContents.setWindowOpenHandler(({ url: e }) => (ve.warn("main", "Tentativa de abrir URL externa bloqueada", { url: e }), { action: "deny" })), pa ? pe.loadURL(pa) : pe.loadFile(Bt.join(ii, "index.html")), pe.on("close", (e) => {
    si || (e.preventDefault(), pe == null || pe.hide(), ve.debug("main", "Janela ocultada para o tray"));
  });
}
mt.on("window-all-closed", () => {
  process.platform !== "darwin" && ve.info("main", "Todas as janelas fechadas - app continua no tray");
});
mt.on("activate", () => {
  fn.getAllWindows().length === 0 && oi();
});
mt.on("before-quit", async (e) => {
  si = !0, mu(), cn.unregisterAll();
  const t = cu();
  if (t) {
    e.preventDefault();
    try {
      const a = `${t.apiUrl}/api/desktop/sessoes/${t.sessionId}`;
      await fetch(a, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${t.token}`,
          Accept: "application/json"
        }
      }), ve.info("main", "Sessão encerrada no backend antes de fechar", { sessionId: t.sessionId });
    } catch (a) {
      ve.warn("main", "Erro ao encerrar sessão no backend", { error: String(a) });
    }
  }
  if (process.platform === "win32") {
    e.preventDefault();
    try {
      await $t.cleanupOrphanCerts(), ve.info("main", "Certificados temporários removidos antes de fechar");
    } catch (a) {
      ve.warn("main", "Erro ao limpar certificados", { error: String(a) });
    }
  }
  mt.exit(0);
});
process.on("uncaughtException", (e) => {
  var t;
  ve.error("main", "Erro não capturado", {
    message: e.message,
    stack: (t = e.stack) == null ? void 0 : t.split(`
`).slice(0, 5).join(`
`)
  });
});
process.on("unhandledRejection", (e) => {
  ve.error("main", "Promise rejeitada não tratada", {
    reason: String(e)
  });
});
mt.whenReady().then(() => {
  ve.info("main", "App iniciando", { version: mt.getVersion() }), oi(), hu(() => pe), vu(), cn.register("CommandOrControl+Shift+I", () => {
    pe == null || pe.webContents.toggleDevTools();
  });
  try {
    yu(() => pe), ve.info("main", "System tray criado");
  } catch (e) {
    ve.warn("main", "Falha ao criar tray", { error: String(e) });
  }
  process.platform === "win32" && $t.cleanupOrphanCerts().catch((e) => {
    ve.warn("main", "Cleanup de órfãos falhou", { error: String(e) });
  }), ve.info("main", "App pronto");
});
export {
  bu as MAIN_DIST,
  ii as RENDERER_DIST,
  pa as VITE_DEV_SERVER_URL
};
