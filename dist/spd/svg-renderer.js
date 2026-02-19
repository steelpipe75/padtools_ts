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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = render;
const eaw = __importStar(require("eastasianwidth"));
// デフォルトの描画オプション
const defaultRenderOptions = {
    fontSize: 14,
    fontFamily: "sans-serif",
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    boxPadding: { top: 10, right: 10, bottom: 10, left: 10 },
    branchePadding: { top: 5, right: 5, bottom: 5, left: 5 },
    strokeWidth: 1,
    strokeColor: "#000000",
    backgroundColor: "#ffffff",
    baseBackgroundColor: null,
    textColor: "#000000",
    lineHeight: 1.2,
    doubleLineWidth: 5,
    switchNodeCaseWidth: 20,
    connectorWidth: 2,
    nodeListSpace: 10,
    childNodeOffsetWidth: 20,
    listRenderType: "original",
};
/**
 * ASTを受け取り、完全なSVG文字列を返す
 */
function render(node, options) {
    var _a;
    const mergedOptions = Object.assign(Object.assign({}, defaultRenderOptions), options);
    if (!node) {
        return "";
    }
    const fragment = renderNode(node, mergedOptions);
    const svgWidth = fragment.width + mergedOptions.margin.left + mergedOptions.margin.right;
    const svgHeight = fragment.height + mergedOptions.margin.top + mergedOptions.margin.bottom;
    let svg = `<svg `;
    svg += `width="${svgWidth.toFixed(1)}" height="${svgHeight.toFixed(1)}" `;
    svg += `viewBox="0 0 ${svgWidth.toFixed(1)} ${svgHeight.toFixed(1)}" `;
    svg += `xmlns="http://www.w3.org/2000/svg">`;
    const baseFillColor = (_a = mergedOptions.baseBackgroundColor) !== null && _a !== void 0 ? _a : "none";
    svg += `<rect x="0" y="0" `;
    svg += `width="${svgWidth.toFixed(1)}" height="${svgHeight.toFixed(1)}" `;
    svg += `fill="${baseFillColor}"/>`;
    svg += renderTransformTranslateSvg(mergedOptions.margin.left, mergedOptions.margin.top, fragment.svg);
    svg += `</svg>`;
    return svg;
}
/**
 * ASTのノード種別に応じて、対応する描画関数を呼び出す
 */
function renderNode(node, options) {
    switch (node.type) {
        case "process":
            return renderProcessFragment(node, options);
        case "terminal":
            return renderTerminalFragment(node, options);
        case "nodeList":
            return renderListFragment(node, options);
        case "call":
            return renderCallFragment(node, options);
        case "loop":
            return renderLoopFragment(node, options);
        case "if":
            return renderIfFragment(node, options);
        case "switch":
            return renderSwitchFragment(node, options);
        case "comment":
            return renderCommentFragment(node, options);
        // 他のノードタイプは後で追加
        default:
            return { svg: "", width: 0, height: 0, type: "Unknown" }; // 未実装のノードタイプ
    }
}
/**
 * 箱型ノードの描画処理
 */
