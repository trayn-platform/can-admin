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
        defaults: {
            displayProperty: "name"
        }
    },{
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
            var selected = this.getSelected(item)
            var options = can.map(this.options.values, function(opt){
                opt.selected = opt.value === selected
                return opt
            })
            return can.view.render("../views/prop-select.mustache", {
                name: this.getKey(),
                multiple: this.options.multiple,
                options: options,
                displayProperty: this.options.displayProperty
            })
        }
    })

    return Select
})
