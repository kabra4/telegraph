import { createCanvas } from "canvas";
import {
    Chart,
    ChartConfiguration,
    BarElement,
    BarController,
    CategoryScale,
    LinearScale,
    ChartDataset,
} from "chart.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
// import CanvasRenderService from "chartjs-node-canvas";
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

function preprocessJsonData(jsonData: JsonDataItem[]): PreprocessedData {
    return jsonData.reduce<PreprocessedData>((acc, item) => {
        if (!acc[item.datetime]) {
            acc[item.datetime] = {};
        }
        if (!acc[item.datetime][item.value]) {
            acc[item.datetime][item.value] = 0;
        }
        acc[item.datetime][item.value] += 1;
        return acc;
    }, {});
}

function randomColor(): string {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 75) + 25; // ensure saturation is at least 25%
    const l = Math.floor(Math.random() * 40) + 55; // ensure lightness is at least 55%

    // Convert HSL color to RGBA color
    const r = ((l + (s * Math.min(l, 100 - l)) / 100) * 255) / 100;
    const g =
        ((l - (s * Math.abs(((h / 60) % 2) - 1) * Math.min(l, 100 - l)) / 100) * 255) /
        100;
    const b = ((l - (s * Math.max(l, 100 - l)) / 100) * 255) / 100;

    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 1)`;
}

function generateStackedBarChartConfig(
    data: PreprocessedData
): ChartConfiguration<"bar"> {
    const labels = Object.keys(data);

    type DatasetAccumulator = {
        [value: string]: ChartDataset<"bar"> & { data: number[] };
    };

    const datasets = Object.entries(
        labels.reduce<DatasetAccumulator>((acc, label) => {
            Object.entries(data[label]).forEach(([value, count]) => {
                if (!acc[value]) {
                    acc[value] = {
                        label: value,
                        data: [],
                        backgroundColor: randomColor(),
                    };
                }
                acc[value].data.push(count);
            });
            return acc;
        }, {})
    ).map(([, dataset]) => dataset);

    const config: ChartConfiguration<"bar"> = {
        type: "bar",
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            scales: {
                x: {
                    type: "category",
                },
                y: {
                    type: "linear",
                    beginAtZero: true,
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

export async function generateStackedBarChart(jsonData: JsonDataItem[]): Promise<Buffer> {
    const data = preprocessJsonData(jsonData);
    const config = generateStackedBarChartConfig(data);
    // const canvas = createCanvas(800, 600);
    // const ctx = canvas.getContext("2d");
    // const chart = new Chart(ctx, config);
    // const image = chart.toBase64Image();
    // return image;
    const canvasRenderService = new ChartJSNodeCanvas({ width: 800, height: 600 });
    const image = await canvasRenderService.renderToBuffer(config);
    return image;
}
