/// <reference types="node" file="./main.js"/>

interface ToObjectOptions {
    ignoreAttributes?: boolean
    ignoreRoot?: boolean
    ignoreDeclaration?: boolean
}

export type ToJSONOptions = {
    beautify?: boolean
    ignoreAttributes?: boolean
    ignoreRoot?: boolean
    ignoreDeclaration?: boolean
}

export type OnAttribute = {
    attributes: object,
    raw: string
} | false

export type TrimXML = {
    XML: string,
    Declaration: string
}

/*
* Converts XML String to JS Object
* */
export function toObject(XML: string,options?: ToObjectOptions):Object | void

/*
* Converts XML String to JSON
* */
export function toJSON(XML: string,options?: ToJSONOptions):Object | void