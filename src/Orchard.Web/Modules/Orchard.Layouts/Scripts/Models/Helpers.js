var LayoutEditor;
(function (LayoutEditor) {

    Array.prototype.move = function (from, to) {
        this.splice(to, 0, this.splice(from, 1)[0]);
    };

    LayoutEditor.childrenFrom = function (values) {
        return _(values).map(function (value) {
            switch (value.type) {
                case "Grid":
                    return LayoutEditor.Grid.from(value);
                case "Row":
                    return LayoutEditor.Row.from(value);
                case "Column":
                    return LayoutEditor.Column.from(value);
                case "Content":
                    return LayoutEditor.Content.from(value);
            }
        });
    }

    LayoutEditor.setModel = function (elementSelector, model) {
        $(elementSelector).scope().element = model;
    };

    LayoutEditor.getModel = function (elementSelector) {
        return $(elementSelector).scope().element;
    };

})(LayoutEditor || (LayoutEditor = {}));