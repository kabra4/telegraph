migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("atktltgdj4edptj")

  collection.name = "groups"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("atktltgdj4edptj")

  collection.name = "group"

  return dao.saveCollection(collection)
})
