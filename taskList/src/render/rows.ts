"use strict";

import * as d3 from "d3";
import { ColumnFlags, DisplayRow, TaskRow } from "../data/types";
import { ListDensitySizes } from "../suite/density";
import { toCompactDate } from "../utils/dates";
import { RagColors, colorForRag } from "../utils/status";

export interface RowRenderOptions {
    width: number;
    sizes: ListDensitySizes;
    fontFamily: string;
    textColor: string;
    mutedColor: string;
    zebraFill: string;
    headerFill: string;
    selectedFill: string;
    alternateRowShading: boolean;
    hasSelection: boolean;
    columns: ColumnFlags;
    ragColors: RagColors;
    progressTrack: string;
    progressFill: string;
    showPercent: boolean;
    isSelected: (task: TaskRow) => boolean;
    onClick: (event: MouseEvent, task: TaskRow) => void;
    onContextMenu: (event: MouseEvent, task: TaskRow) => void;
    onMouseMove: (event: MouseEvent, task: TaskRow) => void;
    onMouseOut: (event: MouseEvent, task: TaskRow) => void;
}

function colWidths(width: number, columns: ColumnFlags, pad: number): {
    chip: number;
    name: number;
    resource: number;
    group: number;
    progress: number;
    start: number;
    end: number;
} {
    const inner = Math.max(40, width - pad * 2);
    const chip = columns.status ? 22 : 0;
    const dateW = columns.start || columns.end ? 78 : 0;
    const start = columns.start ? dateW : 0;
    const end = columns.end ? dateW : 0;
    const progress = columns.progress ? Math.min(120, Math.max(72, Math.round(inner * 0.18))) : 0;
    const resource = columns.resource ? Math.min(140, Math.max(80, Math.round(inner * 0.16))) : 0;
    const group = columns.group ? Math.min(120, Math.max(70, Math.round(inner * 0.14))) : 0;
    const used = chip + resource + group + progress + start + end + 8;
    const name = Math.max(80, inner - used);
    return { chip, name, resource, group, progress, start, end };
}

