var Synergykit = require("../index"),
    assert = require("assert"),
    TENANT = "synergykit-sample-app",
    KEY = "83c04c28-4b6b-4f86-a4f8-ab357ead768c",
    COLLECTION = "example",
    DATA = null,
    DATA2 = null,
    clientKey = false

if (clientKey) {
    KEY = "a03f2ee1-59e2-463d-a30b-02920075f530"
}

describe("Synergykit", function() {
    describe("Initialization", function() {
        it("should return intialization credentials", function() {
            Synergykit.Init(TENANT, KEY, {
                debug: true,
                local: true
            })
            assert.equal(Synergykit.tenant, TENANT)
            assert.equal(Synergykit.key, KEY)
        })
    })

    describe("create data", function() {
        it("should return created data with code", function(done) {
            var gameScore = Synergykit.Data("GameScore")
            gameScore.set("score", 1337)
            gameScore.save({
                success: function(gameScoreResult) {
                    DATA = gameScoreResult
                    assert.equal(gameScoreResult.get("score"), 1337)
                    done()
                }
            })
        })
    })

    describe("create data", function() {
        it("should return created data with code", function(done) {
            var gameScore = Synergykit.Data("GameScore")
            gameScore.set("score", 1337)
            gameScore.save({
                success: function(gameScoreResult) {
                    assert.equal(gameScoreResult.get("score"), 1337)
                    done()
                }
            })
        })
    })

    describe("fetch data", function() {
        it("should return fetched data with code", function(done) {
            DATA.fetch({
                success: function(result) {
                    assert.equal(result.get("score"), 1337)
                    done()
                }
            })
        })
    })

    describe("get data", function() {
        it("should return got data with code", function(done) {
            var gameScore = Synergykit.Data("GameScore")
            var query = Synergykit.Query(gameScore)
            query.find({
                success: function(results) {
                    assert.equal(results.length, 2)
                    done()
                }
            })
        })
    })

    describe("destroy data", function() {
        it("should return got data with code", function(done) {
            var gameScore = Synergykit.Data("GameScore")
            gameScore.destroy({
                success: function(results) {
                    done()
                }
            })
        })
    })
})