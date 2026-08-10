"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;
import { RagLevel } from "../utils/status";

export const ROLE_TASK = "task";
export const ROLE_STATUS = "status";
export const ROLE_GROUP = "group";
export const ROLE_RESOURCE = "resource";
export const ROLE_PROGRESS = "progress";
export const ROLE_START = "startDate";
export const ROLE_END = "endDate";
export const ROLE_DURATION = "duration";
export const ROLE_TOOLTIPS = "tooltipFields";

export const UNGROUPED_KEY = "__ungrouped__";

export type SortOrder = "groupName" | "status" | "endDate" | "name";

export interface TooltipField {
    displayName: string;
    value: string | number | Date | null;
}

export interface TaskRow {
    id: string;
    task: string;
    statusRaw: string | null;
    statusLevel: RagLevel;
    group: string | null;
    resource: string | null;
    progress: number | null;
    start: Date | null;
    end: Date | null;
    durationDays: number | null;
    tooltipFields: TooltipField[];
    selectionId: ISelectionId | null;
}

export type DisplayRowKind = "group" | "task";

export interface DisplayRow {
    id: string;
    kind: DisplayRowKind;
    label: string;
    groupKey: string;
    task?: TaskRow;
    collapsed?: boolean;
    taskCount?: number;
}

export interface ViewModel {
    tasks: TaskRow[];
    hasGroups: boolean;
    hasStatus: boolean;
    hasProgress: boolean;
    hasResource: boolean;
    hasStart: boolean;
    hasEnd: boolean;
    errorMessage: string | null;
}

export interface RoleColumnIndex {
    task: number | null;
    status: number | null;
    group: number | null;
    resource: number | null;
    progress: number | null;
    startDate: number | null;
    endDate: number | null;
    duration: number | null;
    tooltips: number[];
}

export interface ColumnFlags {
    status: boolean;
    group: boolean;
    resource: boolean;
    progress: boolean;
    start: boolean;
    end: boolean;
}
