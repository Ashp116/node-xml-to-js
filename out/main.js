"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJSON = exports.toObject = void 0;
const parseBoolean = require("parse-string-boolean");
function ignoreElements(arr, start, end) {
    return arr.splice(start, end);
}
function ignoreElement(element) {
    if (element.includes('?xml') || element.includes('/')) {
        return true;
    }
    else {
        return false;
    }
}
function convertTypesAuto(data) {
    if (!isNaN(parseFloat(data))) {
        return parseFloat(data);
    }
    else if (parseBoolean(data) !== null) {
        return parseBoolean(data);
    }
    else {
        return data;
    }
}
function elementFromString(str) {
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
function valueFromElement(str) {
    if (str !== undefined) {
        let parsedStr = str.replace(">", " ").replace("/", " ").split(" ");
        parsedStr.shift();
        if (parsedStr[0] !== "") {
            // @ts-ignore
            if (onAttribute(str) !== false && onAttribute(str) !== undefined) {
                // @ts-ignore
                let { attributes, raw } = onAttribute(str);
                let send = attributes;
                send["value"] = convertTypesAuto(parsedStr.join(" ").replace(raw, "").trim());
                return send;
            }
            else {
                return convertTypesAuto(parsedStr.join(" "));
            }
        }
    }
}
function onAttribute(element) {
    let send = {};
    let rawAttributes = "";
    element.split(" ").forEach((val) => {
        if (val.includes("=")) {
            const index = val.split("=")[0];
            const value = val.split("=")[1].split(`"`)[1] || val.split("=")[1].split(`'`)[1] || val.split("=")[1].split("`")[1];
            send["_" + index] = value;
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
function onDeclaration(rawStr) {
    let str = rawStr.replace("<?", "").replace("?>", "");
    if (onAttribute(str) !== false && onAttribute(str) !== undefined) {
        // @ts-ignore
        return onAttribute(str);
    }
    else {
        return rawStr;
    }
}
function nestedChild(arr, type) {
    let send = {};
    let parent = elementFromString(arr[0]);
    arr.splice(0, 1);
    arr.forEach((value, index) => {
        if (!ignoreElement(value)) {
            let end = arr.indexOf(`/${elementFromString(value)}>`);
            if (parent !== "") {
                if ((end - index) === 1) {
                    let childElement = elementFromString(value);
                    send[childElement] = valueFromElement(value);
                }
                else {
                    if (!value.includes("/")) {
                        let spliced = arr.splice(index, arr.length + 1);
                        send[parent] = nestedChild(spliced);
                    }
                }
            }
        }
    });
    return send;
}
function XmlParser(rawXML, options) {
    let root = "";
    let nestedArr = [];
    let object = {};
    let { XML, declaration } = trimXML(rawXML, true);
    let arrayXML = XML.split(/[<]/);
    arrayXML.shift();
    /*Declaration*/
    if (declaration !== "") {
        object["Declaration"] = onDeclaration(declaration);
    }
    arrayXML.forEach(((value, index) => {
        let element = elementFromString(value);
        let end = arrayXML.indexOf(`/${element}>`);
        if (!ignoreElement(value)) {
            if (root !== "") {
                if ((end - index) === 1) {
                    let childElement = elementFromString(value);
                    object[root][childElement] = valueFromElement(value);
                }
                else {
                    if (Math.sign((end - index)) !== -1 && !value.includes("/")) {
                        nestedArr.push(arrayXML.slice(index, end));
                        arrayXML = arrayXML.splice(index, end);
                    }
                }
            }
            else {
                if (index == 0) {
                    root = element;
                    object[root] = {};
                    if (onAttribute(value) !== false && onAttribute(value) !== undefined) {
                        // @ts-ignore
                        object[root] = onAttribute(value).attributes;
                    }
                }
            }
        }
        let parentElement = "";
        nestedArr.forEach((arr) => {
            arr.forEach((value, index) => {
                if (!ignoreElement(value)) {
                    let end = arr.indexOf(`/${elementFromString(value)}>`);
                    if (root !== "" && parentElement !== "") {
                        if ((end - index) === 1) {
                            let childElement = elementFromString(value);
                            object[root][parentElement][childElement] = valueFromElement(value);
                        }
                        else {
                            if (!value.includes("/")) {
                                let spliced = arr.splice(index, end - 1);
                                nestedArr.push(arr.slice(index, end - 1));
                                let childParent = elementFromString(value);
                                object[root][parentElement][childParent] = {};
                                object[root][parentElement][childParent] = (nestedChild(spliced));
                            }
                        }
                    }
                    else {
                        parentElement = elementFromString(value);
                        object[root][parentElement] = {};
                    }
                }
            });
        });
    }));
    return object;
}
function trimXML(data, removeDeclaration) {
    /*Default Values*/
    removeDeclaration = removeDeclaration || false;
    let newXML = "";
    let declaration = "";
    data.split('\r\n').forEach(((value, index) => {
        newXML = newXML + value.trim();
    }));
    if (removeDeclaration) {
        let start = newXML.lastIndexOf("<?");
        let end = newXML.lastIndexOf("?>") + 2;
        declaration = newXML.slice(start, end);
        newXML = newXML.replace(declaration, "");
    }
    return { XML: newXML, declaration: declaration };
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
    return XmlParser(XML, options);
}
exports.toObject = toObject;
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
    let Parsed = XmlParser(XML, options);
    if (options.beautify) {
        return JSON.stringify(Parsed, null, "\t");
    }
    else {
        return JSON.stringify(Parsed);
    }
}
exports.toJSON = toJSON;