function renderBoxFragment(node, options) {
    var _a, _b;
    const textMetrics = measureTextSvg(node.text, options);
    let contentWidth = textMetrics.width;
    let contentHeight = textMetrics.height;
    let textOffsetX = options.boxPadding.left;
    let textOffsetY = 0;
    let svg = ``;
    if (node.borderType === "Box") {
        // 四角形のボックス
        contentWidth += options.boxPadding.left + options.boxPadding.right;
        contentHeight += options.boxPadding.top + options.boxPadding.bottom;
        textOffsetY += options.boxPadding.top;
        const fillColor = (_a = options.backgroundColor) !== null && _a !== void 0 ? _a : "none";
        svg += `<rect x="0" y="0" width="${contentWidth.toFixed(1)}" height="${contentHeight.toFixed(1)}" `;
        svg += `stroke="${options.strokeColor}" stroke-width="${options.strokeWidth}" `;
        svg += `fill="${fillColor}"/>`;
    }
    else if (node.borderType === "WRound") {
        // 丸みを帯びた四角形
        contentHeight += options.boxPadding.top + options.boxPadding.bottom;
        textOffsetY += options.boxPadding.top;
        const radius = contentHeight / 2; // 高さの半分を丸みの半径とする
        contentWidth += contentHeight;
        textOffsetX = radius;
        const fillColor = (_b = options.backgroundColor) !== null && _b !== void 0 ? _b : "none";
        svg += `<rect x="0" y="0" width="${contentWidth.toFixed(1)}" height="${contentHeight.toFixed(1)}" `;
        svg += `rx="${radius.toFixed(1)}" ry="${radius.toFixed(1)}" `;
        svg += `stroke="${options.strokeColor}" stroke-width="${options.strokeWidth}" `;
        svg += `fill="${fillColor}"/>`;
    }
    else {
        // ボーダーなし
        contentWidth += options.boxPadding.left + options.boxPadding.right;
    }
    if (node.drawLeftBar) {
        // 左側二重線
        svg += renderLineSvg(options.doubleLineWidth, 0, options.doubleLineWidth, contentHeight, options);
    }
    if (node.drawRightBar) {
        // 右側二重線
        svg += renderLineSvg(contentWidth - options.doubleLineWidth, 0, contentWidth - options.doubleLineWidth, contentHeight, options);
    }
    svg += renderTextSvg(node.text, textOffsetX, textOffsetY, options);
    let childFragment = null;
    if (node.childNode) {
        childFragment = renderNode(node.childNode, options);
        svg += renderTransformTranslateSvg(options.childNodeOffsetWidth + contentWidth, 0, childFragment.svg);
        svg += renderLineSvg(contentWidth, 0, options.childNodeOffsetWidth + contentWidth, 0, options);
    }
    const totalWidth = parseFloat((contentWidth +
        (childFragment ? childFragment.width + options.childNodeOffsetWidth : 0)).toFixed(1));
    const totalHeight = parseFloat(Math.max(contentHeight, childFragment ? childFragment.height : 0).toFixed(1));
    return {
        svg: svg,
        width: totalWidth,
        height: totalHeight,
        type: node.type,
    };
}
/**
 * コメントノードの描画
 */
function renderCommentFragment(node, options) {
    const boxNode = {
        type: "Comment",
        text: `(${node.text})`,
        childNode: null,
        borderType: "None",
        drawLeftBar: false,
        drawRightBar: false,
    };
    return renderBoxFragment(boxNode, options);
}
/**
 * ループノードの描画
 */
function renderLoopFragment(node, options) {
    const boxNode = {
        type: "Loop",
        text: node.text,
        childNode: node.childNode,
        borderType: "Box",
        drawLeftBar: node.isWhile, // Whileループは左側に二重線を描画
        drawRightBar: !node.isWhile, // Do-Whileループは右側に二重線を描画
    };
    return renderBoxFragment(boxNode, options);
}
/**
 * 呼び出しノードの描画
 */
function renderCallFragment(node, options) {
    const boxNode = {
        type: "Call",
        text: node.text,
        childNode: node.childNode,
        borderType: "Box",
        drawLeftBar: true,
        drawRightBar: true,
    };
    return renderBoxFragment(boxNode, options);
}
/**
 * 処理ノードの描画
 */
function renderProcessFragment(node, options) {
    const boxNode = {
        type: "Process",
        text: node.text,
        childNode: node.childNode,
        borderType: "Box",
        drawLeftBar: false,
        drawRightBar: false,
    };
    return renderBoxFragment(boxNode, options);
}
/**
 * 端子ノードの描画
 */
