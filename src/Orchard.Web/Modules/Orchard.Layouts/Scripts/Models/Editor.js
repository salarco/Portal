var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Editor = function (config, canvasData) {
        this.config = config;
        this.canvas = LayoutEditor.Canvas.from(canvasData);
        this.activeElement = null;
        this.focusedElement = null;
        this.isDragging = false;
        this.inlineEditingIsActive = false;

        this.canvas.setEditor(this);
    };

})(LayoutEditor || (LayoutEditor = {}));
