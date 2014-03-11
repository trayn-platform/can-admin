define([
    "./base"
], function(Base) {

/**
 * Wrapper for a mapped property, extends Base, can be initialized with
 *     just the name or a dictionary of options
 * @param {string} key Name of the property in the model
 * @param {string} displayName Human-readable name (optional, defaults to key)
 * @param {string} displayProperty Name of the attribute of the mapped property
 *                          to use for display, can be a dotted path (optional,
 *                          defaults to "name")
 * @param {string} widgetType type of form element to use as widget, possible
 *                          values "select" (default) and "radio"
 * @param {function} widgetCallback Callback when widget is rendered, arguments: DOM node
 * @return {can.Construct}
 */
    var Mapped = Base.extend({
        defaults: {
            displayProperty: "name"
        }
    },{
        _asyncRenderValue: function(prop, item){
            var that = this
            if(prop){
                this.getOne(item, prop).done(function(mapped){
                    can.$("."+that._asyncReplaceClass(item))
                        .text(mapped.attr(that.getDisplayProperty()))
                })
            }
        },
        _asyncReplaceClass: function(item){
            var prop = this.getProperty(item)
            return prop ? prop.constructor.fullName + "-" + this.getKey() : this.getKey()
        },

        getDisplay: function(item, context){
            var val = this._asyncRenderValue(this.getProperty(item), item, context)
            return can.view.render("../views/admin-prop.ejs", {
                cssClass: this._asyncReplaceClass(item),
                val: val
            })
        },
        getPropertyID: function(prop){
            return prop[prop.constructor.id]
        },
        getSelectedId: function(item){
            var prop = this.getProperty(item)
            return prop ? this.getPropertyID(prop) : false
        },
        getWidgetTemplate: function(){
            if(this.options.widgetType === "radio") {
                return "../views/admin-radio.ejs"
            }
            return "../views/admin-select.ejs"
        },
        getWidget: function(item){
            this.viewParams = {
                name: this.getKey(),
                displayProperty: this.getDisplayProperty(),
                options: new can.Observe.List([]),
                selected: this.getSelectedId(item),
                cssClass: this._asyncReplaceClass(item),
                multiple: this.isList
            }

            var that = this
            this.getAll(item).done(function(all){
                that.viewParams.options.replace(all)
                that.widgetCallback("."+that._asyncReplaceClass(item))
            })

            var template = this.getWidgetTemplate()
            return can.view.render(template, this.viewParams)
        },
        addWidgetOption: function(item, option, selectedIds){
            this.viewParams.selected = selectedIds || this.viewParams.selected
            this.viewParams.options.push(option)
            can.$("."+this._asyncReplaceClass(item)).trigger("change")
        },

        getDisplayProperty: function(){
            return this.options.displayProperty  || "name"
        },

        getModel: function(item){
            var modelName = item.constructor.attributes[this.getKey()].replace(/\.models?$/,"")
            return can.getObject(modelName, window)
        },
        getProperty: function(item){
            return item[this.getKey()]
        },

        getOne: function(item, prop){
            return this.getModel(item).findOne({id: this.getPropertyID(prop)})
        },
        getAll: function(item){
            var params= {}
            var model = this.getModel(item)

            var type = this.getType()
            if(type){
                params = can.extend(
                    type.getQueryParameters("findAll"),
                    type.getPagingParameters(true)
                )
                if(type.sortParameter && type.sortProperty){
                    params[type.sortParameter] = type.sortProperty
                }
                model = type.model
            }
            if(this.options.queryParameters && this.options.queryParameters.findAll){
                can.extend(params, this.options.queryParameters.findAll)
            }
            return model.findAll(params)
        },

        parseValue: function(val){
            return {id: val}
        }
    })

    return Mapped
})
