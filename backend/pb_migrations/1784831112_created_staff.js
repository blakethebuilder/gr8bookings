/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1579384326",
        "max": 0,
        "min": 0,
        "name": "name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "_email",
        "name": "email",
        "presentable": false,
        "required": true,
        "system": true,
        "type": "email",
        "unique": true
      },
      {
        "hidden": true,
        "id": "_password",
        "name": "password",
        "presentable": false,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": true,
        "id": "_tokenKey",
        "name": "tokenKey",
        "presentable": false,
        "required": false,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "_verified",
        "name": "verified",
        "presentable": false,
        "required": false,
        "system": true,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "_emailVisibility",
        "name": "emailVisibility",
        "presentable": false,
        "required": false,
        "system": true,
        "type": "bool"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1146066909",
        "max": 0,
        "min": 0,
        "name": "phone",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select1466534506",
        "maxSelect": 0,
        "name": "role",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "grandmaster",
          "gamemaster"
        ]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text2009458654",
        "max": 0,
        "min": 0,
        "name": "avatar_color",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "bool458715613",
        "name": "is_active",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "bool"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text162569851",
        "max": 0,
        "min": 0,
        "name": "pin_code",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      }
    ],
    "id": "pbc_2301119865",
    "indexes": [],
    "listRule": "@request.auth.id != \"\"",
    "name": "staff",
    "system": false,
    "type": "auth",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "passwordAuth": {
      "enabled": true,
      "identityFields": ["email"]
    },
    "authToken": {
      "duration": 604800
    },
    "otp": {
      "enabled": false
    },
    "mfa": {
      "enabled": false
    },
    "oauth2": {
      "enabled": false,
      "providers": []
    },
    "passwordResetToken": {
      "duration": 1800
    },
    "emailChangeToken": {
      "duration": 1800
    },
    "verificationToken": {
      "duration": 259200
    },
    "fileToken": {
      "duration": 1800
    },
    "authAlert": {
      "enabled": false
    }
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2301119865");

  return app.delete(collection);
})
