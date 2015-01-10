using Orchard.Layouts.Helpers;

namespace Orchard.DynamicForms.Elements {
    public class Button : FormElement {

        public string Text {
            get { return this.Retrieve(x => x.Text, "Submit"); }
            set { this.Store(x => x.Text, value); }
        }
    }
}