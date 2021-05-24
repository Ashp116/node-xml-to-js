"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_xml_to_json_1 = require("node-xml-to-json");
node_xml_to_json_1.toObject(`<unit>
    <test>
        <case>
            <justText>blah blah</justText>
        </case>
        <case>
            <attribText attrib='das'>capital
            </attribText>
        </case>
    </test>
</unit>`);
