migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rsfhprjc6qjflny")

  collection.name = "reminders"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rsfhprjc6qjflny")

  collection.name = "remainders"

  return dao.saveCollection(collection)
})
