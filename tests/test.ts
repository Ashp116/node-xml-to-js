import {toObject, toJSON} from 'node-xml-to-json';
import * as fs from "fs";
let xmlDir = "C:\\xmltojson\\tests\\user.xml"

fs.readFile(xmlDir, 'utf8' , (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    // @ts-ignore
    console.log(toObject(data))
    console.log(toJSON(data, {beautify: true}))
})