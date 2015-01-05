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