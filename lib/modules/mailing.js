var SynergykitObject = require("../object"),
    util = require("util"),    
    Errors = require("../errors")

function Mailing(url, synergykit) {
    Mailing.super_.apply(this, arguments)
    this.synergykit = synergykit
    this.url = url
    this.endpoint = "/mailing"
}

Mailing.super_ = SynergykitObject

Mailing.prototype = Object.create(SynergykitObject.prototype, {
    constructor: {
        value: Mailing,
        enumarable: false
    }
})

Mailing.prototype.send = function(callbacks) {
    if(!this.url) {
        throw Errors.NO_URL
    }else if(!this.get("email")){
        throw Errors.NO_EMAIL
    }else if(!this.get("subject")) {
        throw Errors.NO_SUBJECT
    }else{
        this.synergykit.request({
            method:  "POST",
            body: this.get(),
            endpoint: "/mail/" + this.url
        }, callbacks)       
    }
}

exports.Mailing = Mailing