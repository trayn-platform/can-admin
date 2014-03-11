define([
    "./select"
],function(Select) {

/**
 * Wrapper for a list of pre-defined options, extends Select
 * @param {string} key Name of the property in the model
 * @param {string} displayName Human-readable name (optional, defaults to key)
 * @param {array} values List of objects describing options, attributes:
 *                        - value: the value to be saved
 *                        - name: name to be displayed
 * @param {bool} multiple User can select multiple values
 * @return {can.Construct}
 */
    var List = Select.extend({
        isList: true,

        getSelected: function(item){
            return item[this.getKey()] || []
        },

        getDisplay: function(item){
            var names = []
            var opts = this.options.values
            can.each(this.getSelected(item), function(value){
                var defined = can.grep(opts, function(o){
                    return o.value === value
                })
                name.push(defined.length ?
                    defined[0].name :
                    can.capitalize(value)
                )
            })
            return names.join(", ")
        }
    })

    return List
})
