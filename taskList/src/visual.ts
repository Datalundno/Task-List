"use strict";

import powerbi from "powerbi-visuals-api";
import * as d3 from "d3";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ITooltipService = powerbi.extensibility.ITooltipService;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import VisualUpdateType = powerbi.VisualUpdateType;
import ISelectionId = powerbi.visuals.ISelectionId;

import { VisualFormattingSettingsModel } from "./settings";
import { convertDataView } from "./data/converter";
import { buildDisplayRows } from "./data/groups";
import { ColumnFlags, SortOrder, TaskRow, ViewModel } from "./data/types";
import { computeListLayout } from "./render/layout";
import { renderListRows } from "./render/rows";
import { getContrastColors } from "./utils/contrast";
import { buildTooltipDataItems, pointerCoordinates } from "./utils/tooltips";
import { RagColors } from "./utils/status";
import {
    parseDensityPreset,
    resolveDensitySizes,
    toListDensitySizes
} from "./suite/density";

export class Visual implements IVisual {
    private host: IVisualHost;
    private events: IVisualEventService;
    private selectionManager: ISelectionManager;
    private tooltipService: ITooltipService;
    private localization: ILocalizationManager;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    private root: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private message: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private landing: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private chart: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private listCol: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private listSvg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private rowLayer: d3.Selection<SVGGElement, unknown, null, undefined>;

    private viewModel: ViewModel | null = null;
    private selectedKeys: Set<string> = new Set();
    private lastViewport: { width: number; height: number } | null = null;
    private isLandingPageOn = false;
    private focusedTaskIndex = 0;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.events = options.host.eventService;
        this.selectionManager = options.host.createSelectionManager();
        this.tooltipService = options.host.tooltipService;
        this.localization = options.host.createLocalizationManager();
        this.formattingSettingsService = new FormattingSettingsService(this.localization);

        this.selectionManager.registerOnSelectCallback((ids: ISelectionId[]) => {
            this.selectedKeys = new Set((ids ?? []).map((id) => id.getKey()));
            this.renderFromState();
        });

        this.root = d3.select(options.element)
            .append("div")
            .classed("tasklist-root", true)
            .attr("tabindex", "0")
            .attr("role", "listbox")
            .attr("aria-label", "DataLund Task List");

        this.message = this.root
            .append("div")
            .classed("tasklist-message", true)
            .style("display", "none");

        this.landing = this.root
            .append("div")
            .classed("tasklist-landing", true)
            .style("display", "none");

        this.buildLandingPage();

        this.chart = this.root
            .append("div")
            .classed("tasklist-chart", true);

        this.listCol = this.chart
            .append("div")
            .classed("tasklist-list-col", true);

        this.listSvg = this.listCol
            .append("svg")
            .classed("tasklist-svg", true);

        this.rowLayer = this.listSvg.append("g").classed("rows", true);

        this.listSvg.on("click", () => {
            this.clearSelection();
        });

        this.root.on("contextmenu", (event: MouseEvent) => {
            this.showEmptyContextMenu(event);
        });

