"use strict";

import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

import {
    ROLE_DURATION,
    ROLE_END,
    ROLE_GROUP,
    ROLE_PROGRESS,
    ROLE_RESOURCE,
    ROLE_START,
    ROLE_STATUS,
    ROLE_TASK,
    ROLE_TOOLTIPS,
    RoleColumnIndex,
    SortOrder,
    TaskRow,
    TooltipField,
    ViewModel
} from "./types";
import { addDays, dayDiff, normalizeProgress, parseDate } from "../utils/dates";
import { mapStatusToRag, ragSortRank } from "../utils/status";

function emptyViewModel(errorMessage: string | null): ViewModel {
    return {
        tasks: [],
        hasGroups: false,
        hasStatus: false,
        hasProgress: false,
        hasResource: false,
        hasStart: false,
        hasEnd: false,
        errorMessage
    };
}

/**
 * Map column indexes by inspecting metadata column roles — never by field-well order.
 */
export function resolveRoleIndexes(columns: DataViewMetadataColumn[] | undefined): RoleColumnIndex {
    const indexes: RoleColumnIndex = {
        task: null,
        status: null,
        group: null,
        resource: null,
        progress: null,
        startDate: null,
        endDate: null,
        duration: null,
        tooltips: []
    };

    if (!columns) {
        return indexes;
    }

    columns.forEach((column, index) => {
        const roles = column.roles;
        if (!roles) {
            return;
        }
        if (roles[ROLE_TASK]) {
            indexes.task = index;
        }
        if (roles[ROLE_STATUS]) {
            indexes.status = index;
        }
        if (roles[ROLE_GROUP]) {
            indexes.group = index;
        }
        if (roles[ROLE_RESOURCE]) {
            indexes.resource = index;
        }
        if (roles[ROLE_PROGRESS]) {
            indexes.progress = index;
        }
        if (roles[ROLE_START]) {
            indexes.startDate = index;
        }
        if (roles[ROLE_END]) {
            indexes.endDate = index;
        }
        if (roles[ROLE_DURATION]) {
            indexes.duration = index;
        }
        if (roles[ROLE_TOOLTIPS]) {
            indexes.tooltips.push(index);
        }
    });

    return indexes;
}

function cellValue(row: powerbi.DataViewTableRow, index: number | null): unknown {
    if (index == null || index < 0 || index >= row.length) {
        return null;
    }
    return row[index];
}

function asText(value: unknown): string | null {
    if (value == null || value === "") {
        return null;
    }
    return String(value);
}

function asNumber(value: unknown): number | null {
    if (value == null || value === "") {
        return null;
    }
    const n = typeof value === "number" ? value : Number(value);
    return isFinite(n) ? n : null;
}

function buildTooltipFields(
    row: powerbi.DataViewTableRow,
    columns: DataViewMetadataColumn[],
    tooltipIndexes: number[]
): TooltipField[] {
    return tooltipIndexes.map((index) => {
        const column = columns[index];
        const raw = row[index];
        let value: string | number | Date | null = null;
        if (raw instanceof Date) {
            value = raw;
        } else if (typeof raw === "number") {
            value = raw;
        } else if (raw != null) {
            value = String(raw);
        }
        return {
            displayName: column?.displayName ?? `Field ${index}`,
            value
        };
    });
}

function compareText(a: string | null, b: string | null): number {
    return (a ?? "").localeCompare(b ?? "", undefined, { sensitivity: "base" });
}

export function sortTasks(tasks: TaskRow[], sortOrder: SortOrder): TaskRow[] {
    const sorted = [...tasks];
    sorted.sort((a, b) => {
        switch (sortOrder) {
            case "status": {
                const rank = ragSortRank(a.statusLevel) - ragSortRank(b.statusLevel);
                if (rank !== 0) {
                    return rank;
                }
                return compareText(a.task, b.task);
            }
            case "endDate": {
                const ae = a.end?.getTime() ?? Number.POSITIVE_INFINITY;
                const be = b.end?.getTime() ?? Number.POSITIVE_INFINITY;
                if (ae !== be) {
                    return ae - be;
                }
                return compareText(a.task, b.task);
            }
            case "name":
                return compareText(a.task, b.task);
            case "groupName":
            default: {
                const g = compareText(a.group, b.group);
                if (g !== 0) {
                    return g;
                }
                return compareText(a.task, b.task);
            }
        }
    });
    return sorted;
}

export function convertDataView(
    dataView: DataView | undefined,
    host?: IVisualHost,
    sortOrder: SortOrder = "groupName"
): ViewModel {
    if (!dataView || !dataView.table || !dataView.metadata) {
        return emptyViewModel("Add a Task (Project) field to render the list.");
    }

    const columns = dataView.metadata.columns ?? [];
    const roles = resolveRoleIndexes(columns);

    if (roles.task == null) {
        return emptyViewModel("Task (Project) is required.");
    }

    const table = dataView.table;
    const rows = table.rows ?? [];
    if (rows.length === 0) {
        return emptyViewModel("No rows to display.");
    }

    const tasks: TaskRow[] = [];

    rows.forEach((row, rowIndex) => {
        const taskName = asText(cellValue(row, roles.task));
        if (!taskName) {
            return;
        }

        const statusRaw = asText(cellValue(row, roles.status));
        let start = parseDate(cellValue(row, roles.startDate));
        let end = parseDate(cellValue(row, roles.endDate));
        const duration = asNumber(cellValue(row, roles.duration));

        if (!end && start && duration != null) {
            end = addDays(start, Math.max(0, duration));
        }

        let durationDays: number | null = null;
        if (start && end) {
            durationDays = Math.max(0, dayDiff(start, end));
        } else if (duration != null) {
            durationDays = Math.max(0, duration);
        }

        // Stale / inverted dates: still show the row; don't crash.
        if (start && end && end.getTime() < start.getTime()) {
            const tmp = start;
            start = end;
            end = tmp;
            if (start && end) {
                durationDays = Math.max(0, dayDiff(start, end));
            }
        }

        const selectionId = host
            ? host.createSelectionIdBuilder()
                .withTable(table, rowIndex)
                .createSelectionId()
            : null;

        tasks.push({
            id: `${taskName}::${rowIndex}`,
            task: taskName,
            statusRaw,
            statusLevel: mapStatusToRag(statusRaw),
            group: asText(cellValue(row, roles.group)),
            resource: asText(cellValue(row, roles.resource)),
            progress: normalizeProgress(cellValue(row, roles.progress)),
            start,
            end,
            durationDays,
            tooltipFields: buildTooltipFields(row, columns, roles.tooltips),
            selectionId: selectionId as powerbi.visuals.ISelectionId | null
        });
    });

    if (tasks.length === 0) {
        return emptyViewModel("No valid tasks were found.");
    }

    const sorted = sortTasks(tasks, sortOrder);

    return {
        tasks: sorted,
        hasGroups: sorted.some((t) => t.group != null && t.group !== ""),
        hasStatus: roles.status != null,
        hasProgress: roles.progress != null,
        hasResource: roles.resource != null,
        hasStart: roles.startDate != null,
        hasEnd: roles.endDate != null || roles.duration != null,
        errorMessage: null
    };
}
