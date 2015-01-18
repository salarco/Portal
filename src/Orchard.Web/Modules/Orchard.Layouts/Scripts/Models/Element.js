var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Element = function (type, data, htmlId, htmlClass, htmlStyle, isTemplated) {
        if (!type)
            throw new Error("Parameter 'type' is required.");

        this.type = type;
        this.data = data;
        this.htmlId = htmlId;
        this.htmlClass = htmlClass;
        this.htmlStyle = htmlStyle;
        this.isTemplated = isTemplated;

        this.canvas = null;
        this.parent = null;
        this.isDropTarget = null;
        this.setIsFocusedEventHandlers = [];

        this.setCanvas = function (canvas) {
            this.canvas = canvas;
            if (!!this.children && _.isArray(this.children)) {
                _(this.children).each(function (child) {
                    child.setCanvas(canvas);
                });
            }
        };

        this.setIsTemplated = function (value) {
            this.isTemplated = value;
            if (!!this.children && _.isArray(this.children)) {
                _(this.children).each(function (child) {
                    child.setIsTemplated(value);
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
            if (this.canvas.isDragging)
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
            if (this.canvas.isDragging || this.canvas.inlineEditingIsActive)
                return;

            this.canvas.focusedElement = this;
            _(this.setIsFocusedEventHandlers).each(function (item) {
                try {
                    item();
                }
                catch (ex) {
                    // Ignore.
                }
            });
        };

        this.getIsSelected = function() {
            if (this.getIsFocused())
                return true;

            if (!!this.children && _.isArray(this.children)) {
                return _(this.children).any(function(child) {
                    return child.getIsSelected();
                });
            }

            return false;
        };

        this.delete = function () {
            if (this.isTemplated)
                return;

            if (!!this.parent)
                this.parent.deleteChild(this);
        };

        this.moveUp = function () {
            if (this.isTemplated)
                return;

            if (!!this.parent)
                this.parent.moveChildUp(this);
        };

        this.moveDown = function () {
            if (this.isTemplated)
                return;

            if (!!this.parent)
                this.parent.moveChildDown(this);
        };

        this.canMoveUp = function () {
            if (this.isTemplated)
                return false;

            if (!this.parent)
                return false;
            return this.parent.canMoveChildUp(this);
        };

        this.canMoveDown = function () {
            if (this.isTemplated)
                return false;

            if (!this.parent)
                return false;
            return this.parent.canMoveChildDown(this);
        };

        this.elementToObject = function () {
            return {
                type: this.type,
                data: this.data,
                htmlId: this.htmlId,
                htmlClass: this.htmlClass,
                htmlStyle: this.htmlStyle,
                isTemplated: this.isTemplated
            };
        };

        this.copy = function (clipboardData) {
            var text = this.getInnerText();
            clipboardData.setData("text/plain", text);
            console.log(text);

            var data = this.toObject();
            var json = JSON.stringify(data, null, "\t");
            clipboardData.setData("text/json", json);
        };

        this.cut = function (clipboardData) {
            if (this.isTemplated)
                return;

            this.copy(clipboardData);
            this.delete();
        };

        this.paste = function (clipboardData) {
            if (!!this.parent)
                this.parent.paste(clipboardData);
        };
    };

})(LayoutEditor || (LayoutEditor = {}));