define([
    "./list-mapped"
],function(ListMapped) {

/**
 * Wrapper for a list of mapped properties from a one-to-one relationship,
 *     extends PropertyMapped
 * @param {string} key Name of the property in the model
 * @param {string} displayName Human-readable name (optional, defaults to key)
 * @param {string} displayProperty Name of the attribute of the mapped property to
 *                          use for display (optional, defaults to "name")
 * @param {function} widgetCallback Callback when widget is rendered, arguments: DOM node
 * @return {can.Construct}
 */
    var ListMappedOne2One = ListMapped.extend({

        getAll: function(item){
            var that = this
            var props = this.getProperty(item)
            var dfd = new can.Deferred()
            // if nothing is selected resolve immediately
            if(!props || !props.length){
                return dfd.resolve([])
            }
            var deferreds = can.map(props, function(prop){
                return that.getOne(item, prop)
            })

            can.when.apply(null, deferreds).done(function(){
                dfd.resolve(Array.prototype.slice.apply(arguments))
            })
            return dfd
        }
    })

    return ListMappedOne2One
})
