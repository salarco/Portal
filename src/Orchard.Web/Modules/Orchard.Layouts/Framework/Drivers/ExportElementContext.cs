using Orchard.Layouts.Framework.Elements;
using Orchard.Layouts.Models;

namespace Orchard.Layouts.Framework.Drivers {
    public class ExportElementContext {
        public ExportElementContext() {
            ExportableData = new ElementDataDictionary();
        }

        public ILayoutAspect Layout { get; set; }
        public IElement Element { get; set; }
        public ElementDataDictionary ExportableData { get; set; }
    }
}