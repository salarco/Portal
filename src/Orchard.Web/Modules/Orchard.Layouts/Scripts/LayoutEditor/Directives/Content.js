angular
    .module("LayoutEditor")
    .directive("orcLayoutContent", function (scopeConfigurator, environment) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                scopeConfigurator.configureForElement($scope, $element);
                $scope.edit = function () {
                    $scope.$root.editElement($scope.element.contentType, $scope.element.data).then(function (args) {
                        $scope.element.data = decodeURIComponent(args.element.data);
                        $scope.element.html = decodeURIComponent(args.element.html.replace(/\+/g, "%20"));
                        $scope.$apply();
                    });
                };
                $scope.updateContent = function (e) {
                    $scope.element.html = e.target.innerHTML;
                };
            },
            templateUrl: environment.baseUrl + "Templates/orc-layout-content.html",
            replace: true,
            link: function (scope, element) {
                // Mouse down events must not be intercepted by drag and drop while inline editing is active,
                // otherwise clicks in inline editors will have no effect.
                element.find(".layout-content-markup").mousedown(function (e) {
                    if (scope.element.canvas.inlineEditingIsActive) {
                        e.stopPropagation();
                    }
                });
            }
        };
    });