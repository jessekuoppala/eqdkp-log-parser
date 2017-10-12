import React from 'react'
import ReactDOM from 'react-dom'
import ReactFileReader from 'react-file-reader'
import moment from 'moment'
import Immutable from 'immutable'
import js2xmlparser from 'js2xmlparser'
import _ from 'lodash'
import ParseLogs from "../Components/ParseLogs"

export class ParseLogsContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    componentDidMount() {
        this.readTextFile("./dist/dist/data/altchars.txt");
    }

    readTextFile = file => {
		let rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = () => {
			if (rawFile.readyState === 4) {
				if (rawFile.status === 200 || rawFile.status == 0) {
                    let allText = rawFile.responseText;
                    this.parseAltChars(allText);
				}
			}
		};
        rawFile.send(null);
	}

    getInitialState = () => {
        const initialState = {
            altChars: [],
            fileText: "",
            fileName: "",
            date: moment(),
            raidStartTime: moment().format("YYYY-MM-DD HH:mm"),
            raidEndTime: moment().format("YYYY-MM-DD HH:mm"),
            raidlog: this.getRaidLogTemplate(),
            zone: {
                enter: [{
                        "@": {
                            type: "positiveInteger"
                        },
                        "#": 0,
                    }],
                leave: [{
                        "@": {
                            type: "positiveInteger"
                        },
                        "#": 0,
                    }],
                name: [{
                    "@": {
                        type: "string"
                    },
                    "#": "",
                }],
                difficulty: [{
                        "@": {
                            type: "int",
                            minOccurs: "0",
                            maxOccurs: "1"
                        },
                        "#": 1,
                    }],
            },
            zones: [
                {value: "Dreadlands", label: "Dreadlands"},
                {value: "Emerald Jungle", label: "Emerald Jungle"},
                {value: "Karnor's Castle", label: "Karnor's Castle"},
                {value: "Kedge Keep", label: "Kedge Keep"},
                {value: "Nagafen\'s Lair", label: "Nagafen's Lair"},
                {value: "Old Sebilis", label: "Old Sebilis"},
                {value: "Permafrost", label: "Permafrost"},
                {value: "Plane of Fear", label: "Plane of Fear"},
                {value: "Plane of Hate", label: "Plane of Hate"},
                {value: "Plane of Sky", label: "Plane of Sky"},
                {value: "Skyfire Mountains", label: "Skyfire Mountains"},
                {value: "Temple of Veeshan", label: "Temple of Veeshan"},
                {value: "The Hole", label: "The Hole"},
                {value: "Timorous Deep", label: "Timorous Deep"},
                {value: "Veeshan\'s Peak", label: "Veeshan's Peak"}
            ],
            selectedZones: [],
            member: {
                name: "",
                race: "",
                class: "",
                level: "",
                sex: "",
                note: "",
                times: {
                    time: [{
                            "@": {
                                type: "join"
                            },
                            "#": 0,
                        },
                        {
                            "@": {
                                type: "leave"
                            },
                            "#": 0,
                        }]
                }
            },
            parseResult: "",
        }
        return initialState;
    }

    getRaidLogTemplate = () => {
        return ({
            head: {
                export: {
                    name: "EQdkp Plus XML",
                    version: "1.0"
                },
                tracker: {
                    name: "Europa log parser",
                    version: "9-10-2017"
                },
                gameinfo: {
                    game: "Everquest",
                    language: "enUS",
                    charactername: "n.n"
                }
            },
            raiddata: {
                zones: { 
                    zone: {
                        enter: [{
                                "@": {
                                    type: "positiveInteger"
                                },
                                "#": 0,
                            }],
                        leave: [{
                                "@": {
                                    type: "positiveInteger"
                                },
                                "#": 0,
                            }],
                        name: [{
                            "@": {
                                type: "string"
                            },
                            "#": "",
                        }],
                        difficulty: [{
                                "@": {
                                    type: "int",
                                    minOccurs: "0",
                                    maxOccurs: "1"
                                },
                                "#": 1,
                            }],
                    }
                },
                bosskills: {},
                members: { member: {} },
                items: { item: {} }
            }
        });
    }

    handleFile = (files) => {
        const file = files[0];
        const textType = /text.*/;
        let textResult = "";
        const _this = this;

        if (file.type.match(textType)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                textResult = reader.result;
                _this.setState({fileText: textResult, fileName: file.name});
                this.parseLogText();
            }
            reader.readAsText(file, "utf-8");
        } else {
            _this.setState({fileText: "File not supported!", fileName: "error"});
        }
    }

    parseAltChars = (altsText) => {
        let altChars = altsText.split("\n");
        altChars = altChars.map(line => {
            return line.split(/\s/g);
        });
        this.setState({altChars: altChars});
    }

    parseLogText = () => {

        //const regex = new RegExp("(<Europa Agnarr>)|(LOOT:)|(You have entered)", 'i');
        const regex = new RegExp("(<Europa Agnarr>)|(LOOT:)", 'i');
        
        let raidlog = Immutable.fromJS(this.state.raidlog).toJS();

        raidlog.raiddata.zones.zone.enter = moment(this.state.raidStartTime).unix();
        raidlog.raiddata.zones.zone.leave = moment(this.state.raidEndTime).unix();
        
        let dataArray = this.state.fileText.split("\n");
        dataArray = dataArray.filter(line => {return regex.test(line)});

        let attendanceArray = {};
        let zonesArray = [];
        let zoneCount = 0;
        let raidItems = [];
        let charName = "";
        let itemName = "";
        let dkpAmount = "";

        dataArray.map((line, index) => {

            // Time check
            if (moment(line.substring(1, 25)).unix() < moment(this.state.raidStartTime).unix()) return;
            if (moment(line.substring(1, 25)).unix() > moment(this.state.raidEndTime).unix()) return;

            // Zones
            /*if (line.indexOf("You have entered") > 0) {
                let currentZone = this.state.selectedZones.map(zone => {
                    if (!zonesArray.some(row => { console.log(row.name == zone.value); return (row.name == zone.value) })) {
                        if (line.indexOf(zone.value) >= 0) {                    
                            let zoneTemplate = Immutable.fromJS(this.state.zone).toJS();                     
                            zoneTemplate.name = zone.value;
                            zoneTemplate.enter = moment(line.substring(1, 25)).unix();
                            zonesArray.push(zoneTemplate);
                            if (zoneCount > 0) {
                                zonesArray[(zoneCount - 1)].leave = moment(line.substring(1, 25)).unix();
                            }                            
                            zoneCount++;
                        }
                    }
                });
            }*/
            //console.log(zonesArray);

            // Attendance
            if (line.indexOf("] ", 30) > 0) {
                let startOfName = line.indexOf("] ", 30) + 2;
                charName = line.substring(startOfName).split(" ")[0];
                if (charName.indexOf("'") > 0) charName = charName.substring(0, charName.indexOf("'"));
                
                let isAlt = false;

                // Checking if alt or not
                this.state.altChars.map((characters) => {
                    let counter = 0;
                    characters.map((character) => {
                        if (counter == 0) { 
                            counter ++
                            return;
                        }
                        if (charName == character) isAlt = true;
                        counter++;
                    })
                })                
                if (isAlt) return;

                if (attendanceArray[charName] == undefined) 
                    attendanceArray[charName] = {
                        name: charName,
                        times: []
                    };
                attendanceArray[charName].times.push(line.substring(1, 25)); 
            }

            // Loots
            if (line.indexOf("LOOT: ") > 0) {
                
                let time = moment(line.substring(1, 25)).unix();
                let lootStart = line.indexOf("LOOT: ") + 6;
                
                let tempLoot = line.substring(lootStart).split(" ");
                charName = "";
                itemName = "";
                dkpAmount = "";

                dkpAmount = tempLoot[(tempLoot.length - 1)].substring(0, (tempLoot[(tempLoot.length - 1)].length - 2));

                if (tempLoot[(tempLoot.length - 2)] == "(box)") {
                    charName = tempLoot[(tempLoot.length - 3)];
                    tempLoot.splice((tempLoot.length - 3), 3);
                    itemName = tempLoot.join(" ");
                } else {
                    charName = tempLoot[(tempLoot.length - 2)];
                    tempLoot.splice((tempLoot.length - 2), 2);
                    itemName = tempLoot.join(" ");
                }

                let itemRow = {
                    name: itemName,
                    time: time,
                    member: charName,
                    cost: dkpAmount
                }
                raidItems.push(itemRow);
            }
        });

        console.log(attendanceArray);
        
        let members = []

        _.map(attendanceArray, (row) => {
            let member = Immutable.fromJS(this.state.member).toJS();
            member.name = row.name;
            member.times.time[0]['#'] = moment(row.times[0]).unix();
            member.times.time[1]['#'] = moment(row.times[(row['times'].length - 1)]).unix();
            members.push(member);
        });

        raidlog.raiddata.items.item = raidItems;
        raidlog.raiddata.members.member = members; 
        this.setState({raidlog: raidlog}, () => {
            this.setState({parseResult: js2xmlparser.parse("raidlog", this.state.raidlog)});
        });
    }

    handleInputChange = (e) => {
        this.setState({[e.target.id]: e.target.value});
    }

    onZonesChange = (val) => {
        let raidlog = Immutable.fromJS(this.state.raidlog).toJS();
        raidlog.raiddata.zones.zone.name[0]["#"] = val;
        this.setState({selectedZones: val, raidlog: raidlog});
    }

    resetData = () => {
        this.setState({
            fileName: "",
            fileText: "",
            parseResult: "",
            raidlog: this.getRaidLogTemplate()
        })
    }

    render() {
        return (
            <ParseLogs props={this.props}
                       state={this.state}
                       onZonesChange={this.onZonesChange}
                       handleFile={this.handleFile}
                       handleInputChange={this.handleInputChange}
                       resetData={this.resetData}
                       />
        )
    }
}

export default ParseLogsContainer;