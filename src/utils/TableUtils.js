const { DEFAULT_PADDING, ROW_HEIGHT } = require("../consts/TableCanvasConsts");

/*  */
const drawCell = (canvas, x, y, width, height, text, backgroundColor, fontColor, font) => {
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = "source-over";

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(x, y, width, height);

    ctx.globalCompositeOperation = "source-atop";

    ctx.fillStyle = fontColor;
    ctx.font = font;
    ctx.textBaseline = "middle";
    ctx.fillText(`${text}`, x + DEFAULT_PADDING, y + height / 2);
}

/*  */
export const drawRow = (canvas, rowIndex, backgroundColor, dataProvider, tableColumns, rowHeight) => {
    let x = 0;
    const tableColumnsLength = tableColumns.length;
    for (let i = 0; i < tableColumnsLength; i++) {
        if (i !== 0) {
            x = x + tableColumns[i - 1].width;
        }

        // TODO: change font color and font
        const fontColor = "black";
        const font = "14px sans-serif";
        drawCell(canvas, x, rowIndex * rowHeight, tableColumns[i].width, rowHeight, dataProvider[rowIndex][tableColumns[i].target], backgroundColor, fontColor, font);
    }
}

export const drawRowReverse = (canvas, rowIndex, backgroundColor, dataProvider, tableColumns, widthMissing, rowHeight) => {
    let x = 0;
    const tableColumnsLength = tableColumns.length;
    for (let i = 0; i < tableColumnsLength; i++) {
        if (i !== 0) {
            x = x + tableColumns[i - 1].width;
        }

        // TODO: change font color and font
        const fontColor = "black";
        const font = "14px sans-serif";
        drawCell(canvas, x, (rowIndex * rowHeight - widthMissing), tableColumns[i].width, rowHeight, dataProvider[rowIndex][tableColumns[i].target], backgroundColor, fontColor, font, rowHeight);
    }
}
