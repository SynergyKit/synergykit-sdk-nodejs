module.exports = require("./lib/synergykit").Synergykit
var Synergykit = require("./lib/synergykit").Synergykit

var doubleBlink = function() {
    led1.toggle()
    setTimeout(function() {
        led1.toggle()
        setTimeout(function() {
            led1.toggle()
            setTimeout(function() {
                led1.toggle()
            }, 100)
        }, 100)
    }, 100)


}
Synergykit.Init("synergykit-sample-app", "83c04c28-4b6b-4f86-a4f8-ab357ead768c", {
    debug: true,
    api: "http://172.22.0.104:5078",
    socketApi: "ws://172.22.0.104:5078"
})
var user = Synergykit.User()
user.set("authData", {
    anonymous: {}
})
user.save({
    success: function() {
        var data = Synergykit.Data("messages")
        data.on("created", function(data) {
            console.log(data.get())
            doubleBlink()
        })
    }
})