export function renderListRows(
    layer: d3.Selection<SVGGElement, unknown, null, undefined>,
    displayRows: DisplayRow[],
    options: RowRenderOptions
): void {
    const {
        width,
        sizes,
        fontFamily,
        textColor,
        mutedColor,
        zebraFill,
        headerFill,
        selectedFill,
        alternateRowShading,
        hasSelection,
        columns,
        ragColors,
        progressTrack,
        progressFill,
        showPercent,
        isSelected,
        onClick,
        onContextMenu,
        onMouseMove,
        onMouseOut
    } = options;

    const cols = colWidths(width, columns, sizes.horizontalPadding);
    const rowH = sizes.rowHeight;

    const bound = layer.selectAll<SVGGElement, DisplayRow>("g.list-row")
        .data(displayRows, (d) => d.id);

    bound.exit().remove();

    const enter = bound.enter()
        .append("g")
        .attr("class", "list-row");

    enter.append("rect").attr("class", "row-bg");
    enter.append("circle").attr("class", "status-chip");
    enter.append("text").attr("class", "row-name");
    enter.append("text").attr("class", "row-resource");
    enter.append("text").attr("class", "row-group");
    enter.append("rect").attr("class", "progress-track");
    enter.append("rect").attr("class", "progress-fill");
    enter.append("text").attr("class", "progress-label");
    enter.append("text").attr("class", "row-start");
    enter.append("text").attr("class", "row-end");
    enter.append("text").attr("class", "header-label");

    const rows = enter.merge(bound);

    rows.attr("transform", (_d, i) => `translate(0,${i * rowH})`)
        .attr("role", (d) => d.kind === "task" ? "option" : "presentation")
        .style("cursor", (d) => d.kind === "task" ? "pointer" : "default");

    rows.select<SVGRectElement>("rect.row-bg")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", rowH)
        .attr("fill", (d, i) => {
            if (d.kind === "group") {
                return headerFill;
            }
            if (d.task && hasSelection && isSelected(d.task)) {
                return selectedFill;
            }
            if (alternateRowShading && i % 2 === 1) {
                return zebraFill;
            }
            return "transparent";
        })
        .attr("opacity", (d) => {
            if (d.kind === "task" && hasSelection && d.task && !isSelected(d.task)) {
                return 0.55;
            }
            return 1;
        });

    // Group headers
    rows.select<SVGTextElement>("text.header-label")
        .style("display", (d) => d.kind === "group" ? null : "none")
        .attr("x", sizes.horizontalPadding)
        .attr("y", rowH / 2)
        .attr("dominant-baseline", "middle")
        .attr("font-family", fontFamily)
        .attr("font-size", sizes.fontSize)
        .attr("font-weight", 600)
        .attr("fill", textColor)
        .text((d) => d.kind === "group" ? `${d.label} (${d.taskCount ?? 0})` : "");

    const taskRows = rows.filter((d) => d.kind === "task");

    const x0 = sizes.horizontalPadding;
    let x = x0;

    // Status chip
    taskRows.select<SVGCircleElement>("circle.status-chip")
        .style("display", columns.status ? null : "none")
        .attr("cx", x + cols.chip / 2)
        .attr("cy", rowH / 2)
        .attr("r", sizes.chipSize / 2)
        .attr("fill", (d) => d.task ? colorForRag(d.task.statusLevel, ragColors) : ragColors.neutral);

    if (columns.status) {
        x += cols.chip;
    }

    // Name
    taskRows.select<SVGTextElement>("text.row-name")
        .style("display", null)
        .attr("x", x + 4)
        .attr("y", rowH / 2)
        .attr("dominant-baseline", "middle")
        .attr("font-family", fontFamily)
        .attr("font-size", sizes.fontSize)
        .attr("font-weight", 560)
        .attr("fill", textColor)
        .text((d) => truncate(d.label, cols.name, sizes.fontSize));

    x += cols.name;

    // Resource
    taskRows.select<SVGTextElement>("text.row-resource")
        .style("display", columns.resource ? null : "none")
        .attr("x", x)
        .attr("y", rowH / 2)
        .attr("dominant-baseline", "middle")
        .attr("font-family", fontFamily)
        .attr("font-size", Math.max(9, sizes.fontSize - 1))
        .attr("fill", mutedColor)
        .text((d) => columns.resource ? truncate(d.task?.resource ?? "—", cols.resource, sizes.fontSize - 1) : "");

    if (columns.resource) {
        x += cols.resource;
    }

    // Group (as column when headers off, or always as meta when headers on — show if bound and headers off)
    const showGroupCol = columns.group;
    taskRows.select<SVGTextElement>("text.row-group")
        .style("display", showGroupCol ? null : "none")
        .attr("x", x)
        .attr("y", rowH / 2)
        .attr("dominant-baseline", "middle")
        .attr("font-family", fontFamily)
        .attr("font-size", Math.max(9, sizes.fontSize - 1))
        .attr("fill", mutedColor)
        .text((d) => showGroupCol ? truncate(d.task?.group ?? "—", cols.group, sizes.fontSize - 1) : "");

    if (showGroupCol) {
        x += cols.group;
    }

    // Progress
    const trackH = sizes.progressTrackHeight;
    const trackY = (rowH - trackH) / 2;
    const trackW = Math.max(24, cols.progress - (showPercent ? 36 : 4));

    taskRows.select<SVGRectElement>("rect.progress-track")
        .style("display", columns.progress ? null : "none")
        .attr("x", x)
        .attr("y", trackY)
        .attr("width", trackW)
        .attr("height", trackH)
        .attr("rx", sizes.cornerRadius)
        .attr("ry", sizes.cornerRadius)
        .attr("fill", progressTrack);

    taskRows.select<SVGRectElement>("rect.progress-fill")
        .style("display", (d) => columns.progress && d.task?.progress != null ? null : "none")
        .attr("x", x)
        .attr("y", trackY)
        .attr("width", (d) => {
            const p = d.task?.progress;
            if (p == null) {
                return 0;
            }
            return Math.max(0, Math.min(1, p)) * trackW;
        })
        .attr("height", trackH)
        .attr("rx", sizes.cornerRadius)
        .attr("ry", sizes.cornerRadius)
        .attr("fill", progressFill);

    taskRows.select<SVGTextElement>("text.progress-label")
        .style("display", (d) => columns.progress && showPercent ? null : "none")
        .attr("x", x + trackW + 6)
        .attr("y", rowH / 2)
        .attr("dominant-baseline", "middle")
        .attr("font-family", fontFamily)
        .attr("font-size", Math.max(9, sizes.fontSize - 1))
        .attr("fill", mutedColor)
        .text((d) => {
            if (d.task?.progress == null) {
                return "—";
            }
            return `${Math.round(d.task.progress * 100)}%`;
        });

    if (columns.progress) {
        x += cols.progress;
    }

    // Dates
    taskRows.select<SVGTextElement>("text.row-start")
        .style("display", columns.start ? null : "none")
        .attr("x", x)
        .attr("y", rowH / 2)
        .attr("dominant-baseline", "middle")
        .attr("font-family", fontFamily)
        .attr("font-size", Math.max(9, sizes.fontSize - 1))
        .attr("fill", mutedColor)
        .text((d) => columns.start ? toCompactDate(d.task?.start ?? null) : "");

    if (columns.start) {
        x += cols.start;
    }

    taskRows.select<SVGTextElement>("text.row-end")
        .style("display", columns.end ? null : "none")
        .attr("x", x)
        .attr("y", rowH / 2)
        .attr("dominant-baseline", "middle")
        .attr("font-family", fontFamily)
        .attr("font-size", Math.max(9, sizes.fontSize - 1))
        .attr("fill", mutedColor)
        .text((d) => columns.end ? toCompactDate(d.task?.end ?? null) : "");

    // Hide task-only elements on group rows
    rows.filter((d) => d.kind === "group")
        .selectAll("circle.status-chip, text.row-name, text.row-resource, text.row-group, rect.progress-track, rect.progress-fill, text.progress-label, text.row-start, text.row-end")
        .style("display", "none");

    rows.on("click", function (event: MouseEvent, d: DisplayRow) {
        event.stopPropagation();
        if (d.kind === "task" && d.task) {
            onClick(event, d.task);
        }
    });

    rows.on("contextmenu", function (event: MouseEvent, d: DisplayRow) {
        if (d.kind === "task" && d.task) {
            onContextMenu(event, d.task);
        }
    });

    rows.on("mousemove", function (event: MouseEvent, d: DisplayRow) {
        if (d.kind === "task" && d.task) {
            onMouseMove(event, d.task);
        }
    });

    rows.on("mouseout", function (event: MouseEvent, d: DisplayRow) {
        if (d.kind === "task" && d.task) {
            onMouseOut(event, d.task);
        }
    });
}

function truncate(text: string, maxWidth: number, fontSize: number): string {
    if (!text) {
        return "";
    }
    // Approximate average char width ~0.55em
    const maxChars = Math.max(4, Math.floor(maxWidth / (fontSize * 0.55)));
    if (text.length <= maxChars) {
        return text;
    }
    return `${text.slice(0, Math.max(1, maxChars - 1))}…`;
}
