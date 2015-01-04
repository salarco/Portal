using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Orchard.DisplayManagement;
using Orchard.Layouts.Elements;
using Orchard.Layouts.Framework.Display;
using Orchard.Layouts.Framework.Elements;
using Orchard.Layouts.Helpers;
using Orchard.Layouts.Settings;

namespace Orchard.Layouts.Services {
    public class LayoutModelMapper : ILayoutModelMapper {
        private readonly ILayoutSerializer _serializer;
        private readonly IElementDisplay _elementDisplay;
        private readonly IShapeDisplay _shapeDisplay;
        private readonly IElementManager _elementManager;

        public LayoutModelMapper(ILayoutSerializer serializer, IElementDisplay elementDisplay, IShapeDisplay shapeDisplay, IElementManager elementManager) {
            _serializer = serializer;
            _elementDisplay = elementDisplay;
            _shapeDisplay = shapeDisplay;
            _elementManager = elementManager;
        }

        public string ToEditorModel(string layoutData, DescribeElementsContext describeContext) {
            var elements = _serializer.Deserialize(layoutData, describeContext);
            var canvas = ToEditorModel(elements, describeContext);
            return JToken.FromObject(canvas).ToString(Formatting.None);
        }

        public IEnumerable<IElement> ToLayoutModel(string editorData, DescribeElementsContext describeContext) {
            var emptyList = Enumerable.Empty<IElement>();

            if (String.IsNullOrWhiteSpace(editorData))
                return emptyList;

            var canvas = JToken.Parse(editorData);
            var children = (JArray)canvas["children"];
            var elements = children != null
                ? children.Select((x, i) => ParseEditorNode(node: x, parent: null, index: i, describeContext: describeContext)).Where(x => x != null).ToArray()
                : emptyList;

            return elements;
        }

        private IElement ParseEditorNode(JToken node, IContainer parent, int index, DescribeElementsContext describeContext) {
            var element = LoadElement(node, parent, index, describeContext);
            var childNodes = (JArray)node["children"];
            var container = element as IContainer;

            if (container != null)
                container.Elements = childNodes != null
                    ? childNodes.Select((x, i) => ParseEditorNode(x, container, i, describeContext)).Where(x => x != null).ToList()
                    : new List<IElement>();

            return element;
        }

        private IElement LoadElement(JToken node, IContainer parent, int index, DescribeElementsContext describeContext) {
            var type = (string)node["type"];
            var data = ElementDataHelper.Deserialize((string)node["data"]);
            var id = (string)node["id"];
            var cssClasses = (string)node["cssClasses"];
            var cssStyles = (string)node["cssStyles"];
            ElementDescriptor descriptor;
            IElement element;

            var activateArgs = new ActivateElementArgs {
                Data = data,
                Container = parent,
                Index = index
            };

            switch (type) {
                case "Grid":
                    descriptor = _elementManager.GetElementDescriptorByType<Grid>(describeContext);
                    element = _elementManager.ActivateElement<Grid>(descriptor, activateArgs);
                    break;
                case "Row":
                    descriptor = _elementManager.GetElementDescriptorByType<Row>(describeContext);
                    element = _elementManager.ActivateElement<Row>(descriptor, activateArgs);
                    break;
                case "Column":
                    descriptor = _elementManager.GetElementDescriptorByType<Column>(describeContext);
                    var column = _elementManager.ActivateElement<Column>(descriptor, activateArgs);
                    column.Width = (int?)node["width"];
                    column.Offset = (int?)node["offset"];
                    element = column;
                    break;
                case "Content":
                    var elementTypeName = (string)node["contentType"];
                    descriptor = _elementManager.GetElementDescriptorByTypeName(describeContext, elementTypeName);
                    element = _elementManager.ActivateElement(descriptor, activateArgs);
                    break;
                default:
                    // TODO: Make this extensible (e.g. Form and Fieldset elements).
                    throw new NotImplementedException();
            }

            new CommonElementSettings {
                Id = id,
                CssClass = cssClasses,
                InlineStyle = cssStyles
            }
            .Store(element.Data);

            return element;
        }

        private object ToEditorModel(IEnumerable<IElement> elements, DescribeElementsContext describeContext) {
            var canvas = new {
                type = "Canvas",
                data = default(string),
                id = default(string),
                cssClasses = default(string),
                cssStyles = default(string),
                children = elements.Select(x => ToEditorModel(x, describeContext)).ToList()
            };

            return canvas;
        }

        private object ToEditorModel(IElement element, DescribeElementsContext describeContext) {
            var data = element.Data.Serialize();
            var common = element.Data.GetModel<CommonElementSettings>();

            var grid = element as IGrid;
            if (grid != null) {
                return new {
                    type = "Grid",
                    data = data,
                    id = common.Id,
                    cssClasses = common.CssClass,
                    cssStyles = common.InlineStyle,
                    children = grid.Elements.Select(x => ToEditorModel(x, describeContext)).ToList()
                };
            }

            var row = element as IRow;
            if (row != null) {
                return new {
                    type = "Row",
                    data = data,
                    id = common.Id,
                    cssClasses = common.CssClass,
                    cssStyles = common.InlineStyle,
                    children = row.Elements.Select(x => ToEditorModel(x, describeContext)).ToList()
                };
            }

            var column = element as IColumn;
            if (column != null) {
                return new {
                    type = "Column",
                    data = data,
                    id = common.Id,
                    cssClasses = common.CssClass,
                    cssStyles = common.InlineStyle,
                    width = column.Width,
                    offset = column.Offset,
                    children = column.Elements.Select(x => ToEditorModel(x, describeContext)).ToList()
                };
            }

            return new {
                type = "Content",
                contentType = element.Type,
                data = data,
                id = common.Id,
                cssClasses = common.CssClass,
                cssStyles = common.InlineStyle,
                html = _shapeDisplay.Display(_elementDisplay.DisplayElement(element, content: describeContext.Content))
            };
        }
    }
}