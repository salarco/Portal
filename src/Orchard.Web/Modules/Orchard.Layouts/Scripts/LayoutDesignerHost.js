﻿(function ($) {

    var LayoutDesignerHost = function (element) {
        var self = this;
        this.element = element;
        this.element.data("layout-designer-host", this);
        this.canvas = window.layoutDesignerCanvas;
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
                addDirect: self.element.data("add-direct-url"),
                settings: self.element.data("settings-url"),
                browse: self.element.data("element-browser-url"),
                applyTemplate: self.element.data("apply-template-url")
            },
            domOperations: {
                append: function (container, element) { container.append(element); },
                replace: function (currentElement, newElement) { currentElement.replaceWith(newElement); }
            }
        };

        this.editElement = function (element) {
            var deferred = new $.Deferred();

            if (!element.isTemplated) {
                var elementType = element.contentType;
                var elementData = element.data;
                var dialog = new window.Orchard.Layouts.Dialog(".dialog-template." + self.settings.editorDialogName);

                dialog.show();
                dialog.load(self.settings.endpoints.edit, {
                    typeName: elementType,
                    elementData: elementData,
                    __RequestVerificationToken: self.settings.antiForgeryToken
                }, "post");

                dialog.element.on("command", function(e, args) {
                    if (args.command == "save") {
                        deferred.resolve(args);
                        dialog.close();
                    }
                });
            }

            return deferred.promise();
        };

        this.addElement = function (contentType) {
            var elementType = contentType.id;
            var deferred = new $.Deferred();
            var dialog = new window.Orchard.Layouts.Dialog(".dialog-template." + self.settings.editorDialogName);

            if (contentType.hasEditor) {
                var url = self.settings.endpoints.add + "&typeName=" + elementType;

                dialog.show();
                dialog.load(url);

                dialog.element.on("command", function(e, args) {
                    if (args.command == "add" || args.command == "save") {
                        deferred.resolve(args);
                        dialog.close();
                    }
                });
            } else {
                var url = self.settings.endpoints.addDirect;

                $.ajax(url, {
                    data: {
                        typeName: elementType,
                        __RequestVerificationToken: self.settings.antiForgeryToken
                    },
                    type: "POST"
                }).then(function(response) {
                    deferred.resolve({
                        element: response
                    });
                });
            }

            return deferred.promise();
        };

        var serializeCanvas = function () {
            var layoutData = self.canvas.toObject();
            return JSON.stringify(layoutData, null, "\t");
        };

        var applyTemplate = function (templateId) {
            var layoutData = serializeCanvas();

            $.ajax({
                url: self.settings.endpoints.applyTemplate,
                data: {
                    templateId: templateId,
                    layoutData: layoutData,
                    __RequestVerificationToken: self.settings.antiForgeryToken
                },
                dataType: "json",
                type: "post"
            }).then(function (response) {
                self.element.trigger("replacemodel", { canvas: response });
            });
        };

        var monitorForm = function() {
            var layoutDesigner = self.element;
            var form = layoutDesigner.closest("form");
            
            form.on("submit", function (e) {
                serializeLayout();
            });
        };

        var serializeLayout = function () {
            var layoutDataField = self.element.find(".layout-data-field");
            var layoutDataDataJson = serializeCanvas();

            layoutDataField.val(layoutDataDataJson);
        };

        this.element.on("change", ".template-picker select", function (e) {
            var selectList = $(this);
            var templateId = parseInt(selectList.val());
            applyTemplate(templateId);
        });

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