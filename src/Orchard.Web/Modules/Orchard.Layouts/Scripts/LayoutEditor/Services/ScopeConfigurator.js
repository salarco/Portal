angular
    .module("LayoutEditor")
    .factory("scopeConfigurator", function () {
        return {

            configureForElement: function ($scope, $element) {
                $element.find(".layout-panel").click(function (e) {
                    e.stopPropagation();
                });

                var keypressTarget = $element.find(".layout-element").first(); // For the Canvas case (main element is contained in template).
                if (!keypressTarget.hasClass("layout-element"))
                    keypressTarget = $element.parent(); // For all other cases (main element is the parent of template).

                keypressTarget.keydown(function (e) {
                    var handled = false;
                    var resetFocus = false;
                    var element = $scope.element;

                    if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 46) { // Del
                        element.delete();
                        handled = true;
                    }
                    else if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 32) { // Space
                        $element.find(".layout-panel-action-properties").first().click();
                        handled = true;
                    }

                    if (element.type == "Content") { // This is a content element.
                        if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 13) { // Enter
                            $element.find(".layout-panel-action-edit").first().click();
                            handled = true;
                        }
                    }

                    if (!!element.children) { // This is a container.
                        if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 45) { // Ins
                            // TODO: Replace with more semantic class.
                            $element.find(".layout-panel-add > .layout-panel-action").first().click();
                            handled = true;
                        }
                        else if (!e.ctrlKey && !e.shiftKey && e.altKey && e.which == 40) { // Alt+Down
                            if (element.children.length > 0)
                                element.children[0].setIsFocused();
                            handled = true;
                        }

                        if (element.type == "Column") { // This is a column.
                            if (!e.ctrlKey && e.shiftKey && !e.altKey && e.which == 37) { // Shift+Left
                                element.decreaseWidth();
                                handled = true;
                            }
                            else if (!e.ctrlKey && e.shiftKey && !e.altKey && e.which == 39) { // Shift+Right
                                element.increaseWidth();
                                handled = true;
                            }
                            else if (!e.ctrlKey && !e.shiftKey && e.altKey && e.which == 37) { // Alt+Left
                                element.decreaseOffset();
                                handled = true;
                            }
                            else if (!e.ctrlKey && !e.shiftKey && e.altKey && e.which == 39) { // Alt+Right
                                element.increaseOffset();
                                handled = true;
                            }
                        }
                    }

                    if (!!element.parent) { // This is a child.
                        if (e.altKey && e.which == 38) { // Alt+Up
                            element.parent.setIsFocused();
                            handled = true;
                        }

                        if (element.parent.type == "Row") { // Parent is a horizontal container.
                            if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 37) { // Left
                                element.parent.moveFocusPrevChild(element);
                                handled = true;
                            }
                            else if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 39) { // Right
                                element.parent.moveFocusNextChild(element);
                                handled = true;
                            }
                            else if (e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 37) { // Ctrl+Left
                                element.moveUp();
                                resetFocus = true;
                                handled = true;
                            }
                            else if (e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 39) { // Ctrl+Right
                                element.moveDown();
                                handled = true;
                            }
                        }
                        else { // Parent is a vertical container.
                            if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 38) { // Up
                                element.parent.moveFocusPrevChild(element);
                                handled = true;
                            }
                            else if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 40) { // Down
                                element.parent.moveFocusNextChild(element);
                                handled = true;
                            }
                            else if (e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 38) { // Ctrl+Up
                                element.moveUp();
                                resetFocus = true;
                                handled = true;
                            }
                            else if (e.ctrlKey && !e.shiftKey && !e.altKey && e.which == 40) { // Ctrl+Down
                                element.moveDown();
                                handled = true;
                            }
                        }
                    }

                    if (handled) {
                        e.preventDefault();
                    }

                    e.stopPropagation();

                    $scope.$apply(); // Event is not triggered by Angular directive but raw event handler on element.

                    // HACK: Workaround because of how Angular treats the DOM when elements are shifted around - input focus is sometimes lost.
                    if (resetFocus) {
                        window.setTimeout(function () {
                            $scope.$apply(function () {
                                element.canvas.focusedElement.setIsFocused();
                            });
                        }, 100);
                    }
                });

                $scope.element.setIsFocusedEventHandlers.push(function () {
                    var focusTarget = $element.closest(".layout-element"); // For all other cases (main element is the parent of template).
                    if (focusTarget.length == 0)
                        focusTarget = $element.find(".layout-element").first(); // For the Canvas case (main element is contained in template).
                    focusTarget.focus();
                });

                $scope.click = function (element, e) {
                    element.setIsFocused();
                    e.stopPropagation();
                };
            },

            configureForContainer: function ($scope, $element) {
                $scope.invokeAddContentElement = function (contentType) {
                    $scope.$root.addElement(contentType).then(function (args) {
                        $scope.$apply(function () {
                            var container = $scope.element;
                            var newElement = LayoutEditor.Content.from({
                                contentType: args.element.typeName,
                                contentTypeLabel: args.element.typeLabel,
                                contentTypeClass: args.element.typeClass,
                                data: decodeURIComponent(args.element.data),
                                html: decodeURIComponent(args.element.html.replace(/\+/g, "%20"))
                            });
                            container.addChild(newElement);
                            newElement.setIsFocused();
                        });
                    });
                };

                $scope.sortableOptions = {
                    cursor: "move",
                    delay: 150,
                    distance: 5,
                    start: function (e, ui) {
                        $scope.$apply(function () {
                            $scope.element.canvas.isDragging = true;
                            $scope.element.isDropTarget = true;
                        });
                        // Make the drop target placeholder as high as the item being dragged.
                        ui.placeholder.height(ui.item.height());
                    },
                    stop: function (e, ui) {
                        $scope.$apply(function () {
                            $scope.element.canvas.isDragging = false;
                            $scope.element.isDropTarget = false;
                        });
                    }
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
                    if (child.type == "Content") {
                        result.push("layout-content-" + child.contentTypeClass);
                    }

                    if (child.getIsActive())
                        result.push("layout-element-active");
                    if (child.getIsFocused())
                        result.push("layout-element-focused");
                    if (child.getIsSelected())
                        result.push("layout-element-selected");

                    if (child.isDropTarget)
                        result.push("layout-element-droptarget");

                    return result;
                };
            }
        }
    });