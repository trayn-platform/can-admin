define([
    "./item"
], function(Item) {

/**
 * Base type for admin UI
 * @param {string} name Machine-readable name
 * @param {string} displayName Human-readable name (optional, defaults to @name)
 * @param {string} displayNamePlural Human-readable plural name (optional,
 *                        defaults to @name)
 * @param {string} displayProperty Name of the property of an item to use
 *                        for display (optional)
 * @param {string} icon Name of CSS class for icon, without "icon-" prefix
 *                        (optional, defaults to "cog")
 * @param {can.Model} model the can.Model connecting the type to a REST service
 * @param {object} properties Dictionary of properties of the model which are
 *                        used in the Admin UI
 * @param {array} list Array of property names to be displayed in the list of
 *                        entities (optional, defaults to first element of
 *                        @edit)
 * @param {array} edit Array of property names to edited (optional, as default
 *                        all @properties are editable)
 * @param {array} actions list of strings with supported actions (optional,
 *                        defaults to ["create", "update", "destroy"])
 * @param {array} callbacks list of functions called in the success method of
 *                        the corresponding model call: "onCreate", "onUpdate",
 *                        "onDestroy", "onError" (called on all errors)
 * @param {object} paging Object describing parameters for paging:
 *                        - limit: name of the property limiting the number
 *                          of item per page (optional, defaults to "limit")
 *                        - offset: name of the property defining the current
 *                          paging position (optional, defaults to "offset")
 *                        - n: number of entities to display per page (optional,
 *                          defaults to 25)
 *                        - noLimit: value to use for limit when retrieving
 *                          all entities (optional, default: 0)
 * @param {string} sortParameter Name of query parameter to define sorting
 *                        (optional, default "orderBy")
 * @param {string} sortProperty Name of property to sort by (optional)
 * @param {string} sortType Name of query parameter to define ascending/
 *                        descending sort order (optional, default "orderType")
 * @param {string} sortAscending Query value for ascending sorting (optional,
 *                        default "ASC")
 * @param {string} sortDescending Query value for ascending sorting (optional,
 *                        default "DESC")
 * @param {object} queryParameters Dictionary with parameters to append to
 *                        findOne, findAll and getCount queries, e.g.:
 *                        {findAll: { filter: "USER"} } will append
 *                            ?filter=USER to all findAll requests
 * @param {object} services Object configuring additional services not covered
 *                        by model:
 *                        - count: URL or function to retrieve count of items
 *                        - search: URL or function providing a search interface
 * @return {can.Construct}
 */
    var Type = can.Construct.extend({
        defaults: {
            actions: ["create", "update", "destroy"],
            icon: "cog",
            paging: {
                limit: "limit",
                offset: "offset",
                n: 25,
                noLimit: 0
            },
            sortParameter: "orderBy",
            sortType: "orderType",
            sortAscending: "ASC",
            sortDescending: "DESC"
        }
    },{
        init: function(opts){
            opts = can.extend({}, this.constructor.defaults, opts)
            var getProperty = function(propName){
                return opts.properties[propName]
            }
            var createService = function(s){
                switch (typeof s) {
                    case "function":
                        return s
                    case "string":
                        return function(params){
                            return can.getJSON(can.sub(s, params, false))
                        }
                }
                throw  "No valid service definition " + s
            }

            // store all opts in instance, set properties for list and edit:
            for(var o in opts){
                if(o === "edit" || o === "list"){
                    this[o] = can.map(opts[o], getProperty)
                } else if(o === "services"){
                    this.services = {}
                    for(var s in opts.services){
                        this.services[s] = createService(opts.services[s])
                    }
                } else {
                    this[o] = opts[o]
                }
            }

            // if no editable properties are defined, assume all properties are editable:
            this.edit = this.edit || can.map(opts.properties, function(n){ return n })

            // if no properties for list view are defined, use first property from edit:
            this.list = this.list || [this.edit[0]]
        },

        canCreate: function(){
            return this.supportsAction("create")
        },
        canUpdate: function(){
            return this.supportsAction("update")
        },
        canDestroy: function(){
            return this.supportsAction("destroy")
        },
        supportsAction: function(action){
            return can.inArray(action, this.actions) !== -1
        },
        canSearch: function(){
            return !! (this.services && this.services.search)
        },

        getName: function(){
            return this.displayName || can.capitalize(this.name)
        },
        getNamePlural: function(){
            return this.displayNamePlural || this.getName() + "s"
        },

        getIcon: function(){
            return this.icon
        },

        _route: function(what){
            return can.route.url({
                route: this.routes[what],
                type: this.name
            })
        },
        getRoute: function(){
            return this._route("list")
        },
        getCreateRoute: function(){
            return this._route("create")
        },

        getProperty: function(key){
            for(var prop in this.properties){
                if(this.properties[prop].getKey() === key){
                    return this.properties[prop]
                }
            }
        },

        getPagingParameters: function(page){
            page = page || 0
            var that = this
            var get = function(name){
                return that.paging && that.paging[name] !== undefined ?
                    that.paging[name] :
                    that.constructor.defaults.paging[name]
            }

            var opts = {}
            if(page === true){
                opts[get("limit")] = get("noLimit")
            } else {
                var n = get("n")
                opts[get("limit")] = n
                opts[get("offset")] = n * page
            }
            return opts
        },
        getQueryParameters: function(query){
            return this.queryParameters ? this.queryParameters[query] || {} : {}
        },

        getAll: function(page){
            var params = can.extend(
                this.getQueryParameters("findAll"),
                this.getPagingParameters(page)
                )
            if(this.sortParameter && this.sortProperty){
                params[this.sortParameter] = this.sortProperty
                if(this.currentSortType){
                    params[this.sortType] = this.currentSortType
                }
            }

            return this.returnItemList(this.model.findAll(params))
        },
        returnItemList: function(deferred){
            var that = this
            return deferred.then(function(instances){
                    return can.map(instances, function(instance){
                        if(!(instance instanceof that.model)) {
                            instance = new that.model(instance)
                        }
                        return new Item({
                            type: that,
                            instance: instance
                        })
                    })
                })
        },
        getOne: function(id){
            var that = this
            var params = this.getQueryParameters("findOne")
            params.id = id
            return this.model.findOne(params)
                .then(function(instance){
                    return new Item({
                        type: that,
                        instance: instance
                    })
                })
        },
        createNew: function(){
            var instance = new this.model()
            return new Item({
                type: this,
                instance: instance
            })
        },
        getCount: function(){
            if(this.services && this.services.count){
                return this.services.count(this.getQueryParameters("count"))
            }
            return new can.Deferred().resolve()
        },
        getSearch: function(term){
            if(this.canSearch()){
                var params = can.extend({},
                    this.getPagingParameters(0),
                    this.getQueryParameters("search"),
                    {
                        s: term
                    })
                return this.returnItemList(this.services.search(params))
            }
            return new can.Deferred().resolve()
        }
    })

    return Type
})
