var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Container = function (allowedChildTypes, children) {

        this.allowedChildTypes = allowedChildTypes;
        this.children = children;
        this.isContainer = true;

        var parent = this;
        _(this.children).each(function(child) {
            child.parent = parent;
        });

        this.addChild = function (child) {
            if (!_(this.children).contains(child) && _(allowedChildTypes).contains(child.type))
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

        this.pasteChildFromClipboard = function () {
            if (!!this.canvas.clipboard) {
                var data = this.canvas.clipboard.toObject();
                var child = LayoutEditor.elementFrom(data);
                if (_(allowedChildTypes).contains(child.type)) {
                    this.addChild(child);
                    child.setIsFocused();
                }
                else if (!!this.parent)
                    this.parent.pasteChildFromClipboard();
            }
        };
    };

})(LayoutEditor || (LayoutEditor = {}));