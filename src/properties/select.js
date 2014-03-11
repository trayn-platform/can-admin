define([
    "./base"
],function(Base) {

/**
 * Wrapper for a vlue out of a list of pre-defined options, extends Base
 * @param {string} key Name of the property in the model
 * @param {string} displayName Human-readable name (optional, defaults to key)
 * @param {array} values List of objects describing options, attributes:
 *                        - value: the value to be saved
 *                        - name: name to be displayed
 * @return {can.Construct}
 */
    var Select = Base.extend({

        getSelected: function(item){
            return item[this.getKey()]
        },

        getDisplay: function(item){
            var value = this.getSelected(item)
            var defined = can.grep(this.options.values, function(o){
                return o.value === value
            })
            return defined.length ?
                defined[0].name :
                can.capitalize(value)
        },
        getWidget: function(item){
            this.widgetCallback("select[name='"+this.getKey()+"']")
            return can.view.render("../views/admin-select.ejs", {
                name: this.getKey(),
                multiple: this.options.multiple,
                options: this.options.values,
                selected: this.getSelected(item)
            })
        }
    })

    return Select
})
