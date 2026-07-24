/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_986407980")

  // add deposit_amount, balance_due, payment_type fields
  // using fields.add() which appends to the end of the field list
  collection.fields.add({
    "hidden": false,
    "id": "number9586412357",
    "max": null,
    "min": null,
    "name": "deposit_amount",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  })

  collection.fields.add({
    "hidden": false,
    "id": "number4857936182",
    "max": null,
    "min": null,
    "name": "balance_due",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  })

  collection.fields.add({
    "hidden": false,
    "id": "select8273645190",
    "maxSelect": 0,
    "name": "payment_type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": ["deposit", "full"]
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_986407980")

  // Remove the added fields. Field IDs are unique so we can target them directly.
  // PocketBase's SchemaFieldList.remove() can target by field reference.
  // We iterate the list to find and remove each field by name.
  const namesToRemove = ["payment_type", "balance_due", "deposit_amount"]
  const fields = collection.fields
  // Use a standard for loop since PocketBase's JS runtime (Goja) supports it
  const toRemove = []
  for (var i = 0; i < fields.length; i++) {
    var f = fields[i]
    if (namesToRemove.indexOf(f.name) !== -1) {
      toRemove.push(f)
    }
  }
  for (var j = 0; j < toRemove.length; j++) {
    fields.remove(toRemove[j])
  }

  return app.save(collection)
})
