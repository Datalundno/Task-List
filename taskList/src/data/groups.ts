"use strict";

import { DisplayRow, TaskRow, UNGROUPED_KEY } from "./types";

export function hasGrouping(tasks: TaskRow[]): boolean {
    return tasks.some((t) => t.group != null && t.group !== "");
}

/**
 * Build visible rows: optional group headers with static section children (v1).
 * Group order follows first appearance after sort.
 */
export function buildDisplayRows(
    tasks: TaskRow[],
    showGroupHeaders: boolean
): DisplayRow[] {
    if (!showGroupHeaders || !hasGrouping(tasks)) {
        return tasks.map((task) => ({
            id: task.id,
            kind: "task" as const,
            label: task.task,
            groupKey: UNGROUPED_KEY,
            task
        }));
    }

    const order: string[] = [];
    const byGroup = new Map<string, TaskRow[]>();

    tasks.forEach((task) => {
        const key = task.group && task.group !== "" ? task.group : UNGROUPED_KEY;
        if (!byGroup.has(key)) {
            byGroup.set(key, []);
            order.push(key);
        }
        byGroup.get(key)!.push(task);
    });

    const rows: DisplayRow[] = [];
    order.forEach((key) => {
        const groupTasks = byGroup.get(key) ?? [];
        const label = key === UNGROUPED_KEY ? "Ungrouped" : key;

        rows.push({
            id: `group::${key}`,
            kind: "group",
            label,
            groupKey: key,
            taskCount: groupTasks.length
        });

        groupTasks.forEach((task) => {
            rows.push({
                id: task.id,
                kind: "task",
                label: task.task,
                groupKey: key,
                task
            });
        });
    });

    return rows;
}

export function visibleTaskRows(displayRows: DisplayRow[]): TaskRow[] {
    return displayRows
        .filter((r) => r.kind === "task" && r.task)
        .map((r) => r.task!);
}
