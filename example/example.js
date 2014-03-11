// helper for loading list and finding one specific entity 
var findOneFromAll = function(model, id){
    return model.findAll().then(function(objs){
        var obj
        objs.forEach(function(p){
            if(p.id == id){
                obj = p
            }
        })
        return new model(obj)
    })
}

// Our models
var Pets = can.Model.extend({
    findAll: "/example/data/pets.json",
    findOne: function(params){
        return findOneFromAll(this, params.id)
    }
}, {})

var People = can.Model.extend({
    findAll: "/example/data/people.json",
    findOne: function(params){
        return findOneFromAll(this, params.id)
    },

    // explicitely set up relation to Pets model and how to serialize data
    attributes: {
        pets: "Pets.models"
    },
    serialize: {
        "Pets": function(pets){
            return $.map(pets, function(pet){
                return {
                    id: pet.id
                }
            })
        }
    }
}, {})


// A very minimalisitic Control
var CustomController = can.Control.extend({
    init: function(el, options){
        el.html("Not very much functionality here.<br><button>OK</button>")
    },
    "button click": function(el, ev){
        el.replaceWith("<div>But that's apparently OK</div>")
    }
})


// Call the Main control on a DOM element or with a selector and
// give it a list of types (and optionally pages) to present to the user
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
                    key: "pets",  // name of the attribute in the data, see JSON files in data directory
                    type: "pet",  // 'name' of the Type for managing pets
                    displayName: "Pets",
                    widgetCallback: function(el){  // let's use a nice widget for selecting multiple entities
                        return el.select2()
                    }
                }),
            },
            list: ["name", "pets"]  // show name of the person and number of her pets in list view
        })
    ],
    pages: [
        new CanAdmin.Page({
            name: "customPage",
            displayName: "Custom Page",
            control: CustomController
        })
    ]
})
