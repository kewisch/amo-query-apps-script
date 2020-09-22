AMO Query Google Apps Script
============================

This Google Apps Script will add a custom function you can use in a spreadsheet. It is highly experimental at current.

How to test
------------

Do this in a spreadsheet:

* Tools &rarr; Script Editor
* Copy/paste `amo.gs` into the editor
* Give it a name and save it
* Verify that there is a new submenu in the Add-ons menu. If not, run the `onOpen` function in Google Apps Script.


Usage Examples
--------------

* `=AMOGUID(A1)` - Calculate the guid for whatever is in A1

* `=AMOGUID(A1, {"name", "guid", "status"})` - Expand name, guid and add-on status for whatever is in A1
