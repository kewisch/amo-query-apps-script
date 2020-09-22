/* vim: set ft=javascript: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch, 2020 */

/* exported onOpen, AMOGUID */


function onOpen() {
  SpreadsheetApp.getUi()
    .createAddonMenu()
    .addItem("Authorize", "authorize_") /* exported authorize_ */
    .addItem("Clear credentials", "clearauth_") /* exported clearauth_ */
    .addToUi();
}

function clearauth_() {
  PropertiesService.getUserProperties().deleteAllProperties();
}

function authorize_() {
  let ui = SpreadsheetApp.getUi();
  let props = PropertiesService.getUserProperties();

  let apikeyres = ui.prompt("AMO Credentials", "Enter API Key", ui.ButtonSet.OK_CANCEL);
  if (apikeyres.getSelectedButton() == ui.Button.CANCEL) {
    return;
  }

  let apisecretres = ui.prompt("AMO Credentials", "Enter API Secret", ui.ButtonSet.OK_CANCEL);
  if (apisecretres.getSelectedButton() == ui.Button.CANCEL) {
    return;
  }

  props.setProperties({
    api_key: apikeyres.getResponseText(),
    api_secret: apisecretres.getResponseText()
  });
}

function AMOGUID(id_slug_guid, fields) {
  const TRANSLATED_FIELDS = new Set(["name", "summary", "description"]);

  fields = (fields && fields[0]) || ["guid"];


  let data = request_("https://addons.mozilla.org/api/v4/addons/addon/" + id_slug_guid);

  let resfields = fields.map((field) => {
    if (TRANSLATED_FIELDS.has(field)) {
      return data[field]["en-US"] || data[field][data.default_locale];
    } else {
      return data[field];
    }
  });
  return [resfields];
}

function request_(url) {
  let props = PropertiesService.getUserProperties();

  let apiKey = props.getProperty("api_key");
  let apiSecret = props.getProperty("api_secret");

  if (!apiKey || !apiSecret) {
    throw new Error("Please authorize from the menu");
  }

  let response = UrlFetchApp.fetch(url, {
    headers: { Authorization: "JWT " + jwt_(apiKey, apiSecret) },
    muteHttpExceptions: false
  });
  return JSON.parse(response.getContentText());
}

function jwt_(apiKey, apiSecret) {
  let now = Math.floor(new Date().getTime() / 1000);
  let header = {
    alg: "HS256",
    typ: "JWT",
  };
  let claim = {
    iss: apiKey,
    jti: Math.random().toString(),
    iat: now,
    exp: now + 60
  };
  Logger.log(claim);

  var signature = Utilities.base64Encode(JSON.stringify(header)) + "." + Utilities.base64Encode(JSON.stringify(claim));
  return signature + "." + Utilities.base64Encode(Utilities.computeHmacSha256Signature(signature, apiSecret));
}
