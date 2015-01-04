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