migrate((db) => {
  const collection = new Collection({
    "id": "rsfhprjc6qjflny",
    "created": "2022-12-18 14:47:12.450Z",
    "updated": "2022-12-18 14:47:12.450Z",
    "name": "tasks",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "7lutzmlp",
        "name": "beforehand_task_owner_id",
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
        "id": "unqqjngr",
        "name": "name",
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
        "id": "tatjtv1y",
        "name": "group_id",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "collectionId": "atktltgdj4edptj",
          "cascadeDelete": true
        }
      },
      {
        "system": false,
        "id": "hyg9kzs1",
        "name": "user_id",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "collectionId": "593q84k325miklh",
          "cascadeDelete": true
        }
      },
      {
        "system": false,
        "id": "gboemjbn",
        "name": "is_repeatable",
        "type": "bool",
        "required": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "bua5rvhl",
        "name": "repeat_scheme_id",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "collectionId": "s1hmpiua66eetgq",
          "cascadeDelete": false
        }
      },
      {
        "system": false,
        "id": "6glk9s7p",
        "name": "planned_on",
        "type": "date",
        "required": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "tpisl9em",
        "name": "trigger_timestamp",
        "type": "number",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null
        }
      },
      {
        "system": false,
        "id": "ppfi8xjs",
        "name": "last_trigger_timestamp",
        "type": "number",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null
        }
      },
      {
        "system": false,
        "id": "0bts2aie",
        "name": "trigger_count",
        "type": "number",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null
        }
      },
      {
        "system": false,
        "id": "5xnxqvcs",
        "name": "action_type",
        "type": "select",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "message",
            "delete",
            "notify_all",
            "beforehand_notification",
            "get_goal_status"
          ]
        }
      },
      {
        "system": false,
        "id": "jqgemhbk",
        "name": "has_beforehand_notification",
        "type": "bool",
        "required": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "ymlveywm",
        "name": "beforehand_seconds",
        "type": "number",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null
        }
      },
      {
        "system": false,
        "id": "f9r7zugy",
        "name": "goal_id",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "collectionId": "e62hp5rigzeke5m",
          "cascadeDelete": true
        }
      },
      {
        "system": false,
        "id": "3zqoyahr",
        "name": "content",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
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
  const collection = dao.findCollectionByNameOrId("rsfhprjc6qjflny");

  return dao.deleteCollection(collection);
})
