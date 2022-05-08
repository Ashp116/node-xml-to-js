"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJSON = exports.toObject = void 0;
const parseBoolean = require("parse-string-boolean");
/** XML Utils **/
class XMLUtils {
    ignoreElements(arr, start, end) {
        return arr.splice(start, end);
    }
    ignoreElement(element) {
        if (element.includes('?xml') || element.includes('/')) {
            return true;
        }
        else {
            return false;
        }
    }
    convertTypesAuto(data) {
        //console.log(data)
        if ((new Date(data)).getTime() > 0) {
            return data;
        }
        else if (!isNaN(parseFloat(data))) {
            return parseFloat(data);
        }
        else if (parseBoolean(data) !== null) {
            return parseBoolean(data);
        }
        else {
            return data;
        }
    }
    elementFromString(str) {
        if (str !== undefined) {
            let parsedStr = str.replace(">", " ").replace("/", " ").split(" ");
            if (parsedStr[0] !== "") {
                return parsedStr[0];
            }
            else {
                return parsedStr[1];
            }
        }
    }
    valueFromElement(str) {
        if (str !== undefined) {
            let parsedStr = str.replace(">", " ").replace("/", " ").split(" ");
            parsedStr.shift();
            if (parsedStr[0] !== "") {
                // @ts-ignore
                if (this.onAttribute(str) !== false && this.onAttribute(str) !== undefined) {
                    // @ts-ignore
                    let { attributes, raw } = this.onAttribute(str);
                    let send = attributes;
                    send["value"] = this.convertTypesAuto(parsedStr.join(" ").replace(raw, "").trim());
                    return send;
                }
                else {
                    return this.convertTypesAuto(parsedStr.join(" "));
                }
            }
        }
    }
    findDuplicates(arr) {
        let sorted_arr = arr.slice().sort(); // You can define the comparing function here.
        // JS by default uses a crappy string compare.
        // (we use slice to clone the array so the
        // original array won't be modified)
        let results = [];
        for (let i = 0; i < sorted_arr.length - 1; i++) {
            if (sorted_arr[i + 1] == sorted_arr[i]) {
                results.push(sorted_arr[i]);
            }
        }
        return results;
    }
    onAttribute(element) {
        let send = {};
        let rawAttributes = "";
        element.split(" ").forEach((val) => {
            if (val.includes("=")) {
                const index = val.split("=")[0];
                const value = val.split("=")[1].split(`"`)[1] || val.split("=")[1].split(`'`)[1] || val.split("=")[1].split("`")[1];
                send[index] = value;
                if (val.includes("'")) {
                    rawAttributes = rawAttributes + `${index}='${value}'`;
                }
                else if (val.includes(`"`)) {
                    rawAttributes = rawAttributes + `${index}="${value}"`;
                }
                else if (val.includes("`")) {
                    rawAttributes = rawAttributes + index + "=`" + value + "`";
                }
            }
        });
        if (send) {
            if (Object.keys(send).length !== 0) {
                return { attributes: send, raw: rawAttributes };
            }
        }
        else {
            return false;
        }
    }
    onDeclaration(rawStr) {
        let str = rawStr.replace("<?", "").replace("?>", "");
        if (this.onAttribute(str) !== false && this.onAttribute(str) !== undefined) {
            // @ts-ignore
            return this.onAttribute(str);
        }
        else {
            return rawStr;
        }
    }
    format() {
    }
    nestedChild(arr, ignoreParent) {
        let send = {};
        let parent = "";
        if (arr.indexOf(`/${this.elementFromString(arr[0])}>`) === arr.length - 1) {
            parent = this.elementFromString(arr[0]);
            send[parent] = {};
        }
        else if (!ignoreParent) {
            parent = this.elementFromString(arr[0]);
            send[parent] = {};
        }
        if (arr[0] === "extra>") {
        }
        arr.splice(0, 1);
        arr.splice(arr.length, 1);
        arr.forEach((value, index) => {
            if (!this.ignoreElement(value)) {
                let end = arr.indexOf(`/${this.elementFromString(value)}>`);
                if (parent !== "") {
                    if ((end - index) === 1) {
                        let childElement = this.elementFromString(value);
                        send[parent][childElement] = this.valueFromElement(value);
                    }
                    else {
                        if (!value.includes("/")) {
                            let spliced = arr.splice(index, arr.indexOf("/" + value) - index);
                            let val = this.nestedChild(spliced);
                            if (send[parent] !== undefined) {
                                send[parent][Object.keys(val)[0]] = {};
                                send[parent][Object.keys(val)[0]] = val[Object.keys(val)[0]];
                            }
                            else {
                                send[Object.keys(val)[0]] = {};
                                send[Object.keys(val)[0]] = val[Object.keys(val)[0]];
                            }
                        }
                    }
                }
                else {
                    if ((end - index) === 1) {
                        let childElement = this.elementFromString(value);
                        send[childElement] = this.valueFromElement(value);
                        //console.table(send)
                    }
                    else {
                        if (!value.includes("/")) {
                            //console.table(arr)
                            let spliced = arr.splice(index, arr.indexOf("/" + value) - index);
                            let val = this.nestedChild(spliced);
                            if (send[parent] !== undefined) {
                                send[parent][Object.keys(val)[0]] = {};
                                send[parent][Object.keys(val)[0]] = val[Object.keys(val)[0]];
                            }
                            else {
                                send[Object.keys(val)[0]] = {};
                                send[Object.keys(val)[0]] = val[Object.keys(val)[0]];
                            }
                        }
                    }
                }
            }
        });
        return send;
    }
    trimXML(data, removeDeclaration) {
        /*Default Values*/
        removeDeclaration = removeDeclaration || false;
        let newXML = "";
        let declaration = "";
        data.split('\n').forEach(((value, index) => {
            newXML = newXML + value.trim().replace("\r", "");
        }));
        if (removeDeclaration) {
            let start = newXML.lastIndexOf("<?");
            let end = newXML.lastIndexOf("?>") + 2;
            declaration = newXML.slice(start, end);
            newXML = newXML.replace(declaration, "");
        }
        // @ts-ignore
        return { XML: newXML, Declaration: declaration };
    }
}
function parser(XMLString, isRoot) {
    const utils = new XMLUtils();
    let { XML, Declaration } = utils.trimXML(XMLString, true);
    let arrXML = XML.split("<");
    let obj = {};
    arrXML.shift();
    arrXML.forEach((value, index) => {
        arrXML[index] = "<" + value;
    });
    if (XML.split("<")[1] === undefined)
        return;
    let rootEle = XML.split("<")[1].split(" ")[0].split(">")[0];
    let val = arrXML.filter(value => value === `</${rootEle}>`);
    arrXML.forEach((value, index) => {
        if (value.split(">")[0].split(" ")[0] === (`<${rootEle}`) || value === `</${rootEle}>`)
            delete arrXML[index];
    });
    arrXML = arrXML.filter((a) => a);
    if (isRoot) {
        if (Declaration !== undefined) { // @ts-ignore
            obj["Declaration"] = utils.onDeclaration(Declaration).attributes;
        }
        obj[rootEle] = {};
        obj[rootEle] = utils.onAttribute(XML.split("<")[1]);
    }
    if (val.length !== 0) {
        arrXML.forEach(value => {
            let send = "";
            if (value === undefined)
                return;
            //console.log(value)
            let attri = utils.onAttribute(value);
            let ele = value.split("<")[1].split(" ")[0].split(">")[0].replace("/", "");
            //console.log(XML.match(new RegExp(`(<${ele})(.*)(<\/${ele}>)`))[0])
            if (value.split(">")[0].split(" ")[0] === (`<${ele}`)) {
                var start = arrXML.indexOf(value);
                let end = arrXML.indexOf(`</${ele}>`);
                if (end - start > 1) {
                    send = arrXML.join("").match(new RegExp(`(<${ele})(.*)(<\/${ele}>)`))[0];
                    if (isRoot) {
                        obj[rootEle][ele] = parser(send, false);
                        if (utils.onAttribute(value) !== undefined) { // @ts-ignore
                            obj[rootEle][ele]["attributes"] = utils.onAttribute(XML.split("<")[1]).attributes;
                        }
                        arrXML.slice(start, end).forEach(reVal => {
                            delete arrXML[arrXML.lastIndexOf(reVal)];
                        });
                    }
                    else {
                        obj[ele] = parser(send, false);
                        if (utils.onAttribute(value) !== undefined) { // @ts-ignore
                            obj[rootEle][ele]["attributes"] = utils.onAttribute(XML.split("<")[1]).attributes;
                        }
                        arrXML.slice(start, end).forEach(reVal => {
                            delete arrXML[arrXML.lastIndexOf(reVal)];
                        });
                    }
                }
                else {
                    if (isRoot) {
                        obj[rootEle][ele] = utils.convertTypesAuto(value.match(new RegExp(`(>)(.*)`))[0].replace(">", ""));
                        if (utils.onAttribute(value) !== undefined) { // @ts-ignore
                            obj[rootEle][ele]["attributes"] = utils.onAttribute(XML.split("<")[1]).attributes;
                        }
                        arrXML.slice(start, end).forEach(reVal => {
                            delete arrXML[arrXML.indexOf(reVal)];
                        });
                    }
                    else {
                        obj[ele] = utils.convertTypesAuto(value.match(new RegExp(`(>)(.*)`))[0].replace(">", ""));
                        if (utils.onAttribute(value) !== undefined) { // @ts-ignore
                            obj[rootEle][ele]["attributes"] = utils.onAttribute(XML.split("<")[1]).attributes;
                        }
                        arrXML.slice(start, end).forEach(reVal => {
                            delete arrXML[arrXML.indexOf(reVal)];
                        });
                    }
                }
                //console.log(value+end)
            }
            //console.log(parser(send))
        });
    }
    return obj;
}
/*
* Converts XML String to JS Object
* */
function toObject(XML, options) {
    if (options === undefined)
        options = { ignoreAttributes: false, ignoreDeclaration: false, ignoreRoot: false };
    if (options.ignoreAttributes === undefined) {
        options.ignoreAttributes = false;
    }
    else if (options.ignoreDeclaration === undefined) {
        options.ignoreDeclaration = false;
    }
    else if (options.ignoreRoot === undefined) {
        options.ignoreRoot = false;
    }
    return parser(XML, true);
}
exports.toObject = toObject;
//console.log(JSONParser('{"Ashp116":{"_id":"116","favirote":{ "_p":"teest","color":"Red","sport":"Tennis, Basket Ball","gaming":"None","hobby":"Game Development"}}}'))
/*
* Converts XML String to JSON
* */
function toJSON(XML, options) {
    if (options === undefined)
        options = { beautify: false, ignoreAttributes: false, ignoreDeclaration: false, ignoreRoot: false };
    if (options.beautify === undefined) {
        options.beautify = false;
    }
    else if (options.ignoreAttributes === undefined) {
        options.ignoreAttributes = false;
    }
    else if (options.ignoreDeclaration === undefined) {
        options.ignoreDeclaration = false;
    }
    else if (options.ignoreRoot === undefined) {
        options.ignoreRoot = false;
    }
    let Parsed = parser(XML, true);
    if (options.beautify) {
        return JSON.stringify(Parsed, null, "\t");
    }
    else {
        return JSON.stringify(Parsed);
    }
}
exports.toJSON = toJSON;
