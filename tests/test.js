"use strict";
exports.__esModule = true;
var node_xml_to_json_1 = require("node-xml-to-json");
var fs = require("fs");
var xmlDir = "C:\\xmltojson\\tests\\user.xml";
fs.readFile(xmlDir, 'utf8', function (err, data) {
    if (err) {
        console.error(err);
        return;
    }
    // @ts-ignore
    console.log(node_xml_to_json_1.toObject(data).unit.test);
    console.log(node_xml_to_json_1.toJSON(data, { beautify: true }));
});
