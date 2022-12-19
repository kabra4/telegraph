migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("593q84k325miklh")

  // remove
  collection.schema.removeField("nnefanmv")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("593q84k325miklh")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nnefanmv",
    "name": "bio",
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
