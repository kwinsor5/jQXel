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

## EXAMPLES
### Create your columns

    var column1Options = new Array();
    column1Options.push($('<option/>').val('1').text('Option 1'));
    column1Options.push($('<option/>').val('2').text('Option 2'));
    column1Options.push($('<option/>').val('3').text('Option 3'));
    column1Options.push($('<option/>').val('4').text('Option 4'));
    column1Options.push($('<option/>').val('5').text('Option 5'));
    var headers = [
        { text: 'Column 0', editable: false, type: 'text' },
        { text: 'Column 1', editable: true, type: 'select', options: column1Options },
        { text: 'Column 2', editable: true, type: 'text' },
        { text: 'Column 3', editable: true, type: 'text' },
        { text: 'Column 4', editable: true, type: 'text' },
        { text: 'Column 5', editable: true, type: 'text' },
        { text: 'Column 6', editable: true, type: 'text' },
        { text: 'Column 7', editable: true, type: 'text' },
        { text: 'Column 8', editable: true, type: 'text' }
      ];


### Populate your table
       var data = [];
        data.push({
            data: [
                { text: '0,1', value: '0,1', editable: 'false', entityId: 1, name: 'Text' },
                { text: '1,1', value: '1,1', editable: 'true', entityId: 1, name: 'Text1' },
                { text: '2,1', value: '2,1', editable: 'true', entityId: 1, name: 'Text2' },
                { text: '3,1', value: '3,1', editable: 'true', entityId: 1, name: 'Text3' },
                { text: '4,1', value: '4,1', editable: 'true', entityId: 1, name: 'Text4' },
                { text: '5,1', value: '5,1', editable: 'true', entityId: 1, name: 'Text5' },
                { text: '6,1', value: '6,1', editable: 'true', entityId: 1, name: 'Text6' },
                { text: '7,1', value: '7,1', editable: 'true', entityId: 1, name: 'Text7' },
                { text: '8,1', value: '8,1', editable: 'true', entityId: 1, name: 'Text8' },
            ],
            entityId: 1,
            idName: 'Id'
            }
        );
        data.push({
            data: [
                { text: '0,2', value: '0,2', editable: 'false', entityId: 2, name: 'Text' },
                { text: '1,2', value: '1,2', editable: 'true', entityId: 2, name: 'Text1' },
                { text: '2,2', value: '2,2', editable: 'true', entityId: 2, name: 'Text2' },
                { text: '3,2', value: '3,2', editable: 'true', entityId: 2, name: 'Text3' },
                { text: '4,2', value: '4,2', editable: 'true', entityId: 2, name: 'Text4' },
                { text: '5,2', value: '5,2', editable: 'true', entityId: 2, name: 'Text5' },
                { text: '6,2', value: '6,2', editable: 'true', entityId: 2, name: 'Text6' },
                { text: '7,2', value: '7,2', editable: 'true', entityId: 2, name: 'Text7' },
                { text: '8,2', value: '8,2', editable: 'true', entityId: 2, name: 'Text8' },
            ],
            entityId: 2,
            idName: 'Id'
            }
    );

### Create your spreadsheet
    $('#container').jQXel({
        headers: headers,
        footer: footer,
        data: data,
        toolbarOptions: {
            add: true,
            copy: true,
            insert: true,
            includeRowNumbers: true,
            position: 'top'
        },
        beforeCellChange: beforeCellChange
      });

      function beforeCellChange(cell) {
            $.ajax({
                url: '/Home/Post',
                type: 'POST',
                data: { model: cell.getRowObject() },
                async: true
             }).done(function (results) {
                //do something
            }).fail(function (jqXHR, textStatus, errorThrown) {
                cell.alert('Something bad happened');
            });
      }

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

### JSONRow
* entityId (number) - The row identifier
* idName (string) - The property name of the identifier. Used for serialization
* data (Array<JSONData>) - The row data

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
