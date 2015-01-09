var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Grid = function (data, htmlId, htmlClass, htmlStyle, children) {
        LayoutEditor.Element.call(this, "Grid", data, htmlId, htmlClass, htmlStyle);
        LayoutEditor.Container.call(this, ["Row"], children);

        var self = this;
        function addRow(numColumns) {
            var columns = numColumns > 0 ? LayoutEditor.Column.times(numColumns) : [];
            var row = new LayoutEditor.Row(null, null, null, null, columns);
            self.addChild(row);
            row.setIsFocused();
        }

        this.availableAddOperations = [
            { name: "Empty row", invoke: function() { addRow(0); } },
            { name: "1 column (of width 12)", invoke: function() { addRow(1); } },
            { name: "2 columns (of width 6)", invoke: function() { addRow(2); } },
            { name: "3 columns (of width 4)", invoke: function() { addRow(3); } },
            { name: "4 columns (of width 3)", invoke: function() { addRow(4); } },
            { name: "6 columns (of width 2)", invoke: function() { addRow(6); } },
            { name: "12 columns (of width 1)", invoke: function() { addRow(12); } }
        ];

        this.toObject = function () {
            var result = this.elementToObject();
            result.children = this.childrenToObject();
            return result;
        };
    };

    LayoutEditor.Grid.from = function (value) {
        return new LayoutEditor.Grid(value.data, value.htmlId, value.htmlClass, value.htmlStyle, LayoutEditor.childrenFrom(value.children));
    };

})(LayoutEditor || (LayoutEditor = {}));