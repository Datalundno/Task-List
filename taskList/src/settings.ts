"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import powerbi from "powerbi-visuals-api";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

const densityItems: powerbi.IEnumMember[] = [
    { value: "compact", displayName: "Compact" },
    { value: "comfortable", displayName: "Comfortable" },
    { value: "large", displayName: "Large" },
    { value: "custom", displayName: "Custom" }
];

const sortOrderItems: powerbi.IEnumMember[] = [
    { value: "groupName", displayName: "Group then name" },
    { value: "status", displayName: "Status (RAG)" },
    { value: "endDate", displayName: "End date" },
    { value: "name", displayName: "Name" }
];

class GeneralCardSettings extends FormattingSettingsCard {
    density = new formattingSettings.ItemDropdown({
        name: "density",
        displayName: "Density",
        displayNameKey: "Prop_Density",
        description: "Suite size preset. Custom uses Labels / rows values.",
        items: densityItems,
        value: densityItems[1]
    });

    sortOrder = new formattingSettings.ItemDropdown({
        name: "sortOrder",
        displayName: "Sort order",
        displayNameKey: "Prop_SortOrder",
        items: sortOrderItems,
        value: sortOrderItems[0]
    });

    showGroupHeaders = new formattingSettings.ToggleSwitch({
        name: "showGroupHeaders",
        displayName: "Show group headers",
        displayNameKey: "Prop_ShowGroupHeaders",
        value: true
    });

    alternateRowShading = new formattingSettings.ToggleSwitch({
        name: "alternateRowShading",
        displayName: "Alternate row shading",
        displayNameKey: "Prop_AlternateRowShading",
        value: true
    });

    name: string = "general";
    displayName: string = "General";
    displayNameKey: string = "Objects_General";
    slices: Array<FormattingSettingsSlice> = [
        this.density,
        this.sortOrder,
        this.showGroupHeaders,
        this.alternateRowShading
    ];
}

class StatusCardSettings extends FormattingSettingsCard {
    redColor = new formattingSettings.ColorPicker({
        name: "redColor",
        displayName: "Red",
        displayNameKey: "Prop_StatusRed",
        value: { value: "#dc2626" }
    });

    amberColor = new formattingSettings.ColorPicker({
        name: "amberColor",
        displayName: "Amber",
        displayNameKey: "Prop_StatusAmber",
        value: { value: "#d97706" }
    });

    greenColor = new formattingSettings.ColorPicker({
        name: "greenColor",
        displayName: "Green",
        displayNameKey: "Prop_StatusGreen",
        value: { value: "#16a34a" }
    });

    name: string = "status";
    displayName: string = "Status";
    displayNameKey: string = "Objects_Status";
    slices: Array<FormattingSettingsSlice> = [
        this.redColor,
        this.amberColor,
        this.greenColor
    ];
}

class ProgressCardSettings extends FormattingSettingsCard {
    trackColor = new formattingSettings.ColorPicker({
        name: "trackColor",
        displayName: "Track",
        displayNameKey: "Prop_ProgressTrack",
        value: { value: "#e2e8f0" }
    });

    fillColor = new formattingSettings.ColorPicker({
        name: "fillColor",
        displayName: "Fill",
        displayNameKey: "Prop_ProgressFill",
        value: { value: "#0284c7" }
    });

    showPercent = new formattingSettings.ToggleSwitch({
        name: "showPercent",
        displayName: "Show percent label",
        displayNameKey: "Prop_ShowPercent",
        value: true
    });

    name: string = "progress";
    displayName: string = "Progress";
    displayNameKey: string = "Objects_Progress";
    slices: Array<FormattingSettingsSlice> = [
        this.trackColor,
        this.fillColor,
        this.showPercent
    ];
}

class LabelsCardSettings extends FormattingSettingsCard {
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Font size",
        displayNameKey: "Prop_FontSize",
        value: 12
    });

    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font family",
        displayNameKey: "Prop_FontFamily",
        value: "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif"
    });

    rowPadding = new formattingSettings.NumUpDown({
        name: "rowPadding",
        displayName: "Row padding",
        displayNameKey: "Prop_RowPadding",
        value: 12
    });

    cornerRadius = new formattingSettings.NumUpDown({
        name: "cornerRadius",
        displayName: "Corner radius",
        displayNameKey: "Prop_CornerRadius",
        value: 4
    });

    name: string = "labels";
    displayName: string = "Labels / rows";
    displayNameKey: string = "Objects_Labels";
    slices: Array<FormattingSettingsSlice> = [
        this.fontSize,
        this.fontFamily,
        this.rowPadding,
        this.cornerRadius
    ];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    generalCard = new GeneralCardSettings();
    statusCard = new StatusCardSettings();
    progressCard = new ProgressCardSettings();
    labelsCard = new LabelsCardSettings();

    cards = [this.generalCard, this.statusCard, this.progressCard, this.labelsCard];
}
