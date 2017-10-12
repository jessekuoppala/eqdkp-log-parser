import React from 'react'
import ReactDOM from 'react-dom'
import {Grid, Row, Col, Button, FormGroup, ControlLabel, FormControl, Alert} from 'react-bootstrap'
import ReactFileReader from 'react-file-reader'
import Select from 'react-select'

export class ParseLogs extends React.Component {
    constructor(props) {
        super(props);
    }

    onZonesChange = (val) => {
        this.props.onZonesChange(val);
    }

    handleFile = (files) => {
        this.props.handleFile(files);
    }

    handleInputChange = (e) => {
        this.props.handleInputChange(e);
    }

    resetData = () => {
        this.props.resetData();
    }

    render() {
        return (
            <div className="upload-container">
            <Grid>
                <Row>
                    <Col xs={12} sm={8} smOffset={2}>
                        <FormGroup>
                            <ControlLabel>First raid zone:</ControlLabel>
                            <Select name="zones" 
                                    value={this.props.state.raidlog.raiddata.zones.zone.name[0]["#"]}
                                    multi={false}
                                    options={this.props.state.zones}
                                    placeHolder="Select raid starting zone"
                                    simpleValue
                                    onChange={this.onZonesChange}
                                    />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Official raid start time:</ControlLabel>
                            <FormControl type="text" id="raidStartTime" onChange={this.handleInputChange} value={this.props.state.raidStartTime} />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Official raid end time:</ControlLabel>
                            <FormControl type="text" id="raidEndTime" onChange={this.handleInputChange} value={this.props.state.raidEndTime} />
                        </FormGroup>
                        {this.props.state.fileName.length == 0 &&
                        <ReactFileReader handleFiles={this.handleFile} fileTypes={'.txt'}>
                            <div>
                                <FormGroup>
                                    <ControlLabel>Select file for parse:</ControlLabel> 
                                    <Button style={{marginLeft: "10px"}}>Choose file</Button>
                                </FormGroup>
                            </div>
                        </ReactFileReader>
                        }
                        {this.props.state.fileName.length > 0 && this.props.state.fileName !== "error" &&
                            <Alert bsStyle="success"><strong>Parsed file: </strong>{this.props.state.fileName}</Alert>
                        }
                        {this.props.state.fileName == "error" &&
                            <Alert bsStyle="danger">Filetype not supported or something.</Alert>
                        }
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} sm={8} smOffset={2}>
                        {this.props.state.parseResult.length > 0 &&
                            <FormGroup>
                                <FormControl componentClass="textarea" style={{height: "300px"}} defaultValue={this.props.state.parseResult} />
                            </FormGroup>
                        }
                        {this.props.state.fileName.length > 0 &&
                        <FormGroup>
                            <Button bsStyle="warning" onClick={this.resetData}>Reset</Button>
                        </FormGroup>
                        }
                    </Col>
                </Row>
            </Grid>                
        </div>
        )
    }
}

export default ParseLogs;