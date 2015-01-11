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

                keypressTarget.keydown(function (e) {
                    var handled = false;
                    var resetFocus = false;
                    var element = $scope.element;

                    if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 46) { // Del
                        element.delete();
                        handled = true;
                    }
                    else if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 32) { // Space
                        $element.find(".layout-panel-action-properties").first().click();
                        handled = true;
                    }

                    if (element.type == "Content") { // This is a content element.
                        if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 13) { // Enter
                            $element.find(".layout-panel-action-edit").first().click();
                            handled = true;
                        }
                    }

                    if (!!element.children) { // This is a container.
                        if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 45) { // Ins
                            // TODO: Replace with more semantic class.
                            $element.find(".layout-panel-add > .layout-panel-action").first().click();
                            handled = true;
                        }
                        else if (!e.ctrlKey && !e.shiftKey && e.altKey && e.which == 40) { // Alt+Down
                            if (element.children.length > 0)
                                element.children[0].setIsFocused();
                            handled = true;
                        }

                        if (element.type == "Column") { // This is a column.
                            var connectAdjacent = !e.ctrlKey;
                            if (e.which == 37) { // Left
                                if (e.altKey)
                                    element.expandLeft(connectAdjacent);
                                if (e.shiftKey)
                                    element.contractRight(connectAdjacent);
                                handled = true;
                            }
                            else if (e.which == 39) { // Right
                                if (e.altKey)
                                    element.contractLeft(connectAdjacent);
                                if (e.shiftKey)
                                    element.expandRight(connectAdjacent);
                                handled = true;
                            }
                        }
                    }

                    if (!!element.parent) { // This is a child.
                        if (e.altKey && e.which == 38) { // Alt+Up
                            element.parent.setIsFocused();
                            handled = true;
                        }

                        if (element.parent.type == "Row") { // Parent is a horizontal container.
                            if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 37) { // Left
                                element.parent.moveFocusPrevChild(element);
                                handled = true;
                            }
                            else if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 39) { // Right
                                element.parent.moveFocusNextChild(element);
                                handled = true;
                            }
                            else if (e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 37) { // Ctrl+Left
                                element.moveUp();
                                resetFocus = true;
                                handled = true;
                            }
                            else if (e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 39) { // Ctrl+Right
                                element.moveDown();
                                handled = true;
                            }
                        }
                        else { // Parent is a vertical container.
                            if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 38) { // Up
                                element.parent.moveFocusPrevChild(element);
                                handled = true;
                            }
                            else if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 40) { // Down
                                element.parent.moveFocusNextChild(element);
                                handled = true;
                            }
                            else if (e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 38) { // Ctrl+Up
                                element.moveUp();
                                resetFocus = true;
                                handled = true;
                            }
                            else if (e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 40) { // Ctrl+Down
                                element.moveDown();
                                handled = true;
                            }
                        }
                    }

                    if (handled) {
                        e.preventDefault();
                    }

                    e.stopPropagation();

                    $scope.$apply(); // Event is not triggered by Angular directive but raw event handler on element.

                    // HACK: Workaround because of how Angular treats the DOM when elements are shifted around - input focus is sometimes lost.
                    if (resetFocus) {
                        window.setTimeout(function () {
                            $scope.$apply(function () {
                                element.canvas.focusedElement.setIsFocused();
                            });
                        }, 100);
                    }
                });

                $scope.element.setIsFocusedEventHandlers.push(function () {
                    var focusTarget = $element.closest(".layout-element"); // For all other cases (main element is the parent of template).
                    if (focusTarget.length == 0)
                        focusTarget = $element.find(".layout-element").first(); // For the Canvas case (main element is contained in template).
                    focusTarget.focus();
                });

                $scope.click = function (element, e) {
                    if (!element.canvas.isDragging)
                        element.setIsFocused();
                    e.stopPropagation();
                };
            },

            configureForContainer: function ($scope, $element) {
                $scope.invokeAddContentElement = function (contentType) {
                    $scope.$root.addElement(contentType).then(function (args) {
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
            }
        }
    });
///#source 1 1 LayoutEditor/Directives/Canvas.js
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

                $(document).on("cut copy paste", function (e) {
                    var focusedElement = $scope.element.canvas.focusedElement;
                    if (!!focusedElement) {
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
    .directive("orcLayoutColumn", function ($compile, scopeConfigurator, environment) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                scopeConfigurator.configureForElement($scope, $element);
                scopeConfigurator.configureForContainer($scope, $element);
                $scope.sortableOptions["axis"] = "y";
            },
            templateUrl: environment.baseUrl + "Templates/orc-layout-column.html",
            replace: true,
            link: function (scope, element, attrs) {
                element.find(".layout-column-resize-bar").draggable({
                    axis: "x",
                    helper: "clone",
                    revert: true,
                    start: function (e, ui) {
                        scope.$apply(function () {
                            scope.element.canvas.isDragging = true;
                        });
                    },
                    drag: function (e, ui) {
                        var columnElement = element.parent();
                        var columnSize = columnElement.width() / scope.element.width;
                        var connectAdjacent = !e.ctrlKey;
                        if ($(e.target).hasClass("layout-column-resize-bar-left")) {
                            var delta = ui.offset.left - columnElement.offset().left;
                            if (delta < -columnSize && scope.element.canExpandLeft(connectAdjacent)) {
                                scope.$apply(function () {
                                    scope.element.expandLeft(connectAdjacent);
                                });
                            }
                            else if (delta > columnSize && scope.element.canContractLeft(connectAdjacent)) {
                                scope.$apply(function () {
                                    scope.element.contractLeft(connectAdjacent);
                                });
                            }
                        }
                        else if ($(e.target).hasClass("layout-column-resize-bar-right")) {
                            var delta = ui.offset.left - columnElement.width() - columnElement.offset().left;
                            if (delta > columnSize && scope.element.canExpandRight(connectAdjacent)) {
                                scope.$apply(function () {
                                    scope.element.expandRight(connectAdjacent);
                                });
                            }
                            else if (delta < -columnSize && scope.element.canContractRight(connectAdjacent)) {
                                scope.$apply(function () {
                                    scope.element.contractRight(connectAdjacent);
                                });
                            }
                        }

                    },
                    stop: function (e, ui) {
                        scope.$apply(function () {
                            scope.element.canvas.isDragging = false;
                        });
                    }
                });
            }
        };
    });
///#source 1 1 LayoutEditor/Directives/Content.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutContent", function (scopeConfigurator, environment) {
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
            templateUrl: environment.baseUrl + "Templates/orc-layout-content.html",
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
    .directive("orcLayoutGrid", function ($compile, scopeConfigurator, environment) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                scopeConfigurator.configureForElement($scope, $element);
                scopeConfigurator.configureForContainer($scope, $element);
                $scope.sortableOptions["axis"] = "y";
            },
            templateUrl: environment.baseUrl + "Templates/orc-layout-grid.html",
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
    .directive("orcLayoutRow", function ($compile, scopeConfigurator, environment) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                scopeConfigurator.configureForElement($scope, $element);
                scopeConfigurator.configureForContainer($scope, $element);
                $scope.sortableOptions["axis"] = "x";
                $scope.sortableOptions["ui-floating"] = true;
            },
            templateUrl: environment.baseUrl + "Templates/orc-layout-row.html",
            replace: true
        };
    });
