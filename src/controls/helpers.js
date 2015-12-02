define([], function() {
    can.stache.registerHelper("appendDocFrag",
        function(docFrag){
            return function(el) {
                if(docFrag instanceof Node) {
                    el.appendChild(docFrag)
                } else {
                    can.$(el).append(docFrag)
                }
            }
        })
})
