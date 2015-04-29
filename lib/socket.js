var io = require("socket.io-client"),
    socket = null
    listeners = {},
    queueAdd = [],
    queueRemove = []

var checkConnection = function(data) {

    if(socket == null) {
        socket = io(data.synergykit.api, {
            secure: true
        })
        socket.on("connect", function() {
            if(data.synergykit.debug) {
                console.log("Connected " + socket.id)
            }
            for(var i in queueAdd) {
                addListener(queueAdd[i])
            }
            queueAdd = []
            for(var i in queueRemove) {
                removeListener(queueRemove[i])
            }
            queueRemove = []
        })        
        socket.on("unsubscribed", function(result) {
            if(data.synergykit.debug) {
                console.log("Unsubscribed from collection '" + result.collection + "', event '" + result.message + "' for socket " + socket.id)
            }        
        })
        socket.on("unauthorized", function(result) {
            if(data.synergykit.debug) {
                console.log("Unauthorized: " + result.message)
            }  
        })
        socket.on("disconnect", function() {
            if(data.synergykit.debug) {
                console.log("Disconnected")
            } 
            for(var i in listeners) {
                socket.removeAllListeners(i)
            }
            var tempListeners = listeners
            listeners = {}
            for(var i in tempListeners) {
                addListener(tempListeners[i])
            }
        })
    }
}

var addListener = function(data) {
    checkConnection(data)
    var name
    if(data.object) {
        if(data.filter && data.filter.name && data.filter.query) {
            name = data.eventName + "_" + data.object.collection + "_" + data.filter.name
            listeners[name] = data
            if(socket.connected) {
                socket.emit("subscribe", {
                    tenant: data.synergykit.tenant,
                    key: data.synergykit.key,
                    token: data.synergykit.token,
                    filter: data.filter,
                    eventName: data.eventName,
                    collectionName: data.object.collection
                })
                socket.on(name, function(result) {
                    data.object.set(result)
                    data.callback(data.object)               
                })
                socket.on("subscribed_" + name, function() {
                    if(data.synergykit.debug) {
                        console.log("Subscribed to collection '" + data.object.collection + "', event '" + data.eventName + "', filter '" + data.filter.name + "' for socket " + socket.id)
                    }        
                })
            }else{
                queueAdd.push(listeners[name])
            }
        }else{
            name = data.eventName + "_" + data.object.collection
            listeners[name] = data
            if(socket.connected) {
                socket.emit("subscribe", {
                    tenant: data.synergykit.tenant,
                    key: data.synergykit.key,
                    token: data.synergykit.token,
                    eventName: data.eventName,
                    collectionName: data.object.collection
                })
                socket.on(name, function(result) {
                    data.object.set(result)
                    data.callback(data.object)               
                })
                socket.on("subscribed_" + name, function() {
                    if(data.synergykit.debug) {
                        console.log("Subscribed to collection '" + data.object.collection + "', event '" + data.eventName + "' for socket " + socket.id)
                    }        
                })
            }else{
                queueAdd.push(listeners[name])
            } 
        }               
    }else{
        name = data.eventName
        listeners[name] = data
        if(socket.connected) {
            socket.emit("subscribe", {
                tenant: data.synergykit.tenant,
                key: data.synergykit.key,
                token: data.synergykit.token,
                eventName: data.eventName,
            })
            socket.on(data.eventName, function(result) {
                data.callback(result)               
            })
            socket.on("subscribed_" + name, function() {
                if(data.synergykit.debug) {
                    console.log("Subscribed to event '" + name + "' for socket " + socket.id)
                }        
            })
        }else{
            queueAdd.push(listeners[name])
        }        
    }    
}

var removeListener = function(data) {
    var name
    checkConnection(data)
    if(data.object) {
        if(data.filter) {
            name = data.eventName + "_" + data.object.collection + "_" + data.filter.name
            listeners[name] = data
            if(socket.connected) {
                delete listeners[name]
                socket.emit("unsubscribe", {
                    tenant: data.synergykit.tenant,
                    key: data.synergykit.key,
                    token: data.synergykit.token,
                    filter: data.filter,
                    eventName: data.eventName,
                    collectionName: data.object.collection
                })
                socket.on("unsubscribed_" + name, function() {
                    if(data.synergykit.debug) {
                        console.log("Unsubscribed from collection '" + data.object.collection + "', event '" + data.eventName + "', filter '" + data.filter.name + "' for socket " + socket.id)
                    }        
                })
            }else{
                queueRemove.push(listeners[name])
            }
        }else{
            name = data.eventName + "_" + data.object.collection
            listeners[name] = data
            if(socket.connected) {
                delete listeners[name]
                socket.emit("unsubscribe", {
                    tenant: data.synergykit.tenant,
                    key: data.synergykit.key,
                    token: data.synergykit.token,
                    eventName: data.eventName,
                    collectionName: data.object.collection
                })
                socket.on("unsubscribed_" + name, function() {
                    if(data.synergykit.debug) {
                        console.log("Unsubscribed from collection '" + data.object.collection + "', event '" + data.eventName + "' for socket " + socket.id)
                    }        
                })
                socket.removeAllListeners(name)
            }else{
                queueRemove.push(listeners[name])
            } 
        }               
    }else{
        name = data.eventName
        listeners[name] = data
        if(socket.connected) {
            delete listeners[name]
            socket.emit("unsubscribe", {
                tenant: data.synergykit.tenant,
                key: data.synergykit.key,
                token: data.synergykit.token,
                eventName: data.eventName,
            })
            socket.on("unsubscribed_" + name, function() {
                if(data.synergykit.debug) {
                    console.log("Unsubscribed from event '" + data.eventName + "' for socket " + socket.id)
                }        
            })
            socket.removeAllListeners(name)
        }else{
            queueRemove.push(listeners[name])
        }        
    }    
}

exports.speak = function(data) {
    socket.emit("speak", {
        tenant: data.synergykit.tenant,
        token: data.synergykit.token,
        eventName: data.eventName,
        message: data.message
    })
}

exports.addListener = function(data) {
    addListener(data)
}

exports.removeListener = function(data) {
    removeListener(data)
}