'use strict';
var async = require('async');

/** REMOTE METHOD FOR BULK UPDATES **
* This remote method does update and upserrt with node UnorderedBulkOperation() 
* It accept's object as argument containing orgId and storeId and array of items
* @params - Obejct
* @property - orgID
* @property - storeId
* @property - data[ list of items ]
*
* ```
* eg :- inventory = {
*	    "orgId": "5720fdd8ed72f12204f14e3f",
*	    "storeId": "5722d942352bcf630cda0dfc",
*	    "data": [
*			{
*			    "name":"item-1",
*			    "description":"this is an item ",
*			    "SKU" : "001",
*			    "quantity": 200
*			}
*	    ]
*   }
*
* ```
* This method updates or upsert's the mongdb database which contains
* nested object properties as the invetory details. Db schema looks like this:
* 
* ``` Schema with nested inventory object
*	{
*	    "_id" : ObjectId("5722f87c3a712b728744ec1d"),
*	    "SKU" : "001",
*	    "orgId" : ObjectId("5720fdd8ed72f12204f14e3f"),
*	    "inventory" : {
*	        --- storeIds and quantity per store ---
*	        "5720fe26ed72f12204f14e40" : 100, 
*	        "5722d942352bcf630cda0dfc" : 200
*	    },
*	    "name" : "item-1",
*	    "description" : "this is an item "
*	}
*
* ```
*
*/
module.exports = function(Item) {
	Item.bulkUpload = function(inventory , cb){
		// Get mongodb ObjectId
		var mongoDs = Item.app.datasources.mongoDs;
 		var ObjectID = mongoDs.connector.getDefaultIdType();

		var col = Item.dataSource.adapter.collection('item');
		var batch = col.initializeUnorderedBulkOp();

		var orgId = inventory.orgId;
		var storeId = inventory.storeId;
		// Iterate over each item in array coming from the argument
		async.each(inventory.data,function(item , callback){
			if(!item.SKU){
				// Return if there's no SKU for the item
				callback('please provide sku for the item'+item);
			}
			else{
				/* NOTE: 
				* use dot notation to update the inventory details
				* The update won't work properly if we aren't updating it the right way
				* --- : WRONG WAY : ---
				* {inventory: { '5720fdd8ed72f12204f14e3f': 100 } -- This will clear
				* the existing inventory and just insert single store data
				* ---: CORRECT WAY :---
				* {'inventory.5720fe26ed72f12204f14e40': 100 } -- This will update
				* inventory for particular storeId without altering other stores data
				*/
				var inventoryUpdateStore = 'inventory.'+storeId;
				var updateVal = {};
				updateVal.name = item.name;
				updateVal.description = item.description;
				updateVal.orgId = new ObjectID(orgId);
				updateVal[inventoryUpdateStore] = item.quantity;
				batch.find({SKU:item.SKU,orgId:new ObjectID(orgId)})
				.upsert()
				.update({$set: updateVal});
				callback();
			}
		}, function(err){
			if(err){
				cb('something went wrong');
			}
			else {
				batch.execute(function(err,result){
					if(err){
						cb(err);
					}
					else{
						cb(null,result);
					}
				});
			}
		});
		
	};

	Item.remoteMethod('bulkUpload',
	{
		accepts: { arg:'data', type: 'object', http: { source: 'body' } },
		returns: {arg: 'greeting', type: 'string'},
		http: {path: '/bulk-update', verb: 'put'}
	});
};
