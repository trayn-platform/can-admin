define([
    "../views"
], function() {

    var Edit = can.Control.extend({
        init: function(el, options) {
            // make deferred accessible so the invoking control can use item when it's loaded
            this.loadItem = can.when(options.id ? options.type.getOne(options.id) :  options.type.createNew())

            var that = this
            this.loadItem.done(function(item){
                that.item = item

                var target = that.options.inline ?
                    el.find(".admin-edit-form") :
                    el

                target.html(can.view("../views/edit.mustache", {
                    type: options.type,
                    canUpdate: options.type.canUpdate(),
                    inline: options.inline,
                    item: item,
                    properties: that.getEditProperties()
                }))
            })
        },

        getEditProperties: function(){
            var properties = []
            var item = this.item
            this.options.type.edit.forEach(function(prop){
                if(!item.instance.isNew() || prop.isEnabled(item.instance.isNew() ? "create" : "update")) {
                    var propType = prop.getType()
                    properties.push({
                        key: prop.getKey(),
                        label: prop.getName(),
                        widget: item.getWidget(prop),
                        canCreate: propType ? propType.canCreate() : false,
                        property: prop
                    })
                }
            }, this)
            return properties
        },

        close: function(item){
            if(typeof this.options.onClose === "function"){
                this.options.onClose(item)
            }

            if(this.options.inline){
                this.element.remove()
            } else {
                window.location.hash = this.options.type.getRoute()
            }
        },

        "form submit": function(el, ev){
            ev.preventDefault()

            var dfd = this.item.saveForm(el)

            if(this.options.inline){
                var that = this
                dfd.done(function(item){
                    that.close(item)
                })
            }
        },

        ".admin-edit-create click": function(el, ev){
            ev.preventDefault()
            var property = el.data("property")
            var type = property.getType()
            var that = this

            this.element.after(can.view("../views/edit-inline.mustache", {
                type: type
            }))

            var edit = new Edit(this.element.next(), {
                type: type,
                inline: true,
                onClose: function(newOption){
                    if(newOption){
                        // get currently selected items to prevent data loss when live-bound widgt list is re-drawn
                        var values = that.item.serializeForm(el.closest("form"))
                        var selectedIds = can.map(values[property.getKey()] || [], function(o){ return o.id })
                        // add new option and pre-select it
                        selectedIds.push(newOption.id)
                        property.addWidgetOption(that.item.instance, newOption, selectedIds)
                    }
                }
            })
        },

        ".admin-edit-close click": function(el, ev){
            ev.preventDefault()
            this.close()
        }
    })

    return Edit
})