function renderTerminalFragment(node, options) {
    const boxNode = {
        type: "Terminal",
        text: node.text,
        childNode: null,
        borderType: "WRound",
        drawLeftBar: false,
        drawRightBar: false,
    };
    return renderBoxFragment(boxNode, options);
}
// == Branchノードの描画関数群 ===
function measureTextSvgForBranche(text, options) {
    const textMetrics = measureTextSvg(text, options);
    return {
        width: textMetrics.width +
            options.branchePadding.left +
            options.branchePadding.right,
        height: textMetrics.height +
            options.branchePadding.top +
            options.branchePadding.bottom,
    };
}
function renderTextSvgForBranche(text, posX, posY, options) {
    return renderTextSvg(text, posX + options.branchePadding.left, posY + options.branchePadding.top, options);
}
/**
 * 分岐ノードの描画
 */
function renderBrancheFragment(node, options) {
    var _a;
    // ケースの数が2未満の場合はダミーを追加する
    if (node.branches.length < 2) {
        while (node.branches.length < 2) {
            node.branches.push({ label: "", node: null });
        }
    }
    let svg = "";
    const conditionSize = measureTextSvgForBranche(node.text, options);
    const minHeight = conditionSize.height;
    const x = 0;
    const y = 0;
    // labelw　<- ラベルの最大幅
    // h <- ラベルと、サブビューの合計値
    // subview <- サブビューの最大幅
    let labelw = 0;
    let subvieww = 0;
    let h = 0;
    let count = 0;
    let lastdy = 0;
    let lastldy = 0;
    const brancheFragments = [];
    const ymap = new Map();
    for (const [index, branche] of node.branches.entries()) {
        const label = branche.label;
        const labelSize = measureTextSvgForBranche(label, options);
        const brancheFragment = branche.node
            ? renderNode(branche.node, options)
            : null;
        // サブビューがない場合はサイズ = 0
        const subViewSize = brancheFragment
            ? { width: brancheFragment.width, height: brancheFragment.height }
            : { width: 0, height: 0 };
        if (count !== node.branches.length - 1) {
            subViewSize.height += options.nodeListSpace;
        }
        brancheFragments.push({ label: label, fragment: brancheFragment });
        // ラベルの最大幅を更新
        if (labelw < labelSize.width)
            labelw = labelSize.width;
        // サブビューの最大幅を更新
        if (subvieww < subViewSize.width)
            subvieww = subViewSize.width;
        // ラベルに合わせて高さを更新
        let uply, bottomly;
        if (count === 0) {
            uply = 0;
            bottomly = labelSize.height;
        }
        else if (count === node.branches.length - 1) {
            uply = labelSize.height;
            bottomly = 0;
        }
        else {
            uply = parseFloat((labelSize.height / 2).toFixed(1));
            bottomly = uply;
        }
        if (lastdy < uply)
            lastdy = parseFloat((lastdy + uply - lastdy).toFixed(1));
        // ラベルが縦長い場合に調整
        const minldy = parseFloat((lastldy > uply ? lastldy * 2 : uply * 2).toFixed(1));
        lastldy = bottomly;
        if (minldy > lastdy)
            lastdy = minldy;
        // 高さを更新
        h = parseFloat((h + lastdy).toFixed(1));
        ymap.set(index, h);
        // tmp <- 高さ追記分
        if (bottomly > subViewSize.height) {
            lastdy = bottomly;
        }
        else {
            lastdy = subViewSize.height;
        }
        if (lastdy < minHeight && count < node.branches.length - 1)
            lastdy = minHeight;
        count += 1;
    }
    h = parseFloat((h + lastdy).toFixed(1));
    // 描画
    /**
     * A-----B1
     * |    /
     * |   C2
     * |    \
     * |     B2
     * |    /
     * |   C3
     * |    \
     * E-----B3
     */
    let first = true;
    let addChildLineWidth = false;
    const poly = [];
    let lasty = 0;
    const boxRight = parseFloat((x + conditionSize.width + labelw + options.switchNodeCaseWidth).toFixed(1));
    poly.push({ x: x, y: y }); // Pos:A
    for (const [index, brancheFragment] of brancheFragments.entries()) {
        const lh_temp = ymap.get(index);
        const lh = lh_temp ? lh_temp : 0;
        const ly = parseFloat((y + lh).toFixed(1));
        if (brancheFragment.fragment !== null) {
            // brancheFragment.fragment の描画
            svg += renderTransformTranslateSvg(parseFloat((boxRight + options.childNodeOffsetWidth).toFixed(1)), ly, brancheFragment.fragment.svg);
            // 小要素への line の描画
            svg += renderLineSvg(boxRight, ly, parseFloat((boxRight + options.childNodeOffsetWidth).toFixed(1)), ly, options);
            // 小要素への line の分、最後に返す幅を増やす
            addChildLineWidth = true;
        }
        if (!first) {
            // Pos:C
            poly.push({
                x: parseFloat((boxRight - options.switchNodeCaseWidth).toFixed(1)),
                y: parseFloat(((lasty + ly) / 2).toFixed(1)),
            });
        }
        poly.push({ x: boxRight, y: ly }); // Pos:B
        first = false;
        lasty = ly;
    }
    poly.push({ x: x, y: parseFloat(lasty.toFixed(1)) }); // Pos:E
    const polyPoints = poly
        .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(" ");
    // polyの描画
    const fillColor = (_a = options.backgroundColor) !== null && _a !== void 0 ? _a : "none";
    svg += `<polygon points="${polyPoints}" `;
    svg += `stroke="${options.strokeColor}" `;
    svg += `stroke-width="${options.strokeWidth}" `;
    svg += `fill="${fillColor}"/>`;
    for (const [index, brancheFragment] of brancheFragments.entries()) {
        const label = brancheFragment.label;
        const lh_temp = ymap.get(index);
        const lh = lh_temp ? lh_temp : 0;
        let ly = parseFloat((y + lh).toFixed(1));
        const ls = measureTextSvgForBranche(label, options);
        if (index >= node.branches.length - 1) {
            ly = parseFloat((ly - ls.height).toFixed(1));
        }
        else if (index > 0) {
            ly = parseFloat((ly - ls.height / 2).toFixed(1));
        }
        // label の描画
        svg += renderTextSvgForBranche(label, parseFloat((x + conditionSize.width + labelw - ls.width).toFixed(1)), ly, options);
    }
    // node.text の描画
    svg += renderTextSvgForBranche(node.text, parseFloat(x.toFixed(1)), parseFloat((lasty / 2 - conditionSize.height / 2).toFixed(1)), options);
    return {
        svg: svg,
        width: parseFloat((boxRight +
            subvieww +
            (addChildLineWidth ? options.childNodeOffsetWidth : 0)).toFixed(1)),
        height: parseFloat(h.toFixed(1)),
        type: node.type,
    };
}
/**
 * SWITCH分岐ノードの描画
 */
