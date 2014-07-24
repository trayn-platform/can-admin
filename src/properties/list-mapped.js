define([
    "./mapped"
], function(Mapped) {

/**
 * Wrapper for a list of mapped properties, extends PropertyMapped, can be
 *     initialized with just the name or a dictionary of options
 * @param {string} key Name of the property in the model
 * @param {string} displayName Human-readable name (optional, defaults to key)
 * @param {string} displayProperty Name of the attribute of the mapped property to
 *                          use for display (optional, defaults to "name")
 * @param {string} widgetType type of form element to use as widget, possible
 *                          values "select" (default) and "checkbox"
 * @param {function} widgetCallback Callback when widget is rendered, arguments: DOM node
 * @return {can.Construct}
 */
    var ListMapped = Mapped.extend({
        isList: true,

        _asyncRenderValue: function(props, item, context){
            if(context === "list"){
                // show count of values in list view
                return props ? props.length : 0
            } else {
                var that = this
                this.getAll(item)
                .done(function(mapList){
                    var names = props.map(function(prop){
                        return prop.attr(that.getDisplayProperty())
                    }).join(", ")
                    can.$("."+that._asyncReplaceClass(item)).text(names)
                })
            }
        },
        _asyncReplaceClass: function(item){
            var prop = this.getProperty(item)
            return prop ? prop.constructor.fullName + "-" + this.getKey() : this.getKey()
        },

        getWidgetTemplate: function(){
            if(this.options.widgetType === "checkbox") {
                return "../views/prop-list-checkbox.mustache"
            }
            return "../views/prop-select.mustache"
        },
        
        getSelectedId: function(item){
            var props = this.getProperty(item)
            var getID = this.getPropertyID
            return props ?
                    can.map(props, function(p){
                    return getID(p)
                }) :
                []
        }
    })

    return ListMapped
})
