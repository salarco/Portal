angular
    .module("LayoutEditor")
    .factory("elementConfigurator", function () {
        return {

            addElementFunctions: function ($scope, $element) {
                $($element.find(".layout-panel")).click(function (e) {
                    e.stopPropagation();
                    console.log("Stopping");
                });
            },

            addContainerFunctions: function ($scope, $element) {
                $scope.invokeAddContentElement = function (contentType) {
                    $scope.$root.addElement(contentType.id).then(function (args) {
                        var container = $scope.element;
                        var newElement = LayoutEditor.Content.from({
                            contentType: args.element.typeName,
                            contentTypeLabel: args.element.typeLabel,
                            contentTypeClass: args.element.typeClass,
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
                    if (child.type == "Content")
                        result.push(child.contentTypeClass);

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