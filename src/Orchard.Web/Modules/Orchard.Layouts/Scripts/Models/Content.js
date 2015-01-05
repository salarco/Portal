var LayoutEditor;
(function (LayoutEditor) {

    LayoutEditor.Content = function (data, id, cssClasses, cssStyles, contentType, contentTypeLabel, contentTypeClass, html) {
        LayoutEditor.Element.call(this, "Content", data, id, cssClasses, cssStyles);

        this.contentType = contentType;
        this.contentTypeLabel = contentTypeLabel;
        this.contentTypeClass = contentTypeClass;
        this.html = html;

        this.toObject = function () {
            return {
                "type": "Content"
            };
        };

        this.toObject = function () {
            var result = this.elementToObject();
            result.contentType = this.contentType;
            result.contentTypeLabel = this.contentTypeLabel;
            result.contentTypeClass = this.contentTypeClass;
            result.html = this.html;
            return result;
        };
    };

    LayoutEditor.Content.from = function (value) {
        return new LayoutEditor.Content(value.data, value.id, value.cssClasses, value.cssStyles, value.contentType, value.contentTypeLabel, value.contentTypeClass, value.html);
    };

})(LayoutEditor || (LayoutEditor = {}));