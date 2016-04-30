module.exports = function(Organisation) {
	/*
	* Remote method to get inventory for a particular store
	* This method returns the inventory of the items for
	* a particular store. 
	* @params - orgId
	* @params - storeId
	* @response - a list of items with their inventory data
	*/
	Organisation.storeInventory = function(orgId,storeId,callback){
		var mongoDs = Organisation.app.datasources.mongoDs;
 		var ObjectID = mongoDs.connector.getDefaultIdType();

		var item = Organisation.app.models.item;
		var storeIdString = 'inventory.'+storeId;

		// include only store specific data and common details of item
		var fieldsObject = {};
		fieldsObject.id = true;
		fieldsObject.name = true;
		fieldsObject.SKU =  true;
		fieldsObject.inventory = true;
		fieldsObject[storeIdString] = true;

		// Where filter for the inventory search
		var whereFilter = {};
		whereFilter.orgId = new ObjectID(orgId);
		whereFilter[storeIdString] = {gte: 0};

		item.find({
			where: whereFilter ,
			fields: fieldsObject
		}, function(err, results){
			if(err){
				callback(err);
			}
			else{
				callback(null,results);
			}
		});
		
	};

	Organisation.remoteMethod('storeInventory',
	{
		accepts: [
			{ arg:'id', type: 'string', required: true },
			{ arg:'storeId', type: 'string', required: true }
		],
		returns: {arg: 'items',type: 'array'},
		http: {path: '/:id/store/:storeId/items-inventory', verb: 'get'}
	});
};
