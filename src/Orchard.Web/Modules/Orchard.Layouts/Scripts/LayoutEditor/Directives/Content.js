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