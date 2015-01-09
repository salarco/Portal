///#source 1 1 LayoutEditor/Module.js
angular.module("LayoutEditor", ["ngSanitize", "ngResource", "ui.sortable"]);
///#source 1 1 LayoutEditor/Services/scopeConfigurator.js
angular
    .module("LayoutEditor")
    .factory("scopeConfigurator", function () {
        return {

            configureForElement: function ($scope, $element) {
                $element.find(".layout-panel").click(function (e) {
                    e.stopPropagation();
                });

                var keypressTarget = $element.find(".layout-element").first(); // For the Canvas case (main element is contained in template).
                if (!keypressTarget.hasClass("layout-element"))
                    keypressTarget = $element.parent(); // For all other cases (main element is the parent of template).
                console.log("Configuring keypress handler on " + $scope.element.type + ".");
                console.log(keypressTarget);

                keypressTarget.keypress(function (e) {
                    console.log("Keypress detected on " + $scope.element.type + ".");
                    $scope.keypress(e);
                    e.stopPropagation();
                });

                $scope.click = function (element, e) {
                    console.log("Setting focus to " + element.type + ".");
                    element.setIsFocused();
                    var focusTarget = $(e.target); // For the Canvas case (current scope belongs directly to main element).
                    if (!focusTarget.hasClass("layout-element"))
                        focusTarget = $element.find(".layout-element").first(); // For all other cases (current scope belongs to parent element).
                    focusTarget.focus();
                    e.stopPropagation();
                };

                $scope.keypress = function (e) {
                    var c = String.fromCharCode(e.which);
                    console.log("Keypress " + c + " handled on element " + $scope.element.type + ".");
                    $scope.$apply(function () { // Event is not triggered by Angular directive but raw event handler on element.
                        if (c == "c") // CTRL+C
                            $scope.element.copyToClipboard();
                        else if (c == "v") // CTRL+V
                            $scope.element.pasteFromClipboard();
                    });
                };
            },

            configureForContainer: function ($scope, $element) {
                $scope.invokeAddContentElement = function (contentType) {
                    $scope.$root.addElement(contentType.id).then(function (args) {
                        $scope.$apply(function () {
                            var container = $scope.element;
                            var newElement = LayoutEditor.Content.from({
                                contentType: args.element.typeName,
                                contentTypeLabel: args.element.typeLabel,
                                contentTypeClass: args.element.typeClass,
                                data: decodeURIComponent(args.element.data),
                                html: decodeURIComponent(args.element.html.replace(/\+/g, "%20"))
                            });
                            container.addChild(newElement);
                            newElement.setIsFocused();
                        });
                    });
                };

                $scope.sortableOptions = {
                    cursor: "move",
                    delay: 150,
                    distance: 5,
                    start: function (e, ui) {
                        $scope.$apply(function () {
                            $scope.element.canvas.isDragging = true;
                            $scope.element.isDropTarget = true;
                        });
                        // Make the drop target placeholder as high as the item being dragged.
                        ui.placeholder.height(ui.item.height());
                    },
                    stop: function (e, ui) {
                        $scope.$apply(function () {
                            $scope.element.canvas.isDragging = false;
                            $scope.element.isDropTarget = false;
                        });
                    }
                };

                $scope.getClasses = function (child) {
                    var result = ["layout-element"];

                    if (!!child.children)
                        result.push("layout-container");

                    result.push("layout-" + child.type.toLowerCase());

                    // TODO: Move these to either the Column directive or the Column model class.
                    if (child.type == "Row")
                        result.push("row");
                    if (child.type == "Column") {
                        result.push("col-xs-" + child.width);
                        result.push("col-xs-offset-" + child.offset);
                    }
                    if (child.type == "Content") {
                        // TODO: Remove one of these when Sipke decides which one to provide.
                        result.push(child.contentTypeClass);
                        result.push("layout-content-" + child.contentTypeClass);
                    }

                    if (child.getIsActive())
                        result.push("layout-element-active");
                    if (child.getIsFocused())
                        result.push("layout-element-focused");
                    if (child.getIsSelected())
                        result.push("layout-element-selected");

                    if (child.isDropTarget)
                        result.push("layout-element-droptarget");

                    return result;
                };

                // Redefine function for container behavior.
                $scope.keypress = function (e) {
                    var c = String.fromCharCode(e.which);
                    console.log("Keypress " + c + " handled on container " + $scope.element.type + ".");
                    $scope.$apply(function () { // Event is not triggered by Angular directive but raw event handler on element.
                        if (c == "c") // CTRL+C
                            $scope.element.copyToClipboard();
                        else if (c == "v") // CTRL+V
                            $scope.element.pasteChildFromClipboard();
                    });
                };
            }
        }
    });
