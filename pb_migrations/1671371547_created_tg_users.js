migrate((db) => {
  const collection = new Collection({
    "id": "593q84k325miklh",
    "created": "2022-12-18 13:52:27.416Z",
    "updated": "2022-12-18 13:52:27.416Z",
    "name": "tg_users",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "8pkscbie",
        "name": "tg_id",
        "type": "text",
        "required": true,
        "unique": true,
        "options": {
          "min": null,
          "max": null,
          "pattern": "^\\d+$"
        }
      },
      {
        "system": false,
        "id": "fcvl7k2s",
        "name": "tg_username",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "46o1roug",
        "name": "name",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "3jwhnd7s",
        "name": "surename",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
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
      },
      {
        "system": false,
        "id": "ut3rounj",
        "name": "phone_number",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": "^[\\\\+]?[(]?[0-9]{3}[)]?[-\\\\s\\\\.]?[0-9]{3}[-\\\\s\\\\.]?[0-9]{4,6}$"
        }
      },
      {
        "system": false,
        "id": "cfmhilgb",
        "name": "language",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": "^[a-z]{2}(-[A-Z]{2})?$"
        }
      },
      {
        "system": false,
        "id": "ato6xepn",
        "name": "active",
        "type": "bool",
        "required": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "qprcvdsa",
        "name": "superuser",
        "type": "bool",
        "required": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "itprea8v",
        "name": "last_active",
        "type": "date",
        "required": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      }
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("593q84k325miklh");

  return dao.deleteCollection(collection);
})
