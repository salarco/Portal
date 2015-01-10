using Orchard.Layouts.Framework.Elements;
using Orchard.Layouts.Helpers;

namespace Orchard.Layouts.Elements {
    public class Shape : Element {
        public override string Category {
            get { return "Snippets"; }
        }

        public string ShapeType {
            get { return this.Retrieve(x => x.ShapeType); }
            set { this.Store(x => x.ShapeType, value); }
        }
    }
}