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