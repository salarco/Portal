using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using Orchard.DisplayManagement;
using Orchard.Layouts.Elements;
using Orchard.Layouts.Framework.Display;
using Orchard.Layouts.Framework.Elements;
using Orchard.Layouts.Helpers;
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

        public object ToEditorModel(string layoutData, DescribeElementsContext describeContext) {
            var elements = _serializer.Deserialize(layoutData, describeContext);
            var canvas = ToEditorModelInternal(elements, describeContext);
            return canvas;
        }

        public object ToEditorModel(IEnumerable<IElement> elements, DescribeElementsContext describeContext) {
            var canvas = ToEditorModelInternal(elements, describeContext);
            return canvas;
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
            var htmlId = (string)node["htmlId"];
            var htmlClass = (string)node["htmlClass"];
            var htmlStyle = (string)node["htmlStyle"];
            var isTemplated = (bool)(node["isTemplated"]?? false);
            ElementDescriptor descriptor;
            IElement element;

            Action<IElement> initElement = e => {
                e.Data = data;
                e.Container = parent;
                e.Index = index;
                e.HtmlId = htmlId;
                e.HtmlClass = htmlClass;
                e.HtmlStyle = htmlStyle;
                e.IsTemplated = isTemplated;
            };

            switch (type) {
                case "Canvas":
                    descriptor = _elementManager.GetElementDescriptorByType<Canvas>(describeContext);
                    element = _elementManager.ActivateElement<Canvas>(descriptor, initElement);
                    break;
                case "Grid":
                    descriptor = _elementManager.GetElementDescriptorByType<Grid>(describeContext);
                    element = _elementManager.ActivateElement<Grid>(descriptor, initElement);
                    break;
                case "Row":
                    descriptor = _elementManager.GetElementDescriptorByType<Row>(describeContext);
                    element = _elementManager.ActivateElement<Row>(descriptor, initElement);
                    break;
                case "Column":
                    descriptor = _elementManager.GetElementDescriptorByType<Column>(describeContext);
                    var column = _elementManager.ActivateElement<Column>(descriptor, initElement);
                    column.Width = (int?)node["width"];
                    column.Offset = (int?)node["offset"];
                    element = column;
                    break;
                case "Content":
                    var elementTypeName = (string)node["contentType"];
                    descriptor = _elementManager.GetElementDescriptorByTypeName(describeContext, elementTypeName);
                    element = _elementManager.ActivateElement(descriptor, initElement);

                    // To support inline editing, we need to tell the element to update its content.
                    var contentElement = element as IContentElement;
                    if (contentElement != null) {
                        var html = (string)node["html"];
                        contentElement.Content = html;
                    }
                    break;
                default:
                    // TODO: Make this extensible (e.g. Form and Fieldset elements).
                    throw new NotImplementedException();
            }

            return element;
        }

        private object ToEditorModelInternal(IEnumerable<IElement> elements, DescribeElementsContext describeContext) {
            // Technically, a layout does not have to be part of a Canvas, but the editor requires a single root, starting with Canvas, so we make sure that it does.
            var elementsList = elements.ToArray();
            var canvas = elementsList.Any() && elementsList.First() is Canvas ? (Canvas)elementsList.First() : new Canvas { Elements = elementsList };
            var root = new {
                type = "Canvas",
                data = default(string),
                htmlId = canvas.HtmlId,
                htmlClass = canvas.HtmlClass,
                htmlStyle = canvas.HtmlStyle,
                isTemplated = canvas.IsTemplated,
                children = canvas.Elements.Select(x => ToEditorModelInternal(x, describeContext)).ToList()
            };

            return root;
        }

        private object ToEditorModelInternal(IElement element, DescribeElementsContext describeContext) {
            var data = element.Data.Serialize();
            var grid = element as IGrid;

            if (grid != null) {
                return new {
                    type = "Grid",
                    data = data,
                    htmlId = element.HtmlId,
                    htmlClass = element.HtmlClass,
                    htmlStyle = element.HtmlStyle,
                    isTemplated = element.IsTemplated,
                    children = grid.Elements.Select(x => ToEditorModelInternal(x, describeContext)).ToList()
                };
            }

            var row = element as IRow;
            if (row != null) {
                return new {
                    type = "Row",
                    data = data,
                    htmlId = element.HtmlId,
                    htmlClass = element.HtmlClass,
                    htmlStyle = element.HtmlStyle,
                    isTemplated = element.IsTemplated,
                    children = row.Elements.Select(x => ToEditorModelInternal(x, describeContext)).ToList()
                };
            }

            var column = element as IColumn;
            if (column != null) {
                return new {
                    type = "Column",
                    data = data,
                    htmlId = element.HtmlId,
                    htmlClass = element.HtmlClass,
                    htmlStyle = element.HtmlStyle,
                    isTemplated = element.IsTemplated,
                    width = column.Width,
                    offset = column.Offset,
                    children = column.Elements.Select(x => ToEditorModelInternal(x, describeContext)).ToList()
                };
            }

            return new {
                type = "Content",
                contentType = element.Descriptor.TypeName,
                contentTypeLabel = element.Descriptor.DisplayText.Text,
                contentTypeClass = String.Format(element.DisplayText.Text.HtmlClassify()),
                data = data,
                hasEditor = element.HasEditor,
                htmlId = element.HtmlId,
                htmlClass = element.HtmlClass,
                htmlStyle = element.HtmlStyle,
                isTemplated = element.IsTemplated,
                html = _shapeDisplay.Display(_elementDisplay.DisplayElement(element, content: describeContext.Content, displayType: "Design"))
            };
        }
    }
}