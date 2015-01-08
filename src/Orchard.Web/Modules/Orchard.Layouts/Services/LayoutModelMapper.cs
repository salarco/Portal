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
using Orchard.Utility.Extensions;

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
            if (String.IsNullOrWhiteSpace(editorData))
                yield break;

            var canvas = JToken.Parse(editorData);
            yield return ParseEditorNode(node: canvas, parent: null, index: 0, describeContext: describeContext);
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
                case "Canvas":
                    descriptor = _elementManager.GetElementDescriptorByType<Canvas>(describeContext);
                    element = _elementManager.ActivateElement<Canvas>(descriptor, activateArgs);
                    break;
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
            // Technically, a layout does not have to be part of a Canvas, but the editor requires a single root, starting with Canvas.
            var elementsList = elements.ToArray();
            var canvas = elementsList.Any() && elementsList.First() is Canvas ? (Canvas) elementsList.First() : default(Canvas);
            var children = canvas != null ? canvas.Elements : elementsList;
            var commonSettings = canvas != null ? canvas.Data.GetModel<CommonElementSettings>() : new CommonElementSettings();
            var root = new {
                type = "Canvas",
                data = default(string),
                id = commonSettings.Id,
                cssClasses = commonSettings.CssClass,
                cssStyles = commonSettings.InlineStyle,
                children = children.Select(x => ToEditorModel(x, describeContext)).ToList()
            };

            return root;
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
                contentType = element.Descriptor.TypeName,
                contentTypeLabel = element.DisplayText.Text,
                contentTypeClass = String.Format("layout-content-{0}", element.DisplayText.Text.HtmlClassify()),
                data = data,
                id = common.Id,
                cssClasses = common.CssClass,
                cssStyles = common.InlineStyle,
                html = _shapeDisplay.Display(_elementDisplay.DisplayElement(element, content: describeContext.Content, displayType: "Design"))
            };
        }
    }
}