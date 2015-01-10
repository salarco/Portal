var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Row = function (data, htmlId, htmlClass, htmlStyle, children) {
        LayoutEditor.Element.call(this, "Row", data, htmlId, htmlClass, htmlStyle);
        LayoutEditor.Container.call(this, ["Column"], children);

        this.canAddColumn = function () {
            return getTotalColumnsWidth() < 12;
        };

        this.addColumn = function () {
            if (!this.canAddColumn())
                return;

            var totalColumnsWidth = getTotalColumnsWidth();
            if (totalColumnsWidth < 12) {
                var column = new LayoutEditor.Column(null, null, null, null, 12 - totalColumnsWidth, 0, []);
                this.addChild(column);
                column.setIsFocused();
            }
        };

        this.canDecreaseColumnWidth = function (column) {
            return column.width > 1;
        };

        this.decreaseColumnWidth = function (column) {
            if (!this.canDecreaseColumnWidth(column))
                return;

            var index = _(this.children).indexOf(column);
            if (index >= 0) {
                if (column.width > 1) {
                    column.width--;
                    if (this.children.length > index + 1) {
                        var nextColumn = this.children[index + 1];
                        nextColumn.offset++;
                    }
                }
            }
        };

        this.canIncreaseColumnWidth = function (column) {
            var index = _(this.children).indexOf(column);
            if (index >= 0) {
                if (column.width >= 12)
                    return false;
                if (this.children.length > index + 1) {
                    var nextColumn = this.children[index + 1];
                    return nextColumn.offset > 0;
                }
                return getTotalColumnsWidth() < 12;
            }
            return false;
        };

        this.increaseColumnWidth = function (column) {
            if (!this.canIncreaseColumnWidth(column))
                return;

            var index = _(this.children).indexOf(column);
            if (index >= 0) {
                if (this.children.length > index + 1) {
                    var nextColumn = this.children[index + 1];
                    if (nextColumn.offset > 0)
                        nextColumn.offset--;
                }
                column.width++;
            }
        };

        this.canDecreaseColumnOffset = function (column) {
            var index = _(this.children).indexOf(column);
            if (index >= 0)
                return column.offset > 0;
            return false;
        };

        this.decreaseColumnOffset = function (column, adjustWidth) {
            if (!this.canDecreaseColumnOffset(column))
                return;

            var index = _(this.children).indexOf(column);
            if (index >= 0) {
                if (column.offset > 0) {
                    column.offset--;
                    if (adjustWidth)
                        column.width++;
                    else if (this.children.length > index + 1) {
                        var nextColumn = this.children[index + 1];
                        nextColumn.offset++;
                    }
                }
            }
        };

        this.canIncreaseColumnOffset = function (column) {
            var index = _(this.children).indexOf(column);
            if (index >= 0) {
                if (column.width > 1)
                    return true;
                if (this.children.length > index + 1) {
                    var nextColumn = this.children[index + 1];
                    return nextColumn.offset > 0;
                }
                return getTotalColumnsWidth() < 12;
            }
            return false;
        };

        this.increaseColumnOffset = function (column, adjustWidth) {
            if (!this.canIncreaseColumnOffset(column))
                return;

            var index = _(this.children).indexOf(column);
            if (index >= 0) {
                if (this.children.length > index + 1) {
                    var nextColumn = this.children[index + 1];
                    if (nextColumn.offset > 0)
                        nextColumn.offset--;
                    else
                        column.width--;
                }
                else {
                    if (getTotalColumnsWidth() >= 12)
                        column.width--;
                }

                column.offset++;
            }
        };

        this.toObject = function () {
            var result = this.elementToObject();
            result.children = this.childrenToObject();
            return result;
        };

        var self = this;
        function getTotalColumnsWidth() {
            return _(self.children)
                .filter(function (child) {
                    return child.type === "Column";
                })
                .reduce(function (memo, child) {
                    return memo + child.offset + child.width;
                }, 0);
        }
    };

    LayoutEditor.Row.from = function (value) {
        return new LayoutEditor.Row(value.data, value.htmlId, value.htmlClass, value.htmlStyle, LayoutEditor.childrenFrom(value.children));
    };

})(LayoutEditor || (LayoutEditor = {}));