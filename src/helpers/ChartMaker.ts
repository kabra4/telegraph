import { CanvasRenderingContext2D, createCanvas } from "canvas";

import pkg from "chart.js";
const { Chart } = pkg;
import {
    // Chart,
    ChartConfiguration,
    BarElement,
    BarController,
    CategoryScale,
    LinearScale,
    ChartDataset,
} from "chart.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import "chartjs-plugin-annotation";
import "chartjs-plugin-datalabels";

import { Logger } from "../helpers/Logger";
const logger = Logger.getInstance();

// // Chart.register(BarElement, BarController, CategoryScale, LinearScale);
// // import { toImageBuffer } from "chartjs-to-image";

type JsonDataItem = {
    datetime: string;
    value: string;
};
export type PreprocessedData = {
    [date: string]: {
        [value: string]: number;
    };
};

type Grouping = "day" | "hour" | "5minute";

function preprocessData(
    jsonData: JsonDataItem[],
    grouping: Grouping = "day"
): PreprocessedData {
    const roundToNearest = (dateTime: string, roundTo: Grouping) => {
        const date = new Date(dateTime);
        if (roundTo === "day") {
            date.setHours(0, 0, 0, 0);
        } else if (roundTo === "hour") {
            date.setMinutes(0, 0, 0);
        } else if (roundTo === "5minute") {
            date.setMinutes(date.getMinutes() - (date.getMinutes() % 5));
        }
        return date.toISOString();
    };

    return jsonData.reduce<PreprocessedData>((acc, item) => {
        const roundedDateTime = roundToNearest(item.datetime, grouping);
        if (!acc[roundedDateTime]) {
            acc[roundedDateTime] = {};
        }
        if (!acc[roundedDateTime][item.value]) {
            acc[roundedDateTime][item.value] = 0;
        }
        acc[roundedDateTime][item.value] += 1;
        return acc;
    }, {});
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    const hueToRgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    s /= 100;
    l /= 100;

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
    const g = Math.round(hueToRgb(p, q, h) * 255);
    const b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);

    return [r, g, b];
}

function randomColor(): string {
    const h = Math.random();
    const s = Math.random() * 0.3 + 0.7; // Saturation between 70% and 100%
    const l = Math.random() * 0.2 + 0.4; // Lightness between 40% and 60%

    const [r, g, b] = hslToRgb(h, s * 100, l * 100);
    return `rgba(${r}, ${g}, ${b}, 1)`;
}

function createLabels(data: PreprocessedData, language: string): string[] {
    const dateTimeFormat = new Intl.DateTimeFormat(language, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return Object.keys(data).map((dateTime) => {
        const date = new Date(dateTime);
        return dateTimeFormat.format(date);
    });
}

function createDatasets(
    data: PreprocessedData,
    labels: string[]
): (ChartDataset<"bar"> & { data: number[] })[] {
    type DatasetAccumulator = {
        [value: string]: ChartDataset<"bar"> & { data: number[] };
    };

    return Object.entries(
        labels.reduce<DatasetAccumulator>((acc, label, index) => {
            const originalDateTime = Object.keys(data)[index];
            if (data[originalDateTime]) {
                Object.entries(data[originalDateTime]).forEach(([value, count]) => {
                    if (!acc[value]) {
                        acc[value] = {
                            label: value,
                            data: new Array(labels.length).fill(0),
                            backgroundColor: randomColor(),
                        };
                    }
                    acc[value].data[index] = count;
                });
            }
            return acc;
        }, {})
    ).map(([, dataset]) => dataset);
}

function generateStackedBarChartConfig(
    data: PreprocessedData,
    language: string
): ChartConfiguration<"bar"> {
    const labels = createLabels(data, language);
    const datasets = createDatasets(data, labels);

    const config: ChartConfiguration<"bar"> = {
        type: "bar",
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                },
            },
            plugins: {
                legend: {
                    position: "top",
                },
            },
        },
    };

    return config;
}

export async function createNoDataImage(
    text: string,
    width: number,
    height: number
): Promise<Buffer> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Set background color
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text color, font, alignment, and draw text
    ctx.fillStyle = "black";
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Convert canvas to PNG buffer
    const buffer = canvas.toBuffer("image/png");
    return buffer;
}

export async function generateStackedBarChart(
    jsonData: JsonDataItem[],
    language: string
): Promise<Buffer> {
    const data = preprocessData(jsonData, "5minute");
    const config = generateStackedBarChartConfig(data, language);
    const canvasRenderService = new ChartJSNodeCanvas({ width: 800, height: 600 });
    const image = await canvasRenderService.renderToBuffer(config);
    return image;
}
