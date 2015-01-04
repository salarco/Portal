using Orchard.Layouts.Framework.Elements;
using Orchard.Layouts.Helpers;

namespace Orchard.DynamicForms.Elements {
    public class Label : Element {
        public override string Category {
            get { return "Form"; }
        }

        public override bool HasEditor {
            get { return true; }
        }

        public string Text {
            get { return Data.Get("LabelText"); }
            set { Data["LabelText"] = value; }
        }

        public string For {
            get { return Data.Get("LabelFor"); }
            set { Data["LabelFor"] = value; }
        }
    }
}