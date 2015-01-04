(function ($) {

    var LayoutDesignerHost = function (element) {
        var self = this;
        this.element = element;

        this.monitorForm = function() {
            var layoutDesigner = this.element;
            var form = layoutDesigner.closest("form");
            
            form.on("submit", function (e) {
                serializeLayout();
            });
        };

        var serializeLayout = function () {
            var templateField = self.element.find(".template-id-field");
            var templatePicker = self.element.find("select[name='template-picker']");
            var layoutDataField = self.element.find(".layout-data-field");
            var selectedTemplateId = templatePicker.val();
            var layoutData = window.layoutDesignerCanvas.toObject();
            var layoutDataDataJson = JSON.stringify(layoutData, null, '\t');

            templateField.val(selectedTemplateId);
            layoutDataField.val(layoutDataDataJson);
        };
    };

    // Export types.
    window.Orchard = window.Orchard || {};
    window.Orchard.Layouts = window.Orchard.Layouts || {};
    window.Orchard.Layouts.LayoutEditorHost = window.Orchard.Layouts.LayoutEditorHost || {};

    $(function () {
        var host = new LayoutDesignerHost($(".layout-designer"));
        host.monitorForm();

    });
})(jQuery);