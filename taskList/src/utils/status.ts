"use strict";

/**
 * Map free-text / RAG status values to Red / Amber / Green / Neutral.
 * Matching is case-insensitive.
 */

export type RagLevel = "red" | "amber" | "green" | "neutral";

const RED_TOKENS = new Set([
    "red", "r", "critical", "crit", "blocked", "off track", "off-track", "atrasado"
]);

const AMBER_TOKENS = new Set([
    "amber", "yellow", "a", "y", "at risk", "at-risk", "risk", "watch", "caution"
]);

const GREEN_TOKENS = new Set([
    "green", "g", "on track", "on-track", "ok", "healthy", "good"
]);

export function mapStatusToRag(raw: string | null | undefined): RagLevel {
    if (raw == null) {
        return "neutral";
    }
    const normalized = String(raw).trim().toLowerCase().replace(/\s+/g, " ");
    if (!normalized) {
        return "neutral";
    }
    if (RED_TOKENS.has(normalized)) {
        return "red";
    }
    if (AMBER_TOKENS.has(normalized)) {
        return "amber";
    }
    if (GREEN_TOKENS.has(normalized)) {
        return "green";
    }
    // Single-letter fallback already covered; try leading token.
    const first = normalized.split(/[\/|,;]/)[0]?.trim();
    if (first && RED_TOKENS.has(first)) {
        return "red";
    }
    if (first && AMBER_TOKENS.has(first)) {
        return "amber";
    }
    if (first && GREEN_TOKENS.has(first)) {
        return "green";
    }
    return "neutral";
}

/** Sort priority: Red first, then Amber, Green, Neutral. */
export function ragSortRank(level: RagLevel): number {
    switch (level) {
        case "red": return 0;
        case "amber": return 1;
        case "green": return 2;
        default: return 3;
    }
}

export interface RagColors {
    red: string;
    amber: string;
    green: string;
    neutral: string;
}

export function colorForRag(level: RagLevel, colors: RagColors): string {
    return colors[level] ?? colors.neutral;
}
