define(function() {

/**
 * Pages provide a possibility to run custom Controls in the admin area
 * @param {string} name Machine-readable name
 * @param {string} displayName Human-readable name (optional, defaults to @name)
 * @param {string} icon Name of CSS class for icon, without "icon-" prefix
 *                        (optional, defaults to "cog")
 * @param {object} routes Dictionary with routes
 * @param {can.Control} control Controller to be initialized for page
 *
 * @return {can.Contruct}
 */
    var Page = can.Construct.extend({
        defaults: {
            icon: "cog"
        }
    },{
        init: function(opts){
            opts = can.extend({}, this.constructor.defaults, opts)

            for(var o in opts){
                this[o] = opts[o]
            }
        },
        getRoute: function(){
            return can.route.url({
                route: this.routes.page,
                page: this.name
            })
        },
        getName: function(){
            return this.displayName || can.capitalize(this.name)
        },
        getIcon: function(){
            return this.icon
        },

        initControl: function(el){
            return new this.control(el, this.controlOptions)
        }
    })

    return Page
})
