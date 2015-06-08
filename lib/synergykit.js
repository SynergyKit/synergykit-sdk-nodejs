var https = require("https"),
    http = require("http"),
    request = https.request,
    qs = require("querystring"),
    fs = require("fs"),
    Query = require("./query"),
    Errors = require("./errors"),
    SynergykitObject = require("./object"),
    _ = require("./underscore/underscore.js"),
    socket = require("./socket"),
    urlify = require("urlify").create({
        spaces: "-",
        nonPrintable: "_",
        toLower: true,
        trim: true
    })

var synergykitBasicApi = "%s.api.synergykit.com"
var synergykitApiVersion = "/v2.1"
    /*var Synergykit = function(options) {
        Synergykit.tenant = options.tenant
        Synergykit.key = options.key
        Synergykit.debug = options.debug || false
        Synergykit.api = "https://%s.api.synergykit.com/v2"
        if(options.api) {
            Synergykit.api = options.api
        }
        if(options.errorCallback) {
            Synergykit.errorCallback = options.errorCallback
        }
    }*/

var Synergykit = {
    tenant: null,
    key: null,
    token: null,
    debug: false,
    local: false,
    api: "",
    modules: {},
    batches: []
}

Synergykit.Init = function(tenant, key, options) {
    options = options || {}
    Synergykit.tenant = urlify(tenant)
    Synergykit.key = key
    Synergykit.debug = options.debug || false
    Synergykit.api = synergykitBasicApi.replace("%s", Synergykit.tenant)
    Synergykit.socketApi = "wss://" + synergykitBasicApi.replace("%s", Synergykit.tenant)
    if (options.local) {
        request = http.request
        Synergykit.local = true
        Synergykit.api = "localhost"
        Synergykit.socketApi = "ws://localhost:5078"
    }

    if (options.errorCallback) {
        Synergykit.errorCallback = options.errorCallback
    }
    return Synergykit
}



Synergykit.modules.Query = Query
Synergykit.modules.Data = require("./modules/data.js").Data
Synergykit.modules.Files = require("./modules/files.js").Files
Synergykit.modules.Functions = require("./modules/functions.js").Functions
Synergykit.modules.Logs = require("./modules/logs.js").Logs
Synergykit.modules.Mailing = require("./modules/mailing.js").Mailing
Synergykit.modules.Notifications = require("./modules/notifications.js").Notifications
Synergykit.modules.Platforms = require("./modules/platforms.js").Platforms
Synergykit.modules.Users = require("./modules/users.js").Users

exports.Synergykit = Synergykit



