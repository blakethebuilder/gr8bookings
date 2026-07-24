/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_986407980")

  // add deposit_amount field (after "notes", before "waiver_signed")
  collection.fields.addAt(collection.fields.findIndex("notes") + 1, {
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

  // add balance_due field
  collection.fields.addAt(collection.fields.findIndex("notes") + 2, {
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

  // add payment_type field
  collection.fields.addAt(collection.fields.findIndex("notes") + 3, {
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

  // remove the added fields (reverse order to keep indices valid)
  collection.fields.remove(collection.fields.findIndex("payment_type"))
  collection.fields.remove(collection.fields.findIndex("balance_due"))
  collection.fields.remove(collection.fields.findIndex("deposit_amount"))

  return app.save(collection)
})
