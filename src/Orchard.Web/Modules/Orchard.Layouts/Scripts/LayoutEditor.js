///#source 1 1 /Scripts/LayoutEditor/Module.js
angular.module("LayoutEditor", ["ngSanitize", "ngResource"]);
///#source 1 1 /Scripts/LayoutEditor/Services/BaseUrl.js
angular
    .module("LayoutEditor")
    .factory("baseUrl", function () {
        return {
            get: function () {
                return $("[data-base-url]").data("base-url");
            }
        }
    });
///#source 1 1 /Scripts/LayoutEditor/Services/ElementConfigurator.js
angular
    .module("LayoutEditor")
    .factory("elementConfigurator", function () {
        return {
            addElementFunctions: function ($scope, $element) {
                $scope.setIsActive = function () {
                    $scope.element.setIsActive(true);
                };

                $scope.clearIsActive = function () {
                    $scope.element.setIsActive(false);
                };

                $scope.setIsFocused = function (e) {
                    $scope.element.setIsFocused();
                    e.stopPropagation();
                };

                $scope.getClasses = function () {
                    if (!$scope.element)
                        return null;

                    var result = [];
                    if ($scope.element.getIsActive())
                        result.push("layout-element-active");
                    if ($scope.element.getIsFocused())
                        result.push("layout-element-focused");
                    if ($scope.element.getIsSelected())
                        result.push("layout-element-selected");
                    return result;
                };

                $scope.delete = function (e) {
                    $scope.element.delete();
                    e.stopPropagation();
                }

                $scope.moveUp = function (e) {
                    $scope.element.moveUp();
                    e.stopPropagation();
                }

                $scope.moveDown = function (e) {
                    $scope.element.moveDown();
                    e.stopPropagation();
                }
            },
            addContainerFunctions: function ($scope, $element) {
                $scope.invokeAddOperation = function (operation, e) {
                    operation.invoke();
                };
            }
        }
    });
///#source 1 1 /Scripts/LayoutEditor/Directives/Canvas.js
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

///#source 1 1 /Scripts/LayoutEditor/Directives/Child.js
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
///#source 1 1 /Scripts/LayoutEditor/Directives/Column.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutColumn", function ($compile, elementConfigurator, baseUrl) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                elementConfigurator.addElementFunctions($scope, $element);
                elementConfigurator.addContainerFunctions($scope, $element);
                $scope.split = function (e) {
                    $scope.element.split();
                    e.stopPropagation();
                };
                $scope.decreaseOffset = function (e) {
                    $scope.element.decreaseOffset();
                    e.stopPropagation();
                };
                $scope.increaseOffset = function (e) {
                    $scope.element.increaseOffset();
                    e.stopPropagation();
                };
            },
            templateUrl: baseUrl.get() + "/Templates/orc-layout-column.html",
            replace: true,
        };
    });
///#source 1 1 /Scripts/LayoutEditor/Directives/Content.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutContent", function (elementConfigurator, baseUrl) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                elementConfigurator.addElementFunctions($scope, $element);
            },
            templateUrl: baseUrl.get() + "/Templates/orc-layout-content.html",
            replace: true,
        };
    });
///#source 1 1 /Scripts/LayoutEditor/Directives/Grid.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutGrid", function ($compile, elementConfigurator, baseUrl) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                elementConfigurator.addElementFunctions($scope, $element);
                elementConfigurator.addContainerFunctions($scope, $element);
            },
            templateUrl: baseUrl.get() + "/Templates/orc-layout-grid.html",
            replace: true,
        };
    });
///#source 1 1 /Scripts/LayoutEditor/Directives/Popup.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutPopup", function ($compile) {
        return {
            restrict: "A",
            link: function (scope, element, attrs) {
                var popup = $(element);
                var trigger = popup.closest(".layout-popup-trigger");
                var parentElement = popup.closest(".layout-element");
                trigger.click(function (e) {
                    popup.toggle();
                    if (popup.is(":visible")) {
                        popup.position({
                            my: attrs.orcLayoutPopupMy || "left top",
                            at: attrs.orcLayoutPopupAt || "left bottom+4px",
                            of: trigger
                        });
                    }
                    e.stopPropagation();
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
///#source 1 1 /Scripts/LayoutEditor/Directives/Row.js
angular
    .module("LayoutEditor")
    .directive("orcLayoutRow", function ($compile, elementConfigurator, baseUrl) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                elementConfigurator.addElementFunctions($scope, $element);
                elementConfigurator.addContainerFunctions($scope, $element);
                $scope.addColumn = function (e) {
                    $scope.element.addColumn();
                    e.stopPropagation();
                };
            },
            templateUrl: baseUrl.get() + "/Templates/orc-layout-row.html",
            replace: true,
        };
    });
