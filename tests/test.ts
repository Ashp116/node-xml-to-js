import * as parser from 'node-xml-to-json';
import {ToJSONOptions, ToObjectOptions} from 'node-xml-to-json';
import * as fs from "fs";
let xmlDir = "C:\\xmltojson\\tests\\user.xml"

fs.readFile(xmlDir, 'utf8' , (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    // @ts-ignore
    console.log(parser.toObject(data))
    console.log(parser.toJSON(data, {beautify: true}))
})