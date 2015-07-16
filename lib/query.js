var _ = require("./underscore/underscore.js"),
    Data = require("./modules/data.js").Data

function Query(object, synergykit) {
    this.query = {}
    if (_.isString(object)) {
        this.name = object
    } else {
        this.object = object
        this.name = object.endpoint
    }
    this.synergykit = synergykit
    return this
}

Query.prototype.where = function() {
    this.query["$filter"] = ""
    return this
}


Query.prototype.select = function(select) {
    this.query["$select"] = _.isArray(select) ? select.join(",") : select
    return this
}

Query.prototype.inlineCount = function() {
    this.query["$inlinecount"] = true
    return this
}

Query.prototype.top = function(top) {
    this.query["$top"] = parseInt(top)
    return this
}

Query.prototype.skip = function(skip) {
    this.query["$skip"] = parseInt(skip)
    return this
}

Query.prototype.orderBy = function(orderby) {
    this.query["$orderby"] = orderby
    return this
}

Query.prototype.desc = function() {
    this.query["$orderby"] += "%20desc"
    return this
}

Query.prototype.asc = function() {
    this.query["$orderby"] += "%20asc"
    return this
}

Query.prototype.toString = function() {
    return this.query
}


// ---- Filter Section ----
Query.prototype.attribute = function(attribute) {
    this.query["$filter"] += "'" + attribute + "'"
    return this
}


// ---- Filter Operators ----
Query.prototype.and = function() {
    this.query["$filter"] += "%20and%20"
    return this
}

Query.prototype.or = function() {
    this.query["$filter"] += "%20or%20"
    return this
}

Query.prototype.isEqualTo = function(parameter) {
    this.query["$filter"] += "%20eq%20" + checkParameter(parameter)
    return this
}

Query.prototype.isNotEqualTo = function(parameter) {
    this.query["$filter"] += "%20ne%20" + checkParameter(parameter)
    return this
}

Query.prototype.isGreaterThan = function(parameter) {
    this.query["$filter"] += "%20gt%20" + checkParameter(parameter)
    return this
}

Query.prototype.isGreaterOrEqual = function(parameter) {
    this.query["$filter"] += "%20ge%20" + checkParameter(parameter)
    return this
}

Query.prototype.isLessThan = function(parameter) {
    this.query["$filter"] += "%20lt%20" + checkParameter(parameter)
    return this
}

Query.prototype.isLessOrEqualThan = function(parameter) {
    this.query["$filter"] += "%20le%20" + checkParameter(parameter)
    return this
}

Query.prototype.isInArray = function(parameter) {
    this.query["$filter"] += "%20in%20" + checkParameter(parameter)
    return this
}

Query.prototype.isNotInArray = function(parameter) {
    this.query["$filter"] += "%20nin%20" + checkParameter(parameter)
    return this
}

// ---- Filter Functions ----
Query.prototype.substringOf = function(attribute, parameter) {
    this.query["$filter"] += "substringof('" + parameter + "'," + attribute + ")"
    return this
}

Query.prototype.startsWith = function(attribute, parameter) {
    this.query["$filter"] += "startswith(" + attribute + ",'" + parameter + "')"
    return this
}

Query.prototype.endsWith = function(attribute, parameter) {
    this.query["$filter"] += "endswith(" + attribute + ",'" + parameter + "')"
    return this
}

Query.prototype.find = function(callbacks) {
    if (!this.object) {
        throw Errors.NO_SYNERGYKIT_OBJECT
    } else {
        if (this.object instanceof Data) {
            var queryString = ""
            if (this.query) {
                var counter = 0
                _.each(this.query, function(q, i) {
                    if (counter == 0) {
                        queryString += "?"
                    } else {
                        queryString += "&"
                    }
                    queryString += i + "=" + q
                    counter++
                })
            }
            this.synergykit.socketGet(this.object, queryString, callbacks)
        } else {
            this.synergykit.request({
                method: "GET",
                query: this.query,
                endpoint: this.object.endpoint
            }, callbacks, this.object)
        }

    }

}

function checkParameter(parameter) {
    if (_.isString(parameter)) {
        return "'" + parameter + "'"
    }
    return parameter
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = Query