test("CanAdmin Classes", function(){
    ["Type", "Properties", "Page", "Controls"].forEach(function(cls){
        ok(!!CanAdmin[cls], "CanAdmin."+cls+" Class defined")
    })
})

var testModel = new can.Model({
    findAll: "data.json"
})

var getTestType = function(options){
    return new CanAdmin.Type($.extend({}, {
        name: "test-type",
        displayName: "Test Type",
        model: testModel,
        properties: {
            name: new CanAdmin.Properties.TextSimple("name"),
            accessoires: new CanAdmin.Properties.List({
                name: "accessoires",
                values: [{
                    value: "ring",
                    name: "Ring"
                }, {
                    value: "sword",
                    name: "Sword"
                }]
            })
        }
    }, options))
}

test("Type initialization", function(){
    var type = getTestType()

    equal(type.getName(), "Test Type", "has name")
    equal(type.getNamePlural(), "Test Types", "has name plural")

    ok(type.edit, "list of editable properties is set")
    equal(type.edit.length, 2, "list of editable properties has two elements")

    ok(type.list, "list view properties is set")
    equal(type.list.length, 1, "list view properties has one element")

})
