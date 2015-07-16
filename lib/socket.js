var WebSocketClient = require('./websocket/index.js').client,
    client = new WebSocketClient(),
    socket = null,
    connection = null,
    queue = [],
    listeners = {},
    attemps = 0,
    maxAttemps = 10,
    _ = require("./underscore/underscore.js"),
    Data = require("./modules/data.js").Data



var connect = function(data) {
    connection = null
    if (attemps < maxAttemps) {
        setTimeout(function() {
            client.connect(data.synergykit.socketApi, "echo-protocol")
        }, 1000 * attemps)
        attemps++
    }
}

var checkConnection = function(data) {

    if (connection == null) {
        connect(data)
        client.on('connectFailed', function(error) {
            if (data.synergykit.debug) {
                console.log('Connect Error: ' + error.toString());
            }
            connect(data)
        });

        client.on('connect', function(conn) {
            attemps = 0
            connection = conn
            if (data.synergykit.debug) {
                console.log("Connected")
            }
            connection.on('error', function(error) {
                if (data.synergykit.debug) {
                    console.log("Connection Error: " + error.toString());
                }
            });
            connection.on('close', function() {
                if (data.synergykit.debug) {
                    console.log("Disconnected")
                }
                connect(data)
                _.each(queue, function(listener) {
                    listener()
                })
            });
            connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    try {
                        message = JSON.parse(message.utf8Data)
                    } catch (e) {
                        console.log(e.message)
                    }
                    if (listeners[message.event]) {
                        listeners[message.event](message.data)
                    }

                }
            });
        });
    }
}

var unsubscribed = function(data) {
    if (data.synergykit.debug && data) {
        console.log("Unsubscribed from collection '" + data.collection + "', event '" + data.message)
    }
}

var err = function(data) {
    if (data.synergykit.debug && data) {
        console.log("Error: " + data.message)
    }
}

var send = function(data) {
    if (connection && connection.connected) {
        connection.sendUTF(JSON.stringify(data))
    } else {
        setTimeout(function() {
            send(data)
        }, 1000)
    }
}

listeners.unsubscribed = unsubscribed
listeners.err = err

var addListener = function(data) {
    checkConnection(data)
    var name
    if (data.object) {
        if (data.filter && data.filter.name && data.filter.query) {
            name = data.eventName + "_" + data.object.collection + "_" + data.filter.name
            var listener = function() {
                send({
                    event: "subscribe",
                    data: {
                        tenant: data.synergykit.tenant,
                        key: data.synergykit.key,
                        token: data.synergykit.token,
                        filter: data.filter,
                        eventName: data.eventName,
                        collectionName: data.object.collection
                    }
                })
            }
            listener()
            queue.push(listener)

            listeners[name] = function(result) {
                if (data && data.object) {
                    data.object.set(result)
                    data.callback(data.object)
                } else {
                    data.callback(result)
                }

            }
            listeners["subscribed_" + name] = function() {
                if (data.synergykit.debug) {
                    console.log("Subscribed to collection '" + data.object.collection + "', event '" + data.eventName + "', filter '" + data.filter.name)
                }
            }
        } else {
            name = data.eventName + "_" + data.object.collection
            var listener = function() {
                send({
                    event: "subscribe",
                    data: {
                        tenant: data.synergykit.tenant,
                        key: data.synergykit.key,
                        token: data.synergykit.token,
                        eventName: data.eventName,
                        collectionName: data.object.collection
                    }
                })
            }
            listener()
            queue.push(listener)
            listeners[name] = function(result) {
                if (data && data.object) {
                    data.object.set(result)
                    data.callback(data.object)
                } else {
                    data.callback(result)
                }

            }
            listeners["subscribed_" + name] = function() {
                if (data.synergykit.debug) {
                    console.log("Subscribed to collection '" + data.object.collection + "', event '" + data.eventName)
                }
            }
        }
    } else {
        name = data.eventName
        var listener = function() {
            send({
                event: "subscribe",
                data: {
                    tenant: data.synergykit.tenant,
                    key: data.synergykit.key,
                    token: data.synergykit.token,
                    eventName: data.eventName
                }
            })
        }
        listener()
        queue.push(listener)
        listeners[data.eventName] = function(result) {
            if (data && data.object) {
                data.object.set(result)
                data.callback(data.object)
            } else {
                data.callback(result)
            }

        }
        listeners["subscribed_" + name] = function() {
            if (data.synergykit.debug) {
                console.log("Subscribed to event '" + name)
            }
        }
    }
}

