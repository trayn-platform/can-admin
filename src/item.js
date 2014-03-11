define(function() {

/**
 * Instance of an entity
 * @param {Type} type The Type construct the instance belongs to
 * @param {can.Model} instance Instance of a model
 * @param {string} displayProperty name of the property to use for display,
 *                                 can be a dotted path (optional, defaults
 *                                 to "name")
 * @return {can.Construct}
 */
    var Item = can.Construct.extend({
        init: function(opts){
            for(var o in opts){
                this[o] = opts[o]
            }
        },

        getName: function(){
            var propName = this.displayProperty || this.type.displayProperty || "name"
            var prop = can.getObject(propName, this.type.properties)
            return this.getDisplay(prop)
        },

        getRoute: function(){
            return can.route.url({
                route: this.type.routes.edit,
                type: this.type.name,
                id: this.instance[this.instance.constructor.id || "id"]
            })
        },

        getDisplay: function(property, context){
            return property.getDisplay(this.instance, context)
        },
        getWidget: function(property){
            var mode = this.instance.isNew() ? "create" : "update"
            return !this.type.canUpdate() || !property.isEnabled(mode) ?
                "<span class='ro-property'>"+this.getDisplay(property, "edit")+"</span>" :
                property.getWidget(this.instance)
        },

        serializeForm: function(form){
            var objects = form.serializeArray();
            var result = {}
            objects.forEach(function(obj){
                var prop = this.type.getProperty(obj.name)
                var val = prop.parseValue(obj.value)
                if(prop && prop.isList){
                    result[obj.name] = result[obj.name] || []
                    result[obj.name].push(val)
                } else {
                    result[obj.name] = val
                }
            }, this)
            return result;
        },
        save: function(updatedValues){
            this.type.edit.forEach(function(property){
                var val = updatedValues[property.getKey()]
                var key = property.getKey()

                if(val === undefined){
                    this.instance.removeAttr(key)
                } else {
                    this.instance.attr(key, val)
                }
            }, this)
            var save = this.instance.save()
            if (this.instance.isNew()) {
                this.callback(save, "onCreate");
            } else {
                this.callback(save, "onUpdate");
            }
            this.callback(save, "onError", "fail");
            return save;
        },
        saveForm: function(form){
            return this.save(this.serializeForm(form))
        },
        destroy: function(){
            var destroy =  this.instance.destroy()
            this.callback(destroy, "onDestroy");
            this.callback(destroy, "onError", "fail");
            return destroy
        },

        callback: function(deferred, name, when) {
            if (this.type.callbacks) {
                var cb = this.type.callbacks[name];
                when = when || "done"
                if (typeof cb === "function") {
                    deferred[when](cb);
                }
            }
        }
    })

    return Item
})
