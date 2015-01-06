var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Canvas = function (config, data, id, cssClasses, cssStyles, children) {
        LayoutEditor.Element.call(this, "Canvas", data, id, cssClasses, cssStyles);
        LayoutEditor.Container.call(this, ["Grid", "Content"], children);

        this.config = config;
        this.activeElement = null;
        this.focusedElement = null;
        this.isDragging = false;
        this.setCanvas(this);

        var self = this;
        function addGrid() {
            var grid = new LayoutEditor.Grid(null, null, null, null, []);
            self.addChild(grid);
            grid.setIsFocused();
        }

        this.availableAddOperations = [
            { name: "Grid", invoke: function () { addGrid(); } }
        ]
        
        this.toObject = function () {
            var result = this.elementToObject();
            result.children = this.childrenToObject();
            return result;
        };
    };

    LayoutEditor.Canvas.from = function (config, value) {
        return new LayoutEditor.Canvas(config, value.data, value.id, value.cssClasses, value.cssStyles, LayoutEditor.childrenFrom(value.children));
    };

})(LayoutEditor || (LayoutEditor = {}));
