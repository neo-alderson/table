import React from 'react';
import styles from './TableCanvas.module.css';
import { drawRow, drawRowReverse } from './utils/TableUtils';
import { COLOR_STRIPED, COLOR_BASIC, COLOR_HOVER, COLOR_CLICK, DEFAULT_PADDING } from './consts/TableCanvasConsts';

export default class TableCanvas extends React.Component {
    PIXEL_RATIO = 0;

    constructor(props) {
        super(props);

        this.containerRef = React.createRef();
        this.canvas = React.createRef();
        this.containerHiddenDataRef = React.createRef();
        this.surfaceDataRef = React.createRef();
        this.surfaceContainerRef = React.createRef();

        this.boundingCanvas = null;
        // hover
        this.prevRowHovered = null;
        // click
        this.prevRowClicked = null;
    }

    componentDidMount() {
        if (this.canvas instanceof HTMLElement) {
            const ctx = this.canvas.getContext('2d');
            this.PIXEL_RATIO = this.getPixelRatio();

            this.initVerticalScrollbar();
            this.initSurfaceContainer();
            this.initTableCanvas();

            this.renderCurrentDataTableCanvas();
            ctx.stroke();
        }

        this.boundingCanvas = this.getBoundingCanvasRef();
    }

    componentDidUpdate(prevProps) {
        if (this.props.dataProvider !== prevProps.dataProvider) {
            this.initVerticalScrollbar();
            this.initSurfaceContainer();
            this.renderCurrentDataTableCanvas();
        }
    }


    // =================== INITS ===================== //
    /**
         * init vertical scroll bar
         * set height for containerHiddenDataRef  */
    initVerticalScrollbar = () => {
        const { dataProvider, rowHeight } = this.props;
        if (Array.isArray(dataProvider) && dataProvider.length) {
            const tableHeight = dataProvider.length * rowHeight;
            if (this.containerHiddenDataRef instanceof HTMLElement) {
                this.containerHiddenDataRef.style.height = tableHeight + "px";
            }
        }
    }

    initSurfaceContainer = () => {
        if (this.surfaceDataRef instanceof HTMLElement && this.containerHiddenDataRef instanceof HTMLElement && this.canvas instanceof HTMLElement) {
            this.surfaceDataRef.style.height = this.containerHiddenDataRef.offsetHeight + "px";
            this.surfaceDataRef.style.width = this.canvas.offsetWidth + "px";
        }
    }

    /** 
     * init table canvas
     * create dpi to display rows
    */
    initTableCanvas = () => {
        const { tableColumns } = this.props;

        if (this.canvas instanceof HTMLElement) {
            this.PIXEL_RATIO = this.getPixelRatio();
        }

        let tableWidth = 0;
        for (let i = 0; i < tableColumns.length; i++) {
            tableWidth = tableWidth + tableColumns[i].width;
        }

        if (this.containerRef instanceof HTMLElement) {
            const tableHeight = this.containerRef.clientHeight;

            this.createHiDPICanvas(tableWidth, tableHeight);
        }
    }

    // =================== RENDERS ===================== //

    renderCurrentDataTableCanvas = (isReverse) => {
        const currentRowOnTop = this.getCurrentRowOnTop();
        const currentRowAtBottom = this.getCurrentRowAtBottom();

        this.renderTableWithStartEndIndex(currentRowOnTop, currentRowAtBottom, isReverse);
    }


    /**
     * render table with data
     * @param (number) startIndex 
     * @param (number) endIndex 
     * */
    renderTableWithStartEndIndex = (startIndex, endIndex, isReverse = false) => {
        const { tableColumns, rowHeight, colorClick } = this.props;
        const dataProvider = [...this.props.dataProvider];

        if (Array.isArray(dataProvider) && dataProvider.length) {
            const dataPartition = dataProvider.slice(startIndex, endIndex + 1);

            const endLength = endIndex - startIndex + 1;

            if (isReverse) {
                const widthMissing = this.getWidthMissingOfRowEnd();
                for (let i = endLength - 1; i >= 0; i--) {
                    let backgroundColor = this.getBackgroundColorRow(i + startIndex);
                    if ((i + startIndex) === this.prevRowClicked) {
                        backgroundColor = colorClick ? colorClick : COLOR_CLICK;
                    }

                    drawRowReverse(this.canvas, i, backgroundColor, dataPartition, tableColumns, widthMissing, rowHeight);
                }
            } else {
                for (let i = 0; i < endLength; i++) {
                    let backgroundColor = this.getBackgroundColorRow(i + startIndex);
                    if ((i + startIndex) === this.prevRowClicked) {
                        backgroundColor = colorClick ? colorClick : COLOR_CLICK;
                    }

                    drawRow(this.canvas, i, backgroundColor, dataPartition, tableColumns, rowHeight);
                }
            }
        }
    }

