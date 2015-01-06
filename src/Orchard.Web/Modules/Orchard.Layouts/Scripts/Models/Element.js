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
        this.isDropTarget = null;

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