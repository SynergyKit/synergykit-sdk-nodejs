var Synergykit = require("../index")

var TENANT = "stabilitytest-r8uxr";
var KEY = "a3358354-394b-472a-85f8-c24b11c1bff4";
var createSuccess = 0;
var createTotal = 0;
var createMin = 0;
var createMax = 0;
var createAvg = 0;
var getSuccess = 0;
var getTotal = 0;
var getMin = 0;
var getMax = 0;
var getAvg = 0;
var updateSuccess = 0;
var updateTotal = 0;
var updateMin = 0;
var updateMax = 0;
var updateAvg = 0;
var querySuccess = 0;
var queryTotal = 0;
var queryMin = 0;
var queryMax = 0;
var queryAvg = 0;
var deleteSuccess = 0;
var deleteTotal = 0;
var deleteMin = 0;
var deleteMax = 0;
var deleteAvg = 0;
Synergykit.Init(TENANT, KEY, {strategy: "sockets", debug: true});
// start
createDocument();
function createDocument() {
    var test = Synergykit.Data("node");
    test.set("name", "test");
    var start = Date.now();
    test.save({
        success: function(node, statusCode) {
            var stop = Date.now();
            var diff = stop - start;
            // min
            if (createMin == 0 || createMin > diff) {
                createMin = diff;
            }
            // max
            if (createMax == 0 || createMax < diff) {
                createMax = diff;
            }
            // avg + total increase
            createAvg = (createAvg * createSuccess + diff) / ++createSuccess;
            // increase total
            createTotal++;
            refresh();
            getDocument(node.get("_id"));
        },
        error: function(error, statusCode) {
            // increase total
            createTotal++;
            refresh();
            createDocument();
        }
    });
}
function getDocument(id) {
    var test = Synergykit.Data("node");
    test.set("_id", id);
    var start = Date.now();
    test.fetch({
        success: function(node, statusCode) {
            var stop = Date.now();
            var diff = stop - start;
            // min
            if (getMin == 0 || getMin > diff) {
                getMin = diff;
            }
            // max
            if (getMax == 0 || getMax < diff) {
                getMax = diff;
            }
            // avg + total increase
            getAvg = (getAvg * getSuccess + diff) / ++getSuccess;
            // increase total
            getTotal++;
            refresh();
            updateDocument(node.get("_id"), node.get("__v"));
        },
        error: function(error, statusCode) {
            // increase total
            getTotal++;
            
            refresh();
            queryDocument();
        }
    });
}
function updateDocument(id, version) {
    var test = Synergykit.Data("node");
    test.set("_id", id);
    test.set("__v", version);
    test.set("name", "Test updated");
    var start = Date.now();
    test.save({
        success: function(node, statusCode) {
            var stop = Date.now();
            var diff = stop - start;
            // min
            if (updateMin == 0 || updateMin > diff) {
                updateMin = diff;
            }
            // max
            if (updateMax == 0 || updateMax < diff) {
                updateMax = diff;
            }
            // avg + total increase
            updateAvg = (updateAvg * updateSuccess + diff) / ++updateSuccess;
            // increase total
            updateTotal++;
            refresh();
            queryDocument();
        },
        error: function(error, statusCode) {
            // increase total
            updateTotal++;
            refresh();
            queryDocument();
        }
    });
}
function queryDocument() {
    var test = Synergykit.Data("node");
    var start = Date.now();
    var query = Synergykit.Query(test);
    query.where()
    .attribute("createdAt").isGreaterThan(start-(60*60*1000)) // 1 hour back
    .find({
        success: function(nodes, statusCode) {
            var stop = Date.now();
            var diff = stop - start;
            // min
            if (queryMin == 0 || queryMin > diff) {
                queryMin = diff;
            }
            // max
            if (queryMax == 0 || queryMax < diff) {
                queryMax = diff;
            }
            // avg + total increase
            queryAvg = (queryAvg * querySuccess + diff) / ++querySuccess;
            // increase total
            queryTotal++;
            refresh();
            deleteDocument(nodes[0].get("_id")); // uncomment to enable delete
            //createDocument();  // comment to enable delete
        },
        error: function(error, statusCode) {
            // increase total
            queryTotal++;
            refresh();
            deleteDocument(id); // uncomment to enable delete
            //createDocument(); // comment to enable delete
        }
    });
}
function deleteDocument(id) {
    var test = Synergykit.Data("node");
    test.set("_id", id);
    var start = Date.now();
    test.destroy({
        success: function(node, statusCode) {
            var stop = Date.now();
            var diff = stop - start;
            // min
            if (deleteMin == 0 || deleteMin > diff) {
                deleteMin = diff;
            }
            // max
            if (deleteMax == 0 || deleteMax < diff) {
                deleteMax = diff;
            }
            // avg + total increase
            deleteAvg = (deleteAvg * deleteSuccess + diff) / ++deleteSuccess;
            // increase total
            deleteTotal++;
            refresh();
            createDocument();
        },
        error: function(error, statusCode) {
            // increase total
            deleteTotal++;
            refresh();
            createDocument();
        }
    })
}
function refresh() {
    var lines = process.stdout.getWindowSize()[1];
    console.log('\033[2J');
    var createPer = 100;
    if (createTotal != 0) createPer = Math.round(createSuccess/createTotal*100);
    var getPer = 100;
    if (getTotal != 0) getPer = Math.round(getSuccess/getTotal*100);
    var updatePer = 100;
    if (updateTotal != 0) updatePer = Math.round(updateSuccess/updateTotal*100);
    var queryPer = 100;
    if (queryTotal != 0) queryPer = Math.round(querySuccess/queryTotal*100);
    var deletePer = 100;
    if (deleteTotal != 0) deletePer = Math.round(deleteSuccess/deleteTotal*100);
    console.log('CREATE \t%d\% (%d/%d) min=%d \tmax=%d \tavg=%d', createPer, createSuccess, createTotal, createMin, createMax, Math.round(createAvg));
    console.log('GET \t%d\% (%d/%d) min=%d \tmax=%d \tavg=%d', getPer, getSuccess, getTotal, getMin, getMax, Math.round(getAvg));
    console.log('UPDATE \t%d\% (%d/%d) min=%d \tmax=%d \tavg=%d', updatePer, updateSuccess, updateTotal, updateMin, updateMax, Math.round(updateAvg));
    console.log('QUERY \t%d\% (%d/%d) min=%d \tmax=%d \tavg=%d', queryPer, querySuccess, queryTotal, queryMin, queryMax, Math.round(queryAvg));
    console.log('DELETE \t%d\% (%d/%d) min=%d \tmax=%d \tavg=%d', deletePer, deleteSuccess, deleteTotal, deleteMin, deleteMax, Math.round(deleteAvg));
    // for(var i = 0; i < 10; i++) {
 //     console.log('\n');
    // }
}
