## Prerequisites

You must have already installed [Node.js](https://nodejs.org/).

Install StrongLoop:
```
$ npm install -g strongloop
```

# Bulk Update using Loopback an Mongo

This project provieds a simple method to do bulk update using loopback and mongodb. We can do bulk updates using node
[UnorderedBulkOperation](https://mongodb.github.io/node-mongodb-native/api-generated/unordered.html#). This project shows a method to do bulk updates/upserts with nested object key value pairs. 

We define three models `oranisation` , `store` and `item` where store and item belongs to a organisation. Every item has some inventory accross different stores. Inventory details are stored in item model using a nested key value schema where inventory has storeId's a key and inventory data as value. 

```
*  {
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

```

The bulk update method accepts a object payload consisting orgId, storeId and an array of items, then it iterates over each item to update/upsert the item based on the inventory data passed to the method. If the inventory update is for a existing store, method will just update the inventory value or else if inventory is for a new store it will add a new store in the inventory object of our schema.
