var SynergykitObject = require("../object"),
    util = require("util"),    
    Errors = require("../errors")

function Logs(path, synergykit) {
    Logs.super_.apply(this, arguments)
    this.synergykit = synergykit
    this.endpoint = "/logs"
}

Logs.super_ = SynergykitObject

Logs.prototype = Object.create(SynergykitObject.prototype, {
    constructor: {
        value: Logs,
        enumarable: false
    }
})

exports.Logs = Logs