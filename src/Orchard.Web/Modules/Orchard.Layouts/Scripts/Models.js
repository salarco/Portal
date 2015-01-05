///#source 1 1 /Scripts/Models/Helpers.js
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
///#source 1 1 /Scripts/Models/Element.js
var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Element = function (type, data, id, cssClasses, cssStyles) {
        if (!type)
            throw new Error("Parameter 'type' is required.");

        this.type = type;
        this.data = data;
        this.id = id;
        this.cssClasses = cssClasses;
        this.cssStyles = cssStyles;

        this.canvas = null;
        this.parent = null;

        this.setCanvas = function (canvas) {
            this.canvas = canvas;
            if (!!this.children && _.isArray(this.children)) {
                _(this.children).each(function (child) {
                    child.setCanvas(canvas);
                });
            }
        };

        this.getIsActive = function () {
            if (!this.canvas)
                return false;
            return this.canvas.activeElement === this && !this.getIsFocused();
        };

        this.setIsActive = function (value) {
            if (!this.canvas)
                return;
            if (value)
                this.canvas.activeElement = this;
            else
                this.canvas.activeElement = this.parent;
        };

        this.getIsFocused = function () {
            if (!this.canvas)
                return false;
            return this.canvas.focusedElement === this;
        };

        this.setIsFocused = function () {
            if (!this.canvas)
                return;
            this.canvas.focusedElement = this;
        };

        this.getIsSelected = function () {
            if (this.getIsFocused())
                return true;

            if (!!this.children && _.isArray(this.children)) {
                return _(this.children).any(function (child) {
                    return child.getIsSelected();
                });
            }
        }

        this.delete = function () {
            if (!!this.parent)
                this.parent.deleteChild(this);
        };

        this.moveUp = function () {
            if (!!this.parent)
                this.parent.moveChildUp(this);
        };

        this.moveDown = function () {
            if (!!this.parent)
                this.parent.moveChildDown(this);
        };

        this.canMoveUp = function () {
            if (!this.parent)
                return false;
            return this.parent.canMoveChildUp(this);
        }

        this.canMoveDown = function () {
            if (!this.parent)
                return false;
            return this.parent.canMoveChildDown(this);
        }

        this.elementToObject = function () {
            return {
                type: this.type,
                data: this.data,
                id: this.id,
                cssClasses: this.cssClasses,
                cssStyles: this.cssStyles
            };
        };
    };

})(LayoutEditor || (LayoutEditor = {}));
///#source 1 1 /Scripts/Models/Container.js
var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Container = function (allowedChildTypes, children) {

        this.allowedChildTypes = allowedChildTypes;
        this.children = children;
        this.isContainer = true;

        var parent = this;
        _(this.children).each(function (child) {
            child.parent = parent;
        })

        this.addChild = function (child) {
            if (!_(this.children).contains(child))
                this.children.push(child);
            child.setCanvas(this.canvas);
            child.parent = this;
        };

        this.deleteChild = function (child) {
            var index = _(this.children).indexOf(child);
            if (index >= 0) {
                this.children.splice(index, 1);
                if (child.getIsActive())
                    this.canvas.activeElement = null;
                if (child.getIsFocused())
                    this.setIsFocused();
            }
        };

        this.insertChild = function (child, afterChild) {
            if (!_(this.children).contains(child)) {
                var index = Math.max(_(this.children).indexOf(afterChild), 0);
                this.children.splice(index + 1, 0, child);
                child.setCanvas(this.canvas);
                child.parent = this;
            }
        };

        this.moveChildUp = function (child) {
            if (!this.canMoveChildUp(child))
                return;
            var index = _(this.children).indexOf(child);
            this.children.move(index, index - 1);
        };

        this.moveChildDown = function (child) {
            if (!this.canMoveChildDown(child))
                return;
            var index = _(this.children).indexOf(child);
            this.children.move(index, index + 1);
        };

        this.canMoveChildUp = function (child) {
            var index = _(this.children).indexOf(child);
            return index > 0;
        };

        this.canMoveChildDown = function (child) {
            var index = _(this.children).indexOf(child);
            return index < this.children.length - 1;
        };

        this.childrenToObject = function () {
            return _(this.children).map(function (child) {
                return child.toObject();
            }); 
        };
    };

})(LayoutEditor || (LayoutEditor = {}));
///#source 1 1 /Scripts/Models/Canvas.js
var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Canvas = function (config, data, id, cssClasses, cssStyles, children) {
        LayoutEditor.Element.call(this, "Canvas", data, id, cssClasses, cssStyles);
        LayoutEditor.Container.call(this, ["Grid", "Content"], children);

        this.config = config;
        this.activeElement = null;
        this.focusedElement = null;
        this.setCanvas(this);

        this.toObject = function () {
            var result = this.elementToObject();
            result.children = this.childrenToObject();
            //console.log(result);
            //console.log(JSON.stringify(result, null, '\t'));
            return result;
        };
    };

    LayoutEditor.Canvas.from = function (config, value) {
        return new LayoutEditor.Canvas(config, value.data, value.id, value.cssClasses, value.cssStyles, LayoutEditor.childrenFrom(value.children));
    };

})(LayoutEditor || (LayoutEditor = {}));

