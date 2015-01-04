(function ($) {

    var LayoutEditorHost = function (element) {
        var self = this;
        this.element = element;

        this.monitorForm = function() {
            var layoutDesigner = this.element;
            var form = layoutDesigner.closest("form");
            
            form.on("submit", function (e) {
                serializeLayout();
                serializeTrash();
            });
        };

        var serializeLayout = function () {
            var form = self.element.closest("form");
            var templateFieldName = self.element.data("template-picker-name");
            var templateField = form.find("input[name=\"" + templateFieldName + "\"]");
            var frameDocument = self.frame.getDocument();
            var templatePicker = frameDocument.find("select[name='template-picker']");
            var selectedTemplateId = templatePicker.val();

            templateField.val(selectedTemplateId);
            serialize("Data-field-name", ".canvas");
        };

        var serializeTrash = function () {
            serialize("trash-field-name", ".trash");
        };

        var serialize = function (stateFieldDataName, scopeSelector) {
            var layoutDesigner = self.element;
            var stateFieldName = layoutDesigner.data(stateFieldDataName);
            var stateField = layoutDesigner.find("input[name=\"" + stateFieldName + "\"]");
            var frameDocument = self.frame.getDocument();
            var scope = frameDocument.find(scopeSelector);
            var graph = {};
            var serializer = window.Orchard.Layouts.Serializer;

            serializer.serialize(graph, scope);
            var state = JSON.stringify(graph);
            stateField.val(state);
        };
    };

    // Export types.
    window.Orchard = window.Orchard || {};
    window.Orchard.Layouts = window.Orchard.Layouts || {};
    window.Orchard.Layouts.LayoutEditorHost = window.Orchard.Layouts.LayoutEditorHost || {};

    $(function () {
        $(".layout-designer").each(function() {
            var host = new LayoutEditorHost($(this));
            host.monitorForm();
        });
    });
})(jQuery);