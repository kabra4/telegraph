migrate((db) => {
  const collection = new Collection({
    "id": "s1hmpiua66eetgq",
    "created": "2022-12-18 14:10:08.645Z",
    "updated": "2022-12-18 14:10:08.645Z",
    "name": "repeat_scheme",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ikrtsxr0",
        "name": "months_of_year",
        "type": "select",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 12,
          "values": [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12"
          ]
        }
      },
      {
        "system": false,
        "id": "90s99biw",
        "name": "days_of_week",
        "type": "select",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 7,
          "values": [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7"
          ]
        }
      },
      {
        "system": false,
        "id": "jctj1c31",
        "name": "days_of_month",
        "type": "select",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 31,
          "values": [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
            "20",
            "21",
            "22",
            "23",
            "24",
            "25",
            "26",
            "27",
            "28",
            "29",
            "30",
            "31"
          ]
        }
      },
      {
        "system": false,
        "id": "j3ax3tjh",
        "name": "times_of_day",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": "^(([0-1]?[0-9]|2[0-3]):[0-5][0-9])(,\\\\s*([0-1]?[0-9]|2[0-3]):[0-5][0-9])*$"
        }
      },
      {
        "system": false,
        "id": "rkmeeozv",
        "name": "interval_minutes",
        "type": "number",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null
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
  const collection = dao.findCollectionByNameOrId("s1hmpiua66eetgq");

  return dao.deleteCollection(collection);
})
