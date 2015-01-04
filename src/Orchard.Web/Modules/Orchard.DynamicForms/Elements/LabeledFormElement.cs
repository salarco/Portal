using Orchard.Layouts.Helpers;

namespace Orchard.DynamicForms.Elements {
    public abstract class LabeledFormElement : FormElement {
        public string Label {
            get { return Data.Get("Label"); }
            set { Data["Label"] = value; }
        }

        public bool ShowLabel {
            get { return Data.Get("ShowLabel").ToBoolean().GetValueOrDefault(); }
            set { Data["ShowLabel"] = value.ToString(); }
        }
    }
}