import React from 'react'
import ReactDOM from 'react-dom'
import ParseLogsContainer from './Containers/ParseLogsContainer'
import {Grid, Row, Col} from 'react-bootstrap'

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentStatus: "start",
        }
    }

    render() {
        return (
            <div>
                <Grid>
                    <Row>
                        <Col xs={12} sm={8} smOffset={2}>
                            <h1>DKP Log Parser</h1>
                        </Col>
                    </Row>
                </Grid>
                <ParseLogsContainer />
            </div>
        )
    }
}

const app = document.getElementById('app')
ReactDOM.render(<Main />, app)