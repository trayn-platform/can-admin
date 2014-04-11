define([
    "../views"
], function(ejsList, ejsPaginate) {

    var List = can.Control.extend({
        init: function(el, options) {
            this.items = new can.Observe.List()
            el.html(can.view("../views/admin-list.ejs", {
                type: options.type,
                items: this.items
            }))

            if(options.search){
                el.find(".admin-list-search").val(options.search)
                this.loadSearch(options.search)
            } else {
                this.loadPage(options.page)
            }

        },

        "{routes.list} route": function(route){
            if(route.type === this.options.type.name){
                this.loadPage()
            }
        },
        "{routes.listPage} route": function(route){
            this.loadPage(route.page)
        },
        "{routes.listSearch} route": function(route){
            this.loadSearch(route.search)
        },

        loadPage: function(page){
            var that = this
            page = can.isNumeric(page) ? page : undefined
            this.options.type.getAll(page)
            .done(function(items){
                that.items.replace(items)
                that.initPaging(page)
                that.element.removeClass("admin-list-searchresults")
            })
        },

        initPaging: function(page){
            var opts = this.options.type.getPagingParameters()
            var lastPage = this.items.length !== opts.max
            if(!page && lastPage){
                // first page and less items found than allowed per page
                return
            }

            if(!this.hasOwnProperty("count")){
                this.count = this.options.type.getCount()
            }
            
            var that = this
            this.count.done(function(count){
                if(count <= opts.max || !that.element){
                    return
                }
                
                page = page || 0
                that.element.find(".admin-list-paging").html(can.view("../views/admin-paginate.ejs", can.extend({
                    route: that.options.routes.listPage,
                    type: that.options.type.name,
                    count: count,
                    pages: Math.ceil(count/opts.max),
                    next: count ?
                        page < Math.floor(count/opts.max) :
                        !lastPage,
                    page: parseInt(page)
                }, opts)))
            })
        },

        loadSearch: function(q){
            this.element.addClass("admin-list-searchresults")
            var that = this
            this.options.type.getSearch(q).done(function(res){
                // ignore results if user was still typing while fetching results
                if(q === that.lastSearchTerm || !that.lastSearchTerm){
                    that.items.replace(res)
                }
            })
        },
        resetSearch: function(){
            window.location.hash = can.route.url({
                route: this.options.routes.list,
                type: this.options.type.name
            })
        },

        ".delete click": function(el, ev){
            ev.preventDefault()
            var row = el.closest("tr")
            var item = row.data("item")
            if(window.confirm("Delete '" + item.getName() + "'?")){
                item.destroy()
                .done(function(){
                    row.remove()
                })
            }
        },

        ".admin-list-search keyup": function(el, ev){
            ev.preventDefault()
            var val = el.val()
            this.lastSearchTerm = val

            if(ev.which === 27){ // escape
                el.val("")
                this.resetSearch()
                return
            } else if(ev.which === 13) { // enter
                return
            }

            var that = this
            // wait 200ms before sending request to avoid searching while user is still typing
            window.setTimeout(function(){
                // only search if val didn't change
                if(val === that.lastSearchTerm){
                    window.location.hash = can.route.url({
                        route: that.options.routes.listSearch,
                        type: that.options.type.name,
                        search: val
                    })
                    that.element.find(".admin-list-paging").empty()
                }
            }, 200)
        },
        ".admin-list-reset click": function(el, ev){
            this.resetSearch()
        },

        ".sortable click": function(el, ev){
            ev.preventDefault()
            this.element.find(".sortable.active").removeClass("active")
            el.addClass("active").removeClass("desc asc")

            var orderBy = el.data("orderBy")
            var type = this.options.type
            if(orderBy !== type.sortProperty) {
                type.sortProperty = orderBy
                delete type.currentSortType
                el.addClass("asc")
            } else { // toggle sort direction
                if(!type.currentSortType || type.currentSortType === type.sortAscending){
                    type.currentSortType = type.sortDescending
                    el.addClass("desc")
                } else {
                    type.currentSortType = type.sortAscending
                    el.addClass("asc")
                }
            }
            
            this.loadPage()
        }
    })

    return List
})
