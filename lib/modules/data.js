var SynergykitObject = require("../object"),
    util = require("util"),
    Errors = require("../errors"),
    urlify = require("urlify").create({
        spaces: "-",
        nonPrintable: "_",
        toLower: true,
        trim: true
    }),
    _ = require("../underscore/underscore.js")

function Data(collection, synergykit) {
    Data.super_.apply(this, arguments)
    this.synergykit = synergykit
    this.collection = urlify(collection)
    this.endpoint = "/data/" + urlify(collection)
    this.query = {}
}

Data.super_ = SynergykitObject

Data.prototype = Object.create(SynergykitObject.prototype, {
    constructor: {
        value: Data,
        enumarable: false
    }
})

Data.prototype.fetch = function(callbacks) {
    if (this.synergykit.strategy == "sockets") {
        this.synergykit.socketGet(this, null, callbacks)
    } else {
        this.synergykit.request({
            method: "GET",
            endpoint: this.endpoint + "/" + this.get("_id")
        }, callbacks, this)
    }

}

Data.prototype.save = function(callbacks) {
    if (this.synergykit.strategy == "sockets") {
        if (this.get("_id") && this.get("__v") !== undefined) {
            this.synergykit.socketUpdate(this, callbacks)
        } else {
            this.synergykit.socketCreate(this, callbacks)
        }
    } else {
        if (this.get("_id") && this.get("__v") !== undefined) {
            this.synergykit.request({
                method: "PUT",
                endpoint: this.endpoint + "/" + this.get("_id")
            }, callbacks, this)
        } else {
            this.synergykit.request({
                method: "POST",
                endpoint: this.endpoint
            }, callbacks, this)
        }
    }

}

Data.prototype.destroy = function(callbacks) {
    if (this.synergykit.strategy == "sockets") {
        this.synergykit.socketDestroy(this, callbacks)
    } else {
        if (this.get("_id")) {
            this.synergykit.request({
                method: "DELETE",
                endpoint: this.endpoint + "/" + this.get("_id")
            }, callbacks, this)
        } else {
            this.synergykit.request({
                method: "DELETE",
                endpoint: this.endpoint
            }, callbacks, this)
        }
    }
}

Data.prototype.addAccess = function(user_id, callbacks) {
    if (user_id instanceof this.synergykit.modules.Users) {
        user_id = user_id.get("_id")
    }
    this.synergykit.request({
        method: "POST",
        endpoint: this.endpoint + "/" + this.get("_id") + "/" + user_id
    }, callbacks, this)
}

Data.prototype.removeAccess = function(user_id, callbacks) {
    if (user_id instanceof this.synergykit.modules.Users) {
        user_id = user_id.get("_id")
    }
    this.synergykit.request({
        method: "DELETE",
        endpoint: this.endpoint + "/" + this.get("_id") + "/" + user_id
    }, callbacks, this)
}



Data.prototype.saveHTTP = function(callbacks) {
    if (this.get("_id") && this.get("__v") !== undefined) {
        this.synergykit.request({
            method: "PUT",
            endpoint: this.endpoint + "/" + this.get("_id")
        }, callbacks, this)
    } else {
        this.synergykit.request({
            method: "POST",
            endpoint: this.endpoint
        }, callbacks, this)
    }
}

Data.prototype.destroyHTTP = function(callbacks) {
    if (this.get("_id")) {
        this.synergykit.request({
            method: "DELETE",
            endpoint: this.endpoint + "/" + this.get("_id")
        }, callbacks, this)
    } else {
        this.synergykit.request({
            method: "DELETE",
            endpoint: this.endpoint
        }, callbacks, this)
    }
}

Data.prototype.on = function(eventName, filter, callback) {
    var options = {
        eventName: eventName
    }
    if (_.isFunction(filter)) {
        callback = filter
    } else {
        if (filter) {
            options.filter = {
                name: filter.name,
                query: filter.query["$filter"]
            }
        }

    }
    this.synergykit.subscribe(options, this, callback)
}

Data.prototype.speak = function(eventName, data) {
    if (!data) {
        data = {}
    }
    this.synergykit.speak(eventName, data, this)
}

Data.prototype.off = function(eventName, filter, callback) {
    var options = {
        eventName: eventName
    }
    if (_.isFunction(filter)) {
        callback = filter
    } else if (_.isObject(filter)) {
        options.filter = filter
    }
    this.synergykit.unsubscribe(options, this)
}


module.exports.Data = Data