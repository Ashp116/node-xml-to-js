// @ts-ignore
/// <reference types="typescript" />

type ToObjectOptions = {
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
    declaration: string
}

export function toObject(XML: string,options?: ToObjectOptions):Object | void
export function toJSON(XML: string,options?: ToJSONOptions):Object | void