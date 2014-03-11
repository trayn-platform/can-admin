define([
    "./base"
], function(Base) {

/**
 * Wrapper for a boolean property, can be initialized with just the name or a
 *     dictionary of options, uses a checkbox as widget
 * @param {string} key Name of the property in the model
 * @param {string} displayName Human-readable name (optional, defaults to key)
 * @param {function} widgetCallback Callback when widget is rendered, arguments: DOM node
 * @param {string} value Value for boolean field if active
 * @return {can.Construct}
 */
    var Bool = Base.extend({
        defaults: {
            value: true
        }
    },{
        getDisplay: function(item){
            return this.isOn(item) ? "☑" : "☐"
        },
        getWidget: function(item){
            this.widgetCallback("input[name='"+this.getKey()+"']")
            return can.view.render("../views/admin-checkbox.ejs", {
                name: this.getKey(),
                value: this.options.value,
                checked: this.isOn(item)
            })

        },

        isOn: function(item){
            return item[this.getKey()] === this.options.value
        }
    })

    return Bool
})
