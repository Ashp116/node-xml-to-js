"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_xml_to_json_1 = require("node-xml-to-json");
const fs = require("fs");
let xmlDir = "C:\\xmltojson\\tests\\user.xml";
fs.readFile(xmlDir, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    // @ts-ignore
    console.log(node_xml_to_json_1.toObject(data));
    console.log(node_xml_to_json_1.toJSON(data, { beautify: true }));
});
