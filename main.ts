import * as fs from 'fs';
import * as parseBoolean from "parse-string-boolean";
import {EventEmitter} from 'events'

let xmlDir = "C:\\xmltojson\\tests\\user.xml"

interface parserXML extends EventEmitter {
    on(event: 'root', listener: (XML: string) => void): this;
    on(event: 'declaration', listener: (XML: string) => void): this;
}
const parseXML:parserXML = new EventEmitter()

function ignoreElements(arr:string[], start: number, end: number) {
    return arr.splice(start,end)
}

function ignoreElement(element: string) {
    if (element.includes('?xml') || element.includes('/')) {
        return true
    }
    else {
        return false
    }
}

function convertTypesAuto(data: any) {
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

function elementFromString(str: string) {
    if (str !== undefined) {
        let parsedStr = str.replace(">", " ").replace("/", " ").split(" ")
        if (parsedStr[0] !== "") {
            return parsedStr[0]
        } else {
            return parsedStr[1]
        }
    }
}

function valueFromElement(str: string) {
    if (str !== undefined) {
        let parsedStr = str.replace(">", " ").replace("/", " ").split(" ")
        parsedStr.shift()
        if (parsedStr[0] !== "") {
            return convertTypesAuto(parsedStr.join().replace(",", " "))
        }
    }
}

function onAttribute(element) {
    let send = {}

    element.split(" ").forEach((val) => {
        if (val.includes("=")) {
            const index = val.split("=")[0]
            const value = val.split("=")[1].split(`"`)[1]
            send["_"+ index] = value
        }
    })

    return send;
}

function nestedChild(arr: string[], type?: "none" | "nested") {
    let send = {}
    let parent = elementFromString(arr[0])

    arr.splice(0,1)

    arr.forEach((value, index) => {
        if (!ignoreElement(value)) {
            let end = arr.indexOf(`/${elementFromString(value)}>`)

            if (parent !== "") {
                if ((end - index) === 1) {
                    let childElement = elementFromString(value)
                    send[childElement]  = valueFromElement(value)
                }
                else {
                    if (!value.includes("/")) {
                        let spliced = arr.splice(index, arr.length + 1)
                        send[parent] = nestedChild(spliced)
                    }
                }
            }

        }
    })

    return send
}

function Sort(rawXML: string) {
    let root = ""
    let nestedArr = []
    let object = {}
    let {XML,declaration} = trimXML(rawXML,true)

    let arrayXML = XML.split(/[<]/)
        arrayXML.shift()

    /*Declaration*/

    arrayXML.forEach(((value, index) => {
        let element = elementFromString(value)
        let end = arrayXML.indexOf(`/${element}>`)

        if (!ignoreElement(value)) {
            if (root !== "") {
                if ((end - index) === 1) {
                    let childElement = elementFromString(value)
                    object[root][childElement]  = valueFromElement(value)
                }
                else {
                    if (Math.sign((end - index)) !== -1 && !value.includes("/")) {
                        nestedArr.push(arrayXML.slice(index, end))
                        arrayXML = arrayXML.splice(index,end)
                    }
                }
            }
            else {
                if (index == 0) {
                    root = element
                    object[root] = {}
                    object[root] = onAttribute(value)
                }
            }
        }
        let parentElement = ""
        nestedArr.forEach((arr) => {
            arr.forEach((value, index) => {
                if (!ignoreElement(value)) {
                    let end = arr.indexOf(`/${elementFromString(value)}>`)

                    if (root !== "" && parentElement !== "") {

                        if ((end - index) === 1) {
                            let childElement = elementFromString(value)
                            object[root][parentElement][childElement]  = valueFromElement(value)
                        }
                        else {
                            if (!value.includes("/")) {
                                let spliced = arr.splice(index, end - 1)
                                nestedArr.push(arr.slice(index, end - 1))
                                let childParent = elementFromString(value)
                                object[root][parentElement][childParent] = {}
                                object[root][parentElement][childParent] = (nestedChild(spliced))
                            }
                        }
                    }
                    else {
                        parentElement = elementFromString(value)
                        object[root][parentElement] = {}
                        object[root][parentElement] = onAttribute(value)
                    }
                }
            })

        })

    }))
    return object
}

function trimXML(data, removeDeclaration?: boolean) {
    /*Default Values*/

    removeDeclaration = removeDeclaration || false
    let newXML = ""
    let declaration = ""
    data.split('\r\n').forEach(((value, index) => {
        newXML = newXML + value.trim()
    }))

    if (removeDeclaration) {
        let start = newXML.lastIndexOf("<?")
        let end = newXML.lastIndexOf("?>") + 2
        newXML = newXML.replace(newXML.slice(start,end),"")
        declaration = newXML.slice(start,end)
    }

    return {XML: newXML, declaration: declaration};
}

/*
* Converts XML String to JS Object
* */
export function toObject(XML: string,options?: Options):Object | void {
    return Sort(XML)
}

fs.readFile(xmlDir, 'utf8' , (err, data) => {
    if (err) {
        console.error(err)
        return
    }
   console.log(toObject(data).Note)
})
type Options = {
    beautify?: boolean
    ignoreAttributes?: boolean
    ignoreRoot?: boolean
    ignoreDeclaration?: boolean
}
