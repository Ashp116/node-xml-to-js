<div align="center">

# node-xml-to-json
Easily convert XML data to ***JS Object*** or ***JSON***



------------------------

[![NPM](https://img.shields.io/badge/npm-v1.0.5-blue)](https://www.npmjs.com/package/node-xml-to-json)
</div>

### Why chose this module?
Node-xml-to-js module is easy and beginner-friendly module. It allows you to use isolated function for converting. The best part is you can customize: beautify your code, ignore root, ignore declaration, and more!

-----------------

# Installation
``` 
npm install node-xml-to-json --save 
```



----------------
# Example

Here is an example project


<details>
<summary><strong>XML to JS Object</strong></summary>
<br>
user.xml

````xml
<Ashp116 id="116">
    <favirote>
        <color>Red</color>
        <sport>Tennis, Basket Ball</sport>
        <gaming>None</gaming>
        <hobby>Game Development</hobby>
    </favirote>
    <IsAMillionaire>false</IsAMillionaire>
    <IsATrillionaire>true</IsATrillionaire>
    <extra>
        <joke>What's the best thing about Switzerland? I don't know, but the flag is a big plus</joke>
    </extra>
</Ashp116>
````

index.ts
````ts
import {toObject, toJSON} from 'node-xml-to-js'

fs.readFile("path/to/user.xml", 'utf8' , (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    
    let User = parser.toObject(data)
    console.log(User)
})
````

output
```
{
  Ashp116: {
    _id: '116',
    favirote: {
      color: 'Red',
      sport: 'Tennis, Basket Ball',
      gaming: 'None',
      hobby: 'Game Development'
    }
  }
}
```


</details>

<details>
<summary><strong>XML to JSON</strong></summary>

user.xml
````xml
<Ashp116 id="116">
    <favirote>
        <color>Red</color>
        <sport>Tennis, Basket Ball</sport>
        <gaming>None</gaming>
        <hobby>Game Development</hobby>
    </favirote>
    <IsAMillionaire>false</IsAMillionaire>
    <IsATrillionaire>true</IsATrillionaire>
    <extra>
        <joke>What's the best thing about Switzerland? I don't know, but the flag is a big plus</joke>
    </extra>
</Ashp116>
````

index.ts
````ts
import {toObject, toJSON} from 'node-xml-to-js'

fs.readFile("path/to/user.xml", 'utf8' , (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    
    let User = parser.toJSON(data, {beautify: true})
    console.log(User)
})
````

output
```
{
        "Ashp116": {
                "_id": "116",
                "favirote": {
                        "color": "Red",
                        "sport": "Tennis, Basket Ball",
                        "gaming": "None",
                        "hobby": "Game Development"
                }
        }
}

```

</details>