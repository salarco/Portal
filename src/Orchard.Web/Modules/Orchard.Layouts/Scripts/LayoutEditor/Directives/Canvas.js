angular
    .module("LayoutEditor")
    .directive("orcLayoutCanvas", function ($compile, scopeConfigurator, environment) {
        return {
            restrict: "E",
            scope: {},
            controller: function ($scope, $element, $attrs) {
                if (!!$attrs.model)
                    $scope.element = eval($attrs.model);
                else
                    $scope.element = LayoutEditor.Canvas.from({
                        isTemplate: false,
                        children: []
                    });

                scopeConfigurator.configureForElement($scope, $element);
                scopeConfigurator.configureForContainer($scope, $element);

                $scope.sortableOptions["axis"] = "y";

                var layoutDesignerHost = $element.closest(".layout-designer").data("layout-designer-host");
                $scope.$root.layoutDesignerHost = layoutDesignerHost;

                layoutDesignerHost.element.on("replacemodel", function (e, args) {
                    var canvas = $scope.element;
                    $scope.$apply(function() {
                        canvas.setChildren(LayoutEditor.childrenFrom(args.canvas.children));
                        canvas.setCanvas(canvas);
                    });
                });

                $scope.$root.editElement = function (elementType, elementData) {
                    var host = $scope.$root.layoutDesignerHost;
                    return host.editElement(elementType, elementData);
                };

                $scope.$root.addElement = function (contentType) {
                    var host = $scope.$root.layoutDesignerHost;
                    return host.addElement(contentType);
                };

                $scope.toggleInlineEditing = function () {
                    if (!$scope.element.inlineEditingIsActive) {
                        $scope.element.inlineEditingIsActive = true;
                        // HACK: Extremely ugly and brittle hack to avoid layout from jumping around when editor loses focus.
                        $element.find(".layout-toolbar-container").css("min-height", "83px");
                        var selector = "#layout-canvas-" + $scope.$id + " .layout-content-html .layout-content-markup[data-templated=false]";
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
                            //setup: function (editor) {
                            //    editor.addButton("close", {
                            //        text: "Close",
                            //        tooltip: "Deactivate inline editing",
                            //        icon: false,
                            //        onclick: function() {
                            //            tinymce.remove("#layout-canvas-" + $scope.$id + " .layout-content-markup");
                            //            // HACK: Extremely ugly and brittle hack to avoid layout from jumping around when editor loses focus.
                            //            $element.find(".layout-toolbar-container").css("min-height", "");
                            //            $scope.element.inlineEditingIsActive = false;
                            //        }
                            //    });
                            //},
                            convert_urls: false,
                            valid_elements: "*[*]",
                            // Shouldn't be needed due to the valid_elements setting, but TinyMCE would strip script.src without it.
                            extended_valid_elements: "script[type|defer|src|language]",
                            //menubar: false,
                            statusbar: false,
                            skin: "orchardlightgray",
                            inline: true,
                            fixed_toolbar_container: "#layout-canvas-" + $scope.$id + " > .layout-toolbar-container",
                            init_instance_callback: function (editor) {
                                if (editor.id == firstContentEditorId)
                                    tinymce.execCommand("mceFocus", false, editor.id);

                            }
                        });
                    }
                    else {
                        tinymce.remove("#layout-canvas-" + $scope.$id + " .layout-content-markup");
                        // HACK: Extremely ugly and brittle hack to avoid layout from jumping around when editor loses focus.
                        $element.find(".layout-toolbar-container").css("min-height", "");
                        $scope.element.inlineEditingIsActive = false;
                    }
                };

                $(document).on("cut copy paste", function (e) {
                    var focusedElement = $scope.element.canvas.focusedElement;
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
            templateUrl: environment.baseUrl + "Templates/orc-layout-canvas.html",
            replace: true,
            link: function (scope, element) {
                // No clicks should propagate from the TinyMCE toolbars.
                element.find(".layout-toolbar-container").click(function (e) {
                    e.stopPropagation();
                });
                // Intercept mousedown on canvas while in inline editing mode to 
                // prevent current editor from losing focus.
                element.mousedown(function (e) {
                    if (scope.element.canvas.inlineEditingIsActive) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                })
                // Unfocus and unselect everything on click outside of canvas.
                $(window).click(function (e) {
                    // Except when in inline editing mode.
                    if (!scope.element.canvas.inlineEditingIsActive) {
                        scope.$apply(function () {
                            scope.element.canvas.activeElement = null;
                            scope.element.canvas.focusedElement = null;
                        });
                    }
                });
            }
        };
    });