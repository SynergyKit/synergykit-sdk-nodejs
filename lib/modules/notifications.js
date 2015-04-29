var SynergykitObject = require("../object")

function Notifications(userIds, synergykit) {
    Notifications.super_.apply(this, arguments)
    this.synergykit = synergykit
    this.userIds = userIds
    this.endpoint = "/users/notification"
}

Notifications.super_ = SynergykitObject

Notifications.prototype = Object.create(SynergykitObject.prototype, {
    constructor: {
        value: Notifications,
        enumarable: false
    }
})

Notifications.prototype.send = function(callbacks) {
    this.set("userIds", this.userIds)
    this.synergykit.request({
        method:  "POST",
        body: this.get(),
        endpoint: this.endpoint
    }, callbacks)
}


module.exports.Notifications = Notifications