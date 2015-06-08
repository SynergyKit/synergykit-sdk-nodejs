var _ = require("./underscore/underscore.js")
function SynergkitObject() {
    this.data = {
        __v: 0,
        _id: null,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
    }
    
}

SynergkitObject.prototype.set = function(key, value) {
    if(_.isObject(key) && value === undefined) {
        this.data = key
    }else{
        this.data[key] = value
    }
    
}

SynergkitObject.prototype.get = function(key) {
    if(key === undefined) {
        var object = {}
        for(var i in this.data) {
            object[i] = this.data[i]
        }
        return object
    }
    return this.data[key]
}

module.exports = SynergkitObject