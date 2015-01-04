using System;
using System.Collections.Generic;
using System.Web.Mvc;
using Orchard.ContentManagement;
using Orchard.Layouts.Framework.Elements;
using Orchard.Layouts.Framework.Serialization;
using Orchard.Layouts.Models;
using Orchard.Layouts.Services;
using Orchard.Mvc;

namespace Orchard.Layouts.Controllers {
    public class LayoutController : Controller {
        private readonly IContentManager _contentManager;
        private readonly ILayoutManager _layoutManager;
        private readonly ILayoutSerializer _serializer;

        public LayoutController(
            IContentManager contentManager,
            ILayoutManager layoutManager,
            ILayoutSerializer serializer) {

            _contentManager = contentManager;
            _layoutManager = layoutManager;
            _serializer = serializer;
        }

        [HttpPost]
        public ShapeResult ApplyTemplate(int? templateId = null, string layoutData = null, int? layoutId = null, string contentType = null) {
            var layoutPart = layoutId != null ? _layoutManager.GetLayout(layoutId.Value) ?? _contentManager.New<LayoutPart>(contentType) : _contentManager.New<LayoutPart>(contentType);

            if (!String.IsNullOrWhiteSpace(layoutData)) {
                layoutData = ApplyTemplateInternal(templateId, layoutData, layoutId, contentType);
            }

            var layoutShape = _layoutManager.RenderLayout(data: layoutData, displayType: "Design", content: layoutPart);
            return new ShapeResult(this, layoutShape);
        }

        private string ApplyTemplateInternal(int? templateId, string layoutData, int? layoutId = null, string contentType = null) {
            var template = templateId != null ? _layoutManager.GetLayout(templateId.Value) : null;
            var templateElements = template != null ? _layoutManager.LoadElements(template) : default(IEnumerable<IElement>);
            var describeContext = CreateDescribeElementsContext(layoutId, contentType);
            var elementInstances = _serializer.Deserialize(layoutData, describeContext);

            if (templateElements == null)
                return _layoutManager.DetachTemplate(elementInstances);
            return _layoutManager.ApplyTemplate(elementInstances, templateElements);
        }

        private DescribeElementsContext CreateDescribeElementsContext(int? contentId, string contentType) {
            var content = contentId != null && contentId != 0
                ? _contentManager.Get(contentId.Value, VersionOptions.Latest) ?? _contentManager.New(contentType)
                : _contentManager.New(contentType);

            return new DescribeElementsContext { Content = content };
        }
    }
}