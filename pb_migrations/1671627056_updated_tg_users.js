migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("593q84k325miklh")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rgxfys8w",
    "name": "remainder_options",
    "type": "json",
    "required": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("593q84k325miklh")

  // remove
  collection.schema.removeField("rgxfys8w")

  return dao.saveCollection(collection)
})
