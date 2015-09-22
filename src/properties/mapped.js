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
            return prop ? this.getKey() + "-" + prop[prop.constructor.id] : this.getKey()
        },

        getDisplay: function(item, context){
            var val = this._asyncRenderValue(this.getProperty(item), item, context)
            return can.view.render("../views/prop-display.mustache", {
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
                return "../views/prop-radio.mustache"
            }
            return "../views/prop-select.mustache"
        },
        getWidget: function(item){
            this.viewParams = {
                name: this.getKey(),
                options: new can.List([]),
                cssClass: this._asyncReplaceClass(item),
                multiple: this.isList
            }

            var that = this
            this.getAll(item).done(function(all){
                var options = []
                all.forEach(function(opt){
                    options.push(that.prepareOptionForDisplay(opt, item))
                })
                that.viewParams.options.replace(options)
                that.widgetCallback("."+that._asyncReplaceClass(item))
            })

            var template = this.getWidgetTemplate()
            return can.view.render(template, this.viewParams)
        },
        addWidgetOption: function(item, option, selectedIds){
            this.viewParams.selected = selectedIds || this.viewParams.selected
            var displayOptions = this.prepareOptionForDisplay(option, item)
            displayOptions.selected = true
            this.viewParams.options.push(displayOptions)
            can.$("."+this._asyncReplaceClass(item)).trigger("change")
        },
        prepareOptionForDisplay: function(opt, item){
            var val = opt.constructor && opt.constructor.id ? opt[opt.constructor.id] : opt.value;
            var displayProperty = this.getDisplayProperty()
            var selectedIds = this.getSelectedId(item)
            return {
                value: val,
                displayName: displayProperty ? can.getObject(displayProperty, opt) : can.capitalize(val),
                selected: this.isList ?
                    can.inArray(val, selectedIds) !== -1 :
                    val === selectedIds
            }
        },

        getDisplayProperty: function(){
            return this.options.displayProperty  || "name"
        },

        getModel: function(item){
            if(item.constructor.attributes) {
                var modelName = item.constructor.attributes[this.getKey()].replace(/\.models?$/,"")
                return can.getObject(modelName, window)
            } else {
                var define = item.define[this.getKey()]
                var Type = define.Type || (define.type ? define.type().constructor : undefined)
                // return single Model if type is a Model.List
                return Type.Map || Type
            }
            
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
