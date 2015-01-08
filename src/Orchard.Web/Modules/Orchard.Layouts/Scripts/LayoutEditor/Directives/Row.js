angular
    .module("LayoutEditor")
    .directive("orcLayoutRow", function ($compile, elementConfigurator) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                elementConfigurator.addElementFunctions($scope, $element);
                elementConfigurator.addContainerFunctions($scope, $element);
                $scope.sortableOptions["axis"] = "x";
                $scope.sortableOptions["ui-floating"] = true;
            },
            templateUrl: "Templates/orc-layout-row.html",
            replace: true
        };
    });