///#source 1 1 LayoutEditor/Module.js
angular.module("LayoutEditor", ["ngSanitize", "ngResource", "ui.sortable"]);
///#source 1 1 LayoutEditor/Services/BaseUrl.js
angular
    .module("LayoutEditor")
    .factory("baseUrl", function () {
        return {
            get: function () {
                return $("[data-base-url]").data("base-url");
            }
        }
    });
///#source 1 1 LayoutEditor/Services/ElementConfigurator.js
angular
    .module("LayoutEditor")
    .factory("elementConfigurator", function () {
        return {

            addElementFunctions: function ($scope, $element) {
                $($element.find(".layout-panel")).click(function (e) {
                    e.stopPropagation();
                    console.log("Stopping");
                });
            },

            addContainerFunctions: function ($scope, $element) {
                $scope.invokeAddContentElement = function (contentType) {
                    $scope.$root.addElement(contentType.id).then(function (args) {
                        var container = $scope.element;
                        var newElement = LayoutEditor.Content.from({
                            contentType: args.element.typeName,
                            contentTypeLabel: args.element.typeLabel,
                            contentTypeClass: args.element.typeClass,
                            data: decodeURIComponent(args.element.data),
                            html: decodeURIComponent(args.element.html.replace(/\+/g, "%20"))
                        });
                        container.addChild(newElement);
                        $scope.$apply();
                    });
                };

                $scope.sortableOptions = {
                    cursor: "move",
                    delay: 150,
                    distance: 5
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
                    if (child.type == "Content")
                        result.push(child.contentTypeClass);

                    if (child.getIsActive())
                        result.push("layout-element-active");
                    if (child.getIsFocused())
                        result.push("layout-element-focused");
                    if (child.getIsSelected())
                        result.push("layout-element-selected");

                    return result;
                };
            }
        }
    });
///#source 1 1 LayoutEditor/Directives/Canvas.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutCanvas", function ($compile, elementConfigurator, baseUrl) {
        return {
            restrict: "E",
            scope: {},
            controller: function ($scope, $element, $attrs) {
                if (!!$attrs.model)
                    $scope.element = eval($attrs.model);
                else
                    $scope.element = new LayoutEditor.Canvas(null, null, null, null, null, []);
                elementConfigurator.addElementFunctions($scope, $element);
                elementConfigurator.addContainerFunctions($scope, $element);
                $scope.sortableOptions["axis"] = "y";
                $scope.$root.layoutDesignerHost = $element.closest(".layout-designer").data("layout-designer-host");
                $scope.$root.editElement = function(elementType, elementData) {
                    var host = $scope.$root.layoutDesignerHost;
                    return host.editElement(elementType, elementData);
                };
                $scope.$root.addElement = function (elementType, elementLabel) {
                    var host = $scope.$root.layoutDesignerHost;
                    return host.addElement(elementType, elementLabel);
                };
            },
            templateUrl: baseUrl.get() + "/Templates/orc-layout-canvas.html",
            replace: true,
            link: function (scope, element) {
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
    .directive("orcLayoutColumn", function ($compile, elementConfigurator, baseUrl) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                elementConfigurator.addElementFunctions($scope, $element);
                elementConfigurator.addContainerFunctions($scope, $element);
                $scope.sortableOptions["axis"] = "y";
            },
            templateUrl: baseUrl.get() + "/Templates/orc-layout-column.html",
            replace: true
        };
    });
///#source 1 1 LayoutEditor/Directives/Content.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutContent", function (elementConfigurator, baseUrl) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                elementConfigurator.addElementFunctions($scope, $element);
                $scope.edit = function () {
                    $scope.$root.editElement($scope.element.contentType, $scope.element.data).then(function (args) {
                        $scope.element.data = decodeURIComponent(args.element.data);
                        $scope.element.html = decodeURIComponent(args.element.html.replace(/\+/g, "%20"));
                        $scope.$apply();
                    });
                };
            },
            templateUrl: baseUrl.get() + "/Templates/orc-layout-content.html",
            replace: true
        };
    });
///#source 1 1 LayoutEditor/Directives/Grid.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutGrid", function ($compile, elementConfigurator, baseUrl) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                elementConfigurator.addElementFunctions($scope, $element);
                elementConfigurator.addContainerFunctions($scope, $element);
                $scope.sortableOptions["axis"] = "y";
            },
            templateUrl: baseUrl.get() + "/Templates/orc-layout-grid.html",
            replace: true
        };
    });
///#source 1 1 LayoutEditor/Directives/Popup.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutPopup", function ($compile) {
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
    .directive("orcLayoutRow", function ($compile, elementConfigurator, baseUrl) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                elementConfigurator.addElementFunctions($scope, $element);
                elementConfigurator.addContainerFunctions($scope, $element);
                $scope.sortableOptions["axis"] = "x";
                $scope.sortableOptions["ui-floating"] = true;
            },
            templateUrl: baseUrl.get() + "/Templates/orc-layout-row.html",
            replace: true
        };
    });
