import {toObject} from 'node-xml-to-json';
toObject(`<unit>
    <test>
        <case>
            <justText>blah blah</justText>
        </case>
        <case>
            <attribText attrib='das'>capital
            </attribText>
        </case>
    </test>
</unit>`)