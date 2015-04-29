var SynergykitObject = require("../object"),
    util = require("util"),    
    Errors = require("../errors")

function Platforms(synergykit) {
    Platforms.super_.apply(this, arguments)

    this.synergykit = synergykit
    this.endpoint = "/users"
    
    
}

Platforms.super_ = SynergykitObject

Platforms.prototype = Object.create(SynergykitObject.prototype, {
    constructor: {
        value: Platforms,
        enumarable: false
    }
})

Platforms.prototype.save = function(callbacks) {
    if(!this.get("platformName")) {
        throw Errors.NO_PLATFORM_NAME
    }else if(!this.get("registrationId")) {
        throw Errors.NO_PLATFORM_REGISTRATION_ID
    }else{
        if(this.get("_id")) {
            this.synergykit.request({
                method: "PUT",
                endpoint: this.endpoint + "/me/platforms/" + this.get("_id")
            }, callbacks, this)
        }else{
            this.synergykit.request({
                method: "POST",
                endpoint: this.endpoint + "/me/platforms"
            }, callbacks, this)
        }        
    }    
}

Platforms.prototype.fetch = function(callbacks) {
    if(!this.get("_id")) {
        this.synergykit.request({
            method: "GET",
            endpoint: this.endpoint + "/me/platforms"
        }, callbacks, this)
    }else{
        this.synergykit.request({
            method: "GET",
            endpoint: this.endpoint + "/me/platforms/" + this.get("_id")
        }, callbacks, this)
    }
    
}

Platforms.prototype.destroy = function(callbacks) {
    if(this.get("_id")) {
        this.synergykit.request({
            method: "DELETE",
            endpoint: this.endpoint + "/me/platforms/" + this.get("_id")
        }, callbacks, this)
    }else{
        this.synergykit.request({
            method: "DELETE",
            endpoint: this.endpoint + "/me/platforms"
        }, callbacks, this)
    }    
}

module.exports.Platforms = Platforms