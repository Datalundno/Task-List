"use strict";

export interface ListLayout {
    viewportWidth: number;
    viewportHeight: number;
    contentHeight: number;
    rowHeight: number;
    needsVerticalScroll: boolean;
}

export function computeListLayout(
    viewportWidth: number,
    viewportHeight: number,
    rowCount: number,
    rowHeight: number
): ListLayout {
    const contentHeight = Math.max(rowCount * rowHeight, rowHeight);
    return {
        viewportWidth: Math.max(1, viewportWidth),
        viewportHeight: Math.max(1, viewportHeight),
        contentHeight,
        rowHeight,
        needsVerticalScroll: contentHeight > viewportHeight
    };
}
