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
                        if ($(e.target).hasClass("layout-column-resize-bar-left")) {
                            var delta = ui.offset.left - columnElement.offset().left;
                            if (delta < -columnSize && scope.element.canDecreaseOffset()) {
                                scope.$apply(function () {
                                    scope.element.decreaseOffset(true);
                                });
                            }
                            else if (delta > columnSize && scope.element.canIncreaseOffset()) {
                                scope.$apply(function () {
                                    scope.element.increaseOffset(true);
                                });
                            }
                        }
                        else if ($(e.target).hasClass("layout-column-resize-bar-right")) {
                            var delta = ui.offset.left - columnElement.width() - columnElement.offset().left;
                            if (delta > columnSize && scope.element.canIncreaseWidth()) {
                                scope.$apply(function () {
                                    scope.element.increaseWidth();
                                });
                            }
                            else if (delta < -columnSize && scope.element.canDecreaseWidth()) {
                                scope.$apply(function () {
                                    scope.element.decreaseWidth();
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