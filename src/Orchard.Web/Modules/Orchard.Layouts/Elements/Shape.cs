using Orchard.Layouts.Framework.Elements;
using Orchard.Layouts.Helpers;

namespace Orchard.Layouts.Elements {
    public class Shape : Element {
        public override string Category {
            get { return "Snippets"; }
        }

        public string ShapeType {
            get { return Data.Get("ShapeType"); }
            set { Data["ShapeType"] = value; }
        }

        public override bool HasEditor {
            get { return true; }
        }
    }
}