function renderSwitchFragment(node, options) {
    const switchBrancheNode = {
        text: node.text,
        type: "Switch",
        branches: [],
    };
    for (const [label, caseNode] of node.cases.entries()) {
        switchBrancheNode.branches.push({
            label: label.toString(),
            node: caseNode,
        });
    }
    return renderBrancheFragment(switchBrancheNode, options);
}
/**
 * IF分岐ノードの描画
 */
function renderIfFragment(node, options) {
    const ifBrancheNode = {
        text: node.text,
        type: "If",
        branches: [],
    };
    if (node.trueNode) {
        ifBrancheNode.branches.push({ label: "", node: node.trueNode });
    }
    else {
        ifBrancheNode.branches.push({ label: "", node: null });
    }
    if (node.falseNode) {
        ifBrancheNode.branches.push({ label: "", node: node.falseNode });
    }
    else {
        ifBrancheNode.branches.push({ label: "", node: null });
    }
    return renderBrancheFragment(ifBrancheNode, options);
}
// == ノード間の接続線の描画関数群 ===
/**
 * 連結ノード（NodeListNode）の描画
 */
function renderListFragment(node, options) {
    if (options.listRenderType === "TerminalOffset") {
        return renderListFragmentTerminalOffset(node, options);
    }
    else {
        return renderListFragmentOriginal(node, options);
    }
}
function renderListFragmentOriginal(node, options) {
    let totalHeight = 0;
    let maxWidth = 0;
    let currentY = 0;
    let childrenSvg = "";
    const childFragments = [];
    // 子ノードを再帰的に描画し、サイズとSVGを収集
    for (const child of node.children) {
        const childFragment = renderNode(child, options);
        childFragments.push(childFragment);
        totalHeight = parseFloat((totalHeight + childFragment.height).toFixed(1));
        maxWidth = parseFloat(Math.max(maxWidth, childFragment.width).toFixed(1));
    }
    // 子ノードのSVGを配置し、接続線を描画
    for (let i = 0; i < childFragments.length; i++) {
        const childFragment = childFragments[i];
        // const xOffset = (maxWidth - childFragment.width) / 2; // 中央揃え
        childrenSvg += renderTransformTranslateSvg(0, currentY, childFragment.svg);
        // 接続線を描画 (最後のノード以外)
        if (i < childFragments.length - 1) {
            let startY = 0;
            let endY = 0;
            if (childFragment.type === "Terminal") {
                startY = parseFloat((currentY + childFragment.height / 2).toFixed(1));
            }
            else {
                startY = parseFloat(currentY.toFixed(1));
            }
            if (childFragments[i + 1].type === "Terminal") {
                endY = parseFloat((currentY +
                    childFragment.height +
                    options.nodeListSpace +
                    childFragments[i + 1].height / 2).toFixed(1));
            }
            else {
                endY = parseFloat((currentY +
                    childFragment.height +
                    options.nodeListSpace +
                    childFragments[i + 1].height).toFixed(1));
            }
            childrenSvg += renderLineSvg(0, startY, 0, endY, options);
            totalHeight = parseFloat((totalHeight + options.nodeListSpace).toFixed(1));
        }
        currentY = parseFloat((currentY + childFragment.height + options.nodeListSpace).toFixed(1));
    }
    return {
        svg: childrenSvg,
        width: maxWidth,
        height: totalHeight,
        type: "NodeList",
    };
}
function renderListFragmentTerminalOffset(node, options) {
    let totalHeight = 0;
    let maxWidth = 0;
    let offsetX = 0;
    let topAddWidth = 0;
    let bottomAddWidth = 0;
    let currentY = 0;
    let childrenSvg = "";
    const childFragments = [];
    // 子ノードを再帰的に描画し、サイズとSVGを収集
    for (const child of node.children) {
        const childFragment = renderNode(child, options);
        childFragments.push(childFragment);
        totalHeight = parseFloat((totalHeight + childFragment.height).toFixed(1));
        maxWidth = parseFloat(Math.max(maxWidth, childFragment.width).toFixed(1));
    }
    const topChildFragment = childFragments[0];
    if (topChildFragment.type === "Terminal") {
        const topWidth = topChildFragment.width;
        offsetX = parseFloat((topWidth / 2).toFixed(1));
    }
    const bottomChildFragment = childFragments[childFragments.length - 1];
    if (bottomChildFragment.type === "Terminal") {
        const bottomWidth = bottomChildFragment.width;
        const bottomOffset = parseFloat((bottomWidth / 2).toFixed(1));
        if (bottomOffset > offsetX) {
            topAddWidth = parseFloat((bottomOffset - offsetX).toFixed(1));
            offsetX = bottomOffset;
        }
        else {
            bottomAddWidth = parseFloat((offsetX - bottomOffset).toFixed(1));
        }
    }
    // 子ノードのSVGを配置し、接続線を描画
    for (let i = 0; i < childFragments.length; i++) {
        const childFragment = childFragments[i];
        // const xOffset = (maxWidth - childFragment.width) / 2; // 中央揃え
        if (i === 0) {
            childrenSvg += renderTransformTranslateSvg(topAddWidth, currentY, childFragment.svg);
        }
        else if (i === childFragments.length - 1) {
            childrenSvg += renderTransformTranslateSvg(bottomAddWidth, currentY, childFragment.svg);
        }
        else {
            childrenSvg += renderTransformTranslateSvg(offsetX, currentY, childFragment.svg);
        }
        // 接続線を描画 (最後のノード以外)
        if (i < childFragments.length - 1) {
            let startY = 0;
            let endY = 0;
            if (childFragment.type === "Terminal") {
                if (i === 0) {
                    startY = parseFloat((currentY + childFragment.height).toFixed(1));
                }
                else {
                    startY = parseFloat((currentY + childFragment.height / 2).toFixed(1));
                }
            }
            else {
                startY = parseFloat(currentY.toFixed(1));
            }
            if (childFragments[i + 1].type === "Terminal") {
                if (i + 1 === childFragments.length - 1) {
                    endY = parseFloat((currentY + childFragment.height + options.nodeListSpace).toFixed(1));
                }
                else {
                    endY = parseFloat((currentY +
                        childFragment.height +
                        options.nodeListSpace +
                        childFragments[i + 1].height / 2).toFixed(1));
                }
            }
            else {
                endY = parseFloat((currentY +
                    childFragment.height +
                    options.nodeListSpace +
                    childFragments[i + 1].height).toFixed(1));
            }
            childrenSvg += renderLineSvg(offsetX, startY, offsetX, endY, options);
            totalHeight = parseFloat((totalHeight + options.nodeListSpace).toFixed(1));
        }
        currentY = parseFloat((currentY + childFragment.height + options.nodeListSpace).toFixed(1));
    }
    return {
        svg: childrenSvg,
        width: parseFloat((maxWidth + offsetX).toFixed(1)),
        height: totalHeight,
        type: "NodeList",
    };
}
// == テキスト処理 ==
/**
 * テキストのサイズを概算するヘルパー関数。
 * 全角文字と半角文字を考慮してテキストの幅を計算します。
 */
