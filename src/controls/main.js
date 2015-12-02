define([
    "./list",
    "./edit",
    "./helpers",
    "../views"
], function(CtrlList, CtrlEdit) {

/**
 * Main control to initialize the Admin UI
 * @param {array} types List of Types to expose
 * @param {array} pages List of objects describing special Pages
 * @param {object} routes Dictionary with routes (optional)
 */

    var Main = can.Control.extend({
        defaults: {
            routes: {
                main: "admin",
                page: "admin/page/:page",
                list: "admin/list/:type",
                listPage: "admin/list/:type/page/:page",
                listSearch: "admin/list/:type/search/:search",
                create: "admin/list/:type/create",
                edit: "admin/list/:type/edit/:id"
            }
        }
    },{
        setup: function(el, options){
            var types = options.types || (this.constructor.defaults ? this.constructor.defaults.types : undefined)
            var routes = options.routes || this.constructor.defaults.routes
            if(types){
                types.forEach(function(type){
                    // pass routes configuration
                    type.routes = routes

                    // resolve other types referenced by name in properties
                    if(type.properties){
                        for(var key in type.properties){
                            var property = type.properties[key]
                            var typeName = property.getType()
                            if(typeName && typeof typeName === "string"){
                                var propType = this.getType(typeName, types)
                                property.setType(propType || undefined)
                            }
                        }
                    }
                }, this)
            }

            var pages = options.pages || (this.constructor.defaults ? this.constructor.defaults.pages : undefined)
            if(pages){
                pages.forEach(function(page){
                    // pass routes configuration
                    page.routes = routes
                })
            }
            can.Control.prototype.setup.call( this, el, options );
        },

        "{routes.main} route": "dashboard",
        "{routes.list} route": "list",
        "{routes.listPage} route": "list",
        "{routes.listSearch} route": "list",
        "{routes.create} route": "create",
        "{routes.edit} route": "edit",
        "{routes.page} route": "page",

        init: function(){
            this.initHtml()
            can.route.ready()
        },

        initHtml: function(){
            this.element.html(can.view("../views/admin.stache", {
                types: this.options.types,
                pages: this.options.pages
            }))
        },
        dashboard: function(){
            this.breadcrumb()
        },
        list: function(route){
            if(this.currentList === route.type){
                return
            }
            this.breadcrumb()
            this.currentList = route.type
            var ctrl = new CtrlList(this.element.find(".admin-content"), can.extend(route, {
                type: this.getType(route.type),
                routes: this.options.routes
            }))
        },
        create: function(route){
            this.breadcrumb()
            var ctrl = new CtrlEdit(this.element.find(".admin-content"), {
                type: this.getType(route.type)
            })
        },
        edit: function(route){
            this.breadcrumb()
            var control = new CtrlEdit(this.element.find(".admin-content"), {
                type: this.getType(route.type),
                id: route.id
            })
            var that = this
            control.loadItem.done(function(item){
                that.appendToBreadcrumb(item.getName(), item.getRoute())
            })
        },
        page: function(route){
            this.breadcrumb()
            var page = this.getPage(route.page)
            page.initControl(this.element.find(".admin-content"))
        },

        getType: function(name, types){
            types = types || this.options.types
            return can.grep(types, function(type){
                return type.name === name
            })[0]
        },

        getPage: function(name){
            return can.grep(this.options.pages, function(page){
                return page.name === name
            })[0]
        },

        breadcrumb: function(){
            delete this.currentList
            if(!this.element.find(".admin-breadcrumb").empty().length){
                this.initHtml()
            }
            this.element.find(".admin-content").replaceWith("<div class='admin-content'></div>")
            this.appendToBreadcrumb("Admin", can.route.url({route: this.options.routes.main}))

            // append type to breadcrumb
            var route = can.route.attr()
            if(route.type){
                var type = this.getType(route.type)
                this.appendToBreadcrumb(type.getName(), type.getRoute())
            } else if(route.page){
                var page = this.getPage(route.page)
                this.appendToBreadcrumb(page.getName(), page.getRoute())
            }
        },
        appendToBreadcrumb: function(text, url){
            this.element.find(".admin-breadcrumb").append(can.view("../views/breadcrumb.stache", {
                url: url,
                text: text
            }))
        }
    })

    return Main
    
})