///#source 1 1 /Scripts/Models/Grid.js
var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Grid = function (data, id, cssClasses, cssStyles, children) {
        LayoutEditor.Element.call(this, "Grid", data, id, cssClasses, cssStyles);
        LayoutEditor.Container.call(this, ["Row"], children);

        var self = this;
        function addRow(numColumns) {
            var columns = numColumns > 0 ? LayoutEditor.Column.times(numColumns) : [];
            var row = new LayoutEditor.Row(null, null, null, null, columns);
            self.addChild(row);
            row.setIsFocused();
        }

        this.availableAddOperations = [
            { name: "Empty row", invoke: function () { addRow(0); } },
            { name: "1 column (of width 12)", invoke: function () { addRow(1); } },
            { name: "2 columns (of width 6)", invoke: function () { addRow(2); } },
            { name: "3 columns (of width 4)", invoke: function () { addRow(3); } },
            { name: "4 columns (of width 3)", invoke: function () { addRow(4); } },
            { name: "6 columns (of width 2)", invoke: function () { addRow(6); } },
            { name: "12 columns (of width 1)", invoke: function () { addRow(12); } }
        ]

        this.toObject = function () {
            var result = this.elementToObject();
            result.children = this.childrenToObject();
            return result;
        };
    };

    LayoutEditor.Grid.from = function (value) {
        return new LayoutEditor.Grid(value.data, value.id, value.cssClasses, value.cssStyles, LayoutEditor.childrenFrom(value.children));
    };

})(LayoutEditor || (LayoutEditor = {}));
///#source 1 1 /Scripts/Models/Row.js
var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Row = function (data, id, cssClasses, cssStyles, children) {
        LayoutEditor.Element.call(this, "Row", data, id, cssClasses, cssStyles);
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

        this.canDecreaseColumnOffset = function (column) {
            var index = _(this.children).indexOf(column);
            if (index >= 0)
                return column.offset > 0;
            return false;
        };

        this.decreaseColumnOffset = function (column) {
            if (!this.canDecreaseColumnOffset(column))
                return;

            var index = _(this.children).indexOf(column);
            if (index >= 0) {
                if (column.offset > 0) {
                    column.offset--;
                    if (this.children.length > index + 1) {
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

        this.increaseColumnOffset = function (column) {
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
        return new LayoutEditor.Row(value.data, value.id, value.cssClasses, value.cssStyles, LayoutEditor.childrenFrom(value.children));
    };

})(LayoutEditor || (LayoutEditor = {}));
///#source 1 1 /Scripts/Models/Column.js
var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Column = function (data, id, cssClasses, cssStyles, width, offset, children) {
        LayoutEditor.Element.call(this, "Column", data, id, cssClasses, cssStyles);
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

        this.canDecreaseOffset = function () {
            return this.parent.canDecreaseColumnOffset(this);
        };

        this.decreaseOffset = function () {
            this.parent.decreaseColumnOffset(this);
        }

        this.canIncreaseOffset = function () {
            return this.parent.canIncreaseColumnOffset(this);
        };

        this.increaseOffset = function () {
            this.parent.increaseColumnOffset(this);
        };

        this.toObject = function () {
            var result = this.elementToObject();
            result.width = this.width;
            result.offset = this.offset;
            result.children = this.childrenToObject();
            return result;
        };
    };

    LayoutEditor.Column.from = function (value) {
        return new LayoutEditor.Column(value.data, value.id, value.cssClasses, value.cssStyles, value.width, value.offset, LayoutEditor.childrenFrom(value.children));
    };

    LayoutEditor.Column.times = function (value) {
        return _.times(value, function (n) {
            return new LayoutEditor.Column(null, null, null, null, 12 / value, 0, []);
        });
    };

})(LayoutEditor || (LayoutEditor = {}));
///#source 1 1 /Scripts/Models/Content.js
var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Content = function (data, id, cssClasses, cssStyles, contentType, label, html) {
        LayoutEditor.Element.call(this, "Content", data, id, cssClasses, cssStyles);

        this.contentType = contentType;
        this.label = label;
        this.html = html;

        this.toObject = function () {
            return {
                "type": "Content"
            };
        };

        this.toObject = function () {
            var result = this.elementToObject();
            result.contentType = this.contentType;
            result.html = this.html;
            return result;
        };
    };

    LayoutEditor.Content.from = function (value) {
        return new LayoutEditor.Content(value.data, value.id, value.cssClasses, value.cssStyles, value.contentType, value.label, value.html);
    };

})(LayoutEditor || (LayoutEditor = {}));