    // =================== UTILS ===================== //

    getBackgroundColorRow = (rowIndex) => {
        const { colorStriped, colorBasic, stripedRow } = this.props;
        let color = COLOR_BASIC;
        let colorDefault = COLOR_BASIC;

        if (stripedRow) {
            color = COLOR_STRIPED;

            if (colorStriped) {
                color = colorStriped;
            }
            if (colorBasic) {
                colorDefault = colorBasic;
            }
        }

        return rowIndex % 2 === 0 ? color : colorDefault;
    }

    getCurrentRowOnTop = () => {
        const { rowHeight } = this.props;
        if (this.surfaceContainerRef instanceof HTMLElement) {
            const containerScrollTop = this.surfaceContainerRef.scrollTop;

            const currentRowOnTop = Math.floor(containerScrollTop / rowHeight);
            return currentRowOnTop;
        }

        return 0;
    }

    getCurrentRowAtBottom = () => {
        const { dataProvider, rowHeight } = this.props;
        if (this.surfaceContainerRef instanceof HTMLElement) {
            const surfaceContainerScrollTop = this.surfaceContainerRef.scrollTop;
            const surfaceContainerHeight = this.surfaceContainerRef.offsetHeight;

            const currentRowAtBottom = Math.floor((surfaceContainerScrollTop + surfaceContainerHeight) / rowHeight);
            if (currentRowAtBottom >= dataProvider.length) {
                return (dataProvider.length - 1);
            }

            return currentRowAtBottom;
        }

        return 0;
    }

    isScrolledToTheBottom = () => {
        if (this.surfaceContainerRef instanceof HTMLElement) {
            const scrollTop = this.surfaceContainerRef.scrollTop;
            const clientHeight = this.surfaceContainerRef.clientHeight;
            const scrollHeight = this.surfaceContainerRef.scrollHeight;

            return scrollTop + clientHeight === scrollHeight;
        }

        return false;
    }

    getWidthMissingOfRowEnd = () => {
        const { rowHeight } = this.props;
        if (this.surfaceContainerRef instanceof HTMLElement) {
            const currentRowOnTop = this.getCurrentRowOnTop();
            const currentRowAtBottom = this.getCurrentRowAtBottom();
            const clientHeight = this.surfaceContainerRef.clientHeight;

            const widthMissing = (currentRowAtBottom - currentRowOnTop + 1) * rowHeight - clientHeight;

            return widthMissing;
        }

        return 0;
    }

    /**
     * 
     */
    getPixelRatio = () => {
        const ctx = this.canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1
        const bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;

        return dpr / bsr;
    }

