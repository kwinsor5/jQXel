# jQXel
TypeScript/jQuery plugin to convert an array of JSON objects into an Excel-like UI

### Edit your data tables in a web-based, Excel-like user interface

## FEATURES
* Smooth spreadsheet look and feel
* Arrow/tab key navigation
* Editable content
* Cell, row, and column change events
* Automatic row serialization
* Toolbar options to add, copy, and delete rows
* Copy multiple rows to your clipboard
* Select list, text, link support

# DOCUMENTATION

### ThemeOptions
* color (string) - blue or green
* style (string) - not even sure right now

### ToolbarOptions
* add (Boolean) - If true, renders the "Add Row" toolbar button
* copy (Boolean) - If true, renders the "Copy Selection" toolbar button
* insert (Boolean) - If true, renders the "Insert Row" toolbar button
* position (string) - Indicates the toolbar position - top, bottom, left, right
* includeRowNumbers (Boolean) - If true, displays an auto-numbered header cell on each row

### JSONHeader
* text (string) - The display text
* editable (string) - Indicates whether the entire column is editable (may be overridden on the cell level)
* type (string) - The type of input for this column - text, select
* name (string) - This is currently not being used
* options (Array<HTMLOptionElement>) - Available options for cells of type 'select' in this column

### JSONData
* text (string) - The display text of the cell
* value (string) - The value of the cell
* editable (string) - Acts as an override for the column's 'editable' field
* entityId (number) - This needs to be changed to be assigned to the row object
* name (string) - The name of the editable field. Used for serialization of JSON objects in change events
* href (string?) - If present, the text value will be converted to a link with the given href

### SelectedCell
* cell (HTMLDivElement) - The active cell element
* alert(message: string) {void} - Adds the jql-alert class to the parent row element. If the message parameter is present, set the parent row's title attribute
* removeAlert() {void} - Removes the jql-alert class and parent row's title attribute
* getRowIndex() {number} - Returns the index of the parent row
* getRowValues(includeRowHeader: Boolean) - Returns a string array of all cell values in the row.
* getRowObject() {Object} - Serializes all cell values in the row into a JSON object
* select(type: string, options: Array<HTMLOptionElement>) {void} - Selects this cell
