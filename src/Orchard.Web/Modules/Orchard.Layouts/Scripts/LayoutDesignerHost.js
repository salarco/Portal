(function ($) {

    var LayoutDesignerHost = function (element) {
        var self = this;
        this.element = element;
        this.element.data("layout-designer-host", this);
        this.settings = {
            antiForgeryToken: self.element.data("anti-forgery-token"),
            editorDialogTitleFormat: self.element.data("editor-dialog-title-format"),
            editorDialogName: self.element.data("editor-dialog-name"),
            confirmDeletePrompt: self.element.data("confirm-delete-prompt"),
            displayType: self.element.data("display-type"),
            endpoints: {
                render: self.element.data("render-url"),
                edit: self.element.data("edit-url"),
                add: self.element.data("add-url"),
                settings: self.element.data("settings-url"),
                browse: self.element.data("element-browser-url"),
                applyTemplate: self.element.data("apply-template-url")
            },
            domOperations: {
                append: function (container, element) { container.append(element); },
                replace: function (currentElement, newElement) { currentElement.replaceWith(newElement); }
            }
        };

        this.editElement = function (elementType, elementData) {
            var dialog = new window.Orchard.Layouts.Dialog(".dialog-template." + self.settings.editorDialogName);
            var deferred = new $.Deferred();

            dialog.show();
            dialog.load(self.settings.endpoints.edit, {
                typeName: elementType,
                elementData: elementData,
                __RequestVerificationToken: self.settings.antiForgeryToken
            }, "post");

            dialog.element.on("command", function (e, args) {
                if (args.command == "save") {
                    deferred.resolve(args);
                    dialog.close();
                }
            });

            return deferred.promise();
        };

        this.addElement = function (elementType, elementLabel) {
            var dialog = new window.Orchard.Layouts.Dialog(".dialog-template." + self.settings.editorDialogName);
            var deferred = new $.Deferred();
            var url = self.settings.endpoints.add + "&typeName=" + elementType;

            dialog.show();
            dialog.load(url);

            dialog.element.on("command", function (e, args) {
                if (args.command == "add" || args.command == "save") {
                    deferred.resolve(args);
                    dialog.close();
                }
            });

            return deferred.promise();
        };

        monitorForm = function() {
            var layoutDesigner = self.element;
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
            var layoutDataDataJson = JSON.stringify(layoutData, null, "\t");

            templateField.val(selectedTemplateId);
            layoutDataField.val(layoutDataDataJson);
        };

        monitorForm();
    };

    // Export types.
    window.Orchard = window.Orchard || {};
    window.Orchard.Layouts = window.Orchard.Layouts || {};
    window.Orchard.Layouts.LayoutEditorHost = window.Orchard.Layouts.LayoutEditorHost || {};

    $(function () {
        var host = new LayoutDesignerHost($(".layout-designer"));
    });
})(jQuery);