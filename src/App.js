import React, { Component } from 'react'
import TableCanvas from './TableCanvas'

export default class App extends Component {
    

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            tableColumns: [
                { lable: "ID", width: 100, target: 'id', onClick: () => { }, className: "p-4px"},
                { lable: "NAME", width: 500, target: 'name', onClick: () => { } },
                { lable: "PHONE", width: 200, target: 'phone' },
            ]
        }
    }

    genratorData = () => {
        let data = [];
        for (let i = 0; i <= 10000; i++) {
            data.push({
                "id": i,
                "name": "arcu.Morbi@ipsum.ca",
                "phone": "09 96 07 84 25"
            })
        }

        this.setState({ data });
    }

    componentDidMount() {
        this.genratorData();
    }

    render() {
        const { data } = this.state;
        return (
            <div>
                <TableCanvas
                    dataProvider={data}
                    tableColumns={this.state.tableColumns}
                    rowHeight={30}
                    stripedRow={true}
                    colorHover="#99ccff"
                />
            </div>
        )
    }
}
