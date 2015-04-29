var SynergykitObject = require("../object"),
    util = require("util"),    
    Errors = require("../errors")

function Functions(url, synergykit) {
    Functions.super_.apply(this, arguments)
    this.synergykit = synergykit
    this.url = url
    this.endpoint = "/functions"
}

Functions.super_ = SynergykitObject

Functions.prototype = Object.create(SynergykitObject.prototype, {
    constructor: {
        value: Functions,
        enumarable: false
    }
})

Functions.prototype.run = function(callbacks) {
    if(!this.url) {
        throw Errors.NO_URL
    }else{
        this.synergykit.request({
            method:  "POST",
            body: this.get(),
            endpoint: this.endpoint + "/" + this.url
        }, callbacks)       
    }
}

module.exports.Functions = Functions