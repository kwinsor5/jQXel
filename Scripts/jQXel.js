class ThemeOptions {
    constructor(color, style) {
        this.color = color;
        this.style = style;
    }
}
class ToolbarOptions {
    constructor(add, copy, insert, includeRowNumbers, position) {
        this.add = add;
        this.copy = copy;
        this.insert = insert;
        this.position = position;
        this.includeRowNumbers = includeRowNumbers;
    }
}
class JSONHeader {
    constructor(text, editable, type, name, options, className) {
        this.className = className;
        this.text = text;
        this.editable = editable;
        this.type = type;
        this.options = options;
        this.name = name;
    }
}
class JSONData {
    constructor(text, value, editable, name, entityId, html, className) {
        this.className = className;
        this.text = text;
        this.value = value;
        this.editable = editable;
        this.name = name;
        this.entityId = entityId;
        if (html) {
            this.html = html[0];
        }
    }
}
class JSONRow {
    constructor(data, entityId, idName, className) {
        this.className = className;
        this.data = data;
        this.entityId = entityId;
        this.idName = idName;
    }
}
class JSONTable {
    constructor(data, headers, footer, containerID, beforeCellChange, beforeColumnChange, beforeRowChange, onCopy, onjQXelReady, toolbarOptions, themeOptions, className) {
        var rowCallbacks = $.Callbacks(), colCallbacks = $.Callbacks(), copyCallbacks = $.Callbacks(), readyCallbacks = $.Callbacks(), cellCallbacks = $.Callbacks();
        this.data = data;
        this.headers = headers;
        this.footer = footer;
        this.themeOptions = themeOptions;
        this.toolbarOptions = toolbarOptions;
        this.buildTable(className);
        this.toolbar = this.buildToolbar(toolbarOptions);
        this.container = this.buildContainer(themeOptions);
        var context = this;
        // make sure the cell change event is fired if user clicks outside the bounds of the table
        $(document).on('click', function (e) {
            if (!$(e.target).closest('#' + containerID).length) {
                context.container.dispatchEvent(new Event('beforecellchange'));
            }
        });
        if (onCopy.length) {
            copyCallbacks.add(onCopy);
            context.container.addEventListener('copy', function (e) {
                if (e.clipboardData) {
                    e.clipboardData.setData('text/plain', context.getClipboardText());
                    copyCallbacks.fire(e, context.highlightedRows);
                }
            });
        }
        if (beforeRowChange.length) {
            rowCallbacks.add(beforeRowChange);
            context.container.addEventListener('beforerowchange', function (e) {
                var rowData = context.selectedCell.getRowObject();
                rowCallbacks.fire(rowData, context.selectedCell);
            });
        }
        if (beforeColumnChange.length) {
            colCallbacks.add(beforeColumnChange);
            context.container.addEventListener('beforecolumnchange', function (e) {
                var index = parseInt(context.selectedCell.cell.dataset['index']);
                if (index > -1) {
                    colCallbacks.fire(context.returnColumn(index), context.selectedCell);
                }
            });
        }
        if (beforeCellChange.length) {
            cellCallbacks.add(beforeCellChange);
            context.container.addEventListener('beforecellchange', function (e) {
                if (context.selectedCell) {
                    context.bindNavigation(context.selectedCell.cell);
                    cellCallbacks.fire(context.selectedCell);
                }
            });
        }
        if (onjQXelReady.length) {
            readyCallbacks.add(onjQXelReady);
            context.container.addEventListener('jqxelready', function (e) {
                readyCallbacks.fire(e, context);
            });
        }
        var container = document.getElementById(containerID);
        container.appendChild(this.container);
        context.container.dispatchEvent(new Event('jqxelready'));
    }
    setItemValue(rowIndex, cellIndex, text) {
        this.data[rowIndex].data[cellIndex].text = text;
    }
    bindFocus(cell) {
        var context = this;
        cell.onfocus = function (e) {
            context.select(cell);
            cell.onblur = function (be) {
                context.clearSelected();
            };
        };
    }
    bindNavigation(cell) {
        var context = this;
        cell.onkeydown = function (e) {
            switch (e.which) {
                case 9:
                    {
                        e.preventDefault();
                        context.moveRight();
                    }
                    break;
                case 37:
                    {
                        e.preventDefault();
                        context.moveLeft();
                    }
                    break;
                case 38:
                    {
                        e.preventDefault();
                        context.moveUp();
                    }
                    break;
                case 39:
                    {
                        e.preventDefault();
                        context.moveRight();
                    }
                    break;
                case 40:
                    {
                        e.preventDefault();
                        context.moveDown();
                    }
                    break;
                default:
                    {
                        var index = parseInt(cell.dataset['index']);
                        var header = context.headers[index];
                        if (header.type !== 'text') {
                            e.preventDefault();
                        }
                    }
                    break;
            }
        };
    }
    createNewDataRow() {
        var count = this.headers ? this.headers.length : 0, dataRow = new Array();
        for (var i = 0; i < count; i++) {
            dataRow.push(new JSONData(' ', ' ', 'True', this.headers[i].name, 0)); // when columns have editable options, check header data
        }
        return new JSONRow(dataRow, 0, '');
    }
    populateNewRow(row, rowData) {
        var colCount = this.headers.length;
        var hdrCell = this.createRowHeaderCell(row.dataset['rowIndex']);
        row.appendChild(hdrCell);
        var cell;
        for (var i = 0; i < colCount; i++) {
            cell = this.createCell(rowData[i], i, this.headers[i].type);
            row.appendChild(cell);
        }
        return row;
    }
    createMiniToolbar(index) {
        var miniToolbar = document.createElement('ul'), context = this;
        if (context.toolbarOptions) {
            miniToolbar.classList.add('jql-mini-tlbr');
            miniToolbar.id = 'jqlMnTlbr' + index.toString();
            if (context.toolbarOptions.copy) {
                var li = context.createMiniToolbarItem(index, 'copy');
                miniToolbar.appendChild(li);
            }
            if (context.toolbarOptions.insert) {
                var li = context.createMiniToolbarItem(index, 'insert');
                miniToolbar.appendChild(li);
            }
        }
        else {
            miniToolbar.style.display = 'none';
        }
        return miniToolbar;
    }
    createMiniToolbarItem(rowIndex, buttonType) {
        var context = this;
        var item = document.createElement('li'), button = document.createElement('input');
        button.type = 'button';
        button.classList.add('jql-mini-tlbr-btn');
        switch (buttonType) {
            case 'insert':
                {
                    button.title = 'Insert After';
                    button.classList.add('jql-mini-insrt-btn');
                    button.onmousedown = function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        context.insertRowAfter(rowIndex);
                        return false;
                    };
                }
                ;
                break;
            case 'copy':
                {
                    button.title = 'Copy to Clipboard';
                    button.classList.add('jql-mini-cpy-btn');
                    button.onmousedown = function (e) {
                        context.highlightedRows = new Array(context.data[rowIndex]);
                        context.copyToClipboard();
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    };
                }
                ;
                break;
        }
        item.appendChild(button);
        return item;
    }
    findPos(obj) {
        var curtop = 0;
        if (obj.offsetParent) {
            do {
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
            return curtop;
        }
    }
    insertRowAfter(rowIndex) {
        var rows = this.table.getElementsByClassName('jql-tbl-rw');
        var newRow = this.createRow(false, false, rowIndex + 1), dataRow = this.createNewDataRow(), context = this;
        newRow = context.populateNewRow(newRow, dataRow.data);
        context.data.splice(rowIndex, 0, dataRow).join();
        newRow.style.display = 'none';
        $(newRow).insertAfter(rows[rowIndex]);
        this.refreshRowHeaders();
        $(newRow).slideDown(100);
    }
    refreshRowHeaders() {
        if (this.data && this.data.length > 0) {
            var rowCount = this.data.length, rows = this.table.getElementsByClassName('jql-tbl-rw'), cell;
            for (var i = 1; i <= rowCount; i++) {
                rows[i - 1].dataset['rowIndex'] = (i - 1).toString();
                cell = rows[i - 1].getElementsByClassName('jql-tbl-rw-hdr-cll')[0];
                $(cell).replaceWith(this.createRowHeaderCell(i.toString()));
            }
        }
    }
    buildContainer(themeOptions) {
        this.themeOptions = themeOptions;
        var context = this;
        var container = document.createElement('div'), innerTable = document.createElement('div'), innerCol1 = document.createElement('div'), innerCol2 = document.createElement('div');
        innerTable.classList.add('jql-table');
        innerCol1.classList.add('jql-column');
        innerCol2.classList.add('jql-column');
        container.classList.add('jql-container');
        if (themeOptions) {
            if (themeOptions.style) {
                container.classList.add('jql-' + themeOptions.style);
            }
            if (themeOptions.color) {
                switch (themeOptions.color) {
                    case 'blue':
                    case 'blu':
                        {
                            container.classList.add('jql-blu');
                        }
                        break;
                    case 'grn':
                    case 'green':
                        {
                            container.classList.add('jql-grn');
                        }
                        break;
                    default:
                        {
                            container.classList.add('jql-' + themeOptions.color);
                        }
                        break;
                }
            }
        }
        if (context.toolbarOptions) {
            switch (context.toolbarOptions.position) {
                case 'top':
                    {
                        var row = document.createElement('div');
                        row.classList.add('jql-row');
                        row.appendChild(context.toolbar);
                        container.appendChild(row);
                        var row2 = document.createElement('div');
                        row2.classList.add('jql-row');
                        row2.appendChild(context.table);
                        container.appendChild(row2);
                    }
                    break;
                case 'bottom':
                    {
                        var row = document.createElement('div');
                        row.classList.add('jql-row');
                        row.appendChild(context.table);
                        container.appendChild(row);
                        var row2 = document.createElement('div');
                        row2.classList.add('jql-row');
                        row2.appendChild(context.toolbar);
                        container.appendChild(row2);
                    }
                    break;
                case 'left':
                    {
                        var column = document.createElement('div');
                        column.classList.add('jql-column');
                        column.appendChild(context.toolbar);
                        container.appendChild(column);
                        var column2 = document.createElement('div');
                        column2.classList.add('jql-column');
                        column2.appendChild(context.table);
                        container.appendChild(column2);
                    }
                    break;
                case 'right':
                    {
                        var column = document.createElement('div');
                        column.classList.add('jql-column');
                        column.appendChild(context.table);
                        container.appendChild(column);
                        var column2 = document.createElement('div');
                        column2.classList.add('jql-column');
                        column2.appendChild(context.toolbar);
                        container.appendChild(column2);
                    }
                    break;
            }
        }
        else {
            container.appendChild(this.table);
        }
        document.dispatchEvent(new Event('jqxelready'));
        return container;
    }
    buildTable(className) {
        var context = this;
        var table = document.createElement('div');
        if (context.headers) {
            var row = context.createRow(true, false, 0);
            if (context.toolbarOptions.includeRowNumbers) {
                row.appendChild(context.createRowHeaderCell(''));
            }
            for (var i = 0; i < context.headers.length; i++) {
                var cell = document.createElement('div'), header = context.headers[i];
                cell.classList.add('jql-tbl-hdr-cll');
                cell.classList.add('jql-btn');
                if (header.className) {
                    cell.className += ' ' + header.className;
                }
                cell.textContent = context.headers[i].text;
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
        if (context.data) {
            table.classList.add('jql-tbl');
            if (className) {
                table.className += ' ' + className;
            }
            var miniTlbrTbl = document.createElement('div');
            miniTlbrTbl.classList.add('jql-mn-tlbr-tbl');
            for (var y = 0, length = context.data.length; y < length; y++) {
                var rowData = context.data[y];
                var row = context.createRow(false, false, y + 1, rowData.className);
                if (context.toolbarOptions.includeRowNumbers) {
                    row.appendChild(context.createRowHeaderCell((y + 1).toString()));
                }
                for (var x = 0, xLength = rowData.data.length; x < xLength; x++) {
                    var cellData = rowData.data[x];
                    row.appendChild(context.createCell(cellData, x, context.headers[x].type));
                }
                table.appendChild(row);
                miniTlbrTbl.appendChild(context.createMiniToolbar(y + 1));
            }
            this.miniToolbar = miniTlbrTbl;
        }
        if (context.footer) {
            var row = context.createRow(false, true, context.data != null ? context.data.length + 1 : 9999);
            for (var i = 0; i < context.footer.length; i++) {
                var cell = document.createElement('div');
                cell.classList.add('jql-tbl-ftr-cll');
                cell.textContent = context.footer[i].text == '' ? ' ' : context.footer[i].text;
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
        this.table = table;
    }
    getClipboardText() {
        var selectedText = '', context = this;
        var rows = context.highlightedRows;
        if (rows && rows.length > 0) {
            for (var i = 0, length = rows.length; i < length; i++) {
                for (var x = 0, rowLength = rows[i].data.length; x < rowLength; x++) {
                    selectedText += (rows[i].data[x].text == null ? '' : rows[i].data[x].text + '\t');
                }
                selectedText += '\n';
            }
        }
        return selectedText;
    }
    appendRow() {
        var context = this;
        var rowIndex = (context.data.length + 1);
        var footer = context.table.lastChild;
        if (context.footer && context.footer.length) {
            rowIndex--;
            context.table.removeChild(footer);
        }
        var colCount = context.headers.length, row = context.createRow(false, false, rowIndex);
        var rowData = context.createNewDataRow();
        row = context.populateNewRow(row, rowData.data);
        context.data.push(rowData);
        if (context.footer && context.footer.length) {
            context.table.appendChild(row);
            context.table.appendChild(footer);
        }
        window.scrollTo(0, context.findPos(row));
    }
    copyToClipboard() {
        document.execCommand('copy');
        document.dispatchEvent(new ClipboardEvent('copy', { dataType: 'text/plain', data: this.getClipboardText() }));
    }
    buildToolbar(toolbarOptions) {
        var toolbar = document.createElement('div'), ul = document.createElement('ul'), context = this;
        this.toolbarOptions = toolbarOptions;
        toolbar.classList.add('jql-tlbr');
        toolbar.classList.add('jql-tlbr-' + toolbarOptions.position);
        ul.classList.add('jql-tlbr-lst');
        if (toolbarOptions.add) {
            var li = document.createElement('li'), addBtn = document.createElement('button');
            addBtn.classList.add('jql-tlbr-btn');
            addBtn.classList.add('jql-btn');
            addBtn.id = 'jqlAddBtn';
            addBtn.textContent = 'Add Row';
            addBtn.onclick = function (e) {
                context.appendRow();
            };
            li.appendChild(addBtn);
            ul.appendChild(li);
        }
        if (toolbarOptions.copy) {
            var li = document.createElement('li'), copyBtn = document.createElement('button');
            copyBtn.classList.add('jql-tlbr-btn');
            copyBtn.classList.add('jql-btn');
            copyBtn.id = 'jqlCopyBtn';
            copyBtn.textContent = 'Copy';
            copyBtn.onclick = function (e) {
                context.copyToClipboard();
            };
            li.appendChild(copyBtn);
            ul.appendChild(li);
        }
        toolbar.appendChild(ul);
        return toolbar;
    }
    createRow(isHeader, isFooter, index, className) {
        var row = document.createElement('div');
        row.dataset['rowIndex'] = index.toString();
        if (isHeader) {
            row.classList.add('jql-tbl-hdr-rw');
        }
        else if (isFooter) {
            row.classList.add('jql-tbl-ftr-rw');
        }
        else {
            row.classList.add('jql-tbl-rw');
        }
        if (className) {
            row.className += ' ' + className;
        }
        return row;
    }
    createRowHeaderCell(rowIndex) {
        var context = this, cell = document.createElement('div');
        cell.textContent = rowIndex;
        cell.classList.add('jql-tbl-rw-hdr-cll');
        cell.classList.add('jql-btn');
        var index = parseInt(rowIndex);
        if (index > 0) {
            var index = parseInt(rowIndex) - 1; // account for header row
            cell.appendChild(this.createMiniToolbar(index));
            cell.onmousedown = function (e) {
                context.toggleHighlight(index);
            };
        }
        return cell;
    }
    createCell(cellData, index, type) {
        var cell = document.createElement('div');
        if (cellData.editable == 'True') {
            cell.setAttribute('contenteditable', 'true');
        }
        cell.classList.add('jql-tbl-cll');
        if (cellData.className) {
            cell.className += ' ' + cellData.className;
        }
        cell.tabIndex = index;
        cell.dataset['index'] = index.toString();
        cell.dataset['name'] = cellData.name;
        cell.dataset['value'] = cellData.value;
        cell.dataset['entityid'] = cellData.entityId.toString();
        if (cellData.html) {
            cell.appendChild(cellData.html);
        }
        else {
            cell.textContent = $('<div/>').html(cellData.text).text() || ' ';
        }
        this.bindFocus(cell);
        return cell;
    }
    clearSelected() {
        var context = this;
        if (context.selectedCell) {
            var rowIndex = context.selectedCell.getRowIndex(), textContent = context.selectedCell.cell.textContent;
            var dataRow = context.data[rowIndex];
            var index = parseInt(context.selectedCell.cell.dataset['index']); // -1 to ignore row header
            if (dataRow.data[index] && dataRow.data[index].text) {
                context.setItemValue(rowIndex, index, textContent);
            }
            if (context.headers[index].type === 'text' && context.selectedCell.cell.hasAttribute('contenteditable')) {
                context.selectedCell.cell.dataset['value'] = textContent;
            }
            context.selectedCell.cell.classList.remove('jql-slctd');
            context.selectedCell.cell.removeEventListener('keydown', function () { });
        }
    }
    select(cell) {
        var context = this;
        context.bindNavigation(cell);
        var header = context.headers[parseInt(cell.dataset['index'])];
        var rowIndex = Math.max(0, parseInt(cell.parentElement.dataset['rowIndex']) - 1);
        context.container.dispatchEvent(new Event('beforecellchange'));
        context.selectedCell = new SelectedCell(cell, header.type, context.data[rowIndex], header.options);
    }
    moveDown() {
        var context = this;
        if (context.selectedCell) {
            context.container.dispatchEvent(new Event('beforerowchange'));
            var row = context.selectedCell.cell.parentElement;
            var index = $(row).children().index($(context.selectedCell.cell));
            if (row.nextElementSibling && row.nextElementSibling.childNodes) {
                var nextCell = row.nextElementSibling.childNodes[index];
                if (nextCell) {
                    context.selectedCell.cell.blur();
                    nextCell.focus();
                }
            }
        }
    }
    moveUp() {
        var context = this;
        if (context.selectedCell) {
            context.container.dispatchEvent(new Event('beforerowchange'));
            var row = context.selectedCell.cell.parentElement;
            var index = $(row).children().index($(context.selectedCell.cell));
            if (row.previousElementSibling && !row.previousElementSibling.classList.contains('jql-tbl-hdr-rw') && row.previousElementSibling.childNodes) {
                var nextCell = row.previousElementSibling.childNodes[index];
                if (nextCell) {
                    context.selectedCell.cell.blur();
                    nextCell.focus();
                }
            }
        }
    }
    moveLeft() {
        var context = this;
        if (context.selectedCell) {
            context.container.dispatchEvent(new Event('beforecolumnchange'));
            var nextCell = context.selectedCell.cell.previousElementSibling;
            if ((!nextCell || nextCell.classList.contains('jql-tbl-rw-hdr-cll')) && context.selectedCell.cell.parentElement.previousElementSibling) {
                context.container.dispatchEvent(new Event('beforerowchange'));
                nextCell = context.selectedCell.cell.parentElement.previousElementSibling.lastChild;
            }
            if (nextCell) {
                context.selectedCell.cell.blur();
                nextCell.focus();
            }
        }
    }
    moveRight() {
        var context = this;
        if (context.selectedCell) {
            context.container.dispatchEvent(new Event('beforecolumnchange'));
            var nextCell = context.selectedCell.cell.nextElementSibling;
            if (!nextCell && context.selectedCell.cell.parentElement.nextElementSibling) {
                var nextRow = context.selectedCell.cell.parentElement.nextElementSibling;
                context.container.dispatchEvent(new Event('beforerowchange'));
                nextCell = nextRow.getElementsByClassName('jql-tbl-cll')[0];
            }
            if (nextCell) {
                context.selectedCell.cell.blur();
                nextCell.focus();
            }
        }
    }
    returnRow(rowIndex) {
        return this.data && this.data[rowIndex] ? this.data[rowIndex] : new JSONRow(new Array(), 0, '');
    }
    returnColumn(cellIndex) {
        var context = this, colData = new Array();
        if (context.data && context.data.length > 0) {
            for (var x = 0, length = context.data.length; x < length; x++) {
                colData.push(context.data[x].data[cellIndex]);
            }
        }
        return colData;
    }
    toggleHighlight(rowIndex) {
        var row = this.table.getElementsByClassName('jql-tbl-rw')[rowIndex];
        row.classList.toggle('jql-hlght');
        var rowData = this.returnRow(rowIndex);
        if (row.classList.contains('jql-hlght')) {
            if (!this.highlightedRows) {
                this.highlightedRows = new Array();
            }
            var add = true;
            for (var i = 0, length = this.highlightedRows.length; i < length; i++) {
                if (this.highlightedRows[i] == rowData) {
                    add = false;
                    break;
                }
            }
            if (add) {
                this.highlightedRows.push(rowData);
            }
        }
        else {
            if (this.highlightedRows) {
                this.highlightedRows = this.highlightedRows.filter(x => x != rowData);
            }
        }
    }
}
class SelectedCell {
    constructor(cell, type, parentRow, options) {
        this.cell = cell;
        this.parentJSON = parentRow;
        this.select(type, options);
    }
    get html() {
        return $(this.cell.innerHTML)[0];
    }
    set html(value) {
        this.cell.innerHTML = '';
        this.cell.appendChild(value);
    }
    get name() {
        return this.cell.dataset['name'];
    }
    get text() {
        return this.cell.innerText;
    }
    set text(value) {
        this.cell.innerText = value;
    }
    get val() {
        return this.cell.dataset['value'];
    }
    set val(value) {
        this.cell.dataset['value'] = value;
    }
    alert(message) {
        this.cell.parentElement.classList.add('jql-alert');
        if (message && message.length) {
            this.cell.parentElement.title = message;
        }
    }
    removeAlert() {
        this.cell.parentElement.classList.remove('jql-alert');
        this.cell.parentElement.removeAttribute('title');
    }
    getRowIndex() {
        var context = this, index = 0;
        var row = context.cell.parentElement;
        var allRows = $(row).parent('.jql-tbl').children('.jql-tbl-rw');
        return Math.max(allRows.index($(row)), 0);
    }
    getRowValues(includeRowHeader) {
        var context = this, rowValues = new Array();
        var row = context.cell.parentElement;
        for (var i = includeRowHeader ? 1 : 0; i < row.children.length; i++) {
            rowValues.push(row.children[i].dataset['value']);
        }
        return rowValues;
    }
    getRowObject() {
        var context = this, rowObject = new Object();
        rowObject[context.parentJSON.idName] = context.parentJSON.entityId;
        var row = context.cell.parentElement;
        for (var i = 1; i < row.children.length; i++) {
            var child = row.children[i];
            rowObject[child.dataset['name']] = child.dataset['value'];
        }
        return rowObject;
    }
    preventDefault(e) {
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
    }
    disableScroll() {
        // TODO: decide if this is even helpful
        $('body').on('mousewheel', function (e) {
            if (!e.target.classList.contains('jql-tbl-cll'))
                return;
            e.preventDefault();
            e.stopPropagation();
        });
    }
    enableScroll() {
        $('body').unbind('mousewheel');
    }
    select(type, options) {
        var context = this;
        context.cell.classList.add('jql-slctd');
        if (type === 'select' && options.length) {
            context.disableScroll();
            var select = document.createElement('ul');
            select.classList.add('jql-slct-lst');
            for (var i = 0; i < options.length; i++) {
                var li = document.createElement('li'), text = $(options[i]).text(), value = $(options[i]).val();
                li.textContent = text;
                li.dataset['value'] = value;
                select.appendChild(li);
            }
            context.cell.appendChild(select);
            $(select).on('click', 'li', function (e) {
                var val = $(this).text();
                context.cell.textContent = val;
                context.cell.dataset['value'] = $(this)[0].dataset['value'];
                $(context.cell).blur();
            });
            $(context.cell).on('blur', function (e) {
                $(context.cell).find('ul').remove();
                context.enableScroll();
            });
        }
        else if (type === 'text') {
            context.cell.innerText = context.cell.dataset['value'];
        }
    }
    unselect() {
    }
}
(function ($, window, document) {
    var defaults = {
        data: new Array(),
        headers: new Array(),
        footer: new Array(),
        beforeRowChange: function () { },
        beforeColumnChange: function () { },
        beforeCellChange: function () { },
        onCopy: function () { },
        onjQXelReady: function (table) { },
        toolbarOptions: new ToolbarOptions(true, true, true, true, 'left'),
        themeOptions: new ThemeOptions('blu', 'normal'),
        className: null
    };
    $.fn.jQXel = function (options) {
        defaults = $.extend(defaults, options);
        return this.each(function (index, item) {
            return new JSONTable(defaults.data, defaults.headers, defaults.footer, item.id, defaults.beforeCellChange, defaults.beforeColumnChange, defaults.beforeRowChange, defaults.onCopy, defaults.onjQXelReady, defaults.toolbarOptions, defaults.themeOptions, defaults.className);
        });
    };
})(jQuery, window, document);
//# sourceMappingURL=jQXel.js.map