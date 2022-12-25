migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rsfhprjc6qjflny")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "7lutzmlp",
    "name": "beforehand_reminder_owner_id",
    "type": "text",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rsfhprjc6qjflny")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "7lutzmlp",
    "name": "beforehand_remainder_owner_id",
    "type": "text",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
})