///#source 1 1 LayoutEditor/Directives/Canvas.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutCanvas", function ($compile, scopeConfigurator) {
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

                $scope.$root.addElement = function (elementType, elementLabel) {
                    var host = $scope.$root.layoutDesignerHost;
                    return host.addElement(elementType, elementLabel);
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
            templateUrl: "Templates/orc-layout-canvas.html",
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
///#source 1 1 LayoutEditor/Directives/Child.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutChild", function ($compile) {
        return {
            restrict: "E",
            scope: { element: "=" },
            link: function (scope, element) {
                var template = "<orc-layout-" + scope.element.type.toLowerCase() + " element='element' />";
                var html = $compile(template)(scope);
                $(element).replaceWith(html);
            }
        };
    });
///#source 1 1 LayoutEditor/Directives/Column.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutColumn", function ($compile, scopeConfigurator) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                scopeConfigurator.configureForElement($scope, $element);
                scopeConfigurator.configureForContainer($scope, $element);
                $scope.sortableOptions["axis"] = "y";
            },
            templateUrl: "Templates/orc-layout-column.html",
            replace: true
        };
    });
///#source 1 1 LayoutEditor/Directives/Content.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutContent", function (scopeConfigurator) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                scopeConfigurator.configureForElement($scope, $element);
                $scope.edit = function () {
                    $scope.$root.editElement($scope.element.contentType, $scope.element.data).then(function (args) {
                        $scope.element.data = decodeURIComponent(args.element.data);
                        $scope.element.html = decodeURIComponent(args.element.html.replace(/\+/g, "%20"));
                        $scope.$apply();
                    });
                };
                $scope.updateContent = function (e) {
                    $scope.element.html = e.target.innerHTML;
                };
            },
            templateUrl: "Templates/orc-layout-content.html",
            replace: true,
            link: function (scope, element) {
                // Mouse down events must not be intercepted by drag and drop while inline editing is active,
                // otherwise clicks in inline editors will have no effect.
                element.find(".layout-content-markup").mousedown(function (e) {
                    if (scope.element.canvas.inlineEditingIsActive) {
                        e.stopPropagation();
                    }
                });
            }
        };
    });
///#source 1 1 LayoutEditor/Directives/Grid.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutGrid", function ($compile, scopeConfigurator) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                scopeConfigurator.configureForElement($scope, $element);
                scopeConfigurator.configureForContainer($scope, $element);
                $scope.sortableOptions["axis"] = "y";
            },
            templateUrl: "Templates/orc-layout-grid.html",
            replace: true
        };
    });
///#source 1 1 LayoutEditor/Directives/Popup.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutPopup", function () {
        return {
            restrict: "A",
            link: function (scope, element, attrs) {
                var popup = $(element);
                var trigger = popup.closest(".layout-popup-trigger");
                var parentElement = popup.closest(".layout-element");
                trigger.click(function () {
                    popup.toggle();
                    if (popup.is(":visible")) {
                        popup.position({
                            my: attrs.orcLayoutPopupMy || "left top",
                            at: attrs.orcLayoutPopupAt || "left bottom+4px",
                            of: trigger
                        });
                    }
                });
                popup.click(function (e) {
                    e.stopPropagation();
                });
                parentElement.click(function (e) {
                    popup.hide();
                });
            }
        };
    });
///#source 1 1 LayoutEditor/Directives/Row.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutRow", function ($compile, scopeConfigurator) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                scopeConfigurator.configureForElement($scope, $element);
                scopeConfigurator.configureForContainer($scope, $element);
                $scope.sortableOptions["axis"] = "x";
                $scope.sortableOptions["ui-floating"] = true;
            },
            templateUrl: "Templates/orc-layout-row.html",
            replace: true
        };
    });
