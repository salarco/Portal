angular
    .module("LayoutEditor")
    .directive("orcLayoutEditor", function (environment) {
        return {
            restrict: "E",
            scope: {},
            controller: function ($scope, $element, $attrs) {
                if (!!$attrs.model)
                    $scope.element = eval($attrs.model);
                else
                    throw new Error("The 'config' attribute must evaluate to a LayoutEditor.Editor object.");

                $scope.click = function (canvas, e) {
                    if (!canvas.editor.isDragging)
                        canvas.setIsFocused();
                    e.stopPropagation();
                };

                $scope.getClasses = function (canvas) {
                    var result = ["layout-element", "layout-container", "layout-canvas"];

                    if (canvas.getIsActive())
                        result.push("layout-element-active");
                    if (canvas.getIsFocused())
                        result.push("layout-element-focused");
                    if (canvas.getIsSelected())
                        result.push("layout-element-selected");
                    if (canvas.isDropTarget)
                        result.push("layout-element-droptarget");
                    if (canvas.isTemplated)
                        result.push("layout-element-templated");

                    return result;
                };


                var layoutDesignerHost = $element.closest(".layout-designer").data("layout-designer-host");
                $scope.$root.layoutDesignerHost = layoutDesignerHost;

                layoutDesignerHost.element.on("replacecanvas", function (e, args) {
                    var editor = $scope.element;
                    $scope.$apply(function () {
                        canvas = LayoutEditor.Canvas.from({
                            data: args.canvas.data,
                            htmlId: args.canvas.htmlId,
                            htmlClass: args.canvas.htmlClass,
                            htmlStyle: args.canvas.htmlStyle,
                            isTemplated: args.canvas.isTemplated,
                            children: LayoutEditor.childrenFrom(args.canvas.children)
                        });
                        editor.canvas = canvas;
                        canvas.setEditor(editor);
                    });
                });

                $scope.$root.editElement = function (element) {
                    var host = $scope.$root.layoutDesignerHost;
                    return host.editElement(element);
                };

                $scope.$root.addElement = function (contentType) {
                    var host = $scope.$root.layoutDesignerHost;
                    return host.addElement(contentType);
                };

                $scope.toggleInlineEditing = function () {
                    if (!$scope.element.inlineEditingIsActive) {
                        $scope.element.inlineEditingIsActive = true;
                        $element.find(".layout-toolbar-container").show();
                        var selector = "#layout-editor-" + $scope.$id + " .layout-content-h-t-m-l .layout-content-markup[data-templated=false]";
                        var firstContentEditorId = $(selector).first().attr("id");
                        tinymce.init({
                            selector: selector,
                            theme: "modern",
                            schema: "html5",
                            plugins: [
                                "advlist autolink lists link image charmap print preview hr anchor pagebreak",
                                "searchreplace wordcount visualblocks visualchars code fullscreen",
                                "insertdatetime media nonbreaking table contextmenu directionality",
                                "emoticons template paste textcolor colorpicker textpattern",
                                "fullscreen autoresize"
                            ],
                            toolbar: "undo redo cut copy paste | bold italic | bullist numlist outdent indent formatselect | alignleft aligncenter alignright alignjustify ltr rtl | link unlink charmap | code fullscreen close",
                            convert_urls: false,
                            valid_elements: "*[*]",
                            // Shouldn't be needed due to the valid_elements setting, but TinyMCE would strip script.src without it.
                            extended_valid_elements: "script[type|defer|src|language]",
                            statusbar: false,
                            skin: "orchardlightgray",
                            inline: true,
                            fixed_toolbar_container: "#layout-editor-" + $scope.$id + " .layout-toolbar-container",
                            init_instance_callback: function (editor) {
                                if (editor.id == firstContentEditorId)
                                    tinymce.execCommand("mceFocus", false, editor.id);
                            }
                        });
                    }
                    else {
                        tinymce.remove("#layout-editor-" + $scope.$id + " .layout-content-markup");
                        $element.find(".layout-toolbar-container").hide();
                        $scope.element.inlineEditingIsActive = false;
                    }
                };

                $(document).on("cut copy paste", function (e) {
                    var focusedElement = $scope.element.focusedElement;
                    if (!!focusedElement) {
                        $scope.$apply(function () {
                            switch (e.type) {
                                case "copy":
                                    focusedElement.copy(e.originalEvent.clipboardData);
                                    break;
                                case "cut":
                                    focusedElement.cut(e.originalEvent.clipboardData);
                                    break;
                                case "paste":
                                    focusedElement.paste(e.originalEvent.clipboardData);
                                    break;
                            }
                        });
                        e.preventDefault();
                    }
                });
            },
            templateUrl: environment.baseUrl + "Templates/orc-layout-editor.html",
            replace: true,
            link: function (scope, element) {
                // No clicks should propagate from the TinyMCE toolbars.
                element.find(".layout-toolbar-container").click(function (e) {
                    e.stopPropagation();
                });
                // Intercept mousedown on editor while in inline editing mode to 
                // prevent current editor from losing focus.
                element.mousedown(function (e) {
                    if (scope.element.inlineEditingIsActive) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                })
                // Unfocus and unselect everything on click outside of canvas.
                $(window).click(function (e) {
                    // Except when in inline editing mode.
                    if (!scope.element.inlineEditingIsActive) {
                        scope.$apply(function () {
                            scope.element.activeElement = null;
                            scope.element.focusedElement = null;
                        });
                    }
                });
            }
        };
    });