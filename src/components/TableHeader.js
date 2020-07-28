import React from 'react';
import styles from './TableHeader.module.css';

class TableHeader extends React.Component {


    componentDidMount() {
        window.addEventListener("mouseup", this._onMouseUpHandler);
    }

    _onMouseDownResizeSectionHandler = (evt, columnIndex) => {
        window.addEventListener("mousemove", this.resizeFunction = (evt) => this._onResizeHandler(evt, columnIndex));
    }

    _onResizeHandler = (evt, columnIndex) => {
        const { boundingCanvas } = this.props;
        const tableColumns = [...this.props.tableColumns];

        console.log(tableColumns === this.props.tableColumns)
        
        if (evt.clientX % 2 === 0) {
            const widthResized  = evt.clientX - boundingCanvas.left;
            tableColumns[columnIndex].width = widthResized;
            if (typeof this.props.onResizeHandler === 'function') {
                this.props.onResizeHandler(tableColumns);
            }
        }
    }

    _onMouseUpHandler = () => {
        window.removeEventListener("mousemove", this.resizeFunction);
    }

    renderStickyHeader = () => {
        const { tableColumns, className } = this.props;
        let tableHeaderClasses = [styles.tableHeader];
        if (className) {
            tableHeaderClasses.push(className);
        }


        if (Array.isArray(tableColumns) && tableColumns.length) {
            const tableColumnsLength = tableColumns.length;
            let header = [];
            for (let i = 0; i < tableColumnsLength; i++) {
                let headerClasses = [styles.header];
                if (tableColumns[i].className) {
                    headerClasses.push(tableColumns[i].className);
                }

                const headerStyles = {
                    width: tableColumns[i].width ? tableColumns[i].width : "unset",
                    minWidth: tableColumns[i].minWidth ? tableColumns[i].minWidth : "unset",
                    maxWidth: tableColumns[i].maxWidth ? tableColumns[i].maxWidth : "unset",
                }

                header.push(
                    <div className={headerClasses.join(' ')} style={headerStyles}>
                        {tableColumns[i].lable}
                        <span 
                            className={styles.resizeSection}
                            onMouseDown={(evt) => this._onMouseDownResizeSectionHandler(evt, i)}
                        />
                    </div>
                )
            }

            return (
                <div className={tableHeaderClasses.join(' ')}>
                    {header}
                </div>
            )
        }

        return null;
    }


    render() {
        return (
            <React.Fragment>
                {this.renderStickyHeader()}
            </React.Fragment>
        )
    }
}

export default TableHeader;