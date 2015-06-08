var SynergykitObject = require("../object"),
    util = require("util"),    
    Errors = require("../errors"),
    fs = require("fs"),
    FormData = require("form-data")

function Files(path, name, synergykit) {
    Files.super_.apply(this, arguments)
    this.name = name
    this.path = path
    this.synergykit = synergykit
    this.endpoint = "/files"
}

Files.super_ = SynergykitObject

Files.prototype = Object.create(SynergykitObject.prototype, {
    constructor: {
        value: Files,
        enumarable: false
    }
})

Files.prototype.upload = function(callbacks) {
    if(!this.path) {
        throw Errors.NO_PATH
    }else{
        var form = new FormData()
        form.append("file", fs.createReadStream(this.path))
        if(this.name) {
            form.append("name", this.name)
        }
        this.synergykit.request({
            method:  "POST",
            formData: form,
            endpoint: this.endpoint
        }, callbacks, this)       
    }
}

Files.prototype.addAccess = function(user_id, callbacks) {
    if(user_id instanceof this.synergykit.modules.Users) {
        user_id = user_id.get("_id")
    }
    this.synergykit.request({
        method: "POST",
        endpoint: this.endpoint + "/" + this.get("_id") + "/" + user_id
    }, callbacks, this)
}

Files.prototype.removeAccess = function(user_id, callbacks) {
    if(user_id instanceof this.synergykit.modules.Users) {
        user_id = user_id.get("_id")
    }
    this.synergykit.request({
        method: "DELETE",
        endpoint: this.endpoint + "/" + this.get("_id") + "/" + user_id
    }, callbacks, this)
}

Files.prototype.fetch = function(callbacks) {
    this.synergykit.request({
        method: "GET",
        endpoint: this.endpoint + "/" + this.get("_id")
    }, callbacks, this)
}

Files.prototype.destroy = function(callbacks) {
    if(this.get("_id")) {
        this.synergykit.request({
            method: "DELETE",
            endpoint: this.endpoint + "/" + this.get("_id")
        }, callbacks, this)
    }else{
        throw Errors.NO_ID
    }    
}

module.exports.Files = Files