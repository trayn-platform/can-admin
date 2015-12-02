define([
    "../views"
], function() {

    var List = can.Control.extend({
        init: function(el, options) {
            this.items = new can.List([])
            this.renderPage()

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

        renderPage: function() {
            this.element.html(can.view("../views/list.stache", {
                type: this.options.type,
                canCreate: this.options.type.canCreate(),
                canSearch: this.options.type.canSearch(),
                canUpdate: this.options.type.canUpdate(),
                canDestroy: this.options.type.canDestroy(),
                items: this.items
            }))
        },

        loadPage: function(page){
            var that = this
            page = can.isNumeric(page) ? page : undefined
            this.options.type.getAll(page)
            .done(function(items){
                that.displayItems(items)
                that.initPaging(page)
                that.element.removeClass("admin-list-searchresults")
            })
        },

        displayItems: function(items){
            var properties = this.options.type.list
            var displayItems = []
            items.forEach(function(item, i){
                var displayItem = {
                    route: item.getRoute(),
                    label: item.getDisplay(properties[0], "list"),
                    properties: [],
                    cssClass: i%2 === 0 ? "even" : "odd",
                    item: item
                }
                properties.forEach(function(prop, i){
                    if(i > 0) {
                        displayItem.properties.push(item.getDisplay(prop, "list"))
                    }
                })
                displayItems.push(displayItem)
            })
            this.items.replace(displayItems)
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

                var route = that.options.routes.listPage
                var type = that.options.type.name
                page = parseInt(page) || 0
                var numPages = Math.floor(count/opts.max)
                var hasNext = count ?
                        page < numPages :
                        !lastPage

                var pages = []
                for(var p = 0; p <= numPages; p++){
                    if(numPages < 15 ||                     // display all pages if there are less than 15 or ...
                        (p > page - 4 && p < page + 4) ||   // display 3 pages before and after current page
                        (p + 1) % 10 === 0 ||               //   and every tenth page
                        p === 0 ||                          //   and the first
                        p === numPages -1                   //   and the last
                    ){
                        pages.push({
                            page: p+1,
                            active: page === p || !page && p === 0,
                            url: can.route.url({route: route, type: type, page: p})
                        })
                    }
                }

                that.element.find(".admin-list-paging").html(can.view("../views/paginate.stache", {
                    next: hasNext ? can.route.url({route: route, type: type, page: page + 1}) : undefined,
                    prev: page > 0 ? can.route.url({route: route, type: type, page: page - 1}) : undefined,
                    pages: pages
                }))
            })
        },

        loadSearch: function(q){
            this.element.addClass("admin-list-searchresults")
            var that = this
            this.options.type.getSearch(q).done(function(res){
                // ignore results if user was still typing while fetching results
                if(q === that.lastSearchTerm || !that.lastSearchTerm){
                    that.displayItems(res)
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
            var itemCompute = row.data("item")
            var item = itemCompute()
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
