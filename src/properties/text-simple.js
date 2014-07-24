define([
    "./base"
], function(Base) {

/**
 * Wrapper for a simple property, can be initialized with just the name or a dictionary of options
 * @param {string} key Name of the property in the model (optional, defaults to "name")
 * @param {string} displayName Human-readable name (optional, defaults to key)
 * @param {function} widgetCallback Callback when widget is rendered, arguments: DOM node
 * @return {can.Construct}
 */
    var TextSimple = Base.extend({
        getWidget: function(item){
            this.widgetCallback("input[name='"+this.getKey()+"']")
            return can.view.render("../views/prop-input.mustache", {
                name: this.getKey(),
                value: this.getDisplay(item)
            })

        }
    })

    return TextSimple
})