var removeListener = function(data) {
    var name
    checkConnection(data)
    if (data.object) {
        if (data.filter) {
            name = data.eventName + "_" + data.object.collection + "_" + data.filter.name
            delete listeners[name]
            var listener = function() {
                send({
                    event: "unsubscribe",
                    data: {
                        tenant: data.synergykit.tenant,
                        key: data.synergykit.key,
                        token: data.synergykit.token,
                        filter: data.filter,
                        eventName: data.eventName,
                        collectionName: data.object.collection
                    }
                })
            }
            listener()
            queue.push(listener)
            listeners["unsubscribed_" + name] = function() {
                if (data.synergykit.debug) {
                    console.log("Unsubscribed from collection '" + data.object.collection + "', event '" + data.eventName + "', filter '" + data.filter.name)
                }
            }
        } else {
            name = data.eventName + "_" + data.object.collection
            delete listeners[name]
            var listener = function() {
                send({
                    event: "unsubscribe",
                    data: {
                        tenant: data.synergykit.tenant,
                        key: data.synergykit.key,
                        token: data.synergykit.token,
                        eventName: data.eventName,
                        collectionName: data.object.collection
                    }
                })
            }
            listener()
            queue.push(listener)
            listeners["unsubscribed_" + name] = function() {
                if (data.synergykit.debug) {
                    console.log("Unsubscribed from collection '" + data.object.collection + "', event '" + data.eventName)
                }
            }
        }
    } else {
        name = data.eventName
        delete listeners[name]
        var listener = function() {
            send({
                event: "unsubscribe",
                data: {
                    tenant: data.synergykit.tenant,
                    key: data.synergykit.key,
                    token: data.synergykit.token,
                    eventName: data.eventName,
                }
            })
        }
        listener()
        queue.push(listener)
        listeners["unsubscribed_" + name] = function() {
            if (data.synergykit.debug) {
                console.log("Unsubscribed from event '" + data.eventName)
            }
        }
    }
}

var successCallback = function(data, result) {
    var callback
    if (data && data.object) {
        if (_.isArray(result)) {
            response = []
            for (var i in result) {
                var clonedObject = null
                if (data.object instanceof data.synergykit.modules.Data) {
                    clonedObject = data.synergykit.Data(data.object.collection)
                }
                clonedObject.set(result[i])
                response.push(clonedObject)
            }
            callback = response
        } else {
            data.object.set(result)
            callback = data.object
        }
    } else {
        callback = result
    }
    if (typeof data.callback === "function") {
        data.callback(null, callback, 200)
    } else if (data.callback && typeof data.callback.success === "function") {
        data.callback.success(callback, 200)
    }
}
var errorCallback = function(data, result) {
    var callback
    if (data && data.object) {

        data.object.set(result)
        callback = data.object

    } else {
        callback = result
    }
    if (typeof data.callback === "function") {
        data.callback(result, null, 400)
    } else if (data.callback && typeof data.callback.error === "function") {
        data.callback.error(callback, 400)
    }
}

exports.get = function(data) {
    checkConnection(data)
    var hash = (Math.random() * new Date().getTime()).toString(36).substring(2, 10);
    var listener = function() {
        send({
            event: "get",
            data: {
                tenant: data.synergykit.tenant,
                token: data.synergykit.token,
                key: data.synergykit.key,
                collectionName: data.object.collection,
                hash: hash,
                id: data.object.get("_id"),
                query: data.query
            }
        })
    }
    listener()
    listeners["got"] = function(result) {
        if (result.hash == hash) {
            successCallback(data, result.data)
        }

    }
    listeners["err"] = function(result) {
        if (result.hash == hash) {
            errorCallback(data, result.data)
        }
    }
}

exports.create = function(data) {
    checkConnection(data)
    var hash = (Math.random() * new Date().getTime()).toString(36).substring(2, 10);
    var listener = function() {
        send({
            event: "create",
            data: {
                tenant: data.synergykit.tenant,
                hash: hash,
                token: data.synergykit.token,
                key: data.synergykit.key,
                collectionName: data.object.collection,
                data: data.object.get()
            }
        })
    }
    listener()
    listeners["created"] = function(result) {
        if (result.hash == hash) {
            successCallback(data, result.data)
        }
    }
    listeners["err"] = function(result) {
        if (result.hash == hash) {
            errorCallback(data, result.data)
        }
    }
}

exports.update = function(data) {
    checkConnection(data)
    var hash = (Math.random() * new Date().getTime()).toString(36).substring(2, 10);
    var listener = function() {
        send({
            event: "update",
            data: {
                tenant: data.synergykit.tenant,
                hash: hash,
                token: data.synergykit.token,
                key: data.synergykit.key,
                collectionName: data.object.collection,
                id: data.object.get("_id"),
                data: data.object.get()
            }
        })
    }
    listener()
    listeners["updated"] = function(result) {
        if (result.hash == hash) {
            successCallback(data, result.data)
        }
    }
    listeners["err"] = function(result) {
        if (result.hash == hash) {
            errorCallback(data, result.data)
        }
    }
}

exports.destroy = function(data) {
    checkConnection(data)
    var hash = (Math.random() * new Date().getTime()).toString(36).substring(2, 10);
    var dataObject = {
        tenant: data.synergykit.tenant,
        hash: hash,
        token: data.synergykit.token,
        key: data.synergykit.key,
        collectionName: data.object.collection
    }
    if (data.object.get("_id")) {
        dataObject.id = data.object.get("_id")
    }
    var listener = function() {
        send({
            event: "delete",
            data: dataObject
        })
    }
    listener()
    listeners["deleted"] = function(result) {
        if (result.hash == hash) {
            successCallback(data, result.data)
        }
    }
    listeners["err"] = function(result) {
        if (result.hash == hash) {
            errorCallback(data, result.data)
        }
    }
}

exports.speak = function(data) {
    checkConnection(data)
    var listener = function() {
        send({
            event: "speak",
            data: {
                tenant: data.synergykit.tenant,
                token: data.synergykit.token,
                speakName: data.speakName,
                data: data.data
            }
        })
    }
    listener()
    queue.push(listener)
}

exports.addListener = addListener
exports.removeListener = removeListener