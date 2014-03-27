# can-admin

JS admin interface to REST services, build with [canJS](http://canjs.com/)

[![Build Status](https://travis-ci.org/insposo/can-admin.svg?branch=master)](https://travis-ci.org/insposo/can-admin)

## Features

- List view, optionally with paging and search if provided by REST service
- Create, edit and delete entities
- Handles mapped attributes (references to other entities)
- Custom pages with canJS controls


## Requirements

- The jQuery version of 
  [canJS v1.1.8](https://api.github.com/repos/bitovi/canjs.com/zipball/v1.1.8)
- [jQuery](http://jquery.com/download/)
- A REST service to connect to.
  Attributes referencing other entities have to be expressed as stub objects
  for the _Mapped_ and _ListMapped_  properties to work. Also the relation has
  be defined in the canJS model as
  [attribute](http://canjs.com/1.1/docs/can.Observe.attributes.html).
  e.g. to reference the pet #3 from a person the JSON might look like this:
  `
  {
    name: "Charly",
    pet: {id: 3}
  }
  `


## Getting started

If you have your canJS models already configured to connect to your REST
service, all you have to do is register them with the _Main_ control and
declare which attribute should be accessible:

```js
new CanAdmin.Controls.Main("#admin", {
    types: [
        new CanAdmin.Type({
            name: "pet",
            model: Pets,  // the canJS model
            properties: {
                name: new CanAdmin.Properties.TextSimple("name")
            }
        }),
        new CanAdmin.Type({
            name: "people",
            displayNamePlural: "People",
            model: People,
            properties: {
                name: new CanAdmin.Properties.TextSimple("name"),
                pets: new CanAdmin.Properties.ListMapped({
                    key: "pets",  // name of the attribute in the JSON object
                    type: "pet",  // the 'name' of the Type for managing pets
                    displayName: "Pets"
                }),
            },
            list: ["name", "pets"]  // show name of the person and number of her pets in list view
        })
    ]
})
```

See [example](https://github.com/insposo/can-admin/example/) for a working example.
