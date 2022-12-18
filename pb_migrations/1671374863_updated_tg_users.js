migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("593q84k325miklh")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "exn0lw8p",
    "name": "is_currently_doing",
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
  const collection = dao.findCollectionByNameOrId("593q84k325miklh")

  // remove
  collection.schema.removeField("exn0lw8p")

  return dao.saveCollection(collection)
})
