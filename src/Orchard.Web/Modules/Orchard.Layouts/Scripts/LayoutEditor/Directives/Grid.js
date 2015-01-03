angular
    .module("LayoutEditor")
    .directive("orcLayoutGrid", function ($compile, elementConfigurator) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                elementConfigurator.addElementFunctions($scope, $element);
                elementConfigurator.addContainerFunctions($scope, $element);
            },
            templateUrl: "Templates/orc-layout-grid.html",
            replace: true,
        };
    });