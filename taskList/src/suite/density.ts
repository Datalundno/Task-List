"use strict";

/**
 * Suite-wide density presets.
 * Keep in sync with GANTT SUITE.md / TASK_LIST.md — same names/numbers for every DataLund visual.
 */

export type DensityPreset = "compact" | "comfortable" | "large" | "custom";

export interface DensitySizes {
    barHeight: number;
    rowGap: number;
    fontSize: number;
    labelWidth: number;
    cornerRadius: number;
}

/** List-specific derived sizes from suite density. */
export interface ListDensitySizes extends DensitySizes {
    rowHeight: number;
    horizontalPadding: number;
    chipSize: number;
    progressTrackHeight: number;
}

export const DENSITY_PRESETS: Record<Exclude<DensityPreset, "custom">, DensitySizes> = {
    compact: {
        barHeight: 16,
        rowGap: 8,
        fontSize: 10,
        labelWidth: 140,
        cornerRadius: 2
    },
    comfortable: {
        barHeight: 28,
        rowGap: 12,
        fontSize: 12,
        labelWidth: 200,
        cornerRadius: 4
    },
    large: {
        barHeight: 36,
        rowGap: 16,
        fontSize: 14,
        labelWidth: 240,
        cornerRadius: 6
    }
};

export function parseDensityPreset(raw: unknown): DensityPreset {
    if (raw === "compact" || raw === "comfortable" || raw === "large" || raw === "custom") {
        return raw;
    }
    return "comfortable";
}

export function resolveDensitySizes(
    preset: DensityPreset,
    custom: DensitySizes
): DensitySizes {
    if (preset === "custom") {
        return custom;
    }
    return DENSITY_PRESETS[preset];
}

export function toListDensitySizes(
    sizes: DensitySizes,
    customRowPadding?: number
): ListDensitySizes {
    const horizontalPadding = customRowPadding != null
        ? Math.max(4, customRowPadding)
        : Math.max(8, Math.round(sizes.rowGap * 0.75));
    const rowHeight = sizes.barHeight + sizes.rowGap;
    return {
        ...sizes,
        rowHeight,
        horizontalPadding,
        chipSize: Math.max(8, Math.min(14, Math.round(sizes.fontSize * 0.85))),
        progressTrackHeight: Math.max(4, Math.round(sizes.barHeight * 0.28))
    };
}
