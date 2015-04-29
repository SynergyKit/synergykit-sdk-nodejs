var SynergykitObject = require("../object"),
    util = require("util"),    
    Errors = require("../errors"),
    urlify = require("urlify").create({
        spaces: "-",
        nonPrintable: "_",
        toLower: true,
        trim: true
    })

function Users(synergykit) {
    Users.super_.apply(this, arguments)
    this.synergykit = synergykit
    this.endpoint = "/users"
    this.query = {}
}

Users.super_ = SynergykitObject

Users.prototype = Object.create(SynergykitObject.prototype, {
    constructor: {
        value: Users,
        enumarable: false
    }
})

Users.prototype.save = function(callbacks) {
    if(this.get("_id") && this.get("__v") !== undefined) {
        this.synergykit.request({
            method:  "PUT",
            endpoint: this.endpoint + "/" + this.get("_id")
        }, callbacks, this)
    }else{
        this.synergykit.request({
            method:  "POST",
            endpoint: this.endpoint
        }, callbacks, this)
    }    
}

Users.prototype.fetch = function(callbacks) {
    this.synergykit.request({
        method: "GET",
        endpoint: this.endpoint + "/" + this.get("_id")
    }, callbacks, this)
}

Users.prototype.login = function(callbacks) {
    if(!this.get("email")) {
        throw Errors.NO_EMAIL
    }else if(!this.get("password")) {
        throw Errors.NO_PASSWORD
    }else{
        this.synergykit.request({
            method: "POST",
            endpoint: this.endpoint + "/login"
        }, callbacks, this)
    }    
}

Users.prototype.addRole = function(role, callbacks) {
    this.synergykit.request({
        method: "POST",
        body: {
            role: role
        },
        endpoint: this.endpoint + "/" + this.get("_id") + "/roles"
    }, callbacks, this)
}

Users.prototype.removeRole = function(role, callbacks) {
    this.synergykit.request({
        method: "DELETE",
        endpoint: this.endpoint + "/" + this.get("_id") + "/roles/" + role
    }, callbacks, this)
}

Users.prototype.updateRoles = function(callbacks) {
    this.synergykit.request({
        method: "PUT",
        endpoint: this.endpoint + "/" + this.get("_id") + "/roles"
    }, callbacks, this)
}

Users.prototype.destroy = function(callbacks) {
    if(this.get("_id")) {
        this.synergykit.request({
            method: "DELETE",
            endpoint: this.endpoint + "/" + this.get("_id")
        }, callbacks, this)
    }else{
        this.synergykit.request({
            method: "DELETE",
            endpoint: this.endpoint
        }, callbacks, this)
    }    
}

module.exports.Users = Users