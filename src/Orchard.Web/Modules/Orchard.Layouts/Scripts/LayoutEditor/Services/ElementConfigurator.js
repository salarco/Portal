angular
    .module("LayoutEditor")
    .factory("elementConfigurator", function () {
        return {

            addElementFunctions: function ($scope, $element) {
                $scope.delete = function (e) {
                    $scope.element.delete();
                    e.stopPropagation();
                }

                $scope.moveUp = function (e) {
                    $scope.element.moveUp();
                    e.stopPropagation();
                }

                $scope.moveDown = function (e) {
                    $scope.element.moveDown();
                    e.stopPropagation();
                }
            },

            addContainerFunctions: function ($scope, $element) {
                $scope.invokeAddOperation = function (operation, e) {
                    operation.invoke();
                };

                $scope.invokeAddContentElement = function (contentType, e) {
                    $scope.$root.addElement(contentType.id).then(function (args) {
                        var container = $scope.element;
                        var newElement = LayoutEditor.Content.from({
                            contentType: args.element.typeName,
                            label: args.element.label,
                            data: decodeURIComponent(args.element.data),
                            html: decodeURIComponent(args.element.html.replace(/\+/g, "%20"))
                        });
                        container.addChild(newElement);
                        $scope.$apply();
                    });
                };

                $scope.sortableOptions = {
                    cursor: "move",
                    delay: 150,
                    distance: 5
                };

                $scope.setIsActive = function (child) {
                    child.setIsActive(true);
                };

                $scope.clearIsActive = function (child) {
                    child.setIsActive(false);
                };

                $scope.setIsFocused = function (child, e) {
                    child.setIsFocused();
                    e.stopPropagation();
                };

                $scope.getClasses = function (child) {
                    var result = ["layout-element"];

                    if (!!child.children)
                        result.push("layout-container");

                    result.push("layout-" + child.type.toLowerCase());

                    // TODO: Move these to either the Column directive or the Column model class.
                    if (child.type == "Row")
                        result.push("row");
                    if (child.type == "Column") {
                        result.push("col-xs-" + child.width);
                        result.push("col-xs-offset-" + child.offset);
                    }

                    if (child.getIsActive())
                        result.push("layout-element-active");
                    if (child.getIsFocused())
                        result.push("layout-element-focused");
                    if (child.getIsSelected())
                        result.push("layout-element-selected");

                    return result;
                };
            }
        }
    });