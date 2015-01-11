var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Column = function (data, htmlId, htmlClass, htmlStyle, width, offset, children) {
        LayoutEditor.Element.call(this, "Column", data, htmlId, htmlClass, htmlStyle);
        LayoutEditor.Container.call(this, ["Grid", "Content"], children);

        this.width = width;
        this.offset = offset;

        this.canSplit = function () {
            return this.width > 1;
        };

        this.split = function () {
            if (!this.canSplit())
                return;
            var newColumnWidth = Math.floor(this.width / 2);
            var newColumn = new LayoutEditor.Column(null, null, null, null, newColumnWidth, 0, []);
            this.width = this.width - newColumnWidth;
            this.parent.insertChild(newColumn, this);
            newColumn.setIsFocused();
        };

        this.canContractRight = function (connectAdjacent) {
            return this.parent.canContractColumnRight(this, connectAdjacent);
        };

        this.contractRight = function (connectAdjacent) {
            this.parent.contractColumnRight(this, connectAdjacent);
        };

        this.canExpandRight = function (connectAdjacent) {
            return this.parent.canExpandColumnRight(this, connectAdjacent);
        };

        this.expandRight = function (connectAdjacent) {
            this.parent.expandColumnRight(this, connectAdjacent);
        };

        this.canExpandLeft = function (connectAdjacent) {
            return this.parent.canExpandColumnLeft(this, connectAdjacent);
        };

        this.expandLeft = function (connectAdjacent) {
            this.parent.expandColumnLeft(this, connectAdjacent);
        };

        this.canContractLeft = function (connectAdjacent) {
            return this.parent.canContractColumnLeft(this, connectAdjacent);
        };

        this.contractLeft = function (connectAdjacent) {
            this.parent.contractColumnLeft(this, connectAdjacent);
        };

        var self = this;
        function addGrid() {
            var grid = new LayoutEditor.Grid(null, null, null, null, []);
            self.addChild(grid);
            grid.setIsFocused();
        }

        this.availableAddOperations = [
            { name: "Grid", invoke: function() { addGrid(); } }
        ];

        this.toObject = function () {
            var result = this.elementToObject();
            result.width = this.width;
            result.offset = this.offset;
            result.children = this.childrenToObject();
            return result;
        };
    };

    LayoutEditor.Column.from = function (value) {
        return new LayoutEditor.Column(value.data, value.htmlId, value.htmlClass, value.htmlStyle, value.width, value.offset, LayoutEditor.childrenFrom(value.children));
    };

    LayoutEditor.Column.times = function (value) {
        return _.times(value, function (n) {
            return new LayoutEditor.Column(null, null, null, null, 12 / value, 0, []);
        });
    };

})(LayoutEditor || (LayoutEditor = {}));