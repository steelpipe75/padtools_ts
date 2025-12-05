"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = exports.SPDParser = void 0;
var parser_1 = require("./spd/parser");
Object.defineProperty(exports, "SPDParser", { enumerable: true, get: function () { return parser_1.SPDParser; } });
var svg_renderer_1 = require("./spd/svg-renderer");
Object.defineProperty(exports, "render", { enumerable: true, get: function () { return svg_renderer_1.render; } });
__exportStar(require("./spd/ast"), exports);
