var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Canvas = function (config, data, htmlId, htmlClass, htmlStyle, isTemplated, children) {
        LayoutEditor.Element.call(this, "Canvas", data, htmlId, htmlClass, htmlStyle, isTemplated);
        LayoutEditor.Container.call(this, ["Grid", "Content"], children);

        this.config = config;
        this.activeElement = null;
        this.focusedElement = null;
        this.isDragging = false;
        this.inlineEditingIsActive = false;
        this.clipboard = null;
        this.setCanvas(this);

        var self = this;
        function addGrid() {
            var grid = LayoutEditor.Grid.from({
                data: null,
                htmlId: null,
                htmlClass: null,
                htmlStyle: null,
                isTemplated: false,
                children: []
            });
            self.addChild(grid);
            grid.setIsFocused();
        }

        this.availableAddOperations = [
            { name: "Grid", invoke: function() { addGrid(); } }
        ];

        this.toObject = function () {
            var result = this.elementToObject();
            result.children = this.childrenToObject();
            return result;
        };
    };

    LayoutEditor.Canvas.from = function (config, value) {
        return new LayoutEditor.Canvas(
            config,
            value.data,
            value.htmlId,
            value.htmlClass,
            value.htmlStyle,
            value.isTemplated,
            LayoutEditor.childrenFrom(value.children));
    };

})(LayoutEditor || (LayoutEditor = {}));
