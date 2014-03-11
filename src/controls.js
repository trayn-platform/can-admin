define([
    "./controls/main",
    "./controls/list",
    "./controls/edit"
], function(Main, List, Edit) {

    var Controls = {
        Main: Main,
        List: List,
        Edit: Edit
    }

    return Controls
})