        this.root.on("keydown", (event: KeyboardEvent) => {
            this.onRootKeyDown(event);
        });
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);

        try {
            const dataView = options.dataViews && options.dataViews[0];
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
                VisualFormattingSettingsModel,
                dataView
            );

            const hasBoundFields = (dataView?.metadata?.columns?.length ?? 0) > 0;
            if (!hasBoundFields) {
                this.showLandingPage();
                this.viewModel = null;
                this.lastViewport = {
                    width: options.viewport.width,
                    height: options.viewport.height
                };
                this.events.renderingFinished(options);
                return;
            }

            this.hideLandingPage();

            const isResizeOnly =
                options.type === VisualUpdateType.Resize ||
                options.type === VisualUpdateType.ResizeEnd ||
                (options.type & VisualUpdateType.Resize) === VisualUpdateType.Resize;

            if (!isResizeOnly || !this.viewModel) {
                const sortOrder = this.resolveSortOrder();
                this.viewModel = convertDataView(dataView, this.host, sortOrder);
                this.syncSelectionFromManager();
                this.clampFocusedIndex();
            }

            this.lastViewport = {
                width: options.viewport.width,
                height: options.viewport.height
            };
            this.renderFromState();

            this.events.renderingFinished(options);
        } catch (error) {
            const prefix = this.t("Msg_RenderError", "Unable to render Task List");
            this.showMessage(`${prefix}: ${String(error)}`);
            this.events.renderingFailed(options, String(error));
        }
    }

    private t(key: string, fallback: string): string {
        try {
            const value = this.localization.getDisplayName(key);
            return value || fallback;
        } catch {
            return fallback;
        }
    }

    private resolveSortOrder(): SortOrder {
        const raw = this.formattingSettings?.generalCard?.sortOrder?.value?.value as SortOrder | undefined;
        if (raw === "status" || raw === "endDate" || raw === "name" || raw === "groupName") {
            return raw;
        }
        return "groupName";
    }

    private buildLandingPage(): void {
        const node = this.landing.node();
        if (node) {
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
        }

        const card = this.landing.append("div").classed("tasklist-landing-card", true);

        card.append("div")
            .classed("tasklist-landing-mark", true)
            .attr("aria-hidden", "true");

        card.append("h2")
            .classed("tasklist-landing-title", true)
            .text(this.t("Landing_Title", "DataLund Task List"));

        card.append("p")
            .classed("tasklist-landing-subtitle", true)
            .text(this.t(
                "Landing_Subtitle",
                "Browse and select tasks or projects to cross-filter the page."
            ));

        const steps = card.append("ul").classed("tasklist-landing-steps", true);
        const stepKeys: Array<[string, string]> = [
            ["Landing_Step1", "1. Drag Project into the Project field"],
            ["Landing_Step2", "2. Optional: RAG, Group, Project lead, Progress"],
            ["Landing_Step3", "3. Optional: Start Date and End Date"],
            ["Landing_Step4", "4. Also supported: Duration (if no End Date), Tooltips"]
        ];
        for (const [key, fallback] of stepKeys) {
            steps.append("li").text(this.t(key, fallback));
        }
    }

    private showLandingPage(): void {
        this.isLandingPageOn = true;
        this.chart.style("display", "none");
        this.message.style("display", "none").text("");
        this.landing.style("display", "flex");
    }

    private hideLandingPage(): void {
        if (!this.isLandingPageOn) {
            this.landing.style("display", "none");
            return;
        }
        this.isLandingPageOn = false;
        this.landing.style("display", "none");
    }

    private taskRows(): TaskRow[] {
        return this.viewModel?.tasks ?? [];
    }

    private clampFocusedIndex(): void {
        const count = this.taskRows().length;
        if (count === 0) {
            this.focusedTaskIndex = 0;
            return;
        }
        this.focusedTaskIndex = Math.max(0, Math.min(this.focusedTaskIndex, count - 1));
    }

    private onRootKeyDown(event: KeyboardEvent): void {
        if (!this.host.hostCapabilities?.allowInteractions) {
            return;
        }
        if (this.isLandingPageOn || !this.viewModel || this.viewModel.tasks.length === 0) {
            return;
        }

        const tasks = this.taskRows();
        this.clampFocusedIndex();

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                this.focusedTaskIndex = Math.min(tasks.length - 1, this.focusedTaskIndex + 1);
                this.renderFromState();
                break;
            case "ArrowUp":
                event.preventDefault();
                this.focusedTaskIndex = Math.max(0, this.focusedTaskIndex - 1);
                this.renderFromState();
                break;
            case "Home":
                event.preventDefault();
                this.focusedTaskIndex = 0;
                this.renderFromState();
                break;
            case "End":
                event.preventDefault();
                this.focusedTaskIndex = tasks.length - 1;
                this.renderFromState();
                break;
            case "Enter":
            case " ": {
                event.preventDefault();
                const task = tasks[this.focusedTaskIndex];
                if (task) {
                    this.selectTask(task, event.ctrlKey || event.metaKey);
                }
                break;
            }
            case "Escape":
                event.preventDefault();
                this.clearSelection();
                break;
            default:
                break;
        }
    }

    private showEmptyContextMenu(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        if (!this.host.hostCapabilities?.allowInteractions) {
            return;
        }
        this.selectionManager.showContextMenu({} as ISelectionId, {
            x: event.clientX,
            y: event.clientY
        });
    }

    private onRowContextMenu(event: MouseEvent, task: TaskRow): void {
        event.preventDefault();
        event.stopPropagation();
        if (!this.host.hostCapabilities?.allowInteractions) {
            return;
        }
        const selectionId = task.selectionId ?? ({} as ISelectionId);
        this.selectionManager.showContextMenu(selectionId, {
            x: event.clientX,
            y: event.clientY
        });
    }

    private syncSelectionFromManager(): void {
        const ids = this.selectionManager.getSelectionIds() as ISelectionId[];
        this.selectedKeys = new Set((ids ?? []).map((id) => id.getKey()));
    }

    private isTaskSelected(task: TaskRow): boolean {
        if (!task.selectionId) {
            return false;
        }
        return this.selectedKeys.has(task.selectionId.getKey());
    }

    private onRowClick(event: MouseEvent, task: TaskRow): void {
        if (!this.host.hostCapabilities?.allowInteractions) {
            return;
        }
        if (!task.selectionId) {
            return;
        }
        const multi = event.ctrlKey || event.metaKey;
        this.selectTask(task, multi);
    }

    private selectTask(task: TaskRow, multi: boolean): void {
        if (!task.selectionId) {
            return;
        }
        this.selectionManager.select(task.selectionId, multi).then((ids: ISelectionId[]) => {
            this.selectedKeys = new Set((ids ?? []).map((id) => id.getKey()));
            this.renderFromState();
        });
    }

    private clearSelection(): void {
        if (!this.host.hostCapabilities?.allowInteractions) {
            return;
        }
        if (!this.selectionManager.hasSelection()) {
            return;
        }
        this.selectionManager.clear().then(() => {
            this.selectedKeys.clear();
            this.renderFromState();
        });
    }

    private onRowMouseMove(event: MouseEvent, task: TaskRow): void {
        if (!this.tooltipService.enabled()) {
            return;
        }
        const rootNode = this.root.node();
        if (!rootNode) {
            return;
        }
        const identities = task.selectionId ? [task.selectionId] : [];
        this.tooltipService.show({
            coordinates: pointerCoordinates(event, rootNode),
            isTouchEvent: false,
            dataItems: buildTooltipDataItems(task),
            identities
        });
    }

    private onRowMouseOut(_event: MouseEvent, _task: TaskRow): void {
        this.tooltipService.hide({
            isTouchEvent: false,
            immediately: true
        });
    }

    private renderFromState(): void {
        if (!this.lastViewport || !this.viewModel) {
            return;
        }

        const viewModel = this.viewModel;
        if (viewModel.errorMessage || viewModel.tasks.length === 0) {
            this.showMessage(
                viewModel.errorMessage
                    ?? this.t("Msg_AddFields", "Add a Task (Project) field to render the list.")
            );
            return;
        }

        this.hideMessage();

        const density = parseDensityPreset(
            this.formattingSettings?.generalCard?.density?.value?.value
        );
        const baseSizes = resolveDensitySizes(density, {
            barHeight: Math.max(16, (this.formattingSettings?.labelsCard?.fontSize?.value ?? 12) + 16),
            rowGap: this.formattingSettings?.labelsCard?.rowPadding?.value ?? 12,
            fontSize: this.formattingSettings?.labelsCard?.fontSize?.value ?? 12,
            labelWidth: 200,
            cornerRadius: this.formattingSettings?.labelsCard?.cornerRadius?.value ?? 4
        });
        const sizes = toListDensitySizes(
            baseSizes,
            density === "custom"
                ? this.formattingSettings?.labelsCard?.rowPadding?.value
                : undefined
        );

        const showGroupHeaders =
            (this.formattingSettings?.generalCard?.showGroupHeaders?.value ?? true)
            && viewModel.hasGroups;

        // When group headers are shown, omit the group column to avoid duplication.
        const columns: ColumnFlags = {
            status: viewModel.hasStatus,
            group: viewModel.hasGroups && !showGroupHeaders,
            resource: viewModel.hasResource,
            progress: viewModel.hasProgress,
            start: viewModel.hasStart,
            end: viewModel.hasEnd
        };

        const displayRows = buildDisplayRows(viewModel.tasks, showGroupHeaders);
        const layout = computeListLayout(
            this.lastViewport.width,
            this.lastViewport.height,
            displayRows.length,
            sizes.rowHeight
        );

        const contrast = getContrastColors(this.host.colorPalette);
        const fontFamily = this.formattingSettings?.labelsCard?.fontFamily?.value
            ?? "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif";
        const alternateRowShading =
            this.formattingSettings?.generalCard?.alternateRowShading?.value ?? true;

        const ragColors: RagColors = {
            red: contrast.isHighContrast
                ? contrast.foreground
                : (this.formattingSettings?.statusCard?.redColor?.value?.value || "#dc2626"),
            amber: contrast.isHighContrast
                ? contrast.foreground
                : (this.formattingSettings?.statusCard?.amberColor?.value?.value || "#d97706"),
            green: contrast.isHighContrast
                ? contrast.foreground
                : (this.formattingSettings?.statusCard?.greenColor?.value?.value || "#16a34a"),
            neutral: contrast.isHighContrast ? contrast.foreground : "#94a3b8"
        };

        const progressTrack = contrast.isHighContrast
            ? contrast.background
            : (this.formattingSettings?.progressCard?.trackColor?.value?.value || "#e2e8f0");
        const progressFill = contrast.isHighContrast
            ? contrast.foregroundSelected
            : (this.formattingSettings?.progressCard?.fillColor?.value?.value || "#0284c7");
        const showPercent = this.formattingSettings?.progressCard?.showPercent?.value ?? true;

        const zebraFill = contrast.isHighContrast
            ? contrast.background
            : "rgba(15, 23, 42, 0.035)";
        const headerFill = contrast.isHighContrast
            ? contrast.background
            : "rgba(15, 23, 42, 0.06)";
        const selectedFill = contrast.isHighContrast
            ? contrast.background
            : "rgba(14, 165, 233, 0.14)";
        const mutedColor = contrast.isHighContrast ? contrast.foreground : "#64748b";

        this.root.style("background", contrast.background);

        this.listCol
            .style("height", `${layout.viewportHeight}px`)
            .style("overflow-y", layout.needsVerticalScroll ? "auto" : "hidden")
            .style("overflow-x", "hidden");

        this.listSvg
            .attr("width", layout.viewportWidth)
            .attr("height", layout.contentHeight);

        renderListRows(this.rowLayer, displayRows, {
            width: layout.viewportWidth,
            sizes,
            fontFamily,
            textColor: contrast.foreground,
            mutedColor,
            zebraFill,
            headerFill,
            selectedFill,
            alternateRowShading,
            hasSelection: this.selectedKeys.size > 0,
            columns,
            ragColors,
            progressTrack,
            progressFill,
            showPercent,
            isSelected: (task) => this.isTaskSelected(task),
            isFocused: (task) => {
                const tasks = this.taskRows();
                const focused = tasks[this.focusedTaskIndex];
                return !!focused && focused.id === task.id;
            },
            onClick: (event, task) => {
                const idx = this.taskRows().findIndex((t) => t.id === task.id);
                if (idx >= 0) {
                    this.focusedTaskIndex = idx;
                }
                this.onRowClick(event, task);
            },
            onContextMenu: (event, task) => this.onRowContextMenu(event, task),
            onMouseMove: (event, task) => this.onRowMouseMove(event, task),
            onMouseOut: (event, task) => this.onRowMouseOut(event, task)
        });
    }

    private showMessage(text: string): void {
        this.hideLandingPage();
        this.chart.style("display", "none");
        this.message
            .style("display", "flex")
            .text(text);
    }

    private hideMessage(): void {
        this.message.style("display", "none").text("");
        this.chart.style("display", "flex");
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    public destroy(): void {
        this.root.remove();
        this.viewModel = null;
        this.selectedKeys.clear();
    }
}
