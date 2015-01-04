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
            replace: true
        };
    });