define([
    "./text-simple",
], function(TextSimple) {

/**
 * Property for a long text, renders a textare
 * @param {string} key Name of the property in the model (optional, defaults to "name")
 * @param {string} displayName Human-readable name (optional, defaults to key)
 * @param {function} widgetCallback Callback when widget is rendered, arguments: DOM node
 * @param {number} rows Size of the textarea
 * @return {can.Construct}
 */
    var TextLong = TextSimple.extend({
        getWidget: function(item){
            this.widgetCallback("textarea[name='"+this.getKey()+"']")
            return can.view.render("../views/prop-textarea.stache", {
                name: this.getKey(),
                value: this.getDisplay(item),
                rows: this.options.rows || 3
            })

        }
    })

    return TextLong
})
