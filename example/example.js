// helper for loading list and finding one specific entity 
var findOneFromAll = function(model, id){
    return model.findAll().then(function(objs){
        var obj
        objs.forEach(function(p){
            if(p.id == id){
                obj = p
            }
        })
        return obj
    })
}

// Our models
var Pets = can.Model.extend({
    findAll: "/pets",
    create: "/pets",
    findOne: "/pets/{id}",
    update: "/pets/{id}",
    destroy: "/pets/{id}"
}, {})

var People = can.Model.extend({
    findAll: "/people",
    create: "/people",
    findOne: "/people/{id}",
    update: "/people/{id}",
    destroy: "/people/{id}",

    // explicitely set up relation to Pets model and how to serialize data
    define: {
        pets: {
            Type: Pets.List,
            serialize: function(pets){
                return can.map(pets, function(pet){
                    return {
                        id: pet.id
                    }
                })
            }
        }
    }
}, {})


// prepare fixtures
var PETS = ["Goldfish", "Cat", "Hamster"]
var petStore = can.fixture.store(PETS.length, function(i) {
    return {
        id: i + 1,
        name: PETS[i]
    }
})
can.fixture({
    "GET /pets": petStore.findAll,
    "POST /pets": petStore.create,
    "GET /pets/{id}": petStore.findOne,
    "PUT /pets/{id}": petStore.update,
    "DELETE /pets/{id}": petStore.destroy,
})
var PEOPLE = ["Peter", "Paul", "Mary"]
var peopleStore = can.fixture.store(PEOPLE.length, function(i) {
    return {
        id: i + 1,
        name: PEOPLE[i],
        pets: [{id: can.fixture.rand(1, PETS.length)}]
    }
})
can.fixture({
    "GET /people": peopleStore.findAll,
    "POST /people": peopleStore.create,
    "GET /people/{id}": peopleStore.findOne,
    "PUT /people/{id}": peopleStore.update,
    "DELETE /people/{id}": peopleStore.destroy
})
can.fixture.delay = 100;


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