function measureTextSvg(text, options) {
    const lines = text.split("\n");
    const maxWidth = Math.max(...lines.map((line) => {
        let width = 0;
        width = (eaw.length(line) * options.fontSize) / 2;
        return width;
    }));
    const textHeight = lines.length * options.fontSize * options.lineHeight;
    return { width: maxWidth, height: textHeight };
}
/**
 * テキストをSVG形式で描画
 */
function renderTextSvg(text, posX, posY, options) {
    const lines = text.split("\n");
    let svg = "";
    lines.forEach((line, index) => {
        const dy = index === 0 ? 0 : index * options.fontSize * options.lineHeight;
        svg += `<text `;
        svg += `x="${posX.toFixed(1)}" y="${(posY + options.fontSize).toFixed(1)}" dy="${dy.toFixed(1)}" `;
        svg += `font-family="${options.fontFamily}" `;
        svg += `font-size="${options.fontSize}" `;
        svg += `fill="${options.textColor}">${line}</text>`;
    });
    return svg;
}
// == 描画支援 ==
/**
 * line描画支援
 */
function renderLineSvg(x1, y1, x2, y2, options) {
    return `<line
		x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}"
		x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
		stroke="${options.strokeColor}"
		stroke-width="${options.strokeWidth}"
	/>`;
}
/**
 * 描画位置オフセット支援
 */
function renderTransformTranslateSvg(x, y, childSvg) {
    return `<g transform="translate(${x.toFixed(1)}, ${y.toFixed(1)})">${childSvg}</g>`;
}
