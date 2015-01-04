using Orchard.Layouts.Helpers;

namespace Orchard.DynamicForms.Elements {
    public class Button : FormElement {
        public override bool HasEditor {
            get { return true; }
        }

        public string Text {
            get { return Data.Get("ButtonText", "Submit"); }
            set { Data["ButtonText"] = value; }
        }
    }
}