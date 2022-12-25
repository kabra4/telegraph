migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("593q84k325miklh")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rgxfys8w",
    "name": "reminder_options",
    "type": "json",
    "required": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("593q84k325miklh")

  // update
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
})
