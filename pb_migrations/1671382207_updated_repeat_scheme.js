migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("s1hmpiua66eetgq")

  collection.name = "repeat_schemes"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("s1hmpiua66eetgq")

  collection.name = "repeat_scheme"

  return dao.saveCollection(collection)
})
