angular
    .module("LayoutEditor")
    .directive("orcLayoutColumn", function ($compile, elementConfigurator) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                elementConfigurator.addElementFunctions($scope, $element);
                elementConfigurator.addContainerFunctions($scope, $element);
                $scope.sortableOptions["axis"] = "y";
            },
            templateUrl: "Templates/orc-layout-column.html",
            replace: true
        };
    });