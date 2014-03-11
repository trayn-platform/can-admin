define([
    "./properties/text-simple",
    "./properties/text-long",
    "./properties/select",
    "./properties/list",
    "./properties/mapped",
    "./properties/list-mapped",
    "./properties/list-mapped-one2one",
    "./properties/bool"
], function(TextSimple, TextLong, Select, List, Mapped, ListMapped, ListMappedOne2One, Bool) {

    var Properties = {
        TextSimple: TextSimple,
        TextLong: TextLong,
        Select: Select,
        List: List,
        Mapped: Mapped,
        ListMapped: ListMapped,
        ListMappedOne2One: ListMappedOne2One,
        Bool: Bool
    }

    return Properties
})
