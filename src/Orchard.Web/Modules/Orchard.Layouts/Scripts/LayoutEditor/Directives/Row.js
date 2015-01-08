angular
    .module("LayoutEditor")
    .directive("orcLayoutRow", function ($compile, scopeConfigurator) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                scopeConfigurator.configureForElement($scope, $element);
                scopeConfigurator.configureForContainer($scope, $element);
                $scope.sortableOptions["axis"] = "x";
                $scope.sortableOptions["ui-floating"] = true;
            },
            templateUrl: "Templates/orc-layout-row.html",
            replace: true
        };
    });