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

Users.prototype.fetch = function(callbacks) {
    this.synergykit.request({
        method: "GET",
        endpoint: this.endpoint + "/" + this.get("_id")
    }, callbacks, this)
}

Users.prototype.login = function(callbacks) {
    if (!this.get("email")) {
        throw Errors.NO_EMAIL
    } else if (!this.get("password")) {
        throw Errors.NO_PASSWORD
    } else {
        this.synergykit.request({
            method: "POST",
            endpoint: this.endpoint + "/login"
        }, callbacks, this)
    }
}

var facebook = function(callbacks) {
    if (!this.get("authData")) {
        throw Errors.NO_AUTH_DATA
    } else {
        var authData = this.get("authData")
        if (!authData.facebook) {
            throw Errors.NO_FACEBOOK_DATA
        } else {
            var facebook = authData.facebook
            if (!facebook.id) {
                throw Errors.NO_FACEBOOK_ID
            } else if (!facebook.accessToken) {
                throw Errors.NO_FACEBOOK_ACCESS_TOKEN
            } else {
                this.synergykit.request({
                    method: "POST",
                    endpoint: this.endpoint
                }, callbacks, this)
            }
        }
    }
}

Users.prototype.facebookLogin = facebook
Users.prototype.facebookRegistration = facebook

var twitter = function(callbacks) {
    if (!this.get("authData")) {
        throw Errors.NO_AUTH_DATA
    } else {
        var authData = this.get("authData")
        if (!authData.twitter) {
            throw Errors.NO_TWITTER_DATA
        } else {
            var twitter = authData.twitter
            if (!twitter.id) {
                throw Errors.NO_TWITTER_ID
            } else if (!twitter.screenName) {
                throw Errors.NO_TWITTER_SCREEN_NAME
            } else if (!twitter.consumerKey) {
                throw Errors.NO_TWITTER_CONSUMER_KEY
            } else if (!twitter.consumerSecret) {
                throw Errors.NO_TWITTER_CONSUMER_SECRET
            } else if (!twitter.authToken) {
                throw Errors.NO_TWITTER_AUTH_TOKEN
            } else if (!twitter.authTokenSecret) {
                throw Errors.NO_TWITTER_AUTH_TOKEN_SECRET
            } else {
                this.synergykit.request({
                    method: "POST",
                    endpoint: this.endpoint
                }, callbacks, this)
            }
        }
    }
}

Users.prototype.twitterLogin = twitter
Users.prototype.twitterRegistration = twitter

var google = function(callbacks) {
    if (!this.get("authData")) {
        throw Errors.NO_AUTH_DATA
    } else {
        var authData = this.get("authData")
        if (!authData.google) {
            throw Errors.NO_GOOGLE_DATA
        } else {
            var google = authData.google
            if (!google.id) {
                throw Errors.NO_GOOGLE_ID
            } else {
                this.synergykit.request({
                    method: "POST",
                    endpoint: this.endpoint
                }, callbacks, this)
            }
        }
    }
}

Users.prototype.googleLogin = google
Users.prototype.googleRegistration = google

Users.prototype.anonymousLogin = function(callbacks) {
    if (!this.get("authData")) {
        throw Errors.NO_AUTH_DATA
    } else {
        var authData = this.get("authData")
        if (!authData.anonymous) {
            throw Errors.NO_ANONYMOUS_DATA
        } else {
            this.synergykit.request({
                method: "POST",
                endpoint: this.endpoint
            }, callbacks, this)
        }
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

Users.prototype.resetPassword = function(callbacks) {
    this.synergykit.request({
        method: "POST",
        endpoint: this.endpoint + "/reset-password/" + this.get("_id")
    }, callbacks, this)
}

Users.prototype.changePassword = function(callbacks) {
    if (!this.get("old_password")) {
        throw Errors.NO_OLD_PASSWORD
    } else if (!this.get("password")) {
        throw Errors.NO_PASSWORD
    } else {
        this.synergykit.request({
            method: "POST",
            endpoint: this.endpoint + "/me/change-password"
        }, callbacks, this)
    }
}

Users.prototype.destroy = function(callbacks) {
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

module.exports.Users = Users