    /**
     * @param (number) width
     * @param (number) height
     * @param (number) ratio
     */
    createHiDPICanvas = (width, height, ratio) => {
        if (!ratio) {
            ratio = this.PIXEL_RATIO;
        }

        this.canvas.width = width * ratio;
        this.canvas.height = height * ratio;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    getBoundingCanvasRef = () => {
        if (this.canvas instanceof HTMLElement) {
            const bounding = this.canvas.getBoundingClientRect();
            return bounding;
        }
    }

    getRowMouseOver = (mouseYPos) => {
        const { dataProvider, rowHeight } = this.props;
        if (this.surfaceContainerRef instanceof HTMLElement) {
            const currentRowOnTop = this.getCurrentRowOnTop();
            const rowMouseOver = Math.floor(mouseYPos / rowHeight) + currentRowOnTop;

            const dataProviderLength = dataProvider.length;
            if (rowMouseOver > dataProviderLength - 1) {
                return dataProviderLength - 1;
            }

            return rowMouseOver;
        }

        return 0;
    }

    getColumnMouseOver = (mouseXPos) => {
        const { tableColumns } = this.props;
        if (Array.isArray(tableColumns) && tableColumns.length) {
            const tableColumnsLength = tableColumns.length;
            let startXPosOfEachColumns = 0;
            let endXPosOfEachColumns = tableColumns[0].width;
            if (mouseXPos <= endXPosOfEachColumns) {
                return 0;
            }

            for (let i = 1; i < tableColumnsLength; i++) {
                startXPosOfEachColumns = startXPosOfEachColumns + tableColumns[i - 1].width;

                endXPosOfEachColumns = startXPosOfEachColumns + tableColumns[i].width;
                if (mouseXPos <= endXPosOfEachColumns) {
                    return i;
                }
            }
        }
    }

    getBoundingOfText = (text) => {
        let context = this.canvas.getContext('2d');
        const textMetrics = context.measureText(text);
        const height = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
        const width = textMetrics.actualBoundingBoxRight + textMetrics.actualBoundingBoxLeft;

        return { height, width };
    }



    // =================== EVENTS ===================== //
    /**
         * onScroll handler
         */
    _onScrollTableCanvas = () => {
        // update scroll left container the same scroll left surface
        if (this.surfaceContainerRef instanceof HTMLElement && this.containerRef instanceof HTMLElement) {
            const scrollLeft = this.surfaceContainerRef.scrollLeft;
            this.containerRef.scrollLeft = scrollLeft;
        }

        let isReverse = false;
        if (this.isScrolledToTheBottom()) {
            isReverse = true;
        }

        this.renderCurrentDataTableCanvas(isReverse);
    }

    // hover row
    _onMouseMove = (evt) => {
        this._hoverRowEffect(evt);
    }

    _onMouseLeave = (evt) => {
        this._leaveRowEffect(evt);
    }

    _onMouseDown = (evt) => {
        this._clickRowEffect(evt);
        this._onClickTextEachColumn(evt)
    }

    _hoverRowEffect = (evt) => {
        const { rowHeight, tableColumns, dataProvider, colorHover } = this.props;
        const mouseYPos = evt.clientY - this.boundingCanvas.top;

        const currentRowOver = this.getRowMouseOver(mouseYPos);
        const currentRowOnTop = this.getCurrentRowOnTop();
        const currentRowAtBottom = this.getCurrentRowAtBottom();
        const dataPartition = dataProvider.slice(currentRowOnTop, currentRowAtBottom + 1);

        let backgroundColor = COLOR_HOVER;
        if (colorHover) {
            backgroundColor = colorHover;
        }

        if (this.prevRowHovered !== null && this.prevRowHovered !== currentRowOver
            && this.prevRowHovered !== this.prevRowClicked
            && this.prevRowHovered >= currentRowOnTop && this.prevRowHovered <= currentRowAtBottom) {
            const backgroundColor = this.getBackgroundColorRow(this.prevRowHovered);
            drawRow(this.canvas, (this.prevRowHovered - currentRowOnTop), backgroundColor, dataPartition, tableColumns, rowHeight);
        }

        drawRow(this.canvas, (currentRowOver - currentRowOnTop), backgroundColor, dataPartition, tableColumns, rowHeight);

        this.prevRowHovered = currentRowOver;
    }

    _leaveRowEffect = (evt) => {
        const { rowHeight, tableColumns, dataProvider } = this.props;

        const currentRowOnTop = this.getCurrentRowOnTop();
        const currentRowAtBottom = this.getCurrentRowAtBottom();
        const dataPartition = dataProvider.slice(currentRowOnTop, currentRowAtBottom + 1);

        if (this.prevRowHovered !== null && this.prevRowHovered !== this.prevRowClicked
            && this.prevRowHovered >= currentRowOnTop && this.prevRowHovered <= currentRowAtBottom) {
            const backgroundColor = this.getBackgroundColorRow(this.prevRowHovered);
            drawRow(this.canvas, (this.prevRowHovered - currentRowOnTop), backgroundColor, dataPartition, tableColumns, rowHeight);
        }

        this.prevRowHovered = null;
    }

    _clickRowEffect = (evt) => {
        const { rowHeight, tableColumns, dataProvider, colorHover } = this.props;
        const mouseYPos = evt.clientY - this.boundingCanvas.top;

        const currentRowOver = this.getRowMouseOver(mouseYPos);
        const currentRowOnTop = this.getCurrentRowOnTop();
        const currentRowAtBottom = this.getCurrentRowAtBottom();
        const dataPartition = dataProvider.slice(currentRowOnTop, currentRowAtBottom + 1);

        let backgroundColor = COLOR_HOVER;
        if (colorHover) {
            backgroundColor = colorHover;
        }

        if (this.prevRowClicked !== null && this.prevRowClicked !== currentRowOver
            && this.prevRowClicked >= currentRowOnTop && this.prevRowClicked <= currentRowAtBottom) {
            const backgroundColor = this.getBackgroundColorRow(this.prevRowClicked);
            drawRow(this.canvas, (this.prevRowClicked - currentRowOnTop), backgroundColor, dataPartition, tableColumns, rowHeight);
        }

        drawRow(this.canvas, (currentRowOver - currentRowOnTop), backgroundColor, dataPartition, tableColumns, rowHeight);

        this.prevRowClicked = currentRowOver;
    }

    //click text each columns handler
    _onClickTextEachColumn = (evt) => {
        const { tableColumns, dataProvider, rowHeight } = this.props;

        const mouseXPos = evt.clientX - this.boundingCanvas.left;
        const mouseYPos = evt.clientY - this.boundingCanvas.top;

        const currentRowOnTop = this.getCurrentRowOnTop();

        const rowClicked = this.getRowMouseOver(mouseYPos);
        const columnClicked = this.getColumnMouseOver(mouseXPos);

        const target = tableColumns[columnClicked].target;

        const valueOfCell = dataProvider[rowClicked][target];

        const valueBounding = this.getBoundingOfText(valueOfCell);

        const topBoundingValue = (rowClicked - currentRowOnTop) * rowHeight + (rowHeight - valueBounding.height) / 2;
        const bottomBoundingValue = (rowClicked - currentRowOnTop + 1) * rowHeight - (rowHeight - valueBounding.height) / 2;

        let startXPosOfEachColumns = 0;
        for (let i = 0; i <= columnClicked; i++) {
            if (i !== 0) {
                startXPosOfEachColumns = startXPosOfEachColumns + tableColumns[i - 1].width;
            }
        }

        // TODO: change padding to props and then add it to code
        if (mouseYPos >= topBoundingValue && mouseYPos <= bottomBoundingValue &&
            mouseXPos > startXPosOfEachColumns + DEFAULT_PADDING && mouseXPos <= startXPosOfEachColumns + valueBounding.width + DEFAULT_PADDING) {
                if (tableColumns[columnClicked].onClick && typeof tableColumns[columnClicked].onClick === 'function') {
                    tableColumns[columnClicked].onClick();
                }
        }
    }

    render() {
        const { containerClassName } = this.props;
        let containerClasses = [styles.section];
        let tableClasses = [styles.tableCanvas];
        let surfaceClasses = [styles.sectionSurface, styles.section];

        if (containerClassName) {
            containerClasses.push(containerClassName);
            surfaceClasses.push(containerClassName);
        }


        return (
            <div className={styles.root}>
                <div ref={r => this.containerRef = r} className={containerClasses.join(' ')} >
                    <canvas
                        ref={r => this.canvas = r}
                        className={tableClasses.join(' ')}
                    />
                    <div ref={r => this.containerHiddenDataRef = r} />
                </div>
                <div ref={r => this.surfaceContainerRef = r} className={surfaceClasses.join(' ')} onScroll={this._onScrollTableCanvas}>
                    <div ref={r => this.surfaceDataRef = r}
                        onMouseMove={this._onMouseMove}
                        onMouseLeave={this._onMouseLeave}
                        onMouseDown={this._onMouseDown}
                    />
                </div>
            </div>
        )
    }
}
