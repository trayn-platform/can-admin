define(function() {

/**
 * Wrapper for a simple property, can be initialized with just the name or a
 * dictionary of options
 * @param {string} key Name of the property in the model (optional, defaults
 *                      to "name")
 * @param {string} displayName Human-readable name (optional, defaults to key)
 * @param {function} widgetCallback Callback when widget is rendered
 *                      arguments: DOM node
 * @param {array} actions list of strings with supported actions (optional,
 *                        possible values: "create", "update")
 * @param {string} type reference to a admin type, either the Type or the name
 *                      of the type, necessary for creating mapped properties
 *                      inline (optional)
 * @return {can.Construct}
 */
    var Property = can.Construct.extend({
        defaults: {
            key: "name"
        }
    },{
        init: function(opts){
            if(typeof opts === "string"){
                opts = {key: opts}
            }
            opts = can.extend({}, this.constructor.defaults, opts)
            this.options = opts
        },
        getKey: function(){
            return this.options.key
        },
        getName: function(){
            return this.options.displayName || can.capitalize(this.getKey())
        },
        getType: function(){
            return this.options.type
        },
        setType: function(type){
            this.options.type = type
        },
        isEnabled: function(mode){
            if(this.options.actions){
                return can.inArray(mode, this.options.actions) !== -1
            }
            return !this.options.disabled
        },

        getDisplay: function(item, context){
            return  item[this.getKey()]
        },
        getWidget: function(item){
            return this.getDisplay(item)
        },
        widgetCallback: function(selector){
            var cb = this.options.widgetCallback
            if(typeof cb === "function"){
                window.setTimeout(function(){
                    cb(can.$(selector))
                })
            }
        },

        parseValue: function(val){
            return val
        }
    })

    return Property
})
