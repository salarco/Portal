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
                    $scope.element = new LayoutEditor.Canvas(null, null, null, null, null, []);

                scopeConfigurator.configureForElement($scope, $element);
                scopeConfigurator.configureForContainer($scope, $element);

                $scope.sortableOptions["axis"] = "y";

                $scope.$root.layoutDesignerHost = $element.closest(".layout-designer").data("layout-designer-host");

                $scope.$root.editElement = function (elementType, elementData) {
                    var host = $scope.$root.layoutDesignerHost;
                    return host.editElement(elementType, elementData);
                };

                $scope.$root.addElement = function (contentType) {
                    var host = $scope.$root.layoutDesignerHost;
                    return host.addElement(contentType);
                };

                $scope.activateInlineEditing = function () {
                    $scope.element.inlineEditingIsActive = true;
                    var firstContentEditorId = $("#layout-canvas-" + $scope.$id + " .layout-content-markup").first().attr("id");
                    tinymce.init({
                        selector: "#layout-canvas-" + $scope.$id + " .layout-content-markup",
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
                        setup: function (editor) {
                            editor.addButton("close", {
                                text: "Close",
                                tooltip: "Deactivate inline editing",
                                icon: false,
                                onclick: function() {
                                    tinymce.remove("#layout-canvas-" + $scope.$id + " .layout-content-markup");
                                    $scope.element.inlineEditingIsActive = false;
                                }
                            });
                        },
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
                };
            },
            templateUrl: environment.baseUrl + "Templates/orc-layout-canvas.html",
            replace: true,
            link: function (scope, element) {
                // No clicks should propagate from the TinyMCE toolbars.
                element.find(".layout-toolbar-container").click(function (e) {
                    e.stopPropagation();
                });
                // Unfocus and unselect everything on click outside of canvas.
                $(window).click(function (e) {
                    scope.$apply(function () {
                        scope.element.canvas.activeElement = null;
                        scope.element.canvas.focusedElement = null;
                    });
                });
            }
        };
    });