/*
 *  Main function for making requests to the API.  Can be called directly.
 *
 *  options object:
 *  `method` - http method (GET, POST, PUT, or DELETE), defaults to GET
 *  `qs` - object containing querystring values to be appended to the uri
 *  `body` - object containing entity body for POST and PUT requests
 *  `endpoint` - API endpoint, for example '/users'
 *
 *  @method request
 *  @public
 *  @params {object} options
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
Synergykit.request = function(options, callbacks, object) {
    if (callbacks == undefined) {
        Synergykit.batches.push({
            options: options,
            object: object
        })
    } else {
        var method = options.method || "GET"
        var endpoint = options.endpoint || ""
        var body = {}
        if (object && object instanceof SynergykitObject) {
            body = object.data
        }
        if (options.body) {
            body = options.body
        }

        var queryString = ""
        if (options.query) {
            var counter = 0
            _.each(options.query, function(q, i) {
                if (counter == 0) {
                    queryString += "?"
                } else {
                    queryString += "&"
                }
                queryString += i + "=" + q
                counter++
            })
        }
        //queryString = qs.stringify(queryString)
        var postData = JSON.stringify(body)
        var hostname = Synergykit.api
        var uri = synergykitApiVersion + endpoint
        if (Synergykit.debug) {
            console.log('calling: ' + method + ' ' + uri + queryString);
        }
        Synergykit._start = new Date().getTime()
        var callOptions = {
            method: method,
            hostname: hostname,
            path: uri + queryString,
            auth: Synergykit.tenant + ":" + Synergykit.key
        }
        if (Synergykit.local) {
            callOptions.port = 5078
        }
        callOptions.headers = {
            "content-type": "application/json",
            "content-length": Buffer.byteLength(postData)
        }

        if (Synergykit.token) {
            callOptions.headers.sessiontoken = Synergykit.token
        }
        var parseResult = function(res) {
            res.setEncoding("utf8")
            var responseString = ""
            res.on("data", function(data) {
                responseString += data
            })
            res.on("end", function() {
                try {
                    var result = JSON.parse(responseString)
                    var statusCode = res.statusCode ? res.statusCode : 500
                    Synergykit._end = new Date().getTime()
                    if (statusCode == 200) {
                        if (Synergykit.debug) {
                            console.log('Success (time: ' + Synergykit.calcTimeDiff() + '): ' + method + ' ' + uri + queryString);
                        }

                        if (callbacks && typeof(callbacks.success) === "function") {
                            if (object instanceof SynergykitObject) {
                                var response = null
                                if (result) {
                                    if (_.isArray(result)) {
                                        if (result.length > 0) {
                                            response = []
                                            for (var i in result) {
                                                var clonedObject = null
                                                if (object instanceof Synergykit.modules.Data) {
                                                    clonedObject = Synergykit.Data(object.collection)
                                                } else if (object instanceof Synergykit.modules.Files) {
                                                    clonedObject = Synergykit.modules.File(object.path)
                                                } else if (object instanceof Synergykit.modules.Functions) {
                                                    clonedObject = Synergykit.CloudCode(object.url)
                                                } else if (object instanceof Synergykit.modules.Logs) {

                                                } else if (object instanceof Synergykit.modules.Mailing) {
                                                    clonedObject = Synergykit.Mail(object.url)
                                                } else if (object instanceof Synergykit.modules.Platforms) {
                                                    clonedObject = Synergykit.Platform(object.user_id)
                                                } else if (object instanceof Synergykit.modules.Users) {
                                                    clonedObject = Synergykit.User()
                                                }
                                                clonedObject.set(result[i])
                                                response.push(clonedObject)
                                            }
                                        } else {
                                            response = result
                                        }
                                    } else {
                                        if (object instanceof Synergykit.modules.Users && result.sessionToken) {
                                            Synergykit.token = result.sessionToken
                                            object.synergykit = Synergykit
                                        }
                                        if (_.isNumber(result)) {
                                            result = {
                                                count: result
                                            }
                                        }
                                        object.set(result)
                                        response = object
                                    }
                                }
                                try {
                                    callbacks.success(response, statusCode)
                                } catch (e) {
                                    console.error(e.stack)
                                    if (Synergykit.errorCallback) {
                                        Synergykit.errorCallback({
                                            status: "error",
                                            code: "SKIT01-001",
                                            message: e.message
                                        })
                                    }
                                }
                            } else {
                                try {
                                    callbacks.success(result, statusCode)
                                } catch (e) {
                                    console.error(e.stack)
                                    if (Synergykit.errorCallback) {
                                        Synergykit.errorCallback({
                                            status: "error",
                                            code: "SKIT01-001",
                                            message: e.message
                                        })
                                    }
                                }

                            }
                        } else {
                            //throw Errors.NO_SUCCESS_CALLBACK 
                        }
                    } else {
                        err = true
                        var code = result && result.code ? result.code : "SKIT01-001"
                        var message = result && result.message ? result.message : ""
                        if (Synergykit.debug) {
                            console.log('Error (' + statusCode + ')(' + code + '): ' + message);
                        }
                        if (callbacks && typeof(callbacks.error) === "function") {
                            try {
                                callbacks.error(result, statusCode)
                            } catch (e) {
                                console.error(e.stack)
                                if (Synergykit.errorCallback) {
                                    Synergykit.errorCallback({
                                        status: "error",
                                        code: "SKIT01-001",
                                        message: e.message
                                    })
                                }
                            }
                        } else {
                            //throw Errors.NO_ERROR_CALLBACK 
                        }
                    }
                } catch (e) {
                    console.log(e)
                }
            })
        }
        if (options.formData) {
            _.each(options.formData.getHeaders(), function(header, index) {
                callOptions.headers[index] = header
            })
            options.formData.submit(callOptions, function(err, res) {
                parseResult(res)
            })
        } else {
            var req = request(callOptions, function(res) {
                parseResult(res)
            })



            req.on("error", function(e) {
                console.log(e.message)
            })

            req.write(postData)
            req.end()
        }

    }
}

Synergykit.runBatch = function(callbacks) {
    var method = "POST"
    var endpoint = "/batch"
    var body = []
    for (var i in Synergykit.batches) {
        var batch = Synergykit.batches[i]
        var queryString = ""
        if (batch.options.query) {
            var qs = batch.options.query || {}
            var counter = 0
            for (var j in qs) {
                if (counter == 0) {
                    queryString += "?"
                } else {
                    queryString += "&"
                }
                queryString += j + "=" + qs[j]
                counter++
            }
        }
        body.push({
            id: parseInt(i),
            method: batch.options.method,
            endpoint: batch.options.endpoint + queryString,
            body: batch.options.body ? batch.options.body : batch.object.get()
        })
    }

    var postData = JSON.stringify(body)
    var hostname = Synergykit.api
    var uri = synergykitApiVersion + endpoint
    if (Synergykit.debug) {
        console.log('calling: ' + method + ' ' + uri);
    }
    Synergykit._start = new Date().getTime()
    var callOptions = {
        method: method,
        hostname: hostname,
        path: uri + queryString,
        auth: Synergykit.tenant + ":" + Synergykit.key
    }
    if (Synergykit.local) {
        callOptions.port = 5078
    }
    callOptions.headers = {
        "content-type": "application/json",
        "content-length": Buffer.byteLength(postData)
    }
    if (Synergykit.token) {
        callOptions.headers.sessiontoken = Synergykit.token
    }


    var req = request(callOptions, function(res) {
        res.setEncoding("utf8")
        var responseString = ""
        res.on("data", function(data) {
            responseString += data
        })
        res.on("end", function() {
            try {
                var results = JSON.parse(responseString)
                var statusCode = res.statusCode ? res.statusCode : 500
                Synergykit._end = new Date().getTime()
                if (statusCode == 200) {
                    if (Synergykit.debug) {
                        console.log('Success (time: ' + Synergykit.calcTimeDiff() + '): POST ' + uri);
                    }
                    if (callbacks && typeof(callbacks.success) === "function") {
                        var resultCallback = []
                        for (var i in results) {
                            var result = results[i]
                            if (result.statusCode == 200) {
                                if (Synergykit.batches[result.id] && Synergykit.batches[result.id].object instanceof SynergykitObject) {
                                    var object = Synergykit.batches[result.id].object
                                    var response = null
                                    var body = result.body
                                    if (body) {
                                        if (_.isArray(body)) {
                                            if (body.length > 0) {
                                                response = []
                                                for (var j in body) {
                                                    var clonedObject = null
                                                    if (object instanceof Synergykit.modules.Data) {
                                                        clonedObject = Synergykit.Data(object.collection)
                                                    } else if (object instanceof Synergykit.modules.Files) {
                                                        clonedObject = Synergykit.modules.File(object.path)
                                                    } else if (object instanceof Synergykit.modules.Functions) {
                                                        clonedObject = Synergykit.CloudCode(object.url)
                                                    } else if (object instanceof Synergykit.modules.Logs) {

                                                    } else if (object instanceof Synergykit.modules.Mailing) {
                                                        clonedObject = Synergykit.Mail(object.url)
                                                    } else if (object instanceof Synergykit.modules.Platforms) {
                                                        clonedObject = Synergykit.Platform(object.user_id)
                                                    } else if (object instanceof Synergykit.modules.Users) {
                                                        clonedObject = Synergykit.User()
                                                    }
                                                    clonedObject.set(body[j])
                                                    response.push(clonedObject)
                                                }
                                            } else {
                                                response = body
                                            }
                                        } else {
                                            if (object instanceof Synergykit.modules.Users && body.sessionToken) {
                                                Synergykit.token = body.sessionToken
                                                object.synergykit = Synergykit
                                            }
                                            object.set(body)
                                            response = object
                                        }
                                    }
                                    resultCallback.push(response)
                                }
                            } else {
                                resultCallback.push({
                                    status: result.status,
                                    code: result.code,
                                    message: result.message
                                })
                            }
                        }
                        Synergykit.batches = []
                        try {
                            callbacks.success(resultCallback, statusCode)
                        } catch (e) {
                            console.error(e.stack)
                            if (Synergykit.errorCallback) {
                                Synergykit.errorCallback({
                                    status: "error",
                                    code: "SKIT01-001",
                                    message: e.message
                                })
                            }
                        }
                    } else {
                        //throw Errors.NO_SUCCESS_CALLBACK 
                    }
                } else {
                    Synergykit.batches = []
                    err = true
                    var code = result && result.code ? result.code : "SKIT01-001"
                    var message = result && result.message ? result.message : ""
                    if (Synergykit.debug) {
                        console.log('Error (' + statusCode + ')(' + code + '): ' + message);
                    }
                    if (callbacks && typeof(callbacks.error) === "function") {
                        try {
                            callbacks.error(result, statusCode)
                        } catch (e) {
                            console.error(e.stack)
                            if (Synergykit.errorCallback) {
                                Synergykit.errorCallback({
                                    status: "error",
                                    code: "SKIT01-001",
                                    message: e.message
                                })
                            }
                        }
                    } else {
                        //throw Errors.NO_ERROR_CALLBACK 
                    }
                }
            } catch (e) {
                console.log(e.message)
            }
        })


    })

    req.on("error", function(e) {
        console.log(e.message)
    })

    req.write(postData)
    req.end()
}

Synergykit.Data = function(name) {
    var data = new Synergykit.modules.Data(name, Synergykit)
    return data
}

Synergykit.User = function() {
    var user = new Synergykit.modules.Users(Synergykit)
    return user
}

Synergykit.Notification = function(users) {
    var userIds = []
    if (_.isString(users)) {
        userIds.push(users)
    } else if (users instanceof SynergykitObject && users.get("_id")) {
        userIds.push(users.get("_id"))
    } else if (_.isArray(users)) {
        for (var i in users) {
            var user = users[i]
            if (user instanceof SynergykitObject && user.get("_id")) {
                userIds.push(user.get("_id"))
            } else if (_.isString(user)) {
                userIds.push(user)
            }
        }
    }
    if (userIds.length > 0) {
        var notification = new Synergykit.modules.Notifications(userIds, Synergykit)
        return notification
    } else {
        throw Errors.NO_USER_IDS
    }
}

Synergykit.Platform = function() {

    var platform = new Synergykit.modules.Platforms(Synergykit)
    return platform

}

Synergykit.CloudCode = function(url) {

    var functionData = new Synergykit.modules.Functions(url, Synergykit)
    return functionData
}

Synergykit.Mail = function(url) {

    var mail = new Synergykit.modules.Mailing(url, Synergykit)
    return mail

}

Synergykit.File = function(path, name) {
    var file = new Synergykit.modules.Files(path, name, Synergykit)
    return file
}

Synergykit.Query = function(object) {
    var query = new Synergykit.modules.Query(object, Synergykit)
    return query
}

Synergykit.on = function(eventName, callback) {
    socket.addListener({
        synergykit: Synergykit,
        eventName: eventName,
        callback: callback
    })
}
Synergykit.off = function(eventName) {
    socket.removeListener({
        eventName: eventName,
        synergykit: Synergykit
    })
}

Synergykit.subscribe = function(options, object, callback) {
    socket.addListener({
        synergykit: Synergykit,
        eventName: options.eventName,
        filter: options.filter,
        object: object,
        callback: callback
    })
}
Synergykit.unsubscribe = function(options, object) {
    socket.removeListener({
        eventName: options.eventName,
        filter: options.filter,
        synergykit: Synergykit,
        object: object
    })
}

Synergykit.speak = function(eventName, message) {
    socket.speak({
        synergykit: Synergykit,
        eventName: eventName,
        message: message
    })
}


/*
 *  A private method to get call timing of last call
 */
Synergykit.calcTimeDiff = function() {
    var time = Synergykit._end - Synergykit._start;
    return (time / 1000).toFixed(4);
}