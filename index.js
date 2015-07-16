var Synergykit = require("./lib/synergykit").Synergykit
module.exports = Synergykit


Synergykit.Init("synergykit-sample-app", "83c04c28-4b6b-4f86-a4f8-ab357ead768c", {
    debug: true,
    local: true,
    strategy: "sockets"
})
var gameScore = Synergykit.Data("GameScore")
gameScore.on("created", function(data) {
    console.log(data.get("score"))
})